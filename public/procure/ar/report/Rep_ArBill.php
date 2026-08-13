<?php
include("../api/List_RepArBill.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานข้อมูลใบเรียกเก็บเงิน";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {
		if ($jObj["i_type"] == 2) {
			$style = "background: #e9f5f9;";
			// GEN TBODY
			$tbody .= "<tr style='" . $style . "'>";
			$tbody .= "<td colspan=11 align='right'><b>" . $jObj["ar_treat_right_name"] . "</b></td>";
			$tbody .= "<td align='right' nowrap><b>" . number_format($jObj["f_bill"], 2)  . "</b></td>";
			$tbody .= "<td align='right' nowrap></td>";
			$tbody .= "</tr>";
		} else if ($jObj["i_type"] == 3) {
			$style = "background: #fffdc6;";
			// GEN TBODY
			$tbody .= "<tr style='" . $style . "'>";
			$tbody .= "<td colspan=11 align='right'><b>รวมใบเรียกเก็บ {$jObj["c_code_bill"]}</b></td>";
			$tbody .= "<td align='right' nowrap><b>" . number_format($jObj["f_bill"], 2)  . "</b></td>";
			$tbody .= "<td align='right' nowrap></td>";
			$tbody .= "</tr>";
		} else if ($jObj["i_type"] == 4) {
			$style = "background: #a9a9a9;";
			// GEN TBODY
			$tbody .= "<tr style='" . $style . "'>";
			$tbody .= "<td colspan=11 align='right'><b>รวมทั้งสิ้น</b></td>";
			$tbody .= "<td align='right' nowrap><b>" . number_format($jObj["f_bill"], 2)  . "</b></td>";
			$tbody .= "<td align='right' nowrap></td>";
			$tbody .= "</tr>";
		} else {
			$style = "";
			// GEN TBODY
			$tbody .= "<tr style='" . $style . "'>";
			$tbody .= "<td align='center' nowrap>" . $jObj["numrow"] . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["ar_debtor_type_name"] . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["ar_treat_right_name"] . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["ar_cost_name"] . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["c_code_bill"] . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["d_bill_date"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center'>" . $jObj["c_hn"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='center'>" . $jObj["c_an"] . "</td>";
			$tbody .= "<td align='left' nowrap>" . $jObj["c_patient"] . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["d_service_date"] . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["d_encash_date"] . "</td>";
			$tbody .= "<td align='right' nowrap>" . number_format($jObj["f_bill"], 2)  . "</td>";
			$tbody .= "<td align='center' nowrap>" . $jObj["lastdate"] . "</td>";
			$tbody .= "</tr>";
		}
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
		if (@$_REQUEST["d_date_start"] != "" && @$_REQUEST["d_date_end"] != "") {
			echo "<div align='center'><strong>ระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		}
		?>
		<!-- <div style='position: relative; font-size: 11px; margin: 5px 10px;'>
			<div style='position: relative; left: 2px;'>d</div>
		</div> -->
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" nowrap>ประเภทลูกหนี้</th>
						<th style="vertical-align:middle;" nowrap>สิทธิ์การรักษา</th>
						<th style="vertical-align:middle;" nowrap>หน่วยงาน</th>
						<th style="vertical-align:middle;" nowrap>เลขที่เรียกเก็บ</th>
						<th style="vertical-align:middle;" nowrap>วันที่เรียกเก็บ</th>
						<th style="vertical-align:middle;" nowrap>HN</th>
						<th style="vertical-align:middle;" nowrap>AN</th>
						<th style="vertical-align:middle;" nowrap>ชื่อผู้ป่วย</th>
						<th style="vertical-align:middle;" nowrap>วันที่รับบริการ</th>
						<th style="vertical-align:middle;" nowrap>วันที่จำหน่าย</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงินเรียกเก็บ</th>
						<th style="vertical-align:middle;" nowrap>วันที่แก้ไขล่าสุด</th>
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