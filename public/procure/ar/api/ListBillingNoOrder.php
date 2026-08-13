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
$table	= "ar_bill_invoice_hdr";
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
if (!$util->get($sort)) {  	$sort 	= "isnull({$table}.c_area_code,'0') ASC,{$table}.d_doc_date"; }
###################
$sta = array(0=>"แก้ไข",
		2=>"ปกติ",
		3=>"ไม่สมบูรณ์",
		"" =>"เลือกทั้งหมด");
	
	$wh = null;
 
        
if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETCLOSEMONTH"){
    $sqlClose = "select max(bill_yyyy_mm) from ar_close_bill_hdr where i_close_bill=0"; //ส่วนกลาง
    $bill_yyyy_mm = $db->GetDataBySQL($sqlClose, array(1));   
    $tempx = array(  "no" => 1, 
                    "id" => 'closeMonth',  
                    "bill_yyyy_mm"      => $bill_yyyy_mm,
                    "txt_yyyy_mm"       => $bill_yyyy_mm?(@$date->l_month_thai[substr($bill_yyyy_mm,4,2)]." ".(floatval(substr($bill_yyyy_mm,0,4))+543)):null,        
            );
    echo json_encode(array("success"=>"success","totalCount"=>1,"data"=>$tempx)); exit();
}//End 

if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
{
 
        $begin_date = substr(@$_REQUEST["d_begin_dateID"],0,10);
        $end_date 	= substr(@$_REQUEST["d_end_dateID"],0,10); 
        
        $wh = "{$table}.d_billing_date between ? AND ?"
        . " AND isnull({$table}.i_no_order,0) =?"
        . " AND isnull({$table}.i_parent,0)=0"
        . " AND ISNULL({$table}.i_enable,".STATUS_DISABLE.") in (1,2)";
        
        $arrParam[] 		= $begin_date;
        $arrCountParam[]	= $begin_date;
        
        $arrParam[] 		= $end_date;
        $arrCountParam[]	= $end_date;
        
        $arrParam[] 		= 1;
        $arrCountParam[]	= 1;

 
            if($value!=''){

                if($_REQUEST['filter']=='cnt_name'){
                    $wh .=" and {$table}.dc_cnt_id in (select dc_cnt_id from dc_cnt where c_name like ?)";
                    $arrParam[] ="%{$value}%";	
                    $arrCountParam[] = "%{$value}%";
                }else{
                    $wh .=" and ".$_REQUEST['filter']." like ?";
                    $arrParam[] ="%{$value}%";	
                    $arrCountParam[] = "%{$value}%"; 
                } 	
            }
        
         if($_REQUEST['month']!=-1 && $_REQUEST['year']!=-1){
                $wh .=" and {$table}.ar_so_hdr_id in (select ar_so_hdr_id from ar_so_hdr where onair_yyyy_mm = ?)";
                $arrParam[] = (intval($_REQUEST['year'])-543)."".$_REQUEST['month'];	
                $arrCountParam[] = $_REQUEST['year']."".$_REQUEST['month']; 
         }	
        
 
        
         if($_REQUEST['i_is_print']!=-1){
                $wh .=" and {$table}.".$_REQUEST['i_is_print']." != ?";
                $arrParam[] = '0';	
                $arrCountParam[] = '0';      
         }	
         if($_REQUEST['dc_product_type_id']!=""){
                $wh .=" and {$table}.dc_product_type_id = ?";
                $arrParam[] = $_REQUEST['dc_product_type_id'];	
                $arrCountParam[] = $_REQUEST['dc_product_type_id'];      
         }	
         if($_REQUEST['i_enable']!=-1){
                $wh .=" and isnull({$table}.i_enable,2) = ?";
                $arrParam[] = $_REQUEST['i_enable'];	
                $arrCountParam[] = $_REQUEST['i_enable'];      
         }	
}else{ 
 
        $begin_date = $date->bc_to_ad($_REQUEST["d_begin_dateID"]);
	$end_date 	= $date->bc_to_ad($_REQUEST["d_end_dateID"]);
        
        $wh = "{$table}.d_billing_date between ? AND ?"
        . " AND isnull({$table}.i_no_order,0) =?"
        . " AND isnull({$table}.i_parent,0)=0"
        . " AND ISNULL({$table}.i_enable,".STATUS_DISABLE.") in (1,2)";
        
        $arrParam[] 		= $begin_date;
        $arrCountParam[]	= $begin_date;
        
        $arrParam[] 		= $end_date;
        $arrCountParam[]	= $end_date;
        
        $arrParam[] 		= 1;
        $arrCountParam[]	= 1;
} 
 
	$sqlTempTable = "select {$table}_id "
        . ", {$table}.i_enable "
        . ", {$table}.ar_so_hdr_id "
        . ", isnull({$table}.c_code,'0') as c_code"
        . ", isnull({$table}.c_area_code,'0') as  c_area_code"
        . ", isnull({$table}.c_area_print,'0') as c_area_print"
        . ", isnull(b.c_contract_no,'') as c_contract_no "
        . ", isnull(convert(varchar, b.d_contract_date, 120),'') as d_contract_date "
        . ", b.i_group_type " 
        . ",(select top 1 c_code+' '+c_name from ar_package  where ar_package_id=b.ar_package_id) as ar_package_name "
        . ",isnull(b.ar_package_id,0) as ar_package_id"
        . ",(select top 1 c_code+' '+c_name from pj_hdr where pj_hdr_id=b.pj_hdr_id) as pj_name "
        . ",isnull(b.pj_hdr_id,0) as pj_hdr_id"
                
        . ", isnull({$table}.f_total_cost_amt,0) as f_total_cost_amt "
        . ", isnull({$table}.f_net_cost_add_vat_amt,0) as f_net_cost_add_vat_amt "
        . ", convert(varchar, {$table}.d_doc_date, 120) as d_doc_date"
        . ", convert(varchar, {$table}.d_billing_date, 120) as d_billing_date"
        . ", (select top 1 c_name from dc_cost where dc_cost_id=b.dc_cost_id) as c_cost_name"
        . ", (select top 1 c_code from dc_cost where dc_cost_id=b.dc_cost_id) as c_cost_code"
        . ", isnull(b.dc_cost_id,0) as dc_cost_id"    
        . ", (select top 1 c_name from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_name"
        . ", (select top 1 c_code from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as c_cnt_code"
        . ", isnull({$table}.dc_cnt_id,0) as dc_cnt_id"
        . ", b.onair_yyyy_mm"
        . ", b.i_is_imc "    
        . ", b.i_is_barter "    
        . ", {$table}.c_comment "
        . ", {$table}.c_inv_old"
        . ", {$table}.dc_tax_id_vat as dc_vat_id"
        . ", {$table}.dc_product_type_id" 
        . ", {$table}.i_is_show_disc_cash"
        . ", {$table}.i_is_show_txt_dtl"
        . ", {$table}.f_vat_amt"
        . ", {$table}.c_yyyy_mm"
        . ", {$table}.dc_area_id"
        . ", {$table}.d_end_credit"
        . ", {$table}.c_billing_name "
        . ", {$table}.c_billing_addr"
        . ",(select top 1 dc_disc_type_id from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as dc_disc_type_id" 
        . ",(select top 1 ar_pre_print_bill_hdr_id from ar_pre_print_bill_hdr where ar_bill_invoice_hdr_id={$table}.ar_bill_invoice_hdr_id) as ar_pre_print_bill_hdr_id" 
        . ", convert(varchar, {$table}.d_end_pay, 120) as d_end_pay" 
        . ",(select top 1 aa.c_name+' '+bb.c_name from dc_product_group aa"
        . " INNER JOIN dc_product_type bb ON aa.dc_product_group_id = bb.dc_product_group_id"
        . " where bb.i_enable=1 and bb.dc_product_type_id={$table}.dc_product_type_id) as dc_product_type_name"
        . ",(select top 1 dc_cnt_type_id from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as dc_cnt_type_id"
        
        . " , c.c_address
            , c.c_telephone
            , c.c_mobile
            , c.c_fax
            , c.c_ref_value
            , c.c_tax_value
            , c.c_website
            , c.c_email
            ,(select c_name from dc_cnt_type where dc_cnt_type_id=c.dc_cnt_type_id) as cnt_type_name"  
        
            . ", (select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                            , convert(varchar, {$table}.d_create, 120) as d_create
                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                            , convert(varchar, {$table}.d_update, 120) as d_update 
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row"
      . " FROM {$table} "
      . " inner join ar_so_hdr b on {$table}.ar_so_hdr_id = b.ar_so_hdr_id"
      . " inner join dc_cnt c on {$table}.dc_cnt_id = c.dc_cnt_id"
      . " where {$wh} ".$util->viewAcc($i_read,"b");
 
$sqlMain	= "select *" 
//                . " ,(select isnull(d_contract_date,'') from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as d_contract_date"  
//                . " ,(select c_code from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as so_code"  
//                . " ,(select isnull(c_contract_no,'0') from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as c_contract_no"  
//                . " ,(select c_po_no from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as c_po_no"  
                . " ,(select convert(varchar, d_so_date, 120) from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as d_so_date"   
//                . " ,(select isnull(i_is_barter,0) from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as i_is_barter"   
//                . " , isnull(convert(varchar, a.d_end_credit, 120),'') as d_end_credit"  
//                . " ,(select top 1 due_bill from dc_cnt where dc_cnt_id=a.dc_cnt_id) as due_bill" 
                . " ,(select top 1 c_code from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_cnt_code"
//                . " ,(select top 1 c_name from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_cnt_name"
                . " ,(select top 1 c_name_inv from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_name_inv"
                . " ,(select top 1 isnull(c_address_inv,'')+isnull(c_address_inv2,'') from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_address_inv"
//                . " ,(select top 1 isnull(c_name,'') from dc_disc_type where dc_disc_type_id=a.dc_disc_type_id) as condition_pay" 
//                . " ,(select top 1 c_address from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_address" 
//                . " ,(select top 1 c_tax_value from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_tax_value"
//                . " ,(select top 1 c_email from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_email"
//                . " ,(select top 1 c_fax from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_fax"
//		  . " ,(select top 1 c_website from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_website" 
//                . " ,(select top 1 c_mobile from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_mobile"
//                . " ,(select top 1 c_telephone from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_telephone"  
//                . " ,(select top 1 c_name from dc_business_area where dc_area_id=a.dc_area_id) as c_area_name"
//                . " ,(select top 1 c_name from dc_cnt_type where dc_cnt_type_id=a.dc_cnt_type_id) as dc_cnt_type_name"				
//                . " ,(select top 1 onair_yyyy_mm from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as onair_yyyy_mm" 
//                . " ,(select top 1 isnull(c_invoice_item,'') from ar_pre_print_bill_dtl where ar_pre_print_bill_hdr_id=a.ar_pre_print_bill_hdr_id) as c_name"
        . " from ({$sqlTempTable}) a "
        . " WHERE a.row > ? and a.row <= ? "
        . " Order By isnull(a.c_area_code,'0') ASC,a.d_doc_date";
$arrParam[] = $start;
$arrParam[] = $limit;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;

$f_pj_amt       = 0;
$f_dtl_amt      = 0;
$bill_status    = array(0=>"ไม่ใช้งาน",1=>"<font color=blue>ใช้งาน",2=>"<font color=red>ยกเลิก");    
$group_type     = array(1=>"โฆษณาในรายการ",2=>"เช่าเวลาในรายการ"); 
       
$sqlClose = "select max(bill_yyyy_mm) from ar_close_bill_hdr where i_close_bill=0 and i_is_center=1"; //ส่วนกลาง 
$bill_yyyy_mm 	= $db->GetDataBySQL($sqlClose, array(1));
function validCancel($row){
        global $db,$bill_yyyy_mm;


        $buEdit 	= '<img src="../images/icons/document_edit.gif" style="cursor:pointer">';
        $buCancel 	= '<img src="../images/icons/bullet_cross.png" style="cursor:pointer"/>';
        $buDelCancel 	= '';

                if($row['c_area_code'] !='0'){			//1/11/2553
                        if($row['i_enable']==2){
                                $buCancel =  '<img src="../images/icons/bullet_tick.png" style="cursor:pointer"/>'; 
                        }else{ 
                                $buCancel =  '<img src="../images/icons/bullet_cross.png" style="cursor:pointer"/>';
                        }			
                }else{
                                $buDelCancel = '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>';	
                                $buCancel = '';
                }

                $adj 	= 0;
                $dec 	= 0;
                $onair 	= 0;
                $rec	= 0;
                $status = 0;

                if($row["c_yyyy_mm"]<=$bill_yyyy_mm) //ถ้าปิดการวางบิลรับเงินแล้ว ไม่ให้ยกเลิกรายการได้
                {
                        $buDelCancel 	= ''; 
                        $buCancel 		= '';
                        $buEdit			= ''; 
                        $status = 1;
                }
                //const ARR = [$buDelCancel,$status];
        return array($status,$buDelCancel,$buCancel,$buEdit);
}

$arrEnabled = array(1=>"<span style='color:blue'>ใช้งาน</span>",2=>"<span style='color:red'>ไม่ใช้งาน</span>");
while($row =$db->Fetch($stmt))				
{
    
    	$ch = validCancel($row); 
	$buStatus 		= $ch[0];
	$buDel 			= $ch[1]; 
	$buCancel 		= $ch[2];
	$buEdit			= $ch[3];
	
        //Print
	$p = "<img style='margin:0px 0px -2px 2px;' src='../images/icons/printer_mono.png'>"; 
        $style          =($row['i_enable']==1)?"color:blue":"color:gray";
        $c_codePrint    = "<span style='{$style}'>{$row["c_area_code"]}</span>{$p}"; 
	$print_status   = $row["c_code"]!='0'?1:0; 
        $c_code         = $print_status?$c_codePrint:$row["c_area_code"];   
        $print_status   =($row['i_enable']==1)?$print_status:0; //ยกเลิก ไม่สารถ Re-Print ได้ 
        //Print
        
	$sqlPrinting = "select * from ar_pre_print_bill_hdr where i_enable=1 and ar_bill_invoice_hdr_id=?";
	$pre_print = $db->GetDataBySQL($sqlPrinting, array($row["{$table}_id"]));  

        //End
        if($row["i_is_imc"]==0 && $row["i_is_barter"]==0){
		$order_type = '-1'; 
	 }else if($row["i_is_imc"]==1 && $row["i_is_barter"]==0){
		$order_type = "i_is_imc";  
	 }else if($row["i_is_imc"]==0 && $row["i_is_barter"]==1){
		$order_type = "i_is_barter";  
	 } 
         
	$temp = array("no" => ($i++), 
                    "id" 		=> $row["{$table}_id"],
                    "ar_so_hdr_id"      => $row["ar_so_hdr_id"],
                            
                    "ar_bill_invoice_hdr_id"    => $row["{$table}_id"],
                    "print_status"		=> $print_status,
                    "ar_pre_print_bill_hdr_id"  => $pre_print["ar_pre_print_bill_hdr_id"],
                    "c_code" 			=> $c_code,  
        
                    "c_billing_date" 	=> $date->long_date_from_db($row["d_billing_date"]),        
                    "c_billing_name" 	=> $row["c_billing_name"]."( ".substr($row["c_cnt_code"],2).")",
                    "c_billing_addr" 	=> $row["c_billing_addr"],
                    "c_address_inv" 	=> $row["c_address_inv"], 
                    "c_name_inv"        => $row["c_name_inv"],        
                    "cancelID" 		=> $buCancel,        
                    "delCancelID" 	=> $buDel,
                    "buStatus" 		=> $buStatus,
                    "editID" 		=> $buEdit,
                    "c_enable" 			=> $arrEnabled[$row["i_enable"]],
                    "i_enable" 			=> $row["i_enable"],
                    

                            
                    "dc_area_id" 	=> $row["dc_area_id"],        
                    "c_area_code1" 	=> $row["c_area_code"]=='0'?'0':$row["c_area_code"]." [{$row["c_area_print"]}]", 
                    "c_area_code" 	=> $row["c_area_code"], 
                    "c_area_print" 	=> $row["c_area_print"],  
                    "order_type"        => $order_type,        
                    "c_status"                  => $bill_status[$row["i_enable"]],  
                    "f_total_cost_amt"          => number_format($row["f_total_cost_amt"],2),      
                    "f_vat_amt"                 => number_format($row["f_vat_amt"],2), 
                    "f_net_cost_add_vat_amt"    => number_format($row["f_net_cost_add_vat_amt"],2), 
                    "txtar_package_idID" 	=> $row["ar_package_name"],
                    "ar_package_id"		=> $row["ar_package_id"], 
                    "txtpj_hdr_idID"            => $row["pj_name"], 
                    "pj_hdr_id"                 => $row["pj_hdr_id"],  
                            //
                   "c_inv_old"                 => $row["c_inv_old"],        
                   "i_is_show_disc_cash"                 => $row["i_is_show_disc_cash"],        
                   "i_is_show_txt_dtl"                 => $row["i_is_show_txt_dtl"],   
                            
                    "txtdc_product_type_idID"            => $row["dc_product_type_name"], 
                    "dc_product_type_id"                 => $row["dc_product_type_id"],  
        
                                        "c_address"             => $row["c_address"],
					"c_telephone"           => $row["c_telephone"],
					"c_mobile" 		=> $row["c_mobile"],
					"c_fax" 		=> $row["c_fax"],
                                        "c_website" 		=> $row["c_website"],
                                        "c_email" 		=> $row["c_email"],
					"c_tax_value"           => $row["c_tax_value"],
                                        "cnt_type_name" 	=> $row["cnt_type_name"],
					"c_ref_value"           => $row["c_ref_value"] ,
                            //
                        "dc_vat_id"        => $row["dc_vat_id"], 
                        "i_group_type"      => $row["i_group_type"],
//                    "f_pj_amt"          =>floatval($f_pj_amt),
//                    "f_dtl_amt"         =>floatval($f_dtl_amt), 
                    
//                    "order_type"        => $order_type,
//                            
                    "delID"  => ($row["c_area_print"]!='0')?'':'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',
                    "editID" => ($row["c_area_print"]!='0')?'':'<img src="../images/icons/document_edit.gif" style="cursor:pointer"/>',	

                    "c_cost_name" 	=> $row["c_cost_name"]?$row["c_cost_name"]:$row["dc_cost_id"], 
                    "dc_cost_id" 	=> $row["dc_cost_id"],
                    "txtdc_cost_idID"    => $row["c_cost_name"]?$row["c_cost_code"]." ".$row["c_cost_name"]:$row["dc_cost_id"], 
                            
                    "c_cnt_name" 	=> $row["c_cnt_name"]?$row["c_cnt_name"]:$row["dc_cnt_id"], 
                    "txtdc_cnt_idID"    => $row["c_cnt_name"]?$row["c_cnt_code"]." ".$row["c_cnt_name"]:$row["dc_cnt_id"],     
                    "dc_cnt_id" 	=> $row["dc_cnt_id"],
                    "dc_vat_id" 	=> $row["dc_vat_id"],        
                    "c_name"            => @$group_type[$row["i_group_type"]],
                            
//                    "is_status"		=> $sta[$row["i_is_status"]],
//                    "txtdc_cnt_idID" 	=> $row["c_cnt_name"]?$row["c_cnt_code"]." ".$row["c_cnt_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]", //frm
//                    "c_cnt_name" 	=> $row["c_cnt_name"]?$row["c_cnt_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]</span>", //grid				
//                    "dc_cnt_id" 	=> $row["dc_cnt_id"],
//                    "c_so_no" 		=> $row["c_so_no"],
//                    "c_po_no" 		=> $row["c_po_no"], 
 
                    "onair_yyyy_mm" 	=> $row["onair_yyyy_mm"]?(@$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543)):null,
                    "onair_mm"		=>substr($row["onair_yyyy_mm"],4,2),
                    "onair_yyyy"		=>substr($row["onair_yyyy_mm"],0,4),
                    "c_comment" 		=> $row["c_comment"],
                    
                    "d_so_date"             =>$row["d_so_date"]==''?'':$date->extDateBuddha($row["d_so_date"]),         
                    "c_contract_no"         =>$row["c_contract_no"],        
                    "d_contract_date"       =>$row["c_contract_no"]==''?'':$date->extDateBuddha($row["d_contract_date"]),  
                    "c_contract_date"       =>$row["c_contract_no"]==''?'':$date->long_date_from_db($row["d_contract_date"]),
                            
                    "d_end_pay"                 =>$date->extDateBuddha($row["d_end_pay"]), 
                    "d_billing_date"            =>$date->extDateBuddha($row["d_billing_date"]),        
                    "d_doc_date"                =>$date->extDateBuddha($row["d_doc_date"]), 
                    "dc_user_create_id"         =>$row["c_create_name"],
                    "dc_user_create_cost_id" 	=>$row["c_cost_creat_name"],
                    "d_create" 			=>$date->extDateBuddha($row["d_create"]),
                    "dc_user_update_id"         =>$row["c_update_name"],
                    "dc_user_update_cost_id" 	=>$row["c_cost_update_name"],
                    "d_update"                  =>$date->extDateBuddha($row["d_update"])
            );
	${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("success"=>"success","totalCount"=>$totalCount,$root=>${$root}));

function get($a){ return isset($a) && !empty($a)?$a:null; }
?>