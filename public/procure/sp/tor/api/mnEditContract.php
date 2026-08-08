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
    case "Edit_contrct":
        $arrParam = array();
        $arrValue = array();
        $COUNT_EDIT = $db->GetDataBySQL("select COUNT(sp_tor_id) as sp_tor_id  from sp_tor_contract_edit where i_enabled = 1  and sp_tor_id = {$_REQUEST['sp_tor_id']} group by sp_tor_id  ", array($_REQUEST["sp_tor_id"]));
        $stmt3 = $db->QueryParam("select  
        CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date 
        ,CONVERT(VARCHAR, d_due_date, 120) AS d_due_date 
        , f_total_amt  
        from sp_tor_contract where  sp_tor_contract_id = {$_REQUEST['sp_tor_contract_id']} ;", array($_REQUEST["sp_tor_contract_id"]));
        $row = $db->Fetch($stmt3);
        $arrParam["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $arrParam["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        $arrParam["i_enabled"] = $_REQUEST["i_enabled"];
        $arrParam["c_comment"] = $_REQUEST["c_comment"];
        $arrParam["i_type"] = $_REQUEST["i_type_update"]??null;
        $arrParam["row_edit"] = $COUNT_EDIT + 1 ;
        $arrParam["i_type_guarantee"] = $_REQUEST["i_type_guarantee"];
        $arrParam['d_doc_date'] = $row['d_doc_date']; 
        $arrParam['d_due_date'] = $row['d_due_date']; 
        $arrParam["f_total_amt"] = str_replace(",", "", $row["f_total_amt"]);

        $arrParam["dc_user_create_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_create"] = date("Y-m-d H:i:s");
        $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_update"] = date("Y-m-d H:i:s");
        foreach ($arrParam as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $sql = "INSERT INTO sp_tor_contract_edit (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
        // $arrValue[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        unset($arrParam);      
        unset($addField);      
        unset($arrValue);      
        $arrValue = null;      

        $arrParam['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        $arrParam['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
        $arrParam["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);

        $arrParam["dc_user_update_id"] = $_SESSION["user_id"];
        $arrParam["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $arrParam["d_update"] = date("Y-m-d H:i:s");
        foreach ($arrParam as $fldA2 => $value2) {
            $arrValue[] = ($value2 != "") ? $value2 : null;
            $addField .= ", {$fldA2} = ?";
        }
        $arrValue[]  = $_REQUEST['sp_tor_contract_id'];
        $sql2 = "UPDATE sp_tor_contract SET " . substr($addField, 1) . " WHERE sp_tor_contract_id =  ?";
        $stmt2 = $db->QueryParam($sql2, $arrValue);

        break;
    case "DELETE_EDIT_CONTRACT": 
        unset($arrParam);      
        $arrParam = array();
        $arrParam[] = $_REQUEST["i_enabled"];  
        $arrParam[] = $_REQUEST["sp_tor_contract_editid"] ?? null; 
        $sql = "UPDATE dbo.sp_tor_contract_edit SET i_enabled =?    WHERE sp_tor_contract_editid = ?"; 
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
