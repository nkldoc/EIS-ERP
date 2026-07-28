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
    
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;

$db->BeginTran();

$id = $_REQUEST["id"] ?? null;

function RunStatusPeriod($period_status = null, $period_id = null) {
    global $db;

    /* sp_status_hdr_id	c_code	c_name
      4	ST0012	ส่งมอบงาน
      5	ST0013	ตรวจรับพัสดุ/ครุภัณฑ์
      9	ST0015	บันทึกใบเบิก **** */

    $period_status_id = $period_status;

    $arrParam[] = $period_status_id; //  
    $arrParam[] = $_SESSION["user_id"];
    $arrParam[] = $_SESSION["dc_cost_id"];
    $arrParam[] = date("Y-m-d H:i:s");
    $arrParam[] = $period_id;

    $sql = " UPDATE dbo.sp_tor_hdr_period set "
            . " period_status_id = ? ,"
            . " dc_user_update_id = ? ,"
            . " dc_user_update_cost_id = ? ,"
            . " d_update = ? "
            . " where sp_tor_hdr_period_id = ?";
    return $db->QueryParam($sql, $arrParam);
    ;
}

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

//Preparing
///
switch ($mode) {
   case "return":

    $arrParam = array();
    $arrParam[] = $_POST["sp_bg_edit"];
    $arrParam[] = $_POST["comment"];
    $arrParam[] = $_SESSION["user_id"];   // ดึงจาก session
    $arrParam[] = $_SESSION["user_cost_id"];
    $arrParam[] = date("Y-m-d H:i:s");
    $arrParam[] = $_POST["id"];

    $sql = "UPDATE dbo.sp_tor_bg_log
            SET i_edit = ?,
                c_comment_edit1 = ?,
                dc_user_update_id = ?,
                dc_user_update_cost_id = ?,
                d_update = ?
            WHERE sp_tor_id = ?";

    $stmt = $db->QueryParam($sql, $arrParam);
    break;
}

if ($stmt && $stmt2 && $stmt3 && $stmt4) { 
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ");
}

echo json_encode($re);
exit;
