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

if( $_REQUEST["type"] == "imp_request_vsn_hdr_dtl_for_jv" ) {
	
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
					,ISNULL(b.imp_group_request_vsn_dtl_id,0) AS imp_group_request_vsn_dtl_id
					,ISNULL(b.imp_group_request_vsn_dtl_id,0) AS imp_group_request_vsn_dtl_id
					,ISNULL((select top 1 cc.imp_request_vsn_dtl_id from temp_group_dtl_vsn cc where cc.imp_request_vsn_dtl_id=b.imp_request_vsn_dtl_id),0) as n_temp
					,b.i_status
					,case 
						when (b.i_status='1') then 'รอส่งเบิก'
						when (b.i_status='2') then 'ส่งเบิกสมบูรณ์'
						when (b.i_status='3') then 'บันทึกบัญชีสมบูรณ์'
						when (b.i_status='8') then 'ยกเลิกจากการไม่ใช้งาน'
						when (b.i_status='9') then 'ยกเลิกใบเบิก(Reverse GX/GL)'
						else NULL
					end as c_status_dtl
					,case 
							when ((SELECT TOP 1 imp_request_vsn_dtl_id FROM temp_group_dtl_vsn jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id)>0) then 1
							when (b.imp_group_request_vsn_dtl_id>0) then 2
							else 0
					 end as i_group_show
					 ,case 
						when ((SELECT TOP 1 imp_request_vsn_dtl_id FROM temp_group_dtl_vsn jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id)>0) then 'จัดกลุ่มแล้ว รอบันทึกบัญชี'
						when (b.imp_group_request_vsn_dtl_id>0) then 'จัดกลุ่ม&บันทึกบัญชีแล้ว'+' ('+(SELECT jv.c_code_group FROM vw_imp_group_request_vsn_dtl_jv jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id)+')'
						else 'รอจัดกลุ่ม'
			  		 end as c_group_show 
					,(SELECT jv.c_gx_gl_code FROM vw_imp_group_request_vsn_dtl_jv jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id) as c_gx_gl_code
					,(SELECT jv.i_is_post FROM vw_imp_group_request_vsn_dtl_jv jv WHERE jv.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id) as i_is_post
					,(SELECT bg.c_name FROM dc_expense_budget_type bg WHERE bg.dc_expense_budget_type_id =a.dc_expense_budget_type_id) as c_budget_type_name

				FROM imp_request_vsn_hdr a INNER JOIN imp_request_vsn_dtl b ON a.imp_request_vsn_hdr_id=b.imp_request_vsn_hdr_id
				where LEFT(a.c_code,1)='I' and a.i_enable = 1 AND a.i_type_request = 1 AND b.i_status IN (2,3)
					and b.i_send_jv=3
					{$con}
				ORDER BY a.c_code DESC,b.imp_request_vsn_dtl_id ASC;";
  //echo $sqlMain;exit;
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
							"imp_group_request_vsn_dtl_id"		=> $row["imp_group_request_vsn_dtl_id"],
							"n_temp"							=> $row["n_temp"],
							"i_status"							=> $row["i_status"],
							"c_status_dtl"						=> $row["c_status_dtl"],
							"i_group_show"						=> $row["i_group_show"],
							"c_group_show"						=> $row["c_group_show"],
							"c_gx_gl_code"						=> $row["c_gx_gl_code"],
							"i_is_post"							=> $row["i_is_post"],
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