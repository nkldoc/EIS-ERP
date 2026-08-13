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
 
 
$cost1 = explode(" ", $_REQUEST['txtdc_cost_idID']);
$cost2 = explode(" ", $_REQUEST['txtdc_cost_id2ID']);

if(isset($_REQUEST['dc_debtor_id']) && $_REQUEST['dc_debtor_id']>0){
	$debtor = "and b.dc_debtor_id in (select dc_debtor_id from dc_debtor where dc_debtor_id={$_REQUEST['dc_debtor_id']})";
}else{
	$debtor = "";
}

$d_begin_dateID = $date->bc_to_ad($_REQUEST['startDate']); 
$th_mm_yyyy = $date->long_date_from_db($d_begin_dateID);


	$sql ="select a.dc_area_id
		, a.dc_debtor_id  
		, a.ar_bill_invoice_hdr_id 
		, (select bl_code from ar_bill_invoice_hdr where ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id) as bl_code
		, (select c_code from fi_receive_tran_hdr where fi_receive_tran_hdr_id=c.fi_receive_tran_hdr_id) as c_code
		, convert(varchar, a.d_doc_date, 120) as d_doc_date
		, convert(varchar, a.d_end_credit, 120) as d_end_credit 
		, sum(a.f_disc_cash_amt) as f_disc_cash_amt
		, sum(a.f_cr) as f_cr
		, sum(a.f_dr) as f_dr
		, sum((a.f_cr+a.f_disc_cash_amt)) as m1
		, sum((a.f_dr-(a.f_cr+a.f_disc_cash_amt))) as m2 
		
		,	CASE b.i_no_order WHEN 1 THEN  b.c_contract_no
			ELSE (select c_po_no from ar_so_hdr where ar_so_hdr_id=b.ar_so_hdr_id) END as c_contract_no
	 
		, b.c_name_inv
		, b.c_invoice_item
	from ar_process_month_report_hdr a 
	inner join ar_bill_invoice_hdr b on b.ar_bill_invoice_hdr_id=a.ar_bill_invoice_hdr_id
	left join fi_receive_tran_hdr c on c.ar_bill_invoice_hdr_id=b.ar_bill_invoice_hdr_id
	where a.d_doc_date<='{$d_begin_dateID}'
	and b.dc_cost_id in (select dc_cost_id from dc_cost where c_code BETWEEN '{$cost1[0]}' AND '{$cost2[0]}') 
	{$debtor}
	group by a.dc_area_id
		,a.dc_debtor_id 
		,a.ar_bill_invoice_hdr_id
		,a.d_doc_date 
		,a.d_end_credit 
		,b.ar_so_hdr_id
		,b.i_no_order
		,b.c_name_inv
		,b.c_contract_no
		,b.c_invoice_item
		,c.fi_receive_tran_hdr_id
	having sum((a.f_dr-(a.f_cr+a.f_disc_cash_amt)))>0
	order by a.dc_debtor_id,a.ar_bill_invoice_hdr_id";		

	
	
$stmt = $db->QueryParam($sql, array(1));
$i = 1;
$str = "";

//css
$doubleLine = "style='border-bottom: 3px double;'";
$bold = "style='font-weight:bold;'";
 
while ($data = $db->Fetch($stmt))
{ 
 
	$str .= "<tr>"
			."<td align='center'>{$i}</td>" 
			."<td valign='top' align='left'>{$data["bl_code"]}</td>" 
			."<td valign='top' align='left'>{$data["c_code"]}</td>"
			."<td valign='top' align='left'>".$date->long_date_from_db($data["d_doc_date"])."</td>"
			."<td valign='top' align='left'>".$date->long_date_from_db($data["d_end_credit"])."</td>" 
			."<td valign='top' align='left'>{$data["c_name_inv"]}</td>"
			."<td valign='top' align='left'>{$data["c_contract_no"]}</td>"
			."<td valign='top' align='left'>{$data["c_invoice_item"]}</td>"  
			."<td valign='top' align='right'>".number_format($data["m1"],2)."</td>" 
			."<td valign='top' align='right'>".number_format($data["m2"],2)."</td>" 
			."</tr>";
			
	
	$i++;
 
}// end while
 
//ห้ามมีช่องว่างระหว่างนี้ excel Encoding False;
if($str == "")$str = "ไม่พบข้อมูล";  
$str = "<table cellspacing='0' cellpadding='0' width='100%' border='0' style=\"font-size:13px; border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
			<tr><th colspan='10' align='center'>{$_REQUEST['titleReport']}</th></tr>
			<tr><th colspan='10' align='left'>จากหน่วยงาน  :  {$_REQUEST['txtdc_cost_idID']}</th></tr>
			<tr><th colspan='10' align='left'>ถึงหน่วยงาน  :  {$_REQUEST['txtdc_cost_id2ID']}</th></tr> 
			<tr><th colspan='10' align='left'>ลูกค้า  :  {$_REQUEST['txtdc_debtor_idID']}</th></tr>
			<tr><th colspan='10' align='left'>ข้อมูล ณ วันที่  : {$th_mm_yyyy}</th></tr>  
		</table>
		<table cellspacing='0' cellpadding='0' width='100%' border='1' style=\"  font-size:13px; border-collapse:collapse;border:none;mso-border-alt:solid windowtext .1pt;mso-padding-alt:0cm 1.0pt 0cm 1.0pt\">
			<tr bgcolor='#A5BAD6'>
				<th width='2%' align='center'><b>ลำดับที่</b></th> 
				<th width='4%' align='center'><b>เลขที่เอกสาร</b></th>
				<th width='4%' align='center'><b>เลขที่เอกสารรับเงิน</b></th>
				<th width='4%' align='center'><b>วันที่</b></th>
				<th width='4%' align='center'><b>วันที่ครบกำหนด</b></th>
				<th width='4%' align='center'><b>ลูกค้า</b></th>
				<th width='4%' align='center'><b>เลขที่ใบสั่งซื้อ/เลขที่สัญญา</b></th>
				<th width='8%' align='center'><b>รายการ</b></th>  
				<th width='4%' align='center'><b>งวดปัจจุบัน</b></th>
				<th width='5%' align='center'><b>ยอดคงเหลือ</b></th> 
			</tr>
			{$str}
		</table>
		"; 
if(isset($_REQUEST['mode']))headerX($_REQUEST['mode'],$str);
?>
