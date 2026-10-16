<?php
require_once __DIR__ . '/../../conf/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
if (empty($_SESSION['user_id'])) respond(401, ['error' => 'กรุณาเข้าสู่ระบบ ERP ก่อนใช้งาน']);
if (!function_exists('sqlsrv_connect')) respond(503, ['error' => 'เซิร์ฟเวอร์ยังไม่ได้ติดตั้ง SQLSRV']);
// Only schema metadata is exposed. This endpoint never executes user SQL.
$conn = @sqlsrv_connect(DB_SERVER, ['Database' => DB_NAME, 'UID' => DB_USER, 'PWD' => DB_PASS, 'CharacterSet' => DB_CHARSET, 'LoginTimeout' => 10]);
if (!$conn) respond(503, ['error' => 'เชื่อมต่อ NMU_ERP ไม่สำเร็จ กรุณาตรวจสอบ configuration']);
$table = isset($_GET['table']) ? $_GET['table'] : '';
$schema = isset($_GET['schema']) ? $_GET['schema'] : 'dbo';
if ($table === '') {
    $sql = "SELECT s.name AS [schema], t.name AS [name] FROM sys.tables t JOIN sys.schemas s ON s.schema_id=t.schema_id WHERE t.is_ms_shipped=0 ORDER BY s.name,t.name";
    $params = [];
} else {
    $sql = "SELECT c.name, ty.name AS type, c.max_length, c.precision, c.scale, c.is_nullable, c.is_identity, c.is_computed, c.generated_always_type, c.default_object_id FROM sys.columns c JOIN sys.tables t ON t.object_id=c.object_id JOIN sys.schemas s ON s.schema_id=t.schema_id JOIN sys.types ty ON ty.user_type_id=c.user_type_id WHERE s.name=? AND t.name=? ORDER BY c.column_id";
    $params = [$schema, $table];
}
$stmt = @sqlsrv_query($conn, $sql, $params);
if (!$stmt) respond(500, ['error' => 'อ่านโครงสร้างฐานข้อมูลไม่สำเร็จ']);
$rows = [];
while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) $rows[] = $row;
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
respond(200, ['database' => DB_NAME, 'items' => $rows]);
