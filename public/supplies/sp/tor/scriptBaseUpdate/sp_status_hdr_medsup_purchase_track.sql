USE NMU_ERP;
GO

/*
 * ลงทะเบียนหน้า "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)" เป็นรหัส ST00093
 * ต่อจาก ST00092 "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" ในหมวดเดียวกัน
 * ใช้หน้า loader เดิม public/supplies/sp/contract.php (generic ตาม st= code)
 */
-- หมายเหตุ: c_name เป็น VARCHAR collation Thai_CI_AS (codepage 874) ใช้ hex literal
-- กันปัญหาไฟล์/console encoding ทำข้อความไทยเพี้ยนตอน insert (เจอปัญหานี้มาแล้วรอบก่อน)
-- ข้อความคือ: "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)"
DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xBAD1B9B7D6A1B5D4B4B5D2C1A1D2C3A8D1B4ABD7E9CD2028E0C7AAC0D1B3B1EC29);

IF NOT EXISTS (SELECT 1 FROM [dbo].[sp_status_hdr] WHERE [c_code] = 'ST00093')
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
        5, 'ST00093', @c_name,
        3, 3, 4, 3, 24,
        4, 1, 'medSupPurchaseTrack', 'ST00093',
        1, 1, 1, GETDATE()
    );
END
GO

SELECT sp_status_hdr_id, c_code, c_name, js FROM [dbo].[sp_status_hdr] WHERE c_code = 'ST00093';
GO
