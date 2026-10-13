<?php
// CLI-only integration check; temporary accounts are removed in finally.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require __DIR__ . '/../account/api_auth.php';
require __DIR__ . '/../classes/JwtHandler.php';
$db = apiDb();
$suffix = bin2hex(random_bytes(6));
$name = 'incoming_test_' . $suffix;
$uid = null; $server = null;
$router = tempnam(sys_get_temp_dir(), 'incoming-router-');
$log = tempnam(sys_get_temp_dir(), 'incoming-log-');
file_put_contents($router, '<?php require ' . var_export(realpath(__DIR__ . '/../apiAccounts.php'), true) . ';');
function check($ok, $label) { if (!$ok) throw new RuntimeException($label); echo "PASS $label\n"; }
function requestApi($method, $path, $token = '', $body = null) {
    $ch = curl_init('http://127.0.0.1:18763/apiAccounts' . $path);
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER=>true, CURLOPT_CUSTOMREQUEST=>$method, CURLOPT_TIMEOUT=>10,
        CURLOPT_HTTPHEADER=>['Content-Type: application/json', 'Authorization: Bearer ' . $token]]);
    if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
    $raw = curl_exec($ch); $status=curl_getinfo($ch,CURLINFO_HTTP_CODE); curl_close($ch);
    return [$status,json_decode($raw,true)];
}
try {
    $db->prepare('INSERT INTO users (name,email,password,role,is_active,token_version) VALUES (?,?,?,?,1,0)')
       ->execute([$name,$name.'@example.invalid',password_hash(bin2hex(random_bytes(20)),PASSWORD_DEFAULT),'superadmin']);
    $uid=(int)$db->lastInsertId();
    $token=(new JwtHandler(3600))->jwtEncodeData('localhost',['user_id'=>$uid,'token_version'=>0]);
    $server=proc_open([PHP_BINARY,'-S','127.0.0.1:18763',$router],[0=>['pipe','r'],1=>['file',$log,'a'],2=>['file',$log,'a']],$pipes);
    for($i=0;$i<30;$i++){ $socket=@fsockopen('127.0.0.1',18763); if($socket){fclose($socket);break;} usleep(100000); }
    check(requestApi('GET','')[0]===401,'unauthenticated blocked');
    $input=['username'=>$name,'password'=>'Test-only-'. $suffix,'note'=>'ทดสอบบัญชี','active'=>true,'permissions'=>['procure.ir']];
    [$status,$created]=requestApi('POST','',$token,$input);check($status===200 && isset($created['id']),'create'); $id=$created['id'];
    check(requestApi('POST','',$token,$input)[0]===409,'duplicate rejected');
    [$status,$rows]=requestApi('GET','',$token);$found=array_values(array_filter($rows,fn($r)=>$r['id']==$id));
    check($status===200 && $found[0]['note']===$input['note'] && $found[0]['permissions']===['procure.ir'],'list, Thai text and permissions');
    $stmt=$db->prepare('SELECT password_hash FROM sp_api_account WHERE account_id=?');$stmt->execute([$id]);$hash=$stmt->fetchColumn();
    unset($input['password']);$input['active']=false;$input['permissions']=[];
    check(requestApi('PUT','/'.$id,$token,$input)[0]===200,'update and disable');
    $stmt->execute([$id]);check($stmt->fetchColumn()===$hash,'blank password retains hash');
    $input['permissions']=['bad route'];check(requestApi('PUT','/'.$id,$token,$input)[0]===422,'invalid route rejected');
    check(requestApi('POST','',$token,'{')[0]===400,'invalid JSON rejected');
    $input['permissions']=['procure.contract'];$input['password']='Changed-'.$suffix;$input['active']=true;
    check(requestApi('PUT','/'.$id,$token,$input)[0]===200,'replace password and permissions');
    $stmt->execute([$id]);check(password_verify($input['password'],$stmt->fetchColumn()),'new password hash');
    check(requestApi('DELETE','/'.$id,$token)[0]===200,'delete');
    $stmt=$db->prepare('SELECT COUNT(*) FROM sp_api_permission WHERE account_id=?');$stmt->execute([$id]);check((int)$stmt->fetchColumn()===0,'permissions cascade');
    check(requestApi('DELETE','/'.$id,$token)[0]===404,'missing account');
    $db->prepare("UPDATE users SET role='user' WHERE id=?")->execute([$uid]);
    check(requestApi('GET','',$token)[0]===403,'non-admin blocked');
    $db->prepare("UPDATE users SET role='superadmin',token_version=1 WHERE id=?")->execute([$uid]);
    check(requestApi('GET','',$token)[0]===401,'revoked token blocked');
} finally {
    if (is_resource($server)) { proc_terminate($server); proc_close($server); }
    $db->prepare('DELETE FROM sp_api_account WHERE username=?')->execute([$name]);
    if($uid) $db->prepare('DELETE FROM users WHERE id=?')->execute([$uid]);
    @unlink($router); @unlink($log);
}
