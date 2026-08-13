<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "gl_rep_acc_hdr") {
	
	$sqlMain	= "	SELECT * FROM gl_rep_acc_hdr WHERE i_enable=? AND i_delete=? ORDER BY c_name;";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt		= $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["gl_rep_acc_hdr_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>