<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db = new DatabaseServer();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

if ($_REQUEST["type"] == "dc_acc") {
 
	$sqlMain = "
		SELECT  
			a.c_code +' '+a.c_name as c_full
			,a.c_name
			,a.c_code 
			,a.dc_acc_id
		FROM dc_acc a 
		WHERE a.i_enable = ? AND a.i_delete = ? and a.i_last=1
			{$con}
		ORDER BY a.c_code";

	$arrParam = array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id" 		=> "0",
				"acc_full" 	=> "- เลือกทั้งหมด -"
			);
		}
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"				=> "{$row["dc_acc_id"]}",
				"acc_full"			=> $row["c_full"],
				"acc_code"			=> $row["c_code"],
				"acc_name"			=> $row["c_name"] 
			);
			${$root}[] = $temp;
		}
	}
}  

echo json_encode(array("debug" => true, $root => ${$root}));
exit();
