<?php
include("../conf/configPo.php");
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

		$data["c_code_ref"]								= $_REQUEST["c_code_ref"];
		$data["c_name"]									= $_REQUEST["c_name"];
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
				INSERT INTO po_working_imp_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			$sql		= "UPDATE po_working_imp_hdr SET " . substr($addField, 1) . " WHERE po_working_imp_hdr_id = ?";
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
		if ($_REQUEST["i_import_excel"] == "true") {
			$db->QueryParam("DELETE po_working_dtl WHERE po_working_hdr_id IN (SELECT aa.po_working_hdr_id FROM dbo.po_working_hdr aa WHERE aa.po_working_imp_hdr_id = ?)", array($_REQUEST["id"]));
			$db->QueryParam("DELETE po_working_item WHERE po_working_hdr_id IN (SELECT aa.po_working_hdr_id FROM dbo.po_working_hdr aa WHERE aa.po_working_imp_hdr_id = ?)", array($_REQUEST["id"]));
			$db->QueryParam("DELETE po_working_hdr WHERE po_working_imp_hdr_id = ?", array($_REQUEST["id"]));
		}

		if ($msg == "") {
			foreach ($Arr as $fldd) {
				if ($fldd["po_working_dtl_id"] > 0) { // EDIT

					$data["i_budget_year"]									= $fldd["i_budget_year"];
					$data["i_budget_year_overlap"]							= $fldd["i_budget_year_overlap"];
					$data["dc_cost_id"]										= $fldd["dc_cost_id"];
					$data["c_code"]											= $fldd["c_code"];
					$data["dc_expense_budget_type_id"]						= $fldd["dc_expense_budget_type_id"];
					$data["bg_expense_id"]									= $fldd["bg_expense_id"];
					$data["po_emp_id"]										= $fldd["po_emp_id"];
					$data["dc_user_update_id"]								= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_update"]										= date("Y-m-d H:i:s");

					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fldd["po_working_dtl_id"];
					$sql		= "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_dtl_id = ?";
					
					$db->QueryParam($sql, $arrValue);
				} else { // ADD

					// ========================= 1/3 add po_working_hdr ========================= //

					$data["po_working_imp_hdr_id"]							= $_REQUEST["id"];
					// $data["last_status_id"]									= $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_seq = ? AND i_enable = 1 AND i_delete = 2", array('1'));
					$data["i_status_last"]									= 1;
					$data["c_status_last"]									= "จัดทำใบขอเบิก";
					$data["c_code_ref"]										= $fldd["c_code"];
					$data["c_detail"]										= $fldd["c_detail"];
					$data["i_enable"]										= STATUS_ENABLE;
					$data["dc_user_update_id"]								= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_update"]										= date("Y-m-d H:i:s");
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
						INSERT INTO po_working_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
					// ========================= 2/3 add po_working_dtl ========================= //
					$data["po_working_hdr_id"]								= $id;
					$data["i_budget_year"]									= $fldd["i_budget_year"];
					$data["i_budget_year_overlap"]							= $fldd["i_budget_year_overlap"];
					$data["dc_cost_id"]										= $fldd["dc_cost_id"];
					$data["dc_expense_budget_type_id"]						= $fldd["dc_expense_budget_type_id"];
					$data["bg_expense_id"]									= $fldd["bg_expense_id"];
					$data["d_audit_date"]									= $fldd["d_audit_date"];
					$data["c_code"]											= $fldd["c_code"];
					$data["d_doc_date"]										= $fldd["d_doc_date"];
					$data["d_inv_date"]										= $fldd["d_inv_date"];
					$data["c_cnt_name"]										= $fldd["c_cnt_name"];
					$data["c_detail"]										= $fldd["c_detail"];
					$data["c_qty"]											= $fldd["c_qty"];
					$data["f_total"]										= $fldd["f_total"];
					$data["po_emp_id"]										= $fldd["po_emp_id"];
					$data["dc_user_update_id"]								= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_update"]										= date("Y-m-d H:i:s");
					$data["dc_user_create_id"]								= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_create"]										= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "INSERT INTO po_working_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
					$db->QueryParam($sql, $arrValue);

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //
					// ========================= 3/3 add po_working_item ========================= //

					$data["po_working_hdr_id"]						= $id;
					// $data["po_status_hdr_id"]						= $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_seq = ? AND i_enable = 1 AND i_delete = 2", array('1'));
					$data["i_status"]								= 1;
					$data["c_status"]								= "จัดทำใบขอเบิก";
					$data["c_name"]									= $fldd["c_detail"];
					$data["d_doc_date"]								= date("Y-m-d H:i:s");
					$data["c_code_ref"]								= $fldd["c_code"];
					$data["dc_user_create_id"]						= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
					$data["d_create"]								= date("Y-m-d H:i:s");
					$data["dc_user_update_id"]						= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
					$data["d_create"]								= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "INSERT INTO po_working_item (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
					$db->QueryParam($sql, $arrValue);
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

		echo json_encode($re);
		exit;
		break;

	case "SAVE_SEND":
		$msg = "";

		$db->BeginTran();
		$Arr = json_decode($_REQUEST["data"], true);

		if ($msg == "") {
			foreach ($Arr as $fldd) {

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				$po_working_item_id = $db->GetDataBySQL("SELECT po_working_item_id FROM dbo.po_working_item WHERE po_working_hdr_id = {$fldd["id"]} AND i_status = ?;", array(2));

				$data["d_doc_date"]										= $_REQUEST["d_doc_date"];
				$data["dc_user_update_id"]								= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
				$data["d_update"]										= date("Y-m-d H:i:s");
				// =========================== ITEM =========================== //
				if ($po_working_item_id > 0) { // EDIT

					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fld} = ?";
					}

					$arrValue[] = $po_working_item_id;
					$sql		= "UPDATE po_working_item SET " . substr($addField, 1) . " WHERE po_working_item_id = ?";
					$db->QueryParam($sql, $arrValue);
				} else { // ADD

					$data["po_working_hdr_id"]					= $fldd["id"];
					$data["i_status"]							= 2;
					$data["c_status"]							= $CONF_I_STATUS[2];
					$data["dc_user_create_id"]					= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]				= $_SESSION["dc_cost_id"];
					$data["d_create"]							= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "INSERT INTO po_working_item (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

					$db->QueryParam($sql, $arrValue);
				}

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				// =========================== UPDATE STATUS HDR =========================== //
				$data["i_status_last"]							= 2;
				$data["c_status_last"]							= $CONF_I_STATUS[2];
				$data["dc_user_update_id"]						= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
				$data["d_update"]								= date("Y-m-d H:i:s");

				foreach ($data as $fld => $value) {
					$arrValue[]	= ($value != "") ? $value : null;
					$addField	.= ", {$fld} = ?";
				}

				$arrValue[] = $fldd["id"];
				$sql		= "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
				$para		= $db->QueryParam($sql, $arrValue);

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				// =========================== UPDATE STATUS HDR =========================== //
				$data["dc_approve_id"]							= $_REQUEST["dc_approve_id"];
				$data["dc_user_update_id"]						= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
				$data["d_update"]								= date("Y-m-d H:i:s");

				foreach ($data as $fld => $value) {
					$arrValue[]	= ($value != "") ? $value : null;
					$addField	.= ", {$fld} = ?";
				}

				$arrValue[] = $fldd["id"];
				$sql		= "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
				$para		= $db->QueryParam($sql, $arrValue);

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				$msg = "ส่งใบขอเบิกแล้ว";
			}

			if (@$para) {
				$db->CommitTran();
				$re	= array(
					"success"	=> true,
					"msg"		=> $msg
				);
			} else {
				$db->RollBackTran();
				$re	= array(
					"success"	=> false,
					"msg"		=> $msg
				);
			}
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> $msg
			);
		}
		// =========================================================== //

		echo json_encode($re);
		exit;
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
