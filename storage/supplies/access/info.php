<?php 
require_once("../conf/config.php"); 
if (isset($_SESSION["user_name"]) && empty($_SESSION["user_name"])) {
    header("HTTP/1.1 301 Moved Permanently");
    header('Location: ../access/signin.php');
    exit();
}

$c_position = $_SESSION['c_position'] ?? null;
$ss_username = $_SESSION["user_name"] ?? null;
$c_department = $_SESSION['c_department'] ?? null;
$sp_emp_id = $_SESSION["sp_emp_id"] ?? null;
$cost_name = $_SESSION['cost_name'] ?? null;

echo '<div id="info-user" align="left">'
 . '<p class="info-username"> <span>ผู้ใช้ : ' . $ss_username . '</span> </p>'
 . '<p class="info-username"> <span>' . $c_department . '<span></p>'
 . '<p class="info-username"> <span>หน่วยงาน :' . $cost_name . '<span></p>'
 . '</div>';

