<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################หหห
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
 if ($_REQUEST["type"] == "po_working_dtl") {
 
 
    $arrParam      = array();
    $arrCountParam = array();
 
    $sqlTempTable = "select a.sp_type_status_id
                        , a.i_enabled
                        , row_number() over (order by a.sp_type_status_id DESC) as row
                        from dbo.sp_type_status a 
                        where 1=1";

    //echo  $sqlTempTable; exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = "select a.* "
        . "
 ,s.c_name,s.c_comment
        , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
        , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
        , convert(varchar, d_create, 120) as d_create
        , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
        , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
        , convert(varchar, d_update, 120) as d_update 
        "
        . " from ({$sqlTempTable}) a "
        . " inner join dbo.sp_type_status s on s.sp_type_status_id=a.sp_type_status_id"
             . " WHERE a.row > ? and a.row <= ?";
 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i    = $start + 1;
     while ($row = $db->Fetch($stmt)) {
        $temp      = array(
                            "no"                        => $i++,
                            "id" => intval($row["sp_type_status_id"]),
             "c_name" => $row["c_name"],
             "i_enabled" => $row["i_enabled"],
             "c_comment" => $row["c_comment"],
             "dc_user_create_id"         => $row["c_create_name"],
                            "dc_user_create_cost_id"    => $row["c_cost_creat_name"],
                            "d_create"                  => $date->extDateBuddha($row["d_create"]),
                            "dc_user_update_id"         => $row["c_update_name"],
                            "dc_user_update_cost_id"    => $row["c_cost_update_name"],
                            "d_update" => $date->extDateBuddha($row["d_update"])
         );
        ${$root}[] = $temp;
    }
    $sqlCount   = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}   
