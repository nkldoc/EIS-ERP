<?php
include("../conf/configGl.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$root	= "data";

if($_REQUEST['type'] == 'gl_dc_book_type') {
	$sqlMain	= "SELECT * FROM gl_dc_book_type WHERE i_enable = ? AND i_delete = ?";
	$arrParam	= array(1,2);
	$stmt = $db->QueryParam($sqlMain,$arrParam);
	if($stmt){
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> $row["gl_dc_book_type_id"],
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>