<?php
require_once __DIR__ . '/../../conf/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function reply($code, $body) { http_response_code($code); echo json_encode($body, JSON_UNESCAPED_UNICODE); exit; }
if (empty($_SESSION['user_id'])) reply(401, ['error'=>'กรุณาเข้าสู่ระบบ ERP']);
if (empty($_SESSION['mapper_token'])) $_SESSION['mapper_token'] = bin2hex(random_bytes(32));
$token = $_SESSION['mapper_token'];
$user = (string)$_SESSION['user_id'];
session_write_close();
$dir = dirname(__DIR__, 4) . '/storage/jsonmapper';
if (!is_dir($dir) && !@mkdir($dir, 0700, true) && !is_dir($dir)) reply(500, ['error'=>'สร้างพื้นที่บันทึกไม่ได้']);
$path = $dir . '/' . hash('sha256', $user) . '.json';
$lock = @fopen($path . '.lock', 'c');
if (!$lock || !flock($lock, LOCK_EX)) reply(500, ['error'=>'เปิดพื้นที่บันทึกไม่ได้']);
$state = ['items'=>[], 'active'=>null];
if (is_file($path)) {
    $state = json_decode(file_get_contents($path), true);
    if (!is_array($state) || !isset($state['items'])) reply(500, ['error'=>'อ่านประวัติไม่ได้']);
}
$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'POST') {
    if (!hash_equals($token, $_SERVER['HTTP_X_MAPPER_TOKEN'] ?? '')) reply(403, ['error'=>'Session หมดอายุ กรุณาโหลดหน้าใหม่']);
    $raw = file_get_contents('php://input', false, null, 0, 2097153);
    if (strlen($raw) > 2097152) reply(413, ['error'=>'ข้อมูลเกิน 2 MB']);
    $input = json_decode($raw, true);
    $doc = $input['document'] ?? null;
    if (!is_array($doc) || !is_string($doc['name'] ?? null) || trim($doc['name']) === '' || strlen($doc['name']) > 300 || !is_string($doc['json'] ?? null) || !is_array($doc['mapping'] ?? null) || !$doc['mapping'] || !is_string($doc['schema'] ?? null) || !is_string($doc['table'] ?? null) || !is_string($doc['source'] ?? null)) reply(422, ['error'=>'ข้อมูล mapping ไม่ครบ']);
    json_decode($doc['json']);
    if (json_last_error() !== JSON_ERROR_NONE) reply(422, ['error'=>'JSON ไม่ถูกต้อง']);
    if (($input['expectedActive'] ?? null) !== $state['active']) reply(409, ['error'=>'มีการบันทึกจากหน้าอื่น กรุณาโหลดประวัติใหม่ก่อนบันทึก']);
    $entry = ['id'=>bin2hex(random_bytes(16)), 'savedAt'=>gmdate('c'), 'document'=>$doc];
    array_unshift($state['items'], $entry);
    $state['active'] = $entry['id'];
    $tmp = tempnam($dir, 'save-');
    if (!$tmp || file_put_contents($tmp, json_encode($state, JSON_UNESCAPED_UNICODE)) === false || !@rename($tmp, $path)) {
        if ($tmp && is_file($tmp)) unlink($tmp);
        reply(500, ['error'=>'บันทึกไม่สำเร็จ ประวัติเดิมยังคงอยู่']);
    }
} elseif ($method !== 'GET') reply(405, ['error'=>'Method not allowed']);
flock($lock, LOCK_UN); fclose($lock);
$state['token'] = $token;
reply(200, $state);
