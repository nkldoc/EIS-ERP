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

switch ( $mode ) {
	
	case "ADD_ITEM" :
	
		$msg	= "";

		// ===================== DELETE imp_request_ephis_dtl =====================
 		$db->QueryParam("DELETE imp_request_ephis_item WHERE imp_request_ephis_dtl_id = ?;", array($_REQUEST["imp_request_ephis_dtl_id"]));
		// ========================================================================== //
		$Arr			= json_decode($_REQUEST["data"], true);
		$ArrDtlMoneyINV		= array();
		$ArrDtlMoneyVAT		= array();
		$ArrDtlMoneyTAX1	= array();
		$ArrDtlMoneyTAX2	= array();
		$ArrDtlMoneySOCIAL	= array();
		$ArrDtlMoneyFINE	= array();
  
		if($Arr) {
			// ===================== INSERT imp_request_ephis_dtl =====================
			$i_rank_dr=0;
			$dtl_id = $_REQUEST["imp_request_ephis_dtl_id"];
			foreach( $Arr as $fld ) { 
				if ($fld["f_dr"]>0)
				{
					$i_rank_dr++;
				}

				$data["imp_request_ephis_hdr_id"]					= $_REQUEST["imp_request_ephis_hdr_id"];
				$data["imp_request_ephis_dtl_id"]					= $_REQUEST["imp_request_ephis_dtl_id"]; 
				$data["dc_acc_id"]									= $fld["dc_acc_id"];
				$data["f_dr"]										= $fld["f_dr"];
				$data["f_cr"]										= $fld["f_cr"]; 
				$data["i_type_year"]								= $fld["i_type_year"];
				$data["c_budget_year"]								= $fld["c_budget_year"]; 
				$data["i_cal_gl"]									= $fld["i_cal_gl"];
				$data["f_inv"]										= $fld["f_inv"];
				$data["f_vat"]										= $fld["f_vat"];
				$data["f_tax_personal"]								= $fld["f_tax_personal"];
				$data["f_tax_corporate"]							= $fld["f_tax_corporate"];
				$data["f_social_security"]							= $fld["f_social_security"];	
				$data["f_fine"]										= $fld["f_fine"]; 			
				$data["c_comment"]									= "ทำรายการจากเมนู แยกรายละเอียดใบเบิก E-Phis";
				$data["i_type_show"]								= ($data["f_dr"]>0) ? 1 : 2; 
				$data["i_rank_dr"]									= ($data["i_type_show"]=="1") ? $i_rank_dr : "0";
				$data["dc_user_create_id"]							= $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]						= $_SESSION["dc_cost_id"];
				$data["d_create"]									= date("Y-m-d H:i:s");
				$data["dc_user_update_id"]							= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]						= $_SESSION["dc_cost_id"];
				$data["d_update"]									= date("Y-m-d H:i:s");						
 
				@$ArrDtlMoneyINV[$dtl_id] 		+= @$fld["f_inv"];
				@$ArrDtlMoneyVAT[$dtl_id] 		+= @$fld["f_vat"];
				@$ArrDtlMoneyTAX1[$dtl_id] 		+= @$fld["f_tax_personal"];
				@$ArrDtlMoneyTAX2[$dtl_id] 		+= @$fld["f_tax_corporate"];
				@$ArrDtlMoneySOCIAL[$dtl_id] 	+= @$fld["f_social_security"];
				@$ArrDtlMoneyFINE[$dtl_id] 		+= @$fld["f_fine"];
 
				foreach ($data as $fld => $value) {
					$arrValue[]	= ($value != "")? $value : NULL;
					$addField	.= ", {$fld}";
					$addValue	.= ", ?";
				}
					
				$sql	= "INSERT INTO imp_request_ephis_item (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
				$db->QueryParam($sql, $arrValue);
					
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
			}
 
				// ===================== update imp_request_ephis_dtl =====================
				$dataB["f_inv"]							= floatval($ArrDtlMoneyINV[$dtl_id]);
				$dataB["f_vat"]							= floatval($ArrDtlMoneyVAT[$dtl_id]);
				$dataB["f_tax_personal"]				= floatval($ArrDtlMoneyTAX1[$dtl_id]);
				$dataB["f_tax_corporate"]				= floatval($ArrDtlMoneyTAX2[$dtl_id]);
				$dataB["f_social_security"]				= floatval($ArrDtlMoneySOCIAL[$dtl_id]);
				$dataB["f_fine"]						= floatval($ArrDtlMoneyFINE[$dtl_id]);
				$dataB["dc_user_update_id"]				= $_SESSION["user_id"];
				$dataB["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
				$dataB["d_update"]						= date("Y-m-d H:i:s");

				if ($_REQUEST["imp_request_ephis_dtl_id"] > 0) {
					foreach ($dataB as $fldA => $value) {
						$arrValue[]	= ($value != "") ? $value : null;
						$addField	.= ", {$fldA} = ?";
					}

					$arrValue[] = $_REQUEST["imp_request_ephis_dtl_id"];
					$sql		= "UPDATE imp_request_ephis_dtl SET " . substr($addField, 1) . " WHERE imp_request_ephis_dtl_id = ?";
					$para		= $db->QueryParam($sql, $arrValue);

				}  

				// ============== //
				$addField	= null;
				$addValue	= null;
				unset($dataB);
				unset($arrValue);
				// ============== //
			 
		}
		
		if( @$para ) {
			$re = array("success"					=> true,
						"imp_request_ephis_dtl_id"	=> $_REQUEST["imp_request_ephis_dtl_id"],
						"msg"						=> "บันทึกรายการเรียบร้อย"
			);
		} else {
			$re = array("success"					=> false,
						"imp_request_ephis_dtl_id"	=> $_REQUEST["imp_request_ephis_dtl_id"],
						"msg"						=> "error"
			);
		}
			
		break;
		
	case "DELETE" :
		
		$db->QueryParam("DELETE imp_request_ephis_item WHERE imp_request_ephis_dtl_id = ?;", array($_REQUEST["imp_request_ephis_dtl_id"]));
		$db->QueryParam("DELETE imp_request_ephis_dtl  WHERE imp_request_ephis_dtl_id = ?;", array($_REQUEST["imp_request_ephis_dtl_id"]));
		
		$re = array("success"						=> true,
					"imp_request_ephis_dtl_id"		=> $_REQUEST["imp_request_ephis_dtl_id"],
					"msg"							=> ""
		);
}
echo json_encode($re);
exit;
?>
