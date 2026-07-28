<?php
include("../conf/configCm.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$type		= $_REQUEST["type"];
$arrParam	= array();
$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ( $type ) {
	
	case "SAVE" :

		$msg	= "";
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {
			
			$data["dc_bank_acc_company_id"]		= $_REQUEST["dc_bank_acc_company_id"];
			$data["dc_bank_acc_creditor_id"]	= $_REQUEST["dc_bank_acc_creditor_id"];
			$data["c_comment"]					= $_REQUEST["c_comment"];
			$data["dc_user_update_id"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_update"]					= date("Y-m-d H:i:s");

			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
						
			$arrValue[] = $_REQUEST["cm_voucher_one_id"];
			$sql		= "UPDATE cm_voucher_one SET ".substr($addField, 1)." WHERE cm_voucher_one_id = ?";
			$stmt		= $db->QueryParam($sql, $arrValue);
			if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
			//=======================================================//
		}
		
		if( $stmt ) {
			$re = array(
					"success"				=> true,
					"msg"					=> $msg
			);
		} else {
			$re = array(
					"success"				=> false,
					"msg"					=> $sql
			);
		}

	break;
}

echo json_encode($re);
exit;
?>
