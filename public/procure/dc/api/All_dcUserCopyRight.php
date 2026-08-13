<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
 if ($_REQUEST["type"] == "dc_group_menu") {

	if (@$_REQUEST["all"] == "all") {
		${$root}[] = array(
			"id"                    => "0",
			"dc_cost_main_id"       => "0",
			"c_name"                => "- เลือกทั้งหมด -",
		);
	}

	$sql = "
		SELECT dc_menu_hdr_id, c_code, c_name 
		FROM dc_menu_hdr
    ";

	$arrParam = array();
	$stmt = $db->QueryParam($sql, $arrParam);
	while ($row = $db->Fetch($stmt)) {
		$temp = array(
			"id"                    => $row["dc_menu_hdr_id"],
			"dc_menu_hdr_id"       	=> $row["dc_menu_hdr_id"],
			"c_name"                => $row["c_code"]." ".$row["c_name"],
		);
		${$root}[] = $temp;
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
