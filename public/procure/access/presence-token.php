<?php
$presencePassiveRequest = true;
require_once __DIR__ . '/../conf/config.php';
require_once __DIR__ . '/../conf/presence/Presence.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
if (empty($_SESSION['user_id'])) { http_response_code(401); echo json_encode(['code'=>'UNAUTHENTICATED']); exit; }
require_once __DIR__ . '/../conf/presence/AdminIdentity.php';
if (ProcureAdminIdentity::needsName()) { http_response_code(409); echo json_encode(['code'=>'ADMIN_NAME_REQUIRED','url'=>'/procure/access/admin-identity.php']); exit; }
$identity = $_SESSION;
session_write_close();
try {
    echo json_encode(ProcurePresence::token('PROCURE', (string)$identity['user_id'], (string)($identity['user_name'] ?? ''), (string)($identity['cost_name'] ?? ''), (string)($identity['last_login'] ?? '')));
} catch (UnexpectedValueException $e) { http_response_code(401); echo json_encode(['code'=>'UNAUTHENTICATED']); }
catch (Throwable $e) {
    // Return only known diagnostic codes; never disclose exception details or signing keys.
    $code = in_array($e->getMessage(), ['PRESENCE_CONFIG_REQUIRED', 'PRESENCE_STORAGE_UNAVAILABLE', 'PRESENCE_KEY_UNREADABLE', 'PRESENCE_KEY_EMPTY'], true)
        ? $e->getMessage() : 'PRESENCE_TOKEN_FAILED';
    http_response_code(503);
    echo json_encode(['code'=>$code, 'error'=>'Messenger service ยังไม่พร้อมใช้งาน']);
}
