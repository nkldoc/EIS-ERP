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

if( $_REQUEST["type"] == "imp_request_vsn_dtl" ) {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
 
	if($mode == "SEARCH") {
		
		if($_REQUEST["filter"] != "") {
			$con	.= " AND b.".$_REQUEST["filter"]." LIKE '%".@$_REQUEST["value"]."%' ";
		}
		if($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND b.d_doc BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
		
	}

	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY  a.c_code,b.c_request_desc DESC) AS numrow
					,a.imp_request_vsn_hdr_id
					,b.imp_request_vsn_dtl_id
					,NULL as  c_gx_code
					,a.c_code
					,b.c_request
					,b.c_request_desc
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,b.c_comment
					,ISNULL((select sum(dd.f_dr) from imp_request_vsn_item dd where dd.imp_request_vsn_dtl_id=b.imp_request_vsn_dtl_id ),0)  as f_dr_1_request
					,ISNULL((select sum(dd.f_cr) from imp_request_vsn_item dd where dd.imp_request_vsn_dtl_id=b.imp_request_vsn_dtl_id ),0)  as f_cr_1_request
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
						when (b.i_send_jv='1') then 'ไม่ระบุ'
						when (b.i_send_jv='2') then 'ไม่ลงบัญชี'
						when (b.i_send_jv='3') then 'ลงบัญชี' 
						else 'ไม่ระบุ'
					end as c_send_jv
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
					,CONVERT(VARCHAR, b.d_doc, 120) AS d_doc
 				INTO #TemData
				FROM imp_request_vsn_hdr a
					INNER JOIN imp_request_vsn_dtl b ON a.imp_request_vsn_hdr_id = b.imp_request_vsn_hdr_id
				WHERE
					ISNULL(a.gl_tran_hdr_rq_id,0)=0 
					AND a.i_type_request=1 
					AND a.c_code IS NOT NULL AND a.i_enable = ".STATUS_ENABLE."
					{$con}

				SELECT * FROM #TemData a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow
				
				SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["imp_request_vsn_dtl_id"],
							"hdr_id"							=> $row["imp_request_vsn_hdr_id"],
							"c_gx_code"							=> ($row["c_gx_code"] != "")? $row["c_gx_code"] : "",
							"c_code"							=> ($row["c_code"] != "")? $row["c_code"] : "",
							"c_request"							=> $row["c_request"],
							"c_request_desc"					=> $row["c_request_desc"],
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_comment"							=> $row["c_comment"],
							"f_dr"								=> $row["f_dr_1_request"],
							"f_cr"								=> $row["f_cr_1_request"],
							"i_status"							=> $row["i_status"],
							"c_status_dtl"						=> $row["c_status_dtl"],
							"c_send_jv"							=> $row["c_send_jv"], 
							"i_group_show"						=> $row["i_group_show"],
							"c_group_show"						=> $row["c_group_show"],
							"c_gx_gl_code"						=> $row["c_gx_gl_code"],
							"d_doc"								=> ($row["d_doc"] != "")? $date->extDateBuddha($row["d_doc"]) : "",
			);
			
			${$root}[] = $temp;
		}
	}
	
	$db->NextResult( $stmt );
	$rowCounts=$db->Fetch( $stmt );
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts["rowCounts"], $root=>${$root}));
	exit;
	
} else if( $_REQUEST["type"] == "imp_request_vsn_item" ) {
	
	$totalCount	= 0;
	
	$sqlMain = "SET NOCOUNT ON
				SELECT 	b.imp_request_vsn_item_id
						,b.imp_request_vsn_dtl_id
						,b.imp_request_vsn_hdr_id
						,b.dc_acc_id 
						,b.f_dr
						,b.f_cr
						,b.c_comment
						,b.c_budget_year
						,b.i_type_year
						,b.i_cal_gl 
						,CONVERT(VARCHAR, a.d_doc, 120) AS d_doc 
						,e.c_code +' '+e.c_name as c_acc_full
						,b.c_acc_code_imp
						,b.c_acc_name_imp
				FROM imp_request_vsn_dtl a
					INNER JOIN imp_request_vsn_item b ON a.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id
					LEFT JOIN vw_dc_acc e ON b.dc_acc_id = e.dc_acc_id
				WHERE a.imp_request_vsn_dtl_id = ?
				ORDER BY b.i_type_show,b.i_rank_dr;";
	//echo $sqlMain;exit;
	$arrParam[]	= $_REQUEST["imp_request_vsn_dtl_id"];
 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$arr	= array();
	if( sqlsrv_has_rows( $stmt ) ) {
		
		$arr["f_dr"]					= 0;
		$arr["f_cr"]					= 0; 

		while( $row = $db->Fetch( $stmt ) ) {
				
			++$totalCount;
				
			$temp = array(
					"imp_request_vsn_item_id"		=> $row["imp_request_vsn_item_id"],
					"imp_request_vsn_dtl_id"		=> $row["imp_request_vsn_dtl_id"],
					"imp_request_vsn_hdr_id"		=> $row["imp_request_vsn_hdr_id"],
					"dc_acc_id"						=> $row["dc_acc_id"],
					"f_dr"							=> $row["f_dr"],
					"f_cr"							=> $row["f_cr"], 
					"c_comment"						=> $row["c_comment"],
					"c_budget_year"					=> $row["c_budget_year"],
					"i_type_year"					=> $row["i_type_year"],
					"i_cal_gl"						=> $row["i_cal_gl"], 
					"d_doc"							=> ($row["d_doc"] != "")			? $date->extDateBuddha($row["d_doc"]) 	: "",
					"acc_full"						=> ($row["c_acc_full"] != "")		? $row["c_acc_full"]					: "",
					"c_acc_code_imp"				=> ($row["c_acc_code_imp"] != "")	? $row["c_acc_code_imp"]				: "",
					"c_acc_name_imp"				=> ($row["c_acc_name_imp"] != "")	? $row["c_acc_name_imp"]				: ""
			);
			
			$arr["f_dr"]				+= $row["f_dr"];
			$arr["f_cr"]				+= $row["f_cr"]; 
				
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}, "arr"=>$arr));
	exit;
	
}
?>