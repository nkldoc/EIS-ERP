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

		$data["c_expense_period_no"]					= $_REQUEST["c_expense_period_no"];
		$data["c_doc"]									= $_REQUEST["c_doc"];
		$data["dc_expense_budget_type_id"]				= $_REQUEST["dc_expense_budget_type_id"];
		$data["dc_bank_acc_company_id_source"]			= $_REQUEST["dc_bank_acc_company_id_source"];
		$data["dc_bank_acc_company_id_target"]			= $_REQUEST["dc_bank_acc_company_id_target"];
		$data["d_doc_date"]								= $_REQUEST["d_doc_date"];
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
				INSERT INTO imp_expense_ephis_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			$sql		= "UPDATE imp_expense_ephis_hdr SET " . substr($addField, 1) . " WHERE imp_expense_ephis_hdr_id = ?";
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
			$db->QueryParam("DELETE imp_expense_ephis_dtl WHERE imp_expense_ephis_hdr_id = ?", array($_REQUEST["id"]));
		}

		if ($msg == "") {
			// ========================= add dtl ========================= //
			foreach ($Arr as $fld) {

				$data["dc_expense_group_vsn_id"]						= $fld["dc_expense_group_vsn_id"];
				$data["dc_expense_vsn_id"]								= $db->GetDataBySQL("SELECT dc_expense_vsn_id FROM dc_expense_acc_vsn WHERE dc_expense_acc_vsn_id=?;", array($fld["dc_expense_acc_vsn_id"]));
				$data["dc_expense_acc_vsn_id"]							= $fld["dc_expense_acc_vsn_id"];
				$data["c_budget_year"]									= $fld["c_budget_year"];
				$data["i_type_year"]									= $fld["i_type_year"];
				$data["c_booking"]										= $fld["c_booking"];
				$data["f_inv"]											= $fld["f_inv"];
				$data["f_vat"]											= $fld["f_vat"];
				$data["f_tax_personal"]									= $fld["f_tax_personal"];
				$data["f_tax_corporate"]								= $fld["f_tax_corporate"];
				$data["f_social_security"]								= $fld["f_social_security"];
				$data["f_money1"]										= $fld["f_money1"];
				$data["f_fine"]											= $fld["f_fine"];
				$data["f_total"]										= $fld["f_total"];
				$data["f_check_total"]									= $fld["f_check_total"];
				$data["dc_user_update_id"]								= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
				$data["d_update"]										= date("Y-m-d H:i:s");
				$data["i_cal_gl"]										= $fld["i_cal_gl"];
				$data["imp_request_ephis_dtl_id"]						= ($fld["imp_request_ephis_dtl_id"]>0) ? $fld["imp_request_ephis_dtl_id"] : "0";

				if ($fld["imp_expense_ephis_dtl_id"] > 0) { // EDIT
					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fld["imp_expense_ephis_dtl_id"];
					$sql		= "UPDATE imp_expense_ephis_dtl SET " . substr($addField, 1) . " WHERE imp_expense_ephis_dtl_id = ?";
					$db->QueryParam($sql, $arrValue);
				} else { // ADD

					$data["imp_expense_ephis_hdr_id"]						= $_REQUEST["id"];
					$data["d_doc"]											= $fld["d_doc"];
					$data["c_request"]										= $fld["c_request"];
					$data["c_approve"]										= $fld["c_approve"];
					$data["c_expense_group_main"]							= $fld["c_expense_group_main"];
					$data["c_expense_group_sub"]							= $fld["c_expense_group_sub"];
					$data["c_acc_item"]										= $fld["c_acc_item"];
					$data["c_budget_type_name"]								= $fld["c_budget_type_name"];
					$data["c_pay_time"]										= $fld["c_pay_time"];
					$data["c_bglst"]										= $fld["c_bglst"];
					$data["c_creditor"]										= $fld["c_creditor"];
					$data["c_bank_name"]									= $fld["c_bank_name"];
					$data["c_bank_branch_name"]								= $fld["c_bank_branch_name"];
					$data["c_cheque_numbers"]								= $fld["c_cheque_numbers"];
					// $data["c_note"]											= $fld["c_note"];
					$data["dc_user_create_id"]								= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_create"]										= date("Y-m-d H:i:s");
					$data["imp_request_ephis_dtl_id"]						= $db->GetDataBySQL("SELECT TOP 1 dtl_id FROM vw_show_request_jv WHERE c_request =? and i_type=?;", array($fld["c_request"],1));

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "INSERT INTO imp_expense_ephis_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
					$db->QueryParam($sql, $arrValue);
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

		$con = "";
		$msg = "";
		$Arr = json_decode($_REQUEST["data"], true);
		if ($msg == "") {
			foreach ($Arr as $fldd) {
				// ======================== 1/4 COPY imp_expense_vsn_hdr ======================== //
				$ephisH = $db->GetDataBySQL("
					SELECT
						a.*
						,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date_N
						,CASE
							WHEN b.imp_expense_vsn_hdr_id IS NOT NULL THEN 1
							ELSE 0
						END AS i_success
					FROM dbo.imp_expense_ephis_hdr a
						LEFT JOIN dbo.imp_expense_vsn_hdr b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
							AND b.i_enable = 1
					WHERE a.imp_expense_ephis_hdr_id = ?", array($fldd["id"]));
				if ($ephisH["i_success"] == 0) {

					$data["c_expense_vsn_period_no"]							= $ephisH["c_expense_period_no"];
					$data["c_doc"]												= $ephisH["c_doc"];
					$data["dc_expense_budget_type_id"]							= $ephisH["dc_expense_budget_type_id"];
					$data["d_doc_date"]											= $ephisH["d_doc_date"];
					$data["dc_cost_acc_id"]										= $db->GetDataBySQL("SELECT dc_cost_acc_id FROM dc_cost WHERE c_code LIKE '04040100%';", array());
					$data["c_comment"]											= $ephisH["c_comment"];
					$data["i_post"]												= 1;
					$data["i_system"]											= 1; // ephis
					$data["dc_bank_acc_company_id_source"]						= $ephisH["dc_bank_acc_company_id_source"];
					$data["dc_bank_acc_company_id_target"]						= $ephisH["dc_bank_acc_company_id_target"];
					$data["i_enable"]											= STATUS_ENABLE;
					$data["dc_user_create_id"]									= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]								= $_SESSION["dc_cost_id"];
					$data["d_create"]											= date("Y-m-d H:i:s");
					$data["dc_user_update_id"]									= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]								= $_SESSION["dc_cost_id"];
					$data["d_update"]											= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "
						SET NOCOUNT ON
						INSERT INTO imp_expense_vsn_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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

					// ======================== 2/4 COPY imp_expense_vsn_dtl ======================== //
					$stmt = $db->QueryParam("SELECT *,ISNULL(imp_request_ephis_dtl_id,0) as rq_dtl_id FROM dbo.imp_expense_ephis_dtl a WHERE a.imp_expense_ephis_hdr_id = ? ORDER BY imp_expense_ephis_dtl_id;", array($fldd["id"]));
					if (sqlsrv_has_rows($stmt)) {
						while ($row = $db->Fetch($stmt)) {

							if ($row["i_type_year"] == 1) {
								$data["dc_acc_id"]									= ($row["dc_expense_acc_vsn_id"] > 0) ? $db->GetDataBySQL("SELECT aa.dc_acc_id FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = " . $row["dc_expense_acc_vsn_id"], array()) : null;
								$data["dc_acc_id_overlap"]							= null;
							} else {
								$data["dc_acc_id"]									= null;
								$data["dc_acc_id_overlap"]							= ($row["dc_expense_acc_vsn_id"] > 0) ? $db->GetDataBySQL("SELECT aa.dc_acc_id_overlap FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = " . $row["dc_expense_acc_vsn_id"], array()) : null;
							}

							$data["imp_expense_vsn_hdr_id"]								= $id;
							$data["dc_expense_group_vsn_id"]							= $row["dc_expense_group_vsn_id"];
							$data["dc_expense_vsn_id"]									= $row["dc_expense_vsn_id"];
							$data["dc_expense_acc_vsn_id"]								= $row["dc_expense_acc_vsn_id"];
							$data["d_doc"]												= $row["d_doc"];
							$data["d_cheque"]											= $row["d_doc"];
							$data["c_request"]											= $row["c_request"];
							$data["c_approve"]											= $row["c_approve"];
							$data["c_expense_group_main"]								= $row["c_expense_group_main"];
							$data["c_acc_item"]											= $row["c_acc_item"];
							$data["f_inv"]												= round($row["f_inv"], 2) + round($row["f_vat"], 2);
							$data["f_tax_personal"]										= round($row["f_tax_personal"], 2) + round($row["f_tax_corporate"], 2);
							$data["f_social_security"]									= $row["f_social_security"];
							$data["f_prov_fund"]										= "0";
							$data["f_fine"]												= $row["f_fine"];
							$data["f_total"]											= $row["f_total"];
							$data["c_comment"]											= "ส่งรายการมาจาก ephis";
							$data["cm_pay_type_id"]										= 1;
							$data["dc_acc_id_creditor"]									= 374;
							$data["c_budget_year"]										= $row["c_budget_year"];
							$data["i_type_year"]										= $row["i_type_year"];
							$data["c_booking"]											= $row["c_booking"];
							$data["i_many_doc"]											= 1;
							$data["i_status"]											= 1;
							$data["i_cal_gl"]											= $row["i_cal_gl"];
							$data["dc_user_create_id"]									= $_SESSION["user_id"];
							$data["dc_user_create_cost_id"]								= $_SESSION["dc_cost_id"];
							$data["d_create"]											= date("Y-m-d H:i:s");
							$data["dc_user_update_id"]									= $_SESSION["user_id"];
							$data["dc_user_update_cost_id"]								= $_SESSION["dc_cost_id"];
							$data["d_update"]											= date("Y-m-d H:i:s");
							$data["imp_request_ephis_dtl_id"]							= $row["rq_dtl_id"];
							$data["imp_request_vsn_dtl_id"]								= "0";


							foreach ($data as $fld => $value) {
								$arrValue[] = ($value != "") ? $value : null;
								$addField .= ", {$fld}";
								$addValue .= ", ?";
							}

							$sql	= "
								SET NOCOUNT ON
								INSERT INTO imp_expense_vsn_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
								SELECT @@IDENTITY as id;";

							$para		= $db->QueryParam($sql, $arrValue);
							$ss_id		= $db->Fetch($para);
							$dtl_id		= $ss_id["id"];

							// ============== //
							$addField	= null;
							$addValue	= null;
							unset($data);
							unset($arrValue);
							// ============== //

							if ($para) {
								$data["imp_expense_vsn_dtl_id"]		= $dtl_id;
								$data["imp_expense_vsn_hdr_id"]		= $id;
								$data["c_creditor"]					= $row["c_creditor"];
								$data["c_cheque"]					= $row["c_cheque_numbers"];

								foreach ($data as $fld => $value) {
									$arrValue[]	= ($value != "") ? $value : null;
									$addField	.= ", {$fld}";
									$addValue	.= ", ?";
								}

								$sql = "
								BEGIN TRANSACTION;
								INSERT INTO tb_cheque_vsn (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
								COMMIT;";
								$db->QueryParam($sql, $arrValue);

								// ============== //
								$addField	= null;
								$addValue	= null;
								unset($data);
								unset($arrValue);
								// ============== //
							}
						}
					}

					// ====================== 3/4 GENCODE imp_expense_vsn_hdr ======================= //
					list($yyyy, $mm, $dd)	= explode("-", $ephisH["d_doc_date_N"]);
					$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$arrValue[]	= "IMPV";
					$arrValue[]	= $yyyy . $mm;
					$arrValue[]	= $_SESSION["user_id"];
					$arrValue[]	= $_SESSION["dc_cost_id"];
					$arrValue[]	= $id;

					$arr_gen_code_impv	= $db->GetDataBySQL($sql, $arrValue);

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //

					if ($id == $arr_gen_code_impv["reference_id"]) {

						$data["c_code"]						= $arr_gen_code_impv["c_code_gen"];
						$data["dc_user_update_id"]			= $_SESSION["user_id"];
						$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
						$data["d_update"]					= date("Y-m-d H:i:s");
						$data["dc_user_update_id_exp"]		= $_SESSION["user_id"];
						$data["dc_user_update_cost_id_exp"]	= $_SESSION["dc_cost_id"];
						$data["d_update_exp"]				= date("Y-m-d H:i:s");

						foreach ($data as $fld => $value) {
							$arrValue[]	= ($value != "") ? $value : null;
							$addField	.= ", {$fld} = ?";
						}

						$arrValue[] = $arr_gen_code_impv["reference_id"];
						$sql		= "UPDATE imp_expense_vsn_hdr SET " . substr($addField, 1) . " WHERE imp_expense_vsn_hdr_id = ?";
						$para		= $db->QueryParam($sql, $arrValue);

						// ============== //
						$addField	= null;
						$addValue	= null;
						unset($data);
						unset($arrValue);
						// ============== //
					}

					// ===================== 4/4 UPDATE imp_expense_ephis_hdr ======================= //
					$data["imp_expense_vsn_hdr_id"]							= $id;
					$data["dc_user_update_id"]								= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_update"]										= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fld} = ?";
					}

					$arrValue[] = $fldd["id"];
					$sql = "
						BEGIN TRANSACTION;
						UPDATE imp_expense_ephis_hdr SET " . substr($addField, 1) . " WHERE imp_expense_ephis_hdr_id = ?;
						COMMIT;";
					$db->QueryParam($sql, $arrValue);

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //

					$re = array(
						"success"	=> true,
						"msg"		=> $msg
					);
				} else {
					$re = array(
						"success"	=> false,
						"msg"		=> "SQL ERROR"
					);
				}
			}
		} else {
			$re = array(
				"success"	=> true,
				"msg"		=> $msg
			);
		}
		// =========================================================== //

		echo json_encode($re);
		exit;
		break;
	case "DELETE":

		// $c_code	= $db->GetDataBySQL("SELECT c_code FROM {$table} WHERE {$key_id}=?;", array($_REQUEST["id"]));
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

		$db->QueryParam("DELETE imp_expense_ephis_dtl WHERE imp_expense_ephis_hdr_id=?;", array($_REQUEST["id"]));
		$db->QueryParam("DELETE imp_expense_ephis_hdr WHERE imp_expense_ephis_hdr_id=?;", array($_REQUEST["id"]));

		$re = array(
			"success"		=> true,
			"msg"			=> "ลบรายการเรียบร้อย"
		);
		// 		}

		break;
}
echo json_encode($re);
exit;
