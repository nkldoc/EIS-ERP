<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

// config ปิด session แล้ว สามารถใช้ค่าที่อ่านมาได้
$userId = $_SESSION['user_id'] ?? null;

if (!$userId) {
    http_response_code(401);

    echo json_encode([
        'success' => false,
        'message' => 'Session expired',
    ]);

    exit;
} else {

    $info[1] = $_SESSION['user_id'];
    $info[2] = $_SESSION['dc_cost_id'];
    $info[3] = date('Y-m-d H:i:s'); // วันที่และเวลา ปัจจุบัน
}
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
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
$arr_stmt = array();
$msgTxt = null;

function upItemsStatus($data, $arr, $db) {

    $i_backword = $data["i_backword"] ?? null;
    $c_comment = $data["c_comment"] ?? null;

    $arrParam2[] = $data["id"]; //tor_id
    $arrParam2[] = $data["contract_id"] ?? null;
    $arrParam2[] = $arr["sp_status_hdr_id"];

    $arrParam2[] = ($i_backword == null) ? 1 : 0; //forword
    $arrParam2[] = ($i_backword != null) ? 1 : 0; //backword
    $arrParam2[] = $c_comment ?? null;
    $arri_seq = $arr["i_seq"] ?? null;
    $datai_seq = $data["i_seq"] ?? null;
    $arrParam2[] = ($i_backword == null ? ($datai_seq) : $arri_seq); //i_seq รับจาก arr database + 1 ถ้า backword รับจาก request
    $arrParam2[] = $data["d_update"];

    $arrParam2[] = $data["dc_user_update_id"];
    $arrParam2[] = $data["dc_user_update_cost_id"];
    $arrParam2[] = $data["d_update"];

    $d_update = date('Y-m-d');

    $tor_status_id = $_REQUEST['tor_status_id'] ?? null;
    $tor_status_id = ($tor_status_id) ? $tor_status_id : 0;
    $date_pa = " and sp_status_hdr_id = {$tor_status_id}";

    $sql = "";
    $sql .= " UPDATE dbo.sp_tor_item set d_sent_date ='{$d_update}' where tor_id ={$data['id']} $date_pa ;";
    $sql .= " INSERT INTO dbo.sp_tor_item (tor_id , contract_id
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
            VALUES ( ?, ?
                    , ?
                    , ?, ?
                    , ?, ?, ?
                    , ?, ?, ?,
                    (SELECT d_tor_status_date FROM sp_tor_item WHERE tor_id = {$data["id"]}
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
            ) ;";
    $arrParam2[] = $data["id"];

    //    echo $sql;
    //    print_r($arrParam2);
    //    exit();

    return $db->QueryParam($sql, $arrParam2);
}

//
/*
  function upPA($data, $arr, $db) {

  $i_backword = $data["i_backword"] ?? null;

  $arrParam3[] = $data["id"]; //tor_id
  $arrParam3[] = $data["contract_id"] ?? null;

  // $arrParam3[] = $data["i_period_month_end"] ?? null;
  // $arrParam3[] = $data["i_peroid_product_end"] ?? null;

  $arrParam3[] = $arr["sp_status_hdr_id"];

  $arrParam3[] = ($i_backword == null) ? 1 : 0; //forword
  $arrParam3[] = (@$data["i_backword"] != null) ? 1 : 0; //backword
  $arrParam3[] = $data["c_comment"] ?? null;
  $arrParam3[] = ($i_backword == null ? ($arr["i_seq"]) : $data["i_seq"]); //i_seq รับจาก arr database + 1 ถ้า backword รับจาก request
  $arrParam3[] = $data["d_update"];

  $arrParam3[] = $data["dc_user_update_id"];
  $arrParam3[] = $data["dc_user_update_cost_id"];
  $arrParam3[] = $data["d_update"];

  $sql = "INSERT INTO dbo.sp_tor_pa_item (tor_id , contract_id
  --, i_period_month_end , i_peroid_product_end
  , sp_status_hdr_id
  , i_forword , i_backword
  , c_comment , i_step , d_tor_status_date
  , act_user_id , act_cost_id , act_date_dt)
  VALUES ( ?, ?
  --, ?, ?
  , ?
  , ?, ?
  , ?, ?, ?
  , ?, ?, ?);";
  $arrParam3[] = $data["id"];
  return $db->QueryParam($sql, $arrParam3);
  }
 */
//แจ้งเตือนผ่านไลน์
function lineNotif($msgg) {

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    date_default_timezone_set("Asia/Bangkok");
    $sToken = "KPXXAppt3dElykpoSxJsZqGs2SF0fgwoQUW5YAXKbDB";
    $sMessage = $msgg;
    $chOne = curl_init();
    curl_setopt($chOne, CURLOPT_URL, "https://notify-api.line.me/api/notify");
    curl_setopt($chOne, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($chOne, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($chOne, CURLOPT_POST, 1);
    curl_setopt($chOne, CURLOPT_POSTFIELDS, "message=" . $sMessage);
    $headers = array('Content-type: application/x-www-form-urlencoded', 'Authorization: Bearer ' . $sToken . '',);
    curl_setopt($chOne, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($chOne, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($chOne);

    //Result error
    if (curl_error($chOne)) {
        return 'error:' . curl_error($chOne);
    } else {
        return $result_ = json_decode($result, true);
        //        echo "status : " . $result_['status'];
        //        echo "message : " . $result_['message'];
    }
    curl_close($chOne);
}

//แจ้งเตือนผ่านไลน์
//
/*
  function upAlert($data, $arr, $db) {

  $i_backword = $data["i_backword"] ?? null;

  $arrParam4[] = $data["id"]; //tor_id
  $arrParam4[] = $data["contract_id"] ?? null;

  // $arrParam4[] = $data["i_period_month_end"] ?? null;
  // $arrParam4[] = $data["i_peroid_product_end"] ?? null;

  $arrParam4[] = $arr["sp_status_hdr_id"];

  $arrParam4[] = ($i_backword == null) ? 1 : 0; //forword
  $arrParam4[] = (@$data["i_backword"] != null) ? 1 : 0; //backword
  $arrParam4[] = $data["c_comment"] ?? null;
  $arrParam4[] = ($i_backword == null ? ($arr["i_seq"]) : $data["i_seq"]); //i_seq รับจาก arr database + 1 ถ้า backword รับจาก request
  $arrParam4[] = $data["d_update"];

  $arrParam4[] = $data["dc_user_update_id"];
  $arrParam4[] = $data["dc_user_update_cost_id"];
  $arrParam4[] = $data["d_update"];

  $sql = "INSERT INTO dbo.sp_tor_alert_item (tor_id , contract_id
  --, i_period_month_end , i_peroid_product_end
  , sp_status_hdr_id
  , i_forword , i_backword
  , c_comment , i_step , d_tor_status_date
  , act_user_id , act_cost_id , act_date_dt)
  VALUES ( ?, ?
  --, ?, ?
  , ?
  , ?, ?
  , ?, ?, ?
  , ?, ?, ?);";
  $arrParam4[] = $data["id"];
  return $db->QueryParam($sql, $arrParam4);
  }
 */
//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;
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



        if (($data['tor_status_id'] ?? null) == 13) {

            $arrParam[] = $data["c_comment"];
            $arrParam[] = 13;
            $arrParam[] = 3;
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["id"];
        } elseif (($data['tor_status_id'] ?? null) == 24) {

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
    //----------------------------------------------------------------
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
    case "EDIT_UPDATE_OVERLAP":
        // print_r($_SESSION);
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $data["i_is_overlap"];
        $arrParam[] = $data["i_type_bg"];
        $arrParam[] = $data["confirm_overlap"];
        $arrParam[] = $data["id"];

        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $data["i_overlap"];
        $arrParam[] = $data["sp_tor_contract_id"];

        $sql = "UPDATE {$table}
                    SET
                        dc_user_update_id = ?
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
                        , i_overlap = ?
                    WHERE sp_tor_contract_id = ?
                    ";
        $arrParam[] = $data["id"];
        $stmt = $db->QueryParam($sql, $arrParam);

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
    //----------------------------------------------------------------
    case "UPDATEFORMSTSATUS":
        $tor = $db->GetDataBySQL("select tor_status_id,sp_emp_id,c_bidding from dbo.sp_tor where tor_id = ?", array($data["id"])); //a.tor_status_id not in (24,25,26)
        $emp_id = $data["sp_emp_id"] ?? null;
        if ($emp_id == '') {
            $emp_id = $tor['sp_emp_id'];
        } else if ($tor['tor_status_id'] == 24) { //มอบหมายให้ผู้ปฎิบัติงาน
            $emp_id = $data["sp_emp_id"];
        }
        $c_bidding = $data["c_bidding"] ?? null;
        if ($c_bidding == '') {
            $c_bidding = $tor['c_bidding'];
        } else { //มอบหมายให้ผู้ปฎิบัติงาน
            $c_bidding = $data["c_bidding"];
        }

        $arrParam[] = $data["dc_cnt_id"] ?? NULL;
        $arrParam[] = $emp_id;
        $arrParam[] = $c_bidding;
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
                        , c_bidding = ?
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
                        , c_bidding = ?
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
    //----------------------------------------------------------------
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

        // $stmt = upPA($data, $arr, $db);
        // $stmt2 = upAlert($data, $arr, $db);
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
        $arrParam[] = $data["i_budget_year"] ?? NULL;
        // $arrParam[] = $data["dc_expense_budget_type_id"] ?? NULL;
        // $arrParam[] = $data["po_expense_id"] ?? null;
        // $arrParam[] = $data["dc_cost_id"] ?? null;
        // $arrParam[] = $data["dc_cost2_id"] ?? null;
        // $arrParam[] = $data["d_tor_date"] ?? null;
        // $arrParam[] = $data["tor_type_id"] ?? null;
        // $arrParam[] = $data["d_doc_ref"] ?? null;
        // $arrParam[] = $data["dc_department_id"] ?? NULL;
        // $arrParam[] = $data["c_comment"] ?? NULL;
        // $arrParam[] = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0;

        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s");
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
                                -- , c_comment = ?
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
        if (($_REQUEST['tor_status_id'] ?? null) == 10057) {
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
                // $stmt2 = upAlert($data, $arr, $db);
                $stmt3 = upItemsStatus($data, $arr, $db); //else
            } else if ($type == 2) { //pa
                // $stmt2 = upPA($data, $arr, $db);
                $stmt3 = upItemsStatus($data, $arr, $db); //else
            } else if ($type == 3) { // all
                // $stmt = upPA($data, $arr, $db);
                // $stmt2 = upAlert($data, $arr, $db);
                $stmt3 = upItemsStatus($data, $arr, $db); //else
            } else if ($type == 4) { //การมอบหมายให้ฝ่ายงาน
                $stmt2 = upItemsStatus($data, $arr, $db); //else
            } else {
                // $stmt = upPA($data, $arr, $db);
                // $stmt2 = upAlert($data, $arr, $db);
                $stmt3 = upItemsStatus($data, $arr, $db); //else
            }
        }

        //    echo $sql;
        //    echo "<br>";
        //    echo $type;
        //    print_r($stmt);
        //    exit();
        break;
    case "UPSTATUS":
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
            $stmt2 = upItemsStatus($data, $arr, $db);
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
        if ($stmt) {
            $stmt2 = upItemsStatus($data, $arr, $db);
        }
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


        $arrParam[] = $data["po_expense_id"] ?? null;
        //  $arrParam[] = $data["po_creditor_id"];
        $arrParam[] = $data["dc_expense_budget_type_id"] ?? null;
        // $arrParam[] = $data["bg_budget_dtl_project_id"];
        // if (@$data["i_is_rename"] == 1) {
        //     $arrParam[] = $data["c_budget_dtl_project"];
        // } else {
        //     $arrParam[] = $data["c_budget_dtl_project_id"];
        // }
        //  $arrParam[] = $data["dc_department_id"];TOR210600013
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

        $arrParam[] = $data["i_type_bg"];
        $arrParam[] = $data["sp_type_id"];
        $arrParam[] = $data["i_enabled"];
        $arrParam[] = $_SESSION['dc_department_id'];
        $arrParam[] = $_SESSION['dc_department_id'];
        $arrParam[] = $data["dc_user_create_id"];
        $arrParam[] = $data["dc_user_create_cost_id"];
        $arrParam[] = $data["d_create"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["index_receive"];

        $sql = "SET NOCOUNT ON
        INSERT INTO {$table} (c_name
            , d_tor_date
            , d_doc_date
                        , po_expense_id
                        --, po_creditor_id
                        , dc_expense_budget_type_id
                        --, bg_budget_dtl_project_id
                        --, c_budget_dtl_project
                        -- , dc_department_id
                        , dc_cost_id
                        , dc_cost2_id
                        , tag
                        , txtsub_cost
                        , i_is_more
                        , i_is_rename
                        , d_doc_ref
                        , f_total_amt
                        , f_type_amt
                        , i_purchase
                        , i_hire_type
                        , i_product_type
                        , i_is_inv
                        , i_type_fix_rate
                        , tor_type_id
                        , i_yyyy
                        , i_type_bg
                        , sp_type_id
                        , i_enabled
                        , dc_user_create_department_id , dc_user_update_department_id
                        , dc_user_create_id, dc_user_create_cost_id, d_create
                        , dc_user_update_id, dc_user_update_cost_id, d_update
                        , index_receive
                        )
                VALUES ( ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,? ,? ,? ,? ,?,?,?
                        , ?, ?
                        , ? , ?
                        , ?, ?, ?
                        , ?,?,?);
                        SELECT @@IDENTITY as sp_tor_id;";

        $stmt = $db->QueryParam($sql, $arrParam);
        $ss_id = $db->Fetch($stmt);

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
            $stmt = $db->QueryParam($sql, $arrParam);
        }

        break;
    /* menu 1 */
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
        $arrParam["dc_expense_budget_type_id"] = $data["dc_expense_budget_type_id"];

        if ($data["tor_type_id"] == 2) {
            $arrParam["dc_department_id"] = $data["dc_department_id"] ?? null;
        }
        //test
        $arrParam["dc_cost2_id"] = $data["dc_cost2_id"];
        $arrParam["tag"] = $data["tag"];
        $arrParam["i_type_bg"] = $data["i_type_bg"];
        $arrParam["txtsub_cost"] = ($data["txtsub_cost"] == "*ถ้ามี" ? "" : $data["txtsub_cost"]);
        $arrParam["i_is_more"] = (($f_total_amt >= 500000) ? 1 : 0);
        $arrParam["d_doc_ref"] = $data["d_doc_ref"];
        $arrParam["f_total_amt"] = $f_total_amt;
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

        foreach ($arrParam as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
                {$fld} = ?";
        }


        $sql = "UPDATE {$table} SET " . substr($addField, 1) . " WHERE {$keyName} = ?";
        $arrValue[] = $data["id"];
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
                    WHERE {$keyName} = ?";
        $arrParam = array($data["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
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

        function viewByLevel($al) {
            $user_id = $_SESSION["user_id"] ?? null;
            $emp_id = $_SESSION["sp_emp_id"] ?? null;
            $i = $_SESSION['i_level'] ?? 0;
            $i_type_user = $_SESSION['i_type_user'] ?? 0;
            $dc_department_id = $_SESSION['dc_department_id'] ?? null;

            $alias = ($al == '') ? '' : $al . '.';
            if ($i_type_user == 2) { //admin
                $ret = '';
            } elseif ($i_type_user == 1) { //employee
                switch ($i) {
                    case 3:
                        $ret = ($dc_department_id != 6) ? (' AND ' . $alias . 'tor_status_id not in (24,25,26) AND ' . $alias . 'sp_emp_id= ' . $emp_id) : (' and ' . $alias . 'dc_user_create_id= ' . $user_id);
                        break;
                    case 2:
                        $ret = '';
                        break;
                    default:
                        $ret = '';
                }
            } else { //outsource
            }
            return $ret;
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
        $act = $_REQUEST["act"] ?? null;
        $tor_type_show = $_REQUEST['tor_type_show'] ?? null;
        $i_post = $_REQUEST['i_post'] ?? null;

        if ($type == "sp_working_dtl_all") {
            $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
            $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
            $i_pa = $_REQUEST["i_pa"] ?? null; // status id


            $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
            $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
            $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

            if ($act == "SEARCH") {
                $value = $_REQUEST['value'] ?? null;
                $filter = $_REQUEST['filter'] ?? null;
                $dc_creditor_id = $_REQUEST['dc_creditor_id'] ?? null;
                //                $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
                //                $wh .= ($_REQUEST['value'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
                //                $wh .= (@$_REQUEST['tag'] != "") ? " and a.tag like '%" . @$_REQUEST['tag'] . "%'" : "";
                //                $wh .= ($_REQUEST['dc_cost3_id'] != "0") ? " and a.dc_cost2_id like '%" . $_REQUEST['dc_cost3_id'] . "%'" : "";
                //                $wh .= ($_REQUEST['c_name'] != '') ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";

                $wh .= ($value != '' || $filter != '') ? " and a.{$filter} like '%{$value}%'" : "";
                $wh .= ($dc_creditor_id != '') ? " AND EXISTS (SELECT 1 FROM dbo.sp_tor_victory WHERE sp_tor_id = a.tor_id and dc_creditor_id = {$dc_creditor_id})" : "";

                if ($i_post != 0) {
                    if ($i_post == 1) {
                        $wh .= " and tor_status_id is not null";
                    } else {
                        $wh .= " and tor_status_id is null";
                    }
                }
            } else {
                $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
            }



            $arrParam = array();
            $arrCountParam = array();
            $sqlTempTable = "SELECT a.tor_id
                                , a.po_expense_id
                                , a.po_creditor_id
                                , a.dc_expense_budget_type_id
                                , a.bg_budget_dtl_project_id
                                , ISNULL(a.dc_department_id,0) AS dc_department_id
                                , a.dc_cost_id
                                , a.dc_cost2_id
                                , a.i_is_rename
                                , a.index_receive
                                , a.txtsub_cost
                                , a.tor_type_id
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
                                , a.i_is_register
                                , ROW_NUMBER() OVER (ORDER BY convert(timestamp,a.d_update) DESC , a.i_edit DESC, a.tor_id DESC) AS row
                            FROM dbo.sp_tor a
                            WHERE 1=1 and a.i_is_notor<>1 and a.i_enabled = 1 " . $wh . viewByLevel('a'); //
            //NOT EXISTS (SELECT 1 FROM dbo.sp_tor_contract WHERE sp_tor_id = a.tor_id) --เ
            //                         echo $sqlTempTable;
            //                         exit;
            $arrParam[] = $start;
            $arrParam[] = $limit;
            $sqlMain = "SELECT a.* , s.c_code
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
                            , convert(varchar(10), DATEADD(day, (select top 1 [i_alarm] from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id), getdate()), 120) AS DateAdd1
                            , convert(varchar(10), DATEADD(day, (select top 1 [i_day] from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id), getdate()), 120) AS DateAdd2
                            , (select top 1 [i_alarm] from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id) AS i_alarm
                            , (select top 1 [i_day] from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id) AS i_day
                            , (select top 1 [c_code] from dbo.sp_status_hdr where sp_status_hdr_id=s.tor_status_id) AS menuCode
                            , ISNULL(s.i_parent,0) AS i_parent
                            , ISNULL(s.i_is_parent,0) AS i_is_parent
                            , s.start_date
                            , s.end_date
                            , s.i_edit

                            , s.i_is_upload
                            , s.upload
                            , s.c_comment
                            , s.c_remake
                            , s.i_yyyy

                            , s.sp_type_id
                            , CONVERT(VARCHAR, s.d_doc_date, 120) AS d_doc_date
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , s.po_creditor_id
                            , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
                            , (SELECT TOP 1 c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id=c.dc_creditor_id)  AS po_creditor_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, s.d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name

        , convert(varchar, s.d_update, 120) as d_update
        , convert(varchar, s.d_egp_date, 120) as d_egp_date
        , s.dc_expense_budget_type_id
        , s.f_type_amt
        , isnull(s.bg_reserve_money1_id,(select top 1 bg_reserve_money_id from sp_tor_dtl where sp_Tor_id = s.tor_id)) as bg_reserve_money1_id
        ,CASE WHEN isnull(s.bg_reserve_money1_id,0)  =   0 THEN  (select top 1 isnull(bg_reserve_money_id,0) from dbo.sp_tor_dtl where sp_tor_id = s.tor_id)
        ELSE isnull(s.bg_reserve_money1_id,0)  END as bg_check_id
        , s.dc_expense_budget_type2_id
        , s.f_type2_amt
         , s.bg_reserve_money2_id
        , s.dc_expense_budget_type3_id
        , s.f_type3_amt
         , s.bg_reserve_money3_id
        , s.dc_expense_budget_type4_id
        , s.f_type4_amt
         , s.bg_reserve_money4_id
        , s.dc_expense_budget_type5_id
        , s.f_type5_amt
         , s.bg_reserve_money5_id
        , s.i_pr_type1
        , s.i_type_contract
        , s.i_pr_type2
        , s.i_pr_type3
        , s.i_pr_type4
        , s.i_pr_type5
        , s.i_amount_bg
        , isnull(c.c_code,'-') as c_contract_code
        , (select top 1 i_type from sp_type_bg where i_value =  s.i_type_bg ) as sp_type_bg
        , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
        , (select top 1 c_comment from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as tor_delete_comment
        , (select top 1 i_edit from sp_tor_bg_log where s.tor_id = sp_tor_id  ORDER BY d_create  desc ) as sp_bg_edit
        , isnull((select top 1 sp_cate_id from NMU_ERP.dbo.[view_sp_tor_work_socore] where sp_tor_id=a.tor_id order by sp_cate_id desc),0) as sp_cate_id "
                    . " FROM ({$sqlTempTable}) a "
                    . " INNER JOIN dbo.sp_tor s ON s.tor_id=a.tor_id"
                    . " LEFT JOIN dbo.sp_tor_contract c ON c.sp_tor_id=a.tor_id and c.i_enabled=1"
                    . " WHERE a.row > ? AND a.row <= ?";
            //                         print_r($arrParam);
            //                                     echo $sqlMain;
            //                        exit;
            $stmt = $db->QueryParam($sqlMain, $arrParam);
            $i = $start + 1;
            $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
            $sp_contract_year = (($_REQUEST['tor_status_id'] ?? null) == 20) ? $db->GetDataBySQL("SELECT a.i_year_be FROM dbo.sp_contract_year a WHERE  a.i_enabled = ? ", array($_REQUEST["i_enabled"])) : "";

            function getToStep($c) { //หารายการต่อไป
                global $db;
                $chk = true;
                if ($c == "ST0004") { //ตรวจสอบข้อมูล
                    $chk = false;
                } else if ($c == "ST0008") { //egp ลงนามในสัญญา
                    $chk = true;
                    $c = "ST0009";
                } else if ($c == "ST0009") { //egp รายละเอียดในสัญญา
                    $chk = true;
                    $c = "ST0010";
                } else if ($c == "ST0007") { //egp เจาะจง
                    $chk = true;
                    $c = "ST0008";
                } else if ($c == "ST0006") { //egp เจาะจง
                    $chk = true;
                    $c = "ST0007";
                } else if ($c == "ST0005") { //egp เจาะจง
                    $chk = true;
                    $c = "ST0006";
                } else if ($c == "ST1005") { //egp e-bidding
                    $chk = true;
                    $c = "ST1006";
                } else if ($c == "ST1006") { //egp e-bidding
                    $chk = true;
                    $c = "ST1007";
                } else if ($c == "ST1007") { //egp e-bidding
                    $chk = true;
                    $c = "ST1008";
                } else if ($c == "ST1008") { //egp e-bidding
                    $chk = true;
                    $c = "ST1009";
                } else if ($c == "ST1009") { //egp e-bidding
                    $chk = true;
                    $c = "ST1010";
                } else if ($c == "ST1008") { //egp เจาะจง
                    $chk = true;
                    $c = "ST1009";
                } else if ($c == "ST3005") { //egp เจาะจง
                    $chk = true;
                    $f = $db->GetDataBySQL("select f_total_amt from dbo.sp_tor where c_code=?", array($c));
                    if ($f <= 50000) {
                        $c = "ST3006";
                    } else {
                        $c = "ST3007";
                    }
                } else if ($c == "ST3006" || "ST3007" || "ST1010" || "ST2006") { //เสนอ ราคา
                    $c = "ST0005";
                }

                $c_code = "{$c}";

                return ($chk) ? $c_code : $c;
            }

            while ($row = $db->Fetch($stmt)) {
                $i_type_bg = null;
                $i_type_bgTxt = null;
                $i_edit = null;
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
                        $i_type_bgTxt = 'PR ปกติ';
                        break;
                    case 2:
                        $i_type_bg = "color:#116CEF";
                        $i_type_bgTxt = 'PR หลักโครงการต่อเนื่อง(ไม่จองเงิน)';
                        break;
                    case 3:
                        $i_type_bg = "color:#b085f5";
                        $i_type_bgTxt = 'PR ย่อยโครงการต่อเนื่อง(จองเงิน)';
                        break;
                    case 4:
                        $i_type_bg = "color:#CD8114";
                        $i_type_bgTxt = 'PR ไม่จองเงิน (ใช้เงินกันเหลื่อม)';
                        break;
                    case 5:
                        $i_type_bg = "color:#52CD14";
                        $i_type_bgTxt = 'PR จองเงินข้ามส่งเบิก';
                        break;
                    case 6:
                        $i_type_bg = "color:#52CD14";
                        $i_type_bgTxt = 'PR จองเงินทำถึงสัญญา';
                        break;
                    case 7:
                        $i_type_bg = "color:#52CD14";
                        $i_type_bgTxt = 'PR จองเงินทำถึงตรวจรับ';
                        break;
                    case 8:
                        $i_type_bg = "color:#AE00FF";
                        $i_type_bgTxt = 'PR จองเงินตรวจรับ';
                        break;
                    case 11:
                        $i_type_bg = "color:#B8860B";
                        $i_type_bgTxt = 'PR ไม่จองเงินทำถึงตรวจรับ';
                        break;
                    case 12:
                        $i_type_bg = "color:#000080";
                        $i_type_bgTxt = 'PR ก่อนปีงบประมาณ';
                        break;
                    default:
                        $i_type_bg = "color:#F43217";
                        $i_type_bgTxt = '';
                        break;
                }
                if ($row["sp_bg_edit"] == 1) {
                    $i_type_bg = "color:#F5B041";
                    $i_type_bgTxt = 'PR อยู่ระหว่างแก้ไขงบประมาณ';
                } else if ($row["sp_bg_edit"] == 2) {
                    $i_type_bg = "color:#006400";
                    $i_type_bgTxt = 'รับเรื่องคืนจากฝ่ายจัดสรร';
                }
                $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
                $i_type_bgTxt = "<b style='{$i_type_bg}'>" . $i_type_bgTxt . "</b>";
                $temp = array(
                    "no" => $i++,
                    "id" => intval($row["tor_id"]),
                    "sp_cate_id" => intval($row["sp_cate_id"]),
                    "sp_type_bg" => intval($row["sp_type_bg"]),
                    "sp_contract_year" => $sp_contract_year,
                    "sp_tor_contract_id" => intval($row["sp_contract_id"] ?? 0),
                    "i_alarm" => intval($row["i_alarm"]),
                    "i_day" => intval($row["i_day"]),
                    "i_type_bg" => intval($row["i_type_bg"]),
                    "i_type_bgTxt" => $i_type_bgTxt,
                    "i_step" => intval($row["i_step"]),
                    "sp_bg_edit" => intval($row["sp_bg_edit"]),
                    "i_edit" => intval($row["i_edit"]),
                    "c_nameStatus" => $sp ?? $row["c_name"], //
                    "sp_tor_delete" => $row["sp_tor_delete"],
                    "c_contract_code" => $row["c_contract_code"],
                    "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
                    "tor_delete_comment" => $row["tor_delete_comment"],
                    "i_receive" => intval($row["i_receive"] ?? 0),
                    "i_is_entrance" => intval($row["i_is_entrance"] ?? 0),
                    "i_is_register" => intval($row["i_is_register"]),
                    "i_forword" => intval($row["i_forword"]),
                    "i_backword" => intval($row["i_backword"]),
                    "index_receive" => $row["index_receive"],
                    "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                    "c_code" => $row["c_code"],
                    "i_bg_type" => intVal($row["i_bg_type"] ?? 0),
                    "i_is_request" => intVal($row["i_is_request"] ?? 0),
                    "contract_no" => $row["contract_no"] ?? null,
                    "menuCode" => getToStep($row["menuCode"]), //get go to step ()
                    "i_entrance" => ($row["menuCode"] == "ST0004" ? 1 : 0),
                    "c_codeStatus" => $c_codeStatus,
                    "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
                    "i_is_more" => intval($row["i_is_more"]),
                    "f_total_amt" => number_format($row["f_total_amt"], 2),
                    "i_is_rename" => intval($row["i_is_rename"]),
                    "c_budget_dtl_project" => $row["c_budget_dtl_project"],
                    "c_name" => $row["c_name"],
                    "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
                    "c_code_status" => $row["c_code_status"],
                    "c_name_status" => $row["c_name_status"],
                    "tor_status_id" => $row["tor_status_id"],
                    "bg_check_id" => intval($row["bg_check_id"]),
                    "dc_cost_id" => intval($row["dc_cost_id"]),
                    "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                    "dc_cost2_id" => intval($row["dc_cost2_id"]),
                    "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
                    "sp_emp_name" => $row["c_emp_name"],
                    "txtsp_emp_idID" => $row["c_emp_name"],
                    "sp_emp_id" => intval($row["sp_emp_id"]),
                    "dc_department_id" => intval($row["dc_department_id"]),
                    "c_department" => $row["c_department"],
                    "i_parent" => $row["i_parent"],
                    "i_is_parent" => $row["i_is_parent"],
                    "d_doc_ref" => $row["d_doc_ref"],
                    "i_year" => $row["i_yyyy"],
                    "i_yyyy" => $row["i_yyyy"],
                    "c_year" => intval($row["i_yyyy"] + 543),
                    "tor_type_id" => $row["tor_type_id"],
                    "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
                    "i_purchase" => intval($row["i_purchase"]),
                    "c_purchase" => $i_purchase[$row["i_purchase"]],
                    "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                    "po_expense_id" => intval(($row["po_expense_id"] == 0 ? ($row["po_expense_main_id"] ?? 0) : $row["po_expense_id"])),
                    "po_expense_main_id" => intval($row["po_expense_main_id"] ?? 0),
                    "dc_user_create_id" => $row["c_create_name"],
                    "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                    "DateAdd1" => ((empty($row["DateAdd1"])) ? "" : $date->extDateBuddha($row["DateAdd1"])), //d_tor_date d_tor_status_date
                    "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
                    "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
                    "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
                    "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
                    "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
                    "d_egp_date" => ((empty($row["d_egp_date"])) ? "" : $date->extDateBuddha($row["d_egp_date"])), //d_tor_date
                    "d_create" => $date->extDateBuddha($row["d_create"]), //
                    "dc_user_update_id" => $row["c_update_name"],
                    "dc_user_update_cost_id" => $row["c_cost_update_name"],
                    "d_update" => $date->extDateBuddha($row["d_update"]),
                    "start_date" => $date->extDateBuddha($row["start_date"]),
                    "end_date" => $date->extDateBuddha($row["end_date"]),
                    "i_enabled" => intval($row["i_enabled"]),
                    "tor_hdr_dtl" => intval($row["tor_hdr_dtl"] ?? 0),
                    "c_comment" => $row["c_comment"],
                    "c_comment_status" => $row["c_comment_status"] ?? null,
                    "c_remake" => $row["c_remake"],
                    "po_creditor_id" => intval($row["po_creditor_id"]),
                    "po_creditor_idTxt" => $row["po_creditor_idTxt"],
                    "i_type_contract" => $row["i_type_contract"],
                    "i_hire_type" => $row["i_hire_type"],
                    "i_is_inv" => $row["i_is_inv"],
                    "i_type_fix_rate" => $row["i_type_fix_rate"],
                    "i_product_type" => $row["i_product_type"],
                    "i_delivery_date" => $row["i_delivery_date"],
                    "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                    "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
                    "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
                    "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
                    "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),
                    "f_type_amt" => number_format($row["f_type_amt"], 2),
                    "f_type2_amt" => number_format($row["f_type2_amt"], 2),
                    "f_type3_amt" => number_format($row["f_type3_amt"], 2),
                    "f_type4_amt" => number_format($row["f_type4_amt"], 2),
                    "f_type5_amt" => number_format($row["f_type5_amt"], 2),
                    "i_pr_type1" => $row["i_pr_type1"],
                    "i_pr_type2" => $row["i_pr_type2"],
                    "i_pr_type3" => $row["i_pr_type3"],
                    "i_pr_type4" => $row["i_pr_type4"],
                    "i_pr_type5" => $row["i_pr_type5"],
                    "c_emp_name" => $row["c_emp_name"],
                    "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
                    "bg_reserve_money2_id" => $row["bg_reserve_money2_id"],
                    "bg_reserve_money3_id" => $row["bg_reserve_money3_id"],
                    "bg_reserve_money4_id" => $row["bg_reserve_money4_id"],
                    "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],
                    "i_amount_bg" => $row["i_amount_bg"] == null ? 1 : $row["i_amount_bg"],
                );
                ${$root}[] = $temp;
            }

            $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
            $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
            echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
            exit();
        } else if ($type == "sp_working_dtl") {
            $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
            $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
            $i_pa = $_REQUEST["i_pa"] ?? null; // status id


            $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
            $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
            $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

            if ($act == "SEARCH") {
                // $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
                $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
                $wh .= (@$_REQUEST['tag'] != "") ? " and a.tag like '%" . @$_REQUEST['tag'] . "%'" : "";
                $wh .= ($_REQUEST['dc_cost3_id'] != "0") ? " and a.dc_cost2_id like '%" . $_REQUEST['dc_cost3_id'] . "%'" : "";
                $wh .= ($_REQUEST['c_name'] != '') ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
                $wh .= ($_REQUEST['d_doc_ref'] != '') ? " and a.d_doc_ref like '%" . $_REQUEST['d_doc_ref'] . "%'" : "";
                $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
                if ($i_post != 0) {
                    if ($i_post == 1) {
                        $wh .= " and tor_status_id is not null";
                    } else {
                        $wh .= " and tor_status_id is null";
                    }
                }
            } else {
                $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
            }


            $arrParam = array();
            $arrCountParam = array();
            $sqlTempTable = "SELECT a.tor_id
                                , a.po_expense_id
                                , a.po_creditor_id
                                , a.dc_expense_budget_type_id
                                , a.bg_budget_dtl_project_id
                                , ISNULL(a.dc_department_id,0) AS dc_department_id
                                , a.dc_cost_id
                                , a.dc_cost2_id
                                , a.i_is_rename
                                , a.index_receive
                                , a.txtsub_cost
                                , a.tor_type_id
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
                            WHERE a.i_type_bg <> 3 and a.i_is_notor<>1 and i_enabled = 1 " . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //
            //             echo $sqlTempTable;
            //             exit;
            $arrParam[] = $start;
            $arrParam[] = $limit;
            $sqlMain = "SELECT a.* , s.c_code
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
                            , s.sp_type_id
                            , CONVERT(VARCHAR, s.d_doc_date, 120) AS d_doc_date
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , s.po_creditor_id
                            , (select top 1 i_enabled from sp_tor_delete where s.tor_id = sp_tor_id and i_enabled = 1 ) as sp_tor_delete
                            , (SELECT TOP 1 c_name FROM dbo.po_creditor WHERE po_creditor_id=s.po_creditor_id)  AS po_creditor_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                            , CONVERT(VARCHAR, d_update, 120) AS d_update "
                    . " FROM ({$sqlTempTable}) a "
                    . " INNER JOIN dbo.sp_tor s ON s.tor_id=a.tor_id"
                    . " WHERE a.row > ? AND a.row <= ?";
            //             print_r($arrParam);
            //                         echo $sqlMain;
            //            exit;
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
                $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
                // pure
                $temp = array(
                    "no" => $i++,
                    "id" => intval($row["tor_id"]),
                    "sp_tor_delete" => $sp,
                    "sp_contract_id" => $row["sp_contract_id"],
                    "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                    "i_product_type" => intval($row["i_product_type"]),
                    "i_hire_type" => intval($row["i_hire_type"]),
                    "i_is_inv" => intval($row["i_is_inv"]),
                    "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                    "i_delivery_date" => intval($row["i_delivery_date"]),
                    "i_type_bg" => intval($row["i_type_bg"]),
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
                    "po_expense_id" => intval($row["po_expense_id"]),
                    "dc_user_create_id" => $row["c_create_name"],
                    "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                    "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                    "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
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
        } else if ($type == "sp_working_dtl8") {
            $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
            $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
            $i_pa = $_REQUEST["i_pa"] ?? null; // status id


            $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
            $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
            $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

            if ($act == "SEARCH") {
                $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
                $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
                $wh .= (@$_REQUEST['tag'] != "") ? " and a.tag like '%" . @$_REQUEST['tag'] . "%'" : "";
                $wh .= ($_REQUEST['dc_cost3_id'] != "0") ? " and a.dc_cost2_id like '%" . $_REQUEST['dc_cost3_id'] . "%'" : "";
                $wh .= ($_REQUEST['c_name'] != '') ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
                $wh .= ($_REQUEST['d_doc_ref'] != '') ? " and a.d_doc_ref like '%" . $_REQUEST['d_doc_ref'] . "%'" : "";
                $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];
                if ($i_post != 0) {
                    if ($i_post == 1) {
                        $wh .= " and tor_status_id is not null";
                    } else {
                        $wh .= " and tor_status_id is null";
                    }
                }
            } else {
                $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
            }


            $arrParam = array();
            $arrCountParam = array();
            $sqlTempTable = "SELECT a.tor_id
                                , a.po_expense_id
                                , a.po_creditor_id
                                , a.dc_expense_budget_type_id
                                , a.bg_budget_dtl_project_id
                                , ISNULL(a.dc_department_id,0) AS dc_department_id
                                , a.dc_cost_id
                                , a.dc_cost2_id
                                , a.i_is_rename
                                , a.index_receive
                                , a.txtsub_cost
                                , a.tor_type_id
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
                            WHERE a.i_type_bg = 8 and a.i_is_notor<>1" . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]); //
            //             echo $sqlTempTable;
            //             exit;
            $arrParam[] = $start;
            $arrParam[] = $limit;
            $sqlMain = "SELECT a.* , s.c_code
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
                            , s.sp_type_id
                            , CONVERT(VARCHAR, s.d_doc_date, 120) AS d_doc_date
                            , CONVERT(VARCHAR, s.d_tor_date, 120) AS d_tor_date
                            , s.po_creditor_id
                            , (SELECT TOP 1 c_name FROM dbo.po_creditor WHERE po_creditor_id=s.po_creditor_id)  AS po_creditor_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id)  AS dc_cost_idTxt
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=a.dc_cost2_id)  AS dc_cost2_idTxt
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                            , CONVERT(VARCHAR, d_create, 120) AS d_create
                            , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                            , (SELECT TOP 1 c_name FROM NMU_DATACENTER.dbo.dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                            , CONVERT(VARCHAR, d_update, 120) AS d_update "
                    . " FROM ({$sqlTempTable}) a "
                    . " INNER JOIN dbo.sp_tor s ON s.tor_id=a.tor_id"
                    . " WHERE a.row > ? AND a.row <= ?";
            //             print_r($arrParam);
            //                         echo $sqlMain;
            //            exit;
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
                $c_codeStatus = "<b style='{$i_type_bg}'>" . $row["c_code"] . "</b>" . ($row["tor_status_id"] > 0 ? "<image id='img-" . $row['tor_id'] . "' src='../images/icons/database_start.png'/>" : "");
                $temp = array(
                    "no" => $i++,
                    "id" => intval($row["tor_id"]),
                    "sp_contract_id" => $row["sp_contract_id"],
                    "i_purchase" => intval($row["i_purchase"]), //i_purchase	i_product_type	i_hire_type	i_is_inv i_delivery_date
                    "i_product_type" => intval($row["i_product_type"]),
                    "i_hire_type" => intval($row["i_hire_type"]),
                    "i_is_inv" => intval($row["i_is_inv"]),
                    "i_type_fix_rate" => intval($row["i_type_fix_rate"]),
                    "i_delivery_date" => intval($row["i_delivery_date"]),
                    "i_type_bg" => intval($row["i_type_bg"]),
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
                    "po_expense_id" => intval($row["po_expense_id"]),
                    "dc_user_create_id" => $row["c_create_name"],
                    "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                    "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date
                    "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
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
        }
        break;
    case "LISTCREDITOR2": // creaditor in contract
        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT a.sp_tor_id
                        , a.dc_creditor_id
                        --, a.c_name AS creditor_name
                        , (SELECT c_name FROM NMU.dbo.dc_creditor aa WHERE aa.dc_creditor_id = a.dc_creditor_id) AS creditor_name
                        , (SELECT c_tax_number_imp FROM NMU.dbo.dc_creditor aa WHERE aa.dc_creditor_id = a.dc_creditor_id) AS c_tax_number_imp
                        , b.c_code
                        , b.sp_tor_contract_id
                        , b.c_doc_ref
                        , b.i_is_po
                        , b.c_name
                        , b.i_is_warranty
                        , b.i_is_warranty_book
                        , b.f_total_amt AS f_total_amt
                        , b.book_no
                        , b.book_seq
                        , CONVERT(VARCHAR, b.d_book_date, 120) AS d_book_date
                        , b.f_warranty_amt
                        , b.c_remark
                        , b.cashiercheque_on
                        , b.cashiercheque_seq
                        , CONVERT(VARCHAR, b.d_cashiercheque_data, 120) AS d_cashiercheque_data
                        , b.f_warranty_cashiercheque
                        , b.c_remark_cashiercheque
                        , b.book_warranty_no
                        , CONVERT(VARCHAR, b.d_return_warranty, 120) AS d_return_warranty
                        , b.c_return_warranty
                        , b.c_return_comment
                        , CONVERT(VARCHAR, b.d_book_warranty_date, 120) AS d_book_warranty_date
                        , b.dc_bank_id
                        , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = b.dc_bank_id) AS dc_bank_idID_Name
                        , b.f_book_warranty_amt
                        , CONVERT(VARCHAR, b.d_book_warranty_end, 120) AS d_book_warranty_end
                        , b.c_remark1
                        , CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date
                        , CONVERT(VARCHAR, d_start_date, 120) AS d_start_date
                        , CONVERT(VARCHAR, d_due_date, 120) AS d_due_date
                        ,(SELECT COUNT(sp_gl_monthly_hdr_id) FROM sp_gl_monthly_hdr aa WHERE aa.sp_tor_contract_id = b.sp_tor_contract_id AND aa.i_enabled = 1) AS i_is_expense_monthly
                    FROM dbo.sp_tor_victory a
                    INNER JOIN dbo.sp_tor_contract b ON b.sp_tor_id=a.sp_tor_id AND b.dc_creditor_id = a.dc_creditor_id
                    WHERE a.sp_tor_id=?"; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['tor_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "id" => intval($row["dc_creditor_id"]),
                "c_code" => $row["c_code"] == null ? '' : $row["c_code"],
                "c_doc_ref" => $row["c_doc_ref"],
                "d_doc_date0" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date  ,
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])), //d_tor_date  ,
                "d_start_date" => ((empty($row["d_start_date"])) ? "" : $date->extDateBuddha($row["d_start_date"])), //d_tor_date  ,
                "c_name" => $row["c_name"],
                "d_return_warranty" => ((empty($row["d_return_warranty"])) ? "" : $date->extDateBuddha($row["d_return_warranty"])), //d_tor_date  ,
                "c_return_warranty" => intval($row["c_return_warranty"]),
                "c_return_comment" => intval($row["c_return_comment"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "creditor_name" => $row["creditor_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "i_is_po" => $row["i_is_po"],
                "i_is_warranty" => $row["i_is_warranty"],
                "i_is_warranty_book" => $row["i_is_warranty_book"],
                "book_no" => $row["book_no"],
                "book_seq" => $row["book_seq"],
                "d_book_date" => ((empty($row["d_book_date"])) ? "" : $date->extDateBuddha($row["d_book_date"])),
                "f_warranty_amt" => $row["f_warranty_amt"],
                "c_remark" => $row["c_remark"],
                "cashiercheque_on" => $row["cashiercheque_on"],
                "cashiercheque_seq" => $row["cashiercheque_seq"],
                "d_cashiercheque_data" => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])),
                "f_warranty_cashiercheque" => $row["f_warranty_cashiercheque"],
                "c_remark_cashiercheque" => $row["c_remark_cashiercheque"],
                "book_warranty_no" => $row["book_warranty_no"],
                "d_book_warranty_date" => ((empty($row["d_book_warranty_date"])) ? "" : $date->extDateBuddha($row["d_book_warranty_date"])),
                "dc_bank_id" => $row["dc_bank_id"],
                "dc_bank_idID_Name" => $row["dc_bank_idID_Name"],
                "f_book_warranty_amt" => number_format($row["f_book_warranty_amt"], 2),
                "d_book_warranty_end" => ((empty($row["d_book_warranty_end"])) ? "" : $date->extDateBuddha($row["d_book_warranty_end"])),
                "c_remark1" => $row["c_remark1"],
                "i_is_expense_monthly" => $row["i_is_expense_monthly"],
            );
            ${$root}[] = $temp;
        }
        // print_r(${$root}); exit;
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    //LISTCONTRACT
    case "LISTCREDITOR": // creaditor in contract
        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT a.sp_tor_id
                        , a.dc_creditor_id
                        --, a.c_name AS creditor_name
                        , (SELECT inv_name FROM NMU.dbo.dc_creditor aa WHERE aa.dc_creditor_id = a.dc_creditor_id) AS creditor_name
                        , (SELECT c_tax_number_imp FROM NMU.dbo.dc_creditor aa WHERE aa.dc_creditor_id = a.dc_creditor_id) AS c_tax_number_imp
                        , b.c_code
                        , b.sp_tor_contract_id
                        , b.c_doc_ref
                        , b.i_is_po
                        , b.c_name
                        , b.i_is_warranty
                        , b.i_is_warranty_book
                        , b.f_total_amt AS f_total_amt
                        , b.book_no
                        , b.i_delivery as i_day
                        , b.book_seq
                        , CONVERT(VARCHAR, b.d_book_date, 120) AS d_book_date
                        , b.f_warranty_amt
                        , b.c_remark
                        , b.cashiercheque_on
                        , b.cashiercheque_seq
                        , CONVERT(VARCHAR, b.d_cashiercheque_data, 120) AS d_cashiercheque_data
                        , b.f_warranty_cashiercheque
                        , b.c_remark_cashiercheque
                        , b.book_warranty_no
                        , CONVERT(VARCHAR, b.d_book_warranty_date, 120) AS d_book_warranty_date
                        , b.dc_bank_id
                        , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = b.dc_bank_id) AS dc_bank_idID_Name
                        , b.f_book_warranty_amt
                        , CONVERT(VARCHAR, b.d_book_warranty_end, 120) AS d_book_warranty_end
                        , b.c_remark1
                        , b.i_is_period
                        , b.i_is_join_venture
                        , CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
                        , CONVERT(VARCHAR, b.d_due_date, 120) AS d_due_date
                        , CONVERT(VARCHAR, b.d_start_date, 120) AS d_start_date
                        , b.i_is_monthly AS i_is_expense_monthly
                        , (select top 1 po_expense_id from sp_tor where tor_id = b.sp_tor_id) po_expense_id
                        , (select top 1  CONVERT(VARCHAR, d_create , 120) from sp_doc_gen where ref_id = b.sp_tor_id  ) as d_start_contract

                    FROM dbo.sp_tor_victory a
                    INNER JOIN dbo.sp_tor_contract b ON b.sp_tor_id=a.sp_tor_id AND b.dc_creditor_id = a.dc_creditor_id
                    WHERE a.sp_tor_id=?

                    UNION  all

					SELECT b.sp_tor_id
                        , b.dc_creditor_id
                        --, a.c_name AS creditor_name
                        , (SELECT inv_name FROM NMU.dbo.dc_creditor aa WHERE aa.dc_creditor_id = b.dc_creditor_id) AS creditor_name
                        , (SELECT c_tax_number_imp FROM NMU.dbo.dc_creditor aa WHERE aa.dc_creditor_id = b.dc_creditor_id) AS c_tax_number_imp
                        , b.c_code
                        , b.sp_tor_contract_id
                        , b.c_doc_ref
                        , b.i_is_po
                        , b.c_name
                        , b.i_is_warranty
                        , b.i_is_warranty_book
                        , b.f_total_amt AS f_total_amt
                        , b.book_no
                        , b.i_delivery as i_day
                        , b.book_seq
                        , CONVERT(VARCHAR, b.d_book_date, 120) AS d_book_date
                        , b.f_warranty_amt
                        , b.c_remark
                        , b.cashiercheque_on
                        , b.cashiercheque_seq
                        , CONVERT(VARCHAR, b.d_cashiercheque_data, 120) AS d_cashiercheque_data
                        , b.f_warranty_cashiercheque
                        , b.c_remark_cashiercheque
                        , b.book_warranty_no
                        , CONVERT(VARCHAR, b.d_book_warranty_date, 120) AS d_book_warranty_date
                        , b.dc_bank_id
                        , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = b.dc_bank_id) AS dc_bank_idID_Name
                        , b.f_book_warranty_amt
                        , CONVERT(VARCHAR, b.d_book_warranty_end, 120) AS d_book_warranty_end
                        , b.c_remark1
                        , b.i_is_period
                        , b.i_is_join_venture
                        , CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
                        , CONVERT(VARCHAR, b.d_due_date, 120) AS d_due_date
                        , CONVERT(VARCHAR, b.d_start_date, 120) AS d_start_date
                        , b.i_is_monthly AS i_is_expense_monthly
                        , (select top 1 po_expense_id from sp_tor where tor_id = b.sp_tor_id) po_expense_id
                        , (select top 1  CONVERT(VARCHAR, d_create , 120) from sp_doc_gen where ref_id = b.sp_tor_id  ) as d_start_contract

                    FROM dbo.sp_tor_contract b
                    WHERE b.sp_tor_id= {$_REQUEST['tor_id']} "; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['tor_id']));
        $i = @$start + 1;

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "id" => intval($row["dc_creditor_id"]),
                "c_code" => $row["c_code"] == null ? '' : $row["c_code"],
                "c_doc_ref" => $row["c_doc_ref"],
                "d_doc_date" => $row["d_doc_date"] == '' ? $date->extDateBuddha(date('Y-m-d')) : $date->extDateBuddha($row["d_doc_date"]),
                "d_contract_date" => $row["d_doc_date"] == '' ? $date->extDateBuddha(date('Y-m-d')) : $date->extDateBuddha($row["d_doc_date"]),
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])), //d_tor_date  ,
                "d_start_date" => ((empty($row["d_start_date"])) ? "" : $date->extDateBuddha($row["d_start_date"])), //d_tor_date  ,
                "d_start_contract" => ((empty($row["d_start_contract"])) ? "" : $date->extDateBuddha($row["d_start_contract"])), //d_tor_date  ,
                "c_name" => $row["c_name"],
                "po_expense_id" => $row["po_expense_id"],
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "creditor_name" => $row["creditor_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "i_is_po" => $row["i_is_po"],
                "i_day" => $row["i_day"],
                "i_is_join_venture" => $row["i_is_join_venture"],
                "i_is_period" => $row["i_is_period"],
                /*                "i_is_inv" => $row["i_is_inv"],                                   */
                "i_is_warranty" => $row["i_is_warranty"],
                "i_is_warranty_book" => $row["i_is_warranty_book"],
                "book_no" => $row["book_no"],
                "book_seq" => $row["book_seq"],
                "d_book_date" => ((empty($row["d_book_date"])) ? "" : $date->extDateBuddha($row["d_book_date"])),
                "f_warranty_amt" => $row["f_warranty_amt"],
                "c_remark" => $row["c_remark"],
                "cashiercheque_on" => $row["cashiercheque_on"],
                "cashiercheque_seq" => $row["cashiercheque_seq"],
                "d_cashiercheque_data" => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])),
                "f_warranty_cashiercheque" => $row["f_warranty_cashiercheque"],
                "c_remark_cashiercheque" => $row["c_remark_cashiercheque"],
                "book_warranty_no" => $row["book_warranty_no"],
                "d_book_warranty_date" => ((empty($row["d_book_warranty_date"])) ? "" : $date->extDateBuddha($row["d_book_warranty_date"])),
                "dc_bank_id" => $row["dc_bank_id"],
                "dc_bank_idID_Name" => $row["dc_bank_idID_Name"],
                "f_book_warranty_amt" => number_format($row["f_book_warranty_amt"], 2),
                "d_book_warranty_end" => ((empty($row["d_book_warranty_end"])) ? "" : $date->extDateBuddha($row["d_book_warranty_end"])),
                "c_remark1" => $row["c_remark1"],
                "i_is_expense_monthly" => $row["i_is_expense_monthly"],
            );
            ${$root}[] = $temp;
        }
        // print_r(${$root}); exit;
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    //LISTCONTRACT
    case "LISTCONTRACT":
        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT a.sp_tor_id , a.dc_creditor_id , a.c_name
                    FROM dbo.sp_tor_victory a
                    INNER JOIN dbo.sp_tor_contract b ON b.
                    WHERE a.sp_tor_id=?"; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['tor_id']));
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["dc_creditor_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "c_name" => $row["c_name"]
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();
        break;
    case "LISTPROHDRPERIOD":
        ###########################################
        $root = "data";
        $data = array();
        $con = '';
        if (@$_REQUEST['sp_po_id'] > 0) {
            $con = " and sp_po_id = {$_REQUEST['sp_po_id']}";
        }

        $sqlMain = "SELECT a.sp_tor_hdr_period_id
                        , a.sp_tor_contract_id
                        , b.c_code  AS c_doc_ref_contract
                        , b.dc_creditor_id
                        , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                       -- , (select top 1 dc_expense_budget_type_id from dbo.sp_tor where tor_id = b.sp_tor_id)  as dc_expense_budget_type_id
                        , (select top 1 i_yyyy from dbo.sp_tor where tor_id = b.sp_tor_id)  as i_yyyy
                        , (select top 1 po_expense_id from dbo.sp_tor where tor_id = b.sp_tor_id)  as po_expense_id
                        , a.sp_po_id
                        , CONVERT(VARCHAR,a.d_doc_date, 120) AS d_doc_date
                        , a.c_contract_code
                        , a.i_day
                        , a.i_alert
                        , a.i_is_status
                        , a.i_period
                        , a.bg_reserve_money_id
                        , a.f_total_amt
                        , a.i_is_last
                        , a.i_pr_type1
                        , a.c_discription
                        , a.[dc_expense_budget_type_id]
                        , a.[bg_reserve_money_id]
                        , (select COUNT(*) from sp_tor_dtl_period aa where a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id ) as dtl_period_count
                        , CONVERT(VARCHAR, d_period_date, 120) AS d_period_date

                    FROM dbo.sp_tor_hdr_period a
                    INNER JOIN sp_tor_contract b ON b.sp_tor_contract_id = a.sp_tor_contract_id
                    WHERE a.sp_tor_contract_id=? {$con}"; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);
        // echo $sqlMain .'/*'; echo $_REQUEST['sp_tor_contract_id']; echo '*/'; exit;
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_contract_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "dc_creditor_id" => $row["dc_creditor_id"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "i_yyyy" => intval($row["i_yyyy"]), //i_yyyy dc_expense_budget_type_id po_expense_id
                "po_expense_id" => intval($row["po_expense_id"]),
                "c_contract_code" => $row["c_contract_code"],
                "c_doc_ref_contract" => $row["c_doc_ref_contract"],
                "sp_po_id" => intval($row["sp_po_id"]),
                "i_period" => intval($row["i_period"]),
                "bg_reserve_money_id" => intval($row["bg_reserve_money_id"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                // "d_period_date"			=> ((empty($row["d_period_date"])) ? "" : $date->extDateBuddha($row["d_period_date"])), //d_tor_date  ,
                "d_period_date" => $date->extDateBuddha($row["d_period_date"]),
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "i_day" => $row["i_day"],
                "i_alert" => $row["i_alert"],
                "i_is_last" => $row["i_is_last"],
                "i_pr_type1" => $row["i_pr_type1"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "bg_reserve_money_id" => $row["bg_reserve_money_id"],
                "c_discription" => $row["c_discription"],
                "dtl_period_count" => $row["dtl_period_count"]
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LISTHDRPERIOD":
        ###########################################
        $root = "data";
        $data = array();
        $con = '';
        if (@$_REQUEST['sp_po_id'] > 0) {
            $con = " and sp_po_id = {$_REQUEST['sp_po_id']}";
        }

        $sqlMain = "SELECT a.sp_tor_hdr_period_id
                        , a.sp_tor_contract_id
                        , b.c_code  AS c_doc_ref_contract
                        , b.i_contract_status
                        , b.dc_creditor_id
                        , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                        , (select top 1 i_yyyy from dbo.sp_tor where tor_id = b.sp_tor_id)  as i_yyyy
                        , (select top 1 po_expense_id from dbo.sp_tor where tor_id = b.sp_tor_id)  as po_expense_id
                        , a.sp_po_id
                        , CONVERT(VARCHAR,a.d_doc_date, 120) AS d_doc_date
                        , a.c_contract_code
                        , a.i_day
                        , a.i_alert
                        , a.i_is_status
                        , a.i_period
                        , a.dc_cost_id
                        , a.bg_reserve_money_id
                        , a.f_total_amt
                        , a.i_is_last
                        , a.dc_cost_id
                        , a.i_pr_type1
                        , (select top 1 dc_cost2_id from sp_tor where tor_id = b.sp_tor_id ) as dc_cost2_id
                        , a.c_discription
                        , a.c_discription
                        , a.i_is_product_last
                        , c.i_product_type as i_product_typehdr
                        , isnull(c.i_hire_type,0) as i_hire_type
                        , a.dc_creditor_id as dc_creditor_period_id
                        , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = a.dc_creditor_id ) AS dc_creditor_period_name
                        , (SELECT c_tax_number_imp FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = a.dc_creditor_id ) AS c_tax_number_imp
                        , a.i_joint_venture
                        , a.dc_expense_budget_type_id
                        , (select top 1 c_code from sp_check_period_hdr where a.sp_tor_hdr_period_id = sp_tor_hdr_period_id)  as check_code
                        , a.[bg_reserve_money_id]
                        , (select COUNT(*) from sp_tor_dtl_period aa where a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id and i_enabled = 1 ) as dtl_period_count
                        , CONVERT(VARCHAR, a.d_period_date, 120) AS d_period_date
                    FROM dbo.sp_tor_hdr_period a
                    INNER JOIN sp_tor_contract b ON b.sp_tor_contract_id = a.sp_tor_contract_id
                    LEFT JOIN sp_tor_dtl_period c ON a.sp_tor_hdr_period_id = c.sp_tor_hdr_period_id and c.i_enabled = 1
                    WHERE  a.sp_tor_contract_id=? {$con} and a.i_enabled = 1
                    order by a.i_period
                    ";
        // echo $sqlMain .'/*'; echo $_REQUEST['sp_tor_contract_id']; echo '*/'; exit; dtl_period_count i_hire_type

        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_contract_id']));
        $check = $db->GetDataBySQL("select  f_total_amt as f_total_con from sp_tor_contract  a  where  a.sp_tor_contract_id =  {$_REQUEST['sp_tor_contract_id']}", array($_REQUEST["sp_tor_contract_id"]));

        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_check_period" => $row["check_code"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "i_product_typehdr" => $row["i_product_typehdr"],
                "i_hire_type" => $row["i_hire_type"],
                "dc_creditor_period_id" => $row["dc_creditor_period_id"],
                "dc_creditor_id2ID_Name" => $row["dc_creditor_period_name"],
                "dc_creditor_period_name" => $row["dc_creditor_period_name"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "i_joint_venture" => $row["i_joint_venture"],
                "i_is_product_last" => intval($row["i_is_product_last"]),
                "i_contract_status" => $row["i_contract_status"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "i_yyyy" => intval($row["i_yyyy"]), //i_yyyy dc_expense_budget_type_id po_expense_id
                "po_expense_id" => intval($row["po_expense_id"]),
                "c_contract_code" => $row["c_contract_code"],
                "c_doc_ref_contract" => $row["c_doc_ref_contract"],
                "sp_po_id" => intval($row["sp_po_id"]),
                "i_period" => intval($row["i_period"]),
                "dc_cost2_id" => $row["dc_cost2_id"],
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "bg_reserve_money_id" => intval($row["bg_reserve_money_id"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                // "d_period_date"			=> ((empty($row["d_period_date"])) ? "" : $date->extDateBuddha($row["d_period_date"])), //d_tor_date  ,
                "d_period_date" => $date->extDateBuddha($row["d_period_date"]),
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "i_day" => $row["i_day"],
                "i_alert" => $row["i_alert"],
                "i_is_last" => $row["i_is_last"],
                "i_pr_type1" => $row["i_pr_type1"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "bg_reserve_money_id" => $row["bg_reserve_money_id"],
                "c_discription" => $row["c_discription"],
                "dtl_period_count" => $row["dtl_period_count"]
            );
            ${$root}[] = $temp;
            $total += $row["f_total_amt"];
        }
        ${$root}[] = array(
            "no" => 9999,
            "f_total_amt" => "<span style='font-weight:bold;color:blue;'>" . number_format($total, 2) . "</span>"
        );
        ${$root}[] = array(
            "no" => 9998,
            "f_total_amt" => "<span style='font-weight:bold;color:green;'>" . number_format($check, 2) . "</span>"
        );
        ${$root}[] = array(
            "no" => 9997,
            "f_total_amt" => "<span style='font-weight:bold;color:red;'>" . number_format($check - $total, 2) . "</span>"
        );
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    //LISTDTLPERIOD
    case "contractStatus";
        ######################################################################################
        $root = "data";
        $data = array();
        $con = '';
        $user_name = $_SESSION['user_name'];
        $iStatusContract = $_REQUEST['i_contract_status'] ?? 1;
        $sqlMain = "Update  sp_tor_contract set i_contract_status = ?
                    where sp_tor_contract_id  = {$_REQUEST['sp_tor_contract_id']} and i_enabled = 1  ";
        $stmt = $db->QueryParam($sqlMain, [$iStatusContract, $_REQUEST['sp_tor_contract_id']]);
//        echo $db->debugSql($sqlMain, [$iStatusContract, $_REQUEST['sp_tor_contract_id']]);
//        exit();
        break;
    case "SUMcontract";
        ######################################################################################
        $root = "data";
        $data = array();
        $con = '';
        $user_name = $_SESSION['user_name'];
        // print_r($_SESSION) ;
        $sqlMain = "select sum(f_total_amt) as f_total_amt ,isnull(COUNT(sp_tor_hdr_period_id),0) as sum_period   from sp_tor_hdr_period
                    where sp_tor_contract_id  = {$_REQUEST['sp_tor_contract_id']} and i_enabled = 1  ";
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_contract_id']));
        $sum_check = $db->GetDataBySQL("select isnull(sum(f_total_amt),0) as sum_check  from sp_tor_hdr_period a
        INNER  join sp_check_period_hdr b on a.sp_tor_hdr_period_id = b.sp_tor_hdr_period_id where b.c_code is not null and a.sp_tor_contract_id =  {$_REQUEST['sp_tor_contract_id']}", array($_REQUEST["sp_tor_contract_id"]));
        $sp_tor_che = $db->GetDataBySQL("select sum(f_total_amt) as sum_period  from sp_tor_hdr_period where sp_tor_contract_id = {$_REQUEST['sp_tor_contract_id']}", array($_REQUEST["sp_tor_contract_id"]));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "f_total_amt" => intval($row["f_total_amt"]),
                "f_total_amt2" => number_format($row["f_total_amt"], 2),
                "sum_period" => intval($row["sum_period"]),
                "sum_check" => intval($sum_check),
                "sum_check2" => number_format($sum_check, 2),
                "user_name" => $user_name,
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();
        break;
    //SUMcontract
    case "storeSumPeriod";
        ######################################################################################
        $root = "data";
        $data = array();
        $con = '';
        $user_name = $_SESSION['user_name'];
        // print_r($_SESSION) ;
        $sqlMain = "DECLARE @sp_tor_hdr_period INT = {$_REQUEST['sp_tor_hdr_period_id']} ;
        select sum(f_net_total_price) as f_total_amt
        ,isnull(COUNT(sp_tor_hdr_period_id),0) as sum_period
        ,(select f_total_amt from sp_tor_hdr_period where sp_tor_hdr_period_id = @sp_tor_hdr_period) as sum_period_hdr
        from sp_tor_dtl_period
        where sp_tor_hdr_period_id = @sp_tor_hdr_period  and i_enabled = 1 ;
        ";
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_hdr_period_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "f_total_amt" => intval($row["f_total_amt"]),
                "f_total_amt2" => number_format($row["f_total_amt"], 2),
                "sum_period" => intval($row["sum_period"]),
                "sum_period_hdr" => $row["sum_period_hdr"],
                "user_name" => $user_name,
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();
        break;
    case "SumSubsidy";
        ######################################################################################
        $root = "data";
        $data = array();
        $con = '';
        // $user_name =  $_SESSION['user_name'];
        // print_r($_SESSION) ;
        $sqlMain = " select
                            isnull(aa.po_expense_id,0) as po_expense_id
                            ,(select c_name from nmu..bg_expense where aa.po_expense_id = bg_expense_id) as  po_expense
                            ,isnull(aa.dc_expense_budget_type_id,0) as dc_expense_budget_type_id
                            ,(select c_name from dc_expense_budget_type where aa.dc_expense_budget_type_id = dc_expense_budget_type_id) as  dc_expense_budget_type
                            ,SUM(ISNULL(aa.f_total_amt, 0)) AS Sum_total
                        from sp_tor  aa
                        RIGHT  join sp_tor_item bb on aa.tor_id = bb.tor_id
                        where aa.i_period_bg = 1
                            and aa.bg_reserve_money1_id is null
                            and bb.sp_status_hdr_id= 13
                            and isnull(aa.po_expense_id,0) > 0
                            and aa.i_yyyy =  2023
                            and aa.i_type_bg =  1
                            and aa.po_expense_id = {$_REQUEST['po_expense_id']}
                            and aa.dc_expense_budget_type_id = {$_REQUEST['dc_expense_budget_type_id']}
                        group by aa.po_expense_id
                        ,aa.dc_expense_budget_type_id ";
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['po_expense_id']));
        // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        // /********************/
        // $sum_check = $db->GetDataBySQL("select isnull(sum(f_total_amt),0) as sum_check  from sp_tor_hdr_period a
        // INNER  join sp_check_period_hdr b on a.sp_tor_hdr_period_id = b.sp_tor_hdr_period_id where b.c_code is not null and a.sp_tor_contract_id =  {$_REQUEST['sp_tor_contract_id']}", array($_REQUEST["sp_tor_contract_id"]));
        // $sp_tor_che = $db->GetDataBySQL("select sum(f_total_amt) as sum_period  from sp_tor_hdr_period where sp_tor_contract_id = {$_REQUEST['sp_tor_contract_id']}", array($_REQUEST["sp_tor_contract_id"]));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "po_expense_id" => $row["po_expense_id"],
                "po_expense" => $row["po_expense"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "dc_expense_budget_type" => $row["dc_expense_budget_type"],
                "Sum_total" => intval($row["Sum_total"]),
                "Sum_total2" => number_format($row["Sum_total"], 2),
                    // "sum_period" => intval($row["sum_period"]),
                    // "sum_check" => intval($sum_check),
                    // "sum_check2" => number_format($sum_check, 2),
                    // "user_name" => $user_name,
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();
        break;

    case "RETURNMENU":
        $root = "data";
        $data = array();

        $stmt2 = true;
        $stmt3 = true;
        $sqlMain = "
                UPDATE sp_tor
                SET tor_status_id = ? "
                . " , old_menu_id =? "
                . " , dc_user_update_id =? "
                . " , dc_user_update_cost_id =? "
                . " , d_update = ?"
                . " WHERE tor_id = ?";

        $val = $_REQUEST['sp_status_hdr_id'] ?? null;
        $val2 = $_REQUEST['menu_id'] ?? null;
        $id = $_REQUEST['id'] ?? null;
//        echo $db->debugSql($sqlMain,  array($val,  $info[1],$info[2],$info[3],  $id));
//        exit();
        $stmt = $db->QueryParam($sqlMain, array($val, $val2, $info[1], $info[2], $info[3], $id));
        $re_id = $id;
        break;

    case "List_Contract_Number":
        $mode = @$_REQUEST["type"] ?? null;
        $filter = @$_REQUEST["filter"] ?? null;
        $value = @$_REQUEST["value"] ?? null;
        $i_read = @$_REQUEST["i_read"] ?? null;
        ###################
        $root = "data";
        $data = array();
        ###################
        $limit = @$_REQUEST["limit"] ?? null;
        $dir = @$_REQUEST["dir"] ?? null;
        $sort = @$_REQUEST["sort"] ?? null;
        $start = @$_REQUEST["start"] ?? null;

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
        $keyin = "";
        $arrParam = array();
        $arrCountParam = array();
        $con = "";
        if ($mode == "SEARCH") {
            if ($filter && $filter !== "") {
                if ($filter === "c_tax_number_imp")
                    $con .= " and b.c_tax_number_imp like ?";
                if ($filter === "c_name")
                    $con .= " and b.c_name like ?";
                $arrParam[] = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            }
        }
        $emp_id = $_SESSION['sp_emp_id'] ?? null;
        $sqlTempTable = " select
    b.dc_creditor_id
    ,(select c_tax_number_imp+ ' : ' +inv_name from nmu.dbo.dc_creditor where b.dc_creditor_id = dc_creditor_id ) as name_creditor
    ,b.sp_tor_contract_id
    , a.tor_id
    , b.sp_emp_id
    ,(select top 1 c_name from sp_emp aa where aa.sp_emp_id = b.sp_emp_id) as  txtsp_emp_idID
    , b.c_name
    , b.c_code
    , b.f_total_amt
    , dc_department_id
    , CONVERT(VARCHAR,b.d_doc_date, 120) AS d_doc_date
    ,row_number() over(order by b.sp_tor_id ) as row
    from sp_tor a
    inner join sp_tor_contract b on b.sp_tor_id = a. tor_id
    where  i_is_notor = 1
    and a.sp_emp_id = {$emp_id}
    ";
        // print_r($arrParam); exit();
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "select *  from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "row" => $i++,
                "sp_tor_contract_id" => $row["sp_tor_contract_id"],
                "tor_id" => $row["tor_id"],
                "txtsp_emp_idID" => $row["txtsp_emp_idID"],
                "c_name" => $row["c_name"],
                "c_code" => $row["c_code"],
                "dc_department_id" => $row["dc_department_id"],
                "name_creditor" => $row["name_creditor"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";

        $totalCount = $db->GetDataBySQL($sqlCount, array());
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;

    case "LISTDTLPERIOD":
        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT b.f_value
                        , b.c_name AS dc_unit_name
                        , a.sp_tor_dtl_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , a.c_name
                        , a.dc_bg_budget_type_id
                        , a.po_expense_id
                        , a.f_net_unit_price
                        , a.f_net_total_price
                        , a.i_qty
                        , ISNULL(c.i_qty,0) AS i_qty2
                        , a.i_used
                        , a.i_balance
                        , a.f_unit_price
                    FROM dbo.sp_tor_dtl a
                    LEFT JOIN dbo.dc_unit_type b ON b.dc_unit_type_id=a.dc_unit_type_id
                    LEFT JOIN dbo.sp_tor_dtl_period c ON c.sp_tor_dtl_id = a.sp_tor_dtl_id AND c.sp_tor_hdr_period_id=?
                    WHERE a.sp_tor_id=?"; // . $wh . $util->viewDepartment('a', $_SESSION["dc_department_id"]);

        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_hdr_period_id'], $_REQUEST['tor_id'])); //sp_tor_hdr_period_id
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_dtl_id"]),
                "c_name" => $row["c_name"],
                "dc_unit_name" => $row["dc_unit_name"],
                "f_net_unit_price" => number_format($row["f_net_unit_price"], 2),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "i_qty" => intval($row["i_qty"]), //จำนวนทั้งหมด
                "i_qty2" => intval($row["i_qty2"]), // จำนวนในงวด
                "i_used" => intval($row["i_used"]),
                "i_balance" => intval($row["i_balance"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_bg_budget_type_id" => intval($row["dc_bg_budget_type_id"])
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    //LISTDTL
    case "LISTDTLPERIODUSED":
        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT b.f_value
                        ,(select top 1  i_contract_status from sp_tor_contract cc where (select top 1  sp_tor_contract_id from sp_tor_hdr_period c where a.sp_tor_hdr_period_id = c.sp_tor_hdr_period_id )  =  cc.sp_tor_contract_id  ) as i_contract_status
                        , a.sp_tor_hdr_period_id
                        , a.sp_tor_dtl_period_id
                        , a.dc_unit_type_id
                        , b.c_name AS dc_unit_name
                        , a.sp_tor_dtl_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , a.c_name
                        , a.dc_bg_budget_type_id
                        , a.po_expense_id
                        , a.i_qty
                        , a.inv_mode_id
                        , a.am_mode_id
                        , a.i_hire_type
                        , a.i_product_type
                        , a.i_is_inv
                        , a.f_net_unit_price
                        , a.f_net_total_price
                    FROM sp_tor_dtl_period a
                    LEFT JOIN dc_unit_type b ON b.dc_unit_type_id=a.dc_unit_type_id
                    WHERE a.sp_tor_hdr_period_id = ? and  a.i_enabled = 1 ";

        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_hdr_period_id']));
        $i = @$start + 1;
        $f_total_amt = 0;
        $qty = 0;
        while ($row = $db->Fetch($stmt)) {
            $f_total_amt += $row["f_net_total_price"];
            $qty += $row["i_qty"];
            $temp = array(
                "no" => $i++,
                "sp_tor_dtl_period_id" => intval($row["sp_tor_dtl_period_id"]),
                "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_tor_dtl_id" => intval($row["sp_tor_dtl_id"]),
                "c_name" => $row["c_name"],
                "i_contract_status" => $row["i_contract_status"],
                "dc_unit_type_id" => $row["dc_unit_type_id"],
                "dc_unit_name" => $row["dc_unit_name"],
                "f_net_unit_price" => number_format($row["f_net_unit_price"], 2),
                "f_net_total_price" => number_format($row["f_net_total_price"], 2),
                "i_qty" => intval($row["i_qty"]),
                "i_qty_amt" => $qty,
                "i_hire_type" => intval($row["i_hire_type"]),
                "i_product_type" => intval($row["i_product_type"]),
                "inv_mode_id" => intval($row["inv_mode_id"]),
                "am_mode_id" => intval($row["am_mode_id"]),
                "i_is_inv" => intval($row["i_is_inv"]),
                "f_total_amt" => number_format($f_total_amt, 2),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "po_expense_id" => intval($row["po_expense_id"]),
                "dc_bg_budget_type_id" => intval($row["dc_bg_budget_type_id"])
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    //LISTDTLPERIODUSED
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
    case "UP_SP_TOR_DTL":

        $root = "data";
        $data = array();
        $msg = "";

        // ============== //
        $addField = null;
        $addValue = null;
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
        $data["f_net_total_price"] = str_replace(",", "", $_REQUEST["f_net_total_amt"] ?? null);
        $data["f_peroid_amt"] = 0; //str_replace(",", "", $_REQUEST["f_bg_peroid"] ?? null);
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
            // /******echo sql******/
            // $sql = (@$sqlMain) ? $sqlMain : $sql;
            // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
            // $sql = str_replace('?', '#-#', $sql);
            // foreach ($arr as $fld => $value) {
            //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            // }
            // echo $sql; exit;
            // /********************/
            //             echo $sql . '/*';
            //            print_r($arrValue);
            //            echo '*/';
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
    case "UPDATE_TOR_BG_CHECKING":
        $arrValue[] = $_REQUEST["bg_reserve_money_id"] ?? null;
        $arrValue[] = $_REQUEST["dc_expense_budget_type"] ?? null;
        $arrValue[] = $_REQUEST["hdr_id"] ?? null;
        $ii = $_REQUEST["ii"] ?? null;
        if ($ii == 1) {
            $iii = null;
        } else {
            $iii = $ii;
        }
        $sql = "UPDATE dbo.sp_tor SET bg_reserve_money" . $ii . "_id =? , dc_expense_budget_type" . $iii . "_id = ? WHERE tor_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT_BG_CHECKING": //แหล่งเงินที่ 1
        $arrValue[] = $_REQUEST["bg_reserve_money1_id"] ?? null;
        $arrValue[] = $_REQUEST["i_pr_type1"] ?? null;
        $arrValue[] = $_REQUEST["dc_expense_budget_type"] ?? null;
        $arrValue[] = str_replace(",", "", $_REQUEST["f_type_amt"] ?? null);
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $ii = $_REQUEST["ii"] ?? null;
        if ($ii == 1) {
            $iii = null;
        } else {
            $iii = $ii;
        }
        $sql = "UPDATE dbo.sp_tor_contract SET bg_reserve_money" . $ii . "_id =? , i_pr_type1=? , dc_expense_budget_type" . $iii . "_id = ? , f_type_amt=? WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_TOR_BG":
        $arrValue[] = $_REQUEST["bg_reserve_money_id"] ?? null;
        $arrValue[] = $_REQUEST["hdr_id"] ?? null;
        $ii = $_REQUEST["ii"] ?? null;
        $sql = "UPDATE dbo.sp_tor SET bg_reserve_money" . $ii . "_id =? WHERE tor_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_TOR_DTL_BG":
        $arrValue[] = $_REQUEST["bg_reserve_money_id"] ?? null;
        $arrValue[] = $_REQUEST["sp_dtl_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_dtl SET bg_reserve_money_id =? WHERE sp_tor_dtl_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "Update_Dc_Tax_Customer_Pdf":
        // exit;
        $arrValue[] = $_REQUEST["i_is_upload"] ?? null;
        $arrValue[] = $_REQUEST["sp_tor_hdr_period_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_hdr_period SET i_is_upload =? WHERE sp_tor_hdr_period_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT_BG": //แหล่งเงินที่ 1
        $arrValue[] = $_REQUEST["bg_reserve_money1_id"] ?? null;
        $arrValue[] = $_REQUEST["i_pr_type1"] ?? null;
        $arrValue[] = str_replace(",", "", $_REQUEST["f_type_amt"] ?? null);
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract SET bg_reserve_money1_id =?, i_pr_type1=? , f_type_amt=? WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT2_BG": //แหล่งเงินที่ 2
        $arrValue[] = $_REQUEST["bg_reserve_money2_id"] ?? null;
        $arrValue[] = $_REQUEST["i_pr_type2"] ?? null;
        $arrValue[] = str_replace(",", "", $_REQUEST["f_type2_amt"] ?? null);
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract SET bg_reserve_money2_id =?, i_pr_type2=? ,  f_type2_amt=? WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT3_BG": //แหล่งเงินที่ 3
        $arrValue[] = $_REQUEST["bg_reserve_money3_id"] ?? null;
        $arrValue[] = $_REQUEST["i_pr_type3"] ?? null;
        $arrValue[] = str_replace(",", "", $_REQUEST["f_type3_amt"] ?? null);
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract SET bg_reserve_money3_id =?, i_pr_type3=? ,  f_type3_amt=? WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT_BG_OVERLAP2": //แหล่งเงินที่ 1
        $arrValue[] = $_REQUEST["bg_reserve_overlap_id"] ?? null;
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract set bg_reserve_overlap_id=?, i_overlap = 2 WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT_BG_OVERLAP": //แหล่งเงินที่ 1
        $arrValue[] = $_REQUEST["c_overlap"] ?? null;
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract set c_overlap=?, i_overlap = 1 WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT_BG_OVERLAP_NEW": // หลังยิง API จองใบกัน กลับมา อัพเดท  (เปลี่ยนรูปแบบให้ user เลือกแค่ครั้งเดียว เช็คและจองเลย )
        $arrValue[] = $_REQUEST["bg_budget_dtl_overlap_id"];
        $arrValue[] = $_REQUEST["bg_reserve_overlap_id"];
        $arrValue[] = $_REQUEST["i_overlap"];
        $arrValue[] = $_REQUEST["c_overlap"];
        $arrValue[] = str_replace(',', '', $_REQUEST["f_type_amt"]);
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract set
                    bg_budget_dtl_overlap_id = ?
                    , bg_reserve_overlap_id =  ?
                    , i_overlap = ?
                    , c_overlap = ?
                    , f_type_amt = ?
                WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;

    case "UPDATE_CONTRACT_BG_OVERLAP2_CHECK": //แหล่งเงินที่ 1
        $arrValue[] = $_REQUEST["bg_reserve_overlap_id"] ?? null;
        $arrValue[] = $_REQUEST["sp_check_period_hdr_id"] ?? null;
        $sql = "UPDATE dbo.sp_check_period_hdr set bg_reserve_overlap_id=?, i_overlap = 2 WHERE sp_check_period_hdr_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT_BG_OVERLAP_CHECK": //แหล่งเงินที่ 1
        $arrValue[] = $_REQUEST["c_overlap"] ?? null;
        $arrValue[] = $_REQUEST["sp_check_period_hdr_id"] ?? null;
        $sql = "UPDATE dbo.sp_check_period_hdr set c_overlap=?, i_overlap = 1 WHERE sp_check_period_hdr_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UPDATE_CONTRACT_CLOSE_BG":
        $i = $_REQUEST["ii"] ?? null;
        $arrValue[] = 1;
        $arrValue[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $sql = "UPDATE dbo.sp_tor_contract SET bg_reserve_i_last{$i} =? WHERE sp_tor_contract_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UP_SP_TOR_DTL1":

        $root = "data";
        $data = array();
        $msg = "";

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        $data["sp_tor_id"] = $_REQUEST["id"];
        $data["dc_bg_budget_type_id"] = $_REQUEST["dc_expense_budget_type_idTxtID"];
        $data["po_expense_id"] = $_REQUEST["po_expense_idID"];
        $data["i_hire_type"] = $_REQUEST["i_hire_type2ID"];

        if ($_REQUEST["i_hire_type2ID"] == 1) {
            $data["i_product_type"] = $_REQUEST["i_product_type2ID"] ?? null;
            $data["i_is_inv"] = 0;
        } else {
            $data["i_product_type"] = '';
            $data["i_is_inv"] = 0;
        }
        //----------------------------------------------------------------------------
        if ($_REQUEST["i_product_type2ID"] == 1) {
            $data["inv_mode_id"] = 0; //= $_REQUEST["inv_mode_idID"] ?? null;
            $data["am_mode_id"] = 0;
        } else {
            $data["inv_mode_id"] = 0;
            $data["am_mode_id"] = $_REQUEST["am_mode_idID"] ?? null;
        }
        $data["sp_bg_mode_id"] = 0; //$_REQUEST["sp_bg_mode_id"] ?? null;
        $data["f_net_total_price"] = 0; //= str_replace(",", "", $_REQUEST["f_net_total_amt"] ?? null);
        $data["f_peroid_amt"] = 0; //str_replace(",", "", $_REQUEST["f_bg_peroid"] ?? null);
        //----------------------------------------------------------------------------
        $data["c_name"] = $_REQUEST["c_nameID"];
        $data["f_unit_price"] = $_REQUEST["f_unit_costID"];
        $data["i_qty"] = str_replace(",", "", $_REQUEST["i_qtyID"]) / 1;
        $data["dc_unit_type_id"] = $_REQUEST["dc_unit_type_idID"];
        $data["i_pr_type1"] = $_REQUEST["i_pr_type1"] ?? null;

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
            // /******echo sql******/
            // $sql = (@$sqlMain) ? $sqlMain : $sql;
            // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
            // $sql = str_replace('?', '#-#', $sql);
            // foreach ($arr as $fld => $value) {
            //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
            // }
            // echo $sql; exit;
            // /********************/
            //             echo $sql . '/*';
            //            print_r($arrValue);
            //            echo '*/';
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

    case "DELETE_TOR_DTL":
        $sql = "DECLARE  @sp_tor_dtl_id bigint =  ?
        INSERT INTO sp_tor_dtl_delete (sp_tor_dtl_id
        ,sp_tor_id
        ,c_name
        ,i_qty
        ,i_used
        ,i_balance
        ,dc_unit_type_id
        ,c_unit
        ,bg_reserve_money_id
        ,i_pr_type1
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
        ,dc_user_create_department_id
        ,d_create
        ,dc_user_update_id
        ,dc_user_update_cost_id
        ,dc_user_update_department_id
        ,d_update
        ,f_peroid_amt
        ,inv_mode_id
        ,am_mode_id
        ,sp_bg_mode_id
        )
        SELECT sp_tor_dtl_id
        , sp_tor_id
        , c_name
        , i_qty
        , i_used
        , i_balance
        , dc_unit_type_id
        , c_unit
        , bg_reserve_money_id
        , i_pr_type1
        , dc_bg_budget_type_id
        , i_product_type
        , i_is_inv
        , po_expense_id
        , dc_creditor_id
        , i_hire_type
        , f_disc_price
        , f_unit_price
        , f_total_price
        , f_net_disc_price
        , f_net_unit_price
        , f_net_total_price
        , dc_user_create_id
        , dc_user_create_cost_id
        , dc_user_create_department_id
        , d_create
        , dc_user_update_id
        , dc_user_update_cost_id
        , dc_user_update_department_id
        , d_update
        , f_peroid_amt
        , inv_mode_id
        , am_mode_id
        , sp_bg_mode_id
        FROM sp_tor_dtl
        WHERE sp_tor_dtl_id = @sp_tor_dtl_id ;

        DELETE sp_tor_dtl
        WHERE sp_tor_dtl_id = @sp_tor_dtl_id ;";
        $arrParam = array($_REQUEST["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "LIST_POP_CREDITOR":
        $mode = @$_REQUEST["type"] ?? null;
        $filter = @$_REQUEST["filter"] ?? null;
        $value = @$_REQUEST["value"] ?? null;
        $i_read = @$_REQUEST["i_read"] ?? null;
        ###################
        $root = "data";
        $data = array();
        ###################
        $limit = @$_REQUEST["limit"] ?? null;
        $dir = @$_REQUEST["dir"] ?? null;
        $sort = @$_REQUEST["sort"] ?? null;
        $start = @$_REQUEST["start"] ?? null;

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
        $keyin = "";
        $arrParam = array();
        $arrCountParam = array();

        $sqlTempTable = "SELECT
                            ROW_NUMBER() OVER (ORDER BY d_create DESC) AS row
                            ,dc_creditor_id
                        FROM NMU.dbo.dc_creditor
                        WHERE i_enable = 1 AND i_delete = 2 and i_key in(1)
                        -- and i_key =  1
            ";
        if ($mode == "SEARCH") {
            if ($filter && $filter !== "") {
                if ($filter === "c_tax_number_imp")
                    $sqlTempTable .= " and c_tax_number_imp like ?";
                else if ($filter === "c_name")
                    $sqlTempTable .= " and c_name like ?";
                $arrParam[] = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            }
        }

        $arrParam[] = $start;
        $arrParam[] = $limit;

        $sqlMain = "SELECT a.dc_creditor_id
                        ,isnull(s.c_tax_number_imp,'-') as c_tax_number_imp
                        ,s.c_name
                        ,isnull(s.tax_c_branch,'-') as tax_c_branch
                        ,isnull(s.tax_c_road,'-') as tax_c_road
                        ,isnull(s.tax_c_province,'-') as tax_c_province
                        ,isnull(s.tax_c_district,'-') as tax_c_district
                        ,isnull(s.tax_c_tambon,'-') as tax_c_tambon
                        ,isnull(s.tax_c_post_code,'-') as tax_c_post_code
                    FROM ({$sqlTempTable}) a
                    INNER JOIN NMU.dbo.dc_creditor s ON a.dc_creditor_id = s.dc_creditor_id
                    WHERE a.row > ? AND a.row <= ?";
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "dc_creditor_id" => $row["dc_creditor_id"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "c_name" => $row["c_name"],
                "tax_c_branch" => $row["tax_c_branch"],
                "tax_c_road" => $row["tax_c_road"],
                "tax_c_province" => $row["tax_c_province"],
                "tax_c_district" => $row["tax_c_district"],
                "tax_c_tambon" => $row["tax_c_tambon"],
                "tax_c_post_code" => $row["tax_c_post_code"],
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
    case "LIST_POP_CREDITOR_VICTORY":
        $mode = @$_REQUEST["type"] ?? null;
        $filter = @$_REQUEST["filter"] ?? null;
        $value = @$_REQUEST["value"] ?? null;
        $i_read = @$_REQUEST["i_read"] ?? null;
        ###################
        $root = "data";
        $data = array();
        ###################
        $limit = @$_REQUEST["limit"] ?? null;
        $dir = @$_REQUEST["dir"] ?? null;
        $sort = @$_REQUEST["sort"] ?? null;
        $start = @$_REQUEST["start"] ?? null;

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
        $keyin = "";
        $arrParam = array();
        $arrCountParam = array();
        $con = "";
        if ($mode == "SEARCH") {
            if ($filter && $filter !== "") {
                if ($filter === "c_tax_number_imp")
                    $con .= " and b.c_tax_number_imp like ?";
                if ($filter === "c_name")
                    $con .= " and b.c_name like ?";
                $arrParam[] = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            }
        }
        $sqlTempTable = "SELECT
                            ROW_NUMBER() OVER (ORDER BY a.dc_creditor_id DESC) AS row
                            ,a.dc_creditor_id
                        FROM sp_tor_victory a
                        INNER JOIN " . DB_NMU . "dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id AND b.i_enable = 1 AND b.i_delete = 2
                        WHERE a.sp_tor_id = {$_REQUEST['id']}
                            AND (SELECT aa.dc_creditor_id FROM sp_tor_contract aa WHERE aa.dc_creditor_id = a.dc_creditor_id AND aa.sp_tor_id = {$_REQUEST['id']}) IS NULL
                            {$con}
                        GROUP BY a.dc_creditor_id";

        $arrParam[] = $start;
        $arrParam[] = $limit;

        $sqlMain = "SELECT
                        a.*
                        ,s.c_tax_number_imp
                        ,s.c_name as c_name
                        ,(
                            SELECT SUM(f_unit_price*i_qty)
                            FROM sp_tor_victory aa
                            INNER JOIN sp_tor_bidder_dtl bb ON aa.sp_tor_bidder_dtl_id = bb.sp_tor_bidder_dtl_id AND bb.dc_creditor_id = a.dc_creditor_id
                            WHERE aa.sp_tor_id = {$_REQUEST['id']}
                            and aa.i_enabled = 1
                        )  AS f_total_price
                    FROM ({$sqlTempTable}) a
                    INNER JOIN " . DB_NMU . "dc_creditor s ON a.dc_creditor_id = s.dc_creditor_id
                    WHERE a.row > ? AND a.row <= ? and i_enable = 1";
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "dc_creditor_id" => $row["dc_creditor_id"],
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "c_name" => $row["c_name"],
                "f_total_price" => number_format($row["f_total_price"], 2),
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";

        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
    case "LIST_TOR_DTL_ST0006": // creaditor in contract
        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT * FROM (
                        SELECT
                            sp_tor_dtl_id
                            , sp_tor_id
                            , c_name
                            , i_qty
                            , i_used
                            , i_balance
                            , dc_unit_type_id
                            , c_unit
                            , dc_bg_budget_type_id
                            ,(SELECT c_name FROM dc_unit_type aa WHERE a.dc_unit_type_id = aa.dc_unit_type_id) AS dc_unit_type_name
                            , i_product_type
                            , i_is_inv
                            , po_expense_id
                            , dc_creditor_id
                            , i_hire_type
                            , f_disc_price
                            , f_unit_price
                            , f_total_price
                            , f_net_disc_price
                            , f_net_unit_price
                            , f_net_total_price
                            ,(SELECT COUNT(aa.sp_tor_dtl_id) FROM sp_tor_victory aa WHERE a.sp_tor_dtl_id = aa.sp_tor_dtl_id) AS i_is_victory
                        FROM sp_tor_dtl a
                        WHERE sp_tor_id = ?
                    )a ORDER BY i_is_victory";

        $arrParam[] = $_REQUEST['sp_tor_id'];
        $stmt = $db->QueryParam($sqlMain, $arrParam);

        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_tor_dtl_id" => $row["sp_tor_dtl_id"],
                "sp_tor_id" => $row["sp_tor_id"],
                "c_name" => $row["c_name"],
                "i_qty" => $row["i_qty"],
                "i_used" => $row["i_used"],
                "i_balance" => $row["i_balance"],
                "dc_unit_type_id" => $row["dc_unit_type_id"],
                "dc_unit_type_name" => $row["dc_unit_type_name"],
                "dc_bg_budget_type_id" => $row["dc_bg_budget_type_id"],
                "i_product_type" => $row["i_product_type"],
                "i_is_inv" => $row["i_is_inv"],
                "po_expense_id" => $row["po_expense_id"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "i_hire_type" => $row["i_hire_type"],
                "f_disc_price" => $row["f_disc_price"],
                "i_is_victory" => $row["i_is_victory"] > 0 ? 1 : 0,
                "f_unit_price" => number_format($row["f_unit_price"], 2),
                "f_total_price" => number_format($row["i_qty"] * $row["f_unit_price"], 2),
            );
            ${$root}[] = $temp;
        }
        // print_r(${$root}); exit;
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LIST_BIDDER_DTL_ST0006": // creaditor in contract
        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT
                        (SELECT aa.dc_creditor_id FROM sp_tor_victory aa WHERE b.sp_tor_dtl_id = aa.sp_tor_dtl_id) AS victory
                        ,sp_tor_bidder_dtl_id
                        ,a.dc_creditor_id
                        ,c.c_name AS dc_creditor_name
                        ,a.f_unit_price AS f_bid_unit_price
                        ,a.i_qty AS i_bid_qty
                        ,b.f_unit_price AS f_unit_price
                        ,b.i_qty
                        ,(SELECT c_name FROM dc_unit_type aa WHERE b.dc_unit_type_id = aa.dc_unit_type_id) AS dc_unit_type_name
                    FROM sp_tor_bidder_dtl a
                        INNER JOIN sp_tor_dtl b ON a.sp_tor_dtl_id = b.sp_tor_dtl_id
                        INNER JOIN NMU.dbo.dc_creditor c ON a.dc_creditor_id = c.dc_creditor_id
                    WHERE a.sp_tor_id = ? AND a.i_enabled = 1
                        AND a.sp_tor_dtl_id = ?
                    ORDER BY a.d_create DESC";

        $arrParam[] = $_REQUEST['sp_tor_id'];
        $arrParam[] = $_REQUEST['sp_tor_dtl_id'];
        // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        //     $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        // /********************/
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "CheckColumn" => $row["victory"] == $row["dc_creditor_id"] ? true : false,
                "i_is_victory" => $row["victory"] > 0 ? 1 : 0,
                "sp_tor_bidder_dtl_id" => $row["sp_tor_bidder_dtl_id"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "f_bid_unit_price" => number_format($row["f_bid_unit_price"], 2),
                "i_bid_qty" => $row["i_bid_qty"],
                "f_bid_total_price" => number_format($row["f_bid_unit_price"] * $row["i_bid_qty"], 2),
                "f_unit_price" => number_format($row["f_unit_price"], 2),
                "i_qty" => $row["i_qty"],
                "f_total_price" => number_format($row["f_unit_price"] * $row["i_qty"], 2),
                "dc_unit_type_name" => $row["dc_unit_type_name"],
            );
            ${$root}[] = $temp;
        }
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "ALL_BIDDER":
        $root = "data";
        $data = array();

        $sqlMain = "SELECT b.dc_creditor_id ,b.c_tax_number_imp, b.inv_name as c_name
            FROM sp_tor_bidder_dtl a
            INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id
            WHERE sp_tor_id = ?";

        $arrParam[] = $_REQUEST['sp_tor_id'];
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;

        ${$root}[] = array(
            "id" => "0",
            "c_name" => "- ไม่เลือก -"
        );

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "id" => $row["dc_creditor_id"],
                "c_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "BIDDER_SELECT":
        $root = "data";
        $data = array();

        $sqlMain = "SELECT
            (SELECT isnull(aa.dc_creditor_id,0) FROM sp_tor_victory aa WHERE b.sp_tor_dtl_id = aa.sp_tor_dtl_id) AS victory
            ,sp_tor_bidder_dtl_id
            ,a.sp_tor_dtl_id
            ,a.dc_creditor_id
            ,b.c_name
            ,c.c_name AS dc_creditor_name
            ,a.f_unit_price AS f_bid_unit_price
            ,a.i_qty AS i_bid_qty
            ,b.f_unit_price AS f_unit_price
            ,b.i_qty
            ,(SELECT c_name FROM dc_unit_type aa WHERE b.dc_unit_type_id = aa.dc_unit_type_id) AS dc_unit_type_name
        FROM sp_tor_bidder_dtl a
            INNER JOIN sp_tor_dtl b ON a.sp_tor_dtl_id = b.sp_tor_dtl_id
            INNER JOIN NMU.dbo.dc_creditor c ON a.dc_creditor_id = c.dc_creditor_id
        WHERE a.sp_tor_id = ?  AND a.i_enabled = 1
            AND a.dc_creditor_id = ?	--AND a.sp_tor_dtl_id = '40255'
        ORDER BY a.d_create DESC";

        $arrParam[] = $_REQUEST['sp_tor_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;

        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "CheckColumn" => $row["victory"] == $row["dc_creditor_id"] ? true : false,
                "i_is_victory" => $row["victory"] > 0 ? 1 : 0,
                "victory_id" => $row["victory"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "sp_tor_bidder_dtl_id" => $row["sp_tor_bidder_dtl_id"],
                "sp_tor_dtl_id" => $row["sp_tor_dtl_id"],
                "c_name" => $row["c_name"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "f_bid_unit_price" => number_format($row["f_bid_unit_price"], 2),
                "i_bid_qty" => $row["i_bid_qty"],
                "f_bid_total_price" => number_format($row["f_bid_unit_price"] * $row["i_bid_qty"], 2),
                "f_unit_price" => number_format($row["f_unit_price"], 2),
                "i_qty" => $row["i_qty"],
                "f_total_price" => number_format($row["f_unit_price"] * $row["i_qty"], 2),
                "dc_unit_type_name" => $row["dc_unit_type_name"],
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LIST_BIDDER_DTL_in_TOR_DTL":
        $root = "data";
        $data = array();

        $sqlMain = "SELECT
                        (
                            SELECT sp_tor_bidder_dtl_id FROM sp_tor_bidder_dtl aa
                            WHERE aa.sp_tor_bidder_hdr_id = ?
                                AND aa.sp_tor_dtl_id = a.sp_tor_dtl_id
                                AND aa.i_enabled = 1
                                AND aa.dc_creditor_id = ?
                        ) AS sp_tor_bidder_dtl_id
                        ,CASE
                            WHEN (
                                SELECT sp_tor_dtl_id
                                FROM sp_tor_bidder_dtl aa
                                WHERE aa.sp_tor_bidder_hdr_id = ?
                                    AND aa.sp_tor_dtl_id = a.sp_tor_dtl_id
                                    AND aa.i_enabled = 1
                                    AND aa.dc_creditor_id = ?
                                ) IS NULL
                            THEN 0
                            ELSE 1
                        END AS CheckColumn
                        ,(
                            SELECT f_unit_price
                            FROM sp_tor_bidder_dtl aa
                            WHERE aa.sp_tor_bidder_hdr_id = ?
                                AND aa.sp_tor_dtl_id = a.sp_tor_dtl_id
                                AND aa.i_enabled = 1
                                AND aa.dc_creditor_id = ?
                        ) AS f_bid_unit_price
                        , sp_tor_dtl_id
                        , sp_tor_id
                        , c_name
                        , i_qty
                        , i_used
                        , i_balance
                        , dc_unit_type_id
                        , c_unit
                        , dc_bg_budget_type_id
                        , (select  c_name from dc_expense_budget_type where dc_expense_budget_type_id = a.dc_bg_budget_type_id ) as dc_expense_budget_type_name
                        , i_product_type
                        , i_is_inv
                        , po_expense_id
                        , dc_creditor_id
                        , i_hire_type
                        , f_disc_price
                        , f_unit_price
                        , f_total_price
                        , f_net_disc_price
                        , f_net_unit_price
                        , f_net_total_price
                        ,(
                            SELECT f_rate_vat
                            FROM sp_tor_bidder_dtl aa
                            WHERE aa.sp_tor_bidder_hdr_id = ? AND aa.sp_tor_dtl_id = a.sp_tor_dtl_id
                            AND aa.i_enabled = 1  AND aa.dc_creditor_id = ?
                        ) AS f_rate_vat
                        ,(
                            SELECT f_vat_amt
                            FROM sp_tor_bidder_dtl aa
                            WHERE aa.sp_tor_bidder_hdr_id = ? AND aa.sp_tor_dtl_id = a.sp_tor_dtl_id
                            AND aa.i_enabled = 1  AND aa.dc_creditor_id = ?
                        ) AS f_vat_amt
                        ,(
                            SELECT f_vat_edit_amt
                            FROM sp_tor_bidder_dtl aa
                            WHERE aa.sp_tor_bidder_hdr_id = ? AND aa.sp_tor_dtl_id = a.sp_tor_dtl_id
                            AND aa.i_enabled = 1  AND aa.dc_creditor_id = ?
                        ) AS f_vat_edit_amt
                        ,(
                            SELECT f_total_add_vat_amt
                            FROM sp_tor_bidder_dtl aa
                            WHERE aa.sp_tor_bidder_hdr_id = ? AND aa.sp_tor_dtl_id = a.sp_tor_dtl_id
                            AND aa.i_enabled = 1  AND aa.dc_creditor_id = ?
                        ) AS f_total_add_vat_amt

                    FROM sp_tor_dtl a
                    WHERE sp_tor_id= ?";

        $arrParam[] = $_REQUEST['sp_tor_bidder_hdr_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        $arrParam[] = $_REQUEST['sp_tor_bidder_hdr_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        $arrParam[] = $_REQUEST['sp_tor_bidder_hdr_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        /* NEW OOOORR 1 */
        $arrParam[] = $_REQUEST['sp_tor_bidder_hdr_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        /* NEW OOOORR 2 */
        $arrParam[] = $_REQUEST['sp_tor_bidder_hdr_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        /* NEW OOOORR 3 */
        $arrParam[] = $_REQUEST['sp_tor_bidder_hdr_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        /* NEW OOOORR 4 */
        $arrParam[] = $_REQUEST['sp_tor_bidder_hdr_id'];
        $arrParam[] = $_REQUEST['dc_creditor_id'];
        /* NEW OOOORR */
        $arrParam[] = $_REQUEST['sp_tor_id'];
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "CheckColumn" => $row["CheckColumn"] == 1 ? true : false,
                "sp_tor_bidder_dtl_id" => $row["sp_tor_bidder_dtl_id"],
                "sp_tor_dtl_id" => $row["sp_tor_dtl_id"],
                "sp_tor_id" => $row["sp_tor_id"],
                "c_name" => $row["c_name"],
                "i_qty" => $row["i_qty"],
                "f_bid_unit_price" => $row["f_bid_unit_price"],
                "f_bid_total_price" => $row["f_bid_unit_price"] * $row["i_qty"],
                "i_used" => $row["i_used"],
                "i_balance" => $row["i_balance"],
                "dc_expense_budget_type_name" => $row["dc_expense_budget_type_name"],
                "dc_unit_type_id" => $row["dc_unit_type_id"],
                "c_unit" => $row["c_unit"],
                "dc_bg_budget_type_id" => $row["dc_bg_budget_type_id"],
                "i_product_type" => $row["i_product_type"],
                "i_is_inv" => $row["i_is_inv"],
                "po_expense_id" => $row["po_expense_id"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "i_hire_type" => $row["i_hire_type"],
                "f_disc_price" => $row["f_disc_price"],
                "f_unit_price" => number_format($row["f_unit_price"], 2),
                "f_rate_vat" => number_format($row["f_rate_vat"], 2),
                "f_vat_amt" => number_format($row["f_vat_amt"], 2),
                "f_vat_edit_amt" => number_format($row["f_vat_edit_amt"], 2),
                "f_total_add_vat_amt" => number_format($row["f_total_add_vat_amt"], 2),
                "f_total_price" => number_format($row["i_qty"] * $row["f_unit_price"], 2),
            );
            ${$root}[] = $temp;
        }
        // print_r(${$root}); exit;
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "CHECK_CREDITOR":
        $root = "data";
        $data = array();
        $sqlMain = "SELECT c_name FROM NMU.dbo.dc_creditor WHERE c_tax_number_imp = ? ORDER BY c_name";
        $arrParam[] = $_REQUEST['c_tax_number_imp'];
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = 0;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "dc_creditor_name" => $row["c_name"],
            );
            ${$root}[] = $temp;
        }
        // print_r(${$root}); exit;
        echo json_encode(
                array(
                    "success" => "Success",
                    "c_tax_number_imp" => $_REQUEST["c_tax_number_imp"],
                    "dc_creditor_name" => $_REQUEST["dc_creditor_name"],
                    "debug" => true,
                    "totalCount" => $i,
                    $root => ${$root}
                )
        );
        exit();

        break;
    case "ADD_CREDITOR":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data["c_name"] = $_REQUEST["dc_creditor_name"];
        $data["c_tax_number_imp"] = $_REQUEST["c_tax_number_imp"];
        $data["i_enable"] = 1;
        $data["i_delete"] = 2;

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        // if ($_REQUEST['sp_tor_bidder_hdr_id'] == null) {  // ****** ADD ******
        $data["dc_user_create_id"] = $_SESSION["user_id"];
        $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_create"] = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ",
            {$fld}";
            $addValue .= ", ?";
        }

        $sql = "SET NOCOUNT ON
                INSERT INTO NMU.dbo.dc_creditor (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
        $stmt = $db->QueryParam($sql, $arrValue);
        // } else if ($_REQUEST['sp_tor_bidder_hdr_id'] > 0) { // ****** EDIT ******
        //     foreach ($data as $fldA => $value) {
        //         $arrValue[] = ($value != "") ? $value : null;
        //         $addField .= ", {$fldA} = ?";
        //     }
        //     $arrValue[] = $_REQUEST["sp_tor_bidder_hdr_id"];
        //     $sql = "UPDATE sp_tor_bidder_hdr SET " . substr($addField, 1) . " WHERE sp_tor_bidder_hdr_id = ?";
        //     $stmt = $db->QueryParam($sql, $arrValue);
        // }

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        break;
    case "LIST_SP_TOR_BIDDER_HDR":
        $root = "data";
        $data = array();
        $sqlMain = "SELECT
                        a.sp_tor_bidder_hdr_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , b.c_tax_number_imp
                        , b.c_name AS dc_creditor_name
                        , CONVERT(VARCHAR,a.d_doc_date, 120) AS d_doc_date
                        , a.c_discription
                        , a.i_enabled
                        , isnull(a.i_is_guarantee,0) as i_is_guarantee
                        , a.d_doc_guarantee_ref
                        , CONVERT(VARCHAR,a.d_guarantee_date, 120) AS d_guarantee_date
                        , (select c_name from dc_bank where  a.dc_bank_id = dc_bank_id ) as dc_bank_name
                        , a.dc_bank_id
                        , isnull(a.f_total_guarantee,0) as f_total_guarantee
                        , a.dc_user_create_id
                        , a.dc_user_create_cost_id
                        , a.dc_user_create_department_id
                        , CONVERT(VARCHAR,a.d_create, 120) AS d_create
                        , a.dc_user_update_id
                        , a.dc_user_update_cost_id
                        , a.dc_user_update_department_id
                        , CONVERT(VARCHAR,a.d_update , 120) AS d_update
                        , (select count(sp_tor_bidder_dtl_id) from sp_tor_bidder_dtl aa where aa.sp_tor_bidder_hdr_id = a.sp_tor_bidder_hdr_id) AS bid_count
                    FROM sp_tor_bidder_hdr a
                    INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id
                    WHERE a.sp_tor_id = ? AND a.i_enabled = 1
                    ORDER BY a.d_create DESC";
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_tor_bidder_hdr_id" => $row["sp_tor_bidder_hdr_id"],
                "sp_tor_id" => $row["sp_tor_id"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "i_is_guarantee" => $row["i_is_guarantee"],
                "d_doc_guarantee_ref" => $row["d_doc_guarantee_ref"],
                "d_guarantee_date" => $row["d_guarantee_date"],
                "dc_bank_name" => $row["dc_bank_name"],
                "dc_bank_id" => $row["dc_bank_id"],
                "f_total_guarantee" => number_format($row["f_total_guarantee"], 2),
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "c_discription" => $row["c_discription"],
                "i_enabled" => $row["i_enabled"],
                "dc_user_create_id" => $row["dc_user_create_id"],
                "dc_user_create_cost_id" => $row["dc_user_create_cost_id"],
                "dc_user_create_department_id" => $row["dc_user_create_department_id"],
                "d_create" => $date->extDateBuddha($row["d_create"]),
                "dc_user_update_id" => $row["dc_user_update_id"],
                "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                "dc_user_update_department_id" => $row["dc_user_update_department_id"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
                "bid_count" => $row["bid_count"],
            );
            ${$root}[] = $temp;
        }
        // print_r(${$root}); exit;
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;

    case "UP_SP_TOR_BIDDER_HDR":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
        $data["i_enabled"] = 1;

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        $f1 = $db->GetDataBySQL('select COUNT(*) from sp_tor_bidder_hdr  where i_enabled = 1 and sp_tor_id = ? and dc_creditor_id = ?', array($_REQUEST["sp_tor_id"], $_REQUEST["dc_creditor_id"]));
        if ($f1 > 0) {
            $stmt = false;
            $sql = "exists bidder ";
            break;
        } else if ($_REQUEST['sp_tor_bidder_hdr_id'] == null) {  // ****** ADD ******
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["i_is_guarantee"] = $_REQUEST["i_is_guarantee"] ?? null;
            $data["d_doc_guarantee_ref"] = $_REQUEST["d_doc_guarantee_ref"] ?? null;
            $data["d_guarantee_date"] = $date->bc_to_ad($_REQUEST['d_guarantee_date']) ?? null;
            $data["dc_bank_id"] = $_REQUEST["dc_bank_id"] ?? null;
            $data["f_total_guarantee"] = str_replace(",", "", $_REQUEST["f_total_guarantee"]) ?? null;
            // $_REQUEST["f_total_guarantee"];
            unset($arrValue);
            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }

            $sql = "
                    SET NOCOUNT ON
                    UPDATE sp_tor_dtl set c_name = '{$_REQUEST['c_name']}' where sp_tor_id = {$_REQUEST['sp_tor_id']}
                    INSERT INTO sp_tor_bidder_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
            $stmt = $db->QueryParam($sql, $arrValue);
        } else if ($_REQUEST['sp_tor_bidder_hdr_id'] > 0) { // ****** EDIT ******
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_tor_bidder_hdr_id"];
            $sql = "UPDATE sp_tor_bidder_hdr SET " . substr($addField, 1) . " WHERE sp_tor_bidder_hdr_id = ?";

            $stmt = $db->QueryParam($sql, $arrValue);
        }

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        break;
    case "DELETE_SP_TOR_BIDDER_HDR":
        $sql = "DELETE sp_tor_bidder_hdr
                WHERE sp_tor_bidder_hdr_id = ? ;

                DELETE sp_tor_bidder_dtl
                WHERE sp_tor_bidder_hdr_id = ? ;";
        $arrValue[] = $_REQUEST["id"];
        $arrValue[] = $_REQUEST["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "DELETE_SP_TOR_BIDDER_DTL":
        $sql = "DELETE sp_tor_bidder_dtl
                    WHERE sp_tor_bidder_dtl_id = ? ;";
        $arrValue[] = $_REQUEST["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UP_SP_TOR_VICTORY":
        $root = "data";
        $data = array();

        $mode = $_REQUEST["mode"];
        $arrParam = array();
        $addField = null;
        $addValue = null;
        $arrValue = array();
        $Arr = json_decode($_REQUEST["data"], true);
        foreach ($Arr as $fldd) {

            $data["sp_tor_id"] = $fldd["sp_tor_id"];
            $data["sp_tor_dtl_id"] = $fldd["sp_tor_dtl_id"];
            $data["sp_tor_bidder_dtl_id"] = $fldd["sp_tor_bidder_dtl_id"];
            $data["dc_creditor_id"] = $fldd["dc_creditor_id"];
            $data["c_name"] = $fldd["c_name"];
            $data["i_enabled"] = 1;

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
                $addValue .= ", ?";
            }

            $sql = "
                    SET NOCOUNT ON
                    INSERT INTO sp_tor_victory (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";

            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
        }
        break;
    case "DELETE_SP_TOR_VICTORY":

        $sql = "DELETE sp_tor_victory
                    WHERE sp_tor_bidder_dtl_id = ?";
        $arrParam = array($_REQUEST["id"]);
        $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "UP_SP_TOR_BIDDER_DTL":
        $root = "data";
        $data = array();

        $mode = $_REQUEST["mode"];
        $arrParam = array();
        $addField = null;
        $addValue = null;
        $arrValue = array();
        $Arr = json_decode($_REQUEST["data"], true);
        //       print_r($Arr);
        //        exit();
        foreach ($Arr as $fldd) {

            $data["sp_tor_bidder_hdr_id"] = $fldd["sp_tor_bidder_hdr_id"];
            $data["sp_tor_id"] = $fldd["sp_tor_id"];
            $data["sp_tor_dtl_id"] = $fldd["sp_tor_dtl_id"];
            $data["dc_creditor_id"] = $fldd["dc_creditor_id"];
            $data["dc_unit_type_id"] = $fldd["dc_unit_type_id"];
            $data["c_name"] = $fldd["c_name"];
            $data["i_qty"] = $fldd["i_qty"];
            $data["f_unit_price"] = str_replace(",", "", $fldd["f_unit_price"]);
            /*       [f_rate_vat] => 7.00
              [f_vat_amt] => 70.00
              [f_vat_edit_amt] => 0.02
              [f_total_add_vat_amt] => 1069.98
             */
            $data["f_rate_vat"] = str_replace(",", "", $fldd["f_rate_vat"]);
            $data["f_vat_amt"] = str_replace(",", "", $fldd["f_vat_amt"]);
            $data["f_vat_edit_amt"] = str_replace(",", "", $fldd["f_vat_edit_amt"]);
            $data["f_total_add_vat_amt"] = str_replace(",", "", $fldd["f_total_add_vat_amt"]);
            $data["f_unit_price"] = str_replace(",", "", $fldd["f_unit_price"]);
            $data["i_enabled"] = 1;

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
                $addValue .= ", ?";
            }

            $sql = "
                    SET NOCOUNT ON
                    INSERT INTO sp_tor_bidder_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";
            //            echo $sql;
            //            print_r($arrValue);
            //            exit();

            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
        }
        break;

    case "TOR_VICTORY":

        $root = "data";
        $data = array();

        $sqlMain = "SELECT
                        a.sp_tor_id
                        ,a.dc_creditor_id
                        ,b.c_name AS dc_creditor_name
                        ,a.i_enabled
                    FROM  sp_tor_victory a
                    INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id
                    WHERE a.i_enabled = 1 AND b.i_enable = 1 AND a.sp_tor_id = ?";

        $arrParam = array($_REQUEST["sp_tor_id"]);
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = 0;
        while ($row = $db->Fetch($stmt)) {
            $i++;
            $temp = array(
                "no" => $i,
                "id" => $i,
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "dc_creditor_id" => $row["dc_creditor_id"],
                "dc_creditor_id_old" => $row["dc_creditor_id"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "i_enabled" => $row["i_enabled"],
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();
        break;
    case "UPDATE_TOR_VICTORY":
        // echo $_REQUEST["sp_tor_id"]; exit;
        // echo $_REQUEST["dc_bg_budget_type_id"];
        // echo '<br>'.$_REQUEST["i_enabled"];
        // echo '<br>'.$_REQUEST["dc_expense_budget_type_id"]; exit;
        ###########################################
        $root = "data";
        $data = array();
        $msg = "";

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $DATA = $db->GetDataBySQL('select COUNT(sp_tor_id) AS data_num from sp_tor_victory where sp_tor_id = ? and dc_creditor_id = ? and i_enabled = 1', array($_REQUEST["sp_tor_id"], $_REQUEST["dc_creditor_id_old"]));
        // echo $DATA ; exit;
        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
        $data["c_name"] = $_REQUEST["dc_creditor_name"];
        $data["i_enabled"] = $_REQUEST["i_enabled"];

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        if ($DATA > 0) {
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_tor_id"];
            $arrValue[] = $_REQUEST["dc_creditor_id_old"];
            $sql = "UPDATE sp_tor_victory SET " . substr($addField, 1) . " WHERE sp_tor_id = ? and dc_creditor_id = ?";
            // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
            $stmt = $db->QueryParam($sql, $arrValue);
        } else {
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
                    INSERT INTO sp_tor_victory (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";
            // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
            $stmt = $db->QueryParam($sql, $arrValue);
        }

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        break;
    case "DELETE_TOR_VICTORY":
        $sql = "DELETE sp_tor_victory
            WHERE sp_tor_id = ? and dc_creditor_id = ?";
        $arrValue[] = $_REQUEST["tor_id"];
        $arrValue[] = $_REQUEST["dc_creditor_id"];
        // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UP_SP_TOR_CONTRACT":

        //  print_r($data);
        // exit();

        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        // $data["c_doc_ref"] = $_REQUEST["c_contract_no"];
        $data['d_doc_date'] = !empty($_REQUEST['d_contract_date']) ? $date->bc_to_ad($_REQUEST['d_contract_date']) : null;
        $data['d_start_date'] = !empty($_REQUEST['d_start_date']) ? $date->bc_to_ad($_REQUEST['d_start_date']) : null;
        $data['d_due_date'] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
        $data["c_name"] = $_REQUEST["c_name"];
        $data["c_code"] = $_REQUEST["c_code"];
        $data["dc_creditor_id"] = $_REQUEST["dc_creditor_id"];
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total"]);
        $data["i_is_po"] = (@$_REQUEST["i_is_po"] == null) ? 0 : @$_REQUEST["i_is_po"];
        $data["i_is_period"] = (@$_REQUEST["i_is_period"] == null) ? 0 : @$_REQUEST["i_is_period"];
        $data['i_delivery'] = $_REQUEST["i_day"];
        $data['i_is_join_venture'] = $_REQUEST["i_is_join_venture"] ?? null;
        // echo $data["i_is_po"] ;exit;
        if (@$_REQUEST["i_is_bank_warranty0"] == 1) {
            $data["i_is_warranty"] = null;
            $data["cashiercheque_on"] = null;
            $data["i_is_warranty_book"] = null;
        } else {
            $data["i_is_warranty"] = @$_REQUEST["i_is_bank_warranty"];
            $data["cashiercheque_on"] = @$_REQUEST["i_is_cashiercheque_warrantyID"];
            $data["i_is_warranty_book"] = @$_REQUEST["i_is_bank_warranty1"];
        }

        if (@$_REQUEST["i_is_expense_monthly"] == 1) {
            $data["i_is_monthly"] = @$_REQUEST["i_is_expense_monthly"];
        } else {
            $data["i_is_monthly"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty"] == 1) {
            $data["book_no"] = $_REQUEST["c_books_receipt"];
            $data["book_seq"] = $_REQUEST["c_receipt_no"];
            $data["d_book_date"] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
            $data["f_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt"]);
            $data["c_remark"] = $_REQUEST["c_comment"];
        } else {
            $data["book_no"] = null;
            $data["book_seq"] = null;
            $data["d_book_date"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_amt"] = null;
            $data["c_remark"] = null;
        }

        if (@$_REQUEST["i_is_cashiercheque_warranty"] == 1) {
            $data["cashiercheque_on"] = $_REQUEST["c_books_cashiercheque"];
            $data["cashiercheque_seq"] = $_REQUEST["c_receipt_cashiercheque"];
            $data["d_cashiercheque_data"] = !empty($_REQUEST['d_cashiercheque_date']) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
            $data["f_warranty_cashiercheque"] = str_replace(',', '', $_REQUEST["f_cashiercheque_warranty_amt2"]);
            $data["c_remark_cashiercheque"] = $_REQUEST["c_comment2"];
        } else {
            $data["cashiercheque_on"] = null;
            $data["cashiercheque_seq"] = null;
            $data["d_cashiercheque_data"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_cashiercheque"] = null;
            $data["c_remark_cashiercheque"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty1"] == 1) {
            $data["book_warranty_no"] = $_REQUEST["c_doc_no"];
            $data["d_book_warranty_date"] = !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
            $data["dc_bank_id"] = $_REQUEST["dc_bank_id"];
            $data["f_book_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt1"]);
            $data["d_book_warranty_end"] = !empty($_REQUEST['d_expire_warranty']) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
            $data["c_remark1"] = $_REQUEST["c_comment1"];
        } else {
            $data["book_warranty_no"] = null;
            $data["d_book_warranty_date"] = null;
            $data["dc_bank_id"] = null;
            $data["f_book_warranty_amt"] = null;
            $data["d_book_warranty_end"] = null;
            $data["c_remark1"] = null;
        }

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if ($_REQUEST['i_edit_type'] == null) {  // ****** ADD ******
            $data["dc_cost_id"] = $db->GetDataBySQL('SELECT dc_cost_id FROM sp_tor WHERE tor_id = ?', array($_REQUEST["sp_tor_id"]));
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
            if ($_REQUEST['sp_tor_id2'] != null) {
                $tor_notor3 = " update sp_tor set i_is_notor = 3  where  tor_id  =  {$_REQUEST['sp_tor_id2']}";
                $con_notor3 = " update sp_tor_contract set i_notor = 3 where  sp_tor_contract_id  =  {$_REQUEST['sp_tor_contract_id2']}";
            } else {
                $tor_notor3 = " ";
                $con_notor3 = " ";
            }
            $sql = "
                SET NOCOUNT ON
                INSERT INTO sp_tor_contract (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                INSERT INTO sp_po_hdr (
                    sp_tor_contract_id
                    ,sp_tor_id
                    ,dc_creditor_id
                    ,i_is_po
                    ,f_total_amt
                    ,sp_emp_id
                    ,dc_user_update_id
                    ,dc_user_update_cost_id
                    ,d_update
                    ,dc_user_create_id
                    ,dc_user_create_cost_id
                    ,d_create
                ) VALUES (
                    @@IDENTITY
                    ,{$data["sp_tor_id"]}
                    ,{$_REQUEST["dc_creditor_id"]}
                    ,0
                    ,'{$data["f_total_amt"]}'

                    ,{$data["sp_emp_id"]}
                    ,{$data["dc_user_update_id"]}
                    ,{$data["dc_user_update_cost_id"]}
                    ,'{$data["d_update"]}'
                    ,{$data["dc_user_create_id"]}
                    ,{$data["dc_user_create_cost_id"]}
                    ,'{$data["d_create"]}'
                )
                    {$tor_notor3}
                    {$con_notor3}
                    ;";
            // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
            $stmt = $db->QueryParam($sql, $arrValue);
            if (@$_REQUEST["show_sql"]) {
                /*                 * ****echo sql***** */
                $sql = (@$sqlMain) ? $sqlMain : $sql;
                $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

                $sql = str_replace('?', '#-#', $sql);
                foreach ($arr as $fld => $value) {
                    $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
                }
                echo $sql;
                exit;
                /*                 * ***************** */
            }
        } else if ($_REQUEST['i_edit_type'] == 0) { // ****** EDIT ******
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_tor_contract_id"];
            $sql = "UPDATE sp_tor_contract SET " . substr($addField, 1) . " WHERE sp_tor_contract_id = ?
                    UPDATE sp_po_hdr SET
                        i_is_po                     = 0
                        ,dc_creditor_id             = {$data["dc_creditor_id"]}
                        ,f_total_amt                = '{$data["f_total_amt"]}'
                        ,dc_user_update_id          = {$data["dc_user_update_id"]}
                        ,dc_user_update_cost_id     = {$data["dc_user_update_cost_id"]}
                        ,d_update                   = '{$data["d_update"]}'
                    WHERE sp_tor_contract_id = {$_REQUEST["sp_tor_contract_id"]}";

            $stmt = $db->QueryParam($sql, $arrValue);
        } else if ($_REQUEST['i_edit_type'] == 1) { // ****** ADD 1 ******
            $data["parent_id"] = $_REQUEST["sp_tor_contract_id"];
            $data["i_parent"] = 1;
            $data["i_is_edit"] = $_REQUEST['i_edit_type'];

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
                INSERT INTO sp_tor_contract (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                INSERT INTO sp_po_hdr (
                    sp_tor_contract_id
                    ,sp_tor_id
                    ,dc_creditor_id
                    ,i_is_po
                    ,f_total_amt

                    ,dc_user_update_id
                    ,dc_user_update_cost_id
                    ,d_update
                    ,dc_user_create_id
                    ,dc_user_create_cost_id
                    ,d_create
                ) VALUES (
                    @@IDENTITY
                    ,{$_REQUEST["sp_tor_id"]}
                    ,{$_REQUEST["dc_creditor_id"]}
                    , 0
                    ,'{$data["f_total_amt"]}'

                    ,{$data["dc_user_update_id"]}
                    ,{$data["dc_user_update_cost_id"]}
                    ,'{$data["d_update"]}'
                    ,{$data["dc_user_create_id"]}
                    ,{$data["dc_user_create_cost_id"]}
                    ,'{$data["d_create"]}'
                )";
            // echo $sql . '/*';
            // print_r($arrValue);
            // echo '*/';
            // exit;
            $stmt = $db->QueryParam($sql, $arrValue);
        }

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        break;
    case "UP_SP_TOR_HDR_PERIOD":

        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //update dbo.sp_tor_hdr_period i_is_last = null where sp_tor_contract_id = {$data['sp_tor_contract_id']}
        $db->GetDataBySQL('update dbo.sp_tor_hdr_period set i_is_last = null where sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
        $d_update = date("Y-m-d H:i:s");
        $data["sp_tor_contract_id"] = $_REQUEST['sp_tor_contract_id'];
        $data["dc_expense_budget_type_id"] = $_REQUEST['dc_expense_budget_type_id'] ?? null;
        $data["i_period"] = $_REQUEST['i_period'];
        $data["i_pr_type1"] = $_REQUEST['i_pr_type1'] ?? null;
        $data["i_is_last"] = $_REQUEST['i_is_last'] ?? null;

        $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;

        $data["sp_po_id"] = $db->GetDataBySQL('SELECT sp_po_id FROM sp_po_hdr WHERE isnull(i_is_po,0) = 0 and sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
        $data["i_day"] = $_REQUEST['i_day'];
        $data["i_alert"] = $_REQUEST['i_alert'];

        $data['d_period_date'] = !empty($_REQUEST['d_period_date']) ? $date->bc_to_ad($_REQUEST['d_period_date']) : null;
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
        // $data["i_is_status"]		    = @$_REQUEST['i_seq_status'];
        $data["c_discription"] = $_REQUEST["c_discription"] ?? null;
        $data['dc_cost_id'] = $_REQUEST['dc_cost2_id'] ?? null;
        // $data["i_is_po"] = @$_REQUEST["i_is_po"];
        $data['dc_user_create_id'] = $_SESSION["user_id"];
        $data['dc_user_create_cost_id'] = $_SESSION["dc_cost_id"];
        $data['dc_user_create_department_id'] = $_SESSION["dc_department_id"];
        $data['d_create'] = date("Y-m-d H:i:s");
        $data['dc_creditor_id'] = $_REQUEST["dc_creditor_id"] ?? null;
        $data['i_joint_venture'] = $_REQUEST["i_is_join_venture_per"] ?? null;
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_net_unit_price"]);

        if ($_REQUEST['sp_tor_hdr_period_id'] > 0) {

            if ($_REQUEST['copy_contract_dtl'] == 'save') {
                foreach ($data as $fldA => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fldA} = ?";
                }
                $sql = "UPDATE sp_tor_hdr_period SET " . substr($addField, 1) . " WHERE sp_tor_hdr_period_id = ?";

                $arrValue[] = $_REQUEST["sp_tor_hdr_period_id"];
                //                    echo $sql;
                //                print_r($arrValue);
                //                exit();


                $stmt = $db->QueryParam($sql, $arrValue);

                $re_id = $_REQUEST['sp_tor_hdr_period_id'];
                $i_period = $data["i_period"];
                $d_period_date = $data['d_period_date'];
                $f_total_amt = $data["f_total_amt"];

                $arrValue2[] = $_REQUEST['i_product_type'];
                $arrValue2[] = $_REQUEST['i_hire_type_l'];
                $arrValue2[] = $f_total_amt;
                $arrValue2[] = $re_id;
                $sql2 = "UPDATE dbo.sp_tor_dtl_period SET  i_product_type =? , i_hire_type =? , f_net_unit_price =? WHERE sp_tor_hdr_period_id = ?";

                $stmt2 = $db->QueryParam($sql2, $arrValue2);
            } else {
                //            $data["po_expense_id"] = $_REQUEST["sp_expense_id"];
                //        $data["dc_unit_type_id"] = $_REQUEST["sp_unit_type_id"];
                //        print_r($_REQUEST);
                //        exit();
                $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
                $tor_id = $_REQUEST['tor_id'] ?? null;
                $count = $_REQUEST['i_period'] ?? null;   //$db->GetDataBySQL("select (count(*)+1) as count from dbo.sp_tor_contract where sp_tor_contract_id=?", array($data['sp_tor_contract_id']));
                $data['i_period'] = $count;
                $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where  i_enabled = 1  and sp_tor_id=?", array($tor_id));
                $c_code = $row['front'] . '/' . $data['i_period'] . $row['back'];
                $data['c_contract_code'] = $c_code;
                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }
                //                echo substr($addField, 1) . ") VALUES (" . substr($addValue, 1);
                //                print_r($arrValue);
                //                exit();
                $sql = "SET NOCOUNT ON
                        INSERT INTO dbo.sp_tor_hdr_period (" . substr($addField, 1) . " , i_enabled ) VALUES (" . substr($addValue, 1) . ",1);
                        SELECT
                            a.sp_tor_hdr_period_id AS id
                            , a.sp_tor_contract_id
                            , b.c_code as c_doc_ref_contract
                            , b.dc_creditor_id
                            , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                            , a.sp_po_id
                            , a.i_is_status
                            , a.i_period
                            , a.f_total_amt
                            , a.i_is_last
                            , a.c_discription
                            , convert(varchar, d_period_date, 120) as d_period_date
                        FROM dbo.sp_tor_hdr_period a
                        INNER join sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                        WHERE sp_tor_hdr_period_id = @@IDENTITY
                        INSERT INTO dbo.sp_tor_item (tor_id
                            , contract_id
                            , sp_tor_hdr_period_id
                            , d_period_status_date
                            , act_user_id
                            , act_cost_id
                            , act_date_dt
                        ) VALUES (
                            (SELECT sp_tor_id FROM sp_tor_contract WHERE sp_tor_contract_id = {$data["sp_tor_contract_id"]})
                            ,{$data['sp_tor_contract_id']}
                            ,@@IDENTITY
                            ,'{$data['d_period_date']}'
                            ,{$_SESSION["user_id"]}
                            ,{$_SESSION["dc_cost_id"]}
                            ,'{$d_update}'
                        );
                        ";
                // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
                $stmt = $db->QueryParam($sql, $arrValue);
                $ss_id = $db->Fetch($stmt);
                $re_id = $ss_id["id"];
                $dc_creditor_name = $ss_id["dc_creditor_name"];
                $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
                $i_period = $data["i_period"];
                $d_period_date = $data['d_period_date'];
                $f_total_amt = $data['f_total_amt'];
            } //End coppies
        } else {


            //                print_r($_REQUEST);
            //            exit();

            $data["period_status_id"] = 4; //รอส่งมอบงาน

            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $tor_id = $_REQUEST['tor_id'] ?? null;
            $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where sp_tor_id=?", array($tor_id));
            $data['already_withdrawn'] = $_REQUEST['already_withdrawn'] ?? null;
            $data['i_pr_type1'] = $_REQUEST['i_pr_type1'];
            $c_code = $row['front'] . '/' . $data['i_period'] . $row['back'];
            $data['c_contract_code'] = $c_code;
            $data['dc_cost_id'] = $_REQUEST['dc_cost2_id'] ?? null;
            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
            //                echo substr($addField, 1) . ") VALUES (" . substr($addValue, 1);
            //            print_r($arrValue);
            //            exit();
            $sql = "SET NOCOUNT ON
                        INSERT INTO dbo.sp_tor_hdr_period (" . substr($addField, 1) . ",i_enabled) VALUES (" . substr($addValue, 1) . ",1);
                        SELECT
                            a.sp_tor_hdr_period_id AS id
                            , a.sp_tor_contract_id
                            , b.c_code as c_doc_ref_contract
                            , b.dc_creditor_id
                            , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                            , a.sp_po_id
                            , a.i_is_status
                            , a.i_period
                            , a.f_total_amt
                            , a.i_is_last
                            , a.c_discription
                            , convert(varchar, d_period_date, 120) as d_period_date
                        FROM dbo.sp_tor_hdr_period a
                        INNER join sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                        WHERE sp_tor_hdr_period_id = @@IDENTITY
                        INSERT INTO dbo.sp_tor_item (tor_id
                            , contract_id
                            , sp_tor_hdr_period_id
                            , d_period_status_date
                            , act_user_id
                            , act_cost_id
                            , act_date_dt
                        ) VALUES (
                            (SELECT sp_tor_id FROM sp_tor_contract WHERE sp_tor_contract_id = {$data["sp_tor_contract_id"]})
                            ,{$data['sp_tor_contract_id']}
                            ,@@IDENTITY
                            ,'{$data['d_period_date']}'
                            ,{$_SESSION["user_id"]}
                            ,{$_SESSION["dc_cost_id"]}
                            ,'{$d_update}'
                        );
                        ";
//            echo $db->debugSql($sql, $arrValue);
//            exit();
            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
            $dc_creditor_name = $ss_id["dc_creditor_name"];
            $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
            $i_period = $data["i_period"];
            $d_period_date = $data['d_period_date'];
            $dc_cost2_id = $data['dc_cost_id'] ?? null;
            $f_total_amt = $data['f_total_amt'];
            // ****** dtl_auto
            $root = "data";
            $data = array();
            $msg = "";
            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //

            $data["sp_tor_id"] = $_REQUEST["tor_id"];
            $data["sp_tor_hdr_period_id"] = $re_id;
            $data["dc_bg_budget_type_id"] = $_REQUEST["dc_expense_budget_type_id"];
            $data["po_expense_id"] = $_REQUEST["sp_expense_id"];
            $data["i_hire_type"] = $_REQUEST["i_hire_type_l"];
            if ($data["i_hire_type"] == 0) {
                $data["i_product_type"] = null;
                $data["i_is_inv"] = null;
            } else {
                // $data["i_product_type"] = $_REQUEST["i_product_typehdr"];
                // $data["i_is_inv"] = $_REQUEST["i_is_inv"]; // เข้าคลัง หรือไม่เข้าคลัง
            }
            $data["i_product_type"] = $_REQUEST["i_product_type"] ?? null;

            //i_product_type am_mode_id inv_mode_id
            $data["inv_mode_id"] = $_REQUEST["inv_mode_id"] ?? null;
            $data["am_mode_id"] = $_REQUEST["am_mode_id"] ?? null;
            $data["c_name"] = $_REQUEST["c_name"];
            $data["i_qty"] = $_REQUEST["i_qty"];
            $data["f_net_unit_price"] = str_replace(',', '', $_REQUEST["f_total_amt"]);
            $data["f_net_total_price"] = $data["f_total_amt"] * $data["i_qty"];
            $data["dc_unit_type_id"] = $_REQUEST["sp_unit_type_id"];
            $data["dc_creditor_id"] = $db->GetDataBySQL('SELECT dc_creditor_id FROM sp_tor_contract WHERE  sp_tor_contract_id = ?', array($_REQUEST["sp_tor_contract_id"]));

            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

            //        print_r($data);
            //        exit();
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
                                        INSERT INTO sp_tor_dtl_period (" . substr($addField, 1) . ", i_enabled ) VALUES (" . substr($addValue, 1) . ",1);
                                        SELECT @@IDENTITY as id;";
            //                                                    echo $sql;
            //            print_r($arrValue);
            //            exit();
            $stmt = $db->QueryParam($sql, $arrValue);
            // *****
        }

        unset($data);
        unset($arrValue);

        if ($stmt) {
            $db->CommitTran();
            $re = array(
                "reval" => 0,
                "success" => "Success",
                "msg" => "บันทึกเรียบร้อยแล้ว",
                "id" => $re_id,
                "i_period" => $i_period,
                "d_period_date" => $d_period_date,
                "c_doc_ref_contract" => $c_doc_ref_contract,
                "dc_creditor_name" => $dc_creditor_name,
                "f_total_amt" => $f_total_amt
            );
        } else {
            $db->RollBackTran();
            $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
        }
        echo json_encode($re);
        exit;
        break;
    case "UP_SP_TOR_HDR_PERIOD_PRO":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //update dbo.sp_tor_hdr_period i_is_last = null where sp_tor_contract_id = {$data['sp_tor_contract_id']}
        $db->GetDataBySQL('update dbo.sp_tor_hdr_period set i_is_last = null where sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
        $d_update = date("Y-m-d H:i:s");
        $data["sp_tor_contract_id"] = $_REQUEST['sp_tor_contract_id'];
        $data["dc_expense_budget_type_id"] = $_REQUEST['dc_expense_budget_type_id'] ?? null;
        $data["i_period"] = $_REQUEST['i_period'];
        $data["i_pr_type1"] = $_REQUEST['i_pr_type1'] ?? null;
        $data["i_is_last"] = $_REQUEST['i_is_last'] ?? null;

        $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;

        $data["sp_po_id"] = $db->GetDataBySQL('SELECT sp_po_id FROM sp_po_hdr WHERE isnull(i_is_po,0) = 0 and sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
        $data["i_day"] = $_REQUEST['i_day'];
        $data["i_alert"] = $_REQUEST['i_alert'];
        $data['i_enabled'] = 1;
        $data['d_period_date'] = !empty($_REQUEST['d_period_date']) ? $date->bc_to_ad($_REQUEST['d_period_date']) : null;
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
        // $data["i_is_status"]		    = @$_REQUEST['i_seq_status'];
        $data["c_discription"] = $_REQUEST["c_discription"] ?? null;
        // $data["i_is_po"] = @$_REQUEST["i_is_po"];
        $data['dc_cost_id'] = $_REQUEST['dc_cost2_id'];
        $data['dc_creditor_id'] = $_REQUEST["dc_creditor_id"] ?? null;
        $data['i_joint_venture'] = $_REQUEST["i_is_join_venture_per"] ?? null;
        if ($_REQUEST['sp_tor_hdr_period_id'] > 0) {
            if ($_REQUEST['copy_contract_dtl'] == 'save') {
                foreach ($data as $fldA => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fldA} = ?";
                }
                $sql = "UPDATE sp_tor_hdr_period SET " . substr($addField, 1) . " WHERE sp_tor_hdr_period_id = ?";

                $arrValue[] = $_REQUEST["sp_tor_hdr_period_id"];

                //                  echo $sql;
                //                        print_r($arrValue);
                //                        exit();

                $stmt = $db->QueryParam($sql, $arrValue);

                $re_id = $_REQUEST['sp_tor_hdr_period_id'];
                $i_period = $data["i_period"];
                $dc_creditor_name = null;
                $c_doc_ref_contract = null;
                $d_period_date = $data['d_period_date'];
                $f_total_amt = $data['f_total_amt'];
            } else {


                $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
                $tor_id = $_REQUEST['tor_id'] ?? null;
                $count = $_REQUEST['i_period'] ?? null;   //$db->GetDataBySQL("select (count(*)+1) as count from dbo.sp_tor_contract where sp_tor_contract_id=?", array($data['sp_tor_contract_id']));
                $data['i_period'] = $count;
                //                $data["i_day"] = null;
                //                $data["i_alert"] = null;

                $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where sp_tor_id=?", array($tor_id));
                $c_code = $row['front'] . '/' . $data['i_period'] . $row['back'];
                $data['c_contract_code'] = $c_code;
                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }
                //                            echo substr($addField, 1) . ") VALUES (" . substr($addValue, 1);
                //                            print_r($arrValue);
                //                            exit();
                $sql = "SET NOCOUNT ON
                    INSERT INTO dbo.sp_tor_hdr_period (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT
                        a.sp_tor_hdr_period_id AS id
                        , a.sp_tor_contract_id
                        , b.c_code as c_doc_ref_contract
                        , b.dc_creditor_id
                        , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                        , a.sp_po_id
                        , a.i_is_status
                        , a.i_period
                        , a.f_total_amt
                        , a.i_is_last
                        , a.c_discription
                        , convert(varchar, d_period_date, 120) as d_period_date
                    FROM dbo.sp_tor_hdr_period a
                    INNER join sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                    WHERE sp_tor_hdr_period_id = @@IDENTITY
                    INSERT INTO dbo.sp_tor_item (tor_id
                        , contract_id
                        , sp_tor_hdr_period_id
                        , d_period_status_date
                        , act_user_id
                        , act_cost_id
                        , act_date_dt
                    ) VALUES (
                        (SELECT sp_tor_id FROM sp_tor_contract WHERE sp_tor_contract_id = {$data["sp_tor_contract_id"]})
                        ,{$data['sp_tor_contract_id']}
                        ,@@IDENTITY
                        ,'{$data['d_period_date']}'
                        ,{$_SESSION["user_id"]}
                        ,{$_SESSION["dc_cost_id"]}
                        ,'{$d_update}'
                    );
                    ";
                // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
                $stmt = $db->QueryParam($sql, $arrValue);
                $ss_id = $db->Fetch($stmt);
                $re_id = $ss_id["id"];
                $dc_creditor_name = $ss_id["dc_creditor_name"];
                $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
                $i_period = $data["i_period"];
                $d_period_date = $data['d_period_date'];
                $f_total_amt = $data['f_total_amt'];
            } //End coppies
        } else {

            $data["period_status_id"] = 4; //รอส่งมอบงาน
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
            $tor_id = $_REQUEST['tor_id'] ?? null;
            $row = $db->GetDataBySQL("select left(c_code,len(c_code)-5) as front,right(c_code,5) as back from dbo.sp_tor_contract where sp_tor_id=?", array($tor_id));
            $c_code = $row['front'] . '/' . $data['i_period'] . $row['back'];
            $data['c_contract_code'] = $c_code;
            $data['dc_cost_id'] = $_REQUEST['dc_cost2_id'] ?? null;

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
            //                        echo substr($addField, 1) . ") VALUES (" . substr($addValue, 1);
            //                        print_r($arrValue);
            //                        exit();
            $sql = "SET NOCOUNT ON
                    INSERT INTO dbo.sp_tor_hdr_period (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT
                        a.sp_tor_hdr_period_id AS id
                        , a.sp_tor_contract_id
                        , b.c_code as c_doc_ref_contract
                        , b.dc_creditor_id
                        , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                        , a.sp_po_id
                        , a.i_is_status
                        , a.i_period
                        , a.f_total_amt
                        , a.i_is_last
                        , a.c_discription

                        , convert(varchar, d_period_date, 120) as d_period_date
                    FROM dbo.sp_tor_hdr_period a
                    INNER join sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                    WHERE sp_tor_hdr_period_id = @@IDENTITY
                    INSERT INTO dbo.sp_tor_item (tor_id
                        , contract_id
                        , sp_tor_hdr_period_id
                        , d_period_status_date
                        , act_user_id
                        , act_cost_id
                        , act_date_dt
                    ) VALUES (
                        (SELECT sp_tor_id FROM sp_tor_contract WHERE sp_tor_contract_id = {$data["sp_tor_contract_id"]})
                        ,{$data['sp_tor_contract_id']}
                        ,@@IDENTITY
                        ,'{$data['d_period_date']}'
                        ,{$_SESSION["user_id"]}
                        ,{$_SESSION["dc_cost_id"]}
                        ,'{$d_update}'
                    );
                    ";
            // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
            $stmt = $db->QueryParam($sql, $arrValue);

            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
            $dc_creditor_name = $ss_id["dc_creditor_name"];
            $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
            $i_period = $data["i_period"];
            $d_period_date = $data['d_period_date'];
            $dc_cost2_id = $data['dc_cost_id'];
            $f_total_amt = $data['f_total_amt'];
        }
        $dc_cost2_id = $data['dc_cost_id'];
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        if ($stmt) {
            $db->CommitTran();
            $re = array(
                "reval" => 0,
                "success" => "Success",
                "msg" => "บันทึกเรียบร้อยแล้ว",
                "id" => $re_id,
                "i_period" => $i_period,
                "d_period_date" => $d_period_date,
                "c_doc_ref_contract" => $c_doc_ref_contract,
                "dc_creditor_name" => $dc_creditor_name,
                "dc_cost2_id" => $dc_cost2_id,
                "f_total_amt" => $f_total_amt
            );
        } else {
            $db->RollBackTran();
            $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
        }
        echo json_encode($re);
        exit;
        break;
    case "UP_SP_TOR_HDR_PERIOD_PO":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $db->GetDataBySQL('update dbo.sp_tor_hdr_period set i_is_last = null where sp_tor_contract_id = ?', array($_REQUEST['sp_tor_contract_id']));
        $d_update = date("Y-m-d H:i:s");
        $data["sp_tor_contract_id"] = $_REQUEST['sp_tor_contract_id'];
        $data["i_period"] = $_REQUEST['i_period'];
        $data["i_is_last"] = @$_REQUEST['i_is_last'];
        $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;

        $data["sp_po_id"] = $_REQUEST['sp_po_id'];
        $data["i_day"] = $_REQUEST['i_day'];
        $data["i_alert"] = $_REQUEST['i_alert'];

        $data['d_period_date'] = !empty($_REQUEST['d_period_date']) ? $date->bc_to_ad($_REQUEST['d_period_date']) : null;
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
        // $data["i_is_status"]                 = @$_REQUEST['i_seq_status'];
        $data["c_discription"] = $_REQUEST["c_discription"];
        // $data["i_is_po"]                     = @$_REQUEST["i_is_po"];

        if ($_REQUEST['sp_tor_hdr_period_id'] > 0) {

            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $sql = "UPDATE sp_tor_hdr_period SET " . substr($addField, 1) . " WHERE sp_tor_hdr_period_id = ?";
            $arrValue[] = $_REQUEST["sp_tor_hdr_period_id"];
            $stmt = $db->QueryParam($sql, $arrValue);

            $re_id = $_REQUEST['sp_tor_hdr_period_id'];
            $i_period = $data["i_period"];
            $dc_creditor_name = null;
            $c_doc_ref_contract = null;
            $d_period_date = $data['d_period_date'];
            $f_total_amt = $data['f_total_amt'];
        } else {

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }

            $sql = "
                    SET NOCOUNT ON
                    INSERT INTO dbo.sp_tor_hdr_period (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");

                    SELECT
                        a.sp_tor_hdr_period_id AS id
                        , a.sp_tor_contract_id
                        , b.c_code  as c_doc_ref_contract
                        , b.dc_creditor_id
                        , (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                        , a.sp_po_id
                        , a.i_is_status
                        , a.i_period
                        , a.f_total_amt
                        , a.i_is_last
                        , a.c_discription
                        , convert(varchar, d_period_date, 120) as d_period_date
                    FROM dbo.sp_tor_hdr_period a
                    INNER join sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                    WHERE sp_tor_hdr_period_id = @@IDENTITY

                    INSERT INTO dbo.sp_tor_item (
                        tor_id
                        ,contract_id
                        ,sp_tor_hdr_period_id
                        ,d_period_status_date
                        , act_user_id , act_cost_id , act_date_dt
                    ) VALUES (
                        (SELECT sp_tor_id FROM sp_tor_contract WHERE sp_tor_contract_id = {$data["sp_tor_contract_id"]})
                        ,{$data['sp_tor_contract_id']}
                        ,@@IDENTITY
                        ,'{$data['d_period_date']}'
                        ,{$_SESSION["user_id"]}
                        ,{$_SESSION["dc_cost_id"]}
                        ,'{$d_update}'
                    );

                    ";
            // echo $sql .'/*'; print_r($arrValue); echo '*/'; exit;
            $stmt = $db->QueryParam($sql, $arrValue);

            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
            $dc_creditor_name = $ss_id["dc_creditor_name"];
            $c_doc_ref_contract = $ss_id["c_doc_ref_contract"];
            $i_period = $data["i_period"];
            $d_period_date = $data['d_period_date'];
            $f_total_amt = $data['f_total_amt'];
        }


        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        if ($stmt) {
            $db->CommitTran();
            $re = array(
                "reval" => 0,
                "success" => "Success",
                "msg" => "บันทึกเรียบร้อยแล้ว",
                "id" => $re_id,
                "i_period" => $i_period,
                "d_period_date" => $d_period_date,
                "c_doc_ref_contract" => $c_doc_ref_contract,
                "dc_creditor_name" => $dc_creditor_name,
                "f_total_amt" => $f_total_amt
            );
        } else {
            $db->RollBackTran();
            $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
        }
        echo json_encode($re);
        exit;
        break;
    case "DELETE_SP_PROJECT_HDR_PERIOD":

        $sql = "UPDATE dbo.sp_tor_hdr_period set i_enabled  = 2
                WHERE sp_tor_hdr_period_id = ? ;";
        $arrValue[] = $_REQUEST["id"];
        //        echo $sql; print_r($arrValue); exit();
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "DELETE_SP_TOR_DTL_PERIOD":
        $sql = " UPDATE sp_tor_dtl_period
        SET i_enabled = 2
        WHERE sp_tor_dtl_period_id = ?";
        /* $sql = "DELETE sp_tor_dtl_period
          //         WHERE sp_tor_dtl_period_id = ? ;"; */ //ตัวเก่าจะลบข้อมูลแล้วหายไปเลย ทำให้ผ่านรายการแล้ว ไปทำต่อ ไอดีอาจจะมีหายได้
        $arrValue[] = $_REQUEST["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "DELETE_SP_TOR_HDR_PERIOD":
        $sql = "UPDATE sp_tor_hdr_period
        SET i_enabled = 2
        WHERE sp_tor_hdr_period_id = ? ;";
        /*  $sql = "DELETE sp_tor_hdr_period
          WHERE sp_tor_hdr_period_id = ? ;

          DELETE sp_tor_dtl_period
          WHERE sp_tor_hdr_period_id = ?"; */  //ตัวเก่าจะลบข้อมูลแล้วหายไปเลย ทำให้ผ่านรายการแล้ว ไปทำต่อ ไอดีอาจจะมีหายได้
        $arrValue[] = $_REQUEST["id"];
        $arrValue[] = $_REQUEST["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UP_SP_TOR_DTL_PERIOD":
        $root = "data";
        $data = array();

        $mode = $_REQUEST["mode"];
        $arrParam = array();
        $addField = null;
        $addValue = null;
        $arrValue = array();
        $Arr = json_decode($_REQUEST["data"], true);
        foreach ($Arr as $fldd) {
            $data["sp_tor_id"] = $fldd["sp_tor_id"];
            $data["sp_tor_dtl_id"] = $fldd["sp_tor_dtl_id"];
            $data["sp_tor_hdr_period_id"] = $fldd["sp_tor_hdr_period_id"];
            $data["i_qty"] = $fldd["i_qty"];
            $data["c_name"] = $db->GetDataBySQL('SELECT c_name FROM sp_tor_bidder_dtl a
                                                WHERE (SELECT sp_tor_bidder_dtl_id FROM sp_tor_victory aa WHERE a.sp_tor_bidder_dtl_id = aa.sp_tor_bidder_dtl_id group by sp_tor_bidder_dtl_id) IS NOT NULL
                                                    AND a.sp_tor_id = ?
                                                    AND a.dc_creditor_id = (SELECT dc_creditor_id FROM sp_tor_contract WHERE sp_tor_contract_id = ?)
                                                    AND a.sp_tor_dtl_id  = ?', array($fldd["sp_tor_id"], $fldd["sp_tor_contract_id"], $fldd["sp_tor_dtl_id"]));
            $data["f_net_unit_price"] = $db->GetDataBySQL('SELECT f_unit_price FROM sp_tor_bidder_dtl a
                                                WHERE (SELECT sp_tor_bidder_dtl_id FROM sp_tor_victory aa WHERE a.sp_tor_bidder_dtl_id = aa.sp_tor_bidder_dtl_id group by sp_tor_bidder_dtl_id) IS NOT NULL
                                                    AND a.sp_tor_id = ?
                                                    AND a.dc_creditor_id = (SELECT dc_creditor_id FROM sp_tor_contract WHERE sp_tor_contract_id = ?)
                                                    AND a.sp_tor_dtl_id  = ?', array($fldd["sp_tor_id"], $fldd["sp_tor_contract_id"], $fldd["sp_tor_dtl_id"]));
            $data["f_net_total_price"] = $data["f_net_unit_price"] * $data["i_qty"];
            $data["dc_unit_type_id"] = $db->GetDataBySQL('SELECT dc_unit_type_id FROM sp_tor_bidder_dtl a
                                                WHERE (SELECT sp_tor_bidder_dtl_id FROM sp_tor_victory aa WHERE a.sp_tor_bidder_dtl_id = aa.sp_tor_bidder_dtl_id group by sp_tor_bidder_dtl_id) IS NOT NULL
                                                    AND a.sp_tor_id = ?
                                                    AND a.dc_creditor_id = (SELECT dc_creditor_id FROM sp_tor_contract WHERE sp_tor_contract_id = ?)
                                                    AND a.sp_tor_dtl_id  = ?', array($fldd["sp_tor_id"], $fldd["sp_tor_contract_id"], $fldd["sp_tor_dtl_id"]));

            $data["c_unit"] = $db->GetDataBySQL('SELECT c_unit FROM sp_tor_dtl WHERE  sp_tor_dtl_id = ?', array($fldd["sp_tor_dtl_id"]));
            $data["dc_bg_budget_type_id"] = $db->GetDataBySQL('SELECT dc_bg_budget_type_id FROM sp_tor_dtl WHERE  sp_tor_dtl_id = ?', array($fldd["sp_tor_dtl_id"]));
            $data["po_expense_id"] = $db->GetDataBySQL('SELECT po_expense_id FROM sp_tor_dtl WHERE  sp_tor_dtl_id = ?', array($fldd["sp_tor_dtl_id"]));
            $data["i_hire_type"] = $db->GetDataBySQL('SELECT i_hire_type FROM sp_tor_dtl WHERE  sp_tor_dtl_id = ?', array($fldd["sp_tor_dtl_id"]));
            $data["i_product_type"] = $db->GetDataBySQL('SELECT i_product_type FROM sp_tor_dtl WHERE  sp_tor_dtl_id = ?', array($fldd["sp_tor_dtl_id"]));
            $data["i_is_inv"] = $db->GetDataBySQL('SELECT i_is_inv FROM sp_tor_dtl WHERE  sp_tor_dtl_id = ?', array($fldd["sp_tor_dtl_id"]));
            $data["dc_creditor_id"] = $db->GetDataBySQL('SELECT dc_creditor_id FROM sp_tor_contract WHERE  sp_tor_contract_id = ?', array($fldd["sp_tor_contract_id"]));

            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

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
				INSERT INTO sp_tor_dtl_period (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";

            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
        }
        break;
    case "UP_SP_TOR_DTL_PERIOD_NEW":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["sp_tor_hdr_period_id"] = $_REQUEST["sp_tor_hdr_period_id"];
        $data["dc_bg_budget_type_id"] = $_REQUEST["dc_bg_budget_type_id"];
        $data["po_expense_id"] = $_REQUEST["po_expense_id"];
        $data["i_hire_type"] = $_REQUEST["i_hire_type"];
        if ($_REQUEST["i_hire_type"] == 0) {
            $data["i_product_type"] = null;
            $data["i_is_inv"] = null;
        } else {
            $data["i_product_type"] = $_REQUEST["i_product_type"];
            $data["i_is_inv"] = $_REQUEST["i_is_inv"];
        }

        //i_product_type am_mode_id inv_mode_id
        $data["inv_mode_id"] = $_REQUEST["inv_mode_id"] ?? null;
        $data["am_mode_id"] = $_REQUEST["am_mode_id"] ?? null;
        $data["c_name"] = $_REQUEST["c_name"];
        $data["i_qty"] = $_REQUEST["i_qty"];
        $data["f_net_unit_price"] = str_replace(',', '', $_REQUEST["f_net_unit_price"]);
        $data["f_net_total_price"] = $data["f_net_unit_price"] * $data["i_qty"];
        $data["dc_unit_type_id"] = $_REQUEST["dc_unit_type_id"];
        $data["dc_creditor_id"] = $db->GetDataBySQL('SELECT dc_creditor_id FROM sp_tor_contract WHERE  sp_tor_contract_id = ?', array($_REQUEST["sp_tor_contract_id"]));

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        //        print_r($data);
        //        exit();
        if ($_REQUEST["sp_tor_dtl_period_id"] == null) {

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
                    INSERT INTO sp_tor_dtl_period (" . substr($addField, 1) . ", i_enabled ) VALUES (" . substr($addValue, 1) . ",1);
                    SELECT @@IDENTITY as id;";
            $stmt = $db->QueryParam($sql, $arrValue);
        } else {
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $sql = "UPDATE sp_tor_dtl_period SET " . substr($addField, 1) . " WHERE sp_tor_dtl_period_id = ?";
            $arrValue[] = $_REQUEST["sp_tor_dtl_period_id"];
            $stmt = $db->QueryParam($sql, $arrValue);
        }
        // $ss_id    = $db->Fetch($stmt);
        // $re_id        = $ss_id["id"];

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        break;
    case "LISTTORDTL":

        ###########################################
        $root = "data";
        $data = array();
        $sqlMain = "SELECT * FROM(
                        SELECT
                            a.sp_tor_id
                            ,a.sp_tor_dtl_id
                            ,a.i_qty AS i_qty_all
                            ,(SELECT SUM(i_qty) FROM sp_tor_dtl_period aa WHERE aa.sp_tor_dtl_id = a.sp_tor_dtl_id AND aa.sp_tor_id= a.sp_tor_id) AS i_qty_use
                            ,(SELECT c_name FROM dc_unit_type aa WHERE aa.dc_unit_type_id = a.dc_unit_type_id) AS c_unit
                            ,a.c_name
                            ,a.f_unit_price
                        FROM sp_tor_bidder_dtl a
                        WHERE sp_tor_id = ?
                            AND a.dc_creditor_id = ?
                            AND (SELECT sp_tor_bidder_dtl_id FROM sp_tor_victory aa WHERE a.sp_tor_bidder_dtl_id = aa.sp_tor_bidder_dtl_id group by sp_tor_bidder_dtl_id) IS NOT NULL
                        ) a
                    WHERE ISNULL(a.i_qty_use,0) < ISNULL(a.i_qty_all,0) ";

        $arrValue[] = $_REQUEST['sp_tor_id'];
        $arrValue[] = $_REQUEST['dc_creditor_id'];

        //        echo $sqlMain;
        //        print_r($arrValue);
        //        exit();
        $stmt = $db->QueryParam($sqlMain, $arrValue);
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_tor_dtl_id" => $row["sp_tor_dtl_id"],
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "i_qty" => $row["i_qty_all"] - $row["i_qty_use"],
                "i_qty_all" => $row["i_qty_all"],
                "c_unit" => $row["c_unit"],
                "c_name" => $row["c_name"],
                "f_unit_price" => number_format($row["f_unit_price"], 2),
                "f_total_price" => number_format($row["f_unit_price"] * $row["i_qty_all"], 2),
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "UP_SP_TOR_CONTRACT_NEXT":

        // echo print_r($_REQUEST);exit;
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        $data["c_discription"] = $_REQUEST["c_discription"];
        $data["d_po_date"] = !empty($_REQUEST['d_po_date']) ? $date->bc_to_ad($_REQUEST['d_po_date']) : null;
        /* d_doc_create = 10-11-2568
          d_doc_date = 09-03-2569
          d_start_date = 10-03-2569
          d_due_date = 17-07-2569 */

        $data["d_doc_date"] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        $data["d_start_date"] = !empty($_REQUEST['d_start_date']) ? $date->bc_to_ad($_REQUEST['d_start_date']) : null;
        $data["d_due_date"] = !empty($_REQUEST['d_due_date']) ? $date->bc_to_ad($_REQUEST['d_due_date']) : null;
        //   !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
        $data["c_po_no"] = $_REQUEST["c_po_no"];
        $data["i_delivery"] = $_REQUEST["i_delivery"];
        $data["i_type_fine"] = $_REQUEST["i_type_fine"];
        $data["f_fine"] = str_replace(",", "", $_REQUEST["f_fine"]);
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["i_is_join_venture"] = $_REQUEST["i_is_join_venture"] ?? null;
        //>>>>>>>>>>>>>>>>>>>>>>

        if (@$_REQUEST["i_is_bank_warranty0"] == 1) {
            $data["i_is_warranty"] = null;
            $data["cashiercheque_on"] = null;
            $data["i_is_warranty_book"] = null;
        } else {
            $data["i_is_warranty"] = @$_REQUEST["i_is_bank_warranty"];
            $data["cashiercheque_on"] = @$_REQUEST["i_is_cashiercheque_warrantyID"];
            $data["i_is_warranty_book"] = @$_REQUEST["i_is_bank_warranty1"];
        }

        if (@$_REQUEST["i_is_expense_monthly"] == 1) {
            $data["i_is_monthly"] = @$_REQUEST["i_is_expense_monthly"];
        } else {
            $data["i_is_monthly"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty"] == 1) {
            $data["book_no"] = $_REQUEST["c_books_receipt"];
            $data["book_seq"] = $_REQUEST["c_receipt_no"];
            $data["d_book_date"] = !empty($_REQUEST['d_book_date']) ? $date->bc_to_ad($_REQUEST['d_book_date']) : null;
            $data["f_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt"]);
            $data["c_remark"] = $_REQUEST["c_remark"];
        } else {
            $data["book_no"] = null;
            $data["book_seq"] = null;
            $data["d_book_date"] = null;
            $data["i_is_percen"] = null;
            $data["f_warranty_amt"] = null;
            $data["c_remark"] = null;
        }

        if (@$_REQUEST["i_is_cashiercheque_warranty"] == 1) {
            $data["cashiercheque_on"] = $_REQUEST["c_books_cashiercheque"];
            $data["cashiercheque_seq"] = $_REQUEST["c_receipt_cashiercheque"];
            $data["d_cashiercheque_data"] = !empty($_REQUEST['d_cashiercheque_date']) ? $date->bc_to_ad($_REQUEST['d_cashiercheque_date']) : null;
            $data["f_warranty_cashiercheque"] = str_replace(',', '', $_REQUEST["f_cashiercheque_warranty_amt2"]);
            $data["c_remark_cashiercheque"] = $_REQUEST["c_comment2"];
        } else {
            $data["cashiercheque_on"] = null;
            $data["cashiercheque_seq"] = null;
            $data["d_cashiercheque_data"] = null;
            $data["f_warranty_cashiercheque"] = null;
            $data["c_remark_cashiercheque"] = null;
        }

        if (@$_REQUEST["i_is_bank_warranty1"] == 1) {
            $data["book_warranty_no"] = $_REQUEST["c_doc_no"];
            $data["d_book_warranty_date"] = !empty($_REQUEST['d_doc_date1']) ? $date->bc_to_ad($_REQUEST['d_doc_date1']) : null;
            $data["dc_bank_id"] = $_REQUEST["dc_bank_id"];
            $data["f_book_warranty_amt"] = str_replace(',', '', $_REQUEST["f_warranty_amt1"]);
            $data["d_book_warranty_end"] = !empty($_REQUEST['d_expire_warranty']) ? $date->bc_to_ad($_REQUEST['d_expire_warranty']) : null;
            $data["c_remark1"] = $_REQUEST["c_comment1"];
        } else {
            $data["book_warranty_no"] = null;
            $data["d_book_warranty_date"] = null;
            $data["dc_bank_id"] = null;
            $data["f_book_warranty_amt"] = null;
            $data["d_book_warranty_end"] = null;
            $data["c_remark1"] = null;
        }

        //>>>>>>>>>>>>>>>>>>>>>>
        // if ($_REQUEST["sp_tor_dtl_period_id"] == null) {
        //     $data["dc_user_create_id"]            = $_SESSION["user_id"];
        //     $data["dc_user_create_cost_id"]       = $_SESSION["dc_cost_id"];
        //     $data["d_create"]                     = date("Y-m-d H:i:s");
        //     foreach ($data as $fld => $value) {
        //         $arrValue[] = ($value != "") ? $value : null;
        //         $addField .= ", {$fld}";
        //         $addValue .= ", ?";
        //     }
        //     $sql    = "
        //             SET NOCOUNT ON
        //             INSERT INTO sp_tor_dtl_period (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
        //             SELECT @@IDENTITY as id;";
        //     $stmt = $db->QueryParam($sql, $arrValue);
        // } else {
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }
        $sql = "UPDATE sp_tor_contract SET " . substr($addField, 1) . " "
                . " "
                . " WHERE sp_tor_contract_id = ?"
                . " and not exists (select 1 from sp_tor_hdr_period where sp_tor_contract_id =? and i_enabled=1)";

        $arrValue[] = $_REQUEST["sp_tor_contract_id"];
        $arrValue[] = $_REQUEST["sp_tor_contract_id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        if ($stmt === false) {
            die(print_r(sqlsrv_errors(), true));
        }

        $rows_affected = sqlsrv_rows_affected($stmt);

        if ($rows_affected === -1) {
            $msgTxt = " เกิดข้อผิดพลาดในการดึงจำนวนแถว";
        } elseif ($rows_affected === 0) {
            $msgTxt = " <b>ไม่มีการอัปเดตข้อมูล (เนื่องจากมีรายการทำงวดแล้วถ้าต้องการแก้ไขต้องบลงวดก่อน)</b>";
        } else {
            $msgTxt = " อัปเดตสำเร็จ ทั้งหมด $rows_affected แถว";
        }
//        echo $sql; print_r($arrValue);
//        exit();
        // }
        // $ss_id    = $db->Fetch($stmt);
        // $re_id        = $ss_id["id"];

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        break;

    case "LIST_SP_PO_HDR":

        ###########################################
        $root = "data";
        $data = array();

        $sqlMain = "SELECT * FROM(
                        SELECT
                            sp_po_id
                            ,sp_tor_contract_id
                            ,sp_tor_id
                            ,dc_creditor_id
                            ,c_name
                            ,c_code
                            ,c_doc_ref
                            ,c_discription
                            ,i_is_status
                            ,i_is_po
                            ,convert(varchar, d_due_date , 120) as d_due_date
                            ,f_total_amt
                        FROM sp_po_hdr a
                        WHERE i_is_po = 1 and sp_tor_contract_id = ?
                    )a ";

        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_contract_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_po_id" => $row["sp_po_id"],
                "sp_tor_contract_id" => $row["sp_tor_contract_id"],
                "sp_tor_id" => $row["sp_tor_id"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "c_name" => $row["c_name"],
                "c_code" => $row["c_code"],
                "c_doc_ref" => $row["c_doc_ref"],
                "c_discription" => $row["c_discription"],
                "i_is_status" => $row["i_is_status"],
                "i_is_po" => $row["i_is_po"],
                "d_due_date" => $date->extDateBuddha($row["d_due_date"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "UP_SP_MN_CONTRACT_HDR_AUTO":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        //        if ($_REQUEST["i_is_po"] == 1) {
        //            $data["sp_po_id"] = $_REQUEST["sp_contract_po_id"];
        //            $data["i_type_fine"] = $db->GetDataBySQL(
        //                    'SELECT i_type_fine
        //                    FROM sp_po_hdr a
        //                    INNER JOIN sp_tor_contract b on a.sp_tor_contract_id = b.sp_tor_contract_id
        //                    WHERE  a.sp_po_id = ?
        //                    ',
        //                    array($data["sp_po_id"])
        //            );
        //        } else {  }
        $selectRow = null;
        $data["sp_contract_id"] = $_REQUEST["sp_contract_po_id"];
        $rs = $db->GetDataBySQL('SELECT i_type_fine, sp_tor_id FROM dbo.sp_tor_contract WHERE  sp_tor_contract_id = ?', array($_REQUEST["sp_contract_po_id"]));
        //        $data["sp_tor_id"] = $rc['sp_tor_id'];
        $data["i_type_fine"] = $rs['i_type_fine'];
        $data["c_name"] = $_REQUEST["c_name_in"];
        $data["f_total_amt"] = str_replace(',', '', $_REQUEST["f_total_amt"]);
        $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        $data['d_start_date'] = !empty($_REQUEST['d_start_date']) ? $date->bc_to_ad($_REQUEST['d_start_date']) : null;
        $data['d_end_date'] = !empty($_REQUEST['d_end_date']) ? $date->bc_to_ad($_REQUEST['d_end_date']) : null;
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if (@$_REQUEST['sp_mn_contract_hdr_id'] > 0) { // ****** EDIT ******
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_mn_contract_hdr_id"];
            $sql = "UPDATE sp_mn_contract_hdr SET " . substr($addField, 1) . " WHERE sp_mn_contract_hdr_id = ?";
            $re_id = $_REQUEST["sp_mn_contract_hdr_id"];
            $stmt = $db->QueryParam($sql, $arrValue);
        } else {

            $data["sp_emp_id"] = $_REQUEST["sp_emp_id"];
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
                INSERT INTO sp_mn_contract_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
            $stmt = $db->QueryParam($sql, $arrValue);
            if (@$_REQUEST["show_sql"]) {
                /*                 * ****echo sql***** */
                $sql = (@$sqlMain) ? $sqlMain : $sql;
                $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

                $sql = str_replace('?', '#-#', $sql);
                foreach ($arr as $fld => $value) {
                    $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
                }
                echo $sql;
                exit;
                /*                 * ***************** */
            }
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
        }


        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $db->CommitTran();
        $re = array(
            "reval" => 0,
            "success" => "Success",
            "msg" => "บันทึกเรียบร้อยแล้ว",
            "id" => $re_id,
            "sp_tor_id" => $rs["sp_tor_id"],
            "sp_contract_po_id" => $_REQUEST["sp_contract_po_id"],
            "i_is_po" => 0
        );
        echo json_encode($re);
        exit;
        break;
    case "UP_SP_PO":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        // $data["c_code"] = $_REQUEST["c_code"];
        // $data["c_doc_ref"] = $_REQUEST["c_doc_ref"];
        $data["c_name"] = $_REQUEST["c_name"];

        $data["d_due_date"] = !empty($_REQUEST["d_due_date"]) ? $date->bc_to_ad($_REQUEST["d_due_date"]) : null;
        $data["f_total_amt"] = str_replace(",", "", $_REQUEST["f_total_amt"]);
        $data["i_is_po"] = 1;

        $data["c_discription"] = $_REQUEST["c_discription"];
        //$data["i_is_status"]				    = $_REQUEST["c_name"];

        $data["dc_creditor_id"] = $db->GetDataBySQL('SELECT dc_creditor_id FROM sp_tor_contract WHERE  sp_tor_contract_id = ?', array($_REQUEST["sp_tor_contract_id"]));
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if ($_REQUEST['sp_po_id'] == null) {  // ****** ADD ******
            $data["dc_cost_id"] = $db->GetDataBySQL('SELECT dc_cost_id FROM sp_tor WHERE tor_id = ?', array($_REQUEST["sp_tor_id"]));
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
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
                INSERT INTO sp_po_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
            $stmt = $db->QueryParam($sql, $arrValue);
        } else if ($_REQUEST['sp_po_id'] > 0) { // ****** EDIT ******
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_po_id"];
            $sql = "UPDATE sp_po_hdr SET " . substr($addField, 1) . " WHERE sp_po_id = ?";

            $stmt = $db->QueryParam($sql, $arrValue);
        }

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        break;
    case "UP_SP_MN_CONTRACT_HDR":
        $root = "data";
        $data = array();
        $msg = "";
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        //        if ($_REQUEST["i_is_po"] == 1) {
        //            $data["sp_po_id"] = $_REQUEST["sp_contract_po_id"];
        //            $data["i_type_fine"] = $db->GetDataBySQL(
        //                    'SELECT i_type_fine
        //                    FROM sp_po_hdr a
        //                    INNER JOIN sp_tor_contract b on a.sp_tor_contract_id = b.sp_tor_contract_id
        //                    WHERE  a.sp_po_id = ?
        //                    ',
        //                    array($data["sp_po_id"])
        //            );
        //        } else {  }
        $selectRow = null;
        $data["sp_contract_id"] = $_REQUEST["sp_contract_po_id"];
        $rs = $db->GetDataBySQL('SELECT i_type_fine, sp_tor_id FROM dbo.sp_tor_contract WHERE  sp_tor_contract_id = ?', array($_REQUEST["sp_contract_po_id"]));
        //        $data["sp_tor_id"] = $rc['sp_tor_id'];
        $data["i_type_fine"] = $rs['i_type_fine'];
        $data["c_name"] = $_REQUEST["c_name_in"];
        $data["f_total_amt"] = str_replace(',', '', $_REQUEST["f_total_amt"]);
        $data['d_doc_date'] = !empty($_REQUEST['d_doc_date']) ? $date->bc_to_ad($_REQUEST['d_doc_date']) : null;
        $data['d_start_date'] = !empty($_REQUEST['d_start_date']) ? $date->bc_to_ad($_REQUEST['d_start_date']) : null;
        $data['d_end_date'] = !empty($_REQUEST['d_end_date']) ? $date->bc_to_ad($_REQUEST['d_end_date']) : null;
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if (@$_REQUEST['sp_mn_contract_hdr_id'] > 0) { // ****** EDIT ******
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_mn_contract_hdr_id"];
            $sql = "UPDATE sp_mn_contract_hdr SET " . substr($addField, 1) . " WHERE sp_mn_contract_hdr_id = ?";
            $re_id = $_REQUEST["sp_mn_contract_hdr_id"];
            $stmt = $db->QueryParam($sql, $arrValue);
        } else {
            // ();

            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];
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
                INSERT INTO sp_mn_contract_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
        }


        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $db->CommitTran();
        $re = array(
            "reval" => 0,
            "success" => "Success",
            "msg" => "บันทึกเรียบร้อยแล้ว",
            "id" => $re_id,
            "sp_tor_id" => $rs["sp_tor_id"],
            "sp_contract_po_id" => $_REQUEST["sp_contract_po_id"],
            "i_is_po" => 0
        );
        echo json_encode($re);
        exit;
        break;
    case "LIST_CONTRACTANDPO":
        $mode = @$_REQUEST["type"] ?? null;
        $filter = @$_REQUEST["filter"] ?? null;
        $value = @$_REQUEST["value"] ?? null;
        $i_read = @$_REQUEST["i_read"] ?? null;
        ###################
        $root = "data";
        $data = array();
        ###################
        $limit = @$_REQUEST["limit"] ?? null;
        $dir = @$_REQUEST["dir"] ?? null;
        $sort = @$_REQUEST["sort"] ?? null;
        $start = @$_REQUEST["start"] ?? null;

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
        $i_level = $_SESSION['i_level'];
        $dc_department = $_SESSION['dc_department_id'];
        $sp_emp_id = $_SESSION['sp_emp_id'];
        // print_r($_SESSION);
        // exit;
        $where = ' ';
        // if($i_level == 1 ) {
        //     $where = ' ';
        // } else if ( $i_level == 2 ) {
        //     $where = ' and bbb.dc_department_id = ' .$dc_department    ;
        // } else if ( $i_level  == 3  ) {
        //     $where = ' and bbb.sp_emp_id = ' .$sp_emp_id    ;
        // }
        $ses = ($_SESSION['user_id'] == 1) ? "" : " and bbb.dc_department_id = " . $_SESSION['dc_department_id'];

        $keyin = "";
        $arrParam = array();
        $arrCountParam = array();
        $sqlTempTable = " SELECT a.*
                            , ROW_NUMBER() OVER (ORDER BY id DESC) AS row
                        FROM (
                            SELECT
                                sp_tor_contract_id AS id
                                , c_doc_ref
                                , aa.c_code
                                , aa.c_name
								, (select c_name from " . DB_NMU_EIS . "bg_expense where bg_expense_id = bb.po_expense_id  ) po_expense_name
                                , bb.po_expense_id
                                , sp_tor_contract_id
                                , null AS sp_po_id
                                , i_is_po
                                , aa.d_due_date
                                , aa.d_doc_date
                                , dc_creditor_id
                                , aa.i_enabled
                                , bb.sp_emp_id
                            FROM sp_tor_contract  aa
                            inner join  sp_tor bb on aa.sp_tor_id = bb.tor_id
                            INNER JOIN dbo.sp_emp bbb on bbb.sp_emp_id = bb.sp_emp_id {$ses}
                            WHERE i_contract_status = 2   and aa.i_enabled = 1 {$where}
                           ) a
                        INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id
                        LEFT JOIN sp_mn_contract_hdr c ON c.sp_contract_id = a.sp_tor_contract_id

                        WHERE sp_mn_contract_hdr_id IS NULL      ";
        if ($mode == "SEARCH") {
            if ($filter && $filter !== "") {
                if ($filter === "c_code")
                    $sqlTempTable .= " and a.c_code like ?";
                if ($filter === "c_name")
                    $sqlTempTable .= " and a.c_name like ?";
                if ($filter === "dc_creditor_name")
                    $sqlTempTable .= " and b.c_name like ?";

                $arrParam[] = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            }
        }

        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = " SELECT
          a.*
          , (SELECT TOP 1 c_name FROM NMU.dbo.dc_creditor aa WHERE a.dc_creditor_id = aa.dc_creditor_id) AS dc_creditor_name
          , (SELECT TOP 1 c_name FROM dc_cost aa WHERE aa.dc_cost_id = b.dc_cost_id)  AS dc_cost_name
          FROM (
          SELECT row ,a.id
                    ,a.i_is_po
                    ,a.sp_tor_contract_id
                    ,a.sp_po_id
                    ,a.po_expense_id
                    ,a.po_expense_name
                    ,b.sp_tor_id AS sp_tor_id
                    ,isnull((SELECT TOP 1 i_type_contract FROM sp_tor WHERE tor_id  = b.sp_tor_id),0) as i_type_contract
                    , b.dc_creditor_id AS dc_creditor_id
                    , b.f_total_amt AS f_total_amt
                    , b.c_doc_ref AS c_doc_ref
                    , CONVERT(VARCHAR,b.d_due_date , 120) AS d_due_date
                    , CONVERT(VARCHAR, b.d_doc_date , 120) AS d_doc_date
                    , CONVERT(VARCHAR, b.d_start_date , 120) AS d_start_date
                    , b.c_name AS c_name
                    , b.c_code  AS c_code
                    , a.sp_emp_id
                    , (select c_name from sp_emp where sp_emp_id = b.sp_emp_id ) as sp_emp_name
                    , (select c_name from sp_department where dc_department_id   =   (select dc_department_id from sp_emp where sp_emp_id = b.sp_emp_id ) )   as dc_department
                    , a.i_enabled
          FROM ({$sqlTempTable}) a
          LEFT JOIN sp_tor_contract b ON a.sp_tor_contract_id = b.sp_tor_contract_id
          LEFT JOIN sp_po_hdr c ON a.sp_po_id = c.sp_po_id
          ) a
          INNER JOIN sp_tor b ON b.tor_id = a.sp_tor_id
          WHERE a.row > ? AND a.row <= ?  and a.i_enabled = 1   ";
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        $arrCon = array(0 => "ยังไม่ระบุ", 1 => "สัญญา", 2 => "ใบสั่ง", 3 => "จะซื้อจะขาย");
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => $row["id"],
                "sp_contract_po_id" => $row["id"],
                "i_is_po" => $row["i_is_po"],
                "po_expense_id" => $row["po_expense_id"],
                "po_expense_name" => $row["po_expense_name"],
                //"i_type_po" => $row["i_is_po"] == 1 ? '(PO) สัญญาย่อย' : "สัญญาปกติ",
                "i_type_po" => $arrCon[$row['i_type_contract']], //$row["i_type_contract"],
                "sp_tor_contract_id" => $row["sp_tor_contract_id"],
                "sp_po_id" => $row["sp_po_id"],
                "sp_emp_id" => $row["sp_emp_id"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "c_name" => $row["c_name"],
                "c_code" => $row["c_code"],
                "c_doc_ref" => $row["c_doc_ref"],
                "d_create" => $date->extDateBuddha(date("Y-m-d")),
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "d_start_date" => $date->extDateBuddha($row["d_start_date"]),
                "d_due_date" => $date->extDateBuddha($row["d_due_date"]),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "dc_cost_name" => $row["dc_cost_name"],
                "sp_emp_name" => $row["sp_emp_name"],
                "dc_department" => $row["dc_department"],
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        // echo ($sqlCount);
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
    case "LIST_PERIOD_IN_SPMNCONTRACT":
        #########################
        $root = "data";
        $data = array();
        $con = '';
        $i_is_po ?? $_REQUEST['i_is_po'] ?? 0;
        if ($i_is_po == 0) {
            $con = " AND a.sp_tor_contract_id= {$_REQUEST['sp_contract_po_id']}";
        } else {
            $con = "AND a.sp_po_id= {$_REQUEST['sp_contract_po_id']}";
        }
        $sqlMain = "SELECT a.*
                        ,b.sp_mn_contract_dtl_id
                        ,isnull(b.c_arrive_code,'') as c_arrive_code
                        ,b.i_status_checking
                        ,CASE
                            WHEN b.sp_mn_contract_dtl_id IS NULL THEN 1
                            WHEN b.i_status_checking = 1 THEN 3
                            WHEN b.i_status_checking IS NULL THEN 2
                            WHEN b.i_status_checking = 2 THEN 1
                        END AS sort
                        ,CASE
                            WHEN b.sp_mn_contract_dtl_id IS NULL THEN '*(รอส่งมอบ)'
                            WHEN b.i_status_checking = 1 THEN '(ตรวจรับสำเร็จ)'
                            WHEN b.i_status_checking IS NULL THEN '(รอตรวจรับ)'
                            WHEN b.i_status_checking = 2 THEN '*(ตรวจรับไม่สำเร็จ)'
                        END AS i_status_checking_name
                        ,CONVERT(VARCHAR,b.d_arrive_date, 120) AS d_arrive_date
                    FROM (
                        SELECT a.sp_tor_hdr_period_id
                            , a.sp_tor_contract_id
                            , b.sp_tor_id
                            ,CASE
                                WHEN ISNULL(a.sp_po_id,0) = 0 THEN b.c_doc_ref
                                ELSE c.c_doc_ref
                            END AS c_doc_ref_contract
                            ,CASE
                                WHEN ISNULL(a.sp_po_id,0) = 0 THEN b.dc_creditor_id
                                ELSE c.dc_creditor_id
                            END AS dc_creditor_id
                            ,CASE
                                WHEN ISNULL(a.sp_po_id,0) = 0 THEN (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id )
                                ELSE (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = c.dc_creditor_id )
                            END AS dc_creditor_name
                            , a.sp_po_id
                            , CONVERT(VARCHAR,a.d_doc_date, 120) AS d_doc_date
                            , a.i_day
                            , a.i_alert
                            , a.i_is_status
                            , a.i_period
                            , a.f_total_amtc
                            , a.i_is_last
                            , a.c_discription
                            -- , (SELECT SUM(f_net_total_price) FROM dbo.sp_tor_dtl_period WHERE sp_tor_hdr_period_id=a.sp_tor_hdr_period_id) AS f_total_amt
                            , CONVERT(VARCHAR, d_period_date, 120) AS d_period_date
                            -- , a.c_name
                        FROM dbo.sp_tor_hdr_period a
                        LEFT JOIN sp_tor_contract b ON b.sp_tor_contract_id = a.sp_tor_contract_id
                        LEFT JOIN sp_po_hdr c ON a.sp_po_id = c.sp_po_id
                        WHERE 1=1  {$con}
                    )a
                    LEFT JOIN sp_mn_contract_dtl b ON a.sp_tor_hdr_period_id  = b.sp_tor_hdr_period_id
                    AND b.sp_mn_contract_dtl_id =
                            CASE
                                WHEN (SELECT COUNT(sp_mn_contract_dtl_id) FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 1) > 0
                                    THEN (SELECT TOP 1 sp_mn_contract_dtl_id FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 1)
                                WHEN (SELECT COUNT(sp_mn_contract_dtl_id) FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking IS NULL) > 0
                                    THEN (SELECT TOP 1 sp_mn_contract_dtl_id FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking IS NULL)
                                WHEN (SELECT COUNT(sp_mn_contract_dtl_id) FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 2) > 0
                                    THEN (SELECT TOP 1 sp_mn_contract_dtl_id FROM sp_mn_contract_dtl aa WHERE a.sp_tor_hdr_period_id = aa.sp_tor_hdr_period_id AND aa.i_status_checking = 2 ORDER BY d_arrive_date desc)
                            END
                    ORDER BY sort";
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_contract_po_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "i_status_checking" => $row["i_status_checking"],
                "i_status_checking_name" => $row["i_status_checking_name"],
                "sp_mn_contract_dtl_id" => $row["sp_mn_contract_dtl_id"],
                "CheckColumn" => ($row["sort"] == 1) ? false : true,
                "c_arrive_code" => $row["c_arrive_code"],
                "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "c_doc_ref_contract" => $row["c_doc_ref_contract"],
                "sp_po_id" => intval($row["sp_po_id"]),
                "i_period" => intval($row["i_period"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "i_is_status" => $row["i_is_status"],
                // "d_period_date"				=> ((empty($row["d_period_date"])) ? "" : $date->extDateBuddha($row["d_period_date"])), //d_tor_date  ,
                "d_period_date" => $date->extDateBuddha($row["d_period_date"]),
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "i_day" => $row["i_day"],
                "i_alert" => $row["i_alert"],
                "i_is_last" => $row["i_is_last"],
                "c_discription" => $row["c_discription"]
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "LIST_SP_MN_CONTRACT_HDR":
        $mode = @$_REQUEST["mode"];
        $filter = @$_REQUEST["filter"];
        $value = @$_REQUEST["value"];
        $i_read = @$_REQUEST["i_read"];
        ###################
        $root = "data";
        $data = array();
        ###################
        $limit = @$_REQUEST["limit"];
        $dir = @$_REQUEST["dir"];
        $sort = @$_REQUEST["sort"];
        $start = @$_REQUEST["start"];

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
        $act = $_REQUEST['act'] ?? null;
        $view = $_REQUEST['view'] ?? null;
        if ($act == 'SEARCH' && $view == 1) {
            $ses = ($_SESSION['user_id'] == 1) ? "" : " and bb.sp_emp_id = " . $_SESSION['sp_emp_id'];
            $wh = ($_REQUEST['c_code'] != "") ? " and aaa.c_code LIKE '%" . $_REQUEST['c_code'] . "%'" : "";
        } else if ($act == 'SEARCH' && $view == 0) {
            $ses = ($_SESSION['user_id'] == 1) ? "" : " and bb.dc_department_id = " . $_SESSION['dc_department_id'];
            $wh = ($_REQUEST['c_code'] != "") ? " and aaa.c_code LIKE '%" . $_REQUEST['c_code'] . "%'" : "";
        } else {
            $ses = ($_SESSION['user_id'] == 1) ? "" : " and bb.dc_department_id = " . $_SESSION['dc_department_id'];
            $wh = "";
        }
        // }
        // $wh = "";
        // $wh .= "";

        $sqlTempTable = "SELECT aa.sp_mn_contract_hdr_id
                            , aa.sp_contract_id
                            , aa.sp_po_id
                            , aa.sp_emp_id
                            , aaa.c_code
                            , bb.dc_department_id
                            , aa.d_arrive_date AS contract_hdr_date
                            , ROW_NUMBER() OVER (ORDER BY aa.d_create DESC) AS row
                        FROM dbo.sp_mn_contract_hdr aa
                        inner join dbo.sp_emp bb on bb.sp_emp_id = aa.sp_emp_id
                        inner join dbo.sp_tor_contract aaa on aaa.sp_tor_contract_id = aa.sp_contract_id
                        where aa.i_status_checking is null
                        --and aa.i_enabled = 1
                        {$ses} {$wh} "; //
        //        echo  $sqlTempTable; exit;
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "SELECT a.*,b.sp_tor_id
                        ,CASE
                            WHEN ISNULL(s.sp_po_id,0) = 0 THEN a.sp_contract_id
                            WHEN ISNULL(s.sp_contract_id,0) = 0 THEN a.sp_po_id
                        END AS sp_contract_po_id
                        ,s.c_name
                        ,(select c_name from " . DB_NMU_EIS . "bg_expense where bg_expense_id = c.po_expense_id  ) po_expense_name
                        , c.po_expense_id
                        ,s.i_type_fine
                        ,c.i_type_bg
                        ,s.c_arrive_code
                        ,s.c_checking_code
                        ,s.f_total_amt
                        ,CONVERT(VARCHAR, s.d_arrive_date, 120) AS d_arrive_date
                        ,CONVERT(VARCHAR, s.d_start_date, 120) AS d_start_date_mn
                        ,CONVERT(VARCHAR, b.d_start_date, 120) AS d_start_date
                        ,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
                        ,CONVERT(VARCHAR, b.d_due_date, 120) AS d_end_date
                        , b.c_code AS c_code
                        , b.c_name  AS sp_contract_po_name
                        ,(SELECT inv_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id ) AS dc_creditor_name
                        ,CASE
                            WHEN ISNULL(s.sp_po_id,0) = 0 THEN 0
                            WHEN ISNULL(s.sp_contract_id,0) = 0 THEN 1
                        END AS i_is_po

                        ,CASE
                            WHEN ISNULL(s.sp_po_id,0) = 0 THEN (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = (SELECT dc_cost_id FROM sp_tor_contract WHERE sp_tor_contract_id = s.sp_contract_id))
                            WHEN ISNULL(s.sp_contract_id,0) = 0 THEN (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = (SELECT dc_cost_id FROM sp_po_hdr WHERE sp_po_id = s.sp_po_id))
                        END AS dc_cost_name
                        , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                        , (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                        , CONVERT(VARCHAR, s.d_create, 120) AS d_create
                        , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                        , (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                        , CONVERT(VARCHAR, s.d_update, 120) AS d_update
                        , (SELECT TOP 1 i_purchase FROM dbo.sp_tor WHERE tor_id=b.sp_tor_id) AS i_purchase
                        , (SELECT TOP 1 i_type_contract FROM dbo.sp_tor WHERE tor_id=b.sp_tor_id) AS i_type_contract
                    FROM ({$sqlTempTable}) a
                    INNER JOIN sp_mn_contract_hdr s ON a.sp_mn_contract_hdr_id = s.sp_mn_contract_hdr_id
                    INNER JOIN sp_tor_contract b ON a.sp_contract_id = b.sp_tor_contract_id
                    inner join sp_tor c on b.sp_tor_id = c.tor_id
                    WHERE row > ? AND row <= ?
                    ORDER BY row";
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
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_tor_id" => $row["sp_tor_id"],
                "sp_mn_contract_hdr_id" => $row["sp_mn_contract_hdr_id"],
                "sp_contract_po_id" => $row["sp_contract_po_id"],
                "sp_contract_id" => $row["sp_contract_id"] == '' ?? 0,
                "sp_po_id" => $row["sp_po_id"] == '' ?? 0,
                "i_type_bg" => $row["i_type_bg"],
                "i_is_po" => $row["i_is_po"],
                "i_purchase" => $row["i_purchase"],
                "po_expense_name" => $row["po_expense_name"],
                "po_expense_id" => $row["po_expense_id"],
                "i_type_contract" => $row["i_type_contract"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "txtsp_contractID" => $row["c_code"] . ' ' . $row["sp_contract_po_name"],
                "c_name_in" => $row["c_name"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_doc_ref" => $row["c_code"],
                "i_type_fine" => $row["i_type_fine"],
                "c_arrive_code" => $row["c_arrive_code"],
                "c_checking_code" => $row["c_checking_code"],
                "dc_cost_name" => $row["dc_cost_name"],
                "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                "d_doc_date" => $row["d_doc_date"] == '' ? '' : $date->extDateBuddha($row["d_doc_date"]),
                "d_start_date" => $row["d_start_date"] == '' ? '' : $date->extDateBuddha($row["d_start_date"]),
                "d_start_date_mn" => $row["d_start_date_mn"] == '' ? '' : $date->extDateBuddha($row["d_start_date_mn"]),
                "d_end_date" => $row["d_end_date"] == '' ? '' : $date->extDateBuddha($row["d_end_date"]),
                "dc_user_create_id" => $row["c_create_name"],
                "dc_user_create_cost_id" => $row["c_cost_creat_name"],
                "d_create" => $date->extDateBuddha($row["d_create"]),
                "dc_user_update_id" => $row["c_update_name"],
                "dc_user_update_cost_id" => $row["c_cost_update_name"],
                "d_update" => $date->extDateBuddha($row["d_update"]),
            );

            ${$root}[] = $temp;
        }
        $sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
    case "UP_STATUS_HDR_PERIOD":
        // echo $_SESSION["sp_emp_id"]; exit;
        $root = "data";
        $data = array();

        $mode = $_REQUEST["mode"];
        $arrParam = array();
        $addField = null;
        $addValue = null;
        $arrValue = array();
        $Arr = json_decode($_REQUEST["data"], true);
        foreach ($Arr as $fldd) {

            $data["sp_mn_contract_hdr_id"] = $fldd["sp_mn_contract_hdr_id"];
            $data["sp_tor_hdr_period_id"] = $fldd["id"];
            $data["c_arrive_code"] = $fldd["c_arrive_code"];
            $data["d_arrive_date"] = $fldd['d_arrive_date'];
            $data["sp_emp_id"] = $_SESSION["sp_emp_id"];

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }

            $sql = "
                SET NOCOUNT ON
                INSERT INTO sp_mn_contract_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                ";
            $sql .= "UPDATE sp_tor_hdr_period SET i_is_status = 1 WHERE sp_tor_hdr_period_id = {$fldd["id"]}";
            echo $sql . ' /*';
            print_r($arrValue);
            echo '*/';
            exit;
            $stmt = $db->QueryParam($sql, $arrValue);

            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
        }
        break;
    case "LIST_SP_MN_CONTRACT_HDR_NEXT":
        $mode = @$_REQUEST["mode"];
        $filter = @$_REQUEST["filter"];
        $value = @$_REQUEST["value"];
        $i_read = @$_REQUEST["i_read"];
        ###################
        $root = "data";
        $data = array();
        ###################
        $limit = @$_REQUEST["limit"];
        $dir = @$_REQUEST["dir"];
        $sort = @$_REQUEST["sort"];
        $start = @$_REQUEST["start"];

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
        $arrParam = array();
        $arrCountParam = array();
        $sqlTempTable = "SELECT a.sp_mn_contract_hdr_id
                            ,sp_contract_id
                            ,sp_po_id
                            ,a.d_arrive_date AS contract_hdr_date
                            , ROW_NUMBER() OVER (ORDER BY a.d_arrive_date DESC) AS row
                        FROM dbo.sp_mn_contract_hdr a
                        INNER JOIN sp_mn_contract_dtl b ON a.sp_mn_contract_hdr_id = b.sp_mn_contract_hdr_id
                        GROUP BY a.sp_mn_contract_hdr_id,sp_contract_id,sp_po_id,a.d_arrive_date "; //
        //echo  $sqlTempTable; exit;
        $arrParam[] = $start;
        $arrParam[] = $limit;
        $sqlMain = "SELECT a.*
                    ,CASE
                        WHEN ISNULL(s.sp_po_id,0) = 0 THEN a.sp_contract_id
                        WHEN ISNULL(s.sp_contract_id,0) = 0 THEN a.sp_po_id
                    END AS sp_contract_po_id
                        ,s.c_name
                        ,s.i_type_fine
                        ,s.c_arrive_code
                        ,s.c_checking_code
                        ,CONVERT(VARCHAR, s.d_arrive_date, 120) AS d_arrive_date
                        ,CONVERT(VARCHAR, s.d_doc_date, 120) AS d_doc_date
                        ,CONVERT(VARCHAR, s.d_start_date, 120) AS d_start_date
                        ,CONVERT(VARCHAR, s.d_end_date, 120) AS d_end_date
                        ,CASE
                            WHEN ISNULL(s.sp_po_id,0) = 0 THEN b.c_doc_ref
                            WHEN ISNULL(s.sp_contract_id,0) = 0 THEN c.c_doc_ref
                        END AS c_doc_ref
                        ,CASE
                            WHEN ISNULL(s.sp_po_id,0) = 0 THEN b.c_name
                            WHEN ISNULL(s.sp_contract_id,0) = 0 THEN c.c_name
                        END AS sp_contract_po_name
                        ,CASE
                            WHEN ISNULL(s.sp_po_id,0) = 0 THEN (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id )
                            WHEN ISNULL(s.sp_contract_id,0) = 0 THEN (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = c.dc_creditor_id )
                        END AS dc_creditor_name
                        ,CASE
                            WHEN ISNULL(s.sp_po_id,0) = 0 THEN 0
                            WHEN ISNULL(s.sp_contract_id,0) = 0 THEN 1
                        END AS i_is_po
                        , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_create_id) AS c_create_name
                        , (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id=s.dc_user_create_cost_id) AS c_cost_creat_name
                        , CONVERT(VARCHAR, d_create, 120) AS d_create
                        , (SELECT TOP 1 c_full_name FROM dbo.dc_user WHERE dc_user_id=s.dc_user_update_id) AS c_update_name
                        , (SELECT TOP 1 c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id=s.dc_user_update_cost_id) AS c_cost_update_name
                        , CONVERT(VARCHAR, d_update, 120) AS d_update
                    FROM ({$sqlTempTable}) a
                    INNER JOIN sp_mn_contract_hdr s ON a.sp_mn_contract_hdr_id = s.sp_mn_contract_hdr_id
                    LEFT JOIN sp_tor_contract b ON a.sp_contract_id = b.sp_tor_contract_id
                    LEFT JOIN sp_po_hdr c ON a.sp_po_id = c.sp_po_id
                    WHERE row > ? AND row <=?";
        // echo $sqlMain .' /*'; print_r($arrParam); echo '*/'; exit;
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "sp_mn_contract_hdr_id" => $row["sp_mn_contract_hdr_id"],
                "sp_contract_po_id" => $row["sp_contract_po_id"],
                "sp_mn_contract_hdr_id" => $row["sp_mn_contract_hdr_id"],
                "sp_contract_id" => $row["sp_contract_id"] == '' ?? 0,
                "sp_po_id" => $row["sp_po_id"] == '' ?? 0,
                "i_is_po" => $row["i_is_po"],
                "txtsp_contractID" => $row["c_doc_ref"] . ' ' . $row["sp_contract_po_name"],
                "c_name_in" => $row["c_name"],
                "dc_creditor_name" => $row["dc_creditor_name"],
                "c_doc_ref" => $row["c_doc_ref"],
                "i_type_fine" => $row["i_type_fine"],
                "c_arrive_code" => $row["c_arrive_code"],
                "c_checking_code" => $row["c_checking_code"],
                "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                "d_doc_date" => $row["d_doc_date"] == '' ? '' : $date->extDateBuddha($row["d_doc_date"]),
                "d_start_date" => $row["d_start_date"] == '' ? '' : $date->extDateBuddha($row["d_start_date"]),
                "d_end_date" => $row["d_end_date"] == '' ? '' : $date->extDateBuddha($row["d_end_date"]),
            );

            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
        exit;
        break;
    case "LIST_PERIOD_IN_SPMNCONTRACT_NEXT":
        ###########################################
        $root = "data";
        $data = array();
        $con = '';
        if (@$_REQUEST['i_is_po'] == 0) {
            $con = " and a.sp_tor_contract_id = {$_REQUEST['sp_contract_po_id']}";
        } else {
            $con = " and a.sp_po_id = {$_REQUEST['sp_contract_po_id']}";
        }
        $sqlMain = "SELECT a.*
                        ,b.sp_mn_contract_dtl_id
                        ,b.c_arrive_code
                        ,CONVERT(VARCHAR,b.d_arrive_date, 120) AS d_arrive_date
                    FROM (
                        SELECT a.sp_tor_hdr_period_id
                            , a.sp_tor_contract_id
                            ,CASE
                                WHEN ISNULL(a.sp_po_id,0) = 0 THEN b.c_doc_ref
                                ELSE c.c_doc_ref
                            END AS c_doc_ref_contract
                            ,CASE
                                WHEN ISNULL(a.sp_po_id,0) = 0 THEN b.dc_creditor_id
                                ELSE c.dc_creditor_id
                            END AS dc_creditor_id
                            ,CASE
                                WHEN ISNULL(a.sp_po_id,0) = 0 THEN (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = b.dc_creditor_id )
                                ELSE (SELECT c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = c.dc_creditor_id )
                            END AS dc_creditor_name
                            , a.sp_po_id
                            , CONVERT(VARCHAR,a.d_doc_date, 120) AS d_doc_date
                            , a.i_day
                            , a.i_alert
                            , a.i_is_status
                            , a.i_period
                            , a.f_total_amt
                            , a.i_is_last
                            , a.c_discription
                            -- , (SELECT SUM(f_net_total_price) FROM dbo.sp_tor_dtl_period WHERE sp_tor_hdr_period_id=a.sp_tor_hdr_period_id) AS f_total_amt
                            , CONVERT(VARCHAR, d_period_date, 120) AS d_period_date
                            -- , a.c_name
                        FROM dbo.sp_tor_hdr_period a
                        LEFT JOIN sp_tor_contract b ON b.sp_tor_contract_id = a.sp_tor_contract_id
                        LEFT JOIN sp_po_hdr c ON a.sp_po_id = c.sp_po_id
                        WHERE 1=1 AND a.i_is_status > 0 {$con}
                    )a
                    LEFT JOIN sp_mn_contract_dtl b ON a.sp_tor_hdr_period_id  = b.sp_tor_hdr_period_id";
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_contract_po_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no" => $i++,
                "id" => intval($row["sp_tor_hdr_period_id"]),
                "sp_mn_contract_dtl_id" => $row["sp_mn_contract_dtl_id"],
                "CheckColumn" => ($row["sp_mn_contract_dtl_id"] == '') ? false : true,
                "c_arrive_code" => $row["c_arrive_code"],
                "d_arrive_date" => $row["d_arrive_date"] == '' ? '' : $date->extDateBuddha($row["d_arrive_date"]),
                "dc_creditor_name" => $row["dc_creditor_name"],
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "c_doc_ref_contract" => $row["c_doc_ref_contract"],
                "sp_po_id" => intval($row["sp_po_id"]),
                "i_period" => intval($row["i_period"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "i_is_status" => $row["i_is_status"],
                // "d_period_date"				=> ((empty($row["d_period_date"])) ? "" : $date->extDateBuddha($row["d_period_date"])), //d_tor_date  ,
                "d_period_date" => $date->extDateBuddha($row["d_period_date"]),
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "i_day" => $row["i_day"],
                "i_alert" => $row["i_alert"],
                "i_is_last" => $row["i_is_last"],
                "c_discription" => $row["c_discription"]
            );
            ${$root}[] = $temp;
        }

        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
    case "DC_EXPENSE_BUDGET_IN_TOR":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "
                DECLARE  @dc_expense_budget_type_id INT
                DECLARE  @sp_tor_contract_id INT
                   SET @dc_expense_budget_type_id = ?
                   SET @sp_tor_contract_id = ?

                   SELECT
                       a.dc_expense_budget_type_id
                       ,(SELECT c_name FROM dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS c_dc_expense_budget_type
                       ,isnull(f_type_amt,0) - isnull(b.f_month_total_use,0) as f_type_amt
                   FROM (
                       SELECT
                           dc_expense_budget_type_id
                           ,f_type_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type2_id
                           ,f_type2_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type3_id
                           ,f_type3_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type4_id
                           ,f_type4_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                       UNION all
                       SELECT
                           dc_expense_budget_type5_id
                           ,f_type5_amt
                       FROM sp_tor
                       WHERE tor_id = @dc_expense_budget_type_id
                   )a
                   left join (
                       select
                           dc_expense_budget_type_id ,
                           sum(f_dr) as f_month_total_use
                       from sp_gl_monthly_hdr bb1
                       inner join sp_gl_monthly_dtl bb2 on bb1.sp_gl_monthly_hdr_id = bb2.sp_gl_monthly_hdr_id
                       where bb1.sp_tor_id = @dc_expense_budget_type_id and bb1.sp_tor_contract_id != @sp_tor_contract_id and bb2.dc_expense_budget_type_id is not null
                       group by dc_expense_budget_type_id
                   ) b on a.dc_expense_budget_type_id =b.dc_expense_budget_type_id
                   where a.dc_expense_budget_type_id IS NOT NULL AND a.dc_expense_budget_type_id > 0";

        $arrParam = array($_REQUEST["sp_tor_id"], $_REQUEST["sp_tor_contract_id"]);

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {

            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "id" => "{$row["dc_expense_budget_type_id"]}",
                    "c_name" => "{$row["c_dc_expense_budget_type"]}",
                    "f_total" => "{$row["f_type_amt"]}"
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
    case "NMU_gl_sp_hdr_tor":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "
            select
            a.gl_sp_bg_hdr_id,a.bg_expense_id,a.gl_sp_dc_hdr_id,po_expense_id
            ,a.dc_acc_id
            ,a.* from sp_gl_monthly_dtl  a
            inner join sp_gl_monthly_hdr b on a.sp_gl_monthly_hdr_id  = b.sp_gl_monthly_hdr_id
            inner join sp_tor_contract c on  c.sp_tor_contract_id  =b.sp_tor_contract_id
            where b.sp_tor_id = ?   and  b.sp_tor_contract_id  = ?
            ";

        $arrParam = array($_REQUEST["sp_tor_id"], $_REQUEST["sp_tor_contract_id"]);

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {

            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "id" => $row["gl_sp_bg_hdr_id"],
                    "c_name" => $row["c_name"],
                    "bg_expense_id" => $row["bg_expense_id"],
                    "gl_sp_dc_hdr_id" => $row["gl_sp_dc_hdr_id"],
                    "po_expense_id" => $row["po_expense_id"],
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
    case "DC_EXPENSE_IN_TOR":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "
                    DECLARE  @sp_tor_id INT
                    DECLARE  @sp_tor_contract_id INT
                        SET @sp_tor_id = ?
                        SET @sp_tor_contract_id = ?

                        SELECT
                            a.po_expense_id
                            ,(SELECT c_name FROM " . DB_NMU_EIS . "bg_expense aa WHERE aa.bg_expense_id = a.po_expense_id  ) AS c_po_expense_id
                            ,isnull(f_type_amt,0) - isnull(b.f_month_total_use,0) as f_type_amt
                        FROM (
                            SELECT
                                po_expense_id
                                ,f_type_amt
                            FROM sp_tor
                            WHERE tor_id = @sp_tor_id

                        )a
                        left join (
                            select
                                bb2.po_expense_id ,
                                sum(f_dr) as f_month_total_use
                            from sp_gl_monthly_hdr bb1
                            inner join sp_gl_monthly_dtl bb2 on bb1.sp_gl_monthly_hdr_id = bb2.sp_gl_monthly_hdr_id
                            where bb1.sp_tor_id = @sp_tor_id and bb1.sp_tor_contract_id != @sp_tor_contract_id and bb2.po_expense_id is not null
                            group by po_expense_id
                        ) b on a.po_expense_id =b.po_expense_id
                        where a.po_expense_id IS NOT NULL AND a.po_expense_id > 0";

        $arrParam = array($_REQUEST["sp_tor_id"], $_REQUEST["sp_tor_contract_id"]);

        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {

            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "id" => "{$row["po_expense_id"]}",
                    "c_name" => "{$row["c_po_expense_id"]}",
                    "f_total" => "{$row["f_type_amt"]}"
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
    case "SP_GL_MONTHLY_HDR":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "SELECT
                        sp_gl_monthly_hdr_id
                        ,sp_tor_id
                        ,sp_tor_contract_id
                        ,i_month_total
                        ,f_total
                        ,CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date
                        ,dc_acc_id
                        ,(SELECT c_code + ' ' + c_name FROM NMU_ERP..dc_acc aa WHERE aa.dc_acc_id = a.dc_acc_id) AS c_dc_acc
                        ,dc_cost_id
                        ,c_comment
                        ,i_enabled
                        ,dc_user_create_id
                        ,dc_user_create_cost_id
                        ,d_create
                        ,dc_user_update_id
                        ,dc_user_update_cost_id
                        ,d_update
                    FROM sp_gl_monthly_hdr a WHERE sp_tor_id = ? AND sp_tor_contract_id = ?";
        $arrParam = array($_REQUEST["sp_tor_id"], $_REQUEST["sp_tor_contract_id"]);
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "sp_gl_monthly_hdr_id" => $row["sp_gl_monthly_hdr_id"],
                    "sp_tor_id" => $row["sp_tor_id"],
                    "sp_tor_contract_id" => $row["sp_tor_contract_id"],
                    "i_month_total" => $row["i_month_total"],
                    "f_total" => $row["f_total"],
                    "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                    "dc_acc_id" => $row["dc_acc_id"],
                    "c_dc_acc" => $row["c_dc_acc"],
                    "dc_cost_id" => $row["dc_cost_id"],
                    "c_comment" => $row["c_comment"],
                    "i_enabled" => $row["i_enabled"],
                    "dc_user_create_id" => $row["dc_user_create_id"],
                    "dc_user_create_cost_id" => $row["dc_user_create_cost_id"],
                    "d_create" => $row["d_create"],
                    "dc_user_update_id" => $row["dc_user_update_id"],
                    "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                    "d_update" => $row["d_update"],
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
    case "LIST_SP_GL_MONTHLY_DTL":
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;
        $sqlMain = "SELECT
                        sp_gl_monthly_dtl_id
                        ,sp_gl_monthly_hdr_id
                        ,i_month
                        ,dc_expense_budget_type_id
                        ,dc_acc_id
                        ,gl_sp_dc_hdr_id
                        ,bg_expense_id
                        ,sp_tor_hdr_period_id
                        ,dc_creditor_id
                        ,f_dr as f_month_total
                        ,c_comment
                        ,i_enabled
                        ,po_expense_id
                        ,CONVERT(VARCHAR, d_date, 120) AS d_date
                        -- ,d_date
                        ,dc_user_create_id
                        ,dc_user_create_cost_id
                        ,d_create
                        ,dc_user_update_id
                        ,dc_user_update_cost_id
                        ,d_update
                    FROM sp_gl_monthly_dtl
                    WHERE sp_gl_monthly_hdr_id = ? AND i_enabled = 1
                    ORDER BY i_month";
        $arrParam = array($_REQUEST["sp_gl_monthly_hdr_id"]);
        $stmt = $db->QueryParam($sqlMain, $arrParam);
        if ($stmt) {
            while ($row = $db->Fetch($stmt)) {
                $temp = array(
                    "sp_gl_monthly_dtl_id" => $row["sp_gl_monthly_dtl_id"],
                    "sp_gl_monthly_hdr_id" => $row["sp_gl_monthly_hdr_id"],
                    "i_month" => $row["i_month"],
                    "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                    "dc_acc_id" => $row["dc_acc_id"],
                    "sp_tor_hdr_period_id" => $row["sp_tor_hdr_period_id"],
                    "po_expense_id" => $row["po_expense_id"],
                    "gl_sp_dc_hdr_id" => $row["gl_sp_dc_hdr_id"],
                    "bg_expense_id" => $row["bg_expense_id"],
                    "dc_creditor_id" => $row["dc_creditor_id"],
                    "f_month_total" => $row["f_month_total"],
                    "c_comment" => $row["c_comment"],
                    "i_enabled" => $row["i_enabled"],
                    "d_doc_date" => $date->extDateBuddha($row["d_date"]),
                    "dc_user_create_id" => $row["dc_user_create_id"],
                    "dc_user_create_cost_id" => $row["dc_user_create_cost_id"],
                    "d_create" => $row["d_create"],
                    "dc_user_update_id" => $row["dc_user_update_id"],
                    "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                    "d_update" => $row["d_update"],
                );
                ${$root}[] = $temp;
            }
        }
        echo json_encode(array("debug" => true, $root => ${$root}));
        exit();
        break;
    case "UP_SP_GL_MONTHLY":
        if ($_REQUEST["sp_gl_monthly_hdr_id"] > 0) {

            $id_dalete = "";
            $count_loop = 0;
            $Arr_delete_id = json_decode($_REQUEST["data"], true);
            foreach ($Arr_delete_id as $fldd_delete) {
                if ($fldd_delete["sp_gl_monthly_dtl_id"] > 0) {
                    $id_dalete .= "," . $fldd_delete["sp_gl_monthly_dtl_id"];
                    $count_loop++;
                }
            }
            $in_not = $count_loop > 0 ? " AND sp_gl_monthly_dtl_id NOT IN (" . substr($id_dalete, 1) . ")" : "";
            $sql = "DELETE sp_gl_monthly_dtl WHERE sp_gl_monthly_hdr_id = {$_REQUEST["sp_gl_monthly_hdr_id"]}" . $in_not;
            $stmt = $db->QueryParam($sql, array());
        }

        $root = "data";
        $data = array();
        $temp = array();
        $con = null;

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);

        $data["sp_tor_id"] = $_REQUEST["sp_tor_id"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"];
        $data["c_ref_doc"] = $_REQUEST["c_doc_ref"];
        $data["i_month_total"] = $_REQUEST["i_month_total"];
        $data['d_doc_date'] = $_REQUEST['d_date_monthly_hdr'];
        $data["dc_acc_id"] = $_REQUEST["dc_acc_idID"] ?? null;

        //      $data["po_expense_id"] = $_REQUEST["po_expense_id"];

        $data["dc_cost_id"] = $_REQUEST["dc_cost_id"];
        $data["f_total"] = str_replace(',', '', $_REQUEST["f_total"]);
        $data["i_enabled"] = 1;

        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if (@$_REQUEST['sp_gl_monthly_hdr_id'] < 1) {  // ****** ADD ******
            $data["dc_user_create_id"] = $_SESSION["user_id"];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_create"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fld}";
                $addValue .= ", ?";
            }

            $sql = "
                SET NOCOUNT ON
                INSERT INTO sp_gl_monthly_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";
            $stmt = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($stmt);
            $re_id = $ss_id["id"];
        } else if (@$_REQUEST['sp_gl_monthly_hdr_id'] > 0) { // ****** EDIT ******
            foreach ($data as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ",
                {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_gl_monthly_hdr_id"] ?? null;
            $sql = "UPDATE sp_gl_monthly_hdr SET " . substr($addField, 1) . " WHERE sp_gl_monthly_hdr_id = ?";
            $re_id = $_REQUEST["sp_gl_monthly_hdr_id"];

            $stmt = $db->QueryParam($sql, $arrValue);
        }
        $root = "data";
        $data = array();
        $temp = array();
        $con = null;

        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $Arr = json_decode($_REQUEST["data"], true);
        foreach ($Arr as $fldd) {
            $data["i_month"] = $fldd["i_month"];

            $data["dc_acc_id"] = $fldd["dc_acc_id"] ?? null;
            $data["gl_sp_dc_hdr_id"] = $fldd["gl_sp_dc_hdr_id"] ?? null;

            $data["dc_acc_id"] = $fldd["dc_acc_id"] ?? null;
            $data["gl_sp_bg_hdr_id"] = $fldd["dc_acc_id"] ?? null;
            $data["gl_sp_dc_hdr_id"] = $fldd["gl_sp_dc_hdr_id"] ?? null;
            $data["bg_expense_id"] = $fldd["po_expense_id"] ?? null;

            $data["dc_expense_budget_type_id"] = $fldd["dc_expense_budget_type_id"] ?? null;
            $data["dc_creditor_id"] = $fldd["dc_creditor_id"] ?? null;

            $data["po_expense_id"] = $fldd["po_expense_id"] ?? null;

            $data["f_dr"] = $fldd["f_month_total"];
            $data["d_date"] = $fldd["d_date"];
            $data["c_comment"] = $fldd["c_comment"] ?? null;
            $data["i_enabled"] = 1;
            $data["dc_user_update_id"] = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");

            if ($fldd["sp_gl_monthly_dtl_id"] > 0) { // EDIT
                foreach ($data as $fldA => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ",
                    {$fldA} = ?";
                }

                $sql = "UPDATE sp_gl_monthly_dtl SET " . substr($addField, 1) . " WHERE sp_gl_monthly_dtl_id = ?";
                $arrValue[] = $fldd["sp_gl_monthly_dtl_id"];

                $db->QueryParam($sql, $arrValue);
            } else { // ADD
                $data["sp_gl_monthly_hdr_id"] = $re_id;
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
                        INSERT INTO sp_gl_monthly_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                        SELECT @@IDENTITY as id;";
                $para = $db->QueryParam($sql, $arrValue);
                $ss_id = $db->Fetch($para);
                $id = $ss_id["id"];

                // ============== //
                $addField = null;
                $addValue = null;
                unset($data);
                unset($arrValue);
                // ============== //
            }

            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //
        }

        // $re    = array("success" => true, "id" => $_REQUEST["id"]);

        break;

    case "Cancel_Tor":

        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data["sp_tor_id"] = $_REQUEST["id"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $data["sp_emp_id"] = $_REQUEST['sp_emp_id'];
        $data["sp_status_hdr_id"] = $_REQUEST["sp_status_hdr_id"];
        $data["d_delete"] = date("Y-m-d H:i:s");
        $data["dc_user_delete_id"] = $_SESSION['user_id'];
        $data["dc_user_cost_delete_id"] = $_SESSION["dc_cost_id"];
        $data["c_comment"] = $_REQUEST["c_comment_delete"];
        $data["i_type_delete"] = $_REQUEST["i_type_delete"];
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }

        $sql = " INSERT INTO sp_tor_delete (" . substr($addField, 1) . ")
            VALUES (" . substr($addValue, 1) . ");";
        $stmt = $db->QueryParam($sql, $arrValue);

        $sql2 = "update sp_tor set i_enabled = 2 where tor_id = {$data["sp_tor_id"]} ; ";
        $stmt2 = $db->QueryParam($sql2, $arrValue);

        $sql3 = "update " . DB_NMU_EIS . "bg_reserve_money set i_enable = 2 where pr_id = {$data["sp_tor_id"]}  and i_sys = 3 ; ";
        $stmt3 = $db->QueryParam($sql3, $arrValue);
        // if(($_REQUEST['dc_expense_budget_type_id'] == 4 && $_REQUEST['i_type_bg'] ==  1)   || ($_REQUEST['dc_expense_budget_type_id'] == 5 && $_REQUEST['i_type_bg'] ==  1)) {
        $c_code = $db->GetDataBySQL("SELECT  a.c_code,(select c_name from sp_emp where sp_emp_id=a.sp_emp_id)as sp_emp_name
                                    , a.f_total_amt AS a_total_amt
                                    , a.c_name AS a_name
                                    , (select c_name from dc_expense_budget_type where dc_expense_budget_type_id = a.dc_expense_budget_type_id) as expense_budget_type
                                    FROM dbo.sp_tor a  WHERE a.tor_id=?", array($data["sp_tor_id"]));
//        if (IPBOOK != 'localhost') {
//            $reMsg = lineNotif("ยกเลิกรายการ " . "\n"
//                . "เลขที่ PR : " . $c_code["c_code"] . "\n"
//                . "แหล่งเงิน : " . $c_code["expense_budget_type"]  . "\n"
//                . "เรื่อง : " . $c_code["a_name"]  . "\n"
//                . "ผู้ทำการยกเลิก : " . $_SESSION["user_name"]  . "\n"
//                . "จำนวนเงิน : " . number_format($c_code["a_total_amt"], 2)   . "\n"
//                . "ผู้รับผิดชอบงาน " . $c_code["sp_emp_name"]);
//        }
        break;

    case "Return_The_Story_Owner":

        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data["sp_tor_id"] = $_REQUEST["id"];
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $data["sp_emp_id"] = $_REQUEST['sp_emp_id'];
        $data["sp_status_hdr_id"] = $_REQUEST["sp_status_hdr_id"];
        $data["d_delete"] = date("Y-m-d H:i:s");
        $data["dc_user_delete_id"] = $_SESSION['user_id'];
        $data["dc_user_cost_delete_id"] = $_SESSION["dc_cost_id"];
        $data["c_comment"] = $_REQUEST["c_comment_delete"];
        $data["i_type_delete"] = 1;
        $data["i_is_register"] = $_REQUEST["i_is_register"];
        $data["mode_reverse"] = $_REQUEST["mode_reverse"];
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }

        // $sql = " INSERT INTO sp_tor_delete (" . substr($addField, 1) . ")
        // VALUES (" . substr($addValue, 1) . ");";
        // $stmt =  $db->QueryParam($sql,$arrValue);

        $sql = "update sp_tor
                set i_is_register = {$data["i_is_register"]} ,c_remake ='{$data["c_comment"]}'
                where tor_id = {$data["sp_tor_id"]} ; ";
        $stmt = $db->QueryParam($sql, $arrValue);
        if ($data["mode_reverse"] == 2) {
            $sql2 = "update " . DB_NMU_EIS . "bg_reserve_money set i_enable = 2 where pr_id = {$data["sp_tor_id"]} and i_sys = 3 ; ";
            $stmt2 = $db->QueryParam($sql2, $arrValue);
            // } else if ($_REQUEST['i_type_delete'] == 2){
            // $sql=
        }
        // $sql1
        break;
    case "Recognize_Reason":

        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data["i_enabled"] = 2;
        // $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"]??null;
        $data["sp_emp_id"] = $_SESSION['sp_emp_id'];
        // $data["sp_status_hdr_id"] = $_REQUEST["sp_status_hdr_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION['user_id'];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["c_comment"] = $_REQUEST["c_comment_delete"];
        $data["sp_tor_id"] = $_REQUEST['id'];
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }
        $sql = "UPDATE sp_tor_delete SET " . substr($addField, 1) . " WHERE sp_tor_id = ?";
        $arrValue[] = $_REQUEST["id"];
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "UP_TYPE_PR":
        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // if($_REQUEST['buy'] == 1 ){
        $data["po_expense_id"] = $_REQUEST['po_expense_id'];
        $data["i_amount_bg"] = $_REQUEST['i_amount_bg'];
        $data["f_total_amt"] = $_REQUEST['f_total_pr'];
        $data["i_yyyy"] = $_REQUEST['i_yyyy'];
        if ($_REQUEST['type'] == 1) {
            $data["i_pr_type1"] = $_REQUEST['i_type_pr'];
            $data["dc_expense_budget_type_id"] = $_REQUEST['dc_expense_budget_type'];
            $data["f_type_amt"] = $_REQUEST['f_total'];
        } else if ($_REQUEST['type'] == 2) {
            $data["i_pr_type2"] = $_REQUEST['i_type_pr'];
            $data["dc_expense_budget_type2_id"] = $_REQUEST['dc_expense_budget_type'];
            $data["f_type2_amt"] = $_REQUEST['f_total'];
        } else {
            $data["i_pr_type3"] = $_REQUEST['i_type_pr'];
            $data["dc_expense_budget_type3_id"] = $_REQUEST['dc_expense_budget_type'];
            $data["f_type3_amt"] = $_REQUEST['f_total'];
        }
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }
        $arrValue[] = $_REQUEST['id'];
        // print_r($arrValue);
        $sql = "UPDATE sp_tor SET " . substr($addField, 1) . " WHERE tor_id = ?";
        // $sql = "UPDATE sp_tor_dtl SET " . substr($addField, 1) . " WHERE tor_id = ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "Edit_Tor":
        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        $arrParam = null;
        unset($data);
        unset($arrValue);
        unset($arrParam);
        // tor_type_id

        $arrParam = array();
        $arrParam[] = $_REQUEST["tor_type_edit_id"];
        $arrParam[] = $_REQUEST["tor_status_edit"];
        $arrParam[] = $_REQUEST["datepa"];
        $arrParam[] = $_REQUEST["reason"];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_SESSION['user_id'];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = $_REQUEST['id'];

        $arrParam[] = $_REQUEST['id'];
        $arrParam[] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $arrParam[] = $_SESSION['sp_emp_id'];
        $arrParam[] = $_REQUEST["sp_status_hdr_id"];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_SESSION['user_id'];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = $_REQUEST["reason"];
        $arrParam[] = $_REQUEST["i_type_delete"];
        $arrParam[] = 1;
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_SESSION['user_id'];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = $_REQUEST["tor_type_id"];
        $arrParam[] = $_REQUEST["i_is_edit_tor"];
        $sql = "UPDATE sp_tor set tor_type_id = ?
                , tor_status_id = ?
                , d_edit_pa = ?
                , reason = ?
                , d_update = ?
                , dc_user_update_id  = ?
                , dc_user_update_cost_id = ?
                where tor_id = ?;

                INSERT INTO sp_tor_delete (
                    sp_tor_id
                    , sp_tor_contract_id
                    , sp_emp_id
                    , sp_status_hdr_id
                    , d_delete
                    , dc_user_delete_id
                    , dc_user_cost_delete_id
                    , c_comment
                    , i_type_delete
                    , i_enabled
                    , d_update
                    , dc_user_update_id
                    , dc_user_update_cost_id
                    , tor_type_id
                    , i_is_edit_tor
                ) VALUES( ?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,?
                    ,? );
                ";
        $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "Edit_contract":

        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        $arrParam = null;
        unset($data);
        unset($arrValue);
        unset($arrParam);
        // tor_type_id

        $arrParam = array();
        // echo($_REQUEST["id"]);
        // exit;
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_SESSION['sp_emp_id'];
        $arrParam[] = $_SESSION['dc_cost_id'];
        $arrParam[] = date("Y-m-d H:i:s");
        $arrParam[] = $_SESSION['sp_emp_id'];
        $arrParam[] = $_SESSION['dc_cost_id'];
        $arrParam[] = $_REQUEST["reason"];
        $arrParam[] = $_REQUEST["id"];
        $sql = "INSERT INTO sp_tor_contract_edit
                (sp_tor_contract_id	,
                parent_id	,
                sp_tor_id	,
                dc_creditor_id	,
                c_code	,
                c_name	,
                c_doc_ref	,
                c_po_no	,
                c_po_no	,
                c_po_no	,
                c_po_no	,
                d_doc_date	,
                d_po_date	,
                d_due_date	,
                i_notor	,
                i_notification	,
                f_total_amt	,
                i_is_complete	,
                i_status	,
                c_discription	,
                i_contract_status	,
                i_parent	,
                i_is_monthly	,
                i_is_po	,
                i_is_signin	,
                i_is_edit	,
                d_signin_date	,
                i_is_warranty	,
                i_is_close	,
                close_detail	,
                i_is_return	,
                d_return_warranty	,
                c_return_warranty	,
                c_return_comment	,
                i_delivery	,
                i_is_warranty_book	,
                i_type_fine	,
                book_no	,
                book_seq	,
                d_book_date	,
                i_is_percen	,
                f_percen	,
                f_warranty_amt	,
                c_remark	,
                book_warranty_no	,
                d_book_warranty_date	,
                dc_bank_id	,
                f_fine	,
                f_book_warranty_amt	,
                d_book_warranty_end	,
                c_remark1	,
                i_enabled	,
                dc_cost_id	,
                sp_emp_id	,
                d_emp_dt	,
                dc_user_create_id	,
                dc_user_create_cost_id	,
                dc_user_create_department_id	,
                d_create	,
                dc_user_update_id	,
                dc_user_update_cost_id	,
                dc_user_update_department_id	,
                d_update	,
                dc_user_update_cost_id1	,
                dc_user_update_department_id1	,
                d_update1	,
                i_step	,
                i_is_period	,
                d_cashiercheque_data	,
                cashiercheque_on	,
                cashiercheque_seq	,
                f_warranty_cashiercheque	,
                c_remark_cashiercheque	,
                dc_expense_budget_type_id	,
                f_type_amt	,
                i_pr_type1	,
                bg_reserve_money1_id	,
                dc_expense_budget_type2_id	,
                f_type2_amt	,
                i_pr_type2	,
                bg_reserve_money2_id	,
                bg_reserve_i_last1	,
                bg_reserve_i_last2	,
                i_booking_bg	,
                i_yyyy_overlap	,
                c_overlap	,
                i_overlap	,
                bg_reserve_overlap_id	,
                sp_type_id	,
                dc_expense_budget_type3_id	,
                f_type3_amt	,
                i_pr_type3	,
                bg_reserve_money3_id	,
                bg_reserve_i_last3	,
                i_is_join_venture	,
                bg_budget_dtl_overlap_id,

                d_create_edit,
                dc_user_create_id_edit,
                dc_user_create_cost_id_edit,
                d_update_edit,
                dc_user_update_id_edit,
                dc_user_update_cost_id_edit,
                c_comment
                )
                SELECT
                sp_tor_contract_id ,
                parent_id ,
                sp_tor_id ,
                dc_creditor_id ,
                c_code ,
                c_name ,
                c_doc_ref ,
                c_po_no ,
                d_doc_date ,
                d_po_date ,
                d_due_date ,
                i_notor ,
                i_notification ,
                f_total_amt	,
                i_is_complete	,
                i_status	,
                c_discription	,
                i_contract_status	,
                i_parent	,
                i_is_monthly	,
                i_is_po	,
                i_is_signin	,
                i_is_edit	,
                d_signin_date	,
                i_is_warranty	,
                i_is_close	,
                close_detail	,
                i_is_return	,
                d_return_warranty	,
                c_return_warranty	,
                c_return_comment	,
                i_delivery	,
                i_is_warranty_book	,
                i_type_fine	,
                book_no	,
                book_seq	,
                d_book_date	,
                i_is_percen	,
                f_percen	,
                f_warranty_amt	,
                c_remark	,
                book_warranty_no	,
                d_book_warranty_date	,
                dc_bank_id	,
                f_fine	,
                f_book_warranty_amt	,
                d_book_warranty_end	,
                c_remark1 ,
                i_enabled ,
                dc_cost_id ,
                sp_emp_id ,
                d_emp_dt ,
                dc_user_create_id	,
                dc_user_create_cost_id	,
                dc_user_create_department_id	,
                d_create	,
                dc_user_update_id	,
                dc_user_update_cost_id	,
                dc_user_update_department_id	,
                d_update	,
                dc_user_update_cost_id1	,
                dc_user_update_department_id1	,
                d_update1	,
                i_step	,
                i_is_period	,
                d_cashiercheque_data	,
                cashiercheque_on	,
                cashiercheque_seq	,
                f_warranty_cashiercheque	,
                c_remark_cashiercheque	,
                dc_expense_budget_type_id	,
                f_type_amt	,
                i_pr_type1	,
                bg_reserve_money1_id	,
                dc_expense_budget_type2_id	,
                f_type2_amt ,
                i_pr_type2 ,
                bg_reserve_money2_id ,
                bg_reserve_i_last1 ,
                bg_reserve_i_last2 ,
                i_booking_bg ,
                i_yyyy_overlap ,
                c_overlap ,
                i_overlap ,
                bg_reserve_overlap_id ,
                sp_type_id ,
                dc_expense_budget_type3_id ,
                f_type3_amt ,
                i_pr_type3 ,
                bg_reserve_money3_id ,
                bg_reserve_i_last3 ,
                i_is_join_venture ,
                bg_budget_dtl_overlap_id ,
                ? ,
                ? ,
                ? ,
                ? ,
                ? ,
                ? ,
                ?
                FROM sp_tor_contract
                WHERE sp_tor_contract_id = ?
                ";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "Edit_bg_Tor":
        unset($data);
        for ($x = 1; $x <= $_REQUEST["i_amount_bg"]; $x++) {
            $data["sp_tor_id"] = $_REQUEST["id"];
            $data["i_amount_bg"] = $_REQUEST["i_amount_bg"];
            $data["dc_expense_budget_type_id"] = $_REQUEST["dc_expense_budget_type_edit_id" . $x];
            $data["bg_reserve_money_id"] = $_REQUEST["bg_reserve_money_id" . $x];
            $data["f_total_amt"] = str_replace(',', '', $_REQUEST["f_total_amt" . $x]);
            $data["i_pr_type"] = $_REQUEST["i_pr_type" . $x]; //i_pr_type1
            $data["po_expense_id"] = $_REQUEST["po_expense_id"];
            $data["c_comment"] = $_REQUEST["c_comment"];
            $data["i_edit"] = $_REQUEST["i_edit"];
            $data["i_status"] = $_REQUEST["i_status"];
            $data["i_number_bg"] = $x;
            $data["d_create"] = date("Y-m-d H:i:s");
            $data["dc_user_create_id"] = $_SESSION['user_id'];
            $data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data["d_update"] = date("Y-m-d H:i:s");
            $data["dc_user_update_id"] = $_SESSION['user_id'];
            $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
            $sql = " INSERT INTO sp_tor_bg_log (" . substr($addField, 1) . ")
                VALUES (" . substr($addValue, 1) . ");";

            $stmt = $db->QueryParam($sql, $arrValue);
            unset($data);
            unset($arrValue);
            $addField = null;
            $addValue = null;
        }
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $data["i_edit"] = $_REQUEST['i_edit_tor'];
        $data["i_step_bg"] = $_REQUEST['i_step_bg'];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION['user_id'];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }

        $arrValue[] = $_REQUEST['id'];
        $sql = "UPDATE sp_tor SET " . substr($addField, 1) . " WHERE tor_id =  ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "ConFirm_Edit_bg":
        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // if($_REQUEST['i_amount_bg'] == 1 ){
        // }
        $data["f_total_amt"] = $_REQUEST['f_total_pr'];
        $data["po_expense_id"] = $_REQUEST['po_expense_id'];
        $data["i_edit"] = $_REQUEST['i_edit_tor'];
        $data["dc_cost2_id"] = $_REQUEST['dc_cost2_id'];
        // $data["f_total_amt"] = $_REQUEST['f_total_pr']; i_amount_bg
        $data["i_yyyy"] = $_REQUEST['i_yyyy'];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION['user_id'];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        if ($_REQUEST['type'] == 1) {
            $data["i_pr_type1"] = $_REQUEST['i_pr_type'];
            $data["dc_expense_budget_type_id"] = $_REQUEST['dc_expense_budget_type'];
            $data["f_type_amt"] = $_REQUEST['f_total'];
        } else if ($_REQUEST['type'] == 2) {
            $data["i_pr_type2"] = $_REQUEST['i_pr_type'];
            $data["dc_expense_budget_type2_id"] = $_REQUEST['dc_expense_budget_type'];
            $data["f_type2_amt"] = $_REQUEST['f_total'];
        } else {
            $data["i_pr_type3"] = $_REQUEST['i_pr_type'];
            $data["dc_expense_budget_type3_id"] = $_REQUEST['dc_expense_budget_type'];
            $data["f_type3_amt"] = $_REQUEST['f_total'];
        }
        // i_edit_tor
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }
        $arrValue[] = $_REQUEST['id'];
        $sql = "UPDATE sp_tor SET " . substr($addField, 1) . " WHERE tor_id =  ?";
        $stmt = $db->QueryParam($sql, $arrValue);
        if ($_REQUEST['buy'] == 2) {
            $addField2 = null;
            $addValue2 = null;
            unset($data2);
            unset($arrValue2);
            $data2["dc_bg_budget_type_id"] = $_REQUEST['dc_expense_budget_type'];
            $data2["po_expense_id"] = $_REQUEST['po_expense_id'];
            $data2["i_pr_type1"] = $_REQUEST['i_pr_type'];
            $data2["f_unit_price"] = $_REQUEST['f_total'];
            $data2["f_net_total_price"] = $_REQUEST['f_total'];
            $data2["d_update"] = date("Y-m-d H:i:s");
            $data2["dc_user_update_id"] = $_SESSION['user_id'];
            $data2["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            foreach ($data2 as $fldA2 => $value2) {
                $arrValue2[] = ($value2 != "") ? $value2 : null;
                $addField2 .= ", {$fldA2} = ?";
            }
            $arrValue2[] = $_REQUEST['id'];
            $sql2 = "UPDATE sp_tor_dtl SET " . substr($addField2, 1) . " WHERE sp_tor_id =  ?";
            $stmt2 = $db->QueryParam($sql2, $arrValue2);
            $addField3 = null;
            $addValue3 = null;
            unset($data3);
            unset($arrValue3);
            $data3["sp_tor_id"] = $_REQUEST["id"];
            $data3["i_amount_bg"] = $_REQUEST["i_amount_bg"];
            $data3["dc_expense_budget_type_id"] = $_REQUEST["dc_expense_budget_type_id_edit"];
            $data3["bg_reserve_money_id"] = $_REQUEST["bg_reserve_money_edit"];
            $data3["f_total_amt"] = str_replace(',', '', $_REQUEST["f_type_amt"]);
            $data3["i_pr_type"] = $_REQUEST["i_pr_type_edit"];
            $data3["po_expense_id"] = $_REQUEST["po_expense_id_edit"] ?? 0;

            $data3["i_edit"] = $_REQUEST["i_edit"];
            $data3["i_status"] = $_REQUEST["i_status"];
            $data3["i_number_bg"] = $_REQUEST['type'];
            $data3["d_create"] = date("Y-m-d H:i:s");
            $data3["dc_user_create_id"] = $_SESSION['user_id'];
            $data3["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
            $data3["d_update"] = date("Y-m-d H:i:s");
            $data3["dc_user_update_id"] = $_SESSION['user_id'];
            $data3["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
            foreach ($data3 as $fld3 => $value3) {
                $arrValue3[] = ($value3 != "") ? $value3 : null;
                $addField3 .= ",\n {$fld3}";
                $addValue3 .= ",\n ? /*{$fld3}*/";
            }
            $arrValue3[] = $_REQUEST['id'];
            $sql3 = "INSERT INTO sp_tor_bg_log (" . substr($addField3, 1) . ")
                VALUES (" . substr($addValue3, 1) . ");";
            $stmt3 = $db->QueryParam($sql3, $arrValue3);
        }
        break;
    case "next_bg":
        unset($data);
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $data["i_step_bg"] = $_REQUEST['i_step_bg'];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION['user_id'];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }

        $arrValue[] = $_REQUEST['id'];
        $sql = "UPDATE sp_tor SET " . substr($addField, 1) . " WHERE tor_id =  ?";
        $stmt = $db->QueryParam($sql, $arrValue);
    case "UPDATENEXTSTEP_IA":
        unset($data);
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $data["i_type_bg"] = $_REQUEST['i_type_bg'];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION['user_id'];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }

        $arrValue[] = $_REQUEST['id'];
        $sql = "UPDATE sp_tor SET " . substr($addField, 1) . " WHERE tor_id =  ?";
        $stmt = $db->QueryParam($sql, $arrValue);

        break;
    case "Not_Approved_bg":
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        $data["i_edit"] = $_REQUEST['i_edit'];
        $data["i_status"] = $_REQUEST['i_status'];
        // $data["i_pr_type1"] = $_REQUEST['i_pr_type'];
        // $data["f_unit_price"] = $_REQUEST['f_total'];
        // $data["f_net_total_price"] = $_REQUEST['f_total'];
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION['user_id'];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        foreach ($data as $fldA => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fldA} = ?";
        }
        $arrValue[] = $_REQUEST['sp_tor_bg_log_id' . $_REQUEST['type']];
        $sql = "UPDATE sp_tor_bg_log SET " . substr($addField, 1) . " WHERE sp_tor_bg_log_id =  ?";
        // echo($sql2);
        $stmt = $db->QueryParam($sql, $arrValue);
        break;
    case "Reverse_Tor":

        $sp_tor_id = $_REQUEST['id'];
        $d_date = date("Y-m-d H:i:s");
        $sp_emp_id = $_SESSION['sp_emp_id'];
        $dc_cost_id = $_SESSION['dc_cost_id'];
        $c_remake = $_REQUEST['c_comment_delete'];
        if ($_REQUEST['i_type_delete'] == 1) {
            $sp_status_hdr_id = " in ('" . $_REQUEST['sp_status_hdr_id'] . "')";
        } else {
            $sp_status_hdr_id = " not in (25,26,24,13)";
        }
        $sql = "INSERT INTO sp_tor_item_cancel
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
            AND sp_status_hdr_id  {$sp_status_hdr_id} ;";
        $stmt = $db->QueryParam($sql, array($sp_tor_id, $sp_status_hdr_id));
        $sql1 = "DELETE FROM sp_tor_item
            where  tor_id = {$sp_tor_id}
            and sp_status_hdr_id  {$sp_status_hdr_id}; ";
        $stmt2 = $db->QueryParam($sql1, array($sp_tor_id, $sp_status_hdr_id));

        if ($_REQUEST['i_type_delete'] == 1) {
            // $sp_status_hdr_id  = " in ('".$_REQUEST['sp_status_hdr_id']."')";
            // fetch the latest to go update
            $sql3 = "select top 1 (select sp_status_hdr_id   from sp_status_hdr where sp_status_hdr_id = a.sp_status_hdr_id  )  as sp_status_hdr
                from sp_tor_item  a
                where tor_id = {$sp_tor_id}  and  isnull(a.sp_status_hdr_id,0) != 0
                order by act_date_dt desc ;";
            $stmt4 = $db->QueryParam($sql3, array($sp_tor_id));
            $row = $db->Fetch($stmt4);
            $select_status_id = $row["sp_status_hdr"];
            // print_r($stmt4 );
            // exit ;
        } else if ($_REQUEST['i_type_delete'] == 2 && $_REQUEST['cancel_reservation'] == 1) {
            if ($_REQUEST['i_yyyy'] == date("Y")) {
                $sql3 = "update " . DB_NMU_EIS . "bg_reserve_money set i_enable = 2 ,d_update = '{$d_date}'   where pr_id =  {$sp_tor_id} and i_sys = 3;
                            update sp_tor set bg_reserve_money1_id = null , i_pr_type1 = null where tor_id = {$sp_tor_id};
                            update sp_tor_dtl set bg_reserve_money_id = null , i_pr_type1 = null where sp_tor_id = {$sp_tor_id};
                    ";
                $stmt4 = $db->QueryParam($sql3, array($sp_tor_id));
                $sp_status_hdr_id = " not in (25,26,24,13)";
            }
            $select_status_id = 13;
        } else {
            $select_status_id = 13;
        }
        $sql2 = "UPDATE sp_tor set i_is_register = 0 ,tor_status_id  = {$select_status_id} , i_backword = 1 , c_remake  = '{$c_remake}'   where tor_id = {$sp_tor_id} ";
        $stmt3 = $db->QueryParam($sql2, array($sp_tor_id));
        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $data["sp_tor_id"] = $sp_tor_id;
        $data["sp_tor_contract_id"] = $_REQUEST["sp_tor_contract_id"] ?? null;
        $data["sp_emp_id"] = $_REQUEST['sp_emp_id'];
        $data["sp_status_hdr_id"] = $_REQUEST["sp_status_hdr_id"];
        $data["d_delete"] = date("Y-m-d H:i:s");
        $data["dc_user_delete_id"] = $_SESSION['user_id'];
        $data["dc_user_cost_delete_id"] = $_SESSION["dc_cost_id"];
        $data["c_comment"] = $c_remake;
        $data["i_type_delete"] = $_REQUEST["i_type_delete"];
        $data["i_enabled"] = 1;
        $data["d_update"] = date("Y-m-d H:i:s");
        $data["dc_user_update_id"] = $_SESSION['user_id'];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value != "") ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $sql5 = " INSERT INTO sp_tor_delete (" . substr($addField, 1) . ")
            VALUES (" . substr($addValue, 1) . ");";
        $stmt5 = $db->QueryParam($sql5, $arrValue);
        break;

    case "BACKUP_BG_RESERVE_MONEY":
        $data = array();
        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $arrParam = array();
        $arrParam[] = $_REQUEST['sp_tor_id'];
        $arrParam[] = $_REQUEST['pr_bg_reserve_money1_id'] ?? null;
        $arrParam[] = $_REQUEST['sp_check_period_hdr_id'];
        $arrParam[] = date('Y-m-d H:i:s');
        $arrParam[] = date('Y-m-d H:i:s');
        $arrParam[] = $_SESSION['user_id'];
        $arrParam[] = $_SESSION['dc_cost_id'];
        $arrParam[] = date('Y-m-d H:i:s');
        $arrParam[] = $_SESSION['user_id'];
        $arrParam[] = $_SESSION['dc_cost_id'];
        $sqlHdr = "INSERT INTO dbo.sp_tor_backup (
                                sp_tor_id
                                , bg_reserve_money_id
                                , sp_check_period_hdr_id
                                , d_create_backeup
                                , d_create
                                , dc_user_create_id
                                , dc_user_create_cost_id
                                , d_update
                                , dc_user_update_id
                                , dc_user_update_cost_id)
                            VALUES (?, ? ,
                                ? , ?, ?,
                                ? ,
                                ? , ?, ?, ?)";
        $sqlHdr .= "SELECT @@IDENTITY as sp_tor_backup_id";
        // echo($sqlHdr);
        $stmt = $db->QueryParam($sqlHdr, $arrParam);
        $bg_id = $db->Fetch($stmt);
        $re_id = $bg_id["sp_tor_backup_id"];
        break;
    case "LIST_SP_EDIT_CONTRACT":
        $root = "data";
        $data = array();
        $sqlMain = "SELECT
                                    a.sp_tor_contract_editid
                                    ,a.sp_tor_id
                                    ,a.sp_tor_contract_id
                                    ,a.row_edit
                                    ,a.i_enabled
                                    ,isnull(a.i_type,0)  as i_type
                                    ,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
                                    ,CONVERT(VARCHAR, a.d_due_date, 120) AS d_due_date
                                    ,a.dc_bank_id
                                    ,a.i_type_guarantee
                                    ,a.guarantee_on
                                    ,a.guarantee_seq
                                    ,a.c_comment
                                    ,a.f_warranty_guarantee
                                    ,a.d_guarantee_data
                                    ,a.c_remark_guarantee
                                    ,a.f_total_amt
                                    ,CONVERT(VARCHAR, a.d_create, 120) AS d_create
                                    ,a.dc_user_create_id
                                    ,a.dc_user_create_cost_id
                                    ,a.dc_user_update_id
                                    ,a.dc_user_update_cost_id
                                    ,CONVERT(VARCHAR, a.d_update, 120) AS d_update
                                    -- , CONVERT(VARCHAR,a.d_update , 120) AS d_update
                                    -- , (select count(sp_tor_bidder_dtl_id) from sp_tor_bidder_dtl aa where aa.sp_tor_bidder_hdr_id = a.sp_tor_bidder_hdr_id) AS bid_count
                                FROM sp_tor_contract_edit  a
                                WHERE a.sp_tor_id = ? AND a.i_enabled = 1
                                ORDER BY a.d_create ";
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_id']));
        $i = @$start + 1;
        while ($row = $db->Fetch($stmt)) {

            switch (intval($row["i_type"])) {
                case 0:
                    $i_type = "color:#FF0000";
                    $i_typeTxt = "ติดต่อ admin";
                    break;
                case 1:
                    $i_type = "color:#116CEF";
                    $i_typeTxt = "อัพเดทสัญญา";
                    break;
                case 2:
                    $i_type = "color:#b085f5";
                    $i_typeTxt = "แก้ไขสัญญา";
                    break;
            }
            $i_typeTxt = "<b style='{$i_type}'>" . $i_typeTxt . "</b>";

            $temp = array(
                "no" => $i++,
                "sp_tor_contract_editid" => intval($row["sp_tor_contract_editid"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "row_edit" => intval($row["row_edit"]),
                "i_enabled" => intval($row["i_enabled"]),
                "i_type" => intval($row["i_type"]),
                // "d_doc_date"                        => $row["d_doc_date"],
                "i_typeTxt" => $i_typeTxt,
                "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
                "d_due_date" => ((empty($row["d_due_date"])) ? "" : $date->extDateBuddha($row["d_due_date"])), //d_tor_date
                // "d_due_date"                        => $row["d_due_date"],
                "c_comment" => $row["c_comment"],
                "dc_bank_id" => $row["dc_bank_id"],
                "i_type_guarantee" => $row["i_type_guarantee"],
                "guarantee_on" => $row["guarantee_on"],
                "guarantee_seq" => $row["guarantee_seq"],
                "f_warranty_guarantee" => number_format($row["f_warranty_guarantee"], 2),
                "d_guarantee_data" => $row["d_guarantee_data"],
                "c_remark_guarantee" => $row["c_remark_guarantee"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                // "d_create"                          => $row["d_create"],
                "d_create" => ((empty($row["d_create"])) ? "" : $date->extDateBuddha($row["d_create"])), //d_tor_date
                "dc_user_create_id" => $row["dc_user_create_id"],
                "dc_user_create_cost_id" => $row["dc_user_create_cost_id"],
                "dc_user_update_id" => $row["dc_user_update_id"],
                "dc_user_update_cost_id" => $row["dc_user_update_cost_id"],
                "d_update" => ((empty($row["d_update"])) ? "" : $date->extDateBuddha($row["d_update"])), //d_tor_date
                    // "d_update"                          => $row["d_update"],
            );
            ${$root}[] = $temp;
        }
        // print_r(${$root}); exit;
        echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
        exit();

        break;
}
if (!in_array(false, $arr_stmt) && count($arr_stmt)) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => true, "msg" => "บันทีกเรียบร้อยแล้ว" . $msgTxt);
} else {
    if ($stmt && $stmt2 && $stmt3) {
        $db->CommitTran();
        $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว" . $msgTxt, "id" => $re_id);
    } else {
        $db->RollBackTran();
        $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
    }
}
echo json_encode($re);
exit;
