USE NMU_ERP;
GO

/*
 * ขยายขนาดคอลัมน์ dbo.sp_tor.plan_code / plan_seq จาก VARCHAR(50) เดิม (ออกแบบไว้สำหรับ
 * รหัสแผน 1 รายการ) เป็น VARCHAR(500) เพื่อรองรับฟีเจอร์ "รหัสแผนหลายรายการต่อ 1 PR"
 * (tor/api/mnTorPlan.php sync ค่ารวมคั่นด้วย "," กลับมาที่ 2 คอลัมน์นี้ - ดู sp_tor_plan.sql)
 */
ALTER TABLE [dbo].[sp_tor] ALTER COLUMN [plan_code] VARCHAR(500) NULL;
ALTER TABLE [dbo].[sp_tor] ALTER COLUMN [plan_seq] VARCHAR(500) NULL;
GO
