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
	
		case "CANCEL" : // ยกเลิกเลขที่ฎีกา
			
			$msg		= "";
			$sql		= ""; 
			$c_cheques	= "";
			$arr_panda  = array();
			$dataC	= json_decode(@$_REQUEST["data"], true);
			if(is_array($dataC) && count($dataC) > 0) {
				$in	= "";
				foreach($dataC as $index => $jObj) {
					$in	.= ($in == "")? $jObj["cheque_id"] : ",".$jObj["cheque_id"];
					$arr_panda[] = $jObj["cheque_id"];
				}
				$c_cheques	= "(".$in.")";
			}
			  
			if ($_REQUEST["table_name"] == "imp_expense_hdr")
			{
				$tb_hdr_name 			= "imp_expense_hdr";
				$tb_dtl_name 			= "imp_expense_dtl";
				$tb_hdr_pk_name 		= "imp_expense_hdr_id"; 
				$tb_dtl_pk_name 		= "imp_expense_dtl_id"; 
				$i_cancel_doc_expense 	= 1; 
				$tb_item_name 			= "imp_expense_item";
				$tb_item_n_dc_pk_name	= "dc_expense_id";
				$tb_dc_name				= "dc_expense";
				$fields_gx_money		= "sum(f_inv+f_vat)";
				$fields_dtl_money		= "sum(b.f_inv+isnull(b.f_vat,0))";
				$fields_item_money		= "sum(e.f_inv+isnull(e.f_vat,0))";  
				
				$tb_chq_name			= "imp_expense_dtl_cheque";
				$tb_chq_pk_name 		= "imp_expense_dtl_cheque_id";
				$fields_chq_money		= "sum(chq.f_cheque)";
			}
			else
			{
				$tb_hdr_name 			= "imp_expense_vsn_hdr";
				$tb_dtl_name 			= "imp_expense_vsn_dtl";
				$tb_hdr_pk_name 		= "imp_expense_vsn_hdr_id";  
				$tb_dtl_pk_name 		= "imp_expense_vsn_dtl_id"; 
				$i_cancel_doc_expense 	= 2;
				$tb_item_name 			= "imp_expense_vsn_item";
				$tb_item_n_dc_pk_name	="dc_expense_acc_vsn_id";
				$tb_dc_name				="dc_expense_acc_vsn";	
				$fields_gx_money		= "sum(f_inv)";
				$fields_dtl_money		= "sum(b.f_inv)";
				$fields_item_money		= "sum(e.f_inv)"; 

				$tb_chq_name			= "imp_expense_vsn_dtl_cheque";
				$tb_chq_pk_name 		= "imp_expense_vsn_dtl_cheque_id";	
				$fields_chq_money_no_wht= "sum(chq.f_cheque)";
				$fields_chq_money		= "sum(chq.f_cheque+ISNULL(b.f_tax_personal,0))	"; 		
				$fields_wht				= "sum(b.f_tax_personal)"; 		
				$FIXED_WHT_DC_ACC_ID	= 1089;	/* 20102010110  เงินรับฝาก-ภาษีหัก ณ ที่จ่าย */
			}
			
			$cancel_dtl_id 				= @$_REQUEST["dtl_id"]; 
			$dc_user_update_id 			= $_SESSION ["user_id"];
			$dc_user_update_cost_id 	= $_SESSION ["dc_cost_id"];
			$gl_hdr_id_expense_cancel	=0;
			$gl_hdr_id_bank_cancel		=0;
			
			if ($cancel_dtl_id>0)
			{
					$doc_dtl = $db->GetDataBySQL("SELECT TOP 1
														 a.$tb_hdr_pk_name,a.gl_tran_hdr_id_bank_id,a.gl_tran_hdr_id
															,b.c_approve,ISNULL(b.i_status,1) AS i_status
															,ISNULL(b.imp_cancel_doc_expense_id,0) as imp_cancel_doc_expense_id
															,(SELECT TOP 1 i_is_post FROM gl_tran_hdr gg WHERE gg.gl_tran_hdr_id=a.gl_tran_hdr_id_bank_id and gg.i_enable=1 and gg.i_is_post>1 and LEFT(gg.c_code,1)='G') as i_is_post_gl_bank_id
															,(SELECT TOP 1 i_is_post FROM gl_tran_hdr gg WHERE gg.gl_tran_hdr_id=a.gl_tran_hdr_id and gg.i_enable=1 and gg.i_is_post>1 and LEFT(gg.c_code,1)='G') as i_is_post_gl_id 
														FROM $tb_hdr_name a INNER JOIN $tb_dtl_name b ON a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
														WHERE b.$tb_dtl_pk_name=? and LEFT(a.c_code,1)='I' and a.i_enable=1;", array ($cancel_dtl_id) );
				 
					$d_save_jv_cancel 					= $_REQUEST["d_save_jv_cancel"];
					$gl_dc_book_type_general_id_fixed 	= 3;
					$gl_dc_book_type_pay_id_fixed 		= 2;
					list( $yyyyc1,$mmc1,$ddc1) 			= explode("-",$d_save_jv_cancel);
					$c_yyyy_mmc1 						= $yyyyc1.$mmc1;  
						
						
				/* ============================== 1/2 ลงบัญชี กลับข้าง ของ GL [ ธนาคาร]    =============================== */
					
					if (($doc_dtl["i_status"]=="1") && ($d_save_jv_cancel!="")
						 && ($doc_dtl["imp_cancel_doc_expense_id"]=="0")   && ($doc_dtl["i_is_post_gl_bank_id"]=="3"))
					{

						
						$sqlBankCancel = "	
											SET NOCOUNT ON
											
											DECLARE @imp_expense_hdr_id 			as bigint 			= {$doc_dtl[$tb_hdr_pk_name]};
											DECLARE @d_save_date 					as varchar(10) 		= '{$d_save_jv_cancel}';
											DECLARE @strM 							as varchar(50) 		= '{$mmc1}';
											DECLARE @strY 							as varchar(4) 		= '" . ($yyyyc1 + 543) . "';
											DECLARE @create_id 						as bigint 			= {$dc_user_update_id};
											DECLARE @create_cost_id 				as bigint 			= {$dc_user_update_cost_id};
											DECLARE @gl_dc_book_type_id_bank_fixed 	as bigint 			= {$gl_dc_book_type_general_id_fixed};
											DECLARE @str_doc_approve 				as varchar(50) 		= '{$doc_dtl["c_approve"]}';
											DECLARE @i_cancel_doc_expense 			as tinyint			= {$i_cancel_doc_expense};
											
									/*insert gl_tran_hdr*/
									insert into gl_tran_hdr(c_ref_doc, gl_dc_book_type_id, d_doc_date
																, d_save_date, f_total_amt, table_pk_id
																, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
																, c_comment1, i_enable, i_type, i_is_post, i_is_close_year
																, i_is_reversing, i_close_year_type, i_preview
																, i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
																, dc_user_create_id, dc_user_create_cost_id, d_create
																, dc_user_update_id, dc_user_update_cost_id, d_update
																, i_cancel_doc_expense)
									select  a.c_code+ ' (ยกเลิกเงินฝากธนาคาร)'  as c_ref_doc
											, @gl_dc_book_type_id_bank_fixed as gl_dc_book_type_id
											, convert(datetime, @d_save_date, 102) as d_doc_date
											, convert(datetime, @d_save_date, 102) as d_save_date
											, isnull((select $fields_chq_money_no_wht from $tb_chq_name chq where $tb_chq_pk_name in $c_cheques), 0) as f_total_amt
											, a.$tb_hdr_pk_name as table_pk_id
											, '$tb_hdr_name' as table_name
											, 'ใบปะหน้า นำเข้าข้อมูลค่าใช้จ่าย' as table_detail
											, right(left(@d_save_date,7),2) as c_mm
											, left(@d_save_date,4) as c_yyyy
											, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
											, a.c_code+ '( ยกเลิกเงินฝากธนาคาร สำหรับฎีกาเลขที่ ' +@str_doc_approve+' )' as c_comment1
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
											, @i_cancel_doc_expense
									from $tb_hdr_name a
									where a.$tb_hdr_pk_name = ?;";
						
						$sqlBankCancel .= "SELECT @@IDENTITY as hdr_id"; 
						 
						
						$stmtBankCancel 		= $db->QueryParam ( $sqlBankCancel,array($doc_dtl[$tb_hdr_pk_name]) );
						$arr_gx_bank_cancel 	= $db->Fetch($stmtBankCancel);
						$gl_hdr_id_bank_cancel 	= $arr_gx_bank_cancel ["hdr_id"];  
					
						if ($gl_hdr_id_bank_cancel > 0) 
						{
							$sqlBankGXDtl1 = "	declare @imp_expense_hdr_id 	as bigint = ?;
												declare @hdr_id 				as bigint = ?;
												declare @imp_expense_dtl_id  	as bigint = ?;
						
									insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
															, dc_acc_id, f_dr, f_cr
															, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
															, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 
															, i_type_year,c_budget_year,dc_expense_budget_type_id
															, i_return)
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
										, 0 as i_type_year
										, NULL as c_budget_year
										, 0 as dc_expense_budget_type_id
										, 2 as i_return
									from (select 77 as dc_cost_acc_id
												,(select bank.dc_acc_id from dc_bank_acc_company bank where bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source) as dc_acc_id
												, 0.00 as f_dr
												, $fields_chq_money_no_wht  as f_cr 
											from $tb_hdr_name a
												inner join $tb_dtl_name b on a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
												inner join $tb_chq_name chq on chq.$tb_dtl_pk_name = b.$tb_dtl_pk_name  
											where a.$tb_hdr_pk_name = @imp_expense_hdr_id
													and b.$tb_dtl_pk_name = @imp_expense_dtl_id
													and chq.$tb_chq_pk_name in $c_cheques
											group by a.dc_bank_acc_company_id_source
										union
										select 77 as dc_cost_acc_id
											, (select bank.dc_acc_id from dc_bank_acc_company bank where bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_target) as dc_acc_id
											, $fields_chq_money_no_wht as f_dr
											, 0.00 as f_cr 
										from $tb_hdr_name a
											inner join $tb_dtl_name b on a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
											inner join $tb_chq_name chq on chq.$tb_dtl_pk_name = b.$tb_dtl_pk_name
										where a.$tb_hdr_pk_name = @imp_expense_hdr_id
												and b.$tb_dtl_pk_name = @imp_expense_dtl_id
												and chq.$tb_chq_pk_name in $c_cheques
										group by a.dc_bank_acc_company_id_target
										) a
									order by i_rank;";

							$stmt22 = $db->QueryParam ($sqlBankGXDtl1, array (
									$doc_dtl["$tb_hdr_pk_name"],
									$gl_hdr_id_bank_cancel,  
									$cancel_dtl_id
							) );
 
							
							if ($stmt22) {
								$code_gen = "GX"; 
								$arrParamBankGencode = array (
										$code_gen,
										$c_yyyy_mmc1,
										$dc_user_update_id,
										$dc_user_update_cost_id,
										$gl_hdr_id_bank_cancel 
								);
								$sqlGenCode = "EXEC SP_GEN_CODE ?,?,?,?,?;";
								$stmtGenCode = $db->QueryParam ( $sqlGenCode, $arrParamBankGencode );
								
								$arr_gen_code = $db->Fetch ($stmtGenCode);
								$c_code = $arr_gen_code ["c_code_gen"];
								$ref_id = $arr_gen_code ["reference_id"];
								
								if ($gl_hdr_id_bank_cancel == $ref_id) {
									
									$chk_gl_dtl_bank = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
																			,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
																			,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
																			,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
																	FROM gl_tran_hdr aa
																	WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id_bank_cancel)); 
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
											$gl_hdr_id_bank_cancel 
									) );
									$code_gen = $c_code;   
								}
							} 
						} 
				}
				
				/* ============================== 2/2 ลงบัญชี กลับข้าง ของ GL [ค่าใช้จ่าย]    =============================== */

 
				if (($doc_dtl["i_status"]=="1") && ($d_save_jv_cancel!="")
					 && ($doc_dtl["imp_cancel_doc_expense_id"]=="0")   && ($doc_dtl["i_is_post_gl_id"]=="3"))
				{
				  
					$sqlExpenseCancel = "	
										SET NOCOUNT ON
										
										DECLARE @imp_expense_hdr_id 			as bigint 			= {$doc_dtl[$tb_hdr_pk_name]};
										DECLARE @d_save_date 					as varchar(10) 		= '{$d_save_jv_cancel}';
										DECLARE @strM 							as varchar(50) 		= '{$mmc1}';
										DECLARE @strY 							as varchar(4) 		= '" . ($yyyyc1 + 543) . "';
										DECLARE @create_id 						as bigint 			= {$dc_user_update_id};
										DECLARE @create_cost_id 				as bigint 			= {$dc_user_update_cost_id};
										DECLARE @gl_dc_book_type_id_bank_fixed 	as bigint 			= {$gl_dc_book_type_pay_id_fixed};
										DECLARE @str_doc_approve 				as varchar(50) 		= '{$doc_dtl["c_approve"]}';
										DECLARE @i_cancel_doc_expense 			as tinyint			= {$i_cancel_doc_expense};
										
								/* insert gl_tran_hdr */
								insert into gl_tran_hdr (c_ref_doc, gl_dc_book_type_id, d_doc_date
															, d_save_date, f_total_amt, table_pk_id
															, table_name, table_detail, c_mm, c_yyyy, c_yyyy_mm
															, c_comment1, i_enable, i_type, i_is_post, i_is_close_year
															, i_is_reversing, i_close_year_type, i_preview
															, i_chk_gl_dtl, i_chk_gl_purchase, c_code, c_code_post
															, dc_user_create_id, dc_user_create_cost_id, d_create
															, dc_user_update_id, dc_user_update_cost_id, d_update
															, i_cancel_doc_expense)
								select  a.c_code+ ' (ยกเลิกฎีกา)'  as c_ref_doc
										, @gl_dc_book_type_id_bank_fixed as gl_dc_book_type_id
										, convert(datetime, @d_save_date, 102) as d_doc_date
										, convert(datetime, @d_save_date, 102) as d_save_date
										,isnull((select $fields_chq_money_no_wht from $tb_chq_name chq where $tb_chq_pk_name in $c_cheques), 0) as f_total_amt
										, a.$tb_hdr_pk_name as table_pk_id
										, '$tb_hdr_name' as table_name
										, 'นำเข้าข้อมูลค่าใช้จ่าย' as table_detail
										, right(left(@d_save_date,7),2) as c_mm
										, left(@d_save_date,4) as c_yyyy
										, left(@d_save_date,4)+right(left(@d_save_date,7),2) as c_yyyy_mm
										, a.c_code+ '( ยกเลิกฎีกาเลขที่ ' +@str_doc_approve+' )' as c_comment1
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
										, @i_cancel_doc_expense
								from $tb_hdr_name a
								where a.$tb_hdr_pk_name = ?;";
					
					$sqlExpenseCancel 			.= "SELECT @@IDENTITY as hdr_id"; 
					 
					$stmtExpenseCancel 			= $db->QueryParam($sqlExpenseCancel,array($doc_dtl[$tb_hdr_pk_name]) );
					$arr_gx_expense_cancel 		= $db->Fetch($stmtExpenseCancel);
					$gl_hdr_id_expense_cancel 	= $arr_gx_expense_cancel["hdr_id"];  

					if ($gl_hdr_id_expense_cancel > 0) 
					{
						$sqlBankGXDtl2 = "	declare @imp_expense_hdr_id 	as bigint = ?;
											declare @hdr_id 				as bigint = ?;
											declare @imp_expense_dtl_id  	as bigint = ?;


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
								, 0.00 as f_dr
								, $fields_chq_money as f_cr 
								, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id 
							from $tb_hdr_name a
								inner join $tb_dtl_name b on a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
								inner join $tb_dc_name c on c.$tb_item_n_dc_pk_name = b.$tb_item_n_dc_pk_name
								
								inner join $tb_chq_name chq on chq.$tb_dtl_pk_name = b.$tb_dtl_pk_name 
								
							where a.$tb_hdr_pk_name = @imp_expense_hdr_id  and isnull(b.i_many_doc,1)=1
								and b.$tb_dtl_pk_name=$cancel_dtl_id
								and chq.$tb_chq_pk_name in $c_cheques
							group by case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end
									, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id 
							UNION
							select 77 as dc_cost_acc_id
								, case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end	as 	dc_acc_id
								, 0.00 as f_dr
								, $fields_chq_money as f_cr 
								, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id
							from $tb_hdr_name a
								inner join $tb_dtl_name b on a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
								inner join $tb_item_name e on e.$tb_dtl_pk_name = b.$tb_dtl_pk_name
								inner join $tb_dc_name c on c.$tb_item_n_dc_pk_name = e.$tb_item_n_dc_pk_name 
								inner join $tb_chq_name chq on chq.$tb_dtl_pk_name = b.$tb_dtl_pk_name  
							where a.$tb_hdr_pk_name = @imp_expense_hdr_id  and b.i_many_doc=2
								and b.$tb_dtl_pk_name=$cancel_dtl_id
								and chq.$tb_chq_pk_name in $c_cheques
							group by case when (b.i_type_year=2) then ISNULL(c.dc_acc_id_overlap,0) else ISNULL(c.dc_acc_id,0) end
									, b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id;			
			
			  
								insert into gl_tran_dtl (i_rank, gl_tran_hdr_id, dc_cost_acc_id
														, dc_acc_id, f_dr, f_cr
														, i_type_person, dc_emp_id, dc_debtor_id,dc_creditor_id
														, i_is_nontax_exp,dc_product_id,pk_id1,pk_id2 
														, i_type_year,c_budget_year,dc_expense_budget_type_id
														, i_return)
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
									, 2 as i_return
								from (select 77 as dc_cost_acc_id
											,(select bank.dc_acc_id from dc_bank_acc_company bank where bank.dc_bank_acc_company_id=a.dc_bank_acc_company_id_source) as dc_acc_id
											, $fields_chq_money_no_wht  as f_dr
											, 0.00 as f_cr
											, 0 as i_type_person
											, 0 as dc_emp_id
											, 0 as dc_debtor_id
											, 0 as dc_creditor_id
											, 2 as i_is_nontax_exp
											, 0 as dc_product_id
											, 0 as pk_id1
											, 0 as pk_id2										
											, 0 as i_type_year,NULL as c_budget_year,0 as dc_expense_budget_type_id
										from $tb_hdr_name a
											inner join $tb_dtl_name b on a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
											inner join $tb_chq_name chq on chq.$tb_dtl_pk_name = b.$tb_dtl_pk_name  
										where a.$tb_hdr_pk_name = @imp_expense_hdr_id
												and b.$tb_dtl_pk_name = @imp_expense_dtl_id
												and chq.$tb_chq_pk_name in $c_cheques
										group by a.dc_bank_acc_company_id_source,b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id
									UNION										
									select 77 as dc_cost_acc_id
											,".$FIXED_WHT_DC_ACC_ID." as dc_acc_id
											, $fields_wht  as f_dr
											, 0.00 as f_cr
											, 0 as i_type_person
											, 0 as dc_emp_id
											, 0 as dc_debtor_id
											, 0 as dc_creditor_id
											, 2 as i_is_nontax_exp
											, 0 as dc_product_id
											, 0 as pk_id1
											, 0 as pk_id2										
											, 0 as i_type_year,NULL as c_budget_year,0 as dc_expense_budget_type_id
										from $tb_hdr_name a
											inner join $tb_dtl_name b on a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
											inner join $tb_chq_name chq on chq.$tb_dtl_pk_name = b.$tb_dtl_pk_name  
										where a.$tb_hdr_pk_name = @imp_expense_hdr_id
												and b.$tb_dtl_pk_name = @imp_expense_dtl_id
												and chq.$tb_chq_pk_name in $c_cheques
										group by b.i_type_year,b.c_budget_year,a.dc_expense_budget_type_id
									UNION   
										select 
											dc_cost_acc_id
											,dc_acc_id
											,0 as f_dr
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
									) a
								order by i_rank;";
 
						$stmt33 = $db->QueryParam ($sqlBankGXDtl2, array (
								$doc_dtl["$tb_hdr_pk_name"],
								$gl_hdr_id_expense_cancel,  
								$cancel_dtl_id
						) );

						
						if ($stmt33) {
							$code_gens = "GX"; 
							$arrParamEXPGencode = array (
									$code_gens,
									$c_yyyy_mmc1,
									$dc_user_update_id,
									$dc_user_update_cost_id,
									$gl_hdr_id_expense_cancel 
							);
							$sqlGenCodeEXP = "EXEC SP_GEN_CODE ?,?,?,?,?;";
							$stmtGenCodeEXP = $db->QueryParam ($sqlGenCodeEXP,$arrParamEXPGencode );
							
							$arr_gen_codeEXP = $db->Fetch ($stmtGenCodeEXP);
							$c_code_EXP = $arr_gen_codeEXP["c_code_gen"];
							$ref_id_EXP = $arr_gen_codeEXP["reference_id"];
							
							if ($gl_hdr_id_expense_cancel==$ref_id_EXP) {
								
								$chk_gl_dtl_exp = $db->GetDataBySQL("SELECT ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_acc_id,0)=0),0) as no_acc
																		,ISNULL((SELECT TOP 1 dd.gl_tran_hdr_id FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id and isnull(dd.dc_cost_acc_id,0)=0),0) as no_cost
																		,ISNULL((SELECT SUM(dd.f_dr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_dr
																		,ISNULL((SELECT SUM(dd.f_cr) FROM gl_tran_dtl dd WHERE dd.gl_tran_hdr_id=aa.gl_tran_hdr_id),0) as f_tot_cr
																FROM gl_tran_hdr aa
																WHERE aa.gl_tran_hdr_id=?", array($gl_hdr_id_expense_cancel)); 
								if (($chk_gl_dtl_exp["no_acc"]>0) || ($chk_gl_dtl_exp["no_cost"]>0) || ($chk_gl_dtl_exp["f_tot_dr"]!=$chk_gl_dtl_exp["f_tot_cr"]))
								{
									$i_success_jv_expense = 2;
								}
								else
								{
									$i_success_jv_expense = 1;
								}							
								 
								
								$sqlIMP = "UPDATE gl_tran_hdr SET c_code = ?,i_chk_gl_dtl=? WHERE gl_tran_hdr_id = ?;";
								
								$stmt3 = $db->QueryParam ($sqlIMP, array (
										$c_code_EXP,
										$i_success_jv_expense,
										$gl_hdr_id_expense_cancel 
								) );
								$code_gens = $c_code_EXP;   
							}
						} 
					} 
					
				}
				 
				
				
				/* ============================== 3 LOG เก็บการยกเลิกฎีกา   EPHIS / VISION NET  =============================== */
 			 
			  
				foreach($arr_panda as $index => $imp_chq_id) {

					if ($_REQUEST["table_name"] == "imp_expense_hdr")
					{
						// LOG เก็บการยกเลิกฎีกา   EPHIS  
						$arrParamLog[] = 1;
						$arrParamLog[] = $cancel_dtl_id;
						$arrParamLog[] = 0;
						$arrParamLog[] = 0; 
						$arrParamLog[] = $d_save_jv_cancel;
						$arrParamLog[] = $dc_user_update_id;
						$arrParamLog[] = $dc_user_update_cost_id;
						$arrParamLog[] = $gl_hdr_id_bank_cancel;
						$arrParamLog[] = $gl_hdr_id_expense_cancel;   
						$arrParamLog[] 		= $imp_chq_id;
						$arrParamLog[] 		= 0;
						$arrParamLog[] 		= 0;
					}
					else  
					{
						// LOG เก็บการยกเลิกฎีกา   VISION NET 
						$arrParamLog[] = 2;
						$arrParamLog[] = 0;
						$arrParamLog[] = $cancel_dtl_id;
						$arrParamLog[] = 0; 
						$arrParamLog[] = $d_save_jv_cancel;
						$arrParamLog[] = $dc_user_update_id;
						$arrParamLog[] = $dc_user_update_cost_id;
						$arrParamLog[] = $gl_hdr_id_bank_cancel;
						$arrParamLog[] = $gl_hdr_id_expense_cancel; 
						$arrParamLog[] 		= 0;
						$arrParamLog[] 		= $imp_chq_id;
						$arrParamLog[] 		= 0;
					}				
					  
					$sqlINSLog 		= "EXEC SP_LOG_CANCEL_DOCUMENT_CHEQUES ?,?,?,?,?,?,?,?,?,?,?,?;";
					$stmtLog 		= $db->QueryParam($sqlINSLog,$arrParamLog); 
					$arr_ins_log 	= $db->Fetch($stmtLog); 
					$cancel_id 		= $arr_ins_log["log_id"]; 
					$imp_chq_id 	= 0;
					unset($arrParamLog);
					
				}
				
				
			}
			 

			if ($cancel_id>0) { // สถานะจ่ายเงินของ cheque (1=จ่ายเงิน , 2 = ยกเลิก เช็ค และการจ่ายเงิน)
				
				// UPDATE สถานะ ยกเลิก cheque ที่เป็น GL
				$sql	.= "
							DECLARE @gl_tran_hdr_id AS  int 		= {$_REQUEST["gl_tran_hdr_id"]};
							DECLARE @hdr_id 		AS  int 		= {$_REQUEST["hdr_id"]};
							DECLARE @dtl_id 		AS  int 		= {$_REQUEST["dtl_id"]};
							DECLARE @cancel_id 		AS  int 		= {$cancel_id}; 
				
							  
							IF (@cancel_id > 0)
							BEGIN
								UPDATE $tb_dtl_name
									SET
										i_status =
											CASE
												WHEN (SELECT COUNT(*) FROM imp_cancel_doc_expense WHERE {$tb_dtl_pk_name} = {$cancel_dtl_id}) = 0
													THEN 1 /*ไม่มีสถานะเช็คยกเลิก*/
												WHEN (SELECT COUNT(*) FROM {$tb_chq_name} WHERE {$tb_dtl_pk_name} = {$cancel_dtl_id})
													= (SELECT COUNT(*) FROM imp_cancel_doc_expense WHERE {$tb_dtl_pk_name} = {$cancel_dtl_id})
													THEN 2 /*ยกเลิกเช็คทั้งหมด*/
												WHEN (SELECT COUNT(*) FROM {$tb_chq_name} WHERE {$tb_dtl_pk_name} = {$cancel_dtl_id})
													!= (SELECT COUNT(*) FROM imp_cancel_doc_expense WHERE {$tb_dtl_pk_name} = {$cancel_dtl_id})
													THEN 3 /*ยกเลิกเช็คบางใบ*/
											END
										,d_cancel_doc = GETDATE()
										,d_save_jv_cancel = '{$_REQUEST["d_save_jv_cancel"]}'
										,imp_cancel_doc_expense_id = @cancel_id 
									WHERE $tb_dtl_pk_name = $cancel_dtl_id;

								UPDATE $tb_chq_name
									SET i_status = 2 
									WHERE $tb_chq_pk_name in $c_cheques;									
							END
							
							SELECT 'TEST GL' AS c_code_post;";
				
				$para	= $db->QueryParam($sql, array());
				
				if( @$para ) {
					
					$rs	= $db->Fetch($para);
					
					$re = array("success"					=> true,
								"msg"						=> "บันทึกรายการ ".$rs["c_code_post"] 
					);
				} else {
					$re = array("success"					=> false,
								"msg"						=> "SQL ERROR"
					);
				}
			} else {
				$re = array("success"					=> false,
							"msg"						=> "รายการนี้เคยถูกยกเลิกฏีกาแล้ว"
				);
			}
				 	
			break;
	}
echo json_encode($re);
exit;
?>
