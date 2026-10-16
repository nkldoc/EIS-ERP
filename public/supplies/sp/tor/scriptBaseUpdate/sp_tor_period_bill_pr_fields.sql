USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ที่ขาดสำหรับฟอร์ม "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" (regTorMedSup.js) ให้
 * ครบตามฟอร์มต้นแบบ (ขอดำเนินการ/ของที่ได้มา/รหัสเอกสารอ้างอิง) - sp_tor_period_bill เดิม
 * ไม่มีแนวคิดพวกนี้เลย (c_doc_ref/d_doc_dateSub ที่มีอยู่แล้วเป็นคนละเรื่อง ใช้ตอนบันทึก
 * รายละเอียดสัญญา หมายถึงใบส่งของ/ใบแจ้งหนี้ ไม่ใช่เอกสารอ้างอิงตอนขอ PR) จึงตั้งชื่อ
 * คอลัมน์ใหม่แยกจากกันชัดเจน ไม่ชนกับคอลัมน์เดิม
 *
 * i_purchase/i_product_type ตั้งชื่อ/ค่าให้ตรงกับคอลัมน์ชื่อเดียวกันใน dbo.sp_tor (เมนู PR
 * ทั่วไป) เพื่อความสอดคล้องกันทั้งระบบ แม้จะเป็นคนละตารางก็ตาม
 * i_purchase: 1=จัดซื้อ, 2=จัดจ้าง, 3=จัดเช่า
 * i_product_type: 1=วัสดุ, 2=ครุภัณฑ์
 */
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'i_purchase')
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD i_purchase TINYINT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'i_product_type')
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD i_product_type TINYINT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'c_pr_doc_ref')
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD c_pr_doc_ref VARCHAR(100) NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'd_pr_doc_ref')
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD d_pr_doc_ref DATE NULL;
END
GO

SELECT name, TYPE_NAME(user_type_id) AS data_type
FROM sys.columns
WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill')
    AND name IN ('i_purchase', 'i_product_type', 'c_pr_doc_ref', 'd_pr_doc_ref')
ORDER BY name;
GO
