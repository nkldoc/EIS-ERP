<?php
// listFiles_getpdf.php

include("../../conf/config.php");

// รับ path หรือ URL จาก GET เช่น ?path=supplies/2026/PR25680700005/input/PR25680700005_1_2.pdf
$relPath = $_GET['path'] ?? '';

if (!$relPath) {
    http_response_code(400);
    echo "Missing parameter: path";
    exit;
}

$basePath = rtrim(PATH_DOCUMENTS, '/\\');
$filePath = $basePath . '/' . ltrim($relPath, '/\\');

// ตรวจสอบว่าไฟล์มีอยู่จริง
if (!file_exists($filePath)) {
    http_response_code(404);
    echo "File not found: " . htmlspecialchars($filePath);
    exit;
}

// ตั้ง header ให้เบราว์เซอร์รู้ว่าเป็น PDF
header('Content-Type: application/pdf');
header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
header('Content-Length: ' . filesize($filePath));

// อ่านไฟล์แล้วส่งออก
readfile($filePath);
exit;
