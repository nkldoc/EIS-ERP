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

	$sqlMain	= "SELECT * FROM dbo.dc_expense_budget_type WHERE i_enable = 1 ORDER BY c_name";
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
} else if ($_REQUEST["type"] == "sp_tor_contract") {

	$sqlMain = "SELECT * from sp_tor aa  
	left join sp_tor_contract a  on aa.tor_id = a.sp_tor_id 
	where a.i_enabled = 1 
	and aa.i_enabled = 1 
	and a.c_code is not null  and aa.i_type_bg <> 3
	ORDER BY a.c_code";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
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
				"c_code"	=> 	   "{$row["c_code"]}"
				// "c_name"	=> $row["c_code"] . " : " . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}


echo json_encode(array("debug" => true, $root => ${$root}));
exit;
