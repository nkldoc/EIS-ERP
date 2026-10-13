<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

###################หห
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

if ($_REQUEST["type"] == "sp_themplate_config") {

    $arrParam = array(); //paraGrid
    $wh = '';

    $arrCountParam = array(); // paraCount

    if ($mode == 'SEARCH') {
        // $wh = ' AND a.i_enabled = ' . $_REQUEST[ 'i_enabled' ] ;

        $arrParam[] = $_REQUEST['i_enabled'];
        $arrCountParam[] = $_REQUEST['i_enabled'];
        $wh .= ' AND i_enabled = ? ';



        $arrParam[] = $_REQUEST['i_is_type_tor'];
        $arrCountParam[] = $_REQUEST['i_is_type_tor'];
        $wh .= ' AND i_is_type_tor = ? ';

        if ($_REQUEST['c_code'] != '') {
            $c_code = $_REQUEST['c_code'] ?? NULL;
            $arrParam[] = "%$c_code%";
            $arrCountParam[] = "%$c_code%";
            $wh .= ' AND c_code like ? ';
        }


        if ($_REQUEST['c_name'] != '') {
            $c_name = $_REQUEST['c_name'] ?? NULL;
            $arrParam[] = "%$c_name%";
            $arrCountParam[] = "%$c_name%";
            $wh .= ' AND c_name like ? ';
        }
    } else {
        $wh = ' AND i_enabled = 1 ';
    }
    //================SEARCH======================================
    $sqlTempTable = "select [sp_status_type_config_id]
                        ,[c_name]
                        ,[c_detail]
                        ,[bg_yyyy]
                        ,start_date
                        ,end_date
                        ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[d_update]
                        , row_number() over (order by sp_status_type_config_id ) as row
                        from dbo.sp_status_type_config
                        where i_delete=2 " . $wh;
    //  if ( $mode == 'SEARCH' ) { echo  $sqlTempTable; print_r($arrParam); exit;}
    $arrParam[] = $start;
    $arrParam[] = $limit;
/* ,[dc_user_create_id]
      ,[dc_user_create_cost_id]
      ,[d_create]
      ,[dc_user_update_id]
      ,[dc_user_update_cost_id]
      ,[d_update]*/
    $sqlMain = "select a.* "
            . "
                ,convert(varchar, a.start_date, 120) as start_date
                ,convert(varchar, a.end_date, 120) as end_date
        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as c_create_name
        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
        , convert(varchar, a.d_create, 120) as d_create
        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
        , convert(varchar, a.d_update, 120) as d_update
        "
            . " from ({$sqlTempTable}) a "
            . " WHERE a.row > ? and a.row <= ?";
//          print_r ( $arrParam ) ;
//        echo ($sqlMain) ;
//        exit () ;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;

    while ($row = $db->Fetch($stmt)) {

        /* SELECT TOP (1000) [sp_status_type_config_id]
          ,[c_name]
          ,[c_detail]
          ,[bg_yyyy]
          ,[start_date]
          ,[end_date]
          ,[i_enabled]
          ,[i_delete]
          ,[dc_user_create_id]
          ,[dc_user_create_cost_id]
          ,[d_create]
          ,[dc_user_update_id]
          ,[dc_user_update_cost_id]
          ,[d_update]
          FROM [NMU_ERP].[dbo].[sp_status_type_config] */
        $temp = array(
        "no" => $i++,
        "id" => intval($row["sp_status_type_config_id"]),
        "sp_status_type_config_id" => intval($row["sp_status_type_config_id"]),
        "c_name" => $row["c_name"],
        "c_detail" => $row["c_detail"],
        "bg_yyyy" => $row["bg_yyyy"],
        "start_date" => $date->extDateBuddha($row["start_date"]),
        "end_date" => $date->extDateBuddha($row["end_date"]),
//        "i_delete" => $row["i_delete"],
//        "i_enabled" => $row["i_enabled"],
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
} else if ($_REQUEST["type"] == "po_working_dtl") {
    //================SEARCH======================================

    $arrParam = array(); //paraGrid
    $wh = '';

    $arrCountParam = array(); // paraCount

    if ($mode == 'SEARCH') {
        // $wh = ' AND a.i_enabled = ' . $_REQUEST[ 'i_enabled' ] ;

        $arrParam[] = $_REQUEST['i_enabled'];
        $arrCountParam[] = $_REQUEST['i_enabled'];
        $wh .= ' AND i_enabled = ? ';



        $arrParam[] = $_REQUEST['i_is_type_tor'];
        $arrCountParam[] = $_REQUEST['i_is_type_tor'];
        $wh .= ' AND i_is_type_tor = ? ';

        if ($_REQUEST['c_code'] != '') {
            $c_code = $_REQUEST['c_code'] ?? NULL;
            $arrParam[] = "%$c_code%";
            $arrCountParam[] = "%$c_code%";
            $wh .= ' AND c_code like ? ';
        }


        if ($_REQUEST['c_name'] != '') {
            $c_name = $_REQUEST['c_name'] ?? NULL;
            $arrParam[] = "%$c_name%";
            $arrCountParam[] = "%$c_name%";
            $wh .= ' AND c_name like ? ';
        }
    } else {
        $wh = ' AND i_enabled = 1 ';
    }
    //================SEARCH======================================
    $sqlTempTable = "select sp_type_status_id
                        , c_code
                        , isnull(i_is_type_tor ,0) AS i_is_type_tor
                        , i_enabled
                        , row_number() over (order by sp_type_status_id ) as row
                        from dbo.sp_type_status a
                        where i_delete=2 " . $wh;
    //  if ( $mode == 'SEARCH' ) { echo  $sqlTempTable; print_r($arrParam); exit;}
    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = "select a.* "
            . "
        ,s.c_name,s.c_comment,s.i_is_type_tor
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
    //      print_r ( $arrParam ) ;
    //    echo ($sqlMain) ;
    //    exit () ;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    while ($row = $db->Fetch($stmt)) {
        if ($row["i_is_type_tor"] == '0') {
            $i_is_type_tor_name = 'สถานะร่วม';
        } else if ($row["i_is_type_tor"] == '1') {
            $i_is_type_tor_name = 'สถานะแยก';
        }

        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_type_status_id"]),
            "c_name" => $row["c_name"],
            "c_comment" => $row["c_comment"],
            "i_is_type_tor_name" => $i_is_type_tor_name,
            "i_is_type_tor" => $row["i_is_type_tor"],
            "i_enabled" => $row["i_enabled"],
            "dc_user_create_id" => $row["c_create_name"],
            "c_code" => $row["c_code"],
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
