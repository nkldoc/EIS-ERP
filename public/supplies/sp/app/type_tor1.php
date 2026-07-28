<?php
// type_tor1.php — API เก็บโครงสร้าง bookmarks (children-based)

header('Content-Type: application/json; charset=utf-8');

$DATA_FILE = 'D:\Documents' . DIRECTORY_SEPARATOR . 'type_tor1.json';

function ok($data){ echo json_encode(['success'=>true,'data'=>$data], JSON_UNESCAPED_UNICODE); exit; }
function okBool(){ echo json_encode(['success'=>true], JSON_UNESCAPED_UNICODE); exit; }
function err($m,$c=400){ http_response_code($c); echo json_encode(['success'=>false,'message'=>$m], JSON_UNESCAPED_UNICODE); exit; }

function load_array($file){
    if (!file_exists($file)) return [];
    $raw = file_get_contents($file);
    if ($raw === false || $raw === '') return [];
    $arr = json_decode($raw, true);
    return is_array($arr) ? $arr : [];
}
function save_array($file, $arr){
    $dir = dirname($file);
    if (!is_dir($dir)) @mkdir($dir, 0777, true);
    $fp = fopen($file, 'c+'); if (!$fp) return false;
    if (!flock($fp, LOCK_EX)) { fclose($fp); return false; }
    ftruncate($fp, 0); rewind($fp);
    $ok = fwrite($fp, json_encode($arr, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
    fflush($fp); flock($fp, LOCK_UN); fclose($fp);
    return $ok !== false;
}

// ค่าเริ่มต้น (ถ้าไฟล์ยังไม่มี/ว่าง)
function default_bookmarks(){
    return [
        [ 'page'=>1, 'title'=>'เอกสารต้นเรื่อง' ],
        [ 'page'=>2, 'title'=>'คำสั่งแต่งตั้งผู้จัดทำ TOR',
          'children'=>[ [ 'page'=>3, 'title'=>'ท่านคณบดีลงนาม' ] ]
        ],
        [ 'page'=>4, 'title'=>'สำเนา คำสั่งแต่งตั้งผู้จัดทำ TOR',
          'children'=>[ [ 'page'=>5, 'title'=>'หัวหน้าเจ้าหน้าที่/หัวหน้างาน/เจ้าหน้าที่ ลงนาม' ] ]
        ],
        [ 'page'=>6, 'title'=>'รายงานผลการจัดทำ TOR',
          'children'=>[ [ 'page'=>7, 'title'=>'ท่านคณบดีลงนาม' ] ]
        ],
        [ 'page'=>8, 'title'=>'รายละเอียดขอบเขตทั้งโครงการ 10 ข้อ' ],
        [ 'page'=>9, 'title'=>'บก.06 ราคากลาง' ],
        [ 'page'=>10, 'title'=>'รายงานขอซื้อ/ขอจ้าง',
          'children'=>[ [ 'page'=>11, 'title'=>'เจ้าหน้าที่/หัวหน้าเจ้าหน้าที่/รองคณบดี/คณบดี' ] ]
        ],
        [ 'page'=>12, 'title'=>'ใบเสนอราคา' ],
        [ 'page'=>13, 'title'=>'เอกสารบริษัท' ],
        [ 'page'=>14, 'title'=>'รายงานผลพิจารณาและอนุมัติสั่งซื้อ/สั่งจ้าง',
          'children'=>[ [ 'page'=>15, 'title'=>'เจ้าหน้าที่/หัวหน้าเจ้าหน้าที่/รองคณบดี/คณบดี' ] ]
        ],
        [ 'page'=>16, 'title'=>'คำสั่งแต่งตั้งผู้ตรวจรับพัสดุ',
          'children'=>[ [ 'page'=>17, 'title'=>'คณบดีลงนาม' ] ]
        ],
        [ 'page'=>18, 'title'=>'สำเนา คำสั่งแต่งตั้งผู้ตรวจรับพัสดุ',
          'children'=>[ [ 'page'=>19, 'title'=>'หัวหน้าเจ้าหน้าที่/หัวหน้างาน/เจ้าหน้าที่ลงนาม' ] ]
        ],
        [ 'page'=>20, 'title'=>'ประกาศผู้ชนะ',
          'children'=>[ [ 'page'=>21, 'title'=>'คณบดีลงนาม' ] ]
        ],
        [ 'page'=>22, 'title'=>'สำเนา ประกาศผู้ชนะ',
          'children'=>[ [ 'page'=>23, 'title'=>'หัวหน้าเจ้าหน้าที่/หัวหน้างาน/เจ้าหน้าที่ลงนาม' ] ]
        ],
        [ 'page'=>24, 'title'=>'ใบสั่ง' ]
    ];
}

$action = $_GET['action'] ?? '';

if ($action === 'readBookmarks') {
    $arr = load_array($DATA_FILE);
    if (empty($arr)) {
        $arr = default_bookmarks();
        save_array($DATA_FILE, $arr); // เขียน default ครั้งแรก
    }
    ok($arr); // children-based array
}

if ($action === 'saveBookmarks') {
    $payload = json_decode(file_get_contents('php://input'), true);
    if (!$payload || !isset($payload['data']) || !is_array($payload['data'])) {
        err('payload ไม่ถูกต้อง');
    }
    $data = $payload['data']; // children-based array
    if (!save_array($DATA_FILE, $data)) err('บันทึกไฟล์ไม่สำเร็จ', 500);
    okBool();
}

err('Invalid action', 404);
