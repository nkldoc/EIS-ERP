<?php
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "bank_company") {
	$sqlMain	= "	SELECT * FROM dc_bank_acc_company WHERE i_delete = ?";
	$stmt = $db->QueryParam($sqlMain, array(2));
	if($stmt) { 
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_bank_acc_company_id"]}",
					"c_name"	=> "{$row["c_code"]}"
			);
			${$root}[] = $temp;
		}
	}
}  
else if($_REQUEST["type"] == "bank_company_all") {
	$sqlMain	= "	SELECT * FROM dc_bank_acc_company WHERE i_delete = ?";
	$stmt = $db->QueryParam($sqlMain, array(2));
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "กรุณาเลือก"
		);			
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_bank_acc_company_id"]}",
					"c_name"	=> "{$row["c_code"]}"
			);
			${$root}[] = $temp;
		}
	}
}  
else if($_REQUEST["type"] == "bank_company_all_full") {
	$sqlMain	= "	SELECT
						a.dc_bank_acc_company_id
						,a.c_code+' '+a.c_name +' : '+b.c_name+' สาขา'+c.c_name+' ('+d.c_name+')' AS c_full
					FROM dc_bank_acc_company a
						LEFT JOIN vw_dc_bank b ON a.dc_bank_id = b.dc_bank_id
						LEFT JOIN vw_dc_bank_branch c ON a.dc_bank_branch_id = c.dc_bank_branch_id
						LEFT JOIN vw_dc_bank_deposit_type d ON a.dc_bank_deposit_type_id = d.dc_bank_deposit_type_id
					WHERE a.dc_bank_deposit_type_id = 2 /* 2=กระแส */
						AND a.i_enable = ".STATUS_ENABLE."
						AND a.i_delete = ".DELETE_FALSE."
					ORDER BY a.c_code";
	$stmt = $db->QueryParam($sqlMain, array());
	if($stmt) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_bank_acc_company_id"]}",
					"c_name"	=> "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
}  

echo json_encode(array("debug"=>true, $root=>${$root}));
exit;
?>