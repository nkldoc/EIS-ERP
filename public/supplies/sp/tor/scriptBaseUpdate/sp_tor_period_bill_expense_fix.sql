USE NMU_ERP;
GO

/*
 * แก้ไข "ชื่อค่าใช้จ่าย": เดิมทำเป็นช่อง auto-copy จากชื่อโครงการซึ่งผิด เพราะ
 * ระบบมีตัวเลือกอยู่แล้ว คือฟิลด์เดียวกับ "รายการย่อย" ในหน้า contract.js (ผูกกับ
 * ตาราง po_expense ผ่าน public/supplies/sp/api/All_PoWorkingImpHdr.php?type=po_expense)
 *
 * เพิ่มคอลัมน์ po_expense_id เพื่อเก็บ id ที่เลือกจริง c_expense_name เดิม
 * ยังเก็บไว้เป็นชื่อ denormalized สำหรับแสดงผลในกริด (อ่านตาราง po_expense
 * อย่างเดียว ไม่ได้เขียนอะไรลงไป)
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'po_expense_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD
        [po_expense_id] BIGINT NULL;
END
GO
