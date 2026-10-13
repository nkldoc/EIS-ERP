<?php
include("../../conf/config.php");
header('Content-Type: application/json; charset=utf-8');

$raw = file_get_contents('php://input');
if ($raw === false) { echo json_encode(['success'=>false, 'message'=>'no input']); exit; }

$data = json_decode($raw, true);
if (!$data || empty($data['pr_id']) || empty($data['doc_id'])) {
  echo json_encode(['success'=>false, 'message'=>'missing pr_id/doc_id']); exit;
}

// ดึงชื่อไฟล์ออกจาก path
$fileName = basename($data['filePath']);  // ✅ 0_PR25680200023_1_1.pdf  
$info = pathinfo($fileName); 
$jsonName = $info['filename'].'.json';  // ✅ 0_PR25680200023_1_1.json 
function parsePrFilePath($urlfile) {
    // แยกด้วย "/"
    $parts = explode('/', $urlfile);

    // ตรวจว่ามีครบ 3 ส่วน: year / PRcode / filename
    if (count($parts) >= 3) {
        $year     = $parts[0];
        $pr_code  = $parts[1];
        $filename = $parts[2];
        $folder   = $year . '/' . $pr_code . '/';

        return [
            'year'     => $year,
            'pr_code'  => $pr_code,
            'filename' => $filename,
            'folder'   => $folder
        ];
    } else {
        return null; // ผิดรูปแบบ
    }
} 
$result  = parsePrFilePath($data['filePath']);
 
$dir = PATH_DOCUMENTS.'/'.$result['year'].'/'.$result['pr_code'].'/json';

if (!is_dir($dir)) { mkdir($dir, 0775, true); }
 
$full = $dir . '/' . $jsonName;
$ok = file_put_contents($full, json_encode($data, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));

if ($ok === false) {
  echo json_encode(['success'=>false, 'message'=>'write failed']); exit;
}

// ถ้ามี public url ก็ส่งกลับ
$publicUrl = '/supplies/sp/app/json/' . $fname;

echo json_encode(['success'=>true, 'file'=>$full, 'url'=>$publicUrl]);
