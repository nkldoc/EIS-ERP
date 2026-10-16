<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
include(__DIR__ . "/medsupVatDraft.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

// จัดการรายการ "รับของ" ย่อยของแต่ละงวด (sp_tor_period_bill_receive) สำหรับเมนู
// "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - แยกไฟล์ควบคุมออกจาก mnMedSupPeriodBillController.php
// เพราะเป็นตารางคนละก้อน ไม่เกี่ยวกับ flow บันทึกสัญญา/งวดเดิม

// รหัสหน่วยงานตามประเภท (c_ap_dept_type) - สอดคล้องกับ Ext.MEDSUP_AP_DEPT_COST ฝั่ง
// regTorMedSup.js (APPS พัสดุ=38 / APMD เภสัช=50 / APMS เวชภัณฑ์=82) ใช้ทำ prefix เลข AP
function medsupApDeptCostId($deptType)
{
    $map = array("APPS" => 38, "APMD" => 50, "APMS" => 82);
    return $map[$deptType] ?? 82;
}

// เลข AP รูปแบบ {dc_cost_id}-{ประเภทหน่วยงาน}-{ปีงบประมาณ พ.ศ.}-{เลขรัน 6 หลัก} เช่น
// 82-APMS-2570-000030 - เลขรันแยกชุดกันทั้งต่อหน่วยงานและต่อปีงบประมาณ (ขึ้นปีงบใหม่
// เริ่มนับ 000001 ใหม่ ตามที่ผู้ใช้ยืนยัน) ปีงบประมาณไทยเริ่ม 1 ต.ค. - เดือน ต.ค.-ธ.ค.
// ถือเป็นปีงบถัดไปแล้ว (รูปแบบเดียวกับ medsupGenContractCode ใน mnMedSupPeriodBillController.php)
function medsupGenApCode($db, $deptType)
{
    $costId = medsupApDeptCostId($deptType);
    $now = new DateTime();
    $yearBE = intval($now->format("Y")) + 543;
    $fiscalYear = (intval($now->format("n")) >= 10) ? $yearBE + 1 : $yearBE;
    $prefix = $costId . "-" . $deptType . "-" . $fiscalYear . "-";

    $stmt = $db->QueryParam(
        "SELECT c_ap_code FROM NMU_ERP.dbo.sp_tor_period_bill_receive WHERE c_ap_code LIKE ? + '%'",
        array($prefix)
    );
    $maxNum = 0;
    while ($row = $db->Fetch($stmt)) {
        $tail = substr($row["c_ap_code"], strlen($prefix));
        if (ctype_digit($tail)) {
            $maxNum = max($maxNum, intval($tail));
        }
    }
    return $prefix . str_pad($maxNum + 1, 6, "0", STR_PAD_LEFT);
}

// เลข IR รูปแบบ IR{dc_cost_id}-{ปีงบประมาณ พ.ศ. 2 หลัก}-{เลขรัน 5 หลัก} เช่น IR50-69-00001
// (50 = หน่วยงานตาม c_ap_dept_type, 69 = ปีงบ 2569) เลขรันแยกชุดกันทั้งต่อหน่วยงานและต่อ
// ปีงบ ขึ้นปีงบใหม่เริ่ม 00001 ใหม่ - นับปีงบแบบเดียวกับ medsupGenApCode (เดือน ต.ค.-ธ.ค.
// ถือเป็นปีงบถัดไปแล้ว) เลข IR รูปแบบเก่า "IR-000033" ไม่ขึ้นต้นด้วย prefix นี้ จึงไม่ถูกนับรวม
function medsupGenIrCode($db, $deptType)
{
    $costId = medsupApDeptCostId($deptType);
    $now = new DateTime();
    $yearBE = intval($now->format("Y")) + 543;
    $fiscalYear = (intval($now->format("n")) >= 10) ? $yearBE + 1 : $yearBE;
    $prefix = "IR" . $costId . "-" . substr((string) $fiscalYear, -2) . "-";

    $stmt = $db->QueryParam(
        "SELECT DISTINCT c_ir_code FROM NMU_ERP.dbo.sp_tor_period_bill_receive WHERE c_ir_code LIKE ? + '%'",
        array($prefix)
    );
    $maxNum = 0;
    while ($row = $db->Fetch($stmt)) {
        $tail = substr($row["c_ir_code"], strlen($prefix));
        if (ctype_digit($tail)) {
            $maxNum = max($maxNum, intval($tail));
        }
    }
    return $prefix . str_pad($maxNum + 1, 5, "0", STR_PAD_LEFT);
}

$mode = $_REQUEST["mode"] ?? null;
$stmt = true;
$errMsg = "check statement";
// ค่าเสริมที่บาง mode (ISSUE_AP/SAVE_CHECKING) อยากส่งกลับไปให้ client โชว์เลย เช่น
// c_ap_code ที่เพิ่งออก - กันปัญหาที่ผู้ใช้กดบันทึกแล้วไม่เห็นเลขที่เพิ่งออกเลย
$responseExtra = array();
$db->BeginTran();

switch ($mode) {
    case "ADD":
        $arrParam = array(
            $_REQUEST["sp_tor_period_bill_id"] ?? null,
            trim((string) ($_REQUEST["c_receive_code"] ?? "")),
            !empty($_REQUEST["d_receive_date"]) ? $date->bc_to_ad($_REQUEST["d_receive_date"]) : null,
            trim((string) ($_REQUEST["c_detail"] ?? "")),
            isset($_REQUEST["f_amt"]) && $_REQUEST["f_amt"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_amt"])) : null,
            trim((string) ($_REQUEST["c_erp_stock_code"] ?? "")),
            $_SESSION["user_id"] ?? null,
            $_SESSION["dc_cost_id"] ?? null,
        );
        $sql = "SET NOCOUNT ON;
                INSERT INTO NMU_ERP.dbo.sp_tor_period_bill_receive
                    (sp_tor_period_bill_id, c_receive_code, d_receive_date, c_detail, f_amt, c_erp_stock_code, i_enabled, dc_user_create_id, dc_user_create_cost_id, d_create)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, GETDATE());
                SELECT SCOPE_IDENTITY() AS new_id;";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;

    case "UPDATE":
        // แก้ไขได้เฉพาะ เลขที่รับของ/วันรับของ/รายละเอียด/จำนวนเงิน/เลขรับเข้าคลัง ERP
        // เท่านั้น - ไม่แตะ c_ap_code/d_ap_issue เลย ถ้าเคยออกเลข AP ไปแล้วจะยังคงเลขเดิมไว้
        // ไม่ออกใหม่
        $arrParam = array(
            trim((string) ($_REQUEST["c_receive_code"] ?? "")),
            !empty($_REQUEST["d_receive_date"]) ? $date->bc_to_ad($_REQUEST["d_receive_date"]) : null,
            trim((string) ($_REQUEST["c_detail"] ?? "")),
            isset($_REQUEST["f_amt"]) && $_REQUEST["f_amt"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_amt"])) : null,
            trim((string) ($_REQUEST["c_erp_stock_code"] ?? "")),
            $_SESSION["user_id"] ?? null,
            $_SESSION["dc_cost_id"] ?? null,
            $_REQUEST["sp_tor_period_bill_receive_id"] ?? null,
        );
        // จำนวนเงินเปลี่ยน = ยอด VAT ของ IR ที่ยืนยันไว้ใช้ไม่ได้แล้ว ต้องล้างสถานะยืนยัน
        // (แก้แค่เลขที่/วันที่/รายละเอียด ไม่กระทบยอด ไม่ต้องล้าง)
        $oldAmt = $db->GetDataBySQL(
            "select f_amt from NMU_ERP.dbo.sp_tor_period_bill_receive where sp_tor_period_bill_receive_id = ?",
            array($_REQUEST["sp_tor_period_bill_receive_id"] ?? null)
        );
        // IR ออกเลขตรวจรับ (AP) แล้ว = ล็อก ห้ามเปลี่ยนจำนวนเงิน (แก้เลขที่/วันที่/รายละเอียดได้)
        $apLock = medsupApCodeByRow($db, $_REQUEST["sp_tor_period_bill_receive_id"] ?? null);
        if ($apLock !== "" && abs(round(floatval($oldAmt), 2) - round(floatval($arrParam[3]), 2)) >= 0.005) {
            $stmt = false;
            $errMsg = "รายการนี้ออกเลขตรวจรับ (AP) {$apLock} แล้ว แก้ไขจำนวนเงินไม่ได้";
            break;
        }
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                SET c_receive_code = ?, d_receive_date = ?, c_detail = ?, f_amt = ?, c_erp_stock_code = ?
                    , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                WHERE sp_tor_period_bill_receive_id = ?";
        $stmt = $db->QueryParam($sql, $arrParam);
        if ($stmt && abs(round(floatval($oldAmt), 2) - round(floatval($arrParam[3]), 2)) >= 0.005) {
            $stmt = medsupResetIrConfirmByRow($db, $_REQUEST["sp_tor_period_bill_receive_id"] ?? null);
        }
        break;

    case "DELETE":
        // ลบรายการออกจาก IR ที่ยืนยันยอดไว้แล้ว = ยอดรวมเปลี่ยน ล้างสถานะยืนยันก่อน (ต้องทำ
        // ก่อน i_enabled = 0 เพราะ helper หา IR จากแถวนี้)
        $apLock = medsupApCodeByRow($db, $_REQUEST["sp_tor_period_bill_receive_id"] ?? null);
        if ($apLock !== "") {
            $stmt = false;
            $errMsg = "รายการนี้ออกเลขตรวจรับ (AP) {$apLock} แล้ว ลบไม่ได้";
            break;
        }
        $stmt = medsupResetIrConfirmByRow($db, $_REQUEST["sp_tor_period_bill_receive_id"] ?? null);
        if (!$stmt) {
            break;
        }
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                SET i_enabled = 0, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                WHERE sp_tor_period_bill_receive_id = ?";
        $arrParam = array(
            $_SESSION["user_id"] ?? null,
            $_SESSION["dc_cost_id"] ?? null,
            $_REQUEST["sp_tor_period_bill_receive_id"] ?? null,
        );
        $stmt = $db->QueryParam($sql, $arrParam);
        break;

    case "UNLOCK_AP":
        // [ผู้ใช้ยืนยัน] ผู้ดูแลระบบปลดล็อกเลข IR ที่ออกเลขตรวจรับ (AP) แล้ว ด้วย "ID ปลดล็อก" ที่
        // ผู้ใช้แจ้งมา (sp_tor_period_bill_receive_id ที่ขึ้นบนหน้าจอ - แถวไหนของ IR ก็ได้)
        // ปลดล็อกทั้ง IR ให้แก้ VAT/จำนวนเงินได้ แก้เสร็จกด "ยืนยันยอด" แล้วล็อกคืนเอง
        if (!medsupIsAdmin()) {
            $stmt = false;
            $errMsg = "เฉพาะผู้ดูแลระบบเท่านั้นที่ปลดล็อกได้";
            break;
        }
        $unlockId = intval($_REQUEST["unlock_id"] ?? 0);
        $rowUnlock = $unlockId > 0 ? $db->Fetch($db->QueryParam(
            "select r.c_ir_code, (select top 1 r2.c_ap_code from NMU_ERP.dbo.sp_tor_period_bill_receive r2
                                  where r2.c_ir_code = r.c_ir_code and r2.i_enabled = 1 and r2.c_ap_code is not null) as c_ap_code
             from NMU_ERP.dbo.sp_tor_period_bill_receive r
             where r.sp_tor_period_bill_receive_id = ? and r.i_enabled = 1",
            array($unlockId)
        )) : null;
        if (empty($rowUnlock) || empty($rowUnlock["c_ir_code"])) {
            $stmt = false;
            $errMsg = "ไม่พบ ID ปลดล็อก {$unlockId}";
            break;
        }
        if (empty($rowUnlock["c_ap_code"])) {
            $stmt = false;
            $errMsg = "เลข IR {$rowUnlock["c_ir_code"]} ยังไม่ได้ออกเลขตรวจรับ (ไม่ได้ล็อก)";
            break;
        }
        $stmt = $db->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
             SET b_ap_unlock = 1, d_ap_unlock = GETDATE(), dc_user_ap_unlock_id = ?
             WHERE c_ir_code = ? AND i_enabled = 1",
            array($_SESSION["user_id"] ?? null, $rowUnlock["c_ir_code"])
        );
        $responseExtra["c_ir_code"] = $rowUnlock["c_ir_code"];
        $responseExtra["c_ap_code"] = $rowUnlock["c_ap_code"];
        break;

    case "CONFIRM_IR":
        // [ผู้ใช้ยืนยัน] ปุ่ม "ยืนยันยอด" ท้ายแถว IR ที่ ST00095 - ยอด VAT รวมของ IR = ผลรวม
        // รายการย่อย ต้องถูกต้องก่อน (ทุกรายการบันทึก VAT แล้วและจำนวนเงินไม่ถูกแก้ภายหลัง)
        // ผ่านแล้วตั้ง b_ir_confirm ให้ทุกแถวของ IR -> IR ไหลไปขึ้นหน้าตรวจรับ (ST00096)
        // ไม่ผ่าน = แจ้งให้กลับไปแก้ VAT ของรายการที่ผิด
        $irCode = trim((string) ($_REQUEST["c_ir_code"] ?? ""));
        $m = $irCode === "" ? null : medsupIrMoney($db, $irCode);
        if ($m === null) {
            $stmt = false;
            $errMsg = "ไม่พบรายการของเลข IR {$irCode}";
            break;
        }
        $apLock = $db->GetDataBySQL(
            "select top 1 c_ap_code from NMU_ERP.dbo.sp_tor_period_bill_receive
             where c_ir_code = ? and i_enabled = 1 and c_ap_code is not null and isnull(b_ap_unlock, 0) = 0",
            array($irCode)
        );
        if (!empty($apLock)) {
            $stmt = false;
            $errMsg = "เลข IR {$irCode} ออกเลขตรวจรับ (AP) {$apLock} แล้ว ยืนยันยอดใหม่ไม่ได้ (ต้องให้ผู้ดูแลระบบปลดล็อกก่อน)";
            break;
        }
        if (!empty($m["unconfirmed"])) {
            $stmt = false;
            $errMsg = "ยอด VAT ของเลข IR {$irCode} คำนวณผิด / ยังไม่ถูกต้อง กรุณากลับไปแก้ไขรายการ"
                . "<br>- " . implode("<br>- ", $m["unconfirmed"])
                . "<br><br>ดับเบิลคลิกเลข IR {$irCode} &gt; เลือกรายการ &gt; กดปุ่ม \"แก้ไข VAT\" &gt; บันทึกร่าง แล้วกดยืนยันยอดใหม่";
            break;
        }
        // ยืนยันยอดแล้ว = ล็อกกลับเสมอ (IR ที่ผู้ดูแลระบบปลดล็อกไว้ให้แก้ แก้เสร็จยืนยันแล้วล็อกคืน)
        $stmt = $db->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
             SET b_ir_confirm = 1, d_ir_confirm = GETDATE(), dc_user_ir_confirm_id = ?, b_ap_unlock = 0
             WHERE c_ir_code = ? AND i_enabled = 1",
            array($_SESSION["user_id"] ?? null, $irCode)
        );
        if (!$stmt) {
            break;
        }
        // เคยบันทึกตรวจรับไว้แล้ว - ให้ยอดในข้อมูลตรวจรับตรงกับยอดที่เพิ่งยืนยัน
        $stmt = $db->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill_checking
             SET f_total_vat = ?, b_vat = ?, f_vat_percent = ?, f_before_vat = ?, f_vat_amt = ?, f_request_amt = ?
                , b_wht = ?, f_wht_percent = ?, f_wht_amt = ?, f_penalty = ?
                , b_guarantee = ?, f_guarantee_percent = ?, f_guarantee_amt = ?, f_other = ?, f_pay_amt = ?
                , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
             WHERE c_ir_code = ? AND i_enabled = 1",
            array(
                $m["f_total_vat"], $m["b_vat"], $m["f_vat_percent"], $m["f_before_vat"], $m["f_vat_amt"], $m["f_request_amt"],
                $m["b_wht"], $m["f_wht_percent"], $m["f_wht_amt"], $m["f_penalty"],
                $m["b_guarantee"], $m["f_guarantee_percent"], $m["f_guarantee_amt"], $m["f_other"], $m["f_pay_amt"],
                $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null,
                $irCode,
            )
        );
        break;

    case "SAVE_VAT_DRAFT":
        // "ร่าง" ข้อมูล VAT/ภาษีหัก ณ ที่จ่าย/ค่าประกันผลงาน ของรายการรับของ 1 แถว ที่เมนู
        // "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - เก็บไว้ที่แถวรับของเอง (ยังไม่ออกเลข IR ก็
        // บันทึกได้ เพราะ sp_tor_period_bill_checking.c_ir_code เป็น NOT NULL) หน้าตรวจรับ
        // ST00096 ดึงผลรวมของทุกแถวใน IR ไปแสดง (List_MedSupPeriodBill.php
        // type=medsup_checking_by_ir -> medsupIrMoney)
        $hasVat = !empty($_REQUEST["b_vat"]) && $_REQUEST["b_vat"] !== "0";
        $hasWht = !empty($_REQUEST["b_wht"]) && $_REQUEST["b_wht"] !== "0";
        $hasGuarantee = !empty($_REQUEST["b_guarantee"]) && $_REQUEST["b_guarantee"] !== "0";
        $arrParam = array(
            isset($_REQUEST["f_total_vat"]) && $_REQUEST["f_total_vat"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_total_vat"])) : null,
            $hasVat ? 1 : 0,
            isset($_REQUEST["f_vat_percent"]) && $_REQUEST["f_vat_percent"] !== "" ? floatval($_REQUEST["f_vat_percent"]) : null,
            $hasWht ? 1 : 0,
            isset($_REQUEST["f_wht_percent"]) && $_REQUEST["f_wht_percent"] !== "" ? floatval($_REQUEST["f_wht_percent"]) : null,
            isset($_REQUEST["f_penalty"]) && $_REQUEST["f_penalty"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_penalty"])) : null,
            $hasGuarantee ? 1 : 0,
            isset($_REQUEST["f_guarantee_percent"]) && $_REQUEST["f_guarantee_percent"] !== "" ? floatval($_REQUEST["f_guarantee_percent"]) : null,
            isset($_REQUEST["f_other"]) && $_REQUEST["f_other"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_other"])) : null,
            // ยอด VAT/หัก ณ ที่จ่ายจริงในฟอร์ม (อาจแก้เองทับค่าจาก % หรือคงค่าเดิมไว้ตอนแก้
            // จำนวนเงินรายการ) - ดู scriptBaseUpdate/sp_tor_period_bill_receive_vat_draft_amt.sql
            $hasVat && isset($_REQUEST["f_vat_amt"]) && $_REQUEST["f_vat_amt"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_vat_amt"])) : null,
            $hasWht && isset($_REQUEST["f_wht_amt"]) && $_REQUEST["f_wht_amt"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_wht_amt"])) : null,
            $_SESSION["user_id"] ?? null,
            $_SESSION["dc_cost_id"] ?? null,
        );
        // [ผู้ใช้ยืนยัน] ร่าง VAT เก็บ "แยกรายการ" - บันทึกเฉพาะแถวที่เลือก
        // (sp_tor_period_bill_receive_id) ยอดของเลข IR = ผลรวมทุกรายการ (ดู medsupVatDraft.php)
        $receiveId = intval($_REQUEST["sp_tor_period_bill_receive_id"] ?? 0);
        if ($receiveId <= 0) {
            $stmt = false;
            $errMsg = "ไม่พบรายการรับของที่จะบันทึกร่าง VAT";
            break;
        }
        // [ผู้ใช้ยืนยัน] IR ออกเลขตรวจรับ (AP) แล้ว = ล็อก แก้ VAT ไม่ได้
        $apLock = medsupApCodeByRow($db, $receiveId);
        if ($apLock !== "") {
            $stmt = false;
            $errMsg = "รายการนี้ออกเลขตรวจรับ (AP) {$apLock} แล้ว แก้ไข VAT ไม่ได้";
            break;
        }
        $arrParam[] = $receiveId;
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                SET draft_f_total_vat = ?, draft_b_vat = ?, draft_f_vat_percent = ?
                    , draft_b_wht = ?, draft_f_wht_percent = ?, draft_f_penalty = ?
                    , draft_b_guarantee = ?, draft_f_guarantee_percent = ?, draft_f_other = ?
                    , draft_f_vat_amt = ?, draft_f_wht_amt = ?
                    , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                WHERE sp_tor_period_bill_receive_id = ? AND i_enabled = 1";
        $stmt = $db->QueryParam($sql, $arrParam);
        if (!$stmt) {
            break;
        }
        // แก้ VAT ของรายการใน IR ที่ยืนยันยอดไว้แล้ว = ต้องกดยืนยันยอดใหม่
        $stmt = medsupResetIrConfirmByRow($db, $receiveId);
        if (!$stmt) {
            break;
        }

        // [ผู้ใช้ยืนยัน] ยอดเงิน/VAT แก้ได้ที่หน้าส่งมอบงาน (ST00095) เท่านั้น หน้าตรวจรับ
        // (ST00096) ล็อกไว้แสดงอย่างเดียว - ถ้าแถวนี้ออกเลข IR แล้วและ IR นั้นบันทึก
        // รายละเอียดตรวจรับไปแล้ว (มีแถวใน sp_tor_period_bill_checking) ต้องคำนวณยอดรวม
        // ของทั้ง IR ใหม่ (ผลรวมทุกรายการ) แล้วอัปเดตในนั้นตามไปด้วย ไม่งั้นหน้าตรวจรับโชว์ยอดเก่า
        $irCode = $db->GetDataBySQL(
            "select c_ir_code from NMU_ERP.dbo.sp_tor_period_bill_receive where sp_tor_period_bill_receive_id = ?",
            array($receiveId)
        );
        if (empty($irCode)) {
            break;
        }
        $m = medsupIrMoney($db, $irCode);
        if ($m === null) {
            break;
        }
        // ไม่มีแถว checking (ยังไม่บันทึกตรวจรับ) = UPDATE ไม่โดนแถวไหน ไม่เป็นไร
        $stmt = $db->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill_checking
             SET f_total_vat = ?, b_vat = ?, f_vat_percent = ?, f_before_vat = ?, f_vat_amt = ?, f_request_amt = ?
                , b_wht = ?, f_wht_percent = ?, f_wht_amt = ?, f_penalty = ?
                , b_guarantee = ?, f_guarantee_percent = ?, f_guarantee_amt = ?, f_other = ?, f_pay_amt = ?
                , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
             WHERE c_ir_code = ? AND i_enabled = 1",
            array(
                $m["f_total_vat"], $m["b_vat"], $m["f_vat_percent"], $m["f_before_vat"], $m["f_vat_amt"], $m["f_request_amt"],
                $m["b_wht"], $m["f_wht_percent"], $m["f_wht_amt"], $m["f_penalty"],
                $m["b_guarantee"], $m["f_guarantee_percent"], $m["f_guarantee_amt"], $m["f_other"], $m["f_pay_amt"],
                $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null,
                $irCode,
            )
        );
        break;

    case "ISSUE_IR":
        // ออกเลข IR (ใบรับของ) ให้รายการที่เลือก - เลือกได้หลายรายการพร้อมกัน แล้วทุก
        // รายการที่เลือกในครั้งนี้จะได้ "เลข IR เดียวกัน" (รวมยอดกันเป็นก้อนเดียว เช่น
        // เลือก 2 รายการ 20+20 จะได้ IR เดียวกัน ยอดรวม 40) ไม่ใช่แยกคนละเลขทีละแถว -
        // เลขรูปแบบ IR{หน่วยงาน}-{ปีงบ 2 หลัก}-{เลขรัน 5 หลัก} เช่น IR50-69-00001 (ดู
        // medsupGenIrCode ด้านบนไฟล์)
        $ids = $_REQUEST["ids"] ?? array();
        if (is_string($ids)) {
            $ids = json_decode($ids, true) ?: array();
        }
        $ids = array_values(array_filter(array_map("intval", (array) $ids)));
        if (empty($ids)) {
            $stmt = false;
            break;
        }
        $placeholders = implode(",", array_fill(0, count($ids), "?"));

        // ค่าเริ่มต้น: รายการที่เลือกในครั้งนี้ (เฉพาะที่ติ๊กเลือกจริงๆ) จะได้เลข IR ใหม่
        // ทุกครั้ง แยกกันไปตามแต่ละครั้งที่กด - ไม่ไปยุ่งกับรายการอื่นในงวดเดียวกันที่เคย
        // ออกเลขไปแล้วโดยอัตโนมัติ (แก้จากที่เคยทำไว้ก่อนหน้านี้ที่ยึดจากทั้งงวด ทำให้
        // รายการที่ไม่เกี่ยวข้องกันถูกลากมารวมเลข IR เดียวกันโดยไม่ได้ตั้งใจ)
        // จะรวมเลขเดิมได้ก็ต่อเมื่อ "ติ๊กเลือกรายการ/แถวสรุปที่ออกเลขไปแล้วมาด้วย" ในครั้ง
        // นี้อย่างชัดเจน (เช่น ติ๊กแถวสรุปของ IR เดิม + รายการใหม่พร้อมกัน) เท่านั้น
        $existingIr = $db->GetDataBySQL(
            "select top 1 c_ir_code from NMU_ERP.dbo.sp_tor_period_bill_receive
             where sp_tor_period_bill_receive_id in ({$placeholders}) and c_ir_code is not null",
            $ids
        );
        if (!empty($existingIr)) {
            $irCode = $existingIr;
        } else {
            // หน่วยงานของเลข IR มาจาก c_ap_dept_type ของงวด/สัญญาต้นทาง (เหมือน ISSUE_AP) -
            // เลือกมาจากคนละหน่วยงานปนกันห้ามออกเลขรวมกัน เพราะ prefix จะผิดสำหรับบางรายการ
            $deptTypes = array();
            $stmtDept = $db->QueryParam(
                "select distinct isnull(g.c_ap_dept_type, 'APMS') as c_ap_dept_type
                 from NMU_ERP.dbo.sp_tor_period_bill_receive r
                 inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
                 where r.sp_tor_period_bill_receive_id in ({$placeholders})",
                $ids
            );
            while ($rowDept = $db->Fetch($stmtDept)) {
                $deptTypes[] = $rowDept["c_ap_dept_type"];
            }
            if (count($deptTypes) > 1) {
                $stmt = false;
                $errMsg = "รายการที่เลือกมาจากคนละหน่วยงานกัน (" . implode(", ", $deptTypes) . ") ออกเลข IR รวมกันไม่ได้ กรุณาแยกออกเลขทีละหน่วยงาน";
                break;
            }
            $irCode = medsupGenIrCode($db, !empty($deptTypes[0]) ? $deptTypes[0] : "APMS");
        }

        $arrParam = array_merge(
            array($irCode, $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null),
            $ids
        );
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                SET c_ir_code = ?, d_ir_issue = GETDATE()
                    , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                WHERE sp_tor_period_bill_receive_id IN ({$placeholders}) AND i_enabled = 1 AND c_ir_code IS NULL";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;

    case "ISSUE_AP":
        // ออกเลข AP ให้รายการที่เลือก - เลือกได้หลายรายการ/หลายเลข IR พร้อมกัน (เช่น
        // IR1+IR2) แล้วทุกรายการที่เลือกในครั้งนี้จะได้ "เลข AP เดียวกัน" (รวมยอดกันเป็น
        // ก้อนเดียว ตามโฟลของเมนู "ส่งมอบงาน" เดิม ST0012) ต้องมีเลข IR อยู่แล้วเท่านั้น
        // ถึงจะออกเลข AP ได้ (AND c_ir_code IS NOT NULL) ตอนนี้ยังเป็นการจำลอง (mock)
        // ไปก่อน ยังไม่เชื่อม API ออกเลข AP จริง เลยแค่ generate โค้ดรูปแบบ
        // "82-APMS-2570-000030" (dc_cost_id-ประเภทหน่วยงาน-ปีงบประมาณ พ.ศ.-เลขรัน 6 หลัก
        // แยกชุดกันต่อหน่วยงาน/ต่อปีงบ ดู medsupGenApCode ด้านบนไฟล์) แล้วปั๊มวันที่ออกให้
        // - ค่อยไปผูก API จริงทีหลัง
        // prefix (APPS พัสดุ/APMD เภสัช/APMS เวชภัณฑ์) มาจากคอลัมน์ c_ap_dept_type ของ
        // สัญญา/งวดต้นทาง (ผูกกับ "ประเภท" ที่เลือกไว้ในหน้า "บันทึกรายละเอียดในสัญญา
        // (เวชภัณฑ์)" จริงๆ แล้ว ไม่ hardcode เป็น APMS ตายตัวอีกต่อไป)
        $ids = $_REQUEST["ids"] ?? array();
        if (is_string($ids)) {
            $ids = json_decode($ids, true) ?: array();
        }
        $ids = array_values(array_filter(array_map("intval", (array) $ids)));

        // เมนู "ตรวจรับ (เวชภัณฑ์)" เลือกเป็นระดับ "เลข IR" (ไม่ใช่รายแถวดิบ) - ส่ง
        // ir_codes มาแทน ids ได้ ให้ขยายเป็นรายการย่อยจริงทั้งหมดของแต่ละ IR ที่ยังไม่ออก
        // เลข AP ก่อนประมวลผลต่อ (รองรับทั้งสองแบบ เผื่อมีจุดเรียกอื่นในอนาคตที่รู้ id ตรงๆ)
        $irCodes = $_REQUEST["ir_codes"] ?? array();
        if (is_string($irCodes)) {
            $irCodes = json_decode($irCodes, true) ?: array();
        }
        $irCodes = array_values(array_filter(array_map("strval", (array) $irCodes)));
        if (!empty($irCodes)) {
            $irPlaceholders = implode(",", array_fill(0, count($irCodes), "?"));
            $stmtIrIds = $db->QueryParam(
                "select sp_tor_period_bill_receive_id from NMU_ERP.dbo.sp_tor_period_bill_receive
                 where c_ir_code in ({$irPlaceholders}) and c_ap_code is null and i_enabled = 1",
                $irCodes
            );
            while ($rowIrId = $db->Fetch($stmtIrIds)) {
                $ids[] = intval($rowIrId["sp_tor_period_bill_receive_id"]);
            }
            $ids = array_values(array_unique($ids));
        }

        if (empty($ids)) {
            $stmt = false;
            break;
        }
        $placeholders = implode(",", array_fill(0, count($ids), "?"));

        // ต้องกรอกรายละเอียดตรวจรับ (sp_tor_period_bill_checking - โดยเฉพาะ
        // c_disburse_detail "รายการส่งเบิก") ให้ครบทุกเลข IR ที่เกี่ยวข้องก่อน ถึงจะ
        // ออกเลข AP ได้ (เงื่อนไขที่ผู้ใช้ระบุไว้ - บังคับจริงฝั่งเซิร์ฟเวอร์ ไม่ใช่แค่
        // ฝั่ง UI เหมือนที่ ST0013 เดิมทำ)
        $irCodesInIds = array();
        $stmtIrOfIds = $db->QueryParam(
            "select distinct c_ir_code from NMU_ERP.dbo.sp_tor_period_bill_receive
             where sp_tor_period_bill_receive_id in ({$placeholders}) and c_ir_code is not null",
            $ids
        );
        while ($rowIr = $db->Fetch($stmtIrOfIds)) {
            $irCodesInIds[] = $rowIr["c_ir_code"];
        }
        if (!empty($irCodesInIds)) {
            $irCheckPlaceholders = implode(",", array_fill(0, count($irCodesInIds), "?"));
            $readyIrCodes = array();
            $stmtReady = $db->QueryParam(
                "select c_ir_code from NMU_ERP.dbo.sp_tor_period_bill_checking
                 where c_ir_code in ({$irCheckPlaceholders}) and i_enabled = 1
                    and c_disburse_detail is not null and ltrim(rtrim(c_disburse_detail)) <> ''",
                $irCodesInIds
            );
            while ($rowReady = $db->Fetch($stmtReady)) {
                $readyIrCodes[] = $rowReady["c_ir_code"];
            }
            $missingIrCodes = array_values(array_diff($irCodesInIds, $readyIrCodes));
            if (!empty($missingIrCodes)) {
                $stmt = false;
                $errMsg = "กรุณากรอกรายละเอียดตรวจรับ (รายการส่งเบิก) ให้ครบก่อนออกเลข AP - เลข IR ที่ยังไม่ได้กรอก: " . implode(", ", $missingIrCodes);
                break;
            }

            // [ผู้ใช้ยืนยัน] ยอดเงินที่บันทึกตรวจรับไว้ของแต่ละ IR ต้องตรงกับผลรวมรายการย่อย
            // (เหมือนเช็คใน SAVE_CHECKING) ไม่ผ่านแม้ IR เดียวก็ไม่ออกเลข AP ให้ทั้งชุด
            $vatErrs = array();
            foreach ($irCodesInIds as $irChk) {
                $rowChk = $db->Fetch($db->QueryParam(
                    "select f_total_vat, f_vat_amt, f_wht_amt from NMU_ERP.dbo.sp_tor_period_bill_checking
                     where c_ir_code = ? and i_enabled = 1",
                    array($irChk)
                ));
                $vatErr = medsupIrVatCheck($db, $irChk, $rowChk["f_total_vat"] ?? 0, $rowChk["f_vat_amt"] ?? 0, $rowChk["f_wht_amt"] ?? 0);
                if ($vatErr !== "") {
                    $vatErrs[] = $vatErr;
                }
            }
            if (!empty($vatErrs)) {
                $stmt = false;
                $errMsg = implode("<br><br>", $vatErrs);
                break;
            }
        }

        // เช่นเดียวกับ ISSUE_IR: ค่าเริ่มต้นออกเลข AP ใหม่ทุกครั้งตามชุดที่เลือกในครั้งนี้
        // จะรวมเลขเดิมได้ก็ต่อเมื่อรายการที่ส่งมามีรายการที่มีเลข AP อยู่แล้วปนมาด้วย
        // (เลือกมาเพื่อรวมกลุ่มโดยเจตนา) ไม่ใช่รวมอัตโนมัติแค่เพราะเกี่ยวข้องกัน
        $existingAp = $db->GetDataBySQL(
            "select top 1 c_ap_code from NMU_ERP.dbo.sp_tor_period_bill_receive
             where sp_tor_period_bill_receive_id in ({$placeholders}) and c_ap_code is not null",
            $ids
        );

        if (!empty($existingAp)) {
            $apCode = $existingAp;
        } else {
            // หา prefix จากประเภทหน่วยงาน (c_ap_dept_type) ของงวด/สัญญาต้นทางของรายการ
            // ที่เลือกมาทั้งหมด - ถ้าเลือกมาจากคนละหน่วยงานปนกัน (เช่น IR ของ APMS +
            // IR ของ APPS) ห้ามออกเลข AP รวมกัน เพราะจะได้ prefix ผิดสำหรับบางรายการ
            $deptTypes = array();
            $stmtDept = $db->QueryParam(
                "select distinct isnull(g.c_ap_dept_type, 'APMS') as c_ap_dept_type
                 from NMU_ERP.dbo.sp_tor_period_bill_receive r
                 inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
                 where r.sp_tor_period_bill_receive_id in ({$placeholders})",
                $ids
            );
            while ($rowDept = $db->Fetch($stmtDept)) {
                $deptTypes[] = $rowDept["c_ap_dept_type"];
            }
            if (count($deptTypes) > 1) {
                $stmt = false;
                $errMsg = "รายการที่เลือกมาจากคนละหน่วยงานกัน (" . implode(", ", $deptTypes) . ") ออกเลข AP รวมกันไม่ได้ กรุณาแยกออกเลขทีละหน่วยงาน";
                break;
            }
            $deptType = !empty($deptTypes[0]) ? $deptTypes[0] : "APMS";
            $apCode = medsupGenApCode($db, $deptType);
        }

        $arrParam = array_merge(
            array($apCode, $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null),
            $ids
        );
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                SET c_ap_code = ?, d_ap_issue = GETDATE()
                    , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                WHERE sp_tor_period_bill_receive_id IN ({$placeholders}) AND i_enabled = 1
                    AND c_ap_code IS NULL AND c_ir_code IS NOT NULL";
        $stmt = $db->QueryParam($sql, $arrParam);
        $responseExtra["c_ap_code"] = $apCode;
        break;

    case "SAVE_CHECKING":
        // บันทึกรายละเอียดตรวจรับของเลข IR หนึ่งๆ (เมนู "ตรวจรับ (เวชภัณฑ์)") - เลียน
        // แบบฟิลด์ของฟอร์ม ST0013 เฉพาะที่ต้องการ ไม่ผูก GL/ตัดงบจริง คำนวณยอดสุทธิ
        // (ก่อน VAT/ภาษีหัก ณ ที่จ่าย/จำนวนเงินที่จ่าย) ใหม่ฝั่งเซิร์ฟเวอร์เสมอ ไม่เชื่อ
        // เลขที่ฝั่ง client ส่งมาให้เฉยๆ (กันกรอก/แก้ตัวเลขผิดเพี้ยนจากการคำนวณจริง)
        $irCode = trim((string) ($_REQUEST["c_ir_code"] ?? ""));
        $disburseDetail = trim((string) ($_REQUEST["c_disburse_detail"] ?? ""));
        $checkingDate = trim((string) ($_REQUEST["d_checking"] ?? ""));
        $egpNo = trim((string) ($_REQUEST["c_egp_no"] ?? ""));
        if ($irCode === "" || $disburseDetail === "" || $checkingDate === "" || $egpNo === "") {
            $stmt = false;
            $errMsg = "กรุณากรอกวันที่บันทึกการตรวจรับ/เลขที่ EGP/รายการส่งเบิก ให้ครบก่อนบันทึก";
            break;
        }

        $totalVat = isset($_REQUEST["f_total_vat"]) && $_REQUEST["f_total_vat"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_total_vat"])) : 0;
        $hasVat = !empty($_REQUEST["b_vat"]) && $_REQUEST["b_vat"] !== "0";
        $vatPercent = $hasVat && isset($_REQUEST["f_vat_percent"]) && $_REQUEST["f_vat_percent"] !== "" ? floatval($_REQUEST["f_vat_percent"]) : 0;
        $hasWht = !empty($_REQUEST["b_wht"]) && $_REQUEST["b_wht"] !== "0";
        $whtPercent = $hasWht && isset($_REQUEST["f_wht_percent"]) && $_REQUEST["f_wht_percent"] !== "" ? floatval($_REQUEST["f_wht_percent"]) : 0;
        $hasGuarantee = !empty($_REQUEST["b_guarantee"]) && $_REQUEST["b_guarantee"] !== "0";
        $guaranteePercent = $hasGuarantee && isset($_REQUEST["f_guarantee_percent"]) && $_REQUEST["f_guarantee_percent"] !== "" ? floatval($_REQUEST["f_guarantee_percent"]) : 0;
        $penalty = isset($_REQUEST["f_penalty"]) && $_REQUEST["f_penalty"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_penalty"])) : 0;
        $other = isset($_REQUEST["f_other"]) && $_REQUEST["f_other"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_other"])) : 0;

        // ค่าที่กรอกในช่อง "จำนวนเงินรวม VAT" คือยอดรวม (grand total) ที่รวม VAT ไว้แล้ว
        // จริงๆ - หักลบย้อนกลับหา "ยอดก่อน VAT" ด้วยการหาร (เช่น กรอก 107 VAT 7% ต้องได้
        // ยอดก่อน VAT = 107/1.07 = 100.00 พอดี, VAT = 107-100 = 7.00 พอดี) ภาษีหัก ณ
        // ที่จ่าย/ค่าประกันผลงาน คิดจาก "ยอดก่อน VAT" ที่หักลบมาแล้วนี้ (ไม่ใช่จากยอดรวม)
        // ตามธรรมเนียมการหักภาษี ณ ที่จ่ายทั่วไป - สูตรเดียวกับหน้า "ตรวจรับ" ต้นแบบ ST0013
        // ถ้า client ส่งค่า f_vat_amt/f_wht_amt มาด้วย (ฟิลด์เหล่านี้แก้ไขเองได้ฝั่ง UI
        // เผื่อยอดจริงในใบแจ้งหนี้ปัดเศษไม่ตรงกับที่คำนวณได้พอดี) ใช้ค่านั้นตรงๆ แทนการ
        // คำนวณจาก % round() ให้ปัดเศษแบบ 5/4 ตรงตำแหน่งทศนิยมที่ 2 เสมอ (ไม่ปล่อยเป็นเศษ
        // ทศนิยมยาว) "จำนวนเงินที่จ่าย" หักจาก "ยอดก่อน VAT" ไม่ใช่ยอดรวม (VAT จ่ายแยก
        // ต่างหาก ไม่รวมอยู่ในยอดที่จ่ายจริงให้ผู้ขาย ตามที่ผู้ใช้ยืนยัน)
        $beforeVatCalc = $hasVat && $vatPercent > 0 ? $totalVat / (1 + $vatPercent / 100) : $totalVat;
        $vatAmt = isset($_REQUEST["f_vat_amt"]) && $_REQUEST["f_vat_amt"] !== ""
            ? round(floatval(str_replace(",", "", $_REQUEST["f_vat_amt"])), 2)
            : round($totalVat - $beforeVatCalc, 2);
        $beforeVat = round($totalVat - $vatAmt, 2);
        $whtAmtCalc = $hasWht ? $beforeVat * $whtPercent / 100 : 0;
        $whtAmt = isset($_REQUEST["f_wht_amt"]) && $_REQUEST["f_wht_amt"] !== ""
            ? round(floatval(str_replace(",", "", $_REQUEST["f_wht_amt"])), 2)
            : round($whtAmtCalc, 2);
        $guaranteeAmt = $hasGuarantee ? round($beforeVat * $guaranteePercent / 100, 2) : 0;
        $requestAmt = $totalVat;
        // [ผู้ใช้ยืนยัน] จ่าย = ยอดรวม VAT - หัก ณ ที่จ่าย - ค่าปรับ - ค่าประกันผลงาน - อื่นๆ
        // (ถอด VAT: 107 -> ก่อน VAT 100 / หัก 1 / จ่าย 106) - ตรงกับ medsupIrMoney/หน้าจอ
        $payAmt = round($totalVat - $whtAmt - $penalty - $guaranteeAmt - $other, 2);

        $arrParam = array(
            !empty($_REQUEST["d_doc_complete"]) ? $date->bc_to_ad($_REQUEST["d_doc_complete"]) : null,
            $date->bc_to_ad($checkingDate),
            $egpNo,
            $disburseDetail,
            !empty($_REQUEST["i_budget_year_use"]) ? intval($_REQUEST["i_budget_year_use"]) : null,
            $totalVat,
            $hasVat ? 1 : 0,
            $vatPercent,
            $beforeVat,
            $vatAmt,
            $requestAmt,
            $hasWht ? 1 : 0,
            $whtPercent,
            $whtAmt,
            $penalty,
            $hasGuarantee ? 1 : 0,
            $guaranteePercent,
            $guaranteeAmt,
            $other,
            $payAmt,
            !empty($_REQUEST["dc_cost_responsible_id"]) ? intval($_REQUEST["dc_cost_responsible_id"]) : null,
            !empty($_REQUEST["dc_cost_owner_id"]) ? intval($_REQUEST["dc_cost_owner_id"]) : null,
            // 3 ฟิลด์ที่แก้ไขเองได้ในฟอร์มนี้โดยเฉพาะ (เดิมเป็นแค่ displayfield อ่านจาก
            // สัญญาต้นทางเฉยๆ) - ผู้ใช้ระบุว่าต้องแก้ไขได้ จึงเก็บแยกไว้ในตารางนี้ตรงๆ
            trim((string) ($_REQUEST["c_overlap_no"] ?? "")) !== "" ? trim((string) $_REQUEST["c_overlap_no"]) : null,
            !empty($_REQUEST["i_budget_year_ref"]) ? intval($_REQUEST["i_budget_year_ref"]) : null,
            trim((string) ($_REQUEST["c_item_name"] ?? "")) !== "" ? trim((string) $_REQUEST["c_item_name"]) : null,
            $_SESSION["user_id"] ?? null,
            $_SESSION["dc_cost_id"] ?? null,
            $irCode,
        );
        $sql = "IF EXISTS (SELECT 1 FROM NMU_ERP.dbo.sp_tor_period_bill_checking WHERE c_ir_code = ?)
                    UPDATE NMU_ERP.dbo.sp_tor_period_bill_checking
                    SET d_doc_complete = ?, d_checking = ?, c_egp_no = ?, c_disburse_detail = ?
                        , i_budget_year_use = ?, f_total_vat = ?, b_vat = ?, f_vat_percent = ?
                        , f_before_vat = ?, f_vat_amt = ?, f_request_amt = ?
                        , b_wht = ?, f_wht_percent = ?, f_wht_amt = ?, f_penalty = ?
                        , b_guarantee = ?, f_guarantee_percent = ?, f_guarantee_amt = ?, f_other = ?, f_pay_amt = ?
                        , dc_cost_responsible_id = ?, dc_cost_owner_id = ?
                        , c_overlap_no = ?, i_budget_year_ref = ?, c_item_name = ?
                        , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                    WHERE c_ir_code = ?
                ELSE
                    INSERT INTO NMU_ERP.dbo.sp_tor_period_bill_checking
                        (d_doc_complete, d_checking, c_egp_no, c_disburse_detail
                        , i_budget_year_use, f_total_vat, b_vat, f_vat_percent
                        , f_before_vat, f_vat_amt, f_request_amt
                        , b_wht, f_wht_percent, f_wht_amt, f_penalty
                        , b_guarantee, f_guarantee_percent, f_guarantee_amt, f_other, f_pay_amt
                        , dc_cost_responsible_id, dc_cost_owner_id
                        , c_overlap_no, i_budget_year_ref, c_item_name
                        , dc_user_create_id, dc_user_create_cost_id, d_create, c_ir_code)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE(), ?)";
        // ต้องส่ง c_ir_code ซ้ำ 3 จุด (เช็ก EXISTS, WHERE ของ UPDATE, ค่า INSERT ท้ายสุด)
        $arrParam = array_merge(array($irCode), $arrParam, $arrParam);
        $stmt = $db->QueryParam($sql, $arrParam);
        if (!$stmt) {
            $errMsg = "บันทึกรายละเอียดตรวจรับไม่สำเร็จ";
            break;
        }

        // ปุ่ม "บันทึก" ของฟอร์มนี้ทำหน้าที่ "บันทึกรายละเอียดตรวจรับ + ออกเลข AP" ให้
        // เลข IR นี้ในขั้นตอนเดียวกันเลยตามที่ผู้ใช้ระบุ (ไม่ต้องกดปุ่มออกเลข AP แยก
        // ต่างหากอีกต่อไป) - ออกให้เฉพาะรายการย่อยของเลข IR นี้เท่านั้น ถ้าเคยออกเลข AP
        // ให้ไปแล้ว (แก้ไขรายละเอียดตรวจรับซ้ำภายหลัง) จะไม่มีอะไรให้ทำเพิ่ม (idempotent)
        $idsForAp = array();
        $stmtIdsForAp = $db->QueryParam(
            "select sp_tor_period_bill_receive_id from NMU_ERP.dbo.sp_tor_period_bill_receive
             where c_ir_code = ? and c_ap_code is null and i_enabled = 1",
            array($irCode)
        );
        while ($rowIdAp = $db->Fetch($stmtIdsForAp)) {
            $idsForAp[] = intval($rowIdAp["sp_tor_period_bill_receive_id"]);
        }

        // [ผู้ใช้ยืนยัน] ก่อนออกเลข AP ยอดเงินของ IR ต้องตรงกับผลรวมรายการย่อย (ทุกรายการยืนยัน
        // ยอด VAT แล้ว) ไม่ผ่าน = ไม่บันทึกอะไรเลย (rollback ทั้งการบันทึกตรวจรับด้านบนด้วย)
        // แจ้งให้กลับไปแก้ VAT ที่หน้าส่งมอบงาน - ออกเลข AP ไปแล้ว (แค่แก้รายละเอียดซ้ำ) ไม่เช็ค
        if (!empty($idsForAp)) {
            $vatErr = medsupIrVatCheck($db, $irCode, $totalVat, $vatAmt, $whtAmt);
            if ($vatErr !== "") {
                $stmt = false;
                $errMsg = $vatErr;
                break;
            }
        }

        // หาเลข AP ที่จะใช้เสมอ (ทั้งกรณีเพิ่งออกใหม่/เคยออกไปแล้วบางส่วน/ออกครบไปแล้ว
        // ทั้งเลข IR นี้) เพื่อส่งกลับไปโชว์ที่ฟอร์ม/กริดฝั่ง client ด้วย (ผู้ใช้ระบุว่า
        // เดิมกดบันทึกแล้วไม่เห็นเลข AP ที่เพิ่งออกเลย ต้องเปิดหาเองทีหลัง)
        $existingApForIr = $db->GetDataBySQL(
            "select top 1 c_ap_code from NMU_ERP.dbo.sp_tor_period_bill_receive
             where c_ir_code = ? and c_ap_code is not null",
            array($irCode)
        );
        if (!empty($existingApForIr)) {
            $apCodeForIr = $existingApForIr;
        } else {
            $deptTypeForIr = $db->GetDataBySQL(
                "select top 1 isnull(g.c_ap_dept_type, 'APMS') as c_ap_dept_type
                 from NMU_ERP.dbo.sp_tor_period_bill_receive r
                 inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
                 where r.c_ir_code = ?",
                array($irCode)
            );
            $apCodeForIr = medsupGenApCode($db, !empty($deptTypeForIr) ? $deptTypeForIr : "APMS");
        }

        if (!empty($idsForAp)) {
            $arrParamAp = array_merge(
                array($apCodeForIr, $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null),
                $idsForAp
            );
            $placeholdersAp = implode(",", array_fill(0, count($idsForAp), "?"));
            $sqlAp = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                    SET c_ap_code = ?, d_ap_issue = GETDATE()
                        , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                    WHERE sp_tor_period_bill_receive_id IN ({$placeholdersAp}) AND i_enabled = 1
                        AND c_ap_code IS NULL AND c_ir_code IS NOT NULL";
            $stmt = $db->QueryParam($sqlAp, $arrParamAp);
            if (!$stmt) {
                $errMsg = "บันทึกรายละเอียดตรวจรับสำเร็จ แต่ออกเลข AP ไม่สำเร็จ";
                break;
            }
        }
        $responseExtra["c_ir_code"] = $irCode;
        $responseExtra["c_ap_code"] = $apCodeForIr;
        break;

    default:
        $stmt = false;
        break;
}

if ($stmt) {
    $db->CommitTran();
    $re = array_merge(array("reval" => 0, "success" => "Success", "msg" => "บันทึกเรียบร้อยแล้ว"), $responseExtra);
} else {
    $db->RollBackTran();
    $re = array("reval" => 1, "success" => "Error", "msg" => $errMsg);
}

echo json_encode($re);
exit;
