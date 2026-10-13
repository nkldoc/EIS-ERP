<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
if ($_REQUEST["type"] == "dc_cost_supplies") {

	$sqlMain	= "
		SELECT * FROM dbo.dc_cost
		WHERE i_enable = 1 AND i_delete = 2 AND dc_cost_id in(50,38,82,81,51,36)";
	$arrParam	= array();
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
				"id"		=> "{$row["dc_cost_id"]}",
				"c_name"	=>  $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
} 

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
