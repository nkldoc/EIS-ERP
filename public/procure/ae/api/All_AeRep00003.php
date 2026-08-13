<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "dc_acc") {

	$sqlMain	= "	SELECT * FROM dc_acc WHERE i_last=1 AND i_enable=? AND i_delete=? ORDER BY c_code_tree ASC";

	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		if(@$_REQUEST["show"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -",
				"cut_name"	=> "เลือกทั้งหมด"
			);
		}
		
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_acc_id"]}",
					"c_name"	=> $row["c_code"]." ".$row["c_name"],
					"cut_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}

} else if($_REQUEST["type"] == "dc_cost") {

	$sqlMain	= "	SELECT * FROM vw_dc_cost_gl_last  ORDER BY c_code ASC";

	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		if(@$_REQUEST["show"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -",
				"cut_name"	=> "เลือกทั้งหมด"
			);
		}
		
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_cost_acc_id"]}",
					"c_name"	=> $row["c_code"]." ".$row["dc_cost_acc_name"],
					"cut_name"	=> $row["dc_cost_acc_name"]
			);
			${$root}[] = $temp;
		}
	}

} else if($_REQUEST["type"] == "segment") {

	$sqlMain	= "	SELECT * FROM gl_dc_group_admin_hdr WHERE i_enable=? ORDER BY c_code";

	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		if(@$_REQUEST["show"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -",
					"cut_name"	=> "เลือกทั้งหมด"
			);
		}

		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["gl_dc_group_admin_hdr_id"]}",
					"c_name"	=> $row["c_code"]." ".$row["c_name"],
					"cut_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}

}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>