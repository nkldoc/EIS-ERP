<?php
// ยอดเงิน VAT/ภาษีหัก ณ ที่จ่าย ของรายการรับของ (sp_tor_period_bill_receive) เมนู
// "ส่งมอบงาน (เวชภัณฑ์)" (ST00095) - ร่าง VAT เก็บ "แยกรายการ" (ผู้ใช้ยืนยัน: เลือก IR-01
// แก้ VAT ได้เฉพาะของ IR-01) ยอดของเลข IR = ผลรวมของทุกรายการใน IR นั้น
// ใช้ร่วมกันทั้ง List_MedSupPeriodBill.php (type=medsup_checking_by_ir ให้หน้าตรวจรับ
// ST00096) และ mnMedSupPeriodBillReceiveController.php (อัปเดตยอดใน
// sp_tor_period_bill_checking หลังแก้ร่าง)

// ยอดของรายการรับของ 1 แถว - ใช้ยอด VAT/หัก ณ ที่จ่ายที่บันทึกไว้ได้ก็ต่อเมื่อร่างยังตรงกับ
// จำนวนเงินของแถวตอนนี้ (ยอดรวม VAT ของร่าง = f_amt) ไม่งั้น (ไม่มีร่าง / ร่างเก่าที่เก็บ
// ยอดรวมทั้งกลุ่ม / แก้จำนวนเงินหลังบันทึกร่าง) คิดใหม่จาก % (ค่าเริ่มต้น VAT 7% / หัก 1%)
function medsupRowMoney($row)
{
    $amt = round(floatval($row["f_amt"]), 2);
    $hasDraft = !is_null($row["draft_f_total_vat"]);
    $bVat = $hasDraft ? intval($row["draft_b_vat"]) : 1;
    $vatPct = $hasDraft && !is_null($row["draft_f_vat_percent"]) ? floatval($row["draft_f_vat_percent"]) : 7;
    $bWht = $hasDraft ? intval($row["draft_b_wht"]) : 1;
    $whtPct = $hasDraft && !is_null($row["draft_f_wht_percent"]) ? floatval($row["draft_f_wht_percent"]) : 1;
    $bGuar = $hasDraft ? intval($row["draft_b_guarantee"]) : 0;
    $guarPct = $hasDraft && !is_null($row["draft_f_guarantee_percent"]) ? floatval($row["draft_f_guarantee_percent"]) : 0;
    $penalty = $hasDraft && !is_null($row["draft_f_penalty"]) ? round(floatval($row["draft_f_penalty"]), 2) : 0;
    $other = $hasDraft && !is_null($row["draft_f_other"]) ? round(floatval($row["draft_f_other"]), 2) : 0;

    $savedTotal = $hasDraft ? round(floatval($row["draft_f_total_vat"]), 2) : 0;
    $savedVat = !is_null($row["draft_f_vat_amt"]) ? round(floatval($row["draft_f_vat_amt"]), 2) : null;
    // [ผู้ใช้ยืนยัน] "ถอด VAT" - f_amt ที่คีย์ = จำนวนเงินรวม VAT แล้ว (107) -> ก่อน VAT =
    // 107/1.07 = 100, VAT = 7, หัก ณ ที่จ่ายคิดจากยอดก่อน VAT (1% = 1)
    // ใช้ยอดที่บันทึกไว้ได้ = เคยบันทึกร่าง VAT ของรายการนี้ และยอดรวม VAT ของร่างยังเท่ากับ
    // จำนวนเงินปัจจุบัน (ไม่ตรง/ไม่มีร่าง -> ถอด VAT ใหม่จาก % ถือว่าถูกต้อง ไม่ใช่ข้อผิดพลาด)
    $useSaved = $hasDraft && !is_null($savedVat) && abs($savedTotal - $amt) < 0.005;
    // ยอดของรายการ "ใช้ได้" (ยืนยันยอดได้) - ที่ผิดจริงคือจำนวนเงินไม่มี/เป็น 0 หรือติดลบ
    $confirmed = $amt > 0;
    if ($useSaved) {
        $vat = $bVat ? $savedVat : 0;
    } else {
        $vat = $bVat && $vatPct > 0 ? round($amt - $amt / (1 + $vatPct / 100), 2) : 0;
    }
    $before = round($amt - $vat, 2);
    if ($useSaved && $bWht && !is_null($row["draft_f_wht_amt"])) {
        $wht = round(floatval($row["draft_f_wht_amt"]), 2);
    } else {
        $wht = $bWht ? round($before * $whtPct / 100, 2) : 0;
    }
    return array(
        "has_draft" => $hasDraft,
        "confirmed" => $confirmed,
        "amt" => $amt, "before" => $before, "vat" => $vat, "wht" => $wht, "penalty" => $penalty, "other" => $other,
        "b_vat" => $bVat, "vat_pct" => $vatPct, "b_wht" => $bWht, "wht_pct" => $whtPct,
        "b_guar" => $bGuar, "guar_pct" => $guarPct,
    );
}

// ยอดรวมของเลข IR = ผลรวมยอดของทุกรายการใน IR - ติ๊ก/% เอาจากรายการแรกที่มีร่าง (ใช้แสดง
// อย่างเดียว) ค่าประกันผลงานคิดจากยอดก่อน VAT รวม ตามสูตรเดิมของ SAVE_CHECKING
function medsupIrMoney($db, $irCode)
{
    $stmt = $db->QueryParam(
        "select c_receive_code, f_amt, draft_f_total_vat, draft_b_vat, draft_f_vat_percent, draft_b_wht, draft_f_wht_percent
                , draft_f_penalty, draft_b_guarantee, draft_f_guarantee_percent, draft_f_other
                , draft_f_vat_amt, draft_f_wht_amt
         from NMU_ERP.dbo.sp_tor_period_bill_receive
         where c_ir_code = ? and i_enabled = 1
         order by sp_tor_period_bill_receive_id",
        array($irCode)
    );
    $sum = array("amt" => 0, "before" => 0, "vat" => 0, "wht" => 0, "penalty" => 0, "other" => 0);
    $flags = null;
    $firstRow = null;
    $hasDraft = false;
    $unconfirmed = array();
    while ($row = $db->Fetch($stmt)) {
        $m = medsupRowMoney($row);
        if (!$m["confirmed"]) {
            $unconfirmed[] = ($row["c_receive_code"] ?: "(ไม่มีเลข)") . " (จำนวนเงินต้องมากกว่า 0)";
        }
        foreach ($sum as $k => $v) {
            $sum[$k] = round($v + $m[$k], 2);
        }
        if ($firstRow === null) {
            $firstRow = $m;
        }
        if ($m["has_draft"]) {
            $hasDraft = true;
            if ($flags === null) {
                $flags = $m;
            }
        }
    }
    if ($firstRow === null) {
        return null;
    }
    $flags = $flags ?? $firstRow;
    // ถอด VAT: ยอดรวม VAT = ผลรวมจำนวนเงินที่คีย์, ก่อน VAT = ผลรวมยอดก่อน VAT ของแต่ละรายการ
    $total = $sum["amt"];
    $beforeVat = $sum["before"];
    $guarAmt = $flags["b_guar"] ? round($beforeVat * $flags["guar_pct"] / 100, 2) : 0;
    return array(
        "has_draft" => $hasDraft,
        "unconfirmed" => $unconfirmed,
        "f_total_vat" => $total,
        "b_vat" => $flags["b_vat"],
        "f_vat_percent" => $flags["vat_pct"],
        "f_before_vat" => $beforeVat,
        "f_vat_amt" => $sum["vat"],
        "f_request_amt" => $total,
        "b_wht" => $flags["b_wht"],
        "f_wht_percent" => $flags["wht_pct"],
        "f_wht_amt" => $sum["wht"],
        "f_penalty" => $sum["penalty"],
        "b_guarantee" => $flags["b_guar"],
        "f_guarantee_percent" => $flags["guar_pct"],
        "f_guarantee_amt" => $guarAmt,
        "f_other" => $sum["other"],
        // [ผู้ใช้ยืนยัน] จ่าย = ยอดรวม VAT - หัก ณ ที่จ่าย - ค่าปรับ - ค่าประกันผลงาน - อื่นๆ
        "f_pay_amt" => round($total - $sum["wht"] - $sum["penalty"] - $guarAmt - $sum["other"], 2),
    );
}

// [ผู้ใช้ยืนยัน] ก่อนออกเลข AP ที่หน้าตรวจรับ (ST00096) ยอดเงินของเลข IR ต้องถูกต้อง = ทุก
// รายการย่อยใน IR ยืนยันยอด VAT แล้ว (กดบันทึกร่าง VAT และจำนวนเงินไม่ถูกแก้ภายหลัง) และยอด
// รวม VAT / VAT / หัก ณ ที่จ่าย ที่จะบันทึก ตรงกับผลรวมของรายการย่อย - คืน "" = ผ่าน,
// ไม่ผ่านคืนข้อความแจ้งเตือนบอกให้กลับไปแก้ VAT ที่หน้าส่งมอบงาน
function medsupIrVatCheck($db, $irCode, $totalVat, $vatAmt, $whtAmt)
{
    $m = medsupIrMoney($db, $irCode);
    if ($m === null) {
        return "ไม่พบรายการรับของของเลข IR {$irCode}";
    }
    $problems = array();
    if (!empty($m["unconfirmed"])) {
        $problems[] = "รายการที่ยอด VAT ยังไม่ถูกต้อง: " . implode(", ", $m["unconfirmed"]);
    }
    $diffs = array(
        "จำนวนเงินรวม VAT" => array($totalVat, $m["f_total_vat"]),
        "ภาษีมูลค่าเพิ่ม" => array($vatAmt, $m["f_vat_amt"]),
        "ภาษีหัก ณ ที่จ่าย" => array($whtAmt, $m["f_wht_amt"]),
    );
    foreach ($diffs as $label => $pair) {
        if (abs(round(floatval($pair[0]), 2) - $pair[1]) >= 0.005) {
            $problems[] = $label . " " . number_format($pair[0], 2) . " ไม่ตรงกับผลรวมรายการย่อย " . number_format($pair[1], 2);
        }
    }
    if (empty($problems)) {
        return "";
    }
    return "ยอดเงินของเลข IR {$irCode} ไม่ถูกต้อง ยังออกเลข AP ไม่ได้<br>- " . implode("<br>- ", $problems)
        . "<br><br>กรุณากลับไปแก้ยอด VAT ที่หน้า \"ส่งมอบงาน (เวชภัณฑ์)\" (ST00095)"
        . "<br>ดับเบิลคลิกเลข IR {$irCode} &gt; เลือกรายการ &gt; กดปุ่ม \"แก้ไข VAT\" &gt; บันทึกร่าง";
}

// ล้างสถานะ "ยืนยันยอด" ของเลข IR ที่แถวรับของนี้สังกัดอยู่ (แก้จำนวนเงิน/ร่าง VAT/ลบรายการ
// หลังยืนยันแล้ว ต้องกลับไปยืนยันใหม่ที่ ST00095 - IR จะหายจากหน้าตรวจรับจนกว่าจะยืนยันใหม่
// ยกเว้นออกเลข AP ไปแล้ว ดู filter ใน List_MedSupPeriodBill.php) แถวที่ยังไม่ออกเลข IR ไม่มีผล
function medsupResetIrConfirmByRow($db, $receiveId)
{
    return $db->QueryParam(
        "UPDATE NMU_ERP.dbo.sp_tor_period_bill_receive SET b_ir_confirm = 0
         WHERE c_ir_code IS NOT NULL
            AND c_ir_code = (SELECT c_ir_code FROM NMU_ERP.dbo.sp_tor_period_bill_receive WHERE sp_tor_period_bill_receive_id = ?)",
        array($receiveId)
    );
}

// [ผู้ใช้ยืนยัน] เลข IR ที่ออกเลขตรวจรับ (AP) แล้ว ล็อก - แก้ VAT/จำนวนเงิน/ลบรายการ/ยืนยันยอด
// ที่หน้าส่งมอบงาน (ST00095) ไม่ได้อีก จนกว่าผู้ดูแลระบบจะปลดล็อก (b_ap_unlock = 1 - ดู mode
// UNLOCK_AP) คืนเลข AP ของ IR ที่แถวรับของนี้สังกัดถ้ายังล็อกอยู่ ("" = ไม่ล็อก)
function medsupApCodeByRow($db, $receiveId)
{
    $ap = $db->GetDataBySQL(
        "select top 1 r2.c_ap_code from NMU_ERP.dbo.sp_tor_period_bill_receive r
         inner join NMU_ERP.dbo.sp_tor_period_bill_receive r2 on r2.c_ir_code = r.c_ir_code and r2.i_enabled = 1
         where r.sp_tor_period_bill_receive_id = ? and r.c_ir_code is not null and r2.c_ap_code is not null
            and isnull(r2.b_ap_unlock, 0) = 0",
        array($receiveId)
    );
    return empty($ap) ? "" : $ap;
}

// ผู้ดูแลระบบ (ปลดล็อกเลขตรวจรับได้) - เงื่อนไขเดียวกับ medsupOwnFilter ใน List_MedSupPeriodBill.php
function medsupIsAdmin()
{
    return intval($_SESSION["user_id"] ?? 0) === 1 || intval($_SESSION["i_type_user"] ?? 0) === 2;
}
