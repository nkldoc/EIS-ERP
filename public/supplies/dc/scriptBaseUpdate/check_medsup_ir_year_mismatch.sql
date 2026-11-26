-- ตรวจ (อ่านอย่างเดียว ไม่แก้ข้อมูล): รายการเวชภัณฑ์ (APMSD) ที่เลข IR ขึ้นปีไม่ตรงกับปีของเงิน
-- ปีของเงิน = ปีของใบกันเหลื่อม (ถ้ามี) ไม่งั้นปีงบของสัญญา / ปีของเลข IR = เลข 2 หลักหลัง IR82-
-- เช่น ใช้ใบกัน 69-… แต่ได้ IR82-70-xxxxx
SET NOCOUNT ON;
;WITH x AS (
  SELECT r.sp_tor_period_bill_receive_id, r.c_ir_code, r.c_ap_code, b.c_contract_code, b.i_period, b.c_overlap, b.i_budget_year, r.f_amt,
         CASE WHEN ISNULL(b.c_overlap, '') <> ''
                   THEN CASE WHEN b.i_budget_year_overlap > 0 THEN b.i_budget_year_overlap + 543 ELSE 2500 + TRY_CONVERT(INT, LEFT(b.c_overlap, 2)) END
              WHEN b.i_budget_year > 0 THEN b.i_budget_year + 543 END AS want_year,
         CASE WHEN r.c_ir_code LIKE 'IR%-__-%' THEN 2500 + TRY_CONVERT(INT, SUBSTRING(r.c_ir_code, CHARINDEX('-', r.c_ir_code) + 1, 2)) END AS ir_year
  FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
  JOIN NMU_ERP.dbo.sp_tor_period_bill b ON b.sp_tor_period_bill_id = r.sp_tor_period_bill_id
  WHERE r.i_enabled = 1 AND b.i_enabled = 1 AND b.c_ap_dept_type = 'APMSD' AND ISNULL(r.c_ir_code, '') <> ''
)
SELECT x.c_ir_code, x.c_ap_code, x.c_contract_code, x.i_period, x.c_overlap, x.want_year AS ปีที่ควรเป็น, x.ir_year AS ปีของเลขIR, x.f_amt,
       wd.c_code_ref AS เลขใบเบิก, wd.i_status_last AS สถานะใบเบิก, CONVERT(VARCHAR(8), wd.i_sub_status) AS ขั้นย่อย
INTO #mismatch
FROM x
OUTER APPLY (SELECT TOP 1 h.c_code_ref, h.i_status_last, h.i_sub_status
             FROM NMU_ERP.dbo.sp_tor_period_bill_checking c
             JOIN NMU_EIS.dbo.po_working_hdr h ON h.c_code_ref = c.c_code_ref
             WHERE c.c_ir_code = x.c_ir_code AND c.i_enabled = 1) wd
WHERE x.ir_year IS NOT NULL AND x.want_year IS NOT NULL AND x.ir_year <> x.want_year;

PRINT N'--- สรุปตามสถานะใบเบิก (จำนวน IR ที่ไม่ซ้ำ) ---';
SELECT ISNULL(CONVERT(VARCHAR(10), สถานะใบเบิก), N'ยังไม่มีใบเบิก') AS สถานะใบเบิก, COUNT(DISTINCT c_ir_code) AS จำนวน_IR, COUNT(*) AS จำนวนแถวรับของ
FROM #mismatch GROUP BY สถานะใบเบิก ORDER BY 1;

PRINT N'--- รายการทั้งหมด ---';
SELECT * FROM #mismatch ORDER BY c_ir_code, i_period;

DROP TABLE #mismatch;
