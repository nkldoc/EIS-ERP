<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "cm_pay_type") {
	
	$sqlMain	= "SELECT * FROM cm_pay_type WHERE i_enable=? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["cm_pay_type_id"]}",
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>