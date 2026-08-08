<?php
// ============================================================
// API: Rep_DetailByTypeV7.php — EIS_procure edition
// คืนรายการ PR (sp_tor) ตามปีงบ + เดือนงบที่รับมา
// params: year, yearEn, monthbg, month, Performance_Summary
// fn=List_Detail → JSON
// ============================================================

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db   = new DatabaseServer();
$date = new i_date();

header('Content-Type: application/json; charset=utf-8');

// ===== รับ params =====
$fn      = $_GET['fn']      ?? '';
$monthbg = intval($_GET['monthbg'] ?? 0);  // fiscal month 1-12

// year ที่ส่งมาคือ ปีปฏิทิน ค.ศ. (JS คำนวณแล้ว) แต่กัน edge case พ.ศ. ไว้ด้วย
$year_raw = intval($_GET['year'] ?? 0);
$year_ce  = ($year_raw > 2400) ? $year_raw - 543 : $year_raw;

// แปลง fiscalMonth → เดือน/ปีปฏิทิน ค.ศ. จริง
// fiscal 1=ต.ค., 2=พ.ย., 3=ธ.ค. → ปีปฏิทิน = fiscal_year_CE - 1
// fiscal 4=ม.ค. ... 12=ก.ย.      → ปีปฏิทิน = fiscal_year_CE
// fiscal_year_CE = year_ce + 1 (เพราะ year ที่ JS ส่งคือปีก่อนหน้าของปีงบ)
if ($monthbg >= 1 && $monthbg <= 3) {
    $month_doc = $monthbg + 9;   // ต.ค.=10, พ.ย.=11, ธ.ค.=12
    $year_doc  = $year_ce;       // ปีปฏิทินตรงกับที่ส่งมา
} else {
    $month_doc = $monthbg - 3;   // ม.ค.=1 ... ก.ย.=9
    $year_doc  = $year_ce + 1;   // ปีปฏิทินถัดไป (เพราะ year ที่ JS ส่งคือปีก่อน)
}

// ===== fn router =====
if ($fn === 'debug') {
    echo json_encode([
        'year_raw'  => $year_raw,
        'year_ce'   => $year_ce,
        'year_doc'  => $year_doc,
        'month_doc' => $month_doc,
        'monthbg'   => $monthbg,
    ], JSON_UNESCAPED_UNICODE);
} elseif ($fn === 'debug_sql') {
    // แสดง SQL จริงที่จะ run — ลบทิ้งหลัง test
    $sql = "SELECT COUNT(*) AS cnt FROM dbo.sp_tor
            WHERE i_enabled=1 AND i_type_bg=1
            AND YEAR(d_create)=" . intval($year_doc) . "
            AND MONTH(d_create)=" . intval($month_doc);
    $stmt = $db->QueryParam($sql, []);
    $cnt  = 0;
    if ($stmt) { $row = $db->Fetch($stmt); $cnt = $row['cnt'] ?? 0; }
    echo json_encode([
        'year_doc'  => $year_doc,
        'month_doc' => $month_doc,
        'count'     => $cnt,
        'sql'       => $sql,
    ], JSON_UNESCAPED_UNICODE);
} elseif ($fn === 'List_Detail') {
    List_Detail();
} else {
    echo json_encode(['success' => false, 'message' => 'invalid fn'], JSON_UNESCAPED_UNICODE);
}

// ============================================================
function List_Detail()
{
    global $db, $year_doc, $month_doc;

    // ---- map สถานะ tor_status_id → ข้อความ ----
    // (ปรับ mapping ตาม master table จริงในระบบ)
    $sqlMain = "
        SELECT
            t.tor_id,

            /* เลขที่: ใช้ c_code ก่อน ถ้า NULL ใช้ d_doc_ref แทน */
            ISNULL(NULLIF(t.c_code,''), ISNULL(t.d_doc_ref, '-'))   AS doc_no,

            /* ชื่อโครงการ: ใช้ c_name ก่อน ถ้า NULL ใช้ c_name_egp แทน */
            ISNULL(NULLIF(LTRIM(RTRIM(t.c_name)),''),
                   ISNULL(NULLIF(LTRIM(RTRIM(t.c_name_egp)),''), '-'))  AS project_name,

            /* ผู้รับผิดชอบ: แสดงชื่อจากตาราง sp_emp */
            ISNULL((SELECT TOP 1 c_name FROM dbo.sp_emp WHERE sp_emp_id = t.sp_emp_id), CAST(t.sp_emp_id AS NVARCHAR(50))) AS officer,

            /* วันที่ต่าง ๆ แปลงเป็น dd-mm-yyyy */
            CONVERT(NVARCHAR(10), t.d_create,   105) AS d_create_display,
            CONVERT(NVARCHAR(10), t.d_egp_date, 105) AS d_egp_date_display,
            CONVERT(NVARCHAR(10), t.start_date, 105) AS d_contract_display,

            /* วิธีดำเนินงาน */
            CASE t.i_purchase
                WHEN 1 THEN 'เฉพาะเจาะจง'
                WHEN 2 THEN 'e-market'
                WHEN 3 THEN 'e-bidding'
                WHEN 4 THEN 'คัดเลือก'
                ELSE        'อื่นๆ'
            END AS method,

            /* ประเภทสัญญา */
            CASE t.i_type_contract
                WHEN 1 THEN 'สัญญา'
                WHEN 2 THEN 'ใบสั่ง'
                WHEN 3 THEN 'ข้อตกลง'
                ELSE        '-'
            END AS contract_type,

            /* จำนวนวัน (start→end) */
            CASE
                WHEN t.start_date IS NOT NULL AND t.end_date IS NOT NULL
                THEN DATEDIFF(DAY, t.start_date, t.end_date)
                ELSE NULL
            END AS n_days,

            /* วงเงิน */
            ISNULL(t.f_total_amt, 0) AS amount,

            /* สถานะ: i_step >= 9 = ผ่านเกณฑ์, อื่นๆ = อยู่ระหว่างดำเนินการ */
            CASE
                WHEN t.i_step >= 9 THEN 'ผ่านเกณฑ์'
                WHEN t.i_step  = 0 THEN 'อยู่ระหว่างดำเนินการ'
                ELSE 'ไม่ผ่านเกณฑ์'
            END AS status,

            t.i_step

        FROM dbo.sp_tor t

        WHERE t.i_enabled  = 1
          AND t.i_type_bg  = 1
          AND YEAR(t.d_create)  = " . intval($year_doc) . "
          AND MONTH(t.d_create) = " . intval($month_doc) . "

        ORDER BY t.d_create DESC;
    ";

    $stmt = $db->QueryParam($sqlMain, []);

    $data = [];
    $i    = 0;

    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $data[] = [
                'no'               => ++$i,
                'doc_no'           => $row['doc_no']           !== null ? $row['doc_no']           : '-',
                'project_name'     => $row['project_name']     !== null ? $row['project_name']     : '-',
                'officer'          => $row['officer']          !== null ? $row['officer']          : '-',
                'd_create_display' => $row['d_create_display'] !== null ? $row['d_create_display'] : '-',
                'd_egp'            => $row['d_egp_date_display']!== null? $row['d_egp_date_display']: '-',
                'd_contract'       => $row['d_contract_display']!== null? $row['d_contract_display']: '-',
                'method'           => $row['method']           !== null ? $row['method']           : '-',
                'contract_type'    => $row['contract_type']    !== null ? $row['contract_type']    : '-',
                'days'             => ($row['n_days'] !== null && $row['n_days'] !== '') ? intval($row['n_days']) : '-',
                'amount'           => floatval($row['amount']  ?? 0),
                'status'           => $row['status']           !== null ? $row['status']           : '-',
            ];
        }
    }

    echo json_encode([
        'success'    => true,
        'data'       => $data,
        'totalCount' => $i,
    ], JSON_UNESCAPED_UNICODE);
}