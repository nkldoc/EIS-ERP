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

		$f_total_erp = changeNumFormat($jObj["f_total_erp"]);
		$f_sum_budget_erp = changeNumFormat($jObj["f_sum_budget_erp"]);
		$f_sum_budget_erp1 = changeNumFormat($jObj["f_sum_budget_erp1"]);

		$f_total_rev = changeNumFormat($jObj["f_total_rev"]);
		$f_total_pr_type1 = changeNumFormat($jObj["f_total_pr_type1"]);
		$f_total_pr_type2 = changeNumFormat($jObj["f_total_pr_type2"]);

		if ($jObj["i_type"] == 1) {
			$style = "";
			$c_sub = "";
			$i_level = "4";
			$para = "";
			$para .= $_SERVER["QUERY_STRING"];
			$para .= "&i_level=4";
			$para .= "&bg_expense_id={$jObj["bg_expense_id"]}";
			// $para .= "&bg_expense_id={$_REQUEST["bg_expense_id_lv4"]}";
			$para .= "&dc_cost_id={$_REQUEST["dc_cost_id"]}";
			$para .= "&d_date_start1={$_REQUEST["d_date_start1"]}";
			$para .= "&d_date_end1={$_REQUEST["d_date_end1"]}";
			$para .= "&d_date_start2={$_REQUEST["d_date_start2"]}";
			$para .= "&d_date_end2={$_REQUEST["d_date_end2"]}";
			$para .= "&i_year={$_REQUEST["i_year"]}";
			$para .= "&i_erp=1";

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

				$f_total_erp 		  = "<b>" . $f_total_erp . "</b>";
				$f_sum_budget_erp 	  = "<b>" . $f_sum_budget_erp . "</b>";
				$f_sum_budget_erp1 	  = "<b>" . $f_sum_budget_erp1 . "</b>";


				$f_total_rev 	  = "<b>" . $f_total_rev . "</b>";
				$f_total_pr_type1 	  = "<b>" . $f_total_pr_type1 . "</b>";
				$f_total_pr_type2 	  = "<b>" . $f_total_pr_type2 . "</b>";

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
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_total  . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'><a href='".OST_HOST. '://' .NMU_HOST ."/bg/report/Rep_Budget_Adjust.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget_adjust . "</a></td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_total_pr_type1  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_total_pr_type2  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_total_rev  . "</td>"; 
				if($_REQUEST["view_budget_erp"] == 1){  $tbody .= "<td style='" . $style . "' align='right'>" . $f_total_erp  . "</td>"; }
				if($jObj["i_level"] == 4){
					$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_reserve_budget . "</a></td>";
				}else {
					$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget . "</td>";
				}
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_budget_income_finish . "</td>";
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget0 . "</td>";
				if($_REQUEST["view_budget_erp"] == 1){$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_erp1 . "</td>";}

			}
			if ($_REQUEST["view_period"] == 1) {
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_period_total . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_period . "</td>";
				if($_REQUEST["view_budget_erp"] == 1){  $tbody .= "<td style='" . $style . "' align='right'>" . $f_total_erp  . "</td>"; }
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_periodincome . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_periodfinish . "</td>";
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_period0 . "</td>";
				if($_REQUEST["view_budget_erp"] == 1){$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_erp . "</td>";}

			}

			if ($_REQUEST["view_income"] == 1) {
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget_income_total . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_income . "</td>";
				// $tbody .= "<td style='" . $style . "' align='right'>" . $f_reserve_income_finish . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'><a href='".OST_HOST. '://' .NMU_HOST ."/bg/report/Rep_Budget_Dtl.php?{$para}&s_=1' target='Rep_RepBudgetControl_DTL'>" . $f_reserve_income_finish . "</a></td>";
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_income0 . "</td>";
			}
			if ($_REQUEST["view_budget"] == 1) {
			}
			if ($_REQUEST["view_period"] == 1) {
			}
			if ($_REQUEST["view_income"] == 1) {
			}
			$tbody .= "</tr>";
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' colspan=3 align='right'><b>" . $jObj["c_name"] . "</b></td>";

			if ($_REQUEST["view_budget"] == 1) {
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_total  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_adjust . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_pr_type1  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_pr_type2  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_rev  . "</b></td>";
				if($_REQUEST["view_budget_erp"] == 1) {$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_erp  . "</b></td>";}
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_budget . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_budget_income . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_budget_income_finish . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget0 . "</b></td>";
				if($_REQUEST["view_budget_erp"] == 1){$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_erp1 . "</b></td>";}
			}
			if ($_REQUEST["view_period"] == 1) {
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_period_total . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_period . "</b></td>";
				if($_REQUEST["view_budget_erp"] == 1) {$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_erp  . "</b></td>";}
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_periodincome . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_periodfinish . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_period0 . "</b></td>";
				if($_REQUEST["view_budget_erp"] == 1){$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_erp . "</b></td>";}

			}

			if ($_REQUEST["view_income"] == 1) {
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget_income_total . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_income . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_reserve_income_finish . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_income0 . "</b></td>";
			}
			if ($_REQUEST["view_budget"] == 1) {
			}

			if ($_REQUEST["view_period"] == 1) {
			}

			if ($_REQUEST["view_income"] == 1) {
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

		$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$budget_type = $db->GetDataBySQL("SELECT c_name FROM {$DBNAME} dc_expense_budget_type WHERE dc_expense_budget_type_id = ?", array($_REQUEST["dc_expense_budget_type_id"]));
			$budget_name = "แหล่งเงิน : <font color='blue'>" . $budget_type . "</font>";
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
		<div style="position: relative; font-size: 15px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $budget_name ?></div>
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
							if($_REQUEST["view_budget_erp"] == 1){
								echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" colspan=11 nowrap><b>งบประมาณตามบัญชีจัดสรร</b></th>';
								} else {
								echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" colspan=9 nowrap><b>งบประมาณตามบัญชีจัดสรร</b></th>';
								}
							}
						if ($_REQUEST["view_period"] == 1) {
							if($_REQUEST["view_budget_erp"] == 1){
								echo '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" colspan=7 nowrap><b>เงินประจำงวด</b></th>';
							} else {
							echo '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" colspan=5 nowrap><b>เงินประจำงวด</b></th>';
							}
						}
						if ($_REQUEST["view_income"] == 1) {
							echo '<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" colspan=4 nowrap><b>เงินรายได้ที่รับจริง</b></th>';
						}
						?>
					</tr>
					<tr>
						<?php
						if ($_REQUEST["view_budget"] == 1) {
							if($_REQUEST["view_budget_erp"] == 1){
								$background_erp1 = '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>เงินเตรียมจอง<br></th>';
								$background_erp2 = '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก +  เงินเตรียมจอง</b><br>&nbsp;&nbsp;</th>';
							} else {
								$background_erp1 = '';
								$background_erp2 = '';
							}
							echo 
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;บัญชีจัดสรรสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>เพิ่ม / ลด<br>&nbsp;โอนเปลี่ยนแปลง&nbsp;<br>ตามบัญชีจัดสรร<br>(A2)</th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>จัดสรรจองแผน<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>จัดสรรจองงวด<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>รวมจอง<br></th>'.
							$background_erp1.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>เงินจอง<br>งบประมาณ<br>ตามบัญชีจัดสรร<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ตรวจรับ&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ทำเบิก&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;&nbsp;</th>'.
							$background_erp2
							;}
						if ($_REQUEST["view_period"] == 1) {
							if($_REQUEST["view_budget_erp"] == 1){
								$background_erp = '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินเตรียมจอง&nbsp;<br></th>' ;
								$background_erp_sum = '<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก + เงินเตรียมจอง</b><br>&nbsp;&nbsp;</th>' ;
							} else {
								$background_erp =' ';
								$background_erp_sum = ' ';
							}
							echo 
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินประจำงวดสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>เงินจอง<br>เงินประจำงวด<br></th>'.
							$background_erp.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ตรวจรับ&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ทำเบิก&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#D9E1F2;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;&nbsp;</th>'.
							$background_erp_sum
							;}
						if ($_REQUEST["view_income"] == 1) {
							echo 
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินที่ได้รับจริงสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>&nbsp;ตรวจรับ&nbsp;</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>&nbsp;เงินพัสดุ&nbsp;<br><b>ทำเบิก</b><br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#E2EFDA;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก</b><br>&nbsp;&nbsp;</th>';
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