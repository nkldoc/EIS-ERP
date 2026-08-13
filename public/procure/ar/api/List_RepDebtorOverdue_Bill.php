<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;

	// if ($_REQUEST["d_date_start"] != "" && $_REQUEST["d_date_end"] != "") {
	// 	$con .= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	// }

	// if ($_REQUEST["i_status"] != 99) {
	// 	$con .= " AND b.i_status = " . $_REQUEST["i_status"];
	// }

	// $i_year = $_REQUEST["i_year"];
	// $budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";

	// if ($_REQUEST["i_expense"] == 1) {
	// 	$for_id = explode(";", $_REQUEST["po_expense_id_lv1"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND c.po_expense_lv1_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else if ($_REQUEST["i_expense"] == 2) {
	// 	$for_id = explode(";", $_REQUEST["po_expense_id_lv2"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND c.po_expense_lv2_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else if ($_REQUEST["i_expense"] == 3) {
	// 	$for_id = explode(";", $_REQUEST["po_expense_id_lv3"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND c.po_expense_lv3_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else {
	// 	$for_id = explode(";", $_REQUEST["po_expense_id_lv4"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND c.po_expense_lv4_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } 
	$sqlMain = "
		SET NOCOUNT ON;
		SELECT
			a.i_count_bill_dtl
			,a.ar_treat_right_id
			,b.c_name AS ar_treat_right_name
			,a.ar_cost_id
			,c.c_name AS ar_cost_name
			,a.c_hn
			,a.c_an
			,a.c_patient
			,CONVERT(VARCHAR, a.d_service_date, 120) AS d_service_date
			,a.c_service_time
			,CONVERT(VARCHAR, a.d_encash_date, 120) AS d_encash_date
			,a.c_encash_time
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_bill_date, 120) AS d_bill_date
			,a.f_bill
			,a.c_code_cut
			,CONVERT(VARCHAR, a.d_cut_date, 120) AS d_cut_date
			,a.f_cut
			,CONVERT(VARCHAR, a.d_cancel_bill_date, 120) AS d_cancel_bill_date
		FROM vw_ar_bill_cut_receipt a
			LEFT JOIN ar_treat_right b ON a.ar_treat_right_id = b.ar_treat_right_id
			LEFT JOIN ar_cost c ON a.ar_cost_id = c.ar_cost_id
		WHERE a.ar_bill_dtl_id IS NOT NULL
			AND a.ar_bill_hdr_id = {$_REQUEST["ar_bill_hdr_id"]}
			AND a.ar_treat_right_id = {$_REQUEST["ar_treat_right_id"]}
		ORDER BY a.c_hn, a.i_count_bill_dtl;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$no = 0;
		$f_bill = 0;
		$f_cut = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				// "i_type"								=> 1,
				"no"									=> ($row["i_count_bill_dtl"] == 1) ? ++$no : "",
				"ar_treat_right_id"						=> ($row["i_count_bill_dtl"] == 1) ? $row["ar_treat_right_id"] : "",
				"ar_treat_right_name"					=> ($row["i_count_bill_dtl"] == 1) ? $row["ar_treat_right_name"] : "",
				"ar_cost_name"							=> ($row["i_count_bill_dtl"] == 1) ? $row["ar_cost_name"] : "",
				"c_hn"									=> ($row["i_count_bill_dtl"] == 1) ? $row["c_hn"] : "",
				"c_an"									=> ($row["i_count_bill_dtl"] == 1) ? $row["c_an"] : "",
				"c_patient"								=> ($row["i_count_bill_dtl"] == 1) ? $row["c_patient"] : "",
				"d_service_date"						=> ($row["i_count_bill_dtl"] == 1 && $row["d_service_date"] != "") ? $date->shot_date_from_db($row["d_service_date"]) : "",
				"d_encash_date"							=> ($row["i_count_bill_dtl"] == 1 && $row["d_encash_date"] != "") ? $date->shot_date_from_db($row["d_encash_date"]) : "",
				"c_code_bill"							=> ($row["i_count_bill_dtl"] == 1) ? $row["c_code_bill"] : "",
				"d_bill_date"							=> ($row["i_count_bill_dtl"] == 1 && $row["d_bill_date"] != "") ? $date->shot_date_from_db($row["d_bill_date"]) : "",
				"c_code_cut"							=> $row["c_code_cut"],
				"d_cut_date"							=> ($row["d_cut_date"] != "") ? $date->shot_date_from_db($row["d_cut_date"]) : "",
				"f_bill"								=> ($row["i_count_bill_dtl"] == 1) ? $row["f_bill"] : "",
				"f_cut"									=> $row["f_cut"],
				"i_count_bill_dtl"						=> $row["i_count_bill_dtl"],
				"i_cancel_bill"							=> ($row["d_cancel_bill_date"] != "") ? 1 : 0,
			);
			${$root}[]	= $temp;
			$f_bill += $row["f_bill"];
			$f_cut += $row["f_cut"];
		}
		$temp = array(
			"i_type"						=> 1,
			"c_name"						=> "รวมทั้งสิ้น",
			"f_bill"						=> $f_bill,
			"f_cut"							=> $f_cut,
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
