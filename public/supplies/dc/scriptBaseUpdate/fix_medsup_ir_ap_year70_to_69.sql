-- เปลี่ยนเลข IR / AP ของเวชภัณฑ์ (APMSD) ที่ออกเป็นปี 70 แต่ปีของเงินเป็น 69 ให้เป็นปี 69
--   IR82-70-xxxxx -> IR82-69-xxxxx (เลขรันต่อจากเลขสูงสุดของ IR82-69 ที่มีอยู่) / APMSD70-xxxxxx -> APMSD69-xxxxxx (ต่อจากเลขสูงสุดของ APMSD69)
-- ปีที่ควรเป็น = ปีของใบกันเหลื่อม (ถ้ามี) ไม่งั้นปีงบของสัญญา (กติกาเดียวกับเภสัช)
-- แก้ที่: NMU_ERP.sp_tor_period_bill_receive (c_ir_code, c_ap_code) / sp_tor_period_bill_checking (c_ir_code) / NMU_EIS.po_working_dtl (c_code_debt = เลข AP)
-- ใบเบิกที่เลยขั้นอนุมัติฎีกา (สถานะ 6, 7, 10, 11) @include_final = 1 (ค่าเริ่มต้น ผู้ใช้สั่งให้แก้ทั้งหมด) แก้ด้วย ตั้ง 0 ถ้าจะข้าม
-- @apply = 0 ดูตัวอย่าง (ไม่แก้) / 1 แก้จริง (สำรองตารางเดิมไว้ที่ NMU_ERP.dbo.bak_medsup_ir_ap69_<วันที่_เวลา>_*)
-- หมายเหตุ: PDF ใบเบิกที่ออกไปแล้ว (ขั้น 2-5) ยังพิมพ์เลข AP เก่า ต้องกดสร้าง PDF ใหม่หลังแก้
SET NOCOUNT ON; SET XACT_ABORT ON; SET QUOTED_IDENTIFIER ON; SET ANSI_NULLS ON; SET ANSI_WARNINGS ON;
DECLARE @apply INT = 0;
DECLARE @include_final INT = 1;
DECLARE @yy CHAR(2) = '69', @wantYear INT = 2569;

IF OBJECT_ID('tempdb..#c') IS NOT NULL DROP TABLE #c;
;WITH x AS (
  SELECT r.c_ir_code, r.c_ap_code,
         CASE WHEN ISNULL(b.c_overlap, '') <> ''
                   THEN CASE WHEN b.i_budget_year_overlap > 0 THEN b.i_budget_year_overlap + 543 ELSE 2500 + TRY_CONVERT(INT, LEFT(b.c_overlap, 2)) END
              WHEN b.i_budget_year > 0 THEN b.i_budget_year + 543 END AS want_year
  FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
  JOIN NMU_ERP.dbo.sp_tor_period_bill b ON b.sp_tor_period_bill_id = r.sp_tor_period_bill_id
  WHERE r.i_enabled = 1 AND b.i_enabled = 1 AND b.c_ap_dept_type = 'APMSD'
    AND r.c_ir_code LIKE 'IR82-70-%' AND ISNULL(r.c_ap_code, '') LIKE 'APMSD70-%'
)
SELECT x.c_ir_code AS old_ir, MAX(x.c_ap_code) AS old_ap, MIN(x.want_year) AS y_min, MAX(x.want_year) AS y_max
INTO #c FROM x GROUP BY x.c_ir_code;

DELETE FROM #c WHERE y_min IS NULL OR y_min <> y_max OR y_min <> @wantYear;   -- เลือกเฉพาะ IR ที่ทุกแถวควรเป็นปี 69

ALTER TABLE #c ADD wd_code VARCHAR(30) NULL, wd_status INT NULL, wd_sub DECIMAL(6,2) NULL, skip_reason NVARCHAR(100) NULL, new_ir VARCHAR(30) COLLATE Thai_CI_AS NULL, new_ap VARCHAR(30) COLLATE Thai_CI_AS NULL;
UPDATE c SET wd_code = w.c_code_ref, wd_status = w.i_status_last, wd_sub = w.i_sub_status
FROM #c c OUTER APPLY (SELECT TOP 1 h.c_code_ref, h.i_status_last, h.i_sub_status
                       FROM NMU_ERP.dbo.sp_tor_period_bill_checking k
                       JOIN NMU_EIS.dbo.po_working_hdr h ON h.c_code_ref = k.c_code_ref
                       WHERE k.c_ir_code = c.old_ir AND k.i_enabled = 1) w;
UPDATE #c SET skip_reason = N'ใบเบิกเลยขั้นอนุมัติฎีกา (สถานะ ' + CONVERT(NVARCHAR(5), wd_status) + N')'
WHERE @include_final = 0 AND wd_status IN (6, 7, 10, 11);

-- เลขใหม่: ต่อจากเลขสูงสุด (นับทุกแถวรวมที่ยกเลิก กันเลขซ้ำ) เรียงตามเลข IR เดิม
DECLARE @maxIr INT = ISNULL((SELECT MAX(TRY_CONVERT(INT, RIGHT(c_ir_code, 5))) FROM NMU_ERP.dbo.sp_tor_period_bill_receive WHERE c_ir_code LIKE 'IR82-' + @yy + '-%'), 0);
DECLARE @maxAp INT = ISNULL((SELECT MAX(TRY_CONVERT(INT, RIGHT(c_ap_code, 6))) FROM NMU_ERP.dbo.sp_tor_period_bill_receive WHERE c_ap_code LIKE 'APMSD' + @yy + '-%'), 0);
;WITH n AS (SELECT old_ir, ROW_NUMBER() OVER (ORDER BY old_ir) AS rn FROM #c WHERE skip_reason IS NULL)
UPDATE c SET new_ir = 'IR82-' + @yy + '-' + RIGHT('00000' + CONVERT(VARCHAR(10), @maxIr + n.rn), 5),
             new_ap = 'APMSD' + @yy + '-' + RIGHT('000000' + CONVERT(VARCHAR(10), @maxAp + n.rn), 6)
FROM #c c JOIN n ON n.old_ir = c.old_ir;

PRINT N'--- สรุป ---';
SELECT COUNT(*) AS ir_ทั้งหมดที่ควรเป็น69, SUM(CASE WHEN skip_reason IS NULL THEN 1 ELSE 0 END) AS จะแก้, SUM(CASE WHEN skip_reason IS NOT NULL THEN 1 ELSE 0 END) AS ข้าม,
       @maxIr AS เลขIR69สูงสุดเดิม, @maxAp AS เลขAP69สูงสุดเดิม FROM #c;
PRINT N'--- รายการที่จะแก้ (เก่า -> ใหม่) ---';
SELECT old_ir, new_ir, old_ap, new_ap, wd_code, wd_status, wd_sub FROM #c WHERE skip_reason IS NULL ORDER BY old_ir;
PRINT N'--- รายการที่ข้าม ---';
SELECT old_ir, old_ap, wd_code, wd_status, skip_reason FROM #c WHERE skip_reason IS NOT NULL ORDER BY old_ir;

-- กันเลขใหม่ซ้ำกับของเดิม
IF EXISTS (SELECT 1 FROM #c c JOIN NMU_ERP.dbo.sp_tor_period_bill_receive r ON r.c_ir_code = c.new_ir WHERE c.new_ir IS NOT NULL)
   OR EXISTS (SELECT 1 FROM #c c JOIN NMU_ERP.dbo.sp_tor_period_bill_receive r ON r.c_ap_code = c.new_ap WHERE c.new_ap IS NOT NULL)
BEGIN PRINT N'เลขใหม่ซ้ำกับเลขที่มีอยู่ - หยุด'; RETURN; END

IF @apply IN (1, 2)
BEGIN
    DECLARE @tag VARCHAR(40) = CONVERT(VARCHAR(8), GETDATE(), 112) + '_' + REPLACE(CONVERT(VARCHAR(8), GETDATE(), 108), ':', '');
    DECLARE @s NVARCHAR(MAX);
    BEGIN TRAN;
    SET @s = N'SELECT r.* INTO NMU_ERP.dbo.' + QUOTENAME('bak_medsup_ir_ap69_' + @tag + '_receive') + N' FROM NMU_ERP.dbo.sp_tor_period_bill_receive r JOIN #c c ON c.old_ir = r.c_ir_code WHERE c.new_ir IS NOT NULL';
    EXEC (@s);
    SET @s = N'SELECT k.* INTO NMU_ERP.dbo.' + QUOTENAME('bak_medsup_ir_ap69_' + @tag + '_checking') + N' FROM NMU_ERP.dbo.sp_tor_period_bill_checking k JOIN #c c ON c.old_ir = k.c_ir_code WHERE c.new_ir IS NOT NULL';
    EXEC (@s);
    SET @s = N'SELECT d.* INTO NMU_ERP.dbo.' + QUOTENAME('bak_medsup_ir_ap69_' + @tag + '_wd_dtl') + N' FROM NMU_EIS.dbo.po_working_dtl d JOIN #c c ON c.old_ap = d.c_code_debt WHERE c.new_ap IS NOT NULL';
    EXEC (@s);

    UPDATE r SET r.c_ir_code = c.new_ir, r.c_ap_code = c.new_ap
    FROM NMU_ERP.dbo.sp_tor_period_bill_receive r JOIN #c c ON c.old_ir = r.c_ir_code
    WHERE c.new_ir IS NOT NULL;
    DECLARE @nRecv INT = @@ROWCOUNT;
    UPDATE k SET k.c_ir_code = c.new_ir
    FROM NMU_ERP.dbo.sp_tor_period_bill_checking k JOIN #c c ON c.old_ir = k.c_ir_code
    WHERE c.new_ir IS NOT NULL;
    DECLARE @nChk INT = @@ROWCOUNT;
    UPDATE d SET d.c_code_debt = c.new_ap
    FROM NMU_EIS.dbo.po_working_dtl d JOIN #c c ON c.old_ap = d.c_code_debt
    WHERE c.new_ap IS NOT NULL;
    DECLARE @nWd INT = @@ROWCOUNT;

    PRINT N'แก้แล้ว: รายการรับของ ' + CONVERT(NVARCHAR(10), @nRecv) + N' แถว / รายละเอียดตรวจรับ ' + CONVERT(NVARCHAR(10), @nChk) + N' แถว / ใบเบิก EIS ' + CONVERT(NVARCHAR(10), @nWd) + N' แถว';
    PRINT N'--- หลังแก้ (ตรวจ) ---';
    SELECT c.old_ir, c.new_ir, c.new_ap,
           (SELECT COUNT(*) FROM NMU_ERP.dbo.sp_tor_period_bill_receive r WHERE r.c_ir_code = c.new_ir AND r.c_ap_code = c.new_ap) AS receive_rows,
           (SELECT COUNT(*) FROM NMU_ERP.dbo.sp_tor_period_bill_checking k WHERE k.c_ir_code = c.new_ir) AS checking_rows,
           (SELECT COUNT(*) FROM NMU_EIS.dbo.po_working_dtl d WHERE d.c_code_debt = c.new_ap) AS wd_rows
    FROM #c c WHERE c.new_ir IS NOT NULL ORDER BY c.old_ir;

    IF @apply = 2 BEGIN ROLLBACK; PRINT N'(@apply = 2: ทดสอบแล้วย้อนกลับทั้งหมด ไม่มีการแก้จริง)'; END
    ELSE BEGIN COMMIT; PRINT N'สำรองตารางเดิมไว้ที่ NMU_ERP.dbo.bak_medsup_ir_ap69_' + @tag + N'_receive / _checking / _wd_dtl'; END
END
DROP TABLE #c;
