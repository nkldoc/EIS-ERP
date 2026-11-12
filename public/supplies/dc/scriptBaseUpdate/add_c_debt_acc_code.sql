/* ============================================================================
   add_c_debt_acc_code.sql  (NMU_ERP)  รันด้วย sqlcmd -I

   เพิ่มคอลัมน์ c_debt_acc_code ใน sp_tor_period_bill (งวดเวชภัณฑ์) เก็บรหัสบัญชีตั้งหนี้ที่ user กรอกใน Excel
   (คอลัมน์ "รหัสบัญชีตั้งหนี้" เช่น 50301020309 หรือ 50301020321) ว่าง = ใช้การจับคู่หมวดเดิม
   รันซ้ำได้ (ตรวจก่อนเพิ่ม)
   ============================================================================ */
USE NMU_ERP;
SET NOCOUNT ON;

IF COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill', 'c_debt_acc_code') IS NULL
BEGIN
    ALTER TABLE dbo.sp_tor_period_bill ADD c_debt_acc_code VARCHAR(12) NULL;
    SELECT N'เพิ่มคอลัมน์ c_debt_acc_code แล้ว' AS result;
END
ELSE
    SELECT N'มีคอลัมน์ c_debt_acc_code อยู่แล้ว (ไม่ทำอะไร)' AS result;
