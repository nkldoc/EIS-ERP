<?php
include("../api/List_RepDcUnitType.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;
$caption	= "รายงานประเภทหน่วยนับ";

$arr_empty  = array(
	1 => '', 2 => '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', 3 => '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', 4 => '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', 5 => '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;', 6 => '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
);

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

$thead[]	= "รหัส";
$thead[]	= "ชื่อ"; 
$thead[]	= "หน่วยจริง";
$thead[]	= "สถานะ";

$data_dtl	= json_decode(List_QueryParam(), true);


if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody		= "<tbody>";
	$c_td_level = "";

	foreach ($data_dtl["data"] as $index => $jObj) {
 

		$tbody	.=	"<tr>";
		$tbody	.= "<td width='10%' align='center' style='mso-number-format:\@;'>" . $jObj["c_code"] . "</td>";
		$tbody	.= "<td width='45%'>". $jObj["c_name"] . "</td>"; 
		$tbody	.= "<td width='5%' align='right'>". $jObj["f_value"] . "</td>";
		$tbody	.= "<td width='5%' align='center'>" . $jObj["c_enable_name"] . "</td>";
		$tbody	.=	"</tr>";
	}

	$tbody	.= "</tbody>";
} else {
	$tbody	= "";
}
?>
<html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
</head>

<body>
	<div class="outer">
		<?php
		if ($s_title == true)
			echo "<div align='center'><strong>" . $title . "</strong></div>";

		if ($_REQUEST["i_enable"] > 0) {
			$c_enabled_caption	=  ($_REQUEST["i_enable"] == "1") ? "ใช้งาน" : "ไม่ใช้งาน";
		} else {
			$c_enabled_caption	= "เลือกทั้งหมด";
		}

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		?>
		<div style='position: relative; font-size: 11px; margin: 5px 10px;'>
			<div style='position: relative; left: 2px;'>สถานะ : <?= $c_enabled_caption ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<?php
					echo "<tr>";
					foreach ($thead as $value) {
						echo "<th style='vertical-align:middle;'>" . $value . "</th>";
					}
					echo "</tr>";
					?>
				</thead>
				<?= $tbody ?>
			</table>
		</div>
	</div>
</body>

</html>
<script src="../../js/jquery/3.4.1/jquery.min.js"></script>
<script src="../../css/report.js"></script>