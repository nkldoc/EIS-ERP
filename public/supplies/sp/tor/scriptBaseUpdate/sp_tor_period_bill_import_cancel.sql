/* เมนูนำเข้าสัญญา (เวชภัณฑ์) ST00097 : ปุ่ม "ยกเลิกชุดนำเข้า"
   เพิ่มคอลัมน์เก็บเหตุผล / ผู้ยกเลิก / เวลาที่ยกเลิก ของประวัติการนำเข้า
   (ยังไม่รันสคริปต์นี้ ปุ่มยกเลิกก็ใช้งานได้ แค่ไม่เก็บเหตุผล)   รันซ้ำได้ */
USE NMU_ERP;
GO
IF OBJECT_ID('dbo.sp_tor_period_bill_import') IS NULL
    PRINT N'ไม่พบตาราง sp_tor_period_bill_import (ยังไม่ได้ติดตั้งเมนูเวชภัณฑ์)';
ELSE
BEGIN
    IF COL_LENGTH('dbo.sp_tor_period_bill_import', 'c_cancel_reason') IS NULL
        ALTER TABLE dbo.sp_tor_period_bill_import ADD c_cancel_reason NVARCHAR(500) NULL;
    IF COL_LENGTH('dbo.sp_tor_period_bill_import', 'dc_user_cancel_id') IS NULL
        ALTER TABLE dbo.sp_tor_period_bill_import ADD dc_user_cancel_id INT NULL;
    IF COL_LENGTH('dbo.sp_tor_period_bill_import', 'd_cancel') IS NULL
        ALTER TABLE dbo.sp_tor_period_bill_import ADD d_cancel DATETIME NULL;
    PRINT N'เพิ่มคอลัมน์สำหรับยกเลิกชุดนำเข้าเรียบร้อย';
END
GO
