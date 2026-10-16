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

	$i_sys = $_REQUEST["i_sys"] ?? "0";
	$sysCond = ($i_sys == "1") ? "WHERE i_sys = 1" : (($i_sys == "3") ? "WHERE i_sys = 3" : "");

	$sqlMain = "SELECT * FROM (
			select a.sp_emp_id, a.c_name + ' (คณะแพทยศาสตร์)' as c_name, 1 as i_sys
			from sp_emp a inner join dc_user b on b.dc_emp_id = a.dc_emp_id
			where a.dc_emp_id > 1 and a.dc_department_id > 0 and a.i_enable = ?
			union all
			select a.sp_emp_id, a.c_name + ' (มหาวิทยาลัย)' as c_name, 3 as i_sys
			from EIS_PROCURE..sp_emp a inner join EIS_PROCURE..dc_user b on b.dc_emp_id = a.dc_emp_id
			where a.dc_emp_id > 1 and a.dc_department_id > 0 and a.i_enable = ?
		) x $sysCond order by c_name";
	$arrParam	= array(STATUS_ENABLE, STATUS_ENABLE);
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
