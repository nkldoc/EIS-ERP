USE NMU_ERP;
GO

/*
 * ย้ายจุดจองเงินจากระดับ "งวด" ขึ้นไปเป็นระดับ "แหล่งเงิน" (จองครั้งเดียวเต็มยอดของ
 * แหล่งเงินนั้น แล้วงวดต่างๆ เบิกใช้ภายใต้วงเงินนี้ได้เรื่อยๆ โดยไม่ต้องจองซ้ำทุกงวด)
 * คอลัมน์เดิม (bg_reserve_money_id / c_ap_arrive_code / d_ap_reserve) ใช้แทนแหล่งเงิน
 * ที่ 1 อยู่แล้ว เพิ่มชุดสำหรับแหล่งเงินที่ 2/3 เพิ่มเติม
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'bg_reserve_money_id2') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [bg_reserve_money_id2] BIGINT NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'bg_reserve_money_id3') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [bg_reserve_money_id3] BIGINT NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_ap_arrive_code2') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [c_ap_arrive_code2] VARCHAR(100) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_ap_arrive_code3') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [c_ap_arrive_code3] VARCHAR(100) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'd_ap_reserve2') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [d_ap_reserve2] DATETIME NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill', 'd_ap_reserve3') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD [d_ap_reserve3] DATETIME NULL;
END
GO
