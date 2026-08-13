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

	if ($_REQUEST["d_date_start"] != "" && $_REQUEST["d_date_end"] != "") {
		$con .= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	}

	if ($_REQUEST["i_status"] != 99) {
		$con .= " AND b.i_status = " . $_REQUEST["i_status"];
	}

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
		/* เรียกเก็บ */
		SELECT
			d.ar_treat_right_group_id
			,d.c_name AS ar_treat_right_group_name
			,c.ar_treat_right_id
			,c.c_name AS ar_treat_right_name
			,b.ar_cost_id
			,a1.c_name AS ar_cost_name
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
			,b.c_hn
			,b.c_an
			,b.c_patient
			,CONVERT(VARCHAR, b.d_service_date, 120) AS d_service_date
			,CONVERT(VARCHAR, b.d_encash_date, 120) AS d_encash_date
			,b.f_cost_amt
		FROM dbo.ar_bill_invoice_hdr a
			INNER JOIN dbo.ar_bill_invoice_dtl b ON a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id
			INNER JOIN dbo.ar_treat_right c ON b.ar_treat_right_id = c.ar_treat_right_id
			INNER JOIN dbo.ar_treat_right_group d ON c.ar_treat_right_group_id = d.ar_treat_right_group_id
		
			LEFT JOIN dbo.ar_cost a1 ON b.ar_cost_id = a1.ar_cost_id
		WHERE a.i_enable = 1
			AND c.ar_treat_right_id = {$_REQUEST["ar_treat_right_id"]}
			{$con}
		ORDER BY a.d_doc_date, d.c_name, c.c_name, a.c_code_bill, a1.c_name, b.d_service_date, b.d_encash_date;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$no = 0;
		$f_cost_amt = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"								=> 1,
				"no"									=> ++$no,
				"ar_treat_right_group_name"				=> $row["ar_treat_right_group_name"],
				"ar_treat_right_name"					=> $row["ar_treat_right_name"],
				"ar_cost_name"							=> $row["ar_cost_name"],
				"c_code_bill"							=> $row["c_code_bill"],
				"d_doc_date"							=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"c_hn"									=> $row["c_hn"],
				"c_an"									=> $row["c_an"],
				"c_patient"								=> $row["c_patient"],
				"d_service_date"						=> ($row["d_service_date"] != "") ? $date->extDateBuddha($row["d_service_date"]) : "",
				"d_encash_date"							=> ($row["d_encash_date"] != "") ? $date->extDateBuddha($row["d_encash_date"]) : "",
				"f_cost_amt"							=> $row["f_cost_amt"],
			);
			${$root}[]	= $temp;
			$f_cost_amt += $row["f_cost_amt"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 2,
			"f_cost_amt"					=> $f_cost_amt
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
