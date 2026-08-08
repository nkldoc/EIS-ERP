<?php 
include("../conf/config.php");
$_SESSION = array();
if (!headers_sent()) {
    setcookie(session_name(), "", [
        "expires" => time() - 3600,
        "path" => "/",
        "secure" => !empty($_SERVER["HTTPS"]) && strtolower($_SERVER["HTTPS"]) !== "off",
        "httponly" => true,
        "samesite" => "Lax",
    ]);
}
session_destroy();
echo "<p>✅ Session cleared and GC executed.</p>";
echo "<script>window.location.href = 'https://" . HTTPS_HOST_NAME . "/NMU_permission';</script>";
