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
$c_yyyy = $_REQUEST[ 'i_yyyy' ] ?? 2019 ;


$s_title = true ;
$title   = CUSTOMER_NAME_TH ;
$caption = "รายงาน สรุปทะเบียนคุม สถิติจัดซื้อจัดจ้าง รายละเอียดการตรวจสอบฎีกา งบประมาณประจำปี " . ($c_yyyy + 543) . " ของฝ่ายการคลัง คณะแพทยศาสตร์วชิรพยาบาล" ;


$col = $db -> QueryParam ( "select i_seq,c_name from dbo.po_status_hdr where i_seq not in (0) and i_delete = 2 and i_enable=? order by i_seq asc " , array ( 1 ) ) ;

function subStmSEQ ( $seq = 1 ) {
    return "(select top 1 po_status_hdr_id from po_status_hdr where i_seq={$seq})" ;
}

$sqlMain = "SET NOCOUNT ON
                SELECT (select c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id) as cost_name,
                        (select c_name from dbo.dc_expense_budget_type where dc_expense_budget_type_id=a.dc_expense_budget_type_id) as tt_name,
                        (select c_name from dbo.bg_expense_group where bg_expense_group_id=a.bg_expense_group_id) as gg_name
                         , a.c_detail
                         , a.f_total
                         , b.c_code_ref 
                    , b.po_working_hdr_id as st1
                    , (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 1 ) . ") as d_st1
                    , b.po_working_hdr_id as e_st1

                    , b.po_working_hdr_id as st2
                    , (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 2 ) . ") as d_st2
                    , b.po_working_hdr_id as e_st2

                    , b.po_working_hdr_id as st3
                    , (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 3 ) . ") as d_st3
                    , b.po_working_hdr_id as e_st3

                , b.po_working_hdr_id as st4
                       ,  (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 4 ) . ") as d_st4
                , b.po_working_hdr_id as e_st4

                , b.po_working_hdr_id as st5
                       ,  (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 5 ) . ") as d_st5
                , b.po_working_hdr_id as e_st5

                , b.po_working_hdr_id as st6
                       , (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 6 ) . ") as d_st6
                , b.po_working_hdr_id as e_st6

                , b.po_working_hdr_id as st7
                ,  (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 7 ) . ") as d_st7
                , b.po_working_hdr_id as e_st7

                , b.po_working_hdr_id as st8
                ,  (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 8 ) . ") as d_st8
                , b.po_working_hdr_id as e_st8

                , b.po_working_hdr_id as st9
                ,  (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 9 ) . ") as d_st9
                , b.po_working_hdr_id as e_st9

                     , b.po_working_hdr_id as st10
                     ,  (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 10 ) . ") as d_st10
                     , b.po_working_hdr_id as e_st10

                , b.po_working_hdr_id as st11
                , (select top 1  CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_working_hdr_id=b.po_working_hdr_id and po_status_hdr_id=" . subStmSEQ ( 11 ) . ") as d_st11
                , b.po_working_hdr_id as e_st11

                        FROM dbo.po_working_dtl a
                        inner join dbo.po_working_hdr b on b.po_working_hdr_id=a.po_working_hdr_id

                        where 1=? and a.c_budget_year = ?
                        group by a.dc_cost_id,bg_expense_group_id
                        , a.dc_expense_budget_type_id
                        , a.c_detail
                        , a.f_total,b.c_code_ref
                        , b.po_working_hdr_id
                        " ;

$stmt2 = $db -> QueryParam ( $sqlMain , array ( 1 , $c_yyyy ) ) ;
$ci    = 2 ;
echo "<p><h3>" . $caption . "</h3></p>" ;
echo "<table border='1'>" ;
echo "<tr>" ;
echo "<th class='tdTh'> "
 . " หน่วยงาน"
 . " </th>" ;
echo "<th class='tdTh'> "
 . " ประเภทงบ"
 . " </th>" ;
echo "<th class='tdTh' nowrap> "
 . " เลขที่"
 . " </th>" ;
while ( $rs    = $db -> Fetch ( $col ) ) {
    $ci ++ ;
    echo "<th nowrap class='tdTh'> "
    . $rs[ "c_name" ] . " " . $rs[ "i_seq" ]
    . " </th>" ;
    echo "<th> "
    . " วันที่เริ่มรับ"
    . " </th>" ;
    echo "<th class='tdTh'> "
    . " วันที่ส่ง"
    . " </th>" ;
} //End Loop
echo "</tr>" ;

while ( $row = $db -> Fetch ( $stmt2 ) ) {
    echo "<tr>" ;
    echo "<td nowrap>" ;
    echo $row[ "cost_name" ] ;
    echo "</td>" ;
    echo "<td nowrap>" ;
    echo $row[ "tt_name" ] ;
    echo "</td>" ;

    echo "<td nowrap>" ;
    echo $row[ "c_code_ref" ] ?? null ;
    echo "</td>" ;
    echo "<td>" ;
    echo $row[ "st1" ] ;
    echo "</td>" ;
    echo "<td nowrap> " //$date->extDateBuddha($row["d_inv_date"])
    . $date -> extDateBuddha ( $row[ "d_st1" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st1" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st2" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st2" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st2" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st3" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st3" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st3" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st4" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st4" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st4" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st5" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st5" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st5" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st6" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st6" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st6" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st7" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st7" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st7" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st8" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st8" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st8" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st9" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st9" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st9" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st10" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st10" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st10" ] ?? null)
    . " </td>" ;
    echo "<td>" ;
    echo $row[ "st11" ] ;
    echo "</td>" ;
    echo "<td nowrap> "
    . $date -> extDateBuddha ( $row[ "d_st11" ] ?? null  )
    . " </td>" ;
    echo "<td nowrap> "
    . ($row[ "e_st11" ] ?? null)
    . " </td>" ;
    echo "</tr>" ;
} //End Loop

echo '<br/>' ;
?>
