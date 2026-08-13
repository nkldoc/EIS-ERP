<?php
include ("../api/List_GlRep00010.php");
include ("../../lib/export/exportUtil.php");

$export = new exportUtil ();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "ทะเบียนคุมค่าใช้จ่ายคณะแพทยศาสตร์วชิรพยาบาล (บัญชี)";

if ($_REQUEST ["type"] == "excel") { $export->headerExcel ( $caption ); }

$thead = "";
$thead1 = "";
$thead2 = "";
$rowAll = 0;

$data_dtl = json_decode ( List_QueryParam (), true );

// =================== gen Head =================== //
$wh	= "";
if($_REQUEST["i_show_acc"] == 1) { // บัญชีคุม Lv4
	
	// =======================================//
	$ss_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
	if (! in_array ( "0", $ss_id )) {
		$in = "";
		foreach ( $ss_id as $val ) { $in .= ($in == "") ? $val : ", " . $val; }
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$wh	= " AND a.dc_acc_lv4_id IN (".$in.")";
		$str_acc = "<div><strong>รายการบัญชีคุม Lv4 : <font color='blue'>" . $name . "</font></strong></div>";
	} else {
		$str_acc = "<div><strong>รายการบัญชีคุม Lv4 : <font color='blue'>ทั้งหมด</font></strong></div>";
	}
	// =======================================//
	
} else if($_REQUEST["i_show_acc"] == 3) { // บัญชีคุม Lv5
	
	// =======================================//
	$ss_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
	if (! in_array ( "0", $ss_id )) {
		$in = "";
		foreach ( $ss_id as $val ) { $in .= ($in == "") ? $val : ", " . $val; }
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$wh	= " AND a.dc_acc_lv5_id IN (".$in.")";
		$str_acc = "<div><strong>รายการบัญชีคุม Lv5 : <font color='blue'>" . $name . "</font></strong></div>";
	} else {
		$str_acc = "<div><strong>รายการบัญชีคุม Lv5 : <font color='blue'>ทั้งหมด</font></strong></div>";
	}
	// =======================================//
	
} else if($_REQUEST["i_show_acc"] == 2) { // บัญชีย่อย
	
	// =======================================//
	$ss_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
	if (! in_array ( "0", $ss_id )) {
		$in = "";
		foreach ( $ss_id as $val ) { $in .= ($in == "") ? $val : ", " . $val; }
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$wh	= " AND a.dc_acc_id IN (".$in.")";
		$str_acc = "<div><strong>รายการบัญชีย่อย : <font color='blue'>" . $name . "</font></strong></div>";
	} else {
		$str_acc = "<div><strong>รายการบัญชีย่อย : <font color='blue'>ทั้งหมด</font></strong></div>";
	}
	// =======================================//
}

$in	= "";
foreach ( $data_dtl["ArrH"] as $val ) { $in .= ($in == "") ? $val : ", " . $val; }
$wh	.= " AND a.dc_acc_lv4_id IN ({$in})";

$sql_head = "	SELECT DISTINCT a.dc_acc_lv4_id, a.c_code_lv4, a.c_name_lv4
				FROM vw_dc_acc_with_parent a
					INNER JOIN imp_fix_acc b ON a.dc_acc_id = b.dc_acc_id
				WHERE a.i_enable = ? AND a.i_delete = ? AND b.report_number = 1 {$wh} ORDER BY a.c_code_lv4;";
$stmt_h = $db->QueryParam ( $sql_head, array ( STATUS_ENABLE, DELETE_FALSE ) );

if ($stmt_h) {
	$thead1 .= "<th style='vertical-align:middle;' nowrap rowspan=2 width=88>วันที่</th>";
	$thead1 .= "<th style='vertical-align:middle;' nowrap rowspan=2 width=100>เลขที่ฎีกา</th>";
	$thead1 .= "<th style='vertical-align:middle;' nowrap rowspan=2>รายการ</th>";
	while ( $data_h = $db->Fetch ( $stmt_h ) ) {
		$ArrHeadID [$data_h ["dc_acc_lv4_id"]] = $data_h ["c_code_lv4"]." ".$data_h ["c_name_lv4"];
		
		$thead1 .= "<th style='vertical-align:middle;'>".$data_h ["c_code_lv4"]."</th>";
		$thead2 .= "<th style='vertical-align:middle;'>".$data_h ["c_name_lv4"]."</th>";
		$rowAll ++;
	}
	$thead1 .= "<th style='vertical-align:middle;' nowrap rowspan=2 width=100>ผลรวมทั้งหมด</th>";
	$thead1 .= "<th style='vertical-align:middle;' nowrap rowspan=2 width=100>รายละเอียดเช็ค</th>";
	$thead .= "<tr height=20>" . $thead1 . "</tr>";
	$thead .= "<tr height=20>" . $thead2 . "</tr>";
}
if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody = "<tbody>";
	
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style	= "";
		
		// GEN TBODY
		if (@$jObj ["i_type"] == 1) {
			$bg	= "";
			if($jObj["i_default"] == 1) {
				$bg	= "background-color: #b6f7ff;";
			} else if($jObj["i_default"] == 2) {
				$bg	= "background-color: #ff7a73;";
			}
			
			$color	= "";
			$style	.= "style='{$color} {$bg}'";
			$vv		= 0;
			
			$tbody .= "<tr>";
			$tbody .= "<td ".$style." align='center' nowrap>".$jObj["d_date"]."</td>";
			$tbody .= "<td ".$style." align='center'>".$jObj["c_approve"]."</td>";
			$tbody .= "<td ".$style."><span class='text-overflow' style='width: 300px;'>".$jObj["c_name"]."</span></td>";
			foreach ( $ArrHeadID as $dc_acc_lv4_id => $val ) {
				if(@$jObj ["data"][$dc_acc_lv4_id]) {
					$ob	= $jObj ["data"][$dc_acc_lv4_id];
					$tbody .= "<td ".$style." align='right'>".number_format($ob["f_inv"],2)."</td>";
					$vv += $ob["f_inv"];
				} else { $tbody .= "<td ".$style."></td>"; }
			}
			
			if ($vv > 0) { $tbody .= "<td ".$style." align='right'>".number_format($vv,2)."</td>"; }
			else { $tbody .= "<td ".$style." align='right'>(".number_format(abs($vv),2).")</td>"; }
			
			if($jObj["i_default"] == 0) { $tbody .= "<td ".$style." nowrap>".$jObj["c_cheque"]."</td>"; }
			else { $tbody .= "<td ".$style." nowrap></td>"; }
			$tbody .= "</tr>";
				
		} else if (@$jObj ["i_type"] == 2 || @$jObj ["i_type"] == 3 || @$jObj ["i_type"] == 5 || @$jObj ["i_type"] == 7
				) {
			$st = "";
			if($jObj["i_type"] == 2) {
				$cl		= "#fff385";
				$align	= "center";
				$st 	.= "border-bottom: 3px double;";
			} else if($jObj["i_type"] == 7) {
				$cl		= "#EAEAEA";
				$align	= "right";
				$st 	.= "border-bottom: 3px double;";
			} else {
				$cl		= "#EAEAEA";
				$align	= "right";
				$st 	.= "border-bottom: 1px solid;";
			}
			$bg	= " background-color: {$cl}; ";
			$style	.= "style='{$st}{$bg}'";
			$vv		= 0;
			
			if($jObj["i_type"] == 3 || $jObj["i_type"] == 5 ) { $st .= " border: 0px solid;"; }
			if($jObj["i_type"] == 3 || $jObj["i_type"] == 5 || $jObj["i_type"] == 7) { $bg = ""; }
			
			$tbody .= "<tr>";
			$tbody .= "<td style='{$st}{$bg}' align='{$align}' nowrap colspan=3><b>{$jObj["d_date"]}</b></td>";
			foreach ( $ArrHeadID as $dc_acc_lv4_id => $val ) {
				if(@$jObj ["data"][$dc_acc_lv4_id]) {
					$ob	= $jObj ["data"][$dc_acc_lv4_id];
					if($ob["f_inv"] > 0) {
						$tbody .= "<td {$style} align='right'><b>".number_format($ob["f_inv"],2)."</b></td>";
					} else {
						$tbody .= "<td {$style} align='right'><b>(".number_format(abs($ob["f_inv"]),2).")</b></td>";
					}
					$vv += $ob["f_inv"];
				} else { $tbody .= "<td {$style} align='right'><b>-</b></td>"; }
			}
			
			if ($vv > 0) { $tbody .= "<td {$style} align='right'><b>".number_format($vv,2)."</b></td>"; }
			else { $tbody .= "<td {$style} align='right'><b>(".number_format(abs($vv),2).")</b></td>"; }
			
			$tbody .= "<td ".$style."></td>";
			
			$tbody .= "</tr>";
		}
	}
	
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=" . ($rowAll + 6) . ">ไม่มีข้อมูล</td></tr></tbody>";
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

$arr_id = explode ( ";", $_REQUEST ["dc_expense_budget_type_id"] );
if (! in_array ( "0", $arr_id )) {
	$in = "";
	if (is_array ( $arr_id )) {
		foreach ( $arr_id as $val_parent ) {
			$in .= ($in == "") ? $val_parent : ", " . $val_parent;
		}
		$stmt = $db->QueryParam ( "SELECT c_name FROM vw_dc_expense_budget_type WHERE dc_expense_budget_type_id IN (" . $in . ")", array () );
		if ($stmt) {
			$txt_budget = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$txt_budget .= ($txt_budget == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
	}
} else { $txt_budget = "ทั้งหมด"; }

echo "<div align='center'><strong>" . $caption . "</strong></div>";
echo "<div align='center'><strong>ปีงบประมาณ " . ($_REQUEST ["year"] + 543) . "</strong></div>";
echo "<div><strong>แหล่งเงิน : <font color='blue'>" . $txt_budget . "</font></strong></div>";
echo "<div><strong>วันที่บันทึกบัญชี : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["date_start"] ) . "</font> ถึงวันที่ : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["date_end"] ) . "</font></strong></div>";
echo $str_acc;
?>
<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
<?php echo $thead; ?>
		</thead>
<?php echo $tbody; ?>
</table>
</body>
</html>