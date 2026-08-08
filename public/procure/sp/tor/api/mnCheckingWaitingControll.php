<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
include("../../conf/configSp.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"];
$table = "dbo.sp_tor";
$keyName = "tor_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "TOR";
$re_id = null;
$stmt2 = true;
$stmt3 = true;

//
//End fn updateStaus
$db->BeginTran();
$d_tor_date = $data['d_tor_date'] ?? null;
$data['d_tor_date'] = !empty($d_tor_date) ? $date->bc_to_ad($data['d_tor_date']) : null;
$f_total_amt = !empty($data["f_total_amt"]) ? str_replace(',', '', $data["f_total_amt"]) : 0; //str_replace(',', '', $data[$value]);
$data['dc_cost_id'] = $data['dc_cost_id'] ?? 38;
$data["c_comment"] = $data["c_comment"] ?? NULL;
switch ($mode) {

    case "WAITING":
//        print_r($_REQUEST);
//        exit;

        $ret_id = $data["id"];
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
//Waing
        $i_status_checking = 3;
        $i_some = 0;
        if ($data["i_status_checking"] == 0) { // รอการตรวจสอบ
            $i_status_checking = 0;
            $i_some = 0;
            $data["f_fine_amt"] = 0;
            $data["i_is_fine"] = 0;
        } else if ($data["i_status_checking"] == 1) { // ผ่าน แบบปกติ
            $i_status_checking = 1;
            $i_some = 0;
        } else if ($data["i_status_checking"] == 2) { // ผ่าน แบบบางส่วน
            $i_status_checking = 1;
            $i_some = 1;
        } else if ($data["i_status_checking"] == 3) { // ผ่าน แบบของทดแทน(เต็มจำนวนเงิน)
            $i_status_checking = 1;
            $i_some = 2;
        } else if ($data["i_status_checking"] == 4) { // ไม่ผ่าน
            $i_status_checking = 2;
            $i_some = 0;
        }

        $arrParam = array();
        $arrParam[] = $data["c_checking_code"];
        $arrParam[] = $date->bc_to_ad($data['d_checking_date']);
        //$arrParam[] = $date->bc_to_ad($data['d_checking_date']);
        $arrParam[] = $i_status_checking; //ตรวจสอบแล้ว
        $arrParam[]  = $data["i_is_fine"];
        $arrParam[]  = !empty($data["f_fine_amt"]) ? str_replace(',', '', $data["f_fine_amt"]) : 0;

        $arrParam[] = $i_some; //ตรวจสอบแล้ว
        $arrParam[] = $data["c_reason"];
        $arrParam[] = $data["i_notif_day"];
        $arrParam[] = $data["warraty_age"];
        $arrParam[] = $date->bc_to_ad($data["i_warraty_end"]); // add - i_notif_day = notif_day

        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];


        $arrParam[] = null; //c_arrival_code
        $arrParam[] = null; // $date->bc_to_ad($data['d_arrival_date']);
        $arrParam[] = $data["c_checking_code"];
        $arrParam[] = $date->bc_to_ad($data['d_checking_date']);
        $arrParam[] = $data["id"];
/*$CONF_CONTRACT_STATUS = array( 0 => 'เริ่มทำสัญญา',
    1 => 'จัดทำ/ร่าง สัญญา',
    2 => 'ลงนามในสัญญาหรือข้อตกลงเป็นหนังสือ',
    3 => 'บันทึกใบ PO (สัญญาย่อย)',
    4 => 'ลงนามในสัญญา PO (สัญญาย่อย)',
    5 => "ส่งมอบงาน",
    6 => "ตรวจรับพัสดุ/ครุภัณฑ์",
    7 => "รอเงินงบประมาณที่มีอยู่จริง/ตรวจรับพัสดุ/ครุภัณฑ์",
    8 => "บันทึกใบขอเบิก",
    10 => "ยกเลิก"
);*/
        $i_contract_status = CHECKING_WAITING_BG; //รอเงินงบประมาณที่มีอยู่จริง/ตรวจรับพัสดุ/ครุภัณฑ์



        $sql = " UPDATE dbo.sp_check_period_hdr SET "
                    . " i_is_waiting =1"
                    . " , c_checking_code =?"
                    . " , d_checking_date=?"
                    . " , i_status_checking=?, i_is_fine=?, f_fine_amt=?, i_some=?, c_reason = ?"
                    . " , i_before=?"
                    . " , i_warranty_age=?"
                    . " , d_warranty_date=?"
                    . " , dc_user_update_id=?"
                    . " , dc_user_update_cost_id=?"
                    . " , d_update=?"
                    . "  WHERE sp_check_period_hdr_id = ?;"
             . " UPDATE dbo.sp_tranf_hdr SET "
                    . " c_arrival_code=?,d_arrival_date=?,c_checking_code=?, d_checking_date=? WHERE sp_check_period_hdr_id = ?;";

        $stmt  = $db->QueryParam($sql, $arrParam);
        $stmt2 = $db->QueryParam("update dbo.sp_tor_contract set i_contract_status= ? where sp_tor_contract_id = (select top 1 a.sp_tor_contract_id from sp_tor_contract a
						inner join sp_tor_hdr_period b on b.sp_tor_contract_id=a.sp_tor_contract_id
                                                WHERE b.sp_tor_hdr_period_id = ?)", array($i_contract_status,$_POST['sp_tor_hdr_period_id']??null));

//        print_r($stmt2); exit;

        if ($data["i_status_checking"] == 2) {

            $sql2 = "Declare @idx as bigint;
                                set @idx = ?;
                                delete from dbo.sp_tranf_hdr where sp_tranf_hdr_id 		= @idx;
                                delete from dbo.sp_tranf_item where sp_tranf_hdr_id 		= @idx;
                    ";
            $arrParam2 = array($data['sp_tranf_hdr_id']);
            $stmt2 = $db->QueryParam($sql2, $arrParam2);
            //$stmt2 = false;
        }else if($data["i_status_checking"] == 0){

        }
        if ($data["i_is_fine"] == 1) {
            $addField = '';
            $dataField["i_fine"] = 1;
            $dataField["f_fine_amt"] = str_replace(',', '', $data["f_fine_amt"]);
            foreach ($dataField as $fldA => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fldA} = ?";
            }
            $arrValue[] = $_REQUEST["sp_tor_hdr_period_id"];
            $sql = "UPDATE sp_tor_hdr_period SET " . substr($addField, 1) . " WHERE sp_tor_hdr_period_id = ?";
            $stmt = $db->QueryParam($sql, $arrValue);
        }
        break;
}

if ($stmt && $stmt2) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "sp_tranf_hdr_id" => intVal($ret_id));
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
//LIST_PERIOD_HDR