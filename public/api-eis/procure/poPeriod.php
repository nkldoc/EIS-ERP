<?php 
header("Access-Control-Allow-Origin: *"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Methods: Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Content-Type: application/json; charset=UTF-8");  
require __DIR__.'/conf/config.php'; 
require __DIR__.'/classes/Database.php';
require __DIR__.'/AuthMiddleware.php';
require __DIR__.'/classes/Log.php';
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

/**** 
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
 */ 

/*
    try {
        //check avarribel
        if ($auth->isValid()['success']===1 && $method==="POST"){ 
             throw new Exception("POST..........."); 
        }else if($auth->isValid()['success']===1 && $method==="PUT"){
             throw new Exception("PUT..........."); 
        }else if($auth->isValid()['success']!==1){
             throw new Exception("Login false....."); 
        }else{
            throw new Exception("Else............."); 
        }
 
        
    } catch (Exception $e) { 
        //Rollback
        echo " Error : ".$e->getMessage();
    }
 exit();*/
 
if ($auth->isValid()['success']===1 && $method==="POST"){ 
    
    if($data['datatype']=='periodBilling'){ //สร้างงวดพร้อมรับของในงวด
        echo $json;
        jsonLog($data);
        //TODO สร้างงวดพร้อมรับของในงวด
        //...
        
        //...
    }else if($data['datatype']=='periodPickup'){ //สร้างงวดพร้อม
        $db = new DatabaseServer();
        $date = new i_date(); 
        echo $json;
        jsonLog($data);
        postToSuppliesApi($db, $date, $data,URL_SERVER_API.'/mnTorController');
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


