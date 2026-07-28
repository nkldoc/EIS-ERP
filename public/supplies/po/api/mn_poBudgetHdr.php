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

switch ($mode) {

	case "ADD":
	case "EDIT":

		$msg	= "";

		$data["i_year"]									= $_REQUEST["i_year"];
		$data["dc_expense_budget_type_id"]				= $_REQUEST["dc_expense_budget_type_id"];
		$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		if ($mode == "ADD") {

			$data["i_enable"]								= STATUS_ENABLE;
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql	= "
				SET NOCOUNT ON
				INSERT INTO po_budget_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			$sql		= "UPDATE po_budget_hdr SET " . substr($addField, 1) . " WHERE po_budget_hdr_id = ?";
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
		$Arr = json_decode($_REQUEST["data"], true);

		if ($msg == "") {
			foreach ($Arr as $fldd) {

				$data["po_expense_id"]									= $fldd["po_expense_id"];
				$data["f_total"]										= $fldd["f_total"];
				$data["c_comment"]										= $fldd["c_comment"];
				$data["dc_user_update_id"]								= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
				$data["d_update"]										= date("Y-m-d H:i:s");

				if ($fldd["po_budget_dtl_id"] > 0) { // EDIT

					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fldd["po_budget_dtl_id"];
					$sql		= "UPDATE po_budget_dtl SET " . substr($addField, 1) . " WHERE po_budget_dtl_id = ?";
					$db->QueryParam($sql, $arrValue);
				} else { // ADD

					$data["po_budget_hdr_id"]						= $_REQUEST["id"];
					$data["dc_user_create_id"]								= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_create"]										= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "
						SET NOCOUNT ON
						INSERT INTO po_budget_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
				}

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
			}

			$re	= array("success" => true, "id" => $_REQUEST["id"]);
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> $msg
			);
		}
		// =========================================================== //

		break;

		// 	case "DELETE":

		// 		$c_code	= $db->GetDataBySQL("SELECT c_code FROM {$table} WHERE {$key_id}=?;", array($_REQUEST["id"]));
		// 		if ($c_code != "0" && $c_code != "") { // ปรับสถานะเป็นไม่ใช้งาน

		// 			$data["i_enable"]								= STATUS_DISABLE;
		// 			$data["dc_user_update_id"]						= $_SESSION["user_id"];
		// 			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		// 			$data["d_update"]								= date("Y-m-d H:i:s");

		// 			foreach ($data as $fld => $value) {
		// 				$arrValue[]	= ($value != "") ? $value : null;
		// 				$addField	.= ", {$fld} = ?";
		// 			}

		// 			$arrValue[] = $_REQUEST["id"];
		// 			$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE {$key_id} = ?";
		// 			$para		= $db->QueryParam($sql, $arrValue);

		// 			if ($para) {
		// 				$re = array(
		// 					"success"		=> true,
		// 					"msg"			=> "ปรับสถานะเป็นไม่ใช้งาน"
		// 				);
		// 			} else {
		// 				$re = array(
		// 					"success"		=> false,
		// 					"msg"			=> "error"
		// 				);
		// 			}
		// 		} else { // ลบจริง

		// 			$db->QueryParam("DELETE {$table} WHERE {$key_id}=?;", array($_REQUEST["id"]));
		// 			$db->QueryParam("DELETE imp_expense_vsn_dtl WHERE {$key_id}=?;", array($_REQUEST["id"]));

		// 			$re = array(
		// 				"success"		=> true,
		// 				"msg"			=> "ลบรายการเรียบร้อย"
		// 			);
		// 		}

		// 		break;

}
echo json_encode($re);
exit;
