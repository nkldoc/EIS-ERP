<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

if (empty($_SESSION['user_id'])) {
    $msg = "Session หมดอายุ";
    echo json_encode(array(
        "reval" => 1,
        "success" => false,
        "session_expired" => true,
        "msg" => $msg
    ));
    exit;
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
// toDoLog
}

$mode = $_REQUEST["mode"];
////Java Session
//require_once("../../../java/Java.inc");
//$session = procure_java_session();
//$dc_cost_id = java_values($session->get("dc_cost_id"));

$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "PR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;

$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();

//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;

function senMsgRealtime($msgType = 4, $msg = "ข้อความภาษาไทย") {
    $url = "https://eis.nmu.ac.th:8443/procure/websocket/event";

    if (mb_detect_encoding($msg, 'UTF-8', true) === false) {
        $msg = utf8_encode($msg);
    }

    $arrM = array(
        'msgType' => $msgType,
        'msg' => $msg,
        'dc_cost_id' => $_SESSION['dc_cost_id']
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($arrM));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/x-www-form-urlencoded; charset=UTF-8'
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $server_output = curl_exec($ch);

    if (curl_errno($ch)) {
        echo 'Error: ' . curl_error($ch);
    } else {
        echo 'Response: ' . htmlspecialchars($server_output, ENT_QUOTES, 'UTF-8');
    }

    curl_close($ch);
}

switch ($mode) {
    case "UPDATEFORMSPEMP":
        $arrParam[] = $data["sp_emp_id"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];
        // items insert
        $arrParam[] = $data["id"];
        $arrParam[] = $data["sp_emp_id"];
        $arrParam[] = 13; // hardCode 'ST0004'
        $arrParam[] = $db->GetDataBySQL("select count(*) from dbo.sp_tor_emp where sp_tor_id=?", array($data["id"])); //i_chg_count
        $arrParam[] = 1;  // i_is_active
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $count = $db->GetDataBySQL("select count(*) from dbo.sp_tor_emp where sp_tor_id=?", array($data["id"]));
        $stmt2 = $db->QueryParam("UPDATE dbo.sp_tor_emp SET i_is_active=? WHERE sp_tor_id=?", array(null, $data["id"]));
        $sql = "   UPDATE {$table}
                    SET sp_emp_id = ?
                        , c_comment = ?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                    WHERE {$keyName} = ?;"
                . " insert into dbo.sp_tor_emp (sp_tor_id
                        , sp_emp_id
                        , sp_status_hdr_id
                        , i_chg_count
                        , i_is_active
                        , c_comment
                        , dc_user_create_id
                        , dc_user_create_cost_id
                        , d_create) values (? ,? ,? ,? ,? ,? ,? ,? ,? );";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "REBACKSTEP":

        if ($data['menu_no'] == 0) {
            $arrParam[] = $data["c_comment"];
            $arrParam[] = 24;
            $arrParam[] = 4;

            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
        } else if ($data['menu_no'] == 3) {
            $arrParam[] = $data["c_comment"];
            $arrParam[] = 24;
            $arrParam[] = 4;

            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
        } else if ($data['menu_no'] == 4) {
            $arrParam[] = $data["c_comment"];
            $arrParam[] = 24;
            $arrParam[] = 4;

            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
        }



        $arrParam[] = $data["id"];
        $sql = "";
        $sql .= "UPDATE sp_tor SET c_comment  = ? ,tor_status_id  = ?, i_edit  = ?
                        , i_is_register = 0
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ? WHERE tor_id = ?;";

        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "BACKSTEP":
        if ($data['tor_status_id'] == 13) {

            $arrParam[] = $data["c_comment"];
            $arrParam[] = 13;
            $arrParam[] = 3;
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["id"];
        } elseif ($data['tor_status_id'] == 24) {

            $arrParam[] = $data["c_comment"];
            $arrParam[] = 24;
            $arrParam[] = 2;
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["id"];
        }

        $sql = "";
        //        $sql .= "UPDATE sp_tor_item SET c_comment  = ?, dc_user_update_id = ?
        //                        , dc_user_update_cost_id = ?
        //                        , d_update = ? WHERE tor_id = ? AND sp_status_hdr_id = ?;";

        $sql .= "UPDATE sp_tor SET c_comment  = ?
                        , tor_status_id  = ?
                        , i_edit  = ?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?

                        WHERE tor_id = ?;";

        $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "UPDATEFORMSTSATUS003":

        $arrParam[] = $data["dc_cnt_id"] ?? NULL;
        $arrParam[] = $data["sp_emp_id"] ?? NULL;
        $arrParam[] = $data["c_comment"];

        $arrParam[] = $date->bc_to_ad($data['d_tor_status_date']) . " " . date('H:i:s');
        $arrParam[] = $date->bc_to_ad($data['DateAdd1']) . " " . date('H:i:s');
        $arrParam[] = $date->bc_to_ad($data['DateAdd2']) . " " . date('H:i:s');
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];

        $arrParam[] = $data["id"];
        $arrParam[] = $data["sp_emp_id"];
        $arrParam[] = 24; //hardCode 'ST0003'
        $arrParam[] = 1;
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $sql = "UPDATE {$table}
                    SET dc_cnt_id = ?
                        , sp_emp_id = ?
                        , c_comment = ?
                        , d_tor_status_date=?
                        , d_tor_date_alert=?
                        , d_tor_date_pa=?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                        , i_is_register = 1
                WHERE {$keyName} = ?"
                . " insert into dbo.sp_tor_emp (sp_tor_id
                        , sp_emp_id
                        , sp_status_hdr_id
                        , i_is_active
                        , c_comment
                        , dc_user_create_id
                        , dc_user_create_cost_id
                        , d_create) values (? ,? ,? ,? ,? ,? ,? ,? ); ";

        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UP_EXPENSE_BUDGET":
        // print_r($data);
        // exit() ;
        $arrParam[] = $data["po_expense_id"];
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["tor_id"];
        $sql = "UPDATE sp_tor
                SET po_expense_id = ?
                    , dc_expense_budget_type_id = ?
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                    WHERE tor_id = ? ; ";

        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UP_EXPENSE_BUDGET_CHECKING":

        $arrParam[] = $data["po_expense_id"];
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["tor_id"];

        $arrParam[] = $data["po_expense_id"];
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_tor_id"];

        $arrParam[] = $data["po_expense_id"];
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_tor_dtl_period_id"];

        $arrParam[] = $data["po_expense_id"] ?? NULL;
        $arrParam[] = $data["dc_expense_budget_type_id"] ?? NULL;
        $arrParam[] = $data["dc_user_update_id"] ?? NULL;
        $arrParam[] = $data["dc_user_update_cost_id"] ?? NULL;
        $arrParam[] = $data["d_update"] ?? NULL;
        $arrParam[] = $data["sp_check_period_dtl_id"] ?? NULL;

        $arrParam[] = $data["dc_expense_budget_type_id"] ?? NULL;
        $arrParam[] = $data["sp_tor_hdr_period_id"] ?? NULL;
        $sql = "UPDATE sp_tor
                    SET po_expense_id = ?
                    , dc_expense_budget_type_id = ?
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                    WHERE tor_id = ? ;

                UPDATE sp_tor_dtl
                    SET po_expense_id = ?
                    , dc_bg_budget_type_id = ?
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                    WHERE sp_tor_id = ?

                UPDATE sp_tor_dtl_period
                    SET po_expense_id = ?
                    , dc_bg_budget_type_id = ?
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                    WHERE sp_tor_dtl_period_id = ? ;

                UPDATE sp_check_period_dtl
                    SET po_expense_id = ?
                    , dc_bg_budget_type_id = ?
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                    WHERE sp_check_period_dtl_id = ? ;

                UPDATE sp_tor_hdr_period
                    SET dc_expense_budget_type_id = ?
                    WHERE sp_tor_hdr_period_id = ? ;
                    ";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UP_EXPENSE_BUDGET_PROJECT":

        $arrParam[] = $data["sp_tor_pro_id"];
        $arrParam[] = $data["sp_tor_contract_pro_id"];
        $arrParam[] = $data["po_expense_id"];
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date('Y-m-d H:i:s');
        $sql = "    DECLARE @sp_tor_id BIGINT = ?
                        DECLARE @sp_tor_contract_pro_id BIGINT = ?
                        DECLARE @po_expense_id BIGINT = ?
                        DECLARE @dc_expense_budget_type_id BIGINT = ?
                        DECLARE @dc_user_id BIGINT = ?
                        DECLARE @dc_cost_id BIGINT = ?
                        DECLARE @d_update DATETIME  = ?

                            UPDATE dbo.sp_tor
                            SET  po_expense_id = @po_expense_id
                            , dc_expense_budget_type_id = @dc_expense_budget_type_id
                            , d_update = @d_update
                            , dc_user_update_id = @dc_user_id
                            , dc_user_update_cost_id =@dc_cost_id
                            WHERE tor_id = @sp_tor_id

                            UPDATE dbo.sp_tor_dtl
                            SET po_expense_id = @po_expense_id
                            , dc_bg_budget_type_id = @dc_expense_budget_type_id
                            , d_update = @d_update
                            , dc_user_update_id = @dc_user_id
                            , dc_user_update_cost_id =@dc_cost_id
                            WHERE sp_tor_id = @sp_tor_id

                            UPDATE dbo.sp_tor_hdr_period
                            SET dc_expense_budget_type_id = @dc_expense_budget_type_id
                            , d_update = @d_update
                            , dc_user_update_id = @dc_user_id
                            , dc_user_update_cost_id =@dc_cost_id
                            WHERE sp_tor_contract_id = @sp_tor_contract_pro_id

                            UPDATE dbo.sp_tor_dtl_period
                            SET po_expense_id = @po_expense_id
                            , dc_bg_budget_type_id = @dc_expense_budget_type_id
                            , d_update = @d_update
                            , dc_user_update_id = @dc_user_id
                            , dc_user_update_cost_id =@dc_cost_id
                            WHERE sp_tor_id = @sp_tor_id
                        ";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UPDATEFORMSTSATUS":

        $arrParam[] = $data["dc_cnt_id"] ?? NULL;
        $arrParam[] = $data["sp_emp_id"] ?? NULL;
        $arrParam[] = $data["c_name"] ?? NULL;
        $arrParam[] = $data["i_yyyy"] ?? NULL;
        $arrParam[] = $data["i_yyyy"] ?? NULL;
        $arrParam[] = $data["dc_expense_budget_type_id"] ?? NULL;
        $arrParam[] = $data["po_expense_id"] ?? null;
        $arrParam[] = $data["dc_cost_id"] ?? null;
        $arrParam[] = $data["dc_cost2_id"] ?? null;
        $arrParam[] = $data["txtsub_cost"] ?? null;
        $arrParam[] = $data["d_tor_date"] ?? null;
        $arrParam[] = $data["tor_type_id"] ?? null;
        $arrParam[] = $data["d_doc_ref"] ?? null;
        $arrParam[] = $data["dc_department_id"] ?? null;
        //       $arrParam[] = $data["d_doc_date"] ?? null;
        $register = $_REQUEST["i_is_register"] ?? null;
        $data["i_is_register"] = ($register == null) ? 1 : $data["i_is_register"];
        if ($data["i_is_register"] == 1) {
            $i_register1 = 1;
        } else if ($data["i_is_register"] == 2) {
            $i_register1 = 2;
        } else if ($data["i_is_register"] == 3) {
            $i_register1 = 3;
        } else if ($data["i_is_register"] == 0) {
            $i_register1 = 0;
        } else {
            $i_register1 = 1;
        }   // ถ้า i_is_register  = 3 เปิดใช้ตัวนี้
        // $i_register1 = @$data["i_is_register"] == 2 ? 2 : 1;
        $arrParam[] = $data["c_comment"] ?? null;
        $arrParam[] = $f_total_amt;

        // สำหรับธรุการ  ไม่คิด pa
        if ((!empty($data['DateAdd1'])) and (empty($data['DateAdd2']))) { //first menu
            $case = 1;
            //$count = 0;//$db->GetDataBySQL("select count(*) from dbo.sp_tor where isnull(index_receive,0) != ? and tor_id != ?", array(0, $data["id"]));
            $arrParam2[] = $data["d_tor_date"] ?? null;
            $arrParam2[] = $data["c_comment"] ?? null;
            $arrParam2[] = $data['index_receive'] ?? null; //== 0 ? intVal($count + 1) : $data['index_receive'];
            //$arrParam2[] = empty($data['d_tor_status_date']) ? date('Y-m-d H:i:s') : $date->bc_to_ad($data['d_tor_status_date']) . " " . date('H:i:s');
            $arrParam2[] = $date->bc_to_ad($data['DateAdd1']) . " " . date('H:i:s');
            $arrParam2[] = $data["dc_user_update_id"];
            $arrParam2[] = $data["dc_user_update_cost_id"];
            $arrParam2[] = $data["d_update"];

            $sql = "UPDATE {$table}
                  SET d_doc_date = ?
                        , c_comment = ?
                        --, i_is_inv = ?
                        , index_receive = ?
                        , i_is_register = {$i_register1}
                       , d_tor_date_alert=?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                    WHERE {$keyName} = ?";
            $arrParam2[] = $data["id"];
            $stmt = $db->QueryParam($sql, $arrParam2);
        } else if ((empty($data['DateAdd1'])) and (!empty($data['DateAdd2']))) { //sec menu
            $case = 2;

            $arrParam[] = empty($data['d_tor_status_date']) ? date('Y-m-d H:i:s') : $date->bc_to_ad($data['d_tor_status_date']) . " " . date('H:i:s');
            $arrParam[] = $date->bc_to_ad($data['DateAdd2']) . " " . date('H:i:s');
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $sql = "UPDATE {$table}
                    SET dc_cnt_id = ?
                        , sp_emp_id = ?
                        , c_name = ?
                        , i_yyyy = ?
                        , i_pr_year = ?
                        , dc_expense_budget_type_id = ?
                        , po_expense_id = ?
                        , dc_cost_id = ?
                        , txtsub_cost = ?
                        , d_tor_date = ?
                        , tor_type_id   = ?
                        , d_doc_ref = ?
                        -- , i_type_bg = ?
                        , dc_department_id = ?
                        , i_is_register = {$i_register1}
                        , c_comment = ?
                        , index_receive = ?
                        , d_tor_status_date=?
                        , d_tor_date_pa=?
                        , i_is_inv=?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                    WHERE {$keyName} = ?";
            $arrParam[] = $data["id"];
            $stmt = $db->QueryParam($sql, $arrParam);
        } else if ((!empty($data['DateAdd1'])) and (!empty($data['DateAdd2']))) { //else menu
            $i_purchase = $data['i_purchase'] ?? null;
            if ($i_purchase == 1) {
                $arrParam[] = $data['i_purchase'] ?? 0;
                $arrParam[] = $data['i_type_contract'] ?? 0;
                $arrParam[] = $data['i_product_type'] ?? 0;
                $arrParam[] = $data['i_is_inv'] ?? 0;
            } else if ($i_purchase == 2) {
                $arrParam[] = $data['i_purchase'] ?? 0;
                $arrParam[] = $data['i_type_contract'] ?? 0;
                $arrParam[] = $data['i_product_type'] ?? 0;
                $arrParam[] = $data['i_is_inv'] ?? 0;
            } else if ($i_purchase == 3) {
                $arrParam[] = $data['i_purchase'] ?? 0;
                $arrParam[] = $data['i_type_contract'] ?? 0;
                $arrParam[] = $data['i_product_type'] ?? 0;
                $arrParam[] = $data['i_is_inv'] ?? 0;
                //$arrParam[] = 0;
                //$arrParam[] = 0;
            }

            $case = 3;
            $c_menu = $data['c_menu'] ?? null;
            if ($c_menu == 'signContract') {

                $i_po = ($data['i_type_contract'] == 3) ? " , i_type_fix_rate = 1" : " , i_type_fix_rate = null ";
                $change = ", i_purchase = ?
                        , i_type_contract = ?
                        , i_product_type = ?
                        , i_is_inv = ?";
            } else if ($c_menu == 'st0004') {
                $i_po = "";
                $change = ", i_purchase = ?
                        , i_type_contract = ?
                        , i_product_type = ?
                        , i_is_inv = ?";
            } else {
                $i_po = "";
                $change = "";
            }


            $arrParam[] = empty($data['d_tor_status_date']) ? date('Y-m-d H:i:s') : $date->bc_to_ad($data['d_tor_status_date']) . " " . date('H:i:s');
            $arrParam[] = $date->bc_to_ad($data['DateAdd1']) . " " . date('H:i:s');
            $arrParam[] = $date->bc_to_ad($data['DateAdd2']) . " " . date('H:i:s');
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $i_type_bg = $db->GetDataBySQL("select i_type_bg from sp_tor where tor_id =" . $data["id"], array($data["id"]));
            $arrParam[] = $data["i_type_bg"] ?? $i_type_bg;
            $d_egp_date = "";
            if (!empty($data['d_egp_date'])) {
                $degpdate = $date->bc_to_ad($data['d_egp_date']);
                $d_egp_date = ", d_egp_date='$degpdate'";
            }
            $sql = "UPDATE {$table}
                    SET dc_cnt_id = ?
                        , sp_emp_id = ?
                        , c_name = ?
                        , i_yyyy = ?
                        , i_pr_year = ?
                        , dc_expense_budget_type_id = ?
                        , po_expense_id = ?
                        , dc_cost_id = ?
                        , dc_cost2_id = ?
                        , txtsub_cost = ?
                        , d_tor_date =  ?
                        , tor_type_id = ?
                        ,  d_doc_ref = ?
                        , dc_department_id = ?
                        , i_is_register = {$i_register1}
                        , c_comment = ?
                        , f_total_amt = ?
                        {$i_po}
                        {$change}
                        , d_tor_status_date=?
                        , d_tor_date_alert=?
                        , d_tor_date_pa=?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                        , i_type_bg = ?
                        {$d_egp_date}
                    WHERE {$keyName} = ?";
            $arrParam[] = $data["id"];
            $stmt = $db->QueryParam($sql, $arrParam);
        }
        break;
    case "UPDATEFORMSTSATUSST0001.1":
        // exit();
        // print_r($data);
        // exit();
        // $arrParam[] = $data["d_tor_date"] ?? null;
        //       $arrParam[] = $data["d_doc_date"] ?? null;
        // $i_type_bg = $db->GetDataBySQL("select i_type_bg from sp_tor where tor_id =".$data["id"], array($data["id"]));
        // $arrParam[] = $data["i_type_bg"] ?? $i_type_bg ;
        // $d_egp_date = "";
        //  if ((!empty($data['DateAdd1'])) and (!empty($data['DateAdd2']))) { //else menu
        // {$i_po}
        // {$change}
        // echo(date('Y-m-d H:i:s'));
        // exit;
        $arrParam[] = $data["sp_emp_id"] ?? NULL;
        $arrParam[] = $data["i_amount_bg"] ?? NULL;
        $arrParam[] = $data["c_name"] ?? NULL;
        $arrParam[] = $data["i_yyyy"] ?? NULL;
        $arrParam[] = $data["i_yyyy"] ?? NULL;
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $data["dc_expense_budget_type2_id"] ?? NULL;
        $arrParam[] = $data["dc_expense_budget_type3_id"] ?? NULL;
        $arrParam[] = $data["i_pr_type1"] ?? NULL;
        $arrParam[] = $data["i_pr_type2"] ?? NULL;
        $arrParam[] = $data["i_pr_type3"] ?? NULL;
        $arrParam[] = !empty($data["f_type_amt"]) ? str_replace(',', '', $data["f_type_amt"]) : 0;
        $arrParam[] = !empty($data["f_type2_amt"]) ? str_replace(',', '', $data["f_type2_amt"]) : 0;
        $arrParam[] = !empty($data["f_type3_amt"]) ? str_replace(',', '', $data["f_type3_amt"]) : 0;
        // $arrParam[] = str_replace(",", "", $data["f_type_amt"] ?? null);
        // $arrParam[] = str_replace(",", "", $data["f_type2_amt"] ?? null);
        // $arrParam[] = str_replace(",", "", $data["f_type3_amt"] ?? null);
        // print_r($arrParam);
        // exit ;
        // $arrParam[] = $data["f_type_amt2"] ?? NULL;
        // $arrParam[] = $data["f_type_amt3"] ?? NULL;
        $arrParam[] = $data["po_expense_id"] ?? null;
        $arrParam[] = $data["dc_cost_id"] ?? null;
        $arrParam[] = $data["dc_cost2_id"] ?? null;
        $arrParam[] = $data["txtsub_cost"] ?? null;
        $arrParam[] = $data["tor_type_id"] ?? null;
        $arrParam[] = $data["d_doc_ref"] ?? null;
        $arrParam[] = $data["dc_department_id"] ?? NULL;
        $arrParam[] = $data["i_is_register"] ?? null;
        $arrParam[] = $data["i_type_bg"] ?? null;

        $arrParam[] = $data["c_comment"] ?? null;
        $arrParam[] = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;
        // $arrParam[] = empty($data['d_tor_status_date']) ? date('Y-m-d H:i:s') : $date->bc_to_ad($data['d_tor_status_date']) . " " . date('H:i:s');
        // $arrParam[] = $date->bc_to_ad(date('Y-m-d H:i:s'));
        $arrParam[] = date('Y-m-d H:i:s');
        // echo(date('Y-m-d H:i:s'));
        // exit ;
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];

        $sql = "UPDATE {$table}
                    SET   sp_emp_id = ?
                        , i_amount_bg = ?
                        , c_name = ?
                        , i_yyyy = ?
                        , i_pr_year = ?
                        , dc_expense_budget_type_id = ?
                        , dc_expense_budget_type2_id = ?
                        , dc_expense_budget_type3_id = ?
                        , i_pr_type1 = ?
                        , i_pr_type2 = ?
                        , i_pr_type3 = ?
                        , f_type_amt = ?
                        , f_type2_amt = ?
                        , f_type3_amt = ?
                        , po_expense_id = ?
                        , dc_cost_id = ?
                        , dc_cost2_id = ?
                        , txtsub_cost = ?
                        , tor_type_id = ?
                        ,  d_doc_ref = ?
                        , dc_department_id = ?
                        , i_is_register = ?
                        , i_type_bg = ?
                        , c_comment = ?
                        , f_total_amt = ?

                        , d_tor_status_date=?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                    WHERE {$keyName} = ?";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UPDATEDIT_TOR":
        // exit;
        $sp_tor_id = $_REQUEST['id'];
        $d_date = date("Y-m-d H:i:s");
        $sp_emp_id = $_SESSION['sp_emp_id'];
        $dc_cost_id = $_SESSION['dc_cost_id'];
        $sp_status_hdr_id = " not in (25,26,24,13)";
        $DateEdit_tor = $_REQUEST['DateAdd2'];
        $tor_type_id = $_REQUEST['tor_type_id'] ?? null; // วิธีการดำเนินงาน
        $arr = $db->GetDataBySQL("SELECT TOP 1 i_entrance, c_code,i_seq,sp_status_hdr_id
            FROM dbo.sp_status_hdr WHERE i_entrance=2 AND i_seq=1 AND sp_type_status_id=?", array($tor_type_id));
        // print_r($data["d_update"]);
        // exit;
        //  upItemsStatus
        $arrParam[] = $arr["sp_status_hdr_id"];
        $arrParam[] = $arr["i_seq"];
        $arrParam[] = 1;
        $arrParam[] = 0;
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $i_backword = $data["i_backword"] ?? null;
        $c_comment = $data["c_comment"] ?? null;

        $arrParam[] = $data["id"]; //tor_id
        $arrParam[] = $data["id"]; //tor_id
        $arrParam[] = $data["contract_id"] ?? null;
        $arrParam[] = $arr["sp_status_hdr_id"];

        $arrParam[] = ($i_backword == null) ? 1 : 0; //forword
        $arrParam[] = ($i_backword != null) ? 1 : 0; //backword
        $arrParam[] = $c_comment ?? null;
        $arri_seq = $arr["i_seq"] ?? null;
        $datai_seq = $data["i_seq"] ?? null;
        $arrParam[] = ($i_backword == null ? ($datai_seq) : $arri_seq); //i_seq รับจาก arr database + 1 ถ้า backword รับจาก request
        // $arrParam[] = $data["d_update"];

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $d_update = $date->bc_to_ad($data['DateAdd2']);
        $d_update_time = "('" . $d_update . " " . date("H:i:s") . "')";

        // echo($d_update_time);
        // echo($d_date);
        // exit;
        $sql = " --add item
                INSERT INTO sp_tor_item_cancel
                        (tor_id
                        ,sp_tor_hdr_period_id
                        ,contract_id
                        ,sp_status_hdr_id
                        ,i_forword
                        ,i_backword
                        ,c_comment
                        ,i_step
                        ,i_wait
                        ,d_period_status_date
                        ,d_tor_status_date
                        ,act_cost_id
                        ,act_user_id
                        ,act_date_dt
                        ,i_is_status
                        ,d_interrupteddate
                        ,c_interrupted
                        ,d_tor_before_status_date
                        ,i_contract_status
                        ,d_contract_status_date
                        ,d_contract_before_status_date
                        ,d_sent_date
                        ,sp_check_period_hdr_id
                        ,sp_withdraw_id
                        ,d_tor_item_delete
                        ,sp_tor_item_user_delete
                        ,sp_tor_item_cost_delete)
                    SELECT
                        tor_id
                        ,sp_tor_hdr_period_id
                        ,contract_id
                        ,sp_status_hdr_id
                        ,i_forword
                        ,i_backword
                        ,c_comment
                        ,i_step
                        ,i_wait
                        ,d_period_status_date
                        ,d_tor_status_date
                        ,act_cost_id
                        ,act_user_id
                        ,act_date_dt
                        ,i_is_status
                        ,d_interrupteddate
                        ,c_interrupted
                        ,d_tor_before_status_date
                        ,i_contract_status
                        ,d_contract_status_date
                        ,d_contract_before_status_date
                        ,d_sent_date
                        ,sp_check_period_hdr_id
                        ,sp_withdraw_id
                        ,'{$d_date}'
                        ,{$sp_emp_id}
                        ,{$dc_cost_id}
                    FROM sp_tor_item
                    WHERE tor_id = {$sp_tor_id}
                    AND sp_status_hdr_id  {$sp_status_hdr_id}   ;

                    -- ลบitem
                    DELETE FROM sp_tor_item
                    where  tor_id = {$sp_tor_id}
                    and sp_status_hdr_id  {$sp_status_hdr_id};

                    --update item 13
                    --UPDATE sp_tor_item
                    --SET d_sent_date = $DateEdit_tor
                    --WHERE  sp_status_hdr_id = 13 and tor_id =  {$sp_tor_id} ;
                    UPDATE dbo.sp_tor_item set d_sent_date ='{$d_update}'
                    where tor_id ={$data['id']} and  sp_status_hdr_id = 13 ;

                    --update tor_table
                    UPDATE {$table}
                    SET tor_status_id = ?
                        , i_step=?
                        , i_forword = ?
                        , i_backword = ?
                        , d_tor_status_date =  ?
                        , i_is_register = 0
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                    WHERE {$keyName} = ? ;

                    -- insert table sp_tor_item
                    INSERT INTO dbo.sp_tor_item (
                        tor_id
                        , contract_id
                        , sp_status_hdr_id
                        , i_forword
                        , i_backword
                        , c_comment
                        , i_step
                        , d_tor_status_date
                        , act_user_id
                        , act_cost_id
                        , act_date_dt
                        , d_tor_before_status_date)
                    VALUES (
                        ?
                        , ?
                        , ?
                        , ?
                        , ?
                        , ?
                        , ?
                        , {$d_update_time}
                        , ?
                        , ?
                        , ?
                        , (SELECT d_tor_status_date FROM sp_tor_item WHERE tor_id = {$data["id"]}
                                AND sp_status_hdr_id = (
                                    SELECT CASE WHEN i_entry = 1 THEN
                                                (
                                                    CASE
                                                        WHEN (SELECT tor_type_id FROM sp_tor WHERE tor_id = {$data["id"]}) = 4 THEN 19 --e-bidding
                                                        WHEN (SELECT tor_type_id FROM sp_tor WHERE tor_id = {$data["id"]}) = 3 THEN 12 --คัดเลือก
                                                        WHEN (SELECT tor_type_id FROM sp_tor WHERE tor_id = {$data["id"]}) = 1 THEN 23 --เจาะจง
                                                        WHEN (SELECT tor_type_id FROM sp_tor WHERE tor_id = {$data["id"]}) = 2 THEN 31 --e-market
                                                    END
                                                )
                                            ELSE i_before
                                        END
                                    FROM sp_status_hdr aa
                                    WHERE aa.sp_status_hdr_id = {$arr["sp_status_hdr_id"]})
                                )
                    ) ;



                    ";
        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);

        $stmt = upPA($data, $arr, $db);
        $stmt2 = upAlert($data, $arr, $db);
        // $stmt3 = upItemsStatus($data, $arr, $db); //else

        break;
    case "UPDATE_OVERLAP2":
        $arrParam[] = $data["c_name"] ?? NULL;
        $arrParam[] = $data["i_year"] ?? NULL;
        $arrParam[] = $data["dc_expense_budget_type_id"] ?? NULL;
        $arrParam[] = $data["po_expense_id"] ?? null;
        $arrParam[] = $data["dc_cost_id"] ?? null;
        $arrParam[] = $data["dc_cost2_id"] ?? null;
        $arrParam[] = $data["d_tor_date"] ?? null;
        $arrParam[] = $data["tor_type_id"] ?? null;
        $arrParam[] = $data["d_doc_ref"] ?? null;
        $arrParam[] = $data["dc_department_id"] ?? NULL;
        $arrParam[] = $data["c_comment"] ?? NULL;
        $arrParam[] = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["i_is_overlap"];
        $arrParam[] = $data["i_type_bg"];
        $arrParam[] = $data["confirm_overlap"];
        $arrParam[] = $data["id"];

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_tor_contract_id"];

        $sql = "UPDATE {$table}
                    SET
                        c_name = ?
                        , i_yyyy = ?
                        , dc_expense_budget_type_id = ?
                        , po_expense_id = ?
                        , dc_cost_id = ?
                        , dc_cost2_id = ?
                        , d_tor_date =  ?
                        , tor_type_id = ?
                        ,  d_doc_ref = ?
                        , dc_department_id = ?
                        , c_comment = ?
                        , f_total_amt = ?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                        , i_is_overlap = ?
                        , i_type_bg =  ?
                        , confirm_overlap = ?
                    WHERE {$keyName} = ?

                UPDATE sp_tor_contract
                    SET
                        dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                        , i_overlap = 3
                    WHERE sp_tor_contract_id = ?





                    ";
        // $arrParam[] = $data["id"];
        // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        /*         * ***************** */
        $stmt = $db->QueryParam($sql, $arrParam);

        //        print_r($data);
        //        exit();
        break;
    case "UPDATE_OVERLAP":
        // $arrParam[] = $data["c_name"] ?? NULL;
        $arrParam[] = $data["i_year"] ?? NULL;
        // $arrParam[] = $data["dc_expense_budget_type_id"] ?? NULL;
        // $arrParam[] = $data["po_expense_id"] ?? null;
        // $arrParam[] = $data["dc_cost_id"] ?? null;
        // $arrParam[] = $data["dc_cost2_id"] ?? null;
        // $arrParam[] = $data["d_tor_date"] ?? null;
        // $arrParam[] = $data["tor_type_id"] ?? null;
        // $arrParam[] = $data["d_doc_ref"] ?? null;
        // $arrParam[] = $data["dc_department_id"] ?? NULL;
        $arrParam[] = $data["c_comment"] ?? NULL;
        // $arrParam[] = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["i_is_overlap"];
        $arrParam[] = $data["i_type_bg"];
        $arrParam[] = $data["confirm_overlap"];
        $arrParam[] = $data["id"];

        $sql = "UPDATE {$table}
                            SET
                                -- c_name = ?
                                 i_yyyy = ?
                                -- , dc_expense_budget_type_id = ?
                                -- , po_expense_id = ?
                                -- , dc_cost_id = ?
                                -- , dc_cost2_id = ?
                                -- , d_tor_date =  ?
                                -- , tor_type_id = ?
                                -- ,  d_doc_ref = ?
                                --, dc_department_id = ?
                                , c_comment = ?
                                -- , f_total_amt = ?
                                , dc_user_update_id = ?
                                , dc_user_update_cost_id = ?
                                , d_update = ?
                                , i_is_overlap = ?
                                , i_type_bg =  ?
                                , confirm_overlap = ?
                            WHERE {$keyName} = ?";
        // $arrParam[] = $data["id"];
        // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        /*         * ***************** */
        $stmt = $db->QueryParam($sql, $arrParam);

        //        print_r($data);
        //        exit();
        break;
    case "UPDATENEXTSTEP":
        // define("IPBOOK", "localhost");
        // แจ้งเตือนผ่านไลน์
        if ($_REQUEST['tor_status_id'] == 10060) {
            $str = "";
            $tor_id = $data["id"];
            $arrValue = array();
            $add_value = array();
            $pr_id = $db->GetDataBySQL("SELECT
                tor_id
                ,24 as dc_unit_type_id
                , c_name
                ,1 as i_qty
                ,dc_expense_budget_type_id
                ,dc_expense_budget_type2_id
                ,dc_expense_budget_type3_id
                ,bg_reserve_money1_id
                ,bg_reserve_money2_id
                ,bg_reserve_money3_id
                ,i_pr_type1
                ,i_pr_type2
                ,i_pr_type3
                ,po_expense_id
                ,i_hire_type
                ,i_product_type
                ,isnull(i_is_inv,0) as i_is_inv
                ,f_type_amt as pr_type_amt
                ,f_type_amt
                ,f_type2_amt
                ,f_type3_amt
                , dc_user_create_id
                ,dc_user_create_cost_id
                ,CONVERT(varchar,GETDATE(),120)  as d_create
                ,dc_user_update_id
                ,dc_user_update_cost_id
                ,dc_user_update_department_id
                ,CONVERT(varchar,GETDATE(),120) as  d_update
                FROM dbo.sp_tor a  WHERE a.tor_id=?", array($tor_id));
            $str = "";
            $add_value = "";
            for ($x = 1; $x <= $data["i_amount_bg"]; $x++) {

                $key = $x == 1 ? null : $x;
                $str = "   select
                        '{$pr_id["tor_id"]}'
                        , '{$pr_id["dc_unit_type_id"]}'
                        , '{$pr_id["c_name"]}'
                        , '{$pr_id["i_qty"]}'
                        , '{$pr_id["dc_expense_budget_type{$key}_id"]}'
                        , '{$pr_id["bg_reserve_money{$x}_id"]}'
                        , '{$pr_id["i_pr_type$x"]}'
                        , '{$pr_id["po_expense_id"]}'
                        , '{$pr_id["i_hire_type"]}'
                        , '{$pr_id["i_product_type"]}'
                        , '{$pr_id["i_is_inv"]}'
                        , '{$pr_id["f_type{$key}_amt"]}'
                        , '{$pr_id["f_type{$key}_amt"]}'
                        , '{$pr_id["dc_user_create_id"]}'
                        , '{$pr_id["dc_user_create_cost_id"]}'
                        , '{$pr_id["d_create"]}'
                        , '{$pr_id["dc_user_update_id"]}'
                        , '{$pr_id["dc_user_update_cost_id"]}'
                        , '{$pr_id["dc_user_update_department_id"]}'
                        , '{$pr_id["d_update"]}'
                        from sp_tor where tor_id = {$tor_id}   ";
                // echo $str;
                $add_value = substr($str, 1);

                $sql = "INSERT INTO  sp_tor_dtl  (
                    sp_tor_id
                    ,dc_unit_type_id
                    ,c_name
                    ,i_qty
                    ,dc_bg_budget_type_id
                    ,bg_reserve_money_id
                    ,i_pr_type1
                    ,po_expense_id
                    ,i_hire_type
                    ,i_product_type
                    ,i_is_inv
                    ,f_unit_price
                    ,f_net_total_price
                    ,dc_user_create_id
                    ,dc_user_create_cost_id
                    ,d_create
                    ,dc_user_update_id
                    ,dc_user_update_cost_id
                    ,dc_user_update_department_id
                    ,d_update
                    )
                    {$add_value} ;
                    ";
                $para = $db->QueryParam($sql, array($tor_id));
                $ss_id = $db->Fetch($para);
                unset($add_value);
                unset($arrValue);
            }
        }
        // if ($_REQUEST['tor_status_id'] == "13") {
        //     //อัพเดท ไว้เพื่อต้องการรับรู้ว่าเป็นเงินอุดหนุนที่ยังไม่ได้จอง
        //     if(($_REQUEST['dc_expense_budget_type_id'] == 4 && $_REQUEST['i_type_bg'] ==  1)   || ($_REQUEST['dc_expense_budget_type_id'] == 5 && $_REQUEST['i_type_bg'] ==  1)) {
        //             $arr = $db->GetDataBySQL("update sp_tor set i_period_bg = 1 , i_is_request = 3   WHERE tor_id = ?", array($data["id"]));
        //     }
        //     $c_code = $db->GetDataBySQL("SELECT  a.c_code,(select c_name from sp_emp where sp_emp_id=a.sp_emp_id)as sp_emp_name
        //                                 , a.f_total_amt AS a_total_amt
        //                                 , a.c_name AS a_name
        //                                 , (select c_name from dc_expense_budget_type where dc_expense_budget_type_id = a.dc_expense_budget_type_id) as expense_budget_type
        //                                 FROM dbo.sp_tor a  WHERE a.tor_id=?", array($data["id"]));
        //     if ($_REQUEST ['menuback'] == '' && IPBOOK != 'localhost' && $_REQUEST ['i_type_bg'] == 1 ) {
        //         $reMsg = lineNotif("ฝ่ายจัดสรรผ่านรายการแล้ว " ."\n"
        //                 . "เลขที่ PR : " . $c_code["c_code"] ."\n"
        //                 . "แหล่งเงิน : " .$c_code["expense_budget_type"]  ."\n"
        //                 . "เรื่อง : " . $c_code["a_name"]  ."\n"
        //                 . "จำนวนเงิน : ". number_format($c_code["a_total_amt"], 2)   ."\n"
        //                 . "ผู้รับผิดชอบงาน " . $c_code["sp_emp_name"]);
        //     }
        // }
        /* else if ($_REQUEST['step']== "BACKSTEP1"){
          $reMsg = lineNotif("แก้ไขแล้วส่งสายงานเบิก".$cComment);
          } */
        //แจ้งเตือนผ่านไลน์  เก่า



        $i_edit = $_REQUEST['i_edit'] ?? null; //1 ทางแยก 2 ทางร่วม
        $i_entrance = $_REQUEST['i_entrance'] ?? null; //1 ทางแยก 2 ทางร่วม
        $tor_type_id = $_REQUEST['tor_type_id'] ?? null; // วิธีการดำเนินงาน
        $i_is_more = $_REQUEST['i_is_more'] ?? null; //
        $i_more = ($i_is_more == 1) ? 2 : 1; //เจาะจง 2 i_is_more = 1 มากว่า 5 แสน i_seq ในค่า config
        $case = 0;
        // NMU_ERP.dbo.sp_tor_pa_item  upPA
        if ($i_entrance == 1) { //  เมนูตรวจสอบเอกสาร post +1
            $arr = $db->GetDataBySQL("SELECT TOP 1 i_entrance, c_code,i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE i_entrance=2 AND i_seq=1 AND sp_type_status_id=?", array($tor_type_id));
        } else if ($i_entrance == 2) { // แสดง TOR ไปตามวิธีดำเนินงาน
            if ($tor_type_id == 1) { //เจาะจง
                if ($i_more == 1) { // มากว่า 500000
                    $case = 1;
                    $arr = $db->GetDataBySQL("SELECT TOP 1 i_entrance, c_code,i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE i_entrance=3 AND i_seq=2 AND sp_type_status_id=?", array($tor_type_id));
                } else { //เจาะจง แบบ 2
                    $case = 2;
                    $arr = $db->GetDataBySQL("SELECT TOP 1 i_entrance, c_code,i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE i_entrance=3 AND i_seq=3 AND sp_type_status_id=?", array($tor_type_id));
                }
            } else { //e-bidding or คัดเลือก
                $case = 3;
                $arr = $db->GetDataBySQL("SELECT TOP 1 i_entrance, c_code,i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE i_entrance=3 AND i_seq=2 AND sp_type_status_id=?", array($tor_type_id));
            }
        } else if ($i_entrance == 3) { // แสดง TOR ไปตามวิธีดำเนินงาน
            $arr = $db->GetDataBySQL("SELECT TOP 1 i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE c_code=?", array($data["menuCode"]));
        } else {
            $arr = $db->GetDataBySQL("SELECT TOP 1 i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE c_code=?", array($data["menuCode"]));
        }
        if ($data['i_backword'] ?? null) {
            $data["typeItems"] = 4;
            $i_register = 0;
            if ($data['menuback'] == 3) { // ให้รายการอยู่ขึ้นสถานะแก้ไข
                $i_edit = 3; //บันทึก 13, 24 เห็น
                $arr["i_seq"] = 3;
            } else if ($data['menuback'] == 2) {
                $i_edit = 2; //บันทึก 13, 24 , 25 เห็น
                $arr["i_seq"] = 2;
            } else if ($data['menuback'] == 1) {
                $i_edit = 4; //บันทึก 13  , 25 เห็น
                $arr["i_seq"] = 1;
            } else if ($data['menuback'] == 5) {
                $i_register = 1;
                $i_edit = 5; //บันทึก 13  , 25 เห็น
                $arr["i_seq"] = 4;
            } else if ($data['menuback'] == 6) {
                $i_register = 1;
                $i_edit = 6; //บันทึก 13  , 25 เห็น
                $arr["i_seq"] = 4;
            } else if ($data['menuback'] == 4) {
                $i_edit = 5; //
                $arr["i_seq"] = 5;
                $i_register = 1;
            }

            $arrParam[] = $i_edit;
            $arrParam[] = $arr['sp_status_hdr_id'];

            $arrParam[] = $arr["i_seq"];
            $arrParam[] = $data["c_comment"];
            $arrParam[] = 0;
            $arrParam[] = 1;
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $sql = "UPDATE {$table} SET i_edit = ?
                    , i_menu_edit=?
                    , i_step=?
                    , c_comment=?
                    , i_forword = ? , i_backword = ?
                    , d_tor_status_date =?
                    , i_is_register = {$i_register}
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                WHERE {$keyName} = ?;";
            $arrParam[] = $data["id"];
        } else {
            //=====================================================================
            $i_type_bg = $_REQUEST['i_type_bg'] ?? null;
            $i_in_advance = $_REQUEST['i_in_advance'] ?? null;
            if ($i_type_bg == 5) {
                $arrParam[] = 10051;
            } else {
                $arrParam[] = $arr["sp_status_hdr_id"];
            }
            $arrParam[] = $i_in_advance;
            $arrParam[] = $arr["i_seq"];
            $arrParam[] = 1;
            $arrParam[] = 0;
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $sql = "UPDATE {$table}
                SET tor_status_id = ?
                    , i_in_advance = ?
                    , i_step=?
                    , i_forword = ?
                    , i_backword = ?
                    , d_tor_status_date=?
                    , i_is_register = 0
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                WHERE {$keyName} = ?;";
            $arrParam[] = $data["id"];
        }


        if ($arr["sp_status_hdr_id"] == 21) { // st0009
            $d_update = date("Y-m-d H:i:s");
            $sql .= "
            UPDATE sp_tor_contract
            SET  i_contract_status = 1, d_update = '{$d_update}'
            WHERE sp_tor_id = {$data["id"]};

                DECLARE @sp_tor_contract_id int;
                SET @sp_tor_contract_id = {$data["id"]}

                SET NOCOUNT ON
                INSERT INTO sp_tor_item (
                    contract_id
                    ,tor_id
                    ,i_contract_status
                    ,d_contract_before_status_date
                    ,d_contract_status_date
                    ,act_date_dt
                    ,sp_status_hdr_id
                ) VALUES (
                    @sp_tor_contract_id
                    ,(select sp_tor_id from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    ,(select i_contract_status from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
					,(
						select
							CASE
								WHEN i_contract_status = 1 THEN (select d_tor_status_date from sp_tor_item where sp_status_hdr_id = 20 and tor_id = (select sp_tor_id from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id))
								WHEN i_contract_status = 2 THEN (select d_contract_status_date from sp_tor_item where i_contract_status = 1 and contract_id = @sp_tor_contract_id)
								WHEN i_contract_status = 33 THEN (select d_contract_status_date from sp_tor_item where i_contract_status = 2 and contract_id = @sp_tor_contract_id)
								WHEN i_contract_status = 4 THEN (select d_contract_status_date from sp_tor_item where i_contract_status = 4 and contract_id = @sp_tor_contract_id)
							END
						from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id
					)
                    ,(select d_update from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    ,(select d_update from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    ,0
                );
            ";
        }

        $stmt = $db->QueryParam($sql, $arrParam);
        $type = $data["typeItems"] ?? null;
        if ($stmt) {
            if ($type == 1) { //alert
                $stmt2 = upAlert($data, $arr, $db);
                // $stmt3 = upItemsStatus($data, $arr, $db); //else
            } else if ($type == 2) { //pa
                $stmt2 = upPA($data, $arr, $db);
                // $stmt3 = upItemsStatus($data, $arr, $db); //else
            } else if ($type == 3) { // all
                $stmt = upPA($data, $arr, $db);
                $stmt2 = upAlert($data, $arr, $db);
                // $stmt3 = upItemsStatus($data, $arr, $db); //else
            } else if ($type == 4) { //การมอบหมายให้ฝ่ายงาน
                // $stmt2 = upItemsStatus($data, $arr, $db); //else
            } else {
                $stmt = upPA($data, $arr, $db);
                $stmt2 = upAlert($data, $arr, $db);
                // $stmt3 = upItemsStatus($data, $arr, $db); //else
            }
        }

        //    echo $sql;
        //    echo "<br>";
        //    echo $type;
        //    print_r($stmt);
        //    exit();
        break;
    case "UPSTATUS":
        $tor = $db->GetDataBySQL("SELECT TOP 1 * FROM dbo.sp_tor WHERE tor_id=?", array($data["id"]));
        $arr = $db->GetDataBySQL("SELECT TOP 1 i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE c_code=?", array($data["menuCode"]));
        //=====================================================================
        $i_backword = $data["i_backword"] ?? null;
        $arrParam[] = $arr["sp_status_hdr_id"];
        $arrParam[] = $arr["i_seq"] ?? null;
        $arrParam[] = ($i_backword == null) ? 1 : 0;
        $arrParam[] = (@$data["i_backword"] != null) ? 1 : 0;
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];

        $sql = "UPDATE {$table}
                SET  tor_status_id = ?
                    , i_step = ?
                    , i_forword = ? , i_backword = ?
                    , d_tor_status_date=?
                    , dc_user_update_id = ?
                    , dc_user_update_cost_id = ?
                    , d_update = ?
                WHERE {$keyName} = ?";
        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt) {
            //             $stmt2 = upItemsStatus($data, $arr, $db);
            //            senMsgRealtime(2, "มีรายการซื้อ/จ้างจากหน่วยงาน เลขหนังสืออ้างอิง " . $tor['d_doc_ref'] . " เลขที่ PR  " . $tor['c_code']);

            $re_id = $data["id"];
        }
        break;
    case "UPDATENEXTSTEP_PR":

        $arr = $db->GetDataBySQL("SELECT TOP 1 i_seq,sp_status_hdr_id FROM dbo.sp_status_hdr WHERE c_code=?", array($data["menuCode"]));
        //=====================================================================
        $i_backword = $data["i_backword"] ?? null;
        $arrParam[] = $arr["sp_status_hdr_id"];
        $arrParam[] = $arr["i_seq"] ?? null;
        $arrParam[] = ($i_backword == null) ? 1 : 0;
        $arrParam[] = (@$data["i_backword"] != null) ? 1 : 0;
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $sql = "UPDATE {$table}
                    SET  tor_status_id = ?
                        , i_step = ?
                        , i_forword = ? , i_backword = ?
                        , d_tor_status_date=?
                        , dc_user_update_id = ?
                        , dc_user_update_cost_id = ?
                        , d_update = ?
                    WHERE {$keyName} = ?";
        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);
        // if ($stmt) {
        //     $stmt2 = upItemsStatus($data, $arr, $db);
        // }
        break;
    case "UPSTATUS_CONTRACT":

        function notificationQueque($id) {
            global $db;
            $rs = $db->GetDataBySQL("select b.sp_tor_hdr_period_id
                                            ,a.sp_tor_contract_id
                                            ,a.c_code
                                            ,a.c_name
                                            ,a.c_doc_ref
                                            ,CONVERT(VARCHAR, a.d_po_date, 120) AS d_po_date
                                            ,CONVERT(VARCHAR, a.d_due_date, 120) AS d_due_date
                                            ,b.i_alert
                                            ,a.i_delivery
                                            ,a.i_status
                                            ,a.i_enabled
                                           from sp_tor_contract a
                                           inner join sp_tor_hdr_period b on b.sp_tor_contract_id=a.sp_tor_contract_id and b.i_is_last=1
                                           where a.sp_tor_contract_id=?", array($id));

            $sqlInsert = "insert into [dbo].[sp_alert_queque] (ref_id ,c_name,c_detail,i_is_start,due_date,i_before,user_id,sp_emp_id,i_is_status)
                          values ({$id},'{$rs["c_doc_ref"]}','{$rs["c_code"]} {$rs["c_name"]}',0,'{$rs["d_due_date"]}','{$rs["i_alert"]}',{$_SESSION["user_id"]},{$_SESSION["sp_emp_id"]},null)";

            /*
              1 ,30014,2 ซื้อซอฟแวร์ Qlik sense	64/กกกว	0	2021-12-16	5	60048	17	1
             *  */
            $stmt = $db->QueryParam($sqlInsert, array());

            return $stmt;
        }

        function processContractPA($id) {
            return true;
        }

        $id = $_REQUEST["id"] ?? null;

        $fs = $db->GetDataBySQL("select a.i_purchase,a.i_type_contract "
                . " from dbo.sp_tor a"
                . " inner join dbo.sp_tor_contract b on b.sp_tor_id = a.tor_id"
                . " where b.sp_tor_contract_id = ?", array($id));
        //process แจ้งเตือนใกล้หมดสัญญา
        if ($fs['i_purchase'] == 1 && $fs['i_type_contract'] == 3) {

        } else {
            //Errior ถ้าไม่มีงวดสุดท้าย
            $notif = notificationQueque($id);
        }
        //process PA
        $pa = processContractPA($id);
        $d_update = date("Y-m-d H:i:s");
        $sql = "UPDATE dbo.sp_tor_contract
                SET  i_contract_status = 2 , d_update = '{$d_update}'
                WHERE sp_tor_contract_id = {$id};

                DECLARE @sp_tor_contract_id int;
                SET @sp_tor_contract_id = {$id}

                SET NOCOUNT ON
                INSERT INTO sp_tor_item (
                    contract_id
                    ,tor_id
                    ,i_contract_status
                    ,d_contract_before_status_date
                    ,d_contract_status_date
                    ,act_date_dt
                    ,sp_status_hdr_id
                ) VALUES (
                    @sp_tor_contract_id
                    ,(select sp_tor_id from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    ,(select i_contract_status from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
					,(
						select
							CASE
								WHEN i_contract_status = 1 THEN (select d_tor_status_date from sp_tor_item where sp_status_hdr_id = 20 and tor_id = (select sp_tor_id from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id))
								WHEN i_contract_status = 2 THEN (select d_contract_status_date from sp_tor_item where i_contract_status = 1 and contract_id = @sp_tor_contract_id)
								WHEN i_contract_status = 33 THEN (select d_contract_status_date from sp_tor_item where i_contract_status = 2 and contract_id = @sp_tor_contract_id)
								WHEN i_contract_status = 4 THEN (select d_contract_status_date from sp_tor_item where i_contract_status = 4 and contract_id = @sp_tor_contract_id)
							END
						from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id
					)
                    ,(select d_update from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    ,(select d_update from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    ,0
                );
                ";

        $stmt = $db->QueryParam($sql, array());
        break;
    case "UPSTATUS_PO":
        $sql = "UPDATE sp_po_hdr
            SET  i_is_status = 2
            WHERE sp_po_id = {$_REQUEST["id"]};";
        $stmt = $db->QueryParam($sql, array());
        break;
    case "UPSTATUS_PO_HDR":
        $sql = "UPDATE sp_tor_contract
            SET  i_contract_status = 3
            WHERE sp_tor_contract_id = {$_REQUEST["id"]};

            UPDATE sp_po_hdr
            SET  i_is_status = 1
            WHERE i_is_po = 1 and sp_tor_contract_id = {$_REQUEST["id"]};";
        $stmt = $db->QueryParam($sql, array());
        break;
    case "GENCODE":
        $ret_id = $data["id"];
        $code_dc = (string) $c_code_gen;
        $now = str_replace('-', '/', date('Y-m-d'));
        if ($_REQUEST['i_type_year'] == 2) {
            $bcm = date('Y' . $_REQUEST['mm_start'], strtotime($now . "+543 years"));
        } else {
            $bcm = date('Ym', strtotime($now . "+543 years"));
        }
        $cost_id = sprintf('%03d', $data['dc_user_update_cost_id']);

        $arrParam2 = array($code_dc, ($cost_id . $bcm), @$data['dc_user_update_id'], @$data['dc_user_update_cost_id'], $ret_id);
        $sql2 = "EXEC SP_GEN_CODE_EIS ?,?,?,?,?;";
        /* EXEC SP_GEN_CODE_EIS 'PR','009256710',30,9,24; */
        //        print_r($arrParam2);
        //        exit();

        $stmt = $db->QueryParam($sql2, $arrParam2);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];
        $ref_id = $arr_gen_code["reference_id"];

        if ($ret_id == $ref_id) {

            $sql3 = "UPDATE {$table} SET c_code=? , i_pr_year = {$_REQUEST['i_yyyy']}  WHERE {$keyName} = ?";
            $arrParam3 = array($c_code, $ret_id);
            $stmt3 = $db->QueryParam($sql3, $arrParam3);
        }

        break;
    case "ADDMAIN":
        print_R($_REQUEST);
        exit();

        break;
    case "GENCODE":

        $ret_id = $data["id"];
        $code_dc = (string) $c_code_gen;
        $now = str_replace('-', '/', date('Y-m-d'));
        if ($_REQUEST['i_type_year'] == 2) {
            $bcm = date('Y' . $_REQUEST['mm_start'], strtotime($now . "+543 years"));
        } else {
            $bcm = date('Ym', strtotime($now . "+543 years"));
        }
        $cost_id = sprintf('%03d', $data['dc_user_update_cost_id']);

        $arrParam2 = array($code_dc, ($cost_id . $bcm), @$data['dc_user_update_id'], @$data['dc_user_update_cost_id'], $ret_id);
        $sql2 = "EXEC SP_GEN_CODE_EIS ?,?,?,?,?;";
        /* EXEC SP_GEN_CODE_EIS 'PR','009256710',30,9,24; */
        //        print_r($arrParam2);
        //        exit();

        $stmt = $db->QueryParam($sql2, $arrParam2);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];
        $ref_id = $arr_gen_code["reference_id"];

        if ($ret_id == $ref_id) {

            $sql3 = "UPDATE {$table} SET c_code=? , i_pr_year = {$_REQUEST['i_yyyy']}  WHERE {$keyName} = ?";
            $arrParam3 = array($c_code, $ret_id);
            $stmt3 = $db->QueryParam($sql3, $arrParam3);
        }

        break;
    case "ADD":
        $arrParam = array();
        $arrParam[] = $data["c_name"] ?? null;

        if ($data["id"] > 0) {
            $arrParam[] = null;
            $arrParam[] = null;
        } else {
            $arrParam[] = $data["d_tor_date"] ?? null;
            $arrParam[] = $data["d_doc_date"] ? $date->bc_to_ad($data["d_doc_date"]) : null;
        }

        //3 แหล่งเงิน
        unset($data["dc_expense_budget_type_id"]);
        unset($data["dc_expense_budget_type2_id"]);
        unset($data["dc_expense_budget_type3_id"]);

        $data["dc_expense_budget_type_id"] = $data["dc_expense_budget_type_idTxt"][0] ?? 0;
        $data["f_type_amt"] = !empty($data['f_bg_amt'][0]) ? str_replace(',', '', $data['f_bg_amt'][0]) : 0;
        $data["i_pr_type1"] = $data["i_pr_type"][0] ?? null;
        $data["dc_expense_budget_type2_id"] = $data["dc_expense_budget_type_idTxt"][1] ?? 0;
        $data["i_pr_type2"] = $data["i_pr_type"][1] ?? null;
        $data["f_type2_amt"] = !empty($data['f_bg_amt'][1]) ? str_replace(',', '', $data['f_bg_amt'][1]) : 0;
        $data["dc_expense_budget_type3_id"] = $data["dc_expense_budget_type_idTxt"][2] ?? 0;
        $data["i_pr_type3"] = $data["i_pr_type"][2] ?? null;
        $data["f_type3_amt"] = !empty($data['f_bg_amt'][2]) ? str_replace(',', '', $data['f_bg_amt'][2]) : 0;

        $arrParam[] = $data["po_expense_id"] ?? 0;

        $arrParam[] = $data["dc_expense_budget_type_id"] ?? 0;
        $arrParam[] = $data["i_pr_type1"] ?? 0;
        $arrParam[] = $data["f_type_amt"] ?? 0;
        $arrParam[] = $data["dc_expense_budget_type2_id"] ?? 0;
        $arrParam[] = $data["i_pr_type2"] ?? null;
        $arrParam[] = $data["f_type2_amt"] ?? 0;
        $arrParam[] = $data["dc_expense_budget_type3_id"] ?? 0;
        $arrParam[] = $data["i_pr_type3"] ?? null;
        $arrParam[] = $data["f_type3_amt"] ?? 0;

        $arrParam[] = $data["dc_cost_id"] ?? null;
        $arrParam[] = $data["dc_cost2_id"] ?? null;

        $arrParam[] = $data["tag"] ?? null;
        $arrParam[] = ($data["txtsub_cost"] == "*ถ้ามี" ? null : $data["txtsub_cost"]);

        $arrParam[] = (($f_total_amt >= 500000) ? 1 : 0);
        $arrParam[] = @$data["i_is_rename"] ?? null;

        //        $arrParam[] = $data["d_doc_ref"] ?? null;
        if ($data["id"] > 0) {
            $arrParam[] = null;
        } else {
            $arrParam[] = $data["d_doc_ref"] ?? null;
        }
        $arrParam[] = $f_total_amt;
        $arrParam[] = $data["i_purchase"];
        if ($data['i_purchase'] == 1) {

            $arrParam[] = 1; //i_hire_type
            $arrParam[] = $data["i_product_type"];
            $arrParam[] = @$data["i_is_inv"];
            $arrParam[] = @$data["i_type_fix_rate"];
        } else if ($data['i_purchase'] == 2) {

            $arrParam[] = $data["i_hire_type"];
            if ($_REQUEST["i_hire_type"] == 1) {
                $arrParam[] = $data["i_product_type"];
                $arrParam[] = @$data["i_is_inv"];
                $arrParam[] = null;
            } else {
                $arrParam[] = null;
                $arrParam[] = null;
                $arrParam[] = null;
            }
        } else if ($data['i_purchase'] == 3) {
            $arrParam[] = null;
            $arrParam[] = null;
            $arrParam[] = null;
            $arrParam[] = null;
        }
        $arrParam[] = $data["tor_type_id"];
        $arrParam[] = $data["i_yyyy"];

        $arrParam[] = $data["i_type_bg"] ?? null;
        //        $arrParam[] = $data["sp_type_id"] ?? null;
        //        $arrParam[] = $_SESSION['dc_department_id'] ?? null;
        //        $arrParam[] = $_SESSION['dc_department_id'] ?? null;
        //        $arrParam[] = $data["dc_user_create_id"];
        //        $arrParam[] = $data["dc_user_create_cost_id"];
        //        $arrParam[] = $data["d_create"];
        $arrParam[] = $data["i_enabled"] ?? 1;
        $arrParam[] = $data["dc_user_update_id"] ?? null;
        $arrParam[] = $data["dc_user_update_cost_id"] ?? null;
        $arrParam[] = $data["d_update"] ?? null;
        $arrParam[] = $data["dc_user_update_id"] ?? null;
        $arrParam[] = $data["dc_user_update_cost_id"] ?? null;
        $arrParam[] = $data["d_update"] ?? null;
        $arrParam[] = $data["index_receive"] ?? null;

        $sql = "SET NOCOUNT ON
        INSERT INTO {$table} (c_name  , d_tor_date , d_doc_date , po_expense_id
                        , dc_expense_budget_type_id  , i_pr_type1 , f_type_amt
                        , dc_expense_budget_type2_id  , i_pr_type2 , f_type2_amt
                        , dc_expense_budget_type3_id  , i_pr_type3 , f_type3_amt
                        , dc_cost_id , dc_cost2_id

                        , tag , txtsub_cost
                        , i_is_more , i_is_rename
                        , d_doc_ref , f_total_amt
                        , i_purchase , i_hire_type
                        , i_product_type , i_is_inv
                        , i_type_fix_rate  , tor_type_id
                        , i_yyyy , i_type_bg
                        , i_enabled
                        , dc_user_create_id, dc_user_create_cost_id, d_create
                        , dc_user_update_id, dc_user_update_cost_id, d_update
                        , index_receive
                        )
                VALUES ( ?, ? , ? , ?, ?
                        , ?, ?, ?, ?, ?
                        , ?, ?, ?, ?, ?,

                         ?, ?,
                         ?, ?,
                         ? ,? ,
                         ? ,? ,
                         ?, ?,
                         ? ,?,
                         ? ,?
                        ,?
                        , ?,?,?
                        , ?,?,?
                        ,?);
                        SELECT @@IDENTITY as sp_tor_id;";

        //       echo $sql;
        //        print_r($arrParam);
        //        exit();
        $stmt = $db->QueryParam($sql, $arrParam);
        $ss_id = $db->Fetch($stmt);
        if (true) {
            $sp_tor_id = $ss_id["sp_tor_id"];
            if (true) {

                //                $sql0 = "
                //                    DELETE FROM dbo.sp_tor_dtl
                //                    where  sp_tor_id = ?";
                //                    $stmt = $db->QueryParam($sql0, array($sp_tor_id));
            }

            if (is_array($data["dc_expense_budget_type_idTxt"])) {
                $ii = 1;
                foreach ($data["dc_expense_budget_type_idTxt"] as $k => $v) {

                    //*****************************************/
                    $data2["dc_bg_budget_type_id"] = $v;
                    $data2["f_unit_price"] = !empty($data['f_bg_amt'][$k]) ? str_replace(',', '', $data['f_bg_amt'][$k]) : 0;
                    $data2["f_total_price"] = !empty($data['f_bg_amt'][$k]) ? str_replace(',', '', $data['f_bg_amt'][$k]) : 0;

                    //*****************************************/
                    $data2["sp_tor_id"] = $sp_tor_id;
                    $data2["c_name"] = $data["c_name"];
                    $data2["i_qty"] = 1;
                    $data2["i_used"] = null;
                    $data2["i_balance"] = null;
                    $data2["dc_unit_type_id"] = 24;
                    $data2["c_unit"] = null;
                    $data2["bg_reserve_money_id"] = null;
                    $data2["i_pr_type1"] = null;
                    //                    $data2["dc_bg_budget_type_id"] = $data["dc_expense_budget_type_id"];
                    $data2["i_product_type"] = $data["i_product_type"];
                    $data2["i_is_inv"] = $data["i_is_inv"];
                    $data2["po_expense_id"] = $data["po_expense_id"];
                    $data2["dc_creditor_id"] = $data["dc_creditor_id"] ?? null;
                    $data2["i_hire_type"] = $data["i_hire_type"] ?? null;
                    $data2["f_disc_price"] = $data["f_disc_price"] ?? 0;
                    /*
                      p_tor_id
                     * c_name
                     * i_qty
                     * i_used
                     * i_balance
                     * dc_unit_type_id
                     * c_unit
                     * bg_reserve_money_id
                     * i_pr_type1
                     * dc_bg_budget_type_id
                     * i_product_type
                     * i_is_inv
                     * po_expense_id
                     * dc_creditor_id
                     * i_hire_type
                     * f_disc_price
                     * f_unit_price
                     */
                    $data2["dc_user_create_id"] = $_SESSION["user_id"];
                    $data2["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
                    $data2["d_create"] = date("Y-m-d H:i:s");
                    //              print_r($data2);
                    //                    exit();
                    foreach ($data2 as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }

                    $sql = "SET NOCOUNT ON
                            INSERT INTO sp_tor_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                            SELECT @@IDENTITY as id;";
                    //                    echo $sql;
                    //                    print_r($arrValue);
                    //                    exit();
                    $stmt = $db->QueryParam($sql, $arrValue);
                    unset($data2);
                    unset($addField);
                    unset($arrValue);
                    unset($addValue);
                }
            }
        }
        if ($data["i_dtl_add"] == 1) {

            $arrParam = array();
            $sql = "INSERT INTO sp_tor_dtl
                    (
                    sp_tor_id
                    ,c_name
                    ,i_qty
                    ,i_used
                    ,i_balance
                    ,dc_unit_type_id
                    ,c_unit
                    ,dc_bg_budget_type_id
                    ,i_product_type
                    ,i_is_inv
                    ,po_expense_id
                    ,dc_creditor_id
                    ,i_hire_type
                    ,f_disc_price
                    ,f_unit_price
                    ,f_total_price
                    ,f_net_disc_price
                    ,f_net_unit_price
                    ,f_net_total_price
                    ,dc_user_create_id
                    ,dc_user_create_cost_id
                    ,d_create
                    ,dc_user_update_id
                    ,dc_user_update_cost_id
                    ,d_update
                    )(
                SELECT
                    ?
                    ,c_name
                    ,i_qty
                    ,i_used
                    ,i_balance
                    ,dc_unit_type_id
                    ,c_unit
                    ,dc_bg_budget_type_id
                    ,i_product_type
                    ,i_is_inv
                    ,po_expense_id
                    ,dc_creditor_id
                    ,i_hire_type
                    ,f_disc_price
                    ,f_unit_price
                    ,f_total_price
                    ,f_net_disc_price
                    ,f_net_unit_price
                    ,f_net_total_price
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                FROM
                    sp_tor_dtl
                WHERE sp_tor_id = ?)
            ";

            $arrParam[] = $ss_id["sp_tor_id"];
            $arrParam[] = $data["dc_user_create_id"];
            $arrParam[] = $data["dc_user_create_cost_id"];
            $arrParam[] = $data["d_create"];
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["id"];

            //            echo $sql;
            //            print_r($arrParam);
            //            exit();
            $stmt = $db->QueryParam($sql, $arrParam);
        }

        break;
    case "LIST":
        ###########################################
        $mode = $_REQUEST["mode"] ?? null;
        $filter = $_REQUEST["filter"] ?? null;
        $value = $_REQUEST["value"] ?? null;
        $i_read = $_REQUEST["i_read"] ?? null;

        $root = "data";
        $data = array();

        $limit = $_REQUEST["limit"] ?? null;
        $dir = $_REQUEST["dir"] ?? null;
        $sort = $_REQUEST["sort"] ?? null;
        $start = $_REQUEST["start"] ?? null;

        function get($a) {
            return $a ?? 0;
        }

        if (!get($start)) {
            $start = 0;
        }
        if (!get($limit)) {
            $limit = 20;
        } else {
            $limit = ($limit + $start);
        }
        if (!get($dir)) {
            $dir = "DESC";
        }
        if (!get($sort)) {
            $sort = " s.c_code";
        }
        #################################
        $arrParam = array();
        $arrCountParam = array();
        $con = null;
        $conDtl = null;
        $wh = null;

        $type = $_REQUEST["type"] ?? null;
        $act = $_REQUEST["type"] ?? null;
        $tor_type_show = $_REQUEST['tor_type_show'] ?? null;
        $i_post = $_REQUEST['i_post'] ?? null;

        // if ($type == "sp_working_dtl") {
        $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
        $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
        $i_pa = $_REQUEST["i_pa"] ?? null; // status id


        $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
        $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
        $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

        if ($_REQUEST["type"] == "SEARCH") {
            if ($_REQUEST["value"] != "") {

                if ($_REQUEST["filter"] == "c_code") {
                    $wh .= " AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_doc_ref") {
                    $wh .= " AND a.d_doc_ref  LIKE '%" . $_REQUEST["value"] . "%' ";
                } else if ($_REQUEST["filter"] == "c_name") {
                    $wh .= " AND a.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
                }
                // } else if ($_REQUEST["filter"] == "c_arrive_code") {
                //     $wh    .= " AND cc.c_arrive_code LIKE '%" . $_REQUEST["value"] . "%' ";
                // } else if ($_REQUEST["filter"] == "c_overlap") {
                //     $wh    .= " AND cc.c_overlap LIKE '%" . $_REQUEST["value"] . "%' ";
                // } else if ($_REQUEST["filter"] == "dc_creditor_name") {
                //     $wh    .= " AND bbb.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
                // }  else if ($_REQUEST["filter"] == "dc_creditor_tax_numbe") {
                //     $wh    .= " AND bbb.c_tax_number_imp LIKE '%" . $_REQUEST["value"] . "%' ";
                // }
            }
            if ($_REQUEST["i_budget_year"] > 0) {
                $wh .= " AND a.i_yyyy = " . $_REQUEST["i_budget_year"];
            }
            if ($_REQUEST["i_budget_year_overlap"] > 0) {
                $wh .= " AND a.i_yyyy = " . $_REQUEST["i_budget_year_overlap"];
            }
            if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
                $wh .= " AND a.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
            }
            if ($_REQUEST["dc_cost_id"] > 0) {
                $wh .= " AND a.dc_cost2_id = " . $_REQUEST["dc_cost_id"];
            }
            if ($_REQUEST["dc_cost_acc_id"] > 0) {
                $wh .= " AND (select top 1  dc_cost_acc_id from " . DB_CENTER . "dc_cost where  dc_cost_id =  a.dc_cost2_id) =  " . $_REQUEST["dc_cost_acc_id"];
            }
            // if ($_REQUEST["i_year_contract"] > 0) {
            //     $wh .= " AND RIGHT(ac.c_code,4) like '%" . ($_REQUEST["i_year_contract"] + 543) . "%'";
            // }
            // if ($_REQUEST["i_type_contract"] > 0) {
            //     $wh .= " AND  (select  isnull(i_type_contract,0) as i_type_contract from sp_tor where  tor_id = ac.sp_tor_id )   = " . $_REQUEST["i_type_contract"];
            // }
        }
        $cost = null;
        $incost = null;
        if ($dc_cost_id == 97 || $_SESSION['i_level'] == 1 || $dc_cost_id == 3) {
            $wh .= "  ";
        } else if ($_REQUEST["i_read"] == 1) {
            $wh .= " and (select dc_cost_acc_id from " . DB_CENTER . "dc_cost where  dc_cost_id =  a.dc_cost2_id ) = " . $_SESSION["dc_cost_acc_id"];
        } else if ($_REQUEST["i_read"] == 2) {
            $accIds = [];
            $cost = " SET NOCOUNT ON
            DECLARE @TEMP_SP_USER_COST_SYS TABLE (dc_cost_id BIGINT);
            INSERT INTO @TEMP_SP_USER_COST_SYS EXEC " . DB_CENTER . "SP_USER_COST_SYS "
                    . (@$_SESSION["dc_center_user"] ?? "null") . ","
                    . (@$_SESSION['i_type_user'] ?? "null") . ","
                    . (@$_REQUEST["i_read"] ?? "null") . ","
                    . (@$_REQUEST["C_CODE_SYS"] ? "'" . $_REQUEST["C_CODE_SYS"] . "'" : "null") . ";

            select
                a.dc_cost_id as dc_cost_main_id
                ,b.dc_cost_acc_id
                ,b.i_main
                , b.dc_cost_id
            from " . DB_CENTER . "dc_cost a
            inner join (
            select
                left(c_code,2) + '000000'  as c_code
                ,max(b.dc_cost_acc_id) as dc_cost_acc_id
                ,case when isnull(max(dc_user_id),0) > 0 then 1 else 0 end as i_main
                , b.dc_cost_id
                -- ,c.dc_user_id
            from @TEMP_SP_USER_COST_SYS a
            inner join " . DB_CENTER . "dc_cost b on a.dc_cost_id = b.dc_cost_id
            left join " . DB_CENTER . "dc_user c on a.dc_cost_id = c.dc_cost_id and dc_user_id = " . (@$_SESSION["dc_center_user"] ?? "null") . "
            where 1=1 {$con}
            group by left(c_code,2) + '000000',b.dc_cost_id
            ) b on a.c_code  = b.c_code
            ";
            $result = $db->QueryParam($cost, array());
            while ($row = $db->Fetch($result)) {
                $mainIds[] = $row["dc_cost_id"];
                $accIds[] = $row["dc_cost_acc_id"];
            }
            $mainList = implode(",", $mainIds);   // เช่น "91,113"
            $accList = implode(",", $accIds);    // เช่น "75,114"
            $incost = " AND  a.dc_cost2_id in(" . $mainList . ")";
            // print_r($cost);
            // exit;
        } else if ($_REQUEST["i_read"] == 4) {
            $wh .= "  ";
        } else if ($_REQUEST["i_read"] == 3) {
            $wh .= " and (select dc_cost_acc_id from " . DB_CENTER . "dc_cost where  dc_cost_id =  a.dc_cost2_id ) = " . $_SESSION["dc_cost_acc_id"];
        } else {
            $wh .= " and a.dc_cost2_id  = " . $dc_cost_id;
        }
        $arrParam = array();
        $arrCountParam = array();
        $sqlTempTable = "SELECT a.tor_id
                                , a.po_expense_id
                                , a.po_creditor_id
                                , a.dc_expense_budget_type_id
                                , a.dc_expense_budget_type2_id
                                , a.dc_expense_budget_type3_id
                                , a.bg_budget_dtl_project_id
                                , ISNULL(a.dc_department_id,0) AS dc_department_id
                                , a.dc_cost_id
                                , a.dc_cost2_id
                                , a.i_is_rename
                                , a.index_receive
                                , a.txtsub_cost
                                , a.tor_type_id
                                , a.i_owner_bg
                                , a.i_is_more
                                , ISNULL(a.i_purchase,1) AS i_purchase
                                , ISNULL(a.i_product_type,1) AS i_product_type
                                , ISNULL(a.i_hire_type,0) AS i_hire_type
                                , ISNULL(a.i_is_inv ,0) AS i_is_inv
                                , ISNULL(a.i_type_fix_rate ,0) AS i_type_fix_rate
                                , ISNULL(a.i_delivery_date,0) AS i_delivery_date
                                , a.i_step
                                , a.sp_emp_id
                                , a.i_forword
                                , a.i_backword
                                , a.tor_status_id
                                , a.i_type_bg
                                , a.i_enabled
                                , ROW_NUMBER() OVER (ORDER BY a.d_update DESC , a.i_edit DESC, a.tor_id DESC) AS row
                            FROM dbo.sp_tor a
                            -- LEFT JOIN dbo.sp_tor_contract ss ON a.tor_id= ss.sp_tor_id
                            -- LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3
                            WHERE a.i_type_bg <> 3 and a.i_is_notor<>1 and a.i_enabled = 1  " . $incost . $wh;
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "SET NOCOUNT ON
           SELECT *
                into #temp
                    FROM (SELECT
                            aa.stats_period_int  ,
                            aa.sp_tor_contract_id,
                            aa.stats_period ,
                            aa.stats_con ,
                            ROW_NUMBER() OVER (PARTITION BY aa.sp_tor_hdr_period_id ORDER BY aa.sp_tor_contract_id ASC) AS rn
                        FROM vw_sp_tor_period_po_working aa
                        where  isnull(i_is_last,0) = 1 and i_sys = 3
                            ) t
                        WHERE rn = 1;

                    SELECT a.* , s.c_code
                            , s.c_budget_dtl_project
                            , s.c_name
                            , s.c_department
                            , s.d_doc_ref
                            , s.tag
                            , (SELECT TOP 1 c_name FROM dbo.sp_department  WHERE dc_department_id=s.dc_department_id)  AS dc_department_name
                            , (SELECT TOP 1 c_name FROM dbo.sp_emp  WHERE sp_emp_id=s.sp_emp_id)  AS c_emp_name
                            , (SELECT TOP 1 c_code FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_code_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_status_hdr WHERE sp_status_hdr_id=s.tor_status_id)  AS c_name_status
                            , (SELECT TOP 1 c_name FROM dbo.sp_type_status WHERE sp_type_status_id=s.tor_type_id)  AS c_type_name
                            , isnull((select top 1 sp_tor_contract_id  from sp_tor_contract  where sp_tor_id = a.tor_id),0) as sp_contract_id
                            , ISNULL(s.i_purchase,1) AS i_purchase
                            , ISNULL(s.tor_type_id,1) AS tor_type_id
                            , s.f_period_amt
                            , s.f_total_amt
                            , s.f_type_amt
                            , s.f_type2_amt
                            , s.f_type3_amt
                            , ISNULL(s.i_parent,0) AS i_parent
                            , ISNULL(s.i_is_parent,0) AS i_is_parent
                            , s.start_date
                            , s.end_date
                            , s.i_edit
                            , s.i_type_bg
                            , s.i_is_upload
                            , s.upload
                            , s.c_comment
                            , s.c_remake
                            , s.i_yyyy
                            , s.i_type_bg
                            , s.i_type_bgProject
                            , s.i_type_bg
                            , s.i_pr_type1
                            , s.i_pr_type2
                            , s.i_pr_type3
                            ,s.bg_reserve_money1_id
                            ,s.bg_reserve_money2_id
                            ,s.bg_reserve_money3_id
                            , s.sp_type_id
                            , CONVERT(VARCHAR, s.d_doc_date, 120) AS d_doc_date
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , s.po_creditor_id
                            -- , CONVERT(VARCHAR, ss.d_doc_date, 120) AS d_doc_content
                            -- , CONVERT(VARCHAR, ss.d_due_date, 120) AS d_due_content

                            , (select top 1 CONVERT(VARCHAR, d_doc_date, 120) as d_doc_content from sp_tor_contract where sp_tor_id = a.tor_id )  as d_doc_content
                            , (select top 1 CONVERT(VARCHAR, d_due_date, 120)  as d_due_content from sp_tor_contract where sp_tor_id = a.tor_id )  as d_due_content
                            , (select top 1 CONVERT(VARCHAR, d_start_date, 120) as d_start_content from sp_tor_contract where sp_tor_id = a.tor_id )  as d_start_content
                            , (select top 1 isnull(c_code,0) as code from sp_tor_contract where sp_tor_id = a.tor_id )  as code
                            , (select top 1 isnull(f_total_amt,0) as code from sp_tor_contract where sp_tor_id = a.tor_id )  as f_total_contract
                                                        -- , ss.f_total_amt as f_total_contract   stats_con


                            , (select top 1 stats_period_int from  #temp  aaa where aaa.sp_tor_contract_id  =  (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period_int
                            , (select top 1 stats_period from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )) as stats_period
                            , isnull((select top 1  stats_con from  #temp  aaa where  aaa.sp_tor_contract_id  = (select top 1 sp_tor_contract_id from sp_tor_contract where sp_tor_id = a. tor_id )),'กำลังดำเนินการ') as stats_con

                            , (select top 1 c_name from " . DB_NMU . "dc_creditor where dc_creditor_id =
                            (select top 1 isnull(dc_creditor_id,0) as dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id )
                            ) as dc_creditor_name
                            , (select top 1 c_tax_number_imp from " . DB_NMU . "dc_creditor where dc_creditor_id =
                            (select top 1 isnull(dc_creditor_id,0) as dc_creditor_id from sp_tor_contract where sp_tor_id = a.tor_id ) ) as c_tax_number_imp
                            , s.dc_user_create_cost_id as dc_create_cost_id
                            , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
                            , (SELECT TOP 1 c_name FROM dbo.po_creditor WHERE po_creditor_id=s.po_creditor_id)  AS po_creditor_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, s.d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                            , CONVERT(VARCHAR, s.d_update, 120) AS d_update "
                . " FROM ({$sqlTempTable}) a "
                . " INNER JOIN dbo.sp_tor s ON s.tor_id=a.tor_id"
                // . " LEFT JOIN dbo.sp_tor_contract ss ON s.tor_id= ss.sp_tor_id"
                // . " LEFT JOIN  vw_sp_tor_period_po_working b on  ss.sp_tor_contract_id  = b.sp_tor_contract_id and isnull(b.i_is_last,0) = 1 and b.i_sys = 3 "
                . " WHERE a.row > ? AND a.row <= ?";
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
        }
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
        $editArry = array(
            3 => '<span style="color:red"></span>' // พนักงานสายงาน
            ,
            2 => '<span style="color:red">ต้องแก้ไข</span>' // หัวหน้าสายงาน
            ,
            1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
            ,
            4 => '<span style="color:blue">แก้ไขแล้ว</span>',
            5 => '<span style="color:blue"></span>',
            6 => '<span style="color:blue"></span>'
        );

        while ($row = $db->Fetch($stmt)) {
            /* การจัดทำ PR ปกติ
              การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)
              การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)
              การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)
              การจัดทำ PR จองเงินข้ามส่งเบิก
              การจัดทำ PR จองเงิsนทำถึงสัญญา
              การจัดทำ PR จองเงินทำถึงตรวจรับ */
            $txtEdit = ($row['i_edit'] == (1 || 4 || 5 || 6)) ? $editArry[$row['i_edit']] : '';
            $i_type_bg = null;
            $i_type_bgTxt = null;
            $sp = null;
            if ($row["sp_tor_delete"] == 1) {
                $sp = "<b style='color:#F43217'>" . $row["c_name"] . "</b>";
            }
            switch (intval($row["i_type_bg"])) {
                case 0:
                    $i_type_bg = "color:#F43217";
                    $i_type_bgTxt = '';
                    break;
                case 1:
                    $i_type_bg = "color:black";
                    $i_type_bgTxt = 'การจัดทำ PR ปกติ';
                    break;
                case 2:
                    $i_type_bg = "color:#116CEF";
                    $i_type_bgTxt = 'การจัดทำ PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                    break;
                case 3:
                    $i_type_bg = "color:#b085f5";
                    $i_type_bgTxt = 'การจัดทำ PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                    break;
                case 4:
                    $i_type_bg = "color:#CD8114";
                    $i_type_bgTxt = 'การจัดทำ PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                    break;
                case 5:
                    $i_type_bg = "color:#52CD14";
                    $i_type_bgTxt = 'การจัดทำ PR จองเงินข้ามส่งเบิก';
                    break;
                case 6:
                    $i_type_bg = "color:#52CD14";
                    $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงสัญญา';
                    break;
                case 7:
                    $i_type_bg = "color:#52CD14";
                    $i_type_bgTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                    break;
                default:
                    $i_type_bg = "color:#F43217";
                    $i_type_bgTxt = '';
                    break;
            }
            $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>";
            // pure
            $temp = array(
                "no" => $i++,
                "id" => intval($row["tor_id"]),
                "sp_tor_delete" => $sp,
                "sp_contract_id" => $row["sp_contract_id"],
                "stats_con" => $row["stats_con"],
                "code" => $row["code"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "i_purchase" => intval($row["i_purchase"]),
                "i_product_type" => intval($row["i_product_type"]),
                "dc_create_cost_id" => intval($row["dc_create_cost_id"]),
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "i_pr_type1" => intval($row["i_pr_type1"]),
                "i_pr_type2" => intval($row["i_pr_type2"]),
                "i_pr_type3" => intval($row["i_pr_type3"]),
                "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                "i_delivery_date" => intval($row["i_delivery_date"]),
                "i_type_bg" => intval($row["i_type_bg"]),
                "i_owner_bg" => intval($row["i_owner_bg"]),
                "bg_reserve_money1_id" => intval($row["bg_reserve_money1_id"]),
                "bg_reserve_money2_id" => intval($row["bg_reserve_money2_id"]),
                "bg_reserve_money3_id" => intval($row["bg_reserve_money3_id"]),
                "i_type_bgProject" => intval($row["i_type_bgProject"]),
                "i_type_bgTxt" => $i_type_bgTxt,
                "i_step" => intval($row["i_step"]),
                "index_receive" => $row["index_receive"],
                "i_is_upload" => intval($row["i_is_upload"]),
                "upload" => $row["upload"],
                "c_emp_name" => $row["c_emp_name"],
                "txtsub_cost" => $row["txtsub_cost"],
                "i_forword" => intval($row["i_forword"]),
                "i_backword" => intval($row["i_backword"]),
                "i_edit" => intval($row["i_edit"]),
                "i_type_bg" => intval($row["i_type_bg"]),
                "sp_type_id" => intval($row["sp_type_id"]),
                "c_code" => $row["c_code"],
                "c_codeStatus" => $c_codeStatus, //database_start.png
                "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                "i_is_more" => intval($row["i_is_more"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_total_contract" => number_format($row["f_total_contract"], 2),
                "i_is_rename" => intval($row["i_is_rename"]),
                "c_budget_dtl_project" => $row["c_budget_dtl_project"], //dc_department_name
                "txtdc_department_idID" => $row["dc_department_name"], //
                "c_name" => $row["c_name"],
                "c_code_status" => $row["c_code_status"],
                "c_name_status" => $row["c_name_status"],
                "tor_status_id" => $row["tor_status_id"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "dc_cost2_id" => intval($row["dc_cost2_id"]),
                "tag" => ($row["tag"]),
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_cost2_idTxt" => $row["dc_cost2_idTxt"] ?? '',
                "dc_department_id" => intval($row["dc_department_id"]),
                "c_department" => $row["c_department"],
                "i_parent" => $row["i_parent"],
                "i_is_parent" => $row["i_is_parent"],
                "d_doc_ref" => $row["d_doc_ref"],
                "i_yyyy" => $row["i_yyyy"],
                "c_year" => intval($row["i_yyyy"] + 543),
                "tor_type_id" => $row["tor_type_id"],
                "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                "i_purchase" => intval($row["i_purchase"]),
                "c_purchase" => $i_purchase[$row["i_purchase"]],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "dc_expense_budget_type_id0" => intval($row["dc_expense_budget_type_id"]),
                "dc_expense_budget_type_id1" => intval($row["dc_expense_budget_type2_id"]),
                "dc_expense_budget_type_id2" => intval($row["dc_expense_budget_type3_id"]),
                "f_type_amt" => number_format($row["f_type_amt"], 2),
                "f_type_amt0" => number_format($row["f_type_amt"], 2),
                "f_type_amt1" => number_format($row["f_type2_amt"], 2),
                "f_type_amt2" => number_format($row["f_type3_amt"], 2),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
                "d_doc_content" => ((empty($row["d_doc_content"])) ? "" : $date->shot_date_from_db($row["d_doc_content"])), //d_tor_date
                "d_start_content" => ((empty($row["d_start_content"])) ? "" : $date->shot_date_from_db($row["d_start_content"])), //d_tor_date
                "d_due_content" => ((empty($row["d_due_content"])) ? "" : $date->shot_date_from_db($row["d_due_content"])), //d_tor_date
                "d_create" => $date->extDateBuddha($row["d_create"]), //
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "start_date" => $date->extDateBuddha($row["start_date"]),
                "end_date" => $date->extDateBuddha($row["end_date"]),
                "i_enabled" => intval($row["i_enabled"]),
                "c_comment" => $row["c_comment"],
                "c_remake" => $row["c_remake"],
                "po_creditor_id" => intval($row["po_creditor_id"]),
                "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            );
            ${$root}[] = $temp;
        }

        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit();
        // }
        break;
    case "UPDATE":

        // ============== //

        unset($arrParam);
        unset($arrValue);
        // ============== //
        $arrParam = array();
        $arrParam["c_name"] = $data["c_name"] ?? null;
        $arrParam["d_tor_date"] = $data["d_tor_date"];
        $arrParam["d_doc_date"] = $data["d_doc_date"] ? $date->bc_to_ad($data["d_doc_date"]) : null;
        $arrParam["po_expense_id"] = $data["po_expense_id"] ?? null;
        if ($data['i_purchase'] == 1) {

            $arrParam["i_hire_type"] = 1; //i_hire_type
            $arrParam["i_product_type"] = $data["i_product_type"] ?? null;
            $arrParam["i_is_inv"] = @$data["i_is_inv"] ?? null;
            $arrParam["i_type_fix_rate"] = @$data["i_type_fix_rate"] ?? null;
        } else if ($data['i_purchase'] == 2) {

            $arrParam["i_hire_type"] = $data["i_hire_type"];
            if ($_REQUEST["i_hire_type"] == 1) {
                $arrPara["i_product_type"] = $data["i_product_type"] ?? null;
                $arrPara["i_is_inv"] = @$data["i_is_inv"] ?? null;
                $arrParam["i_type_fix_rate"] = null;
            } else {
                $arrParam["i_product_type"] = null;
                $arrParam["i_is_inv"] = null;
                $arrParam["i_type_fix_rate"] = null;
            }
        } else if ($data['i_purchase'] == 3) {
            $arrParam["i_hire_type"] = null;
            $arrParam["i_product_type"] = null;
            $arrParam["i_is_inv"] = null;
            $arrParam["i_type_fix_rate"] = null;
        }
        $arrParam["po_creditor_id"] = @$data["po_creditor_id"];
        //        $arrParam["dc_expense_budget_type_id"] = $data["dc_expense_budget_type_id"];

        if ($data["tor_type_id"] == 2) {
            $arrParam["dc_department_id"] = $data["dc_department_id"] ?? null;
        }
        //test
        $arrParam["dc_cost2_id"] = $data["dc_cost2_id"];
        $arrParam["tag"] = $data["tag"];
        $arrParam["i_owner_bg"] = $data["i_owner_bg"];
        $arrParam["i_type_bg"] = $data["i_type_bg"];
        $arrParam["txtsub_cost"] = ($data["txtsub_cost"] == "*ถ้ามี" ? "" : $data["txtsub_cost"]);
        $arrParam["i_is_more"] = (($f_total_amt >= 500000) ? 1 : 0);
        $arrParam["d_doc_ref"] = $data["d_doc_ref"];
        $arrParam["f_total_amt"] = $f_total_amt;
        $arrParam["i_purchase"] = $data["i_purchase"];
        $arrParam["tor_type_id"] = $data["tor_type_id"];
        $arrParam["i_yyyy"] = $data["i_yyyy"];

        //=====================================================================
        $arrParam["c_comment"] = $data["c_comment"];
        $arrParam["i_type_bg"] = $data["i_type_bg"];
        $arrParam["sp_type_id"] = $data["sp_type_id"];
        //        $arrParam[] = $data["i_enabled"];
        $arrParam["dc_user_update_id"] = $data["dc_user_update_id"];
        $arrParam["dc_user_update_cost_id"] = $data["dc_user_update_cost_id"];
        $arrParam["d_update"] = $data["d_update"];
        $arrParam["index_receive"] = $data["index_receive"];
        //        print_r($data);
        //3 แหล่งเงิน
        $arrParam["dc_expense_budget_type_id"] = @$data["dc_expense_budget_type_idTxt"][0];
        $arrParam["f_type_amt"] = !empty($data['f_bg_amt'][0]) ? str_replace(',', '', $data['f_bg_amt'][0]) : 0;
        $arrParam["i_pr_type1"] = @$data["i_pr_type"][0];

        $arrParam["dc_expense_budget_type2_id"] = @$data["dc_expense_budget_type_idTxt"][1];
        $arrParam["f_type2_amt"] = !empty($data['f_bg_amt'][1]) ? str_replace(',', '', $data['f_bg_amt'][1]) : 0;
        $arrParam["i_pr_type2"] = @$data["i_pr_type"][1];

        $arrParam["dc_expense_budget_type3_id"] = @$data["dc_expense_budget_type_idTxt"][2];
        $arrParam["f_type3_amt"] = !empty($data['f_bg_amt'][2]) ? str_replace(',', '', $data['f_bg_amt'][2]) : 0;
        $arrParam["i_pr_type3"] = @$data["i_pr_type"][2];

        if (true) {
            $sp_tor_id = $data["id"];
            if (true) {

                $sql0 = "
                    DELETE FROM dbo.sp_tor_dtl
                    where  sp_tor_id = ?";
                //                echo $sql0;
                //                print_r($sp_tor_id);
                //                exit();
                $stmt = $db->QueryParam($sql0, array($sp_tor_id));
            }

            if (is_array($data["dc_expense_budget_type_idTxt"])) {
                $ii = 1;
                foreach ($data["dc_expense_budget_type_idTxt"] as $k => $v) {

                    //*****************************************/
                    $data2["dc_bg_budget_type_id"] = $v;
                    $data2["f_unit_price"] = !empty($data['f_bg_amt'][$k]) ? str_replace(',', '', $data['f_bg_amt'][$k]) : 0;
                    $data2["f_total_price"] = !empty($data['f_bg_amt'][$k]) ? str_replace(',', '', $data['f_bg_amt'][$k]) : 0;
                    $data2["i_pr_type1"] = $data["i_pr_type" . $k];
                    //*****************************************/
                    $data2["sp_tor_id"] = $data["id"];
                    $data2["c_name"] = $data["c_name"];
                    $data2["i_qty"] = 1;
                    $data2["i_used"] = null;
                    $data2["i_balance"] = null;
                    $data2["dc_unit_type_id"] = 24;
                    $data2["c_unit"] = null;
                    $data2["bg_reserve_money_id"] = null;
                    //                    $data2["dc_bg_budget_type_id"] = $data["dc_expense_budget_type_id"];
                    $data2["i_product_type"] = $data["i_product_type"];
                    $data2["i_is_inv"] = $data["i_is_inv"];
                    $data2["po_expense_id"] = $data["po_expense_id"];
                    $data2["dc_creditor_id"] = $data["dc_creditor_id"] ?? null;
                    $data2["i_hire_type"] = $data["i_hire_type"] ?? null;
                    $data2["f_disc_price"] = $data["f_disc_price"] ?? 0;
                    /*
                      p_tor_id
                     * c_name
                     * i_qty
                     * i_used
                     * i_balance
                     * dc_unit_type_id
                     * c_unit
                     * bg_reserve_money_id
                     * i_pr_type1
                     * dc_bg_budget_type_id
                     * i_product_type
                     * i_is_inv
                     * po_expense_id
                     * dc_creditor_id
                     * i_hire_type
                     * f_disc_price
                     * f_unit_price
                     */
                    $data2["dc_user_create_id"] = $_SESSION["user_id"];
                    $data2["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
                    $data2["d_create"] = date("Y-m-d H:i:s");
                    //              print_r($data2);
                    //                    exit();
                    foreach ($data2 as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }

                    $sql = "SET NOCOUNT ON
                            INSERT INTO sp_tor_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                            SELECT @@IDENTITY as id;";
                    //                                echo $sql;
                    //                    print_r($arrValue);
                    //                    exit();
                    $stmt = $db->QueryParam($sql, $arrValue);
                    unset($data2);
                    unset($addField);
                    unset($arrValue);
                    unset($addValue);
                }
            }
        }


        foreach ($arrParam as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
                {$fld} = ?";
        }


        /*
          f_total_amt*
          f_type_amt
          f_type2_amt
          f_type3_amt
          dc_expense_budget_type_id
          dc_expense_budget_type2_id
          dc_expense_budget_type3_id
         */
        $sql = "UPDATE {$table} SET " . substr($addField, 1) . " WHERE {$keyName} = ?";
        $arrValue[] = $data["id"];
        //        echo $sql;
        //        print_r($arrValue);
        //        exit();
        $stmt = $db->QueryParam($sql, $arrValue);
        $id = $data["id"];

        // ============== //
        $addField = null;
        $addValue = null;
        unset($arrParam);
        unset($arrValue);
        // ============== //
        /* else {
          $arrParam = array();
          $arrParam[] = $data["c_name"] ?? null;
          $arrParam[] = $data["d_tor_date"];
          $arrParam[] = $data["d_doc_date"] ? $date->bc_to_ad($data["d_doc_date"]) : null;
          $arrParam[] = $data["po_expense_id"] ?? null;
          if ($data['i_purchase'] == 1) {

          $arrParam[] = 1; //i_hire_type
          $arrParam[] = $data["i_product_type"] ?? null;
          $arrParam[] = @$data["i_is_inv"] ?? null;
          $arrParam[] = @$data["i_type_fix_rate"] ?? null;
          } else if ($data['i_purchase'] == 2) {

          $arrParam[] = $data["i_hire_type"];
          if ($_REQUEST["i_hire_type"] == 1) {
          $arrParam[] = $data["i_product_type"] ?? null;
          $arrParam[] = @$data["i_is_inv"] ?? null;
          $arrParam[] = null;
          } else {
          $arrParam[] = null;
          $arrParam[] = null;
          $arrParam[] = null;
          }
          } else if ($data['i_purchase'] == 3) {
          $arrParam[] = null;
          $arrParam[] = null;
          $arrParam[] = null;
          $arrParam[] = null;
          }
          $arrParam[] = @$data["po_creditor_id"];
          $arrParam[] = $data["dc_expense_budget_type_id"];

          if ($data["tor_type_id"] == 2) {
          $arrParam[] = $data["dc_department_id"];
          }
          //test
          $arrParam[] = $data["dc_cost2_id"];
          $arrParam[] = $data["tag"];
          $arrParam[] = ($data["txtsub_cost"] == "*ถ้ามี" ? "" : $data["txtsub_cost"]);
          $arrParam[] = (($f_total_amt >= 500000) ? 1 : 0);
          $arrParam[] = $data["d_doc_ref"];
          $arrParam[] = $f_total_amt;
          $arrParam[] = $f_total_amt;
          $arrParam[] = $data["i_purchase"];
          $arrParam[] = $data["tor_type_id"];
          $arrParam[] = $data["i_yyyy"];
          //
          //=====================================================================
          $arrParam[] = $data["c_comment"];
          //        $arrParam[] = $data["i_enabled"];
          $arrParam[] = $data["dc_user_update_id"];
          $arrParam[] = $data["dc_user_update_cost_id"];
          $arrParam[] = $data["d_update"];
          $arrParam[] = $data["index_receive"];

          $sql = "UPDATE {$table}
          SET  c_name = ?
          , d_tor_date=?
          , d_doc_date=?
          , po_expense_id = ?
          , i_hire_type = ?
          , i_product_type = ?
          , i_is_inv = ?
          , i_type_fix_rate = ?
          , po_creditor_id = ?
          , dc_expense_budget_type_id = ? ";
          if ($data["tor_type_id"] == 2) {
          $sql .= " , dc_department_id = ?";
          }
          $sql .= " , dc_cost2_id = ?
          , tag = ?
          , txtsub_cost = ?
          , i_is_more = ?
          , d_doc_ref=?
          , f_total_amt =?
          , f_type_amt =?
          , i_purchase=?
          , tor_type_id=?
          , i_yyyy = ?
          , c_comment = ?
          , dc_user_update_id = ?
          , dc_user_update_cost_id = ?
          , d_update = ?
          , index_receive = ?
          WHERE {$keyName} = ?";

          $arrParam[] = $data["id"];


          //        echo $sql;
          //        print_r($arrParam);
          //        exit();
          $stmt = $db->QueryParam($sql, $arrParam);
          $id = $data["id"];
          } */
        break;
    case "DELETE":
        $sql = "UPDATE {$table} SET i_enabled = 2
                    WHERE {$keyName} = ?
                UPDATE " . DB_NMU_EIS . "bg_reserve_money set i_enable = 2
                    WHERE  bg_reserve_money_id = ? and i_sys = 3  and i_reserve = 1 ;
                    ";
        $arrParam = array($data["id"], $data["bg_reserve_money1_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "UP_SP_TOR_DTL":

        $root = "data";
        $data = array();
        $msg = "";

        // ============== //

        unset($data);
        unset($arrValue);
        // ============== //

        $data["sp_tor_id"] = $_REQUEST["id"];
        $data["dc_bg_budget_type_id"] = $_REQUEST["dc_expense_budget_type_idTxtID"];
        $data["po_expense_id"] = $_REQUEST["po_expense_idID"];
        $data["i_hire_type"] = $_REQUEST["i_hire_type2ID"];

        if ($_REQUEST["i_hire_type2ID"] == 1) {
            $data["i_product_type"] = $_REQUEST["i_product_type2ID"] ?? null;
            $data["i_is_inv"] = $_REQUEST["i_is_inv"] ?? null;
        } else {
            $data["i_product_type"] = '';
            $data["i_is_inv"] = '';
        }
        //----------------------------------------------------------------------------
        if ($_REQUEST["i_product_type2ID"] == 1) {
            $data["inv_mode_id"] = $_REQUEST["inv_mode_idID"] ?? null;
            $data["am_mode_id"] = 0;
        } else {
            $data["inv_mode_id"] = 0;
            $data["am_mode_id"] = $_REQUEST["am_mode_idID"] ?? null;
        }
        $data["sp_bg_mode_id"] = 0; //$_REQUEST["sp_bg_mode_id"] ?? null;
        $data["f_net_total_price"] = str_replace(",", "", $_REQUEST["f_net_total_amt"] ?? 0);
        $data["f_peroid_amt"] = str_replace(",", "", $_REQUEST["f_bg_peroid"] ?? 0);
        //----------------------------------------------------------------------------
        $data["c_name"] = $_REQUEST["c_nameID"];
        $data["f_unit_price"] = $_REQUEST["f_unit_costID"];
        $data["i_qty"] = str_replace(",", "", $_REQUEST["i_qtyID"]) / 1;
        $data["dc_unit_type_id"] = $_REQUEST["dc_unit_type_idID"];

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if ($_REQUEST["dtl_id"] > 0) {
            foreach ($data as $fldA => $value) {
                if ($addField == ('am_mode_id' || 'inv_mode_id')) {
                    $arrValue[] = $value;
                    $addField .= ", {$fldA} = ?";
                } else {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fldA} = ?";
                }
            }
            $arrValue[] = $_REQUEST["dtl_id"];
            $sql = "UPDATE sp_tor_dtl SET " . substr($addField, 1) . " WHERE sp_tor_dtl_id = ?";
            /*             * ****echo sql***** */
            //            $sql = (@$sqlMain) ? $sqlMain : $sql;
            //            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
            //            $sql = str_replace('?', '#-#', $sql);
            //            foreach ($arr as $fld => $value) {
            //                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            //            }
            //            echo $sql;
            //            exit;
            // /********************/
            //            echo $sql;
            //            print_r($arrValue);
            //            exit;
            $stmt = $db->QueryParam($sql, $arrValue);
        } else {
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                //                if ($addField == ('am_mode_id' || 'inv_mode_id')) {
                //                    $arrValue[] = $value;
                //                    $addField .= ", {$fld}";
                //                    $addValue .= ", ?";
                //                } else {
                //                    $arrValue[] = ($value != "") ? $value : null;
                //                    $addField .= ", {$fld}";
                //                    $addValue .= ", ?";
                //                }
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }

            $sql = "
            SET NOCOUNT ON
                INSERT INTO sp_tor_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
            //            echo $sql;
            //            print_r($arrValue);
            //            exit();
            $stmt = $db->QueryParam($sql, $arrValue);
        }

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        break;
    case "LISTDTL":

        ###########################################
        $root = "data";
        $data = array();
        /* ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD am_mode_id int;
          ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD inv_mode_id int;
          ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD sp_bg_mode_id int;
          ALTER TABLE NMU_ERP.dbo.sp_tor_dtl ADD f_peroid_amt decimal (18,2) ; */
        $sqlMain = "SELECT b.f_value
                        , b.c_name AS dc_unit_name
                        , a.dc_unit_type_id
                        , a.sp_tor_dtl_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , a.i_hire_type
                        , a.am_mode_id
                        , a.inv_mode_id
                        , a.sp_bg_mode_id
                        , a.f_peroid_amt
                        , a.i_is_inv
                        , isnull(a.i_product_type,0) as i_product_type
                        , a.c_name
                        , a.dc_bg_budget_type_id
                        , a.po_expense_id
                        , a.f_disc_price
                        , a.i_qty
                        , a.f_unit_price
                        , a.f_net_total_price
                        , a.i_pr_type1
                        , a.bg_reserve_money_id
                    FROM sp_tor_dtl a
                    LEFT JOIN dc_unit_type b ON b.dc_unit_type_id=a.dc_unit_type_id
                    WHERE a.sp_tor_id=?"; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);
        //  echo $sqlMain .'/*'; print_r($_REQUEST['tor_id']); echo '*/'; exit;
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['tor_id']));
        $i = @$start + 1;
        $total_sum = 0;
        while ($row = $db->Fetch($stmt)) {
            $total = $row["i_qty"] * $row["f_unit_price"];
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_dtl_id"]),
                "c_name" => $row["c_name"],
                "dc_unit_type_id" => $row["dc_unit_type_id"],
                "i_hire_type" => $row["i_hire_type"],
                "dc_unit_name" => $row["dc_unit_name"],
                "i_is_inv" => $row["i_is_inv"] == 1 ? true : false,
                "i_product_type" => $row["i_product_type"],
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "i_pr_type1" => $row["i_pr_type1"],
                "f_unit_price" => number_format($row["f_unit_price"], 2),
                "inv_mode_id" => intval($row["inv_mode_id"]),
                "am_mode_id" => intval($row["am_mode_id"]),
                "sp_bg_mode_id" => intval($row["sp_bg_mode_id"]),
                "f_peroid_amt" => intval($row["f_peroid_amt"]),
                "f_total_amt" => number_format($total, 2),
                "i_qty" => intval($row["i_qty"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_expense_budget_type_id" => intval($row["dc_bg_budget_type_id"]),
                "bg_reserve_money_id" => intval($row["bg_reserve_money_id"])
            );
            ${$root}[] = $temp;
            $total_sum += $total;
        }

        echo json_encode(array("debug" => true, 'totalSum' => $total_sum, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "sp_Per_dtl":
        $root = "data";
        $data = array();
        $arrParam = array($_REQUEST['id']);
        $sqlMain = "SELECT ROW_NUMBER() OVER(ORDER BY a.c_code,c.i_period  ASC) as row
                        , isnull(c.sp_tor_hdr_period_id,0) as sp_tor_hdr_period_id
                        ,(select c_code from sp_tor  where a.sp_tor_id = tor_id ) as pr_code
                        , isnull(c.i_period,0) as  i_period
                        ,CONVERT(varchar,d.d_arrive_date) as d_arrive_date
                        ,CONVERT(varchar,d.d_checking_date) as d_checking_date
                        ,CONVERT(varchar,h.d_create) as d_doc_billing
                        ,CONVERT(varchar,gg.d_create) as d_po_working_hdr
                        ,a.c_name
                        , ( select c_name from  sp_department where dc_department_id = (select  dc_department_id from sp_emp where sp_emp_id = a.sp_emp_id ) )  as dc_department
                        , case when d_arrive_date is  null then 'รอรับของ'
                        when d.c_code is null  and d.d_arrive_date is not null  then 'รอทำการตรวจรับ'
                        when d.c_code is not null and d.d_arrive_date is not null and gg.c_code_ref is null   then 'รอส่งเบิก'
                        when d.c_code is not null   and gg.c_code_ref is not null  then 'ส่งเบิกฝ่ายคลัง'
                        when isnull(gg.c_code_ref,'') != '' then 'ส่งเบิกฝ่ายคลัง'
                        else '' end as stats_period
                        ,a.c_code
                        , case when  i_is_last = 1 and gg.c_code_ref is not null then 'ปิดสัญญาแล้ว'
                        else 'กำลังดำเนินการ' end as stats_con
                        , aa.dc_expense_budget_type_id
                        , aa.po_expense_id
                        ,(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = aa.dc_expense_budget_type_id)   as dc_expense_budget_type
                        ,(select c_name from NMU_EIS.dbo.bg_expense where bg_expense_id = aa.po_expense_id ) as bg_expense
                        , (select c_name from NMU.dbo.dc_creditor where dc_creditor_id = a.dc_creditor_id  ) as dc_creditor_name
                        , (select c_tax_number_imp from NMU.dbo.dc_creditor where dc_creditor_id = a.dc_creditor_id  ) as c_tax_number_imp
                        , isnull(a.f_total_amt,0) as f_total_amt
                        , isnull(a.f_type_amt,0) as f_type_amt
                        ,convert(varchar,a.d_doc_date,120) as  d_doc_date
                        ,convert(varchar,a.d_due_date,120) as d_due_date
                        ,(select c_name from sp_emp where sp_emp_id = a.sp_emp_id) as sp_emp
                        ,case when d.c_arrive_code is not null  then    isnull(c.f_total_amt,0) else null end as f_period
                        ,case when d.c_code is not null  then    e.f_net_total_price else null end as f_chk
                        ,d.c_arrive_code
                        , d.c_code as  c_code_chk
                        , h.c_code as  c_code_bl
                        , gg.c_code_ref as  c_code_d
                        , g.c_file_pdf_hdr
                        , g.c_file_pdf_dtl
                        , g.i_is_url_pdf_hdr
                        , g.i_is_url_pdf_dtl
                from dbo.sp_tor_contract a
                inner join dbo.sp_tor aa on a.sp_tor_id =aa.tor_id
                left join dbo.sp_tor_hdr_period c on a.sp_tor_contract_id = c.sp_tor_contract_id and isnull(c.i_enabled,1) =1
                left join dbo.sp_check_period_hdr d on c.sp_tor_hdr_period_id = d.sp_tor_hdr_period_id
                left join dbo.sp_check_period_dtl e on d.sp_check_period_hdr_id = e.sp_check_period_hdr_id
                left join dbo.sp_check_billing_items h on h.sp_check_period_hdr_id = d.sp_check_period_hdr_id
                left join (SELECT
                                aa.po_working_hdr_id
                                ,i_is_url_pdf_hdr
                                ,i_is_url_pdf_dtl
                                ,c_file_pdf_hdr
                                ,c_url_pdf_hdr
                                ,c_file_pdf_dtl
                                ,c_url_pdf_dtl
                                ,c_file_pdf_pay
                                ,c_file_pdf_protest_hdr
                                ,c_file_pdf_protest_dtl
                                -- INTO #temp_s2
                                FROM " . DB_NMU_EIS . "po_working_item aa
                                INNER JOIN (
                                SELECT
                                    po_working_hdr_id
                                    ,MAX(isnull(po_working_item_id,0)) AS po_working_item_id
                                    ,MAX(isnull(CONVERT(FLOAT,i_sub_status),0)) AS max_sub_status
                                FROM  " . DB_NMU_EIS . "po_working_item
                                WHERE i_enable = 1
                                GROUP BY po_working_hdr_id ) bb ON aa.po_working_item_id = bb.po_working_item_id AND aa.po_working_hdr_id = bb.po_working_hdr_id AND bb.max_sub_status = i_sub_status
                ) g  on d.po_working_hdr_id = g.po_working_hdr_id
            left join " . DB_NMU_EIS . "po_working_hdr  gg  on g.po_working_hdr_id = gg.po_working_hdr_id
            where a.i_enabled = 1
            and a.c_code is not null
            and a.sp_tor_id = ?
            order by a.c_code,c.i_period
            ";
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if (@$_REQUEST["show_sql"]) {
            /*             * ****echo sql***** */
            $sql = (@$sqlMain) ? $sqlMain : $sql;
            $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

            $sql = str_replace('?', '#-#', $sql);
            foreach ($arr as $fld => $value) {
                $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            }
            echo $sql;
            exit;
            /*             * ***************** */
        }
        $i = @$start + 1;
        $total_sum = 0;
        while ($row = $db->Fetch($stmt)) {
            // $total = $row["i_qty"] * $row["f_unit_price"];
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "row" => intval($row["row"]),
                "i_period" => intval($row["i_period"]),
                "i_is_url_pdf_hdr" => $row["i_is_url_pdf_hdr"],
                "i_is_url_pdf_dtl" => $row["i_is_url_pdf_dtl"],
                "pr_code" => $row["pr_code"],
                "c_name" => $row["c_name"],
                "c_file_pdf_hdr" => $row["c_file_pdf_hdr"],
                "c_file_pdf_dtl" => $row["c_file_pdf_dtl"],
                "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])),
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])),
                "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])),
                "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])),
                "d_doc_billing" => ((empty($row["d_doc_billing"])) ? "" : $date->extDateBuddha($row["d_doc_billing"])),
                "d_po_working_hdr" => ((empty($row["d_po_working_hdr"])) ? "" : $date->extDateBuddha($row["d_po_working_hdr"])),
                "dc_department" => $row["dc_department"],
                "stats_period" => $row["stats_period"],
                "c_code" => $row["c_code"],
                "stats_con" => $row["stats_con"],
                "dc_expense_budget_type" => $row["dc_expense_budget_type"],
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "bg_expense" => $row["bg_expense"],
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "f_type_amt" => number_format($row["f_type_amt"], 2),
                "f_period" => number_format($row["f_period"], 2),
                "sp_emp" => $row["sp_emp"],
                "f_chk" => number_format($row["f_chk"], 2),
                "c_arrive_code" => $row["c_arrive_code"],
                "c_code_chk" => $row["c_code_chk"],
                "c_code_bl" => $row["c_code_bl"],
                "c_code_d" => $row["c_code_d"],
                    // "i_is_inv" => $row["i_is_inv"] == 1 ? true : false,
                    // "am_mode_id" => intval($row["am_mode_id"]),
                    // "sp_bg_mode_id" => intval($row["sp_bg_mode_id"]),
                    // "f_peroid_amt" => intval($row["f_peroid_amt"]),
                    // "f_total_amt" => number_format($total, 2),
                    // "i_qty" => intval($row["i_qty"]),
                    // "sp_tor_id" => intval($row["sp_tor_id"]),
                    // "po_expense_id" => intval($row["po_expense_id"]),
                    // "dc_expense_budget_type_id" => intval($row["dc_bg_budget_type_id"]),
                    // "bg_reserve_money_id" => intval($row["bg_reserve_money_id"])
            );
            ${$root}[] = $temp;
            $total_sum += $total;
        }

        echo json_encode(array("debug" => true, 'totalSum' => $total_sum, "totalCount" => $i, $root => ${$root}));
        exit();

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
