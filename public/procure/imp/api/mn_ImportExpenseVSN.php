<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$table	= "imp_expense_vsn_hdr";
$key_id	= "imp_expense_vsn_hdr_id";

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {

	case "IMPORT_EXCEL":

		$msg	= "";

		//ขอเบิก
		$num_payment	= 0; // เลขที่ฎีกา

		$rec_payment	= "";

		if (!file_exists('../upload/')) {
			mkdir("../upload/", 0777, true);
		}
		$path_upload	= "../upload/";
		$uploadfile		= $path_upload . $_FILES["dtl_import"]["name"];
		move_uploaded_file($_FILES["dtl_import"]["tmp_name"], $uploadfile); //ย้ายไฟล์จาก Tmp มาไว้โฟรเดอร์ที่กำหนด
		$handle = @fopen($uploadfile, "r"); //เปิดใช้ไฟล์

		if ($handle != "") {

			$totalCount		= 0;
			$countCheque	= 0;
			$n				= 1; // run เลขแถว
			$check_rec		= false; // สถานะเช็คว่ามีรายการข้อเบิกหรือยัง
			$dtlCheque		= array();

			while ($obj = fgetcsv($handle, 1000, ",")) {
				foreach ($obj as $key => $value) {
					$data_conv[$key] = iconv("tis-620", "utf-8//IGNORE", $obj[$key]);
				}

				if ($n >= 5) { //เช็คข้อมูลตั้งแต่บรรทัดที่ 5 ของไฟล์ Excel
					$msg_dtl	= "";

					if ($obj["3"] != "") {

						$temp			= array();
						$check_rec		= false;
						$countCheque	= 0;

						$d_doc					= date("Y-m-d", strtotime($obj["2"]));
						$d_cheque				= date("Y-m-d", strtotime($obj["17"]));
						$c_budget_year			= date("Y", strtotime($obj["2"]));

						$totalCount++;

						$temp["id"]							= $totalCount;
						$temp["no"]							= $totalCount;
						$temp["d_doc"]						= $d_doc;
						$temp["d_doc_show"]					= ($d_doc != "") ? $date->shot_date_from_db($d_doc) : "";
						$temp["c_request"]					= $data_conv["3"];

						$temp["c_request_desc"]				= $data_conv["4"];
						$temp["c_request_form"]				= $data_conv["5"];

							
						

						$temp["c_approve"]					= $data_conv["7"];
						$temp["c_expense_group_main"]		= $data_conv["8"];
						$temp["c_acc_item"]					= $data_conv["9"];
						$temp["dc_expense_group_vsn_id"]	= $db->GetDataBySQL("SELECT TOP 1 a.dc_expense_group_vsn_id FROM dc_expense_group_vsn a WHERE a.c_name LIKE '%{$data_conv["6"]}%';", array());
						$temp["f_inv"]						= str_replace(",", "", $data_conv["10"]);
						$temp["f_tax_personal"]				= str_replace(",", "", $data_conv["11"]);
						$temp["f_social_security"]			= str_replace(",", "", $data_conv["12"]);
						$temp["f_prov_fund"]				= str_replace(",", "", $data_conv["13"]);
						$temp["f_fine"]						= str_replace(",", "", $data_conv["14"]);
						$temp["f_total"]					= ($temp["f_inv"] - ($temp["f_tax_personal"] + $temp["f_social_security"] + $temp["f_prov_fund"] + $temp["f_fine"]));
						$temp["d_cheque"]					= $d_cheque;
						$temp["d_cheque_show"]				= ($d_cheque != "") ? $date->shot_date_from_db($d_cheque) : "";
						$temp["i_type_year"]				= 1;
						$temp["c_budget_year"]				= $c_budget_year;
						$temp["i_cal_gl"]				    = 2;

						${$root}[] = $temp;
					} else if ($obj["18"] == "PAYMENTDATE") {//OLD=16  NEW=18
						$check_rec			= true;
					} else if ($check_rec == true && $data_conv["23"] != "") { //OLD=19  NEW=23

						$dtlCheque[$totalCount][$countCheque]["c_creditor"]				= $data_conv["22"];
						$dtlCheque[$totalCount][$countCheque]["c_cheque"]				= $data_conv["23"];

						$countCheque++;

					}

					$n++;
				} else {
					$n++;
				}
			}

			//=============================== check รายการที่ไม่ถูกต้อง ===============================//
			if ($num_payment > 0) { // ไม่มีเลขที่ฎีกา
				$msg["num_payment"] 	= $num_payment;
				$msg["rec_payment"] 	= $rec_payment;
			} else {
				$db->QueryParam("DELETE tb_cheque_vsn WHERE imp_expense_vsn_hdr_id = ?;", array($_REQUEST["id"]));
				$db->QueryParam("DELETE imp_expense_vsn_item WHERE imp_expense_vsn_hdr_id = ?;", array($_REQUEST["id"]));
				$db->QueryParam("DELETE imp_expense_vsn_dtl WHERE imp_expense_vsn_hdr_id = ?;", array($_REQUEST["id"]));

				$sss	= ${$root};
			//	print_r($dtlCheque);exit;
				// ========================= add dtl ========================= //
				foreach ($sss as $fld) {

					$FIXED_CHEQUE		= 1;
					$FIXED_CREDITOR		= 374;

					// ================== INSERT DTL ================== //
					$dcheque	= $dtlCheque[$fld["id"]];
						

					$dataA["imp_expense_vsn_hdr_id"]				= $_REQUEST["id"];
					$dataA["dc_expense_group_vsn_id"]				= $fld["dc_expense_group_vsn_id"];
					$dataA["cm_pay_type_id"]						= $FIXED_CHEQUE;
					$dataA["dc_acc_id_creditor"]					= $FIXED_CREDITOR;
					$dataA["d_doc"]									= $fld["d_doc"];
					$dataA["c_request"]								= $fld["c_request"];
					$dataA["c_request_desc"]						= $fld["c_request_desc"];
					$dataA["c_request_form"]						= $fld["c_request_form"];
					$dataA["c_approve"]								= $fld["c_approve"];
					$dataA["c_expense_group_main"]					= $fld["c_expense_group_main"];
					$dataA["c_acc_item"]							= $fld["c_acc_item"];
					$dataA["f_inv"]									= $fld["f_inv"];
					$dataA["f_tax_personal"]						= $fld["f_tax_personal"];
					$dataA["f_social_security"]						= $fld["f_social_security"];
					$dataA["f_prov_fund"]							= $fld["f_prov_fund"];
					$dataA["f_fine"]							    = $fld["f_fine"];
					$dataA["f_total"]								= $fld["f_total"];
					$dataA["d_cheque"]								= $fld["d_cheque"];
					$dataA["i_type_year"]							= $fld["i_type_year"];
					$dataA["c_budget_year"]							= $fld["c_budget_year"];
					$dataA["i_cal_gl"]							    = $fld["i_cal_gl"];
					$dataA["dc_user_create_id"]						= $_SESSION["user_id"];
					$dataA["dc_user_create_cost_id"]				= $_SESSION["dc_cost_id"];
					$dataA["d_create"]								= date("Y-m-d H:i:s");
					$dataA["dc_user_update_id"]						= $_SESSION["user_id"];
					$dataA["dc_user_update_cost_id"]				= $_SESSION["dc_cost_id"];
					$dataA["d_update"]								= date("Y-m-d H:i:s");
					$dataA["i_many_doc"]							= "1"; //1=1ฎีกา 1 ผังบัญชี /2=1ฎีกา หลายผังบัญชี 
					$dataA["imp_request_ephis_dtl_id"]				= "0";					
					$dataA["imp_request_vsn_dtl_id"]				= $db->GetDataBySQL("SELECT TOP 1 dtl_id FROM vw_show_request_jv WHERE c_request =? and i_type=?;", array($dataA["c_request_desc"],2));
					 

					foreach ($dataA as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fld}";
						$addValue	.= ", ?";
					}

					$sql	= "
						SET NOCOUNT ON
						INSERT INTO imp_expense_vsn_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						SELECT @@IDENTITY as id;";

					$para	= $db->QueryParam($sql, $arrValue);
					$ss_id	= $db->Fetch($para);
					$id		= $ss_id["id"];

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($dataA);
					unset($arrValue);
					// ============== //

					if ($para) {
						foreach ($dcheque as $key => $vobj) {

							$dataA["imp_expense_vsn_dtl_id"]		= $id;
							$dataA["imp_expense_vsn_hdr_id"]		= $_REQUEST["id"];
							$dataA["c_creditor"]					= $vobj["c_creditor"];
							$dataA["c_cheque"]						= $vobj["c_cheque"];

							foreach ($dataA as $fld => $value) {
								$arrValue[]	= ($value != "") ? $value : null;
								$addField	.= ", {$fld}";
								$addValue	.= ", ?";
							}

							$sql	= "INSERT INTO tb_cheque_vsn (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

							$db->QueryParam($sql, $arrValue);

							// ============== //
							$addField	= null;
							$addValue	= null;
							unset($dataA);
							unset($arrValue);
							// ============== //
						}
					}
				}
			}

			fclose($handle);

			$re	= array("success" => true, "debug" => true, $root => ${$root}, "msg" => $msg, "totalCount" => $totalCount);
		} else {
			$re	= array("success" => true, "debug" => false, "id" => $_REQUEST["id"], "msg" => "ไฟล์ที่เลือกผิดพลาด");
		}

		break;

	case "ADD":
	case "EDIT":

		$msg	= "";

		if ($mode == "ADD") {
			$data["i_post"]									= 1;
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");
		}

		if ($_REQUEST["ITYPE_JV"] == "true") { // แก้ไขได้ เมนูค่าใข้จ่าย
			$data["d_doc_date"]							= $_REQUEST["d_doc_date"];
			$data["c_doc"]								= $_REQUEST["c_doc"];
			$data["c_expense_vsn_period_no"]			= $_REQUEST["c_expense_vsn_period_no"];
			$data["dc_expense_budget_type_id"]			= $_REQUEST["dc_expense_budget_type_id"];
			$data["c_comment"]							= $_REQUEST["c_comment"];
		} else {
			$data["d_save_jv_date"]						= $_REQUEST["d_save_jv_date"];
		}

		$data["dc_bank_acc_company_id_source"]			= $_REQUEST["dc_bank_acc_company_id_source"];
		$data["dc_bank_acc_company_id_target"]			= $_REQUEST["dc_bank_acc_company_id_target"];
		$data["dc_cost_acc_id"]							= $db->GetDataBySQL("SELECT dc_cost_acc_id FROM dc_cost WHERE c_code LIKE '04040100%';", array());
		$data["i_enable"]								= STATUS_ENABLE;
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		if ($mode == "ADD") {

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql	= "	SET NOCOUNT ON
						INSERT INTO {$table} (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						SELECT @@IDENTITY as id;";

			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			$id		= $ss_id["id"];
		} else if ($mode == "EDIT") {

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE {$key_id} = ?";
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
	case "GENCODE":

		$msg = "";
		$count_gx	= $db->GetDataBySQL("
			SELECT
				COUNT(a.gl_tran_hdr_id)
			FROM dbo.gl_tran_hdr a
			WHERE a.table_name = 'imp_expense_vsn_hdr'
				AND a.i_enable = 1
				AND a.table_pk_id = ?;", array($_REQUEST["id"]));

		$Arr = json_decode($_REQUEST["data"], true);
 
		$c_approve = "";
		foreach ($Arr as $ff) {

			$dtl = $db->GetDataBySQL("
				SELECT
					a.c_approve
					,a.f_inv
					,a.f_tax_personal
					,a.f_social_security
					,a.f_prov_fund
					,a.f_fine
					,a.f_total
				FROM dbo.imp_expense_vsn_dtl a
					INNER JOIN dbo.imp_expense_vsn_dtl_cheque b ON a.imp_expense_vsn_dtl_id = b.imp_expense_vsn_dtl_id
				WHERE a.imp_expense_vsn_dtl_id = ?
					AND (
						a.f_inv != {$ff["f_inv"]}
						OR a.f_tax_personal != {$ff["f_tax_personal"]}
						OR a.f_social_security != {$ff["f_social_security"]}
						OR a.f_prov_fund != {$ff["f_prov_fund"]}
						OR a.f_fine != {$ff["f_fine"]}
						OR a.f_total != {$ff["f_total"]}
					)
					;", array($ff["imp_expense_vsn_dtl_id"]));
			$c_approve .= ($dtl["c_approve"]) ? "เลขที่ฎีกา : " . $dtl["c_approve"] . "<br>" : "";
		}
		if ($c_approve != "") {
			$msg .= "ไม่สามารถแก้ไขยอดเงินได้เนื่องจากมีการยืนยันรายการเช็คแล้ว<br>" . $c_approve;
		}

		if ($count_gx > 0) {
			$msg = "ไม่สามารถบันทึกได้เนื่องจากมีการใช้งานข้อมูล IMPV ที่ GX แล้ว";
		}

		if ($msg == "") {
			 
			// ========================= add dtl ========================= //
			foreach ($Arr as $fld) {

				$FIXED_CHEQUE		= 1;
				$FIXED_CREDITOR		= 374;

				if ($fld["i_type_year"] == 1) {
					$data["dc_acc_id"]							= ($fld["dc_expense_acc_vsn_id"] > 0) ? $db->GetDataBySQL("SELECT aa.dc_acc_id FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = " . $fld["dc_expense_acc_vsn_id"], array()) : null;
					$data["dc_acc_id_overlap"]					= null;
				} else {
					$data["dc_acc_id"]							= null;
					$data["dc_acc_id_overlap"]					= ($fld["dc_expense_acc_vsn_id"] > 0) ? $db->GetDataBySQL("SELECT aa.dc_acc_id_overlap FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = " . $fld["dc_expense_acc_vsn_id"], array()) : null;
				}

				$data["i_type_year"]							= $fld["i_type_year"];
				$data["c_budget_year"]							= $fld["c_budget_year"];
				$data["i_cal_gl"]								= $fld["i_cal_gl"];
				$data["c_booking"]								= $fld["c_booking"];
				$data["dc_expense_group_vsn_id"]				= $fld["dc_expense_group_vsn_id"];
				$data["dc_expense_acc_vsn_id"]					= $fld["dc_expense_acc_vsn_id"];
				$data["dc_expense_vsn_id"]						= ($fld["dc_expense_acc_vsn_id"] > 0) ? $db->GetDataBySQL("SELECT aa.dc_expense_vsn_id FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = " . $fld["dc_expense_acc_vsn_id"], array()) : null;

				$data["f_inv"]									= $fld["f_inv"];
				$data["f_tax_personal"]							= $fld["f_tax_personal"];
				$data["f_social_security"]						= $fld["f_social_security"];
				$data["f_prov_fund"]							= $fld["f_prov_fund"];
				$data["f_fine"]									= $fld["f_fine"];
				$data["f_total"]								= $fld["f_total"];
				$data["dc_user_update_id"]						= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
				$data["d_update"]								= date("Y-m-d H:i:s");
 	
				if ($fld["i_system_show"]=="2") {// RQ VSN
					$data["imp_request_vsn_dtl_id"]					= ($fld["imp_request_vsn_dtl_id"]=="") ? "" : $fld["imp_request_vsn_dtl_id"];
					$data["imp_request_ephis_dtl_id"]				= "";
				}
				else if ($fld["i_system_show"]=="1") { // RQ EP
					$data["imp_request_ephis_dtl_id"]				= ($fld["imp_request_ephis_dtl_id"]=="") ? "" : $fld["imp_request_ephis_dtl_id"];
					$data["imp_request_vsn_dtl_id"]					= "";
				} 


				if ($fld["imp_expense_vsn_dtl_id"] > 0) {
					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fld["imp_expense_vsn_dtl_id"];
					$sql		= "UPDATE imp_expense_vsn_dtl SET " . substr($addField, 1) . " WHERE imp_expense_vsn_dtl_id = ?";
					$db->QueryParam($sql, $arrValue);

					// UPDATE ACC ITEM
					$sql_acc	= "
						UPDATE imp_expense_vsn_item
						SET
							dc_acc_id = (
								CASE
									WHEN a.i_type_year = 1 THEN (SELECT aa.dc_acc_id FROM dc_expense_acc_vsn aa where aa.dc_expense_acc_vsn_id = b.dc_expense_acc_vsn_id)
									ELSE NULL
								END),
								dc_acc_id_overlap = (
									CASE
										WHEN a.i_type_year = 1 THEN NULL
										ELSE (SELECT aa.dc_acc_id_overlap FROM dc_expense_acc_vsn aa where aa.dc_expense_acc_vsn_id = b.dc_expense_acc_vsn_id)
									END)
						FROM imp_expense_vsn_dtl a
							INNER JOIN imp_expense_vsn_item b ON a.imp_expense_vsn_dtl_id = b.imp_expense_vsn_dtl_id
						WHERE a.imp_expense_vsn_dtl_id = {$fld["imp_expense_vsn_dtl_id"]}";
					$db->QueryParam($sql_acc, array());
				} else {
					// $data["imp_expense_vsn_hdr_id"]					= $_REQUEST["id"];
					// $data["dc_user_create_id"]						= $_SESSION["user_id"];
					// $data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
					// $data["d_create"]								= date("Y-m-d H:i:s");

					// foreach ($data as $fld => $value) {
					// 	$arrValue[] = ($value != "") ? $value : null;
					// 	$addField .= ", {$fld}";
					// 	$addValue .= ", ?";
					// }

					// $sql	= "	SET NOCOUNT ON
					// 			INSERT INTO {$table} (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
					// 			SELECT @@IDENTITY as id;";

					// $para	= $db->QueryParam($sql, $arrValue);
					// $ss_id	= $db->Fetch($para);
					// $id		= $ss_id["id"];
				}

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
			}

			if ($mode == "GENCODE") {

				$msg	= "";
				$code	= "IMPV";
				$gl_tran_hdr_id_bank = 0;
				$imp	= $db->GetDataBySQL("
					SELECT
						a.c_code
						,a.c_doc
						,a.c_expense_vsn_period_no
						,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
						,ISNULL((SELECT SUM(aa.f_inv) FROM imp_expense_vsn_dtl aa WHERE aa.imp_expense_vsn_hdr_id = a.imp_expense_vsn_hdr_id), 0) AS f_total_amt
					FROM {$table} a WHERE {$key_id}=?;", array($_REQUEST["id"]));

				if ($imp["c_code"] != "0" && $imp["c_code"] != "") {
					$msg	.= "- เลขที่เอกสารนี้ออกเลขแล้ว <font color='blue'><b>" . $imp["c_code"] . "</b></font><br>";
				}

				if ($msg != "") {
					$re	= array("success" => false, "msg" => $msg, "id" => $_REQUEST["id"]);
				} else {

					// ====================== GEN IMPV ====================== //

					list($yyyy, $mm, $dd)	= explode("-", $imp["d_doc_date"]);
					$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$arrValue[]	= "IMPV";
					$arrValue[]	= $yyyy . $mm;
					$arrValue[]	= $_SESSION["user_id"];
					$arrValue[]	= $_SESSION["dc_cost_id"];
					$arrValue[]	= $_REQUEST["id"];

					$arr_gen_code_impv	= $db->GetDataBySQL($sql, $arrValue);

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //

					if ($_REQUEST["id"] == $arr_gen_code_impv["reference_id"]) {

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

						$arrValue[] = $_REQUEST["id"];
						$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE {$key_id} = ?";
						$para		= $db->QueryParam($sql, $arrValue);

						if ($para) {

							$msg	.= "เลขที่ค่าใช้จ่าย : <b style='color:blue;'>" . $arr_gen_code_impv["c_code_gen"] . "</b><br>";
							$re = array(
								"success"	=> true,
								"msg"		=> $msg
							);
						}
						// ============================================================= //
					}
				} // End Else ของลงบัญชี + Gen IMPV
			} else {
				$re	= array("success" => true, "id" => $_REQUEST["id"]);
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

	case "SAVE_DTL_DETAIL":

		$sql   = "";
		$Arr	= json_decode($_REQUEST["data"], true);
		foreach ($Arr as $flds) {

			$data["c_booking"]					= $flds["c_booking"];
			$data["dc_user_update_id"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_update"]					= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $flds["id"];
			$sql    = "UPDATE imp_expense_vsn_dtl SET " . substr($addField, 1) . " WHERE imp_expense_vsn_dtl_id = ?;";
			$db->QueryParam($sql, $arrValue);
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //
		}
		$re = array(
			"success"	=> true,
			"msg"		=> "บันทึกข้อมูลเรียบร้อย"
		);
		// =========================================================== //

		echo json_encode($re);
		exit;
		break;

	case "GENCODEJV":

		$msg	= "";
		$code	= "IMPV";
		$imp	= $db->GetDataBySQL("
			SELECT
				a.c_code
				,a.c_doc
				,a.i_system
				,a.c_expense_vsn_period_no
				,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
				,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date
				,ISNULL((SELECT SUM(aa.f_inv) FROM imp_expense_vsn_dtl aa WHERE aa.imp_expense_vsn_hdr_id = a.imp_expense_vsn_hdr_id), 0) AS f_total_amt
				,(SELECT cc.gl_dc_book_type_id FROM vw_gl_dc_book_doc cc WHERE cc.c_doc_code='IMPV') as fixed_gl_book_id
			FROM {$table} a 
			WHERE {$key_id}=?;", array($_REQUEST["id"]));

		$gl	= $db->GetDataBySQL("SELECT a.gl_tran_hdr_id,b.c_code FROM {$table} a INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id WHERE a.{$key_id}=? AND b.i_enable = 1;", array($_REQUEST["id"]));

		if ($imp["d_save_jv_date"] == "") {
			$msg .= "- กรุณาบันทึก \"วันที่บันทึกค่าใช้จ่าย\" ก่อน<br>";
			$re	= array("success" => false, "msg" => $msg, $key_id => $_REQUEST["id"]);
		} else if ($gl["c_code"] != "0" && $gl["c_code"] != "") {
			$msg .= "- เลขที่บัญชีนี้ออกเลขแล้ว <font color='blue'><b>" . $gl["c_code"] . "</b></font><br>";
			$re	= array("success" => false, "msg" => $msg, $key_id => $_REQUEST["id"]);
		} else {

			list($yyyy, $mm, $dd) = explode("-", $imp["d_doc_date"]);

			// ========================บันทึกบัญชี 1/2 [ธนาคาร ใบปะหน้า] ====================
			$gl_dc_book_type_id_fixed 							= $imp["fixed_gl_book_id"];
			$gl_dc_book_type_general_id_fixed 	= 3;
			$dataBank["c_ref_doc"]								= "ใบปะหน้า " . $imp["c_code"];
			$dataBank["gl_dc_book_type_id"]						= $gl_dc_book_type_general_id_fixed;
			$dataBank["d_doc_date"]								= $imp["d_doc_date"];
			$dataBank["d_save_date"]							= $imp["d_save_jv_date"];
			$dataBank["f_total_amt"]							= $imp["f_total_amt"];
			$dataBank["table_pk_id"]							= $_REQUEST["id"];
			$dataBank["table_name"]								= "imp_expense_vsn_hdr";
			$dataBank["table_detail"]							= "นำเข้าข้อมูลค่าใช้จ่าย VSN";
			$dataBank["c_mm"]									= $mm;
			$dataBank["c_yyyy"]									= $yyyy;
			$dataBank["c_yyyy_mm"]								= $yyyy . $mm;
			$dataBank["c_comment1"]								= "ใบปะหน้า นำเข้าข้อมูลค่าใช้จ่าย VSN " . $imp["c_expense_vsn_period_no"] . " รอบที่ " . $imp["c_doc"] . " เดือน " . $mm . " พ.ศ. " . ($yyyy + 543);
			$dataBank["i_enable"]								= STATUS_ENABLE;
			$dataBank["i_type"]									= 2;
			$dataBank["i_is_post"]								= 2;
			$dataBank["i_is_close_year"]						= 2;
			$dataBank["i_is_reversing"]							= 2;
			$dataBank["i_close_year_type"]						= 9;
			$dataBank["i_preview"]								= 1;
			$dataBank["i_chk_gl_dtl"]							= 1;
			$dataBank["i_chk_gl_purchase"]						= 1;
			$dataBank["c_code"]									= "0";
			$dataBank["c_code_post"]							= "0";
			$dataBank["dc_user_create_id"]						= $_SESSION["user_id"];
			$dataBank["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$dataBank["d_create"]								= date("Y-m-d H:i:s");
			$dataBank["dc_user_update_id"]						= $_SESSION["user_id"];
			$dataBank["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$dataBank["d_update"]								= date("Y-m-d H:i:s");
			$dataBank["i_cancel_doc_expense"]					= 4;
			$addFieldBank  = "";
			$addValueBank = "";

			foreach ($dataBank as $fld => $value) {
				$arrValueBank[]	= ($value != "") ? $value : null;
				$addFieldBank	.= ", {$fld}";
				$addValueBank	.= ", ?";
			}

			$sqlBank	= "
				SET NOCOUNT ON
				INSERT INTO gl_tran_hdr (" . substr($addFieldBank, 1) . ") VALUES (" . substr($addValueBank, 1) . ");
				SELECT @@IDENTITY as id;";

			$para					= $db->QueryParam($sqlBank, $arrValueBank);
			$ss_id					= $db->Fetch($para);
			$gl_tran_hdr_id_bank	= $ss_id["id"];

			// ============== //
			$addFieldBank	= null;
			$addValueBank	= null;
			unset($dataBank);
			unset($arrValueBank);
			$sqlBankDtl	= $stmtBankDtl = $sqlBankDtl3 = "";
			$arrValueBank3 = array();
			// ============== //

			if ($para) {

				// บันทึกบัญชี 1/2 [ธนาคาร ใบปะหน้า]  ADD GL_TRAN_DTL ====================== //
				if ($gl_tran_hdr_id_bank > 0) {

					$dc_cost_acc_id1	= 77; /* 0104040100 : คณะแพทยศาสตร์วชิรพยาบาล */
					$dc_cost_acc_id2	= 36; /* 0104020200 : ฝ่ายการคลัง */

					$sqlBankDtl	= "	
						DECLARE @imp_expense_vsn_hdr_id AS BIGINT = " . $_REQUEST["id"] . ";
						DECLARE @hdr_id AS BIGINT = " . $gl_tran_hdr_id_bank . ";
						DECLARE @dc_cost_acc_id1 AS BIGINT = " . $dc_cost_acc_id1 . ";
						DECLARE @dc_cost_acc_id2 AS BIGINT = " . $dc_cost_acc_id1 . ";
		
						INSERT INTO gl_tran_dtl (
							i_rank
							,gl_tran_hdr_id
							,dc_cost_acc_id
							,dc_acc_id
							,f_dr
							,f_cr
							,i_type_person
							,dc_emp_id
							,dc_debtor_id
							,dc_creditor_id
							,i_is_nontax_exp
							,dc_product_id
							,pk_id1
							,pk_id2
							,i_type_year,dc_expense_budget_type_id,c_budget_year,i_return
						)
						SELECT
							ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_dr DESC) AS i_rank
							,@hdr_id AS gl_tran_hdr_id
							,dc_cost_acc_id
							,dc_acc_id
							,f_dr
							,f_cr
							,0 AS i_type_person
							,0 AS dc_emp_id
							,0 AS dc_debtor_id
							,0 AS dc_creditor_id
							,2 AS i_is_nontax_exp
							,0 AS dc_product_id
							,0 AS pk_id1
							,0 AS pk_id2
							,9 AS i_type_year
							,0 AS dc_expense_budget_type_id
							,NULL AS c_budget_year
							,3 AS i_return
						FROM ( 
							SELECT
									@dc_cost_acc_id1 AS dc_cost_acc_id
									,a.dc_acc_id_bank_source as dc_acc_id
									,sum(a.f_cal_gl) as f_dr
									,0.00 as f_cr
								from vw_vision_net_cal_gl a   
								where a.imp_expense_vsn_hdr_id = @imp_expense_vsn_hdr_id
								group by a.dc_acc_id_bank_source
							UNION
							SELECT
								@dc_cost_acc_id1 AS dc_cost_acc_id
								,a.dc_acc_id_bank_target  as dc_acc_id
								,0.00 as f_dr
								,sum(a.f_cal_gl) as f_cr
							from vw_vision_net_cal_gl a 
							where a.imp_expense_vsn_hdr_id = @imp_expense_vsn_hdr_id
							group by a.dc_acc_id_bank_target
								) a
						ORDER BY i_rank;";

					$stmtBankDtl = $db->QueryParam($sqlBankDtl, array());

					if ($stmtBankDtl) {

						// ====================== GEN GX ====================== // 
						list($yyyy, $mm, $dd)	= explode("-", $imp["d_save_jv_date"]);
						$sqlGenGXCodeBank	= "EXEC SP_GEN_CODE ?,?,?,?,?;";
						$arrValueBankGX[]	= "GX";
						$arrValueBankGX[]	= $yyyy . $mm;
						$arrValueBankGX[]	= $_SESSION["user_id"];
						$arrValueBankGX[]	= $_SESSION["dc_cost_id"];
						$arrValueBankGX[]	= $gl_tran_hdr_id_bank;

						$stmtGenGXCodeBank = $db->QueryParam($sqlGenGXCodeBank, $arrValueBankGX);
						$arr_gen_code_gx_bank = $db->Fetch($stmtGenGXCodeBank);

						// ============== //
						$addFieldBank	= null;
						$addValueBank	= null;
						unset($dataBank);
						unset($arrValueBank);
						// ============== //

						if ($gl_tran_hdr_id_bank == $arr_gen_code_gx_bank["reference_id"]) {

							$chk_gl_dtl_bank = $db->GetDataBySQL("SELECT ISNULL((SELECT 1 FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
														,ISNULL((SELECT 1 FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
														,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
														,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
												FROM gl_tran_hdr aa
												WHERE aa.gl_tran_hdr_id=?", array($gl_tran_hdr_id_bank));
							if (($chk_gl_dtl_bank["no_acc"] > 0) || ($chk_gl_dtl_bank["no_cost"] > 0) || ($chk_gl_dtl_bank["f_tot_dr"] != $chk_gl_dtl_bank["f_tot_cr"])) {
								$i_success_jv_bank = 2;
							} else {
								$i_success_jv_bank = 1;
							}



							$sqlBankDtl3		= " UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";
							$sqlBankDtl3		.= " UPDATE {$table} SET  gl_tran_hdr_id_bank_id = ?  WHERE {$key_id} = ?";

							$arrValueBank3[] = $arr_gen_code_gx_bank["c_code_gen"];
							$arrValueBank3[] = $i_success_jv_bank;
							$arrValueBank3[] = $gl_tran_hdr_id_bank;
							$arrValueBank3[] = $gl_tran_hdr_id_bank;
							$arrValueBank3[] = $_REQUEST["id"];

							if ($para) {
								$para	= $db->QueryParam($sqlBankDtl3, $arrValueBank3);
								$msg	.= "เลขที่สมุดรายวัน  (ใบปะหน้า) : <b style='color:red;'>" . $arr_gen_code_gx_bank["c_code_gen"] . "</b><br>";
							}
							// ============== //
							$addFieldBank	= null;
							$addValueBank	= null;
							unset($dataBank);
							unset($arrValueBank3);
							// ============== //
						}
					}
				}
			}

			/* ======================== บันทึกบัญชี  2/2 [ค่าใช้จ่าย]  ADD GL_TRAN_HDR ======================  */
			
			if ($imp["i_system"]=="2")
			{ //VSN
				$vw_by_request_name 		= "vw_vsn_request_item_gl";
				$fld_request_dtl_id_name	= "imp_request_vsn_dtl_id";
			}
			else if ($imp["i_system"]=="1")
			{ //EP
				$vw_by_request_name 		= "vw_ephis_request_item_gl";
				$fld_request_dtl_id_name	= "imp_request_ephis_dtl_id";
			}

			$data["c_ref_doc"]								= $imp["c_code"];
			$data["gl_dc_book_type_id"]						= $gl_dc_book_type_id_fixed;
			$data["d_doc_date"]								= $imp["d_doc_date"];
			$data["d_save_date"]							= $imp["d_save_jv_date"];
			$data["f_total_amt"]							= $imp["f_total_amt"];
			$data["table_pk_id"]							= $_REQUEST["id"];
			$data["table_name"]								= "imp_expense_vsn_hdr";
			$data["table_detail"]							= "นำเข้าข้อมูลค่าใช้จ่าย VSN";
			$data["c_mm"]									= $mm;
			$data["c_yyyy"]									= $yyyy;
			$data["c_yyyy_mm"]								= $yyyy . $mm;
			$data["c_comment1"]								= "นำเข้าข้อมูลค่าใช้จ่าย VSN " . $imp["c_expense_vsn_period_no"] . " รอบที่ " . $imp["c_doc"] . " เดือน " . $mm . " พ.ศ. " . ($yyyy + 543);
			$data["i_enable"]								= STATUS_ENABLE;
			$data["i_type"]									= 2;
			$data["i_is_post"]								= 2;
			$data["i_is_close_year"]						= 2;
			$data["i_is_reversing"]							= 2;
			$data["i_close_year_type"]						= 9;
			$data["i_preview"]								= 1;
			$data["i_chk_gl_dtl"]							= 1;
			$data["i_chk_gl_purchase"]						= 1;
			$data["c_code"]									= "0";
			$data["c_code_post"]							= "0";
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");
			$data["dc_user_update_id"]						= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_update"]								= date("Y-m-d H:i:s");
			$data["i_cancel_doc_expense"]					= 4;
			$addField  = "";
			$addValue = "";
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld}";
				$addValue	.= ", ?";
			}

			$sql	= "	SET NOCOUNT ON
						INSERT INTO gl_tran_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
						SELECT @@IDENTITY as id;";

			$para			= $db->QueryParam($sql, $arrValue);
			$ss_id			= $db->Fetch($para);
			$gl_tran_hdr_id	= $ss_id["id"];

			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //

			if ($para) {

				// 2/2 ADD GL_TRAN_DTL ====================== //
				if ($gl_tran_hdr_id > 0) {

					$dc_cost_acc_id1			= 77; /* 0104040100 : คณะแพทยศาสตร์วชิรพยาบาล */
					$dc_cost_acc_id2			= 77; /* 0104020200 : ฝ่ายการคลัง */

					$FIXED_WHT_DC_ACC_ID		= 1089;	/* 20102010110  เงินรับฝาก-ภาษีหัก ณ ที่จ่าย */

					$sql	= "	
						DECLARE @imp_expense_vsn_hdr_id AS BIGINT = " . $_REQUEST["id"] . ";
						DECLARE @hdr_id 				AS BIGINT = " . $gl_tran_hdr_id . ";
						DECLARE @dc_cost_acc_id1 		AS BIGINT = " . $dc_cost_acc_id1 . ";
						DECLARE @dc_cost_acc_id2 		AS BIGINT = " . $dc_cost_acc_id2 . ";
						DECLARE @fixed_wht_acc_id		AS BIGINT = " . $FIXED_WHT_DC_ACC_ID . ";
		
						DECLARE @tb_moneyjv2 as table (dc_cost_acc_id bigint
											, dc_acc_id bigint
											, f_dr decimal(18, 2)
											, f_cr decimal(18, 2)
											, i_type_year varchar(5)
											, c_budget_year varchar(50)
											, dc_expense_budget_type_id bigint
											); 				
						INSERT INTO @tb_moneyjv2
							SELECT
								@dc_cost_acc_id1 AS dc_cost_acc_id
								,case 
									when (ISNULL(b.".$fld_request_dtl_id_name.",0)=0) then
										(case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end)
									else
										(f.dc_acc_id_cr)
								end as dc_acc_id
								,case 
									when (ISNULL(b.".$fld_request_dtl_id_name.",0)=0) then SUM(b.f_inv) 
									else SUM(f.f_cr) 
								end AS f_dr 
								,0.00 AS f_cr
								,b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id
							FROM imp_expense_vsn_hdr a
								INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
								LEFT JOIN dc_expense_acc_vsn c ON b.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
								LEFT JOIN ".$vw_by_request_name." f ON f.".$fld_request_dtl_id_name." = b.".$fld_request_dtl_id_name." 			
							WHERE a.imp_expense_vsn_hdr_id = @imp_expense_vsn_hdr_id   and isnull(b.i_many_doc,1)=1
							GROUP BY case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end
									, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id		
									,b.".$fld_request_dtl_id_name.",f.dc_acc_id_cr											
							UNION
							SELECT
								@dc_cost_acc_id1 AS dc_cost_acc_id
								,case 
								when (ISNULL(b.".$fld_request_dtl_id_name.",0)=0) then
									(case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end)
								else
									(f.dc_acc_id_cr)
								end as dc_acc_id
								,case 
									when (ISNULL(b.".$fld_request_dtl_id_name.",0)=0) then SUM(e.f_inv) 
									else SUM(f.f_cr) 
								end AS f_dr
								,0.00 AS f_cr
								,b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id
							FROM imp_expense_vsn_hdr a
								INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
								INNER JOIN imp_expense_vsn_item e on e.imp_expense_vsn_dtl_id = b.imp_expense_vsn_dtl_id
								LEFT JOIN dc_expense_acc_vsn c ON e.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
								LEFT JOIN ".$vw_by_request_name." f ON f.".$fld_request_dtl_id_name." = b.".$fld_request_dtl_id_name." 			
							WHERE a.imp_expense_vsn_hdr_id = @imp_expense_vsn_hdr_id   and isnull(b.i_many_doc,1)=2
							GROUP BY case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end
									, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id
									,b.".$fld_request_dtl_id_name.",f.dc_acc_id_cr	;	 
							
						INSERT INTO gl_tran_dtl (
							i_rank
							,gl_tran_hdr_id
							,dc_cost_acc_id
							,dc_acc_id
							,f_dr
							,f_cr
							,i_type_person
							,dc_emp_id
							,dc_debtor_id
							,dc_creditor_id
							,i_is_nontax_exp
							,dc_product_id
							,pk_id1
							,pk_id2
							,i_type_year,c_budget_year,dc_expense_budget_type_id,i_return
						)
						SELECT
							ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_dr DESC) AS i_rank
							,@hdr_id AS gl_tran_hdr_id
							,dc_cost_acc_id
							,dc_acc_id
							,f_dr
							,f_cr
							,0 AS i_type_person
							,0 AS dc_emp_id
							,0 AS dc_debtor_id
							,0 AS dc_creditor_id
							,2 AS i_is_nontax_exp
							,0 AS dc_product_id
							,0 AS pk_id1
							,0 AS pk_id2
							, i_type_year
							, c_budget_year
							, dc_expense_budget_type_id
							, 3 AS i_return
						FROM (
							/* DR : เจ้าหนี้ จาก vw_vsn_request_item_gl หรือ ค่าใช้จ่ายจากตาราง dc_expense_acc_vsn.dc_acc_id */
							
							SELECT 
								dc_cost_acc_id
								,dc_acc_id
								,sum(f_dr) as f_dr
								,sum(f_cr) as f_cr
								,0 AS i_type_person
								,0 AS dc_emp_id
								,0 AS dc_debtor_id
								,0 AS dc_creditor_id
								,2 AS i_is_nontax_exp
								,0 AS dc_product_id
								,0 AS pk_id1
								,0 AS pk_id2										
								,i_type_year,c_budget_year,dc_expense_budget_type_id  
							FROM @tb_moneyjv2 
							WHERE ISNULL(dc_acc_id,0)>0
							GROUP BY dc_cost_acc_id,dc_acc_id,i_type_year,c_budget_year
									,dc_expense_budget_type_id 
								
							UNION 
							/* CR : กระแสรายวัน */
							SELECT
								@dc_cost_acc_id1 AS dc_cost_acc_id
								, (SELECT TOP 1 nn.dc_acc_id  FROM gl_tran_dtl nn WHERE nn.gl_tran_hdr_id=a.gl_tran_hdr_id_bank_id and nn.f_dr>0) as dc_acc_id
								,0.00 AS f_dr
								,SUM(a.f_cal_gl) AS f_cr
								,0 AS i_type_person
								,0 AS dc_emp_id
								,0 AS dc_debtor_id
								,0 AS dc_creditor_id
								,2 AS i_is_nontax_exp
								,0 AS dc_product_id
								,0 AS pk_id1
								,0 AS pk_id2										
								,9 as i_type_year,NULL as c_budget_year,0 as dc_expense_budget_type_id
							FROM vw_vision_net_cal_gl a 
							WHERE a.imp_expense_vsn_hdr_id = @imp_expense_vsn_hdr_id
							GROUP BY a.gl_tran_hdr_id_bank_id 
							
							UNION 
							/* CR : หัก ณ ที่จ่าย */ 
							SELECT
								77 AS dc_cost_acc_id
								,@fixed_wht_acc_id as dc_acc_id
								,0.00 AS f_dr
								,SUM(a.f_tax_personal) AS f_cr
								,0 AS i_type_person
								,0 AS dc_emp_id
								,0 AS dc_debtor_id
								,0 AS dc_creditor_id
								,2 AS i_is_nontax_exp
								,0 AS dc_product_id
								,0 AS pk_id1
								,0 AS pk_id2										
								,9 as i_type_year,NULL as c_budget_year,0 as dc_expense_budget_type_id
							FROM vw_vision_net_cal_gl a 
							WHERE a.imp_expense_vsn_hdr_id = @imp_expense_vsn_hdr_id and a.i_cal_gl=2
							GROUP BY a.imp_expense_vsn_hdr_id
							HAVING SUM(a.f_tax_personal) > 0 
							) a
						ORDER BY i_rank;";
//echo $sql;exit;
					$stmt = $db->QueryParam($sql, array());

					if ($stmt) {

						// ====================== GEN GX ====================== //
						list($yyyy, $mm, $dd)	= explode("-", $imp["d_save_jv_date"]);
						$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
						$arrValue[]	= "GX";
						$arrValue[]	= $yyyy . $mm;
						$arrValue[]	= $_SESSION["user_id"];
						$arrValue[]	= $_SESSION["dc_cost_id"];
						$arrValue[]	= $gl_tran_hdr_id;

						$arr_gen_code_gx	= $db->GetDataBySQL($sql, $arrValue);

						// ============== //
						$addField	= null;
						$addValue	= null;
						unset($data);
						unset($arrValue);
						// ============== //

						if ($gl_tran_hdr_id == $arr_gen_code_gx["reference_id"]) {
							$chk_gl_dtl_expense = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
														,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
														,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
														,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
												FROM gl_tran_hdr aa
												WHERE aa.gl_tran_hdr_id=?", array($gl_tran_hdr_id));

							if (($chk_gl_dtl_expense["no_acc"] > 0) || ($chk_gl_dtl_expense["no_cost"] > 0) || ($chk_gl_dtl_expense["f_tot_dr"] != $chk_gl_dtl_expense["f_tot_cr"])) {
								$i_success_jv_expense = 2;
							} else {
								$i_success_jv_expense = 1;
							}


							$sql = "UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";

							$arrValue[] = $arr_gen_code_gx["c_code_gen"];
							$arrValue[] = $i_success_jv_expense;
							$arrValue[] = $gl_tran_hdr_id;

							$para	= $db->QueryParam($sql, $arrValue);

							// ============== //
							$addField	= null;
							$addValue	= null;
							unset($data);
							unset($arrValue);
							// ============== //

							// ====================== UPDATE IMPV GX ====================== //
							if ($para) {

								$sql	= "	UPDATE {$table}
											SET
												c_gx_code = ?, gl_tran_hdr_id = ?, gl_tran_hdr_id_bank_id = ?,
												dc_user_update_id_jv = {$_SESSION["user_id"]},
        										dc_user_update_cost_id_jv = {$_SESSION["dc_cost_id"]},
        										d_update_jv = '" . date("Y-m-d H:i:s") . "'
											WHERE {$key_id} = ?;";

								$arrValue[] = $arr_gen_code_gx["c_code_gen"];
								$arrValue[] = $gl_tran_hdr_id;
								$arrValue[] = $gl_tran_hdr_id_bank;
								$arrValue[] = $_REQUEST["id"];

								$para	= $db->QueryParam($sql, $arrValue);
								if ($para) {
									$msg	.= "เลขที่บัญชี : <b style='color:red;'>" . $arr_gen_code_gx["c_code_gen"] . "</b><br>";
									$re = array(
										"success"	=> true,
										"msg"		=> $msg
									);
								}
							}
						}
					}
				}
			}
		}

		echo json_encode($re);
		exit;
		break;


 
	case "DELETE":

		$c_code	= $db->GetDataBySQL("SELECT c_code FROM {$table} WHERE {$key_id}=?;", array($_REQUEST["id"]));
		if ($c_code != "0" && $c_code != "") { // ปรับสถานะเป็นไม่ใช้งาน

			$data["i_enable"]								= STATUS_DISABLE;
			$data["dc_user_update_id"]						= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_update"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE {$key_id} = ?";
			$para		= $db->QueryParam($sql, $arrValue);

			// ephis
			$db->QueryParam("UPDATE imp_expense_ephis_hdr SET imp_expense_vsn_hdr_id = null WHERE imp_expense_vsn_hdr_id = ?;", array($_REQUEST["id"]));

			if ($para) {
				$re = array(
					"success"		=> true,
					"msg"			=> "ปรับสถานะเป็นไม่ใช้งาน"
				);
			} else {
				$re = array(
					"success"		=> false,
					"msg"			=> "error"
				);
			}
		} else { // ลบจริง

			$db->QueryParam("DELETE {$table} WHERE {$key_id}=?;", array($_REQUEST["id"]));
			$db->QueryParam("DELETE imp_expense_vsn_dtl WHERE {$key_id}=?;", array($_REQUEST["id"]));

			$re = array(
				"success"		=> true,
				"msg"			=> "ลบรายการเรียบร้อย"
			);
		}

		break;

	case "DELETE_GX":

		$msg	= "";

		$sql = "UPDATE gl_tran_hdr SET i_enable = " . STATUS_DISABLE . " WHERE table_name = 'imp_expense_vsn_hdr' AND table_pk_id = " . $_REQUEST["id"] . ";";

		$stmt = $db->QueryParam($sql, array());

		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		if ($stmt) {

			$data["c_gx_code"]								= null;
			$data["gl_tran_hdr_id"]							= null;
			$data["gl_tran_hdr_id_bank_id"]					= null;
			$data["dc_user_update_id"]						= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_update"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : null;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[]	= $_REQUEST["id"];
			$sql	= "	UPDATE imp_expense_vsn_hdr SET " . substr($addField, 1) . " WHERE imp_expense_vsn_hdr_id = ?;";

			$db->QueryParam($sql, $arrValue);

			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //

			$re = array(
				"success"		=> true,
				"msg"			=> "ลบรายการเรียบร้อย"
			);
		} else {
			$msg	.= "ไม่สามารถยกเลิก gl_tran_hdr ได้";
			$re	= array("success" => false, "msg" => $msg, $key_id => $_REQUEST["id"]);
			echo json_encode($re);
			exit;
		}
		break;
	case "COPY_DATA":

		$arrJson = array();
		$dir = "../upload/tmpImpCopy/";
		if (!file_exists($dir)) {
			mkdir($dir, 0777, true);
		}

		$cdir = scandir($dir);
		foreach ($cdir as $key => $value) {
			// loop เพื่อลบ temp เก่า
			if (!in_array($value, array(".", ".."))) {
				$filename = $dir . DIRECTORY_SEPARATOR . $value;
				$numdate = 2; // จำนวนวันที่ไม่เกิน
				$date = strtotime(date("Y-m-d"));
				$flie_date = strtotime(date("Y-m-d", filemtime($filename)));
				$datediff = ceil(abs($date - $flie_date) / (60 * 60 * 24));
				if ($datediff > $numdate) {
					unlink($filename);
				}
			}
		}

		$sqlMain = "
				SET NOCOUNT ON;
				SELECT
					b.*
				FROM dbo.imp_expense_vsn_hdr a
					INNER JOIN dbo.imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
				WHERE a.imp_expense_vsn_hdr_id = ?;";
		$stmt = $db->QueryParam($sqlMain, array($_REQUEST["id"]));

		if (sqlsrv_has_rows($stmt) === true) {
			$c_code	= $db->GetDataBySQL("SELECT a.c_code FROM dbo.imp_expense_vsn_hdr a WHERE a.imp_expense_vsn_hdr_id = ?;", array($_REQUEST["id"]));
			$tmp = $dir . $c_code . ".json";
			if ($objFopen = fopen($tmp, "w")) {
				while ($row = $db->Fetch($stmt)) {
					$temp = array(
						"imp_expense_vsn_dtl_id"					=> $row["imp_expense_vsn_dtl_id"],
						"imp_expense_vsn_hdr_id"					=> $row["imp_expense_vsn_hdr_id"],
						"dc_expense_group_vsn_id"					=> $row["dc_expense_group_vsn_id"],
						"dc_expense_vsn_id"							=> $row["dc_expense_vsn_id"],
						"dc_expense_acc_vsn_id"						=> $row["dc_expense_acc_vsn_id"],
						"d_doc"										=> $row["d_doc"],
						"c_request"									=> $row["c_request"],
						"c_approve"									=> $row["c_approve"],
						"c_expense_group_main"						=> $row["c_expense_group_main"],
						"c_acc_item"								=> $row["c_acc_item"],
						"f_inv"										=> $row["f_inv"],
						"f_tax_personal"							=> $row["f_tax_personal"],
						"f_social_security"							=> $row["f_social_security"],
						"f_prov_fund"								=> $row["f_prov_fund"],
						"f_fine"									=> $row["f_fine"],
						"f_total"									=> $row["f_total"],
						"d_cheque"									=> $row["d_cheque"],
						"c_comment"									=> $row["c_comment"],
						"dc_user_create_id"							=> $row["dc_user_create_id"],
						"dc_user_create_cost_id"					=> $row["dc_user_create_cost_id"],
						"d_create"									=> $row["d_create"],
						"dc_user_update_id"							=> $row["dc_user_update_id"],
						"dc_user_update_cost_id"					=> $row["dc_user_update_cost_id"],
						"d_update"									=> $row["d_update"],
						"cm_pay_type_id"							=> $row["cm_pay_type_id"],
						"dc_acc_id_creditor"						=> $row["dc_acc_id_creditor"],
						"c_budget_year"								=> $row["c_budget_year"],
						"i_type_year"								=> $row["i_type_year"],
						"c_booking"									=> $row["c_booking"],
						"dc_acc_id"									=> $row["dc_acc_id"],
						"i_many_doc"								=> $row["i_many_doc"],
						"dc_acc_id_overlap"							=> $row["dc_acc_id_overlap"],
						"i_status"									=> $row["i_status"],
						"d_cancel_doc"								=> $row["d_cancel_doc"],
						"d_save_jv_cancel"							=> $row["d_save_jv_cancel"],
						"imp_cancel_doc_expense_id"					=> $row["imp_cancel_doc_expense_id"],
						"i_cal_gl"									=> $row["i_cal_gl"],
					);
					$arrJson[] = $temp;
				}
				fwrite($objFopen, json_encode($arrJson));
			}

			$re = array(
				"success"		=> true,
				"msg"			=> "คัดลอกเรียบร้อย",
				"id"			=> $_REQUEST["id"]
			);
		} else {
			$re = array(
				"success"		=> false,
				"msg"			=> "error",
				"id"			=> $_REQUEST["id"]
			);
		}

		break;

	case "PASTE_DATA":

		$c_code	= $db->GetDataBySQL("SELECT a.c_code FROM dbo.imp_expense_vsn_hdr a WHERE a.imp_expense_vsn_hdr_id = ?;", array($_REQUEST["id"]));
		$dir = "../upload/tmpImpCopy/" . DIRECTORY_SEPARATOR . $c_code . ".json";
		if (file_exists($dir)) {
			$myfile = fopen($dir, "r") or die("Unable to open file!");
			$row = json_decode(fread($myfile, filesize($dir)), true);
			fclose($myfile);

			$re = array(
				"success"		=> true,
				"msg"			=> "",
				$root			=> $row
			);
		} else {
			$re = array(
				"success"		=> false,
				"msg"			=> "ไม่พบข้อมูล",
				"id"			=> $_REQUEST["id"]
			);
		}

		break;
}
echo json_encode($re);
exit;
