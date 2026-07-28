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
$c_code_gen = "AP"; //contract sign
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;

$db->BeginTran();

$id = $_REQUEST["sp_check_period_hdr_id"] ?? null;
function RunStatusPeriod($period_status = null,$period_id=null) {
    global $db; 
    
    /*sp_status_hdr_id	c_code	c_name
                            4	ST0012	ส่งมอบงาน
                            5	ST0013	ตรวจรับพัสดุ/ครุภัณฑ์
                            9	ST0015	บันทึกใบเบิก *****/
    
        $period_status_id = $period_status;   
    
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
    return $db->QueryParam($sql, $arrParam);;
}
function checkItemsToTranf($check_id, $data = array()) {
    global $db;
    /*
     * receive Items
     * c_yyyy => ปีขอเบิก
     * i_yyyy => ปีที่เรื่อง
     * dc_bg_budget_type_id => แหล่งเงิน
     * po_expense_id => รายจ่ายย่อย v4 (งบประมาณ)
     * */
    $f1 = $db->GetDataBySQL("select YEAR(a.d_checking_date) as i_yyyy,YEAR(getdate()) as c_yyyy "
            . " , (select dc_bg_budget_type_id ) as dc_bg_budget_type_id"
            . " , () as po_expense_id"
            . " from [NMU_ERP].[dbo].sp_check_period_hdr a"
            . " where a.sp_check_period_hdr_id = ?", array($check_id)); 
    $c_yyyy = $f['c_yyyy'];
    $i_yyyy = $f['i_yyyy'];
    $dc_bg_budget_type_id = $f['dc_bg_budget_type_id'];
    $po_expense_id = $f['po_expense_id'];

    $sql = "UPDATE dbo.sp_tranf_hdr SET"
            . " c_yyyy = '{$c_yyyy}'"
            . " , i_yyyy = '{$i_yyyy}'"
            . " , dc_bg_budget_type_id = '{$dc_bg_budget_type_id}'"
            . " , po_expense_id = '{$po_expense_id}'"
            . " WHERE sp_check_period_hdr_id = ?;";
    $stm1 = $db->QueryParam($sql, array($check_id));
    return array($stm1);
}

switch ($mode){
    case "ADD_HISTORY_ITEMS":     
        /*    [status] => 21/2568 | 02AP24120046 | 2024-12-24 13:15:19
         [title] => 1 บันทึกการรับแยกลงบัญชี สินทรัพย์/วัสดุ ประเภทการดำเนินงาน
         [c_subject] => จัดซื้อวัสดุอุปกรณ์จัดกิจกรรม จำนวน 4 รายการ 
         [c_detail] => 1 บันทึกการรับแยกลงบัญชี สินทรัพย์/วัสดุ ประเภทการดำเนินงาน
         [dc_user_update_id] => 1
         [dc_user_update_cost_id] => 3
         [d_update] => 2024-12-24 13:15:23
         [i_delete] => 2*/     
             $arrParam[] = $data["sp_check_period_hdr_id"];
             $arrParam[] = $data["document_number"];
             $arrParam[] = $data["status"]; 
             $arrParam[] = $data["c_subject"];
             $arrParam[] = $data["c_detail"];
             $arrParam[] = $data["d_update"];
             $arrParam[] = $data["sp_check_period_hdr_id"];
             $arrParam[] = $data["sp_tor_hdr_period_id"]??0;
             $arrParam[] = $_SESSION["user_id"];
             $arrParam[] = $data["c_detail"];
             $sql = "INSERT INTO [dbo].[sp_check_history]
                            ([sp_check_period_hdr_id]
                            ,[document_number]
                            ,[status]
                            ,[subject]
                            ,[details] 
                            ,[date_time]) VALUES (?,?,?,?,?,?)
                EXEC NMU_ERPLOG.dbo.usp_log_backup_and_reason_all
                @sp_check_period_hdr_id = ?,
                @sp_tor_hdr_period_id = ?,
                @log_user_id = ?,
                @log_reason =  ? ; ";
             $stmt = $db->QueryParam($sql,$arrParam); 
             $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $id);
             break; 
    case "UPDATE_EMP":

        $emp_id = $data["sp_emp_id"];
        $id = $data["id"];

        $sql = "UPDATE {$table} SET sp_emp_id= ? , c_comment2=? WHERE {$keyName} = ?;";
        //update codec
//        echo ($sql);
//        print_r($data);
//        exit();
        $stmt = $db->QueryParam($sql, array($emp_id, $data['c_comment'], $id));

        $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $id);
        break;
    case "UPDATE_MIS":
        $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $data["sp_check_period_hdr_id"]);
        break;
    case "GENCODECHECKING_MONTHLY":
        sleep(5);
        $id = $data["sp_check_period_hdr_id"];
        $re = array("reval" => 0, 
            "success" => "Success"
            , "msg" => "บันทึกเรียบร้อยแล้ว"
            , "id" => $data["sp_check_period_hdr_id"]
            , "data"=>$data);
        
        $f2 = $db->GetDataBySQL("select sp_check_period_hdr_id
                , (select sp_tor_id from dbo.sp_tor_contract where sp_tor_contract_id = sp_check_period_hdr.sp_tor_contract_id) as tor_id
		, sp_mn_contract_hdr_id
		, sp_tor_hdr_period_id
		, sp_tor_contract_id  
             from dbo.sp_check_period_hdr where sp_check_period_hdr_id = ?", array($id));

        echo json_encode($re); exit();
        
        break; 
    
        case "GENCODECHECKING":
            $data['dc_user_create_cost_id'] = $_SESSION['dc_cost_id']; // ลงยัญชี
            $data['dc_user_create_id'] = $_SESSION['user_id'];  // ลงยัญชี
            $ret_id = $_REQUEST["sp_check_period_hdr_id"] ?? null;

            $arrValue   =    array();
            $arrValue[] =  $_REQUEST['dc_cost_id'];
            // $arrValue[] =  date("y");
            // $arrValue[] =  date("m");
            $year_th = ($_REQUEST['i_budget_year'] + 543) % 100;
            $arrValue[] = $year_th ;
            $arrValue[] = date("m", strtotime($_REQUEST['d_checking_date']));
            $arrValue[] =  $_REQUEST['dc_cost_origin_id'];
            $arrValue[] =  $_SESSION['user_id']; 
            $arrValue[] =  $_REQUEST["sp_check_period_hdr_id"];
            $sql    = "
                SET NOCOUNT ON
                CREATE TABLE #TEMP_SP_TOR_CODE_DEBT_GEN (c_code varchar(50),sp_check_period_hdr_id bigint); 
                INSERT INTO #TEMP_SP_TOR_CODE_DEBT_GEN EXEC SP_TOR_CODE_DEBT_GEN ?,?,?,?,?,?;
                SELECT c_code,sp_check_period_hdr_id FROM #TEMP_SP_TOR_CODE_DEBT_GEN;
            ";
            $stmt = $db->QueryParam($sql, $arrValue);
            $arr_gen_code = $db->Fetch($stmt);
            $c_code = $arr_gen_code["c_code"];
            $i_product_type = $_REQUEST["i_product_type"]>0?1:0; //สนแค่มีของ 
            $ref_id = $arr_gen_code["sp_check_period_hdr_id"];
            unset($arrValue);
        if ($ret_id == $ref_id) {
            //อัพเดท
            $sql2 = "UPDATE {$table} SET i_menu = 2 ,c_code= '{$c_code}', i_register_status =  {$i_product_type} ,sp_emp_id   = {$_SESSION['sp_emp_id']} WHERE {$keyName} = ?;";
            //update code
            $stmt2 = $db->QueryParam($sql2, array($data["sp_check_period_hdr_id"]));
             /*sp_status_hdr_id	c_code	c_name
                            4	ST0012	รอส่งมอบงาน
                            5	ST0013	รอตรวจรับพัสดุ/ครุภัณฑ์
                            9	ST0015	รอบันทึกใบเบิก
             */
             //*************RUN ITEMS EVENT & MENU*************************************************
            $f2 = $db->GetDataBySQL("select sp_check_period_hdr_id
                , (select sp_tor_id from dbo.sp_tor_contract where sp_tor_contract_id = sp_check_period_hdr.sp_tor_contract_id) as tor_id
		, sp_mn_contract_hdr_id
		, sp_tor_hdr_period_id
		, sp_tor_contract_id  
             from dbo.sp_check_period_hdr where sp_check_period_hdr_id = ?", array($ret_id));
            RunStatusPeriod(9,$f2["sp_tor_hdr_period_id"]);
            
            //*************RUN ITEMS EVENT & MENU*************************************************

//ค่าใช้จ่าย
           /*  */
            // $arrParam3 = $sqlMain3;
            $subSql = "select b.i_is_last, a.sp_tor_contract_id from dbo.sp_check_period_hdr a
                            inner join sp_tor_hdr_period b on b.sp_tor_hdr_period_id = a.sp_tor_hdr_period_id
                            where b.i_is_last = 1 and sp_check_period_hdr_id = ?";
            $f1 = $db->GetDataBySQL($subSql, array($ret_id));
            $i_last_period = $f1['i_is_last'];

            $stmt3 = $db->QueryParam(" EXEC dbo.SP_CHECKING_GL ?, ?, ?", array($data["sp_check_period_hdr_id"], $data['dc_user_create_id'], $data['dc_user_create_cost_id']));
            if ($i_last_period) {
                $stmt3 = $db->QueryParam(" EXEC dbo.SP_CHECKING_GL_LAST ?, ?, ?", array($data["sp_tor_contract_id"], $data['dc_user_create_id'], $data['dc_user_create_cost_id']));
            }
      
//แจ้งเตือน
            //step 1 get data convert(varchar, d_update, 120) as d_update
            if ($data['i_is_warranty'] == 1) {
                $f1 = $db->GetDataBySQL("select a.c_arrive_code
                                            , b.sp_po_id
                                            , CASE WHEN ISNULL(b.sp_po_id,0) > 0
                                                 THEN (select c_code from sp_po_hdr where sp_po_id=b.sp_po_id)
                                                 ELSE (select c_code from sp_tor_contract  where sp_tor_contract_id=b.sp_contract_id)
                                                 END AS c_contract_code
                                            , a.i_before
                                            , convert(varchar, a.d_warranty_date,120) as d_warranty_date
                                            from dbo.sp_check_period_hdr a
                                            inner join dbo.sp_mn_contract_hdr b on a.sp_mn_contract_hdr_id = b.sp_mn_contract_hdr_id
                                            where a.sp_check_period_hdr_id = ? ", array($ret_id));

                $ref_id = $ret_id;
                $c_name = $c_code;
                $c_detail = $f1['c_arrive_code'] . "/" . $f1['c_contract_code'] . " วันที่ " . $f1['d_warranty_date'];
                if ($f1['sp_po_id']) {
                    $i_is_po = 1;
                } else {
                    $i_is_po = 0;
                }
                $sqlInsert = "INSERT INTO dbo.sp_alert_queque (ref_id ,i_is_po,c_name ,c_detail ,i_is_start ,due_date ,i_before ,user_id ,sp_emp_id)
                              VALUES ($ref_id, ?,'$c_name', '$c_detail', 0, '{$f1['d_warranty_date']}', {$f1['i_before']}, " . ($_SESSION['user_id']) . ", " . ($_SESSION['sp_emp_id']) . " );";

                $stmt4 = $db->QueryParam($sqlInsert, array($i_is_po));
                
            } else { //แจ้งเตือน
                
            }
        } 
        break;
}

if ($stmt && $stmt2 && $stmt3 && $stmt4) {
//if (false) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว", "id" => $id);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ");
}

echo json_encode($re);
exit;
