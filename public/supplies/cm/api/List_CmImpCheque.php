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

if( $_REQUEST["type"] == "cm_imp_cheque_hdr" ) {
	
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
		if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		if( $_REQUEST["dc_bank_acc_company_id"] > 0 ) { $con .= " AND a.dc_bank_acc_company_id=".$_REQUEST["dc_bank_acc_company_id"]; }
		
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.d_doc_date DESC) AS numrow
					,a.cm_imp_cheque_hdr_id
					,(SELECT aa.dc_bank_id FROM dc_bank_acc_company aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id) AS dc_bank_id
					,a.dc_bank_acc_company_id
					,(SELECT aa.c_code+' : '+aa.c_name FROM dc_bank_acc_company aa WHERE aa.dc_bank_acc_company_id=a.dc_bank_acc_company_id) AS dc_bank_acc_company_name
					,a.c_code
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.i_enable
					,a.c_comment
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
					,CONVERT(VARCHAR, a.d_create, 120) AS d_create
					,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
					,CONVERT(VARCHAR, a.d_update, 120) AS d_update
					,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
				INTO #TemData
				FROM cm_imp_cheque_hdr a
				WHERE 1=1 
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["cm_imp_cheque_hdr_id"],
							"dc_bank_id"				=> $row["dc_bank_id"],
							"dc_bank_acc_company_id"	=> $row["dc_bank_acc_company_id"],
							"dc_bank_acc_company_name"	=> $row["dc_bank_acc_company_name"],
							"c_code"					=> ($row["c_code"] != "")? $row["c_code"] : "",
							"d_doc_date"				=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
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
	
} else if( $_REQUEST["type"] == "cm_imp_cheque_dtl" ) {
	
	$totalCount	= 0;
	$sum_dr				= 0;
	$sum_cr				= 0;
	$sum_balance		= 0;
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					a.c_doc
					,a.c_name
					,a.f_dr
					,a.f_cr
					,a.f_balance
				FROM cm_imp_cheque_dtl a
				WHERE a.cm_imp_cheque_hdr_id=?
				ORDER BY a.cm_imp_cheque_dtl_id;";

	$arrParam[]	= $_REQUEST["cm_imp_cheque_hdr_id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	
	if( sqlsrv_has_rows( $stmt ) ) {
		
		while( $row = $db->Fetch( $stmt ) ) {
			
			++$totalCount;
			
			$temp = array(	"no"						=> $totalCount,
							"id"						=> $totalCount,
							"c_doc"						=> ($row["c_doc"] != "")? $row["c_doc"] : "",
							"c_name"					=> ($row["c_name"] != "")? $row["c_name"] : "",
							"f_dr"						=> $row["f_dr"],
							"f_cr"						=> $row["f_cr"],
							"f_balance"					=> $row["f_balance"]
			);
			
			${$root}[] = $temp;
			
			$sum_dr				+= $row["f_dr"];
			$sum_cr				+= $row["f_cr"];
			$sum_balance		+= $row["f_balance"];
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root},
							"sum_dr" => $sum_dr, "sum_cr" => $sum_cr, "sum_balance" => $sum_balance));
	exit;
	
}
?>