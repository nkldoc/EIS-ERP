<?php
include("../api/List_DetailByType.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$th_year = $_REQUEST["year_en"] + 543;

$caption = "รายงานพัสดุ " . $th_year;

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}
$randomNumber = rand(0, 99999); // Generates a random number between 0 and 99999
$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	// $c_code = $jObj["c_code"];

	$tbody = "<tbody>";

	$str_sum = "";
	foreach ($data_dtl["data"] as $index => $jObj) {
		// สมมุติว่าคุณมี array ข้อมูล
		$prNumbers = array_column($data_dtl["data"], 'c_code'); // รวมเลข PR ทั้งหมด
		$duplicates = array_filter(array_count_values($prNumbers), function ($count) {
			return $count > 1;
		});
		// $isDuplicate = isset($duplicates[$jObj["c_code"]]);
		$bgColor = (isset($jObj["c_code"]) && isset($duplicates[$jObj["c_code"]]))
			? "background-color: rgb(107, 237, 46);"
			: "";

		if ($jObj["i_type"] == 1) {
			$style = "";
			$para = "";
			// $para .= $_SERVER["QUERY_STRING"];
			$para .= "&i_type=1";
			$para .= "&sp_tor_id={$jObj["sp_tor_id"]}";
			// GEN TBODY
			$tbody .= "<tr style=\"$bgColor\">";
			$tbody .= "<td style='" . $style . "' align='center'><input type='checkbox' class='row-check' value='" . $jObj['i_type'] . "' onchange='updateTotal()'></td>";
			// $tbody .= "<td style='" . $style . "' align='center'><input type='checkbox' class='row-check' value='1'></td>";
			$tbody .= "<td style='" . $style . "' align='center'>" . $jObj["no"] . "</td>";
			// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["c_code"] . "</a></td>";
			// $tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["sp_tor_id"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_enabled"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_bg"] . "</td>";
			$tbody .= "<td nowrap style='$style $bgColor' align='CENTER'>" . $jObj["c_code"] . "</td>";
			// $tbody .= "<td nowrap style='" . $style . "' align='CENTER'>" . $jObj["c_arrive_code"] . "</td>";
			// $tbody .= "<td nowrap style='" . $style . "' align='CENTER'>" . $jObj["po_working_hdr_id"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["po_code"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_contract"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='CENTER'>" . $jObj["i_product_type"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='CENTER'>" . $jObj["i_purchase"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_department"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["sp_emp"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["tor_type"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["sp_status_hdr"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_cost2_id"] . "</td>";
			// $tbody .= "<td style='" . $style . "' align='left'><a href='.../../../../../reports/repSpContractPeriodnotorNewBg?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_name"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["po_expense"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_expense_budget_type"] . "</td>";

			// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Contract.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";

			$tbody .= "<td nowrap style='" . $style . "' align='CENTER'>" . $jObj["i_pr_year"] . "</td>";
			// $tbody .= "<td nowrap style='" . $style . "' align='center'>" . ($_REQUEST["i_pr_year"] + 543) . "</td>";
			// $tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_expense_budget_type"] . "</td>";
			// $tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["bg_expense"] . "</td>";
			$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_amt"], 2)  . "</td>";

			$tbody .= "</tr>";
		} else {
			$style = "background-color:#EEE;";
			// GEN TBODY
			$tbody .= "<tr>";

			$tbody .= "<td  style='" . $style . "' align='right'><b>ยอดรวมที่เลือก: <strong id='totalSum'>0</strong></b></td>";
			$tbody .= "<td colspan=" .  "17" . " style='" . $style . "' align='right'><b>{$jObj["c_name"]}</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_amt_sum"], 2)  . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_contract"], 2)  . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_sum"], 2)  . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_pr_contract"], 2)  . "</b></td>";
			$tbody .= "<td style='" . $style . "'></td>";
			$tbody .= "</tr>";
		}
	}
	$tbody .= "</tbody>";
}
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
	<!-- <script src="js/chart-handler.js"></script> -->
	<!-- <script src="js/dark-mode.js"></script> -->

</head>

<body>
	<div class="outer">
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";
		?>
		<div style="text-align: right; margin-bottom: 15px;">
			<form action="Rep_DetailByType.php" method="post">
				<input type="hidden" name="year" value="<?php echo $selectedYear; ?>">
				<input type="hidden" name="type" value="<?php echo $selectedType; ?>">
				<input type="hidden" name="type" value="excel">
				<button type="submit" class="btn-export">📥 ดาวน์โหลด Excel</button>
			</form>
		</div>
		<div style="text-align: right; margin-bottom: 10px;">
			<button onclick="toggleDarkMode()" id="darkModeBtn">🌙 เปิดโหมดกลางคืน</button>
		</div>
		<th><input type="checkbox" id="selectAll"></th>

		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ตรวจสอบข้อมูล</th>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" nowrap>สถานะ</th>
						<th style="vertical-align:middle;" nowrap>ประเภท PR</th>
						<th style="vertical-align:middle;" nowrap>เลขที่ PR</th>
						<th style="vertical-align:middle;" nowrap>เลขที่ สัญญา</th>
						<th style="vertical-align:middle;" nowrap>ประเภทสัญญา</th>
						<th style="vertical-align:middle;" nowrap>ประเภทของที่ได้มา</th>
						<th style="vertical-align:middle;" nowrap>ประเภทงาน</th>
						<th style="vertical-align:middle;" nowrap>สายงาน</th>
						<th style="vertical-align:middle;" nowrap>ผู้รับผิดชอบงาน</th>
						<th style="vertical-align:middle;" nowrap>วิธีการดำเนินงาน</th>
						<th style="vertical-align:middle;" nowrap>เมนู</th>
						<th style="vertical-align:middle;" nowrap>หน่วยงานเจ้าของเรื่อง</th>
						<th style="vertical-align:middle;" nowrap>ชื่อรายการ</th>
						<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" nowrap>หมวดค่าใช้จ่าย</th>

						<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงิน</th>
						<!-- <th style="vertical-align:middle;" nowrap>เมนู</th>
						<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>
						<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" nowrap>รายการย่อย</th>
						<th style="vertical-align:middle;" nowrap>จำนวนPR</th>
						<th style="vertical-align:middle;" nowrap>จำนวนที่ทำสัญญา</th>
						<th style="vertical-align:middle;" nowrap>จำนวนที่เบิก</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงิน</th> -->
						<!-- <th style="vertical-align:middle;" nowrap>หมายเหตุ</th> -->
					</tr>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
	</div>
</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>