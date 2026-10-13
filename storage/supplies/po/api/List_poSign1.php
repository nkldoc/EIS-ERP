<?php
include("../conf/configPo.php");
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

if ($_REQUEST["type"] == "po_working_cheque") {

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

	// 	// 	switch($i_read) {
	// 	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 	// 		default:	$con = "";
	// 	// 	} 

	if ($mode == "SEARCH") {

		if ($_REQUEST["filter"] == "c_code_ref") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_approve") {
			$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		// if ($_REQUEST["value"] != "") {
		// 	$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		// }
		// 	// 		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
		// 	// 			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		// 	// 		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
		// 	// 		if ($_REQUEST["i_post"] > 0) {
		// 	// 			$con .= " AND a.i_post=" . $_REQUEST["i_post"];
		// 	// 		}
		// 	// 		if ($_REQUEST["i_enable"] > 0) {
		// 	// 			$con .= " AND a.i_enable=" . $_REQUEST["i_enable"];
		// 	// 		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER(ORDER BY c.d_doc_date ,b.c_approve) AS numrow
			,a.po_working_hdr_id
			,c.d_doc_date
		INTO #TemData
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			LEFT JOIN dbo.po_working_item c ON a.po_working_hdr_id = c.po_working_hdr_id
				AND c.i_status = {$_REQUEST["i_status_before"]}
		WHERE a.i_enable = 1 AND c.d_doc_date IS NOT NULL
			AND a.i_status_last = {$_REQUEST["i_status_before"]}
			AND c.i_is_url_pdf_hdr IS NULL;
		
		SELECT
			a.numrow
			,b.po_working_hdr_id
			,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
			,b.c_code
			,b.c_approve
			,f.c_name AS budget_name
			,e.c_code+' : '+e.c_name AS expense_name
			,g.c_name AS c_creditor
			,b.f_total
		FROM #TemData a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			LEFT JOIN dbo.bg_expense e ON b.bg_expense_id = e.bg_expense_id
			LEFT JOIN dbo.dc_expense_budget_type f ON b.dc_expense_budget_type_id = f.dc_expense_budget_type_id
			LEFT JOIN dbo.po_creditor g ON b.po_creditor_id = g.po_creditor_id AND g.i_enable = 1 AND g.i_delete = 2
		ORDER BY a.numrow;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_working_hdr_id"],
				"budget_name"						=> $row["budget_name"],
				"c_code"							=> $row["c_code"],
				"c_approve"							=> $row["c_approve"],
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"expense_name"						=> $row["expense_name"],
				"c_creditor"						=> $row["c_creditor"],
				"f_total"							=> $row["f_total"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
