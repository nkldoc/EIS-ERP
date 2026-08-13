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
if (!$util->get($limit)) { 	$limit 	= 100000; }else{ $limit=($limit+$start); }
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
					,isnull({$table}.dc_product_id,(select dc_product_id from ar_so_dtl where ar_so_dtl_id={$table}.ar_so_dtl_id)) as dc_product_id													
					,{$table}.f_tax_amt
					,{$table}.f_unit_cost 
					,{$table}.f_total_cost
					,{$table}.f_disc_com
					,{$table}.f_net_cost  
					,{$table}.i_receive 
					,{$table}.c_comment  
					,{$table}.f_quan   
					,(select f_tax_rate from dc_tax where dc_tax_id={$table}.dc_tax_id) as f_tax_rate
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
 
	$sqlMain	= "select a.* 

	,(select top 1 c_name from dc_product where dc_product_id=a.dc_product_id) as c_name
	from ({$sqlTempTable}) a ";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
 
    $soBill = 0;
	$f1 = null; $f2 = null;  $f3 = null; $f4 = null; 
	$arrStatus = array(null=>"ยังไม่รับเงิน",1=>"รับเงินแล้ว");
	while($row =$db->Fetch($stmt))				
	{
//
                $billing = $so->dtlBilling($row["{$table}_id"]);
                $soBill+=$billing;
$c_commentID 	= '<textarea rows="1" cols="100" style=" width:88%;"  id="c_commentID'.$row["{$table}_id"].'" name="c_commentName'.$row["{$table}_id"].'">'.$row["c_comment"].'</textarea>';		

$f_total_costID = '<input type="text" value="'.number_format($row["f_total_cost"],2).'" style="border:0px; font-size:12px; width:80px; text-align:right;" autocomplete="off" id="f_total_costID'.$row["{$table}_id"].'" name="f_total_costName'.$row["{$table}_id"].'" readOnly="true">';

$f_disc_comID 	= '<input type="text" onclick="this.focus();" value="'.number_format($row["f_disc_com"],2).'" style="width:80px; text-align:right;" autocomplete="off" id="f_disc_comID'.$row["{$table}_id"].'" name="f_disc_comName'.$row["{$table}_id"].'" class="x-form-text x-form-field">';				
		
$f_tax_amtID 	= '<input type="text" readOnly="true" value="'.number_format($row["f_tax_amt"],2).'" style="width:80px; text-align:right;" autocomplete="off" id="f_tax_amtID'.$row["{$table}_id"].'" name="f_tax_amtName'.$row["{$table}_id"].'" class="x-form-text x-form-field">';				
		
$f_net_costID 	= '<input type="text" readOnly="true" value="'.number_format($row["f_net_cost"],2).'" style="width:80px; text-align:right;" autocomplete="off" id="f_net_costID'.$row["{$table}_id"].'" name="f_net_costName'.$row["{$table}_id"].'" class="x-form-text x-form-field">';				
$f_net_costID 	= '<input type="text" readOnly="true" value="'.number_format($row["f_net_cost"],2).'" style="width:80px; text-align:right;" autocomplete="off" id="f_net_costID'.$row["{$table}_id"].'" name="f_net_costName'.$row["{$table}_id"].'" class="x-form-text x-form-field">';				

$hidden 		= '<input type="hidden" id="f_tax_rateID'.$row["{$table}_id"].'" name="f_tax_rateName'.$row["{$table}_id"].'" value="'.$row["f_tax_rate"].'">';
$hidden 		.= '<input type="hidden" id="f_total_costID'.$row["{$table}_id"].'" name="f_total_costName'.$row["{$table}_id"].'" value="'.$row["f_total_cost"].'">';

                        $temp = array("no" => ($i++), //accessData =view  
						"id" 		=> $row["{$table}_id"],
						"soDtlID" 			=>'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',                            
						"soDtlEditID"   	=> null,
						"i_receive" 		=> $row['i_receive'],
						"c_receive" 		=> $arrStatus[$row['i_receive']],
						"c_name" 			=> $row['c_name'].$hidden,
						"c_comment" 		=> $row['c_comment'], 
						"f_tax_amt"			=> $f_tax_amtID,//number_format($row["f_tax_amt"],2), 
						"f_tax_rate" 		=> $row['f_tax_rate'],
						"f_disc_com" 		=> $f_disc_comID, 
						"c_comment" 		=> $c_commentID,
						"f_total_cost" 		=> $f_total_costID,//number_format($row["f_total_cost"],2), 
						"f_quan"			=> number_format($row["f_quan"],2),
						"f_unit_cost"		=> number_format($row["f_unit_cost"],2), 						
						"f_net_cost" 		=> $f_net_costID,//number_format($row["f_net_cost"],2), 
						
						"f_net_costVal" 	=>number_format($row['f_net_cost'],2),
						"f_disc_comVal" 	=>number_format($row['f_disc_com'],2),
						"f_tax_amtVal" 		=>number_format($row['f_tax_amt'],2),
						
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
		$f3 += $row["f_disc_com"];
		$f4 += $row["f_net_cost"];
		
		// f_total_cost f_vat_amt f_net_cost f_tax_amt
	}
	$vat_rate 			= $db->GetDataBySQL("select f_vat_rate from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id = ?",array($_REQUEST['id']));           
	$f_vat_amt 			= $mon->round54($f1*$vat_rate/100,2);
	$f_net_cost_add_vat = ($f1+$f_vat_amt); 
	$f_net_cost 		= $f_net_cost_add_vat-$f2; 
	$f_after_disc_amtID = $mon->round54($f1-$f3,2); 
	
	
	$ff = $db->GetDataBySQL("select * from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=?", array($_REQUEST['id']));
	//f_vat_amt f_net_cost_add_vat f_net_cost
	$f_net_add_vat = floatval($ff['f_net_cost']+$f2);
	$f_net_add_tax = floatval($f_net_add_vat-$f2);

	$f_disc_comSumID 	= '<input type="text" readOnly="true" id="f_disc_comSumID" value="'.number_format($f3,2).'" style="font-size:12px; width:80px;border:0px; text-align:right;" autocomplete="off"  name="f_disc_comSum">';				
	$f_tax_amtSumID 	= '<input type="text" readOnly="true" id="f_tax_amtSumID" value="'.number_format($f2,2).'" style="font-size:12px; width:80px;border:0px; text-align:right;" autocomplete="off"  name="f_tax_amtSum">';				
	$f_net_costSumID 	= '<input type="text" readOnly="true" id="f_net_costSumID" value="'.number_format($f4,2).'" style="font-size:12px; width:80px;border:0px; text-align:right;" autocomplete="off"  name="f_net_costSum">';				
 
	${$root}[] = array("no" => ($i++), 
						"id" 					=> 'grandTotal',  
						"f_total_cost" 			=> number_format($f1,2), 
						"f_net_cost_add_vat"	=> number_format($f_net_add_vat,2), 
						"f_net_cost" 			=> $f_net_costSumID,//number_format($ff['f_net_cost'],2),  
						"f_net_costFirst" 		=> number_format($ff['f_net_cost'],2),  
						"f_tax_amt" 			=> $f_tax_amtSumID,//number_format($f2,2),
						"f_tax_amtFirst" 		=> number_format($f2,2),
						"f_disc_com" 			=> $f_disc_comSumID,//number_format($f3,2),
						"f_disc_comFirst" 		=> number_format($f3,2),
						
						"f_after_disc_amtID" 	=> number_format($f_after_disc_amtID,2), 
						"f_vat_amt" 			=> number_format($ff['f_vat_amt'],2), 
						
						"f_unit_cost" 			=> "รวม" 
						
					);
 
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
}else{
	echo "Invalid GETDATA";
}
?>