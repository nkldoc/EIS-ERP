<?php
require __DIR__ . '/../public/supplies/sp/tor/api/contractDeliveryGuard.php';
class DeliveryGuardDb {
    public $existing = 0;
    public $owner = 4;
    public $inserted = 0;
    public $fail = false;
    public $params;
    function GetDataBySQL($sql, $params) {
        if (strpos($sql, 'UPDLOCK,HOLDLOCK') === false) throw new Exception('Missing concurrency lock');
        if (strpos($sql, 'FROM dbo.sp_tor_contract') !== false) {
            return array('sp_emp_id'=>$this->owner,'i_type_fine'=>1,'c_name'=>'Project',
                'f_total_amt'=>'2700000.00','d_doc_date'=>null,'d_start_date'=>null,'d_due_date'=>null);
        }
        return $this->existing;
    }
    function QueryParam($sql, $params) {
        $this->inserted++; $this->params=$params;
        return !$this->fail;
    }
    function Fetch($stmt) { return array('id'=>77); }
}
function verifyDelivery($condition, $label) {
    if (!$condition) throw new Exception($label);
    echo "PASS: $label\n";
}
$session=array('user_id'=>1,'dc_cost_id'=>2);
$db=new DeliveryGuardDb();
verifyDelivery(ensureContractDeliveryHeader($db,12,$session)===77 && $db->params[1]===4,
    'admin action preserves contract owner');
$db->existing=77;
verifyDelivery(ensureContractDeliveryHeader($db,12,$session)===77 && $db->inserted===1,
    'retry reuses header without duplicate insert');
foreach (array('missing owner','insert failure','invalid contract') as $case) {
    $db=new DeliveryGuardDb();
    if ($case==='missing owner') $db->owner=0;
    if ($case==='insert failure') $db->fail=true;
    $rejected=false;
    try { ensureContractDeliveryHeader($db,$case==='invalid contract'?'12;DROP TABLE x':12,$session); }
    catch (RuntimeException $error) { $rejected=true; }
    verifyDelivery($rejected,$case.' blocks status advance');
}
