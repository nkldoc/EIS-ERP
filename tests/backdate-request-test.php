<?php
// php -n tests/backdate-request-test.php — no database writes.
define('SQLSRV_FETCH_ASSOC', 2);
class RequestReply extends Exception { public $result; function __construct($r) {$this->result=$r;} }
class RequestRows { public $rows; function __construct($rows=array()) {$this->rows=$rows;} }
class DatabaseServer { public $conn=1; }
function backdateReply($ok,$msg,$extra=array()) { throw new RequestReply(array_merge(array('success'=>$ok,'msg'=>$msg),$extra)); }
function mb_strlen($text,$encoding) { return preg_match_all('/./us',$text); }
function sqlsrv_fetch_array($stmt,$mode) { return array_shift($stmt->rows); }
function sqlsrv_begin_transaction($conn) { return true; }
function sqlsrv_commit($conn) { $GLOBALS['committed']=true;return true; }
function sqlsrv_rollback($conn) { $GLOBALS['rolled_back']=true;return true; }
function sqlsrv_rows_affected($stmt) { return $GLOBALS['affected']; }
function sqlsrv_query($conn,$sql,$params=array()) {
    if (strpos($sql,'SELECT u.dc_user_id')!==false) return new RequestRows(array(array('dc_user_id'=>30047)));
    if (strpos($sql,'OBJECT_ID')!==false) return new RequestRows(array(array('id'=>1)));
    if (strpos($sql,'SELECT sp_tor_contract_id')!==false) return new RequestRows($GLOBALS['owner'] ? array(array('sp_tor_contract_id'=>88)) : array());
    if (strpos($sql,'SELECT request_id')!==false) return new RequestRows($GLOBALS['duplicate'] ? array(array('request_id'=>1)) : array());
    if (strpos($sql,'INSERT dbo.sp_contract_backdate_request')!==false) { $GLOBALS['inserted']=$params;return new RequestRows(); }
    if (strpos($sql,'UPDATE dbo.sp_contract_backdate_request')!==false) { $GLOBALS['savedDecision']=$params;return new RequestRows(); }
    if (strpos($sql,'COUNT(*)')!==false) return new RequestRows(array(array('total'=>0)));
    if (strpos($sql,'SELECT TOP 200')!==false) { $GLOBALS['list_scope']=$sql;return new RequestRows(); }
    throw new Exception('Unexpected SQL');
}
require_once __DIR__.'/../public/supplies/sp/tor/api/ContractBackdateApproval.php';
$source=file_get_contents(__DIR__.'/../public/supplies/sp/tor/api/contractBackdateRequest.php');
$source=substr($source,strpos($source,'$uid ='));
function runRequest($post,$uid=10) {
    global $source;
    $_SESSION=array('user_id'=>$uid,'backdate_csrf'=>'token');$_POST=$post;
    $GLOBALS['owner']=true;$GLOBALS['duplicate']=false;$GLOBALS['affected']=1;
    $GLOBALS['inserted']=null;$GLOBALS['savedDecision']=null;$GLOBALS['committed']=false;$GLOBALS['rolled_back']=false;
    if (isset($post['_owner'])) $GLOBALS['owner']=$post['_owner'];
    if (isset($post['_duplicate'])) $GLOBALS['duplicate']=$post['_duplicate'];
    if (isset($post['_affected'])) $GLOBALS['affected']=$post['_affected'];
    try { eval($source); } catch (RequestReply $reply) {return $reply->result;}
    throw new Exception('No reply');
}
function ensure($condition,$message) {if (!$condition) throw new Exception($message);}
$request=array('mode'=>'REQUEST','csrf'=>'token','contract_id'=>88,'tor_id'=>77,'requested_date'=>'2026-10-01','reason'=>'Reason for backdated contract');
$r=runRequest($request);ensure($r['success'] && $GLOBALS['committed'] && $GLOBALS['inserted'][5]===30047,'Request routed to verified approver');
$r=runRequest(array_merge($request,array('csrf'=>'wrong')));ensure(!$r['success'] && !$GLOBALS['inserted'],'CSRF rejected');
$r=runRequest(array_merge($request,array('_owner'=>false)));ensure(!$r['success'] && $GLOBALS['rolled_back'],'Non-owner rejected');
$r=runRequest(array_merge($request,array('_duplicate'=>true)));ensure(!$r['success'] && !$GLOBALS['inserted'],'Duplicate rejected');
$r=runRequest(array_merge($request,array('reason'=>'  ')));ensure(!$r['success'],'Empty reason rejected');
$r=runRequest(array_merge($request,array('requested_date'=>'2026-02-30')));ensure(!$r['success'],'Invalid day rejected');
$decisionParams=array('mode'=>'DECIDE','csrf'=>'token','request_id'=>1,'decision'=>'approved','decision_reason'=>'');
$r=runRequest($decisionParams);ensure(!$r['success'] && !$GLOBALS['savedDecision'],'Non-approver rejected');
$r=runRequest($decisionParams,30047);ensure($r['success'] && $GLOBALS['savedDecision'][3]===30047,'Approver can approve own inbox');
$r=runRequest(array_merge($decisionParams,array('decision'=>'rejected')),30047);ensure(!$r['success'],'Rejection requires reason');
$r=runRequest(array_merge($decisionParams,array('decision'=>'rejected','decision_reason'=>'Insufficient evidence')),30047);ensure($r['success'],'Rejection saved');
$r=runRequest(array_merge($decisionParams,array('_affected'=>0)),30047);ensure(!$r['success'],'Already decided request rejected');
$r=runRequest(array('mode'=>'LIST'));ensure($r['success'] && !$r['is_approver'] && strpos($GLOBALS['list_scope'],'r.requester_id=?')!==false,'Requester sees only own requests');
$r=runRequest(array('mode'=>'LIST'),30047);ensure($r['is_approver'] && strpos($GLOBALS['list_scope'],'r.approver_id=?')!==false,'Approver inbox scope');
echo "Backdate requests: 13 scenarios passed\n";
