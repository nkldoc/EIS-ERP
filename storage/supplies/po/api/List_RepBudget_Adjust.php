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
		DECLARE @i_year AS numeric = ?;
		/* โอนภายนอก */
		SELECT
			1 AS i_status
			,d.c_name AS budget_name
			,b.po_expense_id
			,NULL AS parent_code
			,NULL AS parent_name
			,c.c_code_lv4
			,c.c_name_lv4
			,a.i_year
			,b.f_increase
			,b.f_decrease
		FROM po_budget_adjust_hdr a
			INNER JOIN po_budget_adjust_dtl b ON a.po_budget_adjust_hdr_id = b.po_budget_adjust_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent c ON b.po_expense_id = c.po_expense_lv4_id
				AND c.po_expense_lv{$_REQUEST["i_level"]}_id = {$_REQUEST["po_expense_id"]}
			LEFT JOIN dbo.dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
		WHERE a.i_enable = 1
			AND a.i_year = @i_year
			AND (b.f_increase > 0 OR b.f_decrease > 0)
			{$con} {$budget1}
		UNION ALL
		/* โอนภายใน */
		SELECT
			2 AS i_status
			,d.c_name AS budget_name
			,b.po_expense_begin_id AS po_expense_id
			,e.c_code AS parent_code
			,e.c_name AS parent_name
			,c.c_code_lv4
			,c.c_name_lv4
			,a.i_year
			,0 AS f_increase
			,ISNULL(b.f_total, 0) AS f_decrease
		FROM po_budget_transfer_hdr a
			INNER JOIN po_budget_transfer_dtl b ON a.po_budget_transfer_hdr_id = b.po_budget_transfer_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent c ON b.po_expense_begin_id = c.po_expense_lv4_id
				AND c.po_expense_lv{$_REQUEST["i_level"]}_id = {$_REQUEST["po_expense_id"]}
			LEFT JOIN dbo.dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
			LEFT JOIN dbo.po_expense e ON b.po_expense_end_id = e.po_expense_id
		WHERE a.i_enable = 1 AND a.i_transfer = 1
			AND b.f_total > 0
			AND a.i_year = @i_year
			{$con} {$budget1}
		UNION ALL
		SELECT
			3 AS i_status
			,d.c_name AS budget_name
			,b.po_expense_end_id AS po_expense_id
			,e.c_code AS parent_code
			,e.c_name AS parent_name
			,c.c_code_lv4
			,c.c_name_lv4
			,a.i_year
			,ISNULL(b.f_total, 0) AS f_increase
			,0 AS f_decrease
		FROM po_budget_transfer_hdr a
			INNER JOIN po_budget_transfer_dtl b ON a.po_budget_transfer_hdr_id = b.po_budget_transfer_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent c ON b.po_expense_end_id = c.po_expense_lv4_id
				AND c.po_expense_lv{$_REQUEST["i_level"]}_id = {$_REQUEST["po_expense_id"]}
			LEFT JOIN dbo.dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
			LEFT JOIN dbo.po_expense e ON b.po_expense_begin_id = e.po_expense_id
		WHERE a.i_enable = 1 AND a.i_transfer = 1
			AND b.f_total > 0
			AND a.i_year = @i_year
			{$con} {$budget1}
		ORDER BY c_code_lv4;";

	$stmt = $db->QueryParam($sqlMain, array($i_year));

	if ($stmt) {
		$no = 0;
		$f_increase = 0;
		$f_decrease = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"						=> 1,
				"no"							=> ++$no,
				"i_status"						=> $row["i_status"],
				"budget_name"					=> $row["budget_name"],
				"po_expense_id"					=> $row["po_expense_id"],
				"c_name_lv4"					=> $row["c_code_lv4"] . " : " . $row["c_name_lv4"],
				"parent_name"					=> $row["parent_code"] . " : " . $row["parent_name"],
				"i_budget_year_overlap"			=> $row["i_year"],
				"f_increase"					=> $row["f_increase"],
				"f_decrease"					=> $row["f_decrease"],
			);
			${$root}[]	= $temp;
			$f_increase += $row["f_increase"];
			$f_decrease += $row["f_decrease"];
		}
		$temp = array(
			"c_name"						=> "รวมทั้งสิ้น",
			"i_type"						=> 4,
			"f_increase"					=> $f_increase,
			"f_decrease"					=> $f_decrease,

		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
