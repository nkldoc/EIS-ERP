<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
############################################################################################################
$mode = @$_REQUEST["mode"];
$filter = @$_REQUEST["filter"];
$value = @$_REQUEST["value"];
$i_read = @$_REQUEST["i_read"];
###################
$root = "data";
$data = array();
###################
$limit = @$_REQUEST["limit"];
$dir = @$_REQUEST["dir"];
$sort = @$_REQUEST["sort"];
$start = @$_REQUEST["start"];

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
if ($_REQUEST["type"] == "returnWarrantyContract") {


    $arrParam = array();
    $arrCountParam = array();

    $sqlTempTable = " select sp_tor_contract_id , c_name
                    , sp_emp_id
                    , row_number() over (order by sp_tor_contract_id DESC) as row
                    from dbo.sp_tor_contract
                    where i_is_warranty=1 and i_is_close is null
		"; //
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "SELECT b.i_is_warranty, b.i_is_close
                    , b.i_contract_status
                    , b.sp_tor_contract_id
                    , b.c_doc_ref
                    , b.c_name as c_contract_name
                    , b.c_code
                    , b.c_comment
                    , b.dc_creditor_id
                    , b.sp_tor_id, b.f_total_amt
                    , CONVERT(VARCHAR, b.d_po_date, 120) AS d_po_date
                    , CONVERT(VARCHAR, b.d_doc_date, 120) AS  d_doc_date
                    , isnull(b.i_notification,0) as i_notification
                    , isnull(b.i_status,0) as i_status
                    , isnull((select CONVERT(VARCHAR, d_period_date, 120) from sp_tor_hdr_period where sp_tor_contract_id=a.sp_tor_contract_id) ,null) as d_period_date
                    , isnull((select i_is_last from sp_tor_hdr_period where sp_tor_contract_id=a.sp_tor_contract_id) ,0) as i_is_last , (select c_name from sp_emp where sp_emp_id=a.sp_emp_id) as sp_emp_idTxt
                    , a.*
                FROM ({$sqlTempTable}) a inner join dbo.sp_tor_contract b on b.sp_tor_contract_id=a.sp_tor_contract_id
                WHERE a.row > ? and a.row <= ?";
//            echo $sqlMain;
//    exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_tor_contract_id"]),
            "c_name" => $row["c_name"],
            "c_comment" => $row["c_comment"],
            "i_is_start" => intval($row["i_is_start"]),
            "i_before" => intval($row["i_before"]),
         //   "due_date" => $date->extDateBuddha($row["due_date"]),
            "notif_date" => $row["notif_date"],
            "sp_emp_idTxt" => $row["sp_emp_idTxt"],
            "sp_emp_id" => intval($row["sp_emp_id"]),
            "user_id" => intval($row["user_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "c_doc_ref" => $row["c_doc_ref"], "i_contract_status" => $row["i_contract_status"],
            "c_contract_name" => $row["c_contract_name"],
            "c_code" => $row["c_code"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "sp_tor_id" => $row["sp_tor_id"],
            "f_total_amt" => $row["f_total_amt"],
          //  "d_po_date" => $row["d_po_date"]==null?$date->extDateBuddha($row["d_po_date"]):null,
            "c_d_due_date" => $row["c_d_due_date"]?$date->extDateBuddha($row["c_d_due_date"]):null,
            "i_notification" => $row["i_notification"]?$date->extDateBuddha('i_notification'):null,
            "i_status" => $row["i_status"],
            "d_period_date" => $row["d_period_date"]?$date->extDateBuddha($row["d_period_date"]):null,
            "d_doc_date" => $row["d_doc_date"]?$date->extDateBuddha($row["d_doc_date"]):null,
            "i_is_last" => $row["i_is_last"]

        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
