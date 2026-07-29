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

		/* ========================== po_working_hdr ========================== */
		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		$data["c_comment"]								= $_REQUEST["c_comment"];

		foreach ($data as $fld => $value) {
			$arrValue[]	= ($value != "") ? $value : null;
			$addField	.= ", {$fld} = ?";
		}

		$arrValue[] = $_REQUEST["id"];
		$sql		= "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?;";
		$para		= $db->QueryParam($sql, $arrValue);

		/* ========================== po_working_dtl ========================== */
		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		$data["i_budget_year"]								= $_REQUEST["i_budget_year"];
		$data["i_budget_year_overlap"]						= $_REQUEST["i_budget_year_overlap"];
		$data["dc_expense_budget_type_id"]					= $_REQUEST["dc_expense_budget_type_id"];
		$data["bg_expense_id"]								= $_REQUEST["bg_expense_id"];
		$data["dc_cost_id"]									= $_REQUEST["dc_cost_id"];
		$data["po_creditor_id"]								= $_REQUEST["po_creditor_id"];
		$data["po_creditor_transfer_id"]					= $_REQUEST["po_creditor_transfer_id"];
		$data["c_qty"]										= $_REQUEST["c_qty"];
		$data["f_total"]									= $_REQUEST["f_total"];
		$data["d_audit_date"]								= $_REQUEST["d_audit_date"];
		$data["po_emp_id"]									= $_REQUEST["po_emp_id"];
		$data["d_doc_date"]									= $_REQUEST["d_doc_date"];
		$data["dc_approve_id"]								= $_REQUEST["dc_approve_id"];
		$data["d_inv_date"]									= $_REQUEST["d_inv_date"];
		$data["c_approve"]									= $_REQUEST["c_approve"];
		$data["d_approve_date"]								= $_REQUEST["d_approve_date"];
		$data["c_booking"]									= $_REQUEST["c_booking"];

		foreach ($data as $fld => $value) {
			$arrValue[]	= ($value != "") ? $value : null;
			$addField	.= ", {$fld} = ?";
		}

		$arrValue[] = $_REQUEST["id"];
		$sql		= "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?;";
		$para		= $db->QueryParam($sql, $arrValue);

		$id		= $_REQUEST["id"];

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
				"msg"						=> "บันทึกข้อมูลเรียบร้อย"
			);
		} else {
			$re = array(
				"success"					=> false,
				"msg"						=> $msg
			);
		}

		break;

	case "SAVE_DTL":

		$sql   = "";
		$Arr	= json_decode($_REQUEST["data"], true);
		foreach ($Arr as $flds) {

			$data["d_doc_date"]						= $flds["d_doc_date"];
			$data["d_receive_date"]					= $flds["d_receive_date"];
			$data["c_comment"]						= $flds["c_comment"];

			// $data["dc_user_update_id"]			= $_SESSION["user_id"];
			// $data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			// $data["d_update"]					= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $flds["id"];
			$sql    = "UPDATE po_working_item SET " . substr($addField, 1) . " WHERE po_working_hdr_id = {$_REQUEST["id"]} AND po_working_item_id = ?;";
			$db->QueryParam($sql, $arrValue);
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //

			if ($flds["i_status"] == 4) { // อนุมัติฏีกา
				$data["d_approve_date"]					= $flds["d_doc_date"];

				foreach ($data as $fld => $value) {
					$arrValue[]	= ($value != "") ? $value : null;
					$addField	.= ", {$fld} = ?";
				}

				$sql    = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = {$_REQUEST["id"]};";
				$db->QueryParam($sql, $arrValue);
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
			}
		}
		$re = array(
			"success"	=> true,
			"msg"		=> "บันทึกข้อมูลเรียบร้อย"
		);

		break;
}
echo json_encode($re);
exit;
