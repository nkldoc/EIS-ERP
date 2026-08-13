<?php
include ("../api/List_GlRep00019.php");
include ("../../lib/export/exportUtil.php");
include("../../dc/conf/configDC.php");

$export = new exportUtil ();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงาน รายละเอียดเงินฝากธนาคาร(บัญชีย่อยฯ ทั้งหมด)";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }

$data_dtl = json_decode ( List_QueryParam (), true );

if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody = "<tbody>"; 
	
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style = "";
		
		// GEN TBODY
		if (@$jObj ["i_type"] == 1) {
			
			$style = "style='background:#E5EEFC;'";
			
			$tbody .= "<tr height=20>";
			$tbody .= "<td nowrap colspan=14 " . $style . "><b>&nbsp;" . $jObj ["c_name"] . "</b></td>";
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 2) {
			
			$tbody .= "<tr>"; 
			$tbody .= "<td nowrap " . $style . " align='center'>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td nowrap " . $style . ">" . $jObj["c_name"] . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["deposit_balance_1"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["deposit_1"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["withdraw_1"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["deposit_2"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["withdraw_2"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["deposit_3"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["withdraw_3"]. "</td>"; 
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["deposit_4"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["withdraw_4"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["deposit_5"]. "</td>";
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["withdraw_5"]. "</td>";  
			$tbody .= "<td " . $style . " align='right'>" . $jObj ["deposit_balance_2"] . "</td>";
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 3) {
			
			$style = "style='background:#FBD6B8;'";
			
			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan=2 align='center'><b>".$jObj["c_name"]."</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_balance_1"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_1"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_1"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_2"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_2"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_3"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_3"]."</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_4"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_4"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_5"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_5"]."</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_balance_2"]."</b></td>";
			$tbody .= "</tr>";
			$tbody .= "<tr><td colspan=10>&nbsp;</td></tr>";
			
		} else if (@$jObj ["i_type"] == 4) {
			
			$style = "style='background:#FABF8F;'";
			
			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan=2 align='center'><b>".$jObj["c_name"]."</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_balance_1"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_1"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_1"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_2"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_2"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_3"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_3"]."</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_4"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_4"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_5"]."</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["withdraw_5"]."</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>".$jObj["deposit_balance_2"]."</b></td>";
			$tbody .= "</tr>";
		}
	}
	
	$tbody .= "</tbody>";
}
// ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<body>
<?php
if ($s_title == true)
	echo "<div align='center'><strong>" . $title . "</strong></div>";
 
$c_budget_year_show = substr($_REQUEST["date_end"],0,4)+543; 
 
switch ($_REQUEST["gl_book_type_id"])
{
	case "1" 	: $gl_dc_book_type_name = "สมุดรายวันรับ"; 	break;
	case "2" 	: $gl_dc_book_type_name = "สมุดรายวันจ่าย"; 	break;
	case "3" 	: $gl_dc_book_type_name = "สมุดรายวันทั่วไป"; 	break;
	case "4" 	:  
	default 	: $gl_dc_book_type_name = "สมุดรายวันทั้งหมด"; 	break;
}
echo "<div align='center'><strong>" . $caption . "</strong></div>";
echo "<div align='center'><strong>ปีงบประมาณ : " . ($c_budget_year_show) . "</strong></div>";
echo "<div align='center'><strong>ประเภทรายการ : " . ($gl_dc_book_type_name) . "</strong></div>";

 
 
 
$c_header_dep_type = "";
foreach ($CONF_I_BANK_DEPOSIT_TYPE_ITYPE as $idx=>$deposit_type_name)
{
	$c_header_dep_type .="<th colspan=2 style='vertical-align:middle;' nowrap>".$deposit_type_name."</th>"; 
}


 ?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
<thead valign="top">
<tr>
	<th colspan=2 rowspan=2 style='vertical-align:middle;' nowrap>สถานที่ฝากเงิน (ธนาคาร) / เลขที่บัญชี</th>
	<th rowspan=2 style='vertical-align:middle;' nowrap>เงินฝากคงเหลือ<br>ยกมา</th> 
	<?php echo $c_header_dep_type; ?> 
	<th rowspan=2 style='vertical-align:middle;' nowrap>เงินฝากคงเหลือ<br>ยกไป</th>
</tr>
<tr>
	<th style='vertical-align:middle;' nowrap>ฝาก</th>
	<th style='vertical-align:middle;' nowrap>ถอน</th>
	<th style='vertical-align:middle;' nowrap>ฝาก</th>
	<th style='vertical-align:middle;' nowrap>ถอน</th>
	<th style='vertical-align:middle;' nowrap>ฝาก</th>
	<th style='vertical-align:middle;' nowrap>ถอน</th>

	<th style='vertical-align:middle;' nowrap>ฝาก</th>
	<th style='vertical-align:middle;' nowrap>ถอน</th>
	<th style='vertical-align:middle;' nowrap>ฝาก</th>
	<th style='vertical-align:middle;' nowrap>ถอน</th>

	
</tr>
</thead>
<?= $tbody?>
</table>
</body>
</html>
