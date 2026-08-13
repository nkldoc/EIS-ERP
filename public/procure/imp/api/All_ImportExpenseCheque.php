<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_cheque") {

	$sqlMain	= "
		SELECT
			a.dc_cheque_id
			,a.c_show+' ('+c.c_name+')' AS c_name
		FROM dbo.dc_cheque a
			INNER JOIN dc_bank_acc_company b ON a.dc_bank_acc_company_id = b.dc_bank_acc_company_id
			INNER JOIN dc_bank_deposit_type c ON b.dc_bank_deposit_type_id = c.dc_bank_deposit_type_id
		WHERE a.dc_bank_acc_company_id = {$_REQUEST["dc_bank_acc_company_id_source"]}
			AND a.i_enable = ? AND a.i_delete = ?
			AND a.d_update BETWEEN DATEADD(MM,-10,GETDATE()) AND GETDATE() /* เช็คย้อนหลัง 10 เดือน */
		ORDER BY a.c_cheque";
	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_cheque_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
