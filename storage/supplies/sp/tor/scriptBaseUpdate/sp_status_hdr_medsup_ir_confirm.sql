USE NMU_ERP;
GO

/*
 * ลงทะเบียนหน้า "ยืนยันรายการ Api จัดซื้อจาก ERP" เป็นรหัส ST00094
 * ต่อจาก ST00093 "บันทึกติดตามการจัดซื้อ (เวชภัณฑ์)" ในหมวดเดียวกัน
 * ใช้หน้า loader เดิม public/supplies/sp/contract.php (generic ตาม st= code)
 */
-- หมายเหตุ: c_name เป็น VARCHAR collation Thai_CI_AS (codepage 874) ใช้ hex literal
-- กันปัญหาไฟล์/console encoding ทำข้อความไทยเพี้ยนตอน insert (เจอปัญหานี้มาแล้วรอบก่อน)
-- ข้อความคือ: "ยืนยันรายการ Api จัดซื้อจาก ERP"
DECLARE @c_name VARCHAR(250) = CONVERT(VARCHAR(250), 0xC2D7B9C2D1B9C3D2C2A1D2C32041706920A8D1B4ABD7E9CDA8D2A120455250);

IF NOT EXISTS (SELECT 1 FROM [dbo].[sp_status_hdr] WHERE [c_code] = 'ST00094')
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
        5, 'ST00094', @c_name,
        3, 3, 4, 3, 24,
        5, 1, 'medSupIrConfirm', 'ST00094',
        1, 1, 1, GETDATE()
    );
END
GO

SELECT sp_status_hdr_id, c_code, c_name, js FROM [dbo].[sp_status_hdr] WHERE c_code = 'ST00094';
GO
