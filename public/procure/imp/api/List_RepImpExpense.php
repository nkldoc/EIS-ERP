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
	
	if ($_REQUEST ["d_date_start"] != "" && $_REQUEST ["d_date_end"] != "") {
		$con .= " AND b.d_pay BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	}
	
	if ($_REQUEST ["dc_expense_id"] > 0) {
		$con .= " AND b.dc_expense_id = " . $_REQUEST ["dc_expense_id"];
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
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					b.imp_expense_dtl_id
					,a.dc_expense_budget_type_id
					,d.c_name AS dc_expense_budget_type_name
					,b.dc_expense_id
					,e.dc_acc_lv4_id
					,e.c_name_lv4 AS acc_name_lv4
					,e.c_code_lv4 AS acc_code_lv4
					,e.dc_acc_lv5_id
					,e.c_name_lv5 AS acc_name_lv5
					,e.c_code_lv5 AS acc_code_lv5
					,c.c_name AS dc_expense_name
					,e.c_name AS acc_name
					,CONVERT(VARCHAR, b.d_pay, 120) AS d_pay
					,b.i_type_year
					,b.c_budget_year
					,b.c_approve
					,b.c_acc_item
					,b.c_creditor
					,b.f_inv
					,b.f_vat
					,b.f_tax_personal
					,b.f_tax_corporate
					,b.f_social_security
					,b.f_money1
					,b.f_fine
					,b.f_total
					,b.f_check_total
					,b.c_cheque_numbers
				FROM imp_expense_hdr a
					INNER JOIN vw_imp_expense_dtl_items b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
					LEFT JOIN dc_expense c ON b.dc_expense_id = c.dc_expense_id
					LEFT JOIN dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
					LEFT JOIN vw_dc_acc_with_parent e ON b.dc_acc_id_report = e.dc_acc_id
				WHERE a.i_enable = ? and LEFT(a.c_code,4)='IMPE'
					{$con}
				ORDER BY
					CASE WHEN e.c_name_lv4 IS NULL THEN 1 ELSE 0 END, e.c_name_lv4,
					CASE WHEN e.c_name_lv5 IS NULL THEN 1 ELSE 0 END, e.c_name_lv5,
					e.c_name;";
		
	$arrParam [] = STATUS_ENABLE;
	
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	
	$sum_f_inv = 0;
	$sum_f_vat = 0;
	$sum_f_tax_personal = 0;
	$sum_f_tax_corporate = 0;
	$sum_f_social_security = 0;
	$sum_f_money1 = 0;
	$sum_f_fine = 0;
	$sum_f_total = 0;
	$sum_f_check_total = 0;
	
	if ($stmt) {
		
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["acc_name_lv4"] = $row ["acc_name_lv4"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["acc_code_lv4"] = $row ["acc_code_lv4"];
			
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["acc_name_lv5"] = $row ["acc_name_lv5"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["acc_code_lv5"] = $row ["acc_code_lv5"];
			
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["dc_expense_budget_type_name"] = $row ["dc_expense_budget_type_name"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["dc_expense_name"] = $row ["dc_expense_name"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["acc_name_lv4"] = $row ["acc_name_lv4"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["acc_name_lv5"] = $row ["acc_name_lv5"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["acc_name"] = $row ["acc_name"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["d_pay"] = ($row ["d_pay"] != "") ? $date->shot_date_from_db ( $row ["d_pay"] ) : "";
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["i_type_year"] = $row ["i_type_year"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["c_budget_year"] = ($row ["i_type_year"] == 1) ? ($row ["c_budget_year"] + 543) : ($row ["c_budget_year"] + 543) . " (เหลื่อมปี)";
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["c_approve"] = $row ["c_approve"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["c_acc_item"] = $row ["c_acc_item"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["c_creditor"] = $row ["c_creditor"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_inv"] = $row ["f_inv"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_vat"] = $row ["f_vat"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_tax_personal"] = $row ["f_tax_personal"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_tax_corporate"] = $row ["f_tax_corporate"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_social_security"] = $row ["f_social_security"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_money1"] = $row ["f_money1"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_fine"] = $row ["f_fine"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_total"] = $row ["f_total"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["f_check_total"] = $row ["f_check_total"];
			$ArrExpenseDtl [$row ["dc_acc_lv4_id"]] ["data"] [$row ["dc_acc_lv5_id"]] ["data"] [$row ["imp_expense_dtl_id"]] ["c_cheque_numbers"] = $row ["c_cheque_numbers"];
		}
		
		if (isset ( $ArrExpenseDtl )) {
			foreach ( $ArrExpenseDtl as $dc_acc_lv4_id => $obj_acc_lv4 ) {
				
				// LV4
				$f_inv = 0;
				$f_vat = 0;
				$f_tax_personal = 0;
				$f_tax_corporate = 0;
				$f_social_security = 0;
				$f_money1 = 0;
				$f_fine = 0;
				$f_total = 0;
				$f_check_total = 0;
				
				foreach ( $obj_acc_lv4 ["data"] as $dc_acc_lv5_id => $obj_acc_lv5 ) {
					
					// LV5
					$f_inv_lv5 = 0;
					$f_vat_lv5 = 0;
					$f_tax_personal_lv5 = 0;
					$f_tax_corporate_lv5 = 0;
					$f_social_security_lv5 = 0;
					$f_money1_lv5 = 0;
					$f_fine_lv5 = 0;
					$f_total_lv5 = 0;
					$f_check_total_lv5 = 0;
					
					foreach ( $obj_acc_lv5 ["data"] as $imp_expense_dtl_id => $obj ) {
						
						$temp = array (
								"i_type" => 1,
								"dc_expense_budget_type_name" => $obj ["dc_expense_budget_type_name"],
								"dc_expense_name" => $obj ["dc_expense_name"],
								"acc_name_lv4" => $obj ["acc_name_lv4"],
								"acc_name_lv5" => $obj ["acc_name_lv5"],
								"acc_name" => $obj ["acc_name"],
								"d_pay" => $obj ["d_pay"],
								"c_budget_year" => $obj ["c_budget_year"],
								"c_approve" => $obj ["c_approve"],
								"c_acc_item" => $obj ["c_acc_item"],
								"c_creditor" => $obj ["c_creditor"],
								"f_inv" => $obj ["f_inv"],
								"f_vat" => $obj ["f_vat"],
								"f_tax_personal" => $obj ["f_tax_personal"],
								"f_tax_corporate" => $obj ["f_tax_corporate"],
								"f_social_security" => $obj ["f_social_security"],
								"f_money1" => $obj ["f_money1"],
								"f_fine" => $obj ["f_fine"],
								"f_total" => $obj ["f_total"],
								"f_check_total" => $obj ["f_check_total"],
								"c_cheque_numbers" => $obj ["c_cheque_numbers"] 
						);
						${$root} [] = $temp;
						
						// SUM_LV4
						$f_inv += $obj ["f_inv"];
						$f_vat += $obj ["f_vat"];
						$f_tax_personal += $obj ["f_tax_personal"];
						$f_tax_corporate += $obj ["f_tax_corporate"];
						$f_social_security += $obj ["f_social_security"];
						$f_money1 += $obj ["f_money1"];
						$f_fine += $obj ["f_fine"];
						$f_total += $obj ["f_total"];
						$f_check_total += $obj ["f_check_total"];
						// SUM_LV5
						$f_inv_lv5 += $obj ["f_inv"];
						$f_vat_lv5 += $obj ["f_vat"];
						$f_tax_personal_lv5 += $obj ["f_tax_personal"];
						$f_tax_corporate_lv5 += $obj ["f_tax_corporate"];
						$f_social_security_lv5 += $obj ["f_social_security"];
						$f_money1_lv5 += $obj ["f_money1"];
						$f_fine_lv5 += $obj ["f_fine"];
						$f_total_lv5 += $obj ["f_total"];
						$f_check_total_lv5 += $obj ["f_check_total"];
						// SUM_TOTAL
						$sum_f_inv += $obj ["f_inv"];
						$sum_f_vat += $obj ["f_vat"];
						$sum_f_tax_personal += $obj ["f_tax_personal"];
						$sum_f_tax_corporate += $obj ["f_tax_corporate"];
						$sum_f_social_security += $obj ["f_social_security"];
						$sum_f_money1 += $obj ["f_money1"];
						$sum_f_fine += $obj ["f_fine"];
						$sum_f_total += $obj ["f_total"];
						$sum_f_check_total += $obj ["f_check_total"];
					}
					
					// SUM LV5
					$temp = array (
							"i_type" => 4,
							"acc_name_lv5" => ($obj_acc_lv5 ["acc_name_lv5"] == "") ? "- ไม่ระบุบัญชีคุม -" : $obj_acc_lv5 ["acc_code_lv5"]." ".$obj_acc_lv5 ["acc_name_lv5"],
							"f_inv" => $f_inv_lv5,
							"f_vat" => $f_vat_lv5,
							"f_tax_personal" => $f_tax_personal_lv5,
							"f_tax_corporate" => $f_tax_corporate_lv5,
							"f_social_security" => $f_social_security_lv5,
							"f_money1" => $f_money1_lv5,
							"f_fine" => $f_fine_lv5,
							"f_total" => $f_total_lv5,
							"f_check_total" => $f_check_total_lv5 
					);
					
					${$root} [] = $temp;
				}
				
				// SUM LV4
				$temp = array (
						"i_type" => 2,
						"acc_name_lv4" => ($obj_acc_lv4 ["acc_name_lv4"] == "") ? "- ไม่ระบุบัญชีคุม -" : $obj_acc_lv4 ["acc_code_lv4"]." ".$obj_acc_lv4 ["acc_name_lv4"],
						"f_inv" => $f_inv,
						"f_vat" => $f_vat,
						"f_tax_personal" => $f_tax_personal,
						"f_tax_corporate" => $f_tax_corporate,
						"f_social_security" => $f_social_security,
						"f_money1" => $f_money1,
						"f_fine" => $f_fine,
						"f_total" => $f_total,
						"f_check_total" => $f_check_total 
				);
				
				${$root} [] = $temp;
			}
		}
	}
	
	$temp = array (
			"i_type" => 3,
			"f_inv" => $sum_f_inv,
			"f_vat" => $sum_f_vat,
			"f_tax_personal" => $sum_f_tax_personal,
			"f_tax_corporate" => $sum_f_tax_corporate,
			"f_social_security" => $sum_f_social_security,
			"f_money1" => $sum_f_money1,
			"f_fine" => $sum_f_fine,
			"f_total" => $sum_f_total,
			"f_check_total" => $sum_f_check_total 
	);
	
	${$root} [] = $temp;
	
	return json_encode ( array (
			"debug" => true,
			"totalCount" => $totalCount,
			$root => ${$root} 
	) );
}
?>
