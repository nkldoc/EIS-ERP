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

	switch($mode) 
	{ 
		case "CANCEL_RQE" 	: // ยกเลิกบันทึกบัญชีตั้งหนี้ใบเบิก (GL) - ephis + VSN
		default 			:
			$msg		= "";
			$sql		= ""; 
			$c_cheques	= "";
			$arr_panda  = array();
			$gl_hdr_id_source =0;
			$gl_hdr_id_cancel =0;   
 
			  
			if ($_REQUEST["table_name"] == "imp_request_ephis_hdr")
			{ //ใบเบิก e-PHIS

				$tb_hdr_name 				= "imp_request_ephis_hdr";
				$tb_dtl_name 				= "imp_request_ephis_dtl";
				$tb_hdr_pk_name 			= "imp_request_ephis_hdr_id"; 
				$tb_dtl_pk_name 			= "imp_request_ephis_dtl_id"; 
				$i_cancel_doc_expense 		= 5; 
				$fields_chq_money_no_wht	="b.f_inv"; 
				$c_system_name				= "e-PHIS";
				$tb_item_name				= "imp_request_ephis_item";
				$vw_insert_gl				= "vw_ephis_request_item_gl";
				$vw_show_gl					= "vw_imp_group_request_ephis_dtl_jv";
			}
			else if ($_REQUEST["table_name"] == "imp_request_vsn_hdr")
			{ //ใบเบิก Vision Net

				$tb_hdr_name 				= "imp_request_vsn_hdr";
				$tb_dtl_name 				= "imp_request_vsn_dtl";
				$tb_hdr_pk_name 			= "imp_request_vsn_hdr_id"; 
				$tb_dtl_pk_name 			= "imp_request_vsn_dtl_id"; 
				$i_cancel_doc_expense 		= 6; 
				$fields_chq_money_no_wht	= "b.f_inv"; 
				$c_system_name				= "Vision Net";
				$tb_item_name				= "imp_request_vsn_item";
				$vw_insert_gl				= "vw_vsn_request_item_gl";
				$vw_show_gl					= "vw_imp_group_request_vsn_dtl_jv";
			}
			 
			
			$cancel_dtl_id 						= @$_REQUEST["dtl_id"]; 
			$dc_user_update_id 					= $_SESSION ["user_id"];
			$dc_user_update_cost_id 			= $_SESSION ["dc_cost_id"];  
			$gl_dc_book_type_general_id_fixed	= 3;
			
			if ($cancel_dtl_id>0)
			{
					$doc_dtl = $db->GetDataBySQL("SELECT TOP 1
														 	a.$tb_hdr_pk_name
															,(select top 1 gl_tran_hdr_id from $vw_show_gl where ".$tb_dtl_pk_name."=b.".$tb_dtl_pk_name.") as gl_tran_hdr_rq_id 
															,b.c_request
															,b.i_status
															,ISNULL(b.imp_cancel_request_id,0) as imp_cancel_request_id
															,(select ISNULL(jv.c_code_post,jv.c_code) from gl_tran_hdr jv where jv.gl_tran_hdr_id=a.gl_tran_hdr_rq_id ) as c_jv_code
															,a.c_code
															,(select sum(cc.f_dr) from $tb_item_name cc where cc.".$tb_dtl_pk_name."=b.".$tb_dtl_pk_name.") as f_inv 
															,CONVERT(VARCHAR,b.d_doc, 120) as d_doc
															,LEFT(b.c_creditor,80) as c_creditor
 														FROM $tb_hdr_name a INNER JOIN $tb_dtl_name b ON a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
														WHERE b.".$tb_dtl_pk_name."=? and LEFT(a.c_code,1)='I' and a.i_enable=1 and b.i_status=3;", array ($cancel_dtl_id) );
				  
					$d_save_jv_cancel 					= $_REQUEST["d_save_jv_cancel"]; 
					$gl_dc_book_type_pay_id_fixed 		= 2;
					list( $yyyyc1,$mmc1,$ddc1) 			= explode("-",$d_save_jv_cancel);
					$c_yyyy_mmc1 						= $yyyyc1.$mmc1; 
					$gl_hdr_id_source 					= $doc_dtl["gl_tran_hdr_rq_id"];						
					$panda								= $date->shot_date_from_db($doc_dtl["d_doc"]);
					 
				/* ============================== 1/1 ลงบัญชี กลับข้าง ของ GL [ ตั้งหนี้ใบเบิก e-PHIS]    =============================== */
					
					if (($d_save_jv_cancel!="") && ($doc_dtl["i_status"]=="3") && ($doc_dtl["imp_cancel_request_id"]=="0"))
					{  
						$sqlRequestCancel = "	
											SET NOCOUNT ON
											
											DECLARE @d_save_date 					as varchar(10) 		= '{$d_save_jv_cancel}';
											DECLARE @strM 							as varchar(50) 		= '{$mmc1}';
											DECLARE @strY 							as varchar(4) 		= '" . ($yyyyc1 + 543) . "';
											DECLARE @create_id 						as bigint 			= '{$dc_user_update_id}';
											DECLARE @create_cost_id 				as bigint 			= '{$dc_user_update_cost_id}';
											DECLARE @gl_dc_book_type_id_bank_fixed 	as bigint 			= '{$gl_dc_book_type_general_id_fixed}';
											DECLARE @str_doc_request 				as varchar(50) 		= '{$doc_dtl["c_request"]}';
											DECLARE @i_cancel_doc_expense 			as tinyint			= '{$i_cancel_doc_expense}';
											DECLARE @str_jv_source					as varchar(50) 		= '{$doc_dtl["c_jv_code"]}';  
											DECLARE @f_money						as decimal(18,2)	= '{$doc_dtl["f_inv"]}'; 
											DECLARE @d_doc_date 					as varchar(50) 		= '{$doc_dtl["d_doc"]}'; 
											DECLARE @c_request 						as varchar(50) 		= '{$doc_dtl["c_request"]}'; 
											DECLARE @c_panda 						as varchar(100) 	= '{$panda}'; 
											DECLARE @str_c_receiver					as varchar(80) 		= '{$doc_dtl["c_creditor"]}';
											
									/*insert gl_tran_hdr*/
									insert into gl_tran_hdr(c_ref_doc, gl_dc_book_type_id, d_doc_date
																, d_save_date, f_total_amt, table_pk_id
																, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
																, c_comment1, c_comment2, c_comment3
																, i_enable, i_type, i_is_post, i_is_close_year
																, i_is_reversing, i_close_year_type, i_preview
																, i_chk_gl_dtl, i_chk_gl_purchase
																, dc_user_create_id, dc_user_create_cost_id, d_create
																, dc_user_update_id, dc_user_update_cost_id, d_update
																, i_cancel_doc_expense)
									select  a.c_code+'(ยกเลิกใบเบิก '+@c_request+')'  as c_ref_doc
											, @gl_dc_book_type_id_bank_fixed as gl_dc_book_type_id
											, @d_doc_date as d_doc_date
											, convert(datetime, @d_save_date, 102) as d_save_date
											, @f_money as f_total_amt
											, a.$tb_hdr_pk_name as table_pk_id
											, '$tb_hdr_name' as table_name 
											, 'ยกเลิกตั้งหนี้ของใบเบิก $c_system_name '+'(ใบเบิก '+@c_request+')' as table_detail
											, right(left(@d_save_date,7),2) as c_mm
											, left(@d_save_date,4) as c_yyyy
											, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
											, 'ยกเลิกตั้งหนี้ของใบเบิก $c_system_name เลขที่: ' +@str_doc_request+' / วันที่ใบเบิก : '+ @c_panda as c_comment1
											, 'เลขที่นำเข้าใบเบิก $c_system_name : '+a.c_code+' ('+@str_jv_source+')' as c_comment2
											, 'ชื่อผู้รับเงิน : '+@str_c_receiver as c_comment3
											, 1 as i_enable
											, 2 as i_type
											, 2 as i_is_post
											, 2 as i_is_close_year
											, 2 as i_is_reversing
											, 9 as i_close_year_type
											, 1 as i_preview
											, 1 as i_chk_gl_dtl
											, 1 as i_chk_gl_purchase 
											, @create_id
											, @create_cost_id
											, getdate()
											, @create_id
											, @create_cost_id
											, getdate()
											, @i_cancel_doc_expense
									from $tb_hdr_name a
									where a.$tb_hdr_pk_name = ?;";
						
						$sqlRequestCancel .= "SELECT @@IDENTITY as hdr_id"; 
						 
						 
						$stmtRequestCancel 		= $db->QueryParam ($sqlRequestCancel,array($doc_dtl[$tb_hdr_pk_name]) );
						$arr_gx_request_cancel 	= $db->Fetch($stmtRequestCancel); 
						$gl_hdr_id_cancel 		= $arr_gx_request_cancel["hdr_id"];  
					
						if ($gl_hdr_id_cancel > 0) 
						{
							$sqlRQGXDtl = "	declare @request_hdr_id 	as bigint = ?;
											declare @hdr_id 			as bigint = ?;
											declare @request_dtl_id  	as bigint = ?;
											declare @fixed_dc_cost_id  	as bigint = ?;
						
									insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
															, dc_acc_id, f_dr, f_cr
															, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
															, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 
															, i_type_year,c_budget_year,dc_expense_budget_type_id
															, i_return)
									select ROW_NUMBER() OVER (ORDER BY f_dr desc,dc_acc_id asc) as i_rank
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
										, @request_hdr_id as pk_id1
										, @request_dtl_id as pk_id2
										, i_type_year
										, c_budget_year
										, dc_expense_budget_type_id
										, 2 as i_return
									from ( 
										select @fixed_dc_cost_id as dc_cost_acc_id
												,b.dc_acc_id_cr as dc_acc_id
												,SUM(b.f_cr)  as f_dr
												,0.00 as f_cr 
												,b.i_type_year
												,b.c_budget_year
												,b.dc_expense_budget_type_id
										from ".$vw_insert_gl." b  
										where b.".$tb_dtl_pk_name." = @request_dtl_id and b.dc_acc_id_cr>0
										group by b.dc_acc_id_cr,b.i_type_year,b.c_budget_year,b.dc_expense_budget_type_id
										union
											select @fixed_dc_cost_id as dc_cost_acc_id
												,c.dc_acc_id_dr as dc_acc_id
												,0.00 as f_dr 
												,SUM(c.f_dr) as f_cr
												,c.i_type_year
												,c.c_budget_year
												,c.dc_expense_budget_type_id 
											from ".$vw_insert_gl." c
											where c.".$tb_dtl_pk_name." = @request_dtl_id and c.dc_acc_id_dr>0
											group by c.dc_acc_id_dr,c.i_type_year,c.c_budget_year,c.dc_expense_budget_type_id 
										) a
									order by i_rank;";
							
							$arr_gx_dtl_param = array ($doc_dtl["$tb_hdr_pk_name"],
														$gl_hdr_id_cancel,  
														$cancel_dtl_id,
														77
													);
 						
							$stmt22 = $db->QueryParam ($sqlRQGXDtl,$arr_gx_dtl_param);
 
							
							if ($stmt22) {
								$code_gen = "GX"; 
								$arrParamRQGencode = array (
										$code_gen,
										$c_yyyy_mmc1,
										$dc_user_update_id,
										$dc_user_update_cost_id,
										$gl_hdr_id_cancel 
								);
								$sqlGenCode 	= "EXEC SP_GEN_CODE ?,?,?,?,?;";
								$stmtGenCode 	= $db->QueryParam ( $sqlGenCode, $arrParamRQGencode );
								
								$arr_gen_code 	= $db->Fetch ($stmtGenCode);
								$c_code 		= $arr_gen_code ["c_code_gen"];
								$ref_id 		= $arr_gen_code ["reference_id"];
								
								if ($gl_hdr_id_cancel == $ref_id) {
									
									$chk_gl_dtl_bank = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
																			,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
																			,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
																			,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
																	FROM gl_tran_hdr aa
																	WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id_cancel)); 
									if (($chk_gl_dtl_bank["no_acc"]>0) || ($chk_gl_dtl_bank["no_cost"]>0) || ($chk_gl_dtl_bank["f_tot_dr"]!=$chk_gl_dtl_bank["f_tot_cr"]))
									{
										$i_success_jv_bank = 2;
									}
									else
									{
										$i_success_jv_bank = 1;
									}							
									 
									
									$sqlIMP = "UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";
									//$sqlIMP .= " UPDATE $tb_dtl_name SET i_status = 9 WHERE $tb_dtl_pk_name=$cancel_dtl_id;";
									
									$stmt3 = $db->QueryParam ($sqlIMP, array (
											$c_code,
											$i_success_jv_bank,
											$gl_hdr_id_cancel 
									) );
									$code_gen = $c_code;   
								}
							} 
						} 

						/* ============================== 3 LOG เก็บการยกเลิกใบเบิก   EPHIS / VISION NET  =============================== */
			 
				if ($_REQUEST["table_name"] == "imp_request_ephis_hdr")
				{
					// LOG เก็บการยกเลิกใบเบิก   EPHIS  
					$arrParamLog[] = 5;
					$arrParamLog[] = $cancel_dtl_id;
					$arrParamLog[] = 0; 
					$arrParamLog[] = $d_save_jv_cancel;
					$arrParamLog[] = $dc_user_update_id;
					$arrParamLog[] = $dc_user_update_cost_id;
					$arrParamLog[] = $gl_hdr_id_source;
					$arrParamLog[] = $gl_hdr_id_cancel;    
					$arrParamLog[] = @$_REQUEST["c_reason"];
				}
				else  
				{
					// LOG เก็บการยกเลิกใบเบิก   VISION NET 
					$arrParamLog[] = 6; 
					$arrParamLog[] = 0; 
					$arrParamLog[] = $cancel_dtl_id;
					$arrParamLog[] = $d_save_jv_cancel;
					$arrParamLog[] = $dc_user_update_id;
					$arrParamLog[] = $dc_user_update_cost_id; 
					$arrParamLog[] = $gl_hdr_id_source;
					$arrParamLog[] = $gl_hdr_id_cancel;
					$arrParamLog[] = @$_REQUEST["c_reason"];   					
				}				
					
				$sqlINSLog 		= "EXEC SP_LOG_CANCEL_REQUEST ?,?,?,?,?,?,?,?,?;"; 
				$stmtLog 		= $db->QueryParam($sqlINSLog,$arrParamLog); 
				$arr_ins_log 	= $db->Fetch($stmtLog); 
				$cancel_id 		= $arr_ins_log["log_id"];  
 
				$sqlIMPDtls 	= " UPDATE $tb_dtl_name 
									SET i_status = ?,imp_cancel_request_id = ?,d_save_jv_cancel=convert(datetime,'".$_REQUEST["d_save_jv_cancel"]."', 102),d_cancel_doc=GETDATE()
									WHERE $tb_dtl_pk_name=?;";
 

				$stmtDtls 	= $db->QueryParam ($sqlIMPDtls, array (9,$cancel_id,$cancel_dtl_id) );
 
				unset($arrParamLog);
			 
					if ($cancel_id>0) 
					{   
						
						if( @$stmtLog ) { 
							$re = array("success"					=> true,
										"msg"						=> "บันทึกยกเลิกใบเบิกเสร็จสิ้น และเลขที่บันทึกบัญชี : ".$code_gen 
							);
						} else {
							$re = array("success"					=> false,
										"msg"						=> "SQL ERROR"
							);
						}
					} else {
						$re = array("success"					=> false,
									"msg"						=> "รายการนี้เคยถูกยกเลิกใบเบิกแล้ว"
						);
					}
				}
			}
			else
			{
				$re = array("success"					=> false,
							"msg"						=> "NO DTL_ID"
						);
			}
				 
			  	
			break;
	}
echo json_encode($re);
exit;
?>