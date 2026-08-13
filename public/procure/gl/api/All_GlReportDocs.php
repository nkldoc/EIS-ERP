<?php
include("../conf/configGl.php");
include("../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

$root	= "data";

if($_REQUEST['type'] == 'dc_acc') {
	// dc_acc
	$sqlMain	= "SELECT * FROM dc_acc WHERE  i_last=1 AND i_delete = ? and i_enable=1 ORDER BY c_code";
	$arrParam	= array(DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(	"id"		=> '0',
							"c_name"	=> '- เลือกทั้งหมด -');
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"id"		=> $row["dc_acc_id"],
							"c_name"	=> $row["c_code"].' '.$row["c_name"] );
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST['type'] == 'dc_acc_main') {
	// dc_acc
	$sqlMain	= "SELECT * FROM dc_acc WHERE  i_last=2 and i_level=? AND i_delete = ? and i_enable=1 ORDER BY c_code";
	$arrParam	= array(4,DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(	"id"		=> '0',
							"c_name"	=> '- เลือกทั้งหมด -');
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	"id"		=> $row["dc_acc_id"],
							"c_name"	=> $row["c_code"].' '.$row["c_name"] );
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST['type'] == 'dc_cost') {
	// dc_cost
	$sqlMain	= "SELECT *,c_code+' : '+c_name as c_full FROM dc_cost WHERE i_last=1 AND i_delete = ?  and i_enable=1 ORDER BY c_code";
	$arrParam	= array(DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if($stmt){
		${$root}[] = array(	"id"		=> '0',
							"c_name"	=> '- เลือกทั้งหมด -');
		while($row =$db->Fetch($stmt))
		{
			$temp = array(	
							"id"		=> $row["dc_cost_id"],
							"c_name"	=> $row["c_full"] 
						);
			${$root}[] = $temp;
		}
	}
} else if($_REQUEST['type'] == 'dc_user') {
	$sqlMain	= "SELECT b.dc_user_id,c.c_name FROM gl_tran_hdr a INNER JOIN dc_user b
					ON a.dc_user_create_id = b.dc_user_id INNER JOIN dc_emp c
					ON b.dc_emp_id = c.dc_emp_id
					GROUP BY b.dc_user_id,c.c_name
					ORDER BY c.c_name";
	$stmt = $db->Query($sqlMain);
	if($stmt){
		${$root}[] = array(
				"id"		=> '0',
				"c_name"	=> '- เลือกทั้งหมด -'
		);
		while($row =$db->Fetch($stmt)){
			$temp = array(
					"id"		=> $row["dc_user_id"],
					"c_name"	=> $row["c_name"]
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug"=>true,$root=>${$root}));
exit;
?>
