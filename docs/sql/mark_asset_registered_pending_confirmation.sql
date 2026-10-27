USE [NMU_ERP];
SET NOCOUNT ON;
SET XACT_ABORT ON;

-- 1. List waiting items using the same conditions as checking.js / status 10.
SELECT
    h.sp_check_period_hdr_id,
    h.c_checking_code,
    h.c_arrive_code,
    h.i_register,
    h.i_is_register,
    (SELECT COUNT(*) FROM NMU_ASSET.dbo.imp_assetall_supplies_hdr a
     WHERE a.sp_check_period_hdr_id = h.sp_check_period_hdr_id
       AND a.i_enable = 1) AS active_asset_import_headers,
    (SELECT COUNT(*)
     FROM NMU_ASSET.dbo.imp_assetall_supplies_hdr a
     INNER JOIN NMU_ASSET.dbo.imp_assetall_supplies_dtl d
       ON d.imp_assetall_supplies_hdr_id = a.imp_assetall_supplies_hdr_id
     WHERE a.sp_check_period_hdr_id = h.sp_check_period_hdr_id
       AND a.i_enable = 1) AS asset_import_details
FROM dbo.sp_check_period_hdr h
WHERE h.i_enabled = 1
  AND h.c_arrive_code IS NOT NULL
  AND ISNULL(h.i_register, 0) = 0
  AND h.c_checking_code IS NOT NULL
  AND EXISTS (
      SELECT 1 FROM dbo.sp_check_period_dtl d
      WHERE d.sp_check_period_hdr_id = h.sp_check_period_hdr_id
        AND d.i_product_type = 2
  )
  AND EXISTS (
      SELECT 1
      FROM dbo.sp_tor_hdr_period p
      INNER JOIN dbo.sp_tor_contract c
        ON c.sp_tor_contract_id = p.sp_tor_contract_id
      WHERE p.sp_tor_hdr_period_id = h.sp_tor_hdr_period_id
        AND ISNULL(c.dc_expense_budget_type2_id, 0) = 0
        AND ISNULL(c.dc_expense_budget_type3_id, 0) = 0
        AND p.i_enabled = 1 AND c.i_enabled = 1 AND p.i_is_last = 1
      GROUP BY p.sp_tor_contract_id, p.sp_tor_hdr_period_id
      HAVING COUNT(*) = 1
  )
ORDER BY h.sp_check_period_hdr_id DESC;

-- 2. Choose ONE item from the result above.
-- @Apply = 0 previews only. Set to 1 after verifying actual asset registration.
DECLARE @CheckId bigint = NULL;       -- sp_check_period_hdr_id
DECLARE @UserId int = NULL;           -- actual dc_user id
DECLARE @UserCostId int = NULL;       -- actual user dc_cost_id
DECLARE @Apply bit = 0;

IF @CheckId IS NULL
BEGIN
    PRINT 'Set @CheckId to inspect an item; no data was changed.';
    RETURN;
END;

-- Inspect receiving data and linked asset import data.
SELECT * FROM dbo.sp_check_period_hdr WHERE sp_check_period_hdr_id = @CheckId;
SELECT * FROM dbo.sp_check_period_dtl WHERE sp_check_period_hdr_id = @CheckId;
SELECT * FROM NMU_ASSET.dbo.imp_assetall_supplies_hdr
WHERE sp_check_period_hdr_id = @CheckId;
SELECT d.*
FROM NMU_ASSET.dbo.imp_assetall_supplies_dtl d
INNER JOIN NMU_ASSET.dbo.imp_assetall_supplies_hdr a
  ON a.imp_assetall_supplies_hdr_id = d.imp_assetall_supplies_hdr_id
WHERE a.sp_check_period_hdr_id = @CheckId AND a.i_enable = 1;

-- Import rows alone do NOT prove completion of actual asset registration.
-- This script repairs the receiving status only; it creates no assets.
IF @Apply = 0
BEGIN
    PRINT 'Preview only. Verify asset registration, then set @Apply = 1.';
    RETURN;
END;

IF @UserId IS NULL OR @UserCostId IS NULL
    THROW 50001, 'Set @UserId and @UserCostId for the audit fields.', 1;

BEGIN TRY
    BEGIN TRANSACTION;

    UPDATE h
    SET i_register = 2,
        dc_user_update_id = @UserId,
        dc_user_update_cost_id = @UserCostId,
        d_update = GETDATE()
    OUTPUT inserted.sp_check_period_hdr_id, inserted.c_checking_code,
           deleted.i_register AS old_i_register,
           inserted.i_register AS new_i_register,
           inserted.i_is_register, inserted.d_update
    FROM dbo.sp_check_period_hdr h
    WHERE h.sp_check_period_hdr_id = @CheckId
      AND h.i_enabled = 1
      AND h.c_arrive_code IS NOT NULL
      AND ISNULL(h.i_register, 0) = 0
      AND h.c_checking_code IS NOT NULL
      AND EXISTS (
          SELECT 1 FROM dbo.sp_check_period_dtl d
          WHERE d.sp_check_period_hdr_id = h.sp_check_period_hdr_id
            AND d.i_product_type = 2
      )
      AND EXISTS (
          SELECT 1
          FROM dbo.sp_tor_hdr_period p
          INNER JOIN dbo.sp_tor_contract c
            ON c.sp_tor_contract_id = p.sp_tor_contract_id
          WHERE p.sp_tor_hdr_period_id = h.sp_tor_hdr_period_id
            AND ISNULL(c.dc_expense_budget_type2_id, 0) = 0
            AND ISNULL(c.dc_expense_budget_type3_id, 0) = 0
            AND p.i_enabled = 1 AND c.i_enabled = 1 AND p.i_is_last = 1
          GROUP BY p.sp_tor_contract_id, p.sp_tor_hdr_period_id
          HAVING COUNT(*) = 1
      )
      AND EXISTS (
          SELECT 1
          FROM NMU_ASSET.dbo.imp_assetall_supplies_hdr a
          INNER JOIN NMU_ASSET.dbo.imp_assetall_supplies_dtl d
            ON d.imp_assetall_supplies_hdr_id = a.imp_assetall_supplies_hdr_id
          WHERE a.sp_check_period_hdr_id = h.sp_check_period_hdr_id
            AND a.i_enable = 1
      );

    IF @@ROWCOUNT <> 1
        THROW 50002, 'Not updated: item is not waiting, not eligible, or has no linked asset import details.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

