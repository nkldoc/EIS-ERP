<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

$DATABASE_NAME = ""; //"NMU_ASSET..";
switch ($mode) {

	case "ADD":
	case "EDIT":

		$msg	= "";


		$data["c_name"]               = $_REQUEST["c_name"];
		$data["d_date"]			      = $_REQUEST["d_date"];
		$data["c_comment"]            = $_REQUEST["c_comment"];
		$data["d_update"]             = date("Y-m-d H:i:s");


		if ($mode == "ADD") {

			$data["i_enable"]								= STATUS_ENABLE;
			$data["d_create"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql	= "

			


				SET NOCOUNT ON
				INSERT INTO {$DATABASE_NAME} am_asset_edit_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";

			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			$id		= $ss_id["id"];

			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //

		} else if ($mode == "EDIT") {

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$DATABASE_NAME} am_asset_edit_hdr SET " . substr($addField, 1) . " WHERE am_asset_edit_hdr_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["id"];
		}

		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		if (@$para) {
			$re = array(
				"success"					=> true,
				"id"						=> $id,
				"msg"						=> ""
			);
		} else {
			$re = array(
				"success"					=> false,
				"msg"						=> $msg
			);
		}

		break;

	case "SAVE_DTL":

		$msg = "";
		// $Arr = json_decode($_REQUEST["data"], true);


		if ($msg == "") {

			/**UPDATE AM_MODE**/
			$con_acc = "";
			// $acc_code = explode('-', $fldd["c_code"]);
			// $acc_code = @$acc_code[2];
			// $con_acc = "UPDATE a
			// 		SET a.am_mode_id = b.am_mode_id
			// 			,a.acc_code = b.c_code_ref
			// 			,a.acc_name = b.c_name
			// 		FROM  {$DATABASE_NAME} am_asset_edit_dtl a
			// 		LEFT JOIN NMU_ERP..am_mode_acc b ON '{$acc_code}' = b.c_code_ref
			// 		WHERE am_asset_edit_dtl_id = " . $fldd["am_asset_edit_dtl_id"] > 0 ? $fldd["am_asset_edit_dtl_id"] : "@@IDENTITY";
			$data["am_asset_edit_hdr_id"]         = $_REQUEST["id"];
			$data["am_asset_hdr_id"]          	  = $_REQUEST["am_asset_hdr_id"];
			$data["c_code"]                       = $_REQUEST["txtam_asset_hdr_idID"];
			$data["c_code2"]                      = $_REQUEST["txtam_asset_hdr_idID"];
			$data["asset_name"]                   = $_REQUEST["asset_name"];
			$data["receive_date"]                 = $_REQUEST["receive_date"];
			$data["quantity"]                     = $_REQUEST["quantity"];
			$data["dc_unit_type"]                 = $_REQUEST["dc_unit_type"];
			$data["f_unit_cost"]                  = str_replace(",", "", $_REQUEST["f_unit_cost"]);
			$data["stockpile"]                    = $_REQUEST["stockpile"];
			$data["Segment"]                      = $_REQUEST["Segment"];
			$data["workandproject"]               = $_REQUEST["workandproject"];
			$data["fund"]                         = $_REQUEST["fund"];
			$data["event_id"]                     = $_REQUEST["event_id"];
			$data["i_yyyy"]                       = $_REQUEST["i_yyyy"];
			$data["budget_source"]                = $_REQUEST["budget_source"];
			$data["c_detail"]                     = $_REQUEST["c_detail"];
			$data["c_brand"]                      = $_REQUEST["c_brand"];
			$data["c_model"]                      = $_REQUEST["c_model"];
			$data["c_serial"]                     = $_REQUEST["c_serial"];
			$data["got"]                          = $_REQUEST["got"];
			$data["salvage"]                      = $_REQUEST["salvage"];
			$data["i_period_year"]                = $_REQUEST["i_period_year"];
			$data["c_commet"]                     = $_REQUEST["c_commet"];
			$data["c_codeold2"]                   = $_REQUEST["c_codeold2"];
			$data["c_codeold1"]                   = $_REQUEST["c_codeold1"];
			$data["receipt_number"]               = $_REQUEST["receipt_number"];
			$data["insurance_start"]              = $_REQUEST["insurance_start"];
			$data["insurance_year"]               = $_REQUEST["insurance_year"];
			$data["insurance_month"]              = $_REQUEST["insurance_month"];
			$data["insurance_end"]                = $_REQUEST["insurance_end"];
			$data["insurance_mote"]               = $_REQUEST["insurance_mote"];
			$data["c_location"]                   = $_REQUEST["c_location"];
			$data["insurance_mote"]               = $_REQUEST["insurance_mote"];
			$data["insurance_mote"]               = $_REQUEST["insurance_mote"];
			$data["c_location"]                   = $_REQUEST["c_location"];
			$data["c_code_building"]              = $_REQUEST["c_code_building"];
			$data["car_register"]                 = $_REQUEST["car_register"];
			$data["car_type"]                     = $_REQUEST["car_type"];
			$data["code_caretaker"]               = $_REQUEST["code_caretaker"];
			$data["name_caretaker"]               = $_REQUEST["name_caretaker"];
			$data["image_file"]                   = $_REQUEST["image_file"];
			$data["barcode_status"]               = $_REQUEST["barcode_status"];

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql = "
				SET NOCOUNT ON
				INSERT INTO {$DATABASE_NAME} am_asset_edit_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				{$con_acc}";
			$para	= $db->QueryParam($sql, $arrValue);

			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //
			// }
			//  $sql = "
			// EXEC {$DATABASE_NAME} SP_COPY_IMP_TO_ASSET {$_REQUEST["id"]}";

			//  $para	= $db->QueryParam($sql, array());
			$re	= array("success" => true, "id" => null);
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> $msg
			);
		}
		// =========================================================== //

		break;
	case "DELETE":

		$sql		= "DELETE {$DATABASE_NAME} am_asset_edit_dtl  WHERE am_asset_edit_dtl_id = ?";
		$arrValue[] = $_REQUEST["id"];
		$para		= $db->QueryParam($sql, $arrValue);
		$id			= $_REQUEST["id"];
		$re	= array("success" => true);
		break;
}
echo json_encode($re);
exit;
