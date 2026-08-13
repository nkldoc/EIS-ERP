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
		$con .= " AND cc.i_enable = " . $_REQUEST["i_enable"];
	}
 
	if ($_REQUEST["dc_menu_hdr_id"] > 0) {
		$con .= " AND cc.dc_menu_hdr_id = " . $_REQUEST["dc_menu_hdr_id"];
	}

	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY bb.c_code) AS [row],
						aa.dc_menu_dtl_id,  
						bb.c_name as c_menu_name,
						cc.i_enable
					FROM dc_menu_dtl aa
							INNER JOIN dc_menu bb ON bb.dc_menu_id = aa.dc_menu_id
							INNER JOIN dc_menu_hdr cc ON cc.dc_menu_hdr_id = aa.dc_menu_hdr_id
					WHERE 1=1	{$con}
					ORDER BY bb.c_code asc;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			
			$temp["row"]					= $row["row"];
			$temp["dc_menu_dtl_id"]			= $row["dc_menu_dtl_id"];
			$temp["c_menu_name"]			= $row["c_menu_name"]; 
			$temp["c_enable_name"]			= $arr_status[$row["i_enable"]]; 
			$temp["i_enable"]				= $row["i_enable"];

			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
