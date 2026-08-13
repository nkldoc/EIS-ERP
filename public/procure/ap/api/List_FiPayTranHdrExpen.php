<?php
include("../conf/configAp.php");
include("../../dc/conf/configDc.php");
include("../../tax/conf/configTax.php");
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

if($_REQUEST["type"] == "ap_expen_hdr") {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

// 	switch($i_read) {
// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
// 		default:	$con = "";
// 	}

	if($mode == "SEARCH") {
		if(@$_REQUEST["value"] != "") { $con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
		if(@$_REQUEST["s_is_status"] != "99") { $con	.= " AND a.i_is_status=".$_REQUEST["s_is_status"]; }
		if(@$_REQUEST["s_doc_date1"] != "" && @$_REQUEST["s_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["s_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["s_doc_date2"]}'+' 23:59:59',102)";
		}
		if(@$_REQUEST["s_dc_cost_id"] > 0) { $con	.= " AND a.dc_cost_id=".$_REQUEST["s_dc_cost_id"]; }
		if(@$_REQUEST["ap_expen_hdr_id"] > 0) { $con .= " AND a.ap_expen_hdr_id=".$_REQUEST["ap_expen_hdr_id"]; }
	}

	if( $_REQUEST["PAGE_TYPE"] == 2 ) {
		$join_table	= " LEFT JOIN cm_temp_line b ON a.ap_expen_hdr_id = b.ap_expen_hdr_id ";
		$fld		= "	,b.c_str1
						,b.c_str2
						,b.c_str3";
		$con		.=" AND ISNULL(a.c_code,'0') != '0' ";
	} else {
		$join_table	= "";
		$fld		= "";
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
					,a.ap_expen_hdr_id
					,a.ap_expen_hdr_ref_id
					,ISNULL((SELECT TOP 1 bb.i_exp_type FROM ap_expen_dtl aa
							INNER JOIN ap_exp_doc bb ON aa.ap_exp_doc_id = bb.ap_exp_doc_id
							WHERE aa.ap_expen_hdr_id = a.ap_expen_hdr_id AND bb.i_exp_type= ".DC_EXP_DOC_EXP_TYPE_SPECIAL."), ".DC_EXP_DOC_EXP_TYPE_OTHER.") AS i_exp_type
					,ISNULL(a.c_code, '') AS c_code
					,a.c_doc_ref
					,a.i_is_status /* สถานะใบเบิก */
					,a.dc_cost_id
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_cost_id) AS dc_cost_name /* หน่วยงานขอเบิก */
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date /* วันที่บันทึก */
					,LEFT(a.c_name,100) AS c_subject /* เรื่อง */
					,a.i_type_person
					,CASE
						WHEN ((a.i_type_person=".PERSON_CREDITOR.") AND (a.dc_creditor_id>0)) THEN (SELECT c_name FROM dbo.vw_dc_creditor WHERE dc_creditor_id=a.dc_creditor_id)
						WHEN ((a.i_type_person=".PERSON_EMP.") AND (a.dc_emp_id>0)) THEN (SELECT c_name FROM dc_emp WHERE dc_emp_id=a.dc_emp_id)
						WHEN ((a.i_type_person=".PERSON_OTHER.") AND (a.c_other_name!='')) THEN a.c_other_name
						ELSE ''
					END AS creditor_name /* ชื่อเจ้าหนี้ */
					,a.dc_creditor_id
					,(SELECT aa.c_code+' : '+aa.c_name FROM dbo.vw_dc_creditor aa WHERE aa.dc_creditor_id=a.dc_creditor_id) AS dc_creditor_name
					,a.dc_emp_id
					,(SELECT aa.c_code+' : '+aa.c_name FROM dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_id) AS dc_emp_name
					,a.c_other_name
					,a.dc_acc_other_id
					,a.i_is_receiver_diff
					,a.c_receiver_name
					,a.dc_emp_ref_id
					,(SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_ref_id) AS dc_emp_ref_name
					,a.dc_emp_boss_id
					,(SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_boss_id) AS dc_emp_boss_name
					,a.c_job
					,a.c_location
					,a.c_creditor_addr
					,a.c_creditor_tax
					,a.c_creditor_ref
					,a.c_name
					{$fld}
					,CONVERT(VARCHAR, a.d_chk_date, 120) AS d_chk_date /* วันที่ตรวจจ่าย */
					,a.c_comment
					,RIGHT(a.c_yyyy_mm,2) AS c_mm
					,LEFT(a.c_yyyy_mm,4) AS c_yyyy
					,a.c_type_doc
					,a.c_type_doc_num
					,a.i_is_barter
					,ISNULL(a.f_barter_amt,0) AS f_barter_amt
					,ISNULL(a.f_barter_dec,0) AS f_barter_dec
					,a.i_center
					,a.dc_bg_type_id
					,ISNULL(a.f_total_amount,0) AS f_total_amount
					,ISNULL(a.f_vat_amount,0) AS f_vat_amount
					,ISNULL(a.f_wht_amount,0) AS f_wht_amount
					,ISNULL(a.f_penalty,0) AS f_penalty
					,ISNULL(a.f_net_amount,0) AS f_net_amount
					,a.i_enable
				INTO #TemData
				FROM ap_expen_hdr a
					{$join_table}
				WHERE 1=1
					{$con};
	
				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
	
				SELECT COUNT(*) AS rowCounts FROM #TemData;";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["ap_expen_hdr_id"],
							"ap_expen_hdr_ref_id"		=> $row["ap_expen_hdr_ref_id"],
							"i_exp_type"				=> $row["i_exp_type"],
							"c_code"					=> ($row["c_code"] != "0")? $row["c_code"] : "",
							"c_doc_ref"					=> $row["c_doc_ref"],
							"i_is_status"				=> $row["i_is_status"],
							"show_is_status"			=> $pay_status_arr[$row["i_is_status"]],
							"dc_cost_id"				=> $row["dc_cost_id"],
							"dc_cost_name"				=> $row["dc_cost_name"],
							"dc_cost_id_Name"			=> $row["dc_cost_name"],
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_subject"					=> $row["c_subject"],
							"i_type_person"				=> $row["i_type_person"],
							"creditor_name"				=> $row["creditor_name"],
							"dc_creditor_id"			=> $row["dc_creditor_id"],
							"dc_creditor_id_Name"		=> $row["dc_creditor_name"],
							"dc_emp_id"					=> $row["dc_emp_id"],
							"dc_emp_id_Name"			=> $row["dc_emp_name"],
							"c_other_name"				=> $row["c_other_name"],
							"dc_acc_other_id"			=> $row["dc_acc_other_id"],
							"i_is_receiver_diff"		=> $row["i_is_receiver_diff"],
							"c_receiver_name"			=> $row["c_receiver_name"],
							"dc_emp_ref_id"				=> $row["dc_emp_ref_id"],
							"dc_emp_ref_id_Name"		=> $row["dc_emp_ref_name"],
							"dc_emp_boss_id"			=> $row["dc_emp_boss_id"],
							"dc_emp_boss_id_Name"		=> $row["dc_emp_boss_name"],
							"c_job"						=> $row["c_job"],
							"c_location"				=> $row["c_location"],
							"c_creditor_addr"			=> $row["c_creditor_addr"],
							"c_creditor_tax"			=> $row["c_creditor_tax"],
							"c_creditor_ref"			=> $row["c_creditor_ref"],
							"c_name"					=> $row["c_name"],
							"c_str1"					=> (@$row["c_str1"] != "")? $row["c_str1"] : "",
							"c_str2"					=> (@$row["c_str2"] != "")? $row["c_str2"] : "",
							"c_str3"					=> (@$row["c_str3"] != "")? $row["c_str3"] : "",
							"d_chk_date"				=> ($row["d_chk_date"] != "")? $date->extDateBuddha($row["d_chk_date"]) : "",
							"c_comment"					=> $row["c_comment"],
							"c_mm"						=> $row["c_mm"],
							"c_yyyy"					=> $row["c_yyyy"],
							"c_type_doc"				=> $row["c_type_doc"],
							"c_type_doc_num"			=> $row["c_type_doc_num"],
							"i_is_barter"				=> $row["i_is_barter"],
							"f_barter_amt"				=> $row["f_barter_amt"],
							"f_barter_dec"				=> $row["f_barter_dec"],
							"i_center"					=> $row["i_center"],
							"dc_bg_type_id"				=> $row["dc_bg_type_id"],
							"f_total_amount"			=> $row["f_total_amount"],
							"f_vat_amount"				=> $row["f_vat_amount"],
							"f_total_add_vat_amt"		=> $row["f_total_amount"]+$row["f_vat_amount"],
							"f_wht_amount"				=> $row["f_wht_amount"],
							"f_penalty"					=> $row["f_penalty"],
							"f_net_amount"				=> $row["f_net_amount"],
							"i_enable"					=> $row["i_enable"],
							"show_enable"				=> $arr_status[$row["i_enable"]]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if($_REQUEST["type"] == "storeCopy") {
	
	$mode				= @$_REQUEST["mode"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") { $con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow,
					a.ap_expen_hdr_id,
					a.c_code,
					a.c_name,
					CASE
						WHEN ((a.i_type_person=".PERSON_CREDITOR.") AND (a.dc_creditor_id>0)) THEN (SELECT c_name FROM dbo.vw_dc_creditor WHERE dc_creditor_id=a.dc_creditor_id)
						WHEN ((a.i_type_person=".PERSON_EMP.") AND (a.dc_emp_id>0)) THEN (SELECT c_name FROM dc_emp WHERE dc_emp_id=a.dc_emp_id)
						WHEN ((a.i_type_person=".PERSON_OTHER.") AND (a.c_other_name!='')) THEN a.c_other_name
						ELSE ''
					END AS creditor_name, /* เจ้าหนี้ / ผู้ยืม */
					CASE
						WHEN a.i_is_receiver_diff = 3 THEN a.c_receiver_name
						ELSE (SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_ref_id)
					END AS c_receiver_name, /* ชื่อผู้รับเงิน */
					(SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_boss_id) AS dc_emp_boss_name, /* ขอเสนอเพื่อโปรดอนุมัติ โดย */
					(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_cost_id) AS dc_cost_name /* หน่วยงานขอเบิก */
				INTO #TemData
				FROM ap_expen_hdr a
					LEFT JOIN cm_temp_line b ON a.ap_expen_hdr_id=b.ap_expen_hdr_id
				WHERE ISNULL(a.c_code,'0')!='0' AND a.i_is_status = ".FI_BR_I_IS_STATUS0."
					{$con};
	
				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
	
				SELECT COUNT(*) AS rowCounts FROM #TemData;";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["ap_expen_hdr_id"],
							"c_code"					=> ($row["c_code"] != "0")? $row["c_code"] : "",
							"c_name"					=> $row["c_name"],
							"creditor_name"				=> $row["creditor_name"],
							"c_receiver_name"			=> $row["c_receiver_name"],
							"dc_emp_boss_name"			=> $row["dc_emp_boss_name"],
							"dc_cost_name"				=> $row["dc_cost_name"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if($_REQUEST["type"] == "vw_dc_emp") {
	
	$mode				= @$_REQUEST["mode"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	if($mode == "SEARCH") {
		if(@$_REQUEST["pop-value"] != "") { $con .= " AND a.".$_REQUEST["pop-filter"]." LIKE '%".$_REQUEST["pop-value"]."%' "; }
		else if(@$_REQUEST["value"] != "") { $con .= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
					,a.dc_emp_id
					,a.c_code
					,a.c_name
					,a.c_address
					,a.c_tax_value
					,a.c_ref_value
				INTO #TemData
				FROM vw_dc_emp a
				WHERE CASE
						WHEN a.d_resign IS NULL THEN 1 
						WHEN a.d_resign > GETDATE() THEN 1
						ELSE 0
					END = 1
					AND ISNULL(a.i_enable,".STATUS_DISABLE.") = 1
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["dc_emp_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"c_address"					=> $row["c_address"],
							"c_tax_value"				=> $row["c_tax_value"],
							"c_ref_value"				=> $row["c_ref_value"]
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );

	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if($_REQUEST["type"] == "year_close") {

	$sqlMain = "SELECT c_mm,c_yyyy FROM gl_dc_period WHERE i_system=? AND i_status=? AND i_last_period=? ORDER BY c_yyyy DESC, c_mm DESC;";
	
	$stmt = $db->QueryParam($sqlMain, array(3,1,1));
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
			$temp = array(	"c_mm"					=> $date->l_month_thai[$row["c_mm"]],
							"c_yyyy"				=> $row["c_yyyy"]+543,
			);
				
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "store_dtl" ) {

	$no		= 0;
	
	$sqlMain	= "	SELECT
						a.ap_expen_dtl_id
						,a.dc_acc_id
						,b.c_code AS acc_code
						,b.c_name AS acc_name
						,a.tax_map_method_id
						,(SELECT bb.c_name FROM tax_map_method aa
							INNER JOIN dc_tax_method bb ON aa.dc_tax_method_id=bb.dc_tax_method_id WHERE aa.tax_map_method_id = a.tax_map_method_id) AS tax_map_method_name
						,a.dc_section_tax_id
						,(SELECT aa.c_name FROM dc_section_tax aa WHERE aa.dc_section_tax_id = a.dc_section_tax_id) AS dc_section_tax_name
						,a.ap_exp_doc_id
						,(SELECT aa.c_name FROM ap_exp_doc aa WHERE aa.ap_exp_doc_id = a.ap_exp_doc_id) AS ap_exp_doc_name
						,a.dc_cost_id
						,(SELECT aa.c_name FROM dc_cost aa WHERE aa.dc_cost_id = a.dc_cost_id) AS dc_cost_name
						,ISNULL(a.f_inv_amount,0) AS f_inv_amount
						,ISNULL(a.f_dec_amount,0) AS f_dec_amount
						,ISNULL(a.f_tax_save,0) AS f_tax_save
						,ISNULL(a.f_reduce,0) AS f_reduce
						,ISNULL(a.f_tax_rate,0) AS f_tax_rate
						,ISNULL(a.f_vat_rate,0) AS f_vat_rate
						,ISNULL(a.f_vat_amount,0) AS f_vat_amount
						,ISNULL(a.f_vat_doc,0) AS f_vat_doc
						,a.i_is_drpenalty
						,ISNULL(a.f_drpenalty,0) AS f_drpenalty
						,ISNULL(a.f_net_amount,0) AS f_net_amount
						,a.group_acc
						,a.dc_acc_id
						,b.c_name AS dc_acc_id_Name
						,a.tax_map_method_id
						,(SELECT bb.c_name FROM tax_map_method aa INNER JOIN dc_tax_method bb ON aa.dc_tax_method_id = bb.dc_tax_method_id WHERE aa.tax_map_method_id = a.tax_map_method_id) AS tax_map_method_id_Name
						,a.ap_exp_doc_id
						,a.c_sp_day
						,a.c_time
						,a.c_sp_comment
						,a.dc_vat_id
						,a.c_comment
						,a.i_is_tax_restricted
						,a.dc_tax_id
						,a.i_status_cnt
						,a.i_company_pay_tax
						,a.f_pay_tax_amount
						,a.ap_penalty_id
						,a.i_is_vat_amount
					FROM ap_expen_dtl a
						LEFT JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
					WHERE a.ap_expen_hdr_id = ?;";
	
	$arrParam[]	= $_REQUEST["ap_expen_hdr_id"];
	
	$stmt	= $db->QueryParam($sqlMain, $arrParam);
	
	if( sqlsrv_has_rows($stmt) ) {
		
		$f_inv_amount	= 0;
		$f_dec_amount	= 0;
		$f_tax_save		= 0;
		$f_reduce		= 0;
		$f_tax_rate		= 0;
		$f_vat_rate		= 0;
		$f_vat_amount	= 0;
		$f_vat_doc		= 0;
		$f_drpenalty	= 0;
		$f_net_amount	= 0;
				
		while($row=$db->Fetch($stmt)) {

			$temp = array(	"total_type"					=> false,
							"no"							=> ++$no,
							"id"							=> $row["ap_expen_dtl_id"],
							"dtl_acc_code"					=> $row["acc_code"],
							"dtl_acc_name"					=> $row["acc_name"],
							"dtl_tax_map_method_name"		=> $row["tax_map_method_name"],
							"dtl_ap_exp_doc_name"			=> $row["ap_exp_doc_name"],
							"dtl_dc_cost_name"				=> $row["dc_cost_name"],
							"dtl_f_inv_amount"				=> $row["f_inv_amount"],
							"dtl_f_dec_amount"				=> $row["f_dec_amount"],
							"dtl_f_tax_save"				=> $row["f_tax_save"],
							"dtl_f_reduce"					=> $row["f_reduce"],
							"dtl_f_tax_rate"				=> $row["f_tax_rate"],
							"dtl_f_vat_rate"				=> $row["f_vat_rate"],
							"dtl_f_vat_amount"				=> $row["f_vat_amount"],
							"dtl_f_vat_doc"					=> $row["f_vat_doc"],
							"dtl_i_is_drpenalty"			=> $row["i_is_drpenalty"],
							"dtl_f_drpenalty"				=> $row["f_drpenalty"],
							"dtl_f_net_amount"				=> $row["f_net_amount"],
							"dtl_group_acc"					=> $row["group_acc"],
							"dtl_dc_acc_id"					=> $row["dc_acc_id"],
							"dtl_dc_acc_id_Name"			=> $row["dc_acc_id_Name"],
							"dtl_tax_map_method_id"			=> $row["tax_map_method_id"],
							"dtl_tax_map_method_id_Name"	=> $row["tax_map_method_id_Name"],
							"dtl_dc_cost_id"				=> $row["dc_cost_id"],
							"dtl_dc_cost_id_Name"			=> $row["dc_cost_name"],
							"dtl_ap_exp_doc_id"				=> $row["ap_exp_doc_id"],
							"dtl_c_sp_day"					=> $row["c_sp_day"],
							"dtl_c_time"					=> $row["c_time"],
							"dtl_c_sp_comment"				=> $row["c_sp_comment"],
							"dtl_dc_vat_id"					=> $row["dc_vat_id"],
							"dtl_c_comment"					=> $row["c_comment"],
							"dtl_i_is_tax_restricted"		=> $row["i_is_tax_restricted"],
							"dtl_dc_tax_id"					=> $row["dc_tax_id"],
							"dtl_i_status_cnt"				=> $row["i_status_cnt"],
							"dtl_i_company_pay_tax"			=> $row["i_company_pay_tax"],
							"dtl_f_pay_tax_amount"			=> $row["f_pay_tax_amount"],
							"dtl_ap_penalty_id"				=> $row["ap_penalty_id"],
							"dtl_i_is_vat_amount"			=> $row["i_is_vat_amount"]
			);

			$f_inv_amount	+= $row["f_inv_amount"];
			$f_dec_amount	+= $row["f_dec_amount"];
			$f_tax_save		+= $row["f_tax_save"];
			$f_reduce		+= $row["f_reduce"];
			$f_tax_rate		+= $row["f_tax_rate"];
			$f_vat_rate		+= $row["f_vat_rate"];
			$f_vat_amount	+= $row["f_vat_amount"];
			$f_vat_doc		+= $row["f_vat_doc"];
			$f_drpenalty	+= $row["f_drpenalty"];
			$f_net_amount	+= $row["f_net_amount"];

			${$root}[] = $temp;
		}

		// รวม
		$temp = array(	"dtl_total_type"			=> true,
						"no"						=> null,
						"id"						=> null,
						"dtl_acc_code"				=> "",
						"dtl_acc_name"				=> "",
						"dtl_tax_map_method_name"	=> "",
						"dtl_ap_exp_doc_name"		=> "",
						"dtl_dc_cost_name"			=> "",
						"dtl_f_inv_amount"			=> $f_inv_amount,
						"dtl_f_dec_amount"			=> $f_dec_amount,
						"dtl_f_tax_save"			=> $f_tax_save,
						"dtl_f_reduce"				=> $f_reduce,
						"dtl_f_tax_rate"			=> $f_tax_rate,
						"dtl_f_vat_rate"			=> $f_vat_rate,
						"dtl_f_vat_amount"			=> $f_vat_amount,
						"dtl_f_vat_doc"				=> $f_vat_doc,
						"dtl_i_is_drpenalty"		=> null,
						"dtl_f_drpenalty"			=> $f_drpenalty,
						"dtl_f_net_amount"			=> $f_net_amount
		);
		$no++;
		${$root}[] = $temp;
	}

	echo json_encode(array("debug"=>true, "totalCount"=>$no, $root=>${$root}));
	exit;
	
} else if($_REQUEST["type"] == "store_acc") {

	$mode				= @$_REQUEST["mode"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	if($_REQUEST["value"] != "") { $con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }

	if( $_REQUEST["group_acc"] == "3" )		{ $con .= " AND a.i_group = 5 "; }
	else if( $_REQUEST["group_acc"] == "1" ){ $con .= " AND a.i_group = 2 "; }
	else if( $_REQUEST["group_acc"] == "2" ){ $con .= " AND a.i_group IN (1,3,4) "; }

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code) AS numrow
					,a.*
				INTO #TemData
				FROM dc_acc a
				WHERE a.i_enable = ".STATUS_ENABLE."
				AND a.i_last = 1
				AND ISNULL(c_code,'0') != '0'
				{$con};

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow

				SELECT COUNT(*) AS rowCounts FROM #TemData;";

				$arrParam[]	= $start;
				$arrParam[]	= $limit;

				$stmt = $db->QueryParam($sqlMain, $arrParam);
				if( sqlsrv_has_rows( $stmt ) ) {
					while( $row=$db->Fetch( $stmt ) ) {

						$temp = array(	"no"						=> $row["numrow"],
								"id"						=> $row["dc_acc_id"],
								"c_code"					=> $row["c_code"],
								"c_name"					=> $row["c_name"]
						);

						${$root}[] = $temp;
					}
				}

				$db->NextResult( $stmt );
				$rowCounts=$db->Fetch( $stmt );

				echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
				exit;

} else if($_REQUEST["type"] == "store_method") {

	$mode				= @$_REQUEST["mode"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	if(@$_REQUEST["value"] != "") {
		$s	= ($_REQUEST["filter"] == "c_name")? "b" : "a";
		$con	.= " AND $s.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
	}
	
	$sql	= "	SELECT * FROM ap_expen_hdr WHERE ap_expen_hdr_id = ?";
	$ap		= $db->GetDataBySQL($sql, array($_REQUEST["ap_expen_hdr_id"]));

// 	if ($ap["i_type_person"] == PERSON_CREDITOR $i_daily_worker == "2") // ผู้ขาย/ผู้รับจ้าง (ลูกจ้างรายวันไม่มีสัญญาจ้าง)) {
// 		$con .= " AND a.dc_section_tax_id = ".TAX_CFG_M40_1;
// 	} else 
	if ($ap["i_type_person"] == PERSON_EMP) { // พนักงาน
		$con .= " AND a.dc_section_tax_id IN (SELECT dc_section_tax_id FROM dc_section_tax_config WHERE i_enable = ".STATUS_ENABLE." AND i_delete = ".DELETE_FALSE.")";
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY b.dc_section_tax_id) AS numrow
					,a.*
					,b.c_name
				INTO #TemData
				FROM tax_map_method a
					INNER JOIN dc_tax_method b ON a.dc_tax_method_id = b.dc_tax_method_id
				WHERE a.i_enable = ".STATUS_ENABLE."
					AND a.dc_acc_id = ".$_REQUEST["dc_acc_id"]."
					{$con};

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow

				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
				
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["tax_map_method_id"],
							"c_name"					=> $row["c_name"],
							"dc_section_tax_id"			=> $row["dc_section_tax_id"]
			);
			
			${$root}[] = $temp;
		}
	}

	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );

	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;

} else if($_REQUEST["type"] == "getConditionCmbTaxRate") {
	
	$creditor_type1 = PERSON_CREDITOR;
	$creditor_type3 = PERSON_EMP;
	$creditor_type4 = PERSON_OTHER;
	$cnf_tax40_1	= TAX_CFG_M40_1;
		
	if(@$_REQUEST["ap_expen_hdr_id"] > 0) {
	
		$sql	= "	SELECT
						a.i_is_salary
						,a.i_type_person
						,ISNULL(a.dc_emp_id,0) AS dc_emp_id
						,CASE
							WHEN ((a.i_type_person=1) AND (a.dc_creditor_id>0)) THEN (SELECT dc_tax_customer_id FROM dbo.vw_dc_creditor WHERE dc_creditor_id=a.dc_creditor_id)
							WHEN ((a.i_type_person=3) AND (a.dc_emp_id>0)) THEN (SELECT dc_tax_customer_id FROM dc_emp WHERE dc_emp_id=a.dc_emp_id)
							WHEN ((a.i_type_person=4) AND (a.dc_tax_customer_id!='')) THEN a.dc_tax_customer_id
							ELSE ''
						END AS dc_tax_customer_id
					FROM ap_expen_hdr a
					WHERE a.ap_expen_hdr_id = ?";
	
		$ap	= $db->GetDataBySQL($sql, array($_REQUEST["ap_expen_hdr_id"]));

		$dc_tax_customer_id		= $ap["dc_tax_customer_id"];	// ประเภทการหักภาษี ณ ที่จ่าย
		$dc_emp_id				= $ap["dc_emp_id"];				// บุคคลภายใน
		$i_type_person			= $ap["i_type_person"];			// ประเภทเจ้าหนี้
		$i_pay_type				= AP_EXPENSE;					// ใบเบิก AP ค่าใช้จ่าย
		$dc_section_tax_id		= $db->GetDataBySQL("SELECT b.dc_section_tax_id
													FROM tax_map_method a
														INNER JOIN dc_tax_method b ON a.dc_tax_method_id = b.dc_tax_method_id
													WHERE a.tax_map_method_id = ?;", array($_REQUEST["tax_map_method_id"]));
		$i_is_salary			= $ap["i_is_salary"];
		
	}
	
	$arrParam = array(	$dc_tax_customer_id,
						$i_pay_type,
						$dc_emp_id,
						$dc_section_tax_id,
						$i_type_person,
						$creditor_type1,
						$creditor_type3,
						$creditor_type4,
						$cnf_tax40_1 );
		
	$sql = "SET NOCOUNT ON
			DECLARE @dc_tax_customer_id AS bigint;
			DECLARE @i_pay_type AS tinyint;
			DECLARE @dc_emp_id AS bigint;
			DECLARE @dc_section_tax_id AS bigint;
			DECLARE @i_type_person AS bigint;
			DECLARE @creditor_type1 AS tinyint;
			DECLARE @creditor_type3 AS tinyint;
			DECLARE @creditor_type4 AS tinyint;
			DECLARE @cnf_tax40_1 AS tinyint;
			
			SET @dc_tax_customer_id = ?;
			SET @i_pay_type = ?;
			SET @dc_emp_id = ?;
			SET @dc_section_tax_id = ?;
			SET @i_type_person = ?;
			SET @creditor_type1 = ?;
			SET @creditor_type3 = ?;
			SET @creditor_type4 = ?;
			SET @cnf_tax40_1 = ?;
			
			/* declre return value */
			DECLARE @ret_i_is_emp_m48 AS bit; /*พนักงาน กับ ภาษีตรงตามมาตรา 48 F-ไม่ตรง,T-ตรง*/
			DECLARE @ret_i_is_cnt_m48 AS bit; /*ผู้ขาย/ผู้รับจ้าง กับ ภาษีตรงตามมาตรา 48 F-ไม่ตรง,T-ตรง */
			DECLARE @ret_i_is_oth_m48 AS bit; /*ผู้ขาย/ผู้รับจ้างประเภททั่วไป กับ ภาษีตรงตามมาตรา 48 F-ไม่ตรง,T-ตรง */
			DECLARE @ret_i_is_emp_m40_1 AS bit; /*พนักงาน กับ ภาษีตรงตามมาตรา 40(1) dc_section_tax_id=1 เท่านั้น F-ไม่ตรง,T-ตรง*/
			DECLARE @ret_whtax_txt AS varchar(250); /*ชื่อประเภทการหักภาษี ณ ที่จ่าย*/
			DECLARE @ret_whtax AS tinyint; /*ประเภทการหักภาษี ณ ที่จ่าย*/
			DECLARE @ret_tx AS varchar(2000); /*ข้อความแสดงอัตราภาษี*/
			DECLARE @ret_f_tax_rate AS decimal(18, 2); /*อัตราภาษี*/
			DECLARE @ret_dc_wht_id AS bigint; /*dc_tax_id*/
			DECLARE @ret_tax AS decimal(18,2);
	
			SET @ret_i_is_emp_m48 = 0;
			SET @ret_i_is_cnt_m48 = 0;
			SET @ret_i_is_oth_m48 = 0;
			SET @ret_i_is_emp_m40_1 = 0;
	
			DECLARE @dc_tax_id AS bigint;
			DECLARE @i_type_tax AS tinyint;
			DECLARE @c_name AS varchar(250);
	
			SELECT @dc_tax_id = a.dc_tax_id, @i_type_tax = b.i_type_tax, @c_name = b.c_name
			FROM dc_section_tax_sub a
				INNER JOIN dc_section_tax b ON b.dc_section_tax_id = a.dc_section_tax_id
			WHERE a.dc_tax_customer_id = @dc_tax_customer_id
				AND a.dc_section_tax_id = @dc_section_tax_id;
	
			DECLARE @tax_i_type_whtax AS tinyint;
			DECLARE @tax_f_tax_rate AS decimal(18,2);
			DECLARE @tax_c_name AS varchar(250);
	
			SELECT @ret_whtax = ISNULL(i_type_whtax,0)
				, @tax_f_tax_rate = ISNULL(f_tax_rate,0)
				, @tax_c_name = c_name
				, @ret_whtax_txt = CASE ISNULL(i_type_whtax,0)
									WHEN ".TAX_BY_RATE."		THEN 'หักตามอัตราภาษี'
									WHEN ".TAX_BY_PROGRESS."	THEN 'หักตามอัตราก้าวหน้า'
									WHEN ".TAX_BY_M48."			THEN 'หักตามเกณฑ์มาตรา 48'
									WHEN ".TAX_BY_PENSION."		THEN 'หัก ณ ที่จ่ายจากบำเหน็จ'
									WHEN ".TAX_BY_NONE."		THEN 'ไม่หัก ณ ที่จ่าย'
									END
			FROM dc_tax WHERE dc_tax_id = @dc_tax_id;
	
			SET @ret_tx			= '<b><font color=#9900CC size=4>'+@tax_c_name+' ['+@c_name+']<br>';
			SET @ret_f_tax_rate	= @tax_f_tax_rate;
			SET @ret_tax		= @tax_f_tax_rate;
	
			if (@i_pay_type <> 1)
				SET @ret_whtax = 0;
	
			if @i_type_tax = 1
			begin
				if @i_type_person = @creditor_type3
				begin
		
					DECLARE @emp_step AS decimal(18, 2);
		
					select top 1 @emp_step = isnull(i_percent_max,0)
					from pr_emp_tax_level where dc_emp_id=@dc_emp_id
					order by cast(c_process_pmt_yy+c_process_pmt_mm as int) desc;
	
					if @emp_step = 0
						select @dc_tax_id = isnull(dc_tax_id,0) from dc_tax where i_type_whtax='4' and i_enable='1';
					else
						select @dc_tax_id = isnull(dc_tax_id,0) from dc_tax
						where i_type_whtax is not null and i_enable='1' and f_tax_rate=CAST (@emp_step as decimal);
	
					SET @ret_i_is_emp_m48 = 1;

					if @dc_section_tax_id = @cnf_tax40_1
					begin
						SET @ret_i_is_emp_m48 = 0;
						SET @ret_i_is_emp_m40_1 = 1;
					end
				end
				else if @i_type_person = @creditor_type1
					SET @ret_i_is_cnt_m48 = 1;
			end
	
			SET @ret_dc_wht_id = @dc_tax_id;
	
			/*ถ้าเป็นหักตามเกณฑ์มาตรา 48 เอาออกให้มาจาก pr_emp_tax_level*/
			if @ret_whtax = ".TAX_BY_M48."
			begin
				if @i_type_person = @creditor_type3
				begin
					select top 1 @ret_tax = isnull(i_percent_max,0) from pr_emp_tax_level where dc_emp_id=@dc_emp_id order by cast(c_process_pmt_yy+c_process_pmt_mm as int) desc;
					SET @ret_i_is_emp_m48 = 1;
				end
				else if @i_type_person = @creditor_type1
					SET @ret_i_is_cnt_m48 = 1;
				else if @i_type_person = @creditor_type4
					SET @ret_i_is_oth_m48 = 1;
			end
	
			/* return */
			select @ret_i_is_emp_m48 as i_is_emp_m48
				, @ret_i_is_cnt_m48 as i_is_cnt_m48
				, @ret_i_is_oth_m48 as i_is_oth_m48
				, @ret_i_is_emp_m40_1 as i_is_emp_m40_1
				, @ret_whtax_txt as whtax_txt
				, @ret_whtax as whtax
				, @ret_tx as tx
				, @ret_f_tax_rate as f_tax_rate
				, @ret_dc_wht_id as dc_wht_id
				, @ret_tax as tax;";
	
	$stmt = $db->QueryParam($sql, $arrParam);
	$row = $db->Fetch($stmt);
	
	if(@$_REQUEST["ap_expen_dtl_id"] > 0) {
			
		$sql	= "SELECT dc_tax_id, tax_map_method_id FROM ap_expen_dtl WHERE ap_expen_dtl_id = ?;";
		$dtl	= $db->GetDataBySQL($sql, array($_REQUEST["ap_expen_dtl_id"]));
	
		if( $_REQUEST["tax_map_method_id"] == $dtl["tax_map_method_id"] ) {
			$row["dc_wht_id"]	= $dtl["dc_tax_id"];
		}
	}
	
	$arr = array("i_is_emp_m48"			=> $row["i_is_emp_m48"]
				,"i_is_cnt_m48"			=> $row["i_is_cnt_m48"]
				,"i_is_oth_m48"			=> $row["i_is_oth_m48"]
				,"i_is_emp_m40_1"		=> $row["i_is_emp_m40_1"]
				,"whtax_txt"			=> $row["whtax_txt"]
				,"tx"					=> $row["tx"]
				,"f_tax_rate"			=> $row["f_tax_rate"]
				,"dc_wht_id"			=> $row["dc_wht_id"]
				,"tax"					=> $row["tax"]
				,"i_is_salary"			=> @$i_is_salary
				,"i_type_person"		=> $i_type_person
	);
	
	echo json_encode(array("debug"=>"getConditionCmbTaxRate", "data"=>$arr));
	exit;

} else if($_REQUEST["type"] == "contentTxt") {

	$checkDefaultTaxRate	= false;
	
	$content	= "";
	$sqlMain	= "	SELECT
						a.i_type_person
						,c.c_code+' '+c.c_name AS dc_emp_name
						,d.c_name AS dc_creditor_name
						,ISNULL(e.c_name, 'ยังไม่ระบุ') AS cus_type
					FROM ap_expen_hdr a
						LEFT JOIN vw_dc_emp c ON a.dc_emp_id = c.dc_emp_id
						LEFT JOIN vw_dc_creditor d ON a.dc_creditor_id = d.dc_creditor_id
						LEFT JOIN dc_tax_customer e ON d.dc_tax_customer_id = e.dc_tax_customer_id
					WHERE a.ap_expen_hdr_id=?";
	
	$arrParam[]	= $_REQUEST["ap_expen_hdr_id"];
	
	$ss		= $db->GetDataBySQL($sqlMain, $arrParam);
	
	switch ( $ss["i_type_person"] ) {
	
		case PERSON_CREDITOR : // เจ้าหนี้
	
			$dc_tax_rate	= 0;
				
			$content =	"<li style=\"font-weight: bold; color: red;\">ผู้ขาย/ผู้รับจ้าง "
							.$ss["dc_creditor_name"]." นี้ มีภาษีหัก ณ ที่จ่าย อัตราก้าวหน้า "."( ".number_format($dc_tax_rate,2)." %)"
						."</li>"
						."<li> สำหรับผู้ขาย/ผู้รับจ้าง ที่มีภาษีหัก ณ ที่จ่าย อัตราก้าวหน้า "
							."<u>ต่ำกว่า ".TAX_FIX_CNT_RATE." %</u> และเบิกค่าใช้จ่าย "
							."<u>มาตรา 40(2)</u> ด้วยยอดขอเบิก "
							."<u>มากกว่าหรือเท่ากับ 25,000 บาท</u> ระบบจะกำหนดภาษีฯ อัตราก้าวหน้าเป็น "
							."<u>".TAX_FIX_CNT_RATE." % อัตโนมัติ</u>"
						."</li>"
						."<li> ประเภทกิจการ : <u>".$ss["cus_type"]."</u></li>";
	
// 			$checkDefaultTaxRate	= true;
				
			break;
				
		case PERSON_EMP : // บุคคลภายใน
			
			$dc_tax_rate	= 0;
				
			$content =	"<li style=\"font-weight: bold; color: red;\">บุคคลภายใน "
							."<u>".$ss["dc_emp_name"]."</u>"
							." นี้ มีภาษีหัก ณ ที่จ่าย อัตราก้าวหน้า (".$dc_tax_rate." %)"
						."</li>";
			
			break;
				
		case PERSON_OTHER : //ทั่วไป
				
			$dc_tax_rate	= 0;
				
			$content =	"<li style=\"font-weight: bold; color: red;\">"
							."<u>เจ้าหนี้ทั่วไป</u> กรุณา "
							."<u>\"ระบุจำนวนเงินภาษีหัก ณ ที่จ่าย 0 บาท\"</u> เท่านั้น"
						."</li>";
			break;
				
	}
	
	$contentTxt	=	"<ul style=\"background-color: #fff; border: 1px solid #ccc; padding: 5px;\">"
						."<li style=\"font-weight: bold; color: blue;\">หมายเหตุ</li>"
						.$content
					."</ul>";

	$data["contentTxt"]					= $contentTxt;
	$data["checkDefaultTaxRate"]		= $checkDefaultTaxRate;
	$data["dc_tax_rate"]				= $dc_tax_rate;
	
	echo json_encode(array("success"=>true, "data"=>$data, "msg"=>""));
	exit;
} else if( $_REQUEST["type"] == "List_Calculate" ) { // คำนวณยอดเงินทั้งหมด

	$msg	= "";
	
	$sqlMain	= "	SELECT
						dc_acc_id_dec,
						i_is_status,
						c_remark,
						i_send_tax,
						ISNULL(f_total_amount,0) AS f_total_amount,
						ISNULL(f_dec_amount,0) AS f_dec_amount,
						ISNULL(f_vat_amount,0) AS f_vat_amount,
						ISNULL(f_vat_doc,0) AS f_vat_doc,
						ISNULL(f_vat_cal_show,0) AS f_vat_cal_show,
						ISNULL(f_comp_amount,0) AS f_comp_amount,
						ISNULL(f_wht_amount,0) AS f_wht_amount,
						ISNULL(f_tax_save,0) AS f_tax_save,
						ISNULL(f_penalty,0) AS f_penalty,
						ISNULL(f_net_penalty,0) AS f_net_penalty,
						ISNULL(f_barter_amtsum,0) AS f_barter_amtsum,
						ISNULL(f_barter_decsum,0) AS f_barter_decsum,
						ISNULL(f_reduce,0) AS f_reduce,
						ISNULL(f_net_amount,0) AS f_net_amount
					FROM ap_expen_hdr
					WHERE ap_expen_hdr_id=?";

	$arrParam[]	= $_REQUEST["ap_expen_hdr_id"];

	$ss	= $db->GetDataBySQL($sqlMain, $arrParam);

	$data["dc_acc_id_dec"]			= $ss["dc_acc_id_dec"];
	$data["i_is_status"]			= $ss["i_is_status"];
	$data["c_remark"]				= $ss["c_remark"];
	$data["i_send_tax"]				= $ss["i_send_tax"];
	$data["f_total_amount"]			= $ss["f_total_amount"];
	$data["f_dec_amount"]			= $ss["f_dec_amount"];
	$data["f_vat_amount"]			= $ss["f_vat_amount"];
	$data["f_vat_doc"]				= $ss["f_vat_doc"];
	$data["f_vat_cal_show"]			= $ss["f_vat_cal_show"];
	$data["f_comp_amount"]			= $ss["f_comp_amount"];
	$data["f_wht_amount"]			= $ss["f_wht_amount"];
	$data["f_tax_save"]				= $ss["f_tax_save"];
	$data["f_penalty"]				= $ss["f_penalty"];
	$data["f_net_penalty"]			= $ss["f_net_penalty"];
	$data["f_barter_amtsum"]		= $ss["f_barter_amtsum"];
	$data["f_barter_decsum"]		= $ss["f_barter_decsum"];
	$data["f_reduce"]				= $ss["f_reduce"];
	$data["f_net_amount"]			= $ss["f_net_amount"];

	echo json_encode(array("success"=>true, "data"=>$data, "msg"=>$msg));
	exit;
	
}
?>
