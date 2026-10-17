<?php
// Run without SQL Server: php -n tests/backdate-contract-test.php
class EndpointFinished extends Exception {}
class Rows {
    public $rows;
    function __construct($rows = array()) { $this->rows = $rows; }
}
class BackdateDB {
    public $conn;
    public $sameDay = true;
    public $hasPrevious = true;
    public $existingCode = '';
    public $failUpdate = false;
    public $suffix = 0;
    public $committed = false;
    public $rolledBack = false;
    public $insert;
    public $update;
    function __construct() { $this->conn = $this; }
    function BeginTran() {}
    function CommitTran() { $this->committed = true; return true; }
    function RollBackTran() { $this->rolledBack = true; }
    function Fetch($stmt) { return array_shift($stmt->rows); }
    function QueryParam($sql, $params) {
        if (strpos($sql, 'sp_contract_year') !== false) return new Rows(array(array('i_year_be' => 2570)));
        if (strpos($sql, 'FROM dbo.sp_emp') !== false) return new Rows(array(array('emp_code' => '03')));
        if (strpos($sql, 'FROM dbo.sp_doc d') !== false) return new Rows(array(array('c_code' => 'พวช.ซ.', 'i_digit' => 4, 'next_value' => 9123)));
        if (strpos($sql, 'TOP 1') !== false) {
            $found = strpos($sql, 'd_create >=') !== false ? $this->sameDay : $this->hasPrevious;
            return new Rows($found ? array(array('i_value' => 39122, 'c_gen' => 'พวช.ซ.039122/2569')) : array());
        }
        return new Rows($this->suffix ? array(array('c_gen' => 'พวช.ซ.039122.' . $this->suffix . '/2569')) : array());
    }
}
function sqlsrv_query($db, $sql, $params = array()) {
    if (strpos($sql, 'sp_getapplock') !== false) return new Rows(array(array('lock_result' => 0)));
    if (strpos($sql, 'SELECT c.c_code') !== false) return new Rows(array(array(
        'c_code' => $db->existingCode, 'i_purchase' => 1, 'i_type_contract' => 1, 'i_yyyy' => 2026)));
    if (strpos($sql, 'SELECT c_gen') !== false) return new Rows();
    if (strpos($sql, 'INSERT') !== false) { $db->insert = $params; return new Rows(); }
    if (strpos($sql, 'UPDATE') !== false) { $db->update = $params; return $db->failUpdate ? false : new Rows(); }
    throw new Exception('Unexpected query');
}
function sqlsrv_rows_affected($stmt) { return 1; }
function checkBackdate($condition, $message) {
    if (!$condition) throw new Exception($message);
}
function runBackdate($db, $mode = 'SAVE_BACKDATE', $day = '2026-10-12') {
    $_SESSION = array('user_id' => 10, 'dc_cost_id' => 20);
    // Deliberately send incorrect doc/year: saving must use the persisted contract.
    $_REQUEST = array('mode' => $mode, 'dc_doc_id' => 2, 'c_yyyy' => 2570,
        'id' => 77, 'sp_tor_contract_id' => 88, 'contract_date' => $day);
    $source = file_get_contents(__DIR__ . '/../public/supplies/sp/tor/api/mnContractCode.php');
    $start = strpos($source, '$mode =');
    $end = strpos($source, '$table =');
    $source = substr($source, $start, $end - $start);
    $source = str_replace('exit;', 'throw new EndpointFinished();', $source);
    ob_start();
    try { eval($source); } catch (EndpointFinished $e) {}
    return json_decode(ob_get_clean(), true);
}
$db = new BackdateDB();
$result = runBackdate($db);
checkBackdate($result['success'] && $result['code'] === 'พวช.ซ.039122.1/2569', 'First suffix');
checkBackdate($db->committed && !$db->rolledBack, 'Successful transaction');
checkBackdate(array_slice($db->insert, 0, 8) === array(4, 77, 2569, 39122, 10, 20, '2026-10-12', $result['code']), 'Document fields and parent running number');
checkBackdate($db->insert[8] === "วันที่ออกเลข: 12-10-2569\r\nเลขสัญญา: พวช.ซ.039122.1/2569\r\nประเภท: ย้อนหลัง (สัญญาซื้อ)", 'Stored numbering detail');
checkBackdate($db->update[0] === $result['code'] && $db->update[4] === 88, 'Contract linked to generated number');
$db = new BackdateDB(); $db->sameDay = false; $db->suffix = 2;
$result = runBackdate($db);
checkBackdate($result['success'] && $result['code'] === 'พวช.ซ.039122.3/2569', 'Fallback and next suffix');
$db = new BackdateDB(); $db->failUpdate = true;
$result = runBackdate($db);
checkBackdate(!$result['success'] && $db->rolledBack && !$db->committed, 'Rollback on contract update failure');
$db = new BackdateDB(); $db->existingCode = 'existing';
$result = runBackdate($db);
checkBackdate(!$result['success'] && $db->rolledBack && !$db->insert, 'Reject already numbered contract');
$db = new BackdateDB(); $db->sameDay = false; $db->hasPrevious = false;
$result = runBackdate($db);
checkBackdate(!$result['success'] && $db->rolledBack, 'Reject missing parent number');
$db = new BackdateDB();
$result = runBackdate($db, 'PREVIEW_BACKDATE');
checkBackdate($result['success'] && !$db->insert && !$db->committed, 'Preview does not write');
$db = new BackdateDB();
$result = runBackdate($db, 'SAVE_BACKDATE', '2026-02-30');
checkBackdate(!$result['success'] && $db->rolledBack && !$db->insert, 'Invalid date does not write');
$today = (new DateTime('now', new DateTimeZone('Asia/Bangkok')))->format('Y-m-d');
$db = new BackdateDB();
$result = runBackdate($db, 'PREVIEW_BACKDATE', $today);
checkBackdate($result['success'] && $result['normal'] && !$db->insert
    && $result['code'] === 'พวช.ซ.039123/2570' && $result['issue_date'] === $today
    && $result['numbering_type'] === 'ปกติ', 'Today previews next normal number with active year and department');
$db = new BackdateDB();
runBackdate($db, 'SAVE_BACKDATE', $today);
checkBackdate($_REQUEST['mode'] === 'GENCODECST' && !$db->insert, 'Today routes to existing numbering even after unlock');
echo "Backdate contract: 9 scenarios passed\n";
