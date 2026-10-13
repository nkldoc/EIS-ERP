<?php

require_once __DIR__ . '/../_conf/erpConfirmationResponse.php';
require_once __DIR__ . '/../../conf/config.php';
header('Cache-Control: no-store');

if (empty($_SESSION['user_id'])) {
    erpConfirmationRespond(401, ['success' => false, 'message' => 'กรุณาเข้าสู่ระบบ']);
}
require_once __DIR__ . '/../../lib/database/DatabaseServer.php';
$suppliesDb = new DatabaseServer();
$erpPermission = $suppliesDb->GetDataBySQL(
        "SELECT COUNT(*) FROM dc_menu m WHERE m.i_enable=1 AND m.i_delete=2
     AND (m.c_filelocation='sp-deliverWork' OR m.c_filelocation LIKE 'sp-deliverWork?%' OR m.c_name=N'ส่งมอบงาน')
     AND (?=2 OR EXISTS (SELECT 1 FROM dc_user_menu u WHERE u.dc_menu_id=m.dc_menu_id AND u.dc_user_id=?))",
        [(int) ($_SESSION['i_type_user'] ?? 0), (int) $_SESSION['user_id']]
);
if (!$erpPermission)
    erpConfirmationRespond(403, ['success' => false, 'message' => 'ไม่มีสิทธิ์ยืนยันข้อมูลจาก ERP']);
if (empty($_SESSION['erp_confirmation_csrf']))
    $_SESSION['erp_confirmation_csrf'] = bin2hex(random_bytes(32));
$erpCsrf = $_SESSION['erp_confirmation_csrf'];
$erpUserId = (int) $_SESSION['user_id'];
$erpUserName = (string) ($_SESSION['user_name'] ?? $erpUserId);
session_write_close();

function erpConfirmationDb() {
    require_once __DIR__ . '/../_conf/mysql_connect.php';
    return spMysqlConnect();
}
