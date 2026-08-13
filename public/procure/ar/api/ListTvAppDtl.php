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
$table	= "ar_onair_dtl";
/* 	$tab 		="ar_onair_dtl";
	$key_fld	="ar_onair_dtl_id"; */
	
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
if (!$util->get($dir))	{       $dir 	= "DESC"; }
if (!$util->get($sort)) {  	$sort 	= "{$table}.ar_onair_dtl_id"; }
###################
 
 if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETDATA")
 { 
    
		$sqlTempTable = "select {$table}.ar_onair_dtl_id
                                                        ,{$table}.ar_onair_hdr_id
							,{$table}.ar_bill_invoice_dtl_id
							,{$table}.ar_so_dtl_id
							,{$table}.ar_so_period_id
                                                        ,{$table}.dc_cnt_id   
							,(select top 1 c_name from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_name
                                                        ,(select top 1 c_code from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_code
                                                        ,(select sum(f_net_disc_com_amt) from ar_onair_dtl_so where ar_onair_dtl_id={$table}.ar_onair_dtl_id) as f_net_disc_com_amt    
                                                        ,(select sum(f_disc_cash_amt) from ar_onair_dtl_so where ar_onair_dtl_id={$table}.ar_onair_dtl_id) as f_disc_cash_amt    
                                                        ,(select sum(f_net_cost) from ar_onair_dtl_so where ar_onair_dtl_id={$table}.ar_onair_dtl_id) as f_net_cost    
							,isnull({$table}.i_is_onair,0) i_is_onair 
							,{$table}.c_comment
							,{$table}.i_enable   
							,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
							,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
							, convert(varchar, d_create, 120) as d_create
							,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
							,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
							, convert(varchar, [d_update], 120) as d_update 
						, ROW_NUMBER() OVER (ORDER BY {$sort} {$dir}) as row FROM {$table}
                                                 
				where {$table}.ar_onair_hdr_id=?";
 			
	$arrParam       = array($_REQUEST['id']);
	$arrCountParam 	= array($_REQUEST['id']);

	$sqlMain	= "select * from ({$sqlTempTable}) a ";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
        
	$i = $start + 1;
 
	$f1 = null;$f2 = null;$f3 = null;$f4 = null;$f5 = null;$f6 = null;
	$f_bal = null;
        $soBill = 0;
        $onair_arr = array(0=>"<span style='color:red'>ไม่ยืนยันรายได้</span>",1=>"<span style='color:blue'>ยืนยันรายได้</span>");
	while($row =$db->Fetch($stmt))				
	{
//
 
                           $temp = array("no" => ($i++), //accessData =view  
						"id" 		=> $row["{$table}_id"],
						"soDtlID" =>(isset($_REQUEST["right"]) && $_REQUEST["right"]=='view')?'':'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',        
                                                "txtdc_cnt_idID"    => $row["c_cnt_name"]?$row["c_cnt_code"]." ".$row["c_cnt_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]", //frm
                                                "c_cnt_name"        => $row["c_cnt_name"]?$row["c_cnt_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]", //grid				
                                                "dc_cnt_id"         => $row["dc_cnt_id"],
                                                        
						"c_comment"         => $row["c_comment"],    
						"i_enable"          => $row["i_enable"], 
 
                                                "c_is_onair"           => $onair_arr[$row['i_is_onair']],        
						"f_net_disc_com_amt"   => number_format($row["f_net_disc_com_amt"],2), 
						"f_disc_cash_amt"	=> number_format($row["f_disc_cash_amt"],2), 
						"f_net_cost" 		=> number_format($row["f_net_cost"],2), 
                                               
						"dc_user_create_id" 	=>$row["c_create_name"],
						"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
						"d_create" 		=>$date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" 	=>$row["c_update_name"],
						"dc_user_update_cost_id" =>$row["c_cost_update_name"],
						"d_update" 		=>$date->extDateBuddha($row["d_update"])
					);
		${$root}[] = $temp;
		$f1 += $row["f_net_disc_com_amt"];
		$f2 += $row["f_disc_cash_amt"];
		$f3 += $row["f_net_cost"];
 	
	}
	
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal', 
						"c_name" 	=> '',   
						"c_comment" 	=> '', 
                                                
						"i_is_jingle" 		=> $row["i_is_jingle"], 
						"f_quan" 			=> "รวม", 
						"f_net_disc_com_amt" 		=> number_format($f1,2), 
						"f_disc_cash_amt"	=> number_format($f2,2), 
						"f_net_cost"	=> number_format($f3,2),
 
					); 
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root})); 
}else{
	echo "Invalid GETDATA";
}
?>                                                  