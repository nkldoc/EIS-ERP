<?php
// Run with php -n tests/checking-enable-test.php [success|missing|auditfail|csrf]
if (extension_loaded('sqlsrv')) exit('Run with php -n');
$case = $argv[1] ?? 'success';
$id=10; $token='test'; $db=(object)array('conn'=>'fake');
$updates=array(); $logs=array(); $committed=false; $rolledBack=false;
$_SESSION=array('user_id'=>1,'dc_cost_id'=>38);
$_REQUEST=array('mode'=>'enable_save'); $_SERVER['REQUEST_METHOD']='POST';
$_POST=array('csrf_token'=>$case==='csrf'?'invalid':$token);
function sqlsrv_begin_transaction($conn) { return true; }
function sqlsrv_commit($conn) { $GLOBALS['committed']=true; return true; }
function sqlsrv_rollback($conn) { $GLOBALS['rolledBack']=true; $GLOBALS['updates']=array(); $GLOBALS['logs']=array(); return true; }
$rows=function ($sql,$params) use ($case) {
    if (strpos($sql,'FROM dbo.sp_check_period_hdr')!==false) return array(array('sp_tor_hdr_period_id'=>20,'i_enabled'=>2));
    return $case==='missing'?array():array(array('i_enabled'=>2));
};
$query=function ($sql,$params) use ($case,&$updates,&$logs) {
    if (strpos($sql,'UPDATE')===0) $updates[]=array($sql,$params);
    else { if ($case==='auditfail') throw new RuntimeException('audit failed'); $logs[]=$params; }
};
function adminCheckingReply($status,$data) {
    global $case,$updates,$logs,$committed,$rolledBack;
    $expected=array('success'=>200,'missing'=>400,'auditfail'=>500,'csrf'=>403)[$case];
    if ($status!==$expected) exit(1);
    if ($case==='success') {
        if (!$committed || count($updates)!==2 || count($logs)!==2) exit(2);
        if ($updates[0][1][2]!==10 || $updates[1][1][2]!==20) exit(3);
    } elseif ($committed || $updates || $logs || ($case!=='csrf' && !$rolledBack)) exit(4);
    echo "PASS: $case\n"; exit;
}
require __DIR__.'/../public/supplies/sp/tor/api/checkingEnable.php';
