<?php

// 1. ตั้งค่า Security Basic (แนะนำให้เปิดใช้งานเมื่อนำไปขึ้น Server จริง)
//$secret_token = 'gSIMk7Kh2ZwYLc1fkCf5o55MN8NusyzG9AceLcMy+Yg';
//if (!isset($_GET['token']) || $_GET['token'] !== $secret_token) {
//    http_response_code(403);
//    die('Unauthorized access.');
//}
// 2. กำหนด Path ของโฟลเดอร์โปรเจกต์
$directory = 'D:\\EIS-ERP';

// 3. ตรวจสอบว่าโฟลเดอร์มีจริงหรือไม่
if (!is_dir($directory)) {
    die("Directory not found: {$directory}");
}

// 4. ย้าย Directory ไปยังโฟลเดอร์โปรเจกต์
chdir($directory);

// 5. รันคำสั่ง git pull origin master (ใส่ 2>&1 เพื่อจับ Error output มาแสดง)
$command = 'git pull origin master 2>&1';
$output = [];
$return_var = 0;

exec($command, $output, $return_var);

// 6. แสดงผลลัพธ์
echo "<h3>Git Pull Result (origin/master):</h3>";
echo "<pre style='background:#f4f4f4; padding:15px; border-radius:5px;'>";
echo implode("\n", $output);
echo "</pre>";

if ($return_var === 0) {
    echo "<p style='color:green;'><b>Success!</b> Updated master branch successfully.</p>";
} else {
    echo "<p style='color:red;'><b>Error!</b> Code exit status: {$return_var}</p>";
}
?>