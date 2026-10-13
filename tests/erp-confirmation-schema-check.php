<?php
// CLI-only metadata check; --apply installs only the missing sync schema.
// Does not read business payloads or print credentials.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
ob_start();
$_SERVER['HTTP_HOST'] = 'dev-eis.nmu.ac.th';
$_SERVER['REQUEST_URI'] = '/supplies/sp/erpConfirmation';
$_SERVER['HTTPS'] = 'on';
require __DIR__ . '/../public/supplies/sp/_conf/mysql_connect.php';
try {
    $db = spMysqlConnect();
    $columns = $db->query('SHOW COLUMNS FROM sp_erp_confirmation')->fetchAll(PDO::FETCH_COLUMN);
    if (in_array('--apply', $argv, true)) {
        $changes = [];
        if (!in_array('mssql_id', $columns, true)) $changes[] = 'ADD COLUMN mssql_id BIGINT NULL';
        if (!in_array('mssql_synced_at', $columns, true)) $changes[] = 'ADD COLUMN mssql_synced_at DATETIME NULL';
        $indexes = $db->query('SHOW INDEX FROM sp_erp_confirmation')->fetchAll(PDO::FETCH_ASSOC);
        if (!in_array('ix_erp_mssql_sync', array_column($indexes, 'Key_name'), true)) {
            $changes[] = 'ADD INDEX ix_erp_mssql_sync (mssql_synced_at,id)';
        }
        if ($changes) $db->exec('ALTER TABLE sp_erp_confirmation ' . implode(',', $changes));
        $columns = $db->query('SHOW COLUMNS FROM sp_erp_confirmation')->fetchAll(PDO::FETCH_COLUMN);
    }
    echo 'MySQL sync columns: ' . json_encode(array_values(array_intersect($columns, ['mssql_id','mssql_synced_at']))) . PHP_EOL;
    $db->query('SELECT q.id,q.request_id,q.item_index,q.confirmed_at,q.confirmed_name,q.mssql_id,q.mssql_synced_at,q.payload,l.received_at,l.username FROM sp_erp_confirmation q JOIN sp_api_incoming_log l ON l.request_id=q.request_id WHERE q.mssql_synced_at IS NULL ORDER BY l.received_at DESC,q.id DESC LIMIT 0');
    echo "MySQL list query: OK\n";
} catch (Throwable $error) {
    echo 'MySQL check failed: ' . get_class($error) . ' driver=' . ($error instanceof PDOException ? ($error->errorInfo[1] ?? 0) : 0) . PHP_EOL;
    exit(1);
}
ob_start();
require __DIR__ . '/../public/supplies/conf/config.php';
ob_end_clean();
if (!function_exists('sqlsrv_connect')) { echo "MSSQL driver missing\n"; exit(1); }
$conn = @sqlsrv_connect(DB_SERVER, ['Database'=>DB_NAME,'UID'=>DB_USER,'PWD'=>DB_PASS,'CharacterSet'=>DB_CHARSET,'LoginTimeout'=>5]);
if (!$conn) { echo "MSSQL connect failed\n"; exit(1); }
if (in_array('--apply', $argv, true)) {
    $migration = @sqlsrv_query($conn, file_get_contents(__DIR__ . '/../public/supplies/sp/sql/erp-confirmation-mssql.sql'));
    if (!$migration) { echo "MSSQL migration failed\n"; exit(1); }
    sqlsrv_free_stmt($migration);
}
$stmt = @sqlsrv_query($conn, "SELECT OBJECT_ID(N'dbo.sp_erp_confirmation_inbox',N'U') AS table_id");
if (!$stmt) { echo "MSSQL metadata query failed\n"; exit(1); }
$row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
echo 'MSSQL inbox: ' . (empty($row['table_id']) ? 'missing' : 'exists') . PHP_EOL;
sqlsrv_free_stmt($stmt);
sqlsrv_close($conn);
