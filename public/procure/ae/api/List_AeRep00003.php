<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../gl/conf/configGl.php");

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
	
	global $db, $date, $util, $root, $data, $select, $con, $flds, $groupBy, $arr_status;

	$myarr_cost = array("0"=>"","1"=>"","2"=>"F","3"=>"V");
	
	$gl	= $db->GetDataBySQL("SELECT * FROM gl_config_dc_acc", array());
	
	$i_level			= $gl["i_level_all"];
	
	for ($i=1;$i<=$i_level;$i++) { $lv[] = $gl["i_level".$i]; }
	
	$totalCount		= 0;

	// ========================================================================================== //
	// ผังบัญชี
	if( $_REQUEST["i_acc"] == 1 ) {
		$con	.= " AND c.c_code BETWEEN (SELECT c_code FROM vw_dc_acc WHERE dc_acc_id=".$_REQUEST["dc_acc_id_s"].") AND (SELECT c_code FROM vw_dc_acc WHERE dc_acc_id=".$_REQUEST["dc_acc_id_e"].")";
	} else {
		$dc_acc_id_r	= explode(";", $_REQUEST["dc_acc_id_r"]);
		if( !in_array( "0", $dc_acc_id_r ) ) {
			$in_acc	= "";
			foreach( $dc_acc_id_r as $val ) {
				$in_acc	.= ( $in_acc == "" )? $val : ", ".$val;
			}
			$con	.= "AND c.dc_acc_id IN (".$in_acc.")";
		} else { $con	= null; }
	}
	
	// หน่วยงาน
	if( $_REQUEST["i_cost"] == 1 ) {
		$con	.= " AND d.c_code_tree BETWEEN (SELECT c_code_tree FROM vw_dc_cost WHERE dc_cost_id=".$_REQUEST["dc_cost_id_s"].") AND (SELECT c_code_tree FROM vw_dc_cost WHERE dc_cost_id=".$_REQUEST["dc_cost_id_e"].")";
	} else if ( $_REQUEST["i_cost"] == 3 ) {
		$con	.= " AND d.dc_cost_id IN (SELECT dc_cost_id FROM gl_dc_group_admin_dtl WHERE gl_dc_group_admin_hdr_id = ".$_REQUEST["dc_cost_seg"].")";
	} else {
		$dc_cost_id_r	= explode(";", $_REQUEST["dc_cost_id_r"]);
		if( !in_array( "0", $dc_cost_id_r ) ) {
			$in_cost	= "";
			foreach( $dc_cost_id_r as $val ) {
				$in_cost	.= ( $in_cost == "" )? $val : ", ".$val;
			}
			$con	.= "AND d.dc_cost_id IN (".$in_cost.")";
		} else { $con	= null; }
	}
	
	switch ( $_REQUEST["i_is_post"] ) {
		case 1 : $con	.= " AND a.i_is_post=".BOOK_ACC_GX; break;
		case 2 : $con	.= " AND a.i_is_post=".BOOK_ACC_GL; break;
		case 3 : $con	.= " AND a.i_is_post IN (".BOOK_ACC_GX.",".BOOK_ACC_GL.")"; break;
	}
	
	$fld_Acc	= "";
	$fld_Month	= "";
	$fld_Sum	= "";
	$dc_acc_lv	= "";
	$lengthLv	= 0;
	$lengthAll	= 0;
	
	for ($i=1; $i <= $i_level; $i++) { $lengthAll	+= $lv[$i-1]; }
	for ($i=1; $i <= $i_level; $i++) {
		
		$lengthLv	+= $lv[$i-1];
		
		$fld_Acc	.= ",(SELECT dc_acc_id FROM vw_dc_acc WHERE c_code_tree LIKE ''+LEFT(a.c_code_tree, $lengthLv)+'%'	AND i_level={$i}) AS dc_acc_lv{$i}
						,(SELECT c_code FROM vw_dc_acc WHERE c_code_tree LIKE ''+LEFT(a.c_code_tree, $lengthLv)+'%'		AND i_level={$i}) AS c_code_lv{$i}
						,(SELECT c_name FROM vw_dc_acc WHERE c_code_tree LIKE ''+LEFT(a.c_code_tree, $lengthLv)+'%'		AND i_level={$i}) AS c_name_lv{$i} ";
		$dc_acc_lv	.= ($i == $i_level)? " WHEN {$i} THEN dc_acc_id": "WHEN {$i} THEN dc_acc_lv$i ";
		
		$fld_Sum	.= " WHEN aa.i_level = {$i} THEN LEFT(LEFT(c_code_tree,($lengthLv))+'".sprintf("%'.'9".$lengthLv."d", 9)."',$lengthAll) ";
		
	}
	
	for ($i=1; $i <= 12; $i++) {
		$fld_Month	.= " ,(SELECT ISNULL(SUM([{$i}]), 0) FROM #temData WHERE (CASE aa.i_level {$dc_acc_lv} ELSE 0 END )=aa.dc_acc_id) AS [{$i}] ";
	}

	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						b.dc_acc_id
						,MONTH(a.d_save_date) AS mm
						,SUM(b.f_dr) AS f_dr
						,SUM(b.f_cr) AS f_cr
					INTO #tem_tran
					FROM gl_tran_hdr a
						INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id=b.gl_tran_hdr_id
						INNER JOIN vw_dc_acc c ON b.dc_acc_id=c.dc_acc_id
						INNER JOIN dc_cost d ON b.dc_cost_acc_id=d.dc_cost_id
					WHERE a.i_enable=".STATUS_ENABLE." AND ISNULL(a.i_is_close_year,2)=2
						AND a.d_save_date BETWEEN '{$_REQUEST["d_save_date1"]}' and '{$_REQUEST["d_save_date2"]}'
						{$con}
					GROUP BY
						b.dc_acc_id
						,MONTH(a.d_save_date)
					HAVING (SUM(b.f_dr) != 0 OR SUM(b.f_cr) != 0);
					
					SELECT
						a.dc_acc_id
						{$fld_Acc}
						,a.c_code
						,a.c_code_tree
						,a.c_name
						,SUM(CASE WHEN b.mm=1 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [1]
						,SUM(CASE WHEN b.mm=2 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [2]
						,SUM(CASE WHEN b.mm=3 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [3]
						,SUM(CASE WHEN b.mm=4 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [4]
						,SUM(CASE WHEN b.mm=5 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [5]
						,SUM(CASE WHEN b.mm=6 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [6]
						,SUM(CASE WHEN b.mm=7 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [7]
						,SUM(CASE WHEN b.mm=8 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [8]
						,SUM(CASE WHEN b.mm=9 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [9]
						,SUM(CASE WHEN b.mm=10 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [10]
						,SUM(CASE WHEN b.mm=11 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [11]
						,SUM(CASE WHEN b.mm=12 THEN (CASE WHEN a.i_group=2 OR a.i_group=3 OR a.i_group=4 THEN b.f_cr-b.f_dr ELSE b.f_dr-b.f_cr END) ELSE 0 END) AS [12]
					INTO #temData
					FROM vw_dc_acc a
						LEFT JOIN #tem_tran b ON a.dc_acc_id=b.dc_acc_id
					WHERE a.i_last=1 AND a.i_enable=".STATUS_ENABLE."
					GROUP BY
						a.dc_acc_id,
						a.c_code,
						a.c_code_tree,
						a.c_name;
							
					SELECT
						*
					INTO #temShow
					FROM (SELECT
						aa.dc_acc_id
						,aa.c_code_tree
						,aa.c_code+' '+aa.c_name AS c_name
						,aa.i_level AS i_type
						,aa.i_level
						,aa.i_group
						,ISNULL(aa.i_show_level,0) AS i_show_level
						,ISNULL(aa.i_show_exp_type,0) AS i_show_exp_type
						,ISNULL(aa.i_is_fixed,0) AS i_is_fixed
						{$fld_Month}
					FROM vw_dc_acc aa
					WHERE aa.i_show_name>0
						AND aa.i_enable=".STATUS_ENABLE."
					UNION SELECT
						dc_acc_id
						,c_code_tree
						,c_code+' '+c_name AS c_name
						,i_level AS i_type
						,i_level
						,i_group
						,ISNULL(i_show_level,0) AS i_show_level
						,ISNULL(i_show_exp_type,0) AS i_show_exp_type
						,ISNULL(i_is_fixed,0) AS i_is_fixed
						{$fld_Month}
					FROM vw_dc_acc aa
					WHERE aa.i_enable=".STATUS_ENABLE." AND aa.i_level IN (1, 2)) a;
					
					SELECT
						*
					FROM #temShow
					UNION SELECT
						aa.dc_acc_id
						,CASE {$fld_Sum} END AS c_code_tree
						,'รวม : '+aa.c_name AS c_name
						,0 AS i_type
						,aa.i_level
						,aa.i_group
						,1 AS i_show_level
						,1 AS i_show_exp_type
						,0 AS i_is_fixed
						{$fld_Month}
					FROM #temShow aa
					WHERE aa.i_show_exp_type=1
					ORDER BY c_code_tree;";
	
	
	// echo "<hr>$sqlMain";
	$stmt = $db->QueryParam( $sqlMain, array() );
	
	if( $stmt ) {
		
		$Income		= array();
		$Expense	= array();
		
		while( $row = $db->Fetch( $stmt ) ) {
			
			//=================================//
			$temp		= array();
			$sum		= 0;
			
			$temp["i_level"]			= $row["i_level"];
			$temp["c_name"]				= $row["c_name"];
			$temp["i_type"]				= $row["i_type"];
			$temp["i_show_level"]		= $row["i_show_level"];
			$temp["i_show_exp_type"]	= $row["i_show_exp_type"];
			$temp["c_fixed"]			= ($row["i_group"] == 5)? $myarr_cost[$row["i_is_fixed"]] : "";
			
				
			for($i=1;$i<=12;$i++) {
				$temp["mm"][$i]			= $row[$i];
				$sum					+= $row[$i];
			
				if($row["i_group"] == 4) {
					if( $row["i_level"] == 1 && $row["i_type"] != 0 ) {
						if( array_key_exists( $i, $Income ) ) {
							$Income[$i]		+= $row[$i];
						} else {
							$Income[$i]		= $row[$i];
						}
					}
				} else if($row["i_group"] == 5) {
					
					if( $row["i_level"] == 1 && $row["i_type"] != 0 ) {
						if( array_key_exists( $i, $Expense ) ) {
							$Expense[$i]	+= $row[$i];
						} else {
							$Expense[$i]	= $row[$i];
						}
					}
				}
			}
			$temp["sum"]				= $sum;
				
			${$root}[]	= $temp;
			//=================================//
			
			$totalCount++;
		}
		
		//=================================//
		$temp		= array();
		$sum		= 0;
		
		$temp["c_name"]				= "รวมรายได้ : ";
		$temp["i_type"]				= 0;
		$temp["i_show_level"]		= 1;
		$temp["i_show_exp_type"]	= 1;
		$temp["c_fixed"]			= "";
			
		for($i=1;$i<=12;$i++) {
			$temp["mm"][$i]			= $Income[$i];
			$sum					+= $Income[$i];
		}
		$temp["sum"]				= $sum;
			
		${$root}[]	= $temp;
		//=================================//
		
		//=================================//
		$temp		= array();
		$sum		= 0;

		$temp["c_name"]				= "รวมค่าใช้จ่าย : ";
		$temp["i_type"]				= 0;
		$temp["i_show_level"]		= 1;
		$temp["i_show_exp_type"]	= 1;
		$temp["c_fixed"]			= "";
			
		for($i=1;$i<=12;$i++) {
			$temp["mm"][$i]			= $Expense[$i];
			$sum					+= $Expense[$i];
		}
		$temp["sum"]				= $sum;
			
		${$root}[]	= $temp;
		//=================================//
		
		//=================================//
		$temp		= array();
		$sum		= 0;
		
		$temp["c_name"]				= "กำไรสุทธิ : ";
		$temp["i_type"]				= 0;
		$temp["i_show_level"]		= 1;
		$temp["i_show_exp_type"]	= 1;
		$temp["c_fixed"]			= "";
			
		for($i=1;$i<=12;$i++) {
			$temp["mm"][$i]			= ($Income[$i]-$Expense[$i]);
			$sum					+= ($Income[$i]-$Expense[$i]);
		}
		$temp["sum"]				= $sum;
			
		${$root}[]	= $temp;
		//=================================//
		
		$totalCount++;
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>