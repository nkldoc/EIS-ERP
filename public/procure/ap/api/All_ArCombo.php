<?php
include("../conf/configAp.php");
include("../../gl/conf/configGl.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if( $_REQUEST["type"] == "storeDcExpDoc" ) {
	
	$sqlMain	= "	SELECT ap_exp_doc_id ,isnull(i_exp_type,0) i_exp_type, c_name FROM ap_exp_doc WHERE i_delete = ? AND i_enable=? ORDER by c_name;";
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(
					"id"			=> "{$row["ap_exp_doc_id"]}",
					"i_exp_type"	=> $row["i_exp_type"],
					"c_name"		=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>