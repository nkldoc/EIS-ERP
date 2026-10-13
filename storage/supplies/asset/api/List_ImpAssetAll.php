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
$DATABASE_NAME = "";//"NMU_ASSET..";

if ($_REQUEST["type"] == "imp_assetall_hdr") {



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
            ROW_NUMBER() OVER (ORDER BY a.imp_assetall_hdr_id) AS numrow
            ,a.imp_assetall_hdr_id
        INTO #TemData
        FROM {$DATABASE_NAME} imp_assetall_hdr a
        WHERE a.i_enable = 1
            {$con};

        SELECT
            a.numrow
			,b.imp_assetall_hdr_id
			,b.c_name
			,b.c_comment
			,b.i_enable
            ,CONVERT(VARCHAR, b.d_create, 120) AS d_create
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
		INNER JOIN {$DATABASE_NAME} imp_assetall_hdr b ON a.imp_assetall_hdr_id = b.imp_assetall_hdr_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"                => $row["numrow"],
				"id"                =>	$row["imp_assetall_hdr_id"],
				"c_name"            =>	$row["c_name"],
				"c_comment"         =>	$row["c_comment"],
				"i_enable"          =>	$row["i_enable"],
				"show_enable"       => ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"d_create"          => ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
				"d_update"          => ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "imp_assetall_dtl") {

	$sqlMain = "SET NOCOUNT ON
			SELECT
				ROW_NUMBER() OVER (ORDER BY c_code) AS numrow
				,imp_assetall_dtl_id
				,c_code --รหัสครุภัณฑ์ A
				,asset_name --ชื่อครุภัณฑ์ B
				,receive_date --วันที่รับ C
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
			INTO #DATA
			FROM {$DATABASE_NAME} imp_assetall_dtl
			WHERE imp_assetall_hdr_id = ?

			SELECT 
				*
				,'0' AS i_type
			FROM #DATA
			UNION ALL
			SELECT 
				null AS numrow
				,null AS imp_assetall_dtl_id
				,null AS c_code --รหัสครุภัณฑ์ A
				,null AS asset_name --ชื่อครุภัณฑ์ B
				,null AS receive_date --วันที่รับ C
				,null AS quantity -- จ.น. รับ  (DR) D
				,null AS dc_unit_type --หน่วยนับ E
				,SUM(ISNULL(CONVERT(decimal(18,2),f_unit_cost),0)) AS f_unit_cost --มูลค่าเริ่มต้น F
				,SUM(ISNULL(CONVERT(decimal(18,2),f_unit_cost2),0)) AS f_unit_cost2 --มูลค่าเริ่มต้น F
				,SUM(ISNULL(CONVERT(decimal(18,2),f_unit_cost3),0)) AS f_unit_cost3 --มูลค่าเริ่มต้น F
				,null AS stockpile --คลังพัสดุ I
				,null AS Segment --ส่วนงาน J
				,null AS workandproject --งาน/โครงการ K
				,null AS fund -- กองทุน L
				,null AS event_id --รหัสกิจกรรม M
				,null AS i_yyyy --ปีงบ N
				,null AS budget_source --แหล่งเงิน O
				,null AS c_detail --คุณสมบัติเฉพาะ(ยี่ห้อ/รุ่น) Q
				,null AS c_brand --ยี่ห้อ R
				,null AS c_model --รุ่น S
				,null AS c_serial --Serial Number T
				,null AS got --วิธีการได้มา U
				,null AS salvage --วิธีคำนวณค่าเสื่อม V
				,null AS i_period_year --อายุครุภัณฑ์(ปี) W
				,null AS c_commet --หมายเหตุ AA
				,null AS c_codeold2 --หมายเลขครุภัณฑ์เดิม2 AB
				,null AS c_codeold1 --หมายเลขครุภัณฑ์เดิม1 AC
				,null AS receipt_number --เลขที่ใบตรวจรับ AD
				,null AS INsurance_start --วันที่เริ่มรับประกัน AE
				,null AS INsurance_year --รับประกัน....ปี AF
				,null AS INsurance_month --รับประกัน....เดือน AG
				,null AS INsurance_end --วันที่สิ้นสุดรับประกัน AH
				,null AS INsurance_mote --หมายเหตุรับประกัน AI
				,null AS c_location --สถานที่ตั้ง AJ
				,null AS c_code_building --รหัสอาคาร AK
				,null AS car_register --เลขทะเบียนรถ AL
				,null AS car_type --ประเภทรถ AM
				,null AS code_caretaker --รหัสผู้ดูแล AN
				,null AS name_caretaker --ชื่อผู้ดูแลครุภัณฑ์ AO
				,null AS image_file --แฟ้มรูปภาพ AP
				,null AS barcode_status --สถานะพิมพ์บาร์โค้ด AQ
				,null AS FROM_file --null
				,'1' AS i_type
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
				"id"                        => ++$no,
				"i_type"                    => $row["i_type"],
				"imp_assetall_dtl_id"       =>	$row["imp_assetall_dtl_id"],
				"c_code"                    =>	$row["c_code"],
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
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "bg_budget_extend_time_overlap") {
	$sqlMain = "";
	$i_extend_time = $db->GetDataBySQL("select isnull(i_extend_time,0) from bg_budget_dtl_overlap where bg_budget_dtl_overlap_id = ?", array($_REQUEST["dtl_id"]));

	if ($i_extend_time == 0) {
		$sqlMain .= "
			SET NOCOUNT ON
			SELECT 
				NULL AS bg_budget_extend_time_overlap_id
				,bg_budget_dtl_overlap_id
				,isnull(i_extend_time,0) AS i_extend_time
				,f_total 
				,f_cancel
				,CONVERT(varchar, d_end_date, 120) AS d_end_date
				,c_comment
			FROM bg_budget_dtl_overlap 
			WHERE bg_budget_dtl_overlap_id = " . $_REQUEST["dtl_id"] . " ;";
	} else {

		$sqlMain .= "
			SET NOCOUNT ON
			SELECT
				bg_budget_extend_time_overlap_id
				,bg_budget_dtl_overlap_id
				,i_extend_time
				,f_total 
				,f_cancel
				,CONVERT(VARCHAR, d_end_date, 120) AS d_end_date
				,c_comment
			FROM bg_budget_extend_time_overlap
			WHERE bg_budget_dtl_overlap_id = ? and i_enable = 1 
				ORDER BY i_extend_time ;";
	}

	$arrParam[]	= $_REQUEST["dtl_id"];
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {
			if ($row["i_extend_time"] == 0) {
				$i_start = 1;
			} else {
				$i_start = 0;
			}
			$temp = array(
				"id"										=> ++$no,
				"bg_budget_extend_time_overlap_id"			=> $row["bg_budget_extend_time_overlap_id"],
				"i_start"									=> $i_start,
				"i_extend_time"								=> ($row["i_extend_time"] == 0) ? "ตั้งต้น" : $row["i_extend_time"],
				"f_total"									=> ($row["f_total"] != "") ? $row["f_total"] : "0",
				"f_cancel"									=> ($row["f_cancel"] != "") ? $row["f_cancel"] : "0",
				"d_end_date"								=> ($row["d_end_date"] != "") ? $date->extDateBuddha($row["d_end_date"]) : "",
				"c_comment"									=> $row["c_comment"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
