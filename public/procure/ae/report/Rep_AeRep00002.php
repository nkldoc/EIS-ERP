<?php
include("../api/List_AeRep00002.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงาน Segment บัญชีบริหาร";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "ลำดับที่";
$thead[]	= "เลขที่ Segment บัญชีบริหาร";
$thead[]	= "ชื่อ Segment บัญชีบริหาร";
$thead[]	= "คำอธิบาย";
$thead[]	= "รหัสหน่วยงาน";
$thead[]	= "ชื่อหน่วยงาน";
$thead[]	= "ศูนย์ต้นทุนทางบัญชี";
$thead[]	= "สถานะ";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$nbsp	= "";

		if( $jObj["i_type"] == 1 ) {
				
			$background	= "style='background:#FFFFCC;'";
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td align='center' ".$background."><b>".$jObj["no"].".</b></td>";
			$tbody	.= "<td align='center' ".$background."><b>".$jObj["c_code"]."</b></td>";
			$tbody	.= "<td ".$background."><b>".$jObj["c_name"]."</b></td>";
			$tbody	.= "<td align='right' colspan='5' ".$background."><b>".$jObj["i_enable"]."</b></td>";
			$tbody	.=	"</tr>";
				
		} else if( $jObj["i_type"] == 2 ) {
				
			$background	= "";
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td colspan='4'></td>";
			$tbody	.= "<td ".$background." nowrap>".$jObj["no"].". ".$jObj["cost_code"]."</td>";
			$tbody	.= "<td ".$background.">".$jObj["cost_name"]."</td>";
			$tbody	.= "<td ".$background.">".$jObj["cost_acc_name"]."</td>";
			$tbody	.= "<td></td>";
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
<link  rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<body>
<?php
	if( $s_title == true ) echo "<div align=\"center\"><strong>".$title."</strong></div>";
	
	if( $_REQUEST["gl_dc_group_admin_hdr_id"] > 0 ) {
		$gl_dc_group_name	= $db->GetDataBySQL("SELECT c_name FROM gl_dc_group_admin_hdr WHERE gl_dc_group_admin_hdr_id=?;",array($_REQUEST["gl_dc_group_admin_hdr_id"]));
	} else {
		$gl_dc_group_name	= "เลือกทั้งหมด";
	}

	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div><strong>Segment บัญชีบริหาร : ".$gl_dc_group_name."</strong></div>";
	echo "<div><strong>สถานะ : ".$arr_status[$_REQUEST["i_enable"]]."</strong></div>";
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