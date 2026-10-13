<?php
/* * */
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

$uploaddir = PATH_PO_WORKING_PDF; //โฟเดอร์อัพโหลด pdf

// print_r($_REQUEST);
// exit();



function mnDcMethod($p, $arrAddDc = array())
{
    global $db, $date, $util, $_SESSION;
    if (is_array($p)) {
        foreach ($arrAddDc as $k) {
            /*

                po_creditor_id: sssssssssss
                c_cnt_name: sssssssssss
                เพิ่ม
                po_creditor_transfer_id: 122333
                c_creditor_transfer_name: 122333
                ว่าง
                po_emp_id: 
                c_emp_name: กรุณาเลือกผู้ดำเนินการ...
                */

            //override method 
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

$stmt      = true;
$stmt2     = true;
$stmt3     = true;
$stmt4     = true;
$stmt5     = true;
$stmt6     = true;
$datas     = array();
$fld       = null;
$addField  = null;
$addValue  = null;
$addField2 = null;
$addValue2 = null;
$addField3 = null;
$addValue3 = null;
$keyOn     = false;
$db->BeginTran();

switch ($mode) {
    case "saveDataGrid":
        print_r($_REQUEST);
        exit();
        break;
    case "ADD":

        $sql_invoice = "SELECT 
                    COUNT(*) AS c_code_invoice_num  
                FROM po_working_dtl a 
                INNER JOIN po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id AND i_enable = 1 
                WHERE po_creditor_id = ? AND c_code_invoice = ?";
        $c_code_invoice_num = $db->GetDataBySQL($sql_invoice, array($data["po_creditor_id"], $data["c_code_invoice"]));
        if ($c_code_invoice_num > 0) {
            $re = array("reval" => 1, "success" => "false", "msg" => "มีใบแจ้งหนี้ในนี้ระบบแล้ว<br>กรุณาทำรายการใหม่อีกครั้ง");
            echo json_encode($re);
            exit;
        }

        // ========================= 1/3 add po_working_hdr ========================= // 
        $datas["i_import"]               = 0; // สร้างขึ้นเอง
        $datas["last_status_id"]         = $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_enable=1 and i_delete<>1 and i_seq = ?", array(2));
        $datas["i_status_last"]             = 2;
        if ($data["i_parent_id"] > 1) {
            $datas["parent_id"]             = $data["i_parent_id"];
        }
        $datas["c_status_last"]          = "ส่งใบเบิก";
        $datas["c_code_ref"]             = $data["c_code_ref"];
        $datas["c_comment"]             = $data["c_comment"];
        $datas["i_enable"]               = STATUS_ENABLE;
        $datas["dc_user_update_id"]      = $_SESSION["user_id"];
        $datas["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"];
        $datas["d_update"]               = date("Y-m-d H:i:s");
        $datas["dc_user_create_id"]      = $_SESSION["user_id"];
        $datas["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $datas["d_create"]               = date("Y-m-d H:i:s");

        foreach ($datas as $fld => $value) {
            $arrValue[] = ($value !== "") ? $value : null;
            if (
                $value !== ""
                || $fld == "c_code_ref"
                || $fld == "c_comment"
            ) {
                $addField .= ", {$fld}";
                $addValue .= ", ?";
            }
        }

        $sql = "SET NOCOUNT ON
                INSERT INTO po_working_hdr (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");
                SELECT @@IDENTITY as id;";

        $stmt  = $db->QueryParam($sql, $arrValue);
        $ss_id = $db->Fetch($stmt);
        $db->logs(
            "po-RegPo",
            $mode,
            $keyName,
            $ss_id,
            $sql,
            $arrValue,
            $_SESSION,
            $dirLog
        );
        $id       = $ss_id["id"];
        if ($_FILES['upload_pdf1']['name'] != "" && $_FILES['upload_pdf2']['name'] != "") {
            $uploadfile = $uploaddir . basename($ss_id["id"] . '_1_hdr.pdf');
            if (move_uploaded_file($_FILES['upload_pdf1']['tmp_name'], $uploadfile) == false) {
                $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf");
                echo json_encode($re);
                exit;
            }
            $uploadfile = $uploaddir . basename($ss_id["id"] . '_1_dtl.pdf');
            if (move_uploaded_file($_FILES['upload_pdf2']['tmp_name'], $uploadfile) == false) {
                $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf");
                echo json_encode($re);
                exit;
            }
        }
        $arrParam   = array();
        $addField = null;
        $addValue = null;
        unset($datas);
        unset($arrValue);

        // ========================= 2/3 add po_working_dtl ========================= // 
        $datas["po_working_hdr_id"]         = $id;
        if ($data["i_budget_year"] > 0)
            $datas["i_budget_year"]               = $data["i_budget_year"];
        if ($data["i_budget_year"] > 0)
            $datas["i_budget_year_overlap"]       = $data["i_budget_year_overlap"];
        if ($data["dc_cost_id"] > 0)
            $datas["dc_cost_id"]                = $data["dc_cost_id"];
        if ($data["dc_expense_budget_type_id"] > 0)
            $datas["dc_expense_budget_type_id"] = $data["dc_expense_budget_type_id"];
        // $datas["bg_expense_group_id"]       = $data["bg_expense_group_id"];
        if ($data["c_code_ref"] !== "")
            $datas["c_code"]                    = $data["c_code_ref"];

        $datas["c_code_invoice"]            = $data["c_code_invoice"];

        // $datas["po_audit_id"]               = $data["po_audit_id"];
        if ($data["d_audit_date"])
            $datas["d_audit_date"]              = $date->bc_to_ad($data["d_audit_date"]); //$date->bc_to_ad($data["d_resign"])
        $datas["po_emp_id"]                 = (intval($data["po_emp_id"]) > 0) ? $data["po_emp_id"] : null; //$data["po_emp_id"];
        if ($data["d_doc_date"])
            $datas["d_doc_date"]                = $date->bc_to_ad($data["d_doc_date"]);
        // $datas["dc_approve_id"]             = $data["dc_approve_id"];
        // if ($data["d_inv_date"])
        //     $datas["d_inv_date"]                = $date->bc_to_ad($data["d_inv_date"]);
        $datas["bg_expense_id"]             = (intval($data["bg_expense_id"]) > 0) ? $data["bg_expense_id"] : null;
        $datas["c_detail"]                  = (intval($data["bg_expense_id"]) > 0) ? $data["c_detail"] : "";
        $datas["po_creditor_transfer_id"]   = (intval($data["po_creditor_transfer_id"]) > 0) ? $data["po_creditor_transfer_id"] : null;
        $datas["po_creditor_id"]             = (intval($data["po_creditor_id"]) > 0) ? $data["po_creditor_id"] : null;
        $datas["c_cnt_name"]                = (intval($data["po_creditor_id"]) > 0) ? $data["po_creditor_name"] : "";
        $datas["c_qty"]                     = $data["c_qty"];
        $datas["f_total"]                   = floatval(preg_replace('/[^\d.]/', '', $data["f_total"])); //floatval(preg_replace('/[^\d.]/', '', $data['f_unit_cost']));
        $datas["dc_user_update_id"]         = $_SESSION["user_id"];
        $datas["dc_user_update_cost_id"]    = $_SESSION["dc_cost_id"];
        $datas["d_update"]                  = date("Y-m-d H:i:s");
        $datas["dc_user_create_id"]         = $_SESSION["user_id"];
        $datas["dc_user_create_cost_id"]    = $_SESSION["dc_cost_id"];
        $datas["d_create"]                  = date("Y-m-d H:i:s");
        // if ($data["d_inv_date"] !== "" && $data["dc_approve_id"] > 0) {
        //     $keyOn = true;
        // }

        foreach ($datas as $fld => $value) {
            $arrValue2[] = ($value != "") ? $value : null;

            $addField2 .= ",
             {$fld}";
            $addValue2 .= ", ?";
        }
        $sql   = "INSERT INTO po_working_dtl (" . substr($addField2, 1) . ") VALUES (" . substr($addValue2, 1) . ");";
        $stmt2 = $db->QueryParam($sql, $arrValue2);
        $db->logs(
            "po-RegPo",
            $mode,
            $keyName,
            $ss_id,
            $sql,
            $arrValue2,
            $_SESSION,
            $dirLog
        );
        // ============== //

        unset($datas);
        unset($addField);
        unset($addValue);

        $datas["po_working_hdr_id"]      = $id;
        $datas["po_status_hdr_id"]       = $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_enable=1 and i_delete<>1 and i_seq = ?", array(1));
        $datas["i_status"]                 = 1;
        $datas["c_status"]                 = "จัดทำใบขอเบิก";
        $datas["c_name"]                 = $data["c_detail"];
        // $datas["d_doc_date"]             = $date->bc_to_ad($data["d_approve_date"]);
        $datas["c_code_ref"]             = $data["c_code_ref"];
        $datas["c_comment"]              = $data["c_comment"];
        if (@$data["i_edit_pdfs1"] = 1) {
            $datas["i_is_url_pdf_hdr"]          = $_FILES['upload_pdf1']['name'] == '' ? null : '0';
            $datas["i_is_url_pdf_dtl"]          = $_FILES['upload_pdf2']['name'] == '' ? null : '0';
            $datas["c_file_pdf_hdr"]            = $_FILES['upload_pdf1']['name'] == '' ? null : $id . '_1_hdr.pdf';
            $datas["c_file_pdf_dtl"]            = $_FILES['upload_pdf2']['name'] == '' ? null : $id . '_1_dtl.pdf';
        }

        $datas["dc_user_create_id"]      = $_SESSION["user_id"];
        $datas["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $datas["d_create"]               = date("Y-m-d H:i:s");
        $datas["dc_user_update_id"]         = $_SESSION["user_id"];
        $datas["dc_user_update_cost_id"]    = $_SESSION["dc_cost_id"];
        $datas["d_update"]                  = date("Y-m-d H:i:s");

        foreach ($datas as $fld => $value) {
            $arrValue3[] = ($value != "") ? $value : null;
            $addField3   .= ",
             {$fld}";
            $addValue3   .= ", ?";
        }
        $sql   = "INSERT INTO po_working_item (" . substr($addField3, 1) . ") VALUES (" . substr($addValue3, 1) . ");";
        $stmt3     = $db->QueryParam($sql, $arrValue3);
        $db->logs(
            "po-RegPo",
            $mode,
            $keyName,
            $ss_id,
            $sql,
            $arrValue3,
            $_SESSION,
            $dirLog
        );

        //first loop
        $sql       = null;
        $datass    = [];
        $addField4 = null;
        $addValue4 = null;

        $datass["po_working_hdr_id"]      = $id;
        $datass["po_status_hdr_id"]       = $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_enable=1 and i_delete<>1 and i_seq = ?", array(2));
        $datass["i_status"]                 = 2;
        $datass["c_status"]                 = "ส่งใบเบิก";
        $datass["c_name"]                 = $data["c_detail"];
        // $datass["d_doc_date"]             = $date->bc_to_ad($data["d_approve_date"]);
        $datass["c_code_ref"]             = $data["c_code_ref"];
        $datass["c_comment"]              = $data["c_comment"];
        $datass["i_is_url_pdf_hdr"]          = $_FILES['upload_pdf1']['name'] == '' ? null : '0';
        $datass["i_is_url_pdf_dtl"]          = $_FILES['upload_pdf2']['name'] == '' ? null : '0';
        $datass["c_file_pdf_hdr"]            = $_FILES['upload_pdf1']['name'] == '' ? null : $id . '_1_hdr.pdf';
        $datass["c_file_pdf_dtl"]            = $_FILES['upload_pdf2']['name'] == '' ? null : $id . '_1_dtl.pdf';
        $datass["dc_user_create_id"]      = $_SESSION["user_id"];
        $datass["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"];
        $datass["d_create"]               = date("Y-m-d H:i:s");
        $datass["dc_user_update_id"]         = $_SESSION["user_id"];
        $datass["dc_user_update_cost_id"]    = $_SESSION["dc_cost_id"];
        $datass["d_update"]                  = date("Y-m-d H:i:s");

        foreach ($datass as $fld => $value) {
            $arrValue4[] = ($value != "") ? $value : null;
            $addField4   .= ", {$fld}";
            $addValue4   .= ", ?";
        }
        $sql   = "INSERT INTO po_working_item (" . substr($addField4, 1) . ") VALUES (" . substr($addValue4, 1) . ");";
        $stmt4 = $db->QueryParam($sql, $arrValue4);

        $db->logs(
            "po-RegPo",
            $mode,
            $keyName,
            $ss_id,
            $sql,
            $arrValue4,
            $_SESSION,
            $dirLog
        );
        break;

        $sql = "DECLARE @idx as bigint; SET @idx = ?;
                DELETE FROM dbo.po_working_hdr  where po_working_hdr_id =@idx;
                DELETE FROM dbo.po_working_dtl  where po_working_hdr_id =@idx;
                DELETE FROM dbo.po_working_item  where po_working_hdr_id =@idx;";

        $stmt  = $db->QueryParam($sql, array($_POST['po_working_hdr_id']));
        $stmt2 = $stmt;
        $stmt3 = $stmt;
        $stmt4 = $stmt;

        $db->logs(
            "po-RegPo",
            $mode,
            $keyName,
            $data["po_working_hdr_id"],
            $sql,
            array($_POST['po_working_hdr_id']),
            $_SESSION,
            $dirLog
        );
        break;
}

if ($stmt && $stmt2 && $stmt3 && $stmt4 && $stmt5 && $stmt6) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทีกเรียบร้อยแล้ว");
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : {$sql}");
}

echo json_encode($re);
exit;
