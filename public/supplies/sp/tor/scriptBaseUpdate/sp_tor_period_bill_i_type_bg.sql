USE NMU_ERP;
GO

/*
 * เพิ่มคอลัมน์ i_type_bg ในตาราง sp_tor_period_bill - เก็บ "ประเภท PR" ที่เลือกตอน
 * สร้าง PR ผ่านเมนู "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" (regTorMedSup.js) อ้างอิงจาก
 * master table dbo.sp_type_bg ตัวเดียวกับที่เมนู PR ทั่วไป (regTor.js) ใช้อยู่แล้ว
 * (โหลดผ่าน api/All_spAlert.php?type=sp_type_bg) ค่าเริ่มต้น sp_type_bg_id=1 = "PR ปกติ"
 *
 * หมายเหตุ: flow เวชภัณฑ์นี้ยังไม่มี logic การจองเงินผ่าน AP-API แบบเดียวกับเมนู PR
 * ทั่วไป (ที่ประเภทต่างๆ เช่น "จองเงินข้ามส่งเบิก" มีผลจริง) เก็บค่านี้ไว้เพื่อความ
 * ครบถ้วนของฟอร์ม/รายงานในอนาคตเท่านั้น ไม่ได้ใช้แตกเงื่อนไขอะไรในโค้ดตอนนี้
 */
IF NOT EXISTS (
    SELECT 1 FROM sys.columns
    WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'i_type_bg'
)
BEGIN
    ALTER TABLE NMU_ERP.dbo.sp_tor_period_bill ADD i_type_bg TINYINT NULL;
END
GO

SELECT name FROM sys.columns WHERE object_id = OBJECT_ID('NMU_ERP.dbo.sp_tor_period_bill') AND name = 'i_type_bg';
GO
