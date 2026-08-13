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

		case "CANCEL_RQV_SPECIAL" 	: // ยกเลิกใบเบิกพิเศษ (ก่อนเป็นGL) - ephis + VSN
		default						:	
			$msg		= "";
			$sql		= ""; 
			$c_cheques	= "";
			$arr_panda  = array();
			$gl_hdr_id_source =0;
			$gl_hdr_id_cancel =0;   
 
			  
			if ($_REQUEST["table_name"] == "imp_request_ephis_hdr")
			{ //ใบเบิกพิเศษ e-PHIS

				$tb_hdr_name 				= "imp_request_ephis_hdr";
				$tb_dtl_name 				= "imp_request_ephis_dtl";
				$tb_hdr_pk_name 			= "imp_request_ephis_hdr_id"; 
				$tb_dtl_pk_name 			= "imp_request_ephis_dtl_id"; 
				$i_cancel_doc_expense 		= 7; 
				$fields_chq_money_no_wht	= "b.f_inv"; 
				$c_system_name				= "e-PHIS"; 
			}
			else if ($_REQUEST["table_name"] == "imp_request_vsn_hdr")
			{ //ใบเบิกพิเศษ Vision Net

				$tb_hdr_name 				= "imp_request_vsn_hdr";
				$tb_dtl_name 				= "imp_request_vsn_dtl";
				$tb_hdr_pk_name 			= "imp_request_vsn_hdr_id"; 
				$tb_dtl_pk_name 			= "imp_request_vsn_dtl_id"; 
				$i_cancel_doc_expense 		= 8; 
				$fields_chq_money_no_wht	= "b.f_inv"; 
				$c_system_name				= "Vision Net"; 
			}
			 
			
			$cancel_dtl_id 						= @$_REQUEST["dtl_id"]; 
			$dc_user_update_id 					= $_SESSION ["user_id"];
			$dc_user_update_cost_id 			= $_SESSION ["dc_cost_id"];  
			$c_date_now							= date("Y-m-d H:i:s");

			if ($cancel_dtl_id>0)
			{
					$doc_dtl = $db->GetDataBySQL("SELECT TOP 1
														 	a.$tb_hdr_pk_name  
															,LEFT(b.c_request,1) AS c_sub_rq
															,b.c_request_desc
															,b.i_status
															,ISNULL(b.imp_cancel_request_id,0) as imp_cancel_request_id 
 														FROM $tb_hdr_name a INNER JOIN $tb_dtl_name b ON a.$tb_hdr_pk_name = b.$tb_hdr_pk_name
														WHERE b.".$tb_dtl_pk_name."=? and LEFT(a.c_code,1)='I' and a.i_enable=1;", array ($cancel_dtl_id) );
				  
					/* ============================== 3 LOG เก็บการยกเลิกใบเบิก   EPHIS / VISION NET  =============================== */
			 
					if ($_REQUEST["table_name"] == "imp_request_ephis_hdr")
					{
						// LOG เก็บการยกเลิกใบเบิก   EPHIS  
						$arrParamLog[] = 7;
						$arrParamLog[] = $cancel_dtl_id;
						$arrParamLog[] = 0; 
						$arrParamLog[] = $c_date_now;
						$arrParamLog[] = $dc_user_update_id;
						$arrParamLog[] = $dc_user_update_cost_id;
						$arrParamLog[] = "0";
						$arrParamLog[] = "0";   
						$arrParamLog[] = @$_REQUEST["c_reason"];
					}
					else  
					{
						// LOG เก็บการยกเลิกใบเบิก   VISION NET 
						$arrParamLog[] = 8; 
						$arrParamLog[] = 0; 
						$arrParamLog[] = $cancel_dtl_id;
						$arrParamLog[] = $c_date_now;
						$arrParamLog[] = $dc_user_update_id;
						$arrParamLog[] = $dc_user_update_cost_id; 
						$arrParamLog[] = "0";
						$arrParamLog[] = "0";	
						$arrParamLog[] = @$_REQUEST["c_reason"];				
					}
					
					$sqlINSLog 		= "EXEC SP_LOG_CANCEL_REQUEST ?,?,?,?,?,?,?,?,?;"; 
					$stmtLog 		= $db->QueryParam($sqlINSLog,$arrParamLog); 
					$arr_ins_log 	= $db->Fetch($stmtLog); 
					$cancel_id 		= $arr_ins_log["log_id"]; 
					unset($arrParamLog); 
	  
					if ($cancel_id>0) 
					{   
						
						if ($doc_dtl["c_sub_rq"]!="")					
						{ //GEN เลขที่ตั้งหนี้แบบพิเศษแล้ว ปรับไม่ใช้งาน
							$sql_upd_rq = "UPDATE $tb_dtl_name SET i_status=8,dc_user_update_id=?,dc_user_update_cost_id=?,d_update=?,imp_cancel_request_id = ?,d_cancel_doc=GETDATE() WHERE $tb_dtl_pk_name=?";
							$stmtRQ 	= $db->QueryParam ($sql_upd_rq, array ($dc_user_update_id,$dc_user_update_cost_id,$c_date_now,$cancel_id,$cancel_dtl_id) );
							$c_txt		= " (ไม่ใช้งาน)";
						}
						else
						{ //ยังไม่ GEN เลขที่ตั้งหนี้แบบพิเศษ  ลบจริง
							$sql_del_rq = "DELETE FROM $tb_dtl_name WHERE $tb_dtl_pk_name=?";
							$stmtRQ 	= $db->QueryParam ($sql_del_rq, array ($cancel_dtl_id) );
							$c_txt		= " (ลบ)";
						}


						if( @$stmtLog ) { 
							$re = array("success"					=> true,
										"msg"						=> "บันทึกยกเลิกใบเบิกพิเศษเสร็จสิ้น $c_txt"
							);
						} else {
							$re = array("success"					=> false,
										"msg"						=> "SQL ERROR"
							);
						}
					} 
					else {
						$re = array("success"					=> false,
									"msg"						=> "รายการนี้เคยถูกยกเลิกใบเบิกแล้ว"
						);
					} 


			} //end cancel_dtl_id

		break;
	} //end switch
echo json_encode($re);
exit;
?>