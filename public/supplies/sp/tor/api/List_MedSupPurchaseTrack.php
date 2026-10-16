<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();

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

if ($type == "medsup_purchase_track") {
    $wh = " and s.i_enabled = 1";
    if ($act == "SEARCH") {
        $wh .= (!empty($_REQUEST['c_pr_no'])) ? " and s.c_pr_no like '%" . $_REQUEST['c_pr_no'] . "%'" : "";
        $wh .= (!empty($_REQUEST['c_po_no'])) ? " and s.c_po_no like '%" . $_REQUEST['c_po_no'] . "%'" : "";
    }

    $sqlTempTable = "select s.sp_medsup_purchase_track_id
                     , row_number() over (order by s.sp_medsup_purchase_track_id DESC) as row
                     from NMU_ERP.dbo.sp_medsup_purchase_track s
                     where 1=1 {$wh}";

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.row
                    , s.sp_medsup_purchase_track_id
                    , s.sp_tor_contract_id, s.sp_tor_hdr_period_id, s.c_contract_code, s.i_period
                    , s.c_user_name, s.c_pr_no, convert(varchar, s.d_pr_date, 120) as d_pr_date, s.f_pr_amt, s.f_remain_all
                    , s.c_approve_no, convert(varchar, s.d_approve_date, 120) as d_approve_date
                    , s.c_po_no, convert(varchar, s.d_po_date, 120) as d_po_date
                    , s.dc_creditor_id, s.c_creditor_name, s.c_creditor_tax_no
                    , convert(varchar, s.d_due_date, 120) as d_due_date
                    , convert(varchar, s.d_receive_date, 120) as d_receive_date
                    , convert(varchar, s.d_withdraw_send_date, 120) as d_withdraw_send_date
                    , s.c_withdraw_no, s.f_withdraw_amt, s.f_remain_after_withdraw
                    , s.c_reserve_no, s.i_working_day, s.c_project_no, s.c_bill_no, s.c_item_name
                    , convert(varchar, s.d_create, 120) as d_create
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id = s.dc_user_create_id) as c_create_name
                "
                . " from ({$sqlTempTable}) a "
                . " inner join NMU_ERP.dbo.sp_medsup_purchase_track s on s.sp_medsup_purchase_track_id = a.sp_medsup_purchase_track_id"
                . " where a.row > ? and a.row <= ?";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => intval($row["row"]),
            "id" => intval($row["sp_medsup_purchase_track_id"]),
            "sp_medsup_purchase_track_id" => intval($row["sp_medsup_purchase_track_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "i_period" => intval($row["i_period"]),
            "c_user_name" => $row["c_user_name"],
            "c_pr_no" => $row["c_pr_no"],
            "d_pr_date" => empty($row["d_pr_date"]) ? "" : $date->extDateBuddha($row["d_pr_date"]),
            "f_pr_amt" => is_null($row["f_pr_amt"]) ? "" : number_format($row["f_pr_amt"], 2),
            "f_remain_all" => is_null($row["f_remain_all"]) ? "" : number_format($row["f_remain_all"], 2),
            "c_approve_no" => $row["c_approve_no"],
            "d_approve_date" => empty($row["d_approve_date"]) ? "" : $date->extDateBuddha($row["d_approve_date"]),
            "c_po_no" => $row["c_po_no"],
            "d_po_date" => empty($row["d_po_date"]) ? "" : $date->extDateBuddha($row["d_po_date"]),
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "c_creditor_name" => $row["c_creditor_name"],
            "c_creditor_tax_no" => $row["c_creditor_tax_no"],
            "d_due_date" => empty($row["d_due_date"]) ? "" : $date->extDateBuddha($row["d_due_date"]),
            "d_receive_date" => empty($row["d_receive_date"]) ? "" : $date->extDateBuddha($row["d_receive_date"]),
            "d_withdraw_send_date" => empty($row["d_withdraw_send_date"]) ? "" : $date->extDateBuddha($row["d_withdraw_send_date"]),
            "c_withdraw_no" => $row["c_withdraw_no"],
            "f_withdraw_amt" => is_null($row["f_withdraw_amt"]) ? "" : number_format($row["f_withdraw_amt"], 2),
            "f_remain_after_withdraw" => is_null($row["f_remain_after_withdraw"]) ? "" : number_format($row["f_remain_after_withdraw"], 2),
            "c_reserve_no" => $row["c_reserve_no"],
            "i_working_day" => intval($row["i_working_day"]),
            "c_project_no" => $row["c_project_no"],
            "c_bill_no" => $row["c_bill_no"],
            "c_item_name" => $row["c_item_name"],
            "d_create" => empty($row["d_create"]) ? "" : $date->extDateBuddha($row["d_create"]),
            "c_create_name" => $row["c_create_name"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, array());
    echo json_encode(array("totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "lookup_contract") {
    // ดึง PO/ผู้ขาย/วันที่เริ่ม-สิ้นสุดสัญญามาแสดงเป็น reference ด้วย (field เดียวกับ
    // ที่กริดหลักเมนู "บันทึกรายละเอียดในสัญญา" ใช้ - ไม่ต้องคีย์ซ้ำในฟอร์มนี้)
    $q = $_REQUEST['query'] ?? '';
    $arrParam[] = "%{$q}%";
    $sqlMain = "select top 30 c.sp_tor_contract_id, c.c_code as c_contract_code, c.c_name, c.i_yyyy
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
} else if ($type == "lookup_period") {
    $arrParam[] = $_REQUEST['sp_tor_contract_id'] ?? 0;
    $sqlMain = "select sp_tor_hdr_period_id, i_period, sp_tor_contract_id
                from NMU_ERP.dbo.sp_tor_hdr_period
                where sp_tor_contract_id = ? and isnull(i_enabled,1) = 1
                order by i_period";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "i_period" => intval($row["i_period"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "lookup_bills") {
    // ================= รายการบิล (จาก ST00092) ของสัญญา/งวดที่เลือก ให้ติ๊กเลือก ================= //
    $arrParam[] = $_REQUEST['sp_tor_contract_id'] ?? 0;
    $arrParam[] = $_REQUEST['sp_tor_hdr_period_id'] ?? 0;
    $sqlMain = "select sp_tor_period_bill_id, c_doc_ref, convert(varchar, d_doc_date, 120) as d_doc_date, f_amt, c_detail
                from NMU_ERP.dbo.sp_tor_period_bill
                where sp_tor_contract_id = ? and sp_tor_hdr_period_id = ? and i_enabled = 1
                order by sp_tor_period_bill_id";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "sp_tor_period_bill_id" => intval($row["sp_tor_period_bill_id"]),
            "c_doc_ref" => $row["c_doc_ref"],
            "d_doc_date" => empty($row["d_doc_date"]) ? "" : $date->extDateBuddha($row["d_doc_date"]),
            "f_amt" => is_null($row["f_amt"]) ? "" : number_format($row["f_amt"], 2),
            "c_detail" => $row["c_detail"],
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "medsup_purchase_track_bills_dtl") {
    // ================= sp_tor_period_bill_id ที่เคยเลือกไว้แล้ว (ตอนเปิดแก้ไข) ================= //
    $arrParam[] = $_REQUEST['sp_medsup_purchase_track_id'] ?? 0;
    $sqlMain = "select sp_tor_period_bill_id
                from NMU_ERP.dbo.sp_medsup_purchase_track_bill
                where sp_medsup_purchase_track_id = ?";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array("sp_tor_period_bill_id" => intval($row["sp_tor_period_bill_id"]));
    }
    echo json_encode(array($root => ${$root}));
    exit();
}

echo json_encode(array($root => array()));
exit();
