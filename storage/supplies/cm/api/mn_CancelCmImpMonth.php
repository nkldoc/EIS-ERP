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
	
	case "CANCEL" :
		
		if($_REQUEST["cm_imp_cheque_month_dtl_id"] > 0 || $_REQUEST["cm_imp_bank_month_dtl_id"] > 0) {
			$i_status_C		= $db->GetDataBySQL("SELECT i_status FROM cm_imp_cheque_month_dtl WHERE cm_imp_cheque_month_dtl_id=?;", array($_REQUEST["cm_imp_cheque_month_dtl_id"]));
			$i_status_B		= $db->GetDataBySQL("SELECT i_status FROM cm_imp_bank_month_dtl WHERE cm_imp_bank_month_dtl_id=?;", array($_REQUEST["cm_imp_bank_month_dtl_id"]));
		}
		
		if(@$i_status_C == 1 || @$i_status_B == 1){

			$data["i_status"]								= 2;
			$data["d_cancel"]								= date("Y-m-d H:i:s");
			
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
			
			$sqlC		= "UPDATE cm_imp_cheque_month_dtl SET ".substr($addField, 1)." WHERE cm_imp_cheque_month_dtl_id = ".$_REQUEST["cm_imp_cheque_month_dtl_id"];
			$sqlB		= "UPDATE cm_imp_bank_month_dtl SET ".substr($addField, 1)." WHERE cm_imp_bank_month_dtl_id = ".$_REQUEST["cm_imp_bank_month_dtl_id"];
			
			$paraC		= $db->QueryParam($sqlC, $arrValue);
			$paraB		= $db->QueryParam($sqlB, $arrValue);
			
			if( $paraC && $paraB ) {
				$re = array("success"		=> true,
							"msg"			=> "ปรับสถานะเป็นไม่ใช้งานแล้ว"
				);
			} else {
				$re = array("success"		=> false,
							"msg"			=> "error"
				);
			}
			
		} else {
			$re = array("success"		=> false,
						"msg"			=> "เลขที่เช็ค ".$_REQUEST["cheque_no"]." มีการยกเลิกรายการแล้ว" );
		}
	
		break;
}
echo json_encode($re);
exit;
?>
