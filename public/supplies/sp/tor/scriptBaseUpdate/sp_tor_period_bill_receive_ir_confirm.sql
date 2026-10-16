USE NMU_ERP;
GO

/*
 * สถานะ "ยืนยันยอด" ของเลข IR ที่เมนู "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - ผู้ใช้กดปุ่ม
 * "ยืนยันยอด" ท้ายแถว IR เพื่อตรวจยอด VAT รวมของทุกรายการใน IR ก่อน (ผลรวมรายการย่อยต้อง
 * ถูกต้อง) ยืนยันแล้วเลข IR นั้นถึงจะไหลไปขึ้นที่หน้า "ตรวจรับ (เวชภัณฑ์)" (ST00096)
 * เก็บที่ทุกแถวรับของของ IR นั้น (ตั้งค่าพร้อมกันทั้ง IR) - แก้จำนวนเงิน/ร่าง VAT/ลบรายการ
 * ใน IR หลังยืนยันแล้ว สถานะจะถูกล้างกลับเป็น 0 ต้องยืนยันใหม่
 * ต้องรันสคริปต์นี้ก่อนอัปโหลด List_MedSupPeriodBill.php / mnMedSupPeriodBillReceiveController.php
 */
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'b_ir_confirm') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [b_ir_confirm] BIT NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'd_ir_confirm') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [d_ir_confirm] DATETIME NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'dc_user_ir_confirm_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [dc_user_ir_confirm_id] INT NULL;
END
GO
