<?php
include("../api/List_Rep_GlRepAll00022.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil(); 
$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานนำเข้าข้อมูลใบเบิก (E-Phis & Vision Net)";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}
$thead[] = "#";
$thead[] = "แหล่งเงิน";
$thead[] = "เลขที่เอกสารใบเบิก";
$thead[] = "เลขที่เอกสารตั้งหนี้";
$thead[] = "วันที่ใบเบิก/ตั้งหนี้";
$thead[] = "เงื่อนไขงบประมาณ";
$thead[] = "ปีงบประมาณ";
$thead[] = "วันที่ยกเลิกใบเบิก";
$thead[] = "สถานะการบันทึกบัญชี";
$thead[] = "ชื่อผู้รับเงิน";
$thead[] = "รหัสบัญชีคุม LV4 (DR)";	
$thead[] = "ชื่อบัญชีคุม LV4 (DR)";
$thead[] = "รหัสบัญชีคุม LV5 (DR)";	
$thead[] = "ชื่อบัญชีคุม LV5 (DR)";
$thead[] = "รหัสผังบัญชี (DR)";
$thead[] = "ชื่อผังบัญชี (DR)";
$thead[] = "รหัสผังบัญชี (CR)"; 
$thead[] = "ชื่อผังบัญชี (CR)"; 
$thead[] = "เลขที่ฎีกา";
$thead[] = "รายการ";
$thead[] = "จำนวนขอเบิกทั้งสิ้น";
$thead[] = "จำนวนภาษีมูลค่าเพิ่ม";
$thead[] = "ภาษีเงินได้บุคคลธรรมดา";
$thead[] = "ภาษีเงินได้นิติบุคคล";
$thead[] = "ค่าประกันสังคม";
$thead[] = "ค่าปรับ";
$thead[] = "ระบบ";

if (@$_REQUEST["i_show_IRCEnV"]=="1")
	$thead[] = "เลขที่นำเข้าใบเบิก";
if (@$_REQUEST["i_show_gx"]=="1")
	$thead[] = "เลขที่บันทึกบัญชีตั้งหนี้";


$data_dtl = json_decode ( List_QueryParam (), true );

if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody = "<tbody>";
	$no=0;
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style = "";
		
		// GEN TBODY
		if (@$jObj ["i_type"] == 1) {
			$no++;

			$tbody .= "<tr " . $style . ">
							<td align='center' nowrap>" . $no. "</td>
							<td nowrap>" . $jObj ["dc_expense_budget_type_name"] . "</td>
							<td align='center' nowrap>" . $jObj["c_request"] . "</td>
							<td align='center' nowrap>" . $jObj["c_request_desc"] . "</td>
							<td align='center' nowrap>" . $jObj ["d_doc"] . "</td>
							<td align='center' nowrap>" . $jObj["c_type_year"] . "</td>
							<td align='center' nowrap>" . $jObj ["c_budget_year"] . "</td>
							<td align='center' nowrap>" . $jObj ["d_cancel"] . "</td>
							<td align='center' nowrap nowrap>" . $jObj["c_cal_gl"] . "</td>
							<td nowrap>" . $jObj["c_creditor"] . "</td>  
							<td align='left' nowrap>" . $jObj ["c_acc_code_lv4_dr"] . "</td>
							<td align='left' nowrap>" . $jObj ["c_acc_name_lv4_dr"] . "</td> 
							<td align='left' nowrap>" . $jObj ["c_acc_code_lv5_dr"] . "</td>
							<td align='left' nowrap>" . $jObj ["c_acc_name_lv5_dr"] . "</td> 							
							<td align='left' nowrap>" . $jObj ["c_acc_code_dr_last"] . "</td> 
							<td align='left' nowrap>" . $jObj ["c_acc_name_dr_last"] . "</td>
							<td align='left' nowrap>" . $jObj ["c_acc_code_cr_last"] . "</td> 
							<td align='left' nowrap>" . $jObj ["c_acc_name_cr_last"] . "</td> 
							<td align='center' nowrap>" . $jObj ["c_approve"] . "</td>
							<td nowrap>" . $jObj ["c_acc_item"] . "</td>
							<td align='right' nowrap>" . number_format ( $jObj ["f_inv"], 2 ) . "</td>
							<td align='right' nowrap>" . number_format ( $jObj ["f_vat"], 2 ) . "</td>
							<td align='right' nowrap>" . number_format ( $jObj ["f_tax_personal"], 2 ) . "</td>
							<td align='right' nowrap>" . number_format ( $jObj ["f_tax_corporate"], 2 ) . "</td>
							<td align='right' nowrap>" . number_format ( $jObj ["f_social_security"], 2 ) . "</td>
							<td align='right' nowrap>" . number_format ( $jObj ["f_fine"], 2 ) . "</td>
							<td align='center' nowrap>" . $jObj["c_system_name"] . "</td>";
			if (@$_REQUEST["i_show_IRCEnV"]=="1")
				$tbody .= "<td align='center' nowrap>" . $jObj ["c_ircev_code"] . "</td>";
			if (@$_REQUEST["i_show_gx"]=="1")
				$tbody .= "<td align='center' nowrap>" . $jObj ["c_jv_code"] . "</td>";
			$tbody .="		</tr>";
		} 
		else if (@$jObj ["i_type"] == 2) {
			
			$font = ($jObj ["i_acc_control_full_lv5"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#fddfb2; " . $font . "'";
			$empty_box = 6;

			if (@$_REQUEST["i_show_IRCEnV"]=="1") 
				$empty_box++;
			if (@$_REQUEST["i_show_gx"]=="1")
				$empty_box++;		
			
			$tbody .= "	<tr " . $style . ">
							<td colspan='9'></td>
							<td align='right' nowrap><b>รวมบัญชีคุม LV5 :: " . $jObj ["c_acc_dr_lv5_full"] . "</b></td>
							<td colspan='10'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_inv"], 2 ) . "</b></td>
							<td colspan=$empty_box></td>
						</tr>";
		} 
		else if (@$jObj ["i_type"] == 3) {
			
			$font = ($jObj ["i_acc_control_full"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#e0e0de; font-weight: bold; " . $font . "'";
			$empty_box = 6;
			
			if (@$_REQUEST["i_show_IRCEnV"]=="1") 
				$empty_box++;
			if (@$_REQUEST["i_show_gx"]=="1")
				$empty_box++;	
			$no=0;
			$tbody .= "	<tr " . $style . ">
							<td colspan=8></td>
							<td nowrap>รวมบัญชีคุม LV4 :: " . $jObj ["c_acc_dr_lv4_full"] . "</td>
							<td colspan='11'></td>
							<td align='right'>" . number_format ( $jObj ["f_inv"], 2 ) . "</td> 
							<td colspan=$empty_box></td>
						</tr>";
		} 
		else if (@$jObj ["i_type"] == 4) {
			
			$style = "style='background:#d2caa5; font-weight: bold;'";
			$empty_box = 6;
			
			if (@$_REQUEST["i_show_IRCEnV"]=="1") 
				$empty_box++;
			if (@$_REQUEST["i_show_gx"]=="1")
				$empty_box++;

			$tbody .= "	<tr " . $style . ">
							<td colspan=6></td>
							<td align='center' nowrap colspan=2>รวม " . $jObj ["d_doc"] . "</td>
							<td colspan=12></td>
							<td align='right'>" . number_format ( $jObj ["f_inv"], 2 ) . "</td> 
							<td colspan=$empty_box></td>
						</tr>";
			
			$tbody .= "	<tr style='background:#fff;'><td colspan=10>&nbsp;</td></tr>";
			
		} 
		else if (@$jObj ["i_type"] == 5) {
			
			$font = ($jObj ["i_acc_control_full_lv5"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#FFCCFF; " . $font . "'";
			$empty_box = 6;
			
			if (@$_REQUEST["i_show_IRCEnV"]=="1") 
				$empty_box++;
			if (@$_REQUEST["i_show_gx"]=="1")
				$empty_box++;

			$tbody .= "	<tr " . $style . ">
							<td colspan='6'></td>
							<td align='right' nowrap><b>รวมทุกบัญชีคุม LV5 :: " . $jObj ["c_acc_dr_lv5_full"] . "</b></td>
							<td colspan='13'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_inv"], 2 ) . "</b></td>
							<td colspan=$empty_box></td>
						</tr>";
		} 
		else if (@$jObj ["i_type"] == 6) {
			
			$font = ($jObj ["i_acc_control_full"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#FFFF99; " . $font . "'";
			$empty_box = 6;
			
			if (@$_REQUEST["i_show_IRCEnV"]=="1") 
				$empty_box++;
			if (@$_REQUEST["i_show_gx"]=="1")
				$empty_box++;

			$tbody .= "	<tr " . $style . ">
							<td colspan='5'></td>
							<td align='right' nowrap><b>รวมทุกบัญชีคุม LV4 :: " . $jObj ["c_acc_dr_lv4_full"] . "</b></td>
							<td colspan='14'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_inv"], 2 ) . "</b></td>
							<td colspan=$empty_box></td>
						</tr>";
		} 
		else if (@$jObj ["i_type"] == 7) {
			
			$style 		= "style='background:#99CC00; font-weight: bold;'";
			$empty_box 	= 6;
			
			if (@$_REQUEST["i_show_IRCEnV"]=="1") 
				$empty_box++;
			if (@$_REQUEST["i_show_gx"]=="1")
				$empty_box++;

			$tbody .= "	<tr " . $style . " height=20>
							<td colspan=18></td>
							<td align='right' nowrap colspan=2><span style='border-bottom: double 3px;'>รวมทั้งสิ้น</span></td>
							<td align='right'><span style='border-bottom: double 3px;'>" . number_format ( $jObj ["f_inv"], 2 ) . "</span></td>
							<td colspan=$empty_box'></td>
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


/*
$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";
	$no = 0;
	//print_r($data_dtl["data"]);exit;
	foreach ($data_dtl["data"] as $index => $jObj) {

		$style = "";

		// GEN TBODY
		if (@$jObj["i_type"] == 1) {

			// $style = "style='background:#E2E8E9;'";

			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " align='center'>" . (++$no) . "</td>";
			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["dc_expense_budget_type_name"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_request"] . "</td>"; 
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["d_doc"] . "</td>"; 
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_type_year"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_budget_year"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["d_cancel"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_cal_gl"] . "</td>"; 
			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["c_creditor"] . "</td>";

			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["c_acc_name_lv4_dr"] . "</td>";
			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["c_acc_name_lv5_dr"] . "</td>";
			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["acc_name"] . "</td>";
			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["acc_name_cr"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_approve"] . "</td>"; 
			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["c_acc_item"] . "</td>";
			 
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_inv"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_vat"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_tax_personal"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_tax_corporate"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_social_security"], 2) . "</td>";
 			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_fine"], 2) . "</td>";
 			$tbody .= "</tr>";
		} 
		else if (@$jObj["i_type"] == 2) {

			$style = "style='background:#E0E0DE;'";

			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='11' align='right'><b>รวมบัญชีคุม LV4 : " . $jObj["c_acc_name_lv4_dr"] . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_inv"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_vat"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_personal"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_corporate"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_social_security"], 2) . "</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_fine"], 2) . "</b></td>"; 
			$tbody .= "<td " . $style . " align='right'></td>";
			$tbody .= "</tr>";
		} 
		else if (@$jObj["i_type"] == 3) {

			$style = "style='background:#C6D2D1;'";

			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='11' align='right'><b>รวมทั้งสิ้น</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_inv"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_vat"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_personal"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_corporate"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_social_security"], 2) . "</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_fine"], 2) . "</b></td>"; 
			$tbody .= "<td " . $style . " align='center'></td>";

			$tbody .= "</tr>";
		} 
		else if (@$jObj["i_type"] == 4) {

			$style = "style='background:#fdd08b;'";

			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='11' align='right'><b>รวมบัญชีคุม LV5 : " . $jObj["c_acc_name_lv5_dr"] . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_inv"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_vat"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_personal"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_corporate"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_social_security"], 2) . "</b></td>"; 
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_fine"], 2) . "</b></td>"; 
			$tbody .= "<td " . $style . " align='center'></td>";

			$tbody .= "</tr>";
		}
	}

	$tbody .= "</tbody>";
} else {
	$conspan = 0;
	foreach ($thead as $ss) {
		++$conspan;
	}
	$tbody = "<tbody><tr><td align='center' colspan=" . $conspan . ">ไม่มีข้อมูล</td></tr></tbody>";
}

*/


?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>

<body>
	<?php
	if ($s_title == true)
		echo "<div align='center'><strong>" . $title . "</strong></div>";

	$for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		foreach ($for_id as $val) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		$stmt = $db->QueryParam("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id IN (" . $in . ")", array());

		if ($stmt) {
			$name = "";
			while ($row = $db->Fetch($stmt)) {
				$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
			}
		}
		$budget_name = "แหล่งเงิน : <font color='blue'>" . $name . "</font>";
	} else {
		$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
	}

	// if ($_REQUEST["dc_expense_id"] > 0) {
	// 	$dc_expense_name = $db->GetDataBySQL("SELECT c_name FROM dc_expense WHERE dc_expense_id=?;", array(
	// 		$_REQUEST["dc_expense_id"]
	// 	));
	// } else {
	// 	$dc_expense_name = "เลือกทั้งหมด";
	// }

	// =======================================//
	if ($_REQUEST["i_show_acc"] == 1) {
		$for_id = explode(";", $_REQUEST["dc_acc_id_parent"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam("SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array());

			if ($stmt) {
				$name = "";
				while ($row = $db->Fetch($stmt)) {
					$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
				}
			}
			$parent_name = "รายการบัญชีคุม Lv4 : <font color='blue'>" . $name . "</font>";
		} else {
			$parent_name = "รายการบัญชีคุม Lv4 : <font color='blue'>เลือกทั้งหมด</font>";
		}
	} else if ($_REQUEST["i_show_acc"] == 3) {
		$for_id = explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam("SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array());

			if ($stmt) {
				$name = "";
				while ($row = $db->Fetch($stmt)) {
					$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
				}
			}
			$parent_name_lv5 = "รายการบัญชีคุม Lv5 : <font color='blue'>" . $name . "</font>";
		} else {
			$parent_name_lv5 = "รายการบัญชีคุม Lv5 : <font color='blue'>เลือกทั้งหมด</font>";
		}
	} else {
		$for_id = explode(";", $_REQUEST["dc_acc_id"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam("SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array());

			if ($stmt) {
				$name = "";
				while ($row = $db->Fetch($stmt)) {
					$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
				}
			}
			$acc_name = "รายการบัญชีย่อย : <font color='blue'>" . $name . "</font>";
		} else {
			$acc_name = "รายการบัญชีย่อย : <font color='blue'>เลือกทั้งหมด</font>";
		}
	}
	// =======================================//

	echo "<div align='center'><strong>" . $caption . "</strong></div>";
	echo "<div><strong>วันที่นำเข้า : <font color='blue'>" . $date->extDateBuddha($_REQUEST["d_date_start"]) . "</font> ถึงวันที่ : <font color='blue'>" . $date->extDateBuddha($_REQUEST["d_date_end"]) . "</font></strong></div>";
	echo "<div><strong>" . $budget_name . "</strong></div>";
	// echo "<div><strong>รายจ่ายย่อย : <font color='blue'>" . $dc_expense_name . "</font></strong></div>";

	if ($_REQUEST["i_show_acc"] == 1) {
		echo "<div><strong>" . $parent_name . "</strong></div>";
	} else if ($_REQUEST["i_show_acc"] == 3) {
		echo "<div><strong>" . $parent_name_lv5 . "</strong></div>";
	} else {
		echo "<div><strong>" . $acc_name . "</strong></div>";
	}

	?>
	<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
			<?php
			echo "<tr>";
			foreach ($thead as $value) {
				echo "<th style='vertical-align:middle;' nowrap>" . $value . "</th>";
			}
			echo "</tr>";
			?>
		</thead>
		<?= $tbody ?>
	</table>
</body>

</html>