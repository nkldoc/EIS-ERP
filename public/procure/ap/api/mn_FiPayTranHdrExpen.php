<?php
include("../../conf/config.php");
include("../conf/configAp.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$data		= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

$table		= "ap_expen_hdr";
$pk_id		= "ap_expen_hdr_id";

function check_date() {

	global $db;
	
	$ap_expen_hdr_id	= (@$_REQUEST["ap_expen_hdr_id"] != "")? $_REQUEST["ap_expen_hdr_id"] : $_REQUEST["id"];
	$msg				= "";

	$AP	= $db->GetDataBySQL("SELECT c_code FROM ap_expen_hdr WHERE c_code != '0' AND ap_expen_hdr_id=?", array($ap_expen_hdr_id));

	if( $AP == "" ) {

		// CHECK วันที่บันทึก
		$status_doc	= $db->GetDataBySQL("SELECT i_status FROM gl_dc_period WHERE c_yyyy = YEAR('".$_REQUEST["d_doc_date"]."') AND c_mm = MONTH('".$_REQUEST["d_doc_date"]."') AND i_system = 3 AND i_last_period = 1", array(null));
		
		if( $status_doc == 1 ) {
			$msg	.= "";
		} else if ( $status_doc == 2 ) {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"วันที่บันทึก\"</span> ได้<br>เนื่องจาก ปิดงวดบัญชีแล้ว<br>";
		} else {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"วันที่บันทึก\"</span> ได้<br>เนื่องจาก ยังไม่บันทึกงวดบัญชี<br>";
		}
		
		// CHECK เดือน/ปีปฏิบัติงาน
		$status_c_yyyy_mm	= $db->GetDataBySQL("SELECT i_status FROM gl_dc_period WHERE c_yyyy = '".$_REQUEST["c_yyyy"]."' AND c_mm = '".sprintf("%02d",$_REQUEST["c_mm"])."' AND i_system = 3 AND i_last_period = 1", array(null));
		if( $status_c_yyyy_mm == 1 ) {
			$msg	.= "";
		} else if ( $status_c_yyyy_mm == 2 ) {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"เดือน/ปีปฏิบัติงาน\"</span> ได้<br>เนื่องจาก ปิดงวดบัญชีแล้ว<br>";
		} else {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"เดือน/ปีปฏิบัติงาน\"</span> ได้<br>เนื่องจาก ยังไม่บันทึกงวดบัญชี<br>";
		}
	}
	
	return $msg;
}

switch ( $mode ) {
	
	case "ADD" :
	case "EDIT" :
		
		$msg	= "";
		$msg	.= check_date();
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {

			$AP	= $db->GetDataBySQL("SELECT c_code FROM ap_expen_hdr WHERE c_code!='0' AND ap_expen_hdr_id=?", array(@$_REQUEST["id"]));
			if( $AP == "" || $_REQUEST["PAGE_TYPE"] != 1) { // ยังไม่ออกเลข AP
				$data["d_doc_date"]				= $_REQUEST["d_doc_date"];
				$data["c_yyyy_mm"]				= sprintf("%04d%02d",$_REQUEST["c_yyyy"], $_REQUEST["c_mm"]);
			}
			
			if($_REQUEST["PAGE_TYPE"] != 1) {
				$data["d_chk_date"]				= $_REQUEST["d_chk_date"];
			}
			
			if($mode == "ADD") {
				$data["dc_user_create_id"]		= $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_create"]				= date("Y-m-d H:i:s");
			}
			
			$data["i_type_person"]			= $_REQUEST["i_type_person"];
			$data["dc_creditor_id"]			= $_REQUEST["dc_creditor_id"];
			$data["dc_emp_id"]				= $_REQUEST["dc_emp_id"];
			$data["c_other_name"]			= $_REQUEST["c_other_name"];
			$data["i_is_receiver_diff"]		= $_REQUEST["i_is_receiver_diff"];
			$data["dc_emp_ref_id"]			= $_REQUEST["dc_emp_ref_id"];
			$data["dc_cost_id"]				= $_REQUEST["dc_cost_id"];
			$data["c_job"]					= $_REQUEST["c_job"];
			$data["c_location"]				= $_REQUEST["c_location"];
			$data["dc_emp_boss_id"]			= $_REQUEST["dc_emp_boss_id"];
			$data["c_receiver_name"]		= $_REQUEST["c_receiver_name"];
			$data["c_creditor_addr"]		= $_REQUEST["c_creditor_addr"];
			$data["c_creditor_tax"]			= $_REQUEST["c_creditor_tax"];
			$data["c_creditor_ref"]			= $_REQUEST["c_creditor_ref"];
			$data["c_doc_ref"]				= $_REQUEST["c_doc_ref"];
			$data["c_name"]					= $_REQUEST["c_name"];
			$data["c_comment"]				= $_REQUEST["c_comment"];
			$data["c_type_doc"]				= $_REQUEST["c_type_doc"];
			$data["c_type_doc_num"]			= $_REQUEST["c_type_doc_num"];
			$data["i_is_barter"]			= $_REQUEST["i_is_barter"];
			$data["f_barter_amt"]			= ($_REQUEST["i_is_barter"] == AP_BARTER_SETOFF || $_REQUEST["i_is_barter"] == AP_BARTER_CHANGE)? $_REQUEST["f_barter_amt"] : null;
			$data["f_barter_dec"]			= ($_REQUEST["i_is_barter"] == AP_BARTER_CHANGE)? $_REQUEST["f_barter_dec"] : null;
			$data["f_barter_amtsum"]		= $data["f_barter_amt"];
			$data["f_barter_decsum"]		= $data["f_barter_dec"];
			$data["i_center"]				= 1;
			$data["dc_bg_type_id"]			= $_REQUEST["dc_bg_type_id"];
			$data["i_is_status"]			= FI_BR_I_IS_STATUS4; // รออนุมัติ
			$data["i_enable"]				= STATUS_ENABLE;
			$data["dc_acc_other_id"]		= $_REQUEST["dc_acc_other_id"];
			$data["dc_user_update_id"]		= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_update"]				= date("Y-m-d H:i:s");

			if($mode == "ADD") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}
					
				$sql	= "	SET NOCOUNT ON
							INSERT INTO ap_expen_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).");
							SELECT @@IDENTITY as id;";
						
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id["id"];
			
			} else if ($mode == "EDIT") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
				
				$arrValue[] = $_REQUEST["id"];
				$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id} = ?";
				$para		= $db->QueryParam($sql, $arrValue);
				$id			= $_REQUEST["id"];
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
				
				if($_REQUEST["PAGE_TYPE"] != 1) {
					// ========================================================= //
					$i_row	= 0;
					
					for ($i=1;$i<=3;$i++){ if($_REQUEST["c_str".$i] != "") { $i_row++; } }
					
					$data[]		= $id;					// ap_expen_hdr_id
					$data[]		= 0;					// ap_purchase_hdr_id
					$data[]		= 0;					// ap_many_hdr_id
					$data[]		= 0;					// ap_br_id
					$data[]		= $i_row;				// i_row
					$data[]		= $_REQUEST["c_str1"];	// c_str1
					$data[]		= $_REQUEST["c_str2"];	// c_str2
					$data[]		= $_REQUEST["c_str3"];	// c_str3
						
					foreach ($data as $fld => $value) {
						$addValue .= ", ?";
						$arrValue[] = $value;
					}
					
					$db->QueryParam("EXECUTE SP_INS_TEMP_PAY_LINE ".substr($addValue,1).";", $arrValue);
						
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					unset ($arrValue);
					// ============== //
				}
			}
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			if ( $para ) {
				$re = array(
					"success"				=> true,
					"ap_expen_hdr_id"		=> $id
				);
			} else {
				$re = array(
					"success"				=> false,
					"msg"					=> "ไม่สามารถบันทึกข้อมูลไม่ได้"
				);
			}
		}
		
	break;
	
	case "REVERSE" :
	
		$msg	= "";
		
		// CHECK วันที่บันทึก
		$status_doc	= $db->GetDataBySQL("SELECT i_status FROM gl_dc_period WHERE c_yyyy = YEAR('".$_REQUEST["d_doc_date"]."') AND c_mm = MONTH('".$_REQUEST["d_doc_date"]."') AND i_system = 3 AND i_last_period = 1", array(null));
		
		if( $status_doc == 1 ) {
			$msg	.= "";
		} else if ( $status_doc == 2 ) {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"วันที่บันทึก\"</span> ได้<br>เนื่องจาก ปิดงวดบัญชีแล้ว<br>";
		} else {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"วันที่บันทึก\"</span> ได้<br>เนื่องจาก ยังไม่บันทึกงวดบัญชี<br>";
		}
		
		// CHECK เดือน/ปีปฏิบัติงาน
		$status_c_yyyy_mm	= $db->GetDataBySQL("SELECT i_status FROM gl_dc_period WHERE c_yyyy = '".$_REQUEST["c_yyyy"]."' AND c_mm = '".sprintf("%02d",$_REQUEST["c_mm"])."' AND i_system = 3 AND i_last_period = 1", array(null));
		if( $status_c_yyyy_mm == 1 ) {
			$msg	.= "";
		} else if ( $status_c_yyyy_mm == 2 ) {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"เดือน/ปีปฏิบัติงาน\"</span> ได้<br>เนื่องจาก ปิดงวดบัญชีแล้ว<br>";
		} else {
			$msg	.= "- ไม่สามารถบันทึกรายการ <span style=\"color:red;\">\"เดือน/ปีปฏิบัติงาน\"</span> ได้<br>เนื่องจาก ยังไม่บันทึกงวดบัญชี<br>";
		}
	
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {

			$AP	= $db->GetDataBySQL("SELECT * FROM ap_expen_hdr WHERE ap_expen_hdr_id=?", array(@$_REQUEST["ap_expen_hdr_id"]));
			if($AP) {
				$data["d_doc_date"]				= $_REQUEST["d_doc_date"];
				$data["c_yyyy_mm"]				= sprintf("%04d%02d",$_REQUEST["c_yyyy"], $_REQUEST["c_mm"]);
				$data["ap_expen_hdr_ref_id"]	= $AP["ap_expen_hdr_id"];
				$data["i_type_person"]			= $AP["i_type_person"];
				$data["dc_creditor_id"]			= $AP["dc_creditor_id"];
				$data["dc_emp_id"]				= $AP["dc_emp_id"];
				$data["c_other_name"]			= $AP["c_other_name"];
				$data["i_is_receiver_diff"]		= $AP["i_is_receiver_diff"];
				$data["dc_emp_ref_id"]			= $AP["dc_emp_ref_id"];
				$data["dc_cost_id"]				= $AP["dc_cost_id"];
				$data["c_job"]					= $AP["c_job"];
				$data["c_location"]				= $AP["c_location"];
				$data["dc_emp_boss_id"]			= $AP["dc_emp_boss_id"];
				$data["c_receiver_name"]		= $AP["c_receiver_name"];
				$data["c_creditor_addr"]		= $AP["c_creditor_addr"];
				$data["c_creditor_tax"]			= $AP["c_creditor_tax"];
				$data["c_creditor_ref"]			= $AP["c_creditor_ref"];
				$data["c_doc_ref"]				= $AP["c_doc_ref"];
				$data["c_name"]					= $AP["c_name"];
				$data["c_comment"]				= $AP["c_comment"];
				$data["c_type_doc"]				= $AP["c_type_doc"];
				$data["c_type_doc_num"]			= $AP["c_type_doc_num"];
				$data["i_is_barter"]			= $AP["i_is_barter"];
				$data["f_barter_amt"]			= ($AP["i_is_barter"] == AP_BARTER_SETOFF || $AP["i_is_barter"] == AP_BARTER_CHANGE)? $AP["f_barter_amt"] : null;
				$data["f_barter_dec"]			= ($AP["i_is_barter"] == AP_BARTER_CHANGE)? $AP["f_barter_dec"] : null;
				$data["f_barter_amtsum"]		= $data["f_barter_amt"];
				$data["f_barter_decsum"]		= $data["f_barter_dec"];
				$data["i_center"]				= 1;
				$data["dc_bg_type_id"]			= $AP["dc_bg_type_id"];
				$data["i_is_status"]			= FI_BR_I_IS_STATUS4; // รออนุมัติ
				$data["i_enable"]				= STATUS_ENABLE;
				$data["dc_acc_other_id"]		= $AP["dc_acc_other_id"];
				$data["dc_user_update_id"]		= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_update"]				= date("Y-m-d H:i:s");
				$data["dc_user_create_id"]		= $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_create"]				= date("Y-m-d H:i:s");
				
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}
						
				$sql	= "	SET NOCOUNT ON
							INSERT INTO ap_expen_hdr (".substr($addField, 1).") VALUES (".substr($addValue,1).");
							SELECT @@IDENTITY as id;";
				
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
				$id		= $ss_id["id"];
					
			}
				
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
				
			if ( $para ) {
				$re = array(
						"success"				=> true,
						"ap_expen_hdr_id"		=> $id
				);
			} else {
				$re = array(
						"success"				=> false,
						"msg"					=> "ไม่สามารถบันทึกข้อมูลไม่ได้"
				);
			}
		}
	
		break;
	
	case "ADD_DTL" :
	case "EDIT_DTL" :
	
		$msg	= "";
	
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {
				
			if($mode == "ADD_DTL") {
				$data["dc_user_create_id"]		= $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_create"]				= date("Y-m-d H:i:s");
			}

			$data["ap_expen_hdr_id"]			= $_REQUEST["ap_expen_hdr_id"];
			$data["dc_acc_id"]					= $_REQUEST["dc_acc_id"];
			$data["tax_map_method_id"]			= $_REQUEST["tax_map_method_id"];
			$data["group_acc"]					= $_REQUEST["group_acc"];
			$data["dc_cost_id"]					= $_REQUEST["dc_cost_id"];
			$data["ap_exp_doc_id"]				= $_REQUEST["ap_exp_doc_id"];
			$data["c_sp_day"]					= $_REQUEST["c_sp_day"];
			$data["c_time"]						= $_REQUEST["c_time"];
			$data["c_sp_comment"]				= $_REQUEST["c_sp_comment"];
			$data["dc_vat_id"]					= $_REQUEST["dc_vat_id"];
			$data["f_vat_rate"]					= $db->GetDataBySQL("SELECT f_vat_rate FROM dc_vat WHERE dc_vat_id=?", array($_REQUEST["dc_vat_id"]));
			$data["i_is_tax_restricted"]		= $_REQUEST["i_is_tax_restricted"];
			$data["dc_tax_id"]					= $_REQUEST["dc_tax_id"];
			$data["f_tax_rate"]					= $db->GetDataBySQL("SELECT f_tax_rate FROM dc_tax WHERE dc_tax_id=?", array($_REQUEST["dc_tax_id"]));
			$data["dc_section_tax_id"]			= $_REQUEST["dc_section_tax_id"];
			$data["i_status_cnt"]				= $_REQUEST["i_status_cnt"];
			$data["i_company_pay_tax"]			= $_REQUEST["i_company_pay_tax"];
			$data["f_pay_tax_amount"]			= $_REQUEST["f_pay_tax_amount"];
			$data["f_inv_amount"]				= $_REQUEST["f_inv_amount"];
			$data["f_dec_amount"]				= $_REQUEST["f_dec_amount"];
			$data["f_tax_save"]					= $_REQUEST["f_tax_save"];
			$data["f_reduce"]					= $_REQUEST["f_reduce"];
			$data["i_is_drpenalty"]				= $_REQUEST["i_is_drpenalty"];
			$data["f_drpenalty"]				= $_REQUEST["f_drpenalty"];
			$data["ap_penalty_id"]				= $_REQUEST["ap_penalty_id"];
			$data["i_exp_by"]					= 1;
			$data["c_comment"]					= $_REQUEST["c_comment"];
			$data["i_is_vat_amount"]			= $_REQUEST["i_is_vat_amount"];
			$data["f_net_dec"]					= $_REQUEST["f_net_dec"]; // จำนวนเงินขอเบิกหลังหักส่วนลดเงินสด
			$data["f_tax_company"]				= $_REQUEST["f_tax_company"]; // จำนวนเงินภาษีที่บริษัทออกให้
			$data["f_tax_company_show"]			= $_REQUEST["f_tax_company_show"]; // จำนวนเงินขอเบิกรวมภาษีที่ออกให้
			$data["f_vat_amount"]				= $_REQUEST["f_vat_amount"]; // จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ)
			$data["f_vat_doc"]					= $_REQUEST["f_vat_doc"]; // จำนวนเงินภาษีมูลค่าเพิ่ม(จากเอกสาร)
			$data["f_net_amount"]				= $_REQUEST["f_net_amount"]; // จำนวนเงินจ่ายสุทธิ
			$data["dc_user_update_id"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_update"]					= date("Y-m-d H:i:s");
	
			if($mode == "ADD_DTL") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld}";
					$addValue .= ", ?";
				}
					
				$sql	= "	SET NOCOUNT ON
							INSERT INTO ap_expen_dtl (".substr($addField, 1).") VALUES (".substr($addValue,1).");
							SELECT @@IDENTITY as id;";
	
				$para	= $db->QueryParam($sql, $arrValue);
				$ss_id	= $db->Fetch($para);
					
			} else if ($mode == "EDIT_DTL") {
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
	
				$arrValue[] = $_REQUEST["id"];
				$sql		= "UPDATE ap_expen_dtl SET ".substr($addField, 1)." WHERE ap_expen_dtl_id = ?";
				$para		= $db->QueryParam($sql, $arrValue);
			}
				
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
				
			if ( $para ) {
				$re = array(
						"success"				=> true,
						"ap_expen_hdr_id"		=> $_REQUEST["ap_expen_hdr_id"]
				);
			} else {
				$db->RollBackTran();
				$re = array(
						"success"				=> false,
						"msg"					=> "ไม่สามารถบันทึกข้อมูลไม่ได้"
				);
			}
		}
	
		break;
		
	case "CALCULATE" :

		$msg	= "";
// 		$msg	.= check_date();
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {
			
			/*============================ คำนวณยอดเงินทั้งหมด ============================*/
			$sqlMain	= "	SELECT
								ISNULL((SELECT aa.f_tax_rate FROM dc_tax aa where aa.dc_tax_id=b.dc_tax_id),0) AS f_tax_rate,
								b.i_is_drpenalty,
								b.f_inv_amount,
								b.f_dec_amount,	
								b.f_vat_amount,
								b.f_vat_doc,
								b.f_tax_company,
								b.f_pay_tax_amount,
								b.f_net_dec,
								b.f_drpenalty,
								b.f_tax_save,
								b.f_drpenalty,
								a.f_barter_amt,
								a.f_barter_dec,
								CASE WHEN (b.i_is_drpenalty=".PNT_CAL_TAX." OR b.i_is_drpenalty=".PNT_NON_TAX.") THEN ISNULL(b.f_drpenalty,0) ELSE 0 END AS f_drpenalty_cal,
								b.f_reduce,
								b.f_net_amount
							FROM ap_expen_hdr a
								INNER JOIN ap_expen_dtl b ON a.ap_expen_hdr_id=b.ap_expen_hdr_id
							WHERE a.ap_expen_hdr_id=?;";
			
			$stmt = $db->QueryParam($sqlMain, array($_REQUEST["ap_expen_hdr_id"]));
			if( sqlsrv_has_rows( $stmt ) ) {
				
				$f_total_amount		= 0;
				$f_dec_amount		= 0;
				$f_vat_amount		= 0;
				$f_vat_doc			= 0;
				$f_vat_cal_show		= 0;
				$f_comp_amount		= 0;
				$f_wht_amount		= 0;
				$f_tax_save			= 0;
				$f_penalty			= 0;
				$f_net_penalty		= 0;
				$f_reduce			= 0;
				$f_net_amount		= 0;
				
				while( $row=$db->Fetch( $stmt ) ) {
					
					$f_net_dec_tax		= ($row["f_net_dec"]*$row["f_tax_rate"])/100;
					$methodePen			= ($row["i_is_drpenalty"] == 1)? ($row["f_drpenalty"]*$row["f_tax_rate"])/100 : 0;
					
					$f_total_amount		+= $row["f_inv_amount"];
					$f_dec_amount		+= $row["f_dec_amount"];
					$f_vat_amount		+= $row["f_vat_amount"];
					$f_vat_doc			+= $row["f_vat_doc"];
					$f_vat_cal_show		+= ( $row["f_inv_amount"] - $row["f_dec_amount"] ) + $row["f_vat_amount"];
					$f_comp_amount		+= $row["f_pay_tax_amount"];
					$f_wht_amount		+= $f_net_dec_tax-$methodePen;
					$f_tax_save			+= $row["f_tax_save"];
					$f_penalty			+= $row["f_drpenalty"];
					$f_net_penalty		+= (($row["f_inv_amount"] - $row["f_dec_amount"]) + $row["f_vat_amount"]) - ($f_net_dec_tax-$methodePen) + $row["f_pay_tax_amount"] - $row["f_drpenalty_cal"];
					$f_reduce			+= $row["f_reduce"];
					$f_net_amount		+= ($row["f_net_amount"] - $row["f_barter_amt"]) - $row["f_barter_dec"];
				}
			}
			
			$data["dc_acc_id_dec"]				= $_REQUEST["dc_acc_id_dec"];
			$data["f_total_amount"]				= $f_total_amount;		// จำนวนเงินทั้งหมด
			$data["f_dec_amount"]				= $f_dec_amount;		// ส่วนลดเงินสด
			$data["f_vat_amount"]				= $f_vat_amount;		// จำนวนเงินภาษีมูลค่าเพิ่ม(คำนวณ)
			$data["f_vat_doc"]					= $f_vat_doc;			// จำนวนเงินภาษีมูลค่าเพิ่ม(ปรับแก้ตามเอกสาร)
			$data["f_vat_cal_show"]				= $f_vat_cal_show; 		// จำนวนเงินรวมภาษีมูลค่าเพิ่ม(คำนวณ)
			$data["f_comp_amount"]				= $f_comp_amount;		// จำนวนเงินภาษีที่บริษัทออกให้
			$data["f_wht_amount"]				= $f_wht_amount;		// จำนวนเงินภาษีหัก ณ ที่จ่าย
			$data["f_tax_save"]					= $f_tax_save;			// จำนวนเงินภาษีหัก ณ ที่จ่าย (เรียกเก็บ)
			$data["f_penalty"]					= $f_penalty;			// จำนวนเงินค่าปรับเบิกเงินล่าช้า
			$data["f_net_penalty"]				= $f_net_penalty;		// จำนวนเงินรวม
			$data["f_reduce"]					= $f_reduce;			// จำนวนเงินหักอื่นๆ
			$data["f_net_amount"]				= $f_net_amount;		// จำนวนเงินจ่ายสุทธิ
			$data["dc_user_update_id"]			= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
			$data["d_update"]					= date("Y-m-d H:i:s");
			
			// UPDATE ap_expen_hdr
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
			
			$arrValue[] = $_REQUEST["ap_expen_hdr_id"];
			$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id}=?;";
			
			$stmt		= $db->QueryParam($sql, $arrValue);
			$id			= $_REQUEST["ap_expen_hdr_id"];
			
			if ( $stmt ) {
				$re = array("success"				=> true,
							"ap_expen_hdr_id"		=> $id
				);
			} else {
				$re = array("success"				=> false,
							"ap_expen_hdr_id"		=> $id
				);
			}
			
			/*======================================================================*/
		}
		
	break;
	
	case "SAVE_STATUS" :

		$ap	= $db->GetDataBySQL("SELECT c_code, CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date FROM ap_expen_hdr WHERE ap_expen_hdr_id=?;", array($_REQUEST["ap_expen_hdr_id"]));
				
		if( $ap["c_code"] == "0" || $ap["c_code"] == "" ) {
	
			list($yyyy, $mm, $dd) = explode("-",@$ap["d_doc_date"]);
			$c_yyyy_mm = $yyyy.$mm;
			$arrParamGencode	= array("AP",$c_yyyy_mm, $_SESSION["user_id"], $_SESSION["dc_cost_id"], $_REQUEST["ap_expen_hdr_id"]);
			
			$data["dc_user_update_id"]		= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_update"]				= date("Y-m-d H:i:s");
			
			$sqlGenCode			= "EXEC SP_GEN_CODE ?,?,?,?,?;";
		 
			$stmtGenCode 		= $db->QueryParam($sqlGenCode, $arrParamGencode);
			
			$arr_gen_code 	= $db->Fetch($stmtGenCode);

			$c_code 		= $arr_gen_code["c_code_gen"] ;
			$ref_id   		= $arr_gen_code["reference_id"] ;
			
			if ( $_REQUEST["ap_expen_hdr_id"] == $ref_id ) {

				$data["c_code"]					= $c_code;
				$data["dc_user_update_id"]		= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_update"]				= date("Y-m-d H:i:s");
				
				foreach ($data as $fld => $value) {
					$arrValue[]	= ($value != "")? $value : NULL;
					$addField	.= ", {$fld} = ?";
				}
			
				$arrValue[] = $_REQUEST["ap_expen_hdr_id"];
				$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id} = ?";
				$stmt = $db->QueryParam($sql, $arrValue);
				if($stmt) {
					$re = array(
							"success"	=> true,
							"msg"		=> "เลขที่เอกสาร : <b color=red>".$c_code."</b>"
					);
				} else {
					
				}
			}
			
		} else {
			$re = array(
					"success"	=> true,
					"msg"		=> ""
			);
		}
		
		// ============== //
		$addField	= null;
		$addValue	= null;
		unset ($data);
		unset ($arrValue);
		// ============== //
		
		if( $_REQUEST["PAGE_TYPE"] != 1 ) {
				
			$data["i_is_status"]			= $_REQUEST["i_is_status"];
			$data["c_remark"]				= $_REQUEST["c_remark"];
			$data["i_send_tax"]				= $_REQUEST["i_send_tax"];
			$data["dc_user_update_id"]		= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_update"]				= date("Y-m-d H:i:s");
				
			foreach ($data as $fld => $value) {
				$arrValue[]	= ($value != "")? $value : NULL;
				$addField	.= ", {$fld} = ?";
			}
				
			$arrValue[] = $_REQUEST["ap_expen_hdr_id"];
			$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id} = ?;";
			$stmt		= $db->QueryParam($sql, $arrValue);
				
			if ( $stmt ) {
				$re = array(
						"success"				=> true,
						"msg"					=> ""
				);
			} else {
				$re = array(
						"success"				=> false,
						"msg"					=> ""
				);
			}
				
		}
		
	break;
	
	case "DELETE" :
		$AP	= $db->GetDataBySQL("SELECT c_code FROM ap_expen_hdr WHERE ap_expen_hdr_id=?;", array($_REQUEST["id"]));
		if( $AP != "0" && $AP != "" ) {
			$stmt	= $db->QueryParam("UPDATE ap_expen_hdr SET i_enable=? WHERE ap_expen_hdr_id=?", array(STATUS_DISABLE,$_REQUEST["id"]));
		} else {
			$stmt	= $db->QueryParam("DELETE ap_expen_hdr WHERE ap_expen_hdr_id=?", array($_REQUEST["id"]));
		}
		
		if ( $stmt ) {
			$re = array( "success"	=> true );
		} else {
			$re = array( "success"	=> false );
		}
		
	break;
	
	case "DELETE_DTL" :

		$ap_expen_hdr_id	= $db->GetDataBySQL("SELECT ap_expen_hdr_id FROM ap_expen_dtl WHERE ap_expen_dtl_id=?", array($_REQUEST["id"]));
		
		$stmt	= $db->QueryParam("DELETE ap_expen_dtl WHERE ap_expen_dtl_id=?", array($_REQUEST["id"]));
		
		if ( $stmt ) {
			$row = $db->Fetch($stmt);
			$db->CommitTran();
			
			$re = array(
					"success"				=> true,
					"ap_expen_hdr_id"		=> $ap_expen_hdr_id
					
			);
		} else {
			$db->RollBackTran();
			$re = array(
					"success"				=> false,
					"fi_tran_penalty_id"	=> $ap_expen_hdr_id
			);
		}
		break;

}

echo json_encode($re);
exit;
?>
