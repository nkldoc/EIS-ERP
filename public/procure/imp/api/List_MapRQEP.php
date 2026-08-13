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

if( $_REQUEST["type"] == "imp_request_ephis_hdr" ) {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	$rowCounts			= 0;
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
 
	
	if($mode == "SEARCH") {
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
		if($_REQUEST["d_save_date1"] != "" && $_REQUEST["d_save_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_save_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_save_date2"]}'+' 23:59:59',102)";
		}
 	}
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
					,a.imp_request_ephis_hdr_id 
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.c_period_no
					,a.c_code 
					,a.i_type_request
					,case 
						when (a.i_type_request='1') then 'นำเข้าใบเบิกปกติ'
						when (a.i_type_request='2') then 'นำเข้าใบเบิกพิเศษ (ตั้งหนี้นอกระบบแล้ว)'
						else NULL
					end as c_type_request
					,a.dc_expense_budget_type_id
					,(SELECT aa.c_name FROM dc_expense_budget_type aa WHERE aa.dc_expense_budget_type_id=a.dc_expense_budget_type_id) AS dc_expense_budget_type						
				FROM imp_request_ephis_hdr a
				where  left(a.c_code,1)='I' and a.i_enable = 1  and a.i_type_request=1
	 					and a.i_status=2 and isnull(a.gl_tran_hdr_rq_id,0)=0
					{$con}
				ORDER BY a.c_code DESC";
				 
	$stmt = $db->QueryParam($sqlMain, array());
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["imp_request_ephis_hdr_id"], 
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_period_no"						=> ($row["c_period_no"] != "")? $row["c_period_no"] : "",
							"c_code"							=> $row["c_code"], 
							"i_type_request"					=> $row["i_type_request"],
							"c_type_request"					=> $row["c_type_request"],
							"dc_expense_budget_type_id"			=> $row["dc_expense_budget_type_id"] ,
							"dc_expense_budget_type"			=> $row["dc_expense_budget_type"] 					
 						);
			
			$rowCounts++;
			
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts, $root=>${$root}));
	exit;
	
}
?>