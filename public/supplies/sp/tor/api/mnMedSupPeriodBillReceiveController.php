<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

// จัดการรายการ "รับของ" ย่อยของแต่ละงวด (sp_tor_period_bill_receive) สำหรับเมนู
// "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - แยกไฟล์ควบคุมออกจาก mnMedSupPeriodBillController.php
// เพราะเป็นตารางคนละก้อน ไม่เกี่ยวกับ flow บันทึกสัญญา/งวดเดิม

$mode = $_REQUEST["mode"] ?? null;
$stmt = true;
$errMsg = "check statement";
$db->BeginTran();

switch ($mode) {
    case "ADD":
        $arrParam = array(
            $_REQUEST["sp_tor_period_bill_id"] ?? null,
            trim((string) ($_REQUEST["c_receive_code"] ?? "")),
            !empty($_REQUEST["d_receive_date"]) ? $date->bc_to_ad($_REQUEST["d_receive_date"]) : null,
            trim((string) ($_REQUEST["c_detail"] ?? "")),
            isset($_REQUEST["f_amt"]) && $_REQUEST["f_amt"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_amt"])) : null,
            $_SESSION["user_id"] ?? null,
            $_SESSION["dc_cost_id"] ?? null,
        );
        $sql = "SET NOCOUNT ON;
                INSERT INTO NMU_ERP.dbo.sp_tor_period_bill_receive
                    (sp_tor_period_bill_id, c_receive_code, d_receive_date, c_detail, f_amt, i_enabled, dc_user_create_id, dc_user_create_cost_id, d_create)
                VALUES (?, ?, ?, ?, ?, 1, ?, ?, GETDATE());
                SELECT SCOPE_IDENTITY() AS new_id;";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;

    case "UPDATE":
        // แก้ไขได้เฉพาะ เลขที่รับของ/วันรับของ/รายละเอียด/จำนวนเงิน เท่านั้น - ไม่แตะ
        // c_ap_code/d_ap_issue เลย ถ้าเคยออกเลข AP ไปแล้วจะยังคงเลขเดิมไว้ ไม่ออกใหม่
        $arrParam = array(
            trim((string) ($_REQUEST["c_receive_code"] ?? "")),
            !empty($_REQUEST["d_receive_date"]) ? $date->bc_to_ad($_REQUEST["d_receive_date"]) : null,
            trim((string) ($_REQUEST["c_detail"] ?? "")),
            isset($_REQUEST["f_amt"]) && $_REQUEST["f_amt"] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_amt"])) : null,
            $_SESSION["user_id"] ?? null,
            $_SESSION["dc_cost_id"] ?? null,
            $_REQUEST["sp_tor_period_bill_receive_id"] ?? null,
        );
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                SET c_receive_code = ?, d_receive_date = ?, c_detail = ?, f_amt = ?
                    , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                WHERE sp_tor_period_bill_receive_id = ?";
        $stmt = $db->QueryParam($sql, $arrParam);
        break;

    case "DELETE":
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

    case "ISSUE_IR":
        // ออกเลข IR (ใบรับของ) ให้รายการที่เลือก - เลือกได้หลายรายการพร้อมกัน แล้วทุก
        // รายการที่เลือกในครั้งนี้จะได้ "เลข IR เดียวกัน" (รวมยอดกันเป็นก้อนเดียว เช่น
        // เลือก 2 รายการ 20+20 จะได้ IR เดียวกัน ยอดรวม 40) ไม่ใช่แยกคนละเลขทีละแถว -
        // ตอนนี้ยังเป็นการจำลอง (mock) ไปก่อน ยังไม่เชื่อม API ออกเลข IR จริง แค่ generate
        // โค้ดรูปแบบ "IR-000001" โดยใช้ id ที่น้อยที่สุดในกลุ่มที่เลือกเป็นเลขอ้างอิง
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
        $irCode = !empty($existingIr) ? $existingIr : ("IR-" . str_pad(min($ids), 6, "0", STR_PAD_LEFT));

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
        // ไปก่อน ยังไม่เชื่อม API ออกเลข AP จริง เลยแค่ generate โค้ดรูปแบบ "APMS-000001"
        // โดยใช้ id ที่น้อยที่สุดในกลุ่มที่เลือกเป็นเลขอ้างอิง แล้วปั๊มวันที่ออกให้ -
        // ค่อยไปผูก API จริงทีหลัง
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
            $apCode = $deptType . "-" . str_pad(min($ids), 6, "0", STR_PAD_LEFT);
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

        // จำนวนเงินก่อน VAT = ยอดรวม / (1 + %VAT) เมื่อติ๊กใช้ VAT เท่านั้น ไม่งั้นถือว่า
        // ยอดรวมคือยอดก่อน VAT อยู่แล้ว (ไม่มี VAT แยก)
        $beforeVat = $hasVat && $vatPercent > 0 ? $totalVat / (1 + $vatPercent / 100) : $totalVat;
        $vatAmt = $totalVat - $beforeVat;
        // ภาษีหัก ณ ที่จ่าย คิดจากยอดก่อน VAT ตามธรรมเนียมการหักภาษี ณ ที่จ่ายทั่วไป
        $whtAmt = $hasWht ? $beforeVat * $whtPercent / 100 : 0;
        $guaranteeAmt = $hasGuarantee ? $beforeVat * $guaranteePercent / 100 : 0;
        $requestAmt = $totalVat;
        $payAmt = $totalVat - $whtAmt - $penalty - $guaranteeAmt - $other;

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

        if (!empty($idsForAp)) {
            $placeholdersAp = implode(",", array_fill(0, count($idsForAp), "?"));
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
                $apCodeForIr = (!empty($deptTypeForIr) ? $deptTypeForIr : "APMS") . "-" . str_pad(min($idsForAp), 6, "0", STR_PAD_LEFT);
            }
            $arrParamAp = array_merge(
                array($apCodeForIr, $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null),
                $idsForAp
            );
            $sqlAp = "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive
                    SET c_ap_code = ?, d_ap_issue = GETDATE()
                        , dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                    WHERE sp_tor_period_bill_receive_id IN ({$placeholdersAp}) AND i_enabled = 1
                        AND c_ap_code IS NULL AND c_ir_code IS NOT NULL";
            $stmt = $db->QueryParam($sqlAp, $arrParamAp);
            if (!$stmt) {
                $errMsg = "บันทึกรายละเอียดตรวจรับสำเร็จ แต่ออกเลข AP ไม่สำเร็จ";
            }
        }
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
    $re = array("reval" => 1, "success" => "Error", "msg" => $errMsg);
}

echo json_encode($re);
exit;
