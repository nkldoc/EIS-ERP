<?php
include("../api/List_GlRep00017_dtl.php");
include ("../../lib/export/exportUtil.php");

$export = new exportUtil ();

$s_title = true;
$title = CUSTOMER_NAME_TH;

if($_REQUEST["PAGE"] == "GlRep00017") {
	$caption	= "งบแสดงผลการดำเนินงาน  (ปี)";	
} else if($_REQUEST["PAGE"] == "GlRep00018") {
	$caption	= "งบแสดงฐานะการเงิน (ปี)";
}

if ($_REQUEST ["type"] == "excel") { $export->headerExcel ( $caption ); }

$thead[]	= "ที่";
$thead[]	= "รหัสบัญชี";
$thead[]	= "ชื่อบัญชี"; 
$thead[]	= "รวม";
$c_add_final = "";
$data_dtl = json_decode ( List_QueryParam (), true );

if (is_array ( $data_dtl ) && count ( $data_dtl ["data"] ) > 0) {
	
	$tbody = "<tbody>";
	$c_add_final = ""; $f_money_final = 0;
	foreach ( $data_dtl ["data"] as $index => $jObj ) {
		
		$style = ""; $c_add_final = ""; $style_final = "";  
		
		// GEN TBODY
/* -------------------------------------- งบแสดงฐานะการเงิน (ปีงบประมาณ) --------------------------------------*/		
		if($_REQUEST["PAGE"] == "GlRep00018") 
		{ 
			if (@$jObj ["i_type"] == 1) {
				
				$style	= "style='background-color:#E9E9E9;'";
				
				$tbody .= "	<tr ".$style.">
								<td nowrap><b></b></td>
								<td nowrap colspan=3><b>".$jObj["c_name"]."</b></td> 
							</tr>";
			} else if (@$jObj ["i_type"]==8){
					$c_add_final = "";  
					$style			= "style='background-color:#EAEAEA;'";
					$style_final	= "style='background-color:#FFCCFF;'";
					
					/* สูตร สินทรัพย์สุทธิ = สินทรัพย์[SUM G1] - หนี้สิน[SUM G2] @ 6 ธค. 2561 */

					switch ($jObj["i_group"])
					{
						case 1 		:
						case "1"    :		
											$f_money_final = $f_money_final+$jObj["f_money"];
									break;
						case 2 		:
						case "2"    :		
											$f_money_final = $f_money_final-$jObj["f_money"];
											$c_add_final = "<tr ".$style_final.">
												<td nowrap><b></b></td>
												<td nowrap colspan=2><b>สินทรัพย์สุทธิ</b></td>
												<td nowrap align='right'><b>".number_format($f_money_final,2)."</b></td>
											</tr>";
										
									break;
						default 	: $f_money_final = $f_money_final+0;
									break;
					} 

				$tbody .= "<tr ".$style.">
								<td nowrap><b></b></td>
								<td nowrap colspan=2><b>".$jObj["c_name"]."</b></td>
								<td nowrap align='right'><b>".number_format($jObj["f_money"],2)."</b></td>
							</tr>"
							.$c_add_final
							."	<tr><td nowrap colspan=4></td></tr>"
							;				
					 
			} else if ( (@$jObj ["i_type"] == 2) || (@$jObj ["i_type"] == 3) || (@$jObj ["i_type"] == 4) || (@$jObj ["i_type"] == 5) || (@$jObj ["i_type"] == 6) ) {
				$dd			= "";
				$dd_empty 	= "&nbsp;&nbsp;";

				switch ($jObj["i_type"])
				{ 
					case "3" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break; 
					case "4" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break; 
					case "5" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break;  	
					case "6" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; 
									$cc1 = $cc2 ="";
							break;				
					case "2" 	:
					default 	: 	$dd = $dd_empty; break;  
							
				}
				
				$c_code_show	= "<span style=\"margin-left:10px;\">".$dd.$jObj["c_code"]."</span>";
				$tbody .= "	<tr ".$style.">
								<td nowrap align='center'>{$jObj["no"]}</td>
								<td nowrap nowrap>".$c_code_show."</td>
								<td nowrap nowrap>".$jObj["c_name"]."</td>
								<td nowrap align='right'>".number_format($jObj["f_money"],2)."</td> 
							</tr>";
			}
			else
			{ /*i_type9 ของรายงานนี้ไม่ต้องแสดงผล */
				$tbody .= "";
			}
		}
		else if($_REQUEST["PAGE"]=="GlRep00017") 
		{ 
/* -------------------------------------- งบแสดงผลการดำเนินงาน (ปีงบประมาณ) --------------------------------------*/			
					if (@$jObj ["i_type"] == 1) {
					
					$style	= "style='background-color:#E9E9E9;'";
					
					$tbody .= "	<tr ".$style.">
									<td nowrap><b></b></td>
									<td nowrap colspan=3><b>".$jObj["c_name"]."</b></td> 
								</tr>";
				} else if (@$jObj ["i_type"] == 8 || @$jObj ["i_type"] == 9) {
					
					if( $jObj ["i_type"] == 8 ) {
						$style	= "style='background-color:#EAEAEA;'";
					} else if( $jObj ["i_type"] == 9 ) {
						$style	= "style='background-color:#ABABAB;'";
					}
					
					$tbody .= "	<tr ".$style.">
									<td nowrap><b></b></td>
									<td nowrap colspan=2><b>".$jObj["c_name"]."</b></td>
									<td nowrap align='right'><b>".number_format($jObj["f_money"],2)."</b></td>
								</tr>";
					if( $jObj ["i_type"] == 8 ) {
						$tbody .= "	<tr><td nowrap colspan=4></td></tr>";
					}
					
				} else if ( (@$jObj ["i_type"] == 2) || (@$jObj ["i_type"] == 3) || (@$jObj ["i_type"] == 4) || (@$jObj ["i_type"] == 5) || (@$jObj ["i_type"] == 6) ) {
					
					$dd			= "";
					$dd_empty 	= "&nbsp;&nbsp;";

					switch ($jObj["i_type"])
					{ 
						case "3" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break; 
						case "4" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break; 
						case "5" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; break;  	
						case "6" 	: 	$dd = $dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty."".$dd_empty; 
										$cc1 = $cc2 ="";
								break;				
						case "2" 	:
						default 	: 	$dd = $dd_empty; break;  
								
					}
					
					$c_code_show	= "<span style=\"margin-left:5px;\">".$dd.$jObj["c_code"]."</span>";

					$tbody .= "	<tr ".$style.">
									<td nowrap align='center'>{$jObj["no"]}</td>
									<td nowrap >".$dd.$c_code_show."</td>
									<td nowrap>".$jObj["c_name"]."</td>
									<td nowrap align='right'>".number_format($jObj["f_money"],2)."</td> 
								</tr>";
				}
		}
	}
	$tbody .= "</tbody>";
} else {
	$conspan = 0;
	foreach ( $thead as $ss ) { ++$conspan; }
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

// =======================================//
if ($_REQUEST ["i_show_acc"] == 2) {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv2"] );
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
		$parent_name = "รายการบัญชีคุม Lv2 : <font color='blue'>" . $name . "</font>";
	} else {
		$parent_name = "รายการบัญชีคุม Lv2 : <font color='blue'>เลือกทั้งหมด</font>";
	}
}
else if ($_REQUEST ["i_show_acc"] == 3) {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv3"] );
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
		$parent_name = "รายการบัญชีคุม Lv3 : <font color='blue'>" . $name . "</font>";
	} else {
		$parent_name = "รายการบัญชีคุม Lv3 : <font color='blue'>เลือกทั้งหมด</font>";
	}
}
else if ($_REQUEST ["i_show_acc"] == 4) {
	$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv4"] );
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
} else if ($_REQUEST ["i_show_acc"] == 5) {
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
		$parent_name = "รายการบัญชีคุม Lv5 : <font color='blue'>" . $name . "</font>";
	} else {
		$parent_name = "รายการบัญชีคุม Lv5 : <font color='blue'>เลือกทั้งหมด</font>";
	}
} else if ($_REQUEST ["i_show_acc"] == 6) {
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
echo "<div align='center'><strong>ปีงบประมาณ " . ($_REQUEST["year_start"]+543) . "</strong></div>";

if ($_REQUEST ["i_show_acc"] == 6) {
	echo "<div><strong>" . $acc_name . "</strong></div>"; 
} else {
	echo "<div><strong>" . $parent_name . "</strong></div>";
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
