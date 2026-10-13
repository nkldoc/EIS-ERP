<?php
// listFiles_getpdf.php

include("../../conf/config.php");

// รับ path หรือ URL จาก GET เช่น ?path=2025/PR25680200023/json/0_PR25680200023_1_1.json

$relPath = $_GET['path'] ?? '2025/PR25680200023/json/0_PR25680200023_1_1.json';
//==========================
//$dir  = dirname($relPath);              // 2025/PR25680200023/json
//$file = basename($relPath);             // 0_PR25680200023_1_1.json 
// ลบเลข + "_" หน้าไฟล์ เช่น 0_, 1_, 2_ ... 9_
//$cleanFile = preg_replace('/^[0-9]_/', '', $file); 
// รวมกลับเป็น path เดิม
//$relPath = $dir . "/" . $cleanFile;
 //==========================
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
header('Content-Type: application/json');
header('Content-Disposition: inline; filename="' . basename($filePath) . '"');
header('Content-Length: ' . filesize($filePath));

// อ่านไฟล์แล้วส่งออก
readfile($filePath);
exit;
