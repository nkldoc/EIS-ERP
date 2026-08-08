<?php
ob_start(); // ← [แก้ไข] เพิ่ม ob_start() บรรทัดแรกสุด เพื่อดักจับ output ที่อาจหลุดจาก include files
// File: ../api/List_Key_Performance_Indicator.php
// ===== KPI API (Eis_procure) =====
// [แก้ไข] ob_start() บรรทัดแรก — ป้องกัน SQL debug text หลุดจาก config/DatabaseServer/i_date ออกมาปน JSON
// [แก้ไข] List_Emp: ลบ emp_code > 0 ออก — sp_emp ของ Eis_procure ไม่มี field นี้
// [แก้ไข] List_Emp: UNION 3 field (sp_emp_id, sp_emp_id2, sp_emp_id3) ครบถ้วน
// [แก้ไข] WHERE emp filter: กรอง OR ทั้ง 3 field
// [แก้ไข] Date validity: เช็คทั้ง 1970 และ 1900 (ค่า default SQL Server)
// [เพิ่ม] Debug_SQL fn สำหรับ dev (ลบออกเมื่อ deploy production)
header('Content-Type: application/json; charset=utf-8');

// *** ใช้ config ของ Eis_procure ***
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db   = new DatabaseServer();
$date = new i_date();

$fn     = $_REQUEST['fn']       ?? 'List_QueryParam';
$i_year = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : intval(date('Y'));
if ($i_year > 2400) $i_year -= 543;

// ปีงบประมาณ: ต.ค.(ปีก่อน) - ก.ย.(ปีนี้)
$start_date = ($i_year - 1) . "-10-01";
$end_date   = $i_year       . "-09-30";

$sp_emp_id     = isset($_REQUEST['sp_emp_id'])     ? $_REQUEST['sp_emp_id']        : '0';
$contract_type = isset($_REQUEST['contract_type']) ? $_REQUEST['contract_type']    : '';
$use_kpi2      = isset($_REQUEST['use_kpi2'])       ? intval($_REQUEST['use_kpi2']) : 1;

// ==================== WHERE BASE ====================
// sp_tor           → alias a
// sp_tor_contract  → alias c
$wh  = " AND c.c_code IS NOT NULL ";
$wh .= " AND a.i_type_bg = 1 ";
$wh .= " AND c.d_doc_date BETWEEN '$start_date' AND '$end_date' ";

// [แก้ไข] กรองครอบคลุม sp_emp_id, sp_emp_id2, sp_emp_id3 ด้วย OR
if ($sp_emp_id != '0' && $sp_emp_id != '') {
    if (strpos($sp_emp_id, ',') !== false) {
        $wh .= " AND (
            a.sp_emp_id  IN ($sp_emp_id) OR
            a.sp_emp_id2 IN ($sp_emp_id) OR
            a.sp_emp_id3 IN ($sp_emp_id)
        ) ";
    } else {
        $wh .= " AND (
            a.sp_emp_id  = $sp_emp_id OR
            a.sp_emp_id2 = $sp_emp_id OR
            a.sp_emp_id3 = $sp_emp_id
        ) ";
    }
}
if ($contract_type != '') {
    $wh .= " AND a.i_type_contract IN ($contract_type) ";
}

// ==================== DAYS CALCULATION ====================
// นับวันทำการ (หักวันหยุด) จากวันที่ประกาศ EGP ถึงวันที่ทำสัญญา
$sqlDiffDays = "
    DATEDIFF(day, CONVERT(date, a.d_egp_date), CONVERT(date, c.d_doc_date))
    - (
        SELECT COUNT(*)
        FROM sp_holiday_dtl
        WHERE d_holiday BETWEEN CONVERT(date, a.d_egp_date) AND CONVERT(date, c.d_doc_date)
    )
";

// ==================== PASS/FAIL CRITERIA ====================
// tor_type_id : 1=ประกวดราคา(e-bidding), 3=คัดเลือก, 4=เฉพาะเจาะจง
// i_type_contract : 1=สัญญา, 2=ใบสั่ง, 3=จะซื้อจะขาย
if ($use_kpi2 == 1) {
    // เกณฑ์วันทำการ (Strict) — RepKPI2
    $sqlCaseStatus = "
        CASE
            WHEN a.tor_type_id = 1 AND a.i_type_contract = 1 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
            WHEN a.tor_type_id = 3 AND a.i_type_contract = 1 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
            WHEN a.tor_type_id = 1 AND a.i_type_contract = 2 AND ($sqlDiffDays) < 26 THEN 'ผ่าน'
            WHEN a.tor_type_id = 3 AND a.i_type_contract = 2 AND ($sqlDiffDays) < 26 THEN 'ผ่าน'
            WHEN a.tor_type_id = 4 AND a.i_type_contract = 1 AND ($sqlDiffDays) < 61 THEN 'ผ่าน'
            WHEN a.tor_type_id = 4 AND a.i_type_contract = 2 AND ($sqlDiffDays) < 61 THEN 'ผ่าน'
            WHEN a.tor_type_id = 4 AND a.i_type_contract = 3 AND ($sqlDiffDays) < 61 THEN 'ผ่าน'
            WHEN a.tor_type_id = 1 AND a.i_type_contract = 3 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
            WHEN a.tor_type_id = 3 AND a.i_type_contract = 3 AND ($sqlDiffDays) < 40 THEN 'ผ่าน'
            ELSE 'ไม่ผ่าน'
        END
    ";
} else {
    // เกณฑ์วันปฏิทิน (Lenient) — RepKPI3
    $sqlCaseStatus = "
        CASE
            WHEN a.tor_type_id IN (1,3) AND a.i_type_contract IN (1,3) AND ($sqlDiffDays) < 75  THEN 'ผ่าน'
            WHEN a.tor_type_id IN (1,3) AND a.i_type_contract = 2       AND ($sqlDiffDays) < 60  THEN 'ผ่าน'
            WHEN a.tor_type_id = 4                                        AND ($sqlDiffDays) < 100 THEN 'ผ่าน'
            ELSE 'ไม่ผ่าน'
        END
    ";
}

// ==================== ROUTER ====================
try {

    // --------------------------------------------------
    // fn = List_Emp
    // ดึงรายชื่อบุคลากร (ผู้รับผิดชอบ) ที่มีข้อมูล TOR จริงในปีงบประมาณที่เลือก
    // [แก้ไข] ลบ emp_code > 0 ออก — field นี้ไม่มีใน sp_emp ของ Eis_procure
    // [แก้ไข] UNION 3 field เพื่อดึงผู้รับผิดชอบครบทุก field
    // --------------------------------------------------
    if ($fn == 'List_Emp') {

        $sql = "
            SELECT DISTINCT u.sp_emp_id AS id, u.c_name AS name
            FROM dbo.sp_emp u
            INNER JOIN dbo.sp_tor a          ON a.sp_emp_id  = u.sp_emp_id
            INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_id  = a.tor_id
            WHERE u.i_enable = 1
              AND u.c_name IS NOT NULL
              AND a.i_type_bg = 1
              AND c.c_code IS NOT NULL
              AND c.d_doc_date BETWEEN '$start_date' AND '$end_date'
            UNION
            SELECT DISTINCT u.sp_emp_id AS id, u.c_name AS name
            FROM dbo.sp_emp u
            INNER JOIN dbo.sp_tor a          ON a.sp_emp_id2 = u.sp_emp_id
            INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_id  = a.tor_id
            WHERE u.i_enable = 1
              AND u.c_name IS NOT NULL
              AND a.i_type_bg = 1
              AND c.c_code IS NOT NULL
              AND c.d_doc_date BETWEEN '$start_date' AND '$end_date'
            UNION
            SELECT DISTINCT u.sp_emp_id AS id, u.c_name AS name
            FROM dbo.sp_emp u
            INNER JOIN dbo.sp_tor a          ON a.sp_emp_id3 = u.sp_emp_id
            INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_id  = a.tor_id
            WHERE u.i_enable = 1
              AND u.c_name IS NOT NULL
              AND a.i_type_bg = 1
              AND c.c_code IS NOT NULL
              AND c.d_doc_date BETWEEN '$start_date' AND '$end_date'
            ORDER BY name ASC
        ";

        $stmt = $db->Query($sql);
        if (!$stmt) throw new Exception("List_Emp SQL Error: " . $db->Error());

        $data = [];
        while ($row = $db->Fetch($stmt)) {
            $data[] = ['id' => $row['id'], 'name' => $row['name']];
        }

        ob_clean();
        echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);

    // --------------------------------------------------
    // fn = List_QueryParam
    // สรุปยอด KPI รายเดือน × วิธีดำเนินงาน
    // กรองตาม sp_emp_id (ผู้รับผิดชอบ) ผ่าน $wh
    // --------------------------------------------------
    } elseif ($fn == 'List_QueryParam') {

        $sql = "
            SELECT
                a.tor_id,
                a.c_code,
                (
                    SELECT TOP 1 c_name
                    FROM dbo.sp_type_status
                    WHERE sp_type_status_id = a.tor_type_id
                ) AS method_name,
                MONTH(c.d_doc_date) AS doc_month,
                $sqlCaseStatus      AS Pass_status
            FROM dbo.sp_tor a
            INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_id = a.tor_id
            WHERE 1=1 $wh
        ";

        $stmt = $db->Query($sql);
        if (!$stmt) throw new Exception("List_QueryParam SQL Error: " . $db->Error());

        $data = [];
        while ($row = $db->Fetch($stmt)) {
            $method   = $row['method_name'] ?? 'อื่นๆ';
            $status   = $row['Pass_status'];
            $month_no = intval($row['doc_month']);
            $key      = $method . '_' . $month_no;

            if (!isset($data[$key])) {
                $data[$key] = [
                    'method_name' => $method,
                    'month_no'    => $month_no,
                    'cnt_total'   => 0,
                    'cnt_ontime'  => 0
                ];
            }
            $data[$key]['cnt_total']++;
            if ($status === 'ผ่าน') {
                $data[$key]['cnt_ontime']++;
            }
        }

        ob_clean();
        echo json_encode(["success" => true, "data" => array_values($data)], JSON_UNESCAPED_UNICODE);

    // --------------------------------------------------
    // fn = List_Detail
    // รายละเอียด Drill-Down รายการ
    // กรองตาม sp_emp_id (ผู้รับผิดชอบ) ผ่าน $wh
    // --------------------------------------------------
    } elseif ($fn == 'List_Detail') {

        $method_name = $_REQUEST['method_name'] ?? '';
        $month_no    = isset($_REQUEST['month_no']) ? intval($_REQUEST['month_no']) : 0;
        $status_filter = $_REQUEST['status_filter'] ?? 'all';  // 'all', 'pass', 'fail'

        $whDetail = $wh;
        if ($month_no > 0) {
            $whDetail .= " AND MONTH(c.d_doc_date) = $month_no ";
        }
        if ($method_name != '') {
            $safe_method = str_replace("'", "''", $method_name);
            $whDetail .= "
                AND (
                    SELECT TOP 1 c_name
                    FROM dbo.sp_type_status
                    WHERE sp_type_status_id = a.tor_type_id
                ) = '$safe_method'
            ";
        }
        // Add status filter
        if ($status_filter === 'pass') {
            $whDetail .= " AND ($sqlCaseStatus) = 'ผ่าน' ";
        } elseif ($status_filter === 'fail') {
            $whDetail .= " AND ($sqlCaseStatus) != 'ผ่าน' ";
        }

        $sql = "
            SELECT
                a.tor_id,
                a.c_code,
                a.c_name,
                a.d_create,
                CONVERT(date, a.d_egp_date) AS d_egp_date,
                CONVERT(date, c.d_doc_date) AS d_doc_date,
                c.c_code AS doc_code,
                (
                    SELECT TOP 1 c_name
                    FROM dbo.sp_type_status
                    WHERE sp_type_status_id = a.tor_type_id
                ) AS method_name,
                a.f_total_amt,
                (
                    SELECT TOP 1 c_name
                    FROM dbo.sp_emp
                    WHERE sp_emp_id = a.sp_emp_id
                ) AS emp_name,
                a.i_type_contract,
                CASE
                    WHEN a.i_type_contract = 1 THEN 'สัญญา'
                    WHEN a.i_type_contract = 3 THEN 'จะซื้อจะขาย'
                    ELSE 'ใบสั่ง'
                END AS type_contract_name,
                $sqlDiffDays   AS diff_days,
                $sqlCaseStatus AS status
            FROM dbo.sp_tor a
            INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_id = a.tor_id
            WHERE 1=1 $whDetail
            ORDER BY c.d_doc_date DESC
        ";

        $stmt = $db->Query($sql);
        if (!$stmt) throw new Exception("List_Detail SQL Error: " . $db->Error());

        $data = [];
        $i    = 1;
        while ($row = $db->Fetch($stmt)) {

            // แปลง DateTime object เป็น string
            foreach (['d_create', 'd_doc_date', 'd_egp_date'] as $col) {
                if (isset($row[$col]) && $row[$col] instanceof DateTime) {
                    $row[$col] = $row[$col]->format('Y-m-d H:i:s');
                }
            }

            // [แก้ไข] เช็คทั้ง 1970 และ 1900 (ค่า default SQL Server)
            $is_egp_valid = (
                isset($row['d_egp_date']) && $row['d_egp_date'] &&
                substr($row['d_egp_date'], 0, 4) != '1970' &&
                substr($row['d_egp_date'], 0, 4) != '1900'
            );
            $is_create_valid = (
                isset($row['d_create']) && $row['d_create'] &&
                substr($row['d_create'], 0, 4) != '1970' &&
                substr($row['d_create'], 0, 4) != '1900'
            );
            $is_doc_valid = (
                isset($row['d_doc_date']) && $row['d_doc_date'] &&
                substr($row['d_doc_date'], 0, 4) != '1970' &&
                substr($row['d_doc_date'], 0, 4) != '1900'
            );

            $data[] = [
                'no'              => $i++,
                'c_code'          => $row['c_code']             ?? '',
                'c_name'          => $row['c_name']             ?? '',
                'emp_name'        => $row['emp_name']           ?? '',
                'd_create'        => $is_create_valid ? $date->shot_date_from_db($row['d_create'])   : '',
                'd_doc_date'      => $is_doc_valid    ? $date->shot_date_from_db($row['d_doc_date']) : '',
                'd_egp_date'      => $is_egp_valid    ? $date->shot_date_from_db($row['d_egp_date']) : 'ยังไม่ได้ระบุ',
                'method_name'     => $row['method_name']        ?? '',
                'i_type_contract' => $row['type_contract_name'] ?? '',
                'diff_days'       => $is_egp_valid ? (is_null($row['diff_days']) ? 0 : intval($row['diff_days'])) : 0,
                'status'          => ($row['status'] === 'ผ่าน') ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์',
                'amount'          => number_format(floatval($row['f_total_amt']), 2)
            ];
        }

        ob_clean();
        echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);

    // --------------------------------------------------
    // fn = Debug_SQL  (ใช้ตรวจสอบ SQL ระหว่าง dev เท่านั้น)
    // ลบออกหรือใส่ comment เมื่อ deploy production
    // --------------------------------------------------
    } elseif ($fn == 'Debug_SQL') {

        $debug = [
            'params' => [
                'year'          => $i_year,
                'start_date'    => $start_date,
                'end_date'      => $end_date,
                'sp_emp_id'     => $sp_emp_id,
                'contract_type' => $contract_type,
                'use_kpi2'      => $use_kpi2,
            ],
            'sql_diffdays'   => trim(preg_replace('/\s+/', ' ', $sqlDiffDays)),
            'sql_casestatus' => trim(preg_replace('/\s+/', ' ', $sqlCaseStatus)),
            'where_clause'   => trim(preg_replace('/\s+/', ' ', $wh)),
        ];

        ob_clean();
        echo json_encode(["success" => true, "debug" => $debug], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

    } else {
        ob_clean();
        echo json_encode(["success" => false, "message" => "ไม่พบ function: $fn"], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    ob_clean();
    echo json_encode([
        "success" => false,
        "message" => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}