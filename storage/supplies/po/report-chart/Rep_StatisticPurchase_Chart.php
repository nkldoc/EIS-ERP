<?php
include("../api/List_RepStatisticPurchase.php");

$data_dtl = json_decode(List_QueryParam(), true);
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="../../css/dashboard.css" />
</head>

<body>
	<div class="container-fluid">
		<div class="row" style="height: 100%;">
			<div class="col-md-6">
				<div class="x_panel">
					<div id="pie-total" class="hv-full"></div>
				</div>
			</div>
			<div class="col-md-6">
				<div class="container">
					<div class="row" style="height: 100%;">
						<div class="col-md-12">
							<div class="x_panel">
								<div id="pie-sub-total" class="hv-full"></div>
							</div>
						</div>
						<div class="col-md-12">
							<div class="x_panel">
								<div id="pie-sub-protest" class="hv-full"></div>
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
	/* แสดงภาพรวมสถิติการเบิกจ่ายฏีกาจัดซื้อจัดจ้าง % */
	var chart = document.getElementById("pie-total");
	var myChart = echarts.init(chart, "macarons");
	var urll = "../report/Rep_StatisticPurchase.php";
	var legend_pie = [{
		name: "ไม่เกิน 15 วัน",
		value: <?= $data_dtl["i_than15"]; ?>
	}, {
		name: "ไม่เกิน 30 วัน",
		value: <?= $data_dtl["i_than30"]; ?>
	}, {
		name: "ไม่เกิน 60 วัน",
		value: <?= $data_dtl["i_than60"]; ?>
	}, {
		name: "ไม่เกิน 90 วัน",
		value: <?= $data_dtl["i_than90"]; ?>
	}, {
		name: "มากกว่า 90 วัน",
		value: <?= $data_dtl["i_over90"]; ?>
	}];

	var data = [{
		name: legend_pie[0]["name"],
		value: legend_pie[0]["value"],
	}, {
		name: legend_pie[1]["name"],
		value: legend_pie[1]["value"],
	}, {
		name: legend_pie[2]["name"],
		value: legend_pie[2]["value"],
	}, {
		name: legend_pie[3]["name"],
		value: legend_pie[3]["value"],
	}, {
		name: legend_pie[4]["name"],
		value: legend_pie[4]["value"],
	}];

	var option = {
		title: {
			text: "แสดงภาพรวมสถิติการเบิกจ่ายฏีกาจัดซื้อจัดจ้าง\n<?= "ทำทะเบียนจ่ายวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end"]) ?>",
			subtext: "จำนวนใบขอเบิกทั้งหมด : <?= $data_dtl["totalCount"]; ?> รายการ",
			left: "center",
			textStyle: {
				fontSize: 15,
				lineHeight: 20
			},
		},
		tooltip: {
			trigger: "item",
			formatter: "{a} <br/>{b} : {c} ({d}%)"
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
				return legend_pie[pos]["name"] + " : " + legend_pie[pos]["value"] + " รายการ";
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
	myChart.on('click', function(param) {

		var name = param.name;

		var url = window.location.search;
		if (name == legend_pie[0]["name"]) { // ไม่เกิน 15 วัน
			url += "&c_status=i_than15";
			window.open(urll + url, 'Rep_StatisticPurchase_detail');
		} else if (name == legend_pie[1]["name"]) { // ไม่เกิน 30 วัน
			url += "&c_status=i_than30";
			window.open(urll + url, 'Rep_StatisticPurchase_detail');
		} else if (name == legend_pie[2]["name"]) { // ไม่เกิน 60 วัน
			url += "&c_status=i_than60";
			window.open(urll + url, 'Rep_StatisticPurchase_detail');
		} else if (name == legend_pie[3]["name"]) { // ไม่เกิน 90 วัน
			url += "&c_status=i_than90";
			window.open(urll + url, 'Rep_StatisticPurchase_detail');
		} else if (name == legend_pie[4]["name"]) { // เกิน 90 วัน
			url += "&c_status=i_over90";
			window.open(urll + url, 'Rep_StatisticPurchase_detail');
		}

	});

	/* แยกรายละเอียดวันเบิกจ่าย */
	var chart = document.getElementById("pie-sub-total");
	var myChart = echarts.init(chart, "macarons");
	var option = {
		title: [{
			subtext: "ไม่เกิน 90 วัน : <?= $data_dtl["i_than90"]; ?> รายการ",
			bottom: "0%",
			left: "25%",
			textAlign: 'center'
		}, {
			subtext: "มากกว่า 90 วัน : <?= $data_dtl["i_over90"]; ?> รายการ",
			left: "75%",
			bottom: "0%",
			textAlign: 'center'
		}, {
			subtext: "ไม่เกิน 30 วัน : <?= $data_dtl["i_than30"]; ?> รายการ",
			left: "50%",
			top: "47%",
			textAlign: 'center'
		}, {
			subtext: "ไม่เกิน 60 วัน : <?= $data_dtl["i_than60"]; ?> รายการ",
			left: "75%",
			top: "47%",
			textAlign: 'center'
		}, {
			subtext: "ไม่เกิน 15 วัน : <?= $data_dtl["i_than15"]; ?> รายการ",
			left: "20%",
			top: "47%",
			textAlign: 'center'
		}],
		legend: {},
		tooltip: {},
		dataset: {
			source: [
				['product', 'ไม่เกิน 15 วัน', 'ไม่เกิน 30 วัน', 'ไม่เกิน 60 วัน', 'ไม่เกิน 90 วัน', 'มากกว่า 90 วัน'],
				['ไม่มีการทักท้วง', <?= $data_dtl["ii_than15_n"]; ?>, <?= $data_dtl["ii_than30_n"]; ?>, <?= $data_dtl["ii_than60_n"]; ?>, <?= $data_dtl["ii_than90_n"]; ?>, <?= $data_dtl["ii_over90_n"]; ?>],
				['มีการทักท้วง', <?= $data_dtl["ii_than15_h"]; ?>, <?= $data_dtl["ii_than30_h"]; ?>, <?= $data_dtl["ii_than60_h"]; ?>, <?= $data_dtl["ii_than90_h"]; ?>, <?= $data_dtl["ii_over90_h"]; ?>],
			]
		},
		series: [{
			type: 'pie',
			radius: 50,
			center: ['20%', '30%'],
			encode: {
				itemName: 'product',
				value: 'ไม่เกิน 15 วัน'
			},
		}, {
			type: 'pie',
			radius: 50,
			center: ['50%', '30%'],
			encode: {
				itemName: 'product',
				value: 'ไม่เกิน 30 วัน'
			},
		}, {
			type: 'pie',
			radius: 50,
			center: ['80%', '30%'],
			encode: {
				itemName: 'product',
				value: 'ไม่เกิน 60 วัน',
			},
		}, {
			type: 'pie',
			radius: 50,
			center: ['25%', '75%'],
			encode: {
				itemName: 'product',
				value: 'ไม่เกิน 90 วัน'
			}
		}, {
			type: 'pie',
			radius: 50,
			center: ['75%', '75%'],
			encode: {
				itemName: 'product',
				value: 'มากกว่า 90 วัน'
			}
		}]
	};
	myChart.setOption(option);
	myChart.on('click', function(param) {
		var name = param.name;
		var url = window.location.search;
		if (name == "ไม่มีการทักท้วง") {
			if (param.componentIndex == 0) {
				url += "&c_status=ii_than15_n";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 1) {
				url += "&c_status=ii_than30_n";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 2) {
				url += "&c_status=ii_than60_n";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 3) {
				url += "&c_status=ii_than90_n";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 4) {
				url += "&c_status=ii_over90_n";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			}
		} else if (name == "มีการทักท้วง") {
			if (param.componentIndex == 0) {
				url += "&c_status=ii_than15_h";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 1) {
				url += "&c_status=ii_than30_h";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 2) {
				url += "&c_status=ii_than60_h";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 3) {
				url += "&c_status=ii_than90_h";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			} else if (param.componentIndex == 4) {
				url += "&c_status=ii_over90_h";
				window.open(urll + url, 'Rep_StatisticPurchase_detail');
			}
		}
	});

	/* แยกรายละเอียดทักท้วงเกิน 5 วัน */
	var chart = document.getElementById("pie-sub-protest");
	var myChart = echarts.init(chart, "macarons");
	var legend = [{
		name: "ภายใน 5 วันทำการ",
		value: <?= $data_dtl["ii_stop_date_n"]; ?>
	}, {
		name: "เกิน 5 วันทำการ",
		value: <?= $data_dtl["ii_stop_date_h"]; ?>
	}];

	var data = [{
		name: legend[0]["name"],
		value: legend[0]["value"],
	}, {
		name: legend[1]["name"],
		value: legend[1]["value"],
	}];

	var option = {
		title: {
			text: "ระยะเวลาในการแก้ไขข้อทักท้วง",
			subtext: "จำนวนทักท้วงทั้งหมด : <?= $data_dtl["ii_protest"]; ?> รายการ",
			left: "center",
		},
		tooltip: {
			trigger: "item",
			formatter: "{a} <br/>{b} : {c} ({d}%)"
		},
		legend: {
			bottom: 10,
			data: legend,
			// orient: 'vertical',
			left: 'center',
			formatter: function(params) {
				var pos = legend.map(function(e) {
					return e.name;
				}).indexOf(params);
				return legend[pos]["name"] + " : " + legend[pos]["value"] + " รายการ";
			},
		},
		series: [{
			name: "ภาพรวมใบเบิกทั้งหมด",
			type: "pie",
			radius: "50%",
			selectedMode: "single",
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
	myChart.on('click', function(param) {
		var name = param.name;
		var url = window.location.search;
		if (name == "ภายใน 5 วันทำการ") {
			url += "&c_status=ii_stop_date_n";
			window.open(urll + url, 'Rep_StatisticPurchase_detail');
		} else if (name == "เกิน 5 วันทำการ") {
			url += "&c_status=ii_stop_date_h";
			window.open(urll + url, 'Rep_StatisticPurchase_detail');
		}
	});
</script>