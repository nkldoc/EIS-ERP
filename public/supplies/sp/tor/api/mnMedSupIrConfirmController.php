<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

// ================================================================
// เมนู "ยืนยันรายการ Api จัดซื้อจาก ERP" (ST00094)
//
// แหล่งข้อมูลคือ log การเรียก POST /procure/ir จริงจาก ERP (username =
// erpsendapi) ที่ D:\EIS-ERP\storage\jsonERP\*.log (อ่านโดย List_MedSupIrConfirm.php
// type=pending_erp_log) ผู้ใช้กด "ยืนยัน" รายการที่ตรวจสอบแล้วในหน้าจอ ระบบจะ
// "รับข้อมูล" มาบันทึกไว้ที่นี่เท่านั้น (mode CONFIRM_FROM_LOG) - ยังไม่ได้เชื่อมต่อ
// ส่งอะไรกลับไปยัง API ภายนอกในรอบนี้ (ตามที่ตกลงกันไว้)
//
// UPDATE/DELETE ไว้สำหรับแก้ไข/ลบรายการที่ยืนยันไปแล้ว (เช่น พิมพ์ผิด) เท่านั้น
// ไม่มีโหมด "เพิ่มด้วยมือ" อีกต่อไป เพราะข้อมูลต้องมาจาก log ของ ERP จริงเสมอ
// ============================================ ====================

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

// เดิม mode UPDATE เรียก $util->mnUser() ซึ่งกัน session หลุดให้เองอยู่แล้ว แต่
// mode CONFIRM_FROM_LOG ไม่ได้เรียก mnUser() (ไม่มีฟอร์มให้ merge ค่า audit แบบเดิม)
// ต้องเช็ค session ตรงนี้เองก่อนเสมอ ไม่งั้นจะยิง insert ได้โดยไม่ต้อง login
if (empty($_SESSION["user_id"])) {
    http_response_code(401);
    header('Content-Type: application/json');
    echo json_encode(array("reval" => 1, "success" => false, "msg" => "Session expired"));
    exit;
}

$mode = $_REQUEST["mode"] ?? null;

// ฟิลด์ item ที่ map ตรงเป็นคอลัมน์ hdr ("คอลัมน์ hdr" => "key ใน item ตาม log ERP")
$HDR_FIELD_MAP = array(
    "pr_id" => "pr_id",
    "po_id" => "po_id",
    "period_id" => "period_id",
    "chk_id" => "chk_id",
    "c_contract_code" => "c_contract_code",
    "d_start_date" => "d_start_date",
    "d_contract_start_date" => "d_contract_start_date",
    "d_end_date" => "d_end_date",
    "i_period" => "i_period",
    "f_period_amt" => "f_period_amt",
    "bg_expense_id" => "bg_expense_id",
    "bg_expense_name" => "bg_expense_name",
    "dc_expense_budget_type_id" => "dc_expense_budget_type_id",
    "dc_expense_budget_type_name" => "dc_expense_budget_type_name",
    "i_is_last" => "i_is_last",
    "i_product_type" => "i_product_type",
    "dc_cost_id" => "dc_cost_id",
    "c_tax_number_imp" => "c_tax_number_imp",
    "dc_creditor_id" => "dc_creditor_id",
    "c_creditor_name" => "dc_creditor_idTxt",
    "c_creditor_transfer_code" => "dc_creditor_transfer_code",
    "dc_creditor_transfer_id" => "dc_creditor_transfer_id",
    "c_creditor_transfer_name" => "dc_creditor_transfer_idTxt",
    "c_bank_acc_creditor" => "dc_bank_acc_creditor_id",
    "i_budget_year" => "i_budget_year",
    "i_budget_year_overlap" => "i_budget_year_overlap",
    "c_arrive_code" => "c_arrive_code",
    "d_arrive_date" => "d_arrive_date",
    "d_checking_date" => "d_checking_date",
    "c_reserve_pay" => "i_reserve_pay",
    "c_doc_duo" => "i_doc_duo",
    "c_overlap" => "c_overlap",
);
$HDR_INT_FIELDS = array("pr_id", "po_id", "period_id", "chk_id", "i_period", "bg_expense_id", "dc_expense_budget_type_id", "i_is_last", "i_product_type", "dc_cost_id", "dc_creditor_id", "dc_creditor_transfer_id");
$HDR_AMT_FIELDS = array("f_period_amt");

// c_doc_ref ตาม Data Dictionary ของ ERP เป็น boolean (true/false) ในตัวอย่างจริงที่พบ
// เก็บเป็นข้อความไว้เผื่ออนาคตพบว่าบางครั้งส่งเป็นเลขที่เอกสารจริง (string) - ถ้าเป็น
// string ที่ไม่ว่างเก็บค่านั้นตรงๆ ถ้าเป็น true/false/ว่าง เก็บเป็น null
function docRefToText($v) {
    return (is_string($v) && trim($v) !== "") ? trim($v) : null;
}

// คำนวณคีย์ธุรกิจของรายการ (pr/po/chk/เลขที่ใบรับของ) ตัวเดียวกับที่
// List_MedSupIrConfirm.php ใช้กันข้อมูลซ้ำตอนแสดงรายการรอยืนยัน
function medSupIrBusinessKey($item) {
    return intval($item["pr_id"] ?? 0) . "|" . intval($item["po_id"] ?? 0) . "|"
        . intval($item["chk_id"] ?? 0) . "|" . trim((string) ($item["c_arrive_code"] ?? ""));
}

// ผูกรายการ line_ids (chk_line_id / c_doc_ref / d_doc_dateSub / f_period_amt) เข้ากับ
// sp_medsup_ir_confirm_hdr_id ที่ระบุ ลบของเดิมแล้วเพิ่มใหม่ทั้งหมด
function saveMedSupIrConfirmLines($db, $hdrId, $lineIds, $userId) {
    $db->QueryParam("DELETE NMU_ERP.dbo.sp_medsup_ir_confirm_dtl WHERE sp_medsup_ir_confirm_hdr_id = ?", array($hdrId));

    if (empty($lineIds) || !is_array($lineIds)) {
        return true;
    }
    foreach ($lineIds as $line) {
        if (!is_array($line)) {
            continue;
        }
        $arrValue = array(
            $hdrId,
            !empty($line["chk_line_id"]) ? intval($line["chk_line_id"]) : null,
            docRefToText($line["c_doc_ref"] ?? null),
            !empty($line["d_doc_dateSub"]) ? $line["d_doc_dateSub"] : null,
            isset($line["f_period_amt"]) && $line["f_period_amt"] !== "" ? floatval($line["f_period_amt"]) : null,
            date("Y-m-d H:i:s"),
            $userId,
        );
        $sql = "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_medsup_ir_confirm_dtl
                    (sp_medsup_ir_confirm_hdr_id, chk_line_id, c_doc_ref, d_doc_dateSub, f_period_amt, d_create, dc_user_create_id)
                VALUES (?, ?, ?, ?, ?, ?, ?);";
        if (!$db->QueryParam($sql, $arrValue)) {
            return false;
        }
    }
    return true;
}

$stmt = true;
$db->BeginTran();

switch ($mode) {
    case "CONFIRM_FROM_LOG":
        $item = json_decode($_REQUEST["j_data"] ?? "", true);
        if (!is_array($item)) {
            $stmt = false;
            break;
        }

        // กันยืนยันซ้ำ (แม้ transaction_id จะคนละครั้งกัน เพราะ ERP retry ข้อมูลเดิม
        // ได้จริงตามที่พบใน log) - เช็คด้วยคีย์ธุรกิจอีกรอบฝั่ง server เสมอ อย่าเชื่อ
        // เฉพาะฝั่ง JS ว่ากรองไม่ให้กดซ้ำแล้ว
        $businessKey = medSupIrBusinessKey($item);
        $existing = $db->GetDataBySQL(
            "select top 1 sp_medsup_ir_confirm_hdr_id from NMU_ERP.dbo.sp_medsup_ir_confirm_hdr
             where i_enabled = 1 and isnull(pr_id,0) = ? and isnull(po_id,0) = ? and isnull(chk_id,0) = ?
               and isnull(ltrim(rtrim(c_arrive_code)),'') = ?",
            explode("|", $businessKey, 4)
        );
        if (!empty($existing)) {
            $db->RollBackTran();
            echo json_encode(array("reval" => 1, "success" => "Error", "msg" => "รายการนี้ถูกยืนยันไปแล้ว (pr_id/po_id/chk_id/เลขที่ใบรับของตรงกับรายการเดิม)"));
            exit;
        }

        $hdrData = array();
        foreach ($HDR_FIELD_MAP as $col => $itemKey) {
            $val = $item[$itemKey] ?? null;
            if (in_array($col, $HDR_INT_FIELDS, true)) {
                $val = ($val === null || $val === "") ? null : intval($val);
            } elseif (in_array($col, $HDR_AMT_FIELDS, true)) {
                $val = ($val === null || $val === "") ? null : floatval($val);
            } else {
                $val = ($val === null || $val === "") ? null : (string) $val;
            }
            $hdrData[$col] = $val;
        }
        $hdrData["c_doc_ref"] = docRefToText($item["c_doc_ref"] ?? null);
        $hdrData["i_enabled"] = 1;
        $hdrData["dc_user_create_id"] = $_SESSION["user_id"] ?? null;
        $hdrData["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"] ?? null;
        $hdrData["d_create"] = date("Y-m-d H:i:s");
        $hdrData["dc_user_update_id"] = $_SESSION["user_id"] ?? null;
        $hdrData["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"] ?? null;
        $hdrData["d_update"] = date("Y-m-d H:i:s");
        $hdrData["c_transaction_id"] = trim((string) ($_REQUEST["transaction_id"] ?? "")) ?: null;
        $hdrData["d_source_datetime"] = trim((string) ($_REQUEST["datetime"] ?? "")) ?: null;
        $hdrData["c_source_file"] = basename((string) ($_REQUEST["source_file"] ?? "")) ?: null;

        $addField = '';
        $addValue = '';
        $arrValue = [];
        foreach ($hdrData as $fld => $value) {
            $arrValue[] = ($value !== "" && $value !== null) ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $addField = substr($addField, 2);
        $addValue = substr($addValue, 2);

        // ต้องดึง SCOPE_IDENTITY() จาก "ชุดคำสั่งเดียวกัน" กับ INSERT เท่านั้น เพราะ
        // driver sqlsrv ส่งแต่ละ QueryParam() ผ่าน sp_executesql ซึ่งนับเป็นการเข้า scope
        // ใหม่ทุกครั้ง
        $sql = "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_medsup_ir_confirm_hdr ({$addField}) VALUES ({$addValue}); SELECT SCOPE_IDENTITY() AS id;";
        $stmt = $db->QueryParam($sql, $arrValue);
        if ($stmt) {
            $idRow = $db->Fetch($stmt);
            $newId = intval($idRow['id'] ?? 0);
            $stmt = saveMedSupIrConfirmLines($db, $newId, $item["line_ids"] ?? array(), $_SESSION["user_id"] ?? null);
        }
        break;

    case "UPDATE":
        $data = $util->mnUser($_REQUEST);

        $headerDateFields = array("d_start_date", "d_contract_start_date", "d_end_date", "d_arrive_date", "d_checking_date");
        foreach ($headerDateFields as $fld) {
            $data[$fld] = !empty($data[$fld]) ? $date->bc_to_ad($data[$fld]) : null;
        }
        $data["f_period_amt"] = isset($data["f_period_amt"]) && $data["f_period_amt"] !== "" ? floatval(str_replace(",", "", $data["f_period_amt"])) : null;

        unset($data["mode"]);
        $id = $data["sp_medsup_ir_confirm_hdr_id"];
        unset($data["sp_medsup_ir_confirm_hdr_id"]);
        unset($data["dc_user_create_id"]);
        unset($data["dc_user_create_cost_id"]);
        unset($data["d_create"]);
        // ค่าพวกนี้แก้ไขผ่านฟอร์มนี้ไม่ได้ (มาจาก log ต้นทางเสมอ) กันหลุดเป็น null โดยไม่ตั้งใจ
        unset($data["c_transaction_id"]);
        unset($data["d_source_datetime"]);
        unset($data["c_source_file"]);

        $addField = '';
        $arrValue = [];
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value !== "" && $value !== null) ? $value : null;
            $addField .= ", {$fld} = ?";
        }
        $addField = substr($addField, 2);
        $arrValue[] = $id;

        $sql = "SET NOCOUNT ON; UPDATE NMU_ERP.dbo.sp_medsup_ir_confirm_hdr SET {$addField} WHERE sp_medsup_ir_confirm_hdr_id = ?;";
        $stmt = $db->QueryParam($sql, $arrValue);
        break;

    case "DELETE":
        $sql = "UPDATE NMU_ERP.dbo.sp_medsup_ir_confirm_hdr SET i_enabled = 0 WHERE sp_medsup_ir_confirm_hdr_id = ?";
        $arrParam = array($_REQUEST["sp_medsup_ir_confirm_hdr_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;

    default:
        $stmt = false;
        break;
}

if ($stmt) {
    $db->CommitTran();
    $re = array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว");
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => "check statement");
}

echo json_encode($re);
exit;
