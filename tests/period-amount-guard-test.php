<?php
require __DIR__ . '/../public/supplies/sp/tor/api/periodAmountGuard.php';
class PeriodGuardDb {
    public $periods;
    public $contract = 10000; // cents
    public $lastParams;
    function __construct($periods) { $this->periods=$periods; }
    function GetDataBySQL($sql,$params) {
        if (strpos($sql,'SELECT sp_tor_contract_id FROM')===0) return 7;
        if (strpos($sql,'FROM dbo.sp_tor_contract WITH')!==false) {
            if (strpos($sql,'UPDLOCK,HOLDLOCK')===false) throw new Exception('Missing contract lock');
            return array('sp_tor_contract_id'=>7,'f_total_amt'=>number_format($this->contract/100,2,'.',''));
        }
        if (strpos($sql,'SELECT sp_tor_contract_id, f_total_amt, i_enabled')===0) {
            $p=$this->periods[$params[0]]??null;
            return $p ? array('sp_tor_contract_id'=>7,'f_total_amt'=>$p[0]/100,'i_enabled'=>$p[1]) : false;
        }
        if (strpos($sql,'AS exceeds')!==false) {
            $this->lastParams=$params;$sum=0;
            foreach($this->periods as $id=>$p) if($p[1]===1 && $id!==$params[3]) $sum+=$p[0];
            return array('exceeds'=>$sum+(int)round((float)$params[0]*100)>$this->contract?1:0,'used_amount'=>$sum/100);
        }
        throw new Exception('Unexpected query');
    }
}
function checkGuard($name,$db,$request,$allowed,$exclude=null) {
    $passed=true;
    try {guardPeriodAmount($db,$request);} catch(RuntimeException $e) {$passed=false;}
    if($passed!==$allowed || ($exclude!==null && $db->lastParams[3]!==$exclude)) throw new Exception('FAIL: '.$name);
    echo 'PASS: '.$name."\n";
}
$base=array('mode'=>'UP_SP_TOR_HDR_PERIOD_PRO','sp_tor_contract_id'=>7,'copy_contract_dtl'=>'save','f_total_amt'=>'30.00');
checkGuard('new period reaches limit',new PeriodGuardDb(array(1=>array(7000,1))),$base,true,0);
checkGuard('one cent over limit',new PeriodGuardDb(array(1=>array(7001,1))),$base,false,0);
checkGuard('edit excludes original',new PeriodGuardDb(array(1=>array(7000,1),2=>array(4000,1))),array_merge($base,array('sp_tor_hdr_period_id'=>2)),true,2);
checkGuard('copy includes original',new PeriodGuardDb(array(1=>array(7000,1),2=>array(2000,1))),array_merge($base,array('sp_tor_hdr_period_id'=>2,'copy_contract_dtl'=>'copy_period')),false,0);
checkGuard('deleted periods ignored',new PeriodGuardDb(array(1=>array(7000,1),2=>array(5000,2))),$base,true);
checkGuard('restore over limit',new PeriodGuardDb(array(1=>array(7000,1),2=>array(4000,2))),array('mode'=>'RESTORE_SP_TOR_HDR_PERIOD','id'=>2),false,2);
checkGuard('restore within limit',new PeriodGuardDb(array(1=>array(7000,1),2=>array(3000,2))),array('mode'=>'RESTORE_SP_TOR_HDR_PERIOD','id'=>2),true,2);
foreach(array('-1','abc','1.001','') as $value) checkGuard('invalid amount '.$value,new PeriodGuardDb(array()),array_merge($base,array('f_total_amt'=>$value)),false);
checkGuard('wrong period rejected',new PeriodGuardDb(array()),array_merge($base,array('sp_tor_hdr_period_id'=>999)),false);
checkGuard('NEW uses unit-price input',new PeriodGuardDb(array(1=>array(7000,1))),array_merge($base,array('mode'=>'UP_SP_TOR_HDR_PERIOD_NEW','f_net_unit_price'=>'30.01')),false);
