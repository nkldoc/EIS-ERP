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
    $mode = $_REQUEST['mode'] ?? null;
    // if ($act == "SEARCH") {
    //     $wh .= ($_REQUEST['c_code'] != "") ? "   and b.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
    //     $wh .= ($_REQUEST['c_code_chk'] != "") ? "   and a.c_code like '%" . $_REQUEST['c_code_chk'] . "%'" : "";
    // }
    if ($mode == "SEARCH") {
        if ($filter && $filter !== "") {
            if ($filter === "c_code")
                $wh .= " and b.c_code like ?";
            else if ($filter === "c_code_chk")
                $wh .= " and a.c_code like ?";
            $arrParam[] = "%{$value}%";
            $arrCountParam[] = "%{$value}%";
        }
    }
//    $wh .= ($i_level == 3) ? " and a.sp_emp_id={$emp_id}" : "";
    if($_SESSION['i_level'] != 1){
        $wh .= (true) ? " and a.sp_emp_id={$emp_id}" : "";
    } 

    $sqlTempTable = "select a.sp_check_period_hdr_id
                                , isnull(c.i_yyyy,0) as i_budget_year
                                ,case when isnull(a.i_yyyy_overlap,0) = 0 and isnull(b.i_yyyy_overlap,0)= 0
                                then 	 (select top 1  i_yyyy from sp_tor where tor_id = b.sp_tor_id) 
                                when isnull(a.i_yyyy_overlap,0) = 0   then b.i_yyyy_overlap 
                                when isnull(b.i_yyyy_overlap,0)= 0   then a.i_yyyy_overlap  
                                else DATEPART (YEAR, GETDATE()) end as i_budget_year_overlap
                                , isnull(convert(varchar(10),a.d_checking_date,120), '') as d_checking_date
                                , b.c_code as c_contract_code
                                , b.sp_tor_contract_id
                                ,(select c_name from NMU.dbo.dc_creditor where dc_creditor_id=b.dc_creditor_id) as po_creditor_name
                                , 0 as po_creditor_transfer_id
                                --, a.c_doc_ref
                                , isnull(a.c_doc_ref,(select c_doc_ref from sp_check_billing_items where sp_check_period_hdr_id  = a.sp_check_period_hdr_id  )) as c_doc_ref
                                , a.c_code
                                , isnull(b.c_overlap,a.c_overlap) as c_overlap
								,case when b.i_yyyy_overlap is null then a.i_yyyy_overlap else null end as i_yyyy_overlap
                                ,(select dc_bg_budget_type_id from sp_check_period_dtl where sp_check_period_hdr_id =  a.sp_check_period_hdr_id  ) as dc_expense_budget_type_id
                                ,isnull(c.i_product_type,0) as i_product_type
                                ,isnull(c.dc_cost2_id,0) as dc_cost2_id
                                ,isnull(c.dc_cost_id,0) as dc_cost_id
                                ,(select c_name from dc_cost where dc_cost_id=c.dc_cost2_id) as dc_cost2_idTxt
                                ,c.po_expense_id as bg_expense_id
                                ,(select c_name from dc_expense_budget_type where dc_expense_budget_type_id = (select dc_bg_budget_type_id from sp_check_period_dtl where sp_check_period_hdr_id =  a.sp_check_period_hdr_id  ) ) as dc_expense_budget_type_idTxt
                                ,(select c_name from dc_expense where bg_expense_id = c.po_expense_id) as bg_expense_idTxt
                                , (select top 1 c_name from sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as c_detail
                                ,a.sp_emp_id as sp_emp_id
                                ,(select c_name from sp_emp where sp_emp_id=a.sp_emp_id) as sp_emp_name
                                ,'' as d_audit_date
                                ,'' as dc_approve_id
                                ,'' as d_inv_date
                                ,'' as c_qty
                                , isnull(c.c_name,b.c_name) as c_name
                                , a.dc_creditor_id
                                , (select sum(f_net_total_price) from sp_check_period_dtl where sp_check_period_hdr_id = a.sp_check_period_hdr_id) as f_total
                                , a.c_arrive_code
                                , isnull(a.f_vat_amt,0) as  f_vat_amt 
                                , isnull(a.f_total_add_vat_amt,0)  as  f_total_add_vat_amt
                                , isnull(a.f_rate_vat,0) as f_rate_vat 
                                , (select top 1 sp_gl_monthly_hdr_id from sp_gl_monthly_hdr where c_ref_doc = a.c_code) as sp_gl_monthly_hdr_id
                                , row_number() over (order by a.sp_check_period_hdr_id DESC) as row
                                , c.i_type_bg
                            from NMU_ERP.dbo.sp_check_period_hdr a
                            inner join NMU_ERP.dbo.sp_tor_contract b on b.sp_tor_contract_id = a.sp_tor_contract_id
                            inner join NMU_ERP.dbo.sp_tor c on c.tor_id = b.sp_tor_id
                            where NOT EXISTS (SELECT sp_check_period_hdr_id FROM dbo.sp_withdraw WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id and i_enable = 1)
                            and a.i_status_billing = 4
                            " . $wh;

//    echo "{$user_id} != 1 && {$i_level} == 3";
//    echo $sqlTempTable;  
//    exit();


$sqlMain = "select a.* from ({$sqlTempTable}) a";
$stmt = $db->QueryParam($sqlMain, $arrParam);
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
            "dc_cost_id" => intval($row["dc_cost_id"]),
            "dc_cost2_id" => $row["dc_cost2_id"],
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "i_product_type" => $row["i_product_type"],
            "i_product_typeTxt" => @$arrText[$row["i_product_type"]],
            "c_comment" => $row["c_name"],
            "f_total" => number_format($row["f_total"], 2),
            "c_arrive_code" => ($row["c_arrive_code"] . "/" . $row["c_code"]),
            "c_code_invoice" => $row["c_doc_ref"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "c_contract_code" => $row["c_contract_code"],
            "c_code" => $row["c_code"],
            "c_overlap" => $row["c_overlap"],
            "bg_expense_id" => intval($row["bg_expense_id"]),  
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
            "bg_expense_idTxt" => $row["bg_expense_idTxt"] ?? null,
            "c_detail" => $row["bg_expense_idTxt"] ?? null,
            "c_name" => $row["bg_expense_idTxt"] . ' | ' . number_format($row["f_total"], 2),
            // "po_creditor_id" => $row["po_creditor_id"],
            "po_creditor_transfer_id" => $row["po_creditor_transfer_id"],
            "po_creditor_name" => $row["po_creditor_name"],
            "sp_emp_name" => $row["sp_emp_name"],
            "sp_emp_id" => $row["sp_emp_id"],

            "i_budget_yearTxt" => intval($row["i_budget_year"]),
            "i_yyyy_overlap" => intval($row["i_yyyy_overlap"]),
            "i_budget_year_overlapTxt" => intval($row["i_budget_year_overlap"]),
            "i_budget_year" => intval($row["i_budget_year"]),
            "i_budget_year_overlap" => intval($row["i_budget_year_overlap"]),
            "d_checking_date" => $date->extDateBuddha($row["d_checking_date"]),
            // "f_vat_amt" => $row["f_vat_amt"],
            // "f_total_add_vat_amt " => $row["f_total_add_vat_amt"],
            // "f_rate_vat " => $row["f_rate_vat"],
            "f_total_add_vat_amt" => number_format($row["f_total_add_vat_amt"], 2),
            "f_total_add_vat_amt" => number_format($row["f_total_add_vat_amt"], 2),
            "f_rate_vat" => number_format($row["f_rate_vat"], 2),
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_POST["type"] == "checkingList_PR") {
        $keyin = "";
        $arrParam = array();
        $arrCountParam = array();
        $i_level = $_SESSION['i_level'] ?? null;
        $emp_id = $_SESSION['sp_emp_id'] ?? null;
        $user_id = $_SESSION['user_id'] ?? null;
        $st = $_SESSION['st'] ?? null;
        $wh = "";
        if($_SESSION['i_level'] != 1){
            $wh .= (true) ? " and a.sp_emp_id={$emp_id}" : "";
        } 
        // $wh .= (true) ? " and a.sp_emp_id={$emp_id}" : "";
        $sqlTempTable = "select 
                                    a.tor_id  as pr_id
                                ,   a.tor_id as sp_tor_id
                                ,(select c_name from sp_status_hdr where sp_status_hdr_id = a.tor_status_id  ) as status_name
                                , a.c_code as pr_code 
                                , c.checking_id as sp_withdraw_id
                                , a.c_name as c_name
                                , a.po_expense_id as bg_expense_id 
                                , (select c_name from NMU.dbo.bg_expense where a.po_expense_id = bg_expense_id) as expense_name 
                                , a.dc_expense_budget_type_id as dc_expense_budget_type_id
                                , (select c_name from dc_expense_budget_type where a.dc_expense_budget_type_id = dc_expense_budget_type_id ) as dc_expense_budget_type_idTxt
                                ,a.i_enabled  as pr_enabled 
                                , a.i_type_bg  as i_type_bg 
                                , i_yyyy
                                , a.f_total_amt
                                , a.i_product_type
                                , c.c_invoice as c_doc_ref
                                ,(select c_name from sp_emp where a.sp_emp_id = sp_emp_id) as sp_emp_name
                                , a.sp_emp_id as sp_emp_id
                                , d.sp_tor_contract_id
                                ,isnull((select top 1 sp_check_period_hdr_id from sp_check_period_hdr aaa where aaa.sp_tor_contract_id= d.sp_tor_contract_id ),0) as sp_check_period_hdr_id    
                                ,isnull(i_status_billing ,0) as i_status_billing
                                ,b.c_code as chk_code
                                , d.dc_creditor_id
                                , (select c_doc_ref from sp_check_billing_items where sp_check_period_hdr_id = b.sp_check_period_hdr_id ) as c_code_invoice
                                from sp_tor  a 
                                left join sp_withdraw c on a.tor_id = c.sp_tor_id 
                                left join sp_tor_contract d on d.sp_tor_id = a.tor_id 
                                left join sp_check_period_hdr b on b.sp_tor_contract_id = d.sp_tor_contract_id  
                                where NOT EXISTS (SELECT a.tor_id FROM dbo.sp_withdraw WHERE sp_tor_id = a.tor_id and i_enable = 1)
                                and  a.i_type_bg = 5 and  a.tor_status_id = 10043
                                and  b.i_status_billing = 4
                                " 
                                .$wh  ;  
    $sqlMain = "select a.* from ({$sqlTempTable}) a";
    $stmt = $db->QueryParam($sqlMain, array());
    $i = $start + 1;
        while ($row = $db->Fetch($stmt)) {
    
            $arrText = array(1 => "วัสดุ", 2 => "ครุภัณฑ์");
    
            $temp = array(
                
                "no" => $i++,
                // "id" => $row["pr_id"],
                "id" => intval($row["pr_id"]),
                "sp_tor_id" => intval($row["sp_tor_id"]),
                "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
                "sp_check_period_hdr_id" => intval($row["sp_check_period_hdr_id"]),
                "status_name" => $row["status_name"],
                "pr_code" => $row["pr_code"],
                "chk_code" => $row["chk_code"],
                "dc_creditor_id" => $row["dc_creditor_id"],
                "sp_withdraw_id" => $row["sp_withdraw_id"],
                "c_name" => $row["c_name"],
                "bg_expense_id" => $row["bg_expense_id"],
                "expense_name" => $row["expense_name"],
                "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
                "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
                "i_type_bg" => $row["i_type_bg"],
                "f_total_amt" => number_format($row["f_total_amt"], 2),
                "i_yyyy" =>  intval($row["i_yyyy"]+543),
                "i_product_type" => $row["i_product_type"],
                "sp_emp_name" => $row["sp_emp_name"],
                "sp_emp_id" => $row["sp_emp_id"],
                "c_invoice" => $row["c_doc_ref"],
                "c_code_invoice" => $row["c_code_invoice"],
            );
            ${$root}[] = $temp;
        }
        $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
        $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
        echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}