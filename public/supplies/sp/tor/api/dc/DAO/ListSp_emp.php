<?php
include("../../../../conf/config.php");
include("../../../../lib/database/DatabaseServer.php");
include("../../../../lib/database/apiUtil.php");
include("../../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

function createFileJson($post) {
    $root = "D:/_ProcessStatus/";
    $log_filename = $root . date('Y-m') . "/";
    if (!file_exists($log_filename)) {
        mkdir($log_filename, 0777, true);
    }
    $log_file_data = $log_filename . "myfile.json";
    $bytes = file_put_contents($log_file_data, ("," . json_encode($post) . "\n"), FILE_APPEND);
    echo "Here is the myfile data $bytes.";
}

function lineNotif($msgg) {

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    date_default_timezone_set("Asia/Bangkok");
    $sToken = "psXNTXacAKj4YxeCJuNpDfRGu053SB5vl9Pul1odQMY";
    $sMessage = $msgg;
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

header('Cache-Control: no-cache, must-revalidate');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Content-type: application/json');
############################################################################################################
$mode = $_REQUEST['mode'] ?? null;
$process = $_REQUEST['process'] ?? null;

/*     $_SESSION["user_id"] = intval($data["dc_user_id"]); //id ผู้ใช้งาน
  $_SESSION["user_name"] = $data["c_full_name"]; //ชื่อผู้ใช้งาน
  $_SESSION["dc_emp_id"] = intval($data["dc_emp_id"]); //พนักงานผู้รับผิดชอบ
  // c_sp_emp c_department_type c_department c_position sp_emp_id dc_department_id dc_department_type_id i_seq i_level
  $_SESSION["sp_emp_id"] = intval($data["sp_emp_id"]) ?? null; //
  $_SESSION["dc_department_id"] = intval($data["dc_department_id"]) ?? null; //
  $_SESSION["dc_department_type_id"] = intval($data["dc_department_type_id"]) ?? null; //
  $_SESSION["i_seq"] = intval($data["i_seq"]) ?? null; //
  $_SESSION["i_level"] = intval($data["i_level"]) ?? null; //

  $_SESSION["c_sp_emp"] = $data["c_sp_emp"] ?? null; //
  $_SESSION["c_department_type"] = $data["c_department_type"] ?? null; //
  $_SESSION["c_department"] = $data["c_department"] ?? null; //
  $_SESSION["c_position"] = $data["c_position"] ?? null; //

  $_SESSION["dc_cost_id"] = intval($data["dc_cost_id"]); //id หน่วยงาน
  $_SESSION["cost_name"] = $data["cost_name"]; //หน่วยงาน
  $_SESSION["cost_code"] = $data["cost_code"]; //รหัสหน่วยงาน
  $_SESSION["dc_area_id"] = intval($data["dc_area_id"]); //id หน่วยธุรกิจ
  $_SESSION["i_type_user"] = intval($data["i_type_user"]); //ประเภทผู้ใช้งาน
  $_SESSION["dc_cost_acc_id"] = intval($data["dc_cost_acc_id"]); //id ศูนย์ต้นทุนทางบัญชีของหน่วยงานที่ log in
  $_SESSION["last_login"] = date("Y-m-d H:i:s"); */
if ($mode === "info") {
    $json = '{"debug":true,"totalCount":4,"data":[
                {
                  "sp_emp_id": ' . $_SESSION["user_id"] . ',
                  "c_name": "' . $_SESSION['user_name'] . '",
                  "dc_emp_id":  ' . $_SESSION["dc_emp_id"] . ',
                  "dc_department_type_id": ' . $_SESSION["dc_department_type_id"] . ',
                  "dc_department_id": ' . $_SESSION["dc_department_id"] . ',
                  "c_department":"' . $_SESSION['c_department'] . '",
                  "c_position":"' . $_SESSION['c_position'] . '",
                  "i_level":' . $_SESSION["i_level"] . ',
                  "datetime":"' . date('Y-m-d H:i:s') . '",
                  "i_enable": 1,
                  "i_delete": 2,
                  "dc_user_create_id": 1,
                  "dc_user_create_cost_id": 3,
                  "d_create": "2021-05-25T10:53:08.270",
                  "dc_user_update_id": 1,
                  "dc_user_update_cost_id": 3,
                  "d_update": "2021-05-25T10:53:08.270"
                }
              ]
            }';
    //echo json_encode(["debug" => true, "totalCount" => $totalCount, "data" => $data]);
    echo $json;
    exit();
} else if ($mode === "genTmpfile") {
    ###################
    $sqlTempTable = "select b.c_name as c_department
                    , a.c_name
                    , a.sp_emp_id
                    , a.dc_emp_id
                    , b.dc_department_id
                   , b.dc_department_type_id
                   , b.i_seq
                    , a.i_level
		 , ROW_NUMBER() OVER (ORDER BY a.dc_department_id asc) as row
                from dbo.sp_emp a
                  inner join sp_department b on b.dc_department_id = a.dc_department_id
                where a.sp_emp_id = ?";

    $sqlMain = "select main.* from ({$sqlTempTable}) main";
    $arrParam = array(1);
    $arrCountParam = array(1);

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 1;
    $root = "data";
    while ($row = $db->Fetch($stmt)) {
        $temp = array("no" => ($i++),
            "no" => intval($row["row"]),
            "id" => intval($row["sp_emp_id"]),
            "c_code" => $row["c_department"],
            "i_level" => intval(@$row["i_level"]),
            "i_parent" => intval(@$row["i_parent"]),
            "dc_dempartment_type_id" => intval(@$row["dc_dempartment_type_id"]),
            "dc_dempartment_id" => intval(@$row["dc_dempartment_id"]),
            "c_department" => $row["c_department"],
            "TextShow" => $row["c_name"] . " | " . $row["c_department"],
            "c_name" => $row["c_name"]
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    $json = ${$root};
    createFileJson($temp);
    exit();
} else if ($mode === "view") {
    $process = $process;
    $month = "2022-03";
    $file = "D:/_ProcessStatus/{$month}/{$process}.json";
    require_once ("{$file}");
    exit();
} else if ($mode === "post") {
    $root = "D:/_ProcessStatus/";
    $process = 'contract';
    $msg = "เทสแจ้งเตือนเกี่ยวกับทำโปรเซส : " . $process . "/" . date('Y-m-d H:i:s');

//    $i_is_warranty = $_REQUEST['i_is_warranty'] ?? null;
//    $stm = true;
//    if ($i_is_warranty) {
//        $ok = lineNotif($msg);
//        if ($ok == 'ok')
//            $stm = true;
//        else
//            $stm = false;
//    }

    $log_filename = $root . date('Y-m') . "/";
    if (!file_exists($log_filename)) {
        mkdir($log_filename, 0777, true);
    }
    $time = date('Y-m-d H:i:s');
    $array = array(
        'user_id' => $_SESSION['user_id'],
        'user_name' => $_SESSION['user_name'],
        'cost_name' => $_SESSION['cost_name'],
        'process' => $process,
        'datetime' => $time
    );
    $json[] = $array;
    $jsoArr = array("totalCount" => 1, "data" => $json);
    $log_file_data = $log_filename . "{$process}.json";
    $bytes = file_put_contents($log_file_data, ('' . json_encode($jsoArr) . ''));

    if (true) {
        $re = array("reval" => 0, "success" => "Success", "msg" => $msg, "data" => $jsoArr);
    } else {

        $re = array("reval" => 1, "success" => "Error", "msg" => "check ");
    }
    echo json_encode($re);
}
?>