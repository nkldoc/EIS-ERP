<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_acc") {

	$sqlMain	= "SELECT dc_acc_id, i_group, c_code+' '+c_name AS c_name FROM dc_acc WHERE i_level = 6 AND i_last = 1 AND i_enable = ? AND i_delete = ? ORDER BY c_code";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_acc_id"]}",
				"i_group"	=> "{$row["i_group"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}  else if($_REQUEST["type"] == "dc_cost") {
	
	$sqlMain	= "SELECT * FROM dc_cost WHERE i_enable=1 and i_last=1 ORDER BY c_code";
	$arrParam	= array(null);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(
					"id"		=> "{$row["dc_cost_id"]}",
					"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
