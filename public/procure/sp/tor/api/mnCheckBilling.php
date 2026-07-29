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
$c_code_gen = "BL"; //contract sign
$re_id = null;
$stmt2 = true;
$stmt3 = true;
$stmt4 = true;

$db->BeginTran();

$id = $_REQUEST["sp_check_period_hdr_id"] ?? null;

function RunStatusPeriod($period_status = null, $period_id = null) {
    global $db;

    /* sp_status_hdr_id	c_code	c_name
      4	ST0012	ส่งมอบงาน
      5	ST0013	ตรวจรับพัสดุ/ครุภัณฑ์
      9	ST0015	บันทึกใบเบิก **** */

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
    return $db->QueryParam($sql, $arrParam);
    ;
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

//Preparing

switch ($mode) {
    case "GOTOWITHDRAW":
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["id"];
        $sql = "UPDATE dbo.sp_check_period_hdr "
                . " SET i_status_billing = 4 "
                . ", dc_user_update_id = ?"
                . ", dc_user_update_cost_id = ?"
                . ", d_update = ?"
                . " WHERE sp_check_period_hdr_id = ?;";
//        echo $sql;
//        print_r($arrParam);
//        exit();
        $stmt = $db->QueryParam($sql, $arrParam);
        break;
    case "GENCODEBILLING":

//        print_r($data);
//        exit();
        $data['dc_user_create_cost_id'] = $_SESSION['dc_cost_id'];
        $data['dc_user_create_id'] = $_SESSION['user_id'];
        $ret_id = $data["sp_check_period_hdr_id"] ?? null;
        $code_dc = (string) $c_code_gen;
        $sql = "EXEC dbo.SP_GEN_CODE ?,?,?,?,?;";
        $arrParam = array($code_dc, date("Ym"), $data['dc_user_create_id'], $data['dc_user_create_cost_id'], $ret_id);

        $stmt = $db->QueryParam($sql, $arrParam);
        $arr_gen_code = $db->Fetch($stmt);
        $c_code = $arr_gen_code["c_code_gen"];
        $ref_id = $arr_gen_code["reference_id"];

        if ($ret_id == $ref_id) {
            //อัพเดท
            
            $sql2 = "UPDATE dbo.sp_check_billing_items"
                    . " SET c_code = '{$c_code}' "
                    . ", dc_user_update_id =?"
                    . ", dc_user_update_cost_id =?"
                    . ", d_update =?"
                    . " WHERE sp_check_period_hdr_id = ?;";
//                    echo $sql2;
//                    print_r($data);
//                    exit();
//    
            $stmt2 = $db->QueryParam($sql2, array($data["dc_user_update_id"], $data["dc_user_update_cost_id"], $data["d_update"], $ret_id));
            

        }
        break;
    case "GOTO_WITHDRAW4":
        
//        //                    echo $sql2;
//                    print_r($data);
//                    exit();
        
        
            $arrParam3[] = $data["dc_user_update_id"];
            $arrParam3[] = $data["dc_user_update_cost_id"];
            $arrParam3[] = $data["d_update"];
            $arrParam3[] = $data["sp_check_period_hdr_id"];
            $sql3 = " UPDATE dbo.sp_check_period_hdr "
                    . " SET i_status_billing = 4 "
                    . ", dc_user_update_id = ?"
                    . ", dc_user_update_cost_id = ?"
                    . ", d_update = ?"
                    . " WHERE sp_check_period_hdr_id = ?;";    
            $stmt = $db->QueryParam($sql3, $arrParam3);
        break;
    case "GOTO_BILLING":

        $arr = json_decode($data['datas']);
        $f1 = $arr[0]->data;

        $f2 = $db->GetDataBySQL("SELECT b.sp_check_billing_dtl_id
                    ,b.sp_check_billing_hdr_id
                    ,b.sp_check_period_hdr_id 
                    ,a.sp_check_billing_hdr_id
                    ,a.sp_bg_billing_dtl_id
                    ,a.c_name
                    ,a.c_code
                    ,a.c_inv_name
                    ,a.c_inv_address
                    ,a.sp_emp_id
                    ,a.dc_creditor_id,a.dc_cost_id,a.dc_user_create_id,a.dc_user_create_cost_id
                    ,a.d_create,a.dc_user_update_id,a.dc_user_update_cost_id,a.d_update
                            FROM dbo.sp_check_billing_hdr a
                            inner join dbo.sp_check_billing_dtl b on b.sp_check_billing_hdr_id=a.sp_check_billing_hdr_id
                    where a.sp_check_billing_hdr_id = ?", array($f1->id));

        if ($f2['sp_check_billing_hdr_id'] > 0) {
//            echo "Update"; 
            $arrParam[] = $data["sp_bg_billing_dtl_idTxt"];
            $arrParam[] = $data["c_doc_ref"];
            $arrParam[] = $data["c_comment"];
            $arrParam[] = null; //$data["url_link_doc"]; 
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["id"];
            $sql = "UPDATE dbo.sp_check_billing_hdr "
                    . " SET c_name = ? "
                    . ", c_doc_ref = ? "
                    . ", c_comment = ? "
                    . ", url_link_doc= ? "
                    . ", dc_user_update_id = ?"
                    . ", dc_user_update_cost_id = ?"
                    . ", d_update = ?"
                    . " WHERE sp_check_period_hdr_id = ?;";
//    echo $sql;        
//    print_r($arrParam);
//    exit();
        } else {
            $arrParam[] = $f1->sp_bg_billing_dtl_id;
            $arrParam[] = $f1->c_name;
            $arrParam[] = $data["inv_name"];
            $arrParam[] = $data["c_address"];
            $arrParam[] = $data["ar_no"];
            $arrParam[] = $f1->sp_emp_id;
            $arrParam[] = $data['dc_creditor_id'];
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $sql = " INSERT INTO dbo.sp_check_billing_hdr ( sp_bg_billing_dtl_id	
                        , c_name 
                        , c_inv_name
                        , c_inv_address	
                        , ar_no	
                        , sp_emp_id"
                    . " , dc_creditor_id"
                    . ", dc_user_create_id"
                    . ", dc_user_create_cost_id"
                    . ", d_create"
                    . ", dc_user_update_id"
                    . ", dc_user_update_cost_id"
                    . ", d_update) values (?,?,?,?,?,?,? ,?,?,?,?,?,?); SELECT @@IDENTITY as id;";
            $stmt = $db->QueryParam($sql, $arrParam);
            $ss_id = $db->GetDataBySQL("SELECT @@IDENTITY as id", array());
            $arrParam2[] = $ss_id;
            $arrParam2[] = $f1->id;

            $arrParam2[] = $data["dc_user_update_id"];
            $arrParam2[] = $data["dc_user_update_cost_id"];
            $arrParam2[] = $data["d_update"];

            $arrParam2[] = $data["dc_user_update_id"];
            $arrParam2[] = $data["dc_user_update_cost_id"];
            $arrParam2[] = $data["d_update"];

            $sql2 = " INSERT INTO dbo.sp_check_billing_dtl (sp_check_billing_hdr_id"
                    . ", sp_check_period_hdr_id"
                    . ", dc_user_create_id"
                    . ", dc_user_create_cost_id"
                    . ", d_create"
                    . ", dc_user_update_id"
                    . ", dc_user_update_cost_id"
                    . ", d_update"
                    . ") values (?,? ,?,?,?,?,?,?);";

            $stmt2 = $db->QueryParam($sql2, $arrParam2);
        }
        //UPDATE CHECKING
        $arrParam3[] = 3;
        $arrParam3[] = $data["dc_user_update_id"];
        $arrParam3[] = $data["dc_user_update_cost_id"];
        $arrParam3[] = $data["d_update"];
        $arrParam3[] = $f1->id;

        $sql3 = "UPDATE dbo.sp_check_period_hdr "
                . " SET i_status_billing = ? "
                . ", dc_user_update_id = ?"
                . ", dc_user_update_cost_id = ?"
                . ", d_update = ?"
                . " WHERE sp_check_period_hdr_id = ?;";
        $stmt3 = $db->QueryParam($sql3, $arrParam3);

        break;
    case "GOTO_WAIT_BILLING":

        $arrParam[] = 2;
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["sp_check_period_hdr_id"];
        $sql = "UPDATE dbo.sp_check_period_hdr "
                . " SET i_status_billing = ? "
                . ", dc_user_update_id = ?"
                . ", dc_user_update_cost_id = ?"
                . ", d_update = ?"
                . " WHERE sp_check_period_hdr_id = ?;";

        $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "UPDATE_PRE_BILLING":

        $data['d_post_billing_date'] = !empty($data['d_doc_arrive_dt']) ? $date->bc_to_ad($data['d_doc_arrive_dt']) : null;
        $data['d_reg_billing_date'] = !empty($data['d_billing_date']) ? $date->bc_to_ad($data['d_billing_date']) : null;

        $f2 = $db->GetDataBySQL("SELECT a.sp_tor_hdr_period_id
                            , a.dc_cost_id
                            , isnull(a.dc_creditor_id,b.dc_creditor_id) as dc_creditor_id 
                            , a.i_joint_venture
                            , a.c_contract_code
                            , b.sp_tor_contract_id
                            , b.c_code 
                            , c.sp_check_period_hdr_id
                            , c.sp_bg_billing_dtl_id
                            FROM dbo.sp_tor_hdr_period a
                            inner join dbo.sp_tor_contract b on b.sp_tor_contract_id=a.sp_tor_contract_id
                            inner join dbo.sp_check_period_hdr c on c.sp_tor_hdr_period_id=a.sp_tor_hdr_period_id
                        where sp_check_period_hdr_id = ?", array($data['id']));

        if ($f2['sp_bg_billing_dtl_id'] > 0) {
//            echo "Update"; 
            $arrParam[] = $data["sp_bg_billing_dtl_idTxt"];
            $arrParam[] = $data["c_doc_ref"];
            $arrParam[] = $data["c_comment"];
            $arrParam[] = null; //$data["url_link_doc"]; 
            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $arrParam[] = $data["id"];
            $sql = "UPDATE dbo.sp_check_billing_items "
                    . " SET c_name = ? "
                    . ", c_doc_ref = ? "
                    . ", c_comment = ? "
                    . ", url_link_doc= ? "
                    . ", dc_user_update_id = ?"
                    . ", dc_user_update_cost_id = ?"
                    . ", d_update = ?"
                    . " WHERE sp_check_period_hdr_id = ?;";
//    echo $sql;        
//    print_r($arrParam);
//    exit();
        } else {
//            echo "Insert";
            $arrParam[] = $data["id"];
            $arrParam[] = $data["sp_bg_billing_dtl_id"];
            $arrParam[] = $data["sp_bg_billing_dtl_idTxt"];
            $arrParam[] = $data["c_doc_ref"];
            $arrParam[] = $data["c_comment"];
            $arrParam[] = null; //$data["url_link_doc"];
            $arrParam[] = $f2["dc_creditor_id"];
            $arrParam[] = $f2["dc_cost_id"];

            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];

            $arrParam[] = $data["dc_user_update_id"];
            $arrParam[] = $data["dc_user_update_cost_id"];
            $arrParam[] = $data["d_update"];
            $sql = " INSERT INTO dbo.sp_check_billing_items ("
                    . " sp_check_period_hdr_id"
                    . ", sp_bg_billing_dtl_id"
                    . ", c_name"
                    . ", c_doc_ref"
                    . ", c_comment"
                    . ", url_link_doc"
                    . ", dc_creditor_id"
                    . ", dc_cost_id"
                    . ", dc_user_create_id"
                    . ", dc_user_create_cost_id"
                    . ", d_create"
                    . ", dc_user_update_id"
                    . ", dc_user_update_cost_id"
                    . ", d_update) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?);";
        }
//        echo $sql;
//        print_r($arrParam);
//        exit();
        $stmt = $db->QueryParam($sql, $arrParam);

        $sql2 = "UPDATE dbo.sp_check_period_hdr"
                . " SET sp_bg_billing_dtl_id= ? "
                . ", d_post_billing_date= ?"
                . ", d_reg_billing_date= ?"
                . ", dc_user_update_id= ?"
                . ", dc_user_update_cost_id= ?"
                . ", d_update= ?"
                . " WHERE sp_check_period_hdr_id = ?;";
        $stmt2 = $db->QueryParam($sql2, array(
            $data['sp_bg_billing_dtl_id']
            , $data['d_post_billing_date']
            , $data['d_reg_billing_date']
            , $data["dc_user_update_id"]
            , $data["dc_user_update_cost_id"]
            , $data["d_update"]
            , $data["id"]));
        $id = $data["id"];
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
