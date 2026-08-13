<?php
include("../conf/configGl.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
 
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$select		= null;
$flds		= null;
$groupBy	= null;

function List_QueryParam() {

	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy;
	
	$totalCount		= 0;
	$month_start	= sprintf("%02d%",$_REQUEST["month_start"],"");
	
	$CFG_ROW_DATA		= 1;
	$CFG_ROW_SUMMARY	= 2;
	$CFG_ROW_FINAL		= 3;
	$CFG_I_GROUP_FINAL	= 99;
	
	$f_Profit = $db->GetDataBySQL("SELECT 
											abs(sum(ISNULL(b.f_dr,0))-sum(ISNULL(b.f_cr,0))) as momo
										FROM gl_tran_hdr a
											INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
											INNER JOIN dc_acc acc ON acc.dc_acc_id=b.dc_acc_id
										WHERE  
											a.c_yyyy=".$_REQUEST["year_start"]." AND a.c_mm=".$month_start."
											AND a.i_is_post=".BOOK_ACC_GL."
											AND a.i_is_close_year=".GL_CLOSE_YEAR_NONE."
											AND a.i_enable=".STATUS_ENABLE."												 
											AND acc.i_group IN (4,5)  AND acc.i_level in (6) AND acc.i_enable = 1 AND acc.i_delete = 2  
											 
										", array());
 
	$f_Profit = ($f_Profit=="") ? "0.00" : $f_Profit; 
	
	$fixed_id_G1_LV1   = 1; 	/* 10000000000	สินทรัพย์ */
	$fixed_id_G2_LV1   = 423; 	/* 20000000000	หนี้สิน */
	$fixed_id_G3_LV1   = 483; 	/* 30000000000	ส่วนทุน */
 
	//-------------------------- เงื่อนไข Level ผังบัญชี --------------------------//
	switch ($_REQUEST["i_show_acc"]) {
		case "6"	:  //บัญชีย่อย lv6	
						$in = $con_acc = ""; 
						$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );	 
						if (! in_array ( "0", $for_id )) {
							$in = "";
							if (is_array ( $for_id )) {
								foreach ( $for_id as $val ) {
									$in .= ($in == "") ? $val : ", " . $val;
								}
								$con_acc .= ($in != "") ? " AND a.dc_acc_id IN (".$fixed_id_G1_LV1.",".$fixed_id_G2_LV1."," .$fixed_id_G3_LV1."," . $in . ")" : "";
							}
						}
		
		
						$index_sub 				= 3;
						$ww_acc_show 			= " WHERE i_group IN (".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")  AND i_level in (".GL_ACC_1ST_LEVEL.",".GL_ACC_6TH_LEVEL.") AND i_enable = ".STATUS_ENABLE." AND i_delete = ".DELETE_FALSE."; ";
						$ww_report_show			= " SELECT
														a.dc_acc_id
														,a.c_code
														,a.c_name
														,CASE
															WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") THEN ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0)
															WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.")  THEN ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0)
															WHEN (a.i_group=".GL_ACC_GROUP3_SHARE.") THEN  
																case
																	when (a.c_code='".GL_ACC_PROFIT_LV6_FIXED."') then ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) + ".$f_Profit."
																	else ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0)
																end  
															ELSE 0
														END AS f_money
														,a.i_group
														,".$CFG_ROW_DATA." as i_type
														,a.i_level
													FROM @Dc_acc a
													WHERE a.i_level IN (".GL_ACC_1ST_LEVEL.",".$_REQUEST["i_show_acc"].")
														".$con_acc."													
													GROUP BY  a.dc_acc_id,a.c_code,a.c_name,a.i_group,a.i_level;";
						$ww_report_summary_show = " SELECT a.dc_acc_id,a.c_code,cast ('รวม '+a.c_name as varchar(150)) as c_name,ISNULL((SELECT SUM(b.f_money) FROM @GL_MONEY_DETAILS b WHERE b.i_group=a.i_group GROUP BY b.i_group),0),a.i_group,".$CFG_ROW_SUMMARY." as i_type,a.i_level
													FROM @Dc_acc a
													WHERE a.i_level=".GL_ACC_1ST_LEVEL.";";													
				break;
		default 	: //บัญชีคุม lv2/3/4/5
						$in = $con_acc_control = "";
						$index_sub 				= 3;
						switch ($_REQUEST["i_show_acc"])
						{ 
							case "3" 	: 		$for_id 		= explode ( ";", $_REQUEST ["dc_acc_id_parent_lv3"] );
												$ww_acc_level	= "i_level in (1,3,4,5,6)";		
										break; 
							case "4" 	: 		$for_id 		= explode ( ";", $_REQUEST ["dc_acc_id_parent_lv4"] );
												$ww_acc_level	= "i_level in (1,4,5,6)";
										break; 
							case "5" 	: 		$for_id 		= explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
												$ww_acc_level	= "i_level in (1,5,6)";
										break; 
							case "2" 	:
							default 	: 		$for_id 		= explode ( ";", $_REQUEST ["dc_acc_id_parent_lv2"] );
												$ww_acc_level	= "i_level in (1,2,3,4,5,6)";	
									break;
									
						}
						
						if (  ($_REQUEST ["i_show_acc"]!="") && (! in_array ( "0", $for_id ))  )
						{  
							
							if (is_array ( $for_id )) {
								foreach ( $for_id as $val ) {
									$in .= ($in == "") ? $val : ", " . $val;
								}
								$con_acc_control .= ($in != "") ? " AND a.dc_acc_id IN (".$fixed_id_G1_LV1.",".$fixed_id_G2_LV1."," .$fixed_id_G3_LV1."," . $in . ")" : "";
							} 
						}
						
						
						$ww_acc_show 			= " WHERE i_group IN (".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.") ";
						/* $ww_acc_show 			.= " AND i_level in (".GL_ACC_1ST_LEVEL.",".$_REQUEST["i_show_acc"].",".GL_ACC_6TH_LEVEL.") ";  */
						$ww_acc_show 			.= " AND ".$ww_acc_level;
						$ww_acc_show 			.= " AND i_enable = ".STATUS_ENABLE." AND i_delete = ".DELETE_FALSE." ; ";
						
						$ww_report_show			= " SELECT
														a.dc_acc_id
														,a.c_code
														,a.c_name
														,CASE
															WHEN (a.i_level=6) THEN 
																					CASE
																						WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") THEN ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0)
																						WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.")  THEN ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0)
																						WHEN (a.i_group=".GL_ACC_GROUP3_SHARE.") THEN  
																							case
																								when (a.c_code='".GL_ACC_PROFIT_LV6_FIXED."') then ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) + ".$f_Profit."
																								else ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.dc_acc_id=a.dc_acc_id GROUP BY b.dc_acc_id),0)
																							end  
																						ELSE 0
																					END
															
															WHEN (a.i_level=5) THEN
																					CASE
																						WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") THEN ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0) - ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0)
																						WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.")  THEN ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0)
																						WHEN (a.i_group=".GL_ACC_GROUP3_SHARE.") THEN															
																							case
																								when (  (a.c_code='".GL_ACC_PROFIT_LV2_FIXED."') or (a.c_code='".GL_ACC_PROFIT_LV3_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV4_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV5_FIXED."') )  then ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0) + ".$f_Profit."
																								else  ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv5=a.c_sub_lv5 GROUP BY b.c_sub_lv5),0)
																							end 																
																						ELSE 0
																					END
															WHEN (a.i_level=4) THEN
																					CASE
																						WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") THEN ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0) - ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0)
																						WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.")  THEN ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0)
																						WHEN (a.i_group=".GL_ACC_GROUP3_SHARE.") THEN															
																							case
																								when (  (a.c_code='".GL_ACC_PROFIT_LV2_FIXED."') or (a.c_code='".GL_ACC_PROFIT_LV3_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV4_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV5_FIXED."') )  then ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0) + ".$f_Profit."
																								else  ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv4=a.c_sub_lv4 GROUP BY b.c_sub_lv4),0)
																							end 																
																						ELSE 0
																					END
															WHEN (a.i_level=3) THEN
																					CASE
																						WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") THEN ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0) - ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0)
																						WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.")  THEN ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0)
																						WHEN (a.i_group=".GL_ACC_GROUP3_SHARE.") THEN															
																							case
																								when (  (a.c_code='".GL_ACC_PROFIT_LV2_FIXED."') or (a.c_code='".GL_ACC_PROFIT_LV3_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV4_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV5_FIXED."') )  then ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0) + ".$f_Profit."
																								else  ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv3=a.c_sub_lv3 GROUP BY b.c_sub_lv3),0)
																							end 																
																						ELSE 0
																					END							
															WHEN (a.i_level=2) THEN
																					CASE
																						WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") THEN ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0) - ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0)
																						WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.")  THEN ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0)
																						WHEN (a.i_group=".GL_ACC_GROUP3_SHARE.") THEN															
																							case
																								when (  (a.c_code='".GL_ACC_PROFIT_LV2_FIXED."') or (a.c_code='".GL_ACC_PROFIT_LV3_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV4_FIXED."')  or (a.c_code='".GL_ACC_PROFIT_LV5_FIXED."') )  then ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0) + ".$f_Profit."
																								else  ISNULL((SELECT sum(b.f_end_cr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0) - ISNULL((SELECT sum(b.f_end_dr) FROM @Gl_money b WHERE b.c_sub_lv2=a.c_sub_lv2 GROUP BY b.c_sub_lv2),0)
																							end 																
																						ELSE 0
																					END							
																					
															ELSE 0
														END AS f_money		 
														,a.i_group
														,".$CFG_ROW_DATA." as i_type
														,a.i_level
													FROM @Dc_acc a 
													WHERE a.".$ww_acc_level."
															".$con_acc_control."
													GROUP BY a.dc_acc_id,a.c_code,a.c_name,a.i_group,a.c_sub,a.i_level
															,a.c_sub_lv5,a.c_sub_lv4,a.c_sub_lv3,a.c_sub_lv2;";
			$ww_report_summary_show = " SELECT a.dc_acc_id,a.c_code,cast ('รวม '+a.c_name as varchar(150)) as c_name,ISNULL((SELECT SUM(b.f_money) FROM @GL_MONEY_DETAILS b WHERE b.i_group=a.i_group  and b.i_level=6 GROUP BY b.i_group),0),a.i_group,".$CFG_ROW_SUMMARY." as i_type,a.i_level
										FROM @Dc_acc a
										WHERE a.i_level=".GL_ACC_1ST_LEVEL.";";
				break;
	}
	 
	
	$ww_report_debt_share_show		= " SELECT
											0 as dc_acc_id,NULL as c_code,cast ('รวมหนี้สินและส่วนของผู้ถือหุ้น' as varchar(150)) as c_name
											,ISNULL((SELECT SUM(b.f_money)
										FROM @GL_MONEY_DETAILS b
										WHERE b.i_group=".GL_ACC_GROUP2_DEBT." and b.i_type=".$CFG_ROW_SUMMARY." GROUP BY b.i_group),0) + ISNULL((SELECT SUM(b.f_money) FROM @GL_MONEY_DETAILS b WHERE b.i_group=".GL_ACC_GROUP3_SHARE." and b.i_type=".$CFG_ROW_SUMMARY." GROUP BY b.i_group),0),".$CFG_I_GROUP_FINAL." as i_group,".$CFG_ROW_FINAL." as i_type,1 as i_level";
	
	$sqlMain	= "	SET NOCOUNT ON
					DECLARE @Dc_acc TABLE( 
						dc_acc_id INT NULL, 
						c_code VARCHAR(250) NULL, 
						c_name VARCHAR(250) NULL,
						i_group tinyint NULL,
						c_sub VARCHAR(".$index_sub.") NULL,
						i_level tinyint NULL
						
						,c_sub_lv2 varchar(10) NULL
						,c_sub_lv3 varchar(10) NULL
						,c_sub_lv4 varchar(10) NULL
						,c_sub_lv5 varchar(10) NULL
					);
					
					DECLARE @Gl_money TABLE(
						dc_acc_id BIGINT NOT NULL,
						f_end_dr DECIMAL(18,2) NOT NUll,
						f_end_cr DECIMAL(18,2) NOT NUll,
						i_group tinyint NULL,
						c_sub VARCHAR(".$index_sub.") NULL
						
						,c_sub_lv2 varchar(10) NULL
						,c_sub_lv3 varchar(10) NULL
						,c_sub_lv4 varchar(10) NULL
						,c_sub_lv5 varchar(10) NULL
					);
		
					DECLARE @GL_MONEY_DETAILS TABLE( 
						dc_acc_id BIGINT NOT NUll,
						c_code VARCHAR(250) NUll,
						c_name VARCHAR(250) NOT NUll,
						f_money DECIMAL(18,2) NOT NUll,
						i_group tinyint NULL,
						i_type tinyint NULL,
						i_level tinyint NULL  
					); 			
				
					DECLARE @Gl_show TABLE(
						numrow NUMERIC(11,0) IDENTITY(1,1) NOT NULL,
						dc_acc_id BIGINT NOT NUll,
						c_code VARCHAR(250) NUll,
						c_name VARCHAR(250) NOT NUll,
						f_money DECIMAL(18,2) NOT NUll,
						i_group tinyint NULL,
						i_type tinyint NULL,
						i_level tinyint NULL  
					); 		
				
					/*dc_acc*/
					INSERT INTO @Dc_acc
					SELECT dc_acc_id,c_code,c_name,i_group,left(c_code,".$index_sub.") as c_sub,i_level
							,left(c_code,3) as c_sub_lv2
							,left(c_code,5) as c_sub_lv3
							,left(c_code,7) as c_sub_lv4
							,left(c_code,9) as c_sub_lv5					
					FROM dc_acc
					".$ww_acc_show."
			 		
					/*gl_money*/			
					INSERT INTO @Gl_money
					SELECT	a.dc_acc_id
							,SUM(ISNULL(a.f_end_dr,0)) as f_end_dr 
							,SUM(ISNULL(a.f_end_cr,0)) as f_end_cr
							,c.i_group
							,c.c_sub
							,c.c_sub_lv2
							,c.c_sub_lv3
							,c.c_sub_lv4
							,c.c_sub_lv5
					FROM gl_balance_cost a
					INNER JOIN @Dc_acc c ON a.dc_acc_id = c.dc_acc_id
					WHERE a.c_yyyy=".$_REQUEST["year_start"]." AND a.c_mm=".$month_start."
							AND a.i_is_post=".BOOK_ACC_GL."
							AND a.i_is_close_year=".GL_CLOSE_YEAR_NONE."
							AND 1=".STATUS_ENABLE."
					GROUP BY a.dc_acc_id,c.i_group,c.c_sub,c.c_code
							,c.c_sub_lv2,c.c_sub_lv3,c.c_sub_lv4,c.c_sub_lv5; 
				 
					 
				 
					INSERT INTO @GL_MONEY_DETAILS
					".$ww_report_show."
							
					INSERT INTO @GL_MONEY_DETAILS
					".$ww_report_summary_show."
							
					INSERT INTO @GL_MONEY_DETAILS
					".$ww_report_debt_share_show." 
				 
					
					INSERT INTO @Gl_show
					SELECT * FROM @GL_MONEY_DETAILS
					ORDER BY i_group ASC,i_type ASC,c_code ASC;					
					  
					SELECT * FROM @Gl_show;";

	$arrParam	= array();
 //echo $sqlMain;	 
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
	
			//=================================//
			$temp		= array();

			$temp["no"]				= ++$totalCount;
			$temp["dc_acc_id"]		= $row["dc_acc_id"];
			$temp["c_code"]			= $row["c_code"];
			$temp["c_name"]			= $row["c_name"];
			$temp["f_money"]		= $row["f_money"];
			$temp["i_group"]		= $row["i_group"];
			$temp["i_type"]			= $row["i_type"];
			$temp["i_level"]		= $row["i_level"];
 
		
			${$root}[]	= $temp;
			//=================================//
		}


	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root} ));
}

if($_REQUEST["type"] == "data") { echo List_QueryParam();exit; }
?>
