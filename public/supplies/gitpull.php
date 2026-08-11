<?php

//
//// 1. ตั้งค่า Security Basic (ป้องกันคนภายนอกกดเล่นโดยไม่ได้รับอนุญาต)
//$secret_token = 'gSIMk7Kh2ZwYLc1fkCf5o55MN8NusyzG9AceLcMy+Yg'; // เปลี่ยนเป็น Secret Key ของคุณ
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

// 4. ย้าย Directoy ไปยังโฟลเดอร์โปรเจกต์
chdir($directory);

// 5. รันคำสั่ง git pull (ใส่ 2>&1 เพื่อจับ Error output ออกมาแสดงด้วย)
// หาก git อยู่ใน PATH ของเครื่อง สามารถเรียก 'git pull 2>&1' ได้ทันที
// หากเครื่องหา git ไม่เจอ ให้ระบุ Full path เช่น 'C:\\Program Files\\Git\\cmd\\git.exe pull 2>&1'
$command = 'git pull 2>&1';
$output = [];
$return_var = 0;

exec($command, $output, $return_var);

// 6. แสดงผลลัพธ์
echo "<h3>Git Pull Result:</h3>";
echo "<pre style='background:#f4f4f4; padding:15px; border-radius:5px;'>";
echo implode("\n", $output);
echo "</pre>";

if ($return_var === 0) {
    echo "<p style='color:green;'><b>Success!</b> Updated successfully.</p>";
} else {
    echo "<p style='color:red;'><b>Error!</b> Code exit status: {$return_var}</p>";
}
?>