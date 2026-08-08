<?php

include("../../../conf/config.php");
include("../../../lib/database/DatabaseServer.php");
include("../../../lib/database/apiUtil.php");
include("../../../lib/date/i_date.class.php");

################################################################################
$db = new DatabaseServer();
$date = new i_date();
$util = new apiUtil();
################################################################################
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

if ($_POST["type"] == "checkingList") {
//    print_r($_SESSION);
//    exit();
    $keyin = "";
    $arrParam = array();
    $arrCountParam = array();
    $i_level = $_SESSION['i_level'] ?? null;
    $emp_id = $_SESSION['sp_emp_id'] ?? null;
    $user_id = $_SESSION['user_id'] ?? null;
    $st = $_SESSION['st'] ?? null;
    $wh = "";

//    $wh .= ($i_level == 3) ? " and a.sp_emp_id={$emp_id}" : "";
    $wh .= (true) ? " and a.sp_emp_id={$emp_id}" : "";

    $sqlTempTable = "select a.sp_check_period_hdr_id
                                , isnull(c.i_yyyy,0) as i_budget_year
                                ,case when isnull(a.i_yyyy_overlap,0) = 0 and isnull(b.i_yyyy_overlap,0)= 0
                                then 	 (select top 1  i_yyyy from sp_tor where tor_id = b.sp_tor_id) 
                                when isnull(a.i_yyyy_overlap,0) = 0   then b.i_yyyy_overlap 
                                when isnull(b.i_yyyy_overlap,0)= 0   then a.i_yyyy_overlap  
                                else DATEPART (YEAR, GETDATE()) end as i_budget_year_overlap
                                , isnull(convert(varchar(10),a.d_checking_date,120), '') as d_checking_date
                                , b.dc_creditor_id as po_creditor_id
                                , b.c_code as c_contract_code
                                , b.sp_tor_contract_id
                                ,(select c_name from NMU.dbo.dc_creditor where dc_creditor_id=b.dc_creditor_id) as c_cnt_name
                                , 0 as po_creditor_transfer_id
                                , a.c_doc_ref
                                , a.c_code
                                ,case when b.c_overlap is null then a.c_overlap else null end as c_overlap
								,case when b.i_yyyy_overlap is null then a.i_yyyy_overlap else null end as i_yyyy_overlap
                                ,c.dc_expense_budget_type_id as dc_expense_budget_type_id
                                ,isnull(c.i_product_type,0) as i_product_type
                                ,isnull(c.dc_cost2_id,0) as dc_cost2_id
                                ,(select c_name from dc_cost where dc_cost_id=c.dc_cost2_id) as dc_cost2_idTxt
                                ,c.po_expense_id as bg_expense_id
                                ,(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = c.dc_expense_budget_type_id) as dc_expense_budget_type_idTxt
                                ,(select c_name from dc_expense where bg_expense_id = c.po_expense_id) as bg_expense_idTxt
                                , (select top 1 c_name from sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as c_detail
                                ,a.sp_emp_id as sp_emp_id
                                ,(select c_name from sp_emp where sp_emp_id=a.sp_emp_id) as sp_emp_name
                                ,'' as d_audit_date
                                ,'' as dc_approve_id
                                ,'' as d_inv_date
                                ,'' as c_qty
                                , c.c_name
                                , (select sum(f_net_total_price) from sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as f_total
                                , a.c_arrive_code
                                , (select top 1sp_gl_monthly_hdr_id from sp_gl_monthly_hdr where c_ref_doc = a.c_code) as sp_gl_monthly_hdr_id
                                , row_number() over (order by a.sp_check_period_hdr_id DESC) as row
                              from NMU_ERP.dbo.sp_check_period_hdr a
                              inner join NMU_ERP.dbo.sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                              inner join NMU_ERP.dbo.sp_tor c on c.tor_id = b.sp_tor_id
                              where NOT EXISTS (SELECT sp_check_period_hdr_id FROM dbo.sp_withdraw WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id and i_enable = 1)
                              and i_status_checking=1 
                              " . $wh;

//    echo "{$user_id} != 1 && {$i_level} == 3";
//    echo $sqlTempTable;

//    exit();

$sqlMain = "select a.* from ({$sqlTempTable}) a";

$stmt = $db->QueryParam($sqlMain, array());

$i = $start + 1;
    while ($row = $db->Fetch($stmt)) {

        $arrText = array(1 => "วัสดุ", 2 => "ครุภัณฑ์");

        $temp = array(
            "no" => $i++,
            "id" => intval($row["sp_check_period_hdr_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
            "po_working_hdr_id" => intval(0),
            "po_working_dtl_id" => intval(0),
    //            "dc_cost_id " => 38,
            "sp_gl_monthly_hdr_id" => $row["sp_gl_monthly_hdr_id"],
            "dc_cost_id " => $row["dc_cost2_id"],
            "dc_cost2_id " => $row["dc_cost2_id"],
            "dc_cost2_idTxt " => $row["dc_cost2_idTxt"],
            "i_product_type" => $row["i_product_type"],
            "i_product_typeTxt" => @$arrText[$row["i_product_type"]],
            "c_qty" => $row["c_name"],
            "f_total" => number_format($row["f_total"], 2),
            "c_arrive_code" => ($row["c_doc_ref"] . "/" . $row["c_arrive_code"] . "/" . $row["c_code"]),
            "c_invoice" => $row["c_doc_ref"],
            "c_contract_code" => $row["c_contract_code"],
            "c_code" => $row["c_code"],
            "c_overlap" => $row["c_overlap"],
            "bg_expense_id" => intval($row["bg_expense_id"]),
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
            "bg_expense_idTxt" => $row["bg_expense_idTxt"] ?? null,
            "c_detail" => $row["bg_expense_idTxt"] ?? null,
            "c_name" => $row["bg_expense_idTxt"] . ' | ' . number_format($row["f_total"], 2),
            "po_creditor_id" => $row["po_creditor_id"],
            "po_creditor_transfer_id" => $row["po_creditor_transfer_id"],
            "po_creditor_name" => $row["c_cnt_name"],
            "sp_emp_name" => $row["sp_emp_name"],
            "sp_emp_id" => $row["sp_emp_id"],

            "i_budget_yearTxt" => intval($row["i_budget_year"]),
            "i_yyyy_overlap" => intval($row["i_yyyy_overlap"]),
            "i_budget_year_overlapTxt" => intval($row["i_budget_year_overlap"]),
            "i_budget_year" => intval($row["i_budget_year"]),
            "i_budget_year_overlap" => intval($row["i_budget_year_overlap"]),
            "po_creditor_id" => $row["po_creditor_id"],
            "d_checking_date" => $date->extDateBuddha($row["d_checking_date"]),
        );


        /* $temp = array(
          "no" => $i++,
          "id" => intval($row["po_working_dtl_id"]),
          "po_working_hdr_id" => intval($row["po_working_hdr_id"]),
          "po_working_dtl_id" => intval($row["po_working_dtl_id"]),
          "c_status_last" => $row["c_status_last"],
          "c_arrive_code" => '-', //$row["c_arrive_code"],
          "c_code" => '-', //$row["c_code"],
          "dc_cost_idTxt" => $row["dc_cost_idTxt"],
          "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
          "po_creditor_id" => $row["po_creditor_id"],
          "po_creditor_transfer_id" => $row["po_creditor_transfer_id"],
          "po_creditor_name" => $row["c_cnt_name"],
          "i_budget_year" => intval($row["i_budget_year"]),
          "i_budget_year_overlap" => intval($row["i_budget_year_overlap"]),
          "dc_cost_id" => intval($row["dc_cost_id"]),
          "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
          "bg_expense_id" => ($row["bg_expense_id"] > 0) ? $row["bg_expense_id"] : null,
          "bg_expense_idTxt" => $row["bg_expense_idTxt"],
          "c_detail" => $row["c_detail"],
          "c_name" => $row["c_detail"],
          "po_emp_id" => ($row["po_emp_id"] > 0) ? $row["po_emp_id"] : null,
          "dc_approve_id" => ($row["dc_approve_id"] > 0) ? $row["dc_approve_id"] : null,
          "d_audit_date" => ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",
          "d_approve_date" => null, //($row["d_approve_date"] != "") ? $date->extDateBuddha($row["d_approve_date"]) : "",
          "d_doc_date" => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
          "d_inv_date" => ($row["d_inv_date"] != "") ? $date->extDateBuddha($row["d_inv_date"]) : "",
          "c_comment" => $row["c_comment"],
          "c_qty" => $row["c_qty"],
          "f_total" => $row["f_total"],
          ); */
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
