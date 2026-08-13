<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam()
{

	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount		= 0;
	$conCheque		= "";
	$conDCCheque	= "";
	$connBeginNone	= ""; 

	$arrParam[]	= "";
	$pandaBalance[]	= "";


	// เอาไว้เช็คจาก ui
	$chkGlRep00009			= ($_REQUEST["i_report1"] == 1) ? true : false;
	$chkBankAccountDetail	= ($_REQUEST["i_report2"] == 1) ? true : false;
	$chkGlBank				= ($_REQUEST["i_report3"] == 1) ? true : false;

	$sqlGlRep00009			= "";
	$SqlBankAccountDetail	= "";
	$sqlGlBank				= "";

	$for_id = explode(";", $_REQUEST["dc_bank_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
		}
		$conCheque .= ($in != "") ? " AND e.dc_bank_id IN (" . $in . ") " : "";
	}

	$for_id = explode(";", $_REQUEST["dc_bank_acc_company_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
		}
		$conCheque		.= ($in != "") ? " AND e.dc_bank_acc_company_id IN (" . $in . ") " : "";
		$conDCCheque	.= ($in != "") ? " AND d.dc_bank_acc_company_id IN (" . $in . ") " : "";
		$connBeginNone	.= ($in != "") ? " (" . $in . ") " : "";
	}

	// รายงาน บัญชีย่อยเงินฝากธนาคาร(บัญชี)
	if (@$chkGlRep00009 == true) {
		$sqlGlRep00009	.= "SELECT 1 AS i_report, * FROM (
								/*=============== E-PHYS ( กระแส ) ===============*/
								SELECT
									1 AS i_show
									,a.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN c.c_ref_doc
										ELSE a.c_code
									END AS c_cheque
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN 'สมุดรายวันทั่วไป'
										ELSE 'ยังไม่ออก GX'
									END AS c_name
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense' AS c_system
									,(CASE
										WHEN ISNULL(c.i_is_post,1) = 2 THEN '( '+c.c_code+' )' 
										WHEN ISNULL(c.i_is_post,1) = 3 THEN '( '+c.c_code_post+' )'
										ELSE NULL
									END) AS c_code
								FROM imp_expense_hdr a
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									LEFT JOIN gl_tran_hdr c ON a.imp_expense_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (4) /* 4 = ไม่เป็นสถานะยกเลิก */
										AND c.i_enable = " . STATUS_ENABLE . "
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I'
									AND a.d_doc_date BETWEEN @date_start and @date_end
									AND e.dc_bank_deposit_type_id = 2
								GROUP BY a.imp_expense_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, a.c_code, c.c_ref_doc, a.d_doc_date
									,ISNULL(c.i_is_post,1), c.c_code, c.c_code_post, c.i_cancel_doc_expense, c.d_save_date
								UNION ALL
								/*=============== VSN ( กระแส ) ===============*/
								SELECT
									1 AS i_show
									,a.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN c.c_ref_doc
										ELSE a.c_code
									END AS c_cheque
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN 'สมุดรายวันทั่วไป'
										ELSE 'ยังไม่ออก GX'
									END AS c_name
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense_vsn' AS c_system
									,(CASE
										WHEN ISNULL(c.i_is_post,1) = 2 THEN '( '+c.c_code+' )' 
										WHEN ISNULL(c.i_is_post,1) = 3 THEN '( '+c.c_code_post+' )'
										ELSE NULL
									END) AS c_code
								FROM imp_expense_vsn_hdr a
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									LEFT JOIN gl_tran_hdr c ON a.imp_expense_vsn_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_vsn_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (4) /*4 = ไม่เป็นสถานะยกเลิก */
										AND c.i_enable = " . STATUS_ENABLE . "
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I'
									AND a.d_doc_date BETWEEN @date_start and @date_end
									AND e.dc_bank_deposit_type_id = 2
								GROUP BY a.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, a.c_code, c.c_ref_doc, a.d_doc_date
									,ISNULL(c.i_is_post,1), c.c_code, c.c_code_post, c.i_cancel_doc_expense, c.d_save_date
								UNION ALL
								/*=============== E-PHYS ( กระแส ) CANCEL ===============*/
								SELECT
									3 AS i_show
									,a.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, c.d_save_date, 120) AS d_cheque_date
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN c.c_ref_doc
										ELSE a.c_code
									END AS c_cheque
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN 'สมุดรายวันทั่วไป'
										ELSE 'ยังไม่ออก GX'
									END AS c_name
									,-SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense' AS c_system
									,(CASE
										WHEN ISNULL(c.i_is_post,1) = 2 THEN '( '+c.c_code+' )' 
										WHEN ISNULL(c.i_is_post,1) = 3 THEN '( '+c.c_code_post+' )'
										ELSE NULL
									END) AS c_code
								FROM imp_expense_hdr a
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									INNER JOIN gl_tran_hdr c ON a.imp_expense_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (1) /*1 = ยกเลิก e-phys */
										AND c.i_enable = " . STATUS_ENABLE . "
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I'
									AND c.d_save_date BETWEEN @date_start and @date_end
									AND e.dc_bank_deposit_type_id = 2
								GROUP BY a.imp_expense_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, a.c_code, c.c_ref_doc, a.d_doc_date
									,ISNULL(c.i_is_post,1), c.c_code, c.c_code_post, c.i_cancel_doc_expense, c.d_save_date
								UNION ALL
								/*=============== VSN ( กระแส ) CANCEL ===============*/
								SELECT
									3 AS i_show
									,a.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, c.d_save_date, 120) AS d_cheque_date
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN c.c_ref_doc
										ELSE a.c_code
									END AS c_cheque
									,CASE
										WHEN ISNULL(c.i_is_post,1) != 1 THEN 'สมุดรายวันทั่วไป'
										ELSE 'ยังไม่ออก GX'
									END AS c_name
									,-SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense_vsn' AS c_system
									,(CASE
										WHEN ISNULL(c.i_is_post,1) = 2 THEN '( '+c.c_code+' )' 
										WHEN ISNULL(c.i_is_post,1) = 3 THEN '( '+c.c_code_post+' )'
										ELSE NULL
									END) AS c_code
								FROM imp_expense_vsn_hdr a
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									INNER JOIN gl_tran_hdr c ON a.imp_expense_vsn_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_vsn_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (2) /*2 = ยกเลิก VSN*/
										AND c.i_enable = " . STATUS_ENABLE . "
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I'
									AND c.d_save_date BETWEEN @date_start and @date_end
									AND e.dc_bank_deposit_type_id = 2
								GROUP BY a.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, a.c_code, c.c_ref_doc, a.d_doc_date
									,ISNULL(c.i_is_post,1), c.c_code, c.c_code_post, c.i_cancel_doc_expense, c.d_save_date
								UNION ALL
								/*==================== e-phys (กระแส) CHEQUE ====================*/
								SELECT
									1 AS i_show
									,b.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque_date
									,d.c_cheque
									,'สมุดรายวันเงินจ่าย' AS c_name
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense' AS c_system
									,NULL AS c_code
								FROM imp_expense_hdr a
									INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
									INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
										{$conDCCheque}
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I'
									AND c.d_cheque BETWEEN @date_start and @date_end
									AND e.dc_bank_deposit_type_id IN (2)/*1=ออมทรัพย์,2=กระแส */
									AND d.i_delete = 2
								GROUP BY b.imp_expense_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, c.d_cheque
								UNION ALL
								/*==================== VSN (กระแส) CHEQUE ====================*/
								SELECT
									1 AS i_show
									,b.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, c.d_cheque, 120) AS d_cheque_date
									,d.c_cheque
									,'สมุดรายวันเงินจ่าย' AS c_name
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense_vsn' AS c_system
									,NULL AS c_code
								FROM imp_expense_vsn_hdr a
									INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
									INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
										{$conDCCheque}
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I'
									AND c.d_cheque BETWEEN @date_start and @date_end
									AND e.dc_bank_deposit_type_id IN (2)/*1=ออมทรัพย์,2=กระแส */
									AND d.i_delete = 2
								GROUP BY b.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, c.d_cheque
								UNION ALL
								/*==================== e-phys (กระแส) CHEQUE (cancel) ====================*/
								SELECT
									3 AS i_show
									,b.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, r.d_save_jv_cancel, 120) AS d_cheque_date
									,d.c_cheque
									,'สมุดรายวันเงินจ่าย' AS c_name
									,0.00 AS f_dr
									,-SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense' AS c_system
									,NULL AS c_code
								FROM imp_expense_hdr a
									INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
									INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									INNER JOIN imp_cancel_doc_expense r on c.imp_expense_dtl_id = r.imp_expense_dtl_id
										AND r.d_save_jv_cancel BETWEEN @date_start and @date_end
										AND c.imp_expense_dtl_cheque_id = r.imp_expense_dtl_cheque_id
										AND r.i_type_doc = 1 /*สถานะยกเลิกรายการ (1=ฎีกา e-phis,2=ฎีกา vision Net,3=ยกเลิก BTN)*/
										AND r.i_enable = " . STATUS_ENABLE . "
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
										{$conDCCheque}
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I' 
									AND e.dc_bank_deposit_type_id IN (2)/*1=ออมทรัพย์,2=กระแส */
								GROUP BY b.imp_expense_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, r.d_save_jv_cancel
								UNION ALL
								/*==================== VSN (กระแส) CHEQUE (cancel) ====================*/
								SELECT
									3 AS i_show
									,b.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, r.d_save_jv_cancel, 120) AS d_cheque_date
									,d.c_cheque
									,'สมุดรายวันเงินจ่าย' AS c_name
									,0.00 AS f_dr
									,-SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense_vsn' AS c_system
									,NULL AS c_code
								FROM imp_expense_vsn_hdr a
									INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
									INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
									INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
										{$conCheque}
									INNER JOIN imp_cancel_doc_expense r on c.imp_expense_vsn_dtl_id = r.imp_expense_vsn_dtl_id
										AND r.d_save_jv_cancel BETWEEN @date_start and @date_end
										AND c.imp_expense_vsn_dtl_cheque_id = r.imp_expense_vsn_dtl_cheque_id
										AND r.i_type_doc = 2 /*สถานะยกเลิกรายการ (1=ฎีกา e-phis,2=ฎีกา vision Net,3=ยกเลิก BTN)*/
										AND r.i_enable = " . STATUS_ENABLE . "
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
										{$conDCCheque}
								WHERE a.i_enable = " . STATUS_ENABLE . " AND LEFT(a.c_code,1)='I' 
									AND e.dc_bank_deposit_type_id IN (2)/*1=ออมทรัพย์,2=กระแส */
									AND d.i_delete = 2
								GROUP BY b.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, r.d_save_jv_cancel
							) a";
	}

	// รายงาน บัญชีย่อยเงินฝากธนาคาร(รายได้)
	if (@$chkBankAccountDetail == true) {
		$SqlBankAccountDetail	.= ($sqlGlRep00009 != "") ? " UNION ALL " : "";
		$SqlBankAccountDetail	.= "SELECT 2 AS i_report, * FROM (
										SELECT
											1 AS i_show
											,a.imp_bank_account_detail_hdr_id AS pk_id
											,e.dc_bank_acc_company_id
											,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date
											,a.c_doc AS c_cheque
											,CASE a.i_book_type
												WHEN 1 THEN 'สมุดรายวันรับ'
												WHEN 2 THEN 'สมุดรายวันทั่วไป'
												WHEN 3 THEN 'สมุดรายวันจ่าย'
												ELSE ''
											END AS c_name
											,b.f_dr AS f_dr
											,b.f_cr AS f_cr
											,'imp_bank_account_detail_hdr' AS c_system
											,NULL AS c_code
										FROM imp_bank_account_detail_hdr a
											INNER JOIN imp_bank_account_detail_dtl b ON a.imp_bank_account_detail_hdr_id = b.imp_bank_account_detail_hdr_id
											INNER JOIN dc_bank_acc_company e ON a.dc_bank_acc_company_id = e.dc_bank_acc_company_id
												{$conCheque}
										WHERE a.i_enable = " . STATUS_ENABLE . "
											AND a.d_doc_date BETWEEN @date_start and @date_end
									) b";
	}

	// รายงาน บัญชีเงินฝากธนาคาร(ไม่มีรายละเอียดค่าใช้จ่าย)
	if (@$chkGlBank == true) {
		$sqlGlBank	.= ($sqlGlRep00009 != "" || $SqlBankAccountDetail != "") ? " UNION ALL " : "";
		// ไม่ใช้เพราะไม่ต้องเอารายการ f_cr ของออมทรัพย์มาแสดง
		// 		/*=============== BTN ( ออมทรัพย์ ) && CANCEL ===============*/
		// 		SELECT
		// 		CASE
		// 		WHEN ISNULL(c.i_cancel_doc_expense,4) = 4 THEN 1
		// 		ELSE 3
		// 		END AS i_show
		// 		,a.gl_bank_id AS pk_id
		// 		,e.dc_bank_acc_company_id
		// 		,CASE
		// 		WHEN ISNULL(c.i_cancel_doc_expense,4) = 4 THEN CONVERT(VARCHAR, a.d_doc_date, 120)
		// 		ELSE CONVERT(VARCHAR, c.d_save_date, 120)
		// 		END AS d_cheque_date
		// 		,CASE
		// 		WHEN ISNULL(c.i_is_post,1) != 1 THEN c.c_ref_doc
		// 		ELSE a.c_code
		// 		END AS c_cheque
		// 		,CASE
		// 		WHEN ISNULL(c.i_is_post,1) != 1 THEN 'สมุดรายวันทั่วไป'
		// 				ELSE 'ยังไม่ออก GX'
		// 						END AS c_name
		// 						,0 AS f_dr
		// 						,CASE
		// 						WHEN ISNULL(c.i_cancel_doc_expense,4) = 4 THEN SUM(ISNULL(c.f_total_amt,0))
		// 						ELSE -SUM(ISNULL(c.f_total_amt,0))
		// 						END AS f_cr
		// 						,'gl_bank' AS c_system
		// 						,(CASE
		// 								WHEN ISNULL(c.i_is_post,1) = 2 THEN '( '+a.c_code+' , '+c.c_code+' )'
		// 								WHEN ISNULL(c.i_is_post,1) = 3 THEN '( '+a.c_code+' , '+c.c_code_post+' )'
		// 								ELSE NULL
		// 								END) AS c_code
		// 								FROM gl_bank a
		// 								INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_target
		// 								{$conCheque}
		// 								LEFT JOIN gl_tran_hdr c ON a.gl_bank_id = c.table_pk_id
		// 								AND c.table_name = 'gl_bank'
		// 										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
		// 										AND c.i_cancel_doc_expense IN (3,4) /*3 = ยกเลิก BTN, 4 = ไม่เป็นสถานะยกเลิก */
		// 										AND c.i_enable = ".STATUS_ENABLE."
		// 												WHERE a.i_enable = ".STATUS_ENABLE." AND a.c_code IS NOT NULL
		// 												AND a.d_doc_date BETWEEN @date_start and @date_end
		// 												AND e.dc_bank_deposit_type_id IN (1) /*1=ออมทรัพย์,2=กระแส */
		// 												GROUP BY a.gl_bank_id,e.dc_bank_acc_company_id, e.c_code, e.c_name, a.c_code, c.c_ref_doc,a.d_doc_date
		// 												,ISNULL(c.i_is_post,1), c.c_code, c.c_code_post, c.i_cancel_doc_expense, c.d_save_date
		// 												UNION ALL
		$sqlGlBank	.= "SELECT 3 AS i_report, * FROM (
							/*=============== BTN ( ใบปะหน้า-กระแสรายวัน) ===============*/
							SELECT 
								1 AS i_show
								,a.gl_bank_id AS pk_id
								,e.dc_bank_acc_company_id
								,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date
								,CASE
									WHEN ISNULL(c.i_is_post,1) != 1 THEN c.c_ref_doc
									ELSE a.c_code
								END AS c_cheque
								,CASE
									WHEN ISNULL(c.i_is_post,1) != 1 THEN 'สมุดรายวันทั่วไป'
									ELSE 'ยังไม่ออก GX'
								END AS c_name
								,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
								,0 AS f_cr
								,'gl_bank' AS c_system
								,(CASE
									WHEN ISNULL(c.i_is_post,1) = 2 THEN '( '+a.c_code+' , '+c.c_code+' )' 
									WHEN ISNULL(c.i_is_post,1) = 3 THEN '( '+a.c_code+' , '+c.c_code_post+' )'
									ELSE NULL
								END) AS c_code
							FROM gl_bank a
								INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									{$conCheque}
								LEFT JOIN gl_tran_hdr c ON a.gl_bank_id = c.table_pk_id
									AND c.table_name = 'gl_bank'
									AND c.gl_tran_hdr_id = a.gl_tran_hdr_id_bank_id /* JV ใบปะหน้า */
									AND c.i_cancel_doc_expense IN (4) /*4 = ไม่เป็นสถานะยกเลิก */
									AND c.i_enable = " . STATUS_ENABLE . "
							WHERE a.i_enable = " . STATUS_ENABLE . " AND a.c_code IS NOT NULL
								AND a.d_doc_date BETWEEN @date_start and @date_end
								AND e.dc_bank_deposit_type_id IN (2) /*1=ออมทรัพย์,2=กระแส */
							GROUP BY a.gl_bank_id,e.dc_bank_acc_company_id, e.c_code, e.c_name, a.c_code, c.c_ref_doc,a.d_doc_date
								,ISNULL(c.i_is_post,1), c.c_code, c.c_code_post, c.i_cancel_doc_expense, c.d_save_date
							UNION ALL
							
							 
							/*=============== BTN ( กระแส ) CANCEL ===============*/
							SELECT
								3 AS i_show
								,a.gl_bank_id AS pk_id
								,e.dc_bank_acc_company_id
								,CONVERT(VARCHAR, c.d_save_date, 120) AS d_cheque_date
								,CASE
									WHEN ISNULL(c.i_is_post,1) != 1 THEN c.c_ref_doc
									ELSE a.c_code
								END AS c_cheque
								,CASE
									WHEN ISNULL(c.i_is_post,1) != 1 THEN 'สมุดรายวันทั่วไป'
									ELSE 'ยังไม่ออก GX'
								END AS c_name
								,-SUM(ISNULL(c.f_total_amt,0)) AS f_dr
								,0 AS f_cr
								,'gl_bank' AS c_system
								,(CASE
									WHEN ISNULL(c.i_is_post,1) = 2 THEN '( '+a.c_code+' , '+c.c_code+' )' 
									WHEN ISNULL(c.i_is_post,1) = 3 THEN '( '+a.c_code+' , '+c.c_code_post+' )'
									ELSE NULL
								END) AS c_code
							FROM gl_bank a
								INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									{$conCheque}
								INNER JOIN gl_tran_hdr c ON a.gl_bank_id = c.table_pk_id
									AND c.table_name = 'gl_bank'
									AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
									AND c.i_cancel_doc_expense IN (3) /*3 = ยกเลิก BTN */
									AND c.i_enable = " . STATUS_ENABLE . "
							WHERE a.i_enable = " . STATUS_ENABLE . " AND a.c_code IS NOT NULL
								AND c.d_save_date BETWEEN @date_start and @date_end
								AND e.dc_bank_deposit_type_id IN (2) /*1=ออมทรัพย์,2=กระแส */
							GROUP BY a.gl_bank_id,e.dc_bank_acc_company_id, e.c_code, e.c_name, a.c_code, c.c_ref_doc,a.d_doc_date
								,ISNULL(c.i_is_post,1), c.c_code, c.c_code_post, c.i_cancel_doc_expense, c.d_save_date
							UNION ALL
							/*==================== BTN (กระแส) CHEQUE ====================*/
							SELECT
								1 AS i_show
								,a.gl_bank_id AS pk_id
								,e.dc_bank_acc_company_id
								,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date
								,d.c_cheque
								,'สมุดรายวันเงินจ่าย' AS c_name
								,0.00 AS f_dr
								,SUM(ISNULL(c.f_cheque,0)) AS f_cr
								,'gl_bank' AS c_system
								,NULL AS c_code
							FROM gl_bank a
								INNER JOIN gl_bank_cheque c ON a.gl_bank_id = c.gl_bank_id
								INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									{$conCheque}
								LEFT JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
									{$conDCCheque}
							WHERE a.i_enable = " . STATUS_ENABLE . " AND a.c_code IS NOT NULL
								AND a.d_doc_date BETWEEN @date_start and @date_end
								AND e.dc_bank_deposit_type_id IN (2)/*1=ออมทรัพย์,2=กระแส */
							GROUP BY a.gl_bank_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, a.d_doc_date
							UNION ALL
							/*==================== BTN (กระแส) CHEQUE (cancel) ====================*/
							SELECT
								3 AS i_show
								,a.gl_bank_id AS pk_id
								,e.dc_bank_acc_company_id
								,CONVERT(VARCHAR, r.d_save_jv_cancel, 120) AS d_cheque_date
								,d.c_cheque
								,'สมุดรายวันเงินจ่าย' AS c_name
								,0.00 AS f_dr
								,-SUM(ISNULL(c.f_cheque,0)) AS f_cr
								,'gl_bank' AS c_system
								,NULL AS c_code
							FROM gl_bank a
								INNER JOIN gl_bank_cheque c ON a.gl_bank_id = c.gl_bank_id
								INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									{$conCheque}
								INNER JOIN imp_cancel_doc_expense r on c.gl_bank_cheque_id = r.gl_bank_cheque_id
									AND r.d_save_jv_cancel BETWEEN @date_start and @date_end
									AND r.i_type_doc = 3 /*สถานะยกเลิกรายการ (1=ฎีกา e-phis,2=ฎีกา vision Net,3=ยกเลิก BTN)*/
									AND r.i_enable = " . STATUS_ENABLE . "
								LEFT JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
									{$conDCCheque}
							WHERE a.i_enable = " . STATUS_ENABLE . " AND a.c_code IS NOT NULL 
								AND e.dc_bank_deposit_type_id IN (2)/*1=ออมทรัพย์,2=กระแส */
							GROUP BY a.gl_bank_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, r.d_save_jv_cancel
						) c";
	}

	//=============================================================//
	$sqlMain	= "	SET NOCOUNT ON
	
					DECLARE @date_start	VARCHAR(250) = '{$_REQUEST["date_start"]}';
					DECLARE @date_end	VARCHAR(250) = '{$_REQUEST["date_end"]}';
	
					/*i_report(1=รายงาน บัญชีย่อยเงินฝากธนาคาร(บัญชี))*/
					/*i_report(2=รายงาน บัญชีย่อยเงินฝากธนาคาร(รายได้)*/
					/*i_report(3=รายงาน บัญชีเงินฝากธนาคาร(ไม่มีรายละเอียดค่าใช้จ่าย)*/
					
					SELECT *
					/*, 1 AS i_type*/
					INTO #tb_cheque
					FROM (
						/* รายงาน บัญชีย่อยเงินฝากธนาคาร(บัญชี) */
						{$sqlGlRep00009}
						
						/* รายงาน บัญชีย่อยเงินฝากธนาคาร(รายได้) */
						{$SqlBankAccountDetail}
					
						/* รายงาน บัญชีเงินฝากธนาคาร(ไม่มีรายละเอียดค่าใช้จ่าย) */
						{$sqlGlBank}
					) a
					
					SELECT
						ROW_NUMBER() OVER (PARTITION BY a.dc_bank_acc_company_id,a.c_yyyy,a.c_mm,a.c_dd,a.c_cheque ORDER BY a.c_yyyy,a.c_mm,a.c_dd) AS row_id
						,ROW_NUMBER() OVER (PARTITION BY a.dc_bank_acc_company_id,a.c_yyyy,a.c_mm,a.c_dd,a.pk_id ORDER BY a.c_yyyy,a.c_mm,a.c_dd,ABS(a.f_dr) DESC) AS row_cheque
						,e.c_code AS company_code
						,e.c_name AS company_name
						,a.*
					INTO #cheque
					FROM (
						SELECT
							RIGHT('0'+CAST(DAY(a.d_cheque_date) AS varchar(2)) ,2) AS c_dd
							,RIGHT('0'+CAST(MONTH(a.d_cheque_date) AS varchar(2)) ,2) AS c_mm
							,YEAR(a.d_cheque_date)+543 c_yyyy
							,*
						FROM #tb_cheque a
					) a INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id;
					
					SELECT
						e.dc_bank_acc_company_id AS source_id
						,b.row_id
						,b.row_cheque
						,e.c_code AS company_code
						,e.c_name +' ('+c.c_name+')' AS company_name
						,b.c_dd
						,b.c_mm
						,b.c_yyyy
						,b.c_system
						,b.c_code
						,b.i_report
						,b.i_show
						,b.pk_id
						,b.dc_bank_acc_company_id
						,b.d_cheque_date
						,b.c_cheque
						,b.c_name
						,b.f_dr
						,b.f_cr
					FROM dc_bank_acc_company e
						LEFT JOIN #cheque b ON e.dc_bank_acc_company_id = b.dc_bank_acc_company_id
						LEFT JOIN dc_bank_deposit_type c ON e.dc_bank_deposit_type_id = c.dc_bank_deposit_type_id
					where e.i_enable = 1 AND e.i_delete = 2
						{$conCheque}
					ORDER BY CASE WHEN b.f_cr IS NULL AND b.f_dr IS NULL THEN 1 ELSE 0 END, b.dc_bank_acc_company_id, b.c_yyyy, b.c_mm, b.c_dd, b.pk_id, b.row_cheque;";

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {

		$comArr	= array();
		$ArrDtl	= array();

		// ยอดยกมา
		$date_start		= date("Y-m-d", strtotime("{$_REQUEST["date_start"]} -1 month"));
		list($yyyy, $mm, $dd) = explode("-", $date_start);
		// 		list($yyyy2,$mm2,$dd2)	= explode("-", $_REQUEST["date_end"]);

		while ($row = $db->Fetch($stmt)) {

			$c_yyyy	= $yyyy + 543;

			if (@!array_key_exists($c_yyyy, $comArr[$row["source_id"]])) {

				$comArr[$row["source_id"]][$c_yyyy]	= $row["c_yyyy"];

				// คงเหลือ
				$dddd = date("Y-m-d", strtotime("{$_REQUEST["date_start"]} -1 month"));
				list($d_yyyy, $d_mm, $d_dd) = explode("-", $dddd);

				$f_end_dr = 0;
				$f_end_cr = 0;

				$sqll	= "	SELECT
								SUM(ISNULL(a.f_end_dr,0)-ISNULL(a.f_end_cr,0)) AS f_end_dr
								,SUM(ISNULL(a.f_end_cr,0)-ISNULL(a.f_end_dr,0)) AS f_end_cr
							FROM gl_balance_cost a
								INNER JOIN (
									SELECT
										bb.dc_acc_id
										,bb.dc_bank_acc_company_id
									FROM dc_bank aa
										INNER JOIN dc_bank_acc_company bb ON aa.dc_bank_id = bb.dc_bank_id
									WHERE 1=1
								) b ON a.dc_acc_id = b.dc_acc_id
							WHERE a.c_mm={$d_mm} AND a.c_yyyy={$d_yyyy}
								AND b.dc_bank_acc_company_id = {$row["source_id"]}
								AND a.i_is_post = 3
								AND a.i_is_close_year = 2;";

				$data_f_end	= $db->GetDataBySQL($sqll, array());

				if ($data_f_end["f_end_dr"] >= 0) {
					$f_end_dr	= $data_f_end["f_end_dr"];
					$f_end_cr	= 0;
				} else if ($data_f_end["f_end_dr"] < 0) {
					$f_end_dr	= 0;
					$f_end_cr	= $data_f_end["f_end_cr"];
				}

				$ArrDtl[$row["source_id"]]["data"][$c_yyyy]["c_yyyy"]		= $c_yyyy;
				$ArrDtl[$row["source_id"]]["data"][$c_yyyy]["f_end_dr"]		= $f_end_dr;
				$ArrDtl[$row["source_id"]]["data"][$c_yyyy]["f_end_cr"]		= $f_end_cr;

				$pandaBalance[$row["source_id"]]["f_balance_dr"] = $f_end_dr;
				$pandaBalance[$row["source_id"]]["f_balance_cr"] = $f_end_cr;
			 			

				// ยอดยกมา
				$s_dd_start = date("Y-m-d", strtotime("{$_REQUEST["date_start"]}"));
				list($d_yyyy_start, $d_mm_start, $d_dd_start) = explode("-", $s_dd_start);

				$s_dd_end = date("Y-m-d", strtotime("{$_REQUEST["date_end"]}"));
				list($d_yyyy_end, $d_mm_end, $d_dd_end) = explode("-", $s_dd_end);

				if ($d_mm_start == 10) {
					$yyyy_mm_start		= null;
					$yyyy_mm_end		= null;
					$c_name				= ($d_mm_start != $d_mm_end) ? $date->s_month_thai[$d_mm_start] . " " . ($d_yyyy_start + 543) . " - " . $date->s_month_thai[$d_mm_end] . " " . ($d_yyyy_end + 543) : $date->s_month_thai[$d_mm_start] . " " . ($d_yyyy_start + 543);
				} else if ($d_mm_start != $d_mm_end) {
					if ($d_mm_start < 10) {
						$yyy = date("Y", strtotime("{$_REQUEST["date_start"]} -1 year"));
						$yyyy_mm_start	= date("Y10", strtotime("{$_REQUEST["date_start"]} -1 year"));
						$yyyy_mm_end	= date("Ym", strtotime("{$_REQUEST["date_start"]} -1 month"));
						$c_name			= $date->s_month_thai[10] . " " . ($yyy + 543) . " - " . $date->s_month_thai[$d_mm_end] . " " . ($d_yyyy_end + 543);
					} else if ($d_mm_start > 10) {
						$yyyy_mm_start	= date("Y10", strtotime("{$_REQUEST["date_start"]}"));
						$yyyy_mm_end	= date("Ym", strtotime("{$_REQUEST["date_start"]} -1 month"));
						$c_name			= $date->s_month_thai[10] . " " . ($d_yyyy_start + 543) . " - " . $date->s_month_thai[$d_mm_end] . " " . ($d_yyyy_end + 543);
					}
				} else if ($d_mm_start < 10) {

					// ทีแรกพิจารณาดูก็นึกว่าบั๊ก แต่ถ้าพิจารณาดูให้ดีๆพบว่า เดือนถัดไปของ 2018-10-31 จะเป็น 2018-11-31 แต่เนื่องจากเดือน 11 (พฤศจิกายน) มีเพียง 30 วัน ซึ่งไม่มีในปฏิทิน มันเลยถูกทดเป็น 2018-12-01 แทน
					$date_end   = strtotime(date('Y-m', strtotime($_REQUEST["date_end"])));

					$yyyy_mm_start		= date("Y10", strtotime("{$_REQUEST["date_start"]} -1 year"));
					// 					$yyyy_mm_end		= date( "Ym", strtotime( "{$_REQUEST["date_end"]} -1 month" ) );
					$yyyy_mm_end		= date("Ym", strtotime("-1 month", $date_end));
					$c_name				= $date->s_month_thai[10] . " " . (($d_yyyy_start + 543) - 1) . " - " . $date->s_month_thai[$d_mm_end] . " " . ($d_yyyy_end + 543);
				} else if ($d_mm_start > 10) {

					$date_end   = strtotime(date('Y-m', strtotime($_REQUEST["date_end"])));

					$yyyy_mm_start		= date("Y10", strtotime("{$_REQUEST["date_start"]}"));
					// 					$yyyy_mm_end		= date( "Ym", strtotime( "{$_REQUEST["date_end"]} -1 month" ) );
					$yyyy_mm_end		= date("Ym", strtotime("-1 month", $date_end));
					$c_name				= $date->s_month_thai[10] . " " . ($d_yyyy_start + 543) . " - " . $date->s_month_thai[$d_mm_end] . " " . ($d_yyyy_end + 543);
				}

				$sqll2	= "	SET NOCOUNT ON
							SELECT
								SUM(ISNULL(f_dr,0)) AS f_dr
								,SUM(ISNULL(f_cr,0)) AS f_cr
							FROM gl_balance_cost a
							WHERE a.i_is_post = 3
								AND a.i_is_close_year = 2
								AND a.c_yyyy_mm BETWEEN '{$yyyy_mm_start}' AND '{$yyyy_mm_end}'
								AND dc_acc_id = (SELECT dc_acc_id FROM dc_bank_acc_company WHERE dc_bank_acc_company_id = {$row["source_id"]})";

				$f_balance	= $db->GetDataBySQL($sqll2, array());

				$ArrDtl[$row["source_id"]]["company_code"]	= $row["company_code"];
				$ArrDtl[$row["source_id"]]["company_name"]	= $row["company_name"];
				$ArrDtl[$row["source_id"]]["c_name"]		= $c_name;
				$ArrDtl[$row["source_id"]]["f_dr"]			= ($f_balance["f_dr"] > 0) ? $f_balance["f_dr"] : 0;
				$ArrDtl[$row["source_id"]]["f_cr"]			= ($f_balance["f_cr"] > 0) ? $f_balance["f_cr"] : 0;

				
			}
 
			  

			if ($row["row_id"] > 0) {
				 

				$ArrDtl[$row["source_id"]]["data"][$c_yyyy]["data"][$row["c_mm"]]["c_mm"]	= $date->s_month_thai[$row["c_mm"]];
				$ArrDtl[$row["source_id"]]["data"][$c_yyyy]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["c_system"]]["data"][$row["pk_id"]]["data"][$row["row_cheque"]] = array(
					"i_show"					=> $row["i_show"] // 1 ปกติ, 2 ออมทรัพย์ , 3 กระแส
					, "c_cheque"					=> $row["c_cheque"], "c_system"					=> $row["c_system"] . ' ' . $row["c_code"], "c_name"					=> $row["c_name"], "f_dr"						=> $row["f_dr"], "f_cr"						=> $row["f_cr"]
				);
			}
			else
			{ //ไม่มียอดระหว่างงวด ให้แสดงยอดยกมาเลย 0 หรือ อื่นๆ[มียอดจากประมวลผล]
				  
					 
				$c_yyyy_thai 	= $d_yyyy+543;
				$c_mm_thai_show	= $d_mm+1;

				$ArrDtl[$row["source_id"]]["data"][$c_yyyy_thai]["data"][$c_mm_thai_show]["c_mm"]	= $date->s_month_thai[$c_mm_thai_show];					
				$ArrDtl[$row["source_id"]]["data"][$c_yyyy_thai]["data"][$c_mm_thai_show]["data"]["1"]["data"]["gl_balance_cost"]["data"]["1"]["data"][$row["row_cheque"]] = 
				array(
					"i_show"					=> 1  
					, "c_cheque"				=> "ยอดยกมา"
					, "c_system"				=> "gl_balance_cost"
					, "c_name"					=> "&nbsp;"
					, "f_dr"					=> 0
					, "f_cr"					=> 0
					);
					 
			}
		};
	}
 


	// if (count($ArrDtl)<1) 
	// {//ระหว่างเดือนไม่มีรายการเคลื่อนไหว แต่ อาจจะมี ยอดยกไปจากเดือนที่แล้ว ให้แสดงยอดยกมาของเดือนที่ เริ่มต้น เลือกดูรายงาน
 
	// 	$sqll_begin	= "	SET NOCOUNT ON
	// 				SELECT
	// 					a.c_code
	// 					,a.c_name 
	// 					,month('{$_REQUEST["date_start"]}') as c_mm
	// 					,year('{$_REQUEST["date_start"]}')+543 as c_yyyy
	// 					,RIGHT(year('{$_REQUEST["date_start"]}')+543,2) as c_yy
	// 					,dateadd(month,-1,'{$_REQUEST["date_start"]}') as prev_month
	// 					,a.dc_acc_id
	// 					,a.dc_bank_acc_company_id
	// 					,(SELECT SUM(ISNULL(b.f_end_dr,0)-ISNULL(b.f_end_cr,0)) FROM gl_balance_cost b  WHERE b.dc_acc_id=a.dc_acc_id and b.c_mm=month(dateadd(month,-1,'{$_REQUEST["date_start"]}')) AND b.c_yyyy=year(dateadd(month,-1,'{$_REQUEST["date_start"]}'))  AND b.i_is_post = 3   AND b.i_is_close_year = 2 ) AS f_end_dr
	// 					,(SELECT SUM(ISNULL(b.f_end_cr,0)-ISNULL(b.f_end_dr,0))FROM gl_balance_cost b  WHERE b.dc_acc_id=a.dc_acc_id and b.c_mm=month(dateadd(month,-1,'{$_REQUEST["date_start"]}')) AND b.c_yyyy=year(dateadd(month,-1,'{$_REQUEST["date_start"]}'))  AND b.i_is_post = 3   AND b.i_is_close_year = 2 ) AS f_end_cr
	// 					,(SELECT cc.c_name FROM dc_cost cc WHERE cc.dc_cost_id='{$_REQUEST["dc_cost_id"]}') as cost_name
	// 				FROM dc_bank_acc_company a
	// 				WHERE a.dc_bank_acc_company_id IN $connBeginNone
	// 				ORDER BY a.c_code
	// 				";
  
	// 	$data_book_begin	= $db->GetDataBySQL($sqll_begin, array());	
		 
	// 	$stmt2 = $db->QueryParam($sqll_begin, array());
	// 	if ($stmt2) {
	 
	// 		$ArrDtl	= array();
	// 		$fixed_date = "1"; 

	// 		while ($data_book_begin = $db->Fetch($stmt2)) {

	// 			if ($data_book_begin["f_end_dr"] >= 0) {
	// 				$f_end_dr	= $data_book_begin["f_end_dr"];
	// 				$f_end_cr	= 0;
	// 			} else if ($data_book_begin["f_end_dr"] < 0) {
	// 				$f_end_dr	= 0;
	// 				$f_end_cr	= $data_book_begin["f_end_cr"];
	// 			}


	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["company_code"]									= $data_book_begin["c_code"];
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["company_name"]									= $data_book_begin["c_name"];
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["c_name"]										= $date->s_month_thai[$data_book_begin["c_mm"]]."-".$data_book_begin["c_yy"];
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["f_dr"]											= 0;
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["f_cr"]											= 0;
				
				
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["c_yyyy"]											= $data_book_begin["c_yyyy"];
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["f_end_dr"]											= $f_end_dr;
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["f_end_cr"]											= $f_end_cr;	
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["c_mm"]			= $date->s_month_thai[$data_book_begin["c_mm"]];

				
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["data"][$fixed_date]["data"]["f_begin_only"]["data"]["0"]["data"]["1"]["i_show"]					= "1";
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["data"][$fixed_date]["data"]["f_begin_only"]["data"]["0"]["data"]["1"]["dc_cost_name"]			= $data_book_begin["cost_name"];
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["data"][$fixed_date]["data"]["f_begin_only"]["data"]["0"]["data"]["1"]["c_cheque"]				= "ยอดยกมา";
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["data"][$fixed_date]["data"]["f_begin_only"]["data"]["0"]["data"]["1"]["c_system"]				= "gl_balance_cost";
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["data"][$fixed_date]["data"]["f_begin_only"]["data"]["0"]["data"]["1"]["c_name"]					= "&nbsp;";
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["data"][$fixed_date]["data"]["f_begin_only"]["data"]["0"]["data"]["1"]["f_dr"]					= 0;
	// 			$ArrDtl[$data_book_begin["dc_bank_acc_company_id"]]["data"][$data_book_begin["c_yyyy"]]["data"][$data_book_begin["c_mm"]]["data"][$fixed_date]["data"]["f_begin_only"]["data"]["0"]["data"]["1"]["f_cr"]					= 0;

	// 		}
	// 	} 
	// }

	//print_r($ArrDtl);exit;
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => $ArrDtl));
}
