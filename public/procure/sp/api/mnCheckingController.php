O<?php
//-- mnCheckingController
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_check_period_hdr";
$keyName = "sp_check_period_hdr_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$i_enabled = STATUS_ENABLE;

$re_id = null;
$stmt2 = true;
$stmt3 = true;

/* * ***** i_menu
 * 1 => ส่งมอบงาน
 * 2 => ตรวจรับพัสดุ/ครุภัณฑ์
 * 3 => การมอบหมายผู้ปฏิบัติงาน
 * 4 => บันทึกใบขอเบิก
 * 5 => บันทึกเลขครุภัณฑ์ */
//===============
/* * ********i_step
 * 1=>ส่งกลับสายงาน,2=>สายงานส่งกลับ,3=ส่งเบิก
 */
$menuStatusHdr = " c_code in ('ST0116' ,'ST0115' ,'ST0114' ,'ST0013' ,'ST0012')";
$menu_code = $data['menu_code'];
$menu_back = $data['menu_back'];
//$f1 = $db->GetDataBySQL("select * from dbo.sp_status_hdr where c_code=? and i_enabled=?", array($menu_code, $i_enabled));
$data['d_send_date'] = date('Y-m-d H:i:s');
$data['d_receive_date'] = $data['d_receive_date'] != null ? ($date->bc_to_ad($data['d_receive_date']) . " 23:59:59") : NULL;
$data['d_act_date'] = date('Y-m-d H:i:s');
$re_id = $data['sp_check_period_hdr_id'];
$paramVal = array();

function RunItem() {
    global $db, $data, $paramVal;
    $paramVal[] = $data['menu_id']; //sp_status_hdr_id
    $paramVal[] = $data['sp_emp_id']; //sp_emp_id
    $paramVal[] = $data['sp_check_period_hdr_id']; //sp_check_period_hdr_id
    $paramVal[] = $data['i_step']; //i_step

    $paramVal[] = $data['d_receive_date']; //d_receive_date
    $paramVal[] = $data['d_receive_date']; //d_doc_date
    $paramVal[] = $data['d_send_date']; //d_send_date

    $paramVal[] = $data['i_is_waiting']; //i_is_waiting
    $paramVal[] = $data['c_comment']; //c_comment
    $paramVal[] = $data['d_act_date']; //d_act_date

    $sql3 = "insert into dbo.sp_withdraw_item ("
            . "sp_status_hdr_id,sp_emp_id,sp_check_period_hdr_id"
            . ",i_step,d_receive_date,d_doc_date,d_send_date,i_is_waiting"
            . ",c_comment,d_act_date)"
            . " values (?,?,?,?,?,?,?,?,?,?)";

    return $db->QueryParam($sql3, $paramVal);
}

$db->BeginTran();

switch ($mode) {
    case "GOTOSTEP": //ไป
        //checking
        //withdraw
//        --------------------------------------
        //$data['i_step'] = 3;
        $data['i_is_waiting'] = 0;
        $stmt = RunItem();
        break;
    case "BACKSTEP": //ถอย
        //checking
        //withdraw
//        --------------------------------------
        $data['i_step'] = 3;
        $data['i_is_waiting'] = 1;
        $stmt = RunItem();
        break;
    case "REVERSESTEP": //กลับไปสถานะเดิม
        //checking
        //withdraw
//        --------------------------------------
        $data['i_step'] = 4;
        $data['i_is_waiting'] = 1;
        $stmt = RunItem();

        break;
}

if ($stmt) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => intVal($re_id));
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
