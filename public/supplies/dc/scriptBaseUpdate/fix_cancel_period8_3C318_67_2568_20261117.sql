/* ============================================================================
   fix_cancel_period8_3C318_67_2568_20261117.sql  (NMU_ERP)  รันด้วย SSMS ทั้งไฟล์
   ยกเลิกเฉพาะ "งวดที่ 8" ของสัญญา 3C318(67)/2568 เพื่อให้ผู้ใช้นำเข้าใหม่
   กติกา : ออกเลข AP แล้วยกเลิกได้ | ออกเลขใบขอเบิก D แล้ว "ยกเลิกไม่ได้" (สคริปต์หยุดให้)
           IR/AP ที่ใช้ร่วมกับสัญญาอื่น ไม่ยกเลิกอัตโนมัติ (หยุดให้)

   @apply = 0 : ดูอย่างเดียว (ค่าเริ่มต้น)
   @apply = 1 : ยกเลิกจริง ในธุรกรรมเดียว สำรองข้อมูลก่อนแก้ไว้ใน dbo.bak_cancel_p8_3C318_*
   ***** รัน @apply = 0 ก่อน ส่งผลให้ตรวจ แล้วค่อยเปลี่ยนเป็น 1 *****
   ============================================================================ */
USE NMU_ERP;
SET NOCOUNT ON;
SET XACT_ABORT ON;

DECLARE @apply BIT = 0;                 -- 0 = ดูอย่างเดียว, 1 = ยกเลิกจริง
DECLARE @release_reserve BIT = 1;       -- 1 = ปล่อยการจองเงินคืนงบด้วย (ถ้ามี)
DECLARE @contract NVARCHAR(100) = N'3C318(67)/2568';
DECLARE @period INT = 4;                -- งวดที่ 4 (sp_tor_period_bill_id 1242, 10,500 บาท) ตามที่ยืนยัน
DECLARE @reason NVARCHAR(400) = N'ยกเลิกงวดที่ 4 เพื่อนำเข้าใหม่';
DECLARE @uid INT = 1;                   -- ใส่ dc_user_id ของคนรันได้
DECLARE @tag VARCHAR(20) = '20261117';

-- 1) งวดเป้าหมาย
IF OBJECT_ID('tempdb..#b') IS NOT NULL DROP TABLE #b;
SELECT b.sp_tor_period_bill_id, b.sp_tor_period_bill_hdr_id, b.sp_tor_period_bill_import_id, b.i_period, b.f_period_amt,
       b.bg_reserve_money_id, b.bg_reserve_money_id2, b.bg_reserve_money_id3,
       b.pr_bg_reserve_money_id, b.pr_bg_reserve_money_id2, b.pr_bg_reserve_money_id3
INTO #b
FROM dbo.sp_tor_period_bill b
WHERE b.c_contract_code = @contract AND b.i_period = @period AND b.i_enabled = 1;

PRINT '=== 1) งวดเป้าหมาย ===';
SELECT * FROM #b;
IF NOT EXISTS (SELECT 1 FROM #b)
BEGIN
    PRINT 'ไม่พบงวดที่ 8 ที่ใช้งานอยู่ของสัญญานี้ (อาจถูกยกเลิกแล้ว หรือเลขงวดไม่ตรง) - จบการทำงาน';
    RETURN;
END

-- 2) รายการรับ / IR / AP
IF OBJECT_ID('tempdb..#r') IS NOT NULL DROP TABLE #r;
SELECT r.sp_tor_period_bill_receive_id, r.sp_tor_period_bill_id, r.c_ir_code, r.c_ap_code, r.d_ap_issue
INTO #r
FROM dbo.sp_tor_period_bill_receive r
WHERE r.i_enabled = 1 AND r.sp_tor_period_bill_id IN (SELECT sp_tor_period_bill_id FROM #b);
PRINT '=== 2) รายการรับ / IR / AP ===';
SELECT * FROM #r;

-- 3) ใบขอเบิก D (c_code_ref ของตรวจรับ) : มีแม้แถวเดียว = ยกเลิกไม่ได้
--    (ใช้ sp_executesql เพราะคอลัมน์นี้มาจาก sp_tor_period_bill_checking_withdraw.sql อาจยังไม่มี)
DECLARE @dCount INT = 0;
IF COL_LENGTH('dbo.sp_tor_period_bill_checking', 'c_code_ref') IS NOT NULL
    EXEC sp_executesql
        N'SELECT @n = COUNT(*) FROM dbo.sp_tor_period_bill_checking c
           WHERE c.i_enabled = 1 AND ISNULL(c.c_code_ref, N'''') <> N''''
             AND c.c_ir_code IN (SELECT c_ir_code FROM #r WHERE c_ir_code IS NOT NULL)',
        N'@n INT OUTPUT', @n = @dCount OUTPUT;
PRINT 'ใบขอเบิก D ที่ออกแล้ว: ' + CAST(@dCount AS VARCHAR(10)) + ' รายการ';

-- 4) IR/AP ที่ใช้ร่วมกับงวดอื่น (ต้องไม่มี)
IF OBJECT_ID('tempdb..#shared') IS NOT NULL DROP TABLE #shared;
SELECT x.sp_tor_period_bill_receive_id, x.c_ir_code, x.c_ap_code, x.sp_tor_period_bill_id
INTO #shared
FROM dbo.sp_tor_period_bill_receive x
WHERE x.i_enabled = 1
  AND x.sp_tor_period_bill_id NOT IN (SELECT sp_tor_period_bill_id FROM #b)
  AND ( x.c_ir_code IN (SELECT c_ir_code FROM #r WHERE c_ir_code IS NOT NULL)
     OR x.c_ap_code IN (SELECT c_ap_code FROM #r WHERE c_ap_code IS NOT NULL) );
PRINT '=== 4) IR/AP ใช้ร่วมกับงวดอื่น (ต้องว่าง) ===';
SELECT * FROM #shared;

-- 5) การจองเงินของงวดนี้
IF OBJECT_ID('tempdb..#rsv') IS NOT NULL DROP TABLE #rsv;
SELECT DISTINCT v.id AS bg_reserve_money_id
INTO #rsv
FROM #b
CROSS APPLY (VALUES (bg_reserve_money_id), (bg_reserve_money_id2), (bg_reserve_money_id3),
                    (pr_bg_reserve_money_id), (pr_bg_reserve_money_id2), (pr_bg_reserve_money_id3)) v(id)
WHERE ISNULL(v.id, 0) > 0;
PRINT '=== 5) การจองเงิน ===';
SELECT m.bg_reserve_money_id, m.pr_id, m.i_year, m.f_amt, m.i_enable
FROM NMU_EIS.dbo.bg_reserve_money m
WHERE m.bg_reserve_money_id IN (SELECT bg_reserve_money_id FROM #rsv);

DECLARE @blocked NVARCHAR(400) = N'';
IF @dCount > 0 SET @blocked += N' [ออกใบขอเบิก D แล้ว ยกเลิกไม่ได้]';
IF EXISTS (SELECT 1 FROM #shared) SET @blocked += N' [IR/AP ใช้ร่วมกับงวดอื่น]';

PRINT '=== สรุป ===';
SELECT (SELECT COUNT(*) FROM #b) AS n_bill, (SELECT COUNT(*) FROM #r) AS n_receive,
       (SELECT COUNT(DISTINCT c_ap_code) FROM #r WHERE c_ap_code IS NOT NULL) AS n_ap,
       (SELECT COUNT(DISTINCT c_ir_code) FROM #r WHERE c_ir_code IS NOT NULL) AS n_ir,
       (SELECT COUNT(*) FROM #rsv) AS n_reserve, @dCount AS n_d_form,
       @blocked AS blocked_reason, @apply AS apply_mode;

IF @apply = 0
BEGIN
    PRINT 'โหมดดูอย่างเดียว ยังไม่ได้แก้ข้อมูล ตรวจผลแล้วเปลี่ยนเป็น @apply = 1 เพื่อยกเลิกจริง';
    RETURN;
END
IF @blocked <> N''
BEGIN
    PRINT 'หยุด ไม่ยกเลิก:' + @blocked;
    RETURN;
END

-- ====================== ยกเลิกจริง ======================
BEGIN TRAN;

IF OBJECT_ID('dbo.bak_cancel_p8_3C318_bill_' + @tag) IS NULL
    EXEC('SELECT * INTO dbo.bak_cancel_p8_3C318_bill_' + @tag + ' FROM dbo.sp_tor_period_bill WHERE sp_tor_period_bill_id IN (SELECT sp_tor_period_bill_id FROM #b)');
IF OBJECT_ID('dbo.bak_cancel_p8_3C318_receive_' + @tag) IS NULL
    EXEC('SELECT * INTO dbo.bak_cancel_p8_3C318_receive_' + @tag + ' FROM dbo.sp_tor_period_bill_receive WHERE sp_tor_period_bill_receive_id IN (SELECT sp_tor_period_bill_receive_id FROM #r)');
IF OBJECT_ID('dbo.bak_cancel_p8_3C318_checking_' + @tag) IS NULL
    EXEC('SELECT * INTO dbo.bak_cancel_p8_3C318_checking_' + @tag + ' FROM dbo.sp_tor_period_bill_checking WHERE c_ir_code IN (SELECT c_ir_code FROM #r WHERE c_ir_code IS NOT NULL)');
IF @release_reserve = 1 AND EXISTS (SELECT 1 FROM #rsv) AND OBJECT_ID('dbo.bak_cancel_p8_3C318_reserve_' + @tag) IS NULL
    EXEC('SELECT * INTO dbo.bak_cancel_p8_3C318_reserve_' + @tag + ' FROM NMU_EIS.dbo.bg_reserve_money WHERE bg_reserve_money_id IN (SELECT bg_reserve_money_id FROM #rsv)');

-- ตรวจรับ -> รายการรับ (IR/AP) -> งวด
UPDATE dbo.sp_tor_period_bill_checking SET i_enabled = 0
WHERE i_enabled = 1 AND c_ir_code IN (SELECT c_ir_code FROM #r WHERE c_ir_code IS NOT NULL);
PRINT 'checking rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

UPDATE dbo.sp_tor_period_bill_receive SET i_enabled = 0, dc_user_update_id = @uid, d_update = GETDATE()
WHERE i_enabled = 1 AND sp_tor_period_bill_receive_id IN (SELECT sp_tor_period_bill_receive_id FROM #r);
PRINT 'receive rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

UPDATE dbo.sp_tor_period_bill SET i_enabled = 0, dc_user_update_id = @uid, d_update = GETDATE()
WHERE i_enabled = 1 AND sp_tor_period_bill_id IN (SELECT sp_tor_period_bill_id FROM #b);
PRINT 'bill rows: ' + CAST(@@ROWCOUNT AS VARCHAR(10));

IF @release_reserve = 1
BEGIN
    UPDATE NMU_EIS.dbo.bg_reserve_money SET i_enable = 2
    WHERE bg_reserve_money_id IN (SELECT bg_reserve_money_id FROM #rsv) AND i_enable = 1;
    PRINT 'reserve rows released: ' + CAST(@@ROWCOUNT AS VARCHAR(10));
END

-- ปรับประวัติการนำเข้า ให้ตรงกับงวดที่เหลือ (ไม่เหลืออะไรเลย = ปิดชุด)
UPDATE i SET i.i_contract_count = x.c, i.i_row_count = x.r, i.f_total_amt = x.t,
             i.i_enabled = CASE WHEN x.c = 0 THEN 0 ELSE i.i_enabled END
FROM dbo.sp_tor_period_bill_import i
CROSS APPLY (SELECT COUNT(DISTINCT b2.sp_tor_period_bill_hdr_id) AS c, COUNT(*) AS r, ISNULL(SUM(b2.f_fund_amt_dtl), 0) AS t
             FROM dbo.sp_tor_period_bill b2
             WHERE b2.sp_tor_period_bill_import_id = i.sp_tor_period_bill_import_id AND b2.i_enabled = 1) x
WHERE i.sp_tor_period_bill_import_id IN (SELECT sp_tor_period_bill_import_id FROM #b);

IF COL_LENGTH('dbo.sp_tor_period_bill_import', 'c_cancel_reason') IS NOT NULL
    EXEC sp_executesql
        N'UPDATE dbo.sp_tor_period_bill_import
             SET c_cancel_reason = LEFT(CASE WHEN ISNULL(c_cancel_reason, N'''') <> N'''' THEN c_cancel_reason + N'' | '' ELSE N'''' END + @r, 500),
                 dc_user_cancel_id = @u, d_cancel = GETDATE()
           WHERE sp_tor_period_bill_import_id IN (SELECT sp_tor_period_bill_import_id FROM #b)',
        N'@r nvarchar(500), @u int', @r = @reason, @u = @uid;

COMMIT;
PRINT 'ยกเลิกงวดที่ 8 เรียบร้อย ให้ผู้ใช้นำเข้าใหม่ได้';

SELECT b.sp_tor_period_bill_id, b.i_period, b.i_enabled
FROM dbo.sp_tor_period_bill b WHERE b.sp_tor_period_bill_id IN (SELECT sp_tor_period_bill_id FROM #b);
