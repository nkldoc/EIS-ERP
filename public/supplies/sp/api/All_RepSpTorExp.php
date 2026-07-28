<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM ".DB_CENTER." dc_expense_budget_type WHERE i_enable = ? ORDER BY c_name";
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
} else if ($_REQUEST["type"] == "po_expense") {

	$sqlMain	= "SELECT * FROM ".DB_NMU_EIS."bg_expense WHERE i_enable = ?  and i_level = 4 ORDER BY c_code";
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
				"id"		 => "{$row["bg_expense_id"]}",
				"c_name"	 => $row["c_code"] . " : " . $row["c_name"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "sp_type_status") { //[sp_type_status_id]
	$i_is_type_tor = $_REQUEST["i_is_type_tor"] ?? NULL;
	$stm = ($i_is_type_tor === NULL) ? "" : " and i_is_type_tor=1";
	$sqlMain = "SELECT sp_type_status_id as id ,c_name FROM dbo.sp_type_status WHERE i_enabled = ? $stm ORDER BY c_name";
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
				"id" => "{$row["id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}else if ($_REQUEST["type"] == "store_year_s") {

	$sqlMain = "
		select i_year from (
			select i_yyyy as i_year from " . DB_NMU_ERP . "sp_tor
			--union all
			--select i_yyyy as i_year from " . DB_NMU_ERP . "sp_tor_contract
			union all
			select i_yyyy_overlap as i_year from " . DB_NMU_ERP . "sp_tor_contract
			union all
			select i_yyyy as i_year from " . DB_NMU_ERP . "sp_check_period_hdr
			union all
			select i_yyyy_overlap as i_year from " . DB_NMU_ERP . "sp_check_period_hdr
			--union all i_yyyy
			--select i_budget_year_overlap as i_year from " . DB_NMU_ERP . "po_working_dtl
		) a
		group by i_year
        HAVING i_year <> 0
		order by i_year;";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		// ${$root}[] = array(
		// 	"id"		=> "0",
		// 	"c_name"	=> "- เลือกทั้งหมด -"
		// );

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> $row["i_year"],
				"c_name"	=> $row["i_year"] + 543
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
