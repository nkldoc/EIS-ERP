<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if ($_REQUEST["type"] == "gl_tran_hdr") {

	$i_read				= @$_REQUEST["i_read"];
	$i_is_close_year	= GL_CLOSE_YEAR_NONE; // ไม่เป็น รายการปิดบัญชีประจำปี

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
	// 		case 1:		$con = " AND a.dc_user_create_id= ".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	}

	if ($_REQUEST["I_PAGE"] == 1) { // สมุดรายวัน
	} else if ($_REQUEST["I_PAGE"] == 2) { // แก้ไขสมุดรายวัน
		$con .= " AND a.i_is_post in (" . BOOK_ACC_GX . "," . BOOK_ACC_GL . ")";
	} else if ($_REQUEST["I_PAGE"] == 3) { // รอลงบัญชี
		$con .= " AND a.i_is_post in (" . BOOK_ACC_NOT_POST . ")";
	}

	if (@$_REQUEST["mode"] == "SEARCH") {
		if ($_REQUEST["i_enable"] > 0) {
			$con .= " AND a.i_enable = " . $_REQUEST["i_enable"];
		}
		if ($_REQUEST["value"] != "") {
			$con .= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["d_save_date1"] != "" && $_REQUEST["d_save_date2"] != "") {
			$con	.= " AND a.d_save_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_save_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_save_date2"]}'+' 23:59:59',102)";
		}
		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		if ($_REQUEST["i_is_post"] > 0) {
			$con .= " AND a.i_is_post = " . $_REQUEST["i_is_post"];
		}
		if ($_REQUEST["dc_user_create_id"] > 0) {
			$con .= " AND a.dc_user_create_id = " . $_REQUEST["dc_user_create_id"];
		}
		if ($_REQUEST["dc_user_update_id"] > 0) {
			$con .= " AND a.dc_user_update_id = " . $_REQUEST["dc_user_update_id"];
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY ISNULL(a.i_is_post,1), a.c_code DESC) AS numrow
					,a.gl_tran_hdr_id
				INTO #TemData
				FROM dbo.gl_tran_hdr a
				WHERE a.i_is_close_year = {$i_is_close_year}
					{$con}
					
				SELECT
					b.numrow
					,a.gl_tran_hdr_id
					,a.i_is_post
					,(SELECT aa.i_status FROM dbo.gl_dc_period aa WHERE aa.i_system = 1 AND aa.i_last_period = 1 AND aa.c_mm = a.c_mm AND aa.c_yyyy = a.c_yyyy) AS i_status_period
					,a.c_code
					,a.c_code_post
					,a.c_ref_doc
					,a.gl_dc_book_type_id
					,CONVERT(VARCHAR, a.d_save_date, 120) AS d_save_date
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.f_total_amt
					,a.c_comment1
					,a.c_comment2
					,a.c_comment3
					,a.table_name
					,CASE
						WHEN
							a.table_name = 'imp_expense_hdr' OR
							a.table_name = 'imp_expense_vsn_hdr' OR
							a.table_name = 'gl_bank' OR
							a.table_name = 'ar_bill_hdr' OR
							a.table_name = 'ar_cut_hdr' OR
							a.table_name = 'ar_receipt_hdr'
						THEN 2
						ELSE 1
					END AS i_source
					,CASE
						WHEN a.table_name = 'imp_receive_hdr' THEN 1
						ELSE 2
					END AS i_receive
					,a.i_enable
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
				FROM dbo.gl_tran_hdr a
					INNER JOIN #TemData b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
				WHERE b.numrow > ? AND b.numrow <= ?
				ORDER BY b.numrow;
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"						=> $row["numrow"],
				"id"						=> $row["gl_tran_hdr_id"],
				"i_is_post"					=> $row["i_is_post"],
				"i_status_period"			=> $row["i_status_period"], // 1 = เปิดงวด
				"c_code"					=> ($row["c_code"] != "" && $row["c_code"] != "0") ? $row["c_code"] : "",
				"c_code_post"				=> ($row["c_code_post"] != "" && $row["c_code_post"] != "0") ? $row["c_code_post"] : "",
				"c_ref_doc"					=> $row["c_ref_doc"],
				"gl_dc_book_type_id"		=> $row["gl_dc_book_type_id"],
				"d_save_date"				=> $date->extDateBuddha($row["d_save_date"]),
				"d_doc_date"				=> $date->extDateBuddha($row["d_doc_date"]),
				"f_total_amt"				=> $row["f_total_amt"],
				"c_comment1"				=> $row["c_comment1"],
				"c_comment2"				=> $row["c_comment2"],
				"c_comment3"				=> $row["c_comment3"],
				"i_source"					=> $row["i_source"],
				"i_receive"					=> $row["i_receive"],
				"table_name"				=> $row["table_name"],
				"i_enable"					=> $row["i_enable"],
				"dc_user_create_id"			=> "{$row["dc_user_create"]}",
				"dc_user_update_id"			=> $row["dc_user_update"],
			);
			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "gl_tran_dtl") {

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

	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY a.i_rank) AS numrow
						,a.gl_tran_dtl_id
					INTO #TemData
					FROM dbo.gl_tran_dtl a
					WHERE a.gl_tran_hdr_id = {$_REQUEST["id"]};
						
					SELECT
						z.numrow
						,a.i_rank
						,a.gl_tran_hdr_id
						,(SELECT ISNULL(dc_acc_id,0) FROM dc_acc WHERE dc_acc_id=a.dc_acc_id AND i_delete=2 AND i_enable=1) AS dc_acc_id
						,(CASE WHEN b.i_delete=1 THEN '<span style=\"color:red;\">(ยกเลิก)</span> ' ELSE '' END)+''+b.c_code+' '+b.c_name AS dc_acc_name
						,(SELECT ISNULL(dc_cost_acc_id,0) FROM dc_cost WHERE dc_cost_id=a.dc_cost_acc_id AND i_delete=2 AND i_enable=1) AS dc_cost_acc_id
						,(CASE WHEN c.i_delete=1 THEN '<span style=\"color:red;\">(ยกเลิก)</span> ' ELSE '' END)+''+c.c_name AS dc_cost_acc_name
						,a.i_type_person
						,a.f_dr
						,a.f_cr
						,a.i_return
						,a.i_is_nontax_exp
						,a.dc_product_id
						,f.c_name AS dc_product_name
						,a.dc_debtor_id
						,g.c_name AS dc_debtor_name
						,a.dc_creditor_id
						,i.c_name AS dc_creditor_name
						,a.dc_emp_id
						,h.c_name AS dc_emp_name
						,a.c_other_name
						,ISNULL(a.i_type_year,9) AS i_type_year 
						,a.c_budget_year
						,(SELECT ISNULL(dc_expense_budget_type_id,0) FROM dc_expense_budget_type WHERE dc_expense_budget_type_id=a.dc_expense_budget_type_id AND i_delete=2 AND i_enable=1) AS dc_expense_budget_type_id
						,(CASE WHEN j.i_delete=1 THEN '<span style=\"color:red;\">(ยกเลิก)</span> ' ELSE '' END)+''+j.c_code+' '+j.c_name AS dc_expense_budget_type_name
					FROM dbo.gl_tran_dtl a
						INNER JOIN #TemData z ON a.gl_tran_dtl_id = z.gl_tran_dtl_id
						LEFT JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
						LEFT JOIN dc_cost c ON a.dc_cost_acc_id = c.dc_cost_id
						LEFT JOIN dc_product f ON a.dc_product_id = f.dc_product_id
						LEFT JOIN vw_dc_debtor g ON a.dc_debtor_id = g.dc_debtor_id
						LEFT JOIN vw_dc_creditor i ON a.dc_creditor_id = i.dc_creditor_id
						LEFT JOIN dc_emp h ON a.dc_emp_id = h.dc_emp_id
						LEFT JOIN dc_expense_budget_type j ON a.dc_expense_budget_type_id = j.dc_expense_budget_type_id
					WHERE z.numrow > ? AND z.numrow <= ?
					ORDER BY z.numrow;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		$totalCount	= 0;
		$total_dr	= 0;
		$total_cr	= 0;

		while ($row = $db->Fetch($stmt)) {

			if ($row["i_type_year"] == 1) {
				$c_year	= $row["c_budget_year"] + 543;
			} else if ($row["i_type_year"] == 2) {
				$c_year	= ($row["c_budget_year"] + 543) . " (เหลื่อมปี)";
			} else {
				$c_year	= "ไม่ระบุ";
			}

			$temp = array(
				"no"							=> $row["numrow"],
				"id"							=> $row["numrow"],
				"gl_tran_hdr_id"				=> $row["gl_tran_hdr_id"],
				"i_rank"						=> ($row["i_rank"] != "") ? $row["i_rank"] : "",
				"dc_acc_id"						=> ($row["dc_acc_id"] != "") ? $row["dc_acc_id"] : "",
				"dc_acc_name"					=> ($row["dc_acc_name"] != "") ? $row["dc_acc_name"] : "",
				"dc_cost_acc_id"				=> ($row["dc_cost_acc_id"] != "") ? $row["dc_cost_acc_id"] : "",
				"dc_cost_acc_name"				=> ($row["dc_cost_acc_name"] != "") ? $row["dc_cost_acc_name"] : "",
				"i_type_person"					=> ($row["i_type_person"] != "") ? $row["i_type_person"] : "",
				"i_type_person_name"			=> ($row["i_type_person"] != "") ? $arr_person_type_all[$row["i_type_person"]] : "",
				"f_dr"							=> ($row["f_dr"] > 0) ? $row["f_dr"] : "",
				"f_cr"							=> ($row["f_cr"] > 0) ? $row["f_cr"] : "",
				"i_return"						=> ($row["i_return"] != "") ? $row["i_return"] : "",
				"i_is_nontax_exp"				=> ($row["i_is_nontax_exp"] != "") ? $row["i_is_nontax_exp"] : "",
				"dc_product_id"					=> ($row["dc_product_id"] != "") ? $row["dc_product_id"] : "",
				"dc_product_name"				=> ($row["dc_product_name"] != "") ? $row["dc_product_name"] : "",
				"dc_debtor_id"					=> ($row["dc_debtor_id"] != "") ? $row["dc_debtor_id"] : "",
				"dc_debtor_name"				=> ($row["dc_debtor_name"] != "") ? $row["dc_debtor_name"] : "",
				"dc_creditor_id"				=> ($row["dc_creditor_id"] != "") ? $row["dc_creditor_id"] : "",
				"dc_creditor_name"				=> ($row["dc_creditor_name"] != "") ? $row["dc_creditor_name"] : "",
				"dc_emp_id"						=> ($row["dc_emp_id"] != "") ? $row["dc_emp_id"] : "",
				"dc_emp_name"					=> ($row["dc_emp_name"] != "") ? $row["dc_emp_name"] : "",
				"c_other_name"					=> ($row["c_other_name"] != "") ? $row["c_other_name"] : "",
				"i_type_year"					=> ($row["i_type_year"] != "") ? $row["i_type_year"] : 1,
				"c_budget_year"					=> ($row["c_budget_year"] != "") ? $row["c_budget_year"] : "",
				"c_year"						=> $c_year,
				"dc_expense_budget_type_id"		=> ($row["dc_expense_budget_type_id"] != "") ? $row["dc_expense_budget_type_id"] : "",
				"dc_expense_budget_type_name"	=> ($row["dc_expense_budget_type_name"] != "") ? $row["dc_expense_budget_type_name"] : "",
			);

			$totalCount++;
			$total_dr	+= ($row["f_dr"] > 0) ? $row["f_dr"] : 0;
			$total_cr	+= ($row["f_cr"] > 0) ? $row["f_cr"] : 0;

			${$root}[] = $temp;
		}

		if ($totalCount > 0 && @$_REQUEST["total_show"]) {
			$temp = array(
				"total_type"		=> true,
				"f_dr"				=> number_format($total_dr, 2),
				"f_cr"				=> number_format($total_cr, 2)
			);

			${$root}[] = $temp;

			$totalCount++;
		}
	}

	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "gl_tran_purchase_tax") {

	$totalCount	= 0;

	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY a.dc_cost_acc_id) AS numrow
						,a.gl_tran_hdr_id
						,a.dc_cost_acc_id
						,c.c_name AS dc_cost_acc_name
						,CONVERT(VARCHAR, a.d_vat, 120) AS d_vat
						,CONVERT(VARCHAR(10), DATEADD(YYYY,543,a.d_vat), 120) AS DATEADD_VAT
						,a.c_doc
						,a.c_mm
						,a.c_yyyy
						,a.c_vendor
						,a.c_tax
						,a.i_branch
						,a.c_branch
						,a.f_price
						,a.f_vat
						,a.i_more
						,a.c_mm_more
						,a.c_yyyy_more
					FROM dbo.gl_tran_purchase_tax a
						LEFT JOIN dc_cost c ON a.dc_cost_acc_id = c.dc_cost_id
					WHERE a.gl_tran_hdr_id = ?
					ORDER BY a.dc_cost_acc_id;";

	$arrParam[]	= $_REQUEST["id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	while ($row = $db->Fetch($stmt)) {
		$temp = array(
			"no"						=> $row["numrow"],
			"id"						=> $row["numrow"],
			"gl_tran_hdr_id"			=> $row["gl_tran_hdr_id"],
			"dc_cost_acc_id"			=> ($row["dc_cost_acc_id"] != "") ? $row["dc_cost_acc_id"] : "",
			"dc_cost_acc_name"			=> ($row["dc_cost_acc_name"] != "") ? $row["dc_cost_acc_name"] : "",
			"d_vat"						=> ($row["d_vat"] != "") ? $date->extDateBuddha($row["d_vat"]) : "",
			"DATEADD_VAT"				=> ($row["DATEADD_VAT"] != "") ? $row["DATEADD_VAT"] : "",
			"c_doc"						=> ($row["c_doc"] != "") ? $row["c_doc"] : "",
			"c_mm"						=> ($row["c_mm"] != "") ? $row["c_mm"] : "",
			"c_yyyy"					=> ($row["c_yyyy"] != "") ? $row["c_yyyy"] : "",
			"c_vendor"					=> ($row["c_vendor"] != "") ? $row["c_vendor"] : "",
			"c_tax"						=> ($row["c_tax"] != "") ? $row["c_tax"] : "",
			"i_branch"					=> ($row["i_branch"] != "") ? $row["i_branch"] : "",
			"c_branch"					=> ($row["c_branch"] != "") ? $row["c_branch"] : "",
			"f_price"					=> ($row["f_price"] > 0) ? $row["f_price"] : "",
			"f_vat"						=> ($row["f_vat"] > 0) ? $row["f_vat"] : "",
			"i_more"					=> ($row["i_more"] != "") ? $row["i_more"] : "",
			"c_mm_more"					=> ($row["c_mm_more"] != "") ? $row["c_mm_more"] : "",
			"c_yyyy_more"				=> ($row["c_yyyy_more"] != "") ? $row["c_yyyy_more"] : ""
		);

		${$root}[] = $temp;
		$totalCount++;
	}

	$total_dtl	= $db->GetDataBySQL("	SELECT ISNULL(SUM(f_dr - f_cr),0) AS total_dtl
										FROM gl_tran_dtl
										WHERE dc_acc_id = (SELECT dc_acc_id FROM gl_dc_config WHERE i_config = 8 AND i_enable = " . STATUS_ENABLE . ")
										AND gl_tran_hdr_id = ?", array($_REQUEST["id"]));

	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}, "total_dtl" => $total_dtl));
	exit;
} else if ($_REQUEST["type"] == "print_hdr") {
	$hdr	= $db->GetDataBySQL("SELECT gl_tran_hdr_id, i_preview FROM gl_tran_hdr WHERE gl_tran_hdr_id = ?", array($_REQUEST["id"]));
	echo json_encode(array("debug" => true, "id" => $hdr["gl_tran_hdr_id"], "i_preview" => $hdr["i_preview"]));
	exit;
}
// else if($_REQUEST["type"] == "gx_reverse") {
	
// 	$limit 	= @$_REQUEST["limit"];
// 	$start 	= @$_REQUEST["start"];
// 	$mode	= @$_REQUEST["mode"];
// 	$value	= @$_REQUEST["value"];
// 	$filter	= @$_REQUEST["filter"];
	
// 	if (!$util->get($start)) { 	$start 	= 0; }
// 	if (!$util->get($limit)) { 	$limit 	= 15; } else { $limit=($limit+$start); }
	
// 	if($mode == "SEARCH") {
// 		if($value != "") {
// 			if($filter == "c_comment") {
// 				$con	.= " AND (c_comment1 LIKE '%{$value}%' OR c_comment2 LIKE '%{$value}%' OR c_comment3 LIKE '%{$value}%')";
// 			} else {
// 				$con	.= " AND {$filter} LIKE '%{$value}%' ";
// 			}
// 		}
// 	}
 
// 	$sqlTempTable	= "	SELECT
// 							ROW_NUMBER() OVER (ORDER BY c_code) AS numrow,
// 							gl_tran_hdr_id,
// 							c_code,
// 							c_ref_doc,
// 							CONVERT(VARCHAR, d_save_date, 120) AS d_save_date,
// 							f_total_amt,
// 							c_comment1,
// 							c_comment2,
// 							c_comment3
// 						FROM gl_tran_hdr
// 						WHERE i_is_reversing = ".GL_REVERSE_FALSE."
// 								AND i_is_post = ".BOOK_ACC_GX."
// 								AND i_is_close_year = 2
// 								AND i_enable = ".STATUS_ENABLE."
// 								AND d_doc_date IS NOT NULL
// 								AND d_save_date IS NOT NULL
// 						{$con}";
 
// 	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.c_code";
	
// 	$arrParam[]	= $start;
// 	$arrParam[]	= $limit;
	
// 	$stmt = $db->QueryParam($sqlMain, $arrParam);
// 	if($stmt) {
// 		while($row =$db->Fetch($stmt))
// 		{
// 			$temp = array(	"no"			=> $row["numrow"],
// 							"id"			=> "{$row["gl_tran_hdr_id"]}",
// 							"c_code"		=> "{$row["c_code"]}",
// 							"c_ref_doc"		=> "{$row["c_ref_doc"]}",
// 							"d_save_date"	=> $date->extDateBuddha($row["d_save_date"]),
// 							"f_total_amt"	=> "{$row["f_total_amt"]}",
// 							"c_comment1"	=> "{$row["c_comment1"]}",
// 							"c_comment2"	=> "{$row["c_comment2"]}",
// 							"c_comment3"	=> "{$row["c_comment3"]}"
// 			);
// 			${$root}[] = $temp;
// 		}
// 	}
	
// 	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
// 	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	
// 	echo json_encode(array("debug"=>true, $root=>${$root}, "totalCount"=>$totalCount));
// 	exit;
// }
