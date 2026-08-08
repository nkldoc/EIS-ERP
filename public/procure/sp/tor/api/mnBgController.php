<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");



$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$table = "dbo.sp_tor";
$keyName = "tor_id";

$mode = $_REQUEST["mode"] ?? null;

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$db->BeginTran();



 switch ($mode) {
    case "UPDATE_PERIOD_FIRST_BG":
        
        $re_id  = $_REQUEST["sp_tor_hdr_period_id"] ;    
        $arrParam[] = $_REQUEST["bg_reserve_money_id"] ?? null; 
        $arrParam[] = $_REQUEST["sp_tor_hdr_period_id"] ?? null;  
        $sql = "UPDATE dbo.sp_tor_hdr_period SET bg_reserve_money_id =?    WHERE sp_tor_hdr_period_id = ?"; 
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UPDATE_CHECK_BG":
        
        $re_id  = $_REQUEST["sp_check_period_hdr_id"] ;    
        $arrParam[] = $_REQUEST["bg_reserve_money_id"] ?? null; 
        $arrParam[] = $_REQUEST["sp_check_period_hdr_id"] ?? null;  
        $sql = "UPDATE dbo.sp_check_period_hdr SET bg_reserve_money_id =?    WHERE sp_check_period_hdr_id = ?"; 
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
 }
if ($stmt && $stmt2 && $stmt3 && $stmt4) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
