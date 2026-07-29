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

if ($_REQUEST["type"] == "po_working_hdr") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	// $limit 	= @$_REQUEST["limit"];
	// $start 	= @$_REQUEST["start"];

	// if (!$util->get($start)) {
	// 	$start 	= 0;
	// }
	// if (!$util->get($limit)) {
	// 	$limit 	= 20;
	// } else {
	// 	$limit = ($limit + $start);
	// }

	// // 	switch($i_read) {
	// // 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// // 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// // 		default:	$con = "";
	// // 	} 

	if ($mode == "SEARCH") {

		if ($_REQUEST["filter"] == "c_code_ref") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		} else if ($_REQUEST["filter"] == "c_approve") {
			$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND b.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
		}
		if ($_REQUEST["po_creditor_id"] > 0) {
			$con .= " AND b.po_creditor_id = " . $_REQUEST["po_creditor_id"];
		}
		if ($_REQUEST["i_booking"] > 0) {
			$con .= " AND b.c_booking IS NOT NULL";
		}
		if ($_REQUEST["i_budget_year"] > 0) {
			$con .= " AND b.i_budget_year = " . $_REQUEST["i_budget_year"];
		}
		if ($_REQUEST["i_budget_year_overlap"] > 0) {
			$con .= " AND b.i_budget_year_overlap = " . $_REQUEST["i_budget_year_overlap"];
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			TOP 100
			ROW_NUMBER() OVER (ORDER BY b.i_success, a.i_enable, a.c_code_ref) AS numrow
			,a.po_working_hdr_id
			,a.c_code_ref
			,b.c_approve
			,b.c_booking
			,b.i_budget_year
			,b.i_budget_year_overlap
			,c.c_name AS creditor_name
			,b.f_total
			,b1.c_full_name AS c_user_name1
			,CONVERT(VARCHAR, b.d_inv_date, 120) AS d_date1
			,b3.c_full_name AS c_user_name3
			,CONVERT(VARCHAR, a3.d_doc_date, 120) AS d_date3
			,b4.c_full_name AS c_user_name4
			,CONVERT(VARCHAR, a4.d_doc_date, 120) AS d_date4
			,b5.c_full_name AS c_user_name5
			,CONVERT(VARCHAR, a5.d_doc_date, 120) AS d_date5
			,b6.c_full_name AS c_user_name6
			,CONVERT(VARCHAR, a6.d_doc_date, 120) AS d_date6
			,b7.c_full_name AS c_user_name7
			,CONVERT(VARCHAR, a7.d_doc_date, 120) AS d_date7
			,b8.c_full_name AS c_user_name8
			,CONVERT(VARCHAR, a8.d_doc_date, 120) AS d_date8
			,b9.c_full_name AS c_user_name9
			,CONVERT(VARCHAR, a9.d_doc_date, 120) AS d_date9
			,b10.c_full_name AS c_user_name10
			,CONVERT(VARCHAR, a10.d_doc_date, 120) AS d_date10
			,b11.c_full_name AS c_user_name11
			,CONVERT(VARCHAR, a11.d_doc_date, 120) AS d_date11
			,a.i_enable
			,b.i_success
			,s2.i_is_url_pdf_hdr 
			,s2.i_is_url_pdf_dtl
			,CASE 
				WHEN s2.i_is_url_pdf_hdr = 0 THEN s2.c_file_pdf_hdr
				WHEN s2.i_is_url_pdf_hdr = 1 THEN s2.c_url_pdf_hdr
			END AS pdf_hdr
			,CASE 
				WHEN s2.i_is_url_pdf_dtl = 0 THEN s2.c_file_pdf_dtl
				WHEN s2.i_is_url_pdf_dtl = 1 THEN s2.c_url_pdf_dtl
			END AS pdf_dtl
		INTO #TemData
		FROM dbo.po_working_hdr a
			INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_item s2 ON s2.po_working_hdr_id = a.po_working_hdr_id AND s2.i_status = (select MAX(i_status) from po_working_item aa where aa.po_working_hdr_id = a.po_working_hdr_id and aa.i_enable = 1) AND s2.i_enable = 1
			LEFT JOIN dbo.po_creditor c ON b.po_creditor_id = c.po_creditor_id

			LEFT JOIN dbo.dc_user b1 ON b.dc_user_create_id = b1.dc_user_id
			LEFT JOIN dbo.po_working_item a3 ON a.po_working_hdr_id = a3.po_working_hdr_id AND a3.i_status = 3
			LEFT JOIN dbo.dc_user b3 ON a3.dc_user_create_id = b3.dc_user_id
			LEFT JOIN dbo.po_working_item a4 ON a.po_working_hdr_id = a4.po_working_hdr_id AND a4.i_status = 4
			LEFT JOIN dbo.dc_user b4 ON a4.dc_user_create_id = b4.dc_user_id
			LEFT JOIN dbo.po_working_item a5 ON a.po_working_hdr_id = a5.po_working_hdr_id AND a5.i_status = 5
			LEFT JOIN dbo.dc_user b5 ON a5.dc_user_create_id = b5.dc_user_id
			LEFT JOIN dbo.po_working_item a6 ON a.po_working_hdr_id = a6.po_working_hdr_id AND a6.i_status = 6
			LEFT JOIN dbo.dc_user b6 ON a6.dc_user_create_id = b6.dc_user_id
			LEFT JOIN dbo.po_working_item a7 ON a.po_working_hdr_id = a7.po_working_hdr_id AND a7.i_status = 7
			LEFT JOIN dbo.dc_user b7 ON a7.dc_user_create_id = b7.dc_user_id
			LEFT JOIN dbo.po_working_item a8 ON a.po_working_hdr_id = a8.po_working_hdr_id AND a8.i_status = 8
			LEFT JOIN dbo.dc_user b8 ON a8.dc_user_create_id = b8.dc_user_id
			LEFT JOIN dbo.po_working_item a9 ON a.po_working_hdr_id = a9.po_working_hdr_id AND a9.i_status = 9
			LEFT JOIN dbo.dc_user b9 ON a9.dc_user_create_id = b9.dc_user_id
			LEFT JOIN dbo.po_working_item a10 ON a.po_working_hdr_id = a10.po_working_hdr_id AND a10.i_status = 10
			LEFT JOIN dbo.dc_user b10 ON a10.dc_user_create_id = b10.dc_user_id
			LEFT JOIN dbo.po_working_item a11 ON a.po_working_hdr_id = a11.po_working_hdr_id AND a11.i_status = 11
			LEFT JOIN dbo.dc_user b11 ON a11.dc_user_create_id = b11.dc_user_id
		WHERE 1 = 1
			{$con};
		
		SELECT * FROM #TemData ORDER BY numrow;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["po_working_hdr_id"],
				"c_code_ref"						=> $row["c_code_ref"],
				"c_approve"							=> $row["c_approve"],
				"c_booking"							=> $row["c_booking"],
				"i_budget_year"						=> $row["i_budget_year"],
				"i_budget_year_overlap"				=> $row["i_budget_year_overlap"],
				"creditor_name"						=> $row["creditor_name"],
				"f_total"							=> $row["f_total"],

				"c_user_name1"						=> $row["c_user_name1"],
				"c_user_name3"						=> $row["c_user_name3"],
				"c_user_name4"						=> $row["c_user_name4"],
				"c_user_name5"						=> $row["c_user_name5"],
				"c_user_name6"						=> $row["c_user_name6"],
				"c_user_name7"						=> $row["c_user_name7"],
				"c_user_name8"						=> $row["c_user_name8"],
				"c_user_name9"						=> $row["c_user_name9"],
				"c_user_name10"						=> $row["c_user_name10"],
				"c_user_name11"						=> $row["c_user_name11"],

				"d_date1"							=> ($row["d_date1"] != "") ? $date->extDateBuddha($row["d_date1"]) : "",
				"d_date3"							=> ($row["d_date3"] != "") ? $date->extDateBuddha($row["d_date3"]) : "",
				"d_date4"							=> ($row["d_date4"] != "") ? $date->extDateBuddha($row["d_date4"]) : "",
				"d_date5"							=> ($row["d_date5"] != "") ? $date->extDateBuddha($row["d_date5"]) : "",
				"d_date6"							=> ($row["d_date6"] != "") ? $date->extDateBuddha($row["d_date6"]) : "",
				"d_date7"							=> ($row["d_date7"] != "") ? $date->extDateBuddha($row["d_date7"]) : "",
				"d_date8"							=> ($row["d_date8"] != "") ? $date->extDateBuddha($row["d_date8"]) : "",
				"d_date9"							=> ($row["d_date9"] != "") ? $date->extDateBuddha($row["d_date9"]) : "",
				"d_date10"							=> ($row["d_date10"] != "") ? $date->extDateBuddha($row["d_date10"]) : "",
				"d_date11"							=> ($row["d_date11"] != "") ? $date->extDateBuddha($row["d_date11"]) : "",

				"i_enable"							=> $row["i_enable"],
				"i_success"							=> $row["i_success"],

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
}
