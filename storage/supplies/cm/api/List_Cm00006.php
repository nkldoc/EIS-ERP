<?php
include("../../ap/conf/configAp.php");
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

if($_REQUEST["type"] == "cm_voucher_one") {
	
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
		if($_REQUEST["value"] != "") { 
			if($_REQUEST["filter"] == "c_code_ap") {
				$con	.= " AND b.ap_expen_hdr_id=(SELECT aa.ap_expen_hdr_id FROM ap_expen_hdr aa WHERE aa.c_code LIKE '%".$_REQUEST["value"]."%')";
			} else {
				$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
			}
		}
		if($_REQUEST["s_doc_date1"] != "" && $_REQUEST["s_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["s_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["s_doc_date2"]}'+' 23:59:59',102)";
		}
	}
	 
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
					,a.cm_voucher_one_id
					,a.ap_expen_hdr_id
					,a.i_is_cancel_pre
					,ISNULL(a.c_code,0) AS c_code
					,ISNULL(c.c_code,0) AS c_code_ap
					,ISNULL(a.c_code_pv,0) AS c_code_pv
					,c.i_is_status
					,d.c_name AS fi_pymt_voucher_name
					,c.c_receiver_name
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.f_net_cost
					,a.c_comment
					,a.i_enable
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM cm_voucher_one a
					LEFT JOIN ap_expen_hdr c ON a.ap_expen_hdr_id=c.ap_expen_hdr_id
					LEFT JOIN cm_pay_type d ON a.cm_pay_type_id=d.cm_pay_type_id
				WHERE a.i_enable=1 AND a.i_type_voucher=1
				{$con};

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
			
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["cm_voucher_one_id"],
							"ap_expen_hdr_id"			=> $row["ap_expen_hdr_id"],
							"i_is_cancel_pre"			=> $row["i_is_cancel_pre"],
							"c_code"					=> ( $row["c_code"] != "0" )? $row["c_code"] : "",
							"c_code_ap"					=> ( $row["c_code_ap"] != "0" )? $row["c_code_ap"] : "",
							"c_code_pv"					=> ( $row["c_code_pv"] != "0" )? $row["c_code_pv"] : "",
							"i_is_status"				=> $row["i_is_status"],
							"s_is_status"				=> $pay_status_arr[$row["i_is_status"]],
							"fi_pymt_voucher_name"		=> $row["fi_pymt_voucher_name"],
							"c_receiver_name"			=> $row["c_receiver_name"],
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"f_net_cost"				=> $row["f_net_cost"],
							"c_comment"					=> $row["c_comment"],
							"i_enable"					=> $row["i_enable"],
							"show_enable"				=> $arr_status[$row["i_enable"]],
							"dc_user_create_id"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> ($row["d_create"] != "")? $date->extDateBuddha($row["d_create"]) : "",
							"dc_user_update_id"			=> $row["dc_user_update"],
							"dc_user_update_cost_id"	=> $row["dc_user_update_cost"],
							"d_update"					=> ($row["d_update"] != "")? $date->extDateBuddha($row["d_update"]) : ""
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "store_ap" ) {
	
	//แสดงใบเบิกค่าใช้จ่ายที่ ที่มีสถานะรอทำใบสำคัญจ่ายและจำนวนเงินขอเบิกมากกว่า 0 และยังไม่เคยผ่านการจัดทำใบสำคัญจ่ายมาก่อน และไม่เบิกพร้อมเงินเดือน
	$mode	= @$_REQUEST["mode"];
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
	
	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
	}
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
					,a.ap_expen_hdr_id
					,a.c_code
					,CASE
						WHEN ((a.i_type_person=".PERSON_CREDITOR.") AND (a.dc_creditor_id>0)) THEN (SELECT c_name FROM dbo.vw_dc_creditor WHERE dc_creditor_id=a.dc_creditor_id)
						WHEN ((a.i_type_person=".PERSON_EMP.") AND (a.dc_emp_id>0)) THEN (SELECT c_name FROM dc_emp WHERE dc_emp_id=a.dc_emp_id)
						WHEN ((a.i_type_person=".PERSON_OTHER.") AND (a.c_other_name!='')) THEN a.c_other_name
						ELSE ''
					END AS creditor_type_name /* ชื่อเจ้าหนี้ */
					,(CASE
						WHEN (a.dc_emp_ref_id>0 AND a.c_receiver_name='') THEN (SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=a.dc_emp_ref_id)
						ELSE a.c_receiver_name
					END) AS c_receiver_name
					,a.c_name
					,(SELECT aa.c_name FROM dc_cost aa WHERE aa.dc_cost_id=a.dc_cost_id) AS dc_cost_name
					,a.f_total_amount
					,a.f_dec_amount
					,a.f_vat_amount
					,a.f_vat_doc
					,a.f_wht_amount
					,a.f_penalty
					,a.f_net_penalty
					,a.f_barter_amt
					,a.f_barter_dec
					,a.f_net_amount
				INTO #TemData
				FROM ap_expen_hdr a
				WHERE a.d_chk_date IS NOT NULL
				AND ISNULL(a.i_enable,1)=1
				AND ISNULL(a.i_is_salary,0)=0
				AND ((ISNULL(a.f_total_amount,0)>0) OR (ISNULL(a.f_net_amount,0)>0))
				AND a.i_is_status IN (1,6,12)
				AND a.c_code != '0'
				AND a.ap_expen_hdr_id NOT IN (SELECT ISNULL(aa.ap_expen_hdr_id,0) FROM cm_voucher_one aa WHERE aa.i_type_voucher=1 AND aa.i_enable=1)
					{$con};
	
				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
	
				SELECT COUNT(*) AS rowCounts FROM #TemData;";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
			
			$temp = array(	"no"					=> $row["numrow"],
							"id"					=> $row["ap_expen_hdr_id"],
							"c_code"				=> $row["c_code"],
							"creditor_type_name"	=> $row["creditor_type_name"],
							"c_receiver_name"		=> $row["c_receiver_name"],
							"c_name"				=> $row["c_name"],
							"dc_cost_name"			=> $row["dc_cost_name"],
							"f_total_amount"		=> $row["f_total_amount"],
							"f_dec_amount"			=> $row["f_dec_amount"],
							"f_vat_amount"			=> $row["f_vat_amount"],
							"f_vat_doc"				=> $row["f_vat_doc"],
							"f_wht_amount"			=> $row["f_wht_amount"],
							"f_penalty"				=> $row["f_penalty"],
							"f_net_penalty"			=> $row["f_net_penalty"],
							"f_barter_amt"			=> $row["f_barter_amt"],
							"f_barter_dec"			=> $row["f_barter_dec"],
							"f_net_amount"			=> $row["f_net_amount"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "ap_expen_hdr" ) {

	$sqlMain	= "	SET NOCOUNT ON
					SELECT
						ROW_NUMBER() OVER (ORDER BY b.c_code DESC) AS numrow
						,a.ap_expen_hdr_id
						,b.c_code
						,CASE
							WHEN ((b.i_type_person=".PERSON_CREDITOR.") AND (b.dc_creditor_id>0)) THEN (SELECT c_name FROM dbo.vw_dc_creditor WHERE dc_creditor_id=b.dc_creditor_id)
							WHEN ((b.i_type_person=".PERSON_EMP.") AND (b.dc_emp_id>0)) THEN (SELECT c_name FROM dc_emp WHERE dc_emp_id=b.dc_emp_id)
							WHEN ((b.i_type_person=".PERSON_OTHER.") AND (b.c_other_name!='')) THEN b.c_other_name
							ELSE ''
						END AS creditor_type_name /* ชื่อเจ้าหนี้ */
						,(CASE
							WHEN (b.dc_emp_ref_id>0 AND b.c_receiver_name='') THEN (SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=b.dc_emp_ref_id)
							ELSE b.c_receiver_name
						END) AS c_receiver_name
						,b.c_name
						,(SELECT aa.c_name FROM dc_cost aa WHERE aa.dc_cost_id=b.dc_cost_id) AS dc_cost_name
						,b.f_total_amount
						,b.f_dec_amount
						,b.f_vat_amount
						,b.f_vat_doc
						,b.f_wht_amount
						,b.f_penalty
						,b.f_net_penalty
						,b.f_barter_amt
						,b.f_barter_dec
						,b.f_net_amount
					INTO #TemData
					FROM cm_voucher_one a
						LEFT JOIN ap_expen_hdr b ON a.ap_expen_hdr_id=b.ap_expen_hdr_id
					WHERE a.cm_voucher_one_id=?;
			
				SELECT * FROM #TemData a;
			
				SELECT COUNT(*) AS rowCounts FROM #TemData;";
	
	$arrParam[]	= $_REQUEST["cm_voucher_one_id"];
	
	$stmt	= $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows($stmt) ) {
		while($row=$db->Fetch($stmt)) {

			$temp = array(	"no"					=> $row["numrow"],
							"id"					=> $row["ap_expen_hdr_id"],
							"c_code"				=> $row["c_code"],
							"creditor_type_name"	=> $row["creditor_type_name"],
							"c_receiver_name"		=> $row["c_receiver_name"],
							"c_name"				=> $row["c_name"],
							"dc_cost_name"			=> $row["dc_cost_name"],
							"f_total_amount"		=> $row["f_total_amount"],
							"f_dec_amount"			=> $row["f_dec_amount"],
							"f_vat_amount"			=> $row["f_vat_amount"],
							"f_vat_doc"				=> $row["f_vat_doc"],
							"f_wht_amount"			=> $row["f_wht_amount"],
							"f_penalty"				=> $row["f_penalty"],
							"f_net_penalty"			=> $row["f_net_penalty"],
							"f_barter_amt"			=> $row["f_barter_amt"],
							"f_barter_dec"			=> $row["f_barter_dec"],
							"f_net_amount"			=> $row["f_net_amount"]
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;

} else if( $_REQUEST["type"] == "List_Calculate" ) { // คำนวณยอดเงินทั้งหมด

	$sqlMain	= "SELECT * FROM cm_voucher_one WHERE cm_voucher_one_id=?";
	$arrParam[]	= $_REQUEST["cm_voucher_one_id"];
	$ss			= $db->GetDataBySQL($sqlMain, $arrParam);

	$data["f_total_cost"]		= $ss["f_total_cost"];
	$data["f_dec_amount"]		= $ss["f_dec_amount"];
	$data["f_vat"]				= $ss["f_vat"];
	$data["f_vat_doc"]			= $ss["f_vat_doc"];
	$data["amount"]				= $ss["f_total_cost"]-$ss["f_dec_amount"]+$ss["f_vat"];
	$data["f_wht"]				= $ss["f_wht"];
	$data["f_tax_save"]			= $ss["f_tax_save"];
	$data["f_comp_amt"]			= $ss["f_comp_amt"];
	$data["f_penalty_amt"]		= $ss["f_penalty_amt"];
	$data["f_reduce"]			= $ss["f_reduce"];
	$data["f_barter_amt"]		= $ss["f_barter_amt"];
	$data["f_barter_dec"]		= $ss["f_barter_dec"];
	$data["f_net_cost"]			= $ss["f_net_cost"];

	echo json_encode(array("success"=>true, "data"=>$data));
	exit;
	
}
?>
