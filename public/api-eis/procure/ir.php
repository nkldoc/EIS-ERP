<?php 
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");  

require __DIR__.'/conf/config.php'; 
require __DIR__.'/classes/Database.php';
require __DIR__.'/AuthMiddleware.php';
require __DIR__.'/classes/JsonLogger.php';
require __DIR__.'/src/api.php'; 
require __DIR__.'/lib/database/DatabaseServer.php';
require __DIR__.'/lib/database/apiUtil.php';
require __DIR__.'/lib/date/i_date.class.php';

$allHeaders = getallheaders();
$db_connection = new Database();
$conn = $db_connection->dbConnection();
$auth = new Auth($conn, $allHeaders);

$method = $_SERVER['REQUEST_METHOD']; 
$json = file_get_contents("php://input");   
$data = json_decode($json, true);  
$logger = new JsonLogger();

// 1. Log ทุก Request ที่เข้ามาเพื่อเก็บหลักฐาน (Global Request Log)
$logger->log([
    'headers' => $allHeaders,
    'body'    => $data
], 'INCOMING_REQUEST');

$authResult = $auth->isValid(); // เก็บผลลัพธ์ไว้ใช้ซ้ำ

if ($authResult['success'] === 1) {
    
    if ($method === "POST") {
        if ($data['datatype'] == 'periodBilling') {
            // TODO: Logic สำหรับสร้างงวดพร้อมรับของ
            $logger->log($data, 'PERIOD_BILLING');
        } else if ($data['datatype'] == 'periodPickup') {
            // TODO: Logic สำหรับ periodPickup
            $logger->log($data, 'PERIOD_PICKUP');
        } else {
            $response = ['msg' => 'Invalid datatype', 'success' => false];
            echo json_encode($response);
            $logger->log($response, 'ERROR_DATATYPE');
        }
    } 
    else if ($method === "PUT") {
        if ($data['datatype'] == 'closeContract') {
            // TODO: Logic ปิดสัญญา
            $logger->log($data, 'CONTRACT_CLOSE');
            echo json_encode(['success' => true, 'msg' => 'Contract closed']);
        }
    } 
    else {
        // Method อื่นๆ ที่ไม่รองรับ
        http_response_code(405);
        echo json_encode(['success' => false, 'msg' => 'Method Not Allowed']);
    }

} else {
    // 2. กรณี Auth ไม่ผ่าน (Login failed หรือ Token Expired)
    http_response_code(401); // Unauthorized
    echo json_encode($authResult);
    $logger->log($authResult, 'AUTH_FAILED');
}