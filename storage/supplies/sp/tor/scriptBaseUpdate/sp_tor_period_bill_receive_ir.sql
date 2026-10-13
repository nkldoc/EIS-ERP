USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์เก็บเลขที่ IR (ใบรับของ) ให้ sp_tor_period_bill_receive - ต้องออกเลข IR
 * ให้แต่ละรายการรับของก่อน (1 รายการ = 1 เลข IR ของตัวเอง) แล้วค่อยเลือกหลายรายการที่มี
 * เลข IR แล้วไปรวมออกเป็น "เลข AP" เดียวกันทีหลัง (ตามโฟลเดียวกับเมนู "ส่งมอบงาน" เดิม
 * ST0012 ที่ต้องออกเลขรับของก่อนถึงจะไปขั้นตอน AP ได้)
 */
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'c_ir_code') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [c_ir_code] VARCHAR(50) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'd_ir_issue') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [d_ir_issue] DATETIME NULL;
END
GO
