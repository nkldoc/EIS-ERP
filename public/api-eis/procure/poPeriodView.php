<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST,PUT");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require __DIR__.'/classes/Database.php';
require __DIR__.'/AuthMiddleware.php';
require __DIR__.'/classes/Log.php';
require __DIR__.'/src/api.php';

$allHeaders = getallheaders();
$db_connection = new Database();
$conn = $db_connection->dbConnection();
$auth = new Auth($conn, $allHeaders);
$method = $_SERVER['REQUEST_METHOD']; 
$json = file_get_contents("php://input");   
$data = json_decode($json, true);  

/**** */  
$api = new api();
 
// echo json_encode($api->getFiledperiod());
echo json_encode($api->getFiledperiodPicup());
 


exit(); 


