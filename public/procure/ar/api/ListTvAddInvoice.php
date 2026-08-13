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
if (!$util->get($sort)) {  		$sort 	= "{$table}.ar_bill_invoice_hdr_id"; }
###################
$sta = array(0=>"แก้ไข",
		2=>"ปกติ",
		3=>"ไม่สมบูรณ์",
		"" =>"เลือกทั้งหมด");
	
	$wh = null;

        
     
 
if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
{
  
        $d_begin_dateID         = substr(@$_REQUEST["d_begin_dateID"],0,10);
        $d_end_dateID           = substr(@$_REQUEST["d_end_dateID"],0,10);
        
        $wh = " isnull({$table}.i_is_invoice,0)=0 "
                . "AND isnull({$table}.i_parent,0)=0 "
                . "AND isnull({$table}.i_is_billing,0)=? "
                . "AND {$table}.i_class_type=".AR_CLASS_TYPE_TV." "
                . "AND {$table}.d_billing_date between ? and ? ";                
        $arrParam[] 		= 1;
        $arrCountParam[]	= 1;

        $arrParam[]       = $d_begin_dateID;
        $arrCountParam[]  = $d_begin_dateID;
        
        $arrParam[]       = $d_end_dateID;
        $arrCountParam[]  = $d_end_dateID;
        
	 if($_REQUEST['i_enable']!=-1){
           $wh .=" and ISNULL({$table}.i_enable,".STATUS_DISABLE.") =?";
           $arrParam[] = $_REQUEST['i_enable'];	
           $arrCountParam[] = $_REQUEST['i_enable'];      
	 }	
 	if($_REQUEST['c_area_print']!=-1){ 
                if($_REQUEST['c_area_print']==1)$wh .=" and isnull({$table}.c_area_print,'0') !='0'";
                if($_REQUEST['c_area_print']==2)$wh .=" and isnull({$table}.c_area_print,'0') ='0'";   
	} 
       if($_REQUEST['month']!=-1 && $_REQUEST['year']!=-1){
                $wh .=" and {$table}.ar_so_hdr_id in(select ar_so_hdr_id from ar_so_hdr where onair_yyyy_mm = ?)";
                $arrParam[] = (intval($_REQUEST['year'])-543)."".$_REQUEST['month'];	
                $arrCountParam[] = $_REQUEST['year']."".$_REQUEST['month'];            
       }
        if($value!=''){
 
                $wh .=" and ".$_REQUEST['filter']." like ?";
                $arrParam[] ="%{$value}%";	
                $arrCountParam[] = "%{$value}%";  
                
        }
}else{  
    /*
     * select *,dbo.get_stryyyy_mm(d_billing_date)as bill_yyyy_mm from ar_bill_invoice_hdr 
     * where i_enabled in('1','2') 
     * and i_is_invoice='0' 
     * and i_parent='0' and i_is_billing='1' 
     * and i_class_type='1'
     * and d_billing_date between CONVERT(DATETIME,'2017-02-01 00:00:00',102) 
     * and CONVERT(DATETIME,'2017-03-03 23:59:59',102) 
     * order by c_code DESC 
     */
    
        $wh = " isnull({$table}.i_is_invoice,0)=0 "
                . "AND isnull({$table}.i_parent,0)=0 "
                . "AND isnull({$table}.i_is_billing,0)=? "
                . "AND {$table}.i_class_type=".AR_CLASS_TYPE_TV." "
                . "AND ISNULL({$table}.i_enable,".STATUS_DISABLE.") =1"; // Search No Enable = 1 
        
        $arrParam[] 		= 1;
        $arrCountParam[]	= 1;		
} //Search
 
	$sqlTempTable = "select {$table}.{$table}_id  
                            ,{$table}.ar_so_hdr_id 
                            ,{$table}.dc_cnt_id 
                            ,{$table}.dc_product_type_id 							
                            , isnull({$table}.c_code,'0') as c_code  
							, isnull({$table}.c_area_code,'0') as c_area_code
							, isnull({$table}.c_area_print,'0') as c_area_print
							, {$table}.d_end_credit
							, {$table}.i_is_show_disc_cash
							, {$table}.i_is_show_txt_dtl
							, {$table}.dc_tax_id_vat as dc_vat_id
							, {$table}.vat_rate
							, {$table}.c_yyyy_mm 
                            , convert(varchar, {$table}.d_billing_date, 120) as d_billing_date 
                            , convert(varchar, {$table}.d_doc_date, 120) as d_doc_date     
                            ,{$table}.dc_area_id
                            ,{$table}.f_vat_amt
							,{$table}.f_tax_amt
							,{$table}.f_total_cost_amt
							,{$table}.f_disc_com_amt
							,{$table}.f_disc_cash_amt
							,{$table}.f_net_cost_amt
							,{$table}.c_billing_name
							,{$table}.c_billing_addr
							,(select top 1 dc_cnt_type_id from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as dc_cnt_type_id             
							,(select top 1 dc_disc_type_id from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as dc_disc_type_id
							
							,{$table}.i_enable 
							,(select top 1 ar_pre_print_bill_hdr_id from ar_pre_print_bill_hdr where ar_bill_invoice_hdr_id={$table}.ar_bill_invoice_hdr_id) as ar_pre_print_bill_hdr_id
                            ,{$table}.dc_user_create_id
                            ,{$table}.dc_user_create_cost_id
                            ,{$table}.d_create
                            ,{$table}.dc_user_update_id
                            ,{$table}.dc_user_update_cost_id
                            ,{$table}.d_update  
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} 
                    where {$wh} ".$util->viewAcc($i_read);
					
$sqlMain = "select * "
               /*  . " ,(select sum(isnull(f_total_cost,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_total_cost"
                . " ,(select sum(isnull(f_disc_com_amt,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_disc_com_amt"
                . " ,(select sum(isnull(f_disc_cash_amt,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_disc_cash_amt"
                . " ,(select sum(isnull(f_net_cost,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_net_cost" */
 
                . " ,(select isnull(d_contract_date,'') from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as d_contract_date"  
                . " ,(select c_code from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as so_code"  
                . " ,(select isnull(c_contract_no,'0') from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as c_contract_no"  
                . " ,(select c_po_no from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as c_po_no"  
                . " ,(select convert(varchar, d_so_date, 120) from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as d_so_date"   
                . " ,(select isnull(i_is_barter,0) from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as i_is_barter"   
                . " , convert(varchar, a.d_end_credit, 120) as d_end_credit"  
                . " ,(select top 1 due_bill from dc_cnt where dc_cnt_id=a.dc_cnt_id) as due_bill" 
                . " ,(select top 1 c_code from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_cnt_code"
                . " ,(select top 1 c_name from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_cnt_name"
                . " ,(select top 1 c_name_inv from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_name_inv"
                . " ,(select top 1 isnull(c_address_inv,'')+isnull(c_address_inv2,'') from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_address_inv"
                . " ,(select top 1 isnull(c_name,'') from dc_disc_type where dc_disc_type_id=a.dc_disc_type_id) as condition_pay" 
                . " ,(select top 1 c_address from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_address" 
                . " ,(select top 1 c_tax_value from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_tax_value"
                . " ,(select top 1 c_email from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_email"
                . " ,(select top 1 c_fax from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_fax"
				. " ,(select top 1 c_website from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_website" 
                . " ,(select top 1 c_mobile from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_mobile"
                . " ,(select top 1 c_telephone from dc_cnt where dc_cnt_id=a.dc_cnt_id) as c_telephone"  
                . " ,(select top 1 c_name from dc_business_area where dc_area_id=a.dc_area_id) as c_area_name"
                . " ,(select top 1 c_name from dc_cnt_type where dc_cnt_type_id=a.dc_cnt_type_id) as dc_cnt_type_name"				
                . " ,(select top 1 onair_yyyy_mm from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id) as onair_yyyy_mm" 
                . " ,(select top 1 isnull(c_invoice_item,'') from ar_pre_print_bill_dtl where ar_pre_print_bill_hdr_id=a.ar_pre_print_bill_hdr_id) as c_name" 
                . " ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name                    
                    ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name                    
                    , convert(varchar, a.d_create, 120) as d_create                  
                    ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name                   
                    ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name                   
                    , convert(varchar, a.d_update, 120) as d_update"
        . " from ({$sqlTempTable}) a WHERE a.row > ? and a.row <= ?";
$arrParam[] = $start;
$arrParam[] = $limit;
 
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;

$f_pj_amt = 0;
$f_dtl_amt = 0;
    
        $sqlClose = "select max(bill_yyyy_mm) from ar_close_bill_hdr where i_close_bill=0 and i_is_center=1"; //ส่วนกลาง 
        $bill_yyyy_mm 	= $db->GetDataBySQL($sqlClose, array(1));
		
		$orderTypeArr	=	array(1=>"<font color=red>แลกเปลี่ยน</font>",0=>"<font color=red>ไม่แลกเปลี่ยน</font>");

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
 
	$r_ar_code =  null;
	$r_ar_date	= null;
				
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
    
//	$p = "<img style='margin:0px 0px -2px 2px;' src='../images/icons/printer_mono.png'>";
//	$c_codePrint = "<span style='color:blue'>{$row["c_area_code"]}</span>{$p}";
//	$print_status = $row["c_code"]!='0'?1:0;
// 	$c_code = $print_status?$c_codePrint:$row["c_area_code"];

	$sqlPrinting = "select * from ar_pre_print_bill_hdr where i_enable=1 and ar_bill_invoice_hdr_id=?";
	$pre_print = $db->GetDataBySQL($sqlPrinting, array($row["{$table}_id"]));  

	    if ($row["c_contract_no"] !='0'){ 			
                $r_ar_code =  $row["c_contract_no"];
                $r_ar_date	= $row["d_contract_date"];	// วันที่ทำสัญญา
            }
            else{ 
                $r_ar_code  = $row["c_po_no"];
                $r_ar_date	= $row['d_so_date'];		// วันที่สั่งซื้อ
            }
			
	
	$temp = array("no" => ($i++), 
                    "id" 				=> $row["{$table}_id"],
                    "ar_so_hdr_id"		=> $row["ar_so_hdr_id"],
					"ar_bill_invoice_hdr_id" => $row["{$table}_id"],
					"print_status"		=>$print_status,
					"ar_pre_print_bill_hdr_id" => $pre_print["ar_pre_print_bill_hdr_id"],
					"c_billing_name" 	=> $row["c_billing_name"]."( ".substr($row["c_cnt_code"],2).")",
					"c_billing_addr" 	=> $row["c_billing_addr"],
                    "c_code" 			=> $c_code,
                    "c_name" 			=> $row["c_name"],
                    "c_enable" 			=> $arrEnabled[$row["i_enable"]],
                    "i_enable" 			=> $row["i_enable"],
                    "so_code" 			=> $row["so_code"], 
                    "so_contract" 		=> $r_ar_code?$r_ar_code:null,	
                    "so_date" 			=> $r_ar_date?$date->long_date_from_db($r_ar_date):null,
                    "c_billing_date" 	=> $date->long_date_from_db($row["d_billing_date"]),					
                    "c_area_code" 		=> $row["c_area_code"], 
                    "c_area_print" 		=> $row["c_area_print"],  
                    "dc_product_type_id" => $row["dc_product_type_id"],
                    "dc_vat_id" 		=> $row["dc_vat_id"],
                    "vat_rate" 			=> $row["vat_rate"],
                    "c_yyyy_mm" 		=> $row["c_yyyy_mm"],
                    "onair_yyyy_mm" 	=> $row["onair_yyyy_mm"]?(@$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543)):null,

                    "bill_yyyy_mm"      => $bill_yyyy_mm,
                    "txt_yyyy_mm"       => $bill_yyyy_mm?(@$date->l_month_thai[substr($bill_yyyy_mm,4,2)]." ".(floatval(substr($bill_yyyy_mm,0,4))+543)):null,        
                    "c_address" 		=> $row["c_address"], 
                    "c_tax_value" 		=> $row["c_tax_value"], 
                    "c_email" 			=> $row["c_email"], 
                    "c_website" 		=> $row["c_website"], 
                    "c_fax" 			=> $row["c_fax"], 
                    "c_mobile" 			=> $row["c_mobile"], 
                    "c_telephone" 		=> $row["c_telephone"],  
                    "c_name_inv" 		=> $row["c_name_inv"], 
                    "c_address_inv" 	=> $row["c_address_inv"],  	 
                    "dc_area_id" 		=> $row["dc_area_id"],
                    "c_area_name" 		=> $row["c_area_name"],
					"condition_pay" 	=> $row["condition_pay"],
                    "order_type" 		=> @$orderTypeArr[$row["i_is_barter"]],    
					"c_cnt_type" 		=> $row["dc_cnt_type_name"],
					
					"i_is_show_disc_cash" 	=> $row["i_is_show_disc_cash"],
					"i_is_show_txt_dtl" 	=> $row["i_is_show_txt_dtl"],
					"due_bill" 	=> $row["due_bill"],
					
					"d_end_credit" =>$date->extDateBuddha($row["d_end_credit"]),
					"f_vat_amt"        =>number_format($row["f_vat_amt"],2), 
                    "f_total_cost"      =>number_format($row["f_total_cost_amt"],2), 
                    "f_disc_com_amt"    =>number_format($row["f_disc_com_amt"],2), 
                    "f_disc_cash_amt"   =>number_format($row["f_disc_cash_amt"],2), 
                    "f_net_cost"        =>number_format($row["f_net_cost_amt"],2), //form 
					 
                    "cancelID" 		=> $buCancel,        
					"delCancelID" 	=> $buDel,
					"buStatus" 		=> $buStatus,
                    "editID" 		=> $buEdit,
 
                    "txtdc_cnt_idID" 	=> $row["c_cnt_name"]?$row["c_cnt_code"]." ".$row["c_cnt_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]", //frm
                    "c_cnt_name" 	=> $row["c_cnt_name"]?$row["c_cnt_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]</span>", //grid				
                    "dc_cnt_id" 	=> $row["dc_cnt_id"],
                    "d_so_date"            =>$date->extDateBuddha($row["d_so_date"]),                                
                    "d_doc_date"            =>$date->extDateBuddha($row["d_doc_date"]),
                    "d_billing_date" 			=>$date->extDateBuddha($row["d_billing_date"]),
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