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

if( $_REQUEST["type"] == "pay_status" ) {

	if( @$_REQUEST["show"] == "all" ) {
		${$root}[] = array(
			"id"		=> "99",
			"c_name"	=> "- เลือกทั้งหมด -"
		);
	}
	foreach( $pay_status_arr AS $key => $val ) {
		if( is_numeric($key) ) {
			$temp = array(
					"id"		=> "{$key}",
					"c_name"	=> $val
			);
			${$root}[] = $temp;
		}
	}
	
} else if($_REQUEST["type"] == "dc_cost") {
	
	$con	= "";
	
	if(@$_REQUEST["mode"] == "SEARCH") {
		if(@$_REQUEST["value"] != "") { $con .= " AND ".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
	}
	
	$sqlMain	= "	SELECT * FROM dc_cost WHERE i_last=? AND i_delete=? AND i_enable=? AND c_name NOT LIKE '%CT%'
						{$con}
					ORDER BY c_code";
	$arrParam	= array(1, DELETE_FALSE, STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		
		if(@$_REQUEST["show"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
		
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(
					"id"		=> "{$row["dc_cost_id"]}",
					"c_name"	=> $row["c_code"]." ".$row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
} else if( $_REQUEST["type"] == "storeOtherAcc" ) {
	
	$sqlMain	= "	SELECT * FROM dc_acc WHERE i_delete=? AND i_enable=?
						AND dc_acc_id IN (SELECT dc_acc_id FROM gl_dc_config WHERE i_enable = ".STATUS_ENABLE." AND i_config = ?) 
					ORDER BY c_code";
	$arrParam	= array(DELETE_FALSE, STATUS_ENABLE, GL_CFG_VOUCHER);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(
					"id"		=> "{$row["dc_acc_id"]}",
					"c_code"	=> $row["c_code"],
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
} else if( $_REQUEST["type"] == "dc_bg_type" ) {
	
	$sqlMain	= "	SELECT * FROM dc_bg_type WHERE i_enable=? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
	
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(
					"id"		=> "{$row["dc_bg_type_id"]}",
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
	
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>