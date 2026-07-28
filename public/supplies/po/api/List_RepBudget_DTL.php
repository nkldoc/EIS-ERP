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

	$i_year = $_REQUEST["i_year"];
	$budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND b.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";

	if ($_REQUEST["i_expense"] == 1) {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv1"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.po_expense_lv1_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_expense"] == 2) {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv2"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.po_expense_lv2_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_expense"] == 3) {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv3"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.po_expense_lv3_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv4"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND c.po_expense_lv4_id IN (" . $in . ")" : "";
			}
		}
	}

	$con .= (@$_REQUEST["i_success"] == 1) ? " AND b.i_success = 1" : " AND a.i_status_last >= 4";
	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @i_year AS numeric;
		SET @i_year = ?;
		SELECT
			a.c_code_ref
			,b.c_approve
			,d.c_name AS budget_name
			,b.po_expense_id
			,c.c_code_lv4
			,c.c_name_lv4
			,b.i_budget_year_overlap
			,b.f_total
			,b.i_success
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent c ON b.po_expense_id = c.po_expense_lv4_id
				AND c.po_expense_lv{$_REQUEST["i_level"]}_id = {$_REQUEST["po_expense_id"]}
			INNER JOIN dbo.po_working_item e ON a.po_working_hdr_id = e.po_working_hdr_id AND e.i_status = 5
			LEFT JOIN dbo.dc_expense_budget_type d ON b.dc_expense_budget_type_id = d.dc_expense_budget_type_id
		WHERE b.i_budget_year_overlap = @i_year
			AND a.i_enable = 1
			AND e.d_doc_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'
			 {$con} {$budget1}
		ORDER BY b.i_success;";

	$stmt = $db->QueryParam($sqlMain, array($i_year));

	if ($stmt) {
		$no = 0;
		$f_no_pay = 0;
		$f_pay = 0;
		$f_total = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"						=> 1,
				"no"							=> ++$no,
				"c_code_ref"					=> $row["c_code_ref"],
				"c_approve"						=> $row["c_approve"],
				"budget_name"					=> $row["budget_name"],
				"po_expense_id"					=> $row["po_expense_id"],
				"c_name_lv4"					=> $row["c_code_lv4"] . " : " . $row["c_name_lv4"],
				"i_budget_year_overlap"			=> $row["i_budget_year_overlap"],
				"f_total"						=> $row["f_total"],
				"i_success"						=> $row["i_success"],
			);
			${$root}[]	= $temp;
			$f_total += $row["f_total"];

			if ($row["i_success"] ==  1) {
				$f_pay += $row["f_total"];
			} else {
				$f_no_pay += $row["f_total"];
			}
		}
		$temp = array(
			"c_name"						=> "รวมยังไม่ทำทะเบียนจ่าย",
			"i_type"						=> 2,
			"f_total"						=> $f_no_pay
		);
		${$root}[]	= $temp;
		$temp = array(
			"c_name"						=> "รวมเบิกจ่ายทั้งสิ้น",
			"i_type"						=> 3,
			"f_total"						=> $f_pay
		);
		${$root}[]	= $temp;
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_total"						=> $f_total
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
