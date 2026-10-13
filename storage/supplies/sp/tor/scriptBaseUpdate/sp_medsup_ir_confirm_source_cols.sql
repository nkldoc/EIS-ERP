USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์อ้างอิงที่มาของข้อมูล ให้ sp_medsup_ir_confirm_hdr
 *
 * เปลี่ยนแนวทางจาก "คีย์ข้อมูลด้วยมือ" เป็น "โหลดข้อมูลจาก log การเรียก API
 * /procure/ir ที่ ERP ยิงเข้ามาจริง" (ไฟล์ log อยู่ที่ D:\EIS-ERP\storage\jsonERP\
 * *.log บรรทัดละ 1 JSON object taken จาก transaction logger ของ endpoint)
 * ผู้ใช้กด "ยืนยัน" เพื่อ "รับข้อมูล" รายการที่ตรวจสอบแล้วว่ามาจาก ERP จริง
 * (username = erpsendapi) เข้ามาบันทึกไว้ในตารางนี้ - ใช้ 3 คอลัมน์นี้ทั้งเป็น
 * ข้อมูลอ้างอิงและกันการยืนยันซ้ำ (ดูคู่กับเงื่อนไข pr_id/po_id/chk_id/c_arrive_code
 * ที่ใช้ตรวจสอบความซ้ำจริงฝั่ง PHP)
 */
IF COL_LENGTH('dbo.sp_medsup_ir_confirm_hdr', 'c_transaction_id') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_medsup_ir_confirm_hdr] ADD
        [c_transaction_id]  VARCHAR(100) NULL,   -- transaction_id จาก log (เรียกครั้งที่ถูกนำมายืนยัน)
        [d_source_datetime] DATETIME NULL,        -- datetime ที่ ERP ยิงเข้ามาจริง (จาก log)
        [c_source_file]     VARCHAR(200) NULL;    -- ชื่อไฟล์ log ที่พบรายการนี้ (เพื่อตรวจสอบย้อนหลัง)

    CREATE INDEX [IX_sp_medsup_ir_confirm_hdr_source_key]
        ON [dbo].[sp_medsup_ir_confirm_hdr] ([pr_id], [po_id], [chk_id], [c_arrive_code]);
END
GO
