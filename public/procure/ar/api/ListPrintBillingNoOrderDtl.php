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
 
 if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETPRINT"){
       
     
     //Save Get Detail
        $sqlMain = "select * from ar_pre_print_bill_dtl where ar_pre_print_bill_hdr_id=? Order by ar_pre_print_bill_dtl_id asc"; 
        $stmt = $db->QueryParam($sqlMain, array($_REQUEST['id'])); 
        $table='<table border="0" cellspacing="0" cellpadding="0" width="100%">';
        $table.='<thead><tr class="th"><td>รายการ</td><td>จำนวน</td><td>ราคา</td></tr></thead>';
	while($row =$db->Fetch($stmt))				
	{
             $table.='<tr class="th">'
                     . '<td align="left">'.$row['c_invoice_item'].'</td>'
                     . '<td align="right">'.$row['f_quan'].'</td>'
                     . '<td align="right">'.$row['f_total_cost'].'</td>'
                     . '</tr>';
        }
        $table.="</table>"; 
        $printHTML = $table;
        
         ${$root}[] = array("printHTML"=>$printHTML);      
         echo json_encode(array("totalCount"=>1,$root=>${$root})); exit;
        
 }else if(isset($_REQUEST['mode']) && $_REQUEST['mode']=="GETDATA")
 { 
               // $wh = (isset($_REQUEST['mn']) && $_REQUEST['mn']=='editso')?"":" and isnull(i_enable,2) = 1"; //show i_enable= 0
                
		$sqlTempTable = "select {$table}.ar_bill_invoice_dtl_id
                                                            ,{$table}.ar_bill_invoice_hdr_id
                                                            ,{$table}.ar_condi_pay_hdr_id
                                                            ,{$table}.ar_condi_pay_dtl_id
                                                            ,{$table}.ar_so_dtl_id
                                                            ,{$table}.ar_dtl_period_onair_id
                                                            ,{$table}.pj_send_period_dtl_id
                                                            ,{$table}.pj_period_budget_id
                                                            ,{$table}.ar_so_activi_id
                                                            ,{$table}.dc_wht_tax_id 
                                                            ,{$table}.f_total_cost
                                                            ,{$table}.f_new_net_cost
                                                            ,{$table}.f_req_amt
                                                            ,{$table}.f_req_total_amt
                                                            ,{$table}.f_disc_com
                                                            ,{$table}.f_disc_cash
                                                            ,{$table}.f_net_disc_comm_amt
                                                            ,{$table}.f_net_cost 
                                                            ,{$table}.f_wht_amt
                                                            ,{$table}.f_left_cost
                                                            ,{$table}.f_balance_amt 
                                                            ,{$table}.i_parent_edit_id
                                                            ,{$table}.i_is_adjust
                                                            ,{$table}.i_is_receive 
                                                            ,{$table}.c_comment  
                                                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_create_id) as c_create_name
                                                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_create_cost_id) as c_cost_creat_name
                                                            , convert(varchar, {$table}.d_create, 120) as d_create
                                                            ,(select top 1 c_full_name from dc_user where dc_user_id={$table}.dc_user_update_id) as c_update_name
                                                            ,(select top 1 c_name from dc_cost where dc_cost_id={$table}.dc_user_update_cost_id) as c_cost_update_name
                                                            , convert(varchar, {$table}.d_update, 120) as d_update 
                                                    , ROW_NUMBER() OVER (ORDER BY {$sort} {$dir}) as row 
													FROM {$table} 
													inner join ar_so_dtl b on b.ar_so_dtl_id={$table}.ar_so_dtl_id 				
                                    where {$table}.ar_bill_invoice_hdr_id=?"; 			
	$arrParam       = array($_REQUEST['id']);
	$arrCountParam 	= array($_REQUEST['id']);
        /*   หมายเหตุ
         *   case (i_no_order) d_end_pay as d_end_credit
         */
	$sqlMain	= "select b.f_quan as f_quan  
		, c.c_name as c_name 
		,(select onair_yyyy_mm from ar_so_hdr where ar_so_hdr_id=b.ar_so_hdr_id) as onair_yyyy_mm
		,(select i_group_type from ar_so_hdr where ar_so_hdr_id=b.ar_so_hdr_id) as i_group_type
		,(select convert(varchar, d_end_pay, 120) from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as d_end_credit
		,(select f_vat_amt from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as f_vat_amt
		,(select f_net_cost_amt from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as f_net_cost_amt
		,(select f_disc_com_amt from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as f_disc_com_amt
		,a.* from ({$sqlTempTable}) a 
	inner join ar_so_dtl b on b.ar_so_dtl_id=a.ar_so_dtl_id 
	inner join dc_product c on c.dc_product_id=b.dc_product_id
	order by a.row ";
	 
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i = $start + 1;
	$c_group_type =array(1=>"โฆษณาในรายการ",2=>"เช่าเวลาในรายการ");

	$f1 = null;$f2 = null;$f3 = null;$f4 = null;$f5 = null;$f6 = null; 
	$f_quan = null;
	$f_bal = null;
	$soBill = 0;
	$c_product = null;
	$onair = null; 
	while($row =$db->Fetch($stmt))				
	{
//

				$group_type = $c_group_type[$row["i_group_type"]];
				
    /*             $billing = $so->dtlBilling($row["{$table}_id"]);
                $soBill+=$billing; */
                        $temp = array("no" => ($i++), //accessData =view  
						"id" 		=> $row["{$table}_id"],
						"soDtlID" 			=> '<img src="../images/icons/document_delete.gif" style="cursor:pointer"/>',                            
						"soDtlEditID"   	=> null,
						"c_name" 			=> ""
						."<input type='hidden' name='ar_bill_invoice_dtl_id[]' value='".$row["ar_bill_invoice_dtl_id"]."'>" 
						."<input type='text' style='font-size:12px;width:90%;margin:1px;' name='items".$row["{$table}_id"]."' value='".$group_type.$row["c_name"]."'>"
						."<br/>"
						."<input type='text' style='font-size:12px;width:90%;margin:0px;' name='c_comment".$row["{$table}_id"]."' value='".$row["c_comment"]."'>",
					 
						"c_comment" 		=> $row['c_comment'],  
						"f_total_cost" 		=> "<input type='hidden' name='f_total_cost".$row["{$table}_id"]."' value='".$row["f_total_cost"]."'>".number_format($row["f_total_cost"],2), 
						"f_quan"                => "<input type='text' style='font-size:12px;width:55px;text-align: right;margin:-2px;' name='f_quan".$row["{$table}_id"]."' value='".number_format($row["f_quan"],2)."'>",
						"d_end_credit" 		=> $date->extDateBuddha($row["d_end_credit"])						
					);
	 //"d_end_credit"              =>$date->long_date_from_db($row["d_end_pay"]),// for print no order  
		if($typePrint=="noneGroup"){ 
				$c_product .= $row["c_name"]." ,"; 
				$f_quan += $row["f_quan"];
				$conair_yyyy_mm = @$date->l_month_thai[substr($row["onair_yyyy_mm"],4,2)]." ".(floatval(substr($row["onair_yyyy_mm"],0,4))+543);
                }else{  
				${$root}[] = $temp; 
		}
		
		
		
		
		$f1 += $row["f_total_cost"];
 
		$payDay = $date->long_date_from_db($row["d_end_credit"]);
		//==================
		$due = "ชำระที่ฝ่ายการเงิน บมจ. อสมท ภายในวันที่  ".$payDay;
		
		$f_vat_amt = $row["f_vat_amt"];
		$f_net_cost_amt = $row["f_net_cost_amt"];
		$f_disc_com_amt = $row["f_disc_com_amt"];
		$f_net_amt 		= floatval($f_net_cost_amt+$f_vat_amt);
	}//End Loop
	
		
	
 	function FloatBillText($mon,$f_net_amt){
			$baht = substr(number_format($f_net_amt,2),-2);
			$total_conv = "";
			if ( $baht=="00")
				$total_conv = $mon->convertTxtBath(number_format($f_net_amt,2))."บาทถ้วน";
			else
				$total_conv = $mon->convertTxtBath(number_format($f_net_amt,2))."บาท".$mon->convertTxtSatang($baht)."สตางค์";
		return $total_conv_text 	= 	"(".$total_conv.")";  
	}// End Function
	 
	$total_conv_text = FloatBillText($mon,$f_net_amt);	
	
	if($typePrint=="noneGroup"){
		$c_product = $group_type." ".$c_product;
		$c_product = substr($c_product,0, -1)." (  ออกอากาศ {$conair_yyyy_mm})";
		${$root}[] = array("no" => ($i++), 
		"id" 		=> 'grandTotal0', 
		"c_name" 	=> ""	 
                ."<input type='text' style='font-size:12px;width:90%;margin:1px;' id='itemsSum' name='itemsSum' value='".$c_product ."'>"
                ."<br/>"
                ."<input type='text' style='font-size:12px;width:90%;margin:0px;' id='c_commentSum' name='c_commentSum' value=''>",
                "f_quan" => "<input type='text' style='font-size:12px;width:55px;text-align: right;margin:-2px;' name='f_quanSum' value='".number_format($f_quan,2)."'>",
		"f_total_cost" => "<p style='font-weight:bold;'>".number_format($f1,2)."</p>"
               . "<input type='hidden' name='f_total_costSum' value='{$f1}'>"  
						);
	}// IF 		noneGroup 
 
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'ราคาทั้งสิ้น'.'</p>', 
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".number_format($f1,2)."</p>"
						."<input type='hidden' name='f_total_cost' value='{$f1}'>");
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal2', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'ส่วนลดการค้า'.'</p>',     
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".number_format($f_disc_com_amt,2)."</p>"
						."<input type='hidden' name='f_disc_com_amt' value='{$f_disc_com_amt}'>");						
					
					
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal3', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'จำนวนเงินก่อนภาษีมูลค่าเพิ่ม'.'</p>',   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".number_format($f_net_cost_amt,2)."</p>" 
						."<input type='hidden' name='f_net_cost_amt' value='{$f_net_cost_amt}'>");
 
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal5', 
						"c_name" 	=> '<p style="font-weight:bold;">'.'ภาษีมูลค่าเพิ่ม'.'</p>',   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".number_format($f_vat_amt,2)."</p>" 
						."<input type='hidden' name='f_vat_amt' value='{$f_vat_amt}'>");
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal6', 
						"c_name" 	=> "<p style='font-weight:bold;'>"."รวมเป็นเงินทั้งสิ้น"."</p>",   
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".number_format($f_net_amt,2)."</p>"
						."<input type='hidden' name='f_net_amt' value='{$f_net_amt}'>");
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal7', 
						"c_name" 	=> "<input type='text' style='font-size:12px;width:90%;margin:-2px;' id='c_invoice_item1' name='c_invoice_item1' value='".$due."'>",  
						"f_total_cost" 		=> "<p style='font-weight:bold;'>".$total_conv_text."</p>"
						."<input type='hidden' name='f_net_text' value='{$total_conv_text}'>");
	${$root}[] = array("no" => ($i++), 
						"id" 		=> 'grandTotal8', 
						"c_name" 	=> "<input type='text' style='font-size:12px;width:90%;margin:-2px;' id='c_invoice_item2' name='c_invoice_item2' value=''>",  
						"f_total_cost" 		=> "<p style='font-weight:bold;'>&nbsp;</p>");
 
	

        //itemsSum 			
	$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam); 
	echo json_encode(array("debug"=>true,"totalCount"=>$totalCount,$root=>${$root}));
 
        
        
}else{
	echo "Invalid GETDATA";
}
?>