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
			--AND c_code_tree LIKE '0104%'
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
}else if ($_REQUEST["type"] == "dc_expense_budget_type") {

	// *** ตัดฝั่งมหาวิทยาลัย (EIS_PROCURE) ออก เหลือเฉพาะคณะแพทย์เท่านั้น ***
	$sqlMain = "SELECT dc_expense_budget_type_id, c_name FROM dbo.dc_expense_budget_type WHERE i_enable = 1 ORDER BY c_name";

	$arrParam = array();
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
} else if ($_REQUEST["type"] == "sp_tor_contract") {

	// *** ตัดฝั่งมหาวิทยาลัย (EIS_PROCURE) ออก เหลือเฉพาะคณะแพทย์เท่านั้น ***
	$sqlMain = "
			select a.sp_tor_contract_id, a.c_code from sp_tor aa
			left join sp_tor_contract a on aa.tor_id = a.sp_tor_id
			where a.i_enabled = 1 and aa.i_enabled = 1 and a.c_code is not null and a.c_code <> 'NULL'
			and aa.i_type_bg in (1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13) and isnull(a.parent_id,0) = 0
			order by a.c_code";
	$stmt = $db->Query($sqlMain);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_code"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["sp_tor_contract_id"]}",
				"c_code"	=> "{$row["c_code"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_creditor") {

	// *** ตัดฝั่งมหาวิทยาลัย (EIS_PROCURE) ออก เหลือเฉพาะคณะแพทย์เท่านั้น ***
	$sqlMain = "SELECT DISTINCT c.dc_creditor_id, c.c_name
			FROM NMU.dbo.dc_creditor c
			WHERE c.i_enable = ? AND c.i_delete = 2
			AND EXISTS (SELECT 1 FROM dbo.sp_tor_contract a WHERE a.dc_creditor_id = c.dc_creditor_id AND a.i_enabled = 1)
			ORDER BY c.c_name";

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
				"id"		=> "{$row["dc_creditor_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}


echo json_encode(array("debug" => true, $root => ${$root}));
exit;