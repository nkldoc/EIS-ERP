<?php
function erpConfirmationRespond($status, $data) {
    if (defined('ERP_CONFIRMATION_API_BUFFER')) {
        while (ob_get_level() > ERP_CONFIRMATION_API_BUFFER) ob_end_clean();
    }
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function erpConfirmationFailure(Throwable $error, string $stage): void {
    $driver = $error instanceof PDOException ? (int)($error->errorInfo[1] ?? 0) : 0;
    $code = 'ERP_SERVER_ERROR';
    $message = 'ระบบขัดข้อง กรุณาแจ้งผู้ดูแลระบบ';
    if ($stage === 'source') {
        $code = 'ERP_SOURCE_MISSING';
        $message = 'ไม่พบไฟล์ประมวลผลข้อมูล ERP บนเซิร์ฟเวอร์ กรุณาติดตั้งไฟล์ให้ครบ';
    } elseif ($driver === 1045) {
        $code = 'MYSQL_ACCESS_DENIED';
        $message = 'MySQL ปฏิเสธบัญชีเชื่อมต่อ กรุณาตรวจบัญชี รหัสผ่าน และสิทธิ์ของเครื่องโปรดักชัน';
    } elseif (in_array($driver, [2002, 2003, 2005, 2006, 2013], true)) {
        $code = 'MYSQL_UNREACHABLE';
        $message = 'เชื่อมต่อ MySQL ไม่สำเร็จ กรุณาตรวจ host พอร์ต และบริการ MySQL บนเซิร์ฟเวอร์';
    } elseif ($driver === 1049) {
        $code = 'MYSQL_DATABASE_MISSING';
        $message = 'ไม่พบฐานข้อมูล MySQL ที่ตั้งค่าไว้ กรุณาตรวจชื่อฐานข้อมูล';
    } elseif ($driver === 1146) {
        $code = 'ERP_SCHEMA_MISSING';
        $message = 'ยังไม่มีตารางข้อมูล ERP บนฐานข้อมูลนี้ กรุณาติดตั้งตารางด้วย erp-confirmation-migration.php';
    } elseif ($stage === 'connect' && !($error instanceof PDOException)) {
        $code = 'MYSQL_CONFIG_ERROR';
        $message = 'การตั้งค่า MySQL ไม่ครบหรือไม่มี pdo_mysql กรุณาตรวจโปรไฟล์ production ใน sp/_conf';
    }
    // Keep credentials and SQL text out of both responses and diagnostic logs.
    error_log('ERP confirmation ' . $code . ' stage=' . $stage . ' type=' . get_class($error) . ' driver=' . $driver);
    erpConfirmationRespond(503, ['success'=>false, 'code'=>$code, 'message'=>$message]);
}
