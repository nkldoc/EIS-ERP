<?php
include("../api/List_RepArDebtorType.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานประเภทลูกหนี้";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {
		$style = "";

		$c_enable = ($jObj["i_enable"] == 1) ? "<font color=green>ใช้งาน</font>" : "<font color=red>ไม่ใช้งาน</font>";

		// GEN TBODY
		$tbody .= "<tr style='" . $style . "'>";
		$tbody .= "<td align='center'>" . $jObj["numrow"] . "</td>";
		$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center'>" . $jObj["c_code"] . "</td>";
		$tbody .= "<td align='left'>" . $jObj["c_name"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["c_comment"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $c_enable . "</td>";
		$tbody .= "</tr>";
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=12>ไม่มีข้อมูล</td></tr></tbody>";
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
		// $budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 	$budget_type = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
		// 	$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
		// }

		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		// echo "<div align='center'><strong>ระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<!-- <div style='position: relative; font-size: 11px; margin: 5px 10px;'>
			<div style='position: relative; left: 2px;'>d</div>
		</div> -->
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" nowrap>รหัส</th>
						<th style="vertical-align:middle;" nowrap>ชื่อรายการ</th>
						<th style="vertical-align:middle;" nowrap>หมายเหตุ</th>
						<th style="vertical-align:middle;" nowrap>สถานะ</th>
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