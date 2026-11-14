<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");

header("Content-Type: application/json; charset=utf-8");
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(array("success" => false, "msg" => "Session หมดอายุ"));
    exit;
}

$db = new DatabaseServer();
$year = isset($_REQUEST['year']) ? intval($_REQUEST['year']) : 0;
$keyword = isset($_REQUEST['keyword']) ? trim($_REQUEST['keyword']) : "";
$params = array();
$where = " WHERE s.i_enabled = 1 ";
if ($year > 0) {
    $where .= " AND s.i_yyyy = ? ";
    $params[] = $year > 2500 ? $year - 543 : $year;
}
if ($keyword !== "") {
    $where .= " AND (s.c_code LIKE ? OR s.c_name LIKE ? OR con.c_code LIKE ?) ";
    $like = "%" . $keyword . "%";
    $params[] = $like; $params[] = $like; $params[] = $like;
}

$sql = "SELECT TOP 2000
            s.tor_id, s.c_code AS pr_code, s.c_name, s.i_yyyy,
            ISNULL(s.f_total_amt, 0) AS pr_amount,
            con.sp_tor_contract_id, con.c_code AS contract_code,
            ISNULL(con.f_total_amt, 0) AS contract_amount,
            ev.sp_tor_event_id, ev.event_title, ev.event_detail,
            CONVERT(VARCHAR, ev.event_date, 120) AS event_date,
            CONVERT(VARCHAR, ev.d_create, 120) AS progress_created,
            ev.sp_status_hdr_name AS menu_name,
            et.c_name AS progress_type,
            CASE
                WHEN ev.event_title IS NOT NULL THEN ev.event_title
                WHEN s.i_enabled = 2 THEN N'ยกเลิก'
                WHEN s.tor_status_id = 21 AND ISNULL(pay.i_status_last, 0) >= 11 THEN N'เบิกจ่ายเงินเสร็จสิ้น'
                WHEN s.tor_status_id = 21 AND chk.po_working_hdr_id IS NOT NULL THEN N'ขออนุมัติเบิกจ่ายเงิน'
                WHEN con.sp_tor_contract_id IS NOT NULL THEN N'บริหารสัญญา'
                WHEN s.tor_status_id IN (1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31) THEN N'อยู่ระหว่างดำเนินการ'
                ELSE N'รอดำเนินการ'
            END AS current_progress
        FROM dbo.sp_tor s
        OUTER APPLY (SELECT TOP 1 c.sp_tor_contract_id, c.c_code, c.f_total_amt
                     FROM dbo.sp_tor_contract c WHERE c.sp_tor_id = s.tor_id
                     ORDER BY c.sp_tor_contract_id DESC) con
        OUTER APPLY (SELECT TOP 1 e.sp_tor_event_id, e.event_type, e.event_title,
                            e.event_detail, e.event_date, e.d_create, e.sp_status_hdr_name
                     FROM dbo.sp_tor_event e WHERE e.sp_tor_id = s.tor_id AND e.i_enabled = 1
                     ORDER BY e.d_create DESC, e.sp_tor_event_id DESC) ev
        LEFT JOIN dbo.sp_type_event et ON et.sp_type_event_id = ev.event_type
        OUTER APPLY (SELECT TOP 1 h.po_working_hdr_id
                     FROM dbo.sp_tor_hdr_period p
                     INNER JOIN dbo.sp_check_period_hdr h ON h.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id
                     WHERE p.sp_tor_contract_id = con.sp_tor_contract_id
                     ORDER BY h.sp_check_period_hdr_id DESC) chk
        LEFT JOIN NMU_EIS.dbo.po_working_hdr pay ON pay.po_working_hdr_id = chk.po_working_hdr_id
        {$where}
        ORDER BY s.i_yyyy DESC, s.tor_id DESC";

$stmt = $db->QueryParam($sql, $params);
$rows = array();
if ($stmt) {
    while ($row = $db->Fetch($stmt)) {
        $row['i_yyyy'] = !empty($row['i_yyyy']) && intval($row['i_yyyy']) < 2500
            ? intval($row['i_yyyy']) + 543 : intval($row['i_yyyy']);
        $row['pr_amount'] = floatval($row['pr_amount']);
        $row['contract_amount'] = floatval($row['contract_amount']);
        $rows[] = $row;
    }
}
echo json_encode(array("success" => true, "data" => $rows), JSON_UNESCAPED_UNICODE);

