<?php
header('Content-Type: application/json; charset=utf-8');

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db   = new DatabaseServer();
$date = new i_date();

// TODO: ถ้าจะ query จริง ให้ใช้ $db->connect() และ SELECT กลับรูปแบบฟิลด์เหมือน $rows
$rows = [
  [
    "bg_expense_id" => 101, "c_name" => "ครุภัณฑ์การศึกษา",
    "f_reserve_budget" => 455118562.62, "f_plan_begin_remaining" => 30539137.38,
    "f_reserve_period_bkb" => 121430600.24, "f_period_transfer_remaining_bkb" => 2802099.76,
    "f_reserve_period_government" => 71806000.00, "f_period_transfer_remaining_government" => 18562384.48
  ],
  [
    "bg_expense_id" => 102, "c_name" => "วัสดุสำนักงาน",
    "f_reserve_budget" => 124232700.00, "f_plan_begin_remaining" => 18000000.00,
    "f_reserve_period_bkb" => 87310000.00, "f_period_transfer_remaining_bkb" => 2465240.00,
    "f_reserve_period_government" => 2230000.00, "f_period_transfer_remaining_government" => 823200.00
  ],
  [
    "bg_expense_id" => 103, "c_name" => "งานจ้างซ่อมบำรุง",
    "f_reserve_budget" => 86567700.00, "f_plan_begin_remaining" => 12500000.00,
    "f_reserve_period_bkb" => 21430600.00, "f_period_transfer_remaining_bkb" => 9700000.00,
    "f_reserve_period_government" => 2500000.00, "f_period_transfer_remaining_government" => 1560000.00
  ],
  [
    "bg_expense_id" => 104, "c_name" => "งานเช่าและบริการ",
    "f_reserve_budget" => 30000000.00, "f_plan_begin_remaining" => 14000000.00,
    "f_reserve_period_bkb" => 8000000.00,  "f_period_transfer_remaining_bkb" => 3200000.00,
    "f_reserve_period_government" => 12000000.00, "f_period_transfer_remaining_government" => 3500000.00
  ],
  [
    "bg_expense_id" => 105, "c_name" => "โครงการต่อเนื่อง",
    "f_reserve_budget" => 95000000.00, "f_plan_begin_remaining" => 52000000.00,
    "f_reserve_period_bkb" => 16000000.00, "f_period_transfer_remaining_bkb" => 4000000.00,
    "f_reserve_period_government" => 30000000.00, "f_period_transfer_remaining_government" => 8000000.00
  ],
];

echo json_encode(["data"=>$rows], JSON_UNESCAPED_UNICODE);
?>