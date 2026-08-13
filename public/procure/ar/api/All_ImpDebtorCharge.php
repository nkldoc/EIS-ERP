<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_debtor_type") {

	$sqlMain	= "
		SELECT a.* FROM dbo.dc_debtor_type a
		WHERE a.i_enable = ? AND a.i_delete = ?
		ORDER BY a.c_name;";

	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
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
				"id"		=> "{$row["dc_debtor_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_debtor_claim") {

	$sqlMain	= "
		SELECT a.* FROM dbo.dc_debtor_claim a
		WHERE a.i_enable = ? AND a.i_delete = ?
		ORDER BY a.c_name;";

	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
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
				"id"		=> "{$row["dc_debtor_claim_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_cost_debtor") {

	$sqlMain	= "
		SELECT a.* FROM dbo.dc_cost_debtor a
		WHERE a.i_enable = ? AND a.i_delete = ?
		ORDER BY a.c_name;";

	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
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
				"id"		=> "{$row["dc_cost_debtor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
