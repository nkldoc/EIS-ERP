<?php
include("../api/List_RepDcBankAcc.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงานสมุดบัญชีธนาคาร";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "ลำดับ";
$thead[]	= "ธนาคาร";
$thead[]	= "สาขา";
$thead[]	= "ประเภทเงินฝาก";
$thead[]	= "เลขที่บัญชี";
$thead[]	= "ชื่อบัญชี";
$thead[]	= "หน่วยธุรกิจ";
$thead[]	= "ผังบัญชี";
$thead[]	= "คำอธิบายเพิ่มเติม";
$thead[]	= "สถานะ";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		// GEN TBODY
		$style		= " nowrap ";
			
		$i_enable	= $arr_status[$jObj["i_enable"]];
		$i_enable	= ( $jObj["i_enable"] == STATUS_ENABLE )? "<font color='green'>".$i_enable."</font>" : "<font color='red'>".$i_enable."</font>";
			
		$tbody	.=	"<tr>";
		$tbody	.= "<td ".$style." align='center'>".$jObj["no"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["bank_name"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["bank_branch_name"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["bank_deposit_type_name"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["c_code"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["c_name"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["area_name"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["acc_name"]."</td>";
		$tbody	.= "<td ".$style.">".$jObj["c_comment"]."</td>";
		$tbody	.= "<td ".$style." align='center'>".$i_enable."</td>";
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
	if( $s_title == true ) echo "<div align='center'><strong>".$title."</strong></div>";
	
	$dc_bank				= ($_REQUEST["dc_bank_id"] > 0)? $db->GetDataBySQL("SELECT c_name FROM dc_bank WHERE dc_bank_id=?", array($_REQUEST["dc_bank_id"])) : "เลือกทั้งหมด";
	$dc_bank_deposit_type	= ($_REQUEST["dc_bank_deposit_type_id"] > 0)? $db->GetDataBySQL("SELECT c_name FROM dc_bank_deposit_type WHERE dc_bank_deposit_type_id=?", array($_REQUEST["dc_bank_deposit_type_id"])) : "เลือกทั้งหมด";
	$dc_area				= ($_REQUEST["dc_area_id"] > 0)? $db->GetDataBySQL("SELECT c_name FROM dc_area WHERE dc_area_id=?", array($_REQUEST["dc_area_id"])) : "เลือกทั้งหมด";

	echo "<div align='center'><strong>".$caption."</strong></div>";
	echo "<div><strong>ธนาคาร : <font color='blue'>".$dc_bank."</font></strong></div>";
	echo "<div><strong>ประเภทเงินฝาก : <font color='blue'>".$dc_bank_deposit_type."</font></strong></div>";
	echo "<div><strong>หน่วยธุรกิจ : <font color='blue'>".$dc_area."</font></strong></div>";
	echo "<div><strong>สถานะ : <font color='blue'>".$arr_status[$_REQUEST["i_enable"]]."</font></strong></div>";
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
