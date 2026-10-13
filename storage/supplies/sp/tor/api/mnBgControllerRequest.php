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

        
//        print_r($_REQUEST);
//        exit();
//        

 switch ($mode) {
     
    case "CONTRACT_REQUEST":

        $re_id  = $_REQUEST["sp_tor_id"] ?? null;     
        $arrParam[] = 1; //Request 1 
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $re_id;
        

        $sql = "UPDATE dbo.sp_tor SET  i_is_request =?"
                . " , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                "
                . " WHERE tor_id = ?"; 
        $stmt = $db->QueryParam($sql, $arrParam);
        break; 
    case "CONTRACT_RETURN":

        $re_id  = $_REQUEST["sp_tor_id"] ?? null;     
        $arrParam[] = 2; //Request 1 
        //อัพเดท ไวเพื่อต้องการรับรู้ว่าเงินอุดหนุนได้ถูกจองเรียบร้อยแล้ว = 2 
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $re_id;
        $sql = "UPDATE dbo.sp_tor SET  i_is_request =?"
                . " , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                    , i_period_bg = 2  
                "
                . " WHERE tor_id = ?";
        $stmt = $db->QueryParam($sql, $arrParam);
        break; 
 }
if ($stmt && $stmt2 && $stmt3 && $stmt4) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => intVal($re_id));
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
