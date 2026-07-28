<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "dc_bank_acc_company") {
	
	$dc_bank_id	= (@$_REQUEST["dc_bank_id"] > 0)? @$_REQUEST["dc_bank_id"] : 0;
	
	if(@$_REQUEST["all"] != "all") { $con .= " AND a.dc_bank_id = ".$dc_bank_id; }
	
	$sqlMain	= "	SELECT b.* FROM dc_bank a INNER JOIN dc_bank_acc_company b ON a.dc_bank_id = b.dc_bank_id
					WHERE a.i_enable = ? AND a.i_delete = ? AND b.i_enable = ? AND b.i_delete = ?
						{$con}
					ORDER BY b.c_name";
	
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
					"id"		=> "{$row["dc_bank_acc_company_id"]}",
					"c_name"	=> "{$row["c_code"]} : {$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}else if($_REQUEST["type"] == "vw_dc_bank_acc_company") {
	
	$dc_bank_id	= (@$_REQUEST["dc_bank_id"] > 0)? @$_REQUEST["dc_bank_id"] : 0;
	
	if(@$_REQUEST["all"] != "all") { $con .= " AND a.dc_bank_id = ".$dc_bank_id; }
	
	$sqlMain	= "	SELECT a.* FROM vw_dc_bank_acc_company_full a   
					WHERE a.i_delete = ? 
						{$con}
					ORDER BY a.c_bank_name_shot,a.c_code";
	
	$arrParam	= array(DELETE_FALSE);
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
					"id"		=> "{$row["dc_bank_acc_company_id"]}",
					"c_name"	=> "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
	
} else if($_REQUEST["type"] == "dc_bank") {
	
	$sqlMain	= "	SELECT * FROM dc_bank a WHERE a.i_enable = ? AND a.i_delete = ? ORDER BY a.c_name";
	
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
					"id"		=> "{$row["dc_bank_id"]}",
					"c_name"	=> "{$row["c_code"]} : {$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>