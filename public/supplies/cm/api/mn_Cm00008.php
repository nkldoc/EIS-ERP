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
			
			//================= CHECK DC_CHEQUE OLD =================//
			$old_dc_cheque_id	= $db->GetDataBySQL("SELECT cm_pay_cheque_id FROM cm_voucher_one WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
			$n_vch_chq			= $db->GetDataBySQL("SELECT COUNT(cm_voucher_one_id) FROM cm_voucher_one WHERE cm_voucher_one_id!=? AND cm_pay_cheque_id=? AND i_enable=?",
									array($_REQUEST["cm_voucher_one_id"], $old_dc_cheque_id, STATUS_ENABLE));
					
			$data["i_enable"]					= ( $n_vch_chq > 0 )? DC_CHQ_I_RESERV : DC_CHQ_I_FREE; // เช็คจองแล้ว - PRE อื่นยังหยิบไปใช้ได้=3 : เช็คว่าง  - หยิบไปใช้ได้=1
			$data["dc_user_update_id"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_update"]					= date("Y-m-d H:i:s");
			
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
						
			$arrValue[] = $old_dc_cheque_id;
			$sql		= "UPDATE cm_pay_cheque SET ".substr($addField, 1)." WHERE cm_pay_cheque_id = ?";
			$stmt		= $db->QueryParam($sql, $arrValue);
			if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
						
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			//=======================================================//
					
			//================= CHECK DC_CHEQUE NEW =================//
			$data["i_enable"]					= DC_CHQ_I_RESERV;
			$data["dc_user_update_id"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_update"]					= date("Y-m-d H:i:s");
					
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
							
			$arrValue[] = $_REQUEST["cm_pay_cheque_id"];
			$sql		= "UPDATE cm_pay_cheque SET ".substr($addField, 1)." WHERE cm_pay_cheque_id = ?";
			$stmt		= $db->QueryParam($sql, $arrValue);
			if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
							
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			//=======================================================//
				
			$data["cm_pay_cheque_id"]			= $_REQUEST["cm_pay_cheque_id"];
			$data["d_cheque_date"]				= $_REQUEST["d_cheque_date"];
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
