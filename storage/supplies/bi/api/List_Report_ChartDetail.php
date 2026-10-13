<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;
	$totalCount = 0;
	$type       = $_REQUEST["type"]  ?? 0;
	$start      = $_REQUEST["start"] ?? 0;

	$detailMap = [];
	$where     = "";

	// ✅ รับ year_en เป็น พ.ศ. แปลงเป็น ค.ศ. สำหรับกรองปีงบประมาณ
	$yearTh     = isset($_REQUEST["year_en"]) ? intval($_REQUEST["year_en"]) : (date('Y') + 543);
	$yearEn     = $yearTh - 543;       // เช่น 2026
	$yearEnPrev = $yearEn - 1;         // เช่น 2025

	// Filter staff
	if (!empty($_REQUEST['staff'])) {
		// Expecting a comma-separated list from the client; client may include the token 'unassigned'
		$raw = trim($_REQUEST['staff']);
		$parts = array_filter(array_map('trim', explode(',', $raw)), function($v){ return $v !== ''; });
		$ids = [];
		foreach ($parts as $p) {
			if ($p === 'unassigned') {
				$ids[] = 0; // map client-side 'unassigned' token to sp_emp_id = 0
			} elseif (is_numeric($p)) {
				$ids[] = intval($p);
			}
		}
		$ids = array_unique($ids);
		if (count($ids) > 0) {
			$where .= " AND b.sp_emp_id IN (" . implode(',', $ids) . ")";
		}
	}

	// ✅ Filter sub_status (สถานะใบขอเบิก)
	$subStatusWhere = "";
	if (!empty($_REQUEST['sub_status'])) {
		$raw = trim($_REQUEST['sub_status']);
		$parts = array_filter(array_map('trim', explode(',', $raw)), function($v){ return $v !== ''; });
		if (count($parts) > 0) {
			// Mapping from status name to numeric values
			$statusMap = [
				'รอผู้ดำเนินการลงนาม' => ['0.3'],
				'รอผู้ขอเบิกลงนาม' => ['0.4'],
				'รอฝ่ายการคลังลงนาม' => ['0.5', '5'],
				'รอรับใบขอเบิก' => ['1'],
				'รอผู้ตรวจสอบลงนาม' => ['2'],
				'ทักท้วง' => ['3'],
				'รอตรวจสอบงบประมาณ' => ['4'],
				'รอผู้อนุมัติลงนาม' => ['6'],
				'รอเตรียมจ่าย' => ['7'],
				'รอหัวหน้าฝ่ายการคลังลงนามเช็ค' => ['8'],
				'รอผู้บริหารลงนามเช็ค' => ['9'],
				'รอทำทะเบียนจ่าย' => ['10'],
				'ทำทะเบียนจ่าย' => ['11'],
				'อยู่ระหว่างการจัดทำใบขอเบิก' => [NULL],
			];
			$numericValues = [];
			$hasNull = false;
			foreach ($parts as $p) {
				if (isset($statusMap[$p])) {
					foreach ($statusMap[$p] as $val) {
						if ($val === NULL) {
							$hasNull = true;
						} else {
							$numericValues[] = $val;
						}
					}
				}
			}
			$numericValues = array_unique($numericValues);
			if (count($numericValues) > 0 || $hasNull) {
				if ($hasNull && count($numericValues) > 0) {
					$subStatusWhere = " AND (CAST(pb.i_sub_status AS FLOAT) IN (" . implode(',', $numericValues) . ") OR pb.i_sub_status IS NULL)";
				} elseif ($hasNull) {
					$subStatusWhere = " AND pb.i_sub_status IS NULL";
				} else {
					$subStatusWhere = " AND CAST(pb.i_sub_status AS FLOAT) IN (" . implode(',', $numericValues) . ")";
				}
			}
		}
	}

	$month_idx = isset($_REQUEST['month_idx']) ? intval($_REQUEST['month_idx']) : 12;
	$data_type = $_REQUEST['data_type'] ?? 'entry';

	// ✅ month_idx offset ตรงกับ List_Report_ChartStatus.php
	// ต.ค.=0, พ.ย.=1, ธ.ค.=2, ม.ค.=3, ก.พ.=4, มี.ค.=5,
	// เม.ย.=6, พ.ค.=7, มิ.ย.=8, ก.ค.=9, ส.ค.=10, ก.ย.=11
	$monthIdxExpr = "CASE 
		WHEN MONTH(%s) = 10 THEN 0
		WHEN MONTH(%s) = 11 THEN 1
		WHEN MONTH(%s) = 12 THEN 2
		WHEN MONTH(%s) = 1  THEN 3
		WHEN MONTH(%s) = 2  THEN 4
		WHEN MONTH(%s) = 3  THEN 5
		WHEN MONTH(%s) = 4  THEN 6
		WHEN MONTH(%s) = 5  THEN 7
		WHEN MONTH(%s) = 6  THEN 8
		WHEN MONTH(%s) = 7  THEN 9
		WHEN MONTH(%s) = 8  THEN 10
		WHEN MONTH(%s) = 9  THEN 11
		ELSE 0
	END";

	// สร้าง CASE expression สำหรับ d_create และ act_date_dt
	$monthIdxCreate  = sprintf($monthIdxExpr, ...array_fill(0, 12, 'b.d_create'));
	$monthIdxActDate = sprintf($monthIdxExpr, ...array_fill(0, 12, 'MAX(ti.act_date_dt)'));

	if ($data_type == 'entry') {
		if ($month_idx != 12) {
			// ✅ กรองเดือนด้วย offset ใหม่ (ต.ค.=0)
			$where .= " AND ($monthIdxCreate) = $month_idx ";
		}
	} elseif ($data_type == 'assigned') {
		$monthCondition = "";
		if ($month_idx != 12) {
			// ✅ กรองเดือน assigned ด้วย offset ใหม่ (ต.ค.=0)
			$monthCondition = "HAVING ($monthIdxActDate) = $month_idx";
		}
		$where .= " AND EXISTS (
			SELECT 1 FROM NMU_ERP..sp_tor_item ti 
			WHERE ti.tor_id = b.tor_id AND ti.sp_status_hdr_id = 25
			GROUP BY ti.tor_id
			$monthCondition
		)";
	}

	// ✅ กรองปีงบประมาณ: i_yyyy เก็บเป็น ค.ศ.
	// ต.ค.–ธ.ค. ของปีก่อน + ม.ค.–ก.ย. ของปีนี้
	$where .= " AND (
		(b.i_yyyy = $yearEnPrev AND MONTH(b.d_create) IN (10, 11, 12))
		OR
		(b.i_yyyy = $yearEn AND MONTH(b.d_create) BETWEEN 1 AND 9)
	)";

	$sqlMain = "SET NOCOUNT ON 
		SELECT 
			b.tor_id                        AS pr_id,
			b.f_total_amt                   AS f_amt,
			b.po_expense_id                 AS bg_expense_id,
			b.dc_expense_budget_type_id,
			(SELECT c_name FROM " . DB_NMU_EIS . "bg_expense WHERE bg_expense_id = b.po_expense_id) AS bg_expense,
			(SELECT c_name FROM " . DB_CENTER . "dc_expense_budget_type WHERE dc_expense_budget_type_id = b.dc_expense_budget_type_id) AS dc_expense_budget_type,
			b.dc_cost_id,
			(SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = b.dc_cost_id)   AS dc_cost,
			(SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = b.dc_cost2_id)  AS dc_cost_id2,
			(SELECT c_name FROM " . DB_NMU_ERP . "sp_emp WHERE sp_emp_id = b.sp_emp_id)    AS sp_emp,
			(SELECT c_name FROM " . DB_NMU_ERP . "sp_status_hdr WHERE sp_status_hdr_id = b.tor_status_id) AS sp_status_hdr,
			(SELECT c_name FROM " . DB_NMU_ERP . "sp_department WHERE dc_department_id = b.dc_department_id) AS dc_department,
			CONVERT(VARCHAR, (SELECT TOP 1 act_date_dt FROM sp_tor_item WHERE tor_id = b.tor_id AND sp_status_hdr_id = 26 ORDER BY id DESC), 120) AS d_act_date_dt26,
			CONVERT(VARCHAR, (SELECT TOP 1 act_date_dt FROM sp_tor_item WHERE tor_id = b.tor_id AND sp_status_hdr_id = 25 ORDER BY id DESC), 120) AS d_act_date_dt24,
			CASE CAST(pb.i_sub_status AS FLOAT)
				WHEN 0.3  THEN N'รอผู้ดำเนินการลงนาม'
				WHEN 0.4  THEN N'รอผู้ขอเบิกลงนาม'
				WHEN 0.5  THEN N'รอฝ่ายการคลังลงนาม'
				WHEN 1    THEN N'รอรับใบขอเบิก'
				WHEN 2    THEN N'รอผู้ตรวจสอบลงนาม'
				WHEN 3    THEN N'ทักท้วง'
				WHEN 4    THEN N'รอตรวจสอบงบประมาณ'
				WHEN 5    THEN N'รอฝ่ายการคลังลงนาม'
				WHEN 6    THEN N'รอผู้อนุมัติลงนาม'
				WHEN 7    THEN N'รอเตรียมจ่าย'
				WHEN 8    THEN N'รอหัวหน้าฝ่ายการคลังลงนามเช็ค'
				WHEN 9    THEN N'รอผู้บริหารลงนามเช็ค'
				WHEN 10   THEN N'รอทำทะเบียนจ่าย'
				WHEN 11   THEN N'ทำทะเบียนจ่าย'
				ELSE N'อยู่ระหว่างการจัดทำใบขอเบิก'
			END AS sub_status_name,
			b.c_name,
			b.c_code,
			(SELECT c_name FROM " . DB_NMU_ERP . "sp_type_event ac WHERE ac.sp_type_event_id = 
				(SELECT TOP 1 event_type FROM " . DB_NMU_ERP . "sp_tor_event WHERE sp_tor_id = b.tor_id ORDER BY d_create DESC)) AS event_type,
			(SELECT TOP 1 event_detail FROM " . DB_NMU_ERP . "sp_tor_event WHERE sp_tor_id = b.tor_id ORDER BY d_create DESC) AS sp_event_detail
		FROM NMU_ERP..sp_Tor b
		OUTER APPLY (
			SELECT TOP 1 beg.i_sub_status
			FROM NMU_ERP..sp_tor_contract       c
			JOIN NMU_ERP..sp_tor_hdr_period     p   ON p.sp_tor_contract_id     = c.sp_tor_contract_id
			JOIN NMU_ERP..sp_check_period_hdr   chk ON chk.sp_tor_hdr_period_id = p.sp_tor_hdr_period_id
			JOIN NMU_EIS..po_working_hdr        w   ON w.po_working_hdr_id      = chk.po_working_hdr_id
			JOIN NMU_EIS..po_working_begin_hdr  beg ON beg.po_working_begin_hdr_id = w.po_working_begin_hdr_id
			WHERE c.sp_tor_id = b.tor_id
			  AND beg.i_sub_status IS NOT NULL
			ORDER BY w.po_working_hdr_id DESC
		) pb
		WHERE 1 = 1
		  AND i_enabled = 1
		  AND i_is_notor = 0
		  AND ISNULL(b.i_parent, 0) = 0
		{$where}{$subStatusWhere}";

	if (@$_REQUEST["show_sql"]) {
		echo $sqlMain;
		exit;
	}

	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$no          = 0;
		while ($row = $db->Fetch($stmt)) {
			$sp_tor_id = $row['pr_id'];
			${$root}[] = [
				"i_type"                    => 1,
				"no"                        => ++$no,
				"tor_id"                    => $sp_tor_id,
				"sp_tor_id"                 => $row["pr_id"],
				"c_code"                    => $row["c_code"],
				"c_name"                    => $row["c_name"],
				"sp_emp"                    => $row["sp_emp"],
				"sp_status_hdr"             => $row["sp_status_hdr"],
				"dc_department"             => $row["dc_department"],
				"dc_cost"                   => $row["dc_cost"],
				"dc_cost_id2"               => $row["dc_cost_id2"],
				"bg_expense"                => $row["bg_expense"],
				"bg_expense_id"             => $row["bg_expense_id"],
				"dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type"    => $row["dc_expense_budget_type"],
				"event_type"                => $row["event_type"],
				"sp_event_detail"           => $row["sp_event_detail"],
				"f_amt"                     => (float) $row["f_amt"],
				"sub_status_name"           => $row["sub_status_name"],
				"d_act_date_dt26"           => $row["d_act_date_dt26"],
				"d_act_date_dt24"           => $row["d_act_date_dt24"],
				"children"                  => isset($detailMap[$sp_tor_id]) ? $detailMap[$sp_tor_id] : [],
			];
		}
	}

	return json_encode(["debug" => true, "totalCount" => $totalCount, $root => ${$root}]);
}

$fn = $_REQUEST['fn'] ?? 'List_QueryParam';
if ($fn === 'List_QueryParam') {
	$result = List_QueryParam();
	header('Content-Type: application/json; charset=utf-8');
	echo $result;
} else {
	header('Content-Type: application/json; charset=utf-8');
	echo json_encode(['success' => false, 'message' => 'invalid fn']);
}