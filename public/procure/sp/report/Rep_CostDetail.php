<?php
include("../api/List_RepBudgetDetail.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;
$DBNAME =  "NMU..";
$caption = "รายงานคุมการจองงบประมาณ ประจำปี " . ($_REQUEST["i_year"] + 543) . "";

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

		$f_budget = changeNumFormat($jObj["f_budget"]);
		$f_budget_adjust = changeNumFormat($jObj["f_budget_adjust"]);
		$f_budget_total = changeNumFormat($jObj["f_budget_total"]);
		$f_reserve_budget = changeNumFormat($jObj["f_reserve_budget"]);
		$f_reserve_budget_income = changeNumFormat($jObj["f_reserve_budget_income"]);
		$f_reserve_budget_income_finish = changeNumFormat($jObj["f_reserve_budget_income_Finish"]);

		$f_budget_period = changeNumFormat($jObj["f_budget_period"]);
		$f_budgetadjust_period = changeNumFormat($jObj["f_budgetadjust_period"]);
		$f_budget_period_total = changeNumFormat($jObj["f_budget_period_total"]);
		$f_reserve_period = changeNumFormat($jObj["f_reserve_period"]);
		$f_reserve_periodincome = changeNumFormat($jObj["f_reserve_periodincome"]);
		$f_reserve_periodfinish = changeNumFormat($jObj["f_reserve_periodfinish"]);

		$f_budget_income = changeNumFormat($jObj["f_budget_income"]);
		$f_income_transfer = changeNumFormat($jObj["f_income_transfer"]);
		$f_budget_income_total = changeNumFormat($jObj["f_budget_income_total"]);
		$f_reserve_income = changeNumFormat($jObj["f_reserve_income"]);
		$f_reserve_income_finish = changeNumFormat($jObj["f_reserve_income_finish"]);

		$f_working0 = changeNumFormat($jObj["f_working0"]);
		$f_return0 = changeNumFormat($jObj["f_return0"]);
		$f_working1 = changeNumFormat($jObj["f_working1"]);
		$f_return1 = changeNumFormat($jObj["f_return1"]);
		$f_working2 = changeNumFormat($jObj["f_working2"]);
		$f_return2 = changeNumFormat($jObj["f_return2"]);


		$f_sum_work_budget0 = changeNumFormat($jObj["f_sum_work_budget0"]);
		$f_sum_work_budget1 = changeNumFormat($jObj["f_sum_work_budget1"]);
		$f_sum_budget0 = changeNumFormat($jObj["f_sum_budget0"]);
		$f_sum_budget1 = changeNumFormat($jObj["f_sum_budget1"]);
		$f_sum_budget2 = changeNumFormat($jObj["f_sum_budget2"]);

		$f_sum_work_budget_period0 = changeNumFormat($jObj["f_sum_work_budget_period0"]);
		$f_sum_work_budget_period1 = changeNumFormat($jObj["f_sum_work_budget_period1"]);
		$f_sum_budget_period0 = changeNumFormat($jObj["f_sum_budget_period0"]);
		$f_sum_budget_period1 = changeNumFormat($jObj["f_sum_budget_period1"]);
		$f_sum_budget_period2 = changeNumFormat($jObj["f_sum_budget_period2"]);

		$f_sum_work_budget_income0 = changeNumFormat($jObj["f_sum_work_budget_income0"]);
		$f_sum_work_budget_income1 = changeNumFormat($jObj["f_sum_work_budget_income1"]);
		$f_sum_budget_income0 = changeNumFormat($jObj["f_sum_budget_income0"]);
		$f_sum_budget_income1 = changeNumFormat($jObj["f_sum_budget_income1"]);
		$f_sum_budget_income2 = changeNumFormat($jObj["f_sum_budget_income2"]);


		if ($jObj["i_type"] == 1) {
			$style = "";
			$c_sub = "";

			$para = "";
			$para .= $_SERVER["QUERY_STRING"];
			$para .= "&i_level={$jObj["i_level"]}";
			$para .= "&bg_expense_id={$jObj["bg_expense_id"]}";
			$para .= "&dc_cost_id={$_REQUEST["dc_cost_id"]}";
			$para .= "&d_date_start1={$_REQUEST["d_date_start1"]}";
			$para .= "&d_date_end1={$_REQUEST["d_date_end1"]}";
			$para .= "&d_date_start2={$_REQUEST["d_date_start2"]}";
			$para .= "&d_date_end2={$_REQUEST["d_date_end2"]}";
			$para .= "&i_year={$_REQUEST["i_year"]}";

			$para .= "&i_success=1";

			for ($i = 1; $i < $jObj["i_level"]; $i++) {
				$c_sub .= "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			}

			if ($jObj["i_level"] == 1) {
				$no = $jObj["no"];
				$c_name = "<b>" . $c_sub . $jObj["c_name"] . "</b>";
				$f_budget = "<b>" . $f_budget . "</b>";
				$f_budget_adjust = "<b>" . $f_budget_adjust . "</b>";
				$f_budget_total = "<b>" . $f_budget_total . "</b>";
				$f_reserve_budget = "<b>" . $f_reserve_budget . "</b>";
				$f_budget_income = "<b>" . $f_budget_income . "</b>";
				$f_reserve_budget_income = "<b>" . $f_reserve_budget_income . "</b>";
				$f_reserve_budget_income_finish = "<b>" . $f_reserve_budget_income_finish . "</b>";
				$f_income_transfer = "<b>" . $f_income_transfer . "</b>";
				$f_budget_income_total = "<b>" . $f_budget_income_total . "</b>";

				$f_budget_period = "<b>" . $f_budget_period . "</b>";
				$f_budgetadjust_period = "<b>" . $f_budgetadjust_period . "</b>";
				$f_budget_period_total = "<b>" . $f_budget_period_total . "</b>";
				$f_reserve_period = "<b>" . $f_reserve_period . "</b>";
				$f_reserve_periodincome = "<b>" . $f_reserve_periodincome . "</b>";
				$f_reserve_periodfinish = "<b>" . $f_reserve_periodfinish . "</b>";

				$f_budget_income = "<b>" . $f_budget_income . "</b>";
				$f_income_transfer = "<b>" . $f_income_transfer . "</b>";
				$f_budget_income_total = "<b>" . $f_budget_income_total . "</b>";
				$f_reserve_income = "<b>" . $f_reserve_income . "</b>";
				$f_reserve_income_finish = "<b>" . $f_reserve_income_finish . "</b>";

				$f_working0 = "<b>" . $f_working0 . "</b>";
				$f_return0 = "<b>" . $f_return0 . "</b>";
				$f_working1 = "<b>" . $f_working1 . "</b>";
				$f_return1 = "<b>" . $f_return1 . "</b>";
				$f_working2 = "<b>" . $f_working2 . "</b>";
				$f_return2 = "<b>" . $f_return2 . "</b>";

				$f_sum_work_budget0 = "<b>" . $f_sum_work_budget0 . "</b>";
				$f_sum_work_budget1 = "<b>" . $f_sum_work_budget1 . "</b>";
				$f_sum_budget0 = "<b>" . $f_sum_budget0 . "</b>";
				$f_sum_budget1 = "<b>" . $f_sum_budget1 . "</b>";
				$f_sum_budget2 = "<b>" . $f_sum_budget2 . "</b>";

				$f_sum_work_budget_period0 = "<b>" . $f_sum_work_budget_period0 . "</b>";
				$f_sum_work_budget_period1 = "<b>" . $f_sum_work_budget_period1 . "</b>";
				$f_sum_budget_period0 = "<b>" . $f_sum_budget_period0 . "</b>";
				$f_sum_budget_period1 = "<b>" . $f_sum_budget_period1 . "</b>";
				$f_sum_budget_period2 = "<b>" . $f_sum_budget_period2 . "</b>";

				$f_sum_work_budget_income0 = "<b>" . $f_sum_work_budget_income0 . "</b>";
				$f_sum_work_budget_income1 = "<b>" . $f_sum_work_budget_income1 . "</b>";
				$f_sum_budget_income0 = "<b>" . $f_sum_budget_income0 . "</b>";
				$f_sum_budget_income1 = "<b>" . $f_sum_budget_income1 . "</b>";
				$f_sum_budget_income2 = "<b>" . $f_sum_budget_income2 . "</b>";
			} else {
				$no = "";
				$c_name = $c_sub . "- " . $jObj["c_name"];
			}

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='left: 0px; position: sticky; background: #FFFFFF; border-collapse: separate;" . $style . "' align='center'>" . $no . "</td>";
			$tbody .= "<td style='left: 40px; position: sticky; background: #FFFFFF; border-collapse: separate; mso-number-format:\@;" . $style . "' align='center'>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='" . $style . "'nowrap>" . $c_name . "</td>";

			if ($_REQUEST["view_budget"] == 1) {
				// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Adjust.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_adjust . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_total  . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income_finish . "</td>";
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget0 . "</td>";
			}
			if ($_REQUEST["view_period"] == 1) {
				// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Period.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_period . "</a></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Period_Adjust.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budgetadjust_period . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_period_total . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_period . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_periodincome . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_periodfinish . "</td>";
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_period0 . "</td>";
			}

			if ($_REQUEST["view_income"] == 1) {
				// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Income.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_income . "</a></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_IncomeTransfer.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_income_transfer . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_total . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_income . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_income_finish . "</td>";
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_income0 . "</td>";
			}

			// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Dtl.php?{$para}&s_=1' target='Rep_RepBudgetControl_DTL'>" . $f_working0 . "</a></td>";
			// $tbody .= "<td style='" . $style . "' align='right'>" . $f_return0 . "</td>";
			// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Dtl.php?{$para}&s_=2' target='Rep_RepBudgetControl_DTL'>" . $f_working1 . "</a></td>";
			// $tbody .= "<td style='" . $style . "' align='right'>" . $f_return1 . "</td>";
			// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Dtl.php?{$para}&s_=3' target='Rep_RepBudgetControl_DTL'>" . $f_working2 . "</a></td>";
			// $tbody .= "<td style='" . $style . "' align='right'>" . $f_return2 . "</td>";

			if ($_REQUEST["view_budget"] == 1) {
				// if ($_REQUEST["i_show_sum_work"] == 1) {
				// 	$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_work_budget0 . "</td>";
				// 	$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_work_budget1 . "</td>";
				// }
				// $tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget1 . "</td>";
				// $tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget2 . "</td>";
			}

			if ($_REQUEST["view_period"] == 1) {
				// if ($_REQUEST["i_show_sum_work"] == 1) {
				// 	$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_work_budget_period0 . "</td>";
				// 	$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_work_budget_period1 . "</td>";
				// }
				// $tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_period1 . "</td>";
				// $tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_period2 . "</td>";
			}

			if ($_REQUEST["view_income"] == 1) {

				// if ($_REQUEST["i_show_sum_work"] == 1) {
				// 	$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_work_budget_income0 . "</td>";
				// 	$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_work_budget_income1 . "</td>";
				// }
				// $tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_income1 . "</td>";
				// $tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_income2 . "</td>";
			}
			$tbody .= "</tr>";
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' colspan=3 align='right'><b>" . $jObj["c_name"] . "</b></td>";

			if ($_REQUEST["view_budget"] == 1) {
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget . "</b></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_adjust . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_total  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_budget . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_budget_income . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_budget_income_finish . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget0 . "</b></td>";
			}
			if ($_REQUEST["view_period"] == 1) {
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_period . "</b></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budgetadjust_period . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_period_total . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_period . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_periodincome . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_periodfinish . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_period0 . "</b></td>";
			}

			if ($_REQUEST["view_income"] == 1) {
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_income . "</b></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_income_transfer . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_income_total . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_income . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_income_finish . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_income0 . "</b></td>";
			}

			// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_working0 . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_return0 . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_working1 . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_return1 . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_working2 . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_return2 . "</b></td>";

			if ($_REQUEST["view_budget"] == 1) {
				// if ($_REQUEST["i_show_sum_work"] == 1) {
				// 	$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_work_budget0 . "</b></td>";
				// 	$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_work_budget1 . "</b></td>";
				// }
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget1 . "</b></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget2 . "</b></td>";
			}

			if ($_REQUEST["view_period"] == 1) {
				// if ($_REQUEST["i_show_sum_work"] == 1) {
				// 	$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_work_budget_period0 . "</b></td>";
				// 	$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_work_budget_period1 . "</b></td>";
				// }
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_period1 . "</b></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_period2 . "</b></td>";
			}

			if ($_REQUEST["view_income"] == 1) {
				// if ($_REQUEST["i_show_sum_work"] == 1) {
				// 	$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_work_budget_income0 . "</b></td>";
				// 	$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_work_budget_income1 . "</b></td>";
				// }
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_income1 . "</b></td>";
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_income2 . "</b></td>";
			}
			$tbody .= "</tr>";
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

		$dc_cost_name = "หน่วยงานเจ้าของเรื่อง : <font color='blue'>เลือกทั้งหมด</font>";
		if ($_REQUEST["dc_cost_id"] > 0) {
			$dc_cost = $db->GetDataBySQL("SELECT c_name FROM  NMU_ERP.dbo.dc_cost WHERE dc_cost_id = ?", array($_REQUEST["dc_cost_id"])); //dc_cost
			$dc_cost_name = "หน่วยงานเจ้าของเรื่อง : <font color='blue'>" . $dc_cost . "</font>";
		}

		$name = "";
		$for_id = explode(";", $_REQUEST["bg_expense_id_lv{$_REQUEST["i_expense"]}"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam("SELECT c_name FROM {$DBNAME}bg_expense WHERE bg_expense_id IN (" . $in . ")", array());

			if ($stmt) {
				$i_c_name = 0;
				while ($row = $db->Fetch($stmt)) {
					if ($i_c_name <= 10) {
						$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
					}
					$i_c_name++;
				}
				$name .= $i_c_name > 10 ? ', ...(' . ($i_c_name - 10) . ')' : '';
			}
		} else {
			$name = "เลือกทั้งหมด";
		}
		$expense_name = "รายจ่าย Lv{$_REQUEST["i_expense"]} : <font color='blue'>{$name}</font>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		// echo "<div align='center'><strong><b>หักงบประมาณ</b>ระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start1"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end1"]) . "</strong></div>";
		// echo "<div align='center'><strong><b>เบิกจ่าย</b>รับระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start2"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end2"]) . "</strong></div>";
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $dc_cost_name ?></div>
			<div style='position: relative; left: 2px;'><?= $expense_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="left: 0px; position: sticky; z-index: 2; vertical-align:middle;  background: #E9E9E9; mso-number-format:\@;" rowspan="2" nowrap>ลำดับที่</th>
						<th style="left: 40px; position: sticky; z-index: 2; vertical-align:middle;  background: #E9E9E9; mso-number-format:\@;" rowspan="2" nowrap>รหัส</th>
						<th style="vertical-align:middle; background: #E9E9E9; mso-number-format:\@;" rowspan="2" nowrap>รายการ</th>
						<?php
						if ($_REQUEST["view_budget"] == 1) {
							echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" colspan=5 nowrap><b>วงเงินที่หน่วยงานเจ้าของเรื่องใช้ไป</b></th>';
						}
						if ($_REQUEST["view_period"] == 1) {
							echo '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" colspan=5 nowrap><b>เงินประจำงวด</b></th>';
						}
						if ($_REQUEST["view_income"] == 1) {
							echo '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" colspan=4 nowrap><b>เงินรายได้ที่รับจริง</b></th>';
						}
						// echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" colspan=2 nowrap>เงินขอเบิก</th>
						// <th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" colspan=2 nowrap>เงินหักงบประมาณ</th>
						// <th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" colspan=2 nowrap>เบิกจ่ายทั้งสิ้น</th>';
						// if ($_REQUEST["view_budget"] == 1) {
						// 	// if ($_REQUEST["i_show_sum_work"] == 1) {
						// 	// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#F8CBAD" rowspan="1" colspan=2 nowrap>เงินงบประมาณตามบัญชีจัดสรร<br>ระหว่างดำเนินการ</th>';
						// 	// }
						// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6" rowspan="1" colspan=1 nowrap>คงเหลือ<br>งบประมาณตามบัญชีจัดสรร<br></th>';
						// }
						// if ($_REQUEST["view_period"] == 1) {
						// 	// if ($_REQUEST["i_show_sum_work"] == 1) {
						// 	// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#BDD7EE;" rowspan="1" colspan=2 nowrap>เงินประจำงวด<br>ระหว่างดำเนินการ</th>';
						// 	// }
						// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" colspan=1 nowrap>คงเหลือ<br>เงินประจำงวด<br></th>';
						// }
						// if ($_REQUEST["view_income"] == 1) {
						// 	// if ($_REQUEST["i_show_sum_work"] == 1) {
						// 	// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#C6E0B4;" rowspan="1" colspan=2 nowrap>เงินรายได้ที่รับจริง<br>ระหว่างดำเนินการ</th>';
						// 	// }
						// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" colspan=1 nowrap>คงเหลือ<br>เงินรายได้ที่รับจริง<br></th>';
						// }
						?>
					</tr>
					<tr>
						<?php
						if ($_REQUEST["view_budget"] == 1) {
							echo 
							// '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;งบประมาณ<br>ตามบัญชีจัดสรร&nbsp;<br>(A1)</th>'.
							// '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>เพิ่ม / ลด<br>&nbsp;โอนเปลี่ยนแปลง&nbsp;<br>ตามบัญชีจัดสรร<br>(A2)</th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;บัญชีจัดสรรสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>เงินจอง<br>งบประมาณ<br>ตามบัญชีจัดสรร<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ตรวจรับ&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ทำเบิก&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;&nbsp;</th>'
						;}
						if ($_REQUEST["view_period"] == 1) {
							echo 
							// '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินประจำงวด&nbsp;<br>(B1)</th>'.
							// '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>เพิ่ม / ลด<br>&nbsp;โอนเปลี่ยนแปลง&nbsp;<br>เงินประจำงวด<br>(B2)</th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินประจำงวดสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>เงินจอง<br>เงินประจำงวด<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ตรวจรับ&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ทำเบิก&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;&nbsp;</th>'
						;}
						if ($_REQUEST["view_income"] == 1) {
							echo 
							// '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินที่ได้รับจริง&nbsp;<br>(C1)</th>'.
							// '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>เพิ่ม / ลด<br>&nbsp;โอนเปลี่ยนแปลง&nbsp;<br>เงินที่ได้รับจริง<br>(C2)</th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินที่ได้รับจริงสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ตรวจรับ&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>ทำเบิก</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;&nbsp;</th>';
						}
						// echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" nowrap>&nbsp;เงินขอเบิก&nbsp;<br>(D1)</th>
						// <th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" nowrap>&nbsp;รับคืน&nbsp;<br>(E1)</th>
						// <th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" nowrap>&nbsp;เงินหักงบประมาณ&nbsp;<br>(D2)</th>
						// <th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" nowrap>&nbsp;รับคืน&nbsp;<br>(E2)</th>
						// <th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" nowrap>&nbsp;เงินเบิกจ่าย&nbsp;<br>(D3)</th>
						// <th style="vertical-align:middle; mso-number-format:\@; background:#FFF2CC;" rowspan="1" nowrap>&nbsp;รับคืน&nbsp;<br>(E3)</th>';
						// if ($_REQUEST["view_budget"] == 1) {
						// 	// if ($_REQUEST["i_show_sum_work"] == 1) {
						// 	// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#F8CBAD;" rowspan="1" nowrap>เงินขอเบิก<br><b>รอหักงบประมาณ</b><br>&nbsp;(A3 + A4 + (D1 - E1)) - (D2 - E2)&nbsp;</th>
						// 	// 	<th style="vertical-align:middle; mso-number-format:\@; background:#F8CBAD;" rowspan="1" nowrap>เงินขอเบิก<br><b>รอเบิกจ่าย</b><br>&nbsp;(A3 + A4 + (D1 - E1)) - (D3 - E3)&nbsp;</th>';
						// 	// }
						// 	echo 
						// 	'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;(A1 + A2) - (A3 + A4) - (D1 - E1)&nbsp;</th>'
						// 	// '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>คงเหลือหลัง<br><b>หักงบประมาณ</b><br>&nbsp;(A1 + A2) - (D2 - E2)&nbsp;</th>'.
						// 	// '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>คงเหลือหลัง<br><b>เบิกจ่าย</b><br>&nbsp;(A1 + A2) - (D3 - E3)&nbsp;</th>'
						// 	;
						// }
						// if ($_REQUEST["view_period"] == 1) {
						// 	// if ($_REQUEST["i_show_sum_work"] == 1) {
						// 	// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#BDD7EE;" rowspan="1" nowrap>เงินขอเบิก<br><b>รอหักงบประมาณ</b><br>&nbsp;(B3 + B4 + (D1 - E1)) - (D2 - E2)&nbsp;</th>
						// 	// 	<th style="vertical-align:middle; mso-number-format:\@; background:#BDD7EE;" rowspan="1" nowrap>เงินขอเบิก<br><b>รอเบิกจ่าย</b><br>&nbsp;(B3 + B4 + (D1 - E1)) - (D3 - E3)&nbsp;</th>';
						// 	// }
						// 	echo 
						// 	'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;(B1 + B2) - (B3 + B4) - (D1 - E1)&nbsp;</th>'
						// 	// '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>คงเหลือหลัง<br><b>หักงบประมาณ</b><br>&nbsp;(B1 + B2) - (D2 - E2)&nbsp;</th>'
						// 	// '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>คงเหลือหลัง<br><b>เบิกจ่าย</b><br>&nbsp;(B1 + B2) - (D3 - E3)&nbsp;</th>'
						// 	;
						// }
						// if ($_REQUEST["view_income"] == 1) {
						// 	// if ($_REQUEST["i_show_sum_work"] == 1) {
						// 	// 	echo '<th style="vertical-align:middle; mso-number-format:\@; background:#C6E0B4;" rowspan="1" nowrap>เงินขอเบิก<br><b>รอหักงบประมาณ</b><br>&nbsp;(ฺC3 + (D1 - E1)) - (D2 - E2)&nbsp;</th>
						// 	// 	<th style="vertical-align:middle; mso-number-format:\@; background:#C6E0B4;" rowspan="1" nowrap>เงินขอเบิก<br><b>รอเบิกจ่าย</b><br>&nbsp;(C3 + (D1 - E1)) - (D3 - E3)&nbsp;</th>';
						// 	// }
						// 	echo 
						// 	'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;(C1 + C2) - (C3) - (D1 - E1)&nbsp;</th>'
						// 	// '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>คงเหลือหลัง<br><b>หักงบประมาณ</b><br>&nbsp;(C1 + C2) - (D2 - E2)&nbsp;</th>'.
						// 	// '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>คงเหลือหลัง<br><b>เบิกจ่าย</b><br>&nbsp;(C1 + C2) - (D3 - E3)&nbsp;</th>'
						// 	;
						// }
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