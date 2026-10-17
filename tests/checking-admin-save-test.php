<?php
// Run with php -n tests/checking-admin-save-test.php success (or conflict, auditfail, scope, field, csrf).
// Isolated save-path test: fake SQL driver, no real database connection.
if (extension_loaded('sqlsrv')) { fwrite(STDERR, 'Run this isolated test with php -n'); exit(2); }
define('SQLSRV_FETCH_ASSOC',2);
if (!function_exists('mb_strlen')) { function mb_strlen($s,$encoding=null){return strlen($s);} }
class DatabaseServer {public $conn='fake';}
class FakeRows {public $rows;public function __construct($rows){$this->rows=$rows;}}
require __DIR__ . '/../public/supplies/sp/tor/api/checkingFinance.php';
$GLOBALS['state']=array('header'=>array('sp_check_period_hdr_id'=>6881,'i_enabled'=>1,'c_egp_no'=>'OLD',
 'f_total'=>'107.00','i_vat_amt'=>1,'f_rate_vat'=>7,'i_tax_personal'=>1,'f_tax_personal_rate'=>1,
 'i_rate'=>1,'f_tax_warranty_rate'=>5,'f_fine_amt'=>0,'f_other'=>0,'i_edit_vat'=>0),
 'items'=>array(array('sp_check_period_dtl_id'=>1,'sp_check_period_hdr_id'=>6881,'i_qty'=>1,'f_net_unit_price'=>'107.00','f_net_total_price'=>'107.00')),
 'debts'=>array(array('sp_tranf_item_id'=>2,'sp_check_period_dtl_id'=>1,'sp_tranf_hdr_id'=>3,'f_net_total_price'=>'107.00','f_wip_total_price'=>0,'f_under_total_price'=>0,'f_vat_amt'=>'7.00')),
 'ledger'=>array(array('sp_tranf_hdr_id'=>3,'sp_check_period_hdr_id'=>6881,'f_net_total_price'=>'107.00')),'logs'=>array());
$GLOBALS['snapshot']=null;$GLOBALS['committed']=false;$GLOBALS['rolledBack']=false;
if (!extension_loaded('sqlsrv')) {
function sqlsrv_begin_transaction($c){$GLOBALS['snapshot']=$GLOBALS['state'];return true;}
function sqlsrv_commit($c){$GLOBALS['committed']=true;return true;}
function sqlsrv_rollback($c){$GLOBALS['state']=$GLOBALS['snapshot'];$GLOBALS['rolledBack']=true;return true;}
function sqlsrv_fetch_array($stmt,$mode){return array_shift($stmt->rows);}
function sqlsrv_query($conn,$sql,$params){
 if(strpos($sql,'SELECT')===0){
  if(strpos($sql,'FROM dbo.sp_check_period_hdr')!==false && intval($params[0])===6881)return new FakeRows(array($GLOBALS['state']['header']));
  if(strpos($sql,'FROM dbo.sp_check_period_dtl')!==false)return new FakeRows($GLOBALS['state']['items']);
  if(strpos($sql,'FROM dbo.sp_tranf_item')!==false)return new FakeRows($GLOBALS['state']['debts']);
  if(strpos($sql,'FROM dbo.sp_tranf_hdr')!==false)return new FakeRows($GLOBALS['state']['ledger']);
  return new FakeRows(array());
 }
 if(strpos($sql,'UPDATE')===0){
  preg_match('/UPDATE dbo\.\[([^\]]+)\] SET \[([^\]]+)\]/',$sql,$match);$table=$match[1];$field=$match[2];
  if($table==='sp_check_period_hdr')$GLOBALS['state']['header'][$field]=$params[0];
  else{$groups=array('sp_check_period_dtl'=>array('items','sp_check_period_dtl_id'),'sp_tranf_item'=>array('debts','sp_tranf_item_id'),'sp_tranf_hdr'=>array('ledger','sp_tranf_hdr_id'));[$group,$key]=$groups[$table];foreach($GLOBALS['state'][$group] as &$row)if(intval($row[$key])===intval($params[3]))$row[$field]=$params[0];unset($row);}
  return new FakeRows(array());
 }
 if(strpos($sql,'INSERT INTO NMU_ERPLOG')===0){if(in_array($GLOBALS['case'],array('auditfail','financeauditfail')))return false;$GLOBALS['state']['logs'][]=$params;return new FakeRows(array());}
 return false;
}
}
$GLOBALS['case']=$argv[1]??'success';
session_id('isolatedAdminSaveTest');
$_SESSION=array('user_id'=>1,'dc_center_user'=>1,'dc_cost_id'=>38);
$_REQUEST=array('sp_check_period_hdr_id'=>6881);$_SERVER['REQUEST_METHOD']='POST';
$change=array('table'=>'sp_check_period_hdr','row_id'=>6881,'field'=>'c_egp_no','old_value'=>$GLOBALS['case']==='conflict'?'STALE':'OLD','new_value'=>'NEW');
if($GLOBALS['case']==='scope')$change['row_id']=9999;
if($GLOBALS['case']==='field')$change['field']='sp_tor_contract_id';
$_POST=array('csrf_token'=>hash_hmac('sha256','checking-admin|1|6881',session_id()),'reason'=>'correct selected inspection','changes'=>json_encode(array($change)));
if(in_array($GLOBALS['case'],array('finance','preview','financeauditfail','snapshot'))) {
 $state=$GLOBALS['state'];$original=array('sp_check_period_hdr'=>array($state['header']),'sp_check_period_dtl'=>$state['items'],'sp_tranf_item'=>$state['debts'],'sp_tranf_hdr'=>$state['ledger']);
 $_POST['changes']=json_encode(array(array('table'=>'sp_check_period_hdr','row_id'=>6881,'field'=>'f_total','old_value'=>'107.00','new_value'=>'214.00')));
 $_POST['finance_token']=$GLOBALS['case']==='snapshot'?'invalid':hash_hmac('sha256',json_encode($original),session_id());
 $_POST['finance_source']=json_encode(array('kind'=>'header'));$_POST['fine_calculation']=json_encode(array('mode'=>'percent','rate'=>2));
 if($GLOBALS['case']==='preview'){$_POST['mode']='calculate';$_POST['reason']='';}
}
if($GLOBALS['case']==='csrf')$_POST['csrf_token']='invalid';
ob_start();
register_shutdown_function(function(){
 $out=ob_get_clean();$json=json_decode($out,true);$case=$GLOBALS['case'];$s=$GLOBALS['state'];
 if($case==='finance')$pass=$json['success']&&$GLOBALS['committed']&&$s['header']['f_total']==='214.00'&&$s['header']['f_vat_amt']==='14.00'&&$s['header']['f_tax_personal']==='2.00'&&$s['header']['f_warranty']==='10.70'&&$s['header']['f_fine_amt']==='4.28'&&$s['header']['f_pay']==='197.02'&&$s['items'][0]['f_net_total_price']==='214.00'&&$s['debts'][0]['f_sum_Transf']==='214.00'&&$s['ledger'][0]['f_net_total_price']==='214.00'&&count($s['logs'])>8;
 elseif($case==='preview')$pass=$json['success']&&!$GLOBALS['committed']&&$s['header']['f_total']==='107.00'&&$json['data']['sp_check_period_hdr'][0]['f_pay']==='197.02'&&count($s['logs'])===0;
 elseif($case==='success')$pass=$json['success']&&$GLOBALS['committed']&&$s['header']['c_egp_no']==='NEW'&&count($s['logs'])===1&&$s['logs'][0][4]==='OLD'&&$s['logs'][0][5]==='NEW';
 else $pass=$json&&!$json['success']&&!$GLOBALS['committed']&&$s['header']['c_egp_no']==='OLD'&&count($s['logs'])===0;
 if($case==='conflict')$pass=$pass&&http_response_code()===409;
 if($case==='auditfail')$pass=$pass&&$GLOBALS['rolledBack'];
 if($case==='financeauditfail')$pass=$pass&&$GLOBALS['rolledBack']&&$s['header']['f_total']==='107.00'&&$s['debts'][0]['f_net_total_price']==='107.00';
 if($case==='snapshot')$pass=$pass&&http_response_code()===409;
 echo ($pass?'PASS: ':'FAIL: ').'isolated admin save '.$case."\n";if(!$pass){echo $out;exit(1);}
});
$source=file_get_contents(dirname(__DIR__) . '/public/supplies/sp/tor/api/checkingAdmin.php');
$source=str_replace(array("require_once '../../../conf/config.php';","require_once '../../../lib/database/DatabaseServer.php';","require_once __DIR__ . '/checkingFinance.php';"),'',$source);
eval('?>'.$source);
