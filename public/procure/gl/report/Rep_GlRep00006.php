<?php
include("../api/List_GlRep00006.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "งบทดลอง ก่อนผ่านรายการปิดบัญชีฯ";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "ที่";
$thead[]	= "รหัสบัญชี";
$thead[]	= "ยอดยกมา เดบิต";
$thead[]	= "ยอดยกมา เครดิต";
$thead[]	= "เดบิต";
$thead[]	= "เครดิต";
$thead[]	= "ยอดยกไป เดบิต";
$thead[]	= "ยอดยกไป เครดิต";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		
		// GEN TBODY
		if( $jObj["i_type"] == 2 ) { $style = "style=\"background:#D3DCE3;\""; }
		
		if($jObj["i_type"] == 1) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap ".$style." align='center'>".$jObj["no"]."</td>";
			$tbody	.= "<td nowrap ".$style.">".$jObj["acc_code"]." ".$jObj["acc_name"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_begin_dr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_begin_cr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_dr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_cr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_end_dr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_end_cr"],2)."</td>";
			$tbody	.=	"</tr>";
		} else if($jObj["i_type"] == 2) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='2' align='right'><b>รวมทั้งหมด</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_begin_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_begin_cr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_cr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_end_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_end_cr"],2)."</b></td>";
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
	if( $s_title == true ) echo "<div align=\"center\"><strong>".$title."</strong></div>";

	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div align=\"center\"><strong>ปีงบประมาณ ".($_REQUEST["year"]+543)."</strong></div>";
?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top">
<?php
	echo "<tr>";
	foreach ($thead as $value) {
		echo "<th nowrap style='vertical-align:middle;'>".$value."</th>";
	}
	echo "</tr>";
?>
</thead>
<?= $tbody ?>
</table>
</body>
</html>