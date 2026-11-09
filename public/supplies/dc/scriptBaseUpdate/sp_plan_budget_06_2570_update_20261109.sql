-- อัพเดตแผน 06 ปี 2570 ตาม Excel ล่าสุด (1. แผน 06 Final (2-10-69) ... (2).xlsx) เฉพาะแถวที่เปลี่ยน: 1 แถว
-- ใช้เมื่อรัน sp_plan_budget_06_2570.sql ไปแล้ว (ไม่ต้องรันไฟล์ใหญ่ซ้ำ) | รันซ้ำได้ | ไม่มี COMMIT
-- 06-DIT-000-008-2570: ยังไม่ได้รับเรื่อง -> ได้รับเรื่องแล้ว (ขออนุมัติ 181,365 / PR25691000398 / พวช.10/427)
USE NMU_ERP
GO
UPDATE dbo.sp_plan_budget
SET c_status = N'ได้รับเรื่องแล้ว', c_doc_ref = N'พวช.10/427', f_approve_amt = 181365, f_remain = 238635, c_pr_code = N'PR25691000398'
WHERE plan_code = N'06-DIT-000-008-2570'
GO
SELECT plan_code, c_status, c_doc_ref, f_approve_amt, f_remain, c_pr_code FROM dbo.sp_plan_budget WHERE plan_code = N'06-DIT-000-008-2570'
GO
