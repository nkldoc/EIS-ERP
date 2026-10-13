<?php
// Run with php -n: a fault-injecting driver, never a live SQL Server connection.
if (extension_loaded('sqlsrv')) { fwrite(STDERR, "Run with php -n\n"); exit(1); }
define('SQLSRV_PARAM_IN', 1);
define('SQLSRV_FETCH_ASSOC', 2);
define('SQLSRV_ERR_ERRORS', 0);
function SQLSRV_PHPTYPE_STRING($encoding) { return $encoding; }
function SQLSRV_SQLTYPE_NVARCHAR($size) { return $size; }
class FakeSqlServer {
    public $mapped = [], $beforeMapped = [], $rows = [], $before = [], $transaction = false, $failInsert = false, $loseCommitReply = false;
}
function sqlsrv_begin_transaction($conn) { $conn->before = $conn->rows; $conn->beforeMapped = $conn->mapped; $conn->transaction = true; return true; }
function sqlsrv_commit($conn) {
    $conn->transaction = false;
    if ($conn->loseCommitReply) { $conn->loseCommitReply = false; return false; }
    return true;
}
function sqlsrv_rollback($conn) {
    if ($conn->transaction) { $conn->rows = $conn->before; $conn->mapped = $conn->beforeMapped; }
    $conn->transaction = false;
    return true;
}
function sqlsrv_errors($type) { return [['code'=>50000]]; }
function sqlsrv_query($conn, $sql, $params, $options) {
    if (strpos($sql, 'SELECT id,') === 0) return (object)['row'=>$conn->rows[$params[0] . ':' . $params[1]] ?? null];
    if (strpos($sql, 'SELECT c.name') === 0) return (object)['row'=>['name'=>'detail','type'=>'nvarchar','is_nullable'=>0,'is_identity'=>0,'is_computed'=>0,'generated_always_type'=>0,'default_object_id'=>0]];
    if (strpos($sql, 'INSERT INTO [') === 0) { if ($conn->failInsert && strpos($sql, '[second]')!==false) return false; $conn->mapped[] = [$sql,$params]; return (object)['row'=>null]; }
    if ($conn->failInsert) return false;
    $values = array_map(function ($p) { return is_array($p) ? $p[0] : $p; }, $params);
    $row = ['id'=>count($conn->rows)+1,'payload_hash'=>$values[4],'confirmed_by'=>$values[10],
        'confirmed_name'=>$values[11],'confirmed_at'=>$values[12],'payload'=>$values[3],'c_doc_ref'=>$values[9]];
    $conn->rows[$values[0] . ':' . $values[1]] = $row;
    return (object)['row'=>$row];
}
function sqlsrv_fetch_array($stmt, $type) { $row=$stmt->row; $stmt->row=null; return $row; }
function sqlsrv_free_stmt($stmt) { return true; }
function sqlsrv_next_result($stmt) { return null; }
require __DIR__ . '/../public/supplies/sp/api/erpConfirmationMssql.php';
$checks = 0;
function checkMssql($ok, $label) {
    global $checks;
    if (!$ok) throw new RuntimeException($label);
    $checks++;
    echo "PASS $label\n";
}
$conn = new FakeSqlServer();
$writer = new ErpConfirmationMssql($conn, function () { return ['tables'=>[['schema'=>'dbo','name'=>'first'],['schema'=>'dbo','name'=>'second']], 'source'=>'', 'mapping'=>[[json_encode(['row','detail']),json_encode(['dbo','first','detail'])],[json_encode(['row','detail']),json_encode(['dbo','second','detail'])]]]; });
$row = ['id'=>1,'request_id'=>str_repeat('a',32),'item_index'=>0,'confirmed_at'=>null,
    'payload'=>'{"detail":"เวชภัณฑ์","c_doc_ref":false,"line_ids":[{"chk_line_id":2652}]}'];
$saved = $writer->save($row,7,'ผู้ตรวจสอบ');
checkMssql($saved['payload'] === $row['payload'] && $saved['c_doc_ref'] === null && $saved['confirmed_name'] === 'ผู้ตรวจสอบ', 'Unicode and raw nested JSON retained; false reference becomes SQL null');
$again = $writer->save($row,8,'Other');
checkMssql(count($conn->rows) === 1 && $again['id'] === $saved['id'] && $again['confirmed_by'] === 7, 'repeat uses original receipt and audit');
$changed = $row; $changed['payload'] = '{"detail":"changed"}';
try { $writer->save($changed,8,'Other'); throw new LogicException('Expected conflict'); }
catch (InvalidArgumentException $e) { checkMssql(count($conn->rows) === 1 && !$conn->transaction, 'changed payload under same key rejected and rolled back'); }
$next = $row; $next['item_index'] = 1;
$conn->failInsert = true;
try { $writer->save($next,7,'Reviewer'); throw new LogicException('Expected failure'); }
catch (ErpConfirmationMssqlException $e) { checkMssql(count($conn->rows) === 1 && !$conn->transaction, 'driver insert failure leaves no receipt'); }
$conn->failInsert = false; $conn->loseCommitReply = true;
try { $writer->save($next,7,'Reviewer'); throw new LogicException('Expected lost commit reply'); }
catch (ErpConfirmationMssqlException $e) { checkMssql(count($conn->rows) === 2, 'unknown commit result is reported as failure despite persisted receipt'); }
$again = $writer->save($next,8,'Other');
checkMssql(count($conn->rows) === 2 && $again['confirmed_by'] === 7, 'retry after lost commit reply reuses persisted receipt');
checkMssql(count($conn->mapped) === 4, 'two tables inserted per receipt; failure on second table rolls back first and retry never duplicates');
$invalid=$row; $invalid['item_index']=5; $invalid['payload']='{"detail":null}';
try { $writer->save($invalid,7,'Reviewer'); throw new LogicException('Expected validation failure'); }
catch (InvalidArgumentException $e) { checkMssql(count($conn->mapped)===4 && strpos($e->getMessage(),'dbo.first.detail')!==false, 'required field failure gives table and column, no inserts'); }
echo "$checks driver simulation checks passed.\n";
