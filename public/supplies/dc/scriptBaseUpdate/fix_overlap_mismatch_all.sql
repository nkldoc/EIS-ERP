/* ============================================================================
   fix_overlap_mismatch_all.sql  (รันกับ sqlcmd -I เพราะใช้ QUOTED_IDENTIFIER)

   แก้ข้อมูลใบกันเหลื่อมที่ไม่ตรงกันระหว่างตรวจรับ(NMU_ERP) / ใบเบิก / bg_reserve_* ให้ทั้งชุด:
     A  ใบเบิกเลือกใบกันแล้ว (c_booking + ปีที่ใช้เงิน <> ปีงบประมาณ) แต่ตรวจรับยังไม่มีเลขใบกัน
        -> เรียก sp_sync_overlap_from_withdrawal (เติมเลขใบกัน/สร้างรายการตัดใบกัน/ยกเลิกจองเงินปีปัจจุบันที่ค้าง)
     B1 ตรวจรับผูกใบกันแล้ว แต่รายการตัดใบกัน (bg_reserve_overlap) บันทึกผิดรูปแบบ
        (i_sys <> 1, chk_id ไม่ใช่เลขตรวจรับ, ปีไม่ตรงทั้งปีใบกันและปีที่ทำรายการ, หรือออกใบเบิกแล้วแต่ยังไม่ปิด i_finish)
        -> แก้เป็น i_sys=1, chk_id=เลขตรวจรับ, i_year=ปีใบกัน, i_finish=1 (ถ้ามีใบเบิกแล้ว)
     B2 ตรวจรับใช้ใบกันแล้ว แต่ยังจองเงินปีปัจจุบัน (bg_reserve_money) ค้าง (ยังไม่ปิด) -> ยกเลิกการจอง (i_enable=0)
     C1 ใช้เงินปีปัจจุบัน (ไม่มีใบกัน) ใบเบิกออกแล้ว (ใบเบิกใช้งานอยู่ และไม่ได้เลือกใบกัน) แต่การจองเงินปีปัจจุบันยังไม่ปิด
        -> ปิดการจอง (bg_reserve_money.i_finish=1) เหมือนที่ EIS ทำตอนบันทึกใบเบิก (ไม่งั้นนับซ้ำทั้งยอดจองและยอดใบเบิก)
   ไม่แตะ: จองเงินปีปัจจุบันที่ปิดแล้ว (i_finish=1), ตรวจรับที่ผูกใบกันแต่ไม่มีรายการตัดใบกัน,
           รายการตัดใบกันที่ถูกอ้างโดยตรวจรับมากกว่า 1 ใบ (ไม่แน่ใจว่าเป็นของใคร)

   วิธีใช้: 1) รันโดย @apply = 0 (ค่าเริ่มต้น) เพื่อดูจำนวนที่จะแก้  2) เปลี่ยนเป็น @apply = 1 เพื่อแก้จริง
   ก่อนแก้จริงจะสำรองแถวที่จะเปลี่ยนไว้ที่ตาราง bak_fixall_*_20261110 และเก็บผล A ที่ log_fixall_overlap_20261110
   ย้อนกลับ: ดูท้ายไฟล์
   ต้องติดตั้ง sp_sync_overlap_from_withdrawal.sql ก่อน
   ============================================================================ */
USE NMU_ERP;
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET NOCOUNT ON;

DECLARE @apply BIT = 1;   -- 0 = นับอย่างเดียว, 1 = แก้จริง

IF OBJECT_ID('dbo.sp_sync_overlap_from_withdrawal') IS NULL
BEGIN
    RAISERROR(N'ยังไม่ได้ติดตั้ง sp_sync_overlap_from_withdrawal', 16, 1);
    RETURN;
END

/* ---------- เลือกรายการ ---------- */
IF OBJECT_ID('tempdb..#a') IS NOT NULL DROP TABLE #a;
IF OBJECT_ID('tempdb..#b1') IS NOT NULL DROP TABLE #b1;
IF OBJECT_ID('tempdb..#b2') IS NOT NULL DROP TABLE #b2;
IF OBJECT_ID('tempdb..#c1') IS NOT NULL DROP TABLE #c1;

SELECT chk.sp_check_period_hdr_id AS id
INTO #a
FROM dbo.sp_check_period_hdr chk
WHERE ISNULL(chk.i_enabled, 1) = 1 AND ISNULL(chk.c_overlap, '') = ''
  AND EXISTS (SELECT 1
              FROM NMU_EIS.dbo.po_working_hdr h
              INNER JOIN NMU_EIS.dbo.po_working_dtl d ON d.po_working_hdr_id = h.po_working_hdr_id
              INNER JOIN NMU_EIS.dbo.vw_bg_budget_overlap o ON o.c_code_ref = LTRIM(RTRIM(d.c_booking))
              WHERE h.po_working_hdr_id = chk.po_working_hdr_id AND h.i_enable = 1
                AND ISNULL(d.c_booking, '') <> ''
                AND d.i_budget_year_overlap IS NOT NULL AND d.i_budget_year_overlap <> d.i_budget_year);

SELECT chk.sp_check_period_hdr_id AS id
INTO #b1
FROM dbo.sp_check_period_hdr chk
INNER JOIN NMU_EIS.dbo.bg_reserve_overlap ro
        ON ro.bg_reserve_overlap_id = chk.bg_reserve_overlap_id AND ro.c_code_overlap = chk.c_overlap
       AND ro.po_id = chk.sp_tor_contract_id AND ro.i_enable = 1
WHERE ISNULL(chk.i_enabled, 1) = 1 AND ISNULL(chk.c_overlap, '') <> ''
  AND NOT EXISTS (SELECT 1 FROM dbo.sp_check_period_hdr c2
                  WHERE c2.bg_reserve_overlap_id = chk.bg_reserve_overlap_id
                    AND c2.sp_check_period_hdr_id <> chk.sp_check_period_hdr_id)
  AND (ro.i_sys <> 1
       OR ISNULL(ro.chk_id, 0) <> chk.sp_check_period_hdr_id
       OR (ISNULL(ro.i_year, 0) <> ISNULL(TRY_CONVERT(int, NULLIF(chk.i_yyyy_overlap, '')), ro.i_year)
           AND ISNULL(ro.i_year, 0) <> ISNULL(TRY_CONVERT(int, NULLIF(chk.i_yyyy, '')), -1))   -- ปีใบกัน หรือ ปีที่ทำรายการ ก็ถือว่าถูก
       OR (EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_hdr h WHERE h.po_working_hdr_id = chk.po_working_hdr_id AND h.i_enable = 1)
           AND ISNULL(ro.i_finish, 0) <> 1));

SELECT chk.sp_check_period_hdr_id AS id
INTO #b2
FROM dbo.sp_check_period_hdr chk
INNER JOIN NMU_EIS.dbo.bg_reserve_overlap ro
        ON ro.bg_reserve_overlap_id = chk.bg_reserve_overlap_id AND ro.c_code_overlap = chk.c_overlap
       AND ro.po_id = chk.sp_tor_contract_id AND ro.i_enable = 1
INNER JOIN NMU_EIS.dbo.bg_reserve_money rm ON rm.bg_reserve_money_id = chk.bg_checking_money_id
WHERE ISNULL(chk.i_enabled, 1) = 1 AND ISNULL(chk.c_overlap, '') <> ''
  AND rm.i_enable = 1 AND ISNULL(rm.i_finish, 0) = 0;

-- C1: เงินปีปัจจุบัน ใบเบิกออกแล้วแต่การจองเงินยังไม่ปิด
SELECT chk.sp_check_period_hdr_id AS id
INTO #c1
FROM dbo.sp_check_period_hdr chk
INNER JOIN NMU_EIS.dbo.bg_reserve_money rm ON rm.bg_reserve_money_id = chk.bg_checking_money_id
WHERE ISNULL(chk.i_enabled, 1) = 1 AND ISNULL(chk.c_overlap, '') = ''
  AND rm.i_enable = 1 AND ISNULL(rm.i_finish, 0) = 0
  AND EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_hdr h
              INNER JOIN NMU_EIS.dbo.po_working_dtl d ON d.po_working_hdr_id = h.po_working_hdr_id
              WHERE h.po_working_hdr_id = chk.po_working_hdr_id AND h.i_enable = 1)
  AND NOT EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_hdr h
                  INNER JOIN NMU_EIS.dbo.po_working_dtl d ON d.po_working_hdr_id = h.po_working_hdr_id
                  WHERE h.po_working_hdr_id = chk.po_working_hdr_id AND h.i_enable = 1
                    AND ISNULL(d.c_booking, '') <> '' AND d.i_budget_year_overlap IS NOT NULL
                    AND d.i_budget_year_overlap <> d.i_budget_year);

SELECT 'A  ใบเบิกใช้ใบกันแต่ตรวจรับไม่รู้' AS grp, COUNT(*) AS n FROM #a
UNION ALL SELECT 'B1 รายการตัดใบกันผิดรูปแบบ', COUNT(*) FROM #b1
UNION ALL SELECT 'B2 จองเงินปีปัจจุบันค้าง (ยังไม่ปิด)', COUNT(*) FROM #b2
UNION ALL SELECT 'C1 เงินปีปัจจุบัน ใบเบิกออกแล้วแต่จองเงินยังไม่ปิด', COUNT(*) FROM #c1;

IF @apply = 0
BEGIN
    PRINT N'โหมดนับอย่างเดียว (@apply = 0) ยังไม่ได้แก้ข้อมูล';
    RETURN;
END

/* ---------- สำรองข้อมูลก่อนแก้ ---------- */
-- สำรองแถวที่จะเปลี่ยน: สร้างตารางสำรอง (โครงเดียวกับต้นทาง) แล้วเพิ่มเฉพาะแถวที่ยังไม่เคยสำรอง
-- (รันซ้ำได้โดยไม่ทับค่าก่อนแก้เดิม) ใช้รายชื่อคอลัมน์ + IDENTITY_INSERT เพราะตารางมีคอลัมน์ identity
IF OBJECT_ID('tempdb..#ids') IS NOT NULL DROP TABLE #ids;
CREATE TABLE #ids (id BIGINT);

DECLARE @bk TABLE (src NVARCHAR(200), bak NVARCHAR(200), keycol NVARCHAR(100), dbn NVARCHAR(50), tbl NVARCHAR(100), kind INT);
INSERT INTO @bk VALUES
 (N'NMU_ERP.dbo.sp_check_period_hdr', N'NMU_ERP.dbo.bak_fixall_chk_20261110', N'sp_check_period_hdr_id', N'NMU_ERP', N'sp_check_period_hdr', 1),
 (N'NMU_EIS.dbo.bg_reserve_overlap',  N'NMU_EIS.dbo.bak_fixall_ro_20261110',  N'bg_reserve_overlap_id',   N'NMU_EIS', N'bg_reserve_overlap', 2),
 (N'NMU_EIS.dbo.bg_reserve_money',    N'NMU_EIS.dbo.bak_fixall_money_20261110', N'bg_reserve_money_id',    N'NMU_EIS', N'bg_reserve_money', 3);

DECLARE @src NVARCHAR(200), @bak NVARCHAR(200), @key NVARCHAR(100), @dbn NVARCHAR(50), @tbl NVARCHAR(100), @kind INT;
DECLARE @cols NVARCHAR(MAX), @sqlx NVARCHAR(MAX), @hasIdentity INT;
DECLARE bcur CURSOR LOCAL FAST_FORWARD FOR SELECT src, bak, keycol, dbn, tbl, kind FROM @bk;
OPEN bcur;
FETCH NEXT FROM bcur INTO @src, @bak, @key, @dbn, @tbl, @kind;
WHILE @@FETCH_STATUS = 0
BEGIN
    DELETE FROM #ids;
    IF @kind = 1 INSERT INTO #ids SELECT id FROM #a;
    IF @kind = 2 INSERT INTO #ids SELECT chk.bg_reserve_overlap_id FROM dbo.sp_check_period_hdr chk WHERE chk.sp_check_period_hdr_id IN (SELECT id FROM #b1);
    IF @kind = 3 INSERT INTO #ids SELECT chk.bg_checking_money_id FROM dbo.sp_check_period_hdr chk WHERE chk.sp_check_period_hdr_id IN (SELECT id FROM #a UNION SELECT id FROM #b2 UNION SELECT id FROM #c1);

    IF OBJECT_ID(@bak) IS NULL
    BEGIN
        SET @sqlx = N'SELECT TOP 0 * INTO ' + @bak + N' FROM ' + @src;
        EXEC (@sqlx);
    END

    SET @sqlx = N'SELECT @c = STUFF((SELECT '','' + QUOTENAME(COLUMN_NAME) FROM ' + @dbn + N'.INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = ''' + @tbl + N''' ORDER BY ORDINAL_POSITION FOR XML PATH('''')), 1, 1, '''')';
    EXEC sp_executesql @sqlx, N'@c NVARCHAR(MAX) OUTPUT', @c = @cols OUTPUT;

    -- OBJECTPROPERTY ใช้ข้ามฐานข้อมูลไม่ได้ (คืน NULL) จึงนับจาก sys.columns ของฐานนั้นแทน
    SET @sqlx = N'SELECT @h = COUNT(*) FROM ' + @dbn + N'.sys.columns WHERE object_id = OBJECT_ID(''' + @bak + N''') AND is_identity = 1';
    EXEC sp_executesql @sqlx, N'@h INT OUTPUT', @h = @hasIdentity OUTPUT;
    SET @sqlx = CASE WHEN @hasIdentity = 1 THEN N'SET IDENTITY_INSERT ' + @bak + N' ON; ' ELSE N'' END
        + N'INSERT INTO ' + @bak + N' (' + @cols + N') SELECT ' + @cols + N' FROM ' + @src + N' s WHERE s.' + @key
        + N' IN (SELECT id FROM #ids) AND NOT EXISTS (SELECT 1 FROM ' + @bak + N' b WHERE b.' + @key + N' = s.' + @key + N'); '
        + CASE WHEN @hasIdentity = 1 THEN N'SET IDENTITY_INSERT ' + @bak + N' OFF; ' ELSE N'' END;
    EXEC (@sqlx);

    FETCH NEXT FROM bcur INTO @src, @bak, @key, @dbn, @tbl, @kind;
END
CLOSE bcur;
DEALLOCATE bcur;

IF OBJECT_ID('NMU_ERP.dbo.log_fixall_overlap_20261110') IS NULL
    CREATE TABLE NMU_ERP.dbo.log_fixall_overlap_20261110 (
        status VARCHAR(30), chk_id INT, wd_code VARCHAR(50), c_booking VARCHAR(100), i_year_overlap INT,
        bg_reserve_overlap_id BIGINT, money_cancelled INT, err_msg NVARCHAR(400), d_log DATETIME DEFAULT GETDATE());

/* ---------- A: ใช้ตัวทำงานกลางทีละรายการ ---------- */
DECLARE @id INT;
DECLARE cur CURSOR LOCAL FAST_FORWARD FOR SELECT id FROM #a ORDER BY id;
OPEN cur;
FETCH NEXT FROM cur INTO @id;
WHILE @@FETCH_STATUS = 0
BEGIN
    INSERT INTO NMU_ERP.dbo.log_fixall_overlap_20261110 (status, chk_id, wd_code, c_booking, i_year_overlap, bg_reserve_overlap_id, money_cancelled, err_msg)
    EXEC dbo.sp_sync_overlap_from_withdrawal @chk_id = @id, @apply = 1;
    FETCH NEXT FROM cur INTO @id;
END
CLOSE cur;
DEALLOCATE cur;

/* ---------- B1 + B2: แก้ทีเดียวในทรานแซกชันเดียว ---------- */
BEGIN TRY
    BEGIN TRAN;

    UPDATE ro
    SET ro.i_sys = 1,
        ro.chk_id = chk.sp_check_period_hdr_id,
        ro.i_year = CASE WHEN ro.i_year IN (TRY_CONVERT(int, NULLIF(chk.i_yyyy_overlap, '')), TRY_CONVERT(int, NULLIF(chk.i_yyyy, '')))
                         THEN ro.i_year ELSE ISNULL(TRY_CONVERT(int, NULLIF(chk.i_yyyy_overlap, '')), ro.i_year) END,
        ro.i_finish = CASE WHEN EXISTS (SELECT 1 FROM NMU_EIS.dbo.po_working_hdr h
                                        WHERE h.po_working_hdr_id = chk.po_working_hdr_id AND h.i_enable = 1)
                           THEN 1 ELSE ro.i_finish END,
        ro.d_update = GETDATE()
    FROM NMU_EIS.dbo.bg_reserve_overlap ro
    INNER JOIN dbo.sp_check_period_hdr chk
            ON chk.bg_reserve_overlap_id = ro.bg_reserve_overlap_id AND ro.c_code_overlap = chk.c_overlap
           AND ro.po_id = chk.sp_tor_contract_id
    WHERE chk.sp_check_period_hdr_id IN (SELECT id FROM #b1) AND ro.i_enable = 1;
    DECLARE @n_b1 INT = @@ROWCOUNT;

    UPDATE rm
    SET rm.i_enable = 0, rm.d_update = GETDATE(),
        rm.c_comment = LEFT(N'ยกเลิก ' + CONVERT(VARCHAR(10), GETDATE(), 23) + N': ใช้ใบกันเหลื่อม ' + chk.c_overlap + N' แทน (แก้เป็นชุด)', 255)
    FROM NMU_EIS.dbo.bg_reserve_money rm
    INNER JOIN dbo.sp_check_period_hdr chk ON chk.bg_checking_money_id = rm.bg_reserve_money_id
    WHERE chk.sp_check_period_hdr_id IN (SELECT id FROM #b2) AND rm.i_enable = 1 AND ISNULL(rm.i_finish, 0) = 0;
    DECLARE @n_b2 INT = @@ROWCOUNT;

    UPDATE rm
    SET rm.i_finish = 1, rm.d_update = GETDATE()
    FROM NMU_EIS.dbo.bg_reserve_money rm
    INNER JOIN dbo.sp_check_period_hdr chk ON chk.bg_checking_money_id = rm.bg_reserve_money_id
    WHERE chk.sp_check_period_hdr_id IN (SELECT id FROM #c1) AND rm.i_enable = 1 AND ISNULL(rm.i_finish, 0) = 0;
    DECLARE @n_c1 INT = @@ROWCOUNT;

    COMMIT TRAN;
    SELECT @n_b1 AS b1_rows_fixed, @n_b2 AS b2_money_cancelled, @n_c1 AS c1_money_closed;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0 ROLLBACK TRAN;
    SELECT N'B1/B2 ล้มเหลว ย้อนกลับทั้งหมด: ' + ERROR_MESSAGE() AS err;
END CATCH

SELECT status, COUNT(*) AS n, SUM(money_cancelled) AS money_cancelled
FROM NMU_ERP.dbo.log_fixall_overlap_20261110 GROUP BY status;

/* ---------- ย้อนกลับ (ถ้าจำเป็น) ----------
-- B1: คืนรายการตัดใบกัน
UPDATE ro SET ro.i_sys=b.i_sys, ro.chk_id=b.chk_id, ro.i_year=b.i_year, ro.i_finish=b.i_finish, ro.d_update=b.d_update
FROM NMU_EIS.dbo.bg_reserve_overlap ro JOIN NMU_EIS.dbo.bak_fixall_ro_20261110 b ON b.bg_reserve_overlap_id=ro.bg_reserve_overlap_id;
-- B2 และ A(จองเงิน): คืนการจองเงินปีปัจจุบัน
UPDATE rm SET rm.i_enable=b.i_enable, rm.d_update=b.d_update, rm.c_comment=b.c_comment
FROM NMU_EIS.dbo.bg_reserve_money rm JOIN NMU_EIS.dbo.bak_fixall_money_20261110 b ON b.bg_reserve_money_id=rm.bg_reserve_money_id;
-- A: คืนตรวจรับ และลบรายการตัดใบกันที่สร้างใหม่
UPDATE c SET c.c_overlap=b.c_overlap, c.i_overlap=b.i_overlap, c.bg_reserve_overlap_id=b.bg_reserve_overlap_id, c.i_yyyy_overlap=b.i_yyyy_overlap, c.d_update=b.d_update
FROM NMU_ERP.dbo.sp_check_period_hdr c JOIN NMU_ERP.dbo.bak_fixall_chk_20261110 b ON b.sp_check_period_hdr_id=c.sp_check_period_hdr_id;
DELETE FROM NMU_EIS.dbo.bg_reserve_overlap WHERE bg_reserve_overlap_id IN (SELECT bg_reserve_overlap_id FROM NMU_ERP.dbo.log_fixall_overlap_20261110 WHERE status='SYNCED' AND bg_reserve_overlap_id IS NOT NULL);
*/
