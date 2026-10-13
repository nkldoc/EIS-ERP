<?php

header('Content-Type: application/json; charset=utf-8');
// ไฟล์ของคุณ (โหลดก่อน config หลัก)
define("DB_NAME", "NMU_ERPLOG");
include_once("../../../conf/config.php");
include_once("../../../lib/database/DatabaseServer.php");

function listLogResponse($success, $message, $data = array()) {
    echo json_encode(array_merge(array(
        'success' => (bool) $success,
        'message' => $message,
        'msg' => $message
                    ), $data), JSON_UNESCAPED_UNICODE);
    exit;
}

function listLogClean($value, $maxLength) {
    $value = trim((string) $value);
    return function_exists('mb_substr') ? mb_substr($value, 0, $maxLength, 'UTF-8') : substr($value, 0, $maxLength);
}

function listLogSafeHtml($html) {
    $html = preg_replace('#<(script|iframe|object|embed|style)[^>]*>.*?</\1>#is', '', (string) $html);
    $html = strip_tags($html,
        '<h1><h2><h3><h4><h5><h6><p><br><b><strong><i><em><u><ul><ol><li><table><thead><tbody><tr><th><td><div><span><img>');
    return preg_replace_callback('/<\s*(\/?)\s*([a-z0-9]+)([^>]*)>/is', function ($match) {
        $closing = $match[1] === '/';
        $tag = strtolower($match[2]);
        $allowed = array('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'b', 'strong',
            'i', 'em', 'u', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span', 'img');
        if (!in_array($tag, $allowed, true)) {
            return '';
        }
        if ($tag === 'br') {
            return '<br>';
        }
        if ($tag === 'img') {
            if ($closing || !preg_match('/\bsrc\s*=\s*(["\'])(data:image\/(?:png|jpeg|gif|webp);base64,[a-z0-9+\/=\r\n]+)\1/i', $match[3], $src)) {
                return '';
            }
            return '<img src="' . str_replace(array("\r", "\n"), '', $src[2]) . '" style="max-width:100%;height:auto;">';
        }
        return $closing ? '</' . $tag . '>' : '<' . $tag . '>';
    }, $html);
}

try {
    if (strtoupper(isset($_REQUEST['mode']) ? $_REQUEST['mode'] : '') !== 'LIST_ADMIN_LOG') {
        listLogResponse(false, 'Mode การทำงานไม่ถูกต้อง', array('total' => 0, 'data' => array()));
    }

    $allowedStatuses = array('', 'NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'CANCELLED');
    $status = strtoupper(listLogClean(isset($_REQUEST['status']) ? $_REQUEST['status'] : '', 30));
    if (!in_array($status, $allowedStatuses, true)) {
        $status = '';
    }
    $search = listLogClean(isset($_REQUEST['search']) ? $_REQUEST['search'] : '', 255);
    $start = max(0, (int) (isset($_REQUEST['start']) ? $_REQUEST['start'] : 0));
    $limit = (int) (isset($_REQUEST['limit']) ? $_REQUEST['limit'] : 50);
    if ($limit < 1 || $limit > 200) {
        $limit = 50;
    }

    $where = array();
    $params = array();
    if ($status !== '') {
        $where[] = 'L.log_status = ?';
        $params[] = $status;
    }
    if ($search !== '') {
        $where[] = '(L.subject LIKE ? OR L.reference_code LIKE ? OR L.detail_text LIKE ? OR L.created_name LIKE ?)';
        $keyword = '%' . $search . '%';
        array_push($params, $keyword, $keyword, $keyword, $keyword);
    }
    $whereSql = count($where) ? ' WHERE ' . implode(' AND ', $where) : '';

    $db = new DatabaseServer();
    $countStmt = $db->QueryParam('SELECT COUNT(*) AS total FROM dbo.admin_system_log L' . $whereSql, $params);
    $countRow = $db->Fetch($countStmt);
    $total = $countRow ? (int) $countRow['total'] : 0;
    $db->FreeSTMT($countStmt);

    $endRow = $start + $limit;
    $listParams = array_merge($params, array($start, $endRow));
    $sql = "SELECT * FROM (
        SELECT ROW_NUMBER() OVER (
            ORDER BY CASE L.log_status WHEN 'NEW' THEN 1 WHEN 'IN_PROGRESS' THEN 2 ELSE 3 END,
                     L.created_date DESC
        ) AS row_no,
        L.admin_system_log_id, L.module_code, L.reference_id, L.reference_code,
        L.subject, L.detail_html, L.detail_text, L.current_url, L.log_status,
        L.priority_code, L.assigned_admin_id, L.admin_comment, L.created_by,
        L.created_name, L.created_ip,
        CONVERT(VARCHAR(19), L.created_date, 120) AS created_date
        FROM dbo.admin_system_log L" . $whereSql . "
    ) X WHERE X.row_no > ? AND X.row_no <= ? ORDER BY X.row_no";

    $stmt = $db->QueryParam($sql, $listParams);
    $rows = array();
    while ($row = $db->Fetch($stmt)) {
        unset($row['row_no']);
        $row['detail_html'] = listLogSafeHtml(isset($row['detail_html']) ? $row['detail_html'] : '');
        $rows[] = $row;
    }
    $db->FreeSTMT($stmt);

    listLogResponse(true, 'โหลดข้อมูลสำเร็จ', array('total' => $total, 'data' => $rows));
} catch (Throwable $e) {
    error_log('[adminSystemLogList] ' . $e->getMessage());
    listLogResponse(false, 'ไม่สามารถโหลดรายการ Log ได้', array('total' => 0, 'data' => array()));
}

