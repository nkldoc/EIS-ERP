<?php
// สรุปรายงานยอดปริมาณการจัดซื้อจัดจ้าง — ดึงข้อมูลชุดเดียวกับ Budget_Monitoring_Dashboard
if (!defined('__VPRODUCT_')) define('__VPRODUCT_', time());
?>
<!DOCTYPE html>
<html lang="th">
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="shortcut icon" href="../../images/favicon.ico" type="image/x-icon">
	<title>แดชบอร์ดสรุปภาพรวมและประสิทธิภาพการจัดซื้อจัดจ้าง</title>
	<script src="../../ws_user/js/jquery.min.js"></script>
	<script src="../../js/echarts/echarts.js"></script>
	<link rel="stylesheet" type="text/css" href="../bootstrap/bootstrap-4.6.2-dist/css/bootstrap.min.css">
	<link rel="stylesheet" type="text/css" href="../css/Budget_Procurement_Summary.css?_dc<?= __VPRODUCT_; ?>">
</head>
<body>
<div class="ps-wrap">
	<div class="ps-title">
		<span>📊 แดชบอร์ดสรุปภาพรวมและประสิทธิภาพการจัดซื้อจัดจ้าง ประจำปีงบประมาณ <span id="psYearLabel">-</span></span>
		<select id="psYear" class="ps-year"></select>
	</div>

	<div id="psLoading" class="ps-loading">กำลังโหลดข้อมูล...</div>

	<div id="psBody" style="display:none">
		<div id="psFundBar" class="ps-fundbar"></div>

		<!-- KPI -->
		<div class="ps-kpis">
			<div class="ps-kpi">
				<div class="ps-kpi-t">งบประมาณจัดสรรรวม</div>
				<div class="ps-kpi-s" id="kpiBudgetSub">กรอบงบเงินเฉพาะรายการที่ทำสัญญา</div>
				<div class="ps-kpi-v" id="kpiBudget">-</div>
			</div>
			<div class="ps-kpi">
				<div class="ps-kpi-t">ยอดทำสัญญารวมจริง</div>
				<div class="ps-kpi-s">เฉพาะ จองสัญญา (PO) ตาม Dashboard งบประมาณ</div>
				<div class="ps-kpi-v" id="kpiContract">-</div>
			</div>
			<div class="ps-kpi ps-kpi-green">
				<div class="ps-kpi-t">ยอดเงินที่ประหยัดได้</div>
				<div class="ps-kpi-s" id="kpiSaveSub">-</div>
				<div class="ps-kpi-v ps-green" id="kpiSave">-</div>
			</div>
			<div class="ps-kpi">
				<div class="ps-kpi-t">จำนวนรายการจัดซื้อจัดจ้าง (PR)</div>
				<div class="ps-kpi-s" id="kpiCountSub">-</div>
				<div class="ps-kpi-v" id="kpiCount">-</div>
			</div>
		</div>

		<div class="ps-row">
			<div class="ps-col">
				<div class="ps-h">📌 สรุปเปรียบเทียบตามแผนและนอกแผน</div>
				<table class="ps-tbl" id="tblPlan"></table>
				<div class="ps-h ps-h2">📊 กราฟเปรียบเทียบงบประมาณจัดสรรกับยอดทำสัญญาจริง</div>
				<div id="chartPlan" class="ps-chart"></div>
			</div>
			<div class="ps-col">
				<div class="ps-h">📌 สรุปการใช้จ่ายแยกตามแหล่งเงินทุน</div>
				<table class="ps-tbl" id="tblFund"></table>
				<div class="ps-h ps-h2">🍩 สัดส่วนงบประมาณทำสัญญาแยกตามแหล่งเงินทุน</div>
				<div id="chartFund" class="ps-chart"></div>
			</div>
		</div>

		<div class="ps-row">
			<div class="ps-col ps-col-wide">
				<div class="ps-h">📌 สรุปการใช้จ่ายแยกตามประเภทค่าใช้จ่าย</div>
				<table class="ps-tbl" id="tblType"></table>
			</div>
			<div class="ps-col ps-col-narrow">
				<div class="ps-h">📊 กราฟยอดทำสัญญาแยกตามประเภทค่าใช้จ่าย</div>
				<div id="chartType" class="ps-chart ps-chart-tall"></div>
			</div>
		</div>
	</div>
</div>
<script type="text/javascript" src="../js/Budget_Procurement_Summary.js?_dc<?= __VPRODUCT_; ?>"></script>
</body>
</html>
