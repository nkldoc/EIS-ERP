<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$table = "dc_user";
$root = "data";
$data = array();
 
header('Content-Type: application/json; charset=utf-8');

// ====== CONFIG / INPUT ======
$sp_tor_id = isset($_GET['sp_tor_id']) ? intval($_GET['sp_tor_id']) : 3290;

// ถ้าเชื่อม DB จริง ก็ query เอาข้อมูลมาได้ เช่น
// $sql = "SELECT * FROM sp_signers WHERE sp_tor_id = $sp_tor_id";
// แล้ว fetch เป็น array แทนส่วน mock data ด้านล่าง

// ====== MOCK DATA (ตัวอย่างที่ให้มา) ======
$data = [
    "mode" => "add",
    "sp_sign_type_id" => 1,
    "document_id" => 1,
    "sp_tor_id" => $sp_tor_id,
    "page" => 1,
    "position_y" => 50,
    "c_approve" => "- เห็นชอบอนุมัติ ดำเนินการ",
    "record" => [
        [
            "id" => 1,
            "dc_user_id" => 60111,
            "c_postion" => "เจ้าหน้าที่",
            "full_name" => "(สุนิสา ศรีวลีรัตน์)",
            "action" => "คณะแพทยศาสตร์วชิรพยาบาล",
            "org_name" => "มหาวิทยาลัยนวมินทราธิราช",
            "sign_date" => "08-10-2568",
            "c_approved" => "- เห็นชอบอนุมัติ ดำเนินการ",
            "row" => 1,
            "col" => 2,
            "line" => 1,
            "dc_emp_id" => 20113,
            "page" => 1,
            "position_y" => 50,
            "position_name" => "เจ้าหน้าที่",
            "sp_tor_id" => $sp_tor_id
        ],
        [
            "id" => 2,
            "dc_user_id" => 60129,
            "c_postion" => "หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ",
            "full_name" => "(นิติ การสุวรรณ)",
            "action" => "คณะแพทยศาสตร์วชิรพยาบาล",
            "org_name" => "มหาวิทยาลัยนวมินทราธิราช",
            "sign_date" => "08-10-2568",
            "c_approved" => "- เห็นชอบอนุมัติ ดำเนินการ",
            "row" => 2,
            "col" => 2,
            "line" => 2,
            "dc_emp_id" => 20731,
            "page" => 1,
            "position_y" => 50,
            "position_name" => "หัวหน้าสายงานซื้อจ้าง ลงนามตรวจสอบ",
            "sp_tor_id" => $sp_tor_id
        ],
        [
            "id" => 3,
            "dc_user_id" => 56,
            "c_postion" => "หัวหน้าพัสดุ ลงนามตรวจสอบ",
            "full_name" => "(ศิรินา เมืองแสน)",
            "action" => "คณะแพทยศาสตร์วชิรพยาบาล",
            "org_name" => "มหาวิทยาลัยนวมินทราธิราช",
            "sign_date" => "08-10-2568",
            "c_approved" => "- เห็นชอบอนุมัติ ดำเนินการ",
            "row" => 3,
            "col" => 2,
            "line" => 3,
            "dc_emp_id" => 79,
            "page" => 1,
            "position_y" => 50,
            "position_name" => "หัวหน้าพัสดุ ลงนามตรวจสอบ",
            "sp_tor_id" => $sp_tor_id
        ],
        [
            "id" => 4,
            "dc_user_id" => 40,
            "c_postion" => "รองคณะบดี ลงนามตรวจสอบ",
            "full_name" => "(ผศ.นพ.อนุแสง จิตสมเกษม)",
            "action" => "คณะแพทยศาสตร์วชิรพยาบาล",
            "org_name" => "มหาวิทยาลัยนวมินทราธิราช",
            "sign_date" => "08-10-2568",
            "c_approved" => "- เห็นชอบอนุมัติ ดำเนินการ",
            "row" => 2,
            "col" => 1,
            "line" => 4,
            "dc_emp_id" => 65,
            "page" => 1,
            "position_y" => 50,
            "position_name" => "รองคณะบดี ลงนามตรวจสอบ",
            "sp_tor_id" => $sp_tor_id
        ],
        [
            "id" => 5,
            "dc_user_id" => 60520,
            "c_postion" => "คณะบดีลงนามอนุมัติเอกสาร",
            "full_name" => "(ผศ.จักราวุธ มณีฤทธิ์)",
            "action" => "ปฏิบัติการแทนอธิการบดี",
            "org_name" => "มหาวิทยาลัยนวมินทราธิราช",
            "sign_date" => "08-10-2568",
            "c_approved" => "- เห็นชอบอนุมัติ ดำเนินการ",
            "row" => 3,
            "col" => 1,
            "line" => 5,
            "dc_emp_id" => 20546,
            "page" => 1,
            "position_y" => 50,
            "position_name" => "คณะบดีลงนามอนุมัติเอกสาร",
            "sp_tor_id" => $sp_tor_id
        ]
    ]
];

// ====== ส่งออก JSON ======
echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
exit;
