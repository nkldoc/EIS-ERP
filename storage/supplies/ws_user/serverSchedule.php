<?PHP

date_default_timezone_set("Asia/Bangkok");

function loadDataReturnWarrany(){
    //
    $datas = array("no"=>1,
        "c_name"=>"รายการ",
        "c_contrac_no"=>"พวช 0",
        );
    $list[] = $datas;
    return array("totalCount"=>1,"data"=> $list);
}

function loadDataWarranty(){
    //
    $datas = array("no"=>1,
        "c_name"=>"รายการ",
        "c_contrac_no"=>"พวช 1",
        );
    $list[] = $datas;
    return array("totalCount"=>1,"data"=> $list);
}

function notif($data = array()){
    //
//    print_r($data);
    return $data[0]["c_contrac_no"].'Sent Notif'."\n";
}

//$time check process 
//$cur_t1 = '09:30';
//$cur_t2 = '13:30';
//$cur_t3 = '16:00';
$cur_t1 = '17:21';
$cur_t2 = '17:23';
$cur_t3 = '17:25';
$i = 0;
while (true) {
 
    $max = 10;
 
        $cur_tt = date("H:i");
        $cur_time = date("H:i:s");
 
        if (($cur_tt == $cur_t1) || ($cur_tt == $cur_t2) || ($cur_tt == $cur_t3)) { //แจ้งเตือนสัญญา PROCESS 1
            
            print "success => " . $cur_tt . " => " . $cur_t1 . " => " . $cur_t2 . " => " . $cur_t3 . " => " . $cur_time . "\n"; //แสดงหน้า
            
            //P1 //หมด warranty
            $data = loadDataWarranty();
            if($data["totalCount"]){
                print notif($data["data"]);
            }
            //P2 //คืนสัญญาค้ำประกัน
            $data2 = loadDataReturnWarrany();
            if($data2["totalCount"]){
                print notif($data2["data"]);
            }
 
            
        } else {
            print $i . " => " . $cur_tt . " => " . $cur_t1 . " => " . $cur_t2 . " => " . $cur_t3 . " => " . $cur_time . "\n";
        }
        sleep(60*1); // 5 mimis
//    }
}