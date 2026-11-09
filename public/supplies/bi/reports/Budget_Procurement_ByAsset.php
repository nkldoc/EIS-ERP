<?php
// งบประมาณ พัสดุ แยกตาม ครุภัณฑ์ — ใช้หน้าเดียวกับ Budget_Monitoring_Dashboard
// แต่กรองเฉพาะรหัสงบ 05/06 และไม่รวมโครงการต่อเนื่องหลายปี (ดู asset_only ใน API)
$ASSET_ONLY = true;
include __DIR__ . '/Budget_Monitoring_Dashboard.php';
