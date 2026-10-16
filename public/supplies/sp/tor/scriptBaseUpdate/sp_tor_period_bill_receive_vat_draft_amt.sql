USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์เก็บ "ยอด" VAT / ภาษีหัก ณ ที่จ่าย ของร่าง (ต่อจาก
 * sp_tor_period_bill_receive_vat_draft.sql ที่เก็บแค่ % ) - ยอดสองตัวนี้แก้ไขเองทับค่าที่
 * คำนวณจาก % ได้ และเวลาแก้จำนวนเงินรายการรับของ ยอด VAT/หัก ณ ที่จ่ายต้องคงเดิม
 * (ผู้ใช้ยืนยัน) คำนวณซ้ำจาก % ไม่ได้แล้ว จึงต้องเก็บยอดจริงไว้ด้วย - NULL = ร่างเก่าที่
 * ยังไม่มียอด ให้คำนวณจาก % ตามเดิม
 * ต้องรันสคริปต์นี้ก่อนอัปโหลด List_MedSupPeriodBill.php / mnMedSupPeriodBillReceiveController.php
 */
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_vat_amt') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_vat_amt] MONEY NULL;
END
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'draft_f_wht_amt') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill_receive] ADD [draft_f_wht_amt] MONEY NULL;
END
GO
