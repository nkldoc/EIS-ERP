USE NMU_ERP;
GO

/*
 * ผูก "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)" (ST00093) เข้ากับสัญญา/งวด
 * เดียวกับ "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092) ตามที่ตกลงเพิ่มเติม
 * (ตอนแรกสร้างแยกอิสระ แต่พบว่าไฟล์ออกแบบต้นฉบับต้องการให้ผูกกัน)
 *
 * 1) เพิ่มคอลัมน์อ้างอิงสัญญา/งวด ให้ sp_medsup_purchase_track
 * 2) สร้างตารางเชื่อม sp_medsup_purchase_track_bill สำหรับเลือกรายการบิล
 *    (จาก sp_tor_period_bill) ที่เกี่ยวข้องกับการติดตามจัดซื้อรายการนี้ได้หลายรายการ
 */
IF COL_LENGTH('dbo.sp_medsup_purchase_track', 'sp_tor_contract_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_medsup_purchase_track] ADD
        [sp_tor_contract_id]   BIGINT NULL,
        [sp_tor_hdr_period_id] BIGINT NULL,
        [c_contract_code]      VARCHAR(100) NULL,
        [i_period]             INT NULL;
END
GO

IF OBJECT_ID(N'[dbo].[sp_medsup_purchase_track_bill]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_medsup_purchase_track_bill]
    (
        [sp_medsup_purchase_track_bill_id] BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT [PK_sp_medsup_purchase_track_bill] PRIMARY KEY,
        [sp_medsup_purchase_track_id]      BIGINT NOT NULL,   -- FK -> sp_medsup_purchase_track
        [sp_tor_period_bill_id]            BIGINT NOT NULL,   -- FK -> sp_tor_period_bill (ST00092)
        [d_create]                         DATETIME NULL,
        [dc_user_create_id]                BIGINT NULL
    );

    CREATE INDEX [IX_sp_medsup_purchase_track_bill_track] ON [dbo].[sp_medsup_purchase_track_bill] ([sp_medsup_purchase_track_id]);
    CREATE INDEX [IX_sp_medsup_purchase_track_bill_bill] ON [dbo].[sp_medsup_purchase_track_bill] ([sp_tor_period_bill_id]);
END
GO
