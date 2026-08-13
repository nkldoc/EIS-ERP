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
$table	= "ar_so_hdr";
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
if (!$util->get($sort)) {  	$sort 	= "c_code"; }
###################
$sta = array(0=>"แก้ไข",
		2=>"ปกติ",
		3=>"ไม่สมบูรณ์",
		"" =>"เลือกทั้งหมด");
	
	$wh = null;

        
     
 
if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="SEARCH")
{
            $wh = " {$table}.onair_yyyy_mm >=? "
                . "AND isnull(c_code,'0')!='0' "
                . "AND i_class_type=".AR_CLASS_TYPE_TV." "
                . "AND ISNULL(i_enable,".STATUS_DISABLE.") !=".STATUS_DISABLE." "
                //Check
                . " and {$table}.ar_so_hdr_id in(select ar_so_hdr_id from ar_so_dtl 
		where ar_so_dtl_id not in(select d.ar_so_dtl_id from ar_bill_invoice_dtl d 
			inner join ar_bill_invoice_hdr h on h.ar_bill_invoice_hdr_id=d.ar_bill_invoice_hdr_id 
			where isnull(h.c_code,'0') !='0' and isnull(h.i_enable,2)=1) 
		and parent_id not in(select d.ar_so_dtl_id from ar_bill_invoice_dtl d 
			inner join ar_bill_invoice_hdr h on h.ar_bill_invoice_hdr_id=d.ar_bill_invoice_hdr_id 
			where isnull(h.c_code,'0') !='0' and isnull(d.ar_so_dtl_id,0) !=0 and isnull(h.i_enable,2) = 1)
		and isnull(i_enable,2) = 1)";
                
        $arrParam[] 		= '200912';
        $arrCountParam[]	= '200912';

                
    if($value!=''){ 
        if($_REQUEST['filter']=='cnt_name'){
            $wh .=" and dc_cnt_id in (select dc_cnt_id from dc_cnt where c_name like ?)";
            $arrParam[] ="%{$value}%";	
            $arrCountParam[] = "%{$value}%";
        }else{
            $wh .=" and ".$_REQUEST['filter']." like ?";
            $arrParam[] ="%{$value}%";	
            $arrCountParam[] = "%{$value}%"; 
        } 	
    }
    if($_REQUEST['month']!=-1 && $_REQUEST['year']!=-1){
        $wh .=" and onair_yyyy_mm = ?";
        $arrParam[] = (intval($_REQUEST['year'])-543)."".$_REQUEST['month'];	
        $arrCountParam[] = $_REQUEST['year']."".$_REQUEST['month']; 
    }    
    if($_REQUEST['i_is_bill_complete']!=-1){
           $wh .=" and isnull(i_is_bill_complete,0) = ?";
           $arrParam[] = $_REQUEST['i_is_bill_complete'];	
           $arrCountParam[] = $_REQUEST['i_is_bill_complete'];      
    }
 
}else{ 

        //$wh = " isnull(i_no_order,0)!=1 AND i_class_type=".AR_CLASS_TYPE_TV." and ISNULL(i_enable,".STATUS_DISABLE.") != ?";
        $wh = " {$table}.onair_yyyy_mm >=? "
                . "AND isnull(c_code,'0')!='0' "
                . "AND i_class_type=".AR_CLASS_TYPE_TV." "
                . "AND ISNULL(i_enable,".STATUS_DISABLE.") !=".STATUS_DISABLE." "
                //Check
                . " and {$table}.ar_so_hdr_id in(select ar_so_hdr_id from ar_so_dtl 
		where ar_so_dtl_id not in(select d.ar_so_dtl_id from ar_bill_invoice_dtl d 
			inner join ar_bill_invoice_hdr h on h.ar_bill_invoice_hdr_id=d.ar_bill_invoice_hdr_id 
			where isnull(h.c_code,'0') !='0' and isnull(h.i_enable,2)=1) 
		and parent_id not in(select d.ar_so_dtl_id from ar_bill_invoice_dtl d 
			inner join ar_bill_invoice_hdr h on h.ar_bill_invoice_hdr_id=d.ar_bill_invoice_hdr_id 
			where isnull(h.c_code,'0') !='0' and isnull(d.ar_so_dtl_id,0) !=0 and isnull(h.i_enable,2) =1)
		and isnull(i_enable,2) = 1
	)";
        $arrParam[] 		= '200912';
        $arrCountParam[]	= '200912';		
} 
 
	$sqlTempTable = "select {$table}.{$table}_id  
                            ,{$table}.dc_cost_id 
                            , {$table}.dc_cnt_id  
                            ,'' as pj_name
                            ,'' as commit_name
                            ,{$table}.pj_hdr_id
                            ,{$table}.c_name
                            ,isnull({$table}.c_code,'0') as c_code 
                            ,{$table}.c_comment 
                            ,{$table}.c_billing_inv_des
                            ,{$table}.i_is_commit
                            ,{$table}.i_group_type
                            ,{$table}.i_enable
                            ,{$table}.c_so_no 
                            ,{$table}.c_po_no
                            ,{$table}.c_contract_no
                            ,isnull({$table}.i_is_sale_external,0) as i_is_sale_external 
                            ,{$table}.bh_contract_id
                            ,{$table}.i_cont
                            ,{$table}.dc_comm_id 
                            ,isnull({$table}.i_is_barter,0) as i_is_barter 
                            ,isnull({$table}.i_is_imc,0) as i_is_imc
                            ,isnull({$table}.i_is_status,0) as i_is_status
                            , {$table}.onair_yyyy_mm
                            , convert(varchar, {$table}.d_doc_date, 120) as d_doc_date 
                            , convert(varchar, {$table}.d_so_date, 120) as d_so_date
                            ,{$table}.dc_user_create_id
							,(select top 1 dc_disc_type_id from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as dc_disc_type_id
							 ,(select top 1 dc_cnt_type_id from dc_cnt where dc_cnt_id={$table}.dc_cnt_id) as dc_cnt_type_id
							,(select top 1 dc_area_id from dc_cost where dc_cost_id={$table}.dc_cost_id) as dc_area_id
                            ,{$table}.dc_user_create_cost_id
                            ,{$table}.d_create
                            ,{$table}.dc_user_update_id
                            ,{$table}.dc_user_update_cost_id
                            ,{$table}.d_update  
                    , ROW_NUMBER() OVER (ORDER BY $sort $dir) as row FROM {$table} 
                    where {$wh} ".$util->viewAcc($i_read);
					
$sqlMain = "select * "
                . " ,(select sum(isnull(f_total_cost,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_total_cost"
                . " ,(select sum(isnull(f_disc_com_amt,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_disc_com_amt"
                . " ,(select sum(isnull(f_disc_cash_amt,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_disc_cash_amt"
                . " ,(select sum(isnull(f_net_cost,0)) from ar_so_dtl where isnull(i_enable,2) = 1 and ar_so_hdr_id=a.ar_so_hdr_id) as f_net_cost"
              
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
				
                . " ,(select top 1 c.c_name_show from ar_so_dtl aa
                                            inner join dc_product b on case when aa.dc_product_id > 0 then aa.dc_product_id else aa.dc_product_radio_id end = b.dc_product_id
                                            inner join dc_channel c on b.dc_channel_id = c.dc_channel_id where aa.ar_so_hdr_id =a.ar_so_hdr_id) as c_name_show"

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

$orderTypeArr	=	array(1=>"<font color=red>แลกเปลี่ยน</font>",0=>"<font color=red>ไม่แลกเปลี่ยน</font>");
$sqlClose = "select max(bill_yyyy_mm) from ar_close_bill_hdr where i_close_bill=0 and i_is_center=1"; //ส่วนกลาง
$bill_yyyy_mm = $db->GetDataBySQL($sqlClose, array(1));   	
	
while($row =$db->Fetch($stmt))				
{
 
                
        $row["c_code"] = ($row["c_code"]!='')?$row["c_code"]:0;
        
        $chkPerEdit = ($row["c_code"])?1:0;
        $chkPerDel  = ($row["c_code"])?1:0;   
        
        
	$temp = array("no" => ($i++), 
                    "id" 		=> $row["{$table}_id"],
                    "ar_so_hdr_id"      => $row["{$table}_id"],
                    "c_code" 		=> $row["c_code"],
                    "c_name" 		=> $row["c_name"], 
					
					    
					"c_cnt_type" 	=> $row["dc_cnt_type_name"],	
					"order_type" 	=> @$orderTypeArr[$row["i_is_barter"]],
					 
                    "dc_comm_id"        => $row["dc_comm_id"], 
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
					"condition_pay" 	=> $row["condition_pay"],
					"dc_area_id" 	=> $row["dc_area_id"],
					"c_area_name" 	=> $row["c_area_name"],
                    "f_pj_amt"          => 0,
                           
                    "f_total_cost"      =>number_format($row["f_total_cost"],2), 
                    "f_disc_com_amt"    =>number_format($row["f_disc_com_amt"],2), 
                    "f_disc_cash_amt"   =>number_format($row["f_disc_cash_amt"],2), 
                    "f_net_cost"        =>number_format($row["f_net_cost"],2), //form 
                            
                    "f_dtl_amt"         =>number_format($row["f_net_cost"],2), //grid
                    "i_group_type"      => $row["i_group_type"],
                   
                    "due_bill"          =>$row["due_bill"],     
                    "channel_name"      =>$row["c_name_show"],
                    "c_contract_no"     =>$row["c_contract_no"],        
                    //"delID"  => ($chkPerEdit)?'':'<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',
                    "editID" => (0)?'':'<img src="./images/icons/billing-icon.png" style="cursor:pointer"/>',
                    "txtdc_emp_idID" 	=> $row["i_is_sale_external"]?null:$row["commit_name"], 
                    "dc_emp_id"		=> $row["i_is_sale_external"]?null:$row["dc_comm_id"],
                    "txtdc_ext_idID" 	=> $row["i_is_sale_external"]?$row["commit_name"]:null,  
                    "dc_ext_id"		=> $row["i_is_sale_external"]?$row["dc_comm_id"]:null, 
                   // "c_cost_name" 	=> $row["c_cost_name"]?$row["c_cost_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cost_id"]."]</span>", 
                    "dc_cost_id" 	=> $row["dc_cost_id"],
                    "txtpj_hdr_idID" 	=> $row["pj_name"],//?$row["pj_name"]:"ไม่มีข้อมูลรหัส[".$row["pj_hdr_id"]."]", 
                    "pj_hdr_id"		=> $row["pj_hdr_id"],
                    "is_status"		=> $sta[$row["i_is_status"]],
                    "txtdc_cnt_idID" 	=> $row["c_cnt_name"]?$row["c_cnt_code"]." ".$row["c_cnt_name"]:"ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]", //frm
                    "c_cnt_name" 	=> $row["c_cnt_name"]?$row["c_cnt_name"]:"<span style='color:red'>ไม่มีข้อมูลรหัส[".$row["dc_cnt_id"]."]</span>", //grid				
                    "dc_cnt_id" 	=> $row["dc_cnt_id"],
                    "c_so_no" 		=> $row["c_so_no"],
                    "c_po_no" 		=> $row["c_po_no"], 
                    "i_is_imc" 		=> $row["i_is_imc"],
                    "i_is_barter" 	=> $row["i_is_barter"],
                    "i_is_sale_external" => $row["i_is_sale_external"],
                    "onair_yyyy_mm" 	=> $row["onair_yyyy_mm"]?(@$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543)):null,
                    "onair_mm"			=>substr($row["onair_yyyy_mm"],4,2),
                    "onair_yyyy"		=>substr($row["onair_yyyy_mm"],0,4),
                    "c_comment" 		=> $row["c_comment"],
                    "c_billing_inv_des" => $row["c_billing_inv_des"],
                    "i_enable" 			=> $row["i_enable"], 
                    "i_is_commit" 		=> $row["i_is_commit"],
                    "bh_contract_id" 	=> $row["bh_contract_id"],
                    "i_cont" 			=> $row["i_cont"],
                    "d_doc_date" 				=>$date->extDateBuddha($row["d_doc_date"]),
                    "d_so_date" 				=>$date->extDateBuddha($row["d_so_date"]),
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