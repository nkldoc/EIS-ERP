<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");



$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_tor_contract";
$keyName = "sp_tor_contract_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;

$re_id = null;
$stmt2 = true;
$stmt3 = true;
    
//End fn updateStaus

$db->BeginTran();
    
switch ($mode) {
    
    case "MAPPINGCODECST":
    
    $c_code = $_POST['c_code']??null;
    
            $sql = "UPDATE {$table} SET c_code= '{$c_code}', dc_user_update_id = ? , dc_user_update_cost_id= ?, d_update= ? WHERE {$keyName} = ?";
		  $arr = array($data['dc_user_update_id'] , $data['dc_user_update_cost_id'] , $data['d_update']  , $data['sp_tor_contract_id']);
		  
//  echo $db->debugSql($sql3, $arr);
//exit;

    
            $stmt = $db->QueryParam($sql, $arr);
    
        break;
    
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => intVal($re_id));
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
