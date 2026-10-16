<?php
$presencePassiveRequest = true;
require_once '../conf/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
if (empty($_SESSION['user_id'])) { http_response_code(401); echo '{}'; exit; }
$_SESSION['supplies_approval_csrf'] ??= bin2hex(random_bytes(32));
try {
    $decision = '';
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
        if (!hash_equals($_SESSION['supplies_approval_csrf'], (string)($_POST['csrf'] ?? ''))) { http_response_code(403); echo '{}'; exit; }
        $decision = (string)($_POST['decision'] ?? '');
        if (!in_array($decision, ['approved','denied'], true)) throw new RuntimeException('Invalid decision');
    }
    $view = SingleLogin::transfer(SingleLogin::scoped((string)$_SESSION['user_id'], SingleLogin::operator('SUPPLIES', (string)$_SESSION['user_id'])), (string)$_SESSION['login_instance'], (string)($_POST['nonce'] ?? ''), 0, $decision);
    echo json_encode(['request'=>$view['request'] ?? null, 'csrf'=>$_SESSION['supplies_approval_csrf']], JSON_UNESCAPED_UNICODE);
} catch (RuntimeException $e) { http_response_code(409); echo json_encode(['error'=>$e->getMessage()], JSON_UNESCAPED_UNICODE); }
