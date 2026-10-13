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
$i = 0;
 if ($_REQUEST["mode"] == "LISTCONTRACTPROJECT") {
  
    $sqlMain = "select c.i_yyyy as i_year
                , convert(varchar, b.d_due_date, 120) as d_due_date
                , convert(varchar, b.d_doc_date, 120) as d_doc_date
                , (select top 1 inv_name FROM NMU.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id)  as dc_creditor_idTxt
                , (select top 1 c_name from dc_cost where dc_cost_id=b.dc_cost_id)  as dc_cost_idTxt 
                , (select top 1  c_code +' : '+c_name FROM NMU_EIS.dbo.bg_expense where bg_expense_id=c.po_expense_id) as c_expense_name
                , (select top 1 c_name from NMU.dbo.dc_expense_budget_type where dc_expense_budget_type_id=b.dc_expense_budget_type_id) as c_expense_budget_type_name
                , (select top 1 c_full_name from dc_user where dc_user_id=c.dc_user_create_id) as c_create_name
                , (select top 1 c_name from dc_cost where dc_cost_id=c.dc_user_create_cost_id) as c_cost_creat_name
                , convert(varchar, b.d_create, 120) as d_create
                , (select top 1 c_full_name from dc_user where dc_user_id=c.dc_user_update_id) as c_update_name
                , (select top 1 c_name from dc_cost where dc_cost_id=c.dc_user_update_cost_id) as c_cost_update_name
                , convert(varchar, b.d_update, 120) as d_update 
                , a.sp_tor_contract_id as parent_id
                , a.c_code
                , b.c_code as project_code
                , b.sp_tor_contract_id 
                , isnull(b.c_overlap,'') as c_overlap
                , isnull(b.i_overlap,0) as i_overlap
                , b.sp_tor_id 
                , b.bg_reserve_money1_id 
                , b.dc_expense_budget_type_id
                , c.po_expense_id
                , c.tor_id
                , c.dc_cost_id
                , c.i_yyyy
                , b.i_yyyy_overlap
                , b.parent_id
                , b.i_pr_type1 
                , b.f_total_amt 
                , b.i_booking_bg
                , b.c_discription
                , b.dc_creditor_id
                , b.bg_reserve_money1_id
                , b.bg_reserve_money2_id
                , b.i_contract_status
                , (select c_name from dc_cost where dc_cost_id = c.dc_cost_id) as dc_costTxt
                , c.dc_cost_id
                , c.dc_cost2_id
                , c.i_working_type
                ,(select top 1 c_name from dc_cost where dc_cost_id=c.dc_cost2_id)  as dc_cost2_idTxt
                from dbo.sp_tor_contract a
                inner join dbo.sp_tor_contract b on b.parent_id = a.sp_tor_contract_id
                inner join dbo.sp_tor c on c.tor_id = b.sp_tor_id
                where a.sp_tor_contract_id = ?
                and b.i_enabled = 1
                and c.i_enabled =  1
                order by b.sp_tor_contract_id desc"; 
            $stmt = $db->QueryParam($sqlMain, array($_REQUEST['sp_tor_contract_id'])); 
            $total = 0;
    while ($row  = $db->Fetch($stmt)) {  //c_expense_name
             $temp = array(
                "no" => $i++,
                "parent_id" => intval($row["parent_id"]),
                "sp_tor_pro_id" => intval($row["sp_tor_id"]), 
                "dc_creditor_id" => intval($row["dc_creditor_id"]), 
                "sp_tor_contract_pro_id" => intval($row["sp_tor_contract_id"]),
                "i_contract_status" => intval($row["i_contract_status"]),
                "i_overlap" => intval($row["i_overlap"]),
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "c_discription" => $row["c_discription"],
                "c_code" => $row["c_code"],
                "dc_cost_id" => intval(@$row["dc_cost_id"]), 
                "dc_cost_idTxt" => $row["dc_cost_idTxt"],
                "dc_cost2_id" => intval(@$row["dc_cost2_id"]), 
                "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
                "c_overlap" => $row["c_overlap"], 
                "project_code" => $row["project_code"],
                "d_due_date" => $date->extDateBuddha($row["d_due_date"]),
                "d_doc_date" => $date->extDateBuddha($row["d_doc_date"]),
                "i_yyyy" => intval($row["i_yyyy"]), // i_yyyy dc_expense_budget_type_id po_expense_id
                "i_yyyy_overlap" => intval($row["i_yyyy_overlap"]), // i_yyyy dc_expense_budget_type_id po_expense_id
                "c_yyyy" => intval($row["i_yyyy"]) + 543, // i_yyyy dc_expense_budget_type_id po_expense_id
                "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
                "c_expense_budget_type_name" => $row["c_expense_budget_type_name"],
                "c_expense_name" => $row["c_expense_name"],
                "po_expense_id" => intval($row["po_expense_id"]),
                "bg_reserve_money1_id" => intVal($row["bg_reserve_money1_id"]),
                "i_pr_type1" => intval($row["i_pr_type1"]),
                "i_booking_bg" => intval($row["i_booking_bg"]),
                "dc_cost_id" => intval($row["dc_cost_id"]),
                "i_working_type" => intval($row["i_working_type"]),
            ); 
        ${$root}[] = $temp;
        $total += $row["f_total_amt"];
    } 
    ${$root}[] = array("no"=>9999, "f_total_amt" => "<span style='font-weight:bold;color:blue;'>".number_format($total, 2)."</span>");
    echo json_encode(array("debug" => true, "totalCount" => $i, $root => ${$root}));
}   
