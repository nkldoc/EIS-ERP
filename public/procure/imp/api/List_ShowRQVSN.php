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

if( $_REQUEST["type"] == "imp_request_vsn_dtl_all" ) {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	$rowCounts			= 0;
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
 
	
	if($mode == "SEARCH") {

		if( $_REQUEST["value"] != "" ) {

			switch ($_REQUEST["filter"])
			{
				case "c_code"			:
				case "c_period_no"		:
				default 				:		$ww_tbl = "a";		break;
				case "c_comment"	:
				case "c_request_desc"	:
				case "c_request"		:		$ww_tbl = "b";		break;			 				
			}

			$con	.= " AND $ww_tbl.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";


		}

		if($_REQUEST["d_save_date1"] != "" && $_REQUEST["d_save_date2"] != "") {
			$con	.= " AND b.d_doc BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_save_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_save_date2"]}'+' 23:59:59',102)";
		}
 	}
 
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC,b.imp_request_vsn_dtl_id ASC) AS numrow
					,a.imp_request_vsn_hdr_id 
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.c_period_no
					,a.c_code  
					,b.imp_request_vsn_dtl_id
					,b.c_request
					,b.c_request_desc
					,b.c_creditor
					,b.c_comment as c_comment_dtl
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
					,case 
						when (b.i_send_jv='1') then 'ไม่ระบุ'
						when (b.i_send_jv='2') then 'ไม่ลงบัญชี'
						when (b.i_send_jv='3') then 'ลงบัญชี' 
						else 'ไม่ระบุ'
					end as c_send_jv
					,case 
						when ((SELECT TOP 1 imp_request_vsn_dtl_id FROM temp_group_dtl_vsn jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id)>0) then 'จัดกลุ่มแล้ว รอบันทึกบัญชี'
						when (b.imp_group_request_vsn_dtl_id>0) then 'จัดกลุ่ม&บันทึกบัญชีแล้ว'+' ('+(SELECT jv.c_code_group FROM vw_imp_group_request_vsn_dtl_jv jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id)+')'
						else 'รอจัดกลุ่ม'
			  		 end as c_group_show 
					,(SELECT jv.c_gx_gl_code FROM vw_imp_group_request_vsn_dtl_jv jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id) as c_gx_gl_code
					,case 
 						when (b.i_status='8') then (select top 1 c_cancel_reason from imp_cancel_request where imp_cancel_request_id=b.imp_cancel_request_id)
						when (b.i_status='9') then (select top 1 c_cancel_reason from imp_cancel_request where imp_cancel_request_id=b.imp_cancel_request_id)+' : '+(select isnull(v.c_code_post,v.c_code) from gl_tran_hdr v where v.gl_tran_hdr_id=(select gl_tran_hdr_id_cancel from imp_cancel_request  where imp_cancel_request_id=b.imp_cancel_request_id))
 						else NULL
					end as c_cancel_reason
					,(SELECT bg.c_name FROM dc_expense_budget_type bg WHERE bg.dc_expense_budget_type_id =a.dc_expense_budget_type_id) as c_budget_type_name
				FROM imp_request_vsn_hdr a INNER JOIN imp_request_vsn_dtl b ON a.imp_request_vsn_hdr_id=b.imp_request_vsn_hdr_id
				where  left(a.c_code,1)='I' and a.i_enable = 1  
					{$con}
				ORDER BY a.c_code DESC,b.imp_request_vsn_dtl_id ASC;";
				 
	$stmt = $db->QueryParam($sqlMain, array());
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["imp_request_vsn_dtl_id"], 
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_period_no"						=> ($row["c_period_no"] != "")? $row["c_period_no"] : "",
							"c_code"							=> $row["c_code"],
							"c_request"							=> $row["c_request"],
							"c_request_desc"					=> $row["c_request_desc"],
							"c_creditor"						=> $row["c_creditor"],
							"c_comment"							=> $row["c_comment_dtl"],
							"f_inv"								=> $row["f_inv"],
							"d_doc_dtl"							=> ($row["d_doc_dtl"] != "")? $date->extDateBuddha($row["d_doc_dtl"]) : "",
							"i_type_request"					=> $row["i_type_request"],
							"c_type_request"					=> $row["c_type_request"],
							"i_status"							=> $row["i_status"],
							"c_status_dtl"						=> $row["c_status_dtl"],
							"c_name_vendor_by_id"				=> $row["c_name_vendor_by_id"],
							"c_send_jv"							=> $row["c_send_jv"],
							"c_group_show"						=> $row["c_group_show"],
							"c_gx_gl_code"						=> $row["c_gx_gl_code"],
							"c_cancel_reason"					=> $row["c_cancel_reason"],
							"c_budget_type_name"				=> $row["c_budget_type_name"]							
 						);
			
			$rowCounts++;
			
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts, $root=>${$root}));
	exit;
	
}
?>