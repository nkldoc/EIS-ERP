/* Allow half-month warranty periods entered by the receiving form. */
IF EXISTS (
    SELECT 1
    FROM sys.columns
    WHERE object_id = OBJECT_ID(N'dbo.sp_check_period_hdr')
      AND name = N'i_warranty_age'
      AND (
          system_type_id <> TYPE_ID(N'decimal')
          OR precision <> 10
          OR scale <> 1
      )
)
BEGIN
    ALTER TABLE dbo.sp_check_period_hdr
        ALTER COLUMN i_warranty_age DECIMAL(10, 1) NULL;
END;
