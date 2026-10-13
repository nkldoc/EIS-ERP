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

//echo date("Y"); exit;

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

	$con_page = (!@$_REQUEST["PAGE"] == "poPay") ? " AND a.numrow > ? AND a.numrow <= ?" : "";

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 
	if(@$_REQUEST["PAGE"] == "poPay"){
		$con	.= " AND c.i_is_url_pdf_hdr is null";
	}

	if ($mode == "SEARCH") {

		if ($_REQUEST["filter"] == "c_code_ref") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_approve") {
			$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
		if ($_REQUEST["i_status"] == 5) {
			if ($_REQUEST["i_status_last"] > 0) {
				$con .= " AND a.i_status_last=" . $_REQUEST["i_status_last"];
			}
			if ($_REQUEST["i_budget_year"] > 0) {
				$con .= " AND b.i_budget_year=" . $_REQUEST["i_budget_year"];
			}
			if ($_REQUEST["i_budget_year_overlap"] > 0) {
				$con .= " AND b.i_budget_year_overlap=" . $_REQUEST["i_budget_year_overlap"];
			}
			if ($_REQUEST["checkbox_overlab_no_booking"] == 1) {
				$con .= "AND b.i_budget_year != b.i_budget_year_overlap AND isnull(b.bg_budget_dtl_overlap_id,0) = 0 ";
			}
		}

	} else {
		if ($_REQUEST["i_status"] == 5) {
			// $con .= " AND b.i_budget_year=" .  date("Y");
		}
	}

	if ($_REQUEST["i_status"] == 3) { // ทักท้วง
		$order = "";
		$con .= "AND a.i_status_last = 3";
	} else if ($_REQUEST["i_status_before"] == 2) { // ส่งใบเบิกตรวจกรองผู้อนุมัติ
		if ($_SESSION["i_type_user"] == 1) {
			$con .= " AND b.dc_approve_id = " . $_SESSION["user_id"];
		}
		$order = "CASE WHEN a.i_status_last = {$_REQUEST["i_status_before"]} THEN 0 ELSE 1 END,";
		$con .= "
			AND {$_REQUEST["i_status_before"]} <= c.i_status
			AND c.i_status != 1
			AND b.i_success != 1";
	} else if ($_REQUEST["i_status"] == 5) { //หักงบประมาณ
		// if ($_REQUEST["i_budget_year"] > 0) {
		// 	$con .= " AND b.i_budget_year=" . date("Y");
		// }
		$order = "CASE WHEN a.i_status_last = {$_REQUEST["i_status_before"]} THEN 0 ELSE 1 END,";
		$con .= "
			AND {$_REQUEST["i_status_before"]} <= c.i_status
			AND c.i_status != 1";
	} else if ($_REQUEST["i_status"] == 11 && $mode == "SEARCH" && @$_REQUEST["checkbox_date"] == 1) { //หักงบประมาณ
		$order = "CASE WHEN a.i_status_last = {$_REQUEST["i_status_before"]} THEN 0 ELSE 1 END,";
		$con .= "
			--AND {$_REQUEST["i_status_before"]} <= c.i_status
			--AND c.i_status != 1
			AND b.i_success = 1
			AND d.d_doc_date BETWEEN '{$_REQUEST["date_start"]}' AND '{$_REQUEST["date_end"]}'";
	} else {
		$order = "CASE WHEN a.i_status_last = {$_REQUEST["i_status_before"]} THEN 0 ELSE 1 END,";
		$con .= "
			AND {$_REQUEST["i_status_before"]} <= c.i_status
			AND c.i_status != 1
			AND b.i_success != 1";
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY {$order} a.i_status_last, d.d_doc_date DESC, b.i_protest DESC, a.c_code_ref) AS numrow
			,a.po_working_hdr_id
			, a.i_status_last
		INTO #TemData
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			LEFT JOIN (SELECT aa.po_working_hdr_id, MAX(aa.i_status) AS i_status ,aa.i_is_url_pdf_hdr FROM dbo.po_working_item aa WHERE aa.i_enable = 1 GROUP BY aa.po_working_hdr_id ,aa.i_is_url_pdf_hdr) c ON a.po_working_hdr_id = c.po_working_hdr_id
			LEFT JOIN (SELECT aa.po_working_hdr_id, aa.d_doc_date, aa.i_status FROM dbo.po_working_item aa WHERE aa.i_enable = 1) d ON a.po_working_hdr_id = d.po_working_hdr_id AND a.i_status_last = d.i_status
		WHERE a.i_enable = 1
			{$con};

		SELECT
			a.numrow
			,b.po_working_hdr_id
			,c.c_code
			,b.i_status_last
			,b.c_status_last
			,CASE WHEN ISNULL(a1.i_status,0) > 0 THEN 1 ELSE 0 END AS i_status_edit
			,c.c_approve
			,CONVERT(VARCHAR, c.d_approve_date, 120) AS d_approve_date
			,c.bg_expense_id
			,c.bg_budget_dtl_overlap_id
			,c.c_booking
			,c.dc_cost_id
			,e.c_name AS cost_name
			,c.dc_expense_budget_type_id
			,f.c_name AS budget_name
			,g.c_code+' : '+g.c_name AS bg_expense_name
			,h.c_name AS creditor_name
			,c.i_budget_year
			,c.i_budget_year_overlap
			,c.f_total
			,ISNULL(b.c_comment,'') AS c_comment
			,b.i_enable
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
			,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
			,CONVERT(VARCHAR, b.d_update, 120) AS d_update
			,CONVERT(VARCHAR, a2.d_doc_date, 120) AS back_d_doc_date
			,a2.c_comment AS back_c_comment
			,CONVERT(VARCHAR, a2.d_receive_date, 120) AS d_receive_date
			,a2.c_comment AS c_receive_comment
			,c.i_close_receive
			,CONVERT(VARCHAR, a1.d_doc_date, 120) AS d_status_date
			,ISNULL(a1.c_comment,'') AS c_comment_status
			,CONVERT(VARCHAR, a3.d_doc_date, 120) AS d_status_date_last
			,c.i_protest
			,s2.i_is_url_pdf_hdr 
			,s2.i_is_url_pdf_dtl
            , case 
				when s2.i_is_url_pdf_hdr = 0 then s2.c_file_pdf_hdr
				when s2.i_is_url_pdf_hdr = 1 then s2.c_url_pdf_hdr
			end as pdf_hdr
			, case 
				when s2.i_is_url_pdf_dtl = 0 then s2.c_file_pdf_dtl
				when s2.i_is_url_pdf_dtl = 1 then s2.c_url_pdf_dtl
			end as pdf_dtl
		FROM #TemData a
			INNER JOIN dbo.po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_dtl c ON b.po_working_hdr_id = c.po_working_hdr_id
			LEFT JOIN dbo.dc_cost e ON c.dc_cost_id = e.dc_cost_id AND e.i_enable = 1 AND e.i_delete = 2
			LEFT JOIN dbo.dc_expense_budget_type f ON c.dc_expense_budget_type_id = f.dc_expense_budget_type_id AND f.i_enable = 1 AND f.i_delete = 2
			LEFT JOIN dbo.bg_expense g ON c.bg_expense_id = g.bg_expense_id AND g.i_enable = 1
			LEFT JOIN dbo.po_creditor h ON c.po_creditor_id = h.po_creditor_id AND h.i_enable = 1
			INNER JOIN dbo.po_working_item s2 ON s2.po_working_hdr_id = a.po_working_hdr_id AND s2.i_status = (select MAX(i_status) from po_working_item aa where aa.po_working_hdr_id = a.po_working_hdr_id and aa.i_enable = 1) AND s2.i_enable = 1
			LEFT JOIN (SELECT aa.* FROM dbo.po_working_item aa WHERE aa.i_enable = 1 AND aa.i_status = {$_REQUEST["i_status"]}) a1 ON b.po_working_hdr_id = a1.po_working_hdr_id
			LEFT JOIN (SELECT aa.* FROM dbo.po_working_item aa WHERE aa.i_enable = 1 AND aa.i_status = 3) a2 ON b.po_working_hdr_id = a2.po_working_hdr_id
			LEFT JOIN (SELECT aa.* FROM dbo.po_working_item aa WHERE aa.i_enable = 1) a3 ON b.po_working_hdr_id = a3.po_working_hdr_id AND b.i_status_last = a3.i_status
		WHERE 1=1 {$con_page} ORDER BY a.numrow;

		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	//echo $sqlMain ; exit;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			if ($row["i_status_last"] == 12) {
				$c_stats_last = "สมบูรณ์";
			} else if ($row["i_status_last"] == 11) {
				$c_stats_last = "ทำทะเบียนจ่ายเสร็จสิ้น";
			} else if ($row["i_status_last"] == 3) {
				$c_stats_last = "รอคืน" . $CONF_I_STATUS[3];
			} else if ($row["i_status_last"] != 2) {
				$c_stats_last = "รอ" . $CONF_I_STATUS[$row["i_status_last"] + 1];
			} else {
				$c_stats_last = "รอ" . $CONF_I_STATUS[4];
			}

			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_working_hdr_id"],
				"c_code"							=> $row["c_code"],
				"i_status_last"						=> $row["i_status_last"],
				"c_status_last"						=> $c_stats_last,
				"i_status_edit"						=> $row["i_status_edit"],
				"c_approve"							=> $row["c_approve"],
				"d_approve_date"					=> ($row["d_approve_date"] != "") ? $date->extDateBuddha($row["d_approve_date"]) : "",
				"bg_expense_id"						=> $row["bg_expense_id"],
				"bg_budget_dtl_overlap_id"			=> ($row["bg_budget_dtl_overlap_id"] > 0) ? $row["bg_budget_dtl_overlap_id"] : "",
				"c_booking"							=> $row["c_booking"],
				"dc_cost_id"						=> $row["dc_cost_id"],
				"cost_name"							=> ($row["cost_name"]) ? $row["cost_name"] : "-",
				"dc_expense_budget_type_id"			=> $row["dc_expense_budget_type_id"],
				"budget_name"						=> $row["budget_name"],
				"bg_expense_name"					=> $row["bg_expense_name"],
				"creditor_name"						=> $row["creditor_name"],
				"i_budget_year"						=> $row["i_budget_year"],
				"i_budget_year_overlap"				=> $row["i_budget_year_overlap"],
				"f_total"							=> $row["f_total"],
				"d_status_date"						=> ($row["d_status_date"] != "") ? $date->extDateBuddha($row["d_status_date"]) : "",
				"c_comment"							=> $row["c_comment"],
				"i_enable"							=> $row["i_enable"],
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"back_d_doc_date"					=> ($row["back_d_doc_date"] != "") ? $date->extDateBuddha($row["back_d_doc_date"]) : "",
				"back_c_comment"					=> $row["back_c_comment"],
				"d_receive_date"					=> ($row["d_receive_date"] != "") ? $date->extDateBuddha($row["d_receive_date"]) : "",
				"c_receive_comment"					=> $row["c_receive_comment"],
				"i_close_receive"					=> $row["i_close_receive"],
				"c_comment_status"					=> $row["c_comment_status"],
				"d_status_date_last"				=> ($row["d_status_date_last"] != "") ? $date->extDateBuddha($row["d_status_date_last"]) : "",
				"i_protest"							=> $row["i_protest"],
				"i_is_url_pdf_hdr"					=> $row["i_is_url_pdf_hdr"],
				"i_is_url_pdf_dtl"					=> $row["i_is_url_pdf_dtl"],
				"pdf_hdr"							=> $row["pdf_hdr"],
				"pdf_dtl"							=> $row["pdf_dtl"],
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
			ROW_NUMBER() OVER (ORDER BY a.i_status, CASE WHEN a.c_cheque IS NULL THEN 0 ELSE 1 END DESC,a.c_cheque) AS numrow
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
			,NULL AS c_comment
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
			,NULL AS c_comment
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
			,NULL AS i_chk
		FROM #TemData a
			INNER JOIN dbo.po_working_cheque b ON a.po_working_cheque_id = b.po_working_cheque_id
		UNION ALL
		SELECT
			a.*
			,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_cheque aa) = a.f_total THEN 1 ELSE 0 END AS i_chk
		FROM #TemData_working a
		UNION ALL
		SELECT
			a.*
			,CASE WHEN (SELECT SUM(aa.f_total) FROM #TemData_working aa) = a.f_total THEN 1 ELSE 0 END AS i_chk
		FROM #TemData_cheque a
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
				"i_chk"								=> $row["i_chk"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
