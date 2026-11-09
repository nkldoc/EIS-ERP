<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");

header('Content-Type: application/json; charset=utf-8');
function reply($ok, $message) {
    echo json_encode(array('success' => $ok, 'msg' => $message));
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_SESSION['user_id'])
    || (int)($_SESSION['dc_center_user'] ?? 0) !== 1) {
    reply(false, 'ไม่มีสิทธิ์ถอยสถานะรายการนี้');
}
$id = filter_input(INPUT_POST, 'sp_check_period_hdr_id', FILTER_VALIDATE_INT);
if (!$id || $id < 1) {
    reply(false, 'กรุณาเลือกรายการตรวจรับ');
}

$db = new DatabaseServer();
$conn = $db->conn;
if (!sqlsrv_begin_transaction($conn)) reply(false, 'ไม่สามารถเริ่มรายการได้');

try {
    $run = function ($sql, $params = array()) use ($conn) {
        $stmt = sqlsrv_query($conn, $sql, $params);
        if ($stmt === false) throw new RuntimeException('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        return $stmt;
    };
    $stmt = $run('SELECT sp_check_period_hdr_id, i_status_checking, i_status_billing,
        po_working_hdr_id, c_code FROM dbo.sp_check_period_hdr WITH (UPDLOCK, HOLDLOCK)
        WHERE sp_check_period_hdr_id = ?', array($id));
    $check = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
    if (!$check || (int)$check['i_status_checking'] !== 1 || !$check['c_code']) {
        throw new DomainException('รายการนี้ยังไม่ผ่านการตรวจรับ');
    }
    if (!empty($check['po_working_hdr_id'])) {
        throw new DomainException('รายการนี้มีใบเบิกแล้ว ไม่สามารถถอยสถานะได้');
    }
    if ($check['i_status_billing'] !== null && (int)$check['i_status_billing'] !== 4) {
        throw new DomainException('สถานะวางบิลของรายการเปลี่ยนไป กรุณาโหลดข้อมูลใหม่');
    }

    $items = array();
    $stmt = $run('SELECT * FROM dbo.sp_check_billing_items WITH (UPDLOCK, HOLDLOCK)
        WHERE sp_check_period_hdr_id = ?', array($id));
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) $items[] = $row;
    if (count($items) !== 1 || empty($items[0]['c_code'])) {
        throw new DomainException('ไม่พบเลขวางบิลที่ถอยได้ หรือมีข้อมูลซ้ำ กรุณาตรวจสอบรายการ');
    }

    $blocking = $run('SELECT CASE WHEN EXISTS
        (SELECT 1 FROM dbo.sp_withdraw WHERE sp_check_period_hdr_id = ? AND i_enable = 1)
        OR EXISTS (SELECT 1 FROM ' . DB_NMU_EIS . 'po_working_hdr
            WHERE po_working_hdr_id = ? AND i_enable = 1)
        THEN 1 ELSE 0 END AS blocked', array($id, $check['po_working_hdr_id']));
    $blocked = sqlsrv_fetch_array($blocking, SQLSRV_FETCH_ASSOC);
    if ((int)$blocked['blocked'] === 1) {
        throw new DomainException('รายการนี้มีใบเบิกแล้ว ไม่สามารถถอยสถานะได้');
    }

    $details = array();
    $stmt = $run('SELECT * FROM dbo.sp_check_billing_dtl WITH (UPDLOCK, HOLDLOCK)
        WHERE sp_check_period_hdr_id = ?', array($id));
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) $details[] = $row;
    $run('INSERT INTO dbo.sp_check_billing_rollback_history
        (sp_check_period_hdr_id, billing_item_snapshot, billing_detail_snapshot,
         previous_status, actor_user_id, actor_cost_id)
        VALUES (?, ?, ?, ?, ?, ?)', array($id, json_encode($items, JSON_UNESCAPED_UNICODE),
        json_encode($details, JSON_UNESCAPED_UNICODE), $check['i_status_billing'],
        $_SESSION['user_id'], $_SESSION['dc_cost_id'] ?? null));

    $run('DELETE FROM dbo.sp_check_billing_dtl WHERE sp_check_period_hdr_id = ?', array($id));
    $run('UPDATE dbo.sp_check_billing_items SET c_code = NULL,
        dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
        WHERE sp_check_period_hdr_id = ?', array($_SESSION['user_id'], $_SESSION['dc_cost_id'] ?? null, $id));
    $run('UPDATE dbo.sp_check_period_hdr SET i_status_billing = NULL,
        dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
        WHERE sp_check_period_hdr_id = ?', array($_SESSION['user_id'], $_SESSION['dc_cost_id'] ?? null, $id));
    if (!sqlsrv_commit($conn)) throw new RuntimeException('ไม่สามารถยืนยันรายการได้');
    reply(true, 'ถอยกลับเป็นรอวางบิลเรียบร้อยแล้ว');
} catch (Exception $e) {
    sqlsrv_rollback($conn);
    reply(false, $e->getMessage());
}
