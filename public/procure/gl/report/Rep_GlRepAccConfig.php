<?php
include("../api/List_GlRepAccConfig.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงานข้อมูลหลักจัดทำรายงานตามบัญชี";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "รหัส";
$thead[]	= "ชื่อ";
$thead[]	= "ระดับหัวข้อ";
$thead[]	= "รูปแบบ";
$thead[]	= "ก่อนดูรายงาน";
$thead[]	= "สถานะ";
$thead[]	= "ลำดับที่";
$thead[]	= "ชื่อหัวข้อที่ 1";
$thead[]	= "ลำดับที่";
$thead[]	= "ชื่อหัวข้อที่ 2";
$thead[]	= "รหัสบัญชี";
$thead[]	= "ชื่อบัญชี";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		
		// GEN TBODY
		if( @$jObj["i_type"] == 1 ) { $style	= "style=\"background:#FF9900;\"";}
		else if( @$jObj["i_type"] == 2 ) { $style = "style=\"background:#FFFF66;\""; }
		else if( @$jObj["i_type"] == 3 ) { $style = "style=\"background:#CCFF99;\""; }

		$tbody	.=	"<tr>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["c_code"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["c_name"]."</td>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["i_level_dtl"]."</td>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["i_money"]."</td>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["i_process"]."</td>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["i_enable"]."</td>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["i_sequence1"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["c_name1"]."</td>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["i_sequence2"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["c_name2"]."</td>";
		$tbody	.= "<td align='center' ".$style.">".$jObj["acc_code"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["acc_name"]."</td>";
		$tbody	.=	"</tr>";
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
	echo "<div><strong>สถานะ : <font color='blue'>".$arr_status[$_REQUEST["i_enable"]]."</font></strong></div>";
?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top">
<?php
	echo "<tr>";
	foreach ($thead as $value) {
		echo "<th style='vertical-align:middle;'>".$value."</th>";
	}
	echo "</tr>";
?>
</thead>
<?= $tbody ?>
</table>
</body>
</html>
