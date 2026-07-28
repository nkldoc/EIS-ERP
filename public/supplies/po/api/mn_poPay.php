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

    case "SEND_DATA":

        $db->BeginTran();
        $Arr    = json_decode($_REQUEST["data"], true);
        if ($Arr) {
            $msg    = "";
            foreach ($Arr as $id) {
                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                $date_back = $db->GetDataBySQL("SELECT DATEDIFF(DAY, d_doc_date, '{$_REQUEST["d_doc_date"]}') FROM dbo.po_working_item WHERE po_working_hdr_id = {$id} AND i_status = 10;", array());
                if (!$date_back) {
                    $date_back = $db->GetDataBySQL("SELECT DATEDIFF(DAY, d_doc_date, '{$_REQUEST["d_doc_date"]}') FROM dbo.po_working_item WHERE po_working_hdr_id = {$id} AND i_status = 9;", array());
                }
                if ($date_back >= 0) {

                    $po_working_item_id = $db->GetDataBySQL("SELECT po_working_item_id FROM dbo.po_working_item WHERE po_working_hdr_id = {$id} AND i_status = ?;", array(11));

                    $data["d_doc_date"]                                       = $_REQUEST["d_doc_date"];
                    $data["dc_user_update_id"]                                = $_SESSION["user_id"];
                    $data["dc_user_update_cost_id"]                           = $_SESSION["dc_cost_id"];
                    $data["d_update"]                                         = date("Y-m-d H:i:s");

                    // =========================== ITEM =========================== //
                    if ($po_working_item_id > 0) { // EDIT

                        foreach ($data as $fld => $value) {
                            $arrValue[]    = ($value != "") ? $value : null;
                            $addField    .= ", {$fld} = ?";
                        }

                        $arrValue[] = $po_working_item_id;
                        $sql        = "UPDATE po_working_item SET " . substr($addField, 1) . " WHERE po_working_item_id = ?";
                        $para = $db->QueryParam($sql, $arrValue);

                        // ============== //
                        $addField    = null;
                        $addValue    = null;
                        unset($data);
                        unset($arrValue);
                        // ============== //

                        // =========================== UPDATE STATUS DTL =========================== //
                        $data["i_success"]                              = 1;
                        $data["dc_user_update_id"]                      = $_SESSION["user_id"];
                        $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
                        $data["d_update"]                               = date("Y-m-d H:i:s");

                        foreach ($data as $fld => $value) {
                            $arrValue[]    = ($value != "") ? $value : null;
                            $addField    .= ", {$fld} = ?";
                        }

                        $arrValue[] = $id;
                        $sql        = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                        $para        = $db->QueryParam($sql, $arrValue);

                        // ============== //
                        $addField    = null;
                        $addValue    = null;
                        unset($data);
                        unset($arrValue);
                        // ============== //

                        // =========================== UPDATE STATUS HDR =========================== //
                        $data["i_status_last"]                            = 11;
                        $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                        $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                        $data["d_update"]                                 = date("Y-m-d H:i:s");

                        foreach ($data as $fld => $value) {
                            $arrValue[]    = ($value != "") ? $value : null;
                            $addField    .= ", {$fld} = ?";
                        }

                        $arrValue[] = $id;
                        $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                        $db->QueryParam($sql, $arrValue);
                    } else { // ADD

                        $data["po_working_hdr_id"]                      = $id;
                        $data["i_status"]                               = 11;
                        $data["c_status"]                               = $CONF_I_STATUS[11];
                        $data["dc_user_create_id"]                      = $_SESSION["user_id"];
                        $data["dc_user_create_cost_id"]                 = $_SESSION["dc_cost_id"];
                        $data["d_create"]                               = date("Y-m-d H:i:s");

                        foreach ($data as $fld => $value) {
                            $arrValue[] = ($value != "") ? $value : null;
                            $addField .= ", {$fld}";
                            $addValue .= ", ?";
                        }

                        $sql = "INSERT INTO po_working_item (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

                        $db->QueryParam($sql, $arrValue);

                        // ============== //
                        $addField    = null;
                        $addValue    = null;
                        unset($data);
                        unset($arrValue);
                        // ============== //

                        // =========================== UPDATE STATUS DTL =========================== //
                        $data["i_success"]                              = 1;
                        $data["dc_user_update_id"]                      = $_SESSION["user_id"];
                        $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
                        $data["d_update"]                               = date("Y-m-d H:i:s");

                        foreach ($data as $fld => $value) {
                            $arrValue[]    = ($value != "") ? $value : null;
                            $addField    .= ", {$fld} = ?";
                        }

                        $arrValue[] = $id;
                        $sql        = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                        $para        = $db->QueryParam($sql, $arrValue);

                        // ============== //
                        $addField    = null;
                        $addValue    = null;
                        unset($data);
                        unset($arrValue);
                        // ============== //

                        // =========================== UPDATE STATUS HDR =========================== //
                        $data["i_status_last"]                            = 11;
                        $data["c_status_last"]                            = $CONF_I_STATUS[11];
                        $data["dc_user_update_id"]                        = $_SESSION["user_id"];
                        $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
                        $data["d_update"]                                 = date("Y-m-d H:i:s");

                        foreach ($data as $fld => $value) {
                            $arrValue[]    = ($value != "") ? $value : null;
                            $addField    .= ", {$fld} = ?";
                        }

                        $arrValue[] = $id;
                        $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
                        $db->QueryParam($sql, $arrValue);
                    }
                } else {
                    $msg .= "- ไม่สามารถบันทึกวันที่ย้อนหลังได้<br>";
                }
            }
        }
        $db->CommitTran();
        $re = array(
            "success"                    => true,
            "msg"                        => $msg
        );

        break;
}
echo json_encode($re);
exit;
