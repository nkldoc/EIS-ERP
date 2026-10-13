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

		$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["i_enabled"]								= $_REQUEST["i_enabled"];
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		if ($mode == "ADD") {
			$holiday = $db->GetDataBySQL("SELECT a.* FROM dbo.sp_contract_year a WHERE a.i_year_ad = ? AND a.i_enabled = 1", array($_REQUEST["i_year"]));
			if (empty($holiday)) {
				$data["i_year_ad"]									= $_REQUEST["i_year"];
				$data["i_year_be"]									= $_REQUEST["i_year"]+543;
				$data["i_statur"]								= 1;
				$data["i_enabled"]								= STATUS_ENABLE;
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
				INSERT INTO sp_contract_year (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			} else {
				$msg = "ไม่สามารถบันทึกปีงบประมาณซ้ำได้ !!";
			}
		} else if ($mode == "EDIT") {
			$sp_contract_year  = null ;
			if($_REQUEST["i_enabled"] == 1 ){
				$sp_contract_year = $db->GetDataBySQL("SELECT a.* FROM dbo.sp_contract_year a WHERE  a.i_enabled = ? ", array($_REQUEST["i_enabled"]));
			}
			if (empty($sp_contract_year)) {
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE sp_contract_year SET " . substr($addField, 1) . " WHERE sp_contract_year_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["id"];
			} else {
				$msg = "ปีสัญญาสามารถเปิดใช้งานได้แค่ 1 รายการ กรุณาปรับตัวที่ใช้งานอยู่เป็นไม่ใช้งาน !!";
			}
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

	// case "ADD_DTL":
	// case "EDIT_DTL":

	// 	$msg	= "";

	// 	$data["c_name"]									= $_REQUEST["c_name"];
	// 	$data["d_holiday"]								= $_REQUEST["d_holiday"];
	// 	$data["i_type"]									= 1; // (1 = Manual, 2 = Autometic)
	// 	// $data["c_comment"]								= $_REQUEST["c_comment"];
	// 	$data["dc_user_update_id"]						= $_SESSION["user_id"];
	// 	$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
	// 	$data["d_update"]								= date("Y-m-d H:i:s");

	// 	if ($mode == "ADD_DTL") {

	// 		$data["sp_holiday_hdr_id"]						= $_REQUEST["sp_holiday_hdr_id"];
	// 		$data["dc_user_create_id"]						= $_SESSION["user_id"];
	// 		$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
	// 		$data["d_create"]								= date("Y-m-d H:i:s");

	// 		foreach ($data as $fld => $value) {
	// 			$arrValue[] = ($value != "") ? $value : null;
	// 			$addField .= ", {$fld}";
	// 			$addValue .= ", ?";
	// 		}

	// 		$sql	= "
	// 			SET NOCOUNT ON
	// 			INSERT INTO sp_holiday_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
	// 			SELECT @@IDENTITY as id;";

	// 		$para	= $db->QueryParam($sql, $arrValue);
	// 		$ss_id	= $db->Fetch($para);
	// 		$id		= $ss_id["id"];

	// 		// ============== //
	// 		$addField	= null;
	// 		$addValue	= null;
	// 		unset($data);
	// 		unset($arrValue);
	// 		// ============== //

	// 		$msg = "เพิ่มรายการเรียบร้อย";
		// } else if ($mode == "EDIT_DTL") {

		// 	foreach ($data as $fld => $value) {
		// 		$arrValue[]	= ($value != "") ? $value : null;
		// 		$addField	.= ", {$fld} = ?";
		// 	}

		// 	$arrValue[] = $_REQUEST["id"];
		// 	$sql		= "UPDATE sp_holiday_dtl SET " . substr($addField, 1) . " WHERE sp_holiday_dtl_id = ?";
		// 	$para		= $db->QueryParam($sql, $arrValue);
		// 	$id			= $_REQUEST["id"];
		// 	$msg = "แก้ไขรายการเรียบร้อย";
		// }

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
				"msg"						=> $msg
			);
		} else {
			$re = array(
				"success"					=> false,
				"msg"						=> $msg
			);
		}

		break;

	case "LOAD_HOLIDAY":

		$msg	= "";
		$hdr = $db->GetDataBySQL("SELECT a.* FROM dbo.sp_holiday_hdr a WHERE a.sp_holiday_hdr_id = ?", array($_REQUEST["sp_holiday_hdr_id"]));

		$begin = new DateTime($hdr["i_year"] . "-01-01");
		$end = new DateTime($hdr["i_year"] . "-12-31");
		$end = $end->modify("+1 day");

		$interval = new DateInterval("P1D");
		$daterange = new DatePeriod($begin, $interval, $end);

		foreach ($daterange as $date) {
			// 6 Saturday,7 Sunday
			if ($date->format("N") == 6 || $date->format("N") == 7) {

				$dtl = $db->GetDataBySQL("SELECT * FROM sp_holiday_dtl where sp_holiday_hdr_id = ? AND d_holiday = CONVERT(DATETIME,'{$date->format("Y-m-d")}',102);", array($_REQUEST["sp_holiday_hdr_id"]));

				// if ($date->format("N") == 6) {
				// 	$c_name = "เสาร์";
				// } else if ($date->format("N") == 7) {
				// 	$c_name = "อาทิตย์";
				// } else {
				// 	$c_name = "";
				// }

				$data["c_name"]									= $date->format("l");
				$data["d_holiday"]								= $date->format("Y-m-d");
				$data["i_type"]									= 2; // (1 = Manual, 2 = Autometic)
				$data["dc_user_update_id"]						= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
				$data["d_update"]								= date("Y-m-d H:i:s");

				if (empty($dtl)) {
					$data["sp_holiday_hdr_id"]						= $_REQUEST["sp_holiday_hdr_id"];
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
						INSERT INTO sp_holiday_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						SELECT @@IDENTITY as id;";

					$para	= $db->QueryParam($sql, $arrValue);
					$ss_id	= $db->Fetch($para);
					$id			= $_REQUEST["sp_holiday_hdr_id"];

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== /
				} else {
					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fld} = ?";
					}

					$arrValue[] = $dtl["sp_holiday_dtl_id"];
					$sql		= "UPDATE sp_holiday_dtl SET " . substr($addField, 1) . " WHERE sp_holiday_dtl_id = ?";
					$para		= $db->QueryParam($sql, $arrValue);
					$id			= $_REQUEST["sp_holiday_hdr_id"];

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== /
				}
				$msg = "โหลดรายการเรียบร้อย";
				if (@$para) {
					$re = array(
						"success"					=> true,
						"id"						=> $id,
						"msg"						=> $msg
					);
				} else {
					$re = array(
						"success"					=> false,
						"msg"						=> $msg
					);
				}
			}
		}
		break;

	case "DELETE_DTL":

		$db->QueryParam("DELETE sp_holiday_dtl WHERE sp_holiday_dtl_id = ?;", array($_REQUEST["id"]));

		$re = array(
			"success"		=> true,
			"msg"			=> "ลบรายการเรียบร้อย"
		);

		break;
}
echo json_encode($re);
exit;
