<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configDc.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "bank_all") {
	$sqlMain	= "	SELECT * FROM dc_bank WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(STATUS_ENABLE, DELETE_FALSE));
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "เลือกทั้งหมด"
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> "{$row["dc_bank_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "bank_deposit_type_all") {
	$sqlMain	= "	SELECT * FROM dc_bank_deposit_type WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(STATUS_ENABLE, DELETE_FALSE));
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "เลือกทั้งหมด"
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> "{$row["dc_bank_deposit_type_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "area_all") {
	$sqlMain	= "	SELECT * FROM dc_area WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(STATUS_ENABLE, DELETE_FALSE));
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "เลือกทั้งหมด"
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> "{$row["dc_area_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "status") {
	foreach ($arr_status as $key => $val) {
		$temp = array(
				"id"		=> "{$key}",
				"c_name"	=> "{$val}"
		);
		${$root}[] = $temp;
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>