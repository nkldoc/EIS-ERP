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
		SELECT * FROM dbo.ar_debtor_type a
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
				"c_comment"						=> $row["c_comment"],
				"i_enable"						=> $row["i_enable"]
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
