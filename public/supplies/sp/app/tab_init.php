<?php
/**
path : D:\Documents\Sys\supplies\2026\PR25680700005\json\tabjson1_PR25680700005_1.json
 */
include("../../conf/config.php");
header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('Asia/Bangkok');

/* ===== CONFIG (ให้ PATH_DOCUMENTS ชี้ไปยัง D:/Documents/Sys/supplies) ===== */
if (!defined('PATH_DOCUMENTS')) {
    // สำรองในกรณีไม่ได้ประกาศใน config.php
    define('PATH_DOCUMENTS', 'D:/Documents/Sys/supplies');
}
$BASE_DIR = PATH_DOCUMENTS;

/* ===== รับพารามิเตอร์ ===== */
$pr_code     = isset($_POST['pr_code']) ? trim($_POST['pr_code']) : '';
$tor_type_id = isset($_POST['tor_type_id']) ? trim($_POST['tor_type_id']) : '';

if ($pr_code === '' || $tor_type_id === '') {
    http_response_code(400);
    echo json_encode(['ok'=>false,'message'=>'Missing pr_code or tor_type_id'], JSON_UNESCAPED_UNICODE);
    exit;
}

/* ===== ช่วยคำนวณปีงบ (คืน 0/1) – ใช้เฉพาะกรณี “ไม่พบปีใน PR” ===== */
function fiscal_year_offset_for_current_month($ts = null){
    $ts = $ts ?? time();
    $m  = (int)date('n', $ts); // 1..12
    // ต.ค.–ธ.ค. = +1 ปีงบ (offset = 1) มิฉะนั้น 0
    return ($m >= 10) ? 1 : 0;
}

/* ===== หา AD_YEAR จาก PR =====
   - ถ้าพบปี พ.ศ. ในรหัส PR (เช่น PR2567...) ให้แปลงเป็น ค.ศ. ด้วย -543 เท่านั้น (ห้ามบวก offset)
   - ถ้าไม่พบรูปแบบปี → ใช้ปีปัจจุบัน + offset งบประมาณ */
$be = null;
if (preg_match('/^PR(\d{4})/i', $pr_code, $m)) {
    $be = intval($m[1]); // 2567 เป็นต้น
}
if ($be && $be >= 2400 && $be <= 2800) {
    $adYear = $be - 543; // 2567 -> 2024
} else {
    $adYear = (int)date('Y') + fiscal_year_offset_for_current_month();
}

/* ===== เตรียมโฟลเดอร์ปลายทาง ===== */
$targetDir = rtrim($BASE_DIR, "/\\") . DIRECTORY_SEPARATOR
           . $adYear . DIRECTORY_SEPARATOR
           . $pr_code . DIRECTORY_SEPARATOR . 'json';

if (!is_dir($targetDir)) {
    if (!@mkdir($targetDir, 0777, true)) {
        http_response_code(500);
        echo json_encode(['ok'=>false,'message'=>"Cannot create directory: $targetDir"], JSON_UNESCAPED_UNICODE);
        exit;
    }
}

/* ===== เตรียมชื่อไฟล์ ===== */
$tb1 = $targetDir . DIRECTORY_SEPARATOR . "tabjson1_{$pr_code}_{$tor_type_id}.json";
$tb2 = $targetDir . DIRECTORY_SEPARATOR . "tabjson2_{$pr_code}_{$tor_type_id}.json";
$tb3 = $targetDir . DIRECTORY_SEPARATOR . "tabjson3_{$pr_code}_{$tor_type_id}.json";

/* ===== Helpers ===== */
function is_file_empty_like($path) {
    if (!file_exists($path)) return true;
    if (filesize($path) === 0) return true;
    $buf = @file_get_contents($path);
    if ($buf === false) return true;
    return trim($buf) === '';
}
function write_text_atomic($path, $content) {
    $tmp = $path . '.tmp_' . uniqid('', true);
    if (@file_put_contents($tmp, $content) === false) return false;
    if (file_exists($path)) @unlink($path);
    return @rename($tmp, $path);
}

/**
 * โครง payload ตัวอย่าง (ใช้ชุดเดียวกันให้ทั้ง tabjson1/2/3)
 * หมายเหตุ: data เป็น "อาร์เรย์ชั้นเดียว" (ไม่ซ้อน children) เพื่อให้เข้ากับ flatten ฝั่ง ExtJS ได้ทันที
 * ถ้าต้องการ tree จริง ให้เติม children ในแต่ละรายการได้
 */
function build_tabjson_payload($pr_code, $tor_type_id) {
    $now  = date('c');
    $docs = [
        ["id"=>1,"title"=>"ขออนุมัติประกาศเผยแพร่แผนซื้อหรือจ้าง","page"=>1,"group"=>1,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>2,"title"=>"ประกาศเผยแพร่แผนซื้อหรือจ้าง","page"=>2,"group"=>1,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>3,"title"=>"เห็นชอบ แต่งตั้งคณะกรรมการจัดทำ (TOR)","page"=>3,"group"=>2,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>4,"title"=>"แต่งตั้งคณะกรรมการจัดทำ (TOR)","page"=>4,"group"=>2,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>5,"title"=>"รายงานผลการจัดทำ (TOR)","page"=>5,"group"=>3,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>6,"title"=>"รายงานขอซื้อ / รายงานขอจ้าง","page"=>6,"group"=>3,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>7,"title"=>"แต่งตั้งคณะกรรมการ (พิจารณาผล/ตรวจรับพัสดุ)","page"=>7,"group"=>3,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>8,"title"=>"- ร่าง - เอกสารประกวดราคา","page"=>8,"group"=>3,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>9,"title"=>"- ร่าง - ประกาศประกวดราคา","page"=>9,"group"=>3,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>10,"title"=>"รายงานผลการพิจารณาปรับปรุง - ร่าง-","page"=>10,"group"=>4,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>11,"title"=>"เอกสารประกวดราคา","page"=>11,"group"=>4,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>12,"title"=>"ประกาศประกวดราคา","page"=>12,"group"=>4,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>13,"title"=>"บริษัทที่ยื่นเสนอราคา","page"=>13,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>14,"title"=>"ใบเสนอราคา","page"=>14,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>15,"title"=>"เอกสารบริษัทส่วน 1","page"=>15,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>16,"title"=>"เอกสารบริษัทส่วน 2","page"=>16,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>17,"title"=>"ใบต่อรองราคา","page"=>17,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>18,"title"=>"รายงานผลการพิจารณา (คณะกรรมการ)","page"=>18,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>19,"title"=>"รายงานผลการพิจารณาและขออนุมัติ (คณบดี)","page"=>19,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>20,"title"=>"แต่งตั้งคณะกรรมการ (ตรวจรับพัสดุ)","page"=>20,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>21,"title"=>"ประกาศผู้ชนะการเสนอราคา","page"=>21,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>22,"title"=>"พวช. หนังสือขอให้ตรวจร่างสัญญา (ส่งนิติกร)","page"=>22,"group"=>6,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>23,"title"=>"สนธ. ฝ่ายนิติการ ตรวจร่างสัญญา (จากนิติกร)","page"=>23,"group"=>6,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>24,"title"=>"หนังสือแจ้งลงนามสัญญา (ส่งบริษัท)","page"=>24,"group"=>7,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>25,"title"=>"หนังสือหลักค้ำประกันสัญญา (จากบริษัท)","page"=>25,"group"=>8,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>26,"title"=>"ตรวจสอบ หลักค้ำประกันสัญญา (ส่งธนาคาร)","page"=>26,"group"=>8,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>27,"title"=>"ยืนยัน หลักค้ำประกันสัญญา (จากธนาคาร)","page"=>27,"group"=>8,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>28,"title"=>"หนังสือลงนามสัญญา (คณบดี)","page"=>28,"group"=>9,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>29,"title"=>"รายการใบสั่ง/งวด","page"=>29,"group"=>10,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
        ["id"=>30,"title"=>"รายการตรวจรับ","page"=>30,"group"=>11,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
    ];
    return [
        "count"=>count($docs),
        "data"=>[$docs], // NOTE: ฝั่ง Ext ของคุณรองรับโครงนี้อยู่แล้ว
        "meta"=>[
            "pr_code"=>$pr_code,
            "tor_type_id"=>(string)$tor_type_id,
            "created_at"=>$now,
            "update_at"=>$now,
            "version"=>1
        ]
    ];
}

/* ===== สร้าง/คงไว้ทั้ง 3 ไฟล์ ===== */
$meta = ['tbjson1'=>[],'tbjson2'=>[],'tbjson3'=>[]];

foreach ([1=>$tb1, 2=>$tb2, 3=>$tb3] as $tabNo => $path) {
    if (!file_exists($path) || is_file_empty_like($path)) {
        $payload = build_tabjson_payload($pr_code, $tor_type_id);
        $json    = json_encode($payload, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
        if (!write_text_atomic($path, $json)) {
            http_response_code(500);
            echo json_encode(['ok'=>false,'message'=>"Cannot write file: $path"], JSON_UNESCAPED_UNICODE);
            exit;
        }
        $meta["tbjson{$tabNo}"] = ['built_from_example'=>true];
    } else {
        $meta["tbjson{$tabNo}"] = ['kept_existing'=>true];
    }
}

/* ===== ตอบกลับ ===== */
echo json_encode([
    'ok'=>true,
    'message'=>'checked/created',
    'ad_year'=>$adYear,
    'dir'=>$targetDir,
    'files'=>[
        'tbjson1'=>['path'=>$tb1,'exists'=>true,'meta'=>$meta['tbjson1']],
        'tbjson2'=>['path'=>$tb2,'exists'=>true,'meta'=>$meta['tbjson2']],
        'tbjson3'=>['path'=>$tb3,'exists'=>true,'meta'=>$meta['tbjson3']],
    ]
], JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
