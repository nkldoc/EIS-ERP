<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");



$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$table = "dbo.sp_check_period_hdr";
$keyName = "sp_check_period_hdr_id";

$mode = $_REQUEST["mode"] ?? null;

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$db->BeginTran();
$ret_id = $_REQUEST["sp_check_period_hdr_id"] ?? null;
 


//$arrParam[] = $data['yearTxt']; //i_yyyy_overlap
//$arrParam[] = $data['txtbg_budget_dtl_overlap_idID']; //c_overlap
//$arrParam[] = $data['i_overlap']; //ก่อนจอง 2 จองแล้ว
//$arrParam[] = $data['bg_budget_dtl_overlap_id']; //bg_reserve_overlap_id bg_budget_dtl_overlap_id
//$arrParam[] = $data['dc_user_update_id'];
//$arrParam[] = $data['dc_user_update_cost_id'];
//$arrParam[] = $data['d_update'];
//$arrParam[] = $ret_id;
/*	UPDATE dbo.sp_tor_contract SET i_yyyy_overlap = null
								, c_overlap = null
								, i_overlap = null
								, bg_reserve_overlap_id = null 
						WHERE sp_tor_contract_id =402
 */
switch($mode){
    case "UPDATEIOVER1": 
        $arrParam[] = $data['yearTxt']-543; //i_yyyy_overlap
        $arrParam[] = $data['txtbg_budget_dtl_overlap_idID']; //c_overlap
        $arrParam[] = $data['i_overlap']; //ก่อนจอง 2 จองแล้ว
        $arrParam[] = $data['bg_budget_dtl_overlap_id']; //bg_reserve_overlap_id bg_budget_dtl_overlap_id
        $arrParam[] = $data['dc_user_update_id'];
        $arrParam[] = $data['dc_user_update_cost_id'];
        $arrParam[] = $data['d_update'];
        $arrParam[] = $ret_id;
        $sql = "UPDATE {$table} SET i_yyyy_overlap = ?
                            , c_overlap = ?
                            , i_overlap = ?
                            , bg_budget_dtl_overlap_id = ?
                            , dc_user_update_id = ?
                            , dc_user_update_cost_id = ?
                            , d_update = ?
                    WHERE {$keyName} = ?"; 
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    
    case "UPDATEIOVER2": 
            $arrParam[] = 2; //ก่อนจอง 2 จองแล้ว
            $arrParam[] = $data['bg_budget_dtl_overlap_id']; //bg_reserve_overlap_id bg_budget_dtl_overlap_id
            $arrParam[] = $data['dc_user_update_id'];
            $arrParam[] = $data['dc_user_update_cost_id'];
            $arrParam[] = $data['d_update'];
            $arrParam[] = $ret_id;
            $sql = "UPDATE {$table} SET i_overlap = ?
                            , bg_reserve_overlap_id = ?
                            , dc_user_update_id = ?
                            , dc_user_update_cost_id = ?
                            , d_update = ?
                    WHERE {$keyName} = ?"; 
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    
    
}


if ($stmt && $stmt2 && $stmt3 && $stmt4) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $ret_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
