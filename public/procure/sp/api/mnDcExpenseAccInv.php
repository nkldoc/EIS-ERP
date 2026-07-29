<?php
include("../../conf/config.php");
include("../conf/configDc.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date     = new i_date();
$util    = new apiUtil();

$mode        = $_REQUEST["mode"];
$table         = "dc_expense_acc_vsn";
$keyName     = "dc_expense_acc_vsn_id";

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "DEA";

$stmt2 = true;
$stmt3 = true;

$db->BeginTran();

switch ($mode) {
    case "ADD":
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data["c_code"] = $_REQUEST["c_code"];
//        $data["c_code_ref"] = $_REQUEST["c_code_ref"];
        $data["c_name"] = $_REQUEST["c_name"];
        $data["dc_acc_id"] = $_REQUEST["dc_acc_id"];
        $data["dc_acc1_id"] = $_REQUEST["dc_acc1_id"];
        $data["dc_acc2_id"] = $_REQUEST["dc_acc2_id"];
        $data["dc_acc3_id"] = $_REQUEST["dc_acc3_id"];
        $data["dc_acc4_id"] = $_REQUEST["dc_acc4_id"];
        $data["c_comment"] = $_REQUEST["c_comment"];
        $data["i_enabled"] = $_REQUEST["i_enabled"];

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", 
            {$fld}";
            $addValue .= ",
            ?";
        }

        $sql = "
                SET NOCOUNT ON
                INSERT INTO ".DB_CENTER."inv_mode_acc (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
        $stmt = $db->QueryParam($sql, $arrValue);

        break;
    case "EDIT":
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data["c_code"] = $_REQUEST["c_code"];
//        $data["c_code_ref"]	= $_REQUEST["c_code_ref"];
        $data["c_name"] = $_REQUEST["c_name"];
        $data["dc_acc_id"] = $_REQUEST["dc_acc_id"];
        $data["dc_acc1_id"] = $_REQUEST["dc_acc1_id"];
        $data["dc_acc2_id"] = $_REQUEST["dc_acc2_id"];
        $data["dc_acc3_id"] = $_REQUEST["dc_acc3_id"];
        $data["dc_acc4_id"] = $_REQUEST["dc_acc4_id"];
        $data["c_comment"] = $_REQUEST["c_comment"];
        $data["i_enabled"] = $_REQUEST["i_enabled"];
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
            {$fldA} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $sql = "UPDATE ".DB_CENTER."inv_mode_acc SET " . substr($addField, 1) . " WHERE inv_mode_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "DELETE":
        $sql = "DELETE inv_mode_acc 
                WHERE inv_mode_id = ?";
        $arrParam = array($_REQUEST["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
}

if ($stmt) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว");
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
