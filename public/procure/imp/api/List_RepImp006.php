<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/date/i_date.class.php");
 

$db = new DatabaseServer ();
$date = new i_date ();

$root = "data";
$data = array ();
$con = null;
function List_QueryParam() {
	global $db, $date, $root, $data, $con, $arr_status;
	
	$totalCount = 0;
	
	if ($_REQUEST ["d_date_start"] != "" && $_REQUEST ["d_date_end"] != "") {
		$con .= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
	}
	
 
	
	$for_id = explode ( ";", $_REQUEST ["dc_expense_budget_type_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_expense_budget_type_id IN (" . $in . ")" : "";
		}
	}
	
	if ($_REQUEST ["i_show_acc"] == 1) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND e.dc_acc_lv4_id IN (" . $in . ")     " : "";
			}
		}
	} else if ($_REQUEST ["i_show_acc"] == 3) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND e.dc_acc_lv5_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_id_dr IN (" . $in . ")" : "";
			}
		}
	}
	
	$ww_enable = "";
	if (@$_REQUEST ["i_enable"]!="0")
	{ 
		switch (@$_REQUEST ["i_enable"])
		{
			case "0" 	: 
			default  	: $ww_enable = "";									break;
			case "1"	: $ww_enable = " and b.i_status not in (8,9)";		break;
			case "2"	: $ww_enable = " and b.i_status in (8,9)";			break;			
		}
	}

	//ต้นฉบับ = E-Phis
	$ww_ephis  = "SELECT
						1 as i_system
						,'e-PHIS' as c_system_name
						,b.imp_request_ephis_dtl_id 
						,b.imp_request_ephis_hdr_id  
						,NULL as imp_request_vsn_dtl_id
						,NULL as imp_request_vsn_hdr_id   
						,a.dc_expense_budget_type_id
						,d.c_name AS dc_expense_budget_type_name 
						,e.dc_acc_lv4_id AS dc_acc_id_lv4_dr
						,e.c_code_lv4 AS c_acc_code_lv4_dr
						,e.c_name_lv4 AS c_acc_name_lv4_dr 
						,e.dc_acc_lv5_id  AS dc_acc_id_lv5_dr
						,e.c_code_lv5 AS c_acc_code_lv5_dr
						,e.c_name_lv5 AS c_acc_name_lv5_dr 
						,c.dc_acc_id_dr AS dc_acc_id_lv6_dr
						,e.c_code AS c_acc_code_lv6_dr
						,e.c_name AS c_acc_name_lv6_dr 
						,NULL AS dc_acc_id_lv4_cr
						,NULL AS c_acc_code_lv4_cr
						,NULL AS c_acc_name_lv4_cr
						,NULL  AS dc_acc_id_lv5_cr
						,NULL AS c_acc_code_lv5_cr
						,NULL AS c_acc_name_lv5_cr 
						,(select top 1 xx.dc_acc_id_cr  from vw_ephis_request_item_gl_reportgl00022 xx where xx.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and xx.f_cr>0 order by xx.imp_request_ephis_item_id asc) as dc_acc_id_lv6_cr
						,(select top 1 xx.c_acc_code_cr from vw_ephis_request_item_gl_reportgl00022 xx where xx.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and xx.f_cr>0 order by xx.imp_request_ephis_item_id asc) as c_acc_code_lv6_cr
						,(select top 1 xx.c_acc_name_cr from vw_ephis_request_item_gl_reportgl00022 xx where xx.imp_request_ephis_dtl_id=b.imp_request_ephis_dtl_id and xx.f_cr>0 order by xx.imp_request_ephis_item_id asc) as c_acc_name_lv6_cr
  						,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc
						,case when (b.d_canceldate is null) then NULL else  CONVERT(VARCHAR, b.d_canceldate, 120) end AS d_cancel
						,c.i_type_year
						,case 
							when (c.i_type_year=1) then 'ปีงบประมาณ'
							when (c.i_type_year=2) then 'เหลื่อมปี'
							else NULL
						end as c_type_year
						,c.c_budget_year 
						,case 
							when (c.i_cal_gl=1) then 'เงินเดือนจ่ายพนักงาน'
							when (c.i_cal_gl=2) then 'จ่ายให้บริษัท'
							else NULL
						end as c_cal_gl
						,b.c_request
						,NULL as c_request_desc
						,b.c_approve
						,b.c_acc_item
						,b.c_creditor
						,ISNULL(SUM(c.f_inv),0) AS f_inv
						,ISNULL(SUM(c.f_vat),0) AS f_vat
						,ISNULL(SUM(c.f_tax_personal),0) AS f_tax_personal
						,ISNULL(SUM(c.f_tax_corporate),0) AS f_tax_corporate
						,ISNULL(SUM(c.f_social_security),0) AS f_social_security
						,ISNULL(SUM(c.f_fine),0) AS f_fine
						,a.c_code as c_ircev_code
						,(select 
							case 
								when (jv.i_is_post=3 and jv.i_enable=1) then jv.c_code_post
								when (jv.i_is_post=2 and jv.i_enable=1) then jv.c_code
								else NULL
							end from gl_tran_hdr jv where  jv.gl_tran_hdr_id=a.gl_tran_hdr_rq_id) 
						as c_jv_code
						,SUM(c.f_dr) as f_dr_show
						,SUM(c.f_cr) as f_cr_show
						,c.i_type_show_item
					FROM imp_request_ephis_hdr a
						INNER JOIN imp_request_ephis_dtl b ON a.imp_request_ephis_hdr_id = b.imp_request_ephis_hdr_id
						INNER JOIN vw_ephis_request_item_gl_reportgl00022 c ON c.imp_request_ephis_dtl_id = b.imp_request_ephis_dtl_id
						INNER JOIN dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
						LEFT JOIN vw_dc_acc_with_parent e ON e.dc_acc_id = c.dc_acc_id_dr 
					WHERE LEFT(a.c_code,4)='IRCE' and a.i_enable = 1  AND c.f_dr>0
						{$con} {$ww_enable}
					GROUP BY  b.imp_request_ephis_dtl_id,b.imp_request_ephis_hdr_id,a.d_doc_date,b.d_canceldate,b.c_request,b.c_request_desc,b.c_approve,b.c_acc_item,b.c_creditor
							,e.dc_acc_lv4_id,e.c_code_lv4,e.c_name_lv4,e.c_code,e.c_name,e.dc_acc_lv5_id,e.c_code_lv5,e.c_name_lv5
							,c.dc_acc_id_dr,c.dc_acc_id_cr,c.i_type_year,c.c_budget_year,c.i_cal_gl
							,a.dc_expense_budget_type_id,a.c_code,a.gl_tran_hdr_rq_id,d.c_name
							 ";
	$ww_vnet = "SELECT
					2 as i_system
					,'Vision Net' as c_system_name
					,NULL as imp_request_ephis_item_id
					,NULL as imp_request_ephis_dtl_id
					,NULL as imp_request_ephis_hdr_id 
					,c.imp_request_vsn_item_id
					,b.imp_request_vsn_dtl_id 
					,b.imp_request_vsn_hdr_id  
					,a.dc_expense_budget_type_id
					,d.c_name AS dc_expense_budget_type_name 
					,e.dc_acc_lv4_id AS dc_acc_id_lv4_dr
					,e.c_code_lv4 AS c_acc_code_lv4_dr
					,e.c_name_lv4 AS c_acc_name_lv4_dr 
					,e.dc_acc_lv5_id  AS dc_acc_id_lv5_dr
					,e.c_code_lv5 AS c_acc_code_lv5_dr
					,e.c_name_lv5 AS c_acc_name_lv5_dr 
					,c.dc_acc_id_dr AS dc_acc_id_lv6_dr
					,e.c_code AS c_acc_code_lv6_dr
					,e.c_name AS c_acc_name_lv6_dr
					,f.dc_acc_lv4_id AS dc_acc_id_lv4_cr
					,f.c_code_lv4 AS c_acc_code_lv4_cr
					,f.c_name_lv4 AS c_acc_name_lv4_cr 
					,f.dc_acc_lv5_id  AS dc_acc_id_lv5_cr
					,f.c_code_lv5 AS c_acc_code_lv5_cr
					,f.c_name_lv5 AS c_acc_name_lv5_cr 
					,c.dc_acc_id_cr AS dc_acc_id_lv6_cr
					,f.c_code AS c_acc_code_lv6_cr
					,f.c_name AS c_acc_name_lv6_cr 
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc 
					,NULL as d_cancel
					,c.i_type_year
					,case 
						when (c.i_type_year=1) then 'ปีงบประมาณ'
						when (c.i_type_year=2) then 'เหลื่อมปี'
						else NULL
					end as c_type_year
					,c.c_budget_year 
					,case 
						when (c.i_cal_gl=1) then 'เงินเดือนจ่ายพนักงาน'
						when (c.i_cal_gl=2) then 'จ่ายให้บริษัท'
						else NULL
					end as c_cal_gl
					,b.c_request 
					,b.c_request_desc
					,NULL as c_approve
					,b.c_comment as c_acc_item
					,b.c_creditor 
					,case when (c.dc_acc_id_dr>0) then c.f_dr else c.f_cr end as f_inv 
					,0 as f_vat
					,0 as f_tax_personal
					,0 as f_tax_corporate
					,0 as f_social_security
					,0 as f_fine 
					,a.c_code as c_ircev_code
					,(select 
						case 
							when (jv.i_is_post=3 and jv.i_enable=1) then jv.c_code_post
							when (jv.i_is_post=2 and jv.i_enable=1) then jv.c_code
							else NULL
						end from gl_tran_hdr jv where  jv.gl_tran_hdr_id=a.gl_tran_hdr_rq_id) 
					as c_jv_code
					,c.f_dr as f_dr_show
					,c.f_cr as f_cr_show
					,c.i_type_show_item	
					,b.i_status as i_status_doc			
				FROM imp_request_vsn_hdr a
					INNER JOIN imp_request_vsn_dtl b ON a.imp_request_vsn_hdr_id = b.imp_request_vsn_hdr_id
					INNER JOIN vw_vsn_request_item_gl_reportgl00022 c ON c.imp_request_vsn_dtl_id = b.imp_request_vsn_dtl_id
					INNER JOIN dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
					LEFT JOIN vw_dc_acc_with_parent e ON e.dc_acc_id = c.dc_acc_id_dr
					LEFT JOIN vw_dc_acc_with_parent f ON f.dc_acc_id = c.dc_acc_id_cr
				WHERE LEFT(a.c_code,4)='IRCV' and a.i_enable = 1  and a.i_type_request=2
					{$con}  {$ww_enable}
				
				";
 
	switch ($_REQUEST["i_system"])
	{
		case "1" : //E-PHIS
					$sql_data 			= $ww_ephis;
					$temp_report_name	= "#tb_report_ImpRepE0006";
					$ww_order_numrow	= "(PARTITION BY d_doc ORDER BY d_doc,c_acc_code_lv4_dr,c_request)";
					$ww_order_rowacc	= "(PARTITION BY d_doc,c_acc_code_lv4_dr ORDER BY d_doc,c_acc_code_lv4_dr,c_acc_name_lv5_dr)";
					$ww_order_main		= " CASE WHEN a.d_doc IS NULL THEN 1 ELSE 0 END
											,a.d_doc, a.i_type, a.c_acc_code_lv4_dr, a.row_acc_control";
					$ww_sum_by_ddoc		= "SUM(ISNULL(f_inv,0))";
		break;
		case "2" : //V-Net
					$sql_data = $ww_vnet;
					$temp_report_name	= "#tb_report_ImpRepV0006";		
					$ww_order_numrow	= "(PARTITION BY d_doc ORDER BY d_doc,c_acc_name_lv4_dr)";
					$ww_order_rowacc	= "(PARTITION BY d_doc,c_acc_name_lv4_dr ORDER BY d_doc,c_acc_name_lv4_dr,c_acc_name_lv5_dr)";
					$ww_order_main		= " CASE WHEN a.d_doc IS NULL THEN 1 ELSE 0 END
											,a.d_doc, a.i_type,a.imp_request_vsn_dtl_id
											,a.i_type_show_item
											,a.c_acc_code_lv6_dr 
											,a.c_acc_code_lv6_cr";
											//, CASE WHEN a.c_acc_code_lv4_dr IS NOT NULL THEN 0 ELSE 1 END, a.row_acc_control";					
					$ww_sum_by_ddoc		= "SUM(ISNULL(f_dr_show,0))";
		break;
		default : //E-PHIS + V-Net
					$sql_data = $ww_ephis
								." UNION "
								.$ww_vnet;	
					$temp_report_name	= "#tb_report_ImpRepAll0006";
//E					$ww_order_numrow	= "(PARTITION BY d_doc ORDER BY d_doc,c_acc_code_lv4_dr,c_request)";
//					$ww_order_rowacc	= "(PARTITION BY d_doc,c_acc_code_lv4_dr ORDER BY d_doc,c_acc_code_lv4_dr,c_acc_name_lv5_dr)";
					$ww_order_numrow	= "(PARTITION BY d_doc ORDER BY d_doc,c_acc_name_lv4_dr,c_acc_name_lv5_dr)";
					$ww_order_rowacc	= "(PARTITION BY d_doc,c_acc_name_lv4_dr ORDER BY d_doc,c_acc_name_lv4_dr,c_acc_name_lv5_dr)";
					$ww_order_main		= " CASE WHEN a.d_doc IS NULL THEN 1 ELSE 0 END
					,a.d_doc, a.i_type, a.c_acc_code_lv4_dr, a.row_acc_control";
					$ww_sum_by_ddoc		= "SUM(ISNULL(f_inv,0))";
		break;

	}
	 
	$sqlMain = "SET NOCOUNT ON;
				SELECT *
				INTO ".$temp_report_name."
				FROM (
						".$sql_data."
					 ) a ;



				SELECT * FROM 
				( 
					/* =============== TYPE 1 เน้นใบเบิก/ตั้งหนี้ =============== */
					SELECT
						DISTINCT imp_request_vsn_dtl_id
								,1 AS i_type
								,NULL as imp_request_ephis_item_id
								,NULL as imp_request_ephis_dtl_id 
								,NULL as imp_request_vsn_item_id 
								,c_system_name
								,c_ircev_code
								,c_jv_code
								,d_doc  
								,NULL AS c_acc_code_lv4_dr
								,NULL AS c_acc_name_lv4_dr 						
								,NULL AS c_acc_code_lv5_dr
								,NULL AS c_acc_name_lv5_dr 
								,NULL AS c_acc_code_lv6_dr
								,NULL AS c_acc_name_lv6_dr
								,NULL AS c_acc_code_lv4_cr
								,NULL AS c_acc_name_lv4_cr 	
								,NULL AS c_acc_code_lv5_cr
								,NULL AS c_acc_name_lv5_cr 								  
								,NULL AS c_acc_code_lv6_cr
								,NULL AS c_acc_name_lv6_cr			
								,dc_expense_budget_type_id
								,dc_expense_budget_type_name  
								,c_request 
								,c_request_desc
								,NULL AS i_type_year
								,NULL AS c_type_year
								,NULL AS c_budget_year
								,NULL AS d_cancel
								,NULL AS c_cal_gl
								,c_creditor 
								,NULL AS c_approve
								,c_acc_item 
								,0 AS f_inv
								,0 AS f_vat
								,0 AS f_tax_personal
								,0 AS f_tax_corporate
								,0 AS f_social_security
								,0 AS f_fine 
								,0 AS f_dr_show
								,0 AS f_cr_show
								,0 AS i_type_show_item 
					FROM ".$temp_report_name."
					GROUP BY  
							imp_request_vsn_dtl_id,c_system_name,c_ircev_code,c_jv_code 				 
							,d_doc,dc_expense_budget_type_id,dc_expense_budget_type_name
							,c_request,c_request_desc,c_creditor,c_acc_item
							,c_acc_name_lv4_dr,c_acc_name_lv5_dr,c_acc_name_lv4_cr,c_acc_name_lv5_cr
					UNION ALL	
					/* =============== TYPE 1 เน้น item ลงบัญชีของ ใบเบิก/ตั้งหนี้ =============== */
					SELECT
						 imp_request_vsn_dtl_id
						,1 AS i_type
						,NULL as imp_request_ephis_item_id
						,NULL as imp_request_ephis_dtl_id 
						,imp_request_vsn_item_id  
						,NULL as c_system_name
						,NULL as c_ircev_code
						,NULL as c_jv_code  
						,d_doc 
						,c_acc_code_lv4_dr
						,c_acc_name_lv4_dr 						
						,c_acc_code_lv5_dr
						,c_acc_name_lv5_dr 
						,c_acc_code_lv6_dr
						,c_acc_name_lv6_dr 
						,c_acc_code_lv4_cr
						,c_acc_name_lv4_cr 
						,c_acc_code_lv5_cr
						,c_acc_name_lv5_cr						 
						,c_acc_code_lv6_cr
						,c_acc_name_lv6_cr					
						,NULL as dc_expense_budget_type_id
						,NULL as dc_expense_budget_type_name  
						,NULL as c_request 
						,NULL as c_request_desc
						,i_type_year
						,c_type_year
						,c_budget_year
						,NULL as d_cancel
						,c_cal_gl
						,NULL as c_creditor 
						,NULL as c_approve
						,NULL as c_acc_item 
						,0 AS f_inv
						,0 AS f_vat
						,0 AS f_tax_personal
						,0 AS f_tax_corporate
						,0 AS f_social_security
						,0 AS f_fine 
						,f_dr_show
						,f_cr_show
						,i_type_show_item 
					FROM ".$temp_report_name."
					UNION ALL
					/* =============== TYPE 2 สรุปยอด LV4+5 DR/CR รายวัน =============== */
					SELECT
							NULL AS imp_request_vsn_dtl_id
							,2 AS i_type
							,NULL as imp_request_ephis_item_id
							,NULL as imp_request_ephis_dtl_id 
							,NULL as imp_request_vsn_item_id  
							,NULL AS c_system_name
							,NULL AS c_ircev_code
							,NULL AS c_jv_code  
							,d_doc
							,c_acc_code_lv4_dr
							,c_acc_name_lv4_dr 						
							,c_acc_code_lv5_dr
							,c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv4_cr
							,c_acc_name_lv4_cr 
							,c_acc_code_lv5_cr
							,c_acc_name_lv5_cr 							
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr 
							,NULL AS dc_expense_budget_type_id
							,NULL AS dc_expense_budget_type_name  
							,NULL AS c_request 
							,NULL AS c_request_desc
							,NULL AS i_type_year
							,NULL AS c_type_year
							,NULL AS c_budget_year
							,NULL AS d_cancel
							,NULL AS c_cal_gl
							,NULL AS c_creditor 
							,NULL AS c_approve
							,NULL AS c_acc_item  
							,0 AS f_inv	
							,0 AS f_vat
							,0 AS f_tax_personal	
							,0 AS f_tax_corporate
							,0 AS f_social_security
							,0 AS f_fine 
							,SUM(ISNULL(f_dr_show,0)) AS f_dr_show 
							,SUM(ISNULL(f_cr_show,0)) AS f_cr_show 
							,case when (i_type_show_item=1) then 3 else 4 end AS i_type_show_item 
					FROM ".$temp_report_name."
					GROUP BY d_doc,c_acc_code_lv4_dr,c_acc_name_lv4_dr,c_acc_code_lv5_dr,c_acc_name_lv5_dr 
							,i_type_show_item,c_acc_code_lv4_cr,c_acc_name_lv4_cr,c_acc_code_lv5_cr,c_acc_name_lv5_cr 
					UNION ALL
					/* =============== TYPE 3 สรุปยอด LV4 DR/CR รายวัน =============== */
					SELECT
							NULL AS imp_request_vsn_dtl_id
							,3 AS i_type
							,NULL as imp_request_ephis_item_id
							,NULL as imp_request_ephis_dtl_id 
							,NULL as imp_request_vsn_item_id  
							,NULL AS c_system_name
							,NULL AS c_ircev_code
							,NULL AS c_jv_code  
							,d_doc
							,c_acc_code_lv4_dr
							,c_acc_name_lv4_dr 						
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv4_cr
							,c_acc_name_lv4_cr 
							,NULL AS c_acc_code_lv5_cr
							,NULL AS c_acc_name_lv5_cr 							
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr 
							,NULL AS dc_expense_budget_type_id
							,NULL AS dc_expense_budget_type_name  
							,NULL AS c_request 
							,NULL AS c_request_desc
							,NULL AS i_type_year
							,NULL AS c_type_year
							,NULL AS c_budget_year
							,NULL AS d_cancel
							,NULL AS c_cal_gl
							,NULL AS c_creditor 
							,NULL AS c_approve
							,NULL AS c_acc_item  
							,0 AS f_inv	
							,0 AS f_vat
							,0 AS f_tax_personal	
							,0 AS f_tax_corporate
							,0 AS f_social_security
							,0 AS f_fine 
							,SUM(ISNULL(f_dr_show,0)) AS f_dr_show 
							,SUM(ISNULL(f_cr_show,0)) AS f_cr_show 
							,case when (i_type_show_item=1) then 5 else 6 end AS i_type_show_item 
					FROM ".$temp_report_name."
					GROUP BY d_doc,c_acc_code_lv4_dr,c_acc_name_lv4_dr
							,c_acc_code_lv4_cr,c_acc_name_lv4_cr,i_type_show_item

					UNION ALL
					/* =============== TYPE 4 สรุปยอด DR/CR รายวัน =============== */
					SELECT
							NULL AS imp_request_vsn_dtl_id
							,4 AS i_type
							,NULL as imp_request_ephis_item_id
							,NULL as imp_request_ephis_dtl_id 
							,NULL as imp_request_vsn_item_id  
							,NULL AS c_system_name
							,NULL AS c_ircev_code
							,NULL AS c_jv_code  
							,d_doc
							,NULL AS c_acc_code_lv4_dr
							,NULL AS c_acc_name_lv4_dr 						
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,NULL AS c_acc_code_lv4_cr
							,NULL AS c_acc_name_lv4_cr 
							,NULL AS c_acc_code_lv5_cr
							,NULL AS c_acc_name_lv5_cr 							
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr 
							,NULL AS dc_expense_budget_type_id
							,NULL AS dc_expense_budget_type_name  
							,NULL AS c_request 
							,NULL AS c_request_desc
							,NULL AS i_type_year
							,NULL AS c_type_year
							,NULL AS c_budget_year
							,NULL AS d_cancel
							,NULL AS c_cal_gl
							,NULL AS c_creditor 
							,NULL AS c_approve
							,NULL AS c_acc_item  
							,0 AS f_inv	
							,0 AS f_vat
							,0 AS f_tax_personal	
							,0 AS f_tax_corporate
							,0 AS f_social_security
							,0 AS f_fine 
							,SUM(ISNULL(f_dr_show,0)) AS f_dr_show 
							,SUM(ISNULL(f_cr_show,0)) AS f_cr_show 
							,7 AS i_type_show_item
					FROM ".$temp_report_name."
					GROUP BY d_doc 
					UNION ALL
					/* =============== TYPE 5 สรุปทุกวัน LV5 =============== */
					SELECT
							NULL AS imp_request_vsn_dtl_id
							,5 AS i_type
							,NULL as imp_request_ephis_item_id
							,NULL as imp_request_ephis_dtl_id 
							,NULL as imp_request_vsn_item_id  
							,NULL AS c_system_name
							,NULL AS c_ircev_code
							,NULL AS c_jv_code  
							,NULL AS d_doc
							,c_acc_code_lv4_dr
							,c_acc_name_lv4_dr 						
							,c_acc_code_lv5_dr
							,c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv4_cr
							,c_acc_name_lv4_cr 						
							,c_acc_code_lv5_cr
							,c_acc_name_lv5_cr 							
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr 
							,NULL AS dc_expense_budget_type_id
							,NULL AS dc_expense_budget_type_name  
							,NULL AS c_request 
							,NULL AS c_request_desc
							,NULL AS i_type_year
							,NULL AS c_type_year
							,NULL AS c_budget_year
							,NULL AS d_cancel
							,NULL AS c_cal_gl
							,NULL AS c_creditor 
							,NULL AS c_approve
							,NULL AS c_acc_item  
							,0 AS f_inv	
							,0 AS f_vat
							,0 AS f_tax_personal	
							,0 AS f_tax_corporate
							,0 AS f_social_security
							,0 AS f_fine 
							,SUM(ISNULL(f_dr_show,0)) AS f_dr_show 
							,SUM(ISNULL(f_cr_show,0)) AS f_cr_show 
							,case when (i_type_show_item=1) then 8 else 9 end AS i_type_show_item 
					FROM ".$temp_report_name."
					GROUP BY c_acc_code_lv4_dr,c_acc_name_lv4_dr,c_acc_code_lv5_dr,c_acc_name_lv5_dr
							,c_acc_code_lv4_cr,c_acc_name_lv4_cr,c_acc_code_lv5_cr,c_acc_name_lv5_cr
							,i_type_show_item 
					UNION ALL
					/* =============== TYPE 6 สรุปทุกวัน LV4 =============== */
					SELECT
							NULL AS imp_request_vsn_dtl_id
							,6 AS i_type
							,NULL as imp_request_ephis_item_id
							,NULL as imp_request_ephis_dtl_id 
							,NULL as imp_request_vsn_item_id  
							,NULL AS c_system_name
							,NULL AS c_ircev_code
							,NULL AS c_jv_code  
							,NULL AS d_doc
							,c_acc_code_lv4_dr
							,c_acc_name_lv4_dr 						
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv4_cr
							,c_acc_name_lv4_cr 						
							,NULL AS c_acc_code_lv5_cr
							,NULL AS c_acc_name_lv5_cr 							
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr 
							,NULL AS dc_expense_budget_type_id
							,NULL AS dc_expense_budget_type_name  
							,NULL AS c_request 
							,NULL AS c_request_desc
							,NULL AS i_type_year
							,NULL AS c_type_year
							,NULL AS c_budget_year
							,NULL AS d_cancel
							,NULL AS c_cal_gl
							,NULL AS c_creditor 
							,NULL AS c_approve
							,NULL AS c_acc_item  
							,0 AS f_inv	
							,0 AS f_vat
							,0 AS f_tax_personal	
							,0 AS f_tax_corporate
							,0 AS f_social_security
							,0 AS f_fine 
							,SUM(ISNULL(f_dr_show,0)) AS f_dr_show 
							,SUM(ISNULL(f_cr_show,0)) AS f_cr_show 
							,case when (i_type_show_item=1) then 10 else 11 end AS i_type_show_item 
					FROM ".$temp_report_name."
					GROUP BY c_acc_code_lv4_dr,c_acc_name_lv4_dr,c_acc_code_lv4_cr,c_acc_name_lv4_cr,i_type_show_item 
					 ) a
				ORDER BY ".$ww_order_main."
					 
				";

    //echo $sqlMain;exit;

	$arrParam  = array(); 
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	
	$sum_f_inv = 0;
	$sum_f_vat = 0;
	$sum_f_tax_personal = 0;
	$sum_f_tax_corporate = 0;
	$sum_f_social_security = 0; 
	$sum_f_fine = 0; 
	$sum_f_dr_show= 0; 
	$sum_f_cr_show = 0; 
	
	if ($stmt) {
		
		$f_dr_show = 0;
		$f_cr_show = 0;
		
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			$temp = array (
					"i_type" => $row ["i_type"],  
					"c_system_name" => $row ["c_system_name"],
					"c_ircev_code" => $row ["c_ircev_code"],
					"c_jv_code" => $row ["c_jv_code"],
					//"no" => $row ["numrow"],
					"d_doc" => ($row ["d_doc"] != "" && ($row ["i_type"] == 1 || $row ["i_type"] == 4)) ? $date->shot_date_from_db ( $row ["d_doc"] ) : "", 	
					
					"i_acc_control_full" => ($row ["c_acc_code_lv4_dr"] !="") ? 1 : 2,
					"c_acc_code_lv4_dr" => ($row ["c_acc_code_lv4_dr"] != "" || $row["i_type"] == 1) ? $row ["c_acc_code_lv4_dr"] : "- ไม่มีบัญชีคุม LV4 -",
					"c_acc_name_lv4_dr" => ($row ["c_acc_name_lv4_dr"] != "" || $row["i_type"] == 1) ? $row ["c_acc_name_lv4_dr"] : "- ไม่มีบัญชีคุม LV4 -",
					
					"i_acc_control_full_lv5" => ($row ["c_acc_code_lv5_dr"] !="") ? 1 : 2,
					"c_acc_code_lv5_dr" => ($row ["c_acc_code_lv5_dr"] != "" || $row["i_type"] == 1) ? $row ["c_acc_code_lv5_dr"] : "- ไม่มีบัญชีคุม LV5 -",
					"c_acc_name_lv5_dr" => ($row ["c_acc_name_lv5_dr"] != "" || $row["i_type"] == 1) ? $row ["c_acc_name_lv5_dr"] : "- ไม่มีบัญชีคุม LV5 -",
				 	"c_acc_code_dr_last" => $row ["c_acc_code_lv6_dr"] ,
					"c_acc_name_dr_last" => $row ["c_acc_name_lv6_dr"] ,					
					"c_acc_code_cr_last" => $row ["c_acc_code_lv6_cr"] ,
					"c_acc_name_cr_last" => $row ["c_acc_name_lv6_cr"] , 
					"c_acc_dr_lv4_full" => $row ["c_acc_code_lv4_dr"].' '.$row ["c_acc_name_lv4_dr"], 
					"c_acc_dr_lv5_full" => $row ["c_acc_code_lv5_dr"].' '.$row ["c_acc_name_lv5_dr"], 
					"c_acc_dr_last_full" => $row ["c_acc_code_lv6_dr"].' '.$row ["c_acc_name_lv6_dr"], 

					"c_acc_cr_lv4_full" => $row ["c_acc_code_lv4_cr"].' '.$row ["c_acc_name_lv4_cr"], 
					"c_acc_cr_lv5_full" => $row ["c_acc_code_lv5_cr"].' '.$row ["c_acc_name_lv5_cr"], 					
					"c_acc_cr_last_full" => $row ["c_acc_code_lv6_cr"].' '.$row ["c_acc_name_lv6_cr"], 
					 
					"dc_expense_budget_type_id" => $row ["dc_expense_budget_type_id"],
					"dc_expense_budget_type_name" => $row ["dc_expense_budget_type_name"], 
					"c_request" => $row ["c_request"],
					"c_request_desc" => $row ["c_request_desc"],
					"c_type_year" => $row ["c_type_year"],
					"c_budget_year" => ($row ["i_type_year"] == 1) ? ($row ["c_budget_year"] + 543) : ($row ["c_budget_year"] + 543) . " (เหลื่อมปี)",
					"i_type_year" => $row ["i_type_year"],
					"d_cancel" => ($row ["d_cancel"] != "" && ($row ["i_type"] == 1 )) ? $date->shot_date_from_db ( $row ["d_cancel"] ) : "", 	
				 	"c_cal_gl" => $row ["c_cal_gl"],
					"c_creditor" => $row ["c_creditor"],
					"c_approve" => $row ["c_approve"],
					"c_acc_item" => $row ["c_acc_item"],  
					"f_inv" => $row ["f_inv"],
					"f_vat" => $row ["f_vat"],
					"f_tax_personal" => $row ["f_tax_personal"],
					"f_tax_corporate" => $row ["f_tax_corporate"],
					"f_social_security" => $row ["f_social_security"],
					"f_fine" => $row ["f_fine"],
					"f_dr_show" => $row ["f_dr_show"] ,
					"f_cr_show" => $row ["f_cr_show"]  ,
					"i_type_show_item" => $row ["i_type_show_item"]
			);
			
			if ($row ["i_type"] == 1) {
				//$f_inv 		+= ($row ["c_system_name"]=="Vision Net") ? $row ["f_dr_show"] : $row ["f_inv"]; 
				$f_dr_show += $row ["f_dr_show"];
				$f_cr_show += $row ["f_cr_show"];
			}
			
			${$root} [] = $temp;
		}
		
		$temp = array (
				"i_type" => 7,
				"f_dr_show" => $f_dr_show, 
				"f_cr_show" => $f_cr_show 
		);
		
		${$root} [] = $temp;
	}
	
	return json_encode ( array (
			"debug" => true,
			"totalCount" => $totalCount,
			$root => ${$root} 
	) );
}

?>
