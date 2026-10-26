USE [NMU_EIS];
GO

-- Preserve the rest of the deployed view while correcting both UNION branches.
DECLARE @definition NVARCHAR(MAX) = OBJECT_DEFINITION(OBJECT_ID(N'dbo.vw_ap_type0_hdr'));
DECLARE @old NVARCHAR(MAX) = N'(select  top 1 c_name from NMU_DATACENTER.dbo.dc_expense_budget_type where  dc_bg_budget_type_id = ed.dc_bg_budget_type_id ) as c_bg_budget';
DECLARE @new NVARCHAR(MAX) = N'(select top 1 bt.c_name from NMU_DATACENTER.dbo.dc_expense_budget_type AS bt where bt.dc_expense_budget_type_id = ed.dc_bg_budget_type_id) as c_bg_budget';

IF @definition IS NULL
    THROW 51010, 'Cannot read dbo.vw_ap_type0_hdr definition.', 1;

IF CHARINDEX(@old, @definition) > 0
BEGIN
    IF (LEN(@definition) - LEN(REPLACE(@definition, @old, N''))) / LEN(@old) <> 2
        THROW 51011, 'Expected exactly two budget name expressions; inspect the view before applying.', 1;

    SET @definition = REPLACE(@definition, @old, @new);
    SET @definition = N'ALTER ' + SUBSTRING(@definition, CHARINDEX(N'VIEW', UPPER(@definition)), LEN(@definition));
    EXEC sys.sp_executesql @definition;
END
ELSE IF (LEN(@definition) - LEN(REPLACE(@definition, @new, N''))) / LEN(@new) <> 2
    THROW 51012, 'Unrecognized budget name expression; inspect the view before applying.', 1;
GO
