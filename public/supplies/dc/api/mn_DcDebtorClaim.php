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

    case "ADD":
    case "EDIT":
        $msg    = "";

        if ($msg == "") {

            $data["c_name"]                                     = $_REQUEST["c_name"];
            $data["i_fund"]                                     = $_REQUEST["i_fund"];
            $data["c_comment"]                                  = $_REQUEST["c_comment"];
            $data["i_enable"]                                   = $_REQUEST["i_enable"];
            $data["dc_user_update_id"]                          = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"]                     = $_SESSION["dc_cost_id"];
            $data["d_update"]                                   = date("Y-m-d H:i:s");

            if ($mode == "ADD") {

                $data["i_delete"]                               = 2;
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
                    INSERT INTO dc_debtor_claim (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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

                // ====================== GEN CODE ====================== //
                list($yyyy, $mm) =  explode("-", date("Y-m-d"));
                $sql        = "EXEC SP_GEN_CODE_DC ?,?,?,?;";

                $arrValue[]    = "DTC";
                $arrValue[]    = $_SESSION["user_id"];
                $arrValue[]    = $_SESSION["dc_cost_id"];
                $arrValue[]    = $id;

                $gen_code    = $db->GetDataBySQL($sql, $arrValue);

                // ============== //
                $addField    = null;
                $addValue    = null;
                unset($data);
                unset($arrValue);
                // ============== //

                if ($id == $gen_code["reference_id"]) {
                    $data["c_code"]                                 = $gen_code["c_code_gen"];
                    $data["dc_user_update_id"]                      = $_SESSION["user_id"];
                    $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
                    $data["d_update"]                               = date("Y-m-d H:i:s");

                    foreach ($data as $fld => $value) {
                        $arrValue[]    = ($value != "") ? $value : NULL;
                        $addField    .= ", {$fld} = ?";
                    }

                    $arrValue[] = $id;
                    $sql        = "
                        BEGIN TRANSACTION;
                        UPDATE dc_debtor_claim SET " . substr($addField, 1) . " WHERE dc_debtor_claim_id = ?;
                        COMMIT;";
                    $para = $db->QueryParam($sql, $arrValue);
                } else {
                    $msg = "ข้อมูลไม่ถูกต้อง SQL : SP_GEN_CODE";
                }
            } else if ($mode == "EDIT") {

                foreach ($data as $fld => $value) {
                    $arrValue[]    = ($value != "") ? $value : NULL;
                    $addField    .= ", {$fld} = ?";
                }

                $arrValue[] = $_REQUEST["id"];
                $sql        = "UPDATE dc_debtor_claim SET " . substr($addField, 1) . " WHERE dc_debtor_claim_id = ?";
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

        $data["i_delete"]                               = 1;
        $data["dc_user_update_id"]                      = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]                 = $_SESSION["dc_cost_id"];
        $data["d_update"]                               = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $arrValue[]    = ($value != "") ? $value : NULL;
            $addField    .= ", {$fld} = ?";
        }

        $arrValue[] = $_REQUEST["id"];
        $sql        = "
            BEGIN TRANSACTION;    
            UPDATE dc_debtor_claim SET " . substr($addField, 1) . " WHERE dc_debtor_claim_id = ?;
            COMMIT;";
        $para       = $db->QueryParam($sql, $arrValue);
        $re = array(
            "success"                       => true,
            "id"                            => $_REQUEST["id"],
            "msg"                           => "ลบรายการเรียบร้อย"
        );
        break;
}
echo json_encode($re);
exit;
