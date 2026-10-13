<?php
include("../api/List_RepStatisticDetail.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานทะเบียนคุมสถิติการเบิกจ่าย (สรุป)";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {

		if ($jObj["i_enable"] == 2) {
			$style = "style='text-decoration: underline;'";
		} else if ($jObj["i_success"] == 1) {
			$style = "style='background: #e4fffe;'";
		} else {
			$style = "";
		}

		$tbody .= "<tr {$style}>";
		$tbody .= "<td align='center' nowrap>" . $jObj["no"] . "</td>";
		$tbody .= "<td>" . $jObj["dc_cost_name"] . "</td>";
		$tbody .= "<td>" . $jObj["dc_expense_budget_type_name"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["s_audit_date"] . "</td>";
		$tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $jObj["c_code_ref"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["s_inv_date"] . "</td>";
		$tbody .= "<td align=center style='mso-number-format:\@;' nowrap>" . $jObj["c_approve"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["s_approve_date"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["s_doc_date11"] . "</td>";
		$tbody .= "<td align='left'>" . $jObj["po_creditor_name"] . "</td>";
		$tbody .= "<td align='left'>" . $jObj["bg_expense_name"] . "</td>";
		$tbody .= "<td align='center' nowrap style='background: #ececec;'>" . $jObj["b_count_date1"] . "</td>";
		$tbody .= "<td align='center' nowrap style='background: #ececec;'>" . $jObj["b_count_date2"] . "</td>";
		$tbody .= "<td align='center' nowrap style='background: #ececec;'>" . $jObj["b_count_date3"] . "</td>";
		$tbody .= "<td align='center' nowrap style='background: #ececec;'>" . $jObj["b_count_date4"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["c_qty"] . "</td>";
		$tbody .= "<td align='right' nowrap>" . number_format($jObj["f_total"], 2) . "</td>";
		$tbody .= "<td align='left'>" . $jObj["c_comment"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["po_emp_name"] . "</td>";
		$tbody .= "<td align='center' nowrap>" . $jObj["dc_approve_name"] . "</td>";
		$tbody .= "</tr>";
	}

	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=21>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
	<style>
		.class-t {
			display: inline-flex;
		}

		.class-t .hh {
			position: relative;
			font-size: 11px;
			margin: 5px 10px;
			width: 180px;
		}

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
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";

		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$budget_name = $db->GetDataBySQL("SELECT c_name FROM dbo.dc_expense_budget_type WHERE dc_expense_budget_type_id = ?;", array($_REQUEST["dc_expense_budget_type_id"]));
		} else {
			$budget_name = "ทั้งหมด";
		}

		if ($_REQUEST["po_creditor_id"] > 0) {
			$creditor_name = $db->GetDataBySQL("SELECT c_name FROM dbo.po_creditor WHERE po_creditor_id = ?;", array($_REQUEST["po_creditor_id"]));
		} else {
			$creditor_name = "ทั้งหมด";
		}

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong>ฝ่ายคลังรับระหว่างวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style="position: relative; left: 2px;">แหล่งเงิน : <?= $budget_name ?></div>
			<div style="position: relative; left: 2px;">จ่ายให้ : <?= $creditor_name ?></div>
			<div style="position: relative; left: 2px;">จำนวนฏีกาทั้งหมด : <?= $data_dtl["totalCount"] ?></div>
			<?php
			if (@$_REQUEST["dc_cost_id_chart"] > 0) {
				$cost_name = ($_REQUEST["dc_cost_id_chart"] == 99) ? "หน่วยงานอื่นๆ" : $db->GetDataBySQL("SELECT c_name FROM dbo.dc_cost WHERE dc_cost_id = ?;", array($_REQUEST["dc_cost_id_chart"]));
				echo "<div style='position: relative; left: 2px;'>หน่วยงาน : " . $cost_name . " </div>";
			}
			?>
		</div>
		<div class="class-t">
			<div class="hh">
				<div style="position: relative; left: 2px; padding-bottom: 6px;"><span style='border-bottom: 1px solid;'>ตรวจรับถึงจัดทำใบขอเบิก</span></div>
				<div style="position: relative; left: 2px;">0 - 7 วัน : <?= $data_dtl["ii_than07_1"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">8 - 15 วัน : <?= $data_dtl["ii_than15_1"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">16 - 30 วัน : <?= $data_dtl["ii_than30_1"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">เกิน 30 วัน : <?= $data_dtl["ii_over30_1"] ?> ฏีกา</div>
			</div>
			<div class="hh">
				<div style="position: relative; left: 2px; padding-bottom: 6px;"><span style='border-bottom: 1px solid;'>อนุมัติฎีกาถึงจ่ายเงิน</span></div>
				<div style="position: relative; left: 2px;">0 - 7 วัน : <?= $data_dtl["ii_than07_2"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">8 - 15 วัน : <?= $data_dtl["ii_than15_2"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">16 - 30 วัน : <?= $data_dtl["ii_than30_2"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">เกิน 30 วัน : <?= $data_dtl["ii_over30_2"] ?> ฏีกา</div>
			</div>
			<div class="hh">
				<div style="position: relative; left: 2px; padding-bottom: 6px;"><span style='border-bottom: 1px solid;'>รับใบขอเบิกถึงจ่ายเงิน</span></div>
				<div style="position: relative; left: 2px;">0 - 7 วัน : <?= $data_dtl["ii_than07_3"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">8 - 15 วัน : <?= $data_dtl["ii_than15_3"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">16 - 30 วัน : <?= $data_dtl["ii_than30_3"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">เกิน 30 วัน : <?= $data_dtl["ii_over30_3"] ?> ฏีกา</div>
			</div>
			<div class="hh">
				<div style="position: relative; left: 2px; padding-bottom: 6px;"><span style='border-bottom: 1px solid;'>ตรวจรับถึงจ่ายเงิน</span></div>
				<div style="position: relative; left: 2px;">0 - 7 วัน : <?= $data_dtl["ii_than07_4"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">8 - 15 วัน : <?= $data_dtl["ii_than15_4"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">16 - 30 วัน : <?= $data_dtl["ii_than30_4"] ?> ฏีกา</div>
				<div style="position: relative; left: 2px;">เกิน 30 วัน : <?= $data_dtl["ii_over30_4"] ?> ฏีกา</div>
			</div>
		</div>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style="background: #e4fffe; width: 9px; height: 9px; border: 1px solid #e0e0e0; position: absolute;"></div>
			<div style="position: relative; margin-left: 20px; top: -3px;">ทำทะเบียนจ่ายแล้ว</div>
		</div>
		<div class="table-overflow">
			<table id='tb_report' style="width: 2000px; display:none" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan=5 nowrap>ลำดับ</th>
						<th style="vertical-align:middle; mso-number-format:\@;" rowspan=5 nowrap>หน่วยงาน</th>
						<th style="vertical-align:middle; mso-number-format:\@;" colspan=5 nowrap>ฝ่ายพัสดุ, ฝ่ายเภสัชกรรม, งานเวชภัณฑ์การแพทย์</th>
						<th style="vertical-align:middle; mso-number-format:\@;" colspan=5 nowrap>ฝ่ายการคลัง</th>
						<th style="vertical-align:middle; mso-number-format:\@;" colspan=4 nowrap>ระยะเวลาที่ใช้ (วัน)</th>
						<th style="vertical-align:middle; mso-number-format:\@;" colspan=5 nowrap></th>
					</tr>
					<tr>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=4 nowrap>ประเภทงบ</th>
						<th style="vertical-align: middle; mso-number-format:\@;" colspan=3 nowrap>หน่วยงาน จัดซื้อ/ จ้าง</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>ฝ่ายคลัง</th>
						<th style="vertical-align: middle; mso-number-format:\@;" colspan=2 rowspan=3 nowrap>(4)<br>อนุมัติฎีกา</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=3 nowrap>(5)<br>ทำทะเบียนจ่าย</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=4 nowrap>จ่ายให้</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=4 nowrap>รายจ่ายย่อย</th>
						<th style="vertical-align: middle; mso-number-format:\@; width: 60px; color:red;" nowrap>(1 - 2)</th>
						<th style="vertical-align: middle; mso-number-format:\@; width: 60px; color:red;" nowrap>(4 - 5)</th>
						<th style="vertical-align: middle; mso-number-format:\@; width: 60px; color:red;" nowrap>(3 - 5)</th>
						<th style="vertical-align: middle; mso-number-format:\@; width: 60px; color:red;" nowrap>(1 - 5)</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=3 nowrap>จำนวน</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=3 nowrap>จำนวนเงิน</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=4 nowrap>หมายเหตุ</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=4 nowrap>ผู้ดำเนินการ</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=4 nowrap>ผู้ตรวจสอบ</th>
					</tr>
					<tr>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=2 nowrap>(1)<br>ตรวจรับ</th>
						<th style="vertical-align: middle; mso-number-format:\@;" colspan=2 rowspan=2 nowrap>(2)<br>จัดทำใบขอเบิก</th>
						<th style="vertical-align: middle; mso-number-format:\@;" rowspan=2 nowrap>(3)<br>รับใบขอเบิก</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>ตรวจรับ</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>อนุมัติฎีกา</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>รับใบขอเบิก</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>ตรวจรับ</th>
					</tr>
					<tr>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จนถึง</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จนถึง</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จนถึง</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จนถึง</th>
					</tr>
					<tr>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>เลขที่</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>เลขที่</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>วัน เดือน ปี</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จัดทำใบขอเบิก</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จ่ายเงิน</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จ่ายเงิน</th>
						<th style="vertical-align: middle; mso-number-format:\@; color:red;" nowrap>จ่ายเงิน</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>(รายการ)</th>
						<th style="vertical-align: middle; mso-number-format:\@;" nowrap>(บาท)</th>
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