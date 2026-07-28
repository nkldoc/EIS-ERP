<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/export/ArrayToXlsx.php");


$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;
	$DB_NAME = "";//'NMU_ASSET..';

	$con = ' AND a.i_budget_year = '.($_REQUEST['i_year'] + 543);

	if ($_REQUEST['dc_expense_budget_type_id'] > '0') {
		$con .= ' AND a.dc_expense_budget_type_id = ' . $_REQUEST['dc_expense_budget_type_id'];
	}
	if ($_REQUEST['am_mode_id'] > '0') {
		$con .= ' AND a.am_mode_id = ' . $_REQUEST['am_mode_id'];
	}
	if ($_REQUEST['i_qualify'] > '0') {
		$con .= ' AND isnull(a.i_cal,0) = ' . ($_REQUEST['i_qualify'] == 2 ? '0' : '1');
	}

	$sqlMain = "
		SELECT a.c_code
			, a.c_name
			, CONVERT(VARCHAR(10), d_receive_date, 120) AS d_receive_date
			, b.quantity/*จ.น. รับ  (DR)*/
			, b.dc_unit_type/*หน่วยนับ*/
			, a.f_unit_cost
			, a.segment
			, a.i_budget_year
			, a.budget_source
			, c_detail/*คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น)*/
			, c_brand/*ยี่ห้อ*/
			, c_model/*รุ่น*/
			, c_serial/*Serial Number*/
			, got/*วิธีการได้มา*/
			, a.i_period_year
			, CASE a.i_cal WHEN 1 THEN 'Y: สินทรัพย์ขึ้นบัญชี' ELSE 'N: สินทรัพย์ไม่ขึ้นบัญชี' END AS c_is_cal
			, c_commet/*หมายเหตุ*/
			, receipt_number/*เลขที่ใบตรวจรับ*/
			, c_location/*สถานที่ตั้ง*/
		FROM am_asset_hdr a
		INNER JOIN (SELECT imp_id
						, quantity, dc_unit_type, c_detail, c_brand, c_model, c_serial
						, got, c_commet, receipt_number, c_location
						FROM assetall) b ON a.imp_id = b.imp_id
		WHERE ISNULL(a.i_cutoff, 0) = 0 {$con}
		UNION ALL
		SELECT a.c_code
			, a.c_name
			, CONVERT(VARCHAR(10), d_receive_date, 120) AS d_receive_date
			, b.quantity/*จ.น. รับ  (DR)*/
			, b.dc_unit_type/*หน่วยนับ*/
			, a.f_unit_cost
			, a.segment
			, a.i_budget_year
			, a.budget_source
			, c_detail/*คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น)*/
			, c_brand/*ยี่ห้อ*/
			, c_model/*รุ่น*/
			, c_serial/*Serial Number*/
			, got/*วิธีการได้มา*/
			, a.i_period_year
			, CASE a.i_cal WHEN 1 THEN 'Y: สินทรัพย์ขึ้นบัญชี' ELSE 'N: สินทรัพย์ไม่ขึ้นบัญชี' END AS c_is_cal
			, c_commet/*หมายเหตุ*/
			, receipt_number/*เลขที่ใบตรวจรับ*/
			, c_location/*สถานที่ตั้ง*/
		FROM am_asset_hdr a
		INNER JOIN (SELECT imp_assetall_hdr_id
		, c_code, c_code2
						, quantity, dc_unit_type, c_detail, c_brand, c_model, c_serial
						, got, c_commet, receipt_number, c_location
						FROM imp_assetall_dtl) b ON a.imp_assetall_hdr_id = b.imp_assetall_hdr_id AND a.c_code = b.c_code AND a.c_code2 = b.c_code2
		WHERE ISNULL(a.i_cutoff, 0) = 0 {$con}
	";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($_REQUEST["type"] != "excel2007") {
		if ($stmt) {
			
			while ($row = $db->Fetch($stmt)) {

				$temp = array(
					"c_code"            =>	$row["c_code"],
					"c_name"            =>	$row["c_name"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"quantity"      	=>	$row["quantity"],
					"dc_unit_type"      =>	$row["dc_unit_type"],
					"f_unit_cost"     	=>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"segment"      		=>	$row["segment"],
					"i_budget_year"     =>	$row["i_budget_year"],
					"budget_source"     =>	$row["budget_source"],
					"c_detail"     		=>	$row["c_detail"],
					"c_brand"     		=>	$row["c_brand"],
					"c_model"     		=>	$row["c_model"],
					"c_serial"     		=>	$row["c_serial"],
					"got"     			=>	$row["got"],
					"i_period_year"     =>	$row["i_period_year"],
					"c_is_cal"     		=>	$row["c_is_cal"],
					"c_commet"     		=>	$row["c_commet"],
					"receipt_number"    =>	$row["receipt_number"],
					"c_location"     	=>	$row["c_location"],
				);
				${$root}[]	= $temp;
			}
		}
		return json_encode(array("debug" => true,  $root => ${$root}));
	} else {
		if ($stmt) {
			$columns[] = "รหัสครุภัณฑ์";
			$columns[] = "ชื่อครุภัณฑ์";
			$columns[] = "วันที่รับ";
			$columns[] = "จ.น. รับ  (DR)";
			$columns[] = "หน่วยนับ";
			$columns[] = "มูลค่าเริ่มต้น";
			$columns[] = "ส่วนงาน";
			$columns[] = "ปีงบ";
			$columns[] = "แหล่งเงิน";
			$columns[] = "คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น)";
			$columns[] = "ยี่ห้อ";
			$columns[] = "รุ่น";
			$columns[] = "Serial Number";
			$columns[] = "วิธีการได้มา";
			$columns[] = "อายุครุภัณฑ์(ปี)";
			$columns[] = "ชนิดครุภัณฑ์";
			$columns[] = "หมายเหตุ";
			$columns[] = "เลขที่ใบตรวจรับ";
			$columns[] = "สถานที่ตั้ง";
			
			${$root}[] = $columns;
			
			$f_unit_cost = 0;
			$f_depre_begin = 0;
			$f_mm_sum = 0;
			
			while ($row = $db->Fetch($stmt)) {
				$temp = array(
					"c_code"            =>	$row["c_code"],
					"c_name"            =>	$row["c_name"],
					"d_receive_date"    => ($row["d_receive_date"] != "") ? $date->shot_date_from_db($row["d_receive_date"]) : "",
					"quantity"      	=>	$row["quantity"],
					"dc_unit_type"      =>	$row["dc_unit_type"],
					"f_unit_cost"     	=>	$row["f_unit_cost"]  == '' ? '0.00' : $row["f_unit_cost"],
					"segment"      		=>	$row["segment"],
					"i_budget_year"     =>	$row["i_budget_year"],
					"budget_source"     =>	$row["budget_source"],
					"c_detail"     		=>	$row["c_detail"],
					"c_brand"     		=>	$row["c_brand"],
					"c_model"     		=>	$row["c_model"],
					"c_serial"     		=>	$row["c_serial"],
					"got"     			=>	$row["got"],
					"i_period_year"     =>	$row["i_period_year"],
					"c_is_cal"     		=>	$row["c_is_cal"],
					"c_commet"     		=>	$row["c_commet"],
					"receipt_number"    =>	$row["receipt_number"],
					"c_location"     	=>	$row["c_location"],
				);
				${$root}[]	= $temp;
			}
			
		}
		$xlsx = new ArrToXlsx();
		$xlsx->ArrToXlsx(${$root}, "รายงานตรวจสอบครุภัณฑ์ประจำปี");
	}
}
