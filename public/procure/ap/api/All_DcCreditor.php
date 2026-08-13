<?php
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$root	= "data";

if($_REQUEST["type"] == "tax_cus") {
	$sqlMain	= "SELECT * FROM dc_tax_customer WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$arrParam	= array(1, 2);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	
							"id"		=> "{$row["dc_tax_customer_id"]}",
							"c_name"	=> "{$row["c_name"]}"
						);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "tax_cus_all") {
	$sqlMain	= "SELECT * FROM dc_tax_customer WHERE i_enable = ? AND i_delete = ? ORDER BY c_name";
	$arrParam	= array(1, 2);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
		);
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	
							"id"		=> "{$row["dc_tax_customer_id"]}",
							"c_name"	=> "{$row["c_name"]}"
						);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "title") {
	$sqlMain	= "SELECT * FROM dc_title WHERE i_enable = ? AND i_delete = ? ORDER BY dc_title_id";
	$arrParam	= array(1, 2);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	
							"id"		=> "{$row["dc_title_id"]}",
							"c_name"	=> "{$row["c_name"]}"
						);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST["type"] == "dc_acc") {
	$sqlMain	= "SELECT * FROM dc_acc WHERE i_last = ? AND i_enable = ? AND i_delete = ? AND c_code LIKE '2%' ORDER BY c_code";
	$arrParam	= array(1, 1, 2);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt) {
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	
							"id"		=> "{$row["dc_acc_id"]}",
							"c_name"	=> $row["c_code"]." ".$row["c_name"]
						);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>