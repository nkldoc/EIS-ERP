<?php
// File: ../api/List_Key_Performance_Indicator.php
header('Content-Type: application/json; charset=utf-8');

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$fn = $_REQUEST['fn'] ?? 'List_Overview';
$i_year = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y'));
if ($i_year > 2400) $i_year -= 543;

// Fiscal Year: Oct (Year-1) to Sep (Year)
$start_date = ($i_year - 1) . "-10-01";
$end_date   = $i_year . "-09-30";

$dc_cost_id = isset($_REQUEST['dc_cost_id']) ? intval($_REQUEST['dc_cost_id']) : 0;
$sp_emp_id = isset($_REQUEST['sp_emp_id']) ? $_REQUEST['sp_emp_id'] : '0';

$contract_type = isset($_REQUEST['contract_type']) ? $_REQUEST['contract_type'] : '';
$use_kpi2 = isset($_REQUEST['use_kpi2']) ? intval($_REQUEST['use_kpi2']) : 1; // Default 1 (True)

// Base Where Clause
$wh = " AND c.c_code IS NOT NULL 
        AND a.i_type_bg = 1 
        AND c.d_doc_date BETWEEN '$start_date' AND '$end_date' ";

if ($dc_cost_id > 0) {
    $wh .= " AND a.dc_cost2_id = $dc_cost_id ";
}
if ($sp_emp_id != '0' && $sp_emp_id != '') {
    // Check if multi-select
    if (strpos($sp_emp_id, ',') !== false) {
        $wh .= " AND a.sp_emp_id IN ($sp_emp_id) ";
    } else {
        $wh .= " AND a.sp_emp_id = $sp_emp_id ";
    }
}
if ($contract_type != '') {
    $wh .= " AND a.i_type_contract IN ($contract_type) ";
}

// Logic for Days Calculation 
$sqlDiffDays = " DATEDIFF(day, convert(date,a.d_egp_date), convert(date,c.d_doc_date)) - (SELECT count(*) from sp_holiday_dtl where d_holiday between convert(date,a.d_egp_date) and convert(date,c.d_doc_date)) ";

// Case Status
if ($use_kpi2 == 1) {
    // Logic from RepKPI2.jrxml (Strict)
    $sqlCaseStatus = " CASE
        WHEN a.tor_type_id = 1 AND a.i_type_contract = 1 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
        WHEN a.tor_type_id = 3 AND a.i_type_contract = 1 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
        WHEN a.tor_type_id = 1 AND a.i_type_contract = 2 AND ($sqlDiffDays) < 26 THEN 'ผ่าน'
        WHEN a.tor_type_id = 3 AND a.i_type_contract = 2 AND ($sqlDiffDays) < 26 THEN 'ผ่าน'
        WHEN a.tor_type_id = 4 AND a.i_type_contract = 2 AND ($sqlDiffDays) < 61 THEN 'ผ่าน'
        WHEN a.tor_type_id = 4 AND a.i_type_contract = 1 AND ($sqlDiffDays) < 61 THEN 'ผ่าน'
        WHEN a.tor_type_id = 4 AND a.i_type_contract = 3 AND ($sqlDiffDays) < 61 THEN 'ผ่าน'
        WHEN a.tor_type_id = 1 AND a.i_type_contract = 3 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
        WHEN a.tor_type_id = 3 AND a.i_type_contract = 3 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
        ELSE 'ไม่ผ่าน'
    END ";
} else {
    // Logic from RepKPI3.jrxml (Lenient: 75/60/100)
    // NOTE: RepKPI3 uses slightly different logic structure (OR conditions). 
    // Adapting to CASE WHEN structure similar to above for consistency.
    // Logic:
    // (a.tor_type_id = 1 AND a.i_type_contract = 1 AND diff < 75)
    // (a.tor_type_id = 3 AND a.i_type_contract = 1 AND diff < 75)
    // (a.tor_type_id = 3 AND a.i_type_contract = 3 AND diff < 75)
    // (a.tor_type_id = 1 AND a.i_type_contract = 3 AND diff < 75)

    // (a.tor_type_id = 1 AND a.i_type_contract = 2 AND diff < 60)
    // (a.tor_type_id = 3 AND a.i_type_contract = 2 AND diff < 60)

    // (a.tor_type_id = 4 AND a.i_type_contract = 2 AND diff < 100)
    // (a.tor_type_id = 4 AND a.i_type_contract = 1 AND diff < 100)
    // (a.tor_type_id = 4 AND a.i_type_contract = 3 AND diff < 100)

    $sqlCaseStatus = " CASE
        WHEN a.tor_type_id IN (1,3) AND a.i_type_contract IN (1,3) AND ($sqlDiffDays) < 75 THEN 'ผ่าน'
        WHEN a.tor_type_id IN (1,3) AND a.i_type_contract = 2 AND ($sqlDiffDays) < 60 THEN 'ผ่าน'
        WHEN a.tor_type_id = 4 AND ($sqlDiffDays) < 100 THEN 'ผ่าน'
        ELSE 'ไม่ผ่าน'
    END ";
}

try {
    if ($fn == 'List_Emp') {
        // --- List Employees (Only those who have TORs) ---
        $sql = "SELECT DISTINCT u.sp_emp_id as id, u.c_name as name 
                FROM dbo.sp_emp u
                WHERE  u.i_enable = 1 AND u.emp_code  > 0
                AND u.c_name IS NOT NULL 
                ORDER BY u.c_name ASC";
        $stmt = $db->Query($sql);
        $data = [];
        while ($row = $db->Fetch($stmt)) {
            $data[] = $row;
        }
        ob_clean();
        echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
    } else if ($fn == 'List_QueryParam') {
        // ---- Overview Stats ----
        $sql = "SELECT 
                    a.tor_id,
                    a.c_code,
                    (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id = a.tor_type_id) AS method_name,
                    MONTH(c.d_doc_date) as doc_month,
                    $sqlCaseStatus AS Pass_status
                FROM dbo.sp_tor a
                INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_id = a.tor_id
                WHERE 1=1 $wh ";

        $stmt = $db->Query($sql);
        if (!$stmt) throw new Exception("SQL Error: " . $db->Error());

        $data = [];
        while ($row = $db->Fetch($stmt)) {
            $method = $row['method_name'] ?? 'อื่นๆ';
            $status = $row['Pass_status'];
            $month_no = intval($row['doc_month']);

            $key = $method . '_' . $month_no;
            if (!isset($data[$key])) {
                $data[$key] = [
                    'method_name' => $method,
                    'month_no'    => $month_no,
                    'cnt_total'   => 0,
                    'cnt_ontime'  => 0
                ];
            }

            $data[$key]['cnt_total']++;
            if ($status == 'ผ่าน') {
                $data[$key]['cnt_ontime']++;
            }
        }

        ob_clean();
        echo json_encode([
            "success" => true,
            "data" => array_values($data)
        ], JSON_UNESCAPED_UNICODE);
    } else if ($fn == 'List_Detail') {
        // ---- Drill Down Detail ----
        $method_name = $_REQUEST['method_name'] ?? '';
        $month_no = $_REQUEST['month_no'] ?? 0;

        $whDetail = $wh;
        if ($month_no > 0) {
            $whDetail .= " AND MONTH(c.d_doc_date) = $month_no ";
        }

        $sql = "SELECT 
                    a.tor_id,
                    a.c_code,
                    a.c_name, 
                    a.d_create, 
                    CONVERT(date,a.d_egp_date) as d_egp_date,
                    CONVERT(date,c.d_doc_date) as d_doc_date,
                    
                    
                    c.c_code as doc_code,
                    (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id = a.tor_type_id) AS method_name,
                    a.f_total_amt,
                    (SELECT TOP 1 c_name FROM dbo.sp_emp WHERE sp_emp_id  = a.sp_emp_id) as emp_name,
                    a.i_type_contract,
                    CASE 
                        WHEN a.i_type_contract = 1 THEN 'สัญญา'
                        WHEN a.i_type_contract = 3 THEN 'จะซื้อจะขาย'
                        ELSE 'ใบสั่ง'
                    END as type_contract_name,
                    $sqlDiffDays AS diff_days,
                    $sqlCaseStatus AS status
                FROM dbo.sp_tor a
                INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_id = a.tor_id
                WHERE 1=1 $whDetail
                ORDER BY c.d_doc_date DESC";

        $stmt = $db->Query($sql);
        if (!$stmt) throw new Exception("SQL Error: " . $db->Error());

        $data = [];
        $i = 1;
        while ($row = $db->Fetch($stmt)) {
            foreach (['d_create', 'd_doc_date', 'd_egp_date'] as $col) {
                if (isset($row[$col]) && $row[$col] instanceof DateTime) {
                    $row[$col] = $row[$col]->format('Y-m-d H:i:s');
                }
            }
            $is_egp_valid = (isset($row['d_egp_date']) && $row['d_egp_date'] && substr($row['d_egp_date'], 0, 4) != '1970' && substr($row['d_egp_date'], 0, 4) != '1900');

            $data[] = [
                'no' => $i++,
                'c_code' => $row['c_code'],
                'c_name' => $row['c_name'],
                'emp_name' => $row['emp_name'],
                'd_create' => (($row['d_create'] && substr($row['d_create'], 0, 4) != '1970' && substr($row['d_create'], 0, 4) != '1900') ? $date->shot_date_from_db($row['d_create']) : ''),
                'd_doc_date' => (($row['d_doc_date'] && substr($row['d_doc_date'], 0, 4) != '1970' && substr($row['d_doc_date'], 0, 4) != '1900') ? $date->shot_date_from_db($row['d_doc_date']) : ''),
                'd_egp_date' => ($is_egp_valid ? $date->shot_date_from_db($row['d_egp_date']) : 'ยังไม่ได้ระบุ'),
                'method_name' => $row['method_name'],
                'i_type_contract' => $row['type_contract_name'],
                'diff_days' => ($is_egp_valid ? (is_null($row['diff_days']) ? 0 : $row['diff_days']) : 0),
                'status' => $row['status'] == 'ผ่าน' ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์',
                'amount' => number_format($row['f_total_amt'], 2)
            ];
        }

        ob_clean();
        echo json_encode([
            "success" => true,
            "data" => $data
        ], JSON_UNESCAPED_UNICODE);
    }
} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
