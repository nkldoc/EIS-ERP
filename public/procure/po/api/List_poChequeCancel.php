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

if ($_REQUEST["type"] == "po_working_hdr") {

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

		if ($_REQUEST["filter"] == "c_code_ref") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_approve") {
			$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.c_code_ref DESC) AS numrow
			,a.po_working_hdr_id
		INTO #TemData
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
		WHERE a.i_enable = 1 AND b.i_success = 1
			{$con};
		
		SELECT
			a.numrow
			,b.po_working_hdr_id
			,c.c_code
			,c.c_approve
			,CONVERT(VARCHAR, c.d_approve_date, 120) AS d_approve_date
			,e.c_name AS cost_name
			,f.c_name AS budget_name
			,g.c_code+' : '+g.c_name AS bg_expense_name
			,h.c_name AS creditor_name
			,c.f_total
		FROM #TemData a
			INNER JOIN dbo.po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_dtl c ON b.po_working_hdr_id = c.po_working_hdr_id
			
			LEFT JOIN dbo.dc_cost e ON c.dc_cost_id = e.dc_cost_id AND e.i_enable = 1 AND e.i_delete = 2
			LEFT JOIN dbo.dc_expense_budget_type f ON c.dc_expense_budget_type_id = f.dc_expense_budget_type_id AND f.i_enable = 1 AND f.i_delete = 2
			LEFT JOIN dbo.bg_expense g ON c.bg_expense_id = g.bg_expense_id AND g.i_enable = 1
			LEFT JOIN dbo.po_creditor h ON c.po_creditor_id = h.po_creditor_id AND h.i_enable = 1
		WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_working_hdr_id"],
				"c_code"							=> $row["c_code"],
				"c_approve"							=> $row["c_approve"],
				"d_approve_date"					=> ($row["d_approve_date"] != "") ? $date->extDateBuddha($row["d_approve_date"]) : "",
				"cost_name"							=> ($row["cost_name"]) ? $row["cost_name"] : "-",
				"budget_name"						=> $row["budget_name"],
				"bg_expense_name"					=> $row["bg_expense_name"],
				"creditor_name"						=> $row["creditor_name"],
				"f_total"							=> $row["f_total"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "po_working_cheque") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @po_working_hdr_id BIGINT = {$_REQUEST["hdr_id"]};
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.i_status,CASE WHEN a.c_cheque IS NULL THEN 0 ELSE 1 END DESC,a.c_cheque) AS numrow
			,1 AS i_type
			,a.po_working_cheque_id
			,a.c_creditor
		INTO #TemData
		FROM dbo.po_working_cheque a
		WHERE a.po_working_hdr_id = @po_working_hdr_id
			{$con};

		SELECT
			2 AS i_type
			,NULL AS numrow
			,NULL AS po_working_cheque_id
			,'' AS c_creditor
			,'จำนวนเงินขอเบิก' AS c_cheque
			,b.f_total
			,'' AS c_comment
			,NULL AS i_status
			,NULL AS i_cheque
		INTO #TemData_working
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id AND a.i_enable = 1 AND a.po_working_hdr_id = @po_working_hdr_id;
		
		SELECT
			3 AS i_type
			,NULL AS numrow
			,NULL AS po_working_cheque_id
			,'' AS c_creditor
			,'จำนวนรวมเช็ค' AS c_cheque
			,ISNULL(SUM(ISNULL(b.f_total,0)),0) AS f_total
			,'' AS c_comment
			,NULL AS i_status
			,NULL AS i_cheque
		INTO #TemData_cheque
		FROM #TemData a
			INNER JOIN dbo.po_working_cheque b ON a.po_working_cheque_id = b.po_working_cheque_id;
		
		SELECT
			i_type
			,a.numrow
			,b.po_working_cheque_id
			,b.c_creditor
			,b.c_cheque
			,b.f_total
			,b.c_comment
			,b.i_status
			,b.i_cheque
		FROM #TemData a
			INNER JOIN dbo.po_working_cheque b ON a.po_working_cheque_id = b.po_working_cheque_id
		UNION ALL
		SELECT * FROM #TemData_working
		UNION ALL
		SELECT * FROM #TemData_cheque
		ORDER BY i_type,numrow;

		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam = array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"i_type"							=> $row["i_type"],
				"id"								=> $row["po_working_cheque_id"],
				"c_creditor"						=> $row["c_creditor"],
				"c_cheque"							=> $row["c_cheque"],
				"f_total"							=> $row["f_total"],
				"c_comment"							=> $row["c_comment"],
				"i_status"							=> $row["i_status"],
				"i_cheque"							=> $row["i_cheque"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
