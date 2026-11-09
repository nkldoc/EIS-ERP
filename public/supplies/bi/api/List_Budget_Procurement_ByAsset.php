<?php
// รายการแผน 05-/06- สำหรับหน้า Budget_Procurement_ByAsset
// ข้อมูลแผน (ชื่อรายการ/งบ/ภาควิชา/สถานะ) อยู่ที่ NMU_ERP..sp_plan_budget
//   (นำเข้าจากไฟล์ แผน 06 ปี 2570 ดู dc/scriptBaseUpdate/sp_plan_budget_06_2570.sql)
// แสดงแผนที่ "ได้รับเรื่องแล้ว" (สถานะในไฟล์) หรือมี PR ผูกรหัสแผนในระบบแล้ว
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
	AND (b.c_status LIKE N'ได้รับเรื่อง%' OR x.plan_code IS NOT NULL)
ORDER BY b.sp_plan_budget_id";

	$rows = array();
	$stmt = $db->QueryParam($sql, array());
	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$budget = (float) $row["f_budget"];
			$amount = $row["amount"] !== null ? (float) $row["amount"] : 0.0;
			$rows[] = array(
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
			);
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
