<?php
require_once __DIR__ . '/../conf/config.php';
if (empty($_SESSION['user_id'])) {
    header('Location: signin.php');
    exit;
}
$counter = (int) ($_SESSION['counter'] ?? 1);
$_SESSION['counter'] = $counter + 1;
?>
<!DOCTYPE html>
<html><head><title>PHP session</title></head>
<body><p>Session counter: <?= $counter ?></p></body></html>
