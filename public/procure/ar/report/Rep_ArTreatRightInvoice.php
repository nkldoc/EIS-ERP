<?php
include("../api/List_RepArTreatRightInvoice.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "สรุปรายได้ค้างรับ (แยกตามสิทธิการรักษา)";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$data_dtl = json_decode(List_QueryParam(), true);

function changeNumFormat($val)
{
	if ($val > 0) {
		$val = number_format($val, 2);
	} else if ($val < 0) {
		$val = "(" . number_format(abs($val), 2) . ")";
	} else {
		$val = "-";
	}
	return $val;
}

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {

		$style = "";

		if (@$jObj["i_type"] == 1) {
			// $style = "text-align:right; background-color:#EEE;";

			$para = "";
			$para .= $_SERVER["QUERY_STRING"];
			$para .= "&ar_treat_right_id={$jObj["ar_treat_right_id"]}";

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "'>" . $jObj["ar_treat_right_group_name"] . "</td>";
			$tbody .= "<td style='" . $style . "'>" . $jObj["ar_treat_right_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_ArTreatRightInvoice_Bill.php?{$para}' target='Rep_AccruedIncomeRightGroup_Bill'>" . changeNumFormat($jObj["f_bill"], 2) . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . changeNumFormat($jObj["f_cancel"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_ArTreatRightInvoice_Cut.php?{$para}' target='Rep_AccruedIncomeRightGroup_Cut'>" . changeNumFormat($jObj["f_cut"], 2) . "</a></td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . changeNumFormat($jObj["f_receipt"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' align='right'>" . changeNumFormat($jObj["f_total"], 2) . "</td>";
			$tbody .= "</tr>";
		} else if (@$jObj["i_type"] == 2) {
			$style = "background: #fffee0;";

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align=right colspan=2><b>รวม " . $jObj["ar_treat_right_group_name"] . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_bill"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_cancel"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_cut"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_receipt"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_total"], 2) . "</b></td>";
			$tbody .= "</tr>";
		} else {
			$style = "background: #e4e4e4;";
			$tbody .= "<tr height=20>";
			$tbody .= "<td style='" . $style . "' align=right colspan=2><b>รวมทั้งสิ้น</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_bill"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_cancel"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_cut"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_receipt"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_total"], 2) . "</b></td>";
			$tbody .= "</tr>";
		}
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=6>ไม่มีข้อมูล</td></tr></tbody>";
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

		$name = "";
		$for_id = explode(";", $_REQUEST["ar_treat_right_group_id"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam("SELECT c_name FROM dbo.ar_treat_right_group WHERE ar_treat_right_group_id IN (" . $in . ")", array());

			if ($stmt) {
				while ($row = $db->Fetch($stmt)) {
					$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
				}
			}
		} else {
			$name = "เลือกทั้งหมด";
		}
		$right_group_name = "กลุ่มสิทธิ์การรักษา : <font color='blue'>{$name}</font>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong>สรุปยอด ณ วันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $right_group_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>กลุ่มสิทธิ์การรักษา</th>
						<th style="vertical-align:middle;" nowrap>สิทธิ์การรักษา</th>
						<!-- <th style="vertical-align:middle;" nowrap>ผู้ป่วย/คน</th> -->
						<th style="vertical-align:middle; width: 110px;" nowrap>จำนวนเงิน<br />เรียกเก็บ</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>จำนวนเงิน<br />ยกเลิกเรียกเก็บ</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>จำนวนเงิน<br />ตัดชำระ</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>จำนวนเงิน<br />ออกใบเสร็จ</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>รวมรายได้ค้างรับ</th>
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