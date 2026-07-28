<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;
$DATABASE_NAME = ""; //"NMU_ASSET..";

if ($_REQUEST["type"] == "am_asset_group_hdr") {



	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

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

	if ($mode == "SEARCH") {
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
		if ($_REQUEST["i_budget_year"] > 0) {
			$con .= " AND a.i_year=" . $_REQUEST["i_budget_year"];
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.am_asset_group_hdr_id) AS numrow
            ,a.am_asset_group_hdr_id
        INTO #TemData
        FROM {$DATABASE_NAME} am_asset_group_hdr a
        WHERE a.i_enable = 1 and a.i_delete = 2
            {$con};

        SELECT
            a.numrow
			,b.am_asset_group_hdr_id
			,b.c_name
			,b.i_enable
			,b.i_delete
			,c.c_comment
			,b.dc_user_create_id
			,b.dc_user_create_cost_id
			,b.dc_user_update_id
			,b.dc_user_update_cost_id
			,(SELECT TOP 1 COUNT(*) FROM am_asset_hdr aa WHERE aa.am_asset_group_hdr_id = b.am_asset_group_hdr_id) AS am_asset_count
            ,CONVERT(VARCHAR, b.d_create, 120) AS d_create
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
		INNER JOIN {$DATABASE_NAME} am_asset_group_hdr b ON a.am_asset_group_hdr_id = b.am_asset_group_hdr_id
		INNER JOIN {$DATABASE_NAME} am_asset_group_dtl c ON a.am_asset_group_hdr_id = c.am_asset_group_hdr_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;
		
		DROP TABLE #TemData";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                        => $row["numrow"],
				"id"     					=>	$row["am_asset_group_hdr_id"],
				"c_name"                    =>	$row["c_name"],
				"i_enable"                  =>	$row["i_enable"],
				"show_enable"               => ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"i_delete"                  =>	$row["i_delete"],
				"c_comment"                 =>	$row["c_comment"],
				"am_asset_count"            =>	$row["am_asset_count"],
				"dc_user_create_id"         =>	$row["dc_user_create_id"],
				"dc_user_create_cost_id"    =>	$row["dc_user_create_cost_id"],
				"dc_user_update_id"         =>	$row["dc_user_update_id"],
				"dc_user_update_cost_id"    =>	$row["dc_user_update_cost_id"],
				"d_create"                  => ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"d_update"                  => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "am_asset_group_list") {

	$sqlMain = "SET NOCOUNT ON
			SELECT
				ROW_NUMBER() OVER (ORDER BY b.c_code) AS numrow
				,a.am_asset_dtl_id as id
				,a.am_asset_hdr_id
				,b.c_code --รหัสครุภัณฑ์ A
				,a.asset_name --ชื่อครุภัณฑ์ B
				,CONVERT(VARCHAR(10),b.d_receive_date,120) as receive_date --วันที่รับ C
				,a.quantity -- จ.น. รับ  (DR) D
				,a.dc_unit_type --หน่วยนับ E
				,CONVERT(decimal(18,2),b.f_unit_cost) AS f_unit_cost --มูลค่าเริ่มต้น F
				,CASE WHEN CONVERT(decimal(18,2),b.f_unit_cost) < '10000' THEN '0' ELSE b.f_unit_cost END AS f_unit_cost2 --มูลค่าเริ่มต้น F
				,CASE WHEN CONVERT(decimal(18,2),b.f_unit_cost) < '10000' THEN '0' ELSE b.f_unit_cost END AS f_unit_cost3 --มูลค่าเริ่มต้น F
				,a.stockpile --คลังพัสดุ I
				,b.Segment --ส่วนงาน J
				,a.workandproject --งาน/โครงการ K
				,a.fund -- กองทุน L
				,a.event_id --รหัสกิจกรรม M
				,a.i_yyyy --ปีงบ N
				,b.budget_source --แหล่งเงิน O
				,a.c_detail --คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น) Q
				,a.c_brand --ยี่ห้อ R
				,a.c_model --รุ่น S
				,a.c_serial --Serial Number T
				,a.got --วิธีการได้มา U
				,a.salvage --วิธีคำนวณค่าเสื่อม V
				,b.i_period_year --อายุครุภัณฑ์(ปี) W
				,a.c_commet --หมายเหตุ AA
				,a.c_codeold2 --หมายเลขครุภัณฑ์เดิม2 AB
				,a.c_codeold1 --หมายเลขครุภัณฑ์เดิม1 AC
				,a.receipt_number --เลขที่ใบตรวจรับ AD
				,a.insurance_start --วันที่เริ่มรับประกัน AE
				,a.insurance_year --รับประกัน....ปี AF
				,a.insurance_month --รับประกัน....เดือน AG
				,a.insurance_end --วันที่สิ้นสุดรับประกัน AH
				,a.insurance_mote --หมายเหตุรับประกัน AI
				,a.c_location --สถานที่ตั้ง AJ
				,a.c_code_building --รหัสอาคาร AK
				,a.car_register --เลขทะเบียนรถ AL
				,a.car_type --ประเภทรถ AM
				,a.code_caretaker --รหัสผู้ดูแล AN
				,a.name_caretaker --ชื่อผู้ดูแลครุภัณฑ์ AO
				,a.image_file --แฟ้มรูปภาพ AP
				,a.barcode_status --สถานะพิมพ์บาร์โค้ด AQ
				,a.from_file --null
				,ISNULL(b.i_primary,0) AS i_primary
			INTO #DATA
			FROM {$DATABASE_NAME} am_asset_dtl a
			INNER JOIN {$DATABASE_NAME} am_asset_hdr b on b.am_asset_hdr_id = a.am_asset_hdr_id
			WHERE b.am_asset_group_hdr_id = ?

			SELECT 
				*
				,'0' AS i_type
			FROM #DATA
			ORDER BY numrow
		DROP TABLE #DATA";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"                        => $row["numrow"],
				"id"                        => $row["id"],
				"i_type"                    => $row["i_type"],
				"am_asset_hdr_id"       	=>	$row["am_asset_hdr_id"],
				"c_code"                    =>	$row["c_code"],
				"asset_name"                =>	$row["asset_name"],
				"receive_date"              => ($row["receive_date"] != "") ? ($row["receive_date"]) : "",
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
				"i_primary"                 =>	$row["i_primary"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
