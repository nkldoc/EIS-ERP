USE NMU_ERP;
GO

/*
 * ปลดล็อกเลข IR ที่ออกเลขตรวจรับ (AP) แล้ว ที่เมนู "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - ปกติ
 * IR ที่ออกเลข AP แล้วจะถูกล็อก (แก้ VAT/จำนวนเงิน/ลบรายการ/ยืนยันยอดไม่ได้) ผู้ใช้แจ้ง "ID
 * ปลดล็อก" ที่ขึ้นบนหน้าจอ (= sp_tor_period_bill_receive_id แถวแรกของ IR) ให้ผู้ดูแลระบบ
 * ปลดล็อกผ่านเมนู "ปลดล็อกเลขตรวจรับ (Admin)" - ตั้งค่าพร้อมกันทุกแถวของ IR แก้เสร็จกด
 * "ยืนยันยอด" แล้วจะล็อกกลับเองอัตโนมัติ (b_ap_unlock = 0)
 * ต้องรันสคริปต์นี้ก่อนอัปโหลด List_MedSupPeriodBill.php / mnMedSupPeriodBillReceiveController.php
 */
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'b_ap_unlock') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [b_ap_unlock] BIT NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'd_ap_unlock') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [d_ap_unlock] DATETIME NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'dc_user_ap_unlock_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [dc_user_ap_unlock_id] INT NULL;
END
GO
