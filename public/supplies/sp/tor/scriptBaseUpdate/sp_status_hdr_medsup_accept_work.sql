USE NMU_ERP;
GO

/*
 * ลงทะเบียนหน้า "ตรวจรับ (เวชภัณฑ์)" เป็นรหัส ST00096
 * (คิวรอออกเลข AP ต่อจากเมนู "ส่งมอบงาน (เวชภัณฑ์)" ST00095 ที่ออกเลข IR ไว้แล้ว
 * อ่าน/เขียนตาราง sp_tor_period_bill_receive ตัวเดียวกัน)
 *
 * ใช้หน้า loader เดิม public/supplies/sp/contract.php (generic ตาม st= code)
 * เพียงเพิ่มคอลัมน์ js ใหม่ชี้ไปที่ public/supplies/sp/tor/acceptMedSup.js
 */
-- หมายเหตุ: c_name เป็น VARCHAR collation Thai_CI_AS (codepage 874) ใช้ hex literal
-- กันปัญหาไฟล์/console encoding ทำข้อความไทยเพี้ยนตอน insert (เจอปัญหานี้มาแล้วรอบก่อน)
-- ข้อความคือ: "ตรวจรับ (เวชภัณฑ์)"
DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xB5C3C7A8C3D1BA2028E0C7AAC0D1B3B1EC29);

IF NOT EXISTS (SELECT 1 FROM [dbo].[sp_status_hdr] WHERE [c_code] = 'ST00096')
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
        5, 'ST00096', @c_name,
        3, 3, 4, 3, 24,
        4, 1, 'acceptMedSup', 'ST00096',
        1, 1, 1, GETDATE()
    );
END
GO

SELECT sp_status_hdr_id, c_code, c_name, js FROM [dbo].[sp_status_hdr] WHERE c_code = 'ST00096';
GO
