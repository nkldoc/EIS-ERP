<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/date/i_date.class.php");

$db = new DatabaseServer ();
$date = new i_date ();

$root = "data";
$data = array ();
$con = null;
function List_QueryParam() {
	global $db, $date, $root, $data, $con, $arr_status;
	
	$totalCount = 0;
	$con_date = $con_tb_report = "";
	if ($_REQUEST ["d_date_start"] != "" && $_REQUEST ["d_date_end"] != "") {
		$con_date = " AND b.d_pay BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
		$con_date_vsn = " AND b.d_cheque BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	}
	
	$for_id = explode ( ";", $_REQUEST ["dc_expense_budget_type_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_expense_budget_type_id IN (" . $in . ")" : "";
		}
	}
	
	if ($_REQUEST ["i_show_acc"] == 1) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND e.dc_acc_lv4_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST ["i_show_acc"] == 3) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND e.dc_acc_lv5_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_id_report IN (" . $in . ")" : "";
			}
		}
	}
	
	if($_REQUEST["i_type_year"] > 0) {
		$con .= " AND b.i_type_year = ".$_REQUEST["i_type_year"];
		$con .= " AND b.c_budget_year = ".$_REQUEST["c_budget_year"];
	}
	/*
	เริ่มต้นระบบ-6/6/61 ปกติใช้ 	dc_acc_id 
						,d.dc_acc_id_control AS dc_acc_id_control
						,d.c_acc_control_full AS c_acc_control_full
						,e.dc_acc_lv5_id AS dc_acc_id_control_lv5
						,e.c_code_lv5+' : '+e.c_name_lv5 AS c_acc_control_full_lv5
						,d.dc_acc_id AS dc_acc_id_last
						,d.c_acc_last_full AS c_acc_last_full 
	ตั้งแต่วันที่ 7 ใช้ 			dc_acc_id_report				
	*/
	$sqlMain = "SET NOCOUNT ON
				SELECT *
				INTO #tb_report
				FROM (
					SELECT 
						'imp_expense' AS c_system
						,CONVERT(VARCHAR, b.d_pay, 120) AS d_pay
						
					 	,e.dc_acc_lv4_id AS dc_acc_id_control
					 	,e.c_code_lv4+' : '+e.c_name_lv4 AS c_acc_control_full
						,e.dc_acc_lv5_id AS dc_acc_id_control_lv5
						,e.c_code_lv5+' : '+e.c_name_lv5 AS c_acc_control_full_lv5
						,e.dc_acc_id AS dc_acc_id_last
					 	,e.c_code+' : '+e.c_name AS c_acc_last_full 
						
						,a.dc_expense_budget_type_id
						,c.c_name AS dc_expense_budget_type_name 
						,b.c_approve
						,b.c_acc_item
						,b.i_type_year
						,b.c_budget_year
						,ISNULL(b.f_inv,0)+ISNULL(b.f_vat,0) AS f_inv
						,b.c_cheque_numbers AS c_cheque
					FROM imp_expense_hdr a
						INNER JOIN vw_imp_expense_dtl_items b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
						LEFT JOIN dc_expense_budget_type c ON a.dc_expense_budget_type_id = c.dc_expense_budget_type_id
						LEFT JOIN vw_dc_expense_4rp_impexpenseall d ON b.dc_expense_id = d.dc_expense_id
						LEFT JOIN vw_dc_acc_with_parent e ON b.dc_acc_id_report = e.dc_acc_id
					WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I'
						{$con_date}
						{$con}
						{$con_tb_report}
					UNION
					SELECT 
						'imp_expense_vsn' AS c_system
						,CONVERT(VARCHAR, b.d_cheque, 120) AS d_pay
 
 					 	,e.dc_acc_lv4_id AS dc_acc_id_control
					 	,e.c_code_lv4+' : '+e.c_name_lv4 AS c_acc_control_full
						,e.dc_acc_lv5_id AS dc_acc_id_control_lv5
						,e.c_code_lv5+' : '+e.c_name_lv5 AS c_acc_control_full_lv5
						,e.dc_acc_id AS dc_acc_id_last
					 	,e.c_code+' : '+e.c_name AS c_acc_last_full 
						
						
						,a.dc_expense_budget_type_id
						,c.c_name AS dc_expense_budget_type_name 
						,b.c_approve
						,b.c_acc_item	
						,b.i_type_year
						,b.c_budget_year				
						,b.f_inv					
						,b.c_cheque
					FROM imp_expense_vsn_hdr a
						INNER JOIN vw_imp_expense_vsn_dtl_items b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
						LEFT JOIN dc_expense_budget_type c ON a.dc_expense_budget_type_id = c.dc_expense_budget_type_id
						LEFT JOIN vw_dc_expense_acc_vsn_4rp_impexpenseall d ON b.dc_expense_acc_vsn_id = d.dc_expense_acc_vsn_id
						LEFT JOIN vw_dc_acc_with_parent e ON b.dc_acc_id_report = e.dc_acc_id
					WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT (a.c_code,1)='I'
						{$con_date_vsn} 
						{$con}
						{$con_tb_report} ) a
					
				SELECT * FROM (
					/* ==================== DATA ==================== */
					SELECT
						1 AS i_type
						,ROW_NUMBER() OVER (PARTITION BY d_pay ORDER BY d_pay,dc_acc_id_control) AS numrow
						,ROW_NUMBER() OVER (PARTITION BY d_pay,dc_acc_id_control ORDER BY d_pay,dc_acc_id_control,dc_acc_id_control_lv5) AS row_acc_control
						,c_system
						,d_pay
						,dc_acc_id_control
						,c_acc_control_full
						,dc_acc_id_control_lv5
						,c_acc_control_full_lv5
						,dc_acc_id_last
						,c_acc_last_full
						,dc_expense_budget_type_id
						,dc_expense_budget_type_name 
						,c_approve
						,c_acc_item
						,i_type_year
						,c_budget_year
						,f_inv					
						,c_cheque
					FROM #tb_report
					UNION ALL
					/* =============== SUM ACC_CONTROL LV5 ============== */
					SELECT
						2 AS i_type
						,NULL AS numrow
						,NULL AS row_acc_control 
						,NULL AS c_system
						,d_pay
						,dc_acc_id_control
						,c_acc_control_full
						,dc_acc_id_control_lv5
    					,c_acc_control_full_lv5
						,NULL AS dc_acc_id_last
						,NULL AS c_acc_last_full
						,NULL AS dc_expense_budget_type_id
						,NULL AS dc_expense_budget_type_name 
						,NULL AS c_approve
						,NULL AS c_acc_item
						,NULL AS i_type_year
						,NULL AS c_budget_year
						,SUM(ISNULL(f_inv,0)) AS f_inv			
						,NULL AS c_cheque
					FROM #tb_report
					GROUP BY d_pay,dc_acc_id_control,c_acc_control_full,dc_acc_id_control_lv5,c_acc_control_full_lv5
					UNION ALL
					/* =============== SUM ACC_CONTROL ============== */
					SELECT
						3 AS i_type
						,NULL AS numrow
						,NULL AS row_acc_control 
						,NULL AS c_system
						,d_pay
						,dc_acc_id_control
						,c_acc_control_full
    					,NULL AS dc_acc_id_control_lv5
						,NULL AS c_acc_control_full_lv5
						,NULL AS dc_acc_id_last
						,NULL AS c_acc_last_full
						,NULL AS dc_expense_budget_type_id
						,NULL AS dc_expense_budget_type_name 
						,NULL AS c_approve
						,NULL AS c_acc_item
						,NULL AS i_type_year
						,NULL AS c_budget_year
						,SUM(ISNULL(f_inv,0)) AS f_inv			
						,NULL AS c_cheque
					FROM #tb_report
					GROUP BY d_pay,dc_acc_id_control,c_acc_control_full
					UNION ALL
					/* ================== SUM DATE ================== */
					SELECT
						4 AS i_type
						,NULL AS numrow
						,NULL AS row_acc_control 
						,NULL AS c_system
						,d_pay
						,NULL AS dc_acc_id_control
						,NULL AS c_acc_control_full
						,NULL AS dc_acc_id_control_lv5
						,NULL AS c_acc_control_full_lv5
						,NULL AS dc_acc_id_last
						,NULL AS c_acc_last_full
						,NULL AS dc_expense_budget_type_id
						,NULL AS dc_expense_budget_type_name 
						,NULL AS c_approve
						,NULL AS c_acc_item
						,NULL AS i_type_year
						,NULL AS c_budget_year
						,SUM(ISNULL(f_inv,0)) AS f_inv			
						,NULL AS c_cheque
					FROM #tb_report
					GROUP BY d_pay
					UNION ALL
					/* =============== SUM TOTAL ACC_CONTROL LV5 ============== */
					SELECT
						5 AS i_type
						,NULL AS numrow
						,NULL AS row_acc_control 
						,NULL AS c_system
						,NULL AS d_pay
						,dc_acc_id_control
						,c_acc_control_full
						,dc_acc_id_control_lv5
    					,c_acc_control_full_lv5
						,NULL AS dc_acc_id_last
						,NULL AS c_acc_last_full
						,NULL AS dc_expense_budget_type_id
						,NULL AS dc_expense_budget_type_name 
						,NULL AS c_approve
						,NULL AS c_acc_item
						,NULL AS i_type_year
						,NULL AS c_budget_year
						,SUM(ISNULL(f_inv,0)) AS f_inv			
						,NULL AS c_cheque
					FROM #tb_report
					GROUP BY dc_acc_id_control,c_acc_control_full,dc_acc_id_control_lv5,c_acc_control_full_lv5
					UNION ALL
					/* =============== SUM TOTAL ACC_CONTROL ============== */
					SELECT
						6 AS i_type
						,NULL AS numrow
						,NULL AS row_acc_control 
						,NULL AS c_system
						,NULL AS d_pay
						,dc_acc_id_control
						,c_acc_control_full
    					,NULL AS dc_acc_id_control_lv5
						,NULL AS c_acc_control_full_lv5
						,NULL AS dc_acc_id_last
						,NULL AS c_acc_last_full
						,NULL AS dc_expense_budget_type_id
						,NULL AS dc_expense_budget_type_name 
						,NULL AS c_approve
						,NULL AS c_acc_item
						,NULL AS i_type_year
						,NULL AS c_budget_year
						,SUM(ISNULL(f_inv,0)) AS f_inv			
						,NULL AS c_cheque
					FROM #tb_report
					GROUP BY dc_acc_id_control,c_acc_control_full ) a
				ORDER BY
					CASE WHEN a.d_pay IS NULL THEN 1 ELSE 0 END
					,a.d_pay, a.i_type, a.dc_acc_id_control, a.row_acc_control";
	
	$arrParam = array ();
	
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		
		$f_inv = 0;
		
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			$temp = array (
					"i_type" => $row ["i_type"],
					"no" => $row ["numrow"],
					"dc_expense_budget_type_id" => $row ["dc_expense_budget_type_id"],
					"dc_expense_budget_type_name" => $row ["dc_expense_budget_type_name"],
					"d_pay" => ($row ["d_pay"] != "" && ($row ["i_type"] == 1 || $row ["i_type"] == 4)) ? $date->shot_date_from_db ( $row ["d_pay"] ) : "",
					"c_approve" => $row ["c_approve"],
					"c_acc_item" => $row ["c_acc_item"],
					"i_type_year" => $row ["i_type_year"],
					"c_budget_year" => ($row ["i_type_year"] == 1) ? ($row ["c_budget_year"] + 543) : ($row ["c_budget_year"] + 543) . " (เหลื่อมปี)",
					"f_inv" => $row ["f_inv"],
					"c_cheque" => $row ["c_cheque"],
					"dc_acc_id_last" => $row ["dc_acc_id_last"],
					"c_acc_last_full" => $row ["c_acc_last_full"],
					"dc_acc_id_control" => $row ["dc_acc_id_control"],
					"c_acc_control_full" => ($row ["c_acc_control_full"] != "" || $row["i_type"] == 1) ? $row ["c_acc_control_full"] : "- ไม่มีบัญชีคุม LV4 -",
					"i_acc_control_full" => ($row ["dc_acc_id_control"] > 0) ? 1 : 2,
					"dc_acc_id_control_lv5" => $row ["dc_acc_id_control_lv5"],
					"c_acc_control_full_lv5" => ($row ["c_acc_control_full_lv5"] != "" || $row["i_type"] == 1) ? $row ["c_acc_control_full_lv5"] : "- ไม่มีบัญชีคุม LV5 -",
					"i_acc_control_full_lv5" => ($row ["dc_acc_id_control_lv5"] > 0) ? 1 : 2 
			);
			
			if ($row ["i_type"] == 1) {
				$f_inv += $row ["f_inv"];
			}
			
			${$root} [] = $temp;
		}
		
		$temp = array (
				"i_type" => 7,
				"f_inv" => $f_inv 
		);
		
		${$root} [] = $temp;
	}
	
	return json_encode ( array (
			"debug" => true,
			"totalCount" => $totalCount,
			$root => ${$root} 
	) );
}
