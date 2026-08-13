<?php
include ("../api/List_RepImpExpense.php");
include ("../../lib/export/exportUtil.php");

$export = new exportUtil ();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานนำเข้าข้อมูลค่าใช้จ่าย (e-phys)";

if ($_REQUEST ["type"] == "excel") {
	$export->headerExcel ( $caption );
}

$thead [] = "ลำดับที่";
$thead [] = "เงินรายได้";
$thead [] = "รายจ่ายย่อย";
$thead [] = "บัญชีคุม Lv 4";
$thead [] = "บัญชีคุม Lv 5";
$thead [] = "บัญชีย่อย";
$thead [] = "วันที่จ่ายเงิน";
$thead [] = "ปีงบประมาณ";
$thead [] = "เลขที่ฎีกา";
$thead [] = "รายการ";
$thead [] = "จ่ายให้"; 
$thead [] = "จำนวนขอเบิก<br>รวมภาษีมูลค่าเพิ่ม";
$thead [] = "ภาษีหัก ณ ที่จ่าย<br>(บุคคลธรรมดา)";
$thead [] = "ภาษีหัก ณ ที่จ่าย<br>(นิติบุคคล)";
$thead [] = "ประกันสังคม";
$thead [] = "pljobperamt";
$thead [] = "ค่าปรับ";
$thead [] = "จำนวนจ่ายสุทธิ";
$thead [] = "จำนวนสุทธิ";
$thead [] = "เลขที่เช็ค";

$data_dtl = json_decode ( List_QueryParam (), true );

if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody = "<tbody>";
	$no = 0;
	
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style = "";
		
		// GEN TBODY
		if (@$jObj ["i_type"] == 1) {
			
			// $style = "style='background:#E2E8E9;'";
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " align='center'>" . (++ $no) . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj ["dc_expense_budget_type_name"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj ["dc_expense_name"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj ["acc_name_lv4"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj ["acc_name_lv5"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj ["acc_name"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj ["d_pay"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj ["c_budget_year"] . "</td>";
			$tbody .= "<td " . $style . " align='center'>" . $jObj ["c_approve"] . "</td>";
			$tbody .= "<td " . $style . " align='center'>" . $jObj ["c_acc_item"] . "</td>";
			$tbody .= "<td " . $style . " align='center'>" . $jObj ["c_creditor"] . "</td>"; 
			$tbody .= "<td " . $style . " align='right'>" . number_format ( ($jObj ["f_inv"]+$jObj ["f_vat"]), 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format ( $jObj ["f_tax_personal"], 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format ( $jObj ["f_tax_corporate"], 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format ( $jObj ["f_social_security"], 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format ( $jObj ["f_money1"], 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format ( $jObj ["f_fine"], 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format ( $jObj ["f_total"], 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format ( $jObj ["f_check_total"], 2 ) . "</td>";
			$tbody .= "<td " . $style . " align='center'>" . $jObj ["c_cheque_numbers"] . "</td>";
			$tbody .= "</tr>";
		} else if (@$jObj ["i_type"] == 2) {
			
			$style = "style='background:#E0E0DE;'";
			
			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='11' align='right'><b>รวมบัญชีคุม LV4 : " . $jObj ["acc_name_lv4"] . "</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( ($jObj ["f_inv"]+$jObj ["f_vat"]), 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_tax_personal"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_tax_corporate"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_social_security"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_money1"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_fine"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_total"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_check_total"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'></td>";
			$tbody .= "</tr>";
		} else if (@$jObj ["i_type"] == 3) {
			
			$style = "style='background:#C6D2D1;'";
			
			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='11' align='right'><b>รวมทั้งสิ้น</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( ($jObj ["f_inv"]+$jObj ["f_vat"]), 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_tax_personal"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_tax_corporate"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_social_security"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_money1"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_fine"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_total"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_check_total"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='center'></td>";
			
			$tbody .= "</tr>";
		} else if (@$jObj ["i_type"] == 4) {
			
			$style = "style='background:#fdd08b;'";
			
			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='11' align='right'><b>รวมบัญชีคุม LV5 : " . $jObj ["acc_name_lv5"] . "</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( ($jObj ["f_inv"]+$jObj ["f_vat"]), 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_tax_personal"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_tax_corporate"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_social_security"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_money1"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_fine"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_total"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format ( $jObj ["f_check_total"], 2 ) . "</b></td>";
			$tbody .= "<td " . $style . " align='center'></td>";
			
			$tbody .= "</tr>";
		}
	}
	
	$tbody .= "</tbody>";
} else {
	$conspan = 0;
	foreach ( $thead as $ss ) {
		++ $conspan;
	}
	$tbody = "<tbody><tr><td align='center' colspan=" . $conspan . ">ไม่มีข้อมูล</td></tr></tbody>";
}
?>
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

$for_id = explode ( ";", $_REQUEST ["dc_expense_budget_type_id"] );
if (! in_array ( "0", $for_id )) {
	$in = "";
	foreach ( $for_id as $val ) {
		$in .= ($in == "") ? $val : ", " . $val;
	}
	$stmt = $db->QueryParam ( "SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id IN (" . $in . ")", array () );

	if ($stmt) {
		$name = "";
		while ( $row = $db->Fetch ( $stmt ) ) {
			$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
		}
	}
	$budget_name = "แหล่งเงิน : <font color='blue'>" . $name . "</font>";
} else {
	$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
}

if ($_REQUEST ["dc_expense_id"] > 0) {
	$dc_expense_name = $db->GetDataBySQL ( "SELECT c_name FROM dc_expense WHERE dc_expense_id=?;", array (
			$_REQUEST ["dc_expense_id"] 
	) );
} else {
	$dc_expense_name = "เลือกทั้งหมด";
}

// =======================================//
if ($_REQUEST ["i_show_acc"] == 1) {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		foreach ( $for_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$parent_name = "รายการบัญชีคุม Lv4 : <font color='blue'>" . $name . "</font>";
	} else {
		$parent_name = "รายการบัญชีคุม Lv4 : <font color='blue'>เลือกทั้งหมด</font>";
	}
} else if ($_REQUEST ["i_show_acc"] == 3) {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		foreach ( $for_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$parent_name_lv5 = "รายการบัญชีคุม Lv5 : <font color='blue'>" . $name . "</font>";
	} else {
		$parent_name_lv5 = "รายการบัญชีคุม Lv5 : <font color='blue'>เลือกทั้งหมด</font>";
	}
} else {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		foreach ( $for_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$acc_name = "รายการบัญชีย่อย : <font color='blue'>" . $name . "</font>";
	} else {
		$acc_name = "รายการบัญชีย่อย : <font color='blue'>เลือกทั้งหมด</font>";
	}
}
// =======================================//

echo "<div align='center'><strong>" . $caption . "</strong></div>";
echo "<div><strong>วันที่นำเข้า : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["d_date_start"] ) . "</font> ถึงวันที่ : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["d_date_end"] ) . "</font></strong></div>";
echo "<div><strong>" . $budget_name . "</strong></div>";
echo "<div><strong>รายจ่ายย่อย : <font color='blue'>" . $dc_expense_name . "</font></strong></div>";

if ($_REQUEST ["i_show_acc"] == 1) {
	echo "<div><strong>" . $parent_name . "</strong></div>";
} else if ($_REQUEST ["i_show_acc"] == 3) {
	echo "<div><strong>" . $parent_name_lv5 . "</strong></div>";
} else {
	echo "<div><strong>" . $acc_name . "</strong></div>";
}

?>
<table width="100%" class="table_report" border="0" cellspacing="1"
		cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
<?php
echo "<tr>";
foreach ( $thead as $value ) {
	echo "<th style='vertical-align:middle;' nowrap>" . $value . "</th>";
}
echo "</tr>";
?>
</thead>
<?= $tbody?>
</table>
</body>
</html>
