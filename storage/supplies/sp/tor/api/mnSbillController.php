<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "sp_tor_work_score";
$keyName = "sp_tor_id";
$max_sp_type_status_id = 24;
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "DEA";
$stmt2 = true;
$stmt3 = true;
$db->BeginTran();
//print_r($_REQUEST);
//exit();
switch ($mode) {
    case "ADD":
        unset($data["mode"]);
//        unset($data["sp_sbill_hdr_id"]);
        unset($data["i_delete"]);
        $data["sp_sbill_hdr_id"] = intVal($db->GetDataBySQL("select top 1 sp_sbill_hdr_id from NMU_ERP.dbo.sp_sbill_items order by sp_sbill_hdr_id desc", array())) + 1;
        // ============== //
//        print_r($data);
//        exit();
        $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        // Initialize variables

        foreach ($data["c_doc_ref"] as $k => $val) {
            $data["c_doc_ref"] = $val ?? null;
            $data["d_doc_date"] = $date->bc_to_ad($_REQUEST["d_doc_date"][$k]) ?? null;
            $data["f_period_amt"] = $_REQUEST["f_period_amt"][$k] ?? null;

            $addField = '';
            $addValue = '';
            $arrValue = [];

// Loop through $data array
            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
// Remove the first comma from both $addField and $addValue
            $addField = substr($addField, 2); // Remove leading ', '
            $addValue = substr($addValue, 2); // Remove leading ', '
// Create the final SQL query string
            $sql = "SET NOCOUNT ON;
                INSERT INTO NMU_ERP.dbo.sp_sbill_items ({$addField}) VALUES ({$addValue});
                ";
//            echo $sql;
//            print_r($arrValue);
            $stmt = $db->QueryParam($sql, $arrValue);
        }

        break;
    case "UPDATE":
        // ============== //
        $sql = "DELETE NMU_ERP.dbo.sp_sbill_items WHERE sp_sbill_hdr_id = ?";
        $arrParam = array($_REQUEST["sp_sbill_hdr_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
//
        unset($data["mode"]);
//        unset($data["sp_sbill_hdr_id"]);
        unset($data["i_delete"]);
        // ============== //
        $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        // Initialize variables

        foreach ($data["c_doc_ref"] as $k => $val) {
            $data["c_doc_ref"] = $val ?? null;
            $data["d_doc_date"] = $date->bc_to_ad($_REQUEST["d_doc_date"][$k]) ?? null;
            $data["f_period_amt"] = $_REQUEST["f_period_amt"][$k] ?? null;

            $addField = '';
            $addValue = '';
            $arrValue = [];

// Loop through $data array
            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
// Remove the first comma from both $addField and $addValue
            $addField = substr($addField, 2); // Remove leading ', '
            $addValue = substr($addValue, 2); // Remove leading ', '
// Create the final SQL query string
        $sql = "SET NOCOUNT ON;
                INSERT INTO NMU_ERP.dbo.sp_sbill_items ({$addField}) VALUES ({$addValue});
                ";
            $stmt2 = $db->QueryParam($sql, $arrValue);
    
        }

        break;
    case "DELETE":
        $sql = "DELETE NMU_ERP.dbo.sp_sbill_items
                WHERE sp_sbill_hdr_id = ?";
        $arrParam = array($_REQUEST["sp_sbill_hdr_id"]);
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
