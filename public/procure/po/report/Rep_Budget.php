<?php
include("../api/List_RepBudget.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "ทะเบียนคุมการเบิกจ่ายเงินงบประมาณ ประจำปี " . ($_REQUEST["i_year"] + 543) . "";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

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

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {

		$f_budget = changeNumFormat($jObj["f_budget"]); // งบประมาณตามบัญชีจัดสรร
		$f_budget_adjust = changeNumFormat($jObj["f_budget_adjust"]); // เพิ่ม / ลด โอนเปลี่ยนแปลงบัญชีจัดสรร
		$f_budget_total = changeNumFormat($jObj["f_budget_total"]); // บัญชีจัดสรรสุทธิ
		$f_budget_income = changeNumFormat($jObj["f_budget_income"]); // เงินรายได้ที่ได้รับจริง
		$f_income_transfer = changeNumFormat($jObj["f_income_transfer"]); // โอนเปลี่ยนแปลง
		$f_budget_income_total = changeNumFormat($jObj["f_budget_income_total"]); // เงินรายได้หลังโอนเปลี่ยนแปลง
		$f_working = changeNumFormat($jObj["f_working"]); // เบิกจ่ายทั้งสิ้น
		$f_sum_budget = changeNumFormat($jObj["f_sum_budget"]); // คงเหลืองบประมาณตามบัญชีจัดสรร
		$f_sum_income = changeNumFormat($jObj["f_sum_income"]); // คงเหลือหลังเบิกจ่ายเงินรายได้ที่รับจริง

		// $f_percent_budget = (($jObj["f_percent_budget"] != 0) ? ceil($jObj["f_percent_budget"]) . "%" : "-"); //ร้อยละความสำเร็จจากงบประมาณตามบัญชีจัดสรร
		// $f_percent_income = (($jObj["f_percent_income"] != 0) ? ceil($jObj["f_percent_income"]) . "%" : "-"); //ร้อยละความสำเร็จจากยอดเงินรายได้ที่รับจริง

		if ($jObj["i_type"] == 1) {
			$style = "";
			$c_sub = "";

			$para = "";
			$para .= $_SERVER["QUERY_STRING"];
			$para .= "&i_level={$jObj["i_level"]}";
			$para .= "&po_expense_id={$jObj["po_expense_id"]}";
			$para .= "&d_date_start={$_REQUEST["d_date_start"]}";
			$para .= "&d_date_end={$_REQUEST["d_date_end"]}";
			$para .= "&i_success=1";

			$f_budget_percent = (($jObj["f_budget_percent"] > 0) ? ceil($jObj["f_budget_percent"]) . "%" : "-");
			$f_income_percent = (($jObj["f_income_percent"] > 0) ? ceil($jObj["f_income_percent"]) . "%" : "-");

			for ($i = 1; $i < $jObj["i_level"]; $i++) {
				$c_sub .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			}

			if ($jObj["i_level"] == 1) {
				$no = $jObj["no"];
				$c_name = "<b>" . $c_sub . $jObj["c_name"] . "</b>";
				$f_budget = "<b>" . $f_budget . "</b>";
				$f_budget_adjust = "<b>" . $f_budget_adjust . "</b>";
				$f_budget_total = "<b>" . $f_budget_total . "</b>";
				$f_budget_income = "<b>" . $f_budget_income . "</b>";
				$f_income_transfer = "<b>" . $f_income_transfer . "</b>";
				$f_budget_income_total = "<b>" . $f_budget_income_total . "</b>";
				$f_working = "<b>" . $f_working . "</b>";
				$f_sum_budget = "<b>" . $f_sum_budget . "</b>";
				$f_sum_income = "<b>" . $f_sum_income . "</b>";
				$f_budget_percent = "<b>" . $f_budget_percent . "</b>";
				$f_income_percent = "<b>" . $f_income_percent . "</b>";
			} else {
				$no = "";
				$c_name = $c_sub . "- " . $jObj["c_name"];
			}

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center'>" . $no . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center'>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='" . $style . "'>" . $c_name . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Adjust.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_adjust . "</a></td>";
			$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_budget_total  . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Income.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_income . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_IncomeTransfer.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_income_transfer . "</a></td>";
			$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_budget_income_total  . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Dtl.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_working . "</a></td>";
			$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget . "</td>";
			$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_income . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_percent . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_income_percent . "</td>";
			$tbody .= "</tr>";
		} else {
			$style = "text-align:right; background-color:#EEE;";

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' colspan=3 align='right'><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_adjust . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_total  . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_income . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_income_transfer . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_income_total  . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_working . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_income . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b></b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b></b></td>";
		}
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=14>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>

<body>
	<div class="outer">
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";

		$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$budget_type = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
			$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
		}

		$name = "";
		$for_id = explode(";", $_REQUEST["po_expense_id_lv{$_REQUEST["i_expense"]}"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam("SELECT c_name FROM dbo.po_expense WHERE po_expense_id IN (" . $in . ")", array());

			if ($stmt) {
				while ($row = $db->Fetch($stmt)) {
					$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
				}
			}
		} else {
			$name = "เลือกทั้งหมด";
		}
		$expense_name = "รายจ่าย Lv{$_REQUEST["i_expense"]} : <font color='blue'>{$name}</font>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong>ฝ่ายคลังรับระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $budget_name ?></div>
			<div style='position: relative; left: 2px;'><?= $expense_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>รหัส</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>รายการ</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>งบประมาณ<br>ตามบัญชีจัดสรร<br>(1)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>เพิ่ม / ลด<br>โอนเปลี่ยนแปลง<br>ตามบัญชีจัดสรร<br>(2)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>บัญชีจัดสรรสุทธิ<br>(1) + (2)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>เงินที่ได้รับจริง<br>(3)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>โอนเปลี่ยนแปลง<br>เงินที่ได้รับจริง<br>(4)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>เงินรายได้หลัง<br>โอนเปลี่ยนแปลง<br>(3) + (4)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>เบิกจ่ายทั้งสิ้น<br><br>(5)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>คงเหลืองบประมาณ<br>ตามบัญชีจัดสรร<br>(1 + 2) - (5)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan="2" nowrap>คงเหลือหลังเบิกจ่าย<br>เงินรายได้ที่รับจริง<br>(3 + 4) - (5)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" colspan="2">ร้อยละความสำเร็จ</th>
					</tr>
					<tr>
						<th style='vertical-align:middle; mso-number-format:\@;'>จากงบประมาณ<br>ตามบัญชีจัดสรร (%)</th>
						<th style='vertical-align:middle; mso-number-format:\@;'>จากยอดเงินรายได้<br>ที่รับจริง (%)</th>
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