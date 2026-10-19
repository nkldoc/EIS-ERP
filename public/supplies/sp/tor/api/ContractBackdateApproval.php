<?php
// Shared checks used by the request API and the number-issuing transaction.
function backdateApprover($conn) {
    $stmt = sqlsrv_query($conn, "SELECT u.dc_user_id FROM dbo.dc_user u
        INNER JOIN dbo.dc_cost c ON c.dc_cost_id=u.dc_cost_id
        INNER JOIN dbo.sp_emp e ON e.dc_emp_id=u.dc_emp_id
        INNER JOIN dbo.sp_department d ON d.dc_department_id=e.dc_department_id
        WHERE UPPER(u.c_user_name)=? AND u.i_enable=1 AND u.i_delete=2
        AND c.c_name = ? AND d.c_name = ?", array('PHURIWACH', 'ฝ่ายพัสดุ', 'หัวหน้าฝ่าย'));
    if (!$stmt) return 0;
    $rows = array();
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) $rows[] = intval($row['dc_user_id']);
    return count($rows) === 1 ? $rows[0] : 0;
}
function backdateApprovalId($conn, $contractId, $torId, $day, $userId) {
    $stmt = sqlsrv_query($conn, "SELECT TOP 1 request_id FROM dbo.sp_contract_backdate_request WITH (UPDLOCK,HOLDLOCK)
        WHERE contract_id=? AND tor_id=? AND requested_date=? AND requester_id=? AND status='approved'
        AND used_at IS NULL ORDER BY request_id DESC", array($contractId, $torId, $day, $userId));
    $row = $stmt ? sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC) : false;
    return $row ? intval($row['request_id']) : 0;
}
