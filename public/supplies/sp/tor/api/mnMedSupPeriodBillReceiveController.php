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
// regTorMedSup.js (APPS พัสดุ=38 / APF เภสัช=50 / APMSD เวชภัณฑ์=82) ใช้ทำ prefix เลข AP
function medsupApDeptCostId($deptType)
{
    $map = array("APPS" => 38, "APF" => 50, "APMSD" => 82);
    return $map[$deptType] ?? 82;
}

// เลข AP รูปแบบ {รหัส}{ปี 2 หลัก}-{เลขรัน 6 หลัก} เช่น APMSD69-000001 (เวชภัณฑ์ ประเภท APMSD) / APF70-000001 (เภสัช ประเภท APF)
// ปี 2 หลัก = "ใช้เงินปีงบประมาณ" ของรายการ (พ.ศ.) - ปี 2569 ได้ APMSD69-/APF69- ปี 2570 ได้ APMSD70-/APF70-
// ผู้ใช้ยืนยันให้ใช้รูปแบบเดียวกันทุกปี (ไม่ใช้รูปแบบเดิม 82-APMS-2570-000001 อีก) เลขรันแยกชุดกันต่อ prefix
// ไม่ระบุปีใช้เงิน (0) = ใช้ปีงบประมาณปัจจุบัน (ปีงบไทยเริ่ม 1 ต.ค. - เดือน ต.ค.-ธ.ค. ถือเป็นปีงบถัดไป)
function medsupGenApCode($db, $deptType, $useYear = 0)
{
    // [ผู้ใช้ยืนยัน 2569-11-19] เวชภัณฑ์ (APMSD) ปีของเลข AP = ปีงบประมาณตามวันที่ออกเลข (ต.ค.-ธ.ค. = ปีถัดไป)
    // ไม่ใช้ "ปีของเงิน" แล้ว แม้ใช้ใบกันเหลื่อมปีก่อน (ใบกันและช่อง "ใช้เงินปีงบประมาณ" ในฟอร์มยังเป็นปีเดิม)
    // เภสัช (APF) / พัสดุ (APPS) ยังใช้กฎเดิมทุกอย่าง
    if ($deptType === "APMSD") {
        $useYear = 0;
    }
    $now = new DateTime();
    $yearBE = intval($now->format("Y")) + 543;
    $fiscalYear = (intval($now->format("n")) >= 10) ? $yearBE + 1 : $yearBE;
    $apYear = $useYear > 0 ? $useYear : $fiscalYear;
    // ผู้ใช้ยืนยัน: เวชภัณฑ์ = APMSD / เภสัช = APF / พัสดุ = APPS (รหัสประเภทตรงกับ prefix เลข AP แล้ว)
    $shortCodes = array("APMSD" => "APMSD", "APF" => "APF", "APPS" => "APPS");
    $prefix = ($shortCodes[$deptType] ?? $deptType) . substr((string) $apYear, -2) . "-";

    $stmt = $db->QueryParam(
        // นับเฉพาะแถวที่ยังใช้งาน (i_enabled = 1) - ยกเลิกการนำเข้าแล้วนำเข้าใหม่ เลข AP เริ่มนับ 000001 ใหม่ได้
        "SELECT c_ap_code FROM NMU_ERP.dbo.sp_tor_period_bill_receive WHERE i_enabled = 1 AND c_ap_code LIKE ? + '%'",
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

// ปีงบประมาณ (พ.ศ.) ของเงินที่ใช้ ของรายการรับของที่เลือก: สัญญาที่ใช้ใบกันเหลื่อม (c_overlap ไม่ว่าง) = ปีของใบกันเหลื่อม
// (i_budget_year_overlap + 543 หรืออ่านจาก 2 หลักแรกของเลขใบกัน เช่น 69-102-03-1-0540 = 2569) สัญญาที่ไม่ใช้ใบกัน = 0 (ปีปัจจุบัน)
// คืน array ปีที่ไม่ซ้ำ (0 = ปัจจุบัน) - ถ้ามีมากกว่า 1 ปีแปลว่าเลือกรายการที่ใช้เงินคนละปีมาออกเลข IR รวมกัน
function medsupIrUseYears($db, $ids)
{
    $placeholders = implode(",", array_fill(0, count($ids), "?"));
    $stmt = $db->QueryParam(
        "select distinct isnull(g.c_overlap, '') as c_overlap, isnull(g.i_budget_year_overlap, 0) as i_year_overlap
                , isnull(g.i_budget_year, 0) as i_year_contract, isnull(g.c_ap_dept_type, 'APMSD') as c_dept
         from NMU_ERP.dbo.sp_tor_period_bill_receive r
         inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
         where r.sp_tor_period_bill_receive_id in ({$placeholders})",
        $ids
    );
    $years = array();
    while ($row = $db->Fetch($stmt)) {
        $y = 0;
        if ($row["c_dept"] === "APMSD") {
            // เวชภัณฑ์: ปีเลข IR ตามวันที่ออกเลข (0 = ปีงบปัจจุบัน) ไม่ผูกกับปีของใบกันเหลื่อม - ดู medsupGenApCode
            $years[0] = 0;
            continue;
        }
        if (trim((string) $row["c_overlap"]) !== "") {
            if (intval($row["i_year_overlap"]) > 0) {
                $y = intval($row["i_year_overlap"]) + 543;
            } elseif (preg_match('/^(\d{2})-/', trim((string) $row["c_overlap"]), $m)) {
                $y = 2500 + intval($m[1]);
            }
        } elseif ($row["c_dept"] === "APF" && intval($row["i_year_contract"]) > 0) {
            // [ผู้ใช้ยืนยัน] สัญญาที่ไม่ใช้ใบกันเหลื่อมใช้ปีงบของสัญญา (ค.ศ. 2026 = 2569 -> IR50-69 / AP..69) เหมือนเวชภัณฑ์
            // เพราะผู้ใช้ยังไม่ได้ทำปีงบปัจจุบัน (เดิมได้ปีปัจจุบัน 70)
            $y = intval($row["i_year_contract"]) + 543;
        }
        $years[$y] = $y;
    }
    return array_values($years);
}

// เลข IR รูปแบบ IR{dc_cost_id}-{ปีงบประมาณ พ.ศ. 2 หลัก}-{เลขรัน 5 หลัก} เช่น IR50-69-00001
// (50 = หน่วยงานตาม c_ap_dept_type, 69 = ปีงบ 2569) เลขรันแยกชุดกันทั้งต่อหน่วยงานและต่อ
// ปีงบ ขึ้นปีงบใหม่เริ่ม 00001 ใหม่ - นับปีงบแบบเดียวกับ medsupGenApCode (เดือน ต.ค.-ธ.ค.
// ถือเป็นปีงบถัดไปแล้ว) เลข IR รูปแบบเก่า "IR-000033" ไม่ขึ้นต้นด้วย prefix นี้ จึงไม่ถูกนับรวม
// $useYear (พ.ศ.) = ปีงบประมาณของเงินที่ใช้ เช่น ใช้ใบกันเหลื่อมปี 2569 ต้องได้ IR82-69-xxxxx (ไม่ใช่ปีปัจจุบัน 70) -
// ไม่ระบุ (0) = ใช้เงินปีปัจจุบัน ได้ปีงบปัจจุบัน (IR82-70-xxxxx) ดู medsupIrUseYear ว่าหาจากสัญญาอย่างไร
function medsupGenIrCode($db, $deptType, $useYear = 0)
{
    if ($deptType === "APMSD") {
        $useYear = 0;   // เวชภัณฑ์: ปีเลข IR ตามวันที่ออกเลข (ดู medsupGenApCode)
    }
    $costId = medsupApDeptCostId($deptType);
    $now = new DateTime();
    $yearBE = intval($now->format("Y")) + 543;
    $fiscalYear = (intval($now->format("n")) >= 10) ? $yearBE + 1 : $yearBE;
    if ($useYear > 0) {
        $fiscalYear = $useYear;
    }
    $prefix = "IR" . $costId . "-" . substr((string) $fiscalYear, -2) . "-";

    $stmt = $db->QueryParam(
        // นับทุกแถวรวมที่ยกเลิกแล้วด้วย (ห้ามเอาเลขที่ยกเลิกไปใช้ซ้ำ): ตาราง sp_tor_period_bill_checking มี UNIQUE (c_ir_code) แถวตรวจรับของเลขเก่าที่ถูกยกเลิก
        // ยังถือเลขนั้นอยู่ ถ้าออกเลขซ้ำ การบันทึกตรวจรับจะไปอัปเดตแถวที่ยกเลิกแล้ว (i_enabled = 0) ข้อมูลเลยหายจากหน้าตรวจรับ
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
// มีคอลัมน์เลขคุมตรวจรับ EGP ที่รายการรับของหรือยัง (scriptBaseUpdate/sp_tor_period_bill_receive_egp_no.sql)
function medsupReceiveHasEgpCol($db)
{
    return intval($db->GetDataBySQL("select case when COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill_receive', 'c_egp_no') is null then 0 else 1 end", array())) === 1;
}
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
        // เลขคุมตรวจรับ EGP (ไม่บังคับ) - เก็บเฉพาะเมื่อกรอกมาและมีคอลัมน์แล้ว
        $addEgp = trim((string) ($_REQUEST["c_egp_no"] ?? ""));
        $addEgpCol = ($addEgp !== "" && medsupReceiveHasEgpCol($db));
        if ($addEgpCol) {
            $arrParam[] = $addEgp;
        }
        $sql = "SET NOCOUNT ON;
                INSERT INTO NMU_ERP.dbo.sp_tor_period_bill_receive
                    (sp_tor_period_bill_id, c_receive_code, d_receive_date, c_detail, f_amt, c_erp_stock_code, i_enabled, dc_user_create_id, dc_user_create_cost_id, d_create" . ($addEgpCol ? ", c_egp_no" : "") . ")
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, GETDATE()" . ($addEgpCol ? ", ?" : "") . ");
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
        // เลขคุมตรวจรับ EGP - แก้เมื่อ client ส่ง c_egp_no มา (ว่าง = ล้างเลข) ผู้เรียกอื่นที่ไม่ส่งค่านี้ไม่กระทบ
        $updEgp = isset($_REQUEST["c_egp_no"]) && medsupReceiveHasEgpCol($db);
        if ($updEgp) {
            $egpVal = trim((string) $_REQUEST["c_egp_no"]);
            array_splice($arrParam, 5, 0, array($egpVal !== "" ? $egpVal : null));   // ต่อจาก c_erp_stock_code ตามลำดับ ? ใน SQL
        }
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
                SET c_receive_code = ?, d_receive_date = ?, c_detail = ?, f_amt = ?, c_erp_stock_code = ?" . ($updEgp ? ", c_egp_no = ?" : "") . "
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

    case "UNLOCK_CANCEL":
        // [ผู้ดูแลระบบ] ปลดล็อก "เพื่อยกเลิก" งวดที่ออกเลข AP แล้ว ด้วย ID ปลดล็อกเดิม (id แถวรับของ)
        // ไม่เกี่ยวกับการปลดล็อกแก้ VAT (UNLOCK_AP) - ตั้งสถานะ b_cancel_unlock ทั้งงวด แล้วแอดมินยกเลิกงวดได้
        if (!medsupIsAdmin()) {
            $stmt = false;
            $errMsg = "เฉพาะผู้ดูแลระบบเท่านั้นที่ปลดล็อกเพื่อยกเลิกได้";
            break;
        }
        $unlockCancelId = intval($_REQUEST["unlock_id"] ?? 0);
        $billOfUnlock = $unlockCancelId > 0 ? $db->GetDataBySQL(
            "select sp_tor_period_bill_id, c_ap_code from NMU_ERP.dbo.sp_tor_period_bill_receive
              where sp_tor_period_bill_receive_id = ? and i_enabled = 1",
            array($unlockCancelId)
        ) : null;
        if (empty($billOfUnlock) || !is_array($billOfUnlock)) {
            $stmt = false;
            $errMsg = "ไม่พบ ID ปลดล็อก {$unlockCancelId}";
            break;
        }
        if (empty($billOfUnlock["c_ap_code"])) {
            // ใช้ได้เฉพาะเมื่องวดนี้มีเลข AP
            $stmt = false;
            $errMsg = "ID {$unlockCancelId} ยังไม่ได้ออกเลขตรวจรับ (AP) จึงไม่ต้องปลดล็อกเพื่อยกเลิก";
            break;
        }
        $stmt = $db->QueryParam(
            "update NMU_ERP.dbo.sp_tor_period_bill_receive
                set b_cancel_unlock = 1, d_cancel_unlock = GETDATE(), dc_user_cancel_unlock_id = ?
              where i_enabled = 1 and sp_tor_period_bill_id = ?",
            array($_SESSION["user_id"] ?? null, $billOfUnlock["sp_tor_period_bill_id"])
        );
        $responseExtra["c_ap_code"] = $billOfUnlock["c_ap_code"];
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
                "select distinct isnull(g.c_ap_dept_type, 'APMSD') as c_ap_dept_type
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
            // ปีของเลข IR ตามเงินที่ใช้ (ใบกันเหลื่อมปี 69 -> IR82-69-xxxxx / ใช้เงินปัจจุบัน -> IR82-70-xxxxx)
            $irYears = medsupIrUseYears($db, $ids);
            if (count($irYears) > 1) {
                $stmt = false;
                $errMsg = "รายการที่เลือกใช้เงินคนละปีงบประมาณกัน (ใบกันเหลื่อมกับเงินปัจจุบัน หรือคนละปีของใบกัน) ออกเลข IR รวมกันไม่ได้ กรุณาเลือกออกแยกกัน";
                break;
            }
            $irCode = medsupGenIrCode($db, !empty($deptTypes[0]) ? $deptTypes[0] : "APMSD", !empty($irYears) ? $irYears[0] : 0);
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
        // prefix (APPS พัสดุ/APF เภสัช/APMSD เวชภัณฑ์) มาจากคอลัมน์ c_ap_dept_type ของ
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

        // ต้องบันทึกรายละเอียดตรวจรับ (sp_tor_period_bill_checking มีแถว และมีวันที่บันทึกการตรวจรับ)
        // ของทุกเลข IR ที่เกี่ยวข้องก่อน ถึงจะออกเลข AP ได้ (บังคับจริงฝั่งเซิร์ฟเวอร์ ไม่ใช่แค่ฝั่ง UI)
        // "รายการส่งเบิก" (c_disburse_detail) ไม่บังคับกรอกแล้ว - ว่างได้
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
                    and d_checking is not null",
                $irCodesInIds
            );
            while ($rowReady = $db->Fetch($stmtReady)) {
                $readyIrCodes[] = $rowReady["c_ir_code"];
            }
            $missingIrCodes = array_values(array_diff($irCodesInIds, $readyIrCodes));
            if (!empty($missingIrCodes)) {
                $stmt = false;
                $errMsg = "กรุณาบันทึกรายละเอียดตรวจรับให้ครบก่อนออกเลข AP - เลข IR ที่ยังไม่ได้บันทึก: " . implode(", ", $missingIrCodes);
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
                "select distinct isnull(g.c_ap_dept_type, 'APMSD') as c_ap_dept_type
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
            $deptType = !empty($deptTypes[0]) ? $deptTypes[0] : "APMSD";
            $useYearRow = $db->GetDataBySQL(
                "select min(c.i_budget_year_use) from NMU_ERP.dbo.sp_tor_period_bill_checking c
                 where c.c_ir_code in (select r.c_ir_code from NMU_ERP.dbo.sp_tor_period_bill_receive r
                                       where r.sp_tor_period_bill_receive_id in ({$placeholders}))",
                $ids
            );
            $apCode = medsupGenApCode($db, $deptType, intval($useYearRow));
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

    case "ADMIN_REQUEST":
        // คำร้อง "แก้ไขข้อมูล ADMIN" ของเลข AP (เมนู ST00096 - เทียบเท่า sp/checking/mnUploadDocAcc.php ของ ST0013)
        // ต้องออกเลข AP แล้ว คำร้องเดิมของเลข IR เดียวกันตั้งเป็น i_enable = 2
        $irCode = trim((string) ($_REQUEST["c_ir_code"] ?? ""));
        $reqComment = trim((string) ($_REQUEST["c_comment"] ?? ""));
        $apCodeReq = $db->GetDataBySQL(
            "select top 1 c_ap_code from NMU_ERP.dbo.sp_tor_period_bill_receive
             where c_ir_code = ? and c_ap_code is not null and i_enabled = 1",
            array($irCode)
        );
        if ($irCode === "" || empty($apCodeReq)) {
            $stmt = false;
            $errMsg = "รายการยังไม่ออกเลข AP";
            break;
        }
        if ($reqComment === "") {
            $stmt = false;
            $errMsg = "กรุณาระบุเหตุผล";
            break;
        }
        $dChkEdit = trim((string) ($_REQUEST["d_checking_edit"] ?? ""));
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_checking_request SET i_enable = 2 WHERE c_ir_code = ? AND i_enable = 1;
                INSERT INTO NMU_ERP.dbo.sp_tor_period_bill_checking_request
                    (c_ir_code, c_ap_code, d_doc_date, d_checking_edit, json_select, c_comment, i_status, i_enable
                     , dc_user_create_id, dc_user_create_cost_id, d_create)
                VALUES (?, ?, CAST(GETDATE() AS date), ?, ?, ?, 1, 1, ?, ?, GETDATE())";
        $stmt = $db->QueryParam($sql, array(
            $irCode, $irCode, $apCodeReq,
            $dChkEdit !== "" ? $date->bc_to_ad($dChkEdit) : null,
            (string) ($_REQUEST["json_select"] ?? ""),
            $reqComment,
            $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null,
        ));
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
        // เลขที่ EGP: ใช้เงินปีงบประมาณเก่ากว่าปีงบปัจจุบัน (เช่น กันเหลื่อมปี 2569 ขณะที่ปีปัจจุบัน 2570) ยังไม่มีเลข EGP
        // = เก็บ "-" เสมอ (ไม่ว่า client ส่งอะไรมา) ใช้เงินปีงบประมาณปัจจุบันถึงจะต้องกรอกเลข EGP ("รายการส่งเบิก" ไม่บังคับ)
        $useYearTh = intval($_REQUEST["i_budget_year_use"] ?? 0);
        $fiscalYearTh = intval(date("Y")) + 543 + (intval(date("n")) >= 10 ? 1 : 0);
        // เอกสารปีงบประมาณ (i_budget_year_ref) ปีเก่า = "-" เสมอ / [ผู้ใช้ขอ] เอกสารปีปัจจุบัน (70) ที่ใช้เงินปีเก่า
        // แก้เลข EGP จริงได้: ส่งมาว่าง = "-" ส่วนที่กรอกเลขจริงมาเก็บตามนั้น
        $refYearTh = intval($_REQUEST["i_budget_year_ref"] ?? 0);
        if ($useYearTh > 0 && $useYearTh < $fiscalYearTh) {
            if ($refYearTh < $fiscalYearTh || $egpNo === "") {
                $egpNo = "-";
            }
        }
        if ($irCode === "" || $checkingDate === "" || $egpNo === "") {
            $stmt = false;
            $errMsg = "กรุณากรอกวันที่บันทึกการตรวจรับ/เลขที่ EGP (กรณีใช้เงินปีงบประมาณปัจจุบัน) ให้ครบก่อนบันทึก";
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
            $disburseDetail !== "" ? $disburseDetail : null,
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
                "select top 1 isnull(g.c_ap_dept_type, 'APMSD') as c_ap_dept_type
                 from NMU_ERP.dbo.sp_tor_period_bill_receive r
                 inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
                 where r.c_ir_code = ?",
                array($irCode)
            );
            $apCodeForIr = medsupGenApCode($db, !empty($deptTypeForIr) ? $deptTypeForIr : "APMSD", $useYearTh);
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

    case "CANCEL_PERIOD":
        // [ผู้ใช้ขอ] ยกเลิกงวดที่ข้อมูลผิด (ST00095) เพื่อให้นำเข้าใหม่ได้ กติกา:
        //  - ออกใบขอเบิก D แล้ว = ยกเลิกไม่ได้เลย
        //  - ออกเลข IR แล้ว (ยังไม่ออก AP) = ผู้ใช้ยกเลิกได้
        //  - ออกเลข AP แล้ว = ต้องให้ผู้ดูแลระบบปลดล็อกก่อน (UNLOCK_AP) แล้วผู้ดูแลระบบเป็นคนยกเลิก
        //  - IR/AP ที่ใช้ร่วมกับงวดอื่น = ยกเลิกอัตโนมัติไม่ได้
        // ยกเลิกแบบ soft delete (i_enabled = 0) ไม่ลบถาวร ปล่อยการจองเงินคืนงบด้วย (เหมือน Cancel_Tor)
        $billId = intval($_REQUEST["sp_tor_period_bill_id"] ?? 0);
        $reason = trim((string) ($_REQUEST["c_reason"] ?? ""));
        if ($billId <= 0) {
            $stmt = false;
            $errMsg = "ไม่พบงวดที่จะยกเลิก";
            break;
        }
        $checkOnly = !empty($_REQUEST["check_only"]); // ตรวจกติกาอย่างเดียว (ก่อนถามเหตุผลที่หน้าจอ)
        if ($reason === "" && !$checkOnly) {
            $stmt = false;
            $errMsg = "กรุณาระบุเหตุผลที่ยกเลิก";
            break;
        }
        $bill = $db->GetDataBySQL(
            "select sp_tor_period_bill_id, sp_tor_period_bill_import_id, c_contract_code, i_period,
                    bg_reserve_money_id, bg_reserve_money_id2, bg_reserve_money_id3,
                    pr_bg_reserve_money_id, pr_bg_reserve_money_id2, pr_bg_reserve_money_id3
               from NMU_ERP.dbo.sp_tor_period_bill where sp_tor_period_bill_id = ? and i_enabled = 1",
            array($billId)
        );
        if (empty($bill) || !is_array($bill)) {
            $stmt = false;
            $errMsg = "ไม่พบงวดนี้ (อาจถูกยกเลิกไปแล้ว) กรุณารีเฟรชหน้า";
            break;
        }

        // รายการรับของของงวดนี้ (IR/AP/สถานะปลดล็อก)
        $rcvRows = array();
        $stmtRcv = $db->QueryParam(
            "select sp_tor_period_bill_receive_id, c_ir_code, c_ap_code, isnull(b_cancel_unlock, 0) as b_cancel_unlock
               from NMU_ERP.dbo.sp_tor_period_bill_receive where sp_tor_period_bill_id = ? and i_enabled = 1",
            array($billId)
        );
        while ($stmtRcv && ($rr = $db->Fetch($stmtRcv))) {
            $rcvRows[] = $rr;
        }
        $irCodes = array();
        $apCodes = array();
        $apLocked = false; // ยังไม่ได้ปลดล็อกเพื่อยกเลิก (b_cancel_unlock)
        foreach ($rcvRows as $rr) {
            if (!empty($rr["c_ir_code"])) {
                $irCodes[$rr["c_ir_code"]] = true;
            }
            if (!empty($rr["c_ap_code"])) {
                $apCodes[$rr["c_ap_code"]] = true;
                if (intval($rr["b_cancel_unlock"]) !== 1) {
                    $apLocked = true;
                }
            }
        }
        $irCodes = array_keys($irCodes);
        $apCodes = array_keys($apCodes);
        // ID ปลดล็อก = id แถวรับของที่มีเลข AP (ตรงกับที่ admin ใส่ในเมนู "ปลดล็อกเลขตรวจรับ (Admin)")
        $unlockIdAp = 0;
        foreach ($rcvRows as $rr) {
            if (!empty($rr["c_ap_code"]) && ($unlockIdAp === 0 || intval($rr["sp_tor_period_bill_receive_id"]) < $unlockIdAp)) {
                $unlockIdAp = intval($rr["sp_tor_period_bill_receive_id"]);
            }
        }
        $irPh = implode(",", array_fill(0, max(1, count($irCodes)), "?"));

        // 1) ใบขอเบิก D: มีแม้แถวเดียว = ยกเลิกไม่ได้ (คอลัมน์ c_code_ref มาจาก sp_tor_period_bill_checking_withdraw.sql)
        $hasWdCol = intval($db->GetDataBySQL("select case when col_length('NMU_ERP.dbo.sp_tor_period_bill_checking', 'c_code_ref') is not null then 1 else 0 end", array()));
        if ($hasWdCol && !empty($irCodes)) {
            $wdCount = intval($db->GetDataBySQL(
                "select count(*) from NMU_ERP.dbo.sp_tor_period_bill_checking
                  where i_enabled = 1 and isnull(c_code_ref, '') <> '' and c_ir_code in ({$irPh})",
                $irCodes
            ));
            if ($wdCount > 0) {
                $stmt = false;
                $errMsg = "ไม่สามารถยกเลิกรายการได้ เนื่องจากออกเลขใบขอเบิกไปแล้ว";
                break;
            }
        }

        // 2) เลข AP: ต้องเป็นผู้ดูแลระบบ และต้องปลดล็อกเลข AP แล้ว
        if (!empty($apCodes)) {
            // ผู้ดูแลระบบปลดล็อกเพื่อยกเลิกแล้ว (b_cancel_unlock = 1) -> ผู้ใช้ทั่วไปยกเลิกเองได้
            if ($apLocked) {
                $stmt = false;
                $errMsg = "งวดนี้ออกเลขตรวจรับ (AP) " . implode(", ", $apCodes) . " แล้ว กรุณาแจ้ง <b>ID ปลดล็อก: {$unlockIdAp}</b> ให้ผู้ดูแลระบบ เพื่อปลดล็อกเพื่อยกเลิกก่อน จึงจะยกเลิกได้";
                break;
            }
        }

        // 3) IR/AP ที่ใช้ร่วมกับงวดอื่น (รวมข้ามงวดออก IR เดียว / AP เดียว): ยกเลิกพร้อมกันทั้งชุดที่ใช้ร่วมกัน
        //    ต้องผ่านกติกาเดียวกันทุกงวดในชุด (ไม่มีใบขอเบิก D / AP ปลดล็อกแล้ว) ถ้าไม่ผ่านแม้งวดเดียวไม่ยกเลิกเลย
        $groupIds = array($billId);
        $conds = array();
        $params = array($billId);
        if (!empty($irCodes)) {
            $conds[] = "c_ir_code in ({$irPh})";
            $params = array_merge($params, $irCodes);
        }
        if (!empty($apCodes)) {
            $apPh = implode(",", array_fill(0, count($apCodes), "?"));
            $conds[] = "c_ap_code in ({$apPh})";
            $params = array_merge($params, $apCodes);
        }
        if (!empty($conds)) {
            $stmtSh = $db->QueryParam(
                "select distinct r.sp_tor_period_bill_id from NMU_ERP.dbo.sp_tor_period_bill_receive r
                  inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id and g.i_enabled = 1
                  where r.i_enabled = 1 and r.sp_tor_period_bill_id <> ? and (" . implode(" or ", array_map(function ($c) { return "r." . $c; }, $conds)) . ")",
                $params
            );
            while ($stmtSh && ($rs = $db->Fetch($stmtSh))) {
                $groupIds[] = intval($rs["sp_tor_period_bill_id"]);
            }
        }
        if (count($groupIds) > 1) {
            $gPh = implode(",", array_fill(0, count($groupIds), "?"));
            // ตรวจกติกา 1-2 ซ้ำกับทุกงวดในชุด (ใช้ IR/AP ของทุกแถวในชุด)
            $irCodes = array();
            $apCodes = array();
            $apLocked = false;
            $unlockIdAp = 0;
            $stmtG = $db->QueryParam(
                "select sp_tor_period_bill_receive_id, c_ir_code, c_ap_code, isnull(b_cancel_unlock, 0) as b_cancel_unlock
                   from NMU_ERP.dbo.sp_tor_period_bill_receive where i_enabled = 1 and sp_tor_period_bill_id in ({$gPh})",
                $groupIds
            );
            while ($stmtG && ($rg = $db->Fetch($stmtG))) {
                if (!empty($rg["c_ir_code"])) {
                    $irCodes[$rg["c_ir_code"]] = true;
                }
                if (!empty($rg["c_ap_code"])) {
                    $apCodes[$rg["c_ap_code"]] = true;
                    if (intval($rg["b_cancel_unlock"]) !== 1) {
                        $apLocked = true;
                    }
                    if ($unlockIdAp === 0 || intval($rg["sp_tor_period_bill_receive_id"]) < $unlockIdAp) {
                        $unlockIdAp = intval($rg["sp_tor_period_bill_receive_id"]);
                    }
                }
            }
            $irCodes = array_keys($irCodes);
            $apCodes = array_keys($apCodes);
            $irPh = implode(",", array_fill(0, max(1, count($irCodes)), "?"));
            if ($hasWdCol && !empty($irCodes)) {
                $wdCountG = intval($db->GetDataBySQL(
                    "select count(*) from NMU_ERP.dbo.sp_tor_period_bill_checking
                      where i_enabled = 1 and isnull(c_code_ref, '') <> '' and c_ir_code in ({$irPh})",
                    $irCodes
                ));
                if ($wdCountG > 0) {
                    $stmt = false;
                    $errMsg = "ไม่สามารถยกเลิกรายการได้ เนื่องจากออกเลขใบขอเบิกไปแล้ว (เลข IR/AP นี้ใช้ร่วมกับงวดอื่น)";
                    break;
                }
            }
            if (!empty($apCodes) && $apLocked) {
                $stmt = false;
                $errMsg = "เลข IR/AP นี้ใช้ร่วมกับงวดอื่น และออกเลขตรวจรับ (AP) " . implode(", ", $apCodes) . " แล้ว กรุณาแจ้ง <b>ID ปลดล็อก: {$unlockIdAp}</b> ให้ผู้ดูแลระบบ เพื่อปลดล็อกเพื่อยกเลิกก่อน จึงจะยกเลิกได้";
                break;
            }
        }
        // งวดที่ถูกยกเลิกพร้อมกัน (ให้หน้าจอแจ้งผู้ใช้)
        $gPhAll = implode(",", array_fill(0, count($groupIds), "?"));
        $periodsInGroup = array();
        $stmtP = $db->QueryParam("select i_period from NMU_ERP.dbo.sp_tor_period_bill where sp_tor_period_bill_id in ({$gPhAll}) order by i_period", $groupIds);
        while ($stmtP && ($rp = $db->Fetch($stmtP))) {
            $periodsInGroup[] = intval($rp["i_period"]);
        }
        $responseExtra["group_periods"] = $periodsInGroup;

        if ($checkOnly) {
            $stmt = true; // ผ่านกติกา ยังไม่เขียนข้อมูล
            break;
        }

        // 4) ยกเลิกทุกงวดในชุด (งวดเดียวถ้าไม่ได้ใช้ IR/AP ร่วมกับงวดอื่น)
        $uidCancel = $_SESSION["user_id"] ?? null;
        $ucostCancel = $_SESSION["dc_cost_id"] ?? null;

        // ตรวจรับ -> รายการรับ -> งวด -> คืนการจองเงิน -> ปรับประวัติการนำเข้า -> เหตุผล
        if (!empty($irCodes)) {
            $stmt = $db->QueryParam(
                "update NMU_ERP.dbo.sp_tor_period_bill_checking set i_enabled = 0
                  where i_enabled = 1 and c_ir_code in ({$irPh})",
                $irCodes
            );
        }
        foreach ($groupIds as $gid) {
            $billG = ($gid === $billId) ? $bill : $db->GetDataBySQL(
                "select sp_tor_period_bill_id, sp_tor_period_bill_import_id, c_contract_code, i_period,
                        bg_reserve_money_id, bg_reserve_money_id2, bg_reserve_money_id3,
                        pr_bg_reserve_money_id, pr_bg_reserve_money_id2, pr_bg_reserve_money_id3
                   from NMU_ERP.dbo.sp_tor_period_bill where sp_tor_period_bill_id = ? and i_enabled = 1",
                array($gid)
            );
            if (empty($billG) || !is_array($billG)) {
                continue;
            }
            // การจองเงินของงวดนั้น
            $rsvIds = array();
            foreach (array("bg_reserve_money_id", "bg_reserve_money_id2", "bg_reserve_money_id3",
                           "pr_bg_reserve_money_id", "pr_bg_reserve_money_id2", "pr_bg_reserve_money_id3") as $k) {
                $v = intval($billG[$k] ?? 0);
                if ($v > 0) {
                    $rsvIds[$v] = $v;
                }
            }
            $stmt = $db->QueryParam(
                "update NMU_ERP.dbo.sp_tor_period_bill_receive
                    set i_enabled = 0, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                  where i_enabled = 1 and sp_tor_period_bill_id = ?",
                array($uidCancel, $ucostCancel, $gid)
            );
            $stmt = $db->QueryParam(
                "update NMU_ERP.dbo.sp_tor_period_bill
                    set i_enabled = 0, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                  where i_enabled = 1 and sp_tor_period_bill_id = ?",
                array($uidCancel, $ucostCancel, $gid)
            );
            if (!empty($rsvIds)) {
                $rsvPh = implode(",", array_fill(0, count($rsvIds), "?"));
                $stmt = $db->QueryParam(
                    "update " . DB_NMU_EIS . "bg_reserve_money set i_enable = 2
                      where i_enable = 1 and bg_reserve_money_id in ({$rsvPh})",
                    array_values($rsvIds)
                );
            }
            $importId = intval($billG["sp_tor_period_bill_import_id"] ?? 0);
            if ($importId > 0) {
                $stmt = $db->QueryParam(
                    "update i set i.i_contract_count = x.c, i.i_row_count = x.r, i.f_total_amt = x.t,
                            i.i_enabled = case when x.c = 0 then 0 else i.i_enabled end
                       from NMU_ERP.dbo.sp_tor_period_bill_import i
                      cross apply (select count(distinct b2.sp_tor_period_bill_hdr_id) as c, count(*) as r,
                                          isnull(sum(b2.f_fund_amt_dtl), 0) as t
                                     from NMU_ERP.dbo.sp_tor_period_bill b2
                                    where b2.sp_tor_period_bill_import_id = i.sp_tor_period_bill_import_id and b2.i_enabled = 1) x
                      where i.sp_tor_period_bill_import_id = ?",
                    array($importId)
                );
                // เหตุผลการยกเลิก (คอลัมน์มีเมื่อรัน sp_tor_period_bill_import_cancel.sql แล้ว)
                $noteReason = "[" . date("d/m/Y H:i") . " ยกเลิกงวดที่ " . intval($billG["i_period"]) . " " . $billG["c_contract_code"] . "] " . $reason;
                $stmt = $db->QueryParam(
                    "IF COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill_import', 'c_cancel_reason') IS NOT NULL
                        EXEC sp_executesql N'UPDATE NMU_ERP.dbo.sp_tor_period_bill_import
                                SET c_cancel_reason = LEFT(CASE WHEN ISNULL(c_cancel_reason, N'''') <> N'''' THEN c_cancel_reason + N'' | '' ELSE N'''' END + @r, 500)
                                  , dc_user_cancel_id = @u, d_cancel = GETDATE()
                              WHERE sp_tor_period_bill_import_id = @id',
                            N'@r nvarchar(500), @u int, @id int', @r = ?, @u = ?, @id = ?;
                     SELECT 1 AS done;",
                    array($noteReason, $uidCancel, $importId)
                );
            }
        }
        $responseExtra["c_cancel_period"] = intval($billId);
        break;

    case "CHANGE_VENDOR":
        // [ผู้ใช้ขอ 2569-11-21] แก้ผู้ขาย/ผู้รับจ้างจากหน้ารายละเอียดงวด (ผู้ขายผิดจากไฟล์ Excel)
        //  - เลือกจากทะเบียนเจ้าหนี้ (NMU.dbo.dc_creditor) เท่านั้น ชื่อ/เลขภาษี/id มาจากทะเบียน
        //  - c_scope = all (ค่าเริ่มต้น: ทุกงวดของสัญญา+ประเภทเดียวกัน) หรือ one (เฉพาะงวดนี้)
        //  - ออกใบเบิก D แล้วแต่ยังไม่เลยขั้น 0.30 (บันทึกใบขอเบิก) = แก้ใบเบิกใน EIS ให้ด้วย (po_working_dtl / po_working_begin_hdr)
        //    เลยขั้น 0.30 หรือสถานะหลักไม่ใช่ 0 = ไม่ให้แก้ ต้องให้ผู้ดูแลระบบย้อนใบเบิกก่อน
        //  - check_only = 1 : ตรวจกติกา+คืนรายการงวดที่จะแก้ (ยังไม่เขียนข้อมูล)
        $billId = intval($_REQUEST["sp_tor_period_bill_id"] ?? 0);
        $newCreditorId = intval($_REQUEST["dc_creditor_id"] ?? 0);
        $scope = (($_REQUEST["c_scope"] ?? "all") === "one") ? "one" : "all";
        $checkOnly = !empty($_REQUEST["check_only"]);
        if ($billId <= 0 || $newCreditorId <= 0) {
            $stmt = false;
            $errMsg = "กรุณาเลือกผู้ขาย/ผู้รับจ้างจากทะเบียน";
            break;
        }
        $bill = $db->GetDataBySQL(
            "select sp_tor_period_bill_id, c_contract_code, i_period, isnull(c_ap_dept_type, '') as c_ap_dept_type,
                    isnull(dc_creditor_id, 0) as dc_creditor_id, c_creditor_name
               from NMU_ERP.dbo.sp_tor_period_bill where sp_tor_period_bill_id = ? and i_enabled = 1",
            array($billId)
        );
        if (empty($bill) || !is_array($bill)) {
            $stmt = false;
            $errMsg = "ไม่พบงวดนี้ (อาจถูกยกเลิกไปแล้ว) กรุณารีเฟรชหน้า";
            break;
        }
        $newCr = $db->GetDataBySQL(
            "select top 1 dc_creditor_id, c_name, c_tax_number_imp from NMU.dbo.dc_creditor
              where dc_creditor_id = ? and isnull(i_enable, 1) = 1",
            array($newCreditorId)
        );
        if (empty($newCr) || !is_array($newCr)) {
            $stmt = false;
            $errMsg = "ไม่พบผู้ขายที่เลือกในทะเบียนเจ้าหนี้ กรุณาเลือกจากรายการค้นหา";
            break;
        }
        // งวดที่จะแก้
        $targets = array();
        if ($scope === "one") {
            $stmtT = $db->QueryParam(
                "select sp_tor_period_bill_id, i_period, dc_creditor_id, c_creditor_name, c_tax_number_imp
                   from NMU_ERP.dbo.sp_tor_period_bill where sp_tor_period_bill_id = ? and i_enabled = 1",
                array($billId)
            );
        } else {
            $stmtT = $db->QueryParam(
                "select sp_tor_period_bill_id, i_period, dc_creditor_id, c_creditor_name, c_tax_number_imp
                   from NMU_ERP.dbo.sp_tor_period_bill
                  where i_enabled = 1 and c_contract_code = ? and isnull(c_ap_dept_type, '') = ? order by i_period",
                array($bill["c_contract_code"], $bill["c_ap_dept_type"])
            );
        }
        while ($stmtT && ($rt = $db->Fetch($stmtT))) {
            $targets[] = $rt;
        }
        // ข้ามงวดที่เป็นผู้ขายคนนี้อยู่แล้ว
        $targets = array_values(array_filter($targets, function ($t) use ($newCreditorId) {
            return intval($t["dc_creditor_id"]) !== $newCreditorId;
        }));
        if (empty($targets)) {
            $stmt = false;
            $errMsg = "ผู้ขายของงวดที่เลือกเป็น " . $newCr["c_name"] . " อยู่แล้ว ไม่มีอะไรต้องแก้";
            break;
        }
        $targetIds = array_map(function ($t) { return intval($t["sp_tor_period_bill_id"]); }, $targets);
        $tPh = implode(",", array_fill(0, count($targetIds), "?"));

        // ใบเบิก D ของงวดที่จะแก้ (ผ่านเลข IR -> ตรวจรับ c_code_ref)
        $wdRows = array();
        $hasWdColV = intval($db->GetDataBySQL("select case when col_length('NMU_ERP.dbo.sp_tor_period_bill_checking', 'c_code_ref') is not null then 1 else 0 end", array()));
        if ($hasWdColV) {
            $stmtW = $db->QueryParam(
                "select distinct h.c_code_ref, h.po_working_hdr_id, h.i_status_last, convert(float, h.i_sub_status) as sub_status
                   from NMU_ERP.dbo.sp_tor_period_bill_receive r
                  inner join NMU_ERP.dbo.sp_tor_period_bill_checking c on c.c_ir_code = r.c_ir_code and c.i_enabled = 1 and isnull(c.c_code_ref, '') <> ''
                  inner join " . DB_NMU_EIS . "po_working_hdr h on h.c_code_ref = c.c_code_ref
                  where r.i_enabled = 1 and r.sp_tor_period_bill_id in ({$tPh})",
                $targetIds
            );
            while ($stmtW && ($rw = $db->Fetch($stmtW))) {
                $wdRows[] = $rw;
            }
        }
        $blockedWd = array();
        foreach ($wdRows as $rw) {
            // ใบเบิกที่ยังไม่ลงนาม (ขั้น <= 0.30) แก้ได้ / ใบที่ถูกทักท้วงฏีกา (สถานะ 3, ขั้น 3.00) แก้ได้เพื่อให้ user แก้ข้อมูลแล้วส่งคืนทักท้วง
            // (ไม่ย้อนสถานะ) ส่วนใบที่ผ่านไปแล้วต้องให้ผู้ดูแลย้อนก่อน
            $okDraft = intval($rw["i_status_last"]) === 0 && floatval($rw["sub_status"]) <= 0.30;
            $okProtest = intval($rw["i_status_last"]) === 3 && floatval($rw["sub_status"]) == 3.0;
            if (!$okDraft && !$okProtest) {
                $blockedWd[] = $rw["c_code_ref"];
            }
        }
        if (!empty($blockedWd)) {
            $stmt = false;
            $errMsg = "ไม่สามารถแก้ผู้ขายได้ เนื่องจากใบเบิก " . implode(", ", $blockedWd) . " ลงนามเลยขั้นบันทึกใบขอเบิกไปแล้ว กรุณาติดต่อผู้ดูแลระบบเพื่อย้อนใบเบิกก่อน";
            break;
        }
        $newBank = null;
        if (!empty($wdRows)) {
            $newBank = $db->GetDataBySQL(
                "select top 1 dc_bank_acc_creditor_id, c_code, c_name from NMU.dbo.dc_bank_acc_creditor
                  where dc_creditor_id = ? and isnull(i_enable, 1) = 1 order by isnull(i_main, 0) desc, dc_bank_acc_creditor_id",
                array($newCreditorId)
            );
            if (empty($newBank) || !is_array($newBank)) {
                $stmt = false;
                $errMsg = "ผู้ขายใหม่ไม่มีบัญชีธนาคารในทะเบียนเจ้าหนี้ ไม่สามารถแก้ใบเบิกที่ออกไปแล้วได้ กรุณาเพิ่มบัญชีธนาคารที่ทะเบียนเจ้าหนี้ก่อน";
                break;
            }
        }
        $responseExtra["periods"] = array_map(function ($t) { return intval($t["i_period"]); }, $targets);
        $responseExtra["wd_codes"] = array_map(function ($w) { return $w["c_code_ref"]; }, $wdRows);
        $responseExtra["new_name"] = $newCr["c_name"];
        $responseExtra["new_tax"] = $newCr["c_tax_number_imp"];
        if ($checkOnly) {
            $stmt = true; // ผ่านกติกา ยังไม่เขียนข้อมูล
            break;
        }

        $uidV = $_SESSION["user_id"] ?? null;
        $ucostV = $_SESSION["dc_cost_id"] ?? null;
        // ประวัติการแก้ (ตารางมีเมื่อรัน sp_tor_period_bill_vendor_log.sql แล้ว - ไม่มีก็ข้าม)
        $hasLogTbl = intval($db->GetDataBySQL("select case when object_id('NMU_ERP.dbo.sp_tor_period_bill_vendor_log') is not null then 1 else 0 end", array()));
        if ($hasLogTbl) {
            foreach ($targets as $t) {
                $stmt = $db->QueryParam(
                    "insert into NMU_ERP.dbo.sp_tor_period_bill_vendor_log
                        (sp_tor_period_bill_id, c_contract_code, i_period, dc_creditor_id_old, c_creditor_name_old, c_tax_number_old,
                         dc_creditor_id_new, c_creditor_name_new, c_tax_number_new, c_wd_codes, dc_user_id, dc_cost_id, d_create)
                     values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, getdate())",
                    array(intval($t["sp_tor_period_bill_id"]), $bill["c_contract_code"], intval($t["i_period"]),
                        intval($t["dc_creditor_id"]), $t["c_creditor_name"], $t["c_tax_number_imp"],
                        $newCreditorId, $newCr["c_name"], $newCr["c_tax_number_imp"],
                        implode(",", $responseExtra["wd_codes"]), $uidV, $ucostV)
                );
                if (!$stmt) {
                    $errMsg = "บันทึกประวัติการแก้ผู้ขายไม่สำเร็จ";
                    break 2;
                }
            }
        }
        // 1) ใบเบิกใน EIS (ถ้ามี)
        foreach ($wdRows as $rw) {
            $hid = intval($rw["po_working_hdr_id"]);
            $stmt = $db->QueryParam(
                "update " . DB_NMU_EIS . "po_working_dtl
                    set dc_creditor_id = ?, dc_creditor_transfer_id = ?, dc_bank_acc_creditor_id = ?,
                        c_code_bank_acc = ?, c_name_bank_acc = ?, c_cnt_name = ?
                  where po_working_hdr_id = ?",
                array($newCreditorId, $newCreditorId, intval($newBank["dc_bank_acc_creditor_id"]),
                    $newBank["c_code"], $newBank["c_name"], $newCr["c_name"], $hid)
            );
            if (!$stmt) {
                $errMsg = "แก้ใบเบิก " . $rw["c_code_ref"] . " ไม่สำเร็จ";
                break 2;
            }
            $stmt = $db->QueryParam(
                "update " . DB_NMU_EIS . "po_working_begin_hdr
                    set dc_creditor_id = ?, dc_creditor_transfer_id = ? where po_working_hdr_id = ?",
                array($newCreditorId, $newCreditorId, $hid)
            );
            if (!$stmt) {
                $errMsg = "แก้ใบเบิก " . $rw["c_code_ref"] . " ไม่สำเร็จ";
                break 2;
            }
        }
        // 2) งวด
        $stmt = $db->QueryParam(
            "update NMU_ERP.dbo.sp_tor_period_bill
                set dc_creditor_id = ?, c_creditor_name = ?, c_tax_number_imp = ?,
                    dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = getdate()
              where i_enabled = 1 and sp_tor_period_bill_id in ({$tPh})",
            array_merge(array($newCreditorId, $newCr["c_name"], $newCr["c_tax_number_imp"], $uidV, $ucostV), $targetIds)
        );
        if (!$stmt) {
            $errMsg = "แก้ผู้ขายของงวดไม่สำเร็จ";
        }
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
