USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ c_pr_code ในตาราง sp_tor_period_bill - เก็บเลขที่ PR ที่ออกจากเมนูใหม่
 * "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" (mode ADD_PR ใน mnMedSupPeriodBillController.php)
 * ออกเลขผ่าน stored procedure SP_GEN_CODE ตัวเดียวกับที่เมนู PR ทั่วไป (regTor.js/
 * mnTorController.php) ใช้อยู่แล้ว แต่ต่อท้ายด้วยรหัสหน่วยงาน (APPS/APMD/APMS) ตามที่
 * ผู้ใช้เลือก - ตารางนี้เดิมไม่มีแนวคิด "เลขที่ PR" ของตัวเองเลย (ใช้ c_contract_code
 * แทนตอนมีสัญญาแล้ว) จึงต้องเพิ่มคอลัมน์ใหม่นี้ขึ้นมาโดยเฉพาะ
 */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'c_pr_code'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD c_pr_code VARCHAR(50) NULL;
END
GO

SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'c_pr_code';
GO
