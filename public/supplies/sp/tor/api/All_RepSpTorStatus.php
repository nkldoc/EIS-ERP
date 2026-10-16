<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");

$db		= new DatabaseServer();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "sp_tor_status") {

	$sqlMain	= "select i_menu ,sp_status_hdr_id,c_name   from sp_status_hdr   where  isnull(i_menu,0) != 0  order by i_menu " ;
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
				"id"		=> "{$row["sp_status_hdr_id"]}",
				"c_name"	=> "{$row["c_name"]}",
				"i_menu"	=> "{$row["i_menu"]}"
			);
			${$root}[] = $temp;
		}
	}

}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
