<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$table	= "imp_request_vsn_hdr";
$key_id	= "imp_request_vsn_hdr_id";

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

$arrParamB = array () ;
$addFieldB	= null;
$addValueB	= null;
$arrValueB	= array();
 
$addFieldC	= null; 
$arrValueC	= array();

$root_item	= "data";

switch ($mode) {

	case "IMPORT_EXCEL":

		$msg			= "";  
		$num_payment	= 0; // เลขที่ใบเบิก

		$rec_payment	= "";

		if (!file_exists('../upload/')) {
			mkdir("../upload/", 0777, true);
		}
		$path_upload	= "../upload/";
		$uploadfile		= $path_upload . $_FILES["dtl_import"]["name"];
		move_uploaded_file($_FILES["dtl_import"]["tmp_name"], $uploadfile); //ย้ายไฟล์จาก Tmp มาไว้โฟรเดอร์ที่กำหนด
		$handle 		= @fopen($uploadfile, "r"); //เปิดใช้ไฟล์

		if ($handle != "") {

			$totalCount		= 0;
			$countCheque	= 0;
			$n				= 1; // run เลขแถว
			$check_rec		= false; // สถานะเช็คว่ามีรายการข้อเบิกหรือยัง
			$dtlCheque		= array();
			$i_row			= 0;
			$j = $k = 0;$i_no_dr 			= 0;
			$the_request	= $c_show_request_sub = "";
			

			while ($obj = fgetcsv($handle, 1000, ",")) {
				foreach ($obj as $key => $value) {
					$data_conv[$key] = iconv("tis-620", "utf-8//IGNORE", $obj[$key]);
				}
						//08 ม.ค. 2563 	$temp["d_doc"]						= ($data_conv["3"] != "") ? $date->shot_date_from_db(date("Y-m-d", strtotime($data_conv["3"]))) : "";
 

/* $data_conv = column[0-12] ..... n=Row[5-...]เริ่มนับจาก 0	*/

				if ($n >= 4) 
				{ //เช็คข้อมูลตั้งแต่บรรทัดที่ 5 ของไฟล์ Excel

					
				//	$the_request_desc	= "";
					
					if ($data_conv["7"] != "") { 

						 	//$temp			= array(); 
							$totalCount++; 
							$i_row++;

 						 

							 if ($data_conv["3"]!="")
							 { //แถวที่มี ปฏิทิน เป็นแถวแรก
								$j++;
							 
								$k=$j;
								$i_no_dr = 0;
								$the_request 						= $data_conv["5"];
								$temp								= array(); 
								$temp["c_type"]						= "MAIN";
								$temp["i_rank_show"]				= $j;
								$temp["d_doc"]						= $data_conv["3"]; 
								$temp["c_request_desc"]				= $data_conv["4"];
								$temp["c_request"]					= $data_conv["5"];
								$temp["c_creditor"]					= $data_conv["6"];	
								$temp["f_inv"]						= (trim($data_conv["9"],"")>0) ? str_replace(",", "", $data_conv["9"]) : str_replace(",", "", $data_conv["10"]);
								$temp["c_comment"]					= $data_conv["11"];
								$temp["i_type_year"]				= 1;
								$temp["i_cal_gl"]				    = 2;
								$temp["i_status"]					= 1; 
								$temp["gl_dc_config_id"]			= GL_CFG_DEFAULT_CREDITOR_PRODUCT;
								$temp["dc_acc_id_cr"]				= $db->GetDataBySQL("SELECT dc_acc_id FROM gl_dc_config WHERE gl_dc_config_id =?;", array($temp["gl_dc_config_id"]));
								$temp["c_acc_code"]					= $data_conv["7"];
								$temp["c_acc_name"]					= ltrim($data_conv["8"]);

								$the_request_desc  					= $data_conv["4"];

 	
								${$root}[] = $temp;	
								unset($temp);
  
								
							}
 
							if ($k>0)
							{

								if ((trim($data_conv["9"],"")>0) && ($the_request!=""))
								{ 
									$i_no_dr++; 
								}
								else
								{
									$i_no_dr = 0;
								}						
 
								$temp 							= array(); 
								$temp["c_type"]					= "SUB"; 
								$temp["i_rank_show"]			= $k;
								$temp["f_dr"]					= (trim($data_conv["9"],"")>0)? str_replace(",", "", $data_conv["9"]) 	: "0";
								$temp["f_cr"]					= (trim($data_conv["10"],"")>0)? str_replace(",", "", $data_conv["10"]) : "0";								 
								$temp["c_acc_code_imp"]			= str_replace(' ', '', $data_conv["7"]);
								$temp["c_acc_name_imp"]			= ltrim($data_conv["8"]);
								$temp["i_cal_gl"]				= 2;   
								$temp["i_rank_dr"]				= $i_no_dr; 

								${$root}[] = $temp;	
								unset($temp);	
							}							
						 
						 

					}
					$n++;

				} else {
					$n++;
				}
			}
		 
			//=============================== check รายการที่ไม่ถูกต้อง ===============================//
			if ($num_payment > 0) { // ไม่มีเลขที่ใบเบิก
				$msg["num_payment"] 	= $num_payment;
				$msg["rec_payment"] 	= $rec_payment;
			} else {
  				$db->QueryParam("DELETE imp_request_vsn_dtl WHERE imp_request_vsn_hdr_id = ?;", array($_REQUEST["id"]));
  				$db->QueryParam("DELETE imp_request_vsn_item WHERE imp_request_vsn_hdr_id = ?;", array($_REQUEST["id"]));

				$sss	= ${$root}; 
 
 
				// ========================= INSERT dtl ========================= //
				foreach ($sss as $fld) { 
					
					if ($fld["c_type"]=="MAIN")
					{
						$dataA["imp_request_vsn_hdr_id"]		= $_REQUEST["id"];
						$dataA["d_doc"]							= $fld["d_doc"];
						$dataA["c_request"]						= $fld["c_request"];
						$dataA["c_request_desc"]				= $fld["c_request_desc"];
						$dataA["c_creditor"]					= $fld["c_creditor"]; 
						$dataA["f_inv"]							= $fld["f_inv"];
						$dataA["c_comment"]						= $fld["c_comment"];
						$dataA["i_status"]						= $fld["i_status"];	 
						$dataA["i_cal_gl"]						= "0";
						$dataA["i_rank_show"]					= $fld["i_rank_show"];
						$dataA["dc_user_create_id"]				= $_SESSION["user_id"];
						$dataA["dc_user_create_cost_id"]		= $_SESSION["dc_cost_id"];
						$dataA["d_create"]						= date("Y-m-d H:i:s");
						$dataA["dc_user_update_id"]				= $_SESSION["user_id"];
						$dataA["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
						$dataA["d_update"]						= date("Y-m-d H:i:s"); 
						$dataA["dc_creditor_id"]				= $db->GetDataBySQL("SELECT TOP 1 dc_creditor_id FROM NMU.dbo.dc_creditor WHERE replace(c_map_vsn,' ','')=replace(?,' ','');", array($dataA["c_creditor"]));
						$dataA["i_send_jv"] 					= "1"; //1=ไม่ระบุคือยังไม่ map กับใบเบิกพิเศษ ,2=ไม่ลงบัญชี,3=ลงบัญชี

						$index_item								= $dataA["i_rank_show"];
						foreach ($dataA as $fld => $value) {
							$arrValue[]	= ($value != "") ? $value : null;
							$addField	.= ", {$fld}";
							$addValue	.= ", ?";
						}
	
						$sql	= "
							SET NOCOUNT ON
							INSERT INTO imp_request_vsn_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
							SELECT @@IDENTITY as id;";
	
						$para		= $db->QueryParam($sql, $arrValue);
						$ss_id		= $db->Fetch($para);
						$dtl_id		= $ss_id["id"];
						
						if (@$dataA["dc_creditor_id"]>0)
						{
							$arrCreditor[] 		= $dataA["dc_creditor_id"];
							$sqlCreditor		= "UPDATE dc_creditor SET i_key=1 WHERE dc_creditor_id = ?";
							$db->QueryParam($sqlCreditor, $arrCreditor);
						}
												
						// ============== //
						$addField	= null;
						$addValue	= null;
						unset($dataA);
						unset($arrValue);
						// ============== //	
						

					}
					else if ($fld["c_type"]=="SUB")
					{
						//===============Insert ITEM========================================
						if (($fld["i_rank_show"]==$index_item) && ($fld["i_rank_show"]>0))
						{ 
							$dataB["imp_request_vsn_hdr_id"]		= $_REQUEST["id"];
							$dataB["imp_request_vsn_dtl_id"]		= $dtl_id;
							$dataB["i_rank_show"]					= $fld["i_rank_show"];
							$dataB["f_dr"]							= $fld["f_dr"];
							$dataB["f_cr"]							= $fld["f_cr"];
							$dataB["c_acc_code_imp"]				= $fld["c_acc_code_imp"];
							$dataB["c_acc_name_imp"]				= $fld["c_acc_name_imp"];
							$dataB["i_cal_gl"]						= $fld["i_cal_gl"]; 
							$dataB["i_type_year"]					= 1;
							$dataB["c_budget_year"]					= date("Y");
							$dataB["i_type_show"]					= ($dataB["f_dr"]>0) ? 1 : 2;
							$dataB["i_rank_dr"]						= $fld["i_rank_dr"]; 
							$dataB["dc_user_create_id"]				= $_SESSION["user_id"];
							$dataB["dc_user_create_cost_id"]		= $_SESSION["dc_cost_id"];
							$dataB["d_create"]						= date("Y-m-d H:i:s");
							$dataB["dc_user_update_id"]				= $_SESSION["user_id"];
							$dataB["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
							$dataB["d_update"]						= date("Y-m-d H:i:s"); 	 
							
							if ($fld["c_acc_code_imp"]!="")
							{
								$sql_map					= "select dc_acc_id,gl_map_acc_dtl_id from vw_gl_map_acc_dtl_item where replace(c_code_map,' ','')=replace(?,' ','')";
								$data_map					= $db->GetDataBySQL($sql_map, array($fld["c_acc_code_imp"]));
								$dataB["dc_acc_id"] 		= ($data_map["dc_acc_id"]!="0") 		? $data_map["dc_acc_id"] 			: "0";
								$dataB["gl_map_acc_dtl_id"] = ($data_map["gl_map_acc_dtl_id"]!="0") ? $data_map["gl_map_acc_dtl_id"] 	: "0";
							}
							else
							{
								$dataB["dc_acc_id"]	= $dataB["gl_map_acc_dtl_id"] = 0;
							}

							foreach ($dataB as $fldB => $valueB) {
								$arrValueB[]	= ($valueB != "") ? $valueB : null;
								$addFieldB		.= ", {$fldB}";
								$addValueB		.= ", ?";
							}

							$sqlItem	= "	SET NOCOUNT ON
											INSERT INTO imp_request_vsn_item (" . substr($addFieldB, 1) . ") VALUES (" . substr($addValueB, 1) . ");
											SELECT @@IDENTITY as id;";
  
							$paraB		= $db->QueryParam($sqlItem, $arrValueB);
							$ss_B_id	= $db->Fetch($paraB);
							$b_id		= $ss_B_id["id"];

							// ============== //
							$addFieldB	= null;
							$addValueB	= null;
							unset($dataB);
							unset($arrValueB);							
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
			$data["i_status"]								= 1;
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");
			$data["gl_process_creditor_log_id"]				= "0";
		}

		if ($_REQUEST["ITYPE_JV"] == "true") { // แก้ไขได้ เมนูใบเบิก
			$data["d_doc_date"]							= $_REQUEST["d_doc_date"];
			$data["c_doc"]								= $_REQUEST["c_doc"];
			$data["c_period_no"]						= $_REQUEST["c_period_no"];
			$data["dc_expense_budget_type_id"]			= $_REQUEST["dc_expense_budget_type_id"];
			$data["dc_user_update_id_req"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id_req"]			= $_SESSION["dc_cost_id"];
			$data["d_update_req"]						= date("Y-m-d H:i:s");
		} else {
			$data["i_status"]							= 3;
			$data["d_save_jv_date"]						= $_REQUEST["d_save_jv_date"];
			$data["dc_user_update_id_req"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id_req"]			= $_SESSION["dc_cost_id"];
			$data["d_update_req"]						= date("Y-m-d H:i:s");			
		}

		$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["dc_cost_acc_id"]							= $db->GetDataBySQL("SELECT dc_cost_acc_id FROM dc_cost WHERE c_code LIKE '04040100%';", array());
		$data["i_enable"]								= STATUS_ENABLE;

		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");


		if ($mode == "ADD") {
			
			$data["i_type_request"]						= $_REQUEST["i_type_request"];
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
			//ปุ่มบันทึกรายการรายละเอียด
			//ปุ่มบันทึกเลขที่เอกสาร
			$dataB = array();
			$msg = "";
			$count_gx	= $db->GetDataBySQL("
				SELECT
					COUNT(a.gl_tran_hdr_id)
				FROM dbo.gl_tran_hdr a
				WHERE a.table_name = 'imp_request_vsn_hdr'
					AND a.i_enable = 1 AND a.i_is_post>1
					AND a.table_pk_id = ?;", array($_REQUEST["id"]));

		 	$Arr 			= json_decode($_REQUEST["data"], true);

//print_r($Arr);exit;

			$momo 			=0;
 
			
			if ($count_gx > 0) {
				$msg = "ไม่สามารถบันทึกได้เนื่องจากมีการใช้งานข้อมูล IRCV ที่ GX แล้ว";
			}

			if ($msg == "") {
				$ArrDtl 		= array();
				$ArrDtlMoney	= array();
				// ========================= update item ========================= //
				foreach ($Arr as $fld) { 
					 
					$dataB["imp_request_vsn_hdr_id"] 		= $_REQUEST["id"];	
					$dataB["i_type_year"] 					= $fld["i_type_year"];	
					$dataB["c_budget_year"] 				= $fld["c_budget_year"];						
					$dataB["i_cal_gl"]						= $fld["i_cal_gl"];
					$dataB["dc_acc_id"]						= $fld["dc_acc_id"];						 	 					
					$dataB["f_dr"] 							= $fld["f_dr"];							
					$dataB["f_cr"] 							= $fld["f_cr"];  
					$dataB["i_type_show"]					= ($dataB["f_dr"]>0) ? 1 : 2;	
					$dataB["dc_user_update_id"]				= $_SESSION["user_id"];
					$dataB["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
					$dataB["d_update"]						= date("Y-m-d H:i:s");
					
					 
					if ($fld["i_type_show"]=="1") 
					{ // c_request + c_request_desc + i_type_show = ของตาราง imp_request_vsn_dtl
						if ($fld["i_rank_dr"]=="1")
						{ 
							$momo++;
							if ($fld["i_upd"]=="1")
							{ //เฉพาะใบเบิกที่สถานะ ไม่เป็น ลงบัญชีสมบูรณ์แล้ว หรือ รอจัดกลุ่ม .:. Save ได้
								$ArrDtl[$momo]["imp_request_vsn_dtl_id"] 	= $fld["imp_request_vsn_dtl_id"];
								$ArrDtl[$momo]["c_request"] 				= $fld["c_request"];
								$ArrDtl[$momo]["c_request_desc"] 			= $fld["c_request_desc"];
								$ArrDtl[$momo]["i_send_jv"] 				= $fld["i_send_jv"]; 
								$ArrDtl[$momo]["dc_creditor_id"] 			= $fld["dc_creditor_id"]; 
							}

						}
						@$ArrDtlMoney[$fld["imp_request_vsn_dtl_id"]] 	+= @$fld["f_dr"];
					 }
					  
					if ($fld["i_upd"]=="1")
					{ //เฉพาะใบเบิกที่สถานะ ไม่เป็น ลงบัญชีสมบูรณ์แล้ว หรือ รอจัดกลุ่ม .:. Save ได้
						if ($fld["imp_request_vsn_item_id"] > 0) {
							foreach ($dataB as $fldA => $value) {
								$arrValue[]	= ($value != "") ? $value : null;
								$addField	.= ", {$fldA} = ?";
							}

							$arrValue[] = $fld["imp_request_vsn_item_id"];
							$sql		= "UPDATE imp_request_vsn_item SET " . substr($addField, 1) . " WHERE imp_request_vsn_item_id = ?";
							$db->QueryParam($sql, $arrValue);
	
						}  
					}

					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($dataB);
					unset($arrValue);
					// ============== //
				}
 
				// ========================= update dtl ========================= //
				foreach ($ArrDtl as $fldDtl) {   

					$dataC["c_request"] 					= $fldDtl["c_request"];	
					$dataC["c_request_desc"] 				= $fldDtl["c_request_desc"];	
					$dataC["i_status"] 						= ($mode == "GENCODE") ? "2" : "1";		
					$dataC["f_inv"]							= $ArrDtlMoney[$fldDtl["imp_request_vsn_dtl_id"]];
					$dataC["dc_user_update_id"]				= $_SESSION["user_id"];
					$dataC["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
					$dataC["d_update"]						= date("Y-m-d H:i:s");
					$dataC["i_send_jv"] 					= $fldDtl["i_send_jv"];
					$dataC["dc_creditor_id"] 				= $fldDtl["dc_creditor_id"];

					if ($fldDtl["imp_request_vsn_dtl_id"] > 0) {
						foreach ($dataC as $fldDtlC => $value) {
							$arrValueC[]	= ($value != "") ? $value : null;
							$addFieldC	.= ", {$fldDtlC} = ?";
						}

						$arrValueC[] = $fldDtl["imp_request_vsn_dtl_id"];
						$sqlC		= "UPDATE imp_request_vsn_dtl SET " . substr($addFieldC, 1) . " WHERE imp_request_vsn_dtl_id = ?";
						$db->QueryParam($sqlC, $arrValueC);

					}  

					// ============== //
					$addFieldC	= null; 
					unset($dataC);
					unset($arrValueC);
					// ============== //
				}
			// ========================= END update dtl ========================= //	
				 
 
				if ($mode == "GENCODE") {

					$msg	= "";
					$code	= "IRCV";
					$gl_tran_hdr_id_bank = 0;
					$imp	= $db->GetDataBySQL("
						SELECT
							a.c_code
							,a.c_doc
							,a.c_period_no
							,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
							,ISNULL((SELECT SUM(aa.f_dr) FROM imp_request_vsn_item aa WHERE aa.imp_request_vsn_hdr_id = a.imp_request_vsn_hdr_id), 0) AS f_total_amt
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
						$arrValue[]	= "IRCV";
						$arrValue[]	= $yyyy . $mm;
						$arrValue[]	= $_SESSION["user_id"];
						$arrValue[]	= $_SESSION["dc_cost_id"];
						$arrValue[]	= $_REQUEST["id"];

						$arr_gen_code_IRCV	= $db->GetDataBySQL($sql, $arrValue);

						// ============== //
						$addField	= null;
						$addValue	= null;
						unset($data);
						unset($arrValue);
						// ============== //

						if ($_REQUEST["id"] == $arr_gen_code_IRCV["reference_id"]) {
							$data["i_status"]					= 2;
							$data["c_code"]						= $arr_gen_code_IRCV["c_code_gen"];
							$data["dc_user_update_id"]			= $_SESSION["user_id"];
							$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
							$data["d_update"]					= date("Y-m-d H:i:s"); 
							$data["dc_user_update_id_req"]		= $_SESSION["user_id"];
							$data["dc_user_update_cost_id_req"]	= $_SESSION["dc_cost_id"];
							$data["d_update_req"]				= date("Y-m-d H:i:s");

							foreach ($data as $fld => $value) {
								$arrValue[]	= ($value != "") ? $value : null;
								$addField	.= ", {$fld} = ?";
							}

							$arrValue[] = $_REQUEST["id"]; 
							$sql		= "UPDATE {$table} SET " . substr($addField, 1) . " WHERE {$key_id} = ?;"; 
							$para		= $db->QueryParam($sql, $arrValue);

							if ($para) {

								$msg	.= "เลขที่นำเข้าใบเบิก Vision Net : <b style='color:blue;'>" . $arr_gen_code_IRCV["c_code_gen"] . "</b><br>";
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

	 
		case "GENCODEJV":

			$msg	= "";
			$code	= "IRCV";
		 
			$dataRqVsnJV 	= array();
			$imp		= $db->GetDataBySQL("SELECT a.c_code 
												,a.c_period_no
												,a.c_doc
												,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
												,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date
												,ISNULL((SELECT SUM(aa.f_inv) FROM imp_request_vsn_dtl aa WHERE aa.imp_request_vsn_hdr_id = a.imp_request_vsn_hdr_id and aa.i_send_jv=3), 0) AS f_total_amt
												,(SELECT cc.gl_dc_book_type_id FROM vw_gl_dc_book_doc cc WHERE cc.c_doc_code='IRCV') as fixed_gl_book_id
											FROM imp_request_vsn_hdr a 
											WHERE imp_request_vsn_hdr_id=?;", array($_REQUEST["id"]));
	
			$gl	= $db->GetDataBySQL("SELECT a.gl_tran_hdr_rq_id as gl_tran_hdr_id,b.c_code FROM imp_request_vsn_hdr a INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_rq_id = b.gl_tran_hdr_id WHERE a.imp_request_vsn_hdr_id=? AND b.i_enable = 1;", array($_REQUEST["id"]));
	
			if ($imp["d_save_jv_date"] == "") {
				$msg .= "- กรุณาบันทึก \"วันที่บันทึกบัญชีตั้งหนี้\" ก่อน<br>";
				$re	= array("success" => false, "msg" => $msg, "imp_request_vsn_hdr_id"=> $_REQUEST["id"]);
			} else if ($gl["c_code"] != "0" && $gl["c_code"] != "") {
				$msg .= "- เลขที่บัญชีนี้ออกเลขแล้ว <font color='blue'><b>" . $gl["c_code"] . "</b></font><br>";
				$re	= array("success" => false, "msg" => $msg, "imp_request_vsn_hdr_id" => $_REQUEST["id"]);
			} else {
	
				list($yyyy, $mm, $dd) = explode("-", $imp["d_save_jv_date"]);
	
				// ========================บันทึกบัญชี 1/2 [ตั้งหนี้] TABLE = GL_TRAN_HDR ==================== 
				$dataRqVsnJV["c_ref_doc"]								= $imp["c_code"];
				$dataRqVsnJV["gl_dc_book_type_id"]						= $imp["fixed_gl_book_id"];
				$dataRqVsnJV["d_doc_date"]								= $imp["d_doc_date"];
				$dataRqVsnJV["d_save_date"]								= $imp["d_save_jv_date"];
				$dataRqVsnJV["f_total_amt"]								= $imp["f_total_amt"];
				$dataRqVsnJV["table_pk_id"]								= $_REQUEST["id"];
				$dataRqVsnJV["table_name"]								= "imp_request_vsn_hdr";
				$dataRqVsnJV["table_detail"]							= "นำเข้าใบเบิก Vision Net สำหรับตั้งหนี้";
				$dataRqVsnJV["c_mm"]									= $mm;
				$dataRqVsnJV["c_yyyy"]									= $yyyy;
				$dataRqVsnJV["c_yyyy_mm"]								= $yyyy . $mm;
				$dataRqVsnJV["c_comment1"]								= "นำเข้าใบเบิก Vision Net สำหรับตั้งหนี้ " . $imp["c_period_no"] . " รอบที่ " . $imp["c_doc"] . " เดือน " . $mm . " พ.ศ. " . ($yyyy + 543);
				$dataRqVsnJV["i_enable"]								= STATUS_ENABLE;
				$dataRqVsnJV["i_type"]									= 2;
				$dataRqVsnJV["i_is_post"]								= 2;
				$dataRqVsnJV["i_is_close_year"]							= 2;
				$dataRqVsnJV["i_is_reversing"]							= 2;
				$dataRqVsnJV["i_close_year_type"]						= 9;
				$dataRqVsnJV["i_preview"]								= 1;
				$dataRqVsnJV["i_chk_gl_dtl"]							= 1;
				$dataRqVsnJV["i_chk_gl_purchase"]						= 1;
				$dataRqVsnJV["c_code"]									= "0"; 
				$dataRqVsnJV["dc_user_create_id"]						= $_SESSION["user_id"];
				$dataRqVsnJV["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
				$dataRqVsnJV["d_create"]								= date("Y-m-d H:i:s");
				$dataRqVsnJV["dc_user_update_id"]						= $_SESSION["user_id"];
				$dataRqVsnJV["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
				$dataRqVsnJV["d_update"]								= date("Y-m-d H:i:s");
				$dataRqVsnJV["i_cancel_doc_expense"]					= 4;
				$addFieldBank  = "";
				$addValueBank  = "";
	
				foreach ($dataRqVsnJV as $fld => $value) {
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
				$gl_tran_hdr_id_creditor= $ss_id["id"];
	
				// ============== //
				$addFieldBank	= null;
				$addValueBank	= null;
				unset($dataRqVsnJV);
				unset($arrValueBank);
				$sqlBankDtl	= $stmtBankDtl = $sqlCR3 = "";
				$arrValueCR4 = array();
				// ============== //
	
				if ($para) {
	
					//  บันทึกบัญชี 2/2 [ตั้งหนี้] TABLE =  GL_TRAN_DTL ====================== //
					// DR ค่าใช้จ่าย CR เจ้าหนี้
					if ($gl_tran_hdr_id_creditor > 0) {
	
						$dc_cost_acc_id1	= 77; /* 0104040100 : คณะแพทยศาสตร์วชิรพยาบาล */
						$dc_cost_acc_id2	= 36; /* 0104020200 : ฝ่ายการคลัง */
	
						$sqlBankDtl	= "	
							DECLARE @imp_request_vsn_hdr_id AS BIGINT = " . $_REQUEST["id"] . ";
							DECLARE @hdr_id AS BIGINT = " . $gl_tran_hdr_id_creditor . ";
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
								,i_type_year
								,dc_expense_budget_type_id
								,c_budget_year
								,i_return
							)
							SELECT
								ROW_NUMBER() OVER (ORDER BY a.i_type_jv ASC,a.c_acc_code) AS i_rank
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
										,a.dc_acc_id_dr as dc_acc_id
										,sum(a.f_dr) as f_dr
										,0.00 as f_cr
										,1 as i_type_jv,a.c_acc_code_dr as c_acc_code
									from vw_vsn_request_item_gl a   
									where a.imp_request_vsn_hdr_id = @imp_request_vsn_hdr_id
										and a.i_send_jv=3 and a.dc_acc_id_dr>0 and a.f_dr>0
									group by a.dc_acc_id_dr,a.c_acc_code_dr 
								UNION
								SELECT
									@dc_cost_acc_id1 AS dc_cost_acc_id
									,a.dc_acc_id_cr  as dc_acc_id
									,0.00 as f_dr
									,sum(a.f_cr) as f_cr
									,2 as i_type_jv,a.c_acc_code_cr as c_acc_code
								from vw_vsn_request_item_gl a 
								where a.imp_request_vsn_hdr_id = @imp_request_vsn_hdr_id
										and a.i_send_jv=3 and a.dc_acc_id_cr>0 and a.f_cr>0
								group by a.dc_acc_id_cr,a.c_acc_code_cr
									) a
							ORDER BY i_rank;";
 
						$stmtBankDtl = $db->QueryParam($sqlBankDtl, array());
	
						if ($stmtBankDtl) {
	
							// ====================== GEN GX ====================== // 
							list($yyyy, $mm, $dd)	= explode("-", $imp["d_save_jv_date"]);
							$sqlGenGXCodeCreditor	= "EXEC SP_GEN_CODE ?,?,?,?,?;";
							$arrValueCRGX[]	= "GX";
							$arrValueCRGX[]	= $yyyy . $mm;
							$arrValueCRGX[]	= $_SESSION["user_id"];
							$arrValueCRGX[]	= $_SESSION["dc_cost_id"];
							$arrValueCRGX[]	= $gl_tran_hdr_id_creditor;
	
							$stmtGenCRGX 			= $db->QueryParam($sqlGenGXCodeCreditor, $arrValueCRGX);
							$arr_gen_code_gx_creditor 	= $db->Fetch($stmtGenCRGX);
	
							// ============== //
							$addFieldBank	= null;
							$addValueBank	= null;
							unset($dataRqVsnJV);
							unset($arrValueBank);
							// ============== //
	
							if ($gl_tran_hdr_id_creditor == $arr_gen_code_gx_creditor["reference_id"]) {
	
								$chk_gl_dtl_bank = $db->GetDataBySQL("SELECT ISNULL((SELECT 1 FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
															,ISNULL((SELECT 1 FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
															,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
															,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
													FROM gl_tran_hdr aa
													WHERE aa.gl_tran_hdr_id=?", array($gl_tran_hdr_id_creditor));
								if (($chk_gl_dtl_bank["no_acc"] > 0) || ($chk_gl_dtl_bank["no_cost"] > 0) || ($chk_gl_dtl_bank["f_tot_dr"] != $chk_gl_dtl_bank["f_tot_cr"])) {
									$i_success_jv_bank = 2;
								} else {
									$i_success_jv_bank = 1;
								} 
	
								$sqlCR3		= " UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";
								$sqlCR3		.= " UPDATE imp_request_vsn_hdr SET  i_status=4,gl_tran_hdr_rq_id = ?,dc_user_update_id_jv=?,dc_user_update_cost_id_jv=?,d_update_jv=?  WHERE imp_request_vsn_hdr_id = ?";
								$sqlCR3		.= " UPDATE a SET  a.i_status=3,a.dc_acc_id_dr=(select dc_acc_id from dc_expense_acc_vsn where dc_expense_acc_vsn_id=a.dc_expense_acc_vsn_id)  from imp_request_vsn_dtl a WHERE a.imp_request_vsn_hdr_id = ?";
  
								$arrValueCR4[] 	= $arr_gen_code_gx_creditor["c_code_gen"];
								$arrValueCR4[] 	= $i_success_jv_bank;
								$arrValueCR4[] 	= $gl_tran_hdr_id_creditor;
								$arrValueCR4[] 	= $gl_tran_hdr_id_creditor; 
								$arrValueCR4[]	= $_SESSION["user_id"];
								$arrValueCR4[]	= $_SESSION["dc_cost_id"];
								$arrValueCR4[]	= date("Y-m-d H:i:s"); 
								$arrValueCR4[] 	= $_REQUEST["id"];
								$arrValueCR4[] 	= $_REQUEST["id"];
	
								if ($para) {
									$para	= $db->QueryParam($sqlCR3, $arrValueCR4);
									$msg	.= "เลขที่สมุดรายวัน  : <b style='color:red;'>" . $arr_gen_code_gx_creditor["c_code_gen"] . "</b><br>";
								}
								// ============== //
								$addFieldBank	= null;
								$addValueBank	= null;
								unset($dataRqVsnJV);
								unset($arrValueCR4);
								$re	= array("success" => true, "msg" => $msg, "imp_request_vsn_hdr_id" => $_REQUEST["id"]);
								// ============== //
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
				$db->QueryParam("DELETE imp_request_vsn_dtl WHERE {$key_id}=?;", array($_REQUEST["id"]));

				$re = array(
					"success"		=> true,
					"msg"			=> "ลบรายการเรียบร้อย"
				);
			}

			break;

			case "DELETE_GX":

				$msg	= "";
		
				$sql = "UPDATE gl_tran_hdr SET i_enable = " . STATUS_DISABLE . ",i_cancel_doc_expense=6 WHERE table_name = 'imp_request_vsn_hdr' AND table_pk_id = " . $_REQUEST["id"] . ";";
		
				$stmt = $db->QueryParam($sql, array());
		
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== //
		
				if ($stmt) {
		
					$data["i_status"]								= 3;
					$data["gl_tran_hdr_rq_id"]						= null; 
					$data["dc_user_update_id_req"]					= $_SESSION["user_id"];
					$data["dc_user_update_cost_id_req"]				= $_SESSION["dc_cost_id"];
					$data["d_update_req"]							= date("Y-m-d H:i:s");
		 
		
					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fld} = ?";
					}
		
					$arrValue[]	= $_REQUEST["id"];
					$sql	= "	UPDATE imp_request_vsn_hdr SET " . substr($addField, 1) . " WHERE imp_request_vsn_hdr_id = ?;";
		
					$db->QueryParam($sql, $arrValue);
		
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //
		
					$re = array(
						"success"		=> true,
						"msg"			=> "ยกเลิกรายการบัญชีเรียบร้อย"
					);
				} else {
					$msg	.= "ไม่สามารถยกเลิก gl_tran_hdr ได้";
					$re	= array("success" => false, "msg" => $msg, "imp_request_ephis_hdr_id" => $_REQUEST["id"]);
					echo json_encode($re);
					exit;
				}
				break;

		 
}
echo json_encode($re);
exit;
