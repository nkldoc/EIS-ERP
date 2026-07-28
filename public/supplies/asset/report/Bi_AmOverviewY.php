<?php

include("../api/List_BiAmOverviewY.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานภาพรวมสินทรัพย์ ";

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









$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {
		if ($jObj["i_type"] == '1') {
			$style = "";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center 'nowrap>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' nowrap>" . $jObj["acc_name"] . "</td>";
			// $tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center' nowrap>" . $jObj["all_asset"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . $jObj["ass_per"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["all_asset_year"]) . "</td>";

			// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' colspan=2 nowrap><b>รวม</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["ass_per"]) . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["all_asset_year"]) . "</b></td>";
		}
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
	<link rel="stylesheet" type="text/css" href="../../css/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
	<link rel="stylesheet" type="text/css" href="../../css/dashboard.css" />
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
	<div>
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";
		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		//echo "<div align='center'><strong>ข้อมูล ณ วันที่ " . $date->shot_date_from_db($_REQUEST["d_doc_date"]) . "</strong></div>";
		echo "<div align='center'><strong> ประจำปี  " . ($_REQUEST['i_year'] + 543) . "</strong></div>";


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
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;หมวดทรัพย์สิน&nbsp;</th>
						<!-- <th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;จำนวนสินทรัพย์ทั้งหมด&nbsp;</th> -->
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;%&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;สินทรัพย์ที่ได้มาในปี&nbsp;</th>

					</tr>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
	</div>
	<div class="container-fluid">
		<div class="row" style="height: 65%">
			<div class="col-md-12"></div>
			<div class="col-md-12">
				<div class="container">
					<div class="row" style="height: 100%">
						<div class="col-md-12">
							<div class="x_panel">
								<div id="chart-analysis" class="hv-full"></div>
							</div>
						</div>
					</div>
				</div>
			</div>
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


<script src="../../js/echarts/echarts.js"></script>
<script src="../../js/echarts/macarons.js"></script>
<?php
include("../../lib/charts/charts.php");
$echart = new Charts();

/******** PieChart ********/
$chart_element_id = 'chart-analysis';
$title_text = '';
$title_subtext = '';
$title_align = 'center';

$backgroundColor = '#FFFFFF';
$radius = "50%";
$show_bar_label = true;
$position_bar_label = array("inside");
$data = null;

foreach ($data_dtl["data"] as $index => $jObj) {
	if ($jObj["i_type"] == '1') {
		$temp = array(
			"name"      => $jObj["acc_name"],
			"value"     => $jObj["all_asset_year"],
		);
		$data[] = $temp;
	}
}

$echart->PieChart(
	$chart_element_id,
	$title_text,
	$title_subtext,
	$title_align,
	$backgroundColor,
	$radius,
	$show_bar_label,
	$position_bar_label,
	$data,
);

?>