<?php
include("../api/List_RepAssetDepre2.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานรวมค่าเสื่อมราคาทรัพย์สินประจำเดือน ปีงบประมาณ " . ($_REQUEST['i_year'] + 543);

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


$caption = "รายงานรวมค่าเสื่อมราคาทรัพย์สินประจำเดือน ปีงบประมาณ " . ($_REQUEST['i_year'] + 543) . "<br> ระหว่าง : "
	. $month_th[intval($_REQUEST['mm_start'])] . " " . $year_th_s
	. ' - ' . $month_th[intval($_REQUEST['mm_end'])] . " " . $year_th_e;

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {
		if ($jObj["i_type"] == '1') {
			$style = "";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center 'nowrap>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' nowrap>" . $jObj["c_name"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_begin"]) . "</td>";
			for ($i = 1; $i <= 35; ++$i) {
				$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["s" . $i]) . "</td>";
			}
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' colspan=2 nowrap><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_begin"]) . "</b></td>";
			for ($i = 1; $i <= 35; ++$i) {
				$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["s" . $i]) . "</b></td>";
			}
		}
		// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";

		$tbody .= "</tr>";
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=18 nowrap>ไม่มีข้อมูล</td></tr></tbody>";
}

$tag_th_month = '';
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

		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<!-- <div style='position: relative; left: 2px;'><?= $am_mode_name ?></div> -->
			<!-- <div style='position: relative; left: 2px;'><?= $in_year ?></div> -->
		</div>
		<div class="table-overflow">
			<table id='tb_main' width="100%" class="table_report" style=" width: 2000px; display:none" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ลำดับที่&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ชื่อหมวด&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ค่าเสื่อมสะสมยกมา&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินรายได้คณะแพทย์ฯ-การศึกษา&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินรายได้คณะแพทย์ฯ-โรงพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินรายได้โรงพยาบาล + การศึกษา&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินอุดหนุนกทม.&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินอุดหนุนรัฐบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินกองทุนอนุรักษ์พลังงาน (ค่าสนับสนุนที่ปรึกษา)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินกองทุนอนุรักษ์พลังงาน (ค่าสนับสนุนการลงทุน)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินสะสมคณะแพทย์ฯ&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินรายได้คณะแพทย์ฯ-โรงพยาบาล (V-Net)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินบริจาค&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินกู้เดนมาร์ก&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินสมทบก่อสร้าง&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินบริจาค (พระราชทาน)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;รับโอนจากส่วนงานอื่น&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินกองทุนเพื่อพัฒนาการศึกษาคณะแพทยศาสตร์วชิรพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินกองทุนพัฒนาคณะแพทยศาสตร์วชิรพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินทดรองจ่ายคณะแพทยศาสตร์วชิรพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินกองทุนเพื่อพัฒนาอาคารสถานที่คณะแพทยศาสตร์วชิรพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินฝากนอกงบประมาณ-วพบ.&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินยืมคณะแพทยศาสตร์วชิรพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;พักเงินสมทบประกันสังคมและเงินค้ำประกันฯ&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;บัญชีพักเงินสมทบประกันสังคมและประกันสัญญา&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;บัญชีพักเงินสมทบประกันสังคมและประกันสัญญา&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินกองทุนสนับสนุนการวิจัยคณะแพทยศาสตร์วชิรพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินบริจาคคณะแพทยศาสตร์วชิรพยาบาล&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;บัญชีพักภาษีหัก ณ ที่จ่าย ฯ &nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินรายได้คณะแพทยศาสตร์วชิรพยาบาล - รพ. (ถอนคืน)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินรายได้คณะแพทยศาสตร์วชิรพยาบาล (เงินรับโอนจากแหล่งเงินภายนอก)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินรายได้คณะแพทยศาสตร์วชิรพยาบาล - การศึกษา (ถอนคืน)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินบริจาค (นอกงบประมาณ)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;สนง.คณะกรรมการดิจิทัลเพื่อเศรษฐกิจและสังคมแห่งชาติ&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินอุดหนุนรัฐบาล (ถอน)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินอุดหนุนกทม. (ถอน)&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;-ไม่ระบุแหล่งเงิน-&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;เงินบริจาค (นอกงบประมาณ) (ถอนคืน)&nbsp;</th>
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