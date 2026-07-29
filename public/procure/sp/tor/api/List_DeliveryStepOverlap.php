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

    $act    = $_REQUEST["act"] ?? null;
    $wh     = null; 
    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code LIKE '%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and b.c_name LIKE '%" . $_REQUEST['c_name'] . "%'" : "";
    }
    $ses = ($_SESSION['user_id'] == 1) ? "" : " and bb.dc_department_id = " . $_SESSION['dc_department_id'];
    $arrParam = array();
    $arrCountParam = array();

    $sqlTempTable = "SELECT a.sp_tor_contract_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , (select c_tax_number_imp from NMU.dbo.dc_creditor where dc_creditor_id = a.dc_creditor_id ) as c_tax_number_imp
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
                        , isnull( a.dc_expense_budget_type_id 
                        , (select dc_expense_budget_type_id  from sp_tor where tor_id = a.sp_tor_id  ) ) as c_dc_expense_budget_type_id
                        , a.f_type_amt  as c_f_type_amt
                        , a.i_pr_type1  as c_i_pr_type1
                        , a.bg_reserve_money1_id as c_bg_reserve_money1_id
                        , a.dc_expense_budget_type2_id  as c_dc_expense_budget_type2_id
                        , a.f_type2_amt  as c_f_type2_amt 
                        , a.i_pr_type2  as c_i_pr_type2
                        , a.bg_reserve_money2_id as c_bg_reserve_money2_id  
                        , ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
                    FROM dbo.sp_tor_contract a  
                        inner join dbo.sp_tor cc on cc.tor_id = a.sp_tor_id
                        INNER JOIN dbo.sp_emp bb on bb.sp_emp_id = cc.sp_emp_id {$ses}
                    WHERE cc.i_type_bg = 4 and a.parent_id = 0 and a.i_contract_status > 0 and isnull(a.i_overlap,0) != 3  {$wh}"; //

// echo $sqlTempTable;
// exit;
                    
    $arrParam[] = $start;
    $arrParam[] = $limit;
    $sqlMain = "select a.* "
                . ", s.c_code as tor_code
                , (select sum(i_is_last) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as i_last_period
                , (select count(i_period) from dbo.sp_tor_hdr_period where sp_tor_contract_id = a.sp_tor_contract_id)  as count_period
                , (select top 1 convert(varchar, d_po_date, 120) from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as d_po_date
                , (select top 1 c_po_no from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as c_po_no
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
                            , c.i_yyyy_overlap, c.c_overlap,c.i_overlap,c.bg_reserve_overlap_id
            "
            . " from ({$sqlTempTable}) a "
            . "inner join dbo.sp_tor s on s.tor_id = sp_tor_id "
            . "inner join dbo.sp_tor_contract c on c.sp_tor_contract_id=a.sp_tor_contract_id "
            . " WHERE row > ? and row <= ?";
 
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    
    while ($row = $db->Fetch($stmt)) {
       
        
      $dtl1 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 1", array($row["sp_tor_id"])); //$row["sp_tor_id"]
      $dtl2 = $db->GetDataBySQL(" select * from (SELECT ROW_NUMBER() OVER(ORDER BY sp_tor_dtl_id) AS Rank , sp_tor_dtl_id,po_expense_id,dc_bg_budget_type_id,f_unit_price,i_pr_type1 FROM sp_tor_dtl where sp_tor_id = ?) a where Rank = 2", array($row["sp_tor_id"])); //$row["sp_tor_id"]
  
        $temp = array(
            "no" => $i++,  
            
            "dtl_po_expense_id1" => $dtl1['po_expense_id']??0, 
            "dtl_dc_bg_budget_type_id1" =>  $dtl1['dc_bg_budget_type_id']??0, 
            "dtl_i_pr_type1" => $dtl1['i_pr_type1']??0, 
            "dtl_f_type_amt1" => number_format(($dtl1["f_unit_price"]??0), 2),
            "bg_reserve_i_last1" => intval($row["bg_reserve_i_last1"]),
            
            
            "dtl_po_expense_id2" => $dtl2['po_expense_id']??0,
            "dtl_dc_bg_budget_type_id2" => $dtl2['dc_bg_budget_type_id']??0,
            "dtl_i_pr_type2" =>  $dtl2['i_pr_type1']??0,
            "dtl_f_type_amt2" =>  number_format(($dtl2["f_unit_price"]??0), 2), 
            "bg_reserve_i_last2" => intval($row["bg_reserve_i_last2"]),
            
            //-----------------------------c.i_yyyy_overlap, c.c_overlap,c.i_overlap,c.bg_reserve_overlap_id
            
                "i_yyyy_overlap" => $row["i_yyyy_overlap"]+543,
                "c_overlap" => $row["c_overlap"],
                "i_overlap" => $row["i_overlap"],
                "bg_reserve_overlap_id" => $row["bg_reserve_overlap_id"],
                "i_is_warranty" => $row["i_is_warranty"],
                "i_is_warranty_book" => $row["i_is_warranty_book"], 
                "c_books_cashiercheque" => $row["cashiercheque_on"],
                "c_receipt_cashiercheque" => $row["cashiercheque_seq"],
                "d_cashiercheque_date" => ((empty($row["d_cashiercheque_data"])) ? "" : $date->extDateBuddha($row["d_cashiercheque_data"])),// $row["d_cashiercheque_data"],
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
            "i_pr_type1" => (($row["i_purchase"]==1)?$row["c_i_pr_type1"]:$row["i_pr_type1"]),
            "i_pr_type2" => (($row["i_purchase"]==1)?$row["c_i_pr_type2"]:$row["i_pr_type2"]),
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
            "dc_cost2_id" => $row["dc_cost2_id"],
        );

        ${$root}[] = $temp;
    }

    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} 