<?php
include("../../conf/config.php");
include("../conf/configCm.php");
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

			$dataA	= json_decode(@$_REQUEST["data"], true);
			if(is_array($dataA) && count($dataA) > 0) {
	
				foreach($dataA as $index => $jObj) {
	
					//ใช้กรณีเปลี่ยนประเภทการจ่ายเงินจากเช็ค เป็นแบบอื่นๆที่ไม่ใช่เช็ค
					$i_type_old		= $db->GetDataBySQL("SELECT ISNULL(i_type,0) FROM cm_pay_type WHERE cm_pay_type_id=(SELECT cm_pay_type_id FROM cm_voucher_one where cm_voucher_one_id=?)", array($jObj["cm_voucher_one_id"]));
					$i_type_new		= $db->GetDataBySQL("SELECT ISNULL(i_type,0) FROM cm_pay_type WHERE cm_pay_type_id=?",array($jObj["cm_pay_type_id"]));
					
					if (( $i_type_old == 2 ) && ( $i_type_new != 2 )) {
	
						// UPDATE cheque
						if (( $i_type_new != 2 )) {
							
							$sql	= "SELECT cm_voucher_one_id, cm_pay_cheque_id FROM cm_voucher_one WHERE cm_voucher_one_id=? AND ISNULL(cm_pay_cheque_id,'0')!='0'";
							$stmt	= $db->QueryParam($sql, array($jObj["cm_voucher_one_id"]));
							if( sqlsrv_has_rows( $stmt ) ) {
								while( $row=$db->Fetch( $stmt ) ) {
									
									$old_dc_cheque_id	= $db->GetDataBySQL("SELECT cm_pay_cheque_id FROM cm_voucher_one WHERE cm_voucher_one_id=?", array($row["cm_voucher_one_id"]));
									$n_vch_chq			= $db->GetDataBySQL("SELECT COUNT(cm_voucher_one_id)
																FROM cm_voucher_one
																WHERE cm_voucher_one_id!=?
																	AND cm_pay_cheque_id=?
																	AND i_enable=?",
															array($row["cm_voucher_one_id"], $old_dc_cheque_id, STATUS_ENABLE));
															
									$data["i_enable"]					= ( $n_vch_chq > 0 )? DC_CHQ_I_RESERV : DC_CHQ_I_FREE; // เช็คจองแล้ว - PRE อื่นยังหยิบไปใช้ได้=3 : เช็คว่าง  - หยิบไปใช้ได้=1
									$data["dc_user_update_id"]			= $_SESSION["user_id"];
									$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
									$data["d_update"]					= date("Y-m-d H:i:s");
									
									foreach ($data as $fld => $value) {
										$arrValue[]	= ($value != "")? $value : NULL;
										$addField	.= ", {$fld} = ?";
									}

									$arrValue[] = $row["cm_pay_cheque_id"];
									$sql		= "UPDATE cm_pay_cheque SET ".substr($addField, 1)." WHERE cm_pay_cheque_id = ?";
									$stmt		= $db->QueryParam($sql, $arrValue);
									if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $jObj["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
									
									// ============== //
									$addField	= null;
									$addValue	= null;
									unset ($data);
									unset ($arrValue);
									// ============== //
	
								}
							}
						}
						
						$data["cm_pay_cheque_id"]			= "0";
						$data["dc_bank_acc_creditor_id"]	= "0";
						$data["dc_user_update_id"]			= $_SESSION["user_id"];
						$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
						$data["d_update"]					= date("Y-m-d H:i:s");
						
						foreach ($data as $fld => $value) {
							$arrValue[]	= ($value != "")? $value : NULL;
							$addField	.= ", {$fld} = ?";
						}
							
						$arrValue[] = $jObj["cm_voucher_one_id"];
						$sql		= "UPDATE cm_voucher_one SET ".substr($addField, 1)." WHERE cm_voucher_one_id=?";
						$stmt		= $db->QueryParam($sql, $arrValue);
						if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $jObj["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
							
						// ============== //
						$addField	= null;
						$addValue	= null;
						unset ($data);
						unset ($arrValue);
						// ============== //
					}
					
					$data["cm_pay_type_id"]				= $jObj["cm_pay_type_id"];
					$data["c_area_code_pv"]				= "0";
					$data["c_area_code"]				= "0";
					$data["dc_user_update_id"]			= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
					$data["d_update"]					= date("Y-m-d H:i:s");

					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "")? $value : NULL;
						$addField	.= ", {$fld} = ?";
					}
					
					$arrValue[] = $jObj["cm_voucher_one_id"];
					$sql		= "UPDATE cm_voucher_one SET ".substr($addField, 1)." WHERE cm_voucher_one_id=?";
					$stmt		= $db->QueryParam($sql, $arrValue);
					if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $jObj["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
					
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					unset ($arrValue);
					// ============== //
				}
			}	
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
