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

	// 	$mode				= @$_REQUEST["mode"];
	// 	$i_read				= @$_REQUEST["i_read"];

	// 	$limit 	= @$_REQUEST["limit"];
	// 	$start 	= @$_REQUEST["start"];

	// 	if (!$util->get($start)) {
	// 		$start 	= 0;
	// 	}
	// 	if (!$util->get($limit)) {
	// 		$limit 	= 20;
	// 	} else {
	// 		$limit = ($limit + $start);
	// 	}

	// 	// 	switch($i_read) {
	// 	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 	// 		default:	$con = "";
	// 	// 	} 

	// 	if ($mode == "SEARCH") {

	// 		if ($_REQUEST["filter"] == "c_code_ref") {
	// 			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
	// 		} else if ($_REQUEST["filter"] == "c_approve") {
	// 			$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
	// 		}
	// 		// if ($_REQUEST["value"] != "") {
	// 		// 	$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
	// 		// }
	// 		// 	// 		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
	// 		// 	// 			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
	// 		// 	// 		}
	// 		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
	// 			$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
	// 		}
	// 		// 	// 		if ($_REQUEST["i_post"] > 0) {
	// 		// 	// 			$con .= " AND a.i_post=" . $_REQUEST["i_post"];
	// 		// 	// 		}
	// 		// 	// 		if ($_REQUEST["i_enable"] > 0) {
	// 		// 	// 			$con .= " AND a.i_enable=" . $_REQUEST["i_enable"];
	// 		// 	// 		}
	// 	}

	// $sqlMain = "
	// 	SET NOCOUNT ON
	// 	/* DATA HDR */
	// 	SELECT
	// 		ROW_NUMBER() OVER(ORDER BY d.d_doc_date ,b.c_approve) AS numrow
	// 		,b.po_working_hdr_id
	// 		,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
	// 		,b.c_code
	// 		,b.c_approve
	// 		,f.c_name AS budget_name
	// 		,e.c_code+' : '+e.c_name AS expense_name
	// 	INTO #Tem
	// 	FROM dbo.po_working_hdr a
	// 		INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
	// 		LEFT JOIN dbo.po_working_item d ON a.po_working_hdr_id = d.po_working_hdr_id AND d.i_status = {$_REQUEST["i_status_before"]}
	// 		LEFT JOIN dbo.bg_expense e ON b.bg_expense_id = e.bg_expense_id
	// 		LEFT JOIN dbo.dc_expense_budget_type f ON b.dc_expense_budget_type_id = f.dc_expense_budget_type_id
	// 	WHERE a.i_enable = 1 AND d.d_doc_date IS NOT NULL
	// 		AND a.i_status_last = {$_REQUEST["i_status_before"]};

	// 	/* DATA CHEQUE */
	// 	SELECT
	// 		a.numrow
	// 		,a.po_working_hdr_id
	// 		,ROW_NUMBER() OVER (PARTITION BY a.po_working_hdr_id ORDER BY a.c_code, a.c_approve, CASE WHEN b.c_cheque IS NULL THEN 0 ELSE 1 END DESC, b.c_cheque) AS i_show
	// 		,1 AS i_type
	// 		,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
	// 		,a.c_code
	// 		,a.c_approve
	// 		,a.budget_name
	// 		,a.expense_name
	// 		,b.c_creditor
	// 		,b.f_total
	// 		,b.c_cheque
	// 	INTO #TemData
	// 	FROM #Tem a
	// 		INNER JOIN dbo.po_working_cheque b ON a.po_working_hdr_id = b.po_working_hdr_id
	// 	ORDER BY c_code, c_approve, CASE WHEN b.c_cheque IS NULL THEN 0 ELSE 1 END DESC, c_cheque;

	// 	/* TOTAL APPROVE */
	// 	SELECT
	// 		a.numrow
	// 		,a.po_working_hdr_id
	// 		,'' AS i_show
	// 		,2 AS i_type
	// 		,'' AS d_doc_date
	// 		,'' AS c_code
	// 		,'' AS c_approve
	// 		,'' AS budget_name
	// 		,'' AS expense_name
	// 		,'จำนวนเงินใบขอเบิก' AS c_creditor
	// 		,c.f_total
	// 		,NULL AS c_cheque
	// 	INTO #TemData_working
	// 	FROM #Tem a
	// 		INNER JOIN dbo.po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id
	// 		INNER JOIN dbo.po_working_dtl c ON b.po_working_hdr_id = c.po_working_hdr_id;

	// 	/* SUM CHEQUE */
	// 	SELECT
	// 		numrow
	// 		,po_working_hdr_id
	// 		,'' AS i_show
	// 		,3 AS i_type
	// 		,'' AS d_doc_date
	// 		,'' AS c_code
	// 		,'' AS c_approve
	// 		,'' AS budget_name
	// 		,'' AS expense_name
	// 		,'รวมเช็ค' AS c_creditor
	// 		,SUM(f_total) AS f_total
	// 		,NULL AS c_cheque
	// 	INTO #TemData_cheque
	// 	FROM #TemData
	// 	GROUP BY numrow, po_working_hdr_id;

	// 	SELECT
	// 		numrow
	// 		,po_working_hdr_id
	// 		,i_show
	// 		,i_type
	// 		,CASE WHEN i_show = 1 THEN d_doc_date ELSE NULL END AS d_doc_date
	// 		,CASE WHEN i_show = 1 THEN c_code ELSE NULL END AS c_code
	// 		,CASE WHEN i_show = 1 THEN c_approve ELSE NULL END AS c_approve
	// 		,CASE WHEN i_show = 1 THEN budget_name ELSE NULL END AS budget_name
	// 		,CASE WHEN i_show = 1 THEN expense_name ELSE NULL END AS expense_name
	// 		,c_creditor
	// 		,f_total
	// 		,c_cheque
	// 		,1 AS i_success
	// 	FROM #TemData a
	// 	UNION ALL
	// 	SELECT
	// 		*
	// 		,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_cheque aa WHERE aa.po_working_hdr_id = b.po_working_hdr_id) = b.f_total THEN 1 ELSE 0 END AS i_success
	// 	FROM #TemData_working b
	// 	UNION ALL
	// 	SELECT
	// 		*
	// 		,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_working aa WHERE aa.po_working_hdr_id = c.po_working_hdr_id) = c.f_total THEN 1 ELSE 0 END AS i_success
	// 	FROM #TemData_cheque c
	// 	ORDER BY numrow, i_type;

	// 	SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$sqlMain = "
		SET NOCOUNT ON
		/* DATA HDR */
		SELECT
			b.po_working_hdr_id
			,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
			,b.c_code
			,b.c_approve
			,f.c_name AS budget_name
			,e.c_code+' : '+e.c_name AS expense_name
		INTO #Tem
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			LEFT JOIN dbo.po_working_item d ON a.po_working_hdr_id = d.po_working_hdr_id AND d.i_status = 8
			LEFT JOIN dbo.bg_expense e ON b.bg_expense_id = e.bg_expense_id
			LEFT JOIN dbo.dc_expense_budget_type f ON b.dc_expense_budget_type_id = f.dc_expense_budget_type_id
		WHERE a.i_enable = 1 AND d.d_doc_date IS NOT NULL
			AND a.i_status_last = {$_REQUEST["i_status_before"]};
		
		/* DATA CHEQUE */
		SELECT
			ROW_NUMBER() OVER(ORDER BY a.d_doc_date ,b.c_cheque) AS numrow
			,a.po_working_hdr_id
			,ROW_NUMBER() OVER (PARTITION BY a.po_working_hdr_id ORDER BY b.c_cheque) AS i_show
			,1 AS i_type
			,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
			,a.c_code
			,a.c_approve
			,a.budget_name
			,a.expense_name
			,b.c_creditor
			,b.f_total
			,b.c_cheque
		INTO #TemDataCheque
		FROM #Tem a
			INNER JOIN dbo.po_working_cheque b ON a.po_working_hdr_id = b.po_working_hdr_id
				AND b.i_cheque = 1;
		
		/* DATA ภาษี */
		SELECT
			*
		INTO #TemData
		FROM (
			SELECT * FROM #TemDataCheque
			UNION ALL
			SELECT
				DISTINCT
				a.numrow
				,a.po_working_hdr_id
				,0 AS i_show
				,1 AS i_type
				,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
				,a.c_code
				,a.c_approve
				,a.budget_name
				,a.expense_name
				,b.c_creditor
				,b.f_total
				,b.c_cheque
			FROM (
				SELECT
					MAX(aa.numrow) AS numrow
					,aa.po_working_hdr_id
					,aa.d_doc_date
					,aa.c_code
					,aa.c_approve
					,aa.budget_name
					,aa.expense_name
				FROM #TemDataCheque aa
				GROUP BY
					aa.po_working_hdr_id
					,aa.d_doc_date
					,aa.c_code
					,aa.c_approve
					,aa.budget_name
					,aa.expense_name
				) a
				INNER JOIN dbo.po_working_cheque b ON a.po_working_hdr_id = b.po_working_hdr_id
					AND b.i_cheque != 1
		) z
		
		/* TOTAL APPROVE */
		SELECT
			a.numrow
			,a.po_working_hdr_id
			,'' AS i_show
			,2 AS i_type
			,'' AS d_doc_date
			,'' AS c_code
			,'' AS c_approve
			,'' AS budget_name
			,'' AS expense_name
			,'จำนวนเงินใบขอเบิก' AS c_creditor
			,c.f_total
			,NULL AS c_cheque
		INTO #TemData_working
		FROM (SELECT MAX(aa.numrow) AS numrow, aa.po_working_hdr_id FROM #TemData aa GROUP BY aa.po_working_hdr_id) a
			INNER JOIN dbo.po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_dtl c ON b.po_working_hdr_id = c.po_working_hdr_id;
		
		/* SUM CHEQUE */
		SELECT
			numrow
			,po_working_hdr_id
			,'' AS i_show
			,3 AS i_type
			,'' AS d_doc_date
			,'' AS c_code
			,'' AS c_approve
			,'' AS budget_name
			,'' AS expense_name
			,'รวมเช็ค' AS c_creditor
			,SUM(f_total) AS f_total
			,NULL AS c_cheque
		INTO #TemData_cheque
		FROM (SELECT MAX(aa.numrow) AS numrow, aa.po_working_hdr_id, SUM(aa.f_total) AS f_total FROM #TemData aa GROUP BY aa.po_working_hdr_id) a
		GROUP BY numrow, po_working_hdr_id;
		
		SELECT
			numrow
			,po_working_hdr_id
			,i_show
			,i_type
			,CASE WHEN i_show = 1 THEN d_doc_date ELSE NULL END AS d_doc_date
			,CASE WHEN i_show = 1 THEN c_code ELSE NULL END AS c_code
			,CASE WHEN i_show = 1 THEN c_approve ELSE NULL END AS c_approve
			,CASE WHEN i_show = 1 THEN budget_name ELSE NULL END AS budget_name
			,CASE WHEN i_show = 1 THEN expense_name ELSE NULL END AS expense_name
			,c_creditor
			,f_total
			,c_cheque
			,1 AS i_success
		FROM #TemData a
		UNION ALL
		SELECT
			*
			,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_cheque aa WHERE aa.po_working_hdr_id = b.po_working_hdr_id) = b.f_total THEN 1 ELSE 0 END AS i_success
		FROM #TemData_working b
		UNION ALL
		SELECT
			*
			,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_working aa WHERE aa.po_working_hdr_id = c.po_working_hdr_id) = c.f_total THEN 1 ELSE 0 END AS i_success
		FROM #TemData_cheque c
		ORDER BY numrow, i_type, i_show DESC;
					
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> ($row["i_show"] == 1) ? $row["po_working_hdr_id"] : "",
				"po_working_hdr_id"					=> ($row["i_show"] > 0) ? $row["po_working_hdr_id"] : "",
				"i_type"							=> $row["i_type"],
				"budget_name"						=> $row["budget_name"],
				"c_code"							=> $row["c_code"],
				"c_approve"							=> $row["c_approve"],
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"expense_name"						=> $row["expense_name"],
				"c_creditor"						=> $row["c_creditor"],
				"f_total"							=> $row["f_total"],
				"c_cheque"							=> $row["c_cheque"],
				"i_success"							=> $row["i_success"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
