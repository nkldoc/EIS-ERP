<?php
// php -n tests/checking-parent-save-test.php [success|self|other|mother|conflict|auditfail|clear|csrf|nonpost]
if (extension_loaded('sqlsrv')) exit('Run with php -n');
if (!function_exists('mb_strlen')) { function mb_strlen($s,$encoding=null) { return strlen($s); } }
$case=$argv[1] ?? 'success';
$id=10; $token='csrf'; $db=(object)array('conn'=>'fake');
$_SESSION=array('user_id'=>1,'dc_cost_id'=>38);
$state=array(
 10=>array('sp_check_period_hdr_id'=>10,'c_code'=>'AP10','i_parent'=>1,'parent_id'=>null),
 11=>array('sp_check_period_hdr_id'=>11,'c_code'=>'AP11','i_parent'=>0,'parent_id'=>10),
 12=>array('sp_check_period_hdr_id'=>12,'c_code'=>'AP12','i_parent'=>0,'parent_id'=>null));
if ($case==='other') $state[12]['parent_id']=99;
if ($case==='mother') $state[12]['i_parent']=1;
if ($case==='ir') { $state[12]['c_code']=null; $state[12]['c_arrive_code']='IR12'; }
$initial=$state; $logs=array(); $committed=false; $rolledBack=false;
function sqlsrv_begin_transaction($conn) { return true; }
function sqlsrv_commit($conn) { $GLOBALS['committed']=true; return true; }
function sqlsrv_rollback($conn) { $GLOBALS['state']=$GLOBALS['initial']; $GLOBALS['logs']=array(); $GLOBALS['rolledBack']=true; return true; }
$rows=function ($sql,$params) use (&$state) {
 if (strpos($sql,'SELECT TOP 1 remarks')===0) return array(array('remarks'=>'saved reason'));
 if (strpos($sql,' OR h.parent_id=')!==false) return array_values(array_filter($state,function ($r) { return $r['sp_check_period_hdr_id']===10 || $r['parent_id']===10; }));
 if (strpos($sql,'TOP 1')!==false) return array_values(array_filter($state,function ($r) use ($params) { return $r['parent_id']===$params[0]; }));
 return isset($state[$params[0]]) ? array($state[$params[0]]) : array();
};
$query=function ($sql,$params) use (&$state,&$logs,$case) {
 if (strpos($sql,'UPDATE')===0) { preg_match('/SET \[([^\]]+)\]/',$sql,$m); $state[$params[3]][$m[1]]=$params[0]; }
 if (strpos($sql,'INSERT')===0) { if ($case==='auditfail') throw new RuntimeException('audit failed'); $logs[]=$params; }
 return true;
};
session_id('parent-test');
$_REQUEST=array('mode'=>'parent_save'); $_SERVER['REQUEST_METHOD']=$case==='nonpost'?'GET':'POST';
if ($case==='load') $_REQUEST['mode']='parent_load';
$_POST=array('csrf_token'=>$case==='csrf'?'bad':$token,'i_parent'=>$case==='clear'?'0':'1',
 'children'=>json_encode($case==='clear'?array():array($case==='self'?10:12)), 'reason'=>'correct AP family',
 'snapshot'=>$case==='conflict'?'stale':hash_hmac('sha256',json_encode(array($state[10],$state[11])),session_id()));
function adminCheckingReply($status,$data) {
 global $case,$state,$initial,$logs,$committed,$rolledBack;
 $expected=in_array($case,array('success','clear','ir','load'))?200:($case==='conflict'?409:($case==='auditfail'?500:(in_array($case,array('csrf','nonpost'))?403:400)));
 if ($status!==$expected) { fwrite(STDERR,json_encode($data)); exit(1); }
 if ($status===200) {
  if ($case==='load') { if ($data['reason']!=='saved reason') exit(6); echo "PASS: load saved reason\n"; exit; }
  if ($data['reason']!=='correct AP family') exit(7);
  if (!$committed || $state[11]['parent_id']!==null || !$logs) exit(2);
  if (in_array($case,array('success','ir')) && $state[12]['parent_id']!==10) exit(3);
  if ($case==='clear' && $state[10]['i_parent']!==0) exit(4);
 } else if ($state!==$initial || $committed) exit(5);
 echo "PASS: $case\n"; exit;
}
require __DIR__.'/../public/supplies/sp/tor/api/checkingParent.php';
