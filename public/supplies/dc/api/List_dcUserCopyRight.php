<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
if ($_REQUEST["type"] == "list_user") {

	$sqlMain = "
		select dc_user_id, c_full_name
			, c_user_name 
		from " . DB_CENTER . "dc_user
		where ISNULL(i_delete," . DELETE_FALSE . ") = " . DELETE_FALSE . "
		AND i_enable = 1
		order by c_user_name
	";

	$stmt = $db->QueryParam($sqlMain, array());
	$i = 0;
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"						=> $i++,
				"id"						=> $row["dc_user_id"],
				"dc_user_id"           		=> $row["dc_user_id"],
				"c_full_name"				=> $row["c_full_name"],
				"c_user_name"				=> $row["c_user_name"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
	exit;
}
