<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php"); 
include("../conf/configAR.php");
###################
$db 	= new DatabaseServer();
$mon 	= new mon(); // convert floatval
$date 	= new i_date();
$util	= new apiUtil();
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "ar_so_hdr";
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"]; 
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "DESC"; }
if (!$util->get($sort)) {  	$sort 	= "b.d_doc_date"; }
###################
$sta = array(0=>"แก้ไข",
		2=>"ปกติ",
		3=>"ไม่สมบูรณ์",
		"" =>"เลือกทั้งหมด");
	
	$wh = null;
 
 if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
 {
		$orderType = array('-1'=>"", 'i_is_imc'=>" and {$table}.i_is_imc=1 ", '{$table}.i_is_barter'=>" and {$table}.i_is_barter=1 "); 
		
 
		$d_begin_dateID = substr(@$_REQUEST["d_begin_dateID"],0,10);
		$d_end_dateID 	= substr(@$_REQUEST["d_end_dateID"],0,10);
		
		
		$wh .=" {$table}.i_type_region=".AR_PROCUT_TYPE_CENTER
                        ." AND isnull({$table}.i_no_order,0)!=1 AND {$table}.i_class_type=".AR_CLASS_TYPE_RADIO." and b.d_doc_date between ? and ?";
		
		$arrParam[] 	= $d_begin_dateID;
		$arrCountParam[]= $d_begin_dateID;
		
		$arrParam[] 	= $d_end_dateID;
		$arrCountParam[]= $d_end_dateID;
		
 
		
		$value = @$_REQUEST['value'];
		if($value!=''){
                    
                    if($_REQUEST['filter']=='cnt_name'){
                        $wh .=" and dc_cnt_id in (select dc_cnt_id from dc_cnt where c_name like ?)";
			$arrParam[] ="%{$value}%";	
			$arrCountParam[] = "%{$value}%";
                    }else{
                        $wh .=" and ".$_REQUEST['filter']." like ?";
			$arrParam[] ="%{$value}%";	
			$arrCountParam[] = "%{$value}%"; 
                    } 	
		}
	 	
	}else{ 
 	 	
		$wh = " {$table}.i_type_region=".AR_PROCUT_TYPE_CENTER
                        ." AND isnull({$table}.i_no_order,0)!=1 AND {$table}.i_class_type=".AR_CLASS_TYPE_RADIO." and ISNULL({$table}.i_enable,".STATUS_DISABLE.") != ?";
		$arrParam[] 		= STATUS_DISABLE;
		$arrCountParam[]	= STATUS_DISABLE;		
	}  
	$sqlTempTable = "select {$table}.{$table}_id 
                            , isnull(b.ar_adjust_so_hdr_id,0) as ar_adjust_so_hdr_id
                            , isnull(b.c_code,'0') as adj_code
                            , convert(varchar, b.d_doc_date, 120) as adj_d_doc_date 
                            , b.c_comment as adj_c_comment
                            , isnull(b.i_new_ar_so_hdr_id,0) as i_new_ar_so_hdr_id
                            , isnull(b.i_is_status,0) as adj_i_is_status 
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_cost_id) as c_cost_name 
                            ,{$table}.dc_cost_id
                            ,(select top 1 c_name from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_name
                            ,(select top 1 c_code from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_code
                            , {$table}.dc_cnt_id  
                            ,(select top 1 c_code+' '+c_name from pj_hdr where pj_hdr_id={$table}.pj_hdr_id) as pj_name
                            ,{$table}.pj_hdr_id
                            ,{$table}.c_name
                            ,isnull({$table}.c_code,0) as c_code 
                            ,{$table}.c_comment 
                            ,{$table}.c_billing_inv_des
                            ,{$table}.i_is_commit
                            ,{$table}.i_group_type
                            ,{$table}.i_enable
                            ,{$table}.c_so_no 
                            ,{$table}.c_po_no
                            ,isnull({$table}.i_is_sale_external,0) as i_is_sale_external
                            ,case when {$table}.i_is_sale_external = 1 then 
                                            (select top 1 c_code+' '+c_name+' '+position from vw_dc_comm_cost2 where dc_comm_id=ar_so_hdr.dc_comm_id)
                                    ELSE 
                                            (select top 1 c_code+' '+c_name+' '+position from vw_dc_comm_cost2 where dc_comm_id=ar_so_hdr.dc_comm_id)
                            END as commit_name
                            ,{$table}.bh_contract_id
                            ,{$table}.i_cont
                            ,{$table}.dc_comm_id 
                            ,{$table}.c_advertising    
                            ,isnull({$table}.i_is_barter,0) as i_is_barter 
                            ,isnull({$table}.i_is_imc,0) as i_is_imc
                            ,isnull({$table}.i_is_status,0) as i_is_status
                            ,{$table}.onair_yyyy_mm
                            , convert(varchar, {$table}.d_doc_date, 120) as d_doc_date 
                            , convert(varchar, {$table}.d_so_date, 120) as d_so_date 
                            ,(select top 1 c_full_name from dc_user where dc_user_id=b.dc_user_create_id) as c_create_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id=b.dc_user_create_cost_id) as c_cost_creat_name
                            , convert(varchar, b.d_create, 120) as d_create
                            ,(select top 1 c_full_name from dc_user where dc_user_id=b.dc_user_update_id) as c_update_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id=b.dc_user_update_cost_id) as c_cost_update_name
                            , convert(varchar, b.d_update, 120) as d_update
                            
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} 
                    inner join ar_adjust_so_hdr b on b.ar_so_hdr_id = {$table}.ar_so_hdr_id  
                        
                    where {$wh} ".$util->viewAcc($i_read,$table); 
$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
$arrParam[] = $start;
$arrParam[] = $limit;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;

$f_pj_amt = 0;
$f_dtl_amt = 0;
        
while($row =$db->Fetch($stmt))				
{
	 if($row["i_is_imc"]==0 && $row["i_is_barter"]==0){
		$order_type = '-1'; 
	 }else if($row["i_is_imc"]==1 && $row["i_is_barter"]==0){
		$order_type = "i_is_imc";  
      
	 }else if($row["i_is_imc"]==0 && $row["i_is_barter"]==1){
		$order_type = "i_is_barter";  
	 } 
         
        $f_pj_amt   = @$db->GetDataBySQL("select isnull(f_tv_amt,0) from pj_hdr where isnull(i_enable,2) = 1 and pj_hdr_id=?", array($row['pj_hdr_id']));
        $f_dtl_amt  = @$db->GetDataBySQL("select sum(isnull(f_net_cost,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=?", array($row['ar_so_hdr_id']));

        $row["adj_code"] = ($row["adj_code"]!='')?$row["adj_code"]:0;
        
        $chkPerEdit = ($row["adj_code"])?1:0;
        $chkPerDel  = ($row["adj_code"])?1:0;    

	$temp = array("no" => ($i++), 
                    "id"                        => intval($row["ar_adjust_so_hdr_id"]),
                    "ar_so_hdr_id"              => intval($row["{$table}_id"]), 
                    "c_code"                    => $row["c_code"],
                    "ar_adjust_so_hdr_id"       => $row["ar_adjust_so_hdr_id"],
                    "adj_code"                  => $row["adj_code"],
                    "adj_c_comment" 		=> $row["adj_c_comment"],
                    "adj_d_doc_date" 		=> $date->extDateBuddha($row["adj_d_doc_date"]),
                    "adj_i_is_status" 	=> $row["adj_i_is_status"],        //สถานะการแก้ไข 1=ยกเลิก , 0=แก้ไข       
                    "i_new_ar_so_hdr_id" 	=> $row["i_new_ar_so_hdr_id"],
                    "txtar_so_hdr_idID"  => $row["c_code"]." ".$row["c_cnt_name"],
                            
                    "c_name" 		=> $row["c_name"], 
                    "c_advertising"     => $row["c_advertising"], 
                    "dc_comm_id"        => $row["dc_comm_id"], 
                    "f_pj_amt"          => floatval($f_pj_amt),
                    "f_dtl_amt"         => floatval($f_dtl_amt), 
                    "i_group_type"      => $row["i_group_type"],
                    "order_type"        => $order_type,
                    "txtso_hdr_idID"    => $row["c_code"]." ".$row["c_cnt_name"],       
                    "delID"  => ($chkPerEdit)?'':'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',
                    "editID" => ($chkPerDel)?'':'<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>',	
                             
                    "txtdc_emp_idID" 	=> $row["i_is_sale_external"]?null:$row["commit_name"], 
                    "dc_emp_id"		=> $row["i_is_sale_external"]?null:$row["dc_comm_id"],
                    "txtdc_ext_idID" 	=> $row["i_is_sale_external"]?$row["commit_name"]:null,  
                    "dc_ext_id"		=> $row["i_is_sale_external"]?$row["dc_comm_id"]:null,

                    "c_cost_name" 	=> $row["c_cost_name"]?$row["c_cost_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cost_id"]."]</span>", 
                    "dc_cost_id" 	=> $row["dc_cost_id"],
                    "txtpj_hdr_idID" 	=> $row["pj_name"],//?$row["pj_name"]:"ไม่มีข้อมูลรหัส[".$row["pj_hdr_id"]."]", 
                    "pj_hdr_id"		=> $row["pj_hdr_id"],
                    "is_status"		=> $sta[$row["i_is_status"]],
                    "txtdc_cnt_idID" 	=> $row["c_cnt_name"]?$row["c_cnt_code"]." ".$row["c_cnt_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]", //frm
                    "c_cnt_name" 	=> $row["c_cnt_name"]?$row["c_cnt_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]</span>", //grid				
                    "dc_cnt_id" 	=> $row["dc_cnt_id"],
                    "c_so_no" 		=> $row["c_so_no"],
                    "c_po_no" 		=> $row["c_po_no"], 
                    "i_is_imc" 		=> $row["i_is_imc"],
                    "i_is_barter" 		=> $row["i_is_barter"],
                    "i_is_sale_external" => $row["i_is_sale_external"],
                    "onair_yyyy_mm" 	=> $row["onair_yyyy_mm"]?(@$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543)):null,
                    "onair_mm"			=>substr($row["onair_yyyy_mm"],4,2),
                    "onair_yyyy"		=>substr($row["onair_yyyy_mm"],0,4),
                    "c_comment" 		=> $row["c_comment"],
                    "c_billing_inv_des" => $row["c_billing_inv_des"],
                    "i_enable" 			=> $row["i_enable"], 
                    "i_is_commit" 		=> $row["i_is_commit"],
                    "bh_contract_id" 	=> $row["bh_contract_id"],
                    "i_cont" 			=> $row["i_cont"],
                    "d_doc_date" 		=>$date->extDateBuddha($row["d_doc_date"]),
                    "d_so_date" 		=>$date->extDateBuddha($row["d_so_date"]),
                    "dc_user_create_id" 	=>$row["c_create_name"],
                    "dc_user_create_cost_id" 	=>$row["c_cost_creat_name"],
                    "d_create" 			=>$date->extDateBuddha($row["d_create"]),
                    "dc_user_update_id" 	=>$row["c_update_name"],
                    "dc_user_update_cost_id" 	=>$row["c_cost_update_name"],
                    "d_update" 			=>$date->extDateBuddha($row["d_update"])
            );
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("success"=>"success","totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>