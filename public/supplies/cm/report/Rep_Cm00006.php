<?php
echo "PANDA";
 


include("../../conf/config.php");
include("../../ap/conf/config_ap.php");
include("../conf/config_fi.php");

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
	font-family: MS Sans Serif;
	font-size: 14px;
	box-sizing: border-box;
	-moz-box-sizing: border-box;
}
html {
	font-family: MS Sans Serif;
	font-size: 14px;
	color: #000000;
}
body {
	font-family: MS Sans Serif;
	font-size: 14px;
	padding: 0;
	margin: 0;
	color: #000000;
	background: #fff;
}
.page {
	width: 21cm;
	min-height: 29.7cm;
	padding: 1.5cm;
	margin: 1cm auto;
	border: 1px solid #eee;
}
.headTitle {
	font-size: 18px;
	font-weight: bold;
	text-transform: uppercase;
}
th,td {
	padding: 1px 2px;
}
.classTable, .classTable tr th, .classTable tr td {
	padding: 2px;
	border-collapse: collapse;
	border: 2px solid #000;
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
 
$type_arr		= array("0"=>"จัดจ้าง", "1"=>"จัดซื้อ", "2"=>"เช่า");

$sqlMain		= "	SELECT
						ROW_NUMBER() OVER (ORDER BY b.c_name) AS numrow
						,b.c_name
						,b.f_unit_cost
						,b.f_quan
						,(ISNULL(b.f_quan,0)*ISNULL(b.f_unit_cost,0)) AS period_money
						,(SELECT aa.f_tax_rate FROM dc_tax aa WHERE aa.dc_tax_id=a.dc_tax_id) AS f_tax_rate
						,a.f_tax_amount
					FROM fi_pay_tran_dtl a
						LEFT JOIN ap_period_dtl b ON a.ap_period_dtl_id=b.ap_period_dtl_id
					WHERE a.fi_pay_tran_hdr_id=?";

$sqlCount		= "SELECT COUNT(*) AS totalCount FROM ({$sqlMain}) a";

$arrParam[]		= $_REQUEST["fi_pay_tran_hdr_id"];
 
$fi				= $db->GetDataBySQL("SELECT
											a.*
											,CONVERT(VARCHAR,a.d_doc_date,120) AS s_doc_date
											,CONVERT(VARCHAR,a.d_end_pay_date,120) AS s_end_pay_date
											,b.c_name AS creditor_name
											,c.c_name AS cost_name
											,(CASE
												WHEN a.i_cont=1 THEN d.c_code_mcot
												ELSE ''
											END) AS c_code_mcot
											,(CASE
												WHEN a.i_cont=1 THEN d.c_code_egp
												ELSE ''
											END) AS c_code_egp
											,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id=bb.dc_emp_id WHERE aa.dc_user_id=a.dc_user_update_id) AS dc_user_update
											,CONVERT(VARCHAR, a.d_update, 120) AS d_update
											,(SELECT c_name FROM dc_cost aa WHERE aa.dc_cost_id=a.dc_user_update_cost_id) AS dc_user_update_cost
									FROM fi_pay_tran_hdr a
										LEFT JOIN dc_creditor_type b ON a.dc_creditor_type_id=b.dc_creditor_type_id
										LEFT JOIN dc_cost c ON a.dc_cost_id=c.dc_cost_id
										LEFT JOIN bh_contract d ON a.bh_contract_id=d.bh_contract_id
									WHERE a.fi_pay_tran_hdr_id=?", $arrParam);

$period			= $db->GetDataBySQL("SELECT
										a.fi_pay_tran_hdr_id
										,a.ap_period_hdr_id
										,c.c_code
										,c.c_name
										,c.cnt_name
										,c.i_is_purchase
										,b.i_seq
										,c.c_po_no
										,c.bg_type_name
										,c.bg_hdr_name
										,c.d_doc_date
										,c.d_contract_date
										,c.cost_name
										,c.period_money
										,a.i_cont
										,a.bh_contract_id
										,a.f_total_amount
										,(SELECT aa.f_tax_rate FROM dc_tax aa WHERE aa.dc_tax_id=b.dc_tax_adv_id) AS f_tax_rate_adv
										,(CASE
											WHEN b.i_is_unit_type_advance=1 THEN b.f_amt_advance
											ELSE (b.f_amt_advance*b.f_sum_begin)/100
										END) AS f_amt_advance
										,b.f_tax_amt_adv
										,a.f_dec_pur
										,a.dc_acc_id_dec
										,a.f_net_dec_pur
										,a.dc_tax_id
										,a.f_vat_amount
										,a.i_is_vat_amount
										,(SELECT aa.f_tax_rate FROM dc_tax aa WHERE aa.dc_tax_id=b.dc_tax_pdt_id) AS f_tax_rate_pdt
										,(CASE
											WHEN b.i_is_unit_type_product=1 THEN b.f_amt_product
											ELSE (b.f_amt_product*b.f_sum_begin)/100
										END) as f_amt_product
										,b.f_tax_amt_pdt
										,a.f_wht_amount
										,a.f_penalty
										,a.f_net_penalty
										,a.f_dep_penalty
										,a.dc_penalty_pur_id
										,(SELECT aa.c_name FROM dc_penalty aa WHERE aa.dc_penalty_id=a.dc_penalty_pur_id) AS dc_penalty_pur_name
										,a.f_net_amount
										,a.f_barter_amt
										,b.i_is_fine
										,ISNULL(b.f_fine_amt,0) AS f_fine_amt
									FROM fi_pay_tran_hdr a
										INNER JOIN ap_period_hdr b ON a.ap_period_hdr_id=b.ap_period_hdr_id
										INNER JOIN vw_period5 c ON b.ap_period_hdr_id=c.ap_period_hdr_id
									WHERE a.fi_pay_tran_hdr_id=?", array($fi["fi_pay_tran_hdr_id"]));

$totalCount		= $db->GetDataBySQL($sqlCount, $arrParam);
 

$totalCount		= 0; //Moo
//===================== set default ===================== 
$first_page_size	= 0;															// จำนวนหน้าแรก
$last_page_size		= 10;															// จำนวนหน้าสุดท้าย
$next_page_size		= 20;															// รายการทั้งหมดของแต่ละหน้า
$page_next			= 1;															// นับจำนวนหน้า
$list_page			= ceil(($totalCount + $first_page_size) / $next_page_size);		// จำนวนหน้าของรายการ
$all_page			= $list_page+1;													// จำนวนหน้าทั้งหมด
$total_last_page	= ($totalCount + $first_page_size)%$next_page_size;				// จำนวนรายการทั้งหมดของหน้าสุดท้าย(ขึ้นบรรทัดหน้าใหม่ฃ)

if( $total_last_page > $last_page_size || $total_last_page == 0 ) { $all_page++; }
//========================================================

//====================== ส่วนหัวของกระดาษ ======================

$PT1	= "";

$date_now	=$date->shot_date_from_db(date("Y-m-d"));

//$PT1	.= "<div style=\"text-align: right;\">หน้าที่ ".$page_next++."/".$all_page."</div>";

$PT1	.= "<table border=\"0\" cellpadding=\"0\" cellspacing=\"1\" width=\"100%\">
				<colgroup>
					<col width=\"15%\">
					<col width=\"25%\">
					<col width=\"35%\">
					<col width=\"25%\">
				</colgroup>
				<tr>
					<td>PICTURE</td><td colspan=\"3\" class=\"headTitle\" align=\"center\">".FI_TXT_PRE_HEADER."</td> 
				</tr>
				<tr>
					<td>&nbsp;</td><td colspan=\"3\" class=\"headTitle\" align=\"center\">ใบสำคัญจ่ายเงิน (Payment Voucher)</td> 
				</tr>				
				<tr>
					<td colspan=\"2\">".$_REQUEST["fi_pay_tran_hdr_id"].".".decoct($_REQUEST["fi_pay_tran_hdr_id"])."</td>
				</tr>
			</table>";

$tPeriod	= "";
/*
$rowData[$period["c_code"]]		= $period["c_name"];
$rowData["ชื่อเจ้าหนี้"]				= $period["cnt_name"];
$rowData["ประเภท"]				= $type_arr[$period["i_is_purchase"]];
$rowData["งวดงานที่ส่งเบิก"]			= $period["i_seq"];
$rowData["เลขที่ใบจัดซื้อ/จัดจ้าง"]		= $period["c_po_no"];
$rowData["ประเภทงบ"]				= $period["bg_type_name"];
$rowData["โครงการ"]				= $period["bg_hdr_name"];
$rowData["วันที่ใบจัดซื้อ/จัดจ้าง"]			= $date->shot_date_from_db($period["d_doc_date"]);
$rowData["วันที่ลงนามสัญญา"]			= $date->shot_date_from_db($period["d_contract_date"]);
$rowData["หน่วยรับผิดชอบ"]			= $period["cost_name"];
$rowData["จำนวนเงินรวม สัญญา/ใบสั่ง"]		= number_format($period["period_money"],2);

foreach ($rowData AS $th => $td ) { $tPeriod .= "<tr><th align=\"left\">{$th}</th><td>{$td}</td></tr>"; }

$str_bbank		= $db->GetDataBySQL("SELECT dbo.fn_get_bbank({$fi["dc_creditor_type_id"]},{$fi["dc_cnt_id"]},1)", array());
$txt_cost		= ( $fi["i_change_cost"]==1 )? " (เปลี่ยนแปลง)" : "";
$txt_barter 	= ( $fi["i_is_barter"]!= 9 )? "<tr><th align=\"right\">ใช้แลกเปลี่ยนสินค้า :</th><td>".number_format($fi["f_barter_amt"],2)." บาท</td></tr>" : "";

// สถานะส่งกลับ แสดงเหตุผลการส่งกลับ
$txt_remark		= ( $fi["i_is_status"]==0 )? "<tr><th align=\"right\">เหตุผลในการส่งกลับ :</th><td>".$f1["c_remark"]."</td></tr>" : "";
	*/
$PT1	.= "<table style=\"margin: 0 auto;\" border=\"0\" cellpadding=\"0\" cellspacing=\"2\" width=\"90%\">
				<colgroup>
					<col width=\"25%\">
					<col width=\"75%\" >
				</colgroup>
				<tr>
					<th align=\"right\">เลขที่เอกสาร :</th>
					<td style=\"color:red;\">{$fi["c_code"]}</td>
				</tr>
				<tr>
					<th align=\"right\">ประเภทเจ้าหนี้ :</th>
					<td>{$fi["creditor_name"]}</td>
				</tr>
				<tr>
					<th align=\"right\" valign=\"top\">เลขที่ใบตรวจรับ :</th>
					<td>
						<table class=\"classTable\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
							{$tPeriod}
						</table>
					</td>
				</tr>
				<tr>
					<th align=\"right\">ชื่อผู้รับเงิน :</th>
					<td>{$fi["c_receiver_name"]}</td>
				</tr>
				<tr>
					<th align=\"right\">เลขที่อ้างอิง :</th>
					<td>{$fi["c_doc_ref"]}</td>
				</tr>
				<tr>
					<th align=\"right\">เรื่อง :</th>
					<td>{$fi["c_name"]}</td>
				</tr>
				<tr>
					<th align=\"right\">วันที่เอกสาร :</th>
					<td>{$date->shot_date_from_db($fi["s_doc_date"])}</td>
				</tr>
				<tr>
					<th align=\"right\">วันที่ครบกำหนดชำระ :</th>
					<td>{$date->shot_date_from_db($fi["s_end_pay_date"])}</td>
				</tr>
				<tr>
					<th align=\"right\">หมายเหตุ :</th>
					<td>{$fi["c_comment"]}</td>
				</tr>
				<tr>
					<th align=\"right\">ประเภทเอกสารประกอบการเบิกจ่าย :</th>
					<td>{$fi["c_type_doc"]}</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวน :</th>
					<td>{$fi["c_type_doc_num"]} ฉบับ</td>
				</tr>
				<tr>
					<th align=\"right\">เลขที่สัญญา :</th>
					<td>{$fi["c_code_mcot"]}</td>
				</tr>
				<tr>
					<th align=\"right\">เลขที่สัญญา e-GP :</th>
					<td>{$fi["c_code_egp"]}</td>
				</tr>
			</table><hr />";
//========================================================
/*				
//=================== ส่วนของรายละเอียดจำนวนเงิน ===================

$PT2	= "";

//จำนวนเงินขอเบิกหลังหักค้ำประกันล่วงหน้า = จำนวนเงิน+ค้ำประกันล่วงหน้า
$f_total_amt_advance	= $fi["f_total_amount"] + $period["f_amt_advance"];
$sum_total				= ($f_total_amt_advance + $period["f_vat_amount"]) - $period["f_dec_pur"];
$f_total_amt_product	= $sum_total + $period["f_amt_product"];
$f_after_wht			= $f_total_amt_product - $period["f_wht_amount"];

$txt_amount	= ($period["i_is_vat_amount"]==1)? "(แก้ไขจำนวนเงิน)" : "";
$txt_dep	= ($period["f_dep_penalty"]>0)? "(เนื่องจาก".$db->GetDataBySQL("SELECT c_name FROM dc_penalty WHERE dc_penalty_id=?", array($fi["dc_penalty_pur_id"])).")" : "";
$txt_pnt	= "";
if( $period["i_is_fine"] == 1 ) {
	if( $period["f_fine_amt"] > 0 ) {
		$txt_pnt	= ( $period["f_fine_amt"] != $period["f_penalty"] )? "(แก้ไขจำนวนเงินค่าปรับ)" : "";
	}
}

$PT2	.= "<table style=\"margin: 0 auto;\" border=\"0\" cellpadding=\"0\" cellspacing=\"2\" width=\"90%\">
				<colgroup>
					<col width=\"45%\">
					<col width=\"25%\">
					<col width=\"30%\">
				</colgroup>
				<tr>
					<th align=\"right\">จำนวนเงิน :</th>
					<td align=\"right\">".number_format($fi["f_total_amount"],2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">ค้ำประกันล่วงหน้า :</th>
					<td align=\"right\" style=\"border-bottom: 1px solid #000;\">".number_format($period["f_amt_advance"],2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินขอเบิกหลังหักค้ำประกันล่วงหน้า :</th>
					<td align=\"right\">".number_format($f_total_amt_advance,2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินส่วนลดเงินสด :</th>
					<td align=\"right\" style=\"border-bottom: 1px solid #000;\">".number_format($fi["f_dec_pur"],2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินขอเบิกหลังหักส่วนลดเงินสด :</th>
					<td align=\"right\">".number_format($period["f_net_dec_pur"],2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินภาษีมูลค่าเพิ่ม :</th>
					<td align=\"right\" style=\"border-bottom: 1px solid #000;\">".number_format($period["f_vat_amount"],2)."</td>
					<td>บาท <font color=\"red\">{$txt_amount}</font></td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินรวมภาษีมูลค่าเพิ่ม :</th>
					<td align=\"right\">".number_format($sum_total,2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">ค้ำประกันผลงาน :</th>
					<td align=\"right\" style=\"border-bottom: 1px solid #000;\">".number_format($period["f_amt_product"],2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินขอเบิกหลังค้ำประกันผลงาน :</th>
					<td align=\"right\">".number_format($f_total_amt_product,2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินภาษีหัก ณ ที่จ่าย :</th>
					<td align=\"right\" style=\"border-bottom: 1px solid #000;\">".number_format($period["f_wht_amount"],2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินหลังหักภาษีหัก ณ ที่จ่าย :</th>
					<td align=\"right\">".number_format($f_after_wht,2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินค่าปรับ (หน่วยงาน) :</th>
					<td align=\"right\">".number_format($period["f_dep_penalty"],2)."</td>
					<td>บาท <font color=\"red\">{$txt_dep}</font></td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินค่าปรับ (ผู้ขาย/ผู้รับจ้าง) :</th>
					<td align=\"right\">".number_format($period["f_penalty"],2)."</td>
					<td>บาท <font color=\"red\">{$txt_pnt}</font></td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินหักลบกลบหนี้/แลกเปลี่ยน :</th>
					<td align=\"right\" style=\"border-bottom: 1px solid #000;\">".number_format($period["f_barter_amt"],2)."</td>
					<td>บาท</td>
				</tr>
				<tr>
					<th align=\"right\">จำนวนเงินจ่ายสุทธิ :</th>
					<td align=\"right\" style=\"border-bottom: 3px double #000;\">".number_format($period["f_net_amount"],2)."</td>
					<td>บาท</td>
				</tr>
			</table>";

//========================================================

//==================== รายละเอียดรายการจัดซื้อ =====================

$PT3		= "";
$tbody		= "";
$footer		= "";

$total_period_money		= 0;
$total_f_tax_amount		= 0;

// ค้ำประกันล่วงหน้า
$footer	.= "<br><br>
			<table class=\"classTable\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
				<thead>
					<tr><th colspan=\"4\">ค้ำประกันล่วงหน้า</th></tr>
					<tr>
						<th>งวดที่</th>
						<th>จำนวนเงินค้ำประกันล่วงหน้า</th>
						<th>อัตราภาษีหัก ณ ที่จ่าย (%)</th>
						<th>จำนวนเงินภาษีหัก ณ ที่จ่าย</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td align=\"center\">{$period["i_seq"]}</td>
						<td align=\"right\">".number_format($period["f_amt_advance"],2)."</td>
						<td align=\"right\">".number_format($period["f_tax_rate_adv"],2)."</td>
						<td align=\"right\">".number_format($period["f_tax_amt_adv"],2)."</td>
					</tr>
				</tbody>
			</table>";

// ค้ำประกันผลงาน
$footer	.= "<br><br>
			<table class=\"classTable\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
				<thead>
					<tr><th colspan=\"4\">ค้ำประกันผลงาน</th></tr>
					<tr>
						<th>งวดที่</th>
						<th>จำนวนเงินค้ำประกันผลงาน</th>
						<th>อัตราภาษีหัก ณ ที่จ่าย (%)</th>
						<th>จำนวนเงินภาษีหัก ณ ที่จ่าย</th>
					</tr>
				</thead>
				<tbody>
					<tr>
						<td align=\"center\">{$period["i_seq"]}</td>
						<td align=\"right\">".number_format($period["f_amt_product"],2)."</td>
						<td align=\"right\">".number_format($period["f_tax_rate_pdt"],2)."</td>
						<td align=\"right\">".number_format($period["f_tax_amt_pdt"],2)."</td>
					</tr>
				</tbody>
			</table>";

// ค่าปรับ
$pnt_body	= "";

$stmt_pnt	= $db->QueryParam("SELECT a.* ,b.c_name AS acc_name FROM fi_tran_penalty a LEFT JOIN dc_acc b ON a.dc_acc_id=b.dc_acc_id WHERE a.fi_pay_tran_hdr_id=?", $arrParam);
if( sqlsrv_has_rows( $stmt_pnt ) ) {
	while( $pnt=$db->Fetch( $stmt_pnt ) ) {
		$pnt_body	.= "<tr>
							<td>{$pnt["acc_name"]}</td>
							<td>{$pnt["c_comment"]}</td>
							<td align=\"right\">".number_format($pnt["f_amount"],2)."</td>
						</tr>";
	}
}

$footer	.= "<br><br>
			<table class=\"classTable\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
				<thead>
					<tr><th colspan=\"3\">ค่าปรับ</th></tr>
					<tr>
						<th>รายการค่าปรับ</th>
						<th>สาเหตุ</th>
						<th>จำนวนเงิน</th>
					</tr>
				</thead>
				<tbody>{$pnt_body}<tbody>
			</table>";

// ผู้ทำรายการ
$footer	.= "<br>
			<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
				<tbody>
					<tr>
						<td>ผู้ทำรายการล่าสุด : <font style=\"border-bottom: 1px solid #000;\">{$fi["dc_user_update"]}</font></td>
						<td>วันที่ทำรายการล่าสุด : <font style=\"border-bottom: 1px solid #000;\">{$date->shot_date_from_db($fi["d_update"])}</font></td>
						<td>หน่วยงานที่ทำรายการล่าสุด : <font style=\"border-bottom: 1px solid #000;\">{$fi["dc_user_update_cost"]}</font></td>
					</tr>
				</tbody>
			</table>";

// ขอรับรองว่าเอกสาร
$footer	.= "<br><br>
			<div class=\"headTitle\" style=\"text-align:center;\">ขอรับรองว่าเอกสารประกอบการเบิกจ่ายเป็นรายการที่เกิดขึ้นจริง<br>ถูกต้องและเกี่ยวข้องกับกิจการของ บมจ.อสมท</div>
			<br><br><br><br>
			<table border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
				<tbody>
					<tr>
						<td align=\"center\">______________________</td>
						<td align=\"center\">______________________</td>
					</tr>
					<tr>
						<td align=\"center\">ผู้ขอเบิก</td>
						<td align=\"center\">ผู้อนุมัติ</td>
					</tr>
					<tr>
						<td align=\"center\">__/__/__</td>
						<td align=\"center\">__/__/__</td>
					</tr>
				</tbody>
			</table>";

$stmt		= $db->QueryParam($sqlMain, $arrParam);
if( sqlsrv_has_rows( $stmt ) ) {
	while( $row=$db->Fetch( $stmt ) ) {

		$tbody	.= "<tr>
						<td align=\"center\">".$row["numrow"]."</td>
						<td>".$row["c_name"]."</td>
						<td align=\"right\">".number_format($row["f_unit_cost"],2)."</td>
						<td align=\"right\">".number_format($row["f_quan"],2)."</td>
						<td align=\"right\">".number_format($row["period_money"],2)."</td>
						<td align=\"right\">".number_format($row["f_tax_rate"],2)."</td>
						<td align=\"right\">".number_format($row["f_tax_amount"],2)."</td>
					</tr>";
		
		$total_period_money	+= $row["period_money"];
		$total_f_tax_amount	+= $row["f_tax_amount"];
		
		// ส่วนสุดท้าย
		if( $totalCount == $row["numrow"] ) {
			// รวม
			$tbody	.= "<tr>
							<th align=\"right\" colspan=\"4\">รวม</th>
							<th align=\"right\">".number_format($total_period_money,2)."</th>
							<th></th>
							<th align=\"right\">".number_format($total_f_tax_amount,2)."</th>
						</tr>";
		}
		
		if (($row["numrow"]+$first_page_size)%$next_page_size == 0) { // หน้าถัดไป
			
			$pageNo	= "<div style=\"text-align: right;\">หน้าที่ ".$page_next++."/".$all_page."</div>";
			$PT3	.= "<div class=\"page\">".$pageNo.NextPage($tbody)."</div>";
			$tbody	= "";
			
		}
		
		if( $totalCount == $row["numrow"] ) {
			
			if( $total_last_page == 0 ) {
	
				$pageNo	= "<div style=\"text-align: right;\">หน้าที่ ".$page_next++."/".$all_page."</div>";
				$PT3	.= "<div class=\"page\">".$pageNo.$footer."</div>";
				$tbody	= "";
				
			} else if( $total_last_page <= $last_page_size ) {
				
				$pageNo	= "<div style=\"text-align: right;\">หน้าที่ ".$page_next++."/".$all_page."</div>";
				$PT3	.= "<div class=\"page\">".$pageNo.NextPage($tbody).$footer."</div>";
				$tbody	= "";
				
			} else {
				
				$pageNo	= "<div style=\"text-align: right;\">หน้าที่ ".$page_next++."/".$all_page."</div>";
				$PT3	.= "<div class=\"page\">".$pageNo.NextPage($tbody)."</div>";
				
				$pageNo	= "<div style=\"text-align: right;\">หน้าที่ ".$page_next++."/".$all_page."</div>";
				$PT3	.= "<div class=\"page\">".$pageNo.$footer."</div>";
				$tbody	= "";
				
			}
		}
	}
} else if( $totalCount == 0 ) {
	
	$pageNo	= "<div style=\"text-align: right;\">หน้าที่ ".$page_next++."/".$all_page."</div>";
	$PT3	.= "<div class=\"page\">".$pageNo.$footer."</div>";
	$tbody	= "";
	
}
*/
//========================================================
	
function NextPage($tbody) {
	
	global $db, $date, $page_next, $all_page;
	
	$data	= "";
	$thead	= "";
	$col	= "";

	$rowHead["ที่"]					= "5%";
	$rowHead["รายการจัดซื้อ"]				= "25%";
	$rowHead["ราคา / หน่วย"]			= "14%";
	$rowHead["จำนวน"]					= "14%";
	$rowHead["จำนวนเงิน"]				= "14%";
	$rowHead["อัตราภาษีหัก<br>ณ ที่จ่าย (%)"]	= "14%";
	$rowHead["จำนวนเงินภาษีหัก<br>ณ ที่จ่าย"]	= "14%";
	
	foreach ($rowHead AS $th => $width ) {
		$col	.= "<col width=\"{$width}\">";
		$thead	.= "<th nowrap valign=\"middle\">{$th}</th>";
	}
	
	$data	.= "<table class=\"classTable\" border=\"0\" cellpadding=\"0\" cellspacing=\"0\" width=\"100%\">
					<colgroup>{$col}</colgroup>
					<thead><tr>{$thead}</tr></thead>
					<tbody>{$tbody}</tbody>
				</table>";
	
	return $data;
}
$PT2 = $PT3 = "";	
// หน้าแรก
echo "<div class=\"page\">".$PT1.$PT2."</div>";
// หน้าถัดไป
echo $PT3;
echo "<script>window.print();</script>";
?>
</body>
</html>
 -->
