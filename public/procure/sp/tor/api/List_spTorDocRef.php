<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db     = new DatabaseServer();
$date   = new i_date();
$util   = new apiUtil();
############################################################################################################
$mode   = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value  = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$root   = "data";
$data   = array();
###################
$limit  = @$_REQUEST["limit"];
$dir    = @$_REQUEST["dir"];
$sort   = @$_REQUEST["sort"];
$start  = @$_REQUEST["start"];

function get($a)
{
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
$arrParam      = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
if ($_REQUEST["type"] == "DocRef") {

    $doc_ref = $_REQUEST['d_doc_ref'] ?? null;
    $f_total_amt = $_REQUEST['f_total_amt'] ?? null;
    $dc_cost2_id = $_REQUEST['dc_cost2_id'] ?? null;
    $case = $_REQUEST['case'];
    $id = $_REQUEST['id'];
    $whr = "";
    if($id > 0) {
        $whr = "and a.tor_id != {$id}";
    }
    if ($case == 1) {
        $whr .= "and a.d_doc_ref like '%{$doc_ref}%'";
        $whr .= "and a.f_total_amt = {$f_total_amt}";
    } else if ($case == 2) {
        $whr .= "and a.d_doc_ref like '%{$doc_ref}%'";
    } else if ($case == 3) {
        $whr .= "and a.f_total_amt = {$f_total_amt}";
        $whr .= "and a.dc_cost2_id = {$dc_cost2_id}";
    }

    $arrParam      = array();
    $arrCountParam = array();

    $sqlTempTable = "select a.tor_id
                        , a.bg_budget_dtl_project_id AS bg_budget_item_project_id
                        , a.dc_cost_id
                        , a.dc_department_id
                        , a.dc_expense_budget_type_id
                        , a.po_expense_id 
                        , a.tor_type_id
                        , row_number() over (order by a.tor_id DESC) as row
                        from dbo.sp_tor a 
                        where a.c_name is not null 
                        {$whr}
                        "; //
    //echo  $sqlTempTable; exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = "select a.*"
        . ", s.c_code"
        . ", s.c_name"
        . ", s.d_doc_ref"
        . ", s.f_total_amt"
        . ", (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost2_id) as c_cost_name"
        . " from ({$sqlTempTable}) a "
        . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
        . " WHERE a.row > ? and a.row <= ?";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i    = $start + 1;
    $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    while ($row  = $db->Fetch($stmt)) {
        $temp      = array(
            "no"                        => $i++,
            "id"                        => intval($row["tor_id"]),
            "c_code"                    => $row["c_code"],
            "c_name"                    => $row["c_name"],
            "d_doc_ref"                 => $row["d_doc_ref"],
            "f_total_amt"               => number_format($row["f_total_amt"], 2),
            "c_cost_name"               => $row["c_cost_name"],
        );

        ${$root}[] = $temp;
    }

    $sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
