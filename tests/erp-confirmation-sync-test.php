<?php
// Offline transaction tests. No application config or live database is loaded.
require __DIR__ . '/../public/supplies/sp/api/erpConfirmationStore.php';

class ConfirmationTestDb extends PDO {
    public $failCommit = false;
    public function __construct() {
        parent::__construct('sqlite::memory:');
        $this->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $this->sqliteCreateFunction('UTC_TIMESTAMP', function () { return gmdate('Y-m-d H:i:s'); });
        $this->exec('CREATE TABLE sp_erp_confirmation (
            id INTEGER PRIMARY KEY, request_id TEXT, item_index INTEGER, payload TEXT,
            confirmed_at TEXT,confirmed_by INTEGER,confirmed_name TEXT,mssql_id INTEGER,mssql_synced_at TEXT)');
    }
    public function query(string $query, ?int $fetchMode = null, mixed ...$fetchModeArgs): PDOStatement|false {
        if ($query === 'SHOW COLUMNS FROM sp_erp_confirmation') {
            $query = 'SELECT name AS Field FROM pragma_table_info("sp_erp_confirmation")';
        }
        return parent::query($query);
    }
    public function prepare(string $query, array $options = []): PDOStatement|false {
        return parent::prepare(str_replace(' FOR UPDATE', '', $query), $options);
    }
    public function commit(): bool {
        if ($this->failCommit) { $this->failCommit = false; throw new RuntimeException('Injected MySQL failure'); }
        return parent::commit();
    }
}

$checks = 0;
function checkSync($ok, $label) {
    global $checks;
    if (!$ok) throw new RuntimeException($label);
    $checks++;
    echo "PASS $label\n";
}
$db = new ConfirmationTestDb();
$payload = json_encode(['pr_id'=>1768,'c_doc_ref'=>false,'line_ids'=>[['chk_line_id'=>2652]],'detail'=>'เวชภัณฑ์'], JSON_UNESCAPED_UNICODE);
$insert = $db->prepare('INSERT INTO sp_erp_confirmation(id,request_id,item_index,payload) VALUES(?,?,0,?)');
foreach ([1,2,3,4,5] as $id) $insert->execute([$id, str_repeat((string)$id,32), $id === 3 ? 'null' : $payload]);
$receipts = [];
$calls = 0;
$save = function ($row, $userId, $userName) use (&$receipts, &$calls, $payload) {
    $calls++;
    checkSync($row['payload'] === $payload, 'source payload preserved including Thai, false and nested lines');
    if (!isset($receipts[$row['id']])) {
        $receipts[$row['id']] = ['id'=>100+$row['id'], 'confirmed_by'=>$row['reviewer_id'] ?? $userId,
            'confirmed_name'=>$row['confirmed_name'] ?? $userName, 'confirmed_at'=>$row['confirmed_at'] ?: '2026-09-24 03:00:00'];
    }
    return $receipts[$row['id']];
};
$read = function ($id) use ($db) { return $db->query('SELECT * FROM sp_erp_confirmation WHERE id=' . (int)$id)->fetch(PDO::FETCH_ASSOC); };
$result = ErpConfirmationStore::confirm($db,1,7,'Reviewer',$save);
checkSync($result['mssql_id'] === '101' && $read(1)['mssql_synced_at'] && $read(1)['confirmed_by'] === 7, 'success records target receipt and reviewer');
$before = $calls;
$result = ErpConfirmationStore::confirm($db,1,8,'Other',$save);
checkSync($result['already_synced'] && $calls === $before && $read(1)['confirmed_by'] === 7, 'duplicate click preserves audit without another write');
try {
    ErpConfirmationStore::confirm($db,2,7,'Reviewer',function () { throw new RuntimeException('MSSQL unavailable'); });
    throw new LogicException('Expected MSSQL failure');
} catch (RuntimeException $e) {
    checkSync($e->getMessage() === 'MSSQL unavailable' && !$db->inTransaction() && $read(2)['confirmed_at'] === null, 'MSSQL failure leaves item pending and releases transaction');
}
$db->failCommit = true;
try { ErpConfirmationStore::confirm($db,2,7,'Reviewer',$save); throw new LogicException('Expected MySQL failure'); }
catch (RuntimeException $e) { checkSync(isset($receipts[2]) && $read(2)['confirmed_at'] === null, 'MSSQL receipt survives simulated MySQL commit failure'); }
ErpConfirmationStore::confirm($db,2,8,'Second reviewer',$save);
checkSync(count($receipts) === 2 && $read(2)['mssql_id'] === 102 && $read(2)['confirmed_by'] === 7, 'retry reconciles original receipt and original reviewer');
$before = $calls;
try { ErpConfirmationStore::confirm($db,3,7,'Reviewer',$save); throw new LogicException('Expected invalid payload'); }
catch (InvalidArgumentException $e) { checkSync($calls === $before && !$db->inTransaction(), 'invalid payload never reaches MSSQL'); }
$db->exec("UPDATE sp_erp_confirmation SET confirmed_at='2026-09-20 00:00:00',confirmed_by=4,confirmed_name='Original' WHERE id=4");
ErpConfirmationStore::confirm($db,4,8,'New',$save);
checkSync($read(4)['confirmed_by'] === 4 && $read(4)['confirmed_name'] === 'Original' && $read(4)['mssql_id'] === 104, 'legacy confirmed item can sync without changing review audit');
checkSync(ErpConfirmationStore::confirm($db,999,7,'Reviewer',$save) === false && !$db->inTransaction(), 'missing item writes nothing');
echo "$checks checks passed (offline; database locking and SQL Server need integration verification).\n";
