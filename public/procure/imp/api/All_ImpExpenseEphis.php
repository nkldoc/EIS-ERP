<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;
if ($_REQUEST["type"] == "dc_expense_acc_vsn") {

	if (@$_REQUEST["full"] == "full") { } else {
		$con = ($_REQUEST["dc_expense_group_vsn_id"] > 0) ? " AND b.dc_expense_group_vsn_id = {$_REQUEST["dc_expense_group_vsn_id"]}" : " AND b.dc_expense_group_vsn_id = 0";
	}

	$sqlMain = "
		SELECT
			a.dc_expense_acc_vsn_id
			,a.c_name AS c_name
			,a.c_group_name
			,c.c_name AS acc_name
			,c.c_code AS acc_code
			,d.c_code AS acc_code_overlap
			,d.c_name AS acc_name_overlap  
		FROM vw_dc_expense_acc_vsn a
			LEFT JOIN vw_dc_expense_vsn b ON a.dc_expense_vsn_id = b.dc_expense_vsn_id
			LEFT JOIN dc_acc c ON a.dc_acc_id = c.dc_acc_id
			LEFT JOIN dc_acc d ON a.dc_acc_id_overlap = d.dc_acc_id
		WHERE a.i_enable = ? AND a.i_delete = ?
			{$con}
		ORDER BY a.c_name";

	$arrParam = array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id" => "0",
				"c_name" => "- เลือกทั้งหมด -"
			);
		}
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"					=> "{$row["dc_expense_acc_vsn_id"]}",
				"c_name"				=> $row["c_name"],
				"c_group_name"			=> $row["c_group_name"],
				"acc_code"				=> $row["acc_code"],
				"acc_name"				=> $row["acc_name"],
				"acc_code_overlap"		=> $row["acc_code_overlap"],
				"acc_name_overlap"		=> $row["acc_name_overlap"],
			);
			${$root}[] = $temp;
		}
	}
} 
else if ($_REQUEST["type"] == "imp_request_ephis_dtl_gx") {
	/*
	if (@$_REQUEST["full"] == "full") {
	} else {
		$con = ($_REQUEST["dc_expense_group_vsn_id"] > 0) ? " AND b.dc_expense_group_vsn_id = {$_REQUEST["dc_expense_group_vsn_id"]}" : " AND b.dc_expense_group_vsn_id = 0";
	}
	*/

	$sqlMain = "
		SELECT a.dtl_id as imp_request_ephis_dtl_id
			,a.hdr_id as imp_request_ephis_hdr_id
			,a.c_request + '   ( เลขที่นำเข้า : '+a.c_code+' | '+a.c_jv_code+' )' as c_name 
			,a.c_code
			,a.c_jv_code  
		FROM vw_show_request_jv a 
		WHERE a.i_type = 1  
			{$con}
		ORDER BY a.c_request";

	$arrParam = array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id" => "0",
				"c_name" => "- เลือกทั้งหมด -"
			);
		}
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"				=> "{$row["imp_request_ephis_dtl_id"]}",
				"c_name"			=> $row["c_name"],
				"c_code"			=> $row["c_code"],
				"c_jv_code"			=> $row["c_jv_code"] 
			);
			${$root}[] = $temp;
		}
	}
} 

echo json_encode(array("debug" => true, $root => ${$root}));
exit();
