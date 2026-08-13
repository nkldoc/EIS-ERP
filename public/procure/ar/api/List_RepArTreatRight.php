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

	// $con .= " AND a.i_year = " . $_REQUEST["i_year"];
	// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
	// 	$con .= " AND a.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
	// }

	$sqlMain = "
		SET NOCOUNT ON;
		SELECT a.*,b.c_name AS c_group_name FROM dbo.ar_treat_right a
			LEFT JOIN dbo.ar_treat_right_group b ON a.ar_treat_right_group_id = b.ar_treat_right_group_id
		ORDER BY a.c_name;";

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		$numrow = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"numrow"						=> ++$numrow,
				"c_code"						=> $row["c_code"],
				"c_name"						=> $row["c_name"],
				"c_group_name"					=> ($row["c_group_name"]) ? $row["c_group_name"] : "-",
				"c_comment"						=> $row["c_comment"],
				"i_enable"						=> $row["i_enable"]
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
