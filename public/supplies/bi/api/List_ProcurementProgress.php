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
            ISNULL(flow.arrival_total, 0) AS arrival_total,
            ISNULL(flow.inspection_total, 0) AS inspection_total,
            ISNULL(flow.billing_total, 0) AS billing_total,
            ISNULL(flow.paid_total, 0) AS paid_total,
            CASE WHEN ISNULL(flow.period_total, 0) > 0 AND flow.paid_total >= flow.period_total THEN 1 ELSE 0 END AS is_completed,
            CASE
                WHEN ISNULL(con.i_overlap, 0) = 3
                     OR NULLIF(LTRIM(RTRIM(con.c_overlap)), '') IS NOT NULL
                     OR EXISTS (SELECT 1 FROM NMU_EIS.dbo.bg_reserve_overlap ro
                                WHERE ro.i_enable = 1 AND (ro.pr_id = s.tor_id OR ro.po_id = con.sp_tor_contract_id))
                    THEN N'บันทึกใบกันเหลื่อมแล้ว'
                WHEN con.sp_tor_contract_id IS NOT NULL
                     AND (ISNULL(s.i_type_bg, 0) = 4
                          OR EXISTS (SELECT 1 FROM NMU_EIS.dbo.bg_reserve_money rm
                                     WHERE rm.i_enable = 1 AND (rm.pr_id = s.tor_id OR rm.po_id = con.sp_tor_contract_id)))
                    THEN N'ก่อหนี้แล้ว'
                WHEN ISNULL(s.i_type_bg, 0) = 4
                     OR EXISTS (SELECT 1 FROM NMU_EIS.dbo.bg_reserve_money rm
                                WHERE rm.i_enable = 1 AND rm.pr_id = s.tor_id)
                    THEN N'ยังไม่ก่อหนี้'
                ELSE N''
            END AS overlap_status,
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
        OUTER APPLY (SELECT TOP 1 c.sp_tor_contract_id, c.c_code, c.f_total_amt, c.d_doc_date, c.d_due_date,
                            c.i_overlap, c.c_overlap, c.bg_reserve_overlap_id
                     FROM dbo.sp_tor_contract c WHERE c.sp_tor_id = s.tor_id
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
            SELECT COUNT(DISTINCT p.sp_tor_hdr_period_id) AS period_total,
                   COUNT(DISTINCT CASE WHEN h.d_arrive_date IS NOT NULL OR NULLIF(LTRIM(RTRIM(h.c_arrive_code)), '') IS NOT NULL THEN p.sp_tor_hdr_period_id END) AS arrival_total,
                   COUNT(DISTINCT CASE WHEN h.sp_check_period_hdr_id IS NOT NULL AND (h.d_checking_date IS NOT NULL OR NULLIF(LTRIM(RTRIM(h.c_code)), '') IS NOT NULL) THEN p.sp_tor_hdr_period_id END) AS inspection_total,
                   COUNT(DISTINCT CASE WHEN ISNULL(h.po_working_hdr_id, 0) > 0 THEN p.sp_tor_hdr_period_id END) AS billing_total,
                   COUNT(DISTINCT CASE WHEN ISNULL(ph.i_status_last, 0) >= 11 THEN p.sp_tor_hdr_period_id END) AS paid_total
            FROM dbo.sp_tor_contract fc
            INNER JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_contract_id = fc.sp_tor_contract_id
            LEFT JOIN dbo.sp_check_period_hdr h ON h.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id AND h.i_enabled = 1
            LEFT JOIN NMU_EIS.dbo.po_working_hdr ph ON ph.po_working_hdr_id = h.po_working_hdr_id AND ph.i_enable = 1
            WHERE fc.sp_tor_id = s.tor_id AND fc.i_enabled = 1
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
        foreach (array('importance_level', 'period_total', 'arrival_total', 'inspection_total', 'billing_total', 'paid_total', 'is_completed') as $numericField) {
            $row[$numericField] = intval($row[$numericField]);
        }
        $rows[] = $row;
    }
}
echo json_encode(array("success" => true, "data" => $rows), JSON_UNESCAPED_UNICODE);

