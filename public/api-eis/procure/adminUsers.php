<?php
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
require __DIR__ . '/classes/Database.php';
require __DIR__ . '/AuthMiddleware.php';

function reply($status, $body) {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
$db = (new Database())->dbConnection();
$auth = (new Auth($db, getallheaders()))->isValid();
if ($auth['success'] !== 1) reply(401, ['success'=>0, 'message'=>'กรุณาเข้าสู่ระบบใหม่']);
if ($auth['user']['role'] !== 'superadmin') reply(403, ['success'=>0, 'message'=>'เฉพาะ Superadmin เท่านั้น']);
$method = $_SERVER['REQUEST_METHOD'];
try {
    if ($method === 'GET') {
        $users = $db->query('SELECT id,name,email,role,is_active,token_lifetime,last_token_expires_at FROM users ORDER BY id')->fetchAll(PDO::FETCH_ASSOC);
        reply(200, ['success'=>1, 'users'=>$users, 'current_user_id'=>(int)$auth['user']['id']]);
    }
    if ($method !== 'POST') reply(405, ['success'=>0, 'message'=>'Method not allowed']);
    $input = json_decode(file_get_contents('php://input'), true);
    if (!is_array($input) || !isset($input['id']) || !is_int($input['id']) || $input['id'] < 1 ||
        !in_array($input['action'] ?? null, ['lifetime','expire','status'], true)) {
        reply(422, ['success'=>0, 'message'=>'ข้อมูลไม่ถูกต้อง']);
    }
    $id = $input['id']; $action = $input['action'];
    if ($action === 'lifetime' && (!array_key_exists('token_lifetime', $input) ||
        ($input['token_lifetime'] !== null && !in_array($input['token_lifetime'], JwtHandler::TOKEN_LIFETIMES, true)))) {
        reply(422, ['success'=>0, 'message'=>'อายุโทเคนไม่ถูกต้อง']);
    }
    if ($action === 'status' && (!isset($input['is_active']) || !in_array($input['is_active'], [0,1], true))) {
        reply(422, ['success'=>0, 'message'=>'สถานะไม่ถูกต้อง']);
    }
    if ($action === 'status' && $id === (int)$auth['user']['id'] && $input['is_active'] === 0) {
        reply(422, ['success'=>0, 'message'=>'ไม่สามารถปิดใช้งานบัญชีที่คุณกำลังใช้']);
    }
    $db->beginTransaction();
    // Lock actor and target in a stable order; recheck permissions after acquiring locks.
    $lock = $db->prepare('SELECT id,role,is_active,token_version FROM users WHERE id IN (?,?) ORDER BY id FOR UPDATE');
    $lock->execute([(int)$auth['user']['id'], $id]);
    $rows = $lock->fetchAll(PDO::FETCH_UNIQUE | PDO::FETCH_ASSOC);
    $actor = $rows[(int)$auth['user']['id']] ?? null;
    if (!$actor || $actor['role'] !== 'superadmin' || !(int)$actor['is_active'] || (int)$actor['token_version'] !== (int)$auth['user']['token_version']) {
        $db->rollBack(); reply(403, ['success'=>0, 'message'=>'สิทธิ์การเข้าถึงเปลี่ยนแล้ว กรุณาเข้าสู่ระบบใหม่']);
    }
    if (!isset($rows[$id])) { $db->rollBack(); reply(404, ['success'=>0, 'message'=>'ไม่พบผู้ใช้']); }
    if ($action === 'lifetime') {
        $query = $db->prepare('UPDATE users SET token_lifetime=?,token_version=token_version+1,last_token_expires_at=NULL WHERE id=?');
        $query->execute([$input['token_lifetime'], $id]);
    } elseif ($action === 'status') {
        $query = $db->prepare('UPDATE users SET is_active=?,token_version=token_version+1,last_token_expires_at=NULL WHERE id=?');
        $query->execute([$input['is_active'], $id]);
    } else {
        $query = $db->prepare('UPDATE users SET token_version=token_version+1,last_token_expires_at=NULL WHERE id=?');
        $query->execute([$id]);
    }
    $db->commit();
    reply(200, ['success'=>1, 'message'=>'บันทึกแล้ว โทเคนเดิมทั้งหมดของผู้ใช้นี้ใช้ไม่ได้แล้ว', 'reauthenticate'=>$id === (int)$auth['user']['id']]);
} catch (Throwable $e) {
    if ($db && $db->inTransaction()) $db->rollBack();
    reply(500, ['success'=>0, 'message'=>'ดำเนินการไม่สำเร็จ กรุณาลองใหม่']);
}
