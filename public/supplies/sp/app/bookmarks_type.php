<?php

header('Content-Type: application/json; charset=utf-8');
date_default_timezone_set('Asia/Bangkok');

/**
 * Endpoint:
 *   - read / readPath:
 *       ?action=readPath&path=<ABS_PATH>
 *       หรือ
 *       ?action=readPath&pr_code=PR25670900004&tor_type_id=22&tab=1
 *
 *   - save:
 *       ?action=save&file=<ABS_PATH>
 *       หรือ
 *       ?action=save&pr_code=PR25670900004&tor_type_id=22&tab=1
 *     (POST body: {"data":[ ...nodes... ]})
 */

$action      = $_GET['action'] ?? '';
$pathParam   = $_GET['file'] ?? ($_GET['path'] ?? ''); // เดิมรองรับ path ตรง
$pathParam   = str_replace('\\', '/', $pathParam);     // normalize

// โหมดใหม่: รับ pr_code / tor_type_id / tab แล้วประกอบพาธให้เอง
$pr_code     = isset($_GET['pr_code']) ? trim($_GET['pr_code']) : '';
$tor_type_id = isset($_GET['tor_type_id']) ? trim($_GET['tor_type_id']) : '';
$tab         = isset($_GET['tab']) ? (int)$_GET['tab'] : 1;
if ($tab < 1) $tab = 1;

$ALLOWED_ROOT = 'D:/Documents/Sys/supplies';

/* ---------------------- default data ---------------------- */
/** วาง default nodes ตามที่ผู้ใช้ให้มา (แปลงเป็น PHP array) */
$DEFAULT_NODES = [
  [
    "id"=>1,
    "title"=>"ขออนุมัติประกาศเผยแพร่แผนซื้อหรือจ้าง",
    "page"=>1,
    "group"=>1,
    "status"=>1,
    "sigLayout"=>1,
    "receivedDate"=>null,
    "signedDate"=>null,
    "children"=>[
      [
        "id"=>2,
        "title"=>"ประกาศเผยแพร่แผนซื้อหรือจ้าง",
        "page"=>2,
        "group"=>1,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ]
    ]
  ],
  [
    "id"=>3,
    "title"=>"เห็นชอบ แต่งตั้งคณะกรรมการจัดทำ (TOR)",
    "page"=>1,
    "group"=>2,
    "status"=>1,
    "sigLayout"=>1,
    "receivedDate"=>null,
    "signedDate"=>null,
    "children"=>[
      [
        "id"=>"ext-record-29",
        "title"=>"แต่งตั้งคณะกรรมการจัดทำ (TOR)",
        "page"=>2,
        "group"=>2,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ]
    ]
  ],
  [
    "id"=>5,
    "title"=>"รายงานผลการจัดทำ (TOR)",
    "page"=>1,
    "group"=>3,
    "status"=>1,
    "sigLayout"=>1,
    "receivedDate"=>null,
    "signedDate"=>null,
    "children"=>[
      [
        "id"=>6,
        "title"=>"รายงานขอซื้อ / รายงานขอจ้าง",
        "page"=>2,
        "group"=>3,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ],
      [
        "id"=>7,
        "title"=>"แต่งตั้งคณะกรรมการ (พิจารณาผล/ตรวจรับพัสดุ)",
        "page"=>3,
        "group"=>3,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ],
      [
        "id"=>8,
        "title"=>"- ร่าง - เอกสารประกวดราคา",
        "page"=>4,
        "group"=>3,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ],
      [
        "id"=>9,
        "title"=>"- ร่าง - ประกาศประกวดราคา",
        "page"=>5,
        "group"=>3,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ]
    ]
  ],
  [
    "id"=>10,
    "title"=>"รายงานผลการพิจารณาปรับปรุง - ร่าง-",
    "page"=>1,
    "group"=>4,
    "status"=>1,
    "sigLayout"=>1,
    "receivedDate"=>null,
    "signedDate"=>null,
    "children"=>[
      [
        "id"=>11,
        "title"=>"เอกสารประกวดราคา",
        "page"=>2,
        "group"=>4,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ],
      [
        "id"=>12,
        "title"=>"ประกาศประกวดราคา",
        "page"=>3,
        "group"=>4,
        "status"=>1,
        "sigLayout"=>1,
        "receivedDate"=>null,
        "signedDate"=>null
      ]
    ]
  ],
  [
    "id"=>13,
    "title"=>"บริษัทที่ยื่นเสนอราคา",
    "page"=>1,
    "group"=>5,
    "status"=>1,
    "sigLayout"=>1,
    "receivedDate"=>null,
    "signedDate"=>null,
    "children"=>[
      ["id"=>14,"title"=>"ใบเสนอราคา","page"=>2,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>15,"title"=>"เอกสารบริษัทส่วน 1","page"=>3,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>16,"title"=>"เอกสารบริษัทส่วน 2","page"=>4,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>17,"title"=>"ใบต่อรองราคา","page"=>5,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>18,"title"=>"รายงานผลการพิจารณา (คณะกรรมการ)","page"=>6,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>19,"title"=>"รายงานผลการพิจารณาและขออนุมัติ (คณบดี)","page"=>7,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>20,"title"=>"แต่งตั้งคณะกรรมการ (ตรวจรับพัสดุ)","page"=>8,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>21,"title"=>"ประกาศผู้ชนะการเสนอราคา","page"=>9,"group"=>5,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null]
    ]
  ],
  [
    "id"=>22,
    "title"=>"พวช. หนังสือขอให้ตรวจร่างสัญญา (ส่งนิติกร)",
    "page"=>1,
    "group"=>6,
    "status"=>1,
    "sigLayout"=>1,
    "receivedDate"=>null,
    "signedDate"=>null,
    "children"=>[
      ["id"=>23,"title"=>"สนธ. ฝ่ายนิติการ ตรวจร่างสัญญา (จากนิติกร)","page"=>2,"group"=>6,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null]
    ]
  ],
  ["id"=>24,"title"=>"หนังสือแจ้งลงนามสัญญา (ส่งบริษัท)","page"=>1,"group"=>7,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
  [
    "id"=>25,
    "title"=>"หนังสือหลักค้ำประกันสัญญา (จากบริษัท)",
    "page"=>1,
    "group"=>8,
    "status"=>1,
    "sigLayout"=>1,
    "receivedDate"=>null,
    "signedDate"=>null,
    "children"=>[
      ["id"=>26,"title"=>"ตรวจสอบ หลักค้ำประกันสัญญา (ส่งธนาคาร)","page"=>2,"group"=>8,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
      ["id"=>27,"title"=>"ยืนยัน หลักค้ำประกันสัญญา (จากธนาคาร)","page"=>3,"group"=>8,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null]
    ]
  ],
  ["id"=>28,"title"=>"หนังสือลงนามสัญญา (คณบดี)","page"=>1,"group"=>9,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
  ["id"=>"ext-record-30","title"=>"ใบสั่งซื้อ/จ้าง","page"=>1,"group"=>10,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null],
  ["id"=>"ext-record-31","title"=>"ใบตรวจรับ","page"=>1,"group"=>11,"status"=>1,"sigLayout"=>1,"receivedDate"=>null,"signedDate"=>null]
];

/* ---------------------- utils ---------------------- */
function norm($p){ return rtrim(str_replace('\\','/',trim($p)),'/'); }
function within_root($path,$root){ $n=norm($path); $r=norm($root); return strncasecmp($n,$r,strlen($r))===0; }
function now_iso(){ return date('c'); }

function fiscal_year_offset_for_current_month($ts=null){
  $ts=$ts??time(); $m=(int)date('n',$ts); return ($m>=10)?1:0; // ต.ค.–ธ.ค. => +1 (ใช้เฉพาะ fallback)
}

/** แปลงปี พ.ศ. ในรหัส PR เป็นปี ค.ศ. อย่างตรงไปตรงมา (ห้าม +offset) */
function ad_year_from_pr($pr_code){
  if (preg_match('/^PR(\d{4})/i',$pr_code,$m)) {
    $be=(int)$m[1];
    if ($be>=2400 && $be<=2800) return $be-543;  // 2567 -> 2024
  }
  // ไม่เจอปีใน PR → fallback: ปีปัจจุบัน + offset งบประมาณ
  return (int)date('Y') + fiscal_year_offset_for_current_month();
}

/** ประกอบไฟล์เต็มจาก pr_code / tor_type_id / tab */
function build_abs_file_from_keys($root,$pr_code,$tor_type_id,$tab){
  $adYear = ad_year_from_pr($pr_code);
  $root   = rtrim($root,"/\\");

  $fname  = "tabjson{$tab}_{$pr_code}_{$tor_type_id}.json";
  // D:/Documents/Sys/supplies/{AD}/{PR}/json/tabjson{tab}_{PR}_{tor_type_id}.json
  return $root . DIRECTORY_SEPARATOR . $adYear . DIRECTORY_SEPARATOR . $pr_code
       . DIRECTORY_SEPARATOR . 'json' . DIRECTORY_SEPARATOR . $fname;
}

function ensure_dir($file){
  $dir=dirname($file);
  return is_dir($dir) ?: @mkdir($dir,0777,true);
}

function parse_meta_from_filename($file){
  $meta=['pr_code'=>'','tor_type_id'=>'','created_at'=>now_iso(),'update_at'=>now_iso(),'version'=>1];
  $base=basename($file);
  if (preg_match('/^tabjson(\d+)_([A-Z0-9]+)_(\d+)\.json$/i',$base,$m)) {
    $meta['tab']        = $m[1];
    $meta['pr_code']    = $m[2];
    $meta['tor_type_id']= $m[3];
  }
  return $meta;
}

/** แกะซอง data → คืนเป็น array ของโหนดเสมอ */
function unwrap_data($doc){
  if (isset($doc['data']) && is_array($doc['data']) && isset($doc['data']['children']) && is_array($doc['data']['children'])) {
    return $doc['data']['children'];
  }
  if (isset($doc['data']) && is_array($doc['data']) && count($doc['data'])===1 && is_array($doc['data'][0])) {
    return $doc['data'][0];
  }
  if (isset($doc['data']) && is_array($doc['data'])) {
    return $doc['data'];
  }
  return [];
}

function normalize_out($data,$meta){
  $count=is_array($data)?count($data):0;
  return ['data'=>$data,'count'=>$count,'total'=>$count,'meta'=>$meta];
}

/* ------------------ resolve absolute path ------------------ */
$abs = '';
if ($pathParam!=='') {
  $abs = $pathParam; // โหมดเดิม: รับ path ตรง
} elseif ($pr_code!=='' && $tor_type_id!=='') {
  $abs = build_abs_file_from_keys($ALLOWED_ROOT,$pr_code,$tor_type_id,$tab);
} else {
  echo json_encode(['success'=>false,'message'=>'No file/path specified (or pr_code/tor_type_id missing)']);
  exit;
}

// normalize slash ให้ชัดเจน
$abs = str_replace('\\','/',$abs);

// ป้องกันนอก root
if (!within_root($abs,$ALLOWED_ROOT)) {
  echo json_encode(['success'=>false,'message'=>'Path outside allowed root','file'=>$abs,'root'=>$ALLOWED_ROOT]);
  exit;
}

/* ---------------------- actions ---------------------- */
if ($action==='read' || $action==='readPath') {
  if (!file_exists($abs)) {
    if (!ensure_dir($abs)) { echo json_encode(['success'=>false,'message'=>'Cannot create directory','file'=>$abs]); exit; }
    $meta = parse_meta_from_filename($abs);

    // ถ้าไฟล์ยังไม่มี ให้สร้างด้วย default nodes (ถ้ามี)
    $doc  = normalize_out($DEFAULT_NODES, $meta);
    @file_put_contents($abs, json_encode($doc, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT));
    echo json_encode($doc, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
    exit;
  }

  $raw = @file_get_contents($abs);
  if ($raw===false) { echo json_encode(['success'=>false,'message'=>'Cannot read file','file'=>$abs]); exit; }

  $doc  = json_decode($raw,true);
  if (!is_array($doc)) { $doc=['data'=>[],'meta'=>parse_meta_from_filename($abs)]; }

  $data = unwrap_data($doc);
  $meta = isset($doc['meta']) && is_array($doc['meta']) ? $doc['meta'] : parse_meta_from_filename($abs);

  // ถ้าพบว่าไฟล์มีโครงสร้างแต่ data ว่าง ให้เติม default data ลงไป (และบันทึกคืนไฟล์)
  if (!is_array($data) || count($data) === 0) {
    $data = $DEFAULT_NODES;
    $meta['update_at'] = now_iso();
    if (!isset($meta['created_at'])) $meta['created_at'] = now_iso();
    $out = normalize_out($data,$meta);
    if (@file_put_contents($abs, json_encode($out, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT)) === false) {
      // ถ้าเขียนคืนไฟล์ไม่สำเร็จ ก็ยังส่ง default ให้ client ดู
      echo json_encode(normalize_out($data,$meta), JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
      exit;
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
    exit;
  }

  echo json_encode(normalize_out($data,$meta), JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT);
  exit;
}

if ($action==='save') {
  $input = file_get_contents('php://input');
  $body  = json_decode($input,true) ?: [];
  $data  = isset($body['data']) && is_array($body['data']) ? $body['data'] : [];

  // ถ้า client ส่งมาเป็นว่าง และต้องการ fallback เป็น default ก็สามารถ uncomment บรรทัดนี้ได้
  // if (count($data)===0) $data = $DEFAULT_NODES;

  $meta = parse_meta_from_filename($abs);
  if (file_exists($abs)) {
    $old = json_decode(@file_get_contents($abs),true);
    if (is_array($old) && isset($old['meta']) && is_array($old['meta'])) $meta = array_merge($meta,$old['meta']);
  }
  $meta['update_at'] = now_iso();
  $meta['version']   = isset($meta['version']) ? (intval($meta['version'])+1) : 1;
  if (!isset($meta['created_at'])) $meta['created_at']=now_iso();

  if (!ensure_dir($abs)) { echo json_encode(['success'=>false,'message'=>'Cannot create directory','file'=>$abs]); exit; }

  $out = normalize_out($data,$meta);
  if (@file_put_contents($abs, json_encode($out, JSON_UNESCAPED_UNICODE|JSON_PRETTY_PRINT))===false) {
    echo json_encode(['success'=>false,'message'=>'Cannot write file','file'=>$abs]); exit;
  }
  echo json_encode(['success'=>true,'message'=>'Saved','file'=>$abs,'count'=>$out['count']]); exit;
}

echo json_encode(['success'=>false,'message'=>'Unknown action','file'=>$abs]);
