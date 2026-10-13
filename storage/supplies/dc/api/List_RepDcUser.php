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
						ROW_NUMBER() OVER (ORDER BY aa.c_full_name) AS [row],
						aa.dc_user_id,
						aa.dc_emp_id, 
						aa.c_full_name,  
						aa.i_enable,
						(select bb.c_code from dc_emp bb where bb.dc_emp_id=aa.dc_emp_id) as c_code,
						(select bb.c_name from dc_cost bb where bb.dc_cost_id=aa.dc_cost_id) as c_cost_name
					FROM dc_user aa
					WHERE 1=1	{$con}
					ORDER BY aa.c_full_name asc;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$temp["dc_user_id"]						= $row["dc_user_id"];
			$temp["dc_emp_id"]						= $row["dc_emp_id"];
			$temp["c_code"]							= $row["c_code"];
			$temp["c_full_name"]					= $row["c_full_name"]; 
			$temp["c_cost_name"]					= $row["c_cost_name"]; 
			$temp["c_enable_name"]					= $arr_status[$row["i_enable"]]; 
			$temp["i_enable"]						= $row["i_enable"];

			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
