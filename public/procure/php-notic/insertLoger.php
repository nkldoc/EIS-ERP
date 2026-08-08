<?php
include("../conf/config.php");

function createFileJson($post) {
    $log_filename = date('Y-m') . "/";
    if (!file_exists($log_filename)) {
        mkdir($log_filename, 0777, true);
    }
    $log_file_data = date('Y-m') . "/" . date('d-') . "myfile.json";
    $bytes = file_put_contents($log_file_data, ("," . json_encode($post) . "\n"), FILE_APPEND);
    echo "Here is the myfile data $bytes.";
}
 
function lineNotif($msg = null) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    date_default_timezone_set("Asia/Bangkok");
    $sToken = "psXNTXacAKj4YxeCJuNpDfRGu053SB5vl9Pul1odQMY";
    $sMessage = !empty($msg) ? $msg : "มีการกดโพสหน้าบันทึกแจ้งเตือน";

    $chOne = curl_init();
    curl_setopt($chOne, CURLOPT_URL, "https://notify-api.line.me/api/notify");
    curl_setopt($chOne, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($chOne, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($chOne, CURLOPT_POST, 1);
    curl_setopt($chOne, CURLOPT_POSTFIELDS, "message=" . $sMessage);
    $headers = array('Content-type: application/x-www-form-urlencoded', 'Authorization: Bearer ' . $sToken . '',);
    curl_setopt($chOne, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($chOne, CURLOPT_RETURNTRANSFER, 1);
    $result = curl_exec($chOne);

    //Result error
    if (curl_error($chOne)) {
        echo 'error:' . curl_error($chOne);
    } else {
        $result_ = json_decode($result, true);
        echo "status : " . $result_['status'];
        echo "message : " . $result_['message'];
    }
    curl_close($chOne);
}
 $user_id = $_REQUEST["user_id"]??null;
 $user_sent_id = $_REQUEST["user_sent_id"]??null;
 $c_menu = $_REQUEST["c_menu"]??null;
 $i_staus = $_REQUEST["i_status"]??null;
 $mode = $_REQUEST["mode"]??null;
 
if (isset($_REQUEST["user_id"]) && $_REQUEST["user_id"]!=0) {
    
    include("connect.php");
 if($mode=="CLOSE_NOTIF"){ 
      
        $user_id = mysqli_real_escape_string($con, $_REQUEST["user_id"]); 
        $sql = "UPDATE `lognotif` SET `i_status`='0' WHERE user_id = $user_id";

        if (mysqli_query($con, $sql)) { 
            echo "บันทึก Logger";
//            lineNotif($_POST["subject"] . ' ' . $_POST["comment"]); //แจ้งเตือนผ่านไลน์กลุ่ม
        } else {
            echo "ERROR = " . $sql;
        } 
        
 }else if($mode=="LIST_LOG"){ 
              $query = " SELECT * FROM (
                                SELECT 
                                `id`,`i_type`,`c_name`,`user_id`,`user_sent_id`,`user_sent_name`,`client_datetime` ,`c_menu`, `i_status`
                                FROM `lognotif` 
                                where i_status=1 AND i_type=2 AND user_id={$user_id} 
                                    ORDER BY `id` DESC LIMIT 20
                              ) t1 ORDER BY t1.id";
//                                echo $query; exit();
        $result = mysqli_query($con, $query);
        $output = '';
        if (mysqli_num_rows($result) > 0) {
            
            while ($row = mysqli_fetch_array($result)) {
                $rs = array(
                    'c_name' => $row['c_name'],
                    'user_id' => $row['user_id'],
                    'user_sent_id' => $row['user_sent_id'],
                    'user_sent_name' => $row['user_sent_name'],
                    'c_menu' => $row['c_menu'],
                    'i_status' => $row['i_status'],
                    'i_type' => $row['i_type'],
                    'client_datetime' => $row['client_datetime'],
                    );
                $rss[]= $rs;
            } 
            
            echo json_encode(array("success" => "Success", "totalCount" => count($rss), "data" => $rss));
            exit();
        }
 }else if($mode=="LIST_MESSAGE"){ 
              $query = " SELECT * FROM (
                                SELECT 
                                `id`,`i_type`,`c_name`,`user_id`,`user_sent_id`,`user_sent_name`,`client_datetime` ,`c_menu`, `i_status`
                                FROM `lognotif` 
                                where i_status=1 AND i_type=2 AND user_id={$user_id} 
                                    ORDER BY `id` DESC LIMIT 20
                              ) t1 ORDER BY t1.id";
//                                echo $query; exit();
        $result = mysqli_query($con, $query);
        $output = '';
        if (mysqli_num_rows($result) > 0) {
            
            while ($row = mysqli_fetch_array($result)) {
                $rs = array(
                    'c_name' => $row['c_name'],
                    'user_id' => $row['user_id'],
                    'user_sent_id' => $row['user_sent_id'],
                    'user_sent_name' => $row['user_sent_name'],
                    'c_menu' => $row['c_menu'],
                    'i_status' => $row['i_status'],
                    'i_type' => $row['i_type'],
                    'client_datetime' => $row['client_datetime'],
                    );
                $rss[]= $rs;
            } 
            
            echo json_encode(array("success" => "Success", "totalCount" => count($rss), "data" => $rss));
            exit();
        }
 }else{
        $i_type = mysqli_real_escape_string($con, $_REQUEST['color']=="#C1C1C1"?1:2);
        $c_name = mysqli_real_escape_string($con, $_REQUEST['message']);
        $client_datetime = mysqli_real_escape_string($con, $_REQUEST['client_datetime']);
        $c_menu = mysqli_real_escape_string($con, $c_menu);
        $i_status= mysqli_real_escape_string($con, $i_staus);
        $user_sent_id= mysqli_real_escape_string($con, $user_sent_id);
        $user_sent_name= mysqli_real_escape_string($con, $_REQUEST["user_sent_name"]);
        $user_id = mysqli_real_escape_string($con, $_REQUEST["user_id"]);

  
        $sql = "INSERT INTO "
                . "`lognotif` (`id`, `i_type`,`c_name`, `user_id`, `user_sent_id`, `user_sent_name`, `client_datetime`, `c_menu`, `i_status`) "
                . " VALUES (NULL, '{$i_type}', '{$c_name}', {$user_id},{$user_sent_id}, '{$user_sent_name}','{$client_datetime}', '{$c_menu}', '{$i_status}');";

        if (mysqli_query($con, $sql)) { 
            echo "บันทึก Logger";
//            lineNotif($_POST["subject"] . ' ' . $_POST["comment"]); //แจ้งเตือนผ่านไลน์กลุ่ม
        } else {
            echo "ERROR = " . $sql;
        }  
 }


 


} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
}
