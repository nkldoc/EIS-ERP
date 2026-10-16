<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

// เมนู "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" (ST00092) ทั้งเมนูเป็นของฝ่ายเวชภัณฑ์
// การแพทย์โดยเฉพาะ (dc_cost_id=82) ไม่ว่าใครจะเป็นคนล็อกอินเข้ามาบันทึกแทนก็ตาม
define("MEDSUP_DC_COST_ID", 82);

// เลขที่สัญญาอัตโนมัติ (medsupGenContractCode) - ย้ายไปไฟล์กลางให้เมนูนำเข้าสัญญาจาก
// Excel (ST00097) ใช้เลขรันชุดเดียวกัน
include(__DIR__ . "/medsupContractCode.php");

$mode = $_REQUEST["mode"] ?? null;
$data = $util->mnUser($_REQUEST);
$data["i_enabled"] = 1;

// ช่อง "เลขที่สัญญา" (combo) ส่งค่ามาในชื่อ sp_tor_contract_id ซึ่งเป็นคอลัมน์ตัวเลข (bigint) แต่ถ้าเป็นสัญญาที่
// พิมพ์เลขที่เอง/เปิดแก้ไขจากแถวที่บันทึกไว้ ค่าที่ส่งมาจะเป็น "ข้อความเลขที่สัญญา" (เช่น พวช.ว.0001/2569) แทน
// เลข id - ทำให้ SQL error "Error converting data type nvarchar to bigint" ตอนบันทึก ต้องไม่ใช่ตัวเลขล้วนถึงทิ้ง
// (ตอนแก้ไข UPDATE ด้านล่างจะคงค่า id เดิมของแถวไว้ให้ ไม่ทำให้สัญญาที่ผูกกับ ERP หลุด)
if (isset($data["sp_tor_contract_id"]) && $data["sp_tor_contract_id"] !== "" && !ctype_digit(strval($data["sp_tor_contract_id"]))) {
    $data["sp_tor_contract_id"] = null;
}

// ฟิลด์หัวเรื่อง (ชื่อโครงการ/ปีงบ/PO/ผู้ขาย/วันที่เริ่ม-สิ้นสุดสัญญา) กรอกเองได้แล้ว
// (รองรับกรณีคีย์สัญญาใหม่ที่ยังไม่มีในระบบ) วันที่ต้องแปลง พ.ศ.->ค.ศ. ก่อนเก็บ
$headerDateFields = array("d_start_date", "d_end_date");
foreach ($headerDateFields as $fld) {
    $data[$fld] = !empty($data[$fld]) ? $date->bc_to_ad($data[$fld]) : null;
}

// แหล่งเงินสูงสุด 3 แหล่ง (ต่อหัวเรื่อง/hdr) แต่ละแหล่งมีจำนวนเงินของตัวเอง
$headerFundAmtFields = array("f_fund_amt", "f_fund_amt2", "f_fund_amt3");
foreach ($headerFundAmtFields as $fld) {
    $data[$fld] = isset($data[$fld]) && $data[$fld] !== "" ? floatval(str_replace(",", "", $data[$fld])) : null;
}

// เดิม i_period/sp_tor_hdr_period_id เป็นค่าคงที่ระดับหัวเรื่อง ตอนนี้แต่ละงวด
// (แต่ละแถวที่เพิ่ม[+]) มีเลขงวด/id ของตัวเอง จึงต้องเอาออกจาก $data ก่อน แล้ว
// ไปกำหนดใหม่ต่อแถวในลูปข้างล่าง (เหมือน c_doc_ref/d_doc_date/f_amt/c_detail)
unset($data["i_period"]);
unset($data["sp_tor_hdr_period_id"]);
unset($data["c_subject"]);
unset($data["dc_expense_budget_type_id_dtl"]);
unset($data["c_fund_source_dtl"]);
unset($data["f_fund_amt_dtl"]);
// ฟิลด์อ้างอิง sp_tor_period_bill_id ต่องวด (ใช้แค่ฝั่ง UI ตอนกดจองเงิน) ไม่ใช่คอลัมน์
// จริงในตาราง ต้องเอาออกจาก $data ก่อน ไม่งั้นจะหลุดไปเป็นพารามิเตอร์ INSERT ที่ผิด
unset($data["sp_tor_period_bill_id_ref"]);
// ตัวเลือก "ปีต่อปี"/"กันเหลื่อม" (radio) และปีงบประมาณของใบกันเหลื่อมที่เลือกจาก
// dropdown เป็นฟิลด์ช่วยฝั่ง UI เท่านั้น (ใช้ตอนค้นหา/เลือกใบกันเหลื่อม) ไม่ใช่คอลัมน์จริง
// ในตาราง - สถานะจริงเก็บผ่าน c_overlap[n]/i_budget_year_overlap[n] ที่ตัวเลือกเหล่านี้
// เติมให้อัตโนมัติอยู่แล้วตอนเลือกเลขที่ใบกันเหลื่อม
foreach (array("", "2", "3") as $fundSuffix) {
    unset($data["i_bg_reserve_type_radio{$fundSuffix}"]);
    unset($data["i_yyyy_overlap{$fundSuffix}"]);
}
// เมนูนี้ทั้งหน้าเป็นของฝ่ายเวชภัณฑ์การแพทย์โดยเฉพาะ (dc_cost_id=82) - ใช้ค่านี้ตรงๆ
// เสมอสำหรับ "เจ้าของสัญญา" ไม่ใช้ dc_cost_id ของผู้ใช้ที่ล็อกอินอยู่ เพราะเจ้าหน้าที่
// จากหน่วยงานอื่น (เช่นฝ่ายพัสดุ) ก็อาจเข้ามาบันทึกรายการแทนได้ - ส่วน dc_user_create/
// update_cost_id ยังคงเก็บหน่วยงานจริงของผู้ทำรายการไว้ (audit trail ไม่ควรถูกแก้)
$data["dc_cost_id"] = MEDSUP_DC_COST_ID;
$data["dc_user_create_id"] = $_SESSION["user_id"] ?? null;
$data["dc_user_create_cost_id"] = $_SESSION["dc_cost_id"] ?? null;
$data["d_create"] = date("Y-m-d H:i:s");
$data["dc_user_update_id"] = $_SESSION["user_id"] ?? null;
$data["dc_user_update_cost_id"] = $_SESSION["dc_cost_id"] ?? null;
$data["d_update"] = date("Y-m-d H:i:s");

$stmt = true;
$db->BeginTran();

switch ($mode) {
    case "ADD":
        unset($data["mode"]);
        unset($data["sp_tor_period_bill_hdr_id"]);

        // เลือก "เลือกจาก PR ที่มีอยู่" มาแค่ prefill ข้อมูลในฟอร์ม (ฝั่ง JS) เท่านั้น -
        // ไม่ผูก/เขียนทับแถว PR เดิมอีกต่อไป (เคยทำแบบนั้นแล้วพบว่าพอลบสัญญาที่สร้างจาก
        // PR ไป แถว PR เดิมก็หายไปด้วยเพราะเป็นแถวเดียวกัน) ตอนนี้ทุกครั้งที่บันทึกที่นี่
        // จะได้ hdr_id ใหม่ + insert แถวใหม่เสมอ ทำให้ PR เดิมยังอยู่ครบ แก้ไข/ลบเองทีหลัง
        // จากหน้า "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" ได้อิสระ ไม่กระทบสัญญาที่สร้างไปแล้ว
        $data["sp_tor_period_bill_hdr_id"] = intval($db->GetDataBySQL(
            "select top 1 sp_tor_period_bill_hdr_id from NMU_ERP.dbo.sp_tor_period_bill order by sp_tor_period_bill_hdr_id desc",
            array()
        )) + 1;

        // ไม่ได้กรอกเลขที่สัญญาเอง - ออกเลขที่ให้อัตโนมัติตามประเภทหน่วยงานที่เลือก
        if (empty($data["c_contract_code"])) {
            $data["c_contract_code"] = medsupGenContractCode($db, $data["c_ap_dept_type"] ?? "");
        }

        foreach ($_REQUEST["c_doc_ref"] as $k => $val) {
            $data["c_doc_ref"] = $val ?? null;
            // d_doc_dateSub/f_period_amt: ชื่อคอลัมน์ตาม Data Dictionary ของ AP-API
            // ภายนอก (ระบบงบประมาณกลาง มนร.) - request ฝั่ง JS ยังส่งมาในชื่อเดิมก่อน
            $data["d_doc_dateSub"] = !empty($_REQUEST["d_doc_dateSub"][$k]) ? $date->bc_to_ad($_REQUEST["d_doc_dateSub"][$k]) : null;
            $data["c_detail"] = $_REQUEST["c_detail"][$k] ?? null;
            $data["i_period"] = $_REQUEST["i_period"][$k] ?? null;
            $data["sp_tor_hdr_period_id"] = !empty($_REQUEST["sp_tor_hdr_period_id"][$k]) ? $_REQUEST["sp_tor_hdr_period_id"][$k] : null;
            $data["dc_expense_budget_type_id_dtl"] = !empty($_REQUEST["dc_expense_budget_type_id_dtl"][$k]) ? $_REQUEST["dc_expense_budget_type_id_dtl"][$k] : null;
            $data["c_fund_source_dtl"] = $_REQUEST["c_fund_source_dtl"][$k] ?? null;
            $data["f_fund_amt_dtl"] = isset($_REQUEST["f_fund_amt_dtl"][$k]) && $_REQUEST["f_fund_amt_dtl"][$k] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_fund_amt_dtl"][$k])) : null;
            // ไม่มีฟิลด์ "จำนวนเงิน (รวม VAT)" แยกต่างหากแล้ว - ใช้จำนวนเงินจากแหล่งเงิน
            // ของงวดนั้นแทน (f_period_amt ยังเก็บไว้เผื่อ query สรุปยอดเดิมที่ใช้คอลัมน์นี้อยู่)
            $data["f_period_amt"] = $data["f_fund_amt_dtl"];

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

            $sql = "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_tor_period_bill ({$addField}) VALUES ({$addValue});";
            $stmt = $db->QueryParam($sql, $arrValue);
        }
        break;

    case "ADD_PR":
        // เมนูใหม่ "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" (regTorMedSup.js) - สร้างแถวแรกของ
        // hdr ใหม่ใน sp_tor_period_bill ไว้ล่วงหน้า (ระดับ "PR" เท่านั้น: ชื่อโครงการ/
        // ปีงบประมาณ/แหล่งเงิน/ค่าใช้จ่าย) ก่อนที่จะมีสัญญาจริง - ฟิลด์ที่เกี่ยวกับสัญญา
        // (c_contract_code/i_period/d_doc_ref/f_period_amt ฯลฯ) ปล่อยว่างไว้ก่อน รอเมนู
        // "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" เดิมมาเลือกต่อ (ดู "เลือกจาก PR ที่มีอยู่")
        // แล้วเติม/แก้ไขแถวนี้ทีหลัง (ใช้ mode UPDATE เดิมของเมนูนั้นได้เลย ไม่ต้องมี mode
        // ใหม่สำหรับขั้นตอนนั้น)
        //
        // ใช้ whitelist ของคอลัมน์ตรงๆ (ไม่ dynamic-loop ทั้ง $data เหมือน case ADD ข้างบน)
        // เพราะ $data มาจาก $_REQUEST ทั้งก้อน (รวม mode/ปุ่มต่างๆ) ถ้า loop ตรงๆ เสี่ยง
        // insert คอลัมน์ที่ไม่มีจริงจนพัง
        $newHdrId = intval($db->GetDataBySQL(
            "select top 1 sp_tor_period_bill_hdr_id from NMU_ERP.dbo.sp_tor_period_bill order by sp_tor_period_bill_hdr_id desc",
            array()
        )) + 1;

        $prCols = array(
            "sp_tor_period_bill_hdr_id" => $newHdrId,
            "c_project_name" => $data["c_project_name"] ?? null,
            // ฟอร์มส่งปี พ.ศ. มา (dropdown ใน regTorMedSup.js ไม่ได้แปลงก่อนส่ง) แต่คอลัมน์
            // นี้เก็บเป็น ค.ศ. เหมือน i_budget_year ทั่วทั้งตาราง (List_MedSupPeriodBill.php
            // จะ +543 ตอนอ่านออกไปแสดงผลเสมอ) ต้อง -543 ก่อนเก็บ ไม่งั้นโดนบวกทับซ้ำตอน
            // อ่านกลับมา (บั๊กที่เจอจริง: 2569 เก็บดิบๆ แล้ว +543 ทีหลังกลายเป็น 3112)
            "i_budget_year" => isset($data["i_budget_year"]) && $data["i_budget_year"] !== "" ? intval($data["i_budget_year"]) - 543 : null,
            // หน่วยงานเจ้าของเรื่อง - เมนูนี้ (ต่างจาก ADD/UPDATE ของเมนู "บันทึกรายละเอียด
            // ในสัญญา" ที่ถูกล็อกเป็นเวชภัณฑ์เสมอที่ด้านบนไฟล์) ให้ผู้ใช้เลือกได้เอง จึงต้อง
            // อ่านจาก $_REQUEST ตรงๆ (ไม่ใช่ $data ที่ถูก $data["dc_cost_id"] = MEDSUP_DC_
            // COST_ID; เขียนทับไปแล้วที่ด้านบนไฟล์สำหรับทุก mode) default เป็นเวชภัณฑ์
            // (82) ถ้าไม่ได้เลือกมา
            "dc_cost_id" => !empty($_REQUEST["dc_cost_id"]) ? intval($_REQUEST["dc_cost_id"]) : MEDSUP_DC_COST_ID,
            "c_ap_dept_type" => $data["c_ap_dept_type"] ?? "APMS",
            // ประเภท PR (dbo.sp_type_bg) - ค่าเริ่มต้น 1 = "PR ปกติ" ถ้าไม่ได้ส่งมา
            "i_type_bg" => isset($data["i_type_bg"]) && $data["i_type_bg"] !== "" ? intval($data["i_type_bg"]) : 1,
            "po_expense_id" => $data["po_expense_id"] ?? null,
            "c_expense_name" => $data["c_expense_name"] ?? null,
            "dc_expense_budget_type_id" => $data["dc_expense_budget_type_id"] ?? null,
            "c_fund_source" => $data["c_fund_source"] ?? null,
            "f_fund_amt" => isset($data["f_fund_amt"]) && $data["f_fund_amt"] !== "" ? floatval(str_replace(",", "", $data["f_fund_amt"])) : null,
            // แบบแผน/แบบงวด ต่อแหล่งเงิน (1=แบบแผน/2=แบบงวด)
            "i_pr_type" => isset($data["i_pr_type"]) && $data["i_pr_type"] !== "" ? intval($data["i_pr_type"]) : 1,
            "dc_expense_budget_type_id2" => $data["dc_expense_budget_type_id2"] ?? null,
            "c_fund_source2" => $data["c_fund_source2"] ?? null,
            "f_fund_amt2" => isset($data["f_fund_amt2"]) && $data["f_fund_amt2"] !== "" ? floatval(str_replace(",", "", $data["f_fund_amt2"])) : null,
            "i_pr_type2" => isset($data["i_pr_type2"]) && $data["i_pr_type2"] !== "" ? intval($data["i_pr_type2"]) : null,
            "dc_expense_budget_type_id3" => $data["dc_expense_budget_type_id3"] ?? null,
            "c_fund_source3" => $data["c_fund_source3"] ?? null,
            "f_fund_amt3" => isset($data["f_fund_amt3"]) && $data["f_fund_amt3"] !== "" ? floatval(str_replace(",", "", $data["f_fund_amt3"])) : null,
            "i_pr_type3" => isset($data["i_pr_type3"]) && $data["i_pr_type3"] !== "" ? intval($data["i_pr_type3"]) : null,
            // ขอดำเนินการ (1=จัดซื้อ/2=จัดจ้าง/3=จัดเช่า) และของที่ได้มา (1=วัสดุ/
            // 2=ครุภัณฑ์) - ตั้งชื่อ/ค่าตรงกับคอลัมน์ชื่อเดียวกันใน dbo.sp_tor (เมนู PR
            // ทั่วไป) เพื่อความสอดคล้องกัน
            "i_purchase" => isset($data["i_purchase"]) && $data["i_purchase"] !== "" ? intval($data["i_purchase"]) : 1,
            "i_product_type" => isset($data["i_product_type"]) && $data["i_product_type"] !== "" ? intval($data["i_product_type"]) : null,
            // รหัสเอกสารอ้างอิง/วันที่เอกสารอ้างอิง (พวช.) ตอนขอ PR - คนละคอลัมน์กับ
            // c_doc_ref/d_doc_dateSub ที่ใช้ตอนบันทึกรายละเอียดสัญญา (ใบส่งของ/ใบแจ้งหนี้)
            "c_pr_doc_ref" => $data["c_pr_doc_ref"] ?? null,
            "d_pr_doc_ref" => !empty($data["d_pr_doc_ref"]) ? $date->bc_to_ad($data["d_pr_doc_ref"]) : null,
            "i_enabled" => 1,
            "dc_user_create_id" => $data["dc_user_create_id"] ?? null,
            "dc_user_create_cost_id" => $data["dc_user_create_cost_id"] ?? null,
            "d_create" => $data["d_create"] ?? date("Y-m-d H:i:s"),
            "dc_user_update_id" => $data["dc_user_update_id"] ?? null,
            "dc_user_update_cost_id" => $data["dc_user_update_cost_id"] ?? null,
            "d_update" => $data["d_update"] ?? date("Y-m-d H:i:s"),
        );

        $addField = implode(", ", array_keys($prCols));
        $addValue = implode(", ", array_fill(0, count($prCols), "?"));
        $arrValue = array_values($prCols);

        $sql = "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_tor_period_bill ({$addField}) VALUES ({$addValue}); SELECT @@IDENTITY as sp_tor_period_bill_id;";
        $stmt = $db->QueryParam($sql, $arrValue);
        $newRow = $db->Fetch($stmt);
        $newPeriodBillId = intval($newRow["sp_tor_period_bill_id"]);

        // ออกเลขที่ PR ผ่าน stored procedure ตัวเดียวกับเมนู PR ทั่วไป (SP_GEN_CODE) แล้ว
        // ต่อท้ายด้วยรหัสหน่วยงาน (APPS/APMD/APMS) ตามที่เลือกในฟอร์ม - ใช้
        // sp_tor_period_bill_id (เพิ่งสร้างเสร็จ) เป็น reference_id ให้ SP_GEN_CODE
        $bcm = date('Ym', strtotime(date('Y-m-d') . "+543 years"));
        $stmtCode = $db->QueryParam(
            "EXEC SP_GEN_CODE ?,?,?,?,?;",
            array("PR", $bcm, $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null, $newPeriodBillId)
        );
        $genCode = $db->Fetch($stmtCode);
        $prCode = $genCode["c_code_gen"] ?? null;
        $refId = $genCode["reference_id"] ?? null;
        // เช็ค reference_id ตรงกับแถวที่เพิ่งสร้างก่อนเสมอ (แบบเดียวกับ GENCODE ของเมนู PR
        // ทั่วไป) กัน race condition ตอนมีคนออกเลขพร้อมกันหลายคน
        if (!empty($prCode) && intval($refId) === $newPeriodBillId) {
            $deptType = $prCols["c_ap_dept_type"];
            $prCode = $prCode . "-" . $deptType;
            $db->QueryParam(
                "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET c_pr_code = ? WHERE sp_tor_period_bill_id = ?",
                array($prCode, $newPeriodBillId)
            );
        } else {
            $prCode = null;
        }

        echo json_encode([
            "success" => true,
            "reval" => 0,
            "sp_tor_period_bill_hdr_id" => $newHdrId,
            "sp_tor_period_bill_id" => $newPeriodBillId,
            "c_pr_code" => $prCode,
            "msg" => "บันทึก PR เรียบร้อยแล้ว เลขที่ " . $prCode,
        ]);
        $db->CommitTran();
        exit;

    case "UPDATE_PR":
        // แก้ไขแถว PR ที่สร้างจากเมนู "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์" (ดับเบิลคลิกจาก
        // กริดของเมนูนั้น) - แก้ได้เฉพาะแถวที่ยังไม่ผูกสัญญาเท่านั้น (c_contract_code ยัง
        // เป็น null) กันแก้ทับข้อมูลที่เมนู "บันทึกรายละเอียดในสัญญา" เอาไปทำสัญญาต่อแล้ว
        // ไม่แตะ c_pr_code เดิม (ออกเลขไปแล้วตอน ADD_PR ไม่ออกซ้ำ)
        $editPeriodBillId = intval($_REQUEST["sp_tor_period_bill_id"] ?? 0);
        if ($editPeriodBillId <= 0) {
            http_response_code(200);
            echo json_encode(["success" => false, "reval" => 1, "msg" => "ไม่พบรายการที่จะแก้ไข"]);
            $db->RollBackTran();
            exit;
        }
        $lockCheck = $db->GetDataBySQL(
            "SELECT c_contract_code, isnull(bg_reserve_money_id, 0) + isnull(bg_reserve_money_id2, 0) + isnull(bg_reserve_money_id3, 0) AS reserved_sum
               FROM NMU_ERP.dbo.sp_tor_period_bill WHERE sp_tor_period_bill_id = ? AND i_enabled = 1",
            array($editPeriodBillId)
        );
        if (!is_array($lockCheck)) {
            http_response_code(200);
            echo json_encode(["success" => false, "reval" => 1, "msg" => "ไม่พบรายการที่จะแก้ไข"]);
            $db->RollBackTran();
            exit;
        }
        if (intval($lockCheck["reserved_sum"] ?? 0) !== 0) {
            http_response_code(200);
            echo json_encode(["success" => false, "reval" => 1, "msg" => "PR นี้จองเงินแล้ว แก้ไขไม่ได้ กรุณายกเลิกการจองเงินก่อน แล้วจึงแก้ไข"]);
            $db->RollBackTran();
            exit;
        }
        if (!empty($lockCheck["c_contract_code"])) {
            http_response_code(200);
            echo json_encode(["success" => false, "reval" => 1, "msg" => "PR นี้ถูกนำไปทำสัญญาแล้ว (เลขที่สัญญา " . $lockCheck["c_contract_code"] . ") แก้ไขจากเมนูนี้ไม่ได้อีก"]);
            $db->RollBackTran();
            exit;
        }

        $updCols = array(
            "c_project_name" => $data["c_project_name"] ?? null,
            // เก็บเป็น ค.ศ. เหมือน ADD_PR ด้านบน (ดูคำอธิบายที่นั่น)
            "i_budget_year" => isset($data["i_budget_year"]) && $data["i_budget_year"] !== "" ? intval($data["i_budget_year"]) - 543 : null,
            "dc_cost_id" => !empty($_REQUEST["dc_cost_id"]) ? intval($_REQUEST["dc_cost_id"]) : MEDSUP_DC_COST_ID,
            "c_ap_dept_type" => $data["c_ap_dept_type"] ?? "APMS",
            "i_type_bg" => isset($data["i_type_bg"]) && $data["i_type_bg"] !== "" ? intval($data["i_type_bg"]) : 1,
            "po_expense_id" => $data["po_expense_id"] ?? null,
            "c_expense_name" => $data["c_expense_name"] ?? null,
            "dc_expense_budget_type_id" => $data["dc_expense_budget_type_id"] ?? null,
            "c_fund_source" => $data["c_fund_source"] ?? null,
            "f_fund_amt" => isset($data["f_fund_amt"]) && $data["f_fund_amt"] !== "" ? floatval(str_replace(",", "", $data["f_fund_amt"])) : null,
            "i_pr_type" => isset($data["i_pr_type"]) && $data["i_pr_type"] !== "" ? intval($data["i_pr_type"]) : 1,
            "dc_expense_budget_type_id2" => $data["dc_expense_budget_type_id2"] ?? null,
            "c_fund_source2" => $data["c_fund_source2"] ?? null,
            "f_fund_amt2" => isset($data["f_fund_amt2"]) && $data["f_fund_amt2"] !== "" ? floatval(str_replace(",", "", $data["f_fund_amt2"])) : null,
            "i_pr_type2" => isset($data["i_pr_type2"]) && $data["i_pr_type2"] !== "" ? intval($data["i_pr_type2"]) : null,
            "dc_expense_budget_type_id3" => $data["dc_expense_budget_type_id3"] ?? null,
            "c_fund_source3" => $data["c_fund_source3"] ?? null,
            "f_fund_amt3" => isset($data["f_fund_amt3"]) && $data["f_fund_amt3"] !== "" ? floatval(str_replace(",", "", $data["f_fund_amt3"])) : null,
            "i_pr_type3" => isset($data["i_pr_type3"]) && $data["i_pr_type3"] !== "" ? intval($data["i_pr_type3"]) : null,
            "i_purchase" => isset($data["i_purchase"]) && $data["i_purchase"] !== "" ? intval($data["i_purchase"]) : 1,
            "i_product_type" => isset($data["i_product_type"]) && $data["i_product_type"] !== "" ? intval($data["i_product_type"]) : null,
            "c_pr_doc_ref" => $data["c_pr_doc_ref"] ?? null,
            "d_pr_doc_ref" => !empty($data["d_pr_doc_ref"]) ? $date->bc_to_ad($data["d_pr_doc_ref"]) : null,
            "dc_user_update_id" => $data["dc_user_update_id"] ?? null,
            "dc_user_update_cost_id" => $data["dc_user_update_cost_id"] ?? null,
            "d_update" => $data["d_update"] ?? date("Y-m-d H:i:s"),
        );
        $setSql = array();
        $arrValue = array();
        foreach ($updCols as $fld => $value) {
            $setSql[] = "{$fld} = ?";
            $arrValue[] = $value;
        }
        $arrValue[] = $editPeriodBillId;
        $sql = "SET NOCOUNT ON; UPDATE NMU_ERP.dbo.sp_tor_period_bill SET " . implode(", ", $setSql) . " WHERE sp_tor_period_bill_id = ?;";
        $stmt = $db->QueryParam($sql, $arrValue);

        echo json_encode([
            "success" => true,
            "reval" => 0,
            "sp_tor_period_bill_id" => $editPeriodBillId,
            "msg" => "บันทึกการแก้ไข PR เรียบร้อยแล้ว",
        ]);
        $db->CommitTran();
        exit;

    case "UPDATE":
        // เก็บสถานะ "จองเงิน" ต่อแหล่งเงิน (1/2/3) ของ hdr นี้ไว้ก่อนลบ แล้วค่อยใส่กลับ
        // ตอน insert ใหม่ทุกแถว (ฟิลด์พวกนี้ไม่ได้มาจากฟอร์มบันทึกปกติ ถ้าไม่ทำแบบนี้
        // การแก้ไข/เพิ่มงวดจะไปล้างสถานะจองเงินที่เคยทำสำเร็จไปแล้วทิ้งโดยไม่ตั้งใจ)
        $stmtReserve = $db->QueryParam(
            "select top 1 bg_reserve_money_id, c_ap_arrive_code, d_ap_reserve
                  , bg_reserve_money_id2, c_ap_arrive_code2, d_ap_reserve2
                  , bg_reserve_money_id3, c_ap_arrive_code3, d_ap_reserve3
                  , c_ap_api_response, pr_hdr_id, sp_tor_contract_id
                  , pr_bg_reserve_money_id, pr_bg_reserve_money_id2, pr_bg_reserve_money_id3
              from NMU_ERP.dbo.sp_tor_period_bill
              where sp_tor_period_bill_hdr_id = ? and i_enabled = 1",
            array($_REQUEST["sp_tor_period_bill_hdr_id"])
        );
        $reserveRow = $db->Fetch($stmtReserve);
        // ฟอร์มส่ง id สัญญามาเป็นข้อความ (ถูกทิ้งด้านบน) - คงค่า id เดิมของแถวไว้
        if (empty($data["sp_tor_contract_id"]) && !empty($reserveRow["sp_tor_contract_id"])) {
            $data["sp_tor_contract_id"] = $reserveRow["sp_tor_contract_id"];
        }

        // ไม่ได้กรอกเลขที่สัญญาเอง - ออกเลขที่ให้อัตโนมัติตามประเภทหน่วยงานที่เลือก
        // (เกิดขึ้นได้ตอนกรอกรายละเอียดสัญญาต่อจากแถว PR เดิมที่ยังไม่เคยมีเลขที่สัญญา)
        if (empty($data["c_contract_code"])) {
            $data["c_contract_code"] = medsupGenContractCode($db, $data["c_ap_dept_type"] ?? "");
        }

        $sql = "DELETE NMU_ERP.dbo.sp_tor_period_bill WHERE sp_tor_period_bill_hdr_id = ?";
        $arrParam = array($_REQUEST["sp_tor_period_bill_hdr_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);

        unset($data["mode"]);

        if (!empty($reserveRow)) {
            $data["bg_reserve_money_id"] = $reserveRow["bg_reserve_money_id"];
            $data["c_ap_arrive_code"] = $reserveRow["c_ap_arrive_code"];
            $data["d_ap_reserve"] = $reserveRow["d_ap_reserve"];
            $data["bg_reserve_money_id2"] = $reserveRow["bg_reserve_money_id2"];
            $data["c_ap_arrive_code2"] = $reserveRow["c_ap_arrive_code2"];
            $data["d_ap_reserve2"] = $reserveRow["d_ap_reserve2"];
            $data["bg_reserve_money_id3"] = $reserveRow["bg_reserve_money_id3"];
            $data["c_ap_arrive_code3"] = $reserveRow["c_ap_arrive_code3"];
            $data["d_ap_reserve3"] = $reserveRow["d_ap_reserve3"];
            $data["c_ap_api_response"] = $reserveRow["c_ap_api_response"];
            $data["pr_bg_reserve_money_id"] = $reserveRow["pr_bg_reserve_money_id"];
            $data["pr_bg_reserve_money_id2"] = $reserveRow["pr_bg_reserve_money_id2"];
            $data["pr_bg_reserve_money_id3"] = $reserveRow["pr_bg_reserve_money_id3"];
            // PR ต้นทางของสัญญา (ใช้จองเงินขั้นสัญญา) - ถ้าฟอร์มไม่ได้ส่งมา คงค่าเดิมไว้
            if (empty($data["pr_hdr_id"]) && !empty($reserveRow["pr_hdr_id"])) {
                $data["pr_hdr_id"] = $reserveRow["pr_hdr_id"];
            }
        }

        foreach ($_REQUEST["c_doc_ref"] as $k => $val) {
            $data["c_doc_ref"] = $val ?? null;
            // d_doc_dateSub/f_period_amt: ชื่อคอลัมน์ตาม Data Dictionary ของ AP-API
            // ภายนอก (ระบบงบประมาณกลาง มนร.) - request ฝั่ง JS ยังส่งมาในชื่อเดิมก่อน
            $data["d_doc_dateSub"] = !empty($_REQUEST["d_doc_dateSub"][$k]) ? $date->bc_to_ad($_REQUEST["d_doc_dateSub"][$k]) : null;
            $data["c_detail"] = $_REQUEST["c_detail"][$k] ?? null;
            $data["i_period"] = $_REQUEST["i_period"][$k] ?? null;
            $data["sp_tor_hdr_period_id"] = !empty($_REQUEST["sp_tor_hdr_period_id"][$k]) ? $_REQUEST["sp_tor_hdr_period_id"][$k] : null;
            $data["dc_expense_budget_type_id_dtl"] = !empty($_REQUEST["dc_expense_budget_type_id_dtl"][$k]) ? $_REQUEST["dc_expense_budget_type_id_dtl"][$k] : null;
            $data["c_fund_source_dtl"] = $_REQUEST["c_fund_source_dtl"][$k] ?? null;
            $data["f_fund_amt_dtl"] = isset($_REQUEST["f_fund_amt_dtl"][$k]) && $_REQUEST["f_fund_amt_dtl"][$k] !== "" ? floatval(str_replace(",", "", $_REQUEST["f_fund_amt_dtl"][$k])) : null;
            // ไม่มีฟิลด์ "จำนวนเงิน (รวม VAT)" แยกต่างหากแล้ว - ใช้จำนวนเงินจากแหล่งเงิน
            // ของงวดนั้นแทน (f_period_amt ยังเก็บไว้เผื่อ query สรุปยอดเดิมที่ใช้คอลัมน์นี้อยู่)
            $data["f_period_amt"] = $data["f_fund_amt_dtl"];

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

            $sql = "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_tor_period_bill ({$addField}) VALUES ({$addValue});";
            $stmt = $db->QueryParam($sql, $arrValue);
        }
        break;

    case "DELETE":
        // soft delete (ตั้ง i_enabled = 0) แทนการลบถาวร - เผื่อกู้ข้อมูลกลับมาใช้ทีหลัง
        // (ใช้ mode เดียวกันทั้งหน้า "การจัดทำ PR" และ "บันทึกรายละเอียดในสัญญา" - ทุก
        // query LIST ที่อ่านตารางนี้กรอง i_enabled = 1 อยู่แล้ว แถวที่ลบจะหายจากกริดทันที)
        // ห้ามลบรายการที่ยังจองเงินอยู่ (เงินจะค้างในระบบงบโดยไม่มีรายการอ้างอิง) - ต้องยกเลิกจองก่อน
        $reservedCheck = intval($db->GetDataBySQL(
            "select count(*) from NMU_ERP.dbo.sp_tor_period_bill
              where sp_tor_period_bill_hdr_id = ? and i_enabled = 1
                and (isnull(bg_reserve_money_id, 0) > 0 or isnull(bg_reserve_money_id2, 0) > 0 or isnull(bg_reserve_money_id3, 0) > 0)",
            array($_REQUEST["sp_tor_period_bill_hdr_id"] ?? 0)
        ));
        if ($reservedCheck > 0) {
            echo json_encode(array("reval" => 1, "success" => "Error", "msg" => "รายการนี้จองเงินอยู่ กรุณายกเลิกการจองเงินก่อนลบ"));
            $db->RollBackTran();
            exit;
        }
        $sql = "UPDATE NMU_ERP.dbo.sp_tor_period_bill
                SET i_enabled = 0, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
                WHERE sp_tor_period_bill_hdr_id = ?";
        $arrParam = array($data["dc_user_update_id"], $data["dc_user_update_cost_id"], $_REQUEST["sp_tor_period_bill_hdr_id"]);
        $stmt = $db->QueryParam($sql, $arrParam);
        break;

    case "RESERVE_FUND_SOURCE":
        // จองเงินงบประมาณจริง (production) ต่อ "แหล่งเงิน" (ไม่ใช่ต่องวดแล้ว) - จองครั้ง
        // เดียวเต็มยอดของแหล่งเงินนั้น เรียก AP-API ภายนอกตาม Data Dictionary ในชีต
        // "DataDict api AP" ยิง POST เปลี่ยนแปลงยอดงบประมาณจริงของมหาวิทยาลัย
        $db->CommitTran();
        $db = null;
        // level: "pr" = จองขั้น PR (i_reserve 1) จากเมนูการจัดทำ PR / "contract" (ค่าเริ่มต้น) =
        // จองขั้นสัญญา (i_reserve 2) จากเมนู ST00092 ซึ่งต้องมี PR ที่จองไว้แล้วก่อน (ตาม ERP)
        echo json_encode(reserveMedSupFundSource(
            $_REQUEST["sp_tor_period_bill_hdr_id"] ?? null,
            intval($_REQUEST["slot"] ?? 0),
            (($_REQUEST["level"] ?? "contract") === "pr") ? "pr" : "contract"
        ));
        exit;

    case "CANCEL_RESERVE_FUND_SOURCE":
        // ยกเลิกการจองเงิน - ใช้ลิงก์เดิมของ ERP (torUi.js cancelBookingPr):
        // IPAPIBG/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_money_id/{id}/i_enable/2
        $db->CommitTran();
        $db = null;
        echo json_encode(cancelMedSupFundSource(
            $_REQUEST["sp_tor_period_bill_hdr_id"] ?? null,
            intval($_REQUEST["slot"] ?? 0)
        ));
        exit;

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

// ================= จองเงินงบประมาณจริงต่อแหล่งเงิน (API งบของ ERP เดิม) ================= //
// จองครั้งเดียวเต็มยอดของแหล่งเงินที่ระบุ (slot 1/2/3) - งวดต่างๆ ภายใต้สัญญานี้เบิกใช้
// ภายในวงเงินที่จองไว้นี้ได้เรื่อยๆ โดยไม่ต้องจองซ้ำทุกงวด (ตามที่ผู้ใช้ยืนยัน)
//
// ตามระบบ ERP (api-nmu mn_BgReserveMoney.php) การจองมี 2 ขั้น: ขั้น PR (i_reserve 1) ตัดจากงบตรงๆ
// และขั้นสัญญา (i_reserve 2) ซึ่ง API หักจากยอดที่ PR (pr_id เดียวกัน) จองไว้ - จึงรองรับ 3 กรณี:
//  1) level "pr"      : จองขั้น PR จากเมนูการจัดทำ PR (pr_id = hdr_id ของ PR)
//  2) level "contract" + สัญญาผูก PR (pr_hdr_id) ที่จองแล้ว : จองขั้นสัญญาต่อจาก PR นั้น
//  3) level "contract" + ไม่ได้ผูก PR : จองที่หน้าสัญญาได้เลยโดยไม่ต้องจอง PR ก่อน - ระบบจองขั้น PR
//     ให้อัตโนมัติด้วย pr_id = hdr_id ของสัญญาเอง (เก็บเลขอ้างอิงที่ pr_bg_reserve_money_id[n]) แล้วจอง
//     ขั้นสัญญาต่อทันที ถ้าขั้นสัญญาไม่สำเร็จจะยกเลิกขั้น PR ที่เพิ่งจองคืนให้เอง (ไม่ทิ้งเงินค้าง)
function reserveMedSupFundSource($hdrId, $slot, $level = "contract") {
    $db2 = new DatabaseServer();

    if (empty($hdrId) || !in_array($slot, array(1, 2, 3), true)) {
        return array("reval" => 1, "success" => "Error", "msg" => "ไม่พบรายการหรือแหล่งเงินที่ต้องการจองเงิน");
    }

    $suffix = $slot === 1 ? "" : strval($slot);
    $stmt2 = $db2->QueryParam(
        "select top 1 sp_tor_period_bill_hdr_id, sp_tor_contract_id
              , c_contract_code, c_contract_type, c_pr_code
              , i_budget_year, po_expense_id, c_expense_name, i_pr_type, i_pr_type2, i_pr_type3
              , dc_cost_id, c_ap_dept_type, pr_hdr_id
              , dc_expense_budget_type_id as fs1_id, c_fund_source as fs1_name, f_fund_amt as fs1_amt
                  , bg_reserve_money_id as fs1_reserved, pr_bg_reserve_money_id as fs1_pr_reserved, c_overlap as fs1_overlap
              , dc_expense_budget_type_id2 as fs2_id, c_fund_source2 as fs2_name, f_fund_amt2 as fs2_amt
                  , bg_reserve_money_id2 as fs2_reserved, pr_bg_reserve_money_id2 as fs2_pr_reserved, c_overlap2 as fs2_overlap
              , dc_expense_budget_type_id3 as fs3_id, c_fund_source3 as fs3_name, f_fund_amt3 as fs3_amt
                  , bg_reserve_money_id3 as fs3_reserved, pr_bg_reserve_money_id3 as fs3_pr_reserved, c_overlap3 as fs3_overlap
          from NMU_ERP.dbo.sp_tor_period_bill
          where sp_tor_period_bill_hdr_id = ? and i_enabled = 1",
        array($hdrId)
    );
    $row = $db2->Fetch($stmt2);

    if (empty($row)) {
        return array("reval" => 1, "success" => "Error", "msg" => "ไม่พบรายการที่ต้องการจองเงิน");
    }

    $fundId = $row["fs{$slot}_id"];
    $fundAmt = $row["fs{$slot}_amt"];
    // ถ้าแหล่งเงินนี้เลือกไว้เป็น "กันเหลื่อม" (มีเลขที่ใบกันเหลื่อมบันทึกไว้) ให้ส่งเลขที่ใบกัน
    $fundOverlap = $row["fs{$slot}_overlap"];

    if (empty($fundId) || empty($fundAmt)) {
        return array("reval" => 1, "success" => "Error", "msg" => "ยังไม่ได้เลือกแหล่งเงินที่ {$slot} หรือยังไม่ได้กรอกจำนวนเงิน");
    }
    if (!empty($row["fs{$slot}_reserved"])) {
        return array("reval" => 1, "success" => "Error", "msg" => "แหล่งเงินที่ {$slot} จองเงินไปแล้ว");
    }
    // สัญญาที่นำเข้าจากไฟล์และระบบ ERP เวชภัณฑ์จองเงินไว้ในระบบงบแล้ว - ห้ามจองซ้ำจากเมนูนี้
    include_once(__DIR__ . "/medSupErpReserve.php");
    $erpReserve = medSupErpReserve($db2, $row["sp_tor_period_bill_hdr_id"], $fundId);
    if ($erpReserve) {
        return array("reval" => 1, "success" => "Error", "msg" => "แหล่งเงินที่ {$slot} " . $erpReserve["text"] . "<br>ไม่ต้องจองเงินซ้ำจากเมนูนี้");
    }

    $ownHdrId = intval($row["sp_tor_period_bill_hdr_id"]);
    $prRow = null;
    $autoChain = false;
    if ($level === "pr") {
        $prId = medSupBgPrId($row["c_pr_code"] ?? null, $ownHdrId);
    } else {
        $prHdrId = intval($row["pr_hdr_id"] ?? 0);
        if ($prHdrId > 0) {
            // กรณี 2: ผูก PR แล้ว - PR ต้องจองแหล่งเงินเดียวกับสัญญานี้ไว้แล้ว
            $stmtPr = $db2->QueryParam(
                "select top 1 c_pr_code, c_ap_dept_type, dc_cost_id, i_budget_year, po_expense_id
                      , dc_expense_budget_type_id as fs1_id, bg_reserve_money_id as fs1_reserved
                      , dc_expense_budget_type_id2 as fs2_id, bg_reserve_money_id2 as fs2_reserved
                      , dc_expense_budget_type_id3 as fs3_id, bg_reserve_money_id3 as fs3_reserved
                  from NMU_ERP.dbo.sp_tor_period_bill
                 where sp_tor_period_bill_hdr_id = ? and i_enabled = 1",
                array($prHdrId)
            );
            $prRow = $db2->Fetch($stmtPr);
            if (empty($prRow)) {
                return array("reval" => 1, "success" => "Error", "msg" => "ไม่พบ PR ต้นทางของสัญญานี้ (อาจถูกลบไปแล้ว)");
            }
            $prReservedSlot = 0;
            foreach (array(1, 2, 3) as $n) {
                if (intval($prRow["fs{$n}_id"]) === intval($fundId) && intval($prRow["fs{$n}_reserved"]) > 0) {
                    $prReservedSlot = $n;
                    break;
                }
            }
            if ($prReservedSlot === 0) {
                return array("reval" => 1, "success" => "Error", "msg" => "PR ที่เลือกไว้ยังไม่ได้จองเงินแหล่งเงินนี้<br>กรุณาจองเงินที่ PR นั้นก่อน หรือเปิดสัญญาใหม่โดยไม่เลือก PR (ระบบจะจองให้ที่หน้านี้เลย)");
            }
            $prId = medSupBgPrId($prRow["c_pr_code"] ?? null, $prHdrId);
        } else {
            // กรณี 3: ไม่ผูก PR - รองรับผู้ใช้ที่ทำสัญญาแล้วจองเงินที่หน้าสัญญาเลยโดยไม่ออกเลข PR:
            // จองขั้น PR (แค่รายการภายในระบบงบ ไม่สร้างแถว/เลข PR ในระบบเรา) + ขั้นสัญญาต่อเนื่อง
            // เพราะ API บังคับว่าขั้นสัญญาต้องมีขั้น PR ของ pr_id เดียวกันอยู่ก่อน - ส่วนผู้ใช้ที่ทำ PR
            // ก่อนก็ใช้กรณี 2 (เลือก PR ที่จองแล้ว) ได้ตามปกติ ปิดกรณีนี้ได้ด้วย $allowAutoChain = false
            $allowAutoChain = true;
            if (!$allowAutoChain) {
                return array("reval" => 1, "success" => "Error", "msg" => "สัญญานี้ยังไม่ได้ผูกกับ PR ที่จองเงินแล้ว<br>กรุณาจองเงินที่เมนู \"การจัดทำ PR (หน่วยงาน) เวชภัณฑ์\" ก่อน แล้วเปิดสัญญาใหม่โดยเลือก PR นั้นในช่อง \"เลือกจาก PR ที่มีอยู่\"");
            }
            $autoChain = true;
            $prId = medSupBgPrId(null, $ownHdrId);
        }
    }
    $poId = !empty($row["sp_tor_contract_id"]) ? intval($row["sp_tor_contract_id"]) : $ownHdrId;

    $apDeptCostMap = array("APPS" => 38, "APMD" => 50, "APMS" => 82);
    $iPrType = intval($row["i_pr_type{$suffix}"] ?? 1);
    if ($iPrType < 1) {
        $iPrType = 1;
    }
    $src = $prRow ? $prRow : $row; // ขั้นสัญญาที่ผูก PR ใช้ค่าของ PR ต้นทาง (API จับคู่ยอดจากค่าเหล่านี้)
    $yearRaw = intval($src["i_budget_year"]);
    $baseParams = array(
        "i_sys" => 1,
        "pr_id" => intval($prId),
        "po_id" => 0,
        "chk_id" => 0,
        // ระบบงบใช้ปีงบประมาณเป็น ค.ศ. (ปีงบ 2569 = 2026) แต่บางรายการเก็บเป็น พ.ศ. จึงแปลงให้เสมอ
        "i_year" => $yearRaw > 2400 ? $yearRaw - 543 : $yearRaw,
        "i_pr_type" => $iPrType, // 1 = แบบแผน / 2 = แบบงวด
        "i_reserve" => 1,
        // งบผูกกับหน่วยงานตาม "ประเภท" ของรายการ (APPS พัสดุ=38 / APMD เภสัช=50 / APMS เวชภัณฑ์=82)
        // ห้ามใช้ dc_cost_id ที่เก็บในแถว (เมนูนี้เก็บ 82 คงที่) - งบค่ายา/เวชภัณฑ์ 133 แหล่งเงิน กทม.
        // ปี 2026 อยู่ใต้หน่วยงาน 50 เท่านั้น
        "dc_cost_id" => ($apDeptCostMap[$src["c_ap_dept_type"] ?? ""] ?? intval($src["dc_cost_id"])),
        "dc_budget_type_id" => intval($fundId),
        "bg_expense_id" => intval($src["po_expense_id"]),
        // "จัดซื้อจะขาย" ใช้วงเงินหมุนเวียน ไม่ปิดยอด (i_last = 0) ประเภทอื่นจองครบยอดครั้งเดียว
        "i_last" => ($row["c_contract_type"] === "จัดซื้อจะขาย") ? 0 : 1,
    );
    if (!empty($fundOverlap)) {
        $baseParams["c_code_overlap"] = $fundOverlap; // กันเหลื่อม: ส่งเลขที่ใบกันแบบเดียวกับ contractOverlap.js
    }
    $baseParams["f_amt"] = number_format(floatval(str_replace(",", "", $fundAmt)), 2, ".", "");

    $reserveCol = "bg_reserve_money_id" . $suffix;
    $arriveCol = "c_ap_arrive_code" . $suffix;
    $dateCol = "d_ap_reserve" . $suffix;
    $prReserveCol = "pr_bg_reserve_money_id" . $suffix;

    // ขั้น PR (กรณี 1 และขั้นแรกของกรณี 3) ตัดจากงบตรงๆ จึงเช็กเงินคงเหลือก่อน (เหมือนเมนู PR เดิม
    // torUi.js genBooklink) - ไม่พอให้แจ้งเตือนติดต่อฝ่ายการคลัง (ถ้าเช็กไม่ได้ ให้ API ตอบเอง)
    if ($level === "pr" || $autoChain) {
        $precheck = medSupBudgetPrecheck($baseParams, array(
            "dept" => array(38 => "ฝ่ายพัสดุ", 50 => "ฝ่ายเภสัชกรรม", 82 => "งานเวชภัณฑ์ทางการแพทย์")[$baseParams["dc_cost_id"]] ?? "",
            "fund" => $row["fs{$slot}_name"] ?? "",
        ));
        if ($precheck !== null) {
            return $precheck;
        }
    }

    $links = array();

    // ---- กรณี 1: จองขั้น PR อย่างเดียว ----
    if ($level === "pr") {
        $r1 = medSupBgReserveCall($db2, $hdrId, $slot, $baseParams, "pr");
        $links[] = $r1["link"];
        if (!$r1["ok"]) {
            return array("reval" => 1, "success" => "Error", "msg" => $r1["msg"], "sent" => implode("  ➜  ", $links));
        }
        $db2->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET {$reserveCol} = ?, {$arriveCol} = NULL, {$dateCol} = ? WHERE sp_tor_period_bill_hdr_id = ?",
            array($r1["id"] ?: -1, date("Y-m-d H:i:s"), $hdrId)
        );
        return array(
            "reval" => 0, "success" => "Success", "sent" => implode("  ➜  ", $links),
            "msg" => $r1["id"] ? "จองเงินแหล่งที่ {$slot} สำเร็จ (รหัสอ้างอิง {$r1["id"]})"
                : "ส่งข้อมูลจองเงินสำเร็จ แต่ไม่พบเลขอ้างอิงในผลตอบกลับ - กรุณาตรวจสอบกับระบบงบประมาณกลางอีกครั้ง",
        );
    }

    // ---- กรณี 3: จองขั้น PR ให้อัตโนมัติก่อน ----
    $autoPrId = null;
    if ($autoChain) {
        $r1 = medSupBgReserveCall($db2, $hdrId, $slot, $baseParams, "pr");
        $links[] = $r1["link"];
        if (!$r1["ok"]) {
            return array("reval" => 1, "success" => "Error", "msg" => $r1["msg"], "sent" => implode("  ➜  ", $links));
        }
        if (empty($r1["id"])) {
            return array("reval" => 1, "success" => "Error", "sent" => implode("  ➜  ", $links),
                "msg" => "จองขั้น PR สำเร็จ แต่ API ไม่ส่งเลขอ้างอิงกลับมา ไม่สามารถจองขั้นสัญญาต่อได้ กรุณาติดต่อฝ่ายการคลัง");
        }
        $autoPrId = $r1["id"];
        // เก็บเลขอ้างอิงขั้น PR ไว้ทันที (เผื่อขั้นต่อไปพัง จะได้ยกเลิกคืนได้ด้วยเลขนี้)
        $db2->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET {$prReserveCol} = ? WHERE sp_tor_period_bill_hdr_id = ?",
            array($autoPrId, $hdrId)
        );
    }

    // ---- ขั้นสัญญา (กรณี 2 และขั้นที่สองของกรณี 3) ----
    $contractParams = $baseParams;
    $contractParams["i_reserve"] = 2;
    $contractParams["po_id"] = $poId;
    // ขั้นสัญญาใช้ i_pr_type/i_last ของสัญญาเอง (ค่าอื่นเหมือนขั้น PR ทุกตัว - API จับคู่กับที่ PR จองไว้)
    $r2 = medSupBgReserveCall($db2, $hdrId, $slot, $contractParams, "contract");
    $links[] = $r2["link"];
    if (!$r2["ok"]) {
        $msg = $r2["msg"];
        if ($autoPrId) {
            // ขั้นสัญญาไม่สำเร็จ - คืนเงินขั้น PR ที่เพิ่งจองให้อัตโนมัติ ไม่ทิ้งยอดค้างในระบบงบ
            $undo = medSupBgCancelCall($db2, $hdrId, $slot, $autoPrId);
            $links[] = $undo["link"];
            if ($undo["ok"]) {
                $db2->QueryParam(
                    "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET {$prReserveCol} = NULL WHERE sp_tor_period_bill_hdr_id = ?",
                    array($hdrId)
                );
                $msg .= "<br>(ระบบยกเลิกการจองขั้น PR ที่เพิ่งจองคืนให้แล้ว)";
            } else {
                $msg .= "<br><b>คำเตือน:</b> ยกเลิกการจองขั้น PR ที่เพิ่งจอง (รหัสอ้างอิง {$autoPrId}) คืนให้ไม่สำเร็จ กรุณากดยกเลิกการจองเงินอีกครั้ง หรือติดต่อฝ่ายการคลัง";
            }
        }
        return array("reval" => 1, "success" => "Error", "msg" => $msg, "sent" => implode("  ➜  ", $links));
    }

    $db2->QueryParam(
        "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET {$reserveCol} = ?, {$arriveCol} = NULL, {$dateCol} = ? WHERE sp_tor_period_bill_hdr_id = ?",
        array($r2["id"] ?: -1, date("Y-m-d H:i:s"), $hdrId)
    );

    return array(
        "reval" => 0,
        "success" => "Success",
        "sent" => implode("  ➜  ", $links),
        "msg" => $r2["id"]
            ? "จองเงินแหล่งที่ {$slot} สำเร็จ (รหัสอ้างอิง {$r2["id"]})" . ($autoPrId ? "<br>(จองขั้น PR อัตโนมัติ รหัสอ้างอิง {$autoPrId})" : "")
            : "ส่งข้อมูลจองเงินสำเร็จ แต่ไม่พบเลขอ้างอิงในผลตอบกลับ - กรุณาตรวจสอบกับระบบงบประมาณกลางอีกครั้ง",
    );
}

// pr_id ที่ส่งให้ API งบ (คอลัมน์ตัวเลขล้วน) ต้องไม่ชนกับ tor_id ของ PR จริงใน ERP (ลำดับ 1,2,3...
// ที่ API/รายงานงบใช้จับคู่ PR ตาม pr_id + i_sys - ถ้าส่งเลขลำดับแถวของเราตรงๆ จะไปตรงกับ PR เก่าของ
// ERP แล้วรายงานแสดงชื่อ/เลข PR/วันที่ผิดตัว)
//  - มีเลข PR ของเรา: ใช้ "ตัวเลข" ในเลข PR (PR25690900013-APMD -> 25690900013) - ยึดเลขรันเดียวกับ
//    ที่ออกผ่าน SP_GEN_CODE ของ ERP ที่ไม่ซ้ำอยู่แล้ว (ตัวอักษรใน bigint ใส่ไม่ได้ จึงเอาแค่ตัวเลข)
//  - ไม่มีเลข PR (สัญญาที่จองที่หน้าสัญญาเลย): 9900000000 + hdr_id ของสัญญา (ช่วงเลขที่ ERP ไม่ใช้)
function medSupBgPrId($prCode, $hdrId) {
    // สั้นและไม่ชน: 99000 + hdr_id (tor_id ของ PR จริงใน ERP ตอนนี้ไม่เกินหลักพัน ช่วงเลขนี้อยู่สูงกว่ามาก)
    // hdr_id ของแถว PR กับสัญญาใช้ลำดับเดียวกัน จึงไม่ซ้ำกันเอง - PR ใช้ hdr_id ของ PR, สัญญาที่ผูก PR
    // ใช้ hdr_id ของ PR ต้นทาง (ให้ API จับคู่ขั้นสัญญากับขั้น PR), สัญญาที่ไม่มี PR ใช้ hdr_id ของสัญญาเอง
    // ($prCode ไม่ได้ใช้แล้ว เก็บพารามิเตอร์ไว้ให้ตัวเรียกเดิมไม่ต้องแก้)
    return 99000 + intval($hdrId);
}

// เช็กเงินคงเหลือก่อนจองขั้น PR: แบบแผนดู f_total_plan แบบงวดดู f_total_dtl - คืน array error ถ้าไม่พอ
// ไม่งั้นคืน null (รวมถึงกรณีเรียกเช็กไม่ได้ ไม่บล็อกการจอง ให้ API จองตอบเอง)
function medSupBudgetPrecheck($params, $labels = array()) {
    $budgetLink = rtrim(IPAPIBG, "/") . "/?/bg/BgBudgetAllSupplies"
        . "/i_year/" . rawurlencode(strval($params["i_year"]))
        . "/dc_budget_type_id/" . rawurlencode(strval($params["dc_budget_type_id"]))
        . "/dc_cost_id/" . rawurlencode(strval($params["dc_cost_id"]))
        . "/bg_expense_id/" . rawurlencode(strval($params["bg_expense_id"]));
    $chB = curl_init();
    curl_setopt($chB, CURLOPT_URL, $budgetLink);
    curl_setopt($chB, CURLOPT_HTTPGET, 1);
    curl_setopt($chB, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($chB, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($chB, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($chB, CURLOPT_TIMEOUT, 30);
    medSupApplyBgRequestOptions($chB);
    $budgetBody = medSupStripPhpNotices(curl_exec($chB));
    curl_close($chB);
    $budget = json_decode($budgetBody, true);
    if (is_array($budget) && isset($budget["totalCount"])) {
        $balanceKey = $params["i_pr_type"] == 1 ? "f_total_plan" : "f_total_dtl";
        $balance = ($budget["totalCount"] > 0 && isset($budget["data"][0][$balanceKey]))
            ? floatval(str_replace(",", "", $budget["data"][0][$balanceKey])) : 0;
        if ($balance <= 0) {
            // ไม่มีงบเลย (ไม่มีแถวงบ หรือยอดคงเหลือเป็น 0) - หน่วยงานนี้ยังไม่ถูกหยอดงบของแหล่งเงิน/ค่าใช้จ่ายนี้
            return array(
                "reval" => 1,
                "success" => "Error",
                "msg" => "ยังไม่มีงบประมาณ รอคลังหยอดเงิน"
                    . ((!empty($labels["dept"]) || !empty($labels["fund"]))
                        ? "<br>หน่วยงาน: " . ($labels["dept"] ?? "") . " / แหล่งเงิน: " . ($labels["fund"] ?? "") : ""),
                "sent" => $budgetLink,
            );
        }
        if ($balance < floatval($params["f_amt"])) {
            return array(
                "reval" => 1,
                "success" => "Error",
                // แสดงยอดที่ขอจองและเงินคงเหลือจริง เพื่อให้ผู้ใช้เห็นว่าเงินไม่พอจริงๆ
                // เงินคงเหลือดึงจากระบบงบ (คลัง) ตัวเดียวกับรายงานทะเบียนคุมงบประมาณ ของ "หน่วยงาน + แหล่งเงิน +
                // ค่าใช้จ่าย" ที่ใช้จองจริง - ระบุชื่อหน่วยงาน/แหล่งเงินกำกับด้วย ผู้ใช้จะได้รู้ว่ายอดนี้เป็นของกองไหน
                // (งบแต่ละหน่วยงานแยกกัน เช่น เภสัชกับเวชภัณฑ์คนละก้อน)
                "msg" => "เงินไม่พอ กรุณาติดต่อฝ่ายการคลัง"
                    . ((!empty($labels["dept"]) || !empty($labels["fund"]))
                        ? "<br>หน่วยงาน: " . ($labels["dept"] ?? "") . " / แหล่งเงิน: " . ($labels["fund"] ?? "") : "")
                    . "<br>ยอดที่ขอจอง: " . number_format(floatval($params["f_amt"]), 2)
                    . " บาท / เงินคงเหลือ: " . number_format($balance, 2) . " บาท",
                "sent" => $budgetLink,
            );
        }
    }
    return null;
}

// ยิงลิงก์จองเงิน (mode/POST) หนึ่งครั้ง + บันทึกสิ่งที่ส่งและผลตอบกลับลง c_ap_api_response เสมอ
// คืน array(ok, id, link, msg) - $stepLabel: "pr" หรือ "contract" ใช้แปลข้อความเงินไม่พอ
function medSupBgReserveCall($db2, $hdrId, $slot, $params, $stepLabel) {
    $link = rtrim(IPAPIBG, "/") . "/?/bg/mn_BgReserveMoney/mode/POST";
    foreach ($params as $k => $v) {
        $link .= "/" . $k . "/" . rawurlencode(strval($v));
    }

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $link);
    curl_setopt($ch, CURLOPT_HTTPGET, 1);
    // เซิร์ฟเวอร์ PHP ไม่มี CA bundle ของ cert ที่ api-nmu ใช้ (SSL certificate problem: unable to get
    // local issuer certificate) - ปิดการตรวจ cert เฉพาะการเรียกไปยัง IPAPIBG (ระบบงบภายในของ
    // มหาวิทยาลัยเอง) เหมือน mnTorController.php/mnArrivalCode1.php ที่ทำอยู่แล้ว
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    medSupApplyBgRequestOptions($ch);
    $responseBody = medSupStripPhpNotices(curl_exec($ch));
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    // เก็บสิ่งที่ส่ง + ผลตอบกลับดิบไว้เสมอ เพื่อตรวจสอบ/debug ย้อนหลัง - ใส่ทุกแถวของ hdr นี้
    // เพื่อให้ค่ายังอยู่ครบหลัง UPDATE (ลบ+insert ใหม่) ครั้งถัดไป
    $logText = "slot {$slot} {$stepLabel} " . date("Y-m-d H:i:s") . " | SENT: " . $link
        . " | HTTP " . $httpCode . ($curlErr ? " | CURL: " . $curlErr : "")
        . " | RESP: " . $responseBody;
    $db2->QueryParam(
        "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET c_ap_api_response = ? WHERE sp_tor_period_bill_hdr_id = ?",
        array(substr($logText, 0, 4000), $hdrId)
    );

    if ($curlErr) {
        return array("ok" => false, "id" => null, "link" => $link, "msg" => "เชื่อมต่อ API จองเงินไม่สำเร็จ: " . $curlErr);
    }
    $decoded = json_decode($responseBody, true);
    if ($httpCode < 200 || $httpCode >= 300) {
        return array("ok" => false, "id" => null, "link" => $link, "msg" => "API จองเงินตอบกลับผิดพลาด (HTTP {$httpCode}): " . substr($responseBody, 0, 500));
    }
    // API เดิมตอบ {success: true/false, msg, bg_reserve_money_id} - ไม่ใช่ success = จองไม่สำเร็จ
    if (!is_array($decoded) || empty($decoded["success"])) {
        $errMsg = is_array($decoded) ? ($decoded["msg"] ?? $responseBody) : $responseBody;
        if (is_string($errMsg) && stripos($errMsg, "Not enough money") !== false) {
            return array("ok" => false, "id" => null, "link" => $link, "msg" => ($stepLabel === "pr"
                ? "เงินไม่พอ กรุณาติดต่อฝ่ายการคลัง"
                : "เงินไม่พอ ยอดสัญญาเกินยอดที่ PR จองไว้ (หรือถูกสัญญาอื่นของ PR เดียวกันใช้ไปแล้ว) กรุณาติดต่อฝ่ายการคลัง"));
        }
        return array("ok" => false, "id" => null, "link" => $link, "msg" => "API จองเงินปฏิเสธการจอง: " . (is_string($errMsg) ? $errMsg : json_encode($errMsg)));
    }
    $id = $decoded["bg_reserve_money_id"] ?? ($decoded["data"]["bg_reserve_money_id"] ?? null);
    return array("ok" => true, "id" => $id, "link" => $link, "msg" => "");
}

// ยิงลิงก์ยกเลิกการจอง (mode/PUT ... i_enable/2) หนึ่งครั้ง - คืน array(ok, link, msg)
function medSupBgCancelCall($db2, $hdrId, $slot, $reserveId) {
    $link = rtrim(IPAPIBG, "/") . "/?/bg/mn_BgReserveMoney/mode/PUT/bg_reserve_money_id/" . intval($reserveId) . "/i_enable/2";

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $link);
    curl_setopt($ch, CURLOPT_HTTPGET, 1);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    medSupApplyBgRequestOptions($ch);
    $responseBody = medSupStripPhpNotices(curl_exec($ch));
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    $logText = "CANCEL slot {$slot} " . date("Y-m-d H:i:s") . " | SENT: " . $link
        . " | HTTP " . $httpCode . ($curlErr ? " | CURL: " . $curlErr : "")
        . " | RESP: " . $responseBody;
    $db2->QueryParam(
        "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET c_ap_api_response = ? WHERE sp_tor_period_bill_hdr_id = ?",
        array(substr($logText, 0, 4000), $hdrId)
    );

    if ($curlErr) {
        return array("ok" => false, "link" => $link, "msg" => "เชื่อมต่อ API ไม่สำเร็จ: " . $curlErr);
    }
    $decoded = json_decode($responseBody, true);
    if ($httpCode < 200 || $httpCode >= 300 || !is_array($decoded) || empty($decoded["success"])) {
        $errMsg = is_array($decoded) ? ($decoded["msg"] ?? $responseBody) : $responseBody;
        return array("ok" => false, "link" => $link, "msg" => "ยกเลิกการจองเงินไม่สำเร็จ: " . (is_string($errMsg) ? $errMsg : json_encode($errMsg)));
    }
    return array("ok" => true, "link" => $link, "msg" => "");
}

// ================= ตัวช่วยเรียก API งบ (IPAPIBG) จากฝั่งเซิร์ฟเวอร์ ================= //
// ลิงก์นี้ของเดิมถูกเรียกจากเบราว์เซอร์ (มี User-Agent/Referer/คุกกี้ของผู้ใช้ไปด้วยเสมอ) พอ
// เรียกจาก PHP curl เปล่าๆ ฝั่ง api-nmu (lib/log_access.php ทำ strpos กับ header ที่ไม่มี) จึงตอบ
// HTTP 500 - ใส่ header ให้เหมือนเบราว์เซอร์ และส่งคุกกี้ session ของผู้ใช้ต่อไปด้วย (ต้องปล่อย
// session lock ก่อน ไม่งั้นถ้า api-nmu ใช้ session ตัวเดียวกันจะรอกันจน timeout)
function medSupApplyBgRequestOptions($ch) {
    $cookie = "";
    foreach ($_COOKIE as $k => $v) {
        $cookie .= ($cookie === "" ? "" : "; ") . $k . "=" . $v;
    }
    curl_setopt($ch, CURLOPT_USERAGENT, $_SERVER["HTTP_USER_AGENT"] ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
    curl_setopt($ch, CURLOPT_REFERER, (OST_HOST . "://" . ($_SERVER["HTTP_HOST"] ?? "")) . "/supplies/");
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accept: application/json, text/javascript, */*; q=0.01", "X-Requested-With: XMLHttpRequest"));
    if ($cookie !== "") {
        curl_setopt($ch, CURLOPT_COOKIE, $cookie);
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }
    }
}

// ตัดข้อความ PHP Deprecated/Notice/Warning ที่ api-nmu พ่นออกมาปนใน response (ทำให้ log/ข้อความ
// ยาวจนมองไม่เห็นเนื้อหาจริง และ json_decode ไม่ผ่าน) ก่อนนำไปตรวจ/บันทึก
function medSupStripPhpNotices($body) {
    if (!is_string($body)) {
        return $body;
    }
    // api-nmu ตอบ JSON ที่ขึ้นต้นด้วย BOM (EF BB BF) ทำให้ json_decode ล้มเหลว - ผลคือจองสำเร็จจริง
    // แต่ฝั่งเราอ่านผลไม่ออกแล้วแจ้งว่า "ปฏิเสธ" (บั๊กที่เจอจริง) ต้องตัด BOM ออกก่อนเสมอ
    $body = preg_replace('/^\xEF\xBB\xBF/', '', ltrim($body));
    return trim(preg_replace('/(PHP )?(Deprecated|Notice|Warning):[^\r\n]*(\r?\n|$)/', '', $body));
}

// ================= ยกเลิกการจองเงินต่อแหล่งเงิน (ลิงก์เดิมของ ERP) ================= //
// ลำดับ: ยกเลิกขั้นสัญญา/ขั้นที่จองไว้ที่ bg_reserve_money_id[n] ก่อน แล้วค่อยยกเลิกขั้น PR ที่ระบบจอง
// อัตโนมัติไว้ให้สัญญา (pr_bg_reserve_money_id[n] - เฉพาะสัญญาที่จองโดยไม่ได้ผูก PR)
function cancelMedSupFundSource($hdrId, $slot) {
    $db2 = new DatabaseServer();

    if (empty($hdrId) || !in_array($slot, array(1, 2, 3), true)) {
        return array("reval" => 1, "success" => "Error", "msg" => "ไม่พบรายการหรือแหล่งเงินที่ต้องการยกเลิกการจอง");
    }
    $suffix = $slot === 1 ? "" : strval($slot);

    $stmt2 = $db2->QueryParam(
        "select top 1 bg_reserve_money_id{$suffix} as reserved, pr_bg_reserve_money_id{$suffix} as own_pr
           from NMU_ERP.dbo.sp_tor_period_bill
          where sp_tor_period_bill_hdr_id = ? and i_enabled = 1",
        array($hdrId)
    );
    $row = $db2->Fetch($stmt2);
    $reserveId = empty($row) ? 0 : intval($row["reserved"]);
    $ownPrId = empty($row) ? 0 : intval($row["own_pr"]);

    if ($reserveId === 0 && $ownPrId === 0) {
        return array("reval" => 1, "success" => "Error", "msg" => "แหล่งเงินที่ {$slot} ยังไม่ได้จองเงิน");
    }
    if ($reserveId < 0) {
        // -1 = จองสำเร็จแต่ API ไม่ส่งเลขอ้างอิงกลับมา (ดู reserveMedSupFundSource) ไม่มีเลขให้ยกเลิก
        return array("reval" => 1, "success" => "Error", "msg" => "ไม่มีเลขอ้างอิงการจอง ไม่สามารถยกเลิกอัตโนมัติได้ กรุณาติดต่อฝ่ายการคลัง");
    }

    // ห้ามยกเลิกการจองของ PR ถ้ายังมีสัญญาที่จองเงินจาก PR นี้อยู่ (ต้องยกเลิกสัญญาก่อน ไม่งั้น
    // ยอดจองขั้นสัญญาจะค้างโดยไม่มี PR รองรับ)
    $contractReserved = intval($db2->GetDataBySQL(
        "select count(*) from NMU_ERP.dbo.sp_tor_period_bill
          where pr_hdr_id = ? and i_enabled = 1
            and (isnull(bg_reserve_money_id, 0) > 0 or isnull(bg_reserve_money_id2, 0) > 0 or isnull(bg_reserve_money_id3, 0) > 0)",
        array($hdrId)
    ));
    if ($contractReserved > 0) {
        return array("reval" => 1, "success" => "Error", "msg" => "มีสัญญาที่จองเงินจาก PR นี้อยู่ ({$contractReserved} รายการ) กรุณายกเลิกการจองเงินของสัญญาเหล่านั้นก่อน แล้วจึงยกเลิกการจองของ PR");
    }

    $links = array();
    $cancelled = array();

    if ($reserveId > 0) {
        $c1 = medSupBgCancelCall($db2, $hdrId, $slot, $reserveId);
        $links[] = $c1["link"];
        if (!$c1["ok"]) {
            return array("reval" => 1, "success" => "Error", "msg" => $c1["msg"], "sent" => implode("  ➜  ", $links));
        }
        $db2->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill
                SET bg_reserve_money_id{$suffix} = NULL, c_ap_arrive_code{$suffix} = NULL, d_ap_reserve{$suffix} = NULL
              WHERE sp_tor_period_bill_hdr_id = ?",
            array($hdrId)
        );
        $cancelled[] = "รหัสอ้างอิง {$reserveId}";
    }

    if ($ownPrId > 0) {
        $c2 = medSupBgCancelCall($db2, $hdrId, $slot, $ownPrId);
        $links[] = $c2["link"];
        if (!$c2["ok"]) {
            return array("reval" => 1, "success" => "Error", "sent" => implode("  ➜  ", $links),
                "msg" => ($reserveId > 0 ? "ยกเลิกขั้นสัญญาแล้ว แต่" : "") . "ยกเลิกการจองขั้น PR (รหัสอ้างอิง {$ownPrId}) ไม่สำเร็จ: " . $c2["msg"] . "<br>กรุณากดยกเลิกการจองเงินอีกครั้ง หรือติดต่อฝ่ายการคลัง");
        }
        $db2->QueryParam(
            "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET pr_bg_reserve_money_id{$suffix} = NULL WHERE sp_tor_period_bill_hdr_id = ?",
            array($hdrId)
        );
        $cancelled[] = "ขั้น PR รหัสอ้างอิง {$ownPrId}";
    }

    return array("reval" => 0, "success" => "Success", "sent" => implode("  ➜  ", $links),
        "msg" => "ยกเลิกการจองเงินแหล่งที่ {$slot} แล้ว (" . implode(", ", $cancelled) . ") คืนเงินกลับงบประมาณเรียบร้อย");
}
