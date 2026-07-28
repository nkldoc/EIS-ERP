<?php

$sessionPath = 'D:/EIS-ERP/storage/sessions';
$timeout = 7200; // 2 ชั่วโมง

if (!is_dir($sessionPath)) {
    mkdir($sessionPath, 0777, true);
}
$isHttps = !empty($_SERVER['HTTPS']) && strtolower($_SERVER['HTTPS']) !== 'off';
// ต้องตั้งค่าทั้งหมดก่อน session_start()
session_save_path($sessionPath);
session_name('NMU_SUPPLIES_SESSID');
ini_set('session.gc_maxlifetime', (string) $timeout);
ini_set('session.cookie_lifetime', (string) $timeout);

if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => $timeout,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}
// Enforce a two-hour idle timeout for authenticated sessions.
$now = time();
if (!empty($_SESSION['user_id']) && !empty($_SESSION['last_activity']) && ($now - (int) $_SESSION['last_activity']) > $timeout) {
    $_SESSION = array();
    session_regenerate_id(true);
} elseif (!empty($_SESSION['user_id'])) {
    $_SESSION['last_activity'] = $now;
}
// ต่ออายุ cookie ทุกครั้งที่มีการใช้งาน
if (!headers_sent() && session_status() === PHP_SESSION_ACTIVE) {
    setcookie(session_name(), session_id(), [
        'expires' => time() + $timeout,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
}

// สุ่มล้าง Session ที่หมดอายุ
if (rand(1, 50) === 1 && function_exists('session_gc')) {
    session_gc();
}

define("__VPRODUCT_", "eis-" . rand(0, 100000));
// บริษัท
define("COMPANY_NAME", ".:: NMU VPROCURE ::.");

//define("REDIRECT_SERVER", "https://eis.vajira.ac.th:443/procure");
//define("REDIRECT_SERVER", "https://uat-eis.vajira.ac.th/NMU_permission/login");
//define("REDIRECT_SERVER", "https://eis.vajira.ac.th:443/procure");
//define("REDIRECT_SERVER", "http://localhost:8080/procure/access/signin.php");
define("DB_SERVER", ".");
define("DB_NAME", "NMU_ERP");
define("STATUS_SERVER", "dev-eis");
define("DB_USER", "sa");
define("DB_PASS", "nklV1");
define("DB_CHARSET", "UTF-8");

/* * ******* DB other ********** */
define("DB_CENTER", "NMU_DATACENTER.dbo.");
define("DB_NMU_EIS", "NMU_EIS.dbo.");
define("DB_NMU", "NMU.dbo.");
define("DB_FM_NMU", "FM_NMU.dbo.");
define("DB_NMU_ERP", "NMU_ERP.dbo.");
/* * ************************** */
/* * ******** HOST other ********* */
// IIS commonly reports HTTPS as "on" (lowercase), and a reverse proxy may
// provide the original scheme through X-Forwarded-Proto.
$forwardedProto = strtolower(trim(explode(',', $_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '')[0]));
$requestIsHttps = (
        (!empty($_SERVER['HTTPS']) && strtolower((string) $_SERVER['HTTPS']) !== 'off') || $forwardedProto === 'https' || (int) ($_SERVER['SERVER_PORT'] ?? 0) === 443
);
define("OST_HOST", $requestIsHttps ? "https" : "http");
define("HTTPS_HOST_NAME", STATUS_SERVER . ".nmu.ac.th"); //uat-eis.vajira.ac.th
define("HTTP_HOST_NAME", "localhost"); // 192.168.201.10  nmu
//  --api
define("MAIN_HOST_NAME", OST_HOST == "https" ? HTTPS_HOST_NAME : HTTP_HOST_NAME);
define("MAIN_HOST_URL", OST_HOST . '://' . MAIN_HOST_NAME);

define("NMU_PERMISSION_HOST", MAIN_HOST_NAME . "/NMU_permission"); //URL ระบบ NMU_permission
define("NMU_EIS_HOST", MAIN_HOST_NAME . "/NMU_EIS"); //URL ระบบ NMU_EIS
define("NMU_HOST", MAIN_HOST_NAME . "/NMU"); //URL ระบบ NMU
define("FM_NMU_HOST", MAIN_HOST_NAME . "/FM-NMU"); //URL ระบบ FM-NMU
define("NMU_SUPPLIES_PORT", OST_HOST == "https" ? ":443" : ":8080");

define("YEARBG", (date('m') > 9) ? intVal(date('Y')) + 1 : date('m'));
define("MONDIGIT", (date('m') > 9) ? "0" + date('m') + 1 : date('m'));
define("NMU_APP_NAME", "supplies");

define("PATH_DOCUMENTS", "D:\\Documents\\Sys\\" . NMU_APP_NAME . "");
define("NMU_SUPPLIES_HOST", MAIN_HOST_NAME . NMU_SUPPLIES_PORT . "/" . NMU_APP_NAME); //URL ระบบ NMU_ERP
// HOST API
define("HTTPS_HOST_API", "dev-eis.nmu.ac.th"); //api-eis.vajira.ac.th
define("HTTP_HOST_APi", "localhost"); // 192.168.210.192  API
define("MAIN_HOST_API", OST_HOST == "https" ? HTTPS_HOST_API : HTTP_HOST_APi);
define("NMU_API_HOST", MAIN_HOST_API . "/api-nmu"); //URL ระบบ NMU_API
// สถานะการแสดงข้อมูลที่ต้องการ( i_delete )
define("DELETE_TRUE", 1); // ถูกลบระบบไม่สามารถมองเห็นแต่มีอยู่ในฐานข้อมูล
define("DELETE_FALSE", 2); // ใช้งานได้ตามปกติ
// สถานะการใช้งาน
define("STATUS_ENABLE", 1); // ใช้งาน
define("STATUS_DISABLE", 0); // ไม่ใช้งาน
define("LINE_NOTIF", MAIN_HOST_NAME . NMU_SUPPLIES_PORT . "/supplies/lib/lineNotif/send_line_dev.php"); //URL ระบบ NMU_API
define("IPAPIBG", OST_HOST . '://' . NMU_API_HOST); //สำหรับจอง
$arr_status = array(
    0 => "เลือกทั้งหมด",
    STATUS_ENABLE => "ใช้งาน",
    STATUS_DISABLE => "ไม่ใช้งาน"
);
$exploded_uri = explode('/', $_SERVER['REQUEST_URI']); //$exploded_uri == array('example.com','sub')
$domain_name = $exploded_uri[1]; //$domain_name = 'example.com'
define("DOMAIN", array("en" => $domain_name, "th" => "ซื้อ/จ้าง คณะแพทย์วชิระ")); // สาขา

define("ON_SERVER", false);

$requestHost = strtolower(preg_replace('/:\d+$/', '', (string) ($_SERVER['HTTP_HOST'] ?? '')));
$canonicalHost = strtolower(HTTPS_HOST_NAME);

if ($requestHost !== $canonicalHost) {
    $requestPath = (string) ($_SERVER['REQUEST_URI'] ?? '/' . $domain_name);
    header('Location: https://' . $canonicalHost . $requestPath, true, 302);
    exit;
}

//
define("STATUSONLINE", true); // open
define("NOSCRIPTJAVA", "/mcot/app/DisabledJavaScript.html");
#TODO
//error_reporting(E_ALL ^ E_NOTICE);
define("DONTPERMISSION", "You do not have permission to access");
//หรือเพิ่มในส่วนหัว ของ Code ปิดการโชว์ Error
//Login limit 3 time
//modeAccess
define("GETCLOSEMONTH", md5("get_close_month" . date('Y-m-d')));
define("F_UNDER_RATE", 1000);
define("SUPPLIES_ID", 38);
define("CUSTOMER_NAME_TH", "รายงานพัสดุ");
//define("IPBOOK", "192.168.201.192");
define("IPBOOK", "localhost");

$url = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "//{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}";

$escaped_url = htmlspecialchars($url, ENT_QUOTES, 'UTF-8');
$escaped_url_signin = htmlspecialchars((empty($_SERVER['HTTPS']) ? 'http' : 'https') . "//{$_SERVER['HTTP_HOST']}{$_SERVER['REQUEST_URI']}", ENT_QUOTES, 'UTF-8');
define("URL", $escaped_url);
define("URL_LOGIN", $escaped_url_signin);
define("I_SYS", 3);
if (isset($_SESSION["stop"]))
    die('<center style="margin-top:100px;"> คุณต้องหยูดทำการล็อกอินชั่วคราว หรือติดต่อ แอดมิน </center>');
//
// 1. กำหนด Key ลับของเรา (ห้ามให้คนอื่นรู้)
define('MY_SECRET_SALT', 'adminvprocure');
// 2. คำนวณหาค่า "จำนวนชั่วโมง" นับตั้งแต่ยุค Unix (Epoch)
// การหารด้วย 3600 คือการตัดเศษวินาทีและนาทีทิ้ง ให้เหลือหน่วยเป็นชั่วโมง
$current_hour_slot = floor(time() / 60);
// 3. นำชั่วโมง + Salt มา Hash เพื่อสร้างรหัส Static ของชั่วโมงนี้
$hourly_raw_string = MY_SECRET_SALT . $current_hour_slot;
$hourly_code = substr(hash('sha256', $hourly_raw_string), 0, 8); // ตัดมา 8 หลักเพื่อความสวยงาม
// 4. กำหนดเป็นค่าคงที่ (Define) เพื่อนำไปใช้งานทั่วทั้งโปรเจกต์
define('STATIC_HOURLY_TOKEN', $hourly_code);
// ทดสอบแสดงผล
//echo "รหัสประจำชั่วโมงนี้คือ: " . STATIC_HOURLY_TOKEN; exit();
