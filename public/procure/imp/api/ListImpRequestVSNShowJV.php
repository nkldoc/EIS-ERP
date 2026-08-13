<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/database/apiUtil.php");
 
###############################################################
$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();
###############################################################

$root	= "data";
$data	= array();

$con		= null;
$mode		= @$_REQUEST["mode"];
$i_read		= @$_REQUEST["i_read"];
$type 		= @$_REQUEST["type"];
$d_begin 	= (!get(@$_REQUEST["d_begin_dateID"])) ? date("Y-m-d", mktime(0, 0, 0, (date('m')-1), 1, date('Y'))) : substr($_REQUEST["d_begin_dateID"],0, 10);
$d_end		= (!get(@$_REQUEST["d_end_dateID"])) ? date("Y-m-d") : substr($_REQUEST["d_end_dateID"],0, 10);

$limit 	= @$_REQUEST["limit"];
$start 	= @$_REQUEST["start"];

$filter = @$_REQUEST["filter"];
$value 	= @$_REQUEST["value"];
if (!get($start))	{ $start	= 0; }
if (!get($limit))	{ $limit	= 20; }else{ $limit=($limit+$start); }

if($type == "HDR") {

	$where = "";
	$arrParam = array();
	$arrCountParam =  array();
	
	
	
	if ($mode == "SEARCH")
	{
		$arrParam[] = $d_begin;
		$arrParam[] = $d_end;
		
		if($_REQUEST['i_enable']!=0){
			
			$where .= " and a.i_enable = ?";
			$arrParam[] = $_REQUEST['i_enable'];
		}
		
		if($value!=''){
			$where .= " and isnull({$filter},'') like '%'+?+'%'";
			$arrParam[] = $value;
		}
		
	}else{
		
		$arrParam[] = $d_begin;
		$arrParam[] = $d_end; 
		$where .= " and a.i_enable = ?";
		$arrParam[] = 1;

	}
	
	$arrCountParam =  $arrParam;
	$arrParam[] = $start;
	$arrParam[] = $limit;
	$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY d_doc_date) as row_id
						, imp_group_request_vsn_hdr_id as hdr_id
						, c_code
						, c_doc
						, gl_tran_hdr_id
						, (select isnull(c_code_post,c_code) from gl_tran_hdr where gl_tran_hdr_id=a.gl_tran_hdr_id and i_enable=1 and left(c_code,1)='G') as c_jv_code
						, (select i_is_post from gl_tran_hdr where gl_tran_hdr_id=a.gl_tran_hdr_id and i_enable=1 and left(c_code,1)='G' ) as i_is_post_jv
					  	, convert(varchar(10), d_doc_date, 120) as d_doc_date
						, dc_cost_acc_id
						, c_comment
						, i_enable
						, gl_process_creditor_log_id 
						, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
						, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
						, convert(varchar(10), d_create, 120) as d_create
						, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
						, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
						, convert(varchar, [d_update], 120) as d_update
						, (select SUM(nn.f_inv) from imp_group_request_vsn_dtl nn where nn.imp_group_request_vsn_hdr_id=a.imp_group_request_vsn_hdr_id) as f_money
						, case when (a.i_enable='1') then 'ใช้งาน' else 'ไม่ใช้งาน'  end as c_enabled
					from imp_group_request_vsn_hdr a
					where d_doc_date between ? and ?".$where;

	$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row_id > ? and a.row_id <= ? order by a.row_id";
 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
  
	while($row =$db->Fetch($stmt))				
	{
		$strDocDate = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : "";
	
        // $row["c_jv_code"] = ($row["c_jv_code"]==null)?'0':$row["c_jv_code"];
        
		// if($row["c_jv_code"]=='0' && $row["i_enable"]==1){
			
		// 	 $edit = '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>'; 
		// 	 $del = '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>';
		 
		// }else{  
		// 	$edit = ''; 
		// 	$del = ($row["i_enable"]==2)?'':'<img src="../images/icons/control_remove.png" style="cursor:pointer"/>'; 
		// }
		
		$edit = ''; 
		if ($row["i_enable"]==1)
		{
			if ($row["i_is_post_jv"]=="3")
			{ //GL
				$del = '';
			}
			else if ($row["i_is_post_jv"]=="2")
			{ //GX 
				$del = '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>';
			}
			else
			{  //รายการรอลงบัญชี
				$del = '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>';
			}
		}
		else
		{ 
			$del = ($row["i_enable"]==2)?'':'<img src="../images/icons/control_remove.png" style="cursor:pointer"/>'; 
		}

		$temp = array("no" => ($i++), 
						"id" => $row["hdr_id"],
						"delID"  => $del,
						"editID" => $edit,	
						"c_code" => $row["c_code"],
						"c_doc" => $row["c_doc"],
						"gl_tran_hdr_id" => $row["gl_tran_hdr_id"],
						"c_jv_code" => $row["c_jv_code"],
						"i_is_post_jv" => $row["i_is_post_jv"], 
						"d_doc_date" => $date->extDateBuddha($row["d_doc_date"]), 
						"dc_cost_acc_id" => $row["dc_cost_acc_id"], 
						"c_comment" => $row["c_comment"],  
						"i_enable" => $row["i_enable"],
						"gl_process_creditor_log_id " => $row["gl_process_creditor_log_id"],
						"dc_user_create_id" =>$row["c_create_name"],
						"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
						"d_create" =>$date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" =>$row["c_update_name"],
						"dc_user_update_cost_id" =>$row["c_cost_update_name"],
						"d_update" =>$date->extDateBuddha($row["d_update"]),
						"f_money" => $row["f_money"],
						"c_enabled" => $row["c_enabled"],
						
					);
		${$root}[] = $temp;
	}
} else if($type == "DTL") {
	$sqlMain = "select  
					b.imp_group_request_vsn_dtl_id
					,b.imp_group_request_vsn_hdr_id
					,b.imp_request_vsn_dtl_id
					,b.dc_acc_id
					,b.f_inv 
					,b.c_budget_year
					,b.i_type_year
					,b.i_cal_gl
					,a.c_request
					,a.c_request_desc 
					,convert(varchar(10), a.d_doc, 120) as d_doc
					,a.c_creditor
					,a.c_comment
					,c.c_code as c_code_imp
					,c.c_period_no as c_doc
				from imp_group_request_vsn_dtl b 
					INNER JOIN imp_request_vsn_dtl a ON b.imp_request_vsn_dtl_id = a.imp_request_vsn_dtl_id
					INNER JOIN imp_request_vsn_hdr c ON c.imp_request_vsn_hdr_id = a.imp_request_vsn_hdr_id
				where b.imp_group_request_vsn_hdr_id=?
				ORDER BY a.c_request_desc,a.c_request";
	
	$arrParam[]	= $_REQUEST["id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i =1;
	$sum_m = 0.00;
	$sum_c = 0.00;
	while($row =$db->Fetch($stmt))
	{
		$strDate = ($row["d_doc"] != "")? $date->shot_date_from_db($row["d_doc"]) : "";
	 
		$temp = array(	"no"				=> $i,
						"id"				=> $i,
						"strDate"			=> $strDate,
						"c_request"			=> $row["c_request"],
						"c_request_desc"	=> $row["c_request_desc"],
						"product_name"		=> $row["c_comment"],
						"c_creditor"		=> $row["c_creditor"],
						"c_code_imp"		=> $row["c_code_imp"],
						"c_doc"				=> $row["c_doc"],  
						"rcptamt"			=> number_format($row["f_inv"],2) 
		);
		${$root}[] = $temp;
		$sum_m += $row["f_inv"];
		$i++;
	}
	
	$temp = array(	"no"			=> $i,
					"id"			=> $i,
					"strDate"		=> '',
					"product_name"	=> '<span style="font-weight:bold;">จำนวนเงินที่ตั้งหนี้และลงบัญชีทั้งหมด</span>',
					"rcptamt"		=> '<span style="font-weight:bold;border-bottom: 3px double #000;">'.number_format($sum_m,2).'</span>',
					 
	);
	${$root}[] = $temp;
	$i++;
	
	// $temp = array(	"no"			=> $i,
	// 				"id"			=> $i,
	// 				"strDate"		=> '',
	// 				"product_name"	=> '<span style="font-weight:bold;">จำนวนเงินที่ยกเลิก</span>',
	// 				"rcptamt"		=> '<span style="font-weight:bold;border-bottom: 3px double #000;">'.number_format($sum_c,2).'</span>',
					 
	// );
	// ${$root}[] = $temp;
	$i++;
	
	$sum_net = $sum_m - $sum_c;
	// $temp = array(	"no"			=> $i,
	// 				"id"			=> $i,
	// 				"strDate"		=> '',
	// 				"product_name"	=> '<span style="font-weight:bold;">จำนวนเงินสุทธิ</span>',
	// 				"rcptamt"		=> '<span style="font-weight:bold;border-bottom: 3px double #000;">'.number_format($sum_net,2).'</span>',
					 
	// );
	// ${$root}[] = $temp;
	
	echo json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
	exit;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>