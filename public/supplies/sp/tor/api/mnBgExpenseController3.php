<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");



$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$table = "dbo.sp_tor_contract";
$keyName = "sp_tor_contract_id";

$mode = $_REQUEST["mode"] ?? null;

$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$db->BeginTran();
$ret_id = $_REQUEST["sp_tor_contract_id"] ?? null;
 


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
            $firstCode = trim($data['txtbg_budget_dtl_overlap_idID'] ?? '');
            $secondCode = trim($data['txtbg_budget_dtl_overlap_id2ID'] ?? '');
            if ($firstCode === '' || $secondCode === '' || $firstCode === $secondCode) {
                $stmt = false;
                $sql = 'Select two different overlap documents';
                break;
            }
            $arrParam = array(
                $data['yearTxt'] - 543,
                $firstCode,
                $data['bg_budget_dtl_overlap_id'],
                $secondCode,
                $data['i_yyyy_overlap2'] ?? null,
                $data['dc_user_update_id'],
                $data['dc_user_update_cost_id'],
                $data['d_update'],
                $firstCode,
                $secondCode,
                $ret_id
            );
            $sql = "IF EXISTS (SELECT 1 FROM NMU_EIS.dbo.bg_overlap_hdr WHERE c_code = ?)
                    AND EXISTS (SELECT 1 FROM NMU_EIS.dbo.bg_overlap_hdr WHERE c_code = ?)
                    UPDATE c SET i_overlap = 2
                            , i_status_overlap = 1
                            , i_yyyy_overlap = ?
                            , c_overlap = ?
                            , bg_budget_dtl_overlap_id = ?
                            , c_overlap2 = ?
                            , i_yyyy_overlap2 = ?
                            , bg_reserve_overlap_id = second_hdr.bg_overlap_hdr_id
                            , dc_user_update_id = ?
                            , dc_user_update_cost_id = ?
                            , d_update = ?
                    FROM {$table} c
                    INNER JOIN NMU_EIS.dbo.bg_overlap_hdr first_hdr ON first_hdr.c_code = ?
                    INNER JOIN NMU_EIS.dbo.bg_overlap_hdr second_hdr ON second_hdr.c_code = ?
                    WHERE c.{$keyName} = ?
                    ELSE RAISERROR('Overlap document code was not found', 16, 1)";
        $stmt = $db->QueryParam($sql, array_merge(array($firstCode, $secondCode), $arrParam));
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
