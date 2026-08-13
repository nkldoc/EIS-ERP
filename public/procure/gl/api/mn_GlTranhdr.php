<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

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
	case "GEN_CODE":

		$msg	= "";
		if (isset($_SESSION["user_id"])) {

			$i_is_post	= ($mode == "EDIT" || $mode == "GEN_CODE") ? $db->GetDataBySQL("SELECT i_is_post FROM dbo.gl_tran_hdr WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"])) : 1;

			// CHECK วันที่เอกสาร
			$status_doc		= $db->GetDataBySQL("SELECT i_status FROM dbo.gl_dc_period WHERE c_yyyy = YEAR('" . $_REQUEST["d_doc_date"] . "') AND c_mm = MONTH('" . $_REQUEST["d_doc_date"] . "') AND i_system = 1 AND i_last_period = 1", array(null));
			if ($status_doc == 1) {
			} else if ($status_doc == 2) {
				$msg	.= "- ไม่สามารถบันทึกรายการ <span style='color:red;'>\"วันที่เอกสาร\"</span> ได้<br>เนื่องจาก ปิดงวดบัญชีแล้ว<br>";
			} else {
				$msg	.= "- ไม่สามารถบันทึกรายการ <span style='color:red;'>\"วันที่เอกสาร\"</span> ได้<br>เนื่องจาก ยังไม่บันทึกงวดบัญชี<br>";
			}

			// CHECK เลขที่เอกสาร
			$chk_ref	= str_replace(" ", "", $_REQUEST["c_ref_doc"]);
			$db_doc		= $db->GetDataBySQL("
				SELECT
					a.i_is_post
					,a.c_code
					,a.c_code_post
					,a.table_name
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
				FROM gl_tran_hdr a 
				WHERE replace(a.c_ref_doc, ' ', '') = ?
					AND a.i_enable = ?
					AND a.gl_tran_hdr_id != ?", array($chk_ref, STATUS_ENABLE, @$_REQUEST["id"]));
			if ($db_doc) {
				if ($db_doc["i_is_post"] == 3) {
					$msg	.= "- ระบบได้ออกเลขที่อ้างอิง <span style='color:red;'><b>" . $db_doc["c_code_post"] . "</b></span> แล้ว<br>";
					$msg	.= "ผู้แก้ไขรายการ คือ " . $db_doc["dc_user_update"] . " กรุณาตรวจสอบรายการ<br>";
				} else if ($db_doc["i_is_post"] == 2) {
					$msg	.= "- ระบบได้ออกเลขที่อ้างอิง <span style='color:red;'><b>" . $db_doc["c_code"] . "</b></span> แล้ว<br>";
					$msg	.= "ผู้แก้ไขรายการ คือ " . $db_doc["dc_user_update"] . " กรุณาตรวจสอบรายการ<br>";
				} else if ($db_doc["table_name"] != "ar_bill_hdr") {
					// ไม่ใช้เช็คข้อมูลระบบลูกหนี้ ระบบอื่นเช็คหมด
					$msg	.= "- ระบบได้บันทึกรายการรอลงบัญชี แล้ว<br>";
					$msg	.= "ผู้แก้ไขรายการ คือ " . $db_doc["dc_user_update"] . " กรุณาตรวจสอบรายการ<br>";
				}
			}

			if ($i_is_post == 1) {
				// CHECK วันที่บันทึกบัญชี
				$status_save	= $db->GetDataBySQL("SELECT i_status FROM dbo.gl_dc_period WHERE c_yyyy = YEAR('" . $_REQUEST["d_save_date"] . "') AND c_mm = MONTH('" . $_REQUEST["d_save_date"] . "') AND i_system = 1 AND i_last_period = 1", array(null));
				if ($status_save == 1) {
				} else if ($status_save == 2) {
					$msg	.= "- ไม่สามารถบันทึกรายการ <span style='color:red;'>\"วันที่บันทึกบัญชี\"</span> ได้<br>เนื่องจาก ปิดงวดบัญชีแล้ว<br>";
				} else {
					$msg	.= "- ไม่สามารถบันทึกรายการ <span style='color:red;'>\"วันที่บันทึกบัญชี\"</span> ได้<br>เนื่องจาก ยังไม่บันทึกงวดบัญชี<br>";
				}
			}

			// GEN_CODE
			if ($mode == "GEN_CODE") {
				$hdr		= $db->GetDataBySQL("SELECT c_code, gl_tran_hdr_id, c_ref_doc, c_yyyy_mm, i_chk_gl_dtl, i_chk_gl_purchase FROM dbo.gl_tran_hdr WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"]));
				$sum_dtl	= $db->GetDataBySQL("SELECT SUM(ISNULL(f_dr,0)) AS f_dr, SUM(ISNULL(f_cr,0)) AS f_cr FROM gl_tran_dtl WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"]));

				if ($hdr["i_chk_gl_dtl"] != 1) {
					$msg .= "- กรุณากดตรวจสอบ รายละเอียดสมุดรายวัน ก่อน<br>";
				}
				if ($hdr["i_chk_gl_purchase"] != 1) {
					$msg .= "- กรุณากดตรวจสอบ รายละเอียดภาษีซื้อ ก่อน<br>";
				}
				if ($sum_dtl["f_dr"] != $sum_dtl["f_cr"]) {
					$msg .= "- ยอดเงินของรายการไม่เท่ากัน<br>";
				}
				if ($hdr["c_code"] != "") {
					$msg .= "- ออกเลขรายการ <b><font color=red>{$hdr["c_code"]}</font></b> แล้ว<br>";
				}
			}

			if ($msg != "") {
				$re = array(
					"success"		=> false,
					"msg"			=> $msg
				);
			} else {
				if ($i_is_post == 1) { // รอลงบัญชี

					list($yyyy, $mm, $dd)	= explode("-", $_REQUEST["d_save_date"]);

					$data["d_save_date"]					= $_REQUEST["d_save_date"];
					$data["c_mm"]							= $mm;
					$data["c_yyyy"]							= $yyyy;
					$data["c_yyyy_mm"]						= $yyyy . $mm;

					if ($mode == "ADD") {
						$data["i_is_post"]						= BOOK_ACC_NOT_POST; // 1 (รายการรอลงบัญชี)
						$data["i_is_reversing"]					= GL_REVERSE_FALSE;
						$data["i_is_close_year"]				= GL_CLOSE_YEAR_NONE; // 2 //ไม่เป็น
						$data["i_close_year_type"]				= GL_CLOSE_YEAR_TYPE_NONE; // 9 ไม่ใช่รายการปิดปี
						$data["i_type"]							= GL_TYPE_MANUAL; // 1 Manual - Key In เอกสารเอง
						$data["i_preview"]						= GL_PREVIEW_FALSE; // 2 ไม่แสดง
						$data["i_chk_gl_dtl"]					= GL_CHK_DTL_FALSE; // 2 ยังไม่ตรวจสอบ/ตรวจสอบแล้วไม่ผ่าน
						$data["i_chk_gl_purchase"]				= GL_CHK_VAT_TRUE; // 1 ตรวจสอบผ่านแล้ว
						$data["i_enable"]						= STATUS_ENABLE;
						$data["dc_user_create_id"]				= $_SESSION["user_id"];
						$data["dc_user_create_cost_id"]			= $_SESSION["dc_cost_id"];
						$data["d_create"]						= date("Y-m-d H:i:s");
					}
				}

				$data["c_ref_doc"]								= $_REQUEST["c_ref_doc"];
				$data["gl_dc_book_type_id"]						= $_REQUEST["gl_dc_book_type_id"];
				$data["d_doc_date"]								= $_REQUEST["d_doc_date"];
				$data["c_comment1"]								= $_REQUEST["c_comment1"];
				$data["c_comment2"]								= $_REQUEST["c_comment2"];
				$data["c_comment3"]								= $_REQUEST["c_comment3"];
				$data["dc_user_update_id"]						= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
				$data["d_update"]								= date("Y-m-d H:i:s");

				if ($mode == "ADD") {

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql		= "	SET NOCOUNT ON
									BEGIN TRANSACTION;
									INSERT INTO gl_tran_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
									COMMIT;
									SELECT SCOPE_IDENTITY() as id;";

					$para		= $db->QueryParam($sql, $arrValue);
					$ss_id		= $db->Fetch($para);
					$id			= $ss_id["id"];
					$msg		= "บันทึกรายการเรียบร้อย";
				} else if ($mode == "EDIT") {

					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : NULL;
						$addField	.= ", {$fld} = ?";
					}

					$arrValue[] = $_REQUEST["id"];
					$sql		= "	BEGIN TRANSACTION;
									UPDATE gl_tran_hdr SET " . substr($addField, 1) . " WHERE gl_tran_hdr_id = ?;
									COMMIT;";
					$para		= $db->QueryParam($sql, $arrValue);
					$id			= $_REQUEST["id"];
					$msg		= "บันทึกรายการเรียบร้อย";
				} else if ($mode == "GEN_CODE") {

					$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$arrValue	= array("GX", $hdr["c_yyyy_mm"], $_SESSION["user_id"], $_SESSION["dc_cost_id"], $_REQUEST["id"]);

					$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
					unset($sql);
					unset($arrValue);

					if ($_REQUEST["id"] == $arr_gen_code["reference_id"]) {

						$sql		= "	BEGIN TRANSACTION;
										UPDATE gl_tran_hdr SET c_code = ?, f_total_amt = ?, i_is_post = ?, i_preview = ? WHERE gl_tran_hdr_id = ?;
										COMMIT;";

						$arrValue[] = $arr_gen_code["c_code_gen"];
						$arrValue[] = $sum_dtl["f_dr"];
						$arrValue[] = BOOK_ACC_GX;
						$arrValue[] = 1;
						$arrValue[] = $_REQUEST["id"];

						$para	= $db->QueryParam($sql, $arrValue);
						if ($para) {
							$msg	= "เลขที่เอกสาร : <span style='color:red;'><b>" . $hdr["c_ref_doc"] . "</b></span><br>เลขที่อ้างอิง : <span style='color:red;'><b>" . $arr_gen_code["c_code_gen"] . "</b></span>";
						} else {
							$re = array(
								"success"		=> false,
								"id"			=> $id,
								"msg"			=> $msg
							);
						}
					} else {
						$re = array(
							"success"		=> false,
							"id"			=> $id,
							"msg"			=> $msg
						);
					}

					$id			= $_REQUEST["id"];
				}

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //

				if ($para) {
					$re = array(
						"success"		=> true,
						"id"			=> $id,
						"msg"			=> $msg
					);
				} else {
					$re = array(
						"success"		=> false,
						"id"			=> $id,
						"msg"			=> $msg
					);
				}
			}
		} else {
			$msg = "กรุณา  ออกจากระบบ แล้ว เข้าสู่ระบบ ใหม่<br>เนื่องจาก Session หมดอายุ";
			$re = array(
				"success"		=> false,
				"id"			=> $_REQUEST["id"],
				"msg"			=> $msg
			);
		}




		break;

		// 	case "REVERSE" :

		// 		$hdr	= $db->GetDataBySQL("SELECT
		// 										*,
		// 										CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date,
		// 										'01' AS [day],
		// 										RIGHT('0'+CAST(MONTH(DATEADD(MONTH,1,d_save_date)) AS varchar(2)),2) AS [month],
		// 										YEAR(DATEADD(MONTH,1,d_save_date)) [year]
		// 									FROM gl_tran_hdr WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"]));

		// 		if($hdr) {

		// 			if($hdr["c_comment3"] != "") {
		// 				$data["c_comment1"]			= $hdr["c_comment1"];
		// 				$data["c_comment2"]			= $hdr["c_comment2"];
		// 				$data["c_comment3"]			= $hdr["c_comment3"]."(REVERSE)";
		// 			} else if($hdr["c_comment2"] != "") {
		// 				$data["c_comment1"]			= $hdr["c_comment1"];
		// 				$data["c_comment2"]			= $hdr["c_comment2"]."(REVERSE)";
		// 				$data["c_comment3"]			= $hdr["c_comment3"];
		// 			} else {
		// 				$data["c_comment1"]			= $hdr["c_comment1"]."(REVERSE)";
		// 				$data["c_comment2"]			= $hdr["c_comment2"];
		// 				$data["c_comment3"]			= $hdr["c_comment3"];
		// 			}

		// 			$data["gl_dc_book_type_id"]		= $hdr["gl_dc_book_type_id"];
		// 			$data["c_yyyy_mm"]				= $hdr["year"].$hdr["month"];
		// 			$data["c_ref_doc"]				= $hdr["c_ref_doc"]."(R)";
		// 			$data["d_doc_date"]				= $hdr["d_doc_date"];
		// 			$data["d_save_date"]			= $hdr["year"]."-".$hdr["month"]."-".$hdr["day"];
		// 			$data["i_enable"]				= $hdr["i_enable"];
		// 			$data["i_is_post"]				= $hdr["i_is_post"];
		// 			$data["i_parent"]				= $hdr["gl_tran_hdr_id"];
		// 			$data["i_is_reversing"]			= $hdr["i_is_reversing"];
		// 			$data["i_is_close_year"]		= $hdr["i_is_close_year"];
		// 			$data["i_close_year_type"]			= $hdr["i_close_year_type"];
		// 			$data["f_total_amt"]			= $hdr["f_total_amt"];
		// 			$data["table_pk_id"]			= $hdr["table_pk_id"];
		// 			$data["table_name"]				= $hdr["table_name"];
		// 			$data["table_detail"]			= $hdr["table_detail"];
		// 			$data["c_code_post"]			= $hdr["c_code_post"];
		// 			$data["c_mm"]					= $hdr["month"];
		// 			$data["c_yyyy"]					= $hdr["year"];
		// 			$data["i_type"]					= GL_TYPE_AUTO; // 2 = AUTO - GENERATE ให้เบื้องต้นจากระบบ
		// 			$data["i_preview"]				= $hdr["i_preview"];
		// 			$data["i_chk_gl_dtl"]			= $hdr["i_chk_gl_dtl"];
		// 			$data["i_chk_gl_purchase"]		= $hdr["i_chk_gl_purchase"];
		// 			$data["dc_user_create_id"]		= $_SESSION["user_id"];
		// 			$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
		// 			$data["d_create"]				= date("Y-m-d H:i:s");
		// 			$data["dc_user_update_id"]		= $_SESSION["user_id"];
		// 			$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
		// 			$data["d_update"]				= date("Y-m-d H:i:s");

		// 			foreach ($data as $fld => $value) {
		// 				$arrValue[] = ($value != "")? $value : NULL;
		// 				$addField .= ", {$fld}";
		// 				$addValue .= ", ?";
		// 			}

		// 			$sql	= "	SET NOCOUNT ON
		// 						INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
		// 						SELECT SCOPE_IDENTITY() as gl_tran_hdr_id;";

		// 			$db->BeginTran();
		// 			$para	= $db->QueryParam($sql, $arrValue);
		// 			$ss_id	= $db->Fetch($para);
		// 			// ============== //
		// 			$addField	= null;
		// 			$addValue	= null;
		// 			unset ($data);
		// 			unset ($arrValue);
		// 			// ============== //			
		// 			if($para) {
		// 				$db->CommitTran();

		// 				$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
		// 				$arrValue	= array("GX", $hdr["year"].$hdr["month"], $_SESSION["user_id"], $_SESSION["dc_cost_id"], $ss_id["gl_tran_hdr_id"]);

		// 				$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
		// 				// ============== //
		// 				$addField	= null;
		// 				$addValue	= null;
		// 				unset ($data);
		// 				unset ($arrValue);
		// 				// ============== //
		// 				$sql	= "UPDATE gl_tran_hdr SET c_code = ? WHERE gl_tran_hdr_id = ?";

		// 				$arrValue[]	= $arr_gen_code["c_code_gen"];
		// 				$arrValue[]	= $ss_id["gl_tran_hdr_id"];

		// 				$db->BeginTran();
		// 				$para	= $db->QueryParam($sql, $arrValue);
		// 				// ============== //
		// 				$addField	= null;
		// 				$addValue	= null;
		// 				unset ($data);
		// 				unset ($arrValue);
		// 				// ============== //
		// 				if($para) {
		// 					$db->CommitTran();

		// 					$stmt = $db->QueryParam("SELECT * FROM gl_tran_dtl WHERE gl_tran_hdr_id = ?", array($hdr["gl_tran_hdr_id"]));
		// 					if($stmt) {

		// 						while($row = $db->Fetch($stmt)) {

		// 							$data["gl_tran_hdr_id"]		= $ss_id["gl_tran_hdr_id"];
		// 							$data["dc_acc_id"]			= $row["dc_acc_id"];
		// 							$data["f_dr"]				= $row["f_cr"];
		// 							$data["f_cr"]				= $row["f_dr"];
		// 							$data["i_is_nontax_exp"]	= $row["i_is_nontax_exp"];
		// 							$data["dc_product_id"]		= $row["dc_product_id"];
		// 							$data["dc_cost_acc_id"]		= $row["dc_cost_acc_id"];
		// 							$data["i_type_person"]		= $row["i_type_person"];
		// 							$data["dc_debtor_id"]		= $row["dc_debtor_id"];
		// 							$data["dc_creditor_id"]		= $row["dc_creditor_id"];
		// 							$data["dc_emp_id"]			= $row["dc_emp_id"];
		// 							$data["c_other_name"]		= $row["c_other_name"];
		// 							$data["i_rank"]				= $row["i_rank"];

		// 							foreach ($data as $fld => $value) {
		// 								$arrValue[] = ($value != "")? $value : NULL;
		// 								$addField .= ", {$fld}";
		// 								$addValue .= ", ?";
		// 							}
		// 							$sql	= " INSERT INTO gl_tran_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).");";

		// 							$db->QueryParam($sql, $arrValue);
		// 							// ============== //
		// 							$addField	= null;
		// 							$addValue	= null;
		// 							unset ($data);
		// 							unset ($arrValue);
		// 							// ============== //
		// 						}
		// 						$sql	= "UPDATE gl_tran_hdr SET i_is_reversing = ? WHERE gl_tran_hdr_id = ?";

		// 						$arrValue[]	= GL_REVERSE_TRUE; // เป็น
		// 						$arrValue[]	= $hdr["gl_tran_hdr_id"];

		// 						$db->BeginTran();
		// 						$para	= $db->QueryParam($sql, $arrValue);
		// 						if($para) {
		// 							$db->CommitTran();

		// 							$dds	= $db->GetDataBySQL("SELECT c_ref_doc, c_code FROM gl_tran_hdr WHERE gl_tran_hdr_id = ?", array($ss_id["gl_tran_hdr_id"]));

		// 							$msg	= "เลขที่เอกสาร : ".$dds["c_ref_doc"]."<br>เลขที่อ้างอิง : ".$dds["c_code"];
		// 							$re = array("success"	=> true,
		// 										"id"		=> $ss_id["gl_tran_hdr_id"],
		// 										"msg"		=> $msg );
		// 						}
		// 					} else {
		// 						$re = array("success"	=> false,
		// 									"msg"		=> "DTL ไม่มีรายการ" );
		// 					}
		// 				} else {
		// 					$db->RollBackTran();
		// 					$re = array("success"	=> false,
		// 								"msg"		=> "SQL ERROR" );
		// 				}
		// 			} else {
		// 				$db->RollBackTran();
		// 				$re = array("success"	=> false,
		// 							"msg"		=> "SQL ERROR" );
		// 			}
		// 		} else {
		// 			$re = array("success"	=> false,
		// 						"msg"		=> "ไม่พบข้อมูลที่เลือก" );
		// 		}

		// 		echo json_encode($re);
		// 		exit;
		// 		break;

	case "DELETE":

		$msg	= "";

		$arrValue[] = $_REQUEST["id"];

		$sql	= "	DECLARE @id INT = ?;
					BEGIN TRANSACTION;
					DELETE gl_tran_purchase_tax WHERE gl_tran_hdr_id = @id;
					DELETE gl_tran_dtl WHERE gl_tran_hdr_id = @id;
					DELETE gl_tran_hdr WHERE gl_tran_hdr_id = @id;
					COMMIT;";

		$para	= $db->QueryParam($sql, $arrValue);

		if ($para) {
			$re = array(
				"success"		=> true,
				"id"			=> $_REQUEST["id"],
				"msg"			=> $msg
			);
		} else {
			$re = array(
				"success"		=> false,
				"id"			=> $_REQUEST["id"],
				"msg"			=> $msg
			);
		}


		break;

	case "DELETE_GX":

		$msg	= "";

		$data["i_enable"]					= STATUS_DISABLE;
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");

		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "") ? $value : NULL;
			$addField .= ", {$fld} = ?";
		}

		$arrValue[] = $_REQUEST["id"];
		$sql		= "	BEGIN TRANSACTION;
						UPDATE gl_tran_hdr SET " . substr($addField, 1) . " WHERE gl_tran_hdr_id = ?;
						COMMIT;";

		$para		= $db->QueryParam($sql, $arrValue);
		if ($para) {
			$re = array(
				"success"		=> true,
				"id"			=> $_REQUEST["id"],
				"msg"			=> $msg
			);
		} else {
			$re = array(
				"success"		=> false,
				"id"			=> $_REQUEST["id"],
				"msg"			=> $msg
			);
		}

		break;

	case "GL_TRAN_DTL":

		$msg	= "";

		if ($_REQUEST["i_chk_gl_dtl"] == "true") {

			$i_chk_gl_dtl		= GL_CHK_DTL_TRUE; // chk จาก base
			$Validate			= false;

			$data_dtl	= json_decode(@$_REQUEST["data"], true);
			if (is_array($data_dtl) && count($data_dtl) > 0) {

				$temp		= array();
				$cost		= array();
				$none		= array();
				$unalike	= array();

				// SUM COST
				foreach ($data_dtl as $index => $jObj) {
					if ($jObj["dc_acc_id"] == $db->GetDataBySQL("SELECT dc_acc_id FROM gl_dc_config WHERE i_config = ?", array(GL_CFG_VAT_BUY))) {
						if (array_key_exists($jObj["dc_cost_acc_id"], $cost)) {
							$cost[$jObj["dc_cost_acc_id"]]	+=	$jObj["f_dr"] - $jObj["f_cr"];
						} else {
							$cost[$jObj["dc_cost_acc_id"]]	= $jObj["f_dr"] - $jObj["f_cr"];
						}
					}
				}

				// มีบัญชีภาษีซื้อ
				if ($cost) {
					foreach ($cost as $index => $value) {
						$sql	= "	SELECT dc_cost_acc_id, SUM(f_vat) AS sum_vat
									FROM gl_tran_purchase_tax
									WHERE gl_tran_hdr_id = ? AND dc_cost_acc_id = ?
									GROUP BY dc_cost_acc_id";

						$cost_acc	= $db->GetDataBySQL($sql, array($_REQUEST["id"], $index));
						if ($cost_acc) {
							if ($cost_acc["sum_vat"] != $value) { // tran_tax ไม่เท่ากับ ยอดเงินรวม (เดบิต - เครดิต) 
								$unalike[$index]	= $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id = ?", array($index));
								$temp["unalike"]	= $unalike;
							}
						} else {
							$none[$index]	= $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id = ?", array($index));
							$temp["none"]	= $none;
						}
					}
					if ($temp) {
						$data[] = $temp;
					}
				} else {
					// แจ้งเตือนลบข้อมูล tab 2 ก่อน
					$ff	= $db->GetDataBySQL("SELECT TOP 1 * FROM gl_tran_purchase_tax WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"]));
					if (is_array($ff)) {
						$temp["chk_tax"]	= false;
					}
					if (@$temp) {
						$data[] = $temp;
					}
				}
				$Validate	= ($data) ? false : true;
			}
		} else {
			$i_chk_gl_dtl		= GL_CHK_DTL_FALSE;
			$Validate			= true;
		}

		if ($Validate) {
			$sql		= "DELETE gl_tran_dtl WHERE gl_tran_hdr_id = {$_REQUEST["id"]};";

			$data_dtl	= json_decode(@$_REQUEST["data"], true);
			if (is_array($data_dtl) && count($data_dtl) > 0) {
				foreach ($data_dtl as $index => $jObj) {
					$data["gl_tran_hdr_id"]				= $jObj["gl_tran_hdr_id"];
					$data["dc_acc_id"]					= ($jObj["dc_acc_id"] > 0) ? $jObj["dc_acc_id"] : "0";
					$data["f_dr"]						= ($jObj["f_dr"] > 0) ? $jObj["f_dr"] : "0";
					$data["f_cr"]						= ($jObj["f_cr"] > 0) ? $jObj["f_cr"] : "0";
					$data["i_is_nontax_exp"]			= ($jObj["i_is_nontax_exp"] == 1) ? 1 : 2;
					$data["dc_product_id"]				= ($jObj["dc_product_id"] > 0) ? $jObj["dc_product_id"] : "0";
					$data["dc_cost_acc_id"]				= ($jObj["dc_cost_acc_id"] > 0) ? $jObj["dc_cost_acc_id"] : "0";
					$data["i_type_person"]				= ($jObj["i_type_person"] > 0) ? $jObj["i_type_person"] : "0";
					$data["dc_debtor_id"]				= ($jObj["dc_debtor_id"] > 0) ? $jObj["dc_debtor_id"] : "0";
					$data["dc_creditor_id"]				= ($jObj["dc_creditor_id"] > 0) ? $jObj["dc_creditor_id"] : "0";
					$data["dc_emp_id"]					= ($jObj["dc_emp_id"] > 0) ? $jObj["dc_emp_id"] : "0";
					$data["c_other_name"]				= ($jObj["c_other_name"] != "") ? $jObj["c_other_name"] : null;
					$data["i_rank"]						= ($jObj["i_rank"] != "") ? $jObj["i_rank"] : null;
					$data["i_type_year"]				= ($jObj["i_type_year"] != "") ? $jObj["i_type_year"] : 9;
					$data["c_budget_year"]				= ($jObj["c_budget_year"] != "") ? $jObj["c_budget_year"] : null;
					$data["dc_expense_budget_type_id"]	= ($jObj["dc_expense_budget_type_id"] != "") ? $jObj["dc_expense_budget_type_id"] : null;
					$data["i_return"]					= ($jObj["i_return"] > 0) ? $jObj["i_return"] : "3";

					foreach ($data as $fld => $val) {
						$arrValue[] = ($val != "") ? $val : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql		.= "INSERT INTO gl_tran_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
					$data		= null;
					$addField	= null;
					$addValue	= null;
				}

				$para	= $db->QueryParam("	BEGIN TRANSACTION;
											{$sql}
											COMMIT;", $arrValue);
				if ($para) {
					$sql		= "	BEGIN TRANSACTION;
									UPDATE gl_tran_hdr SET i_chk_gl_dtl = {$i_chk_gl_dtl} WHERE gl_tran_hdr_id = ?;
									COMMIT;";
					$arrValue	= array($_REQUEST["id"]);

					$para	= $db->QueryParam($sql, $arrValue);

					$re = array(
						"success"		=> true,
						"id"			=> $_REQUEST["id"]
					);
				} else {
					$re = array(
						"success"		=> false,
						"id"			=> $_REQUEST["id"],
						"msg"			=> $msg
					);
				}
			}
		} else {
			$re = array(
				"success"		=> false,
				"id"			=> $_REQUEST["id"],
				"data"			=> $data,
				"msg"			=> $msg
			);
		}
		break;

	case "GL_TRAN_TAX":

		$msg	= "";

		$db->QueryParam("BEGIN TRANSACTION;
						DELETE gl_tran_purchase_tax WHERE gl_tran_hdr_id = {$_REQUEST["id"]};
						COMMIT;", array());

		if ($_REQUEST["i_chk_gl_purchase"] == "true") {

			$i_chk_gl_purchase		= GL_CHK_VAT_TRUE; // chk จาก base
			$Validate				= false;

			$data_tax	= json_decode(@$_REQUEST["data"], true);
			if (is_array($data_tax) && count($data_tax) > 0) {

				$temp	= array();
				$temp2	= array();

				// CHECK TAX
				foreach ($data_tax as $index => $jObj) {
					$msg	= "";

					$dat		= $db->GetDataBySQL("SELECT DATEDIFF(MONTH, CONVERT(DATETIME, '" . $jObj["d_vat"] . "', 102), CONVERT(DATETIME, GETDATE(), 102))", array(null));
					$dd			= $db->GetDataBySQL("SELECT DATEDIFF(MONTH, CONVERT(DATETIME, '" . (date($jObj["c_yyyy"] . "-" . $jObj["c_mm"] . "-d")) . "', 102), CONVERT(DATETIME, '" . $jObj["d_vat"] . "', 102))", array(null));
					$duplicate	= $db->GetDataBySQL("SELECT gl_tran_hdr_id FROM gl_tran_purchase_tax WHERE c_tax = ? AND c_doc = ? AND gl_tran_hdr_id != ?", array($jObj["c_tax"], $jObj["c_doc"], $_REQUEST["id"]));

					$temp["index"]		= $jObj["index"] + 1;
					$temp["d_vat"]		= ($dat > 5) ? false : true;
					$temp["c_mm_yyyy"]	= ($dd > 1) ? false : true;
					$temp["c_doc"]		= ($duplicate) ? false : true;

					if (!$temp["d_vat"] || !$temp["c_mm_yyyy"] || !$temp["c_doc"]) {
						$data[] = $temp;
					}
				}

				$Validate	= ($data) ? false : true;

				if ($Validate) {

					$temp		= array();
					$cost		= array();
					$none		= array();
					$unalike	= array();

					// SUM COST
					foreach ($data_tax as $index => $jObj) {
						if (array_key_exists($jObj["dc_cost_acc_id"], $cost)) {
							$cost[$jObj["dc_cost_acc_id"]]	+=	$jObj["f_vat"];
						} else {
							$cost[$jObj["dc_cost_acc_id"]]	= $jObj["f_vat"];
						}
					}

					// CHECK SUM COST
					foreach ($cost as $index => $jObj) {
						$cost_acc	= $db->GetDataBySQL("SELECT dc_cost_acc_id, SUM(f_dr-f_cr) AS f_sum FROM gl_tran_dtl
														WHERE dc_acc_id = (SELECT dc_acc_id FROM gl_dc_config WHERE i_config = ?)
															AND gl_tran_hdr_id = ?
															AND dc_cost_acc_id = ?
														GROUP BY dc_cost_acc_id", array(GL_CFG_VAT_BUY, $_REQUEST["id"], $index));

						if ($cost_acc) {
							if ($cost_acc["f_sum"] != $cost[$index]) { // ยอดเงินรวม (เดบิต - เครดิต) ไม่เท่ากับ tran_tax
								$unalike[$index]	= $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id = ?", array($index));
								$temp["unalike"]	= $unalike;
							}
						} else { // ไม่มีหน่วยงาน
							$none[$index]	= $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id = ?", array($index));
							$temp["none"]	= $none;
						}
					}
					if ($temp) {
						$data[] = $temp;
					}
				}
			} else {
				$acc	= $db->GetDataBySQL("SELECT TOP 1 * FROM gl_tran_dtl WHERE dc_acc_id = (SELECT dc_acc_id FROM gl_dc_config WHERE i_config = ?) AND gl_tran_hdr_id = ?", array(GL_CFG_VAT_BUY, $_REQUEST["id"]));
				if (is_array($acc)) {
					$temp["acc"]	= false;
				}
				if (@$temp) {
					$data[] = $temp;
				}
			}
			$Validate	= ($data) ? false : true;
		} else {
			$i_chk_gl_purchase		= GL_CHK_VAT_FALSE;
			$Validate				= true;
		}

		// =================================== SAVE =================================== //
		if ($Validate) {
			$data_tax	= json_decode(@$_REQUEST["data"], true);
			if (is_array($data_tax) && count($data_tax) > 0) {
				foreach ($data_tax as $index => $jObj) {

					$data["gl_tran_hdr_id"]			= $jObj["gl_tran_hdr_id"];
					$data["dc_cost_acc_id"]			= ($jObj["dc_cost_acc_id"] > 0) ? $jObj["dc_cost_acc_id"] : "0";
					$data["dc_area_id"]				= $db->GetDataBySQL("SELECT dc_area_id FROM dc_cost WHERE dc_cost_id = ?", array($jObj["dc_cost_acc_id"]));
					$data["d_vat"]					= $jObj["d_vat"];
					$data["c_doc"]					= $jObj["c_doc"];
					$data["c_mm"]					= ($jObj["c_mm"] != "") ? sprintf("%02d%", $jObj["c_mm"], "") : null;
					$data["c_yyyy"]					= $jObj["c_yyyy"];
					$data["c_vendor"]				= $jObj["c_vendor"];
					$data["c_tax"]					= $jObj["c_tax"];
					$data["i_branch"]				= $jObj["i_branch"];
					$data["c_branch"]				= ($jObj["i_branch"] == "1") ? $jObj["c_branch"] : null;
					$data["f_price"]				= ($jObj["f_price"] > 0) ? $jObj["f_price"] : "0";
					$data["f_vat"]					= ($jObj["f_vat"] > 0) ? $jObj["f_vat"] : "0";
					$data["i_more"]					= $jObj["i_more"];
					$data["c_mm_more"]				= ($jObj["i_more"] == "1") ? $jObj["c_mm_more"] : null;
					$data["c_yyyy_more"]			= ($jObj["i_more"] == "1") ? $jObj["c_yyyy_more"] : null;
					$data["dc_user_create_id"]		= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
					$data["d_create"]				= date("Y-m-d H:i:s");
					$data["dc_user_update_id"]		= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
					$data["d_update"]				= date("Y-m-d H:i:s");

					foreach ($data as $fld => $val) {
						$arrValue[] = ($val != "") ? $val : NULL;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql		.= "INSERT INTO gl_tran_purchase_tax (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
					$data		= null;
					$addField	= null;
					$addValue	= null;
				}

				$db->QueryParam("	BEGIN TRANSACTION;
									{$sql}
									COMMIT;", $arrValue);
			}

			// UPDATE I_CHK
			$sql		= "	BEGIN TRANSACTION;
							UPDATE gl_tran_hdr SET i_chk_gl_purchase = {$i_chk_gl_purchase} WHERE gl_tran_hdr_id = ?;
							COMMIT;";
			$arrValue	= array($_REQUEST["id"]);

			$db->QueryParam($sql, $arrValue);

			$re = array(
				"success"		=> true,
				"id"			=> $_REQUEST["id"]
			);
		} else {
			$re = array(
				"success"		=> false,
				"id"			=> $_REQUEST["id"],
				"data"			=> $data,
				"msg"			=> $msg
			);
		}
		break;
	default:
		break;
}

echo json_encode($re);
exit;
