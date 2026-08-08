<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "sp_delivery_items";
$keyName = "sp_tor_hdr_period_id";

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$stmt2 = true;
$stmt3 = true;
$db->BeginTran();
//print_r($_REQUEST);
//exit();
switch ($mode) {
    case "UPDATE":

        $ir = $db->GetDataBySQL("select a.c_arrive_code from sp_check_period_hdr a where a.sp_tor_hdr_period_id=?", array($data["sp_tor_hdr_period_id"]));

        if (!$ir) {
            $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : no contract number");
            echo json_encode($re);
            exit;
        }
        // ============== //
        $cc_hdr_period_id = $db->GetDataBySQL("select count(sp_tor_hdr_period_id) as sp_tor_hdr_period_id from dbo.sp_delivery_items a where a.sp_tor_hdr_period_id=?", array($data["sp_tor_hdr_period_id"]));
        if($cc_hdr_period_id>0){
            $sql = "DELETE dbo.sp_delivery_items WHERE sp_tor_hdr_period_id = ?";
            $arrParam = array($_REQUEST["sp_tor_hdr_period_id"]);
            $stmt = $db->QueryParam($sql, $arrParam);
        }
        
//        echo $cc_hdr_period_id; exit();
        $data["i_enabled"] = 1;
        $data["dc_cost_id"] = $_SESSION["dc_cost_id"];
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

    
    $fld_arr = array('dc_cost_id'	
                    ,'sp_tor_hdr_period_id'
                    ,'dc_product_type_id'	
                    ,'c_ir_code'
                    ,'i_qty'
                    ,'f_period_amt'
                    ,'i_enabled'
                    ,'dc_user_create_id'
                    ,'dc_user_create_cost_id','d_create','dc_user_update_id','dc_user_update_cost_id','d_update');
    
        
    
        foreach ($data["dc_cost_item_id"] as $k => $val) {

            $data["sp_tor_hdr_period_id"] = $_REQUEST["sp_tor_hdr_period_id"];
            $data["dc_product_type_id"] = $_REQUEST["i_product_type"];
            $data["c_ir_code"] = $ir;
            $data["dc_cost_id"] = $val ?? null;
//            $data["f_period_amt"] = $_REQUEST["f_cost_amt"][$k] ?? null;
            $data["f_period_amt"] = !empty($_REQUEST["f_cost_amt"][$k]) ? str_replace(',', '', $_REQUEST["f_cost_amt"][$k]) : 0;  
            $data["i_qty"] = $_REQUEST["i_qty"][$k] ?? null;
            !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;

            $addField = '';
            $addValue = '';
            $arrValue = [];

// Loop through $data array
            $i =0;
            foreach ($fld_arr as $fld) {
                
                $value = $data[$fld];
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?"; 
//                echo $fld_arr[$i]."=> {$fld}={$value} <br/>";  
                $i++;
            }
// Remove the first comma from both $addField and $addValue
            $addField = substr($addField, 2); // Remove leading ', '
            $addValue = substr($addValue, 2); // Remove leading ', '
// Create the final SQL query string
            $sql = "SET NOCOUNT ON;
                    INSERT INTO EIS_PROCURE.dbo.sp_delivery_items ({$addField}) VALUES ({$addValue});
                ";
//            echo $sql;
//            print_r($arrValue);
//                    exit();
            $stmt = $db->QueryParam($sql, $arrValue);
        }

        break;
    case "DELETE":
        $sql = "DELETE EIS_PROCURE.dbo.sp_delivery_items
                WHERE sp_tor_hdr_period_id = ? and dc_cost_id = ?";
        $arrParam = array($_REQUEST["sp_tor_hdr_period_id"], $_REQUEST["dc_cost_id"]);
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
