<?php
// CLI integration test against the local configured DB. All fixtures are removed in finally.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../account/api_auth.php';
require __DIR__ . '/../classes/JwtHandler.php';
require __DIR__ . '/../classes/IncomingEndpoint.php';
$db = apiDb();
$suffix = bin2hex(random_bytes(5));
$name = 'inbound_' . $suffix;
$password = 'Test-' . bin2hex(random_bytes(12));
$userIds = []; $endpointIds = []; $server = null; $checks = 0;
$previousAppEnv = getenv('APP_ENV');
$router = tempnam(sys_get_temp_dir(), 'inbound-router-');
$log = tempnam(sys_get_temp_dir(), 'inbound-server-');
$socket = stream_socket_server('tcp://127.0.0.1:0', $errno, $error);
if (!$socket) throw new RuntimeException('Unable to allocate test port');
$address = stream_socket_get_name($socket, false); fclose($socket);
file_put_contents($router, '<?php $path=parse_url($_SERVER["REQUEST_URI"],PHP_URL_PATH); require ' . var_export(realpath(__DIR__ . '/..') . '/', true) . ' . (strpos($path,"/incomingEndpoints")!==false?"incomingEndpoints.php":"incomingReceiver.php");');
function expect($ok, $label) { global $checks; if (!$ok) throw new RuntimeException($label); $checks++; echo "PASS $label\n"; }
function callApi($path, $method = 'GET', $body = null, $token = '', $extra = []) {
    global $address;
    $requestPath = strpos($path, 'api-eis/procure/incoming/') === 0 ? '/' . $path : '/api-eis/procure/' . $path;
    $ch = curl_init('http://' . $address . $requestPath);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_CUSTOMREQUEST=>$method, CURLOPT_TIMEOUT=>15,
        CURLOPT_HTTPHEADER=>array_merge(['Content-Type: application/json', 'Authorization: Bearer ' . $token], $extra)]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
    $raw=curl_exec($ch); $status=curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
    return [$status, json_decode($raw,true)];
}
try {
    foreach (['superadmin','user','user'] as $index=>$role) {
        $db->prepare('INSERT INTO users (name,email,password,role,is_active,token_version) VALUES (?,?,?,?,1,0)')
            ->execute([$name.'_'.$index,$name.'_'.$index.'@example.invalid',password_hash($password,PASSWORD_DEFAULT),$role]);
        $userIds[]=(int)$db->lastInsertId();
    }
    $admin=(new JwtHandler(3600))->jwtEncodeData('localhost',['user_id'=>$userIds[0],'token_version'=>0]);
    $normal=(new JwtHandler(3600))->jwtEncodeData('localhost',['user_id'=>$userIds[1],'token_version'=>0]);
    $other=(new JwtHandler(3600))->jwtEncodeData('localhost',['user_id'=>$userIds[2],'token_version'=>0]);
    putenv('APP_ENV=development');
    $server=proc_open([PHP_BINARY,'-S',$address,$router],[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes);
    for($i=0;$i<40;$i++){ $probe=@stream_socket_client('tcp://'.$address); if($probe){fclose($probe);break;} usleep(100000); }
    expect(callApi('incomingEndpoints')[0]===401,'admin API requires login');
    expect(callApi('incomingEndpoints','GET',null,$normal)[0]===403,'admin API rejects normal user');
    [$status,$users]=callApi('incomingEndpoints/users','GET',null,$admin);
    expect($status===200 && count(array_filter($users,fn($r)=>$r['id']===$userIds[1] || (int)$r['id']===$userIds[1]))===1,'select existing system users');
    expect(strpos(json_encode($users),'password')===false,'user options never return passwords');
    $route='api-eis/procure/incoming/test_'.$suffix;
    $config=['name'=>'รับข้อมูลตรวจรับ ทดสอบ','uri'=>'/'.$route,'method'=>'POST','user_id'=>$userIds[1],'active'=>true];
    [$status,$created]=callApi('incomingEndpoints','POST',$config,$admin);
    expect($status===201 && isset($created['id']),'create endpoint'); $id=$created['id']; $endpointIds[]=$id;
    expect(callApi('incomingEndpoints','POST',$config,$admin)[0]===409,'duplicate URL and method rejected');
    $invalid=$config; $invalid['uri']='/procure/incoming/not-local';
    expect(callApi('incomingEndpoints','POST',$invalid,$admin)[0]===422,'reserved existing URLs cannot be overwritten');
    $invalid=$config; $invalid['method']='GET';
    expect(callApi('incomingEndpoints','POST',$invalid,$admin)[0]===422,'body receiver requires supported method');
    $body=['data'=>[['pr_id'=>1768,'po_id'=>448,'period_id'=>4082,'chk_id'=>1,'c_contract_code'=>'1C103/2568','bg_expense_name'=>'ค่ายาและเวชภัณฑ์ อวัยวะเทียม','f_period_amt'=>17013,'c_doc_ref'=>false,'empty'=>(object)[],'line_ids'=>[['c_doc_ref'=>false,'d_doc_dateSub'=>'2026-05-20','chk_line_id'=>2652]],'nested'=>['Password'=>$password,'api_key'=>'secret-key','authorization'=>'secret-auth']]]];
    [$status,$received]=callApi($route.'?password=query-secret','POST',$body,$normal,['Cookie: secret-cookie','X-Original-Url: /procure/ir?password=query-secret']);
    expect($status===200 && $received['received']===1 && isset($received['request_id']),'receive JSON with selected user Bearer token');
    [$status,$logs]=callApi('incomingEndpoints/logs?endpoint_id='.$id,'GET',null,$admin);
    expect($status===200 && count($logs['rows'])===1,'list request history'); $logId=$logs['rows'][0]['id'];
    [$status,$detail]=callApi('incomingEndpoints/logs/'.$logId,'GET',null,$admin);
    $payload=$detail['payload'];
    expect($status===200 && array_keys($payload)===['headers','body'],'log has exact headers/body envelope');
    expect(!isset($payload['body']['username']) && !isset($payload['body']['password']),'credentials are absent from body');
    expect($payload['headers']['Authorization']==='***HIDDEN***','Bearer token hidden');
    expect($payload['body']['data'][0]['c_doc_ref']===false && $payload['body']['data'][0]['line_ids'][0]['chk_line_id']===2652 && $payload['body']['data'][0]['bg_expense_name']===$body['data'][0]['bg_expense_name'],'nested data, booleans and Thai text retained');
    $stmt=$db->prepare('SELECT payload FROM sp_api_incoming_log WHERE id=?');$stmt->execute([$logId]);$stored=$stmt->fetchColumn();
    expect(is_object(json_decode($stored)->body->data[0]->empty),'empty JSON object preserved');
    foreach ([$password,'secret-key','secret-auth',$normal,'secret-cookie','query-secret'] as $secret) expect(strpos($stored,$secret)===false,'sensitive value redacted');
    expect(callApi('incomingEndpoints/logs/'.$logId,'GET',null,$normal)[0]===403,'logs restricted to superadmin');
    expect(callApi($route,'POST',$body,'invalid-token')[0]===401,'invalid Bearer token rejected');
    expect(callApi($route,'POST',$body,$other)[0]===403,'unassigned Bearer user rejected');
    expect(callApi($route,'PUT',$body,$normal)[0]===405,'wrong method rejected');
    expect(callApi($route,'POST','{"password":"do-not-store"',$normal)[0]===400,'invalid JSON rejected');
    $wrong=$body; $wrong['data']=(object)['invalid'=>true]; expect(callApi($route,'POST',$wrong,$normal)[0]===422,'data must be array');
    expect(callApi($route,'POST',$body,$normal,['Content-Type: text/plain'])[0]===415,'wrong content type rejected');
    expect(callApi($route,'POST',str_repeat('x',IncomingEndpoint::MAX_BODY+1),$normal)[0]===413,'oversized body rejected');
    $config['active']=false; expect(callApi('incomingEndpoints/'.$id,'PUT',$config,$admin)[0]===200,'disable endpoint');
    expect(callApi($route,'POST',$body,$normal)[0]===403,'disabled endpoint rejects request');
    $config['active']=true; $config['method']='PATCH'; expect(callApi('incomingEndpoints/'.$id,'PUT',$config,$admin)[0]===200,'edit method');
    expect(callApi($route,'PATCH',$body,$normal)[0]===200,'updated method receives JSON');
    $db->prepare('UPDATE users SET is_active=0 WHERE id=?')->execute([$userIds[1]]);
    expect(callApi($route,'PATCH',$body,$normal)[0]===401,'disabled user invalidates Bearer token');
    $db->prepare('UPDATE users SET is_active=1 WHERE id=?')->execute([$userIds[1]]);
    $db->prepare('UPDATE users SET token_version=token_version+1 WHERE id=?')->execute([$userIds[1]]);
    expect(callApi($route,'PATCH',$body,$normal)[0]===401,'revoked Bearer token rejected');
    $db->prepare('UPDATE users SET token_version=0 WHERE id=?')->execute([$userIds[1]]);
    $stmt=$db->prepare('SELECT payload FROM sp_api_incoming_log WHERE endpoint_id=?');$stmt->execute([$id]);
    expect(strpos(implode('', $stmt->fetchAll(PDO::FETCH_COLUMN)),'do-not-store')===false,'malformed raw JSON never leaks secrets');
    for($i=0;$i<51;$i++) IncomingEndpoint::record($db,$id,$config['uri'],'PATCH',$name.'_1',200,'pagination fixture',[],(object)['data'=>[]]);
    [$status,$page1]=callApi('incomingEndpoints/logs?endpoint_id='.$id,'GET',null,$admin);
    [$status,$page2]=callApi('incomingEndpoints/logs?endpoint_id='.$id.'&before='.$page1['next'],'GET',null,$admin);
    expect(count($page1['rows'])===50 && count($page2['rows'])>0 && !array_intersect(array_column($page1['rows'],'id'),array_column($page2['rows'],'id')),'log pagination has no duplicate rows');
    expect(callApi('incomingEndpoints/'.$id,'DELETE',null,$admin)[0]===200,'delete endpoint');
    expect(callApi('incomingEndpoints/logs/'.$logId,'GET',null,$admin)[0]===200,'logs retained after endpoint deletion');
    expect(callApi($route,'PATCH',$body,$normal)[0]===404,'deleted endpoint no longer receives');
    echo "$checks integration checks passed.\n";
} finally {
    if(is_resource($server)){proc_terminate($server);proc_close($server);}
    putenv($previousAppEnv === false ? 'APP_ENV' : 'APP_ENV=' . $previousAppEnv);
    $db->prepare('DELETE FROM sp_api_incoming_log WHERE uri=?')->execute(['/api-eis/procure/incoming/test_'.$suffix]);
    foreach($endpointIds as $id) $db->prepare('DELETE FROM sp_api_incoming_endpoint WHERE id=?')->execute([$id]);
    foreach($userIds as $id) $db->prepare('DELETE FROM users WHERE id=?')->execute([$id]);
    @unlink($router);@unlink($log);
}
