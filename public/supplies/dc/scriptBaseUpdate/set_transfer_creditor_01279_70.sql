-- สัญญา 01279/70: ตั้ง "โดยมอบให้" = น.ส. น้ำทิพย์ เอี่ยมรักษา (ผู้รับเงิน, บัญชีกรุงไทย 0121548627) ทุกงวดที่ยังไม่ได้ออกใบเบิก
-- ผู้รับเงินระบุด้วยเลขบัญชี (ไม่พึ่งการจับชื่อภาษาไทย) ต้องรัน sp_tor_period_bill_creditor_transfer.sql ก่อน
-- @apply: 0 = ดูตัวอย่าง / 1 = แก้จริง
SET NOCOUNT ON;
DECLARE @apply INT = 0;
DECLARE @contract NVARCHAR(50) = N'01279/70';
DECLARE @bankNo NVARCHAR(30) = N'0121548627';

DECLARE @payee INT = (SELECT TOP 1 ba.dc_creditor_id FROM NMU.dbo.dc_bank_acc_creditor ba
                      WHERE ba.c_code = @bankNo AND ba.i_enable = 1 AND ba.i_delete = 2 ORDER BY ba.i_main DESC);
PRINT N'--- ผู้รับเงิน (เจ้าของบัญชี ' + @bankNo + N') ---';
SELECT c.dc_creditor_id, c.c_name, c.c_tax_number_imp, c.i_enable FROM NMU.dbo.dc_creditor c WHERE c.dc_creditor_id = @payee;
PRINT N'--- งวดของสัญญา ---';
SELECT b.sp_tor_period_bill_id, b.c_contract_code, b.i_period, b.c_creditor_name, b.dc_creditor_transfer_id, b.f_period_amt
FROM NMU_ERP.dbo.sp_tor_period_bill b WHERE b.c_contract_code = @contract AND b.i_enabled = 1;
IF @apply = 1
BEGIN
    IF @payee IS NULL BEGIN PRINT N'ไม่พบเจ้าของบัญชี ' + @bankNo + N' - ไม่แก้'; RETURN; END
    UPDATE NMU_ERP.dbo.sp_tor_period_bill SET dc_creditor_transfer_id = @payee WHERE c_contract_code = @contract AND i_enabled = 1;
    PRINT N'แก้แล้ว ' + CONVERT(NVARCHAR(10), @@ROWCOUNT) + N' งวด';
END
