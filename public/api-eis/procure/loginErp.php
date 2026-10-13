<?php
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");  
require __DIR__.'/conf/config.php'; 
include("lib/database/DatabaseServer.php");
include("lib/database/apiUtil.php");
include("lib/date/i_date.class.php");
include("lib/log_access.php");
require __DIR__ . '/classes/Log.php';
 
function loginGetHeader()
{
    $url = 'https://erpdev.vajira.ac.th/web/session/authenticate'; 
    // Payload ที่จะส่งไปใน POST request
    $payload = [
        "jsonrpc" => "2.0",
        "params" => [
            "db" => "ERPDB1_230323",
            "login" => "chulaAPI",
            "password" => "chula@erp1234"
        ]
    ]; 
    // แปลง payload เป็น JSON
    $jsonPayload = json_encode($payload); 
    // ตั้งค่า cURL
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonPayload);
    curl_setopt($ch, CURLOPT_HEADER, true); // เปิดการรับ response headers 
    // ส่ง request และรับ response
    $response = curl_exec($ch); 
    // ตรวจสอบ error
    if (curl_errno($ch)) {
        echo 'cURL Error: ' . curl_error($ch);
    } else {
        // แยก response headers และ body
        $headerSize = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $headers = substr($response, 0, $headerSize);
        $body = substr($response, $headerSize); 
        // แปลง response body จาก JSON เป็น array
        $responseData = json_decode($body, true); 
        // ค้นหา session_id ใน headers
        $sessionId = null;
        foreach (explode("\r\n", $headers) as $header) {
            if (stripos($header, 'set-cookie') !== false && stripos($header, 'session_id') !== false) {
                preg_match('/session_id=([^;]+)/', $header, $matches);
                if (isset($matches[1])) {
                    $sessionId = $matches[1];
                    break;
                }
            }
        } 
        // แสดงผล
        if ($sessionId) {
            $log = "Login successful! Session ID: $sessionId\n";
        } else {
            $log = "Login failed or session_id not found.\n";
        }
        return array($sessionId,$log,$responseData);
//        echo "Response Body: ";
//        print_r($responseData);
    } 
    // ปิด cURL
    curl_close($ch);
}

// เรียกใช้ฟังก์ชัน login
$login = loginGetHeader(); 

if($login[0]){
    //action 
//    echo "welcom ERP ".$login[1];
    //@TODO sen contract
    $json_decode = array("success" => "Success","session_id"=>$login[0]);
    echo json_encode($json_decode);
}else{ 
    //error
//    echo $login[1]."\n error : ".$login[2]; 
    $json_decode = array("success"=>"false","logs"=>$login[2]);
    echo json_encode($json_decode);
    
}

