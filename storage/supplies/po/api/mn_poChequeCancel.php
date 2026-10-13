<?php
include("../conf/configPo.php");
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

    case "DELETE_CHEQUE":

        $db->BeginTran();

        if ($_REQUEST["i_status"] == 0) {
            $db->QueryParam("DELETE po_working_cheque WHERE po_working_cheque_id = ?;", array($_REQUEST["id"]));
            $re = array(
                "success"        => true,
                "msg"            => "ลบรายการเรียบร้อย"
            );
        } else {
            $data["i_status"]                           = 2;
            $data["dc_user_update_id"]                  = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
            $data["d_update"]                           = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ", {$fld} = ?";
            }

            $arrValue[] = $_REQUEST["id"];
            $sql = "UPDATE po_working_cheque SET " . substr($addField, 1) . " WHERE po_working_cheque_id = ?";
            $para = $db->QueryParam($sql, $arrValue);
            $re = array(
                "success"        => true,
                "msg"            => "แก้ไขรายการเรียบร้อย"
            );
        }
        $db->CommitTran();

        break;
}
echo json_encode($re);
exit;
