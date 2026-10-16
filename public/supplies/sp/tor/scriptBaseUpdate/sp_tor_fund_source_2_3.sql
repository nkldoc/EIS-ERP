USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์รองรับ "แหล่งเงิน" ที่ 2 และ 3 ในตาราง sp_tor - ใช้กับเมนูใหม่ "การจัดทำ PR
 * (หน่วยงาน) เวชภัณฑ์" (regTorMedSup.js) ที่ต้องเลือกแหล่งเงินได้สูงสุด 3 แหล่งต่อ 1 PR
 * (ตามฟอร์มต้นแบบของ procure) ในขณะที่เมนู PR ทั่วไปเดิม (regTor.js) รองรับแค่ 1 แหล่ง
 * ผ่านคอลัมน์ dc_expense_budget_type_id/f_type_amt ที่มีอยู่แล้ว
 *
 * สำรวจแล้วพบว่า sp_tor มีคอลัมน์ i_pr_type1..i_pr_type5 (แบบแผน/แบบงวด) อยู่แล้วตั้งแต่
 * แรก (ออกแบบเผื่อ multi-source ไว้แล้วแต่ไม่เคยใช้ครบ) จึงใช้ i_pr_type1/2/3 ของเดิมได้
 * เลย ไม่ต้องเพิ่ม - ที่ขาดจริงๆ คือคอลัมน์ตัวแหล่งเงิน/จำนวนเงินของแหล่งที่ 2 และ 3
 * เท่านั้น (แหล่งที่ 1 ใช้ dc_expense_budget_type_id/f_type_amt เดิม)
 */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor') AND name = 'dc_expense_budget_type_id2'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor ADD dc_expense_budget_type_id2 BIGINT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor') AND name = 'dc_expense_budget_type_id3'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor ADD dc_expense_budget_type_id3 BIGINT NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor') AND name = 'f_bg_amt2'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor ADD f_bg_amt2 DECIMAL(18,2) NULL;
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor') AND name = 'f_bg_amt3'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor ADD f_bg_amt3 DECIMAL(18,2) NULL;
END
GO

SELECT c.name, ty.name AS data_type
FROM sys.columns c
JOIN sys.types ty ON ty.user_type_id = c.user_type_id
WHERE c.object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor')
    AND c.name IN ('dc_expense_budget_type_id2', 'dc_expense_budget_type_id3', 'f_bg_amt2', 'f_bg_amt3')
ORDER BY c.name;
GO
