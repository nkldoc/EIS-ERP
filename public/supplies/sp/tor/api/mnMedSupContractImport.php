<?php
include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");
include(__DIR__ . "/medsupContractCode.php");

// เมนู "นำเข้าสัญญา (เวชภัณฑ์)" (ST00097 - medSupContractImport.js) นำเข้าสัญญา/งวดจากไฟล์
// Excel ทีละหลายสัญญา - ไฟล์ถูกอ่านที่ฝั่งเบราว์เซอร์ (SheetJS) แล้วส่งแถวมาเป็น JSON:
//   PREVIEW = ตรวจสอบ + แปลงรหัส/ชื่อเป็น id จริง แล้วคืนรายละเอียดทุกแถวให้ดูก่อนบันทึก
//   SAVE    = ตรวจสอบซ้ำ (ไม่เชื่อผล PREVIEW ฝั่ง client) แล้วบันทึกลง sp_tor_period_bill
//             ตารางเดียวกับ ST00092 ทุกอย่าง + บันทึกประวัติการนำเข้า sp_tor_period_bill_import
//   LIST / LIST_ROWS = ประวัติการนำเข้าแต่ละครั้ง / สัญญาที่นำเข้าในครั้งนั้น
// ไฟล์: 1 แถว = 1 งวด แถวที่ "ลำดับสัญญา" เดียวกันคือสัญญาเดียวกัน (หลายงวด) ข้อมูลหัวสัญญา
// ของแถวถัดๆ ไปเว้นว่างได้ (ใช้ของแถวแรก) ถ้ากรอกต้องตรงกับแถวแรก
// งบกันเหลื่อม: กรอกเลขใบกันเหลื่อมที่คอลัมน์ c_overlap (ของแหล่งเงินที่ 1) ว่าง = ปีต่อปี - การจองเงินทำต่อที่ ST00092
// pr_id / po_id / chk_id = เลขอ้างอิงจากไฟล์ที่ export มา เก็บไว้อ้างอิงเท่านั้น (c_ref_*)

define("MEDSUP_DC_COST_ID", 82);

$db = new DatabaseServer();
$date = new i_date();
$mode = $_REQUEST["mode"] ?? "";

function imp_json($arr)
{
    header("Content-Type: application/json; charset=utf-8");
    echo json_encode($arr);
    exit();
}

function imp_str($v)
{
    return trim(str_replace("\xC2\xA0", " ", (string) ($v ?? "")));
}

// ความยาว/ตัดข้อความแบบนับตัวอักษร UTF-8 (ไม่พึ่ง extension mbstring)
function imp_len($s)
{
    return preg_match_all('/./us', (string) $s);
}

function imp_cut($s, $max)
{
    return preg_match('/^.{0,' . intval($max) . '}/us', (string) $s, $m) ? $m[0] : "";
}

// สถานะจองเงินในระบบงบของรายการที่ ERP เวชภัณฑ์จองไว้แล้ว - ค้นจาก pr_id / po_id / chk_id ในไฟล์นำเข้า
// (เลขของฝั่ง ERP เวชภัณฑ์ รายการจองของระบบนั้นอยู่ใต้ i_sys = 2 ใน bg_reserve_money - ดูจากข้อมูลจริง:
// หน่วยงาน 82/50 อยู่ใต้ i_sys นี้ทั้งหมด และตรงกับรายการที่ ERP ยิงเข้า /procure/ir)
// อ่านอย่างเดียว ใช้แสดงให้เห็นตอนตรวจสอบ/ดูรายการที่นำเข้า - ไม่ได้เปลี่ยนสถานะ/ปุ่มจองเงินของ ST00092
// i_reserve: 1 = ขั้น PR, 2 = ขั้นสัญญา (มี po_id), 3 = ขั้นตรวจรับ (มี chk_id)
define("MEDSUP_ERP_I_SYS", 2);

function imp_reserve_status($db, $prId, $poId, $chkId)
{
    static $cache = array();
    $prId = imp_str($prId);
    $poId = imp_str($poId);
    $chkId = imp_str($chkId);
    if ($prId === "") {
        return "";
    }
    if (!ctype_digit($prId) || strlen($prId) > 18) {
        return "pr_id ไม่ใช่ตัวเลข ค้นในระบบงบไม่ได้";
    }
    if (!isset($cache[$prId])) {
        $rows = array();
        $stmt = $db->QueryParam(
            "select i_reserve, po_id, chk_id, f_amt from " . DB_NMU_EIS . "bg_reserve_money
              where i_sys = ? and i_enable = 1 and pr_id = ?",
            array(MEDSUP_ERP_I_SYS, $prId)
        );
        while ($stmt && ($r = $db->Fetch($stmt))) {
            $rows[] = array("st" => intval($r["i_reserve"]), "po" => strval(intval($r["po_id"])), "chk" => strval(intval($r["chk_id"])), "amt" => floatval($r["f_amt"]));
        }
        $cache[$prId] = $rows;
    }
    $rows = $cache[$prId];
    if (empty($rows)) {
        // ไม่มีในการจองปกติ (bg_reserve_money) - เช็คต่อที่ใบกันเหลื่อม (bg_reserve_overlap) ของ ERP เวชภัณฑ์
        // ซึ่งเก็บ pr_id/po_id/chk_id เดียวกัน i_reserve: 1 = PR, 2 = สัญญา, 3 = ตรวจรับ
        static $ovCache = array();
        if (!isset($ovCache[$prId])) {
            $ov = array();
            $stmtOv = $db->QueryParam(
                "select c_code_overlap, i_reserve, po_id, chk_id, f_amt from " . DB_NMU_EIS . "bg_reserve_overlap
                  where i_sys = ? and i_enable = 1 and pr_id = ?",
                array(MEDSUP_ERP_I_SYS, $prId)
            );
            while ($stmtOv && ($r = $db->Fetch($stmtOv))) {
                $ov[] = array("code" => imp_str($r["c_code_overlap"]), "st" => intval($r["i_reserve"]), "po" => strval(intval($r["po_id"])), "amt" => floatval($r["f_amt"]));
            }
            $ovCache[$prId] = $ov;
        }
        if (!empty($ovCache[$prId])) {
            $ovPo = ctype_digit($poId) ? strval(intval($poId)) : null;
            $ovCodes = array();
            $ovAmt = 0;
            $ovStage = 0;
            foreach ($ovCache[$prId] as $r) {
                if ($ovPo === null || $r["po"] === $ovPo) {
                    $ovCodes[$r["code"]] = true;
                    $ovAmt += $r["amt"];
                    $ovStage = max($ovStage, $r["st"]);
                }
            }
            if (!empty($ovCodes)) {
                $stageTxt = array(1 => "ขั้น PR", 2 => "ขั้นสัญญา", 3 => "ขั้นตรวจรับ");
                return "กันเหลื่อมแล้ว " . ($stageTxt[$ovStage] ?? "") . " " . number_format($ovAmt, 2) . " (ใบกันเหลื่อม " . implode(", ", array_keys($ovCodes)) . ")";
            }
        }
        return "ไม่พบการจองในระบบงบ";
    }
    $poKey = ctype_digit($poId) ? strval(intval($poId)) : null;
    $chkKey = ctype_digit($chkId) ? strval(intval($chkId)) : null;
    $pr = 0;
    $con = 0;
    $conN = 0;
    $conOther = 0;
    $chk = 0;
    $chkN = 0;
    foreach ($rows as $r) {
        if ($r["st"] === 1) {
            $pr += $r["amt"];
        } elseif ($r["st"] === 2) {
            if ($poKey === null || $r["po"] === $poKey) {
                $con += $r["amt"];
                $conN++;
            } else {
                $conOther++;
            }
        } elseif ($r["st"] === 3 && $chkKey !== null && $r["chk"] === $chkKey && ($poKey === null || $r["po"] === $poKey)) {
            $chk += $r["amt"];
            $chkN++;
        }
    }
    if ($conN > 0) {
        $txt = "จองขั้นสัญญาแล้ว " . number_format($con, 2);
    } elseif ($pr > 0) {
        $txt = "จองขั้น PR แล้ว " . number_format($pr, 2) . " (ยังไม่จองขั้นสัญญา" . ($conOther > 0 ? " - po_id ไม่ตรงกับที่จองไว้" : "") . ")";
    } else {
        $txt = "พบรายการในระบบงบ แต่ไม่ใช่ขั้น PR/สัญญาของ po_id นี้";
    }
    if ($chkN > 0) {
        $txt .= " / ตรวจรับแล้ว " . number_format($chk, 2);
    }
    return $txt;
}

function imp_num($v)
{
    $s = str_replace(array(",", " "), "", imp_str($v));
    return ($s === "" || !is_numeric($s)) ? null : round(floatval($s), 2);
}

// วันที่รูปแบบ วว-ดด-ปปปป หรือ วว/ดด/ปปปป (ปี พ.ศ. หรือ ค.ศ. ก็ได้) -> "Y-m-d" (ค.ศ.)
// คืน false ถ้ารูปแบบผิด, null ถ้าว่าง
function imp_date($v)
{
    $s = imp_str($v);
    if ($s === "") {
        return null;
    }
    if (!preg_match('/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/', $s, $m)) {
        return false;
    }
    $d = intval($m[1]);
    $mo = intval($m[2]);
    $y = intval($m[3]);
    if ($y > 2400) {
        $y -= 543;
    }
    if (!checkdate($mo, $d, $y)) {
        return false;
    }
    return sprintf("%04d-%02d-%02d", $y, $mo, $d);
}

// ช่อง "มี/ไม่มี" (ติ๊ก VAT/หัก ณ ที่จ่าย/ค่าประกันผลงาน): ว่าง = ค่าเริ่มต้น, Y/N/ใช่/ไม่/มี/
// ไม่มี/1/0 - คืน null ถ้าอ่านไม่ออก
function imp_flag($v, $default)
{
    $s = strtoupper(imp_str($v));
    if ($s === "") {
        return $default;
    }
    if (in_array($s, array("Y", "YES", "1", "TRUE", "ใช่", "มี", "✓", "/"), true)) {
        return 1;
    }
    if (in_array($s, array("N", "NO", "0", "FALSE", "ไม่", "ไม่มี", "ไม่ใช่", "-"), true)) {
        return 0;
    }
    return null;
}

// VAT/ภาษีหัก ณ ที่จ่าย/ค่าปรับ/ค่าประกันผลงาน/อื่นๆ ของรายการรับของ 1 แถว (ร่าง VAT หน้า
// ส่งมอบงาน - "แก้ไข VAT") สูตรเดียวกับ popup: "ถอด VAT" จำนวนเงินรับของ = จำนวนเงินรวม VAT
// ก่อน VAT = รวม/(1+%VAT), หัก ณ ที่จ่าย/ค่าประกันผลงาน = % ของยอดก่อน VAT, จ่าย = รวม VAT -
// หัก ณ ที่จ่าย - ค่าปรับ - ค่าประกันผลงาน - อื่นๆ (เช่น 207 -> 193.46 / 13.54 / 1.93 / 205.07)
// ช่องว่าง = ค่าเริ่มต้น (VAT 7% / หัก 1% / ไม่มีค่าประกัน) ยอด VAT/หัก ณ ที่จ่ายเป็นบาทว่าง =
// คำนวณจาก % กรอก = ใช้ยอดนั้นตรงๆ (แก้เองทับเหมือนในหน้าจอ)
function imp_vat($in, $total, &$errs)
{
    $nums = array();
    foreach (array("vat_amt", "vat_pct", "wht_amt", "wht_pct", "penalty", "guar_pct", "other") as $k) {
        $raw = imp_str($in[$k] ?? "");
        // "-" / "–" = ว่าง (ไฟล์ที่ export มาใช้ "-" แทนช่องที่ไม่มีค่า)
        if (in_array($raw, array("-", "–", "—"), true)) {
            $raw = "";
        }
        $nums[$k] = imp_num($raw);
        if ($raw !== "" && ($nums[$k] === null || $nums[$k] < 0)) {
            $errs[] = "ช่อง VAT \"{$k}\" ต้องเป็นตัวเลขไม่ติดลบ";
            $nums[$k] = null;
        }
    }
    // [ผู้ใช้ขอ] ตัดคอลัมน์ "(มี/ไม่มี)" ออกจากไฟล์ - ดูจากช่อง (บาท)/(%) แทน:
    //   VAT / หัก ณ ที่จ่าย : มีเป็นค่าเริ่มต้น - กรอก 0 ที่ช่อง (บาท) หรือ (%) = ไม่มี
    //   ค่าประกันผลงาน      : มีเมื่อกรอก (%) มากกว่า 0
    // ไฟล์รุ่นเก่าที่ยังมีคอลัมน์ (มี/ไม่มี) ถ้ากรอกมาก็ยังใช้ค่านั้น (N = ไม่มี)
    $zero = function ($k) use ($nums) {
        return $nums[$k] !== null && abs($nums[$k]) < 0.000001;
    };
    $bVat = ($zero("vat_amt") || $zero("vat_pct")) ? 0 : 1;
    $bWht = ($zero("wht_amt") || $zero("wht_pct")) ? 0 : 1;
    $bGuar = ($nums["guar_pct"] !== null && $nums["guar_pct"] > 0) ? 1 : 0;
    foreach (array("vat_flag" => "bVat", "wht_flag" => "bWht", "guar_flag" => "bGuar") as $col => $var) {
        if (imp_str($in[$col] ?? "") === "") {
            continue;
        }
        $f = imp_flag($in[$col], null);
        if ($f === null) {
            $errs[] = "ช่อง มี/ไม่มี ต้องเป็น Y หรือ N";
        } elseif ($f === 0) {
            $$var = 0;
        }
    }
    $vatPct = $nums["vat_pct"] ?? 7;
    $whtPct = $nums["wht_pct"] ?? 1;
    $guarPct = $nums["guar_pct"] ?? 0;
    $penalty = $nums["penalty"] ?? 0;
    $other = $nums["other"] ?? 0;
    $total = round(floatval($total), 2);

    if (!$bVat) {
        $vat = 0;
    } elseif ($nums["vat_amt"] !== null) {
        $vat = round($nums["vat_amt"], 2);
    } else {
        $vat = $vatPct > 0 ? round($total - $total / (1 + $vatPct / 100), 2) : 0;
    }
    if ($vat >= $total && $total > 0) {
        $errs[] = "ภาษีมูลค่าเพิ่มต้องน้อยกว่าจำนวนเงินรวม VAT";
    }
    $before = round($total - $vat, 2);
    if (!$bWht) {
        $wht = 0;
    } elseif ($nums["wht_amt"] !== null) {
        $wht = round($nums["wht_amt"], 2);
    } else {
        $wht = round($before * $whtPct / 100, 2);
    }
    $guar = $bGuar ? round($before * $guarPct / 100, 2) : 0;
    $pay = round($total - $wht - $penalty - $guar - $other, 2);
    if ($pay < 0) {
        $errs[] = "จำนวนเงินที่จ่ายติดลบ (หัก ณ ที่จ่าย + ค่าปรับ + ค่าประกัน + อื่นๆ เกินยอด)";
    }
    return array(
        "b_vat" => $bVat, "vat_pct" => $vatPct, "vat" => $vat, "before" => $before,
        "b_wht" => $bWht, "wht_pct" => $whtPct, "wht" => $wht,
        "penalty" => $penalty, "b_guar" => $bGuar, "guar_pct" => $guarPct, "guar" => $guar,
        "other" => $other, "pay" => $pay,
    );
}

// ตรวจสอบและแปลงข้อมูลทุกแถว - คืน rows (ผลต่อแถวสำหรับแสดง) + contracts (ข้อมูลพร้อม
// บันทึก จัดกลุ่มตามลำดับสัญญา) + จำนวนแถวที่ผิด
function imp_validate($db, $inputRows)
{
    // ข้อมูลอ้างอิง: แหล่งเงิน (ชื่อ -> id) / ค่าใช้จ่าย (รหัส -> id,ชื่อ)
    $fundMap = array();
    $stmt = $db->QueryParam(
        "SELECT dc_expense_budget_type_id, c_name FROM " . DB_CENTER . "dc_expense_budget_type
         WHERE i_enable = 1 AND i_delete = 2 AND dc_expense_budget_type_id != 34",
        array()
    );
    while ($r = $db->Fetch($stmt)) {
        $fundMap[imp_str($r["c_name"])] = intval($r["dc_expense_budget_type_id"]);
    }
    $expenseMap = array();
    $stmt = $db->QueryParam("SELECT bg_expense_id, c_code, c_name FROM " . DB_NMU_EIS . "bg_expense WHERE i_enable = 1 AND i_level = 4", array());
    while ($r = $db->Fetch($stmt)) {
        $expenseMap[imp_str($r["c_code"])] = array("id" => intval($r["bg_expense_id"]), "name" => imp_str($r["c_code"]) . " : " . imp_str($r["c_name"]));
    }

    $deptOk = array("APPS", "APMD", "APMS");
    $typeOk = array("จัดซื้อจะขาย", "ใบสั่งซื้อ", "สัญญา");
    // c_overlap = เลขใบกันเหลื่อมของแหล่งเงินที่ 1 (ระดับสัญญา - คอลัมน์ c_overlap เดียวกับที่ ST00092 บันทึก
    // ตอนเลือกใบกันเหลื่อม การจองเงินส่งเลขนี้ให้ API งบ) ว่าง = งบปีต่อปี
    $headerKeys = array("dept", "expense_code", "project", "contract_code", "contract_type",
        "fund1", "amt1", "fund2", "amt2", "fund3", "amt3", "year", "start", "end", "tax", "vendor", "c_overlap");
    // pr_id / po_id / chk_id = เลขอ้างอิงจากไฟล์ที่ export มา (เก็บไว้อ้างอิงเท่านั้น ไม่ใช้กับการจองเงิน)
    // pr_id, po_id เก็บต่องวด (ค่าแรกที่กรอกในแถวของงวดนั้น) chk_id เก็บต่องวด + ต่อรายการรับของของแถวนั้น
    $refKeys = array("pr_id", "po_id", "chk_id");

    $groups = array();     // seq => ข้อมูลหัวสัญญาจากแถวแรก + งวด
    $rowsOut = array();
    $creditorCache = array();
    $fileCodes = array();

    foreach ($inputRows as $i => $in) {
        $rowNo = intval($in["_row"] ?? ($i + 2));
        $errs = array();
        $warns = array();
        // "-" ในช่องรับของ/อ้างอิง = ว่าง (เช่น สัญญาข้ามปียังไม่มีวันรับของ)
        foreach (array("rc_code", "rc_erp", "rc_date", "rc_detail", "rc_amt", "pr_id", "po_id", "chk_id", "c_overlap") as $dk) {
            if (in_array(imp_str($in[$dk] ?? ""), array("-", "–", "—"), true)) {
                $in[$dk] = "";
            }
        }
        $seq = imp_str($in["seq"] ?? "");
        if ($seq === "") {
            $errs[] = "ไม่มีลำดับสัญญา";
            $seq = "(ว่าง-{$rowNo})";
        }

        // หัวสัญญา: แถวแรกของลำดับนั้นเป็นหลัก แถวถัดไปว่าง = ใช้ของแถวแรก, กรอก = ต้องตรงกัน
        if (!isset($groups[$seq])) {
            $h = array();
            foreach ($headerKeys as $k) {
                $h[$k] = imp_str($in[$k] ?? "");
            }
            $groups[$seq] = array("h" => $h, "firstRow" => $rowNo, "periods" => array(), "rowIdx" => array());
        } else {
            foreach ($headerKeys as $k) {
                $v = imp_str($in[$k] ?? "");
                if ($v !== "" && $v !== $groups[$seq]["h"][$k]) {
                    $errs[] = "ข้อมูลหัวสัญญาไม่ตรงกับแถวแรกของลำดับสัญญา {$seq} (แถว {$groups[$seq]["firstRow"]})";
                    break;
                }
            }
        }
        $h = $groups[$seq]["h"];

        // งวด: แถวที่ลำดับสัญญา + งวดที่ เดียวกันคืองวดเดียวกัน (1 งวดมีรายการรับของได้หลายแถว)
        // แถวแรกของงวดเป็นหลัก แถวถัดไปเว้นข้อมูลงวดว่างได้ ถ้ากรอกต้องตรงกับแถวแรก
        $period = imp_str($in["period"] ?? "");
        if ($period === "") {
            // งวดว่าง: เลขที่สัญญาลงท้าย -N/ปี (เช่น 3C176-13/2567) = งวดที่ N, นอกนั้น (เช่น 079/69) = งวดเดียว = งวด 1
            $period = preg_match('/-(\d+)\/\d+$/', $h["contract_code"], $pm) ? strval(intval($pm[1])) : "1";
            $in["period"] = $period;
        }
        if (!ctype_digit($period)) {
            $errs[] = "งวดที่ต้องเป็นตัวเลข";
        }
        $pKey = $period !== "" ? $period : "(ว่าง-{$rowNo})";
        $periodKeys = array("doc_ref", "due", "detail", "period_fund", "period_amt");
        if (!isset($groups[$seq]["pmap"][$pKey])) {
            $periodFund = imp_str($in["period_fund"] ?? "");
            $periodAmt = imp_num($in["period_amt"] ?? "");
            $due = imp_date($in["due"] ?? "");
            if ($periodFund === "") {
                $errs[] = "ไม่มีแหล่งเงินของงวดนี้";
            }
            if ($periodAmt === null || $periodAmt <= 0) {
                $errs[] = "จำนวนเงินของงวดต้องมากกว่า 0";
            }
            if ($due === false) {
                $errs[] = "วันที่ครบกำหนดส่งของ รูปแบบผิด (วว-ดด-ปปปป)";
            }
            $pRaw = array();
            foreach ($periodKeys as $k) {
                $pRaw[$k] = imp_str($in[$k] ?? "");
            }
            $groups[$seq]["pmap"][$pKey] = count($groups[$seq]["periods"]);
            $groups[$seq]["periods"][] = array(
                "rowNo" => $rowNo, "i_period" => $period, "c_doc_ref" => $pRaw["doc_ref"],
                "d_doc_dateSub" => $due ?: null, "c_detail" => $pRaw["detail"],
                "c_fund_source_dtl" => $periodFund, "f_fund_amt_dtl" => $periodAmt,
                "raw" => $pRaw, "receives" => array(), "rowIdx" => array(),
                "ref" => array("pr_id" => "", "po_id" => "", "chk_id" => ""),
            );
        } else {
            $pFirst = $groups[$seq]["periods"][$groups[$seq]["pmap"][$pKey]];
            foreach ($periodKeys as $k) {
                // เลขงวด (doc_ref) ต่างกันในงวดเดียวกันได้ (ใช้ลำดับรับของ 01/02 ต่อใบแจ้งหนี้) - ใช้ของแถวแรก
                if ($k === "doc_ref") {
                    continue;
                }
                $v = imp_str($in[$k] ?? "");
                if ($v !== "" && $v !== $pFirst["raw"][$k]) {
                    $errs[] = "ข้อมูลงวดที่ {$period} ไม่ตรงกับแถวแรกของงวดนี้ (แถว {$pFirst["rowNo"]})";
                    break;
                }
            }
        }
        $pIdx = $groups[$seq]["pmap"][$pKey];
        foreach ($refKeys as $rk) {
            $rv = imp_str($in[$rk] ?? "");
            if (imp_len($rv) > 50) {
                $errs[] = "{$rk} ยาวเกิน 50 ตัวอักษร";
                $rv = "";
            }
            if ($rv !== "" && $groups[$seq]["periods"][$pIdx]["ref"][$rk] === "") {
                $groups[$seq]["periods"][$pIdx]["ref"][$rk] = $rv;
            }
        }
        if (imp_len(imp_str($in["c_overlap"] ?? "")) > 100) {
            $errs[] = "c_overlap (เลขใบกันเหลื่อม) ยาวเกิน 100 ตัวอักษร";
        }
        $p = $groups[$seq]["periods"][$pIdx];

        // รายการรับของ (dtl ของหน้าส่งมอบงาน) - ไม่บังคับ กรอกช่องใดช่องหนึ่ง = มีรายการรับของ
        $rc = array(
            "c_receive_code" => imp_str($in["rc_code"] ?? ""),
            "c_erp_stock_code" => imp_str($in["rc_erp"] ?? ""),
            "d_receive_date" => imp_date($in["rc_date"] ?? ""),
            "c_detail" => imp_str($in["rc_detail"] ?? ""),
            "f_amt" => imp_num($in["rc_amt"] ?? ""),
            "c_ref_chk_id" => imp_cut(imp_str($in["chk_id"] ?? ""), 50),
        );
        $hasRc = $rc["c_receive_code"] !== "" || $rc["c_erp_stock_code"] !== "" || imp_str($in["rc_date"] ?? "") !== ""
            || $rc["c_detail"] !== "" || imp_str($in["rc_amt"] ?? "") !== "";
        $hasVatCols = false;
        foreach (array("vat_flag", "vat_amt", "vat_pct", "wht_flag", "wht_amt", "wht_pct", "penalty", "guar_flag", "guar_pct", "other") as $vk) {
            if (imp_str($in[$vk] ?? "") !== "") {
                $hasVatCols = true;
            }
        }
        $money = null;
        if ($hasRc) {
            if ($rc["f_amt"] === null || $rc["f_amt"] <= 0) {
                $errs[] = "จำนวนเงินรับของต้องมากกว่า 0";
            }
            if ($rc["d_receive_date"] === false) {
                $errs[] = "วันรับของ รูปแบบผิด (วว-ดด-ปปปป)";
            }
            $money = imp_vat($in, $rc["f_amt"] ?? 0, $errs);
            $rc["vat"] = $money;
            $rc["rowNo"] = $rowNo;
            $groups[$seq]["periods"][$pIdx]["receives"][] = $rc;
        } elseif ($hasVatCols) {
            $errs[] = "กรอกข้อมูล VAT แต่ไม่มีรายการรับของ (จำนวนเงินรับของ)";
        }

        $groups[$seq]["periods"][$pIdx]["rowIdx"][] = count($rowsOut);
        $groups[$seq]["rowIdx"][] = count($rowsOut);
        $rowsOut[] = array(
            "row_no" => $rowNo, "seq" => $seq, "period" => $period, "doc_ref" => $p["c_doc_ref"],
            "due" => $p["raw"]["due"], "detail" => $p["c_detail"],
            "period_fund" => $p["c_fund_source_dtl"], "period_amt" => $p["f_fund_amt_dtl"],
            "rc_code" => $rc["c_receive_code"], "rc_erp" => $rc["c_erp_stock_code"], "rc_date" => imp_str($in["rc_date"] ?? ""),
            "rc_detail" => $rc["c_detail"], "rc_amt" => $hasRc ? $rc["f_amt"] : null,
            // ยอดที่คำนวณได้ (แสดงให้ตรวจก่อนบันทึก เทียบกับหน้า "แก้ไข VAT")
            "calc_before" => $money ? $money["before"] : null, "calc_vat" => $money ? $money["vat"] : null,
            "calc_wht" => $money ? $money["wht"] : null, "calc_guar" => $money ? $money["guar"] : null,
            "calc_penalty" => $money ? $money["penalty"] : null,
            "calc_pay" => $money ? $money["pay"] : null,
            // สถานะจองเงินในระบบงบ (ของฝั่ง ERP เวชภัณฑ์) จาก pr_id/po_id ของงวด + chk_id ของแถวนี้
            "rsv_status" => imp_reserve_status($db, $groups[$seq]["periods"][$pIdx]["ref"]["pr_id"],
                $groups[$seq]["periods"][$pIdx]["ref"]["po_id"], $in["chk_id"] ?? ""),
            "errs" => $errs, "warns" => $warns,
        );
    }

    // ตรวจระดับสัญญา (ทำครั้งเดียวต่อสัญญา ผลผิดติดทุกแถวของสัญญานั้น)
    $contracts = array();
    foreach ($groups as $seq => $g) {
        $h = $g["h"];
        $cErrs = array();
        $cWarns = array();
        $c = array("seq" => $seq);

        $c["c_ap_dept_type"] = strtoupper($h["dept"]);
        if (!in_array($c["c_ap_dept_type"], $deptOk, true)) {
            $cErrs[] = "ประเภทต้องเป็น APPS / APMD / APMS";
        }
        $exp = $expenseMap[$h["expense_code"]] ?? null;
        if (!$exp) {
            $cErrs[] = "ไม่พบรหัสค่าใช้จ่าย \"{$h["expense_code"]}\"";
        }
        $c["po_expense_id"] = $exp ? $exp["id"] : null;
        $c["c_expense_name"] = $exp ? $exp["name"] : null;
        // ชื่อโครงการว่าง = ชื่อค่าใช้จ่ายตัดรหัสออก (เหมือนฟอร์ม ST00092)
        $c["c_project_name"] = $h["project"] !== "" ? $h["project"]
            : ($exp ? trim(preg_replace('/^[^:]*:\s*/u', "", $exp["name"])) : "");
        // "สัญญาต่อเนื่อง" (สัญญา PO ภายในปี) = ประเภท "สัญญา"
        // "สัญญาจะซื้อจะขาย" / "จะซื้อจะขาย" = ประเภท "จัดซื้อจะขาย" (ชื่อที่ระบบใช้)
        $typeAlias = array("สัญญาต่อเนื่อง" => "สัญญา", "สัญญาจะซื้อจะขาย" => "จัดซื้อจะขาย", "จะซื้อจะขาย" => "จัดซื้อจะขาย");
        $c["c_contract_type"] = $typeAlias[$h["contract_type"]] ?? $h["contract_type"];
        if (!in_array($c["c_contract_type"], $typeOk, true)) {
            $cErrs[] = "ประเภทของสัญญาต้องเป็น จัดซื้อจะขาย / ใบสั่งซื้อ / สัญญา";
        }

        $c["c_overlap"] = $h["c_overlap"];
        $c["c_contract_code"] = $h["contract_code"];
        if ($h["contract_code"] !== "") {
            if (isset($fileCodes[$h["contract_code"]])) {
                $cErrs[] = "เลขที่สัญญา {$h["contract_code"]} ซ้ำกับลำดับสัญญา {$fileCodes[$h["contract_code"]]} ในไฟล์";
            } else {
                $fileCodes[$h["contract_code"]] = $seq;
            }
            $exists = $db->GetDataBySQL(
                "select top 1 c_contract_code from NMU_ERP.dbo.sp_tor_period_bill where c_contract_code = ? and i_enabled = 1",
                array($h["contract_code"])
            );
            if (!empty($exists)) {
                $cErrs[] = "เลขที่สัญญา {$h["contract_code"]} มีในระบบแล้ว";
            }
        }

        // แหล่งเงินหัวสัญญา (สูงสุด 3) - แหล่งที่ 1 จำเป็น
        $headerFunds = array();
        foreach (array(1 => "", 2 => "2", 3 => "3") as $n => $sfx) {
            $fname = $h["fund{$n}"];
            $famt = imp_num($h["amt{$n}"]);
            $c["dc_expense_budget_type_id{$sfx}"] = null;
            $c["c_fund_source{$sfx}"] = null;
            $c["f_fund_amt{$sfx}"] = null;
            if ($fname === "" && $famt === null) {
                if ($n === 1) {
                    $cErrs[] = "ไม่มีแหล่งเงินที่ 1";
                }
                continue;
            }
            if (!isset($fundMap[$fname])) {
                $cErrs[] = "ไม่พบแหล่งเงิน \"{$fname}\" (แหล่งที่ {$n})";
            } elseif (isset($headerFunds[$fname])) {
                $cErrs[] = "แหล่งเงิน \"{$fname}\" ซ้ำกัน";
            }
            if ($famt === null || $famt <= 0) {
                $cErrs[] = "จำนวนเงินแหล่งที่ {$n} ต้องมากกว่า 0";
            }
            $c["dc_expense_budget_type_id{$sfx}"] = $fundMap[$fname] ?? null;
            $c["c_fund_source{$sfx}"] = $fname;
            $c["f_fund_amt{$sfx}"] = $famt;
            $headerFunds[$fname] = array("amt" => $famt ?? 0, "used" => 0);
        }

        $year = imp_str($h["year"]);
        if (!ctype_digit($year) || intval($year) < 2500) {
            $cErrs[] = "ปีงบประมาณต้องเป็น พ.ศ. 4 หลัก";
            $c["i_budget_year"] = null;
        } else {
            $c["i_budget_year"] = intval($year) - 543; // เก็บเป็น ค.ศ. เหมือน ST00092
        }
        $start = imp_date($h["start"]);
        $end = imp_date($h["end"]);
        if ($start === false || $end === false) {
            $cErrs[] = "วันที่เริ่ม/สิ้นสุดสัญญา รูปแบบผิด (วว-ดด-ปปปป)";
        } elseif ($start && $end && $end < $start) {
            $cErrs[] = "วันที่สิ้นสุดสัญญาก่อนวันที่เริ่มสัญญา";
        }
        $c["d_start_date"] = $start ?: null;
        $c["d_end_date"] = $end ?: null;

        // ผู้ขาย: หาจากเลขผู้เสียภาษีก่อน ไม่มีค่อยหาจากชื่อ (ตรงตัว)
        $credKey = $h["tax"] . "|" . $h["vendor"];
        if (!isset($creditorCache[$credKey])) {
            $cred = null;
            if ($h["tax"] !== "") {
                $cred = $db->Fetch($db->QueryParam(
                    "select top 1 dc_creditor_id, c_name, c_tax_number_imp from NMU.dbo.dc_creditor
                     where isnull(i_enable,1) = 1 and c_tax_number_imp = ?",
                    array($h["tax"])
                ));
            }
            if (!$cred && $h["vendor"] !== "") {
                $cred = $db->Fetch($db->QueryParam(
                    "select top 1 dc_creditor_id, c_name, c_tax_number_imp from NMU.dbo.dc_creditor
                     where isnull(i_enable,1) = 1 and c_name = ?",
                    array($h["vendor"])
                ));
            }
            $creditorCache[$credKey] = $cred ?: null;
        }
        $cred = $creditorCache[$credKey];
        if (!$cred) {
            $cErrs[] = "ไม่พบผู้ขายในทะเบียน (เลขผู้เสียภาษี \"{$h["tax"]}\" / ชื่อ \"{$h["vendor"]}\")";
        } elseif ($h["vendor"] !== "" && imp_str($cred["c_name"]) !== $h["vendor"]) {
            $cWarns[] = "ชื่อผู้ขายในทะเบียนคือ \"" . imp_str($cred["c_name"]) . "\"";
        }
        $c["dc_creditor_id"] = $cred ? intval($cred["dc_creditor_id"]) : null;
        $c["c_creditor_name"] = $cred ? imp_str($cred["c_name"]) : $h["vendor"];
        $c["c_tax_number_imp"] = $cred ? imp_str($cred["c_tax_number_imp"]) : $h["tax"];

        // งวด: แหล่งเงินของงวดต้องเป็นแหล่งเงินของหัวสัญญา, ยอดรวมงวดต่อแหล่งห้ามเกินวงเงิน
        // แหล่งนั้น (ขาด = เตือน), ยอดรายการรับของรวมต่องวดห้ามเกินจำนวนเงินงวด (กติกาเดียวกับ
        // หน้าส่งมอบงาน ST00095) - ผลผิดติดทุกแถวของงวดนั้น
        $rowPeriodErrs = array();   // index ใน $rowsOut => ข้อผิดพลาดระดับงวด
        foreach ($g["periods"] as $pi => $p) {
            $pe = array();
            if ($p["c_fund_source_dtl"] !== "" && !isset($headerFunds[$p["c_fund_source_dtl"]])) {
                $pe[] = "แหล่งเงินของงวด \"{$p["c_fund_source_dtl"]}\" ไม่อยู่ในแหล่งเงินของสัญญา";
            } elseif ($p["c_fund_source_dtl"] !== "") {
                $headerFunds[$p["c_fund_source_dtl"]]["used"] += $p["f_fund_amt_dtl"] ?? 0;
            }
            $rcSum = 0;
            foreach ($p["receives"] as $rc) {
                $rcSum += $rc["f_amt"] ?? 0;
            }
            if (!empty($p["receives"]) && round($rcSum, 2) - round($p["f_fund_amt_dtl"] ?? 0, 2) > 0.01) {
                $pe[] = "ยอดรับของงวดที่ {$p["i_period"]} รวม " . number_format($rcSum, 2) . " เกินจำนวนเงินงวด " . number_format($p["f_fund_amt_dtl"] ?? 0, 2);
            }
            foreach ($p["rowIdx"] as $ri) {
                $rowPeriodErrs[$ri] = $pe;
            }
            $g["periods"][$pi]["dc_expense_budget_type_id_dtl"] = $fundMap[$p["c_fund_source_dtl"]] ?? null;
        }
        foreach ($headerFunds as $fname => $f) {
            if (round($f["used"], 2) - round($f["amt"], 2) > 0.004) {
                $cErrs[] = "ยอดงวดของแหล่งเงิน \"{$fname}\" รวม " . number_format($f["used"], 2) . " เกินวงเงิน " . number_format($f["amt"], 2);
            }
            // ยอดงวดน้อยกว่าวงเงินทำสัญญา = ปกติ (สัญญาใช้เงินไม่ครบวงเงินได้) ไม่แจ้งเตือน
        }

        // เลขใบกันเหลื่อม (c_overlap ของแหล่งเงินที่ 1): ต้องเป็นใบกันของหน่วยงานเวชภัณฑ์ที่มีจริงในระบบงบ
        // (view เดียวกับ dropdown ใบกันเหลื่อมของ ST00092) และแหล่งเงินที่ 1 ต้องตรงกับแหล่งเงินของใบกัน
        // (ST00092 ล็อกแหล่งเงินตามใบกันเหมือนกัน) - ปีของใบกันเก็บลง i_budget_year_overlap ให้อัตโนมัติ
        // (ST00092 ใช้ปีนี้โหลดรายการใบกันตอนเปิดสัญญา)
        $c["i_budget_year_overlap"] = null;
        if ($c["c_overlap"] !== "") {
            $ov = $db->GetDataBySQL(
                "select top 1 i_year, dc_expense_budget_type_id from " . DB_NMU_EIS . "vw_bg_budget_overlap
                  where c_code_ref = ? and dc_cost_id = ? order by i_year desc",
                array($c["c_overlap"], MEDSUP_DC_COST_ID)
            );
            if (!$ov) {
                $cErrs[] = "ไม่พบใบกันเหลื่อมเลขที่ {$c["c_overlap"]} ของหน่วยงานเวชภัณฑ์ในระบบงบประมาณ";
            } else {
                $c["i_budget_year_overlap"] = intval($ov["i_year"]);
                if (!empty($c["dc_expense_budget_type_id"]) && intval($ov["dc_expense_budget_type_id"]) !== intval($c["dc_expense_budget_type_id"])) {
                    $cErrs[] = "แหล่งเงินที่ 1 ไม่ตรงกับแหล่งเงินของใบกันเหลื่อม {$c["c_overlap"]}";
                }
            }
        }

        $c["periods"] = $g["periods"];
        $contracts[] = $c;

        foreach ($g["rowIdx"] as $ri) {
            $rowsOut[$ri]["errs"] = array_merge($rowsOut[$ri]["errs"], $cErrs, $rowPeriodErrs[$ri] ?? array());
            $rowsOut[$ri]["warns"] = array_merge($rowsOut[$ri]["warns"], $cWarns);
            $rowsOut[$ri]["dept"] = $c["c_ap_dept_type"];
            $rowsOut[$ri]["contract_code"] = $c["c_contract_code"] !== "" ? $c["c_contract_code"] : "(ออกเลขอัตโนมัติ)";
            $rowsOut[$ri]["expense"] = $c["c_expense_name"] ?? $h["expense_code"];
            $rowsOut[$ri]["project"] = $c["c_project_name"];
            $rowsOut[$ri]["contract_type"] = $c["c_contract_type"];
            $rowsOut[$ri]["funds"] = implode(", ", array_map(function ($k) use ($headerFunds) {
                return $k . " " . number_format($headerFunds[$k]["amt"], 2);
            }, array_keys($headerFunds)));
            $rowsOut[$ri]["year"] = $h["year"];
            $rowsOut[$ri]["start"] = $h["start"];
            $rowsOut[$ri]["end"] = $h["end"];
            $rowsOut[$ri]["vendor"] = $c["c_creditor_name"];
            $rowsOut[$ri]["tax"] = $c["c_tax_number_imp"];
        }
    }

    $errorRows = 0;
    foreach ($rowsOut as $k => $r) {
        $rowsOut[$k]["status"] = !empty($r["errs"]) ? "ERROR" : (!empty($r["warns"]) ? "WARN" : "OK");
        $rowsOut[$k]["message"] = implode("; ", array_merge($r["errs"], $r["warns"]));
        unset($rowsOut[$k]["errs"], $rowsOut[$k]["warns"]);
        if ($rowsOut[$k]["status"] === "ERROR") {
            $errorRows++;
        }
    }
    // ยอดรวม/จำนวน นับต่องวด (ไม่ใช่ต่อแถว - 1 งวดมีหลายแถวรับของได้)
    $total = 0;
    $periodCount = 0;
    $receiveCount = 0;
    foreach ($contracts as $c) {
        foreach ($c["periods"] as $p) {
            $total += $p["f_fund_amt_dtl"] ?? 0;
            $periodCount++;
            $receiveCount += count($p["receives"]);
        }
    }
    return array("rows" => $rowsOut, "contracts" => $contracts, "error_rows" => $errorRows, "total" => round($total, 2),
        "period_count" => $periodCount, "receive_count" => $receiveCount);
}

function imp_input_rows()
{
    $rows = json_decode($_REQUEST["rows"] ?? "[]", true);
    return is_array($rows) ? $rows : array();
}

switch ($mode) {
    case "PREVIEW":
        $rows = imp_input_rows();
        if (empty($rows)) {
            imp_json(array("success" => false, "msg" => "ไม่พบข้อมูลในไฟล์"));
        }
        $v = imp_validate($db, $rows);
        imp_json(array(
            "success" => true, "data" => $v["rows"],
            "contract_count" => count($v["contracts"]), "row_count" => $v["period_count"],
            "receive_count" => $v["receive_count"], "error_rows" => $v["error_rows"], "total" => $v["total"],
        ));
        break;

    case "SAVE":
        $importName = imp_str($_REQUEST["c_import_name"] ?? "");
        $rows = imp_input_rows();
        if ($importName === "") {
            imp_json(array("success" => false, "msg" => "กรุณากรอกชื่อรายการ"));
        }
        if (empty($rows)) {
            imp_json(array("success" => false, "msg" => "ไม่พบข้อมูลในไฟล์"));
        }
        $v = imp_validate($db, $rows);
        if ($v["error_rows"] > 0) {
            imp_json(array("success" => false, "msg" => "ยังมีข้อมูลผิดพลาด {$v["error_rows"]} แถว กรุณาแก้ไฟล์แล้วตรวจสอบใหม่"));
        }

        $db->BeginTran();
        $ok = true;
        $stmt = $db->QueryParam(
            "SET NOCOUNT ON;
             INSERT INTO NMU_ERP.dbo.sp_tor_period_bill_import
                (c_import_name, c_file_name, i_contract_count, i_row_count, f_total_amt, i_enabled, dc_user_create_id, dc_user_create_cost_id, d_create)
             VALUES (?, ?, ?, ?, ?, 1, ?, ?, GETDATE());
             SELECT CAST(SCOPE_IDENTITY() AS INT) AS new_id;",
            array($importName, imp_str($_REQUEST["c_file_name"] ?? ""), count($v["contracts"]), $v["period_count"], $v["total"],
                $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null)
        );
        $newRow = $stmt ? $db->Fetch($stmt) : null;
        $importId = $newRow ? intval($newRow["new_id"]) : 0;
        if (!$importId) {
            $ok = false;
        }

        // คอลัมน์เก็บเลขอ้างอิง pr_id/po_id/chk_id เพิ่มโดย scriptBaseUpdate/sp_tor_period_bill_import_ref.sql
        // (ยังไม่ได้รันสคริปต์ = นำเข้าได้ตามปกติ แค่ไม่เก็บเลขอ้างอิง 3 ตัวนี้)
        $hasRefBill = intval($db->GetDataBySQL(
            "select case when COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill', 'c_ref_pr_id') is null then 0 else 1 end", array())) === 1;
        $hasRefReceive = intval($db->GetDataBySQL(
            "select case when COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill_receive', 'c_ref_chk_id') is null then 0 else 1 end", array())) === 1;

        $codes = array();
        $now = date("Y-m-d H:i:s");
        foreach ($v["contracts"] as $c) {
            if (!$ok) {
                break;
            }
            // hdr_id ใหม่ต่อสัญญา + เลขที่สัญญาอัตโนมัติ (ถ้าไม่ได้กรอก) - เหมือน mode ADD ของ
            // ST00092 (แถวที่ insert ไปแล้วใน transaction เดียวกันถูกนับด้วย เลขไม่ชนกัน)
            $hdrId = intval($db->GetDataBySQL(
                "select top 1 sp_tor_period_bill_hdr_id from NMU_ERP.dbo.sp_tor_period_bill order by sp_tor_period_bill_hdr_id desc",
                array()
            )) + 1;
            $code = $c["c_contract_code"] !== "" ? $c["c_contract_code"] : medsupGenContractCode($db, $c["c_ap_dept_type"]);
            $codes[] = $code;
            foreach ($c["periods"] as $p) {
                $data = array(
                    "sp_tor_period_bill_hdr_id" => $hdrId,
                    "sp_tor_period_bill_import_id" => $importId,
                    "c_ap_dept_type" => $c["c_ap_dept_type"],
                    "po_expense_id" => $c["po_expense_id"],
                    "c_expense_name" => $c["c_expense_name"],
                    "c_project_name" => $c["c_project_name"],
                    "c_contract_code" => $code,
                    "c_contract_type" => $c["c_contract_type"],
                    "dc_expense_budget_type_id" => $c["dc_expense_budget_type_id"],
                    "c_fund_source" => $c["c_fund_source"],
                    "f_fund_amt" => $c["f_fund_amt"],
                    "dc_expense_budget_type_id2" => $c["dc_expense_budget_type_id2"],
                    "c_fund_source2" => $c["c_fund_source2"],
                    "f_fund_amt2" => $c["f_fund_amt2"],
                    "dc_expense_budget_type_id3" => $c["dc_expense_budget_type_id3"],
                    "c_fund_source3" => $c["c_fund_source3"],
                    "f_fund_amt3" => $c["f_fund_amt3"],
                    "i_budget_year" => $c["i_budget_year"],
                    "d_start_date" => $c["d_start_date"],
                    "d_end_date" => $c["d_end_date"],
                    "dc_creditor_id" => $c["dc_creditor_id"],
                    "c_creditor_name" => $c["c_creditor_name"],
                    "c_tax_number_imp" => $c["c_tax_number_imp"],
                    "i_period" => $p["i_period"],
                    "c_doc_ref" => $p["c_doc_ref"] !== "" ? $p["c_doc_ref"] : null,
                    "d_doc_dateSub" => $p["d_doc_dateSub"],
                    "c_detail" => $p["c_detail"] !== "" ? $p["c_detail"] : null,
                    "dc_expense_budget_type_id_dtl" => $p["dc_expense_budget_type_id_dtl"],
                    "c_fund_source_dtl" => $p["c_fund_source_dtl"],
                    "f_fund_amt_dtl" => $p["f_fund_amt_dtl"],
                    "f_period_amt" => $p["f_fund_amt_dtl"],
                    "dc_cost_id" => MEDSUP_DC_COST_ID,
                    "i_enabled" => 1,
                    "dc_user_create_id" => $_SESSION["user_id"] ?? null,
                    "dc_user_create_cost_id" => $_SESSION["dc_cost_id"] ?? null,
                    "d_create" => $now,
                    "dc_user_update_id" => $_SESSION["user_id"] ?? null,
                    "dc_user_update_cost_id" => $_SESSION["dc_cost_id"] ?? null,
                    "d_update" => $now,
                    // เลขใบกันเหลื่อมของแหล่งเงินที่ 1 (ว่าง = ปีต่อปี)
                    "c_overlap" => ($c["c_overlap"] ?? "") !== "" ? $c["c_overlap"] : null,
                    "i_budget_year_overlap" => $c["i_budget_year_overlap"] ?? null,
                );
                if ($hasRefBill) {
                    foreach (array("pr_id", "po_id", "chk_id") as $rk) {
                        $data["c_ref_" . $rk] = ($p["ref"][$rk] ?? "") !== "" ? $p["ref"][$rk] : null;
                    }
                }
                $fields = implode(", ", array_keys($data));
                $marks = implode(", ", array_fill(0, count($data), "?"));
                $stmtP = $db->QueryParam(
                    "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_tor_period_bill ({$fields}) VALUES ({$marks});
                     SELECT CAST(SCOPE_IDENTITY() AS INT) AS new_id;",
                    array_values($data)
                );
                $rowP = $stmtP ? $db->Fetch($stmtP) : null;
                $periodBillId = $rowP ? intval($rowP["new_id"]) : 0;
                if (!$periodBillId) {
                    $ok = false;
                    break;
                }
                // รายการรับของของงวดนี้ (dtl หน้าส่งมอบงาน ST00095) - ยังไม่ออกเลข IR/ไม่มีร่าง VAT
                // (ไปทำต่อที่หน้าส่งมอบงานตามปกติ) คอลัมน์เดียวกับ mode ADD ของ
                // mnMedSupPeriodBillReceiveController.php
                foreach ($p["receives"] as $rc) {
                    // ร่าง VAT ของรายการ (ช่อง VAT ในไฟล์ - ว่าง = ค่าเริ่มต้น 7%/1%) เก็บลงคอลัมน์
                    // draft_* ชุดเดียวกับปุ่ม "แก้ไข VAT" > บันทึกร่าง ที่หน้าส่งมอบงาน
                    // draft_f_total_vat = จำนวนเงินรับของ (ถอด VAT) ให้ medsupRowMoney ใช้ยอดที่บันทึกไว้
                    $vt = $rc["vat"];
                    $rcParams = array($periodBillId, $rc["c_receive_code"], $rc["d_receive_date"] ?: null, $rc["c_detail"], $rc["f_amt"], $rc["c_erp_stock_code"],
                        $_SESSION["user_id"] ?? null, $_SESSION["dc_cost_id"] ?? null,
                        $rc["f_amt"], $vt["b_vat"], $vt["vat_pct"], $vt["vat"],
                        $vt["b_wht"], $vt["wht_pct"], $vt["wht"],
                        $vt["penalty"], $vt["b_guar"], $vt["guar_pct"], $vt["other"]);
                    if ($hasRefReceive) {
                        $rcParams[] = ($rc["c_ref_chk_id"] ?? "") !== "" ? $rc["c_ref_chk_id"] : null;
                    }
                    if (!$db->QueryParam(
                        "SET NOCOUNT ON; INSERT INTO NMU_ERP.dbo.sp_tor_period_bill_receive
                            (sp_tor_period_bill_id, c_receive_code, d_receive_date, c_detail, f_amt, c_erp_stock_code, i_enabled, dc_user_create_id, dc_user_create_cost_id, d_create
                            , draft_f_total_vat, draft_b_vat, draft_f_vat_percent, draft_f_vat_amt
                            , draft_b_wht, draft_f_wht_percent, draft_f_wht_amt
                            , draft_f_penalty, draft_b_guarantee, draft_f_guarantee_percent, draft_f_other" . ($hasRefReceive ? ", c_ref_chk_id" : "") . ")
                         VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, GETDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?" . ($hasRefReceive ? ", ?" : "") . ");",
                        $rcParams
                    )) {
                        $ok = false;
                        break 2;
                    }
                }
            }
        }

        if ($ok) {
            $db->CommitTran();
            imp_json(array("success" => true, "import_id" => $importId, "contract_count" => count($codes), "codes" => $codes,
                "receive_count" => $v["receive_count"]));
        }
        $db->RollBackTran();
        imp_json(array("success" => false, "msg" => "บันทึกไม่สำเร็จ ไม่มีข้อมูลใดถูกบันทึก"));
        break;

    case "LIST":
        $data = array();
        $stmt = $db->QueryParam(
            "select i.sp_tor_period_bill_import_id, i.c_import_name, i.c_file_name, i.i_contract_count, i.i_row_count, i.f_total_amt
                , convert(varchar, i.d_create, 120) as d_create
                , (select top 1 u.c_full_name from dc_user u where u.dc_user_id = i.dc_user_create_id) as c_user_name
                , (select count(*) from NMU_ERP.dbo.sp_tor_period_bill_receive r
                   inner join NMU_ERP.dbo.sp_tor_period_bill b on b.sp_tor_period_bill_id = r.sp_tor_period_bill_id
                   where b.sp_tor_period_bill_import_id = i.sp_tor_period_bill_import_id and r.i_enabled = 1) as i_receive_count
             from NMU_ERP.dbo.sp_tor_period_bill_import i
             where i.i_enabled = 1
             order by i.sp_tor_period_bill_import_id desc",
            array()
        );
        while ($stmt && ($r = $db->Fetch($stmt))) {
            $data[] = array(
                "id" => intval($r["sp_tor_period_bill_import_id"]),
                "c_import_name" => $r["c_import_name"],
                "c_file_name" => $r["c_file_name"],
                "i_contract_count" => intval($r["i_contract_count"]),
                "i_row_count" => intval($r["i_row_count"]),
                "i_receive_count" => intval($r["i_receive_count"]),
                "f_total_amt" => number_format(floatval($r["f_total_amt"]), 2),
                "d_create" => empty($r["d_create"]) ? "" : $date->extDateBuddha($r["d_create"]) . " " . substr($r["d_create"], 11, 5),
                "c_user_name" => $r["c_user_name"],
            );
        }
        imp_json(array("data" => $data, "totalCount" => count($data)));
        break;

    case "LIST_ROWS":
        $data = array();
        // 1 แถว = 1 รายการรับของ (งวดที่ไม่มีรายการรับของ = 1 แถว ช่องรับของว่าง)
        // เลขอ้างอิง pr_id/po_id/chk_id (คอลัมน์จาก scriptBaseUpdate/sp_tor_period_bill_import_ref.sql - ยังไม่มีก็แสดงว่าง)
        $refSel = intval($db->GetDataBySQL(
            "select case when COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill', 'c_ref_pr_id') is null
                           or COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill_receive', 'c_ref_chk_id') is null then 0 else 1 end", array())) === 1
            ? ", b.c_ref_pr_id, b.c_ref_po_id, isnull(r.c_ref_chk_id, b.c_ref_chk_id) as c_ref_chk_id"
            : ", cast(null as varchar(50)) as c_ref_pr_id, cast(null as varchar(50)) as c_ref_po_id, cast(null as varchar(50)) as c_ref_chk_id";
        $stmt = $db->QueryParam(
            "select b.sp_tor_period_bill_hdr_id, b.c_contract_code, b.c_ap_dept_type, b.c_project_name, b.c_contract_type, b.c_creditor_name, b.i_budget_year
                , b.i_period, b.c_doc_ref, convert(varchar, b.d_doc_dateSub, 120) as d_doc_dateSub, b.c_detail, b.c_fund_source_dtl, b.f_fund_amt_dtl
                , r.c_receive_code, r.c_erp_stock_code, convert(varchar, r.d_receive_date, 120) as d_receive_date, r.c_detail as rc_detail, r.f_amt as rc_amt
                , b.c_overlap {$refSel}
             from NMU_ERP.dbo.sp_tor_period_bill b
             left join NMU_ERP.dbo.sp_tor_period_bill_receive r on r.sp_tor_period_bill_id = b.sp_tor_period_bill_id and r.i_enabled = 1
             where b.sp_tor_period_bill_import_id = ? and b.i_enabled = 1
             order by b.sp_tor_period_bill_hdr_id, b.i_period, r.sp_tor_period_bill_receive_id",
            array(intval($_REQUEST["import_id"] ?? 0))
        );
        while ($stmt && ($r = $db->Fetch($stmt))) {
            $data[] = array(
                "hdr_id" => intval($r["sp_tor_period_bill_hdr_id"]),
                "c_contract_code" => $r["c_contract_code"],
                "c_ap_dept_type" => $r["c_ap_dept_type"],
                "c_project_name" => $r["c_project_name"],
                "c_contract_type" => $r["c_contract_type"],
                "c_creditor_name" => $r["c_creditor_name"],
                "i_budget_year" => $r["i_budget_year"] ? intval($r["i_budget_year"]) + 543 : "",
                "i_period" => $r["i_period"],
                "c_doc_ref" => $r["c_doc_ref"],
                "d_doc_dateSub" => empty($r["d_doc_dateSub"]) ? "" : $date->extDateBuddha($r["d_doc_dateSub"]),
                "c_detail" => $r["c_detail"],
                "c_fund_source_dtl" => $r["c_fund_source_dtl"],
                "f_fund_amt_dtl" => number_format(floatval($r["f_fund_amt_dtl"]), 2),
                "c_receive_code" => $r["c_receive_code"],
                "c_erp_stock_code" => $r["c_erp_stock_code"],
                "d_receive_date" => empty($r["d_receive_date"]) ? "" : $date->extDateBuddha($r["d_receive_date"]),
                "rc_detail" => $r["rc_detail"],
                "rc_amt" => is_null($r["rc_amt"]) ? "" : number_format(floatval($r["rc_amt"]), 2),
                "pr_id" => $r["c_ref_pr_id"],
                "po_id" => $r["c_ref_po_id"],
                "chk_id" => $r["c_ref_chk_id"],
                "c_overlap" => $r["c_overlap"],
                // สถานะจองเงินในระบบงบ ณ ตอนที่เปิดดู (ค้นสดจากเลขอ้างอิงที่เก็บไว้)
                "rsv_status" => imp_reserve_status($db, $r["c_ref_pr_id"], $r["c_ref_po_id"], $r["c_ref_chk_id"]),
            );
        }
        imp_json(array("data" => $data, "totalCount" => count($data)));
        break;

    case "CANCEL_CHECK":
    case "CANCEL":
        // ยกเลิกทั้งชุดนำเข้า (ข้อมูลในไฟล์ผิด ต้องการนำเข้าใหม่) - soft delete (i_enabled = 0) ทั้งประวัติ
        // การนำเข้า + สัญญา/งวด + รายการรับของ ของชุดนั้น ไม่ลบถาวร เลขที่สัญญาของชุดที่ยกเลิกไม่ถูกนำกลับ
        // มาใช้ (medsupGenContractCode นับแถวที่ยกเลิกด้วย) ระบบตรวจให้เองทั้งชุด ผู้ใช้ไม่ต้องไล่ดูทีละสัญญา:
        // ถ้ามีสัญญาใดถูกทำงานต่อไปแล้ว (จองเงิน / ออกเลข IR / ออกเลขตรวจรับ AP) จะไม่ยกเลิกเลยทั้งชุด
        // และแจ้งเลขที่สัญญาที่ติด  CANCEL_CHECK = ตรวจอย่างเดียว (ใช้แสดงก่อนยืนยัน)
        $importId = intval($_REQUEST["import_id"] ?? 0);
        $imp = $db->GetDataBySQL(
            "select sp_tor_period_bill_import_id, c_import_name, dc_user_create_id
               from NMU_ERP.dbo.sp_tor_period_bill_import where sp_tor_period_bill_import_id = ? and i_enabled = 1",
            array($importId)
        );
        if (!$imp) {
            imp_json(array("success" => false, "msg" => "ไม่พบรายการนำเข้านี้ (อาจถูกยกเลิกไปแล้ว)"));
        }
        // ยกเลิกได้เฉพาะผู้นำเข้าเอง หรือผู้ดูแลระบบ (เงื่อนไขเดียวกับ medsupIsAdmin)
        $isAdmin = intval($_SESSION["user_id"] ?? 0) === 1 || intval($_SESSION["i_type_user"] ?? 0) === 2;
        if (!$isAdmin && intval($imp["dc_user_create_id"]) !== intval($_SESSION["user_id"] ?? 0)) {
            imp_json(array("success" => false, "msg" => "ยกเลิกได้เฉพาะผู้นำเข้ารายการนี้ หรือผู้ดูแลระบบ"));
        }
        // hdr_ids (คั่นด้วย ,) = ยกเลิกเฉพาะบางสัญญาของชุด (ติ๊กเลือกในหน้าต่างรายการที่นำเข้า) ว่าง = ยกเลิกทั้งชุด
        $hdrIds = array_values(array_filter(array_map('intval', explode(',', (string) ($_REQUEST["hdr_ids"] ?? "")))));
        $partial = !empty($hdrIds);
        // สัญญาของชุดนี้ = ทุกแถวของ hdr ที่มาจากการนำเข้านี้ (รวมงวดที่ถูกเพิ่มทีหลังที่ ST00092)
        $hdrSql = "select distinct sp_tor_period_bill_hdr_id from NMU_ERP.dbo.sp_tor_period_bill where sp_tor_period_bill_import_id = ?"
            . ($partial ? " and sp_tor_period_bill_hdr_id in (" . implode(",", $hdrIds) . ")" : "");
        $blocked = array();
        $stmt = $db->QueryParam(
            "select b.c_contract_code
                  , max(case when isnull(b.bg_reserve_money_id, 0) > 0 or isnull(b.bg_reserve_money_id2, 0) > 0 or isnull(b.bg_reserve_money_id3, 0) > 0
                              or isnull(b.pr_bg_reserve_money_id, 0) > 0 or isnull(b.pr_bg_reserve_money_id2, 0) > 0 or isnull(b.pr_bg_reserve_money_id3, 0) > 0
                             then 1 else 0 end) as i_reserved
                  , max(case when isnull(r.c_ir_code, '') <> '' then 1 else 0 end) as i_ir
                  , max(case when isnull(r.c_ap_code, '') <> '' then 1 else 0 end) as i_ap
               from NMU_ERP.dbo.sp_tor_period_bill b
               left join NMU_ERP.dbo.sp_tor_period_bill_receive r on r.sp_tor_period_bill_id = b.sp_tor_period_bill_id and r.i_enabled = 1
              where b.i_enabled = 1 and b.sp_tor_period_bill_hdr_id in ({$hdrSql})
              group by b.sp_tor_period_bill_hdr_id, b.c_contract_code
              order by b.sp_tor_period_bill_hdr_id",
            array($importId)
        );
        $contractCount = 0;
        while ($stmt && ($r = $db->Fetch($stmt))) {
            $contractCount++;
            $why = array();
            if (intval($r["i_reserved"]) === 1) {
                $why[] = "จองเงินแล้ว";
            }
            if (intval($r["i_ap"]) === 1) {
                $why[] = "ออกเลขตรวจรับ (AP) แล้ว";
            } elseif (intval($r["i_ir"]) === 1) {
                $why[] = "ออกเลข IR แล้ว";
            }
            if (!empty($why)) {
                $blocked[] = array("c_contract_code" => $r["c_contract_code"], "reason" => implode(", ", $why));
            }
        }
        if ($partial && $contractCount === 0) {
            imp_json(array("success" => false, "msg" => "ไม่พบสัญญาที่เลือกในรายการนำเข้านี้ (อาจถูกยกเลิกไปแล้ว)"));
        }
        if ($mode === "CANCEL_CHECK" || !empty($blocked)) {
            imp_json(array(
                "success" => empty($blocked),
                "msg" => empty($blocked) ? "" : "ยกเลิกไม่ได้ มีสัญญาที่ถูกทำงานต่อไปแล้ว " . count($blocked) . " รายการ",
                "contract_count" => $contractCount,
                "blocked" => $blocked,
            ));
        }

        $reason = imp_str($_REQUEST["c_reason"] ?? "");
        if ($reason === "") {
            imp_json(array("success" => false, "msg" => "กรุณากรอกเหตุผลที่ยกเลิก"));
        }
        $db->BeginTran();
        $uid = $_SESSION["user_id"] ?? null;
        $ucost = $_SESSION["dc_cost_id"] ?? null;
        $ok = $db->QueryParam(
            "SET NOCOUNT ON;
             UPDATE r SET r.i_enabled = 0, r.dc_user_update_id = ?, r.dc_user_update_cost_id = ?, r.d_update = GETDATE()
               FROM NMU_ERP.dbo.sp_tor_period_bill_receive r
               INNER JOIN NMU_ERP.dbo.sp_tor_period_bill b ON b.sp_tor_period_bill_id = r.sp_tor_period_bill_id
              WHERE r.i_enabled = 1 AND b.sp_tor_period_bill_hdr_id IN ({$hdrSql});
             UPDATE NMU_ERP.dbo.sp_tor_period_bill
                SET i_enabled = 0, dc_user_update_id = ?, dc_user_update_cost_id = ?, d_update = GETDATE()
              WHERE i_enabled = 1 AND sp_tor_period_bill_hdr_id IN ({$hdrSql});
             SELECT 1 AS done;",
            array($uid, $ucost, $importId, $uid, $ucost, $importId)
        );
        if ($ok && !$partial) {
            // ยกเลิกทั้งชุด: ปิดประวัติการนำเข้า (คงจำนวนสัญญา/ยอดรวมเดิมไว้เป็นหลักฐาน)
            $ok = $db->QueryParam(
                "SET NOCOUNT ON; UPDATE NMU_ERP.dbo.sp_tor_period_bill_import SET i_enabled = 0 WHERE sp_tor_period_bill_import_id = ?; SELECT 1 AS done;",
                array($importId)
            );
        } elseif ($ok) {
            // ยกเลิกบางสัญญา: ปรับจำนวนสัญญา/งวด/ยอดรวมของชุดตามที่เหลือ ไม่เหลือสัญญาเลย = ปิดชุด
            $ok = $db->QueryParam(
                "SET NOCOUNT ON;
                 UPDATE i SET i.i_contract_count = x.c, i.i_row_count = x.r, i.f_total_amt = x.t
                            , i.i_enabled = CASE WHEN x.c = 0 THEN 0 ELSE i.i_enabled END
                   FROM NMU_ERP.dbo.sp_tor_period_bill_import i
                  CROSS APPLY (SELECT COUNT(DISTINCT b.sp_tor_period_bill_hdr_id) AS c, COUNT(*) AS r, ISNULL(SUM(b.f_fund_amt_dtl), 0) AS t
                                 FROM NMU_ERP.dbo.sp_tor_period_bill b
                                WHERE b.sp_tor_period_bill_import_id = i.sp_tor_period_bill_import_id AND b.i_enabled = 1) x
                  WHERE i.sp_tor_period_bill_import_id = ?;
                 SELECT 1 AS done;",
                array($importId)
            );
        }
        // เหตุผล/ผู้ยกเลิก - คอลัมน์เพิ่มโดย scriptBaseUpdate/sp_tor_period_bill_import_cancel.sql (ยังไม่ได้รันก็ยกเลิกได้ แค่ไม่เก็บเหตุผล)
        // ยกเลิกบางสัญญา: ต่อท้ายเหตุผลเดิม (ยกเลิกได้หลายรอบ) พร้อมเลขที่สัญญาที่ยกเลิกรอบนี้
        if ($ok) {
            $note = $reason;
            if ($partial) {
                $codes = array();
                $stmtC = $db->QueryParam(
                    "select distinct c_contract_code from NMU_ERP.dbo.sp_tor_period_bill
                      where sp_tor_period_bill_import_id = ? and sp_tor_period_bill_hdr_id in (" . implode(",", $hdrIds) . ")",
                    array($importId)
                );
                while ($stmtC && ($rc = $db->Fetch($stmtC))) {
                    $codes[] = $rc["c_contract_code"];
                }
                $note = "[" . date("d/m/Y H:i") . " ยกเลิก " . implode(", ", $codes) . "] " . $reason;
            }
            $ok = $db->QueryParam(
                "IF COL_LENGTH('NMU_ERP.dbo.sp_tor_period_bill_import', 'c_cancel_reason') IS NOT NULL
                    EXEC sp_executesql N'UPDATE NMU_ERP.dbo.sp_tor_period_bill_import
                            SET c_cancel_reason = LEFT(CASE WHEN @p = 1 AND ISNULL(c_cancel_reason, N'''') <> N'''' THEN c_cancel_reason + N'' | '' ELSE N'''' END + @r, 500)
                              , dc_user_cancel_id = @u, d_cancel = GETDATE()
                          WHERE sp_tor_period_bill_import_id = @id',
                        N'@r nvarchar(500), @u int, @id int, @p int', @r = ?, @u = ?, @id = ?, @p = ?;
                 SELECT 1 AS done;",
                array($note, $uid, $importId, $partial ? 1 : 0)
            );
        }
        if ($ok) {
            $db->CommitTran();
            imp_json(array("success" => true, "contract_count" => $contractCount));
        }
        $db->RollBackTran();
        imp_json(array("success" => false, "msg" => "ยกเลิกไม่สำเร็จ ไม่มีข้อมูลใดถูกเปลี่ยน"));
        break;
}

imp_json(array("success" => false, "msg" => "invalid mode"));
