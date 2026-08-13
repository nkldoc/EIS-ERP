<?php
include("../api/List_GlRep00002_dtl.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;
 
/*===============================================*/
$caption	= "งบแสดงฐานะการเงิน 2";
/*===============================================*/
if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$thead[]	= "ที่";
$thead[]	= "รหัสบัญชี";
$thead[]	= "ชื่อบัญชี";
$thead[]	= "จำนวนเงิน";
 
$data_dtl	= json_decode(List_QueryParam(), true);

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	$tbody		= "<tbody>";
 
	foreach($data_dtl["data"] as $index => $jObj) {
 		$style = $c_code_show	= $c_money_show = "";
 		
		if($jObj["i_level"]==1) 
		{ 
			$dd				=""; 
			$c_code_show	= "<span style=\"margin-left:10px;\">".$jObj["c_code"]."</span>";
			$bgc			= " bgcolor='#D5FFFF'";
			$cc1 			= "<font><b>";
			$cc2 			= "</b></font>";
			
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
			$bgc		= ""; 
			$dd			= "";
			$dd_empty 	= "&nbsp;&nbsp;";
			$cc1 			= "<font><b>";
			$cc2 			= "</b></font>";
			
			switch ($jObj["i_level"])
			{ 
				case "3" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break; 
				case "4" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break; 
				case "5" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break;  	
				case "6" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; 
								$cc1 = $cc2 ="";
						break;				
				case "2" 	:
				default 	: 	$dd = $dd_empty; break;  
						
			}
			
			if ($jObj["i_type"]!=3) 
			{
	 
				$c_code_show	= "<span style=\"margin-left:30px;\">".$dd.$jObj["c_code"]."</span>";
				$c_money_show	= number_format($jObj["f_money"],2);
			}
		}

		
  			$tbody	.=	"<tr $bgc>";
			$tbody	.= "<td nowrap ".$style." align='center'>".$cc1.$jObj["no"].$cc2."</td>";
			$tbody	.= "<td nowrap ".$style.">".$cc1.$c_code_show.$cc2."</td>";
			$tbody	.= "<td nowrap ".$style.">".$cc1.$jObj["c_name"].$cc2."</td>";
 			$tbody	.= "<td nowrap ".$style." align='right'>".$cc1.$c_money_show.$cc2."</td>";
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
	$month	= (string)sprintf("%02d%",@$_REQUEST["month_start"],""); 
	$end 	= date('t',mktime(0,0,0,substr("0".$month,-2),date("d"),@$_REQUEST["year_start"]));   // หาวันสุดท้ายของแต่ละเดือน
	
	if( $s_title == true ) echo "<div align=\"center\"><strong>".$title."</strong></div>";

	echo "<div align=\"center\"><strong>".$caption."</strong></div>";
	echo "<div align=\"center\"><strong>ณ วันที่ &nbsp;".$end."&nbsp;&nbsp;".($date->l_month_thai[$month])."  ".($_REQUEST["year_start"]+543)."</strong></div>";
	echo "<div align=\"left\"><strong>(แสดง LV ที่เลือกถึงบัญชีย่อย)</strong></div>";
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
