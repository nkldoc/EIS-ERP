<?php
include("../../conf/config.php");
include("../../gl/conf/configGl.php");
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
	$con1			= null;
	$con2			= null;
	$con3			= null;
	$con4			= null;
	$con5			= null;
	$con_post		= null;
	// ========================================================================================== //
	// ====== เลือกเฉพาะบัญชี คุม หรือ ย่อย อย่างเดียว ====== //
	$con_acc3 = $con_acc2 = null;

	if($_REQUEST["i_show_acc"]==1) { // บัญชีคุม
		$cc_id	= explode(";", $_REQUEST["dc_acc_id_parent"]);
		if( !in_array("0", $cc_id ) ) {
			$arr_id	= "";
			if (is_array($cc_id)) {
				foreach( $cc_id as $val ) { $arr_id	.= ( $arr_id == "" )? $val : ", ".$val; }
				$con_acc3	.= " AND a.dc_acc_lv4_id IN (".$arr_id.")";
			}
		}
	} else if($_REQUEST["i_show_acc"] == 2) { // บัญชีย่อย
		$cc_id	= explode(";", $_REQUEST["dc_acc_id"]);
		if( !in_array("0", $cc_id ) ) {
			$arr_id	= "";
			if (is_array($cc_id)) {
				foreach( $cc_id as $val )  { $arr_id	.= ( $arr_id == "" )? $val : ", ".$val; }
				$con_acc2	.= " AND b.dc_acc_id IN (".$arr_id.")";
				$con_acc3	.= " AND a.dc_acc_id IN (".$arr_id.")";
			}
		}
	}
	
	$con2 = $con_acc2;
	$con3 = $con_acc3;
	
	if($_REQUEST["i_show_year"] == 1) {
		$conGroup	= "";
		
		if($_REQUEST["i_group1"] > 1) {
			$conGroup .= "AND b.dc_acc_id IN (
							SELECT aa.dc_acc_id FROM dc_expense aa INNER JOIN dc_acc bb ON aa.dc_acc_id = bb.dc_acc_id
								WHERE aa.i_enable = ".STATUS_ENABLE." AND aa.i_delete = ".DELETE_FALSE."
									AND bb.i_enable = ".STATUS_ENABLE." AND bb.i_delete = ".DELETE_FALSE."
									AND bb.i_group IN (1,2,3,4)
							UNION ALL
							SELECT aa.dc_acc_id FROM dc_expense_acc_vsn aa INNER JOIN dc_acc bb ON aa.dc_acc_id = bb.dc_acc_id
								WHERE aa.i_enable = ".STATUS_ENABLE." AND aa.i_delete = ".DELETE_FALSE."
									AND bb.i_enable = ".STATUS_ENABLE." AND bb.i_delete = ".DELETE_FALSE."
									AND bb.i_group IN (1,2,3,4)
							UNION ALL
							SELECT bb.dc_acc_id FROM dc_acc bb
								WHERE bb.i_enable = ".STATUS_ENABLE." AND bb.i_delete = ".DELETE_FALSE."
									AND bb.i_group = 5 AND bb.i_level = 6 )";
			$con2 .= $conGroup;
			$con3 .= $conGroup;
		}
		
		$gSql	= "";
		
		for($ii=1;$ii<=2;$ii++) {
			
			$gg		= "";
			$i_group	= ($ii == 1)? "1,2,3,4" : "5";
			
			if($_REQUEST["i_group".$ii] == 2) {
				$gg	.= "AND aa.i_type_year IS NOT NULL AND ISNULL(aa.i_type_year,0) > 0
						AND aa.c_budget_year IS NOT NULL
						AND ISNULL(aa.dc_expense_budget_type_id,0) > 0";
			} else if($_REQUEST["i_group".$ii] == 3) {
				$gg	.= "AND aa.i_type_year IS NULL
						AND aa.c_budget_year IS NULL
						AND aa.dc_expense_budget_type_id IS NULL";
			} else if($_REQUEST["i_group".$ii] == 4) {
				$gg	.= "AND (	(aa.i_type_year IS NULL AND ISNULL(aa.dc_expense_budget_type_id,0) > 0)
								OR
								(aa.i_type_year IS NOT NULL AND aa.dc_expense_budget_type_id IS NULL))";
			}
			
			$gSql	.= ($gSql == "")? "" : "UNION ALL "; 
			$gSql	.= " SELECT aa.gl_tran_dtl_id FROM gl_tran_dtl aa
							INNER JOIN dc_acc bb ON aa.dc_acc_id = bb.dc_acc_id
						WHERE bb.i_group IN ({$i_group}) AND bb.i_level = 6
							AND bb.i_enable = ".STATUS_ENABLE." AND bb.i_delete = ".DELETE_FALSE."
						{$gg} ";
		}
		
		$con2 .= " AND b.gl_tran_dtl_id IN ({$gSql}) ";
	}
	
	$dc_cost_id	= explode(";", $_REQUEST["dc_cost_id"]);
	if( !in_array( "0", $dc_cost_id ) ) {
		$in_cost	= "";
		foreach( $dc_cost_id as $val ) { $in_cost	.= ( $in_cost == "" )? $val : ", ".$val; }
		$con1	.= " AND aa.dc_cost_acc_id IN (".$in_cost.")";
		$con2	.= " AND b.dc_cost_acc_id IN (".$in_cost.")";
		$con5	.= " AND aa.dc_cost_acc_id IN (".$in_cost.")";
	}
	
	$dc_user_id	= explode(";", $_REQUEST["dc_user_id"]);
	if( !in_array( "0", $dc_user_id ) ) {
		$in_user	= "";
		foreach( $dc_user_id as $val ) { $in_user	.= ( $in_user == "" )? $val : ", ".$val; }
		$con2	.= " AND a.dc_user_create_id IN (".$in_user.")";
	}
	
	if( $_REQUEST["i_is_nontax_exp"] == 3 ) { $con2 .= " AND b.i_is_nontax_exp=1"; }
 
	$con_post	= ($_REQUEST["i_is_post"] > 1)? " a.i_is_post = ".$_REQUEST["i_is_post"] : " a.i_is_post IN (2,3)";
 
	switch ($_REQUEST["i_show_reports"])
	{
		case "4" :
					$con4 .= " AND (f_cr > 0 OR f_dr > 0 OR ISNULL(f_balance,0)!=0)";
					break;
		case "1" : 
		case "2" : 
		case "3" :  
		default  :	$con4 .= "";
				break;				
	}
	
	if($_REQUEST["i_close_year"]!=3) { $con2 .= " AND a.i_is_close_year=".$_REQUEST["i_close_year"]; }
	
	$sqlMain	= "	DECLARE @d_save_date_start VARCHAR(100) = '{$_REQUEST["date_start"]}';
					DECLARE @d_save_date_end VARCHAR(100)   = '{$_REQUEST["date_end"]}';
					
					DECLARE @mm_s INT 	= ''; 
					DECLARE @yyyy_s INT = ''; 
					DECLARE @yyyy_start_gl VARCHAR(10) = '{$_REQUEST["year_start_gl"]}';
					
					SET NOCOUNT ON
  
					SELECT 	   @mm_s = substring(cast('{$_REQUEST["date_start"]}' as varchar(50)),6,2)
							,@yyyy_s = substring(cast('{$_REQUEST["date_start"]}' as varchar(50)),1,4);
					
					SELECT
						b.dc_acc_id
						,a.gl_tran_hdr_id
						,a.c_ref_doc
						,a.d_doc_date
						,a.c_code
						,a.c_code_post
						,a.d_save_date
						,b.i_rank
						,concat(a.c_comment1,a.c_comment2,a.c_comment3) AS c_name
						,b.dc_product_id
						,(SELECT c_name FROM dc_product WHERE dc_product_id=b.dc_product_id) AS product_name
						,b.dc_cost_acc_id
						,(SELECT c_name FROM dc_cost WHERE dc_cost_id=b.dc_cost_acc_id) AS cost_name
						,(SELECT aa.i_debit FROM dc_acc aa WHERE aa.dc_acc_id=b.dc_acc_id) AS i_debit
						,0 AS f_balance
						,b.f_dr
						,b.f_cr
						,(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_create_id)) AS emp_name
						,(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_update_post_id)) AS post_name
						,b.i_is_nontax_exp
						,0 as dc_acc_id_parent
						,NULL as parent_code
						,NULL as parent_name
						,a.i_is_post
						,b.i_type_year
						,b.c_budget_year
						,d.c_name AS expense_name
						,ISNULL(a.i_cancel_doc_expense,4) as i_cancel_doc_expense
					INTO #temData
					FROM gl_tran_hdr a
							INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id=b.gl_tran_hdr_id
							INNER JOIN dc_acc c ON b.dc_acc_id=c.dc_acc_id
							LEFT JOIN dc_expense_budget_type d ON b.dc_expense_budget_type_id = d.dc_expense_budget_type_id
					WHERE {$con_post} AND a.i_enable=1 
						AND c.i_last=1 AND c.i_enable=1 AND c.i_delete=2
						AND a.d_save_date between CONVERT(DATETIME,@d_save_date_start,120) AND CONVERT(DATETIME,@d_save_date_end,120)
						{$con2}
					
					SELECT
						a.dc_acc_id
						,a.c_code AS acc_code
						,a.c_name AS acc_name
						,b.gl_tran_hdr_id
						,b.c_ref_doc
						,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
						,b.c_code
						,CASE WHEN (b.i_is_post=3) THEN b.c_code_post ELSE NULL END as c_code_post
						,CONVERT(VARCHAR, b.d_save_date, 120) AS d_save_date
						,b.i_rank
						,b.c_name
						,b.dc_product_id
						,b.product_name
						,b.dc_cost_acc_id
						,b.cost_name
						,b.i_debit 
						,ISNULL((SELECT SUM(ISNULL(aa.f_end_dr,0)-ISNULL(aa.f_end_cr,0))
								FROM gl_balance_cost aa
									INNER JOIN dc_acc bb ON aa.dc_acc_id=bb.dc_acc_id
								WHERE aa.dc_acc_id=a.dc_acc_id 
 									AND aa.i_is_close_year	=(CASE WHEN ((@yyyy_start_gl=@yyyy_s) AND (10=@mm_s)) THEN 2  ELSE (CASE WHEN (10=@mm_s) THEN 1 ELSE 2 END) END)   AND aa.i_is_post IN (2, 3)
									AND aa.c_mm				=(CASE WHEN (1=@mm_s) THEN 12 WHEN (10=@mm_s) THEN 9 ELSE @mm_s-1 END)
									AND aa.c_yyyy			=(CASE WHEN (1=@mm_s) THEN @yyyy_s-1 WHEN (10=@mm_s) THEN @yyyy_s  ELSE @yyyy_s END)									 
									{$con5}
						),0) as f_balance  
						,b.f_dr
						,b.f_cr
						,b.emp_name
						,b.post_name
						,b.i_is_nontax_exp 
						,a.dc_acc_lv4_id  as dc_acc_id_parent
						,a.c_code_lv4   as parent_code
						,a.c_name_lv4  as parent_name
						,b.i_type_year
						,b.c_budget_year
						,b.expense_name
						,b.i_cancel_doc_expense
						,CASE 
							WHEN (b.i_cancel_doc_expense='1') THEN '<font color=red>ยกเลิกฎีกา e-PHIS</font>'
							WHEN (b.i_cancel_doc_expense='2') THEN '<font color=red>ยกเลิกฎีกา Vision Net</font>'
							WHEN (b.i_cancel_doc_expense='3') THEN '<font color=red>ยกเลิกโอนระหว่างธนาคาร (BTN)</font>'
							ELSE NULL
						END as c_cancel_doc_expense					
					INTO #temDataShow
					FROM vw_dc_acc_with_parent a
						LEFT JOIN #temData b ON a.dc_acc_id=b.dc_acc_id
					WHERE a.i_last=1 AND a.i_enable=1 AND a.i_delete=2
						{$con3}
						
					SELECT * FROM #temDataShow
					WHERE 1=1 {$con4}
					ORDER BY acc_code, d_save_date, c_code_post , c_code, i_rank;";
   	 
	$stmt = $db->QueryParam( $sqlMain, array() );
	if( $stmt ) {
		$i	= 0;
		$GroupArr = array();
		while( $row = $db->Fetch( $stmt ) ) {
			
			if ($_REQUEST["i_show_acc"] == 1) {
				$GroupArr[$row["dc_acc_id"]]["dc_acc_id_parent"]	= $row["dc_acc_id_parent"];
				$GroupArr[$row["dc_acc_id"]]["parent_code"]			= $row["parent_code"];
				$GroupArr[$row["dc_acc_id"]]["parent_name"]			= $row["parent_name"];
			}
			
			$GroupArr[$row["dc_acc_id"]]["acc_code"]	= $row["acc_code"];
			$GroupArr[$row["dc_acc_id"]]["acc_name"]	= $row["acc_name"];
			$GroupArr[$row["dc_acc_id"]]["i_debit"]		= $row["i_debit"];
			$GroupArr[$row["dc_acc_id"]]["f_balance"]	= $row["f_balance"];
			
			if( $row["gl_tran_hdr_id"] > 0 ) {
				++$i;
				
				if($row["i_type_year"] == 1) { $c_budget_year = $row["c_budget_year"]+543; }
				else if($row["i_type_year"] == 2) { $c_budget_year = ($row["c_budget_year"]+543)." (เหลื่อมปี)"; }
				else { $c_budget_year = ""; }
				
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["c_ref_doc"]			= $row["c_ref_doc"]; 
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["d_doc_date"]			= $date->shot_date_from_db($row["d_doc_date"]);
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["c_code"]				= $row["c_code"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["c_code_post"]			= $row["c_code_post"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["d_save_date"]			= $date->shot_date_from_db($row["d_save_date"]);
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["i_rank"]				= $row["i_rank"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["c_name"]				= $row["c_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["dc_product_id"]		= $row["dc_product_id"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["product_name"]			= $row["product_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["dc_cost_acc_id"]		= $row["dc_cost_acc_id"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["cost_name"]			= $row["cost_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["i_debit"]				= $row["i_debit"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["f_balance"]			= $row["f_balance"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["f_dr"]					= $row["f_dr"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["f_cr"]					= $row["f_cr"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["emp_name"]				= $row["emp_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["post_name"]			= $row["post_name"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["i_is_nontax_exp"]		= $row["i_is_nontax_exp"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["c_budget_year"]		= $c_budget_year;
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["expense_name"]			= $row["expense_name"];
 				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["i_cancel_doc_expense"]	= $row["i_cancel_doc_expense"];
				$TranArr[$row["dc_acc_id"]][$row["gl_tran_hdr_id"]][$i]["c_cancel_doc_expense"]	= $row["c_cancel_doc_expense"];
			} 
			$totalCount++;
		}
		
		$arr_parent_code = $arr_parent_previous_code = array();
		$channel		= array();
		$sum_f_dr		= 0;
		$sum_f_cr		= 0;
		$sum_f_balance	= 0; 
		$kk = $jj = 0;
		
		foreach( $GroupArr AS $dc_acc_id => $objAcc ) {
			
			//=================================//
			$temp		= array();
			$c_show_acc_control = "";
			$no			= 0;
			$f_dr		= 0;
			$f_cr		= 0;
			 
			$temp["i_type"]				= 1; // ยอดยกมา
			if ($_REQUEST["i_show_acc"] == 1) {
				if  ((is_array($arr_parent_code))  && ( !in_array( "$objAcc[parent_code]", $arr_parent_code ) ) ) {
 
					if ($kk>0) {
						$c_show_acc_control	= "<font color=red>รวมรหัสบัญชีคุม : ".$arr_parent_previous_code[$kk]." ชื่อบัญชี : ".$arr_parent_previous_name[$kk]."</font><br>"; 
					}
					 
					$kk++;
					$c_show_acc_control	.= "<font color=brown>รหัสบัญชีคุม : ".$objAcc["parent_code"]." ชื่อบัญชี : ".$objAcc["parent_name"]."</font><br>"; 
					
				}
				$arr_parent_code[$objAcc["dc_acc_id_parent"]] = $objAcc["parent_code"]; 
				$arr_parent_previous_code[$kk] = $objAcc["parent_code"];
				$arr_parent_previous_name[$kk] = $objAcc["parent_name"]; 
			}
			
			
			$temp["c_name"]				= $c_show_acc_control."รหัสบัญชีย่อย : ".$objAcc["acc_code"]." ชื่อบัญชี : ".$objAcc["acc_name"];
			$temp["f_balance"]			= $objAcc["f_balance"];
			$temp["dc_acc_id"]			= $dc_acc_id;
			$c_show_acc_control			= "";
			

		
			${$root}[]	= $temp;
 		
			//=================================//
			if(!is_null(@$TranArr[$dc_acc_id])) {
				
				/* $balance	= ($objAcc["f_balance"] > 0)? $objAcc["f_balance"] : 0; // ยอดคงเหลือ */
				$balance	= $objAcc["f_balance"];
				foreach( $TranArr[$dc_acc_id] AS $gl_tran_hdr_id => $objTran ) {
					foreach ($objTran AS $objDtl) {
						//=================================//
						$temp		= array();
						
						$temp["i_type"]				= 2;
						$temp["no"]					= ++$no;
						$temp["c_ref_doc"]			= $objDtl["c_ref_doc"];
						$temp["d_doc_date"]			= $objDtl["d_doc_date"];
						$temp["c_code"]				= $objDtl["c_code"];
						$temp["c_code_post"]		= $objDtl["c_code_post"];
						$temp["d_save_date"]		= $objDtl["d_save_date"];
						$temp["i_rank"]				= $objDtl["i_rank"];
						$temp["c_name"]				= $objDtl["c_name"];
						$temp["dc_product_id"]		= $objDtl["dc_product_id"];
						$temp["product_name"]		= $objDtl["product_name"];
						$temp["dc_cost_acc_id"]		= $objDtl["dc_cost_acc_id"];
						$temp["cost_name"]			= $objDtl["cost_name"];
						$temp["i_debit"]			= $objDtl["i_debit"];
						$temp["f_dr"]				= $objDtl["f_dr"];
						$temp["f_cr"]				= $objDtl["f_cr"];
						$temp["f_balance"]			= ($balance+$objDtl["f_dr"])-$objDtl["f_cr"];
						$temp["emp_name"]			= $objDtl["emp_name"];
						$temp["post_name"]			= $objDtl["post_name"];
						$temp["i_is_nontax_exp"]	= $objDtl["i_is_nontax_exp"];
						$temp["dc_acc_id"]			= $dc_acc_id;
						$temp["c_budget_year"]		= $objDtl["c_budget_year"];
						$temp["expense_name"]					= $objDtl["expense_name"];
						$temp["i_cancel_doc_expense"]			= $objDtl["i_cancel_doc_expense"];	
						$temp["c_cancel_doc_expense"]			= $objDtl["c_cancel_doc_expense"];
						$f_dr	+= $objDtl["f_dr"];
						$f_cr	+= $objDtl["f_cr"];
						$balance	= ($balance+$objDtl["f_dr"])-$objDtl["f_cr"];
							
						${$root}[]	= $temp;
						
						//=================================//
					}				
				}
				
			}
 
			//=================================//
			$temp		= array();
			$no			= 0;

			$f_add_dr = $f_add_cr = 0;
			if ($objAcc["f_balance"]>0)
			{
				$f_add_dr = $objAcc["f_balance"];
				$f_add_cr = 0;
			}
			else
			{
				$f_add_dr = 0;
				$f_add_cr = $objAcc["f_balance"];
			}

			
			$temp["i_type"]				= 3; // รวมรหัสบัญชี
			$temp["c_name"]				= "รวมรหัสบัญชี : ".$objAcc["acc_code"]." ชื่อบัญชี : ".$objAcc["acc_name"];
		/*	$temp["f_dr"]				= $f_dr+$objAcc["f_balance"]; */
			$temp["f_dr"]				= $f_dr+$f_add_dr; /*$f_dr*/
			$temp["f_cr"]				= $f_add_cr-$f_cr; /*$f_cr;*/
			$temp["f_balance"]			= ($f_dr+$objAcc["f_balance"])-$f_cr;
			$temp["dc_acc_id"]			= $dc_acc_id;
			
 
			
			$sum_f_dr		+= $f_dr;
			$sum_f_cr		+= $f_cr;
			$sum_f_balance	+= $f_dr-$f_cr;
			
			${$root}[]	= $temp;
			
			//=================================//
 
		}

		//=================================//
		$temp		= array();
		$c_show_acc_control = "";
		if ($_REQUEST["i_show_acc"] == 1) {
			$c_show_acc_control	= "<font color=red>รวมรหัสบัญชีคุม : ".$arr_parent_previous_code[$kk]." ชื่อบัญชี : ".$arr_parent_previous_name[$kk]."</font><br>"; 
		}

		$temp["i_type"]				= 5; // รวมทั้งสิ้น
		$temp["c_name"]				= $c_show_acc_control."<br>รวมทั้งสิ้น";
		$temp["f_dr"]				= $sum_f_dr;
		$temp["f_cr"]				= $sum_f_cr;
		$temp["f_balance"]			= $sum_f_balance;
		$temp["dc_acc_id"]			= @$dc_acc_id;

		${$root}[]	= $temp;

		//=================================//
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}

if($_REQUEST["type"] == "DATA") { echo List_QueryParam();exit; }
?>