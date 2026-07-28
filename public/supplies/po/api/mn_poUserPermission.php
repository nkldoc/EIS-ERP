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

	case "EDIT":

		$msg	= "";

		$user_id = $db->GetDataBySQL("SELECT dc_user_id FROM dbo.po_user_permission WHERE dc_user_id = ?", array($_REQUEST["id"]));

		$data["i_approve"]				= $_REQUEST["i_approve"];
		$data["i_permission"]			= $_REQUEST["i_permission"];

		if ($user_id > 0) {

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE po_user_permission SET " . substr($addField, 1) . " WHERE dc_user_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
		} else {

			$data["dc_user_id"]			= $_REQUEST["id"];

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql = "
				SET NOCOUNT ON
				INSERT INTO po_user_permission (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";

			$para = $db->QueryParam($sql, $arrValue);
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
				"msg"						=> ""
			);
		} else {
			$re = array(
				"success"					=> false,
				"msg"						=> $msg
			);
		}

		break;
}
echo json_encode($re);
exit;
