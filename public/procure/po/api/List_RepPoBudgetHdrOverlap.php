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

	$con .= " AND a.i_year = " . $_REQUEST["i_year"];
	if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		$con .= " AND a.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT a.i_year
			, c.c_name AS dc_expense_budget_type_name
			, b.c_code_ref
			, b.c_expense_name
			, b.c_expense_group_name
			, b.f_total
			, b.c_creditor
			, b.c_comment
		FROM po_budget_hdr_overlap a
		INNER JOIN po_budget_dtl_overlap b on a.po_budget_hdr_overlap_id = b.po_budget_hdr_overlap_id
		INNER JOIN dc_expense_budget_type c on a.dc_expense_budget_type_id = c.dc_expense_budget_type_id
	WHERE 1=1 {$con};";

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$f_total = 0;
		while ($row = $db->Fetch($stmt)) {

			$f_total += $row["f_total"];
			$temp = array(
				"i_type"						=> 1,
				"i_year"						=> $row["i_year"] + 543,
				"dc_expense_budget_type_name"	=> $row["dc_expense_budget_type_name"],
				"c_code_ref"					=> $row["c_code_ref"],
				"c_expense_name"				=> $row["c_expense_name"],
				"c_expense_group_name"			=> $row["c_expense_group_name"],
				"f_total"						=> $row["f_total"],
				"c_creditor"					=> $row["c_creditor"],
				"c_comment"						=> $row["c_comment"]
			);
			${$root}[] = $temp;
		}

		$temp = array(
			"i_type"						=> 2,
			"f_total"						=> $f_total
		);
		${$root}[] = $temp;
	}



	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
