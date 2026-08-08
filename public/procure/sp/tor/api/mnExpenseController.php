<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

//print_r($_REQUEST);
//exit();
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$table = "dbo.sp_acc_inv";
$keyName = "sp_acc_inv_id";

$mode = $_REQUEST["mode"] ?? null;

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$db->BeginTran();
$ret_id = $_REQUEST["id"] ?? null;

$arrParam[] = $data['dc_acc_id'];
$arrParam[] = $data['dc_acc_inv_id'];
$arrParam[] = $data['dc_user_update_id'];
$arrParam[] = $data['dc_user_update_cost_id'];
$arrParam[] = $data['d_update'];
$arrParam[] = $ret_id;

$sql = "UPDATE {$table} SET dc_acc_id = ? ,dc_acc_inv_id = ?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                WHERE {$keyName} = ?";

$stmt = $db->QueryParam($sql, $arrParam);

if ($stmt && $stmt2 && $stmt3 && $stmt4) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
