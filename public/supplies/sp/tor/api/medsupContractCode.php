<?php
// เลขที่สัญญาอัตโนมัติ - ใช้เฉพาะตอนผู้ใช้ปล่อยช่อง "เลขที่สัญญา" ว่างไว้ (มีเลขที่ของ
// ตัวเองอยู่แล้วก็กรอกเองได้ตามเดิม) รูปแบบ "{prefix}{เลขรัน 4 หลัก}/{ปีงบประมาณ พ.ศ.}"
// prefix ตามประเภทหน่วยงาน (c_ap_dept_type) - รันเลขแยกชุดกันทั้งต่อประเภทและต่อปี
// งบประมาณ (ภ./พ./ว. คนละชุดเลข และขึ้นปีงบใหม่ก็เริ่มนับ 0001 ใหม่ ตามที่ผู้ใช้ยืนยัน)
// ปีงบประมาณไทยเริ่ม 1 ต.ค. - เดือน ต.ค.-ธ.ค. ถือเป็นปีงบถัดไปแล้ว
// ใช้ร่วมกันทั้ง mnMedSupPeriodBillController.php (ST00092) และ mnMedSupContractImport.php
// (นำเข้าสัญญาจาก Excel ST00097) ให้เลขรันเป็นชุดเดียวกัน
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
