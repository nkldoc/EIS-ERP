<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configDc.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "dc_expense_group_id_all") {	
	$sqlMain	= "	SELECT *,c_code_old+' '+c_name as c_full FROM dc_expense_group WHERE i_enable = ? AND i_delete = ? ORDER BY c_code_old desc,c_name";
	$stmt = $db->QueryParam($sqlMain, array(1, 2));
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "-กรุณาเลือก-"
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> "{$row["dc_expense_group_id"]}",
					"c_name"	=> "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
}  

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>