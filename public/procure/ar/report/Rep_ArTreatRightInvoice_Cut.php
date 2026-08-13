<?php
include("../api/List_RepArTreatRightInvoice_Cut.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "ข้อมูลรายละเอียดตัดชำระ";

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

			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center'>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'>" . $jObj["ar_treat_right_group_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'>" . $jObj["ar_treat_right_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left'>" . $jObj["ar_cost_name"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["c_code_bill"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["d_bill_date"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["c_code_cut"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["d_cut_date"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["c_hn"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["c_an"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='left' nowrap>" . $jObj["c_patient"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='center' nowrap>" . $jObj["d_service_date"] . "</td>";
			$tbody .= "<td style='" . $style . "' align='right' nowrap>" . number_format($jObj["f_cost_amt"], 2)  . "</td>";
			$tbody .= "</tr>";
		} else {
			$style = "background-color:#EEE;";
			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td colspan=12 style='" . $style . "' align='right'><b>รวมตัดชำระ</b></td>";
			$tbody .= "<td style='" . $style . "' align='right'><b>" . number_format($jObj["f_cost_amt"], 2)  . "</b></td>";
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
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";

		$name = $db->GetDataBySQL("SELECT c_name FROM ar_treat_right WHERE ar_treat_right_id = ?", array($_REQUEST["ar_treat_right_id"]));
		$ar_treat_right_name = "สิทธิ์การรักษา : <font color='blue'>{$name}</font>";

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong>ณ วันที่ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<div style='position: relative; left: 2px;'><?= $ar_treat_right_name ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style="vertical-align:middle;" nowrap>กลุ่มสิทธิ์การรักษา</th>
						<th style="vertical-align:middle;" nowrap>สิทธิ์การรักษา</th>
						<th style="vertical-align:middle;" nowrap>หน่วยงาน</th>
						<th style="vertical-align:middle;" nowrap>เลขที่เรียกเก็บ</th>
						<th style="vertical-align:middle;" nowrap>วันที่เรียกเก็บ</th>
						<th style="vertical-align:middle;" nowrap>เลขที่ตัดชำระ</th>
						<th style="vertical-align:middle;" nowrap>วันที่ตัดชำระ</th>
						<th style="vertical-align:middle;" nowrap>HN</th>
						<th style="vertical-align:middle;" nowrap>AN</th>
						<th style="vertical-align:middle;" nowrap>ชื่อผู้ป่วย</th>
						<th style="vertical-align:middle;" nowrap>วันที่เข้าบริการ</th>
						<th style="vertical-align:middle;" nowrap>จำนวนเงินตัดชำระ</th>
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