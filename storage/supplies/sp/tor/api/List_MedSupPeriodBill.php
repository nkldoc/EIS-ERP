<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

$mode = $_REQUEST["mode"] ?? null;
$type = $_REQUEST["type"] ?? null;
$act = $_REQUEST["act"] ?? null;

$root = "data";
$data = array();

$limit = $_REQUEST["limit"] ?? null;
$start = $_REQUEST["start"] ?? null;

function get($a) {
    return $a ?? 0;
}

if (!get($start)) {
    $start = 0;
}
if (!get($limit)) {
    $limit = 20;
} else {
    $limit = ($limit + $start);
}

$arrParam = array();

if ($type == "medsup_period_bill") {
    // ================= รายการหลัก (กริด) : กลุ่มตาม hdr id ================= //
    // ไม่แสดงแถว PR ที่ยังไม่ได้ทำสัญญา (c_contract_code ยังว่าง - เป็น "stub" ที่สร้าง
    // จากเมนู "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์") ในกริดนี้ เพื่อไม่ให้ผู้ใช้กดเข้าไปแก้ไข
    // แถว PR ตรงๆ (จะข้ามขั้นตอนเลือกจาก dropdown "เลือกจาก PR ที่มีอยู่" ในฟอร์ม "เพิ่ม
    // รายการใหม่" ไปโดยไม่ตั้งใจ) ต้องผ่าน dropdown นั้นเท่านั้นถึงจะดึง PR มาทำสัญญาต่อได้
    $wh = " and s.i_enabled = 1 and s.c_contract_code is not null";
    if ($act == "SEARCH") {
        $wh .= (!empty($_REQUEST['c_contract_code'])) ? " and s.c_contract_code like '%" . $_REQUEST['c_contract_code'] . "%'" : "";
    }

    $sqlTempTable = "select s.sp_tor_period_bill_hdr_id
                     , row_number() over (order by s.sp_tor_period_bill_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_tor_period_bill s
                     where 1=1 {$wh}
                     group by s.sp_tor_period_bill_hdr_id";

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.row
                    , g.sp_tor_period_bill_hdr_id
                    , max(g.sp_tor_contract_id) as sp_tor_contract_id
                    , max(g.sp_tor_id) as sp_tor_id
                    , max(g.sp_tor_hdr_period_id) as sp_tor_hdr_period_id
                    , max(g.c_contract_code) as c_contract_code
                    , max(g.i_period) as i_period
                    , max(g.c_project_name) as c_project_name
                    , max(g.c_contract_type) as c_contract_type
                    , max(g.c_ap_dept_type) as c_ap_dept_type
                    , max(g.dc_expense_budget_type_id) as dc_expense_budget_type_id
                    , max(g.c_fund_source) as c_fund_source
                    , max(g.f_fund_amt) as f_fund_amt
                    , max(g.dc_expense_budget_type_id2) as dc_expense_budget_type_id2
                    , max(g.c_fund_source2) as c_fund_source2
                    , max(g.f_fund_amt2) as f_fund_amt2
                    , max(g.dc_expense_budget_type_id3) as dc_expense_budget_type_id3
                    , max(g.c_fund_source3) as c_fund_source3
                    , max(g.f_fund_amt3) as f_fund_amt3
                    , max(g.c_overlap) as c_overlap
                    , max(g.i_budget_year_overlap) as i_budget_year_overlap
                    , max(g.c_overlap2) as c_overlap2
                    , max(g.i_budget_year_overlap2) as i_budget_year_overlap2
                    , max(g.c_overlap3) as c_overlap3
                    , max(g.i_budget_year_overlap3) as i_budget_year_overlap3
                    , max(g.po_expense_id) as po_expense_id
                    , max(g.c_expense_name) as c_expense_name
                    , max(g.i_budget_year) as i_budget_year
                    , convert(varchar, max(g.d_start_date), 120) as d_start_date
                    , convert(varchar, max(g.d_end_date), 120) as d_end_date
                    , max(g.c_po_no) as c_po_no
                    , max(g.dc_creditor_id) as dc_creditor_id
                    , max(g.c_creditor_name) as c_creditor_name
                    , max(g.c_tax_number_imp) as c_tax_number_imp
                    , count(*) as n_lines
                    , sum(isnull(g.f_period_amt, 0)) as f_total_amt
                    , convert(varchar, max(g.d_create), 120) as d_create
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id = max(g.dc_user_create_id)) as c_create_name
                    , max(g.bg_reserve_money_id) as bg_reserve_money_id
                    , convert(varchar, max(g.d_ap_reserve), 120) as d_ap_reserve
                    , max(g.bg_reserve_money_id2) as bg_reserve_money_id2
                    , convert(varchar, max(g.d_ap_reserve2), 120) as d_ap_reserve2
                    , max(g.bg_reserve_money_id3) as bg_reserve_money_id3
                    , convert(varchar, max(g.d_ap_reserve3), 120) as d_ap_reserve3
                "
                . " from ({$sqlTempTable}) a "
                . " inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_hdr_id = a.sp_tor_period_bill_hdr_id and g.i_enabled = 1"
                . " where a.row > ? and a.row <= ?"
                . " group by a.row, g.sp_tor_period_bill_hdr_id";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => intval($row["row"]),
            "id" => intval($row["sp_tor_period_bill_hdr_id"]),
            "sp_tor_period_bill_hdr_id" => intval($row["sp_tor_period_bill_hdr_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "sp_tor_id" => intval($row["sp_tor_id"]),
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "i_period" => intval($row["i_period"]),
            "c_project_name" => $row["c_project_name"],
            "c_contract_type" => $row["c_contract_type"],
            // รหัสหน่วยงานที่ใช้ออกเลข AP (APPS พัสดุ/APMD เภสัช/APMS เวชภัณฑ์) - เดิม
            // เป็นข้อความคงที่ "APMS - เวชภัณฑ์" ในฟอร์ม ตอนนี้เลือกได้จริงและมีผลต่อ
            // prefix ตอนออกเลข AP จริง (ดู mnMedSupPeriodBillReceiveController.php)
            "c_ap_dept_type" => empty($row["c_ap_dept_type"]) ? "APMS" : $row["c_ap_dept_type"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "c_fund_source" => $row["c_fund_source"],
            "f_fund_amt" => is_null($row["f_fund_amt"]) ? "" : number_format($row["f_fund_amt"], 2),
            "dc_expense_budget_type_id2" => intval($row["dc_expense_budget_type_id2"]),
            "c_fund_source2" => $row["c_fund_source2"],
            "f_fund_amt2" => is_null($row["f_fund_amt2"]) ? "" : number_format($row["f_fund_amt2"], 2),
            "dc_expense_budget_type_id3" => intval($row["dc_expense_budget_type_id3"]),
            "c_fund_source3" => $row["c_fund_source3"],
            "f_fund_amt3" => is_null($row["f_fund_amt3"]) ? "" : number_format($row["f_fund_amt3"], 2),
            // เลขที่ใบกันเหลื่อม/ปีงบประมาณของใบกันเหลื่อมที่เลือกไว้ต่อแหล่งเงิน (ถ้ามี -
            // ไม่มี = แหล่งเงินนั้นใช้งบประมาณปีต่อปีตามปกติ)
            "c_overlap" => $row["c_overlap"],
            "i_budget_year_overlap" => $row["i_budget_year_overlap"],
            "c_overlap2" => $row["c_overlap2"],
            "i_budget_year_overlap2" => $row["i_budget_year_overlap2"],
            "c_overlap3" => $row["c_overlap3"],
            "i_budget_year_overlap3" => $row["i_budget_year_overlap3"],
            "po_expense_id" => intval($row["po_expense_id"]),
            "c_expense_name" => $row["c_expense_name"],
            "i_budget_year" => $row["i_budget_year"],
            "d_start_date" => empty($row["d_start_date"]) ? "" : $date->extDateBuddha($row["d_start_date"]),
            "d_end_date" => empty($row["d_end_date"]) ? "" : $date->extDateBuddha($row["d_end_date"]),
            "c_po_no" => $row["c_po_no"],
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "c_creditor_name" => $row["c_creditor_name"],
            "c_tax_number_imp" => $row["c_tax_number_imp"],
            "n_lines" => intval($row["n_lines"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "d_create" => empty($row["d_create"]) ? "" : $date->extDateBuddha($row["d_create"]),
            "c_create_name" => $row["c_create_name"],
            // สถานะจองเงิน (AP-API) ต่อแหล่งเงิน - ไม่ว่าง = จองแล้ว/ล็อกแหล่งเงินนั้น
            "bg_reserve_money_id" => is_null($row["bg_reserve_money_id"]) ? "" : $row["bg_reserve_money_id"],
            "d_ap_reserve" => empty($row["d_ap_reserve"]) ? "" : $date->extDateBuddha($row["d_ap_reserve"]),
            "bg_reserve_money_id2" => is_null($row["bg_reserve_money_id2"]) ? "" : $row["bg_reserve_money_id2"],
            "d_ap_reserve2" => empty($row["d_ap_reserve2"]) ? "" : $date->extDateBuddha($row["d_ap_reserve2"]),
            "bg_reserve_money_id3" => is_null($row["bg_reserve_money_id3"]) ? "" : $row["bg_reserve_money_id3"],
            "d_ap_reserve3" => empty($row["d_ap_reserve3"]) ? "" : $date->extDateBuddha($row["d_ap_reserve3"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, array());
    echo json_encode(array("totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "medsup_period_bill_flat") {
    // ================= รายการหลัก (กริด) : 1 แถวต่อ 1 งวด ================= //
    // ใช้กับเมนู "ส่งมอบงาน (เวชภัณฑ์)" - ต่างจาก type=medsup_period_bill ที่ group
    // รวมเป็น 1 แถวต่อสัญญา (hdr) ตรงนี้แสดงทุกงวดแยกแถวเลย ไม่ต้องดับเบิลคลิกเข้าไปดู
    // ไม่แสดงแถว PR ที่ยังไม่ได้ทำสัญญา (c_contract_code ยังว่าง - แถว "stub" จากเมนู
    // "การจัดทำ PR (หน่วยงาน) เวชภัณฑ์") เพราะ flow ต้องผ่าน "บันทึกรายละเอียดในสัญญา
    // (เวชภัณฑ์)" ก่อนเสมอ ถึงจะมีงวด/เอกสารให้ "ส่งมอบงาน" จริง (เหมือนที่แก้ไปแล้วกับ
    // type=medsup_period_bill ของกริดหลักฝั่งบันทึกรายละเอียดในสัญญา)
    $wh = " and s.i_enabled = 1 and s.c_contract_code is not null";
    if ($act == "SEARCH") {
        $wh .= (!empty($_REQUEST['c_contract_code'])) ? " and s.c_contract_code like '%" . $_REQUEST['c_contract_code'] . "%'" : "";
    }

    $sqlTempTable = "select s.sp_tor_period_bill_id
                     , row_number() over (order by s.sp_tor_period_bill_hdr_id DESC, s.i_period ASC) as row
                     from NMU_ERP.dbo.sp_tor_period_bill s
                     where 1=1 {$wh}";

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.row
                    , g.sp_tor_period_bill_id
                    , g.sp_tor_period_bill_hdr_id
                    , g.sp_tor_contract_id
                    , g.sp_tor_hdr_period_id
                    , g.c_contract_code
                    , g.i_period
                    , g.c_doc_ref
                    , convert(varchar, g.d_doc_dateSub, 120) as d_doc_dateSub
                    , g.f_period_amt
                    , g.c_detail
                    , g.dc_expense_budget_type_id_dtl
                    , g.c_fund_source_dtl
                    , g.f_fund_amt_dtl
                    , g.c_project_name
                    , g.c_contract_type
                    , g.po_expense_id
                    , g.c_expense_name
                    , g.i_budget_year
                    , g.c_po_no
                    , g.dc_creditor_id
                    , g.c_creditor_name
                    , g.c_tax_number_imp
                "
                . " from ({$sqlTempTable}) a "
                . " inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = a.sp_tor_period_bill_id"
                . " where a.row > ? and a.row <= ?"
                . " order by a.row";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => intval($row["row"]),
            "id" => intval($row["sp_tor_period_bill_id"]),
            "sp_tor_period_bill_id" => intval($row["sp_tor_period_bill_id"]),
            "sp_tor_period_bill_hdr_id" => intval($row["sp_tor_period_bill_hdr_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "i_period" => intval($row["i_period"]),
            "c_doc_ref" => $row["c_doc_ref"],
            "d_doc_dateSub" => empty($row["d_doc_dateSub"]) ? "" : $date->extDateBuddha($row["d_doc_dateSub"]),
            "f_period_amt" => number_format($row["f_period_amt"], 2),
            "c_detail" => $row["c_detail"],
            "dc_expense_budget_type_id_dtl" => intval($row["dc_expense_budget_type_id_dtl"]),
            "c_fund_source_dtl" => $row["c_fund_source_dtl"],
            "f_fund_amt_dtl" => is_null($row["f_fund_amt_dtl"]) ? "" : number_format($row["f_fund_amt_dtl"], 2),
            "c_project_name" => $row["c_project_name"],
            "c_contract_type" => $row["c_contract_type"],
            "po_expense_id" => intval($row["po_expense_id"]),
            "c_expense_name" => $row["c_expense_name"],
            // i_budget_year เก็บเป็น ค.ศ. (id ของ Ext.storeYearPeriodBill ฝั่ง JS) - แปลงเป็น
            // พ.ศ. ก่อนแสดงผล ให้ตรงกับธรรมเนียมการแสดงปีงบประมาณที่อื่นในระบบ
            "i_budget_year" => empty($row["i_budget_year"]) ? "" : intval($row["i_budget_year"]) + 543,
            "c_po_no" => $row["c_po_no"],
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "c_creditor_name" => $row["c_creditor_name"],
            "c_tax_number_imp" => $row["c_tax_number_imp"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, array());
    echo json_encode(array("totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "medsup_period_bill_dtl1") {
    // ================= รายละเอียดแต่ละแถว (ตอนเปิดแก้ไข) ================= //
    // ปกติกรองด้วย sp_tor_period_bill_hdr_id (แสดงทุกงวดของสัญญานั้น) - แต่ถ้าส่ง
    // sp_tor_period_bill_id มาด้วย (เมนู "ส่งมอบงาน (เวชภัณฑ์)" ที่ต้องการดูแค่งวดที่
    // เลือกงวดเดียว ไม่ใช่ทุกงวดของสัญญา) ให้กรองเฉพาะงวดนั้นแทน
    $rowId = $_REQUEST['sp_tor_period_bill_id'] ?? null;
    if (!empty($rowId)) {
        $arrParam[] = $rowId;
        $whDtl1 = "sp_tor_period_bill_id = ?";
    } else {
        $arrParam[] = $_REQUEST['sp_tor_period_bill_hdr_id'] ?? null;
        $whDtl1 = "sp_tor_period_bill_hdr_id = ?";
    }
    $sqlMain = "select sp_tor_period_bill_id, sp_tor_period_bill_hdr_id, sp_tor_contract_id, sp_tor_hdr_period_id
                    , c_contract_code, i_period, c_doc_ref
                    , convert(varchar, d_doc_dateSub, 120) as d_doc_dateSub
                    , f_period_amt, c_detail
                    , dc_expense_budget_type_id_dtl, c_fund_source_dtl, f_fund_amt_dtl
                from NMU_ERP.dbo.sp_tor_period_bill
                where {$whDtl1} and i_enabled = 1
                order by sp_tor_period_bill_id";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = 1;
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "row" => $i++,
            "id" => intval($row["sp_tor_period_bill_id"]),
            "sp_tor_period_bill_hdr_id" => intval($row["sp_tor_period_bill_hdr_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "i_period" => intval($row["i_period"]),
            "c_doc_ref" => $row["c_doc_ref"],
            "d_doc_dateSub" => empty($row["d_doc_dateSub"]) ? "" : $date->extDateBuddha($row["d_doc_dateSub"]),
            "f_period_amt" => number_format($row["f_period_amt"], 2),
            "c_detail" => $row["c_detail"],
            "dc_expense_budget_type_id_dtl" => intval($row["dc_expense_budget_type_id_dtl"]),
            "c_fund_source_dtl" => $row["c_fund_source_dtl"],
            "f_fund_amt_dtl" => is_null($row["f_fund_amt_dtl"]) ? "" : number_format($row["f_fund_amt_dtl"], 2),
        );
        ${$root}[] = $temp;
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "medsup_period_bill_receive") {
    // ================= รายการ "รับของ" ย่อยของงวดที่เลือก ================= //
    // ใช้กับเมนู "ส่งมอบงาน (เวชภัณฑ์)" - 1 งวดรับของทยอยได้หลายครั้ง (หลายแถว)
    $arrParam[] = $_REQUEST['sp_tor_period_bill_id'] ?? null;
    $sqlMain = "select sp_tor_period_bill_receive_id, sp_tor_period_bill_id
                    , c_receive_code
                    , convert(varchar, d_receive_date, 120) as d_receive_date
                    , c_detail, f_amt, c_ir_code
                    , convert(varchar, d_ir_issue, 120) as d_ir_issue
                    , c_ap_code
                    , convert(varchar, d_ap_issue, 120) as d_ap_issue
                from NMU_ERP.dbo.sp_tor_period_bill_receive
                where sp_tor_period_bill_id = ? and i_enabled = 1
                order by sp_tor_period_bill_receive_id";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "id" => intval($row["sp_tor_period_bill_receive_id"]),
            "sp_tor_period_bill_id" => intval($row["sp_tor_period_bill_id"]),
            "c_receive_code" => $row["c_receive_code"],
            "d_receive_date" => empty($row["d_receive_date"]) ? "" : $date->extDateBuddha($row["d_receive_date"]),
            "c_detail" => $row["c_detail"],
            "f_amt" => is_null($row["f_amt"]) ? "" : number_format($row["f_amt"], 2),
            "c_ir_code" => $row["c_ir_code"],
            "d_ir_issue" => empty($row["d_ir_issue"]) ? "" : $date->extDateBuddha($row["d_ir_issue"]),
            "c_ap_code" => $row["c_ap_code"],
            "d_ap_issue" => empty($row["d_ap_issue"]) ? "" : $date->extDateBuddha($row["d_ap_issue"]),
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "medsup_ir_pending_ap") {
    // ================= รายการที่ออกเลข IR แล้ว (เมนู "ตรวจรับ (เวชภัณฑ์)") ================= //
    // 1 แถว = 1 เลข IR (รวมยอด/จำนวนรายการของทุกแถวย่อยที่แชร์เลข IR เดียวกันเข้าด้วยกัน)
    // แสดงทั้งที่ยังไม่ออกเลข AP และออกไปแล้ว (ผู้ใช้ต้องการเห็นรายการที่ออกเลข AP ไป
    // แล้วในหน้านี้ด้วย ไม่ให้หายไปจากคิว - เดิมกรอง c_ap_code is null ออกไปเลย) คอลัมน์
    // "เลข AP"/"วันที่ออกเลข AP" ในกริดจะโชว์ค่าจริงถ้าออกไปแล้ว หรือว่างถ้ายังไม่ออก
    $wh = " and r.c_ir_code is not null and r.i_enabled = 1";
    // ค้นหาโดยเลขที่สัญญา (ค่าเริ่มต้น) หรือฟิลด์อื่นตามที่เลือกใน "ค้นหาโดย" - เผื่อ
    // ความเข้ากันได้แบบเดิม (SEARCH + c_contract_code) ให้ยังใช้ได้เหมือนเดิมด้วย
    // หมายเหตุ: ST0013 มี "เลขที่ตรวจรับ"/"เลขที่ใบเบิก" ในตัวเลือกนี้ด้วย แต่เมนูนี้ไม่มี
    // แนวคิดที่ตรงกัน (ไม่ออกเลขตรวจรับ/ไม่มีเลขที่ใบเบิกแยก) จึงไม่มีในนี้
    $searchByColumns = array(
        'c_contract_code' => 'g.c_contract_code',
        'c_ir_code' => 'r.c_ir_code',
        'c_creditor_name' => 'g.c_creditor_name',
        'c_tax_number_imp' => 'g.c_tax_number_imp',
        'c_overlap' => null, // จัดการแยกด้านล่าง (ต้องเช็ค 3 คอลัมน์)
    );
    $searchBy = $_REQUEST['search_by'] ?? 'c_contract_code';
    $searchText = $_REQUEST['search_text'] ?? ($_REQUEST['c_contract_code'] ?? '');
    if (!empty($searchText)) {
        $searchTextEsc = str_replace("'", "''", $searchText);
        if ($searchBy === 'c_overlap') {
            $wh .= " and (g.c_overlap like '%{$searchTextEsc}%' or g.c_overlap2 like '%{$searchTextEsc}%' or g.c_overlap3 like '%{$searchTextEsc}%')";
        } else {
            $col = $searchByColumns[$searchBy] ?? 'g.c_contract_code';
            $wh .= " and {$col} like '%{$searchTextEsc}%'";
        }
    }
    if (!empty($_REQUEST['c_ap_dept_type'])) {
        $wh .= " and isnull(g.c_ap_dept_type, 'APMS') = '" . str_replace("'", "''", $_REQUEST['c_ap_dept_type']) . "'";
    }
    if (!empty($_REQUEST['i_budget_year'])) {
        // ฟิลด์ค้นหารับเป็น พ.ศ. ตามที่แสดงในกริด - แปลงกลับเป็น ค.ศ. ก่อนเทียบกับ
        // g.i_budget_year ที่เก็บเป็น ค.ศ.
        $wh .= " and g.i_budget_year = " . (intval($_REQUEST['i_budget_year']) - 543);
    }
    if (!empty($_REQUEST['c_fund_source'])) {
        $wh .= " and g.c_fund_source_dtl = '" . str_replace("'", "''", $_REQUEST['c_fund_source']) . "'";
    }
    if (!empty($_REQUEST['c_contract_type'])) {
        $wh .= " and g.c_contract_type = '" . str_replace("'", "''", $_REQUEST['c_contract_type']) . "'";
    }
    if (isset($_REQUEST['i_reserved']) && $_REQUEST['i_reserved'] !== '') {
        // สถานะการจอง (AP-API) ต่อแหล่งเงิน - ไม่ว่างช่องใดช่องหนึ่งใน 3 แหล่งเงิน = จองแล้ว
        $wh .= $_REQUEST['i_reserved'] == '1'
            ? " and (g.bg_reserve_money_id is not null or g.bg_reserve_money_id2 is not null or g.bg_reserve_money_id3 is not null)"
            : " and g.bg_reserve_money_id is null and g.bg_reserve_money_id2 is null and g.bg_reserve_money_id3 is null";
    }
    if (isset($_REQUEST['i_checking_ready']) && $_REQUEST['i_checking_ready'] !== '') {
        $wh .= $_REQUEST['i_checking_ready'] == '1'
            ? " and exists (select 1 from NMU_ERP.dbo.sp_tor_period_bill_checking c2 where c2.c_ir_code = r.c_ir_code and c2.i_enabled = 1 and c2.c_disburse_detail is not null and ltrim(rtrim(c2.c_disburse_detail)) <> '')"
            : " and not exists (select 1 from NMU_ERP.dbo.sp_tor_period_bill_checking c2 where c2.c_ir_code = r.c_ir_code and c2.i_enabled = 1 and c2.c_disburse_detail is not null and ltrim(rtrim(c2.c_disburse_detail)) <> '')";
    }
    if (!empty($_REQUEST['i_budget_year_use'])) {
        $wh .= " and exists (select 1 from NMU_ERP.dbo.sp_tor_period_bill_checking c3 where c3.c_ir_code = r.c_ir_code and c3.i_enabled = 1 and c3.i_budget_year_use = " . intval($_REQUEST['i_budget_year_use']) . ")";
    }
    if (!empty($_REQUEST['own_only'])) {
        $wh .= " and r.dc_user_update_id = " . intval($_SESSION["user_id"] ?? 0);
    }

    $sqlTempTable = "select r.c_ir_code
                     , row_number() over (order by max(r.d_ir_issue) desc) as row
                     from NMU_ERP.dbo.sp_tor_period_bill_receive r
                     inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id
                     where 1=1 {$wh}
                     group by r.c_ir_code";

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.row
                    , r.c_ir_code
                    , max(r.sp_tor_period_bill_id) as sp_tor_period_bill_id
                    , max(g.c_contract_code) as c_contract_code
                    , max(g.c_project_name) as c_project_name
                    , max(g.c_expense_name) as c_expense_name
                    , max(g.i_period) as i_period
                    , max(g.i_budget_year) as i_budget_year
                    , max(g.c_ap_dept_type) as c_ap_dept_type
                    , max(g.c_overlap) as c_overlap
                    , max(g.i_budget_year_overlap) as i_budget_year_overlap
                    , max(g.c_overlap2) as c_overlap2
                    , max(g.i_budget_year_overlap2) as i_budget_year_overlap2
                    , max(g.c_overlap3) as c_overlap3
                    , max(g.i_budget_year_overlap3) as i_budget_year_overlap3
                    , count(*) as n_lines
                    , sum(r.f_amt) as f_total_amt
                    , convert(varchar, max(r.d_receive_date), 120) as d_receive_date_last
                    , convert(varchar, max(r.d_ir_issue), 120) as d_ir_issue
                    , max(r.c_ap_code) as c_ap_code
                    , convert(varchar, max(r.d_ap_issue), 120) as d_ap_issue
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id = max(r.dc_user_update_id)) as c_create_name
                    -- กรอกรายละเอียดตรวจรับ (รายการส่งเบิก) ครบหรือยัง - เงื่อนไขก่อน
                    -- ออกเลข AP ได้ (ดู mnMedSupPeriodBillReceiveController.php mode
                    -- SAVE_CHECKING/ISSUE_AP)
                    , max(case when chk.c_disburse_detail is not null and ltrim(rtrim(chk.c_disburse_detail)) <> '' then 1 else 0 end) as i_checking_ready
                    , max(chk.c_disburse_detail) as c_disburse_detail
                "
                . " from ({$sqlTempTable}) a "
                . " inner join NMU_ERP.dbo.sp_tor_period_bill_receive r on r.c_ir_code = a.c_ir_code and r.i_enabled = 1"
                . " inner join NMU_ERP.dbo.sp_tor_period_bill g on g.sp_tor_period_bill_id = r.sp_tor_period_bill_id"
                . " left join NMU_ERP.dbo.sp_tor_period_bill_checking chk on chk.c_ir_code = r.c_ir_code and chk.i_enabled = 1"
                . " where a.row > ? and a.row <= ?"
                . " group by a.row, r.c_ir_code"
                . " order by a.row";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            // JsonStore idProperty ใช้ c_ir_code ตรงๆ ได้เลย (เป็น string unique อยู่แล้ว
            // ไม่มี id เชิงตัวเลขระดับกลุ่มจริงๆ ในฐานข้อมูล)
            "id" => $row["c_ir_code"],
            "c_ir_code" => $row["c_ir_code"],
            "sp_tor_period_bill_id" => intval($row["sp_tor_period_bill_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "c_project_name" => $row["c_project_name"],
            "c_expense_name" => $row["c_expense_name"],
            "i_period" => intval($row["i_period"]),
            "i_budget_year" => empty($row["i_budget_year"]) ? "" : intval($row["i_budget_year"]) + 543,
            "c_ap_dept_type" => empty($row["c_ap_dept_type"]) ? "APMS" : $row["c_ap_dept_type"],
            // เลขที่ใบกันเหลื่อม/ปีงบประมาณของใบกันเหลื่อม (ถ้ามี) - เอาไว้ให้ฟอร์ม
            // "รายละเอียดตรวจรับ" เปลี่ยนช่อง "ใช้เงินปีงบประมาณ" ให้ตรงกับที่บันทึกไว้
            // จริงตอนบันทึกรายละเอียดสัญญา (มีได้สูงสุด 3 แหล่งเงิน เอาแหล่งแรกที่มีค่า)
            // i_budget_year_overlap[n] เก็บเป็น ค.ศ. เหมือน i_budget_year หลัก - แปลงเป็น
            // พ.ศ. ก่อนส่งออก (จุดนี้เท่านั้น - ไม่แตะ query "medsup_period_bill" เดิมที่
            // ใช้ค่า ค.ศ. ดิบภายในของมันเอง)
            "c_overlap" => $row["c_overlap"],
            "i_budget_year_overlap" => empty($row["i_budget_year_overlap"]) ? "" : intval($row["i_budget_year_overlap"]) + 543,
            "c_overlap2" => $row["c_overlap2"],
            "i_budget_year_overlap2" => empty($row["i_budget_year_overlap2"]) ? "" : intval($row["i_budget_year_overlap2"]) + 543,
            "c_overlap3" => $row["c_overlap3"],
            "i_budget_year_overlap3" => empty($row["i_budget_year_overlap3"]) ? "" : intval($row["i_budget_year_overlap3"]) + 543,
            "n_lines" => intval($row["n_lines"]),
            // ออกเลข AP แล้วและมีรายการส่งเบิกบันทึกไว้ - โชว์รายการส่งเบิกแทน "N รายการ"
            // (ตามที่ผู้ใช้ระบุ) ถ้ายังไม่ออกเลข AP ยังคงโชว์ "N รายการ" ที่มาจาก IR ดิบ
            // เหมือนเดิม
            "c_detail" => (!empty($row["c_ap_code"]) && !empty($row["c_disburse_detail"]))
                ? $row["c_disburse_detail"]
                : $row["n_lines"] . " รายการ",
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "d_receive_date_last" => empty($row["d_receive_date_last"]) ? "" : $date->extDateBuddha($row["d_receive_date_last"]),
            "d_ir_issue" => empty($row["d_ir_issue"]) ? "" : $date->extDateBuddha($row["d_ir_issue"]),
            "c_create_name" => $row["c_create_name"],
            "i_checking_ready" => intval($row["i_checking_ready"]),
            // แสดงเลข AP จริงถ้าออกไปแล้ว (แถวนี้ไม่ได้ถูกกรองออกจากกริดอีกต่อไปหลังออก
            // เลข AP - ผู้ใช้ต้องการให้ยังเห็นรายการที่ทำเสร็จแล้วค้างอยู่ในหน้านี้ด้วย)
            "c_ap_code" => $row["c_ap_code"],
            "d_ap_issue" => empty($row["d_ap_issue"]) ? "" : $date->extDateBuddha($row["d_ap_issue"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, array());
    echo json_encode(array("totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "medsup_ap_filter_lookup") {
    // ================= ตัวเลือกของแถบค้นหา/กรองในเมนู "ตรวจรับ (เวชภัณฑ์)" ================= //
    // ดึงค่าที่มีอยู่จริงในข้อมูล (ไม่ใช่ master list กลาง) มาให้เลือกกรอง: แหล่งเงิน,
    // ปีงบประมาณ (ของสัญญา), ปีที่ใช้ประมาณ (ที่เคยกรอกไว้ในฟอร์มตรวจรับ)
    $fundSources = array();
    $stmtFund = $db->QueryParam(
        "select distinct c_fund_source_dtl from NMU_ERP.dbo.sp_tor_period_bill
         where dc_cost_id = 82 and i_enabled = 1 and c_fund_source_dtl is not null and ltrim(rtrim(c_fund_source_dtl)) <> ''
         order by c_fund_source_dtl",
        array()
    );
    while ($rowFund = $db->Fetch($stmtFund)) {
        $fundSources[] = $rowFund["c_fund_source_dtl"];
    }

    $budgetYears = array();
    $stmtYear = $db->QueryParam(
        "select distinct i_budget_year from NMU_ERP.dbo.sp_tor_period_bill
         where dc_cost_id = 82 and i_enabled = 1 and i_budget_year is not null
         order by i_budget_year desc",
        array()
    );
    while ($rowYear = $db->Fetch($stmtYear)) {
        $budgetYears[] = intval($rowYear["i_budget_year"]) + 543;
    }

    $budgetYearsUse = array();
    $stmtYearUse = $db->QueryParam(
        "select distinct i_budget_year_use from NMU_ERP.dbo.sp_tor_period_bill_checking
         where i_enabled = 1 and i_budget_year_use is not null
         order by i_budget_year_use desc",
        array()
    );
    while ($rowYearUse = $db->Fetch($stmtYearUse)) {
        $budgetYearsUse[] = intval($rowYearUse["i_budget_year_use"]);
    }

    echo json_encode(array(
        "fund_sources" => $fundSources,
        "budget_years" => $budgetYears,
        "budget_years_use" => $budgetYearsUse,
    ));
    exit();
} else if ($type == "medsup_receive_by_ir") {
    // ================= รายการย่อยจริงภายใต้เลข IR หนึ่งๆ (ดับเบิลคลิกดูรายละเอียด) ================= //
    // ใช้กับเมนู "ตรวจรับ (เวชภัณฑ์)" - อ่านอย่างเดียว (แก้ไข/ลบรายการย่อยทำที่เมนู
    // "ส่งมอบงาน (เวชภัณฑ์)" เท่านั้น)
    $arrParam[] = $_REQUEST['c_ir_code'] ?? null;
    $sqlMain = "select sp_tor_period_bill_receive_id, c_receive_code
                    , convert(varchar, d_receive_date, 120) as d_receive_date
                    , c_detail, f_amt
                from NMU_ERP.dbo.sp_tor_period_bill_receive
                where c_ir_code = ? and i_enabled = 1
                order by sp_tor_period_bill_receive_id";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "id" => intval($row["sp_tor_period_bill_receive_id"]),
            "c_receive_code" => $row["c_receive_code"],
            "d_receive_date" => empty($row["d_receive_date"]) ? "" : $date->extDateBuddha($row["d_receive_date"]),
            "c_detail" => $row["c_detail"],
            "f_amt" => is_null($row["f_amt"]) ? "" : number_format($row["f_amt"], 2),
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "medsup_checking_by_ir") {
    // ================= รายละเอียดตรวจรับที่เคยบันทึกไว้ของเลข IR หนึ่งๆ (ถ้ามี) ================= //
    // ใช้เปิดฟอร์ม "รายละเอียดตรวจรับ" ที่เมนู "ตรวจรับ (เวชภัณฑ์)" - ไม่มีแถวคืนค่า
    // แปลว่ายังไม่เคยกรอก (ฟอร์มฝั่ง JS จะเติมค่าเริ่มต้นเอาเอง)
    $arrParam[] = $_REQUEST['c_ir_code'] ?? null;
    $sqlMain = "select c_ir_code
                    , convert(varchar, d_doc_complete, 120) as d_doc_complete
                    , convert(varchar, d_checking, 120) as d_checking
                    , c_egp_no, c_disburse_detail, i_budget_year_use
                    , f_total_vat, b_vat, f_vat_percent, f_before_vat, f_vat_amt, f_request_amt
                    , b_wht, f_wht_percent, f_wht_amt, f_penalty
                    , b_guarantee, f_guarantee_percent, f_guarantee_amt, f_other, f_pay_amt
                    , dc_cost_responsible_id, dc_cost_owner_id
                    , c_overlap_no, i_budget_year_ref, c_item_name
                from NMU_ERP.dbo.sp_tor_period_bill_checking
                where c_ir_code = ? and i_enabled = 1";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $row = $db->Fetch($stmt);
    if ($row) {
        ${$root}[] = array(
            "c_ir_code" => $row["c_ir_code"],
            "d_doc_complete" => empty($row["d_doc_complete"]) ? "" : $date->extDateBuddha($row["d_doc_complete"]),
            "d_checking" => empty($row["d_checking"]) ? "" : $date->extDateBuddha($row["d_checking"]),
            "c_egp_no" => $row["c_egp_no"],
            "c_disburse_detail" => $row["c_disburse_detail"],
            // เก็บเป็น พ.ศ. ตรงๆ ตามที่ผู้ใช้เลือก (ไม่แปลง ค.ศ.<->พ.ศ. ต่างจาก
            // sp_tor_period_bill.i_budget_year ที่เก็บเป็น ค.ศ.)
            "i_budget_year_use" => empty($row["i_budget_year_use"]) ? "" : intval($row["i_budget_year_use"]),
            "f_total_vat" => is_null($row["f_total_vat"]) ? "" : number_format($row["f_total_vat"], 2),
            "b_vat" => intval($row["b_vat"]),
            "f_vat_percent" => $row["f_vat_percent"],
            "f_wht_percent" => $row["f_wht_percent"],
            "b_wht" => intval($row["b_wht"]),
            "f_penalty" => is_null($row["f_penalty"]) ? "0.00" : number_format($row["f_penalty"], 2),
            "b_guarantee" => intval($row["b_guarantee"]),
            "f_guarantee_percent" => $row["f_guarantee_percent"],
            "f_other" => is_null($row["f_other"]) ? "0.00" : number_format($row["f_other"], 2),
            "dc_cost_responsible_id" => intval($row["dc_cost_responsible_id"]),
            "dc_cost_owner_id" => intval($row["dc_cost_owner_id"]),
            "c_overlap_no" => $row["c_overlap_no"],
            "i_budget_year_ref" => empty($row["i_budget_year_ref"]) ? "" : intval($row["i_budget_year_ref"]),
            "c_item_name" => $row["c_item_name"],
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "medsup_pr_list") {
    // ================= รายการ PR ที่ยังไม่ผูกสัญญา (เมนู "การจัดทำ PR (หน่วยงาน)
    // เวชภัณฑ์" - regTorMedSup.js) ================= //
    // แถวที่สร้างจากเมนูนี้ (mode ADD_PR) จะมี c_contract_code เป็น NULL เสมอ (ยังไม่มี
    // สัญญาจริง) พอเมนู "บันทึกรายละเอียดในสัญญา (เวชภัณฑ์)" เลือกไปทำสัญญาต่อแล้ว
    // c_contract_code จะถูกเติมทับ แถวนั้นก็จะหลุดออกจากรายการนี้ไปเอง
    $wh = " and s.i_enabled = 1 and s.c_contract_code is null";
    if ($act == "SEARCH") {
        $wh .= (!empty($_REQUEST['c_project_name'])) ? " and s.c_project_name like '%" . $_REQUEST['c_project_name'] . "%'" : "";
    }
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select row_number() over (order by s.sp_tor_period_bill_id desc) as row
                    , s.sp_tor_period_bill_id, s.sp_tor_period_bill_hdr_id
                    , s.c_pr_code, s.c_project_name, s.i_budget_year, s.c_ap_dept_type, s.i_type_bg
                    , s.dc_cost_id
                    , s.po_expense_id, s.c_expense_name
                    , s.dc_expense_budget_type_id, s.c_fund_source, s.f_fund_amt, s.i_pr_type
                    , s.dc_expense_budget_type_id2, s.c_fund_source2, s.f_fund_amt2, s.i_pr_type2
                    , s.dc_expense_budget_type_id3, s.c_fund_source3, s.f_fund_amt3, s.i_pr_type3
                    , s.i_purchase, s.i_product_type
                    , s.c_pr_doc_ref, convert(varchar, s.d_pr_doc_ref, 120) as d_pr_doc_ref
                    , convert(varchar, s.d_create, 120) as d_create
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id = s.dc_user_create_id) as c_create_name
                from NMU_ERP.dbo.sp_tor_period_bill s
                where 1=1 {$wh}";
    $sqlCount = "select count(*) as n from NMU_ERP.dbo.sp_tor_period_bill s where 1=1 {$wh}";
    $totalCount = $db->GetDataBySQL($sqlCount, array());
    $sqlPaged = "select * from ({$sqlMain}) a where a.row > ? and a.row <= ? order by a.row";
    $stmt = $db->QueryParam($sqlPaged, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "no" => intval($row["row"]),
            "id" => intval($row["sp_tor_period_bill_id"]),
            "sp_tor_period_bill_id" => intval($row["sp_tor_period_bill_id"]),
            "sp_tor_period_bill_hdr_id" => intval($row["sp_tor_period_bill_hdr_id"]),
            "c_pr_code" => $row["c_pr_code"],
            "c_project_name" => $row["c_project_name"],
            "i_budget_year" => empty($row["i_budget_year"]) ? "" : intval($row["i_budget_year"]) + 543,
            "c_ap_dept_type" => $row["c_ap_dept_type"],
            "i_type_bg" => isset($row["i_type_bg"]) ? intval($row["i_type_bg"]) : 1,
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "po_expense_id" => intval($row["po_expense_id"]),
            "c_expense_name" => $row["c_expense_name"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "c_fund_source" => $row["c_fund_source"],
            "f_fund_amt" => is_null($row["f_fund_amt"]) ? "" : number_format($row["f_fund_amt"], 2),
            "i_pr_type" => isset($row["i_pr_type"]) ? intval($row["i_pr_type"]) : 1,
            "dc_expense_budget_type_id2" => intval($row["dc_expense_budget_type_id2"]),
            "c_fund_source2" => $row["c_fund_source2"],
            "f_fund_amt2" => is_null($row["f_fund_amt2"]) ? "" : number_format($row["f_fund_amt2"], 2),
            "i_pr_type2" => isset($row["i_pr_type2"]) ? intval($row["i_pr_type2"]) : null,
            "dc_expense_budget_type_id3" => intval($row["dc_expense_budget_type_id3"]),
            "c_fund_source3" => $row["c_fund_source3"],
            "f_fund_amt3" => is_null($row["f_fund_amt3"]) ? "" : number_format($row["f_fund_amt3"], 2),
            "i_pr_type3" => isset($row["i_pr_type3"]) ? intval($row["i_pr_type3"]) : null,
            "i_purchase" => isset($row["i_purchase"]) ? intval($row["i_purchase"]) : 1,
            "i_product_type" => isset($row["i_product_type"]) ? intval($row["i_product_type"]) : null,
            "c_pr_doc_ref" => $row["c_pr_doc_ref"],
            "d_pr_doc_ref" => empty($row["d_pr_doc_ref"]) ? "" : $date->extDateBuddha($row["d_pr_doc_ref"]),
            "d_create" => $row["d_create"],
            "c_create_name" => $row["c_create_name"],
        );
    }
    echo json_encode(array($root => ${$root}, "totalCount" => intval($totalCount)));
    exit();
} else if ($type == "lookup_contract") {
    // ================= ค้นหาสัญญา (combo เลขที่สัญญา) ================= //
    // ดึงข้อมูล PO/ผู้ขาย/วันที่เริ่ม-สิ้นสุดสัญญา มาแสดงเป็น reference ด้วย (ตาม
    // field เดียวกับที่กริดหลักเมนู "บันทึกรายละเอียดในสัญญา" ใช้: d_doc_date =
    // วันที่เริ่มสัญญา, d_due_date = วันที่สิ้นสุดสัญญา, c_tax_number_imp = เลขผู้เสียภาษี)
    $q = $_REQUEST['query'] ?? '';
    $arrParam[] = "%{$q}%";
    $sqlMain = "select top 30 c.sp_tor_contract_id, c.sp_tor_id, c.c_code as c_contract_code, c.c_name, c.i_yyyy
                    , c.c_po_no, convert(varchar, c.d_po_date, 120) as d_po_date
                    , convert(varchar, c.d_doc_date, 120) as d_start_date
                    , convert(varchar, c.d_due_date, 120) as d_end_date
                    , c.dc_creditor_id, cr.c_name as c_creditor_name, cr.c_tax_number_imp as c_creditor_tax_no
                from NMU_ERP.dbo.sp_tor_contract c
                left join NMU.dbo.dc_creditor cr on cr.dc_creditor_id = c.dc_creditor_id
                where isnull(c.i_enabled,1) = 1 and c.c_code like ?
                order by c.c_code desc";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            // pr_id ของ AP-API - ใช้ตอนกด "จองเงิน" (ต้องมี PR ต้นทางจริงในระบบ)
            "sp_tor_id" => intval($row["sp_tor_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "c_name" => $row["c_name"],
            "i_yyyy" => $row["i_yyyy"],
            "c_po_no" => $row["c_po_no"],
            "d_po_date" => empty($row["d_po_date"]) ? "" : $date->extDateBuddha($row["d_po_date"]),
            "d_start_date" => empty($row["d_start_date"]) ? "" : $date->extDateBuddha($row["d_start_date"]),
            "d_end_date" => empty($row["d_end_date"]) ? "" : $date->extDateBuddha($row["d_end_date"]),
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "c_creditor_name" => $row["c_creditor_name"],
            "c_creditor_tax_no" => $row["c_creditor_tax_no"],
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "lookup_creditor") {
    // ================= ค้นหาผู้ขาย/ผู้รับจ้าง (combo ผู้ขาย) ================= //
    $q = $_REQUEST['query'] ?? '';
    $arrParam[] = "%{$q}%";
    $arrParam[] = "%{$q}%";
    $sqlMain = "select top 30 dc_creditor_id, c_code, c_name, c_tax_number_imp as c_tax_no
                from NMU.dbo.dc_creditor
                where isnull(i_enable,1) = 1 and (c_name like ? or c_tax_number_imp like ?)
                order by c_name";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "c_code" => $row["c_code"],
            "c_name" => $row["c_name"],
            "c_tax_no" => $row["c_tax_no"],
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "lookup_period") {
    // ================= งวดที่ของสัญญาที่เลือก ================= //
    $arrParam[] = $_REQUEST['sp_tor_contract_id'] ?? 0;
    $sqlMain = "select sp_tor_hdr_period_id, i_period, sp_tor_contract_id, i_yyyy
                from NMU_ERP.dbo.sp_tor_hdr_period
                where sp_tor_contract_id = ? and isnull(i_enabled,1) = 1
                order by i_period";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "i_period" => intval($row["i_period"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_yyyy" => $row["i_yyyy"],
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
}

echo json_encode(array($root => array()));
exit();
