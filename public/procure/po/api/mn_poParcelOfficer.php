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

		$data["c_name"]									= $_REQUEST["c_name"];
		$data["dc_cost_id"]								= $_REQUEST["dc_cost_id"];
		//$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["i_enable"]								= $_REQUEST["i_enable"];
		$data["i_delete"]								= 2;
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		if ($mode == "ADD") {
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql = "
				SET NOCOUNT ON
				INSERT INTO po_parcel_officer (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			$sql		= "UPDATE po_parcel_officer SET " . substr($addField, 1) . " WHERE po_parcel_officer_id = ?";
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

	case "DELETE":

		$data["i_enable"]								= STATUS_DISABLE;
		$data["i_delete"]								= DELETE_TRUE;
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		foreach ($data as $fld => $value) {
			$arrValue[]	= ($value != "") ? $value : null;
			$addField	.= ", {$fld} = ?";
		}

		$arrValue[] = $_REQUEST["id"];
		$sql		= "UPDATE po_parcel_officer SET " . substr($addField, 1) . " WHERE po_parcel_officer_id = ?";
		$para		= $db->QueryParam($sql, $arrValue);
		$id			= $_REQUEST["id"];

		if (@$para) {
			$re = array(
				"success"					=> true,
				"id"						=> $id,
				"msg"						=> "ลบรายการเรียบร้อย"
			);
		} else {
			$re = array(
				"success"					=> false,
				"msg"						=> ""
			);
		}

		break;
}
echo json_encode($re);
exit;
