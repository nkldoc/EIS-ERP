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
$table	= "fi_receive_tran_hdr";
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
if (!$util->get($dir))	{       $dir 	= "ASC"; }
if (!$util->get($sort)) {  		$sort 	= "{$table}.c_code, {$table}.d_doc_date "; }
###################
	$arr_status = array(null=>"ยังไม่ออกเลข",1=>"ออกเลข",2=>"รับเงินแล้ว สมบูรณ์(เต็มใบ)",3=>"รับเงินแล้ว สมบูรณ์(ให้เป็นส่วนลด)");	
	$wh = null;

	
if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
{
  
        $d_begin_dateID         = substr(@$_REQUEST["d_begin_dateID"],0,10);
        $d_end_dateID           = substr(@$_REQUEST["d_end_dateID"],0,10);
        
        $wh = " {$table}.d_doc_date between ? and ? ";                
 
        $arrParam[]       = $d_begin_dateID;
        $arrCountParam[]  = $d_begin_dateID;
        
        $arrParam[]       = $d_end_dateID;
        $arrCountParam[]  = $d_end_dateID;
 
		if($value!=''){
                    
			 if($_REQUEST['filter']=='debtor_name'){
				 
				$wh .=" and dc_debtor_id in (select dc_debtor_id from dc_debtor where c_name like ?) ";
				$arrParam[] ="%{$value}%";	
				$arrCountParam[] = "%{$value}%";
				
			 }else if($_REQUEST['filter']=='so_code'){
				 
				$wh .=" and ar_so_hdr_id in (select ar_so_hdr_id from ar_so_hdr where c_code like ?) ";
				$arrParam[] ="%{$value}%";	
				$arrCountParam[] = "%{$value}%";
				
			 }else if($_REQUEST['filter']=='inv_code'){
				 
				$wh .=" and ar_bill_invoice_hdr_id in (select ar_bill_invoice_hdr_id from ar_bill_invoice_hdr where c_code like ?) ";
				$arrParam[] ="%{$value}%";	
				$arrCountParam[] = "%{$value}%";
				
			 }else{
				
				$wh .=" and ".$_REQUEST['filter']." like ? ";
				$arrParam[] ="%{$value}%";	
				$arrCountParam[] = "%{$value}%";  
				
            }
				
             	
		}
 
}else{  
 
    
        $wh = " ISNULL({$table}.i_enable,".STATUS_DISABLE.") =?"; // Search No Enable = 1  
				
        $arrParam[] 		= STATUS_ENABLE;
        $arrCountParam[]	= STATUS_ENABLE;		
} //Search c_debtor_code  


$sqlTempTable = "select {$table}.fi_receive_tran_hdr_id
		,{$table}.ar_bill_invoice_hdr_id
		,{$table}.ar_so_hdr_id
		,isnull({$table}.c_code,'0') as c_code
		,{$table}.c_name

		,{$table}.dc_debtor_id
		,{$table}.dc_cost_id
		,{$table}.dc_area_id
		,{$table}.receipt_book
		,{$table}.receipt_book_no
 
		,{$table}.fi_pymt_voucher_type_id
		,isnull({$table}.dc_bank_acc_company_id,1) as dc_bank_acc_company_id
		,isnull({$table}.dc_bank_id,1) as dc_bank_id
		,isnull({$table}.dc_bank_branch_id,1) as dc_bank_branch_id
 
		,{$table}.c_cheq_code
		
		,{$table}.c_remark
		,{$table}.f_total_cost
		,{$table}.f_disc_amt
		,{$table}.f_before_edit_vat
		,{$table}.f_tax_amt
		,{$table}.f_vat_amt
		,{$table}.f_net_cost 
		,{$table}.c_comment  
		,{$table}.json_print_dtl 
		,{$table}.i_enable 
		,{$table}.i_is_status
		,isnull(
			(select c_contract_no from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id={$table}.ar_bill_invoice_hdr_id) ,
			(select c_po_no from ar_so_hdr where ar_so_hdr_id={$table}.ar_so_hdr_id)
			) as c_po_no													
		,isnull(
			(select convert(varchar, d_contract_date, 120) from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id={$table}.ar_bill_invoice_hdr_id) ,
			(select convert(varchar, d_doc_date, 120) from ar_so_hdr where ar_so_hdr_id={$table}.ar_so_hdr_id)
			) as d_so_date													
		
		, convert(varchar, {$table}.d_doc_date, 120) as d_doc_date 
		, convert(varchar, {$table}.d_cheq_date, 120) as d_cheq_date  		
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
		, convert(varchar, d_create, 120) as d_create
		,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
		,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
		, convert(varchar, d_update, 120) as d_update 
, ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} where {$wh} ".$util->viewAcc($i_read);


$sqlMain = "select * 
	,(select top 1 c_name from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_debtor_name
	,(select top 1 c_code from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_debtor_code
	,(select top 1 c_tax_value from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_tax_value
	,(select top 1 c_address from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_address
	,(select top 1 c_telephone from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_telephone
	,(select top 1 c_mobile from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_mobile
	,(select top 1 c_email from dc_debtor where dc_debtor_id=a.dc_debtor_id) as c_email 
	, (select top 1 c_name from dc_cost where dc_cost_id=a.dc_cost_id) as c_cost_name  
	, isnull((select top 1 c_code from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id),'-') as so_code  
	, (select top 1 c_name from dc_area where dc_area_id=a.dc_area_id) as c_area_name 
	, (select f_vat_rate from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as f_vat_rate
 
	, (select convert(varchar, d_endpay_date, 120) from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as d_endpay_date
	, isnull((select c_code from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id),'-') as inv_code 
	, (select convert(varchar, d_billing_date, 120) from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as d_billing_date 

 ,(select c_name_inv from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as c_name_inv 
 ,(select c_address_inv from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as c_address_inv 
 ,(select due_bill from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as due_bill 
 ,(select condition_pay from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as condition_pay 
	
	from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
 
/*  echo $sqlTempTable; exit;  */
$arrParam[] = $start;
$arrParam[] = $limit;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
 
$iDel = null;	
while($row =$db->Fetch($stmt))				
{ 
       $chkPerEdit = ($row["c_code"]!='0')?1:0;
         
		
		if($row['i_enable']==STATUS_ENABLE){
			if($row["c_code"]=='0' && $row["i_is_status"]==null){
				$img = '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>';
				$iDel = 1;
			}else if($row["c_code"]!='0' && $row["i_is_status"]!=null){
				$iDel = 2;
				$img = '<img src="../images/icons/bullet_cross.png" style="cursor:pointer"/>';
			}else{
				$iDel = 0;
				$img = '';
			}
			
			$imgedit = ($chkPerEdit)?'':'<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>';
		}else{
			$iDel = 0;
			$img = '';
			$imgedit = '';
		}
		//=============
		
		$c_is_status = ($row['i_enable']==STATUS_ENABLE)?$arr_status[$row["i_is_status"]]:'<font color=red>ยกเลิก</font>';
		
					$temp = array("no" => ($i++), 
                    "id" 				=> $row["fi_receive_tran_hdr_id"],
					"ar_bill_invoice_hdr_id" => $row["ar_bill_invoice_hdr_id"],
                    "ar_so_hdr_id"		=> $row["ar_so_hdr_id"], 
					"so_code"			=> $row["so_code"], 
					"inv_code"			=> $row["inv_code"], 
					"c_code" 			=> $row["c_code"],
					//"c_invoice_item" 	=> $row["c_invoice_item"],
					
					"d_cheq_date" 			=> $row["d_cheq_date"]==null?"":$date->extDateBuddha($row["d_cheq_date"]),
					
					"delID"  => $img, 
                    "editID" => $imgedit,	
					"iDel" 				=> $iDel,  
                    "i_enable" 			=> $row["i_enable"],  
 
                    "txtdc_debtor_idID" 		=> $row["c_debtor_name"]?$row["c_debtor_code"]." ".$row["c_debtor_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_debtor_id"]."]", //frm
                    "c_debtor_name" 			=> $row["c_debtor_name"]?$row["c_debtor_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_debtor_id"]."]</span>", //grid				
                    "dc_debtor_id" 				=> $row["dc_debtor_id"], 
					
					"dc_cost_id" 				=> $row["dc_cost_id"],
					"c_cost_name" 				=> $row["c_cost_name"], 
                    "d_doc_date"            	=> $date->extDateBuddha($row["d_doc_date"]),
                    "d_billing_date" 			=> $date->extDateBuddha($row["d_billing_date"]), 
					"c_doc_date" 				=> $date->long_date_from_db($row["d_doc_date"]), 
					"c_status" 					=> $c_is_status, 
					"f_vat_rate" 				=> $row["f_vat_rate"],
					"f_total_cost" 				=> number_format($row["f_total_cost"],2),
					"f_disc_amt" 				=> number_format($row["f_disc_amt"],2),
					"f_tax_amt" 				=> number_format($row["f_tax_amt"],2),
					"f_vat_amt" 				=> number_format($row["f_vat_amt"],2),
					"f_before_edit_vat"			=> number_format($row["f_before_edit_vat"],2),
					"f_net_cost" 				=> number_format($row["f_net_cost"],2),
 
//Orders c_po_no
					 "d_so_date"			=> $date->long_date_from_db($row["d_so_date"]),
					 "c_po_no" 				=> $row["c_po_no"], 
					 "c_name_inv" 				=> $row["c_name_inv"], 
					 "c_address_inv" 			=> $row["c_address_inv"],
					 "due_bill" 				=> $row["due_bill"],
					 "condition_pay"			=> $row["condition_pay"],
					 
					"d_endpay_date" 			=> $date->extDateBuddha($row["d_endpay_date"]),
					"c_tax_value" 				=> $row["c_tax_value"], 
					"c_address" 				=> $row["c_address"], 
					"c_telephone" 				=> $row["c_telephone"], 
					"c_mobile" 					=> $row["c_mobile"], 
					"c_email" 					=> $row["c_email"],
 
					"receipt_book_no" 			=> $row["receipt_book_no"], 
					"receipt_book" 				=> $row["receipt_book"],
					"fi_pymt_voucher_type_id"	=> $row["fi_pymt_voucher_type_id"], 
					"dc_bank_acc_company_id"	=> $row["dc_bank_acc_company_id"],
					"dc_bank_id" 				=> $row["dc_bank_id"], 
					"dc_bank_branch_id"			=> $row["dc_bank_branch_id"],
 					"c_cheq_code" 				=> $row["c_cheq_code"],
 
//					
                    "dc_area_id"				=> $row["dc_area_id"],
					"c_area_name"				=> $row["c_area_name"], 
					"c_remark"					=> $row["c_remark"], 
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