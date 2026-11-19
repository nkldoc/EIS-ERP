/* ============================================================================
   sp_tor_period_bill_receive_egp_no.sql  (ฐาน NMU_ERP)

   เพิ่มคอลัมน์ c_egp_no (เลขคุมตรวจรับ EGP) ที่ sp_tor_period_bill_receive
   ใช้กับหน้า นำเข้าสัญญา (ST00097): คอลัมน์ "เลขคุมตรวจรับ egp" ในไฟล์ Excel ถูกเก็บที่รายการรับของ
   แล้วหน้า ตรวจรับ (ST00096) เติมให้ในช่อง "เลขที่ EGP" ตอนออกเลขตรวจรับ (user ไม่ต้องพิมพ์/ก๊อปปี้เอง)

   รันซ้ำได้ (ไม่เพิ่มซ้ำ) ไม่มี COMMIT ไม่แก้ข้อมูลเดิม ยังไม่รัน = นำเข้าได้ตามปกติ แค่ไม่เก็บเลขนี้
   ============================================================================ */
USE NMU_ERP;
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'c_egp_no') IS NULL
BEGIN
    ALTER TABLE dbo.sp_tor_period_bill_receive ADD c_egp_no VARCHAR(50) NULL;
    PRINT N'เพิ่มคอลัมน์ c_egp_no แล้ว';
END
ELSE PRINT N'มีคอลัมน์ c_egp_no อยู่แล้ว';

SELECT COL_LENGTH('dbo.sp_tor_period_bill_receive', 'c_egp_no') AS c_egp_no_length;   -- 50 = มีแล้ว

/* ย้อนกลับ (ถ้าจำเป็น):
ALTER TABLE dbo.sp_tor_period_bill_receive DROP COLUMN c_egp_no;
*/
