<?php
include("../../conf/config.php");
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<link rel="icon" href="../../images/favicon.ico" type="image/x-icon">
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/bootstrap.min.css" />
	<link rel="stylesheet" type="text/css" href="../../css/dashboard.css" />
	<style>
		body {
			font-family: monospace;
		}

		.tb {
			height: 100%;
			width: 100%;
			display: inline-table;
		}

		.tb tbody {
			display: block;
			overflow-y: scroll;
			height: 100%;
			width: 100%;
		}

		.tb thead {
			background: #e4e4e4;
		}

		.tb thead tr {
			display: inline-table;
			width: -webkit-calc(100% - 5px);
			width: -moz-calc(100% - 5px);
			width: calc(100% - 5px);
		}

		.tb thead tr th {
			text-align: center;
			height: 25px;
		}

		.tb tbody tr {
			display: inline-table;
			width: 100%;
		}

		.tb th:nth-child(1),
		.tb td:nth-child(1) {
			text-align: center;
			width: var(--w1);
		}

		.tb th:nth-child(2),
		.tb td:nth-child(2) {
			text-align: center;
			width: var(--w2);
		}

		.tb th:nth-child(3),
		.tb td:nth-child(3) {
			text-align: center;
			width: var(--w3);
		}

		.tb th:nth-child(4),
		.tb td:nth-child(4) {
			text-align: center;
			width: var(--w4);
		}

		.tb th:nth-child(5),
		.tb td:nth-child(5) {
			text-align: center;
			width: var(--w5);
		}

		.tb .color {
			height: 10px;
			border-radius: 1px;
		}

		.title {
			font-weight: bold;
			border-left: 4px solid #e4e4e4;
			border-radius: 1px;
			padding-left: 8px;
		}

		.t2 {
			/* font-size: 14px; */
		}

		.s1,
		.s2,
		.s3 {
			position: absolute;
		}

		.s2 {
			font-size: 36px;
			font-weight: bold;
			width: 90%;
			text-align: center;
			color: #35bbab;
		}

		.s3 {
			top: 25px;
			right: 92px;
			font-size: 18px;
			font-weight: bold;
		}

		::-webkit-scrollbar {
			width: 5px;
		}

		::-webkit-scrollbar-track {
			border-radius: 1px;
		}

		::-webkit-scrollbar-thumb {
			background: #e4e4e4;
			border-radius: 1px;
		}
	</style>
</head>

<body>
	<div class=" container-fluid">
		<div class="row" style="height: 10%;">
			<div class="col-md-3">
				<div class="x_panel">
					<div class="hv-full">
						<button id="toggle">full screen</button>
						<span class='s1'>ประจำปีงบประมาณ</span>
						<span class='s2' style="color: #4b99f9;"><?= $_REQUEST["i_year"] + 543; ?></span>

					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="x_panel">
					<div class="hv-full">
						<span class='s1'>ใบเบิกทั้งหมด</span>
						<span class='s2'>25634</span>
						<span class='s3'>ฏีกา</span>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="x_panel">
					<div class="hv-full">
						<span class='s1'>เบิกจ่ายแล้วจำนวน</span>
						<span class='s2'>25634</span>
						<span class='s3'>ฏีกา</span>
					</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="x_panel">
					<div class="hv-full">
						<span class='s1'>ยังไม่เบิกจ่ายจำนวน</span>
						<span class='s2'>25634</span>
						<span class='s3'>ฏีกา</span>
					</div>
				</div>
			</div>
		</div>
		<div class="row" style="height: 60%;">
			<div class="col-md-4">
				<div class="x_panel">
					<div class="hv-full">
						<div style="height: 44px;">
							<div class="title">อนุมัติฏีกา</div>
							<div class="title t2">รอดำเนินการอนุมัติ 5 ใบเบิก</div>
						</div>
						<table id="B1" class="tb" style="
							--w1: 24px;
							--w2: 120px;
							--w3: 120px;
							--w4: 70px;
							height: calc(100% - 44px);">
							<thead>
								<tr>
									<th>no</th>
									<th>เลขที่ใบเบิก</th>
									<th>วันที่รับเอกสาร</th>
									<th>จำนวนวัน</th>
									<th></th>
								</tr>
							</thead>
							<tbody>
								<tr>
									<td colspan="6">ไม่มีข้อมูล</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="container" style="position: absolute; height: 100%;">
					<div class="row" style="height: 100%;">
						<div class="col-md-12">
							<div class="x_panel">
								<div class="hv-full">
									<div style="height: 44px;">
										<div class="title">ทักท้วง</div>
										<div class="title t2">รอดำเนินการทักท้วง 5 ฏีกา</div>
									</div>
									<table id="B2" class="tb" style="
										--w1: 24px;
										--w2: 120px;
										--w3: 120px;
										--w4: 70px;
										height: calc(100% - 44px);">
										<thead>
											<tr>
												<th>no</th>
												<th>เลขที่ใบเบิก</th>
												<th>วันที่รับเอกสาร</th>
												<th>จำนวนวัน</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colspan="6">ไม่มีข้อมูล</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div class="col-md-12">
							<div class="x_panel">
								<div class="hv-full">
									<div style="height: 44px;">
										<div class="title">จัดทำเช็ค</div>
										<div class="title t2">รอดำเนินการจัดทำเช็ค 5 ฏีกา</div>
									</div>
									<table id="B4" class="tb" style="
										--w1: 24px;
										--w2: 90px;
										--w3: 90px;
										--w4: 90px;
										--w5: 70px;
										height: calc(100% - 44px);">
										<thead>
											<tr>
												<th>no</th>
												<th>เลขที่ใบเบิก</th>
												<th>เลขที่ฏีกา</th>
												<th>วันที่รับเอกสาร</th>
												<th>จำนวนวัน</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colspan="6">ไม่มีข้อมูล</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="col-md-4">
				<div class="container" style="position: absolute; height: 100%;">
					<div class="row" style="height: 100%;">
						<div class="col-md-12">
							<div class="x_panel">
								<div class="hv-full">
									<div style="height: 44px;">
										<div class="title">หักงบประมาณ</div>
										<div class="title t2">รอดำเนินการหักงบประมาณ 5 ฏีกา</div>
									</div>
									<table id="B3" class="tb" style="
										--w1: 24px;
										--w2: 90px;
										--w3: 90px;
										--w4: 90px;
										--w5: 70px;
										height: calc(100% - 44px);">
										<thead>
											<tr>
												<th>no</th>
												<th>เลขที่ใบเบิก</th>
												<th>เลขที่ฏีกา</th>
												<th>วันที่รับเอกสาร</th>
												<th>จำนวนวัน</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colspan="6">ไม่มีข้อมูล</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
						<div class="col-md-12">
							<div class="x_panel">
								<div class="hv-full">
									<div style="height: 44px;">
										<div class="title">ทะเบียนจ่าย</div>
										<div class="title t2">รอดำเนินการทะเบียนจ่าย 5 ฏีกา</div>
									</div>
									<table id="B5" class="tb" style="
										--w1: 24px;
										--w2: 90px;
										--w3: 90px;
										--w4: 90px;
										--w5: 70px;
										height: calc(100% - 44px);">
										<thead>
											<tr>
												<th>no</th>
												<th>เลขที่ใบเบิก</th>
												<th>เลขที่ฏีกา</th>
												<th>วันที่รับเอกสาร</th>
												<th>จำนวนวัน</th>
												<th></th>
											</tr>
										</thead>
										<tbody>
											<tr>
												<td colspan="6">ไม่มีข้อมูล</td>
											</tr>
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="row" style="height: 30%;">
			<div class="col-md-9">
				<div class="x_panel">
					<div class="hv-full">หน่วยงาน ทำกราฟแท่ง</div>
				</div>
			</div>
			<div class="col-md-3">
				<div class="x_panel">
					<div class="hv-full">จำนวนฏีกาทั้งหมด กราฟวงกลม</div>
				</div>
			</div>
		</div>
	</div>
</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../js/echarts/echarts.js"></script>
<script src="../../js/echarts/macarons.js"></script>
<script type="text/javascript">
	if (document.fullscreenEnabled) {
		var btn = document.getElementById("toggle");
		btn.addEventListener("click", function(event) {
			if (!document.fullscreenElement) {
				document.documentElement.requestFullscreen();
			} else {
				document.exitFullscreen();
			}
		}, false);
		document.addEventListener("fullscreenchange", function(event) {
			console.log(event);
			btn.hidden = true;
			if (!document.fullscreenElement) {
				btn.innerText = "Activate fullscreen";
			} else {
				btn.innerText = "Exit fullscreen";
			}
		});
		document.addEventListener("fullscreenerror", function(event) {
			console.log(event);
		});
	}
</script>
<script type="text/javascript">
	// setInterval(async function() {
	// 	await getData();
	// }, 2000);
	getData();


	// อนุมัติฏีกา
	function B1(data) {
		var tb = $("#B1 > tbody");
		tb.empty();
		// count(data)
		$.each(data, function(index, obj) {
			var percent = (obj.count_date * 100) / 30;
			percent = percent >= 100 ? 100 : percent;

			if (obj.count_date > 30) {
				color = "#F73620";
			} else if (obj.count_date >= 8) {
				color = "#F4A261";
			} else if (obj.count_date >= 0) {
				color = "#2A9D8F";
			}

			var markup =
				"<tr>" +
				"<td>" + obj.no + "</td>" +
				"<td>" + obj.c_code_ref + "</td>" +
				"<td>" + obj.d_doc_date + "</td>" +
				"<td>" + obj.count_date + "</td>" +
				"<td><div class='color' style='width:" + percent + "%; background: " + color + ";'></td>" +
				"</tr>";
			tb.append(markup);
		});
		// 								<div class="color" style="width:100%; background: #F73620;">
		// 								<div class="color" style="width:100%; background: #E76F51;"></div>
		// 								<div class="color" style="width:100%; background: #F4A261;"></div>
		// 								<div class="color" style="width:100%; background: #E9C46A;"></div>
		// 								<div class="color" style="width:100%; background: #2A9D8F;"></div>
	};

	// ทักท้วง
	function B2(data) {
		var tb = $("#B2 > tbody");
		tb.empty();

		$.each(data, function(index, obj) {
			var percent = (obj.count_date * 100) / 30;
			percent = percent >= 100 ? 100 : percent;

			if (obj.count_date > 30) {
				color = "#F73620";
			} else if (obj.count_date >= 8) {
				color = "#F4A261";
			} else if (obj.count_date >= 0) {
				color = "#2A9D8F";
			}

			var markup =
				"<tr>" +
				"<td>" + obj.no + "</td>" +
				"<td>" + obj.c_code_ref + "</td>" +
				"<td>" + obj.d_doc_date + "</td>" +
				"<td>" + obj.count_date + "</td>" +
				"<td><div class='color' style='width:" + percent + "%; background: " + color + ";'></td>" +
				"</tr>";
			tb.append(markup);
		});
	};

	// หักงบประมาณ
	function B3(data) {
		var tb = $("#B3 > tbody");
		tb.empty();

		$.each(data, function(index, obj) {
			var percent = (obj.count_date * 100) / 30;
			percent = percent >= 100 ? 100 : percent;

			if (obj.count_date > 30) {
				color = "#F73620";
			} else if (obj.count_date >= 8) {
				color = "#F4A261";
			} else if (obj.count_date >= 0) {
				color = "#2A9D8F";
			}

			var markup =
				"<tr>" +
				"<td>" + obj.no + "</td>" +
				"<td>" + obj.c_code_ref + "</td>" +
				"<td>" + obj.c_approve + "</td>" +
				"<td>" + obj.d_doc_date + "</td>" +
				"<td>" + obj.count_date + "</td>" +
				"<td><div class='color' style='width:" + percent + "%; background: " + color + ";'></td>" +
				"</tr>";
			tb.append(markup);
		});
	};

	// จัดทำเช็ค
	function B4(data) {
		var tb = $("#B4 > tbody");
		tb.empty();

		$.each(data, function(index, obj) {
			var percent = (obj.count_date * 100) / 30;
			percent = percent >= 100 ? 100 : percent;

			if (obj.count_date > 30) {
				color = "#F73620";
			} else if (obj.count_date >= 8) {
				color = "#F4A261";
			} else if (obj.count_date >= 0) {
				color = "#2A9D8F";
			}

			var markup =
				"<tr>" +
				"<td>" + obj.no + "</td>" +
				"<td>" + obj.c_code_ref + "</td>" +
				"<td>" + obj.c_approve + "</td>" +
				"<td>" + obj.d_doc_date + "</td>" +
				"<td>" + obj.count_date + "</td>" +
				"<td><div class='color' style='width:" + percent + "%; background: " + color + ";'></td>" +
				"</tr>";
			tb.append(markup);
		});
	};

	// ทะเบียนจ่าย
	function B5(data) {
		var tb = $("#B5 > tbody");
		tb.empty();

		$.each(data, function(index, obj) {
			var percent = (obj.count_date * 100) / 30;
			percent = percent >= 100 ? 100 : percent;

			if (obj.count_date > 30) {
				color = "#F73620";
			} else if (obj.count_date >= 8) {
				color = "#F4A261";
			} else if (obj.count_date >= 0) {
				color = "#2A9D8F";
			}

			var markup =
				"<tr>" +
				"<td>" + obj.no + "</td>" +
				"<td>" + obj.c_code_ref + "</td>" +
				"<td>" + obj.c_approve + "</td>" +
				"<td>" + obj.d_doc_date + "</td>" +
				"<td>" + obj.count_date + "</td>" +
				"<td><div class='color' style='width:" + percent + "%; background: " + color + ";'></td>" +
				"</tr>";
			tb.append(markup);
		});
	};

	function getData() {
		$.ajax({
			url: "../api/List_RepDashboard.php",
			type: "POST",
			// data: {
			// 	type: "cm_imp_bank_dtl",
			// },
			success: function(result) {
				var obj = $.parseJSON(result);
				if (obj.debug == true) {
					B1(obj.B1);
					B2(obj.B2);
					B3(obj.B3);
					B4(obj.B4);
					B5(obj.B5);
				}
				// else {
				// 	$("#Ext_table > tbody:last").append("<td colspan='10'>ไม่พบข้อมูล</td>");
				// }
			}
		});
	}
</script>