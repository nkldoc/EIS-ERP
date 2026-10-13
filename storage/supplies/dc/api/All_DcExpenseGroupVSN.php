<?php
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "dc_bg_type") {
	$sqlMain	= "	SELECT * FROM dc_bg_type WHERE i_enable = ?";
	$stmt = $db->QueryParam($sqlMain, array(STATUS_ENABLE));
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_bg_type_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true, $root=>${$root}));
exit;
?>