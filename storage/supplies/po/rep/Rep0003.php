<?php

include("../../conf/config.php") ;
include("../conf/configDc.php") ;
include("../../lib/database/DatabaseServer.php") ;
include("../../lib/database/apiUtil.php") ;
include("../../lib/date/i_date.class.php") ;
include("../../lib/export/exportUtil.php") ;

// print_r($_POST); exit();
$db     = new DatabaseServer() ;
$date   = new i_date() ;
$util   = new apiUtil() ;
$export = new exportUtil() ;


$c_yyyy = $_REQUEST[ 'i_yyyy' ] ?? 2020 ;

$s_title = true ;
$title   = CUSTOMER_NAME_TH ;
$caption = " <p>ทะเบียนคุมการจ่ายเงินงบประมาณ เงินกองทุนพัฒนาคณะแพทย์ฯ เงินรายได้คณะแพทย์ฯ - รพ. เงินทดรองจ่ายและแหล่งเงินอื่นๆ </p>"
            . "  <p>งบประมาณประจำปี " . ($c_yyyy + 543) . " </p>" ;
			
$stEmp   = $db -> QueryParam ( "select po_emp_id,c_name from dbo.po_emp where 1=?" , array ( 1 ) ) ;
$arrEmp  = [] ;

// while ( $fw = $db -> Fetch ( $stEmp ) ) {
//     $arrEmp[ $fw[ "dc_emp_id" ] ] = $fw[ "c_name" ] ;
// }//End Loop

function subStmSEQ ( $seq = 1 ) {
	return "(select top 1 po_status_hdr_id from po_status_hdr where i_seq={$seq})" ;
}
//
// setting

$id1    = 1 ; //สถานะรายการจัดทำใบเบิก  
$status_last_id = 25; // สถานะรายการทำทะเบียนจ่ายเช็ค

$wh = " and EXISTS (select * from po_working_item where po_status_hdr_id = {$id1} and po_working_hdr_id = b.po_working_hdr_id)"; 

$sqlMain = "SET NOCOUNT ON
				SELECT a.c_code 
					, a.c_cnt_name
					, a.c_detail
					, a.c_qty
					, a.f_total
					,(select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_status_hdr_id =  1 and po_working_hdr_id=b.po_working_hdr_id) as d_doc_date1					
					,ISNULL((select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where po_status_hdr_id =  25 and po_working_hdr_id=b.po_working_hdr_id), '') as last_date
				FROM dbo.po_working_dtl a
				inner join dbo.po_working_hdr b on b.po_working_hdr_id=a.po_working_hdr_id
						
				where a.i_budget_year = ? {$wh}
				group by a.c_code 
					, a.c_cnt_name
					, a.c_detail
					, a.c_qty
					, a.f_total
					, b.po_working_hdr_id
				order by a.c_detail
			" ;

$stmt2   = $db -> QueryParam ( $sqlMain , array ( $c_yyyy ) ) ;
$ci      = 2 ;
$th      = "<p><h3>" . $caption . "</h3><p>" ;

$th  .= '<table class="tblRep" border=0 borderpadding=1 spacepadding=1>
		<tbody>
		<tr>
			<th style="background:#eee;width: 200px; text-align: center;">บริษัท</th>
			<th style="background:#eee;width: 200px; text-align: center;">รายละเอียด</th>
			<th style="background:#eee;width: 50px; text-align: center;">ส่งเบิกการคลัง</th>
			<th style="background:#eee;width: 50px; text-align: center;">จำนวน</th>
			<th style="background:#eee;width: 50px; text-align: center;">จำนวนเงิน</th>
			<th style="background:#eee;width: 73px; text-align: center;">สถานะ</th>
		</tr>
' ;
$td  = null ;
$i   = 1 ;
$sum_total = 0;
while ( $row = $db -> Fetch ( $stmt2 ) ) {


	$last_date = ($row["last_date"] != "")? "จ่ายแล้ว ".$date -> shot_date_from_db ( $row[ "last_date" ] ?? null ) : "";
	$td    .= '<tr>
				<td style="width: 200px;">' . $row[ "c_cnt_name" ] . '</td>
				<td style="width: 200px;">' . $row[ "c_detail" ] . '</td>
				<td style="width: 50px; text-align: center;">' .$date -> shot_date_from_db ( $row[ "d_doc_date1" ] ?? null ). '</td>
				<td style="width: 50px; text-align: right;">' . $row[ "c_qty" ] . '</td>
				<td style="width: 50px; text-align: right;"> ' . number_format ( $row[ "f_total" ] , 2 ) . '</td>
				<td style="width: 73px; text-align: center;"> ' . $last_date . ' </td>
			</tr>' ;
	
	$sum_total += $row[ "f_total" ];
} //End Loop
$td    .= '<tr>
				<td style="text-align: right;" colspan="4">รวมทั้งหมด</td>
				<td style="width: 50px; text-align: right;"> ' . number_format ( $sum_total , 2 ) . '</td>
				<td> &nbsp;</td>
			</tr>' ;

$thf = "</tbody></table>" ;


//start display
echo '<style>'
. ' .tblRep{'
. ' font-size:13px;width: 1850px;'
. '}'
. ' .tblRep , td{'
. 'background:#fff;'
. '}'
. ' .tblRep , th{'
. 'background:#ccc;'
. '}'

. '</style>' ;

echo $th . $td . $thf ;


