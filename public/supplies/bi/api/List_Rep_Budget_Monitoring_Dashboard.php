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
	if ($dc_cost_id_param === '') {
		$dc_condition = "and a.dc_cost_id = 38";
	} elseif (strtolower($dc_cost_id_param) === 'all') {
		$dc_condition = "";
	} elseif (is_numeric($dc_cost_id_param)) {
		$dc_condition = "and a.dc_cost_id = " . intval($dc_cost_id_param);
	} else {
		$dc_condition = "and a.dc_cost_id = 38";
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
	, CASE WHEN a.dc_expense_budget_type_id IN (4,5) 
		THEN SUM(a.f_period_begin) + SUM(a.f_period_transfer)  
		ELSE SUM(a.f_plan_begin) + SUM(f_plan_transfer) 
	END AS f_plan_begin 
	, CASE WHEN a.dc_expense_budget_type_id IN (4,5) 
		THEN SUM(f_reserve_period) + SUM(f_reserve_periodincome) + SUM(f_reserve_periodfinish)  
		ELSE SUM(f_reserve_budget) + SUM(f_reserve_budget_income) + SUM(f_reserve_budget_income_Finish) 
	END AS f_reserve_budget
	, SUM(a.f_plan_cut_total) AS f_plan_cut_total
	, SUM(a.f_period_cut_total) AS f_period_cut_total
FROM @TEMP_SP_BG_BUDGET_SUM a
WHERE a.i_year = {$yearEn}
	{$dc_condition}
GROUP BY a.dc_expense_budget_type_id, a.bg_expense_id

-- ===== Result Set 2: ยอดรวม PR และ PO จาก #temp_bg_reserve_money (ตรงกับ logic การกรอง) =====
SELECT
	dc_expense_budget_type_id
	, bg_expense_id
	, SUM(CASE WHEN i_reserve = 1 AND i_sys = 1 THEN f_amt ELSE 0 END) AS f_pr_total
	, SUM(CASE WHEN i_reserve = 2 AND i_sys = 1 THEN f_amt ELSE 0 END) AS f_po_total
FROM #temp_bg_reserve_money
WHERE i_reserve != 3
GROUP BY dc_expense_budget_type_id, bg_expense_id
";

	$stmt = $db->QueryParam($sqlMain, array());
	if ($stmt) {
		$i = 0;
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
				"f_plan_cut_total"              => (float) $row["f_plan_cut_total"],
				"f_period_cut_total"            => (float) $row["f_period_cut_total"],
				"budget_year"                   => $yearTh,
				// เตรียมไว้สำหรับ map ค่า PR/PO
				"f_pr_total"                    => 0,
				"f_po_total"                    => 0,
			);
			${$root}[] = $rowsBudget;
		}

		// ===== ดึง Result Set 2: ยอด PR และ PO =====
		if ($db->NextResult($stmt)) {
			while ($rowPrPo = $db->Fetch($stmt)) {
				$key = $rowPrPo["dc_expense_budget_type_id"] . "_" . $rowPrPo["bg_expense_id"];
				$pr_po_map[$key] = array(
					"f_pr_total" => (float) $rowPrPo["f_pr_total"],
					"f_po_total" => (float) $rowPrPo["f_po_total"]
				);
			}
		}

		// ===== Map ยอด PR/PO เข้าไปในแต่ละแถว =====
		foreach (${$root} as &$item) {
			$key = $item["dc_expense_budget_type_id"] . "_" . $item["bg_expense_id"];
			if (isset($pr_po_map[$key])) {
				$item["f_pr_total"] = $pr_po_map[$key]["f_pr_total"];
				$item["f_po_total"] = $pr_po_map[$key]["f_po_total"];
			}
		}
		unset($item); // ทำลาย reference
	}

	echo json_encode(array(
		"debug"         => true,
		$root           => ${$root},
		"year_th"       => $yearTh,
		"year_en"       => $yearEn,
		"totalCount"    => $i,
	));
}

$fn = $_GET['fn'] ?? '';
if ($fn === 'List_QueryParam') {
	List_QueryParam();
} else {
	echo json_encode(['success' => false, 'message' => 'invalid fn']);
}