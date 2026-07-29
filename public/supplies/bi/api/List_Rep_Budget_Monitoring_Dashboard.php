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

	$yearTh = isset($_REQUEST['year_th']) ? intval($_REQUEST['year_th']) : (date('Y') + 543);
	$yearEn = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : date('Y');

	// อนุญาตให้กรอง dc_cost_id: ค่าตัวเลข หรือ 'all' (ไม่กรอง). ค่าเริ่มต้นคือ 38
	$dc_cost_id_param = isset($_REQUEST['dc_cost_id']) ? trim($_REQUEST['dc_cost_id']) : '';
	$dc_cost_id_val = ($dc_cost_id_param === '' || !is_numeric($dc_cost_id_param)) ? 38 : intval($dc_cost_id_param);  // ← เพิ่ม
	if ($dc_cost_id_param === '') {
		$dc_condition          = "and a.dc_cost_id = 38";
		$dc_condition_no_alias = "and dc_cost_id = 38";
		$dc_condition_plan     = "AND bb.dc_cost_id = 38";     
	} elseif (strtolower($dc_cost_id_param) === 'all') {
		$dc_condition          = "";
		$dc_condition_no_alias = "";
		$dc_condition_plan     = "";  
	} elseif (is_numeric($dc_cost_id_param)) {
		$dc_condition          = "and a.dc_cost_id = " . intval($dc_cost_id_param);
		$dc_condition_no_alias = "and dc_cost_id = " . intval($dc_cost_id_param);
		$dc_condition_plan     = "AND bb.dc_cost_id = " . intval($dc_cost_id_param); 
	} else {
		$dc_condition          = "and a.dc_cost_id = 38";
		$dc_condition_no_alias = "and dc_cost_id = 38";
		$dc_condition_plan     = "AND bb.dc_cost_id = 38";        // ← แก้ alias: bb (detail) ไม่ใช่ aa (header)
	}

	$sqlMain = "SET NOCOUNT ON
-- ===== สร้าง Temp Table สำหรับ bg_reserve_money =====
SELECT
	i_sys
	, i_pr_type
	, i_year
	, dc_cost_acc_id
	, dc_cost_id
	, pr_id
	, po_id
	, chk_id
	, dc_budget_type_id
	, bg_expense_id
	, i_reserve
	, i_finish
	, MAX(MAX(ISNULL(i_last,0))) OVER (PARTITION by i_sys,pr_id,po_id,chk_id) AS i_success
	, MAX(MAX(i_reserve)) OVER (PARTITION by pr_id) AS i_reserve_max
	, CASE WHEN MAX(MAX(ISNULL(i_last,0))) OVER (PARTITION by pr_id,i_reserve) = 1 THEN i_reserve ELSE 0 END AS i_last
	, SUM(f_amt) AS f_amt
INTO #temp_1
FROM NMU_EIS..bg_reserve_money a
WHERE i_enable = 1
	AND a.i_year = {$yearEn}
GROUP BY i_sys, i_pr_type, i_year, dc_cost_acc_id, dc_cost_id, pr_id, po_id, chk_id, i_reserve, i_finish, dc_budget_type_id, bg_expense_id

SELECT *
	, CASE 
		WHEN i_reserve = 2 
			THEN CASE WHEN (SELECT TOP 1 aa.i_last FROM #temp_1 aa WHERE a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.po_id = a.po_id AND aa.i_pr_type = a.i_pr_type AND i_last = 3 AND i_success = 1) = 3 THEN 3 ELSE 2 END
		ELSE MAX(i_last) OVER (PARTITION by pr_id)  
	END AS i_last_max
	, CASE 
		WHEN i_reserve = 1  THEN (SELECT ISNULL(SUM(f_amt),0) FROM #temp_1 aa WHERE a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.dc_budget_type_id = a.dc_budget_type_id AND aa.bg_expense_id = a.bg_expense_id AND i_reserve = 3)
		WHEN i_reserve = 2  THEN (SELECT ISNULL(SUM(f_amt),0) FROM #temp_1 aa WHERE a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.po_id = a.po_id AND aa.dc_budget_type_id = a.dc_budget_type_id AND aa.bg_expense_id = a.bg_expense_id AND i_reserve = 3)
		ELSE 0
	END AS f_amt_pay
INTO #temp_2
FROM #temp_1 a

SELECT
	i_sys
	, i_pr_type
	, i_year
	, dc_cost_acc_id
	, dc_cost_id
	, pr_id
	, po_id
	, chk_id
	, dc_budget_type_id AS dc_expense_budget_type_id
	, bg_expense_id
	, i_reserve
	, i_finish
	, i_last
	, ISNULL(f_amt,0) - ISNULL(f_amt_pay,0) AS f_amt
INTO #temp_bg_reserve_money
FROM #temp_2 a
WHERE i_last = i_last_max
	OR i_reserve = 3
	OR i_last = (
		SELECT CASE WHEN COUNT(*) < 1 THEN 1 ELSE 3 END
		FROM #temp_2 aa
		WHERE i_last = 2
			AND aa.i_sys = a.i_sys
			AND aa.pr_id = a.pr_id
			AND aa.i_pr_type = a.i_pr_type
			AND aa.dc_budget_type_id = a.dc_budget_type_id 
	)

-- ===== สร้าง Temp Table สำหรับ SP_BG_BUDGET_SUM =====
DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
	i_year bigint,
	dc_expense_budget_type_id bigint,
	dc_cost_acc_id bigint,
	dc_cost_id bigint,
	bg_expense_id bigint,
	f_plan_begin decimal(18,2),
	f_period_begin decimal(18,2),
	f_income_begin decimal(18,2),
	f_plan_transfer decimal(18,2),
	f_period_transfer decimal(18,2),
	f_income_transfer decimal(18,2),
	f_reserve_budget decimal(18,2),
	f_reserve_budget_long decimal(18,2),
	f_reserve_budget_income decimal(18,2),
	f_reserve_budget_income_Finish decimal(18,2),
	f_reserve_period decimal(18,2),
	f_reserve_periodincome decimal(18,2),
	f_reserve_periodfinish decimal(18,2),
	f_reserve_income decimal(18,2),
	f_reserve_income_Finish decimal(18,2),
	f_total_all decimal(18,2),
	f_return_all decimal(18,2),
	f_total_cut decimal(18,2),
	f_return_cut decimal(18,2),
	f_total_pay decimal(18,2),
	f_return_pay decimal(18,2),
	f_plan_total decimal(18,2),
	f_plan_cut_total decimal(18,2),
	f_plan_pay_total decimal(18,2),
	f_period_total decimal(18,2),
	f_period_cut_total decimal(18,2),
	f_period_pay_total decimal(18,2),
	f_income_total decimal(18,2),
	f_income_cut_total decimal(18,2),
	f_income_pay_total decimal(18,2)
)
INSERT INTO @TEMP_SP_BG_BUDGET_SUM
EXEC NMU_EIS..SP_BG_BUDGET_SUM {$yearEn}

-- ===== Result Set 1: สรุปงบประมาณแยกตามประเภท =====
SELECT 
    a.dc_expense_budget_type_id 
    ,(SELECT c_name FROM NMU_DATACENTER..dc_expense_budget_type WHERE dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS dc_expense_budget_type
    ,a.bg_expense_id
    ,(SELECT c_code + ' : ' + c_name FROM NMU_EIS..bg_expense WHERE bg_expense_id = a.bg_expense_id) AS bg_expense
    , SUM(a.f_plan_begin) AS f_plan_begin
    , SUM(a.f_plan_transfer) AS f_plan_transfer
    , CASE WHEN a.dc_expense_budget_type_id IN (4,5) 
        THEN SUM(f_reserve_period) + SUM(f_reserve_periodincome) + SUM(f_reserve_periodfinish)  
        ELSE SUM(f_reserve_budget) + SUM(f_reserve_budget_income) + SUM(f_reserve_budget_income_Finish) 
    END AS f_reserve_budget
    , SUM(a.f_plan_cut_total) AS f_plan_cut_total
    , SUM(a.f_period_cut_total) AS f_period_cut_total
    , CASE 
    WHEN a.dc_expense_budget_type_id IN (4,5) 
        THEN SUM(a.f_period_begin) + SUM(a.f_period_transfer)
    ELSE 
			SUM(a.f_plan_begin) + SUM(a.f_plan_transfer)
	END AS f_budget_display
    , SUM(a.f_total_pay)   AS f_total_pay
    , SUM(a.f_return_all)  AS f_return_all
	, SUM(a.f_total_cut)   AS f_total_cut    -- ← เพิ่ม
	, SUM(a.f_return_cut)  AS f_return_cut   -- ← เพิ่ม
FROM @TEMP_SP_BG_BUDGET_SUM a
WHERE a.i_year = {$yearEn}
    {$dc_condition}
GROUP BY a.dc_expense_budget_type_id, a.bg_expense_id

-- ===== Result Set 2: ยอดรวม PR และ PO จาก #temp_bg_reserve_money (ตรงกับ logic การกรอง) =====
SELECT
    dc_expense_budget_type_id
    , bg_expense_id
    , SUM(CASE WHEN i_reserve = 1 THEN f_amt ELSE 0 END) AS f_pr_total
    , SUM(CASE WHEN i_reserve = 2 THEN f_amt ELSE 0 END) AS f_po_total
    , SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 0 THEN f_amt ELSE 0 END) AS f_reserve_check_total
    , SUM(CASE WHEN i_reserve = 3 AND ISNULL(i_finish,0) = 1 THEN f_amt ELSE 0 END) AS f_paid_total
    , SUM(CASE 
    WHEN i_reserve = 2 THEN f_amt
    WHEN i_reserve = 1 AND po_id IS NULL THEN f_amt
    ELSE 0 
END) AS f_reserve_total
FROM #temp_bg_reserve_money
WHERE 1=1
    {$dc_condition_no_alias}
GROUP BY dc_expense_budget_type_id, bg_expense_id

-- ===== Result Set 3: ยอดเพิ่ม/ลดโอนเปลี่ยนแปลงตามบัญชีจัดสรร =====
-- แก้: ต้อง GROUP BY แยกตาม dc_expense_budget_type_id ด้วย ไม่งั้น adjustment ของแหล่งเงินอื่น
-- (เช่น type 49) จะถูกเหมารวมไปบวกผิดให้แถว type 4 ที่ bg_expense_id ตรงกันโดยบังเอิญ
SELECT
    dc_expense_budget_type_id
    , bg_expense_id
    , SUM(f_adjust) AS f_adjust
FROM (
    SELECT
        aa.dc_expense_budget_type_id
        , bb.bg_expense_id
        , CASE WHEN bb.i_type = 2 THEN ISNULL(bb.f_change,0) ELSE -ISNULL(bb.f_change,0) END AS f_adjust
    FROM NMU_EIS..bg_budget_hdr_change aa
        INNER JOIN NMU_EIS..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id
    WHERE aa.i_enable = 1
        AND aa.i_year = {$yearEn}
        AND bb.i_type IN (1,2)
        AND ISNULL(bb.i_extenal,0) != 1
        AND bb.bg_expense_id IS NOT NULL
        {$dc_condition_plan}

    UNION ALL

    SELECT
        x.dc_expense_budget_type_id
        , x.bg_expense_id
        , x.f_total AS f_adjust
    FROM (
        SELECT
            aa.dc_expense_budget_type_id
            , bb.bg_expense_begin_id AS bg_expense_id
            , -SUM(ISNULL(bb.f_total,0)) AS f_total
        FROM NMU_EIS..bg_budget_hdr_transfer aa
            INNER JOIN NMU_EIS..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
        WHERE aa.i_enable = 1
            AND aa.i_transfer = 1
            AND aa.i_year = {$yearEn}
            AND bb.f_total != 0
        GROUP BY aa.dc_expense_budget_type_id, bb.bg_expense_begin_id

        UNION ALL

        SELECT
            aa.dc_expense_budget_type_id
            , bb.bg_expense_end_id AS bg_expense_id
            , SUM(ISNULL(bb.f_total,0)) AS f_total
        FROM NMU_EIS..bg_budget_hdr_transfer aa
            INNER JOIN NMU_EIS..bg_budget_dtl_transfer bb ON aa.bg_budget_hdr_transfer_id = bb.bg_budget_hdr_transfer_id
        WHERE aa.i_enable = 1
            AND aa.i_transfer = 1
            AND aa.i_year = {$yearEn}
            AND bb.f_total != 0
        GROUP BY aa.dc_expense_budget_type_id, bb.bg_expense_end_id
    ) x
) z
GROUP BY dc_expense_budget_type_id, bg_expense_id
";
$i = 0;
	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$pr_po_map = array(); // เก็บยอด PR/PO ไว้ map กับแต่ละแถว

		// ===== ดึง Result Set 1: ข้อมูลงบประมาณ =====
		while ($row = $db->Fetch($stmt)) {
			$rowsBudget = array(
				"no"                            => ++$i,
				"c_name"                        => $row["dc_expense_budget_type"],
				"bg_expense"                    => $row["bg_expense"],
				"bg_expense_id"                 => intVal($row["bg_expense_id"]),
				"dc_expense_budget_type_id"     => intVal($row["dc_expense_budget_type_id"]),
				"f_plan_begin"                  => (float) $row["f_plan_begin"],
				"f_reserve_budget"              => (float) $row["f_reserve_budget"],
				"f_budget_display"   => (float) $row["f_budget_display"],
				"f_reserve_actual"              => 0,
				"f_plan_cut_total"              => (float) $row["f_plan_cut_total"],
				"f_period_cut_total"            => (float) $row["f_period_cut_total"],
				"f_plan_transfer"    => (float) $row["f_plan_transfer"],
				"f_total_pay"        => (float) $row["f_total_pay"],      // ← เพิ่ม
				"f_return_all"       => (float) $row["f_return_all"],   
				"f_total_cut"   => (float) $row["f_total_cut"],    // ← เพิ่ม
				"f_return_cut"  => (float) $row["f_return_cut"],  
				"budget_year"                   => $yearTh,
				// เตรียมไว้สำหรับ map ค่า PR/PO
				"f_pr_total"                    => 0,
				"f_po_total"                    => 0,
				"f_reserve_check_total"          => 0,
				"f_paid_total"					 => 0,
				"f_reserve_total" 				=> 0,
				"f_budget_real"   				=> 0, 
			);
			${$root}[] = $rowsBudget;
		}

		// ===== Result Set 2: ยอด PR และ PO =====
if ($db->NextResult($stmt)) {
    while ($rowPrPo = $db->Fetch($stmt)) {
        // key = bg_expense_id + "_" + dc_expense_budget_type_id
        $key = strval($rowPrPo["bg_expense_id"]) . "_" . strval($rowPrPo["dc_expense_budget_type_id"]);
        $pr_po_map[$key] = array(
            "f_pr_total"      => (float) $rowPrPo["f_pr_total"],
            "f_po_total"      => (float) $rowPrPo["f_po_total"],
            "f_reserve_check_total" => (float) $rowPrPo["f_reserve_check_total"],
            "f_paid_total"    => (float) $rowPrPo["f_paid_total"],
            "f_reserve_total" => (float) $rowPrPo["f_reserve_total"],
        );
    }
}


	// ===== ดึงหมายเหตุการโอน (โอนให้/รับจาก) — logic เดียวกับ List_RepBudget_Adjust.php =====
$transfer_note_map = array(); // key "bgId_typeId" => array ของข้อความหมายเหตุ (อาจมีหลาย header)
$sqlTransferNote = "
SELECT
    aa.dc_expense_budget_type_id
    , bb.bg_expense_id
    , CASE WHEN opp.i_type = 2 THEN N'โอนให้' ELSE N'รับจาก' END AS direction
    , dc.c_name AS counterpart_cost_name
    , ope.c_code AS counterpart_expense_code
    , ope.c_name AS counterpart_expense_name
FROM NMU_EIS..bg_budget_hdr_change aa
    INNER JOIN NMU_EIS..bg_budget_dtl_change bb ON aa.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id
    INNER JOIN NMU_EIS..bg_budget_dtl_change opp
        ON opp.bg_budget_hdr_change_id = bb.bg_budget_hdr_change_id
        AND opp.i_type = CASE WHEN bb.i_type = 1 THEN 2 ELSE 1 END
    LEFT JOIN NMU_DATACENTER..dc_cost dc ON dc.dc_cost_id = opp.dc_cost_id
    LEFT JOIN NMU_EIS..bg_expense ope ON ope.bg_expense_id = opp.bg_expense_id
WHERE aa.i_enable = 1
    AND aa.i_year = {$yearEn}
    AND bb.i_type IN (1,2)
    AND ISNULL(bb.i_extenal,0) != 1
    AND bb.bg_expense_id IS NOT NULL
    {$dc_condition_plan}
";
$stmtNote = $db->QueryParam($sqlTransferNote, array());
if ($stmtNote) {
    while ($rowNote = $db->Fetch($stmtNote)) {
        $noteKey = strval($rowNote["bg_expense_id"]) . "_" . strval($rowNote["dc_expense_budget_type_id"]);
        $noteText = $rowNote["direction"] . " : " . $rowNote["counterpart_cost_name"]
                  . " (" . $rowNote["counterpart_expense_code"] . " : " . $rowNote["counterpart_expense_name"] . ")";
        if (!isset($transfer_note_map[$noteKey])) {
            $transfer_note_map[$noteKey] = array();
        }
        if (!in_array($noteText, $transfer_note_map[$noteKey])) {
            $transfer_note_map[$noteKey][] = $noteText;
        }
    }
}

	// ===== Map เข้าแต่ละแถว =====
$adjust_map = array();
if ($db->NextResult($stmt)) {
    while ($rowAdjust = $db->Fetch($stmt)) {
        $adjKey = strval($rowAdjust["bg_expense_id"]) . "_" . strval($rowAdjust["dc_expense_budget_type_id"]);
        $adjust_map[$adjKey] = (float) $rowAdjust["f_adjust"];
    }
}

foreach (${$root} as &$item) {
    $key = strval($item["bg_expense_id"]) . "_" . strval($item["dc_expense_budget_type_id"]);
    $item["transfer_note"] = isset($transfer_note_map[$key]) ? implode(" / ", $transfer_note_map[$key]) : "";
    if (isset($pr_po_map[$key])) {
        $item["f_pr_total"]      = $pr_po_map[$key]["f_pr_total"];
        $item["f_po_total"]      = $pr_po_map[$key]["f_po_total"];
        $item["f_reserve_check_total"] = $pr_po_map[$key]["f_reserve_check_total"];
        $item["f_paid_total"]    = $pr_po_map[$key]["f_paid_total"];
        $item["f_reserve_total"] = $pr_po_map[$key]["f_reserve_total"];
        // ลบบรรทัด f_d1_not_finish ออกจากตรงนี้
    }
    $item["f_reserve_actual"] = ((float) ($item["f_pr_total"] ?? 0)) 
                              + ((float) ($item["f_po_total"] ?? 0));

    // ✅ แก้ไข: sync f_reserve_total ให้เท่ากับ f_reserve_actual (PR ทุกแถว + PO ทั้งหมด)
    // เดิม f_reserve_total มาจาก SQL Result Set 2 ที่นับเฉพาะ PR ที่ po_id IS NULL เท่านั้น
    // (ตัด PR ที่มี po_id ติดอยู่ออก) ทำให้ค่าต่ำกว่ายอดรายการ PR+PO จริงที่แสดงในตาราง
    $item["f_reserve_total"] = $item["f_reserve_actual"];
}
unset($item);

        // ===== ดึง Result Set 3: งบประมาณจริงจาก bg_budget_dtl_plan =====
$budget_real_map = array();
$sqlBudgetReal = "
SELECT
    bb.bg_expense_id
    , aa.dc_expense_budget_type_id
    , SUM(ISNULL(bb.f_total,0)) AS f_budget_real
FROM NMU_EIS..bg_budget_hdr_plan aa
    INNER JOIN NMU_EIS..bg_budget_dtl_plan bb ON aa.bg_budget_hdr_plan_id = bb.bg_budget_hdr_plan_id
WHERE aa.i_enable = 1
    AND aa.i_year = {$yearEn}
    AND bb.f_total != 0
    AND bb.dc_cost_id = {$dc_cost_id_val}
GROUP BY bb.bg_expense_id, aa.dc_expense_budget_type_id
";
$stmt3 = $db->QueryParam($sqlBudgetReal, array());
if ($stmt3) {
    while ($rowBudget = $db->Fetch($stmt3)) {
        $key = strval($rowBudget["bg_expense_id"]) . "_" . strval($rowBudget["dc_expense_budget_type_id"]);
        $budget_real_map[$key] = (float) $rowBudget["f_budget_real"];
    }
}
foreach (${$root} as &$item) {
    $key = strval($item["bg_expense_id"]) . "_" . strval($item["dc_expense_budget_type_id"]);
    $budget_real = isset($budget_real_map[$key]) ? $budget_real_map[$key] : 0;
    $budget_display = (float) $item["f_budget_display"];
    $budget_adjust = isset($adjust_map[$key]) ? $adjust_map[$key] : 0;

    if ((int)$item["dc_expense_budget_type_id"] === 4) {
        $item["f_budget_real"] = $budget_display + $budget_adjust;
    } elseif ((int)$item["dc_expense_budget_type_id"] === 5) {
        $item["f_budget_real"] = $budget_real > 0 ? $budget_real : $budget_display;
    } else {
        $item["f_budget_real"] = $budget_display > 0 ? $budget_display : $budget_real;
    }
}
unset($item);

        // ===== ดึง D1 จาก po_working_dtl =====
$d1_map = array();
$sqlD1 = "
SELECT
    bb.dc_expense_budget_type_id
    , bb.bg_expense_id
    , SUM(ISNULL(bb.f_total,0)) - ISNULL(SUM(ret.f_return),0) AS f_d1_total
FROM NMU_EIS..po_working_hdr aa
    INNER JOIN NMU_EIS..po_working_dtl bb 
        ON aa.po_working_hdr_id = bb.po_working_hdr_id
        AND bb.bg_expense_id IS NOT NULL
    LEFT JOIN (
        SELECT po_working_hdr_id, SUM(ISNULL(f_return,0)) AS f_return
        FROM NMU_EIS..po_return
        WHERE i_enable = 1
        GROUP BY po_working_hdr_id
    ) ret ON aa.po_working_hdr_id = ret.po_working_hdr_id
WHERE aa.i_enable = 1
    AND bb.i_budget_year_overlap = {$yearEn}
    AND bb.f_total != 0
    AND CASE WHEN ISNULL(bb.dc_cost_ref_id,0) = 0 
             THEN bb.dc_cost_id 
             ELSE bb.dc_cost_ref_id END = {$dc_cost_id_val}
GROUP BY bb.dc_expense_budget_type_id, bb.bg_expense_id
";
$stmtD1 = $db->QueryParam($sqlD1, array());
if ($stmtD1) {
    while ($rowD1 = $db->Fetch($stmtD1)) {
        $key = strval($rowD1["bg_expense_id"]) . "_" . strval($rowD1["dc_expense_budget_type_id"]);
        $d1_map[$key] = (float) $rowD1["f_d1_total"];
    }
}
foreach (${$root} as &$item) {
    $key = strval($item["bg_expense_id"]) . "_" . strval($item["dc_expense_budget_type_id"]);
    $d1 = isset($d1_map[$key]) ? $d1_map[$key] : 0;
    $item["f_d1_not_finish"] = $d1 - $item["f_paid_total"];
}
unset($item);

	}  // ← ปิด if ($stmt)

	echo json_encode(array(
		$root        => ${$root},
		"year_th"    => $yearTh,
		"year_en"    => $yearEn,
		"totalCount" => $i,
	));
}

$fn = $_GET['fn'] ?? '';
if ($fn === 'List_QueryParam') {
	List_QueryParam();
} else {
	echo json_encode(['success' => false, 'message' => 'invalid fn']);
}