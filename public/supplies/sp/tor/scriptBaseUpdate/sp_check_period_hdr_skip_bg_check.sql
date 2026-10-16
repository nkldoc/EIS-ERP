USE NMU_ERP;
GO

/*
 * หน้าตรวจรับ (checking.js, ST0013) : checkbox "ออกเลขตรวจรับโดยไม่เช็คเงิน"
 * เมื่อติ๊กแล้วกด "บันทึกรายการหลัก" ระบบจะออกเลขตรวจรับโดยไม่จองเงิน/ไม่หักใบกัน
 * คอลัมน์ชุดนี้เก็บร่องรอยว่าเลขตรวจรับใบไหนออกแบบข้ามการเช็คเงิน ใครเป็นคนทำ เมื่อไหร่
 * (ใช้ตามจองเงินย้อนหลัง) - mnCheckCode.php โหมด GENCODECHECKING เป็นคนบันทึก
 *
 * Idempotent: รันซ้ำได้
 */
IF COL_LENGTH('dbo.sp_check_period_hdr', 'i_skip_bg_check') IS NULL
    ALTER TABLE dbo.sp_check_period_hdr ADD i_skip_bg_check TINYINT NULL;
GO
IF COL_LENGTH('dbo.sp_check_period_hdr', 'dc_user_skip_bg_check_id') IS NULL
    ALTER TABLE dbo.sp_check_period_hdr ADD dc_user_skip_bg_check_id BIGINT NULL;
GO
IF COL_LENGTH('dbo.sp_check_period_hdr', 'd_skip_bg_check') IS NULL
    ALTER TABLE dbo.sp_check_period_hdr ADD d_skip_bg_check DATETIME NULL;
GO

SELECT name FROM sys.columns
WHERE object_id = OBJECT_ID('dbo.sp_check_period_hdr') AND name IN ('i_skip_bg_check', 'dc_user_skip_bg_check_id', 'd_skip_bg_check');
GO
