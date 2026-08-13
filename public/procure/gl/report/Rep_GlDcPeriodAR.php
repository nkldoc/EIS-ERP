<?php 
include("../api/List_RepGlDcPeriodAR.php");
include("../../lib/export/exportUtil.php"); 

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH; 
$caption	= "รายงานปิดงวดเดือน (ระบบบัญชีรายได้/การเงินรับ)";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }
$thead[]	= "ที่";
$thead[]	= "เดือน/ปี";
$thead[]	= "สถานะล่าสุด";
$thead[]	= "สถานะ";
$thead[]	= "ผู้ทำรายการ";
$thead[]	= "วันที่ทำรายการ";
$thead[]	= "เวลาทำรายการ";

$arr_months = array("01"=>"มกราคม","02"=>"กุมภาพันธ์","03"=>"มีนาคม","04"=>"เมษายน"
,"05"=>"พฤษภาคม","06"=>"มิถุนายน","07"=>"กรกฎาคม","08"=>"สิงหาคม"
,"09"=>"กันยายน","10"=>"ตุลาคม","11"=>"พฤศจิกายน","12"=>"ธันวาคม" 
);	 

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {

	$the_month 	= "";
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) { 
	
		$tbody	.=	"<tr>";
		$tbody	.= "<td align=\"center\">".$jObj["no"]."</td>";
		
		if ($the_month!=$jObj["c_mm"])
		{
		 	$c_status_last	= ($jObj["i_status"]==GL_PERIOD_OPEN) ? "<font color=green>".$jObj["c_status"]."</font>" : "<font color=red>".$jObj["c_status"]."</font>";
			 
			$tbody			.= "<td align=\"center\">".$arr_months[$jObj["c_mm"]]." ".$jObj["c_yyyy"]."</td>";
		}
		else
		{
			$c_status_last	= "";
			$tbody			.= "<td align=\"center\">&nbsp;</td>";
		}
		$tbody	.= "<td align=\"center\">".$c_status_last."</td>"; 
		$tbody	.= "<td align=\"center\">".$jObj["c_status"]."</td>";
		$tbody	.= "<td align=\"center\">".$jObj["c_full_name"]."</td>"; 
	 	$tbody	.= "<td align=\"center\">".$jObj["d_create"]."</td>"; 
		$tbody	.= "<td align=\"center\">".$jObj["c_time"]."</td>";  
		$tbody	.=	"</tr>";
		
		$the_month = $jObj["c_mm"];
	}
	
	$tbody	.= "</tbody>";

} else { $tbody	= ""; }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<body>
<?php
	if( $s_title == true ) echo "<div align=\"center\"><strong>".$title."</strong></div>"; 
  
	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div><strong>ปี : ".($_REQUEST["year"]+543)."</strong></div>";
	
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
