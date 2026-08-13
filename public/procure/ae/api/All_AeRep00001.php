<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "dc_acc") {

	$sqlMain	= "	SELECT dc_acc_id, c_name, i_group FROM dc_acc WHERE i_level=1 AND i_enable=1 ORDER BY c_code_tree";

	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		if(@$_REQUEST["show"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while($row =$db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_acc_id"]}",
				"c_name"	=> $row["c_name"],
				"i_group"	=> $row["i_group"]
			);
			${$root}[] = $temp;
		}
	}

}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>