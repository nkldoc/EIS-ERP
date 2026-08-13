<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "gl_dc_group_admin_hdr") {

	$sqlMain	= "	SELECT * FROM vw_gl_dc_group_admin_hdr ORDER BY c_code;";

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
				"id"		=> "{$row["gl_dc_group_admin_hdr_id"]}",
				"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}

}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>