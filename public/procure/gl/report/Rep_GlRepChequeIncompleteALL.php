<?php
include("../api/List_GlRepChequeIncompleteAll.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$title		= CUSTOMER_NAME_TH;

if($_REQUEST["page"] == "GlRepChequeIncomplete_IMP") {
	$caption	= "รายงาน เช็คจ่ายที่ไม่สมบูรณ์ (IMPE & IMPV) - กระแสรายวัน"; 
} else if($_REQUEST["page"] == "GlRepChequeIncomplete_BTN") {
	$caption	= "รายงาน บัญชีเงินฝากธนาคาร(ไม่มีรายละเอียดค่าใช้จ่าย) - กระแสรายวัน";
}

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

$page				= "";
$tbody				= "";

if( is_array($data_dtl) && count($data_dtl["data"]) > 0 ) {
	
	// ================================================================================= //
	// ธนาคาร
	if($_REQUEST["dc_bank_id"] > 0) {
		$for_id = explode ( ";", $_REQUEST ["dc_bank_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam ( "SELECT c_name AS c_name FROM dc_bank WHERE dc_bank_id IN (" . $in . ")", array () );

			if ($stmt) {
				$name = "";
				while ( $row = $db->Fetch ( $stmt ) ) {
					$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
				}
			}
		}
		$dc_bank_name = "ธนาคาร : <font color='blue'>" . $name . "</font>";
	} else {
		$dc_bank_name = "ธนาคาร : <font color='blue'>เลือกทั้งหมด</font>";
	}
	
	// บัญชี
	if($_REQUEST["dc_bank_acc_company_id"] > 0) {
		$for_id = explode ( ";", $_REQUEST ["dc_bank_acc_company_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam ( "SELECT c_code+' : '+c_name AS c_name FROM dc_bank_acc_company WHERE dc_bank_acc_company_id IN (" . $in . ")", array () );

			if ($stmt) {
				$name = "";
				while ( $row = $db->Fetch ( $stmt ) ) {
					$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
				}
			}
		}
		$dc_bank_acc_company_name = "เลขที่บัญชี : <font color='blue'>" . $name . "</font>";
	} else {
		$dc_bank_acc_company_name = "เลขที่บัญชี : <font color='blue'>เลือกทั้งหมด</font>";
	}
	// ================================================================================= //
	
	// =================================== GEN PAGE ==================================== //
	$i	= 0;
	
	foreach($data_dtl["data"] as $index => $jObj) {
		$i++;
		
		$sum_dr	= 0;
		$sum_cr	= 0;
		
		$sum_end_dr	= 0;
		$sum_end_cr	= 0;
		$head	= "	<div class='headTitle' style='text-align: center;'>".$title."<br>".$caption."</div>
					<br>
					<table border='0' align='center' cellpadding='0' cellspacing='0' width='100%'>
						<tr><td style='text-align: left;' colspan='7'>{$dc_bank_name}</td></tr>
						<tr><td style='text-align: left;' colspan='7'>{$dc_bank_acc_company_name}</td></tr>
					</table>
					<br>";	 
		
		$page	.= "<div class='page'>
						{$head}
						<div style='font-size: 14px;font-weight: bold; padding-bottom: 4px;'>".$jObj["company_code"]." : ".$jObj["company_name"]."</div>
						<table class='table-data' border='0' align='center' cellpadding='3' cellspacing='0' width='100%'>
							<thead>
								<tr>
									<th colspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>พ.ศ.</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>ที่เอกสาร</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>รายการ</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>เดบิต (ฝาก)</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>เครดิต (ถอน)</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>ส่วนต่าง</th>
								</tr>
								<tr>
									<th width=60 class='headerTitle01' style='border: 1px solid; border-top: none;' valign='middle' nowrap>เดือน</th>
									<th width=60 class='headerTitle01' style='border-bottom: 1px solid; border-right: 1px solid;' valign='middle' nowrap>วันที่</th>
								</tr>
							</thead>
							<tbody>";
		
		// YEAR
		foreach($jObj["data"] as $iiY => $jObjY) {
			
			$style	= "style='border-left: 1px solid; border-right: 1px solid;' nowrap";
			$page	.= "		<tr>
									<td align='center' {$style}>".$jObjY["c_yyyy"]."</td>
									<td align='center' {$style}></td>
									<td align='center' {$style}></td>
									<td align='center' {$style}></td>
									<td align='center' {$style}></td>
									<td align='center' {$style}></td>
									<td align='right' {$style}>".number_format($jObjY["f_end_dr"],2)."</td>
								</tr>";
								

 

 					
			// MONTH
			foreach($jObjY["data"] as $iiM => $jObjM) {				
				
				$chk	= true;
				// MONTH
				$s_name	= $style_cancel0= $style_cancel1=$style_cancel2=$style_cancel3="";
				$style_cancel4 = $style_cancel5 = "";
				$style_dr1 = $style_dr2 = $style_cr1 = $style_cr2 = "";
				foreach($jObjM["data"] as $iiD => $jObjD) {
					foreach($jObjD["data"] as $iiT => $jObjT) {
						$style_cancel0= $style_cancel1=$style_cancel2=$style_cancel3="";
						foreach($jObjT["data"] as $iiC => $jObjC) {
							if($chk === true) {
								$c_mm	= $jObjM["c_mm"];
								$chk	= false;
							} else { $c_mm = ""; }
							
							if($jObjC["c_name"] != @$s_name) {
								$s_name	= $jObjC["c_name"];
								$c_name	= $jObjC["c_name"];
							} else { $c_name	= "''"; }
							
							$f_dr	= ($jObjC["f_dr"] > 0)		? number_format($jObjC["f_dr"],2) 	: "";
							$f_cr	= ($jObjC["f_cr"] > 0)		? number_format($jObjC["f_cr"],2) 	: "";
							 							
							$f_diff	=  $style_diff1 = $style_diff2 = ""; 
							if ($jObjC["the_i_type"]==9) 
							{
								$f_diff	= number_format($jObjC["f_diff"],2);
								$jObjC["c_cheque"] = $c_name = $f_dr = $f_cr = ""; 
								$style_diff1 = "<font color=green>";
								$style_diff2 = "</font>";
							}	
						
							
							$page	.= "	<tr>
												<td align='center' {$style}>".$style_cancel0.$c_mm.$style_cancel1."</td>
												<td align='center' {$style}>".$style_cancel0.$jObjC["c_dd"].$style_cancel1."</td>
												<td align='center' {$style}>".$style_cancel0.$jObjC["c_cheque"].$style_cancel1."</td>
												<td align='center' {$style}>".$style_cancel0.$c_name.$style_cancel1."</td>
												<td align='right' {$style}>".$f_dr."</td>
												<td align='right' {$style}>".$f_cr."</td>
												<td align='right' {$style}>".$style_diff1.$f_diff.$style_diff2."</td> 
											</tr>";
 
							
							$sum_dr		+= $jObjC["f_dr"];
							$sum_cr		+= $jObjC["f_cr"];
							$the_pk_id  = $jObjC["pk_id"]; 
						}
					}
				}
			} // MONTH ค่าใช้จ่าย
		 		
			
			
			
			$sum_end_dr	+= $jObjY["f_end_dr"];
			$sum_end_cr	+= $jObjY["f_end_cr"];
		} // YEAR
		
		$page	.= "</tbody>";
		$page	.= "<tbody style='border: 0px;'>
						<tr>
							<td style='border-left: 0px;' colspan=4 nowrap align=right><b>รวมเลขบัญชี : ".$jObj["company_code"]."</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>".number_format($sum_dr,2)."</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>".number_format($sum_cr,2)."</b></td>
							<td nowrap style='border-left: 1px solid; border-right: 1px solid; border-bottom: 4px double;' align=right nowrap><b>".number_format(($sum_end_dr+$sum_dr)-$sum_cr,2)."</b></td>
						</tr>
						<tr>
							<td style='border-left: 0px;' colspan=4 nowrap align=right><b>ยอดยกมา</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>".number_format($sum_end_dr,2)."</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>".number_format($sum_end_cr,2)."</b></td>
						</tr>
						<tr>
							<td style='border-left: 0px;' colspan=4 nowrap align=right><b>".$jObj["c_name"]."</b></td>
							<td style='border: 1px solid;' align=right nowrap><b>".number_format($sum_dr+$sum_end_dr,2)."</b></td>
							<td style='border: 1px solid;' align=right nowrap><b>".number_format($sum_cr+$sum_end_cr,2)."</b></td>
						</tr>
					</tbody>";
		$page	.= "</table></div>";
	} // GEN PAGE
	echo $page;
	// ================================================================================= //
} else { echo "ไม่มีรายการ"; }
?>
</body>
</html>