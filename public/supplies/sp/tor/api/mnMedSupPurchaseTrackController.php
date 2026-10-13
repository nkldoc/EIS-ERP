<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$data = $util->mnUser($_REQUEST);

$dateFields = array("d_pr_date", "d_approve_date", "d_po_date", "d_due_date", "d_receive_date", "d_withdraw_send_date");
foreach ($dateFields as $fld) {
    if (!empty($data[$fld])) {
        $data[$fld] = $date->bc_to_ad($data[$fld]);
    } else {
        $data[$fld] = null;
    }
}

$amtFields = array("f_pr_amt", "f_remain_all", "f_withdraw_amt", "f_remain_after_withdraw");
foreach ($amtFields as $fld) {
    $data[$fld] = isset($data[$fld]) && $data[$fld] !== "" ? floatval(str_replace(",", "", $data[$fld])) : null;
}

$data["i_enabled"] = 1;
$data["dc_cost_id"] = $_SESSION["dc_cost_id"] ?? null;
$data["dc_user_create_id"] = $_SESSION["user_id"] ?? null;
$data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"] ?? null;
$data["d_create"] = date("Y-m-d H:i:s");
$data["dc_user_update_id"] = $_SESSION["user_id"] ?? null;
$data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"] ?? null;
$data["d_update"] = date("Y-m-d H:i:s");

// bill_ids[] ไม่ใช่คอลัมน์ของ sp_medsup_purchase_track (เก็บแยกในตารางเชื่อม
// sp_medsup_purchase_track_bill) ต้องดึงออกจาก $data ก่อนวน insert/update ปกติ
$billIds = array();
if (!empty($_REQUEST["bill_ids"])) {
    foreach ((array) $_REQUEST["bill_ids"] as $bid) {
        if (intval($bid) > 0) {
            $billIds[] = intval($bid);
        }
    }
}
unset($data["bill_ids"]);

// ผูกรายการบิลที่เลือกไว้ (ST00092) เข้ากับ sp_medsup_purchase_track_id ที่ระบุ
// ลบของเดิมแล้วเพิ่มใหม่ทั้งหมด (เหมือน pattern อื่นในระบบนี้) พร้อมคำนวณ
// c_bill_no เป็นข้อความสรุป (คั่น /) ไว้แสดงในกริดโดยไม่ต้อง join ทุกครั้ง
function linkMedSupPurchaseTrackBills($db, $trackId, $billIds, $userId) {
    $db->QueryParam("DELETE NMU_ERP.dbo.sp_medsup_purchase_track_bill WHERE sp_medsup_purchase_track_id = ?", array($trackId));

    $c_bill_no = "";
    if (!empty($billIds)) {
        foreach ($billIds as $bid) {
            $db->QueryParam(
                "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_medsup_purchase_track_bill (sp_medsup_purchase_track_id, sp_tor_period_bill_id, d_create, dc_user_create_id) VALUES (?, ?, GETDATE(), ?);",
                array($trackId, $bid, $userId)
            );
        }
        $in = implode(",", array_map("intval", $billIds));
        $refs = array();
        $stmtRef = $db->QueryParam("SELECT c_doc_ref FROM NMU_ERP.dbo.sp_tor_period_bill WHERE sp_tor_period_bill_id IN ({$in}) ORDER BY sp_tor_period_bill_id", array());
        while ($r = $db->Fetch($stmtRef)) {
            $refs[] = $r["c_doc_ref"];
        }
        $c_bill_no = implode(" / ", $refs);
    }
    $db->QueryParam("UPDATE NMU_ERP.dbo.sp_medsup_purchase_track SET c_bill_no = ? WHERE sp_medsup_purchase_track_id = ?", array($c_bill_no, $trackId));
}

$stmt = true;
$db->BeginTran();

switch ($mode) {
    case "ADD":
        unset($data["mode"]);
        unset($data["sp_medsup_purchase_track_id"]);

        $addField = '';
        $addValue = '';
        $arrValue = [];
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value !== "" && $value !== null) ? $value : null;
            $addField .= ", {$fld}";
            $addValue .= ", ?";
        }
        $addField = substr($addField, 2);
        $addValue = substr($addValue, 2);

        // ต้องดึง SCOPE_IDENTITY() จาก "ชุดคำสั่งเดียวกัน" กับ INSERT เท่านั้น เพราะ
        // driver sqlsrv ส่งแต่ละ QueryParam() ผ่าน sp_executesql ซึ่งนับเป็นการเข้า scope
        // ใหม่ทุกครั้ง - ถ้าไปเรียก SELECT SCOPE_IDENTITY() แยกเป็นอีก QueryParam() หนึ่ง
        // จะได้ค่าว่าง/0 เสมอ (เจอบั๊กนี้จริงตอนทดสอบ)
        $sql = "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_medsup_purchase_track ({$addField}) VALUES ({$addValue}); SELECT SCOPE_IDENTITY() AS id;";
        $stmt = $db->QueryParam($sql, $arrValue);
        if ($stmt) {
            $idRow = $db->Fetch($stmt);
            $newId = intval($idRow['id'] ?? 0);
            linkMedSupPurchaseTrackBills($db, $newId, $billIds, $_SESSION["user_id"] ?? null);
        }
        break;

    case "UPDATE":
        unset($data["mode"]);
        $id = $data["sp_medsup_purchase_track_id"];
        unset($data["sp_medsup_purchase_track_id"]);
        unset($data["dc_user_create_id"]);
        unset($data["dc_user_create_cost_id"]);
        unset($data["d_create"]);

        $addField = '';
        $arrValue = [];
        foreach ($data as $fld => $value) {
            $arrValue[] = ($value !== "" && $value !== null) ? $value : null;
            $addField .= ", {$fld} = ?";
        }
        $addField = substr($addField, 2);
        $arrValue[] = $id;

        $sql = "SET NOCOUNT ON; UPDATE NMU_ERP.dbo.sp_medsup_purchase_track SET {$addField} WHERE sp_medsup_purchase_track_id = ?;";
        $stmt = $db->QueryParam($sql, $arrValue);
        if ($stmt) {
            linkMedSupPurchaseTrackBills($db, $id, $billIds, $_SESSION["user_id"] ?? null);
        }
        break;

    case "DELETE":
        $sql = "UPDATE NMU_ERP.dbo.sp_medsup_purchase_track SET i_enabled = 0 WHERE sp_medsup_purchase_track_id = ?";
        $arrParam = array($_REQUEST["sp_medsup_purchase_track_id"]);
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
