<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "
		SELECT * FROM dbo.dc_expense_budget_type
		WHERE i_enable = 1 AND i_delete = 2
		ORDER BY c_name";
	$arrParam	= array();
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
				"c_name"	=>  $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_creditor") {

	$sqlMain	= "
		SELECT * FROM dbo.po_creditor
		WHERE i_enable = 1 AND i_delete = 2
		ORDER BY c_name";
	$arrParam	= array();
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
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=>  $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
