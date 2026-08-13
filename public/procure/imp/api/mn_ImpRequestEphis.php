<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
global $db;
$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

$addFieldB	= null; 
$arrValueB  = array(); 

function fn_gen_items($modes,$arr_dtl,$dtl_id,$hdr_id,$i_type_dr)
{ 
	global $db;
   
	$arrParamB = array () ;
    $addFieldB	= null;
	$addValueB	= null;
	$arrValueB	= array();

	if (($modes=="INSERT_ITEMS") && (count($arr_dtl)>0) && ($dtl_id>0) && ($hdr_id>0))
	{
		 
		$db->QueryParam("DELETE imp_request_ephis_item 	WHERE imp_request_ephis_dtl_id = ? and i_type_show=?", array($dtl_id,$i_type_dr));
 
		$dataB["imp_request_ephis_hdr_id"]		= $hdr_id;
		$dataB["imp_request_ephis_dtl_id"]		= $dtl_id; 
		
		if (($i_type_dr=="2") && ($arr_dtl["dc_acc_id_cr"]>0))
		{ //CR
			$dataB["dc_acc_id"]					= $arr_dtl["dc_acc_id_cr"];
			$dataB["f_dr"]						= 0;
			$dataB["f_cr"]						= $arr_dtl["f_inv"];
			$dataB["i_type_show"]			 	= 2;	
			$dataB["i_rank_dr"]					= "0";
			$dataB["dc_expense_group_vsn_id"]	= "0";
			$dataB["dc_expense_vsn_id"]			= "0";
			$dataB["dc_expense_acc_vsn_id	"]	= "0";		
			$dataB["f_inv"]						= "0";
			$dataB["f_vat"]						= "0";
			$dataB["f_tax_personal"]			= "0";
			$dataB["f_tax_corporate"]			= "0";
			$dataB["f_social_security"]			= "0";
			$dataB["f_fine"]					= "0";			
		} 
		else if  (($i_type_dr=="1") && ($arr_dtl["dc_acc_id_dr"]>0))
		{ //DR
			$dataB["dc_acc_id"]					= $arr_dtl["dc_acc_id_dr"];
			$dataB["f_dr"]						= $arr_dtl["f_inv"];
			$dataB["f_cr"]						= 0;		
			$dataB["i_type_show"]			 	= 1;
			$dataB["i_rank_dr"]					= 1;		
			$dataB["dc_expense_group_vsn_id"]	= $arr_dtl["dc_expense_group_vsn_id"];
			$dataB["dc_expense_vsn_id"]			= $arr_dtl["dc_expense_vsn_id"];
			$dataB["dc_expense_acc_vsn_id	"]	= $arr_dtl["dc_expense_acc_vsn_id"];	
			$dataB["f_inv"]							= $arr_dtl["f_inv"];
			$dataB["f_vat"]							= $arr_dtl["f_vat"];
			$dataB["f_tax_personal"]				= $arr_dtl["f_tax_personal"];
			$dataB["f_tax_corporate"]				= $arr_dtl["f_tax_corporate"];
			$dataB["f_social_security"]				= $arr_dtl["f_social_security"]; 
			$dataB["f_fine"]						= $arr_dtl["f_fine"];  				
		}
		else
		{
			$dataB["dc_acc_id"]	= $dataB["f_dr"] =	$dataB["f_cr"]	= $dataB["i_rank_dr"]	= "0";
		}

		$dataB["i_cal_gl"]						= $arr_dtl["i_cal_gl"]; 
		$dataB["i_type_year"]					= 1;
		$dataB["c_budget_year"]					= $arr_dtl["c_budget_year"];   // date("Y"); 
	  
		$dataB["c_comment"]						= "นำเข้า Excel"; 
		$dataB["dc_user_create_id"]				= $_SESSION["user_id"];
		$dataB["dc_user_create_cost_id"]		= $_SESSION["dc_cost_id"];
		$dataB["d_create"]						= date("Y-m-d H:i:s");
		$dataB["dc_user_update_id"]				= $_SESSION["user_id"];
		$dataB["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$dataB["d_update"]						= date("Y-m-d H:i:s"); 	 
	  
		foreach ($dataB as $fldB => $valueB) {
			$arrValueB[]	= ($valueB != "") ? $valueB : null;
			$addFieldB		.= ", {$fldB}";
			$addValueB		.= ", ?";
		}

		$sqlItem	= "	SET NOCOUNT ON
						INSERT INTO imp_request_ephis_item (" . substr($addFieldB, 1) . ") VALUES (" . substr($addValueB, 1) . ");
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
 
} //end fn


switch ($mode) {

	case "ADD":
	case "EDIT":

		$msg	= ""; 
		
		$data["c_comment"]								= $_REQUEST["c_comment"];
		$data["dc_user_update_id"]						= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
		$data["d_update"]								= date("Y-m-d H:i:s");

		if ($_REQUEST["i_type_menu"] == "1") { // แก้ไขได้ เมนู  นำเข้าใบเบิก 
			$data["c_period_no"]						= $_REQUEST["c_period_no"];
			$data["c_doc"]								= $_REQUEST["c_doc"];
			$data["dc_expense_budget_type_id"]			= $_REQUEST["dc_expense_budget_type_id"]; 
			$data["d_doc_date"]							= $_REQUEST["d_doc_date"];	
			$data["dc_user_update_id_req"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id_req"]			= $_SESSION["dc_cost_id"];
			$data["d_update_req"]						= date("Y-m-d H:i:s");				 
		} 
		else 
		{
			//เฉพาะเมนู ตั้งหนี้ (JV)
			$data["d_jv_date"]							= $_REQUEST["d_jv_date"];
			$data["i_status"]							= 3;
			$data["dc_user_update_id_req"]				= $_SESSION["user_id"];
			$data["dc_user_update_cost_id_req"]			= $_SESSION["dc_cost_id"];
			$data["d_update_req"]						= date("Y-m-d H:i:s");				
		}
 

		if ($mode=="ADD") {
			$data["i_status"]								= 1;
			$data["i_enable"]								= STATUS_ENABLE;
			$data["dc_user_create_id"]						= $_SESSION["user_id"];
			$data["dc_user_create_cost_id"]					= $_SESSION["dc_cost_id"];
			$data["d_create"]								= date("Y-m-d H:i:s");
			$data["gl_process_creditor_log_id"]				= "0";
			$data["i_type_request"]							= $_REQUEST["i_type_request"];

			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "") ? $value : null;
				$addField .= ", {$fld}";
				$addValue .= ", ?";
			}

			$sql	= "
				SET NOCOUNT ON
				INSERT INTO imp_request_ephis_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
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
			$sql		= "UPDATE imp_request_ephis_hdr SET " . substr($addField, 1) . " WHERE imp_request_ephis_hdr_id = ?";
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
			$db->QueryParam("DELETE imp_request_ephis_dtl 	WHERE imp_request_ephis_hdr_id = ?", array($_REQUEST["id"]));
			
		}

		if ($msg == "") {
			// ========================= add dtl ========================= //
			foreach ($Arr as $fld) {

				$data["imp_request_ephis_hdr_id"]						= $_REQUEST["id"]; 
				$data["dc_expense_group_vsn_id"]						= $fld["dc_expense_group_vsn_id"];
				$data["dc_expense_vsn_id"]								= $db->GetDataBySQL("SELECT dc_expense_vsn_id FROM dc_expense_acc_vsn WHERE dc_expense_acc_vsn_id=?;", array($fld["dc_expense_acc_vsn_id"]));
				$data["dc_expense_acc_vsn_id"]							= $fld["dc_expense_acc_vsn_id"];
				$data["i_type_year"]									= $fld["i_type_year"];
				$data["c_budget_year"]									= $fld["c_budget_year"];  
				$data["c_request"]										= $fld["c_request"]; 
				$data["c_request_desc"]									= $fld["c_request_desc"];
				
				$data["f_inv"]											= $fld["f_inv"];
				$data["f_vat"]											= $fld["f_vat"];
				$data["f_tax_personal"]									= $fld["f_tax_personal"];
				$data["f_tax_corporate"]								= $fld["f_tax_corporate"];
				$data["f_social_security"]								= $fld["f_social_security"]; 
				$data["f_fine"]											= $fld["f_fine"];   

				$data["c_acc_item"]										= $fld["c_acc_item"];   
				$data["dc_user_update_id"]								= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
				$data["d_update"]										= date("Y-m-d H:i:s");
				$data["i_cal_gl"]										= $fld["i_cal_gl"];
				$data["gl_dc_config_id"]								= $fld["gl_dc_config_id"];
				$data["dc_acc_id_dr"]									= ($fld["dc_expense_acc_vsn_id"]>0) ? $db->GetDataBySQL("SELECT dc_acc_id FROM dc_expense_acc_vsn WHERE dc_expense_acc_vsn_id =?;", array($fld["dc_expense_acc_vsn_id"])) : "0";
				$data["dc_acc_id_cr"]									= $db->GetDataBySQL("SELECT dc_acc_id FROM gl_dc_config WHERE gl_dc_config_id =?;", array($fld["gl_dc_config_id"]));
				$data["i_send_jv"]										= $fld["i_send_jv"]; 
				$data["dc_creditor_id"]									= $fld["dc_creditor_id"];

				if ($fld["imp_request_ephis_dtl_id"] > 0) 
				{ // UPDATE
					foreach ($data as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $fld["imp_request_ephis_dtl_id"];
					$sql		= "UPDATE imp_request_ephis_dtl SET " . substr($addField, 1) . " WHERE imp_request_ephis_dtl_id = ?";
					$db->QueryParam($sql, $arrValue);
 
					//------ INSERT EPHIS ITEM FOR GX/GL ------ 
					
					if (@$data["dc_acc_id_dr"]>0)
						fn_gen_items("INSERT_ITEMS",$data,$fld["imp_request_ephis_dtl_id"],$_REQUEST["id"],1);
					if (@$data["dc_acc_id_cr"]>0)
						fn_gen_items("INSERT_ITEMS",$data,$fld["imp_request_ephis_dtl_id"],$_REQUEST["id"],2);
					 
				} 
				else 
				{ // INSERT
					$data["d_doc"]											= $fld["d_doc"];
					$data["d_dkdate"]										= $fld["d_dkdate"];
					$data["d_paydate"]										= $fld["d_paydate"];
					$data["d_canceldate"]									= $fld["d_canceldate"];  
					$data["c_request"]										= $fld["c_request"]; 
					 
					$data["c_rcvtime"]										= $fld["c_rcvtime"];
					$data["c_approve"]										= $fld["c_approve"];
					$data["c_acc_item"]										= $fld["c_acc_item"];
					$data["c_budget_type_name"]								= $fld["c_budget_type_name"];
					$data["c_creditor"]										= $fld["c_creditor"];  
					$data["c_bglst"]										= $fld["c_bglst"];
					$data["c_bgdktypename"]									= $fld["c_bgdktypename"]; 
					$data["i_status"]										= 1;
 
					$data["dc_user_create_id"]								= $_SESSION["user_id"];
					$data["dc_user_create_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_create"]										= date("Y-m-d H:i:s"); 

					$data["dc_creditor_id"]									= $db->GetDataBySQL("SELECT TOP 1 dc_creditor_id FROM NMU.dbo.dc_creditor WHERE replace(c_map_ephis,' ','')=replace(?,' ','');", array($data["c_creditor"]));
					$data["i_send_jv"] 										= $fld["i_send_jv"]; //1=ไม่ระบุคือยังไม่ map กับใบเบิกพิเศษ ,2=ไม่ลงบัญชี,3=ลงบัญชี

					foreach ($data as $fld => $value) {
						$arrValue[] = ($value != "") ? $value : null;
						$addField .= ", {$fld}";
						$addValue .= ", ?";
					}

					$sql = "SET NOCOUNT ON
							INSERT INTO imp_request_ephis_dtl (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
							SELECT @@IDENTITY as id;";
					//$db->QueryParam($sql, $arrValue);
					$para		= $db->QueryParam($sql, $arrValue);
					$ss_id		= $db->Fetch($para);
					$dtl_id		= $ss_id["id"];	
					
					
					//------ INSERT EPHIS ITEM FOR GX/GL ------
					if ($dtl_id>0)
					{ 
						if (@$data["dc_acc_id_dr"]>0)
							fn_gen_items("INSERT_ITEMS",$data,$dtl_id,$_REQUEST["id"],1);
						if (@$data["dc_acc_id_cr"]>0)
							fn_gen_items("INSERT_ITEMS",$data,$dtl_id,$_REQUEST["id"],2); 
 
						if (@$data["dc_creditor_id"]>0)
						{
							$arrCreditor[] 		= $data["dc_creditor_id"];
							$sqlCreditor		= "UPDATE dc_creditor SET i_key=1 WHERE dc_creditor_id = ?";
							$db->QueryParam($sqlCreditor, $arrCreditor);
						}							
					} //end items
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

		case "SAVE_DTL_N_ITEM":
			//เฉพาะเมนู บันทึกบัญชีตั้งหนี้ EPHIS
 
			$msg = "";
			$Arr 				= json_decode($_REQUEST["data"], true);
			$ArrDtl				= array();
			$ArrDtlMoneyINV		= array();
			$ArrDtlMoneyVAT		= array();
			$ArrDtlMoneyTAX1	= array();
			$ArrDtlMoneyTAX2	= array();
			$ArrDtlMoneySOCIAL	= array();
			$ArrDtlMoneyFINE	= array();
			$ArrDtlInRequest	= array();

		//	print_r($Arr);
		//	exit; 
	
			if ($msg == "") {
				// ========================= UPDATE EPHIS ITEM ========================= //
				$momo =0;
				$i_no_dr = 0;
				foreach ($Arr as $fld) {
					
					$dtl_id	= $db->GetDataBySQL("SELECT imp_request_ephis_dtl_id FROM imp_request_ephis_item WHERE imp_request_ephis_item_id=?;", array($fld["imp_request_ephis_item_id"]));
					if ($fld["f_cr"]>0)
					{
						$i_no_dr="0";
					}
					else if ($fld["f_dr"]>0)
					{
						$i_no_dr++;
					}

 					$data["i_type_year"]									= $fld["i_type_year"];
					$data["c_budget_year"]									= $fld["c_budget_year"]; 
					$data["i_cal_gl"]										= $fld["i_cal_gl"]; 
					$data["dc_acc_id"]										= $fld["dc_acc_id"];
					$data["f_dr"]											= $fld["f_dr"]; 
					$data["f_cr"]											= $fld["f_cr"]; 
					$data["f_inv"]											= $fld["f_inv"];
					$data["f_vat"]											= $fld["f_vat"];
					$data["f_tax_personal"]									= $fld["f_tax_personal"];
					$data["f_tax_corporate"]								= $fld["f_tax_corporate"];
					$data["f_social_security"]								= $fld["f_social_security"]; 
					$data["f_fine"]											= $fld["f_fine"];  
					$data["dc_user_update_id"]								= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]							= $_SESSION["dc_cost_id"];
					$data["d_update"]										= date("Y-m-d H:i:s");
					$data["i_type_show"]									= ($fld["f_dr"]>0) ? 1 : 2;
					$data["i_rank_dr"]										= $i_no_dr; 

					//$data["c_request"]										= $fld["c_request"];
  

					if ($data["i_type_show"]=="1") 
					{ // c_request + c_request_desc + i_type_show = ของตาราง imp_request_vsn_dtl
						if (($data["i_rank_dr"]=="1") && (!in_array("$dtl_id", $ArrDtlInRequest)))
						{ 
							$momo++;
							$ArrDtlInRequest[$dtl_id]					= $dtl_id;
							$ArrDtl[$momo]["imp_request_ephis_dtl_id"] 	= $dtl_id;
							$ArrDtl[$momo]["c_request"] 				= $fld["c_request"];
							$ArrDtl[$momo]["c_request_desc"] 			= $fld["c_request_desc"]; 
							$ArrDtl[$momo]["i_send_jv"] 				= $fld["i_send_jv"];
							$ArrDtl[$momo]["dc_creditor_id"] 			= $fld["dc_creditor_id"]; 
						}
						else
						{
							$i_no_dr="0";
						}

						@$ArrDtlMoneyINV[$dtl_id] 		+= @$fld["f_inv"];
						@$ArrDtlMoneyVAT[$dtl_id] 		+= @$fld["f_vat"];
						@$ArrDtlMoneyTAX1[$dtl_id] 		+= @$fld["f_tax_personal"];
						@$ArrDtlMoneyTAX2[$dtl_id] 		+= @$fld["f_tax_corporate"];
						@$ArrDtlMoneySOCIAL[$dtl_id] 	+= @$fld["f_social_security"];
						@$ArrDtlMoneyFINE[$dtl_id] 		+= @$fld["f_fine"];						
					 }					

					if ($fld["imp_request_ephis_item_id"] > 0) 
					{ // UPDATE
						foreach ($data as $fldA => $value) {
							$arrValue[]	= ($value != "") ? $value : null;
							$addField	.= ", {$fldA} = ?";
						}
	
						$arrValue[] = $fld["imp_request_ephis_item_id"];
						$sql		= "UPDATE imp_request_ephis_item SET " . substr($addField, 1) . " WHERE imp_request_ephis_item_id = ?";
						$db->QueryParam($sql, $arrValue);
	 
				 	 
			//	echo "<hr>Arr item update=";print_r($data);
					} 
					 
	
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset($data);
					unset($arrValue);
					// ============== //
				}

			//	echo "<hr>Arr dtl=";print_r($ArrDtl); exit;
			//	echo "<hr>Arr dtl Money INV=";print_r($ArrDtlMoneyINV);
				
				// ===================== update imp_request_ephis_dtl =====================
				foreach ($ArrDtl as $arr_dtl_update) {
					$dataB["f_inv"] 					= $ArrDtlMoneyINV[$arr_dtl_update["imp_request_ephis_dtl_id"]];
					$dataB["f_vat"] 					= $ArrDtlMoneyVAT[$arr_dtl_update["imp_request_ephis_dtl_id"]];
					$dataB["f_tax_personal"] 			= $ArrDtlMoneyTAX1[$arr_dtl_update["imp_request_ephis_dtl_id"]];
					$dataB["f_tax_corporate"] 			= $ArrDtlMoneyTAX2[$arr_dtl_update["imp_request_ephis_dtl_id"]];
					$dataB["f_social_security"] 		= $ArrDtlMoneySOCIAL[$arr_dtl_update["imp_request_ephis_dtl_id"]];
					$dataB["f_fine"] 					= $ArrDtlMoneyFINE[$arr_dtl_update["imp_request_ephis_dtl_id"]];
					$dataB["c_request"]					= $arr_dtl_update["c_request"];
					$dataB["c_request_desc"]			= $arr_dtl_update["c_request_desc"];
					$dataB["dc_user_update_id"]			= $_SESSION["user_id"];
					$dataB["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
					$dataB["d_update"]					= date("Y-m-d H:i:s");
					$dataB["i_send_jv"]					= $arr_dtl_update["i_send_jv"];
					$dataB["dc_creditor_id"]			= $arr_dtl_update["dc_creditor_id"];
					
					if ($arr_dtl_update["imp_request_ephis_dtl_id"] > 0) {
						foreach ($dataB as $fldB => $valueB) {
							$arrValueB[]	= ($valueB != "") ? $valueB : null;
							$addFieldB	.= ", {$fldB} = ?";
						}
	
						$arrValueB[] = $arr_dtl_update["imp_request_ephis_dtl_id"];
						$sqlB		= "UPDATE imp_request_ephis_dtl SET " . substr($addFieldB, 1) . " WHERE imp_request_ephis_dtl_id = ?";
						$para		= $db->QueryParam($sqlB, $arrValueB);
						
 
						$sqlB = "";
						$addFieldB	= null;
						$addValue	= null;
						unset($dataB);
						unset($arrValueB);

 					
					}  
				}
				 
				// ============== //
				$addFieldB	= null;
				$addValue	= null;
				unset($dataB);
				unset($arrValueB);
				// ============== //
	
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
	 

	case "GENCODE":

		//GENCODE imp_request_ephis_hdr  [IRCE]

		$ephisRH				= $db->GetDataBySQL("SELECT CONVERT(VARCHAR,d_doc_date, 120) AS d_doc_date,LEFT(c_code,1) as c_sub FROM imp_request_ephis_hdr WHERE imp_request_ephis_hdr_id=?;", array($_REQUEST["id"]));
  
		if ($ephisRH["c_sub"]!="I")
		{
			list($yyyy, $mm, $dd)	= explode("-", "$ephisRH[d_doc_date]");
			$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
			$arrValue[]	= "IRCE";
			$arrValue[]	= $yyyy . $mm;
			$arrValue[]	= $_SESSION["user_id"]; 
			$arrValue[]	= $_SESSION["dc_cost_id"]; 
			$arrValue[]	= $_REQUEST["id"]; 


			$arr_gen_code_irce	= $db->GetDataBySQL($sql, $arrValue);

			// ============== 
			$addField	= null;
			$addValue	= null;
			unset($data);
			unset($arrValue);
			// ============== 

			if ($_REQUEST["id"] == $arr_gen_code_irce["reference_id"]) {
				$data["i_status"]					= 2;
				$data["c_code"]						= $arr_gen_code_irce["c_code_gen"];
				
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

				$arrValue[] = $arr_gen_code_irce["reference_id"];
				$arrValue[] = $_REQUEST["id"];
				$sql		= "UPDATE imp_request_ephis_hdr SET " . substr($addField, 1) . " WHERE imp_request_ephis_hdr_id = ?";
				$sql		.= " UPDATE imp_request_ephis_dtl SET i_status=2 WHERE imp_request_ephis_hdr_id = ?";

				$para		= $db->QueryParam($sql, $arrValue);

				// ============== 
				$addField	= null;
				$addValue	= null;
				unset($data);
				unset($arrValue);
				// ============== 
			}

			if ($para) {
				$re = array(
					"success"		=> true,
					"msg"			=> "บันทึกเลขเอกสารตั้งหนี้เรียบร้อย"
				);
			} else {
				$re = array(
					"success"		=> false,
					"msg"			=> "error"
				);
			}  
		}
		else
		{
			$re = array(
				"success"		=> true,
				"msg"			=> "เคยบันทึกเลขเอกสารตั้งหนี้แล้ว"
			);
		}
 
 
		break;	
	case "DELETE":

				$c_code	= $db->GetDataBySQL("SELECT c_code FROM imp_request_ephis_hdr WHERE imp_request_ephis_hdr_id=?;", array($_REQUEST["id"]));
				
				if ($c_code != "0" && $c_code != "") 
				{ // ปรับสถานะเป็นไม่ใช้งาน

					$data["i_enable"]								= STATUS_DISABLE;
					$data["dc_user_update_id"]						= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]					= $_SESSION["dc_cost_id"];
					$data["d_update"]								= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fld} = ?";
					}

					$arrValue[] = $_REQUEST["id"];
					$sql		= "UPDATE imp_request_ephis_hdr SET " . substr($addField, 1) . " WHERE imp_request_ephis_hdr_id = ?";
					$para		= $db->QueryParam($sql, $arrValue);

					if ($para) {
						$re = array(
							"success"		=> true,
							"msg"			=> "ปรับสถานะเป็นยกเลิก"
						);
					} else {
						$re = array(
							"success"		=> false,
							"msg"			=> "error"
						);
					}
				} 
				else 
				{ // ลบจริง

						$db->QueryParam("DELETE imp_request_ephis_dtl WHERE imp_request_ephis_hdr_id=?;", array($_REQUEST["id"]));
						$db->QueryParam("DELETE imp_request_ephis_hdr WHERE imp_request_ephis_hdr_id=?;", array($_REQUEST["id"]));

						$re = array(
							"success"		=> true,
							"msg"			=> "ลบรายการเรียบร้อย"
						);
		  		}

		break;
		case "GENCODEJV":

			$msg		= "";
			$code		= "IRCE";
			$dataBank 	= array();
			$imp		= $db->GetDataBySQL("SELECT a.c_code 
												,a.c_period_no
												,a.c_doc
												,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
												,CONVERT(VARCHAR, a.d_jv_date, 120) AS d_save_jv_date
												,ISNULL((SELECT SUM(aa.f_inv) FROM imp_request_ephis_dtl aa WHERE aa.imp_request_ephis_hdr_id = a.imp_request_ephis_hdr_id and aa.i_send_jv=3), 0) AS f_total_amt
												,(SELECT cc.gl_dc_book_type_id FROM vw_gl_dc_book_doc cc WHERE cc.c_doc_code='IRCE') as fixed_gl_book_id
											FROM imp_request_ephis_hdr a 
											WHERE imp_request_ephis_hdr_id=?;", array($_REQUEST["id"]));
	
			$gl	= $db->GetDataBySQL("SELECT a.gl_tran_hdr_rq_id as gl_tran_hdr_id,b.c_code FROM imp_request_ephis_hdr a INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_rq_id = b.gl_tran_hdr_id WHERE a.imp_request_ephis_hdr_id=? AND b.i_enable = 1;", array($_REQUEST["id"]));
	
			if ($imp["d_save_jv_date"] == "") {
				$msg .= "- กรุณาบันทึก \"วันที่บันทึกค่าใช้จ่าย\" ก่อน<br>";
				$re	= array("success" => false, "msg" => $msg, "imp_request_ephis_hdr_id"=> $_REQUEST["id"]);
			} else if ($gl["c_code"] != "0" && $gl["c_code"] != "") {
				$msg .= "- เลขที่บัญชีนี้ออกเลขแล้ว <font color='blue'><b>" . $gl["c_code"] . "</b></font><br>";
				$re	= array("success" => false, "msg" => $msg, "imp_request_ephis_hdr_id" => $_REQUEST["id"]);
			} else {
	
				list($yyyy, $mm, $dd) = explode("-", $imp["d_save_jv_date"]);
	
				// ========================บันทึกบัญชี 1/2 [ตั้งหนี้] TABLE = GL_TRAN_HDR ==================== 
				$dataBank["c_ref_doc"]								= $imp["c_code"];
				$dataBank["gl_dc_book_type_id"]						= $imp["fixed_gl_book_id"];
				$dataBank["d_doc_date"]								= $imp["d_doc_date"];
				$dataBank["d_save_date"]							= $imp["d_save_jv_date"];
				$dataBank["f_total_amt"]							= $imp["f_total_amt"];
				$dataBank["table_pk_id"]							= $_REQUEST["id"];
				$dataBank["table_name"]								= "imp_request_ephis_hdr";
				$dataBank["table_detail"]							= "นำเข้าใบเบิก e-PHIS สำหรับตั้งหนี้";
				$dataBank["c_mm"]									= $mm;
				$dataBank["c_yyyy"]									= $yyyy;
				$dataBank["c_yyyy_mm"]								= $yyyy . $mm;
				$dataBank["c_comment1"]								= "นำเข้าใบเบิก e-PHIS สำหรับตั้งหนี้ " . $imp["c_period_no"] . " รอบที่ " . $imp["c_doc"] . " เดือน " . $mm . " พ.ศ. " . ($yyyy + 543);
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
				$gl_tran_hdr_id_creditor= $ss_id["id"];
	
				// ============== //
				$addFieldBank	= null;
				$addValueBank	= null;
				unset($dataBank);
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
							DECLARE @imp_request_ephis_hdr_id AS BIGINT = " . $_REQUEST["id"] . ";
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
									from vw_ephis_request_item_gl a   
									where a.imp_request_ephis_hdr_id = @imp_request_ephis_hdr_id
										and a.i_send_jv=3 and a.dc_acc_id_dr>0 and a.f_dr>0
									group by a.dc_acc_id_dr,a.c_acc_code_dr 
								UNION
								SELECT
									@dc_cost_acc_id1 AS dc_cost_acc_id
									,a.dc_acc_id_cr  as dc_acc_id
									,0.00 as f_dr
									,sum(a.f_cr) as f_cr
									,2 as i_type_jv,a.c_acc_code_cr as c_acc_code
								from vw_ephis_request_item_gl a 
								where a.imp_request_ephis_hdr_id = @imp_request_ephis_hdr_id
									and a.i_send_jv=3 and a.dc_acc_id_cr>0  and a.f_cr>0
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
							unset($dataBank);
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
								$sqlCR3		.= " UPDATE imp_request_ephis_hdr SET  i_status=4,gl_tran_hdr_rq_id = ?,dc_user_update_id_jv=?,dc_user_update_cost_id_jv=?,d_update_jv=?  WHERE imp_request_ephis_hdr_id = ?";
								$sqlCR3		.= " UPDATE a SET  a.i_status=3,a.dc_acc_id_dr=(select dc_acc_id from dc_expense_acc_vsn where dc_expense_acc_vsn_id=a.dc_expense_acc_vsn_id)  from imp_request_ephis_dtl a WHERE a.imp_request_ephis_hdr_id = ?";
  
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
								unset($dataBank);
								unset($arrValueCR4);
								$re	= array("success" => true, "msg" => $msg, "imp_request_ephis_hdr_id" => $_REQUEST["id"]);
								// ============== //
							}
						}
					}
				}
			}
	
			echo json_encode($re);
			exit;
			break;
			
	case "DELETE_GX":

		$msg	= "";

		$sql = "UPDATE gl_tran_hdr SET i_enable = " . STATUS_DISABLE . ",i_cancel_doc_expense=5 WHERE table_name = 'imp_request_ephis_hdr' AND table_pk_id = " . $_REQUEST["id"] . ";";

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
			$sql	= "	UPDATE imp_request_ephis_hdr SET " . substr($addField, 1) . " WHERE imp_request_ephis_hdr_id = ?;";

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
