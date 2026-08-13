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
$table		= "vw_ar_onair_hdr";
$keyfiled 	= "ar_onair_hdr_id";
$root		= "data";
$data		= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"]; 
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "DESC"; }
if (!$util->get($sort)) {  	$sort 	= "c_code"; }
###################
$sta = array(0=>"แก้ไข",
		2=>"ปกติ",
		3=>"ไม่สมบูรณ์",
		"" =>"เลือกทั้งหมด");
	
	$wh = null;
               
                
if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
{
        $d_begin_dateID = substr($_REQUEST["d_begin_dateID"],0,10);
	$d_end_dateID 	= substr($_REQUEST["d_end_dateID"],0,10);
                
	$wh = " d_onair_date between ? and ?";
        $wh .= " AND isnull(i_is_imc,0)=0 AND i_is_tv=".AR_CLASS_TYPE_TV." AND ISNULL(i_enable,".STATUS_DISABLE.") = 1";
		
		$arrParam[] 	= $d_begin_dateID;
		$arrCountParam[]= $d_begin_dateID;
		
		$arrParam[] 	= $d_end_dateID;
		$arrCountParam[]= $d_end_dateID; 
		
		$value = @$_REQUEST['value'];
                
		if($value!=''){
 
            $wh .=" and ".$_REQUEST['filter']." like ?";
			$arrParam[] ="%{$value}%";	
			$arrCountParam[] = "%{$value}%"; 
     
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

        $wh = " d_onair_date between ? and ?";
        $wh .= " AND isnull(i_is_imc,0)=0 AND i_is_tv=".AR_CLASS_TYPE_TV." AND ISNULL(i_enable,".STATUS_DISABLE.") = 1";

        $d_begin_dateID = $date->bc_to_ad($_REQUEST["d_begin_dateID"]);
	$d_end_dateID 	= $date->bc_to_ad($_REQUEST["d_end_dateID"]);
                
        $arrParam[] 	= $d_begin_dateID;
        $arrCountParam[]= $d_begin_dateID;

        $arrParam[] 	= $d_end_dateID;
        $arrCountParam[]= $d_end_dateID; 
		
} 
 
	$sqlTempTable = "select {$keyfiled}   
                            , isnull(c_code,'0') as c_code
                            , isnull(c_area_code,'0') as c_area_code 
                            , i_enable
                            , i_is_tv
                            , i_is_imc
                            , c_comment
                            , dc_cost_id
                            , dc_comm_id 
                            ,(select top 1 c_name from dc_comm where dc_comm_id={$table}.dc_comm_id) as c_comm_name
                            ,(select top 1 c_code from dc_comm where dc_comm_id={$table}.dc_comm_id) as c_comm_code  
                            , onair_yyyy_mm
                            , isnull(i_is_barter,0) as i_is_barter
                            , name_comm
                            , name_comm1   
                            , convert(varchar, d_onair_date, 120) as d_onair_date  
                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                            , convert(varchar, d_create, 120) as d_create
                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                            , convert(varchar, d_update, 120) as d_update 
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} 
                    where {$wh} ".$util->viewAcc($i_read);
 
$sqlMain	= "select * from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
$arrParam[] = $start;
$arrParam[] = $limit;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
 
$arr_Enabled = array(1=>"<span style='color:blue'>ใช้งาน</span>",2=>"<span style='color:red'>ไม่ใช้งาน</span>");    

while($row =$db->Fetch($stmt))				
{ 
    if($row["i_is_barter"]==1) $c_barter ="<font color=blue> แลกเปลี่ยน";
    else $c_barter ="ปกติ";
                                
	$temp = array("no" => ($i++), 
                    "id" 		=> $row["{$keyfiled}"], 
                    "c_code" 		=> $row["c_code"],
                    "c_area_code"       => $row["c_area_code"], 
                    "dc_comm_id"       => $row["dc_comm_id"],  
                    "i_is_tv"       => $row["i_is_tv"], 
                    "i_is_imc"       => $row["i_is_imc"], 
                    "c_barter"       => $c_barter,       
                    "i_enable"       => $arr_Enabled[$row["i_enable"]],  
                    "onair_yyyy_mm" 	=> $row["onair_yyyy_mm"]?(@$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543)):null,
                    "onair_mm"          =>substr($row["onair_yyyy_mm"],4,2),
                    "onair_yyyy"        =>substr($row["onair_yyyy_mm"],0,4),
                    "i_onair_yyyy_mm" 	=> $row["onair_yyyy_mm"],                
                    "txtdc_comm_idID"    => $row["c_comm_name"]?$row["c_comm_code"]." ".$row["c_comm_name"]:"", //frm
                    "c_comm_name"        => $row["c_comm_name"]?$row["c_comm_name"]:"", //grid				
                    "dc_comm_id"         => $row["dc_comm_id"], 
                    "i_is_barter"       => $row["i_is_barter"],
                    "name_comm"         => $row["name_comm"], 
                    "name_comm1"        => $row["name_comm1"], 
                    "c_comment"        => $row["c_comment"],         
                    "d_onair_date"              =>$date->extDateBuddha($row["d_onair_date"]),
                    "dc_user_create_id"         =>$row["c_create_name"],
                    "dc_user_create_cost_id" 	=>$row["c_cost_creat_name"],
                    "d_create"                  =>$date->extDateBuddha($row["d_create"]),
                    "dc_user_update_id"         =>$row["c_update_name"],
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