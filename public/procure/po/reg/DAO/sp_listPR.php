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

   /* $sqlTempTable = "select a.sp_check_period_hdr_id
                                , isnull(c.i_yyyy,0) as i_budget_year
                                , isnull(YEAR(a.d_checking_date),0) as i_budget_year_overlap
                                , isnull(convert(varchar(10),a.d_checking_date,120), '') as d_checking_date
                                , b.dc_creditor_id as po_creditor_id
                                , b.c_code as c_contract_code
                                , b.sp_tor_contract_id
                                ,(select c_name from NMU.dbo.dc_creditor where dc_creditor_id=b.dc_creditor_id) as c_cnt_name
                                , 0 as po_creditor_transfer_id
                                , a.c_doc_ref
                                , a.c_code
                                , b.i_yyyy_overlap
                                , b.c_overlap
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
                              where NOT EXISTS (SELECT sp_check_period_hdr_id FROM dbo.sp_witสhdraw WHERE sp_check_period_hdr_id = a.sp_check_period_hdr_id and i_enable = 1)
                              and i_status_checking=1 */
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
                            from sp_tor  a 
                            left join sp_withdraw c on a.tor_id = c.sp_tor_id 
                            left join sp_tor_contract d on d.sp_tor_id = a.tor_id 
                            where NOT EXISTS (SELECT a.tor_id FROM dbo.sp_withdraw WHERE sp_tor_id = a.tor_id and i_enable = 1)
                            and  a.i_type_bg = 5 and  a.tor_status_id = 10043
                            " 
                            .$wh  ;

//    echo "{$user_id} != 1 && {$i_level} == 3";
//    echo $sqlTempTable;
//    exit();

$sqlMain = "select a.* from ({$sqlTempTable}) a";
$stmt = $db->QueryParam($sqlMain, array());

// /******echo sql******/
// $sql = (@$sqlMain) ? $sqlMain : $sql;
// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

// $sql = str_replace('?', '#-#', $sql);
// foreach ($arr as $fld => $value) {
//  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
// }
// echo $sql; exit;
/********************/
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
            "sp_withdraw_id" => $row["sp_withdraw_id"],
            "c_name" => $row["c_name"],
            "bg_expense_id" => $row["bg_expense_id"],
            "expense_name" => $row["expense_name"],
            "dc_expense_budget_type_id" => $row["dc_expense_budget_type_id"],
            "dc_expense_budget_type_idTxt" => $row["dc_expense_budget_type_idTxt"],
            "i_type_bg" => $row["i_type_bg"],
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_yyyy" =>  intval($row["i_yyyy"]+543),
            // "i_budget_year_overlapTxt" => intval($row["i_budget_year_overlap"]),
            "i_product_type" => $row["i_product_type"],
            // "d_sent_date" => $row["d_sent_date"],
            "sp_emp_name" => $row["sp_emp_name"],
            "sp_emp_id" => $row["sp_emp_id"],
            "c_invoice" => $row["c_doc_ref"],
            
            // "d_audit_date" => ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",

            // "pr_code" => $row["pr_code"],


    /*     id" => intval($row["sp_check_period_hdr_id"]),
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
            "c_contract_code" => $row["c_contract_code"],
            "c_code" => $row["c_code"],
            "bg_expense_id" => intval($row["bg_expense_id"]),
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
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
            */
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
          "d_approve_date" => null, //($row["d_approve_date"] != "") ? $date->extDateBuddha($row["d_approve_date"]) : "",
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
} else if  ($_REQUEST["type"] == "pr_withdraw") {
    $editArry = array(3 => '<span style="color:red">ส่งแก้ไข</span>' // พนักงานสายงาน
        , 2 => '<span style="color:red">ส่งแก้ไข</span>' // หัวหน้าสายงาน
        , 1 => '<span style="color:red">แก้ไขแล้ว</span>' // ธุระการ
        , 4 => '<span style="color:blue">แก้ไขแล้ว</span>'
        , 5 => '<span style="color:blue"></span>'
        , 6 => '<span style="color:blue"></span>'
    );

    $tor_status_id = $_REQUEST["tor_status_id"] ?? null; // status id
    $i_alarm = $_REQUEST["i_alarm"] ?? null; // status id
    $i_pa = $_REQUEST["i_pa"] ?? null; // status id
    $sp_tor_id = $_REQUEST["sp_tor_id"] ?? null; // status


    $step = (!empty($tor_status_id)) ? $tor_status_id : 0;
    $addConfDay1 = (!empty($i_alarm)) ? $i_alarm : 0;
    $addConfDay2 = (!empty($i_pa)) ? $i_pa : 0;

  /*  if ($act == "SEARCH") {
        $wh .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code like '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != 0) ? " and a.c_name like '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and a.i_enabled =" . $_REQUEST['i_enabled'];

        if ($_REQUEST['i_post1'] == 1) {
            $wh .= " and a.sp_emp_id =" . $_REQUEST['sp_emp_id'];
        }
        if ($i_post != 0) {
            if ($i_post == 1) {
                $wh .= " and tor_status_id is not null";
            } else {
                $wh .= " and tor_status_id is null";
            }
        }
    } else {
        $wh .= ($tor_type_show == true) ? " and tor_status_id is null" : "";
    }


    $is_audit = $_REQUEST['is_audit'] ?? null;

    if ($is_audit == 'true') {
        $waudit = "and a.i_is_register in (2 , 1)";
    } else {
        $waudit = "";
    }  */
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlTempTable = "select   row_number() over (order by a.sp_tor_contract_id DESC) as row
                                ,a.sp_tor_contract_id 
                                ,a.f_total_amt as f_contract
                                ,a.d_update  as d_contract
                                ,a.f_type_amt  as f_bg_contract
                                ,a.i_pr_type1  
                                , isnull(a.bg_reserve_money1_id,0) as   bg_reserve_money1_id
                                , case when isnull(c.request_money_income,0)  = 1  and isnull(c.bg_checking_money_id,0) = 0  and isnull(c.bg_reserve_money_id,0) = 0    then 2 
									when isnull(c.request_money_income,0) = 2 and isnull(c.bg_checking_money_id,0) = 0  and isnull(c.bg_reserve_money_id,0) = 0 then 3
									when isnull(c.request_money_income,0) > 0  and isnull(c.bg_checking_money_id,0) > 0  and isnull(c.bg_reserve_money_id,0) = 0  then 4 
									when isnull(c.request_money_income,0) > 0 and isnull(c.bg_checking_money_id,0) = 0  and isnull(c.bg_reserve_money_id,0) > 0  then 5
									when isnull(c.request_money_income,0) = 0 and isnull(a.bg_reserve_money1_id,0) > 0  and isnull(c.bg_checking_money_id,0) = 0  and isnull(c.bg_reserve_money_id,0) = 0  then  6
									else 1  end  as bg_reserve_id
                                ,b.sp_tor_hdr_period_id 
                                ,b.f_total_amt as f_period 
                                ,b.d_update as d_period
                                
                                ,isnull(c.bg_checking_money_id,0)as bg_checking_money_income_id
                                ,b.f_total_amt  as f_check
                                ,c.sp_check_period_hdr_id
                                ,c.bg_checking_money_id as bg_checking_id
                                ,c.d_update as d_cheching
                                , c.request_money_income
                                from sp_tor aa  
                                inner join  sp_tor_contract a  on aa.tor_id =sp_tor_id 
                                inner join sp_tor_hdr_period b on a.sp_tor_contract_id  = b.sp_tor_contract_id 
                                inner join sp_check_period_hdr c on b.sp_tor_contract_id = c.sp_tor_contract_id
                                where      aa.i_type_bg = 5  and aa.tor_id =  {$sp_tor_id} ";
                                        
    $stmt = $db->QueryParam($sqlTempTable,$arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า'); 
    while ($row = $db->Fetch($stmt)) { 
        $bg_reserve_id = null;
        $bg_reserve_idTxt = null;
        switch (intval($row["bg_reserve_id"])) {
            case 0: $bg_reserve_id = "color:#F43217";
                $bg_reserve_idTxt = '';
                break;
            case 1: $bg_reserve_id = "color:black";
                $bg_reserve_idTxt = 'ยังไม่ทำรายการ';
                break;
            case 2: $bg_reserve_id = "color:#116CEF";
                $bg_reserve_idTxt = 'เช็คเงินรับจริง (มีเพียงพอ)';
                break;
            case 3: $bg_reserve_id = "color:#b085f5";
                $bg_reserve_idTxt = 'เช็คเงินรับจริงไม่พอ (กรุณาติดต่อฝ่ายงบประมาณ)';
                break;
            case 4: $bg_reserve_id = "color:#b085f5";
                $bg_reserve_idTxt = 'เช็คเงินรับจริง (มีเพียงพอ) ';
                break;
           case 5: $bg_reserve_id = "color:#52CD14";
                $bg_reserve_idTxt = 'เงินรับจริงไม่พอ กรุณาติดต่อฝ่ายงบประมาณ';
                break;
            case 6: $bg_reserve_id = "color:#52CD14";
                $bg_reserve_idTxt = "จองเงินจากสัญญาแล้ว";
                break;
            /* case 7: $bg_reserve_id = "color:#52CD14";
                $bg_reserve_idTxt = 'การจัดทำ PR จองเงินทำถึงตรวจรับ';
                break;
            default :$bg_reserve_id = "color:#F43217";
                $bg_reserve_idTxt = '';*/
                break;
        }
        // $c_codeStatus = "<b style='{$bg_reserve_id}'>"."</b>"."<image id='img-". "' src='../images/icons/database_start.png'/>" : "");
        $temp = array(
            "no" => $i++,
            "row" => intval($row["row"]),
            "bg_reserve_money1_id" => $row["bg_reserve_money1_id"],
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "bg_checking_money_income_id" => $row["bg_checking_money_income_id"],
            // "f_contract" => intval($row["f_contract"]),
            "request_money_income" => $row["request_money_income"],
            "d_contract" => $row["d_contract"],
            "f_contract" => number_format($row["f_contract"], 2),
            "bg_reserve_id"=> $row["bg_reserve_id"], 
            "bg_reserve_money_name" => $bg_reserve_idTxt,
            "f_bg_contract" => intval($row["f_bg_contract"]),
            "sp_tor_hdr_period_id" => $row["sp_tor_hdr_period_id"],
            "sp_check_period_hdr_id" => $row["sp_check_period_hdr_id"],
            // "i_step" => intval($row["i_step"]),
            /*"i_edit" => intval($row["i_edit"]),
            "bg_budget_dtl_project_id" => intval($row["bg_budget_dtl_project_id"]),
            "i_is_more" => intval($row["i_is_more"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "i_is_rename" => intval($row["i_is_rename"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "txtdc_department_idID" => $row["dc_department_name"], //txtdc_department_idID txtdc_department_idID
            "c_year" => intval($row["i_yyyy"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["c_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_purchase" => intval($row["i_purchase"]),
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(($row["po_expense_id"] == 0 ? $row["po_expense_main_id"] : $row["po_expense_id"])),
            "po_expense_main_id" => intval($row["po_expense_main_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "DateAdd2" => ((empty($row["DateAdd2"])) ? "" : $date->extDateBuddha($row["DateAdd2"])), //d_tor_date d_tor_status_date
            "d_tor_date_pa" => ((empty($row["d_tor_date_pa"])) ? "" : $date->extDateBuddha($row["d_tor_date_pa"])), //d_tor_date d_tor_status_date
            "d_tor_date" => ((empty($row["d_tor_date"])) ? "" : $date->extDateBuddha($row["d_tor_date"])), //d_tor_date d_tor_status_date
            "d_tor_status_date" => ((empty($row["d_tor_status_date"])) ? "" : $date->extDateBuddha($row["d_tor_status_date"])), //d_tor_date
            "d_doc_date" => ((empty($row["d_doc_date"])) ? "" : $date->extDateBuddha($row["d_doc_date"])), //d_tor_date
            "d_create" => $date->extDateBuddha($row["d_create"]), //
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "i_enabled" => intval($row["i_enabled"]),
            "tor_hdr_dtl" => intval($row["tor_hdr_dtl"]),
            "c_comment" => $row["c_comment"],
            "c_comment_status" => $row["c_comment_status"],
            "c_remake" => $row["c_remake"],
            "po_creditor_id" => intval($row["po_creditor_id"]),
            "po_creditor_idTxt" => $row["po_creditor_idTxt"],
            "i_type_contract" => $row["i_type_contract"],
            "i_hire_type" => $row["i_hire_type"],
            "i_is_inv" => $row["i_is_inv"],
            "i_type_fix_rate" => $row["i_type_fix_rate"],
            "i_product_type" => $row["i_product_type"],
            "i_delivery_date" => $row["i_delivery_date"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "bg_reserve_money5_id" => $row["bg_reserve_money5_id"],*/
        );
        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
    exit(); 
}