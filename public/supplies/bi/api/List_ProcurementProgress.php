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
$yearFrom = isset($_REQUEST['year_from']) ? intval($_REQUEST['year_from']) : 0;
$yearTo = isset($_REQUEST['year_to']) ? intval($_REQUEST['year_to']) : 0;
$keyword = isset($_REQUEST['keyword']) ? trim($_REQUEST['keyword']) : "";
$params = array();
$where = " WHERE s.i_enabled = 1 ";
if ($year > 0) {
    $where .= " AND s.i_yyyy = ? ";
    $params[] = $year > 2500 ? $year - 543 : $year;
}
if ($yearFrom > 0 && $yearTo > 0) {
    $fromAd = $yearFrom > 2500 ? $yearFrom - 543 : $yearFrom;
    $toAd = $yearTo > 2500 ? $yearTo - 543 : $yearTo;
    if ($fromAd > $toAd) {
        $tmp = $fromAd; $fromAd = $toAd; $toAd = $tmp;
    }
    $where .= " AND s.i_yyyy BETWEEN ? AND ? ";
    $params[] = $fromAd;
    $params[] = $toAd;
}
if ($keyword !== "") {
    $where .= " AND (s.c_code LIKE ? OR s.c_name LIKE ? OR con.c_code LIKE ?) ";
    $like = "%" . $keyword . "%";
    $params[] = $like; $params[] = $like; $params[] = $like;
}

$sql = "SELECT
            s.tor_id, s.c_code AS pr_code, s.c_name, s.i_yyyy, s.i_type_bg,
            s.c_overlap AS pr_overlap_code, s.i_overlap AS pr_overlap_flag, s.i_yyyy_overlap AS pr_overlap_year,
            CONVERT(VARCHAR, s.d_tor_date, 120) AS procurement_start_date,
            CONVERT(VARCHAR, s.d_egp_date, 120) AS announcement_date,
            ISNULL(s.f_total_amt, 0) AS pr_amount,
            con.sp_tor_contract_id, con.c_code AS contract_code,
            ISNULL(con.f_total_amt, 0) AS contract_amount,
            CONVERT(VARCHAR, con.d_doc_date, 120) AS contract_date,
            CONVERT(VARCHAR, con.d_due_date, 120) AS contract_due_date,
            ev.sp_tor_event_id, ev.event_title, ev.event_detail,
            CONVERT(VARCHAR, ev.event_date, 120) AS event_date,
            CONVERT(VARCHAR, ev.d_create, 120) AS progress_created,
            ev.sp_status_hdr_name AS menu_name,
            et.c_name AS progress_type,
            ISNULL(ev.importance_level, 0) AS importance_level,
            ISNULL((SELECT TOP 1 emp.c_name FROM dbo.sp_emp emp WHERE emp.sp_emp_id = s.sp_emp_id), N'ไม่ระบุ') AS owner_name,
            ISNULL((SELECT TOP 1 wt.c_name FROM dbo.sp_tor_i_work_type wt WHERE wt.i_work_type_id = ISNULL(s.i_product_type, 0)), N'ไม่ระบุ') AS procurement_type,
            ISNULL((SELECT TOP 1 st.c_name FROM dbo.sp_type_status st WHERE st.sp_type_status_id = s.tor_type_id), N'ไม่ระบุ') AS method_name,
            ISNULL((SELECT TOP 1 bt.c_name FROM NMU_DATACENTER.dbo.dc_expense_budget_type bt WHERE bt.dc_expense_budget_type_id = s.dc_expense_budget_type_id), N'ไม่ระบุแหล่งเงิน') AS fund_source,
            ISNULL((SELECT TOP 1 cost.c_name FROM NMU_DATACENTER.dbo.dc_cost cost WHERE cost.dc_cost_id = COALESCE(NULLIF(s.dc_cost2_id, 0), s.dc_cost_id)), N'ไม่ระบุหน่วยงาน') AS department_name,
            ISNULL(flow.period_total, 0) AS period_total,
            ISNULL(flow.period_amount, 0) AS period_amount,
            ISNULL(flow.arrival_total, 0) AS arrival_total,
            ISNULL(flow.arrival_amount, 0) AS arrival_amount,
            ISNULL(flow.inspection_total, 0) AS inspection_total,
            ISNULL(flow.inspection_amount, 0) AS inspection_amount,
            ISNULL(flow.billing_total, 0) AS billing_total,
            ISNULL(flow.paid_total, 0) AS paid_total,
            ISNULL(flow.paid_amount, 0) AS paid_amount,
            flow.paid_date,
            CASE WHEN ISNULL(flow.period_total, 0) > 0 AND flow.paid_total >= flow.period_total THEN 1 ELSE 0 END AS is_completed,
            CASE
                WHEN ev.event_title IS NOT NULL THEN ev.event_title
                WHEN s.i_enabled = 2 THEN N'ยกเลิก'
                WHEN con.sp_tor_contract_id IS NOT NULL THEN N'บริหารสัญญา'
                WHEN s.tor_status_id IN (1,11,12,14,15,16,17,18,19,20,22,23,28,29,30,31) THEN N'อยู่ระหว่างดำเนินการ'
                ELSE N'รอดำเนินการ'
            END AS current_progress
        FROM dbo.sp_tor s
        OUTER APPLY (SELECT TOP 1 c.sp_tor_contract_id, c.c_code, c.f_total_amt, c.d_doc_date, c.d_due_date,
                            c.i_overlap, c.c_overlap, c.bg_reserve_overlap_id
                     FROM dbo.sp_tor_contract c WHERE c.sp_tor_id = s.tor_id AND c.i_enabled = 1
                     ORDER BY c.sp_tor_contract_id DESC) con
        OUTER APPLY (SELECT TOP 1 e.sp_tor_event_id, e.event_type, e.event_title,
                            e.event_detail, e.event_date, e.d_create, e.sp_status_hdr_name, e.importance_level
                     FROM dbo.sp_tor_event e WHERE e.sp_tor_id = s.tor_id AND e.i_enabled = 1
                     ORDER BY e.d_create DESC, e.sp_tor_event_id DESC) ev
        LEFT JOIN dbo.sp_type_event et ON et.sp_type_event_id = ev.event_type
        OUTER APPLY (SELECT TOP 1 h.po_working_hdr_id
                     FROM dbo.sp_tor_hdr_period p
                     INNER JOIN dbo.sp_check_period_hdr h ON h.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id
                     WHERE p.sp_tor_contract_id = con.sp_tor_contract_id
                     ORDER BY h.sp_check_period_hdr_id DESC) chk
        LEFT JOIN NMU_EIS.dbo.po_working_hdr pay ON pay.po_working_hdr_id = chk.po_working_hdr_id
        OUTER APPLY (
            SELECT COUNT(*) AS period_total,
                   SUM(x.period_amount) AS period_amount,
                   SUM(x.has_arrival) AS arrival_total,
                   SUM(CASE WHEN x.has_arrival = 1 THEN x.period_amount ELSE 0 END) AS arrival_amount,
                   SUM(x.has_inspection) AS inspection_total,
                   SUM(CASE WHEN x.has_inspection = 1 THEN x.period_amount ELSE 0 END) AS inspection_amount,
                   SUM(x.has_billing) AS billing_total,
                   SUM(x.has_paid) AS paid_total,
                   SUM(CASE WHEN x.has_paid = 1 THEN x.period_amount ELSE 0 END) AS paid_amount,
                   CONVERT(VARCHAR, MAX(x.paid_date), 120) AS paid_date
            FROM (
                SELECT p.sp_tor_hdr_period_id,
                       ISNULL((SELECT SUM(ISNULL(pd.f_net_total_price, 0))
                               FROM dbo.sp_tor_dtl_period pd
                               WHERE pd.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id), 0) AS period_amount,
                       CASE WHEN EXISTS (SELECT 1 FROM dbo.sp_check_period_hdr ah WHERE ah.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id AND ah.i_enabled = 1 AND (ah.d_arrive_date IS NOT NULL OR NULLIF(LTRIM(RTRIM(ah.c_arrive_code)), '') IS NOT NULL)) THEN 1 ELSE 0 END AS has_arrival,
                       CASE WHEN EXISTS (SELECT 1 FROM dbo.sp_check_period_hdr ih WHERE ih.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id AND ih.i_enabled = 1 AND (ih.d_checking_date IS NOT NULL OR NULLIF(LTRIM(RTRIM(ih.c_code)), '') IS NOT NULL)) THEN 1 ELSE 0 END AS has_inspection,
                       CASE WHEN EXISTS (SELECT 1 FROM dbo.sp_check_period_hdr bh INNER JOIN NMU_EIS.dbo.po_working_hdr bwh ON bwh.po_working_hdr_id = bh.po_working_hdr_id WHERE bh.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id AND bh.i_enabled = 1 AND bwh.i_enable = 1 AND ISNULL(bwh.i_status_last, 0) >= 2) THEN 1 ELSE 0 END AS has_billing,
                       CASE WHEN EXISTS (SELECT 1 FROM dbo.sp_check_period_hdr phh INNER JOIN NMU_EIS.dbo.po_working_hdr pwh ON pwh.po_working_hdr_id = phh.po_working_hdr_id WHERE phh.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id AND phh.i_enabled = 1 AND pwh.i_enable = 1 AND ISNULL(pwh.i_status_last, 0) >= 11) THEN 1 ELSE 0 END AS has_paid,
                       (SELECT MAX(pwd.d_update) FROM dbo.sp_check_period_hdr pdh INNER JOIN NMU_EIS.dbo.po_working_hdr pwd ON pwd.po_working_hdr_id = pdh.po_working_hdr_id WHERE pdh.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id AND pdh.i_enabled = 1 AND pwd.i_enable = 1 AND ISNULL(pwd.i_status_last, 0) >= 11) AS paid_date
                FROM dbo.sp_tor_contract fc
                INNER JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_contract_id = fc.sp_tor_contract_id
                WHERE fc.sp_tor_id = s.tor_id AND fc.i_enabled = 1
            ) x
        ) flow
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
        foreach (array('period_amount', 'arrival_amount', 'inspection_amount', 'paid_amount') as $amountField) {
            $row[$amountField] = floatval($row[$amountField]);
        }
        foreach (array('importance_level', 'period_total', 'arrival_total', 'inspection_total', 'billing_total', 'paid_total', 'is_completed') as $numericField) {
            $row[$numericField] = intval($row[$numericField]);
        }
        $rows[] = $row;
    }
}
require_once __DIR__ . '/ProcurementOverlap.php';
try {
    $rows = procurementOverlapEnrich($rows, function ($sql, $params) use ($db) {
        $stmt = sqlsrv_query($db->conn, $sql, $params);
        if (!$stmt) throw new RuntimeException('Overlap query failed');
        $result = array();
        while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) $result[] = $row;
        return $result;
    });
} catch (Throwable $error) {
    error_log('Procurement overlap: ' . $error->getMessage());
    http_response_code(500);
    echo json_encode(array('success' => false, 'msg' => 'Cannot load overlap evidence'));
    exit;
}
echo json_encode(array("success" => true, "data" => $rows), JSON_UNESCAPED_UNICODE);

