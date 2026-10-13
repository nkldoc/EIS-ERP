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
	$budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";

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

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @i_year AS numeric;
		SET @i_year = ?;
		SELECT
			d.c_name AS budget_name
			,b.po_expense_id
			,c.c_code_lv4
			,c.c_name_lv4
			,a.i_year
			,b.f_total
		FROM dbo.po_budget_income_hdr a
			INNER JOIN dbo.po_budget_income_dtl b ON a.po_budget_income_hdr_id = b.po_budget_income_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent c ON b.po_expense_id = c.po_expense_lv4_id
				AND c.po_expense_lv{$_REQUEST["i_level"]}_id = {$_REQUEST["po_expense_id"]}
			LEFT JOIN dbo.dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
		WHERE a.i_year = @i_year
			AND a.i_enable = 1 {$con} {$budget1}
		ORDER BY c.c_code_lv4;";

	$stmt = $db->QueryParam($sqlMain, array($i_year));

	if ($stmt) {
		$no = 0;
		$f_total = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"						=> 1,
				"no"							=> ++$no,
				"budget_name"					=> $row["budget_name"],
				"po_expense_id"					=> $row["po_expense_id"],
				"c_name_lv4"					=> $row["c_code_lv4"] . " : " . $row["c_name_lv4"],
				"i_year"						=> $row["i_year"],
				"f_total"						=> $row["f_total"],
			);
			${$root}[]	= $temp;
			$f_total += $row["f_total"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 2,
			"f_total"						=> $f_total
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
