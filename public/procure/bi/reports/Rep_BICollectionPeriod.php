<?php
include("../api/List_RepBICollectionPeriod.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();
$date = new i_date();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานระยะเวลาเก็บหนี้ สำหรับยอดเรียกเก็บ";

function changeNumFormat($val)
{
	if ($val > 0) {
		$val = number_format($val, 2);
	} else if ($val < 0) {
		$val = "(" . number_format(abs($val), 2) . ")";
	} else if ($val == "") {
		$val = "";
	} else {
		$val = "-";
	}
	return $val;
}
$NumGroup = 0;

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	$NumGroup = 1;
	$data_chart[] = "";
	$name_chart[] = "";
	
	$duration[0] = "1 เดือน";
	$duration[1] = "2 เดือน";
	$duration[2] = "3 เดือน";
	$duration[3] = "4 เดือน";
	$duration[4] = "5 เดือน";
	$duration[5] = "6 เดือน";
	$duration[6] = "7 เดือน";
	$duration[7] = "8 เดือน";
	$duration[8] = "9 เดือน";
	$duration[9] = "10 เดือน";
	$duration[10] = "11 เดือน";
	$duration[11] = "12 เดือน";
	$duration[12] = "1 ปี";
	$duration[13] = "2 ปี";
	$duration[14] = "มากกว่า 2 ปี";

	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {
		
		$style = "";
		$data_chart[$NumGroup] = '';
		$name_chart[$NumGroup] = '';
		if (@$jObj["i_type"] == 2) {
			$style = "background: #b1b1b1;";

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' nowrap colspan=2><b>" . $jObj["c_treat_group_name"] . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_bill"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m0"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m1"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m2"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m3"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m4"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m5"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m6"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m7"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m8"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m9"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m10"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m11"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m12"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m13"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_m14"], 2) . "</b></td>";
			$tbody .= "</tr>";
		} else  {
			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' nowrap align='center'>" . $jObj["no"]. "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='left'>" . $jObj["c_treat_group_name"]. "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_bill"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m0"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m1"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m2"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m3"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m4"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m5"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m6"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m7"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m8"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m9"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m10"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m11"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m12"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m13"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_m14"], 2) . "</td>";
			$tbody .= "</tr>";

			$i = 0;
			$name_chart[$NumGroup] = $jObj["c_treat_group_name"];
			while ($i <= 14) {
				$data_chart[$NumGroup] .= "{
					name: '{$duration[$i]}',
					value: {$jObj["f_m{$i}"]}
				},";

				$i++;
			}
			$NumGroup++;
		}
	}

	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=19>ไม่มีข้อมูล</td></tr></tbody>";
}
$i = 1;
$chart_loop = '';
$div_loop = '';

while ($i < $NumGroup) {
	$div_loop .= "<div id='bar-total{$i}' class='div-c'></div> <hr width=100% size=10 color=C8C8C8>";

	$chart_loop .= "
	var chart{$i} = document.getElementById('bar-total{$i}');
	var myChart{$i} = echarts.init(chart{$i}, 'macarons');

	var app = {};
	option = null;

	var data = [
		{$data_chart[$i]}
	];

	option = {
		title: {
			text: '{$name_chart[$i]}',
			textStyle: {
				color: '#494949'
				},
			subtext: '',
			left: 'left'
		},
		tooltip: {
			trigger: 'item',
			formatter: '{a} <br/>{b} : {c} ({d}%)'
		},
		legend: {
			orient: 'vertical',
			//orient: 'horizontal',
			bottom: '10%',
			left: '50%',
			//right: '10.3333%',
			data: data
		},
		series: [{
			name: '',
			type: 'pie',
			top: '20%',
			radius: '80%',
			center: ['50%', '50%'],
			data: data,
			left: '15.3333%',
			right: '51.3333%',
			emphasis: {
				itemStyle: {
					shadowBlur: 10,
					shadowOffsetX: 0,
					shadowColor: 'rgba(0, 0, 0, 0.5)'
				}
			}

		}]
	};

	if (option && typeof option === 'object') {
		myChart{$i}.setOption(option, true);

	}
	";

	$i++;
}

?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
	<style>
		.div-c {
			height: 200px;
		}
	</style>
</head>

<body>
	<div class="outer">
		<?php
		if ($s_title == true)
		echo "<div align='center'><strong></strong></div>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		if (@$_REQUEST["d_date_start"] != "" && @$_REQUEST["d_date_end"] != "") {
			echo "<div align='center'><strong>เรียเก็บระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		}

		if (@$_REQUEST["d_date_at"] != "") {
			echo "<div align='center'><strong>ข้อมูล ณ วันที่ " . $date->shot_date_from_db($_REQUEST["d_date_at"]) . "</strong></div>";
		}
		?>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th rowspan="2" style="vertical-align:middle;" nowrap>ลำดับ</th>
						<th rowspan="2" style="vertical-align:middle;" nowrap>กลุ่มสิทธิ</th>
						<th rowspan="2" style="vertical-align:middle;" nowrap>ยอดเรียกเก็บรวม</th>
						<th colspan="15" style="vertical-align:middle;" nowrap>ระยะเวลาเก็บหนี้</th>
					</tr>
					<tr>
						<th style="vertical-align:middle; width: 100px;" nowrap>1 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>2 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>3 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>4 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>5 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>6 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>7 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>8 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>9 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>10 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>11 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>12 เดือน</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>1 ปี</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>2 ปี</th>
						<th style="vertical-align:middle; width: 100px;" nowrap>มากกว่า 2 ปี</th></th>
					</tr>
				</thead>
				<?= $tbody ?>
			</table>
			<br />
			<?= $div_loop; ?>
		</div>
		
	</div>
	
</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>
<script src="../../js/echarts/echarts.js"></script>
<script src="../../js/echarts/macarons.js"></script>
<script>
	<?= $chart_loop; ?>
</script>