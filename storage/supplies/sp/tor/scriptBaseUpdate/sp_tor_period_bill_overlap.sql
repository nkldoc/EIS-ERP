USE NMU_ERP;
GO

/*
 * รองรับการจองเงินงบประมาณ "กันเหลื่อม" (เงินกันเหลื่อมปี) ต่อแหล่งเงิน นอกเหนือจาก
 * "ปีต่อปี" (งบประมาณปีปัจจุบัน) ที่มีอยู่เดิม - อ้างอิงโฟลว์เดิมของระบบ ERP ที่เทียบปี
 * งบประมาณของสัญญา (i_budget_year) กับปีของใบกันเหลื่อมที่เลือก แล้วดึงรายการใบกัน
 * เหลื่อมที่ยังมีวงเงินเหลือจาก bg_overlap_hdr (ผ่าน All_PoWorkingImpHdr.php
 * type=booking_store) มาให้เลือก
 *
 * c_overlap[n]             = เลขที่ใบกันเหลื่อมที่เลือกไว้ของแหล่งเงินที่ n
 * i_budget_year_overlap[n] = ปีงบประมาณของใบกันเหลื่อมนั้น (ใช้ส่งต่อให้ AP-API ตอนจองเงิน)
 * ไม่มี suffix = แหล่งเงินที่ 1 (ตามรูปแบบคอลัมน์อื่นๆ ของตารางนี้ เช่น dc_expense_budget_type_id)
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_overlap') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [c_overlap] VARCHAR(100) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_overlap2') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [c_overlap2] VARCHAR(100) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_overlap3') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [c_overlap3] VARCHAR(100) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'i_budget_year_overlap') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [i_budget_year_overlap] VARCHAR(10) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'i_budget_year_overlap2') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [i_budget_year_overlap2] VARCHAR(10) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'i_budget_year_overlap3') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [i_budget_year_overlap3] VARCHAR(10) NULL;
END
GO
