<?php
require_once '../../../conf/config.php';
require_once '../../../lib/database/DatabaseServer.php';
header('Content-Type: application/json; charset=utf-8');
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(array('success' => false, 'msg' => 'กรุณาเข้าสู่ระบบใหม่'));
    exit;
}
$contractId = intval($_GET['sp_tor_contract_id'] ?? 0);
$requestedTorId = intval($_GET['sp_tor_id'] ?? 0);
if ($contractId <= 0 && $requestedTorId <= 0) {
    http_response_code(400);
    echo json_encode(array('success' => false, 'msg' => 'ไม่พบ PR หรือสัญญาที่เลือก'));
    exit;
}
$db = new DatabaseServer();
$fetch = function ($sql, $params) use ($db) {
    $stmt = $db->QueryParam($sql, $params);
    $rows = array();
    while ($row = $db->Fetch($stmt)) {
        foreach ($row as &$value) {
            if ($value instanceof DateTimeInterface) {
                $value = $value->format('Y-m-d');
            }
        }
        unset($value);
        $rows[] = $row;
    }
    return $rows;
};
// Apply the same department/employee scope as the contract listing.
$scope = '';
$params = array($contractId > 0 ? $contractId : $requestedTorId);
if (intval($_SESSION['i_level'] ?? 0) === 2) {
    $scope = ' AND e.dc_department_id=?';
    $params[] = intval($_SESSION['dc_department_id'] ?? 0);
} elseif (intval($_SESSION['i_level'] ?? 0) === 3) {
    $scope = ' AND e.sp_emp_id=?';
    $params[] = intval($_SESSION['sp_emp_id'] ?? 0);
} elseif (intval($_SESSION['i_level'] ?? 0) !== 1) {
    $scope = ' AND 1=0';
}
$prCondition = $contractId > 0 ? 't.tor_id=(SELECT sp_tor_id FROM dbo.sp_tor_contract WHERE sp_tor_contract_id=?)' : 't.tor_id=?';
$pr = $fetch('SELECT t.*, bg.c_name AS pr_type_name FROM dbo.sp_tor t
    INNER JOIN dbo.sp_emp e ON e.sp_emp_id=t.sp_emp_id
    LEFT JOIN dbo.sp_type_bg bg ON bg.sp_type_bg_id=t.i_type_bg
    WHERE ' . $prCondition . $scope, $params);
if (!$pr) {
    http_response_code(404);
    echo json_encode(array('success' => false, 'msg' => 'ไม่พบ PR หรือสัญญา หรือไม่มีสิทธิ์ดูข้อมูล'));
    exit;
}
$torId = intval($pr[0]['tor_id']);
$contractParams = array($torId);
$selectedContract = '';
if ($contractId > 0) {
    $selectedContract = ' AND c.sp_tor_contract_id=?';
    $contractParams[] = $contractId;
}
$contracts = $fetch('SELECT c.*, cr.c_name AS creditor_name FROM dbo.sp_tor_contract c
    LEFT JOIN ' . DB_NMU . 'dc_creditor cr ON cr.dc_creditor_id=c.dc_creditor_id
    WHERE c.sp_tor_id=?' . $selectedContract . ' ORDER BY c.sp_tor_contract_id', $contractParams);
$contractsById = array();
foreach ($contracts as $contract) $contractsById[intval($contract['sp_tor_contract_id'])] = $contract;
// IDs come only from contracts belonging to the authorized PR above.
$contractList = $contractsById ? implode(',', array_keys($contractsById)) : '0';
$funds = array();
$budgetName = function ($id) use ($fetch) {
    if (!$id) return '';
    $rows = $fetch('SELECT c_name FROM ' . DB_CENTER . 'dc_expense_budget_type WHERE dc_expense_budget_type_id=?', array($id));
    return $rows[0]['c_name'] ?? '';
};
for ($i = 1; $i <= 5; $i++) {
    $suffix = $i === 1 ? '' : strval($i);
    $id = $pr[0]['dc_expense_budget_type' . $suffix . '_id'] ?? null;
    $amount = $pr[0]['f_type' . $suffix . '_amt'] ?? null;
    if ($id || floatval($amount) != 0) {
        $funds[] = array('source' => $budgetName($id), 'amount' => $amount);
    }
}
$contractFunds = array();
foreach ($contracts as $contract) {
    for ($i = 1; $i <= 3; $i++) {
        $suffix = $i === 1 ? '' : strval($i);
        $sourceId = $contract['dc_expense_budget_type' . $suffix . '_id'] ?? null;
        // The original contract form falls back to the PR's first source only.
        if ($i === 1 && $sourceId === null) $sourceId = $pr[0]['dc_expense_budget_type_id'] ?? null;
        $reservationId = intval($contract['bg_reserve_money' . $i . '_id'] ?? 0);
        $contractFunds[] = array('contract_code' => $contract['c_code'], 'source_no' => $i, 'source_name' => $budgetName($sourceId),
            'amount' => $contract['f_type' . $suffix . '_amt'] ?? null,
            'booking_type' => $contract['i_pr_type' . $i] ?? null,
            'reservation_id' => $reservationId > 0 ? $reservationId : null,
            'booking_status' => $reservationId > 0 ? 'บันทึกการจองแล้ว' : 'ยังไม่มีรหัสการจองเงิน',
            'booking_final' => $contract['bg_reserve_i_last' . $i] ?? null);
    }
}
$expense = $fetch('SELECT b.c_name FROM dbo.sp_tor t LEFT JOIN ' . DB_NMU_EIS . 'bg_expense b ON b.bg_expense_id=t.po_expense_id WHERE t.tor_id=?', array($torId));
$pr[0]['expense_name'] = $expense[0]['c_name'] ?? '';
$items = $fetch('SELECT * FROM dbo.sp_tor_dtl WHERE sp_tor_id=? ORDER BY sp_tor_dtl_id', array($torId));
$bidderGuarantees = $fetch('SELECT b.sp_tor_bidder_hdr_id, cr.c_name AS creditor_name,
    b.i_is_guarantee, gt.c_name AS guarantee_type, b.d_doc_guarantee_ref,
    b.d_guarantee_date, bank.c_name AS bank_name, b.f_total_guarantee
    FROM dbo.sp_tor_bidder_hdr b
    LEFT JOIN ' . DB_NMU . 'dc_creditor cr ON cr.dc_creditor_id=b.dc_creditor_id
    LEFT JOIN ' . DB_CENTER . 'cm_receive_type gt ON gt.cm_receive_type_id=b.i_is_guarantee
    LEFT JOIN dbo.dc_bank bank ON bank.dc_bank_id=b.dc_bank_id
    WHERE b.sp_tor_id=? AND b.i_enabled=1 ORDER BY b.sp_tor_bidder_hdr_id', array($torId));
$bidders = $fetch('SELECT b.*, cr.c_name AS creditor_name, d.c_name AS item_name,
    CASE WHEN EXISTS (SELECT 1 FROM dbo.sp_tor_victory v WHERE v.sp_tor_id=b.sp_tor_id
    AND v.sp_tor_bidder_dtl_id=b.sp_tor_bidder_dtl_id AND v.i_enabled=1) THEN 1 ELSE 0 END AS is_winner
    FROM dbo.sp_tor_bidder_dtl b
    LEFT JOIN NMU.dbo.dc_creditor cr ON cr.dc_creditor_id=b.dc_creditor_id
    LEFT JOIN dbo.sp_tor_dtl d ON d.sp_tor_dtl_id=b.sp_tor_dtl_id
    WHERE b.sp_tor_id=? AND b.i_enabled=1 ORDER BY b.sp_tor_dtl_id,b.sp_tor_bidder_dtl_id', array($torId));
$periods = $fetch('SELECT h.*, c.c_code AS contract_code, budget.c_name AS budget_name,
    cost.c_code AS receiving_department_code, cost.c_name AS receiving_department_name
    FROM dbo.sp_tor_hdr_period h
    INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=h.sp_tor_contract_id
    LEFT JOIN ' . DB_CENTER . 'dc_expense_budget_type budget ON budget.dc_expense_budget_type_id=h.dc_expense_budget_type_id
    LEFT JOIN dbo.dc_cost cost ON cost.dc_cost_id=COALESCE(NULLIF(h.dc_cost_id,0),h.dc_cost2_id)
    WHERE h.sp_tor_contract_id IN (' . $contractList . ') ORDER BY h.sp_tor_contract_id,h.i_period,h.sp_tor_hdr_period_id', array());
$periodItems = $fetch('SELECT d.*, expense.c_code AS expense_code, expense.c_name AS expense_name
    FROM dbo.sp_tor_dtl_period d INNER JOIN dbo.sp_tor_hdr_period h
    ON h.sp_tor_hdr_period_id=d.sp_tor_hdr_period_id
    LEFT JOIN ' . DB_NMU . 'bg_expense expense ON expense.bg_expense_id=d.po_expense_id
    WHERE h.sp_tor_contract_id IN (' . $contractList . ')
    ORDER BY h.sp_tor_contract_id,h.i_period,d.sp_tor_dtl_period_id', array());
$checks = $fetch('SELECT h.*, COALESCE(h.c_arrive_code,m.c_arrive_code) AS ir_code,
    cn.sp_tor_contract_id AS linked_contract_id, cn.c_code AS contract_code,
    p.i_period AS payment_period, p.i_period_contract AS contract_period, p.c_contract_code AS period_reference,
    COALESCE(NULLIF(LTRIM(RTRIM(h.c_overlap)),\'\'),cn.c_overlap) AS resolved_overlap_code,
    COALESCE(h.i_yyyy_overlap,cn.i_yyyy_overlap) AS resolved_overlap_year,
    CASE WHEN h.i_is_warranty IN (1,3) AND h.i_before >= 0
        THEN CONVERT(varchar(10),DATEADD(day,-h.i_before,h.d_warranty_date),23)
        ELSE NULL END AS warranty_notification_date,
    cr.c_name AS payee_name, tr.c_name AS transfer_name,
    ba.c_code AS bank_account_number, ba.c_name AS bank_account_name, bank.c_name AS bank_name,
    (SELECT TOP 1 w.c_code FROM NMU_EIS..po_working_dtl w WHERE w.po_working_hdr_id=h.po_working_hdr_id ORDER BY w.c_code) AS payment_code
    FROM dbo.sp_check_period_hdr h LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=h.sp_mn_contract_hdr_id
    LEFT JOIN dbo.sp_tor_contract cn ON cn.sp_tor_contract_id=COALESCE(NULLIF(h.sp_tor_contract_id,0),m.sp_contract_id)
    LEFT JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=h.sp_tor_hdr_period_id
    LEFT JOIN ' . DB_NMU . 'dc_creditor cr ON cr.dc_creditor_id=h.dc_creditor_id
    LEFT JOIN ' . DB_NMU . 'dc_creditor tr ON tr.dc_creditor_id=COALESCE(NULLIF(h.dc_creditor_transfer_id,0),h.dc_creditor_id)
    LEFT JOIN ' . DB_NMU . 'dc_bank_acc_creditor ba ON ba.dc_bank_acc_creditor_id=h.dc_bank_acc_creditor_id
    LEFT JOIN ' . DB_NMU . 'dc_bank bank ON bank.dc_bank_id=ba.dc_bank_id
    WHERE (h.sp_tor_contract_id IN (' . $contractList . ') OR m.sp_contract_id IN (' . $contractList . ')) AND h.i_enabled=1
    ORDER BY cn.sp_tor_contract_id,p.i_period,h.sp_check_period_hdr_id', array());
// Match the fund usage labels on the original inspection form.
$fundUsage = array(1 => 'ใช้เงินกันเหลื่อมยังไม่ก่อหนี้ - ยังไม่จองใบกัน',
    2 => 'ใช้เงินกันเหลื่อมยังไม่ก่อหนี้ - จองใบกันแล้ว', 3 => 'ใช้เงินกันเหลื่อมก่อหนี้แล้ว');
foreach ($checks as &$check) {
    $contract = $contractsById[intval($check['linked_contract_id'])] ?? array();
    $overlap = intval($contract['i_overlap'] ?? 0);
    $check['fund_usage'] = $fundUsage[$overlap] ?? (intval($pr[0]['i_type_bg'] ?? 0) === 1
        ? 'ใช้เงินปีงบปัจจุบัน' : 'โครงการต่อเนื่อง ใช้เงินปีงบปัจจุบัน');
    $secondCode = trim((string) ($contract['c_overlap2'] ?? ''));
    $check['uses_second_overlap'] = $secondCode !== ''
        && trim((string) ($check['resolved_overlap_code'] ?? '')) === $secondCode
        && intval($check['resolved_overlap_year'] ?? 0) === intval($contract['i_yyyy_overlap2'] ?? 0) ? 1 : 0;
}
unset($check);
$checkItems = $fetch('SELECT d.*, budget.c_name AS budget_name, expense.c_code AS expense_code,
    expense.c_name AS expense_name, p.i_pr_type1 AS period_booking_type
    FROM dbo.sp_check_period_dtl d
    INNER JOIN dbo.sp_check_period_hdr h ON h.sp_check_period_hdr_id=d.sp_check_period_hdr_id
    LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=h.sp_mn_contract_hdr_id
    LEFT JOIN ' . DB_CENTER . 'dc_expense_budget_type budget ON budget.dc_expense_budget_type_id=d.dc_bg_budget_type_id
    LEFT JOIN ' . DB_NMU . 'bg_expense expense ON expense.bg_expense_id=d.po_expense_id
    LEFT JOIN dbo.sp_tor_hdr_period p ON p.sp_tor_hdr_period_id=d.sp_tor_hdr_period_id
    WHERE (h.sp_tor_contract_id IN (' . $contractList . ') OR m.sp_contract_id IN (' . $contractList . ')) AND h.i_enabled=1
    ORDER BY d.sp_check_period_hdr_id,d.sp_check_period_dtl_id', array());
$debtItems = $fetch('SELECT i.sp_tranf_item_id, t.sp_check_period_hdr_id, i.c_name,
    i.i_workin_process, i.i_is_under, acc.c_code AS account_code, acc.c_name AS account_name,
    (SELECT TOP 1 c_name FROM dbo.am_mode_acc WHERE am_mode_id=i.am_mode_id) AS asset_category,
    (SELECT TOP 1 c_name FROM dbo.inv_mode_acc WHERE inv_mode_id=i.inv_mode_id) AS inventory_category,
    CASE WHEN ISNULL(i.f_net_total_price,0) <> 0 THEN i.f_net_total_price
        ELSE ISNULL(i.f_under_total_price,0) + ISNULL(i.f_wip_total_price,0) END AS total_amount,
    i.f_vat_amt AS vat_amount
    FROM dbo.sp_tranf_item i
    INNER JOIN dbo.sp_tranf_hdr t ON t.sp_tranf_hdr_id=i.sp_tranf_hdr_id
    INNER JOIN dbo.sp_check_period_hdr h ON h.sp_check_period_hdr_id=t.sp_check_period_hdr_id
    LEFT JOIN dbo.sp_mn_contract_hdr m ON m.sp_mn_contract_hdr_id=h.sp_mn_contract_hdr_id
    LEFT JOIN ' . DB_CENTER . 'dc_acc acc ON acc.dc_acc_id=i.dc_acc_id
    WHERE (h.sp_tor_contract_id IN (' . $contractList . ') OR m.sp_contract_id IN (' . $contractList . ')) AND h.i_enabled=1 AND i.i_enabled=1
    ORDER BY t.sp_check_period_hdr_id,t.sp_tranf_hdr_id,i.sp_tranf_item_id', array());
echo json_encode(array('success' => true, 'pr' => $pr, 'funds' => $funds, 'items' => $items,
    'bidders' => $bidders, 'contracts' => $contracts, 'periods' => $periods,
    'periodItems' => $periodItems, 'checks' => $checks, 'checkItems' => $checkItems,
    'debtItems' => $debtItems, 'bidderGuarantees' => $bidderGuarantees,
    'contractFunds' => $contractFunds), JSON_UNESCAPED_UNICODE);
