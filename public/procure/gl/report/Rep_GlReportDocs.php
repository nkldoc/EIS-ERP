<?php
include ("../api/List_GlReportDocs.php");
include ("../../lib/export/exportUtil.php");

$export = new exportUtil ();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานการเคลื่อนไหวบัญชีแยกประเภท";

$arr_show_report = array (
		"1" => "แสดงรายละเอียดทั้งหมด",
		"2" => "สรุปเฉพาะรายการที่มียอดคงเหลือ",
		"3" => "สรุปทุกรายการ",
		"4" => "แสดงเฉพาะรายละเอียดที่มียอดระหว่างงวด" 
);

if ($_REQUEST ["type"] == "excel") {
	$export->headerExcel ( $caption );
}

$thead [] = "ลำดับที่";
$thead [] = "เลขที่เอกสาร";
$thead [] = "วันที่เอกสาร";
$thead [] = "เลขที่อ้างอิง";
$thead [] = "เลขที่อ้างอิง(ผ่านรายการ)";
$thead [] = "วันที่บันทึกบัญชี";
$thead [] = "ที่";
$thead [] = "รายการ";
$thead [] = "รายการรายได้";
$thead [] = "ศูนย์ต้นทุน";
$thead [] = "เดบิต";
$thead [] = "เครดิต";
$thead [] = "ยอดคงเหลือ";
if ($_REQUEST ["i_show_year"] == 1) {
	$thead [] = "ปีงบประมาณ";
	$thead [] = "แหล่งเงิน";
}
$thead [] = "-";
$thead [] = "ผู้สร้างรายการ";
$thead [] = "ผู้สอบทาน";

if ($_REQUEST ["i_show"] == 1) { $thead [] = "รายการบวกกลับ"; }

$data_dtl = json_decode ( List_QueryParam (), true );

// ============================== CASE i_show_reports
SWITCH ($_REQUEST ["i_show_reports"]) {
	// ==============================1 แสดงรายละเอียดทั้งหมด ==============================
	case "1" :
	case "4" :
		if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
			
			$tbody = "<tbody>";
			$colspan = count ( $thead );
			
			foreach ( $data_dtl ["data"] as $index => $jObj ) { 

				
				$tbody .= "<tr>";
				
				if ($jObj ["i_type"] == 1) { // ยอดยกมา
					
					$style	= "background:#FFFFCC;";
					
					$tbody .= "<td style='{$style}' colspan='6'><b>" . $jObj ["c_name"] . "</b></td>";
					$tbody .= "<td style='{$style}' nowrap><b>ยอดยกมา</b></td>";
					$tbody .= "<td style='{$style}' colspan='5'><b></b></td>";
					$tbody .= "<td style='{$style}' align='right'><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
					if ($_REQUEST ["i_show_year"] == 1) {
						$tbody .= "<td style='{$style}'><b></b></td>";
						$tbody .= "<td style='{$style}'><b></b></td>";
					}
					$tbody .= "<td style='{$style}'><b></b></td>";
					$tbody .= "<td style='{$style}'><b></b></td>";
					if ($_REQUEST ["i_show"] == 1) {
						$tbody .= "<td style='{$style}'><b></b></td>";
					}
					$tbody .= "<td style='{$style}'><b></b></td>";
				} else if ($jObj ["i_type"] == 3) { // รวมรหัสบัญชี
					
					$style	= "background:#CCCCFF;";
					
					$tbody .= "<td align='right' colspan='10' style='{$style}'><b>" . $jObj ["c_name"] . "</b></td>";
					$tbody .= "<td style='{$style}' align='right'><b>" . number_format ( $jObj ["f_dr"], 2 ) . "</b></td>";
					$tbody .= "<td style='{$style}' align='right'><b>" . number_format ( $jObj ["f_cr"], 2 ) . "</b></td>";
					$tbody .= "<td style='{$style}' align='right'><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
					if ($_REQUEST ["i_show_year"] == 1) {
						$tbody .= "<td style='{$style}'><b></b></td>";
						$tbody .= "<td style='{$style}'><b></b></td>";
					}
					$tbody .= "<td style='{$style}'><b></b></td>";
					$tbody .= "<td style='{$style}'><b></b></td>";
					if ($_REQUEST ["i_show"] == 1) {
						$tbody .= "<td style='{$style}'><b></b></td>";
					}
					$tbody .= "<td style='{$style}'><b></b></td>"; 
				} else if ($jObj ["i_type"] == 5) { // รวมทั้งสิ้น
					
					$style	= "background:#669933;";
					
					$tbody .= "<td align='right' colspan='10' style='{$style}'><b>" . $jObj ["c_name"] . "</b></td>";
					$tbody .= "<td style='{$style}' align='right'><b>" . number_format ( $jObj ["f_dr"], 2 ) . "</b></td>";
					$tbody .= "<td style='{$style}' align='right'><b>" . number_format ( $jObj ["f_cr"], 2 ) . "</b></td>";
					$tbody .= "<td style='{$style}' align='right'><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
					if ($_REQUEST ["i_show_year"] == 1) {
						$tbody .= "<td style='{$style}'><b></b></td>";
						$tbody .= "<td style='{$style}'><b></b></td>";
					}
					$tbody .= "<td colspan='3' style='{$style}'><b></b></td>";
					if ($_REQUEST ["i_show"] == 1) {
						$tbody .= "<td style='{$style}'><b></b></td>";
					}
				} else {
						if ($jObj["i_cancel_doc_expense"]=='4')
						{ 
							$style_by_row = '';
						}
						else
						{
							$style_a	= " background:red;";  
							$style_by_row 	= "style={$style_a}";
						}

				
					$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["no"] . "</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["c_ref_doc"] . "</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["d_doc_date"] . "</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["c_code"] . "</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["c_code_post"] . "</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["d_save_date"] . "</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["i_rank"] . "</td>";
					$tbody .= "<td $style_by_row>" . $jObj ["c_name"] . "</td>";
					$tbody .= ($jObj ["dc_product_id"] > 0) ? "<td $style_by_row>" . $jObj ["product_name"] . "</td>" : "<td nowrap align='center' $style_by_row>-</td>";
					$tbody .= ($jObj ["dc_cost_acc_id"] > 0) ? "<td $style_by_row>" . $jObj ["cost_name"] . "</td>" : "<td nowrap align='center' $style_by_row>-</td>";
					$tbody .= "<td align='right' $style_by_row><b>" . number_format ( $jObj ["f_dr"], 2 ) . "</b></td>";
					$tbody .= "<td align='right' $style_by_row><b>" . number_format ( $jObj ["f_cr"], 2 ) . "</b></td>";
					$tbody .= "<td align='right' $style_by_row><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
					if ($_REQUEST ["i_show_year"] == 1) {
						$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["c_budget_year"] . "</td>";
						$tbody .= "<td align='center' nowrap $style_by_row>" . $jObj ["expense_name"] . "</td>";
					}
					$tbody .= "<td align='center' nowrap $style_by_row>".$jObj["c_cancel_doc_expense"]."</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>".$jObj["emp_name"]."</td>";
					$tbody .= "<td align='center' nowrap $style_by_row>".$jObj["post_name"]."</td>";
					if ($_REQUEST ["i_show"] == 1) {
						if ($jObj ["i_is_nontax_exp"] == 1) {
							$tbody .= "<td align='center' nowrap $style_by_row>บวกกลับ</td>";
						} else {
							$tbody .= "<td align='center' nowrap $style_by_row></td>";
						}
					}
				}
				$tbody .= "</tr>";
			}
			
			$tbody .= "</tbody>";
		} else {
			$tbody = "";
		}
		break;
	// ==============================2 สรุปเฉพาะรายการที่มียอดคงเหลือ ==============================
	case "2" :
		
		if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
			
			$str_headers = "<tbody>";
			$colspan = count ( $thead );
			$str_temp_tbody = "";
			$str_details = "";
			foreach ( $data_dtl ["data"] as $index => $jObj ) {
				
				if ((($jObj ["i_type"] == 1) || ($jObj ["i_type"] == 3) || ($jObj ["i_type"] == 5))) {
					
					$str_details .= "<tr>";
					
					if ($jObj ["i_type"] == 1) {
						$str_details .= "<td style=\"background:#FFFFCC;\" colspan='6'><b>" . $jObj ["c_name"] . "</b></td>";
						$str_details .= "<td style=\"background:#FFFFCC;\" nowrap><b>ยอดยกมา</b></td>";
						$str_details .= "<td style=\"background:#FFFFCC;\" colspan=\"5\"><b></b></td>";
						$str_details .= "<td style=\"background:#FFFFCC;\" align=\"right\"><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
						$str_details .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						$str_details .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						if ($_REQUEST ["i_show"] == 1) {
							$str_details .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						}
						$str_details .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						$str_details .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						$str_details .= "<td style=\"background:#FFFFCC;\"><b></b></td>";						
					} else if ($jObj ["i_type"] == 3) {
						$str_details .= "<td align=\"right\" colspan='10' style=\"background:#CCCCFF;\"><b>" . $jObj ["c_name"] . "</b></td>";
						$str_details .= "<td style=\"background:#CCCCFF;\" align=\"right\"><b>" . number_format ( $jObj ["f_dr"], 2 ) . "</b></td>";
						$str_details .= "<td style=\"background:#CCCCFF;\" align=\"right\"><b>" . number_format ( $jObj ["f_cr"], 2 ) . "</b></td>";
						$str_details .= "<td style=\"background:#CCCCFF;\" align=\"right\"><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
						$str_details .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						$str_details .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						if ($_REQUEST ["i_show"] == 1) {
							$str_details .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						}
						$str_details .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						$str_details .= "<td style=\"background:#CCCCFF;\"><b></b></td>";		
						$str_details .= "<td style=\"background:#CCCCFF;\"><b></b></td>";						
					} else if ($jObj ["i_type"] == 5) {
						$str_details .= "<td align=\"right\" colspan='10' style=\"background:#669933;\"><b>" . $jObj ["c_name"] . "</b></td>";
						$str_details .= "<td style=\"background:#669933;\" align=\"right\"><b>" . number_format ( $jObj ["f_dr"], 2 ) . "</b></td>";
						$str_details .= "<td style=\"background:#669933;\" align=\"right\"><b>" . number_format ( $jObj ["f_cr"], 2 ) . "</b></td>";
						$str_details .= "<td style=\"background:#669933;\" align=\"right\"><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
						$str_details .= "<td style=\"background:#669933;\"><b></b></td>";
						$str_details .= "<td style=\"background:#669933;\"><b></b></td>";
						if ($_REQUEST ["i_show"] == 1) {
							$str_details .= "<td style=\"background:#669933;\"><b></b></td>";
						}
						$str_details .= "<td style=\"background:#669933;\"><b></b></td>";
						$str_details .= "<td style=\"background:#669933;\"><b></b></td>";
						$str_details .= "<td style=\"background:#669933;\"><b></b></td>"; 
					}
					
					$str_details .= "</tr>";
					
					if (($jObj ["i_type"] == 3) && ($jObj ["f_balance"] == 0)) {
						$str_temp_tbody .= "";
						$str_details = "";
					} else if (($jObj ["i_type"] == 3) && ($jObj ["f_balance"] != 0)) {
						$str_temp_tbody .= $str_details;
						$str_details = "";
					} else if ($jObj ["i_type"] == 5) {
						$str_temp_tbody .= $str_details;
						$str_details = "";
					}
				}
			}
			
			$str_headers .= $str_temp_tbody . "</tbody>";
			
			$tbody = $str_headers;
		} else {
			$tbody = "";
		}
		break;
	// ==============================3 สรุปทุกรายการ ==============================
	case "3" :
		
		if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
			
			$tbody = "<tbody>";
			$colspan = count ( $thead );
			
			foreach ( $data_dtl ["data"] as $index => $jObj ) {
				
				if (($jObj ["i_type"] == 1) || ($jObj ["i_type"] == 3) || ($jObj ["i_type"] == 5)) {
					$tbody .= "<tr>";
					
					if ($jObj ["i_type"] == 1) {
						
						$tbody .= "<td style=\"background:#FFFFCC;\" colspan='6'><b>" . $jObj ["c_name"] . "</b></td>";
						$tbody .= "<td style=\"background:#FFFFCC;\" nowrap><b>ยอดยกมา</b></td>";
						$tbody .= "<td style=\"background:#FFFFCC;\" colspan=\"5\"><b></b></td>";
						$tbody .= "<td style=\"background:#FFFFCC;\" align=\"right\"><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
						$tbody .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						$tbody .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						if ($_REQUEST ["i_show"] == 1) {
							$tbody .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						}
						$tbody .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						$tbody .= "<td style=\"background:#FFFFCC;\"><b></b></td>";
						$tbody .= "<td style=\"background:#FFFFCC;\"><b></b></td>"; 					
					} else if ($jObj ["i_type"] == 3) {
						
						$tbody .= "<td align=\"right\" colspan='10' style=\"background:#CCCCFF;\"><b>" . $jObj ["c_name"] . "</b></td>";
						$tbody .= "<td style=\"background:#CCCCFF;\" align=\"right\"><b>" . number_format ( $jObj ["f_dr"], 2 ) . "</b></td>";
						$tbody .= "<td style=\"background:#CCCCFF;\" align=\"right\"><b>" . number_format ( $jObj ["f_cr"], 2 ) . "</b></td>";
						$tbody .= "<td style=\"background:#CCCCFF;\" align=\"right\"><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
						$tbody .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						$tbody .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						if ($_REQUEST ["i_show"] == 1) {
							$tbody .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						}
						$tbody .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						$tbody .= "<td style=\"background:#CCCCFF;\"><b></b></td>";
						$tbody .= "<td style=\"background:#CCCCFF;\"><b></b></td>"; 						
					} else if ($jObj ["i_type"] == 5) {
						
						$tbody .= "<td align=\"right\" colspan='10' style=\"background:#669933;\"><b>" . $jObj ["c_name"] . "</b></td>";
						$tbody .= "<td style=\"background:#669933;\" align=\"right\"><b>" . number_format ( $jObj ["f_dr"], 2 ) . "</b></td>";
						$tbody .= "<td style=\"background:#669933;\" align=\"right\"><b>" . number_format ( $jObj ["f_cr"], 2 ) . "</b></td>";
						$tbody .= "<td style=\"background:#669933;\" align=\"right\"><b>" . number_format ( $jObj ["f_balance"], 2 ) . "</b></td>";
						$tbody .= "<td style=\"background:#669933;\"><b></b></td>";
						$tbody .= "<td style=\"background:#669933;\"><b></b></td>";
						if ($_REQUEST ["i_show"] == 1) {
							$tbody .= "<td style=\"background:#669933;\"><b></b></td>";
						}
						$tbody .= "<td style=\"background:#669933;\"><b></b></td>";
						$tbody .= "<td style=\"background:#669933;\"><b></b></td>";
						$tbody .= "<td style=\"background:#669933;\"><b></b></td>"; 					
					}
					
					$tbody .= "</tr>";
				}
			}
			
			$tbody .= "</tbody>";
		} else {
			$tbody = "";
		}
		break;
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
	echo "<div align=\"center\"><strong>" . $title . "</strong></div>";
	
if($_REQUEST["i_show_acc"] == 1) { // บัญชีคุม
	$cc_id	= explode(";", $_REQUEST["dc_acc_id_parent"]);
	if( !in_array("0", $cc_id ) ) {
		$arr_id	= "";
		if (is_array($cc_id)) {
			foreach( $cc_id as $val ) { $arr_id	.= ( $arr_id == "" )? $val : ", ".$val; }
			if ($arr_id != "") {
				$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (".$arr_id.")", array () );
				if ($stmt) {
					$name_acc	= "";
					while ( $row = $db->Fetch ( $stmt ) ) {
						$name_acc .= ($name_acc == "") ? $row ["c_name"] : ", " . $row ["c_name"];
					}
					$txt_acc = "รายการบัญชีคุม : <font color='blue'>".$name_acc."</font>";
				}
			}
		}
	} else { $txt_acc = "รายการบัญชีคุม : <font color='blue'>ทั้งหมด</font>"; }
} else if($_REQUEST["i_show_acc"] == 2) { // บัญชีย่อย
	$cc_id	= explode(";", $_REQUEST["dc_acc_id"]);
	if( !in_array("0", $cc_id ) ) {
		$arr_id	= "";
		if (is_array($cc_id)) {
			foreach( $cc_id as $val ) { $arr_id .= ( $arr_id == "" )? $val : ", ".$val; }
			if($arr_id != "") {
				$stmt = $db->QueryParam ( "SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $arr_id . ")", array () );
				if ($stmt) {
					$name_acc	= "";
					while ( $row = $db->Fetch ( $stmt ) ) {
						$name_acc .= ($name_acc == "") ? $row ["c_name"] : ", " . $row ["c_name"];
					}
					$txt_acc = "รายการบัญชีย่อย : <font color='blue'>".$name_acc."</font>";
				}
			}
		}
	} else { $txt_acc = "รายการบัญชีย่อย : <font color='blue'>ทั้งหมด</font>"; }
}
// =======================================//
$dc_cost_id = explode ( ";", $_REQUEST ["dc_cost_id"] );
if (! in_array ( "0", $dc_cost_id )) {
	$in_cost = "";
	foreach ( $dc_cost_id as $val ) {
		$in_cost .= ($in_cost == "") ? $val : ", " . $val;
	}
	
	$stmt = $db->QueryParam ( "SELECT c_name FROM dc_cost WHERE dc_cost_id IN (" . $in_cost . ")", array () );
	if ($stmt) {
		$name_cost = "";
		while ( $row = $db->Fetch ( $stmt ) ) {
			$name_cost .= ($name_cost == "") ? $row ["c_name"] : ", " . $row ["c_name"];
		}
	}
	$estimate_name = "หน่วยงาน : <font color='blue'>" . $name_cost . "</font>";
} else {
	$estimate_name = "ส่วนงาน : <font color='blue'>" . CUSTOMER_ALL_COST_NAME . "</font>";
}
// =======================================//
$i_post_name = "";
switch ($_REQUEST ["i_is_post"]) {
	case "2" :
		$i_post_name = 'ยังไม่ผ่านรายการ (GX)';
		break;
	case "3" :
		$i_post_name = 'ผ่านรายการแล้ว(GL)';
		break;
	case "1" :
	default :
		$i_post_name = 'ทั้งหมด (GX/GL)';
		break;
}
echo "<div align=\"center\"><strong>" . $caption . "</strong></div>";
echo "<div><strong>วันที่บันทึกบัญชี : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["date_start"] ) . "</font> ถึงวันที่ : <font color='blue'>" . $date->extDateBuddha ( $_REQUEST ["date_end"] ) . "</font></strong></div>";
echo "<div><strong>" . $txt_acc . "</strong></div>";
echo "<div><strong>" . $estimate_name . "</strong></div>";
echo "<div><strong>ประเภทการแสดงข้อมูล : <font color='blue'>" . $arr_show_report[$_REQUEST["i_show_reports"]] . "</font></strong></div>";
echo "<div><strong>สถานะการผ่านรายการบัญชี : <font color='blue'>" . $i_post_name . "</font></strong></div>";
?>
<table width="100%" class="table_report" border="0" cellspacing="1"
		cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
<?php
echo "<tr>";
foreach ( $thead as $value ) {
	echo "<th style='vertical-align:middle;'>" . $value . "</th>";
}
echo "</tr>";
?>
</thead>
<?= $tbody?>
</table>
</body>
</html>