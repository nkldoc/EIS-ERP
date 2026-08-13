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
		$con .= " AND b.d_doc BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_date_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_date_end"]}'+' 23:59:59',102)";
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
	
	//CR dc_acc
	$for_id_cr = explode ( ";", $_REQUEST ["dc_acc_id_cr"] );
	if (! in_array ( "0", $for_id_cr )) {
		$in_cr = "";
		if (is_array ( $for_id_cr )) {
			foreach ( $for_id_cr as $val ) {
				$in_cr .= ($in_cr == "") ? $val : ", " . $val;
			}
			$con .= ($in_cr != "") ? " AND b.dc_acc_id_cr IN (" . $in_cr . ")" : "";
		}
	}
	else
	{
		$for_cr_id = explode(";", $_REQUEST["dc_acc_id_cr"]);
		$in = "";
		foreach ($for_cr_id as $val) {
			$in .= ($in == "") ? $val : ", " . $val;
		}
		
		$con .= ($in != "") ? " AND b.dc_acc_id_cr IN (" . $in . ")" : "";
		 
	}

	// if($_REQUEST["i_type_year"] > 0) {
	// 	$con .= " AND b.i_type_year = ".$_REQUEST["i_type_year"];
	// 	$con .= " AND b.c_budget_year = ".$_REQUEST["c_budget_year"];
	// }
	
	// if($_REQUEST["i_cal_gl"] > 0) {
	// 	$con .= " AND b.i_cal_gl = ".$_REQUEST["i_cal_gl"]; 
	// }

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
						,b.dc_acc_id_dr AS dc_acc_id_lv6_dr
						,e.c_code AS c_acc_code_lv6_dr
						,e.c_name AS c_acc_name_lv6_dr
						,f.dc_acc_lv4_id AS dc_acc_id_lv4_cr
						,f.c_code_lv4 AS c_acc_code_lv4_cr
						,f.c_name_lv4 AS c_acc_name_lv4_cr 
						,f.dc_acc_lv5_id  AS dc_acc_id_lv5_cr
						,f.c_code_lv5 AS c_acc_code_lv5_cr
						,f.c_name_lv5 AS c_acc_name_lv5_cr 
						,b.dc_acc_id_cr AS dc_acc_id_lv6_cr
						,f.c_code AS c_acc_code_lv6_cr
						,f.c_name AS c_acc_name_lv6_cr

						,CONVERT(VARCHAR(10), b.d_doc, 120) AS d_doc
						,case when (b.d_canceldate is null) then NULL else  CONVERT(VARCHAR(10), b.d_canceldate, 120) end AS d_cancel
						,b.i_type_year
						,case 
							when (b.i_type_year=1) then 'ปีงบประมาณ'
							when (b.i_type_year=2) then 'เหลื่อมปี'
							else NULL
						end as c_type_year
						,b.c_budget_year 
						,case 
							when (b.i_cal_gl=1) then 'เงินเดือนจ่ายพนักงาน'
							when (b.i_cal_gl=2) then 'จ่ายให้บริษัท'
							else NULL
						end as c_cal_gl
						,b.c_request
						,NULL as c_request_desc
						,b.c_approve
						,b.c_acc_item
						,b.c_creditor
						,b.f_inv
						,b.f_vat
						,b.f_tax_personal
						,b.f_tax_corporate
						,b.f_social_security 
						,b.f_fine 
						,a.c_code as c_ircev_code
						,(select 
							case 
								when (jv.i_is_post=3 and jv.i_enable=1) then jv.c_code_post
								when (jv.i_is_post=2 and jv.i_enable=1) then jv.c_code
								else NULL
							end from gl_tran_hdr jv where  jv.gl_tran_hdr_id=a.gl_tran_hdr_rq_id) 
						as c_jv_code
						,bb.c_code as c_imp_exp_code
						,bb.c_jv_exp						
						,bb.imp_expense_vsn_dtl_id 
						,case when (bb.d_doc is null) then NULL else  CONVERT(VARCHAR(10),bb.d_doc, 120) end AS d_doc_exp_approve 
						,bb.c_approve as c_exp_approve
						,bb.f_inv as f_inv_exp
						,isnull(b.f_inv,0) - isnull(bb.f_inv,0) as f_rest
					FROM imp_request_ephis_hdr a
						INNER JOIN imp_request_ephis_dtl b ON a.imp_request_ephis_hdr_id = b.imp_request_ephis_hdr_id
						INNER JOIN dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
						LEFT JOIN vw_dc_acc_with_parent e ON e.dc_acc_id = b.dc_acc_id_dr
						LEFT JOIN vw_dc_acc_with_parent f ON f.dc_acc_id = b.dc_acc_id_cr
						LEFT JOIN vw_vsn_dtl_glrep00025 bb ON bb.c_request = b.c_request
					WHERE LEFT(a.c_code,4)='IRCE' and a.i_enable = 1  
						{$con}";
	$ww_vnet = "SELECT
					2 as i_system
					,'Vision Net' as c_system_name
					,NULL as imp_request_ephis_dtl_id
					,NULL as imp_request_ephis_hdr_id 
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
					,b.dc_acc_id_dr AS dc_acc_id_lv6_dr
					,e.c_code AS c_acc_code_lv6_dr
					,e.c_name AS c_acc_name_lv6_dr
					,f.dc_acc_lv4_id AS dc_acc_id_lv4_cr
					,f.c_code_lv4 AS c_acc_code_lv4_cr
					,f.c_name_lv4 AS c_acc_name_lv4_cr 
					,f.dc_acc_lv5_id  AS dc_acc_id_lv5_cr
					,f.c_code_lv5 AS c_acc_code_lv5_cr
					,f.c_name_lv5 AS c_acc_name_lv5_cr 
					,b.dc_acc_id_cr AS dc_acc_id_lv6_cr
					,f.c_code AS c_acc_code_lv6_cr
					,f.c_name AS c_acc_name_lv6_cr

					,CONVERT(VARCHAR, b.d_doc, 120) AS d_doc 
					,NULL as d_cancel
					,b.i_type_year
					,case 
						when (b.i_type_year=1) then 'ปีงบประมาณ'
						when (b.i_type_year=2) then 'เหลื่อมปี'
						else NULL
					end as c_type_year
					,b.c_budget_year 
					,case 
						when (b.i_cal_gl=1) then 'เงินเดือนจ่ายพนักงาน'
						when (b.i_cal_gl=2) then 'จ่ายให้บริษัท'
						else NULL
					end as c_cal_gl
					,b.c_request 
					,b.c_request_desc
					,NULL as c_approve
					,b.c_acc_item
					,b.c_creditor
					,b.f_inv 
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
					,bb.c_code as c_imp_exp_code
					,bb.c_jv_exp
					,bb.imp_expense_vsn_dtl_id
					,case when (bb.d_doc is null) then NULL else  CONVERT(VARCHAR(10),bb.d_doc, 120) end AS d_doc_exp_approve 
					,bb.c_approve as c_exp_approve
					,bb.f_inv as f_inv_exp
					,isnull(b.f_inv,0) - isnull(bb.f_inv,0) as f_rest
				FROM imp_request_vsn_hdr a
					INNER JOIN imp_request_vsn_dtl b ON a.imp_request_vsn_hdr_id = b.imp_request_vsn_hdr_id
					INNER JOIN dc_expense_budget_type d ON a.dc_expense_budget_type_id = d.dc_expense_budget_type_id
					LEFT JOIN vw_dc_acc_with_parent e ON e.dc_acc_id = b.dc_acc_id_dr
					LEFT JOIN vw_dc_acc_with_parent f ON f.dc_acc_id = b.dc_acc_id_cr
					LEFT JOIN vw_vsn_dtl_glrep00025 bb ON bb.c_request = b.c_request
				WHERE LEFT(a.c_code,4)='IRCV' and a.i_enable = 1  
					{$con}";

	switch ($_REQUEST["i_system"])
	{
		case "1" : //E-PHIS
					$sql_data 			= $ww_ephis;
					$temp_report_name	= "#tb_report_GlRepE00025";
		break;
		case "2" : //V-Net
					$sql_data = $ww_vnet;
					$temp_report_name	= "#tb_report_GlRepV00025";					
		break;
		default : //E-PHIS + V-Net
					$sql_data = $ww_ephis
								." UNION "
								.$ww_vnet;	
					$temp_report_name	= "#tb_report_GlRepAll00025";
		break;

	}
	 
	  //FXIED  DR หรือ CR ของตอนตั้งหนี้ใบเบิก

	if ($_REQUEST["i_group_acc"]=="1")
	{
		$fixed_show_report 				= "DR";

		$ww_order_by_numrow_acc_main 	= "(PARTITION BY d_doc ORDER BY d_doc,c_acc_name_lv4_dr)";
		$ww_order_by_numrow_acc_control = "(PARTITION BY d_doc,c_acc_name_lv4_dr ORDER BY d_doc,c_acc_name_lv4_dr,c_acc_name_lv5_dr)";

		$ww_fields_type1 =  ",c_acc_code_lv4_dr
							,c_acc_name_lv4_dr 						
							,c_acc_code_lv5_dr
							,c_acc_name_lv5_dr
							,c_acc_code_lv6_dr
							,c_acc_name_lv6_dr  
							,c_acc_code_lv6_cr
							,c_acc_name_lv6_cr";

		$ww_fields_type2 = ",c_acc_code_lv4_dr
							,c_acc_name_lv4_dr 						
							,c_acc_code_lv5_dr
							,c_acc_name_lv5_dr
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr";
				
		$ww_fields_type3 = ",c_acc_code_lv4_dr
							,c_acc_name_lv4_dr 
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr"; 

		$ww_fields_type4 = ",NULL AS c_acc_code_lv4_dr
							,NULL AS c_acc_name_lv4_dr 
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr";			

		$ww_fields_type5 = ",c_acc_code_lv4_dr
							,c_acc_name_lv4_dr						
							,c_acc_code_lv5_dr
							,c_acc_name_lv5_dr
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr";	

		$ww_fields_type6 = ",c_acc_code_lv4_dr
							,c_acc_name_lv4_dr
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr";

		$ww_group_type2 = "d_doc,c_acc_code_lv4_dr,c_acc_name_lv4_dr,c_acc_code_lv5_dr,c_acc_name_lv5_dr";
		$ww_group_type3 = "d_doc,c_acc_code_lv4_dr,c_acc_name_lv4_dr";
		$ww_group_type4 = "d_doc";
		$ww_group_type5 = "c_acc_code_lv4_dr,c_acc_name_lv4_dr,c_acc_code_lv5_dr,c_acc_name_lv5_dr";
		$ww_group_type6 = "c_acc_code_lv4_dr,c_acc_name_lv4_dr";
		
		$ww_order_main = "CASE WHEN a.d_doc IS NULL THEN 1 ELSE 0 END
						,a.d_doc, a.i_type, a.c_acc_code_lv4_dr, a.row_acc_control
						,a.dc_expense_budget_type_name,a.c_request"; 
	}
	else if ($_REQUEST["i_group_acc"]=="2")
	{
		$fixed_show_report 				= "CR";

		$ww_order_by_numrow_acc_main 	= "(PARTITION BY d_doc ORDER BY d_doc,c_acc_name_lv6_cr)";
		$ww_order_by_numrow_acc_control = "(PARTITION BY d_doc ORDER BY d_doc,c_acc_name_lv6_cr)";

		$ww_fields_type1 = 	",NULL as c_acc_code_lv4_dr
							,NULL as c_acc_name_lv4_dr
							,NULL as c_acc_code_lv5_dr
							,NULL as c_acc_name_lv5_dr
							,c_acc_code_lv6_dr
							,c_acc_name_lv6_dr  
							,c_acc_code_lv6_cr
							,c_acc_name_lv6_cr";  
								
		$ww_fields_type2 = ",NULL as c_acc_code_lv4_dr
							,NULL as c_acc_name_lv4_dr 						
							,NULL as c_acc_code_lv5_dr
							,NULL as c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv6_cr
							,c_acc_name_lv6_cr";	

		$ww_fields_type3 = ",NULL AS c_acc_code_lv4_dr
							,NULL AS c_acc_name_lv4_dr 
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv6_cr
							,c_acc_name_lv6_cr";					
				
		$ww_fields_type4 = ",NULL AS c_acc_code_lv4_dr
							,NULL AS c_acc_name_lv4_dr 
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr 
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,NULL AS c_acc_code_lv6_cr
							,NULL AS c_acc_name_lv6_cr";			

		$ww_fields_type5 = ",NULL AS c_acc_code_lv4_dr
							,NULL AS c_acc_name_lv4_dr						
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv6_cr
							,c_acc_name_lv6_cr";	

		$ww_fields_type6 = ",NULL AS c_acc_code_lv4_dr
							,NULL AS c_acc_name_lv4_dr
							,NULL AS c_acc_code_lv5_dr
							,NULL AS c_acc_name_lv5_dr
							,NULL AS c_acc_code_lv6_dr
							,NULL AS c_acc_name_lv6_dr
							,c_acc_code_lv6_cr
							,c_acc_name_lv6_cr"; 

		$ww_group_type2 = "d_doc,c_acc_code_lv6_cr,c_acc_name_lv6_cr";
		$ww_group_type3 = "d_doc,c_acc_code_lv6_cr,c_acc_name_lv6_cr";
		$ww_group_type4 = "d_doc";
		$ww_group_type5 = "c_acc_code_lv6_cr,c_acc_name_lv6_cr";
		$ww_group_type6 = "c_acc_code_lv6_cr,c_acc_name_lv6_cr";
		
		$ww_order_main = "CASE WHEN a.d_doc IS NULL THEN 1 ELSE 0 END
						,a.d_doc, a.i_type, a.c_acc_code_lv6_cr, a.row_acc_control
						,a.dc_expense_budget_type_name,a.c_request"; 							
	}

	$sqlMain = "SET NOCOUNT ON;
				SELECT *
				INTO ".$temp_report_name."
				FROM (
						".$sql_data."
					 ) a ;



				SELECT * FROM 
				( 
					SELECT
						1 AS i_type
						,'".$fixed_show_report."' AS i_show_group
						,c_system_name
						,c_ircev_code
						,c_jv_code
						,ROW_NUMBER() OVER ".$ww_order_by_numrow_acc_main." AS numrow
						,ROW_NUMBER() OVER ".$ww_order_by_numrow_acc_control." AS row_acc_control					 
						,d_doc
						".$ww_fields_type1."  
						,dc_expense_budget_type_id
						,dc_expense_budget_type_name  
						,c_request 
						,c_request_desc
						,i_type_year
						,c_type_year
						,c_budget_year
						,d_cancel
						,c_cal_gl
						,c_creditor 
						,c_approve
						,c_acc_item 
						,f_inv
						,f_vat
						,f_tax_personal
						,f_tax_corporate
						,f_social_security
						,f_fine
						,c_imp_exp_code
						,c_jv_exp
						,imp_expense_vsn_dtl_id
						,d_doc_exp_approve
						,c_exp_approve
						,f_inv_exp	
						,ISNULL(f_inv,0) - ISNULL(f_inv_exp,0) AS f_rest
					FROM ".$temp_report_name."
					UNION ALL
					/* =============== SUM D_DOC+ACC_CONTROL LV4+5 ============== */
					SELECT
						2 AS i_type
						,'".$fixed_show_report."' AS i_show_group
						,NULL AS c_system_name
						,NULL AS c_ircev_code
						,NULL AS c_jv_code
						,NULL AS numrow
						,NULL AS row_acc_control  
						,d_doc 
						".$ww_fields_type2."  
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
						,SUM(ISNULL(f_inv,0)) AS f_inv	
						,SUM(ISNULL(f_vat,0)) AS f_vat
						,SUM(ISNULL(f_tax_personal,0)) AS f_tax_personal	
						,SUM(ISNULL(f_tax_corporate,0)) AS f_tax_corporate
						,SUM(ISNULL(f_social_security,0)) AS f_social_security
						,SUM(ISNULL(f_fine,0)) AS f_fine 
						,NULL as c_imp_exp_code
						,NULL as c_jv_exp
						,NULL as imp_expense_vsn_dtl_id
						,NULL as d_doc_exp_approve
						,NULL as c_exp_approve	
						,SUM(ISNULL(f_inv_exp,0)) AS f_inv_exp		
						,SUM(ISNULL(f_rest,0)) AS f_rest				
					FROM ".$temp_report_name."
					GROUP BY ".$ww_group_type2."
					UNION ALL
					/* =============== SUM ACC_CONTROL LV4 ============== */
					SELECT
						3 AS i_type
						,'".$fixed_show_report."' AS i_show_group
						,NULL AS c_system_name
						,NULL AS c_ircev_code
						,NULL AS c_jv_code
						,NULL AS numrow
						,NULL AS row_acc_control  
						,d_doc
						".$ww_fields_type3." 
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
						,SUM(ISNULL(f_inv,0)) AS f_inv	
						,SUM(ISNULL(f_vat,0)) AS f_vat
						,SUM(ISNULL(f_tax_personal,0)) AS f_tax_personal	
						,SUM(ISNULL(f_tax_corporate,0)) AS f_tax_corporate
						,SUM(ISNULL(f_social_security,0)) AS f_social_security
						,SUM(ISNULL(f_fine,0)) AS f_fine
						,NULL as c_imp_exp_code
						,NULL as c_jv_exp
						,NULL as imp_expense_vsn_dtl_id
						,NULL as d_doc_exp_approve
						,NULL as c_exp_approve	
						,SUM(ISNULL(f_inv_exp,0)) AS f_inv_exp		
						,SUM(ISNULL(f_rest,0)) AS f_rest				
					FROM ".$temp_report_name."
					GROUP BY ".$ww_group_type3."
					UNION ALL
					/* ================== SUM DATE ================== */
					SELECT
						4 AS i_type
						,'".$fixed_show_report."' AS i_show_group
						,NULL AS c_system_name
						,NULL AS c_ircev_code
						,NULL AS c_jv_code
						,NULL AS numrow
						,NULL AS row_acc_control  
						,d_doc
						".$ww_fields_type4."
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
						,SUM(ISNULL(f_inv,0)) AS f_inv	
						,SUM(ISNULL(f_vat,0)) AS f_vat
						,SUM(ISNULL(f_tax_personal,0)) AS f_tax_personal	
						,SUM(ISNULL(f_tax_corporate,0)) AS f_tax_corporate
						,SUM(ISNULL(f_social_security,0)) AS f_social_security
						,SUM(ISNULL(f_fine,0)) AS f_fine 
						,NULL as c_imp_exp_code
						,NULL as c_jv_exp
						,NULL as imp_expense_vsn_dtl_id
						,NULL as d_doc_exp_approve
						,NULL as c_exp_approve	
						,SUM(ISNULL(f_inv_exp,0)) AS f_inv_exp		
						,SUM(ISNULL(f_rest,0)) AS f_rest				
					FROM ".$temp_report_name."
					GROUP BY ".$ww_group_type4."
					UNION ALL
					/* =============== SUM TOTAL ACC_CONTROL LV4+5 ============== */
					SELECT
						5 AS i_type
						,'".$fixed_show_report."' AS i_show_group
						,NULL AS c_system_name
						,NULL AS c_ircev_code
						,NULL AS c_jv_code
						,NULL AS numrow
						,NULL AS row_acc_control  
						,NULL AS d_doc
						".$ww_fields_type5." 
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
						,SUM(ISNULL(f_inv,0)) AS f_inv	
						,SUM(ISNULL(f_vat,0)) AS f_vat
						,SUM(ISNULL(f_tax_personal,0)) AS f_tax_personal	
						,SUM(ISNULL(f_tax_corporate,0)) AS f_tax_corporate
						,SUM(ISNULL(f_social_security,0)) AS f_social_security
						,SUM(ISNULL(f_fine,0)) AS f_fine
						,NULL as c_imp_exp_code
						,NULL as c_jv_exp
						,NULL as imp_expense_vsn_dtl_id
						,NULL as d_doc_exp_approve
						,NULL as c_exp_approve
						,SUM(ISNULL(f_inv_exp,0)) AS f_inv_exp		
						,SUM(ISNULL(f_rest,0)) AS f_rest					
					FROM ".$temp_report_name."
					GROUP BY  ".$ww_group_type5."
					UNION ALL
					/* =============== SUM TOTAL ACC_CONTROL LV 4============== */
					SELECT
						6 AS i_type
						,'".$fixed_show_report."' AS i_show_group
						,NULL AS c_system_name
						,NULL AS c_ircev_code
						,NULL AS c_jv_code
						,NULL AS numrow
						,NULL AS row_acc_control  
						,NULL AS d_doc
						".$ww_fields_type6." 
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
						,SUM(ISNULL(f_inv,0)) AS f_inv	
						,SUM(ISNULL(f_vat,0)) AS f_vat
						,SUM(ISNULL(f_tax_personal,0)) AS f_tax_personal	
						,SUM(ISNULL(f_tax_corporate,0)) AS f_tax_corporate
						,SUM(ISNULL(f_social_security,0)) AS f_social_security
						,SUM(ISNULL(f_fine,0)) AS f_fine
						,NULL as c_imp_exp_code
						,NULL as c_jv_exp
						,NULL as imp_expense_vsn_dtl_id
						,NULL as d_doc_exp_approve
						,NULL as c_exp_approve	
						,SUM(ISNULL(f_inv_exp,0)) AS f_inv_exp		
						,SUM(ISNULL(f_rest,0)) AS f_rest		
					FROM ".$temp_report_name."
					GROUP BY ".$ww_group_type6." ) a
				ORDER BY ".$ww_order_main."					
				";
/*
ปกติ  เรียง+จัดกลุ่ม เหมือนรายงาน นำเข้าใบเบิก GL_REP00022
GROUP BY = GROUP BY d_doc,c_acc_code_lv4_dr,c_acc_name_lv4_dr,c_acc_code_lv5_dr,c_acc_name_lv5_dr 
ORDER BY  d_doc,i_type,c_acc_code_lv4_dr,row_acc_control,dc_expense_budget_type_name,c_request
 
*/		
	$arrParam  = array();
  //  	echo $sqlMain;exit;
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	
	$sum_f_inv = 0;
	$sum_f_vat = 0;
	$sum_f_tax_personal = 0;
	$sum_f_tax_corporate = 0;
	$sum_f_social_security = 0; 
	$sum_f_fine = 0; 
	
	if ($stmt) {
		
		$f_inv = $f_inv_exp = $f_rest =0;
		
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			$temp = array (
					"i_type" => $row ["i_type"],  
					"i_show_group" => $row ["i_show_group"], 
					"c_system_name" => $row ["c_system_name"],
					"c_ircev_code" => $row ["c_ircev_code"],
					"c_jv_code" => $row ["c_jv_code"],
					"no" => $row ["numrow"],
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
					"c_imp_exp_code" => $row ["c_imp_exp_code"],
					"c_jv_exp" => $row ["c_jv_exp"],
					"imp_expense_vsn_dtl_id" => $row ["imp_expense_vsn_dtl_id"],
					"d_doc_exp_approve" => ($row ["d_doc_exp_approve"] != "" && ($row ["i_type"] == 1 || $row ["i_type"] == 4)) ? $date->shot_date_from_db ( $row ["d_doc_exp_approve"] ) : "", 	
					"c_exp_approve" => $row ["c_exp_approve"],
					"f_inv_exp" => $row ["f_inv_exp"],
					"f_rest" => $row ["f_rest"]
			);
			
			if ($row ["i_type"] == 1) {
				$f_inv += $row ["f_inv"];
				$f_inv_exp += $row ["f_inv_exp"];
				$f_rest += $row ["f_rest"];
			}
			
			${$root} [] = $temp;
		}
		
		$temp = array (
				"i_type" => 7,
				"f_inv" => $f_inv,
				"f_inv_exp" => $f_inv_exp,
				"f_rest" => $f_rest 
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
