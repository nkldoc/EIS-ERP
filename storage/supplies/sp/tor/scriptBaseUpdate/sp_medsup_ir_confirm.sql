USE NMU_ERP;
GO

/*
 * ตารางบันทึก "ยืนยันรายการ Api จัดซื้อจาก ERP" (คีย์ข้อมูลด้วยมือตามเอกสาร)
 * สำหรับเมนู "ยืนยันรายการ Api จัดซื้อจาก ERP" (ST00094) ต่อจากเมนู
 * "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)" (ST00093) แต่เป็นเมนูแยกอิสระ ไม่ผูกกับ
 * ตารางสัญญา/PR/PO/ตรวจรับเดิมของระบบ (ตามที่ตกลงกันไว้ เหมือน ST00092/ST00093)
 *
 * โครงสร้างฟิลด์อ้างอิงตาม Data Dictionary ของ AP-API ภายนอก (POST /procure/ir
 * ผู้ใช้ erpsendapi) - หน้าจอนี้ใช้สำหรับ "ยืนยัน/บันทึก" รายการที่จะส่งเท่านั้น
 * ยังไม่ได้เชื่อมต่อยิง API จริง (รอ spec/สิทธิ์เพิ่มเติมก่อนต่อยอด เหมือนกรณี
 * CANCEL_RESERVE_FUND_SOURCE ของเมนู ST00092)
 *
 * หัว (1 แถว) ต่อ 1 การยืนยัน/1 สัญญา-PR-PO และ line_ids (หลายแถว) ต่อ 1 หัว
 * เก็บรายการเอกสาร/งวดย่อยที่จะส่งไปพร้อมกัน
 */
IF OBJECT_ID(N'[dbo].[sp_medsup_ir_confirm_hdr]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_medsup_ir_confirm_hdr]
    (
        [sp_medsup_ir_confirm_hdr_id] BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT [PK_sp_medsup_ir_confirm_hdr] PRIMARY KEY,

        [pr_id]                       BIGINT NULL,           -- เลขที่ใบขอซื้อ (PR)
        [po_id]                       BIGINT NULL,           -- เลขที่ใบสั่งซื้อ (PO)
        [period_id]                   BIGINT NULL,           -- เลขที่งวดอ้างอิง (ตามเอกสาร)
        [chk_id]                      BIGINT NULL,           -- เลขที่ตรวจรับ (chk_id ตามเอกสาร)

        [c_contract_code]             VARCHAR(100) NULL,     -- เลขที่สัญญา
        [d_start_date]                DATE NULL,             -- วันที่เริ่มสัญญา
        [d_contract_start_date]       DATE NULL,             -- วันที่สัญญามีผล
        [d_end_date]                  DATE NULL,             -- วันที่สิ้นสุดสัญญา
        [i_period]                    INT NULL,              -- งวดที่ (0 = ไม่ผูกกับงวดใดงวดหนึ่ง)
        [f_period_amt]                DECIMAL(18, 2) NULL,   -- จำนวนเงินรวมของรายการนี้

        [bg_expense_id]               BIGINT NULL,           -- รหัสรายการย่อย (โครงการ)
        [bg_expense_name]             VARCHAR(300) NULL,     -- ชื่อรายการย่อย (โครงการ)
        [dc_expense_budget_type_id]   BIGINT NULL,           -- รหัสแหล่งเงิน
        [dc_expense_budget_type_name] VARCHAR(300) NULL,     -- ชื่อแหล่งเงิน
        [i_is_last]                   TINYINT NULL,          -- ปิดยอด/ไม่คืนเงินคงเหลือ
        [i_product_type]              INT NULL,              -- ประเภทสินค้า

        [dc_cost_id]                  BIGINT NULL,           -- หน่วยงาน
        [c_tax_number_imp]            VARCHAR(50) NULL,      -- เลขประจำตัวผู้เสียภาษีผู้ขาย
        [dc_creditor_id]              BIGINT NULL,           -- ผู้ขาย -> NMU.dbo.dc_creditor
        [c_creditor_name]             VARCHAR(250) NULL,     -- ชื่อผู้ขาย (denormalized)
        [c_creditor_transfer_code]    VARCHAR(50) NULL,      -- เลขประจำตัวผู้เสียภาษีผู้รับโอนเงิน
        [dc_creditor_transfer_id]     BIGINT NULL,           -- ผู้รับโอนเงิน -> NMU.dbo.dc_creditor
        [c_creditor_transfer_name]    VARCHAR(250) NULL,     -- ชื่อผู้รับโอนเงิน (denormalized)
        [c_bank_acc_creditor]         VARCHAR(250) NULL,     -- ธนาคารผู้รับโอนเงิน (ข้อความ)

        [i_budget_year]               VARCHAR(10) NULL,      -- ปีงบประมาณ
        [i_budget_year_overlap]       VARCHAR(10) NULL,      -- ปีงบประมาณที่กันเหลื่อมปี (ถ้ามี)

        [c_arrive_code]               VARCHAR(100) NULL,     -- เลขที่ใบรับของ
        [d_arrive_date]               DATE NULL,             -- วันที่รับของ
        [d_checking_date]             DATE NULL,             -- วันที่ตรวจรับ

        [c_reserve_pay]               VARCHAR(50) NULL,      -- i_reserve_pay ตามเอกสาร
        [c_doc_duo]                   VARCHAR(50) NULL,      -- i_doc_duo ตามเอกสาร
        [c_doc_ref]                   VARCHAR(100) NULL,     -- c_doc_ref ระดับหัวเรื่อง (เลขที่เอกสารอ้างอิง ถ้ามี)
        [c_overlap]                   VARCHAR(200) NULL,     -- หมายเหตุ/เลขที่กันเหลื่อมปี

        -- สถานะการส่ง - บันทึกไว้เผื่ออนาคตต่อ API จริง ตอนนี้ค่าเริ่มต้นคือแค่ "ยืนยันแล้ว"
        -- (ยังไม่ยิง) ตามที่ตกลงไว้ ไม่ได้เชื่อมต่อ AP_EIS_API_URL ในรอบนี้
        [c_ap_send_status]            VARCHAR(20) NOT NULL
            CONSTRAINT [DF_sp_medsup_ir_confirm_hdr_status] DEFAULT ('ยืนยันแล้ว'),

        [i_enabled]                   TINYINT NOT NULL
            CONSTRAINT [DF_sp_medsup_ir_confirm_hdr_i_enabled] DEFAULT (1),

        [dc_user_create_id]           BIGINT NULL,
        [dc_user_create_cost_id]      BIGINT NULL,
        [d_create]                    DATETIME NULL,
        [dc_user_update_id]           BIGINT NULL,
        [dc_user_update_cost_id]      BIGINT NULL,
        [d_update]                    DATETIME NULL
    );
END
GO

IF OBJECT_ID(N'[dbo].[sp_medsup_ir_confirm_dtl]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_medsup_ir_confirm_dtl]
    (
        [sp_medsup_ir_confirm_dtl_id] BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT [PK_sp_medsup_ir_confirm_dtl] PRIMARY KEY,
        [sp_medsup_ir_confirm_hdr_id] BIGINT NOT NULL,        -- FK -> sp_medsup_ir_confirm_hdr

        [chk_line_id]                 BIGINT NULL,            -- เลขที่รายการตรวจรับย่อย (chk_line_id ตามเอกสาร)
        [c_doc_ref]                   VARCHAR(100) NULL,      -- เลขที่เอกสารอ้างอิงของรายการย่อยนี้ (ถ้ามี)
        [d_doc_dateSub]               DATE NULL,              -- วันที่เอกสารย่อย
        [f_period_amt]                DECIMAL(18, 2) NULL,    -- จำนวนเงินของรายการย่อยนี้

        [d_create]                    DATETIME NULL,
        [dc_user_create_id]           BIGINT NULL
    );

    CREATE INDEX [IX_sp_medsup_ir_confirm_dtl_hdr] ON [dbo].[sp_medsup_ir_confirm_dtl] ([sp_medsup_ir_confirm_hdr_id]);
END
GO
