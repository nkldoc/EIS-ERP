<?php
include("../conf/configPo.php");
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../../lib/PDFMerger/MergePDF.php");

$db        = new DatabaseServer();
$date     = new i_date();

$root        = "data";
$data        = array();

$mode        = $_REQUEST["mode"];
$arrParam    = array();
$addField    = null;
$addValue    = null;
$arrValue    = array();
$uploaddir_place = PATH_PO_WORKING_PDF;
$uploaddir = PATH_PO_WORKING_PDF . date("Y-m-d") . "/"; //โฟเดอร์อัพโหลด pdf

$arr_stmt  = array();
$error_stmt = "";

$db->BeginTran();

$msg    = "";

function ADD_po_working_begin_item_Record($mode, $po_working_begin_hdr_id)
{
    global $db, $date, $util, $_SESSION;

    $arrParam    = array();
    $addField    = null;
    $addValue    = null;
    $arrValue    = array();

    $msg = "";
    $Arr = json_decode($_REQUEST["data"], true);

    $id_dalete = "";
    $count_loop = 0;
    $Arr_delete_id = json_decode($_REQUEST["data"], true);
    foreach ($Arr_delete_id as $fldd_delete) {
        if ($fldd_delete["id"] > 0) {
            $id_dalete .= "," . $fldd_delete["id"];
            $count_loop++;
        }
    }
    $in_not = $count_loop > 0 ? " AND po_working_begin_item_id NOT IN (" . substr($id_dalete, 1) . ")" : "";
    if ($in_not) {
        $sql = "DELETE po_working_begin_item WHERE po_working_begin_hdr_id = {$po_working_begin_hdr_id}" . $in_not;
        $stmt = $db->QueryParam($sql, array());
    }

    if ($msg == "") {
        foreach ($Arr as $fldd) {

            $data["dc_acc_id"]            = $fldd["dc_acc_id"];
            $data["f_inv"]                = $fldd["f_inv"];
            $data["f_vat"]                = $fldd["f_vat"];
            $data["f_inv_vat"]            = $fldd["f_inv_vat"];

            if ($fldd["id"] > 0 && $mode === "UPDATE") { // EDIT

                foreach ($data as $fldA => $value) {
                    $arrValue[]    = ($value != "") ? $value : null;
                    $addField    .= ", {$fldA} = ?";
                }

                $arrValue[] = $fldd["id"];
                $sql        = "UPDATE NMU.dbo.po_working_begin_item SET " . substr($addField, 1) . " WHERE po_working_begin_item_id = ?";
                $db->QueryParam($sql, $arrValue);
            } else { // ADD

                $data["po_working_begin_hdr_id"]          = $po_working_begin_hdr_id;
                // $data["i_enable"]                         = 1;
                // $data["dc_user_create_id"]                = $_SESSION["user_id"];
                // $data["dc_user_create_cost_id"]           = $_SESSION["dc_cost_id"];
                // $data["d_create"]                         = date("Y-m-d H:i:s");

                foreach ($data as $fld => $value) {
                    $arrValue[] = ($value != "") ? $value : null;
                    $addField .= ", {$fld}";
                    $addValue .= ", ?";
                }

                $sql = "
                    SET NOCOUNT ON
                    INSERT INTO po_working_begin_item (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                    SELECT @@IDENTITY as id;";

                $para    = $db->QueryParam($sql, $arrValue);
                $ss_id    = $db->Fetch($para);
                $id        = $ss_id["id"];
            }
            // ============== //
            $addField    = null;
            $addValue    = null;
            unset($data);
            unset($arrValue);
            // ============== //
        }

        $re    = array("success" => true, "id" => $_REQUEST["id"]);
    } else {
        $re = array(
            "success"    => false,
            "msg"        => $msg
        );
    }
}
switch ($mode) {
    case "PO_EDIT_BY_COST":


        $id = $_REQUEST["id"];

        $sql_dc_approve = "SELECT isnull(dc_approve_id,0) FROM po_working_dtl WHERE po_working_hdr_id = ?;";
        $dc_approve_id = $db->GetDataBySQL($sql_dc_approve, array($id));
        if ($dc_approve_id > 0) {
            $re = array("reval" => 1, "success" => "Error", "msg" => "รายการขอเบิกนี้อยู่ระหว่างการรอนุมัติฏิกา ไม่สามารถแก้ไขได้");
            echo json_encode($re);
            exit;
        }

        $sql_code_ref = "SELECT 
                COUNT(*) AS c_code_ref_num
            FROM NMU.dbo.po_working_hdr a
            INNER JOIN NMU.dbo.po_working_dtl b ON a.po_working_hdr_id =  b.po_working_hdr_id
            WHERE a.i_enable = 1 
                AND b.c_code = ? AND a.po_working_hdr_id != ?";
        $c_code_ref_num = $db->GetDataBySQL($sql_code_ref, array($_REQUEST["c_code_ref"], $id));
        if ($c_code_ref_num > 0) {
            $re = array("reval" => 1, "success" => "Error", "msg" => "มีเลขที่ใบขอเบิก " . $_REQUEST['c_code_ref'] . " ในระบบแล้ว<br>กรุณาทำรายการใหม่อีกครั้ง");
            echo json_encode($re);
            exit;
        }

        /****** function INSERT po_emp & po_creditor ******/
        function mnDcMethod($p, $arrAddDc = array())
        {
            global $db, $date, $util, $_SESSION;
            if (is_array($p)) {
                foreach ($arrAddDc as $k) {
                    $addField   = null;
                    $addValue   = null;
                    $ff         = array();
                    $tbl        = substr($k, 0, -3);
                    if ($p["{$tbl}_id"] === $p["{$tbl}_name"] && ($p["{$tbl}_name"] !== "กรุณาเลือกคีย์เพิ่มหรือว่างไว้")) {

                        $ff["c_name"]                                    = $p["{$k}"];
                        $ff["c_comment"]                                = "เพิ่มจากหน้าคีย์ใบเบิก";
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
                        $po = $db->GetDataBySQL("SELECT * FROM {$tbb} WHERE i_enable = 1 AND i_delete = 2 AND c_name = ?;", array($p["{$tbl}_name"]));
                        if (!$po) {
                            $sql = "
                                        SET NOCOUNT ON
                                        INSERT INTO {$tbb} (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                                        SELECT @@IDENTITY as id;";
                            $stmt  = $db->QueryParam($sql, $arrValue);
                            $stmt5 = $stmt;

                            $ss_id = $db->Fetch($stmt);
                            $_REQUEST["{$k}"] = $ss_id['id'];
                        }
                        $addField = null;
                        $addValue = null;
                        unset($datas);
                        unset($arrValue);
                    }
                }
            }
        }
        /****** function INSERT po_emp & po_creditor (END)******/
        $arrAddDc = array('po_creditor_id', 'po_creditor_transfer_id', 'po_emp_id');
        mnDcMethod($_REQUEST, $arrAddDc);
        if ($_REQUEST["po_creditor_transfer_id"] === $_REQUEST["po_creditor_transfer_name"] && ($_REQUEST["po_creditor_transfer_name"] !== "กรุณาเลือกคีย์เพิ่มหรือว่างไว้")) {
            $_REQUEST["po_creditor_transfer_id"] = $_REQUEST["po_creditor_id"];
        }

        if ($_REQUEST["c_code_invoice"] != '-') {
            $c_code_invoice_arr = preg_split('/\s*,\s*/', $_REQUEST["c_code_invoice"]);
            $Msg_invoice = '';
            foreach ($c_code_invoice_arr as $c_code_invoice) {
                $sql_invoice = "SELECT
                        COUNT(*) AS c_code_invoice_num
                    FROM po_working_dtl a
                    INNER JOIN po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id AND i_enable = 1
                    WHERE a.c_code_invoice is not null and a.c_code_invoice != '' and a.c_code_invoice != '-' 
                            and  po_creditor_id = ? and a.po_working_hdr_id != {$id}
                            and (
                                a.c_code_invoice = '{$c_code_invoice}'
                                or a.c_code_invoice like '{$c_code_invoice},%'
                                or a.c_code_invoice like '{$c_code_invoice} ,%'

                                or a.c_code_invoice like '%,{$c_code_invoice}%'
                                or a.c_code_invoice like '%, {$c_code_invoice}%'
                                
                            )";
                $c_code_invoice_num = $db->GetDataBySQL($sql_invoice, array($_REQUEST["po_creditor_id"]));
                if ($c_code_invoice_num > 0) {
                    $Msg_invoice .= 'มีใบแจ้งหนี้ ' . $c_code_invoice . ' ในนี้ระบบแล้ว<br>';
                }
            }
            if ($Msg_invoice != '') {
                $re = array("reval" => 1, "success" => "Error", "msg" => $Msg_invoice . "กรุณาทำรายการใหม่อีกครั้ง");
                echo json_encode($re);
                exit;
            }
        }

        $pdfup = [$_REQUEST['i_PdfUp1'], $_REQUEST['i_PdfUp2'], $_REQUEST['i_PdfUp3']];
        $pdfup = array(
            $_REQUEST['c_file_name_1'] => $_REQUEST['i_PdfUp1'],
            $_REQUEST['c_file_name_2'] => $_REQUEST['i_PdfUp2'],
            $_REQUEST['c_file_name_3'] => $_REQUEST['i_PdfUp3'],
        );
        $i = 1;
        foreach ($pdfup as $fld => $value) {
            if ($value == 'true') {
                if ($_FILES['upload_pdf' . $i]['name'] != "") {
                    $uploadfile = $uploaddir_place . $fld;
                    if (move_uploaded_file($_FILES['upload_pdf' . $i]['tmp_name'], $uploadfile) == false) {
                        $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf" . $fld);
                        echo json_encode($re);
                        exit;
                    }
                } else {
                    $re = array(
                        "success"                    => "Error",
                        "msg"                        => "ไม่มีการอัพโหลดไฟล์" . $fld
                    );
                    exit;
                }
            }
            $i++;
        }

        $data["c_code_ref"]                               = $_REQUEST["c_code_ref"]; //เลขที่ใบขอเบิก
        $data["c_comment"]                                = $_REQUEST["c_comment"];  //คำอธิบายรายการ
        $data["dc_user_update_id"]                        = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]                   = $_SESSION["dc_cost_id"];
        $data["d_update"]                                 = date("Y-m-d H:i:s");

        foreach ($data as $fld => $value) {
            $arrValue[]    = ($value != "") ? $value : null;
            $addField    .= ",
            {$fld} = ?";
        }

        $arrValue[] = $id;
        $sql        = "UPDATE po_working_hdr SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
        $para       = $db->QueryParam($sql, $arrValue);
        $arr_stmt[] = $para;

        // ============== //
        $addField    = null;
        $addValue    = null;
        unset($data);
        unset($arrValue);
        // ============== //
        $dc_bank_acc_creditor_id = $_REQUEST["dc_bank_acc_creditor_id"] > 0 ? $_REQUEST["dc_bank_acc_creditor_id"] : 0;
        $sql = "
            SELECT TOP 1 
                aa.c_code as c_code_bank_acc
                , aa.c_name as c_name_bank_acc
                ,aa.dc_bank_id 
            FROM NMU.dbo.dc_bank_acc_creditor aa 
            WHERE aa.dc_bank_acc_creditor_id = ?";
        $stmt_bank  = $db->QueryParam($sql, array($dc_bank_acc_creditor_id));
        $bank_acc = $db->Fetch($stmt_bank);

        $sql = "
            SELECT TOP 1 
                bb.c_bank_map_bulk
                ,bb.name_shot as c_name_bank_shot
                ,bb.c_name as c_name_bank
            FROM NMU.dbo.dc_bank_acc_creditor aa 
            INNER JOIN dc_bank bb ON aa.dc_bank_id = bb.dc_bank_id
            WHERE  aa.dc_bank_acc_creditor_id = ?";
        $stmt_bank  = $db->QueryParam($sql, array($dc_bank_acc_creditor_id));
        $bank = $db->Fetch($stmt_bank);
                
        $data["c_code"]                               = $_REQUEST["c_code_ref"];                 //เลขที่ใบขอเบิก
        $data["i_budget_year"]                        = $_REQUEST["i_budget_year"];              //ปีงบประมาณ
        $data["i_budget_year_overlap"]                = $_REQUEST["i_budget_year_overlap"];      //ใช้เงินปีงบประมาณ
        $data["dc_expense_budget_type_id"]            = $_REQUEST["dc_expense_budget_type_id"];  //แหล่งเงิน
        $data["bg_expense_id"]                        = $_REQUEST["bg_expense_id"];              //รายการย่อย
        $data["c_detail"]                             = $_REQUEST["c_detail"];                   //รายการย่อย (c_code : c_name)
        $data["po_creditor_id"]                       = $_REQUEST["po_creditor_id"];             //จ่ายให้
        $data["c_cnt_name"]                           = $_REQUEST["po_creditor_name"];           //จ่ายให้ (c_name)
        $data["dc_creditor_transfer_id"]              = $_REQUEST["dc_creditor_po_transfer_id"];
        $data["dc_creditor_id"]                       = $_REQUEST["dc_creditor_po_id"];
        $data["po_creditor_transfer_id"]              = $_REQUEST["po_creditor_transfer_id"];    //โดยมอบให้
        $data["c_code_invoice"]                       = $_REQUEST["c_code_invoice"];             //เลขที่ใบแจ้งหนี้
        $data["c_qty"]                                = $_REQUEST["c_qty"];                      //จำนวนรายการ
        $data["f_total"]                              = floatval(preg_replace('/[^\d.]/', '', $_REQUEST["f_total"]));   //จำนวนเงินขอเบิก
        $data["d_audit_date"]                         = ($_REQUEST['d_audit_date'] != '') ? $date->bc_to_ad($_REQUEST['d_audit_date']) : ''; //วันที่ตรวจรับ
        $data["po_emp_id"]                            = $_REQUEST["po_emp_id"];                  //ผู้ดำเนินการ
        $data["d_doc_date"]                           = ($_REQUEST['d_doc_date'] != '') ? $date->bc_to_ad($_REQUEST['d_doc_date']) : ''; //วันที่ใบขอเบิก
        $data["dc_user_update_id"]                    = $_SESSION["user_id"];
        $data["dc_user_update_cost_id"]               = $_SESSION["dc_cost_id"];
        $data["d_update"]                             = date("Y-m-d H:i:s");

        $data["dc_bank_acc_creditor_id"]              = $dc_bank_acc_creditor_id;
        $data["c_code_bank_acc"]                      = $bank_acc["c_code_bank_acc"];
        $data["c_name_bank_acc"]                      = $bank_acc["c_name_bank_acc"];
        $data["dc_bank_id"]                           = $bank_acc["dc_bank_id"];
        $data["c_bank_map_bulk"]                      = $bank["c_bank_map_bulk"];
        $data["c_name_bank_shot"]                     = $bank["c_bank_map_bulk"];
        $data["c_name_bank"]                          = $bank["c_name_bank"];

        foreach ($data as $fld => $value) {
            $arrValue[]    = ($value != "") ? $value : null;
            $addField    .= ",\n{$fld} = ?";
        }

        $arrValue[] = $id;
        $sql        = "UPDATE po_working_dtl SET " . substr($addField, 1) . " WHERE po_working_hdr_id = ?";
        $para       = $db->QueryParam($sql, $arrValue);
        $arr_stmt[] = $para;

        // ============== //
        $addField    = null;
        $addValue    = null;
        unset($data);
        unset($arrValue);
        // ============== //
        if (@$_REQUEST["po_working_begin_hdr_id"] > 0) {
            $data["c_detail"]                                         = $_REQUEST["c_detail"];
            $data["dc_cost_id"]                                       = $_REQUEST["dc_cost_id"];
            $data["dc_creditor_id"]                                   = $_REQUEST["dc_creditor_po_id"];
            $data["dc_creditor_transfer_id"]                          = $_REQUEST["dc_creditor_po_transfer_id"];
            if (@$_REQUEST["c_booking"]) $data["c_booking"]               = $_REQUEST["c_booking"];
            $data["c_code_ref"]                                       = $_REQUEST["c_code_ref"];
            if ($_REQUEST["d_doc_date"]) $data["d_doc_date"]              = $date->bc_to_ad($_REQUEST["d_doc_date"]);
            if ($_REQUEST["d_audit_date"]) $data["d_chk_last_date"]       = $date->bc_to_ad($_REQUEST["d_audit_date"]);
            $data["f_per_inv"]                                        = $_REQUEST["f_per_inv"];
            $data["f_per_vat_rate"]                                   = $_REQUEST["f_per_vat_rate"];
            $data["f_per_vat"]                                        = $_REQUEST["f_per_vat"];
            $data["f_per_inv_vat"]                                    = $_REQUEST["f_per_inv_vat"];
            $data["f_per_tax_personal_rate"]                          = $_REQUEST["f_per_tax_personal_rate"];
            $data["f_per_tax_personal"]                               = $_REQUEST["f_per_tax_personal"];
            $data["f_per_social_security"]                            = $_REQUEST["f_per_social_security"];
            $data["f_per_prov_fund"]                                  = $_REQUEST["f_per_prov_fund"];
            $data["f_per_fine"]                                       = $_REQUEST["f_per_fine"];
            $data["f_per_warranty"]                                   = $_REQUEST["f_per_warranty"];
            $data["f_per_other"]                                      = $_REQUEST["f_per_other"];
            $data["f_per_pay"]                                        = $_REQUEST["f_per_pay"];
            $data["dc_user_update_id"]                                = $_SESSION["user_id"];
            $data["dc_user_update_cost_id"]                           = $_SESSION["dc_cost_id"];
            $data["d_update"]                                         = date("Y-m-d H:i:s");

            foreach ($data as $fld => $value) {
                $arrValue[]    = ($value != "") ? $value : null;
                $addField    .= ",\n{$fld} = ?";
            }
            $arrValue[] = $_REQUEST["po_working_begin_hdr_id"];
            $sql        = "UPDATE po_working_begin_hdr SET " . substr($addField, 1) . " WHERE po_working_begin_hdr_id = ?";
            $para        = $db->QueryParam($sql, $arrValue);

            ADD_po_working_begin_item_Record("UPDATE", $_REQUEST["po_working_begin_hdr_id"]);
        }

        break;
}
if (!in_array(false, $arr_stmt) && count($arr_stmt)) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => true, "msg" => "แก้ไขเรียบร้อย");
} else {
    $db->RollBackTran();
    foreach ($arr_stmt as $index => $value) $error_stmt .= "\tstmt[" . $index . "] = " . ($value ? "true" : "false") . "\n";
    $re = array("reval" => 1, "success" => false, "msg" => "<pre>check statement :\n" . $error_stmt . "</pre>");
}
echo json_encode($re);
exit;
