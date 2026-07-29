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
if ($_REQUEST["type"] == "lasperiodNotification") {


    $arrParam = array();
    $arrCountParam = array();

    $sqlTempTable = "select b.i_before
                        , b.sp_check_period_hdr_id
                        , b.sp_tor_contract_id
                        , CONVERT(VARCHAR, b.d_warranty_date) as d_warranty_date
                                -- , c.i_is_complete as i_is_complete
                        , b.c_checking_code as c_checking_code
                        , b.c_code as c_code
                        , b.c_arrive_code
                        , b.c_doc_ref
                        , b.dc_user_create_id
                        , CONVERT(VARCHAR, b.d_checking_date, 120) AS d_checking_date
                        , a.id
                        , a.ref_id
                        , a.c_name
                        , a.c_detail
                        , a.i_is_start
                        , CONVERT(VARCHAR, b.d_warranty_date, 120) AS due_date
                        , CONVERT(VARCHAR, b.d_checking_date1, 120) AS d_checking_date1
                        , convert(varchar(10), DATEADD(day, - b.i_before, b.d_warranty_date), 120) AS notif_date
                        , a.user_id
                        , a.sp_emp_id
                        , a.i_is_status
                        , row_number() over (order by a.id DESC) as row
                        from dbo.sp_alert_queque a
			inner join dbo.sp_check_period_hdr b on b.sp_check_period_hdr_id=a.ref_id
                        where b.i_status_checking = 1  and isnull(b.c_code,'') <> ''"; //
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.*"
            . ", (select i_is_close from dbo.sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id) as i_is_close"
            . ", (select c_code from dbo.sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id) as c_contract_code"
            . ", (select c_doc_ref from dbo.sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id) as c_contract_ref"
            . " from ({$sqlTempTable}) a "
            . " WHERE a.row > ? and a.row <= ?";
//             echo $sqlMain;
//    exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $cIsClose = array(0 => "<font color='blue'>ปกติ</font>", 1 => "<font color='green'>ปิดสัญญา</font>", 2 => "<font color='red'>ยกเลิกสัญญา</font>");
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $i++,
            "id" => intval($row["id"]),
//            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "ref_id" => intval($row["ref_id"]),
            "c_name" => $row["c_name"],
//            "c_detail" => $row["c_detail"],
//            "close_detail" => $row["close_detail"],
//            "i_is_start" => intval($row["i_is_start"]),
            "i_is_close" => intval($row["i_is_close"]),
            "txti_is_close" => $cIsClose[intval($row["i_is_close"])],
            "i_before" => intval($row["i_before"]),
            "due_date" => $date->extDateBuddha($row["due_date"]),
            "notif_date" => $row["notif_date"] != null ? $date->extDateBuddha($row["notif_date"]) : null,
//            "sp_emp_idTxt" => $row["sp_emp_idTxt"],
//            "sp_emp_id" => intval($row["sp_emp_id"]),
//            "user_id" => intval($row["user_id"]),
//            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "c_doc_ref" => $row["c_doc_ref"],
            "c_contract_ref" => $row["c_contract_ref"],
//             "i_contract_status" => $row["i_contract_status"],
//            "c_contract_name" => $row["c_contract_name"],
//            "c_code" => $row["c_code"],
//            "dc_creditor_id" => $row["dc_creditor_id"],
//            "sp_tor_id" => $row["sp_tor_id"],
//            "f_total_amt" => $row["f_total_amt"],
            "c_contract_code" => $row["c_contract_code"],
            "c_checking_code" => $row["c_checking_code"],
            "c_arrive_code" => $row["c_arrive_code"],
            "c_code" => $row["c_code"],
            "i_close" => intval(@$row["i_close"]),
//            "i_is_complete" => $row["i_is_complete"],
            "d_warranty_date" => $row["d_checking_date1"] == null ? $date->extDateBuddha($row["d_checking_date1"]) : null,
            "d_warranty_date" => $row["d_warranty_date"] == null ? $date->extDateBuddha($row["d_warranty_date"]) : null,
//            "d_po_date" => $row["d_po_date"] == null ? $date->extDateBuddha($row["d_po_date"]) : null,
//            "c_d_due_date" => $row["c_d_due_date"]?$date->extDateBuddha($row["c_d_due_date"]):null,
//            "i_notification" => $row["i_notification"]?$date->extDateBuddha('i_notification'):null,
//            "i_status" => $row["i_status"],
//            "d_period_date" => $row["d_period_date"]?$date->extDateBuddha($row["d_period_date"]):null,
//            "d_doc_date" => $row["d_doc_date"]?$date->extDateBuddha($row["d_doc_date"]):null,
//            "i_is_last" => $row["i_is_last"]
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
