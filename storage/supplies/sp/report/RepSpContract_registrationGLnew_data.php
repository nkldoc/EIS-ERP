<?php
/**
 * RepSpContract_registrationGL_data.php
 * Endpoint: รับ GET params → query MSSQL → ส่งกลับ JSON
 * ใช้ DatabaseServer เหมือนไฟล์ All_RepSpContract.php
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
$i_sys      = 1; // *** บังคับให้แสดงเฉพาะคณะแพทย์เท่านั้น ตัดการรับค่าจาก GET ออก ***
$i_type_Rep = (int)getStrParam('i_type_Rep', '1');      // 1=PR 2=เลขสัญญา

// ── ส่วนงาน (dc_cost) : เลือกได้หลายรายการ, ค่าที่ส่งมาเป็น id คั่นด้วยจุลภาค ──
// JOIN กับ NMU_DATACENTER..dc_cost เพื่ออ่านชื่อส่วนงานจาก dc_cost_id ของสัญญา
// และกรองโดย dc_cost_acc_id ของตาราง NMU_DATACENTER..dc_cost ตามที่ front-end ส่งมา
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

// แก้เป็น (อ่านจาก key ที่ front-end ส่งจริง + ให้ "ทั้งหมด" แปลว่าไม่กรอง)
$raw_start = getStrParam('d_date_start', '');
$raw_end   = getStrParam('d_date_end', '');
$d_date_start = ($raw_start === '' || $raw_start === 'ทั้งหมด') ? null : $raw_start;
$d_date_end   = ($raw_end   === '' || $raw_end   === 'ทั้งหมด') ? null : $raw_end;

// ── 2. i_view → extra WHERE ──────────────────────────────────────────────────
$extraWhere = '';
if ($i_view == 2 && $dc_dept_id !== null) {
    $extraWhere = "AND (SELECT dc_department_id FROM sp_emp WHERE sp_emp_id = a.sp_emp_id) = $dc_dept_id";
} elseif ($i_view == 3 && $p_emp !== null) {
    // p_emp ถูก bind อยู่แล้ว ไม่ต้องเพิ่ม
}

// ── 3. i_sys filter (wrap UNION ใน subquery) ─────────────────────────────────
$sysCond = '';
if ($i_sys == 1)      $sysCond = 'WHERE i_sys = 1';
elseif ($i_sys == 3)  $sysCond = 'WHERE i_sys = 3';


// ── 4. ORDER BY ───────────────────────────────────────────────────────────────
// อยู่นอก subquery (combined) → ใช้ชื่อ column ที่ SELECT ออกมาแล้วเท่านั้น
$orderBy = ($i_type_Rep == 2)
    ? 'i_sys ASC, c_code ASC, i_period ASC'   // เรียงตามเลขสัญญา
    : 'i_sys ASC, PR_code ASC, i_period ASC'; // เรียงตามเลขที่ PR

// ── 5. SQL ────────────────────────────────────────────────────────────────────
// DatabaseServer::QueryParam ใช้ ? เป็น placeholder
// NULL param → (? IS NULL OR col = ?) ต้องส่ง null, null ซ้ำ 2 ตัว
// NOTE: อย่าเพิ่ม HAVING COUNT(a.sp_tor_contract_id) > 0 ถ้าต้องการให้ root dc_cost_acc_id เช่น 0
//       ยังคงแสดงอยู่แม้ไม่มีสัญญาโดยตรงในแถวของมันเอง
//       หากต้องการนับสัญญาทั้ง subtree ของ dc_cost node ให้ใช้ JOIN กับ child cost nodes
// ตัวอย่าง query ที่รวมกลุ่มต้นทางและลูกไว้ด้วยกัน:
// SELECT
//     dcc.dc_cost_acc_id,
//     dcc.dc_cost_parent_id,
//     dcc.c_code,
//     dcc.c_code_tree,
//     dcc.c_name,
//     COUNT(DISTINCT a.sp_tor_contract_id) AS contract_count
// FROM NMU_DATACENTER..dc_cost dcc
// LEFT JOIN NMU_DATACENTER..dc_cost child
//   ON child.c_code_tree LIKE dcc.c_code_tree + '%'
// LEFT JOIN NMU_ERP.dbo.sp_tor_contract a
//   ON a.dc_cost_id = child.dc_cost_id
//   AND a.i_enabled IN (1, 2)
//   AND a.c_code IS NOT NULL
//   AND a.c_code <> 'NULL'
//   AND ISNULL(a.parent_id, 0) = 0
// LEFT JOIN NMU_ERP.dbo.sp_tor aa
//   ON a.sp_tor_id = aa.tor_id
//   AND aa.i_enabled = 1
//   AND aa.i_type_bg IN (1,2,3,4,5,6,7,8,13)
//   AND aa.i_yyyy = 2026
// WHERE dcc.i_enable = 1
//   AND dcc.i_delete = 2
// GROUP BY
//     dcc.dc_cost_acc_id,
//     dcc.dc_cost_parent_id,
//     dcc.c_code,
//     dcc.c_code_tree,
//     dcc.c_name
// ORDER BY
//     dcc.c_code_tree,
//     dcc.dc_cost_acc_id;
$sql = "
SELECT * FROM 
(

-- ========== คณะแพทย์ i_sys = 1 ==========
SELECT
   ROW_NUMBER() OVER(ORDER BY aa.c_code ASC) AS row
  ,1 AS i_sys
  ,(SELECT c_code FROM dbo.sp_tor WHERE a.sp_tor_id = tor_id) AS PR_code
  ,ISNULL(c.i_period, 0) AS i_period
  ,(SELECT c_name FROM sp_emp WHERE sp_emp_id = aa.sp_emp_id) AS emp
  ,CONVERT(varchar(10), d.d_arrive_date, 120) AS d_arrive_date
,CONVERT(varchar(10), d.d_checking_date, 120) AS d_checking_date
,ISNULL(CONVERT(varchar(10), g.d_doc_date, 120), CONVERT(varchar(10), ggg.d_create, 120)) AS d_doc_withdraw
  ,a.c_name
  ,(SELECT c_name FROM sp_department WHERE dc_department_id = (SELECT dc_department_id FROM sp_emp WHERE sp_emp_id = a.sp_emp_id)) AS dc_department
  ,dcc.c_name AS dc_cost_name
  ,CASE
    WHEN d.d_arrive_date IS NULL THEN N'รอรับของ'
    WHEN d.c_code IS NULL AND d.d_arrive_date IS NOT NULL THEN N'รอทำการตรวจรับ'
    WHEN d.c_code IS NOT NULL AND d.d_arrive_date IS NOT NULL AND g.c_code_ref IS NULL THEN N'รอส่งเบิก'
    WHEN d.c_code IS NOT NULL AND g.c_code_ref IS NOT NULL THEN N'ส่งเบิกฝ่ายคลัง'
    WHEN ISNULL(g.c_code_ref, '') != '' THEN N'ส่งเบิกฝ่ายคลัง'
    ELSE ''
  END AS stats_period
  ,a.c_code
  ,a.i_enabled AS i_enabled_status
  ,CASE WHEN a.i_is_close = 1 AND g.c_code_ref IS NOT NULL THEN N'ปิดสัญญาแล้ว' ELSE N'กำลังดำเนินการ' END AS stats_con
  ,(SELECT (SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = aa.dc_expense_budget_type_id) FROM dbo.sp_tor aa WHERE a.sp_tor_id = tor_id) AS dc_expense_budget_typ
  ,(SELECT (SELECT c_name FROM NMU_eis.dbo.bg_expense WHERE bg_expense_id = aa.po_expense_id) FROM dbo.sp_tor aa WHERE a.sp_tor_id = tor_id) AS bg_expense
  ,(SELECT c_name FROM NMU..dc_creditor WHERE dc_creditor_id = a.dc_creditor_id) AS dc_creditor_name
  ,ISNULL(a.f_total_amt, 0) AS f_total_amt
  ,ISNULL(a.f_type_amt, 0) AS f_type_amt
  ,CONVERT(varchar, a.d_doc_date, 120) AS d_doc_date
  ,CONVERT(varchar, a.d_due_date, 120) AS d_due_date
  ,(SELECT c_name FROM sp_emp WHERE sp_emp_id = a.sp_emp_id) AS sp_emp
  ,CASE WHEN d.c_arrive_code IS NOT NULL THEN ISNULL(c.f_total_amt, 0) ELSE NULL END AS f_period
  ,CASE WHEN d.c_code IS NOT NULL THEN e.f_net_total_price ELSE NULL END AS f_chk
  ,CASE WHEN d.c_code IS NOT NULL THEN ISNULL(g.f_total, gggg.f_total) ELSE NULL END AS f_withdraw
  ,d.c_arrive_code
  ,d.c_code AS c_code_chk
  ,ISNULL(h.c_approve, CASE
    WHEN ISNULL(ggg.i_working_type, 0) = 7 THEN NULL
    WHEN ISNULL(ggg.i_status_last, 0) < 4 THEN NULL
    ELSE gggg.c_approve
  END) AS c_approve
  ,ISNULL(g.c_code_ref, ggg.c_code_ref) AS c_code_ref
  ,g.c_invoice
  ,d.c_doc_ref
  ,h.c_impv_code
  ,ISNULL(h.d_pay, CONVERT(varchar(10), ggggg.d_doc_date, 120)) AS d_pay
  ,ISNULL(h.f_inv, b1.f_per_pay) AS f_inv
  ,a.i_is_warranty_book ,a.book_no ,a.book_seq ,CONVERT(varchar(10), a.d_book_date, 120) AS d_book_date ,a.f_warranty_amt
  ,a.c_remark ,a.book_warranty_no ,CONVERT(varchar(10), a.d_book_warranty_date, 120) AS d_book_warranty_date ,CONVERT(varchar(10), a.d_book_warranty_end, 120) AS d_book_warranty_end
  ,(SELECT c_name FROM dc_bank WHERE dc_bank_id = a.dc_bank_id) AS dc_bank_id
  ,a.f_book_warranty_amt ,a.c_remark1 ,a.cashiercheque_on ,a.cashiercheque_seq
  ,CONVERT(varchar(10), a.d_cashiercheque_data, 120) AS d_cashiercheque_data ,a.f_warranty_cashiercheque ,a.c_remark_cashiercheque
FROM dbo.sp_tor aa
INNER JOIN dbo.sp_tor_contract a ON a.sp_tor_id = aa.tor_id
LEFT JOIN dbo.sp_tor_hdr_period c ON a.sp_tor_contract_id = c.sp_tor_contract_id AND ISNULL(c.i_enabled, 1) = 1
LEFT JOIN dbo.sp_check_period_hdr d ON c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id AND d.i_enabled = 1
LEFT JOIN dbo.sp_check_period_dtl e ON d.sp_check_period_hdr_id = e.sp_check_period_hdr_id
LEFT JOIN dbo.sp_withdraw g ON g.sp_check_period_hdr_id = d.sp_check_period_hdr_id
LEFT JOIN (
  SELECT aa.po_working_hdr_id, aa.d_create, aa.i_working_type, aa.i_status_last, aa.c_code_ref, b.chk_id
  FROM NMU_EIS.dbo.po_working_hdr aa
  INNER JOIN NMU_EIS.dbo.po_working_begin_hdr b ON aa.po_working_hdr_id = b.po_working_hdr_id
  WHERE aa.i_enable = 1 AND b.i_enable = 1 AND b.i_sys = 1
) gg ON d.sp_check_period_hdr_id = gg.chk_id
LEFT JOIN NMU_EIS.dbo.po_working_hdr ggg ON gg.po_working_hdr_id = ggg.po_working_hdr_id AND ggg.i_enable = 1
LEFT JOIN NMU_EIS.dbo.po_working_dtl gggg ON gg.po_working_hdr_id = gggg.po_working_hdr_id
LEFT JOIN NMU_EIS.dbo.po_working_item ggggg ON gg.po_working_hdr_id = ggggg.po_working_hdr_id AND ggggg.i_sub_status = '11.00'
LEFT JOIN NMU_EIS.dbo.po_working_begin_hdr b1 ON gg.po_working_hdr_id = b1.po_working_hdr_id
LEFT JOIN EIS_PROCURE.dbo.vw_doc_d_pay_gx_for_nmuerp h ON h.c_request_desc_user_key = g.c_code_ref
LEFT JOIN NMU_DATACENTER..dc_cost dcc ON dcc.dc_cost_id = a.dc_cost_id
WHERE a.i_enabled IN (1, 2)
  AND a.c_code IS NOT NULL
AND a.c_code <> 'NULL'
  AND aa.i_enabled = 1
  AND aa.i_type_bg IN (1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13)
  AND ISNULL(a.parent_id, 0) = 0
  AND (? IS NULL OR aa.dc_expense_budget_type_id = ?)
  AND (? IS NULL OR aa.po_expense_id = ?)
  AND (? IS NULL OR a.sp_tor_contract_id = ?)
  AND (? IS NULL OR a.d_doc_date >= ?)
  AND (? IS NULL OR a.d_doc_date <= ?)
  AND (? IS NULL OR aa.i_yyyy = ?)
  AND (? IS NULL OR a.sp_emp_id = ? OR aa.sp_emp_id = ?)
  AND (? IS NULL OR a.dc_creditor_id = ?)
  $extraWhere
  $dcCostInClause

) AS combined
$sysCond
ORDER BY $orderBy
";

// ── 6. Bind params ────────────────────────────────────────────────────────────
// แต่ละ block ใช้ params ชุดเดียวกัน → repeat 2 ครั้ง (คณะแพทย์ + มหาวิทยาลัย)
// (? IS NULL OR col = ?) ต้องส่ง 2 ค่า: null/val, null/val
$blockParams = [
    $p_budget,   $p_budget,
    $p_expense,  $p_expense,
    $p_contract, $p_contract,
    $d_date_start, $d_date_start,  // สำหรับ (? IS NULL OR >= ?)
    $d_date_end,   $d_date_end,    // สำหรับ (? IS NULL OR <= ?)
    $p_yyyy,     $p_yyyy,
    $p_emp,      $p_emp,      $p_emp,   // IS NULL check + a.sp_emp_id + aa.sp_emp_id (OR ทั้งฝั่ง PR และฝั่งสัญญา)
    $p_creditor, $p_creditor,
];
$arrParam = $blockParams; // เหลือ block เดียว (คณะแพทย์) ไม่ต้อง merge ซ้ำแล้ว เพราะตัด UNION ALL มหาวิทยาลัยออก

// ── 7. Execute ────────────────────────────────────────────────────────────────
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

// ไม่ต้อง filter ซ้ำแล้ว เพราะ query ด้านบนดึงเฉพาะคณะแพทย์ (i_sys = 1) อยู่แล้ว

echo json_encode([
    'success' => true,
    'total'   => count($data),
    'data'    => $data,
], JSON_UNESCAPED_UNICODE);