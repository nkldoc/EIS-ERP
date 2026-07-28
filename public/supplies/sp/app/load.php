<?php
// load.php
header('Content-Type: application/json; charset=utf-8');

// กำหนดโฟลเดอร์ที่อนุญาตให้อ่านไฟล์
$BASE = 'D:/Documents/json/';

// รับพารามิเตอร์
$pr  = isset($_GET['pr_code'])    ? preg_replace('/[^A-Za-z0-9_-]/','', $_GET['pr_code']) : '';
$sp  = isset($_GET['sp_type_id']) ? preg_replace('/[^0-9]/','', $_GET['sp_type_id'])       : '';

if ($pr === '' || $sp === '') {
    echo json_encode(['success'=>false, 'message'=>'missing pr_code or sp_type_id']);
    exit;
}

// สร้างชื่อไฟล์
$fname = $pr . '-' . $sp . '.json';
$full  = $BASE . $fname;

if (!file_exists($full)) {
    echo json_encode(['success'=>false, 'message'=>'file not found: '.$fname]);
    exit;
}

// อ่านและส่งออก
$content = file_get_contents($full);

// ตรวจสอบว่าเป็น JSON ที่ถูกต้อง
$json = json_decode($content, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['success'=>false, 'message'=>'invalid json in file: '.$fname]);
    exit;
}

// ส่ง JSON ตรง
echo $content;
