<?php
include("../../cm/conf/configCm.php");
include("../../ap/conf/configAp.php");
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

$table		= "cm_voucher_one";
$pk_id		= "cm_voucher_one_id";

function del_ap() {

	global $db;
	
	$dd		= array();
	$arrV	= array();
	$addF	= null;
	
	$ap_expen_hdr_id	= $db->GetDataBySQL("SELECT a.ap_expen_hdr_id FROM cm_voucher_one a WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
	
	//กรณี หักล้างเงินยืม/แลกเปลี่ยน ไม่ต้องเปลี่ยนสถานะเป็นรอทำใบสำคัญจ่าย(i_is_status=FI_BR_I_IS_STATUS1) ให้คงสถานะเป็นรอทำใบสำคัญจ่าย(แลกเปลี่ยน) ไว้ (i_is_status=FI_BR_I_IS_STATUS6)
	$i_is_barter			= $db->GetDataBySQL("SELECT ISNULL(i_is_barter,0) AS i_is_barter FROM ap_expen_hdr WHERE ap_expen_hdr_id=?", array($ap_expen_hdr_id));
	$i_is_status			= ( $i_is_barter > 0 )? FI_BR_I_IS_STATUS6 : FI_BR_I_IS_STATUS1;
	
	/*====================== เซตสถานะเป็นรออนุมัติ ======================*/
	$sql	= "UPDATE ap_expen_hdr SET i_is_status=".$i_is_status." WHERE ap_expen_hdr_id=?";
	$stmt	= $db->QueryParam($sql, array($ap_expen_hdr_id));
	/*==========================================================*/
	
	$dd["ap_expen_hdr_id"]			= null;
	$dd["f_total_cost"]				= null;
	$dd["f_vat"]					= null;
	$dd["f_wht"]					= null;
	$dd["f_net_cost"]				= null;
	$dd["f_penalty_amt"]			= null;
	$dd["f_barter_amt"]				= null;
	$dd["f_comp_amt"]				= null;
	$dd["f_dec_amount"]				= null;
	$dd["f_barter_dec"]				= null;
	$dd["f_tax_save"]				= null;
	$dd["f_reduce"]					= null;
	$dd["dc_user_update_id"]		= $_SESSION["user_id"];
	$dd["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
	$dd["d_update"]					= date("Y-m-d H:i:s");
	
	// UPDATE cm_voucher_one
	foreach ($dd as $fld => $value) {
		$arrV[]	= ($value != "")? $value : NULL;
		$addF	.= ", {$fld} = ?";
	}

	$arrV[]		= $_REQUEST["cm_voucher_one_id"];
	$sql		= "UPDATE cm_voucher_one SET ".substr($addF, 1)." WHERE cm_voucher_one_id = ?";
	
	$db->QueryParam($sql, $arrV);

};

switch ( $mode ) {
	
	case "ADD" :
	case "EDIT" :

		$msg	= "";
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {

			if($mode == "ADD") {
				$data["dc_user_create_id"]		= $_SESSION["user_id"];
				$data["dc_user_create_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_create"]				= date("Y-m-d H:i:s");
			}
			
			$data["d_doc_date"]						= $_REQUEST["d_doc_date"];
			$data["c_comment"]						= $_REQUEST["c_comment"];
			$data["i_type_voucher"]					= 1;
			$data["i_enable"]						= STATUS_ENABLE;
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
							INSERT INTO {$table} (".substr($addField, 1).") VALUES (".substr($addValue,1).");
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
				
			}
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			if ( $para ) {
				
				$ap_expen_hdr_id	= $db->GetDataBySQL("SELECT ISNULL(ap_expen_hdr_id,0) FROM cm_voucher_one WHERE cm_voucher_one_id=?", array($id));
				
				$re = array(
						"success"			=> true,
						$pk_id				=> $id,
						"ap_expen_hdr_id"	=> $ap_expen_hdr_id
				);
			} else {
				$re = array(
						"success"		=> false,
						"msg"			=> "ไม่สามารถบันทึกข้อมูลได้"
				);
			}
			
		}
		
	break;

	case "CALCULATE" :

		$msg	= "";
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {

			$sqlMain = "SELECT
							ISNULL(b.f_vat_amount,0) AS f_vat_amount
							,ISNULL(b.f_vat_doc,0) AS f_vat_doc
							,ISNULL(b.f_wht_amount,0) AS f_wht_amount
							,ISNULL(b.f_net_amount,0) AS f_net_amount
							,ISNULL(b.f_barter_amt,0) AS f_barter_amt
							,ISNULL(b.f_penalty,0)	 AS f_drpenalty
							,ISNULL(b.f_comp_amount,0) AS f_comp_amt
							,ISNULL(b.f_dec_amount,0) AS f_dec_amount
							,ISNULL(b.f_barter_dec,0) AS f_barter_dec
							,ISNULL(b.f_tax_save,0) AS f_tax_save
							,ISNULL(b.f_reduce,0) AS f_reduce
							,ISNULL(b.f_total_amount,0) AS f_total_amount
						FROM cm_voucher_one a
							INNER JOIN ap_expen_hdr b ON b.ap_expen_hdr_id=a.ap_expen_hdr_id
						WHERE a.cm_voucher_one_id=?";
			
			$arrParam[]	= $_REQUEST["cm_voucher_one_id"];
			
			$stmt = $db->QueryParam($sqlMain, $arrParam);
			if( sqlsrv_has_rows( $stmt ) ) {
				while( $row=$db->Fetch( $stmt ) ) {
					
					/*========================== SEND UPDATE DATA ==========================*/
					$data["f_total_cost"]				= $row["f_total_amount"];
					$data["f_vat_doc"]					= $row["f_vat_doc"];
					$data["f_vat"]						= $row["f_vat_amount"];
					$data["f_wht"]						= $row["f_wht_amount"];
					$data["f_penalty_amt"]				= $row["f_drpenalty"];
					$data["f_barter_amt"]				= $row["f_barter_amt"];
					$data["f_comp_amt"]					= $row["f_comp_amt"];
					$data["f_net_cost"]					= $row["f_net_amount"];
					$data["f_dec_amount"]				= $row["f_dec_amount"];
					$data["f_barter_dec"]				= $row["f_barter_dec"];
					$data["f_tax_save"]					= $row["f_tax_save"];
					$data["f_reduce"]					= $row["f_reduce"];
					$data["dc_user_update_id"]			= $_SESSION["user_id"];
					$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
					$data["d_update"]					= date("Y-m-d H:i:s");

					// UPDATE cm_voucher_one
					foreach ($data as $fld => $value) {
						$arrValue[]	= ($value != "")? $value : NULL;
						$addField	.= ", {$fld} = ?";
					}
					
					$arrValue[] = $_REQUEST["cm_voucher_one_id"];
					$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id} = ?";
					$stmt		= $db->QueryParam($sql, $arrValue);
							
					// ============== //
					$addField	= null;
					$addValue	= null;
					unset ($data);
					unset ($arrValue);
					// ============== //
					
					if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
					
					/*======================================================================*/
				}
			}
			
			if ( $stmt ) {
				$re = array(
						"success"		=> true,
						"msg"			=> ""
				);
			} else {
				$re = array(
						"success"		=> false,
						"msg"			=> ""
				);
			}
			
			/*======================================================================*/
		}
		
	break;
	
	case "SAVE_AP" :

		$data["ap_expen_hdr_id"]			= $_REQUEST["ap_expen_hdr_id"];
		$data["dc_user_update_id"]			= $_SESSION["user_id"];
		$data["dc_user_update_cost_id"]		= $_SESSION["dc_cost_id"];
		$data["d_update"]					= date("Y-m-d H:i:s");

		foreach ($data as $fld => $value) {
			$arrValue[] = ($value != "")? $value : NULL;
			$addField .= ", {$fld} = ?";
		}
		
		$arrValue[] = $_REQUEST["cm_voucher_one_id"];
		$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id} = ?";
		$para		= $db->QueryParam($sql, $arrValue);
		$id			= $_REQUEST["cm_voucher_one_id"];

		/*====================== เซตสถานะเป็นอนุมัติแล้ว ======================*/
		$sql1	= "UPDATE ap_expen_hdr SET i_is_status=".FI_BR_I_IS_STATUS12." WHERE ap_expen_hdr_id=?";
		$stmt	= $db->QueryParam($sql1, array($_REQUEST["ap_expen_hdr_id"]));
		/*===========================================================*/
		
		if ( $stmt ) {
			$re = array(
					"success"					=> true,
					"cm_voucher_one_id"			=> $_REQUEST["cm_voucher_one_id"],
					"ap_expen_hdr_id"			=> $_REQUEST["ap_expen_hdr_id"],
			);
		} else {
			$re = array(
					"success"		=> false,
					"msg"			=> "check statement : {$sql}"
			);
		}

	break;
	
	case "GEN_PRE" :
	
		$msg	= "";
		
		$fi	= $db->GetDataBySQL("SELECT c_code,f_total_cost,CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date FROM cm_voucher_one WHERE cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
		
		if( $fi["c_code"] != "0" && $fi["c_code"] != "" ) {
			$msg	.= "- เลขที่เอกสารนี้ออกเลขแล้ว <b style='color:blue;'>".$fi["c_code"]."</b><br>";
		} else if($fi["f_total_cost"] <= 0) {
			$msg	.= "- \"จำนวนเงินรวมรายการค่าใช้จ่าย\" ต้องมีค่ามากกว่า 0 บาท<br>";
		}
		
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {
			
			/*============================ GEN ERP ============================*/
			
			list($yyyy,$mm,$dd)	= explode("-", $fi["d_doc_date"]);
			$sql		= "EXEC SP_GEN_CODE ?,?,?,?,?;";
			$arrValue[]	= "PRE";			
			$arrValue[]	= $yyyy.$mm;
			$arrValue[]	= $_SESSION["user_id"];
			$arrValue[]	= $_SESSION["dc_cost_id"];
			$arrValue[]	= $_REQUEST["cm_voucher_one_id"];
			
			$arr_gen_code	= $db->GetDataBySQL($sql, $arrValue);
			
			unset ($sql);
			unset ($arrValue);

			if ($_REQUEST["cm_voucher_one_id"] == $arr_gen_code["reference_id"]) {
				
				$sql		= "UPDATE cm_voucher_one SET c_code = ? WHERE cm_voucher_one_id = ?";
			
				$arrValue[] = $arr_gen_code["c_code_gen"];
				$arrValue[] = $_REQUEST["cm_voucher_one_id"];

				$db->BeginTran();
				$stmt	= $db->QueryParam($sql, $arrValue);
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
				
				if( $stmt ) {
					
					$db->CommitTran();

					$msg	= "เลขที่เอกสาร : <b style='color:blue;'>".$arr_gen_code["c_code_gen"]."</b><br>";
					
					$re = array(
							"cm_voucher_one_id"			=> $_REQUEST["cm_voucher_one_id"],
							"success"					=> true,
							"msg"						=> $msg
					);
					
				} else {
					$db->RollBackTran();
					$re = array(
						"cm_voucher_one_id"			=> $_REQUEST["cm_voucher_one_id"],
						"success"					=> false,
						"msg"						=> "check statement : {$sql}"
					);
				}
			} else {
				$re = array(
						"cm_voucher_one_id"			=> $_REQUEST["cm_voucher_one_id"],
						"success"					=> false,
						"msg"						=> "ยังไม่ได้ออกเลข PRE"
				);
			}
			/*======================================================================*/
		}
	break;
	
	case "DELETE" :
		
		$TB			= "";
		$key_id		= "";
			
		$voucher	= $db->GetDataBySQL("SELECT
											a.cm_voucher_one_id
											,ISNULL(a.c_code,0) AS c_code
											,ISNULL(a.ap_br_id,0) AS ap_br_id
											,ISNULL(a.ap_expen_hdr_id,0) AS ap_expen_hdr_id
										FROM cm_voucher_one a
										WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
		
		// ออกเลข PRE แล้ว
		if( $voucher["c_code"] != "0" && $voucher["c_code"] != "" ) {
			
			$data["i_is_cancel_pre"]		= 1;				// ยกเลิก PRE
			$data["i_enable"]				= STATUS_DISABLE;	// 2
			$data["dc_user_update_id"]		= $_SESSION["user_id"];
			$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
			$data["d_update"]				= date("Y-m-d H:i:s");
			
			foreach ($data as $fld => $value) {
				$arrValue[] = ($value != "")? $value : NULL;
				$addField .= ", {$fld} = ?";
			}
			
			$arrValue[] = $_REQUEST["cm_voucher_one_id"];
			$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id} = ?";
			$stmt		= $db->QueryParam($sql, $arrValue);
			
			if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //

			// ใช้อัพเดทสถานะใบเบิกเป็นรอทำใบสำคัญจ่ายและลบข้อมูลใบสำคัญจ่าย
			if( $voucher["ap_expen_hdr_id"] > 0 ) {
				
				//กรณี หักล้างเงินยืม/แลกเปลี่ยน ไม่ต้องเปลี่ยนสถานะเป็นรอทำใบสำคัญจ่าย(i_is_status=1)
				$i_is_barter					= $db->GetDataBySQL("SELECT ISNULL(i_is_barter,0) AS i_is_barter FROM ap_expen_hdr WHERE ap_expen_hdr_id=?", array($voucher["ap_expen_hdr_id"]));
				$data["i_is_status"]			= ( $i_is_barter != 1 && $i_is_barter != 2 )? 1 : 6;				
				$data["dc_user_update_id"]		= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_update"]				= date("Y-m-d H:i:s");
						
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}

				$arrValue[] = $voucher["ap_expen_hdr_id"];
				$sql		= "UPDATE ap_expen_hdr SET ".substr($addField, 1)." WHERE ap_expen_hdr_id = ?";
				$stmt		= $db->QueryParam($sql, $arrValue);
				
				if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
				
				$data["i_enable"]				= STATUS_DISABLE;
				$data["dc_user_update_id"]		= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_update"]				= date("Y-m-d H:i:s");
				
				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
				
				$arrValue[] = $voucher["cm_voucher_one_id"];
				$sql		= "UPDATE {$table} SET ".substr($addField, 1)." WHERE {$pk_id}=?";
				$stmt		= $db->QueryParam($sql, $arrValue);
				
				if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
				
			}
			
			//เก็บข้อมูล คนที่ยกเลิก PRE/PV
			if ( (!empty($voucher["cm_voucher_one_id"])) && ($voucher["cm_voucher_one_id"] > 0) ) {
				
				$data_old	= $db->GetDataBySQL("SELECT c_code AS c_code_pre, c_code_pv FROM {$table} WHERE {$pk_id}=?", array($_REQUEST["cm_voucher_one_id"]));
					
				$data["c_code_pre"]						= $data_old["c_code_pre"];
				$data["cm_voucher_one_id"]				= $voucher["cm_voucher_one_id"];
				$data["user_cancel_id"]					= $_SESSION["user_id"];
				$data["user_cancel_org_id"]				= $_SESSION["dc_cost_id"];
				$data["user_cancel_name"]				= $db->GetDataBySQL("SELECT b.c_name FROM dc_user a LEFT JOIN dc_emp b ON a.dc_emp_id=b.dc_emp_id WHERE a.dc_user_id=?", array($_SESSION["user_id"]));
				$data["c_cancel_date"]					= date("Y-m-d");
				$data["c_cancel_time"]					= date("H:i:s");
				$data["i_cancel_type"]					= CM_CANCEL_PRE;

				foreach ($data as $fld => $value) {
					$addField .= ", {$fld}";
					$addValue .= ", ?";
					$arrValue[] = $value;
				}
					
				$sql	= "INSERT INTO cm_cancel_history (".substr($addField, 1).") VALUES (".substr($addValue,1).");";
				$stmt	= $db->QueryParam($sql, $arrValue);
				
				if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
				
				// ============== //
				$addField	= null;
				$addValue	= null;
				unset ($data);
				unset ($arrValue);
				// ============== //
			}
			
		} else {
			
			if( $voucher["ap_br_id"] > 0 ) {
				
				$TB						= "ap_br";
				$key_id					= "ap_br_id";
				$data["i_is_status"]	= 1;
				
			} else if( $voucher["ap_expen_hdr_id"] > 0 ) { del_ap(); }
			
			if ( ( $TB != "" ) && is_array($data) ) {
				
				$data["dc_user_update_id"]		= $_SESSION["user_id"];
				$data["dc_user_update_cost_id"]	= $_SESSION["dc_cost_id"];
				$data["d_update"]				= date("Y-m-d H:i:s");

				foreach ($data as $fld => $value) {
					$arrValue[] = ($value != "")? $value : NULL;
					$addField .= ", {$fld} = ?";
				}

				$arrValue[] = $voucher[$key_id];
				$sql		= "UPDATE {$TB} SET ".substr($addField, 1)." WHERE {$key_id} = ?";
				$stmt		= $db->QueryParam($sql, $arrValue);
				
				if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }

			}
			
			// ============== //
			$addField	= null;
			$addValue	= null;
			unset ($data);
			unset ($arrValue);
			// ============== //
			
			// ================================================= //
			$stmt	= $db->QueryParam("DELETE {$table} WHERE {$pk_id}=?", array($_REQUEST["cm_voucher_one_id"]));
			if(!$stmt) { echo json_encode( array( "cm_voucher_one_id" => $_REQUEST["cm_voucher_one_id"], "success" => false, "msg" => "check statement : {$sql}" ) ); }
			// ================================================= //
		}
		
		if ( $stmt ) {
			$row = $db->Fetch($stmt);
			$db->CommitTran();
			$re = array(
					"success"		=> true,
					"msg"			=> $row["msg"]
			);
		} else {
			$db->RollBackTran();
			$re = array(
					"success"		=> false,
					"msg"			=> "check statement : {$sql}"
			);
		}
		
	break;
	
	case "DELETE_AP" :
	
		$msg	= "";
	
		if( $msg != "" ) {
			$re = array( "msg" => $msg );
		} else {
	
			del_ap();
			$re = array(
					"success"					=> true,
					"cm_voucher_one_id"			=> $_REQUEST["cm_voucher_one_id"],
					"ap_expen_hdr_id"			=> 0
				);
		}
	
	break;
		
}

echo json_encode($re);
exit;
?>
