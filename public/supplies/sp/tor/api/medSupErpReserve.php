<?php

// ================= การจองเงินที่ระบบ ERP เวชภัณฑ์ทำไว้แล้ว (อ่านอย่างเดียว) ================= //
// สัญญาที่นำเข้าจากไฟล์ (ST00097) มีเลขอ้างอิงของ ERP เวชภัณฑ์ติดมา (c_ref_pr_id / c_ref_po_id) และ
// ERP อาจจองเงินในระบบงบไว้แล้ว (bg_reserve_money ฝั่ง i_sys = 2) - ใช้ไฟล์นี้เช็คสดจากระบบงบ เพื่อ
//  1) แสดงสถานะที่หน้า ST00092 ว่าจองแล้วจาก ERP (List_MedSupPeriodBill.php)
//  2) กันไม่ให้กดจองเงินซ้ำจากเมนูของเรา (mnMedSupPeriodBillController.php)
// ไม่เขียนอะไรลงฐานข้อมูล และไม่เอาเลขจองของ ERP มาใส่ bg_reserve_money_id ของเรา (ปุ่มยกเลิกการจอง
// ของเราจะได้ไม่ไปยกเลิกรายการที่ ERP เป็นคนจอง)
if (!defined("MEDSUP_ERP_I_SYS")) {
    define("MEDSUP_ERP_I_SYS", 2);
}

// มีคอลัมน์เลขอ้างอิง ERP แล้วหรือยัง (scriptBaseUpdate/sp_tor_period_bill_import_ref.sql)
function medSupErpRefReady($db) {
    static $ready = null;
    if ($ready === null) {
        $ready = intval($db->GetDataBySQL("select isnull(col_length('NMU_ERP.dbo.sp_tor_period_bill', 'c_ref_pr_id'), 0)", array())) > 0;
    }
    return $ready;
}

// คืนสถานะการจองของ ERP เวชภัณฑ์ต่อ 1 แหล่งเงินของสัญญา (hdr) - ไม่มีเลขอ้างอิง/ไม่พบการจอง = null
//   stage    : 2 = จองขั้นสัญญาแล้ว / 1 = จองแค่ขั้น PR
//   amt      : ยอดที่จอง (ขั้นสัญญา หรือขั้น PR ตาม stage)
//   id, date : เลขอ้างอิง/วันที่ของรายการจองล่าสุดในขั้นนั้น
//   text     : ข้อความสำหรับแสดงผล
function medSupErpReserve($db, $hdrId, $fundId) {
    static $refCache = array();
    static $rsvCache = array();
    $hdrId = intval($hdrId);
    $fundId = intval($fundId);
    if ($hdrId <= 0 || $fundId <= 0 || !medSupErpRefReady($db)) {
        return null;
    }
    if (!isset($refCache[$hdrId])) {
        $prIds = array();
        $poIds = array();
        $stmt = $db->QueryParam(
            "select distinct c_ref_pr_id, c_ref_po_id from NMU_ERP.dbo.sp_tor_period_bill
              where sp_tor_period_bill_hdr_id = ? and i_enabled = 1 and c_ref_pr_id is not null",
            array($hdrId)
        );
        while ($stmt && ($r = $db->Fetch($stmt))) {
            $pr = trim(strval($r["c_ref_pr_id"]));
            $po = trim(strval($r["c_ref_po_id"] ?? ""));
            if (ctype_digit($pr) && strlen($pr) <= 18) {
                $prIds[$pr] = true;
            }
            if (ctype_digit($po) && strlen($po) <= 18) {
                $poIds[strval(intval($po))] = true;
            }
        }
        $refCache[$hdrId] = array(array_keys($prIds), $poIds);
    }
    list($prIds, $poIds) = $refCache[$hdrId];
    if (empty($prIds)) {
        return null;
    }
    $pr = array("amt" => 0, "id" => 0, "date" => "");
    $con = array("amt" => 0, "id" => 0, "date" => "");
    foreach ($prIds as $prId) {
        if (!isset($rsvCache[$prId])) {
            $rows = array();
            $stmt = $db->QueryParam(
                "select bg_reserve_money_id, i_reserve, po_id, dc_budget_type_id, f_amt, convert(varchar, d_create, 120) as d_create
                   from NMU_EIS.dbo.bg_reserve_money
                  where i_sys = ? and i_enable = 1 and pr_id = ? and i_reserve in (1, 2)
                  order by bg_reserve_money_id",
                array(MEDSUP_ERP_I_SYS, $prId)
            );
            while ($stmt && ($r = $db->Fetch($stmt))) {
                $rows[] = $r;
            }
            $rsvCache[$prId] = $rows;
        }
        foreach ($rsvCache[$prId] as $r) {
            if (intval($r["dc_budget_type_id"]) !== $fundId) {
                continue;
            }
            if (intval($r["i_reserve"]) === 1) {
                $pr = array("amt" => $pr["amt"] + floatval($r["f_amt"]), "id" => intval($r["bg_reserve_money_id"]), "date" => $r["d_create"]);
            } elseif (empty($poIds) || isset($poIds[strval(intval($r["po_id"]))])) {
                $con = array("amt" => $con["amt"] + floatval($r["f_amt"]), "id" => intval($r["bg_reserve_money_id"]), "date" => $r["d_create"]);
            }
        }
    }
    if ($con["id"] > 0) {
        return $con + array("stage" => 2, "text" => "จองเงินแล้วจากระบบ ERP เวชภัณฑ์ " . number_format($con["amt"], 2) . " (รหัสอ้างอิง " . $con["id"] . ")");
    }
    if ($pr["id"] > 0) {
        return $pr + array("stage" => 1, "text" => "ระบบ ERP เวชภัณฑ์จองขั้น PR ไว้แล้ว " . number_format($pr["amt"], 2) . " (รหัสอ้างอิง " . $pr["id"] . ") ยังไม่จองขั้นสัญญา");
    }
    return null;
}
