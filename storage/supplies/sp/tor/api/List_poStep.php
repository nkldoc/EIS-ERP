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
    $sort = " a.c_code";
}

#################################
$arrParam = array();
$arrCountParam = array();
$con = null;
$conDtl = null;
if ($_REQUEST["type"] == "i_is_po") {

    $act = $_REQUEST["act"] ?? null;
    $wh = null;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['c_code'] != "") ? " and a.c_code LIKE'%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and b.c_name LIKE '%" . $_REQUEST['c_name'] . "%'" : "";
    }

    $arrParam = array();
    $arrCountParam = array();

    $sqlTempTable = "SELECT sp_tor_contract_id
                        , a.sp_tor_id
                        , a.dc_creditor_id
                        , a.d_due_date
                        , a.c_doc_ref
                        , a.f_total_amt
                        , a.c_code
                        , a.i_is_po
                        , a.c_discription
                        , a.i_delivery
                        , a.i_type_fine
                        , a.f_fine
                        , a.i_contract_status
                        , ROW_NUMBER() OVER (ORDER BY a.d_create DESC) AS row
                    FROM dbo.sp_tor_contract a
                    INNER JOIN dc_creditor b ON a.dc_creditor_id = b.dc_creditor_id
                    WHERE a.i_contract_status > 0 and i_is_po = 1 {$wh}"; //
    //echo  $sqlTempTable; exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;
    /*    var i_purchase = Ext.selectRow.get('i_purchase'); // ซื้อ/จ้าง/เช่า
      var i_hire_type = Ext.getCmp("period_i_hire_type").getValue().inputValue; // ได้มาเป็นของ
      var i_product_type = Ext.getCmp("period_i_product_type2").getValue().inputValue; // วัสดุ หรือครุภัณธฑ์ */
    $sqlMain = "select a.* " . " ,(select top 1 convert(varchar, d_po_date, 120) from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as d_po_date
             ,(select top 1 c_po_no from sp_tor_contract where sp_tor_contract_id = a.sp_tor_contract_id)  as c_po_no
             , s.c_budget_dtl_project
             --, s.c_name
             , (select top 1 c_name from sp_tor_contract where sp_tor_contract_id=a.sp_tor_contract_id) as c_name
             , s.c_department
             , s.d_doc_ref
             , convert(varchar, s.d_tor_date, 120) AS d_tor_date
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
             , convert(varchar, a.d_due_date, 120) as d_due_date
             , (select top 1 c_name FROM NMU.dbo.dc_creditor where dc_creditor_id=a.dc_creditor_id)  as dc_creditor_idTxt
             , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_cost_id)  as dc_cost_idTxt
             , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
             , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
             , convert(varchar, s.d_create, 120) as d_create
             , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
             , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
             , convert(varchar, s.d_update, 120) as d_update"
        . " from ({$sqlTempTable}) a "
        . "inner join dbo.sp_tor s on s.tor_id = sp_tor_id"
        . " WHERE row > ? and row <= ?";

    // echo $sqlMain .'/*'; print_r($arrParam); echo '*/'; exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $i++,
            //  "id" => intval($row["sp_po_id"]),
            "sp_tor_id" => intval($row["sp_tor_id"]),
            "sp_tor_contract_id" => intval($row["sp_tor_contract_id"]),
            "i_is_po" => intval($row["i_is_po"]),
            "c_code" => $row["c_code"],
            "c_doc_ref" => $row["c_code"],


            "dc_creditor_idTxt" => $row["dc_creditor_idTxt"],
            "f_total_amt" => number_format($row["f_total_amt"], 2),
            "d_due_date" => $date->extDateBuddha($row["d_due_date"]),

            "bg_budget_item_project_id" => intval(@$row["bg_budget_item_project_id"]),
            "c_budget_dtl_project" => $row["c_budget_dtl_project"],
            "c_name" => $row["c_name"],
            "dc_cost_id" => intval(@$row["dc_cost_id"]),
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
            "i_purchase" => $row["i_purchase"],
            "c_purchase" => $i_purchase[$row["i_purchase"]],
            "dc_expense_budget_type_id" => intval(@$row["dc_expense_budget_type_id"]),
            "po_expense_id" => intval(@$row["po_expense_id"]),
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
            "f_fine" => $row["f_fine"],
            "d_po_date" => $row["d_po_date"] == null ? '' : $date->extDateBuddha($row["d_po_date"]),
            "c_po_no" => $row["c_po_no"],
            "i_contract_status" => $row["i_contract_status"],

        );

        ${$root}[] = $temp;
    }
} else if ($_REQUEST["type"] == "LIST_SP_PO_HDR") {


    $arrParam = array();
    $arrCountParam = array();

    $act = $_REQUEST["act"] ?? null;
    $wh = null;

    if ($act == "SEARCH") {
        $wh .= ($_REQUEST['c_code'] != "") ? " and c_code LIKE'%" . $_REQUEST['c_code'] . "%'" : "";
        $wh .= ($_REQUEST['c_name'] != "") ? " and c_name LIKE '%" . $_REQUEST['c_name'] . "%'" : "";
    }

    $sqlTempTable = "select sp_po_id
                        ,sp_tor_contract_id
                        ,sp_tor_id
                        ,dc_creditor_id
                         ,c_name
                        ,c_code
                        ,c_doc_ref
                        ,c_discription
                        ,i_is_status
                        ,i_is_po
                        ,convert(varchar, d_due_date , 120) as d_due_date
                        ,f_total_amt
                        , row_number() over (order by sp_po_id DESC) as row
                        from dbo.sp_po_hdr where c_code is not null and i_is_status >= 1 {$wh}
                        "; //
    //echo  $sqlTempTable; exit;
    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = "select a.* "
                . "
                , s.i_purchase
                , s.i_hire_type
                , s.i_product_type

                , s.dc_expense_budget_type_id as dc_bg_budget_type_id
                , s.po_expense_id
                , (select top 1 c_code from sp_tor_contract where sp_tor_contract_id=a.sp_tor_contract_id) as c_contract_code
                , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_create_id) as c_create_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_create_cost_id) as c_cost_creat_name
                , convert(varchar, s.d_create, 120) as d_create
                , (select top 1 c_full_name from dc_user where dc_user_id=s.dc_user_update_id) as c_update_name
                , (select top 1 c_name from dc_cost where dc_cost_id=s.dc_user_update_cost_id) as c_cost_update_name
                , convert(varchar, s.d_update, 120) as d_update"
        . " from ({$sqlTempTable}) a "
        . "inner join dbo.sp_tor s on s.tor_id = sp_tor_id"
        . " WHERE row > ? and row <= ?";

    // echo $sqlMain .'/*'; print_r($arrParam); echo '*/'; exit;
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i = $start + 1;
    $i_purchase = array(0 => '', 1 => 'ซื้อ', 2 => 'จ้าง', 3 => 'เช่า');
    $tor_type = array(1 => 'เจาะจงน้อยกว่า 500,000.00', 2 => 'เจาะจงมากกว่า 500,000.00', 3 => 'คัดเลือก', 4 => 'e-bidding');
    while ($row = $db->Fetch($stmt)) {
        $temp = array(
            "no" => $i++,
            "sp_po_id" => $row["sp_po_id"],
            "sp_tor_contract_id" => $row["sp_tor_contract_id"],
            "sp_tor_id" => $row["sp_tor_id"],
            "dc_creditor_id" => $row["dc_creditor_id"],
            "c_name" => $row["c_name"],
            "c_code" => $row["c_code"],
            "c_doc_ref" => $row["c_contract_code"],
            "c_discription" => $row["c_discription"],
            "i_is_status" => $row["i_is_status"],
            "i_is_po" => $row["i_is_po"],
            "d_due_date" => $date->extDateBuddha($row["d_due_date"]),
            "f_total_amt" => number_format($row["f_total_amt"], 2),

            "i_purchase" => $row["i_purchase"],
            "i_hire_type" => $row["i_hire_type"],
            "i_product_type" => $row["i_product_type"],
            "dc_bg_budget_type_id" => intVal($row["dc_bg_budget_type_id"]), //dc_bg_budget_type_id po_expense_id
            "po_expense_id" => intVal($row["po_expense_id"]),
            "dc_user_create_id" => $row["c_create_name"],
            "dc_user_create_cost_id" => $row["c_cost_creat_name"],
            "d_create" => $date->extDateBuddha($row["d_create"]),
            "dc_user_update_id" => $row["c_update_name"],
            "dc_user_update_cost_id" => $row["c_cost_update_name"],
            "d_update" => $date->extDateBuddha($row["d_update"]),

        );

        ${$root}[] = $temp;
    }
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
