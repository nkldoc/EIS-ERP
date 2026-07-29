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

if ($_REQUEST["type"] == "dc_user") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	// if (!$util->get($start)) {
	// 	$start 	= 0;
	// }
	// if (!$util->get($limit)) {
	// 	$limit 	= 20;
	// } else {
	// 	$limit = ($limit + $start);
	// }

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 

	if ($mode == "SEARCH") {

		if ($_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.c_full_name) AS numrow
            ,a.dc_user_id
        INTO #TemData
        FROM dbo.dc_user a
        WHERE a.i_enable = 1 AND a.i_delete = 2 AND a.i_type_user = 1
            {$con};

        SELECT
			a.numrow
			,b.dc_user_id
			,b.c_full_name AS c_name
			,ISNULL(c.i_approve,0) AS i_approve
			,ISNULL(c.i_permission,0) AS i_permission
        FROM #TemData a
			INNER JOIN dbo.dc_user b ON a.dc_user_id = b.dc_user_id
			LEFT JOIN dbo.po_user_permission c ON b.dc_user_id = c.dc_user_id
        ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["dc_user_id"],
				"c_name"							=> $row["c_name"],
				"i_approve"							=> $row["i_approve"],
				"i_permission"						=> $row["i_permission"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
