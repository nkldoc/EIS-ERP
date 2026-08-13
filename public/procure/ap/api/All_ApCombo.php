<?php
include("../conf/configAp.php");
include("../../tax/conf/configTax.php");
include("../../gl/conf/configGl.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if( $_REQUEST["type"] == "storeTax" ) {
	
	$sqlMain	= "	SELECT
						dc_vat_id 
						,c_code
						,c_name
						,ISNULL(f_vat_rate,0) AS f_vat_rate
					FROM dc_vat WHERE i_delete = ? AND i_enable=? ORDER by dc_vat_id;";
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"id"			=> $row["dc_vat_id"],
							"c_code"		=> $row["c_code"],
							"f_vat_rate"	=> $row["f_vat_rate"],
							"c_name"		=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
} else if( $_REQUEST["type"] == "dataTax" ) {
	
	$i_is_salary 			= @$_REQUEST["i_is_salary"];
	$i_type_person			= @$_REQUEST["i_type_person"];
	$i_is_oth_m48 			= @$_REQUEST["i_is_oth_m48"];
	$i_is_cnt_m48 			= @$_REQUEST["i_is_cnt_m48"];
	$i_is_emp_m40_1 		= @$_REQUEST["i_is_emp_m40_1"];
		
	$where = "";
	if ( $i_is_salary >= 1 ) { $where = " AND i_type_whtax = ".TAX_BY_NONE; }
	if ( $i_is_salary < 1 ) {
		if ($i_is_oth_m48 == 1 || $i_is_cnt_m48 == 1) {
			$where	= " AND i_type_whtax = ".TAX_BY_PROGRESS;
		}
	}
	if ($i_type_person == PERSON_OTHER) {
		$where	= " AND i_type_whtax IN (".TAX_BY_RATE.",".TAX_BY_NONE.",".TAX_BY_PROGRESS.")";
	}
	if ($i_is_emp_m40_1 == 1) { $where = " AND i_type_whtax=".TAX_BY_PROGRESS; }
	
	$sqlMain	= "	SELECT
						dc_tax_id
						,c_code
						,c_name
						,ISNULL(f_tax_rate,0) AS f_tax_rate
						,ISNULL(i_type_whtax,0) AS i_type_whtax
					FROM dc_tax
					WHERE i_delete =? and i_enable = ?
						".$where."
					ORDER BY dc_tax_id;";
	
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"id"			=> $row["dc_tax_id"],
							"c_code"		=> $row["c_code"],
							"f_tax_rate"	=> $row["f_tax_rate"],
							"i_type_whtax"	=> $row["i_type_whtax"],
							"c_name"		=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
} else if( $_REQUEST["type"] == "penaltyStore" ) {
	
	$sqlMain	= "	SELECT
						ap_penalty_id
						,c_code
						,c_name
					FROM ap_penalty
					WHERE i_delete = ? and i_enable = ?
					ORDER BY ap_penalty_id;";
	
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"id"			=> $row["ap_penalty_id"],
							"c_code"		=> $row["c_code"],
							"c_name"		=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
} else if( $_REQUEST["type"] == "storeDecAcc" ) {

	$sqlMain	= "	SELECT
						dc_acc_id
						,c_code
						,c_name
					FROM dc_acc
					WHERE i_group = 5 AND i_last = 1 AND i_delete = ? and i_enable = ?
					ORDER BY c_code;";

	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {

		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"id"			=> $row["dc_acc_id"],
							"c_code"		=> $row["c_code"],
							"c_name"		=> $row["c_code"]." : ".$row["c_name"]
			);
			${$root}[] = $temp;
		}
	}

}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>