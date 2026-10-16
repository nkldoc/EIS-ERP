<?php
require '../../../conf/config.php';
require '../../../lib/database/DatabaseServer.php';
header('Content-Type: application/json; charset=utf-8');
function respondOverlap($status, $msg) {
    http_response_code($status);
    echo json_encode(array('success' => $status === 200, 'msg' => $msg));
    exit;
}
if (empty($_SESSION['user_id'])) respondOverlap(401, 'กรุณาเข้าสู่ระบบใหม่');
if ((int) $_SESSION['user_id'] !== 1) respondOverlap(403, 'เฉพาะผู้ดูแลระบบ');
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_SESSION['project_overlap_token']) ||
    !hash_equals($_SESSION['project_overlap_token'], (string) ($_POST['token'] ?? ''))) {
    respondOverlap(403, 'กรุณาเปิดหน้าจอใหม่แล้วลองอีกครั้ง');
}
$id = (int) ($_POST['sp_tor_contract_id'] ?? 0);
$parent = (int) ($_POST['parent_id'] ?? 0);
if ($id <= 0 || $parent <= 0) respondOverlap(400, 'กรุณาเลือก PO ย่อย');
$db = new DatabaseServer();
$conn = $db->conn;
if (!sqlsrv_begin_transaction($conn)) respondOverlap(500, 'เริ่มรายการไม่สำเร็จ');
try {
    // Serialize admin resets. Retain old references until every external cancellation succeeds.
    $stmt = sqlsrv_query($conn, 'SELECT * FROM dbo.sp_tor_contract WITH (UPDLOCK, HOLDLOCK)
        WHERE sp_tor_contract_id = ? AND parent_id = ? AND i_enabled = 1', array($id, $parent));
    if (!$stmt) throw new Exception('อ่านข้อมูล PO ย่อยไม่สำเร็จ');
    $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
    if (!$row) throw new Exception('ไม่พบ PO ย่อยในสัญญานี้');
    $stmt = sqlsrv_query($conn, 'SELECT TOP 1 sp_check_period_hdr_id FROM dbo.sp_check_period_hdr WITH (UPDLOCK, HOLDLOCK)
        WHERE sp_tor_contract_id = ? AND i_enabled = 1', array($id));
    if (!$stmt) throw new Exception('ตรวจสอบรายการตรวจรับไม่สำเร็จ');
    if (sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) throw new Exception('มีรายการตรวจรับต่อแล้ว กรุณาจัดการรายการตรวจรับก่อน');
    $refs = array();
    for ($n = 1; $n <= 3; $n++) {
        $ref = (int) ($row['bg_reserve_money' . $n . '_id'] ?? 0);
        if ($ref > 0) $refs['money:' . $ref] = array('bg_reserve_money_id', $ref);
    }
    $overlap = (int) ($row['bg_reserve_overlap_id'] ?? 0);
    if ($overlap > 0) $refs['overlap:' . $overlap] = array('bg_reserve_overlap_id', $overlap);
    if ((int) ($row['i_overlap'] ?? 0) === 2 && $overlap <= 0) {
        throw new Exception('สถานะจองใบกันไม่มีเลขอ้างอิง กรุณาตรวจสอบกับระบบงบประมาณก่อน');
    }
    foreach ($refs as $ref) {
        $curl = curl_init(rtrim(IPAPIBG, '/') . '/?/bg/mn_BgReserveMoney/mode/PUT/' . $ref[0] . '/' . $ref[1] . '/i_enable/2');
        curl_setopt_array($curl, array(CURLOPT_RETURNTRANSFER => true, CURLOPT_CONNECTTIMEOUT => 10, CURLOPT_TIMEOUT => 20));
        $body = curl_exec($curl);
        $status = curl_getinfo($curl, CURLINFO_HTTP_CODE);
        curl_close($curl);
        $result = json_decode($body ?: '', true);
        if ($status !== 200 || ($result['success'] ?? false) !== true) {
            throw new Exception('ยกเลิกยอดจองเดิมไม่สำเร็จ (' . $ref[0] . ': ' . $ref[1] . ') ยังไม่เปิดให้จองใหม่ กรุณาตรวจสอบระบบงบประมาณ');
        }
    }
    $params = array(date('Y-m-d H:i:s'), (int) $_SESSION['user_id'], (int) $_SESSION['dc_cost_id'], $id, $parent);
    $stmt = sqlsrv_query($conn, 'UPDATE dbo.sp_tor_contract SET i_booking_bg = 2, i_overlap = 0,
        bg_reserve_overlap_id = NULL, bg_reserve_money1_id = NULL, bg_reserve_money2_id = NULL,
        bg_reserve_money3_id = NULL, i_contract_status = 1,
        d_update = ?, dc_user_update_id = ?, dc_user_update_cost_id = ?
        WHERE sp_tor_contract_id = ? AND parent_id = ?', $params);
    if (!$stmt) throw new Exception('บันทึกสถานะไม่สำเร็จ กรุณาตรวจสอบยอดจองเดิมก่อนลองใหม่');
    if (!sqlsrv_commit($conn)) throw new Exception('ยืนยันรายการไม่สำเร็จ');
    respondOverlap(200, 'เปิดให้บันทึกเลขกันเหลื่อมและจองใหม่แล้ว');
} catch (Throwable $error) {
    sqlsrv_rollback($conn);
    respondOverlap(409, $error->getMessage());
}
