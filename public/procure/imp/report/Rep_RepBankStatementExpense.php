<?php
include("../api/List_RepBankStatementExpense.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงาน Bank Statement ค่าใช้จ่าย";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$arrCheque	= array("0" => "เลือกทั้งหมด","1" => "เฉพาะเช็คที่มียอดค้างจ่าย", "2" => "เช็คที่จ่ายแล้ว");
$arrSystem	= array("0" => "เลือกทั้งหมด","1" => "e-phys", "2" => "vision net");

$thead[]	= "ลำดับที่";
$thead[]	= "-";
$thead[]	= "ระบบ";
$thead[]	= "วันที่เช็ค";
$thead[]	= "จำนวนเงินในเช็ค";
$thead[]	= "ลำดับที่";
$thead[]	= "-";
$thead[]	= "วันที่จ่ายออกจากธนาคาร";
$thead[]	= "จำนวนเงินที่จ่ายออกจากธนาคาร";
$thead[]	= "จำนวนเงินรวมเช็ค";
$thead[]	= "สถานะเช็ค";
$thead[]	= "คงเหลือ";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	$no			= 0;
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style	= "style='background:#d0d6c3;'";
// 		$styleA	= "style='background:#D9FAB4;'";
// 		$styleB	= "style='background:#F6EFB7;'";
		$styleA	= "style='background:#;'";
		$styleB	= "style='background:#;'";
		
		$f_amount_cheque	= round($jObj["f_amount_cheque"]);
		$str_cheque			= ($f_amount_cheque > 0)? number_format($f_amount_cheque,2) : "";
			
		$f_amount_bank		= round($jObj["f_amount_bank"]);
		$str_bank			= ($f_amount_bank > 0)? number_format($f_amount_bank,2) : "";
			
		$total_cheque		= round($jObj["total_cheque"]);
		$str_total_cheque	= ($total_cheque > 0)? number_format($total_cheque,2) : "";
		
		// GEN TBODY
		if( @$jObj["i_type"] == 1 ) {
			
			$conspan	= 0;
			foreach ($thead AS $ss) { ++$conspan;  }
			
			$total	= (($total_cheque > $f_amount_bank) || ($total_cheque < $f_amount_bank))? "<font color=red>x</font>" : "";

			$tbody	.=	"<tr height='20'>";
			$tbody	.= "<td ".$style." colspan=".$conspan." nowrap><b>เลขที่เช็ค : ".$jObj["cheque_no"]." ".$total."</b></td>";
			$tbody	.=	"</tr>";
			
		} else if( @$jObj["i_type"] == 2 ) {
			
			if($jObj["row_cheque"] == 1 || $jObj["row_bank"]) {
				if($total_cheque == $f_amount_bank) {
					$status		= "/";
					$total		= "";
				} else if($total_cheque > $f_amount_bank) {
					$status		= "x";
					$total		= $f_amount_bank - $total_cheque;
					$total		= "<font color=red>".number_format($total,2)."</font>";
				} else if($total_cheque < $f_amount_bank) {
					$status		= "x";
					$total		= $f_amount_bank - $total_cheque;
					$total		= number_format($total,2);
				}
			} else { $status = ""; $total = ""; }
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$styleA." align='center' nowrap>".$jObj["row_cheque"]."</td>";
			$tbody	.= "<td ".$styleA." align='center' nowrap>".$jObj["c_system"]."</td>";
			$tbody	.= "<td ".$styleA." align='center' nowrap>".$jObj["c_code_cheque"]."</td>";
			$tbody	.= "<td ".$styleA." align='center' nowrap>".$jObj["d_cheque_date"]."</td>";
			$tbody	.= "<td ".$styleA." align='right' nowrap>".$str_cheque."</td>";
			$tbody	.= "<td ".$styleB." align='center' nowrap>".$jObj["row_bank"]."</td>";
			$tbody	.= "<td ".$styleB." align='center' nowrap>".$jObj["c_code_bank"]."</td>";
			$tbody	.= "<td ".$styleB." align='center' nowrap>".$jObj["d_bank_date"]."</td>";
			$tbody	.= "<td ".$styleB." align='right' nowrap>".$str_bank."</td>";
			$tbody	.= "<td ".$styleB." align='right' nowrap>".$str_total_cheque."</td>";
			$tbody	.= "<td align='center' nowrap>".$status."</td>";
			$tbody	.= "<td align='right' nowrap>".$total."</td>";
			$tbody	.=	"</tr>";
			
		}
	}
	
	$tbody	.= "</tbody>";

} else {
	$conspan	= 0;
	foreach ($thead AS $ss) { ++$conspan;  }
	$tbody	= "<tbody><tr><td align='center' colspan=".$conspan.">ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<link  rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<body>
<?php
	if( $s_title == true ) echo "<div align='center'><strong>".$title."</strong></div>";
		
	if($_REQUEST["dc_bank_id"] > 0) {
		$dc_bank_name = $db->GetDataBySQL("SELECT c_name FROM dc_bank WHERE dc_bank_id=?;", array($_REQUEST["dc_bank_id"]));
	} else {
		$dc_bank_name = "เลือกทั้งหมด";
	}
	if($_REQUEST["dc_bank_acc_company_id"] > 0) {
		$dc_bank_acc_company_name = $db->GetDataBySQL("SELECT c_code+' : '+c_name FROM dc_bank_acc_company WHERE dc_bank_acc_company_id=?;", array($_REQUEST["dc_bank_acc_company_id"]));
	} else {
		$dc_bank_acc_company_name = "เลือกทั้งหมด";
	}
	
	echo "<div align='center'><strong>".$caption."</strong></div>";
	echo "<div align='center'><strong>ประจำเดือน ".$date->l_month_thai[$_REQUEST["c_mm"]]." ปี ".($_REQUEST["c_yyyy"]+543)."</strong></div>";
	echo "<div><strong>ธนาคาร : <font color='blue'>".$dc_bank_name."</font></strong></div>";
	echo "<div><strong>เลขที่บัญชี : <font color='blue'>".$dc_bank_acc_company_name."</font></strong></div>";
	echo "<div><strong>สถานะเช็ค : <font color='blue'>".$arrCheque[$_REQUEST["status_cheque"]]."</font></strong></div>";
	echo "<div><strong>ระบบค่าใช้จ่าย : <font color='blue'>".$arrSystem[$_REQUEST["i_system"]]."</font></strong></div>";
?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top">
<?php
	echo "<tr>";
	foreach ($thead as $value) {
		echo "<th style='vertical-align:middle;' nowrap>".$value."</th>";
	}
	echo "</tr>";
?>
</thead>
<?= $tbody ?>
</table>
</body>
</html>
