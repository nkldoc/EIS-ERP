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
}  
else if ($_REQUEST["type"] == "gl_dc_config_creditor") {
	$ww1 = ""; 

	if ( ($_REQUEST["fixed1_gl_dc_config_method"] > 0) || ($_REQUEST["fixed2_gl_dc_config_method"] > 0) )
	{
		$ww1 = " and c.i_config IN (";
		
		$ww1 .=  ($_REQUEST["fixed1_gl_dc_config_method"] > 0) 					?  $_REQUEST["fixed1_gl_dc_config_method"] 		: "";
		$ww1 .=  ($ww1!="") && ($_REQUEST["fixed2_gl_dc_config_method"] > 0) 	?  ",".$_REQUEST["fixed2_gl_dc_config_method"]	: "";
		$ww1 .=  ($ww1=="") && ($_REQUEST["fixed2_gl_dc_config_method"] > 0) 	? $_REQUEST["fixed2_gl_dc_config_method"]		: "";
		$ww1 .= ")";

	}

	$sqlMain = "
		SELECT 
			c.gl_dc_config_id
			,c.dc_acc_id
			,d.c_code +' '+d.c_name as c_full
			,d.c_code as c_acc_code
			,d.c_name as c_acc_name 
		FROM  gl_dc_config c INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
		WHERE c.i_enable = ? AND c.i_delete = ? 
			{$ww1}
		ORDER BY d.c_code";
 
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
				"id"				=> "{$row["gl_dc_config_id"]}",
				"c_name"			=> $row["c_full"],
				"acc_code"			=> $row["c_acc_code"],
				"acc_name"			=> $row["c_acc_name"] 
			);
			${$root}[] = $temp;
		}
	}
}  
else if ($_REQUEST["type"] == "dc_acc_last") {
	$ww1 = ""; 

 
	$sqlMain = "
		SELECT  
			d.dc_acc_id
			,d.c_code +' '+d.c_name as c_full
			,d.c_code as c_acc_code
			,d.c_name as c_acc_name 
		FROM  dc_acc d 
		WHERE d.i_enable = ? AND d.i_delete = ? AND d.i_last=1
				{$ww1}
		ORDER BY d.c_code";
   
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
				"id"				=> "{$row["dc_acc_id"]}",
				"c_name"			=> $row["c_full"],
				"acc_code"			=> $row["c_acc_code"],
				"acc_name"			=> $row["c_acc_name"] 
			);
			${$root}[] = $temp;
		}
	}
} 
else if ($_REQUEST["type"] == "dc_creditor") {
	$ww1 = ""; 
 
	 	
	$sqlMain = "
		SELECT  
			d.dc_creditor_id
			,d.c_name as c_full 
		FROM  dc_creditor d 
		WHERE d.i_enable = ? AND d.i_delete = ? and d.i_key=? 
				{$ww1}
		ORDER BY d.c_name";
   
	$arrParam = array(STATUS_ENABLE, DELETE_FALSE,1);
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
				"id"				=> "{$row["dc_creditor_id"]}",
				"c_name"			=> $row["c_full"] 
			);
			${$root}[] = $temp;
		}
	}
}   
echo json_encode(array("debug" => true, $root => ${$root}));
exit();

