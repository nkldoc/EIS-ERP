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

	case "SAVE_ADJUST":
		$msg = "";
		$Arr = json_decode($_REQUEST["data"], true);

		if ($msg == "") {
			foreach ($Arr as $fld) {

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				$item = $db->GetDataBySQL("SELECT * FROM ar_cut_item WHERE ar_cut_item_id = ?;", array($fld["ar_cut_item_id"]));

				$data["ar_cut_hdr_id"]						= $item["ar_cut_hdr_id"];
				$data["ar_cut_dtl_id"]						= $item["ar_cut_dtl_id"];
				$data["ar_cut_item_id"]						= $item["ar_cut_item_id"];
				$data["f_dr"]								= $fld["f_dr"];
				$data["f_cr"]								= $fld["f_cr"];
				$data["c_comment"]							= $fld["c_comment"];
				$data["dc_user_create_id"]                  = $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]             = $_SESSION["dc_cost_id"];
				$data["d_create"]                           = date("Y-m-d H:i:s");
				$data["dc_user_update_id"]                  = $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
				$data["d_update"]                           = date("Y-m-d H:i:s");

				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "") ? $value : null;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}

				$sql = "
					SET NOCOUNT ON
					INSERT INTO ar_cut_adjust (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
					SELECT @@IDENTITY as id;";

				$para	= $db->QueryParam($sql, $arrValue);
			}
			$re	= array("success" => true);
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> $msg
			);
		}
		// =========================================================== //

		break;

	case "DELETE":

		$msg = "";

		$data["i_enable"]                           = "0";
		$data["dc_user_update_id"]                  = $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]             = $_SESSION["dc_cost_id"];
		$data["d_update"]                           = date("Y-m-d H:i:s");

		foreach ($data as $fld => $value) {
			$addField .= ($value != "") ? ", {$fld} = '{$value}'" : ", {$fld} = NULL";
		}
		$sql = "
			BEGIN TRANSACTION;
			UPDATE dbo.ar_cut_adjust SET " . substr($addField, 1) . " WHERE ar_cut_adjust_id = {$_REQUEST["id"]};
			COMMIT;";

		$para = $db->QueryParam($sql, array());
		if ($para) {
			$re = array(
				"success"           => true,
				"msg"               => "ลบรายการเรียบร้อย"
			);
		} else {
			$re = array(
				"success"           => false,
				"msg"               => $msg
			);
		}

		break;
}
echo json_encode($re);
exit;
