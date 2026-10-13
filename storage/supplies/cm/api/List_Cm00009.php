<?php
include("../conf/configCm.php");
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

	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") { 
			if($_REQUEST["filter"] == "c_code_ap") { $con .= " AND c.c_code LIKE '%".$_REQUEST["value"]."%' "; }
			else { $con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
		}
		if($_REQUEST["s_doc_date1"] != "" && $_REQUEST["s_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["s_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["s_doc_date2"]}',102)";
		}
	}
	 
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
					,a.cm_voucher_one_id
					,a.c_code
					,c.c_code AS c_code_ap
					,a.cm_pay_type_id
					,e.c_name AS nเame_vch_type
					,CASE
						WHEN (ISNULL(c.dc_emp_ref_id,0)>0) AND (c.i_is_receiver_diff>0) THEN (SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=c.dc_emp_ref_id)
						ELSE c.c_receiver_name
					END AS c_receiver_name
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.f_net_cost
					,a.f_total_cost
					,a.f_vat
					,f.c_start_no AS dc_cheque_code
					,(SELECT c_code FROM dc_bank_acc_company WHERE dc_bank_acc_company_id=a.dc_bank_acc_company_id) AS dc_bank_acc_company
					,(SELECT c_code FROM dc_bank_acc_creditor WHERE dc_bank_acc_creditor_id=a.dc_bank_acc_creditor_id) AS dc_bank_acc_creditor
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
					LEFT JOIN cm_pay_type e ON a.cm_pay_type_id=e.cm_pay_type_id
					LEFT JOIN cm_pay_cheque f ON a.cm_pay_cheque_id=f.cm_pay_cheque_id
				WHERE a.i_type_voucher=1
					AND a.cm_pay_type_id=".CM_PAY_BANK_TRANF."
					AND ISNULL(a.cm_pay_type_id,0)!=0
					AND ISNULL(a.c_code,'0')!='0'
					AND a.i_enable=".STATUS_ENABLE."
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
							"c_code"					=> ( $row["c_code"] != "0" )? $row["c_code"] : "",
							"c_code_ap"					=> ( $row["c_code_ap"] != "0" )? $row["c_code_ap"] : "",
							"cm_pay_type_id"			=> $row["cm_pay_type_id"],
							"c_receiver_name"			=> $row["c_receiver_name"],
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"f_net_cost"				=> $row["f_net_cost"],
							"f_total_cost_vat"			=> $row["f_total_cost"]+$row["f_vat"],
							"dc_cheque_code"			=> $row["dc_cheque_code"],
							"dc_bank_acc_company"		=> $row["dc_bank_acc_company"],
							"dc_bank_acc_creditor"		=> $row["dc_bank_acc_creditor"],
							"i_enable"					=> $row["i_enable"],
							"show_enable"				=> $arr_status[$row["i_enable"]],
							"dc_user_create"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost"		=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> ($row["d_create"] != "")? $date->extDateBuddha($row["d_create"]) : "",
							"dc_user_update"			=> $row["dc_user_update"],
							"dc_user_update_cost"		=> $row["dc_user_update_cost"],
							"d_update"					=> ($row["d_update"] != "")? $date->extDateBuddha($row["d_update"]) : ""
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "List_cm_voucher_one" ) {

	$sqlMain	= "	SELECT
						a.c_code
						,b.c_code AS c_code_ap
						,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
						,CASE
							WHEN (ISNULL(b.dc_emp_ref_id,0)>0) AND (b.i_is_receiver_diff>0) THEN (SELECT aa.c_name FROM vw_dc_emp aa WHERE aa.dc_emp_id=b.dc_emp_ref_id)
							ELSE b.c_receiver_name
						END AS c_receiver_name
						,b.c_name
						,a.c_comment
						,a.dc_bank_acc_company_id
						,(SELECT aa.c_code+' : '+aa.c_name FROM dc_bank_acc_company aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id) AS dc_bank_acc_company_code
						,a.dc_bank_acc_creditor_id
						,b.f_total_amount
						,b.f_vat_amount
						,b.f_wht_amount
						,b.f_net_penalty
						,b.f_barter_amt
						,b.f_net_amount
					FROM cm_voucher_one a
						LEFT JOIN ap_expen_hdr b ON a.ap_expen_hdr_id=b.ap_expen_hdr_id
					WHERE a.cm_voucher_one_id=?";
	
	$arrParam[]	= $_REQUEST["cm_voucher_one_id"];
	$ss			= $db->GetDataBySQL($sqlMain, $arrParam);
	
	$data["c_code"]						= $ss["c_code"];
	$data["c_code_ap"]					= $ss["c_code_ap"];
	$data["d_doc_date"]					= $date->long_date_from_db($ss["d_doc_date"]);
	$data["c_receiver_name"]			= $ss["c_receiver_name"];
	$data["c_name"]						= $ss["c_name"];
	$data["c_comment"]					= $ss["c_comment"];
	$data["dc_bank_acc_company_id"]		= ($ss["dc_bank_acc_company_id"] != "")? $ss["dc_bank_acc_company_id"] : "";
	$data["dc_bank_acc_company_code"]	= ($ss["dc_bank_acc_company_code"] != "")? $ss["dc_bank_acc_company_code"] : "";
	$data["dc_bank_acc_creditor_id"]	= ($ss["dc_bank_acc_creditor_id"] != "")? $ss["dc_bank_acc_creditor_id"] : "";
	$data["f_total_amount"]				= number_format($ss["f_total_amount"],2);
	$data["f_vat_amount"]				= number_format($ss["f_vat_amount"],2);
	$data["f_wht_amount"]				= number_format($ss["f_wht_amount"],2);
	$data["f_net_penalty"]				= number_format($ss["f_net_penalty"],2);
	$data["f_barter_amt"]				= number_format($ss["f_barter_amt"],2);
	$data["f_net_amount"]				= number_format($ss["f_net_amount"],2);	
	
	echo json_encode(array("success"=>true, "data"=>$data));
	exit;
	
} else if($_REQUEST["type"] == "dc_bank_acc_company") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") {
			if($_REQUEST["filter"] != "") { $con .= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.dc_bank_acc_company_id DESC) AS numrow
					,a.dc_bank_acc_company_id
					,a.c_code
					,a.c_name
					,(SELECT c_name FROM dc_bank WHERE dc_bank_id=a.dc_bank_id) AS bank_name
					,(SELECT c_name FROM dc_bank_branch WHERE dc_bank_branch_id=c.dc_bank_branch_id) AS branch_name
					,(SELECT c_name FROM dc_bank_deposit_type WHERE dc_bank_deposit_type_id=b.dc_bank_deposit_type_id) AS deposit_type_name
				INTO #TemData
				FROM dc_bank_acc_company a
					INNER JOIN dc_bank_deposit_type b ON a.dc_bank_deposit_type_id = b.dc_bank_deposit_type_id
					INNER JOIN dc_bank_branch c ON a.dc_bank_branch_id = c.dc_bank_branch_id
					INNER JOIN dc_bank d ON a.dc_bank_id = d.dc_bank_id
					INNER JOIN dc_acc e ON a.dc_acc_id = e.dc_acc_id
					INNER JOIN dc_area f ON a.dc_area_id = f.dc_area_id
				WHERE a.dc_area_id !=0 AND a.i_enable=1
					{$con};

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow

				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row=$db->Fetch( $stmt ) ) {
	
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["dc_bank_acc_company_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"bank_name"					=> $row["bank_name"],
							"branch_name"				=> $row["branch_name"],
							"deposit_type_name"			=> $row["deposit_type_name"]
			);
	
			${$root}[] = $temp;
		}
	}

	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );

	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;

}
?>
