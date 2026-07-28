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
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
if ($_REQUEST["type"] == "deliveries") {

    $mode = $_REQUEST["mode"] ?? null;
    $wh = null;

    if ($mode == "SEARCH") {
        if ($_REQUEST["value"] != "") {

            if ($_REQUEST["filter"] == "c_code_po") {
                $wh    .= " AND a.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "c_code") {
                $wh    .= " AND cc.c_code LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "dc_creditor_tax_numbe") {
                $wh    .= " AND b.c_tax_number_imp LIKE '%" . $_REQUEST["value"] . "%' ";
            } else if ($_REQUEST["filter"] == "dc_creditor_name") {
                $wh    .= " AND b.c_name LIKE '%" . $_REQUEST["value"] . "%' ";
            }
        }
        if ($_REQUEST["i_type_contract"] > 0) {
            $wh .= " AND cc.i_type_contract = " . $_REQUEST["i_type_contract"];
        }
        if ($_REQUEST["i_budget_year"] > 0) {
            $wh .= " AND cc.i_pr_year = " . $_REQUEST["i_budget_year"];
        }
        if ($_REQUEST["i_year_contract"] > 0) {
            $wh .= " AND RIGHT(a.c_code,4) like '%" . ($_REQUEST["i_year_contract"] + 543) . "%'";
        }
    }
    $arrParam = array();
    $arrCountParam = array();
    $i_level = $_SESSION['i_level'];
    $dc_department = $_SESSION['dc_department_id'];
    $sp_emp_id = $_SESSION['sp_emp_id'];
    $ses = ' ';
    if ($i_level == 1) {
        $ses = ' ';
    } else if ($i_level == 2) {
        $ses = ' and bb.dc_department_id = ' . $dc_department;
    } else if ($i_level == 3) {
        $ses = ' and bb.sp_emp_id = ' . $sp_emp_id;
    }
    $sqlTempTable = "SELECT a.sp_tor_contract_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , b.c_tax_number_imp
                        , a.c_code
                        , a.d_doc_date
                        , a.d_due_date
                        , a.c_doc_ref
                        , a.f_total_amt
                        , a.i_is_po
                        , a.c_discription
                        , a.i_delivery
                        , a.i_type_fine
                        , a.f_fine
                        , a.i_is_join_venture
                        , a.i_contract_status 
                        , a.bg_reserve_i_last1 
                        , a.bg_reserve_i_last2 
                        ,isnull( a.dc_expense_budget_type_id , (select dc_expense_budget_type_id  from sp_tor where tor_id = a.sp_tor_id  ) ) as c_dc_expense_budget_type_id
                        , a.f_type_amt  as c_f_type_amt
                        , a.i_pr_type1  as c_i_pr_type1
                        , a.bg_reserve_money1_id as c_bg_reserve_money1_id
                        , a.dc_expense_budget_type2_id  as c_dc_expense_budget_type2_id
                        , a.f_type2_amt  as c_f_type2_amt 
                        , a.i_pr_type2  as c_i_pr_type2
                        , a.bg_reserve_money2_id as c_bg_reserve_money2_id 
                        , a.f_type3_amt as c_f_type3_amt
                        , a.bg_reserve_money3_id as c_bg_reserve_money3_id 
                        , ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
                    FROM dbo.sp_tor_contract a
                    INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id 
                    inner join dbo.sp_tor cc on cc.tor_id = a.sp_tor_id
                    INNER JOIN dbo.sp_emp bb on bb.sp_emp_id = cc.sp_emp_id {$ses}
                    WHERE a.parent_id = 0 and a.c_code is not null and a.i_contract_status > 0 {$wh} and cc.i_type_bg <> 2  and cc.i_is_notor in (0,2)"; // cc.c_code is not null  and cc.i_type_bg in(1,8)   and  
    //    echo $sqlTempTable; 
    //    exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* "
        . ", s.c_code as tor_code
                ,  isnull(c.i_overlap,0)  as  i_overlap
                , isnull(c.bg_reserve_overlap_id,0) as bg_reserve_overlap_id
                , isnull(c.c_overlap,0) as c_overlap
                , isnull(c.i_booking_bg,0) as i_booking_bg
                , isnull(c.i_yyyy_overlap,0) as i_yyyy_overlap
                ,(select sum(i_is_last) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as i_last_period
                ,(select count(i_period) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as count_period
                ,(select top 1 convert(varchar, d_po_date, 120) from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as d_po_date
                , convert(varchar,isnull((select top 1 d_create from sp_doc_gen where ref_id = a.sp_tor_contract_id ORDER by i_value desc   ),''),120) as d_doc_create
                ,(select top 1 c_po_no from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as c_po_no
                , (select top 1 i_yyyy from dbo.sp_tor where tor_id = s.tor_id)  as i_yyyy
                , s.dc_expense_budget_type_id
                , s.po_expense_id
                , s.c_budget_dtl_project
                ,   CASE
                WHEN s.i_is_notor=1 THEN (select c_name from dbo.sp_tor_contract where sp_tor_id=s.tor_id)
                ELSE s.c_name
                END AS c_name
                , s.c_department
                , s.d_doc_ref
                , convert(varchar, s.d_tor_date, 120) AS d_tor_date
                , (select top 1 c_name from sp_type_status where sp_type_status_id=s.tor_type_id)  as tor_type_name
                , isnull(s.i_purchase,1) as i_purchase
                , isnull(s.i_type_contract,1) as i_type_contract
                , isnull(s.tor_type_id,1) as tor_type_id
                , s.f_period_amt
                , isnull(s.i_parent,0) as i_parent
                , isnull(s.i_is_parent,0) as i_is_parent
                , s.start_date
                , s.end_date
                , s.c_comment
                , s.c_remake
                , s.i_yyyy as i_year
                , convert(varchar, a.d_due_date, 120) as d_due_date
                , convert(varchar, a.d_doc_date, 120) as d_doc_date
                , convert(varchar, c.d_contract_receiving_date, 120) as d_contract_receiving_date
                , convert(varchar, c.d_contract_start_date, 120) as d_contract_start_date
                , convert(varchar, c.d_start_date, 120) as d_start_date
                , (select top 1 inv_name FROM NMU.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id)  as dc_creditor_idTxt
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost_id)  as dc_cost_idTxt
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost2_id)  as dc_cost2_idTxt
                , s.dc_cost2_id
                , (select top 1 c_name FROM " . DB_NMU_EIS . "bg_expense where bg_expense_id = s.po_expense_id) as c_expense_name
                , (select top 1 c_name from " . DB_CENTER . "dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id)  as c_expense_budget_type_name
                -- c_expense_name c_expense_budget_type_name
                , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                , convert(varchar, s.d_create, 120) as d_create
                , (select top 1 c_full_name from dc_user where dc_user_id=c.dc_user_update_id) as c_update_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                , convert(varchar, s.d_update, 120) as d_update
                , s.dc_expense_budget_type_id
                , s.f_type_amt
                , s.dc_expense_budget_type2_id
                , s.f_type2_amt
                , s.dc_expense_budget_type3_id
                , s.f_type3_amt
                , s.dc_expense_budget_type4_id
                , s.f_type4_amt
                , s.dc_expense_budget_type5_id
                , s.f_type5_amt        
                , s.i_pr_type1 
                , s.i_pr_type2 
                , s.i_pr_type3
                , s.i_pr_type4 
                , s.i_pr_type5
                , c.i_type_guarantee
                , isnull((select top 1 dc_bg_budget_type_id from dbo.sp_tor_dtl where sp_tor_id=s.tor_id),0) as dtl_dc_expense_budget_type_id  
                , isnull((select top 1 i_pr_type1 from dbo.sp_tor_dtl where sp_tor_id=s.tor_id),0) as dtl_i_pr_type 
                , isnull(s.i_type_bg,0) as i_type_bg 
                ,case when   isnull (c.i_overlap,0) != 3 and  isnull(s.i_type_bg,0) = 4    then 1 when   isnull(c.i_overlap,0) = 3   then  2 
                else  0 end   as i_status_overlap  -- 0 ปกติ  1 กันเหลื่อมยังไม่ก่อหนี้    2 กันเหลื่อม ก่อหนี้แล้ว   
                , s.dc_cost_id
                , s.i_is_notor  
                , s.i_purchase 
                , c.i_working_day
                , s.i_working_type
                , case  when c.book_cm_receive_tran_hdr_id is not null then 1   -- เงินสด 
                        when c.cashiercheque_on  is not null then 8     --แคชเชียร์เช็ค
                        when c.book_warranty_no  is not null then 9     -- หนังสือค้ำประกัน 
                        else 0 end as i_is_book 
                , isnull(s.i_is_upload,0) as i_is_upload
                , CASE
                WHEN s.i_purchase = 1 THEN 'i_purchase 1' 
                        ELSE 'i_purchase 2,3'
                END AS i_purchaseText
                            , c.i_is_warranty
                            , c.i_is_warranty_book
                            , c.book_no
                            , c.book_seq
                            , CONVERT(VARCHAR, c.d_book_date, 120) AS d_book_date
                            , c.f_warranty_amt
                            , c.c_remark
                            , c.cashiercheque_on 
                            , c.cashiercheque_seq
                            , isnull(CONVERT(VARCHAR, c.d_cashiercheque_data, 120),'') AS d_cashiercheque_data
                            , c.f_warranty_cashiercheque
                            , c.c_remark_cashiercheque
                            , c.book_warranty_no
                            , CONVERT(VARCHAR, c.d_book_warranty_date, 120) AS d_book_warranty_date
                            , c.dc_bank_id
                            , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = c.dc_bank_id) AS dc_bank_idID_Name
                            , c.f_book_warranty_amt
                            , CONVERT(VARCHAR, c.d_book_warranty_end, 120) AS d_book_warranty_end
                            , c.c_remark1
                            , (select i_type from sp_type_bg where i_value =  s.i_type_bg ) as sp_type_bg 
                            , s.c_code as pr_code
            "
        . " from ({$sqlTempTable}) a "
        . "inner join dbo.sp_tor s on s.tor_id = sp_tor_id "
        . "inner join dbo.sp_tor_contract c on c.sp_tor_contract_id=a.sp_tor_contract_id "
        . " WHERE row > ? and row <= ?";
    if (@$_REQUEST["show_sql"]) {
        /******echo sql******/
        $sql = (@$sqlMain) ? $sqlMain : $sql;
        $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

        $sql = str_replace('?', '#-#', $sql);
        foreach ($arr as $fld => $value) {
            $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
        }
        echo $sql;
        exit;
        /********************/
    }
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    while ($row = $db->Fetch($stmt)) {
        switch (intval($row["i_type_bg"])) {
            case 8:
                $i_type = true;
                break;
            case 11:
                $i_type = true;
                break;
            default:
                $i_type = false;
                break;
        }
        // if ($row['i_purchase'] == 1) {
        //     $dtl1 = $db->GetDataBySQL("select sp_tor_id  
        //                                     ,bg_type1  as dc_expense_budget_type_id
        //                                     ,bg_type2  as dc_expense_budget_type2_id
        //                                     ,bg_type3  as dc_expense_budget_type3_id
        //                                     ,i_pr_type1
        //                                     ,i_pr_type2
        //                                     ,i_pr_type3
        //                                     ,f_unit_price1 as  f_type_amt
        //                                     ,f_unit_price2 as  f_type2_amt 
        //                                     ,f_unit_price3 as  f_type3_amt
        //                                     ,bg_reserve_money_id1  
        //                                     ,bg_reserve_money_id2 as bg_reserve_money2_id
        //                                     ,bg_reserve_money_id3 as bg_reserve_money3_id
        //                                     from dbo.view_dtl_purchase  where sp_tor_id = ? ", array($row["sp_tor_id"])); //$row["sp_tor_id"]
        // } else {
        $dtl1 = $db->GetDataBySQL("select   i_pr_type1
                                                    ,bg_reserve_money1_id as bg_reserve_money_id1
                                                    ,dc_expense_budget_type_id
                                                    ,f_type_amt
                                                    -- ชุด 2
                                                    ,i_pr_type2
                                                    ,bg_reserve_money2_id
                                                    ,dc_expense_budget_type2_id
                                                    ,f_type2_amt
                                                    -- ชุด 3
                                                    ,i_pr_type3
                                                    ,bg_reserve_money3_id
                                                    ,dc_expense_budget_type3_id
                                                    ,f_type3_amt  
                                                    from dbo.sp_tor where tor_id = ? ", array($row["sp_tor_id"])); //$row["sp_tor_id"]
        // }
        //   $dtl1 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 1", array($row["sp_tor_id"])); //$row["sp_tor_id"]
        //   $dtl2 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 2", array($row["sp_tor_id"])); //$row["sp_tor_id"]
        $temp = array(
            "no"                                => $i++,
            // contract                                    
            //แหล่งเงินที่ 1                                       
            "dtl_po_expense_id"                 => $row['po_expense_id'] ?? 0,
            "dtl_dc_bg_budget_type_id1"         =>  $dtl1['dc_expense_budget_type_id'] ?? 0,
            "dtl_i_pr_type1"                    => $dtl1['i_pr_type1'] ?? 0,
            "dtl_f_type_amt1"                   => number_format(($dtl1["f_type_amt"] ?? 0), 2),
            "bg_reserve_i_last1"                => intval($row["bg_reserve_i_last1"]),
            "sp_type_bg"                        => intval($row["sp_type_bg"]),
            "i_working_type"                    => intval($row["i_working_type"]),
            "i_is_book"                         => intval($row["i_is_book"]),
            "i_type_check"                      => $i_type,
            //แหล่งเงินที่ 2                                    
            "dtl_po_expense_id2"                => $row['po_expense_id'] ?? 0,
            "i_is_upload"                       => $row['i_is_upload'],
            "dtl_dc_bg_budget_type_id2"         => $dtl1['dc_expense_budget_type2_id'] ?? 0,
            "dtl_i_pr_type2"                    =>  $dtl1['i_pr_type1'] ?? 0,
            "dtl_f_type_amt2"                   =>  number_format(($dtl1["f_type2_amt"] ?? 0), 2),
            "bg_reserve_i_last2"                => intval($row["bg_reserve_i_last2"]),
            //แหล่งเงินที่ 3                                    
            "dtl_po_expense_id3"                => $row['po_expense_id'] ?? 0,
            "dtl_dc_bg_budget_type_id3"         => $dtl1['dc_expense_budget_type3_id'] ?? 0,
            "dtl_i_pr_type3"                    =>  $dtl1['i_pr_type3'] ?? 0,
            "dtl_f_type_amt3"                   =>  number_format(($dtl1["f_type3_amt"] ?? 0), 2),
            "f_type_amt"                        => number_format($row["f_type_amt"], 2),
            "f_type2_amt"                       => number_format($row["f_type2_amt"], 2),
            "f_type3_amt"                       => number_format($row["f_type3_amt"], 2),
            "f_type4_amt"                       => number_format($row["f_type4_amt"], 2),
            "f_type5_amt"                       => number_format($row["f_type5_amt"], 2),
            "i_pr_type1"                        =>  $row["i_pr_type1"],
            "i_pr_type2"                        =>  $row["i_pr_type2"],
            "i_pr_type3"                        => $row["i_pr_type3"],
            "i_pr_type4"                        => $row["i_pr_type4"],
            "i_pr_type5"                        => $row["i_pr_type5"],
            "c_dc_expense_budget_type_id"       => intval($row["c_dc_expense_budget_type_id"]),
            "c_dc_expense_budget_type2_id"      => intval($row["c_dc_expense_budget_type2_id"]),
            "c_f_type_amt"                      => number_format($row["c_f_type_amt"], 2),
            "c_f_type2_amt"                     => number_format($row["c_f_type2_amt"], 2),
            "c_f_type3_amt"                     => number_format($row["c_f_type3_amt"], 2),
            "c_i_pr_type1"                      => $row["c_i_pr_type1"],
            "c_i_pr_type2"                      => $row["c_i_pr_type2"],
            "i_type_bg"                         => $row["i_type_bg"],
            "i_overlap"                         => $row["i_overlap"],
            "i_status_overlap"                  => $row["i_status_overlap"],
            "pr_code"                           => $row["pr_code"],
            "c_bg_reserve_money1_id"            => intVal($row["c_bg_reserve_money1_id"]),
            "c_bg_reserve_money2_id"            => intVal($row["c_bg_reserve_money2_id"]),
            "c_bg_reserve_money3_id"            => intVal($row["c_bg_reserve_money3_id"]),
            "dtl_i_pr_type"                     => $row["dtl_i_pr_type"],
            "dtl_dc_expense_budget_type_id"     => intVal($row["dtl_dc_expense_budget_type_id"]),
            "dc_cost_id"                        => $row["dc_cost_id"],
            "i_is_join_venture"                 => $row["i_is_join_venture"],
            "dc_cost2_id"                       => $row["dc_cost2_id"],
            "bg_reserve_overlap_id"             => intVal($row["bg_reserve_overlap_id"]),
            "c_overlap"                         => $row["c_overlap"],
            "i_booking_bg"                      => $row["i_booking_bg"],
            "i_yyyy_overlap"                    => $row["i_yyyy_overlap"],
            "d_doc_create"                      => ((empty($row["d_doc_create"])) ? "" : $date->extDateBuddha($row["d_doc_create"])), // $row["d_cashiercheque_data"],
            //-----------------------------                                    
            "i_is_warranty"                     => $row["i_is_warranty"],
            "i_is_warranty_book"                => $row["i_is_warranty_book"],
            "c_books_cashiercheque"             => $row["cashiercheque_on"],
            "c_receipt_cashiercheque"           => $row["cashiercheque_seq"],
            "d_cashiercheque_date"              => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])), // $row["d_cashiercheque_data"],
            "f_cashiercheque_warranty_amt2"     => $row["f_warranty_cashiercheque"],
            "c_comment2"                        => $row["c_remark_cashiercheque"],
            "c_books_receipt"                   => $row["book_no"],
            "c_receipt_no"                      => $row["book_seq"],
            "d_book_date"                       => ((empty($row["d_book_date"])) ? "" : $date->extDateBuddha($row["d_book_date"])),
            "f_warranty_amt"                    => $row["f_warranty_amt"],
            "c_remark"                          => $row["c_remark"],
            "c_doc_no"                          => $row["book_warranty_no"],
            "d_doc_date1"                       => ((empty($row["d_book_warranty_date"])) ? "" : $date->extDateBuddha($row["d_book_warranty_date"])),
            "dc_bank_id"                        => $row["dc_bank_id"],
            "dc_bank_idID_Name"                 => $row["dc_bank_idID_Name"],
            "f_warranty_amt1"                   => number_format($row["f_book_warranty_amt"], 2),
            "d_expire_warranty"                 => ((empty($row["d_book_warranty_end"])) ? "" : $date->extDateBuddha($row["d_book_warranty_end"])),
            "c_comment1"                        => $row["c_remark1"],

            //-----------------------------                                    


            "count_period"                      => intval($row["count_period"]),
            "sp_tor_id"                         => intval($row["sp_tor_id"]),
            "i_working_day"                     => intval($row["i_working_day"]),
            "sp_tor_contract_id"                => intval($row["sp_tor_contract_id"]),
            "i_is_po"                           => intval($row["i_is_po"]),
            "c_doc_ref"                         => $row["c_doc_ref"],
            "dc_creditor_idTxt"                 => $row["dc_creditor_idTxt"],
            "c_tax_number_imp"                  => $row["c_tax_number_imp"],
            "f_total_amt"                       => number_format($row["f_total_amt"], 2),
            "c_code"                            => $row["c_code"],
            "i_yyyy"                            => intval($row["i_yyyy"]), // i_yyyy dc_expense_budget_type_id po_expense_id
            "dc_expense_budget_type_id"         => intval($row["dc_expense_budget_type_id"]),
            "i_last_period"                     => intval($row["i_last_period"]),
            //                                    
            "c_expense_budget_type_name"        => $row["c_expense_budget_type_name"],
            "c_expense_name"                    => $row["c_expense_name"], //c_expense_name c_expense_budget_type_name
            //                                    
            "po_expense_id"                     => intval($row["po_expense_id"]),
            "c_budget_dtl_project"              => $row["c_budget_dtl_project"],
            "c_name"                            => $row["c_name"],
            "dc_cost_id"                        => intval(@$row["dc_cost_id"]),
            "i_is_notor"                        => intval(@$row["i_is_notor"]),
            "dc_cost_idTxt"                     => $row["dc_cost_idTxt"],
            "dc_department_id"                  => intval(@$row["dc_department_id"]),
            "c_department"                      => $row["c_department"],
            "i_parent"                          => $row["i_parent"],
            "i_is_parent"                       => $row["i_is_parent"],
            "d_tor_date"                        => $date->extDateBuddha($row["d_tor_date"]),
            "d_doc_ref"                         => $row["d_doc_ref"],
            "i_year"                            => $row["i_year"],
            "c_year"                            => intval($row["i_year"] + 543),
            "tor_type_id"                       => $row["tor_type_id"],
            "c_tor_type"                        => $row["tor_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_type_contract"                   => $row["i_type_contract"],
            "i_purchase"                        => $row["i_purchase"],
            "c_purchase"                        => $i_purchase[$row["i_purchase"]],
            "dc_user_create_id"                 => $row["c_create_name"],
            "dc_user_create_cost_id"            => $row["c_cost_creat_name"],
            "d_create"                          => $date->extDateBuddha($row["d_create"]),
            "dc_user_update_id"                 => $row["c_update_name"],
            "dc_user_update_cost_id"            => $row["c_cost_update_name"],
            "d_update"                          => $date->extDateBuddha($row["d_update"]),
            "start_date"                        => $date->extDateBuddha($row["start_date"]),
            "end_date"                          => $date->extDateBuddha($row["end_date"]),
            "c_comment"                         => $row["c_comment"],
            "c_remake"                          => $row["c_remake"],
            "dc_creditor_id"                    => intval($row["dc_creditor_id"]),
            "dc_creditor_idTxt"                 => $row["dc_creditor_idTxt"],
            "c_discription"                     => $row["c_discription"],
            "i_delivery"                        => $row["i_delivery"],
            "i_type_fine"                       => $row["i_type_fine"],
            "f_fine"                            => number_format($row["f_fine"], 2),
            "d_due_date"                        => $date->extDateBuddha($row["d_due_date"]),
            "d_po_date"                         => $row["d_po_date"] == null ? '' : $date->extDateBuddha($row["d_po_date"]),
            "d_doc_date"                        => $row["d_doc_date"] == null ? '' : $date->extDateBuddha($row["d_doc_date"]),
            "d_contract_start_date"             => $row["d_contract_start_date"] == null ? '' : $date->extDateBuddha($row["d_contract_start_date"]),
            "d_contract_receiving_date"         => $row["d_contract_receiving_date"] == null ? '' : $date->extDateBuddha($row["d_contract_receiving_date"]),
            "d_start_date"                      => $row["d_start_date"] == null ? '' : $date->extDateBuddha($row["d_start_date"]),
            "c_start_date"                      => $row["d_start_date"] == null ? '' : $row["d_start_date"],
            "c_doc_date"                        => $row["d_doc_date"] == null ? '' : $row["d_doc_date"],
            "c_due_date"                        => $row["d_due_date"] == null ? '' : $row["d_due_date"],
            "c_contract_start_date"             => $row["d_contract_start_date"] == null ? '' : $row["d_contract_start_date"],
            "c_contract_start_date"             => $row["d_contract_receiving_date"] == null ? '' : $row["d_contract_receiving_date"],
            "c_po_no"                           => $row["c_po_no"],
            "i_contract_status"                 => $row["i_contract_status"],
            "dc_expense_budget_type_id"         => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id"        => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id"        => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id"        => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id"        => intval($row["dc_expense_budget_type5_id"]),

        );

        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "deliveriesExt") {

    $act = $_REQUEST["act"] ?? null;
    $i_contract = $_REQUEST["i_contract"] ?? 0;
    $wh = null;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code LIKE '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and b.c_name LIKE '%" . $_REQUEST['c_name'] . "%'" : "";
        $wh .= " and cc.i_type_bg = " . $i_contract;
    } else {
        $wh .= " and cc.i_type_bg = 8";
    }
    $ses = ($_SESSION['user_id'] == 1) ? "" : " and bb.dc_department_id = " . $_SESSION['dc_department_id'];
    $arrParam = array();
    $arrCountParam = array();

    $sqlTempTable = "SELECT a.sp_tor_contract_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , b.c_tax_number_imp
                        , a.c_code
                        , a.d_doc_date
                        , a.d_due_date
                        , a.c_doc_ref
                        , a.f_total_amt
                        , a.i_is_po
                        , a.c_discription
                        , a.i_delivery
                        , a.i_type_fine
                        , a.f_fine 
                        , a.i_contract_status 
                        , a.bg_reserve_i_last1 
                        , a.bg_reserve_i_last2 
                        ,isnull( a.dc_expense_budget_type_id , (select dc_expense_budget_type_id  from sp_tor where tor_id = a.sp_tor_id  ) ) as c_dc_expense_budget_type_id
                        , a.f_type_amt  as c_f_type_amt
                        , a.i_pr_type1  as c_i_pr_type1
                        , a.bg_reserve_money1_id as c_bg_reserve_money1_id
                        , a.dc_expense_budget_type2_id  as c_dc_expense_budget_type2_id
                        , a.f_type2_amt  as c_f_type2_amt 
                        , a.i_pr_type2  as c_i_pr_type2
                        , a.bg_reserve_money2_id as c_bg_reserve_money2_id  
                        , ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
                    FROM dbo.sp_tor_contract a 
                    INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id 
                    inner join dbo.sp_tor cc on cc.tor_id = a.sp_tor_id
                    INNER JOIN dbo.sp_emp bb on bb.sp_emp_id = cc.sp_emp_id {$ses}
                    WHERE 1=1 {$wh}"; //
    //    echo $sqlTempTable;
    //    exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* "
        . ", s.c_code as tor_code
                ,(select sum(i_is_last) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as i_last_period
                ,(select count(i_period) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as count_period
                ,(select top 1 convert(varchar, d_po_date, 120) from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as d_po_date
                ,(select top 1 c_po_no from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as c_po_no
                , (select top 1 i_yyyy from dbo.sp_tor where tor_id = s.tor_id)  as i_yyyy
                , s.dc_expense_budget_type_id
                , s.po_expense_id
                , s.c_budget_dtl_project
                ,   CASE
                WHEN s.i_is_notor=1 THEN (select c_name from dbo.sp_tor_contract where sp_tor_id=s.tor_id)
                ELSE s.c_name
                END AS c_name
                , s.c_department
                , s.d_doc_ref
                , convert(varchar, s.d_tor_date, 120) AS d_tor_date
                , (select top 1 c_name from sp_type_status where sp_type_status_id=s.tor_type_id)  as tor_type_name
                , isnull(s.i_purchase,1) as i_purchase
                , isnull(s.i_type_contract,1) as i_type_contract
                , isnull(s.tor_type_id,1) as tor_type_id
                , s.f_period_amt
                , isnull(s.i_parent,0) as i_parent
                , isnull(s.i_is_parent,0) as i_is_parent
                , s.start_date
                , s.end_date
                , s.c_comment
                , s.c_remake
                , s.i_yyyy as i_year
                , convert(varchar, a.d_due_date, 120) as d_due_date
                , convert(varchar, a.d_doc_date, 120) as d_doc_date
                , (select top 1 inv_name FROM NMU.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id)  as dc_creditor_idTxt
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost_id)  as dc_cost_idTxt
                  --- dc_expense_budget_type_id po_expense_id
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost2_id)  as dc_cost2_idTxt
                , s.dc_cost2_id
                , (select top 1 c_name FROM nmu..bg_expense where bg_expense_id = s.po_expense_id) as c_expense_name
                , (select top 1 c_name from dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id)  as c_expense_budget_type_name
                -- c_expense_name c_expense_budget_type_name
                , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                , convert(varchar, s.d_create, 120) as d_create
                , (select top 1 c_full_name from dc_user where dc_user_id=c.dc_user_update_id) as c_update_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                , convert(varchar, s.d_update, 120) as d_update
                , s.dc_expense_budget_type_id
                , s.f_type_amt
                , s.dc_expense_budget_type2_id
                , s.f_type2_amt
                , s.dc_expense_budget_type3_id
                , s.f_type3_amt
                , s.dc_expense_budget_type4_id
                , s.f_type4_amt
                , s.dc_expense_budget_type5_id
                , s.f_type5_amt        
                , s.i_pr_type1 
                , s.i_pr_type2 
                , s.i_pr_type3
                , s.i_pr_type4 
                , s.i_pr_type5
                , isnull((select top 1 dc_bg_budget_type_id from dbo.sp_tor_dtl where sp_tor_id=s.tor_id),0) as dtl_dc_expense_budget_type_id  
                , isnull((select top 1 i_pr_type1 from dbo.sp_tor_dtl where sp_tor_id=s.tor_id),0) as dtl_i_pr_type  
                , s.dc_cost_id
                , s.i_is_notor
                , s.i_purchase 
                , CASE
                WHEN s.i_purchase = 1 THEN 'i_purchase 1' 
                        ELSE 'i_purchase 2,3'
                END AS i_purchaseText
                            , c.i_is_warranty
                            , c.i_is_warranty_book
                            , c.book_no
                            , c.book_seq
                            , CONVERT(VARCHAR, c.d_book_date, 120) AS d_book_date
                            , c.f_warranty_amt
                            , c.c_remark
                            , c.cashiercheque_on 
                            , c.cashiercheque_seq
                            , isnull(CONVERT(VARCHAR, c.d_cashiercheque_data, 120),'') AS d_cashiercheque_data
                            , c.f_warranty_cashiercheque
                            , c.c_remark_cashiercheque
                            , c.book_warranty_no
                            , CONVERT(VARCHAR, c.d_book_warranty_date, 120) AS d_book_warranty_date
                            , c.dc_bank_id
                            , (SELECT c_code+' '+c_name FROM dc_bank aa WHERE aa.dc_bank_id = c.dc_bank_id) AS dc_bank_idID_Name
                            , c.f_book_warranty_amt
                            , CONVERT(VARCHAR, c.d_book_warranty_end, 120) AS d_book_warranty_end
                            , c.c_remark1
                            , s.i_type_bg
            "
        . " from ({$sqlTempTable}) a "
        . "inner join dbo.sp_tor s on s.tor_id = sp_tor_id "
        . "inner join dbo.sp_tor_contract c on c.sp_tor_contract_id=a.sp_tor_contract_id "
        . " WHERE row > ? and row <= ?";
    //     echo $sqlMain . '/*';
    //    print_r($arrParam);
    //    echo '*/';
    // /******echo sql******/
    // $sql = (@$sqlMain) ? $sqlMain : $sql;
    // $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

    // $sql = str_replace('?', '#-#', $sql);
    // foreach ($arr as $fld => $value) {
    //  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
    // }
    // echo $sql; exit;
    /********************/
    //    exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    while ($row = $db->Fetch($stmt)) {


        $dtl1 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 1", array($row["sp_tor_id"])); //$row["sp_tor_id"]
        $dtl2 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 2", array($row["sp_tor_id"])); //$row["sp_tor_id"]

        $temp = array(
            "no" => $i++,

            "dtl_po_expense_id1" => $dtl1['po_expense_id'] ?? 0,
            "dtl_dc_bg_budget_type_id1" =>  $dtl1['dc_bg_budget_type_id'] ?? 0,
            "dtl_i_pr_type1" => $dtl1['i_pr_type1'] ?? 0,
            "dtl_f_type_amt1" => number_format(($dtl1["f_unit_price"] ?? 0), 2),
            "bg_reserve_i_last1" => intval($row["bg_reserve_i_last1"]),
            "i_type_bg" => intval($row["i_type_bg"]),

            "dtl_po_expense_id2" => $dtl2['po_expense_id'] ?? 0,
            "dtl_dc_bg_budget_type_id2" => $dtl2['dc_bg_budget_type_id'] ?? 0,
            "dtl_i_pr_type2" =>  $dtl2['i_pr_type1'] ?? 0,
            "dtl_f_type_amt2" =>  number_format(($dtl2["f_unit_price"] ?? 0), 2),
            "bg_reserve_i_last2" => intval($row["bg_reserve_i_last2"]),

            //-----------------------------
            "i_is_warranty" => $row["i_is_warranty"],
            "i_is_warranty_book" => $row["i_is_warranty_book"],
            "c_books_cashiercheque" => $row["cashiercheque_on"],
            "c_receipt_cashiercheque" => $row["cashiercheque_seq"],
            "d_cashiercheque_date" => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])), // $row["d_cashiercheque_data"],
            "f_cashiercheque_warranty_amt2" => $row["f_warranty_cashiercheque"],
            "c_comment2" => $row["c_remark_cashiercheque"],
            "c_books_receipt" => $row["book_no"],
            "c_receipt_no" => $row["book_seq"],
            "d_book_date" => ((empty($row["d_book_date"])) ? "" : $date->extDateBuddha($row["d_book_date"])),
            "f_warranty_amt" => $row["f_warranty_amt"],
            "c_remark" => $row["c_remark"],
            "c_doc_no" => $row["book_warranty_no"],
            "d_doc_date1" => ((empty($row["d_book_warranty_date"])) ? "" : $date->extDateBuddha($row["d_book_warranty_date"])),
            "dc_bank_id" => $row["dc_bank_id"],
            "dc_bank_idID_Name" => $row["dc_bank_idID_Name"],
            "f_warranty_amt1" => number_format($row["f_book_warranty_amt"], 2),
            "d_expire_warranty" => ((empty($row["d_book_warranty_end"])) ? "" : $date->extDateBuddha($row["d_book_warranty_end"])),
            "c_comment1" => $row["c_remark1"],

            //-----------------------------


            "count_period" => intval($row["count_period"]),
            "sp_tor_id" => intval($row["sp_tor_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_is_po" => intval($row["i_is_po"]),
            "c_doc_ref" => $row["c_doc_ref"],
            "dc_creditor_idTxt" => $row["dc_creditor_idTxt"],
            "c_tax_number_imp" => $row["c_tax_number_imp"],
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "c_code" => $row["c_code"],
            "i_yyyy" => intval($row["i_yyyy"]), // i_yyyy dc_expense_budget_type_id po_expense_id
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "i_last_period" => intval($row["i_last_period"]),
            //
            "c_expense_budget_type_name" => $row["c_expense_budget_type_name"],
            "c_expense_name" => $row["c_expense_name"], //c_expense_name c_expense_budget_type_name
            //
            "po_expense_id" => intval($row["po_expense_id"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "dc_cost_id" => intval(@$row["dc_cost_id"]),
            "i_is_notor" => intval(@$row["i_is_notor"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_department_id" => intval(@$row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_tor_date" => $date->extDateBuddha($row["d_tor_date"]),
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_year"],
            "c_year" => intval($row["i_year"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["tor_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_type_contract" => $row["i_type_contract"],
            "i_purchase" => $row["i_purchase"],
            "c_purchase" => $i_purchase[$row["i_purchase"]],
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
            "c_discription" => $row["c_discription"],
            "i_delivery" => $row["i_delivery"],
            "i_type_fine" => $row["i_type_fine"],
            "f_fine" => number_format($row["f_fine"], 2),
            "d_due_date" => $date->extDateBuddha($row["d_due_date"]),
            "d_po_date" => $row["d_po_date"] == null ? '' : $date->extDateBuddha($row["d_po_date"]),
            "d_doc_date" => $row["d_doc_date"] == null ? '' : $date->extDateBuddha($row["d_doc_date"]),
            "c_doc_date" => $row["d_doc_date"] == null ? '' : $row["d_doc_date"],
            "c_due_date" => $row["d_due_date"] == null ? '' : $row["d_due_date"],
            "c_po_no" => $row["c_po_no"],
            "i_contract_status" => $row["i_contract_status"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),

            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => (($row["i_purchase"] == 1) ? $row["c_i_pr_type1"] : $row["i_pr_type1"]),
            "i_pr_type2" => (($row["i_purchase"] == 1) ? $row["c_i_pr_type2"] : $row["i_pr_type2"]),
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "c_dc_expense_budget_type_id" => intval($row["c_dc_expense_budget_type_id"]),
            "c_dc_expense_budget_type2_id" => intval($row["c_dc_expense_budget_type2_id"]),
            "c_f_type_amt" => number_format($row["c_f_type_amt"], 2),
            "c_f_type2_amt" => number_format($row["c_f_type2_amt"], 2),
            "c_i_pr_type1" => $row["c_i_pr_type1"],
            "c_i_pr_type2" => $row["c_i_pr_type2"],
            "c_bg_reserve_money1_id" => intVal($row["c_bg_reserve_money1_id"]),
            "c_bg_reserve_money2_id" => intVal($row["c_bg_reserve_money2_id"]),
            "dtl_i_pr_type" => $row["dtl_i_pr_type"],
            "dtl_dc_expense_budget_type_id" => intVal($row["dtl_dc_expense_budget_type_id"]),
            "dc_cost_id" => $row["dc_cost_id"],
            "dc_cost2_id" => $row["dc_cost2_id"],
        );

        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "project") {
    $act = $_REQUEST["act"] ?? null;
    $wh = null;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code LIKE '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and b.c_name LIKE '%" . $_REQUEST['c_name'] . "%'" : "";
    }
    // $ses = ($_SESSION['user_id'] == 1) ? "" : " and bb.dc_department_id = " . $_SESSION['dc_department_id'];
    $arrParam = array();
    $arrCountParam = array();
    $i_level = $_SESSION['i_level'];
    $dc_department = $_SESSION['dc_department_id'];
    $sp_emp_id = $_SESSION['sp_emp_id'];
    $ses = null;
    if ($i_level == 1) {
        $ses = ' ';
    } else if ($i_level == 2) {
        $ses = ' and bb.dc_department_id = ' . $dc_department;
    } else if ($i_level == 3) {
        $ses = ' and bb.sp_emp_id = ' . $sp_emp_id;
    }
    $sqlTempTable = "SELECT a.sp_tor_contract_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , b.c_tax_number_imp
                        , a.c_code
                        , a.d_doc_date
                        , a.d_due_date
                        , a.c_doc_ref
                        , a.f_total_amt
                        , a.i_is_po 
                        , a.i_delivery
                        , a.i_type_fine
                        , a.f_fine
                        , a.i_contract_status 
                        , a.bg_reserve_i_last1 
                        , a.bg_reserve_i_last2 
                        ,isnull( a.dc_expense_budget_type_id , (select dc_expense_budget_type_id  from sp_tor where tor_id = a.sp_tor_id  ) ) as c_dc_expense_budget_type_id
                        , a.f_type_amt  as c_f_type_amt
                        , a.i_pr_type1  as c_i_pr_type1
                        , a.bg_reserve_money1_id as c_bg_reserve_money1_id
                        , a.dc_expense_budget_type2_id  as c_dc_expense_budget_type2_id
                        , a.f_type2_amt  as c_f_type2_amt 
                        , a.i_pr_type2  as c_i_pr_type2
                        , a.bg_reserve_money2_id as c_bg_reserve_money2_id
                        
                        , ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
                    FROM dbo.sp_tor_contract a
                    INNER JOIN NMU.dbo.dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id 
					inner join dbo.sp_tor cc on cc.tor_id = a.sp_tor_id
                                        INNER JOIN dbo.sp_emp bb on bb.sp_emp_id = cc.sp_emp_id {$ses}
                    WHERE cc.i_type_bg in (2) and a.i_contract_status > 0 {$wh}"; //
    //    echo $sqlTempTable;
    //    exit;   
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* "
        . ", s.c_code as tor_code
                ,(select sum(i_is_last) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as i_last_period
                ,(select count(i_period) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as count_period
                ,(select top 1 convert(varchar, d_po_date, 120) from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as d_po_date
                ,(select top 1 c_po_no from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as c_po_no
                , (select top 1 i_yyyy from dbo.sp_tor where tor_id = s.tor_id)  as i_yyyy
                , s.dc_expense_budget_type_id
                , s.po_expense_id
                , s.c_budget_dtl_project
                ,   CASE
                WHEN s.i_is_notor=1 THEN (select c_name from dbo.sp_tor_contract where sp_tor_id=s.tor_id)
                ELSE s.c_name
                END AS c_name
                , s.c_department
                , s.d_doc_ref
                , convert(varchar, s.d_tor_date, 120) AS d_tor_date
                , (select top 1 c_name from sp_type_status where sp_type_status_id=s.tor_type_id)  as tor_type_name
                , isnull(s.i_purchase,1) as i_purchase
                , isnull(s.i_type_contract,1) as i_type_contract
                , isnull(s.tor_type_id,1) as tor_type_id
                , s.f_period_amt
                , isnull(s.i_parent,0) as i_parent
                , isnull(s.i_is_parent,0) as i_is_parent
                , s.start_date
                , s.end_date
                , s.c_comment
                , c.c_remark 
                , c.c_discription
                , s.i_yyyy as i_year
                , convert(varchar, a.d_due_date, 120) as d_due_date
                , convert(varchar, a.d_doc_date, 120) as d_doc_date
                , (select top 1 inv_name FROM " . DB_NMU . "dc_creditor where dc_creditor_id=a.dc_creditor_id)  as dc_creditor_idTxt
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost_id)  as dc_cost_idTxt
                  --- dc_expense_budget_type_id po_expense_id
                , (select top 1 c_name FROM " . DB_NMU_EIS . "  bg_expense where bg_expense_id=s.po_expense_id) as c_expense_name
                , (select top 1 c_name from dc_expense_budget_type where dc_expense_budget_type_id=s.dc_expense_budget_type_id)  as c_expense_budget_type_name
                -- c_expense_name c_expense_budget_type_name
                , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                , convert(varchar, s.d_create, 120) as d_create
                , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                , convert(varchar, s.d_update, 120) as d_update
                , s.dc_expense_budget_type_id
                , s.f_type_amt
                , s.dc_expense_budget_type2_id
                , s.f_type2_amt
                , s.dc_expense_budget_type3_id
                , s.f_type3_amt
                , s.dc_expense_budget_type4_id
                , s.f_type4_amt
                , s.dc_expense_budget_type5_id
                , s.f_type5_amt        
                , s.i_pr_type1 
                , s.i_pr_type2 
                , s.i_pr_type3
                , s.i_pr_type4 
                , s.i_pr_type5
                , isnull((select top 1 dc_bg_budget_type_id from dbo.sp_tor_dtl where sp_tor_id=s.tor_id),0) as dtl_dc_expense_budget_type_id  
                , isnull((select top 1 i_pr_type1 from dbo.sp_tor_dtl where sp_tor_id=s.tor_id),0) as dtl_i_pr_type  
                , s.dc_cost_id
                , s.dc_cost2_id
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost2_id)  as dc_cost2_idTxt
                , s.i_is_notor
                , s.i_purchase 
                , c.i_is_join_venture
                , CASE
                WHEN s.i_purchase = 1 THEN 'i_purchase 1' 
                        ELSE 'i_purchase 2,3'
                END AS i_purchaseText
            "
        . " from ({$sqlTempTable}) a "
        . " inner join dbo.sp_tor s on s.tor_id = a.sp_tor_id"
        . " inner join dbo.sp_tor_contract c on c.sp_tor_id = a.sp_tor_id"
        . " WHERE row > ? and row <= ?";
    //     echo $sqlMain . '/*';
    //    print_r($arrParam);
    //    echo '*/';
    //    exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    while ($row = $db->Fetch($stmt)) {
        $dtl1 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 1", array($row["sp_tor_id"])); //$row["sp_tor_id"]
        $dtl2 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 2", array($row["sp_tor_id"])); //$row["sp_tor_id"]

        $temp = array(
            "no" => $i++,

            "dtl_po_expense_id1" => $dtl1['po_expense_id'] ?? 0,
            "dtl_dc_bg_budget_type_id1" =>  $dtl1['dc_bg_budget_type_id'] ?? 0,
            "dtl_i_pr_type1" => $dtl1['i_pr_type1'] ?? 0,
            "dtl_f_type_amt1" => number_format(($dtl1["f_unit_price"] ?? 0), 2),
            "bg_reserve_i_last1" => intval($row["bg_reserve_i_last1"]),


            "dtl_po_expense_id2" => $dtl2['po_expense_id'] ?? 0,
            "dtl_dc_bg_budget_type_id2" => $dtl2['dc_bg_budget_type_id'] ?? 0,
            "dtl_i_pr_type2" =>  $dtl2['i_pr_type1'] ?? 0,
            "dtl_f_type_amt2" =>  number_format(($dtl2["f_unit_price"] ?? 0), 2),
            "bg_reserve_i_last2" => intval($row["bg_reserve_i_last2"]),

            //----------------------------- 
            "count_period" => intval($row["count_period"]),
            "sp_tor_id" => intval($row["sp_tor_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_is_po" => intval($row["i_is_po"]),
            "c_doc_ref" => $row["c_doc_ref"],
            "dc_creditor_idTxt" => $row["dc_creditor_idTxt"],
            "c_tax_number_imp" => $row["c_tax_number_imp"],
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "c_code" => $row["c_code"],
            "i_yyyy" => intval($row["i_yyyy"]), // i_yyyy dc_expense_budget_type_id po_expense_id
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "i_last_period" => intval($row["i_last_period"]),
            //
            "c_expense_budget_type_name" => $row["c_expense_budget_type_name"],
            "c_expense_name" => $row["c_expense_name"], //c_expense_name c_expense_budget_type_name
            //
            "po_expense_id" => intval($row["po_expense_id"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "i_is_notor" => intval(@$row["i_is_notor"]),
            "dc_cost_id" => intval(@$row["dc_cost_id"]),
            "dc_cost_idTxt" => $row["dc_cost_idTxt"],
            "dc_cost2_id" => intval(@$row["dc_cost2_id"]),
            "dc_cost2_idTxt" => $row["dc_cost2_idTxt"],
            "dc_department_id" => intval(@$row["dc_department_id"]),
            "c_department" => $row["c_department"],
            "i_parent" => $row["i_parent"],
            "i_is_parent" => $row["i_is_parent"],
            "d_tor_date" => $date->extDateBuddha($row["d_tor_date"]),
            "d_doc_ref" => $row["d_doc_ref"],
            "i_year" => $row["i_year"],
            "c_year" => intval($row["i_year"] + 543),
            "tor_type_id" => $row["tor_type_id"],
            "c_tor_type" => $row["tor_type_name"], // $tor_type[$row["tor_type_id"]],
            "i_type_contract" => $row["i_type_contract"],
            "i_purchase" => $row["i_purchase"],
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "d_create" => $date->extDateBuddha($row["d_create"]),
            "dc_user_update_id" => $row["c_update_name"],
            "i_is_join_venture" => $row["i_is_join_venture"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),
            "start_date" => $date->extDateBuddha($row["start_date"]),
            "end_date" => $date->extDateBuddha($row["end_date"]),
            "c_comment" => $row["c_comment"],
            "c_remark" => $row["c_remark"],
            "dc_creditor_id" => intval($row["dc_creditor_id"]),
            "dc_creditor_idTxt" => $row["dc_creditor_idTxt"],
            "c_discription" => $row["c_discription"],
            "i_delivery" => $row["i_delivery"],
            "i_type_fine" => $row["i_type_fine"],
            "f_fine" => number_format($row["f_fine"], 2),
            "d_due_date" => $date->extDateBuddha($row["d_due_date"]),
            "d_po_date" => $row["d_po_date"] == null ? '' : $date->extDateBuddha($row["d_po_date"]),
            "d_doc_date" => $row["d_doc_date"] == null ? '' : $date->extDateBuddha($row["d_doc_date"]),
            "c_doc_date" => $row["d_doc_date"] == null ? '' : $row["d_doc_date"],
            "c_due_date" => $row["d_due_date"] == null ? '' : $row["d_due_date"],
            "c_po_no" => $row["c_po_no"],
            "i_contract_status" => $row["i_contract_status"],
            "dc_expense_budget_type_id" => intval($row["dc_expense_budget_type_id"]),
            "dc_expense_budget_type2_id" => intval($row["dc_expense_budget_type2_id"]),
            "dc_expense_budget_type3_id" => intval($row["dc_expense_budget_type3_id"]),
            "dc_expense_budget_type4_id" => intval($row["dc_expense_budget_type4_id"]),
            "dc_expense_budget_type5_id" => intval($row["dc_expense_budget_type5_id"]),

            "f_type_amt" => number_format($row["f_type_amt"], 2),
            "f_type2_amt" => number_format($row["f_type2_amt"], 2),
            "f_type3_amt" => number_format($row["f_type3_amt"], 2),
            "f_type4_amt" => number_format($row["f_type4_amt"], 2),
            "f_type5_amt" => number_format($row["f_type5_amt"], 2),
            "i_pr_type1" => (($row["i_purchase"] == 1) ? $row["c_i_pr_type1"] : $row["i_pr_type1"]),
            "i_pr_type2" => (($row["i_purchase"] == 1) ? $row["c_i_pr_type2"] : $row["i_pr_type2"]),
            "i_pr_type3" => $row["i_pr_type3"],
            "i_pr_type4" => $row["i_pr_type4"],
            "i_pr_type5" => $row["i_pr_type5"],
            "c_dc_expense_budget_type_id" => intval($row["c_dc_expense_budget_type_id"]),
            "c_dc_expense_budget_type2_id" => intval($row["c_dc_expense_budget_type2_id"]),
            "c_f_type_amt" => number_format($row["c_f_type_amt"], 2),
            "c_f_type2_amt" => number_format($row["c_f_type2_amt"], 2),
            "c_i_pr_type1" => $row["c_i_pr_type1"],
            "c_i_pr_type2" => $row["c_i_pr_type2"],
            "c_bg_reserve_money1_id" => intVal($row["c_bg_reserve_money1_id"]),
            "c_bg_reserve_money2_id" => intVal($row["c_bg_reserve_money2_id"]),
            "dtl_i_pr_type" => $row["dtl_i_pr_type"],
            "dtl_dc_expense_budget_type_id" => intVal($row["dtl_dc_expense_budget_type_id"]),
            "dc_cost_id" => $row["dc_cost_id"],
        );

        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
