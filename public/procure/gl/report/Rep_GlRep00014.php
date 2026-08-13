<?php
include("../api/List_GlRep00014.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();
$db 		= new DatabaseServer();
$date 		= new i_date();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

if($_REQUEST["page"] == "GlRep00014") {
	$caption	= "งบแสดงผลดำเนินงาน (เปรียบเทียบ)";
} else {
	$caption	= "งบแสดงฐานะการเงิน (เปรียบเทียบ)";
}

$thead[]	= "รหัสบัญชี";
$thead[]	= "ชื่อบัญชี";
$thead[]	= "ปี ".($_REQUEST["year"]+543);
$thead[]	= "ปี ".($_REQUEST["year"]+542);

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		
		// GEN TBODY
		if( $jObj["i_type"] == 1 ) { $style = "style='background:#E2E8E9;'"; }
		else if( $jObj["i_type"] == 2 ) { $style = "style='background:#F3F6F6;'"; }
		else if( $jObj["i_type"] == 3 ) { $style = "style='background:#fff;'"; }
		
		if($jObj["i_type"] == 1) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap ".$style."><b>".$jObj["c_code"]."</b></td>";
			$tbody	.= "<td nowrap ".$style."><b>".$jObj["c_name"]."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_money"]."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_money_before"]."</b></td>";
			$tbody	.=	"</tr>";
			
		} else if($jObj["i_type"] == 2) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap ".$style.">&nbsp;&nbsp;&nbsp;".$jObj["c_code"]."</td>";
			$tbody	.= "<td nowrap ".$style.">&nbsp;&nbsp;&nbsp;".$jObj["c_name"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_money"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_money_before"]."</td>";
			$tbody	.=	"</tr>";
			
		} else if($jObj["i_type"] == 3) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap ".$style.">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".$jObj["c_code"]."</td>";
			$tbody	.= "<td nowrap ".$style.">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;".$jObj["c_name"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_money"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_money_before"]."</td>";
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

	echo "<div align='center'><strong>".$caption."</strong></div>";
	echo "<div align='center'><strong> ระหว่างปี ".($_REQUEST["year"]+543)." และ ".($_REQUEST["year"]+542)."</strong></div>";
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