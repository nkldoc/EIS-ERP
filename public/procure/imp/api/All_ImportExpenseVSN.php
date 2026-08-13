<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

if ($_REQUEST["type"] == "dc_expense_budget_type") {

	if (@$_REQUEST["i_type"] != "") {
		$con = " AND a.i_type = " . $_REQUEST["itype"];
	}
	$sqlMain = "
		SELECT * FROM dc_expense_budget_type a
		WHERE a.i_enable = ? AND a.i_delete = ?
			{$con}
		ORDER BY a.c_name";

	$arrParam = array(
		STATUS_ENABLE,
		DELETE_FALSE
	);
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
				"id" => "{$row["dc_expense_budget_type_id"]}",
				"c_name" => "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_group") {

	$sqlMain = "
		SELECT a.* FROM vw_dc_expense_group a
		WHERE a.i_enable = ?
		ORDER BY a.c_name, a.c_code_old";

	$arrParam = array(
		STATUS_ENABLE
	);
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
				"id" => "{$row["dc_expense_group_id"]}",
				"c_name" => (($row["c_code_old"] == "") ? "" : $row["c_code_old"] . " :: ") . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_group_vsn") {

	$sqlMain = "
		SELECT a.* FROM vw_dc_expense_group_vsn a
		WHERE a.i_enable = ?
		ORDER BY a.c_name";

	$arrParam = array(
		STATUS_ENABLE
	);
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
				"id" => "{$row["dc_expense_group_vsn_id"]}",
				"c_name" => (($row["c_code_old"] == "") ? "" : $row["c_code_old"] . " :: ") . $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense") {

	$dc_expense_group_id	= ($_REQUEST["dc_expense_group_id"] > 0) ? $_REQUEST["dc_expense_group_id"] : 0;

	$sqlMain = "	SELECT
						a.*,a.c_map_code+' '+a.c_name+ ' (หมวด'+a.c_group_name+')' as c_full
						,b.c_code
						,b.c_name
						,c.c_code AS c_code_overlap
						,c.c_name AS c_name_overlap
					FROM vw_dc_expense a
						LEFT JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
						LEFT JOIN dc_acc c ON a.dc_acc_id_overlap = c.dc_acc_id
					WHERE a.i_enable = ? AND a.i_delete = ? AND a.dc_expense_group_id = ?
					ORDER BY a.c_name";

	$arrParam = array(
		STATUS_ENABLE,
		DELETE_FALSE,
		$dc_expense_group_id
	);
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
				"id"				=> "{$row["dc_expense_id"]}",
				"c_name"			=> $row["c_full"],
				"acc_code"			=> $row["c_code"],
				"acc_name"			=> $row["c_name"],
				"acc_code_overlap"	=> $row["c_code_overlap"],
				"acc_name_overlap"	=> $row["c_name_overlap"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "dc_expense_acc_vsn") {

	if (@$_REQUEST["full"] == "full") {
	} else {
		$con = ($_REQUEST["dc_expense_group_vsn_id"] > 0) ? " AND b.dc_expense_group_vsn_id = {$_REQUEST["dc_expense_group_vsn_id"]}" : " AND b.dc_expense_group_vsn_id = 0";
	}

	$sqlMain = "
		SELECT a.*,a.c_name + ' (หมวด'+a.c_group_name+')' as c_full
			,c.c_name
			,c.c_code
			,d.c_code AS c_code_overlap
			,d.c_name AS c_name_overlap  
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
				"id"				=> "{$row["dc_expense_acc_vsn_id"]}",
				"c_name"			=> $row["c_full"],
				"acc_code"			=> $row["c_code"],
				"acc_name"			=> $row["c_name"],
				"acc_code_overlap"	=> $row["c_code_overlap"],
				"acc_name_overlap"	=> $row["c_name_overlap"],
			);
			${$root}[] = $temp;
		}
	}
} else if ($_REQUEST["type"] == "vw_dc_bank_acc_company_full") {

	if (@$_REQUEST["dc_bank_deposit_type_id"] > 0) {
		$con = " AND a.dc_bank_deposit_type_id = " . $_REQUEST["dc_bank_deposit_type_id"];
	}

	$sqlMain = "SELECT * FROM vw_dc_bank_acc_company_full a WHERE 1=1 {$con} ORDER BY a.c_full";

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id" => "{$row["dc_bank_acc_company_id"]}",
				"c_name" => "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
}
else if ($_REQUEST["type"] == "imp_request_vsn_dtl_gx") {
	 
	// if (@$_REQUEST["sub_type"] == "2") { 
	// 	$con = " AND LEFT(a.c_jv_code,1)='G'";
	// }
	  
	$sqlMain = "
		SELECT a.dtl_id as imp_request_vsn_dtl_id
			,a.hdr_id as imp_request_vsn_hdr_id 
			,a.c_request + '   ( เลขที่นำเข้า : '+a.c_code+' | '+ISNULL(a.c_jv_code,'-ยังไม่บันทึกบัญชี-')+' )' as c_name 
			,a.c_code
			,a.c_jv_code  
		FROM vw_show_request_jv a 
		WHERE a.i_type = 2  
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
				"id"				=> "{$row["imp_request_vsn_dtl_id"]}",
				"c_name"			=> $row["c_name"],
				"c_code"			=> $row["c_code"],
				"c_jv_code"			=> $row["c_jv_code"] 
			);
			${$root}[] = $temp;
		}
	}
} 
else if ($_REQUEST["type"] == "imp_request_ephis_dtl_gx") {
	// if (@$_REQUEST["sub_type"] == "2") { 
	// 	$con = " AND LEFT(a.c_jv_code,1)='G'";
	// }

	$sqlMain = "
		SELECT a.dtl_id as imp_request_ephis_dtl_id
			,a.hdr_id as imp_request_ephis_hdr_id
			,a.c_request + '   ( เลขที่นำเข้า : '+a.c_code+' | '+ISNULL(a.c_jv_code,'-ยังไม่บันทึกบัญชี-')+' )' as c_name 
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
