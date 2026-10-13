<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_cost") {

	$sqlMain = "
		SELECT * 
		FROM " . DB_CENTER . "dc_cost 
		WHERE i_enable = 1 
			AND i_delete = 2  
			AND i_last = 1
		ORDER BY c_code
	";
	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- Admin -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> $row["dc_cost_id"],
				"c_name"	=>  $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_user") {

	$sqlMain = "
		SELECT * FROM " . DB_CENTER . "dc_user ORDER BY c_full_name
	";
	$arrParam = array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- Admin -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> $row["dc_user_id"],
				"c_name"	=>  $row["c_user_name"] . " : " . $row["c_full_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
