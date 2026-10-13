<?php
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "bank") {
	$sqlMain	= "	SELECT * FROM dc_bank WHERE i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(2));
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_bank_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "bank_all") {
	$sqlMain	= "	SELECT * FROM dc_bank WHERE i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(2));
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "ทั้งหมด"
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> "{$row["dc_bank_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true, $root=>${$root}));
exit;
?>