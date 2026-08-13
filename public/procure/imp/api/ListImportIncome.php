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
	$sqlTempTable = "select ROW_NUMBER() OVER (ORDER BY d_doc_date, c_point_receive_name, c_receive_period_no) as row_id
						, imp_receive_hdr_id
						, c_code
						, isnull(c_gx_code,'') as c_gx_code
						, case when c_gx_code is null then 0 else (select top 1 gl_tran_hdr_id from gl_tran_hdr where c_code = a.c_gx_code) end as gl_tran_hdr_id
						, dc_period_id
						, isnull((select c_name from vw_dc_period where dc_period_id = a.dc_period_id), '') as period_name
						, dc_receive_point_id
						, isnull((select c_name from vw_dc_receive_point where dc_receive_point_id = a.dc_receive_point_id), '') as receive_point_name
						, c_receive_name
						/*, c_receive_period_no
						, c_point_receive_name*/
						, convert(varchar(10), d_doc_date, 120) as d_doc_date
						, c_comment
						, i_enable
						, i_post
						, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
						, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
						, convert(varchar(10), d_create, 120) as d_create
						, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
						, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
						, convert(varchar, [d_update], 120) as d_update
					from imp_receive_hdr a
					where d_doc_date between ? and ?".$where.$util->viewAcc($i_read);
 /*
echo $sqlTempTable;
print_r($arrParam);exit;*/
	$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row_id > ? and a.row_id <= ? order by a.row_id";
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
 function enabledDelete($c_gx_code){
	global $db;
	$ret = $db->GetDataBySQL("select i_enable from gl_tran_hdr where c_code=?", array($c_gx_code)); 
	 
	
	if ($ret==2) return true; 
	else return false; 
}	
 
	while($row =$db->Fetch($stmt))				
	{
		$strDocDate = ($row["d_doc_date"] != "")? $date->shot_date_from_db($row["d_doc_date"]) : "";
	
        $row["c_gx_code"] = ($row["c_gx_code"]==null)?'0':$row["c_gx_code"];
        
		if($row["c_gx_code"]=='0' && $row["i_enable"]==1){
			
			 $edit = '<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>'; 
			 $del = '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>';
		 
		}else{
			
			
			$edit = ''; 
			$del = ($row["i_enable"]==2)?'':'<img src="../images/icons/control_remove.png" style="cursor:pointer"/>';
 
		}
		$temp = array("no" => ($i++), 
						"id" => $row["imp_receive_hdr_id"],
						"delID"  => $del,
						"editID" => $edit,	
						"c_code" => $row["c_code"],
						"c_gx_code" => $row["c_gx_code"],
						"gl_tran_hdr_id" => $row["gl_tran_hdr_id"],
						"dc_period_id" => $row["dc_period_id"],
						"period_name" => $row["period_name"],
						"dc_receive_point_id" => $row["dc_receive_point_id"],
						"receive_point_name" => $row["receive_point_name"],
						"c_receive_name" => $row["c_receive_name"],
						/*
						"c_receive_period_no" => $row["c_receive_period_no"],
						"c_point_receive_name" => $row["c_point_receive_name"],*/
						"d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
						"str_date"	=> $strDocDate,
						"c_comment" => $row["c_comment"],
						"i_enable" => $row["i_enable"],
						"i_post" => $row["i_post"],
						"dc_user_create_id" =>$row["c_create_name"],
						"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
						"d_create" =>$date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" =>$row["c_update_name"],
						"dc_user_update_cost_id" =>$row["c_cost_update_name"],
						"d_update" =>$date->extDateBuddha($row["d_update"])
					);
		${$root}[] = $temp;
	}
} else if($type == "DTL") {
	$sqlMain = "select isnull(convert(varchar(10), rmttdate, 120),'') as rmttdate
					, [name] as product_name
					, rcptamt
					, isnull(convert(varchar(10), canceldate, 120),'') as canceldate
				from imp_receive_dtl
				where imp_receive_hdr_id=?";
	
	$arrParam[]	= $_REQUEST["id"];
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i =1;
	$sum_m = 0.00;
	$sum_c = 0.00;
	while($row =$db->Fetch($stmt))
	{
		$strDate = ($row["rmttdate"] != "")? $date->shot_date_from_db($row["rmttdate"]) : "";
		if ($row["canceldate"] != "")
		{
			$strCDate = $date->shot_date_from_db($row["canceldate"]);
			$sum_c += $row["rcptamt"];
		}else
			$strCDate = "";
		
		$temp = array(	"no"			=> $i,
						"id"			=> $i,
						"strDate"		=> $strDate,
						"product_name"	=> $row["product_name"],
						"rcptamt"		=> number_format($row["rcptamt"],2),
						"strCDate"      => $strCDate
		);
		${$root}[] = $temp;
		$sum_m += $row["rcptamt"];
		$i++;
	}
	
	$temp = array(	"no"			=> $i,
					"id"			=> $i,
					"strDate"		=> '',
					"product_name"	=> '<span style="font-weight:bold;">จำนวนเงินที่นำเข้าทั้งหมด</span>',
					"rcptamt"		=> '<span style="font-weight:bold;border-bottom: 3px double #000;">'.number_format($sum_m,2).'</span>',
					"strCDate"      => ''
	);
	${$root}[] = $temp;
	$i++;
	
	$temp = array(	"no"			=> $i,
					"id"			=> $i,
					"strDate"		=> '',
					"product_name"	=> '<span style="font-weight:bold;">จำนวนเงินที่ยกเลิก</span>',
					"rcptamt"		=> '<span style="font-weight:bold;border-bottom: 3px double #000;">'.number_format($sum_c,2).'</span>',
					"strCDate"      => ''
	);
	${$root}[] = $temp;
	$i++;
	
	$sum_net = $sum_m - $sum_c;
	$temp = array(	"no"			=> $i,
					"id"			=> $i,
					"strDate"		=> '',
					"product_name"	=> '<span style="font-weight:bold;">จำนวนเงินสุทธิ</span>',
					"rcptamt"		=> '<span style="font-weight:bold;border-bottom: 3px double #000;">'.number_format($sum_net,2).'</span>',
					"strCDate"      => ''
	);
	${$root}[] = $temp;
	
	echo json_encode(array("debug"=>true, "totalCount"=>$i, $root=>${$root}));
	exit;
}

$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>