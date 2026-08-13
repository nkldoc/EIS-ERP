<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db        = new DatabaseServer();
$date     = new i_date();

$root        = "data";
$data        = array();
$con        = "";

$mode        = $_REQUEST["mode"];
$arrParam    = array();
$addField    = null;
$addValue    = null;
$arrValue    = array();

switch ($mode) {

    case "imp_debtor_charge_dtl":

        $msg = "";
        $scriptAdd = "";
        $scriptEdit = "";

        $json = json_decode($_REQUEST["data"], true);
        if (count($json) > 0) {

            // ============ ลบเฉพาะรายการที่ไม่มี id dtl ============ //
            $strID = "";
            foreach ($json as $ff) {
                if ($ff["dtl_id"] > 0)
                    $strID    .= ", {$ff["dtl_id"]}";
            }
            if ($strID != "") {
                $con = " AND imp_debtor_charge_dtl_id NOT IN (" . substr($strID, 1) . ")";
            }

            $sql = "
                BEGIN TRANSACTION;
                DELETE imp_debtor_charge_dtl WHERE imp_debtor_charge_hdr_id = {$_REQUEST["hdr_id"]} {$con};
                COMMIT;";

            $para = $db->QueryParam($sql, array());

            foreach ($json as $key => $row) {
                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                $data["dc_debtor_type_id"]                  = $row["dc_debtor_type_id"];
                $data["dc_debtor_claim_id"]                 = $row["dc_debtor_claim_id"];
                $data["dc_cost_debtor_id"]                  = $row["dc_cost_debtor_id"];
                $data["dc_user_update_id"]                  = $_SESSION["user_id"];
                $data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
                $data["d_update"]                           = date("Y-m-d H:i:s");

                if ($row["dtl_id"] > 0) { // EDIT
                    foreach ($data as $fld => $value) {
                        $addField .= ($value != "") ? ", {$fld} = '{$value}'" : ", {$fld} = NULL";
                    }

                    $sql = "
                        BEGIN TRANSACTION;
                        UPDATE imp_debtor_charge_dtl SET " . substr($addField, 1) . " WHERE imp_debtor_charge_dtl_id = {$row["dtl_id"]};
                        COMMIT;";

                    $para = $db->QueryParam($sql, array());

                    // ============== //
                    $addField    = null;
                    $addValue    = null;
                    unset($data);
                    unset($arrValue);
                    // ============== //
                } else { // ADD

                    $data["imp_debtor_charge_hdr_id"]               = $_REQUEST["hdr_id"];
                    $data["c_hn"]                                   = $row["c_hn"];
                    $data["c_an"]                                   = $row["c_an"];
                    $data["c_patient"]                              = $row["c_patient"];
                    $data["d_date_service"]                         = $row["d_date_service"];
                    $data["i_date_admission"]                       = $row["i_date_admission"];
                    $data["f_charge"]                               = $row["f_charge"];
                    $data["c_no_charge"]                            = $row["c_no_charge"];
                    $data["d_save_charge"]                          = $row["d_save_charge"];
                    $data["dc_user_create_id"]                      = $_SESSION["user_id"];
                    $data["dc_user_create_cost_id"]                 = $_SESSION["dc_cost_id"];
                    $data["d_create"]                               = date("Y-m-d H:i:s");

                    foreach ($data as $fld => $value) {
                        $addField .= ", {$fld}";
                        $addValue .= ($value != "") ? ", '{$value}'" : ", NULL";
                    }

                    $sql = "
                        BEGIN TRANSACTION;
                        INSERT INTO imp_debtor_charge_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                        COMMIT;";

                    $para = $db->QueryParam($sql, array());

                    // ============== //
                    $addField    = null;
                    $addValue    = null;
                    unset($data);
                    unset($arrValue);
                    // ============== //
                }
            }
        }

        if ($para) {
            $re = array(
                "success"           => true,
                "hdr_id"            => $_REQUEST["hdr_id"],
                "msg"               => $msg
            );
        } else {
            $re = array(
                "success"           => false,
                "hdr_id"            => $_REQUEST["hdr_id"],
                "msg"               => $msg
            );
        }

        break;

    case "ADD":
    case "EDIT":
        $msg    = "";

        if ($msg == "") {

            $data["d_doc_date"]                                 = $_REQUEST["d_doc_date"];
            $data["c_comment"]                                  = $_REQUEST["c_comment"];
            $data["dc_user_update_id"]                          = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"]                     = $_SESSION["dc_cost_id"];
            $data["d_update"]                                   = date("Y-m-d H:i:s");

            if ($mode == "ADD") {

                $data["i_enable"]                               = STATUS_ENABLE;
                $data["dc_user_create_id"]                      = $_SESSION["user_id"];
                $data["dc_user_create_cost_id"]                 = $_SESSION["dc_cost_id"];
                $data["d_create"]                               = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : NULL;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }

                $sql    = "
                    SET NOCOUNT ON
                    INSERT INTO imp_debtor_charge_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT SCOPE_IDENTITY() as id;";

                $para       = $db->QueryParam($sql, $arrValue);
                $ss_id      = $db->Fetch($para);
                $id         = $ss_id["id"];

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

            } else if ($mode == "EDIT") {

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : NULL;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "
                    BEGIN TRANSACTION;
                    UPDATE imp_debtor_charge_hdr SET " . substr($addField, 1) . " WHERE imp_debtor_charge_hdr_id = ?;
                    COMMIT;";
                $para        = $db->QueryParam($sql, $arrValue);
                $id            = $_REQUEST["id"];

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //
            }
        }

        // ============== //
        $addField    = null;
        $addValue    = null;
        unset($data);
        unset($arrValue);
        // ============== //

        if (@$para) {
            $re = array(
                "success"                   => true,
                "id"                        => (@$id > 0) ? $id : $_REQUEST["id"],
                "msg"                       => $msg
            );
        } else {
            $re = array(
                "success"                   => false,
                "id"                        => (@$id > 0) ? $id : $_REQUEST["id"],
                "msg"                       => $msg
            );
        }

        break;

    case "DELETE":

        // $data["i_delete"]                               = 1;
        // $data["dc_user_update_id"]                      = $_SESSION["user_id"];
        // $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
        // $data["d_update"]                               = date("Y-m-d H:i:s");

        // foreach ($data as $fld => $value) {
        //     $arrValue[]    = ($value != "") ? $value : NULL;
        //     $addField    .= ", {$fld} = ?";
        // }

        // $arrValue[] = $_REQUEST["id"];
        // $sql        = "
        //     BEGIN TRANSACTION;
        //     UPDATE dc_cost_debtor SET " . substr($addField, 1) . " WHERE dc_cost_debtor_id = ?;
        //     COMMIT;";
        // $para       = $db->QueryParam($sql, $arrValue);
        // $re = array(
        //     "success"                       => true,
        //     "id"                            => $_REQUEST["id"],
        //     "msg"                           => "ลบรายการเรียบร้อย"
        // );
        break;
}
echo json_encode($re);
exit;
