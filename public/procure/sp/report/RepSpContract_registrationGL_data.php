<?php
/**
 * RepSpContract_registrationGL_data.php  (EIS_PROCURE — มหาวิทยาลัยล้วน ไม่มี UNION)
 * Endpoint: รับ GET params → query MSSQL (EIS_PROCURE) → ส่งกลับ JSON
 * ดัดแปลงจากไฟล์ของ nmu_supplies (คณะแพทย์) โดยตัดส่วน UNION ALL ออก
 * และแก้ join ฝั่งงวดงาน/po_working ให้ตรงกับ query ที่ผู้ใช้ทดสอบแล้วว่าถูกต้อง
 * (ใช้ derived table แทน temp table #tem เพื่อไม่ให้ error "already an object" เวลาถูกยิงซ้ำ)
 */

header('Content-Type: application/json; charset=UTF-8');

include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();

// ── 1. รับและ sanitize params ────────────────────────────────────────────────
function getIntParam(string $key, $default = null) {
    if (!isset($_GET[$key]) || $_GET[$key] === '' || $_GET[$key] === '0') return $default;
    return (int)$_GET[$key];
}
function getStrParam(string $key, string $default = ''): string {
    return isset($_GET[$key]) ? trim($_GET[$key]) : $default;
}

// NULL = ไม่กรอง (เหมือน @param IS NULL ใน MSSQL)
$p_budget   = getIntParam('dc_expense_budget_type_id'); // NULL or int
$p_expense  = getIntParam('po_expense_id');             // NULL or int
$p_contract = getIntParam('sp_tor_contract_id');        // NULL or int
$p_yyyy     = getIntParam('i_yyyy');                    // NULL or int
$p_emp      = getIntParam('sp_emp_id');                 // NULL or int
$p_creditor = getIntParam('dc_creditor_id');            // NULL or int
$i_view     = (int)getStrParam('i_view', '1');          // 1/2/3
$dc_dept_id = getIntParam('dc_department_id');
$i_type_Rep = (int)getStrParam('i_type_Rep', '1');      // 1=PR 2=เลขสัญญา
// หมายเหตุ: ไฟล์นี้เป็นของ EIS_PROCURE (มหาวิทยาลัย) ล้วนๆ ไม่มี i_sys ให้เลือกแล้ว
// (คงค่า i_sys = 3 ไว้ในผลลัพธ์ เพื่อให้ html/js เดิมที่ใช้ badge ยังทำงานได้โดยไม่ต้องแก้)

// ── ส่วนงาน (dc_cost) : เลือกได้หลายรายการ, ค่าที่ส่งมาเป็น id คั่นด้วยจุลภาค ──
$raw_dc_cost = getStrParam('dc_cost_acc_id', '');
$dcCostIds = [];
if ($raw_dc_cost !== '') {
    foreach (explode(',', $raw_dc_cost) as $v) {
        $v = trim($v);
        if ($v !== '' && ctype_digit($v)) $dcCostIds[] = (int)$v;
    }
}
$dcCostInClause = '';
if (!empty($dcCostIds)) {
    $dcCostInClause = 'AND dcc.dc_cost_acc_id IN (' . implode(',', $dcCostIds) . ')';
}

$raw_start = getStrParam('d_date_start', '');
$raw_end   = getStrParam('d_date_end', '');
$d_date_start = ($raw_start === '' || $raw_start === 'ทั้งหมด') ? null : $raw_start;
$d_date_end   = ($raw_end   === '' || $raw_end   === 'ทั้งหมด') ? null : $raw_end;

// ── 2. i_view → extra WHERE ──────────────────────────────────────────────────
// หมายเหตุ: เดิม dc_department_id ถูกใช้เป็น hidden field ผูกกับ i_view == 2 (permission-based)
// ตอนนี้ dc_department_id กลายเป็นฟิลด์ให้ผู้ใช้เลือกกรองเองในฟอร์มแล้ว จึงย้ายไปกรองแบบ
// bind parameter ปกติ (ดู $extraDeptWhere / $arrParam ด้านล่าง) แทนที่จะผูกกับ i_view
$extraWhere = '';
if ($i_view == 3 && $p_emp !== null) {
    // p_emp ถูก bind อยู่แล้ว ไม่ต้องเพิ่ม
}
// กรองตามแผนก (dc_department_id) — ใช้ (? IS NULL OR ...) เหมือน filter อื่น ๆ
$extraDeptWhere = "AND (? IS NULL OR (SELECT dc_department_id FROM EIS_PROCURE..sp_emp WHERE sp_emp_id = a.sp_emp_id) = ?)";

// ── 3. ORDER BY ────────────────────────────────────────────────────────────────
$orderBy = ($i_type_Rep == 2)
    ? 'c_code ASC, i_period ASC'   // เรียงตามเลขสัญญา
    : 'PR_code ASC, i_period ASC'; // เรียงตามเลขที่ PR

// ── 4. SQL ────────────────────────────────────────────────────────────────────
// DatabaseServer::QueryParam ใช้ ? เป็น placeholder
// NULL param → (? IS NULL OR col = ?) ต้องส่ง null, null ซ้ำ 2 ตัว
// ไม่มี UNION / ไม่มี temp table #tem แล้ว — แทนที่ด้วย derived table pwi_070
// (ROW_NUMBER PARTITION BY chk_id) ต่อ query เดียวจบ ปลอดภัยเวลายิงซ้ำๆ ผ่าน API
$sql = "
SELECT * FROM
(
SELECT
   ROW_NUMBER() OVER(ORDER BY a.c_code, c.i_period ASC) AS row
  ,3 AS i_sys
  ,(SELECT c_code FROM EIS_PROCURE..sp_tor WHERE a.sp_tor_id = tor_id) AS PR_code
  ,ISNULL(c.i_period, 0) AS i_period
  ,(SELECT c_name FROM EIS_PROCURE..sp_emp WHERE sp_emp_id = aa.sp_emp_id) AS emp
  ,CONVERT(varchar(10), d.d_arrive_date, 120) AS d_arrive_date
  ,CONVERT(varchar(10), d.d_checking_date, 120) AS d_checking_date
  ,CONVERT(varchar(10), g.d_create, 120) AS d_doc_withdraw
  ,a.c_name
  ,(SELECT c_name FROM EIS_PROCURE..sp_department WHERE dc_department_id = (SELECT dc_department_id FROM EIS_PROCURE..sp_emp WHERE sp_emp_id = a.sp_emp_id)) AS dc_department
  ,dcc.c_name AS dc_cost_name
  ,CASE
    WHEN d.d_arrive_date IS NULL THEN N'รอรับของ'
    WHEN d.c_code IS NULL AND d.d_arrive_date IS NOT NULL THEN N'รอทำการตรวจรับ'
    WHEN d.c_code IS NOT NULL AND d.d_arrive_date IS NOT NULL AND g.c_code_ref IS NULL THEN N'รอส่งเบิก'
    WHEN d.c_code IS NOT NULL AND g.c_code_ref IS NOT NULL THEN N'ส่งเบิกฝ่ายคลัง'
    WHEN ISNULL(g.c_code_ref, '') != '' THEN N'ส่งเบิกฝ่ายคลัง'
    ELSE ''
  END AS stats_period
  ,CASE WHEN ISNULL(a.parent_id, 0) > 0 THEN (SELECT c_code FROM EIS_PROCURE.dbo.sp_tor_contract WHERE sp_tor_contract_id = a.parent_id) ELSE a.c_code END AS c_code
  ,a.i_enabled AS i_enabled_status
  ,CASE WHEN a.i_is_close = 1 AND g.c_code_ref IS NOT NULL THEN N'ปิดสัญญาแล้ว' ELSE N'กำลังดำเนินการ' END AS stats_con
  ,(SELECT (SELECT c_name FROM NMU_DATACENTER.dbo.dc_expense_budget_type WHERE dc_expense_budget_type_id = aa.dc_expense_budget_type_id) FROM EIS_PROCURE.dbo.sp_tor aa WHERE a.sp_tor_id = tor_id) AS dc_expense_budget_typ
  ,(SELECT (SELECT c_name FROM NMU_EIS.dbo.bg_expense WHERE bg_expense_id = aa.po_expense_id) FROM EIS_PROCURE.dbo.sp_tor aa WHERE a.sp_tor_id = tor_id) AS bg_expense
  ,(SELECT inv_name FROM NMU..dc_creditor WHERE dc_creditor_id = a.dc_creditor_id) AS dc_creditor_name
  ,ISNULL(a.f_total_amt, 0) AS f_total_amt
  ,ISNULL(a.f_type_amt, 0) AS f_type_amt
  ,CONVERT(varchar, a.d_doc_date, 120) AS d_doc_date
  ,CONVERT(varchar, a.d_due_date, 120) AS d_due_date
  ,(SELECT c_name FROM EIS_PROCURE.dbo.sp_emp WHERE sp_emp_id = aa.sp_emp_id) AS sp_emp
  ,CASE WHEN d.c_arrive_code IS NOT NULL THEN ISNULL(c.f_total_amt, 0) ELSE NULL END AS f_period
  ,CASE WHEN d.c_code IS NOT NULL THEN e.f_net_total_price ELSE NULL END AS f_chk
  ,CASE WHEN d.c_code IS NOT NULL THEN gg.f_total ELSE NULL END AS f_withdraw
  ,d.c_arrive_code
  ,d.c_code AS c_code_chk
  ,h.c_approve
  ,g.c_code_ref
  ,ee.c_doc_ref AS c_invoice
  ,d.c_doc_ref
  ,gg.c_code_pv AS c_impv_code
  ,CONVERT(varchar(10), gg.d_pv_date, 120) AS d_pay
  ,gg.f_total AS f_inv
  ,a.i_is_warranty_book ,a.book_no ,a.book_seq ,CONVERT(varchar(10), a.d_book_date, 120) AS d_book_date ,a.f_warranty_amt
  ,a.c_remark ,a.book_warranty_no ,CONVERT(varchar(10), a.d_book_warranty_date, 120) AS d_book_warranty_date ,CONVERT(varchar(10), a.d_book_warranty_end, 120) AS d_book_warranty_end
  ,(SELECT c_name FROM EIS_PROCURE..dc_bank WHERE dc_bank_id = a.dc_bank_id) AS dc_bank_id
  ,a.f_book_warranty_amt ,a.c_remark1 ,a.cashiercheque_on ,a.cashiercheque_seq
  ,CONVERT(varchar(10), a.d_cashiercheque_data, 120) AS d_cashiercheque_data ,a.f_warranty_cashiercheque ,a.c_remark_cashiercheque
FROM EIS_PROCURE.dbo.sp_tor_contract a
INNER JOIN EIS_PROCURE.dbo.sp_tor aa ON a.sp_tor_id = aa.tor_id
LEFT JOIN EIS_PROCURE.dbo.sp_tor_hdr_period c ON a.sp_tor_contract_id = c.sp_tor_contract_id AND ISNULL(c.i_enabled, 1) = 1
LEFT JOIN EIS_PROCURE.dbo.sp_check_period_hdr d ON c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
LEFT JOIN EIS_PROCURE.dbo.sp_check_period_dtl e ON d.sp_check_period_hdr_id = e.sp_check_period_hdr_id
LEFT JOIN EIS_PROCURE.dbo.sp_check_billing_items ee ON e.sp_check_period_hdr_id = ee.sp_check_period_hdr_id
-- ── งวดงาน/po_working: ใช้ derived table แทน temp table #tem (ปลอดภัยเมื่อยิงซ้ำผ่าน API) ──
LEFT JOIN (
    SELECT chk_id, po_working_hdr_id
    FROM (
        SELECT
            aa2.chk_id,
            aa2.po_working_hdr_id,
            ROW_NUMBER() OVER (PARTITION BY aa2.chk_id ORDER BY aa2.po_working_hdr_id ASC) AS rn
        FROM NMU_EIS..po_working_begin_hdr aa2
        INNER JOIN NMU_EIS..po_working_dtl bb2 ON aa2.po_working_hdr_id = bb2.po_working_hdr_id
        LEFT JOIN NMU_EIS..po_working_item pwi_020 ON pwi_020.i_sub_status = '0.20' AND pwi_020.po_working_hdr_id = aa2.po_working_hdr_id
        LEFT JOIN NMU_EIS..po_working_item pwi_050 ON pwi_050.i_sub_status = '0.50' AND pwi_050.po_working_hdr_id = aa2.po_working_hdr_id
        WHERE aa2.chk_id IS NOT NULL
          AND pwi_050.d_doc_date IS NOT NULL
          AND bb2.i_budget_year > 2024
          AND (pwi_050.d_doc_date IS NOT NULL OR pwi_020.d_doc_date IS NOT NULL)
    ) t
    WHERE rn = 1
) pwi_070 ON pwi_070.chk_id = d.sp_check_period_hdr_id
LEFT JOIN NMU_EIS.dbo.po_working_hdr g ON g.po_working_hdr_id = pwi_070.po_working_hdr_id AND g.i_enable = 1
LEFT JOIN NMU_EIS.dbo.po_working_dtl gg ON gg.po_working_hdr_id = g.po_working_hdr_id AND g.i_enable = 1
LEFT JOIN EIS_PROCURE.dbo.vw_doc_d_pay_gx_for_nmuerp h ON h.c_request_desc_user_key = g.c_code_ref
LEFT JOIN NMU_DATACENTER..dc_cost dcc ON dcc.dc_cost_id = a.dc_cost_id
WHERE a.i_enabled IN (1, 2)
  AND a.c_code IS NOT NULL
  AND a.c_code <> 'NULL'
  AND aa.i_enabled = 1
  AND aa.i_type_bg IN (1, 2, 3, 4, 5, 6, 7, 8, 10, 13)
  AND (? IS NULL OR aa.dc_expense_budget_type_id = ?)
  AND (? IS NULL OR aa.po_expense_id = ?)
  AND (? IS NULL OR a.sp_tor_contract_id = ?)
  AND (? IS NULL OR a.d_doc_date >= ?)
  AND (? IS NULL OR a.d_doc_date <= ?)
  AND (? IS NULL OR aa.i_yyyy = ?)
  AND (? IS NULL OR a.sp_emp_id = ?)
  AND (? IS NULL OR a.dc_creditor_id = ?)
  $extraDeptWhere
  $extraWhere
  $dcCostInClause
) AS combined
ORDER BY $orderBy
";

// ── 5. Bind params ───────────────────────────────────────────────────────────
$arrParam = [
    $p_budget,   $p_budget,
    $p_expense,  $p_expense,
    $p_contract, $p_contract,
    $d_date_start, $d_date_start,  // สำหรับ (? IS NULL OR >= ?)
    $d_date_end,   $d_date_end,    // สำหรับ (? IS NULL OR <= ?)
    $p_yyyy,     $p_yyyy,
    $p_emp,      $p_emp,
    $p_creditor, $p_creditor,
    $dc_dept_id, $dc_dept_id,
];

// ── 6. Execute ────────────────────────────────────────────────────────────────
$stmt = $db->QueryParam($sql, $arrParam);

if (!$stmt) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Query error',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$data = [];
while ($row = $db->Fetch($stmt)) {
    $data[] = $row;
}

echo json_encode([
    'success' => true,
    'total'   => count($data),
    'data'    => $data,
], JSON_UNESCAPED_UNICODE);