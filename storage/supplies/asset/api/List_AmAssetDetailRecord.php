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
$DB_NAME = ""; //"NMU_ASSET..";

if ($_REQUEST["type"] == "am_asset_detail_record_hdr") {



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
		// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 	$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		// }
		// if ($_REQUEST["i_budget_year"] > 0) {
		// 	$con .= " AND a.i_year=" . $_REQUEST["i_budget_year"];
		// }
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.am_asset_hdr_id) AS numrow
			,a.am_asset_hdr_id
		INTO #TemData
		FROM {$DB_NAME} am_asset_hdr a
		WHERE a.am_asset_hdr_id in (SELECT parent_id FROM am_asset_hdr WHERE parent_id IS NOT NULL)
			{$con};


		SELECT
			tem.numrow
			,b.am_asset_dtl_id as id
			,b.am_asset_hdr_id
			,a.c_code --รหัสครุภัณฑ์ A
			,b.asset_name --ชื่อครุภัณฑ์ B
			,CONVERT(VARCHAR(10),a.d_receive_date,120) as receive_date --วันที่รับ C
			,b.quantity -- จ.น. รับ  (DR) D
			,b.dc_unit_type --หน่วยนับ E
			,CONVERT(decimal(18,2),a.f_unit_cost) AS f_unit_cost --มูลค่าเริ่มต้น F
			,CASE WHEN CONVERT(decimal(18,2),a.f_unit_cost) < '10000' THEN '0' ELSE a.f_unit_cost END AS f_unit_cost2 --มูลค่าเริ่มต้น F
			,CASE WHEN CONVERT(decimal(18,2),a.f_unit_cost) < '10000' THEN '0' ELSE a.f_unit_cost END AS f_unit_cost3 --มูลค่าเริ่มต้น F
			,b.stockpile --คลังพัสดุ I
			,a.Segment --ส่วนงาน J
			,b.workandproject --งาน/โครงการ K
			,b.fund -- กองทุน L
			,b.event_id --รหัสกิจกรรม M
			,b.i_yyyy --ปีงบ N
			,a.budget_source --แหล่งเงิน O
			,b.c_detail --คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น) Q
			,b.c_brand --ยี่ห้อ R
			,b.c_model --รุ่น S
			,b.c_serial --Serial Number T
			,b.got --วิธีการได้มา U
			,b.salvage --วิธีคำนวณค่าเสื่อม V
			,a.i_budget_year
			,a.i_period_year --อายุครุภัณฑ์(ปี) W
			,a.dc_expense_budget_type_id
			,b.c_commet --หมายเหตุ AA
			,b.c_codeold2 --หมายเลขครุภัณฑ์เดิม2 AB
			,b.c_codeold1 --หมายเลขครุภัณฑ์เดิม1 AC
			,b.receipt_number --เลขที่ใบตรวจรับ AD
			,b.insurance_start --วันที่เริ่มรับประกัน AE
			,b.insurance_year --รับประกัน....ปี AF
			,b.insurance_month --รับประกัน....เดือน AG
			,b.insurance_end --วันที่สิ้นสุดรับประกัน AH
			,b.insurance_mote --หมายเหตุรับประกัน AI
			,b.c_location --สถานที่ตั้ง AJ
			,b.c_code_building --รหัสอาคาร AK
			,b.car_register --เลขทะเบียนรถ AL
			,b.car_type --ประเภทรถ AM
			,b.code_caretaker --รหัสผู้ดูแล AN
			,b.name_caretaker --ชื่อผู้ดูแลครุภัณฑ์ AO
			,b.image_file --แฟ้มรูปภาพ AP
			,b.barcode_status --สถานะพิมพ์บาร์โค้ด AQ
			,b.from_file --null
			,ISNULL(a.i_primary,0) AS i_primary
		from #TemData tem
		INNER JOIN {$DB_NAME} am_asset_hdr a on tem.am_asset_hdr_id = a.am_asset_hdr_id
		INNER JOIN {$DB_NAME} am_asset_dtl b on a.am_asset_hdr_id = b.am_asset_hdr_id
		WHERE tem.numrow > ? AND tem.numrow <= ? ORDER BY tem.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;
		
		DROP TABLE #TemData";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                            => $row["numrow"],
				"id"                            => $row["am_asset_hdr_id"],
				"c_code"                        => $row["c_code"],
				"asset_name"                    => $row["asset_name"],
				"f_unit_cost"                   => $row["f_unit_cost"],
				"i_budget_year"                 => $row["i_budget_year"],
				"dc_expense_budget_type_id"     => $row["dc_expense_budget_type_id"],
				"budget_source"                 => $row["budget_source"],
				"d_receive_date"                => ($row["receive_date"] != "") ? $date->extDateBuddha($row["receive_date"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "am_asset_detail_record_dtl") {

	$sqlMain = "SET NOCOUNT ON
		SELECT 
			am_asset_hdr_id AS id
			,a.c_code --เจนเอง
			,a.c_name -- กรอกมา
			,a.am_mode_id -- กรอกมา
			,b.c_code as c_code_mode
			,b.c_name as c_name_mode
			,acc_code -- ค่าจะมาจาก AM mode
			,acc_name -- ค่าจะมาจาก AM mode
			,isnull(a.i_period_year, 0.00) as i_period_year -- ค่าจะมาจาก AM mode
			,f_unit_cost --กรอกมา
			,CONVERT(VARCHAR(10),d_receive_date,120) AS  d_receive_date -- จากแม่
			,dc_expense_budget_type_id -- จากแม่
			,budget_source -- จากแม่
			,i_budget_year -- จากแม่
			,i_cal -- น้อยกว่า 10000 เท่ากับ 0 มากกว่าหรือเท่ากับ 10000 = 1
			,right(a.c_code,5) as c_code_no
		FROM am_asset_hdr a
		left join am_mode_acc b on a.am_mode_id = b.am_mode_id

		WHERE parent_id = ?
		ORDER BY right(a.c_code,5)";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"no"                            =>  ++$no,
				"c_code_no"                     =>  $row["c_code_no"],
				"id"                            =>  $row["id"],
				"c_code"                        =>	$row["c_code"],
				"c_name"                        =>	$row["c_name"],
				"c_code_mode"                   =>	$row["c_code_mode"],
				"c_name_mode"                   =>	$row["c_name_mode"],
				"am_mode_id"                    =>	$row["am_mode_id"],
				"acc_code"                      =>	$row["acc_code"],
				"acc_name"                      =>	$row["acc_name"],
				"i_period_year"                 =>	$row["i_period_year"],
				"f_unit_cost"                   => ($row["f_unit_cost"] != "") ? $row["f_unit_cost"] : "0",
				"d_receive_date"      			=> ($row["d_receive_date"] != "") ? $date->extDateBuddha($row["d_receive_date"]) : "",
				"dc_expense_budget_type_id"     =>	$row["dc_expense_budget_type_id"],
				"budget_source"                 =>	$row["budget_source"],
				"i_budget_year"                 =>	$row["i_budget_year"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
