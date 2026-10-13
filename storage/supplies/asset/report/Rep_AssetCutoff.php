<?php

include("../api/List_RepAssetCutoff.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$caption = "รายงานตัดจำหน่าย " ;

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}


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




$data_dtl = json_decode(List_QueryParam(), true);
if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {
		if ($jObj["i_type"] == '1') {
			$style = "";
			$tbody .= "<tr>";
			$tbody .= "<td style='" . $style . "' align='center 'nowrap>" . $jObj["no"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' nowrap>" . $jObj["c_code"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' nowrap>" . $jObj["d_cutoff_date"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' nowrap>" . $jObj["asset_code"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' nowrap>" . $jObj["asset_name"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' nowrap>" . $jObj["i_period_year"] . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_unit_cost"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_depre"]) . "</td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap>" . changeNumFormat($jObj["f_acc_cost"]) . "</td>";
			
		} else {
			$style = "text-align:right; background-color:#EEE;";
			$tbody .= "<tr>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='left' colspan=2 nowrap><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["f_begin"]) . "</b></td>";
			for ($i = 1; $i <= 35; ++$i) {
				$tbody .= "<td style='mso-number-format:\@;" . $style . "' align='right' nowrap><b>" . changeNumFormat($jObj["s" . $i]) . "</b></td>";
			}
		}
		// $tbody .= "<td style='" . $style . "' align='right'><a href='./Rep_Budget_Budget.php?{$para}' target='Rep_RepBudgetControl_DTL'>" . $f_budget . "</a></td>";

		$tbody .= "</tr>";
	}
	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=18 nowrap>ไม่มีข้อมูล</td></tr></tbody>";
}

$tag_th_month = '';
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>
<style>
	.ol1 {
		background-color: #E1F5D8;
	}

	.ol2 {
		background-color: #F5F3D8;
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

<div id="loader_display" style="display: flex; padding: 15px 15px; font-size:14px;">
	<div class="loader"></div>
	<p>&nbsp;&nbsp;กำลังโหลดข้อมูลตารางกรุณารอสักครู่...</p>
</div>

<body>
	<div class="outer">
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";
		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		//echo "<div align='center'><strong>ข้อมูล ณ วันที่ " . $date->shot_date_from_db($_REQUEST["d_doc_date"]) . "</strong></div>";
		echo "<div align='center'><strong>ตัดจำหน่าย ณ " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";

		?>
		<div style="position: relative; font-size: 11px; margin: 5px 10px;">
			<!-- <div style='position: relative; left: 2px;'><?= $am_mode_name ?></div> -->
			<!-- <div style='position: relative; left: 2px;'><?= $in_year ?></div> -->
		</div>
		<div class="table-overflow">
			<table id='tb_main' width="100%" class="table_report" style=" width: 2000px; display:none" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;ลำดับที่&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;เลขที่ตัดจำหน่าย&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;วันที่ตัดจำหน่าย&nbsp;</th>
						<th style="vertical-align:middle;" rowspan=0 nowrap>&nbsp;รหัสครุภัณฑ์&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;ชื่อครุภัณฑ์&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;อายุการใช้งาน&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;มูลค่าที่ได้มา&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;ค่าเสื่อมสะสม&nbsp;</th>
						<th style='vertical-align:middle;' rowspan=0 nowrap>&nbsp;มูลค่าสุทธิ&nbsp;</th>
						
					</tr>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
	</div>
</body>
<script>
	document.getElementById('tb_main').style.width = "100%";
	document.getElementById("tb_main").style.display = "table";
	document.getElementById('loader_display').style.display = "none";
</script>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>