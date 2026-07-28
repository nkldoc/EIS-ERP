<?php

include("../../../conf/config.php");
include("../../conf/configDc.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db   = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
$dirLog  = "../../../../_logs";
$mode    = $_POST["mode"];
$table   = "po_working_hdr";
$keyName = "po_working_hdr_id";

$uploaddir = $_REQUEST['url'] ?? null; // PATH_PO_WORKING_PDF โฟเดอร์อัพโหลด pdf


function mnDcMethod($p, $arrAddDc = array())
{
    global $db, $date, $util, $_SESSION;
    if (is_array($p)) {
        foreach ($arrAddDc as $k) {
            //override method 
            $addField   = null;
            $addValue   = null;
            $ff         = array();
            $tbl        = substr($k, 0, -3);
            if ($p["{$tbl}_id"] === $p["{$tbl}_name"] && ($p["{$tbl}_name"] !== "กรุณาเลือกคีย์เพิ่มหรือว่างไว้")) {
                $ff["c_name"]                                    = $p["{$k}"];
                $ff["c_comment"]                                = "เพิ่มจากหน้าคีย์ใบเบิกจาก ระบบจัดซื้อจัดจ้างพัสดุ";
                $ff["dc_user_update_id"]                        = $_SESSION["user_id"];
                $ff["dc_user_update_cost_id"]                    = $_SESSION["dc_cost_id"];
                $ff["d_update"]                                    = date("Y-m-d H:i:s");
                $ff["i_enable"]                                    = STATUS_ENABLE;
                $ff["i_delete"]                                    = DELETE_FALSE;
                $ff["dc_user_create_id"]                        = $_SESSION["user_id"];
                $ff["dc_user_create_cost_id"]                    = $_SESSION["dc_cost_id"];
                $ff["d_create"]                                    = date("Y-m-d H:i:s");

                foreach ($ff as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }

                $tbb = ($tbl === "po_creditor" || $tbl === "po_creditor_transfer") ? "po_creditor" : "po_emp";
                $po = $db->GetDataBySQL("SELECT * FROM NMU..{$tbb} WHERE i_enable = 1 AND i_delete = 2 AND c_name = ?;", array($p["{$tbl}_name"]));
                if (!$po) {
                    $sql = "
                        SET NOCOUNT ON
                        INSERT INTO NMU..{$tbb} (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                        SELECT @@IDENTITY as id;";

                    $stmt  = $db->QueryParam($sql, $arrValue);
                    $stmt5 = $stmt;

                    $ss_id = $db->Fetch($stmt);
                    $_POST["{$k}"] = $ss_id['id'];
                }
                $addField = null;
                $addValue = null;
                unset($datas);
                unset($arrValue);
            }
        }   //   foreach 
    }
}
$arrAddDc = array(
    'po_creditor_id', 'po_creditor_transfer_id', 'po_emp_id'
);

//Override 
mnDcMethod($_POST, $arrAddDc);
if ($_POST["po_creditor_transfer_id"] === $_POST["po_creditor_transfer_name"] && ($_POST["po_creditor_transfer_name"] !== "กรุณาเลือกคีย์เพิ่มหรือว่างไว้")) {
    $_POST["po_creditor_transfer_id"] = $_POST["po_creditor_id"];
}


$data             = $util->mnUser($_POST);
$data["i_delete"] = DELETE_FALSE;
$data["url"] = ($data["url"] == 'https://docs.google.com/document/pdrf/view?usp=sharing') ? NULL : $data["url"];
$data["c_invoice"] = ($data["c_invoice"] == 'ใบจากผู้ขาย/รับจ้าง') ? NULL : $data["c_invoice"];
//c_code_invoice

$stmt      = true;
$stmt2     = true;
$stmt3     = true;
$stmt4     = true;
$stmt5     = true;
$stmt6     = true;

$db->BeginTran();
        $fld = null;
        $val = null;
        $addField = null;
        $addValue = null;

$intVal = array(
//            'checking_id'
//                    , 'po_working_hdr_id'
//                    , 'po_working_dtl_id'
    'COST_user_id'
    , 'COST_cost_id'
    , 'i_is_parent'
    , 'i_parent_id'
    , 'i_product_type'
    , 'c_arrive_code'
    , 'c_code_ref'
    , 'i_budget_year'
    , 'i_budget_year_overlap'
    , 'dc_expense_budget_type_id'
    , 'bg_expense_id'
    , 'dc_cost_id'
    , 'po_creditor_id'
    , 'po_creditor_name'
    , 'po_creditor_transfer_id'
    , 'po_creditor_transfer_name'
    , 'c_qty'
    , 'f_total'
    , 'd_audit_date'
    , 'po_emp_id'
    , 'po_emp_name'
    , 'd_doc_date'
    , 'i_enable'
    , 'c_comment'
    //-----------------
    , 'url'
    , 'd_checking_date'
    , 'c_invoice'
    //-----------------
    , 'dc_user_create_id'
    , 'dc_user_create_cost_id'
    , 'd_create'
    , 'dc_user_update_id'
    , 'dc_user_update_cost_id'
    , 'd_update'
    , 'i_delete'
    , 'sp_tor_id'
    , 'i_type_bg'
    , 'sp_tor_contract_id'
    , 'sp_check_period_hdr_id'
);


if ($mode != "DELETE") {

    $data['f_total'] = str_replace(',', '', $data['f_total']);
    $data['d_receive_date'] = $data['d_receive_date'] == "" ? date('Y-m-d H:i:s') : $date->bc_to_ad($data['d_receive_date']) . " 23:59:59";

    $data['d_checking_date'] = $date->bc_to_ad($data['d_checking_date']);
    $data['d_doc_date'] = $date->bc_to_ad($data['d_doc_date']) . " 23:59:59";
}
//print_r($data);
//exit();
switch ($mode) {
    case "GENCODE":
        print_r($_REQUEST);
        exit();
        break;
        case "ADD":
            // print_r($_REQUEST);
            // exit();
        foreach ($data as $fld => $value) {
            if (in_array($fld, $intVal)) {
                $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ",
                    ? /*{$fld}*/";            }
        }

        $sql = "INSERT INTO dbo.sp_withdraw (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;   
                "
                
                ."  INSERT INTO dbo.sp_tor_item (tor_id,sp_withdraw_id,sp_status_hdr_id,act_date_dt,act_cost_id,act_user_id,d_tor_status_date)
                    VALUES(?,@@IDENTITY,9,GETDATE(),?,?,CONVERT(Date, GETDATE())
                    )
                ";
    //    print_r($data);
    //    echo "\n";
    //    echo $sql . "\n";
    //    print_r($arrValue);
    //    exit();

        // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        /********************/

        $arrValue[] =   $_REQUEST['sp_tor_id'];
        $arrValue[] =   $_REQUEST['COST_cost_id'];
        $arrValue[] =   $_REQUEST['COST_user_id'];

//
        $stmt = $db->QueryParam($sql, $arrValue);
        $ss_id = $db->Fetch($stmt);
        $id = $ss_id["id"]??null;
//=================================
        $data['c_request_code'] = $data['c_code_ref'];
        $data['dc_user_update_id_request'] = $data['user_id'];
        $data['dc_user_update_cost_id_request'] = $data['dc_cost_id'];
        $data['d_request_date'] = $data['d_doc_date'];
        $data['d_update_request'] = $data['d_doc_date'];
        //
        $arrValue2 = array();
        $arrValue2[] = $data['c_request_code'];
        $arrValue2[] = $data['d_request_date'];
        $arrValue2[] = $data['dc_user_update_id_request'];
        $arrValue2[] = $data['dc_user_update_cost_id_request'];
        $arrValue2[] = $data['d_update_request'];
        $arrValue2[] = $data['sp_gl_monthly_hdr_id'];

        $sql2 = "update dbo.sp_gl_monthly_dtl set"
                . " c_request_code = ? "
                . " , d_request_date = ? "
                . " , dc_user_update_id_request = ? "
                . " , dc_user_update_cost_id_request = ? "
                . " , d_update_request = ? "
                . " where sp_gl_monthly_hdr_id=?"; 
        $stmt2 = $db->QueryParam($sql2, $arrValue2);
        $ss_id2 = $db->Fetch($stmt2);
        
        
        // $arrParam = array();
        // $data["dc_user_update_id"] = $_SESSION["user_id"];
        // $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        // $data["d_update"] = date("Y-m-d H:i:s");
    
    
        // $arrParam[] = 3;  //i_status_checking (null or 0 arrive_code) วางบิล / 1 ตรวจรับ / 2 ยกเลิก / 3 ทำรายการเบิก(update D0xxx / 4 ส่งเบิก
        
        // $arrParam[] = $data["dc_user_update_id"];
        // $arrParam[] = $data["dc_user_update_cost_id"];
        // $arrParam[] = $data["d_update"];
        // $arrParam[] = $data["sp_check_period_hdr_id"];

        // $sql = " UPDATE dbo.sp_check_period_hdr set " 
        //         . " i_status_checking = ? ,"
        //         . " dc_user_update_id = ? ,"
        //         . " dc_user_update_cost_id = ? ,"
        //         . " d_update = ? "
        //         . " where sp_check_period_hdr_id = ?";
    
        // $stmt = $db->QueryParam($sql, $arrParam);

        break;
    case "UPDATE":
        //is not update method sent


        $fcheck = array("id"
            , "mode"
            , "dc_expense_budget_type_idTxt"
            , "txti_parentID"
            , "po_working_hdr_id"
            , "sp_gl_monthly_hdr_id"
            , 'd_checking_date'
            , "c_checking_code"
            , "dc_cost_ref_id"
            , "po_working_dtl_id"
            , "i_budget_year_overlapTxt"
            , "i_budget_yearTxt"
            , "user_id"
            , "po_working_hdr_id"
            , "isUpload"
            , 'sp_tor_id'
            , 'i_type_bg'
            , 'sp_tor_contract_id'
            , 'sp_check_period_hdr_id'
        );

        foreach ($data as $k => $v) {
            if (!in_array($k, $fcheck)) {
                $fld .= ", {$k} = '{$v}' " . "\n";
            }
        }
        //update d_receive_date

//        print_r($data);
//        exit();
        $sql1 = "UPDATE dbo.sp_withdraw SET " . substr($fld, 1) . " WHERE  sp_tor_id=?";
        $stmt = $db->QueryParam($sql1, array($data['sp_tor_id']));
        //update d_receive_date
        // $sql3 = "UPDATE dbo.sp_check_period_hdr SET d_receive_date=? WHERE  sp_check_period_hdr_id=?";
        // $stm3 = $db->QueryParam($sql3, array($data['d_receive_date'], $data['sp_check_period_hdr_id']));
        // $id = $data['checking_id'];
        // $arrParam[] = $data["pr_code"];

//         $data['c_request_code'] = $data['c_code_ref'];
//         $data['dc_user_update_id_request'] = $data['user_id'];
//         $data['dc_user_update_cost_id_request'] = $data['dc_cost_id'];
//         $data['d_request_date'] = $data['d_doc_date'];
//         $data['d_update_request'] = $data['d_doc_date'];
//         //
//         $arrValue2 = array();
//         $arrValue2[] = $data['c_request_code'];
//         $arrValue2[] = $data['d_request_date'];
//         $arrValue2[] = $data['dc_user_update_id_request'];
//         $arrValue2[] = $data['dc_user_update_cost_id_request'];
//         $arrValue2[] = $data['d_update_request'];
//         $arrValue2[] = $data['sp_gl_monthly_hdr_id'];

//         $sql2 = "update dbo.sp_gl_monthly_dtl set"
//                 . " c_request_code = ? "
//                 . " , d_request_date = ? "
//                 . " , dc_user_update_id_request = ? "
//                 . " , dc_user_update_cost_id_request = ? "
//                 . " , d_update_request = ? "
//                 . " where sp_gl_monthly_hdr_id=?";
// //        echo $sql2;
// //        print_r($arrValue2);
// //        exit();
//         $stmt2 = $db->QueryParam($sql2, $arrValue2);
//         $ss_id2 = $db->Fetch($stmt2);

        break;
    case "DELETE":

        $sql = "DECLARE @idx as bigint; SET @idx = ?;
                DELETE FROM dbo.sp_withdraw where checking_id =@idx; ";

//        print_r($data);
//        echo "\n";
//        exit();
        $stmt = $db->QueryParam($sql, array($data['checking_id']));
        $id = $data['checking_id'];
        break;
    case "DISABLED":

        $sql = "DECLARE @idx as bigint; SET @idx = ?;
                DELETE FROM dbo.sp_withdraw  where checking_id =@idx; ";

//        print_r($data);
//        echo "\n";
//        exit();
        $stmt = $db->QueryParam($sql, array($data['checking_id']));
        $id = $data['checking_id'];
        break;
}

if ($stmt && $stmt2) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว", 'id' => 0);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}
echo json_encode($re);
exit;
