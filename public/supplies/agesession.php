<?php
require_once __DIR__ . '/conf/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'code' => 'SESSION_EXPIRED']);
    exit;
}
echo json_encode(['success' => true, 'remaining_seconds' => $timeout]);
