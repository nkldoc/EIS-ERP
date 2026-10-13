<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "dc_user") {
	$sqlMain	= "	SELECT * FROM " . DB_CENTER . " dc_user WHERE i_enable = ? and dc_user_id != 1";
	$stmt = $db->QueryParam($sqlMain, array(STATUS_ENABLE));
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=> "{$row["c_full_name"]}",
				"c_name2"	=> "{$row["c_full_name"]}",
				"c_user"	=> "{$row["c_user_name"]}",
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true, $root=>${$root}));
exit;
?>