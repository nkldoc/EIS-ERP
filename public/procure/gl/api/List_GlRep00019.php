<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{

	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;

	$ww_bank = "";
	$for_id = explode(";", $_REQUEST["dc_bank_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con 		.= ($in != "") ? " AND a.dc_bank_id IN (" . $in . ")" : "";
			$ww_bank 	.= ($in != "") ? " AND e.dc_bank_id IN (" . $in . ")" : "";
		}
	}

	$ww_book_bank = "";
	$for_id = explode(";", $_REQUEST["dc_bank_acc_company_id"]);
	if (!in_array("0", $for_id)) {
		$in = "";
		if (is_array($for_id)) {
			foreach ($for_id as $val) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con 			.= ($in != "") ? " AND b.dc_bank_acc_company_id IN (" . $in . ")" : "";
			$ww_book_bank 	.= ($in != "") ? " AND e.dc_bank_acc_company_id IN (" . $in . ")" : "";
		}
	}

	$conDate = $conBookGL = $conDateDoc = $conDateSave = $conDatePay = $conDateCheque = $conDateJV = "";
	if ($_REQUEST["date_start"] != "" && $_REQUEST["date_end"] != "") {
		$conDate		.= " aa.d_save_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";

		$conDateDoc 	.= " AND a.d_doc_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
		$conDateSave 	.= " AND c.d_save_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
		$conDatePay 	.= " AND b.d_pay between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
		$conDateCheque 	.= " AND b.d_cheque between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
		$conDateJV 		.= " AND r.d_save_jv_cancel between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
	}


	/*
	  
gl_dc_book_type_id	I_BOOK_TYPE
	1		รายวันรับ		1
	2		รายวันจ่าย		3		  
	3		รายวันทั่วไป		2	 
	
	*/

	$UI_gl_book_type_id = $_REQUEST["gl_book_type_id"];
	$cast_i_book 		= "";
	switch ($_REQUEST["gl_book_type_id"]) {
		case "1":
			$cast_i_book = 1;
			break;
		case "2":
			$cast_i_book = 3;
			break;
		case "3":
			$cast_i_book = 2;
			break;
		case "4":
		default:
			$cast_i_book = "";
			break;
	}

	$conBookGL = "";
	$conBookExpense = $conBook_EPHYS_VNET_BTN_ChequeFixed = $conBookIncomeFixed = "";
	if ($_REQUEST["gl_book_type_id"] != 4) {
		$conBookGL 								.= " AND aa.gl_dc_book_type_id = " . $UI_gl_book_type_id;

		$conBookExpense 						.= " AND c.gl_dc_book_type_id = " . $UI_gl_book_type_id;

		$conBook_EPHYS_VNET_BTN_ChequeFixed 	.= " AND 2 = " . $UI_gl_book_type_id;

		$conBookIncomeFixed 					.= " AND a.i_book_type = " . $cast_i_book;
	}

	$ww_fixed_depo = " AND e.i_type_depo = 2";

	/* QUERY เงินจาก รายงาน รายละเอียดบัญชีธนาคาร(ทั้งหมด)*/
	$c_money_ImpeImpv_BankAccountDetails_Btn = "
						SELECT * 
						INTO #temp_money_period
						FROM 
						(
								SELECT
									1 AS i_show
									,a.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date 
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense' AS c_system
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,c.gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_hdr a
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source	  
									INNER JOIN gl_tran_hdr c ON a.imp_expense_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (4) /* 4 = ไม่เป็นสถานะยกเลิก */
										AND c.i_enable = 1
										" . $conDateDoc . "
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I' 
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND c.i_is_post>1 AND LEFT(c.c_code,1)='G'  and c.i_enable=1 and c.i_is_close_year=2
									" . $conDateDoc . " " . $conBookExpense . "
								GROUP BY a.imp_expense_hdr_id, e.dc_bank_acc_company_id,a.d_doc_date,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,c.gl_dc_book_type_id,e.i_type_depo  
								UNION ALL
 								SELECT
									1 AS i_show
									,a.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date 
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense_vsn' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,c.gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_vsn_hdr a
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN gl_tran_hdr c ON a.imp_expense_vsn_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_vsn_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (4) /*4 = ไม่เป็นสถานะยกเลิก */
										AND c.i_enable = 1
										" . $conDateDoc . "
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I'
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND c.i_is_post>1 AND LEFT(c.c_code,1)='G'  and c.i_enable=1 and c.i_is_close_year=2 
									" . $conDateDoc . " " . $conBookExpense . "
								GROUP BY a.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, a.d_doc_date,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,c.gl_dc_book_type_id,e.i_type_depo  
									 
								UNION ALL

 								SELECT
									3 AS i_show
									,a.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, c.d_save_date, 120) AS d_cheque_date 
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,c.gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_hdr a
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN gl_tran_hdr c ON a.imp_expense_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (1) /*1 = ยกเลิก e-phys */
										AND c.i_enable = 1
										" . $conDateSave . "
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I'
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND c.i_is_post>1 AND LEFT(c.c_code,1)='G'  and c.i_enable=1 and c.i_is_close_year=2
									" . $conDateSave . " " . $conBookExpense . "
								GROUP BY a.imp_expense_hdr_id, e.dc_bank_acc_company_id,c.d_save_date,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,c.gl_dc_book_type_id,e.i_type_depo

 								UNION ALL 

								SELECT
									3 AS i_show
									,a.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, c.d_save_date, 120) AS d_cheque_date 
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'imp_expense_vsn' AS c_system
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,c.gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_vsn_hdr a
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source 
									INNER JOIN gl_tran_hdr c ON a.imp_expense_vsn_hdr_id = c.table_pk_id
										AND c.table_name = 'imp_expense_vsn_hdr'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (2) /*2 = ยกเลิก VSN*/
										AND c.i_enable = 1
										" . $conDateSave . "
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I'
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND c.i_is_post>1 AND LEFT(c.c_code,1)='G'  and c.i_enable=1 and c.i_is_close_year=2 
									" . $conDateSave . " " . $conBookExpense . "
								GROUP BY a.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, c.d_save_date,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,c.gl_dc_book_type_id,e.i_type_depo 

 								UNION ALL

								SELECT
									1 AS i_show
									,b.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, b.d_pay, 120) AS d_cheque_date 
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,2 as gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_hdr a
									INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
									INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source			 
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id 
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I'  
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND d.i_delete=2
									" . $conDatePay . " " . $conBook_EPHYS_VNET_BTN_ChequeFixed . "

								GROUP BY b.imp_expense_hdr_id, e.dc_bank_acc_company_id, b.d_pay,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,e.i_type_depo 

								UNION ALL
 
								SELECT
									1 AS i_show
									,b.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, b.d_cheque, 120) AS d_cheque_date 
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense_vsn' AS c_system
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id	
									,2 as gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_vsn_hdr a
									INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
									INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id 
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I' 
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND d.i_delete=2
									" . $conDateCheque . " " . $conBook_EPHYS_VNET_BTN_ChequeFixed . "

								GROUP BY b.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id,b.d_cheque,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,e.i_type_depo 
								
								UNION ALL
 
								SELECT
									3 AS i_show
									,b.imp_expense_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, r.d_save_jv_cancel, 120) AS d_cheque_date 
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id	
									,2 as gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_hdr a
									INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
									INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN imp_cancel_doc_expense r on c.imp_expense_dtl_id = r.imp_expense_dtl_id
										AND c.imp_expense_dtl_cheque_id = r.imp_expense_dtl_cheque_id
										AND r.i_type_doc = 1 
										AND r.i_enable = 1
										" . $conDateJV . "
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id 
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I'
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND d.i_delete=2
									" . $conDateJV . "  " . $conBook_EPHYS_VNET_BTN_ChequeFixed . "
								GROUP BY b.imp_expense_hdr_id, e.dc_bank_acc_company_id,r.d_save_jv_cancel,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,e.i_type_depo	
								
								UNION ALL

 								SELECT
									3 AS i_show
									,b.imp_expense_vsn_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, r.d_save_jv_cancel, 120) AS d_cheque_date 
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'imp_expense_vsn' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,2 as gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_expense_vsn_hdr a
									INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
									INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN imp_cancel_doc_expense r on c.imp_expense_vsn_dtl_id = r.imp_expense_vsn_dtl_id
										AND c.imp_expense_vsn_dtl_cheque_id = r.imp_expense_vsn_dtl_cheque_id
										AND r.i_type_doc = 2 
										AND r.i_enable = 1
										" . $conDateJV . "
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id 
								WHERE a.i_enable = 1 AND LEFT(a.c_code,1)='I'
									AND e.i_delete=2 and e.i_type_depo=2 " . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									AND d.i_delete=2
									" . $conDateJV . " " . $conBook_EPHYS_VNET_BTN_ChequeFixed . "
								GROUP BY b.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, r.d_save_jv_cancel,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,e.i_type_depo	
								
								UNION ALL

								SELECT
									1 AS i_show
									,a.imp_bank_account_detail_hdr_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date 
									,b.f_dr AS f_dr
									,b.f_cr AS f_cr
									,'imp_bank_account_detail_hdr' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,CASE a.i_book_type
										WHEN 1 THEN 1
										WHEN 2 THEN 3
										WHEN 3 THEN 2
										ELSE 0
									END AS gl_dc_book_type_id
									,e.i_type_depo
								FROM imp_bank_account_detail_hdr a
									INNER JOIN imp_bank_account_detail_dtl b ON a.imp_bank_account_detail_hdr_id = b.imp_bank_account_detail_hdr_id
									INNER JOIN vw_dc_bank_acc_company_full e ON a.dc_bank_acc_company_id = e.dc_bank_acc_company_id 
									" . $ww_bank . " " . $ww_book_bank . "
								WHERE a.i_enable = 1
									 AND e.i_delete=2
									 " . $conDateDoc . " " . $conBookIncomeFixed . " 
								UNION ALL 

								SELECT 
									1 AS i_show
									,a.gl_bank_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date 
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'gl_bank' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,c.gl_dc_book_type_id
									,e.i_type_depo
								FROM gl_bank a
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = c.gl_tran_hdr_id
										AND c.table_name = 'gl_bank'
										AND c.i_cancel_doc_expense IN (4)  
										AND c.i_enable = 1
										" . $conDateDoc . "
										" . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
								WHERE a.i_enable = 1 AND a.c_code IS NOT NULL 
									AND e.i_delete=2 
									AND c.i_is_post > 1 AND LEFT(c.c_code,1) = 'G' AND c.i_enable=1 and c.i_is_close_year=2
									" . $conDateDoc . " " . $conBookExpense . "
								GROUP BY a.gl_bank_id,e.dc_bank_acc_company_id,a.d_doc_date,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,c.gl_dc_book_type_id,e.i_type_depo

								UNION ALL
	 
								SELECT
									3 AS i_show
									,a.gl_bank_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, c.d_save_date, 120) AS d_cheque_date
									,SUM(ISNULL(c.f_total_amt,0)) AS f_dr
									,0 AS f_cr
									,'gl_bank' AS c_system
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,c.gl_dc_book_type_id
									,e.i_type_depo
								FROM gl_bank a
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN gl_tran_hdr c ON a.gl_bank_id = c.table_pk_id
										AND c.table_name = 'gl_bank'
										AND c.gl_dc_book_type_id = 3 /* รายวันทั่วไป */
										AND c.i_cancel_doc_expense IN (3)
										AND c.i_enable = 1
										" . $conDateSave . "
										" . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
								WHERE a.i_enable = 1 AND a.c_code IS NOT NULL 
									AND e.i_delete = 2
									AND c.i_is_post > 1 AND LEFT(c.c_code,1) = 'G'  and c.i_enable = 1 and c.i_is_close_year = 2
									" . $conDateSave . " " . $conBookExpense . "
								GROUP BY a.gl_bank_id,e.dc_bank_acc_company_id,c.d_save_date,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,c.gl_dc_book_type_id,e.i_type_depo 

								UNION ALL
	 
								SELECT
									1 AS i_show
									,a.gl_bank_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_cheque_date 
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'gl_bank' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,2 as gl_dc_book_type_id
									,e.i_type_depo
								FROM gl_bank a
									INNER JOIN gl_bank_cheque c ON a.gl_bank_id = c.gl_bank_id
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id 
								WHERE a.i_enable = 1 AND a.c_code IS NOT NULL 
									AND e.i_delete=2
									AND d.i_delete=2
									" . $conDateDoc . " 
									" . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									" . $conBook_EPHYS_VNET_BTN_ChequeFixed . "
								GROUP BY a.gl_bank_id, e.dc_bank_acc_company_id,a.d_doc_date,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id,e.i_type_depo
								
								UNION ALL
	 
								SELECT
									3 AS i_show
									,a.gl_bank_id AS pk_id
									,e.dc_bank_acc_company_id
									,CONVERT(VARCHAR, r.d_save_jv_cancel, 120) AS d_cheque_date 
									,0.00 AS f_dr
									,SUM(ISNULL(c.f_cheque,0)) AS f_cr
									,'gl_bank' AS c_system 
									,e.dc_acc_id
									,e.dc_bank_deposit_type_id
									,e.dc_bank_id
									,2 as gl_dc_book_type_id
									,e.i_type_depo
								FROM gl_bank a
									INNER JOIN gl_bank_cheque c ON a.gl_bank_id = c.gl_bank_id
									INNER JOIN vw_dc_bank_acc_company_full e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
									INNER JOIN imp_cancel_doc_expense r on c.gl_bank_cheque_id = r.gl_bank_cheque_id 
										AND r.i_type_doc = 3
										AND r.i_enable = 1
										" . $ww_bank . " " . $ww_book_bank . " " . $ww_fixed_depo . "
									INNER JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id 
								WHERE a.i_enable = 1 AND a.c_code IS NOT NULL " . $conDateJV . " " . $conBook_EPHYS_VNET_BTN_ChequeFixed . "
								GROUP BY a.gl_bank_id, e.dc_bank_acc_company_id,e.dc_acc_id,e.dc_bank_deposit_type_id,e.dc_bank_id, r.d_save_jv_cancel,e.i_type_depo
									
						) bb

	";

	$sqlMain = "	
				DECLARE @d_save_date_start VARCHAR(100) = '{$_REQUEST["date_start"]}';
				DECLARE @d_save_date_end VARCHAR(100) = '{$_REQUEST["date_end"]}';
				
				DECLARE @mm_s INT 	= ''; 
				DECLARE @yyyy_s INT = ''; 
					
				SET NOCOUNT ON

				SELECT 	   @mm_s = substring(cast('{$_REQUEST["date_start"]}' as varchar(50)),6,2)
						,@yyyy_s = substring(cast('{$_REQUEST["date_start"]}' as varchar(50)),1,4);				
				
				SELECT *
				INTO #temp_data
				FROM
				(SELECT
					a.dc_bank_id
					,b.dc_acc_id
					,a.c_name AS dc_bank_name
					,c.i_type
					,CASE
						WHEN c.i_type = 1 THEN 'ออมทรัพย์'
						WHEN c.i_type = 2 THEN 'กระแสรายวัน'
						WHEN c.i_type = 3 THEN 'ฝากประจำที่ไม่เกิน 3 เดือน'
						WHEN c.i_type = 4 THEN 'ฝากประจำที่มากกว่า 3 เดือน แต่ไม่เกิน 1 ปี'
						WHEN c.i_type = 5 THEN 'ฝากประจำที่เกิน 1 ปี'
						ELSE '-ไม่ระบุ-'
					END AS dc_bank_deposit_type
					,b.dc_bank_acc_company_id
					,b.c_code AS dc_bank_acc_company_code
					,b.c_name AS dc_bank_acc_company_name
					,NULL AS deposit_balance_1
					,NULL AS deposit_1
					,NULL AS withdraw_1
					,NULL AS deposit_2
					,NULL AS withdraw_2
					,NULL AS deposit_3
					,NULL AS withdraw_3
					,NULL AS deposit_4
					,NULL AS withdraw_4
					,NULL AS deposit_5
					,NULL AS withdraw_5
					,NULL AS deposit_balance_2
				FROM dc_bank a
					INNER JOIN dc_bank_acc_company b ON a.dc_bank_id = b.dc_bank_id
					INNER JOIN dc_bank_deposit_type c ON b.dc_bank_deposit_type_id = c.dc_bank_deposit_type_id
				WHERE a.i_enable = " . STATUS_ENABLE . "
					AND a.i_delete = " . DELETE_FALSE . "
					AND b.i_enable = " . STATUS_ENABLE . "
					AND b.i_delete = " . DELETE_FALSE . "
					AND c.i_enable = " . STATUS_ENABLE . "
					AND c.i_delete = " . DELETE_FALSE . "
					{$con}
				) a
				
				SELECT SUM(mm.f_end_dr)-SUM(mm.f_end_cr) AS f_money_begin,mm.dc_acc_id
				INTO #temp_money_begin
				FROM vw_gl_balance_cost mm INNER JOIN #temp_data dd ON mm.dc_acc_id = dd.dc_acc_id
				WHERE c_mm=(CASE WHEN 1=@mm_s THEN 12 ELSE @mm_s-1 END) 
						and c_yyyy=(CASE WHEN 1=@mm_s THEN @yyyy_s-1 ELSE @yyyy_s END) 
						and i_is_post=" . BOOK_ACC_GL . " and i_is_close_year=" . GL_CLOSE_YEAR_NONE . "
				GROUP BY mm.dc_acc_id; 
				
				" . $c_money_ImpeImpv_BankAccountDetails_Btn . "
				
				SELECT aaa.dc_acc_id
					,(SELECT SUM(f_money_begin) FROM #temp_money_begin bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id) as deposit_balance_1 
					,(SELECT SUM(f_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=1 and bbb.i_type_depo=aaa.i_type) as deposit_1
					,(SELECT SUM(f_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=1 and bbb.i_type_depo=aaa.i_type) as withdraw_1
					,(SELECT SUM(f_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=2 and bbb.i_type_depo=aaa.i_type) as deposit_2
					,(SELECT SUM(f_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=2 and bbb.i_type_depo=aaa.i_type) as withdraw_2
					,(SELECT SUM(f_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=3 and bbb.i_type_depo=aaa.i_type) as deposit_3
					,(SELECT SUM(f_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=3 and bbb.i_type_depo=aaa.i_type) as withdraw_3
					,(SELECT SUM(f_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=4 and bbb.i_type_depo=aaa.i_type) as deposit_4
					,(SELECT SUM(f_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=4 and bbb.i_type_depo=aaa.i_type) as withdraw_4
					,(SELECT SUM(f_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=5 and bbb.i_type_depo=aaa.i_type) as deposit_5
					,(SELECT SUM(f_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type_depo=5 and bbb.i_type_depo=aaa.i_type) as withdraw_5  
					,aaa.i_type
				INTO #temp_money_all
				FROM #temp_data aaa
				
				SELECT
					a.dc_bank_id
					,a.dc_acc_id
					,a.dc_bank_name
					,a.i_type
					,a.dc_bank_deposit_type
					,a.dc_bank_acc_company_id
					,a.dc_bank_acc_company_code
					,a.dc_bank_acc_company_name
					,ISNULL((SELECT SUM(deposit_balance_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id),0) as deposit_balance_1
					,ISNULL((SELECT SUM(deposit_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as deposit_1 
					,ISNULL((SELECT SUM(withdraw_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as withdraw_1   
					,ISNULL((SELECT SUM(deposit_2) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as deposit_2 
					,ISNULL((SELECT SUM(withdraw_2) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as withdraw_2  
					,ISNULL((SELECT SUM(deposit_3) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as deposit_3 
					,ISNULL((SELECT SUM(withdraw_3) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as withdraw_3  
					,ISNULL((SELECT SUM(deposit_4) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as deposit_4 
					,ISNULL((SELECT SUM(withdraw_4) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as withdraw_4  
					,ISNULL((SELECT SUM(deposit_5) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as deposit_5 
					,ISNULL((SELECT SUM(withdraw_5) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0) as withdraw_5  
					,CASE
						WHEN (a.i_type=1) THEN
							(ISNULL((SELECT SUM(deposit_balance_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							+ISNULL((SELECT SUM(deposit_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							-ISNULL((SELECT SUM(withdraw_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)) 
					 	WHEN (a.i_type=2) THEN
							(ISNULL((SELECT SUM(deposit_balance_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							+ISNULL((SELECT SUM(deposit_2) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							-ISNULL((SELECT SUM(withdraw_2) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)) 
					 	WHEN (a.i_type=3) THEN
							(ISNULL((SELECT SUM(deposit_balance_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							+ISNULL((SELECT SUM(deposit_3) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							-ISNULL((SELECT SUM(withdraw_3) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)) 
					 	WHEN (a.i_type=4) THEN
							(ISNULL((SELECT SUM(deposit_balance_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							+ISNULL((SELECT SUM(deposit_4) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							-ISNULL((SELECT SUM(withdraw_4) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)) 
					 	WHEN (a.i_type=5) THEN
							(ISNULL((SELECT SUM(deposit_balance_1) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							+ISNULL((SELECT SUM(deposit_5) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)
							-ISNULL((SELECT SUM(withdraw_5) FROM #temp_money_all bbb WHERE bbb.dc_acc_id=a.dc_acc_id and bbb.i_type=a.i_type),0)) 
						ELSE 0
					END as deposit_balance_2
				FROM #temp_data a 
				ORDER BY i_type, dc_bank_id;
				";

	$arrParam	= array();
//echo "$sqlMain"; exit;							
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {

		while ($row = $db->Fetch($stmt)) {

			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["dc_bank_name"]			= $row["dc_bank_name"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["dc_bank_deposit_type"]	= $row["dc_bank_deposit_type"];

			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["dc_bank_acc_company_code"]		= $row["dc_bank_acc_company_code"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["dc_bank_acc_company_name"]		= $row["dc_bank_acc_company_name"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["deposit_balance_1"]				= $row["deposit_balance_1"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["deposit_1"]						= $row["deposit_1"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["withdraw_1"]					= $row["withdraw_1"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["deposit_2"]						= $row["deposit_2"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["withdraw_2"]					= $row["withdraw_2"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["deposit_3"]						= $row["deposit_3"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["withdraw_3"]					= $row["withdraw_3"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["deposit_4"]						= $row["deposit_4"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["withdraw_4"]					= $row["withdraw_4"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["deposit_5"]						= $row["deposit_5"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["withdraw_5"]					= $row["withdraw_5"];
			$ArrBank[$row["i_type"]][$row["dc_bank_id"]]["data"][$row["dc_bank_acc_company_id"]]["deposit_balance_2"]				= $row["deposit_balance_2"];
		}

		if (isset($ArrBank)) {

			$sum_deposit_balance_1		= 0;
			$sum_deposit_1				= 0;
			$sum_withdraw_1				= 0;
			$sum_deposit_2				= 0;
			$sum_withdraw_2				= 0;
			$sum_deposit_3				= 0;
			$sum_withdraw_3				= 0;
			$sum_deposit_4				= 0;
			$sum_withdraw_4				= 0;
			$sum_deposit_5				= 0;
			$sum_withdraw_5				= 0;
			$sum_deposit_balance_2		= 0;

			foreach ($ArrBank as $i_type => $obj_type) {

				$deposit_balance_1		= 0;
				$deposit_1				= 0;
				$withdraw_1				= 0;
				$deposit_2				= 0;
				$withdraw_2				= 0;
				$deposit_3				= 0;
				$withdraw_3				= 0;
				$deposit_4				= 0;
				$withdraw_4				= 0;
				$deposit_5				= 0;
				$withdraw_5				= 0;
				$deposit_balance_2		= 0;

				foreach ($obj_type as $dc_bank_id => $obj_bank) {

					$temp = array(
						"i_type"	=> 1,
						"c_name"	=> "ธนาคาร" . $obj_bank["dc_bank_name"] . " ประเภท" . $obj_bank["dc_bank_deposit_type"]
					);

					${$root}[] = $temp;

					foreach ($obj_bank["data"] as $dc_bank_acc_company_id => $obj_company) {

						$temp = array(
							"i_type"				=> 2,
							"c_code" 				=> $obj_company["dc_bank_acc_company_code"],
							"c_name" 				=> $obj_company["dc_bank_acc_company_name"],
							"deposit_balance_1"		=> ($obj_company["deposit_balance_1"] > 0) ? number_format($obj_company["deposit_balance_1"], 2) : "-",
							"deposit_1"				=> ($obj_company["deposit_1"] > 0) ? number_format($obj_company["deposit_1"], 2) : "-",
							"withdraw_1"			=> ($obj_company["withdraw_1"] > 0) ? number_format($obj_company["withdraw_1"], 2) : "-",
							"deposit_2"				=> ($obj_company["deposit_2"] > 0) ? number_format($obj_company["deposit_2"], 2) : "-",
							"withdraw_2"			=> ($obj_company["withdraw_2"] > 0) ? number_format($obj_company["withdraw_2"], 2) : "-",
							"deposit_3"				=> ($obj_company["deposit_3"] > 0) ? number_format($obj_company["deposit_3"], 2) : "-",
							"withdraw_3"			=> ($obj_company["withdraw_3"] > 0) ? number_format($obj_company["withdraw_3"], 2) : "-",
							"deposit_4"				=> ($obj_company["deposit_4"] > 0) ? number_format($obj_company["deposit_4"], 2) : "-",
							"withdraw_4"			=> ($obj_company["withdraw_4"] > 0) ? number_format($obj_company["withdraw_4"], 2) : "-",
							"deposit_5"				=> ($obj_company["deposit_5"] > 0) ? number_format($obj_company["deposit_5"], 2) : "-",
							"withdraw_5"			=> ($obj_company["withdraw_5"] > 0) ? number_format($obj_company["withdraw_5"], 2) : "-",
							"deposit_balance_2"		=> ($obj_company["deposit_balance_2"] > 0) ? number_format($obj_company["deposit_balance_2"], 2) : "-",
						);
						${$root}[] = $temp;

						$deposit_balance_1		+= $obj_company["deposit_balance_1"];
						$deposit_1				+= $obj_company["deposit_1"];
						$withdraw_1				+= $obj_company["withdraw_1"];
						$deposit_2				+= $obj_company["deposit_2"];
						$withdraw_2				+= $obj_company["withdraw_2"];
						$deposit_3				+= $obj_company["deposit_3"];
						$withdraw_3				+= $obj_company["withdraw_3"];
						$deposit_4				+= $obj_company["deposit_4"];
						$withdraw_4				+= $obj_company["withdraw_4"];
						$deposit_5				+= $obj_company["deposit_5"];
						$withdraw_5				+= $obj_company["withdraw_5"];
						$deposit_balance_2		+= $obj_company["deposit_balance_2"];

						$sum_deposit_balance_1		+= $obj_company["deposit_balance_1"];
						$sum_deposit_1				+= $obj_company["deposit_1"];
						$sum_withdraw_1				+= $obj_company["withdraw_1"];
						$sum_deposit_2				+= $obj_company["deposit_2"];
						$sum_withdraw_2				+= $obj_company["withdraw_2"];
						$sum_deposit_3				+= $obj_company["deposit_3"];
						$sum_withdraw_3				+= $obj_company["withdraw_3"];
						$sum_deposit_4				+= $obj_company["deposit_4"];
						$sum_withdraw_4				+= $obj_company["withdraw_4"];
						$sum_deposit_5				+= $obj_company["deposit_5"];
						$sum_withdraw_5				+= $obj_company["withdraw_5"];
						$sum_deposit_balance_2		+= $obj_company["deposit_balance_2"];
					}
				}

				// SUM TYPE
				$temp = array(
					"i_type" 				=> 3,
					"c_name" 				=> "รวม ประเภท" . $obj_bank["dc_bank_deposit_type"],
					"deposit_balance_1"		=> ($deposit_balance_1 > 0) ? number_format($deposit_balance_1, 2) : "-",
					"deposit_1"				=> ($deposit_1 > 0) ? number_format($deposit_1, 2) : "-",
					"withdraw_1"			=> ($withdraw_1 > 0) ? number_format($withdraw_1, 2) : "-",
					"deposit_2"				=> ($deposit_2 > 0) ? number_format($deposit_2, 2) : "-",
					"withdraw_2"			=> ($withdraw_2 > 0) ? number_format($withdraw_2, 2) : "-",
					"deposit_3"				=> ($deposit_3 > 0) ? number_format($deposit_3, 2) : "-",
					"withdraw_3"			=> ($withdraw_3 > 0) ? number_format($withdraw_3, 2) : "-",
					"deposit_4"				=> ($deposit_4 > 0) ? number_format($deposit_4, 2) : "-",
					"withdraw_4"			=> ($withdraw_4 > 0) ? number_format($withdraw_4, 2) : "-",
					"deposit_5"				=> ($deposit_5 > 0) ? number_format($deposit_5, 2) : "-",
					"withdraw_5"			=> ($withdraw_5 > 0) ? number_format($withdraw_5, 2) : "-",
					"deposit_balance_2"		=> ($deposit_balance_2 > 0) ? number_format($deposit_balance_2, 2) : "-",
				);

				${$root}[] = $temp;
			}

			// SUM TOTAL
			$temp = array(
				"i_type" 				=> 4,
				"c_name" 				=> "รวมทั้งสิ้น",
				"deposit_balance_1"		=> ($sum_deposit_balance_1 > 0) ? number_format($sum_deposit_balance_1, 2) : "-",
				"deposit_1"				=> ($sum_deposit_1 > 0) ? number_format($sum_deposit_1, 2) : "-",
				"withdraw_1"			=> ($sum_withdraw_1 > 0) ? number_format($sum_withdraw_1, 2) : "-",
				"deposit_2"				=> ($sum_deposit_2 > 0) ? number_format($sum_deposit_2, 2) : "-",
				"withdraw_2"			=> ($sum_withdraw_2 > 0) ? number_format($sum_withdraw_2, 2) : "-",
				"deposit_3"				=> ($sum_deposit_3 > 0) ? number_format($sum_deposit_3, 2) : "-",
				"withdraw_3"			=> ($sum_withdraw_3 > 0) ? number_format($sum_withdraw_3, 2) : "-",
				"deposit_4"				=> ($sum_deposit_4 > 0) ? number_format($sum_deposit_4, 2) : "-",
				"withdraw_4"			=> ($sum_withdraw_4 > 0) ? number_format($sum_withdraw_4, 2) : "-",
				"deposit_5"				=> ($sum_deposit_5 > 0) ? number_format($sum_deposit_5, 2) : "-",
				"withdraw_5"			=> ($sum_withdraw_5 > 0) ? number_format($sum_withdraw_5, 2) : "-",
				"deposit_balance_2"		=> ($sum_deposit_balance_2 > 0) ? number_format($sum_deposit_balance_2, 2) : "-",
			);

			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
