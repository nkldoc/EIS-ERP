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

if ($_REQUEST["type"] == "imp_request_vsn_hdr") {

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



	if ($_REQUEST["ITYPE_JV"] == "false") {
		//MENU ลงบัญชีของใบเบิก Vision Net
		$con	.= " AND a.c_code !='0'";
		$con	.= " AND ISNULL(a.i_enable,2) = 1";
		$con	.= " AND a.i_status>1";
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
			$con .= " AND b.i_post = " . $_REQUEST["i_post"];
		}
		if ($_REQUEST["i_enable"] > 0) {
			$con .= " AND a.i_enable =" . $_REQUEST["i_enable"];
		}
	} else {
		$con .= " AND a.i_enable = 1";
	}
 

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.d_doc_date DESC,a.c_code ASC) AS numrow
			,a.imp_request_vsn_hdr_id 
			,a.c_code
			,a.c_period_no
			,a.c_doc
			,a.dc_expense_budget_type_id
			,(SELECT aa.c_name FROM dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id=a.dc_expense_budget_type_id) AS dc_expense_budget_type
			,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
			,a.dc_cost_acc_id
			,(SELECT aa.c_name FROM dc_cost aa WHERE aa.dc_cost_id=a.dc_cost_acc_id) AS dc_cost_acc
			,a.c_comment
			,a.i_status
			,a.i_enable
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
			,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
			,CONVERT(VARCHAR, a.d_create, 120) AS d_create
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
			,CONVERT(VARCHAR, a.d_update, 120) AS d_update
			,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
			,a.gl_tran_hdr_rq_id
			,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_save_jv_date
			,a.dc_user_update_id_req
			,a.dc_user_update_cost_id_req 
			,CONVERT(VARCHAR, a.d_update_req, 120) AS d_update_req
			,a.dc_user_update_id_jv
			,a.dc_user_update_cost_id_jv 
			,CONVERT(VARCHAR, a.d_update_jv, 120) AS d_update_jv
			,ISNULL(b.c_code_post,b.c_code) AS c_gx_code
			,b.i_is_post
			,b.i_enable AS i_enable_gx
			,ISNULL((select top 1 cc.imp_group_request_vsn_dtl_id from imp_request_vsn_dtl cc where cc.imp_request_vsn_hdr_id=a.imp_request_vsn_hdr_id),0) AS i_dtl_group   
 			,ISNULL((select top 1 cc.imp_request_vsn_dtl_id from imp_request_vsn_dtl cc where cc.imp_request_vsn_hdr_id=a.imp_request_vsn_hdr_id and cc.i_status=3),0) AS i_dtl_gx   
		INTO #TemData
		FROM imp_request_vsn_hdr a
			LEFT JOIN gl_tran_hdr b ON a.gl_tran_hdr_rq_id = b.gl_tran_hdr_id 
		WHERE a.i_type_request=1
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
				"id"								=> $row["imp_request_vsn_hdr_id"],
				"c_code"							=> ($row["c_code"] != "") 		? $row["c_code"] : "",
				"c_period_no"						=> $row["c_period_no"],
				"c_doc"								=> $row["c_doc"],
				"dc_expense_budget_type_id"			=> $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type"			=> $row["dc_expense_budget_type"],
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"dc_cost_acc_id"					=> $row["dc_cost_acc_id"],
				"dc_cost_acc"						=> $row["dc_cost_acc"],
				"c_comment"							=> $row["c_comment"],
				"i_status"							=> $row["i_status"],
				"i_enable"							=> $row["i_enable"],
				"show_enable"						=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"dc_user_create_id"					=> $row["dc_user_create"],
				"dc_user_create_cost_id"			=> $row["dc_user_create_cost"],
				"d_create"							=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"gl_tran_hdr_rq_id"					=> $row["gl_tran_hdr_rq_id"],
				"d_save_jv_date"					=> ($row["d_save_jv_date"] != "") ? $date->extDateBuddha($row["d_save_jv_date"]) : "",
				"dc_user_update_id_req"				=> $row["dc_user_update_id_req"],
				"dc_user_update_cost_id_req"		=> $row["dc_user_update_cost_id_req"],
				"d_update_req"						=> ($row["d_update_req"] != "") ? $date->extDateBuddha($row["d_update_req"]) : "",
				"dc_user_update_id_jv"				=> $row["dc_user_update_id_jv"],
				"dc_user_update_cost_id_jv"			=> $row["dc_user_update_cost_id_jv"],
				"d_update_jv"						=> ($row["d_update_jv"] != "") ? $date->extDateBuddha($row["d_update_jv"]) : "",
				"c_gx_code"							=> ($row["c_gx_code"] != "") ? $row["c_gx_code"] : "",
				"i_is_post"							=> $row["i_is_post"],
				"i_enable_gx"						=> $row["i_enable_gx"],
				"i_dtl_group"						=> $row["i_dtl_group"],
				"i_dtl_gx"							=> $row["i_dtl_gx"]				
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "imp_request_vsn_dtl") {

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.imp_request_vsn_dtl_id) AS numrow
			,a.imp_request_vsn_dtl_id
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
			,a.c_request
			,a.c_request_desc
			,a.c_creditor
			,a.c_expense_group_main
			,a.c_acc_item
			,a.c_acc_item2
			,a.c_comment
			,a.gl_dc_config_id
			,a.i_send_jv
			,a.dc_creditor_id
			,a.i_status
			,case 
				when ((SELECT TOP 1 imp_request_vsn_dtl_id FROM temp_group_dtl_vsn jv WHERE jv.imp_request_vsn_dtl_id = a.imp_request_vsn_dtl_id)>0) then 1
				when (a.imp_group_request_vsn_dtl_id>0) then 2
				else 0
			end as i_group_show 
		INTO #TemData
		FROM imp_request_vsn_dtl a
			LEFT JOIN (
				SELECT
					aa.dc_expense_acc_vsn_id
					,aa.c_name
					,(SELECT aaa.c_code+'<br>'+aaa.c_name FROM dc_acc aaa WHERE aa.dc_acc_id = aaa.dc_acc_id) AS c_acc_name
					,(SELECT aaa.c_code+'<br>'+aaa.c_name FROM dc_acc aaa WHERE aa.dc_acc_id_overlap = aaa.dc_acc_id) AS c_acc_name_overlap
				FROM dc_expense_acc_vsn aa
			) b ON a.dc_expense_acc_vsn_id = b.dc_expense_acc_vsn_id
			LEFT JOIN dc_expense_group_vsn c ON a.dc_expense_group_vsn_id = c.dc_expense_group_vsn_id
		WHERE a.imp_request_vsn_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= @$_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["imp_request_vsn_dtl_id"],
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
				"c_request"							=> $row["c_request"],
				"c_request_desc"					=> $row["c_request_desc"],
				"c_creditor"						=> $row["c_creditor"],
				"c_expense_group_main"				=> $row["c_expense_group_main"],
				"c_acc_item"						=> $row["c_acc_item"],
				"c_acc_item2"						=> $row["c_acc_item2"],
				"c_comment"							=> $row["c_comment"],
				"gl_dc_config_id"					=> $row["gl_dc_config_id"],
				"i_send_jv"							=> $row["i_send_jv"],
				"dc_creditor_id"					=> $row["dc_creditor_id"],
				"i_status"							=> $row["i_status"],
				"i_group_show"						=> $row["i_group_show"]  
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
else if ($_REQUEST["type"] == "imp_request_vsn_dtl_item") {
			$sqlMain = "
			SET NOCOUNT ON
			SELECT
				ROW_NUMBER() OVER (ORDER BY a.imp_request_vsn_dtl_id ASC,b.i_rank_show ASC,b.i_type_show ASC,b.i_rank_dr ASC,b.c_acc_code_imp) AS numrow
				,a.imp_request_vsn_hdr_id
				,a.imp_request_vsn_dtl_id
				,b.imp_request_vsn_item_id
				,b.i_type_show
				,b.i_rank_dr
				,a.c_request
				,a.c_request_desc 
				,CONVERT(VARCHAR, a.d_doc, 120) AS d_doc
				,a.f_inv
				,a.c_creditor
				,a.c_comment
				,b.i_type_year
				,b.c_budget_year
				,b.i_cal_gl
				,b.dc_acc_id
				,b.f_dr
				,b.f_cr
				,b.c_acc_code_imp
				,b.c_acc_name_imp 
				,b.c_acc_code_imp+' '+b.c_acc_name_imp AS c_acc_code_imp_full 
				,a.i_send_jv
				,a.dc_creditor_id
				,a.i_status
				,case 
					when ((SELECT TOP 1 imp_request_vsn_dtl_id FROM temp_group_dtl_vsn jv WHERE jv.imp_request_vsn_dtl_id = a.imp_request_vsn_dtl_id)>0) then 1
					when (a.imp_group_request_vsn_dtl_id>0) then 2
					else 0
				end as i_group_show 
			INTO #TemData
			FROM  imp_request_vsn_dtl a
				INNER JOIN imp_request_vsn_hdr c ON c.imp_request_vsn_hdr_id = a.imp_request_vsn_hdr_id
				INNER JOIN imp_request_vsn_item  b ON a.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id 
			WHERE a.imp_request_vsn_hdr_id = ? and c.i_enable=1;

			SELECT * FROM #TemData a ORDER BY a.numrow;
			SELECT COUNT(*) AS rowCounts FROM #TemData;";

		$arrParam[]	= @$_REQUEST["hdr_id"];
//echo $sqlMain."<br>HDR ID=".@$_REQUEST["hdr_id"];exit;
		$stmt = $db->QueryParam($sqlMain, $arrParam);
		if (sqlsrv_has_rows($stmt)) {
			while ($row = $db->Fetch($stmt)) {
				$temp = array(
					"no"								=> $row["numrow"],
					"id"								=> $row["imp_request_vsn_item_id"], 
					"imp_request_vsn_dtl_id"			=> $row["imp_request_vsn_dtl_id"],
					"imp_request_vsn_hdr_id"			=> $row["imp_request_vsn_hdr_id"],
					"i_type_show"						=> $row["i_type_show"],
					"i_rank_dr"							=> $row["i_rank_dr"],					
					"c_request"							=> $row["c_request"],
					"c_request_desc"					=> $row["c_request_desc"],
					"d_doc"								=> ($row["d_doc"] != "") ? $date->extDateBuddha($row["d_doc"]) : "",
					"d_doc_show"						=> ($row["d_doc"] != "") ? $date->shot_date_from_db($row["d_doc"]) : "",
					"f_inv"								=> $row["f_inv"],	
					"c_creditor"						=> $row["c_creditor"],
					"c_comment"							=> $row["c_comment"],
					"i_type_year"						=> "{$row["i_type_year"]}",
					"c_budget_year"						=> "{$row["c_budget_year"]}",
					"i_cal_gl"							=> $row["i_cal_gl"],
					"dc_acc_id"							=> $row["dc_acc_id"],
					"f_dr"								=> $row["f_dr"],
					"f_cr"								=> $row["f_cr"],
					"c_acc_code_imp"					=> $row["c_acc_code_imp"],
					"c_acc_name_imp"					=> $row["c_acc_name_imp"],
					"c_acc_code_imp_full"				=> $row["c_acc_code_imp_full"],
					"i_send_jv"							=> $row["i_send_jv"],
					"dc_creditor_id"					=> $row["dc_creditor_id"],
					"i_status"							=> $row["i_status"],
					"i_group_show"						=> $row["i_group_show"]  	 					
				);

				${$root}[] = $temp;
			}
		}
			

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
?>