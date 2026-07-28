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
// $data["i_edit_pdfs1"] = @$data["i_edit_pdfs1"] == "" ? 0 : @$data["i_edit_pdfs1"];
switch ($mode) {
    case "saveDataGrid":
        print_r($_REQUEST);
        exit();
        break;
    case "ADD":
        if ($data["c_code_invoice"] != '' && $data["c_code_invoice"] != null) {
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
        $datas["dc_approve_id"]             = $data["dc_approve_id"];
        if ($data["d_inv_date"])
            $datas["d_inv_date"]                = $date->bc_to_ad($data["d_inv_date"]);
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
        if ($data["d_inv_date"] !== "" && $data["dc_approve_id"] > 0) {
            $keyOn = true;
        }

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
        $datas["d_doc_date"]             = $date->bc_to_ad($data["d_approve_date"]);
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
        $datass["d_doc_date"]             = $date->bc_to_ad($data["d_approve_date"]);
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
    case "UPDATE":
        if ($data["c_code_invoice"] != '' && $data["c_code_invoice"] != null) {
        $sql_invoice = "SELECT COUNT(*) AS c_code_invoice_num  
                FROM po_working_dtl a 
                INNER JOIN po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id AND b.i_enable = 1 
                WHERE a.po_creditor_id  = ? AND a.c_code_invoice = ? AND a.po_working_hdr_id != ?";
        $c_code_invoice_num = $db->GetDataBySQL($sql_invoice, array($data["po_creditor_id"], $data["c_code_invoice"], $data["po_working_hdr_id"]));
        if ($c_code_invoice_num > 0) {
            $re = array("reval" => 1, "success" => "false", "msg" => "มีใบแจ้งหนี้ในนี้ระบบแล้ว<br>กรุณาทำรายการใหม่อีกครั้ง");
            echo json_encode($re);
            exit;
        }
    }

        // if (@$data["i_edit_pdfs1"] == 1 ) {

        if ($_FILES['upload_pdf1']['name'] != "" && $_FILES['upload_pdf2']['name'] != "") {
            $uploadfile = $uploaddir . basename($data["po_working_hdr_id"] . '_1_hdr.pdf');
            if (move_uploaded_file($_FILES['upload_pdf1']['tmp_name'], $uploadfile) == false) {
                $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf");
                echo json_encode($re);
                exit;
            }
            $uploadfile = $uploaddir . basename($data["po_working_hdr_id"] . '_1_dtl.pdf');
            if (move_uploaded_file($_FILES['upload_pdf2']['tmp_name'], $uploadfile) == false) {
                $re = array("reval" => 1, "success" => "Error", "msg" => "check statement : ไม่สามารถอัพโหลดไฟล์ pdf");
                echo json_encode($re);
                exit;
            }
        }
        // }

        $arrCon[0] = $_FILES['upload_pdf1']['name'] == '' ? null : '0';
        $arrCon[1] = $_FILES['upload_pdf2']['name'] == '' ? null : '0';
        $arrCon[2] = $_FILES['upload_pdf1']['name'] == '' ? null : $data["po_working_hdr_id"] . '_1_hdr.pdf';
        $arrCon[3] = $_FILES['upload_pdf2']['name'] == '' ? null : $data["po_working_hdr_id"] . '_1_dtl.pdf';
        if ((@$data["i_edit_pdfs1"] == 1 && $_FILES['upload_pdf1']['name'] != '')
            || (@$data["i_edit_pdfs1"] != 1 && $_FILES['upload_pdf1']['name'] != '')
        ) {
            $con_upload = "
                ,i_is_url_pdf_hdr = '{$arrCon[0]}'
                ,i_is_url_pdf_dtl = '{$arrCon[1]}'
                ,c_file_pdf_hdr = '{$arrCon[2]}'
                ,c_file_pdf_dtl = '{$arrCon[3]}'
                ";
        } else if (@$data["i_edit_pdfs1"] == 1 && $_FILES['upload_pdf1']['name'] == '') {
            $con_upload = "
            ,i_is_url_pdf_hdr = null
            ,i_is_url_pdf_dtl = null
            ,c_file_pdf_hdr = null
            ,c_file_pdf_dtl = null
            ";
        } else if (@$data["i_edit_pdfs1"] != 1 && $_FILES['upload_pdf1']['name'] == '') {
            $con_upload = "";
        }

        $arrParam   = array();

        //hdr   
        if ($data["i_parent_id"] > 0) {
            $arrParam[] = $data["i_parent_id"]; //c_code     
        } else {
            $arrParam[] = 0; //c_code   
        }

        $arrParam[] = $data["c_code_ref"]; //c_code 
        //c_detail
        $arrParam[] = $data["c_detail"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = intval($data["i_enable"]);
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["po_working_hdr_id"]; //id

        //item 
        $arrParam[] =  ($data["d_approve_date"] === null || $data["d_approve_date"] === "") ? null : $date->bc_to_ad($data["d_approve_date"]);
        $arrParam[] = $data["c_code_ref"]; //c_code  
        $arrParam[] = $data["c_detail"];
        $arrParam[] = $data["c_comment"];
        $arrParam[] = $data["dc_user_update_id"];
        $arrParam[] = $data["dc_user_update_cost_id"];
        $arrParam[] = $data["d_update"];
        $arrParam[] = $data["po_working_hdr_id"]; //id

        $sql = "
            SET NOCOUNT ON 
            UPDATE dbo.po_working_dtl SET
                c_code = '{$data["c_code_ref"]}'
                ,i_budget_year = " . intval($data["i_budget_year"]) . "
                ,i_budget_year_overlap = " . intval($data["i_budget_year_overlap"]) . "
                ,dc_expense_budget_type_id = " . intval($data["dc_expense_budget_type_id"]) . "
                ,bg_expense_id = '" . (($data["bg_expense_id"] > 0) ? intval($data["bg_expense_id"]) : null) . "'
                ,c_detail = '" . (($data["bg_expense_id"] > 0) ? $data["c_detail"] : "") . "'
                ,po_creditor_transfer_id = " . (($data["po_creditor_transfer_id"] > 0) ? intval($data["po_creditor_transfer_id"]) : null) . "
                ,po_creditor_id = " . (($data["po_creditor_id"] > 0) ? intval($data["po_creditor_id"]) : null) . "
                ,c_code_invoice = '" . $data["c_code_invoice"] . "'
                ,c_cnt_name = '" . (($data["po_creditor_id"] > 0) ? $data["po_creditor_name"] : "") . "'
                ,dc_cost_id = " . (intval($data["dc_cost_id"])) . "
                ,c_qty = '" . $data["c_qty"] . "'
                ,f_total = " . (floatval(preg_replace('/[^\d.]/', '', $data["f_total"]))) . "
                ,d_audit_date = " . (($data["d_audit_date"] === null || $data["d_audit_date"] === "") ? null : "'" . $date->bc_to_ad($data["d_audit_date"])) . "'" . "
                ,po_emp_id = " . intval($data["po_emp_id"]) . "
                ,d_doc_date = " . (($data["d_doc_date"] === null || $data["d_doc_date"] === "") ? null : "'" . $date->bc_to_ad($data["d_doc_date"])) . "'" . "
                ,dc_approve_id = " . intval($data["dc_approve_id"]) . "
                ,d_inv_date = " . (($data["d_inv_date"] === null || $data["d_inv_date"] === "") ? null : "'" . $date->bc_to_ad($data["d_inv_date"])) . "'" . "
                ,dc_user_update_id = " . $data["dc_user_update_id"] . "
                ,dc_user_update_cost_id = " . $data["dc_user_update_cost_id"] . "
                ,d_update = '" . $data["d_update"] . "'
            WHERE po_working_hdr_id = " . $data["po_working_hdr_id"] . ";
            UPDATE dbo.po_working_hdr SET parent_id=? ,c_code_ref=? ,c_detail=?, c_comment=?
                        ,i_enable = ? 
                        ,dc_user_update_id = ?
                        ,dc_user_update_cost_id = ?
                        ,d_update = ?
                    where po_working_hdr_id = ?;  
        UPDATE dbo.po_working_item SET d_doc_date = ? ,c_code_ref=? , c_name =? , c_comment=? 
            {$con_upload}
            ,dc_user_update_id = ?
            ,dc_user_update_cost_id = ?
            ,d_update = ?
        where po_working_hdr_id = ? and i_status IN (1,2)";

        $stmt  = $db->QueryParam($sql, $arrParam);
        $stmt2 = $stmt;
        $stmt3 = $stmt;
        $stmt4 = $stmt;
        $db->logs(
            "po-RegPo",
            $mode,
            $keyName,
            $data["po_working_hdr_id"],
            $sql,
            $arrParam,
            $_SESSION,
            $dirLog
        );
        break;
    case "DELETE":
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
