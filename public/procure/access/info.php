<?php

require_once("../conf/config.php");
$c_position = $_SESSION['c_position'] ?? null;
$ss_username = $_SESSION["user_name"] ?? null;
$c_department = $_SESSION['c_department'] ?? null;
$sp_emp_id = $_SESSION["sp_emp_id"] ?? null;
$cost_name = $_SESSION["cost_name"] ?? null;
$i_type_emp = $_SESSION["i_type_emp"] ?? null;
if ($i_type_emp == 0) {
    $txtCost = "หน่วยงาน";
} else if ($i_type_emp == 1) {
    $txtCost = "หน่วยงาน(ฝ่าย 11)";
} else {
    $txtCost = "หน่วยงานเจ้าของเรื่อง";
}
echo '<div id="info-user" align="left">'
 . '<span class="info-username"> คุณ ' . $ss_username . ' </span><br/>'
 . '<span class="info-username"> ' . $txtCost . ' ' . $cost_name . ' </span><br/>'
// . '<span class="info-username"> '.$txtCost .' '. $cost_name . ' </span><br/>'
// . '<div class="info" id="close"><span class="info-close" id="logout"><a id="logoutID" class="header" href="#" target="_self">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ออกจากระบบ</a> </span></div>'
 . '</div>';

