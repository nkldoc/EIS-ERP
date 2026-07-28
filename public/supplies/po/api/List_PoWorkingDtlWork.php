<?php

include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

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
if ($_REQUEST["type"] == "po_working_dtl") {

    // $keyon         = $_POST['keyData'] ?? null;
    // $keyin         = ($keyon !== null && $keyon !== "") ? " a.i_import = " . $keyon . " and " : "";

    $keyin = "";
    $act = null ;
    $i_post =null ;
    $type = null ;
    $where = null; 
    $wh = null ;
    $SEARCH = null ;
    $conDtl = null ; 
    $con =null ;
    $status = null ;
    $arrParam      = array();
    $arrCountParam = array();
    $arrParam[]      = 1;
    $arrCountParam[] = 1;

    if ($mode == "SEARCH") {
        if (isset($filter) && $filter != "") {
            if ($filter === "po_creditor_name") {
                $conDtl    .= " and s.po_creditor_name like ?";
                $arrParam[]      = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            } else if ($filter === "c_name") {
                $conDtl    .= " and s.c_qty like ? ";
                $arrParam[]      = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            } else if ($filter === "c_code_ref") {
                $conDtl    .= " and s.c_code_ref like ?";
                $arrParam[]      = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            } else if ($filter === "c_invoice") {
                $conDtl    .= " and s.c_invoice like ?";
                $arrParam[]      = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            } else if ($filter === "c_contract_code") {
                $conDtl    .= " and s.c_contract_code like ?";
                $arrParam[]      = "%{$value}%";
                $arrCountParam[] = "%{$value}%";
            }
            if ($_REQUEST["i_pdf"] > 0) {
                $con .= " AND (
                    CASE 
                        WHEN bb.i_is_url_pdf_hdr = 0 THEN bb.c_file_pdf_hdr
                        WHEN bb.i_is_url_pdf_hdr = 1 THEN bb.c_url_pdf_hdr
                    END
                ) IS NOT NULL";
            }
        } 
    } else {
        if ($_SESSION["i_type_user"] == 1) { // เปิดผู้ใช้  (12319 : ไอรดา นามา) เห็นรายการทั้งหมด 
            // if ($_SESSION["user_id"] == 48) {
            //     $con .= " AND (a.dc_user_create_id = " . $_SESSION["user_id"] . " OR a.dc_user_create_id = 59 OR a.dc_user_create_id IN (SELECT dc_user_id FROM dc_user WHERE i_type_user = 3))";
            // } else {
            //     $con .= " AND a.dc_user_create_id = " . $_SESSION["user_id"];
            // }
        }
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
                            --inner join dbo.sp_check_billing_hdr d on d.sp_check_period_hdr_id = c.sp_check_period_hdr_id
                            inner join dbo.sp_check_billing_items e on c.sp_check_period_hdr_id = e.sp_check_period_hdr_id
                            left  join dbo.vw_po_working_pdf aa on aa.c_code_ref = s.c_code_ref 
                            
                            where  {$where}   isnull(s.i_status,0) = 0 {$wh} and s.i_enable = ?    and c.i_status_billing > 4 
                            {$SEARCH} {$status}  " . $conDtl . $con;
    $sqlTempTable1 = "select s.checking_id
            , s.sp_check_period_hdr_id
            , row_number() over (order by s.checking_id DESC) as row
                            into #temp 
                            from dbo.sp_withdraw s
                            inner join dbo.sp_check_period_hdr c on c.sp_check_period_hdr_id = s.sp_check_period_hdr_id
                            --inner join dbo.sp_check_billing_hdr d on d.sp_check_period_hdr_id = c.sp_check_period_hdr_id
                            inner join dbo.sp_check_billing_items e on c.sp_check_period_hdr_id = e.sp_check_period_hdr_id
                            left  join dbo.vw_po_working_pdf aa on aa.c_code_ref = s.c_code_ref 
                            where  {$where}   isnull(s.i_status,0) = 0 {$wh} and s.i_enable = ? and c.i_status_billing > 4 
                            {$SEARCH} {$status}  " . $conDtl . $con;
    $arrParam[] = $start;
    $arrParam[] = $limit;

    $sqlMain = " SET NOCOUNT ON
    {$sqlTempTable1}
            select 
                    aa.po_working_hdr_id  as  po_working_id
                    ,aa.c_code_ref as working_code_ref
                    , (select top 1  i_enable  from NMU.dbo.po_working_hdr where c_code_ref = a.c_code_ref   )  as enable_working
					,case when  (select top 1  i_enable  from NMU.dbo.po_working_hdr where c_code_ref = a.c_code_ref   )  = 2 then 
					(select top 1 c_code_ref from NMU.dbo.po_working_hdr aaa where aaa.parent_id =  (select top 1  po_working_hdr_id  from NMU.dbo.po_working_hdr where c_code_ref = a.c_code_ref   )  ) 
					else null 
					end  as working_code
                    , (select top 1  parent_id  from NMU.dbo.po_working_hdr where c_code_ref = a.c_code_ref   )  as parent
                    ,aa.i_status as po_working_status
                    , isnull(aa.c_file_pdf_hdr,0) as c_file_pdf_hdr
                    , isnull(aa.c_file_pdf_dtl,0) as c_file_pdf_dtl
                    ,aa.i_enable  as po_working_enable
                    ,b.* "
        . " , isnull(a.po_working_hdr_id,0) as po_working_hdr_id
            , a.c_code_ref as c_code_ref
            , a.sp_emp_id as sp_emp_id
            , a.po_emp_id
            , a.sp_tor_contract_id
            , a.c_contract_code
            , a.po_emp_name
            , a.po_creditor_transfer_name --as dc_creditor_po_transfer_name
            , a.po_creditor_transfer_id  --as dc_creditor_po_transfer_id
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
            , (select top 1 i_period from sp_tor_hdr_period  where sp_tor_hdr_period_id  = c.sp_tor_hdr_period_id ) as i_period
            , c.c_code as c_checking_code
            , c.bg_checking_money_id
            , c.i_is_withdraw
            ,  (select top 1 isnull(c_overlap,(select top 1 c_overlap from sp_check_period_hdr where sp_check_period_hdr_id = c.sp_check_period_hdr_id )) from sp_tor_contract bbb where a.sp_tor_contract_id = bbb.sp_tor_contract_id) as c_overlap
            , (select top 1 i_yyyy_overlap from sp_tor_contract cc where a.sp_tor_contract_id = cc.sp_tor_contract_id) i_yyyy_overlap
            , a.c_arrive_code
            , a.url
            , a.c_comment
            , a.c_qty
            --, a.c_invoice
            , c.i_overlap
            , c.bg_reserve_overlap_id
            , a.f_total
            --, isnull(aa.c_file_pdf_hdr,0) as c_file_pdf_hdr
            --, isnull(aa.c_file_pdf_dll,0) as c_file_pdf_dll
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
            , c.c_doc_ref
            ,  c.dc_creditor_id as dc_creditor_chk_id
            , (select top 1 c_name from NMU.dbo.dc_creditor where  a.dc_creditor_id  = dc_creditor_id ) as dc_creditor_name
            , a.dc_creditor_id
            , a.dc_creditor_transfer_id
            , a.dc_bank_acc_creditor_id

            , e.f_per_inv
            , e.check_vat
            , e.f_per_vat
            , e.f_per_vat_rate
            , e.f_per_inv_vat
            , e.check_tax_personal
            , e.f_per_tax_personal
            , e.f_per_tax_personal_rate
            , e.f_per_social_security
            , e.f_per_prov_fund
            , e.f_per_fine
            , e.f_per_warranty
            , e.f_per_other
            , e.f_per_pay
            , a.c_invoice as c_code_invoice
            , (select i_type_bg from sp_tor where tor_id = (select sp_tor_id from sp_tor_contract where sp_tor_contract_id = c.sp_tor_contract_id)) as i_type_bg
            "
        . " from #temp b "
        . " inner join dbo.sp_withdraw a on b.checking_id=a.checking_id"
        . " inner join dbo.sp_check_period_hdr c on c.sp_check_period_hdr_id=b.sp_check_period_hdr_id"
        // . " inner join dbo.sp_check_billing_hdr d on d.sp_check_period_hdr_id = c.sp_check_period_hdr_id"
        . " inner join dbo.sp_check_billing_items e on c.sp_check_period_hdr_id = e.sp_check_period_hdr_id"
        . " left  join dbo.vw_po_working_pdf aa on aa.c_code_ref = a.c_code_ref"
        // . " left  join NMU.dbo.po_working_hdr bb on bb.c_code_ref = a.c_code_ref"
        . " WHERE b.row > ? and b.row <= ? and c.i_status_billing > 4 " 
        . " ORDER BY b.row";
    $stmt = $db->QueryParam($sqlMain, $arrParam);
    $i    = $start + 1;
    while ($row  = $db->Fetch($stmt)) {
        // $row["d_approve_date"] = $db->GetDataBySQL("select CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=? and po_status_hdr_id=?", array($row["po_working_hdr_id"], $row["last_status_id"])); //last_status_id
        $temp = array(
            "no"                                =>  $row["row"],
            "id"                                => intval($row["checking_id"]),
            "checking_id"                       => intval($row["checking_id"]),
            "po_working_hdr_id"                 => intval($row["po_working_hdr_id"]),
            "sp_check_period_hdr_id"            => intval($row["sp_check_period_hdr_id"]),
            "dc_cost_id"                        => intval($row["dc_cost_id"]),
            "c_doc_ref"                         => intval($row["c_doc_ref"]),
            "po_working_status"                 => intval($row["po_working_status"]),
            "c_file_pdf_hdr"                    => $row["c_file_pdf_hdr"],
            "i_period"                          => $row["i_period"],
            "c_file_pdf_dtl"                    => $row["c_file_pdf_dtl"],
            "enable_working"                    => intval($row["enable_working"]),
            "working_code"                      => $row["working_code"],
            "parent"                            => $row["parent"],
            "dc_bank_acc_creditor_id"           => $row["dc_bank_acc_creditor_id"],
            "dc_creditor_chk_id"                => $row["dc_creditor_chk_id"],
            "i_type_bg"                         => $row["i_type_bg"],
            "dc_creditor_id"                    => $row["dc_creditor_id"],
            "dc_creditor_transfer_id"           => $row["dc_creditor_transfer_id"],
            "dc_creditor_name"                  => $row["dc_creditor_name"],
            "i_product_type"                    => $row["i_product_type"],
            "i_overlap"                         => $row["i_overlap"],
            "bg_reserve_overlap_id"             => $row["bg_reserve_overlap_id"],
            "i_status"                          => intval($row["i_status"]),
            // "i_statusTxt"                       => $arrStatut[$row["i_status"]],
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
            "dc_expense_budget_type_id"         => ($row["dc_expense_budget_type_id"] > 0) ? $row["dc_expense_budget_type_id"] : null,
            "bg_expense_id"                     => ($row["bg_expense_id"] > 0) ? $row["bg_expense_id"] : null,
            "bg_expense_idTxt"                  => $row["bg_expense_idTxt"],
            "c_qty"                             => $row["c_qty"],
            "c_code_invoice"                         => $row["c_code_invoice"],
            "sp_emp_id"                         => $row["sp_emp_id"],
            "d_checking_date"                   => ($row["d_checking_date"] != "") ? $date->extDateBuddha($row["d_checking_date"]) : "",
            "d_audit_date"                      => ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",
            "d_doc_date"                        => ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
            "d_receive_date"                    => ($row["d_receive_date"] != "") ? $date->extDateBuddha($row["d_receive_date"]) : "",
            "c_comment"                         => $row["c_comment"],
            "c_qty"                             => $row["c_qty"],
            "f_total"                            => $row["f_total"],
            "f_per_inv"                            => $row["f_per_inv"],
            "check_vat"                            => $row["check_vat"],
            "f_per_vat"                            => $row["f_per_vat"],
            "f_per_vat_rate"                       => $row["f_per_vat_rate"],
            "f_per_inv_vat"                        => $row["f_per_inv_vat"],
            "check_tax_personal"                   => $row["check_tax_personal"],
            "f_per_tax_personal"                   => $row["f_per_tax_personal"],
            "f_per_tax_personal_rate"              => $row["f_per_tax_personal_rate"],
            "f_per_social_security"                => $row["f_per_social_security"],
            "f_per_prov_fund"                      => $row["f_per_prov_fund"],
            "f_per_fine"                           => $row["f_per_fine"],
            "f_per_warranty"                       => $row["f_per_warranty"],
            "f_per_other"                          => $row["f_per_other"],
            "f_per_pay"                            => $row["f_per_pay"],
        );
        ${$root}[] = $temp;
    }
    $sqlCount = "select count(*) as totalCount from ({$sqlTempTable}) a";
    $totalCount = $db->GetDataBySQL($sqlCount, $arrCountParam);
    echo json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
} else if ($_REQUEST["type"] == "po_working_begin_item") {
    $arrParam = array();
    $sql = "
		SET NOCOUNT ON
		SELECT 
			po_working_begin_item_id
			,po_working_begin_hdr_id
			,dc_acc_id
			,(SELECT TOP 1 aa.c_code + ' : ' + aa.c_name  FROM dc_acc aa WHERE aa.dc_acc_id = a.dc_acc_id) AS dc_acc_name
			,ISNULL(f_inv,0) as f_inv 
			,ISNULL(f_vat,0) as f_vat 
			,ISNULL(f_inv_vat,0) as f_inv_vat  
		FROM NMU.dbo.po_working_begin_item a
		WHERE po_working_begin_hdr_id = ?
		ORDER BY po_working_begin_item_id";
    $arrParam[] = $_REQUEST['po_working_begin_hdr_id'];
    $stmt = $db->QueryParam($sql, $arrParam);
    if ($stmt) {
        $no = 0;
        while ($row = $db->Fetch($stmt)) {
            $temp = array(
                "no"                            =>    ++$no,
                "id"                            =>    $row["po_working_begin_item_id"],
                "dc_acc_id"                     =>    $row["dc_acc_id"],
                "dc_acc_name"                   =>    $row["dc_acc_name"],
                "f_inv"                         =>    $row["f_inv"],
                "f_vat"                         =>    $row["f_vat"],
                "f_inv_vat"                     =>    $row["f_inv_vat"],
            );
            ${$root}[] = $temp;
        }
    }
    echo json_encode(array("debug" => true, $root => ${$root}));
}
