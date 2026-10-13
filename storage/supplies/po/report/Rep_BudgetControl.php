<?php
include("../api/List_RepBudgetControl.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$th_year = $_REQUEST["i_year"] + 543;

$caption = "ทะเบียนคุมงบประมาณ ประจำปี " . $th_year;

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
		$f_budget_adjust = changeNumFormat($jObj["f_budget_adjust"]); // โอนเปลี่ยนแปลงตามบัญชีจัดสรร
		$f_working = changeNumFormat($jObj["f_working"]); // หักงบประมาณ
		$f_sum = changeNumFormat($jObj["f_sum"]); // คงเหลืองบประมาณ

		if ($jObj["i_type"] == 1) {
			$style = "";

			$para = "";
			$para .= $_SERVER["QUERY_STRING"];
			$para .= "&i_level={$jObj["i_level"]}";
			$para .= "&po_expense_id={$jObj["po_expense_id"]}";
			$para .= "&d_date_start={$_REQUEST["d_date_start"]}";
			$para .= "&d_date_end={$_REQUEST["d_date_end"]}";

			$f_percent = (($jObj["f_percent"] > 0) ? ceil($jObj["f_percent"]) . "%" : "-");

			// GEN TBODY
			$c_sub = "";
			for ($i = 1; $i < $jObj["i_level"]; $i++) {
				$c_sub .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			}

			if ($jObj["i_level"] == 1) {
				$no = $jObj["no"];
				$c_name = "<b>" . $jObj["c_name"] . "</b>";
				$f_budget = "<b>" . $f_budget . "</b>";
				$f_budget_adjust = "<b>" . $f_budget_adjust . "</b>";
				$f_working = "<b>" . $f_working . "</b>";
				$f_sum = "<b>" . $f_sum . "</b>";
				$f_percent = "<b>" . $f_percent . "</b>";
			} else {
				$no = "";
				$c_name = $c_sub . "- " . $jObj["c_name"];
			}

			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center'>" . $no . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center'>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='" . $style . "'>" . $c_name . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Adjust.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_adjust . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Dtl.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_working . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_sum . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_percent . "</td>";
			$tbody .= "</tr>";
		} else {
			$style = "style='text-align:right; background-color:#EEE;'";
			// 	// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " colspan=3><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . $f_budget  . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . $f_budget_adjust  . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . $f_working . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . $f_sum . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b></b></td>";
			$tbody .= "</tr>";
		}
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=9>ไม่มีข้อมูล</td></tr></tbody>";
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
		echo "<div align='center'><strong>หักงบประมาณระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $budget_name ?></div>
			<div style='position: relative; left: 2px;'><?= $expense_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" nowrap>รหัส</th>
						<th style="vertical-align:middle;" nowrap>รายการ</th>
						<th style="vertical-align:middle;" nowrap>งบประมาณ<br>ตามบัญชีจัดสรร<br>(1)</th>
						<th style="vertical-align:middle;" nowrap>โอนเปลี่ยนแปลง<br>ตามบัญชีจัดสรร<br>(2)</th>
						<th style="vertical-align:middle;" nowrap>หักงบประมาณ<br>(3)</th>
						<th style="vertical-align:middle;" nowrap>คงเหลืองบประมาณ<br>(1 + 2) - (3)</th>
						<th style="vertical-align:middle;" nowrap>คิดเป็น %</th>
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