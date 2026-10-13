<?php

require_once("../conf/config.php");

header("Content-Type: application/json; charset=UTF-8");

$isActive = !empty($_SESSION["user_id"]);
$re = array(
    "reval" => $isActive ? 0 : 1,
    "success" => $isActive ? "Success" : "Error",
    "msg" => $isActive ? "Session active" : "Session expired",
    "data" => $_SESSION
);

echo json_encode($re);
exit;
