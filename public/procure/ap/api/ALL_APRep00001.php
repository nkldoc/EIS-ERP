<?php
 
include("../../lib/database/DatabaseServer.php");
$db 	= new DatabaseServer();
$data 	= "";
$root	= "data";

if($_REQUEST['type'] == 'dc_bg_type') {
	$sqlMain	= "SELECT * FROM dc_bg_type WHERE i_enable = ? ";
	$arrParam	= array(1);
	$stmt = $db->QueryParam($sqlMain,$arrParam);
	if($stmt){
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> $row["dc_bg_type_id"],
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}
 

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>