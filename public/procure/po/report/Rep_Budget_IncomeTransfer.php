<?php
include("../api/List_RepBudget_IncomeTransfer.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

// $s_title = true;
// $title = CUSTOMER_NAME_TH;

// $th_year = $_REQUEST["i_year"] + 543;

// $caption = "ทะเบียนคุมงบประมาณ ประจำปี " . $th_year;

// if ($_REQUEST["type"] == "excel") {
// 	$export->headerExcel($caption);
// }

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	$str_sum = "";
	foreach ($data_dtl["data"] as $index => $jObj) {

		if ($jObj["i_type"] == 1) {
			$style = "";

			if ($jObj["i_status"] == 1) {
				$c_status = "<td style='" . $style . "' align='center'>โอนภายนอก</td>";
			} else if ($jObj["i_status"] == 2) {
				$c_status = "<td style='" . $style . "' align='left'>โอนให้ " . $jObj["parent_name"] . "</td>";
			} else if ($jObj["i_status"] == 3) {
				$c_status = "<td style='" . $style . "' align='left'>รับโอนจาก " . $jObj["parent_name"] . "</td>";
			}

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center'>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center'>" . ($jObj["i_budget_year_overlap"] + 543) . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'>" . $jObj["budget_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'>" . $jObj["c_name_lv4"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . number_format($jObj["f_increase"], 2)  . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . number_format($jObj["f_decrease"], 2)  . "</td>";
			$tbody .= $c_status;
			$tbody .= "</tr>";
		} else {
			$style = "background-color:#EEE;";
			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td colspan=4 style='" . $style . "' align='right'><b>{$jObj["c_name"]}</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_increase"], 2)  . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_decrease"], 2)  . "</b></td>";
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
</head>

<body>
	<div class="outer">
		<?php
		// if ($s_title == true)
		// 	echo "<div align='center'><strong>" . $title . "</strong></div>";

		// $budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 	$budget_type = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
		// 	$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
		// }

		// $name = "";
		// $for_id = explode(";", $_REQUEST["po_expense_id_lv{$_REQUEST["i_expense"]}"]);
		// if (!in_array("0", $for_id)) {
		// 	$in = "";
		// 	foreach ($for_id as $val) {
		// 		$in .= ($in == "") ? $val : ", " . $val;
		// 	}
		// 	$stmt = $db->QueryParam("SELECT c_name FROM dbo.po_expense WHERE po_expense_id IN (" . $in . ")", array());

		// 	if ($stmt) {
		// 		while ($row = $db->Fetch($stmt)) {
		// 			$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
		// 		}
		// 	}
		// } else {
		// 	$name = "เลือกทั้งหมด";
		// }
		// $expense_name = "รายจ่าย Lv{$_REQUEST["i_expense"]} : <font color='blue'>{$name}</font>";

		// echo "<div align='center'><strong>" . $caption . "</strong></div>";
		?>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>
						<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>
						<th style="vertical-align:middle;" nowrap>รายการย่อย</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงินเพิ่ม</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงินลด</th>
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