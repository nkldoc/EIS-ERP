<?php
include("../api/List_RepGlBank.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$title		= CUSTOMER_NAME_TH;
$caption	= "รายงาน บัญชีเงินฝากธนาคาร(ไม่มีรายละเอียดค่าใช้จ่าย)";

if($_REQUEST["type"] == "excel") { $export->headerExcel($caption); }
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN"   
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title><?php echo COMPANY_NAME;?></title>
<style type="text/css">
* {
	font-family: sans-serif;
	font-size: 12px;
	box-sizing: border-box;
	-moz-box-sizing: border-box;
}
html {
	font-family: sans-serif;
	font-size: 12px;
	color: #000000;
}
body {
	font-family: sans-serif;
	font-size: 12px;
	padding: 0;
	margin: 0;
	color: #000000;
	background: #fff;
}
table {
    border-collapse: collapse;
}
.table-data > thead > tr > th {
    border: 1px solid black;
}
.table-data > tbody {
    border: 1px solid black;
}
.table-data > tbody > tr > td {
	border-left: 1px solid black;
}
.headTitle {
	font-size: 14px;
	font-weight: bold;
	text-transform: uppercase;
} 
@page {
	size: A4;
	margin: 0;
}
@media print {
	.page {
		width: 21cm;
		min-height: 29.7cm;
		padding: 2cm;
		margin: 1cm auto;
		border: 1px solid #eee;
	
		margin: 0;
		border: initial;
		border-radius: initial;
		width: initial;
		min-height: initial;
		box-shadow: initial;
		background: initial;
		page-break-after: always;
		
		
	}
}
</style>
</head>
<body>
<?php
$data_dtl	= json_decode(List_QueryParam(), true);

$totalCount			= $data_dtl["totalCount"];
$first_page_size	= 35;
$next_page_size		= 80;
$page_default		= 1;
$all_page			= ceil(($totalCount+abs($next_page_size-$first_page_size))/$next_page_size);
$page				= "";
$tbody				= "";
$footer				= "";
$chk_total			= false;

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	foreach($data_dtl["data"] as $index => $jObj) {
		
		if( @$jObj["i_type"] == 3 ) {
				
			$tbody	.= "<tr height='30'>
							<td align='center' style='border-left: 1px solid; border-right: 1px solid;' nowrap>".$jObj["c_yyyy"]."</td>
							<td style='border-right: 1px solid;'></td>
							<td style='border-right: 1px solid;'></td>
							<td style='border-right: 1px solid;'></td>
							<td style='border-right: 1px solid;'></td>
							<td style='border-right: 1px solid;'></td>
							<td style='border-right: 1px solid;' align='right'>".$jObj["f_begin_show_dr"]."</td>
						</tr>";
				
		} else if( @$jObj["i_type"] == 1 ) {
		
			$tbody	.= "<tr height='20'>
							<td align='center' style='border-left: 1px solid; border-right: 1px solid;' nowrap>".$jObj["c_mm"]."</td>
							<td align='center' style='border-right: 1px solid;' nowrap>".$jObj["c_dd"]."</td>
							<td align='center' style='border-right: 1px solid;' nowrap>".$jObj["c_cheque"]."</td>
							<td align='center' style='border-right: 1px solid;' nowrap>".$jObj["c_name"]."</td>
							<td align='right' style='border-right: 1px solid;' nowrap>".$jObj["f_dr"]."</td>
							<td align='right' style='border-right: 1px solid;' nowrap>".$jObj["f_cr"]."</td>
							<td align='right' style='border-right: 1px solid;' nowrap> </td>
						</tr>";
				
		} else if( @$jObj["i_type"] == 2 ) {
				
			$tbody	.= "<tr>
							<td align='center' style='border-left: 1px solid; border-right: 1px solid;' nowrap> </td> 
							<td align='center' style='border-right: 1px solid;' nowrap>".$jObj["d_cheque_date"]."</td>
							<td align='center' style='border-right: 1px solid;' nowrap>".$jObj["c_cheque"]."</td>
							<td align='center' style='border-right: 1px solid;' nowrap>".$jObj["c_name"]."</td>
							<td align='right' style='border-right: 1px solid;' nowrap>".$jObj["f_dr"]."</td>
							<td align='right' style='border-right: 1px solid;' nowrap>".$jObj["f_cr"]."</td>
							<td align='right' style='border-right: 1px solid;' nowrap> </td>
						</tr>";
				
		}
		
		// รวม
		if($totalCount == $jObj["numrow"]) {
			
			$chk_total	= true;
			
			$tbody	.= "<tfoot>";
			$tbody	.= "<tr>
							<td colspan='4' style='border-top: 1px solid; border-right: 1px solid;' align='right'>".$jObj["c_name"]."</td>
							<td align='right' nowrap style='border-top: 1px solid; border-right: 1px solid;'>".$jObj["f_dr"]."</td>
							<td align='right' nowrap style='border-top: 1px solid; border-right: 1px solid;'>".$jObj["f_cr"]."</td>
							<td align='right' nowrap style='border-top: 1px solid; border-left: 1px solid; border-right: 1px solid; border-bottom: 3px double;'>".$jObj["f_cal_end"]."</td>
						</tr>";
			$tbody	.= "<tr>
							<td colspan='4' style='border-right: 1px solid;' align='right'>".$jObj["c_name2"]."</td>
							<td align='right' nowrap style='border-left: 1px solid; border-right: 1px solid; border-bottom: 1px solid;'>".$jObj["f_dr2"]."</td>
							<td align='right' nowrap style='border-left: 1px solid; border-right: 1px solid; border-bottom: 1px solid;'>".$jObj["f_cr2"]."</td>
						</tr>";
			$tbody	.= "<tr>
							<td colspan='4' style='border-right: 1px solid;' align='right'>".$jObj["c_name3"]."</td>
							<td align='right' nowrap style='border-left: 1px solid; border-right: 1px solid; border-bottom: 3px double;'>".$jObj["f_dr3"]."</td>
							<td align='right' nowrap style='border-left: 1px solid; border-right: 1px solid; border-bottom: 3px double;'>".$jObj["f_cr3"]."</td>
						</tr>";
			$tbody	.= "</tfoot>";
			
		}

		if($totalCount < $first_page_size && $chk_total) {
			$page	.= "<div class='page'>".Page($tbody,$jObj,"firstPage").$footer."</div>";
		} else if($page_default == 1) {
			// หน้าแรก
			if($jObj["numrow"]%$first_page_size == 0) {
				if($chk_total) {
					$page	.= "<div class='page'>".Page($tbody,$jObj,"firstPage").$footer."</div>";
				} else {
					$page	.= "<div class='page'>".Page($tbody,$jObj,"firstPage")."</div>";
				}
				$tbody	= "";
			}
			
		} else if (($jObj["numrow"]-$first_page_size)%$next_page_size == 0) {
			// หน้าถัดไป
			$page	.= "<div class='page'>".Page($tbody,$jObj,"NextPage").$footer."</div>";
			$tbody	= "";
			
		} else if ($chk_total) {
			$page	.= "<div class='page'>".Page($tbody,$jObj,"NextPage").$footer."</div>";
			$tbody	= "";
		}
	}
}

echo $page;

function genHeader( $tbody ) {
	
	$data	= "	<table class='table-data' border='0' align='center' cellpadding='3' cellspacing='0' width='100%'>
					<thead>
						<tr>
							<th colspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>พ.ศ.</th>
							<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>ที่เอกสาร</th>
							<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>รายการ</th>
							<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>เดบิต (ฝาก)</th>
							<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>เครดิต (ถอน)</th>
							<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>คงเหลือ</th>
						</tr>
						<tr>
							<th width=100 class='headerTitle01' style='border: 1px solid; border-top: none;' valign='middle' nowrap>เดือน</th>
							<th width=100 class='headerTitle01' style='border-bottom: 1px solid; border-right: 1px solid;' valign='middle' nowrap>วันที่</th>
						</tr>
					</thead>
					<tbody>{$tbody}<tbody>
				</table>";
	return $data;
}

function Page($tbody, $jObj, $TYPE) {
	
	global $db, $date, $page_default, $all_page, $title, $caption;
	
	$data		= "";
	
	if($_REQUEST["dc_bank_id"] > 0) {
		$dc_bank_name = $db->GetDataBySQL("SELECT c_name FROM dc_bank WHERE dc_bank_id=?;", array($_REQUEST["dc_bank_id"]));
	} else {
		$dc_bank_name = "เลือกทั้งหมด";
	}
	
	if($_REQUEST["dc_bank_acc_company_id"] > 0) {
		$dc_bank_acc_company_name = $db->GetDataBySQL("SELECT c_code+' : '+c_name FROM dc_bank_acc_company WHERE dc_bank_acc_company_id=?;", array($_REQUEST["dc_bank_acc_company_id"]));
	} else {
		$dc_bank_acc_company_name = "เลือกทั้งหมด";
	}
	
	$data	.= "<div style='text-align: right;'>หน้าที่ ".$page_default++."/".$all_page."</div><br>";
	
	if($TYPE == "firstPage") {
		$data	.= "<div class='headTitle' style='text-align: center;'>".$title."<br>".$caption."</div>";
		$data	.= "<br>
					<table border='0' align='center' cellpadding='0' cellspacing='0' width='100%'>
						<tr><td style='text-align: left;' colspan='7'>ธนาคาร : {$dc_bank_name}</td></tr>
						<tr><td style='text-align: left;' colspan='7'>เลขที่บัญชี : {$dc_bank_acc_company_name}</td></tr>
					</table>
					<br>";
	}
	
	$data	.= genHeader($tbody);

	return $data;
}
?>
</body>
</html>