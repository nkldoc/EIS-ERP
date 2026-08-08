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

// $keyon         = $_POST['keyData'] ?? null;
// $keyin         = ($keyon !== null && $keyon !== "") ? " a.i_import = " . $keyon . " and " : "";

$keyin = "";
$arrParam = array();
$arrCountParam = array();
$arrParam[] = 1;
$arrCountParam[] = 1;
//
//    print_r($_SESSION);
//exit();
/*
if ($mode == "SEARCH") {
    if (isset($filter) && $filter != "") {

        if ($filter === "po_creditor_name") {
            $conDtl .= " and s.c_cnt_name like ?";
            $arrParam[] = "%{$value}%";
            $arrCountParam[] = "%{$value}%";
        } else if ($filter === "c_name") {
            $conDtl .= " and s.c_detail like ? ";
            $arrParam[] = "%{$value}%";
            $arrCountParam[] = "%{$value}%";
        } else if ($filter === "c_code_ref") {
            $conDtl .= " and s.c_code_ref like ?";
            $arrParam[] = "%{$value}%";
            $arrCountParam[] = "%{$value}%";
        }
    }
}*/
// print_r($_SESSION);
if ($_SESSION["i_type_user"] == 1) {
    //$con .= " AND s.dc_user_create_id = " . $_SESSION["user_id"];
} else if ($_SESSION["i_type_user"] == 2 && $_SESSION["user_id"] != 1) {
    if ($_SESSION["i_level"] == 3) //
        $con .= " AND s.dc_user_create_id = " . $_SESSION["user_id"];
    else
        $con .= "";
} else {

}

//  mode: "LIST_PERIOD_SUB_HDR", type: "ASSET_LIST"
/*   [user_id] => 1
    [user_name] => System Administrator
    [dc_emp_id] => 1
    [sp_emp_id] => 30
    [dc_department_id] => 0
    [dc_department_type_id] => 0
    [i_seq] => 0
    [i_level] => 3
    [c_sp_emp] => admin
    [c_department_type] =>
    [c_department] =>
    [c_position] => ผู้ปฎิบัติงาน
    [dc_cost_id] => 3
    [cost_name] => มหาวิทยาลัย-ส่วนกลาง
    [cost_code] => 01010000
    [dc_area_id] => 1
    [i_type_user] => 2
    [dc_cost_acc_id] => 3
    [last_login] => 2022-06-18 14:42:27
    [st] => ST0115*/
                    $type                           = $_REQUEST['type'] ?? null;
                    $act                            = $_REQUEST['act'] ?? null;
                    $c_code_ref                     = $_REQUEST['c_code_ref'] ?? null;
                    $c_contract_code                = $_REQUEST['c_contract_code'] ?? null;
                    $check_code                     = $_REQUEST['check_code'] ?? null;
                    $arrive_code                    = $_REQUEST['arrive_code'] ?? null;
                    $c_overlap                      = $_REQUEST['c_overlap'] ?? null;
                    $i_post                         = $_REQUEST['i_post'] ?? null;



$SEARCH = '  ' ; 
$status = '  ' ; 
if($act == 'SEARCH'){
    // $SEARCH == '';
    // $SEARCH .= ($_REQUEST['tor_type_id'] != 0) ? " and a.tor_type_id =" . $_REQUEST['tor_type_id'] : "";
    $SEARCH .= ($c_code_ref != "") ? " and s.c_code_ref like '%" . $c_code_ref . "%'" : "";
    $SEARCH .= ($c_contract_code != "") ? " and s.c_contract_code like '%" . $c_contract_code . "%'" : "";
    $SEARCH .= ($check_code != "") ? " and c.c_code like '%" . $check_code . "%'" : "";
    $SEARCH .= ($arrive_code != "") ? " and c.c_arrive_code like '%" . $arrive_code . "%'" : "";
    $SEARCH .= ($c_overlap != "") ? " and s.c_overlap like '%" . $c_overlap . "%'" : "";
} // else  
if ($i_post == 1 )  {
    $status .= " and aa.i_status = 2  and  bb.i_enable = 1 "  ; //. $_REQUEST['i_enabled'];
    // $status.= ($c_overlap != "") ? " and a.c_overlap like '%" . $c_overlap . "%'" : "" ; 
} else if ($i_post == 2 ) {
    $status .= " and aa.i_status = 4  and  bb.i_enable = 1 "  ; //. $_REQUEST['i_enabled'];
} else if ($i_post == 3 ) {
    $status .= " and aa.i_status = 3  and  bb.i_enable = 1 "  ; //. $_REQUEST['i_enabled'];
} else if ($i_post == 4 ) {
    $status .= " and aa.i_status = 3  and  bb.i_enable = 2  "  ; //. $_REQUEST['i_enabled'];
} else if ($i_post == 5 ) {
    $status .= " and aa.i_status = 0  and  bb.i_enable = 0  "  ; //. $_REQUEST['i_enabled'];

    // $start .= " and isnull(aa.i_status,0) = 0  and  isnull(bb.i_enable,0) = 0  "  ; //. $_REQUEST['i_enabled'];
}

if ($type == "ASSET_LIST") {
    $wh = " and s.i_product_type=2";
} else {
    $wh = "";
}
$sp_emp_id =  $_SESSION["sp_emp_id"]?? null ;
$user_id =  $_SESSION["user_id"]?? null ;
//print_r($_SESSION); exit();
if ($user_id == 1 || $_SESSION["i_type_user"] == 2) {
    $where = "" ;
} else {
    $where = " c.sp_emp_id = {$sp_emp_id} and " ;
}
$sqlTempTable = "select s.checking_id
        , s.sp_check_period_hdr_id
        , row_number() over (order by s.checking_id DESC) as row
                        from dbo.sp_withdraw s
                        inner join dbo.sp_check_period_hdr c on c.sp_check_period_hdr_id = s.sp_check_period_hdr_id
                        left  join dbo.vw_po_working_pdf aa on aa.c_code_ref = s.c_code_ref 
						left  join NMU.dbo.po_working_hdr bb on bb.c_code_ref = s.c_code_ref 
                        where  {$where}   isnull(s.i_status,0) = 0 {$wh} and s.i_enable = ?  {$SEARCH} {$status}  " . $conDtl . $con;
$sqlTempTable1 = "select s.checking_id
        , s.sp_check_period_hdr_id
        , row_number() over (order by s.checking_id DESC) as row
                        into #temp 
                        from dbo.sp_withdraw s
                        inner join dbo.sp_check_period_hdr c on c.sp_check_period_hdr_id = s.sp_check_period_hdr_id
                        left  join dbo.vw_po_working_pdf aa on aa.c_code_ref = s.c_code_ref 
						left  join NMU.dbo.po_working_hdr bb on bb.c_code_ref = s.c_code_ref 
                        where  {$where}   isnull(s.i_status,0) = 0 {$wh} and s.i_enable = ?  {$SEARCH} {$status}  " . $conDtl . $con;
$arrParam[] = $start;
$arrParam[] = $limit;

$sqlMain = " SET NOCOUNT ON
    {$sqlTempTable1}
            select 
                    aa.po_working_hdr_id  as  po_working_id
                    ,aa.c_code_ref as working_code_ref
                    ,bb.i_enable as enable_working
					,case when bb.i_enable = 2 then 
					(select top 1 c_code_ref from NMU.dbo.po_working_hdr aaa where aaa.parent_id = bb.po_working_hdr_id) 
					else null 
					end  as working_code
                    ,bb.parent_id  as parent
                    ,aa.i_status as po_working_status
                    ,aa.c_file_pdf_hdr as c_file_pdf_hdr
                    ,aa.c_file_pdf_dtl as c_file_pdf_dtl
                    ,aa.i_enable  as po_working_enable
                    ,b.* "
        . " , isnull(a.po_working_hdr_id,0) as po_working_hdr_id
            , a.c_code_ref
            , a.sp_emp_id as sp_emp_id
            , a.po_emp_id
            , a.sp_tor_contract_id
            , a.c_contract_code
            , a.po_emp_name
            , a.po_creditor_transfer_name
            , a.po_creditor_transfer_id
            , a.po_creditor_name
            , a.po_creditor_id
            , a.i_budget_year
            , a.i_budget_year_overlap
            , a.dc_cost_id
            , isnull(a.i_status,0) as i_status
            , a.bg_expense_id
            , a.i_product_type
            , a.dc_expense_budget_type_id
            , isnull(a.COST_user_id,0) as dc_cost2_id
            , (select top 1  c_name from dc_cost where dc_cost_id=a.dc_cost_id) as dc_cost_idTxt
            , (select top 1  c_name from dc_cost where dc_cost_id=a.COST_user_id) as dc_cost2_idTxt
            , (select top 1  c_name from dc_expense_budget_type where dc_expense_budget_type_id = a.dc_expense_budget_type_id) as dc_expense_budget_type_idTxt
            , (select top 1 c_name from dc_expense where bg_expense_id = a.bg_expense_id) as bg_expense_idTxt
            , (select top 1 sp_gl_monthly_hdr_id from sp_gl_monthly_hdr where c_ref_doc = c.c_code) as sp_gl_monthly_hdr_id
            , c.c_code as c_checking_code
            , c.bg_checking_money_id
            , c.i_is_withdraw
            , (select top 1 c_overlap from sp_tor_contract bb where a.sp_tor_contract_id = bb.sp_tor_contract_id) c_overlap
            , (select top 1 i_yyyy_overlap from sp_tor_contract cc where a.sp_tor_contract_id = cc.sp_tor_contract_id) i_yyyy_overlap
            , a.c_arrive_code
            , a.url
            , a.c_comment
            , a.c_qty
            , a.c_invoice
            , c.i_overlap
            , c.bg_reserve_overlap_id
            , a.f_total
            , a.dc_user_create_id
            ,(SELECT top 1 c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
            , a.dc_user_create_cost_id
            , CONVERT(VARCHAR, a.d_checking_date , 120) AS d_checking_date
            , CONVERT(VARCHAR, a.d_audit_date , 120) AS d_audit_date
            , CONVERT(VARCHAR, a.d_doc_date , 120) AS d_doc_date
            , CONVERT(VARCHAR, a.d_create, 120) AS d_create
            , a.dc_user_update_id
            , a.dc_user_update_cost_id
            ,(SELECT top 1 c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
            , CONVERT(VARCHAR, a.d_update, 120) AS d_update
            , CONVERT(VARCHAR(10), a.d_receive_date, 120) AS d_receive_date
            "
        . " from #temp b "
        . " inner join dbo.sp_withdraw a on b.checking_id=a.checking_id"
        . " inner join dbo.sp_check_period_hdr c on c.sp_check_period_hdr_id=b.sp_check_period_hdr_id"
        . " left  join dbo.vw_po_working_pdf aa on aa.c_code_ref = a.c_code_ref"
        . " left  join NMU.dbo.po_working_hdr bb on bb.c_code_ref = a.c_code_ref"
        . " WHERE b.row > ? and b.row <= ?"
        . " ORDER BY b.row";
//   echo $sqlMain;

//print_r($arrParam);
// /******echo sql******/
// $sql = (@$sqlMain) ? $sqlMain : $sql;
// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());

// $sql = str_replace('?', '#-#', $sql);
// foreach ($arr as $fld => $value) {
//  $sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
// }
// echo $sql; exit;
/********************/
//exit();
$stmt = $db->QueryParam($sqlMain, $arrParam);
$i = $start + 1;
$arrStatut = array(0 => "ยังไม่ส่งเบิก", 1 => "ส่งเบิกแล้ว", 2 => "แก้ไขรายการส่งเบิก");
while ($row = $db->Fetch($stmt)) {
 /*
      po_emp_id
      , po_emp_name
      , po_creditor_transfer_name
      , po_creditor_transfer_id
      , po_creditor_name
      , po_creditor_id */
    $temp = array(
        "no"                                =>  $row["row"],
        "id"                                => intval($row["checking_id"]),
        "checking_id"                       => intval($row["checking_id"]),
        "po_working_hdr_id"                 => intval($row["po_working_hdr_id"]),
        "sp_check_period_hdr_id"            => intval($row["sp_check_period_hdr_id"]),
        "dc_cost_id"                        => intval($row["dc_cost_id"]),
                                    
        "po_working_status"                 => intval($row["po_working_status"]),
        "c_file_pdf_hdr"                    => $row["c_file_pdf_hdr"],
        "c_file_pdf_dtl"                    => $row["c_file_pdf_dtl"],
        "enable_working"                    => intval($row["enable_working"]),
        "working_code"                      => $row["working_code"],
        "parent"                            => $row["parent"],
        "i_product_type"                            => $row["i_product_type"],
        "i_overlap"                         => $row["i_overlap"],
        "bg_reserve_overlap_id"             => $row["bg_reserve_overlap_id"],
        "i_status"                          => intval($row["i_status"]),
        "i_statusTxt"                       => $arrStatut[$row["i_status"]],
        "bg_checking_money_id"              => intval($row["bg_checking_money_id"]),
        "i_is_withdraw"                     => intval($row["i_is_withdraw"]),
        "sp_tor_contract_id"                => $row["sp_tor_contract_id"],
        "c_contract_code"                   => $row["c_contract_code"],
        "c_code_ref"                        => $row["c_code_ref"],
        "c_arrive_code"                     => $row["c_arrive_code"],
        "sp_gl_monthly_hdr_id"              => $row["sp_gl_monthly_hdr_id"],
        "c_checking_code"                   => $row["c_checking_code"],
        "dc_cost_idTxt"                     => $row["dc_cost_idTxt"],
        "dc_expense_budget_type_idTxt"      => $row["dc_expense_budget_type_idTxt"],
         "po_creditor_id"                    => $row["po_creditor_id"],
        "po_creditor_transfer_id"           => $row["po_creditor_transfer_id"],
//        "c_approve_name"                    => $row["c_approve_name"],
//        "c_code_invoice"                    => $row["c_code_invoice"],
        "po_creditor_transfer_name"         => $row["po_creditor_transfer_name"],
        "po_creditor_name"                  => $row["po_creditor_name"],
        "po_emp_id"                         => $row["po_emp_id"],
        "sp_emp_name"                       => $row["po_emp_name"],
        "po_emp_name"                       => $row["po_emp_name"],
        "c_overlap"                         => $row["c_overlap"],
        "url"                               => $row["url"],
        "i_budget_yearTxt"                  => intval($row["i_budget_year"]),
        "i_yyyy_overlap"                    => intval($row["i_yyyy_overlap"]),
        "i_budget_year_overlapTxt"          => intval($row["i_budget_year_overlap"]),
        "i_budget_year"                     => intval($row["i_budget_year"]),
        "i_budget_year_overlap"             => intval($row["i_budget_year_overlap"]),
//            "dc_cost_id"                        => ($row["dc_cost_id"] > 0) ? $row["dc_cost_id"] : null,
        "dc_expense_budget_type_id"         => ($row["dc_expense_budget_type_id"] > 0) ? $row["dc_expense_budget_type_id"] : null,
        "bg_expense_id"                     => ($row["bg_expense_id"] > 0) ? $row["bg_expense_id"] : null,
        "bg_expense_idTxt"                  => $row["bg_expense_idTxt"],
        "c_qty"                             => $row["c_qty"],
        "c_invoice"                         => $row["c_invoice"],
//            "c_code_ref"                        => $row["c_code"],
//            "i_is_url_pdf_hdr"                  => $row["i_is_url_pdf_hdr"],
//            "i_is_url_pdf_dtl"                  => $row["i_is_url_pdf_dtl"],
//            "pdf_hdr"                           => $row["pdf_hdr"],
//            "pdf_dtl"                           => $row["pdf_dtl"],
//            "po_emp_id"                         => ($row["po_emp_id"] > 0) ? $row["po_emp_id"] : null,
//            "dc_approve_id"                     => ($row["dc_approve_id"] > 0) ? $row["dc_approve_id"] : null,
                                    
        "sp_emp_id"                         => $row["sp_emp_id"],
        "d_checking_date"                   => ($row["d_checking_date"] != "") ? $date->extDateBuddha($row["d_checking_date"]) : "",
        "d_audit_date"                      => ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",
        "d_doc_date"                        => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
        "d_receive_date"                    => ($row["d_receive_date"] != "") ? $date->extDateBuddha($row["d_receive_date"]) : "",
        "c_comment"                         => $row["c_comment"],
        "c_qty"                             => $row["c_qty"],
        "f_total"                           => number_format($row["f_total"], 2),

    );
    ${$root}[] = $temp;
}
$sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
$totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
exit();
