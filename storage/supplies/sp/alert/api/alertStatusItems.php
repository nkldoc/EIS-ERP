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
    $dir = "ASC";
 }
if (!get($sort)) {
    $sort = "a.sp_type_status_id, a.sp_status_hdr_id";
 }

#################################
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
if ($_REQUEST["type"] == "list") {


    $arrParam = array();
     $arrCountParam = array();

    $sqlTempTable = "select a.sp_status_hdr_id
                        , a.sp_type_status_id
                        , a.c_name
                        , a.c_code
                        , a.i_entrance
                        , a.i_alarm
                        , a.i_day
                        , a.i_seq
                        , a.i_config
                        , a.i_enabled
                        , a.dc_user_create_id , a.dc_user_create_cost_id ,a.d_create
                        , a.dc_user_update_id , a.dc_user_update_cost_id ,a.d_update
                        , row_number() over (order by {$sort} {$dir}) as row
                        from dbo.[sp_status_hdr] a
                        where 1=1";

     //echo  $sqlTempTable; exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = "select a.*
        , (select top 1 c_name from sp_type_status where sp_type_status_id=a.sp_type_status_id) as sp_type_statusTxt
        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
        , convert(varchar, a.d_create, 120) as d_create
        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
        , convert(varchar, a.d_update, 120) as d_update
         from ({$sqlTempTable}) a  "
             . "WHERE a.row > ? and a.row <= ?";

     $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_status_hdr_id"]), //i_entrance
             "i_entrance" => intval($row["i_entrance"]), //i_entrance
             "c_code" => $row["c_code"],
             "sp_type_status_id" => $row["sp_type_status_id"],
             "sp_type_statusTxt" => $row["sp_type_statusTxt"],
             "i_alarm" => $row["i_alarm"],
             "i_day" => $row["i_day"],
             "i_seq" => $row["i_seq"],
             "i_config" => $row["i_config"],
             "c_name" => $row["c_name"],
             "i_enabled" => $row["i_enabled"],
             "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "d_create" => $date->extDateBuddha($row["d_create"]),
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"])
        );

        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
