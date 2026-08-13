<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array(); 
$table		= "gl_tran_hdr";
$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {
	case "REVERSE":
 
		$data_gx_source	= $db->GetDataBySQL("SELECT gl_dc_book_type_id,c_yyyy_mm,c_yyyy,c_mm,c_ref_doc
													,c_comment1,c_comment2,c_comment3,i_is_close_year,i_close_year_type
													,i_type,f_total_amt,table_pk_id,table_name,table_detail,i_cancel_doc_expense
													,i_preview,i_chk_gl_dtl,i_chk_gl_purchase
			 									FROM gl_tran_hdr WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"]));


		if ($data_gx_source["c_mm"] == "12") {
			$c_mm_next 		= "01";
			$c_yyyy_next 	= $data_gx_source["c_yyyy"] + 1;
			$c_yyyy_mm_next = $c_yyyy_next . "" . $c_mm_next;
			$c_save_date	= $c_yyyy_next . "-" . $c_mm_next . "-01";
		} else {
			$c_mm_cast 		= $data_gx_source["c_mm"] + 1;
			$i_len			= strlen($c_mm_cast);
			if ($i_len == "1") {
				$c_mm_next 		= substr("00" . $c_mm_cast, 1, 2);
			} else {
				$c_mm_next 		= $c_mm_cast;
			}
			$c_yyyy_next 	= $data_gx_source["c_yyyy"];
			$c_yyyy_mm_next = $c_yyyy_next . "" . $c_mm_next;
			$c_save_date	= $c_yyyy_next . "-" . $c_mm_next . "-01";
		}

		if ($data_gx_source) {

			if ($data_gx_source["c_comment3"] != "") {
				$data["c_comment1"]			= $data_gx_source["c_comment1"];
				$data["c_comment2"]			= $data_gx_source["c_comment2"];
				$data["c_comment3"]			= $data_gx_source["c_comment3"] . "-(โอนกลับรายการต้นงวด)";
			} else if ($data_gx_source["c_comment2"] != "") {
				$data["c_comment1"]			= $data_gx_source["c_comment1"];
				$data["c_comment2"]			= $data_gx_source["c_comment2"] . "-(โอนกลับรายการต้นงวด)";
				$data["c_comment3"]			= $data_gx_source["c_comment3"];
			} else {
				$data["c_comment1"]			= $data_gx_source["c_comment1"] . "-(โอนกลับรายการต้นงวด)";
				$data["c_comment2"]			= $data_gx_source["c_comment2"];
				$data["c_comment3"]			= $data_gx_source["c_comment3"];
			}

			$data["gl_dc_book_type_id"]		= $data_gx_source["gl_dc_book_type_id"];
			$data["c_yyyy_mm"]				= $c_yyyy_mm_next;
			$data["c_ref_doc"]				= $data_gx_source["c_ref_doc"] . "-(โอนกลับรายการต้นงวด)";
			$data["d_doc_date"]				= $c_save_date;
			$data["d_save_date"]			= $c_save_date;
			$data["i_enable"]				= "1";
			$data["i_is_post"]				= "2";
			$data["i_parent"]				= $_REQUEST["id"];
			$data["i_is_reversing"]			= "2";
			$data["i_is_close_year"]		= $data_gx_source["i_is_close_year"];
			$data["i_close_year_type"]		= $data_gx_source["i_close_year_type"];
			$data["f_total_amt"]			= $data_gx_source["f_total_amt"];
			$data["table_pk_id"]			= $data_gx_source["table_pk_id"];
			$data["table_name"]				= $data_gx_source["table_name"];
			$data["table_detail"]			= $data_gx_source["table_detail"];
			$data["c_mm"]					= $c_mm_next;
			$data["c_yyyy"]					= $c_yyyy_next;
			$data["i_type"]					= $data_gx_source["i_type"];
			$data["i_preview"]				= $data_gx_source["i_preview"];
			$data["i_chk_gl_dtl"]			= $data_gx_source["i_chk_gl_dtl"];
			$data["i_chk_gl_purchase"]		= $data_gx_source["i_chk_gl_purchase"];
			$data["dc_user_create_id"]		= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_create"]				= date("Y-m-d H:i:s");
			$data["dc_user_update_id"]		= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_update"]				= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : NULL;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql	= "	SET NOCOUNT ON
								INSERT INTO {$table} (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
								SELECT SCOPE_IDENTITY() as gl_tran_hdr_id;";

			$db->BeginTran();
			$para	= $db->QueryParam($sql, $arrValue);
			$ss_id	= $db->Fetch($para);
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== //			
			if ($para) {
				$db->CommitTran();

				$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
				$arrValue	= array("GX", $c_yyyy_next . $c_mm_next, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $ss_id["gl_tran_hdr_id"]);

				$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
				$sql	= "UPDATE gl_tran_hdr SET c_code = ? WHERE gl_tran_hdr_id = ?";

				$arrValue[]	= $arr_gen_code["c_code_gen"];
				$arrValue[]	= $ss_id["gl_tran_hdr_id"];

				$db->BeginTran();
				$para	= $db->QueryParam($sql, $arrValue);
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
				if ($para) {
					$db->CommitTran();

					$stmt = $db->QueryParam("SELECT * FROM gl_tran_dtl WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"]));
					if ($stmt) {

						while ($row = $db->Fetch($stmt)) {
							$data["gl_tran_hdr_id"]				= $ss_id["gl_tran_hdr_id"];
							$data["dc_acc_id"]					= $row["dc_acc_id"];
							$data["f_dr"]						= $row["f_cr"];
							$data["f_cr"]						= $row["f_dr"];
							$data["i_is_nontax_exp"]			= $row["i_is_nontax_exp"];
							$data["i_type_person"]				= $row["i_type_person"];
							$data["dc_product_id"]				= $row["dc_product_id"];
							$data["dc_cost_acc_id"]				= $row["dc_cost_acc_id"];
							$data["dc_debtor_id"]				= $row["dc_debtor_id"];
							$data["dc_creditor_id"]				= $row["dc_creditor_id"];
							$data["dc_emp_id"]					= $row["dc_emp_id"];
							$data["c_other_name"]				= $row["c_other_name"];
							$data["i_rank"]						= $row["i_rank"];
							$data["pk_id1"]						= $row["pk_id1"];
							$data["pk_id2"]						= $row["pk_id2"];
							$data["i_type_year"]				= $row["i_type_year"];
							$data["c_budget_year"]				= $row["c_budget_year"];
							$data["dc_expense_budget_type_id"]	= $row["dc_expense_budget_type_id"];
							$data["i_return"]					= $row["i_return"];

							foreach ($data as $fld => $value) {
								$arrValue[] = ($value != "") ? $value : NULL;
								$addField .= ", {$fld}";
								$addValue .= ", ?";
							}
							$sql	= " INSERT INTO gl_tran_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";

							$db->QueryParam($sql, $arrValue);
							// ============== //
							$addField	= null;
							$addValue	= null;
							unset($data);
							unset($arrValue);
							// ============== //
						}
						$sql	= "UPDATE gl_tran_hdr SET i_is_reversing = ? WHERE gl_tran_hdr_id = ?";

						$arrValue[]	= GL_REVERSE_TRUE; // เป็น
						$arrValue[]	= $_REQUEST["id"];

						$db->BeginTran();
						$para	= $db->QueryParam($sql, $arrValue);
						if ($para) {
							$db->CommitTran();

							$dds	= $db->GetDataBySQL("SELECT c_ref_doc, c_code FROM gl_tran_hdr WHERE gl_tran_hdr_id = ?", array($ss_id["gl_tran_hdr_id"]));

							$msg	= "เลขที่เอกสาร : " . $dds["c_ref_doc"] . "<br>เลขที่อ้างอิง : " . $dds["c_code"];
							$re = array(
								"success"	=> true,
								"id"		=> $ss_id["gl_tran_hdr_id"],
								"msg"		=> $msg
							);
						}
					} else {
						$re = array(
							"success"	=> false,
							"msg"		=> "DTL ไม่มีรายการ"
						);
					}
				} else {
					$db->RollBackTran();
					$re = array(
						"success"	=> false,
						"msg"		=> "SQL ERROR"
					);
				}
			} else {
				$db->RollBackTran();
				$re = array(
					"success"	=> false,
					"msg"		=> "SQL ERROR"
				);
			}
		} else {
			$re = array(
				"success"	=> false,
				"msg"		=> "ไม่พบข้อมูลที่เลือก"
			);
		}

	break;
}
echo json_encode($re);
exit;
?>