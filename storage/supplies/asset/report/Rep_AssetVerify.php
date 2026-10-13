<?php
include("../api/List_RepAssetVerify.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานตรวจสอบครุภัณฑ์ประจำปีงบประมาณ " . ($_REQUEST['i_year'] + 543);

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}


function changeNumFormat($val)
{
	if ($val > 0) {
		$val = number_format($val, 2);
	} else if ($val < 0) {
		$val = "<font color=red>(" . number_format(abs($val), 2) . ")</font>";
	} else {
		$val = "-";
	}
	return $val;
}
/*
if ($_REQUEST['mm_start'] >= 10 && $_REQUEST['mm_end'] >= 10) {
	for ($i = $_REQUEST['mm_start']; $i <= $_REQUEST['mm_end']; ++$i) {
		$mm_arr[] = 'mm_' . $i;
	}
	$year_th_s = $_REQUEST['i_year'] + 543 - 1;
	$year_th_e = $_REQUEST['i_year'] + 543 - 1;
} else if ($_REQUEST['mm_start'] >= 10 && $_REQUEST['mm_end'] < 10) {
	for ($i = $_REQUEST['mm_start']; $i <= 12; ++$i) {
		$mm_arr[] = 'mm_' . $i;
	}
	for ($i = 1; $i <= $_REQUEST['mm_end']; ++$i) {
		$mm_arr[] = 'mm_0' . intval($i);
	}
	$year_th_s = $_REQUEST['i_year'] + 543 - 1;
	$year_th_e = $_REQUEST['i_year'] + 543;
} else {
	for ($i = $_REQUEST['mm_start']; $i <= $_REQUEST['mm_end']; ++$i) {
		$mm_arr[] = 'mm_0' . intval($i);
	}
	$year_th_s = $_REQUEST['i_year'] + 543;
	$year_th_e = $_REQUEST['i_year'] + 543;
}
*/
/*
$month_th = array(
	'',
	'ม.ค.',
	'ก.พ.',
	'มี.ค.',
	'เม.ย.',
	'พ.ค.',
	'มิ.ย.',
	'ก.ค.',
	'ส.ค.',
	'ก.ย.',
	'ต.ค.',
	'พ.ย.',
	'ธ.ค.',
);
$month_name['mm_10'] = '&nbsp;' . ($_REQUEST['i_year'] + 543 - 1) . '&nbsp;<br>ต.ค.';
$month_name['mm_11'] = '&nbsp;' . ($_REQUEST['i_year'] + 543 - 1) . '&nbsp;<br>พ.ย.';
$month_name['mm_12'] = '&nbsp;' . ($_REQUEST['i_year'] + 543 - 1) . '&nbsp;<br>ธ.ค.';
$month_name['mm_01'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>ม.ค.';
$month_name['mm_02'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>ก.พ.';
$month_name['mm_03'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>มี.ค.';
$month_name['mm_04'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>เม.ย.';
$month_name['mm_05'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>พ.ค.';
$month_name['mm_06'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>มิ.ย.';
$month_name['mm_07'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>ก.ค.';
$month_name['mm_08'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>ส.ค.';
$month_name['mm_09'] = '&nbsp;' . ($_REQUEST['i_year'] + 543) . '&nbsp;<br>ก.ย.';
*/

$caption = "รายงานตรวจสอบครุภัณฑ์ประจำปีงบประมาณ " . ($_REQUEST['i_year'] + 543) /*. "<br> ระหว่าง : "
	. $month_th[intval($_REQUEST['mm_start'])] . " " . $year_th_s
	. ' - ' . $month_th[intval($_REQUEST['mm_end'])] . " " . $year_th_e*/;

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {
		//if ($jObj["i_type"] == '1') {
			$style = "";
			$tbody .= "<tr>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["d_receive_date"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . intval($jObj["quantity"]) . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["dc_unit_type"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_unit_cost"]) . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["segment"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" .  intval($jObj["i_budget_year"]) . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["budget_source"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_detail"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_brand"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_model"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_serial"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["got"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . intval($jObj["i_period_year"]) . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_is_cal"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_commet"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["receipt_number"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_location"] . "</td>";
			
		/*} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' colspan=7 nowrap><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_unit_cost"]) . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_depre_begin"]) . "</b></td>";

		}*/
		// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";

		$tbody .= "</tr>";
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=18 nowrap>ไม่มีข้อมูล</td></tr></tbody>";
}
/*
$tag_th_month = '';
foreach ($mm_arr as $value) {
	$tag_th_month .= '<th style="vertical-align:middle;" rowspan=4 nowrap>' . $month_name[$value] . '</th>';
}*/
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<style>
	.ol1 {
		background-color: #E1F5D8;
	}

	.ol2 {
		background-color: #F5F3D8;
	}

	.loader {
		border: 4px solid #E7E7E7;
		border-radius: 50%;
		border-top: 4px solid #3498db;
		width: 12px;
		height: 12px;
		-webkit-animation: spin 1s linear infinite;
		/* Safari */
		animation: spin 1s linear infinite;
	}
</style>

<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;">
	<div class="loader"></div>
	<p>&nbsp;&nbsp;กำลังโหลดข้อมูลตารางกรุณารอสักครู่...</p>
</div>

<body>
	<div class="outer">
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";
		echo "<div align='center'><strong>" . $caption . "</strong></div>";

		$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		$budget_type = "แหล่งเงินทั้งหมด";
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$budget_type = $db->GetDataBySQL("SELECT c_name FROM nmu..dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
			$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
		}
		$am_mode_name = $_REQUEST["am_mode_id"] != 0 ? ($db->GetDataBySQL("SELECT c_code + ' : ' +c_name FROM am_mode_acc WHERE am_mode_id = ?", array($_REQUEST["am_mode_id"]))) : 'ทั้งหมด';
		$am_mode_name = "หมวดครุภัณฑ์ : <font color='blue'>" . $am_mode_name . "</font>";
		$c_qualify = "สถานะ : <font color='blue'>" . ($_REQUEST["i_qualify"] == 1 ? 'เข้าเกณฑ์' : ($_REQUEST["i_qualify"] == 2 ? 'ไม่เข้าเกณฑ์' : 'ทั้งหมด')) . "</font>";
		// $mm_begin = 'ณ วันที่ 1 ' . $month_th[intval($_REQUEST['mm_start'])] . ' ' . $year_th_s;
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $budget_name ?></div>
			<div style='position: relative; left: 2px;'><?= $am_mode_name ?></div>
			<div style='position: relative; left: 2px;'><?= $c_qualify ?></div>
		</div>
		<div class="table-overflow">
			<table id='tb_main' width="100%" class="table_report" style=" width: 2000px; display:none" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รหัสครุภัณฑ์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ชื่อครุภัณฑ์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>วันที่รับ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>จ.น. รับ  (DR)</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>หน่วยนับ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>มูลค่าเริ่มต้น</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ส่วนงาน</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ปีงบ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น)</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ยี่ห้อ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รุ่น</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>Serial Number</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>วิธีการได้มา</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>อายุครุภัณฑ์(ปี)</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ชนิดครุภัณฑ์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>หมายเหตุ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>เลขที่ใบตรวจรับ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>สถานที่ตั้ง</th>
					</tr>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
	</div>
</body>
<script>
	document.getElementById('tb_main').style.width = "100%";
	document.getElementById("tb_main").style.display = "table";
	document.getElementById('loader_display').style.display = "none";
</script>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>