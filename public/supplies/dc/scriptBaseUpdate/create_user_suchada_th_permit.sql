/* ============================================================================
   create_user_suchada_th_permit.sql  (ฐาน NMU_DATACENTER)  รันต่อจาก create_user_suchada_th.sql

   เพิ่มสิทธิ์เข้าระบบหน้า "กรุณาเลือกระบบที่ท่านต้องการใช้งาน" (dc_user_permit)
   ให้ suchada.th@nmu.ac.th เหมือน jitsomanus@nmu.ac.th  (EIS = 1, SUPPLIES/V-PROCURE = 1)
   ไม่มีสิทธิ์นี้ หน้าเลือกระบบจะว่าง   รันซ้ำได้ (ไม่เพิ่มซ้ำ)
   @apply = 0 ดูอย่างเดียว (ค่าเริ่มต้น)   @apply = 1 ทำจริง
   ============================================================================ */
USE NMU_DATACENTER;
SET NOCOUNT ON;
DECLARE @apply BIT = 0;

DECLARE @src BIGINT = (SELECT TOP 1 dc_user_id FROM dbo.dc_user WHERE c_user_name = 'jitsomanus@nmu.ac.th');
DECLARE @dst BIGINT = (SELECT TOP 1 dc_user_id FROM dbo.dc_user WHERE c_user_name = 'suchada.th@nmu.ac.th');

IF @src IS NULL OR @dst IS NULL
BEGIN RAISERROR(N'ไม่พบ user ต้นแบบหรือ suchada.th@nmu.ac.th (ต้องรัน create_user_suchada_th.sql ก่อน)', 16, 1); RETURN; END

SELECT @src AS src_user_id, @dst AS dst_user_id;
SELECT N'ต้นแบบ' AS who, * FROM dbo.dc_user_permit WHERE dc_user_id = @src;
SELECT N'ปลายทางมีแล้ว' AS who, * FROM dbo.dc_user_permit WHERE dc_user_id = @dst;

IF @apply = 0 BEGIN PRINT N'โหมดดูอย่างเดียว (@apply = 0) ยังไม่ได้แก้ข้อมูล'; RETURN; END

IF NOT EXISTS (SELECT 1 FROM dbo.dc_user_permit WHERE dc_user_id = @dst)
BEGIN
    INSERT INTO dbo.dc_user_permit (dc_user_id, i_permit_eis, i_permit_nmu, i_permit_fm, i_permit_supplies, i_permit_procure)
    SELECT @dst, i_permit_eis, i_permit_nmu, i_permit_fm, i_permit_supplies, i_permit_procure
    FROM dbo.dc_user_permit WHERE dc_user_id = @src;
    SELECT @@ROWCOUNT AS permit_added;
END
ELSE SELECT N'มีสิทธิ์อยู่แล้ว ไม่เพิ่มซ้ำ' AS note;

/* ย้อนกลับ:
DELETE FROM NMU_DATACENTER.dbo.dc_user_permit
WHERE dc_user_id = (SELECT dc_user_id FROM NMU_DATACENTER.dbo.dc_user WHERE c_user_name = 'suchada.th@nmu.ac.th');
*/
