<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
 include("../../lib/database/apiUtil.php"); 
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$root = "data";
$data = array();
$data = $util->mnUser($_REQUEST);
$mode = $_REQUEST["mode"];
$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();


switch ($mode) {

    case "EDIT":
        // print_r($data);
        // exit;
            $msg = "";

            $arrValue[] = $_REQUEST["c_name"];
            $arrValue[] = $_REQUEST["i_year"];
            $arrValue[] = $_REQUEST["i_yyyy"];
            $arrValue[] = date("Y-m-d H:i:s");
            $arrValue[] = $_REQUEST["id"];
            
            $sql = "UPDATE sp_bg_billing SET c_name = ? , c_code = ? , i_yyyy = ? , d_update = ? where sp_bg_billing_id = ?";
            $para = $db->QueryParam($sql, $arrValue);
            $id = $_REQUEST["id"];
            
            $addValue = null;
            unset($data);
            unset($arrValue);
            if (@$para) {
                $re = array(
                    "success" => true,
                    "id" => $id,
                    "msg" => ""
                );
            } else {
                $re = array(
                    "success" => false,
                    "msg" => $msg
                );
            }
        
        break;
    case "ADD":
        // print_r($data);
        // exit;
        $msg = "";

        $data["c_name"] = $_REQUEST["c_name"]??null;
        $data["c_code"] = $_REQUEST["i_year"]??null;
        $data["i_yyyy"] = $_REQUEST["i_yyyy"];
        $data["i_enabled"] = STATUS_ENABLE;
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");
        // print_r($data);
        // exit;
        unset($data['mode']);
        unset($data['id']);
        unset($data['i_year']);
                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }

                $sql = "
				SET NOCOUNT ON
				INSERT INTO sp_bg_billing (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";
                // echo $sql;
                // print_r($arrValue);
                // exit;
                $para = $db->QueryParam($sql, $arrValue);
                $ss_id = $db->Fetch($para);
                $id = $ss_id["id"];

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        if (@$para) {
            $re = array(
                "success" => true,
                "id" => $id,
                "msg" => ""
            );
        } else {
            $re = array(
                "success" => false,
                "msg" => $msg
            );
        }

        break;

    case "ADD_DTL":
    case "EDIT_DTL":

        $msg = "";
        unset($data["id"]); //mode, id, 
        unset($data["mode"]); //mode, id,  
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s"); 
        if ($mode == "ADD_DTL") { 
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s"); 
            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            } 
            $sql = "
                    SET NOCOUNT ON
                    INSERT INTO dbo.sp_bg_billing_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";
//echo $sql;
//print_r($arrValue);
//exit;
            $para = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($para);
            $id = $ss_id["id"];

            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== // 
            $msg = "เพิ่มรายการเรียบร้อย";
        } else if ($mode == "EDIT_DTL") {

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld} = ?";
            }

            $arrValue[] = $_REQUEST["id"];
            $sql = "UPDATE dbo.sp_bg_billing_dtl SET " . substr($addField, 1) . " WHERE sp_bg_billing_dtl_id = ?";
            $para = $db->QueryParam($sql, $arrValue);
            $id = $_REQUEST["id"];
            $msg = "แก้ไขรายการเรียบร้อย";
        }

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        if (@$para) {
            $re = array(
                "success" => true,
                "id" => $id,
                "msg" => $msg
            );
        } else {
            $re = array(
                "success" => false,
                "msg" => $msg
            );
        }

        break;

    case "LOAD_HOLIDAY":

        $msg = "";
        $hdr = $db->GetDataBySQL("SELECT a.* FROM dbo.sp_holiday_hdr a WHERE a.sp_holiday_hdr_id = ?", array($_REQUEST["sp_holiday_hdr_id"]));

        $begin = new DateTime($hdr["i_year"] . "-01-01");
        $end = new DateTime($hdr["i_year"] . "-12-31");
        $end = $end->modify("+1 day");

        $interval = new DateInterval("P1D");
        $daterange = new DatePeriod($begin, $interval, $end);

        foreach ($daterange as $date) {
            // 6 Saturday,7 Sunday
            if ($date->format("N") == 6 || $date->format("N") == 7) {

                $dtl = $db->GetDataBySQL("SELECT * FROM sp_holiday_dtl where sp_holiday_hdr_id = ? AND d_holiday = CONVERT(DATETIME,'{$date->format("Y-m-d")}',102);", array($_REQUEST["sp_holiday_hdr_id"]));

    
                $data["c_name"] = $date->format("l");
                $data["d_holiday"] = $date->format("Y-m-d");
                $data["i_type"] = 2; // (1 = Manual, 2 = Autometic)
                $data["dc_user_update_id"] = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
                $data["d_update"] = date("Y-m-d H:i:s");

                if (empty($dtl)) {
                    $data["sp_holiday_hdr_id"] = $_REQUEST["sp_holiday_hdr_id"];
                    $data["dc_user_create_id"] = $_SESSION["user_id"];
                    $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
                    $data["d_create"] = date("Y-m-d H:i:s");

                    foreach ($data as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }

                    $sql = "
						SET NOCOUNT ON
						INSERT INTO sp_holiday_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						SELECT @@IDENTITY as id;";

                    $para = $db->QueryParam($sql, $arrValue);
                    $ss_id = $db->Fetch($para);
                    $id = $_REQUEST["sp_holiday_hdr_id"];

                    // ============== //
                    $addField = null;
                    $addValue = null;
                    unset($data);
                    unset($arrValue);
                    // ============== /
                } else {
                    foreach ($data as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fld} = ?";
                    }

                    $arrValue[] = $dtl["sp_holiday_dtl_id"];
                    $sql = "UPDATE sp_holiday_dtl SET " . substr($addField, 1) . " WHERE sp_holiday_dtl_id = ?";
                    $para = $db->QueryParam($sql, $arrValue);
                    $id = $_REQUEST["sp_holiday_hdr_id"];

                    // ============== //
                    $addField = null;
                    $addValue = null;
                    unset($data);
                    unset($arrValue);
                    // ============== /
                }
                $msg = "โหลดรายการเรียบร้อย";
                if (@$para) {
                    $re = array(
                        "success" => true,
                        "id" => $id,
                        "msg" => $msg
                    );
                } else {
                    $re = array(
                        "success" => false,
                        "msg" => $msg
                    );
                }
            }
        }
        break;

    case "DELETE_DTL":

        $db->QueryParam("DELETE dbo.sp_bg_billing_dtl WHERE sp_bg_billing_dtl_id = ?;", array($_REQUEST["id"]));

        $re = array(
            "success" => true,
            "msg" => "ลบรายการเรียบร้อย"
        );

        break;
}
echo json_encode($re);
exit;
