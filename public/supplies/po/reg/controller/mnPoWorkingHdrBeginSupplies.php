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
$db->BeginTran();
$uploaddir = $_REQUEST['url'] ?? null; // PATH_PO_WORKING_PDF โฟเดอร์อัพโหลด pdf


$po_creditor_data = $db->GetDataBySQL(
    "SELECT 
        (SELECT TOP 1 po_creditor_id FROM NMU.dbo.po_creditor WHERE i_enable = 1 AND i_delete = 2 AND c_name = (SELECT TOP 1 c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = ?)) AS po_creditor_id
        ,(SELECT TOP 1 c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = ?) AS po_creditor_name
        ,(SELECT TOP 1 po_creditor_id FROM NMU.dbo.po_creditor WHERE i_enable = 1 AND i_delete = 2 AND c_name = (SELECT TOP 1 c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = ?)) AS po_creditor_transfer_id
        ,(SELECT TOP 1 c_name FROM NMU.dbo.dc_creditor WHERE dc_creditor_id = ?) AS po_creditor_transfer_name
    ",
    array(
        $_POST["dc_creditor_id"]
        , $_POST["dc_creditor_id"]
        , $_POST["dc_creditor_transfer_id"]
        , $_POST["dc_creditor_transfer_id"]
    )
);

$_POST["po_creditor_id"] = $po_creditor_data["po_creditor_id"] > 0 ? $po_creditor_data["po_creditor_id"] : $po_creditor_data["po_creditor_name"];
$_POST["po_creditor_transfer_id"] =  $po_creditor_data["po_creditor_transfer_id"] > 0 ? $po_creditor_data["po_creditor_transfer_id"] : $po_creditor_data["po_creditor_transfer_name"];
$_POST["po_creditor_name"] =   $po_creditor_data["po_creditor_name"];
$_POST["po_creditor_transfer_name"] =  $po_creditor_data["po_creditor_transfer_name"];
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
$data["c_code_invoice"] = ($data["c_code_invoice"] == 'ใบจากผู้ขาย/รับจ้าง') ? NULL : $data["c_code_invoice"];
//c_code_invoice

$stmt      = true;
$stmt2     = true;
$stmt3     = true;
$stmt4     = true;
$stmt5     = true;
$stmt6     = true;

        $fld = null;
        $val = null;
        $addField = null;
        $addValue = null;

$intVal = array(
    'COST_user_id'
    , 'COST_cost_id'
    , 'sp_check_period_hdr_id'
    , 'sp_tor_contract_id'
    , 'c_contract_code'
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
    , 'c_code_invoice'
    //-----------------
    , 'dc_user_create_id'
    , 'dc_user_create_cost_id'
    , 'd_create'
    , 'dc_user_update_id'
    , 'dc_user_update_cost_id'
    , 'd_update'
    , 'i_delete'
    , 'dc_creditor_id'
    , 'dc_creditor_transfer_id'
    , 'dc_bank_acc_creditor_id'
);
if ($mode != "DELETE") {

    $data['f_total'] = str_replace(',', '', $data['f_total']);
    $data['d_receive_date'] =  date('Y-m-d H:i:s') ; //$data['d_receive_date'] == "" ? date('Y-m-d H:i:s') : $date->bc_to_ad($data['d_receive_date']) . " 23:59:59";

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
            $sql_code_ref = "SELECT COUNT(a.po_working_hdr_id) 
                    FROM NMU.dbo.po_working_hdr a
                    INNER JOIN NMU.dbo.po_working_dtl b ON a.po_working_hdr_id =  b.po_working_hdr_id
                    WHERE a.i_enable = 1 
                        AND b.c_code = ?";
                $c_code_ref_num = $db->GetDataBySQL($sql_code_ref, array($_REQUEST["c_code_ref"]));
                if ($c_code_ref_num > 0) {
                    $re = array("reval" => 1, "success" => "Error", "msg" => "มีเลขที่ใบขอเบิก " . $_REQUEST['c_code_ref'] . " ในระบบแล้ว<br>กรุณาทำรายการใหม่อีกครั้ง");
                    echo json_encode($re);
                    exit;
                }
                
            $c_code_invoice_arr = preg_split('/\s*,\s*/', $data["c_code_invoice"]);
            $Msg_invoice = '';
            foreach ($c_code_invoice_arr as $c_code_invoice) {
                $sql_invoice = "SELECT 
                            COUNT(*) AS c_code_invoice_num  
                        FROM NMU.dbo.po_working_dtl a 
                        INNER JOIN NMU.dbo.po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id AND i_enable = 1 
                        WHERE a.c_code_invoice is not null and a.c_code_invoice != '' and a.c_code_invoice != '-' 
                            and  po_creditor_id = ?
                            and (
                                a.c_code_invoice = '{$c_code_invoice}'
                                or a.c_code_invoice like '{$c_code_invoice},%'
                                or a.c_code_invoice like '{$c_code_invoice} ,%'

                                or a.c_code_invoice like '%,{$c_code_invoice}%'
                                or a.c_code_invoice like '%, {$c_code_invoice}%'
                            )";


                $c_code_invoice_num = $db->GetDataBySQL($sql_invoice, array($data["po_creditor_id"]));
                if ($c_code_invoice_num > 0) {
                    $Msg_invoice .= 'มีใบแจ้งหนี้ ' . $c_code_invoice . ' ในระบบแล้ว<br>';
                }
            }
            if ($Msg_invoice != '') {
                $re = array("reval" => 1, "success" => "false", "msg" => $Msg_invoice . "กรุณาทำรายการใหม่อีกครั้ง");
                echo json_encode($re);
                exit;
            }
        // foreach ($data as $fld => $value) {
        //     if (in_array($fld, $intVal)) {
        //         $arrValue[] = ($value != "") ? $value : null;
        //             $addField .= ", {$fld}";
        //             $addValue .= ", ?";
        //     }
        // }
        // $sql = "INSERT INTO dbo.sp_withdraw (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
        //         SELECT @@IDENTITY as id;";
        //         echo($sql);
        // $stmt = $db->QueryParam($sql, $arrValue);
        // $ss_id = $db->Fetch($stmt);
        if ($data["i_is_parent"] == 1 ){
            $datas["COST_user_id"]                      = $data["COST_user_id"];
            $datas["COST_cost_id"]			            = $data["COST_cost_id"];
            $datas["sp_check_period_hdr_id"]            = $data["sp_check_period_hdr_id"];
            $datas["sp_tor_contract_id"]				= $data["sp_tor_contract_id"];
            $datas["c_contract_code"]					= $data["c_contract_code"];
            $datas["i_is_parent"]						= $data["i_is_parent"];
            $datas["i_parent_id"]						= $data["i_parent_id"];
    
            $datas["i_product_type"]					= $data["i_product_type"];
            $datas["c_arrive_code"]						= $data["c_arrive_code"];
            $datas["c_code_ref"]				        = $data["c_code_ref"];
            $datas["i_budget_year"]		                = $data["i_budget_year"];
            $datas["i_budget_year_overlap"]				= $data["i_budget_year_overlap"];
            $datas["dc_expense_budget_type_id"]			= $data["dc_expense_budget_type_id"];
            $datas["bg_expense_id"]		                = $data["bg_expense_id"];
            $datas["dc_cost_id"]						= $data["dc_cost_id"];
            $datas["po_creditor_id"]                    = $data["po_creditor_id"];
            $datas["po_creditor_name"]				    = $data["po_creditor_name"];
            $datas["po_creditor_transfer_id"]			= $data["po_creditor_transfer_id"];
            $datas["po_creditor_transfer_name"]			= $data["po_creditor_transfer_name"];
            $datas["c_qty"]						        = $data["c_qty"];
            $datas["f_total"]						    = $data["f_total"];
            $datas["d_audit_date"]						= $data["d_checking_date"];
            $datas["po_emp_id"]						    = $data["po_emp_id"];
            $datas["po_emp_name"]						= $data["po_emp_name"];
            $datas["d_doc_date"]				        = $data["d_doc_date"];
            $datas["i_enable"]		                    = $data["i_enable"];
            $datas["c_comment"]						    = $data["c_comment"];
            $datas["url"]				                = $data["url"];
            $datas["d_checking_date"]		            = $data["d_checking_date"];
            $datas["c_invoice"]				            = $data["c_code_invoice"];
            $datas["c_overlap"]				            = $data["c_overlap"];
            $datas["dc_user_create_id"]				    = $data["dc_user_create_id"];
            $datas["dc_user_create_cost_id"]		    = $data["dc_user_create_cost_id"];
            $datas["d_create"]				            = $data["d_create"];
            $datas["dc_user_update_id"]				    = $data["dc_user_update_id"];
            $datas["dc_user_update_cost_id"]		    = $data["dc_user_update_cost_id"];
            $datas["d_update"]				            = $data["d_update"];
            $datas["i_delete"]				            = $data["i_delete"];
            $datas["dc_creditor_id"]		            = $data["dc_creditor_id"];
            $datas["dc_creditor_transfer_id"]			= $data["dc_creditor_transfer_id"];
            $datas["dc_bank_acc_creditor_id"]			= $data["dc_bank_acc_creditor_id"];
        } else {
            $datas["COST_user_id"]                      = $data["COST_user_id"];
            $datas["COST_cost_id"]			            = $data["COST_cost_id"];
            $datas["sp_check_period_hdr_id"]            = $data["sp_check_period_hdr_id"];
            $datas["sp_tor_contract_id"]				= $data["sp_tor_contract_id"];
            $datas["c_contract_code"]					= $data["c_contract_code"];
            $datas["i_is_parent"]						= $data["i_is_parent"];
            $datas["i_parent_id"]						= $data["i_parent_id"];
    
            $datas["i_product_type"]					= $data["i_product_type"];
            $datas["c_arrive_code"]						= $data["c_arrive_code"];
            $datas["c_code_ref"]				        = $data["c_code_ref"];
            $datas["i_budget_year"]		                = $data["i_budget_year"];
            $datas["i_budget_year_overlap"]				= $data["i_budget_year_overlap"];
            $datas["dc_expense_budget_type_id"]			= $data["dc_expense_budget_type_id"];
            $datas["bg_expense_id"]		                = $data["bg_expense_id"];
            $datas["dc_cost_id"]						= $data["dc_cost_id"];
            $datas["po_creditor_id"]                    = $data["po_creditor_id"];
            $datas["po_creditor_name"]				    = $data["po_creditor_name"];
            $datas["po_creditor_transfer_id"]			= $data["po_creditor_transfer_id"];
            $datas["po_creditor_transfer_name"]			= $data["po_creditor_transfer_name"];
            $datas["c_qty"]						        = $data["c_qty"];
            $datas["f_total"]						    = $data["f_total"];
            $datas["d_audit_date"]						= $data["d_checking_date"];
            $datas["po_emp_id"]						    = $data["po_emp_id"];
            $datas["po_emp_name"]						= $data["po_emp_name"];
            $datas["d_doc_date"]				        = $data["d_doc_date"];
            $datas["i_enable"]		                    = $data["i_enable"];
            $datas["c_comment"]						    = $data["c_comment"];
            $datas["url"]				                = $data["url"];
            $datas["d_checking_date"]		            = $data["d_checking_date"];
            $datas["c_invoice"]				            = $data["c_code_invoice"];
            $datas["c_overlap"]				            = $data["c_overlap"];
            $datas["dc_user_create_id"]				    = $data["dc_user_create_id"];
            $datas["dc_user_create_cost_id"]		    = $data["dc_user_create_cost_id"];
            $datas["d_create"]				            = $data["d_create"];
            $datas["dc_user_update_id"]				    = $data["dc_user_update_id"];
            $datas["dc_user_update_cost_id"]		    = $data["dc_user_update_cost_id"];
            $datas["d_update"]				            = $data["d_update"];
            $datas["i_delete"]				            = $data["i_delete"];
            $datas["dc_creditor_id"]		            = $data["dc_creditor_id"];
            $datas["dc_creditor_transfer_id"]			= $data["dc_creditor_transfer_id"];
            $datas["dc_bank_acc_creditor_id"]			= $data["dc_bank_acc_creditor_id"];  
        }
        
        foreach ($datas as $fld => $value) {
            $arrValue[]	= ($value != "") ? $value : null;
            $addField	.= ", {$fld}";
            $addValue	.= ", ?";
        }
        // echo($data["dc_creditor_id"]);
        // print_r($arrValue);
        // exit;
        $sql	= "INSERT INTO dbo.sp_withdraw (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ")
        SELECT @@IDENTITY as id
        ;";
        $stmt = $db->QueryParam($sql, $arrValue);
        $ss_id = $db->Fetch($stmt);
        // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        // /********************/
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
        
        $arrParam = array();
        $data["dc_user_update_id"] = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $data["d_update"] = date("Y-m-d H:i:s");
    
        
        $arrParam[] = $data["sp_check_period_hdr_id"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["i_status_billing"];  //i_status_checking (null or 0 arrive_code) วางบิล / 1 ตรวจรับ / 2 ยกเลิก / 4 วางบิลแล้ว / 5 สร้างรายการ wi (update D0xxx / 6 ส่งเบิก

        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_inv"]));
        $arrParam[] =  $data['check_vat']??null;
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_vat"])); 
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_vat_rate"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_inv_vat"]));
        $arrParam[] =  $data["check_tax_personal"]??null;
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_tax_personal"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_tax_personal_rate"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_social_security"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_prov_fund"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_fine"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_warranty"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_other"]));
        $arrParam[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_pay"]));
        // print_r($arrParam);
        // exit;
        // $arrParam[] = $data["sp_check_period_hdr_id"];
        $sql4 = "DECLARE @sp_check_period_hdr_id bigint = ?;
                    UPDATE dbo.sp_check_period_hdr SET " 
                    . " dc_user_update_id = ? ,"
                    . " dc_user_update_cost_id = ? ,"
                    . " d_update = ? ,"
                    . " i_status_billing = ? "
                . " where sp_check_period_hdr_id =  @sp_check_period_hdr_id ; "

                . " UPDATE dbo.sp_check_billing_items SET "
                . "   f_per_inv = ? "
                . " , check_vat = ? "
                . " , f_per_vat = ? "
                . " , f_per_vat_rate = ? "
                . " , f_per_inv_vat = ? "
                . " , check_tax_personal = ? "
                . " , f_per_tax_personal = ? "
                . " , f_per_tax_personal_rate = ? "
                . " , f_per_social_security = ? "
                . " , f_per_prov_fund = ? "
                . " , f_per_fine = ? "
                . " , f_per_warranty = ? "
                . " , f_per_other = ? "
                . " , f_per_pay = ? "
                . " where sp_check_period_hdr_id = @sp_check_period_hdr_id"; 
                ;
        $stmt3 = $db->QueryParam($sql4, $arrParam);
        // // /******echo sql******/
        // $sql = (@$sqlMain) ? $sqlMain : $sql;
        // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
        
        // $sql = str_replace('?', '#-#', $sql);
        // foreach ($arr as $fld => $value) {
        // $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        // }
        // echo $sql; exit;
        // /********************/
        break;
    case "UPDATE":
        //is not update method sent
        $arrParam   = array();
        $arrParam[] = $data["c_code_ref"];
        $arrParam[] = $data["i_budget_year"];
        $arrParam[] = $data["i_budget_year_overlap"];
        $arrParam[] = $data["dc_expense_budget_type_id"];
        $arrParam[] = $data["bg_expense_id"];
        $arrParam[] = $data["dc_cost_id"];
        $arrParam[] = $data["url"];
        $arrParam[] = $data["c_code_invoice"];
        $arrParam[] = $data["po_creditor_id"];
        $arrParam[] = $data["po_creditor_name"];
        $arrParam[] = $data["po_creditor_transfer_id"];
        $arrParam[] = $data["po_creditor_transfer_name"];
        $arrParam[] = $data["dc_creditor_id"];
        $arrParam[] = $data["dc_creditor_transfer_id"];
        $arrParam[] = $data["dc_bank_acc_creditor_id"];
        $arrParam[] = $data["c_qty"];
        $arrParam[] = $data["f_total"];
        $arrParam[] = $data["d_checking_date"];
        $arrParam[] = $data["d_doc_date"];
        $arrParam[] = $data["po_emp_id"];
        $arrParam[] = $data["po_emp_name"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["id"];

        $sql1 = "SET NOCOUNT ON   UPDATE dbo.sp_withdraw SET   
            c_code_ref                              = ?
            , i_budget_year                         = ?
            , i_budget_year_overlap                 = ?
            , dc_expense_budget_type_id             = ? 
            , bg_expense_id                         = ?
            , dc_cost_id                            = ?
            , url                                   = ? 
            , c_invoice                             = ?
            , po_creditor_id                        = ?
            , po_creditor_name                      = ? 
            , po_creditor_transfer_id               = ? 
            , po_creditor_transfer_name             = ?
            , dc_creditor_id                        = ?
            , dc_creditor_transfer_id               = ?
            , dc_bank_acc_creditor_id               = ? 
            , c_qty                                 = ?
            , f_total                               = ?
            , d_checking_date                       = ?
            , d_doc_date                            = ?
            , po_emp_id                             = ?
            , po_emp_name                           = ?
            , c_comment                             = ?
        WHERE  checking_id = ?
        ";
        $stmt = $db->QueryParam($sql1, $arrParam);
        // $fcheck = array("id"
        //     , "mode"
        //     , "dc_expense_budget_type_idTxt"
        //     , "txti_parentID"
        //     , "checking_id"
        //     , "po_working_hdr_id"
        //     , "sp_gl_monthly_hdr_id"
        //     , "c_checking_code"
        //     , "dc_cost_ref_id"
        //     , "po_working_dtl_id"
        //     , "i_budget_year_overlapTxt"
        //     , "i_budget_yearTxt"
        //     , "user_id"
        //     , "po_working_hdr_id"
        //     , "isUpload"
        // );

        // foreach ($data as $k => $v) {
        //     if (!in_array($k, $fcheck)) {
        //         $fld .= ", {$k} = '{$v}' " . "\n";
        //     }
        // }
        //update d_receive_date

//        print_r($data);
//        exit();
        // $sql1 = "UPDATE dbo.sp_withdraw SET " . substr($fld, 1) . " WHERE  checking_id=?";
        // $stmt = $db->QueryParam($sql1, array($data['id']));
        //update d_receive_date
        $sql3 = "UPDATE dbo.sp_check_period_hdr SET d_receive_date=? WHERE  sp_check_period_hdr_id= {$data['sp_check_period_hdr_id']} ";
        $stm3 = $db->QueryParam($sql3, array($data['d_receive_date'], $data['id']));
        $id = $data['id'];

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
//        echo $sql2;
//        print_r($arrValue2);
//        exit();
        $stmt2 = $db->QueryParam($sql2, $arrValue2);
        $ss_id2 = $db->Fetch($stmt2);

        $arrParam2   = array();
        $arrParam2[] = $data["sp_check_period_hdr_id"];
        $arrParam2[] = $data["dc_user_update_id"];
        $arrParam2[] = $data["dc_user_update_cost_id"];
        $arrParam2[] = $data["d_update"];
        $arrParam2[] = $data["i_status_billing"];  //i_status_checking (null or 0 arrive_code) วางบิล / 1 ตรวจรับ / 2 ยกเลิก / 4 ทำรายการเบิก(update D0xxx / 5 ส่งเบิก
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_inv"]));
        $arrParam2[] =  $data['check_vat']??null;
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_vat"])); 
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_vat_rate"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_inv_vat"]));
        $arrParam2[] =  $data["check_tax_personal"]??null;
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_tax_personal"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_tax_personal_rate"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_social_security"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_prov_fund"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_fine"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_warranty"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_other"]));
        $arrParam2[] =  floatval(preg_replace('/[^\d.]/', '', $data["f_per_pay"]));

        $sql4 = "DECLARE @sp_check_period_hdr_id bigint = ?;
                    UPDATE dbo.sp_check_period_hdr SET " 
                    . " dc_user_update_id = ? ,"
                    . " dc_user_update_cost_id = ? ,"
                    . " d_update = ? ,"
                    . " i_status_billing = ? "
                . " where sp_check_period_hdr_id =  @sp_check_period_hdr_id ; "

                . " UPDATE dbo.sp_check_billing_items SET "
                . "   f_per_inv = ? "
                . " , check_vat = ? "
                . " , f_per_vat = ? "
                . " , f_per_vat_rate = ? "
                . " , f_per_inv_vat = ? "
                . " , check_tax_personal = ? "
                . " , f_per_tax_personal = ? "
                . " , f_per_tax_personal_rate = ? "
                . " , f_per_social_security = ? "
                . " , f_per_prov_fund = ? "
                . " , f_per_fine = ? "
                . " , f_per_warranty = ? "
                . " , f_per_other = ? "
                . " , f_per_pay = ? "
                . " where sp_check_period_hdr_id = @sp_check_period_hdr_id"; 
                ;
        $stmt3 = $db->QueryParam($sql4, $arrParam2);
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

if ($stmt && $stmt2&& $stmt3) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว", 'id' => 0);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}
echo json_encode($re);
exit;
