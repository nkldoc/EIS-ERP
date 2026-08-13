<?php
include("../api/List_GlRep00003.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;
 
/*===============================================*/
$caption	= "งบแสดงผลการดำเนินงาน  (ช่วงเวลา)";
/*===============================================*/
if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$c_thai_year	= $_REQUEST["year_start"]+543;
$the_i_show		= $_REQUEST["i_show"];

$thead[]	= "ที่";
$thead[]	= "รหัสบัญชี";
$thead[]	= "ชื่อบัญชี";
$thead[]	= "ต.ค.-ธ.ค. ".($c_thai_year-1);
$thead[]	= "ม.ค.-มี.ค. ".$c_thai_year;
$thead[]	= "เม.ย.-มิ.ย. ".$c_thai_year;
$thead[]	= "ก.ค.-ก.ย. ".$c_thai_year;
$thead[]	= "รวม";
 
$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
 
	foreach($data_dtl["data"] as $index => $jObj) {
 		$style = $c_code_show	= $c_money_show = $c_code_acc_show = $c_name_acc_show ="";
/* 		
		if($jObj["i_level"]==1) 
		{ 
			$style = "style=\"background:#D5FFFF; font-weight: bold;\""; 
			$c_code_show = $jObj["c_code"];
			if ($jObj["i_type"]!=1) 
			{
				$c_money_show = number_format($jObj["f_money"],2);
			}
			else
			{
				$c_money_show = "";
			}
		} 
 		else
 		{
			if ($jObj["i_type"]!=3) 
			{
	 
				$c_code_show	= "<span style=\"margin-left:30px;\">".$jObj["c_code"]."</span>";
				$c_money_show	= number_format($jObj["f_money"],2);
			}
		}
*/
		switch ($the_i_show)
		{
			case "3" : //บัญชีคุม
						switch ($jObj["i_type"])
						{
							case "1" : 	$c_code_acc_show = $jObj["c_code_lv1"] ;	$c_name_acc_show = $jObj["c_name_lv1"];
										$style = "style=\"background:#D5FFFF; font-weight: bold;\"";
									break;
							case "2" :	$c_code_acc_show = "&nbsp;&nbsp;&nbsp;&nbsp;".$jObj["c_code_lv2"] ; $c_name_acc_show = $jObj["c_name_lv2"];
									break;
							case "3" :	$c_code_acc_show = $jObj["c_code"] ; $c_name_acc_show = $jObj["c_name"];
									break;
							default :	$c_code_acc_show = ""; $c_name_acc_show = $jObj["c_name_lv1"];
									$style = "style=\"background:#CCCCCC; font-weight: bold;\"";
									break;					
						}

					break;
			case "1" : //บัญชีย่อย
			default	 :
						switch ($jObj["i_type"])
						{
  							case "2" :	$c_code_acc_show = $jObj["c_code_lv2"] ; $c_name_acc_show = $jObj["c_name_lv2"];
										$style = "style=\"background:#D5FFFF; font-weight: bold;\"";
									break;
							case "3" :	$c_code_acc_show = "&nbsp;&nbsp;&nbsp;&nbsp;".$jObj["c_code"] ; $c_name_acc_show = $jObj["c_name"];
									break;
							default :	$c_code_acc_show = ""; $c_name_acc_show = $jObj["c_name_lv1"];
									$style = "style=\"background:#CCCCCC; font-weight: bold;\"";
									break;					
						}
			
					break;
		}
		
		$c_money_q1_show = $c_money_q2_show = $c_money_q3_show = $c_money_q4_show = $c_money_all_show = "";
		if ($jObj["i_type"]!=1)
		{
			$c_money_q1_show 	= number_format($jObj["f_money1"],2);
			$c_money_q2_show 	= number_format($jObj["f_money2"],2);
			$c_money_q3_show 	= number_format($jObj["f_money3"],2);
			$c_money_q4_show 	= number_format($jObj["f_money4"],2);			
			$c_money_all_show	= number_format($jObj["total"],2);			
		}
		
		$tbody	.=	"<tr>";
		$tbody	.= "<td nowrap ".$style." align='center'>".$jObj["no"]."</td>";
		$tbody	.= "<td nowrap ".$style.">".$c_code_acc_show."</td>";
		$tbody	.= "<td nowrap ".$style.">".$c_name_acc_show."</td>";
		$tbody	.= "<td nowrap ".$style." align='right'>".$c_money_q1_show."</td>";
		$tbody	.= "<td nowrap ".$style." align='right'>".$c_money_q2_show."</td>";
		$tbody	.= "<td nowrap ".$style." align='right'>".$c_money_q3_show."</td>";
		$tbody	.= "<td nowrap ".$style." align='right'>".$c_money_q4_show."</td>";
		$tbody	.= "<td nowrap ".$style." align='right'>".$c_money_all_show."</td>";
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
	echo "<div align=\"center\"><strong>ปี ".$c_thai_year."</strong></div>";
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
