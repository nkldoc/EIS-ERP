BEGIN TRANSACTION;
GO
USE [NMU_EIS];
GO

-- Expense/service lines select the expense account even when the period's
-- last-delivery type is material or asset. Preserve other existing branches.
DECLARE @definition NVARCHAR(MAX) = OBJECT_DEFINITION(OBJECT_ID(N'dbo.vw_ap_type0_dtl'));
DECLARE @old1 NVARCHAR(MAX) = N'case isnull(h.i_is_product_last,0)';
DECLARE @old2 NVARCHAR(MAX) = N'case isnull(i_is_product_last,0)';
DECLARE @new NVARCHAR(MAX) = N'case (case when ed.i_product_type = 0 then 0 else isnull(h.i_is_product_last,0) end)';

IF @definition IS NULL
    THROW 51020, 'Cannot read dbo.vw_ap_type0_dtl definition.', 1;

-- Restrict replacements to the debit-account CASE expressions. The view also
-- uses similar expressions to display the period product type.
DECLARE @marker NVARCHAR(MAX) = N'(select top 1 cc.dc_acc_id';
DECLARE @pos INT = 1, @casePos INT, @markerPos INT, @count INT = 0, @old NVARCHAR(MAX);
WHILE 1 = 1
BEGIN
    SET @markerPos = CHARINDEX(@marker, @definition, @pos);
    IF @markerPos = 0 BREAK;
    SET @casePos = CHARINDEX(@old1, @definition, @pos);
    SET @old = @old1;
    IF @casePos = 0 OR @casePos > @markerPos OR @markerPos - @casePos > 100
    BEGIN
        SET @casePos = CHARINDEX(@old2, @definition, @pos);
        SET @old = @old2;
    END;
    IF @casePos = 0 OR @casePos > @markerPos OR @markerPos - @casePos > 100
        THROW 51021, 'Unrecognized debit account expression; inspect the view.', 1;
    SET @definition = STUFF(@definition, @casePos, LEN(@old), @new);
    SET @pos = @markerPos + LEN(@new) - LEN(@old) + LEN(@marker);
    SET @count += 1;
END;

IF @count <> 2
    THROW 51022, 'Expected two debit account expressions; inspect the view.', 1;

SET @definition = N'ALTER ' + SUBSTRING(@definition, CHARINDEX(N'VIEW', UPPER(@definition)), LEN(@definition));
EXEC sys.sp_executesql @definition;
GO

SELECT sp_check_period_hdr_id,system_type,i_is_product_last,dc_acc_dr_id,dc_acc_cr_id,f_net_total_price FROM NMU_EIS.dbo.vw_ap_type0_dtl WHERE sp_check_period_hdr_id=6520 AND system_type=1;
ROLLBACK TRANSACTION;
GO
