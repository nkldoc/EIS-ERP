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

    case "dc_debtor_type":

        $msg = "";

        $json = json_decode($_REQUEST["data"], true);
        if (count($json) > 0) {
            foreach ($json as $index => $obj) {
                $chk_id = $db->GetDataBySQL("
                    SELECT
                        a.dc_debtor_type_id
                    FROM dbo.dc_debtor_type a
                    WHERE a.i_enable = 1
                        AND a.c_name = ?;", array($obj["c_name"]));
                if (empty($chk_id)) {

                    // ============== //
                    $addField    = null;
                    $addValue    = null;
                    unset($data);
                    unset($arrValue);
                    // ============== //

                    $data["c_name"]                                     = $obj["c_name"];
                    $data["c_comment"]                                  = "โหลดข้อมูลจากระบบ";
                    $data["i_enable"]                                   = 1;
                    $data["i_delete"]                                   = 2;
                    $data["dc_user_create_id"]                          = $_SESSION["user_id"];
                    $data["dc_user_create_cost_id"]                     = $_SESSION["dc_cost_id"];
                    $data["d_create"]                                   = date("Y-m-d H:i:s");
                    $data["dc_user_update_id"]                          = $_SESSION["user_id"];
                    $data["dc_user_update_cost_id"]                     = $_SESSION["dc_cost_id"];
                    $data["d_update"]                                   = date("Y-m-d H:i:s");

                    foreach ($data as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : NULL;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }

                    $sql    = "
                        SET NOCOUNT ON
                        INSERT INTO dc_debtor_type (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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

                    $arrValue[]    = "DTT";
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
                            UPDATE dc_debtor_type SET " . substr($addField, 1) . " WHERE dc_debtor_type_id = ?;
                            COMMIT;";
                        $para = $db->QueryParam($sql, $arrValue);
                    } else {
                        $msg = "ข้อมูลไม่ถูกต้อง SQL : SP_GEN_CODE";
                    }
                }
            }
            $re = array(
                "success"           => true,
                "msg"               => $msg
            );
        } else {
            $re = array(
                "success"           => false,
                "msg"               => "ไม่มีรายการที่บันทึก"
            );
        }

        break;

    case "dc_debtor_claim":

        $msg = "";

        $json = json_decode($_REQUEST["data"], true);
        if (count($json) > 0) {
            foreach ($json as $index => $obj) {
                $chk_id = $db->GetDataBySQL("
                SELECT
                    a.dc_debtor_claim_id
                FROM dbo.dc_debtor_claim a
                WHERE a.i_enable = 1
                    AND a.c_name = ?;", array($obj["c_name"]));
                if (empty($chk_id)) {

                    // ============== //
                    $addField    = null;
                    $addValue    = null;
                    unset($data);
                    unset($arrValue);
                    // ============== //

                    $data["c_name"]                                     = $obj["c_name"];
                    $data["i_fund"]                                     = $obj["i_fund"];
                    $data["c_comment"]                                  = "โหลดข้อมูลจากระบบ";
                    $data["i_enable"]                                   = 1;
                    $data["i_delete"]                                   = 2;
                    $data["dc_user_create_id"]                          = $_SESSION["user_id"];
                    $data["dc_user_create_cost_id"]                     = $_SESSION["dc_cost_id"];
                    $data["d_create"]                                   = date("Y-m-d H:i:s");
                    $data["dc_user_update_id"]                          = $_SESSION["user_id"];
                    $data["dc_user_update_cost_id"]                     = $_SESSION["dc_cost_id"];
                    $data["d_update"]                                   = date("Y-m-d H:i:s");

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
                }
            }
            $re = array(
                "success"           => true,
                "msg"               => $msg
            );
        } else {
            $re = array(
                "success"           => false,
                "msg"               => "ไม่มีรายการที่บันทึก"
            );
        }

        break;

    case "dc_cost_debtor":

        $msg = "";

        $json = json_decode($_REQUEST["data"], true);
        if (count($json) > 0) {
            foreach ($json as $index => $obj) {
                $chk_id = $db->GetDataBySQL("
                    SELECT
                        a.dc_cost_debtor_id
                    FROM dbo.dc_cost_debtor a
                    WHERE a.i_enable = 1
                        AND a.c_name = ?;", array($obj["c_name"]));
                if (empty($chk_id)) {

                    // ============== //
                    $addField    = null;
                    $addValue    = null;
                    unset($data);
                    unset($arrValue);
                    // ============== //

                    $data["c_name"]                                     = $obj["c_name"];
                    $data["c_comment"]                                  = "โหลดข้อมูลจากระบบ";
                    $data["i_enable"]                                   = 1;
                    $data["i_delete"]                                   = 2;
                    $data["dc_user_create_id"]                          = $_SESSION["user_id"];
                    $data["dc_user_create_cost_id"]                     = $_SESSION["dc_cost_id"];
                    $data["d_create"]                                   = date("Y-m-d H:i:s");
                    $data["dc_user_update_id"]                          = $_SESSION["user_id"];
                    $data["dc_user_update_cost_id"]                     = $_SESSION["dc_cost_id"];
                    $data["d_update"]                                   = date("Y-m-d H:i:s");

                    foreach ($data as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : NULL;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }

                    $sql    = "
                        SET NOCOUNT ON
                        INSERT INTO dc_cost_debtor (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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

                    $arrValue[]    = "DCD";
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
                            UPDATE dc_cost_debtor SET " . substr($addField, 1) . " WHERE dc_cost_debtor_id = ?;
                            COMMIT;";
                        $para = $db->QueryParam($sql, $arrValue);
                    } else {
                        $msg = "ข้อมูลไม่ถูกต้อง SQL : SP_GEN_CODE";
                    }
                }
            }
            $re = array(
                "success"           => true,
                "msg"               => $msg
            );
        } else {
            $re = array(
                "success"           => false,
                "msg"               => "ไม่มีรายการที่บันทึก"
            );
        }

        break;
}
echo json_encode($re);
exit;
