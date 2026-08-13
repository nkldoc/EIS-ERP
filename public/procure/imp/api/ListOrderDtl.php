<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../../lib/mon/mon.class.php");
include("./class/status.class.php");
 
###################
$db 	= new DatabaseServer();
$so	= new StatusOrder($db);
$mon 	= new mon(); // convert floatval
$date 	= new i_date();
$util	= new apiUtil();
 
############################################################################################################
$mode	= @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value	= @$_REQUEST["value"];
$i_read	= @$_REQUEST["i_read"];
###################
$table	= "ar_so_dtl";
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
if (!$util->get($sort)) {  	$sort 	= "ar_so_dtl_id"; }
###################
 
 if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETDATA")
 { 
                $wh = (isset($_REQUEST['mn']) && $_REQUEST['mn']=='editso')?"":" and isnull(i_enable,2) = 1"; //show i_enable= 0
                
		$sqlTempTable = "select ar_so_dtl_id
									,ar_so_hdr_id
									,dc_product_id 
									,(select top 1 c_name from dc_product where dc_product_id=ar_so_dtl.dc_product_id) as product_name
									,(select top 1 c_code from dc_product where dc_product_id=ar_so_dtl.dc_product_id) as product_code
									,(select top 1 isnull(c_code,'0') as c_code from ar_so_hdr where ar_so_hdr_id=ar_so_dtl.ar_so_hdr_id) as c_code 
									,i_seq
									,f_unit_cost
									,f_total_cost 
									,f_quan  
									,c_comment 
									,i_enable 
									,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
									,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
									, convert(varchar, d_create, 120) as d_create
									,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
									,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
									, convert(varchar, [d_update], 120) as d_update 
								, ROW_NUMBER() OVER (ORDER BY i_seq asc) as row FROM {$table} 
						where ar_so_hdr_id=? {$wh}";
                                                                
		/* echo $sqlTempTable; print_r($arrParam); exit; */				
	$arrParam       = array($_REQUEST['id']);
	$arrCountParam 	= array($_REQUEST['id']);
        
        
 
	$sqlMain	= "select * from ({$sqlTempTable}) a ";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
	$type =array("0"=>"สปอตโฆษณา","1"=>"รายการแถม/จิงเกิ้ล");

	$f1 = null;$f2 = null;$f3 = null;$f4 = null;$f5 = null;$f6 = null;
	$f_bal = null;  $soBill = 0;

	while($row =$db->Fetch($stmt))				
	{
//
                $billing = $so->dtlBilling($row["{$table}_id"]);
                $soBill+=$billing;
                $temp = array("no" => ($i++), //accessData =view  
						"id" 		=> $row["{$table}_id"],
						
						"soDtlID" =>(($row["c_code"]=='0' && (isset($_REQUEST['accessData']) && $_REQUEST['accessData']=='edit')) 
						|| ((isset($_REQUEST['mn']) && $_REQUEST['mn']=='editso' && $billing==0 && $row['i_enable']==STATUS_ENABLE) && (isset($_REQUEST['accessData']) && $_REQUEST['accessData']=='edit'))
						)?'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>':'',
                                                        
						"soDtlEditID"   =>(($row["c_code"]=='0' && (isset($_REQUEST['accessData']) && $_REQUEST['accessData']=='edit')) 
						|| ((isset($_REQUEST['mn']) && $_REQUEST['mn']=='editso' && $billing==0 && $row['i_enable']==STATUS_ENABLE) && (isset($_REQUEST['accessData']) && $_REQUEST['accessData']=='edit'))
						)?'<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>':'',
                    
					   "billing"    => $billing?'วางบิลแล้ว':'', 
						"soBill"     =>$soBill>0?1:0, //so billing         
						"c_code" 	=> $row["product_code"],
						"c_name" 	=> $row["product_name"],
						"txtdc_product_idID"=>	$row["product_code"]." ".$row["product_name"],	
						"dc_product_id"		=>	$row["dc_product_id"],
						"c_comment" => $row["c_comment"],
                        "i_seq" => $row["i_seq"],     
						"i_enable" 		=> $row["i_enable"],  
						"f_quan" 			=> number_format($row["f_quan"],2), 
						"f_unit_cost" 		=> number_format($row["f_unit_cost"],2), 
						"f_total_cost" 		=> number_format($row["f_total_cost"],2),  
 						
 
					 
						"dc_user_create_id" 	=>$row["c_create_name"],
						"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
						"d_create" 		=>$date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" 	=>$row["c_update_name"],
						"dc_user_update_cost_id" =>$row["c_cost_update_name"],
						"d_update" 		=>$date->extDateBuddha($row["d_update"])
					);
		${$root}[] = $temp;
		$f1 += $row["f_quan"]; 
		$f2 += $row["f_unit_cost"]; 
		$f3 += $row["f_total_cost"]; 
		//$f_bal += $mon->round54($row["f_total_cost"]-$row["f_disc_com_amt"],2);

	}
	
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal', 
						"c_name" 	=> '',   
						"c_comment" 	=> '', 
                        "i_seq"         => 10000,   
						"f_quan" 			=> "<b>รวม</b>", 
						"f_total_cost" 		=> "<b>".number_format($f1,2)."</b>",  
						"f_unit_cost" 		=> "<b>".number_format($f2,2)."</b>",
						"f_total_cost" 		=> "<b>".number_format($f3,2)."</b>"						
					);
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
}else{
	echo "Invalid GETDATA";
}
?>