<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "dc_expense_budget_type") {
	 
	$sqlMain	= "	SELECT * FROM dc_expense_budget_type a
					WHERE a.i_enable = ? AND a.i_delete = ?
					ORDER BY a.c_name";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
			
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_expense_budget_type_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
} else if($_REQUEST["type"] == "dc_expense") {
	
	$sqlMain	= "	SELECT a.* FROM vw_dc_expense a
					WHERE a.i_enable = ? AND a.i_delete = ?
					ORDER BY a.c_name";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE, STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_expense_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
} else if($_REQUEST["type"] == "dc_expense_acc_vsn") {
	
	$sqlMain	= "	SELECT a.* FROM vw_dc_expense_acc_vsn a
					WHERE a.i_enable = ? AND a.i_delete = ?
					ORDER BY a.c_name";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE, STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_expense_acc_vsn_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
} else if($_REQUEST["type"] == "vw_dc_bank_acc_company_full") {
	
	$sqlMain	= "	SELECT * FROM vw_dc_bank_acc_company_full ORDER BY c_full";
	
	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_bank_acc_company_id"]}",
					"c_name"	=> "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}
 else if($_REQUEST["type"] == "dc_acc_control") {
	
	$sqlMain	= "	SELECT *,c_code+' : '+c_name as c_full FROM vw_dc_acc WHERE i_group=? and i_level=? and i_last!=1 and i_enable=1 order by c_code;";
	
	$arrParam	= array($_REQUEST["i_group"],$_REQUEST["i_level"]); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}		
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_acc_id"]}",
					"c_name"	=> "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}
 else if($_REQUEST["type"] == "dc_acc_last") {
	
	$sqlMain	= "	SELECT *,c_code+' : '+c_name as c_full FROM vw_dc_acc WHERE i_group=? and i_level=? and i_last=1 and i_enable=1 order by c_code;";
	
	$arrParam	= array($_REQUEST["i_group"],$_REQUEST["i_level"]); 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}		
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_acc_id"]}",
					"c_name"	=> "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}
echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>