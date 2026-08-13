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

if ($_REQUEST["type"] == "gl_bank") {

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
			if ($_REQUEST["filter"] == "c_code_gl_bank") {
				$con	.= " AND g.c_code_post LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "c_code_gl") {
				$con	.= " AND f.c_code_post LIKE '%" . $_REQUEST["value"] . "%' ";
			} else {
				$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
			}
		}
		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con	.= " AND a.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]} ";
		}
		if ($_REQUEST["dc_user_id"] > 0) {
			$con	.= " AND a.dc_user_create_id = {$_REQUEST["dc_user_id"]} ";
		}
	}

	if ($_REQUEST["ITYPE_CHEQUE"] == "true") {
		$con	.= " AND a.gl_tran_hdr_id > 0";
		$con	.= " AND a.gl_tran_hdr_id_bank_id > 0";
		if ($_REQUEST["CANCEL_GL"] == "true") {
			$con	.= " AND g.i_is_post = 3";
			$con	.= " AND f.i_is_post = 3";
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.i_enable, a.gl_bank_id DESC) AS numrow
					,a.gl_bank_id
					,a.gl_tran_hdr_id
					,a.gl_tran_hdr_id_bank_id
					,a.c_code
					,f.c_code AS c_code_gx
					,g.c_code AS c_code_gx_bank
					,f.c_code_post AS c_code_gl
					,g.c_code_post AS c_code_gl_bank
					,f.i_is_post
					,g.i_is_post AS i_is_post_bank
					,f.i_enable AS i_enable_gx
					,g.i_enable AS i_enable_gx_bank
					,a.c_doc
					,a.c_doc_bank
					,a.gl_dc_book_type_id_bank_id
					,a.gl_dc_book_type_id
					,a.dc_bank_acc_company_id_target
					,b.c_code+' : '+b.c_name AS dc_bank_acc_company_id_target_name
					,a.dc_bank_acc_company_id_source
					,c.c_code+' : '+c.c_name AS dc_bank_acc_company_id_source_name
					,a.dc_bank_acc_company_id_source2
					,d.c_code+' : '+d.c_name AS dc_bank_acc_company_id_source2_name
					,a.dc_acc_id
					,e.c_code AS dc_acc_code
					,e.c_name AS dc_acc_name
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date
					,a.f_money
					,a.c_comment
					,a.i_enable
					,ISNULL (a.i_type_jv,2) AS i_type_jv
					,CASE
						WHEN (SELECT COUNT(aa.gl_bank_id) FROM gl_bank_cheque aa WHERE aa.gl_bank_id = a.gl_bank_id AND aa.i_status != 2) > 0 THEN 1
						WHEN (SELECT COUNT(aa.gl_bank_id) FROM gl_bank_cheque aa WHERE aa.gl_bank_id = a.gl_bank_id AND aa.i_status = 2) > 0 THEN 2
						ELSE 3
					END AS i_status
					,a.i_return
					,cc.gl_tran_hdr_id_cancel
					,cc.gl_tran_hdr_bank_id_cancel
					,cc.c_code_cancel
					,cc.c_code_bank_cancel
					,ISNULL(a.i_type_year,9) as i_type_year
					,a.c_budget_year
					,a.dc_expense_budget_type_id
					,h.c_name AS dc_expense_budget_type_name
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM gl_bank a
					LEFT JOIN gl_tran_hdr f ON a.gl_tran_hdr_id = f.gl_tran_hdr_id
					LEFT JOIN gl_tran_hdr g ON a.gl_tran_hdr_id_bank_id = g.gl_tran_hdr_id
					LEFT JOIN dc_bank_acc_company b ON a.dc_bank_acc_company_id_target = b.dc_bank_acc_company_id
					LEFT JOIN dc_bank_acc_company c ON a.dc_bank_acc_company_id_source = c.dc_bank_acc_company_id
					LEFT JOIN dc_bank_acc_company d ON a.dc_bank_acc_company_id_source2 = d.dc_bank_acc_company_id
					LEFT JOIN dc_acc e ON a.dc_acc_id = e.dc_acc_id
					LEFT JOIN (
						SELECT
							aa.imp_cancel_doc_expense_id
							,aa.gl_tran_hdr_id_cancel
							,aa.gl_tran_hdr_bank_id_cancel
							,CASE WHEN bb.i_is_post = 3 THEN bb.c_code_post ELSE bb.c_code END AS c_code_cancel
							,CASE WHEN cc.i_is_post = 3 THEN cc.c_code_post ELSE cc.c_code END AS c_code_bank_cancel
						FROM dbo.imp_cancel_doc_expense aa
							LEFT JOIN gl_tran_hdr bb ON aa.gl_tran_hdr_id_cancel = bb.gl_tran_hdr_id
							LEFT JOIN gl_tran_hdr cc ON aa.gl_tran_hdr_bank_id_cancel = cc.gl_tran_hdr_id
						WHERE bb.i_is_post > 1 AND cc.i_is_post > 1) cc ON a.imp_cancel_doc_expense_id = cc.imp_cancel_doc_expense_id
					LEFT JOIN dbo.dc_expense_budget_type h ON a.dc_expense_budget_type_id = h.dc_expense_budget_type_id
				WHERE 1=1
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"									=> $row["numrow"],
				"id"									=> $row["gl_bank_id"],
				"gl_tran_hdr_id"						=> $row["gl_tran_hdr_id"],
				"gl_tran_hdr_id_bank_id"				=> $row["gl_tran_hdr_id_bank_id"],
				"c_code"								=> ($row["c_code"] != "") ? $row["c_code"] : "",
				"c_code_gx"								=> ($row["c_code_gx"] != "") ? $row["c_code_gx"] : "",
				"c_code_gx_bank"						=> ($row["c_code_gx_bank"] != "") ? $row["c_code_gx_bank"] : "",
				"c_code_gl"								=> ($row["c_code_gl"] != "") ? $row["c_code_gl"] : "",
				"c_code_gl_bank"						=> ($row["c_code_gl_bank"] != "") ? $row["c_code_gl_bank"] : "",
				"i_is_post"								=> $row["i_is_post"],
				"i_is_post_bank"						=> $row["i_is_post_bank"],
				"i_enable_gx"							=> $row["i_enable_gx"],
				"i_enable_gx_bank"						=> $row["i_enable_gx_bank"],
				"c_doc"									=> $row["c_doc"],
				"c_doc_bank"							=> $row["c_doc_bank"],
				"gl_dc_book_type_id_bank_id"			=> $row["gl_dc_book_type_id_bank_id"],
				"gl_dc_book_type_id"					=> $row["gl_dc_book_type_id"],
				"dc_bank_acc_company_id_target"			=> $row["dc_bank_acc_company_id_target"],
				"dc_bank_acc_company_id_target_name"	=> $row["dc_bank_acc_company_id_target_name"],
				"dc_bank_acc_company_id_source"			=> $row["dc_bank_acc_company_id_source"],
				"dc_bank_acc_company_id_source_name"	=> $row["dc_bank_acc_company_id_source_name"],
				"dc_bank_acc_company_id_source2"		=> $row["dc_bank_acc_company_id_source2"],
				"dc_bank_acc_company_id_source2_name"	=> $row["dc_bank_acc_company_id_source2_name"],
				"dc_acc_id"								=> $row["dc_acc_id"],
				"dc_acc_code"							=> $row["dc_acc_code"],
				"dc_acc_name"							=> $row["dc_acc_name"],
				"d_doc_date"							=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"d_save_jv_date"						=> ($row["d_save_jv_date"] != "") ? $date->extDateBuddha($row["d_save_jv_date"]) : "",
				"f_money"								=> $row["f_money"],
				"i_enable"								=> $row["i_enable"],
				"c_comment"								=> $row["c_comment"],
				"show_enable"							=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"i_type_jv"								=> $row["i_type_jv"],
				"i_status"								=> $row["i_status"],
				"i_return"								=> $row["i_return"],
				"gl_tran_hdr_id_cancel"					=> $row["gl_tran_hdr_id_cancel"],
				"gl_tran_hdr_bank_id_cancel"			=> $row["gl_tran_hdr_bank_id_cancel"],
				"c_code_cancel"							=> $row["c_code_cancel"],
				"c_code_bank_cancel"					=> $row["c_code_bank_cancel"],
				"i_type_year"							=> $row["i_type_year"],
				"c_budget_year"							=> $row["c_budget_year"],
				"dc_expense_budget_type_id"				=> $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type_name"			=> $row["dc_expense_budget_type_name"],
				"dc_user_create"             			=> $row["dc_user_create"],
				"dc_user_create_cost"			        => $row["dc_user_create_cost"],
				"d_create"                  			=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"dc_user_update"             			=> $row["dc_user_update"],
				"dc_user_update_cost"			        => $row["dc_user_update_cost"],
				"d_update"                  			=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "dc_bank_acc_company") {

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
			$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
					,a.dc_bank_acc_company_id
					,b.c_bank_name
					,b.c_branch_name
					,b.c_code
					,b.c_name
					,b.c_type_name
					,c.c_code AS c_code_acc
					,c.c_name AS c_name_acc
				INTO #TemData
				FROM dc_bank_acc_company a
					INNER JOIN vw_dc_bank_acc_company_full b ON a.dc_bank_acc_company_id = b.dc_bank_acc_company_id
					LEFT JOIN vw_dc_acc c ON a.dc_acc_id = c.dc_acc_id
				WHERE a.i_delete=" . DELETE_FALSE . "
					{$con}
				
				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
					
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"						=> $row["numrow"],
				"id"						=> $row["dc_bank_acc_company_id"],
				"c_bank_name"				=> $row["c_bank_name"],
				"c_branch_name"				=> $row["c_branch_name"],
				"c_code"					=> $row["c_code"],
				"c_name"					=> $row["c_name"],
				"c_type_name"				=> $row["c_type_name"],
				"c_code_acc"				=> $row["c_code_acc"],
				"c_name_acc"				=> $row["c_name_acc"]
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "gl_bank_cheque") {

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 10000;
	} else {
		$limit = ($limit + $start);
	}

	$sqlTempTable	= "
		SELECT
			ROW_NUMBER() OVER (ORDER BY b.gl_bank_cheque_id) AS numrow
			,b.dc_cheque_id
			,e.c_show+' ('+d.c_name+')' AS c_cheque_name
			,b.c_creditor
			,b.c_comment
			,CONVERT(VARCHAR, b.d_cheque, 120) AS d_cheque
			,b.f_cheque
			,b.i_status
		FROM gl_bank a
			INNER JOIN gl_bank_cheque b ON a.gl_bank_id = b.gl_bank_id
			LEFT JOIN dc_bank_acc_company c ON a.dc_bank_acc_company_id_source = c.dc_bank_acc_company_id
			LEFT JOIN dc_bank_deposit_type d ON c.dc_bank_deposit_type_id = d.dc_bank_deposit_type_id
			LEFT JOIN dc_cheque e ON b.dc_cheque_id = e.dc_cheque_id
		WHERE a.gl_bank_id = " . $_REQUEST["hdr_id"];

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		$totalCount	= 0;

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"						=> $row["numrow"],
				"id"						=> $row["numrow"],
				"dc_cheque_id"				=> $row["dc_cheque_id"],
				"c_cheque_name"				=> $row["c_cheque_name"],
				"c_creditor"				=> ($row["c_creditor"] != "") ? $row["c_creditor"] : "",
				"c_comment"					=> ($row["c_comment"] != "") ? $row["c_comment"] : "",
				"d_cheque"					=> ($row["d_cheque"] != "") ? $date->extDateBuddha($row["d_cheque"]) : "",
				"f_cheque"					=> ($row["f_cheque"] != "") ? $row["f_cheque"] : "",
				"i_status"					=> $row["i_status"],

			);

			$totalCount++;

			${$root}[] = $temp;
		}
	}

	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "gl_bank_cheque_cancel") {

	$rowCounts			= 0;

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY d.c_cheque) AS numrow
					,c.gl_bank_cheque_id AS cheque_id
					,d.c_show AS c_name
					,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque
					,c.f_cheque
				FROM dbo.gl_bank a
					INNER JOIN dbo.gl_bank_cheque c ON a.gl_bank_id = c.gl_bank_id
					INNER JOIN dbo.dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
				WHERE c.gl_bank_id = {$_REQUEST["gl_bank_id"]}
					AND c.i_status = 1
				ORDER BY d.c_cheque;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["cheque_id"],
				"c_name"							=> $row["c_name"],
				"d_cheque"							=> ($row["d_cheque"] != "") ? $date->extDateBuddha($row["d_cheque"]) : "",
				"f_cheque"							=> $row["f_cheque"],
			);

			$rowCounts++;

			${$root}[] = $temp;
		}
	}

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts, $root => ${$root}));
	exit;
}
