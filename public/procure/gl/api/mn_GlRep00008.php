<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();

$root		= "data";
$data		= array();

$table	= "gl_bank";
$key_id	= "gl_bank_id";

$mode		= $_REQUEST["mode"];
$arrParam	= array();
$addField	= null;
$addValue	= null;
$arrValue	= array();

switch ( $mode ) {
	
	case "SAVE_APPROVE" :

		$msg	= "";
		$sql	= "";
		
		$pk_dtl_id			= $_REQUEST["pk_dtl_id"];
		$i_type_year		= $_REQUEST["i_type_year"];
		$c_budget_year		= $_REQUEST["c_budget_year"];
		$gl_tran_dtl_id		= ($_REQUEST["gl_tran_dtl_id"] > 0)? $_REQUEST["gl_tran_dtl_id"] : 0;
		$gl_i_type_year		= ($_REQUEST["gl_i_type_year"] > 0)? $_REQUEST["gl_i_type_year"] : 0;
		$gl_c_budget_year	= ($_REQUEST["gl_c_budget_year"] > 0)? $_REQUEST["gl_c_budget_year"] : 0;
		
		$gx = $db->GetDataBySQL("	SELECT a.i_is_post FROM gl_tran_hdr a
									WHERE a.i_enable = 1
										AND a.gl_tran_hdr_id = (SELECT aa.gl_tran_hdr_id FROM gl_tran_dtl aa WHERE aa.gl_tran_dtl_id = ?)
										AND a.i_is_post IN (2,3);", array($gl_tran_dtl_id));
		
		if($_REQUEST["table_name"] == "imp_expense") {
			
			$imp	= $db->GetDataBySQL("SELECT
											CASE
												WHEN b.i_type_year = 1 THEN b.dc_acc_id
												WHEN b.i_type_year = 2 THEN b.dc_acc_id_overlap
												ELSE 0
											END AS dc_acc_id_old
											,CASE
												WHEN b.i_type_year = 1 THEN c.dc_acc_id
												ELSE c.dc_acc_id_overlap
											END AS dc_acc_id_new
											,ISNULL(b.i_many_doc,1) AS i_many_doc
										FROM imp_expense_hdr a
											INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
											LEFT JOIN dc_expense c ON b.dc_expense_id = c.dc_expense_id
										WHERE a.i_enable = ".STATUS_ENABLE."
											AND b.imp_expense_dtl_id = ?;", array($pk_dtl_id));
			
		} else if($_REQUEST["table_name"] == "imp_expense_vsn") {
			
			$imp	= $db->GetDataBySQL("SELECT
											CASE
												WHEN b.i_type_year = 1 THEN b.dc_acc_id
												WHEN b.i_type_year = 2 THEN b.dc_acc_id_overlap
												ELSE 0
											END AS dc_acc_id_old
											,CASE
												WHEN b.i_type_year = 1 THEN c.dc_acc_id
												ELSE c.dc_acc_id_overlap
											END AS dc_acc_id_new
											,ISNULL(b.i_many_doc,1) AS i_many_doc 
										FROM imp_expense_vsn_hdr a
											INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
											LEFT JOIN dc_expense_acc_vsn c ON b.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
										WHERE a.i_enable = ".STATUS_ENABLE."
											AND b.imp_expense_vsn_dtl_id = ?;", array($pk_dtl_id));
		}
		
		if(is_array($imp)) {
			if(is_array($gx)) {
				// ถ้าผังบัญชีไม่ตรงกันมีผลกับ GL ที่ประมวลผลแล้ว
				if($imp["dc_acc_id_old"] == $imp["dc_acc_id_new"]) {
					if($imp["i_many_doc"] == 2) { // สถานะแยกรายละเอียดฎีกา (1=ไม่แยก,2=แยก)
						
						if($_REQUEST["table_name"] == "imp_expense") {
							
							$impItem = $db->GetDataBySQL("	SELECT
																CASE
																	WHEN a.i_type_year = 1 THEN b.dc_acc_id
																	WHEN a.i_type_year = 2 THEN b.dc_acc_id_overlap
																	ELSE 0
																END AS dc_acc_id_old
																,CASE
																	WHEN a.i_type_year = 1 THEN c.dc_acc_id
																	ELSE c.dc_acc_id_overlap
																END AS dc_acc_id_new
															FROM imp_expense_dtl a
																INNER JOIN imp_expense_item b ON a.imp_expense_dtl_id = b.imp_expense_dtl_id
																INNER JOIN dc_expense c ON b.dc_expense_id = c.dc_expense_id
															WHERE b.imp_expense_dtl_id = ?;", array($pk_dtl_id));
							
						} else if($_REQUEST["table_name"] == "imp_expense_vsn") {
							
							$impItem = $db->GetDataBySQL("	SELECT
																CASE
																	WHEN a.i_type_year = 1 THEN b.dc_acc_id
																	WHEN a.i_type_year = 2 THEN b.dc_acc_id_overlap
																	ELSE 0
																END AS dc_acc_id_old
																,CASE
																	WHEN a.i_type_year = 1 THEN c.dc_acc_id
																	ELSE c.dc_acc_id_overlap
																END AS dc_acc_id_new
															FROM imp_expense_vsn_dtl a
																INNER JOIN imp_expense_vsn_item b ON a.imp_expense_vsn_dtl_id = b.imp_expense_vsn_dtl_id
																INNER JOIN dc_expense_acc_vsn c ON b.dc_expense_acc_vsn_id = c.dc_expense_acc_vsn_id
															WHERE b.imp_expense_vsn_dtl_id = ?;", array($pk_dtl_id));
						}
	
						if(is_array($impItem)) {
							if($impItem["dc_acc_id_old"] == $impItem["dc_acc_id_new"]) {}
							else { $msg = "ผังบัญชีเดิม กับ ผังบัญชีใหม่ไม่ตรงกัน (item)"; }
						} else { $msg = "ไม่พบรายการของ item (แยกรายละเอียดฏีกา)"; }
					}
				} else { $msg = "ผังบัญชีเดิม กับ ผังบัญชีใหม่ไม่ตรงกัน (dtl)"; }
			}
		} else { $msg = "ไม่พบรายการของ dtl (ฏีกา)"; }
		
		if($msg == "") {
			
			if($_REQUEST["table_name"] == "imp_expense") {
				// ถ้ายังไม่ออก GX แก้ไข หมวดรายจ่ายได้
				if(!is_array($gx)) {
					$sql	= "	UPDATE imp_expense_dtl
								SET
									dc_expense_group_id = {$_REQUEST["expense_group_id"]}
									,dc_expense_id = {$_REQUEST["expense_id"]}
								WHERE imp_expense_dtl_id = {$pk_dtl_id}; ";					
				}
				
				/*e-phis*/
				$sql	.= "
							DECLARE @imp_dtl_id INT = {$pk_dtl_id};
							DECLARE @i_type_year INT = {$i_type_year};
							DECLARE @c_budget_year INT = {$c_budget_year};
							DECLARE @gl_tran_dtl_id INT = {$gl_tran_dtl_id};
							DECLARE @gl_i_type_year INT = {$gl_i_type_year};
							DECLARE @gl_c_budget_year INT = {$gl_c_budget_year};
						
							UPDATE imp_expense_dtl
							SET
								i_type_year = @i_type_year, c_budget_year = @c_budget_year,
								dc_acc_id = (
									CASE
										WHEN @i_type_year = 1 THEN (SELECT aa.dc_acc_id FROM dc_expense aa where aa.dc_expense_id = a.dc_expense_id)
										ELSE NULL
									END),
								dc_acc_id_overlap = (
									CASE
										WHEN @i_type_year = 1 THEN NULL
										ELSE (SELECT aa.dc_acc_id_overlap FROM dc_expense aa where aa.dc_expense_id = a.dc_expense_id)
									END)
							FROM imp_expense_dtl a
							WHERE imp_expense_dtl_id = @imp_dtl_id;
						
							/* ถ้าผังบัญชีของ imp_expense_item (dc_acc_id,dc_acc_id_overlap) ไม่ตรงกันอาจมีผลกับ GL */
							UPDATE imp_expense_item
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
							WHERE a.imp_expense_dtl_id = @imp_dtl_id;
				
							/* UPDATE I_TYPE_YEAR ผังบัญชี */
							UPDATE gl_tran_dtl
							SET 
								i_type_year = @gl_i_type_year
								,c_budget_year = @gl_c_budget_year
							WHERE gl_tran_dtl_id = @gl_tran_dtl_id;";
					
				$para	= $db->QueryParam($sql, array());
					
			} else if($_REQUEST["table_name"] == "imp_expense_vsn") {
				// ถ้ายังไม่ออก GX แก้ไข หมวดรายจ่ายได้
				if(!is_array($gx)) {
					$sql	= "	UPDATE imp_expense_vsn_dtl
								SET
									dc_expense_group_vsn_id = {$_REQUEST["expense_group_id"]}
									,dc_expense_vsn_id = (SELECT aa.dc_expense_vsn_id FROM dc_expense_acc_vsn aa WHERE aa.dc_expense_acc_vsn_id = {$_REQUEST["expense_id"]})
									,dc_expense_acc_vsn_id = {$_REQUEST["expense_id"]}
								WHERE imp_expense_vsn_dtl_id = {$pk_dtl_id}; ";					
				}
				
				/*vision net*/
				$sql	.= "
							DECLARE @imp_dtl_id INT = {$pk_dtl_id};
							DECLARE @i_type_year INT = {$i_type_year};
							DECLARE @c_budget_year INT = {$c_budget_year};
							DECLARE @gl_tran_dtl_id INT = {$gl_tran_dtl_id};
							DECLARE @gl_i_type_year INT = {$gl_i_type_year};
							DECLARE @gl_c_budget_year INT = {$gl_c_budget_year};
						
							UPDATE imp_expense_vsn_dtl
							SET
								i_type_year = @i_type_year, c_budget_year = @c_budget_year,
								dc_acc_id = (
									CASE
										WHEN @i_type_year = 1 THEN (SELECT aa.dc_acc_id FROM dc_expense_acc_vsn aa where aa.dc_expense_acc_vsn_id = a.dc_expense_acc_vsn_id)
										ELSE NULL
									END),
								dc_acc_id_overlap = (
									CASE
										WHEN @i_type_year = 1 THEN NULL
										ELSE (SELECT aa.dc_acc_id_overlap FROM dc_expense_acc_vsn aa where aa.dc_expense_acc_vsn_id = a.dc_expense_acc_vsn_id)
									END)
							FROM imp_expense_vsn_dtl a
							WHERE imp_expense_vsn_dtl_id = @imp_dtl_id;
						
							/* ถ้าผังบัญชีของ imp_expense_vsn_item (dc_acc_id,dc_acc_id_overlap) ไม่ตรงกันอาจมีผลกับ GL */
							UPDATE imp_expense_vsn_item
							SET
								dc_acc_id = (
									CASE
										WHEN a.i_type_year = 1 THEN (SELECT aa.dc_acc_id FROM dc_expense_acc_vsn aa where aa.dc_expense_acc_vsn_id = b.dc_expense_acc_vsn_id)
										ELSE NULL
									END),
								dc_acc_id_overlap = (
									CASE
										WHEN a.i_type_year = 1 THEN NULL
										ELSE (SELECT aa.dc_acc_id_overlap FROM dc_expense_acc_vsn aa where aa.dc_expense_acc_vsn_id = b.dc_expense_acc_vsn_id)
									END)
							FROM imp_expense_vsn_dtl a
								INNER JOIN imp_expense_vsn_item b ON a.imp_expense_vsn_dtl_id = b.imp_expense_vsn_dtl_id
							WHERE a.imp_expense_vsn_dtl_id = @imp_dtl_id;
				
							/* UPDATE I_TYPE_YEAR ผังบัญชี */
							UPDATE gl_tran_dtl
							SET 
								i_type_year = @gl_i_type_year
								,c_budget_year = @gl_c_budget_year
							WHERE gl_tran_dtl_id = @gl_tran_dtl_id;";
				
				$para	= $db->QueryParam("	SET NOCOUNT ON
											BEGIN TRANSACTION;
											{$sql}
											COMMIT;", array());
			
			}
		}
		
		if( @$para ) {
			$re = array("success"					=> true,
						"msg"						=> $msg
			);
		} else {
			$re = array("success"					=> false,
						"msg"						=> $msg
			);
		}
	
		break;
}
echo json_encode($re);
exit;
?>
