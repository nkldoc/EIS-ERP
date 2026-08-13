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
                
		$sqlTempTable = "select {$table}.ar_so_dtl_id
									,{$table}.ar_so_hdr_id
									,{$table}.dc_product_id 
									,(select top 1 c_name from dc_product where dc_product_id=case when ar_so_dtl.dc_product_id>0 then ar_so_dtl.dc_product_id else ar_so_dtl.dc_product_radio_id end) as product_name
									,(select top 1 c_code from dc_product where dc_product_id=case when ar_so_dtl.dc_product_id>0 then ar_so_dtl.dc_product_id else ar_so_dtl.dc_product_radio_id end) as product_code
									,(select top 1 isnull(c_code,'0') as c_code from ar_so_hdr where ar_so_hdr_id=ar_so_dtl.ar_so_hdr_id) as c_code 
									,{$table}.dc_unit_type_id
									,{$table}.dc_product_radio_id
									,{$table}.c_set_name
									,{$table}.c_break_name
									,{$table}.i_seq
									,{$table}.i_is_packet
									,{$table}.f_total_cost
									,{$table}.f_unit_cost
									,{$table}.f_quan
									,{$table}.f_disc_com
									,{$table}.f_disc_cash
									,{$table}.f_net_cost
									,{$table}.d_onair_date
									,{$table}.d_instalm_date
									,{$table}.d_begin_date
									,{$table}.d_end_date
									,{$table}.spot_code
									,{$table}.c_spot_name
									,{$table}.c_reason
									,{$table}.dc_radio_station_id
									,isnull({$table}.i_is_jingle,0) as i_is_jingle
									,{$table}.f_disc_com_amt
									,{$table}.f_disc_cash_amt
									,{$table}.parent_id
									,{$table}.onair_yyyy_mm
									,{$table}.dc_cost_id 
									,{$table}.c_comment 
									,{$table}.i_enable 
									,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
									,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
									, convert(varchar, {$table}.d_create, 120) as d_create
									,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
									,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
									, convert(varchar,{$table}.d_update, 120) as d_update 
								, ROW_NUMBER() OVER (ORDER BY {$table}.i_seq asc) as row FROM {$table} 
								inner join dc_product b on b.dc_product_id={$table}.dc_product_id
						where {$table}.ar_so_hdr_id=? and b.dc_product_type_id=? and isnull({$table}.i_enable,2) = 1
                                                
						";
                                                                
		  
	$arrParam       = array($_REQUEST['id']);
	$arrCountParam 	= array($_REQUEST['id']);
	
	$arrParam[]       = $_REQUEST['dc_product_type_id'];
	$arrCountParam[]  = $_REQUEST['dc_product_type_id'];
        
    /* echo $sqlTempTable; print_r($arrParam); exit;      */
 
	$sqlMain	= "select * from ({$sqlTempTable}) a";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
	$type =array("0"=>"สปอตโฆษณา","1"=>"รายการแถม/จิงเกิ้ล");

	$f1 = null; $f2 = null; $f3 = null; $f4 = null; $f5 = null; $f6 = null;
	$f_bal = null;
        $soBill = 0;

	while($row =$db->Fetch($stmt))				
	{
                $proBilling = $db->GetDataBySQL("select count(*) from ar_bill_invoice_dtl a "
                        . "inner join ar_bill_invoice_hdr b on b.ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id and b.ar_so_hdr_id=? "
                        . "where i_enable = 1 and a.ar_so_dtl_id=?", array($_REQUEST['id'],$row["ar_so_dtl_id"]));
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
						
                                               "soDtlBIlling"   =>($proBilling>0)?'':'<label><div><input type="checkbox" name="soDtl[]" value="'.$row["{$table}_id"].'"></div><label>',   
                                               "billing"    => $billing?'วางบิลแล้ว':'', 
                                                "soBill"     =>$soBill>0?1:0, //so billing         
						"c_code" 	=> $row["product_code"],
						"c_name" 	=> $row["product_name"],
						"txtdc_product_idID"=>	$row["product_code"]." ".$row["product_name"],	
						"dc_product_id"		=>$row["dc_product_id"],
						"c_comment" =>'<textarea name="comment'.$row["{$table}_id"].'" rows="2" cols="12">'.$row["c_comment"].'</textarea>',//$row["c_comment"],
                                                "i_seq" => $row["i_seq"],     
						"i_enable" 		=> $row["i_enable"], 
						"i_is_jingle" 		=> $row["i_is_jingle"], 
						"f_quan" 		=> number_format($row["f_quan"],2), 
						"f_total_cost" 		=> number_format($row["f_total_cost"],2), 
						"f_disc_com_amt"	=> number_format($row["f_disc_com_amt"],2), 
						"f_disc_cash_amt_bal"	=> number_format($mon->round54($row["f_total_cost"]-$row["f_disc_com_amt"],2),2),
						"f_disc_com" 		=> number_format($row["f_disc_com"],2), 
						"f_disc_cash" 		=> number_format($row["f_disc_cash"],2), 
						"f_disc_cash_amt"	=> number_format($row["f_disc_cash_amt"],2), 
						"f_net_cost" 		=> number_format($row["f_net_cost"],2), 
						"c_type" 		=> $type[@$row["i_is_jingle"]],  
						"dc_user_create_id" 	=>$row["c_create_name"],
						"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
						"d_create" 		=>$date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" 	=>$row["c_update_name"],
						"dc_user_update_cost_id" =>$row["c_cost_update_name"],
						"d_update" 		=>$date->extDateBuddha($row["d_update"])
					);
		${$root}[] = $temp;
		$f1 += $row["f_total_cost"];
		$f2 += $row["f_disc_com_amt"];
		$f3 += $row["f_disc_com"];
		$f4 += $row["f_disc_cash"];
		$f5 += $row["f_disc_cash_amt"];
		$f6 += $row["f_net_cost"];
		
		$f_bal += $mon->round54($row["f_total_cost"]-$row["f_disc_com_amt"],2);
		
	}
	
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal', 
						"c_name" 	=> '',   
						"c_comment" 	=> '', 
                                                "i_seq"         => 10000,   
						"i_is_jingle" 		=> $row["i_is_jingle"], 
						"f_quan" 			=> "รวม", 
						"f_total_cost" 		=> number_format($f1,2), 
						"f_disc_com_amt"	=> number_format($f2,2), 
						"f_disc_cash_amt_bal"	=> number_format($f_bal,2),
						"f_disc_com" 		=> number_format($f3,2), 
						"f_disc_cash" 		=> number_format($f4,2), 
						"f_disc_cash_amt"	=> number_format($f5,2), 
						"f_net_cost" 		=> number_format($f6,2)  
					);
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
}else{
	echo "Invalid GETDATA";
}
?>