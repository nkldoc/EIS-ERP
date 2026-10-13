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
	if ($_REQUEST["po_expense_id"] > 0) {
		$con .= " AND aa.c_code_tree LIKE (SELECT LEFT(aaa.c_code_tree,2) FROM dbo.po_expense aaa WHERE aaa.po_expense_id = {$_REQUEST["po_expense_id"]} )+'%'";
	}
	if ($_REQUEST["i_enable"] > 0) {
		$con .= " AND aa.i_enable = " . $_REQUEST["i_enable"];
	}

	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY aa.c_code_tree) AS [row],
						aa.po_expense_id,
						aa.c_code+' '+aa.c_name AS c_full,
						aa.i_last,
						aa.i_level, 
						aa.i_enable,
						aa.c_code,
						aa.c_name
					FROM po_expense aa
					WHERE 1=1	{$con}
					ORDER BY aa.c_code asc;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$temp["po_expense_id"]					= $row["po_expense_id"];
			$temp["c_full"]							= $row["c_full"];
			$temp["c_code"]							= $row["c_code"];
			$temp["c_name"]							= $row["c_name"];
			$temp["c_enable_name"]					= $arr_status[$row["i_enable"]];
			$temp["i_last"]							= $row["i_last"];
			$temp["i_level"]						= $row["i_level"];

			${$root}[]	= $temp;
			$totalCount++;
			$idx++;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
