USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ c_ap_dept_type ในตาราง sp_tor - เก็บรหัสหน่วยงานที่ใช้ต่อท้ายเลข PR ตอน
 * ออกเลขจริง (APPS = พัสดุ, APMD = เภสัช, APMS = เวชภัณฑ์) ใช้กับเมนูใหม่ "การจัดทำ PR
 * (หน่วยงาน) เวชภัณฑ์" (newTorMedSup.php / regTorMedSup.js) เท่านั้น - รูปแบบ dropdown
 * เดียวกับ Ext.storeApDeptTypePeriodBill ใน public/supplies/sp/tor/medSupPeriodBill.js
 * และวิธีต่อ suffix เดียวกับที่ mnMedSupPeriodBillReceiveController.php ใช้กับเลข AP
 *
 * ไม่ backfill ข้อมูลเดิม (ปล่อย NULL) เพราะ PR ที่มีอยู่แล้วในระบบทั้งหมดมาจากเมนู PR
 * ทั่วไป (newTor.php/regTor.js/mnTorController.php) ซึ่งไม่เกี่ยวกับ concept นี้เลย และ
 * mnTorController.php เดิมจะไม่ถูกแก้ไข ไม่ SET คอลัมน์นี้ต่อจากนี้ไปเช่นกัน
 */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor') AND name = 'c_ap_dept_type'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor ADD c_ap_dept_type VARCHAR(10) NULL;
END
GO

SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor') AND name = 'c_ap_dept_type';
GO
