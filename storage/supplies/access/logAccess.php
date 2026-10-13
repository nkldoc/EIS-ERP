<?PHP

//
//require_once("../conf/config.php");
//require_once("../lib/database/DatabaseServer.php");
//
//$db = new DatabaseServer();
//$db->BeginTran();
//
//$sysUserID 	= $_POST["sysUserId"]??null;
//$ip = getenv('HTTP_CLIENT_IP') ?: getenv('HTTP_X_FORWARDED_FOR') ?: getenv('HTTP_X_FORWARDED') ?: getenv('HTTP_FORWARDED_FOR') ?: getenv('HTTP_FORWARDED') ?: getenv('REMOTE_ADDR');
//$macAddess	= $_POST["macAdress"]??null;
//$menuID		= $_POST["menuID"]??null;
//$menuText	= $_POST["menuTxt"]??null;
//$browser 	= $_POST["browser"]??null;
//$access_date = date("Y-m-d H:i:s");
//
//$sql = "INSERT INTO [NMU_ERPLOG].[dbo].sp_log_access (sys_type, sysUserId, ip, menuID , menuTxt, browser, access_date) VALUES (1,?, ?, ? , ?, ?, ?)";
//$arrParam = array($sysUserID, $ip, $menuID, $menuText, $browser, $access_date);
//$stmt = $db->QueryParam($sql, $arrParam);
//
//if ($stmt) {
//	$db->CommitTran();
//	$re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว");
//} else {
//	$db->RollBackTran();
//	$re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
//}
//echo json_encode($re);
//exit;
