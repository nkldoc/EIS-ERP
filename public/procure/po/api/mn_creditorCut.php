<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db        = new DatabaseServer();
$date     = new i_date();

$root        = "data";
$data        = array();

$mode        = $_REQUEST["mode"];
$arrParam    = array();
$addField    = null;
$addValue    = null;
$arrValue    = array();

switch ($mode) {

    case "SEND_DATA":

        $db->BeginTran();
        $Arr    = json_decode($_REQUEST["data"], true);
        if ($Arr) {
            foreach ($Arr as $id) {
                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                $data["i_status"]                               = 1;
                $data["d_pay_date"]                             = $_REQUEST["d_pay_date"];
                $data["dc_user_update_id_cheque"]               = $_SESSION["user_id"];
                $data["dc_user_update_cost_id_cheque"]          = $_SESSION["dc_cost_id"];
                $data["d_update_cheque"]                        = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $id;
                $sql        = "UPDATE po_working_cheque SET " . substr($addField, 1) . " WHERE po_working_cheque_id = ?";
                $para       = $db->QueryParam($sql, $arrValue);
            }

            $msg = "บันทึกรายการแล้ว";
        }
        if (@$para) {
            $db->CommitTran();
            $re = array(
                "success"                    => true,
                "msg"                        => $msg
            );
        } else {
            $db->RollBackTran();
            $re = array(
                "success"                    => false,
                "msg"                        => $msg
            );
        }

        break;

    case "RESET_CHEQUE":

        $db->BeginTran();

        $data["i_status"]                                   = "0";
        $data["d_pay_date"]                                 = null;
        $data["dc_user_update_id_cheque"]                   = $_SESSION["user_id"];
        $data["dc_user_update_cost_id_cheque"]              = $_SESSION["dc_cost_id"];
        $data["d_update_cheque"]                            = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $arrValue[]    = ($value != "") ? $value : null;
            $addField    .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $sql = "UPDATE po_working_cheque SET " . substr($addField, 1) . " WHERE po_working_cheque_id = ?";
        $para = $db->QueryParam($sql, $arrValue);
        $db->CommitTran();
        $re = array(
            "success"        => true,
            "msg"            => "แก้ไขรายการเรียบร้อย"
        );

        break;

    case "SAVE_COMMENT":

        $db->BeginTran();

        $data["c_comment"]                                  = $_REQUEST["c_comment"];
        $data["dc_user_update_id_cheque"]                   = $_SESSION["user_id"];
        $data["dc_user_update_cost_id_cheque"]              = $_SESSION["dc_cost_id"];
        $data["d_update_cheque"]                            = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $arrValue[]    = ($value != "") ? $value : null;
            $addField    .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $sql = "UPDATE po_working_cheque SET " . substr($addField, 1) . " WHERE po_working_cheque_id = ?";
        $para = $db->QueryParam($sql, $arrValue);
        $db->CommitTran();
        $re = array(
            "success"        => true,
            "msg"            => "แก้ไขรายการเรียบร้อย"
        );

        break;
}
echo json_encode($re);
exit;
