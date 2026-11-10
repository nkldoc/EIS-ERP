<?php

// รหัสแผนหลายรายการต่อ 1 PR (dbo.sp_tor_plan) : mode LIST / SAVE
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");

$db = new DatabaseServer();

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    echo json_encode(['success' => false, 'msg' => 'Session expired']);
    exit;
}

$mode = $_REQUEST["mode"] ?? "";
$tor_id = intval($_REQUEST["tor_id"] ?? 0);
if ($tor_id <= 0) {
    echo json_encode(['success' => false, 'msg' => 'ไม่พบรหัส PR']);
    exit;
}

switch ($mode) {
    case "LIST":
        $rows = [];
        $stmt = $db->QueryParam(
            "SELECT plan_seq, plan_code FROM dbo.sp_tor_plan WHERE tor_id = ? AND i_enabled = 1 ORDER BY sp_tor_plan_id",
            array($tor_id)
        );
        while ($stmt && ($row = $db->Fetch($stmt))) {
            $rows[] = [
                "plan_seq" => $row["plan_seq"],
                "plan_code" => $row["plan_code"],
            ];
        }
        echo json_encode(['success' => true, 'data' => $rows]);
        exit;

    case "BUDGET":
        // วงเงินงบประมาณเริ่มต้นของรหัสแผนทั้งหมดของ PR นี้ (NMU_ERP..sp_plan_budget แผน 05/06) เทียบกับยอด PR ที่ผูกรหัสแผนเหล่านั้น
        // - 1 PR มีได้หลายรหัสแผน / 1 รหัสแผนมีได้หลาย PR : ยอดรวม PR นับแต่ละใบครั้งเดียว (ยอด PR เป็นยอดรวมทั้งใบ แยกต่อแผนไม่ได้)
        // - ยอด PR = ยอดจองเงินล่าสุด ถ้ายังไม่จองใช้ยอดรวมของ PR (เหมือนหน้า Budget_Procurement_ByAsset)
        // - ครบ = ยอด PR รวมที่ผูก >= วงเงินแผนรวม -> "ได้รับเรื่องครบแล้ว" ไม่ครบ -> "รอดำเนินการ"
        $plans = [];
        $stmt = $db->QueryParam(
            "SELECT m.plan_code, b.c_name, b.f_budget, b.c_status
             FROM (SELECT DISTINCT plan_code FROM NMU_ERP.dbo.sp_tor_plan WHERE tor_id = ? AND i_enabled = 1) m
             LEFT JOIN NMU_ERP.dbo.sp_plan_budget b ON b.plan_code = m.plan_code AND b.i_enabled = 1
             ORDER BY m.plan_code",
            array($tor_id)
        );
        while ($stmt && ($row = $db->Fetch($stmt))) {
            $plans[$row["plan_code"]] = [
                "plan_code" => $row["plan_code"],
                "plan_name" => $row["c_name"],
                "found" => $row["f_budget"] !== null,
                "budget" => $row["f_budget"] !== null ? (float) $row["f_budget"] : null,
                "file_status" => $row["c_status"],
                "prs" => [],
            ];
        }
        $prAmt = [];
        if ($plans) {
            $stmt = $db->QueryParam(
                "SELECT p.plan_code, t.tor_id, t.c_code, ISNULL(SUM(r.f_amt), ISNULL(t.f_total_amt, 0)) AS amt
                 FROM NMU_ERP.dbo.sp_tor t
                 INNER JOIN NMU_ERP.dbo.sp_tor_plan p ON p.tor_id = t.tor_id AND p.i_enabled = 1
                 LEFT JOIN NMU_EIS.dbo.bg_reserve_money r
                    ON r.pr_id = t.tor_id AND r.i_sys = 1 AND r.i_enable = 1 AND r.i_reserve = 1 AND ISNULL(r.i_last, 0) = 1
                 WHERE t.i_enabled = 1
                   AND p.plan_code IN (SELECT plan_code FROM NMU_ERP.dbo.sp_tor_plan WHERE tor_id = ? AND i_enabled = 1)
                 GROUP BY p.plan_code, t.tor_id, t.c_code, t.f_total_amt
                 ORDER BY t.c_code",
                array($tor_id)
            );
            while ($stmt && ($row = $db->Fetch($stmt))) {
                $amt = (float) $row["amt"];
                $prAmt[intval($row["tor_id"])] = $amt;
                if (isset($plans[$row["plan_code"]])) {
                    $plans[$row["plan_code"]]["prs"][] = [
                        "tor_id" => intval($row["tor_id"]),
                        "c_code" => $row["c_code"],
                        "amount" => $amt,
                        "self" => intval($row["tor_id"]) === $tor_id,
                    ];
                }
            }
        }
        $budgetTotal = 0.0;
        $foundCount = 0;
        $missing = [];
        foreach ($plans as $p) {
            if ($p["found"]) {
                $budgetTotal += $p["budget"];
                $foundCount++;
            } else {
                $missing[] = $p["plan_code"];
            }
        }
        $allocTotal = array_sum($prAmt);
        echo json_encode([
            'success' => true,
            'plans' => array_values($plans),
            'budget_total' => $budgetTotal,
            'alloc_total' => $allocTotal,
            'remain' => $budgetTotal - $allocTotal,
            'pr_count' => count($prAmt),
            'found_count' => $foundCount,
            'missing' => $missing,
            'complete' => $foundCount > 0 && $budgetTotal > 0 && $allocTotal >= $budgetTotal - 0.005,
        ]);
        exit;

    case "SAVE":
        // เพิ่ม/แก้ไขรหัสแผนได้เฉพาะผู้ใช้ "จัดสรรงบประมาณพัสดุ" (PRbudget, dc_user_id 60104) - ตรงกับที่ซ่อนปุ่มใน torUi.js
        if (intval($userId) !== 60104) {
            echo json_encode(['success' => false, 'msg' => 'เพิ่ม/แก้ไขรหัสแผนได้เฉพาะผู้ใช้ "จัดสรรงบประมาณพัสดุ" เท่านั้น']);
            exit;
        }
        $plans = json_decode($_REQUEST["plans"] ?? "[]", true);
        if (!is_array($plans)) {
            echo json_encode(['success' => false, 'msg' => 'ข้อมูลรหัสแผนไม่ถูกต้อง']);
            exit;
        }
        $db->BeginTran();
        $ok = (bool) $db->QueryParam("UPDATE dbo.sp_tor_plan SET i_enabled = 0 WHERE tor_id = ? AND i_enabled = 1", array($tor_id));
        $codes = [];
        $seqs = [];
        foreach ($plans as $p) {
            $code = trim($p["plan_code"] ?? "");
            if ($code === "") {
                continue;
            }
            $seq = trim($p["plan_seq"] ?? "");
            $codes[] = $code;
            $seqs[] = $seq;
            $ok = $ok && (bool) $db->QueryParam(
                "INSERT INTO dbo.sp_tor_plan (tor_id, plan_seq, plan_code, i_enabled, d_create, dc_user_create_id) VALUES (?, ?, ?, 1, GETDATE(), ?)",
                array($tor_id, $seq, $code, $userId)
            );
        }
        // sync ค่าสรุปกลับ sp_tor (คั่นด้วย ",") ให้รายงาน/หน้าจอเดิมที่อ่าน plan_code, plan_seq ยังใช้ได้
        $ok = $ok && (bool) $db->QueryParam(
            "UPDATE dbo.sp_tor SET plan_code = ?, plan_seq = ? WHERE tor_id = ?",
            array(implode(",", $codes) ?: null, implode(",", $seqs) ?: null, $tor_id)
        );
        if ($ok) {
            $db->CommitTran();
            echo json_encode(['success' => true, 'plan_code' => implode(",", $codes), 'plan_seq' => implode(",", $seqs)]);
        } else {
            $db->RollBackTran();
            echo json_encode(['success' => false, 'msg' => 'บันทึกรหัสแผนไม่สำเร็จ']);
        }
        exit;
}

echo json_encode(['success' => false, 'msg' => 'unknown mode']);
