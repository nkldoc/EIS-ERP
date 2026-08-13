<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam() {
	
	global $db,$date,$root,$data, $con,$arr_status;
 
	$totalCount		= 0;
	$conCheque		= "";
	$conDate		= "";
	$conDateEP		= "";
	$conDateVSN		= "";
	$conDCCheque	= "";

	if($_REQUEST["page"] == "GlRepChequeIncomplete_IMP") { // รายงาน บัญชีย่อยเงินฝากธนาคาร
		
		$for_id = explode ( ";", $_REQUEST ["dc_bank_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$conCheque .= ($in != "") ? " AND e.dc_bank_id IN (" . $in . ")" : "";
			}
		}
		
		$for_id = explode ( ";", $_REQUEST ["dc_bank_acc_company_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$conCheque 		.= ($in != "") ? " AND e.dc_bank_acc_company_id IN (" . $in . ")" : "";
				$conDCCheque	.= ($in != "") ? " AND d.dc_bank_acc_company_id IN (" . $in . ")" : "";
			}
		}
		
		$conFixedAcc1 = " AND e.dc_bank_deposit_type_id=1"; //ออมทรัพย์
		$conFixedAcc2 = " AND e.dc_bank_deposit_type_id=2"; //กระแส
		
		
		if($_REQUEST["date_start"] != "" && $_REQUEST["date_end"] != "") {
			$conDateEP	.= " AND b.d_pay between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
			$conDateVSN	.= " AND b.d_cheque between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
		}
		
		$sqlMain = "SET NOCOUNT ON
					/*================= e-phys BANK (SUM) กระแส =================*/
					SELECT *, 1 AS i_type
					INTO #tb_cheque_sum
					FROM ( SELECT
						b.imp_expense_hdr_id AS pk_id
						,e.dc_bank_acc_company_id
						,e.c_code AS company_code
						,e.c_name AS company_name
						,CONVERT(VARCHAR, b.d_pay, 120) AS d_cheque_date
						,c.c_ref_doc AS c_cheque
						,'สมุดรายวันทั่วไป' AS c_name
						,SUM(b.f_inv+ISNULL(b.f_vat,0)) AS f_dr
						, 0.00 AS f_cr
						,'imp_expense' AS c_system
						,SUM(b.f_inv+ISNULL(b.f_vat,0)) as f_total_dr
						,CAST(0.00 AS decimal(18,2)) as f_total_cr
						,CAST(0.00 AS decimal(18,2)) as f_diff						
					FROM imp_expense_hdr a
						INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
						INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
						LEFT JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = c.gl_tran_hdr_id
					WHERE a.i_enable = ".STATUS_ENABLE."  and left(a.c_code,1)='I'
						{$conDateEP} {$conCheque} {$conFixedAcc2}
					GROUP BY b.imp_expense_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, c.c_ref_doc, b.d_pay
					UNION ALL
					/*=============== vision net BANK (SUM) กระแส   ===============*/
					SELECT
						b.imp_expense_vsn_hdr_id AS pk_id
						,e.dc_bank_acc_company_id
						,e.c_code AS company_code
						,e.c_name AS company_name
						,CONVERT(VARCHAR, b.d_cheque, 120) AS d_cheque_date
						,c.c_ref_doc AS c_cheque
						,'สมุดรายวันทั่วไป' AS c_name
						,SUM(b.f_inv) AS f_dr
						, 0.00 AS f_cr
						,'imp_expense_vsn' AS c_system
						,SUM(b.f_inv) as f_total_dr
						,CAST(0.00 AS decimal(18,2)) as f_total_cr
						,CAST(0.00 AS decimal(18,2)) as f_diff						
					FROM imp_expense_vsn_hdr a
						INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
						INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
						LEFT JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = c.gl_tran_hdr_id
					WHERE a.i_enable = ".STATUS_ENABLE." and left(a.c_code,1)='I'
						{$conDateVSN}  {$conCheque}  {$conFixedAcc2}
					GROUP BY b.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, c.c_ref_doc, b.d_cheque 
 					) a
					
					/*==================== e-phys CHEQUE ====================*/
					SELECT *, 2 AS i_type
					INTO #tb_cheque
					FROM ( SELECT
						b.imp_expense_hdr_id AS pk_id
						,e.dc_bank_acc_company_id
						,e.c_code AS company_code
						,e.c_name AS company_name
						,CONVERT(VARCHAR, b.d_pay, 120) AS d_cheque_date
						,d.c_cheque
						,'สมุดรายวันเงินจ่าย' AS c_name
						,0.00 AS f_dr
						,SUM(ISNULL(c.f_cheque,0)) AS f_cr
						,'imp_expense' AS c_system
						,CAST(0.00 AS decimal(18,2)) as f_total_dr 
						,CAST(0.00 AS decimal(18,2)) as f_total_cr
						,CAST(0.00 AS decimal(18,2))as f_diff						
					FROM imp_expense_hdr a
						INNER JOIN imp_expense_dtl b ON a.imp_expense_hdr_id = b.imp_expense_hdr_id
						INNER JOIN imp_expense_dtl_cheque c ON b.imp_expense_dtl_id = c.imp_expense_dtl_id
						INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
						LEFT JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
					WHERE a.i_enable = ".STATUS_ENABLE." and left(a.c_code,1)='I'
						and a.imp_expense_hdr_id in (select distinct pk_id from #tb_cheque_sum where c_system='imp_expense')
						{$conDateEP}  {$conCheque}  {$conFixedAcc2} {$conDCCheque}
					GROUP BY b.imp_expense_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, b.d_pay
					UNION ALL
					/*================== vision net CHEQUE ==================*/
					SELECT
						b.imp_expense_vsn_hdr_id AS pk_id
						,e.dc_bank_acc_company_id
						,e.c_code AS company_code
						,e.c_name AS company_name
						,CONVERT(VARCHAR, b.d_cheque, 120) AS d_cheque_date
						,d.c_cheque
						,'สมุดรายวันเงินจ่าย' AS c_name
						,0.00 AS f_dr
						,SUM(ISNULL(c.f_cheque,0)) AS f_cr
						,'imp_expense_vsn' AS c_system
						,CAST(0.00 AS decimal(18,2)) as f_total_dr 
						,CAST(0.00 AS decimal(18,2)) as f_total_cr
						,CAST(0.00 AS decimal(18,2))as f_diff						
					FROM imp_expense_vsn_hdr a
						INNER JOIN imp_expense_vsn_dtl b ON a.imp_expense_vsn_hdr_id = b.imp_expense_vsn_hdr_id
						INNER JOIN imp_expense_vsn_dtl_cheque c ON b.imp_expense_vsn_dtl_id = c.imp_expense_vsn_dtl_id
						INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source
						LEFT JOIN dc_cheque d ON c.dc_cheque_id = d.dc_cheque_id
					WHERE a.i_enable = ".STATUS_ENABLE." and left(a.c_code,1)='I'
						and a.imp_expense_vsn_hdr_id in (select distinct pk_id from #tb_cheque_sum where c_system='imp_expense_vsn')
						{$conDateVSN}  {$conCheque}  {$conFixedAcc2} {$conDCCheque}
					GROUP BY b.imp_expense_vsn_hdr_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, b.d_cheque ) a
					
					 
					UPDATE a
					SET  a.f_total_cr= ISNULL(CAST((SELECT SUM(f_cr) FROM #tb_cheque b WHERE b.pk_id=a.pk_id and b.c_system=a.c_system) AS decimal(18,2) ),0)
						,a.f_diff = a.f_total_dr - ISNULL(CAST((SELECT SUM(f_cr) FROM #tb_cheque b WHERE b.pk_id=a.pk_id and b.c_system=a.c_system) AS decimal(18,2) ),0)
					FROM #tb_cheque_sum a ; 
					 
					UPDATE a
					SET  a.f_total_dr = b.f_total_dr
						,a.f_total_cr = b.f_total_cr 
						,a.f_diff     = b.f_diff 
					FROM #tb_cheque a INNER JOIN #tb_cheque_sum b ON a.pk_id = b.pk_id AND a.c_system = b.c_system 
					WHERE a.pk_id = b.pk_id AND a.c_system = b.c_system  ; 					 
					 
					SELECT *, 9 AS i_type
					INTO #tb_cheque_tot
					FROM ( 
						select pk_id,dc_bank_acc_company_id,company_code,company_name,d_cheque_date,c_cheque,c_name,0 as f_dr,0 as f_cr,c_system,f_total_dr,f_total_cr,f_diff 
						from #tb_cheque_sum 
						where f_diff!=0.00
					) a 
					 
					SELECT *
					INTO #cheque FROM
					(SELECT
						RIGHT('0'+CAST(DAY(a.d_cheque_date) AS varchar(2)) ,2) AS c_dd
						,RIGHT('0'+CAST(MONTH(a.d_cheque_date) AS varchar(2)) ,2) AS c_mm
						,YEAR(a.d_cheque_date)+543 c_yyyy
						,*
					FROM #tb_cheque_sum a
					WHERE a.f_diff!=0.00
					UNION ALL
					SELECT
						RIGHT('0'+CAST(DAY(b.d_cheque_date) AS varchar(2)) ,2) AS c_dd
						,RIGHT('0'+CAST(MONTH(b.d_cheque_date) AS varchar(2)) ,2) AS c_mm
						,YEAR(b.d_cheque_date)+543 c_yyyy
						,*
					FROM #tb_cheque b 
					WHERE b.f_diff!=0.00
					UNION ALL
					SELECT
						RIGHT('0'+CAST(DAY(c.d_cheque_date) AS varchar(2)) ,2) AS c_dd
						,RIGHT('0'+CAST(MONTH(c.d_cheque_date) AS varchar(2)) ,2) AS c_mm
						,YEAR(c.d_cheque_date)+543 c_yyyy
						,*
					FROM #tb_cheque_tot c 					
					) a;
					
					SELECT
						dc_bank_acc_company_id AS source_id
						,*
					FROM #cheque
					ORDER BY dc_bank_acc_company_id, d_cheque_date, pk_id, i_type, c_cheque;";
		
	}   else if($_REQUEST["page"] == "GlRepChequeIncomplete_BTN") { //  รายงาน บัญชีเงินฝากธนาคาร(ไม่มีรายละเอียดค่าใช้จ่าย) - กระแสรายวัน
	
		$for_id = explode ( ";", $_REQUEST ["dc_bank_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$conCheque .= ($in != "") ? " AND e.dc_bank_id IN (" . $in . ")" : "";
			}
		}
	
		$for_id = explode ( ";", $_REQUEST ["dc_bank_acc_company_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$conCheque .= ($in != "") ? " AND e.dc_bank_acc_company_id IN (" . $in . ")" : "";
			}
		}

		$conFixedAcc1 = " AND e.dc_bank_deposit_type_id=1"; //ออมทรัพย์
		$conFixedAcc2 = " AND e.dc_bank_deposit_type_id=2"; //กระแส
		
		if($_REQUEST["date_start"] != "" && $_REQUEST["date_end"] != "") {
			$conDate	.= " AND a.d_save_jv_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
		}
	
		$sqlMain = "SET NOCOUNT ON
					/*================= GL_BANK (SUM) =================*/
					SELECT *, 1 AS i_type
					INTO #tb_cheque_sum
					FROM ( SELECT
						a.gl_bank_id AS pk_id
						,e.dc_bank_acc_company_id
						,e.c_code AS company_code
						,e.c_name AS company_name
						,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_cheque_date
						,c.c_ref_doc AS c_cheque
						,'สมุดรายวันทั่วไป' AS c_name
						,SUM(a.f_money) AS f_dr
						,0.00 AS f_cr
						,SUM(a.f_money) as f_total_dr
						,CAST(0.00 AS decimal(18,2)) as f_total_cr
						,CAST(0.00 AS decimal(18,2)) as f_diff							
					FROM gl_bank a
						INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source  
						LEFT JOIN gl_tran_hdr c ON a.gl_tran_hdr_id_bank_id = c.gl_tran_hdr_id
					WHERE a.c_code IS NOT NULL
						AND a.i_enable = ".STATUS_ENABLE."
						{$conDate} {$conCheque} {$conFixedAcc2}
					GROUP BY a.gl_bank_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, c.c_ref_doc, a.d_save_jv_date  
					) a
					
					/*================= CHEQUE of GL_BANK  BY  ITEMS =================*/
					SELECT *, 2 AS i_type
					INTO #tb_cheque
					FROM ( SELECT
						a.gl_bank_id AS pk_id
						,e.dc_bank_acc_company_id
						,e.c_code AS company_code
						,e.c_name AS company_name
						,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_cheque_date
						,d.c_cheque
						,'สมุดรายวันเงินจ่าย' AS c_name
						,0.00 AS f_dr
						,SUM(ISNULL(b.f_cheque,0)) AS f_cr
						,CAST(0.00 AS decimal(18,2)) as f_total_dr
						,CAST(0.00 AS decimal(18,2)) as f_total_cr
						,CAST(0.00 AS decimal(18,2)) as f_diff						
					FROM gl_bank a
						INNER JOIN gl_bank_cheque b ON a.gl_bank_id = b.gl_bank_id
						INNER JOIN dc_bank_acc_company e ON e.dc_bank_acc_company_id = a.dc_bank_acc_company_id_source 
						LEFT JOIN dc_cheque d ON b.dc_cheque_id = d.dc_cheque_id
					WHERE a.c_code IS NOT NULL
						AND a.i_enable = ".STATUS_ENABLE."
						and a.gl_bank_id in (select distinct pk_id from #tb_cheque_sum)
						{$conDate}  {$conCheque} {$conFixedAcc2}
					GROUP BY a.gl_bank_id, e.dc_bank_acc_company_id, e.c_code, e.c_name, d.c_cheque, a.d_save_jv_date ) a
 
					UPDATE a
					SET  a.f_total_cr= ISNULL(CAST((SELECT SUM(f_cr) FROM #tb_cheque b WHERE b.pk_id=a.pk_id) AS decimal(18,2) ),0)
						,a.f_diff = a.f_total_dr - ISNULL(CAST((SELECT SUM(f_cr) FROM #tb_cheque b WHERE b.pk_id=a.pk_id) AS decimal(18,2) ),0)
					FROM #tb_cheque_sum a ; 					 

					UPDATE a
					SET  a.f_total_dr = b.f_total_dr
						,a.f_total_cr = b.f_total_cr 
						,a.f_diff     = b.f_diff 
					FROM #tb_cheque a INNER JOIN #tb_cheque_sum b ON a.pk_id = b.pk_id
					WHERE a.pk_id = b.pk_id  ; 						
					
					SELECT *, 9 AS i_type
					INTO #tb_cheque_tot
					FROM ( 
						select pk_id,dc_bank_acc_company_id,company_code,company_name,d_cheque_date,c_cheque,c_name,0 as f_dr,0 as f_cr,f_total_dr,f_total_cr,f_diff
						from #tb_cheque_sum 
						where f_diff!=0.00
					) a 					
					
					SELECT *
					INTO #cheque FROM
					(SELECT
						RIGHT('0'+CAST(DAY(a.d_cheque_date) AS varchar(2)) ,2) AS c_dd
						,RIGHT('0'+CAST(MONTH(a.d_cheque_date) AS varchar(2)) ,2) AS c_mm
						,YEAR(a.d_cheque_date)+543 c_yyyy
						,*
					FROM #tb_cheque_sum a
					WHERE a.f_diff!=0.00
					UNION ALL
					SELECT
						RIGHT('0'+CAST(DAY(b.d_cheque_date) AS varchar(2)) ,2) AS c_dd
						,RIGHT('0'+CAST(MONTH(b.d_cheque_date) AS varchar(2)) ,2) AS c_mm
						,YEAR(b.d_cheque_date)+543 c_yyyy
						,*
					FROM #tb_cheque b  
					WHERE b.f_diff!=0.00
					UNION ALL
					SELECT
						RIGHT('0'+CAST(DAY(c.d_cheque_date) AS varchar(2)) ,2) AS c_dd
						,RIGHT('0'+CAST(MONTH(c.d_cheque_date) AS varchar(2)) ,2) AS c_mm
						,YEAR(c.d_cheque_date)+543 c_yyyy
						,*
					FROM #tb_cheque_tot c ) a;
						
					SELECT
						dc_bank_acc_company_id AS source_id
						,*
					FROM #cheque
					ORDER BY dc_bank_acc_company_id, d_cheque_date, pk_id, i_type, c_cheque;";
	
	}
	
	$arrParam[]	= "";
  
    //  echo $sqlMain;exit;
  
	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {
		
		$comArr	= array();
		$ArrDtl	= array();
		
		// ยอดยกมา
		$date_start		= date( "Y-m-d", strtotime( "{$_REQUEST["date_start"]} -1 month" ) );
		list($yyyy,$mm,$dd)		= explode("-", $date_start);
		list($yyyy2,$mm2,$dd2)	= explode("-", $_REQUEST["date_end"]);
		
		while($row = $db->Fetch($stmt)) {
			
			if( @!array_key_exists( $row["c_yyyy"], $comArr[$row["source_id"]]) ) {
				$comArr[$row["source_id"]][$row["c_yyyy"]]	= $row["c_yyyy"];
				$f_end_dr = 0;  $f_end_cr = 0;
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
							WHERE a.c_mm={$mm} AND a.c_yyyy={$row["c_yyyy"]}-543
								AND b.dc_bank_acc_company_id = {$row["source_id"]};";
						
				$data_f_end	= $db->GetDataBySQL($sqll, array());
					
				if ( $data_f_end["f_end_dr"] >= 0 ) {
					$f_end_dr	= $data_f_end["f_end_dr"];
					$f_end_cr	= 0;
				} else if ( $data_f_end["f_end_dr"] < 0 ) {
					$f_end_dr	= 0;
					$f_end_cr	= $data_f_end["f_end_cr"];
				}
			}
			
			if($row["source_id"].$row["c_yyyy"].$row["c_mm"].$row["c_dd"] != @$s_dd) {
				$s_dd	= $row["source_id"].$row["c_yyyy"].$row["c_mm"].$row["c_dd"];
				$c_dd	= $row["c_dd"];
			} else { $c_dd	= ""; }
			
			
			if($row["c_cheque"] != @$s_cheque) {
				$s_cheque		= $row["c_cheque"];
				$c_cheque		= $row["c_cheque"];
			} else { $c_cheque	= ""; }
			
			$ArrDtl[$row["source_id"]]["company_code"]	= $row["company_code"];
			$ArrDtl[$row["source_id"]]["company_name"]	= $row["company_name"];
			$ArrDtl[$row["source_id"]]["c_name"]		= $date->s_month_thai[$mm]." ".($yyyy+543)." - ".$date->s_month_thai[$mm2]." ".($yyyy2+543);
			
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["c_yyyy"]		= $row["c_yyyy"];
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["f_end_dr"]		= $f_end_dr;
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["f_end_cr"]		= $f_end_cr;
			
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["c_mm"]	= $date->s_month_thai[$row["c_mm"]];

			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["c_dd"]		= $c_dd;
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["c_cheque"]	= $c_cheque;
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["c_name"]		= $row["c_name"];
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["f_dr"]		= $row["f_dr"];
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["f_cr"]		= $row["f_cr"];
			
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["f_diff"]		= $row["f_diff"]; 
		 	$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["the_i_type"]	= $row["i_type"];
			$ArrDtl[$row["source_id"]]["data"][$row["c_yyyy"]]["data"][$row["c_mm"]]["data"][$row["c_dd"]]["data"][$row["i_type"]]["data"][$row["c_cheque"]]["pk_id"]		= $row["pk_id"];
			
			
		};
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>$ArrDtl));
}
?>