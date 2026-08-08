<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_cost") {

	$sqlMain	= "
		SELECT * FROM NMU.dbo.dc_cost
		WHERE i_last = 1 AND i_enable = 1 AND i_delete = 2
			AND c_code_tree LIKE '0104%'
		ORDER BY c_code";
	$arrParam	= array(STATUS_ENABLE, 1);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_code"	=> "",
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
	
} else if ($_REQUEST["type"] == "po_user") {
	$sqlMain	= "select a.dc_user_id,a.c_full_name from NMU.dbo.dc_user a 
	inner join NMU.dbo.dc_user_menu b on b.dc_user_id=a.dc_user_id
	where b.dc_menu_id =(SELECT dc_menu_id FROM NMU.dc_menu where c_filelocation='po-RegPo')
	AND a.i_enable = ?
	group by a.dc_user_id,a.c_full_name
	ORDER BY a.c_full_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = true;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- เลือกผู้ทำรายการ-"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=> "{$row["c_full_name"]}"
			);
			${$root}[] = $temp;
		}
	}	
} else if ($_REQUEST["type"] == "po_creditor_transfer") {
	$sqlMain	= "SELECT * FROM NMU.dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}	
} else if ($_REQUEST["type"] == "po_creditor") {
	$sqlMain	= "SELECT * FROM NMU.dbo.po_creditor WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		$all = false;
		if ($all == "all") {
			${$root}[] = array(
				"id"		=> 0,
				"c_name"	=> "- กรุณาเลือก -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["po_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain = "SELECT * FROM NMU_DATACENTER.dbo.dc_expense_budget_type WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
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
} else if ($_REQUEST["type"] == "bg_expense") {

	$sqlMain	= "SELECT * FROM NMU.dbo.bg_expense WHERE i_last = 1 and i_enable = ? ORDER BY c_code_tree";
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
				"id"					=> "{$row["bg_expense_id"]}",
				"c_name"				=> $row["c_code"] . " : " . $row["c_name"],
				"c_name_excel"			=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_emp") {

	$sqlMain	= "SELECT * FROM NMU.dbo.po_emp WHERE i_enable = ? AND i_delete = 2 ORDER BY c_name";
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
				"id"					=> "{$row["po_emp_id"]}",
				"c_name"				=> $row["c_name"],

			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "po_user_permission") {

	$sqlMain = "
		SELECT * FROM NMU.dbo.dc_user a
			INNER JOIN NMU.dbo.po_user_permission b ON a.dc_user_id = b.dc_user_id AND b.i_approve = 1
		WHERE a.i_enable = ? AND a.i_delete = 2 ORDER BY a.c_full_name";
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
				"id"					=> "{$row["dc_user_id"]}",
				"c_name"				=> $row["c_full_name"],

			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
