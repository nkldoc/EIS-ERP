<?php
include("../api/List_GlTranPurchase.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงานภาษีซื้อ";
$body		= "";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["area"]) > 0 ) {
	
	foreach($data_dtl["area"] as $index => $obj) {
		
		$body	.= "<div class='page' style='page-break-after: always;'>";
		$body	.= "<div class='text_report_buy'>";
		$body	.= "<p>รายงานภาษีซื้อ ประจำเดือน ".$obj["c_mm"]." ".$obj["c_yyyy"]." สาขาที่ ".$obj["c_branch"]."</p>";
		$body	.= "<p> ชื่อผู้ประกอบกิจการ : ".$obj["c_name"]."</p>";
		$body	.= "<p> ชื่อสถานที่ประกอบการ : ".$obj["c_addr"]."</p>";
		$body	.= "<p> เลขประจำตัวผู้เสียภาษีอากร : ".$obj["c_tax_value"]."</p>";
		$body	.= "</div>";
		
		$body	.= "<table width='100%' class='table_report' border='0' cellspacing='1' cellpadding='0'>";
		
		// ================= HEAD ================= //
		$body	.= "<thead valign='top'>
						<tr>
							<th rowspan=2 style='vertical-align:middle;'>ลำดับที่</th>
							<th colspan=2 style='vertical-align:middle;'>ใบสำคัญ</th>
							<th colspan=2 style='vertical-align:middle;'>ใบกำกับภาษี</th>
		
							<th rowspan=2 style='vertical-align:middle;'>ชื่อผู้ขายสินค้า/ผู้ให้บริการ</th>
							<th rowspan=2 style='vertical-align:middle;'>เลขประจำตัว<br>ผู้เสียภาษีอากร</th>
							<th rowspan=2 style='vertical-align:middle;'>สถานประกอบการ</th>
							<th rowspan=2 style='vertical-align:middle;'>มูลค่าสินค้าหรือบริการ</th>
							<th rowspan=2 style='vertical-align:middle;'>จำนวนเงินภาษีมูลค่าเพิ่ม</th>
						</tr>
						<tr>
							<th style='vertical-align:middle;'>เลขที่</th>
							<th style='vertical-align:middle;'>วัน เดือน ปี</th>
							<th style='vertical-align:middle;'>วันที่</th>
							<th style='vertical-align:middle;'>เล่มที่/เลขที่</th>
						</tr>
					</thead>";
		// ================= HEAD ================= //
		
		// ================= BODY ================= //
		$body	.= "<body>";
		
		$f_price	= 0;
		$f_vat		= 0;
		if(is_array(@$data_dtl["dtl"][$index])) {

			$i			= 0;			
			
			foreach($data_dtl["dtl"][$index] as $index => $obj2) {
				
				$body	.= "<tr>
								<td align='center'>".(++$i).".</td>
								<td align='center'>".$obj2["c_ref_doc"]."</td>
								<td align='center'>".$obj2["d_save_date"]."</td>
								<td align='center'>".$obj2["d_doc_date"]."</td>
								<td align='center'>".$obj2["c_doc"]."</td>
								<td>".$obj2["c_vendor"]."</td>
								<td align='center'>".$obj2["c_tax"]."</td>
								<td align='center'>".$obj2["cnt_branch"]."</td>
								<td align='right'>".number_format($obj2["f_price"],2)."</td>
								<td align='right'>".number_format($obj2["f_vat"],2)."</td>
							</tr>";
				
				$f_price	+= $obj2["f_price"];
				$f_vat		+= $obj2["f_vat"];
			}
		}
		
		$body	.= "<tr>
						<td colspan='8' align='right'><b>รวม</b></td>
						<td align='right'><b>".number_format($f_price,2)."</b></td>
						<td align='right'><b>".number_format($f_vat,2)."</b></td>
					</tr>";
		// ================= BODY ================= //
		
		$body	.= "</body>";
		$body	.= "</table>";
		$body	.= "</div>"; // page-break-after: always;
	}

// } else {
// 	$conspan	= 0;
// 	foreach ($thead AS $ss) { ++$conspan;  }
// 	$tbody	= "<tbody><tr><td align='center' colspan=".$conspan.">ไม่มีข้อมูล</td></tr></tbody>";
}
// ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<link  rel="stylesheet" type="text/css" href="../../css/report_css.css" />
<style type="text/css">
	.text_report_buy { FONT-SIZE: 14px; font-weight: bold; COLOR: #00000; FONT-FAMILY: Tahoma}
	.table_report_buy { FONT-SIZE: 12px; COLOR: #00000; FONT-FAMILY: Tahoma}
	.tr_report_buy { FONT-SIZE: 9px; COLOR: #00000; FONT-FAMILY: Tahoma}
	@page {
		size: A4;
		margin: 0;
	}
	@media print {
		.page {
			margin: 30px;
			border: initial;
			border-radius: initial;
			width: initial;
			min-height: initial;
			box-shadow: initial;
			background: initial;
			page-break-after: always;
		}
	}
</style>
</head>
<body>
<?= $body; ?>
</body>
</html>