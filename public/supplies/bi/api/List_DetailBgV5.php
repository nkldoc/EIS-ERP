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
	$dc_cost_id                 = isset($_REQUEST['dc_cost_id']) && is_numeric($_REQUEST['dc_cost_id'])
                              ? intval($_REQUEST['dc_cost_id']) : 38;  // ← เพิ่ม

	$detailMap = [];

	// ---- WHERE สำหรับ #temp_1 (bg_reserve_money) ----
	// [FIX] ห้ามกรอง dc_cost_id / i_year / bg_expense_id / dc_budget_type_id / i_pr_type ตรงนี้เด็ดขาด
	// เพราะ window function ใน #temp_1 (i_last, i_reserve_max, i_success) คำนวณด้วย
	// PARTITION BY pr_id / PARTITION BY i_sys,pr_id,po_id,chk_id ซึ่งต้องเห็นทุกแถวของ PR นั้น
	// ครบทุกปี ทุก cost center และทุก bg_expense_id เหมือนใน SP_BG_RESERVE_MONEY ต้นฉบับ
	// (ซึ่งกรองแค่ i_enable = 1 เท่านั้น) ถ้ากรองก่อนคำนวณ window function ผลลัพธ์ i_last/i_last_max
	// จะคลาดเคลื่อน ทำให้บาง PR/PO ถูกจัดสถานะผิดและหลุดจากเงื่อนไข WHERE i_last = i_last_max ไป
	$whereTemp1 = "";

	// [FIX] ย้ายเงื่อนไขทั้งหมด (dc_cost_id/i_year/bg_expense_id/dc_expense_budget_type_id/i_pr_type)
	// มากรองตรงนี้แทน โดยกรองที่ผลลัพธ์สุดท้าย (#temp_bg_reserve_money) หลังจาก #temp_1/#temp_2
	// ถูกคำนวณจากข้อมูลครบทุกแถวแล้ว
	$whereFinal = "";
	if ($dc_cost_id > 0) {
		$whereFinal .= " AND a.dc_cost_id = {$dc_cost_id} ";
	}
	if ($year_en > 0) {
		$whereFinal .= " AND a.i_year = {$year_en} ";
	}
	if ($bg_expense_id > 0) {
		$whereFinal .= " AND a.bg_expense_id = {$bg_expense_id} ";
	}
	// [FIX 2026-07-28] เดิมบังคับเดา i_pr_type จากการเช็คว่า dc_expense_budget_type_id
	// อยู่ใน [4,5] หรือไม่ (in [4,5] => i_pr_type=2, อื่น ๆ => i_pr_type=1 เสมอ) แต่ข้อมูลจริง
	// พิสูจน์แล้วว่า budget_type เดียวกัน (เช่น dc_expense_budget_type_id=49) มีทั้งแถวที่
	// i_pr_type=1 และ i_pr_type=2 ปนกันได้จริง (เช่น pr_id=3958/po_id=3836/chk_id=5649
	// f_amt=21,828.00 ซึ่งเป็น i_pr_type=2 แต่ถูกกรองทิ้งเพราะ query บังคับ i_pr_type=1)
	// จึงตัดการบังคับ i_pr_type ออก กรองแค่ dc_expense_budget_type_id พอ ให้ตรงกับพฤติกรรม
	// default ของ List_RepSupReserveMoney.php ที่ไม่กรอง i_pr_type เว้นแต่ระบุมาตรง ๆ ว่า = 2
	if ($dc_expense_budget_type_id > 0) {
		$whereFinal .= " AND a.dc_expense_budget_type_id = {$dc_expense_budget_type_id} ";
	}
	// [FIX] เวอร์ชันเดียวกัน แต่ใช้ alias "y" สำหรับ subquery ที่เช็คว่า PR นี้อยู่ในขอบเขตที่กำลังกรองอยู่หรือเปล่า
	// (ใช้ตอนดึง PO ข้าม budget_type ใน Result Set 3)
	$whereFinalY = $whereFinal !== "" ? str_replace("a.", "y.", $whereFinal) : "";

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

						-- [FIX 2026-07-28] เดิมตรงนี้คำนวณ #temp_2 -> #temp_bg_reserve_money เอง
						-- (หัก f_amt_pay ตามขั้น i_reserve=3 ออกจากยอดจอง + กรองด้วย i_last_max)
						-- ซึ่งพิสูจน์แล้วว่าให้ยอดรวมผิดไปจากของจริง (21,092,225.70 vs 22,868,325.70)
						-- เปลี่ยนมาเรียก SP_BG_RESERVE_MONEY ตรง ๆ แทน ให้ตรงกับ List_RepSupReserveMoney.php
						-- ซึ่งพิสูจน์แล้วว่ายอดถูกต้อง (#temp_1 ยังคงไว้ตามเดิม เพราะยังใช้ใน has_po /
						-- PO cross-budget-type matching ของ Result Set 1 และ Result Set 3 ด้านล่าง)
						CREATE TABLE #temp_bg_reserve_money(
							i_sys bigint, i_pr_type tinyint, i_year bigint, dc_cost_acc_id bigint,
							dc_cost_id bigint, pr_id bigint, po_id bigint, chk_id bigint,
							dc_expense_budget_type_id bigint, bg_expense_id bigint, d_create datetime,
							i_reserve tinyint, i_finish tinyint, i_last int, f_amt decimal(18, 2)
						)
						INSERT INTO #temp_bg_reserve_money EXEC NMU_EIS..SP_BG_RESERVE_MONEY

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
							,(SELECT COUNT(*) FROM #temp_1 x
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
							AND s.dc_cost_id = {$dc_cost_id}
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
							,1 AS i_own_match
						FROM #temp_bg_reserve_money a
						INNER JOIN NMU_ERP..sp_Tor b ON a.po_id = b.tor_id
						WHERE a.i_reserve = 2
							AND a.i_sys = 1
							AND a.po_id IS NOT NULL
							AND a.po_id > 0
							{$whereFinal}

						UNION ALL

						
						SELECT
							x.i_sys
							,x.pr_id
							,x.po_id
							,x.f_amt AS f_amt_contract
							,x.bg_expense_id
							,x.dc_budget_type_id AS dc_expense_budget_type_id
							,(SELECT c_name FROM " . DB_NMU_EIS . "bg_expense WHERE bg_expense_id = x.bg_expense_id) AS bg_expense
							,(SELECT c_name FROM " . DB_CENTER . "dc_expense_budget_type WHERE dc_expense_budget_type_id = x.dc_budget_type_id) AS dc_expense_budget_type
							,(SELECT c_name FROM " . DB_CENTER . "dc_cost WHERE dc_cost_id = b2.dc_cost2_id) AS dc_cost_id2
							,(SELECT c_name_th FROM " . DB_CENTER . "dc_sub_cost WHERE dc_sub_cost_id = b2.dc_sub_cost_id) AS dc_sub_cost
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_emp WHERE sp_emp_id = b2.sp_emp_id) AS sp_emp
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_status_hdr WHERE sp_status_hdr_id = b2.tor_status_id) AS sp_status_hdr
							,(SELECT c_name FROM " . DB_NMU_ERP . "sp_department WHERE dc_department_id = b2.dc_department_id) AS dc_department
							,b2.c_name AS po_name
							,b2.c_code AS po_code
							,CASE WHEN
									{$dc_expense_budget_type_id} > 0
								AND ({$bg_expense_id} = 0 OR x.bg_expense_id = {$bg_expense_id})
								AND x.dc_budget_type_id = {$dc_expense_budget_type_id}
									THEN 1 ELSE 0 END AS i_own_match
							-- [FIX-BKK4 2026-07-31] เดิมเงื่อนไขนี้ยอมให้ i_own_match = 1 ได้แม้ไม่มีการระบุ
							-- dc_expense_budget_type_id มาเลย (เช่น {$dc_expense_budget_type_id} = 0 => เงื่อนไข
							-- เป็นจริงเสมอ) ซึ่งใช้ได้ตอนที่ระบบยังกรองทีละแหล่งเงินเดียวที่ server เท่านั้น
							-- แต่หลัง FIX3 (รองรับเลือกหลายแหล่งเงิน) ฝั่ง JS เลิกส่ง dc_expense_budget_type_id
							-- มาแล้ว (ดึงข้อมูลทั้งหมดมากรองฝั่ง client) ทำให้พารามิเตอร์นี้เป็น 0 เสมอ ผลคือ
							-- PO กำพร้า จาก #temp_1 (ที่ไม่เคยอยู่ใน #temp_bg_reserve_money เลย จึงไม่เคยถูกนับ
							-- ในยอด จองเงินแล้ว ที่มาจาก SP_BG_BUDGET_SUM) ถูกนับเป็น own-match เสมอ ทำให้ยอด
							-- PO ถูกบวกเกินยอด จองเงินแล้ว จริง (เช่น แหล่งเงินกทม. id=4)
							-- แก้ให้ i_own_match = 1 ได้เฉพาะกรณีที่ระบุ dc_expense_budget_type_id มาจริง ๆ
							-- (ใช้กับหน้า drilldown ทีละแหล่งเงิน เช่น Rep_DetailByTypeV5.php) ถ้าไม่ระบุ (โหมด
							-- multi-select ของ dashboard) ให้ถือว่าเป็น cross-type เสมอ (แสดงเพื่อความโปร่งใส
							-- แต่ไม่นับรวมยอด)
						FROM #temp_1 x
						INNER JOIN NMU_ERP..sp_Tor b2 ON x.po_id = b2.tor_id
						WHERE x.i_reserve = 2
							AND x.i_sys = 1
							AND x.po_id IS NOT NULL
							AND x.po_id > 0
							AND EXISTS (
								SELECT 1 FROM #temp_bg_reserve_money y
								WHERE y.i_sys = x.i_sys
									AND y.pr_id = x.pr_id
									AND y.i_reserve != 3
									{$whereFinalY}
							)
							AND NOT EXISTS (
								SELECT 1 FROM #temp_bg_reserve_money z
								WHERE z.i_sys = x.i_sys
									AND z.pr_id = x.pr_id
									AND z.po_id = x.po_id
									AND z.i_reserve = 2
							)

						ORDER BY po_id, pr_id

						-- ====== Result Set 4: เงินจองตรวจรับ (i_reserve=3, i_finish=0) + เบิกจ่ายแล้ว (i_reserve=3, i_finish=1) ======
						-- [เพิ่ม] ให้ตรงกับสูตรในหน้า Budget_Monitoring_Dashboard.php (List_Rep_Budget_Monitoring_Dashboard.php Result Set 2)
						SELECT
							ISNULL(SUM(CASE WHEN a.i_reserve = 3 AND ISNULL(a.i_finish,0) = 0 THEN a.f_amt ELSE 0 END), 0) AS f_reserve_check_total
							, ISNULL(SUM(CASE WHEN a.i_reserve = 3 AND ISNULL(a.i_finish,0) = 1 THEN a.f_amt ELSE 0 END), 0) AS f_paid_total
						FROM #temp_bg_reserve_money a
						WHERE a.i_reserve = 3
							AND a.i_sys = 1
							{$whereFinal}

						-- ====== Result Set 5: D1 (po_working ที่ยังไม่เคลียร์) ======
						-- [เพิ่ม] ให้ตรงกับสูตร f_d1_not_finish ในหน้า Budget_Monitoring_Dashboard.php
						SELECT
							ISNULL(SUM(ISNULL(bb.f_total,0)), 0) - ISNULL(SUM(ret.f_return), 0) AS f_d1_total
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
							AND bb.i_budget_year_overlap = {$year_en}
							AND bb.f_total != 0
							AND CASE WHEN ISNULL(bb.dc_cost_ref_id,0) = 0
									 THEN bb.dc_cost_id
									 ELSE bb.dc_cost_ref_id END = {$dc_cost_id}
							" . ($bg_expense_id > 0 ? " AND bb.bg_expense_id = {$bg_expense_id} " : "") . "
							" . ($dc_expense_budget_type_id > 0 ? " AND bb.dc_expense_budget_type_id = {$dc_expense_budget_type_id} " : "") . "
";

	// [FIX] ย้าย show_sql มาเช็คก่อนรันคิวรีจริง เดิม $db->QueryParam() ถูกเรียกไปแล้วก่อน
	// เช็ค show_sql ทำให้ debug ไม่ได้ถ้าคิวรีช้า/timeout เพราะต้องรอคิวรีจบก่อนเสมอ
	if (@$_REQUEST["show_sql"]) {
		echo $sqlMain;
		exit;
	}

	$stmt = $db->QueryParam($sqlMain, array());

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
				// ✅ แก้ไข 5: PO ที่ดึงมาจากก้อน "cross budget_type" (i_own_match = 0) เป็น PO ที่
				// ผูกกับ budget_type อื่น ไม่ใช่ของ budget_type ที่กำลังกรองอยู่จริง เก็บไว้แสดงในตาราง
				// เพื่อความโปร่งใส แต่ห้ามรวมเข้า f_contract_total ไม่งั้นยอด "เงินจองงบประมาณตามบัญชีจัดสรร"
				// จะถูกนับซ้ำ (เช่น 030300020001 ค่าวัสดุสำนักงาน แหล่งเงินกทม.4 ที่ยอดสูงเกินจริง)
				$is_own_match = (int)($rowC['i_own_match'] ?? 1) === 1;
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
					"is_cross_type"             => !$is_own_match,
				);
				if ($is_own_match) {
					$f_contract_total += (float)$rowC["f_amt_contract"];
				}
			}
		}

		// ---- Result Set 4: เงินจองตรวจรับ (i_reserve=3, i_finish=0) + เบิกจ่ายแล้ว (i_reserve=3, i_finish=1) ----
		// [เพิ่ม] ให้ตรงกับ Budget_Monitoring_Dashboard.php
		$f_check_total = 0;
		$f_paid_total  = 0;
		if ($db->NextResult($stmt)) {
			if ($rowChk = $db->Fetch($stmt)) {
				$f_check_total = (float)($rowChk['f_reserve_check_total'] ?? 0);
				$f_paid_total  = (float)($rowChk['f_paid_total']          ?? 0);
			}
		}

		// ---- Result Set 5: D1 (po_working ที่ยังไม่เคลียร์) ----
		// [เพิ่ม] ให้ตรงกับ Budget_Monitoring_Dashboard.php: f_d1_not_finish = f_d1_total - f_paid_total
		$f_d1_total = 0;
		if ($db->NextResult($stmt)) {
			if ($rowD1 = $db->Fetch($stmt)) {
				$f_d1_total = (float)($rowD1['f_d1_total'] ?? 0);
			}
		}
		$f_d1_not_finish = $f_d1_total - $f_paid_total;

		// [FIX 2026-07-28] เดิมส่งเฉพาะ $f_pr_only_total (has_po==0) กลับไปในชื่อ "f_pr_total"
		// ทำให้หน้า Rep_DetailByTypeV5.php ที่คำนวณ $f_reserve_total = $f_pr_total + $f_contract_total
		// ได้ยอดต่ำกว่าจริง เพราะ PR ที่มี PO แล้วแต่ PO ไม่ own-match (ถูก reclassify เป็นคนละ
		// bg_expense/budget_type) จะหายไปทั้งสองฝั่ง (ไม่นับใน f_pr_only_total เพราะ has_po=1,
		// ไม่นับใน f_contract_total เพราะ i_own_match=0)
		// Result Set 1 (i_reserve != 3 ทั้งหมด) รวมทั้ง PR-stage และ PO-stage ไว้แล้วโดยไม่ทับซ้อนกัน
		// (มาจาก SP_BG_RESERVE_MONEY โดยตรง) จึงส่ง $f_pr_total (ผลรวมเต็ม) กลับไปแทน
		$f_pr_card   = $f_pr_total;
		$f_remaining = $f_budget_total  - $f_reserve_total;
		$totalCount  = $no;
	}

	return json_encode(array(
		"totalCount"            => $totalCount,
		$root                   => ${$root},
		"budget_detail"         => array_values($budget_detail),  // [FIX] ส่ง per-row ให้ JS budgetMap
		"f_budget_total"        => $f_budget_total,
		"f_reserve_total"       => $f_reserve_total,
		"f_remaining"           => $f_remaining,
		"f_pr_total"            => $f_pr_card,
		"f_pr_only_total"       => $f_pr_only_total,  // [FIX] เก็บตัวเดิมไว้แยกต่างหาก เผื่อหน้าอื่นต้องใช้
		"f_contract_total"      => $f_contract_total,
		"contract"              => $contract_rows,
		"f_plan_cut_total"      => $f_plan_cut_total,
		"f_period_cut_total"    => $f_period_cut_total,
		// [เพิ่ม] เงินจองตรวจรับ / เบิกจ่ายแล้ว / D1 ให้ตรงกับ Budget_Monitoring_Dashboard.php
		"f_reserve_check_total" => $f_check_total,
		"f_paid_total"          => $f_paid_total,
		"f_d1_not_finish"       => $f_d1_not_finish,
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