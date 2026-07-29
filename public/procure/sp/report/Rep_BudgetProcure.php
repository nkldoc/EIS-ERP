<?php
include("../api/List_RepBudgetProcure.php");
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
		// $f_budget_adjust = changeNumFormat($jObj["f_budget_adjust"]);
		$f_budget								=	changeNumFormat($jObj["f_budget"]);
		$f_total_erp							=	changeNumFormat($jObj["f_total_erp"]);
		$f_total_pr_type1						=	changeNumFormat($jObj["f_total_pr_type1"]);
		$f_total_pr_type2						=	changeNumFormat($jObj["f_total_pr_type2"]);
		$f_sum_total_pr_type					=	changeNumFormat($jObj["f_sum_total_pr_type"]);
		$f_sum_budget0							=	changeNumFormat($jObj["f_sum_budget0"]);
		$f_sum_budget_erp							=	changeNumFormat($jObj["f_sum_budget_erp"]);

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
				$f_total_erp = "<b>" . $f_total_erp . "</b>";
				$f_total_pr_type1 = "<b>" . $f_total_pr_type1 . "</b>";
				$f_total_pr_type2 = "<b>" . $f_total_pr_type2 . "</b>";
				$f_sum_total_pr_type = "<b>" . $f_sum_total_pr_type . "</b>";
				$f_sum_budget0 = "<b>" . $f_sum_budget0 . "</b>";
				$f_sum_budget_erp = "<b>" . $f_sum_budget_erp . "</b>";

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
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_budget  . "</td>";
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_total_erp  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_total_pr_type1  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_total_pr_type2  . "</td>"; 
				$tbody .= "<td style='" . $style . "' align='right'>" . $f_sum_total_pr_type  . "</td>"; 
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget0 . "</td>";
				$tbody .= "<td style='" . $style . " background: #fcffc8;' align='right'>" . $f_sum_budget_erp . "</td>";
				// $tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_erp . "</b></td>";
			}
			$tbody .= "</tr>";
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' colspan=3 align='right'><b>" . $jObj["c_name"] . "</b></td>";

			if ($_REQUEST["view_budget"] == 1) {
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_budget  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_erp  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_pr_type1  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_total_pr_type2  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_total_pr_type  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget0 . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . $f_sum_budget_erp . "</b></td>";
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
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
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
								echo '<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" colspan=7 nowrap><b>งบประมาณตามบัญชีจัดสรร</b></th>';
							}
						?>
					</tr>
					<tr>
						<?php
						if ($_REQUEST["view_budget"] == 1) {
							echo 
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;บัญชีจัดสรรสุทธิ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>เงินเตรียมจอง<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>จัดสรรจองแผน<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>จัดสรรจองงวด<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap><br>รวมจอง<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>&nbsp;คงเหลือ&nbsp;<br></th>'.
							'<th style="vertical-align:middle; mso-number-format:\@; background:#FCE4D6;" rowspan="1" nowrap>คงเหลือหลัง<br><b>ขอเบิก +  เงินเตรียมจอง</b><br>&nbsp;&nbsp;</th>'

							;}
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