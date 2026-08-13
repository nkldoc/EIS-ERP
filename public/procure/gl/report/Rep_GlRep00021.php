<?php
include("../api/List_GlRep00021.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();
$db 		= new DatabaseServer();
$date 		= new i_date();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;

$caption	= "งบทดลอง (ตามบัญชี - ช่วงเวลา)";
 
if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		$style		= "";
		
		// GEN TBODY
		if( $jObj["i_type"] == 1 ) { $style = "style='background:#D3DCE3;'"; }
		else if( $jObj["i_type"] == 2 ) { $style = "style='background:#E3E9ED;'"; }
		else if( $jObj["i_type"] == 3 ) { $style = "style='background:#EFF2F4;'"; }
		else if( $jObj["i_type"] == 5 ) { $style = "style='background:#BDD6F8;'"; }
		
		switch ($_REQUEST["i_show_acc"])
		{
			case "1" : // บัญชีคุม LV4  = บัญชีคุม LV4  + หน่วยงาน
			case "3" : // บัญชีคุม LV5  = บัญชีคุม LV5  + หน่วยงาน
			case "2" : // บัญชีย่อย LV6  = บัญชีย่อย LV6  + หน่วยงาน
						if (($jObj["i_type"] == 1) || ($jObj["i_type"] == 3))
						{ 
							$tbody	.=	"<tr height=20>";
							$tbody	.= "<td nowrap ".$style."><b>".$jObj["c_code"]."</b></td>";
							$tbody	.= "<td nowrap ".$style."><b>".$jObj["c_name"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_dr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_cr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_dr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_cr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_dr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_cr"]."</b></td>";
							$tbody	.=	"</tr>"; 
						} 
						else if ($jObj["i_type"]==4)
						{	 
							$dd 	= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
							
							$tbody	.=	"<tr>";
							$tbody	.= "<td nowrap ".$style.">".$dd.$jObj["c_code"]."</td>";
							$tbody	.= "<td nowrap ".$style.">".$dd.$jObj["c_name"]."</td>";
							$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_begin_dr"],2)."</td>";
							$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_begin_cr"],2)."</td>";
							$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_dr"],2)."</td>";
							$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_cr"],2)."</td>";
							$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_end_dr"],2)."</td>";
							$tbody	.= "<td nowrap ".$style." align='right'>".number_format($jObj["f_end_cr"],2)."</td>";
							$tbody	.=	"</tr>"; 
						} 
						else if($jObj["i_type"] == 5) {
								
							$tbody	.=	"<tr height=20>";
							$tbody	.= "<td colspan=2 nowrap ".$style." align='right'><b>รวมทั้งสิ้น</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_dr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_cr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_dr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_cr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_dr"]."</b></td>";
							$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_cr"]."</b></td>";
							$tbody	.=	"</tr>";
							
						}						
				break;
			case "9" : // ทั้งหมด
			default  :
							if($jObj["i_type"] == 1) { 
								$tbody	.=	"<tr height=20>";
								$tbody	.= "<td nowrap ".$style."><b>".$jObj["c_code"]."</b></td>";
								$tbody	.= "<td nowrap ".$style."><b>".$jObj["c_name"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_dr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_cr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_dr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_cr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_dr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_cr"]."</b></td>";
								$tbody	.=	"</tr>";
								
							} 
							if($jObj["i_type"] == 2 || $jObj["i_type"] == 3 || $jObj["i_type"] == 4) {
								
								$dd	= "";
								for($i=1;$i<=$jObj["i_type"];$i++) { $dd .= "&nbsp;&nbsp;&nbsp;&nbsp;"; }
								
								$tbody	.=	"<tr>";
								$tbody	.= "<td nowrap ".$style.">".$dd.$jObj["c_code"]."</td>";
								$tbody	.= "<td nowrap ".$style.">".$dd.$jObj["c_name"]."</td>";
								$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_begin_dr"]."</td>";
								$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_begin_cr"]."</td>";
								$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_dr"]."</td>";
								$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_cr"]."</td>";
								$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_end_dr"]."</td>";
								$tbody	.= "<td nowrap ".$style." align='right'>".$jObj["f_end_cr"]."</td>";
								$tbody	.=	"</tr>";
								
							} 
							if($jObj["i_type"] == 5) {
								
								$tbody	.=	"<tr height=20>";
								$tbody	.= "<td colspan=2 nowrap ".$style." align='right'><b>รวมทั้งสิ้น</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_dr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_begin_cr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_dr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_cr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_dr"]."</b></td>";
								$tbody	.= "<td nowrap ".$style." align='right'><b>".$jObj["f_end_cr"]."</b></td>";
								$tbody	.=	"</tr>";
								
							}
				break;
		}
		
		 
	}
	
	$tbody	.= "</tbody>";

} else {
	$conspan	= 9;
// 	foreach ($thead AS $ss) { ++$conspan;  }
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
	$month		= (string)sprintf("%02d%",@$_REQUEST["month"],"");
	$end		= date("t",mktime(0,0,0,substr("0".$month,-2),date("d"),@$_REQUEST["year"]));   // หาวันสุดท้ายของแต่ละเดือน

	if( $s_title == true ) echo "<div align='center'><strong>".$title."</strong></div>";

	echo "<div align='center'><strong>".$caption."</strong></div>";
	echo "<div align='center'><strong>ณ วันที่ &nbsp;".$end."&nbsp;&nbsp;".($date->l_month_thai[$month])."  ".($_REQUEST["year"]+543)."</strong></div>";
?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top"> 
<tr>
	<th colspan='2' nowrap style='vertical-align:middle;'>รหัสบัญชี</th>
	<th nowrap style='vertical-align:middle;'>ยอดยกมา เดบิต</th>
	<th nowrap style='vertical-align:middle;'>ยอดยกมา เครดิต</th>
	<th nowrap style='vertical-align:middle;'>เดบิต</th>
	<th nowrap style='vertical-align:middle;'>เครดิต</th>
	<th nowrap style='vertical-align:middle;'>ยอดยกไป เดบิต</th>
	<th nowrap style='vertical-align:middle;'>ยอดยกไป เครดิต</th>
</tr>
</thead>
<?= $tbody ?>
</table>
</body>
</html>