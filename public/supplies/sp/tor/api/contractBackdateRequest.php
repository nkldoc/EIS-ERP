<?php
require_once __DIR__ . '/../../../conf/config.php';
require_once __DIR__ . '/../../../lib/database/DatabaseServer.php';
require_once __DIR__ . '/ContractBackdateApproval.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function backdateReply($ok, $message, $extra = array()) {
    echo json_encode(array_merge(array('success'=>$ok, 'msg'=>$message), $extra), JSON_UNESCAPED_UNICODE);
    exit;
}
$uid = intval($_SESSION['user_id'] ?? 0);
if (!$uid) { http_response_code(401); backdateReply(false, 'กรุณาเข้าสู่ระบบ'); }
$db = new DatabaseServer();
$conn = $db->conn;
$mode = $_POST['mode'] ?? 'LIST';
if (empty($_SESSION['backdate_csrf'])) $_SESSION['backdate_csrf'] = bin2hex(random_bytes(32));
$approver = backdateApprover($conn);
$isApprover = $approver > 0 && $approver === $uid;
if ($mode !== 'LIST' && (!isset($_POST['csrf']) || !hash_equals($_SESSION['backdate_csrf'], (string)$_POST['csrf']))) {
    http_response_code(403); backdateReply(false, 'กรุณาโหลดรายการใหม่แล้วลองอีกครั้ง');
}
$ready = sqlsrv_query($conn, "SELECT OBJECT_ID('dbo.sp_contract_backdate_request','U') AS id");
$readyRow = $ready ? sqlsrv_fetch_array($ready, SQLSRV_FETCH_ASSOC) : false;
if (!$readyRow || !$readyRow['id']) backdateReply(false, 'ยังไม่ได้ติดตั้งตารางคำขอออกเลขย้อนหลัง กรุณาติดต่อผู้ดูแลระบบ');
if ($mode === 'LIST') {
    $stmt = sqlsrv_query($conn, "SELECT TOP 200 r.request_id, r.contract_id, r.tor_id,
        CONVERT(varchar(10),r.requested_date,23) AS requested_date, r.reason, r.status,
        CONVERT(varchar(19),r.created_at,120) AS created_at, r.decision_reason,
        CONVERT(varchar(19),r.decided_at,120) AS decided_at, u.c_full_name AS requester_name,
        ISNULL(c.c_code,'') AS contract_code
        FROM dbo.sp_contract_backdate_request r
        INNER JOIN dbo.dc_user u ON u.dc_user_id=r.requester_id
        INNER JOIN dbo.sp_tor_contract c ON c.sp_tor_contract_id=r.contract_id
        WHERE " . ($isApprover ? 'r.approver_id=?' : 'r.requester_id=?') . "
        ORDER BY CASE WHEN r.status='pending' THEN 0 ELSE 1 END,r.request_id DESC", array($uid));
    if (!$stmt) backdateReply(false, 'ไม่สามารถโหลดคำขอได้');
    $rows = array();
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) $rows[] = $row;
    $countStmt = sqlsrv_query($conn, "SELECT COUNT(*) AS total FROM dbo.sp_contract_backdate_request WHERE "
        . ($isApprover ? 'approver_id=?' : 'requester_id=?') . " AND status='pending'", array($uid));
    $count = $countStmt ? sqlsrv_fetch_array($countStmt, SQLSRV_FETCH_ASSOC) : false;
    backdateReply(true, '', array('data'=>$rows, 'pending'=>intval($count['total'] ?? 0),
        'is_approver'=>$isApprover, 'csrf'=>$_SESSION['backdate_csrf']));
}
if ($mode === 'REQUEST') {
    if (!$approver) backdateReply(false, 'ไม่พบบัญชีหัวหน้าพัสดุ phuriwach ที่เปิดใช้งานเพียงหนึ่งบัญชีในฝ่ายพัสดุ กรุณาติดต่อผู้ดูแลระบบ');
    $id = intval($_POST['contract_id'] ?? 0);
    $tor = intval($_POST['tor_id'] ?? 0);
    $day = (string)($_POST['requested_date'] ?? '');
    $reason = trim((string)($_POST['reason'] ?? ''));
    $date = DateTime::createFromFormat('!Y-m-d', $day);
    $today = (new DateTime('now', new DateTimeZone('Asia/Bangkok')))->format('Y-m-d');
    if (!$date || $date->format('Y-m-d') !== $day || $day >= $today || $reason === '' || mb_strlen($reason,'UTF-8') > 2000)
        backdateReply(false, 'กรุณาระบุวันที่ย้อนหลังและเหตุผลไม่เกิน 2,000 ตัวอักษร');
    if (!sqlsrv_begin_transaction($conn)) backdateReply(false, 'ไม่สามารถเริ่มบันทึกคำขอได้');
    $stmt = sqlsrv_query($conn, "SELECT sp_tor_contract_id FROM dbo.sp_tor_contract WITH (UPDLOCK,HOLDLOCK)
        WHERE sp_tor_contract_id=? AND sp_tor_id=? AND dc_user_create_id=? AND ISNULL(c_code,'')=''", array($id,$tor,$uid));
    if (!$stmt || !sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        sqlsrv_rollback($conn); backdateReply(false, 'ต้องเป็นผู้สร้างสัญญาที่ยังไม่มีเลข และบันทึกรายละเอียดสัญญาก่อนส่งคำขอ');
    }
    $stmt = sqlsrv_query($conn, "SELECT request_id FROM dbo.sp_contract_backdate_request WITH (UPDLOCK,HOLDLOCK)
        WHERE contract_id=? AND status IN ('pending','approved')", array($id));
    if (!$stmt || sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        sqlsrv_rollback($conn); backdateReply(false, 'มีคำขอรอพิจารณาหรืออนุมัติแล้วสำหรับสัญญานี้ กรุณาตรวจรายการคำขอ');
    }
    $stmt = sqlsrv_query($conn, "INSERT dbo.sp_contract_backdate_request
        (contract_id,tor_id,requested_date,reason,requester_id,approver_id) VALUES (?,?,?,?,?,?)", array($id,$tor,$day,$reason,$uid,$approver));
    if (!$stmt || !sqlsrv_commit($conn)) { sqlsrv_rollback($conn); backdateReply(false, 'บันทึกคำขอไม่สำเร็จ'); }
    backdateReply(true, 'ส่งคำขอให้หัวหน้าพัสดุแล้ว กรุณารอผลอนุมัติ');
}
if ($mode === 'DECIDE') {
    if (!$isApprover) { http_response_code(403); backdateReply(false, 'เฉพาะหัวหน้าพัสดุผู้รับคำขอเท่านั้นที่พิจารณาได้'); }
    $decision = $_POST['decision'] ?? '';
    $reason = trim((string)($_POST['decision_reason'] ?? ''));
    if (!in_array($decision,array('approved','rejected'),true) || mb_strlen($reason,'UTF-8') > 2000
        || ($decision === 'rejected' && $reason === '')) backdateReply(false, 'กรุณาระบุผลพิจารณาและเหตุผลกรณีไม่อนุมัติ');
    $stmt = sqlsrv_query($conn, "UPDATE dbo.sp_contract_backdate_request SET status=?,decision_reason=?,decided_at=SYSDATETIME()
        WHERE request_id=? AND approver_id=? AND status='pending'", array($decision,$reason,intval($_POST['request_id'] ?? 0),$uid));
    if (!$stmt || sqlsrv_rows_affected($stmt)!==1) backdateReply(false, 'คำขอนี้ถูกพิจารณาแล้วหรือไม่มีสิทธิ์ กรุณาโหลดรายการใหม่');
    backdateReply(true, $decision === 'approved' ? 'อนุมัติคำขอแล้ว' : 'ไม่อนุมัติคำขอแล้ว');
}
backdateReply(false, 'ไม่รองรับคำสั่งนี้');
