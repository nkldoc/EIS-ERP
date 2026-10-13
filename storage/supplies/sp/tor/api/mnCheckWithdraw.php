<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "dbo.sp_check_period_hdr";
$keyName = "sp_check_period_hdr_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "CHK"; //contract sign
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;

$db->BeginTran();
function upItemsStatus($data, $arr, $db) {

    $i_backword = $data["i_backword"] ?? null;
    $c_comment = $data["c_comment"] ?? null;

    $arrParam2[] = $data["id"]; //tor_id
    $arrParam2[] = $data["contract_id"] ?? null;

    // $arrParam2[] = $data["i_period_month_end"] ?? null;
    // $arrParam2[] = $data["i_peroid_product_end"] ?? null;

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

    $sql = "INSERT INTO dbo.sp_tor_item (tor_id , contract_id
                , sp_status_hdr_id
                , i_forword , i_backword
                , c_comment , i_step , d_tor_status_date
                , act_user_id , act_cost_id , act_date_dt ,d_tor_before_status_date)
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
            )";
    $arrParam2[] = $data["id"];
    return $db->QueryParam($sql, $arrParam2);
}

//
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

//
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

$id = $_REQUEST["sp_check_period_hdr_id"] ?? null;

function checkItemsToTranf($check_id, $data = array()) {
    global $db;
    /*
     * receive Items
     * c_yyyy => ปีขอเบิก
     * i_yyyy => ปีที่เรื่อง
     * dc_bg_budget_type_id => แหล่งเงิน
     * po_expense_id => รายจ่ายย่อย v4 (งบประมาณ)
     * */
    $f1 = $db->GetDataBySQL("select YEAR(a.d_checking_date) as i_yyyy,YEAR(getdate()) as c_yyyy "
            . " , (select dc_bg_budget_type_id ) as dc_bg_budget_type_id"
            . " , () as po_expense_id"
            . " from [NMU_ERP].[dbo].sp_check_period_hdr a"
            . " where a.sp_check_period_hdr_id = ?", array($check_id));
    $c_yyyy = $f['c_yyyy'];
    $i_yyyy = $f['i_yyyy'];
    $dc_bg_budget_type_id = $f['dc_bg_budget_type_id'];
    $po_expense_id = $f['po_expense_id'];

    $sql = "UPDATE dbo.sp_tranf_hdr SET"
            . " c_yyyy = '{$c_yyyy}'"
            . " , i_yyyy = '{$i_yyyy}'"
            . " , dc_bg_budget_type_id = '{$dc_bg_budget_type_id}'"
            . " , po_expense_id = '{$po_expense_id}'"
            . " WHERE sp_check_period_hdr_id = ?;";
    $stm1 = $db->QueryParam($sql, array($check_id));
    return array($stm1);
}

switch ($mode) {

    case "UPDATENEXTSTEP":


        if ($data['step'] == 'GOTOSTEP') {
            $data['i_step'] = 1;
        } else if ($data['step'] == 'BACKSTEP') {
            $data['i_step'] = 2;
        } else if ($data['step'] == 'RETURN') {
            $data['i_step'] = 3;
        }
        /*
         * [mode] => UPDATENEXTSTEP
          [menuCode] => ST0114
          [step] => BACKSTEP
          [id] => 4
          [c_comment] => แก้ไข
          [dc_user_update_id] => 60061
          [dc_user_update_cost_id] => 38
          [d_update] => 2022-05-23 15:33:45
          [i_delete] => 2
          [i_step] => 2 */

        $id = $data["id"];
        $sql = "UPDATE dbo.sp_check_period_hdr "
                . " SET i_step =? , c_comment2 =? "
                . ",  dc_user_update_id = {$data['dc_user_update_id']} "
                . ",  dc_user_update_cost_id = {$data['dc_user_update_cost_id']} "
                . ",  d_update = '{$data['d_update']}' "
                . " WHERE sp_check_period_hdr_id = ?;";

//        echo $sql . "\n";
//        print_r($data);
//        exit();

        $stmt = $db->QueryParam($sql, array($data['i_step'], $data['c_comment'], $id));
        $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $id);

//        $stmt3 = upPA($data, $arr, $db);
//        $stmt2 = upAlert($data, $arr, $db);
//        $stmt2 = upItemsStatus($data, $arr, $db); //else
}

if ($stmt) {
//if (false) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
