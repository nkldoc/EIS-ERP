<?php
include("../../conf/config.php");
include("../conf/configDc.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

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

switch ($mode) {
    case "ADD":
        // ============== //
        $data["sp_tor_id"] = $data["id"];
        unset($data["id"]);
        unset($data["mode"]);
        unset($data["c_code"]);
        unset($data["sp_cate_id"]);

        foreach ($data["c_name"] as $k => $val) {
            $arr[] = array("id" => $k, "sp_cate_id" => 1, "c_name" => $val, "score" => $data["score"][$k]);
        }
        $data["c_name"] = json_encode(array("sp_tor_id" => $data["sp_tor_id"], "data" => $arr));
        $data["score"] = json_encode(array("sp_tor_id" => $data["sp_tor_id"], "data" => $arr));

//        print_r($data["c_name"]);
//        exit();
        $data["f_type_amt"] = !empty($data["f_type_amt"]) ? str_replace(',', '', $data["f_type_amt"]) : 0;
        // ============== //
// Initialize variables
        $addField = '';
        $addValue = '';
        $arrValue = [];

// Loop through $data array
        foreach ($data as $fld => $value) {
            // Append value or null to $arrValue array
            $arrValue[] = ($value != "") ? $value : null;
            // Concatenate field names and placeholder values
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }

// Remove the first comma from both $addField and $addValue
        $addField = substr($addField, 2); // Remove leading ', '
        $addValue = substr($addValue, 2); // Remove leading ', '
// Create the final SQL query string
        $sql = "SET NOCOUNT ON;
                INSERT INTO dbo.sp_tor_work_score ({$addField}) VALUES ({$addValue});
                ";

//        echo $sql;
//        print_r($arrValue);
//        exit();
        $stmt = $db->QueryParam($sql, $arrValue);

        break;
    case "EDIT1":
        // ============== // 
        $data["sp_tor_id"] = $data["id"];
        unset($data["id"]);
        unset($data["mode"]);
        unset($data["c_code"]);

        unset($data["sp_emp_id"]);
        unset($data["sp_cate_id"]);
        unset($data["dc_department_id"]);
        unset($data["sp_type_id"]);
        unset($data["c_type_id"]);
        unset($data["sp_tor_work_id"]);
        unset($data["c_sp_tor_work_id"]);
        unset($data["f_type_amt"]);
//        $f0 = $db->GetDataBySQL("SELECT * from dbo.view_sp_tor_work_socore where i_enabled=? and sp_tor_id=? and sp_cate_id=?", array(1, $data["sp_tor_id"], 1));
        $stmt0 = $db->QueryParam("SELECT * from dbo.view_sp_tor_work_socore where i_enabled=? and sp_tor_id=? and sp_cate_id=?", array(1, $data["sp_tor_id"], 1));
        //cate 1->2
        //********************************************* 
        if (true) {
            $catid1 = 1;
            $catid2 = 2;
        } else {
            //cate 2->3
            //***********************************************
            $catid1 = 2;
            $catid2 = 3;
        }
        if (sqlsrv_has_rows($stmt0)) {
            while ($row = $db->Fetch($stmt0)) {
                $arr[] = array("id" => $row["id"], "sp_cate_id" => $catid1, "c_name" => $row["c_name"], "score" => $row["score"]);
                $last_id = $row["id"];
            }
        }
        $last_id += 1;
        foreach ($data["c_name"] as $k => $val) {
            $arr[] = array("id" => ($last_id++), "sp_cate_id" => $catid2, "c_name" => $val, "score" => $data["score"][$k]);
        }


    
    
//        print_r($arr);
//        exit();
        $data["c_name"] = json_encode(array("sp_tor_id" => $data["sp_tor_id"], "data" => $arr));
        $data["score"] = json_encode(array("sp_tor_id" => $data["sp_tor_id"], "data" => $arr));
        $addField = null;
        $addValue = null;
        // ============== //  
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
            {$fldA} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $sql = "UPDATE dbo.sp_tor_work_score SET " . substr($addField, 1) . " WHERE sp_tor_id = ?";
//        echo $sql;
//        exit();
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "EDIT2":
        // ============== // 
//        $data["sp_tor_id"] = $data["id"];
        unset($data["id"]);
        unset($data["mode"]);
        unset($data["c_code"]);
        unset($data["parent_id"]);
        unset($data["sp_tor_hdr_period_id"]);

        unset($data["sp_emp_id"]);
        unset($data["sp_cate_id"]);
        unset($data["dc_department_id"]);
        unset($data["sp_type_id"]);
        unset($data["c_type_id"]);
        unset($data["sp_tor_work_id"]);
        unset($data["c_sp_tor_work_id"]);
        unset($data["f_type_amt"]);
    
    
        $stmt0 = $db->QueryParam("SELECT id, sp_cate_id,c_name,score,isnull(sp_tor_hdr_period_id,0) as sp_tor_hdr_period_id from dbo.view_sp_tor_work_socore where sp_cate_id in(1,2,3) and i_enabled=? and sp_tor_id=? ", array(1, $_REQUEST["sp_tor_id"]));
        //cate 1->2
        //********************************************* 
        if (true) {
            $catid1 = 1;
            $catid2 = 2;
            $catid3 = 3;
        } else {
            //cate 2->3
            //***********************************************
            $catid1 = 2;
            $catid2 = 3;
        }
        if (sqlsrv_has_rows($stmt0)) {
            while ($row = $db->Fetch($stmt0)) {
                $arr[] = array("id" => $row["id"], "sp_cate_id" => $row["sp_cate_id"], "sp_tor_hdr_period_id" => $row["sp_tor_hdr_period_id"], "c_name" => $row["c_name"], "score" => $row["score"]);
                $last_id = $row["id"];
            }
        }
        $last_id += 1;
        foreach ($data["c_name"] as $k => $val) {
            $arr[] = array("id" => ($last_id++), "sp_cate_id" => $catid3, "sp_tor_hdr_period_id" => ($_REQUEST["parent_id"] ?? null), "c_name" => $val, "score" => $data["score"][$k]);
        }
    
//        print_r($arr);
//        exit();
        $data["c_name"] = json_encode(array("sp_tor_id" => $data["sp_tor_id"], "data" => $arr));
        $data["score"] = json_encode(array("sp_tor_id" => $data["sp_tor_id"], "data" => $arr));
        $addField = null;
        $addValue = null;
        // ============== //  
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
            {$fldA} = ?";
        }

        $arrValue[] = $_REQUEST["sp_tor_id"];
        $sql = "UPDATE dbo.sp_tor_work_score SET " . substr($addField, 1) . " WHERE sp_tor_id = ?";
//        echo $sql;
//        exit();
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
