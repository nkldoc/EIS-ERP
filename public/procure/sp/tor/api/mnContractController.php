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
$table = "dbo.sp_tor_contract";
$keyName = "sp_tor_contract_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "CHK"; //contract sign
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;
$db->BeginTran();

switch ($mode) {
    case "UPDATENOMIS" :

        $data['sp_tor_contract_id'] = $_REQUEST["id"] ?? null;
        $data['c_checking_code'] = $_REQUEST['c_doc_code'] ?? NULL;
        $arrParam = array($data['i_is_complete'], $data['i_is_close'], $data['close_detail']
            , $data['dc_user_update_id'], $data['dc_user_update_cost_id'], $data['d_update']
            , $data['sp_tor_contract_id']
        );

        print_r($data);
        exit();
        $sql = "UPDATE dbo.sp_check_period_hdr set c_checking_code = ? ,"
                . " dc_user_update_id = ?,dc_user_update_cost_id = ?,"
                . " d_update = ? "
                . "where sp_check_period_hdr_id = ? ;";

        $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "UPDATESTATUSCONTRACT":

        $data['sp_tor_contract_id'] = $_REQUEST["id"] ?? null;
        $id = $_REQUEST["id"] ?? null;
        $data['i_is_complete'] = $_REQUEST['i_is_complete'] ?? NULL;
        //$data['i_contract_status'] = 2; //ปิดสัญญา
        if ($data['i_is_complete'] == 1 && $data["i_is_close"] == 0) {
            $data['i_contract_status'] = 33; //ส่งของครบ
        }
        if ($data["i_is_close"] == 1) {

            $data['i_contract_status'] = 4; //ปิดสัญญา
        }



        $sql2 = "
                UPDATE dbo.sp_tor_contract
                SET  i_contract_status = ?
                , i_is_close = ?
                , d_update = GETDATE()
                WHERE sp_tor_contract_id = ?;
                DECLARE @sp_tor_contract_id int;
                SET @sp_tor_contract_id = ?
                SET NOCOUNT ON
                INSERT INTO sp_tor_item ( sp_status_hdr_id
                    ,contract_id
                    ,tor_id
                    ,i_contract_status
                    ,d_contract_before_status_date
                    ,d_contract_status_date
                    ,act_date_dt
                ) VALUES (0,
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
                );";

//        $arrParam = array($data['i_is_complete'], $data['i_is_close'], $data['close_detail']
//                        , $data['dc_user_update_id'], $data['dc_user_update_cost_id'], $data['d_update']
//            , $data['sp_tor_contract_id']
//        );
//        $sql = "UPDATE {$table} set i_contract_status = ?"
//                . " i_is_complete = ?, i_is_close = ?,close_detail = ?,"
//                . " dc_user_update_id = ?,dc_user_update_cost_id = ?,"
//                . " d_update = ? "
//                . "where {$keyName} = ? ;";
//        $stmt = $db->QueryParam($sql, $arrParam);
        $stmt2 = $db->QueryParam($sql2, array($data['i_is_close'], $data['i_contract_status'], $id, $id));
        break;
}

if ($stmt2) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $data['sp_tor_contract_id']);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
