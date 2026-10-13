<?php
include("../api/List_RepPoBudgetHdrOverlap.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;
$caption = "รายงานใบขอกันเงินตั้งต้นปี " . ($_REQUEST["i_year"] + 543);

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";
	$no = 0;

	foreach ($data_dtl["data"] as $index => $jObj) {

		if ($jObj["i_type"] == 1) {
			$tbody .= "<tr>";
			$tbody .= "<td align='center' nowrap>" . (++$no) . "</td>";
			$tbody .= "<td align=center nowrap>" . $jObj["i_year"] . "</td>";
			$tbody .= "<td nowrap>" . $jObj["dc_expense_budget_type_name"] . "</td>";
			$tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $jObj["c_code_ref"] . "</td>";
			$tbody .= "<td nowrap>" . $jObj["c_expense_name"] . "</td>";
			$tbody .= "<td nowrap>" . $jObj["c_expense_group_name"] . "</td>";
			$tbody .= "<td align=right nowrap>" . number_format($jObj["f_total"], 2) . "</td>";
			$tbody .= "<td nowrap>" . $jObj["c_creditor"] . "</td>";
			$tbody .= "<td nowrap>" . $jObj["c_comment"] . "</td>";
			$tbody .= "</tr>";
		} else if ($jObj["i_type"] == 2) {
			$style = "style='background: #a5a5a5; font-weight:bold;'";
			$tbody .= "<tr>";
			$tbody .= "<td {$style} align=right nowrap colspan=6>รวม</td>";
			$tbody .= "<td {$style} align=right nowrap>" . number_format($jObj["f_total"], 2) . "</td>";
			$tbody .= "<td {$style} nowrap colspan=2></td>";
			$tbody .= "</tr>";
		}
	}

	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=31>ไม่มีข้อมูล</td></tr></tbody>";
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

		$dc_expense_budget_type_name = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? $dc_expense_budget_type_name = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id=?;", array($_REQUEST["dc_expense_budget_type_id"])) : "เลือกทั้งหมด";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		?>
		<div style='position: relative; font-size: 11px; margin: 5px 10px;'>
			<div style='position: relative; left: 2px;'>แหล่งเงิน : <?= $dc_expense_budget_type_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ลำดับ</th>
						<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>
						<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" nowrap>ใบขอกันเงินเลขที่</th>
						<th style="vertical-align:middle;" nowrap>รายจ่ายย่อย</th>
						<th style="vertical-align:middle;" nowrap>หมวดรายจ่าย</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงิน</th>
						<th style="vertical-align:middle;" nowrap>ชื่อเจ้าหนี้</th>
						<th style="vertical-align:middle;" nowrap>เหตุผลความจำเป็นที่ขอกันเงิน</th>
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