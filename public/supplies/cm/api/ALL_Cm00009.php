<?php
include("../../ap/conf/configAp.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if( $_REQUEST["type"] == "dc_bank_acc_creditor" ) {
	
// 	$cm	= $db->GetDataBySQL("SELECT * FROM cm_voucher_one a INNER JOIN ap_expen_hdr b ON a.ap_expen_hdr_id=b.ap_expen_hdr_id WHERE a.cm_voucher_one_id=?", array($_REQUEST["cm_voucher_one_id"]));
	
// 	if( $cm["i_type_person"] == PERSON_CREDITOR ) {
		
// 		$sql	= "	SELECT
// 						dc_bank_acc_creditor_id
// 						,c_code+' :: ธนาคาร '+bank_name+' : สาขา '+branch_name AS c_name
// 					FROM dc_bank_acc_creditor
// 					WHERE i_enable = 1 AND i_delete = 2
// 						AND dc_bank_acc_creditor_id=".$cm["dc_bank_acc_creditor_id"]."
// 					ORDER BY c_code";
		
// 	} else if( $cm["i_type_person"] == PERSON_EMP ) {
		
// 		$sql	= "	SELECT
// 						dc_bank_acc_creditor_id
// 						,c_code+' :: ธนาคาร '+bank_name+' : สาขา '+branch_name AS c_name
// 					FROM dc_bank_acc_emp
// 					WHERE i_enable = 1 AND i_delete = 2
// 						AND dc_bank_acc_emp_id=".$cm["dc_bank_acc_emp_id"]."
// 					ORDER BY c_code";
					
// 	} else if( $cm["i_type_person"] == PERSON_OTHER ) {
		
// 		$sql	= " SELECT
// 						dc_bank_acc_creditor_id
// 						,c_code+' :: ธนาคาร'+bank_name+' : สาขา '+branch_name AS c_name
// 					FROM dc_bank_acc_emp
// 					WHERE i_enable = 1 AND i_delete = 2
// 						AND dc_bank_acc_emp_id=".$cm["dc_bank_acc_emp_ref_id"]."
// 					ORDER BY c_code";
		
// 	}

	$sql	= "	SELECT
					a.dc_bank_acc_creditor_id
					,a.c_code+' :: ธนาคาร '+b.c_name+' : สาขา '+c.c_name AS c_name
				FROM dc_bank_acc_creditor a
					INNER JOIN dc_bank b ON a.dc_bank_id=b.dc_bank_id
					INNER JOIN dc_bank_branch c ON a.dc_bank_branch_id=c.dc_bank_branch_id
				WHERE a.i_enable = 1 AND a.i_delete = 2
				ORDER BY a.c_code";
			
	$sqlMain	= $sql;
	$arrParam	= array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(
					"id"		=> "{$row["dc_bank_acc_creditor_id"]}",
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
} 

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>