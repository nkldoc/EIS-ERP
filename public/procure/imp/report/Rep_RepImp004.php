<?php
include ("../api/report/RepImp004.php");
include ("../../lib/export/exportUtil.php");

$export = new exportUtil ();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายได้คณะแพทยศาสตร์วชิรพยาบาลฯ (บัญชี)";

if ($_REQUEST ["type"] == "excel") {
	$export->headerExcel ( $caption );
}

$thead = "";
$thead1 = "";
$thead2 = "";
$rowAll = 8;
// =================== gen Head =================== //

$thead .= "<tr height=20>
				<th style='vertical-align:middle;' nowrap>รายการ</th>
				<th style='vertical-align:middle;' nowrap>เงินรายได้คณะแพทย์ฯ-การศึกษา</th>
				<th style='vertical-align:middle;' nowrap>เงินรายได้คณะแพทย์ฯ-โรงพยาบาล</th>
				<th style='vertical-align:middle;' nowrap>เงินรายได้คณะแพทย์ฯ-โรงพยาบาล (ระบบ)</th>
				<th style='vertical-align:middle;' nowrap>สมุดรายวันเงินรับ</th>
				<th style='vertical-align:middle;' nowrap>สมุดรายวันเงินจ่าย</th>
				<th style='vertical-align:middle;' nowrap>รวม</th>
				<th style='vertical-align:middle;' nowrap>GX</th>
				<th style='vertical-align:middle;' nowrap>GL</th>
			</tr>";

// ================================================ //
function list_dtl ($data, $style){
	
	$str = "";
	$dc_expen_type1 = @$data ["dc_expen_type1"];
	$dc_expen_type2 = @$data ["dc_expen_type2"];
	$dc_expen_type3 = @$data ["dc_expen_type3"];
	$dc_expen_type4 = @$data ["dc_expen_type4"];
	$dc_expen_type5 = @$data ["dc_expen_type5"];
	$sum_gx = @$data ["sum_gx"]; $str_gx = "";
	$sum_gl = @$data ["sum_gl"]; $str_gl = "";
	
	$sum = $dc_expen_type1+$dc_expen_type2+$dc_expen_type3+$dc_expen_type4+$dc_expen_type5;
	
	if ($dc_expen_type1 != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $dc_expen_type1, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	if ($dc_expen_type2 != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $dc_expen_type2, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	if ($dc_expen_type3 != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $dc_expen_type3, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	if ($dc_expen_type4 != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $dc_expen_type4, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	if ($dc_expen_type5 != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $dc_expen_type5, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	if ($sum != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $sum, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	if ($sum_gx != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $sum_gx, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	if ($sum_gl != 0) {
		$str .= "<td " . $style . " nowrap align='right'>" . number_format ( $sum_gl, 2 ) . "</td>";
	} else {
		$str .= "<td " . $style . " align='center' nowrap>-</td>";
	}
	
	return $str;
}
$data_dtl = json_decode ( List_QueryParam (), true );

if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody = "<tbody>";
	$no = 0;
	
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style = "";
		$nbsp = "";
		
		// GEN TBODY
		if (@$jObj ["i_type"] == 1) {
			
			$style = "style='background:#D0DDDE;'";
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " nowrap><b>" . $jObj ["c_name_lv3"] . "</b></td>";
			for($ii = 1; $ii <= $rowAll; $ii ++) {
				$tbody .= "<td " . $style . "></td>";
			}
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 2) {
			
			$nbsp = "&nbsp;&nbsp;&nbsp;&nbsp;";
			$style = "style='background:#DEDEDE;'";
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " nowrap><b>" . $nbsp . $jObj ["c_name_lv4"] . "</b></td>";
			for($ii = 1; $ii <= $rowAll; $ii ++) {
				$tbody .= "<td " . $style . "></td>";
			}
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 3) {
			
			$nbsp = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			$style = "style='background:#F5E89F;'";
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " nowrap><b>" . $nbsp . $jObj ["c_name_lv5"] . "</b></td>";
			for($ii = 1; $ii <= $rowAll; $ii ++) {
				$tbody .= "<td " . $style . "></td>";
			}
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 4) {
			
			$nbsp = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			$style = "style='background:#fff;'";
			
			$dd = @$jObj ["data"];
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " nowrap>" . $nbsp . $jObj ["c_name_lv6"] . "</td>";
			$tbody .= list_dtl($dd, $style);
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 5) {
			
			$style = "style='background:#F3F3BE; font-weight: bold;'";
			$dd = @$jObj ["data"];
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " nowrap align=right><font color=red>lv5</font> รวม " . $jObj ["c_name_lv5"] . "</td>";
			$tbody .= list_dtl($dd, $style);
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 6) {
			
			$style = "style='background:#EDEDED; font-weight: bold;'";
			$dd = @$jObj ["data"];
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " nowrap align=right><font color=red>lv4</font> รวม " . $jObj ["c_name_lv4"] . "</td>";
			$tbody .= list_dtl($dd, $style);
			$tbody .= "</tr>";
			
		} else if (@$jObj ["i_type"] == 7) {
			
			$style = "style='background:#D0DDDE; font-weight: bold;'";
			$dd = @$jObj ["data"];
			
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " nowrap align=right><font color=red>lv3</font> รวม " . $jObj ["c_name_lv3"] . "</td>";
			$tbody .= list_dtl($dd, $style);
			$tbody .= "</tr><tr><td colspan='" . ($rowAll + 1) . "' style='background-color:#fff;'>&nbsp;</td></tr>";
			
		} else if (@$jObj ["i_type"] == 8) {
			
			$style = "style='background:#ffafc1; font-weight: bold;'";
			$dd = @$jObj ["data"];
			
			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " nowrap align=right>รวมทั้งสิ้น</td>";
			$tbody .= list_dtl($dd, $style);
			$tbody .= "</tr>";
		}
	}
	
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=" . ($rowAll + 1) . ">ไม่มีข้อมูล</td></tr></tbody>";
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


if($_REQUEST["i_show_acc"] == 1) { // บัญชีคุม Lv4
	
	// =======================================//
	$ss_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
	if (! in_array ( "0", $ss_id )) {
		$in = "";
		foreach ( $ss_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
	
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
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
		foreach ( $ss_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
	
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
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
		foreach ( $ss_id as $val ) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
	
		$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array () );
		if ($stmt) {
			$name = "";
			while ( $row = $db->Fetch ( $stmt ) ) {
				$name .= ($name == "") ? $row ["c_name"] : ", " . $row ["c_name"];
			}
		}
		$str_acc = "<div><strong>รายการบัญชีย่อย : <font color='blue'>" . $name . "</font></strong></div>";
	} else {
		$str_acc = "<div><strong>รายการบัญชีย่อย : <font color='blue'>ทั้งหมด</font></strong></div>";
	}
	// =======================================//
	
}

// =======================================//
$uu_id = explode ( ";", $_REQUEST ["dc_user_id"] );
if (! in_array ( "0", $uu_id )) {
	$in = "";
	foreach ( $uu_id as $val ) {
		$in .= ($in == "") ? $val : ", " . $val;
	}

	$stmt = $db->QueryParam ( "SELECT c_full_name FROM dc_user WHERE dc_user_id IN (" . $in . ")", array () );
	if ($stmt) {
		$name = "";
		while ( $row = $db->Fetch ( $stmt ) ) {
			$name .= ($name == "") ? $row ["c_full_name"] : ", " . $row ["c_full_name"];
		}
	}
	$str_user = "<div><strong>ผู้สร้างรายการ : <font color='blue'>" . $name . "</font></strong></div>";
} else {
	$str_user = "<div><strong>ผู้สร้างรายการ : <font color='blue'>ทั้งหมด</font></strong></div>";
}
// =======================================//

echo "<div align='center'><strong>" . $caption . "</strong></div>";
echo "<div align='center'><strong>ปีงบประมาณ " . ($_REQUEST ["year"] + 543) . "</strong></div>";
echo "<div><strong>ระหว่างวันที่ : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["date_start"] ) . "</font> ถึงวันที่ : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["date_end"] ) . "</font></strong></div>";
echo $str_acc;
echo $str_user;
?>
<table width="100%" class="table_report" border="0" cellspacing="1"
		cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
<?php echo $thead; ?>
		</thead>
<?php echo $tbody; ?>
</table>
</body>
</html>
