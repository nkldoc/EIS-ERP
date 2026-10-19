<?php
require_once __DIR__ . '/../conf/config.php';
header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    echo json_encode(['reval' => 1, 'success' => 'Error', 'msg' => 'POST required']);
    exit;
}
if ((int) ($_SESSION['user_id'] ?? 0) !== 1) {
    http_response_code(403);
    echo json_encode(['reval' => 1, 'success' => 'Error', 'msg' => 'Administrator required']);
    exit;
}
$targetUserId = filter_var($_POST['ss_user_id'] ?? null, FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1],
]);
if (!$targetUserId) {
    http_response_code(400);
    echo json_encode(['reval' => 1, 'success' => 'Error', 'msg' => 'Missing or invalid ss_user_id']);
    exit;
}
// Reuse the portal login's user lookup and session initialization.
$_REQUEST['ss_user_id'] = $targetUserId;
unset($_GET['debug_config'], $_GET['portal_entry']);
require __DIR__ . '/login_1.php';