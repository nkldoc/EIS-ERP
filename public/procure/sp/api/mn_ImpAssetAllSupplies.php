<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();

$mode = $_REQUEST["mode"];
$arrParam = array();
$addField = null;
$addValue = null;
$arrValue = array();

$DATABASE_NAME = ""; //"NMU_ASSET..";
switch ($mode) {

    case "ADD":
    case "EDIT":

        $msg = "";

        $data["sp_check_period_hdr_id"] = $_REQUEST["sp_check_period_hdr_id"]??null;
        $data["c_name"] = $_REQUEST["c_name"];
        $data["c_comment"] = $_REQUEST["c_comment"];
        $data["d_update"] = date("Y-m-d H:i:s");

        if ($mode == "ADD") {

            $data["i_enable"] = STATUS_ENABLE;
            $data["d_create"] = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }

            $sql = " 
				SET NOCOUNT ON
				INSERT INTO {$DATABASE_NAME} imp_assetall_supplies_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";

            $para = $db->QueryParam($sql, $arrValue);
            $ss_id = $db->Fetch($para);
            $id = $ss_id["id"];

            // ============== //
            $addField = null;
            $addValue = null;
            unset($data);
            unset($arrValue);
            // ============== //
        } else if ($mode == "EDIT") {

            foreach ($data as $fld => $value) {
                $arrValue[] = ($value != "") ? $value : null;
                $addField .= ", {$fld} = ?";
            }

            $arrValue[] = $_REQUEST["id"];
            $sql = "UPDATE {$DATABASE_NAME} imp_assetall_supplies_hdr SET " . substr($addField, 1) . " WHERE imp_assetall_supplies_hdr_id = ?";
            $para = $db->QueryParam($sql, $arrValue);
            $id = $_REQUEST["id"];
        }

        // ============== //
        $addField = null;
        $addValue = null;
        unset($data);
        unset($arrValue);
        // ============== //

        if (@$para) {
            $re = array(
                "success" => true,
                "id" => $id,
                "msg" => ""
            );
        } else {
            $re = array(
                "success" => false,
                "msg" => $msg
            );
        }

        break;

    case "SAVE_DTL":

        $msg = "";
        $Arr = json_decode($_REQUEST["data"], true);
        // print_r($Arr);
        // exit;

        if ($_REQUEST["i_import_excel"] == "true") {
            $db->QueryParam("DELETE {$DATABASE_NAME} imp_assetall_supplies_dtl WHERE imp_assetall_supplies_hdr_id = ?", array($_REQUEST["id"]));
        }

        if ($msg == "") {
            foreach ($Arr as $fldd) {

                /*                 * UPDATE AM_MODE* */
                $con_acc = "";
                $acc_code = explode('-', $fldd["c_code"]);
                $acc_code = @$acc_code[2];
                // $con_acc = "UPDATE a
                // 		SET a.am_mode_id = b.am_mode_id
                // 			,a.acc_code = b.c_code_ref
                // 			,a.acc_name = b.c_name
                // 		FROM  {$DATABASE_NAME} imp_assetall_dtl a
                // 		LEFT JOIN NMU_ERP..am_mode_acc b ON '{$acc_code}' = b.c_code_ref
                // 		WHERE imp_assetall_dtl_id = " . $fldd["imp_assetall_dtl_id"] > 0 ? $fldd["imp_assetall_dtl_id"] : "@@IDENTITY";

                $data["c_code"] = $fldd["c_code"];
                $data["c_code2"] = $fldd["c_code"];
                $data["asset_name"] = $fldd["asset_name"];
                $data["receive_date"] = $fldd["receive_date"];
                $data["quantity"] = $fldd["quantity"];
                $data["dc_unit_type"] = $fldd["dc_unit_type"];
                $data["f_unit_cost"] = $fldd["f_unit_cost"];
                $data["stockpile"] = $fldd["stockpile"];
                $data["Segment"] = $fldd["Segment"];
                $data["workandproject"] = $fldd["workandproject"];
                $data["fund"] = $fldd["fund"];
                $data["event_id"] = $fldd["event_id"];
                $data["i_yyyy"] = $fldd["i_yyyy"];
                $data["budget_source"] = $fldd["budget_source"];
                $data["c_detail"] = $fldd["c_detail"];
                $data["c_brand"] = $fldd["c_brand"];
                $data["c_model"] = $fldd["c_model"];
                $data["c_serial"] = $fldd["c_serial"];
                $data["got"] = $fldd["got"];
                $data["salvage"] = $fldd["salvage"];
                $data["i_period_year"] = $fldd["i_period_year"];
                $data["c_commet"] = $fldd["c_commet"];
                $data["c_codeold2"] = $fldd["c_codeold2"];
                $data["c_codeold1"] = $fldd["c_codeold1"];
                $data["receipt_number"] = $fldd["receipt_number"];
                $data["insurance_start"] = $fldd["insurance_start"];
                $data["insurance_year"] = $fldd["insurance_year"];
                $data["insurance_month"] = $fldd["insurance_month"];
                $data["insurance_end"] = $fldd["insurance_end"];
                $data["insurance_mote"] = $fldd["insurance_mote"];
                $data["c_location"] = $fldd["c_location"];
                $data["insurance_mote"] = $fldd["insurance_mote"];
                $data["insurance_mote"] = $fldd["insurance_mote"];
                $data["c_location"] = $fldd["c_location"];
                $data["c_code_building"] = $fldd["c_code_building"];
                $data["car_register"] = $fldd["car_register"];
                $data["car_type"] = $fldd["car_type"];
                $data["code_caretaker"] = $fldd["code_caretaker"];
                $data["name_caretaker"] = $fldd["name_caretaker"];
                $data["image_file"] = $fldd["image_file"];
                $data["barcode_status"] = $fldd["barcode_status"];
                if ($fldd["imp_assetall_dtl_id"] > 0) { // EDIT
                    foreach ($data as $fldA => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fldA} = ?";
                    }
                    $arrValue[] = $fldd["imp_assetall_dtl_id"];
                    $sql = "UPDATE {$DATABASE_NAME} imp_assetall_supplies_dtl SET " . substr($addField, 1) . " WHERE imp_assetall_supplies_dtl_id = ?;
						{$con_acc}";
                    //echo  $sql ; exit;
                    $db->QueryParam($sql, $arrValue);
                } else { // ADD
                    $data["imp_assetall_supplies_hdr_id"] = $_REQUEST["id"];
                    foreach ($data as $fld => $value) {
                        $arrValue[] = ($value != "") ? $value : null;
                        $addField .= ", {$fld}";
                        $addValue .= ", ?";
                    }

                    $sql = "
						SET NOCOUNT ON
						INSERT INTO {$DATABASE_NAME} imp_assetall_supplies_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						{$con_acc}";
                    $para = $db->QueryParam($sql, $arrValue);
                }
                // ============== //
                $addField = null;
                $addValue = null;
                unset($data);
                unset($arrValue);
                // ============== //
            }
            // $sql = "
            // EXEC {$DATABASE_NAME} SP_COPY_IMP_TO_ASSET {$_REQUEST["id"]}";
            // $para	= $db->QueryParam($sql, $arrValue);
            $re = array("success" => true, "id" => $_REQUEST["id"]);
        } else {
            $re = array(
                "success" => false,
                "msg" => $msg
            );
        }
        // =========================================================== //

        break;
}
echo json_encode($re);
exit;
