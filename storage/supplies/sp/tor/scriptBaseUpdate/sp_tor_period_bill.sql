USE NMU_ERP;
GO

/*
 * ตารางบันทึกรายละเอียดใบส่งของ/ใบแจ้งหนี้ต่องวดสัญญา สำหรับเมนู
 * "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092)
 *
 * รูปแบบอ้างอิงจากตาราง sp_sbill_items ที่ใช้กับเมนู "บันทึกใบวางบิล" เดิม
 * (header ซ้ำอยู่ในทุกแถวของกลุ่มเดียวกัน ผูกกลุ่มด้วย sp_tor_period_bill_hdr_id
 * ที่แอพฝั่ง PHP เป็นคน generate เอง แบบเดียวกับ sp_sbill_hdr_id)
 */
IF OBJECT_ID(N'[dbo].[sp_tor_period_bill]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_tor_period_bill]
    (
        [sp_tor_period_bill_id]     BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT [PK_sp_tor_period_bill] PRIMARY KEY,
        [sp_tor_period_bill_hdr_id] BIGINT NOT NULL,       -- กลุ่มของการบันทึกครั้งเดียว (หลายแถวใช้ค่าเดียวกัน)

        [sp_tor_contract_id]        BIGINT NULL,           -- FK -> sp_tor_contract
        [sp_tor_hdr_period_id]      BIGINT NULL,           -- FK -> sp_tor_hdr_period
        [c_contract_code]           VARCHAR(100) NULL,     -- เลขที่สัญญา (denormalized ไว้แสดงในกริดเร็วๆ)
        [i_period]                  INT NULL,              -- งวดที่ของสัญญา

        [c_doc_ref]                 VARCHAR(100) NULL,     -- เลขที่ใบส่งของ/ใบแจ้งหนี้
        [d_doc_date]                DATE NULL,             -- วันที่เอกสาร
        [f_amt]                     DECIMAL(18, 2) NULL,   -- จำนวนเงิน (รวม VAT)
        [c_detail]                  VARCHAR(500) NULL,     -- รายละเอียด

        [dc_cost_id]                BIGINT NULL,
        [i_enabled]                 TINYINT NOT NULL
            CONSTRAINT [DF_sp_tor_period_bill_i_enabled] DEFAULT (1),

        [dc_user_create_id]         BIGINT NULL,
        [dc_user_create_cost_id]    BIGINT NULL,
        [d_create]                  DATETIME NULL,
        [dc_user_update_id]         BIGINT NULL,
        [dc_user_update_cost_id]    BIGINT NULL,
        [d_update]                  DATETIME NULL
    );

    CREATE INDEX [IX_sp_tor_period_bill_hdr_id] ON [dbo].[sp_tor_period_bill] ([sp_tor_period_bill_hdr_id]);
    CREATE INDEX [IX_sp_tor_period_bill_contract] ON [dbo].[sp_tor_period_bill] ([sp_tor_contract_id]);
END
GO
