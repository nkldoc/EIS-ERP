USE NMU_ERP;
GO

/*
 * ตารางบันทึกรายการ "รับของ" ย่อยของแต่ละงวด (sp_tor_period_bill) สำหรับเมนู
 * "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - 1 งวดอาจได้รับของทยอยหลายครั้ง (หลายแถว) เช่น
 * งวดที่มีจำนวนเงินรวม 100 บาท อาจรับของมา 5 ชิ้น ชิ้นละ 20 บาท แยกเป็นหลายแถว
 *
 * c_ap_code/d_ap_issue = เลขที่ AP ที่ออกให้ (จำลอง/mock ไปก่อน ยังไม่เชื่อม API จริง)
 * รูปแบบเลข "APMS-000001" (APMS = เวชภัณฑ์ ตาม convention เดียวกับที่อื่นในระบบ เช่น
 * displayfield "ประเภท: APMS - เวชภัณฑ์" ในฟอร์มเมนู ST00092) - ค่อยไปผูกกับ API ออกเลข
 * AP จริงทีหลัง ตอนนี้แค่ generate โค้ดจำลองแล้วปั๊มวันที่ออกไว้ก่อน
 */
IF OBJECT_ID(N'[dbo].[sp_tor_period_bill_receive]', N'U') IS NULL
BEGIN
    CREATE TABLE [dbo].[sp_tor_period_bill_receive]
    (
        [sp_tor_period_bill_receive_id] BIGINT IDENTITY(1,1) NOT NULL
            CONSTRAINT [PK_sp_tor_period_bill_receive] PRIMARY KEY,
        [sp_tor_period_bill_id]         BIGINT NOT NULL,       -- FK -> sp_tor_period_bill (งวดที่รับของนี้ผูกอยู่)

        [c_receive_code]                VARCHAR(100) NULL,     -- เลขที่รับของ
        [d_receive_date]                DATE NULL,             -- วันรับของ
        [c_detail]                      VARCHAR(500) NULL,     -- รายละเอียด
        [f_amt]                         DECIMAL(18, 2) NULL,   -- จำนวนเงิน

        [c_ap_code]                     VARCHAR(50) NULL,      -- เลขที่ AP ที่ออกให้ (mock)
        [d_ap_issue]                    DATETIME NULL,         -- วันที่ออกเลข AP

        [i_enabled]                     TINYINT NOT NULL
            CONSTRAINT [DF_sp_tor_period_bill_receive_i_enabled] DEFAULT (1),

        [dc_user_create_id]             BIGINT NULL,
        [dc_user_create_cost_id]        BIGINT NULL,
        [d_create]                      DATETIME NULL,
        [dc_user_update_id]             BIGINT NULL,
        [dc_user_update_cost_id]        BIGINT NULL,
        [d_update]                      DATETIME NULL
    );

    CREATE INDEX [IX_sp_tor_period_bill_receive_period_id] ON [dbo].[sp_tor_period_bill_receive] ([sp_tor_period_bill_id]);
END
GO
