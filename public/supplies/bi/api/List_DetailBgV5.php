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
	$type = $_REQUEST["type"] ?? 0;
	$start = $_REQUEST["start"] ?? 0;
	$i_tor_type = $_REQUEST["chart"] ?? 0;

	// ---- parameters ----
	$year_en                    = intval(@$_REQUEST["year_en"]);
	$dc_expense_budget_type_id  = intval(@$_REQUEST["dc_expense_budget_type_id"]);
	$bg_expense_id              = intval(@$_REQUEST["bg_expense_id"]);

	$detailMap = [];

	// ---- WHERE สำหรับ #temp_1 (bg_reserve_money) ----
	$whereTemp1 = "";
	if ($year_en > 0) {
		$whereTemp1 .= " AND a.i_year = {$year_en} ";
	}
	if ($dc_expense_budget_type_id > 0) {
		if (in_array($dc_expense_budget_type_id, [4, 5])) {
			$whereTemp1 .= " AND a.i_pr_type = 2 ";
		} else {
			$whereTemp1 .= " AND a.i_pr_type = 1 ";
		}
		$whereTemp1 .= " AND a.dc_budget_type_id = {$dc_expense_budget_type_id} ";
	}
	if ($bg_expense_id > 0) {
		$whereTemp1 .= " AND a.bg_expense_id = {$bg_expense_id} ";
	}

	$whereFinal = "";

	$sqlMain = "SET NOCOUNT ON 
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
						{$whereTemp1}
						GROUP BY i_sys, i_pr_type, i_year, dc_cost_acc_id, dc_cost_id, pr_id, po_id, chk_id, i_reserve, i_finish, dc_budget_type_id, bg_expense_id

						SELECT *
							, CASE 
								WHEN i_reserve = 2 
									THEN CASE WHEN (SELECT TOP 1
								aa.i_last
							FROM #temp_1 aa
							WHERE a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.po_id = a.po_id AND aa.i_pr_type = a.i_pr_type AND i_last = 3 AND i_success = 1) = 3 THEN 3 ELSE 2 END
								ELSE MAX(i_last) OVER (PARTITION by pr_id)  
							END AS i_last_max
							, CASE 
								WHEN i_reserve = 1  THEN (SELECT ISNULL(SUM(f_amt),0)
							FROM #temp_1 aa
							WHERE  a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.dc_budget_type_id = a.dc_budget_type_id AND aa.bg_expense_id = a.bg_expense_id AND i_reserve = 3)
								WHEN i_reserve = 2  THEN (SELECT ISNULL(SUM(f_amt),0)
							FROM #temp_1 aa
							WHERE  a.i_sys = aa.i_sys AND aa.pr_id = a.pr_id AND aa.po_id = a.po_id AND aa.dc_budget_type_id = a.dc_budget_type_id AND aa.bg_expense_id = a.bg_expense_id AND i_reserve = 3)
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
								SELECT
								CASE
										WHEN COUNT(*) < 1 THEN 1
										ELSE 3
									END
							FROM #temp_2 aa
							WHERE i_last = 2
								AND aa.i_sys = a.i_sys
								AND aa.pr_id = a.pr_id
								AND aa.i_pr_type = a.i_pr_type
								AND aa.dc_budget_type_id = a.dc_budget_type_id 
							)

						-- ====== Result Set 1: PR ทั้งหมด (i_reserve != 3) พร้อม flag has_po ======
						SELECT
							a.i_sys
							,a.pr_id
							,a.f_amt
							,a.bg_expense_id
							,a.dc_expense_budget_type_id
							,(SELECT c_name FROM " . DB_NMU_EIS . "bg_expense WHERE bg_expense_id = a.bg_expense_id) AS bg_expense
							,(SELECT c_name FROM " . DB_CENTER . "dc_expense_budget_type WHERE dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS dc_expense_budget_type
							,a.dc_cost_id
							,(SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = b.dc_cost_id) AS dc_cost
							,(SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = b.dc_cost2_id) AS dc_cost_id2
							,(SELECT c_name_th FROM " . DB_CENTER . "dc_sub_cost WHERE dc_sub_cost_id = b.dc_sub_cost_id) AS dc_sub_cost
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_emp WHERE sp_emp_id = b.sp_emp_id) AS sp_emp
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_status_hdr WHERE sp_status_hdr_id = b.tor_status_id) AS sp_status_hdr
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_department WHERE dc_department_id = b.dc_department_id) AS dc_department
							,b.c_name
							,b.c_code
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_type_event ac WHERE ac.sp_type_event_id =
								(SELECT TOP 1 event_type FROM " . DB_NMU_ERP . "sp_tor_event WHERE sp_tor_id = b.tor_id
								ORDER BY d_create DESC)) AS event_type
							,(SELECT TOP 1 event_detail FROM " . DB_NMU_ERP . "sp_tor_event WHERE sp_tor_id = b.tor_id ORDER BY d_create DESC) AS sp_event_detail
							,(SELECT COUNT(*) FROM #temp_bg_reserve_money x
								WHERE x.pr_id = a.pr_id AND x.i_reserve = 2 AND x.po_id > 0) AS has_po
						FROM #temp_bg_reserve_money a
						INNER JOIN NMU_ERP..sp_Tor b ON a.pr_id = b.tor_id
						WHERE a.i_reserve != 3
							AND a.i_sys = 1
							{$whereFinal}

						-- ====== Result Set 2: ยอดรวมงบประมาณ (SP_BG_BUDGET_SUM) ======
						DECLARE @TEMP_SP_BG_BUDGET_SUM TABLE (
							i_year bigint, dc_expense_budget_type_id bigint, dc_cost_acc_id bigint,
							dc_cost_id bigint, bg_expense_id bigint,
							f_plan_begin decimal(18,2), f_period_begin decimal(18,2), f_income_begin decimal(18,2),
							f_plan_transfer decimal(18,2), f_period_transfer decimal(18,2), f_income_transfer decimal(18,2),
							f_reserve_budget decimal(18,2), f_reserve_budget_long decimal(18,2),
							f_reserve_budget_income decimal(18,2), f_reserve_budget_income_Finish decimal(18,2),
							f_reserve_period decimal(18,2), f_reserve_periodincome decimal(18,2),
							f_reserve_periodfinish decimal(18,2), f_reserve_income decimal(18,2),
							f_reserve_income_Finish decimal(18,2), f_total_all decimal(18,2),
							f_return_all decimal(18,2), f_total_cut decimal(18,2), f_return_cut decimal(18,2),
							f_total_pay decimal(18,2), f_return_pay decimal(18,2),
							f_plan_total decimal(18,2), f_plan_cut_total decimal(18,2), f_plan_pay_total decimal(18,2),
							f_period_total decimal(18,2), f_period_cut_total decimal(18,2), f_period_pay_total decimal(18,2),
							f_income_total decimal(18,2), f_income_cut_total decimal(18,2), f_income_pay_total decimal(18,2)
						)
						INSERT INTO @TEMP_SP_BG_BUDGET_SUM
						EXEC NMU_EIS..SP_BG_BUDGET_SUM {$year_en}

						SELECT
							s.dc_expense_budget_type_id
							,s.bg_expense_id
							,CASE WHEN s.dc_expense_budget_type_id IN (4,5)
								THEN SUM(s.f_period_begin) + SUM(s.f_period_transfer)
								ELSE SUM(s.f_plan_begin)  + SUM(s.f_plan_transfer)
							END AS f_budget_total
							,CASE WHEN s.dc_expense_budget_type_id IN (4,5)
								THEN SUM(s.f_reserve_period) + SUM(s.f_reserve_periodincome) + SUM(s.f_reserve_periodfinish)
								ELSE SUM(s.f_reserve_budget) + SUM(s.f_reserve_budget_income) + SUM(s.f_reserve_budget_income_Finish)
							END AS f_reserve_total
							,SUM(s.f_plan_cut_total)   AS f_plan_cut_total
							,SUM(s.f_period_cut_total) AS f_period_cut_total
						FROM @TEMP_SP_BG_BUDGET_SUM s
						WHERE s.i_year = {$year_en}
							AND s.dc_cost_id = 38
							" . ($dc_expense_budget_type_id > 0 ? " AND s.dc_expense_budget_type_id = {$dc_expense_budget_type_id} " : "") . "
							" . ($bg_expense_id > 0 ? " AND s.bg_expense_id = {$bg_expense_id} " : "") . "
						GROUP BY s.dc_expense_budget_type_id, s.bg_expense_id

						-- ====== Result Set 3: PO (i_reserve = 2) join ผ่าน po_id ======
						SELECT
							a.i_sys
							,a.pr_id
							,a.po_id
							,a.f_amt AS f_amt_contract
							,a.bg_expense_id
							,a.dc_expense_budget_type_id
							,(SELECT c_name FROM " . DB_NMU_EIS . "bg_expense WHERE bg_expense_id = a.bg_expense_id) AS bg_expense
							,(SELECT c_name FROM " . DB_CENTER . "dc_expense_budget_type WHERE dc_expense_budget_type_id = a.dc_expense_budget_type_id) AS dc_expense_budget_type
							,(SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = b.dc_cost2_id) AS dc_cost_id2
							,(SELECT c_name_th FROM " . DB_CENTER . "dc_sub_cost WHERE dc_sub_cost_id = b.dc_sub_cost_id) AS dc_sub_cost
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_emp WHERE sp_emp_id = b.sp_emp_id) AS sp_emp
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_status_hdr WHERE sp_status_hdr_id = b.tor_status_id) AS sp_status_hdr
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_department WHERE dc_department_id = b.dc_department_id) AS dc_department
							,b.c_name AS po_name
							,b.c_code AS po_code
						FROM #temp_bg_reserve_money a
						INNER JOIN NMU_ERP..sp_Tor b ON a.po_id = b.tor_id
						WHERE a.i_reserve = 2
							AND a.i_sys = 1
							AND a.po_id IS NOT NULL
							AND a.po_id > 0
						ORDER BY a.po_id, a.pr_id
";

	$stmt = $db->QueryParam($sqlMain, array());

	if (@$_REQUEST["show_sql"]) {
		echo $sqlMain;
		exit;
	}

	if ($stmt) {
		$no = 0;
		$f_pr_total      = 0;
		$f_pr_only_total = 0;

		// ---- Result Set 1: PR ทั้งหมด ----
		while ($row = $db->Fetch($stmt)) {
			$sp_tor_id = $row['pr_id'];
			$f_amt     = (float)$row['f_amt'];
			$has_po    = (int)($row['has_po'] ?? 0);

			$temp = array(
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
				"dc_sub_cost"               => $row["dc_sub_cost"],
				"dc_cost_id2"               => $row["dc_cost_id2"],
				"bg_expense"                => $row["bg_expense"],
				"bg_expense_id"             => $row["bg_expense_id"],
				"dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
				"dc_expense_budget_type"    => $row["dc_expense_budget_type"],
				"event_type"                => $row["event_type"],
				"sp_event_detail"           => $row["sp_event_detail"],
				"f_amt"                     => $f_amt,
				"has_po"                    => $has_po,
				"children"                  => isset($detailMap[$sp_tor_id]) ? $detailMap[$sp_tor_id] : [],
			);
			${$root}[] = $temp;
			$f_pr_total += $f_amt;
			if ($has_po == 0) {
				$f_pr_only_total += $f_amt;
			}
		}

		// ---- Result Set 2: ยอดรวมงบประมาณ ----
		$f_budget_total     = 0;
		$f_reserve_total    = 0;
		$f_plan_cut_total   = 0;
		$f_period_cut_total = 0;
		$budget_detail      = [];   // [FIX] เก็บ per-row ต่อ bg_expense_id สำหรับ JS budgetMap
		if ($db->NextResult($stmt)) {
			while ($rowBg = $db->Fetch($stmt)) {
				$f_bg     = (float)$rowBg["f_budget_total"];
				$f_rsv    = (float)$rowBg["f_reserve_total"];
				$f_budget_total     += $f_bg;
				$f_reserve_total    += $f_rsv;
				$f_plan_cut_total   += (float)($rowBg["f_plan_cut_total"]   ?? 0);
				$f_period_cut_total += (float)($rowBg["f_period_cut_total"] ?? 0);

				// [FIX] เก็บ per-row เพื่อให้ JS สร้าง budgetMap แยกตาม bg_expense_id
				$bg_exp_id = (int)$rowBg["bg_expense_id"];
				if (!isset($budget_detail[$bg_exp_id])) {
					$budget_detail[$bg_exp_id] = [
						"bg_expense_id"             => $bg_exp_id,
						"dc_expense_budget_type_id" => (int)$rowBg["dc_expense_budget_type_id"],
						"f_budget_total"            => 0.0,
						"f_reserve_total"           => 0.0,
					];
				}
				$budget_detail[$bg_exp_id]["f_budget_total"]  += $f_bg;
				$budget_detail[$bg_exp_id]["f_reserve_total"] += $f_rsv;
			}
		}

		// ---- Result Set 3: PO ----
		$contract_rows    = [];
		$f_contract_total = 0;
		if ($db->NextResult($stmt)) {
			$no_contract = 0;
			while ($rowC = $db->Fetch($stmt)) {
				$contract_rows[] = array(
					"no"                        => ++$no_contract,
					"pr_id"                     => $rowC["pr_id"],
					"po_id"                     => $rowC["po_id"],
					"po_code"                   => $rowC["po_code"],
					"po_name"                   => $rowC["po_name"],
					"sp_emp"                    => $rowC["sp_emp"],
					"sp_status_hdr"             => $rowC["sp_status_hdr"],
					"dc_department"             => $rowC["dc_department"],
					"dc_cost_id2"               => $rowC["dc_cost_id2"],
					"dc_sub_cost"               => $rowC["dc_sub_cost"],
					"bg_expense"                => $rowC["bg_expense"],
					"bg_expense_id"             => $rowC["bg_expense_id"],
					"dc_expense_budget_type_id" => $rowC["dc_expense_budget_type_id"],
					"dc_expense_budget_type"    => $rowC["dc_expense_budget_type"],
					"f_amt_contract"            => (float)$rowC["f_amt_contract"],
				);
				$f_contract_total += (float)$rowC["f_amt_contract"];
			}
		}

		$f_pr_card   = $f_reserve_total - $f_contract_total;
		$f_remaining = $f_budget_total  - $f_reserve_total;
		$totalCount  = $no;
	}

	return json_encode(array(
		"totalCount"          => $totalCount,
		$root                 => ${$root},
		"budget_detail"       => array_values($budget_detail),  // [FIX] ส่ง per-row ให้ JS budgetMap
		"f_budget_total"      => $f_budget_total,
		"f_reserve_total"     => $f_reserve_total,
		"f_remaining"         => $f_remaining,
		"f_pr_total"          => $f_pr_card,
		"f_contract_total"    => $f_contract_total,
		"contract"            => $contract_rows,
		"f_plan_cut_total"    => $f_plan_cut_total,
		"f_period_cut_total"  => $f_period_cut_total,
	));
}

// ========== [แก้ไข] เปิด comment ออก เพื่อให้ API ทำงานได้ ==========
$fn = $_GET['fn'] ?? '';

// ✅ ถ้าถูก include มาจากไฟล์อื่น ไม่ต้องทำอะไร
if (!defined('INCLUDED_AS_LIB')) {
    if ($fn === 'List_QueryParam') {
        header('Content-Type: application/json; charset=utf-8');
        echo List_QueryParam();
    } else {
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'message' => 'invalid fn']);
    }
    exit;  // ✅ เพิ่ม exit ทุกกรณี
}