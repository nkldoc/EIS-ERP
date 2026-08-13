<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configDc.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "dc_bg_type_all") {	
	$sqlMain	= "	SELECT * FROM dc_bg_type WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$stmt = $db->QueryParam($sqlMain, array(1, 2));
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "-กรุณาเลือก-"
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> "{$row["dc_bg_type_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}  

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>