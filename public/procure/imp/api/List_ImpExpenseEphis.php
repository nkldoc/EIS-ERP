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

if ($_REQUEST["type"] == "imp_expense_ephis_hdr") {

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

		if (@$_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if (@$_REQUEST["d_doc_date1"] != "" && @$_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		if (@$_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
		// if ($_REQUEST["i_post"] > 0) {
		// 	$con .= " AND a.i_post=" . $_REQUEST["i_post"];
		// }
		// if ($_REQUEST["i_enable"] > 0) {
		// 	$con .= " AND a.i_enable=" . $_REQUEST["i_enable"];
		// }


		if ($_REQUEST["i_success"] == 0) {
			$con .= " AND NOT EXISTS (SELECT aa.imp_expense_vsn_hdr_id FROM dbo.imp_expense_vsn_hdr aa WHERE aa.i_system = 1 AND aa.i_enable = 1 AND a.imp_expense_vsn_hdr_id = aa.imp_expense_vsn_hdr_id)";
		}
	}

	if ($_SESSION["i_type_user"] == 1) {
		$con .= " AND a.dc_user_create_id = " . $_SESSION["user_id"];
	}

	$sqlMain = "
		SET NOCOUNT ON
	    SELECT
			ROW_NUMBER() OVER (ORDER BY a.imp_expense_ephis_hdr_id DESC) AS numrow
			,a.imp_expense_ephis_hdr_id
		INTO #TemData
        FROM dbo.imp_expense_ephis_hdr a
	    WHERE 1 = 1
		   {$con};

        SELECT
            a.numrow
			,b.imp_expense_ephis_hdr_id
			,CASE
				WHEN d.imp_expense_vsn_hdr_id IS NOT NULL THEN d.c_code
				ELSE ''
			END AS c_code
			,b.c_expense_period_no
			,b.c_doc
			,b.dc_expense_budget_type_id
			,c.c_name AS dc_expense_budget_type_name
			,b.dc_bank_acc_company_id_source
			,b.dc_bank_acc_company_id_target
			,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
            ,ISNULL(b.c_comment,'') AS c_comment
			,b.i_enable
			,CASE
				WHEN e.gl_tran_hdr_id IS NOT NULL THEN 2
				WHEN d.imp_expense_vsn_hdr_id IS NOT NULL THEN 1
				ELSE 0
			END AS i_success
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
			INNER JOIN dbo.imp_expense_ephis_hdr b ON a.imp_expense_ephis_hdr_id = b.imp_expense_ephis_hdr_id
			LEFT JOIN dbo.dc_expense_budget_type c ON b.dc_expense_budget_type_id = c.dc_expense_budget_type_id
			LEFT JOIN dbo.imp_expense_vsn_hdr d ON b.imp_expense_vsn_hdr_id = d.imp_expense_vsn_hdr_id AND d.i_enable = 1
			LEFT JOIN dbo.gl_tran_hdr e ON d.gl_tran_hdr_id = e.gl_tran_hdr_id AND e.i_enable = 1
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"									=> $row["numrow"],
				"id"									=> $row["imp_expense_ephis_hdr_id"],
				"c_code"								=> $row["c_code"],
				"c_expense_period_no"					=> ($row["c_expense_period_no"] != "") ? $row["c_expense_period_no"] : "",
				"c_doc"									=> ($row["c_doc"] != "") ? $row["c_doc"] : "",
				"dc_expense_budget_type_id"				=> $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type_name"			=> $row["dc_expense_budget_type_name"],
				"dc_bank_acc_company_id_source"			=> $row["dc_bank_acc_company_id_source"],
				"dc_bank_acc_company_id_target"			=> $row["dc_bank_acc_company_id_target"],
				"d_doc_date"							=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"i_enable"								=> $row["i_enable"],
				"i_success"								=> $row["i_success"],
				"c_comment"								=> $row["c_comment"],
				"show_enable"							=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"dc_user_update_id"						=> $row["dc_user_update"],
				"dc_user_update_cost_id"				=> $row["dc_user_update_cost"],
				"d_update"								=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "imp_expense_ephis_dtl") {

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.imp_expense_ephis_dtl_id) AS numrow
			,a.imp_expense_ephis_dtl_id
			,a.dc_expense_group_vsn_id
			,a.dc_expense_acc_vsn_id
			,a.c_booking
			,a.c_budget_year
			,a.i_type_year
			,CONVERT(VARCHAR, a.d_doc, 120) AS d_doc
			,a.c_approve
			,a.c_cheque_numbers
			,a.f_inv
      		,a.f_vat
      		,a.f_tax_personal
      		,a.f_tax_corporate
      		,a.f_social_security
      		,a.f_money1
      		,a.f_fine
      		,a.f_total
			,a.f_check_total
			,a.c_request
          	,a.c_creditor
          	,a.c_expense_group_main
          	,a.c_acc_item
			,a.i_cal_gl
			,a.imp_request_ephis_dtl_id
		INTO #TemData
		FROM dbo.imp_expense_ephis_dtl a
		WHERE a.imp_expense_ephis_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"										=> $row["numrow"],
				"id"										=> $row["imp_expense_ephis_dtl_id"],
				"dc_expense_group_vsn_id"					=> $row["dc_expense_group_vsn_id"],
				"dc_expense_acc_vsn_id"						=> $row["dc_expense_acc_vsn_id"],
				"c_booking"									=> $row["c_booking"],
				"d_doc"										=> ($row["d_doc"] != "") ? $date->extDateBuddha($row["d_doc"]) : "",
				"c_approve"									=> $row["c_approve"],
				"c_cheque_numbers"							=> $row["c_cheque_numbers"],
				"c_budget_year"								=> $row["c_budget_year"],
				"i_type_year"								=> $row["i_type_year"],
				"f_inv"										=> $row["f_inv"],
				"f_vat"										=> $row["f_vat"],
				"f_tax_personal"							=> $row["f_tax_personal"],
				"f_tax_corporate"							=> $row["f_tax_corporate"],
				"f_social_security"							=> $row["f_social_security"],
				"f_money1"									=> $row["f_money1"],
				"f_fine"									=> $row["f_fine"],
				"f_total"									=> $row["f_total"],
				"f_check_total"								=> $row["f_check_total"],
				"c_request"									=> $row["c_request"],
				"c_creditor"								=> $row["c_creditor"],
				"c_expense_group_main"						=> $row["c_expense_group_main"],
				"c_acc_item"								=> $row["c_acc_item"],
				"i_cal_gl"									=> $row["i_cal_gl"],
				"imp_request_ephis_dtl_id"					=> $row["imp_request_ephis_dtl_id"]				
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
