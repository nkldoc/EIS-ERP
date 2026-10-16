USE NMU_ERP;
GO

/*
 * แก้ไข "แหล่งเงิน": เดิมทำเป็นช่องพิมพ์เองแบบข้อความล้วน ซึ่งผิด เพราะระบบมี
 * แหล่งเงินให้เลือกอยู่แล้ว (ตาราง dc_expense_budget_type ผ่าน
 * public/supplies/sp/api/All_PoWorkingImpHdr.php?type=dc_expense_budget_type
 * ตัวเดียวกับที่ addPo.js/contract.js ใช้ทั่วทั้งระบบ)
 *
 * เพิ่มคอลัมน์ dc_expense_budget_type_id เพื่อเก็บ id ที่เลือกจริง ส่วน
 * c_fund_source เดิมยังเก็บไว้เป็นชื่อ denormalized สำหรับแสดงผลในกริดเร็วๆ
 * (ไม่ได้ไปเขียนอะไรลงตาราง dc_expense_budget_type เอง - อ่านอย่างเดียว)
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'dc_expense_budget_type_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD
        [dc_expense_budget_type_id] BIGINT NULL;
END
GO
