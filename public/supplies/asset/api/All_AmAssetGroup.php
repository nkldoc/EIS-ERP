<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$util	= new apiUtil();
$date 	= new i_date();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "dc_expense_budget_type") {

	$sqlMain	= "SELECT * FROM nmu..dc_expense_budget_type WHERE i_enable = ? ORDER BY c_name";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["dc_expense_budget_type_id"]}",
				"c_name"	=> "{$row["c_name"]}"
			);
			${$root}[] = $temp;
		}
	}
}
if ($_REQUEST["type"] == "am_mode_acc") {

	$sqlMain = "SELECT * FROM NMU_ERP.dbo.am_mode_acc WHERE i_enabled = ?";
	$arrParam	= array(STATUS_ENABLE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"		=> "{$row["am_mode_id"]}",
				"c_name"	=> $row['c_code'] . ' : ' . $row['c_name']
			);
			${$root}[] = $temp;
		}
	}
}
if ($_POST["type"] == "imp_assetall_dtl") {
	$mode = @$_REQUEST["mode"] ?? null;
    $filter = @$_REQUEST["filter"] ?? null;
    $value = @$_REQUEST["value"] ?? null;
    $i_read = @$_REQUEST["i_read"] ?? null;

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 20;
	} else {
		$limit = ($limit + $start);
	}
	$mode	= @$_REQUEST["mode"];
	$arrParam      = array();
	$arrCountParam = array();

	$con .= @$_REQUEST['id'] > 0 ? "AND a.am_asset_hdr_id NOT IN (SELECT am_asset_hdr_id FROM am_asset_edit_dtl WHERE am_asset_edit_hdr_id = " . @$_REQUEST['id'] . ")" : "";
	$sqlTempTable = "select 
						am_asset_hdr_id
                        , row_number() over (order by am_asset_hdr_id DESC) as row
					from am_asset_hdr a
                    where 1=1 and am_asset_group_hdr_id is null{$con}";
	//    echo $sqlTempTable ;
	//    exit ;
	if ($mode == "SEARCH") {
		if ($filter && $filter !== "") {
			if ($filter === "c_code") $sqlTempTable    .= " and a.c_code like ?";
			if ($filter === "c_name") $sqlTempTable    .= " and a.c_name like ?";

			$arrParam[]      = "%{$value}%";
			$arrCountParam[] = "%{$value}%";

			// echo $sqlTempTable; exit;
		}
	}
	$sqlMain = "
		SELECT 
			aa.row
			,a.am_asset_hdr_id
			,a.c_code --รหัสครุภัณฑ์ A
			,asset_name --ชื่อครุภัณฑ์ B
			,CONVERT(varchar(10),d_receive_date,120) as receive_date --วันที่รับ C
			,quantity -- จ.น. รับ  (DR) D
			,dc_unit_type --หน่วยนับ E
			,CONVERT(decimal(18,2),f_unit_cost) AS f_unit_cost --มูลค่าเริ่มต้น F
			,CASE WHEN CONVERT(decimal(18,2),f_unit_cost) < '10000' THEN '0' ELSE f_unit_cost END AS f_unit_cost2 --มูลค่าเริ่มต้น F
			,CASE WHEN CONVERT(decimal(18,2),f_unit_cost) < '10000' THEN '0' ELSE f_unit_cost END AS f_unit_cost3 --มูลค่าเริ่มต้น F
			,stockpile --คลังพัสดุ I
			,Segment --ส่วนงาน J
			,workandproject --งาน/โครงการ K
			,fund -- กองทุน L
			,event_id --รหัสกิจกรรม M
			,i_yyyy --ปีงบ N
			,budget_source --แหล่งเงิน O
			,c_detail --คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น) Q
			,c_brand --ยี่ห้อ R
			,c_model --รุ่น S
			,c_serial --Serial Number T
			,got --วิธีการได้มา U
			,salvage --วิธีคำนวณค่าเสื่อม V
			,i_period_year --อายุครุภัณฑ์(ปี) W
			,c_commet --หมายเหตุ AA
			,c_codeold2 --หมายเลขครุภัณฑ์เดิม2 AB
			,c_codeold1 --หมายเลขครุภัณฑ์เดิม1 AC
			,receipt_number --เลขที่ใบตรวจรับ AD
			,insurance_start --วันที่เริ่มรับประกัน AE
			,insurance_year --รับประกัน....ปี AF
			,insurance_month --รับประกัน....เดือน AG
			,insurance_end --วันที่สิ้นสุดรับประกัน AH
			,insurance_mote --หมายเหตุรับประกัน AI
			,c_location --สถานที่ตั้ง AJ
			,c_code_building --รหัสอาคาร AK
			,car_register --เลขทะเบียนรถ AL
			,car_type --ประเภทรถ AM
			,code_caretaker --รหัสผู้ดูแล AN
			,name_caretaker --ชื่อผู้ดูแลครุภัณฑ์ AO
			,image_file --แฟ้มรูปภาพ AP
			,barcode_status --สถานะพิมพ์บาร์โค้ด AQ
			,from_file --null
		FROM ({$sqlTempTable}) aa 
		INNER JOIN am_asset_hdr a on aa.am_asset_hdr_id = a.am_asset_hdr_id
		INNER JOIN am_asset_dtl b ON a.am_asset_hdr_id = b.am_asset_hdr_id
		WHERE
			1=1 AND aa.row > ? and aa.row <= ?
		ORDER BY row ";

	$arrParam[] = $start;
	$arrParam[] = $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	$i    = $start + 1;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"						=> $row["row"],
				"id"						=> "{$row["am_asset_hdr_id"]}",
				"c_code"                    =>	$row["c_code"],
				"c_name"                	=>	$row["asset_name"],
				"asset_name"                =>	$row["asset_name"],
				"receive_date"              => ($row["receive_date"] != "") ? $date->extDateBuddha($row["receive_date"]) : "",
				"quantity"                  =>	$row["quantity"],
				"dc_unit_type"              =>	$row["dc_unit_type"],
				"f_unit_cost"               => ($row["f_unit_cost"] != "") ? $row["f_unit_cost"] : "0",
				"f_unit_cost2"              => ($row["f_unit_cost2"] != "") ? $row["f_unit_cost2"] : "0",
				"f_unit_cost3"              => ($row["f_unit_cost3"] != "") ? $row["f_unit_cost3"] : "0",
				"stockpile"                 =>	$row["stockpile"],
				"Segment"                   =>	$row["Segment"],
				"workandproject"            =>	$row["workandproject"],
				"fund"                      =>	$row["fund"],
				"event_id"                  =>	$row["event_id"],
				"i_yyyy"                    =>	$row["i_yyyy"],
				"budget_source"             =>	$row["budget_source"],
				"c_detail"                  =>	$row["c_detail"],
				"c_brand"                   =>	$row["c_brand"],
				"c_model"                   =>	$row["c_model"],
				"c_serial"                  =>	$row["c_serial"],
				"got"                       =>	$row["got"],
				"salvage"                   =>	$row["salvage"],
				"i_period_year"             =>	$row["i_period_year"],
				"c_commet"                  =>	$row["c_commet"],
				"c_codeold2"                =>	$row["c_codeold2"],
				"c_codeold1"                =>	$row["c_codeold1"],
				"receipt_number"            =>	$row["receipt_number"],
				"insurance_start"           =>	$row["insurance_start"],
				"insurance_year"            =>	$row["insurance_year"],
				"insurance_month"           =>	$row["insurance_month"],
				"insurance_end"             =>	$row["insurance_end"],
				"insurance_mote"            =>	$row["insurance_mote"],
				"c_location"                =>	$row["c_location"],
				"c_code_building"           =>	$row["c_code_building"],
				"car_register"              =>	$row["car_register"],
				"car_type"                  =>	$row["car_type"],
				"code_caretaker"            =>	$row["code_caretaker"],
				"name_caretaker"            =>	$row["name_caretaker"],
				"image_file"                =>	$row["image_file"],
				"barcode_status"            =>	$row["barcode_status"],
				"from_file"                 =>	$row["from_file"],
			);
			${$root}[] = $temp;
		}
		
	$sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
	$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
	echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
	exit;
}
if ($_REQUEST["type"] == "Data_imp_assetall_dtl") {
	$con .= $_REQUEST['id'] > 0 ? "AND a.am_asset_hdr_id = " . $_REQUEST['id'] : "";
	
	$sqlMain = "
		SELECT 
			a.am_asset_hdr_id
			,c_code --รหัสครุภัณฑ์ A
			,asset_name --ชื่อครุภัณฑ์ B
			,CONVERT(varchar(10),d_receive_date,120) as receive_date --วันที่รับ C
			,quantity -- จ.น. รับ  (DR) D
			,dc_unit_type --หน่วยนับ E
			,CONVERT(decimal(18,2),f_unit_cost) AS f_unit_cost --มูลค่าเริ่มต้น F
			,CASE WHEN CONVERT(decimal(18,2),f_unit_cost) < '10000' THEN '0' ELSE f_unit_cost END AS f_unit_cost2 --มูลค่าเริ่มต้น F
			,CASE WHEN CONVERT(decimal(18,2),f_unit_cost) < '10000' THEN '0' ELSE f_unit_cost END AS f_unit_cost3 --มูลค่าเริ่มต้น F
			,stockpile --คลังพัสดุ I
			,Segment --ส่วนงาน J
			,workandproject --งาน/โครงการ K
			,fund -- กองทุน L
			,event_id --รหัสกิจกรรม M
			,i_yyyy --ปีงบ N
			,budget_source --แหล่งเงิน O
			,c_detail --คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น) Q
			,c_brand --ยี่ห้อ R
			,c_model --รุ่น S
			,c_serial --Serial Number T
			,got --วิธีการได้มา U
			,salvage --วิธีคำนวณค่าเสื่อม V
			,i_period_year --อายุครุภัณฑ์(ปี) W
			,c_commet --หมายเหตุ AA
			,c_codeold2 --หมายเลขครุภัณฑ์เดิม2 AB
			,c_codeold1 --หมายเลขครุภัณฑ์เดิม1 AC
			,receipt_number --เลขที่ใบตรวจรับ AD
			,insurance_start --วันที่เริ่มรับประกัน AE
			,insurance_year --รับประกัน....ปี AF
			,insurance_month --รับประกัน....เดือน AG
			,insurance_end --วันที่สิ้นสุดรับประกัน AH
			,insurance_mote --หมายเหตุรับประกัน AI
			,c_location --สถานที่ตั้ง AJ
			,c_code_building --รหัสอาคาร AK
			,car_register --เลขทะเบียนรถ AL
			,car_type --ประเภทรถ AM
			,code_caretaker --รหัสผู้ดูแล AN
			,name_caretaker --ชื่อผู้ดูแลครุภัณฑ์ AO
			,image_file --แฟ้มรูปภาพ AP
			,barcode_status --สถานะพิมพ์บาร์โค้ด AQ
			,from_file --null
		FROM am_asset_hdr a 
		INNER JOIN am_asset_dtl b ON a.am_asset_hdr_id = b.am_asset_hdr_id
		WHERE 
			1=1  
			{$con}";
	$arrParam	= array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"id"						=> "{$row["am_asset_hdr_id"]}",
				"c_code"                    =>	$row["c_code"],
				"asset_name"                =>	$row["asset_name"],
				"quantity"                  =>	$row["quantity"],
				"receive_date"              => ($row["receive_date"] != "") ? $date->extDateBuddha($row["receive_date"]) : "",
				"dc_unit_type"              =>	$row["dc_unit_type"],
				"f_unit_cost"               => ($row["f_unit_cost"] != "") ? $row["f_unit_cost"] : "0",
				"f_unit_cost2"              => ($row["f_unit_cost2"] != "") ? $row["f_unit_cost2"] : "0",
				"f_unit_cost3"              => ($row["f_unit_cost3"] != "") ? $row["f_unit_cost3"] : "0",
				"stockpile"                 =>	$row["stockpile"],
				"Segment"                   =>	$row["Segment"],
				"workandproject"            =>	$row["workandproject"],
				"fund"                      =>	$row["fund"],
				"event_id"                  =>	$row["event_id"],
				"i_yyyy"                    =>	$row["i_yyyy"],
				"budget_source"             =>	$row["budget_source"],
				"c_detail"                  =>	$row["c_detail"],
				"c_brand"                   =>	$row["c_brand"],
				"c_model"                   =>	$row["c_model"],
				"c_serial"                  =>	$row["c_serial"],
				"got"                       =>	$row["got"],
				"salvage"                   =>	$row["salvage"],
				"i_period_year"             =>	$row["i_period_year"],
				"c_commet"                  =>	$row["c_commet"],
				"c_codeold2"                =>	$row["c_codeold2"],
				"c_codeold1"                =>	$row["c_codeold1"],
				"receipt_number"            =>	$row["receipt_number"],
				"insurance_start"           =>	$row["insurance_start"],
				"insurance_year"            =>	$row["insurance_year"],
				"insurance_month"           =>	$row["insurance_month"],
				"insurance_end"             =>	$row["insurance_end"],
				"insurance_mote"            =>	$row["insurance_mote"],
				"c_location"                =>	$row["c_location"],
				"c_code_building"           =>	$row["c_code_building"],
				"car_register"              =>	$row["car_register"],
				"car_type"                  =>	$row["car_type"],
				"code_caretaker"            =>	$row["code_caretaker"],
				"name_caretaker"            =>	$row["name_caretaker"],
				"image_file"                =>	$row["image_file"],
				"barcode_status"            =>	$row["barcode_status"],
				"from_file"                 =>	$row["from_file"],
			);
			${$root}[] = $temp;
		}
	}
}




echo json_encode(array("debug" => true, $root => ${$root}));
exit;
