USE NMU_ERP;
GO

/*
 * ลงทะเบียนหน้า "ส่งมอบงาน (เวชภัณฑ์)" เป็นรหัส ST00095
 * (ตัวแปรย่อยของ ST0012 "ส่งมอบงาน" เฉพาะสัญญาที่บันทึกผ่านเมนู
 * "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" - อ่านจากตาราง sp_tor_period_bill โดยตรง
 * ไม่ใช่โฟลว์ sp_mn_contract_hdr ของ ST0012 เดิม)
 *
 * ใช้หน้า loader เดิม public/supplies/sp/contract.php (generic ตาม st= code)
 * เพียงเพิ่มคอลัมน์ js ใหม่ชี้ไปที่ public/supplies/sp/tor/deliverWorkMedSup.js
 */
-- หมายเหตุ: c_name เป็น VARCHAR collation Thai_CI_AS (codepage 874) ใช้ hex literal
-- กันปัญหาไฟล์/console encoding ทำข้อความไทยเพี้ยนตอน insert (เจอปัญหานี้มาแล้วรอบก่อน)
-- ข้อความคือ: "ส่งมอบงาน (เวชภัณฑ์)"
DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xCAE8A7C1CDBAA7D2B92028E0C7AAC0D1B3B1EC29);

IF NOT EXISTS (SELECT 1 FROM [dbo].[sp_status_hdr] WHERE [c_code] = 'ST00095')
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
        5, 'ST00095', @c_name,
        3, 3, 4, 3, 24,
        4, 1, 'deliverWorkMedSup', 'ST00095',
        1, 1, 1, GETDATE()
    );
END
GO

SELECT sp_status_hdr_id, c_code, c_name, js FROM [dbo].[sp_status_hdr] WHERE c_code = 'ST00095';
GO
