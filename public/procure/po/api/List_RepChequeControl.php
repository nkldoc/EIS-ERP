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

	// $ArrSum = array();
	// $ArrSumlv4 = array();
	// $ArrSumlv5 = array();
	// $ArrD	= array(1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ");


	// /* ====================== */
	// $conn = "";
	// $for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
	// if (!in_array("0", $for_id)) {
	// 	$in = "";
	// 	if (is_array($for_id)) {
	// 		foreach ($for_id as $val) {
	// 			$in .= ($in == "") ? $val : ", " . $val;
	// 		}
	// 		$con .= ($in != "") ? " AND a.dc_expense_budget_type_id IN (" . $in . ")" : "";
	// 		$conn .= ($in != "") ? " AND cc.dc_expense_budget_type_id IN (" . $in . ")" : "";
	// 	}
	// }

	// if ($_REQUEST["i_type_year"] > 0) {
	// 	$con .= " AND b.i_type_year = " . $_REQUEST["i_type_year"] . "AND b.c_budget_year = " . $_REQUEST["c_budget_year"];
	// 	$conn .= " AND cc.i_type_year = " . $_REQUEST["i_type_year"] . " AND cc.c_budget_year = " . $_REQUEST["c_budget_year"];
	// }

	// if ($_REQUEST["i_show_acc"] == 1) {
	// 	$for_id = explode(";", $_REQUEST["dc_acc_id_parent"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND e.dc_acc_lv4_id IN (" . $in . ")" : "";
	// 			$conn .= ($in != "") ? " AND ff.dc_acc_lv4_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else if ($_REQUEST["i_show_acc"] == 3) {
	// 	$for_id = explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND e.dc_acc_lv5_id IN (" . $in . ")" : "";
	// 			$conn .= ($in != "") ? " AND ff.dc_acc_lv5_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else {
	// 	$for_id = explode(";", $_REQUEST["dc_acc_id"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND b.dc_acc_id_report IN (" . $in . ")" : "";
	// 			$conn .= ($in != "") ? " AND ff.dc_acc_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// }

	// $for_id = explode(";", $_REQUEST["dc_user_create_id"]);
	// if (!in_array("0", $for_id)) {
	// 	$in = "";
	// 	if (is_array($for_id)) {
	// 		foreach ($for_id as $val) {
	// 			$in .= ($in == "") ? $val : ", " . $val;
	// 		}
	// 		$con .= ($in != "") ? " AND a.dc_user_create_id IN (" . $in . ")" : "";
	// 		$conn .= ($in != "") ? " AND bb.dc_user_create_id IN (" . $in . ")" : "";
	// 	}
	// }
	// $i_year = $_REQUEST["i_year"];
	// $wh_working = "";
	// $wh_budget = "";
	// if ($_REQUEST["dc_expense_budget_type_id"] > 0){
	// 	$wh_working = " AND bb.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}";
	// 	$wh_budget = " AND hdr.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}";
	// }
	if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		$con .= " AND b.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
	}

	if ($_REQUEST["i_cheque"] > 0) {
		$con .= " AND c.i_cheque = " . $_REQUEST["i_cheque"];
	}

	if ($_REQUEST["i_success"] == 1) {
		$con .= " AND b.i_success = 1";
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER(ORDER BY CASE WHEN c.c_cheque IS NULL THEN 0 ELSE 1 END DESC, c.c_cheque, b.c_approve) AS [row]
			,ROW_NUMBER() OVER (PARTITION BY a.po_working_hdr_id ORDER BY d.d_doc_date,f.c_name, b.c_approve, e.c_code, CASE WHEN c.c_cheque IS NULL THEN 0 ELSE 1 END DESC, c.c_cheque) AS i_type
			,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
			,CONVERT(VARCHAR, c.d_pay_date, 120) AS d_pay_date
			,f.c_name AS budget_name
			,b.c_approve
			,b.i_budget_year_overlap
			,e.c_name AS expense_name
			,c.c_creditor
			,c.f_total
			,c.c_cheque
			,c.i_status
		INTO #temp
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_cheque c ON a.po_working_hdr_id = c.po_working_hdr_id
			LEFT JOIN dbo.po_working_item d ON a.po_working_hdr_id = d.po_working_hdr_id AND d.i_status = {$_REQUEST["i_status"]}
			LEFT JOIN dbo.bg_expense e ON b.bg_expense_id = e.bg_expense_id
			LEFT JOIN dbo.dc_expense_budget_type f ON b.dc_expense_budget_type_id = f.dc_expense_budget_type_id
		WHERE a.i_enable = 1 AND d.d_doc_date IS NOT NULL
			AND d.d_doc_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'
			{$con}
		ORDER BY [row];
		
		SELECT
			d_doc_date
			,d_pay_date
			,budget_name
			,c_approve
			,i_budget_year_overlap
			,expense_name
			,c_creditor
			,f_total
			,c_cheque
			,i_status
		FROM #temp
		ORDER BY [row];";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$f_total = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"					=> 1,
				"d_doc_date"				=> ($row["d_doc_date"] != "") ? $date->shot_date_from_db($row["d_doc_date"]) : "",
				"d_pay_date"				=> ($row["d_pay_date"] != "") ? $date->shot_date_from_db($row["d_pay_date"]) : "",
				"budget_name"				=> $row["budget_name"],
				"c_approve"					=> $row["c_approve"],
				"i_year"					=> $row["i_budget_year_overlap"]+543,
				"expense_name"				=> $row["expense_name"],
				"c_creditor"				=> $row["c_creditor"],
				"f_total"					=> $row["f_total"],
				"c_cheque"					=> $row["c_cheque"],
				"i_status"					=> $row["i_status"],
			);
			${$root}[]	= $temp;

			$f_total += $row["f_total"];
		}

		$temp = array(
			"i_type"					=> 2,
			"f_total"					=> $f_total
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
