<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db   = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
    global $db;

    // รับปีงบประมาณ (พ.ศ.) จาก Frontend
    $yearTh = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y') + 543);
    $yearEn = $yearTh - 543;

    // ช่วงปีงบประมาณ: ต.ค. ปีก่อน – ก.ย. ปีนี้
    $start_date = ($yearEn - 1) . "-10-01";
    $end_date   = $yearEn . "-09-30";

    $sql = "SET NOCOUNT ON
    SELECT
        -- เดือนที่ใบตรวจรับ 'เข้าใหม่' (0-11: ต.ค.=0)
        CASE
            WHEN MONTH(b.d_create) >= 10 THEN MONTH(b.d_create) - 10
            ELSE MONTH(b.d_create) + 2
        END AS month_idx,

        -- เดือนที่ 'มีการทักท้วง' จาก po_working_item (0-11: ต.ค.=0)
        CASE
            WHEN wi.d_receive_date IS NOT NULL AND MONTH(wi.d_receive_date) >= 10
                THEN MONTH(wi.d_receive_date) - 10
            WHEN wi.d_receive_date IS NOT NULL
                THEN MONTH(wi.d_receive_date) + 2
            ELSE NULL
        END AS assigned_idx,

        -- ผู้รับผิดชอบ (ผู้สร้างใบตรวจรับ)
        ISNULL(b.dc_user_create_id, 0) AS staff_id,
        ISNULL(
            (SELECT c_full_name FROM EIS_PROCURE..dc_user WHERE dc_user_id = b.dc_user_create_id),
            'ไม่ระบุ'
        ) AS staff_name,

        -- check ทักท้วงแล้วหรือเปล่า: ดูจาก po_working_item ที่ i_status = 3
        CASE
            WHEN wi.po_working_hdr_id IS NOT NULL THEN 1
            ELSE 0
        END AS is_reply,

        -- เลข D/F จริง: ถ้า A ให้แปลงเป็น F ผ่าน po_working_dtl
        CASE
            WHEN a.c_code_ref LIKE 'A%' AND dtl_map.c_code_real IS NOT NULL
                THEN dtl_map.c_code_real
            ELSE a.c_code_ref
        END AS d_code,

        -- รายละเอียดโครงการจาก po_working_begin_hdr
        ISNULL(beg.c_detail, '') AS c_detail,

        b.sp_check_period_hdr_id AS tor_id

    FROM EIS_PROCURE..sp_check_period_hdr b
    LEFT JOIN NMU_EIS..po_working_hdr a
           ON a.po_working_hdr_id = b.po_working_hdr_id
          AND a.i_enable = 1
    -- แปลง A → F ผ่าน po_working_dtl (c_code_advance = A...)
    LEFT JOIN (
        SELECT c_code_advance, MIN(c_code) AS c_code_real
        FROM NMU_EIS..po_working_dtl
        WHERE c_code_advance IS NOT NULL AND c_code_advance <> ''
        GROUP BY c_code_advance
    ) dtl_map ON dtl_map.c_code_advance = a.c_code_ref
    -- ดึง c_detail จาก po_working_begin_hdr
    LEFT JOIN (
        SELECT po_working_hdr_id, c_detail
        FROM NMU_EIS..po_working_begin_hdr
        WHERE i_enable = 1
    ) beg ON beg.po_working_hdr_id = a.po_working_hdr_id
    LEFT JOIN (
        SELECT po_working_hdr_id
              ,MAX(d_receive_date) AS d_receive_date
        FROM NMU_EIS..po_working_item
        WHERE i_status = 3
        GROUP BY po_working_hdr_id
    ) wi ON wi.po_working_hdr_id = a.po_working_hdr_id
    WHERE b.i_enabled = 1
      AND CONVERT(date, b.d_create) BETWEEN '$start_date' AND '$end_date'";

    $stmt = $db->QueryParam($sql, array());
    $data = [];

    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            $data[] = [
                'month_idx'    => intval($row['month_idx']),
                'staff_id'     => intval($row['staff_id']),
                'staff_name'   => $row['staff_name'],
                'is_reply'     => intval($row['is_reply']) == 1,
                'tor_id'       => $row['tor_id'],
                'd_code'       => $row['d_code']   ?? '',
                'c_detail'     => $row['c_detail'] ?? '',
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