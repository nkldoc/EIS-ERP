USE NMU_ERP;
GO

/*
 * ตารางบันทึกติดตามการจัดซื้อเวชภัณฑ์ (คีย์ข้อมูลด้วยมือตามเอกสาร)
 * สำหรับเมนู "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)" (ST00093)
 * ต่อจากเมนู "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092) แต่เป็นเมนูแยกอิสระ
 * ไม่ผูกกับตารางสัญญา/PR/PO เดิมของระบบ ตามที่ตกลงกันไว้
 *
 * แบ่งเป็น 5 ส่วนตามลำดับขั้นตอนงานจริง (อ้างอิงจากไฟล์ออกแบบฟอร์ม):
 *   1) ใบขอซื้อ  2) การอนุมัติ  3) ใบสั่งซื้อและผู้ขาย  4) การเบิกจ่าย  5) ข้อมูลอ้างอิงเพิ่มเติม
 *
 * หมายเหตุ: เลขที่ขอเบิก และ เลขที่บิล เก็บเป็น text ธรรมดา (คั่นด้วย " / " ได้ตามที่คีย์)
 * ตามข้อมูลตัวอย่างจริงที่พบ ไม่ทำเป็น repeatable table แยก เพื่อความเร็วในการคีย์ข้อมูลด้วยมือ
 */
IF OBJECT_ID(N'[dbo].[sp_medsup_purchase_track]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_medsup_purchase_track]
    (
        [sp_medsup_purchase_track_id] BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT [PK_sp_medsup_purchase_track] PRIMARY KEY,

        -- 1) ใบขอซื้อ
        [c_user_name]           VARCHAR(200) NULL,   -- ผู้ใช้
        [c_pr_no]                VARCHAR(100) NULL,   -- เลขรายงานขอซื้อ
        [d_pr_date]              DATE NULL,           -- วันที่
        [f_pr_amt]               DECIMAL(18, 2) NULL, -- วงเงินขอใช้
        [f_remain_all]           DECIMAL(18, 2) NULL, -- คงเหลือทั้งหมด

        -- 2) การอนุมัติ
        [c_approve_no]           VARCHAR(100) NULL,   -- เลขที่อนุมัติ
        [d_approve_date]         DATE NULL,           -- วันที่อนุมัติ

        -- 3) ใบสั่งซื้อและผู้ขาย
        [c_po_no]                VARCHAR(100) NULL,   -- PO
        [d_po_date]              DATE NULL,           -- วันที่ PO
        [dc_creditor_id]         BIGINT NULL,         -- ผู้ขาย -> NMU.dbo.dc_creditor
        [c_creditor_name]        VARCHAR(250) NULL,   -- ชื่อผู้ขาย (denormalized)
        [c_creditor_tax_no]      VARCHAR(50) NULL,    -- เลขประจำตัวผู้เสียภาษี (denormalized)
        [d_due_date]             DATE NULL,           -- วันครบกำหนดส่งของ
        [d_receive_date]         DATE NULL,           -- วันที่ตรวจรับ

        -- 4) การเบิกจ่าย
        [d_withdraw_send_date]   DATE NULL,           -- วันที่ส่งเบิก
        [c_withdraw_no]          VARCHAR(300) NULL,   -- เลขที่ขอเบิก (คั่นด้วย /)
        [f_withdraw_amt]         DECIMAL(18, 2) NULL, -- วงเงินขอเบิก
        [f_remain_after_withdraw] DECIMAL(18, 2) NULL, -- เงินเหลือจากขอใช้

        -- 5) ข้อมูลอ้างอิงเพิ่มเติม
        [c_reserve_no]           VARCHAR(100) NULL,   -- เลขกันเงิน
        [i_working_day]          INT NULL,            -- ระยะเวลาดำเนินการ (วันทำการ)
        [c_project_no]           VARCHAR(100) NULL,   -- เลขโครงการ
        [c_bill_no]              VARCHAR(300) NULL,   -- เลขที่บิล (คั่นด้วย /)
        [c_item_name]            VARCHAR(500) NULL,   -- ชื่อรายการ

        [i_enabled]              TINYINT NOT NULL
            CONSTRAINT [DF_sp_medsup_purchase_track_i_enabled] DEFAULT (1),

        [dc_cost_id]             BIGINT NULL,
        [dc_user_create_id]      BIGINT NULL,
        [dc_user_create_cost_id] BIGINT NULL,
        [d_create]               DATETIME NULL,
        [dc_user_update_id]      BIGINT NULL,
        [dc_user_update_cost_id] BIGINT NULL,
        [d_update]               DATETIME NULL
    );
END
GO
