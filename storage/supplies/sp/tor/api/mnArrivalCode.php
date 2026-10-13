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
$c_code_gen = "IR"; //inventory receive
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$menuStatusHdr = " c_code in ('ST0116' ,'ST0115' ,'ST0114' ,'ST0013' ,'ST0012')";
$menu_code = $data['menu_code']??null;
$menu_back = $data['menu_back']??null;
$data['d_receive_date'] = $data['d_receive_date']??null;
//$f1 = $db->GetDataBySQL("select * from dbo.sp_status_hdr where c_code=? and i_enabled=?", array($menu_code, $i_enabled));
$data['d_send_date'] = date('Y-m-d H:i:s');
$data['d_receive_date'] = $data['d_receive_date'] != null ? ($date->bc_to_ad($data['d_receive_date']) . " 23:59:59") : NULL;
$data['d_act_date'] = date('Y-m-d H:i:s');
$re_id = $data['sp_check_period_hdr_id'];
$paramVal = array();


function RunStatusPeriod($period_status = null,$period_id=null) {
    global $db; 
    
    /*sp_status_hdr_id	c_code	c_name
                            4	ST0012	ส่งมอบงาน
                            5	ST0013	ตรวจรับพัสดุ/ครุภัณฑ์
                            9	ST0015	บันทึกใบเบิก
10040      */
        $period_status_id = $period_status;   
        $paramVal   = array();
        $arrParam[] = $period_status_id; //  
        $arrParam[] = $_SESSION["user_id"];
        $arrParam[] = $_SESSION["dc_cost_id"];
        $arrParam[] = date("Y-m-d H:i:s"); 
        $arrParam[] = $period_id;

        $sql = " UPDATE dbo.sp_tor_hdr_period set " 
                . " period_status_id = ? ,"
                . " dc_user_update_id = ? ,"
                . " dc_user_update_cost_id = ? ,"
                . " d_update = ? "
                . " where sp_tor_hdr_period_id = ?"; 
    return $db->QueryParam($sql, $arrParam); 
}

function RunItem() {
    global $db, $data, $paramVal;
    $paramVal[] = $data['menu_id']??null;; //sp_status_hdr_id
    $paramVal[] = $data['sp_emp_id']??null;; //sp_emp_id
    $paramVal[] = $data['sp_check_period_hdr_id']??null;; //sp_check_period_hdr_id
    $paramVal[] = $data['i_step']??null;; //i_step

    $paramVal[] = $data['d_receive_date']??null;; //d_receive_date
    $paramVal[] = $data['d_receive_date']??null;; //d_doc_date
    $paramVal[] = $data['d_send_date']??null;; //d_send_date

    $paramVal[] = $data['i_is_waiting']??null;; //i_is_waiting
    $paramVal[] = $data['c_comment']??null;; //c_comment
    $paramVal[] = $data['d_act_date']??null;; //d_act_date

    $sql3 = "insert into dbo.sp_withdraw_item ("
            . " sp_status_hdr_id, sp_emp_id, sp_check_period_hdr_id"
            . ", i_step, d_receive_date, d_doc_date, d_send_date, i_is_waiting"
            . ", c_comment, d_act_date)"
            . " values (?,?,?,?,?,?,?,?,?,?)";

    return $db->QueryParam($sql3, $paramVal);
}

$db->BeginTran();
switch ($mode) {

    case "WITHDRAWSPTORITEMS":
            $now = date('Y-m-d');
            $sp_check_period_hdr_id = $_REQUEST['sp_check_period_hdr_id']??null;
                        $f2 = $db->GetDataBySQL("select sp_check_period_hdr_id
                , (select sp_tor_id from dbo.sp_tor_contract where sp_tor_contract_id = sp_check_period_hdr.sp_tor_contract_id) as tor_id
		, sp_mn_contract_hdr_id
		, sp_tor_hdr_period_id
		, sp_tor_contract_id  
            from dbo.sp_check_period_hdr where sp_check_period_hdr_id = ?", array($_REQUEST['sp_check_period_hdr_id']));
            
            
            $sql2 = "update dbo.sp_tor_item set d_sent_date = '{$now}' where sp_status_hdr_id = 4 and sp_check_period_hdr_id={$f2['sp_check_period_hdr_id']} "; 
            $stmt = $db->QueryParam($sql2, array());
            $now2 = date('Y-m-d H:i:s');
            $user_id = $_SESSION['user_id'];
            $dc_cost_id = $_SESSION['dc_cost_id'];
            $sql3 = "update dbo.sp_check_period_hdr set i_status_billing  = 6"  
            .", d_update = '{$now2}'"
            .", dc_user_update_id = {$user_id} "
            .", dc_user_create_cost_id = {$dc_cost_id} "
            ."where sp_check_period_hdr_id = {$_REQUEST['sp_check_period_hdr_id']}" ; 
            $stmt = $db->QueryParam($sql3, array());
            RunStatusPeriod(10040,$f2["sp_tor_hdr_period_id"]);
            break;
//************************************************************************************
case "WITHDRAWSPTORITEMS_PR":
    $now = date('Y-m-d');
    $sp_withdraw_id = $_REQUEST['sp_withdraw_id']??null;
    // print_r ($_REQUEST['sp_withdraw_id']) ;
    // // exit;
//                 $f2 = $db->GetDataBySQL("select sp_check_period_hdr_id
//         , (select sp_tor_id from dbo.sp_tor_contract where sp_tor_contract_id = sp_check_period_hdr.sp_tor_contract_id) as tor_id
// , sp_mn_contract_hdr_id
// , sp_tor_hdr_period_id
// , sp_tor_contract_id  
//      from dbo.sp_check_period_hdr where sp_check_period_hdr_id = ?", array($_REQUEST['sp_check_period_hdr_id']));

    $sql2 = "update dbo.sp_tor_item set d_sent_date = '{$now}' where sp_status_hdr_id = 9 and sp_withdraw_id = {$sp_withdraw_id} "; 
    $stmt = $db->QueryParam($sql2, array());

    // RunStatusPeriod(10040,$f2["sp_tor_hdr_period_id"]);


            //*************RUN ITEMS EVENT & MENU*************************************************
        break;
    case "GENCODEARRIVAL":
        $data['dc_user_create_cost_id'] = $_SESSION['dc_cost_id'];
        $data['dc_user_create_id'] = $_SESSION['user_id'];
        $code_dc = (string) $c_code_gen;
        $ret_id  = $data["sp_check_period_hdr_id"] ?? null;
    
        $arrParam2 = array($code_dc, date("Ym"), $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);
        $sql2 = "EXEC SP_GEN_CODE ?,?,?,?,?;";

        $stmt = $db->QueryParam($sql2, $arrParam2);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];
        $ref_id = $arr_gen_code["reference_id"];

        if ($ret_id == $ref_id) {
            //************* GENCODE *************************************************
            $menu_code = 'ST0012';
            $i_enabled = 1;
            
    
            
            $f1 = $db->GetDataBySQL("select * from dbo.sp_status_hdr where c_code=? and i_enabled=?", array($menu_code, $i_enabled)); 
            $f2 = $db->GetDataBySQL("select sp_check_period_hdr_id
                , (select sp_tor_id from dbo.sp_tor_contract where sp_tor_contract_id = sp_check_period_hdr.sp_tor_contract_id) as tor_id
		, sp_mn_contract_hdr_id
		, sp_tor_hdr_period_id
		, sp_tor_contract_id  
             from dbo.sp_check_period_hdr where sp_check_period_hdr_id = ?", array($_REQUEST['sp_check_period_hdr_id']));
            
            $sql2 = "UPDATE {$table} SET "
                    . "i_step=1"
                    . ", sp_status_hdr_id = " . $f1['sp_status_hdr_id']
                    . ", i_menu = 1 "
                    . ", c_arrive_code= '{$c_code}' "
                    . "WHERE {$keyName} = {$data["sp_check_period_hdr_id"]};";
               
             $d_update      = date("Y-m-d H:i:s"); 
             $d_tor_update  = date("Y-m-d"); 
             $tor_id        = null;       
             $period_id     = null;       

//             print_r($f2);
//             exit();
             
            $sql2 .= " 
                DECLARE @sp_tor_contract_id int;
                SET @sp_tor_contract_id = {$f2["sp_tor_contract_id"]} 
                SET NOCOUNT ON
                INSERT INTO sp_tor_item (
                    contract_id
                    ,tor_id
                    ,i_contract_status
                    ,d_contract_status_date
                    ,sp_status_hdr_id
                    , sp_tor_hdr_period_id
                    , sp_check_period_hdr_id
                    , d_tor_status_date
                ) VALUES (
                    @sp_tor_contract_id
                    , (select sp_tor_id from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    , (select i_contract_status from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    , (select d_update from sp_tor_contract where sp_tor_contract_id = @sp_tor_contract_id)
                    , 4
                    , {$f2["sp_tor_hdr_period_id"]}
                    , {$f2["sp_check_period_hdr_id"]}
                    , '{$d_tor_update}'
                );";     
                    
            $stmt2 = $db->QueryParam($sql2, array());
            //*************RUN ITEMS EVENT & MENU*************************************************
            $data['menu_id'] = $f1['sp_status_hdr_id'];
            $data['i_step'] = 1;
            $data['sp_emp_id'] = $_SESSION['sp_emp_id'];

            RunItem();
            /*sp_status_hdr_id	c_code	c_name
                            4	ST0012	รอส่งมอบงาน
                            5	ST0013	รอตรวจรับพัสดุ/ครุภัณฑ์
                            9	ST0015	รอบันทึกใบเบิก
             */
            RunStatusPeriod(5,$f2["sp_tor_hdr_period_id"]);
            //*************RUN ITEMS EVENT & MENU*************************************************
        }
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
