<?php
include("../../conf/config.php");
include("../../ap/conf/configAp.php"); 
include("../conf/configCm.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];
$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ($mode) {
	
	case "SAVE" :
		
		// บันทึกเลขที่/วันที่ ใบสำคัญจ่าย (PV)
		$msg	= "";
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {

			$dataA	= json_decode(@$_REQUEST["data"], true);
			if(is_array($dataA) && count($dataA) > 0) {
	
				foreach( $dataA as $index => $jObj ) {

					$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$arrValue	= array("PV",date("Y")."".date("m") ,$_SESSION["user_id"], $_SESSION["dc_cost_id"], $jObj["cm_voucher_one_id"]);
					
					$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
					
					unset ($sql);
					unset ($arrValue);
					
					$data["c_code_pv"]					= $arr_gen_code["c_code_gen"];
					$data["d_doc_date_pv"]				= $jObj["d_doc_date_pv"];
					$data["dc_user_update_id"]			= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
					$data["d_update"]					= date("Y-m-d H:i:s");
					
					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "")? $value : NULL;
						$addField	.= ", {$fld} = ?";
					}
						
					$arrValue[] = $jObj["cm_voucher_one_id"];
					$sql		= "UPDATE cm_voucher_one SET ".substr($addField, 1)." WHERE cm_voucher_one_id = ?";
					$stmt		= $db->QueryParam($sql, $arrValue);
					if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $jObj["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
						
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					unset ($arrValue);
					unset ($sql); 	
					// ============== //
					
					// Insert ตาราง Tax_temp_hdr+Dtl สำหรับออกใบ ภงด 3,53
					$sql_ap	= "	SELECT
									a.ap_expen_hdr_id
									,a.c_code
								FROM cm_voucher_one a
								WHERE a.cm_voucher_one_id = ?
									AND a.i_type_voucher=1
									AND a.i_enable=1
									AND ISNULL(a.c_code_pv,'0')!='0'";
					
					$stmt = $db->QueryParam($sql_ap, array($jObj["cm_voucher_one_id"]));
					if( sqlsrv_has_rows( $stmt ) ) {
						while( $row=$db->Fetch( $stmt ) ) {
							
							$data["i_is_status"]				= FI_BR_I_IS_STATUS3; 
							$data["dc_user_update_id"]			= $_SESSION["user_id"];
							$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
							$data["d_update"]					= date("Y-m-d H:i:s");
							
							foreach ($data as $fld => $value) {
								$arrValue[]	= ($value != "")? $value : NULL;
								$addField	.= ", {$fld} = ?";
							}
							
							$arrValue[] = $row["ap_expen_hdr_id"];
							$sql		= "UPDATE ap_expen_hdr SET ".substr($addField, 1)." WHERE ap_expen_hdr_id = ?";
							$stmt		= $db->QueryParam($sql, $arrValue);
							if(!$stmt) { echo json_encode( array( "ap_expen_hdr_id" => $row["ap_expen_hdr_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
							
							// ============== //
							$addField	= null;
							$addValue	= null;
							unset ($data);
							unset ($arrValue);
							unset ($sql); 	
							// ============== //	 
							
							$data_ap	= $db->GetDataBySQL("SELECT i_is_receiver_diff,i_type_person FROM ap_expen_hdr WHERE ap_expen_hdr_id=?",array($row["ap_expen_hdr_id"]));

// 							$data[]		= $row["fi_pay_tran_id"];
// 							$data[]		= $row["ap_expen_hdr_id"];
// 							$data[]		= $_SESSION["user_id"];
// 							$data[]		= $_SESSION["dc_cost_id"];
// 							$data[]		= $data_ap["i_type_person"];
			
// 							foreach ($data as $fld => $value) {
// 								$addValue .= ", ?";
// 								$arrValue[] = $value;
// 							}
								
//   							Switch ($data_ap["i_type_person"]) {
//   								Case PERSON_EMP				: $db->QueryParam("EXECUTE sp_tax_temp_ap_emp ".substr($addValue,1).";", $arrValue); break;
//   								Case PERSON_CREDITOR		: $db->QueryParam("EXECUTE sp_tax_temp_ap_cnt ".substr($addValue,1).";", $arrValue); break;
//   								Case PERSON_OTHER			: $db->QueryParam("EXECUTE sp_tax_temp_ap_other ".substr($addValue,1).";", $arrValue); break;
//   							}
  							
//   							// ============== //
// 							$addField	= null;
// 							$addValue	= null;
// 							unset ($data);
// 							unset ($arrValue);
// 							// ============== //
							
						}
					}
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

		echo json_encode($re); exit;
		break;

	case "DELETE" :

		$msg	= "";
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {
			// เข้าที่นี่เมื่อ กดปุ่ม ยกเลิก (PV)
			if( $_REQUEST["cm_voucher_one_id"] > 0 ) {
		
				$sql = "SELECT
							a.i_type_voucher
							,a.c_code
							,a.c_code_pv
							,CASE
								WHEN a.c_code_pv!='0' THEN (SELECT TOP 1 c_code FROM gl_tran_hdr WHERE c_ref_doc=a.c_code_pv AND i_enable=1 AND LEFT(c_code,1)='G')
								WHEN a.c_code_pv IS NOT NULL THEN (SELECT TOP 1 c_code FROM gl_tran_hdr WHERE c_ref_doc=a.c_code_pv AND i_enable=1 AND LEFT(c_code,1)='G')
							END AS c_code_gl
						FROM cm_voucher_one a WHERE a.cm_voucher_one_id=?";
				
				$data_pv	= $db->GetDataBySQL($sql, array($_REQUEST["cm_voucher_one_id"]));
	
				if ( $data_pv["c_code_gl"] == "" ) {
		
// 					$db->QueryParam("EXECUTE SP_FI_CANCEL_GEN_PV ?;", array($_REQUEST["cm_voucher_one_id"]));
		
// 					$data["cm_voucher_one_id"]		= $_REQUEST["cm_voucher_one_id"];
// 					$data["c_code_pre"]					= $data_pv["c_code"];
// 					$data["c_code_pv"]					= $data_pv["c_code_pv"];
// 					$data["user_cancel_id"]				= $_SESSION["user_id"];
// 					$data["user_cancel_org_id"]			= $_SESSION["dc_cost_id"];
// 					$data["user_cancel_name"]			= $db->GetDataBySQL("SELECT a.c_name FROM dc_emp a INNER JOIN dc_user b ON a.dc_emp_id=b.dc_emp_id WHERE b.dc_user_id=?", array($_SESSION["user_id"]));
// 					$data["c_cancel_date"]				= date("Y-m-d");
// 					$data["c_cancel_time"]				= date("H:i:s");
// 					$data["i_cancel_type"]				= CM_CANCEL_PV;
					
// 					foreach ($data as $fld => $value) {
// 						$arrValue[] = ($value != "")? $value : NULL;
// 						$addField .= ", {$fld}";
// 						$addValue .= ", ?";
// 					}
					
// 					$sql	= "INSERT INTO fi_cancel_history (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
// 					$stmt	= $db->QueryParam($sql, $arrValue);
					
// 					$re = array("success"	=> true,
// 								"msg"		=> $msg
// 					);
					
// 					// ============== //
// 					$addField	= null;
// 					$addValue	= null;
// 					unset ($flds);
// 					unset ($arrValue);
// 					// ============== //
		
				} else {
				
					$msg	= "- ไม่สามารถยกเลิก ".$data_pv["c_code_pv"]." ได้ เนื่องจากบันทึกบัญชี เลขที่เอกสารสมุดรายวัน ::
	 ".$data_pv["c_code_gl"]." แล้ว</td></tr>";
	
					$re = array("success"	=> false,
								"msg"		=> $msg
					);
				}
			}
		}

		echo json_encode($re); exit;
		break;
	
	default : break;
}
?>
