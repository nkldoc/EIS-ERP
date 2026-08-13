<?php
include("../conf/configCm.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if( $_REQUEST["type"] == "cm_pay_cheque" ) {
	
	$sqlMain	= "	SELECT
						a.cm_pay_cheque_id
						,a.c_start_no+' '+c.c_name+' :: '+b.c_code AS c_full
					FROM cm_pay_cheque a
						INNER JOIN dc_bank_acc_company b ON a.dc_bank_acc_company_id=b.dc_bank_acc_company_id
						INNER JOIN dc_bank c ON b.dc_bank_id=c.dc_bank_id
					INNER JOIN dc_bank_branch d ON b.dc_bank_branch_id=d.dc_bank_branch_id
					WHERE a.i_enable IN (?,?) 
						/*AND dc_cheque_id NOT IN (SELECT dc_cheque_id FROM fi_tranf_hdr WHERE i_is_cheque=1 AND i_enable=1 AND ISNULL(dc_cheque_id,0)>0)*/
					ORDER BY a.c_start_no,a.cm_pay_cheque_id";
	
	$arrParam	= array(DC_CHQ_I_FREE,DC_CHQ_I_RESERV);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(
					"id"		=> "{$row["cm_pay_cheque_id"]}",
					"c_name"	=> $row["c_full"]
			);
			${$root}[] = $temp;
		}
	}
	
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>