USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ c_ap_dept_type ในตาราง sp_tor_period_bill - เก็บรหัสหน่วยงานที่ใช้
 * ออกเลข AP จริง (APPS = พัสดุ, APMD = เภสัช, APMS = เวชภัณฑ์)
 *
 * เดิม "ประเภท" ในหน้า "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092) เป็นแค่ข้อความ
 * คงที่ "APMS - เวชภัณฑ์" ไม่ได้ผูกกับข้อมูลจริงในฐานข้อมูลเลย (ดู
 * public/supplies/sp/tor/medSupPeriodBill.js) ตอนนี้ทำให้เลือกได้จริงเป็น dropdown
 * และใช้กำหนด prefix ตอนออกเลข AP ที่เมนู "ตรวจรับ (เวชภัณฑ์)" (ST00096) แทนการ
 * hardcode เป็น APMS ตายตัว (ดู
 * public/supplies/sp/tor/api/mnMedSupPeriodBillReceiveController.php mode ISSUE_AP)
 *
 * ข้อมูลเดิมทั้งหมด backfill เป็น 'APMS' เพราะเมนูนี้เป็นเวชภัณฑ์ล้วนมาตั้งแต่ต้น
 * (เพิ่งเปิดให้เลือกหน่วยงานอื่นได้จากนี้ไป)
 */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'c_ap_dept_type'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD c_ap_dept_type VARCHAR(10) NULL;
END
GO

UPDATE NMU_ERP.dbo.sp_tor_period_bill SET c_ap_dept_type = 'APMS' WHERE c_ap_dept_type IS NULL;
GO

SELECT c_ap_dept_type, COUNT(*) AS n FROM NMU_ERP.dbo.sp_tor_period_bill GROUP BY c_ap_dept_type;
GO
