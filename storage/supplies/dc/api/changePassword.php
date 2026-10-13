<?PHP
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$old_password	=$_REQUEST["old_password"];
$new_password	=$_REQUEST["new_password"];
$user_id 		=$_SESSION["user_id"];

$sql = "select c_password from dc_user where dc_user_id = ? ";
$c_password = $db->GetDataBySQL($sql, array($user_id));

if ($c_password == md5($old_password)){
	$db->BeginTran();
	$sql = "UPDATE dc_user SET c_password = ? WHERE dc_user_id = ?";
	$stmt = $db->QueryParam($sql, array(md5($new_password), $user_id));
	if ($stmt){
		$db->CommitTran();
		$re = array("reval"=>0, "success"=>"Success", "msg"=>"บันทึกข้อมูลเรียบร้อย");
	}else{
		$db->RollBackTran();
		$re = array("reval"=>1, "success"=>"Error", "msg"=>"check statement : {$sql}");
	}
}else {
	$re = array("reval"=>1, "success"=>"Error", "msg"=>"รหัสผ่านเดิมไม่ถูกต้อง");
}

echo json_encode($re);
exit;
?>