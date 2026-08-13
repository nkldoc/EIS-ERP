<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/database/apiUtil.php");
include ("../../lib/date/i_date.class.php");
include ("../../lib/mon/mon.class.php");
$db = new DatabaseServer ();
$date = new i_date ();
$util = new apiUtil ();
$mon = new mon (); // convert floatval

$mode = $_REQUEST ["mode"];
$table = "imp_expense_hdr";
$tableDtl = "imp_expense_dtl";
$keyName = "imp_expense_hdr_id";

$arrParam = array ();
$addField = null;
$addValue = null;
$arrValue = array ();

$data = $util->mnUser ( $_REQUEST );

$c_code_mu = "IMPE";

$fld = array (
		"c_code",
		"c_expense_period_no",
		"c_gx_code",
		"c_doc",
		"d_doc_date",
		"d_save_jv_date",
		"dc_expense_budget_type_id",
		"dc_bank_acc_company_id_source",
		"dc_bank_acc_company_id_target",
		"c_comment",
		"i_enable",
		"i_post",
		"dc_user_create_id",
		"dc_user_create_cost_id",
		"d_create",
		"dc_user_update_id",
		"dc_user_update_cost_id",
		"d_update",
		"gl_tran_hdr_id" 
);

// Inteliz
if ($mode == 'ADD' || $mode == 'EDIT') {
	if ($data ["ITYPE_JV"] == "true") {
		$data ['d_doc_date'] = $date->bc_to_ad ( $data ['d_doc_date'] );
	} else {
		$data ['d_save_jv_date'] = @$date->bc_to_ad ( $data ['d_save_jv_date'] );
		
		unset ( $data ["c_doc"] );
		unset ( $data ["c_expense_period_no"] );
		unset ( $data ["dc_expense_budget_type_id"] );
		unset ( $data ["c_comment"] );
	}
	$data ['i_enable'] = STATUS_ENABLE;
}

$db->BeginTran ();
$stmChkMaster = true; // as so
$stmChkDelDtl = true; // as dtl
                       
// =============================================================================================================================
function fn_update_dc_expense($imp_expense_hdr_id) {
	global $db,$mode;
	
	$FIXED_CHEQUE = 1;
	$FIXED_CREDITOR = 374;
	// ,CASE WHEN (month(d_pay)>9) THEN year(d_pay)+1 ELSE year(d_pay) END as c_budget_year
	// ,CASE WHEN (month(d_pay)>9) THEN 2 ELSE 1 END as i_type_year

	$sqlMain = "select a.imp_expense_dtl_id,a.c_expense_group_sub as c_dc_expense_name
					,(select TOP 1 b.dc_expense_id from dc_expense b where b.c_map_code=a.c_bglst and b.i_enable=1 and b.i_delete=2) as dc_expense_id
					,(select TOP 1 b.dc_acc_id from dc_expense b where b.c_map_code=a.c_bglst and b.i_enable=1 and b.i_delete=2) as dc_acc_id	
					,a.i_type_year	
					,a.i_many_doc
				from imp_expense_dtl a
				where a.imp_expense_hdr_id=?";
	
	$arrParam [] = $imp_expense_hdr_id;
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		$sql_upd = "";
		$k = 0;
		while ( $row = $db->Fetch ( $stmt ) ) {
			$k ++;
			$arrParam2 [] = $row ["imp_expense_dtl_id"];
			$i_type_yyyy  = (($row["i_type_year"]=="") || ($row["i_type_year"]=="9")) ? 1 : $row["i_type_year"];
			$ii_many_doc  = ($row["i_many_doc"]=="") ? 1 : $row["i_many_doc"];
			
			if ($mode=="IMPORT_EXCEL") {
				$sql_imp	= "c_dc_expense_name='$row[c_dc_expense_name]'
								,dc_expense_id='$row[dc_expense_id]'
								,dc_expense_group_id=(SELECT aa.dc_expense_group_id FROM dc_expense aa WHERE aa.dc_expense_id = '$row[dc_expense_id]')
								,";
			} else { $sql_imp = "";}
			
			$sql_upd [$k] = " UPDATE imp_expense_dtl 
									SET {$sql_imp}
										dc_acc_id='$row[dc_acc_id]'
										,cm_pay_type_id='$FIXED_CHEQUE'
										,dc_acc_id_creditor='$FIXED_CREDITOR'  
										,i_type_year='$i_type_yyyy'
										,i_many_doc='$ii_many_doc'
									WHERE imp_expense_dtl_id=? ";
			$db->QueryParam ( $sql_upd [$k], $arrParam2 );
			unset ( $arrParam2 );
		}
	}
} // END FN fn_update_dc_expense
  // =============================================================================================================================

switch ($mode) {
	case "ADD" :
		$arrParam = array ();
		$addField = "";
		$addValue = "";
		foreach ( $fld as $value ) {
			if (! empty ( $data [$value] )) {
				$addField .= ", {$value}";
				$addValue .= ", ?";
				$arrParam [] = $data [$value];
			}
		}
		$sql = "INSERT INTO {$table} (" . substr ( $addField, 1 ) . ") VALUES (" . substr ( $addValue, 1 ) . ")";
		$sql .= "SELECT @@IDENTITY as id";
		$stmChkMaster = $db->QueryParam ( $sql, $arrParam );
		if ($stmChkMaster) {
			$next_result = $db->NextResult ( $stmChkMaster );
			if ($next_result) {
				$ret = $db->Fetch ( $stmChkMaster );
				$ret_id = $ret ["id"];
				$returnData = array (
						"id" => $ret_id 
				);
				$log = "Add arSoHdr";
			}
		}
		break;
	case "EDIT" :
		$arrParam = array ();
		$upField = "";
		foreach ( $fld as $value ) {
			if (! empty ( $data [$value] )) {
				$upField .= ", {$value} = ?";
				$arrParam [] = $data [$value];
			}
		}
		$sql = "UPDATE {$table} SET " . substr ( $upField, 1 ) . " WHERE {$keyName} = ?";
		$arrParam [] = $data ["id"];
		$stmChkMaster = $db->QueryParam ( $sql, $arrParam );
		$returnData = array (
				"id" => $data ["id"] 
		);
		$log = "Update arSoHdr";
		break;
	case "DELETE" :
		
		$c_code = $db->GetDataBySQL ( "SELECT c_code FROM imp_expense_hdr WHERE imp_expense_hdr_id=?;", array (
				$_REQUEST ["id"] 
		) );
		if ($c_code != "0" && $c_code != "") { // ปรับสถานะเป็นไม่ใช้งาน
			
			$data = array ();
			
			$data ["i_enable"] = STATUS_DISABLE;
			$data ["dc_user_update_id"] = $_SESSION ["user_id"];
			$data ["dc_user_update_cost_id"] = $_SESSION ["dc_cost_id"];
			$data ["d_update"] = date ( "Y-m-d H:i:s" );
			
			foreach ( $data as $fld => $value ) {
				$arrValue [] = ($value != "") ? $value : NULL;
				$addField .= ", {$fld} = ?";
			}
			
			$arrValue [] = $_REQUEST ["id"];
			$sql = "UPDATE imp_expense_hdr SET " . substr ( $addField, 1 ) . " WHERE imp_expense_hdr_id = ?";
			$stmChkMaster = $db->QueryParam ( $sql, $arrValue );
		} else { // ลบจริง
			
			$sql = "DECLARE @idx AS bigint;
					SET @idx = ?; 
					DELETE FROM imp_expense_dtl WHERE imp_expense_hdr_id =@idx;
					DELETE FROM imp_expense_hdr WHERE imp_expense_hdr_id =@idx;";
			
			$arrParam = array (
					$data ["id"] 
			);
			$stmChkMaster = $db->QueryParam ( $sql, $arrParam );
		}
		
		break;
	
	case "DELETE_GX" :
		
		$msg = "";
		
		$gl = $db->GetDataBySQL ( "	SELECT
										a.gl_tran_hdr_id, a.gl_tran_hdr_id_bank_id
										,ISNULL(b.i_is_post, 1) AS i_is_post
										,ISNULL(c.i_is_post, 1) AS i_is_post_bank
									FROM imp_expense_hdr a
										LEFT JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
										LEFT JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = b.gl_tran_hdr_id
									WHERE a.imp_expense_hdr_id=?;", array ( $_REQUEST ["id"] ) );
		
		if($gl["i_is_post"] <= 2 && $gl["i_is_post_bank"] <= 2) {
		
			$sql = "	UPDATE gl_tran_hdr SET i_enable = " . STATUS_DISABLE . " WHERE gl_tran_hdr_id = " . $gl ["gl_tran_hdr_id"] . ";
						UPDATE gl_tran_hdr SET i_enable = " . STATUS_DISABLE . " WHERE gl_tran_hdr_id = " . $gl ["gl_tran_hdr_id_bank_id"] . ";";
			
			$stmt = $db->QueryParam ( $sql, array () );
			
			// ============== //
			$addField = null;
			$addValue = null;
			unset ( $data );
			unset ( $arrValue );
			// ============== //
			
			if ($stmt) {
				
				$data ["c_gx_code"] = NULL;
				$data ["gl_tran_hdr_id"] = NULL;
				$data ["gl_tran_hdr_id_bank_id"] = NULL;
				$data ["dc_user_update_id"] = $_SESSION ["user_id"];
				$data ["dc_user_update_cost_id"] = $_SESSION ["dc_cost_id"];
				$data ["d_update"] = date ( "Y-m-d H:i:s" );
				
				foreach ( $data as $fld => $value ) {
					$arrValue [] = ($value != "") ? $value : NULL;
					$addField .= ", {$fld} = ?";
				}
				
				$arrValue [] = $_REQUEST ["id"];
				$sql = "	UPDATE {$table} SET " . substr ( $addField, 1 ) . " WHERE {$keyName} = ?;";
				
				$stmChkMaster = $db->QueryParam ( $sql, $arrValue );
				
				// ============== //
				$addField = null;
				$addValue = null;
				unset ( $data );
				unset ( $arrValue );
				// ============== //
			} else {
				$msg .= "ไม่สามารถยกเลิก gl_tran_hdr ได้";
				$re = array (
						"success" => false,
						"msg" => $msg,
						"imp_expense_hdr_id" => $_REQUEST ["id"] 
				);
				echo json_encode ( $re );
				exit ();
			}
		} else {
			$re = array("success"		=> false,
						"msg"			=> "มีบางรายการออกเลข GL แล้ว !!"
			);
			echo json_encode ( $re );
			exit ();
		}
		
		break;
	
	case "GENCODE" :
		
		$msg = "";
		$data = $util->mnUser ( $_REQUEST );
		
		$imp = $db->GetDataBySQL ( "SELECT
        		a.c_code
        		,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
        		FROM {$table} a WHERE {$keyName}=?;", array (
				$data ["id"] 
		) );
		
		if ($imp ["c_code"] != "0" && $imp ["c_code"] != "") {
			$msg .= "- เลขที่เอกสารนี้ออกเลขแล้ว <font color='blue'><b>" . $imp ["c_code"] . "</b></font><br>";
		}
		
		if ($msg != "") {
			
			$re = array (
					"success" => false,
					"msg" => $msg,
					"imp_expense_hdr_id" => $_REQUEST ["id"] 
			);
			echo json_encode ( $re );
			exit ();
		} else {
			
			list ( $yyyy, $mm, $dd ) = explode ( "-", $imp ["d_doc_date"] );
			$c_yyyy_mm = $yyyy . $mm;
			
			$arrParamGencode = array (
					$c_code_mu,
					$c_yyyy_mm,
					$data ["dc_user_update_id"],
					$data ["dc_user_update_cost_id"],
					$data ["id"] 
			);
			$sqlGenCode = "EXEC SP_GEN_CODE ?,?,?,?,?;";
			$stmtGenCode = $db->QueryParam ( $sqlGenCode, $arrParamGencode );
			
			$arr_gen_code = $db->Fetch ( $stmtGenCode );
			$c_code = $arr_gen_code ["c_code_gen"];
			$ref_id = $arr_gen_code ["reference_id"];
			
			if ($data ["id"] == $ref_id) {
				$sql = "UPDATE {$table} SET
        			c_code = ?,
        			dc_user_update_id_exp = {$_SESSION["user_id"]},
        			dc_user_update_cost_id_exp = {$_SESSION["dc_cost_id"]},
        			d_update_exp = '" . date ( "Y-m-d H:i:s" ) . "'
        		 WHERE {$keyName} = ?;";
				$stmt = $db->QueryParam ( $sql, array (
						$c_code,
						$data ["id"] 
				) );
			}
		}
		
		break;
	case "IMPORT_EXCEL" :
		$n = 1; // run เลขแถว
		$path_upload = "../upload/";
		$uploadfile = $path_upload . $_FILES ["dtl_import"] ["name"];
		move_uploaded_file ( $_FILES ["dtl_import"] ["tmp_name"], $uploadfile ); // ย้ายไฟล์จาก Tmp มาไว้โฟรเดอร์ที่กำหนด
		$handle = @fopen ( $uploadfile, "r" ); // เปิดใช้ไฟล์
		$msg = "";
		$hdr_id = $_REQUEST ["id"];
		
		if ($handle != "") {
			$copy_data = array ();
			$copy_field = array ();
			
			$sql = "Declare @idx as bigint;
					set @idx = ?;
					delete from imp_expense_item where imp_expense_hdr_id =@idx;
					delete from imp_expense_dtl where imp_expense_hdr_id =@idx;";
			
			$arrParam = array (
					$hdr_id 
			);
			$stmChkMaster = $db->QueryParam ( $sql, $arrParam );
			
			while ( $data = fgetcsv ( $handle, 1000, "," ) ) {
				if ($n == 1) {
					$copy_field [] = "imp_expense_hdr_id";
					$copy_field [0] = "c_budget_type_name";
					$copy_field [1] = "c_budget_year";
					$copy_field [2] = "d_pay";
					$copy_field [3] = "c_pay_time";
					$copy_field [4] = "c_request";
					$copy_field [5] = "c_approve";
					$copy_field [6] = "c_expense_group_main";
					$copy_field [7] = "c_bglst";
					$copy_field [8] = "c_expense_group_sub";
					$copy_field [9] = "c_acc_item";
					$copy_field [10] = "c_creditor";
					$copy_field [11] = "f_inv";
					$copy_field [12] = "f_vat";
					$copy_field [13] = "f_tax_personal";
					$copy_field [14] = "f_tax_corporate";
					$copy_field [15] = "f_social_security";
					$copy_field [16] = "f_money1";
					$copy_field [17] = "f_fine";
					$copy_field [18] = "f_total";
					$copy_field [19] = "c_bank_name";
					$copy_field [20] = "c_bank_branch_name";
					$copy_field [21] = "c_cheque_numbers";
					$copy_field [22] = "f_check_total";
					$copy_field [23] = "c_note";
				} else if ($n >= 2) {
					$data_insert = array ();
					$data_insert ["imp_expense_hdr_id"] = $hdr_id;
					foreach ( $copy_field as $key => $value ) {
						
						if($key == 1) 
						{ // ปีงบประมาณ
						   $data [$key] = ($data [$key] > 2500)? ($data [$key] - 543) : $data [$key];
						}
						
						$data_insert [$value] = iconv ( "tis-620", "utf-8", $data [$key] );
					}
					
					$copy_data [] = $data_insert;
				}
				$n ++;
			}
			
			// ===== insert
			foreach ( $copy_data as $data ) {
				
				$addField = "";
				$addValue = "";
				foreach ( $data as $fld => $value ) {
					if ($value != "") {
						$addField .= ", {$fld}";
						$addValue .= ", '{$value}'";
					}
				}
				$sql = "INSERT INTO {$tableDtl} (" . substr ( $addField, 1 ) . ") VALUES (" . substr ( $addValue, 1 ) . ")";
				$db->Query ( $sql );
			}
			$db->CommitTran ();
			$returnData = array (
					"id" => $hdr_id 
			);
			fn_update_dc_expense ( $hdr_id );
			$log = "Update imp_expense_dtl";
			fclose ( $handle );
		} else {
			$db->RollBackTran ();
			$re = array (
					"success" => true,
					"debug" => false,
					"msg" => "ไฟล์ที่เลือกผิดพลาด" 
			);
			echo json_encode ( $re );
			exit ();
		}
		break;
	
	case "SAVEDTL" :
		
		$sql		= "";
		$sql_acc	= "";
		$Arr		= json_decode ( $_REQUEST ["data"], true );
		foreach ( $Arr as $fldDtl ) {
			
			$fldDtl ["dc_expense_group_id"] = ($fldDtl ["dc_expense_group_id"] != "") ? $fldDtl ["dc_expense_group_id"] : "NULL";
			$fldDtl ["dc_expense_id"] = ($fldDtl ["dc_expense_id"] != "") ? $fldDtl ["dc_expense_id"] : "NULL";
			$fldDtl ["i_type_year"] = ($fldDtl ["i_type_year"] != "") ? $fldDtl ["i_type_year"] : "NULL";
			$fldDtl ["c_budget_year"] = ($fldDtl ["c_budget_year"] != "") ? $fldDtl ["c_budget_year"] : "NULL";
			
			if( $fldDtl ["i_type_year"] == 1 ) { // ปีงบประมาณ
				$dc_acc	= "	dc_acc_id = (SELECT aa.dc_acc_id FROM dc_expense aa where aa.dc_expense_id = {$fldDtl["dc_expense_id"]}),
							dc_acc_id_overlap = null,";				
			} else { // เหลื่อมปี
				$dc_acc	= "	dc_acc_id = null,
							dc_acc_id_overlap = (SELECT aa.dc_acc_id_overlap FROM dc_expense aa where aa.dc_expense_id = {$fldDtl["dc_expense_id"]}),";
			}
			
			$sql		.= "UPDATE {$tableDtl}
							SET
								dc_expense_group_id = {$fldDtl["dc_expense_group_id"]},
								dc_expense_id = {$fldDtl["dc_expense_id"]},
								{$dc_acc}
								i_type_year = {$fldDtl["i_type_year"]},
								c_budget_year = {$fldDtl["c_budget_year"]}
							WHERE {$tableDtl}_id = {$fldDtl["imp_expense_dtl_id"]};";
						
						
			$sql_acc	.= "UPDATE imp_expense_item
							SET
								dc_acc_id = (
									CASE
										WHEN a.i_type_year = 1 THEN (SELECT aa.dc_acc_id FROM dc_expense aa where aa.dc_expense_id = b.dc_expense_id)
										ELSE NULL
									END),
								dc_acc_id_overlap = (
									CASE
										WHEN a.i_type_year = 1 THEN NULL
										ELSE (SELECT aa.dc_acc_id_overlap FROM dc_expense aa where aa.dc_expense_id = b.dc_expense_id)
									END)
								FROM imp_expense_dtl a
									INNER JOIN imp_expense_item b ON a.imp_expense_dtl_id = b.imp_expense_dtl_id
								WHERE a.imp_expense_dtl_id = {$fldDtl["imp_expense_dtl_id"]}";
		}
		
		if ($sql != "") {
			$db->QueryParam ( $sql, $arrValue );
			$db->CommitTran ();
			$db->QueryParam ( $sql_acc, array() );
			
			
			$re = array (
					"success" => true,
					"msg" => "บันทึกเรียบร้อย" 
			);
			echo json_encode ( $re );
			exit ();
		}
		
		break;
	
	case "GENCODEJV" :
		
		$msg = "";
		$data = $util->mnUser ( $_REQUEST );
		
		$data_imp = $db->GetDataBySQL ( "SELECT
												CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
												,(SELECT TOP 1 cc.gl_dc_book_type_id FROM vw_gl_dc_book_doc cc WHERE cc.c_doc_code='IMPE') as fixed_gl_book_id
									FROM {$table} a
									WHERE a.{$keyName}=?;", array ($data ["id"]) );
		$d_doc_date 				= $data_imp["d_doc_date"]; 
		$gl_dc_book_type_id_fixed 	= $data_imp["fixed_gl_book_id"];
		$gl_dc_book_type_general_id_fixed 	= 3;
		
		
		
		$gl = $db->GetDataBySQL ( "SELECT a.gl_tran_hdr_id,b.c_code FROM {$table} a INNER JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id WHERE a.{$keyName}=?;", array (
				$data ["id"] 
		) );
		
		if ($gl ["c_code"] != "0" && $gl ["c_code"] != "") {
			
			$msg .= "- เลขที่บัญชีนี้ออกเลขแล้ว <font color='blue'><b>" . $gl ["c_code"] . "</b></font><br>";
			$re = array (
					"success" => false,
					"msg" => $msg,
					$keyName => $data ["id"] 
			);
			echo json_encode ( $re );
			exit ();
		} else {
			
			list ( $yyyy, $mm, $dd ) = explode ( "-", $d_doc_date );
			$c_yyyy_mm = $yyyy . $mm;
			
			// ========================บันทึกบัญชี 1/2 [ธนาคาร ใบปะหน้า] ========================
			$gl_hdr_id_bank = 0; 
			
			$sqlBank = "DECLARE @imp_expense_hdr_id as bigint = {$data["id"]};
						DECLARE @d_save_date as varchar(10) = '{$d_doc_date}';
						DECLARE @strM as varchar(50) = {$mm};
						DECLARE @strY as varchar(4) = " . ($yyyy + 543) . ";
						DECLARE @create_id as bigint = {$data["dc_user_update_id"]};
						DECLARE @create_cost_id as bigint = {$data["dc_user_update_cost_id"]};
						DECLARE @gl_dc_book_type_id_bank_fixed as bigint = {$gl_dc_book_type_general_id_fixed};
						
						/*insert gl_tran_hdr*/
						insert into gl_tran_hdr (c_ref_doc, gl_dc_book_type_id, d_doc_date
													, d_save_date, f_total_amt, table_pk_id
													, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
													, c_comment1, i_enable, i_type, i_is_post, i_is_close_year
													, i_is_reversing, i_close_year_type, i_preview
													, i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
													, dc_user_create_id, dc_user_create_cost_id, d_create
													, dc_user_update_id, dc_user_update_cost_id, d_update
													, i_cancel_doc_expense)
						select a.c_code+ '(โอน)'  as c_ref_doc
								, @gl_dc_book_type_id_bank_fixed as gl_dc_book_type_id
								, convert(datetime, @d_save_date, 102) as d_doc_date
								, convert(datetime, @d_save_date, 102) as d_save_date
								, isnull((select sum(f_inv+f_vat) from imp_expense_dtl where imp_expense_hdr_id = a.imp_expense_hdr_id), 0) as f_total_amt
								, a.imp_expense_hdr_id as table_pk_id
								, 'imp_expense_hdr' as table_name
								, 'ใบปะหน้า นำเข้าข้อมูลค่าใช้จ่าย' as table_detail
								, right(left(@d_save_date,7),2) as c_mm
								, left(@d_save_date,4) as c_yyyy
								, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
								, 'ใบปะหน้า นำเข้าข้อมูลค่าใช้จ่าย '+ a.c_doc + ' รอบที่ ' + a.c_expense_period_no +' เดือน '++@strM+' พ.ศ. ' +@strY as c_comment1
								, 1 as i_enable
								, 2 as i_type
								, 2 as i_is_post
								, 2 as i_is_close_year
								, 2 as i_is_reversing
								, 9 as i_close_year_type
								, 1 as i_preview
								, 1 as i_chk_gl_dtl
								, 1 as i_chk_gl_purchase
								, '0' as c_code
								, '0' as c_code_post
								, @create_id
								, @create_cost_id
								, getdate()
								, @create_id
								, @create_cost_id
								, getdate()
								, 4
						from imp_expense_hdr a
						where a.imp_expense_hdr_id = @imp_expense_hdr_id;";
			
			$sqlBank .= "SELECT @@IDENTITY as hdr_id";
			
			$stmt = $db->QueryParam ( $sqlBank, array () );
			
			if ($stmt) {
				$next_result = $db->NextResult ( $stmt );
				if ($next_result) {
					$dd_hdr = $db->Fetch ( $stmt );
					$gl_hdr_id_bank = $dd_hdr ["hdr_id"];
				}
			}
			
			if ($gl_hdr_id_bank > 0) {
				$sqlBankGX = "	declare @imp_expense_hdr_id as bigint = ?;
								declare @hdr_id as bigint = ?;
			
						insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
												, dc_acc_id, f_dr, f_cr
												, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
												, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 
												, i_type_year,dc_expense_budget_type_id,i_return)
						select ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_dr desc) as i_rank
							, @hdr_id as gl_tran_hdr_id
							, dc_cost_acc_id
							, dc_acc_id
							, f_dr
							, f_cr
							, 0 as i_type_person
							, 0 as dc_emp_id
							, 0 as dc_debtor_id
							, 0 as dc_creditor_id
							, 2 as i_is_nontax_exp
							, 0 as dc_product_id
							, 0 as pk_id1
							, 0 as pk_id2
							, 9 as i_type_year
							, 0 as dc_expense_budget_type_id
							, 3 AS i_return
						from (select 77 as dc_cost_acc_id
									,(select bank.dc_acc_id from dc_bank_acc_company bank where bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source) as dc_acc_id
									, sum(b.f_inv+isnull(b.f_vat,0))  as f_dr
									, 0.00 as f_cr
								from imp_expense_hdr a
									inner join imp_expense_dtl b on a.imp_expense_hdr_id = b.imp_expense_hdr_id
								where a.imp_expense_hdr_id = @imp_expense_hdr_id
								group by a.dc_bank_acc_company_id_source
							union
							select 77 as dc_cost_acc_id
								, (select bank.dc_acc_id from dc_bank_acc_company bank where bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_target) as dc_acc_id
								, 0.00 as f_dr
								, sum(b.f_inv+isnull(b.f_vat,0)) as f_cr
							from imp_expense_hdr a
								inner join imp_expense_dtl b on a.imp_expense_hdr_id = b.imp_expense_hdr_id
							where a.imp_expense_hdr_id = @imp_expense_hdr_id
							group by a.dc_bank_acc_company_id_target
							) a
						order by i_rank;";
				
				$stmt2 = $db->QueryParam ( $sqlBankGX, array (
						$data ["id"],
						$gl_hdr_id_bank 
				) );
				if ($stmt2) {
					$code_gen = "GX";
					
					$arrParamBankGencode = array (
							$code_gen,
							$c_yyyy_mm,
							$data ["dc_user_update_id"],
							$data ["dc_user_update_cost_id"],
							$gl_hdr_id_bank 
					);
					$sqlGenCode = "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$stmtGenCode = $db->QueryParam ( $sqlGenCode, $arrParamBankGencode );
					
					$arr_gen_code = $db->Fetch ($stmtGenCode);
					$c_code = $arr_gen_code ["c_code_gen"];
					$ref_id = $arr_gen_code ["reference_id"];
					
					if ($gl_hdr_id_bank == $ref_id) {
						
						$chk_gl_dtl_bank = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
																,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
																,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
																,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
														FROM gl_tran_hdr aa
														WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id_bank)); 
						if (($chk_gl_dtl_bank["no_acc"]>0) || ($chk_gl_dtl_bank["no_cost"]>0) || ($chk_gl_dtl_bank["f_tot_dr"]!=$chk_gl_dtl_bank["f_tot_cr"]))
						{
							$i_success_jv_bank = 2;
						}
						else
						{
							$i_success_jv_bank = 1;
						}							
						 
						
						$sqlIMP = "UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";
						
						$stmt3 = $db->QueryParam ($sqlIMP, array (
								$c_code,
								$i_success_jv_bank,
								$gl_hdr_id_bank 
						) );
						$code_gen = $c_code;
						
						if ($stmt3) {
							$sql = "UPDATE imp_expense_hdr SET gl_tran_hdr_id_bank_id=? WHERE imp_expense_hdr_id = ?";
							$stmt4 = $db->QueryParam ( $sql, array (
									$gl_hdr_id_bank,
									$data ["id"] 
							) );
						}
					}
				}
			}
			// ---- END GX#1/2 Bank
			
			// ======================== บันทึกบัญชี 2/2 [ค่าใช้จ่าย] ========================
			$gl_hdr_id = 0;
			$arrParam = array ();
			$arrParam [] = $data ["id"];
			$arrParam [] = $d_doc_date;
			$arrParam [] = $mm;
			$arrParam [] = $yyyy + 543;
			$arrParam [] = $data ["dc_user_update_id"];
			$arrParam [] = $data ["dc_user_update_cost_id"];
			$arrParam [] = $gl_dc_book_type_id_fixed;
			
			$sql = "declare @imp_expense_hdr_id as bigint;
					declare @d_save_date as varchar(10);
					declare @strM as varchar(50);
					declare @strY as varchar(4);
					declare @create_id as bigint;
					declare @create_cost_id as bigint;
					declare @fixed_gl_book_id as bigint;
			
					set @imp_expense_hdr_id =?;
					set @d_save_date = ?;
					set @strM = ?;
					set @strY = ?;
			
					set @create_id = ?;
					set @create_cost_id = ?;
					set @fixed_gl_book_id = ?;
			
					/*insert gl_tran_hdr*/
					insert into gl_tran_hdr (c_ref_doc, gl_dc_book_type_id, d_doc_date
												, d_save_date, f_total_amt, table_pk_id
												, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
												, c_comment1, i_enable, i_type, i_is_post, i_is_close_year
												, i_is_reversing, i_close_year_type, i_preview
												, i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
												, dc_user_create_id, dc_user_create_cost_id, d_create
												, dc_user_update_id, dc_user_update_cost_id, d_update
												, i_cancel_doc_expense)
					select a.c_code as c_ref_doc
							, (select aa.gl_dc_book_type_id from gl_dc_book_doc aa
									inner join dc_doc bb on aa.dc_doc_id = bb.dc_doc_id
								where bb.c_code = left(a.c_code, 4)) as gl_dc_book_type_id
							, convert(datetime, @d_save_date, 102) as d_doc_date
							, convert(datetime, @d_save_date, 102) as d_save_date
							, isnull((select sum(f_inv+f_vat) from imp_expense_dtl where imp_expense_hdr_id = a.imp_expense_hdr_id), 0) as f_total_amt
							, a.imp_expense_hdr_id as table_pk_id
							, 'imp_expense_hdr' as table_name
							, 'นำเข้าข้อมูลค่าใช้จ่าย' as table_detail
							, right(left(@d_save_date,7),2) as c_mm
							, left(@d_save_date,4) as c_yyyy
							, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
							, 'นำเข้าข้อมูลค่าใช้จ่าย '+ a.c_doc + ' รอบที่ ' + a.c_expense_period_no +' เดือน '++@strM+' พ.ศ. ' +@strY as c_comment1
							, 1 as i_enable
							, 2 as i_type
							, 2 as i_is_post
							, 2 as i_is_close_year
							, 2 as i_is_reversing
							, 9 as i_close_year_type
							, 1 as i_preview
							, 1 as i_chk_gl_dtl
							, 1 as i_chk_gl_purchase
							, '0' as c_code
							, '0' as c_code_post
							, @create_id
							, @create_cost_id
							, getdate()
							, @create_id
							, @create_cost_id
							, getdate()
							, 4
					from imp_expense_hdr a
					where a.imp_expense_hdr_id = @imp_expense_hdr_id;";
			$sql .= "SELECT @@IDENTITY as hdr_id";
			
			$stmt = $db->QueryParam ( $sql, $arrParam );
			if ($stmt) {
				$next_result = $db->NextResult ( $stmt );
				if ($next_result) {
					$dd_hdr = $db->Fetch ( $stmt );
					$gl_hdr_id = $dd_hdr ["hdr_id"];
				}
			}
  
			if ($gl_hdr_id > 0) {
				$sql = "declare @imp_expense_hdr_id as bigint;
						declare @hdr_id as bigint;
						set @imp_expense_hdr_id = ?;
						set @hdr_id = ?;
			
			
						declare @tb_moneyjv1 as table (dc_cost_acc_id bigint
													, dc_acc_id bigint
													, f_dr decimal(18, 2)
													, f_cr decimal(18, 2)
													, i_type_year varchar(5)
													, c_budget_year varchar(50)
													, dc_expense_budget_type_id bigint
													); 
						 
						insert into @tb_moneyjv1 
							select 77 as dc_cost_acc_id
								, case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end	as 	dc_acc_id
								, sum(b.f_inv+isnull(b.f_vat,0)) as f_dr
								, 0.00 as f_cr
								, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id 
							from imp_expense_hdr a
								inner join imp_expense_dtl b on a.imp_expense_hdr_id = b.imp_expense_hdr_id
								inner join dc_expense c on c.dc_expense_id = b.dc_expense_id
							where a.imp_expense_hdr_id = @imp_expense_hdr_id  and isnull(b.i_many_doc,1)=1
							group by case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end
									, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id 
							UNION
							select 77 as dc_cost_acc_id
								, case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end	as 	dc_acc_id
								, sum(e.f_inv+isnull(e.f_vat,0)) as f_dr
								, 0.00 as f_cr
								, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id
							from imp_expense_hdr a
								inner join imp_expense_dtl b on a.imp_expense_hdr_id = b.imp_expense_hdr_id
								inner join imp_expense_item e on e.imp_expense_dtl_id = b.imp_expense_dtl_id
								inner join dc_expense c on c.dc_expense_id = e.dc_expense_id
							where a.imp_expense_hdr_id = @imp_expense_hdr_id  and b.i_many_doc=2
							group by case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end
									, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id;			
			
			
			
			
						insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
												, dc_acc_id, f_dr, f_cr
												, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
												, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2
												, i_type_year,c_budget_year,dc_expense_budget_type_id,i_return)
						select ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id, f_dr desc) as i_rank
							, @hdr_id as gl_tran_hdr_id
							, dc_cost_acc_id
							, dc_acc_id
							, f_dr
							, f_cr
							, 0 as i_type_person
							, 0 as dc_emp_id
							, 0 as dc_debtor_id
							, 0 as dc_creditor_id
							, 2 as i_is_nontax_exp
							, 0 as dc_product_id
							, 0 as pk_id1
							, 0 as pk_id2
							, i_type_year
							, c_budget_year
							, dc_expense_budget_type_id
							, 3 as i_return
						from (select 
									dc_cost_acc_id
									,dc_acc_id
									,sum(f_dr) as f_dr
									,sum(f_cr) as f_cr
									, 0 as i_type_person
									, 0 as dc_emp_id
									, 0 as dc_debtor_id
									, 0 as dc_creditor_id
									, 2 as i_is_nontax_exp
									, 0 as dc_product_id
									, 0 as pk_id1
									, 0 as pk_id2									
									,i_type_year,c_budget_year,dc_expense_budget_type_id  
								from @tb_moneyjv1 
								group by dc_cost_acc_id,dc_acc_id,i_type_year,c_budget_year
										,dc_expense_budget_type_id 
							union 
							select 77 as dc_cost_acc_id 
								, (SELECT TOP 1 nn.dc_acc_id  FROM gl_tran_dtl nn WHERE nn.gl_tran_hdr_id=a.gl_tran_hdr_id_bank_id and nn.f_dr>0) as dc_acc_id
								, 0.00 as f_dr
								, sum(b.f_inv+isnull(b.f_vat,0)) as f_cr
								, 0 as i_type_person
								, 0 as dc_emp_id
								, 0 as dc_debtor_id
								, 0 as dc_creditor_id
								, 2 as i_is_nontax_exp
								, 0 as dc_product_id
								, 0 as pk_id1
								, 0 as pk_id2								
								, b.i_type_year as i_type_year,b.c_budget_year as c_budget_year,a.dc_expense_budget_type_id as dc_expense_budget_type_id 
							from imp_expense_hdr a
								inner join imp_expense_dtl b on a.imp_expense_hdr_id = b.imp_expense_hdr_id
							where a.imp_expense_hdr_id = @imp_expense_hdr_id
							group by b.cm_pay_type_id,a.gl_tran_hdr_id_bank_id
									,a.dc_expense_budget_type_id
									, b.i_type_year,b.c_budget_year
							) a
						order by i_rank;";
						 
				$stmt2 = $db->QueryParam ( $sql, array (
						$data ["id"],
						$gl_hdr_id 
				) );
				if ($stmt2) {
					$code_gen = "GX";
					
					list ( $yyyy, $mm, $dd ) = explode ( "-", @$d_doc_date );
					$c_yyyy_mm = $yyyy . $mm;
					$arrParamGencode = array (
							$code_gen,
							$c_yyyy_mm,
							$data ["dc_user_update_id"],
							$data ["dc_user_update_cost_id"],
							$gl_hdr_id 
					);
					$sqlGenCode = "EXEC SP_GEN_CODE ?,?,?,?,?;";
					$stmtGenCode = $db->QueryParam ( $sqlGenCode, $arrParamGencode );
					
					$arr_gen_code = $db->Fetch ( $stmtGenCode );
					$c_code = $arr_gen_code ["c_code_gen"];
					$ref_id = $arr_gen_code ["reference_id"];
					
					if ($gl_hdr_id == $ref_id) {
						
						$chk_gl_dtl = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
																,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
																,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
													 			,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
														FROM gl_tran_hdr aa
														WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id)); 
						if (($chk_gl_dtl["no_acc"]>0) || ($chk_gl_dtl["no_cost"]>0) || ($chk_gl_dtl["f_tot_dr"]!=$chk_gl_dtl["f_tot_cr"]))
						{
							$i_success_jv = 2;
						}
						else
						{
							$i_success_jv = 1;
						}	
							 
						$sql = "UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";
						
						$stmt3 = $db->QueryParam ( $sql, array (
								$c_code,
								$i_success_jv,
								$gl_hdr_id 
						) );
						$code_gen = $c_code;
						
						if ($stmt3) {
							$sql = "UPDATE imp_expense_hdr
									SET
										c_gx_code = ?, i_post = ?,gl_tran_hdr_id=?,
										dc_user_update_id_jv = {$_SESSION["user_id"]},
        								dc_user_update_cost_id_jv = {$_SESSION["dc_cost_id"]},
        								d_update_jv = '" . date ( "Y-m-d H:i:s" ) . "'
									WHERE imp_expense_hdr_id = ?";
							$stmt4 = $db->QueryParam ( $sql, array (
									$code_gen,
									1,
									$gl_hdr_id,
									$data ["id"] 
							) );
							$db->CommitTran ();
							
							$msg .= "เลขที่ค่าใช้จ่าย : <b style='color:blue;'>" . $code_gen . "</b><br>";
							$re = array (
									"success" => true,
									"msg" => $msg,
									$keyName => $data ["id"] 
							);
							echo json_encode ( $re );
							exit ();
						}
					}
				}
			}
		}
		// ---- END GX#1 - Expense import
		break;
}

if ($stmChkMaster) {
	$db->CommitTran ();
	$re = array (
			"reval" => 0,
			"success" => "Success",
			"msg" => "บันทึกเรียบร้อย",
			"data" => @$returnData,
			"log" => @$log 
	);
} else {
	$db->RollBackTran ();
	$re = array (
			"reval" => 1,
			"success" => "Error",
			"msg" => "Error" 
	);
}
echo json_encode ( $re );
exit ();

?>