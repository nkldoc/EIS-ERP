<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db			= new DatabaseServer();
$date 		= new i_date();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<style type="text/css">
		* {
			margin: 0;
			padding: 0;
			font-family: sans-serif;
			font-size: 11px;
			box-sizing: border-box;
			-moz-box-sizing: border-box;
		}

		html {
			font-family: sans-serif;
			font-size: 11px;
			color: #000000;
		}

		body {
			font-family: sans-serif;
			font-size: 11px;
			padding: 0;
			margin: 0;
			color: #000000;
			background: #fff;
		}

		.page {
			width: 21cm;
			min-height: 29.7cm;
			padding: 2cm;
			margin: 1cm auto;
			border: 1px solid #eee;
		}

		.headTitle {
			font-size: 12px;
			font-weight: bold;
			text-transform: uppercase;
		}

		@page {
			size: A4;
			margin: 0;
		}

		@media print {
			.page {
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
	$sqlTempTable	= "	SELECT
						ROW_NUMBER() OVER (ORDER BY a.i_rank) AS numrow,
						a.i_rank,
						a.dc_acc_id,
						b.c_code AS acc_code,
						b.c_name AS acc_name,
						a.dc_cost_acc_id,
						c.c_name AS cost_name,
						a.f_dr,
						a.f_cr,
						a.i_is_nontax_exp,
						a.dc_product_id,
						e.c_name AS product_name
					FROM gl_tran_dtl a
						LEFT JOIN dc_acc b ON a.dc_acc_id = b.dc_acc_id
						LEFT JOIN dc_cost c ON a.dc_cost_acc_id = c.dc_cost_id
						LEFT JOIN dc_product e ON a.dc_product_id = e.dc_product_id
					WHERE a.gl_tran_hdr_id = ?";

	$sqlMain	= "SELECT * FROM ({$sqlTempTable}) a ORDER BY a.numrow";
	$sqlCount	= "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

	$arrParam[]	= $_REQUEST["id"];

	$stmt		= $db->QueryParam($sqlMain, $arrParam);
	$totalCount	= $db->GetDataBySQL($sqlCount, $arrParam);

	$first_page_size	= 15;
	$next_page_size		= 25;
	$page_default		= 1;
	$all_page			= ceil(($totalCount + abs($next_page_size - $first_page_size)) / $next_page_size);
	$page				= "";
	$tbody				= "";
	$footer				= "";
	$total_dr			= 0;
	$total_cr			= 0;
	$chk_total			= false;

	if ($stmt) {


		$hdr	= $db->GetDataBySQL("SELECT
									a.*,
									CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date,
									CONVERT(VARCHAR, a.d_save_date, 120) AS d_save_date,
									b.c_name AS book_type_name,
									(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create,
									(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_update_post_id)) AS post_name,
									(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_boss_id)) AS boss_name,
									CASE 
										WHEN (a.i_cancel_doc_expense='1') THEN '<font color=red>ยกเลิกฎีกา e-PHIS</font>'
										WHEN (a.i_cancel_doc_expense='2') THEN '<font color=red>ยกเลิกฎีกา Vision Net</font>'
										WHEN (a.i_cancel_doc_expense='3') THEN '<font color=red>ยกเลิกโอนระหว่างธนาคาร (BTN)</font>'
										ELSE 'ปกติ'
									END as c_cancel_doc_expense
									
								FROM gl_tran_hdr a
									LEFT JOIN vw_gl_dc_book_type b ON a.gl_dc_book_type_id = b.gl_dc_book_type_id
								WHERE a.gl_tran_hdr_id = ?", array($_REQUEST["id"]));

		while ($row = $db->Fetch($stmt)) {

			$i_is_nontax_exp	= ($row["i_is_nontax_exp"] == 1) ? "<img src=\"../../images/checkbox_yes.gif\">" : "";

			$tbody	.= "<tr>
						<td>" . $row["i_rank"] . ".</td>
						<td>" . $row["acc_code"] . "</td>
						<td>" . $row["acc_name"] . "</td>
						<td>" . $row["cost_name"] . "</td>
						<td align=\"right\">" . number_format($row["f_dr"], 2) . "</td>
						<td align=\"right\">" . number_format($row["f_cr"], 2) . "</td>
						<td align=\"center\">" . $i_is_nontax_exp . "</td>
						<td>" . $row["product_name"] . "</td>
					</tr>";

			$total_dr	+= $row["f_dr"];
			$total_cr	+= $row["f_cr"];

			// รวม
			if ($totalCount == $row["numrow"]) {

				$chk_total	= true;

				$tbody	.= "<tr>
							<th colspan=\"3\" align=\"right\">รวม</th>
							<th colspan=\"2\" align=\"right\">" . number_format($total_dr, 2) . "</th>
							<th align=\"right\">" . number_format($total_cr, 2) . "</th>
						</tr>";

				if (round($total_dr) != round($total_cr)) {
					$footer	.= "<div class=\"headTitle\" style=\"margin-top: 10px; text-align: center; color: red; font-size: 16px;\">จำนวนเงิน เดบิต ไม่เท่ากับ เครดิต กรุณาตรวจสอบ</div>";
				}
				if ($hdr["i_chk_gl_dtl"] != 1) {
					$footer	.= "<div class=\"headTitle\" style=\"margin-top: 10px; text-align: center; color: red; font-size: 16px;\">บันทึกรายละเอียดสมุดรายวันไม่สมบูรณ์ กรุณาตรวจสอบรายการ</div>";
				}
 
				$txt_boss_position = ($hdr["dc_user_boss_id"]=="10") ? "รักษาการหัวหน้าฝ่ายการคลัง" : "หัวหน้าฝ่ายการคลัง";

				$footer	.= "	<div style=\"margin-top: 25px;\">
							<div class=\"headTitle\" style=\"text-align: center; text-align: left;\">
								<span>สถานะรายการ: " . (($hdr["i_enable"] == 1) ? "<span style=\"color: blue;\">ใช้งาน</span>" : "<span style=\"color: red;\">ไม่ใช้งาน</span>") . "
							</div>
							
							<div style=\"clear: both;\"><br></div>
							<div style=\"float: left; text-align: left; width: 30%;\">
								ผู้ทำรายการ: " . $hdr["dc_user_create"] . "
							</div>
							  
							<div style=\"float: right; text-align: center; width: 30%;\">
								ผู้ตรวจสอบ: " . $hdr["post_name"] . "
							</div>

							<div style=\"float: right; text-align: center; width: 40%;\">
								".$txt_boss_position.": " . $hdr["boss_name"] . "
							</div>	


							<div style=\"clear: both;\"><br></div>
						
						</div>";
				
			}
			if ($totalCount < $first_page_size && $chk_total) {
				$page	.= "<div class='page'>" . firstPage($tbody) . $footer . "</div>";
			} else if ($page_default == 1) {
				// หน้าแรก
				if ($row["numrow"] % $first_page_size == 0) {
					if ($chk_total) {
						$page	.= "<div class=\"page\">" . firstPage($tbody) . $footer . "</div>";
					} else {
						$page	.= "<div class=\"page\">" . firstPage($tbody) . "</div>";
					}
					$tbody	= "";
				}
			} else if (($row["numrow"] - $first_page_size) % $next_page_size == 0) {
				// หน้าถัดไป
				$page	.= "<div class=\"page\">" . NextPage($tbody) . $footer . "</div>";
				$tbody	= "";
			} else if ($chk_total) {

				$page	.= "<div class=\"page\">" . NextPage($tbody) . $footer . "</div>";
				$tbody	= "";
			}
		}
	}

	echo $page;

	function firstPage($tbody)
	{
		global $db, $date, $page_default, $all_page, $hdr;

		$title		= CUSTOMER_NAME_TH;
		$c_post_show = ($hdr["i_is_post"] == 3) ? $hdr["c_code_post"] : "-";
		$data		= "";

		$data	.= "<div style=\"text-align: right;\">หน้าที่ " . $page_default++ . "/" . $all_page . "</div>";
		$data	.= "<div class=\"headTitle\" style=\"text-align: center;\">" . $title . "<br>ใบสำคัญบันทึกบัญชี</div>";
		$data	.= "<table border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
							<tr>
								<td colspan=\"4\">" . $hdr["gl_tran_hdr_id"] . "." . decoct($hdr["gl_tran_hdr_id"]) . date("HisYmd") . "</td>
							</tr>
							<tr>
								<td width=\"15%\"></td>
								<td width=\"25%\"></td>
								<td width=\"35%\" class=\"headTitle\" style=\"text-align: right;\"><span style=\"font-size: 16px;\">เลขที่เอกสาร:&nbsp;</span></td>
								<td width=\"25%\" class=\"headTitle\" style=\"text-align: left;\"><span style=\"font-size: 16px;\">" . $hdr["c_ref_doc"] . "</span></td>
							</tr>
							<tr>
								<td width=\"15%\"></td>
								<td width=\"25%\"></td>
								<td width=\"35%\" class=\"headTitle\" style=\"text-align: right;\"><span style=\"font-size: 16px;\">เลขที่ผ่านรายการ:&nbsp;</span></td>
								<td width=\"25%\" class=\"headTitle\" style=\"text-align: left;\"><span style=\"font-size: 16px;\">" . $c_post_show . "</span></td>
							</tr>							
							<tr>
								<td></td>
								<td></td>
								<td class=\"headTitle\" style=\"text-align: right;\"><span style=\"font-size: 16px;\">วันที่เอกสาร:&nbsp;</span></td>
								<td class=\"headTitle\" style=\"text-align: left;\"><span style=\"font-size: 16px;\">" . $date->shot_date_from_db($hdr["d_doc_date"]) . "</span></td>
							</tr>
							<tr>
								<td style=\"text-align: right;\">ประเภทสมุดรายวัน:&nbsp;</td>
								<td>สมุด" . $hdr["book_type_name"] . "</td>
							</tr>
							<tr>
								<td style=\"text-align: right;\">เลขที่อ้างอิง:&nbsp;</td>
								<td>" . $hdr["c_code"] . "</td>
							</tr>
							<tr>
								<td style=\"text-align: right;\">วันที่บันทึกบัญชี:&nbsp;</td>
								<td>" . $date->shot_date_from_db($hdr["d_save_date"]) . "</td>
							</tr>
							<tr>
								<td style=\"text-align: right;\">Reversing Entry:&nbsp;</td>
								<td>" . (($hdr["i_is_reversing"] == 1) ? "<img src=\"../../images/checkbox_yes.gif\">" : "<img src=\"../../images/checkbox_no.jpg\">") . " โอนกลับรายการต้นงวด</td>
							</tr>
							<tr>
								<td style=\"text-align: right; vertical-align: top;\">คำอธิบายรายการ:&nbsp;</td>
								<td colspan=\"3\">" . $hdr["c_comment1"] . "</td>
							</tr>
							<tr>
								<td style=\"text-align: right;\"></td>
								<td colspan=\"3\">" . $hdr["c_comment2"] . "</td>
							</tr>
							<tr>
								<td style=\"text-align: right;\"></td>
								<td colspan=\"3\">" . $hdr["c_comment3"] . "</td>
							</tr>
							<tr>
								<td style=\"text-align: right;\">รายการ:&nbsp;</td>
								<td>" . $hdr["c_cancel_doc_expense"] . "</td>
							</tr>							
						</table><br>";
		$data	.= "<div class=\"headTitle\">รายการบันทึกบัญชี</div>";
		$data	.= "<table class=\"table-data\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"6\" width=\"100%\">
							<thead>
								<tr>
									<th class=\"headerTitle01\"  valign=\"middle\">ที่</th>
									<th class=\"headerTitle01\"  valign=\"middle\">รหัสบัญชี</th>
									<th class=\"headerTitle01\"  valign=\"middle\">ชื่อบัญชี</th>
									<th class=\"headerTitle01\"  valign=\"middle\">ศูนย์ต้นทุน</th>
									<th class=\"headerTitle01\"  valign=\"middle\">เดบิต</th>
									<th class=\"headerTitle01\"  valign=\"middle\">เครดิต</th>
									<th class=\"headerTitle01\"  valign=\"middle\">บวกกลับ</th>
									<th class=\"headerTitle01\"  valign=\"middle\">รายการรายได้</th>
								</tr>
							</thead>
							<tbody>
								" . $tbody . "
							<tbody>
						</table>";
		return $data;
	}

	function NextPage($tbody)
	{
		global $db, $date, $page_default, $all_page, $hdr;

		$data		= "";

		$data	.= "<div style=\"text-align: right;\">หน้าที่ " . $page_default++ . "/" . $all_page . "</div>";
		$data	.= "<div class=\"headTitle\">รายการบันทึกบัญชี</div>";
		$data	.= "<table class=\"table-data\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"6\" width=\"100%\">
							<thead>
								<tr>
									<th class=\"headerTitle01\"  valign=\"middle\">ที่</th>
									<th class=\"headerTitle01\"  valign=\"middle\">รหัสบัญชี</th>
									<th class=\"headerTitle01\"  valign=\"middle\">ชื่อบัญชี</th>
									<th class=\"headerTitle01\"  valign=\"middle\">ศูนย์ต้นทุน</th>
									<th class=\"headerTitle01\"  valign=\"middle\">เดบิต</th>
									<th class=\"headerTitle01\"  valign=\"middle\">เครดิต</th>
									<th class=\"headerTitle01\"  valign=\"middle\">บวกกลับ</th>
									<th class=\"headerTitle01\"  valign=\"middle\">รายการรายได้</th>
								</tr>
							</thead>
							<tbody>
								" . $tbody . "
							<tbody>
						</table>";
		return $data;
	}
	?>
</body>

</html>