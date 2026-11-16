<?php
// คำขอยกเลิก PR (จากหน้าตรวจสอบเอกสาร) -> อนุมัติโดย "จัดสรรงบประมาณพัสดุ" (dc_user_id 60104)
// mode: REQUEST | LIST | APPROVE | REJECT   (ตาราง dbo.sp_tor_cancel_req ดู dc/scriptBaseUpdate/create_sp_tor_cancel_req.sql)
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
$db = new DatabaseServer();

const CANCEL_APPROVER_ID = 60104;

function out($arr) {
    echo json_encode($arr);
    exit;
}

$userId = $_SESSION['user_id'] ?? null;
if (!$userId) {
    http_response_code(401);
    out(['success' => false, 'msg' => 'Session expired']);
}
$costId = $_SESSION['dc_cost_id'] ?? null;
$mode = $_REQUEST['mode'] ?? '';
$now = date('Y-m-d H:i:s');

// แจ้งเตือนในระบบ (js/cancel-req-alert.js เรียกทุก 1 นาที) : ตอบเฉพาะผู้อนุมัติ ผู้ใช้อื่นได้ count = 0
if ($mode === 'PENDING_COUNT') {
    if (intval($userId) !== CANCEL_APPROVER_ID) {
        // approver = false -> สคริปต์ฝั่งหน้าเว็บหยุดตรวจเลย (ผู้ใช้ทั่วไปไม่ต้องยิง API ซ้ำทุกไม่กี่วินาที)
        out(['success' => true, 'approver' => false, 'count' => 0, 'items' => []]);
    }
    $stmt = $db->QueryParam(
        "SELECT TOP 5 r.sp_tor_cancel_req_id, t.c_code, r.c_reason
         FROM dbo.sp_tor_cancel_req r INNER JOIN dbo.sp_tor t ON t.tor_id = r.tor_id
         WHERE r.i_status = 1 ORDER BY r.sp_tor_cancel_req_id DESC",
        array()
    );
    $items = array();
    while ($stmt && ($row = $db->Fetch($stmt))) {
        $items[] = array('id' => intval($row['sp_tor_cancel_req_id']), 'code' => $row['c_code'], 'reason' => $row['c_reason']);
    }
    // GetDataBySQL คืนค่าเดี่ยว (scalar) เมื่อ query มีคอลัมน์เดียว
    $cnt = $db->GetDataBySQL("SELECT COUNT(*) AS n FROM dbo.sp_tor_cancel_req WHERE i_status = 1", array());
    out(['success' => true, 'approver' => true, 'count' => intval($cnt), 'items' => $items]);
}

if ($mode === 'REQUEST') {
    $torId = intval($_REQUEST['id'] ?? 0);
    $reason = trim($_REQUEST['reason'] ?? '');
    if ($torId <= 0 || $reason === '') {
        out(['success' => false, 'msg' => 'กรุณากรอกสาเหตุที่จะยกเลิก']);
    }
    $tor = $db->GetDataBySQL("SELECT tor_id, tor_status_id, i_enabled FROM dbo.sp_tor WHERE tor_id = ?", array($torId));
    if (empty($tor) || intval($tor['i_enabled']) != 1) {
        out(['success' => false, 'msg' => 'ไม่พบรายการ หรือรายการถูกยกเลิกไปแล้ว']);
    }
    $dup = $db->GetDataBySQL("SELECT COUNT(*) AS n FROM dbo.sp_tor_cancel_req WHERE tor_id = ? AND i_status = 1", array($torId));
    if (intval($dup) > 0) { // คอลัมน์เดียว -> GetDataBySQL คืน scalar
        out(['success' => false, 'msg' => 'รายการนี้มีคำขอยกเลิกที่รออนุมัติอยู่แล้ว']);
    }
    $ok = $db->QueryParam(
        "INSERT INTO dbo.sp_tor_cancel_req (tor_id, sp_status_hdr_id, c_reason, i_status, dc_user_req_id, dc_user_req_cost_id, d_req)
         VALUES (?, ?, ?, 1, ?, ?, ?)",
        array($torId, $tor['tor_status_id'], $reason, $userId, $costId, $now)
    );
    out($ok
        ? ['success' => true, 'msg' => 'ส่งคำขอยกเลิกให้ฝ่ายจัดสรรงบประมาณพัสดุแล้ว รอการอนุมัติ']
        : ['success' => false, 'msg' => 'บันทึกคำขอไม่สำเร็จ']);
}

if ($mode === 'LIST') {
    $status = intval($_REQUEST['i_status'] ?? 1);
    $stmt = $db->QueryParam(
        "SELECT r.sp_tor_cancel_req_id, r.tor_id, r.c_reason, r.i_status, r.d_req, r.c_result_comment, r.d_result,
                r.c_restore_comment, r.c_released_reserve_ids, t.i_enabled AS tor_enabled,
                t.c_code, t.c_name, t.f_total_amt, t.i_enabled,
                (SELECT TOP 1 c_name FROM dbo.sp_emp e WHERE e.sp_emp_id = t.sp_emp_id) AS sp_emp_name,
                (SELECT TOP 1 c_name FROM dbo.sp_status_hdr s WHERE s.sp_status_hdr_id = r.sp_status_hdr_id) AS c_status_name,
                (SELECT COUNT(*) FROM " . DB_NMU_EIS . "bg_reserve_money b WHERE b.pr_id = r.tor_id AND b.i_enable = 1) AS n_reserve
         FROM dbo.sp_tor_cancel_req r
         INNER JOIN dbo.sp_tor t ON t.tor_id = r.tor_id
         WHERE r.i_status = ?
         ORDER BY r.d_req DESC",
        array($status)
    );
    $rows = array();
    while ($stmt && ($row = $db->Fetch($stmt))) {
        $rows[] = array(
            'id' => intval($row['sp_tor_cancel_req_id']),
            'tor_id' => intval($row['tor_id']),
            'c_code' => $row['c_code'],
            'c_name' => $row['c_name'],
            'f_total_amt' => number_format($row['f_total_amt'], 2),
            'sp_emp_name' => $row['sp_emp_name'],
            'c_status_name' => $row['c_status_name'],
            'c_reason' => $row['c_reason'],
            'i_status' => intval($row['i_status']),
            // รออนุมัติ/ไม่อนุมัติ = จำนวนแถวที่จองอยู่ตอนนี้ ; อนุมัติแล้ว/กู้คืนแล้ว = จำนวนแถวที่ตอนอนุมัติปิดไป
            'n_reserve' => in_array(intval($row['i_status']), array(2, 4))
                ? count(array_filter(explode(',', (string) $row['c_released_reserve_ids'])))
                : intval($row['n_reserve']),
            'can_restore' => (intval($row['i_status']) === 2 && intval($row['tor_enabled']) === 2) ? 1 : 0,
            'c_restore_comment' => $row['c_restore_comment'],
            'd_req' => $row['d_req'] instanceof DateTime ? $row['d_req']->format('d/m/Y H:i') : $row['d_req'],
            'c_result_comment' => $row['c_result_comment'],
        );
    }
    out(array('success' => true, 'totalCount' => count($rows), 'data' => $rows));
}

if ($mode === 'APPROVE' || $mode === 'REJECT') {
    if (intval($userId) !== CANCEL_APPROVER_ID) {
        out(['success' => false, 'msg' => 'เฉพาะผู้ใช้ "จัดสรรงบประมาณพัสดุ" เท่านั้นที่อนุมัติได้']);
    }
    $reqId = intval($_REQUEST['id'] ?? 0);
    $comment = trim($_REQUEST['comment'] ?? '');
    if ($mode === 'REJECT' && $comment === '') {
        out(['success' => false, 'msg' => 'กรุณากรอกเหตุผลที่ไม่อนุมัติ']);
    }
    $req = $db->GetDataBySQL(
        "SELECT r.sp_tor_cancel_req_id, r.tor_id, r.sp_status_hdr_id, r.c_reason, r.i_status, t.sp_emp_id, t.i_enabled
         FROM dbo.sp_tor_cancel_req r INNER JOIN dbo.sp_tor t ON t.tor_id = r.tor_id
         WHERE r.sp_tor_cancel_req_id = ?",
        array($reqId)
    );
    if (empty($req) || intval($req['i_status']) != 1) {
        out(['success' => false, 'msg' => 'ไม่พบคำขอ หรือคำขอถูกดำเนินการไปแล้ว']);
    }
    $torId = intval($req['tor_id']);

    $db->BeginTran();
    $ok = true;
    $releasedIds = '';
    $deleteId = null;
    if ($mode === 'APPROVE') {
        // จดไว้ว่าแถวจองเงินไหนที่ "ปิดตอนอนุมัติ" (ใช้เปิดคืนตอนกู้คืน PR) - เฉพาะแถวที่ยังเปิดอยู่
        $stmtIds = $db->QueryParam("SELECT bg_reserve_money_id FROM " . DB_NMU_EIS . "bg_reserve_money WHERE pr_id = ? AND i_enable = 1", array($torId));
        $ids = array();
        while ($stmtIds && ($r = $db->Fetch($stmtIds))) {
            $ids[] = intval($r['bg_reserve_money_id']);
        }
        $releasedIds = implode(',', $ids);
        // เหมือน mode Cancel_Tor ใน mnTorController.php: บันทึก sp_tor_delete + ปิด PR + ปิดการจองเงิน (เงินคืนงบทันที)
        $ok = $ok && $db->QueryParam(
            "INSERT INTO dbo.sp_tor_delete (sp_tor_id, sp_emp_id, sp_status_hdr_id, d_delete, dc_user_delete_id, dc_user_cost_delete_id, c_comment, i_type_delete)
             VALUES (?, ?, ?, ?, ?, ?, ?, 2)",
            array($torId, $req['sp_emp_id'], $req['sp_status_hdr_id'], $now, $userId, $costId, $req['c_reason'])
        );
        // คอลัมน์เดียว -> GetDataBySQL คืน scalar
        $deleteId = $db->GetDataBySQL("SELECT TOP 1 sp_tor_delete_id FROM dbo.sp_tor_delete WHERE sp_tor_id = ? AND i_type_delete = 2 ORDER BY sp_tor_delete_id DESC", array($torId));
        $ok = $ok && $db->QueryParam("UPDATE dbo.sp_tor SET i_enabled = 2 WHERE tor_id = ?", array($torId));
        $ok = $ok && $db->QueryParam("UPDATE " . DB_NMU_EIS . "bg_reserve_money SET i_enable = 2 WHERE pr_id = ?", array($torId));
    }
    $ok = $ok && $db->QueryParam(
        "UPDATE dbo.sp_tor_cancel_req
            SET i_status = ?, c_result_comment = ?, dc_user_result_id = ?, d_result = ?,
                c_released_reserve_ids = ?, sp_tor_delete_id = ?
          WHERE sp_tor_cancel_req_id = ? AND i_status = 1",
        array($mode === 'APPROVE' ? 2 : 3, $comment, $userId, $now, $mode === 'APPROVE' ? $releasedIds : null, $deleteId ?: null, $reqId)
    );
    if ($ok) {
        $db->CommitTran();
        out(['success' => true, 'msg' => $mode === 'APPROVE' ? 'อนุมัติแล้ว PR ถูกยกเลิกและคืนเงินจองเข้างบประมาณเรียบร้อย' : 'บันทึกการไม่อนุมัติเรียบร้อย']);
    }
    $db->RollBackTran();
    out(['success' => false, 'msg' => 'ดำเนินการไม่สำเร็จ']);
}

// รายละเอียด PR ของคำขอ (ดับเบิลคลิกแถวในหน้าอนุมัติ) เพื่อให้ผู้อนุมัติตรวจสอบก่อนตัดสินใจ
if ($mode === 'DETAIL') {
    $reqId = intval($_REQUEST['id'] ?? 0);
    $fmtDate = function ($d) {
        return $d instanceof DateTime ? $d->format('d/m/Y H:i') : ($d ?: '');
    };
    $h = $db->GetDataBySQL(
        "SELECT r.tor_id, r.c_reason, r.i_status, r.d_req, r.c_result_comment, r.d_result, r.c_restore_comment, r.d_restore,
                t.c_code, t.c_name, t.f_total_amt, t.i_yyyy, t.i_enabled, t.plan_code, t.d_create, t.c_comment AS tor_comment,
                t.i_amount_bg, t.f_type_amt, t.f_type2_amt, t.f_type3_amt,
                (SELECT TOP 1 c_name FROM dbo.sp_emp e WHERE e.sp_emp_id = t.sp_emp_id) AS emp_name,
                (SELECT TOP 1 c_name FROM dbo.dc_cost c WHERE c.dc_cost_id = t.dc_cost_id) AS cost_name,
                (SELECT TOP 1 c_name FROM dbo.sp_status_hdr s WHERE s.sp_status_hdr_id = t.tor_status_id) AS status_now,
                (SELECT TOP 1 c_name FROM dbo.sp_status_hdr s WHERE s.sp_status_hdr_id = r.sp_status_hdr_id) AS status_req,
                (SELECT TOP 1 c_name FROM dbo.dc_expense_budget_type b WHERE b.dc_expense_budget_type_id = t.dc_expense_budget_type_id) AS bg1,
                (SELECT TOP 1 c_name FROM dbo.dc_expense_budget_type b WHERE b.dc_expense_budget_type_id = t.dc_expense_budget_type2_id) AS bg2,
                (SELECT TOP 1 c_name FROM dbo.dc_expense_budget_type b WHERE b.dc_expense_budget_type_id = t.dc_expense_budget_type3_id) AS bg3,
                (SELECT TOP 1 c_full_name FROM dbo.dc_user u2 WHERE u2.dc_user_id = r.dc_user_req_id) AS req_by
         FROM dbo.sp_tor_cancel_req r INNER JOIN dbo.sp_tor t ON t.tor_id = r.tor_id
         WHERE r.sp_tor_cancel_req_id = ?",
        array($reqId)
    );
    if (empty($h) || !is_array($h)) {
        out(['success' => false, 'msg' => 'ไม่พบคำขอ']);
    }
    $torId = intval($h['tor_id']);

    $items = array();
    $stmt = $db->QueryParam(
        "SELECT d.c_name, d.i_qty, d.f_unit_price,
                (SELECT TOP 1 u.c_name FROM dbo.dc_unit_type u WHERE u.dc_unit_type_id = d.dc_unit_type_id) AS unit_name
         FROM dbo.sp_tor_dtl d WHERE d.sp_tor_id = ? ORDER BY d.sp_tor_dtl_id",
        array($torId)
    );
    while ($stmt && ($r = $db->Fetch($stmt))) {
        $items[] = array(
            'name' => $r['c_name'], 'qty' => $r['i_qty'], 'unit' => $r['unit_name'],
            'price' => number_format($r['f_unit_price'], 2),
            'total' => number_format($r['i_qty'] * $r['f_unit_price'], 2),
        );
    }

    $reserves = array();
    $stmt = $db->QueryParam(
        "SELECT bg_reserve_money_id, i_year, f_amt, i_enable, d_create FROM " . DB_NMU_EIS . "bg_reserve_money WHERE pr_id = ? ORDER BY bg_reserve_money_id",
        array($torId)
    );
    while ($stmt && ($r = $db->Fetch($stmt))) {
        $reserves[] = array(
            'id' => intval($r['bg_reserve_money_id']), 'year' => $r['i_year'],
            'amt' => number_format($r['f_amt'], 2),
            'active' => intval($r['i_enable']) === 1 ? 1 : 0,
            'd_create' => $fmtDate($r['d_create']),
        );
    }

    $sources = array();
    foreach (array(1 => array('bg1', 'f_type_amt'), 2 => array('bg2', 'f_type2_amt'), 3 => array('bg3', 'f_type3_amt')) as $n => $f) {
        if (!empty($h[$f[0]])) {
            $sources[] = array('name' => $h[$f[0]], 'amt' => number_format($h[$f[1]], 2));
        }
    }

    out(array('success' => true, 'data' => array(
        'c_code' => $h['c_code'], 'c_name' => $h['c_name'], 'f_total_amt' => number_format($h['f_total_amt'], 2),
        'i_yyyy' => $h['i_yyyy'], 'plan_code' => $h['plan_code'], 'emp_name' => $h['emp_name'], 'cost_name' => $h['cost_name'],
        'status_now' => $h['status_now'], 'status_req' => $h['status_req'], 'tor_enabled' => intval($h['i_enabled']),
        'd_create' => $fmtDate($h['d_create']), 'tor_comment' => $h['tor_comment'],
        'req' => array('status' => intval($h['i_status']), 'by' => $h['req_by'], 'd_req' => $fmtDate($h['d_req']), 'reason' => $h['c_reason'],
            'result_comment' => $h['c_result_comment'], 'd_result' => $fmtDate($h['d_result']),
            'restore_comment' => $h['c_restore_comment'], 'd_restore' => $fmtDate($h['d_restore'])),
        'sources' => $sources, 'items' => $items, 'reserves' => $reserves,
    )));
}

// กู้คืน PR ที่ถูกยกเลิก (อนุมัติไปแล้ว) เผื่อกดผิด : เปิด PR + เปิดการจองเงินเดิมที่ปิดตอนอนุมัติ + ถอดแถวประวัติยกเลิก (สำรองใน sp_tor_delete_restore_log)
if ($mode === 'RESTORE') {
    if (intval($userId) !== CANCEL_APPROVER_ID) {
        out(['success' => false, 'msg' => 'เฉพาะผู้ใช้ "จัดสรรงบประมาณพัสดุ" เท่านั้นที่กู้คืนได้']);
    }
    $reqId = intval($_REQUEST['id'] ?? 0);
    $comment = trim($_REQUEST['comment'] ?? '');
    $req = $db->GetDataBySQL(
        "SELECT r.sp_tor_cancel_req_id, r.tor_id, r.i_status, r.c_released_reserve_ids, r.sp_tor_delete_id, t.i_enabled
         FROM dbo.sp_tor_cancel_req r INNER JOIN dbo.sp_tor t ON t.tor_id = r.tor_id
         WHERE r.sp_tor_cancel_req_id = ?",
        array($reqId)
    );
    if (empty($req) || intval($req['i_status']) != 2) {
        out(['success' => false, 'msg' => 'ไม่พบคำขอที่อนุมัติแล้ว หรือถูกกู้คืนไปแล้ว']);
    }
    if (intval($req['i_enabled']) != 2) {
        out(['success' => false, 'msg' => 'PR นี้ไม่ได้อยู่ในสถานะยกเลิก จึงกู้คืนไม่ได้']);
    }
    $torId = intval($req['tor_id']);
    $reserveIds = array_filter(array_map('intval', explode(',', (string) $req['c_released_reserve_ids'])));
    $deleteId = intval($req['sp_tor_delete_id']);

    $db->BeginTran();
    $ok = true;
    if ($deleteId > 0) {
        $ok = $ok && $db->QueryParam("INSERT INTO dbo.sp_tor_delete_restore_log SELECT * FROM dbo.sp_tor_delete WHERE sp_tor_delete_id = ? AND sp_tor_id = ?", array($deleteId, $torId));
        $ok = $ok && $db->QueryParam("DELETE FROM dbo.sp_tor_delete WHERE sp_tor_delete_id = ? AND sp_tor_id = ? AND i_type_delete = 2", array($deleteId, $torId));
    }
    $ok = $ok && $db->QueryParam("UPDATE dbo.sp_tor SET i_enabled = 1 WHERE tor_id = ? AND i_enabled = 2", array($torId));
    if (count($reserveIds) > 0) {
        // id มาจาก intval ทั้งหมด จึงต่อสตริงได้อย่างปลอดภัย
        $ok = $ok && $db->QueryParam(
            "UPDATE " . DB_NMU_EIS . "bg_reserve_money SET i_enable = 1 WHERE pr_id = ? AND bg_reserve_money_id IN (" . implode(',', $reserveIds) . ")",
            array($torId)
        );
    }
    $ok = $ok && $db->QueryParam(
        "UPDATE dbo.sp_tor_cancel_req
            SET i_status = 4, c_restore_comment = ?, dc_user_restore_id = ?, d_restore = ?
          WHERE sp_tor_cancel_req_id = ? AND i_status = 2",
        array($comment, $userId, $now, $reqId)
    );
    if ($ok) {
        $db->CommitTran();
        out(['success' => true, 'msg' => 'กู้คืน PR เรียบร้อย กลับมาใช้งานต่อได้' . (count($reserveIds) > 0 ? ' และเปิดการจองเงินเดิมคืนแล้ว' : '')]);
    }
    $db->RollBackTran();
    out(['success' => false, 'msg' => 'กู้คืนไม่สำเร็จ']);
}

out(['success' => false, 'msg' => 'unknown mode']);
