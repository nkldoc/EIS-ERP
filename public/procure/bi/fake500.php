<?php
// ไฟล์นี้ใช้สำหรับทดสอบเท่านั้น
// จำลอง server ที่ return HTTP 500
http_response_code(500);
header('Content-Type: application/json');
echo json_encode([
    "error"   => "Internal Server Error",
    "message" => "This is a test 500 response"
]);
