USE NMU_ERP;
GO

/*
 * ตาราง sp_tor_period_bill_checking - รายละเอียด "ตรวจรับ" ต่อ 1 เลข IR (เมนู
 * "ตรวจรับ (เวชภัณฑ์)" ST00096) เลียนแบบฟอร์มของเมนู "ตรวจรับพัสดุ/ครุภัณฑ์" เดิม
 * (ST0013 - public/supplies/sp/tor/checking.js) เฉพาะฟิลด์ที่ผู้ใช้ต้องการ (EGP,
 * VAT/ภาษีหัก ณ ที่จ่าย/ค่าปรับ/ค่าประกันผลงาน, รายการส่งเบิก, หน่วยงาน) - ไม่ได้ผูก
 * กับ GL/สถานะจองงบประมาณจริงเหมือน ST0013 (นอกขอบเขตที่ขอ)
 *
 * ต้องกรอกครบ (โดยเฉพาะ c_disburse_detail "รายการส่งเบิก") ก่อนถึงจะออกเลข AP ให้
 * เลข IR นั้นได้ (ดู mnMedSupPeriodBillReceiveController.php mode SAVE_CHECKING/ISSUE_AP)
 *
 * 1 แถว ต่อ 1 เลข IR (c_ir_code unique) - ไม่ใช่ต่อรายการย่อยดิบ
 */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'sp_tor_period_bill_checking' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE NMU_ERP.dbo.sp_tor_period_bill_checking (
        sp_tor_period_bill_checking_id INT IDENTITY(1,1) PRIMARY KEY,
        c_ir_code VARCHAR(50) NOT NULL,
        d_doc_complete DATE NULL,
        d_checking DATE NULL,
        c_egp_no VARCHAR(100) NULL,
        c_disburse_detail VARCHAR(500) NULL,
        i_budget_year_use INT NULL,
        f_total_vat MONEY NULL,
        b_vat BIT NOT NULL DEFAULT 1,
        f_vat_percent DECIMAL(5,2) NOT NULL DEFAULT 7,
        f_before_vat MONEY NULL,
        f_vat_amt MONEY NULL,
        f_request_amt MONEY NULL,
        b_wht BIT NOT NULL DEFAULT 1,
        f_wht_percent DECIMAL(5,2) NOT NULL DEFAULT 1,
        f_wht_amt MONEY NULL,
        f_penalty MONEY NOT NULL DEFAULT 0,
        b_guarantee BIT NOT NULL DEFAULT 0,
        f_guarantee_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
        f_guarantee_amt MONEY NULL,
        f_other MONEY NOT NULL DEFAULT 0,
        f_pay_amt MONEY NULL,
        dc_cost_responsible_id INT NULL,
        dc_cost_owner_id INT NULL,
        i_enabled BIT NOT NULL DEFAULT 1,
        dc_user_create_id INT NULL,
        dc_user_create_cost_id INT NULL,
        d_create DATETIME NULL,
        dc_user_update_id INT NULL,
        dc_user_update_cost_id INT NULL,
        d_update DATETIME NULL,
        CONSTRAINT UQ_sp_tor_period_bill_checking_ir UNIQUE (c_ir_code)
    );
END
GO
