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
									, b.c_name as product_name
									, b.c_code as product_code
									,(select top 1 isnull(c_code,'0') as c_code from ar_so_hdr where ar_so_hdr_id=ar_so_dtl.ar_so_hdr_id) as c_code 
									,{$table}.i_billing
									,{$table}.i_seq
									,{$table}.f_unit_cost
									,{$table}.f_quan
									,{$table}.f_total_cost
									,{$table}.c_comment 
									,{$table}.i_enable 
									,(select top 1 dc_tax_id from dc_tax_def where dc_product_group_id=b.dc_product_group_id) as dc_tax_id
									,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
									,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
									, convert(varchar, {$table}.d_create, 120) as d_create
									,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
									,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
									, convert(varchar,{$table}.d_update, 120) as d_update 
								, ROW_NUMBER() OVER (ORDER BY {$table}.i_seq asc) as row FROM {$table} 
								inner join vw_dc_product b on b.dc_product_id={$table}.dc_product_id
						where {$table}.ar_so_hdr_id=? and isnull({$table}.i_enable,2) = 1 and i_billing is null       
						";
                                                                
		  
	$arrParam       = array($_REQUEST['id']);
	$arrCountParam 	= array($_REQUEST['id']);
 
/*  echo $sqlTempTable; print_r($arrParam); exit;
 */ 
	$sqlMain	= "select *
			,(select top 1 f_tax_rate from dc_tax where dc_tax_id=a.dc_tax_id) as f_tax_rate

	from ({$sqlTempTable}) a";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
 
    $soBill = 0;
	$proBilling = 0;
	$f_total_cost = null;
	$f_net_costTotal   = null;
	$f_tax_amtTotal   = null;
	
	while($row =$db->Fetch($stmt))				
	{
/* 	$proBilling = $db->GetDataBySQL("select count(*) from ar_bill_invoice_dtl a "
			. "inner join ar_bill_invoice_hdr b on b.ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id and b.ar_so_hdr_id=? "
			. "where i_enable = 1 
			and a.ar_so_dtl_id=?", array($_REQUEST['id'],$row["ar_so_dtl_id"])); */
//
                $billing = $so->dtlBilling($row["{$table}_id"]);
                $soBill+=$billing;
				
				$del = 1;	//($row["i_receive"]==1)?0:1;	
				$edit = 1;	//($row["i_receive"]==1)?0:1;
			
			
			$f_tax_amt = ($row["f_total_cost"]*$row["f_tax_rate"])/100;
			$f_net_cost = $row["f_total_cost"]-$f_tax_amt;
			
			/* $jsonDtl = array(	"id" 			=> $row["{$table}_id"],
								"dc_tax_id" 	=> $row["dc_tax_id"], 
								"f_net_cost" 	=> $f_net_cost, 
								"f_tax_amt" 	=> $f_tax_amt
							);  */
			$temp = array("no" => ($i++), 
						"id" => $row["{$table}_id"],
						"soDtlID" =>($del)?'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>':'', 
						"soDtlEditID"   =>($edit)?'<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>':'', 
					    "soDtlBIlling"   =>($proBilling>0)?'': '<label><div><input type="checkbox" onclick="this.checked=true" checked="true" name="soDtl[]" value="'.$row["{$table}_id"].'"></div><label>',   
					    "billing"    			=> $billing?'วางบิลแล้ว':'', 
						"soBill"     			=>$soBill>0?1:0, //so billing         
						"c_code" 				=> $row["product_code"],
						"c_name" 				=> $row["product_name"],
						"txtdc_product_idID"	=>	$row["product_code"]." ".$row["product_name"],	
						"dc_product_id" 		=>  $row["dc_product_id"],
						"c_comment" 			=>'<textarea name="comment'.$row["{$table}_id"].'" rows="2" cols="12">'.$row["c_comment"].'</textarea>',//$row["c_comment"],
                  
						"i_seq" 				=> $row["i_seq"],     
						"i_enable" 				=> $row["i_enable"],  
						"f_quan" 				=> number_format($row["f_quan"],2), 
						"f_unit_cost" 			=> number_format($row["f_unit_cost"],2),  
						"f_total_cost" 			=> number_format($row["f_total_cost"],2), 
						"f_net_cost" 			=> number_format($f_net_cost,2), 
						"f_tax_rate" 			=> number_format($row["f_tax_rate"],2), 
						"f_tax_amt" 			=> number_format($f_tax_amt,2)
 
					);
		${$root}[] = $temp;
		
 		$f_tax_amtTotal 		+= $f_tax_amt;
		$f_total_cost 			+= $row["f_total_cost"];  
		$f_net_costTotal 		+= $f_net_cost;//$mon->round54(,2);
		 
	}
	
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal',  
						"f_total_cost" 		=> number_format($f_total_cost,2),
						"f_tax_amt"			=> number_format($f_tax_amtTotal,2),  
						"f_net_cost" 		=> number_format($f_net_costTotal,2),	    
						"f_unit_cost" 		=> "รวม"  
					);
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
}else{
	echo "Invalid GETDATA";
}
?>