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
