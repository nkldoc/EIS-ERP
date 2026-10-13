<?php
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$root	= "data";

if($_REQUEST['type'] == 'dc_acc') {
	$sqlMain	= "	SELECT * FROM vw_dc_acc
					WHERE i_level = 1  
					ORDER BY c_code ASC";
	$arrParam[]	= 1;
	$arrParam[]	= 2;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(
				"id"		=> '0',
				"c_name"	=> '-- เลือกทั้งหมด --'
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> $row["i_group"],
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>
