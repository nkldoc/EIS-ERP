<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;
if ($_REQUEST["type"] == "sp_department") {

	$sqlMain	= "	SELECT dc_department_id ,c_name FROM sp_department a" ;
					


	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_department_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}
else  if ($_REQUEST["type"] == "sp_emp") {

	$sqlMain	= "select * from sp_emp a inner join dc_user b on b.dc_emp_id = a.dc_emp_id   where a.dc_emp_id>1 and a.dc_department_id  > 0  " ;
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["sp_emp_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}

} else if ($_REQUEST["type"] == "sp_department_type") {

	$sqlMain	= "	SELECT dc_department_id ,c_name FROM sp_department a  where dc_department_id in (2,3)" ;
					


	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_department_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}



echo json_encode(array("debug" => true, $root => ${$root}));
exit;
