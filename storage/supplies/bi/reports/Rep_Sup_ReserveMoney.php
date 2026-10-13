<?php
include("../api/List_RepSupReserveMoney.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

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

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center'nowrap>" . $jObj["no"] . "</td>";
			if (($_REQUEST["i_reserve"] ?? "") == 2 || ($_REQUEST["i_reserve"] ?? "") == 3) {
				$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["wd_c_code_ref"] . "</td>";
			}
			$tbody .= "<td style='" . $style . "' align='left'nowrap>" . $jObj["sys_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'nowrap>" . $jObj["dc_cost_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'nowrap>" . $jObj["pr_type_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'nowrap>" . $jObj["dc_expense_budget_type_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'nowrap>" . $jObj["bg_expense_name"] . "</td>";
			$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["pr_c_code"] . "</td>";
			$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["pr_d_doc_ref"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'>" . $jObj["pr_c_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'>" . $jObj["type_bg_name"] . "</td>";
			$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["po_c_code"] . "</td>";
			if (($_REQUEST["i_reserve"] ?? "") == 2) {
				$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["chk_c_code"] . "</td>";
				$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["chk_c_doc_ref"] . "</td>";
			}
			if (($_REQUEST["i_reserve"] ?? "") == 3) {
				$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["chk_c_code"] . "</td>";
				$tbody .= "<td style=''mso-number-format:\@;" . $style . "' align='left'nowrap>" . $jObj["chk_c_doc_ref"] . "</td>";
			}
			$tbody .= "<td style='" . $style . "' align='right'nowrap>" . number_format($jObj["f_amt"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' align='center'nowrap>" . $date->shot_date_from_db($jObj["d_create"]) . "</td>";
			$tbody .= "</tr>";
		} else {
			$style = "background-color:#EEE;";
			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td colspan=" . (($_REQUEST["i_reserve"] ?? "") == 3 ? '14' : (($_REQUEST["i_reserve"] ?? "") == 2 ? '14' : '11')) . " style='" . $style . "' align='right'><b>{$jObj["c_name"]}</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_amt"], 2)  . "</b></td>";
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
	<style>
		:root {
			--nmu-blue: #1a4f8b;
			--nmu-blue-dark: #123a66;
			--nmu-blue-light: #eaf1fb;
			--nmu-border: #d7e0ea;
			--nmu-text: #2b3542;
			--nmu-total-bg: #fff4d6;
			--nmu-total-text: #7a5b00;
		}

		body {
			background: #f4f6f9;
			font-family: 'Sarabun', 'TH Sarabun New', Tahoma, sans-serif;
			color: var(--nmu-text);
			margin: 0;
			padding: 20px;
		}

		.outer {
			max-width: 100%;
			background: #ffffff;
			border-radius: 12px;
			box-shadow: 0 2px 10px rgba(20, 40, 70, 0.08);
			padding: 20px 24px 28px;
		}

		.report-header {
			text-align: center;
			padding-bottom: 14px;
			margin-bottom: 16px;
			border-bottom: 2px solid var(--nmu-blue-light);
		}

		.report-header .org-name {
			font-size: 20px;
			font-weight: 700;
			color: var(--nmu-blue-dark);
			letter-spacing: .2px;
		}

		.report-header .dept-name {
			font-size: 16px;
			font-weight: 600;
			color: var(--nmu-blue);
			margin-top: 2px;
		}

		.table-overflow {
			overflow-x: auto;
			border: 1px solid var(--nmu-border);
			border-radius: 8px;
		}

		table.table_report {
			border-collapse: separate;
			border-spacing: 0;
			width: 100%;
			font-size: 13px;
			background: #fff;
		}

		table.table_report thead th {
			position: sticky;
			top: 0;
			z-index: 2;
			background: var(--nmu-blue);
			color: #fff;
			font-weight: 600;
			padding: 10px 8px;
			border-right: 1px solid rgba(255, 255, 255, 0.15);
			white-space: nowrap;
			text-align: center;
		}

		table.table_report thead th:last-child {
			border-right: none;
		}

		table.table_report tbody td {
			padding: 7px 9px;
			border-bottom: 1px solid var(--nmu-border);
			vertical-align: middle;
		}

		table.table_report tbody tr:nth-child(odd) td {
			background: #fbfcfe;
		}

		table.table_report tbody tr:hover td {
			background: var(--nmu-blue-light) !important;
			transition: background .12s ease-in-out;
		}

		/* แถวยอดรวมย่อย/รวมทั้งสิ้น (i_type != 1) เดิมใช้ background-color:#EEE แบบ inline
		   เพิ่ม override ให้เด่นและอ่านง่ายขึ้นโดยไม่ต้องแก้ PHP ที่ generate tbody */
		table.table_report tbody tr td[style*="background-color:#EEE"] {
			background: var(--nmu-total-bg) !important;
			color: var(--nmu-total-text);
			border-top: 2px solid #f0c750;
			border-bottom: 2px solid #f0c750;
			font-size: 13.5px;
		}

		table.table_report tbody td[align="right"] {
			font-variant-numeric: tabular-nums;
		}

		@media print {
			body {
				background: #fff;
				padding: 0;
			}

			.outer {
				box-shadow: none;
				border-radius: 0;
				padding: 0;
			}

			table.table_report thead th {
				position: static;
			}
		}
	</style>
</head>

<body>
	<div class="outer">
		<?php

		if ($s_title == true) {
			$dc_cost_acc_id = $_REQUEST["dc_cost_acc_id"] ?? 0;
			$dc_cost_acc_name = $db->GetDataBySQL("SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = ?", array($dc_cost_acc_id, 4));
			echo "<div class='report-header'>";
			echo "<div class='org-name'>มหาวิทยาลัยนวมินทราธิราช</div>";
			echo "<div class='dept-name'>" . $dc_cost_acc_name . "</div>";
			echo "</div>";
		}

		// $budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 	$budget_type = $db->GetDataBySQL("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
		// 	$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
		// }

		// $name = "";
		// $for_id = explode(";", $_REQUEST["bg_expense_id_lv{$_REQUEST["i_expense"]}"]);
		// if (!in_array("0", $for_id)) {
		// 	$in = "";
		// 	foreach ($for_id as $val) {
		// 		$in .= ($in == "") ? $val : ", " . $val;
		// 	}
		// 	$stmt = $db->QueryParam("SELECT c_name FROM dbo.bg_expense WHERE bg_expense_id IN (" . $in . ")", array());

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

						<th style="vertical-align:middle;" nowrap>&nbsp;ลำดับที่&nbsp;</th>
						<?php
						if (($_REQUEST["i_reserve"] ?? "") == 2 || ($_REQUEST["i_reserve"] ?? "") == 3) {
							echo '<th style="vertical-align:middle;" nowrap>&nbsp;เลขที่ใบเบิก&nbsp;</th>';
						}
						?>
						<th style="vertical-align:middle;" nowrap>&nbsp;ระบบการจอง&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;หน่วยงาน&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;ประเภทการจอง&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;แหล่งเงิน&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;รายการย่อย&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;เลข PR&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;เลขอ้างอิง PR&nbsp;</th>
						<th style="vertical-align:middle;" width=450 nowrap>&nbsp;ชื่อ PR&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;ลักษณะการจองการ&nbsp;</th>
						<th style="vertical-align:middle;" nowrap>&nbsp;เลขอ้างอิงสัญญา PO&nbsp;</th>
						<?php
						if (($_REQUEST["i_reserve"] ?? "") == 2) {
							echo '<th style="vertical-align:middle;" nowrap>&nbsp;เลขที่ตรวจรับ&nbsp;</th>';
							echo '<th style="vertical-align:middle;" nowrap>&nbsp;เลขที่ใบแจ้งหนี้&nbsp;</th>';
						} else if (($_REQUEST["i_reserve"] ?? "") == 3) {
							echo '<th style="vertical-align:middle;" nowrap>&nbsp;เลขที่ตรวจรับ&nbsp;</th>';
							echo '<th style="vertical-align:middle;" nowrap>&nbsp;เลขที่ใบแจ้งหนี้&nbsp;</th>';
						}
						?>
						<th style="vertical-align:middle;" nowrap>&nbsp;จำนวนเงินจอง&nbsp;</th>
						<?php
						if (($_REQUEST["i_reserve"] ?? "") == 3) {
							echo '<th style="vertical-align:middle;" nowrap>&nbsp;วันที่เบิกจ่ายจริง&nbsp;</th>';
						} else {
							echo '<th style="vertical-align:middle;" nowrap>&nbsp;วันที่ทำรายการจอง&nbsp;</th>';
						}
						?>
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