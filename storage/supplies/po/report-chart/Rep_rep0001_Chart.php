<?php
include("../api/List_RepStatisticDetail.php");
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
					<div id="bar-total1" class="hv-full"></div>
				</div>
			</div>
			<div class="col-md-6">
				<div class="x_panel">
					<div id="bar-total2" class="hv-full"></div>
				</div>
			</div>
			<div class="col-md-6">
				<div class="x_panel">
					<div id="bar-total3" class="hv-full"></div>
				</div>
			</div>
			<div class="col-md-6">
				<div class="x_panel">
					<div id="bar-total4" class="hv-full"></div>
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
	var urll = "../report/Rep_rep0001.php";
	<?php
	$dd = "";

	ksort($data_dtl["arr_cost"]);
	foreach ($data_dtl["arr_cost"] as $key => $obj) {
		$ii_than07_1 = (@$obj["ii_than07_1"] != "") ? $obj["ii_than07_1"] : 0;
		$ii_than15_1 = (@$obj["ii_than15_1"] != "") ? $obj["ii_than15_1"] : 0;
		$ii_than30_1 = (@$obj["ii_than30_1"] != "") ? $obj["ii_than30_1"] : 0;
		$ii_over30_1 = (@$obj["ii_over30_1"] != "") ? $obj["ii_over30_1"] : 0;

		$ii_than07_2 = (@$obj["ii_than07_2"] != "") ? $obj["ii_than07_2"] : 0;
		$ii_than15_2 = (@$obj["ii_than15_2"] != "") ? $obj["ii_than15_2"] : 0;
		$ii_than30_2 = (@$obj["ii_than30_2"] != "") ? $obj["ii_than30_2"] : 0;
		$ii_over30_2 = (@$obj["ii_over30_2"] != "") ? $obj["ii_over30_2"] : 0;

		$ii_than07_3 = (@$obj["ii_than07_3"] != "") ? $obj["ii_than07_3"] : 0;
		$ii_than15_3 = (@$obj["ii_than15_3"] != "") ? $obj["ii_than15_3"] : 0;
		$ii_than30_3 = (@$obj["ii_than30_3"] != "") ? $obj["ii_than30_3"] : 0;
		$ii_over30_3 = (@$obj["ii_over30_3"] != "") ? $obj["ii_over30_3"] : 0;

		$ii_than07_4 = (@$obj["ii_than07_4"] != "") ? $obj["ii_than07_4"] : 0;
		$ii_than15_4 = (@$obj["ii_than15_4"] != "") ? $obj["ii_than15_4"] : 0;
		$ii_than30_4 = (@$obj["ii_than30_4"] != "") ? $obj["ii_than30_4"] : 0;
		$ii_over30_4 = (@$obj["ii_over30_4"] != "") ? $obj["ii_over30_4"] : 0;

		$dd .= ",{
				name: '{$obj["name"]}'
				,id: $key
				,ii_than07_1: '{$ii_than07_1}'
				,ii_than15_1: '{$ii_than15_1}'
				,ii_than30_1: '{$ii_than30_1}'
				,ii_over30_1: '{$ii_over30_1}'

				,ii_than07_2: '{$ii_than07_2}'
				,ii_than15_2: '{$ii_than15_2}'
				,ii_than30_2: '{$ii_than30_2}'
				,ii_over30_2: '{$ii_over30_2}'

				,ii_than07_3: '{$ii_than07_3}'
				,ii_than15_3: '{$ii_than15_3}'
				,ii_than30_3: '{$ii_than30_3}'
				,ii_over30_3: '{$ii_over30_3}'

				,ii_than07_4: '{$ii_than07_4}'
				,ii_than15_4: '{$ii_than15_4}'
				,ii_than30_4: '{$ii_than30_4}'
				,ii_over30_4: '{$ii_over30_4}'
			}";
	}
	$dd = substr($dd, 1);
	echo "var cost = [$dd];";

	$dataa = "";
	$arrH[1] = "ตรวจรับถึงจัดทำใบขอเบิก";
	$arrH[2] = "อนุมัติฎีกาถึงจ่ายเงิน";
	$arrH[3] = "รับใบขอเบิกถึงจ่ายเงิน";
	$arrH[4] = "ตรวจรับถึงจ่ายเงิน";

	foreach ($arrH as $ii => $name) {
		/* แสดงภาพหน่วยงาน */
		$txt = $data_dtl["ii_than07_{$ii}"] + $data_dtl["ii_than15_{$ii}"] + $data_dtl["ii_than30_{$ii}"] + $data_dtl["ii_over30_{$ii}"];

		$dataa .= "var bar{$ii} = document.getElementById('bar-total{$ii}');";
		$dataa .= "var myChart{$ii} = echarts.init(bar{$ii}, 'macarons');";
		$dataa .= "var option = {
			title: [{
				text: '{$name}',
				top: '54%',
				subtext: 'จำนวน : {$txt} ฏีกา',
				left: '3%',
				textStyle: {
					fontSize: 14,
				},
				subtextStyle: { 
					lineHeight: 0
				  },
			}, {
				subtext: '0 - 7 วัน : {$data_dtl["ii_than07_{$ii}"]} ฏีกา',
				top: '29%', 
				left: '16%',
				textAlign: 'center'
			}, {
				subtext: '8 - 15 วัน : {$data_dtl["ii_than15_{$ii}"]} ฏีกา',
				top: '52%',
				left: '39%',
				textAlign: 'center'
			},{
				subtext: '16 - 30 วัน : {$data_dtl["ii_than30_{$ii}"]} ฏีกา',
				top: '29%',
				left: '61%',
				textAlign: 'center'
			}, {
				subtext: 'เกิน 30 วัน : {$data_dtl["ii_over30_{$ii}"]} ฏีกา',
				top: '52%',
				left: '85%',
				textAlign: 'center'
			}],
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow'
				}
			},
			grid: [{
				top: '65%',
				width: '90%',
				bottom: 0,
				left: '5%',
				containLabel: true
			}],
			xAxis: [{
				type: 'category',
				data: Object.keys(cost).map(function(key) {
					return cost[key].name;
				}),
				axisLabel: {
					interval: 0,
					rotate: 15
				},
			}],
			yAxis: {},
			series: [{
					name: '0 - 7 วัน',
					type: 'bar',
					label: {
						normal: {
							show: true
						}
					},
					data: Object.keys(cost).map(function(key) {
						return cost[key].ii_than07_{$ii};
					}),
				}, {
					name: '8 - 15 วัน',
					type: 'bar',
					label: {
						normal: {
							show: true
						}
					},
					data: Object.keys(cost).map(function(key) {
						return cost[key].ii_than15_{$ii};
					}),
				},{
					name: '16 - 30 วัน',
					type: 'bar',
					label: {
						normal: {
							show: true
						}
					},
					data: Object.keys(cost).map(function(key) {
						return cost[key].ii_than30_{$ii};
					}),
				}, {
					name: 'เกิน 30 วัน',
					type: 'bar',
					label: {
						normal: {
							show: true
						}
					},
					data: Object.keys(cost).map(function(key) {
						return cost[key].ii_over30_{$ii};
					}),
				},
				{
					type: 'pie',
					radius: '28%',
					center: ['50%', '16%'],
					label: {
						position: 'outer',
						alignTo: 'none',
						margin: '3%',
					},
					left: 0,
					right: '66.6667%',
					top: 0,
					bottom: 0,
					tooltip: {
						trigger: 'item',
						formatter: '{b} : {c} ({d}%)'
					},
					data: Object.keys(cost).map(function(key) {
						return {
							name: cost[key].name,
							value: cost[key].ii_than07_{$ii}
						};
					}),
				},
				{
					type: 'pie',
					radius: '28%',
					center: ['50%', '42%'],
					label: {
						position: 'outer',
						alignTo: 'none',
						margin: '3%',
					},
					left: '21.6666%',
					right: '45%',
					top: 0,
					bottom: 0,
					tooltip: {
						trigger: 'item',
						formatter: '{b} : {c} ({d}%)'
					},
					data: Object.keys(cost).map(function(key) {
						return {
							name: cost[key].name,
							value: cost[key].ii_than15_{$ii}
						};
					}),
				},
				{
					type: 'pie',
					radius: '28%',
					center: ['50%', '16%'],
					label: {
						position: 'outer',
						alignTo: 'none',
						margin: '3%',
					},
					left: '45.3333%',
					right: '21.3333%',
					top: 0,
					bottom: 0,
					tooltip: {
						trigger: 'item',
						formatter: '{b} : {c} ({d}%)'
					},
					data: Object.keys(cost).map(function(key) {
						return {
							name: cost[key].name,
							value: cost[key].ii_than30_{$ii}
						};
					}),
				},
				{
					type: 'pie',
					radius: '28%',
					center: ['60%', '42%'],
					label: {
						position: 'outer',
						alignTo: 'none',
						margin: '3%',
					},
					left: '66.6667%',
					right: 0,
					top: 0,
					bottom: 0,
					tooltip: {
						trigger: 'item',
						formatter: '{b} : {c} ({d}%)'
					},
					data: Object.keys(cost).map(function(key) {
						return {
							name: cost[key].name,
							value: cost[key].ii_over30_{$ii}
						};
					}),
				}
			]
		};
		myChart{$ii}.setOption(option);

		";
		echo $dataa;
	}
	?>
	myChart1.on('click', function(param) {
		console.log(param.componentIndex);
		// exit;  
		var name = param.name;
		var url = window.location.search;

		let result = cost.filter(cc => cc.name == param.name);
		let id = result[0].id;

		if (id > 0) {
			url += "&dc_cost_id_chart=" + id;
		}

		if (param.componentIndex == 4) {
			url += "&c_status=ii_than07_1";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 5) {
			url += "&c_status=ii_than15_1";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 6) {
			url += "&c_status=ii_than30_1";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 7) {
			url += "&c_status=ii_over30_1";
			window.open(urll + url, 'Rep_rep0001_detail');
		}
	});

	myChart2.on('click', function(param) {
		var name = param.name;
		var url = window.location.search;

		let result = cost.filter(cc => cc.name == param.name);
		let id = result[0].id;

		if (id > 0) {
			url += "&dc_cost_id_chart=" + id;
		}

		if (param.componentIndex == 4) {
			url += "&c_status=ii_than07_2";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 5) {
			url += "&c_status=ii_than15_2";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 6) {
			url += "&c_status=ii_than30_2";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 7) {
			url += "&c_status=ii_over30_2";
			window.open(urll + url, 'Rep_rep0001_detail');
		}
	});
	myChart3.on('click', function(param) {
		var name = param.name;
		var url = window.location.search;

		let result = cost.filter(cc => cc.name == param.name);
		let id = result[0].id;

		if (id > 0) {
			url += "&dc_cost_id_chart=" + id;
		}

		if (param.componentIndex == 4) {
			url += "&c_status=ii_than07_3";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 5) {
			url += "&c_status=ii_than15_3";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 6) {
			url += "&c_status=ii_than30_3";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 7) {
			url += "&c_status=ii_over30_3";
			window.open(urll + url, 'Rep_rep0001_detail');
		}
	});
	myChart4.on('click', function(param) {
		var name = param.name;
		var url = window.location.search;

		let result = cost.filter(cc => cc.name == param.name);
		let id = result[0].id;

		if (id > 0) {
			url += "&dc_cost_id_chart=" + id;
		}

		if (param.componentIndex == 4) {
			url += "&c_status=ii_than07_4";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 5) {
			url += "&c_status=ii_than15_4";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 6) {
			url += "&c_status=ii_than30_4";
			window.open(urll + url, 'Rep_rep0001_detail');
		} else if (param.componentIndex == 7) {
			url += "&c_status=ii_over30_4";
			window.open(urll + url, 'Rep_rep0001_detail');
		}
	});
</script>