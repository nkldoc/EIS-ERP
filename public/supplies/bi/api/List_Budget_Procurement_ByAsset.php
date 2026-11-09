<?php
// รายการแผน 05-/06- สำหรับหน้า Budget_Procurement_ByAsset
// ข้อมูลแผน (ชื่อรายการ/งบ/ภาควิชา/สถานะ) อยู่ที่ NMU_ERP..sp_plan_budget
//   (นำเข้าจากไฟล์ แผน 06 ปี 2570 ดู dc/scriptBaseUpdate/sp_plan_budget_06_2570.sql)
// ส่งแผนทั้งหมด (ทุกสถานะ) พร้อมสถานะ 1 รับเรื่องแล้ว / 2 ยังไม่ได้รับเรื่อง / 3 รอดำเนินการ / 4 ยกเลิก ให้หน้าจอกรองเอง
// ข้อมูล PR (เลข PR/เลขที่หนังสือ/ยอด) ใช้ค่าจากระบบก่อน ถ้าไม่มีใช้ค่าจากไฟล์
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();

function List_ByAsset()
{
	global $db;

	$yearTh = isset($_REQUEST['year_th']) ? intval($_REQUEST['year_th']) : (date('Y') + 543);
	$yearEn = isset($_REQUEST['year_en']) ? intval($_REQUEST['year_en']) : ($yearTh - 543);

	$sql = "SET NOCOUNT ON
SELECT
	b.plan_code
	, b.c_group_name
	, b.c_name AS plan_name
	, b.f_budget
	, ISNULL(x.fund_id, b.dc_expense_budget_type_id) AS fund_id
	, (SELECT c_name FROM NMU_DATACENTER..dc_expense_budget_type WHERE dc_expense_budget_type_id = ISNULL(x.fund_id, b.dc_expense_budget_type_id)) AS fund_name
	, (SELECT c_code + ' : ' + c_name FROM NMU_EIS..bg_expense WHERE bg_expense_id = x.bg_expense_id) AS bg_expense
	, b.c_expense_type
	, ISNULL(x.doc_refs, b.c_doc_ref) AS doc_ref
	, ISNULL(x.pr_codes, b.c_pr_code) AS pr_code
	, CASE WHEN x.plan_code IS NOT NULL THEN x.amt ELSE b.f_approve_amt END AS amount
	, b.c_status AS file_status
	, CASE WHEN x.plan_code IS NOT NULL THEN 1 ELSE 0 END AS has_sys_amt
	-- มี PR ที่ใช้งานอยู่ผูกรหัสแผนนี้ (รวม PR ที่ผูกหลายรหัสแผน) / มี PR ที่ถูกยกเลิกผูกอยู่ (sp_tor.i_enabled 1 = ใช้งาน, 2 = ยกเลิก)
	, CASE WHEN EXISTS (SELECT 1 FROM NMU_ERP..sp_tor_plan p2 INNER JOIN NMU_ERP..sp_tor t2 ON t2.tor_id = p2.tor_id
			WHERE p2.plan_code = b.plan_code AND p2.i_enabled = 1 AND t2.i_enabled = 1) THEN 1 ELSE 0 END AS has_pr
	, CASE WHEN EXISTS (SELECT 1 FROM NMU_ERP..sp_tor_plan p3 INNER JOIN NMU_ERP..sp_tor t3 ON t3.tor_id = p3.tor_id
			WHERE p3.plan_code = b.plan_code AND p3.i_enabled = 1 AND t3.i_enabled = 2) THEN 1 ELSE 0 END AS has_cancel
	-- PR ที่ใช้งานอยู่ของรหัสแผนนี้ มีการจองเงินแล้ว (ผ่านขั้นจัดสรรเงินงบประมาณ) อย่างน้อย 1 ใบ
	, CASE WHEN EXISTS (SELECT 1 FROM NMU_ERP..sp_tor_plan p4 INNER JOIN NMU_ERP..sp_tor t4 ON t4.tor_id = p4.tor_id AND t4.i_enabled = 1
			INNER JOIN NMU_EIS..bg_reserve_money r4 ON r4.pr_id = t4.tor_id AND r4.i_sys = 1 AND r4.i_enable = 1 AND r4.i_reserve = 1 AND ISNULL(r4.i_last, 0) = 1
			WHERE p4.plan_code = b.plan_code AND p4.i_enabled = 1) THEN 1 ELSE 0 END AS has_reserve
FROM NMU_ERP..sp_plan_budget b
	LEFT JOIN (
		SELECT plan_code
			, SUM(amt) AS amt
			, MIN(bg_expense_id) AS bg_expense_id
			, MIN(fund_id) AS fund_id
			, STRING_AGG(c_code, ', ') AS pr_codes
			, STRING_AGG(d_doc_ref, ', ') AS doc_refs
		FROM (
			SELECT p.plan_code, t.tor_id, t.c_code, t.d_doc_ref
				, ISNULL(SUM(r.f_amt), ISNULL(t.f_total_amt, 0)) AS amt
				, ISNULL(MIN(r.bg_expense_id), t.po_expense_id) AS bg_expense_id
				, ISNULL(MIN(r.dc_budget_type_id), t.dc_expense_budget_type_id) AS fund_id
			FROM NMU_ERP..sp_tor t
				INNER JOIN NMU_ERP..sp_tor_plan p ON p.tor_id = t.tor_id AND p.i_enabled = 1
				LEFT JOIN NMU_EIS..bg_reserve_money r
					ON r.pr_id = t.tor_id AND r.i_sys = 1 AND r.i_enable = 1 AND r.i_reserve = 1
					AND r.i_year = {$yearEn} AND ISNULL(r.i_last, 0) = 1
			WHERE t.i_enabled = 1 AND p.plan_code LIKE '%-{$yearTh}'
				-- PR ที่ผูกหลายรหัสแผน แยกยอดต่อแผนจากระบบไม่ได้ (ยอด PR เป็นยอดรวมทั้งใบ) ให้ใช้ยอดต่อแผนจากไฟล์แทน
				AND t.tor_id NOT IN (SELECT tor_id FROM NMU_ERP..sp_tor_plan WHERE i_enabled = 1 GROUP BY tor_id HAVING COUNT(*) > 1)
			GROUP BY p.plan_code, t.tor_id, t.c_code, t.d_doc_ref, t.f_total_amt, t.po_expense_id, t.dc_expense_budget_type_id
		) pr
		GROUP BY plan_code
	) x ON x.plan_code = b.plan_code
WHERE b.i_enabled = 1
	AND b.i_year = {$yearTh}
	AND (b.plan_code LIKE '05-%' OR b.plan_code LIKE '06-%')
ORDER BY b.sp_plan_budget_id";

	$rows = array();
	$stmt = $db->QueryParam($sql, array());
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$budget = (float) $row["f_budget"];
			$amount = $row["amount"] !== null ? (float) $row["amount"] : 0.0;
			$hasPr = intval($row["has_pr"]) === 1;
			$hasCancel = intval($row["has_cancel"]) === 1;
			$fileReceived = (bool) preg_match('/^ได้รับเรื่อง/u', (string) $row["file_status"]);
			$hasReserve = intval($row["has_reserve"]) === 1;
			// สถานะรหัสแผน 4 แบบ (ระบบตัดสินจาก PR ที่ผูกรหัสแผน ไม่ดูว่ายอดครบวงเงินหรือไม่ - ยอดคงเหลือดูที่คอลัมน์ "คงเหลือ")
			//  4 ยกเลิก            = มี PR ผูกแต่ถูกยกเลิกหมด (ไม่มี PR ที่ใช้งานอยู่)
			//  2 ยังไม่ได้รับเรื่อง = ไม่มี PR ที่ใช้งานอยู่ และสถานะในไฟล์ยังไม่ได้รับเรื่อง
			//  3 รอดำเนินการ      = มี PR ผูกแล้ว แต่ยังไม่จองเงิน (ยังไม่ผ่านขั้นจัดสรรเงินงบประมาณ)
			//  1 รับเรื่องแล้ว     = มี PR ผูกและจองเงินแล้ว หรือ สถานะในไฟล์ว่าได้รับเรื่องแล้ว (ยังไม่มี PR ในระบบ)
			if (!$hasPr && $hasCancel) {
				$status = 4;
			} elseif (!$hasPr && !$fileReceived) {
				$status = 2;
			} elseif ($hasPr && !$hasReserve) {
				$status = 3;
			} else {
				$status = 1;
			}
			$rows[] = array(
				"status"     => $status,
				"has_pr"     => $hasPr ? 1 : 0,
				"has_reserve" => $hasReserve ? 1 : 0,
				"plan_code"  => $row["plan_code"],
				"group_name" => preg_replace('/^\d+\.\s*/u', '', (string) $row["c_group_name"]),
				"plan_name"  => $row["plan_name"],
				"fund_id"    => $row["fund_id"] !== null ? intval($row["fund_id"]) : null,
				"fund_name"  => $row["fund_name"],
				"bg_expense" => $row["bg_expense"] ?: $row["c_expense_type"],
				"budget"     => $budget,
				"doc_ref"    => $row["doc_ref"],
				"pr_code"    => $row["pr_code"],
				"amount"     => $amount,
				"remain"     => $budget - $amount,
				// ภายใน: แผนที่มี PR ผูกแต่ไม่มียอดจากระบบ (ผูกกับ PR ที่มีหลายรหัสแผน) ใช้ตรวจ "กลุ่ม PR ครบ" ด้านล่าง
				"_multi"     => ($hasPr && intval($row["has_sys_amt"]) === 0),
			);
		}

		// PR ที่ผูกหลายรหัสแผน: ยอด PR เป็นยอดรวมทั้งใบ แยกต่อแผนไม่ได้ จึงตัดสิน "ทั้งกลุ่ม" - ถ้ายอด PR ถึงผลรวมวงเงินของทุกรหัสแผนใน PR นั้น
		// ถือว่าทุกรหัสในกลุ่มครบ (รับเรื่องแล้ว) ตรงกับที่แสดงในหน้า ST0001.1 (ยอดต่อรหัส = วงเงินของรหัสนั้น)
		$idx = array();
		foreach ($rows as $i => $r) {
			$idx[$r["plan_code"]] = $i;
		}
		$sqlMulti = "SET NOCOUNT ON
SELECT p.tor_id, p.plan_code, ISNULL(SUM(r.f_amt), ISNULL(t.f_total_amt, 0)) AS amt
FROM NMU_ERP..sp_tor t
	INNER JOIN NMU_ERP..sp_tor_plan p ON p.tor_id = t.tor_id AND p.i_enabled = 1
	LEFT JOIN NMU_EIS..bg_reserve_money r
		ON r.pr_id = t.tor_id AND r.i_sys = 1 AND r.i_enable = 1 AND r.i_reserve = 1 AND ISNULL(r.i_last, 0) = 1
WHERE t.i_enabled = 1
	AND t.tor_id IN (SELECT tor_id FROM NMU_ERP..sp_tor_plan WHERE i_enabled = 1 GROUP BY tor_id HAVING COUNT(*) > 1)
	AND t.tor_id IN (SELECT tor_id FROM NMU_ERP..sp_tor_plan WHERE i_enabled = 1 AND plan_code LIKE '%-{$yearTh}')
GROUP BY p.tor_id, p.plan_code, t.f_total_amt";
		$torCodes = array();
		$torAmt = array();
		$stmtM = $db->QueryParam($sqlMulti, array());
		if ($stmtM) {
			while ($m = $db->Fetch($stmtM)) {
				$torCodes[intval($m["tor_id"])][] = $m["plan_code"];
				$torAmt[intval($m["tor_id"])] = (float) $m["amt"];
			}
		}
		foreach ($torCodes as $tid => $codes) {
			$sumBudget = 0.0;
			foreach ($codes as $c) {
				if (isset($idx[$c])) {
					$sumBudget += $rows[$idx[$c]]["budget"];
				}
			}
			if ($sumBudget > 0 && $torAmt[$tid] >= $sumBudget - 0.005) {
				foreach ($codes as $c) {
					if (isset($idx[$c]) && $rows[$idx[$c]]["_multi"]) {
						$rows[$idx[$c]]["amount"] = $rows[$idx[$c]]["budget"];
						$rows[$idx[$c]]["remain"] = 0.0;
					}
				}
			}
		}
		foreach ($rows as $i => $r) {
			unset($rows[$i]["_multi"]);
		}
	}

	echo json_encode(array("data" => $rows, "year_th" => $yearTh, "year_en" => $yearEn, "totalCount" => count($rows)));
}

$fn = $_GET['fn'] ?? '';
if ($fn === 'List_ByAsset') {
	List_ByAsset();
} else {
	echo json_encode(['success' => false, 'message' => 'invalid fn']);
}
