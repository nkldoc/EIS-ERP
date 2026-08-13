<?PHP

date_default_timezone_set("Asia/Bangkok");

function loadDataReturnWarrany() {
//
    $datas = array("no" => 1,
        "c_name" => "รายการ",
        "c_contrac_no" => "พวช 0",
    );
    $list[] = $datas;
    return array("totalCount" => 1, "data" => $list);
}

function loadDataWarranty() {
//
    $datas = array("no" => 1,
        "c_name" => "รายการ",
        "c_contrac_no" => "พวช 1",
    );
    $list[] = $datas;
    return array("totalCount" => 1, "data" => $list);
}

function notif($data = array()) {
 
    $url = "https://eis.vajira.ac.th:8443/procure/websocket/event";
    $ch = curl_init(); 
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query(array('msgType' => 4, 
                'cost_id' => $_SESSION['dc_cost_id'], 
                'dc_cost_id' => $_SESSION['dc_cost_id'], 
                'msg' => 'Test')
            )); 
// Receive server response ...
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
    $server_output = curl_exec($ch); 
    curl_close($ch); 
// Further processing ...
    if ($server_output == "OK") {
        print 'xxx ok';
    } else {
        print 'xxx ok';
    } 
    print $server_output; 
    return $data[0]["c_contrac_no"] . 'Sent Notif' . "\n";
}

//$time check process 
//$cur_t1 = '09:30';
//$cur_t2 = '13:30';
//$cur_t3 = '16:00';
$cur_t1 = '17:33';
$cur_t2 = '17:34';
$cur_t3 = '17:35';
$i = 0;
while (true) {

    $n = 1;

    $cur_tt = date("H:i");
    $cur_time = date("H:i:s");
    $cur_s = date("s");
    if ($cur_s == '00') {
        if (($cur_tt == $cur_t1) || ($cur_tt == $cur_t2) || ($cur_tt == $cur_t3)) { //แจ้งเตือนสัญญา PROCESS 1
            print "success => " . $cur_tt . " => " . $cur_t1 . " => " . $cur_t2 . " => " . $cur_t3 . " => " . $cur_time . "\n"; //แสดงหน้า
            //P1 //หมด warranty
            $data = loadDataWarranty();
            if ($data["totalCount"]) {
                print notif($data["data"]);
            }
            //P2 //คืนสัญญาค้ำประกัน
            $data2 = loadDataReturnWarrany();
            if ($data2["totalCount"]) {
                print notif($data2["data"]);
            }
        } else {
            print $i . " => " . $cur_tt . " => " . $cur_t1 . " => " . $cur_t2 . " => " . $cur_t3 . " => " . $cur_time . "\n";
        }
//        sleep($n); // 5 mimis sleep($n) == usleep($n * 1000000) 
        usleep($n * 1000000); // 1 วิ
    }
}