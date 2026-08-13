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

if ($_REQUEST["type"] == "imp_request_ephis_hdr") {

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
		if (@$_REQUEST["i_status"]!=99) {
			$con .= " AND a.i_status=" . $_REQUEST["i_status"];
		}		 
 
	}

	if (@$_REQUEST["i_type_menu"]=="2") {
		 $con .= " AND LEFT(a.c_code,1)='I' AND a.i_enable=1"; 
	}

	$sqlMain = "
		SET NOCOUNT ON
	    SELECT
			ROW_NUMBER() OVER (ORDER BY a.imp_request_ephis_hdr_id DESC) AS numrow
			,a.imp_request_ephis_hdr_id
		INTO #TemData
        FROM dbo.imp_request_ephis_hdr a
	    WHERE 1 = 1
		   {$con};

        SELECT
            a.numrow
			,b.imp_request_ephis_hdr_id
			,CASE
				WHEN b.c_code IS NOT NULL THEN b.c_code
				ELSE ''
			END AS c_code
			,b.c_period_no
			,b.c_doc
			,b.dc_expense_budget_type_id
			,c.c_name AS dc_expense_budget_type_name 
			,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
			,ISNULL(b.gl_tran_hdr_rq_id,0) as gl_tran_hdr_rq_id
			,CONVERT(VARCHAR, b.d_jv_date, 120) as d_jv_date
			,CASE 
				WHEN ISNULL(b.gl_tran_hdr_rq_id,0)>0 AND (e.i_is_post=1) then 'รายการรอลงบัญชี'
				WHEN ISNULL(b.gl_tran_hdr_rq_id,0)>0 AND (e.i_is_post=2) then e.c_code
				WHEN ISNULL(b.gl_tran_hdr_rq_id,0)>0 AND (e.i_is_post=3) then e.c_code_post
				ELSE ''
			END as c_code_jv 
            ,ISNULL(b.c_comment,'') AS c_comment
			,b.i_status
			,b.i_enable
			,CASE
				WHEN (b.i_status='1') THEN 'อยู่ระหว่างนำเข้าใบเบิก' 
				WHEN (b.i_status='2') THEN 'นำเข้าใบเบิกสมบูรณ์' 
				WHEN (b.i_status='3') THEN 'อยู่ระหว่างบันทึกบัญชี'  
				WHEN (b.i_status='4') THEN 'บันทึกบัญชีสมบูรณ์'  
				ELSE ''
			END AS c_status
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
			,CONVERT(VARCHAR, b.d_update, 120) AS d_update
			,ISNULL(e.i_is_post,0) as i_is_post
        FROM #TemData a
			INNER JOIN dbo.imp_request_ephis_hdr b ON a.imp_request_ephis_hdr_id = b.imp_request_ephis_hdr_id
			LEFT JOIN dbo.dc_expense_budget_type c ON b.dc_expense_budget_type_id = c.dc_expense_budget_type_id
 			LEFT JOIN dbo.gl_tran_hdr e ON b.gl_tran_hdr_rq_id = e.gl_tran_hdr_id AND e.i_enable = 1
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
//echo $sqlMain;exit;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"									=> $row["numrow"],
				"id"									=> $row["imp_request_ephis_hdr_id"],
				"c_code"								=> $row["c_code"],
				"c_period_no"							=> ($row["c_period_no"] != "") ? $row["c_period_no"] : "",
				"c_doc"									=> ($row["c_doc"] != "") ? $row["c_doc"] : "",
				"dc_expense_budget_type_id"				=> $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type_name"			=> $row["dc_expense_budget_type_name"],  
				"d_doc_date"							=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"d_jv_date"								=> ($row["d_jv_date"] != "") ? $date->extDateBuddha($row["d_jv_date"]) : "",
	 			"gl_tran_hdr_rq_id"						=> $row["gl_tran_hdr_rq_id"],
				"c_code_jv"								=> $row["c_code_jv"],
				"c_comment"								=> $row["c_comment"], 
				"i_status"								=> $row["i_status"],
				"i_enable"								=> $row["i_enable"],
				"c_status"								=> $row["c_status"],  
				"show_enable"							=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"dc_user_update_id"						=> $row["dc_user_update"],
				"dc_user_update_cost_id"				=> $row["dc_user_update_cost"],
				"d_update"								=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"i_is_post"								=> $row["i_is_post"]
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} 
else if ($_REQUEST["type"] == "imp_request_ephis_dtl") {
//ยังไม่ได้ทำ
	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.imp_request_ephis_dtl_id) AS numrow
			,a.imp_request_ephis_dtl_id
			,a.imp_request_ephis_hdr_id
			,a.dc_expense_group_vsn_id
			,a.dc_expense_vsn_id
			,a.dc_expense_acc_vsn_id
			,a.i_type_year
			,a.c_budget_year
			,CONVERT(VARCHAR, a.d_doc, 120) as d_doc
			,CONVERT(VARCHAR, a.d_dkdate, 120) as d_dkdate
			,CONVERT(VARCHAR, a.d_paydate, 120) as d_paydate
			,CONVERT(VARCHAR, a.d_canceldate, 120) as d_canceldate 
			,a.c_request
			,a.c_request_desc
			,a.c_approve
			,a.c_expense_group_main
			,a.c_expense_group_sub
			,a.c_acc_item
			,a.c_budget_type_name
			,a.c_rcvtime
			,a.c_bglst
			,a.c_creditor
			,a.f_inv
			,a.f_vat
			,a.f_tax_personal
			,a.f_tax_corporate
			,a.f_social_security
			,a.f_fine
			,a.f_total
			,a.f_check_total
			,a.c_comment 
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, a.d_update, 120) AS d_update
			,a.i_cal_gl
			,a.c_bgdktypename
			,a.dc_acc_id_cr
			,a.gl_dc_config_id
			,a.i_send_jv
			,a.dc_creditor_id
		INTO #TemData
		FROM dbo.imp_request_ephis_dtl a
		WHERE a.imp_request_ephis_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"										=> $row["numrow"],
				"id"										=> $row["imp_request_ephis_dtl_id"],
				"imp_request_ephis_hdr_id"					=> $row["imp_request_ephis_hdr_id"], 
				"dc_expense_group_vsn_id"					=> $row["dc_expense_group_vsn_id"],
				"dc_expense_vsn_id"							=> $row["dc_expense_vsn_id"],
				"dc_expense_acc_vsn_id"						=> $row["dc_expense_acc_vsn_id"],
				"i_type_year"								=> $row["i_type_year"],
				"c_budget_year"								=> $row["c_budget_year"], 
				"d_doc"										=> ($row["d_doc"] != "") 		? $date->extDateBuddha($row["d_doc"]) 			: "",
				"d_dkdate"									=> ($row["d_dkdate"] != "") 	? $date->extDateBuddha($row["d_dkdate"]) 		: "",
				"d_paydate"									=> ($row["d_paydate"] != "") 	? $date->extDateBuddha($row["d_paydate"]) 		: "",
				"d_canceldate"								=> ($row["d_canceldate"] != "") ? $date->extDateBuddha($row["d_canceldate"]) 	: "",
				"c_request"									=> $row["c_request"],
				"c_request_desc"							=> $row["c_request_desc"],
				"c_approve"									=> $row["c_approve"], 
				"c_expense_group_main"						=> $row["c_expense_group_main"],
				"c_expense_group_sub"						=> $row["c_expense_group_sub"],
				"c_acc_item"								=> $row["c_acc_item"],
				"c_budget_type_name"						=> $row["c_budget_type_name"],	
				"c_rcvtime"									=> $row["c_rcvtime"],
				"c_bglst"									=> $row["c_bglst"],
				"c_creditor"								=> $row["c_creditor"],  
				"f_inv"										=> $row["f_inv"],
				"f_vat"										=> $row["f_vat"],
				"f_tax_personal"							=> $row["f_tax_personal"],
				"f_tax_corporate"							=> $row["f_tax_corporate"],
				"f_social_security"							=> $row["f_social_security"], 
				"f_fine"									=> $row["f_fine"],
				"f_total"									=> $row["f_total"],
				"f_check_total"								=> $row["f_check_total"],
				"c_comment"									=> $row["c_comment"],
				"dc_user_update_id"							=> $row["dc_user_update"],
				"dc_user_update_cost_id"					=> $row["dc_user_update_cost"],
				"d_update"									=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"i_cal_gl"									=> $row["i_cal_gl"],
				"c_bgdktypename"							=> $row["c_bgdktypename"],
				"dc_acc_id_cr"								=> $row["dc_acc_id_cr"],
				"gl_dc_config_id"							=> $row["gl_dc_config_id"],
				"i_send_jv"									=> $row["i_send_jv"],
				"dc_creditor_id"							=> $row["dc_creditor_id"]
				
				
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit; 
}
else if ($_REQUEST["type"] == "imp_request_ephis_dtl_n_item") {
 
	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.imp_request_ephis_dtl_id,b.imp_request_ephis_item_id,b.i_type_show) AS numrow
			,a.imp_request_ephis_hdr_id
			,a.imp_request_ephis_dtl_id 
			,b.imp_request_ephis_item_id 
			,CONVERT(VARCHAR, a.d_doc, 120) as d_doc
			,CONVERT(VARCHAR, a.d_canceldate, 120) as d_canceldate 
			,a.c_request
			,a.c_request_desc			
			,a.c_approve  
			,a.c_acc_item
			,a.c_creditor
			,a.c_bglst
			,b.i_type_year
			,b.c_budget_year				
			,ISNULL(b.f_inv,0) AS f_inv
			,ISNULL(b.f_vat,0) AS f_vat
			,ISNULL(b.f_tax_personal,0) AS f_tax_personal
			,ISNULL(b.f_tax_corporate,0) AS f_tax_corporate
			,ISNULL(b.f_social_security,0) AS f_social_security
			,ISNULL(b.f_fine,0) AS f_fine 		 
			,ISNULL(b.f_dr,0) AS f_dr	
			,ISNULL(b.f_cr,0) AS f_cr	
			,b.i_cal_gl
			,b.dc_acc_id
			,b.i_type_show
			,b.i_rank_dr
			,a.i_send_jv
			,a.dc_creditor_id
		INTO #TemData
		FROM dbo.imp_request_ephis_dtl a INNER JOIN imp_request_ephis_item b ON a.imp_request_ephis_dtl_id = b.imp_request_ephis_dtl_id
		WHERE a.imp_request_ephis_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $_REQUEST["hdr_id"];
//echo $sqlMain;exit;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"										=> $row["numrow"],
				"id"										=> $row["imp_request_ephis_item_id"],
				"imp_request_ephis_hdr_id"					=> $row["imp_request_ephis_hdr_id"],
				"imp_request_ephis_dtl_id"					=> $row["imp_request_ephis_dtl_id"],
				"imp_request_ephis_item_id"					=> $row["imp_request_ephis_item_id"],
				"d_doc"										=> ($row["d_doc"] != "") 				? $date->extDateBuddha($row["d_doc"]) 			: "",
				"d_canceldate"								=> ($row["d_canceldate"] != "") 		? $date->extDateBuddha($row["d_canceldate"]) 	: "",
 				"c_request"									=> $row["c_request"],
				"c_request_desc"							=> $row["c_request_desc"], 
				"c_approve"									=> $row["c_approve"], 
				"c_acc_item"								=> $row["c_acc_item"],
				"c_creditor"								=> $row["c_creditor"],
				"c_bglst"									=> $row["c_bglst"],				
				"i_type_year"								=> $row["i_type_year"],
				"c_budget_year"								=> $row["c_budget_year"], 		
				"f_inv"										=> $row["f_inv"],
				"f_vat"										=> $row["f_vat"],
				"f_tax_personal"							=> $row["f_tax_personal"],
				"f_tax_corporate"							=> $row["f_tax_corporate"],
				"f_social_security"							=> $row["f_social_security"], 
				"f_fine"									=> $row["f_fine"],
				"f_dr"										=> $row["f_dr"],
				"f_cr"										=> $row["f_cr"],
				"i_cal_gl"									=> $row["i_cal_gl"],
				"dc_acc_id"									=> $row["dc_acc_id"],
				"i_type_show"								=> $row["i_type_show"],
				"i_rank_dr"									=> $row["i_rank_dr"],
				"i_send_jv"									=> $row["i_send_jv"],
				"dc_creditor_id"							=> $row["dc_creditor_id"]				
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit; 
}
