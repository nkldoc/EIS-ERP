<?php
include("../api/List_GlRep00005.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงานสมุดรายวัน (ปิดบัญชีประจำปี)";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "เลขที่เอกสาร";
$thead[]	= "วันที่เอกสาร";
$thead[]	= "เลขที่อ้างอิง";
$thead[]	= "วันที่บันทึกบัญชี";
$thead[]	= "ที่";
$thead[]	= "ชื่อบัญชี";
$thead[]	= "รายการรายได้/รายการออกอากาศ";
$thead[]	= "ศูนย์ต้นทุน";
$thead[]	= "เดบิต";
$thead[]	= "เครดิต";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		
		// GEN TBODY
		if( $jObj["i_type"] == 1 || $jObj["i_type"] == 3 ) { $style = "style=\"background:#E2E8E9;\""; }
		else if( $jObj["i_type"] == 4 ) { $style = "style=\"background:#C6D2D1;\""; }
		else if( $jObj["i_type"] == 5 ) { $style = "style=\"background:#80BFBF;\""; }
		
		if($jObj["i_type"] == 1) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap ".$style.">".$jObj["c_ref_doc"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='center'>".$date->shot_date_from_db($jObj["d_doc_date"])."</td>";
			$tbody	.= "<td nowrap ".$style." align='center'>".$jObj["c_code"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='center'>".$date->shot_date_from_db($jObj["d_save_date"])."</td>";
			$tbody	.= "<td nowrap ".$style." colspan='6'></td>";
			$tbody	.=	"</tr>";
			
		} else if($jObj["i_type"] == 2) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='4'></td>";
			$tbody	.= "<td ".$style." align='center'>".$jObj["i_rank"]."</td>";
			$tbody	.= "<td ".$style.">".$jObj["acc_name"]."</td>";
			$tbody	.= "<td ".$style." align='center'>".$jObj["product_name"]."</td>";
			$tbody	.= "<td ".$style." align='center'>".$jObj["cost_name"]."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_dr"],2)."</td>";
			$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_cr"],2)."</td>";
			$tbody	.=	"</tr>";
			
		} else if($jObj["i_type"] == 3) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='7'></td>";
			$tbody	.= "<td ".$style." align='right'><b>รวม</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_cr"],2)."</b></td>";
			$tbody	.=	"</tr>";
			
		} else if($jObj["i_type"] == 4) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='10'>".$jObj["c_comment"]."</td>";
			$tbody	.=	"</tr>";
			
		} else if($jObj["i_type"] == 5) {
			
			$tbody	.=	"<tr>";
			$tbody	.= "<td ".$style." colspan='7'></td>";
			$tbody	.= "<td ".$style." align='right'><b>รวมทั้งสิ้น</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_dr"],2)."</b></td>";
			$tbody	.= "<td nowrap ".$style." align='right'><b>".number_format($jObj["f_cr"],2)."</b></td>";
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
	echo "<div align=\"center\"><strong>ประจำปี ".($_REQUEST["year"]+543)."</strong></div>";
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