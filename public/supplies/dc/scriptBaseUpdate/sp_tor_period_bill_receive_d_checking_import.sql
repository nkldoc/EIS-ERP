/* ============================================================================
   sp_tor_period_bill_receive_d_checking_import.sql  (ฐาน NMU_ERP)

   เพิ่มคอลัมน์ d_checking_import (วันที่บันทึกการตรวจรับ จากไฟล์นำเข้า) ที่ sp_tor_period_bill_receive
   ใช้กับหน้า นำเข้าสัญญา (ST00097): คอลัมน์ "วันที่บันทึกการตรวจรับ" ในไฟล์ Excel ถูกเก็บที่รายการรับของ
   แล้วหน้า ตรวจรับ (ST00096) เติมให้ในช่อง "วันที่ตรวจรับ" ตอนออกเลขตรวจรับอัตโนมัติ (แก้ไขได้)

   รันซ้ำได้ (ไม่เพิ่มซ้ำ) ไม่มี COMMIT ไม่แก้ข้อมูลเดิม ยังไม่รัน = นำเข้าได้ตามปกติ แค่ไม่เก็บวันที่นี้
   ============================================================================ */
USE NMU_ERP;
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'd_checking_import') IS NULL
BEGIN
    ALTER TABLE dbo.sp_tor_period_bill_receive ADD d_checking_import DATE NULL;
    PRINT N'เพิ่มคอลัมน์ d_checking_import แล้ว';
END
ELSE PRINT N'มีคอลัมน์ d_checking_import อยู่แล้ว';

SELECT COL_LENGTH('dbo.sp_tor_period_bill_receive', 'd_checking_import') AS d_checking_import_length;   -- 3 = มีแล้ว

/* ย้อนกลับ (ถ้าจำเป็น):
   ALTER TABLE dbo.sp_tor_period_bill_receive DROP COLUMN d_checking_import;
*/
