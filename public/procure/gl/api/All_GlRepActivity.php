<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
 
 
if($_REQUEST["mode"] == "gl_dc_activity") {
	
 
	$sqlMain	= "	SELECT * FROM gl_dc_activity a
					WHERE a.i_enable = ? AND a.i_delete = ?
					ORDER BY a.c_name";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
		if(@$_REQUEST["select"] == "empty") {
			${$root}[] = array( 
                                        "id"		=> 0,
					"c_name"	=> "- ไม่เลือก -"
			);
		}			
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["gl_dc_activity_id"]}",
					"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>