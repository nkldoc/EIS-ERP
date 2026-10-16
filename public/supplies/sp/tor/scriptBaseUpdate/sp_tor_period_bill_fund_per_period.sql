USE NMU_ERP;
GO

/*
 * เพิ่มแหล่งเงิน+จำนวนเงินระดับ "ต่องวด" ด้วย (แยกจากแหล่งเงินระดับหัวเรื่อง
 * dc_expense_budget_type_id/2/3 ที่มีอยู่แล้ว) เพราะแต่ละงวดอาจเบิกจากคนละ
 * แหล่งเงินกันได้ ใช้ suffix "_dtl" กันชนกับคอลัมน์ระดับหัวเรื่องเดิม
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'dc_expense_budget_type_id_dtl') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD
        [dc_expense_budget_type_id_dtl] BIGINT NULL,
        [c_fund_source_dtl]             VARCHAR(200) NULL,
        [f_fund_amt_dtl]                DECIMAL(18, 2) NULL;
END
GO
