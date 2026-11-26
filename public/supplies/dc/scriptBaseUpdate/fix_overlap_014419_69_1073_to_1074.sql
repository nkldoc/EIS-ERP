-- แก้เลขใบกันเหลื่อมของรายการรับของเวชภัณฑ์/เภสัช สัญญา 014419/69 จาก 69-102-03-1-1073 -> 69-102-03-1-1074
-- (ใช้หน้า ST00095 ปุ่ม "แก้เลขใบกัน" แทนได้เมื่อ deploy โค้ดแล้ว - สคริปต์นี้สำหรับแก้ให้ทันที)
-- แก้ที่: sp_tor_period_bill (c_overlap/i_budget_year_overlap) + sp_tor_period_bill_checking.c_overlap_no ของ IR ที่ผูกอยู่
-- ตรวจก่อนแก้: ใบกันใหม่ต้องมีในระบบงบ แหล่งเงินตรงกับใบกันเดิม ยอดคงเหลือพอ และใบเบิก D (ถ้ามี) ต้องไม่เลยขั้น 0.30
--   (ยกเว้นถูกทักท้วงฏีกา 3.00 แก้ได้)
-- สำรองแถวเดิมไว้ที่ NMU_ERP.dbo.bak_overlap_014419_<วันที่_เวลา> ; @apply = 0 = ดูตัวอย่าง / 1 = แก้จริง
SET NOCOUNT ON; SET XACT_ABORT ON; SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; SET ANSI_WARNINGS ON;
DECLARE @apply INT = 0;
DECLARE @code NVARCHAR(50) = N'014419/69', @old NVARCHAR(50) = N'69-102-03-1-1073', @new NVARCHAR(50) = N'69-102-03-1-1074';

PRINT N'--- งวดที่ใช้เลขเดิม ---';
SELECT b.sp_tor_period_bill_id, b.c_contract_code, b.i_period, b.c_ap_dept_type, b.c_overlap, b.i_budget_year_overlap, b.f_period_amt
FROM NMU_ERP.dbo.sp_tor_period_bill b WHERE b.i_enabled = 1 AND b.c_contract_code = @code AND b.c_overlap = @old;

PRINT N'--- ใบเบิก D ที่เกี่ยวข้อง ---';
SELECT DISTINCT h.c_code_ref, h.i_status_last, CONVERT(VARCHAR(8), h.i_sub_status) AS sub_status
FROM NMU_ERP.dbo.sp_tor_period_bill b
JOIN NMU_ERP.dbo.sp_tor_period_bill_receive r ON r.sp_tor_period_bill_id = b.sp_tor_period_bill_id AND r.i_enabled = 1
JOIN NMU_ERP.dbo.sp_tor_period_bill_checking c ON c.c_ir_code = r.c_ir_code AND c.i_enabled = 1 AND ISNULL(c.c_code_ref, '') <> ''
JOIN NMU_EIS.dbo.po_working_hdr h ON h.c_code_ref = c.c_code_ref
WHERE b.i_enabled = 1 AND b.c_contract_code = @code AND b.c_overlap = @old;

DECLARE @n INT = (SELECT COUNT(*) FROM NMU_ERP.dbo.sp_tor_period_bill WHERE i_enabled = 1 AND c_contract_code = @code AND c_overlap = @old);
IF @n = 0 BEGIN PRINT N'ไม่พบงวดของสัญญา 014419/69 ที่ใช้เลข 1073 - ไม่แก้'; RETURN; END

DECLARE @amt DECIMAL(18,2) = (SELECT SUM(f_period_amt) FROM NMU_ERP.dbo.sp_tor_period_bill WHERE i_enabled = 1 AND c_contract_code = @code AND c_overlap = @old);
DECLARE @newYear INT, @newFund INT, @newRemain DECIMAL(18,2), @oldFund INT;
SELECT TOP 1 @newYear = i_year, @newFund = dc_expense_budget_type_id, @newRemain = f_total
FROM NMU_EIS.dbo.vw_bg_budget_overlap WHERE c_code_ref = @new ORDER BY i_year DESC;
SELECT TOP 1 @oldFund = dc_expense_budget_type_id FROM NMU_EIS.dbo.vw_bg_budget_overlap WHERE c_code_ref = @old ORDER BY i_year DESC;
PRINT N'ยอดงวดที่ย้าย = ' + CONVERT(NVARCHAR(30), @amt) + N' / คงเหลือใบกันใหม่ = ' + ISNULL(CONVERT(NVARCHAR(30), @newRemain), N'ไม่พบ');
IF @newYear IS NULL BEGIN PRINT N'ไม่พบใบกัน 1074 ในระบบงบ - ไม่แก้'; RETURN; END
IF @oldFund IS NOT NULL AND @oldFund <> @newFund BEGIN PRINT N'แหล่งเงินของใบกันใหม่ไม่ตรงกับใบกันเดิม - ไม่แก้'; RETURN; END
IF @amt > @newRemain BEGIN PRINT N'ยอดคงเหลือของใบกันใหม่ไม่พอ - ไม่แก้'; RETURN; END

IF EXISTS (
    SELECT 1
    FROM NMU_ERP.dbo.sp_tor_period_bill b
    JOIN NMU_ERP.dbo.sp_tor_period_bill_receive r ON r.sp_tor_period_bill_id = b.sp_tor_period_bill_id AND r.i_enabled = 1
    JOIN NMU_ERP.dbo.sp_tor_period_bill_checking c ON c.c_ir_code = r.c_ir_code AND c.i_enabled = 1 AND ISNULL(c.c_code_ref, '') <> ''
    JOIN NMU_EIS.dbo.po_working_hdr h ON h.c_code_ref = c.c_code_ref
    WHERE b.i_enabled = 1 AND b.c_contract_code = @code AND b.c_overlap = @old
      AND NOT ((h.i_status_last = 0 AND h.i_sub_status <= 0.30) OR (h.i_status_last = 3 AND h.i_sub_status = 3.00))
)
BEGIN PRINT N'มีใบเบิก D ที่ส่งเรื่องเลยขั้น 0.40 แล้ว - ไม่แก้ (ต้องให้ผู้ดูแลย้อนใบเบิกก่อน)'; RETURN; END

IF @apply = 1
BEGIN
    DECLARE @bak SYSNAME = N'bak_overlap_014419_' + CONVERT(VARCHAR(8), GETDATE(), 112) + '_' + REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '');
    DECLARE @sql NVARCHAR(MAX) = N'SELECT * INTO NMU_ERP.dbo.' + QUOTENAME(@bak) + N' FROM NMU_ERP.dbo.sp_tor_period_bill WHERE i_enabled = 1 AND c_contract_code = N''' + @code + N''' AND c_overlap = N''' + @old + N'''';
    BEGIN TRAN;
    EXEC (@sql);
    UPDATE NMU_ERP.dbo.sp_tor_period_bill SET c_overlap = @new, i_budget_year_overlap = @newYear, d_update = GETDATE()
    WHERE i_enabled = 1 AND c_contract_code = @code AND c_overlap = @old;
    UPDATE c SET c.c_overlap_no = @new, c.d_update = GETDATE()
    FROM NMU_ERP.dbo.sp_tor_period_bill_checking c
    WHERE c.c_overlap_no = @old
      AND c.c_ir_code IN (SELECT r.c_ir_code FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
                          JOIN NMU_ERP.dbo.sp_tor_period_bill b ON b.sp_tor_period_bill_id = r.sp_tor_period_bill_id
                          WHERE r.i_enabled = 1 AND b.c_contract_code = @code AND b.c_overlap = @new);
    COMMIT;
    PRINT N'สำรองไว้ที่ NMU_ERP.dbo.' + @bak;
    PRINT N'--- หลังแก้ ---';
    SELECT b.sp_tor_period_bill_id, b.c_contract_code, b.i_period, b.c_overlap, b.i_budget_year_overlap
    FROM NMU_ERP.dbo.sp_tor_period_bill b WHERE b.i_enabled = 1 AND b.c_contract_code = @code;
END
