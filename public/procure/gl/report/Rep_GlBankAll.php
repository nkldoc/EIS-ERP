<?php
include("../api/List_GlRepBankAll.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$title		= CUSTOMER_NAME_TH;

$caption	= "รายงาน บัญชีย่อยเงินฝากธนาคาร";

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
	$data_dtl	= json_decode(List_QueryParam(), true);

	$page				= "";
	$tbody				= "";

	if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

		// ธนาคาร
		if ($_REQUEST["dc_bank_id"] > 0) {
			$for_id = explode(";", $_REQUEST["dc_bank_id"]);
			if (!in_array("0", $for_id)) {
				$in = "";
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$stmt = $db->QueryParam("SELECT c_name AS c_name FROM dc_bank WHERE dc_bank_id IN (" . $in . ")", array());

				if ($stmt) {
					$name = "";
					while ($row = $db->Fetch($stmt)) {
						$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
					}
				}
			}
			$dc_bank_name = "ธนาคาร : <font color='blue'>" . $name . "</font>";
		} else {
			$dc_bank_name = "ธนาคาร : <font color='blue'>เลือกทั้งหมด</font>";
		}

		// บัญชี
		if ($_REQUEST["dc_bank_acc_company_id"] > 0) {
			$for_id = explode(";", $_REQUEST["dc_bank_acc_company_id"]);
			if (!in_array("0", $for_id)) {
				$in = "";
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$stmt = $db->QueryParam("SELECT c_code+' : '+c_name AS c_name FROM dc_bank_acc_company WHERE dc_bank_acc_company_id IN (" . $in . ")", array());

				if ($stmt) {
					$name = "";
					while ($row = $db->Fetch($stmt)) {
						$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
					}
				}
			}
			$dc_bank_acc_company_name = "เลขที่บัญชี : <font color='blue'>" . $name . "</font>";
		} else {
			$dc_bank_acc_company_name = "เลขที่บัญชี : <font color='blue'>เลือกทั้งหมด</font>";
		}

		// =================================== GEN PAGE ==================================== //
		$c_show_date = "วันที่   " . $date->extDateBuddha($_REQUEST["date_start"]) . " ถึง  " . $date->extDateBuddha($_REQUEST["date_end"]);

		foreach ($data_dtl["data"] as $id => $jObj) {

			$sum_dr	= 0;
			$sum_cr	= 0;

			$sum_end_dr	= 0;
			$sum_end_cr	= 0;

			$c_ss	= ($_REQUEST["i_ss"] == 1) ? "<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>ต้นทาง</th>" : "";

			$head	= "	<div class='headTitle' style='text-align: center;'>{$title}<br>{$caption}<br>{$c_show_date}</div> 
					<br>
					<table border='0' align='center' cellpadding='0' cellspacing='0' width='100%'>
						<tr><td style='text-align: left;' colspan='7'>{$dc_bank_name}</td></tr>
						<tr><td style='text-align: left;' colspan='7'>{$dc_bank_acc_company_name}</td></tr> 
					</table>
					<br>";

			$page	.= "<div class='page'>
						{$head}
						<div style='font-size: 14px;font-weight: bold; padding-bottom: 4px;'>" . $jObj["company_code"] . " : " . $jObj["company_name"] . "</div>
						<table class='table-data' border='0' align='center' cellpadding='3' cellspacing='0' width='100%'>
							<thead>
								<tr>
									<th colspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>พ.ศ.</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>ที่เอกสาร</th>
									{$c_ss}
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>รายการ</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>เดบิต (ฝาก)</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>เครดิต (ถอน)</th>
									<th rowspan=2 class='headerTitle01' style='border: 1px solid;'  valign='middle' nowrap>คงเหลือ</th>
								</tr>
								<tr>
									<th width=60 class='headerTitle01' style='border: 1px solid; border-top: none;' valign='middle' nowrap>เดือน</th>
									<th width=60 class='headerTitle01' style='border-bottom: 1px solid; border-right: 1px solid;' valign='middle' nowrap>วันที่</th>
								</tr>
							</thead>
							<tbody>";

			foreach ($jObj["data"] as $ii => $jObjY) {

				$style	= "style='border-left: 1px solid; border-right: 1px solid;' nowrap";
				$c_ss	= ($_REQUEST["i_ss"] == 1) ? "<td align='center' {$style}></td>" : "";
				$page	.= "<tr>
							<td align='center' {$style}>" . $jObjY["c_yyyy"] . "</td>
							<td align='center' {$style}></td>
							<td align='center' {$style}></td>
							{$c_ss}
							<td align='center' {$style}></td>
							<td align='center' {$style}></td>
							<td align='center' {$style}></td>
							<td align='right' {$style}>" . number_format($jObjY["f_end_dr"], 2) . "</td>
						</tr>";

				if (is_array(@$jObjY["data"])) {
					foreach ($jObjY["data"] as $iiM => $jObjM) {

						$chkM	= true;
						$s_name	= "";

						// MONTH
						foreach ($jObjM["data"] as $iiD => $jObjD) {
							$chkD	= true;
							foreach ($jObjD["data"] as $iiT => $jObjRowR) {
								foreach ($jObjRowR["data"] as $iiR => $jObjRow) {
									foreach ($jObjRow["data"] as $iiC => $jObjData) {

										if ($chkM === true) {
											$c_mm	= $jObjM["c_mm"];
											$chkM	= false;
										} else {
											$c_mm = "";
										}

										if ($chkD === true) {
											$c_dd	= $iiD;
											$chkD	= false;
										} else {
											$c_dd = "";
										}

										if ($jObjData["c_name"] != @$s_name) {
											$s_name	= $jObjData["c_name"];
											$c_name	= $jObjData["c_name"];
										} else {
											$c_name	= "''";
										}

										if ($jObjData["f_dr"] != 0) {
											// $f_dr	= ($jObjData["f_dr"] < 0) ? "(" . number_format(abs($jObjData["f_dr"]), 2) . ")" : number_format($jObjData["f_dr"], 2);
											$f_dr	= number_format(abs($jObjData["f_dr"]), 2);
										} else {
											$f_dr	= "";
										}

										if ($jObjData["f_cr"] != 0) {
											// $f_cr	= ($jObjData["f_cr"] < 0) ? "(" . number_format(abs($jObjData["f_cr"]), 2) . ")" : number_format($jObjData["f_cr"], 2);
											$f_cr	= number_format(abs($jObjData["f_cr"]), 2);
										} else {
											$f_cr	= "";
										}

										if ($jObjData["i_show"] == 3) {
											$font1	= "<font color=red>";
											$font2	= "</font>";
										} else {
											$font1	= "<font>";
											$font2	= "</font>";
										}

										$c_ss	= ($_REQUEST["i_ss"] == 1) ? "<td align='center' {$style}>" . $font1 . $jObjData["c_system"] . $font2 . "</td>" : "";

										$page	.= "<tr>
												<td align='center' {$style}>" . $font1 . $c_mm . $font2 . "</td>
												<td align='center' {$style}>" . $font1 . $c_dd . $font2 . "</td>
												<td align='center' {$style}>" . $font1 . $jObjData["c_cheque"] . $font2 . "</td>
												{$c_ss}
												<td align='center' {$style}>" . $font1 . $c_name . $font2 . "</td>
												<td align='right' {$style}>" . $font1 . $f_dr . $font2 . "</td>
												<td align='right' {$style}>" . $font1 . $f_cr . $font2 . "</td>
												<td align='center' {$style}></td>
											</tr>";

										$sum_dr	+= abs($jObjData["f_dr"]);
										$sum_cr	+= abs($jObjData["f_cr"]);
									}
								}
							}
						}
					} // MONTH

					$sum_end_dr	+= $jObjY["f_end_dr"];
					$sum_end_cr	+= $jObjY["f_end_cr"];
				}
			}

			$cols	= ($_REQUEST["i_ss"] == 1) ? 5 : 4;

			$page	.= "</tbody>";
			$page	.= "<tbody style='border: 0px;'>
						<tr>
							<td style='border-left: 0px;' colspan={$cols} nowrap align=right><b>รวมเลขบัญชี : " . $jObj["company_code"] . "</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>" . number_format($sum_dr, 2) . "</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>" . number_format($sum_cr, 2) . "</b></td>
							<td nowrap style='border-left: 1px solid; border-right: 1px solid; border-bottom: 4px double;' align=right nowrap><b>" . number_format(($sum_end_dr + $sum_dr) - $sum_cr, 2) . "</b></td>
						</tr>
						<tr>
							<td style='border-left: 0px;' colspan={$cols} nowrap align=right><b>ยอดยกมา</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>" . number_format($jObj["f_dr"], 2) . "</b></td>
							<td style='border-left: 1px solid; border-right: 1px solid;' align=right nowrap><b>" . number_format($jObj["f_cr"], 2) . "</b></td>
						</tr>
						<tr>
							<td style='border-left: 0px;' colspan={$cols} nowrap align=right><b>" . $jObj["c_name"] . "</b></td>
							<td style='border: 1px solid;' align=right nowrap><b>" . number_format($sum_dr + $jObj["f_dr"], 2) . "</b></td>
							<td style='border: 1px solid;' align=right nowrap><b>" . number_format($sum_cr + $jObj["f_cr"], 2) . "</b></td>
						</tr>
					</tbody>";
			$page	.= "</table></div>";
		} // GEN PAGE
		echo $page;
		// ================================================================================= //
	} else {
		echo "ไม่มีรายการ";
	}
	?>
</body>

</html>