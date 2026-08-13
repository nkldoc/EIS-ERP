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
$table	= "fi_receive_tran_dtl";
$root	= "data";
$data	= array();
###################
$limit 	= @$_REQUEST["limit"];
$dir 	= @$_REQUEST["dir"];
$sort 	= @$_REQUEST["sort"];
$start 	= @$_REQUEST["start"]; 
###################
if (!$util->get($start)) { 	$start 	= 0; }
if (!$util->get($limit)) { 	$limit 	= 100; }else{ $limit=($limit+$start); }
if (!$util->get($dir))	{   $dir 	= "ASC"; }
if (!$util->get($sort)) {  	$sort 	= "{$table}.ar_bill_invoice_dtl_id"; }
###################
  $typePrint = !isset($_REQUEST['typePrint']) || $_REQUEST['typePrint']==""?"":$_REQUEST['typePrint'];
 if($typePrint==""){
	 
	$dir 	= "DESC"; 
	$sort 	= "{$table}.ar_bill_invoice_dtl_id";  
	
 }else if($typePrint=="orderByProduct"){
	 
	$dir 	= "DESC"; 
	$sort 	= "b.dc_product_id";  
	
 }else if($typePrint=="noneGroup"){
	 
	$dir 	= "DESC"; 
	$sort 	= "b.dc_product_id";  
	
 }
 function FloatBillText($mon,$f_net_amt){
			$baht = substr(number_format($f_net_amt,2),-2);
			$total_conv = "";
			if ( $baht=="00")
				$total_conv = $mon->convertTxtBath(number_format($f_net_amt,2))."บาทถ้วน";
			else
				$total_conv = $mon->convertTxtBath(number_format($f_net_amt,2))."บาท".$mon->convertTxtSatang($baht)."สตางค์";
		return $total_conv_text 	= 	"(".$total_conv.")";  
	}// End Function
	
 function PayType(){
 global $db,$date,$mon,$util;
	$pay = null;
	$f1 = $db->GetDataBySQL("select *  
	, convert(varchar, d_cheq_date, 120) as d_cheq_date
	, (select c_name+' '+c_code from dc_bank_acc_company where dc_bank_acc_company_id=fi_receive_tran_hdr.dc_bank_acc_company_id) as c_account_bank
	, (select c_name from dc_bank where dc_bank_id=fi_receive_tran_hdr.dc_bank_id) as c_bank
	, (select c_name from dc_bank_branch where dc_bank_branch_id=fi_receive_tran_hdr.dc_bank_branch_id) as c_bank_branch
	from fi_receive_tran_hdr where fi_receive_tran_hdr_id = ?",array($_REQUEST['id']));           

	if($f1['fi_pymt_voucher_type_id']==1){ // เงินสด
		$pay = " เงินสด ";
	}else if($f1['fi_pymt_voucher_type_id']==2){ //เช็ค
	
		$pay = "เช็ค";
		$pay .= " เลขที่ ".$f1['c_cheq_code'];
		$pay .= " ธนาคาร ".$f1['c_bank'];
		$pay .= " สาขา ".$f1['c_bank_branch'];
		$pay .= " วันที่ออกเช็ค ".$date->long_date_from_db($f1['d_cheq_date']); 
		
	}else if($f1['fi_pymt_voucher_type_id']==3){ //โอนผ่านบัญชี
		$pay = "โอนผ่านบัญชี  ".$f1['c_account_bank'];
 
	}else if($f1['fi_pymt_voucher_type_id']==4){ //ใบสำคัญ (c)
		$pay = " ใบสำคัญ ";
	}
	return $pay;
 }	
 if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETDATA")
 { 
 
		$sqlTempTable = "select {$table}.fi_receive_tran_dtl_id 
		,{$table}.ar_bill_invoice_dtl_id  
		,{$table}.dc_product_id
		,{$table}.f_quan
		,{$table}.f_unit_cost
		,{$table}.f_total_cost
		,{$table}.f_disc_com
		,{$table}.f_disc_cash		
		,{$table}.f_net_cost 
		,{$table}.f_tax_amt   
		,{$table}.c_comment  
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, {$table}.d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, {$table}.d_update, 120) as d_update 
		, ROW_NUMBER() OVER (ORDER BY {$sort} {$dir}) as row 
		FROM {$table}  
		where {$table}.fi_receive_tran_hdr_id=?"; 	
		
	$arrParam       = array($_REQUEST['id']);
	$arrCountParam 	= array($_REQUEST['id']);
 
	$sqlMain	= "select a.*
	,(select top 1 c_name from dc_product where dc_product_id=a.dc_product_id) as c_name
	from ({$sqlTempTable}) a Order By a.ar_bill_invoice_dtl_id asc";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1; 
 
	while($row =$db->Fetch($stmt))				
	{
 
	$temp = array("no" => ($i++),  
			"id" 						=> $row["{$table}_id"], 
			"ar_bill_invoice_dtl_id"	=> $row["ar_bill_invoice_dtl_id"], 
			"c_name" => ""
			."<input type='hidden' name='f_unit_cost".$row["{$table}_id"]."' value='".$row["f_unit_cost"]."'>" 
			."<input type='hidden' name='f_quan".$row["{$table}_id"]."' value='".$row["f_quan"]."'>" 
			 
			."<input type='hidden' name='ar_bill_invoice_dtl_id[]' value='".$row["ar_bill_invoice_dtl_id"]."'>" 
			."<input type='hidden' name='fi_receive_tran_dtl_id[]' value='".$row["{$table}_id"]."'>" 
			."<input type='text' class='x-form-text x-form-field' style='font-size:12px;width:90%;margin:1px;' name='items".$row["{$table}_id"]."' value='".$row["c_name"]."'>"
			."<br/>"
			."<input type='text' class='x-form-text x-form-field' style='font-size:12px;width:90%;margin:0px;' name='c_comment".$row["{$table}_id"]."' id='c_commentForm".$row["{$table}_id"]."' value='".$row["c_comment"]."'>",
			"c_comment" 		=> $row['c_comment'],  
			"f_disc_com" 		=> $row['f_disc_com'], 
			"f_total_cost" 		=> "<input type='hidden' name='f_total_cost".$row["{$table}_id"]."' value='".$row["f_total_cost"]."'>".number_format($row["f_total_cost"],2), 
			"f_quan"			=> number_format($row["f_quan"],2),
			"f_unit_cost"		=> number_format($row["f_unit_cost"],2),
			"i_detail"			=> 1	
		);
 
		 ${$root}[] = $temp;
		//==================
		
	}//End Loop

	
	$due = "ชำระโดย  ".PayType(); 
	$payBy = "<input class='x-form-text x-form-field' type='text' style='font-size:12px;width:90%;margin:-2px;' name='c_invoice_item1' value='".$due."'>";
 
		
	$m = $db->json_clean_decode($_REQUEST['sumDtl']); //jsonText to Obj
	
	$total_conv_text = FloatBillText($mon,floatval(preg_replace('/[^\d.]/', '', $m->f_net_cost)));
	
	$f_after_disc_amt 	= floatval(preg_replace('/[^\d.]/', '', $m->f_after_disc_amt));
	$f_vat_amt 			= floatval(preg_replace('/[^\d.]/', '', $m->f_vat_amt)); 
	$f_net_cost_add_vat = number_format(($f_after_disc_amt+$f_vat_amt),2);
	
 
   
	${$root}[] = array("no" => ($i++),  "i_detail" => 0,
						"id" 		=> 'grandTotal', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'รวมทั้งหมด'.'</p>', 
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$m->f_total_cost."</p>"
						."<input type='hidden' name='f_total_cost_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $m->f_total_cost)))."'>"); 
 //จำนวนเงินหลังหักส่วนลด
	${$root}[] = array("no" => ($i++),  "i_detail" => 0,
						"id" 		=> 'grandTotal2', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'ส่วนลด'.'</p>', 
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$m->f_dis_amt."</p>"
						."<input type='hidden' id='grandTotal2' name='f_dis_amt_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $m->f_dis_amt)))."'>"); 
 //
	${$root}[] = array("no" => ($i++),  "i_detail" => 0,
						"id" 		=> 'grandTotal3', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'จำนวนเงินหลังหักส่วนลด'.'</p>', 
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$m->f_after_disc_amt."</p>"
						."<input type='hidden' id='grandTotal3' name='f_after_disc_amt_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $m->f_after_disc_amt)))."'>"); 
 

	${$root}[] = array("no" => ($i++), "i_detail" => 0,
						"id" 		=> 'grandTotal4', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'ภาษีมูลค่าเพิ่ม'.'</p>',   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$m->f_vat_amt."</p>" 
						."<input type='hidden' name='f_vat_amt_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $m->f_vat_amt)))."'>");

/* 	${$root}[] = array("no" => ($i++), "i_detail" => 0,
						"id" 		=> 'grandTotal4', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'จำนวนเงินรวมภาษีมูลค่าเพิ่ม'.'</p>',   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$m->f_net_cost_add_vat."</p>" 
						."<input type='hidden' name='f_vat_amt_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $m->f_net_cost_add_vat)))."'>");
 */
/*****************************************/		 
 	${$root}[] = array("no" => ($i++), "i_detail" => 0,
						"id" 		=> 'grandTotal4', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'จำนวนเงินรวมภาษีมูลค่าเพิ่ม'.'</p>',   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$f_net_cost_add_vat."</p>" 
						."<input type='hidden' name='f_vat_amt_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $f_net_cost_add_vat)))."'>");

/*****************************************/						
	${$root}[] = array("no" => ($i++), "i_detail" => 0,
						"id" 		=> 'grandTotal5', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'จำนวนเงินภาษีหัก ณ ที่จ่าย'.'</p>',   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$m->f_tax_amt."</p>" 
						."<input type='hidden' name='f_tax_amt_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $m->f_tax_amt)))."'>");

	${$root}[] = array("no" => ($i++), "i_detail" => 0,
						"id" 		=> 'grandTotal6', 
						"c_name" 	=> "<p style='font-weight:bold;'>"."ยอดสุทธิ"."</p>",   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$m->f_net_cost."</p>"
						."<input type='hidden' name='f_net_cost_sum' value='".(floatval(preg_replace('/[^\d.]/', '', $m->f_net_cost)))."'>");
						
	${$root}[] = array("no" => ($i++), "i_detail" => 0,
						"id" 		=> 'grandTotal7', 
						"c_name" 	=> $payBy,  
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$total_conv_text."</p>"
						."<input type='hidden' name='f_net_text' value='{$total_conv_text}'>");
	${$root}[] = array("no" => ($i++), "i_detail" => 0,
						"id" 		=> 'grandTotal8', 
						"c_name" 	=> "<input type='text' class='x-form-text x-form-field' style='font-size:12px;width:90%;margin:-2px;' name='c_invoice_item2' value=''>",  
						"f_total_cost" 		=> "<p style='font-weight:bold;'>&nbsp;</p>"); 
 
					
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);

	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
}else{
	echo "Invalid GETDATA";
}
?>