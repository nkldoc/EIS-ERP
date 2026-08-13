<?php
include("../api/List_RepImp006.php");
include("../../lib/export/exportUtil.php");

$export 	= new exportUtil(); 
$s_title 	= true;
$title 		= CUSTOMER_NAME_TH; 
$caption 	=  "รายงานนำเข้าใบเบิกแบบพิเศษ Vision Net (ตั้งหนี้แล้วนอกระบบ)";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}
$thead[] = "#";
$thead[] = "แหล่งเงิน";
$thead[] = "เลขที่เอกสารใบเบิกพิเศษ";
$thead[] = "เลขที่เอกสารตั้งหนี้พิเศษ";
$thead[] = "วันที่นำเข้าใบเบิกพิเศษ"; 

// $thead[] = "เงื่อนไขงบประมาณ";
// $thead[] = "ปีงบประมาณ"; 
// $thead[] = "สถานะการบันทึกบัญชี";

$thead[] = "ชื่อผู้รับเงิน";
$thead[] = "รหัสบัญชีคุม LV4 (DR)";	
$thead[] = "ชื่อบัญชีคุม LV4 (DR)";
$thead[] = "รหัสบัญชีคุม LV5 (DR)";	
$thead[] = "ชื่อบัญชีคุม LV5 (DR)";
$thead[] = "รหัสผังบัญชี (DR)";
$thead[] = "ชื่อผังบัญชี (DR)";
$thead[] = "รหัสผังบัญชี (CR)"; 
$thead[] = "ชื่อผังบัญชี (CR)";  
$thead[] = "รายการ";
$thead[] = "จำนวนเงินเดบิต"; 
$thead[] = "จำนวนเงินเครดิต"; 

if (@$_REQUEST["i_show_IRCEnV"]=="1")
	$thead[] = "เลขที่นำเข้าใบเบิกพิเศษ";


$data_dtl = json_decode ( List_QueryParam (), true );

if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody 	= "<tbody>";
	$i_no	= 0;
	$c_group_all_dr_lv5 = $c_group_all_cr_lv5 = $c_group_all_dr_lv4 = $c_group_all_cr_lv4 = $money_all_lv5_dr = $money_all_lv5_cr = $money_all_lv4_dr  = $money_all_lv4_cr  = 0;
	$c_group_all5_text 	= $c_group_all4_text = $txt_all_lv5 = $txt_all_lv4 = "";
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style  	= "";
		$empty_box 	= 0;
		 
		if (@$_REQUEST["i_show_IRCEnV"]=="1") 
			$empty_box++; 
		$str_empty_box = ($empty_box>0) ? "<td colspan=$empty_box></td>": "";

		// GEN TBODY
		if (@$jObj ["i_type"] == 1) 
		{
			$i_no++;

			if (@$jObj ["i_type_show_item"]=="0")
			{// ใบเบิก/ตั้งหนี้
					$tbody .= "<tr " . $style . ">
									<td align='center' nowrap>" . $i_no . "</td>
									<td nowrap>" . $jObj ["dc_expense_budget_type_name"] . "</td>
									<td align='center' nowrap>" . $jObj["c_request_desc"] . "</td>
									<td align='center' nowrap>" . $jObj["c_request"] . "</td> 
									<td align='center' nowrap>" . $jObj ["d_doc"] . "</td> 
									<td nowrap>" . $jObj["c_creditor"] . "</td>  
									<td align='center' nowrap></td>
									<td align='center' nowrap></td>  
									<td align='center' nowrap></td>
									<td align='center' nowrap></td>  
									<td align='center' nowrap></td>
									<td align='center' nowrap></td>  
									<td align='center' nowrap></td>
									<td align='center' nowrap></td>    
									<td nowrap>" . $jObj ["c_acc_item"] . "</td>
									<td align='center' nowrap></td>
									<td align='center' nowrap></td> "   
									;
					if (@$_REQUEST["i_show_IRCEnV"]=="1")
						$tbody .= "<td align='center' nowrap>" . $jObj ["c_ircev_code"] . "</td>"; 
					$tbody .="		</tr>";
			}
			else if (@$jObj ["i_type_show_item"]=="1")
			{// ใบเบิก/ตั้งหนี้ - DR
				// <td align='center' nowrap>" . $jObj["c_type_year"] . "</td>
				// <td align='center' nowrap>" . $jObj ["c_budget_year"] . "</td> 
				// <td align='center' nowrap nowrap>" . $jObj["c_cal_gl"] . "</td>

					$tbody .= "<tr " . $style . ">
									<td align='center' nowrap></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td> 
									<td></td>
									<td align='left' nowrap>" . $jObj ["c_acc_code_lv4_dr"] . "</td>
									<td align='left' nowrap>" . $jObj ["c_acc_name_lv4_dr"] . "</td> 
									<td align='left' nowrap>" . $jObj ["c_acc_code_lv5_dr"] . "</td>
									<td align='left' nowrap>" . $jObj ["c_acc_name_lv5_dr"] . "</td> 							
									<td align='left' nowrap>" . $jObj ["c_acc_code_dr_last"] . "</td> 
									<td align='left' nowrap>" . $jObj ["c_acc_name_dr_last"] . "</td> 
									<td></td>
									<td></td>
									<td></td>
									<td align='right' nowrap>" . number_format ( $jObj ["f_dr_show"], 2 ) . "</td>
									<td></td>
									"   
									;
				if (@$_REQUEST["i_show_IRCEnV"]=="1")
					$tbody .= "<td align='center' nowrap>&nbsp;</td>"; 
				$tbody .="		</tr>";
			}
			else if (@$jObj ["i_type_show_item"]=="2")
			{// ใบเบิก/ตั้งหนี้ - CR
				// <td align='center' nowrap>" . $jObj["c_type_year"] . "</td>
				// <td align='center' nowrap>" . $jObj ["c_budget_year"] . "</td> 
				// <td align='center' nowrap nowrap>" . $jObj["c_cal_gl"] . "</td>				
				$tbody .= "<tr " . $style . ">
									<td align='center' nowrap></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td> 
									<td></td> 
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td></td>
									<td align='left' nowrap>" . $jObj ["c_acc_code_cr_last"] . "</td> 
									<td align='left' nowrap>" . $jObj ["c_acc_name_cr_last"] . "</td>  
									<td></td>
									<td></td>
									<td align='right' nowrap>" . number_format ( $jObj ["f_cr_show"], 2 ) . "</td> 
									"   
									;
				if (@$_REQUEST["i_show_IRCEnV"]=="1")
					$tbody .= "<td align='center' nowrap>&nbsp;</td>"; 
				$tbody .="		</tr>";
			}

		} 
		else if (@$jObj ["i_type"] == 2) {
			//รวมยอดเงิน DR&CR __LV 5  รายวัน ตามรหัสบัญชี
			$font 				= ($jObj ["i_acc_control_full_lv5"] == 1) ? "" : "color:red;";
			
			$style 				= "style='background:#fddfb2; " . $font . "'"; 
			$c_show_lv5_name	= (@$jObj ["i_type_show_item"]=="3") ? $jObj ["c_acc_dr_lv5_full"] : $jObj ["c_acc_cr_lv5_full"];
			
			$c_group_all_dr_lv5	+= $jObj["f_dr_show"];
			$c_group_all_cr_lv5	+= $jObj["f_cr_show"]; 
			$c_group_all5_text	= "รวมบัญชีคุม LV5  :::";


			$tbody .= "	<tr " . $style . ">
							<td colspan='14'></td>
							<td align='right' nowrap><b>รวมบัญชีคุม LV5 :: " .$c_show_lv5_name. "</b></td> 
							<td align='right'><b>" . number_format ( $jObj["f_dr_show"], 2 ) . "</b></td>
							<td align='right'><b>" . number_format ( $jObj["f_cr_show"], 2 ) . "</b></td> 
							".$str_empty_box."
						</tr>";
			
		} 
		else if (@$jObj ["i_type"] == 3) {
			//รวมยอดเงิน DR&CR __LV 4  รายวัน ตามรหัสบัญชี
			$font 				= ($jObj ["i_acc_control_full"] == 1) ? "" : "color:red;";
			
			$style 				= "style='background:#e0e0de; font-weight: bold; " . $font . "'"; 
			$c_show_lv4_name	= (@$jObj ["i_type_show_item"]=="5") ? $jObj ["c_acc_dr_lv4_full"] : $jObj ["c_acc_cr_lv4_full"];

			if ($c_group_all5_text!="")
			{ // รวมทุก LV5 ในวันเดียวกัน
				$tbody .= "	<tr style='background:#fddfb2; color:#993300;'>
								<td colspan='15' align='right'>".$c_group_all5_text."</td> 
								<td align='right'><b>" . number_format ( $c_group_all_dr_lv5, 2 ) . "</b></td>
								<td align='right'><b>" . number_format ( $c_group_all_cr_lv5, 2 ) . "</b></td> 
								".$str_empty_box."
							</tr>";				
				$c_group_all5_text = "";
				$c_group_all_dr_lv5 = $c_group_all_cr_lv5 = 0;
			}

			$c_group_all_dr_lv4	+= $jObj["f_dr_show"];
			$c_group_all_cr_lv4	+= $jObj["f_cr_show"]; 
			$c_group_all4_text	= "รวมบัญชีคุม LV4  :::"; 


			$tbody .= "	<tr " . $style . ">
							<td colspan=11></td>
							<td align='right' nowrap>รวมบัญชีคุม LV4 :: " . $c_show_lv4_name . "</td>
							<td colspan='3'></td>
							<td align='right'>" . number_format ( $jObj ["f_dr_show"], 2 ) . "</td> 
							<td align='right'>" . number_format ( $jObj ["f_cr_show"], 2 ) . "</td> 
							".$str_empty_box."
						</tr>";
		} 
		else if (@$jObj ["i_type"] == 4) {
			//รวมยอดเงิน DR&CR รายวัน
			$style = "style='background:#d2caa5; font-weight: bold;'";
			 
			if ($c_group_all4_text!="")
			{ // รวมทุก LV4 ในวันเดียวกัน
				$tbody .= "	<tr style='background:#e0e0de; font-weight: bold; color:#009900;'>
								<td align='right' colspan='15'>".$c_group_all4_text."</td> 
								<td align='right'><b>" . number_format ( $c_group_all_dr_lv4, 2 ) . "</b></td>
								<td align='right'><b>" . number_format ( $c_group_all_cr_lv4, 2 ) . "</b></td> 
								".$str_empty_box."
							</tr>";				
				$c_group_all4_text = "";
				$c_group_all_dr_lv4 = $c_group_all_cr_lv4 = 0;
			}			

			$tbody .= "	<tr " . $style . ">
							<td colspan=9></td>
							<td align='center' nowrap colspan=2>รวม " . $jObj ["d_doc"] . "</td>
							<td colspan=4></td>
							<td align='right'>" . number_format ( $jObj ["f_dr_show"], 2 ) . "</td> 
							<td align='right'>" . number_format ( $jObj ["f_cr_show"], 2 ) . "</td> 
							".$str_empty_box."
						</tr>";
			
			$tbody .= "	<tr style='background:#fff;'><td colspan=10>&nbsp;</td></tr>";
			$i_no = 0;
			
		} 
		else if (@$jObj ["i_type"] == 5) {
			//รวม  สรุปทุกวัน LV5

			//$font = ($jObj ["i_acc_control_full_lv5"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#FFCCFF;' "; 
			
			$c_summary_all_lv5 = (@$jObj ["i_type_show_item"]=="8") ? $jObj ["c_acc_dr_lv5_full"] : $jObj ["c_acc_cr_lv5_full"];
			
			$money_all_lv5_dr += $jObj ["f_dr_show"];
			$money_all_lv5_cr += $jObj ["f_cr_show"];
			$txt_all_lv5	  = "รวมทุกบัญชีคุม LV5 :::";

			$tbody .= "	<tr " . $style . ">
							<td colspan='6'></td>
							<td align='right' nowrap><b>รวมทุกบัญชีคุม LV5 :: " .$c_summary_all_lv5. "</b></td>
							<td colspan='8'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_dr_show"], 2 ) . "</b></td> 
							<td align='right'><b>" . number_format ( $jObj ["f_cr_show"], 2 ) . "</b></td> 
							".$str_empty_box."
						</tr>";
		} 
		else if (@$jObj ["i_type"] == 6) {
			
			//$font = ($jObj ["i_acc_control_full"] == 1) ? "" : "color:red;";
			
			$style = "style='background:#FFFF99; '"; 

			if ($txt_all_lv5!="")
			{
				$tbody .= "	<tr style='background:#FFCCFF;'>
								<td colspan='6'></td>
								<td align='right' nowrap><b>" .$txt_all_lv5. "</b></td>
								<td colspan='8'></td>
								<td align='right'><b>" . number_format ( $money_all_lv5_dr, 2 ) . "</b></td> 
								<td align='right'><b>" . number_format ( $money_all_lv5_cr, 2 ) . "</b></td> 
								".$str_empty_box."
							</tr>";
				$txt_all_lv5 = "";
				$money_all_lv5_dr = 0;
				$money_all_lv5_cr = 0;
			}

			$c_summary_all_lv4 = (@$jObj ["i_type_show_item"]=="10") ? $jObj ["c_acc_dr_lv4_full"] : $jObj ["c_acc_cr_lv4_full"];
			
			$money_all_lv4_dr += $jObj ["f_dr_show"];
			$money_all_lv4_cr += $jObj ["f_cr_show"];
			$txt_all_lv4	  = "รวมทุกบัญชีคุม LV4 :::";

			$tbody .= "	<tr " . $style . ">
							<td colspan='5'></td>
							<td align='right' nowrap><b>รวมทุกบัญชีคุม LV4 :: " . $c_summary_all_lv4 . "</b></td>
							<td colspan='9'></td>
							<td align='right'><b>" . number_format ( $jObj ["f_dr_show"], 2 ) . "</b></td>
							<td align='right'><b>" . number_format ( $jObj ["f_cr_show"], 2 ) . "</b></td>
							".$str_empty_box."
						</tr>";
		} 
		else if (@$jObj ["i_type"] == 7) {
			
			$style 		= "style='background:#99CC00; font-weight: bold;'";
		 

			if ($txt_all_lv4!="")
			{
				$tbody .= "	<tr style='background:#FFFF99;'>
								<td colspan='5'></td> 
								<td align='right' nowrap><b> " . $txt_all_lv4 . "</b></td> 
								<td colspan='9'></td>
								<td align='right'><b>" . number_format ( $money_all_lv4_dr, 2 ) . "</b></td>
								<td align='right'><b>" . number_format ( $money_all_lv4_cr, 2 ) . "</b></td>
								".$str_empty_box."
							</tr>";
			}

			$tbody .= "	<tr " . $style . " height=20>
							<td colspan=13></td>
							<td align='right' nowrap colspan=2><span style='border-bottom: double 3px;'>รวมทั้งสิ้น</span></td>
							<td align='right'><span style='border-bottom: double 3px;'>" . number_format ( $jObj ["f_dr_show"], 2 ) . "</span></td>
							<td align='right'><span style='border-bottom: double 3px;'>" . number_format ( $jObj ["f_cr_show"], 2 ) . "</span></td>
							".$str_empty_box."
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