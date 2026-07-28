<?php

// บังคับเปิดเซสชันเผื่อไว้ (ป้องกันกรณีที่ไฟล์หลักลืมเปิด แล้วเรียกใช้ $_SESSION)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (!isset($db)) {
    // ใช้ __DIR__ แทน dirname(__FILE__) เพื่อความสะอาดและแม่นยำ
    $db_conf = __DIR__ . '/../../conf/config.php';
    $db_path = __DIR__ . '/../../lib/database/DatabaseServer.php';

    // ตรวจสอบว่าไฟล์คอนฟิกและไฟล์คลาสฐานข้อมูลมีอยู่จริงไหม
    if (file_exists($db_conf) && file_exists($db_path)) {
        include_once($db_conf);
        include_once($db_path);

        if (class_exists('DatabaseServer')) {
            $db = new DatabaseServer();
        } else {
            // เอาไว้เช็คใน Log เผื่อไฟล์โหลดมาแล้วแต่ชื่อคลาสไม่ตรงหรือพังข้างใน
            error_log("React/PHP Error: Class 'DatabaseServer' not found even though file was included.");
        }
    } else {
        error_log("React/PHP Error: Missing files. Conf: $db_conf, Path: $db_path");
    }
}

// กำหนดค่าสิทธิ์เบื้องต้นจากกิลด์ cost_id (รองรับค่าว่าง)
$can_view_bi = in_array($_SESSION['dc_cost_id'] ?? 0, [0, 38, 3]);
$permission = false;

if (isset($_SESSION['user_id'])) {

    // ตรวจสอบชื่อ Prefix ของฐานข้อมูลกลาง
    $db_center_prefix = defined('DB_CENTER') ? DB_CENTER : "NMU_DATACENTER..";

    $sqlPerm = "SELECT TOP 1 1 FROM " . $db_center_prefix . "sp_bi_permission WHERE dc_user_id = ? AND i_enabled = 1";

    // ตรวจสอบว่า $db ถูกสร้างสำเร็จและพร้อมใช้งานจริงไหม
    if (isset($db) && $db instanceof DatabaseServer) {
        $stmtPerm = $db->QueryParam($sqlPerm, array($_SESSION['user_id']));

        // แนะนำให้เช็คผลลัพธ์การ Fetch ให้ชัวร์ (บางคลาสใช้ Fetch, บางคลาสใช้ RowCount)
        // สมมติว่าตามโค้ดเดิมของคุณคืนค่ามากกว่า 0 แปลว่าเจอสิทธิ์
        if ($db->Fetch($stmtPerm) > 0) {
            $can_view_bi = true;
            $permission = true;
        }
    } else {
        // ดักเอาไว้ดูเลยว่าถ้า $db ไม่มา จะได้รู้ตัวทันที
        // echo "เกิดข้อผิดพลาด: ระบบไม่สามารถเชื่อมต่อฐานข้อมูล ($db ไม่มีอยู่หรือไม่ใช่คลาส DatabaseServer)";
    }
}