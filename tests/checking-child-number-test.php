<?php
require __DIR__.'/../public/supplies/sp/tor/api/checkingChildNumber.php';
function expect($condition,$message) { if (!$condition) throw new RuntimeException($message); }
function rejects($callback,$class) { try { $callback(); } catch (Throwable $error) { expect($error instanceof $class,'Wrong exception'); return; } throw new RuntimeException('Expected rejection'); }
session_id('child-number-test');
$mother='03AP69090162/03';
expect(checkingChildNextCode($mother,array())==='03AP69090162.1/03','First child');
expect(checkingChildNextCode($mother,array('03AP69090162.1/03','03AP69090162.2/03'))==='03AP69090162.3/03','Third child');
expect(checkingChildNextCode($mother,array('03AP69090162.9/03','03AP69090162.2/03','03AP69090162.90/04','OTHER.99/03'))==='03AP69090162.10/03','Numeric max, retain suffix, ignore other series');
expect(checkingChildNextCode('AP20240800130/03',array())==='AP20240800130.1/03','AP without department prefix');
rejects(function () { checkingChildNextCode('03AP69090162.1/03',array()); },InvalidArgumentException::class);
class NumberRows { public $rows; function __construct($rows) { $this->rows=$rows; } }
class NumberDatabase {
 public $issued=array(); public $child=array('parent_id'=>10,'c_code'=>null,'c_arrive_code'=>'IR12');
 public $mother=array('i_parent'=>1,'c_code'=>'03AP69090162/03'); public $queries=array();
 function GetDataBySQL($sql,$params) { $this->queries[]=$sql; return $params[0]===10?$this->mother:$this->child; }
 function QueryParam($sql,$params) {
  $this->queries[]=$sql;
  return new NumberRows(strpos($sql,'sp_getapplock')!==false?array(array('lock_result'=>0)):array_map(function($code){return array('c_code'=>$code);},$this->issued));
 }
 function Fetch($stmt) { return array_shift($stmt->rows); }
}
$db=new NumberDatabase();
$plan=checkingChildNumberPlan($db,12);
expect($plan['is_child'] && $plan['proposed_code']==='03AP69090162.1/03','Preview');
$token=checkingChildNumberToken($plan);
checkingRequireChildConfirmation($plan,$token);
rejects(function () use ($plan) { checkingRequireChildConfirmation($plan,''); },DomainException::class);
$db->issued[]='03AP69090162.1/03';
$changed=checkingChildNumberPlan($db,12,true);
rejects(function () use ($changed,$token) { checkingRequireChildConfirmation($changed,$token); },DomainException::class);
expect($changed['proposed_code']==='03AP69090162.2/03','Competing issuance advances preview');
expect(count(array_filter($db->queries,function($sql){return strpos($sql,'sp_getapplock')!==false;}))===1,'Issuance uses transaction lock');
$db->child['c_code']='03AP69090162.2/03';
expect(checkingChildNumberPlan($db,12)['proposed_code']==='03AP69090162.2/03','Existing number retained');
$db->child['parent_id']=null;
expect(checkingChildNumberPlan($db,12)===array('is_child'=>false),'Ordinary numbering unchanged');
$db->child['parent_id']=10; $db->mother['c_code']='';
rejects(function () use ($db) { checkingChildNumberPlan($db,12); },InvalidArgumentException::class);
echo "PASS: child numbering, numeric sequence, preview tokens, stale confirmation, transaction lock, existing numbers, ordinary APs, missing mother AP\n";
