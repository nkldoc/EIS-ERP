<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db		= new DatabaseServer();
$date	= new i_date();
$util	= new apiUtil();

// ========================= S A V E =============================== //

$mode		= @$_REQUEST["mode"];
$data 		= $util->mnUser($_REQUEST);
$addField	= null;
$addValue	= null;
$arrValue	= array();
  
$step				= $_REQUEST["step"];	// เริมต้น = 0
$stepAll			= 4;					// step Processed ทั้งหมด
$month				= $_REQUEST["month"];
$year				= $_REQUEST["year"];

 
$prev_month			= (($month=="1") || ($month=="01")) ? 12 		: sprintf("%02d%",$month-1,"");
$prev_year			= (($month=="1") || ($month=="01")) ? $year-1 	: $year; 
 

$cur_month			= sprintf("%02d%",$month,"");

$table				= "gl_balance_cost";
$table_ip			= "gl_tran_hdr";
$table_ip_pk_name	= "gl_tran_hdr_id";


$keyYear			= "c_yyyy";
$keyMonth			= "c_mm";
$keyCloseYear 		= "i_is_close_year";
$keyPost			= "i_is_post"; 
$keyEnable			= "i_enable"; 
$keyCode			= "c_code";
$keyCodePost		= "c_code_post";


$c_yyyy_mm			= (string) $year.$cur_month;
$i_close_year_log	= GL_CLOSE_YEAR_NONE; 
$arr_qty			= array((string) $year,$cur_month,BOOK_ACC_GX,STATUS_ENABLE,BOOK_ACC_GX_CODE,GL_CLOSE_YEAR_NONE,(string) $year,$cur_month,BOOK_ACC_GL,STATUS_ENABLE,BOOK_ACC_GL_CODE,GL_CLOSE_YEAR_NONE,(string) $year,$prev_month);
$data_qty 			= $db->GetDataBySQL("SELECT 1 as c_temp
,ISNULL((select top 1 {$table_ip_pk_name} from {$table_ip} where $keyYear = ? and $keyMonth=? and $keyPost=? and $keyEnable=? and left($keyCode,2)=?  and $keyCloseYear=?),0) as id_top1_gx
,ISNULL((select top 1 {$table_ip_pk_name} from {$table_ip} where $keyYear = ? and $keyMonth=? and $keyPost=? and $keyEnable=? and left($keyCodePost,2)=?  and $keyCloseYear=?),0) as id_top1_gl
,ISNULL((SELECT SUM(f_end_dr+f_end_cr) FROM {$table} WHERE $keyYear = ? and $keyMonth=?),0) as f_end_prev_month
",$arr_qty);
$CFG_NOT_PROCESS_CAL		= 0;


switch ($mode) {
	
	case "SAVE" : 
		
		// ----------[1/3] สถานะมี GX / GL ในข้อมูลนำเข้า ก่อนประมวลผล ----------
		if ( (is_array($data_qty))  && (count($data_qty)>0) )
		{ // ไม่ประมวล ถ้ามีทั้ง GX และ GL ในเดือนเดียวกัน 
			$i_post = $CFG_NOT_PROCESS_CAL;
			
			if ( ($data_qty["id_top1_gx"]>0) && ($data_qty["id_top1_gl"]==0) ) 
			{ // ประมวล GX เมื่อ GX > 0 && GL=0 เท่านั้น
				$i_post = BOOK_ACC_GX;
			}
			else if ( ($data_qty["id_top1_gx"]==0) && ($data_qty["id_top1_gl"]>0) ) 
			{ // ประมวล GL เมื่อ GX=0   && GL > 0 เท่านั้น
				$i_post = BOOK_ACC_GL;
			}
			else if ( ($data_qty["id_top1_gx"]==0) && ($data_qty["id_top1_gl"]==0) && ($data_qty["f_end_prev_month"]>0) ) 
			{ // ประมวล เฉพาะยอดยกมา เมื่อมียอดยกไปจากเดือนก่อน และ GX =0  && GL=0 เท่านั้น
				$i_post = BOOK_ACC_NOT_POST;
			}
			else
			{
				//TEST 4 IMPORT-GL รายได้
				// ประมวล เฉพาะยอดยกมา เมื่อมียอดยกไปจากเดือนก่อน และ GX =0  && GL=0 เท่านั้น
				$i_post = BOOK_ACC_NOT_POST;	
			}
		 
		} // END ARRAY data_qty
		else
		{
			//TEST 4 IMPORT-GL รายได้
			// ประมวล เฉพาะยอดยกมา เมื่อมียอดยกไปจากเดือนก่อน และ GX =0  && GL=0 เท่านั้น
			$i_post = BOOK_ACC_NOT_POST;
			
		}
 
 
 
		// ----------[2/3] SP ไว้ ประมวลผลบัญชี ---------- 
		switch ($cur_month)
		{
			/*
			case "1" 	:  
			case "01" 	: 
			*/
			case "10" 	:			
							if ($i_post>$CFG_NOT_PROCESS_CAL) 
							{ /*code & ใน SP เดิมไม่ได้เปลี่ยน */
								
								$arr_13			= array($prev_year,$prev_month,GL_CLOSE_YEAR_PERIOD,3,STATUS_ENABLE);
			 					$qty_close13 	= $db->GetDataBySQL("SELECT count({$table_ip_pk_name}) FROM {$table_ip} 
													WHERE $keyYear = ? and $keyMonth=? and $keyCloseYear=? 
													and $keyPost=? and $keyEnable=? ;",$arr_13);
								$db->BeginTran();
								
								switch ($qty_close13)
								{
									case 3 :
									case 4 :	$SP_NAME_STEP1 = "SP_GL_BALANCE_COST_P1";
										break;
									default : 	$SP_NAME_STEP1 = "";
										break;
								}
								  
								$db->CommitTran();
								$re = array(
										"reval"			=> 0,
										"success"		=> "Success",
										"msg"			=> "commit"
								);
							}
													
						break;
			/*case "12" 	: */	
			case "9" 	:  
			case "09" 	: 				
								if ($i_post>$CFG_NOT_PROCESS_CAL)
								{  /*code & ใน SP เดิมไม่ได้เปลี่ยน */
									$i_post_period13 = BOOK_ACC_GL;
									$arr_13			= array($year,$month,GL_CLOSE_YEAR_PERIOD,$i_post_period13,STATUS_ENABLE);
									$qty_close13 	= $db->GetDataBySQL("SELECT count({$table_ip_pk_name}) FROM {$table_ip} 
														WHERE $keyYear = ? and $keyMonth=? and $keyCloseYear=? and $keyPost=? 
														and $keyEnable=? ;",$arr_13);
									$db->BeginTran();
										
									switch ($qty_close13)
									{
										case 3 :
										case 4 :	$SP_NAME_STEP1 		= "SP_GL_BALANCE_COST_P13"; 			
													$i_post 			= $i_post_period13;						
													$i_close_year_log 	= GL_CLOSE_YEAR_PERIOD;
										break;
										default : 	$SP_NAME_STEP1 = "SP_GL_BALANCE_COST_P2_12";		
										break;
									}
									
									$db->CommitTran();
									$re = array(
											"reval"			=> 0,
											"success"		=> "Success",
											"msg"			=> "commit"
									);
								}					
						break;
				default 	: 
								if ($i_post>$CFG_NOT_PROCESS_CAL) 
								{ /*code & ใน SP เดิมไม่ได้เปลี่ยน */
									$SP_NAME_STEP1 = "SP_GL_BALANCE_COST_P2_12"; 
								}
						break;
		} //END switch cur_month
		
		
		
		// ----------[3/3] ประมวลผล ----------		
		switch ($step) {
			case 0 :
						$step	= $step + 1;
		 		break;
			case 1 :
						$step	= $step + 1;
						if ($i_post>$CFG_NOT_PROCESS_CAL) 
						{
							$db->BeginTran();
								
							$iInsPeriod = $db->Query("EXEC {$SP_NAME_STEP1} '{$prev_month}','{$prev_year}','{$cur_month}','{$year}',{$i_post};");
								
							if ($iInsPeriod)
							{
								$db->CommitTran();
								$re = array(
										"reval"			=> 0,
										"success"		=> "Success",
										"msg"			=> "commit"
								);
							}
							else
							{
								$db->RollBackTran();
								$re = array(
										"reval"			=> 1,
										"success"		=> "Error",
										"msg"			=> "check statement : {$sql}"
								);
							}
							
						}
				break;
			case 2 :
					$step	= $step + 1;
					if ($i_post>$CFG_NOT_PROCESS_CAL)
					{
						$db->BeginTran();
						$SP_NAME_STEP2 	= "SP_GL_BALANCE_COST_LOG";
						$i_ok			= STATUS_ENABLE;
						$iProcessOk 	= $db->Query("EXEC {$SP_NAME_STEP2} '{$cur_month}','{$year}',{$i_post},{$i_close_year_log},{$i_ok},$data[dc_user_update_id],$data[dc_user_update_cost_id];");
		 
						if ($iProcessOk)
						{  
							$db->CommitTran();
							$re = array(
									"reval"			=> 0,
									"success"		=> "Success",
									"msg"			=> "commit"
							);
						}
						else
						{
							 
							$db->RollBackTran();
							$re = array(
									"reval"			=> 1,
									"success"		=> "Error",
									"msg"			=> "check statement : {$sql}"
							);
						}
							
					}			
					break;
			case 3 :
					$step	= $step + 1;
				break;
					
			default:
				$step	= $stepAll+1;
				break;
		}		

		//remove after TOO
		$db->Query("update gl_balance_cost set i_is_post=3;");
 

		$re = array(
				"success"		=> true,
				"Processed"		=> $step,
				"total"			=> $stepAll,
				"msg"			=> "commit"
		);
		
		echo json_encode($re);
		exit;
		break;
		
	default : break;
}
?>
