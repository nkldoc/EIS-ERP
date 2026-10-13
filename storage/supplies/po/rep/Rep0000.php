    <?php

    include("../../conf/config.php") ;
    include("../conf/configDc.php") ;
    include("../../lib/database/DatabaseServer.php") ;
    include("../../lib/database/apiUtil.php") ;
    include("../../lib/date/i_date.class.php") ;
    include("../../lib/export/exportUtil.php") ;

     //print_r($_POST); exit();
    $db     = new DatabaseServer() ;
    $date   = new i_date() ;
    $util   = new apiUtil() ;
    $export = new exportUtil() ;


    $c_yyyy = $_REQUEST[ 'i_yyyy' ] ?? 2020 ;

    $s_title = true ;
    $title   = CUSTOMER_NAME_TH ;
    $caption = "รายงานทะเบียนคุมสถิติการปฏิบัติงานด้านการเบิกจ่ายของฝ่ายการคลังสำหรับปีงบประมาณ " . ($c_yyyy + 543) ;
    $stEmp   = $db -> QueryParam ( "select dc_emp_id,c_name from dbo.dc_emp where 1=?" , array ( 1 ) ) ;
    $arrEmp  = [] ;

    // while ( $fw = $db -> Fetch ( $stEmp ) ) {
    //     $arrEmp[ $fw[ "dc_emp_id" ] ] = $fw[ "c_name" ] ;
    // }//End Loop

    function subStmSEQ ( $seq = 1 ) {
        return "(select top 1 po_status_hdr_id from po_status_hdr where i_seq={$seq})" ;
    }
    //
    // setting
//ทำใบเบิก seq 1
    $id1    = $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_enable=1 and i_delete<>1 and i_seq = ?", array(1)); //1 ; //status  
//ส่งใบเบิก seq 2
    $id2    = $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_enable=1 and i_delete<>1 and i_seq = ?", array(2));  //status
//ออกเลขฏีกา seq 6
    $id4    = $db->GetDataBySQL("select po_status_hdr_id from dbo.po_status_hdr WHERE i_enable=1 and i_delete<>1 and i_seq = ?", array(6)); ; //status ออกเลขฎีกา
//---------------------------------------------------
    $wh     = "";
    $c_code = $_POST["c_code"]??null;
    $bg_expense_group_id = $_POST["bg_expense_group_id"]??null;
    $dc_expense_budget_type_id = $_POST["dc_expense_budget_type_id"]??null;
    $id22 = $_POST["id2"]??null;
    $id11 = $_POST["id1"]??null;   
//---------------------------------------------------
     $dc_cost_id = true??null;   //default
    
    if($dc_cost_id)$wh .= " and isnull(a.dc_cost_id,0) <> 0"; 
    if($id11)$wh .= " and EXISTS (select * from po_working_item where po_status_hdr_id = {$id1} and po_working_hdr_id = b.po_working_hdr_id)"; 
    if($id22)$wh .= " and EXISTS (select * from po_working_item where po_status_hdr_id = {$id2} and po_working_hdr_id = b.po_working_hdr_id)"; 
    if($c_code)$wh .= " and EXISTS (select * from po_working_item where po_status_hdr_id = {$id4} and po_working_hdr_id = b.po_working_hdr_id)"; 
  
    if($bg_expense_group_id)$wh .= " and isnull(a.bg_expense_group_id,0) <>0"; 
    if($dc_expense_budget_type_id)$wh .= " and isnull(a.dc_expense_budget_type_id,0) <>0";
      /*
     จัดทำใบขอเบิก           1
     ส่งใบเบิก                2
     ทักท้วงฏีกา              3
     ยกเลิก                  4
     รับคืนทักท้วง             5
     อนุมัติฎีกา               6
     หักงบประมาณ            7
     ส่งหัวหน้าฝ่ายการคลังลงนาม 8
     ส่งผู้บริหารลงนาม        9
     จัดทำเช็ค             10
     ลงนามเช็ค(คลัง)       12
     ผู้บริหารลงนามเช็ค      13
     ทำทะเบียนจ่าย         14
     ตัดจ่ายเจ้าหนี้          15
*/
    $sqlMain = "SET NOCOUNT ON

          declare @status_1 as numeric;
          declare @status_2 as numeric;/* ตอนนี้ i_delete เป็น 1 อยู่*/
          declare @status_3 as numeric;
          declare @status_24 as numeric;
          declare @status_4 as numeric;
          declare @status_9 as numeric;
          declare @status_10 as numeric;
          declare @status_8 as numeric;
          declare @status_6 as numeric;
          declare @status_7 as numeric;
          declare @status_11 as numeric;
          declare @status_25 as numeric;

          set @status_1 = 1; /*จัดทำใบเบิก*/
          set @status_2 = 2; /*ส่งใบเบิก*/
          set @status_3 = 3; /*วันส่งทักท้วง*/
          set @status_24 = 24; /*รับคืนทักท้วง*/
          set @status_4 = 4; /*อนุมัติฎีกา*/
          set @status_9 = 9; /*เสนอผู้มีอำนาจลงนาม วันที่เสนอ*/
          set @status_10 = 10; /*เสนอผู้มีอำนาจลงนาม วันรับคืน*/
          set @status_8 = 8; /*ส่งเขียนเช็ค*/
          set @status_6 = 6; /*เสนอลงนามเช็ค วันที่ส่ง*/
          set @status_7 = 7; /**เสนอลงนามเช็ค วันที่รับ*/
          set @status_11 = 11; /**ทำทะเบียนจ่าย วันที่ส่ง*/
          set @status_25 = 25; /**ทำทะเบียนจ่าย 	วันที่จ่าย*/

          SELECT (SELECT c_name FROM dbo.dc_cost WHERE dc_cost_id=a.dc_cost_id) as cost_name,
                    (SELECT c_name FROM dbo.dc_expense_budget_type WHERE dc_expense_budget_type_id=a.dc_expense_budget_type_id) as tt_name,
                    (SELECT c_name FROM dbo.bg_expense_group WHERE bg_expense_group_id=a.bg_expense_group_id) as gg_name
                    , a.c_detail
                    , a.f_total
                    , a.c_qty
                    , a.c_code 
                    , a.c_cnt_name
                    , a.c_approve 
                    , (SELECT c_comment FROM dbo.po_working_item WHERE po_status_hdr_id = 4 and po_working_hdr_id=b.po_working_hdr_id) as c_comment
                    , (SELECT top 1 c_full_name FROM dc_user WHERE dc_user_id=a.po_emp_id) as emp_name
                    , (SELECT top 1 c_full_name FROM dc_user WHERE dc_user_id=a.po_audit_id) as audit_name
                    , b.c_code_ref 
                    , (SELECT top 1 c_code FROM dbo.po_working_item WHERE po_status_hdr_id= @status_4 and po_working_hdr_id=b.po_working_hdr_id) as c_doc_code				
                    , CONVERT(VARCHAR(10), a.d_audit_date, 120) as d_audit_date 
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE i_status=1  and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date1
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE i_status=2 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date2
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE i_status=5  and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date3
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_24 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date24
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE i_status=6 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date4
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_9 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date9
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_10 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date10
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_8 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date8
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_6 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date6
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_7 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date7
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_11 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date11
                    ,ISNULL((SELECT top 1 CONVERT(VARCHAR(10), d_doc_date, 120) FROM dbo.po_working_item WHERE po_status_hdr_id =  @status_25 and po_working_hdr_id=b.po_working_hdr_id), '') as d_doc_date25
          INTO #temp_po_rep0000		
          FROM dbo.po_working_dtl a
          INNER JOIN dbo.po_working_hdr b on b.po_working_hdr_id=a.po_working_hdr_id              
    
          WHERE a.i_budget_year = ? {$wh};    
          SELECT * 
          , CASE WHEN d_audit_date != '' and d_doc_date1 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_audit_date, 102), CONVERT(datetime, a.d_doc_date1, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_audit_date, 102) AND CONVERT(datetime, a.d_doc_date1, 102))
               ELSE 0
               END as period1 /*จำนวนวันตั้งแต่ตรวจรับจนถึงจัดทำใบขอเบิก*/

          , CASE WHEN d_doc_date3 != '' and d_doc_date24 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_doc_date3, 102), CONVERT(datetime, a.d_doc_date24, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_doc_date3, 102) AND CONVERT(datetime, a.d_doc_date24, 102))
               ELSE 0
               END as period2 /*ระยะเวลาตั้งแต่ส่งทักท้วงจนถึงวันรับคืน*/

          , CASE WHEN d_doc_date2 != '' and d_doc_date4 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_doc_date2, 102), CONVERT(datetime, a.d_doc_date4, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_doc_date2, 102) AND CONVERT(datetime, a.d_doc_date4, 102))
               ELSE 0
               END as period3 /*ระยะเวลาตั้งแต่รับใบขอเบิก (1)จนถึงอนุมัติฎีกา (2)*/

          , CASE WHEN d_doc_date9 != '' and d_doc_date10 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_doc_date9, 102), CONVERT(datetime, a.d_doc_date10, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_doc_date9, 102) AND CONVERT(datetime, a.d_doc_date10, 102))
               ELSE 0
               END as period4 /*ระยะเวลาตั้งแต่วันที่เสนอจนถึงวันรับคืน*/

          , CASE WHEN d_doc_date6 != '' and d_doc_date7 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_doc_date6, 102), CONVERT(datetime, a.d_doc_date7, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_doc_date6, 102) AND CONVERT(datetime, a.d_doc_date7, 102))
               ELSE 0
               END as period6 /*เสนอลงนามเช็ค ระยะเวลาตั้งแต่วันที่ส่งจนถึงวันที่รับ*/

          , CASE WHEN d_doc_date4 != '' and d_doc_date25 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_doc_date4, 102), CONVERT(datetime, a.d_doc_date25, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_doc_date4, 102) AND CONVERT(datetime, a.d_doc_date25, 102))
               ELSE 0
               END as period7 /*(2-3)*/

          , CASE WHEN d_doc_date2 != '' and d_doc_date25 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_doc_date2, 102), CONVERT(datetime, a.d_doc_date25, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_doc_date2, 102) AND CONVERT(datetime, a.d_doc_date25, 102))
               ELSE 0
               END as period8 /*(1-2-3)*/

          , CASE WHEN d_audit_date != '' and d_doc_date25 != '' 
               THEN DATEDIFF(day, CONVERT(datetime, a.d_doc_date2, 102), CONVERT(datetime, a.d_doc_date25, 102)) -
                    (SELECT COUNT(*) FROM po_holiday_dtl WHERE CONVERT(datetime, d_holiday, 102) between CONVERT(datetime, a.d_audit_date, 102) AND CONVERT(datetime, a.d_doc_date25, 102))
               ELSE 0
               END as period9 /*ตั้งแต่ตรวจรับจนถึงจ่ายเงิน*/
          FROM  #temp_po_rep0000 a
          ORDER BY cost_name;

          drop table  #temp_po_rep0000;
                            " ;

    //header ( "Content-type: text/plain; charset=UTF-8" ) ;
    //print($sqlMain ) ;
    //exit () ;
    $stmt2   = $db -> QueryParam ( $sqlMain , array ( $c_yyyy ) ) ;
    $ci      = 2 ;
    $th      = "<p><h3>" . $caption . "</h3><p>" ;

    $th  .= '<table class="tblRep" border=0 borderpadding=1 spacepadding=1>
            <tbody>
            <tr>
                <th style="background:#eee;width: 38px; text-align: center;" rowspan="2">ลำดับ</th>
                <th style="background:#eee;width: 98px; text-align: center;" rowspan="2">หน่วยงาน</th>
				<th style="background:#eee;width: 98px; text-align: center;" rowspan="2">ประเภทงบ</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">เลขที่ขอเบิก</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">เลขที่ฎีกา</th>
				
				<th style="background:#eee;width: 70px; text-align: center;">ตรวจรับ</th>
				<th style="background:#eee;width: 70px; text-align: center;">จัดทำใบขอเบิก</th>
				<th style="background:#eee;width: 80px; text-align: center;" rowspan="2">จำนวนวัน <br />ตั้งแต่ <br />ตรวจรับ <br />จนถึง <br />จัดทำใบขอเบิก</th>
				
				<th style="background:#eee;width: 70px; text-align: center;">(1)<br />ฝ่ายคลัง<br />รับใบขอเบิก</th>
				<th style="background:#eee; text-align: center;" colspan="2">ทักท้วง</th>
				<th style="background:#eee;width: 80px; text-align: center;" rowspan="2">ระยะเวลา <br />ตั้งแต่ <br />ส่งทักท้วง <br />จนถึง <br />วันรับคืน</th>
				<th style="background:#eee;width: 70px; text-align: center;">(2)<br />อนุมัติฎีกา</th>
				<th style="background:#eee;width: 80px; text-align: center;" rowspan="2">ระยะเวลา <br />ตั้งแต่ <br />รับใบขอเบิก (1)<br />จนถึง <br />อนุมัติฎีกา (2)</th>
				
				<th style="background:#eee;width: 70px; text-align: center;" colspan="2">เสนอผู้มีอำนาจ<br />ลงนาม<br />(ผู้ตรวจสอบฎีกา)</th>
				<th style="background:#eee;width: 80px; text-align: center;" rowspan="2">ระยะเวลา <br />ตั้งแต่ <br />วันที่เสนอ<br />จนถึง <br />วันรับคืน</th>
				
				<th style="background:#eee;width: 70px; text-align: center;" colspan="2">ส่งเขียนเช็ค</th>
				<th style="background:#eee;width: 80px; text-align: center;" rowspan="2">ระยะเวลา <br />ตั้งแต่ <br />วันที่ส่ง<br />จนถึง <br />วันที่เขียนเช็ค</th>
				
				<th style="background:#eee;width: 70px; text-align: center;" colspan="2">เสนอลงนาม<br />เช็ค</th>
				<th style="background:#eee;width: 80px; text-align: center;" rowspan="2">ระยะเวลา <br />ตั้งแต่ <br />วันที่ส่ง<br />จนถึง <br />วันที่รับ</th>
				
				<th style="background:#eee;width: 70px; text-align: center;" colspan="2">(3)<br />ทำทะเบียนจ่าย </th>
				
				<th style="background:#eee;width: 70px; text-align: center;" colspan="3">ระยะเวลาที่ใช้  (วัน)</th>
				
				<th style="background:#eee;width: 70px; text-align: center;" colspan="2">ฎีกา <br />ที่สามารถ<br />เบิก-จ่าย</th>
				
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">ผู้ขาย/ผู้รับจ้าง</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">รายละเอียดรายการ</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">จำนวน</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">จำนวนเงิน</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">ผู้ดำเนินการ</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">ผู้ตรวจสอบ</th>
				<th style="background:#eee;width: 50px; text-align: center;" rowspan="2">วันจ่าย</th>
				
            </tr>
            <tr>
                <th style="background:#eee;width: 50px; text-align: center;">วัน เดือน ปี</th>
				<th style="background:#eee;width: 50px; text-align: center;">วัน เดือน ปี</th>
				<th style="background:#eee;width: 50px; text-align: center;">วัน เดือน ปี</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันส่งทักท้วง</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันรับคืน</th>
				<th style="background:#eee;width: 50px; text-align: center;">วัน เดือน ปี</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันที่เสนอ</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันรับคืน</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันที่ส่ง</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันที่เขียนเช็ค</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันที่ส่ง</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันที่รับ</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันที่ส่ง</th>
				<th style="background:#eee;width: 50px; text-align: center;">วันที่จ่าย</th>
				
				<th style="background:#eee;width: 50px; text-align: center;">(2-3)<br />อนุมัติฎีกา <br /> จนถึง <br /> จ่ายเงิน</th>
				<th style="background:#eee;width: 50px; text-align: center;">(1-2-3)<br />รับใบขอเบิก<br /> จนถึง <br /> จ่ายเงิน</th>
				<th style="background:#eee;width: 50px; text-align: center;">ตั้งแต่<br />ตรวจรับ<br /> จนถึง <br /> จ่ายเงิน</th>
				
				<th style="background:#eee;width: 50px; text-align: center;">ภายใน<br />30 วัน</th>
				<th style="background:#eee;width: 50px; text-align: center;">30 วัน<br />ขึ้นไป</th>
            </tr>
            

    ' ;
    $td  = null ;
    $i   = 1 ;
    while ( $row = $db -> Fetch ( $stmt2 ) ) {
    
		/*declare @status_1 as numeric;
declare @status_2 as numeric;
declare @status_3 as numeric;
declare @status_24 as numeric;
declare @status_4 as numeric;
declare @status_9 as numeric;
declare @status_10 as numeric;
declare @status_8 as numeric;
declare @status_6 as numeric;
declare @status_7 as numeric;
declare @status_11 as numeric;
declare @status_25 as numeric;*/

		$str_date1 = ($row["d_doc_date1"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date1" ] ?? null ) : "&nbsp;";
		$str_period1 = ($row["period1"] > 0)? $row["period1"] : "&nbsp;";
		
		$str_date2 = ($row["d_doc_date2"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date2" ] ?? null ) : "&nbsp;";
		$str_date3 = ($row["d_doc_date3"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date3" ] ?? null ) : "&nbsp;";
		$str_date24 = ($row["d_doc_date24"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date24" ] ?? null ) : "&nbsp;";
		$str_period2 = ($row["period2"] > 0)? $row["period2"] : "&nbsp;";
		
		$str_date4 = ($row["d_doc_date4"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date4" ] ?? null ) : "&nbsp;";
		$str_period3 = ($row["period3"] > 0)? $row["period3"] : "&nbsp;";
		
		$str_date9 = ($row["d_doc_date9"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date9" ] ?? null ) : "&nbsp;";
		$str_date10 = ($row["d_doc_date10"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date10" ] ?? null ) : "&nbsp;";
		$str_period4 = ($row["period4"] > 0)? $row["period4"] : "&nbsp;";
		
		$str_date6 = ($row["d_doc_date6"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date6" ] ?? null ) : "&nbsp;";
		$str_date7 = ($row["d_doc_date7"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date7" ] ?? null ) : "&nbsp;";
		$str_period6 = ($row["period6"] > 0)? $row["period6"] : "&nbsp;";
		
		$str_date11 = ($row["d_doc_date11"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date11" ] ?? null ) : "&nbsp;";
		$str_date25 = ($row["d_doc_date25"] != "")?$date -> shot_date_from_db ( $row[ "d_doc_date25" ] ?? null ) : "&nbsp;";
		
		$str_period7 = ($row["period7"] > 0)? $row["period7"] : "&nbsp;";
		$str_period8 = ($row["period8"] > 0)? $row["period8"] : "&nbsp;";
		$str_period9 = ($row["period9"] > 0)? $row["period9"] : "&nbsp;";
		
		$in30 = ($row["period9"] > 0 and $row["period9"] <= 30) ? $row["period9"] : "&nbsp;";
		$out30 = ($row["period9"] > 30) ? $row["period9"] : "&nbsp;";

        $td    .= '<tr>
            <td style="width: 38px; text-align: center;">' . $i ++ . '</td>
            <td style="width: 98px;">' . $row[ "cost_name" ] . '</td>
            <td style="width: 207px;">' . $row[ "tt_name" ] . '</td>
			<td style="width: 48px;">' . $row[ "c_code_ref" ] . '</td>
			<td style="width: 70px;">' . $row[ "c_approve" ] . ' </td>
			
			
            <td style="width: 70px;">' . $date -> shot_date_from_db ( $row[ "d_audit_date" ] ?? null )/* วันที่ตรวจรับ */ . '</td>
            <td style="width: 70px;">' . $str_date1/* จัดทำใบขอเบิก */ . '</td>
			<td style="width: 70px;">' . $str_period1 . '</td>
			
            <td style="width: 70px;"> ' . $str_date2/* (1) ฝ่ายคลังรับใบขอเบิก */ . '</td>
			<td style="width: 70px;"> ' . $str_date3/* วันส่งทักท้วง */ . '</td>
			<td style="width: 70px;"> ' . $str_date24/* วันรับคืน */ . '</td>
			<td style="width: 70px;">' . $str_period2 . '</td>'./*ระยะเวลาตั้งแต่ส่งทักท้วงจนถึงวันรับคืน*/'
			
			<td style="width: 70px;"> ' . $str_date4/* (2) อนุมัติฎีกา */ . '</td>
            <td style="width: 70px;">' . $str_period3 . '</td>'./*ระยะเวลาตั้งแต่รับใบขอเบิก (1)จนถึงอนุมัติฎีกา (2)*/'
			
			<td style="width: 70px;"> ' . $str_date9/* วันที่เสนอ */ . '</td>
			<td style="width: 70px;"> ' . $str_date10/*วันรับคืน */ . '</td>
			<td style="width: 70px;">' . $str_period4 . '</td>'./*ระยะเวลาตั้งแต่วันที่เสนอจนถึงวันรับคืน*/'
			
			<td style="width: 70px;"> ' . /* วันที่ส่ง */  '</td>
			<td style="width: 70px;"> ' . /*วันที่เขียนเช็ค */ '</td>
			<td style="width: 70px;">&nbsp;</td>'./*ระยะเวลาตั้งแต่วันที่ส่งจนถึงวันที่เขียนเช็ค*/'
			
			<td style="width: 70px;"> ' . $str_date6/* วันที่ส่ง */ . '</td>
			<td style="width: 70px;"> ' . $str_date7/*วันที่รัย */ . '</td>
			<td style="width: 70px;">' . $str_period6 . '</td>'./*ระยะเวลาตั้งแต่วันที่ส่งจนถึงวันที่รับ*/'
			
			<td style="width: 70px;"> ' . $str_date11/* (3)ทำทะเบียนจ่าย  วันที่ส่ง*/ . '</td>
			<td style="width: 70px;"> ' . $str_date25/* (3)ทำทะเบียนจ่าย  วันที่จ่าย */ . '</td>
			
			<td style="width: 70px;">' . $str_period7 . '</td>'./*(2-3)*/'
			<td style="width: 70px;">' . $str_period8 . '</td>'./*(1-2-3)*/'
			<td style="width: 70px;">' . $str_period9 . '</td>'./*ตั้งแต่ตรวจรับจนถึงจ่ายเงิน*/'
			
			<td style="width: 70px;">' . $in30 . '</td>'./*ภายใน30 วัน*/'
			<td style="width: 70px;">' . $out30 . '</td>'./*30 วันขึ้นไป*/'
			
			<td style="width: 243px;">' . $row[ "c_cnt_name" ] . '</td>
            <td style="width: 329.035px;">' . $row[ "c_detail" ] . '</td>
            <td style="width: 103.965px; text-align: right;">' . $row[ "c_qty" ] . '</td>
            <td style="width: 143px; text-align: right;"> ' . number_format ( $row[ "f_total" ] , 2 ) . '</td>
            
            <td style="width: 199px;"> ' . $row[ "emp_name" ] . '</td>
            <td style="width: 187px;">' . $row[ "audit_name" ] . '</td>
			<td style="width: 107px;"> ' . $str_date25/* (3)ทำทะเบียนจ่าย  วันที่จ่าย */ . '</td>
        </tr>' ;
		

    } //End Loop
    $thf = "</tbody></table>" ;


    //start display
    echo '<style>'
    . ' .tblRep{'
    . ' font-size:13px;width: 4150px;'
    . '}'
    . ' .tblRep , td{'
    . 'background:#fff;'
    . '}'
    . ' .tblRep , th{'
    . 'background:#ccc;'
    . '}'

    . '</style>' ;

    echo $th . $td . $thf ;

    
