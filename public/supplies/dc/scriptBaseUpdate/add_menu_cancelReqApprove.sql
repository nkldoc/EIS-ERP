/* ============================================================================
   add_menu_cancelReqApprove.sql  (NMU_ERP)  รันได้ซ้ำ (ไม่เพิ่มซ้ำ)
   เพิ่มเมนู "อนุมัติยกเลิก PR" (หน้า sp/cancelReqApprove.php) และให้สิทธิ์ผู้ใช้ จัดสรรงบประมาณพัสดุ (dc_user_id 60104)
   รหัสเมนู = กลุ่มบนสุดถัดไปของหมวด 05 (หมวดพัสดุ) ; สิทธิ์ copy รูปแบบจากเมนูจัดสรรเงินงบประมาณ (sp-repSpTorEditBg ของ 60104)
   ============================================================================ */
USE NMU_ERP;
SET NOCOUNT ON;

DECLARE @file NVARCHAR(200) = N'sp-cancelReqApprove';
DECLARE @menu_id INT = (SELECT TOP 1 dc_menu_id FROM dbo.dc_menu WHERE c_filelocation = @file AND i_delete = 2);

IF @menu_id IS NULL
BEGIN
    DECLARE @next INT = (SELECT MAX(CAST(SUBSTRING(c_code, 3, 2) AS INT)) + 1 FROM dbo.dc_menu WHERE c_code LIKE '05%' AND i_delete = 2);
    DECLARE @code VARCHAR(18) = '05' + RIGHT('00' + CAST(@next AS VARCHAR(2)), 2) + REPLICATE('0', 14);

    INSERT INTO dbo.dc_menu (c_filelocation, c_code, c_name, i_enable, i_delete, dc_user_create_id, dc_user_create_cost_id, d_create, dc_user_update_id, dc_user_update_cost_id, d_update)
    VALUES (@file, @code, N'อนุมัติยกเลิก PR', 1, 2, 1, 3, GETDATE(), 1, 3, GETDATE());
    SET @menu_id = SCOPE_IDENTITY();
    PRINT 'เพิ่มเมนู dc_menu_id = ' + CAST(@menu_id AS VARCHAR(10)) + ' c_code = ' + @code;
END

IF NOT EXISTS (SELECT 1 FROM dbo.dc_user_menu WHERE dc_user_id = 60104 AND dc_menu_id = @menu_id)
    INSERT INTO dbo.dc_user_menu (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all, i_read_overall, i_per_add, i_per_update, i_per_delete)
    VALUES (60104, @menu_id, 0, 1, 1, 1, 1, NULL, 1, 1, 0);

SELECT m.dc_menu_id, m.c_filelocation, m.c_code, m.c_name, u.dc_user_id, u.i_show
FROM dbo.dc_menu m LEFT JOIN dbo.dc_user_menu u ON u.dc_menu_id = m.dc_menu_id
WHERE m.dc_menu_id = @menu_id;
