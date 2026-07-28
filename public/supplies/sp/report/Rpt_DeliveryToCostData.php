<?php
//include("../api/List_RepStatisticDetail.php");
//include("../../lib/export/exportUtil.php");
 
// report.php
header('Content-Type: application/json; charset=utf-8');

// ตัวอย่างข้อมูล จำลองจาก Excel
$data = [
    [
        "unit" => "สำนักงานสภามหาวิทยาลัย",
        "budget65" => 200000,
        "budget66" => 100000,
        "budget67" => 100000,
        "budget68" => 100000,
        "po" => [0,0,0,0,0,0,110600,0,0,0,60000,0,0],
        "remain" => [0, -49000, 100000, 0],
        "sum" => 149400,
        "total" => 170600
    ],
    [
        "unit" => "สำนักงานอธิการบดี",
        "budget65" => 400000,
        "budget66" => 1200000,
        "budget67" => 640000,
        "budget68" => 640000,
        "po" => [0,0,0,0,0,96800,234700,0,0,0,262500,0,0],
        "remain" => [0,115400,100000,0],
        "sum" => 515400,
        "total" => 704600
    ]
];

echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

 