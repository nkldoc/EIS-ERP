<?php

//-- mnContractCode
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$table = "dbo.sp_check_period_hdr";
$keyName = "sp_check_period_hdr_id";
$data = $util->mnUser($_REQUEST);
$data["i_delete"] = DELETE_FALSE;
$c_code_gen = "ARI"; //contract sign
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$menuStatusHdr = " c_code in ('ST0116' ,'ST0115' ,'ST0114' ,'ST0013' ,'ST0012')";

//$f1 = $db->GetDataBySQL("select * from dbo.sp_status_hdr where c_code=? and i_enabled=?", array($menu_code, $i_enabled));
$data['d_receive_date'] = $data['d_receive_date']??null;
$data['d_send_date'] = date('Y-m-d H:i:s');
$data['d_receive_date'] = $data['d_receive_date'] . date(' H:i:s');
$data['d_act_date'] = date('Y-m-d H:i:s');
$re_id = $data['sp_check_period_hdr_id']??null;
$paramVal = array();

function lineNotif($msgg) {

    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    date_default_timezone_set("Asia/Bangkok");
    $sToken = "KPXXAppt3dElykpoSxJsZqGs2SF0fgwoQUW5YAXKbDB";
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
        return 'error:' . curl_error($chOne);
    } else {
        return $result_ = json_decode($result, true);
//        echo "status : " . $result_['status'];
//        echo "message : " . $result_['message'];
    }
    curl_close($chOne);
}



function RunItem() {
    global $db, $data, $paramVal;

    $paramVal[] = $data['menu_id']; //sp_status_hdr_id
    $paramVal[] = $data['sp_emp_id']; //sp_emp_id
    $paramVal[] = $data['sp_check_period_hdr_id']; //sp_check_period_hdr_id
    $paramVal[] = $data['i_step']; //i_step

    $paramVal[] = $data['d_receive_date']; //d_receive_date
    $paramVal[] = $data['d_receive_date']; //d_doc_date
    $paramVal[] = $data['d_send_date']; //d_send_date

    $paramVal[] = $data['i_is_waiting']; //i_is_waiting
    $paramVal[] = $data['c_comment']; //c_comment
    $paramVal[] = $data['d_act_date']; //d_act_date

    $sql3 = "insert into dbo.sp_withdraw_item ("
            . "sp_status_hdr_id"
            . ", sp_emp_id"
            . ", sp_check_period_hdr_id"
            . ", i_step"
            . ", d_receive_date,d_doc_date,d_send_date,i_is_waiting"
            . ", c_comment,d_act_date)"
            . " values (?,?,?,?,?,?,?,?,?,?)";
    
//        header('Cache-Control: no-cache, must-revalidate');
//        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
//        header('Content-type: application/json');
//        ####################################################
//    
        $cComment = $data['c_comment']??null;
//        $cArriveCode = $data['c_arrive_code']??null;
//        
  /*  if($_REQUEST['step']== "GOTOSTEP"){
        $reMsg = lineNotif("สายงานส่งเบิก".$cComment); 
    } else if ($_REQUEST['step']== "BACKSTEP1"){
       $reMsg = lineNotif("แก้ไขแล้วส่งสายงานเบิก".$cComment); 
    }*/
//    echo $sql3;
//    print_R($paramVal);
//    exit();
    return $db->QueryParam($sql3, $paramVal);
}

$db->BeginTran();
switch ($mode) {
    case "LINEALERT": 
        header('Cache-Control: no-cache, must-revalidate');
        header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
        header('Content-type: application/json');
        ####################################################
        $msg = $_POST['msg'];
        $reMsg = lineNotif("TEST นะจ๊ะ".$_POST['msg']); 
        
        if($reMsg['status']==200)
            $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "retunMsg" => $reMsg);
        else
            $re = array("reval" => 1, "success" => "Unsuccess", "msg" => "บันทึกเรียบร้อยแล้ว", "retunMsg" => $reMsg);
        
        echo json_encode($re);
        exit;
        break;
    case "BACKSTEP1":
     //   $reMsg1 = lineNotif("แก้ไขแล้วส่งสายงานเบิก".$cComment); 
        $menu_code = 'ST0114'; //ตรวจรับ
        $i_enabled = 1;
        $data['i_step'] = 4;
        $data['i_is_waiting'] = 0;
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        //************* GENCODE *************************************************

        $f1 = $db->GetDataBySQL("select * from dbo.sp_status_hdr where c_code=? and i_enabled=?", array($menu_code, 1));
        

//        print_r($data);
//        exit();
        //************* UPDATE CHECKING *************************************************
        $sql2 = "UPDATE {$table} SET "
                . "i_step= 4"
                . ", i_is_waiting = 0"
                . ", sp_status_hdr_id = " . $f1['sp_status_hdr_id']
                . ", i_menu =  3 "
                . ",dc_user_update_id = " . $data["dc_user_update_id"]
                . ",dc_user_update_cost_id  = " . $data["dc_user_update_cost_id"]
                . ",d_update  = '" . $data["d_update"] . "' WHERE {$keyName} = {$data["sp_check_period_hdr_id"]}";
//        echo $sql2;
//        exit();
        $stmt2 = $db->QueryParam($sql2, array());
        //*************RUN ITEMS EVENT & MENU*********************************************
        $data['menu_id'] = $f1['sp_status_hdr_id'];
        $data['i_step'] = 4;
        $data['sp_emp_id'] = $_SESSION['sp_emp_id'];
        //*************RUN ITEMS EVENT & MENU*************************************************
        $f2 = $db->GetDataBySQL("select c_code
					,(select c_code from dbo.sp_tor_contract where sp_tor_contract.sp_tor_contract_id=sp_check_period_hdr.sp_tor_contract_id) as contract_code 
					from dbo.sp_check_period_hdr 
					where sp_check_period_hdr_id=?", array($data["sp_check_period_hdr_id"]));
        $data['c_comment'] = $f2['c_code']." ".$f2['contract_code'];
        $stmt = RunItem(); 
        
        break;
    case "GOTOSTEP1":
       // $reMsg = lineNotif("สายงานส่งเบิก".$cComment);
        $menu_code = 'ST0014'; //ตรวจรับ
        $i_enabled = 1;
        $data['i_step'] = 5;
        $data['i_is_waiting'] = 0;
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
        //************* GENCODE *************************************************

        $f1 = $db->GetDataBySQL("select * from dbo.sp_status_hdr where c_code=? and i_enabled=?", array($menu_code, 1));

//        print_r($data);
//        exit();
        //************* UPDATE CHECKING *************************************************
        $sql2 = "UPDATE {$table} SET "
                . "i_step= 2"
                . ", sp_status_hdr_id = " . $f1['sp_status_hdr_id']
                . ", i_menu =  2 "
                . ",dc_user_update_id = " . $data["dc_user_update_id"]
                . ",dc_user_update_cost_id  = " . $data["dc_user_update_cost_id"]
                . ",d_update  = '" . $data["d_update"] . "' WHERE {$keyName} = {$data["sp_check_period_hdr_id"]}";
//        echo $sql2;
//        exit();
        $stmt2 = $db->QueryParam($sql2, array());
            //*************RUN ITEMS EVENT & MENU*********************************************
        $data['menu_id'] = $f1['sp_status_hdr_id'];
        $data['i_step'] = 2;
        $data['sp_emp_id'] = $_SESSION['sp_emp_id'];
        //*************RUN ITEMS EVENT & MENU*************************************************
        $f2 = $db->GetDataBySQL("select c_code
        ,(select c_code from dbo.sp_tor_contract where sp_tor_contract.sp_tor_contract_id=sp_check_period_hdr.sp_tor_contract_id) as contract_code 
        from dbo.sp_check_period_hdr 
        where sp_check_period_hdr_id=?", array($data["sp_check_period_hdr_id"]));
        $data['c_comment'] = $f2['c_code']." ".$f2['contract_code'];
        $stmt = RunItem();
        break;
}

if ($stmt && $stmt2 && $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $re_id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
