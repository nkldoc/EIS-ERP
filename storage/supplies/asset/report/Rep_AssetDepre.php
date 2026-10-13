<?php
include("../api/List_RepAssetDepre.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานรายละเอียดค่าเสื่อมประจำเดือน ปีงบประมาณ " . ($_REQUEST['i_year'] + 543);

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
$year_th_s = ($_REQUEST['mm_start'] > '09' ? ($_REQUEST['i_year'] - 1) + 543 : $_REQUEST['i_year'] + 543);

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


$caption = "รายงานรายละเอียดค่าเสื่อมประจำเดือน<br>ปีงบประมาณ : " . ($_REQUEST['i_year'] + 543) . "<br> เดือน : "
	. $month_th[intval($_REQUEST['mm_start'])] . " " . $year_th_s;

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {
		if ($jObj["i_type"] == '1') {
			$style = "";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center 'nowrap>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . $jObj["c_ref_doc"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . $jObj["gx_code"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["am_mode_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["acc_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["budget_source"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . intval($jObj["i_period_year"]) . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["d_receive_date"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_unit_cost"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_depre_begin"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_depre"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_mm_sum"]) . "</td>";
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' colspan=10 nowrap><b>" . $jObj["d_receive_date"] . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_unit_cost"]) . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_depre_begin"]) . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_depre"]) . "</b></td>";
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

		$am_mode_name = $_REQUEST["am_mode_id"] != 0 ? ($db->GetDataBySQL("SELECT c_code + ' : ' +c_name FROM NMU_ERP..am_mode_acc WHERE am_mode_id = ?", array($_REQUEST["am_mode_id"]))) : 'ทั้งหมด';
$am_mode_name = "หมวดครุภัณฑ์ : <font color='blue'>" . $am_mode_name . "</font>";
		$in_year = "สถานะ : <font color='blue'>" . ($_REQUEST["in_year"] == 1 ? 'สินทรัพย์ในปี' : ($_REQUEST["in_year"] == 2 ? 'สินทรัพย์ก่อนปี' : 'ทั้งหมด')) . "</font>";
		$mm_begin = 'ณ วันที่ 1 ' . $month_th[intval($_REQUEST['mm_start'])] . ' ' . $year_th_s;
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $am_mode_name ?></div>
			<div style='position: relative; left: 2px;'><?= $in_year ?></div>
		</div>
		<div class="table-overflow">
			<table id='tb_main' width="100%" class="table_report" style=" width: 2000px; display:none" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ลำดับที่&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>เลขเอกสารอ้างอิง</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>เลขที่ GX</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รหัสสินทรัพย์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ชื่อสินทรัพย์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>หมวดบัญชีสินทรัพย์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ชื่อบัญชี</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>อายุการใช้งาน</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>วันที่รับ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ราคาทุน&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ค่าเสื่อมสะสมยกมา&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ค่าเสื่อมประจำเดือน&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ค่าเสื่อมสะสมยกไป&nbsp;</th>
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