<?php
include("../api/List_RepBICutAnalysisPeriod.php");

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงาน อัตราการตัดชำระหนี้ของยอดเรียกเก็บ ตามช่วงเวลา";

$c_mm	= sprintf("%02d", $_REQUEST["i_mm"]);
$c_year = $_REQUEST["i_year"]+543;
$c_mm2	= sprintf("%02d", $_REQUEST["i_mm2"]);
$c_year2 = $_REQUEST["i_year2"]+543;

$i_budget_year = $_REQUEST["i_year2"]+543;

function changeNumFormat($val, $digit)
{
	if ($val > 0) {
		$val = number_format($val, $digit);
	} else if ($val < 0) {
		$val = "(" . number_format(abs($val), $digit) . ")";
	} else if ($val == "") {
		$val = "";
	} else {
		$val = "-";
	}
	return $val;
}

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {

		$style = "";

		if (@$jObj["i_type"] == 2) {
			$style = "background: #b1b1b1;";

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' nowrap colspan=2><b>" . $jObj["group_name"] . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_for_debt"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["year_c"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["year_1"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["year_2"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["year_3"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["year_4"], 3) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["year_5"], 3) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["year_less"], 3) . "</b></td>";
		} else {
			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' nowrap align='center'>" . $jObj["no"]. "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='left'>" . $jObj["group_name"]. "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_for_debt"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["year_c"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["year_1"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["year_2"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["year_3"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["year_4"], 3) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["year_5"], 3) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["year_less"], 3) . "</td>";
			$tbody .= "</tr>";
		}
		
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=6>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="../../css/dashboard.css" />
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>

<body>
	<div style="background-color:#FFFFFF;">
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong></strong></div>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong> ระหว่างเดือน " . $date->l_month_thai[$c_mm] . "  " . $c_year
				. " ถึงเดือน " . $date->l_month_thai[$c_mm2] . "  " . $c_year2 . "</strong></div>";
		?>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th rowspan="2" style="vertical-align:middle;" nowrap>ลำดับ</th>
						<th rowspan="2" style="vertical-align:middle;" nowrap>กลุ่มสิทธิ</th>
						<th rowspan="2" style="vertical-align:middle;" nowrap>ตัดชำระทั้งหมด</th>
						<th colspan="7" style="vertical-align:middle;" nowrap>ยอดรับชำระในระหว่างปีทีเกิดจากยอดเรียกเก็บในแต่ละปี (บาท)</th>
					</tr>
					<tr>
						<th style="vertical-align:middle; width: 150px;" nowrap><?php echo $i_budget_year; ?></th>
						<th style="vertical-align:middle; width: 150px;" nowrap><?php echo $i_budget_year-1; ?></th>
						<th style="vertical-align:middle; width: 150px;" nowrap><?php echo $i_budget_year-2; ?></th>
						<th style="vertical-align:middle; width: 150px;" nowrap><?php echo $i_budget_year-3; ?></th>
						<th style="vertical-align:middle; width: 150px;" nowrap><?php echo $i_budget_year-4; ?></th>
						<th style="vertical-align:middle; width: 150px;" nowrap><?php echo $i_budget_year-5; ?></th>
						<th style="vertical-align:middle; width: 150px;" nowrap>ก่อนปี <?php echo $i_budget_year-5; ?></th>
					</tr>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
	</div>
	
	<div class="container-fluid">
		<div class="row" style="height: 70%">

			<div class="col-md-12">
				<div class="container">
					<div class="row" style="height: 100%">
						<div class="col-md-12">
							<div class="x_panel">
							<div id="pie-bill" class="hv-full"></div>
							</div>
						</div>
					</div>
				</div>
			</div>

		</div>

	</div>

</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../js/echarts/echarts.js"></script>
<script src="../../js/echarts/macarons.js"></script>
<script>
	/* อัตราการตัดชำระหนี้ของยอดเรียกเก็บ % */
	var chart = document.getElementById("pie-bill");
	var myChart = echarts.init(chart, "macarons");
	var legend_pie = [{name : "ปี <?php echo $i_budget_year; ?>", value: "<?php echo $data_dtl["year_c"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-1; ?>", value: "<?php echo $data_dtl["year_1"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-2; ?>", value: "<?php echo $data_dtl["year_2"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-3; ?>", value: "<?php echo $data_dtl["year_3"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-4; ?>", value: "<?php echo $data_dtl["year_4"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-5; ?>", value: "<?php echo $data_dtl["year_5"]; ?>"}
					, {name : "ก่อนปี <?php echo $i_budget_year-5; ?>", value: "<?php echo $data_dtl["year_less"]; ?>"}];

	var data = [{name : "ปี <?php echo $i_budget_year; ?>", value: "<?php echo $data_dtl["year_c"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-1; ?>", value: "<?php echo $data_dtl["year_1"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-2; ?>", value: "<?php echo $data_dtl["year_2"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-3; ?>", value: "<?php echo $data_dtl["year_3"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-4; ?>", value: "<?php echo $data_dtl["year_4"]; ?>"}
					, {name : "ปี <?php echo $i_budget_year-5; ?>", value: "<?php echo $data_dtl["year_5"]; ?>"}
					, {name : "ก่อนปี <?php echo $i_budget_year-5; ?>", value: "<?php echo $data_dtl["year_less"]; ?>"}];

	var option = {
		title: {
			text: "อัตราการตัดชำระหนี้ของยอดเรียกเก็บ",
			left: "center",
			textStyle: {
				fontSize: 15,
				lineHeight: 20
			},
		},
		tooltip: {
			trigger: "item",
			formatter: "{a} <br/>{b} : {c} ({d} บาท)"
		},
		legend: {
			bottom: 10,
			data: legend_pie,
			orient: 'vertical',
			left: 'right',
			formatter: function(params) {
				var pos = legend_pie.map(function(e) {
					return e.name;
				}).indexOf(params);
				return legend_pie[pos]["name"] + " : " + legend_pie[pos]["value"] + " บาท";
			},
		},
		series: [{
			name: "ภาพรวมใบเบิกทั้งหมด",
			type: "pie",
			radius: "50%",
			selectedMode: "single",
			// label: {
			// 	position: 'inner'
			// },
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: "rgba(0, 0, 0, 0.5)"
				}
			},
			data: data
		}]
	};
	myChart.setOption(option);

</script>