<?php
include("../api/List_RepChkImpDebtor.php");
include("../../lib/export/exportUtil.php");

$export		= new exportUtil();

$s_title	= true;
$title		= CUSTOMER_NAME_TH;
$caption	= "รายงาน ตรวจสอบรายการเรียกเก็บ";

if ($_REQUEST["type"] == "excel") {
	$export->headerExcel($caption);
}

// $ArrCheque	= array("0" => "เลือกทั้งหมด", "1" => "เช็คที่จ่ายแล้ว", "2" => "เฉพาะเช็คค้างจ่าย", "3" => "เฉพาะเช็คยกเลิก");

$data_dtl	= json_decode(List_QueryParam(), true);

if (is_array($data_dtl) && count($data_dtl["data"]) > 0) {

	$tbody		= "<tbody>";

	foreach ($data_dtl["data"] as $index => $jObj) {

		if ($jObj["i_type"] == 1) {
			$style = "style='background-color:#dedede;'";
			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap align='left' colspan=10 {$style}><b>เลขที่ใบเรียกเก็บ : " . $jObj["c_no_charge"] . "</b></td>";
			$tbody	.=	"</tr>";
		} else if ($jObj["i_type"] == 2) {
			if (($jObj["f_charge"] - $jObj["f_pay"]) == $jObj["f_charge"]) {
				$c_status		= "ยังไม่มีรายการชำระ";
				$style			= "style='background-color: #fee9ad;'";
			} else if (($jObj["f_charge"] - $jObj["f_pay"]) != 0) {
				$c_status		= "ค้างชำระ : " . number_format(($jObj["f_charge"] - $jObj["f_pay"]), 2);
				$style			= "style='background-color: #fee9ad;'";
				// 				} else {
				// 					$c_status	= "เช็คยกเลิก";
				// 					$style			= "style='background-color: #FEADAD;'";
				// 				}
			} else {
				$c_status		= "ชำระแล้ว";
				$style			= "style='background-color: #B0FE9A;'";
			}

			$tbody	.=	"<tr>";
			$tbody	.= "<td nowrap align='center'>" . $jObj["no"] . "</td>";
			$tbody	.= "<td nowrap align='center'>" . $jObj["c_hn"] . "</td>";
			$tbody	.= "<td nowrap align='left'>" . $jObj["c_patient"] . "</td>";
			$tbody	.= "<td nowrap align='center'>" . $jObj["d_save_charge"] . "</td>";
			$tbody	.= "<td nowrap align='right'>" . number_format($jObj["f_charge"], 2) . "</td>";
			$tbody	.= "<td nowrap align='center' {$style}>" . $jObj["i_date_admission"] . "</td>";
			$tbody	.= "<td nowrap align='center' {$style}>" . $c_status . "</td>";
			$tbody	.= "<td nowrap align='center'>" . $jObj["c_no_pay"] . "</td>";
			$tbody	.= "<td nowrap align='center'>" . $jObj["d_save_pay"] . "</td>";
			$tbody	.= "<td nowrap align='right'>" . number_format($jObj["f_pay"], 2) . "</td>";
			$tbody	.=	"</tr>";
		} else {

			// 			$style	= "style='background-color:#c1c1c1;'";

			// 			$tbody	.= "<tr>";
			// 			$tbody	.= "<td {$style} colspan=3 nowrap align='right'><b>รวมทั้งสิ้น</b></td>";
			// 			$tbody	.= "<td {$style} nowrap align='right'><b>".$jObj["f_amount"]."</b></td>";
			// 			$tbody	.= "<td {$style}></td>";
			// 			$tbody	.= "<td {$style}></td>";
			// 			$tbody	.= "<td {$style}></td>";
			// 			$tbody	.= "<td {$style}></td>";
			// 			$tbody	.= "<td {$style} nowrap align='right'><b>".$jObj["f_amount_bank"]."</b></td>";
			// 			$tbody	.= "</tr>";
		}
	}

	$tbody	.= "</tbody>";
} else {
	$tbody	= "<tbody><tr><td align='center'>ไม่มีข้อมูล</td></tr></tbody>";
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
	<?php
	// $sql_bank = "SELECT
	// 				(SELECT aa.c_name FROM vw_dc_bank aa WHERE aa.dc_bank_id = a.dc_bank_id)+' '+(SELECT aa.c_name FROM vw_dc_bank_branch aa WHERE aa.dc_bank_branch_id = a.dc_bank_branch_id) AS c_name
	// 				,a.c_code
	// 			FROM dc_bank_acc_company a
	// 			WHERE dc_bank_acc_company_id = ?";
	// $bank = $db->GetDataBySQL($sql_bank, array($_REQUEST["dc_bank_acc_company_id"]));

	// $year_s				= (string)(@$_REQUEST["year_s"]);
	// $month_s			= (string)sprintf("%02d%",@$_REQUEST["month_s"],"");
	// $year_e				= (string)(@$_REQUEST["year_e"]);
	// $month_e			= (string)sprintf("%02d%",@$_REQUEST["month_e"],"");

	if ($s_title == true) {
		echo "<div align='center'><strong>" . $title . "</strong></div>";
	}

	echo "<div align='center'><strong>" . $caption . "</strong></div>";
	// echo "<div align='center'><strong>เริ่มต้นเดือนธนาคาร ".($date->l_month_thai[$month_s])." ".($year_s+543)." ถึง ".($date->l_month_thai[$month_e])." ".($year_e+543)."</strong></div>";
	// echo "<div align='left'><strong>ธนาคาร : <font color='blue'>".$bank["c_name"]."</font></strong></div>";
	// echo "<div align='left'><strong>เลขที่บัญชี : <font color='blue'>".$bank["c_code"]."</font></strong></div>";
	// echo "<div align='left'><strong>สถานะเช็ค : <font color='blue'>".$ArrCheque[$_REQUEST["i_cheque"]]."</font></strong></div>";
	?>
	<table width=100% class="table_report" border="0" cellspacing="1" cellpadding="0" style="page-break-after: always;">
		<thead valign="top">
			<tr>
				<th nowrap rowspan=2 style='vertical-align:middle;'>ลำดับที่</th>
				<th nowrap colspan=4 style='vertical-align:middle;'>ข้อมูลเรียกเก็บ</th>
				<th nowrap rowspan=2 width=150 style='vertical-align:middle;'>วันที่เข้าหอ</th>
				<th nowrap rowspan=2 width=150 style='vertical-align:middle;'>สถานะรายการ</th>
				<th nowrap colspan=3 style='vertical-align:middle;'>ข้อมูลชำระ</th>
			</tr>
			<tr>
				<th nowrap style='vertical-align:middle;'>รหัสผู้ป่วยนอก</th>
				<th nowrap style='vertical-align:middle;'>ชื่อผู้ป่วย</th>
				<th nowrap style='vertical-align:middle;'>วันที่เรียกเก็บ</th>
				<th nowrap style='vertical-align:middle;'>จำนวนเงินเรียกเก็บ</th>
				<th nowrap style='vertical-align:middle;'>เลขที่ชำระ</th>
				<th nowrap style='vertical-align:middle;'>จำนวนเงินที่ชำระ</th>
				<th nowrap style='vertical-align:middle;'>วันที่ชำระ</th>
			</tr>
		</thead>
		<?= $tbody ?>
	</table>
</body>

</html>