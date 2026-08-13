<?php
include("../api/List_AeRep00001.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= "บริษัท อสมท จำกัด (มหาชน)";

$caption	= "รายงานข้อมูลกำหนดค่าแสดงบัญชี";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "รหัสบัญชี";
$thead[]	= "ชื่อบัญชี";
$thead[]	= "กำหนดค่าแสดง<br>ชื่อบัญชี";
$thead[]	= "กำหนดค่าแสดง<br>จำนวนเงิน";
$thead[]	= "กำหนดค่าตำแหน่ง<br>ที่แสดงจำนวนเงิน<br>(เฉพาะบัญชีคุม)";
$thead[]	= "ประเภทต้นทุน";
$thead[]	= "ระดับ";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$nbsp	= "";
		
		for($i=3;$i<=$jObj["i_level"];$i++) { $nbsp .= "&nbsp;&nbsp;&nbsp;"; }
		
		$img_name	= ( $jObj["i_show_name"] == 1 )? "<img src='../../images/icons/bullet_tick.png'>" : "<img src='../../images/icons/bullet_cross.png'>";
		$img_level	= ( $jObj["i_show_level"] == 1 )? "<img src='../../images/icons/bullet_tick.png'>" : "<img src='../../images/icons/bullet_cross.png'>";
		
		$tbody	.=	"<tr>";
		$tbody	.= "<td nowrap>".$nbsp.$jObj["c_code"]."</td>";
		$tbody	.= "<td>".$jObj["c_name"]."</td>";
		$tbody	.= "<td align='center'>".$img_name."</td>";
		$tbody	.= "<td align='center'>".$img_level."</td>";
		$tbody	.= "<td align='center'>".$jObj["i_show_exp_type"]."</td>";
		$tbody	.= "<td align='center'>".$jObj["i_is_fixed"]."</td>";
		$tbody	.= "<td align='center'>".$jObj["i_level"]."</td>";
		$tbody	.=	"</tr>";
	}
	
	$tbody	.= "</tbody>";

} else { $tbody	= ""; }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<style type="text/css">
	.text_report_buy { FONT-SIZE: 14px; COLOR: #00000; FONT-FAMILY: Tahoma}
	.table_report_buy { FONT-SIZE: 12px; COLOR: #00000; FONT-FAMILY: Tahoma}
	.tr_report_buy { FONT-SIZE: 9px; COLOR: #00000; FONT-FAMILY: Tahoma}
	
	thead tr, tbody td, tbody th { border: 1px solid #eee; }
	tbody > tr:nth-child(even) { background: #FFF }
	tbody > tr:nth-child(odd) { background: #FCFCFC }
							
</style>
</head>
<body>
<?php
	if( $s_title == true ) echo "<div align=\"center\"><strong>".$title."</strong></div>";
	
	if( $_REQUEST["i_group"] > 0 ) {
		$dc_acc_name	= $db->GetDataBySQL("SELECT TOP 1 c_name FROM dc_acc WHERE i_group=? AND i_level=1 AND i_enable=1",array($_REQUEST["i_group"]));
	} else {
		$dc_acc_name	= "เลือกทั้งหมด";
	}
	
	
	$sqlMain	= "	SELECT dc_acc_id, c_name, i_group FROM dc_acc WHERE i_level=1 AND i_enable=1 ORDER BY c_code_tree";
	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div><strong>ประเภทผังบัญชี : ".$dc_acc_name."</strong></div>";
?>
<table width="100%" class="table_report_buy" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top">
<?php
	echo "<tr bgcolor=\"#A5BAD6\">";
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