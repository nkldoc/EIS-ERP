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

if( $_REQUEST["type"] == "imp_request_ephis_dtl_all" ) {
	
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
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC,b.imp_request_ephis_dtl_id ASC) AS numrow
					,a.imp_request_ephis_hdr_id 
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.c_period_no
					,a.c_code  
					,b.imp_request_ephis_dtl_id
					,b.c_request
					,b.c_request_desc
					,b.c_creditor
					,b.c_acc_item as c_comment_dtl
					,b.f_inv
					,CONVERT(VARCHAR,b.d_doc, 120) AS d_doc_dtl
					,a.i_type_request
					,case 
						when (a.i_type_request='1') then 'ใบเบิกปกติ'
						when (a.i_type_request='2') then 'ใบเบิกพิเศษ (ตั้งหนี้นอกระบบแล้ว)'
						else NULL
					end as c_type_request
					,b.i_status
					,case 
						when (b.i_status='1') then 'รอส่งเบิก'
						when (b.i_status='2') then 'ส่งเบิกสมบูรณ์'
						when (b.i_status='3') then 'บันทึกบัญชีสมบูรณ์'
						when (b.i_status='8') then 'ยกเลิกจากการไม่ใช้งาน'
						when (b.i_status='9') then 'ยกเลิกใบเบิก(Reverse GX/GL)'
						else NULL
					end as c_status_dtl
					,(select c_name from NMU.dbo.dc_creditor where dc_creditor_id=b.dc_creditor_id) as c_name_vendor_by_id
				FROM imp_request_ephis_hdr a INNER JOIN imp_request_ephis_dtl b ON a.imp_request_ephis_hdr_id=b.imp_request_ephis_hdr_id
				where  left(a.c_code,1)='I' and a.i_enable = 1  
					{$con}
				ORDER BY a.c_code DESC,b.imp_request_ephis_dtl_id ASC;";
				 
	$stmt = $db->QueryParam($sqlMain, array());
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["imp_request_ephis_dtl_id"], 
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_period_no"						=> ($row["c_period_no"] != "")? $row["c_period_no"] : "",
							"c_code"							=> $row["c_code"],
							"c_request"							=> $row["c_request"],
							"c_request_desc"					=> $row["c_request_desc"],
							"c_creditor"						=> $row["c_creditor"],
							"c_comment_dtl"						=> $row["c_comment_dtl"],
							"f_inv"								=> $row["f_inv"],
							"d_doc_dtl"							=> ($row["d_doc_dtl"] != "")? $date->extDateBuddha($row["d_doc_dtl"]) : "",
							"i_type_request"					=> $row["i_type_request"],
							"c_type_request"					=> $row["c_type_request"],
							"i_status"							=> $row["i_status"],
							"c_status_dtl"						=> $row["c_status_dtl"],
							"c_name_vendor_by_id"				=> $row["c_name_vendor_by_id"]
							
 						);
			
			$rowCounts++;
			
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts, $root=>${$root}));
	exit;
	
}
?>