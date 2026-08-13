<?php
include("../../lib/database/DatabaseServer.php");
include("../conf/configGl.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST['type'] == 'dc_acc') {
	// dc_acc
	$sqlMain	= "	SELECT * FROM vw_dc_acc
					WHERE i_level = ? AND i_enable = ?  AND i_group IN (".GL_ACC_GROUP4_REVENUE.",".GL_ACC_GROUP5_EXPENSE.") ORDER BY c_code";
	
	$arrParam[]	= 2;
	$arrParam[]	= 1;
 	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(	"id"		=> '0',
							"c_name"	=> '- เลือกทั้งหมด -');
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"id"		=> $row["dc_acc_id"],
							"c_name"	=> $row["c_code"].' '.$row["c_name"] );
			${$root}[] = $temp;
		}
	}
}
echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>
