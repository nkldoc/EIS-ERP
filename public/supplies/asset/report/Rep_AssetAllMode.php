<?php
include("../api/List_RepAssetAllMode.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานครุภัณฑ์ (แยกตามหมวดครุภัณฑ์)";

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

$mm_start = ($_REQUEST['mm_start'] > '09' ? $_REQUEST['i_year'] - 1 : $_REQUEST['i_year']) . $_REQUEST['mm_start'];
$mm_end = ($_REQUEST['mm_start'] > '09' ? $_REQUEST['i_year'] - 1 : $_REQUEST['i_year']) . $_REQUEST['mm_end'];
$mm_arr = array();
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

$caption = "รายงานครุภัณฑ์ (แยกตามหมวดครุภัณฑ์) ปีงบประมาณ " . ($_REQUEST['i_year'] + 543) . "<br> ระหว่าง : "
	. $month_th[intval($_REQUEST['mm_start'])] . " " . $year_th_s
	. ' - ' . $month_th[intval($_REQUEST['mm_end'])] . " " . $year_th_e;

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {
		if ($jObj["i_type"] == '1') {
			$style = "";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_name"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_unit_cost_sum"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_depre_begin_sum"]) . "</td>";
			foreach ($mm_arr as $value) {
				$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj[$value]) . "</td>";
			}
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_mm_sum"]) . "</td>";
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' colspan=3 v><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_unit_cost_sum"]) . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_depre_begin_sum"]) . "</b></td>";
			foreach ($mm_arr as $value) {
				$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj[$value]) . "</b></td>";
			}
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_mm_sum"]) . "</b></td>";
		}
		// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";

		$tbody .= "</tr>";
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=18 nowrap>ไม่มีข้อมูล</td></tr></tbody>";
}

$tag_th_month = '';
foreach ($mm_arr as $value) {
	$tag_th_month .= '<th style="vertical-align:middle;" rowspan=4 nowrap>' . $month_name[$value] . '</th>';
}
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
</style>

<body>
	<div class="outer">
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";
		echo "<div align='center'><strong>" . $caption . "</strong></div>";

		$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		$budget_type = "แหล่งเงินทั้งหมด";
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$budget_type = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
			$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
		}

		$mm_begin = 'ณ วันที่ 1 ' . $month_th[intval($_REQUEST['mm_start'])] . ' ' . $year_th_s;
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $budget_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ลำดับที่&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รหัส</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รายการ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ราคาทุน<br>( เข้าเกณฑ์ )</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>( <?= $mm_begin ?> )<br>ยอดยกมา</th>
						<?= $tag_th_month ?>
						<th style="vertical-align:middle;" rowspan=0 nowrap><b>เงินรวมค่าเสื่อม</b></th>
					</tr>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
	</div>
</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>