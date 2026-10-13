<?php
include("../api/List_RepBudgetOverlap.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;
$th_year = $_REQUEST["i_year"] + 543;
if ($_REQUEST["i_status"] == 11) {
	$caption = "รายงานสรุปเงินกันเหลื่อมปี (เบิกจ่ายแล้ว)<br>งบประมาณประจำปี " . $th_year;
} else {
	$caption = "รายงานสรุปเงินกันเหลื่อมปี (หักงบประมาณ)<br>งบประมาณประจำปี " . $th_year;
}

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	$str_sum = "";
	foreach ($data_dtl["data"] as $index => $jObj) {

		if ($jObj["i_level"] == 0) { // Sum
			$style = "style='text-align:right; background-color:#EEE;	'";
			// GEN TBODY
			$f_budget = (($jObj["f_budget"] > 0) ? number_format($jObj["f_budget"], 2) : "-");
			$f_total = (($jObj["f_total"] > 0) ? number_format($jObj["f_total"], 2) : "-");
			$f_cancel = (($jObj["f_cancel"] > 0) ? number_format($jObj["f_cancel"], 2) : "-");
			$f_sum = (($jObj["f_sum"] > 0) ? number_format($jObj["f_sum"], 2) : "-");
			$f_percent = (($jObj["f_percent"] > 0) ? ceil($jObj["f_percent"]) . "%" : "-");

			$c_name = "<b>" . $jObj["c_name"] . "</b>";
			$f_budget = "<b>" . $f_budget . "</b>";
			$f_total = "<b>" . $f_total . "</b>";
			$f_cancel = "<b>" . $f_cancel . "</b>";
			$f_sum = "<b>" . $f_sum . "</b>";
			$f_percent = "<b>" . $f_percent . "</b>";

			$str_sum .= "<tr>";
			$str_sum .= "<td " . $style . " colspan=3>" . $c_name . "</td>";
			$str_sum .= "<td " . $style . " align='right'>" . $f_budget  . "</td>";
			$str_sum .= "<td " . $style . " align='right'>" . $f_total . "</td>";
			$str_sum .= "<td " . $style . " align='right'>" . $f_cancel . "</td>";
			$str_sum .= "<td " . $style . " align='right'>" . $f_sum . "</td>";
			$str_sum .= "<td " . $style . " align='right'>" . $f_percent . "</td>";
			$str_sum .= "<td " . $style . " align='right'>&nbsp;</td>";
			$str_sum .= "</tr>";
		} else {
			$style = "";

			// GEN TBODY
			$c_sub = "";
			for ($i = 1; $i < $jObj["i_level"]; $i++) {
				$c_sub .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			}

			$f_budget = (($jObj["f_budget"] > 0) ? number_format($jObj["f_budget"], 2) : "-");
			$f_total = (($jObj["f_total"] > 0) ? number_format($jObj["f_total"], 2) : "-");
			$f_cancel = (($jObj["f_cancel"] > 0) ? number_format($jObj["f_cancel"], 2) : "-");
			$f_sum = (($jObj["f_sum"] > 0) ? number_format($jObj["f_sum"], 2) : "-");
			$f_percent = (($jObj["f_percent"] > 0) ? ceil($jObj["f_percent"]) . "%" : "-");

			if ($jObj["i_level"] == 1) {
				$style .= "background: #f1f1f1;";

				$no = $jObj["no"];
				$c_name = "<b>" . $jObj["c_name"] . "</b>";
				$f_budget = "<b>" . $f_budget . "</b>";
				$f_total = "<b>" . $f_total . "</b>";
				$f_cancel = "<b>" . $f_cancel . "</b>";
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
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget  . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_total . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_cancel . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_sum . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . $f_percent . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>&nbsp;</td>";
			$tbody .= "</tr>";
		}
	}

	$tbody .= $str_sum;
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
		$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$budget_type = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
			$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
		}

		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong>จ่ายเงินระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<div style='position: relative; font-size: 11px; margin: 5px 10px;'>
			<div style='position: relative; left: 2px;'><?= $budget_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" rowspan="2" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" rowspan="2" nowrap>รหัส</th>
						<th style="vertical-align:middle;" rowspan="2" nowrap>รายการ</th>
						<th style="vertical-align:middle;" rowspan="2" nowrap>จำนวนเงิน</th>
						<th style="vertical-align:middle;" rowspan="2" nowrap><?= (($_REQUEST["i_status"] == 11) ? "เบิกจ่ายแล้ว" : "หักงบประมาณ"); ?></th>
						<th style="vertical-align:middle;" rowspan="2" nowrap>ยกเลิกไม่เบิกจ่าย</th>
						<th style="vertical-align:middle;" rowspan="2" nowrap>จำนวนเงินคงเหลือ<br>หลังเบิกจ่ายและ<br>สิ้นสุดโครงการ</th>
						<th style="vertical-align:middle;" colspan="2">ร้อยละความสำเร็จ</th>
					</tr>
					<tr>
						<th style='vertical-align:middle;'>การเบิกจ่าย<br>ผลที่ได้ (%)</th>
						<th style='vertical-align:middle;'>ผลที่ได้ (%)<br>ครั้งที่ผ่านมา</th>
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