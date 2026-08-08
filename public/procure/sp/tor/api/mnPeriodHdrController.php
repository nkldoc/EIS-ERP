<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode               = $_REQUEST["mode"];
$table              = "dbo.sp_tor_hdr_period";
$keyName            = "tor_id";
$data               = $util->mnUser($_REQUEST);
$data["i_delete"]   = DELETE_FALSE; 
$re_id              = null;
$stmt2              = true;
$stmt3              = true;

//End fn updateStaus
$db->BeginTran();
    
    
switch ($mode) {
    
    case "UP_PERIOD_HDR":

        $arrParam = array();
        $data["dc_user_update_id"]          = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]     = $_SESSION["dc_cost_id"];
        $data["d_update"]                   = date("Y-m-d H:i:s"); 
    
        $period_status_id = $data["period_status_id"]??null; //
        
        $arrParam[] = $period_status_id; //  
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_tor_hdr_period_id"];

        $sql = " UPDATE dbo.sp_tor_hdr_period set " 
                . " period_status_id = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_tor_hdr_period_id = ?";
    
        $stmt = $db->QueryParam($sql, $arrParam);
        $re_id = $data["sp_check_period_hdr_id"];
        break;
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
