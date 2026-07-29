<?php

//
//include("../../conf/config.php");
//include("../../lib/database/DatabaseServer.php");
//include("../../lib/database/apiUtil.php");
//include("../../lib/date/i_date.class.php");
//
//$db = new DatabaseServer();
//$date = new i_date();
//$util = new apiUtil();
//
//$root = "data";
//$data = array();
////sleep(3);
//$storeVar = file_get_contents("file:///D:/ERP/nmu_supplies/src/main/webapp/ws_user/logs/logs.json");
//$arr = json_decode($storeVar); //Here is the array
////echo "<pre>";
////print_r($arr);
////echo "</pre>";
//$i = 1;
//$count = 0;
//if (is_object($arr))
//    foreach ($arr->data[0] as $k => $v) {
//
////    echo "<pre>";
////    print ($v->socket);
////    print ($v->id);
////    print ($v->name);
////    echo "</pre>";
//
//        $temp = array(
//            "no" => $i++,
//            "id" => $v->id ?? null,
//            "socket" => $v->socket ?? null,
//            "c_name" => $v->name ?? null,
//            "menuname" => $v->menuname ?? null,
//            "datetime" => $v->datetime ?? null,
//        );
//        $data[] = $temp;
//        $count++;
//    }
//
//echo json_encode(array("debug" => true, "totalCount" => $count, $root => $data));
//exit;
//
