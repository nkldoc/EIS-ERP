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
$table	= "ar_bill_invoice_dtl";
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
if (!$util->get($sort)) {  	$sort 	= "{$table}.ar_bill_invoice_dtl_id"; }
###################
 
 if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETDATA")
 { 
        // $wh = (isset($_REQUEST['mn']) && $_REQUEST['mn']=='editso')?"":" and isnull(i_enable,2) = 1"; //show i_enable= 0
                
		$sqlTempTable = "select {$table}.ar_bill_invoice_dtl_id
                                                            ,{$table}.ar_bill_invoice_hdr_id 
                                                            ,{$table}.ar_so_dtl_id 
                                                            ,{$table}.dc_tax_id 
															,{$table}.f_tax_amt
                                                            ,{$table}.f_unit_cost 
															,{$table}.f_total_cost
                                                            ,{$table}.f_net_cost  
                                                            ,{$table}.i_receive 
                                                            ,{$table}.c_comment  
                                                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                                                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                                                            , convert(varchar, {$table}.d_create, 120) as d_create
                                                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                                                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                                                            , convert(varchar, {$table}.d_update, 120) as d_update 
                                                    , ROW_NUMBER() OVER (ORDER BY {$table}.ar_bill_invoice_dtl_id asc) as row FROM {$table} 
                                    where {$table}.ar_bill_invoice_hdr_id=?"; 			
	$arrParam       = array($_REQUEST['id']);
	$arrCountParam 	= array($_REQUEST['id']);
 
	$sqlMain	= "select 
		b.f_quan as f_quan, 
		c.c_name as c_name,
		a.* from ({$sqlTempTable}) a 
	inner join ar_so_dtl b on b.ar_so_dtl_id=a.ar_so_dtl_id 
	inner join dc_product c on c.dc_product_id=b.dc_product_id
	";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
 
    $soBill = 0;
	$f1 = null; $f2 = null; 
	$arrStatus = array(null=>"ยังไม่รับเงิน",1=>"รับเงินแล้ว");
	while($row =$db->Fetch($stmt))				
	{
//
                $billing = $so->dtlBilling($row["{$table}_id"]);
                $soBill+=$billing;
                        $temp = array("no" => ($i++), //accessData =view  
						"id" 		=> $row["{$table}_id"],
						"soDtlID" 			=>'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',                            
						"soDtlEditID"   	=> null,
						"i_receive" 		=> $row['i_receive'],
						"c_receive" 		=> $arrStatus[$row['i_receive']],
						"c_name" 			=> $row['c_name'],
						"c_comment" 		=> $row['c_comment'], 
						"f_tax_amt"			=> number_format($row["f_tax_amt"],2),
						"f_total_cost" 		=> number_format($row["f_total_cost"],2), 
						"f_quan"			=> number_format($row["f_quan"],2),
						"f_unit_cost"		=> number_format($row["f_unit_cost"],2), 						
						"f_net_cost" 		=> number_format($row["f_net_cost"],2), 
 
						"dc_user_create_id" 	=>$row["c_create_name"],
						"dc_user_create_cost_id" =>$row["c_cost_creat_name"],
						"d_create" 		=>$date->extDateBuddha($row["d_create"]),
						"dc_user_update_id" 	=>$row["c_update_name"],
						"dc_user_update_cost_id" =>$row["c_cost_update_name"],
						"d_update" 		=>$date->extDateBuddha($row["d_update"])
					);
		${$root}[] = $temp; 
		$f1 += $row["f_total_cost"];
		$f2 += $row["f_tax_amt"];  

		
		// f_total_cost f_vat_amt f_net_cost f_tax_amt
	}
	$vat_rate 			= $db->GetDataBySQL("select f_vat_rate from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?",array($_REQUEST['id']));           
	$f_vat_amt 			= $mon->round54($f1*$vat_rate/100,2);
	$f_net_cost_add_vat = ($f1+$f_vat_amt); 
	$f_net_cost 		= $f_net_cost_add_vat-$f2; 
	
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal',  
						"f_total_cost" 			=> number_format($f1,2), 
						"f_net_cost_add_vat"	=> number_format($f_net_cost_add_vat,2), 
						"f_net_cost" 			=> number_format($f_net_cost,2),   
						"f_tax_amt" 			=> number_format($f2,2),
						"f_vat_amt" 			=> number_format($f_vat_amt,2), 
						"f_unit_cost" 			=> "รวม" 
					);
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
}else{
	echo "Invalid GETDATA";
}
?>