<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../gl/conf/configGl.php");

$db 		= new DatabaseServer();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam()
{

	global $db, $root, $data, $con, $ARR_GL_CFG_TEXT, $arr_status;

	$totalCount		= 0;
	$idx			= 1;

	// ========================================================================================== //
 
	if ($_REQUEST["i_enable"] > 0) {
		$con .= " AND aa.i_enable = " . $_REQUEST["i_enable"];
	}

	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY aa.c_code) AS [row],
						aa.dc_unit_type_id, 
						aa.c_code, 
						aa.c_name,
						aa.f_value,
						aa.i_enable 
					FROM dc_unit_type aa
					WHERE 1=1	{$con}
					ORDER BY aa.c_code asc;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$temp["dc_unit_type_id"]				= $row["dc_unit_type_id"]; 
			$temp["c_code"]							= $row["c_code"];
			$temp["c_name"]							= $row["c_name"];
			$temp["f_value"]						= $row["f_value"];
			$temp["c_enable_name"]					= $arr_status[$row["i_enable"]]; 
			$temp["i_enable"]						= $row["i_enable"];

			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
