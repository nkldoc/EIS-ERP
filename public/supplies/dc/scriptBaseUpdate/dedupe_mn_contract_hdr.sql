/* ============================================================================
   dedupe_mn_contract_hdr.sql  (NMU_ERP)  รันด้วย sqlcmd -I

   ลบแถวซ้ำใน sp_mn_contract_hdr (ส่งมอบงาน) ที่ยังไม่ตรวจรับ (i_status_checking IS NULL)
   ที่เกิดจากการกดบันทึกซ้ำ โดยลบเฉพาะแถวที่ "ไม่มีข้อมูลอ้างอิงเลย" (ไม่มีงวดตรวจรับ/รายการ)
   แถวที่มีข้อมูลผูกอยู่จะไม่ถูกแตะ เก็บแถวที่มีข้อมูลผูกไว้ก่อนเสมอ

   @apply = 0 : นับอย่างเดียว (ค่าเริ่มต้น)   @apply = 1 : สำรองแล้วลบจริง
   สำรองไว้ที่ dbo.bak_dedupe_mn_contract_hdr_20261111
   ย้อนกลับ: INSERT INTO sp_mn_contract_hdr SELECT ... (ดูคอลัมน์จากตารางสำรอง) ด้วย SET IDENTITY_INSERT
   ============================================================================ */
USE NMU_ERP;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;

DECLARE @apply BIT = 0;

IF OBJECT_ID('tempdb..#cand') IS NOT NULL DROP TABLE #cand;

;WITH pending AS (
    SELECT s.sp_mn_contract_hdr_id AS id, s.sp_contract_id, s.sp_po_id,
           CASE WHEN EXISTS (SELECT 1 FROM sp_check_period_hdr c WHERE c.sp_mn_contract_hdr_id = s.sp_mn_contract_hdr_id)
                  OR EXISTS (SELECT 1 FROM sp_mn_contract_dtl d WHERE d.sp_mn_contract_hdr_id = s.sp_mn_contract_hdr_id)
                THEN 1 ELSE 0 END AS has_children
    FROM sp_mn_contract_hdr s
    WHERE s.i_status_checking IS NULL
),
grp AS (
    SELECT p.*, COALESCE(CAST(p.sp_contract_id AS VARCHAR(20)), 'po' + CAST(p.sp_po_id AS VARCHAR(20))) AS gkey
    FROM pending p
    WHERE p.sp_contract_id IS NOT NULL OR p.sp_po_id IS NOT NULL
),
ranked AS (
    SELECT g.*, ROW_NUMBER() OVER (PARTITION BY g.gkey ORDER BY g.has_children DESC, g.id ASC) AS rn,
           COUNT(*) OVER (PARTITION BY g.gkey) AS cnt
    FROM grp g
)
SELECT id, gkey INTO #cand
FROM ranked
WHERE cnt > 1 AND rn > 1 AND has_children = 0;

SELECT 'แถวซ้ำที่ลบได้ (ไม่มีข้อมูลผูก)' AS grp, COUNT(*) AS n FROM #cand;

SELECT 'แถวซ้ำที่มีข้อมูลผูก (ไม่แตะ)' AS grp, COUNT(*) AS n
FROM (SELECT COALESCE(CAST(sp_contract_id AS VARCHAR(20)), 'po' + CAST(sp_po_id AS VARCHAR(20))) gkey, sp_mn_contract_hdr_id
      FROM sp_mn_contract_hdr WHERE i_status_checking IS NULL AND (sp_contract_id IS NOT NULL OR sp_po_id IS NOT NULL)) x
WHERE gkey IN (SELECT gkey FROM #cand)
  AND sp_mn_contract_hdr_id NOT IN (SELECT id FROM #cand);

IF @apply = 0
BEGIN
    PRINT N'โหมดนับอย่างเดียว (@apply = 0) ยังไม่ได้ลบข้อมูล';
    RETURN;
END

IF OBJECT_ID('dbo.bak_dedupe_mn_contract_hdr_20261111') IS NULL
    SELECT TOP 0 * INTO dbo.bak_dedupe_mn_contract_hdr_20261111 FROM sp_mn_contract_hdr;
INSERT INTO dbo.bak_dedupe_mn_contract_hdr_20261111
SELECT s.* FROM sp_mn_contract_hdr s
WHERE s.sp_mn_contract_hdr_id IN (SELECT id FROM #cand)
  AND NOT EXISTS (SELECT 1 FROM dbo.bak_dedupe_mn_contract_hdr_20261111 b WHERE b.sp_mn_contract_hdr_id = s.sp_mn_contract_hdr_id);

BEGIN TRY
    BEGIN TRAN;
    DELETE FROM sp_mn_contract_hdr
    WHERE sp_mn_contract_hdr_id IN (SELECT id FROM #cand)
      AND NOT EXISTS (SELECT 1 FROM sp_check_period_hdr c WHERE c.sp_mn_contract_hdr_id = sp_mn_contract_hdr.sp_mn_contract_hdr_id)
      AND NOT EXISTS (SELECT 1 FROM sp_mn_contract_dtl d WHERE d.sp_mn_contract_hdr_id = sp_mn_contract_hdr.sp_mn_contract_hdr_id);
    SELECT @@ROWCOUNT AS deleted_rows;
    COMMIT TRAN;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    SELECT N'ลบไม่สำเร็จ ย้อนกลับแล้ว: ' + ERROR_MESSAGE() AS err;
END CATCH
