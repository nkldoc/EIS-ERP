<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain = "
		SELECT
			*
		FROM dbo.dc_expense_budget_type
		WHERE i_enable = ? AND i_delete = 2
		ORDER BY c_code";
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
				"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bg_expense") {

	$sqlMain = "
		SELECT
			*
		FROM dbo.bg_expense a
		WHERE a.i_enable = ? AND a.i_delete = 2
			AND a.i_level = 4 AND a.i_last = 1
		ORDER BY a.c_code;";
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
				"id"		=> "{$row["bg_expense_id"]}",
				"c_name"	=> $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_cost") {

	$sqlMain = "
		SELECT
			a.*
		FROM dbo.dc_cost a
		WHERE a.i_last = 1 AND a.i_enable = ? AND a.i_delete = 2
			AND a.c_code_tree LIKE '0104%'
		ORDER BY c_code";
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
				"id"		=> "{$row["dc_cost_id"]}",
				"c_name"	=> $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_creditor") {

	$sqlMain = "
		SELECT
			*
		FROM dbo.po_creditor
		WHERE i_enable = ? AND i_delete = 2
		ORDER BY c_name;";
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
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_emp") {

	$sqlMain = "
		SELECT
			*
		FROM dbo.po_emp
		WHERE i_enable = ? AND i_delete = 2
		ORDER BY c_name;";
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
				"id"		=> "{$row["po_emp_id"]}",
				"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_approve") {

	$sqlMain = "
		SELECT * FROM dbo.dc_user a
			INNER JOIN dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_enable = ? AND a.i_delete = 2 ORDER BY a.c_full_name;";
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
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=> $row["c_full_name"]
			);
			${$root}[] = $temp;
		}
	}
}
echo json_encode(array("debug" => true, $root => ${$root}));
exit;
