<?php
require_once __DIR__ . '/../../../conf/config.php';
require_once __DIR__ . '/../../../lib/database/DatabaseServer.php';
require_once __DIR__ . '/../../../conf/WorkspacePolicy.php';

function pdfReply($success, $msg, $extra = []) {
    header('Content-Type: text/html; charset=utf-8'); // Ext 3 iframe upload
    echo json_encode(array_merge(['success' => $success, 'msg' => $msg], $extra), JSON_UNESCAPED_UNICODE | JSON_HEX_TAG);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || empty($_SESSION['user_id'])) {
    pdfReply(false, 'กรุณาเข้าสู่ระบบ');
}
$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
$file = $_FILES['upload_pdf1'] ?? [];
if (!$id || ($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK
    || strtolower(pathinfo($file['name'] ?? '', PATHINFO_EXTENSION)) !== 'pdf'
    || !is_uploaded_file($file['tmp_name'] ?? '')
    || file_get_contents($file['tmp_name'], false, null, 0, 5) !== '%PDF-') {
    pdfReply(false, 'กรุณาเลือกไฟล์ PDF ที่ถูกต้อง');
}
$db = new DatabaseServer();
$conn = $db->conn;
$backup = null;
$target = null;
$written = false;
if (!sqlsrv_begin_transaction($conn)) pdfReply(false, 'ไม่สามารถเริ่มบันทึกได้');
try {
    $stmt = sqlsrv_query($conn, 'SELECT h.c_arrive_code, h.check_pdf, h.i_is_upload_chk, c.dc_cost_id
        FROM NMU_ERP.dbo.sp_check_period_hdr h WITH (UPDLOCK, HOLDLOCK)
        INNER JOIN NMU_ERP.dbo.sp_tor_contract c ON c.sp_tor_contract_id = h.sp_tor_contract_id
        WHERE h.sp_check_period_hdr_id = ?', [$id]);
    if (!$stmt) throw new Exception('ไม่สามารถอ่านข้อมูลเอกสารได้');
    $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
    if (!$row) throw new Exception('ไม่พบรายการตรวจรับ');
    $admin = (int)($_SESSION['dc_center_user'] ?? 0) === 1;
    if (SuppliesWorkspacePolicy::externalUnit($_SESSION)
        && (int)$row['dc_cost_id'] !== (int)($_SESSION['dc_cost_id'] ?? 0)) {
        throw new Exception('ไม่มีสิทธิ์ในรายการนี้');
    }
    $code = trim((string)$row['c_arrive_code']);
    if (!preg_match('/^[A-Za-z0-9_-]+$/D', $code)) throw new Exception('เลขรับของไม่ถูกต้อง');
    $dir = getenv('EIS_CHECKING_PDF_DIR') ?: 'D:/php_supplies/api/upload_Chk';
    if (!is_dir($dir) || !is_writable($dir)) throw new Exception('โฟลเดอร์ PDF ไม่พร้อมใช้งาน');
    $target = $dir . '/' . $code . '.pdf';
    $hasPdf = (int)$row['check_pdf'] === 1 && trim((string)$row['i_is_upload_chk']) !== '';
    if (!$admin && ($hasPdf || is_file($target))) throw new Exception('มีเอกสารแล้ว เฉพาะ Admin เท่านั้นที่เปลี่ยนไฟล์ได้');
    if (is_file($target)) {
        $backup = tempnam($dir, 'pdf_backup_');
        if (!$backup || !copy($target, $backup)) throw new Exception('ไม่สามารถสำรองไฟล์เดิมได้');
    }
    if (!move_uploaded_file($file['tmp_name'], $target)) throw new Exception('ไม่สามารถบันทึกไฟล์ PDF ได้');
    $written = true;
    $path = 'upload_Chk/' . $code . '.pdf';
    $stmt = sqlsrv_query($conn, 'UPDATE NMU_ERP.dbo.sp_check_period_hdr
        SET check_pdf = 1, i_is_upload_chk = ?, d_upload_chk = GETDATE()
        WHERE sp_check_period_hdr_id = ?', [$path, $id]);
    if (!$stmt || !sqlsrv_commit($conn)) throw new Exception('ไม่สามารถบันทึกฐานข้อมูลได้');
} catch (Throwable $e) {
    sqlsrv_rollback($conn);
    if ($written) {
        if ($backup) copy($backup, $target);
        else unlink($target);
    }
    if ($backup && is_file($backup)) unlink($backup);
    pdfReply(false, $e->getMessage());
}
if ($backup && is_file($backup)) unlink($backup);
pdfReply(true, 'บันทึก PDF เรียบร้อยแล้ว', ['file_path' => $path, 'id' => $id]);
