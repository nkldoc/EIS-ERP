USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ให้แก้ไข "เลขที่ใบกันเหลื่อม"/"ปีงบประมาณ"/"รายการย่อย" ในฟอร์ม
 * "รายละเอียดตรวจรับ" ได้ (เมนู "ตรวจรับ (เวชภัณฑ์)" ST00096) - เดิม 3 ค่านี้เป็นแค่
 * displayfield อ่านอย่างเดียว ดึงมาจากสัญญา/งวดต้นทาง (sp_tor_period_bill) เฉยๆ
 * ผู้ใช้ต้องการแก้ไขเองได้ในฟอร์มนี้โดยเฉพาะ จึงเก็บเป็นคอลัมน์แยกต่างหากในตารางนี้
 * (ไม่ใช่ไปแก้ค่าต้นทางที่ sp_tor_period_bill) - ค่าเริ่มต้นตอนเปิดฟอร์มครั้งแรกยัง
 * ดึงมาจาก sp_tor_period_bill เหมือนเดิม แต่ถ้าผู้ใช้แก้แล้วบันทึก จะใช้ค่าที่แก้แทน
 */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill_checking') AND name = 'c_overlap_no'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill_checking ADD c_overlap_no VARCHAR(50) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill_checking') AND name = 'i_budget_year_ref'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill_checking ADD i_budget_year_ref INT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill_checking') AND name = 'c_item_name'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill_checking ADD c_item_name VARCHAR(300) NULL;
END
GO
