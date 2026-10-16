USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ i_pr_type/i_pr_type2/i_pr_type3 ในตาราง sp_tor_period_bill - เก็บ
 * "แบบแผน/แบบงวด" ของแหล่งเงินแต่ละแหล่ง (สูงสุด 3 แหล่ง) ตอนสร้าง PR ผ่านเมนู
 * "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" (regTorMedSup.js) - ตั้งชื่อคอลัมน์ตามรูปแบบเดียวกับ
 * dc_expense_budget_type_id/id2/id3 ที่มีอยู่แล้วในตารางนี้ (แหล่งที่ 1 ไม่มีเลขต่อท้าย)
 *
 * ค่า: 1 = แบบแผน, 2 = แบบงวด (ตรงกับความหมายในฟอร์มต้นแบบของเมนู PR ทั่วไป)
 */
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'i_pr_type')
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD i_pr_type TINYINT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'i_pr_type2')
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD i_pr_type2 TINYINT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'i_pr_type3')
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD i_pr_type3 TINYINT NULL;
END
GO

SELECT name FROM sys.columns
WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name IN ('i_pr_type', 'i_pr_type2', 'i_pr_type3')
ORDER BY name;
GO
