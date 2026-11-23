-- แก้แหล่งเงินของใบตรวจรับ 03AP70100109/03 (IR20261000202, sp_check_period_hdr_id 6905, สัญญา จ.014138/2569)
-- จาก เงินรายได้คณะแพทย์ฯ-โรงพยาบาล (id 2) -> เงินรายได้ส่วนงาน (id 49) ให้ตรงกับโครงการ (sp_tor 4077) และการจองเงิน 4690 ที่เป็นแหล่ง 49
-- หน้า "แหล่งเงิน *" ของฟอร์มตรวจรับอ่านจาก sp_check_period_dtl.dc_bg_budget_type_id (และ sp_tor_dtl_period) - เป็น 2 ทั้งคู่
-- สคริปต์นี้ทำเหมือนที่ปุ่มแก้แหล่งเงินในหน้าแก้ไขข้อมูลทำ (mnCheckingController.php updateBookingType) แต่ระบุงวดตรงๆ
-- ใบเบิก D0370000439 ยกเลิกแล้ว (status 4) ไม่แตะ - ใบเบิกใหม่ที่ออกจากใบตรวจรับนี้จะได้แหล่ง 49 ตามที่แก้
-- รันซ้ำได้ @apply = 0 = ดูตัวอย่างอย่างเดียว / 1 = แก้จริง (สำรองแถวเดิมไว้ที่ NMU_ERP.dbo.bak_fund_6905_<วันที่_เวลา>_dtl / _period)
SET NOCOUNT ON; SET XACT_ABORT ON;
DECLARE @apply INT = 0;
DECLARE @chkId INT = 6905, @periodId INT = 5890, @newFund INT = 49, @oldFund INT = 2;

PRINT N'--- ก่อนแก้ ---';
SELECT 'check_dtl' AS k, d.sp_check_period_dtl_id AS id, d.sp_check_period_hdr_id, d.sp_tor_hdr_period_id, d.dc_bg_budget_type_id AS fund
FROM NMU_ERP.dbo.sp_check_period_dtl d WHERE d.sp_check_period_hdr_id = @chkId AND d.sp_tor_hdr_period_id = @periodId
UNION ALL
SELECT 'tor_dtl_period', p.sp_tor_dtl_period_id, NULL, p.sp_tor_hdr_period_id, p.dc_bg_budget_type_id
FROM NMU_ERP.dbo.sp_tor_dtl_period p WHERE p.sp_tor_hdr_period_id = @periodId;

PRINT N'--- ใบเบิกที่ใช้งานอยู่ของใบตรวจรับนี้ (ควรว่าง - D0370000439 ยกเลิกแล้ว) ---';
SELECT h.c_code_ref, h.i_status_last, h.i_enable FROM NMU_EIS.dbo.po_working_hdr h
WHERE h.c_code_ref = N'D0370000439' AND h.i_enable = 1 AND h.i_status_last <> 4;

-- ตรวจเงื่อนไข: ต้องมีแถวที่เป็นแหล่งเดิม (2) และไม่มีใบเบิกที่ยังใช้งานอยู่
IF NOT EXISTS (SELECT 1 FROM NMU_ERP.dbo.sp_check_period_dtl WHERE sp_check_period_hdr_id = @chkId AND sp_tor_hdr_period_id = @periodId AND dc_bg_budget_type_id = @oldFund)
BEGIN PRINT N'ไม่พบแถวที่เป็นแหล่งเดิม (อาจแก้ไปแล้ว) - ไม่ทำอะไร'; RETURN; END
IF EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_hdr WHERE c_code_ref = N'D0370000439' AND i_enable = 1 AND i_status_last <> 4)
BEGIN PRINT N'ใบเบิก D0370000439 ยังใช้งานอยู่ - ไม่แก้ (ยกเลิกใบเบิกก่อน)'; RETURN; END

IF @apply = 1
BEGIN
    DECLARE @sfx VARCHAR(20) = CONVERT(VARCHAR(8), GETDATE(), 112) + '_' + REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '');
    DECLARE @s1 NVARCHAR(MAX) = N'SELECT * INTO NMU_ERP.dbo.' + QUOTENAME('bak_fund_6905_' + @sfx + '_dtl') + N' FROM NMU_ERP.dbo.sp_check_period_dtl WHERE sp_check_period_hdr_id = ' + CAST(@chkId AS NVARCHAR(20)) + N' AND sp_tor_hdr_period_id = ' + CAST(@periodId AS NVARCHAR(20));
    DECLARE @s2 NVARCHAR(MAX) = N'SELECT * INTO NMU_ERP.dbo.' + QUOTENAME('bak_fund_6905_' + @sfx + '_period') + N' FROM NMU_ERP.dbo.sp_tor_dtl_period WHERE sp_tor_hdr_period_id = ' + CAST(@periodId AS NVARCHAR(20));
    BEGIN TRAN;
    EXEC (@s1); EXEC (@s2);
    UPDATE NMU_ERP.dbo.sp_check_period_dtl SET dc_bg_budget_type_id = @newFund, d_update = GETDATE()
    WHERE sp_check_period_hdr_id = @chkId AND sp_tor_hdr_period_id = @periodId AND dc_bg_budget_type_id = @oldFund;
    IF @@ROWCOUNT <> 1 BEGIN ROLLBACK; PRINT N'จำนวนแถว check_dtl ไม่ตรง - ย้อนกลับ'; RETURN; END
    UPDATE NMU_ERP.dbo.sp_tor_dtl_period SET dc_bg_budget_type_id = @newFund, d_update = GETDATE()
    WHERE sp_tor_hdr_period_id = @periodId AND dc_bg_budget_type_id = @oldFund;
    COMMIT;
    PRINT N'สำรองไว้ที่ NMU_ERP.dbo.bak_fund_6905_' + @sfx + N'_dtl / _period';
    PRINT N'--- หลังแก้ ---';
    SELECT 'check_dtl' AS k, d.sp_check_period_dtl_id AS id, d.dc_bg_budget_type_id AS fund FROM NMU_ERP.dbo.sp_check_period_dtl d WHERE d.sp_check_period_hdr_id = @chkId AND d.sp_tor_hdr_period_id = @periodId
    UNION ALL SELECT 'tor_dtl_period', p.sp_tor_dtl_period_id, p.dc_bg_budget_type_id FROM NMU_ERP.dbo.sp_tor_dtl_period p WHERE p.sp_tor_hdr_period_id = @periodId;
END
