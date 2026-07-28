<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

function List_QueryParam()
{
    global $db;
    $yearTh = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : (date('Y') + 543);
    $yearEn = $yearTh - 543;

    // Fiscal Year Calculation
    $start_date = ($yearEn - 1) . "-10-01";
    $end_date = $yearEn . "-09-30";

    $sql = "
        SELECT 
            ROW_NUMBER() OVER (ORDER BY aa.i_status desc ,a.c_code_ref,aa.dc_user_create_id ) AS row
            ,CONVERT(date,aa.d_receive_date) as d_receive_date
            ,CONVERT(date,aa.d_doc_date) as d_doc_date
            ,CONVERT(date,a.d_create ) as d_create
            ,isnull(aa.i_status,0) as i_status
            ,a.po_working_hdr_id
            ,aa.po_working_item_id
            ,d.sp_emp_id
            ,ISNULL((SELECT c_name FROM NMU_ERP..sp_emp WHERE sp_emp_id = d.sp_emp_id), 'ไม่ระบุ') AS staff_name
        FROM NMU_EIS..po_working_hdr a
        LEFT JOIN ( 
            SELECT
                aa.po_working_hdr_id
                ,aa.i_status
                ,(select top 1 po_working_item_id from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as po_working_item_id
                ,(select top 1 CONVERT(date,d_doc_date) from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as d_doc_date
                ,(select top 1 CONVERT(date,d_receive_date) from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as d_receive_date
                ,(select top 1 dc_user_create_id from NMU_EIS..po_working_item where po_working_item_id = max(aa.po_working_item_id)) as dc_user_create_id
            FROM NMU_EIS..po_working_item aa
            WHERE aa.i_status = 3
            GROUP BY aa.i_status, aa.po_working_hdr_id
        ) aa ON a.po_working_hdr_id = aa.po_working_hdr_id AND a.i_enable = 1
        LEFT JOIN sp_check_period_hdr b ON b.po_working_hdr_id = a.po_working_hdr_id
        LEFT JOIN sp_tor_contract c ON b.sp_tor_contract_id = c.sp_tor_contract_id
        LEFT JOIN sp_tor d ON d.tor_id = c.sp_tor_id
        WHERE
            d.dc_cost_id = 38
            AND CONVERT(date,a.d_create) BETWEEN '$start_date' AND '$end_date'
        ORDER BY a.c_code_ref, aa.dc_user_create_id
    ";

    $stmt = $db->QueryParam($sql, array());
    $data = [];

    if ($stmt) {
        while ($row = $db->Fetch($stmt)) {
            // Calculate Month Index (0=Oct, 11=Sep)
            $d_create = $row['d_create'];

            // Handle DateTime Object (Fix for strtotime expectation)
            if ($d_create instanceof DateTime) {
                $d_create = $d_create->format('Y-m-d');
            }

            $month = intval(date('m', strtotime($d_create)));
            $month_idx = ($month >= 10) ? ($month - 10) : ($month + 2);

            // Determine Status: Sent vs Reply
            $is_reply = !empty($row['d_receive_date']);

            // Convert raw row to response data
            $data[] = [
                'month_idx'   => $month_idx,
                'staff_id'    => intval($row['sp_emp_id']),
                'staff_name'  => $row['staff_name'],
                'is_reply'    => $is_reply,
                'po_working_hdr_id' => $row['po_working_hdr_id'],
                'd_create'    => $d_create
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
