<?php 
include("../api/List_RepDcAcc.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH; 
$caption	= "รายงานผังบัญชี";
$arr_last	= array(1=>'บัญชีย่อย',2=>'บัญชีคุม');
$arr_dr_cr	= array(1=>'เดบิต',2=>'เครดิต',0=>'ไม่ระบุ');

 
$arr_empty  = array(1=>''
			  ,2=>'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			  ,3=>'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			  ,4=>'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			  ,5=>'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			  ,6=>'&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
			  );

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "ที่";
$thead[]	= "รหัส-ชื่อบัญชี";
$thead[]	= "ประเภท";
$thead[]	= "ระดับ";
$thead[]	= "ดุลบัญชี"; 
$thead[]	= "สถานะ";
$thead[]	= "ศูนย์ต้นทุนทางบัญชี";
 
$data_dtl	= json_decode(List_QueryParam(), true);


if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	$c_td_level = "";
	
	foreach($data_dtl["data"] as $index => $jObj) {
 
 		$c_align_last 	= ($jObj["i_last"]==GL_ACC_LAST_TRUE) 	? "right" : "left";
  		$c_align_dr_cr 	= ($jObj["i_debit"]==GL_ACC_DR) 		? "right" : "left";
		$c_td_level		= $arr_empty[$jObj["i_level"]];

		if($jObj["i_debit"] != 1 && $jObj["i_debit"] != 2) { $jObj["i_debit"] = 0; }

		$tbody	.=	"<tr>";
		$tbody	.= "<td width=\"5%\"  align=\"center\">".$jObj["no"]."</td>";
		$tbody	.= "<td width=\"55%\">".$c_td_level.$jObj["c_full"]."</td>"; 
		$tbody	.= "<td width=\"10%\" align=\"$c_align_last\">".$arr_last[$jObj["i_last"]]."</td>"; 
		$tbody	.= "<td width=\"5%\"  align=\"center\">".$jObj["i_level"]."</td>";
		$tbody	.= "<td width=\"5%\"  align=\"$c_align_dr_cr\">".$arr_dr_cr[$jObj["i_debit"]]."</td>"; 
		$tbody	.= "<td width=\"5%\" align=\"center\">".$jObj["c_enable_name"]."</td>";
		$tbody	.= "<td width=\"15%\" >".$jObj["c_cost_acc_name"]."</td>"; 
  		$tbody	.=	"</tr>";
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
	
 
	if($_REQUEST["i_enable"] > 0 ) {
		$c_enabled_caption	=  ($_REQUEST["i_enable"]=="1") ? "ใช้งาน" : "ไม่ใช้งาน";
	} else {
		$c_enabled_caption	= "เลือกทั้งหมด";
	}
 
 
 
	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div><strong>สถานะ : ".$c_enabled_caption."</strong></div>";
	
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
