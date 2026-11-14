/* ============================================================================
   sync_menu_suchada_th_like_kanyanee.sql  (ฐาน NMU_ERP)  รันต่อจาก create_user_suchada_th.sql

   ให้เมนู ERP (supplies) ของ suchada.th@nmu.ac.th เหมือน kanyanee@nmu.ac.th ทุกเมนู/ทุกสิทธิ์
   - เพิ่มเมนูที่ kanyanee มี แต่ suchada.th ยังไม่มี (เช่น 10646, 150820 ผู้ขอเบิกลงนาม EIS)
   - ปรับค่าสิทธิ์ของเมนูที่มีอยู่ให้ตรงกับ kanyanee (เช่น i_read_cost)
   - ไม่ลบเมนูของ suchada.th (ถ้ามีเมนูที่ kanyanee ไม่มี จะแสดงให้ดูใน SELECT สุดท้าย)
   - หน่วยงานของ suchada.th ต้องเป็น 50 (เภสัช) ไม่ใช่ 82 ของ kanyanee: สคริปต์นี้ไม่แตะ dc_cost_id
     และบังคับตรวจว่า dc_user.dc_cost_id ของ suchada.th = 50 (ถ้าไม่ใช่ จะ UPDATE เป็น 50 เมื่อ @apply = 1)
   สำรองเมนูเดิมที่ dbo.bak_dc_user_menu_suchada_20261114   รันซ้ำได้
   @apply = 0 ดูอย่างเดียว (ค่าเริ่มต้น)   @apply = 1 ทำจริง
   ============================================================================ */
USE NMU_ERP;
SET NOCOUNT ON;
DECLARE @apply BIT = 0;

DECLARE @src INT = (SELECT TOP 1 dc_user_id FROM dbo.dc_user WHERE c_user_name = 'kanyanee@nmu.ac.th');
DECLARE @dst INT = (SELECT TOP 1 dc_user_id FROM dbo.dc_user WHERE c_user_name = 'suchada.th@nmu.ac.th');
IF @src IS NULL OR @dst IS NULL
BEGIN RAISERROR(N'ไม่พบ kanyanee@nmu.ac.th หรือ suchada.th@nmu.ac.th (ต้องรัน create_user_suchada_th.sql ก่อน)', 16, 1); RETURN; END

SELECT @src AS src_user_id, @dst AS dst_user_id;
SELECT u.c_user_name, u.dc_emp_id, u.dc_cost_id AS dc_cost_id_ปัจจุบัน, N'ต้องเป็น 50 (เภสัช)' AS หมายเหตุ
FROM dbo.dc_user u WHERE u.dc_user_id = @dst;

-- 1) เมนูที่จะเพิ่ม
SELECT N'เพิ่ม' AS act, m.dc_menu_id, m.c_filelocation, m.c_name, s.i_show, s.i_read_self, s.i_read_cost, s.i_per_add
FROM dbo.dc_user_menu s LEFT JOIN dbo.dc_menu m ON m.dc_menu_id = s.dc_menu_id
WHERE s.dc_user_id = @src
  AND NOT EXISTS (SELECT 1 FROM dbo.dc_user_menu t WHERE t.dc_user_id = @dst AND t.dc_menu_id = s.dc_menu_id)
ORDER BY s.dc_menu_id;

-- 2) เมนูที่มีแล้วแต่ค่าสิทธิ์ต่างจาก kanyanee (จะปรับให้ตรง)
SELECT N'ปรับสิทธิ์' AS act, m.dc_menu_id, m.c_name,
       t.i_read_cost AS cost_เดิม, s.i_read_cost AS cost_ใหม่, t.i_read_self AS self_เดิม, s.i_read_self AS self_ใหม่,
       t.i_read_all AS all_เดิม, s.i_read_all AS all_ใหม่, t.i_per_add AS add_เดิม, s.i_per_add AS add_ใหม่
FROM dbo.dc_user_menu s
JOIN dbo.dc_user_menu t ON t.dc_user_id = @dst AND t.dc_menu_id = s.dc_menu_id
LEFT JOIN dbo.dc_menu m ON m.dc_menu_id = s.dc_menu_id
WHERE s.dc_user_id = @src
  AND (ISNULL(t.i_show,99) <> ISNULL(s.i_show,99) OR ISNULL(t.i_read_self,99) <> ISNULL(s.i_read_self,99)
    OR ISNULL(t.i_read_cost,99) <> ISNULL(s.i_read_cost,99) OR ISNULL(t.i_read_all,99) <> ISNULL(s.i_read_all,99)
    OR ISNULL(t.i_read_overall,99) <> ISNULL(s.i_read_overall,99) OR ISNULL(t.i_per_add,99) <> ISNULL(s.i_per_add,99)
    OR ISNULL(t.i_per_update,99) <> ISNULL(s.i_per_update,99) OR ISNULL(t.i_per_delete,99) <> ISNULL(s.i_per_delete,99)
    OR ISNULL(t.dc_menu_hdr_id,99) <> ISNULL(s.dc_menu_hdr_id,99))
ORDER BY s.dc_menu_id;

-- 3) เมนูที่ suchada.th มีแต่ kanyanee ไม่มี (ไม่ลบ แค่แจ้ง)
SELECT N'เกินจาก kanyanee (ไม่ลบ)' AS act, m.dc_menu_id, m.c_name
FROM dbo.dc_user_menu t LEFT JOIN dbo.dc_menu m ON m.dc_menu_id = t.dc_menu_id
WHERE t.dc_user_id = @dst
  AND NOT EXISTS (SELECT 1 FROM dbo.dc_user_menu s WHERE s.dc_user_id = @src AND s.dc_menu_id = t.dc_menu_id);

IF @apply = 0 BEGIN PRINT N'โหมดดูอย่างเดียว (@apply = 0) ยังไม่ได้แก้ข้อมูล'; RETURN; END

IF OBJECT_ID('dbo.bak_dc_user_menu_suchada_20261114') IS NULL
    SELECT * INTO dbo.bak_dc_user_menu_suchada_20261114 FROM dbo.dc_user_menu WHERE dc_user_id = @dst;

BEGIN TRY
    BEGIN TRAN;

    UPDATE dbo.dc_user SET dc_cost_id = 50 WHERE dc_user_id = @dst AND ISNULL(dc_cost_id,0) <> 50;

    INSERT INTO dbo.dc_user_menu (dc_user_id, dc_menu_id, dc_menu_hdr_id, i_show, i_read_self, i_read_cost, i_read_all,
                                  i_read_overall, i_per_add, i_per_update, i_per_delete)
    SELECT @dst, s.dc_menu_id, s.dc_menu_hdr_id, s.i_show, s.i_read_self, s.i_read_cost, s.i_read_all,
           s.i_read_overall, s.i_per_add, s.i_per_update, s.i_per_delete
    FROM dbo.dc_user_menu s
    WHERE s.dc_user_id = @src
      AND NOT EXISTS (SELECT 1 FROM dbo.dc_user_menu t WHERE t.dc_user_id = @dst AND t.dc_menu_id = s.dc_menu_id);
    SELECT @@ROWCOUNT AS menus_added;

    UPDATE t SET t.dc_menu_hdr_id = s.dc_menu_hdr_id, t.i_show = s.i_show, t.i_read_self = s.i_read_self,
                 t.i_read_cost = s.i_read_cost, t.i_read_all = s.i_read_all, t.i_read_overall = s.i_read_overall,
                 t.i_per_add = s.i_per_add, t.i_per_update = s.i_per_update, t.i_per_delete = s.i_per_delete
    FROM dbo.dc_user_menu t
    JOIN dbo.dc_user_menu s ON s.dc_user_id = @src AND s.dc_menu_id = t.dc_menu_id
    WHERE t.dc_user_id = @dst;
    SELECT @@ROWCOUNT AS menus_synced;

    COMMIT TRAN;
    SELECT N'สำเร็จ' AS result, COUNT(*) AS total_menus FROM dbo.dc_user_menu WHERE dc_user_id = @dst;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    SELECT N'ไม่สำเร็จ ย้อนกลับแล้ว: ' + ERROR_MESSAGE() AS err;
END CATCH

/* ย้อนกลับ:
DELETE FROM NMU_ERP.dbo.dc_user_menu WHERE dc_user_id = (SELECT dc_user_id FROM NMU_ERP.dbo.dc_user WHERE c_user_name='suchada.th@nmu.ac.th');
INSERT INTO NMU_ERP.dbo.dc_user_menu SELECT * FROM NMU_ERP.dbo.bak_dc_user_menu_suchada_20261114;
*/
