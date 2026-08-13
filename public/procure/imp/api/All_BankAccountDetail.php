<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if($_REQUEST["type"] == "dc_cheque") {
	
	if(@$_REQUEST["dc_bank_acc_company_id_source"] > 0 && @$_REQUEST["dc_bank_acc_company_id_target"] > 0) {
		$con	.=	" AND (a.dc_bank_acc_company_id = ".$_REQUEST["dc_bank_acc_company_id_source"]
					." OR a.dc_bank_acc_company_id = ".$_REQUEST["dc_bank_acc_company_id_target"].")";
	}
	
	$sqlMain	= "	SELECT * FROM dc_cheque a
					WHERE a.i_enable = ? AND a.i_delete = ?
						{$con}
					ORDER BY a.c_cheque";
	
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_cheque_id"]}",
					"c_name"	=> "{$row["c_show"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>