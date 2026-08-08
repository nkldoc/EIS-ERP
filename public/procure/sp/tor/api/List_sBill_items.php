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

 if ($type == "po_working_dtl") {
     $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
     $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
     $i_pa = $_REQUEST["i_pa"] ?? null; // status id


     $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
     $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
     $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;


     if ($act == "SEARCH") {
         $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
         $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
         $wh .= ($_REQUEST['c_name'] != 0) ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
         $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];

     } else {
         $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
     }

     $type_menu = $_REQUEST['type_menu'] ?? null;
    $sqlTempTable = "select a.sp_sbill_hdr_id
                     , row_number() over (order by a.sp_sbill_hdr_id DESC) as row
                     from EIS_PROCURE.dbo.sp_sbill_items a
                     where a.i_enabled=1";
//     echo $sqlTempTable;
//    exit;

    $arrParam[] = $start;
     $arrParam[] = $limit;
     $sqlMain = "select a.row, s.[sp_sbill_hdr_id]
                        ,s.[c_contract_code]
                        ,s.[c_doc_result_ref]
                        ,s.[c_doc_ref]
                        , convert(varchar, s.[d_doc_date], 120) as d_doc_date
                        ,s.[f_period_amt]
                        ,s.[dc_cost_id]
                        ,s.[sp_tor_contract_id]
                        ,s.[sp_tor_hdr_period_id]
                        ,s.[i_enabled]
                        ,s.[i_status]
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
            "
            . " from ({$sqlTempTable}) a "
            . " inner join EIS_PROCURE.dbo.sp_sbill_items s on s.sp_sbill_hdr_id=a.sp_sbill_hdr_id"
            . " WHERE a.row > ? and a.row <= ?";
//             print_r($arrParam);
//    echo $sqlMain;
//    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
    $ar_status = array(0 => "ยังไม่เบิก", 1 => "ส่งเบิกแล้ว", 2 => "", 3 => "");
    while ($row = $db->Fetch($stmt)) {
         
        $temp = array(
            "no" => intval($row["row"]),
            "id" => intval($row["sp_sbill_hdr_id"]),
            "sp_sbill_hdr_id" => intval($row["sp_sbill_hdr_id"]),
            "c_contract_code" => $row["c_contract_code"],
            "c_doc_result_ref" => $row["c_doc_result_ref"],
            "f_period_amt" => $row["f_period_amt"],
            "i_status" => intval($row["i_status"]),
            "c_status" => $ar_status[intval($row["i_status"])],
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
} else if ($type == "po_working_dtl1") {
  
 
    $sqlTempTable = "select a.sp_sbill_hdr_id
                     , row_number() over (order by a.sp_sbill_hdr_id DESC) as row
                     from EIS_PROCURE.dbo.sp_sbill_items a
                     where a.i_enabled=1";
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
            . " inner join EIS_PROCURE.dbo.sp_sbill_items s on s.sp_sbill_hdr_id=a.sp_sbill_hdr_id"
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
            "f_period_amt" => $row["f_period_amt"],
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