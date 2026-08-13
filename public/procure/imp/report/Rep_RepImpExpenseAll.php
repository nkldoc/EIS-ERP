<?php
include ("../api/List_RepImpExpenseAll.php");
include ("../../lib/export/exportUtil.php");

$export = new exportUtil ();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานนำเข้าข้อมูลค่าใช้จ่าย";

if ($_REQUEST ["type"] == "excel") {
	$export->headerExcel ( $caption );
}

$thead [] = "ลำดับที่";
$thead [] = "เงินรายได้";
$thead [] = "วันทีจ่ายเงิน";
$thead [] = "ปีงบประมาณ";
$thead [] = "เลขที่ฎีกา";
$thead [] = "บัญชีคุม LV4";
$thead [] = "บัญชีคุม LV5";
$thead [] = "ผังบัญชี";
$thead [] = "รายการ";
$thead [] = "จำนวนขอเบิก";
$thead [] = "เลขที่เช็ค";

$data_dtl = json_decode ( List_QueryParam (), true );

if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody = "<tbody>";
	
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style = "";
		
		// GEN TBODY
		if (@$jObj ["i_type"] == 1) {
			
			$tbody .= "<tr " . $style . ">
							<td align='center' nowrap>" . $jObj ["no"] . "</td>
							<td>" . $jObj ["dc_expense_budget_type_name"] . "</td>
							<td align='center' nowrap>" . $jObj ["d_pay"] . "</td>
							<td align='center' nowrap>" . $jObj ["c_budget_year"] . "</td>
							<td align='center'>" . $jObj ["c_approve"] . "</td>
							<td align='left'>" . $jObj ["c_acc_control_full"] . "</td>
							<td align='left'>" . $jObj ["c_acc_control_full_lv5"] . "</td>
							<td align='left'>" . $jObj ["c_acc_last_full"] . "</td>
							<td align='left'>" . $jObj ["c_acc_item"] . "</td>
							<td align='right' nowrap>" . number_format ( $jObj ["f_inv"], 2 ) . "</td>
							<td align='center'>" . $jObj ["c_cheque"] . "</td>
						</tr>";
		} else if (@$jObj ["i_type"] == 2) {
			
			$font = ($jObj ["i_acc_control_full_lv5"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#fddfb2; " . $font . "'";
			
			$tbody .= "	<tr " . $style . ">
							<td colspan='6'></td>
							<td align='right' nowrap><b>รวมบัญชีคุม LV5 :: " . $jObj ["c_acc_control_full_lv5"] . "</b></td>
							<td colspan='2'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_inv"], 2 ) . "</b></td>
							<td align='center'></td>
						</tr>";
		} else if (@$jObj ["i_type"] == 3) {
			
			$font = ($jObj ["i_acc_control_full"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#e0e0de; font-weight: bold; " . $font . "'";
			
			$tbody .= "	<tr " . $style . ">
							<td colspan=5></td>
							<td nowrap>รวมบัญชีคุม LV4 :: " . $jObj ["c_acc_control_full"] . "</td>
							<td colspan='3'></td>
							<td align='right'>" . number_format ( $jObj ["f_inv"], 2 ) . "</td>
							<td align='center'>" . $jObj ["c_cheque"] . "</td>
						</tr>";
		} else if (@$jObj ["i_type"] == 4) {
			
			$style = "style='background:#d2caa5; font-weight: bold;'";
			
			$tbody .= "	<tr " . $style . ">
							<td colspan=5></td>
							<td align='center' nowrap colspan=2>รวม " . $jObj ["d_pay"] . "</td>
							<td colspan=2></td>
							<td align='right'>" . number_format ( $jObj ["f_inv"], 2 ) . "</td>
							<td align='center'>" . $jObj ["c_cheque"] . "</td>
						</tr>";
			
			$tbody .= "	<tr style='background:#fff;'><td colspan=10>&nbsp;</td></tr>";
			
		} else if (@$jObj ["i_type"] == 5) {
			
			$font = ($jObj ["i_acc_control_full_lv5"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#dcd6d6; " . $font . "'";
			
			$tbody .= "	<tr " . $style . ">
							<td colspan='6'></td>
							<td align='right' nowrap><b>รวมทุกบัญชีคุม LV5 :: " . $jObj ["c_acc_control_full_lv5"] . "</b></td>
							<td colspan='2'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_inv"], 2 ) . "</b></td>
							<td align='center'></td>
						</tr>";
		} else if (@$jObj ["i_type"] == 6) {
			
			$font = ($jObj ["i_acc_control_full"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#dcd6d6; " . $font . "'";
			
			$tbody .= "	<tr " . $style . ">
							<td colspan='5'></td>
							<td align='right' nowrap><b>รวมทุกบัญชีคุม LV4 :: " . $jObj ["c_acc_control_full"] . "</b></td>
							<td colspan='3'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_inv"], 2 ) . "</b></td>
							<td align='center'></td>
						</tr>";
		} else if (@$jObj ["i_type"] == 7) {
			
			$style = "style='background:#b9b9b9; font-weight: bold;'";
			
			$tbody .= "	<tr " . $style . " height=20>
							<td colspan=7></td>
							<td align='right' nowrap colspan=2><span style='border-bottom: double 3px;'>รวมทั้งสิ้น</span></td>
							<td align='right'><span style='border-bottom: double 3px;'>" . number_format ( $jObj ["f_inv"], 2 ) . "</span></td>
							<td></td>
						</tr>";
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
echo "<tr height=30>";
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
