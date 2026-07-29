<?php

 include("../../conf/config.php");
 include("../../lib/database/DatabaseServer.php");
 include("../../lib/database/apiUtil.php");
 include("../../lib/date/i_date.class.php");

###################
 $db = new DatabaseServer();
 $date = new i_date();
 $util = new apiUtil();
############################################################################################################
 $mode = @$_REQUEST["mode"] ?? null;
 $filter = @$_REQUEST["filter"] ?? null;
 $value = @$_REQUEST["value"] ?? null;
 $i_read = @$_REQUEST["i_read"] ?? null;
###################
 $root = "data";
 $data = array();
###################
 $limit = @$_REQUEST["limit"] ?? null;
 $dir = @$_REQUEST["dir"] ?? null;
 $sort = @$_REQUEST["sort"] ?? null;
 $start = @$_REQUEST["start"] ?? null;

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

 if ($_POST["type"] == "storeDtlCancel") {

     $keyin = "";
     $arrParam = array();
     $arrCountParam = array();

     $sqlTempTable = "select a.po_working_hdr_id
                        , a.last_status_id
                        , a.c_detail
                        , a.c_status_last
                        , a.c_code_ref
                        , a.c_comment
                        --
                        , a.dc_user_create_id
                        , a.dc_user_create_cost_id
                        , a.d_create
                        --
                        , a.dc_user_update_id
                        , a.dc_user_update_cost_id
                        , a.d_update
                        --
                        , row_number() over (order by a.po_working_hdr_id DESC) as row
                        from dbo.po_working_hdr a
                        where " . $keyin . " i_enable = ? " . $util->viewAcc($i_read, "a");
     //    echo $sqlTempTable ;
     //    exit ;
     $arrParam[] = 2;
     $arrCountParam[] = 2;

     if ($mode == "SEARCH") {
         if ($filter && $filter !== "") {
             if ($filter === "c_code")
                 $sqlTempTable .= " and a.c_code_ref like ?";
             if ($filter === "c_name")
                 $sqlTempTable .= " and a.c_detail like ?";

             $arrParam[] = "%{$value}%";
             $arrCountParam[] = "%{$value}%";

             // echo $sqlTempTable; exit;
         }
     }

     $arrParam[] = $start;
     $arrParam[] = $limit;

     $sqlMain = "select a.*"
             //
             . ", (select convert(varchar, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id = a.po_working_hdr_id and po_status_hdr_id=a.last_status_id) as d_doc_date"
             //
             . ", (select top 1 c_name from dbo.dc_cost where dc_cost_id = a.dc_user_create_cost_id) as c_cost_creat_name"
             . ", (select top 1 c_full_name from dbo.dc_user where dc_user_id=a.dc_user_create_id) as c_create_name"
             . ", convert(varchar, a.d_create, 120) as d_create"
             //
             . ", (select top 1 c_name from dbo.dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name"
             . ", (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name"
             . ", convert(varchar, a.d_update, 120) as d_update"
             . ", (select sum(f_total) from po_working_dtl where po_working_hdr_id=a.po_working_hdr_id) as f_total_amt"
             . ",(select c_name from dbo.dc_cost where dc_cost_id=s.dc_cost_id) as dc_cost_idTxt"
             . ",(select c_name from dbo.dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id) as dc_expense_budget_type_idTxt"
             . ",(select c_name from dbo.po_expense where i_last=1 and po_expense_id=s.po_expense_id) as po_expense_idTxt"
             //
             . "
            ,s.po_working_dtl_id
            ,s.i_budget_year_overlap
            ,s.i_budget_year
            ,s.dc_cost_id
            ,s.po_creditor_id
            ,s.po_creditor_transfer_id
            ,s.dc_expense_budget_type_id 
            ,s.c_code
            ,s.po_expense_id
            ,s.po_emp_id
            ,CONVERT(VARCHAR, s.d_doc_date, 120) AS d_doc_date
            --,s.po_audit_id
            ,CONVERT(VARCHAR, s.d_audit_date, 120) AS d_audit_date
            ,s.dc_approve_id
            ,CONVERT(VARCHAR, s.d_inv_date, 120) AS d_inv_date
            ,s.c_cnt_name
            ,s.c_detail
            ,s.c_qty
            ,s.f_total
            "
             . " from ({$sqlTempTable}) a "
             . " inner join dbo.po_working_dtl s on s.po_working_hdr_id=a.po_working_hdr_id"
             . " WHERE a.row > ? and a.row <= ?";

     $stmt = $db->QueryParam($sqlMain, $arrParam);
     $i = $start + 1;
     while ($row = $db->Fetch($stmt)) {
         $row["d_approve_date"] = $db->GetDataBySQL("select CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=? and po_status_hdr_id=?", array($row["po_working_hdr_id"], $row["last_status_id"])); //last_status_id
         $temp = array(
             "no" => $i++,
             "id" => intval($row["po_working_dtl_id"]),
             "po_working_hdr_id" => intval($row["po_working_hdr_id"]),
             "po_working_dtl_id" => intval($row["po_working_dtl_id"]),
             "c_status_last" => $row["c_status_last"],
             "dc_cost_idTxt" => $row["dc_cost_idTxt"],
             "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
             "po_creditor_id" => $row["po_creditor_id"],
             "po_creditor_transfer_id" => $row["po_creditor_transfer_id"],
             "po_creditor_name" => $row["c_cnt_name"],
             "i_budget_year" => intval($row["i_budget_year"]),
             "i_budget_year_overlap" => intval($row["i_budget_year_overlap"]),
             "dc_cost_id" => intval($row["dc_cost_id"]),
             "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
             "po_expense_id" => ($row["po_expense_id"] > 0) ? $row["po_expense_id"] : null,
             "po_expense_idTxt" => $row["po_expense_idTxt"],
             "c_detail" => $row["c_detail"],
             "c_code" => $row["c_code"],
             "c_name" => $row["c_detail"],
             "c_code_ref" => $row["c_code"],
             "po_emp_id" => ($row["po_emp_id"] > 0) ? $row["po_emp_id"] : null,
             // "po_audit_id"               => intval($row["po_audit_id"]),
             "dc_approve_id" => ($row["dc_approve_id"] > 0) ? $row["dc_approve_id"] : null,
             "d_audit_date" => ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",
             "d_approve_date" => ($row["d_approve_date"] != "") ? $date->extDateBuddha($row["d_approve_date"]) : "",
             "d_doc_date" => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
             "d_inv_date" => ($row["d_inv_date"] != "") ? $date->extDateBuddha($row["d_inv_date"]) : "",
             "c_comment" => $row["c_comment"],
             "c_qty" => $row["c_qty"],
             "f_total" => $row["f_total"],
         );
         ${$root}[] = $temp;
     }
     $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
     $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
     echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
 }
