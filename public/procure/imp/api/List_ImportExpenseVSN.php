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

if ($_REQUEST["type"] == "imp_expense_vsn_hdr") {

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

	if ($_SESSION["user_id"] != 1) {
		$con = " AND a.dc_user_create_id = " . $_SESSION["user_id"];
	}

	if ($_REQUEST["ITYPE_JV"] == "false") {
		$con	.= " AND a.c_code !='0'";
		$con	.= " AND ISNULL(a.i_enable,2) = 1";
	}

	if ($mode == "SEARCH") {

		if ($_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND a.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
		}
		if ($_REQUEST["i_post"] > 0) {
			$con .= " AND a.i_post = " . $_REQUEST["i_post"];
		}
		if ($_REQUEST["i_enable"] > 0) {
			$con .= " AND a.i_enable =" . $_REQUEST["i_enable"];
		}
	} else {
		$con .= " AND a.i_enable = 1";
	}

	if ($_SESSION["i_type_user"] == 1) {
		$con .= " AND a.dc_user_create_id = " . $_SESSION["user_id"];
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.d_doc_date DESC) AS numrow
			,a.imp_expense_vsn_hdr_id
			,a.c_code
			,c.c_code AS c_code_bank
			,a.i_post
			,a.c_expense_vsn_period_no
			,a.c_doc
			,a.dc_expense_budget_type_id
			,a.dc_bank_acc_company_id_source
			,a.dc_bank_acc_company_id_target
			,(SELECT aa.c_name FROM dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id=a.dc_expense_budget_type_id) AS dc_expense_budget_type
			,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
			,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date
			,a.dc_cost_acc_id
			,(SELECT aa.c_name FROM dc_cost aa WHERE aa.dc_cost_id=a.dc_cost_acc_id) AS dc_cost_acc
			,a.i_enable
			,a.c_comment
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
			,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
			,CONVERT(VARCHAR, a.d_create, 120) AS d_create
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
			,CONVERT(VARCHAR, a.d_update, 120) AS d_update
			,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
			,a.gl_tran_hdr_id
			,a.gl_tran_hdr_id_bank_id
			,b.c_code AS c_gx_code
			,b.i_is_post
			,b.i_enable AS i_enable_gx
			,a.i_system
		INTO #TemData
		FROM imp_expense_vsn_hdr a
			LEFT JOIN gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
			LEFT JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = c.gl_tran_hdr_id
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
				"no"								=> $row["numrow"],
				"id"								=> $row["imp_expense_vsn_hdr_id"],
				"c_code"							=> ($row["c_code"] != "") ? $row["c_code"] : "",
				"c_code_bank"						=> ($row["c_code_bank"] != "") ? $row["c_code_bank"] : "",
				"i_post"							=> $row["i_post"],
				"c_expense_vsn_period_no"			=> $row["c_expense_vsn_period_no"],
				"c_doc"								=> $row["c_doc"],
				"dc_expense_budget_type_id"			=> $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				"dc_bank_acc_company_id_source"		=> $row["dc_bank_acc_company_id_source"],
				"dc_bank_acc_company_id_target"		=> $row["dc_bank_acc_company_id_target"],
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"d_save_jv_date"					=> ($row["d_save_jv_date"] != "") ? $date->extDateBuddha($row["d_save_jv_date"]) : "",
				"dc_cost_acc_id"					=> $row["dc_cost_acc_id"],
				"dc_cost_acc"						=> $row["dc_cost_acc"],
				"i_enable"							=> $row["i_enable"],
				"c_comment"							=> $row["c_comment"],
				"show_enable"						=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"dc_user_create_id"					=> "{$row["dc_user_create"]}",
				"dc_user_create_cost_id"			=> "{$row["dc_user_create_cost"]}",
				"d_create"							=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"gl_tran_hdr_id"					=> $row["gl_tran_hdr_id"],
				"gl_tran_hdr_id_bank_id"			=> $row["gl_tran_hdr_id_bank_id"],
				"c_gx_code"							=> ($row["c_gx_code"] != "") ? $row["c_gx_code"] : "",
				"i_is_post"							=> $row["i_is_post"],
				"i_enable_gx"						=> $row["i_enable_gx"],
				"i_system"							=> $row["i_system"]
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "imp_expense_vsn_dtl") {

/*
			,(select top 1 vw.c_code from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2) as c_import_rq_code 
			,(select top 1 vw.c_jv_code from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2) as c_import_rq_jv_code
			,(select top 1 vw.f_inv from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2) as f_inv_import
			,(select top 1 vw.c_acc_dr from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2) as c_acc_dr_import
			,(select top 1 vw.c_acc_cr from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2) as c_acc_cr_import 
			,(select top 1 vw.c_acc_item from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2) as c_acc_item_import 
			,(select top 1 vw.gl_tran_hdr_rq_id from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2) as gl_tran_hdr_rq_id
			
*/

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.imp_expense_vsn_dtl_id) AS numrow
			,a.imp_expense_vsn_dtl_id
			,a.i_cal_gl
			,a.c_booking        
			,a.i_type_year
			,a.c_budget_year
			,a.dc_expense_group_vsn_id
			,a.dc_expense_acc_vsn_id
			,c.c_name AS dc_expense_group_vsn_name
			,b.c_name AS dc_expense_acc_vsn_name
			,ISNULL(CASE
				WHEN a.i_type_year = 1 THEN b.c_acc_name
				ELSE b.c_acc_name_overlap
			END,'') AS c_acc_name
			,a.c_approve
			,CONVERT(VARCHAR, a.d_doc, 120) AS d_doc
			,ISNULL(a.f_inv,0) AS f_inv
			,ISNULL(a.f_tax_personal,0) AS f_tax_personal
			,ISNULL(a.f_social_security,0) AS f_social_security
			,ISNULL(a.f_prov_fund,0) AS f_prov_fund
			,ISNULL(a.f_fine,0) AS f_fine
			,ISNULL(a.f_total,0) AS f_total
			,STUFF((
				SELECT
					aa.c_cheque+''+'<br/>'
				FROM tb_cheque_vsn aa
				WHERE aa.imp_expense_vsn_dtl_id = a.imp_expense_vsn_dtl_id
				ORDER BY aa.c_cheque
				FOR XML PATH(''),TYPE).value('(./text())[1]','VARCHAR(MAX)')
			,1,0,'') AS c_cheque
			,CONVERT(VARCHAR, a.d_cheque, 120) AS d_cheque
			,a.c_request
			,STUFF((
				SELECT
					aa.c_creditor+''+'<br/>'
				FROM tb_cheque_vsn aa
				WHERE aa.imp_expense_vsn_dtl_id = a.imp_expense_vsn_dtl_id
				ORDER BY aa.c_cheque
				FOR XML PATH(''),TYPE).value('(./text())[1]','VARCHAR(MAX)')
			,1,0,'') AS c_creditor
			,a.c_expense_group_main
			,a.c_acc_item  
			,CASE 
				WHEN (cc.i_system=2) then (select top 1 vw.c_code from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2)
				WHEN (cc.i_system=1) then (select top 1 vw.c_code from vw_show_request_jv vw where vw.dtl_id=a.imp_request_ephis_dtl_id and vw.i_type=1)
				ELSE NULL
			END c_import_rq_code
			,CASE 
				WHEN (cc.i_system=2) then (select top 1 vw.c_jv_code from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2)
				WHEN (cc.i_system=1) then (select top 1 vw.c_jv_code from vw_show_request_jv vw where vw.dtl_id=a.imp_request_ephis_dtl_id and vw.i_type=1)
				ELSE NULL
			END c_import_rq_jv_code
			,CASE 
				WHEN (cc.i_system=2) then (select top 1 vw.f_inv from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2)
				WHEN (cc.i_system=1) then (select top 1 vw.f_inv from vw_show_request_jv vw where vw.dtl_id=a.imp_request_ephis_dtl_id and vw.i_type=1)
				ELSE NULL
			END  f_inv_import
			,CASE 
				WHEN (cc.i_system=2) then (select top 1 vw.c_acc_dr from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2)
				WHEN (cc.i_system=1) then (select top 1 vw.c_acc_dr from vw_show_request_jv vw where vw.dtl_id=a.imp_request_ephis_dtl_id and vw.i_type=1)
				ELSE NULL
			END c_acc_dr_import
			,CASE 
				WHEN (cc.i_system=2) then (select top 1 vw.c_acc_cr from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2)
				WHEN (cc.i_system=1) then (select top 1 vw.c_acc_cr from vw_show_request_jv vw where vw.dtl_id=a.imp_request_ephis_dtl_id and vw.i_type=1)
				ELSE NULL
			END c_acc_cr_import
			,CASE 
				WHEN (cc.i_system=2) then (select top 1 vw.c_acc_item from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2)
				WHEN (cc.i_system=1) then (select top 1 vw.c_acc_item from vw_show_request_jv vw where vw.dtl_id=a.imp_request_ephis_dtl_id and vw.i_type=1)
				ELSE NULL
			END c_acc_item_import 												
			,CASE 
				WHEN (cc.i_system=2) then (select top 1 vw.gl_tran_hdr_rq_id from vw_show_request_jv vw where vw.dtl_id=a.imp_request_vsn_dtl_id and vw.i_type=2)
				WHEN (cc.i_system=1) then (select top 1 vw.gl_tran_hdr_rq_id from vw_show_request_jv vw where vw.dtl_id=a.imp_request_ephis_dtl_id and vw.i_type=1)
				ELSE NULL
			END gl_tran_hdr_rq_id 
			,a.c_request_desc
			,a.c_request_form
			,a.imp_request_vsn_dtl_id
			,a.imp_request_ephis_dtl_id
			,cc.i_system as i_system_show
		INTO #TemDataDtl
		FROM imp_expense_vsn_dtl a
			LEFT JOIN (
				SELECT
					aa.dc_expense_acc_vsn_id
					,aa.c_name
					,(SELECT aaa.c_code+'<br>'+aaa.c_name FROM dc_acc aaa WHERE aa.dc_acc_id = aaa.dc_acc_id) AS c_acc_name
					,(SELECT aaa.c_code+'<br>'+aaa.c_name FROM dc_acc aaa WHERE aa.dc_acc_id_overlap = aaa.dc_acc_id) AS c_acc_name_overlap
				FROM dc_expense_acc_vsn aa
			) b ON a.dc_expense_acc_vsn_id = b.dc_expense_acc_vsn_id
			LEFT JOIN dc_expense_group_vsn c ON a.dc_expense_group_vsn_id = c.dc_expense_group_vsn_id
			INNER JOIN imp_expense_vsn_hdr cc ON cc.imp_expense_vsn_hdr_id=a.imp_expense_vsn_hdr_id
		WHERE a.imp_expense_vsn_hdr_id = ?;

		SELECT * FROM #TemDataDtl a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemDataDtl;";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["imp_expense_vsn_dtl_id"],
				"i_type_year"						=> "{$row["i_type_year"]}",
				"c_budget_year"						=> "{$row["c_budget_year"]}",
				"i_cal_gl"							=> $row["i_cal_gl"],
				"c_booking"							=> $row["c_booking"],
				"dc_expense_group_vsn_id"			=> $row["dc_expense_group_vsn_id"],
				"dc_expense_acc_vsn_id"				=> $row["dc_expense_acc_vsn_id"],
				"dc_expense_group_vsn_name"			=> ($row["dc_expense_group_vsn_name"] != "") ? $row["dc_expense_group_vsn_name"] : "",
				"dc_expense_acc_vsn_name"			=> ($row["dc_expense_acc_vsn_name"] != "") ? $row["dc_expense_acc_vsn_name"] : "",
				"c_acc_name"						=> ($row["c_acc_name"] != "") ? $row["c_acc_name"] : "",
				"c_approve"							=> $row["c_approve"],
				"d_doc"								=> ($row["d_doc"] != "") ? $date->extDateBuddha($row["d_doc"]) : "",
				"d_doc_show"						=> ($row["d_doc"] != "") ? $date->shot_date_from_db($row["d_doc"]) : "",
				"f_inv"								=> $row["f_inv"],
				"f_tax_personal"					=> $row["f_tax_personal"],
				"f_social_security"					=> $row["f_social_security"],
				"f_prov_fund"						=> $row["f_prov_fund"],
				"f_fine"							=> $row["f_fine"],
				"f_total"							=> $row["f_total"],
				"c_cheque"							=> $row["c_cheque"],
				"d_cheque"							=> ($row["d_cheque"] != "") ? $date->extDateBuddha($row["d_cheque"]) : "",
				"c_request"							=> $row["c_request"],
				"c_creditor"						=> $row["c_creditor"],
				"c_expense_group_main"				=> $row["c_expense_group_main"],
				"c_acc_item"						=> $row["c_acc_item"], 
				"c_import_rq_code"					=> $row["c_import_rq_code"],
				"c_import_rq_jv_code"				=> $row["c_import_rq_jv_code"],
				"f_inv_import"						=> $row["f_inv_import"],
				"c_acc_dr_import"					=> $row["c_acc_dr_import"],
				"c_acc_cr_import"					=> $row["c_acc_cr_import"],
				"c_acc_item_import"					=> $row["c_acc_item_import"],
				"gl_tran_hdr_rq_id"					=> $row["gl_tran_hdr_rq_id"],
				"c_request_desc"					=> $row["c_request_desc"],
				"c_request_form"					=> $row["c_request_form"],
				"imp_request_vsn_dtl_id"			=> $row["imp_request_vsn_dtl_id"],
				"imp_request_ephis_dtl_id"			=> $row["imp_request_ephis_dtl_id"],
				"i_system_show"						=> $row["i_system_show"]				
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
