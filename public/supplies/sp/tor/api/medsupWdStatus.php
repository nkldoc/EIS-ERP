<?php
// สถานะใบเบิก (D...) ใน EIS + รายการ/เอกสาร "ทักท้วง" ของใบเบิกนั้น - ใช้แสดงในหน้า ST00096 ตรวจรับ (เวชภัณฑ์/เภสัช)
// อ่านอย่างเดียว (ไม่แก้ข้อมูล EIS) include จาก List_MedSupPeriodBill.php
//
// สถานะใบเบิก = po_working_hdr.i_status_last ซึ่งตรงกับ po_status_hdr.i_seq (ชื่อขั้นตอนของ EIS) เช่น
//   2 รับใบเบิก / 3 ทักท้วงฏีกา / 4 ยกเลิก / 5 รับคืนทักท้วง / 6 อนุมัติฎีกา / 7 หักงบประมาณ / 10 จัดทำเช็ค ...
// "หักงบประมาณแล้ว" = ขั้น 7 ขึ้นไป (ขั้น "หักงบประมาณ" ของ EIS)
// ทักท้วง = รายการ po_working_item ที่มีเหตุผลทักท้วง (po_reason_protest_id_s) หรือไฟล์ PDF ทักท้วง (c_file_pdf_protest_hdr/dtl)
// ไฟล์ PDF อยู่ที่ฝั่ง EIS (PATH_EIS_PO_PROTEST_PDF) เปิดผ่าน EIS lib/Open_Pdf.php แบบเดียวกับที่ EIS เปิดเอง

function medsupEisProtestPdfBase()
{
    return defined("PATH_EIS_PO_PROTEST_PDF") ? PATH_EIS_PO_PROTEST_PDF : "D:/eis_pdf/po/po_protest_pdf/";
}

// ลิงก์ (ต่อท้าย NMU_EIS_HOST ฝั่ง JS) เปิดไฟล์ PDF ทักท้วง: รหัส code_F = (พาธไฟล์ไม่รวม .pdf) XOR 123 แล้ว URL-encode 2 ชั้น
// ตามที่ EIS ใช้ (OpenPdf ใน NMU_EIS/js/config_function.js และ lib/Open_Pdf.php)
function medsupEisProtestPdfUrl($relFile, $niceName)
{
    $relFile = trim((string) $relFile);
    // กันพาธแปลก ๆ: รูปแบบที่ EIS เขียนคือ YYYY-MM-DD/<id>_po_protest_(hdr|dtl).pdf เท่านั้น
    if (!preg_match('#^\d{4}-\d{2}-\d{2}/\d+_po_protest_(hdr|dtl)\.pdf$#', $relFile)) {
        return "";
    }
    $full = medsupEisProtestPdfBase() . $relFile;
    $noExt = substr($full, 0, -4);
    $enc = "";
    for ($i = 0, $n = strlen($noExt); $i < $n; $i++) {
        $enc .= chr(ord($noExt[$i]) ^ 123);
    }
    $name = preg_replace('/[^A-Za-z0-9._-]/', '-', (string) $niceName);
    return "/lib/Open_Pdf.php/" . rawurlencode($name) . ".pdf?code_F=" . rawurlencode(rawurlencode($enc)) . "&file_name=" . rawurlencode($name);
}

// $codes = array เลขใบเบิก (c_code_ref) -> คืน array[c_code_ref] = ข้อมูลสถานะ/ทักท้วง
function medsupWdStatusMap($db, $date, $codes)
{
    $codes = array_values(array_unique(array_filter(array_map("strval", $codes), function ($c) {
        return $c !== "";
    })));
    $out = array();
    if (empty($codes)) {
        return $out;
    }
    $ph = implode(",", array_fill(0, count($codes), "?"));

    $statusName = array();
    $stmtSt = $db->QueryParam("select i_seq, c_name from NMU_EIS.dbo.po_status_hdr where i_enable = 1", array());
    while ($stmtSt && ($r = $db->Fetch($stmtSt))) {
        $statusName[intval($r["i_seq"])] = $r["c_name"];
    }
    $reasonName = array();
    $stmtRs = $db->QueryParam("select po_reason_protest_id, c_name from NMU_EIS.dbo.po_reason_protest where i_enable = 1", array());
    while ($stmtRs && ($r = $db->Fetch($stmtRs))) {
        $reasonName[intval($r["po_reason_protest_id"])] = $r["c_name"];
    }

    $hdrByCode = array();   // c_code_ref => [hdr_id, status]
    $stmtH = $db->QueryParam(
        "select h.c_code_ref, h.po_working_hdr_id, h.i_status_last, convert(varchar(10), h.i_sub_status) as i_sub_status
           from NMU_EIS.dbo.po_working_hdr h where h.i_enable = 1 and h.c_code_ref in ({$ph}) order by h.po_working_hdr_id",
        $codes
    );
    while ($stmtH && ($r = $db->Fetch($stmtH))) {
        $hdrByCode[$r["c_code_ref"]] = array("id" => intval($r["po_working_hdr_id"]), "st" => intval($r["i_status_last"]), "sub" => (string) $r["i_sub_status"]);
    }
    if (empty($hdrByCode)) {
        return $out;
    }

    $hdrIds = array_map(function ($h) { return $h["id"]; }, array_values($hdrByCode));
    $hPh = implode(",", array_fill(0, count($hdrIds), "?"));
    $protestsByHdr = array();
    $stmtI = $db->QueryParam(
        "select i.po_working_hdr_id, i.po_working_item_id, convert(varchar, i.d_create, 120) as d_create
                , i.po_reason_protest_id_s, i.c_file_pdf_protest_hdr, i.c_file_pdf_protest_dtl
           from NMU_EIS.dbo.po_working_item i
          where i.i_enable = 1 and i.po_working_hdr_id in ({$hPh})
            and (isnull(i.po_reason_protest_id_s, '') <> '' or isnull(i.c_file_pdf_protest_hdr, '') <> '' or isnull(i.c_file_pdf_protest_dtl, '') <> '')
          order by i.po_working_item_id",
        $hdrIds
    );
    while ($stmtI && ($r = $db->Fetch($stmtI))) {
        $reasons = array();
        foreach (preg_split('/[;,]+/', (string) $r["po_reason_protest_id_s"]) as $rid) {
            $rid = intval(trim($rid));
            if ($rid > 0 && isset($reasonName[$rid])) {
                $reasons[] = $reasonName[$rid];
            }
        }
        $files = array();
        foreach (array("c_file_pdf_protest_hdr" => "เอกสารทักท้วง (หัวใบเบิก)", "c_file_pdf_protest_dtl" => "เอกสารทักท้วง (รายการ)") as $col => $label) {
            $url = medsupEisProtestPdfUrl($r[$col], "protest-" . intval($r["po_working_item_id"]) . ($col === "c_file_pdf_protest_hdr" ? "-hdr" : "-dtl"));
            if ($url !== "") {
                $files[] = array("label" => $label, "url" => $url);
            }
        }
        $protestsByHdr[intval($r["po_working_hdr_id"])][] = array(
            "d_create" => empty($r["d_create"]) ? "" : $date->extDateBuddha($r["d_create"]) . " " . substr($r["d_create"], 11, 5),
            "reasons" => $reasons,
            "files" => $files,
        );
    }

    foreach ($hdrByCode as $code => $h) {
        $st = $h["st"];
        $protests = $protestsByHdr[$h["id"]] ?? array();
        $out[$code] = array(
            "wd_status" => $st,
            "wd_status_text" => ($st === 0)
                // ยังอยู่ขั้นบันทึก/ลงนามใบขอเบิก (ยังไม่ส่งการคลัง)
                ? (array("0.30" => "บันทึกใบขอเบิก", "0.40" => "ผู้ดำเนินการลงนามแล้ว", "0.50" => "ผู้ขอเบิกลงนามแล้ว (รอส่งการคลัง)")[$h["sub"]] ?? "บันทึกใบขอเบิก")
                : ($statusName[$st] ?? ("ขั้น " . $st)),
            "b_wd_deducted" => ($st >= 7) ? 1 : 0,          // ขั้น "หักงบประมาณ" ขึ้นไป
            "b_wd_protest_now" => ($st === 3) ? 1 : 0,      // ขั้น "ทักท้วงฏีกา" ตอนนี้
            "b_wd_cancelled" => ($st === 4) ? 1 : 0,
            "protests" => $protests,
        );
    }
    return $out;
}
