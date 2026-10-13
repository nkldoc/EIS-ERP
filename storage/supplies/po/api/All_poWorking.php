<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "po_user_permission") {

	$sqlMain = "
		SELECT a.* FROM dbo.dc_user a
			INNER JOIN dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_delete = 2 AND a.i_enable = ?
		ORDER BY a.c_full_name";
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
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=>  $row["c_full_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_parcel_officer") {

	$sqlMain = "
		SELECT *
			FROM dbo.po_parcel_officer 
		WHERE i_delete = 2 AND i_enable = ?
		ORDER BY c_name";
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
				"id"		=> "{$row["po_parcel_officer_id"]}",
				"c_name"	=>  $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_reason_protest") {

	$sqlMain = "
		SELECT *
			FROM dbo.po_reason_protest 
		WHERE i_delete = 2 AND i_enable = ?
		ORDER BY i_row";
	$arrParam = array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"i_row"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_reason_protest_id"]}",
				"i_row"		=> "{$row["i_row"]}",
				"c_name"	=>  "ข้อ " . $row["i_row"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bg_expense") {

	$sqlMain = "SELECT a.* FROM dbo.bg_expense a WHERE a.i_last = 1 AND a.i_delete = 2 AND a.i_enable = ? ORDER BY a.c_code";
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
				"id"		=> "{$row["bg_expense_id"]}",
				"c_name"	=>  $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "bg_budget_dtl_overlap") {

	$sqlMain = "
		SELECT
			b.bg_budget_dtl_overlap_id
			,a.i_year
			,a.dc_expense_budget_type_id
			,c.c_name AS dc_expense_budget_type_name
			,b.c_code_ref
			,b.dc_cost_id
			,d.c_name AS dc_cost_name
			,b.bg_expense_id
			,e.c_name AS bg_expense_name
			,b.f_total
			,CASE
				WHEN isnull(b.i_extend_time,0) = 0 THEN b.f_cancel
				ELSE (SELECT isnull(sum(isnull(aa.f_cancel,0)),0) FROM bg_budget_extend_time_overlap aa WHERE aa.bg_budget_dtl_overlap_id = b.bg_budget_dtl_overlap_id )
			END AS f_cancel
		FROM bg_budget_hdr_overlap a
			INNER JOIN bg_budget_dtl_overlap b ON a.bg_budget_hdr_overlap_id = b.bg_budget_hdr_overlap_id
			INNER JOIN dc_expense_budget_type c ON a.dc_expense_budget_type_id = c.dc_expense_budget_type_id
			INNER JOIN dc_cost d ON b.dc_cost_id = d.dc_cost_id
			INNER JOIN bg_expense e ON b.bg_expense_id = e.bg_expense_id AND e.i_level = 4
				AND e.i_enable = 1
		WHERE a.i_enable = ?
			AND a.i_year = {$_REQUEST["i_year"]}
			AND a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}
			AND b.dc_cost_id = {$_REQUEST["dc_cost_id"]}
			AND b.bg_expense_id = {$_REQUEST["bg_expense_id"]}
		ORDER BY b.c_code_ref";
		
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"								=> $row["bg_budget_dtl_overlap_id"],
				"i_year"							=> $row["i_year"] + 543,
				"dc_expense_budget_type_name"		=> $row["dc_expense_budget_type_name"],
				"c_code_ref"						=> $row["c_code_ref"],
				"dc_cost_name"						=> $row["dc_cost_name"],
				"bg_expense_name"					=> $row["bg_expense_name"],
				"f_total"							=> $row["f_total"],
				"f_cancel"							=> $row["f_cancel"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {

	if (@$_REQUEST["all"] == "all") {
		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "- เลือกทั้งหมด -"
		);
	}

	$sqlMain = "
		SELECT a.* FROM dbo.dc_expense_budget_type a
		WHERE a.i_delete = 2 AND a.i_enable = ?
		ORDER BY a.c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["dc_expense_budget_type_id"]}",
				"c_name"				=> "{$row["c_name"]}",
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "expire") {

	if (@$_REQUEST["all"] == "all") {
		${$root}[] = array(
			"id"		=> "0",
			"c_name"	=> "- เลือกทั้งหมด -"
		);
	}

	$temp = array(
		"id"					=> "2",
		"c_name"				=> "เกิน 60 วัน",
	);
	${$root}[] = $temp;
} else if ($_REQUEST["type"] == "po_creditor") {

	$sqlMain = "SELECT a.* FROM dbo.po_creditor a WHERE a.i_delete = 2 AND a.i_enable = ? ORDER BY a.c_name";
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
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
