<?php
require_once __DIR__ . '/../conf/config.php';
header('Cache-Control: no-store');
if (empty($_SESSION['user_id']) || (int)($_SESSION['dc_center_user'] ?? 0) !== 1) {
    http_response_code(403);
    exit('ไม่มีสิทธิ์ใช้งานเครื่องมือ ADMIN');
}
?>
<!doctype html>
<html lang="th">
<head>
    <meta charset="utf-8">
    <base href="/supplies/sp/">
    <title>ค้นหารายละเอียด ADMIN</title>
    <link rel="stylesheet" href="../js/ext-3.4.0/resources/css/ext-all.css">
    <link rel="stylesheet" href="../css/icon_all.css">
    <script src="../js/ext-3.4.0/adapter/ext/ext-base.js"></script>
    <script src="../js/ext-3.4.0/ext-all.js"></script>
    <script>Ext.session = <?= json_encode(['dc_center_user'=>1, 'user_id'=>(int)$_SESSION['user_id']]) ?>;</script>
    <script src="tor/checkingAdmin.js?v=<?= filemtime(__DIR__ . '/tor/checkingAdmin.js') ?>"></script>
    <script src="tor/contractDetails.js?v=<?= filemtime(__DIR__ . '/tor/contractDetails.js') ?>"></script>
    <script src="tor/adminOverviewSearch.js?v=<?= filemtime(__DIR__ . '/tor/adminOverviewSearch.js') ?>"></script>
    <style>body{margin:0;background:#f4f7fb;font:14px Tahoma,sans-serif;color:#365272}.intro{padding:20px}.intro button{padding:9px 18px;border:1px solid #bdcde2;border-radius:7px;background:#fff;color:#245ba2;cursor:pointer}</style>
</head>
<body>
    <script>Ext.onReady(function () { Ext.QuickTips.init(); Ext.openAdminOverviewSearch(); });</script>
</body>
</html>
