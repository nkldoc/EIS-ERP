<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: access");
header("Access-Control-Allow-Methods: POST,PUT");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");


$method = $_SERVER['REQUEST_METHOD']; 
$json = file_get_contents("php://input");   
$data = json_decode($json, true);  

print_r($_REQUEST);
exit();

if ($method==="POST"){ 
//        $today = date('Y-m-d');
//        $times = date('H:i:s');
//        $file = 'text-file-' . $today . '.txt';
//        $current = @file_get_contents($file);
//        $current .= " $times John Smith \n";
//        file_put_contents($file, $current);   
        $result = true;
         
}

if ($result) {
    //echo $result;
    echo json_encode(array("retval" => "success", "authen" => true, "datas" => $data, "results" => $result));
} else {
    echo json_encode(array("retval" => "unsuccess", "retid" => null, "authen" => false));
}