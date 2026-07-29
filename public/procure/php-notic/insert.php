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

// createFileJson($_REQUEST);
// exit();

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

///*@postData = 'id='+@id+'&ref_id='+@ref_id+'&c_name='+@c_name+'&c_detail='+@c_detail
//+'&i_is_start='+@i_is_start+'&@due_date='+@due_date
//+'&i_before='+@i_before+'&user_id='+@user_id
//+'&sp_emp_id='+@sp_emp_id; */
//insert.php


if (isset($_POST["id"])) {
    include("connect.php");


        $i_type = $_REQUEST['i_type'] ?? null;
        $subject = mysqli_real_escape_string($con, $_REQUEST["c_name"]);
        $comment = mysqli_real_escape_string($con, $_REQUEST["c_detail"]);
        $user_id = mysqli_real_escape_string($con, $_REQUEST['user_id']);
        $sp_emp_id = mysqli_real_escape_string($con, $_REQUEST['sp_emp_id']);
        $i_type = mysqli_real_escape_string($con, $i_type);

    $comment_subject = $subject;
    $comment_text = $comment;

    if ($i_type == 2) {


        $sql = "INSERT INTO warranty(comment_subject, comment_text"
                . ", c_name_close, c_detail_close, comment_status"
                . ", user_id, sp_emp_id, i_type_user"
                . ", d_create_dt, d_update_dt, user_create_id"
                . ", user_update_id) "
                . "VALUES ('$comment_subject'"
                . ",'$comment_text'"
                . ", null, null, 0"
                . ", $user_id"
                . ", $sp_emp_id"
                . ", $i_type"
                . ", now()"
                . ", now()"
                . ", $user_id"
                . ",$user_id)";

        if (mysqli_query($con, $sql)) {
            echo "$i_type = แจ้งเตือนก่อนหมดประกัน ";
            lineNotif($_POST["subject"] . ' ' . $_POST["comment"]); //แจ้งเตือนผ่านไลน์กลุ่ม
        } else {
            echo "ERROR = " . $sql;
        }
    } else {
        echo "$i_type = แจ้งเตือนก่อนหมดสัญญา ";
    }


} else {
    header($_SERVER['SERVER_PROTOCOL'] . ' 500 Internal Server Error', true, 500);
}
