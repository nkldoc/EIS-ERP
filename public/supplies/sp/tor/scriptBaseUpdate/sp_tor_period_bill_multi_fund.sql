USE NMU_ERP;
GO

/*
 * แหล่งเงิน ต้องเลือกได้มากกว่า 1 แหล่ง (สูงสุด 3 แหล่ง) แต่ละแหล่งมีจำนวนเงินของ
 * ตัวเอง ตามรูปแบบเดียวกับหน้าจอ "เปลี่ยนแปลงแหล่งเงินที่จัดซื้อ/เช่า/จ้าง" ใน
 * contract.js (แหล่งเงินที่ 1/2/3 + จำนวนเงินจากแหล่งเงิน 1/2/3)
 *
 * เพิ่มจำนวนเงินของแหล่งที่ 1 (คอลัมน์เดิม dc_expense_budget_type_id/c_fund_source
 * มีอยู่แล้ว ขาดแค่จำนวนเงิน) และคอลัมน์ครบชุดสำหรับแหล่งที่ 2, 3
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'f_fund_amt') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD
        [f_fund_amt]                 DECIMAL(18, 2) NULL,  -- จำนวนเงินจากแหล่งเงินที่ 1
        [dc_expense_budget_type_id2] BIGINT NULL,
        [c_fund_source2]             VARCHAR(200) NULL,
        [f_fund_amt2]                DECIMAL(18, 2) NULL,
        [dc_expense_budget_type_id3] BIGINT NULL,
        [c_fund_source3]             VARCHAR(200) NULL,
        [f_fund_amt3]                DECIMAL(18, 2) NULL;
END
GO
