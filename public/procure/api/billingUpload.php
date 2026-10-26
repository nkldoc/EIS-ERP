<?php
require_once __DIR__ . '/../conf/config.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
function billingUploadReply($code, $message, $fileName = null, $errorCode = null) {
    http_response_code($code);
    echo json_encode(['success' => $code === 200, 'status' => $code === 200 ? 'success' : 'error', 'message' => $message, 'fileName' => $fileName, 'errorCode' => $errorCode]);
    exit;
}
if (empty($_SESSION['user_id'])) {
    billingUploadReply(401, 'Authentication required.');
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    billingUploadReply(405, 'POST required.');
}
session_write_close();
if ((int) ($_SERVER['CONTENT_LENGTH'] ?? 0) > 1074790400) {
    billingUploadReply(413, 'Maximum file size is 1 GiB.');
}
$file = $_FILES['file'] ?? null;
if (!$file || !is_array($file) || is_array($file['error'] ?? null)) {
    billingUploadReply(400, 'A PDF file is required.');
}
$error = $file['error'] ?? UPLOAD_ERR_NO_FILE;
if ($error === UPLOAD_ERR_INI_SIZE || $error === UPLOAD_ERR_FORM_SIZE) {
    billingUploadReply(413, 'Maximum file size is 1 GiB.');
}
if ($error !== UPLOAD_ERR_OK) {
    billingUploadReply(400, 'Upload incomplete. Please retry.');
}
$name = $file['name'] ?? '';
if (!preg_match('/\A[A-Za-z0-9_-]{1,80}\.pdf\z/i', $name)) {
    billingUploadReply(400, 'Invalid PDF filename.');
}
$temp = $file['tmp_name'];
if (!is_uploaded_file($temp)) {
    billingUploadReply(400, 'Invalid upload.');
}
$size = filesize($temp);
if ($size === false || $size === 0 || $size > 1073741824) {
    billingUploadReply($size > 1073741824 ? 413 : 400, 'File must contain data and be at most 1 GiB.');
}
$stream = fopen($temp, 'rb');
$signature = $stream ? fread($stream, 5) : '';
if ($stream) { fclose($stream); }
if ($signature !== '%PDF-') {
    billingUploadReply(400, 'Only PDF files are accepted.');
}
// Match the existing /sp_mn/api/upload_ap/ preview location; ignore client dir.
$directory = 'D:/php_supplies/api/upload_ap';
// Check the actual operation: a cached permission probe is not proof that
// the IIS/PHP request can write this file (or overwrite an existing file).
$writeWarning = '';
set_error_handler(function ($severity, $message) use (&$writeWarning) {
    $writeWarning .= $message . "\n";
    return true;
});
try {
    clearstatcache(true, $directory);
    $saved = move_uploaded_file($temp, $directory . '/' . $name);
} finally {
    restore_error_handler();
}
if (!$saved) {
    $errorCode = 'STORAGE_WRITE_FAILED';
    if (stripos($writeWarning, 'open_basedir') !== false) {
        $errorCode = 'STORAGE_PATH_RESTRICTED';
    } elseif (stripos($writeWarning, 'Permission denied') !== false || stripos($writeWarning, 'Access is denied') !== false) {
        $errorCode = 'STORAGE_ACCESS_DENIED';
    } elseif (stripos($writeWarning, 'No such file') !== false) {
        $errorCode = 'STORAGE_PATH_NOT_FOUND';
    }
    $entry = date('c') . ' ' . json_encode([
        'code' => $errorCode,
        'destination' => $directory,
        'warning' => trim($writeWarning),
        'php_ini' => php_ini_loaded_file(),
        'open_basedir' => ini_get('open_basedir')
    ], JSON_UNESCAPED_SLASHES) . PHP_EOL;
    error_log($entry);
    // This log is outside the public document root; default PHP logging remains
    // available even if the application log directory is not writable.
    @file_put_contents(dirname(__DIR__, 4) . '/storage/logs/billing-upload.log', $entry, FILE_APPEND | LOCK_EX);
    billingUploadReply(500, 'Could not save PDF. Reference: ' . $errorCode, null, $errorCode);
}
billingUploadReply(200, 'File uploaded successfully.', $name);
