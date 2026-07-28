<?php
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/database/apiUtil.php");

$db = new DatabaseServer ();
$util = new apiUtil ();

$root = "data";
$data = array ();
$con = null;
if ($_REQUEST ["type"] == "dc_bank") {
	
	$sqlMain = "SELECT * FROM vw_dc_bank a WHERE a.i_enable = ? ORDER BY a.c_name";
	
	$arrParam = array ( STATUS_ENABLE );
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		if (@$_REQUEST ["all"] == "all") {
			${$root} [] = array (
					"id" => "0",
					"c_name" => "- เลือกทั้งหมด -" 
			);
		}
		while ( $row = $db->Fetch ( $stmt ) ) {
			$temp = array (
					"id"		=> "{$row["dc_bank_id"]}",
					"c_name"	=> $row["name_shot"]." : ".$row["c_name"] 
			);
			${$root} [] = $temp;
		}
	}
} else if ($_REQUEST ["type"] == "dc_bank_acc_company") {
	
	$con	= "";
	
	$for_id = explode ( ";", $_REQUEST ["dc_bank_id"] );
	
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_bank_id IN (" . $in . ")" : " AND 1=0";
		}
	}
	
	$sqlMain = "SELECT
					b.dc_bank_acc_company_id
					,a.name_shot
					,b.c_name
					,b.c_code
				FROM vw_dc_bank a
					INNER JOIN dc_bank_acc_company b ON a.dc_bank_id = b.dc_bank_id
				WHERE a.i_enable = ".STATUS_ENABLE."
					AND b.i_enable = ".STATUS_ENABLE."
					AND b.i_delete = ".DELETE_FALSE."
					{$con}
				ORDER BY a.c_name";
	
	$arrParam = array ();
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	if ($stmt) {
		if(sqlsrv_has_rows($stmt) === true) {
			
			if (@$_REQUEST ["all"] == "all") {
				${$root} [] = array (
						"id" => "0",
						"c_name" => "- เลือกทั้งหมด -" 
				);
			}
		
			while ( $row = $db->Fetch ( $stmt ) ) {
				$temp = array (
						"id"		=> "{$row["dc_bank_acc_company_id"]}",
						"c_name"	=> $row["name_shot"]." : ".$row["c_code"]." : ".$row["c_name"]
				);
				${$root} [] = $temp;
			}
		}
	}
} else if($_REQUEST["type"] == "vw_dc_bank_acc_company") {
 
	$con	= "";
	
	$for_id = explode ( ";", $_REQUEST ["dc_bank_id"] );
	
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_bank_id IN (" . $in . ")" : " AND 1=0";
		}
	}
	
	
	$sqlMain	= "	SELECT a.* FROM vw_dc_bank_acc_company_full a   
					WHERE a.i_delete = ? 
						{$con}
					ORDER BY a.c_bank_name,a.c_type_name,a.c_code";
	
	$arrParam	= array(DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		
		if(@$_REQUEST["all"] == "all") {
			${$root}[] = array(
					"id"		=> "0",
					"c_name"	=> "- เลือกทั้งหมด -"
			);
		}
			
		while($row =$db->Fetch($stmt)) {
			$temp = array(
					"id"		=> "{$row["dc_bank_acc_company_id"]}",
					"c_name"	=> "{$row["c_full"]}"
			);
			${$root}[] = $temp;
		}
	}
	
}
echo json_encode ( array ("debug" => true, $root => ${$root} ) );
exit ();
?>