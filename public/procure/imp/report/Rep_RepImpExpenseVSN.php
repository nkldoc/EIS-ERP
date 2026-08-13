<?php
include("../api/List_RepImpExpenseVSN.php");
include("../../lib/export/exportUtil.php");

$export = new exportUtil();

$s_title = true;
$title = CUSTOMER_NAME_TH;

$data_dtl = json_decode(List_QueryParam(), true);

if ($_REQUEST["type_page"] == "vsn1") {
	$caption = "รายงานนำเข้าถอนคืนเงินรับฝาก (Vision Net)";
} else if ($_REQUEST["type_page"] == "vsn2") {
	$caption = "รายงานนำเข้าถอนคืนรายได้โรงพยาบาล (Vision Net)";
} else if ($_REQUEST["type_page"] == "vsn3") {
	$caption = "รายงานนำเข้าข้อมูลค่าใช้จ่าย (Vision Net)";
}

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody = "<tbody>";
	$no = 0;

	foreach ($data_dtl["data"] as $index => $jObj) {

		$style = "";

		$colspan = 14;
		if ($_REQUEST["i_prevent_money"] == 1) {
			$colspan++;
		}
		if ($_REQUEST["i_cancel"] == 1) {
			$colspan++;
		}

		// GEN TBODY
		if (@$jObj["i_type"] == 1) {

			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " align='center'>" . (++$no) . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["dc_expense_budget_type_name"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["dc_expense_acc_vsn_name"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["acc_name_lv4"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["acc_name_lv5"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["acc_name"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["c_code_impv"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["d_doc"] . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_budget_year"] . "</td>";
			if ($_REQUEST["i_prevent_money"] == 1) {
				$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["c_booking"] . "</td>";
			}
			if ($_REQUEST["i_cancel"] == 1) {
				$c_status = ($jObj["i_status"] == 2) ? "ยกเลิก" : "";
				$tbody .= "<td " . $style . " align='center' nowrap>" . $c_status . "</td>";
			}
			$tbody .= "<td " . $style . " align='center'>" . $jObj["c_approve"] . "</td>";
			$tbody .= "<td " . $style . " align='center'>" . $jObj["c_request"] . "</td>";
			$tbody .= "<td " . $style . " align='center'>" . $jObj["c_creditor"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["c_expense_group_main"] . "</td>";
			$tbody .= "<td " . $style . ">" . $jObj["c_acc_item"] . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_inv"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_tax_personal"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_social_security"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_prov_fund"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_fine"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='right'>" . number_format($jObj["f_total"], 2) . "</td>";
			$tbody .= "<td " . $style . " align='center' nowrap>" . $jObj["d_cheque"] . "</td>";
			$tbody .= "<td " . $style . " align='center'>" . $jObj["c_cheque"] . "</td>";
			$tbody .= "</tr>";
		} else if (@$jObj["i_type"] == 2) {

			$style = "style='background:#eaf9f8;'";

			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='{$colspan}' colspanall='{$colspan}' align='right'><b>รวมบัญชีคุม LV4 : " . $jObj["acc_name_lv4"] . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_inv"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_personal"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_social_security"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_prov_fund"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_fine"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_total"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='center' colspan='2' colspanall='2'></td>";

			$tbody .= "</tr>";
		} else if (@$jObj["i_type"] == 3) {

			$style = "style='background:#d8d8d8;'";

			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='{$colspan}' colspanall='{$colspan}' align='right'><b>รวมทั้งสิ้น</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_inv"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_personal"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_social_security"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_prov_fund"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_fine"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_total"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='center' colspan='2' colspanall='2'></td>";

			$tbody .= "</tr>";
		} else if (@$jObj["i_type"] == 4) {

			$style = "style='background:#fdd08b;'";

			$colspan = 14;
			if ($_REQUEST["i_prevent_money"] == 1) {
				$colspan++;
			}
			if ($_REQUEST["i_cancel"] == 1) {
				$colspan++;
			}

			$tbody .= "<tr height=20>";
			$tbody .= "<td " . $style . " colspan='{$colspan}' colspanall='{$colspan}' align='right'><b>รวมบัญชีคุม LV5 : " . $jObj["acc_name_lv5"] . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_inv"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_personal"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_social_security"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_prov_fund"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_fine"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_total"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='center' colspan='2' colspanall='2'></td>";
			$tbody .= "</tr>";
		} else if (@$jObj["i_type"] == 5 || @$jObj["i_type"] == 7) {

			if ($jObj["i_type"] == 5) {
				$style = "style='background:#fffc9a;'";
			} else if ($jObj["i_type"] == 7) {
				$style = "style='background:#c9f3f0;'";
			}

			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " colspan='{$colspan}' colspanall='{$colspan}' align='right'><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>(" . number_format($jObj["f_inv"], 2) . ")</b></td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='right'><b>(" . number_format($jObj["f_total"], 2) . ")</b></td>";
			$tbody .= "<td " . $style . " align='center' colspan=2 colspanall=2></td>";
			$tbody .= "</tr>";
		} else if (@$jObj["i_type"] == 6 || @$jObj["i_type"] == 8 || @$jObj["i_type"] == 10) {
			if ($jObj["i_type"] == 6) {
				$style = "style='background:#fdff60;'";
			} else if ($jObj["i_type"] == 8) {
				$style = "style='background:#6cc5bf;'";
			} else if ($jObj["i_type"] == 10) {
				$style = "style='background:#a2a2a2;'";
			}
			$f_inv = ($jObj["f_inv"] >= 0) ? number_format($jObj["f_inv"], 2) : "(" . number_format(abs($jObj["f_inv"]), 2) . ")";
			$f_total = ($jObj["f_total"] >= 0) ? number_format($jObj["f_total"], 2) : "(" . number_format(abs($jObj["f_total"]), 2) . ")";

			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " colspan='{$colspan}' colspanall='{$colspan}' align='right'><b>" . $jObj["c_name"] . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . $f_inv . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_tax_personal"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_social_security"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_prov_fund"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . number_format($jObj["f_fine"], 2) . "</b></td>";
			$tbody .= "<td " . $style . " align='right'><b>" . $f_total . "</b></td>";
			$tbody .= "<td " . $style . " align='center' colspan=2 colspanall=2></td>";
			$tbody .= "</tr>";
		} else if (@$jObj["i_type"] == 9) {

			if ($jObj["i_type"] == 9) {
				$style = "style='background:#bdbdbd;'";
			}
			$a = "<a href='./Rep_RepImpExpenseVSN_DTL.php?{$_SERVER['QUERY_STRING']}&i_return={$jObj["i_return"]}' target='Rep_RepImpExpenseVSN_DTL'><b>" . $jObj["c_name"] . "</b></a>";

			$tbody .= "<tr>";
			$tbody .= "<td " . $style . " colspan='{$colspan}' colspanall='{$colspan}' align='right'>{$a}</td>";
			$tbody .= "<td " . $style . " align='right'><b>(" . number_format($jObj["f_inv"], 2) . ")</b></td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='center'>-</td>";
			$tbody .= "<td " . $style . " align='right'><b>(" . number_format($jObj["f_total"], 2) . ")</b></td>";
			$tbody .= "<td " . $style . " align='center' colspan=2 colspanall=2></td>";
			$tbody .= "</tr>";
		}
	}

	$tbody .= "</tbody>";
} else {
	$tbody = "<tbody><tr><td align='center' colspan=22>ไม่มีข้อมูล</td></tr></tbody>";
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

		$for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$stmt = $db->QueryParam("SELECT c_name FROM dc_expense_budget_type WHERE dc_expense_budget_type_id IN (" . $in . ")", array());

			if ($stmt) {
				$name = "";
				while ($row = $db->Fetch($stmt)) {
					$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
				}
			}
			$budget_name = "แหล่งเงิน : <font color='blue'>" . $name . "</font>";
		} else {
			$budget_name = "แหล่งเงิน : <font color='blue'>เลือกทั้งหมด</font>";
		}

		$c_tax  = "";
		if ($_REQUEST["i_cal_gl"] == 1) {
			$c_tax  = "<br>เงินเดือนจ่ายพนักงาน";
		} else if ($_REQUEST["i_cal_gl"] == 2) {
			$c_tax  = "<br>จ่ายให้บริษัท";
		}

		if ($_REQUEST["dc_expense_acc_vsn_id"] > 0) {
			$dc_expense_acc_vsn_name = $db->GetDataBySQL("SELECT c_name FROM dc_expense_acc_vsn WHERE dc_expense_acc_vsn_id=?;", array(
				$_REQUEST["dc_expense_acc_vsn_id"]
			));
		} else {
			$dc_expense_acc_vsn_name = "เลือกทั้งหมด";
		}

		// =======================================//
		if ($_REQUEST["i_show_acc"] == 1) {
			$for_id = explode(";", $_REQUEST["dc_acc_id_parent"]);
			if (!in_array("0", $for_id)) {
				$in = "";
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$stmt = $db->QueryParam("SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array());

				if ($stmt) {
					$name = "";
					while ($row = $db->Fetch($stmt)) {
						$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
					}
				}
				$parent_name = "รายการบัญชีคุม Lv4 : <font color='blue'>" . $name . "</font>";
			} else {
				$parent_name = "รายการบัญชีคุม Lv4 : <font color='blue'>เลือกทั้งหมด</font>";
			}
		} else if ($_REQUEST["i_show_acc"] == 3) {
			$for_id = explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
			if (!in_array("0", $for_id)) {
				$in = "";
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$stmt = $db->QueryParam("SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array());

				if ($stmt) {
					$name = "";
					while ($row = $db->Fetch($stmt)) {
						$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
					}
				}
				$parent_name_lv5 = "รายการบัญชีคุม Lv5 : <font color='blue'>" . $name . "</font>";
			} else {
				$parent_name_lv5 = "รายการบัญชีคุม Lv5 : <font color='blue'>เลือกทั้งหมด</font>";
			}
		} else {
			$for_id = explode(";", $_REQUEST["dc_acc_id"]);
			if (!in_array("0", $for_id)) {
				$in = "";
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$stmt = $db->QueryParam("SELECT c_name FROM dc_acc WHERE dc_acc_id IN (" . $in . ")", array());

				if ($stmt) {
					$name = "";
					while ($row = $db->Fetch($stmt)) {
						$name .= ($name == "") ? $row["c_name"] : ", " . $row["c_name"];
					}
				}
				$acc_name = "รายการบัญชีย่อย : <font color='blue'>" . $name . "</font>";
			} else {
				$acc_name = "รายการบัญชีย่อย : <font color='blue'>เลือกทั้งหมด</font>";
			}
		}

		if ($_REQUEST["i_show_acc"] == 1) {
			$c_show_acc = $parent_name;
		} else if ($_REQUEST["i_show_acc"] == 3) {
			$c_show_acc = $parent_name_lv5;
		} else {
			$c_show_acc = $acc_name;
		}

		if ($_REQUEST["i_system"] == 1) {
			$c_system = "ระบบ : <font color='blue'>E-phis</font>";
		} else if ($_REQUEST["i_system"] == 2) {
			$c_system = "ระบบ : <font color='blue'>Vision net</font>";
		} else {
			$c_system = "ระบบ : <font color='blue'>ทั้งหมด</font>";
		}
		// =======================================//

		echo "<div align='center'><strong>" . $caption . "</strong></div>";
		echo "<div align='center'><strong>วันที่นำเข้า " . $date->shot_date_from_db($_REQUEST["d_date_start"]) . " ถึงวันที่ : " . $date->shot_date_from_db($_REQUEST["d_date_end"]) . "</strong></div>";
		?>
		<div style='position: relative; font-size: 11px; margin: 5px 10px;'>
			<div style='position: relative; left: 2px;'><?= $budget_name; ?></div>
			<div style='position: relative; left: 2px;'>รายจ่ายย่อย : <font color='blue'><?= $dc_expense_acc_vsn_name ?></font>
			</div>
			<div style='position: relative; left: 2px;'><?= $c_show_acc; ?></div>
			<div style='position: relative; left: 2px;'><?= $c_system; ?></div>
		</div>
		<div class="table-overflow">
			<table width="100%" class="table_report" border="0" cellspacing="1" cellpadding="0">
				<thead valign="top">
					<tr>
						<th style="vertical-align:middle;" nowrap>ลำดับที่</th>
						<th style='vertical-align:middle;' nowrap>เงินรายได้</th>
						<th style='vertical-align:middle;' nowrap>รายจ่ายย่อย</th>
						<th style='vertical-align:middle;' nowrap>บัญชีคุม Lv 4</th>
						<th style='vertical-align:middle;' nowrap>บัญชีคุม Lv 5</th>
						<th style='vertical-align:middle;' nowrap>บัญชีย่อย</th>
						<th style='vertical-align:middle;' nowrap>เลขที่ค่าใช้จ่าย</th>
						<th style='vertical-align:middle;'>วันที่ดำเนินการจัดทำทะเบียนจ่าย</th>
						<th style='vertical-align:middle;' nowrap>ปีงบประมาณ</th>
						<?php
						if ($_REQUEST["i_prevent_money"] == 1) {
							echo "<th style='vertical-align:middle;'>เลขที่ใบขอกันเงิน</th>";
						}
						if ($_REQUEST["i_cancel"] == 1) {
							echo "<th style='vertical-align:middle;'>สถานะฏีกา</th>";
						}
						?>
						<th style='vertical-align:middle;' nowrap>เลขที่ฎีกา</th>
						<th style='vertical-align:middle;'>เลขที่เอกสารตั้งหนี้</th>
						<th style='vertical-align:middle;' nowrap>ชื่อผู้รับเงิน</th>
						<th style='vertical-align:middle;' nowrap>หมวดรายจ่าย</th>
						<th style='vertical-align:middle;' nowrap>รายการ</th>
						<th style='vertical-align:middle;'>จำนวนขอเบิกทั้งสิ้น</th>
						<th style='vertical-align:middle;' nowrap>ภาษีหัก ณ ที่จ่าย<?= $c_tax; ?></th>
						<th style='vertical-align:middle;'>ค่าประกันสังคม</th>
						<th style='vertical-align:middle;'>กองทุนสำรองเลี้ยงชีพ</th>
						<th style='vertical-align:middle;'>ค่าปรับ/ค่าประกันผลงาน</th>
						<th style='vertical-align:middle;'>จำนวนเงินที่จ่าย</th>
						<th style='vertical-align:middle;' nowrap>วันที่ในเช็ค</th>
						<th style='vertical-align:middle;' nowrap>เลขที่เช็ค</th>
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