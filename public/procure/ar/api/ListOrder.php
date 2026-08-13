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
if (!$util->get($sort)) {  	$sort 	= "d_doc_date"; }
###################
$sta = array(0=>"แก้ไข",
		2=>"ปกติ",
		3=>"ไม่สมบูรณ์",
		"" =>"เลือกทั้งหมด");
	
	$wh = null;
 
if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
{
		$orderType = array('-1'=>"", 'i_is_imc'=>" and i_is_imc=1 ", 'i_is_barter'=>" and i_is_barter=1 "); 
		
 
		$d_begin_dateID = substr(@$_REQUEST["d_begin_dateID"],0,10);
		$d_end_dateID 	= substr(@$_REQUEST["d_end_dateID"],0,10);
 
		$arrParam[] 	= $d_begin_dateID;
		$arrCountParam[]= $d_begin_dateID;
		
		$arrParam[] 	= $d_end_dateID;
		$arrCountParam[]= $d_end_dateID; 
		$value = @$_REQUEST['value'];
                
		if($value!=''){
                    
                    if($_REQUEST['filter']=='creditor_name'){
                        $wh .=" and dc_creditor_id in (select dc_creditor_id from NMU.dbo.dc_creditor where c_name like ?)";
			$arrParam[] ="%{$value}%";	
			$arrCountParam[] = "%{$value}%";
                    }else{
                        $wh .=" and ".$_REQUEST['filter']." like ?";
			$arrParam[] ="%{$value}%";	
			$arrCountParam[] = "%{$value}%"; 
                    } 	
		}
         if($_REQUEST['month']!=-1 && $_REQUEST['year']!=-1){
                $wh .=" and onair_yyyy_mm = ?";
                $arrParam[] = (intval($_REQUEST['year'])-543)."".$_REQUEST['month'];	
                $arrCountParam[] = $_REQUEST['year']."".$_REQUEST['month'];
                        
                        
         }	
        if($_REQUEST['i_group_type']!=-1){
                $wh .=" and i_group_type = ?";
                $arrParam[] = $_REQUEST['i_group_type'];	
                $arrCountParam[] = $_REQUEST['i_group_type'];      
         }	
         if($_REQUEST['i_is_status']!=-1){
                $wh .=" and isnull(i_is_status,2) = ?";
                $arrParam[] = $_REQUEST['i_is_status'];	
                $arrCountParam[] = $_REQUEST['i_is_status'];      
         }	
}else{ 

        $wh = " ISNULL(i_enable,".STATUS_DISABLE.") = ?";
        $arrParam[] 		= STATUS_ENABLE;
        $arrCountParam[]	= STATUS_ENABLE;			
} 
	
	$sqlTempTable = "select {$table}_id 
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_cost_id) as c_cost_name 
                            ,dc_cost_id
                            ,(select top 1 c_name from NMU.dbo.dc_creditor where dc_creditor_id={$table}.dc_creditor_id) as c_creditor_name
                            ,(select top 1 c_code from NMU.dbo.dc_creditor where dc_creditor_id={$table}.dc_creditor_id) as c_creditor_code
                            , dc_creditor_id  

                            ,c_name
                            ,isnull(c_code,0) as c_code 
                            ,c_comment
                            ,i_enable
                            ,c_po_no
                            , convert(varchar, d_doc_date, 120) as d_doc_date 
                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                            , convert(varchar, d_create, 120) as d_create
                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                            , convert(varchar, d_update, 120) as d_update 
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} 
                    where {$wh} ".$util->viewAcc($i_read);
/*  echo  $sqlTempTable; print_r($arrParam);
 exit; */

$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
$arrParam[] = $start;
$arrParam[] = $limit;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;


$f_dtl_amt = 0;
        
while($row =$db->Fetch($stmt))				
{
        $f_dtl_amt  = @$db->GetDataBySQL("select sum(isnull(f_net_cost,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=?", array($row['ar_so_hdr_id']));

        $row["c_code"] = ($row["c_code"]!='')?$row["c_code"]:0;
        
        $chkPerEdit = ($row["c_code"])?1:0;
        $chkPerDel  = ($row["c_code"])?1:0;    

	$temp = array("no" => ($i++), 
                    "id" 		=> $row["{$table}_id"],
                    "ar_so_hdr_id"      => $row["{$table}_id"],
                    "c_code" 		=> $row["c_code"],
                    "c_name" 		=> $row["c_name"], 
                    "f_dtl_amt"         =>floatval($f_dtl_amt), 

                            
                    "delID"  => ($chkPerEdit)?'':'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',
                    "editID" => ($chkPerDel)?'':'<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>',	

                    "c_cost_name" 	=> $row["c_cost_name"]?$row["c_cost_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cost_id"]."]</span>", 
                    "dc_cost_id" 	=> $row["dc_cost_id"],
                    "is_status"		=> $sta[$row["i_is_status"]],
                    "txtdc_creditor_idID" 		=> $row["c_creditor_name"]?$row["c_creditor_code"]." ".$row["c_creditor_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_creditor_id"]."]", //frm
                    "c_creditor_name" 			=> $row["c_creditor_name"]?$row["c_creditor_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_creditor_id"]."]</span>", //grid				
                    "dc_creditor_id" 			=> $row["dc_creditor_id"],
                    "c_po_no" 					=> $row["c_po_no"], 
                    "c_comment" 				=> $row["c_comment"],
                    "i_enable" 					=> $row["i_enable"], 
                    "d_doc_date" 				=>$date->extDateBuddha($row["d_doc_date"]),
                    "dc_user_create_id" 		=>$row["c_create_name"],
                    "dc_user_create_cost_id" 	=>$row["c_cost_creat_name"],
                    "d_create" 					=>$date->extDateBuddha($row["d_create"]),
                    "dc_user_update_id" 		=>$row["c_update_name"],
                    "dc_user_update_cost_id" 	=>$row["c_cost_update_name"],
                    "d_update" 					=>$date->extDateBuddha($row["d_update"])
            );
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("success"=>"success","totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>