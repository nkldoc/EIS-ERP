<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../account/api_auth.php';
require __DIR__ . '/../classes/IncomingEndpoint.php';
$db = apiDb();
$requestId = IncomingEndpoint::record($db, null, ErpConfirmation::URI, 'POST', 'http-fixture', 200, 'fixture', [], (object)['data' => [(object)['pr_id' => 'HTTP-FIXTURE']]]);
$stmt = $db->prepare('SELECT id FROM sp_erp_confirmation WHERE request_id=?');
$stmt->execute([$requestId]); $itemId = (int)$stmt->fetchColumn();
$router = tempnam(sys_get_temp_dir(), 'erp-router-');
$log = tempnam(sys_get_temp_dir(), 'erp-http-');
$server = null;
$sessionId = 'erpfixture' . bin2hex(random_bytes(10));
$supplies = str_replace('\\', '/', realpath(__DIR__ . '/../../../supplies'));
$checks = 0;
function httpCheck($condition, $label) {
    global $checks;
    if (!$condition) throw new RuntimeException($label);
    $checks++; echo "PASS $label\n";
}
function erpHttp($path, $role = '', $method = 'GET', $body = null, $csrf = '') {
    global $address;
    $curl = curl_init('http://' . $address . $path);
    curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10, CURLOPT_CUSTOMREQUEST => $method,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'X-Test-Role: ' . $role, 'X-CSRF-Token: ' . $csrf]]);
    if ($body !== null) curl_setopt($curl, CURLOPT_POSTFIELDS, json_encode($body));
    $text = curl_exec($curl); $code = curl_getinfo($curl, CURLINFO_HTTP_CODE); curl_close($curl);
    return [$code, json_decode((string)$text, true), $text];
}
function hasConfirmationBeforeDelivery($nodes) {
    foreach ($nodes as $index => $node) {
        if (($node['text'] ?? '') === 'ส่งมอบงาน' && $index > 0 && $nodes[$index-1]['id'] === 'sp-erpConfirmation') return true;
        if (isset($node['children']) && hasConfirmationBeforeDelivery($node['children'])) return true;
    }
    return false;
}
try {
    $socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
    if (!$socket) throw new RuntimeException('Cannot allocate loopback port');
    $address = stream_socket_get_name($socket, false); fclose($socket);
    $code = '<?php $_SERVER["HTTP_HOST"]="dev-eis.nmu.ac.th"; session_id(' . var_export($sessionId, true) . '); require ' . var_export($supplies . '/conf/config.php', true) . '; $_SESSION=[]; '
        . 'if (!empty($_SERVER["HTTP_X_TEST_ROLE"])) { $_SESSION=["user_id"=>2147483646,"user_name"=>"HTTP fixture","i_type_user"=>($_SERVER["HTTP_X_TEST_ROLE"]==="reviewer"?2:0),"erp_confirmation_csrf"=>"fixture-csrf"]; } '
        . 'if (strpos($_SERVER["REQUEST_URI"],"/menu")===0) { $conn=sqlsrv_connect(DB_SERVER,["Database"=>DB_NAME,"UID"=>DB_USER,"PWD"=>DB_PASS,"CharacterSet"=>DB_CHARSET]); $stmt=sqlsrv_query($conn,"SELECT TOP 1 p.dc_menu_id FROM dc_menu p JOIN dc_menu d ON p.c_code=LEFT(d.c_code,2)+REPLICATE(CHAR(48),LEN(d.c_code)-2) WHERE d.c_filelocation LIKE ?",["sp-deliverWork?%"]); $parent=sqlsrv_fetch_array($stmt,SQLSRV_FETCH_ASSOC); sqlsrv_close($conn); $_REQUEST=["url"=>"/supplies/","parent_id"=>$parent["dc_menu_id"]]; chdir(' . var_export($supplies . '/api/userMenu', true) . '); require "userTree.php"; exit; } '
        . 'require ' . var_export($supplies . '/sp/', true) . ' . (strpos($_SERVER["REQUEST_URI"],"/page")===0 ? "erpConfirmation.php" : "api/erpConfirmation.php");';
    file_put_contents($router, $code);
    $server = proc_open([PHP_BINARY, '-S', $address, $router], [['pipe','r'], ['file',$log,'a'], ['file',$log,'a']], $pipes);
    if (!is_resource($server)) throw new RuntimeException('Cannot start test server');
    fclose($pipes[0]);
    for ($i=0; $i<30; $i++) { $ready=@stream_socket_client('tcp://' . $address, $errno, $error, .1); if ($ready) { fclose($ready); break; } usleep(100000); }
    httpCheck(erpHttp('/api')[0]===401, 'unauthenticated API is rejected');
    httpCheck(erpHttp('/api', 'denied')[0]===403, 'user without delivery permission is rejected');
    $menu = erpHttp('/menu', 'reviewer');
    httpCheck(is_array($menu[1]) && hasConfirmationBeforeDelivery($menu[1]), 'confirmation menu appears immediately before delivery');
    $page = erpHttp('/page', 'reviewer');
    httpCheck($page[0]===200 && strpos($page[2], 'ยืนยันข้อมูลจาก ERP')!==false && strpos($page[2], 'csrf-token')!==false, 'authorized page renders with CSRF token');
    $list = erpHttp('/api?state=pending', 'reviewer');
    httpCheck($list[0]===200 && $list[1]['total']>=1 && count($list[1]['data'])<=25, 'pending list and pagination');
    $detail = erpHttp('/api?id=' . $itemId, 'reviewer');
    httpCheck($detail[0]===200 && $detail[1]['data']['item']['pr_id']==='HTTP-FIXTURE', 'item detail preserves source');
    httpCheck(erpHttp('/api', 'reviewer', 'POST', ['id'=>$itemId])[0]===403, 'POST without CSRF is rejected');
    httpCheck(erpHttp('/api', 'reviewer', 'POST', ['id'=>0], 'fixture-csrf')[0]===422, 'invalid item ID is rejected');
    httpCheck(erpHttp('/api', 'reviewer', 'POST', ['id'=>$itemId], 'fixture-csrf')[0]===200, 'authorized confirmation succeeds');
    httpCheck(erpHttp('/api', 'reviewer', 'POST', ['id'=>$itemId], 'fixture-csrf')[0]===409, 'repeat confirmation returns conflict');
    $confirmed = erpHttp('/api?id=' . $itemId, 'reviewer');
    httpCheck($confirmed[1]['data']['confirmed_name']==='HTTP fixture' && $confirmed[1]['data']['confirmed_at']!==null, 'confirmation audit is returned');
    httpCheck(erpHttp('/api', 'reviewer', 'DELETE')[0]===405, 'unsupported method is rejected');
    echo "$checks HTTP checks passed.\n";
} finally {
    if (is_resource($server)) { proc_terminate($server); proc_close($server); }
    $db->prepare('DELETE FROM sp_erp_confirmation WHERE request_id=?')->execute([$requestId]);
    $db->prepare('DELETE FROM sp_api_incoming_log WHERE request_id=?')->execute([$requestId]);
    @unlink($router); @unlink($log);
    @unlink(dirname(__DIR__, 4) . '/storage/sessions/sess_' . $sessionId);
}
