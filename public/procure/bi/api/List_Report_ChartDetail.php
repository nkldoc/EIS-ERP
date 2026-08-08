<?php
error_reporting(0);
ini_set('display_errors', '0');
ob_start();

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

ob_clean();

$db   = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con  = null;

function List_QueryParam()
{
    global $db, $date, $root, $data, $con;
    $totalCount = 0;
    ${$root} = [];

    $where = "";

    // ---- Dept filter (dc_cost2_id) ----
    if (!empty($_REQUEST['dept'])) {
        $deptSafe = preg_replace('/[^0-9,]/', '', $_REQUEST['dept']);
        if ($deptSafe !== '') {
            // รองรับ dc_cost2_id = NULL หรือ 0 (ยังไม่ได้ระบุ)
            $where .= " AND (ISNULL(b.dc_cost2_id, 0) IN ({$deptSafe})) ";
        }
    }

    // ---- Staff filter (sp_emp_id) ----
    if (!empty($_REQUEST['staff'])) {
        $staffSafe = preg_replace('/[^0-9,]/', '', $_REQUEST['staff']);
        if ($staffSafe !== '') {
            // รองรับ sp_emp_id = NULL หรือ 0 (ยังไม่ได้ระบุ)
            $where .= " AND (ISNULL(b.sp_emp_id, 0) IN ({$staffSafe})) ";
        }
    }

    // ---- Method filter (ประเภทงาน จาก click กราฟ) ----
    if (!empty($_REQUEST['method'])) {
        $method = $_REQUEST['method'];
        $methodMap = [
            'โครงการต่อเนื่อง' => "ISNULL(b.i_type_bg,0) = 2",
            'ครุภัณฑ์'         => "ISNULL(b.i_product_type,0) = 2 AND ISNULL(b.i_type_bg,0) <> 2",
            'วัสดุ'            => "ISNULL(b.i_product_type,0) IN (1,3) AND ISNULL(b.i_purchase,0) = 1 AND ISNULL(b.i_type_bg,0) <> 2",
            'วัสดุ (จ้างซื้อ)' => "ISNULL(b.i_product_type,0) IN (1,3) AND ISNULL(b.i_purchase,0) = 2 AND ISNULL(b.i_type_bg,0) <> 2",
            'เช่า'             => "ISNULL(b.i_purchase,0) = 3 AND ISNULL(b.i_type_bg,0) <> 2",
            'จ้างไม่ได้ของ'    => "ISNULL(b.i_purchase,0) = 2 AND ISNULL(b.i_product_type,0) = 0 AND ISNULL(b.i_type_bg,0) <> 2",
            'งานซื้อ'          => "ISNULL(b.i_purchase,0) = 1 AND ISNULL(b.i_product_type,0) = 0 AND ISNULL(b.i_type_bg,0) <> 2",
        ];
        if (isset($methodMap[$method])) {
            $where .= " AND ({$methodMap[$method]}) ";
        }
    }

    // ---- Month / data_type filter ----
    // eis_procure: ปีงบประมาณเริ่ม ต.ค.(10) = idx 0 ... ก.ย.(9) = idx 11
    // sp_status_hdr_id = 26 = "การมอบหมายฝ่ายงาน" = จ่ายงานแล้ว
    $month_idx = isset($_REQUEST['month_idx']) ? intval($_REQUEST['month_idx']) : 12;
    $data_type = $_REQUEST['data_type'] ?? 'entry';

    if ($data_type === 'entry') {
        // งานเข้าใหม่ในเดือนนั้น
        if ($month_idx !== 12) {
            $where .= " AND (CASE WHEN MONTH(b.d_create) >= 10 THEN MONTH(b.d_create) - 10 ELSE MONTH(b.d_create) + 2 END) = {$month_idx} ";
        }
    } elseif ($data_type === 'assigned') {
        // จ่ายงานแล้ว
        $monthCondition = "";
        if ($month_idx !== 12) {
            $monthCondition = "HAVING (CASE WHEN MONTH(MAX(ti.act_date_dt)) >= 10 THEN MONTH(MAX(ti.act_date_dt)) - 10 ELSE MONTH(MAX(ti.act_date_dt)) + 2 END) = {$month_idx}";
        }
        $where .= " AND EXISTS (
            SELECT 1 FROM sp_tor_item ti
            WHERE ti.tor_id = b.tor_id AND ti.sp_status_hdr_id = 26
            GROUP BY ti.tor_id
            {$monthCondition}
        ) ";
    } elseif ($data_type === 'pending') {
        // รอดำเนินการ = ยังไม่มี status 26
        $where .= " AND NOT EXISTS (
            SELECT 1 FROM sp_tor_item ti
            WHERE ti.tor_id = b.tor_id AND ti.sp_status_hdr_id = 26
        ) ";
    }
    // data_type = 'all' หรืออื่นๆ = ไม่กรอง (แสดงทั้งหมด)

    // ---- Year filter ----
    if (!empty($_REQUEST["year_en"]) && intval($_REQUEST["year_en"]) > 0) {
        $yearEn = intval($_REQUEST["year_en"]);
        $where .= " AND b.i_yyyy = {$yearEn} ";
    }

    // ---- SQL ----
    $sqlMain = "SET NOCOUNT ON
        SELECT
            b.tor_id                                                                        AS pr_id,
            b.c_code,
            b.c_name,
            ISNULL(b.f_total_amt, 0)                                                        AS f_amt,
            -- รหัสงบ: po_expense_id join bg_expense
            b.po_expense_id                                                                  AS bg_expense_id,
            (SELECT c_code FROM bg_expense
             WHERE bg_expense_id = b.po_expense_id)                                         AS bg_expense_code,
            (SELECT c_name FROM bg_expense
             WHERE bg_expense_id = b.po_expense_id)                                         AS bg_expense,
            b.dc_expense_budget_type_id,
            (SELECT c_name FROM dc_expense_budget_type
             WHERE dc_expense_budget_type_id = b.dc_expense_budget_type_id)                 AS dc_expense_budget_type,
            -- ส่วนงาน: dc_cost2_id คือหน่วยงานจริง เช่น คณะพยาบาล, ฝ่ายพัสดุ
            b.dc_cost_id,
            (SELECT c_name FROM dc_cost WHERE dc_cost_id = b.dc_cost_id)                    AS dc_cost,
            (SELECT c_name FROM dc_cost WHERE dc_cost_id = b.dc_cost2_id)                   AS dc_cost_id2,
            -- ผู้รับผิดชอบ
            (SELECT c_name FROM sp_emp WHERE sp_emp_id = b.sp_emp_id)                       AS sp_emp,
            -- สถานะ
            (SELECT c_name FROM sp_status_hdr WHERE sp_status_hdr_id = b.tor_status_id)    AS sp_status_hdr,
            -- หน่วยงาน: ใช้ dc_cost2_id เป็นหลัก (= ส่วนงานจริง)
            ISNULL(
                (SELECT c_name FROM dc_cost WHERE dc_cost_id = b.dc_cost2_id),
                (SELECT c_name FROM sp_department WHERE dc_department_id = b.dc_department_id)
            )                                                                               AS dc_department,
            -- วันที่มอบหมายฝ่ายงาน (จ่ายงาน) = status 26
            CONVERT(VARCHAR(20), (
                SELECT TOP 1 act_date_dt FROM sp_tor_item
                WHERE tor_id = b.tor_id AND sp_status_hdr_id = 26
                ORDER BY id DESC
            ), 120)                                                                          AS d_act_date_dt26,
            -- วันที่มอบหมายผู้ปฏิบัติงาน (รับงาน) = status 24
            CONVERT(VARCHAR(20), (
                SELECT TOP 1 act_date_dt FROM sp_tor_item
                WHERE tor_id = b.tor_id AND sp_status_hdr_id = 24
                ORDER BY id DESC
            ), 120)                                                                          AS d_act_date_dt24,
            -- ประเภทงาน
            CASE
                WHEN ISNULL(b.i_type_bg, 0) = 2                                        THEN N'โครงการต่อเนื่อง'
                WHEN ISNULL(b.i_product_type, 0) = 2                                   THEN N'ครุภัณฑ์'
                WHEN ISNULL(b.i_product_type, 0) IN (1, 3)
                     AND ISNULL(b.i_purchase, 0) = 1                                   THEN N'วัสดุ'
                WHEN ISNULL(b.i_product_type, 0) IN (1, 3)
                     AND ISNULL(b.i_purchase, 0) = 2                                   THEN N'วัสดุ (จ้างซื้อ)'
                WHEN ISNULL(b.i_purchase, 0) = 3                                       THEN N'เช่า'
                WHEN ISNULL(b.i_purchase, 0) = 2
                     AND ISNULL(b.i_product_type, 0) = 0                               THEN N'จ้างไม่ได้ของ'
                WHEN ISNULL(b.i_purchase, 0) = 1
                     AND ISNULL(b.i_product_type, 0) = 0                               THEN N'งานซื้อ'
                WHEN ISNULL(b.i_type_contract, 0) = 3 THEN N'จะซื้อจะขาย'
                ELSE N'PR นี้ยังไม่ได้ระบุ'
            END                                                                              AS method_name
        FROM sp_tor b
        WHERE b.i_enabled = 1
          AND ISNULL(b.i_is_notor, 0) = 0
          AND ISNULL(b.i_parent, 0)   = 0
          {$where}
        ORDER BY b.d_create DESC
    ";

    if (!empty($_REQUEST["show_sql"])) {
        header('Content-Type: text/plain; charset=utf-8');
        echo $sqlMain;
        exit;
    }

    $stmt = $db->QueryParam($sqlMain, array());
    $sqlError = ($stmt === false) ? "SQL failed - check show_sql=1 for details" : null;

    if ($stmt) {
        $no = 0;
        while ($row = $db->Fetch($stmt)) {
            $sp_tor_id = $row['pr_id'];
            ${$root}[] = array(
                "i_type"                    => 1,
                "no"                        => ++$no,
                "tor_id"                    => $sp_tor_id,
                "sp_tor_id"                 => $row["pr_id"],
                "c_code"                    => $row["c_code"],
                "c_name"                    => $row["c_name"],
                "sp_emp"                    => $row["sp_emp"],
                "sp_status_hdr"             => $row["sp_status_hdr"],
                "dc_department"             => $row["dc_department"],
                "dc_cost"                   => $row["dc_cost"],
                "dc_cost_id2"               => $row["dc_cost_id2"],
                "bg_expense_code"           => $row["bg_expense_code"],
                "bg_expense"                => $row["bg_expense"],
                "bg_expense_id"             => $row["bg_expense_id"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "dc_expense_budget_type"    => $row["dc_expense_budget_type"],
                "method_name"               => $row["method_name"],
                "event_type"                => "",
                "sp_event_detail"           => "",
                "f_amt"                     => (float) $row["f_amt"],
                "d_act_date_dt26"           => $row["d_act_date_dt26"],
                "d_act_date_dt24"           => $row["d_act_date_dt24"],
                "children"                  => [],
            );
            $totalCount = $no;
        }
    }

    return json_encode(array(
        "debug"      => true,
        "totalCount" => $totalCount,
        "sql_error"  => $sqlError,
        "data"       => ${$root},
    ), JSON_UNESCAPED_UNICODE);
}

// ---- Router ----
$fn = $_REQUEST['fn'] ?? '';
while (ob_get_level() > 0) ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
if ($fn === 'List_QueryParam') {
    echo List_QueryParam();
} else {
    echo json_encode(['success' => false, 'message' => 'invalid fn']);
}