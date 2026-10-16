USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ "ร่าง" ข้อมูล VAT/ภาษีหัก ณ ที่จ่าย/ค่าประกันผลงาน ให้
 * sp_tor_period_bill_receive - ให้ user กรอกไว้ล่วงหน้าได้ตั้งแต่ตอนกด "+ เพิ่ม" รายการ
 * รับของที่เมนู "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) ก่อนที่จะออกเลข IR จริง (เพราะ
 * sp_tor_period_bill_checking.c_ir_code เป็น NOT NULL บันทึกข้อมูลจริงตอนนี้ไม่ได้) พอ
 * ออกเลข IR จริงแล้วไปเปิดหน้า "ตรวจรับ (เวชภัณฑ์)" (ST00096) ค่าร่างนี้จะถูกดึงมาเติม
 * ให้อัตโนมัติถ้ายังไม่เคยบันทึกรายละเอียดตรวจรับจริง (ดู List_MedSupPeriodBill.php
 * type=medsup_checking_by_ir) เก็บเฉพาะค่าที่ผู้ใช้กรอกตรงๆ (total/percent/checkbox)
 * ไม่เก็บยอดที่คำนวณได้ (before vat/wht amt ฯลฯ) เพราะคำนวณซ้ำได้เสมอจากค่าดิบพวกนี้
 * (สูตรเดียวกับ mode SAVE_CHECKING)
 */
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_total_vat') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_total_vat] MONEY NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_b_vat') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_b_vat] BIT NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_vat_percent') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_vat_percent] DECIMAL(5, 2) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_b_wht') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_b_wht] BIT NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_wht_percent') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_wht_percent] DECIMAL(5, 2) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_penalty') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_penalty] MONEY NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_b_guarantee') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_b_guarantee] BIT NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_guarantee_percent') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_guarantee_percent] DECIMAL(5, 2) NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_other') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_other] MONEY NULL;
END
GO
