<?php
include("../api/List_RepAccruedIncomeClaim.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$title		= CUSTOMER_NAME_TH;

$caption	= "รายงาน รายได้ค้างรับ (แยกตามสิทธิการรักษา)";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<title><?php echo COMPANY_NAME; ?></title>
	<style type="text/css">
		* {
			font-family: sans-serif;
			font-size: 12px;
			box-sizing: border-box;
			-moz-box-sizing: border-box;
		}

		html {
			font-family: sans-serif;
			font-size: 12px;
			color: #000000;
		}

		body {
			font-family: sans-serif;
			font-size: 12px;
			padding: 0;
			margin: 0;
			color: #000000;
			background: #fff;
		}

		table {
			border-collapse: collapse;
		}

		.table-data>thead>tr>th {
			border: 1px solid black;
		}

		.table-data>tbody {
			border: 1px solid black;
		}

		.table-data>tbody>tr>td {
			border-left: 1px solid black;
		}

		.headTitle {
			font-size: 14px;
			font-weight: bold;
			text-transform: uppercase;
		}

		@page {
			size: A4;
			margin: 0;
		}

		@media print {
			.page {
				width: 21cm;
				min-height: 29.7cm;
				padding: 2cm;
				margin: 1cm auto;
				border: 1px solid #eee;
				margin: 0;
				border: initial;
				border-radius: initial;
				width: initial;
				min-height: initial;
				box-shadow: initial;
				background: initial;
				page-break-after: always;
			}
		}
	</style>
</head>

<body>
	<?php
	$data	= json_decode(List_QueryParam(), true);

	$page				= "";
	$tbody				= "";

	if (is_array($data) && count($data["data"]) > 0) {

		// // ธนาคาร
		// if ($_REQUEST["dc_bank_id"] > 0) {
		// 	$for_id = explode(";", $_REQUEST["dc_bank_id"]);
		// 	if (!in_array("0", $for_id)) {
		// 		$in = "";
		// 		foreach ($for_id as $val) {
		// 			$in .= ($in == "") ? $val : ", " . $val;
		// 		}
		// 		$stmt = $db->QueryParam("SELECT c_name AS c_name FROM dc_bank WHERE dc_bank_id IN (" . $in . ")", array());

		// 		if ($stmt) {
		// 			$name = "";
		// 			while ($row = $db->Fetch($stmt)) {
		// 				$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
		// 			}
		// 		}
		// 	}
		// 	$dc_bank_name = "ธนาคาร : <font color='blue'>" . $name . "</font>";
		// } else {
		// 	$dc_bank_name = "ธนาคาร : <font color='blue'>เลือกทั้งหมด</font>";
		// }

		// // บัญชี
		// if ($_REQUEST["dc_bank_acc_company_id"] > 0) {
		// 	$for_id = explode(";", $_REQUEST["dc_bank_acc_company_id"]);
		// 	if (!in_array("0", $for_id)) {
		// 		$in = "";
		// 		foreach ($for_id as $val) {
		// 			$in .= ($in == "") ? $val : ", " . $val;
		// 		}
		// 		$stmt = $db->QueryParam("SELECT c_code+' : '+c_name AS c_name FROM dc_bank_acc_company WHERE dc_bank_acc_company_id IN (" . $in . ")", array());

		// 		if ($stmt) {
		// 			$name = "";
		// 			while ($row = $db->Fetch($stmt)) {
		// 				$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
		// 			}
		// 		}
		// 	}
		// 	$dc_bank_acc_company_name = "เลขที่บัญชี : <font color='blue'>" . $name . "</font>";
		// } else {
		// 	$dc_bank_acc_company_name = "เลขที่บัญชี : <font color='blue'>เลือกทั้งหมด</font>";
		// }

		// =================================== GEN PAGE ==================================== //
		// $c_show_date = "วันที่   " . $date->extDateBuddha($_REQUEST["date_start"]) . " ถึง  " . $date->extDateBuddha($_REQUEST["date_end"]);

		$detail		= "";
		$i_hn			= 0;
		$f_charge		= 0;
		$total_i_hn		= 0;
		$total_f_charge	= 0;

		foreach ($data["data"] as $id => $obj) {

			// $sum_dr	= 0;
			// $sum_cr	= 0;

			// $sum_end_dr	= 0;
			// $sum_end_cr	= 0;
			// $c_ss	= ($_REQUEST["i_ss"] == 1) ? "<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>ต้นทาง</th>" : "";

			// foreach ($jObj["data"] as $ii => $jObjY) {

			// 	$style	= "style='border-left: 1px solid; border-right: 1px solid;' nowrap";
			// 	$c_ss	= ($_REQUEST["i_ss"] == 1) ? "<td align='center' {$style}></td>" : "";
			if ($obj["i_is_claim"] == true) {
				$i_hn		= 0;
				$f_charge	= 0;
				$styleDtail		= "style='border-top: 1px solid;'";
				$c_name_claim	= $obj["c_name_claim"];
			} else {
				$styleDtail		= "";
				$c_name_claim	= "";
			}

			$i_hn			+= $obj["i_hn"];
			$f_charge		+= $obj["f_charge"];
			$total_i_hn		+= $obj["i_hn"];
			$total_f_charge	+= $obj["f_charge"];

			$detail	.= "
				<tr>
					<td align='left' {$styleDtail}>" . $c_name_claim . "</td>
					<td align='left' {$styleDtail}>" . $obj["c_name_cost"] . "</td>
					<td align='center' nowrap {$styleDtail}>" . number_format($obj["i_hn"], 0) . "</td>
					<td align='right' nowrap {$styleDtail}>" . number_format($obj["f_charge"], 2) . "</td>
				</tr>";

			if ($obj["i_is_claim_desc"] == true) {
				$detail	.= "
					<tr height=25>
						<td align='left' nowrap></td>
						<td align='left' nowrap style='border-top: 1px solid;'>รวมรายได้ค้างรับ {$obj["c_name_claim"]}</td>
						<td align='center' nowrap style='border-top: 1px solid;'><b>" . number_format($i_hn, 0) . "</b></td>
						<td align='right' nowrap style='border-top: 1px solid;'><b>" . number_format($f_charge, 2) . "</b></td>
					</tr>";
			}

			// PAGE
			if ($obj["i_is_fund"] == true) { // เช็คการขึ้นบรรทัด
				$head	= "<div class='headTitle' style='text-align: center;'>{$title}<br>{$caption}</div><br>";
				$page	.= "<div class='page'>
							{$head}
							<div style='font-size: 14px;font-weight: bold; padding-bottom: 4px;'>{$obj["c_fund"]}</div>
							<table class='table-data' border='0' align='center' cellpadding='3' cellspacing='0' width='100%'>
								<thead style='background: #c0c0c7;'>
									<tr>
										<th rowspan=2 class='headerTitle01' style='border: 1px solid;' valign='middle' nowrap width=20%>สิทธิการรักษา</th>
										<th rowspan=2 class='headerTitle01' style='border: 1px solid;' valign='middle' nowrap width=60%>หน่วยงาน</th>
										<th colspan=2 class='headerTitle01' style='border: 1px solid;' valign='middle' nowrap>รวม</th>
									</tr>
									<tr>
										<th width=50 class='headerTitle01' style='border: 1px solid; border-top: none;' valign='middle' nowrap>ผู้ป่วย/คน</th>
										<th width=50 class='headerTitle01' style='border-bottom: 1px solid; border-right: 1px solid;' valign='middle' nowrap>จำนวนเงินเรียกเก็บ</th>
									</tr>
								</thead>
								<tbody>
									{$detail}
									<tr>
										<td colspan=2 style='border-top: 1px solid; background: #c0c0c7;'><b>&nbsp;&nbsp;&nbsp;รวมรายได้ค้างรับ " . $obj["c_fund"] . "</b></td>
										<td align='center' nowrap style='border-top: 1px solid; background: #c0c0c7;'><b>" . number_format($total_i_hn, 0) . "</b></td>
										<td align='right' nowrap style='border-top: 1px solid; background: #c0c0c7;'><b>" . number_format($total_f_charge, 2) . "</b></td>
									</tr>
								</tbody>";
				$page .= "</table></div>";

				$detail	= "";
				$total_i_hn		= 0;
				$total_f_charge	= 0;
			}
		} // GEN PAGE
		echo $page;
		// ================================================================================= //
	} else {
		echo "ไม่มีรายการ";
	}
	?>
</body>

</html>