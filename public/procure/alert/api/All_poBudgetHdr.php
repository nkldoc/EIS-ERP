<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM dbo.dc_expense_budget_type WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_expense_budget_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_expense") {

	$sqlMain = "
		SELECT
			a.po_expense_id
			,b.c_code AS c_group_code
			,b.c_name AS c_group_name
			,a.c_code
			,a.c_name
		FROM dbo.po_expense a
			INNER JOIN po_expense b ON LEFT(a.c_code_tree,2) = LEFT(b.c_code_tree,2) AND b.i_enable = 1 AND b.i_level = 1
		WHERE a.i_last = 1 AND a.i_delete = 2 AND a.i_enable = ?
		ORDER BY a.c_code;";
	$arrParam = array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_expense_id"]}",
				"c_name"	=>  $row["c_code"] . " : " . $row["c_name"],
				"c_group_name"	=>  $row["c_group_code"] . " : " . $row["c_group_name"],
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
