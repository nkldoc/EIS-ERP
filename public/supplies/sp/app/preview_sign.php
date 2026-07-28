<?php  require_once("../../conf/config.php");
$pr = $_GET['pr'] ?? '';
$filename = $_GET['filename'] ?? '';
$yBg = $_GET['bgYear']??YEARBG;
$filepath = "{$pr}/sign/" . basename($filename);

if (file_exists($filepath)) {
    header('Content-Type: application/pdf');
    header('Content-Disposition: inline; filename="' . basename($filepath) . '"');
    header('Content-Length: ' . filesize($filepath));
    readfile($filepath);
    exit;
} else {
    echo "File not found: " . htmlspecialchars($filepath);
}