<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

require __DIR__.'/classes/Database.php';
require __DIR__.'/AuthMiddleware.php';

$allHeaders = getallheaders();
$db_connection = new Database();
$conn = $db_connection->dbConnection();
$auth = new Auth($conn, $allHeaders);
$method = $_SERVER['REQUEST_METHOD']; 
$json = file_get_contents("php://input");   
$data = json_decode($json, true);  

//echo json_encode($auth->isValid());


if ($method == 'POST' && $auth->isValid()['success'] === 1){
	//print_r($data);
	echo $json;
}else{
	echo json_encode($auth->isValid());
}
