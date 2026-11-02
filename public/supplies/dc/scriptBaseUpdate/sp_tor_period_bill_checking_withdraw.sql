-- ตรวจรับ(เวชภัณฑ์) ST00096: เก็บเลขใบเบิก EIS ที่ออกจากรายการตรวจรับนั้น
-- EIS (NMU_EIS app: po/api/mn_poReg.php > UPDATE_sp_check_period_hdr) เขียนกลับเมื่อ chk_id >= 100000 (MEDSUP_CHK_OFFSET)
-- รันซ้ำได้
USE NMU_ERP
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_checking', 'po_working_hdr_id') IS NULL
    ALTER TABLE dbo.sp_tor_period_bill_checking ADD po_working_hdr_id bigint NULL
GO
IF COL_LENGTH('dbo.sp_tor_period_bill_checking', 'c_code_ref') IS NULL
    ALTER TABLE dbo.sp_tor_period_bill_checking ADD c_code_ref nvarchar(50) NULL
GO
