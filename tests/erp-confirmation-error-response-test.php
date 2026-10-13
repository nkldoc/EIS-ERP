<?php
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
if (($argv[1] ?? '') === 'child') {
    require __DIR__ . '/../public/supplies/sp/_conf/erpConfirmationResponse.php';
    define('ERP_CONFIRMATION_API_BUFFER', ob_get_level());
    ob_start();
    echo 'incidental output that must not leak';
    $error = new PDOException('private diagnostic details');
    $error->errorInfo = ['42S22',1054,'private SQL'];
    erpConfirmationFailure($error, 'query');
}
$process = proc_open([PHP_BINARY, '-d', 'error_log=NUL', __FILE__, 'child'],
    [0=>['pipe','r'],1=>['pipe','w'],2=>['pipe','w']], $pipes);
if (!is_resource($process)) throw new RuntimeException('Cannot start response test');
fclose($pipes[0]);
$body = stream_get_contents($pipes[1]); fclose($pipes[1]);
stream_get_contents($pipes[2]); fclose($pipes[2]);
$status = proc_close($process);
$data = json_decode($body, true);
if ($status !== 0 || !is_array($data) || $data['success'] !== false || $data['code'] !== 'ERP_SYNC_SCHEMA_MISSING'
    || strpos($body,'private') !== false || strpos($body,'incidental') !== false) {
    throw new RuntimeException('Schema errors must return clean JSON without private diagnostics');
}
echo "PASS schema error returns valid JSON and excludes buffered output/private SQL\n";
