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

if ($_REQUEST["type"] == "po_parcel_officer") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 20;
	} else {
		$limit = ($limit + $start);
	}

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 

	if ($mode == "SEARCH") {

		if ($_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		// 		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
		// 			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		// 		}
		// 		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 			$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		// 		}
		// 		if ($_REQUEST["i_post"] > 0) {
		// 			$con .= " AND a.i_post=" . $_REQUEST["i_post"];
		// 		}
		// 		if ($_REQUEST["i_enable"] > 0) {
		// 			$con .= " AND a.i_enable=" . $_REQUEST["i_enable"];
		// 		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.c_name) AS numrow,
			a.po_parcel_officer_id,
			a.c_name,
			b.c_name AS dc_cost_name,
			a.i_enable
		INTO #TemData
		FROM dbo.po_parcel_officer a
		LEFT JOIN dc_cost b ON a.dc_cost_id = b.dc_cost_id
		WHERE  a.i_delete = 2
			{$con};
		
		SELECT
			*
		FROM #TemData a
		WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_parcel_officer_id"],
				"dc_cost_name"						=> $row["dc_cost_name"],
				"c_name"							=> $row["c_name"],
				"i_enable"							=> $row["i_enable"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
