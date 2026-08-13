<?php
session_start();

$timeout = 1800; // 30 นาที (หน่วยเป็นวินาที)

if (isset($_SESSION['created'])) {
    if (time() - $_SESSION['created'] > $timeout) {
        // Session หมดอายุ
        session_unset();     // ล้างค่า session
        session_destroy();   // ทำลาย session
        echo "Session expired. Please log in again.";
        exit;
    }
} else {
    // ตั้งค่าเวลาเริ่มต้น
    $_SESSION['created'] = time();
}

// อัปเดตเวลาเพื่อรีเฟรชอายุ session ทุกครั้งที่โหลดหน้า
$_SESSION['created'] = time();

echo "Session active. Remaining time: " . ($timeout - (time() - $_SESSION['created'])) . " seconds.";
?>
