<?php
include("../api/List_AeRep00003.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "รายงานบัญชีบริหาร";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "รหัส/ชื่อศูนย์ต้นทุน";
$thead[]	= "ประเภทต้นทุน";
$thead[]	= "จำนวนเงิน";

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$tbody		.=	"<tr>";
		$style		= "";
		$nbsp		= "";
		$sum		= "";
		
		// GEN TBODY
		if( @$jObj["i_level"] == 1 ) { $style	= "style=\"background:#FF9900;\"";}
		else if( @$jObj["i_level"] == 2 ) { $style = "style=\"background:#FFFF66;\""; }
		else if( @$jObj["i_level"] == 3 ) { $style = "style=\"background:#CCFF99;\""; }
		else if( @$jObj["i_level"] == 4 ) { $style = "style=\"background:#99CCFF;\""; }
		else if( @$jObj["i_level"] == 5 ) { $style = "style=\"background:#FF99FF;\""; }
		else if( @$jObj["i_level"] == 6 ) { $style = ""; }
		else { $style = "style=\"background:#D3DCE3;\" align=\"right\""; }
	
		for( $i=1; $i<@$jObj["i_level"]; $i++ ) { $nbsp .= "&nbsp;&nbsp;"; }
		
		$tbody	.= "<td nowrap ".$style.">".$nbsp.$jObj["c_name"]."</td>";
		$tbody	.= "<td nowrap align='center' ".$style.">".$jObj["c_fixed"]."</td>";
		
		if( ($jObj["i_show_exp_type"] == 1 && $jObj["i_type"] == 0) || $jObj["i_level"] == 0 ) {
			if( $jObj["i_show_level"] == 1 ) {
				$sum	= ( $jObj["sum"] >= 0 )? number_format($jObj["sum"], 2) : "(".number_format(abs($jObj["sum"]), 2).")";
			}
			$tbody	.= "<td nowrap ".$style." align='right'>".$sum."</td>";
		} else if( $jObj["i_show_exp_type"] == 1 ) { // ไม่แสดงจำนวนเงิน
			$tbody	.= "<td nowrap ".$style." align='right'>".$sum."</td>";
		} else {
			if( $jObj["i_show_level"] == 1 ) {
				$sum	= ( $jObj["sum"] >= 0 )? number_format($jObj["sum"], 2) : "(".number_format(abs($jObj["sum"]), 2).")";
			}
			$tbody	.= "<td nowrap ".$style." align='right'>".$sum."</td>";
		}
		
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
	
	// ผังบัญชี
if( $_REQUEST["i_acc"] == 1 ) {
	
		$acc1	= $db->GetDataBySQL("SELECT c_name FROM dc_acc WHERE dc_acc_id=?", array($_REQUEST["dc_acc_id_s"]));
		$acc2	= $db->GetDataBySQL("SELECT c_name FROM dc_acc WHERE dc_acc_id=?", array($_REQUEST["dc_acc_id_e"]));
	
		$acc_name	= "ระหว่างบัญชี : <font color='blue'>".$acc1."</font> ถึงบัญชี : <font color='blue'>".$acc2."</font>";
	
} else {

	$dc_acc_id_r	= explode(";", $_REQUEST["dc_acc_id_r"]);
	if( !in_array( "0", $dc_acc_id_r ) ) {
		$in_acc	= "";
		foreach( $dc_acc_id_r as $val ) { $in_acc	.= ( $in_acc == "" )? $val : ", ".$val; }

		$stmt = $db->QueryParam( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (".$in_acc.")", array() );
		if( $stmt ) {
			$name_acc	= "";
			while( $row = $db->Fetch( $stmt ) ) {
				$name_acc	.= ( $name_acc == "" )? $row["c_name"] : ", ".$row["c_name"];
			}
		}
		$acc_name	= "รายการบัญชี : <font color='blue'>".$name_acc."</font>";

	} else { $acc_name	=	"รายการบัญชี : <font color='blue'>ทั้งหมด</font>"; }

}
	
	if( $_REQUEST["i_cost"] == 1 ) {
	
		$cost1	= $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id=?", array($_REQUEST["dc_cost_id_s"]));
		$cost2	= $db->GetDataBySQL("SELECT c_name FROM dc_cost WHERE dc_cost_id=?", array($_REQUEST["dc_cost_id_e"]));
	
		$estimate_name	= "ระหว่างหน่วยงาน : <font color='blue'>".$cost1."</font> ถึงหน่วยงาน : <font color='blue'>".$cost2."</font>";
	
	} else if( $_REQUEST["i_cost"] == 3 ) {
		$estimate_name	= "หน่วยงาน : <font color='blue'>".$db->GetDataBySQL("SELECT c_name FROM gl_dc_group_admin_hdr WHERE gl_dc_group_admin_hdr_id=?", array($_REQUEST["dc_cost_seg"]))."</font>";
	} else {
	
		$dc_cost_id_r	= explode(";", $_REQUEST["dc_cost_id_r"]);
		if( !in_array( "0", $dc_cost_id_r ) ) {
			$in_cost	= "";
			foreach( $dc_cost_id_r as $val ) {
				$in_cost	.= ( $in_cost == "" )? $val : ", ".$val;
			}
			
			$stmt = $db->QueryParam( "SELECT c_name FROM dc_cost WHERE dc_cost_id IN (".$in_cost.")", array() );
			if( $stmt ) {
				$name_cost	= "";
				while( $row = $db->Fetch( $stmt ) ) {
					$name_cost	.= ( $name_cost == "" )? $row["c_name"] : ", ".$row["c_name"];
				}
			}
			$estimate_name	= "หน่วยงาน : <font color='blue'>".$name_cost."</font>";
	
		} else { $estimate_name	=	"หน่วยงาน : <font color='blue'>ทั้งหมด</font>"; }
	
	}

	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div align=\"center\"><strong>ระหว่างวันที่ ".$date->shot_date_from_db($_REQUEST["d_save_date1"])." - ".$date->shot_date_from_db($_REQUEST["d_save_date2"])."</strong></div>";
	echo "<div><strong>".$acc_name."</strong></div>";
	echo "<div><strong>".$estimate_name."</strong></div>";
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