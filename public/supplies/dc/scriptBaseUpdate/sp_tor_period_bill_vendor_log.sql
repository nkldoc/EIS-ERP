-- ประวัติการแก้ผู้ขาย/ผู้รับจ้างของงวด (ST00095 หน้ารายละเอียดงวด -> ปุ่ม "แก้ผู้ขาย")
-- รันซ้ำได้ (สร้างเมื่อยังไม่มี) ถ้ายังไม่ได้รัน ระบบยังแก้ผู้ขายได้ แต่จะไม่บันทึกประวัติ
USE NMU_ERP;
IF OBJECT_ID('dbo.sp_tor_period_bill_vendor_log') IS NULL
BEGIN
    CREATE TABLE dbo.sp_tor_period_bill_vendor_log (
        sp_tor_period_bill_vendor_log_id INT IDENTITY(1,1) PRIMARY KEY,
        sp_tor_period_bill_id INT NOT NULL,
        c_contract_code NVARCHAR(50) NULL,
        i_period INT NULL,
        dc_creditor_id_old INT NULL,
        c_creditor_name_old NVARCHAR(200) NULL,
        c_tax_number_old VARCHAR(30) NULL,
        dc_creditor_id_new INT NULL,
        c_creditor_name_new NVARCHAR(200) NULL,
        c_tax_number_new VARCHAR(30) NULL,
        c_wd_codes NVARCHAR(500) NULL,   -- เลขใบเบิก D ที่แก้ตามไปด้วย (ถ้ามี)
        dc_user_id INT NULL,
        dc_cost_id INT NULL,
        d_create DATETIME NULL
    );
    CREATE INDEX IX_sp_tor_period_bill_vendor_log_bill ON dbo.sp_tor_period_bill_vendor_log (sp_tor_period_bill_id);
END
