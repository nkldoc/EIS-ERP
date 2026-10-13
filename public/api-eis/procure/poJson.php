<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST,PUT");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require __DIR__.'/classes/Database.php';
require __DIR__.'/AuthMiddleware.php';
require __DIR__.'/classes/Log.php';

$allHeaders = getallheaders();
$db_connection = new Database();
$conn = $db_connection->dbConnection();
$auth = new Auth($conn, $allHeaders);
$method = $_SERVER['REQUEST_METHOD']; 
$json = file_get_contents("php://input");   
$data = json_decode($json, true);  

if ($auth->isValid()['success']===1 && $method==="POST"){ 
    if($data['datatype']=='periodBilling'){ //สร้างงวดพร้อมรับของในงวด
        echo $json;
        jsonLog($data); 
        //TODO สร้างงวดพร้อมรับของในงวด
        //...
        //... 
    } 
    
}else if($auth->isValid()['success']===1 && $method==="PUT"){ 
    if($data['datatype']=='closeContract'){ //ปิดสัญญาและคืนเงินงบประมาณ
        echo $json;
        jsonLog($data); 
        //TODO ปิดสัญญาและคืนเงินงบประมาณ
        //... 
    }
}else if($auth->isValid()['success']===0){ //login unsuccess
	echo json_encode($auth->isValid());
    jsonLog($auth->isValid());
}else{ 
    echo json_encode($auth->isValid());
    jsonLog($auth->isValid()); 
}