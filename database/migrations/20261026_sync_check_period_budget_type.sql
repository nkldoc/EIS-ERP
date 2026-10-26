USE [NMU_ERP];
GO

-- The checking detail is the source of truth for the entire contract period.
-- Conflicting source values in a single statement must never pick an arbitrary winner.
CREATE OR ALTER TRIGGER dbo.trg_sp_check_period_dtl_sync_budget_type
ON dbo.sp_check_period_dtl
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF TRIGGER_NESTLEVEL(OBJECT_ID(N'dbo.trg_sp_check_period_dtl_sync_budget_type')) > 1
        RETURN;

    IF NOT UPDATE(dc_bg_budget_type_id) AND NOT UPDATE(sp_tor_hdr_period_id)
        RETURN;

    DECLARE @source TABLE (
        sp_tor_hdr_period_id INT NOT NULL,
        dc_bg_budget_type_id INT NULL
    );

    INSERT INTO @source (sp_tor_hdr_period_id, dc_bg_budget_type_id)
    SELECT DISTINCT sp_tor_hdr_period_id, dc_bg_budget_type_id
    FROM inserted
    WHERE sp_tor_hdr_period_id IS NOT NULL;

    IF EXISTS (
        SELECT sp_tor_hdr_period_id
        FROM @source
        GROUP BY sp_tor_hdr_period_id
        HAVING COUNT(*) > 1
    )
    BEGIN
        THROW 51001, 'Conflicting budget types for the same contract period in one statement.', 1;
    END;

    UPDATE h
    SET dc_expense_budget_type_id = s.dc_bg_budget_type_id
    FROM dbo.sp_tor_hdr_period AS h
    INNER JOIN @source AS s ON s.sp_tor_hdr_period_id = h.sp_tor_hdr_period_id
    WHERE h.dc_expense_budget_type_id <> s.dc_bg_budget_type_id
       OR (h.dc_expense_budget_type_id IS NULL AND s.dc_bg_budget_type_id IS NOT NULL)
       OR (h.dc_expense_budget_type_id IS NOT NULL AND s.dc_bg_budget_type_id IS NULL);

    UPDATE d
    SET dc_bg_budget_type_id = s.dc_bg_budget_type_id
    FROM dbo.sp_tor_dtl_period AS d
    INNER JOIN @source AS s ON s.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
    WHERE d.dc_bg_budget_type_id <> s.dc_bg_budget_type_id
       OR (d.dc_bg_budget_type_id IS NULL AND s.dc_bg_budget_type_id IS NOT NULL)
       OR (d.dc_bg_budget_type_id IS NOT NULL AND s.dc_bg_budget_type_id IS NULL);

    UPDATE d
    SET dc_bg_budget_type_id = s.dc_bg_budget_type_id
    FROM dbo.sp_check_period_dtl AS d
    INNER JOIN @source AS s ON s.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
    WHERE d.dc_bg_budget_type_id <> s.dc_bg_budget_type_id
       OR (d.dc_bg_budget_type_id IS NULL AND s.dc_bg_budget_type_id IS NOT NULL)
       OR (d.dc_bg_budget_type_id IS NOT NULL AND s.dc_bg_budget_type_id IS NULL);
END;
GO

-- Reapply the existing checking value to repair the reported period.
-- The trigger validates conflicting source values before updating related rows.
UPDATE dbo.sp_check_period_dtl
SET dc_bg_budget_type_id = dc_bg_budget_type_id
WHERE sp_tor_hdr_period_id = 7636;
GO
