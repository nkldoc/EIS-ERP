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

// เลขที่สัญญาอัตโนมัติ - ใช้เฉพาะตอนผู้ใช้ปล่อยช่อง "เลขที่สัญญา" ว่างไว้ (มีเลขที่ของ
// ตัวเองอยู่แล้วก็กรอกเองได้ตามเดิม) รูปแบบ "{prefix}{เลขรัน 4 หลัก}/{ปีงบประมาณ พ.ศ.}"
// prefix ตามประเภทหน่วยงาน (c_ap_dept_type) - รันเลขแยกชุดกันทั้งต่อประเภทและต่อปี
// งบประมาณ (ภ./พ./ว. คนละชุดเลข และขึ้นปีงบใหม่ก็เริ่มนับ 0001 ใหม่ ตามที่ผู้ใช้ยืนยัน)
// ปีงบประมาณไทยเริ่ม 1 ต.ค. - เดือน ต.ค.-ธ.ค. ถือเป็นปีงบถัดไปแล้ว
function medsupGenContractCode($db, $deptType)
{
    $prefixMap = array(
        "APPS" => "พวช.พ.",
        "APMD" => "พวช.ภ.",
        "APMS" => "พวช.ว.",
    );
    $prefix = $prefixMap[$deptType] ?? "พวช.";

    $now = new DateTime();
    $yearBE = intval($now->format("Y")) + 543;
    $fiscalYear = (intval($now->format("n")) >= 10) ? $yearBE + 1 : $yearBE;
    $suffix = "/{$fiscalYear}";

    $stmt = $db->QueryParam(
        "SELECT c_contract_code FROM NMU_ERP.dbo.sp_tor_period_bill
          WHERE c_contract_code LIKE ? AND c_contract_code LIKE ?",
        array($prefix . '%', '%' . $suffix)
    );
    $maxNum = 0;
    while ($row = $db->Fetch($stmt)) {
        $middle = substr($row["c_contract_code"], strlen($prefix), -strlen($suffix));
        if (ctype_digit($middle)) {
            $maxNum = max($maxNum, intval($middle));
        }
    }

    return $prefix . str_pad($maxNum + 1, 4, '0', STR_PAD_LEFT) . $suffix;
}

$mode = $_REQUEST["mode"] ?? null;
$data = $util->mnUser($_REQUEST);
$data["i_enabled"] = 1;

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
            "SELECT c_contract_code FROM NMU_ERP.dbo.sp_tor_period_bill WHERE sp_tor_period_bill_id = ? AND i_enabled = 1",
            array($editPeriodBillId)
        );
        if (!is_array($lockCheck)) {
            http_response_code(200);
            echo json_encode(["success" => false, "reval" => 1, "msg" => "ไม่พบรายการที่จะแก้ไข"]);
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
                  , c_ap_api_response
              from NMU_ERP.dbo.sp_tor_period_bill
              where sp_tor_period_bill_hdr_id = ? and i_enabled = 1",
            array($_REQUEST["sp_tor_period_bill_hdr_id"])
        );
        $reserveRow = $db->Fetch($stmtReserve);

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
        echo json_encode(reserveMedSupFundSource(
            $_REQUEST["sp_tor_period_bill_hdr_id"] ?? null,
            intval($_REQUEST["slot"] ?? 0)
        ));
        exit;

    case "CANCEL_RESERVE_FUND_SOURCE":
        // ยกเลิกการจองเงิน - AP-API ยังไม่มีข้อมูล spec ของ endpoint/payload ฝั่ง
        // ยกเลิก (ไม่มีตัวอย่างใน spreadsheet) จึงยังไม่เชื่อมต่อจริง เพื่อกันการยิง
        // คำขอที่เดาเอาเองไปกระทบงบประมาณจริงของมหาวิทยาลัย
        $db->RollBackTran();
        echo json_encode(array(
            "reval" => 1,
            "success" => "Error",
            "msg" => "ยังไม่มีข้อมูล API สำหรับยกเลิกการจองเงิน กรุณาติดต่อผู้ดูแลระบบงบประมาณเพื่อขอรายละเอียด endpoint/รูปแบบข้อมูลก่อน",
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

// ================= จองเงินงบประมาณจริงต่อแหล่งเงิน (AP-API) ================= //
// จองครั้งเดียวเต็มยอดของแหล่งเงินที่ระบุ (slot 1/2/3) - งวดต่างๆ ภายใต้สัญญานี้เบิกใช้
// ภายในวงเงินที่จองไว้นี้ได้เรื่อยๆ โดยไม่ต้องจองซ้ำทุกงวด (ตามที่ผู้ใช้ยืนยัน)
function reserveMedSupFundSource($hdrId, $slot) {
    $db2 = new DatabaseServer();

    if (empty($hdrId) || !in_array($slot, array(1, 2, 3), true)) {
        return array("reval" => 1, "success" => "Error", "msg" => "ไม่พบรายการหรือแหล่งเงินที่ต้องการจองเงิน");
    }

    $suffix = $slot === 1 ? "" : strval($slot);
    $col = function ($base) use ($suffix) {
        return $base . $suffix;
    };

    $stmt2 = $db2->QueryParam(
        "select top 1 sp_tor_period_bill_hdr_id, sp_tor_id, sp_tor_contract_id
              , c_contract_code, c_contract_type
              , convert(varchar, d_start_date, 120) as d_start_date
              , convert(varchar, d_end_date, 120) as d_end_date
              , i_budget_year, po_expense_id, c_expense_name
              , dc_cost_id, c_tax_number_imp, dc_creditor_id, c_creditor_name
              , dc_expense_budget_type_id as fs1_id, c_fund_source as fs1_name, f_fund_amt as fs1_amt
                  , bg_reserve_money_id as fs1_reserved, c_overlap as fs1_overlap, i_budget_year_overlap as fs1_overlap_year
              , dc_expense_budget_type_id2 as fs2_id, c_fund_source2 as fs2_name, f_fund_amt2 as fs2_amt
                  , bg_reserve_money_id2 as fs2_reserved, c_overlap2 as fs2_overlap, i_budget_year_overlap2 as fs2_overlap_year
              , dc_expense_budget_type_id3 as fs3_id, c_fund_source3 as fs3_name, f_fund_amt3 as fs3_amt
                  , bg_reserve_money_id3 as fs3_reserved, c_overlap3 as fs3_overlap, i_budget_year_overlap3 as fs3_overlap_year
          from NMU_ERP.dbo.sp_tor_period_bill
          where sp_tor_period_bill_hdr_id = ? and i_enabled = 1",
        array($hdrId)
    );
    $row = $db2->Fetch($stmt2);

    if (empty($row)) {
        return array("reval" => 1, "success" => "Error", "msg" => "ไม่พบรายการที่ต้องการจองเงิน");
    }

    $fundId = $row["fs{$slot}_id"];
    $fundName = $row["fs{$slot}_name"];
    $fundAmt = $row["fs{$slot}_amt"];
    $alreadyReserved = $row["fs{$slot}_reserved"];
    // ถ้าแหล่งเงินนี้เลือกไว้เป็น "กันเหลื่อม" (มีเลขที่ใบกันเหลื่อมบันทึกไว้) ให้ส่งเลข
    // ที่ใบกัน/ปีงบประมาณของใบกันนั้นไปให้ AP-API แทนค่าว่าง (ปีต่อปี)
    $fundOverlap = $row["fs{$slot}_overlap"];
    $fundOverlapYear = $row["fs{$slot}_overlap_year"];

    if (empty($fundId) || empty($fundAmt)) {
        return array("reval" => 1, "success" => "Error", "msg" => "ยังไม่ได้เลือกแหล่งเงินที่ {$slot} หรือยังไม่ได้กรอกจำนวนเงิน");
    }
    if (!empty($alreadyReserved)) {
        return array("reval" => 1, "success" => "Error", "msg" => "แหล่งเงินที่ {$slot} จองเงินไปแล้ว");
    }

    // ถ้าสัญญานี้ไม่มี id จริงในระบบเรา (พิมพ์เลขที่สัญญาใหม่เอง ยังไม่เคยผูกกับ PR/สัญญา
    // เดิม) ให้ใช้ id ของเราเอง (sp_tor_period_bill_hdr_id) แทนส่งไปให้ AP-API ก่อน
    $prId = !empty($row["sp_tor_id"]) ? $row["sp_tor_id"] : $row["sp_tor_period_bill_hdr_id"];
    $poId = !empty($row["sp_tor_contract_id"]) ? $row["sp_tor_contract_id"] : $row["sp_tor_period_bill_hdr_id"];

    $userId = $_SESSION["user_id"] ?? null;
    $userName = $db2->GetDataBySQL("select top 1 c_full_name from dbo.dc_user where dc_user_id = ?", array($userId));

    $payload = array(
        "username" => AP_EIS_API_USER,
        "password" => AP_EIS_API_PASS,
        "data" => array(
            array(
                "pr_id" => intval($prId),
                "po_id" => intval($poId),
                // ไม่ผูกกับงวดใดงวดหนึ่งแล้ว (จองระดับแหล่งเงิน/สัญญา) - ส่ง 0 เหมือน
                // แนวทาง "0 = ทั้งหมด" ที่ dict ใช้กับ bg_expense_id
                "period_id" => 0,
                "chk_id" => 0,
                "c_contract_code" => $row["c_contract_code"],
                "d_start_date" => empty($row["d_start_date"]) ? null : date("Y-m-d", strtotime($row["d_start_date"])),
                // ยังไม่มีฟิลด์ "วันที่สัญญามีผล" แยกในฟอร์ม - ใช้วันที่เริ่มสัญญาแทนไปก่อน
                "d_contract_start_date" => empty($row["d_start_date"]) ? null : date("Y-m-d", strtotime($row["d_start_date"])),
                "d_end_date" => empty($row["d_end_date"]) ? null : date("Y-m-d", strtotime($row["d_end_date"])),
                "i_period" => 0,
                "f_period_amt" => floatval(str_replace(",", "", $fundAmt)),
                "bg_expense_id" => intval($row["po_expense_id"]),
                "bg_expense_name" => $row["c_expense_name"],
                "dc_expense_budget_type_id" => intval($fundId),
                "dc_expense_budget_type_name" => $fundName,
                // ประเภท "จัดซื้อจะขาย" ใช้เป็นวงเงินหมุนเวียนได้เรื่อยๆ ไม่ปิดยอด/ไม่คืน
                // เงินคงเหลือ (จำกัดแค่ไม่เกินยอดแหล่งเงินที่ระบุ) ส่วนประเภทอื่นถือว่า
                // จองครั้งนี้ครั้งเดียวครบยอดตามที่กรอกเลย
                "i_is_last" => ($row["c_contract_type"] === "จัดซื้อจะขาย") ? 0 : 1,
                "i_product_type" => 1,
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "c_tax_number_imp" => $row["c_tax_number_imp"],
                "dc_creditor_id" => intval($row["dc_creditor_id"]),
                "dc_creditor_idTxt" => $row["c_creditor_name"],
                "i_budget_year" => strval($row["i_budget_year"]),
                "i_budget_year_overlap" => empty($fundOverlap) ? "" : strval($fundOverlapYear),
                // จองที่ระดับแหล่งเงิน/สัญญา ยังไม่มีเอกสารรับของที่เจาะจง (จะเกิดทีหลัง
                // ตอนบันทึกแต่ละงวด) จึงยังไม่มีเลขที่รับของ/วันที่รับของให้ส่ง
                "c_arrive_code" => null,
                "d_arrive_date" => null,
                "c_doc_ref" => null,
                "user_id" => intval($userId),
                "user_name" => $userName,
                "c_overlap" => empty($fundOverlap) ? "" : $fundOverlap,
                "line_ids" => array(),
            ),
        ),
    );

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, AP_EIS_API_URL);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array("Content-Type: application/json"));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    $responseBody = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlErr = curl_error($ch);
    curl_close($ch);

    if ($curlErr) {
        return array("reval" => 1, "success" => "Error", "msg" => "เชื่อมต่อ AP-API ไม่สำเร็จ: " . $curlErr);
    }

    // เก็บ raw response ไว้เสมอเพื่อตรวจสอบ/debug (ไม่ทราบ schema ที่แน่ชัด) - ใส่ทุก
    // แถวของ hdr นี้เพื่อให้ค่ายังอยู่ครบหลัง UPDATE (ลบ+insert ใหม่) ครั้งถัดไป
    $db2->QueryParam(
        "UPDATE NMU_ERP.dbo.sp_tor_period_bill SET c_ap_api_response = ? WHERE sp_tor_period_bill_hdr_id = ?",
        array(substr($responseBody, 0, 4000), $hdrId)
    );

    $decoded = json_decode($responseBody, true);
    if ($httpCode < 200 || $httpCode >= 300) {
        return array("reval" => 1, "success" => "Error", "msg" => "AP-API ตอบกลับผิดพลาด (HTTP {$httpCode}): " . substr($responseBody, 0, 500));
    }
    if (is_array($decoded) && (isset($decoded["error"]) || (isset($decoded["success"]) && !$decoded["success"]))) {
        $errMsg = $decoded["error"] ?? ($decoded["message"] ?? $responseBody);
        return array("reval" => 1, "success" => "Error", "msg" => "AP-API ปฏิเสธการจองเงิน: " . (is_string($errMsg) ? $errMsg : json_encode($errMsg)));
    }

    // ไม่ทราบ schema ที่แน่ชัดของค่าที่ตอบกลับ (ไม่มีตัวอย่าง response ในเอกสาร) - ลอง
    // เดาชื่อฟิลด์ที่เป็นไปได้ ถ้าไม่เจอก็ยังถือว่าสำเร็จ (HTTP 2xx ไม่มี error) แต่ไม่มี
    // เลขอ้างอิงให้ - ผู้ใช้ควรตรวจสอบกับระบบงบประมาณกลางอีกครั้ง
    $bgReserveMoneyId = $decoded["bg_reserve_money_id"] ?? ($decoded["data"]["bg_reserve_money_id"] ?? null);
    $arriveCode = $decoded["c_arrive_code"] ?? ($decoded["data"]["c_arrive_code"] ?? null);

    $reserveCol = $col("bg_reserve_money_id");
    $arriveCol = $col("c_ap_arrive_code");
    $dateCol = $col("d_ap_reserve");
    $db2->QueryParam(
        "UPDATE NMU_ERP.dbo.sp_tor_period_bill
            SET {$reserveCol} = ?, {$arriveCol} = ?, {$dateCol} = ?
          WHERE sp_tor_period_bill_hdr_id = ?",
        array($bgReserveMoneyId ?: -1, $arriveCode, date("Y-m-d H:i:s"), $hdrId)
    );

    return array(
        "reval" => 0,
        "success" => "Success",
        "msg" => $bgReserveMoneyId
            ? "จองเงินแหล่งที่ {$slot} สำเร็จ (รหัสอ้างอิง {$bgReserveMoneyId})"
            : "ส่งข้อมูลจองเงินสำเร็จ แต่ไม่พบเลขอ้างอิงในผลตอบกลับ - กรุณาตรวจสอบกับระบบงบประมาณกลางอีกครั้ง",
    );
}
