<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$util	= new apiUtil();
$date 	= new i_date();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM nmu..dc_expense_budget_type WHERE i_enable = ? ORDER BY c_name";
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
}
if ($_REQUEST["type"] == "am_mode_acc") {

	$sqlMain = "SELECT * FROM NMU_ERP.dbo.am_mode_acc WHERE i_enabled = ?";
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
				"id"		=> "{$row["am_mode_id"]}",
				"c_name"	=> $row['c_code'] . ' : ' . $row['c_name']
			);
			${$root}[] = $temp;
		}
	}
}
if ($_REQUEST["type"] == "dc_acc") {

	$sqlMain = "SELECT 
					dc_acc_id
					,c_acc_code as c_code
					,c_acc_name as c_name
				FROM am_mode_acc 
				WHERE i_enabled = ?
				GROUP BY 
					dc_acc_id
					,c_acc_code
					,c_acc_name
				ORDER by c_acc_code;";
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
				"id"		=> "{$row["dc_acc_id"]}",
				"c_name"	=> $row['c_code'] . ' : ' . $row['c_name']
			);
			${$root}[] = $temp;
		}
	}
}






echo json_encode(array("debug" => true, $root => ${$root}));
exit;
