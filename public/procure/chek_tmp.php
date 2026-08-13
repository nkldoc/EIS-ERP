<?php

echo "<h3>PHP Temporary Directory Check</h3>";

// 1. ตรวจสอบค่าจาก php.ini
echo "<b>upload_tmp_dir (จาก php.ini):</b> " . ini_get('upload_tmp_dir') . "<br>";
echo "<b>sys_temp_dir (จาก php.ini):</b> " . ini_get('sys_temp_dir') . "<br>";

// 2. ค่าที่ PHP เลือกใช้จริงในระบบ
$sys_tmp = sys_get_temp_dir();
echo "<b>โฟลเดอร์ Temp ที่ PHP ใช้จริงในปัจจุบัน:</b> " . $sys_tmp . "<br><br>";

// 3. ทดสอบการเขียนไฟล์ลงในโฟลเดอร์นั้น
$test_file = $sys_tmp . DIRECTORY_SEPARATOR . "test_php_write.txt";
if (@file_put_contents($test_file, "ทดสอบเขียนไฟล์")) {
    echo "<span style='color: green; font-weight: bold;'>✔ สำเร็จ: PHP สามารถเขียนไฟล์ลงโฟลเดอร์ Temp นี้ได้ปกติ!</span>";
    unlink($test_file); // ลบไฟล์ทดสอบทิ้ง
} else {
    echo "<span style='color: red; font-weight: bold;'>❌ ล้มเหลว: PHP ไม่มีสิทธิ์เขียนไฟล์ (Permission Denied) หรือหาโฟลเดอร์ไม่เจอ!</span>";
}
?>