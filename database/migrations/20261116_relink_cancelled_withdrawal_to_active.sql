USE [NMU_ERP];
GO

/*
    Repair sp_check_period_hdr rows that still reference a cancelled withdrawal.

    A replacement withdrawal is identified from either:
      1. po_working_begin_hdr.chk_id, or
      2. the replacement chain in po_working_hdr.parent_id.

    The newest D document whose po_working_hdr.i_enable = 1 is used.

    This script is idempotent: rows already linked to an active withdrawal are
    not changed.
*/
SET NOCOUNT ON;
SET XACT_ABORT ON;

IF OBJECT_ID('tempdb..#withdrawal_relink') IS NOT NULL
    DROP TABLE #withdrawal_relink;

;WITH withdrawal_chain AS
(
    SELECT
        check_hdr.sp_check_period_hdr_id,
        check_hdr.po_working_hdr_id,
        CAST(0 AS INT) AS chain_level
    FROM dbo.sp_check_period_hdr AS check_hdr
    WHERE check_hdr.po_working_hdr_id IS NOT NULL

    UNION ALL

    SELECT
        chain.sp_check_period_hdr_id,
        child.po_working_hdr_id,
        chain.chain_level + 1
    FROM withdrawal_chain AS chain
    INNER JOIN NMU_EIS.dbo.po_working_hdr AS child
        ON child.parent_id = chain.po_working_hdr_id
    WHERE chain.chain_level < 100
),
active_candidate AS
(
    -- Normal link from a withdrawal back to its checking record.
    SELECT
        b.chk_id AS sp_check_period_hdr_id,
        h.po_working_hdr_id,
        h.c_code_ref AS withdrawal_code
    FROM NMU_EIS.dbo.po_working_begin_hdr AS b
    INNER JOIN NMU_EIS.dbo.po_working_hdr AS h
        ON h.po_working_hdr_id = b.po_working_hdr_id
       AND h.i_enable = 1
    WHERE b.chk_id IS NOT NULL
      AND UPPER(LTRIM(RTRIM(h.c_code_ref))) LIKE 'D%'

    UNION

    -- Replacement documents displayed in "สถานะใบขอเบิกเดิม" use parent_id.
    SELECT
        chain.sp_check_period_hdr_id,
        h.po_working_hdr_id,
        h.c_code_ref AS withdrawal_code
    FROM withdrawal_chain AS chain
    INNER JOIN NMU_EIS.dbo.po_working_hdr AS h
        ON h.po_working_hdr_id = chain.po_working_hdr_id
       AND h.i_enable = 1
    WHERE UPPER(LTRIM(RTRIM(h.c_code_ref))) LIKE 'D%'
),
active_withdrawal AS
(
    SELECT
        candidate.sp_check_period_hdr_id,
        candidate.po_working_hdr_id,
        candidate.withdrawal_code,
        ROW_NUMBER() OVER
        (
            PARTITION BY candidate.sp_check_period_hdr_id
            ORDER BY candidate.po_working_hdr_id DESC
        ) AS row_no
    FROM active_candidate AS candidate
)
SELECT
    check_hdr.sp_check_period_hdr_id,
    check_hdr.po_working_hdr_id AS cancelled_po_working_hdr_id,
    cancelled.c_code_ref AS cancelled_withdrawal_code,
    active.po_working_hdr_id AS active_po_working_hdr_id,
    active.withdrawal_code AS active_withdrawal_code
INTO #withdrawal_relink
FROM dbo.sp_check_period_hdr AS check_hdr
LEFT JOIN NMU_EIS.dbo.po_working_hdr AS cancelled
    ON cancelled.po_working_hdr_id = check_hdr.po_working_hdr_id
INNER JOIN active_withdrawal AS active
    ON active.sp_check_period_hdr_id = check_hdr.sp_check_period_hdr_id
   AND active.row_no = 1
WHERE
    (
        cancelled.po_working_hdr_id IS NULL
        OR cancelled.i_enable <> 1
        OR cancelled.i_enable IS NULL
    )
    AND ISNULL(check_hdr.po_working_hdr_id, 0) <> active.po_working_hdr_id
OPTION (MAXRECURSION 100);

-- Preview the exact old/new ids that will be changed.
SELECT
    sp_check_period_hdr_id,
    cancelled_po_working_hdr_id,
    cancelled_withdrawal_code,
    active_po_working_hdr_id,
    active_withdrawal_code
FROM #withdrawal_relink
ORDER BY sp_check_period_hdr_id;

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE check_hdr
    SET check_hdr.po_working_hdr_id = relink.active_po_working_hdr_id
    OUTPUT
        inserted.sp_check_period_hdr_id,
        deleted.po_working_hdr_id AS old_po_working_hdr_id,
        relink.cancelled_withdrawal_code AS old_withdrawal_code,
        inserted.po_working_hdr_id AS new_po_working_hdr_id,
        relink.active_withdrawal_code AS new_withdrawal_code
    FROM dbo.sp_check_period_hdr AS check_hdr
    INNER JOIN #withdrawal_relink AS relink
        ON relink.sp_check_period_hdr_id = check_hdr.sp_check_period_hdr_id
    -- Protect against a concurrent/user update after the preview was built.
    WHERE ISNULL(check_hdr.po_working_hdr_id, 0)
        = ISNULL(relink.cancelled_po_working_hdr_id, 0);

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;

    THROW;
END CATCH;

DROP TABLE #withdrawal_relink;
GO
