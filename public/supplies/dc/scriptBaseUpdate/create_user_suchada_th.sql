/* ============================================================================
   create_user_suchada_th.sql   รันด้วย sqlcmd -I หรือ SSMS (ต่อเซิร์ฟเวอร์เดียวกับ 3 ฐาน)

   สร้าง user suchada.th@nmu.ac.th  (รหัสผ่าน = suchada.th@nmu.ac.th เก็บแบบ MD5 ตามระบบ)
   เจ้าของ: นางสาวสุชาดา ธนภัทร์กวิน  dc_emp_id 20712  หน่วยงาน dc_cost_id 50 (เภสัช)
   - ไม่แก้ user เดิมของคนนี้ (60644 / username 12390)
   - สร้าง dc_user ใน NMU_ERP และ NMU_DATACENTER ด้วย dc_user_id เดียวกัน
     (เลข = MAX ของสองฐาน + 1)
   - คัดลอกเมนูจาก jitsomanus@nmu.ac.th ไปที่ dc_user_menu ของ NMU_ERP และ NMU_EIS
   - รันซ้ำได้ (ไม่สร้างซ้ำ / ไม่เพิ่มเมนูซ้ำ)

   @apply = 0 : ดูอย่างเดียว (ค่าเริ่มต้น)    @apply = 1 : ทำจริง
   ย้อนกลับ: ดูท้ายไฟล์
   ============================================================================ */
SET NOCOUNT ON;
DECLARE @apply BIT = 0;   -- 0 = ดูอย่างเดียว, 1 = ทำจริง

DECLARE @uname VARCHAR(50) = 'suchada.th@nmu.ac.th';
DECLARE @pwd   VARCHAR(50) = CONVERT(VARCHAR(32), HASHBYTES('MD5', @uname), 2);   -- md5 ตัวพิมพ์เล็ก/ใหญ่ ให้ตรงรูปแบบเดิม
SET @pwd = LOWER(@pwd);
DECLARE @src INT = (SELECT TOP 1 dc_user_id FROM NMU_ERP.dbo.dc_user WHERE c_user_name = 'jitsomanus@nmu.ac.th');

IF @src IS NULL
BEGIN RAISERROR(N'ไม่พบ user ต้นแบบ jitsomanus@nmu.ac.th ใน NMU_ERP', 16, 1); RETURN; END
IF NOT EXISTS (SELECT 1 FROM NMU_ERP.dbo.dc_emp WHERE dc_emp_id = 20712)
BEGIN RAISERROR(N'ไม่พบ dc_emp_id 20712 ใน NMU_ERP.dbo.dc_emp (ตรวจชื่อพนักงาน)', 16, 1); RETURN; END

-- id ที่จะใช้: ถ้ามี user นี้อยู่แล้วใช้ id เดิม ไม่งั้น MAX+1 ของทั้งสองฐาน
DECLARE @newId BIGINT = (SELECT TOP 1 dc_user_id FROM NMU_ERP.dbo.dc_user WHERE c_user_name = @uname);
IF @newId IS NULL
    SET @newId = (SELECT MAX(x) FROM (SELECT MAX(dc_user_id) x FROM NMU_ERP.dbo.dc_user
                                      UNION ALL SELECT MAX(dc_user_id) FROM NMU_DATACENTER.dbo.dc_user) t) + 1;

SELECT @src AS src_user_id, @newId AS new_user_id, @uname AS username, @pwd AS md5_password;
SELECT 'ERP dc_user มีแล้ว'  AS chk, COUNT(*) AS n FROM NMU_ERP.dbo.dc_user        WHERE c_user_name = @uname
UNION ALL SELECT 'DATACENTER dc_user มีแล้ว', COUNT(*) FROM NMU_DATACENTER.dbo.dc_user WHERE c_user_name = @uname
UNION ALL SELECT 'ERP เมนูต้นแบบ', COUNT(*) FROM NMU_ERP.dbo.dc_user_menu WHERE dc_user_id = @src
UNION ALL SELECT 'EIS เมนูต้นแบบ', COUNT(*) FROM NMU_EIS.dbo.dc_user_menu WHERE dc_user_id = @src;

IF @apply = 0
BEGIN PRINT N'โหมดดูอย่างเดียว (@apply = 0) ยังไม่ได้แก้ข้อมูล'; RETURN; END

BEGIN TRY
    BEGIN TRAN;

    -- 1) dc_user ใน NMU_ERP
    IF NOT EXISTS (SELECT 1 FROM NMU_ERP.dbo.dc_user WHERE c_user_name = @uname)
    BEGIN
        SET IDENTITY_INSERT NMU_ERP.dbo.dc_user ON;
        INSERT INTO NMU_ERP.dbo.dc_user (dc_user_id, dc_emp_id, dc_cost_id, dc_menu_hdr_id, c_user_name, c_password, c_full_name,
               c_comment, i_type_user, i_enable, i_delete, dc_user_create_id, dc_user_create_cost_id, d_create,
               dc_user_update_id, dc_user_update_cost_id, d_update)
        SELECT @newId, 20712, 50, dc_menu_hdr_id, @uname, @pwd, N'นางสาวสุชาดา ธนภัทร์กวิน',
               NULL, i_type_user, 1, i_delete, 1, 3, GETDATE(), 1, 3, GETDATE()
        FROM NMU_ERP.dbo.dc_user WHERE dc_user_id = @src;
        SET IDENTITY_INSERT NMU_ERP.dbo.dc_user OFF;
    END

    -- 2) dc_user ใน NMU_DATACENTER (id เดียวกัน)
    IF NOT EXISTS (SELECT 1 FROM NMU_DATACENTER.dbo.dc_user WHERE c_user_name = @uname)
    BEGIN
        SET IDENTITY_INSERT NMU_DATACENTER.dbo.dc_user ON;
        INSERT INTO NMU_DATACENTER.dbo.dc_user (dc_user_id, dc_emp_id, dc_cost_id, dc_menu_hdr_id, c_user_name, c_password, c_full_name,
               c_comment, i_type_user, i_enable, i_delete, dc_user_create_id, dc_user_create_cost_id, d_create,
               dc_user_update_id, dc_user_update_cost_id, d_update)
        SELECT @newId, 20712, 50, dc_menu_hdr_id, @uname, @pwd, N'นางสาวสุชาดา ธนภัทร์กวิน',
               NULL, i_type_user, 1, i_delete, 1, 3, GETDATE(), 1, 3, GETDATE()
        FROM NMU_DATACENTER.dbo.dc_user WHERE dc_user_id = @src;
        SET IDENTITY_INSERT NMU_DATACENTER.dbo.dc_user OFF;
    END

    -- 3) เมนู NMU_ERP (เฉพาะที่ยังไม่มี)
    INSERT INTO NMU_ERP.dbo.dc_user_menu (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all,
                                          i_read_overall, i_per_add, i_per_update, i_per_delete)
    SELECT @newId, s.dc_menu_id, s.dc_menu_hdr_id, s.i_show, s.i_read_self, s.i_read_cost, s.i_read_all,
           s.i_read_overall, s.i_per_add, s.i_per_update, s.i_per_delete
    FROM NMU_ERP.dbo.dc_user_menu s
    WHERE s.dc_user_id = @src
      AND NOT EXISTS (SELECT 1 FROM NMU_ERP.dbo.dc_user_menu t WHERE t.dc_user_id = @newId AND t.dc_menu_id = s.dc_menu_id);
    SELECT @@ROWCOUNT AS erp_menus_added;

    -- 4) เมนู NMU_EIS (เฉพาะที่ยังไม่มี)
    INSERT INTO NMU_EIS.dbo.dc_user_menu (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all,
                                          i_read_overall, i_per_add, i_per_update, i_per_delete)
    SELECT @newId, s.dc_menu_id, s.dc_menu_hdr_id, s.i_show, s.i_read_self, s.i_read_cost, s.i_read_all,
           s.i_read_overall, s.i_per_add, s.i_per_update, s.i_per_delete
    FROM NMU_EIS.dbo.dc_user_menu s
    WHERE s.dc_user_id = @src
      AND NOT EXISTS (SELECT 1 FROM NMU_EIS.dbo.dc_user_menu t WHERE t.dc_user_id = @newId AND t.dc_menu_id = s.dc_menu_id);
    SELECT @@ROWCOUNT AS eis_menus_added;

    COMMIT TRAN;
    SELECT N'สำเร็จ' AS result, @newId AS new_user_id;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    SELECT N'ไม่สำเร็จ ย้อนกลับแล้ว: ' + ERROR_MESSAGE() AS err;
END CATCH

/* ---------- ย้อนกลับ (ถ้าจำเป็น) ----------
DECLARE @id BIGINT = (SELECT dc_user_id FROM NMU_ERP.dbo.dc_user WHERE c_user_name = 'suchada.th@nmu.ac.th');
DELETE FROM NMU_ERP.dbo.dc_user_menu WHERE dc_user_id = @id;
DELETE FROM NMU_EIS.dbo.dc_user_menu WHERE dc_user_id = @id;
DELETE FROM NMU_ERP.dbo.dc_user        WHERE dc_user_id = @id;
DELETE FROM NMU_DATACENTER.dbo.dc_user WHERE dc_user_id = @id;
*/
