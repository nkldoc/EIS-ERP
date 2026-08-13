<?php
include("../api/List_RepImpExpenseVSN_DTL.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$ArrD	= array(1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ");

$data_dtl = json_decode(List_QueryParam(), true);

if ($_REQUEST["type_page"] == "vsn1") {
	$caption = "รายละเอียดนำเข้าถอนคืนเงินรับฝาก (Vision Net)";
} else if ($_REQUEST["type_page"] == "vsn2") {
	$caption = "รายละเอียดนำเข้าถอนคืนรายได้โรงพยาบาล (Vision Net)";
} else if ($_REQUEST["type_page"] == "vsn3") {
	$caption = "รายละเอียดนำเข้าข้อมูลค่าใช้จ่าย (Vision Net)";
}

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";
	$no = 0;

	foreach ($data_dtl["data"] as $index => $jObj) {

		$style = "";

		if ($jObj["i_type"] == 1) {
			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . (++$no) . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["dc_expense_budget_type_name"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_code_gx"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_ref_doc"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["d_save_date"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $ArrD[$jObj["i_return"]] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["acc_code"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["acc_name"] . "</td>";
			$tbody .= "<td " . $style . " align='right' nowrap>" . number_format($jObj["f_amount"], 2) . "</td>";
			$tbody .= "</tr>";
		} else if ($jObj["i_type"] == 2) {
			// GEN TBODY
			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " align='right' colspan=8><b>รวม</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_amount"], 2) . "</b></td>";
			$tbody .= "</tr>";
		}
	}

	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=22>ไม่มีข้อมูล</td></tr></tbody>";
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>

<body>
	<style>
		tr:nth-child(even) {
			background: #f1f1f1
		}

		tr:nth-child(odd) {
			background: #FFF
		}
	</style>
	<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
			<tr>
				<th style='vertical-align:middle;' nowrap>ลำดับที่</th>
				<th style='vertical-align:middle;' nowrap>แหล่งเงิน</th>
				<th style='vertical-align:middle;' nowrap>gx</th>
				<th style='vertical-align:middle;' nowrap>เลขที่เอกสาร</th>
				<th style='vertical-align:middle;' nowrap>วันที่บันทึกบัญชี</th>
				<th style='vertical-align:middle;' nowrap>เงื่อนไข</th>
				<th style='vertical-align:middle;' nowrap>รหัสบัญชี</th>
				<th style='vertical-align:middle;' nowrap>รายการบัญชี</th>
				<th style='vertical-align:middle;' nowrap>จำนวนเงิน</th>
			</tr>
		</thead>
		<?= $tbody ?>
	</table>
</body>

</html>