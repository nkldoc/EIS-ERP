<?php

include("../../conf/config.php") ;
include("../conf/configDc.php") ;
include("../conf/configPo.php") ;
include("../../lib/database/DatabaseServer.php") ;
include("../../lib/database/apiUtil.php") ;
include("../../lib/date/i_date.class.php") ;
include("../../lib/export/exportUtil.php") ;

// print_r($_POST); exit();
$db     = new DatabaseServer() ;
$date   = new i_date() ;
$util   = new apiUtil() ;
$export = new exportUtil() ;
/*
 $CONF_I_STATUS = array(
    1 => "จัดทำใบขอเบิก",
    2 => "ส่งใบเบิก",
    3 => "ทักท้วง",
    4 => "อนุมัติฏีกา",
    5 => "หักงบประมาณ",
    6 => "หัวหน้าฝ่ายการคลังลงนาม",
    7 => "ผู้บริหารลงนาม",
    8 => "จัดทำเช็ค",
    9 => "หัวหน้าฝ่ายการคลังลงนามเช็ค",
    10 => "ผู้บริหารลงนามเช็ค",
    11 => "ทำทะเบียนจ่าย",
    12 => "ตัดจ่ายเจ้าหนี้",
    13 => "ยกเลิก"
); */

$c_yyyy = $_REQUEST[ 'i_yyyy' ] ?? 2020 ;

$s_title = true ;
$title   = CUSTOMER_NAME_TH ;
$caption = " <p>รายงานการจ่ายเงินงบประมาณ เงินกองทุนพัฒนาคณะแพทย์ฯ เงินรายได้คณะแพทย์ฯ - รพ. เงินทดรองจ่ายและแหล่งเงินอื่นๆ </p>"
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

$id1    = 1 ; //status  
$id2    = 2 ; //status
$id4    = 4 ; //status ออกเลขฎีกา
$status_last_id = 12; // สถานะรายการทำทะเบียนจ่ายเช็ค

$wh     = ""; 
$wh .= " and EXISTS (select * from po_working_item where i_status = {$status_last_id} and po_working_hdr_id = b.po_working_hdr_id)"; 

$sqlMain = "SET NOCOUNT ON
				SELECT (select c_name from dbo.dc_cost where dc_cost_id=a.dc_cost_id) as cost_name
						,(select c_name from dbo.dc_expense_budget_type where dc_expense_budget_type_id=a.dc_expense_budget_type_id) as tt_name 
						, a.c_detail
						, a.f_total
						, a.c_qty
						, a.c_code ,a.c_cnt_name
						, (select c_comment from dbo.po_working_item where i_status = " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as c_comment
						, (select top 1 c_full_name from dc_user where dc_user_id=a.dc_user_create_id) as emp_name
						, b.c_code_ref 
						,(select po_emp_id from dbo.po_working_item where i_status = " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as audit_name
						,(select 1 from dbo.po_working_item where i_status= " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as getStatus
						,(select top 1 c_code from dbo.po_working_item where i_status= " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as c_doc_code
						,(select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where i_status =  " . $id1 . " and po_working_hdr_id=b.po_working_hdr_id) as d_doc_date1
						,(select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where i_status =  " . $id2 . " and po_working_hdr_id=b.po_working_hdr_id) as d_doc_date2
						,(select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where i_status =  " . $id4 . " and po_working_hdr_id=b.po_working_hdr_id) as d_doc_date4
						,ISNULL((select top 1 CONVERT(VARCHAR, d_doc_date, 120) from dbo.po_working_item where i_status =  " . $status_last_id . " and po_working_hdr_id=b.po_working_hdr_id), '') as last_date
						FROM dbo.po_working_dtl a
						inner join dbo.po_working_hdr b on b.po_working_hdr_id=a.po_working_hdr_id
						
						where a.i_budget_year = ? {$wh}
						group by a.dc_cost_id 
						, a.dc_expense_budget_type_id
						, b.po_working_hdr_id
						, a.po_emp_id
						, a.c_detail
						, a.f_total , a.c_qty
						, a.c_code , a.c_cnt_name,a.dc_user_create_id
						, b.po_working_hdr_id, b.c_code_ref
						order by b.po_working_hdr_id,cost_name
						" ;

$stmt2   = $db -> QueryParam ( $sqlMain , array ( $c_yyyy ) ) ;
$ci      = 2 ;
$th      = "<p><h3>" . $caption . "</h3><p>" ;
//print_r($_POST); exit();
$th  .= '<table class="tblRep" border=0 borderpadding=1 spacepadding=1>
		<tbody>
		<tr>
			<th style="background:#eee;width: 38px; text-align: center;" rowspan="5">ลำดับ</th>
			<th style="background:#eee;width: 98px; text-align: center;" rowspan="5">หน่วยงาน</th>
			<th style="background:#eee;width: 402px; text-align: center;" colspan="6">ฝ่ายพัสดุ, ฝ่ายเภสัชกรรม, งานเวชภัณฑ์การแพทย์</th>
			<th style="background:#eee;width: 237px; text-align: center;" colspan="7">ฝ่ายการคลัง</th>
			<th style="background:#eee;width: 107px; text-align: center;" colspan="6">&nbsp;</th> 
		</tr>
		<tr>
			<th style="background:#eee;width: 207px; text-align: center;" rowspan="4">ประเภทงบ</th>
			<th style="background:#eee;width: 195px; text-align: center;" colspan="5">หน่วยงาน จัดซื้อ/ จ้าง</th>
			<th style="background:#eee;width: 90px; text-align: center;" colspan="2">วันที่</th>
			<th style="background:#eee;width: 147px; text-align: center;" colspan="3" rowspan="3">อนุมัติฎีกา</th>
			<th style="background:#eee;width: 243px; text-align: center;" rowspan="4">จ่ายให้</th>
			<th style="background:#eee;width: 329.035px; text-align: center;" rowspan="4">รายละเอียด</th>
			<th style="background:#eee;width: 103.965px; text-align: center;" rowspan="3">จำนวน</th>
			<th style="background:#eee;width: 143px; text-align: center;" rowspan="3">จำนวนเงิน</th>
			<th style="background:#eee;width: 107px; text-align: center;" >&nbsp;</th>
			<th style="background:#eee;width: 199px; text-align: center;">&nbsp;</th>
			<th style="background:#eee;width: 187px; text-align: center;" rowspan="4">ผู้ตรวจสอบ</th>
			<th style="background:#eee;width: 100; text-align: center;" rowspan="4">วันที่จ่าย</th>
		</tr>
		<tr>
			<th style="background:#eee;width: 76px; text-align: center;" colspan="2">วันที่</th>
			<th style="background:#eee;width: 119px; text-align: center;" colspan="3">จัดทำ</th>
			<th style="background:#eee;width: 90px; text-align: center;" colspan="2">ฝ่ายคลัง</th>
			<th style="background:#eee;width: 107px; text-align: center;">&nbsp;</th>
			<th style="background:#eee;width: 199px; text-align: center;">&nbsp;</th>
		</tr>
		<tr>
			<th style="background:#eee;width: 76px; text-align: center;" colspan="2">ตรวจรับ</th>
			<th style="background:#eee;width: 119px; text-align: center;" colspan="3">ใบขอเบิก</th>
			<th style="background:#eee;width: 90px; text-align: center;" colspan="2">รับ ใบขอเบิก</th>
			<th style="background:#eee;width: 107px; text-align: center;  rowspan="3"">หมายเหตุ</th>
			<th style="background:#eee;width: 199px; text-align: center;">ผู้ดำเนินการ</th>
		</tr>

		<tr>
			<th style="background:#eee;width: 27px; text-align: center;">วัน</th>
			<th style="background:#eee;width: 49px; text-align: center;">เดือน ปี</th>
			<th style="background:#eee;width: 48px; text-align: center;">เลขที่</th>
			<th style="background:#eee;width: 19px; text-align: center;">วัน</th>
			<th style="background:#eee;width: 52px; text-align: center;">เดือน ปี</th>
			<th style="background:#eee;width: 24px; text-align: center;">วัน</th>
			<th style="background:#eee;width: 66px; text-align: center;">เดือน ปี</th>
			<th style="background:#eee;width: 70px; text-align: center;">เลขที่</th>
			<th style="background:#eee;width: 26px; text-align: center;">วัน</th>
			<th style="background:#eee;width: 51px; text-align: center;">เดือน ปี</th>
			<th style="background:#eee;width: 103.965px; text-align: center;">(รายการ)</th>
			<th style="background:#eee;width: 143px; text-align: center;">(บาท)</th>
			<th style="background:#eee;width: 107px; text-align: center;">&nbsp;</th>
			<th style="background:#eee;width: 199px; text-align: center;">&nbsp;</th>
		</tr>

' ;
$td  = null ;
$i   = 1 ;
$sum_total = 0;
while ( $row = $db -> Fetch ( $stmt2 ) ) {


	$last_date = ($row["last_date"] != "")? $date -> shot_date_from_db ( $row[ "last_date" ] ?? null ) : "";
	$td    .= '<tr>
				<td style="width: 38px; text-align: center;">' . $i ++ . '</td>
				<td style="width: 98px;">' . $row[ "cost_name" ] . '</td>
				<td style="width: 207px;">' . $row[ "tt_name" ] . '</td>
				<td style="width: 49px;" colspan="2">' . (($row[ "getStatus" ]) ? $date -> shot_date_from_db ( $row[ "d_doc_date4" ] ?? null ) : "")/* วันที่ตรวจรับ */ . '</td>
				<td style="width: 48px;">' . $row[ "c_code_ref" ] . '</td>
				<td style="width: 49px;" colspan="2">' . (($row[ "getStatus" ]) ? $date -> shot_date_from_db ( $row[ "d_doc_date1" ] ?? null ) : "")/* วันที่ใบขอเบิก */ . '</td>
				<td style="width: 49px;" colspan="2"> ' . (($row[ "getStatus" ]) ? $date -> shot_date_from_db ( $row[ "d_doc_date2" ] ?? null ) : "")/* วันที่รับ ใบขอเบิก */ . '</td>
				<td style="width: 70px;">' . $row[ "c_doc_code" ] . ' </td>
				<td style="width: 49px;" colspan="2"> ' . (($row[ "getStatus" ]) ? $date -> shot_date_from_db ( $row[ "d_doc_date4" ] ?? null ) : "")/*วันที่อนุมัติฎีกา*/ . ' </td>
				<td style="width: 243px;">' . $row[ "c_cnt_name" ] . '</td>
				<td style="width: 329.035px;">' . $row[ "c_detail" ] . '</td>
				<td style="width: 103.965px; text-align: right;">' . $row[ "c_qty" ] . '</td>
				<td style="width: 143px; text-align: right;"> ' . number_format ( $row[ "f_total" ] , 2 ) . '</td>
				<td style="width: 107px;"> ' . $row[ "c_comment" ] . '</td>
				<td style="width: 199px;"> ' . $row[ "emp_name" ] . '</td>
				<td style="width: 187px;"> ' . @$arrEmp[ $row[ "audit_name" ] ] . '</td>
				<td style="width: 49px;"> ' . $last_date . ' </td>
			</tr>' ;
	
	$sum_total += $row[ "f_total" ];
	$arr[] = array ( "c_detail"   => $row[ "c_detail" ] ,
					"audit_name" => $row[ "audit_name" ] ,
					"f_total"    => $row[ "f_total" ]
					) ;
} //End Loop
$td    .= '<tr>
				<td style="text-align: right;" colspan="16">รวมทั้งหมด</td>
				<td style="width: 143px; text-align: right;"> ' . number_format ( $sum_total , 2 ) . '</td>
				<td colspan="4"> &nbsp;</td>
			</tr>' ;

$thf = "</tbody></table>" ;


//start display
echo '<style>'
. ' .tblRep{'
. ' font-size:13px;width: 2150px;'
. '}'
. ' .tblRep , td{'
. 'background:#fff;'
. '}'
. ' .tblRep , th{'
. 'background:#ccc;'
. '}'

. '</style>' ;

echo $th . $td . $thf ;


