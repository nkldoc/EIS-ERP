<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/date/i_date.class.php");

function headerX($t='',$rd){
	$title= $_REQUEST['titleReport'];
	$tt = isset($t) && $t!=''?true:false;
	switch($t)
	{ 
		case 'excel': $ttt = 'xls'; break; 
		case 'downloadHTML': $ttt = 'html'; break;  
		case 'html': $ttt 	= ''; break;
		default: $ttt='';
	} 
	if($ttt!=''){ //file include is not spacing outer tag php
		header("Content-Type: application/octet-stream");
		header("Content-Transfer-Encoding: binary");
		header('Expires: '.gmdate('D, d M Y H:i:s').' GMT');
		header('Content-Disposition: attachment; filename = "'.$title.' '.date("Y-m-d-H-i-s").'.'.$ttt.'"');
		header('Pragma: no-cache'); 
		echo chr(255).chr(254).iconv("UTF-8", "UTF-16LE//IGNORE", $rd);  
	}else{
		header('Content-Type: text/html; charset=utf-8');
		echo '<style type="text/css"> body{ padding:0px; margin:0px; } #footer td{ background-color:#fff;} </style>';
		echo $rd;
	}   
}; //Function

###################
$db 	= new DatabaseServer();
$date 	= new i_date();
########################################################################## 

//iSearch
$i_enable = $_REQUEST["i_enable"];
$enabled = null;
$arrStatus = array("0"=>"ทั้งหมด", STATUS_ENABLE=>"ใช้งาน", STATUS_DISABLE=>"ไม่ใช้งาน");

$mm = sprintf ("%02d",$_REQUEST['onair_mm']); 
$th_mm_yyyy = $date->l_month_thai["{$mm}"]." พ.ศ. ".($_REQUEST['onair_yyyy'] + 543);

$cost1 = explode(" ", $_REQUEST['txtdc_cost_idID']);
$cost2 = explode(" ", $_REQUEST['txtdc_cost_id2ID']);

$yyyy_mm =($_REQUEST['onair_yyyy'])."".$mm;
if($_REQUEST["i_enable"]!=0){
	$enabled = "AND a.i_enable='".$_REQUEST["i_enable"]."'";
}
if(isset($_REQUEST['dc_debtor_id']) && $_REQUEST['dc_debtor_id']>0){
	$debtor = "and a.dc_debtor_id in (select dc_debtor_id from dc_debtor where dc_debtor_id={$_REQUEST['dc_debtor_id']})";
}else{
	$debtor = "";
}
$where = "";
if ($i_enable > 0)
$where .= " and i_enable = {$i_enable}";
$sql = "select a.ar_bill_invoice_hdr_id 
		, isnull(a.ar_so_hdr_id,0) as ar_so_hdr_id
		, isnull((select top 1 c_code from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id),'-') as so_code
		, isnull((select top 1 c_po_no from ar_so_hdr where ar_so_hdr_id=a.ar_so_hdr_id),a.c_contract_no) as c_contract_no
		, a.f_vat_rate
		, a.f_before_edit_tax
		, a.f_before_edit_vat
		, a.f_tax_amt
		, a.f_vat_amt
		, (select sum(f_total_cost) from ar_bill_invoice_dtl where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as f_total_cost
		, a.f_net_cost 
		, a.c_code
		, a.bl_code 
		, a.c_invoice_item
		, a.i_enable
		, a.dc_cost_id
		, a.c_name_inv
		, (select top 1 c_code+' '+c_name from dc_cost where dc_cost_id=a.dc_cost_id) as c_cost_name
		, convert(varchar, a.d_billing_date, 120) as d_billing_date  
		, convert(varchar, a.d_endpay_date, 120) as d_endpay_date
		, convert(varchar, a.d_doc_date, 120) as d_doc_date			 
		from ar_bill_invoice_hdr a
		where a.dc_cost_id in (select dc_cost_id from dc_cost where c_code BETWEEN '{$cost1[0]}' AND '{$cost2[0]}') 
		AND CONVERT(NVARCHAR(6), d_billing_date, 112) = '{$yyyy_mm}'
		{$enabled}
		{$debtor}
		;
		";
/* echo $sql; exit; */
$stmt = $db->QueryParam($sql, array(1));
$i = 1;
$str = "";

//css
$doubleLine = "style='border-bottom: 3px double;'";
$bold = "style='font-weight:bold;'";

	$dc_cost_id = 0;
	$f1 = 0;
	$f2 = 0;
	$f3 = 0; 	 
	$f11 = 0;
	$f21 = 0;
	$f31 = 0; 	 
while ($data = $db->Fetch($stmt))
{ 
	 if($data["dc_cost_id"]!=$dc_cost_id)
	 {
		if($f3>0)
		{ 
			
			$str .= "<tr bgColor='#eee'>"	
					."<td colspan='8' align='right'>รวมตามหน่วยงาน  :  {$c_cost_name} </td>"
					."<td align='right' {$doubleLine}>".number_format($f1,2)."</td>"
					."<td align='right' {$doubleLine}>".number_format($f2,2)."</td>"
					."<td align='right' {$doubleLine}>".number_format($f3,2)."</td>"
			."</tr>";	
			$f1 = 0;
			$f2 = 0;
			$f3 = 0; 
			$i	= 1; 		
		}
 
		$str .= "<tr bgColor='#ccc' {$bold}>"."<td colspan='11' align='left'>หน่วยงาน  :  {$data["c_cost_name"]} </td>"."</tr>";
		$dc_cost_id 	= $data["dc_cost_id"];
		$c_cost_name 	= $data["c_cost_name"];

	 }//End Cost
	 //
	$str .= "<tr>"
			."<td align='center'>{$i}</td>"
			
			."<td valign='top' align='left'>{$data["c_name_inv"]}</td>"
			."<td valign='top' align='left'>{$data["c_contract_no"]}</td>"
			."<td valign='top' align='center'>{$data["so_code"]}</td>"
			."<td valign='top' align='center'>{$data["c_code"]}</td>" 
			."<td valign='top' align='center'>".$date->long_date_from_db($data["d_billing_date"])."</td>"
			."<td valign='top' align='center'>".$date->long_date_from_db($data["d_endpay_date"])."</td>"
			."<td valign='top' align='left'>{$data["c_invoice_item"]}</td>" 
			."<td valign='top' align='right'>".number_format($data["f_total_cost"],2)."</td>"
			."<td valign='top' align='right'>".number_format($data["f_vat_amt"],2)."</td>" 
			."<td valign='top' align='right'>".number_format(($data["f_total_cost"]+$data["f_vat_amt"]),2)."</td>" 
			."</tr>";
			
	
	$i++;

	$f1 += $data["f_total_cost"];
	$f2 += $data["f_vat_amt"];
	$f3 += $data["f_total_cost"]+$data["f_vat_amt"]; 

	$f11 += $data["f_total_cost"];
	$f21 += $data["f_vat_amt"];
	$f31 += $data["f_total_cost"]+$data["f_vat_amt"]; 

	
}// end while
			if($f3>0)
			{ 
 
				$str .= "<tr bgColor='#eee'>"	
						."<td colspan='8' align='right'>รวมตามหน่วยงาน  :  {$c_cost_name} </td>"
						."<td align='right' {$doubleLine}>".number_format($f1,2)."</td>"
						."<td align='right' {$doubleLine}>".number_format($f2,2)."</td>"
						."<td align='right' {$doubleLine}>".number_format($f3,2)."</td>"
				."</tr>";
				$str .= "<tr bgColor='#ccc'>"	
						."<td colspan='8' align='right'>รวมทั้งหมด</td>"
						."<td align='right' {$doubleLine}>".number_format($f11,2)."</td>"
						."<td align='right' {$doubleLine}>".number_format($f21,2)."</td>"
						."<td align='right' {$doubleLine}>".number_format($f31,2)."</td>"
				."</tr>";
	 
			}
//ห้ามมีช่องว่างระหว่างนี้ excel Encoding False;
if($str == "")$str = "ไม่พบข้อมูล";  
$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"font-size:13px; border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
			<tr><th colspan='11' align='center'>{$_REQUEST['titleReport']}</th></tr>
			<tr><th colspan='11' align='left'>จากหน่วยงาน  :  {$_REQUEST['txtdc_cost_idID']}</th></tr>
			<tr><th colspan='11' align='left'>ถึงหน่วยงาน  :  {$_REQUEST['txtdc_cost_id2ID']}</th></tr> 
			<tr><th colspan='11' align='left'>ลูกค้า  :  {$_REQUEST['txtdc_debtor_idID']}</th></tr>
			<tr><th colspan='11' align='left'>เดือน/ปี ที่แจ้งหนี้ : {$th_mm_yyyy}</th></tr> 
			<tr><th colspan='11' align='left'>สถานะ  :  {$arrStatus[$i_enable]}</th></tr>
		</table>
		<table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"  font-size:13px; border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
			<tr bgcolor='#A5BAD6'>
				<th width='2%' align='center'><b>ลำดับที่</b></th>
				<th width='8%' align='center'><b>ชื่อลูกค้า (ตามใบวางบิล)</b></th>
				<th width='4%' align='center'><b>เลขที่สัญญา</b></th>
				<th width='4%' align='center'><b>เลขที่ใบสั่งขาย</b></th>
				<th width='4%' align='center'><b>เลขที่ใบแจ้งหนี้</b></th>
				<th width='4%' align='center'><b>วันที่แจ้งหนี้</b></th>
				<th width='4%' align='center'><b>วันที่กำหนดชำระเงิน</b></th>
				<th width='8%' align='center'><b>รายการ</b></th> 
				<th width='5%' align='center'><b>จำนวนเงินสุทธิ</b></th>
				<th width='4%' align='center'><b>ภาษีมูลค่าเพิ่ม</b></th>
				<th width='5%' align='center'><b>จำนวนเงินรวมภาษีมูลค่าเพิ่ม</b></th> 
			</tr>
			{$str}
		</table>
		"; //print_r($_REQUEST); exit;  
if(isset($_REQUEST['mode']))headerX($_REQUEST['mode'],$str);  	
?>