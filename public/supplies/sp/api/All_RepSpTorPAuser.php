<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "sp_user") {

	$sqlMain	= "select * from sp_emp a inner join dc_user b on b.dc_emp_id = a.dc_emp_id   where a.dc_emp_id>1  " ;
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
				"id"		=> "{$row["dc_user_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}

} else  if ($_REQUEST["type"] == "sp_emp") {
	$i_level = $_SESSION['i_level'] ;
	$dc_department = $_SESSION['dc_department_id'] ;
	$sp_emp_id = $_SESSION['sp_emp_id'] ;
	if($i_level == 1 || $sp_emp_id == 32  || $sp_emp_id == 46   ) {
		$where = ' ';
	} else if ( $i_level == 2 ) {
		$where = ' and dc_department_id = ' .$dc_department    ; 
	} else if ( $i_level  == 3  ) { 
		if ( $sp_emp_id == 40 ){
			$where = ' ';
		} else  {
			$where = ' and sp_emp_id = ' .$sp_emp_id    ; 
		}
	} 
	$sqlMain	= "select *,a.dc_department_id,a.sp_emp_id,a.c_name  from sp_emp a inner join dc_user b on b.dc_emp_id = a.dc_emp_id  
	 where a.dc_emp_id > 1 and a.dc_department_id > 0   "
	 ."{$where} 
	 ORDER BY a.c_name ; 
	 "  ;
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all" && $i_level ==  1  || $sp_emp_id == 32 || $sp_emp_id == 40  ) {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		} else if ($i_level ==  2 ) {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "เลือกทั้งสายงาน"
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
} else  if ($_REQUEST["type"] == "sp_emp_show") {
	$i_level = $_SESSION['i_level'] ;
	$dc_department = $_SESSION['dc_department_id'] ;
	$sp_emp_id = $_SESSION['sp_emp_id'] ;
	// if($i_level == 1 || $sp_emp_id == 32  || $sp_emp_id == 46 || $sp_emp_id == 13 || $sp_emp_id == 19   ) {
		$where = ' ';
	// } else if ( $i_level == 2 ) {
	// 	$where = ' and dc_department_id = ' .$dc_department    ; 
	// } else if ( $i_level  == 3  ) { 
	// 	if ( $sp_emp_id == 40 ){
	// 		$where = ' ';
	// 	} else  {
	// 		$where = ' and sp_emp_id = ' .$sp_emp_id    ; 
	// 	}
	// } 
	$sqlMain	= "select *,a.dc_department_id,a.sp_emp_id,a.c_name  from sp_emp a inner join dc_user b on b.dc_emp_id = a.dc_emp_id  
	 where a.dc_emp_id > 1 and a.dc_department_id > 0   "
	 ."{$where} 
	 ORDER BY a.c_name ; 
	 "  ;
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all" ) {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		} else if ($i_level ==  2 ) {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "เลือกทั้งสายงาน"
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

}else  if ($_REQUEST["type"] == "sp_emp_department") {
	// $i_level = $_SESSION['i_level'] ;
	// $dc_department = $_SESSION['dc_department_id'] ;
	// $sp_emp_id = $_SESSION['sp_emp_id'] ;
	// if($i_level == 1 ) {
	// 	$where = ' ';
	// } else if ( $i_level == 2 ) {
	// 	$where = ' and dc_department_id = ' .$dc_department    ; 
	// } else if ( $i_level  == 3  ) { 
	// 	$where = ' and sp_emp_id = ' .$sp_emp_id    ; 
	// }
	$sqlMain	= "select *,a.dc_department_id,a.sp_emp_id,a.c_name  from sp_emp a inner join dc_user b on b.dc_emp_id = a.dc_emp_id   where a.dc_emp_id>1 ;"  ;	
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		} 
		// else if ($i_level ==  2 ) {
		// 	${$root}[] = array(
		// 		"id"		=> "0",
		// 		"c_name"	=> "เลือกทั้งสายงาน"
		// 	);
		// }

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["sp_emp_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}

}
echo json_encode(array("debug" => true, $root => ${$root}));
exit;
