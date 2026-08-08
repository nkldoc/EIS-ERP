<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

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

		$user_id = $db->GetDataBySQL("SELECT dc_user_id FROM dbo.sp_user_permission WHERE dc_user_id = ? AND dc_cost_acc_id = ?", array($_REQUEST["id"], $_REQUEST["dc_cost_acc_id"]));


		$data["i_approve"]				= $_REQUEST["i_approve"];
		$data["i_executive"]			= $_REQUEST["i_executive"];
		$data["i_permission"]			= $_REQUEST["i_permission"];

		if ($user_id > 0) {

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$arrValue[] = $_REQUEST["dc_cost_acc_id"];
			$sql		= "UPDATE sp_user_permission SET " . substr($addField, 1) . " WHERE dc_user_id = ? AND dc_cost_acc_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
		} else {
			$data["dc_user_id"]			= $_REQUEST["id"];
			$data["dc_cost_acc_id"]	    = $_REQUEST["dc_cost_acc_id"];

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql = "
				SET NOCOUNT ON
				INSERT INTO sp_user_permission (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
				SELECT @@IDENTITY as id;";

			$para = $db->QueryParam($sql, $arrValue);
		}
		if ($_REQUEST["i_executive_main"] == 1) {
			$sql = "
				DECLARE @dc_user_id BIGINT = ?;
				DECLARE @dc_cost_acc_id BIGINT = ?;
				UPDATE sp_user_permission SET i_executive_main = null where i_executive_main = 1  AND dc_cost_acc_id = @dc_cost_acc_id;
				UPDATE sp_user_permission SET i_executive_main = 1 where dc_user_id = @dc_user_id AND dc_cost_acc_id = @dc_cost_acc_id;";
			$db->QueryParam($sql, array($_REQUEST["id"], $_REQUEST["dc_cost_acc_id"]));
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
