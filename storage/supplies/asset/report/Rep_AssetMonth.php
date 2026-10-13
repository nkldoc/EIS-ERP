<?php
include("../api/List_RepAssetMonth.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานตรวจสอบครุภัณฑ์ประจำปี " . ($_REQUEST['i_year'] + 543);

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
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["am_mode_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["acc_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["budget_source"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" .  intval($jObj["i_period_year"]) . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["d_receive_date"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_unit_cost"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["i_cal"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["i_nocal"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_depre_begin"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_depre"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_lift"]) . "</td>";
			

		$tbody .= "</tr>";
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=18 nowrap>ไม่มีข้อมูล</td></tr></tbody>";
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
			<!-- <div style='position: relative; left: 2px;'><?= $budget_name ?></div>
			<div style='position: relative; left: 2px;'><?= $am_mode_name ?></div>
			<div style='position: relative; left: 2px;'><?= $c_qualify ?></div> -->
		</div>
		<div class="table-overflow">
			<table id='tb_main' width="100%" class="table_report" style=" width: 2000px; display:none" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รหัสครุภัณฑ์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ชื่อครุภัณฑ์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รหัส/ชื่อ หมวดพัสดุ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>รหัส/ชื่อ บัญชี</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>อายุการใช้งาน</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>วันที่ได้รับ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>มูลค่าที่ได้รับ</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>มูลค่าเข้าเกณฑ์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>มูลค่าต่ำกว่าเกณฑ์</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ค่าเสื่อมสะสมยกมา</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ค่าเสื่อมประจำเดือน</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>ค่าเสื่อมยกไป</th>

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