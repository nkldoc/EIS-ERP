USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์เก็บ "เลขรับเข้าคลังของ ERP" ให้ sp_tor_period_bill_receive - เลขที่ทาง
 * คลังพัสดุออกให้ตอนรับของเข้าคลังจริงในระบบ ERP (คนละเลขกับ c_receive_code ที่เป็นเลขที่
 * รับของ/เอกสารจากผู้ขาย) ให้ user กรอกเองตรงฟอร์ม "เพิ่มรายการรับของ" ของเมนู
 * "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) ไว้อ้างอิงย้อนกลับไปที่ ERP ทีหลัง
 */
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'c_erp_stock_code') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [c_erp_stock_code] VARCHAR(50) NULL;
END
GO
