USE NMU_ERP;
GO

/*
 * ลงทะเบียนหน้า "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" เป็นรหัส ST00092
 * (ตัวแปรย่อยของ ST0009 "บันทึกรายละเอียดในสัญญา" เหมือนที่ ST00091
 * "ขยายสัญญา/ยกเลิก/ปิด" เป็นตัวแปรย่อยอยู่แล้ว)
 *
 * ใช้หน้า loader เดิม public/supplies/sp/contract.php (generic ตาม st= code)
 * เพียงเพิ่มคอลัมน์ js ใหม่ชี้ไปที่ public/supplies/sp/tor/medSupPeriodBill.js
 */
-- หมายเหตุ: c_name ของตาราง sp_status_hdr เป็น VARCHAR collation Thai_CI_AS (codepage 874)
-- ใช้ CONVERT จาก hex literal แทนตัวอักษรไทยตรงๆ ในไฟล์ .sql เพื่อกันปัญหาไฟล์/console
-- ถูกอ่านผิด encoding แล้วข้อความไทยเพี้ยนตอน insert (เจอปัญหานี้จริงตอนรันครั้งแรก)
-- ข้อความคือ: "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)"
DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xBAD1B9B7D6A1C3D2C2C5D0E0CDD5C2B4E3B9CAD1ADADD22028E0C7AAC0D1B3B1EC29);

IF NOT EXISTS (SELECT 1 FROM [dbo].[sp_status_hdr] WHERE [c_code] = 'ST00092')
BEGIN
    INSERT INTO [dbo].[sp_status_hdr]
    (
        sp_type_status_id, c_code, c_name,
        i_entrance, i_alarm, i_day, i_config, i_before,
        i_seq, i_seq_type, js, code_tomenu,
        i_enabled, dc_user_create_id, dc_user_create_cost_id, d_create
    )
    VALUES
    (
        5, 'ST00092', @c_name,
        3, 3, 4, 3, 24,
        4, 1, 'medSupPeriodBill', 'ST00092',
        1, 1, 1, GETDATE()
    );
END
GO

SELECT sp_status_hdr_id, c_code, c_name, js FROM [dbo].[sp_status_hdr] WHERE c_code = 'ST00092';
GO
