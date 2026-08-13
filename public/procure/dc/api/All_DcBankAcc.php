<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configDc.php");

$db = new DatabaseServer();

$root	= "data";

if ($_REQUEST["type"] == "bank") {
	$sqlMain	= "	SELECT * FROM dc_bank WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(1, 2));
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_bank_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bank_all") {
	$sqlMain	= "	SELECT * FROM dc_bank WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(1, 2));
	if ($stmt) {
		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "ทั้งหมด"
		);
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_bank_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bank_branch") {
	$con	= "";
	if (@$_REQUEST["dc_bank_id"] != "") {
		$con	.=	" AND dc_bank_id = " . $_REQUEST["dc_bank_id"] . " ";
	}
	$sqlMain	= "	SELECT * FROM dc_bank_branch WHERE i_enable = ? AND i_delete = ? {$con} ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(1, 2));
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_bank_branch_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bank_deposit_type") {
	$sqlMain	= "	SELECT * FROM dc_bank_deposit_type WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(1, 2));
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_bank_deposit_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "area") {
	$sqlMain	= "	SELECT * FROM dc_area WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(1, 2));
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_area_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "acc") {
	$sqlMain	= "
		SELECT
			a.*
		FROM dc_acc a
		WHERE a.i_group = ? AND a.i_level = ? AND a.i_last = ? AND a.i_enable = ? AND a.i_delete = ?
		ORDER BY a.c_code;";
	$stmt = $db->QueryParam($sqlMain, array(1, 6, 1, 1, 2));
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_acc_id"]}",
				"c_name"	=> $row["c_code"] . " " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
