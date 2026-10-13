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

if ($type == "medsup_ir_confirm") {
    $wh = " and s.i_enabled = 1";
    if ($act == "SEARCH") {
        $wh .= (!empty($_REQUEST['c_contract_code'])) ? " and s.c_contract_code like '%" . $_REQUEST['c_contract_code'] . "%'" : "";
        $wh .= (!empty($_REQUEST['c_arrive_code'])) ? " and s.c_arrive_code like '%" . $_REQUEST['c_arrive_code'] . "%'" : "";
    }

    $sqlTempTable = "select s.sp_medsup_ir_confirm_hdr_id
                     , row_number() over (order by s.sp_medsup_ir_confirm_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_medsup_ir_confirm_hdr s
                     where 1=1 {$wh}";

    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.row
                    , s.sp_medsup_ir_confirm_hdr_id
                    , s.pr_id, s.po_id, s.period_id, s.chk_id
                    , s.c_contract_code
                    , convert(varchar, s.d_start_date, 120) as d_start_date
                    , convert(varchar, s.d_contract_start_date, 120) as d_contract_start_date
                    , convert(varchar, s.d_end_date, 120) as d_end_date
                    , s.i_period, s.f_period_amt
                    , s.bg_expense_id, s.bg_expense_name
                    , s.dc_expense_budget_type_id, s.dc_expense_budget_type_name
                    , s.i_is_last, s.i_product_type
                    , s.dc_cost_id, s.c_tax_number_imp
                    , s.dc_creditor_id, s.c_creditor_name
                    , s.c_creditor_transfer_code, s.dc_creditor_transfer_id, s.c_creditor_transfer_name
                    , s.c_bank_acc_creditor
                    , s.i_budget_year, s.i_budget_year_overlap
                    , s.c_arrive_code
                    , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                    , convert(varchar, s.d_checking_date, 120) as d_checking_date
                    , s.c_reserve_pay, s.c_doc_duo, s.c_doc_ref, s.c_overlap
                    , s.c_ap_send_status
                    , convert(varchar, s.d_create, 120) as d_create
                    , (select top 1 c_full_name from dbo.dc_user where dc_user_id = s.dc_user_create_id) as c_create_name
                "
                . " from ({$sqlTempTable}) a "
                . " inner join NMU_ERP.dbo.sp_medsup_ir_confirm_hdr s on s.sp_medsup_ir_confirm_hdr_id = a.sp_medsup_ir_confirm_hdr_id"
                . " where a.row > ? and a.row <= ?";

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => intval($row["row"]),
            "id" => intval($row["sp_medsup_ir_confirm_hdr_id"]),
            "sp_medsup_ir_confirm_hdr_id" => intval($row["sp_medsup_ir_confirm_hdr_id"]),
            "pr_id" => intval($row["pr_id"]),
            "po_id" => intval($row["po_id"]),
            "period_id" => intval($row["period_id"]),
            "chk_id" => intval($row["chk_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "d_start_date" => empty($row["d_start_date"]) ? "" : $date->extDateBuddha($row["d_start_date"]),
            "d_contract_start_date" => empty($row["d_contract_start_date"]) ? "" : $date->extDateBuddha($row["d_contract_start_date"]),
            "d_end_date" => empty($row["d_end_date"]) ? "" : $date->extDateBuddha($row["d_end_date"]),
            "i_period" => intval($row["i_period"]),
            "f_period_amt" => is_null($row["f_period_amt"]) ? "" : number_format($row["f_period_amt"], 2),
            "bg_expense_id" => intval($row["bg_expense_id"]),
            "bg_expense_name" => $row["bg_expense_name"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type_name" => $row["dc_expense_budget_type_name"],
            "i_is_last" => intval($row["i_is_last"]),
            "i_product_type" => intval($row["i_product_type"]),
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "c_tax_number_imp" => $row["c_tax_number_imp"],
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "c_creditor_name" => $row["c_creditor_name"],
            "c_creditor_transfer_code" => $row["c_creditor_transfer_code"],
            "dc_creditor_transfer_id" => intval($row["dc_creditor_transfer_id"]),
            "c_creditor_transfer_name" => $row["c_creditor_transfer_name"],
            "c_bank_acc_creditor" => $row["c_bank_acc_creditor"],
            "i_budget_year" => $row["i_budget_year"],
            "i_budget_year_overlap" => $row["i_budget_year_overlap"],
            "c_arrive_code" => $row["c_arrive_code"],
            "d_arrive_date" => empty($row["d_arrive_date"]) ? "" : $date->extDateBuddha($row["d_arrive_date"]),
            "d_checking_date" => empty($row["d_checking_date"]) ? "" : $date->extDateBuddha($row["d_checking_date"]),
            "c_reserve_pay" => $row["c_reserve_pay"],
            "c_doc_duo" => $row["c_doc_duo"],
            "c_doc_ref" => $row["c_doc_ref"],
            "c_overlap" => $row["c_overlap"],
            "c_ap_send_status" => $row["c_ap_send_status"],
            "d_create" => empty($row["d_create"]) ? "" : $date->extDateBuddha($row["d_create"]),
            "c_create_name" => $row["c_create_name"],
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, array());
    echo json_encode(array("totalCount" => $totalCount, $root => ${$root}));
    exit();
} else if ($type == "medsup_ir_confirm_dtl") {
    // ================= line_ids ที่เคยบันทึกไว้แล้ว (ตอนเปิดแก้ไข) ================= //
    $arrParam[] = $_REQUEST['sp_medsup_ir_confirm_hdr_id'] ?? 0;
    $sqlMain = "select sp_medsup_ir_confirm_dtl_id, chk_line_id, c_doc_ref
                    , convert(varchar, d_doc_dateSub, 120) as d_doc_dateSub
                    , f_period_amt
                from NMU_ERP.dbo.sp_medsup_ir_confirm_dtl
                where sp_medsup_ir_confirm_hdr_id = ?
                order by sp_medsup_ir_confirm_dtl_id";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "sp_medsup_ir_confirm_dtl_id" => intval($row["sp_medsup_ir_confirm_dtl_id"]),
            "chk_line_id" => intval($row["chk_line_id"]),
            "c_doc_ref" => $row["c_doc_ref"],
            "d_doc_dateSub" => empty($row["d_doc_dateSub"]) ? "" : $date->extDateBuddha($row["d_doc_dateSub"]),
            "f_period_amt" => is_null($row["f_period_amt"]) ? "" : number_format($row["f_period_amt"], 2),
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
} else if ($type == "pending_erp_log") {
    // ================= โหลดรายการที่ ERP ยิงเข้ามาจริง (ยังไม่เคยยืนยัน) =================
    // อ่าน log ของ endpoint /procure/ir ที่ D:\EIS-ERP\storage\jsonERP\*.log (บรรทัดละ
    // 1 JSON object) เอาเฉพาะ INCOMING_REQUEST ที่ body.username = erpsendapi (ของจริง
    // จาก ERP เท่านั้น ไม่เอา AUTH_FAILED/การเรียกทดสอบอื่นๆ) - ไฟล์นี้ "อ่านอย่างเดียว"
    // ไม่มีการเขียน/ลบไฟล์ log ใดๆ ทั้งสิ้น
    $candidates = array();
    $files = is_dir(PATH_JSON_ERP_LOG) ? glob(PATH_JSON_ERP_LOG . DIRECTORY_SEPARATOR . "*.log") : array();
    if ($files) {
        foreach ($files as $file) {
            $lines = @file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
            if (!$lines) {
                continue;
            }
            foreach ($lines as $line) {
                $entry = json_decode($line, true);
                if (!is_array($entry) || ($entry['type'] ?? '') !== 'INCOMING_REQUEST') {
                    continue;
                }
                $body = $entry['data']['body'] ?? null;
                if (!is_array($body) || ($body['username'] ?? '') !== 'erpsendapi' || !is_array($body['data'] ?? null)) {
                    continue;
                }
                foreach ($body['data'] as $idx => $item) {
                    if (!is_array($item)) {
                        continue;
                    }
                    // คีย์ธุรกิจของรายการ (pr/po/chk/เลขที่ใบรับของ) ใช้กันข้อมูลซ้ำตอน
                    // ERP ยิง retry ชุดเดิมหลายครั้ง (พบจริงใน log - auth ไม่ผ่านแล้วยิงซ้ำ)
                    // เก็บไว้แค่ transaction ล่าสุดต่อคีย์เดียวกัน
                    $key = intval($item['pr_id'] ?? 0) . '|' . intval($item['po_id'] ?? 0) . '|'
                        . intval($item['chk_id'] ?? 0) . '|' . trim((string) ($item['c_arrive_code'] ?? ''));
                    $candidate = array(
                        "transaction_id" => (string) ($entry['transaction_id'] ?? ''),
                        "datetime" => (string) ($entry['datetime'] ?? ''),
                        "source_file" => basename($file),
                        "item" => $item,
                    );
                    if (!isset($candidates[$key]) || $candidate['datetime'] > $candidates[$key]['datetime']) {
                        $candidates[$key] = $candidate;
                    }
                }
            }
        }
    }

    // เช็คว่าคีย์ธุรกิจไหนถูกยืนยันไปแล้วบ้าง (กันยืนยันซ้ำ แม้ transaction_id จะคนละ
    // ครั้งกัน เพราะเนื้อหาเดิมที่ ERP ส่งซ้ำถือเป็นรายการเดียวกัน)
    $confirmedKeys = array();
    $stmtC = $db->QueryParam(
        "select distinct pr_id, po_id, chk_id, isnull(ltrim(rtrim(c_arrive_code)),'') as c_arrive_code
         from NMU_ERP.dbo.sp_medsup_ir_confirm_hdr where i_enabled = 1",
        array()
    );
    while ($rowC = $db->Fetch($stmtC)) {
        $confirmedKeys[intval($rowC['pr_id']) . '|' . intval($rowC['po_id']) . '|' . intval($rowC['chk_id']) . '|' . $rowC['c_arrive_code']] = true;
    }

    $result = array();
    foreach ($candidates as $key => $c) {
        $item = $c['item'];
        $lineIds = is_array($item['line_ids'] ?? null) ? $item['line_ids'] : array();
        $result[] = array(
            "row_key" => $key,
            "transaction_id" => $c['transaction_id'],
            "datetime" => $c['datetime'],
            "source_file" => $c['source_file'],
            "pr_id" => intval($item['pr_id'] ?? 0),
            "po_id" => intval($item['po_id'] ?? 0),
            "period_id" => intval($item['period_id'] ?? 0),
            "chk_id" => intval($item['chk_id'] ?? 0),
            "c_contract_code" => $item['c_contract_code'] ?? '',
            "c_creditor_name" => $item['dc_creditor_idTxt'] ?? '',
            "dc_expense_budget_type_name" => $item['dc_expense_budget_type_name'] ?? '',
            "f_period_amt" => isset($item['f_period_amt']) ? number_format(floatval($item['f_period_amt']), 2) : '',
            "c_arrive_code" => $item['c_arrive_code'] ?? '',
            "d_checking_date" => empty($item['d_checking_date']) ? '' : $date->extDateBuddha($item['d_checking_date']),
            "i_budget_year" => $item['i_budget_year'] ?? '',
            "i_line_count" => count($lineIds),
            "i_confirmed" => isset($confirmedKeys[$key]) ? 1 : 0,
            "j_data" => json_encode($item, JSON_UNESCAPED_UNICODE),
        );
    }

    // เรียงล่าสุดขึ้นก่อน
    usort($result, function ($a, $b) {
        return strcmp($b['datetime'], $a['datetime']);
    });
    $no = 1;
    foreach ($result as &$r) {
        $r['no'] = $no++;
    }
    unset($r);

    echo json_encode(array($root => $result, "totalCount" => count($result)));
    exit();
} else if ($type == "lookup_creditor") {
    // ผู้ขาย/ผู้รับโอนเงิน -> NMU.dbo.dc_creditor (ใช้ทั้งช่อง "ผู้ขาย" และ "ผู้รับโอนเงิน")
    $q = $_REQUEST['query'] ?? '';
    $arrParam[] = "%{$q}%";
    $sqlMain = "select top 30 dc_creditor_id, c_name, c_tax_number_imp
                from NMU.dbo.dc_creditor
                where isnull(i_enable,1) = 1 and c_name like ?
                order by c_name";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    while ($row = $db->Fetch($stmt)) {
        ${$root}[] = array(
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "c_name" => $row["c_name"],
            "c_tax_number_imp" => $row["c_tax_number_imp"],
        );
    }
    echo json_encode(array($root => ${$root}));
    exit();
}

echo json_encode(array($root => array()));
exit();
