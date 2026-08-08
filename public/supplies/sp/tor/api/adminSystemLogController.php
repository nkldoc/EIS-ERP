<?php

header('Content-Type: application/json; charset=utf-8');
// ไฟล์ของคุณ (โหลดก่อน config หลัก)
define("DB_NAME", "NMU_ERPLOG");
include_once("../../../conf/config.php");
include_once("../../../lib/database/DatabaseServer.php");
include_once("../../../lib/database/apiUtil.php");

function adminLogResponse($success, $message, $data = array()) {
    echo json_encode(array_merge(array(
        'success' => (bool) $success,
        'message' => $message,
        'msg' => $message
                    ), $data), JSON_UNESCAPED_UNICODE);
    exit;
}

function adminLogClean($value, $maxLength = 0) {
    $value = trim((string) $value);
    $value = preg_replace('/[^\P{C}\n\r\t]+/u', '', $value);
    if ($maxLength > 0) {
        $value = function_exists('mb_substr') ? mb_substr($value, 0, $maxLength, 'UTF-8') : substr($value, 0, $maxLength);
    }
    return $value;
}

function adminLogSanitizeHtml($html) {
    $html = preg_replace('#<(script|iframe|object|embed|style)[^>]*>.*?</\1>#is', '', (string) $html);
    $html = strip_tags(
        $html,
        '<h1><h2><h3><h4><h5><h6><p><br><b><strong><i><em><u><ul><ol><li><table><thead><tbody><tr><th><td><div><span><img>'
    );

    // สร้าง tag ใหม่โดยไม่เก็บ attribute ใด ๆ ยกเว้นรูปแบบ data:image ที่ตรวจสอบแล้ว
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

function adminLogValidateImages($html) {
    preg_match_all('/data:image\/(?:png|jpeg|gif|webp);base64,([a-z0-9+\/=]+)/i', $html, $matches);
    if (count($matches[1]) > 5) {
        adminLogResponse(false, 'แนบรูปได้ไม่เกิน 5 รูปต่อรายการ');
    }
    $totalBytes = 0;
    foreach ($matches[1] as $encoded) {
        $totalBytes += (int) (strlen($encoded) * 3 / 4);
    }
    if ($totalBytes > 5 * 1024 * 1024) {
        adminLogResponse(false, 'ขนาดรูปทั้งหมดต้องไม่เกิน 5 MB');
    }
}

function adminLogClientIp() {
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        return trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    return isset($_SERVER['REMOTE_ADDR']) ? trim($_SERVER['REMOTE_ADDR']) : '';
}

try {
    if (strtoupper(isset($_REQUEST['mode']) ? $_REQUEST['mode'] : '') !== 'CREATE_ADMIN_LOG') {
        adminLogResponse(false, 'Mode การทำงานไม่ถูกต้อง');
    }

    $raw = isset($_POST['log_data']) ? $_POST['log_data'] : '';
    $log = json_decode($raw, true);
    if (!is_array($log)) {
        adminLogResponse(false, 'รูปแบบข้อมูล Log ไม่ถูกต้อง');
    }

    $moduleCode = adminLogClean(isset($log['module']) ? $log['module'] : '', 100);
    $referenceId = adminLogClean(isset($log['referenceId']) ? $log['referenceId'] : '', 100);
    $referenceCode = adminLogClean(isset($log['referenceCode']) ? $log['referenceCode'] : '', 100);
    $detailHtml = adminLogSanitizeHtml(isset($log['detailHtml']) ? $log['detailHtml'] : '');
    adminLogValidateImages($detailHtml);
    $detailText = adminLogClean(isset($log['detailText']) ? $log['detailText'] : '');
    $currentUrl = adminLogClean(isset($log['currentUrl']) ? $log['currentUrl'] : '', 2000);
    $browserInfo = adminLogClean(isset($log['browser']) ? $log['browser'] : '', 2000);
    $clientDateTime = adminLogClean(isset($log['createdAtClient']) ? $log['createdAtClient'] : '', 50);

    if ($detailText === '') {
        $detailText = adminLogClean(strip_tags(str_replace(array('<br>', '<br/>', '<br />'), "\n", $detailHtml)));
    }
    if ($detailText === '') {
        adminLogResponse(false, 'กรุณาระบุรายละเอียดที่ต้องการแจ้ง');
    }

    $util = new apiUtil();
    $requestUser = $util->mnUser($_REQUEST);
    $createdBy = adminLogClean(isset($requestUser['dc_user_create_id']) ? $requestUser['dc_user_create_id'] : (isset($_SESSION['user_id']) ? $_SESSION['user_id'] : ''), 50);
    $createdName = adminLogClean(isset($_SESSION['user_name']) ? $_SESSION['user_name'] : (isset($_SESSION['full_name']) ? $_SESSION['full_name'] : ''), 255);

    $subject = adminLogClean(isset($log['subject']) ? $log['subject'] : '', 500);
    if ($subject === '') {
        $subject = 'แจ้งตรวจสอบข้อมูลการจอง';
    }
    if ($referenceCode !== '' && strpos($subject, $referenceCode) === false) {
        $subject .= ' เลขที่ ' . $referenceCode;
    }

    $sql = "INSERT INTO dbo.admin_system_log
        (module_code, reference_id, reference_code, subject, detail_html, detail_text,
         current_url, browser_info, client_datetime, log_status, priority_code,
         created_by, created_name, created_ip, created_date)
        OUTPUT INSERTED.admin_system_log_id
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW', 'NORMAL', ?, ?, ?, GETDATE())";

    $params = array(
        $moduleCode, $referenceId, $referenceCode, $subject, $detailHtml, $detailText,
        $currentUrl, $browserInfo, $clientDateTime, $createdBy, $createdName, adminLogClientIp()
    );

    $db = new DatabaseServer();
    $stmt = $db->QueryParam($sql, $params);
    $row = $db->Fetch($stmt);
    $logId = $row && isset($row['admin_system_log_id']) ? $row['admin_system_log_id'] : null;
    $db->FreeSTMT($stmt);

    adminLogResponse(true, 'บันทึกแจ้ง Admin เรียบร้อยแล้ว', array('log_id' => $logId));
} catch (Throwable $e) {
    error_log('[adminSystemLogController] ' . $e->getMessage());
    adminLogResponse(false, 'เกิดข้อผิดพลาดระหว่างบันทึกข้อมูล');
}

