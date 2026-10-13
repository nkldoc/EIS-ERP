<?php

include("../../conf/config.php") ;
include("../conf/configDc.php") ;
include("../../lib/database/DatabaseServer.php") ;
include("../../lib/database/apiUtil.php") ;
include("../../lib/date/i_date.class.php") ;
include("../../lib/export/exportUtil.php") ;


$db     = new DatabaseServer() ;
$date   = new i_date() ;
$util   = new apiUtil() ;
$export = new exportUtil() ;
$id1    = 1 ; //status  
$id2    = 2 ; //status
$id4    = 4 ; //status ออกเลขฏีกา
$c_yyyy = $_REQUEST[ 'i_yyyy' ] ?? 2019 ;


$s_title = true ;
$title   = CUSTOMER_NAME_TH ;
$caption = "ทะเบียนคุมสรุปสถิติจัดซื้อจัดจ้าง รายละเอียดการตรวจสอบฎีกา งบประมาณประจำปี " . ($c_yyyy + 543) . " ของฝ่ายการคลัง" ;
 
function subStmSEQ ( $seq = 1 ) {
    return "(select top 1 po_status_hdr_id from po_status_hdr where i_seq={$seq})" ;
}

$sqlMain = "SET NOCOUNT ON
                SELECT (select c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id) as cost_name,
                        (select c_name from dbo.dc_expense_budget_type where dc_expense_budget_type_id=a.dc_expense_budget_type_id) as tt_name,
                        (select c_name from dbo.bg_expense_group where bg_expense_group_id=a.bg_expense_group_id) as gg_name
                         , a.c_detail
                         , a.f_total
                         , a.c_qty
                         , a.c_code ,a.c_cnt_name
                        -- , '' as c_comment --ของตำแหน่งฏีกา
                         , (select c_comment from dbo.po_working_item where po_status_hdr_id =4 and po_working_hdr_id=b.po_working_hdr_id) as c_comment
                        --  , '' as audit_name
                        , (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as emp_name
                         , b.c_code_ref
  ------------
                    
                 ---   ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_create_cost_id) as c_cost_creat_name
                  --  , convert(varchar, d_create, 120) as d_create
                  --  ,(select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_update_id) as c_update_name
                  --  ,(select top 1 c_name from dc_cost where dc_cost_id=a.dc_user_update_cost_id) as c_cost_update_name
                  --  , convert(varchar, [d_update], 120) as d_update
--------------

                        ,(select dc_emp_id from dbo.po_working_item where po_status_hdr_id =4 and po_working_hdr_id=b.po_working_hdr_id) as audit_name
                        ,(select 1 from dbo.po_working_item where po_status_hdr_id= " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as getStatus
                        ,(select top 1 c_code from dbo.po_working_item where po_status_hdr_id= " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as c_doc_code
                        ,(select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_status_hdr_id =  " . $id1 . " and po_working_hdr_id=b.po_working_hdr_id) as d_doc_date1
                        ,(select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_status_hdr_id =  " . $id2 . " and po_working_hdr_id=b.po_working_hdr_id) as d_doc_date2
                        ,(select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_status_hdr_id =  " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as d_doc_date4
                        FROM dbo.po_working_dtl a
                        inner join dbo.po_working_hdr b on b.po_working_hdr_id=a.po_working_hdr_id
                        where 1=? and a.c_budget_year = ?
                        group by a.dc_cost_id,bg_expense_group_id
                        , a.dc_expense_budget_type_id
                        , b.po_working_hdr_id
                        , a.c_detail
                        , a.f_total , a.c_qty
                        , a.c_code , a.c_cnt_name,a.dc_user_create_id
                        , b.po_working_hdr_id, b.c_code_ref
                        order by b.po_working_hdr_id,cost_name
                        " ;
//header ( "Content-type: text/plain; charset=UTF-8" ) ;
//print($sqlMain ) ;
//exit () ;
$stmt2   = $db -> QueryParam ( $sqlMain , array ( 1 , $c_yyyy ) ) ;
$ci      = 2 ;
$th      = "<p><h3>" . $caption . "</h3><p>" ;
//    $col     = array ( "A1" => "cost_name" ,
//  "B1" => "tt_name" ,
//  "C1" => "d_doc_date4" ,
//  "D1" => "c_code_ref" ,
//  "E1" => "d_doc_date1" ,
//  "F1" => "d_doc_date2" ,
//  "G1" => "c_doc_code" ,
//  "H1" => "d_doc_date4" ,
//  "I1" => "c_cnt_name" ,
//  "J1" => "c_detail" ,
//  "K1" => "c_qty" ,
//  "L1" => "f_total" ,
//  "M1" => "c_comment" ,
//  "N1" => "emp_name" ,
//  "O1" => "audit_name"
//    ) ;
while ( $row     = $db -> Fetch ( $stmt2 ) ) {
    $data = array ( "cost_name" => $row[ "cost_name" ] ,
                    "tt_name"     => $row[ "tt_name" ] ,
      "d_doc_date4" => $row[ "d_doc_date4" ] ,
      "c_code_ref"  => $row[ "c_code_ref" ] ,
      "d_doc_date1" => $row[ "d_doc_date1" ] ,
      "d_doc_date2" => $row[ "d_doc_date2" ] ,
      "c_doc_code"  => $row[ "c_doc_code" ] ,
      "d_doc_date4" => $row[ "d_doc_date4" ] ,
      "c_cnt_name" => $row[ "c_cnt_name" ] ,
      "c_detail"   => $row[ "c_detail" ] ,
      "c_qty"       => $row[ "c_qty" ] ,
      "f_total"     => $row[ "f_total" ] ,
      "c_comment"   => $row[ "c_comment" ] ,
      "emp_name"    => $row[ "emp_name" ] ,
      "audit_name"  => $row[ "audit_name" ]
        ) ;
    $tmpData [] = $data ;
} //End Loop

function ListJson () {
    global $col , $tmpData ;
    return json_encode ( array ( "name" => "rep0001" , "title" => "รายงานสรุป" , "data" => $tmpData ) ) ;
}




