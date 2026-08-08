<?php
include("../api/List_Rep_Budget_PR.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

// $th_year = $_REQUEST["i_year"] + 543;

// $caption = "ทะเบียนคุมงบประมาณ ประจำปี " . $th_year;

// if ($_REQUEST["type"] == "excel") {
// 	$export->headerExcel($caption);
// }      
// PR25661000254.pdf
// $localhost = "http://192.168.201.198/sp_mn/api/upload/"; 
$randomNumber = rand(0, 99999); // Generates a random number between 0 and 99999
$data_dtl = json_decode(List_QueryParam(), true);
// echo('test');
// exit;

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	// $pr_code = $jObj["pr_code"];

	$tbody = "<tbody>";

	$str_sum = "";
	foreach ($data_dtl["data"] as $index => $jObj) {
		// echo($_REQUEST['i_type_bg']);
		// exit;
		if($_REQUEST['i_type_bg'] == 1) {
			if ($jObj["i_type"] == 1) {
				$style = "";
				$para = "";
				// $para .= $_SERVER["QUERY_STRING"];
				$para .= "&i_type=1";
				// $para .= "&sp_tor_contract_id={$jObj["sp_tor_contract_id"]}";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td style='" . $style . "' align='center'>" . $jObj["no"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["pr_code"] . "</a></td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["pr_code"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["po_code"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='.../../../../../reports/repSpContractPeriodnotorNewBg?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";
				// $tbody .= "<td style='" . $style . "' align='center'nowrap>" . $date->shot_date_from_db($jObj["d_create"]) . "</td>";

				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Contract.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";
				// if ($jObj["i_type_check"])
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_check"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_name"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["sp_status_hdr"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["emp_name"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='center'>" . ($jObj["i_year"] + 543) . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_expense_budget_type"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["bg_expense"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_pr"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_contract"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total"], 2)  . "</td>";

				$tbody .= "</tr>";
			} else {
				$style = "background-color:#EEE;";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td colspan=" .  "10" . " style='" . $style . "' align='right'><b>{$jObj["c_name"]}</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_pr"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_contract"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "'></td>";
				$tbody .= "</tr>";
			}
		} else if ($_REQUEST['i_type_bg'] ==  2){
			if ($jObj["i_type"] == 1) {
				$style = "";
				$para = "";
				// $para .= $_SERVER["QUERY_STRING"];
				$para .= "&i_type=1";
				// $para .= "&sp_tor_contract_id={$jObj["sp_tor_contract_id"]}";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td style='" . $style . "' align='center'>" . $jObj["no"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["pr_code"] . "</a></td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["pr_code"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["po_code"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='.../../../../../reports/repSpContractPeriodnotorNewBg?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";

				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Contract.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";
				// if ($jObj["i_type_check"])
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_check"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_name"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["sp_status_hdr"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["emp_name"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='center'>" . ($jObj["i_year"] + 543) . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_expense_budget_type"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["bg_expense"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_pr"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_contract"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total"], 2)  . "</td>";

				$tbody .= "</tr>";
			} else {
				$style = "background-color:#EEE;";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td colspan=" .  "10" . " style='" . $style . "' align='right'><b>{$jObj["c_name"]}</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_pr"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_contract"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "'></td>";
				$tbody .= "</tr>";
			}
		}else if ($_REQUEST['i_type_bg'] ==  3){
			if ($jObj["i_type"] == 1) {
				$style = "";
				$para = "";
				// $para .= $_SERVER["QUERY_STRING"];
				$para .= "&i_type=1";
				// $para .= "&sp_tor_contract_id={$jObj["sp_tor_contract_id"]}";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td style='" . $style . "' align='center'>" . $jObj["no"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["pr_code"] . "</a></td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["pr_code"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["po_code"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_arrive_code"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_code_check"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_code_ref"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='.../../../../../reports/repSpContractPeriodnotorNewBg?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";

				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Contract.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";
				// if ($jObj["i_type_check"])
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_pr"] . "</td>";
				// if ($jObj['i_type_rep'] != 0) {
					// $tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_check"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='.../../../../../reports/repSpContractPeriodnotorNewBg?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["i_type_check"] . "</a></td>";
				// } else{
					$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_check"] . "</td>";
				// } 
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_name"] . "</td>";
				// $tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["sp_status_hdr"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["emp_name"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='center'>" . ($jObj["i_year"] + 543) . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_expense_budget_type"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["bg_expense"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_contract"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_witdraw"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total"], 2)  . "</td>";

				$tbody .= "</tr>";
			} else {
				$style = "background-color:#EEE;";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td colspan=" .  "13" . " style='" . $style . "' align='right'><b>{$jObj["c_name"]}</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_contract"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_witdraw"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "'></td>";
				$tbody .= "</tr>";
			}
		}else if ($_REQUEST['i_type_bg'] ==  4){
			if ($jObj["i_type"] == 1) {
				$style = "";
				$para = "";
				// $para .= $_SERVER["QUERY_STRING"];
				$para .= "&i_type=1";
				// $para .= "&sp_tor_contract_id={$jObj["sp_tor_contract_id"]}";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td style='" . $style . "' align='center'>" . $jObj["no"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["pr_code"] . "</a></td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["pr_code"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["po_code"] . "</td>";
				// $tbody .= "<td style='" . $style . "' align='left'><a href='.../../../../../reports/repSpContractPeriodnotorNewBg?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";

				// $tbody .= "<td style='" . $style . "' align='left'><a href='./Rep_Budget_Contract.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $jObj["po_code"] . "</a></td>";
				// if ($jObj["i_type_check"])
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_pr"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["i_type_check"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["c_name"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["sp_status_hdr"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["emp_name"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='center'>" . ($jObj["i_year"] + 543) . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["dc_expense_budget_type"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='left'>" . $jObj["bg_expense"] . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_pr"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total_contract"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_total"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_winthdraw"], 2)  . "</td>";
				$tbody .= "<td nowrap style='" . $style . "' align='right'>" . number_format($jObj["f_remaining"], 2)  . "</td>";

				$tbody .= "</tr>";
			} else {
				$style = "background-color:#EEE;";
				// GEN TBODY
				$tbody .= "<tr>";
				$tbody .= "<td colspan=" .  "11" . " style='" . $style . "' align='right'><b>{$jObj["c_name"]}</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_pr"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total_contract"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_total"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_winthdraw"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_remaining"], 2)  . "</b></td>";
				$tbody .= "<td style='" . $style . "'></td>";
				$tbody .= "</tr>";
			}
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
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";
		?>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0"style="page-break-after: always;">
				<thead valign="top">
					<tr>
						<?php if($_REQUEST['i_type_bg'] == 1 || $_REQUEST['i_type_bg'] == 2  ){
						echo
						'<th style="vertical-align:middle;" nowrap>ลำดับที่</th>'.
						'<th style="vertical-align:middle;" nowrap>เลขที่ PR</th>'.
						'<th style="vertical-align:middle;" nowrap>เลขที่ สัญญา</th>'.
						'<th style="vertical-align:middle;" nowrap>เช็คข้อมูล</th>'.
						'<th style="vertical-align:middle;" nowrap>ชื่อรายการ</th>'.
						'<th style="vertical-align:middle;" nowrap>เมนู</th>'.
						'<th style="vertical-align:middle;" nowrap>ผู้รับผิดชอบงาน</th>'.
						'<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>'.
						'<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>'.
						'<th style="vertical-align:middle;" nowrap>รายการย่อย</th>'.
						'<th style="vertical-align:middle;" nowrap>จำนวนเงิน</th>'.
						'<th style="vertical-align:middle;" nowrap>จำนวนที่ทำสัญญา</th>'.
						'<th style="vertical-align:middle;" nowrap>จำนวนเงินจองงบประมาณ</th>'
						;} else if($_REQUEST['i_type_bg'] ==4  ){
							echo
							'<th style="vertical-align:middle;" nowrap>ลำดับที่</th>'.
							'<th style="vertical-align:middle;" nowrap>เลขที่ PR</th>'.
							'<th style="vertical-align:middle;" nowrap>เลขที่ สัญญา</th>'.
							'<th style="vertical-align:middle;" nowrap>เช็คข้อมูล</th>'.
							'<th style="vertical-align:middle;" nowrap>ประเภท PR</th>'.
							'<th style="vertical-align:middle;" nowrap>ชื่อรายการ</th>'.
							'<th style="vertical-align:middle;" nowrap>เมนู</th>'.
							'<th style="vertical-align:middle;" nowrap>ผู้รับผิดชอบงาน</th>'.
							'<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>'.
							'<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>'.
							'<th style="vertical-align:middle;" nowrap>รายการย่อย</th>'.
							'<th style="vertical-align:middle;" nowrap>จำนวนเงินPR</th>'.
							'<th style="vertical-align:middle;" nowrap>จำนวนที่ทำสัญญา</th>'.
							'<th style="vertical-align:middle;" nowrap>จำนวนที่จองทำสัญญา</th>'.
							'<th style="vertical-align:middle;" nowrap>จำนวนเงินเบิก</th>'.
							'<th style="vertical-align:middle;" nowrap>จำนวนเงินที่รอเบิก</th>'
						;}  else {
						echo
						'<th style="vertical-align:middle;" nowrap>ลำดับที่</th>'.
						'<th style="vertical-align:middle;" nowrap>เลขที่ PR</th>'.
						'<th style="vertical-align:middle;" nowrap>เลขที่ สัญญา</th>'.
						'<th style="vertical-align:middle;" nowrap>เลขที่รับของ</th>'.
						'<th style="vertical-align:middle;" nowrap>เลขที่ตรวจรับ</th>'.
						'<th style="vertical-align:middle;" nowrap>เลขที่ใบเบิก</th>'.
						'<th style="vertical-align:middle;" nowrap>ประเภท PR</th>'.
						'<th style="vertical-align:middle;" nowrap>เช็คข้อมูล</th>'.
						'<th style="vertical-align:middle;" nowrap>ชื่อรายการ</th>'.
						'<th style="vertical-align:middle;" nowrap>ผู้รับผิดชอบงาน</th>'.
						'<th style="vertical-align:middle;" nowrap>ปีงบประมาณ</th>'.
						'<th style="vertical-align:middle;" nowrap>แหล่งเงิน</th>'.
						'<th style="vertical-align:middle;" nowrap>หมวดค่าใช้จ่าย</th>'.
						'<th style="vertical-align:middle;" nowrap>จำนวนเงินสัญญา</th>'.
						'<th style="vertical-align:middle;" nowrap>เงินตรวจรับ</th>'.
						'<th style="vertical-align:middle;" nowrap>เงินเบิก</th>'
						;
						}
						?>

						<!-- <th style="vertical-align:middle;" nowrap>หมายเหตุ</th> -->
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