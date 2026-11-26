-- เพิ่มคอลัมน์ "โดยมอบให้" (ผู้รับเงิน) ที่งวดเวชภัณฑ์/เภสัช: ใบเบิก EIS จะใช้เป็น "โดยมอบให้" + บัญชีธนาคารของผู้รับเงิน
-- ว่าง (NULL) = จ่ายให้เจ้าหนี้ของสัญญาเหมือนเดิม  รันซ้ำได้
USE NMU_ERP;
IF COL_LENGTH('dbo.sp_tor_period_bill', 'dc_creditor_transfer_id') IS NULL
    ALTER TABLE dbo.sp_tor_period_bill ADD dc_creditor_transfer_id INT NULL;
