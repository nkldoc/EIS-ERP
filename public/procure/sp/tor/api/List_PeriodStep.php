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
 if ($_REQUEST["type"] == "deliveries") {


     $arrParam = array();
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
                        where tor_type_id is null"; //
     //echo  $sqlTempTable; exit;
     $arrParam[] = $start;
     $arrParam[] = $limit;

     $sqlMain = "select a.* "
             . ", s.c_code
        , s.c_budget_dtl_project
        ,   CASE
                WHEN s.i_is_notor=1 THEN (select c_name from dbo.sp_tor_contract where sp_tor_id=s.tor_id)
                ELSE s.c_name
            END AS c_name
        , s.c_department
        , s.d_doc_ref
        , (select top 1 c_name from sp_type_status where sp_type_status_id=s.tor_type_id)  as tor_type_name
        , isnull(s.i_purchase,1) as i_purchase
        , isnull(s.tor_type_id,1) as tor_type_id
        , s.f_period_amt
        , isnull(s.i_parent,0) as i_parent
        , isnull(s.i_is_parent,0) as i_is_parent
        , s.start_date
        , s.end_date
        , s.c_comment
        , s.c_remake
        , s.i_yyyy as i_year
        , s.dc_creditor_id
        , (select top 1 c_name FROM NMU.dbo.dc_creditor where and dc_creditor_id=s.dc_creditor_id)  as c_doc_ref
        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
        , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
        , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
        , convert(varchar, d_create, 120) as d_create
        , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
        , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
        , convert(varchar, d_update, 120) as d_update
        "
             . " from ({$sqlTempTable}) a "
             . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
             . " WHERE a.row > ? and a.row <= ?";

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
     while ($row = $db->Fetch($stmt)) {
         $temp = array(
             "no" => $i++,
             "id" => intval($row["tor_id"]),
             "c_code" => $row["c_code"],
             "bg_budget_item_project_id" => intval($row["bg_budget_item_project_id"]),
             "c_budget_dtl_project" => $row["c_budget_dtl_project"],
             "c_name" => $row["c_name"],
             "dc_cost_id" => intval($row["dc_cost_id"]),
             "dc_cost_idTxt" => $row["dc_cost_idTxt"],
             "dc_department_id" => intval($row["dc_department_id"]),
             "c_department" => $row["c_department"],
             "i_parent" => $row["i_parent"],
             "i_is_parent" => $row["i_is_parent"],
             "d_doc_ref" => $row["d_doc_ref"],
             "i_year" => $row["i_year"],
             "c_year" => intval($row["i_year"] + 543),
             "tor_type_id" => $row["tor_type_id"],
             "c_tor_type" => $row["tor_type_name"], // $tor_type[$row["tor_type_id"]],
             "i_purchase" => $row["i_purchase"],
             "c_purchase" => $i_purchase[$row["i_purchase"]],
             "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
             "po_expense_id" => intval($row["po_expense_id"]),
             "dc_user_create_id" => $row["c_create_name"],
             "dc_user_create_cost_id" => $row["c_cost_creat_name"],
             "d_create" => $date->extDateBuddha($row["d_create"]),
             "dc_user_update_id" => $row["c_update_name"],
             "dc_user_update_cost_id" => $row["c_cost_update_name"],
             "d_update" => $date->extDateBuddha($row["d_update"]),
             "start_date" => $date->extDateBuddha($row["start_date"]),
             "end_date" => $date->extDateBuddha($row["end_date"]),
             "c_comment" => $row["c_comment"],
             "c_remake" => $row["c_remake"],
             "dc_creditor_id" => intval($row["dc_creditor_id"]),
             "dc_creditor_idTxt" => $row["dc_creditor_idTxt"],
         );

         ${$root}[] = $temp;
     }

     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
 } else if ($_REQUEST["type"] == "checking") {

     $arrParam = array();
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
                        where tor_type_id is null"; //
     //echo  $sqlTempTable; exit;
     $arrParam[] = $start;
     $arrParam[] = $limit;

     $sqlMain = "select a.* "
             . ", s.c_code
        , s.c_budget_dtl_project
        , s.c_name
        , s.c_department
        , s.d_doc_ref
        , (select top 1 c_name from sp_type_status where sp_type_status_id=s.tor_type_id)  as tor_type_name
        , isnull(s.i_purchase,1) as i_purchase
        , isnull(s.tor_type_id,1) as tor_type_id
        , s.f_period_amt
        , isnull(s.i_parent,0) as i_parent
        , isnull(s.i_is_parent,0) as i_is_parent
        , s.start_date
        , s.end_date
        , s.c_comment
        , s.c_remake
        , s.i_yyyy as i_year
        , s.dc_creditor_id
        , (select top 1 c_name FROM NMU.dbo.dc_creditor where and dc_creditor_id=s.dc_creditor_id)  as c_doc_ref
        , (select top 1 c_name from dc_cost where dc_cost_id=a.dc_cost_id)  as dc_cost_idTxt
        , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
        , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
        , convert(varchar, d_create, 120) as d_create
        , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
        , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
        , convert(varchar, d_update, 120) as d_update
        "
             . " from ({$sqlTempTable}) a "
             . " inner join dbo.sp_tor s on s.tor_id=a.tor_id"
             . " WHERE a.row > ? and a.row <= ?";

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
     while ($row = $db->Fetch($stmt)) {
         $temp = array(
             "no" => $i++,
             "id" => intval($row["tor_id"]),
             "c_code" => $row["c_code"],
             "bg_budget_item_project_id" => intval($row["bg_budget_item_project_id"]),
             "c_budget_dtl_project" => $row["c_budget_dtl_project"],
             "c_name" => $row["c_name"],
             "dc_cost_id" => intval($row["dc_cost_id"]),
             "dc_cost_idTxt" => $row["dc_cost_idTxt"],
             "dc_department_id" => intval($row["dc_department_id"]),
             "c_department" => $row["c_department"],
             "i_parent" => $row["i_parent"],
             "i_is_parent" => $row["i_is_parent"],
             "d_doc_ref" => $row["d_doc_ref"],
             "i_year" => $row["i_year"],
             "c_year" => intval($row["i_year"] + 543),
             "tor_type_id" => $row["tor_type_id"],
             "c_tor_type" => $row["tor_type_name"], // $tor_type[$row["tor_type_id"]],
             "i_purchase" => $row["i_purchase"],
             "c_purchase" => $i_purchase[$row["i_purchase"]],
             "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
             "po_expense_id" => intval($row["po_expense_id"]),
             "dc_user_create_id" => $row["c_create_name"],
             "dc_user_create_cost_id" => $row["c_cost_creat_name"],
             "d_create" => $date->extDateBuddha($row["d_create"]),
             "dc_user_update_id" => $row["c_update_name"],
             "dc_user_update_cost_id" => $row["c_cost_update_name"],
             "d_update" => $date->extDateBuddha($row["d_update"]),
             "start_date" => $date->extDateBuddha($row["start_date"]),
             "end_date" => $date->extDateBuddha($row["end_date"]),
             "c_comment" => $row["c_comment"],
             "c_remake" => $row["c_remake"],
             "dc_creditor_id" => intval($row["dc_creditor_id"]),
             "dc_creditor_idTxt" => $row["dc_creditor_idTxt"],
         );

         ${$root}[] = $temp;
     }

     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
 }
