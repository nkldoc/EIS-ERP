<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
    global $db;

    // รับค่าปีงบประมาณ (พ.ศ.) จาก Frontend เช่น 2569
    $yearTh = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y') + 543);
    $yearEn = $yearTh - 543; // แปลงเป็น ค.ศ. เช่น 2026

    // ✅ ปีงบประมาณ 2569 = ต.ค. 2025 – ก.ย. 2026
    // i_yyyy เก็บเป็น ค.ศ. → ต้องดึงทั้ง 2025 และ 2026
    // แล้วกรองเดือนให้อยู่ในช่วงปีงบประมาณที่ถูกต้อง:
    //   - i_yyyy = (yearEn-1) เฉพาะเดือน 10,11,12 (ต.ค.–ธ.ค.)
    //   - i_yyyy = (yearEn)   เฉพาะเดือน 1–9     (ม.ค.–ก.ย.)
    $yearEnPrev = $yearEn - 1; // 2025

    // month_idx: ต.ค.=0, พ.ย.=1, ธ.ค.=2, ม.ค.=3, ก.พ.=4, มี.ค.=5,
    //            เม.ย.=6, พ.ค.=7, มิ.ย.=8, ก.ค.=9, ส.ค.=10, ก.ย.=11
    // (ตรงกับ JS: months = ["ต.ค.","พ.ย.","ธ.ค.","ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย."])

    $sqlMain = "SET NOCOUNT ON
    SELECT 
        a.tor_id,

        -- month_idx: ต.ค.=0, พ.ย.=1, ธ.ค.=2, ม.ค.=3, ก.พ.=4, มี.ค.=5
        --            เม.ย.=6, พ.ค.=7, มิ.ย.=8, ก.ค.=9, ส.ค.=10, ก.ย.=11
        CASE 
            WHEN MONTH(a.d_create) = 10 THEN 0
            WHEN MONTH(a.d_create) = 11 THEN 1
            WHEN MONTH(a.d_create) = 12 THEN 2
            WHEN MONTH(a.d_create) = 1  THEN 3
            WHEN MONTH(a.d_create) = 2  THEN 4
            WHEN MONTH(a.d_create) = 3  THEN 5
            WHEN MONTH(a.d_create) = 4  THEN 6
            WHEN MONTH(a.d_create) = 5  THEN 7
            WHEN MONTH(a.d_create) = 6  THEN 8
            WHEN MONTH(a.d_create) = 7  THEN 9
            WHEN MONTH(a.d_create) = 8  THEN 10
            WHEN MONTH(a.d_create) = 9  THEN 11
            ELSE 0
        END AS month_idx,

        -- assigned_idx: offset เดียวกัน
        CASE 
            WHEN t.act_date IS NULL      THEN NULL
            WHEN MONTH(t.act_date) = 10 THEN 0
            WHEN MONTH(t.act_date) = 11 THEN 1
            WHEN MONTH(t.act_date) = 12 THEN 2
            WHEN MONTH(t.act_date) = 1  THEN 3
            WHEN MONTH(t.act_date) = 2  THEN 4
            WHEN MONTH(t.act_date) = 3  THEN 5
            WHEN MONTH(t.act_date) = 4  THEN 6
            WHEN MONTH(t.act_date) = 5  THEN 7
            WHEN MONTH(t.act_date) = 6  THEN 8
            WHEN MONTH(t.act_date) = 7  THEN 9
            WHEN MONTH(t.act_date) = 8  THEN 10
            WHEN MONTH(t.act_date) = 9  THEN 11
            ELSE NULL
        END AS assigned_idx,

        -- ชื่อผู้รับผิดชอบ
        ISNULL((SELECT c_name FROM NMU_ERP..sp_emp WHERE sp_emp_id = a.sp_emp_id), 'ยังไม่ได้ระบุ') AS staff_name,
        ISNULL(a.sp_emp_id, 0) AS sp_emp_id,

        -- ประเภทงาน
        CASE 
            WHEN ISNULL(a.i_product_type, 0) = 2 THEN 'ครุภัณฑ์'
            WHEN ISNULL(a.i_product_type, 0) = 1 OR ISNULL(a.i_product_type, 0) = 3 THEN 'วัสดุ'
            WHEN ISNULL(a.i_purchase, 0) = 2 AND a.i_type_bg <> 2 AND ISNULL(a.i_product_type, 0) = 0 THEN 'จ้างไม่ได้ของ'
            WHEN ISNULL(a.i_purchase, 0) = 3 AND ISNULL(a.i_product_type, 0) = 0 THEN 'เช่า'
            WHEN ISNULL(a.i_type_bg, 0) = 2 THEN 'โครงการต่อเนื่อง'
            WHEN ISNULL(a.i_type_contract, 0) = 3 THEN 'จะซื้อจะขาย'
            WHEN ISNULL(a.i_purchase, 0) = 1 AND ISNULL(a.i_type_contract, 0) = 3 THEN 'งานก่อสร้าง'
            ELSE 'PR นี้ยังไม่ได้ระบุ' 
        END AS method_name,

        -- สถานะปัจจุบัน
        CASE 
            WHEN t.act_date IS NOT NULL THEN 'จ่ายงานแล้ว'
            ELSE 'รอดำเนินการ'
        END AS status_name

    FROM NMU_ERP..sp_tor a
    OUTER APPLY (
        SELECT MAX(act_date_dt) AS act_date 
        FROM sp_tor_item 
        WHERE tor_id = a.tor_id AND sp_status_hdr_id = 25
    ) t
    WHERE a.i_enabled = 1
      AND ISNULL(a.i_is_notor, 0) = 0
      AND ISNULL(a.i_parent, 0) = 0
      AND (
          -- ✅ ต.ค.–ธ.ค. ของปีก่อน (เช่น ต.ค.–ธ.ค. 2025)
          (a.i_yyyy = $yearEnPrev AND MONTH(a.d_create) IN (10, 11, 12))
          OR
          -- ✅ ม.ค.–ก.ย. ของปีนี้ (เช่น ม.ค.–ก.ย. 2026)
          (a.i_yyyy = $yearEn AND MONTH(a.d_create) BETWEEN 1 AND 9)
      )";

    $stmt = $db->QueryParam($sqlMain, array());
    $data = [];
    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $data[] = [
                'month_idx'    => intval($row['month_idx']),
                'assigned_idx' => ($row['assigned_idx'] !== null) ? intval($row['assigned_idx']) : null,
                'staff_name'   => $row['staff_name'],
                'sp_emp_id'    => intval($row['sp_emp_id']),
                'method_name'  => $row['method_name'],
                'status_name'  => $row['status_name']
            ];
        }
    }

    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(["success" => true, "data" => $data], JSON_UNESCAPED_UNICODE);
}

$fn = $_REQUEST['fn'] ?? '';
if ($fn === 'List_QueryParam') {
    List_QueryParam();
} else {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'message' => 'invalid fn']);
}