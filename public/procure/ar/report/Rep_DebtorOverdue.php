<?php
include("../api/List_RepDebtorOverdue.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงาน ลูกหนี้คงค้าง";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

function changeNumFormat($val)
{
	if ($val > 0) {
		$val = number_format($val, 2);
	} else if ($val < 0) {
		$val = "(" . number_format(abs($val), 2) . ")";
	} else if ($val == "") {
		$val = "";
	} else {
		$val = "-";
	}
	return $val;
}

$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {
	$tbody = "<tbody>";
	foreach ($data_dtl["data"] as $index => $jObj) {

		$style = "";

		// $f_reduce = ($jObj["f_bill"] > $jObj["f_cut"]) ? $jObj["f_bill"] - $jObj["f_cut"] : "";
		// $f_over = ($jObj["f_cut"] > $jObj["f_bill"]) ? $jObj["f_cut"] - $jObj["f_bill"] : "";

		if (@$jObj["i_type"] == 1) {
			// 	// $style = "text-align:right; background-color:#EEE;";

			// }
			// else if (@$jObj["i_type"] == 2) {
			// 	$style = "background: #fffee0;";

			// GEN TBODY
			$style = "background: #f4f4f5;";
			$tbody .= "<tr height=20>";
			$tbody .= "<td style='" . $style . "' align=right colspan=7><b>รวมทั้งสิ้น</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_bill"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_bill_cancel"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align=right colspan=2></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_cut"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_cut_cancel"], 2) . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_receipt"], 2) . "</b></td>";
			// $tbody .= "<td style='" . $style . "' align='right'><b>" . changeNumFormat($jObj["f_receipt_cancel"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_reduce"], 2) . "</b></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'><b>" . changeNumFormat($jObj["f_over"], 2) . "</b></td>";
			$tbody .= "</tr>";
		} else {
			$para = "";
			$para .= "type=html";
			// $para .= $_SERVER["QUERY_STRING"];
			// $para .= "&ar_treat_right_id={$jObj["ar_treat_right_id"]}";
			// $para .= "&ar_bill_hdr_id={$jObj["ar_bill_hdr_id"]}";

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' nowrap align='center'>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap>" . $jObj["ar_treat_right_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='center'>" . $jObj["c_hn"] . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='center'>" . $jObj["c_an"] . "</td>";
			$tbody .= "<td style='" . $style . " mso-number-format:\@;' nowrap align='left'>" . $jObj["c_patient"] . "</td>";
			$tbody .= "<td style='" . $style . " mso-number-format:\@;' nowrap align='center'>" . $jObj["c_code_bill"] . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='center'>" . $jObj["d_bill_date"] . "</td>";
			$tbody .= "<td style='" . $style . " background: #fcfdde;' nowrap align='right'><a href='./Rep_ArBill.php?{$para}&ar_bill_dtl_id={$jObj["ar_bill_dtl_id"]}' target='Rep_ArBill'>" . changeNumFormat($jObj["f_bill"], 2) . "</a></td>";
			$tbody .= "<td style='" . $style . " background: #fcfdde;' nowrap align='right'>" . changeNumFormat($jObj["f_bill_cancel"], 2) . "</td>";
			$tbody .= "<td style='" . $style . " mso-number-format:\@;' nowrap align='center'>" . $jObj["c_code_cut"] . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='center'>" . $jObj["d_cut_date"] . "</td>";
			$tbody .= "<td style='" . $style . " background: #fcfdde;' nowrap align='right'><a href='./Rep_ArCut.php?{$para}&ar_cut_dtl_id={$jObj["ar_cut_dtl_id"]}' target='Rep_ArCut'>" . changeNumFormat($jObj["f_cut"], 2) . "</a></td>";
			$tbody .= "<td style='" . $style . " background: #fcfdde;' nowrap align='right'>" . changeNumFormat($jObj["f_cut_cancel"], 2) . "</td>";
			// $tbody .= "<td style='" . $style . " background: #fcfdde;' nowrap align='right'>" . changeNumFormat($jObj["f_receipt"], 2) . "</td>";
			// $tbody .= "<td style='" . $style . " background: #fcfdde;' nowrap align='right'>" . changeNumFormat($jObj["f_receipt_cancel"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'></td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_reduce"], 2) . "</td>";
			$tbody .= "<td style='" . $style . "' nowrap align='right'>" . changeNumFormat($jObj["f_over"], 2) . "</td>";

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

		// 		$name = "";
		// 		$for_id = explode(";", $_REQUEST["ar_treat_right_group_id"]);
		// 		if (!in_array("0", $for_id)) {
		// 			$in = "";
		// 			foreach ($for_id as $val) {
		// 				$in .= ($in == "") ? $val : ", " . $val;
		// 			}
		// 			$stmt = $db->QueryParam("SELECT c_name FROM dbo.ar_treat_right_group WHERE ar_treat_right_group_id IN (" . $in . ")", array());

		// 			if ($stmt) {
		// 				while ($row = $db->Fetch($stmt)) {
		// 					$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
		// 				}
		// 			}
		// 		} else {
		// 			$name = "เลือกทั้งหมด";
		// 		}
		// 		$right_group_name = "กลุ่มสิทธิ์การรักษา : <font color='blue'>{$name}</font>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong>วันที่เรียกเก็บ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<!-- <div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $right_group_name ?></div>
		</div> -->
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th rowspan=2 style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th rowspan=2 style="vertical-align:middle;" nowrap>สิทธิ์การรักษา</th>
						<th rowspan=2 style="vertical-align:middle;" nowrap>HN</th>
						<th rowspan=2 style="vertical-align:middle;" nowrap>AN</th>
						<th rowspan=2 style="vertical-align:middle;" nowrap>ชื่อผู้ป่วย</th>
						<th colspan=4 style="vertical-align:middle;" nowrap>เรียกเก็บ</th>
						<th colspan=4 style="vertical-align:middle;" nowrap>ตัดชำระ</th>
						<th colspan=4 style="vertical-align:middle;" nowrap>ออกใบเสร็จ</th>
						<th rowspan=2 style="vertical-align:middle; width: 110px;" nowrap>ส่วนขาด(-)</th>
						<th rowspan=2 style="vertical-align:middle; width: 110px;" nowrap>ส่วนเกิน(+)</th>
					</tr>
					<tr>
						<th style="vertical-align:middle;" nowrap>เลขที่เอกสาร</th>
						<th style="vertical-align:middle;" nowrap>วันที่</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>จำนวนเงิน</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>ยกเลิก</th>
						<th style="vertical-align:middle;" nowrap>เลขที่เอกสาร</th>
						<th style="vertical-align:middle;" nowrap>วันที่</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>จำนวนเงิน</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>ยกเลิก</th>
						<th style="vertical-align:middle;" nowrap>เลขที่เอกสาร</th>
						<th style="vertical-align:middle;" nowrap>วันที่</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>จำนวนเงิน</th>
						<th style="vertical-align:middle; width: 110px;" nowrap>ยกเลิก</th>
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