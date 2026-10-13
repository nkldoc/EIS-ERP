<?php
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data["image"]) || !isset($data["filename"])) {
  echo json_encode(["message" => "❌ ข้อมูลไม่ครบ"]);
  exit;
}

$base64 = $data["image"];
$filename = basename($data["filename"]); // ป้องกัน path traversal

$folder = __DIR__ . "/uploads/"; // ปรับเป็นโฟลเดอร์ที่คุณต้องการ
if (!file_exists($folder)) {
  mkdir($folder, 0777, true);
}

$imageData = explode(",", $base64);
if (count($imageData) != 2) {
  echo json_encode(["message" => "❌ รูปแบบ base64 ผิดพลาด"]);
  exit;
}

$decoded = base64_decode($imageData[1]);
$savePath = $folder . $filename;

if (file_put_contents($savePath, $decoded)) {
  echo json_encode(["message" => "✅ บันทึกเรียบร้อย: $filename"]);
} else {
  echo json_encode(["message" => "❌ ไม่สามารถบันทึกไฟล์ได้"]);
}
