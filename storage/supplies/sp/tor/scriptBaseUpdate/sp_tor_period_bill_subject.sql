USE NMU_ERP;
GO

/*
 * เปลี่ยนรูปแบบรายการย่อยจาก "ใบส่งของ/ใบแจ้งหนี้" เป็น "PO ย่อย" ตามโครงสร้าง
 * หน้าต่าง "เพิ่มรายการ PO (สัญญาย่อย)" ของเมนู ST0009 (public/supplies/sp/tor/addPo.js)
 * ฟิลด์เดิม (c_doc_ref/d_doc_date/f_amt/c_detail) ใช้ซ้ำได้ทั้งหมด เพิ่มแค่ "เรื่อง"
 */
IF COL_LENGTH('dbo.sp_tor_period_bill', 'c_subject') IS NULL
BEGIN
    ALTER TABLE [dbo].[sp_tor_period_bill] ADD
        [c_subject] VARCHAR(500) NULL;  -- เรื่อง (ต่อรายการ PO ย่อย)
END
GO
