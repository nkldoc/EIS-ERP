<?php
declare(strict_types=1);

require_once '../../../conf/config.php';
require_once '../../../lib/database/DatabaseServer.php';

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST' || empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'msg' => 'เซสชันหมดอายุ']);
    exit;
}

$contractId = (int)($_POST['sp_tor_contract_id'] ?? 0);
$reason = trim((string)($_POST['reason'] ?? ''));
if ($contractId <= 0 || $reason === '' || mb_strlen($reason, 'UTF-8') > 1000) {
    echo json_encode(['success' => false, 'msg' => 'กรุณาระบุเลขสัญญาและเหตุผลไม่เกิน 1,000 ตัวอักษร']);
    exit;
}

$db = new DatabaseServer();
$stmt = $db->QueryParam(
    'UPDATE dbo.sp_tor_contract SET i_enabled = 2, reasion_cancle = ?, d_update = GETDATE() WHERE sp_tor_contract_id = ? AND i_enabled = 1',
    [$reason, $contractId]
);

$check = $db->QueryParam(
    'SELECT i_enabled, reasion_cancle FROM dbo.sp_tor_contract WHERE sp_tor_contract_id = ?',
    [$contractId]
);
$row = $db->Fetch($check);
$ok = $row && (int)$row['i_enabled'] === 2 && (string)$row['reasion_cancle'] === $reason;

echo json_encode([
    'success' => $ok,
    'sp_tor_contract_id' => $contractId,
    'i_enabled' => $row ? (int)$row['i_enabled'] : null,
    'msg' => $ok ? 'ยกเลิกสัญญาเรียบร้อยแล้ว' : 'ไม่สามารถเปลี่ยนสถานะสัญญาได้'
], JSON_UNESCAPED_UNICODE);
