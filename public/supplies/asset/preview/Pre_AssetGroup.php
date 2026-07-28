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
	<link rel="stylesheet" type="text/css" href="../../css/report_css.css" />
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
			min-height: 21cm;
			width: 29.7cm;
			/* height: 21cm; */
			/* size: A4; */
			size: A4 landscape;
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
			size: A4 landscape;
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
	$sqlTempTable	= "		
		select 
			b.c_code
			,b.acc_code
			,b.acc_name
			,b.asset_name
			,b.receive_date
			,b.dc_unit_type
			,b.f_unit_cost
			,b.i_period_year
			,b.i_yyyy
			,b.budget_source
			,ROW_NUMBER() OVER (ORDER BY b.c_code) AS numrow
		from imp_assetall_hdr a
		inner join imp_assetall_dtl b on a.imp_assetall_hdr_id = b.imp_assetall_hdr_id
		where a.imp_assetall_hdr_id = 8";

	$sqlMain	= "SELECT * FROM ({$sqlTempTable}) a ORDER BY a.numrow";
	$sqlCount	= "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";

	$arrParam[]	= $_REQUEST["id"];

	$stmt		= $db->QueryParam($sqlMain, $arrParam);
	$totalCount	= $db->GetDataBySQL($sqlCount, $arrParam);

	$first_page_size	= 15;
	$next_page_size		= 20;
	$page_default		= 1;
	$all_page			= ceil(($totalCount + abs($next_page_size - $first_page_size)) / $next_page_size);
	$page				= "";
	$tbody				= "";
	$footer				= "";
	$total_dr			= 0;
	$total_cr			= 0;
	$chk_total			= false;

	if ($stmt) {


		// $hdr	= $db->GetDataBySQL("SELECT
		// 							a.*,
		// 							CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date,
		// 							CONVERT(VARCHAR, a.d_save_date, 120) AS d_save_date,
		// 							b.c_name AS book_type_name,
		// 							(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create,
		// 							(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_update_post_id)) AS post_name,
		// 							(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_boss_id)) AS boss_name,
		// 							CASE 
		// 								WHEN (a.i_cancel_doc_expense='1') THEN '<font color=red>ยกเลิกฎีกา e-PHIS</font>'
		// 								WHEN (a.i_cancel_doc_expense='2') THEN '<font color=red>ยกเลิกฎีกา Vision Net</font>'
		// 								WHEN (a.i_cancel_doc_expense='3') THEN '<font color=red>ยกเลิกโอนระหว่างธนาคาร (BTN)</font>'
		// 								ELSE 'ปกติ'
		// 							END as c_cancel_doc_expense
									
		// 						FROM gl_tran_hdr a
		// 							LEFT JOIN vw_gl_dc_book_type b ON a.gl_dc_book_type_id = b.gl_dc_book_type_id
		// 						WHERE a.gl_tran_hdr_id = ?", array($_REQUEST["id"]));

		while ($row = $db->Fetch($stmt)) {

		// 	$i_is_nontax_exp	= ($row["i_is_nontax_exp"] == 1) ? "<img src=\"../../images/checkbox_yes.gif\">" : "";

			$tbody	.= "<tr>
						<td align=\"center\" nowrap>" . $row["numrow"] . "</td>
						<td align=\"center\" nowrap>" . $row["c_code"] . "</td>
						<td align=\"center\" nowrap>" . $row["acc_code"] . "</td>
						<td align=\"center\" nowrap>" . $row["acc_name"] . "</td>
						<td align=\"left\" nowrap>" . $row["asset_name"] . "</td>
						<td align=\"right\" nowrap>" . number_format($row["f_unit_cost"], 2) . "</td>
						<td align=\"center\" nowrap>" . $row["receive_date"] . "</td>
						<td align=\"center\" nowrap>" . $row["i_period_year"] . "</td>
						<td align=\"center\" nowrap>" . $row["i_yyyy"] . "</td>
						<td align=\"center\" nowrap>" . $row["budget_source"] . "</td>
					</tr>";

		// 	$total_dr	+= $row["f_dr"];
		// 	$total_cr	+= $row["f_cr"];

		// 	รวม
		// 	if ($totalCount == $row["numrow"]) {

		// 		$chk_total	= true;

		// 		$tbody	.= "<tr>
		// 					<th colspan=\"3\" align=\"right\">รวม</th>
		// 					<th colspan=\"2\" align=\"right\">" . number_format($total_dr, 2) . "</th>
		// 					<th align=\"right\">" . number_format($total_cr, 2) . "</th>
		// 				</tr>";

		// 		if (round($total_dr) != round($total_cr)) {
		// 			$footer	.= "<div class=\"headTitle\" style=\"margin-top: 10px; text-align: center; color: red; font-size: 16px;\">จำนวนเงิน เดบิต ไม่เท่ากับ เครดิต กรุณาตรวจสอบ</div>";
		// 		}
		// 		if ($hdr["i_chk_gl_dtl"] != 1) {
		// 			$footer	.= "<div class=\"headTitle\" style=\"margin-top: 10px; text-align: center; color: red; font-size: 16px;\">บันทึกรายละเอียดสมุดรายวันไม่สมบูรณ์ กรุณาตรวจสอบรายการ</div>";
		// 		}
 
		// 		$txt_boss_position = ($hdr["dc_user_boss_id"]=="10") ? "รักษาการหัวหน้าฝ่ายการคลัง" : "หัวหน้าฝ่ายการคลัง";

		// 		$footer	.= "	<div style=\"margin-top: 25px;\">
		// 					<div class=\"headTitle\" style=\"text-align: center; text-align: left;\">
		// 						<span>สถานะรายการ: " . (($hdr["i_enable"] == 1) ? "<span style=\"color: blue;\">ใช้งาน</span>" : "<span style=\"color: red;\">ไม่ใช้งาน</span>") . "
		// 					</div>
							
		// 					<div style=\"clear: both;\"><br></div>
		// 					<div style=\"float: left; text-align: left; width: 30%;\">
		// 						ผู้ทำรายการ: " . $hdr["dc_user_create"] . "
		// 					</div>
							  
		// 					<div style=\"float: right; text-align: center; width: 30%;\">
		// 						ผู้ตรวจสอบ: " . $hdr["post_name"] . "
		// 					</div>

		// 					<div style=\"float: right; text-align: center; width: 40%;\">
		// 						".$txt_boss_position.": " . $hdr["boss_name"] . "
		// 					</div>	


		// 					<div style=\"clear: both;\"><br></div>
						
		// 				</div>";
				
			// }
			if ($totalCount < $first_page_size && $chk_total) {
				$page	.= "<div class='page'>" . firstPage($tbody) . $footer . "</div>";
			} else if ($page_default == 1) {
				// หน้าแรก
				//echo $row["numrow"] % $first_page_size;
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

		//โอนกลับรายการต้นงวด

		$data	.= "<div style=\"text-align: right;\">หน้าที่ " . $page_default++ . "/" . $all_page . "</div>";
		$data	.= "<div class=\"headTitle\" style=\"text-align: center;\">" . $title . "<br>สรุปข้อมูลนำเข้า</div>";
		// $data	.= "<table border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
		// 					<tr>
		// 						<td colspan=\"4\">" . $hdr["gl_tran_hdr_id"] . "." . decoct($hdr["gl_tran_hdr_id"]) . date("HisYmd") . "</td>
		// 					</tr>
							
		// 					<tr>
		// 						<td width=\"15%\"></td>
		// 						<td width=\"25%\"></td>
		// 						<td width=\"35%\" class=\"headTitle\" style=\"text-align: right;\"><span style=\"font-size: 16px;\">เลขที่เอกสาร:&nbsp;</span></td>
		// 						<td width=\"25%\" class=\"headTitle\" style=\"text-align: left;\"><span style=\"font-size: 16px;\">" . $hdr["c_ref_doc"] . "</span></td>
		// 					</tr>
		// 					<tr>
		// 						<td width=\"15%\"></td>
		// 						<td width=\"25%\"></td>
		// 						<td width=\"35%\" class=\"headTitle\" style=\"text-align: right;\"><span style=\"font-size: 16px;\">เลขที่ผ่านรายการ:&nbsp;</span></td>
		// 						<td width=\"25%\" class=\"headTitle\" style=\"text-align: left;\"><span style=\"font-size: 16px;\">" . $c_post_show . "</span></td>
		// 					</tr>							
		// 					<tr>
		// 						<td></td>
		// 						<td></td>
		// 						<td class=\"headTitle\" style=\"text-align: right;\"><span style=\"font-size: 16px;\">วันที่เอกสาร:&nbsp;</span></td>
		// 						<td class=\"headTitle\" style=\"text-align: left;\"><span style=\"font-size: 16px;\">" . $date->shot_date_from_db($hdr["receive_date"]) . "</span></td>
		// 					</tr>
		// 					<tr>
		// 						<td style=\"text-align: right;\">ประเภทสมุดรายวัน:&nbsp;</td>
		// 						<td>สมุด</td>
		// 					</tr>
		// 					<tr>
		// 						<td style=\"text-align: right;\">เลขที่อ้างอิง:&nbsp;</td>
		// 						<td></td>
		// 					</tr>
		// 					<tr>
		// 						<td style=\"text-align: right;\">วันที่บันทึกบัญชี:&nbsp;</td>
		// 						<td></td>
		// 					</tr>
		// 					<tr>
		// 						<td style=\"text-align: right;\">Reversing Entry:&nbsp;</td>
		// 						<td> ไม่เป็นรายการโอนกลับต้นงวด</td>
		// 					</tr>						
		// 				</table><br>";
		$data	.= "<br><table class=\"table_report\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"6\" width=\"100%\">
							<thead>
								<tr>
									<th class=\"headerTitle01\"  valign=\"middle\">ที่</th>
									<th class=\"headerTitle01\"  valign=\"middle\">รหัสครุภัณฑ์</th>
									<th class=\"headerTitle01\"  valign=\"middle\">ชื่อบัญชี</th>
									<th class=\"headerTitle01\"  valign=\"middle\">รหัสบัญชี</th>
									<th class=\"headerTitle01\"  valign=\"middle\">ชื่อครุภัณฑ์</th>
									<th class=\"headerTitle01\"  valign=\"middle\">มูลต่าที่ได้มา</th>
									<th class=\"headerTitle01\"  valign=\"middle\">วันที่ได้รับ</th>
									<th class=\"headerTitle01\"  valign=\"middle\">อายุการใช้งาน(ปี)</th>
									<th class=\"headerTitle01\"  valign=\"middle\">ปีงบประมาณ</th>
									<th class=\"headerTitle01\"  valign=\"middle\">แหล่งเงิน</th>
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
		$data .= "<pagebreak />";
		$data	.= "<div style=\"text-align: right;\">หน้าที่ " . $page_default++ . "/" . $all_page . "</div>";
		$data	.= "<br><table class=\"table_report\" border=\"0\" align=\"center\" cellpadding=\"0\" cellspacing=\"6\" width=\"100%\">
							<thead>
								<tr>
								<th class=\"headerTitle01\"  valign=\"middle\">ที่</th>
								<th class=\"headerTitle01\"  valign=\"middle\">รหัสครุภัณฑ์</th>
								<th class=\"headerTitle01\"  valign=\"middle\">ชื่อบัญชี</th>
								<th class=\"headerTitle01\"  valign=\"middle\">รหัสบัญชี</th>
								<th class=\"headerTitle01\"  valign=\"middle\">ชื่อครุภัณฑ์</th>
								<th class=\"headerTitle01\"  valign=\"middle\">มูลต่าที่ได้มา</th>
								<th class=\"headerTitle01\"  valign=\"middle\">วันที่ได้รับ</th>
								<th class=\"headerTitle01\"  valign=\"middle\">อายุการใช้งาน(ปี)</th>
								<th class=\"headerTitle01\"  valign=\"middle\">ปีงบประมาณ</th>
								<th class=\"headerTitle01\"  valign=\"middle\">แหล่งเงิน</th>
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