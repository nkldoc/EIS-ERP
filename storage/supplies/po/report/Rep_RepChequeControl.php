<?php
include("../api/List_RepChequeControl.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานทะเบียนคุมเช็ค";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	$str_sum = "";
	foreach ($data_dtl["data"] as $index => $jObj) {

		if ($jObj["i_type"] == 1) {
			$style = "";
			if ($jObj["i_status"] == 1) {
				$c_status = "<font color=green>สมบูรณ์</font>";
			} else if ($jObj["i_status"] == 2) {
				$c_status = "<font color=red>ยกเลิก</font>";
			} else {
				$c_status = "<font color=blue>รอดำเนินการ</font>";
			}

			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["d_doc_date"] . "</td>";
			if ($_REQUEST["i_report"] == 0) {
				$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["budget_name"] . "</td>";
			}
			$tbody .= "<td style='mso-number-format:\@;' align='center' nowrap>" . $jObj["c_approve"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["i_year"] . "</td>";
			$tbody .= "<td " . $style . " align='left'>" . $jObj["expense_name"] . "</td>";
			$tbody .= "<td " . $style . " align='left' nowrap>" . $jObj["c_creditor"] . "</td>";
			$tbody .= "<td " . $style . " align='right' nowrap>" . number_format($jObj["f_total"], 2) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;' align='center' nowrap>" . $jObj["c_cheque"] . "</td>";
			if ($_REQUEST["i_report"] == 0) {
				$tbody .= "<td " . $style . " align='center' nowrap>" . $c_status . "</td>";
				$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["d_pay_date"] . "</td>";
			} else {
				$tbody .= "<td " . $style . " align='center' nowrap></td>";
				$tbody .= "<td " . $style . " align='center' nowrap></td>";
			}
			$tbody .= "</tr>";
		} else {
			$style = "style='background: #cecece;'";
			$tbody .= "<tr>";
			if ($_REQUEST["i_report"] == 0) {
				$tbody .= "<td " . $style . " align='right' nowrap colspan=5><b>รวม</b></td>";
			} else {
				$tbody .= "<td " . $style . " align='right' nowrap colspan=4><b>รวม</b></td>";
			}
			$tbody .= "<td " . $style . " align='right' nowrap><b>" . number_format($jObj["f_total"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='center' nowrap colspan=3></td>";
			$tbody .= "</tr>";
		}
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=8>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
	<style>
        .loader {
            border: 4px solid #E7E7E7;
            border-radius: 50%;
            border-top: 4px solid #3498db;
            width: 12px;
            height: 12px;
            -webkit-animation: spin 1s linear infinite;
            /* Safari */
            animation: spin 1s linear infinite;
        }
    </style>
</head>
<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;">
    <div class="loader"></div>
    <p>&nbsp;&nbsp;กำลังโหลดข้อมูลตารางกรุณารอสักครู่...</p>
</div>
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
		echo "<div align='center'><strong>ระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";

		?>
		<div style='position: relative; font-size: 11px; margin: 5px 10px;'>
			<div style='position: relative; left: 2px;'><?= $budget_name ?></div>
		</div>
		<div class="table-overflow">
			<table id='tb_report' style="width: 2000px; display:none" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" width=120 nowrap>วันที่<?= ($_REQUEST["i_status"] == 8) ? "จัดทำเช็ค" : "ทำทะเบียนจ่าย"; ?></th>
						<?php
						if ($_REQUEST["i_report"] == 0) {
							echo "<th style='vertical-align:middle;' nowrap>แหล่งเงิน</th>";
						}
						?>
						<th style="vertical-align:middle;" width=100 nowrap>ฏีกา</th>
						<th style="vertical-align:middle;" nowrap>ปีงบที่ใช้</th>
						<th style="vertical-align:middle;" nowrap>รายการย่อย</th>
						<th style="vertical-align:middle;" nowrap>จ่ายให้</th>
						<th style="vertical-align:middle;" width=100 nowrap>จำนวนเงิน</th>
						<th style="vertical-align:middle;" width=100 nowrap>เลขที่เช็ค</th>
						<?php
						if ($_REQUEST["i_report"] == 0) {
							echo "
								<th style='vertical-align:middle;' nowrap>สถานะเช็ค</th>
								<th style='vertical-align:middle;' width=120 nowrap>วันที่จ่ายจริง</th>";
						} else {
							echo "
								<th style='vertical-align:middle;' nowrap width=120>ผู้ลงนาม</th>
								<th style='vertical-align:middle;' nowrap width=120>ผู้ลงนาม</th>";
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
<script>
    document.getElementById('tb_report').style.width = "100%";
    document.getElementById("tb_report").style.display = "table";
    document.getElementById('loader_display').style.display = "none";
</script>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>