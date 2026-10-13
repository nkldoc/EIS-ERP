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

	case "SAVE_DATA":

		$msg	= "";
		$Arr = json_decode($_REQUEST["data"], true);
		if ($msg == "") {
			foreach ($Arr as $flds) {
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
				$data["f_return"]							= ($flds["f_return"]!=null) ? $flds["f_return"] : 0 ;
				// $data["dc_user_update_id"]						= $_SESSION["user_id"];
				// $data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
				// $data["d_update"]								= date("Y-m-d H:i:s");

				if ($flds["dtl_id"] > 0) {

					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fld} = ?";
					}

					$arrValue[] = $flds["dtl_id"];
					$sql		= "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_dtl_id = ?;";
					//echo $sql ; exit;
					$para		= $db->QueryParam($sql, $arrValue);
				} else {

					// $data["i_enable"]								= STATUS_ENABLE;
					// $data["dc_user_create_id"]						= $_SESSION["user_id"];
					// $data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
					// $data["d_create"]								= date("Y-m-d H:i:s");

					// foreach ($data as $fld => $value) {
					// 	$arrValue[] = ($value != "") ? $value : null;
					// 	$addField .= ", {$fld}";
					// 	$addValue .= ", ?";
					// }

					// $sql = "INSERT INTO ar_cut_adjust (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
					// $para	= $db->QueryParam($sql, $arrValue);
				}
			}
		}

		$re = array(
			"success"					=> true,
			"msg"						=> "บันทึกรายการเรียบร้อย"
		);

		break;

	// case "DELETE":

	// 	$msg = "";

	// 	$arrValue[] = $_REQUEST["id"];
	// 	$sql		= "DELETE ar_cut_adjust WHERE ar_cut_adjust_id = ?";
	// 	$para		= $db->QueryParam($sql, $arrValue);
	// 	$id			= $_REQUEST["id"];

	// 	if (@$para) {
	// 		$re = array(
	// 			"success"					=> true,
	// 			"id"						=> $id,
	// 			"msg"						=> "ลบรายการเรียบร้อย"
	// 		);
	// 	} else {
	// 		$re = array(
	// 			"success"					=> false,
	// 			"msg"						=> ""
	// 		);
	// 	}

	// 	break;
}
echo json_encode($re);
exit;
