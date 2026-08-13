<?php
include("../api/List_RepGlBookDaily.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงานสมุดรายวัน";

$Arr_post	= array("1"=>"ทั้งหมด(GX/GL)", "2"=>"ยังไม่ผ่านรายการ (GX)", "3"=>"ผ่านรายการแล้ว (GL)");

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "เลขที่เอกสาร";
$thead[]	= "วันที่เอกสาร";
$thead[]	= "เลขที่อ้างอิง";
$thead[]	= "เลขที่อ้างอิง(ผ่านรายการ)";
$thead[]	= "วันที่บันทึกบัญชี";
$thead[]	= "ชื่อบัญชี";
$thead[]	= "รายการรายได้/รายการออกอากาศ";
$thead[]	= "ศูนย์ต้นทุน";
$thead[]	= "เดบิต";
$thead[]	= "เครดิต";
$thead[]	= "ผู้สร้างรายการ";
$thead[]	= "ผู้สอบทาน";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		 
		// GEN TBODY
		if( @$jObj["i_type"] == 1 ) {
			
			$style	= "style='background:#E2E8E9;'";
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style.">".$jObj["c_ref_doc"]."</td>";
			$tbody	.= "<td ".$style." align='center' nowrap>".$jObj["d_doc_date"]."</td>";
			$tbody	.= "<td ".$style." align='center'>".$jObj["c_code"]."</td>";
			$tbody	.= "<td ".$style." align='center'>".$jObj["c_code_post"]."</td>";
			$tbody	.= "<td ".$style." align='center' nowrap>".$jObj["d_save_date"]."</td>";
			$tbody	.= "<td ".$style." colspan='7'></td>";
			$tbody	.=	"</tr>";
			
		} else if( @$jObj["i_type"] == 2 ) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='5'></td>";
			$tbody	.= "<td ".$style.">".$jObj["c_acc_code"]." ".$jObj["c_acc_name"]."</td>";
			$tbody	.= "<td ".$style.">".$jObj["c_product_name"]."</td>";
			$tbody	.= "<td ".$style." nowrap>".$jObj["c_cost_name"]."</td>";
			$tbody	.= "<td ".$style." align='right' nowrap>".number_format($jObj["f_dr"],2)."</td>";
			$tbody	.= "<td ".$style." align='right' nowrap>".number_format($jObj["f_cr"],2)."</td>";
			$tbody	.= "<td ".$style." align='center' nowrap>".$jObj ["emp_name"]."</td>";
			$tbody	.= "<td ".$style." align='center' nowrap>".$jObj ["post_name"]."</td>";
			$tbody	.=	"</tr>";
			
		} else if( @$jObj["i_type"] == 3 ) {
			
			$style	= "style='background:#E2E8E9;'";
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='8' align='right'><b>รวม</b></td>";
			$tbody	.= "<td ".$style." align='right'><b>".number_format($jObj["f_dr"],2)."</b></td>";
			$tbody	.= "<td ".$style." align='right'><b>".number_format($jObj["f_cr"],2)."</b></td>";
			$tbody	.= "<td ".$style." colspan='2'></td>";
			$tbody	.=	"</tr>";
			
		} else if( @$jObj["i_type"] == 4 ) {
			
			$style	= "style='background:#C6D2D1;'";
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='12'><b><font color='red'>คำอธิบายรายการ  :  </font> ".$jObj["c_comment"]."</b></td>";
			$tbody	.=	"</tr>";
			
		} else if( @$jObj["i_type"] == 5 ) {
			
			$style	= "style='background:#80BFBF;'";
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='8' align='right'><b>รวมทั้งสิ้น</b></td>";
			$tbody	.= "<td ".$style." align='right'><b>".number_format($jObj["f_dr"],2)."</b></td>";
			$tbody	.= "<td ".$style." align='right'><b>".number_format($jObj["f_cr"],2)."</b></td>";
			$tbody	.= "<td ".$style." colspan='2'></td>";
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
		
	$c_name = $db->GetDataBySQL("SELECT c_name FROM gl_dc_book_type WHERE gl_dc_book_type_id=?;", array($_REQUEST["gl_dc_book_type_id"]));
	
	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div><strong>วันที่บันทึกบัญชี : <font color='blue'>".$date->extDateBuddha($_REQUEST["date_start"])."</font> ถึงวันที่ : <font color='blue'>".$date->extDateBuddha($_REQUEST["date_end"])."</font></strong></div>";
	echo "<div><strong>ประเภทสมุด : <font color='blue'>".$c_name."</font></strong></div>";
	echo "<div><strong>สถานะการผ่านรายการบัญชี : <font color='blue'>".$Arr_post[$_REQUEST["i_is_post"]]."</font></strong></div>";
	
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
