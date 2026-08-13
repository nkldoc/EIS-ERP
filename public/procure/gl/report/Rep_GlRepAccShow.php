<?php
include("../api/List_GlRepAccShow.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงานข้อมูล การแสดงรายงานตามบัญชี";

$Arr_money		= array("1"=>"รายเดือน", "2"=>"รายไตรมาส", "3"=>"รายไตรมาส (ณ สิ้นไตรมาส)", "4"=>"รายปี");
$Arr_process	= array("1"=>"แสดงข้อมูลโดยไม่ต้องประมวลผล", "2"=>"แสดงข้อมูลที่ประมวลผลแล้ว");
$Arr_post		= array("1"=>"ทั้งหมด(GX/GL)", "2"=>"ยังไม่ผ่านรายการ (GX)", "3"=>"ผ่านรายการแล้ว (GL)");

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "หัวข้อที่ 1";
$thead[]	= "หัวข้อที่ 2";
$thead[]	= "ชื่อบัญชี";

switch ($_REQUEST["i_money"]) {
	case "1" : /*รายเดือน*/
		foreach ($date->s_month_thai AS $s_month) { $thead[] = $s_month; }
		break;
	
	case "2" : /*รายไตรมาส*/
		$thead[]	= "ม.ค.- มี.ค.";
		$thead[]	= "เม.ย.- มิ.ย.";
		$thead[]	= "ก.ค.- ก.ย.";
		$thead[]	= "ต.ค.- ธ.ค.";
		break;
		
	case "3" : /*รายไตรมาส (ณ สิ้นไตรมาส)*/
		$thead[]	= "ณ. 31 มีนาคม.";
		$thead[]	= "ณ. 30 มิถุนายน.";
		$thead[]	= "ณ. 30 กันยายน.";
		$thead[]	= "ณ. 31 ธันวาคาม.";
		break;
		
	case "4" : /*รายปี*/
		$thead[]	= $_REQUEST["year"]+543;
		break;
}
$thead[]	= "รวม";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		$tdd		= "";
		
		// GEN TBODY
		if( @$jObj["i_type"] == 1 ) { $style	= "style=\"background:#FF9900;\"";}
		else if( @$jObj["i_type"] == 2 ) { $style = "style=\"background:#FFFF66;\""; }
		else if( @$jObj["i_type"] == 3 ) { $style = "style=\"background:#CCFF99;\""; }
		else if( @$jObj["i_type"] == 4 ) { $style = "style=\"background:#A2A2A2; font-weight: bold;\""; }

		switch ($_REQUEST["i_money"]) {
			case "1" : /*รายเดือน*/
				for($i=1; $i<=12; $i++) {
					$ff		= $jObj["f_money".$i];
					if($ff > 0) {
						$tdd	.= "<td ".$style." align='right'>".number_format($ff,2)."</td>";
					} else if($ff < 0) {
						$ff		= abs($ff);
						$tdd	.= "<td ".$style." align='right'>(".number_format($ff,2).")</td>";
					} else {
						$tdd	.= "<td ".$style." align='center'>-</td>";
					}
				}
				break;
		
			case "2" : /*รายไตรมาส*/
				for($i=1; $i<=4; $i++) {
					$ff		= $jObj["f_money".$i];
					if($ff > 0) {
						$tdd	.= "<td ".$style." align='right'>".number_format($ff,2)."</td>";
					} else if($ff < 0) {
						$ff		= abs($ff);
						$tdd	.= "<td ".$style." align='right'>(".number_format($ff,2).")</td>";
					} else {
						$tdd	.= "<td ".$style." align='center'>-</td>";
					}
				}
				break;
		
			case "3" : /*รายไตรมาส (ณ สิ้นไตรมาส)*/
				for($i=1; $i<=4; $i++) {
					$ff		= $jObj["f_money".$i];
					if($ff > 0) {
						$tdd	.= "<td ".$style." align='right'>".number_format($ff,2)."</td>";
					} else if($ff < 0) {
						$ff		= abs($ff);
						$tdd	.= "<td ".$style." align='right'>(".number_format($ff,2).")</td>";
					} else {
						$tdd	.= "<td ".$style." align='center'>-</td>";
					}
				}
				break;
		
			case "4" : /*รายปี*/
					$ff		= $jObj["f_money1"];
					if($ff > 0) {
						$tdd	.= "<td ".$style." align='right'>".number_format($ff,2)."</td>";
					} else if($ff < 0) {
						$ff		= abs($ff);
						$tdd	.= "<td ".$style." align='right'>(".number_format($ff,2).")</td>";
					} else {
						$tdd	.= "<td ".$style." align='center'>-</td>";
					}
				break;
		}
		
		$f_sum	= ($jObj["f_sum"] > 0)? $jObj["f_sum"] : 0;

		$tbody	.=	"<tr>";
		$tbody	.= "<td ".$style.">".$jObj["topic1"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["topic2"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["c_acc"]."</td>";
		$tbody	.= $tdd;
		$tbody	.= "<td ".$style." align='right'>".number_format($f_sum,2)."</td>";
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
		
	$c_name = $db->GetDataBySQL("SELECT c_name FROM gl_rep_acc_hdr WHERE gl_rep_acc_hdr_id=?;", array($_REQUEST["gl_rep_acc_hdr_id"]));
	
	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div><strong>ชื่อรายงานตามบัญชี : <font color='blue'>".$c_name."</font></strong></div>";
	echo "<div><strong>ปี : <font color='blue'>".($_REQUEST["year"]+543)."</font></strong></div>";
	echo "<div><strong>ประเภทการแสดงผล : <font color='blue'>".$Arr_money[$_REQUEST["i_money"]]."</font></strong></div>";
	echo "<div><strong>สถานะข้อมูล : <font color='blue'>".$Arr_process[$_REQUEST["i_process"]]."</font></strong></div>";
	echo "<div><strong>การแสดงข้อมูล : <font color='blue'>".$Arr_post[$_REQUEST["i_is_post"]]."</font></strong></div>";
	
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
