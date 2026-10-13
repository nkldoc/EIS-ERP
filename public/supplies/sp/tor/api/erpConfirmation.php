<?php
require_once __DIR__ . '/../_conf/erpConfirmationResponse.php';
define('ERP_CONFIRMATION_API_BUFFER', ob_get_level());
ob_start();
register_shutdown_function(function () {
    $error = error_get_last();
    if ($error && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR], true)) {
        error_log('ERP confirmation fatal type=' . $error['type'] . ' file=' . basename($error['file']) . ' line=' . $error['line']);
        erpConfirmationRespond(500, ['success'=>false, 'code'=>'ERP_PHP_ERROR', 'message'=>'PHP บนเซิร์ฟเวอร์ทำงานผิดพลาด กรุณาตรวจ PHP error log ของเมนู ERP']);
    }
});
$stage = 'bootstrap';
try {
    require __DIR__ . '/erpConfirmationBootstrap.php';
    $stage = 'source';
    // เดิม: require_once dirname(__DIR__, 3) . '/api-eis/procure/classes/ErpConfirmation.php';
    require_once __DIR__ . '/erpConfirmationStore.php';
    $stage = 'connect';
    $db = erpConfirmationDb();
    $stage = 'query';
    $method = $_SERVER['REQUEST_METHOD'];
    if ($method === 'POST') {
        if (!hash_equals($erpCsrf, (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''))) {
            erpConfirmationRespond(403, ['success' => false, 'message' => 'กรุณาเปิดหน้านี้ใหม่แล้วลองอีกครั้ง']);
        }
        $input = json_decode(file_get_contents('php://input'), true);
        $id = filter_var(is_array($input) ? ($input['id'] ?? null) : null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$id) erpConfirmationRespond(422, ['success' => false, 'message' => 'รายการไม่ถูกต้อง']);
        if (!ErpConfirmationStore::confirm($db, $id, $erpUserId, $erpUserName)) {
            erpConfirmationRespond(409, ['success' => false, 'message' => 'รายการนี้ถูกยืนยันแล้วหรือไม่พบรายการ กรุณาโหลดข้อมูลใหม่']);
        }
        erpConfirmationRespond(200, ['success' => true, 'message' => 'ยืนยันข้อมูลแล้ว']);
    }
    if ($method !== 'GET') {
        header('Allow: GET, POST');
        erpConfirmationRespond(405, ['success' => false, 'message' => 'Method ไม่ถูกต้อง']);
    }
    if (isset($_GET['id'])) {
        $stmt = $db->prepare('SELECT q.*,l.received_at,l.username FROM sp_erp_confirmation q JOIN sp_api_incoming_log l ON l.request_id=q.request_id WHERE q.id=?');
        $stmt->execute([(int)$_GET['id']]);
        $row = $stmt->fetch();
        if (!$row) erpConfirmationRespond(404, ['success' => false, 'message' => 'ไม่พบรายการ']);
        $row['item'] = json_decode($row['payload']);
        unset($row['payload']);
        erpConfirmationRespond(200, ['success' => true, 'data' => $row]);
    }
    $state = $_GET['state'] ?? 'pending';
    $where = $state === 'confirmed' ? 'q.confirmed_at IS NOT NULL' : ($state === 'all' ? '1=1' : 'q.confirmed_at IS NULL');
    $page = max(1, (int)($_GET['page'] ?? 1));
    $offset = ($page - 1) * 25;
    $total = (int)$db->query('SELECT COUNT(*) FROM sp_erp_confirmation q WHERE ' . $where)->fetchColumn();
    $stmt = $db->query('SELECT q.id,q.request_id,q.item_index,q.confirmed_at,q.confirmed_name,q.payload,l.received_at,l.username FROM sp_erp_confirmation q JOIN sp_api_incoming_log l ON l.request_id=q.request_id WHERE ' . $where . ' ORDER BY l.received_at DESC, q.id DESC LIMIT 25 OFFSET ' . $offset);
    $rows = $stmt->fetchAll();
    foreach ($rows as &$row) {
        $item = json_decode($row['payload']);
        $row['pr_id'] = is_object($item) && isset($item->pr_id) && is_scalar($item->pr_id) ? $item->pr_id : '';
        $row['c_doc_ref'] = is_object($item) && isset($item->c_doc_ref) && is_scalar($item->c_doc_ref) ? $item->c_doc_ref : '';
        unset($row['payload']);
    }
    unset($row);
    erpConfirmationRespond(200, ['success' => true, 'data' => $rows, 'total' => $total, 'page' => $page]);
} catch (InvalidArgumentException $e) {
    erpConfirmationRespond(422, ['success' => false, 'message' => $e->getMessage()]);
} catch (Throwable $e) {
    erpConfirmationFailure($e, $stage);
}