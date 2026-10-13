<?php
include("../conf/config.php");

 
 $user_id = $_REQUEST["user_id"]??null;
 $mode = $_REQUEST["mode"]??null;
 
if (isset($_REQUEST["user_id"]) && $_REQUEST["user_id"]!=0) {
        
        include("connect.php");
        $method = $_SERVER['REQUEST_METHOD']; 
        $json = file_get_contents("php://input");   
        $data = json_decode($json, true); 
        
        
        
        $i_type = mysqli_real_escape_string($con, $data['color']=="#C1C1C1"?1:2);
        $c_name = mysqli_real_escape_string($con, $data['message']);
        $client_datetime = mysqli_real_escape_string($con, $data['client_datetime']);
        $user_id = mysqli_real_escape_string($con, $data["user_id"]);

  
        $sql = "INSERT INTO `lognotif` (`id`, `i_type`,`c_name`, `user_id`, `client_datetime`) VALUES (NULL, '{$i_type}', '{$c_name}', {$user_id}, '{$client_datetime}');";

        if (mysqli_query($con, $sql)) {
            echo "บันทึก Logger";
//            lineNotif($_POST["subject"] . ' ' . $_POST["comment"]); //แจ้งเตือนผ่านไลน์กลุ่ม
        } else {
            echo "ERROR = " . $sql;
        }  
 


 


} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
}
