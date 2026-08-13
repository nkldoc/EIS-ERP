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
		
		$db->QueryParam("DELETE imp_expense_vsn_item WHERE imp_expense_vsn_dtl_id = ?;", array($_REQUEST["imp_expense_vsn_dtl_id"]));
		// ========================= add dtl ========================= //
		$Arr	= json_decode($_REQUEST["data"], true);
		if($Arr) {
			
			$i_type_year	= $db->GetDataBySQL("SELECT aa.i_type_year FROM imp_expense_vsn_dtl aa WHERE aa.imp_expense_vsn_dtl_id = ".$_REQUEST["imp_expense_vsn_dtl_id"],array());
			
			foreach( $Arr as $fld ) {
				
				if($i_type_year == 1) {
					$data["dc_acc_id"]							= $db->GetDataBySQL("SELECT aa.dc_acc_id FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = ".$fld["dc_expense_acc_vsn_id"],array());
					$data["dc_acc_id_overlap"]					= NULL;
				} else {
					$data["dc_acc_id"]							= NULL;
					$data["dc_acc_id_overlap"]					= $db->GetDataBySQL("SELECT aa.dc_acc_id_overlap FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = ".$fld["dc_expense_acc_vsn_id"],array());
				}
				
				$data["imp_expense_vsn_dtl_id"]						= $_REQUEST["imp_expense_vsn_dtl_id"];
				$data["imp_expense_vsn_hdr_id"]						= $_REQUEST["imp_expense_vsn_hdr_id"];
				$data["f_inv"]										= $fld["f_inv"];
				$data["f_tax_personal"]								= $fld["f_tax_personal"];
				$data["f_social_security"]							= $fld["f_social_security"];
				$data["f_prov_fund"]								= $fld["f_prov_fund"];
				$data["f_fine"]										= $fld["f_fine"];
				$data["f_total"]									= $fld["f_total"];
				$data["dc_expense_acc_vsn_id"]						= $fld["dc_expense_acc_vsn_id"];
				$data["dc_expense_group_vsn_id"]					= $fld["dc_expense_group_vsn_id"];
	
				foreach ($data as $fld => $value) {
					$arrValue[]	= ($value != "")? $value : NULL;
					$addField	.= ", {$fld}";
					$addValue	.= ", ?";
				}
					
				$sql	= "INSERT INTO imp_expense_vsn_item (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
				$db->QueryParam($sql, $arrValue);
					
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
			}
			
			$arrValue[] = $_REQUEST["imp_expense_vsn_dtl_id"];
			$sql		= "UPDATE imp_expense_vsn_dtl SET i_many_doc = 2 WHERE imp_expense_vsn_dtl_id = ?";
			$para		= $db->QueryParam($sql, $arrValue);
		}
		
		if( @$para ) {
			$re = array("success"					=> true,
						"imp_expense_vsn_dtl_id"	=> $_REQUEST["imp_expense_vsn_dtl_id"],
						"msg"						=> ""
			);
		} else {
			$re = array("success"					=> false,
						"imp_expense_vsn_dtl_id"	=> $_REQUEST["imp_expense_vsn_dtl_id"],
						"msg"						=> ""
			);
		}
			
		break;
		
	case "DELETE" :
		
		$db->QueryParam("DELETE imp_expense_vsn_item WHERE imp_expense_vsn_dtl_id = ?;", array($_REQUEST["imp_expense_vsn_dtl_id"]));
		$db->QueryParam("UPDATE imp_expense_vsn_dtl SET i_many_doc = 1 WHERE imp_expense_vsn_dtl_id = ?;", array($_REQUEST["imp_expense_vsn_dtl_id"]));
		
		$re = array("success"						=> true,
					"imp_expense_vsn_dtl_id"		=> $_REQUEST["imp_expense_vsn_dtl_id"],
					"msg"						=> ""
		);
}
echo json_encode($re);
exit;
?>
