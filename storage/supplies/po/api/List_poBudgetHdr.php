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

if ($_REQUEST["type"] == "po_budget_hdr") {

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

		// 		if ($_REQUEST["value"] != "") {
		// 			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		// 		}
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
            ROW_NUMBER() OVER (ORDER BY a.i_year DESC, a.dc_expense_budget_type_id) AS numrow
            ,a.po_budget_hdr_id
        INTO #TemData
        FROM dbo.po_budget_hdr a
        WHERE a.i_enable = 1
            {$con};

        SELECT
            a.numrow
			,b.po_budget_hdr_id
			,b.i_year
			,b.dc_expense_budget_type_id
			,c.c_name AS dc_expense_budget_type_name
            ,ISNULL(b.c_comment,'') AS c_comment
            ,b.i_enable
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
			INNER JOIN dbo.po_budget_hdr b ON a.po_budget_hdr_id = b.po_budget_hdr_id
			LEFT JOIN dbo.dc_expense_budget_type c ON b.dc_expense_budget_type_id = c.dc_expense_budget_type_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_budget_hdr_id"],
				"i_year"							=> $row["i_year"],
				"dc_expense_budget_type_id"			=> $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type_name"		=> $row["dc_expense_budget_type_name"],
				"i_enable"							=> $row["i_enable"],
				"c_comment"							=> $row["c_comment"],
				"show_enable"						=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "po_budget_dtl") {

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY b.c_code) AS numrow
			,a.po_budget_dtl_id
			,a.po_expense_id
			,a.f_total
			,a.c_comment
		INTO #TemData
		FROM dbo.po_budget_dtl a
			LEFT JOIN dbo.po_expense b ON a.po_expense_id = b.po_expense_id AND b.i_enable = 1 AND b.i_delete = 2
		WHERE a.po_budget_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"										=> $row["numrow"],
				"id"										=> $row["po_budget_dtl_id"],
				"po_expense_id"								=> $row["po_expense_id"],
				"f_total"									=> $row["f_total"],
				"c_comment"									=> $row["c_comment"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
