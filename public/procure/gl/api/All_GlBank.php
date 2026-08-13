<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_acc") {

	$sqlMain	= "SELECT dc_acc_id, i_group, c_code+' '+c_name AS c_name FROM dc_acc WHERE i_level = 6 AND i_last = 1 AND i_enable = ? AND i_delete = ? ORDER BY c_code";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_acc_id"]}",
				"i_group"	=> "{$row["i_group"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "vw_dc_user") {

	$sqlMain	= "SELECT dc_user_id, c_full_name AS c_name FROM vw_dc_user WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"			=> "0",
				"c_name"		=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "gl_dc_book_type") {

	$sqlMain	= "SELECT * FROM gl_dc_book_type WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["gl_dc_book_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM dc_expense_budget_type WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"			=> "0",
				"c_name"		=> "- เลือกทั้งหมด -"
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
} else if ($_REQUEST["type"] == "dc_cheque") {

	$sqlMain	= "
		SELECT
			a.dc_cheque_id
			,a.c_show+' ('+c.c_name+')' AS c_name
		FROM dbo.dc_cheque a
			INNER JOIN dc_bank_acc_company b ON a.dc_bank_acc_company_id = b.dc_bank_acc_company_id
			INNER JOIN dc_bank_deposit_type c ON b.dc_bank_deposit_type_id = c.dc_bank_deposit_type_id
		WHERE a.dc_bank_acc_company_id = {$_REQUEST["dc_bank_acc_company_id_source"]}
			AND a.i_enable = ? AND a.i_delete = ?
			AND a.d_update BETWEEN DATEADD(MM,-10,GETDATE()) AND GETDATE() /* เช็คย้อนหลัง 10 เดือน */
		ORDER BY a.c_cheque";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_cheque_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
