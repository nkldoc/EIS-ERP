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

if( $_REQUEST["type"] == "cm_imp_bank" || $_REQUEST["type"] == "cm_imp_bank_month" ) {
	
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
		
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
		if( $_REQUEST["dc_bank_acc_company_id"] > 0 ) { $con .= " AND a.dc_bank_acc_company_id=".$_REQUEST["dc_bank_acc_company_id"]; }
		if($_REQUEST["d_imp_date1"] != "" && $_REQUEST["d_imp_date2"] != "") {
			$con	.= " AND a.d_imp_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_imp_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_imp_date2"]}'+' 23:59:59',102)";
		}
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.d_imp_date DESC) AS numrow
					,a.{$_REQUEST["type"]}_hdr_id
					,(SELECT aa.dc_bank_id FROM dc_bank_acc_company aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id) AS dc_bank_id
					,a.dc_bank_acc_company_id
					,(SELECT aa.c_code+' : '+aa.c_name FROM dc_bank_acc_company aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id) AS dc_bank_acc_company_name
					,a.c_code
					,CONVERT(VARCHAR, a.d_imp_date, 120) AS d_imp_date
					,a.i_enable
					,a.c_comment
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM {$_REQUEST["type"]}_hdr a
				WHERE a.i_enable=1 
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["{$_REQUEST["type"]}_hdr_id"],
							"dc_bank_id"				=> $row["dc_bank_id"],
							"dc_bank_acc_company_id"	=> $row["dc_bank_acc_company_id"],
							"dc_bank_acc_company_name"	=> $row["dc_bank_acc_company_name"],
							"c_code"					=> ($row["c_code"] != "")? $row["c_code"] : "",
							"d_imp_date"				=> ($row["d_imp_date"] != "")? $date->extDateBuddha($row["d_imp_date"]) : "",
							"i_enable"					=> $row["i_enable"],
							"c_comment"					=> $row["c_comment"],
							"show_enable"				=> ( $row["i_enable"] == 1 )? "ใช้งาน" : "ยกเลิก",
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
	
} else if( $_REQUEST["type"] == "cm_imp_bank_dtl" || $_REQUEST["type"] == "cm_imp_bank_month_dtl" ) {
	
	$totalCount	= 0;
	
	$sum_amount		= 0;
	$sum_balance	= 0;
	
	$fld_hdr 	= ($_REQUEST["type"] == "cm_imp_bank_dtl" )? "cm_imp_bank_hdr_id" : "cm_imp_bank_month_hdr_id";
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.teller_id
					,a.transaction_code
					,a.description
					,a.cheque_no
					,a.i_cheque
					,a.f_amount
					,a.f_balance
					,ISNULL(a.init_br,'') AS init_br
				FROM {$_REQUEST["type"]} a
					WHERE a.{$fld_hdr}=?
				ORDER BY a.{$_REQUEST["type"]}_id;";

	$arrParam[]	= $_REQUEST["{$fld_hdr}"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			
			++$totalCount;
			
			$temp = array(	"no"						=> $totalCount,
							"id"						=> $totalCount,
							"d_doc_date_show"			=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $row["d_doc_date"] : "",
							"teller_id"					=> ($row["teller_id"] != "")? $row["teller_id"] : "",
							"transaction_code"			=> ($row["transaction_code"] != "")? $row["transaction_code"] : "",
							"description"				=> ($row["description"] != "")? $row["description"] : "",
							"cheque_no"					=> ($row["cheque_no"] != "")? $row["cheque_no"] : "",
							"i_cheque"					=> ($row["i_cheque"] != "")? $row["i_cheque"] : "",
							"f_amount"					=> $row["f_amount"],
							"f_balance"					=> $row["f_balance"],
							"init_br"					=> $row["init_br"]					
			);
			
			${$root}[] = $temp;
			
			$sum_amount		+= $row["f_amount"];
			$sum_balance	+= $row["f_balance"];
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root},
							"sum_amount" => $sum_amount, "sum_balance" => $sum_balance));
	exit;
	
}
?>