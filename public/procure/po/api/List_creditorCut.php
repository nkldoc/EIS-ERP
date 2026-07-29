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

if ($_REQUEST["type"] == "po_working_cheque") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 
	$con1 = null;
	$con2 = null;

	if ($mode == "SEARCH") {

		if ($_REQUEST["filter"] == "c_approve") {
			$con1	.= " AND bb." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["filter"] == "c_cheque") {
			$con1	.= " AND dd." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}

		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con1	.= " AND bb.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
		}

		if ($_REQUEST["f_total"] > 0) {
			$con1	.= " AND dd.f_total = " . $_REQUEST["f_total"];
		}

		if ($_REQUEST["i_expire"] > 0) {
			$con2	.= " AND a.i_expire = " . $_REQUEST["i_expire"];
		} else {
			$con2	.= " AND a.i_expire = 1"; // เช็คที่จ่ายแล้วยังไม่เกิน 60 วัน
		}
	}

	$sqlMain = "
			SET NOCOUNT ON
			SELECT
				TOP 800
				ROW_NUMBER() OVER(ORDER BY i_status, d_doc_date, c_approve, CASE WHEN c_cheque IS NULL THEN 0 ELSE 1 END DESC, c_cheque, c_cheque) AS [row]
				,ROW_NUMBER() OVER (PARTITION BY i_status, d_doc_date, c_approve ORDER BY i_status, d_doc_date, c_approve, CASE WHEN c_cheque IS NULL THEN 0 ELSE 1 END DESC, c_cheque) AS i_type
				,*
			INTO #TemData
			FROM
			(
				/* เช็คที่ยังไม่จ่าย */
				SELECT
					1 AS i_expire
					,dd.po_working_cheque_id
					,cc.d_doc_date
					,bb.c_approve
					,ee.c_name AS budget_name
					,a1.c_name AS c_expense_group
					,a2.c_name AS c_expense
					,dd.c_creditor
					,dd.c_cheque
					,dd.f_total
					,dd.d_pay_date
					,dd.i_status
					,dd.c_comment
				FROM dbo.po_working_hdr aa
					INNER JOIN dbo.po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
					INNER JOIN dbo.po_working_item cc ON aa.po_working_hdr_id = cc.po_working_hdr_id AND cc.i_status = 11
					INNER JOIN dbo.po_working_cheque dd ON aa.po_working_hdr_id = dd.po_working_hdr_id

					LEFT JOIN dbo.dc_expense_budget_type ee ON bb.dc_expense_budget_type_id = ee.dc_expense_budget_type_id
					LEFT JOIN dbo.bg_expense a2 ON bb.bg_expense_id = a2.bg_expense_id AND a2.i_enable = 1 AND a2.i_delete = 2
					LEFT JOIN dbo.bg_expense a1 ON LEFT(a2.c_code,2) = LEFT(a1.c_code,2) AND a1.i_enable = 1 AND a1.i_delete = 2 AND a1.i_level = 1
				WHERE aa.i_enable = 1 AND aa.i_status_last = 11 AND bb.i_success = 1
					AND dd.i_status = 0
					AND dd.i_cheque IN ({$_REQUEST["i_cheque"]})
					{$con1}
				UNION ALL
				/* เช็คที่จ่ายแล้ว */
				SELECT
					CASE WHEN DATEDIFF(DAY, cc.d_doc_date, GETDATE()) <= 60 THEN 1 ELSE 2 END AS i_expire
					,dd.po_working_cheque_id
					,cc.d_doc_date
					,bb.c_approve
					,ee.c_name AS budget_name
					,a1.c_name AS c_expense_group
					,a2.c_name AS c_expense
					,dd.c_creditor
					,dd.c_cheque
					,dd.f_total
					,dd.d_pay_date
					,dd.i_status
					,dd.c_comment
				FROM dbo.po_working_hdr aa
					INNER JOIN dbo.po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
					INNER JOIN dbo.po_working_item cc ON aa.po_working_hdr_id = cc.po_working_hdr_id AND cc.i_status = 11
					INNER JOIN dbo.po_working_cheque dd ON aa.po_working_hdr_id = dd.po_working_hdr_id

					LEFT JOIN dbo.dc_expense_budget_type ee ON bb.dc_expense_budget_type_id = ee.dc_expense_budget_type_id
					LEFT JOIN dbo.bg_expense a2 ON bb.bg_expense_id = a2.bg_expense_id AND a2.i_enable = 1 AND a2.i_delete = 2
					LEFT JOIN dbo.bg_expense a1 ON LEFT(a2.c_code,2) = LEFT(a1.c_code,2) AND a1.i_enable = 1 AND a1.i_delete = 2 AND a1.i_level = 1
				WHERE aa.i_enable = 1 AND aa.i_status_last = 11 AND bb.i_success = 1
					AND dd.i_status = 1
					AND dd.i_cheque IN ({$_REQUEST["i_cheque"]})
					{$con1}
			) a
			WHERE 1 = 1
				{$con2};
			
			SELECT
				i_expire
				,po_working_cheque_id
				,i_type
				,CONVERT(VARCHAR, d_doc_date, 120) AS d_doc_date
				,c_approve AS c_approve
				,budget_name AS budget_name
				,c_expense_group AS c_expense_group
				,c_expense AS c_expense
				,c_creditor
				,c_cheque
				,f_total
				,CONVERT(VARCHAR, d_pay_date, 120) AS d_pay_date
				,i_status
				,c_comment
			FROM #TemData
			ORDER BY [row];

	        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_expire"							=> $row["i_expire"],
				"id"								=> $row["po_working_cheque_id"],
				"i_type"							=> $row["i_type"],
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"c_approve"							=> $row["c_approve"],
				"budget_name"						=> $row["budget_name"],
				"c_expense_group"					=> $row["c_expense_group"],
				"c_expense"							=> $row["c_expense"],
				"c_creditor"						=> $row["c_creditor"],
				"c_cheque"							=> $row["c_cheque"],
				"f_total"							=> $row["f_total"],
				"f_total"							=> $row["f_total"],
				"d_pay_date"						=> ($row["d_pay_date"] != "") ? $date->extDateBuddha($row["d_pay_date"]) : "",
				"i_status"							=> $row["i_status"],
				"c_comment"							=> $row["c_comment"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
