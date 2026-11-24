-- สรุปเภสัช (APF) / เวชภัณฑ์ (APMSD) / พัสดุ (APPS): นำเข้ามากี่รายการ ยอดเท่าไหร่ / ออก IR / ออก AP / เบิกแล้ว (ใบเบิก D) กี่ใบ ยอดเท่าไหร่
-- อ่านอย่างเดียว (SELECT) ไม่แก้ข้อมูล รันบน server ได้เลย - ตั้ง @year ถ้าอยากกรองตามปีงบประมาณ (พ.ศ. เช่น 2569 / 2570) 0 = ทุกปี
-- ปีงบประมาณที่ใช้กรอง = ปีงบของสัญญาที่นำเข้า (sp_tor_period_bill.i_budget_year เก็บเป็น ค.ศ.)
SET NOCOUNT ON;
DECLARE @year INT = 0;   -- 0 = ทุกปี, 2569, 2570 ...
DECLARE @yearCe INT = CASE WHEN @year > 0 THEN @year - 543 ELSE 0 END;

-- งวดที่นำเข้า (ยังไม่ถูกยกเลิก)
SELECT g.sp_tor_period_bill_id, g.c_contract_code, g.i_period, ISNULL(g.c_ap_dept_type, 'APMSD') AS dept, g.f_period_amt
INTO #bill
FROM NMU_ERP.dbo.sp_tor_period_bill g
WHERE g.i_enabled = 1 AND (@yearCe = 0 OR g.i_budget_year = @yearCe);

-- รายการรับของ (ยังไม่ถูกยกเลิก) ของงวดเหล่านั้น พร้อมเลข D ของ IR (ถ้ามี)ข
SELECT b.dept, r.sp_tor_period_bill_receive_id, r.sp_tor_period_bill_id, r.c_ir_code, r.c_ap_code, r.f_amt
    , (SELECT TOP 1 c.c_code_ref FROM NMU_ERP.dbo.sp_tor_period_bill_checking c
        WHERE c.c_ir_code = r.c_ir_code AND c.i_enabled = 1 AND ISNULL(c.c_code_ref, '') <> '') AS c_code_ref
INTO #rcv
FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
INNER JOIN #bill b ON b.sp_tor_period_bill_id = r.sp_tor_period_bill_id
WHERE r.i_enabled = 1;

-- 1) นำเข้า
SELECT N'1 นำเข้า' AS step, dept AS [หน่วยงาน]
    , COUNT(DISTINCT c_contract_code) AS [จำนวนสัญญา]
    , COUNT(*) AS [จำนวนงวด(รายการ)]
    , SUM(f_period_amt) AS [ยอดเงินงวดรวม]
FROM #bill GROUP BY dept ORDER BY dept;

-- 2) รับของ / ออก IR / ออก AP
SELECT N'2 รับของ' AS step, dept AS [หน่วยงาน], COUNT(*) AS [รายการรับของ], SUM(f_amt) AS [ยอดรับของ] FROM #rcv GROUP BY dept ORDER BY dept;
SELECT N'3 ออก IR แล้ว' AS step, dept AS [หน่วยงาน], COUNT(DISTINCT c_ir_code) AS [จำนวน IR], COUNT(*) AS [รายการรับของ], SUM(f_amt) AS [ยอดเงิน]
FROM #rcv WHERE c_ir_code IS NOT NULL GROUP BY dept ORDER BY dept;
SELECT N'4 ออก AP แล้ว' AS step, dept AS [หน่วยงาน], COUNT(DISTINCT c_ap_code) AS [จำนวน AP], COUNT(DISTINCT c_ir_code) AS [จำนวน IR], SUM(f_amt) AS [ยอดเงิน]
FROM #rcv WHERE c_ap_code IS NOT NULL GROUP BY dept ORDER BY dept;

-- 5) เบิกแล้ว = IR ที่มีเลขใบเบิก D (ตรวจรับ c_code_ref)
SELECT N'5 เบิกแล้ว (ใบเบิก D)' AS step, dept AS [หน่วยงาน]
    , COUNT(DISTINCT c_code_ref) AS [จำนวนใบเบิก D]
    , COUNT(DISTINCT c_ir_code) AS [จำนวน IR]
    , COUNT(DISTINCT sp_tor_period_bill_id) AS [จำนวนงวด]
    , SUM(f_amt) AS [ยอดเงินที่เบิก(ยอดรับของ)]
FROM #rcv WHERE c_code_ref IS NOT NULL GROUP BY dept ORDER BY dept;

-- 6) ยังไม่เบิก = ที่นำเข้า - เบิกแล้ว (งวดที่ยังไม่มีใบเบิก D)
SELECT N'6 ยังไม่เบิก (งวดที่ไม่มีใบเบิก D)' AS step, b.dept AS [หน่วยงาน]
    , COUNT(*) AS [จำนวนงวด], SUM(b.f_period_amt) AS [ยอดเงินงวด]
FROM #bill b
WHERE NOT EXISTS (SELECT 1 FROM #rcv r WHERE r.sp_tor_period_bill_id = b.sp_tor_period_bill_id AND r.c_code_ref IS NOT NULL)
GROUP BY b.dept ORDER BY b.dept;

DROP TABLE #bill; DROP TABLE #rcv;
