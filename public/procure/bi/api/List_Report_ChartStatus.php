<?php
error_reporting(0);
ini_set('display_errors', '0');
ob_start();

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

ob_clean();

$db = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
    global $db;
    // รับค่าปีงบประมาณ (พ.ศ.) และแปลงเป็น ค.ศ. เพื่อใช้ใน Query
    $yearTh = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y') + 543);
    $yearEn = $yearTh - 543;

    // eis_procure: ปีงบประมาณเริ่มต้น ต.ค. (month 10)
    // month_idx: ต.ค.=0, พ.ย.=1, ธ.ค.=2, ม.ค.=3, ..., ก.ย.=11
    $sqlMain = "SET NOCOUNT ON
    SELECT
        a.tor_id,
        -- เดือนที่งาน 'เข้าใหม่' (0-11: ต.ค.=0)
        CASE
            WHEN MONTH(a.d_create) >= 10
            THEN MONTH(a.d_create) - 10
            ELSE MONTH(a.d_create) + 2
        END AS month_idx,
        -- เดือนที่ 'จ่ายงานแล้ว' (0-11: ต.ค.=0)
        CASE
            WHEN t.act_date IS NOT NULL AND MONTH(t.act_date) >= 10 THEN MONTH(t.act_date) - 10
            WHEN t.act_date IS NOT NULL THEN MONTH(t.act_date) + 2
            ELSE NULL
        END AS assigned_idx,
        -- ชื่อผู้รับผิดชอบ (eis_procure: sp_emp ไม่มี prefix)
        ISNULL((SELECT c_name FROM sp_emp WHERE sp_emp_id = a.sp_emp_id), 'ยังไม่ได้ระบุ') AS staff_name,
        ISNULL(a.sp_emp_id, 0) AS sp_emp_id,
        -- ส่วนงาน: dc_cost2_id = หน่วยงานจริง
        ISNULL(a.dc_cost2_id, 0) AS dc_cost2_id,
        ISNULL((SELECT c_name FROM dc_cost WHERE dc_cost_id = a.dc_cost2_id), 'ยังไม่ได้ระบุ') AS dc_cost2_name,
        -- ประเภทงาน (ปรับตาม data จริงของ eis_procure)
        -- i_product_type: 1=วัสดุ, 2=ครุภัณฑ์, 3=วัสดุ
        -- i_purchase: 1=ซื้อ, 2=จ้าง, 3=เช่า
        -- i_type_bg: 2=โครงการต่อเนื่อง
        CASE
            WHEN ISNULL(a.i_type_bg, 0) = 2                                        THEN N'โครงการต่อเนื่อง'
            WHEN ISNULL(a.i_product_type, 0) = 2                                   THEN N'ครุภัณฑ์'
            WHEN ISNULL(a.i_product_type, 0) IN (1, 3)
                 AND ISNULL(a.i_purchase, 0) = 1                                   THEN N'วัสดุ'
            WHEN ISNULL(a.i_product_type, 0) IN (1, 3)
                 AND ISNULL(a.i_purchase, 0) = 2                                   THEN N'วัสดุ (จ้างซื้อ)'
            WHEN ISNULL(a.i_purchase, 0) = 3                                       THEN N'เช่า'
            WHEN ISNULL(a.i_purchase, 0) = 2
                 AND ISNULL(a.i_product_type, 0) = 0                               THEN N'จ้างไม่ได้ของ'
            WHEN ISNULL(a.i_purchase, 0) = 1
                 AND ISNULL(a.i_product_type, 0) = 0                               THEN N'งานซื้อ'
            ELSE N'ยังไม่ได้ระบุ'
        END AS method_name,
        -- สถานะปัจจุบัน
        CASE
            WHEN t.act_date IS NOT NULL THEN 'จ่ายงานแล้ว'
            ELSE 'รอดำเนินการ'
        END AS status_name
    FROM sp_tor a
    OUTER APPLY (
        SELECT MAX(act_date_dt) AS act_date
        FROM sp_tor_item
        WHERE tor_id = a.tor_id AND sp_status_hdr_id = 26
    ) t
    WHERE a.i_enabled = 1
      AND ISNULL(a.i_is_notor, 0) = 0
      AND ISNULL(a.i_parent, 0) = 0
      AND a.i_yyyy = {$yearEn}";

    $stmt = $db->QueryParam($sqlMain, array());
    if (!$stmt) {
        echo json_encode(["success" => false, "message" => "Database query failed"]);
        return;
    }
    $data = [];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $data[] = [
                'month_idx'    => intval($row['month_idx']),
                'assigned_idx' => ($row['assigned_idx'] !== null) ? intval($row['assigned_idx']) : null,
                'staff_name'   => $row['staff_name'],
                'sp_emp_id'    => intval($row['sp_emp_id']),
                'dc_cost2_id'  => intval($row['dc_cost2_id']),
                'dc_cost2_name'=> $row['dc_cost2_name'],
                'method_name'  => $row['method_name'],
                'status_name'  => $row['status_name'],
            ];
        }
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
}

$fn = $_REQUEST['fn'] ?? '';
while (ob_get_level() > 0) ob_end_clean();
header('Content-Type: application/json; charset=utf-8');
if ($fn === 'List_QueryParam') {
    List_QueryParam();
} else {
    echo json_encode(['success' => false, 'message' => 'invalid fn']);
}