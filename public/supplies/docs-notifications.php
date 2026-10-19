<?php
ini_set('display_errors', '0');
ini_set('log_errors', '1');
require_once __DIR__ . '/conf/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
if (empty($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success'=>false,'message'=>'กรุณาเข้าสู่ระบบ Supplies ใหม่'], JSON_UNESCAPED_UNICODE);
    exit;
}
$userId = (string)$_SESSION['user_id'];
$_SESSION['docs_notification_csrf'] = $_SESSION['docs_notification_csrf'] ?? bin2hex(random_bytes(32));
$csrf = $_SESSION['docs_notification_csrf'];
session_write_close();
$productionDocs = strtolower(preg_replace('/:\d+$/', '', (string)($_SERVER['HTTP_HOST'] ?? ''))) === 'eis.nmu.ac.th';
$connection = null;
try {
    $docsCredentials = ['user'=>DB_USER,'password'=>DB_PASS];
    if ($productionDocs) {
        $credentialsPath = __DIR__ . '/conf/docs-database.production.local.php';
        if (!is_file($credentialsPath) || !is_readable($credentialsPath)) {
            throw new RuntimeException('Missing or unreadable production DOCS database configuration');
        }
        $docsCredentials = require $credentialsPath;
    }
    if (!is_array($docsCredentials) || empty($docsCredentials['user']) ||
        !isset($docsCredentials['password']) || !is_string($docsCredentials['password']) ||
        trim($docsCredentials['password']) === '') {
        throw new RuntimeException('Invalid DOCS database configuration');
    }
    $docsPassword = $docsCredentials['password'];
    $docsSecret = trim((string)getenv('EIS_DOCS_WS_SECRET')) ?: hash('sha256', trim($docsPassword) . '|eis-docs-websocket-v1');
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
    if (!in_array($method, ['GET','POST'], true)) { http_response_code(405); throw new RuntimeException('Method not allowed'); }
    if ($method === 'POST' && !hash_equals($csrf, (string)($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ''))) {
        http_response_code(403); throw new RuntimeException('กรุณาโหลดหน้าใหม่ก่อนทำรายการ');
    }
    if ($productionDocs && $method === 'GET' && ($_GET['action'] ?? '') === 'ws_token') {
        $encode = static function ($value) { return rtrim(strtr(base64_encode($value), '+/', '-_'), '='); };
        $payload = $encode(json_encode(['u'=>$userId,'e'=>time()+300], JSON_UNESCAPED_SLASHES));
        echo json_encode(['success'=>true,'enabled'=>true,'token'=>$payload.'.'.$encode(hash_hmac('sha256',$payload,$docsSecret,true))]);
        exit;
    }
    $connection = sqlsrv_connect($productionDocs ? '192.168.201.3,1433' : DB_SERVER, ['Database'=>'EIS_DOCS','UID'=>$docsCredentials['user'],'PWD'=>$docsPassword,'CharacterSet'=>'UTF-8','Encrypt'=>true,'TrustServerCertificate'=>true,'LoginTimeout'=>5]);
    if (!$connection) throw new RuntimeException('เชื่อมต่อฐานข้อมูลแจ้งเตือนไม่สำเร็จ');
    if ($method === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $id = filter_var($body['notification_id'] ?? null, FILTER_VALIDATE_INT);
        if (!$id || $id < 1) { http_response_code(400); throw new RuntimeException('รายการไม่ถูกต้อง'); }
        $stmt = sqlsrv_query($connection, 'UPDATE dbo.DOCS_NOTIFICATION SET read_at=COALESCE(read_at,SYSDATETIME()) WHERE notification_id=? AND user_id=?', [$id,$userId]);
        if (!$stmt) throw new RuntimeException('บันทึกสถานะอ่านไม่สำเร็จ');
        sqlsrv_free_stmt($stmt);
        if ($productionDocs) {
            $context = stream_context_create(['http'=>[
                'method'=>'POST', 'header'=>"Content-Type: application/json\r\nX-EIS-DOCS-Internal-Secret: {$docsSecret}\r\n",
                'content'=>json_encode(['user_id'=>$userId,'notification_type'=>'READ_STATUS_CHANGED']),
                'timeout'=>2, 'ignore_errors'=>true,
            ]]);
            if (@file_get_contents('https://doc-eis.nmu.ac.th/eis-docs/api/notifications/publish',false,$context) === false) error_log('Supplies: unable to publish document read status');
        }
    }
    $stmt = sqlsrv_query($connection, 'SELECT TOP (30) notification_id,docs_id,title,message,wf_order,CONVERT(varchar(19),created_at,120) created_at,read_at FROM dbo.DOCS_NOTIFICATION WHERE user_id=? ORDER BY notification_id DESC', [$userId]);
    if (!$stmt) throw new RuntimeException('โหลดแจ้งเตือนไม่สำเร็จ');
    $items=[];
    while ($row=sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        $row['is_read']=$row['read_at']!==null; unset($row['read_at']); $items[]=$row;
    }
    sqlsrv_free_stmt($stmt);
    $stmt=sqlsrv_query($connection,'SELECT COUNT(*) n FROM dbo.DOCS_NOTIFICATION WHERE user_id=? AND read_at IS NULL',[$userId]);
    if (!$stmt) throw new RuntimeException('โหลดจำนวนแจ้งเตือนไม่สำเร็จ');
    $count=(int)sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC)['n']; sqlsrv_free_stmt($stmt);
    echo json_encode(['success'=>true,'notifications'=>$items,'unread_count'=>$count,'csrf'=>$csrf],JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
} catch (Throwable $error) {
    if (http_response_code()<400) http_response_code(500);
    error_log('Supplies document notifications: '.$error->getMessage());
    echo json_encode(['success'=>false,'message'=>http_response_code() >= 500 ? 'โหลดแจ้งเตือนเอกสารไม่สำเร็จ กรุณาลองใหม่อีกครั้ง' : $error->getMessage()],JSON_UNESCAPED_UNICODE);
} finally { if ($connection) sqlsrv_close($connection); }
