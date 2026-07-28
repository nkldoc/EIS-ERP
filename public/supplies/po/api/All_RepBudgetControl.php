<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "po_expense") {

	$sqlMain = "
		SELECT
			a.*
		FROM dbo.po_expense a
		WHERE a.i_enable = 1 AND a.i_delete = 2
			AND a.i_level = {$_REQUEST["i_level"]}
		ORDER BY a.c_code_tree;";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "- เลือกทั้งหมด -"
		);

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_expense_id"]}",
				"c_name"	=> $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
