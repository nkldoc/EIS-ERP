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

if ($_REQUEST["type"] == "po_working_imp_hdr") {

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
            ROW_NUMBER() OVER (ORDER BY a.po_working_imp_hdr_id DESC) AS numrow
            ,a.po_working_imp_hdr_id
        INTO #TemData
        FROM dbo.po_working_imp_hdr a
        WHERE 1 = 1
            {$con};

        SELECT
            a.numrow
			,b.po_working_imp_hdr_id
			,b.c_code_ref
            ,b.c_name
            ,ISNULL(b.c_comment,'') AS c_comment
            ,b.i_enable
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
            INNER JOIN dbo.po_working_imp_hdr b ON a.po_working_imp_hdr_id = b.po_working_imp_hdr_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_working_imp_hdr_id"],
				"c_code_ref"						=> ($row["c_code_ref"] != "") ? $row["c_code_ref"] : "",
				"c_name"							=> ($row["c_name"] != "") ? $row["c_name"] : "",
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
} else if ($_REQUEST["type"] == "po_working_dtl") {

	$con .= (@$_REQUEST["i_status"] == 1) ? " AND a.i_status_last = 1" : "";
	$con .= (@$_REQUEST["hdr_id"] > 0) ? " AND a.po_working_hdr_id IN (SELECT aa.po_working_hdr_id FROM dbo.po_working_hdr aa WHERE aa.po_working_imp_hdr_id = {$_REQUEST["hdr_id"]})" : "";

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY b.c_code) AS numrow
			,b.po_working_hdr_id
			,b.i_budget_year
			,b.i_budget_year_overlap
			,b.dc_cost_id
			,b.dc_expense_budget_type_id
			,b.bg_expense_id
			,CONVERT(VARCHAR, b.d_audit_date, 120) AS d_audit_date
			,b.c_code
			,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
			,CONVERT(VARCHAR, b.d_inv_date, 120) AS d_inv_date
			,b.c_cnt_name
			,b.c_detail
			,b.c_qty
			,b.f_total
			,b.po_emp_id
		INTO #TemData
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
		WHERE a.i_enable = 1
			{$con};

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= null;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"										=> $row["numrow"],
				"id"										=> $row["po_working_hdr_id"],
				"i_budget_year"								=> "{$row["i_budget_year"]}",
				"i_budget_year_overlap"						=> "{$row["i_budget_year_overlap"]}",
				"dc_cost_id"								=> $row["dc_cost_id"],
				"dc_expense_budget_type_id"					=> $row["dc_expense_budget_type_id"],
				"bg_expense_id"								=> $row["bg_expense_id"],
				"d_audit_date"								=> ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",
				"c_code"									=> $row["c_code"],
				"d_doc_date"								=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"d_inv_date"								=> ($row["d_inv_date"] != "") ? $date->extDateBuddha($row["d_inv_date"]) : "",
				"c_cnt_name"								=> $row["c_cnt_name"],
				"c_detail"									=> $row["c_detail"],
				"c_qty"										=> $row["c_qty"],
				"f_total"									=> $row["f_total"],
				"po_emp_id"									=> $row["po_emp_id"]
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
