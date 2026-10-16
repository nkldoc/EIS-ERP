/* เมนูนำเข้าสัญญา (เวชภัณฑ์) ST00097 : คอลัมน์ใหม่ท้ายไฟล์นำเข้า pr_id / po_id / chk_id
   เลขอ้างอิงจากไฟล์ที่ export มา - เก็บไว้อ้างอิงเท่านั้น ไม่ใช้กับการจองเงิน
     sp_tor_period_bill         : c_ref_pr_id, c_ref_po_id, c_ref_chk_id  (ต่องวด)
     sp_tor_period_bill_receive : c_ref_chk_id                           (ต่อรายการรับของ)
   (c_overlap ใช้คอลัมน์ c_overlap เดิมของ sp_tor_period_bill ไม่ต้องเพิ่ม)
   ยังไม่รันสคริปต์นี้ การนำเข้ายังใช้งานได้ แค่ไม่เก็บเลขอ้างอิง 3 ตัวนี้   รันซ้ำได้ */
USE NMU_ERP;
GO
IF OBJECT_ID('dbo.sp_tor_period_bill') IS NULL OR OBJECT_ID('dbo.sp_tor_period_bill_receive') IS NULL
    PRINT N'ไม่พบตาราง sp_tor_period_bill / sp_tor_period_bill_receive (ยังไม่ได้ติดตั้งเมนูเวชภัณฑ์)';
ELSE
BEGIN
    IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_ref_pr_id') IS NULL
        ALTER TABLE dbo.sp_tor_period_bill ADD c_ref_pr_id VARCHAR(50) NULL;
    IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_ref_po_id') IS NULL
        ALTER TABLE dbo.sp_tor_period_bill ADD c_ref_po_id VARCHAR(50) NULL;
    IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_ref_chk_id') IS NULL
        ALTER TABLE dbo.sp_tor_period_bill ADD c_ref_chk_id VARCHAR(50) NULL;
    IF COL_LENGTH('dbo.sp_tor_period_bill_receive', 'c_ref_chk_id') IS NULL
        ALTER TABLE dbo.sp_tor_period_bill_receive ADD c_ref_chk_id VARCHAR(50) NULL;
    PRINT N'เพิ่มคอลัมน์เลขอ้างอิง pr_id / po_id / chk_id เรียบร้อย';
END
GO
