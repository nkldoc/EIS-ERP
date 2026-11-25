<?php
// Run with php -n. Executes the real issuance controller with an isolated database double.
require __DIR__.'/../public/supplies/sp/tor/api/checkingChildNumber.php';
define('DELETE_FALSE',0);
class IssueRows { public $rows; function __construct($rows=array()) {$this->rows=$rows;} }
class i_date {}
class apiUtil { function mnUser($request) {return $request;} }
class DatabaseServer {
 public static $saved=null,$committed=false,$rolledBack=false,$normalGenerator=false,$audit=false;
 function BeginTran() {}
 function CommitTran() {self::$committed=true; return true;}
 function RollBackTran() {self::$rolledBack=true;}
 function Fetch($stmt) {return array_shift($stmt->rows);}
 function GetDataBySQL($sql,$params) {
  if (strpos($sql,'parent_id,c_code')!==false) return array('parent_id'=>10,'c_code'=>null,'c_arrive_code'=>'IR12');
  if (strpos($sql,'c_code,i_parent')!==false) return array('c_code'=>'03AP69090162/03','i_parent'=>1);
  if (strpos($sql,'i_is_last')!==false) return array('i_is_last'=>0);
  return array('sp_tor_hdr_period_id'=>2,'sp_tor_contract_id'=>3);
 }
 function QueryParam($sql,$params) {
  if (strpos($sql,'sp_getapplock')!==false) return new IssueRows(array(array('lock_result'=>0)));
  if (strpos($sql,'SELECT c_code FROM')===0) return new IssueRows(array(array('c_code'=>'03AP69090162.1/03')));
  if (strpos($sql,'SP_TOR_CODE_DEBT_GEN')!==false) self::$normalGenerator=true;
  if (strpos($sql,'UPDATE dbo.sp_check_period_hdr SET i_menu=2')===0) self::$saved=$params[0];
  if (strpos($sql,'INSERT INTO NMU_ERPLOG')===0) self::$audit=true;
  return new IssueRows();
 }
}
session_id('issue-child-test');
$_SESSION=array('user_id'=>1,'dc_cost_id'=>3,'sp_emp_id'=>5);
$_SERVER['REQUEST_METHOD']='POST';
$_REQUEST=array('mode'=>'GENCODECHECKING','sp_check_period_hdr_id'=>12,'dc_cost_id'=>3,'dc_cost_origin_id'=>3,
 'd_checking_date'=>'2026-11-25','i_product_type'=>0,'i_is_warranty'=>0,'sp_tor_contract_id'=>3);
$plan=checkingChildNumberPlan(new DatabaseServer(),12);
$_REQUEST['child_number_token']=checkingChildNumberToken($plan);
register_shutdown_function(function () {
 if (DatabaseServer::$saved!=='03AP69090162.2/03' || !DatabaseServer::$committed || DatabaseServer::$rolledBack || DatabaseServer::$normalGenerator || !DatabaseServer::$audit) {
  fwrite(STDERR,'FAIL: child issue must save confirmed suffix with audit and commit, bypassing normal generator'); exit(1);
 }
 echo "\nPASS: real issuance controller saved confirmed child AP, audited, and committed\n";
});
$source=file_get_contents(__DIR__.'/../public/supplies/sp/tor/api/mnCheckCode.php');
$source=preg_replace('/^\s*(?:include\(|require_once __DIR__).*;\s*$/m','',$source);
eval(substr($source,5));
