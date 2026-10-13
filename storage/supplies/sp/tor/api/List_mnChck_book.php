<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
##########################################
###########################################
$mode = $_REQUEST["mode"] ?? null;
$filter = $_REQUEST["filter"] ?? null;
$value = $_REQUEST["value"] ?? null;
$i_read = $_REQUEST["i_read"] ?? null;

$root = "data";
$data = array();

$limit = $_REQUEST["limit"] ?? null;
$dir = $_REQUEST["dir"] ?? null;
$sort = $_REQUEST["sort"] ?? null;
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
if (!get($dir)) {
    $dir = "DESC";
}
if (!get($sort)) {
    $sort = " s.c_code";
}
#################################
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
$wh = null;

$type = $_REQUEST["type"] ?? null;
$act = $_REQUEST["act"] ?? null;
$tor_type_show = $_REQUEST['tor_type_show'] ?? null;
$i_post = $_REQUEST['i_post'] ?? null;
if ($type == "po_money_overlap") {
       
$po_id = $_REQUEST["po_id"]?? 0;  

// =============================
// SQL
// =============================

$sql = " 
SELECT 
    bg_reserve_overlap_id ,
    c_code_overlap,
    i_sys,
    pr_id,
    po_id,
    chk_id,
    i_year,
    i_pr_type,
    i_reserve,
    dc_cost_id,
    dc_budget_type_id,
    bg_expense_id,
    i_finish,
    i_last,
    f_amt,
    i_enable,
    d_create,
    d_update,
    dc_cost_acc_id 
FROM NMU_EIS..bg_reserve_overlap 
WHERE i_sys = 1 and i_enable=1
AND po_id = ? 
ORDER BY bg_reserve_overlap_id 
"; 
$params = array($po_id); 
//echo $db->debugSql($sql,$params);
//exit();
$stmt = $db->QueryParam($sql, $params);
if (!$stmt) {

    die(json_encode(array(
        "success" => false,
        "message" => "Query failed"
    )));
} 
// =============================
// RESULT
// =============================

$data = array();

while ($row = $db->Fetch($stmt)) {

    // format datetime
    if ($row["d_create"] instanceof DateTime) {
        $row["d_create"] = $row["d_create"]->format("Y-m-d H:i:s");
    }

    if ($row["d_update"] instanceof DateTime) {
        $row["d_update"] = $row["d_update"]->format("Y-m-d H:i:s");
    }

    $data[] = $row;
}

// =============================
// RETURN JSON
// ============================= 
echo json_encode(array(
        "success" => true,
        "rows"    => $data
    )); 
    exit();
}else if ($type == "po_money") {
    
$pr_id = $_REQUEST["pr_id"]?? 0;

// =============================
// SQL
// =============================

$sql = " 
SELECT 
    bg_reserve_money_id, 
    i_sys,
    pr_id,
    po_id,
    chk_id,
    i_year,
    i_pr_type,
    i_reserve,
    dc_cost_id,
    dc_budget_type_id,
    bg_expense_id,
    i_finish,
    i_last,
    f_amt,
    i_enable,
    d_create,
    d_update,
    dc_cost_acc_id,
    c_comment 
FROM NMU_EIS..bg_reserve_money 
WHERE i_sys = 1 and i_enable=1
AND pr_id = ? 
ORDER BY chk_id,bg_reserve_money_id 
"; 
$params = array($pr_id); 
//echo $db->debugSql($sql,$params);
//exit();
$stmt = $db->QueryParam($sql, $params);
if (!$stmt) {

    die(json_encode(array(
        "success" => false,
        "message" => "Query failed"
    )));
} 
// =============================
// RESULT
// =============================

$data = array();

while ($row = $db->Fetch($stmt)) {

    // format datetime
    if ($row["d_create"] instanceof DateTime) {
        $row["d_create"] = $row["d_create"]->format("Y-m-d H:i:s");
    }

    if ($row["d_update"] instanceof DateTime) {
        $row["d_update"] = $row["d_update"]->format("Y-m-d H:i:s");
    }

    $data[] = $row;
}

// =============================
// RETURN JSON
// ============================= 
echo json_encode(array(
        "success" => true,
        "rows"    => $data
    )); 
    exit();
    
} else if ($type == "po_working_dtl1") {


    $sqlTempTable = "select a.sp_sbill_hdr_id
                     , row_number() over (order by a.sp_sbill_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_sbill_items a
                     where a.i_enabled=1 and a.dc_user_create_id=" . $_SESSION['user_id'];
    $arrParam[] = $_REQUEST['sp_sbill_hdr_id'] ?? null;
    $sqlMain = "select s.[sp_sbill_hdr_id]
                        ,s.[c_contract_code]
                        ,s.[c_doc_result_ref]
                        ,s.[c_doc_ref]
                        , convert(varchar, s.[d_doc_date], 120) as d_doc_date
                        ,s.[f_period_amt]
                        ,s.[dc_cost_id]
                        ,s.[sp_tor_contract_id]
                        ,s.[sp_tor_hdr_period_id]
                        ,s.[i_enabled]
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
            "
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_sbill_items s on s.sp_sbill_hdr_id=a.sp_sbill_hdr_id"
            . " WHERE s.sp_sbill_hdr_id=?"
            . " group by s.[sp_sbill_hdr_id]
                        ,s.[c_contract_code]
                        ,s.[c_doc_result_ref]
                        ,s.[c_doc_ref]
                        ,s.[d_doc_date]
                        ,s.[f_period_amt]
                        ,s.[dc_cost_id]
                        ,s.[sp_tor_contract_id]
                        ,s.[sp_tor_hdr_period_id]
                        ,s.[i_enabled]
                        ,s.dc_user_create_id
                        ,s.dc_user_create_cost_id
                        ,s.d_create
                        ,s.dc_user_update_id
                        ,s.dc_user_update_cost_id
                        ,s.d_update
                        ";
//             print_r($arrParam);
//    echo $sqlMain;
//    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_sbill_hdr_id"]),
            "sp_sbill_hdr_id" => intval($row["sp_sbill_hdr_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "c_doc_result_ref" => $row["c_doc_result_ref"],
            "c_doc_ref" => $row["c_doc_ref"],
            "f_period_amt" => number_format($row["f_period_amt"], 2),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "sp_tor_hdr_period_id" => intval($row["sp_tor_hdr_period_id"]),
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date d_tor_status_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit();
}