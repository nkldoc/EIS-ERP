<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$table	= "gl_bank";

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {

	case "ADD":
	case "EDIT":

		$msg	= "";

		$bank	= $db->GetDataBySQL("SELECT
										a.c_code
										,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
										,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date
									FROM {$table} a WHERE gl_bank_id = ?;", array($_REQUEST["id"]));

		if ($mode == "ADD") {
			$data["i_enable"]								= STATUS_ENABLE;
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");
		}

		$data["gl_dc_book_type_id_bank_id"]				= $_REQUEST["gl_dc_book_type_id_bank_id"];
		$data["gl_dc_book_type_id"]						= $_REQUEST["gl_dc_book_type_id"];
		$data["dc_bank_acc_company_id_source"]			= $_REQUEST["dc_bank_acc_company_id_source"];
		$data["dc_bank_acc_company_id_source2"]			= $_REQUEST["dc_bank_acc_company_id_source2"];
		$data["dc_bank_acc_company_id_target"]			= $_REQUEST["dc_bank_acc_company_id_target"];
		$data["d_save_jv_date"]							= $_REQUEST["d_save_jv_date"];
		$data["f_money"]								= $_REQUEST["f_money"];
		$data["i_type_jv"]								= $_REQUEST["i_type_jv"];
		$data["c_doc"]									= $_REQUEST["c_doc"];
		$data["c_doc_bank"]								= $_REQUEST["c_doc_bank"];
		$data["dc_acc_id"]								= $_REQUEST["dc_acc_id"];
		$data["d_doc_date"]								= $_REQUEST["d_doc_date"];
		$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");
		$data["i_return"]								= $_REQUEST["i_return"];
		$data["dc_expense_budget_type_id"]				= $_REQUEST["dc_expense_budget_type_id"];

		if ($_REQUEST["i_type_year"] != "9") {
			$data["i_type_year"]							= $_REQUEST["i_type_year"];
			$data["c_budget_year"]							= $_REQUEST["c_budget_year"];
		} else {
			$data["i_type_year"]							= "9";
			$data["c_budget_year"]							= "";
		}

		if ($mode == "ADD") {

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : NULL;
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
				$arrValue[]	= ($value != "") ? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE gl_bank_id = ?";
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

	case "SAVE_CHEQUE":

		$sql		= "DELETE gl_bank_cheque WHERE i_status != 2 AND gl_bank_id = " . $_REQUEST["id"];
		$para		= $db->QueryParam($sql, array());
		if ($para) {

			$data_dtl	= json_decode(@$_REQUEST["data"], true);
			$d_cheque	= $db->GetDataBySQL("SELECT CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque FROM dbo.gl_bank a WHERE a.gl_bank_id = ?;", array($_REQUEST["id"]));
			if (is_array($data_dtl) && count($data_dtl) > 0) {
				foreach ($data_dtl as $index => $jObj) {

					$data["gl_bank_id"]				= $_REQUEST["id"];
					$data["dc_cheque_id"]			= $jObj["dc_cheque_id"];
					$data["d_cheque"]				= $d_cheque;
					$data["f_cheque"]				= $jObj["f_cheque"];

					foreach ($data as $fld => $val) {
						$arrValue[] = ($val != "") ? $val : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql .= "INSERT INTO gl_bank_cheque (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					// ============== //
				}

				$para	= $db->QueryParam($sql, $arrValue);
			}
			$re = array(
				"id"		=> $_REQUEST["id"],
				"success"	=> true
			);
			echo json_encode($re);
			exit;
		}
		break;

	case "GENCODE":

		$msg	= "";

		$bank	= $db->GetDataBySQL("	SELECT
											a.c_code
											,b.gl_tran_hdr_id
											,c.gl_tran_hdr_id AS gl_tran_hdr_id_bank_id
											,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
											,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date 
										FROM gl_bank a
											LEFT JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
											LEFT JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = b.gl_tran_hdr_id
										WHERE gl_bank_id = ?;", array($_REQUEST["id"]));

		if (
			$bank["c_code"] != "0" && $bank["c_code"] != ""
			&& ($bank["gl_tran_hdr_id"] > 0 || $bank["gl_tran_hdr_id_bank_id"] > 0)
		) {

			$msg	.= "- เลขที่บัญชีนี้ออกเลข GX แล้ว <font color='blue'><b>" . $bank["c_code"] . "</b></font><br>";
			$re	= array("success" => false, "msg" => $msg, "gl_bank_id" => $_REQUEST["id"]);
		} else {

			if ($bank["c_code"] != "0" && $bank["c_code"] != "") {
			} else {
				// ====================== GEN BTN ====================== //

				list($yyyy, $mm, $dd)	= explode("-", $bank["d_doc_date"]);
				$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
				$arrValue[]	= "BTN";
				$arrValue[]	= $yyyy . $mm;
				$arrValue[]	= $_SESSION["user_id"];
				$arrValue[]	= $_SESSION["dc_cost_id"];
				$arrValue[]	= $_REQUEST["id"];

				$arr_gen_code_btn	= $db->GetDataBySQL($sql, $arrValue);

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				if ($_REQUEST["id"] == $arr_gen_code_btn["reference_id"]) {

					$data["c_code"]						= $arr_gen_code_btn["c_code_gen"];
					$data["dc_user_update_id"]			= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
					$data["d_update"]					= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : NULL;
						$addField	.= ", {$fld} = ?";
					}

					$arrValue[] = $_REQUEST["id"];
					$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE gl_bank_id = ?";
					$para		= $db->QueryParam($sql, $arrValue);

					if ($para) {
						$msg	.= "เลขที่โอนระหว่างธนาคาร : <b style='color:blue;'>" . $arr_gen_code_btn["c_code_gen"] . "</b><br>";
					}

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //
				}
			}

			$btn	= $db->GetDataBySQL("SELECT
											a.c_code
											,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
											,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date
											,ISNULL(a.f_money, 0) AS f_money
											,a.c_doc
											,a.c_doc_bank
											,a.gl_dc_book_type_id
											,a.gl_dc_book_type_id_bank_id	
											,ISNULL(a.i_return,3) AS i_return
											, case when (a.dc_expense_budget_type_id>0) then a.c_budget_year else NULL end as c_budget_year
											,a.dc_expense_budget_type_id
											,ISNULL(a.i_type_year,9) AS i_type_year												
										FROM {$table} a WHERE gl_bank_id = ?;", array($_REQUEST["id"]));

			list($yyyy, $mm, $dd)	= explode("-", $btn["d_save_jv_date"]);

			// ========================บันทึกบัญชี 1/2 [ธนาคาร ใบปะหน้า] ====================
			$gl_dc_book_type_id_book_general 	= 3;

			$dataBank["c_ref_doc"]								= $btn["c_doc_bank"];
			$dataBank["gl_dc_book_type_id"]						= $btn["gl_dc_book_type_id_bank_id"];
			$dataBank["d_doc_date"]								= $btn["d_doc_date"];
			$dataBank["d_save_date"]							= $btn["d_save_jv_date"];
			$dataBank["f_total_amt"]							= $btn["f_money"];
			$dataBank["table_pk_id"]							= $_REQUEST["id"];
			$dataBank["table_name"]								= "gl_bank";
			$dataBank["table_detail"]							= "บันทึกบัญชีโอนระหว่างธนาคาร";
			$dataBank["c_mm"]									= $mm;
			$dataBank["c_yyyy"]									= $yyyy;
			$dataBank["c_yyyy_mm"]								= $yyyy . $mm;
			$dataBank["c_comment1"]								= "ใบปะหน้า " . $btn["c_code"] . " บันทึกบัญชีโอนระหว่างธนาคาร  เดือน " . $mm . " พ.ศ. " . ($yyyy + 543);
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

			$addFieldBank  = "";
			$addValueBank = "";

			foreach ($dataBank as $fld => $value) {
				$arrValueBank[]	= ($value != "") ? $value : NULL;
				$addFieldBank	.= ", {$fld}";
				$addValueBank	.= ", ?";
			}

			$sqlBank	= "	SET NOCOUNT ON
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
			// ============== //

			if ($para) {

				// บันทึกบัญชี 1/2 [ธนาคาร ใบปะหน้า]  ADD GL_TRAN_DTL ====================== //
				if ($gl_tran_hdr_id_bank > 0) {

					$dc_cost_acc_id1	= 77; /* 0104040100 : คณะแพทยศาสตร์วชิรพยาบาล */
					$dc_cost_acc_id2	= 36; /* 0104020200 : ฝ่ายการคลัง */

					$sqlBank	= "	DECLARE @gl_bank_id AS BIGINT = " . $_REQUEST["id"] . ";
									DECLARE @hdr_id AS BIGINT = " . $gl_tran_hdr_id_bank . ";
									DECLARE @dc_cost_acc_id1 AS BIGINT = " . $dc_cost_acc_id1 . ";
									DECLARE @dc_cost_acc_id2 AS BIGINT = " . $dc_cost_acc_id2 . ";
	
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
									FROM (
										SELECT
											@dc_cost_acc_id1 AS dc_cost_acc_id
											,(SELECT bank.dc_acc_id FROM dc_bank_acc_company bank WHERE bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source) AS dc_acc_id
											,a.f_money as f_dr
											,0.00 as f_cr
										FROM gl_bank a
										WHERE a.gl_bank_id = @gl_bank_id
										UNION
										SELECT
											@dc_cost_acc_id1 AS dc_cost_acc_id
											,(SELECT bank.dc_acc_id FROM dc_bank_acc_company bank WHERE bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_target) AS dc_acc_id
											, 0.00 as f_dr
											,a.f_money as f_cr
										FROM gl_bank a
										WHERE a.gl_bank_id = @gl_bank_id ) a
									ORDER BY i_rank;";

					$stmt = $db->QueryParam($sqlBank, array());

					if ($stmt) {

						// ====================== GEN GX ====================== //
						list($yyyy, $mm, $dd)	= explode("-", $btn["d_save_jv_date"]);
						$sqlBank		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
						$arrValueBank[]	= "GX";
						$arrValueBank[]	= $yyyy . $mm;
						$arrValueBank[]	= $_SESSION["user_id"];
						$arrValueBank[]	= $_SESSION["dc_cost_id"];
						$arrValueBank[]	= $gl_tran_hdr_id_bank;

						$arr_gen_code_gx_bank	= $db->GetDataBySQL($sqlBank, $arrValueBank);

						// ============== //
						$addFieldBank	= null;
						$addValueBank	= null;
						unset($dataBank);
						unset($arrValueBank);
						// ============== //

						if ($gl_tran_hdr_id_bank == $arr_gen_code_gx_bank["reference_id"]) {

							$sqlBank		= "UPDATE gl_tran_hdr SET c_code = ? WHERE gl_tran_hdr_id = ?;";
							$sqlBank		.= " UPDATE {$table} SET  gl_tran_hdr_id_bank_id = ?  WHERE gl_bank_id = ?";

							$arrValueBank[] = $arr_gen_code_gx_bank["c_code_gen"];
							$arrValueBank[] = $gl_tran_hdr_id_bank;
							$arrValueBank[] = $gl_tran_hdr_id_bank;
							$arrValueBank[] = $_REQUEST["id"];

							if ($para) {
								$para	= $db->QueryParam($sqlBank, $arrValueBank);
								$msg	.= "เลขที่สมุดรายวัน  (ใบปะหน้า) : <b style='color:red;'>" . $arr_gen_code_gx_bank["c_code_gen"] . "</b><br>";
							}
							// ============== //
							$addFieldBank	= null;
							$addValueBank	= null;
							unset($dataBank);
							unset($arrValueBank);
							// ============== //
						}
					}
				}
			}

			/* ======================== บันทึกบัญชี  2/2 [ค่าใช้จ่าย]  ADD GL_TRAN_HDR ======================  */

			$data["c_ref_doc"]								= $btn["c_doc"];
			$data["gl_dc_book_type_id"]						= $btn["gl_dc_book_type_id"];
			$data["d_doc_date"]								= $btn["d_doc_date"];
			$data["d_save_date"]							= $btn["d_save_jv_date"];
			$data["f_total_amt"]							= $btn["f_money"];
			$data["table_pk_id"]							= $_REQUEST["id"];
			$data["table_name"]								= "gl_bank";
			$data["table_detail"]							= "บันทึกบัญชีโอนระหว่างธนาคาร";
			$data["c_mm"]									= $mm;
			$data["c_yyyy"]									= $yyyy;
			$data["c_yyyy_mm"]								= $yyyy . $mm;
			$data["c_comment1"]								= "รายละเอียดใบปะหน้า " . $btn["c_code"] . " บันทึกบัญชีโอนระหว่างธนาคาร  เดือน " . $mm . " พ.ศ. " . ($yyyy + 543);
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

			$addField  = "";
			$addValue = "";
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : NULL;
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

					$dc_cost_acc_id1	= 77; /* 0104040100 : คณะแพทยศาสตร์วชิรพยาบาล */
					$dc_cost_acc_id2	= 36; /* 0104020200 : ฝ่ายการคลัง */

					$sql	= "	DECLARE @gl_bank_id AS BIGINT = " . $_REQUEST["id"] . ";
								DECLARE @hdr_id AS BIGINT = " . $gl_tran_hdr_id . ";
								DECLARE @dc_cost_acc_id1 AS BIGINT = " . $dc_cost_acc_id1 . ";
								DECLARE @dc_cost_acc_id2 AS BIGINT = " . $dc_cost_acc_id2 . ";
			
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
									,i_return
									,i_type_year
									,c_budget_year
									,dc_expense_budget_type_id
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
									,i_return
									,i_type_year
									,c_budget_year
									,dc_expense_budget_type_id		
								FROM (
								SELECT
									@dc_cost_acc_id1 AS dc_cost_acc_id
									,(SELECT bank.dc_acc_id FROM dc_bank_acc_company bank WHERE bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source2) AS dc_acc_id
									,case when (a.i_type_jv=2) then 0.00 else a.f_money end as f_dr
									,case when (a.i_type_jv=2) then a.f_money else 0.00 end as f_cr
									,3 as i_return
									,9 as i_type_year
									,NULL as c_budget_year
									,0 as dc_expense_budget_type_id										
								FROM gl_bank a
								WHERE a.gl_bank_id = @gl_bank_id
								UNION
								SELECT
									@dc_cost_acc_id1 AS dc_cost_acc_id
									,a.dc_acc_id
									,case when (a.i_type_jv=2) then a.f_money  else 0.00 end as f_dr
									,case when (a.i_type_jv=2) then 0.00  else a.f_money end as f_cr 
									,ISNULL(a.i_return,3) as i_return
									,ISNULL(a.i_type_year,9) as i_type_year
									,a.c_budget_year
									,ISNULL(a.dc_expense_budget_type_id,0) as dc_expense_budget_type_id											
								FROM gl_bank a
								WHERE a.gl_bank_id = @gl_bank_id ) a
								ORDER BY i_rank;";

					$stmt = $db->QueryParam($sql, array());

					if ($stmt) {

						// ====================== GEN GX ====================== //
						list($yyyy, $mm, $dd)	= explode("-", $btn["d_save_jv_date"]);
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

							$sql	= "UPDATE gl_tran_hdr SET c_code = ? WHERE gl_tran_hdr_id = ?;";

							$arrValue[] = $arr_gen_code_gx["c_code_gen"];
							$arrValue[] = $gl_tran_hdr_id;

							$para	= $db->QueryParam($sql, $arrValue);

							// ============== //
							$addField	= null;
							$addValue	= null;
							unset($data);
							unset($arrValue);
							// ============== //

							// ====================== UPDATE BTN GX ====================== //
							if ($para) {

								$sql	= "	UPDATE {$table} SET gl_tran_hdr_id = ?, gl_tran_hdr_id_bank_id = ? WHERE gl_bank_id = ?;";

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

	case "CANCEL":

		$gl = $db->GetDataBySQL("	SELECT
										a.gl_tran_hdr_id, a.gl_tran_hdr_id_bank_id
										,ISNULL(b.i_is_post, 1) AS i_is_post
										,ISNULL(c.i_is_post, 1) AS i_is_post_bank
									FROM gl_bank a
										LEFT JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
										LEFT JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = b.gl_tran_hdr_id
									WHERE a.gl_bank_id=?;", array($_REQUEST["id"]));

		if ($gl["i_is_post"] <= 2 && $gl["i_is_post_bank"] <= 2) {

			$sql = "	UPDATE gl_tran_hdr SET i_enable = " . STATUS_DISABLE . " WHERE gl_tran_hdr_id = " . $gl["gl_tran_hdr_id"] . ";
						UPDATE gl_tran_hdr SET i_enable = " . STATUS_DISABLE . " WHERE gl_tran_hdr_id = " . $gl["gl_tran_hdr_id_bank_id"] . ";";

			$stmt = $db->QueryParam($sql, array());

			// ============== //
			$addField = null;
			$addValue = null;
			unset($data);
			unset($arrValue);
			// ============== //

			if ($stmt) {

				$data["gl_tran_hdr_id"]			= NULL;
				$data["gl_tran_hdr_id_bank_id"]	= NULL;
				$data["dc_user_update_id"]			= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_update"]					= date("Y-m-d H:i:s");

				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "") ? $value : NULL;
					$addField .= ", {$fld} = ?";
				}

				$arrValue[] = $_REQUEST["id"];
				$sql = "	UPDATE {$table} SET " . substr($addField, 1) . " WHERE gl_bank_id = ?;";

				$stmChkMaster = $db->QueryParam($sql, $arrValue);

				// ============== //
				$addField = null;
				$addValue = null;
				unset($data);
				unset($arrValue);
				// ============== //

				$re = array(
					"success"		=> true,
					"msg"			=> "ยกเลิก GX แล้ว"
				);
			} else {
				$re	= array(
					"success"		=> false,
					"msg"			=> "ไม่สามารถยกเลิก gl_tran_hdr ได้",
					"id"			=> $_REQUEST["id"]
				);
			}
		} else {
			$re = array(
				"success"		=> false,
				"msg"			=> "มีบางรายการออกเลข GL แล้ว !!"
			);
		}

		break;

	case "DELETE":

		$bank	= $db->GetDataBySQL("SELECT
										c_code
										,gl_tran_hdr_id
										,gl_tran_hdr_id_bank_id
									FROM {$table} WHERE gl_bank_id = ?;", array($_REQUEST["id"]));

		if ($bank["gl_tran_hdr_id"] > 0 || $bank["gl_tran_hdr_id_bank_id"] > 0) {
			$c_code_gl		= $db->GetDataBySQL("SELECT c_code FROM gl_tran_hdr WHERE gl_tran_hdr_id=? AND i_enable=1;", array($bank["gl_tran_hdr_id"]));
			$c_code_gl_bank	= $db->GetDataBySQL("SELECT c_code FROM gl_tran_hdr WHERE gl_tran_hdr_id=? AND i_enable=1;", array($bank["gl_tran_hdr_id_bank_id"]));
		}

		if ((@$c_code_gl != "0" && @$c_code_gl != "") ||
			(@$c_code_gl_bank != "0" && @$c_code_gl_bank != "")
		) {
			$re = array(
				"success"		=> false,
				"msg"			=> "กรุณายกเลิกรายการ GX ก่อน"
			);
		} else if ($bank["c_code"] != "0" && $bank["c_code"] != "") { // ปรับสถานะเป็นไม่ใช้งาน

			$data["i_enable"]								= STATUS_DISABLE;
			$data["dc_user_update_id"]						= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_update"]								= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "") ? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}

			$arrValue[] = $_REQUEST["id"];
			$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE gl_bank_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);

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

			$db->QueryParam("DELETE {$table} WHERE gl_bank_id = ?;", array($_REQUEST["id"]));

			$re = array(
				"success"		=> true,
				"msg"			=> "ลบรายการเรียบร้อย"
			);
		}

		break;

	case "CANCEL_GL": // ยกเลิก GL-BTN เท่านั้น

		$msg	= "";
		$sql	= "";

		$c_cheques	= "";
		$arr_penguin  = array();

		$dataC	= json_decode(@$_REQUEST["data"], true);
		if (is_array($dataC) && count($dataC) > 0) {
			$in	= "";
			foreach ($dataC as $index => $jObj) {
				$in	.= ($in == "") ? $jObj["cheque_id"] : "," . $jObj["cheque_id"];
				$arr_penguin[] = $jObj["cheque_id"];
			}
			$c_cheques	= "(" . $in . ")";
		}



		$arr_btn				= $db->GetDataBySQL("SELECT f_money,ISNULL(a.i_status,2) as i_status,gl_tran_hdr_id,gl_tran_hdr_id_bank_id FROM gl_bank a WHERE a.gl_bank_id = ?;", array($_REQUEST["id"]));
		$i_status				= $arr_btn["i_status"];
		$btn_id					= $_REQUEST["id"];
		$i_cancel_doc_expense 	= 3;

		$dc_user_update_id 						= $_SESSION["user_id"];
		$dc_user_update_cost_id 				= $_SESSION["dc_cost_id"];

		if ($i_status == 1) { // สถานะจ่ายเงินของ BTN (1=BTN จ่ายเงิน [Default] , 2 = ยกเลิก BTN เช็ค และการจ่ายเงิน)
			$d_save_jv_cancel					= $_REQUEST["d_save_jv_cancel"];
			$gl_dc_book_type_general_id_fixed 	= 3;
			$gl_dc_book_type_pay_id_fixed 		= 2;
			list($yyyyc1, $mmc1, $ddc1) 			= explode("-", $d_save_jv_cancel);
			$c_yyyy_mmc1 						= $yyyyc1 . $mmc1;

			/* ============================== 1/2 ลงบัญชี กลับข้าง ของ GL [ ธนาคาร]    =============================== */
			$sqlBTNBankCancel = "	
											SET NOCOUNT ON
											
											DECLARE @btn_id 						as bigint 			= {$btn_id};
											DECLARE @d_save_date 					as varchar(10) 		= '{$d_save_jv_cancel}';
											DECLARE @strM 							as varchar(50) 		= '{$mmc1}';
											DECLARE @strY 							as varchar(4) 		= '" . ($yyyyc1 + 543) . "';
											DECLARE @create_id 						as bigint 			= {$dc_user_update_id};
											DECLARE @create_cost_id 				as bigint 			= {$dc_user_update_cost_id};
											DECLARE @gl_dc_book_type_id_bank_fixed 	as bigint 			= {$gl_dc_book_type_general_id_fixed};
 											DECLARE @i_cancel_doc_expense 			as tinyint			= {$i_cancel_doc_expense};
											DECLARE @f_money 						as decimal(18,2)	= {$arr_btn["f_money"]};
											
									/*insert gl_tran_hdr*/
									insert into gl_tran_hdr(c_ref_doc, gl_dc_book_type_id, d_doc_date
																, d_save_date, f_total_amt, table_pk_id
																, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
																, c_comment1, i_enable, i_type, i_is_post, i_is_close_year
																, i_is_reversing, i_close_year_type, i_preview
																, i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
																, dc_user_create_id, dc_user_create_cost_id, d_create
																, dc_user_update_id, dc_user_update_cost_id, d_update
																, i_cancel_doc_expense)
									select  a.c_code+ ' (ยกเลิกเงินฝากธนาคาร)'  as c_ref_doc
											, @gl_dc_book_type_id_bank_fixed as gl_dc_book_type_id
											, convert(datetime, @d_save_date, 102) as d_doc_date
											, convert(datetime, @d_save_date, 102) as d_save_date
											, (SELECT SUM(b.f_cheque) FROM gl_bank_cheque b WHERE b.gl_bank_cheque_id in $c_cheques) as f_total_amt
											, @btn_id as table_pk_id
											, '$table' as table_name
											, 'บันทึกบัญชีโอนระหว่างธนาคาร' as table_detail
											, right(left(@d_save_date,7),2) as c_mm
											, left(@d_save_date,4) as c_yyyy
											, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
											, a.c_code+ '( ยกเลิกเงินฝากธนาคาร สำหรับ ' +a.c_code+' )' as c_comment1
											, 1 as i_enable
											, 2 as i_type
											, 2 as i_is_post
											, 2 as i_is_close_year
											, 2 as i_is_reversing
											, 9 as i_close_year_type
											, 1 as i_preview
											, 1 as i_chk_gl_dtl
											, 1 as i_chk_gl_purchase
											, '0' as c_code
											, '0' as c_code_post
											, @create_id
											, @create_cost_id
											, getdate()
											, @create_id
											, @create_cost_id
											, getdate()
											, @i_cancel_doc_expense
									from $table a
									where a.gl_bank_id = ?;";

			$sqlBTNBankCancel .= "SELECT @@IDENTITY as hdr_id";

			$stmtBankCancel 		= $db->QueryParam($sqlBTNBankCancel, array($btn_id));
			$arr_gx_bank_cancel 	= $db->Fetch($stmtBankCancel);
			$gl_hdr_id_bank_cancel 	= $arr_gx_bank_cancel["hdr_id"];

			if ($gl_hdr_id_bank_cancel > 0) {
				$sqlBankGXDtl1 = "	 
												DECLARE @btn_id 				as bigint 			= {$btn_id}; 
												declare @new_gx_btn_bank_id 	as bigint = ?; 
												declare	@old_gx_btn_bank_id  	as bigint = ?;
						
									insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
															, dc_acc_id, f_cr, f_dr
															, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
															, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 
															, i_type_year,c_budget_year,dc_expense_budget_type_id
															, i_return)
									select ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_cr asc) as i_rank
										, @new_gx_btn_bank_id as gl_tran_hdr_id
										, dc_cost_acc_id
										, dc_acc_id 
										, f_cr 
										, f_dr
										, 0 as i_type_person
										, 0 as dc_emp_id
										, 0 as dc_debtor_id
										, 0 as dc_creditor_id
										, 2 as i_is_nontax_exp
										, 0 as dc_product_id
										, 0 as pk_id1
										, 0 as pk_id2
										, 9 as i_type_year
										, NULL as c_budget_year
										, 0 as dc_expense_budget_type_id
										, 3 as i_return
									from ( SELECT
												77 AS dc_cost_acc_id
												,(SELECT bank.dc_acc_id FROM dc_bank_acc_company bank WHERE bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_target) AS dc_acc_id
												, 0.00 as f_cr
												,SUM(b.f_cheque) as f_dr
											FROM gl_bank a INNER JOIN gl_bank_cheque b ON a.gl_bank_id = b.gl_bank_id
											WHERE a.gl_bank_id = @btn_id and b.gl_bank_cheque_id in $c_cheques
											group by a.dc_acc_id,a.dc_bank_acc_company_id_target
											 UNION 
											 SELECT
												77 AS dc_cost_acc_id
												,(SELECT bank.dc_acc_id FROM dc_bank_acc_company bank WHERE bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source) AS dc_acc_id
												,SUM(b.f_cheque) as f_cr
												,0.00 as f_dr
											FROM gl_bank a INNER JOIN gl_bank_cheque b ON a.gl_bank_id = b.gl_bank_id
											WHERE a.gl_bank_id = @btn_id and b.gl_bank_cheque_id in $c_cheques
											group by a.dc_acc_id,a.dc_bank_acc_company_id_source
										) a
									order by i_rank;";

				$stmt22 = $db->QueryParam($sqlBankGXDtl1, array(
					$gl_hdr_id_bank_cancel,
					$arr_btn["gl_tran_hdr_id_bank_id"]
				));


				if ($stmt22) {
					$code_gen = "GX";
					$arrParamBankGencode = array(
						$code_gen,
						$c_yyyy_mmc1,
						$dc_user_update_id,
						$dc_user_update_cost_id,
						$gl_hdr_id_bank_cancel
					);
					$sqlGenCode = "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$stmtGenCode = $db->QueryParam($sqlGenCode, $arrParamBankGencode);

					$arr_gen_code = $db->Fetch($stmtGenCode);
					$c_code = $arr_gen_code["c_code_gen"];
					$ref_id = $arr_gen_code["reference_id"];

					if ($gl_hdr_id_bank_cancel == $ref_id) {

						$chk_gl_dtl_bank = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
																			,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
																			,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
																			,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
																	FROM gl_tran_hdr aa
																	WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id_bank_cancel));
						if (($chk_gl_dtl_bank["no_acc"] > 0) || ($chk_gl_dtl_bank["no_cost"] > 0) || ($chk_gl_dtl_bank["f_tot_dr"] != $chk_gl_dtl_bank["f_tot_cr"])) {
							$i_success_jv_bank = 2;
						} else {
							$i_success_jv_bank = 1;
						}


						$sqlIMP = "UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";

						$stmt3 = $db->QueryParam($sqlIMP, array(
							$c_code,
							$i_success_jv_bank,
							$gl_hdr_id_bank_cancel
						));
						$code_gen = $c_code;
					}
				}
			}

			/* ============================== 2/2 ลงบัญชี กลับข้าง ของ GL [ค่าใช้จ่าย]    =============================== */
			$sqlBTNExpenseCancel = "	
										SET NOCOUNT ON
										
											DECLARE @btn_id 						as bigint 			= {$btn_id};
											DECLARE @d_save_date 					as varchar(10) 		= '{$d_save_jv_cancel}';
											DECLARE @strM 							as varchar(50) 		= '{$mmc1}';
											DECLARE @strY 							as varchar(4) 		= '" . ($yyyyc1 + 543) . "';
											DECLARE @create_id 						as bigint 			= {$dc_user_update_id};
											DECLARE @create_cost_id 				as bigint 			= {$dc_user_update_cost_id};
											DECLARE @gl_dc_book_type_pay_id_fixed 	as bigint 			= {$gl_dc_book_type_pay_id_fixed};
 											DECLARE @i_cancel_doc_expense 			as tinyint			= {$i_cancel_doc_expense};
											DECLARE @f_money 						as decimal(18,2)	= {$arr_btn["f_money"]};
										
								/*insert gl_tran_hdr*/
									insert into gl_tran_hdr(c_ref_doc, gl_dc_book_type_id, d_doc_date
																, d_save_date, f_total_amt, table_pk_id
																, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
																, c_comment1, i_enable, i_type, i_is_post, i_is_close_year
																, i_is_reversing, i_close_year_type, i_preview
																, i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
																, dc_user_create_id, dc_user_create_cost_id, d_create
																, dc_user_update_id, dc_user_update_cost_id, d_update
																, i_cancel_doc_expense)
									select  a.c_code+ ' (ยกเลิกค่าใช้จ่าย)'  as c_ref_doc
											, @gl_dc_book_type_pay_id_fixed as gl_dc_book_type_id
											, convert(datetime, @d_save_date, 102) as d_doc_date
											, convert(datetime, @d_save_date, 102) as d_save_date
											, (SELECT SUM(b.f_cheque) FROM gl_bank_cheque b WHERE b.gl_bank_cheque_id in $c_cheques) as f_total_amt
											, @btn_id as table_pk_id
											, '$table' as table_name
											, 'บันทึกบัญชีโอนระหว่างธนาคาร' as table_detail
											, right(left(@d_save_date,7),2) as c_mm
											, left(@d_save_date,4) as c_yyyy
											, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
											, a.c_code+ '( ยกเลิกค่าใช้จ่าย สำหรับ ' +a.c_code+' )' as c_comment1
											, 1 as i_enable
											, 2 as i_type
											, 2 as i_is_post
											, 2 as i_is_close_year
											, 2 as i_is_reversing
											, 9 as i_close_year_type
											, 1 as i_preview
											, 1 as i_chk_gl_dtl
											, 1 as i_chk_gl_purchase
											, '0' as c_code
											, '0' as c_code_post
											, @create_id
											, @create_cost_id
											, getdate()
											, @create_id
											, @create_cost_id
											, getdate()
											, @i_cancel_doc_expense
									from $table a
									where a.gl_bank_id = ?;";

			$sqlBTNExpenseCancel 			.= "SELECT @@IDENTITY as hdr_id";

			$stmtBTNExpenseCancel 			= $db->QueryParam($sqlBTNExpenseCancel, array($btn_id));
			$arr_gx_btn_expense_cancel 		= $db->Fetch($stmtBTNExpenseCancel);
			$gl_hdr_id_btn_expense_cancel 	= $arr_gx_btn_expense_cancel["hdr_id"];

			if ($gl_hdr_id_btn_expense_cancel > 0) {
				$sqlBankGXDtl2 = "	 	DECLARE @btn_id 				as bigint 			= {$btn_id};
												declare @new_gx_btn_bank_id 	as bigint = ?; 
												declare	@old_gx_btn_bank_id  	as bigint = ?;
						
									insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
															, dc_acc_id, f_cr, f_dr
															, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
															, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 
															, i_type_year,c_budget_year,dc_expense_budget_type_id
															, i_return)
									select ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_cr asc) as i_rank
										, @new_gx_btn_bank_id as gl_tran_hdr_id
										, dc_cost_acc_id
										, dc_acc_id 
										, f_cr 
										, f_dr
										, 0 as i_type_person
										, 0 as dc_emp_id
										, 0 as dc_debtor_id
										, 0 as dc_creditor_id
										, 2 as i_is_nontax_exp
										, 0 as dc_product_id
										, 0 as pk_id1
										, 0 as pk_id2
										, i_type_year
										, c_budget_year
										, dc_expense_budget_type_id
										, i_return
									from (
											SELECT
												77 AS dc_cost_acc_id
												,(SELECT bank.dc_acc_id FROM dc_bank_acc_company bank WHERE bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source2) AS dc_acc_id
												,case when (a.i_type_jv=2) then 0.00 else SUM(b.f_cheque) end as f_cr
												,case when (a.i_type_jv=2) then SUM(b.f_cheque) else 0.00 end as f_dr
												,0 as i_type_person
												,0 as dc_emp_id
												,0 as dc_debtor_id
												,0 as dc_creditor_id
												,2 as i_is_nontax_exp
												,0 as dc_product_id
												,0 as pk_id1
												,0 as pk_id2
												,ISNULL(a.i_type_year,9) as i_type_year
												,a.c_budget_year
												,a.dc_expense_budget_type_id
												,ISNULL(a.i_return,3) as i_return
											FROM gl_bank a INNER JOIN gl_bank_cheque b ON a.gl_bank_id = b.gl_bank_id
											WHERE a.gl_bank_id = @btn_id and b.gl_bank_cheque_id in $c_cheques
											GROUP BY a.dc_bank_acc_company_id_source2,a.i_type_jv,a.i_type_year,a.c_budget_year,a.dc_expense_budget_type_id,ISNULL(a.i_return,3) 
											UNION
											SELECT
												77 AS dc_cost_acc_id
												,a.dc_acc_id
												,case when (a.i_type_jv=2) then SUM(b.f_cheque)  else 0.00 end as f_cr
												,case when (a.i_type_jv=2) then 0.00  else SUM(b.f_cheque) end as f_dr 
												,0 as i_type_person
												,0 as dc_emp_id
												,0 as dc_debtor_id
												,0 as dc_creditor_id
												,2 as i_is_nontax_exp
												,0 as dc_product_id
												,0 as pk_id1
												,0 as pk_id2
												,ISNULL(a.i_type_year,9) as i_type_year
												,a.c_budget_year
												,a.dc_expense_budget_type_id
												,ISNULL(a.i_return,3) as i_return												
											FROM gl_bank a INNER JOIN gl_bank_cheque b ON a.gl_bank_id = b.gl_bank_id
											WHERE a.gl_bank_id = @btn_id and b.gl_bank_cheque_id in $c_cheques
											GROUP BY a.dc_acc_id,a.i_type_jv,a.i_type_year,a.c_budget_year,a.dc_expense_budget_type_id,ISNULL(a.i_return,3)  
										 ) a
									order by i_rank;";

				$stmt44 = $db->QueryParam($sqlBankGXDtl2, array(
					$gl_hdr_id_btn_expense_cancel,
					$arr_btn["gl_tran_hdr_id"]
				));


				if ($stmt44) {
					$code_gens = "GX";
					$arrParamEXPGencode = array(
						$code_gens,
						$c_yyyy_mmc1,
						$dc_user_update_id,
						$dc_user_update_cost_id,
						$gl_hdr_id_btn_expense_cancel
					);
					$sqlGenCodeEXP = "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$stmtGenCodeEXP = $db->QueryParam($sqlGenCodeEXP, $arrParamEXPGencode);

					$arr_gen_codeEXP = $db->Fetch($stmtGenCodeEXP);
					$c_code_EXP = $arr_gen_codeEXP["c_code_gen"];
					$ref_id_EXP = $arr_gen_codeEXP["reference_id"];

					if ($gl_hdr_id_btn_expense_cancel == $ref_id_EXP) {

						$chk_gl_dtl_exp = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
																		,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
																		,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
																		,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
																FROM gl_tran_hdr aa
																WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id_btn_expense_cancel));
						if (($chk_gl_dtl_exp["no_acc"] > 0) || ($chk_gl_dtl_exp["no_cost"] > 0) || ($chk_gl_dtl_exp["f_tot_dr"] != $chk_gl_dtl_exp["f_tot_cr"])) {
							$i_success_jv_expense = 2;
						} else {
							$i_success_jv_expense = 1;
						}


						$sqlIMP = "UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";

						$stmt3 = $db->QueryParam($sqlIMP, array(
							$c_code_EXP,
							$i_success_jv_expense,
							$gl_hdr_id_btn_expense_cancel
						));
						$code_gens = $c_code_EXP;
					}
				}
			}

			/* ============================== 3 LOG เก็บการยกเลิกฎีกา   EPHIS / VISION NET  =============================== */

			foreach ($arr_penguin as $index => $imp_chq_id) {
				// LOG เก็บการยกเลิกฎีกา   EPHIS  
				$arrParamLog[] = 3;
				$arrParamLog[] = 0;
				$arrParamLog[] = 0;
				$arrParamLog[] = $btn_id;
				$arrParamLog[] = $d_save_jv_cancel;
				$arrParamLog[] = $dc_user_update_id;
				$arrParamLog[] = $dc_user_update_cost_id;
				$arrParamLog[] = $gl_hdr_id_bank_cancel;
				$arrParamLog[] = $gl_hdr_id_btn_expense_cancel;
				$arrParamLog[] = 0;
				$arrParamLog[] = 0;
				$arrParamLog[] = $imp_chq_id;


				$sqlINSLog 		= "EXEC SP_LOG_CANCEL_DOCUMENT_CHEQUES ?,?,?,?,?,?,?,?,?,?,?,?;";
				$stmtLog 		= $db->QueryParam($sqlINSLog, $arrParamLog);
				$arr_ins_log 	= $db->Fetch($stmtLog);
				$cancel_id 		= $arr_ins_log["log_id"];
				$imp_chq_id 	= 0;
				unset($arrParamLog);
			}


			// UPDATE สถานะ ยกเลิก BTN
			$sql	= "  
						DECLARE @gl_bank_id 	int 	= {$btn_id};
						DECLARE @cancel_id   	int		= {$cancel_id}; 
				   
	
			IF (@cancel_id > 0)
				UPDATE gl_bank
				SET
					i_status =
						CASE
							WHEN (SELECT COUNT(*) FROM imp_cancel_doc_expense WHERE gl_bank_id = @gl_bank_id) = 0
								THEN 1 /*ไม่มีสถานะเช็คยกเลิก*/
							WHEN (SELECT COUNT(*) FROM gl_bank WHERE gl_bank_id = @gl_bank_id)
								= (SELECT COUNT(*) FROM imp_cancel_doc_expense WHERE gl_bank_id = @gl_bank_id)
								THEN 2 /*ยกเลิกเช็คทั้งหมด*/
							WHEN (SELECT COUNT(*) FROM gl_bank WHERE gl_bank_id = @gl_bank_id)
								!= (SELECT COUNT(*) FROM imp_cancel_doc_expense WHERE gl_bank_id = @gl_bank_id)
								THEN 3 /*ยกเลิกเช็คบางใบ*/
						END
					,d_cancel_doc = GETDATE()
					,d_save_jv_cancel = '{$_REQUEST["d_save_jv_cancel"]}'
					,imp_cancel_doc_expense_id = @cancel_id
				FROM gl_bank
				WHERE gl_bank_id = @gl_bank_id;
				
				UPDATE gl_bank_cheque
					SET i_status = 2 
					WHERE gl_bank_cheque_id in $c_cheques;					
				
			SELECT 'TEST GL' AS c_code_post;";

			$para	= $db->QueryParam($sql, array());

			if (@$para) {

				$rs	= $db->Fetch($para);

				$re = array(
					"success"			=> true,
					"msg"				=> "บันทึกรายการ " . $rs["c_code_post"]
				);
			} else {
				$re = array(
					"success"			=> false,
					"msg"				=> "SQL ERROR"
				);
			}
		} else {
			$re = array(
				"success"				=> false,
				"msg"					=> "รายการนี้เคยถูกยกเลิกฏีกาแล้ว"
			);
		}

		break;

	case "POP_SAVE":

		$msg	= "";

		$data["i_return"]								= $_REQUEST["i_return"];
		$data["i_type_year"]							= $_REQUEST["i_type_year"];
		$data["c_budget_year"]							= $_REQUEST["c_budget_year"];
		$data["dc_expense_budget_type_id"]				= $_REQUEST["dc_expense_budget_type_id"];
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		foreach ($data as $fld => $value) {
			$arrValue[]	= ($value != "") ? $value : NULL;
			$addField	.= ", {$fld} = ?";
		}

		$arrValue[] = $_REQUEST["id"];

		$sql		= "UPDATE gl_bank SET " . substr($addField, 1) . " WHERE gl_bank_id = ?;";
		$para		= $db->QueryParam($sql, $arrValue);

		//=================================================//
		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		$data["i_type_year"]							= $_REQUEST["i_type_year"];
		$data["c_budget_year"]							= $_REQUEST["c_budget_year"];
		$data["dc_expense_budget_type_id"]				= $_REQUEST["dc_expense_budget_type_id"];

		foreach ($data as $fld => $value) {
			$arrValue[]	= ($value != "") ? $value : NULL;
			$addField	.= ", {$fld} = ?";
		}

		$sql		= "	UPDATE gl_tran_dtl
							SET " . substr($addField, 1) . "
						WHERE gl_tran_hdr_id IN (SELECT aa.gl_tran_hdr_id FROM gl_tran_hdr aa
							WHERE aa.table_name = 'gl_bank'
								AND aa.table_pk_id = {$_REQUEST["id"]}
						) AND dc_acc_id = (SELECT bb.dc_acc_id FROM gl_bank bb WHERE bb.gl_bank_id = {$_REQUEST["id"]})";

		$para		= $db->QueryParam($sql, $arrValue);

		// ============== //
		$addField	= null;
		$addValue	= null;
		unset($data);
		unset($arrValue);
		// ============== //

		if (@$para) {
			$re = array(
				"success"					=> true,
				"id"						=> $_REQUEST["id"],
				"msg"						=> $msg
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
