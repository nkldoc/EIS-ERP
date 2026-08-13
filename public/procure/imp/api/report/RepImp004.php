<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/date/i_date.class.php");
include ("../../gl/conf/configGl.php");

$db = new DatabaseServer ();
$date = new i_date ();

$root = "data";
$data = array ();
$con = null;

function List_QueryParam() {
	global $db, $date, $root, $data, $con, $arr_status;
	
	$con2= null;
	
	$totalCount = 0;

	if($_REQUEST["i_show_acc"] == 1) { // บัญชีคุม Lv4
		
		$ss_id	= explode(";", $_REQUEST["dc_acc_id_parent"]);
		if( !in_array("0", $ss_id ) ) {
			$in	= "";
			foreach( $ss_id as $val ) { $in	.= ( $in == "" )? $val : ", ".$val; }
			$con2	.= " AND c.dc_acc_lv4_id IN (".$in.")";
		}
	
	} else if($_REQUEST["i_show_acc"] == 3) { // บัญชีคุม Lv5
	
		$ss_id	= explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
		if( !in_array("0", $ss_id ) ) {
			$in	= "";
			foreach( $ss_id as $val ) { $in	.= ( $in == "" )? $val : ", ".$val; }
			$con2	.= " AND c.dc_acc_lv5_id IN (".$in.")";
		}
	
	} else if($_REQUEST["i_show_acc"] == 2) { // บัญชีย่อย
	
		$ss_id	= explode(";", $_REQUEST["dc_acc_id"]);
		if( !in_array("0", $ss_id ) ) {
			$in	= "";
			foreach( $ss_id as $val ) { $in	.= ( $in == "" )? $val : ", ".$val; }
			$con2	.= " AND c.dc_acc_id IN (".$in.")";
		}
	}
	$cu1 = null;
	$cu2 = null;
	$uu_id	= explode(";", $_REQUEST["dc_user_id"]);
	if( !in_array("0", $uu_id ) ) {
		$in	= "";
		foreach( $uu_id as $val ) { $in	.= ( $in == "" )? $val : ", ".$val; }
		$cu1	.= " AND a.dc_user_create_id IN (".$in.")";
		$cu2	.= " AND c.dc_user_create_id IN (".$in.")";
	}
	
	$sqlMain = "SET NOCOUNT ON;
			
				DECLARE @d_begin AS VARCHAR(10) = '" . $_REQUEST ["date_start"] . "';
				DECLARE @d_end AS VARCHAR(10) = '" . $_REQUEST ["date_end"] . "';
				DECLARE @i_year as int = " . $_REQUEST ["year"] . ";

				SELECT b.dc_acc_lv3_id
					, b.c_code_lv3
					, b.c_name_lv3
					, b.dc_acc_lv4_id
					, b.c_code_lv4
					, b.c_name_lv4
					, b.dc_acc_lv5_id
					, b.c_code_lv5
					, b.c_name_lv5
					, b.dc_acc_id
					, b.c_code
					, b.c_name
					, SUM(a.dc_expen_type1) AS dc_expen_type1
					, SUM(a.dc_expen_type2) AS dc_expen_type2
					, SUM(a.dc_expen_type3) AS dc_expen_type3
					, SUM(a.dc_expen_type4) AS dc_expen_type4
					, SUM(a.dc_expen_type5) AS dc_expen_type5
					, SUM(a.sum_gx) AS sum_gx
					, SUM(a.sum_gl) AS sum_gl
				FROM
				(SELECT e.dc_acc_id
					, a.c_code
					, CASE ISNULL(b.dc_expense_budget_type_id, 0) 
						WHEN 1 THEN SUM(ISNULL(b.f_cr,0)-ISNULL(b.f_dr,0)) ELSE 0 END dc_expen_type1
					, CASE ISNULL(b.dc_expense_budget_type_id, 0) 
						WHEN 2 THEN SUM(ISNULL(b.f_cr,0)-ISNULL(b.f_dr,0)) ELSE 0 END dc_expen_type2
					, CASE ISNULL(b.dc_expense_budget_type_id, 0) 
						WHEN 0 THEN SUM(ISNULL(b.f_cr,0)-ISNULL(b.f_dr,0)) ELSE 0 END dc_expen_type3
					, 0.00 AS dc_expen_type4
					, 0.00 AS dc_expen_type5
					, CASE WHEN LEFT(a.c_code , 2) = 'GX' THEN SUM(ISNULL(b.f_cr,0)-ISNULL(b.f_dr,0)) ELSE 0 END sum_gx
					, CASE WHEN LEFT(a.c_code_post , 2) = 'GL' THEN SUM(ISNULL(b.f_cr,0)-ISNULL(b.f_dr,0)) ELSE 0 END sum_gl
				FROM gl_tran_hdr a 
					INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
					INNER JOIN dc_acc e ON b.dc_acc_id = e.dc_acc_id
				WHERE a.table_name IN ('imp_receive_hdr')
					AND a.i_is_post IN (2,3)
					AND a.i_enable = 1
					AND e.i_group = 4
					/*AND b.i_type_year = 1*/
					AND a.i_is_close_year = 2
					/*AND b.c_budget_year = @i_year*/
					AND CONVERT(DATETIME, a.d_save_date, 102) BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
					{$cu1}
				GROUP BY e.dc_acc_id, b.dc_expense_budget_type_id, a.c_code, a.c_code_post
				UNION
				SELECT a.dc_acc_id
					, c.c_code
					, 0.00 AS dc_expen_type1
					, 0.00 AS dc_expen_type2
					, 0.00 AS dc_expen_type3
					, SUM(b.f_cr ) AS dc_expen_type4
					, SUM(b.f_dr)*-1 AS dc_expen_type5
					, CASE WHEN LEFT(c.c_code , 2) = 'GX' THEN SUM(ISNULL(b.f_cr,0)-ISNULL(b.f_dr,0)) ELSE 0 END sum_gx
					, CASE WHEN LEFT(c.c_code_post , 2) = 'GL' THEN SUM(ISNULL(b.f_cr,0)-ISNULL(b.f_dr,0)) ELSE 0 END sum_gl
				FROM dc_acc a
					INNER JOIN gl_tran_dtl b ON a.dc_acc_id = b.dc_acc_id
					INNER JOIN gl_tran_hdr c ON b.gl_tran_hdr_id = c.gl_tran_hdr_id
				WHERE isnull(c.table_name,'') != 'imp_receive_hdr'
					AND c.i_is_post IN (2,3) AND c.i_enable = 1 AND c.i_is_close_year = 2				
					AND c.d_save_date BETWEEN CONVERT(DATETIME, @d_begin, 102) AND CONVERT(DATETIME, @d_end, 102)
					AND a.dc_acc_id IN (SELECT dc_acc_id FROM conf_acc_rep WHERE report_number = 1)
					{$cu2}
				GROUP BY a.dc_acc_id, c.c_code, c.c_code_post) AS a
					INNER JOIN vw_dc_acc_with_parent b ON a.dc_acc_id = b.dc_acc_id
				WHERE b.i_group = ?
				GROUP BY b.dc_acc_lv3_id, b.c_code_lv3, b.c_name_lv3
					, b.dc_acc_lv4_id, b.c_code_lv4, b.c_name_lv4
					, b.dc_acc_lv5_id, b.c_code_lv5, b.c_name_lv5
					, b.dc_acc_id, b.c_code, b.c_name
				ORDER BY b.c_code_lv3,b.c_code_lv4,b.c_code_lv5;";
	
	
	$arrParam [] = GL_ACC_GROUP4_REVENUE;
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	
	if ($stmt) {
		
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			if ($row ["dc_acc_lv3_id"] > 0) {
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["c_code_lv3"] = $row ["c_code_lv3"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["c_name_lv3"] = $row ["c_name_lv3"];
				
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["c_code_lv4"] = $row ["c_code_lv4"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["c_name_lv4"] = $row ["c_name_lv4"];
				
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["c_code_lv5"] = $row ["c_code_lv5"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["c_name_lv5"] = $row ["c_name_lv5"];
				
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["c_code_lv6"] = $row ["c_code"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["c_name_lv6"] = $row ["c_name"];
				
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["data"] ["dc_expen_type1"] = $row ["dc_expen_type1"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["data"] ["dc_expen_type2"] = $row ["dc_expen_type2"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["data"] ["dc_expen_type3"] = $row ["dc_expen_type3"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["data"] ["dc_expen_type4"] = $row ["dc_expen_type4"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["data"] ["dc_expen_type5"] = $row ["dc_expen_type5"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["data"] ["sum_gx"] = $row ["sum_gx"];
				$ArrTranDtl [$row ["dc_acc_lv3_id"]] ["data"] [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["dc_acc_id"]] ["data"] ["sum_gl"] = $row ["sum_gl"];
			}
		}
		
		if (isset ( $ArrTranDtl )) {
			
			$sum_amount = array ();
			
			// LV3
			foreach ( $ArrTranDtl as $dc_acc_lv3_id => $obj_acc_lv3 ) {
				
				$temp = array (
						"i_type" => 1,
						"c_name_lv3" => $obj_acc_lv3 ["c_code_lv3"] . " " . $obj_acc_lv3 ["c_name_lv3"] 
				);
				
				${$root} [] = $temp;
				
				$sum_amount_lv3 = array ();
				
				// LV4
				foreach ( $obj_acc_lv3 ["data"] as $dc_acc_lv4_id => $obj_acc_lv4 ) {
					
					$temp = array (
							"i_type" => 2,
							"c_name_lv4" => $obj_acc_lv4 ["c_code_lv4"] . " " . $obj_acc_lv4 ["c_name_lv4"] 
					);
					
					${$root} [] = $temp;
					
					$sum_amount_lv4 = array ();
					
					// LV5
					foreach ( $obj_acc_lv4 ["data"] as $dc_acc_lv5_id => $obj_acc_lv5 ) {
						
						$temp = array (
								"i_type" => 3,
								"c_name_lv5" => $obj_acc_lv5 ["c_code_lv5"] . " " . $obj_acc_lv5 ["c_name_lv5"]
						);
							
						${$root} [] = $temp;
							
						$sum_amount_lv5 = array ();
						
						// LV6
						foreach ( $obj_acc_lv5 ["data"] as $dc_acc_lv6_id => $obj_acc_lv6 ) {
							
							$temp = array ();
							
							$temp ["i_type"] = 4;
							$temp ["c_name_lv6"] = $obj_acc_lv6 ["c_code_lv6"] . " " . $obj_acc_lv6 ["c_name_lv6"];
							
							foreach ( $obj_acc_lv6 ["data"] as $dc_expense_budget_type_id => $obj_budget ) {
								
								$temp ["data"] [$dc_expense_budget_type_id] = $obj_budget;
								
								// set array
								if (! isset ( $sum_amount [$dc_expense_budget_type_id])) {
									$sum_amount [$dc_expense_budget_type_id] = 0; 
								}
								$sum_amount [$dc_expense_budget_type_id] += floatval ( @$obj_budget);
								
								if (! isset ( $sum_amount_lv3 [$dc_expense_budget_type_id])) {
									$sum_amount_lv3 [$dc_expense_budget_type_id] = 0;
								}
								$sum_amount_lv3 [$dc_expense_budget_type_id] += floatval ( @$obj_budget);
								
								if (! isset ( $sum_amount_lv4 [$dc_expense_budget_type_id])) {
									$sum_amount_lv4 [$dc_expense_budget_type_id] = 0;
								}
								$sum_amount_lv4 [$dc_expense_budget_type_id]  += floatval ( @$obj_budget );
								
								if (! isset ( $sum_amount_lv5 [$dc_expense_budget_type_id])) {
									$sum_amount_lv5 [$dc_expense_budget_type_id] = 0; 
								}
								$sum_amount_lv5 [$dc_expense_budget_type_id] += floatval ( @$obj_budget);
							}
							
							${$root} [] = $temp;
						}
						
						// SUM LV5
						$temp = array ();
							
						$temp ["i_type"]		= 5;
						$temp ["c_name_lv5"]	= $obj_acc_lv5 ["c_code_lv5"] . " " . $obj_acc_lv5 ["c_name_lv5"];
						$temp ["data"]			= $sum_amount_lv5;
							
						${$root} [] = $temp;
					}
					
					// SUM LV4
					$temp = array ();
					
					$temp ["i_type"] = 6;
					$temp ["c_name_lv4"] = $obj_acc_lv4 ["c_code_lv4"] . " " . $obj_acc_lv4 ["c_name_lv4"];
					$temp ["data"] = $sum_amount_lv4;
					
					${$root} [] = $temp;
				}
				
				// SUM LV3
				$temp = array ();
				
				$temp ["i_type"] = 7;
				$temp ["c_name_lv3"] = $obj_acc_lv3 ["c_code_lv3"] . " " . $obj_acc_lv3 ["c_name_lv3"];
				$temp ["data"] = $sum_amount_lv3;
				
				${$root} [] = $temp;
			}
			
			// SUM TOTAL
			$temp = array ();
			
			$temp ["i_type"] = 8;
			$temp ["data"] = $sum_amount;
			
			${$root} [] = $temp;
		}
	}
	
	return json_encode ( array (
			"debug" => true,
			"totalCount" => $totalCount,
			$root => ${$root} 
	) );
}
?>
