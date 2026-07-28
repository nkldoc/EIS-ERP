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
		// $Arr = json_decode($_REQUEST["data"], true);


		if ($msg == "") {

			$sql = "UPDATE am_asset_hdr SET am_asset_group_hdr_id = ? WHERE  am_asset_hdr_id = ?";
			$arrValue[] = $_REQUEST["id"];
			$arrValue[] = $_REQUEST["am_asset_hdr_id"];
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

		$sql = "UPDATE am_asset_hdr SET am_asset_group_hdr_id = null WHERE  am_asset_hdr_id = ?";
		$arrValue[] = $_REQUEST["id"];
		$para		= $db->QueryParam($sql, $arrValue);
		$id			= $_REQUEST["id"];
		$re	= array("success" => true);
		break;
	case "DELETE_GROUP":

		$sql = "UPDATE am_asset_group_hdr SET i_delete = 1 , i_enable = 2 WHERE am_asset_group_hdr_id = ?";
		$arrValue[] = $_REQUEST["id"];
		$para		= $db->QueryParam($sql, $arrValue);
		$id			= $_REQUEST["id"];
		$re	= array("success" => true);
		break;
	case "PRIMARY_CHECKED":

		$sql = "UPDATE am_asset_hdr SET i_primary = ? WHERE am_asset_hdr_id = ?";
		$arrValue[] = $_REQUEST["i_primary"] == 0 ? null : $_REQUEST["i_primary"];
		$arrValue[] = $_REQUEST["am_asset_hdr_id"];
		$para		= $db->QueryParam($sql, $arrValue);
		$re	= array("success" => true);

		break;
}
echo json_encode($re);
exit;
