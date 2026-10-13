<?php
// bookmarks.php — proxy ไปยัง type_tor{N}.php (read/save bookmarks)
header('Content-Type: application/json; charset=utf-8');

// สร้าง BASE URL ไปยังสคริปต์ในโฟลเดอร์เดียวกัน
$BASE = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' ? 'https://' : 'http://')
      . $_SERVER['HTTP_HOST']
      . rtrim(dirname($_SERVER['SCRIPT_NAME']), '/\\');

function out($arr){ echo json_encode($arr, JSON_UNESCAPED_UNICODE); exit; }

function api_get($url){
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 20,
    ]);
    $res  = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($res === false || $code >= 400) {
        out(['success'=>false, 'message'=>'API GET error: '.$err.' (HTTP '.$code.')']);
    }
    return $res;
}

function api_post_json($url, $data){
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json; charset=utf-8'],
        CURLOPT_POSTFIELDS => json_encode($data, JSON_UNESCAPED_UNICODE)
    ]);
    $res  = curl_exec($ch);
    $err  = curl_error($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($res === false || $code >= 400) {
        out(['success'=>false, 'message'=>'API POST error: '.$err.' (HTTP '.$code.')']);
    }
    return $res;
}

$action = $_GET['action'] ?? 'read';

// เลือกไฟล์/เอ็นด์พอยท์จากพารามิเตอร์ ?file=type_tor{1..5}.json
$file = $_GET['file'] ?? 'type_tor1.json';
if (preg_match('~^type_tor([1-4])\.json$~i', $file, $m)) {
    $API = $BASE . '/type_tor' . $m[1] . '.php';
} else {
    // fallback ป้องกัน input แปลก ๆ
    $API = $BASE . '/type_tor1.php';
}

switch ($action) {
    case 'read': {
        // ดึงโครงสร้าง (children-based) จาก type_tor{N}.php
        $raw  = api_get($API . '?action=readBookmarks');
        $json = json_decode($raw, true);
        if (!is_array($json)) out(['success'=>false, 'message'=>'Bad response']);
        out($json);
    }

    case 'save': {
        // รับ payload แล้วส่งต่อไป type_tor{N}.php
        $payload = json_decode(file_get_contents('php://input'), true);
        if (!$payload || !isset($payload['data']) || !is_array($payload['data'])) {
            out(['success'=>false, 'message'=>'payload ไม่ถูกต้อง']);
        }
        $raw  = api_post_json($API . '?action=saveBookmarks', ['data' => $payload['data']]);
        $json = json_decode($raw, true);
        if (!is_array($json)) out(['success'=>false, 'message'=>'Bad response']);
        out($json);
    }

    case 'readPath': { // ใช้กับปุ่ม "โหลด Json To Grid"
        $path = $_GET['path'] ?? '';
        if ($path === '') out(['success'=>false, 'message'=>'path ว่าง']);

        if (preg_match('~^https?://~i', $path)) {
            // อ่านจาก URL ภายนอก
            $raw = api_get($path);
        } else {
            // อ่านไฟล์ภายในเครื่องอย่างปลอดภัย
            $real    = realpath($path);
            $docroot = realpath(__DIR__);
            if ($real === false || strpos($real, $docroot) !== 0 || !is_file($real)) {
                out(['success'=>false, 'message'=>'path ไม่อนุญาตหรือไม่พบไฟล์']);
            }
            $raw = @file_get_contents($real);
            if ($raw === false) out(['success'=>false, 'message'=>'อ่านไฟล์ไม่สำเร็จ']);
        }

        $json = json_decode($raw, true);
        if (!is_array($json)) out(['success'=>false, 'message'=>'JSON ไม่ถูกต้อง']);
        out($json);
    }
}

out(['success'=>false, 'message'=>'Invalid action']);
