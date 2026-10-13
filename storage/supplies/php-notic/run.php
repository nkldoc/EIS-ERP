<?php

include("./../conf/config.php");
include("./../lib/database/DatabaseServer.php");
include("./../lib/database/apiUtil.php");
include("./../lib/date/i_date.class.php");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: *");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$root = "data";
$data = array();
$con = null;

function createFileJson($post) {
    $log_filename = "D:/data/" . date('Y-m') . "/";
    if (!file_exists($log_filename)) {
        mkdir($log_filename, 0777, true);
    }
    $log_file_data = $log_filename . date('d-') . "myfile.json";
    $bytes = file_put_contents($log_file_data, ("," . json_encode($post) . "\n"), FILE_APPEND);
    return "Here is the myfile data $bytes.";
}

$mode = $_REQUEST['mode']??null; 
switch ($mode) {
    case $value: 

        break; 
    default:    $_REQUEST['title'] = "Welcome";
                $txt = createFileJson($_REQUEST);
                echo $txt; 
        break;
} 
exit();