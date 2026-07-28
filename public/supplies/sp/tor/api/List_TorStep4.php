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
    $sqlTempTable = "select a.sp_check_period_hdr_id
                     , row_number() over (order by a.sp_check_period_hdr_id DESC) as row
                     from NMU_ERP.dbo.sp_check_period_hdr a
                     where a.i_status_checking=1 and a.c_code <> ''";
//     echo $sqlTempTable;
//    exit;

    $arrParam[] = $start;
     $arrParam[] = $limit;
     $sqlMain = "select a.*
                        , s.c_code
                        , s.sp_check_period_hdr_id
                        , s.c_arrive_code
                        , s.c_doc_ref
                        , s.i_step
                        , s.i_is_waiting
                        , s.i_menu
                        , convert(varchar, s.d_checking_date, 120) as d_checking_date
                        , convert(varchar, s.d_arrive_date, 120) as d_arrive_date
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                        , convert(varchar, s.d_create, 120) as d_create
                        , (select top 1 c_full_name from dbo.dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                        , (select top 1 c_name from dbo.dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                        , convert(varchar, s.d_update, 120) as d_update
                        , (select top 1 c_name from dbo.sp_emp where sp_emp_id=s.sp_emp_id)  as sp_emp_name
                        , s.sp_emp_id
                        , s.c_comment2
                        , isnull((select sp_check_period_hdr_id from dbo.sp_withdraw where i_enable = 1 and sp_check_period_hdr_id=a.sp_check_period_hdr_id),0) as i_status

            "
            . " from ({$sqlTempTable}) a "
            . " inner join NMU_ERP.dbo.sp_check_period_hdr s on s.sp_check_period_hdr_id=a.sp_check_period_hdr_id"
            . " WHERE a.row > ? and a.row <= ?";
//             print_r($arrParam);
//    echo $sqlMain;
//    exit;

    $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');


    while ($row = $db->Fetch($stmt)) {
        $arrStatus = array(0 => "ยังไม่ทำรายการเบิก", $row["sp_check_period_hdr_id"] => "<span style='color:blue'>ทำรายการเบิก</span>");
        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_check_period_hdr_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "i_step" => intval($row["i_step"]),
            "i_is_waiting" => intval($row["i_is_waiting"]),
            "i_menu" => intval($row["i_menu"]),
            "c_status" => $arrStatus[@$row["i_status"]],
            "c_status" => $arrStatus[@$row["i_status"]],
            "c_code" => $row["c_code"],
             "sp_emp_id" => $row["sp_emp_id"],
            "sp_emp_name" => $row["sp_emp_name"],
            "txtsp_emp_idID" => $row["sp_emp_name"],
            "c_comment" => $row["c_comment2"],
            "d_checking_date" => ((empty($row["d_checking_date"])) ? "" : $date->extDateBuddha($row["d_checking_date"])), //d_tor_date d_tor_status_date
            "d_arrive_date" => ((empty($row["d_arrive_date"])) ? "" : $date->extDateBuddha($row["d_arrive_date"])), //d_tor_date
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