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

		/******* HDR *******/

		$msg	= "";


		$data["c_name"]               			= $_REQUEST["c_name"];
		$data["dc_user_update_id"]				= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_update"]             			= date("Y-m-d H:i:s");


		if ($mode == "ADD") {

			$data["i_enable"]								= 1;
			$data["i_delete"]								= 2;
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
				INSERT INTO {$DATABASE_NAME} am_asset_group_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			$sql		= "UPDATE {$DATABASE_NAME} am_asset_group_hdr SET " . substr($addField, 1) . " WHERE am_asset_group_hdr_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["id"];
		}

		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		/****** DTL *******/

		$msg	= "";


		$data["am_asset_group_hdr_id"]          = $id;
		$data["c_comment"]            			= $_REQUEST["c_comment"];
		$data["dc_user_update_id"]				= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]			= $_SESSION["dc_cost_id"];
		$data["d_update"]             			= date("Y-m-d H:i:s");


		if ($mode == "ADD") {

			$data["i_enable"]								= 1;
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
				INSERT INTO {$DATABASE_NAME} am_asset_group_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			$sql		= "UPDATE {$DATABASE_NAME} am_asset_group_dtl SET " . substr($addField, 1) . " WHERE am_asset_group_hdr_id = ?";
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
		// print_r($Arr);

		// exit;

		// $id_dalete = "";
		// $count_loop = 0;
		// $Arr_delete_id = json_decode($_REQUEST["data"], true);
		// foreach ($Arr_delete_id as $fldd_delete) {
		// 	if ($fldd_delete["bg_budget_dtl_plan_id"] > 0) {
		// 		$id_dalete .= "," . $fldd_delete["bg_budget_dtl_plan_id"];
		// 		$count_loop++;
		// 	}
		// }
		// $in_not = $count_loop > 0 ? " AND bg_budget_dtl_plan_id NOT IN (" . substr($id_dalete, 1) . ")" : "";
		// $sql = "DELETE bg_budget_dtl_plan WHERE bg_budget_hdr_plan_id = {$_REQUEST["id"]}" . $in_not;
		// $stmt = $db->QueryParam($sql, array());

		if ($msg == "") {
			foreach ($Arr as $fldd) {

				$data["parent_id"]                            = $_REQUEST["id"];
				$data["c_code"]                               = $fldd["c_code"];
				$data["c_name"]                               = $fldd["c_name"];
				$data["am_mode_id"]                           = $fldd["am_mode_id"];
				$data["acc_code"]                             = $fldd["acc_code"];
				$data["acc_name"]                             = $fldd["acc_name"];
				$data["i_period_year"]                        = $fldd["i_period_year"];
				$data["f_unit_cost"]                          = $fldd["f_unit_cost"];
				$data["d_receive_date"]                       = $fldd["d_receive_date"];
				$data["dc_expense_budget_type_id"]            = $fldd["dc_expense_budget_type_id"];
				$data["budget_source"]                        = $fldd["budget_source"];
				$data["i_budget_year"]                        = $fldd["i_budget_year"];
				$data["i_cal"]                        		  = $fldd["f_unit_cost"] < 10000 ? '0' : '1';
				// $data["dc_user_update_id"]                    = $_SESSION["user_id"];
				// $data["dc_user_update_cost_id"]               = $_SESSION["dc_cost_id"];
				// $data["d_update"]                             = date("Y-m-d H:i:s");


				if ($fldd["am_asset_hdr_id"] > 0) { // EDIT

					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fldd["am_asset_hdr_id"];
					$sql		= "UPDATE am_asset_hdr SET " . substr($addField, 1) . " WHERE am_asset_hdr_id = ?";
					$db->QueryParam($sql, $arrValue);
				} else { // ADD

					// $data["bg_budget_hdr_plan_id"]							= $_REQUEST["id"];
					// $data["dc_user_create_id"]								= $_SESSION["user_id"];
					// $data["dc_user_create_cost_id"]							= $_SESSION["dc_cost_id"];
					// $data["d_create"]										= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "
							SET NOCOUNT ON
							INSERT INTO am_asset_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
	case "DELETE":

		$sql = "DELETE am_asset_hdr WHERE  am_asset_hdr_id = ?";
		$arrValue[] = $_REQUEST["id"];
		$para		= $db->QueryParam($sql, $arrValue);
		$id			= $_REQUEST["id"];
		$re	= array("success" => true);
		break;
		// case "DELETE_GROUP":

		// 	$sql = "UPDATE am_asset_group_hdr SET i_delete = 1 , i_enable = 2 WHERE am_asset_group_hdr_id = ?";
		// 	$arrValue[] = $_REQUEST["id"];
		// 	$para		= $db->QueryParam($sql, $arrValue);
		// 	$id			= $_REQUEST["id"];
		// 	$re	= array("success" => true);
		// 	break;
		// case "PRIMARY_CHECKED":

		// 	$sql = "UPDATE am_asset_hdr SET i_primary = ? WHERE am_asset_hdr_id = ?";
		// 	$arrValue[] = $_REQUEST["i_primary"] == 0 ? null : $_REQUEST["i_primary"];
		// 	$arrValue[] = $_REQUEST["am_asset_hdr_id"];
		// 	$para		= $db->QueryParam($sql, $arrValue);
		// 	$re	= array("success" => true);

		// 	break;
}
echo json_encode($re);
exit;
