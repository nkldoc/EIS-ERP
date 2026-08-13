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
	
	if($_REQUEST["dc_bank_acc_company_id"] > 0) {
		$conCheque .= " AND a.dc_bank_acc_company_id_source = ".$_REQUEST["dc_bank_acc_company_id"];
	}
	if($_REQUEST["date_start"] != "" && $_REQUEST["date_end"] != "") {
		$conDate	.= " AND a.d_save_jv_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
	}
	
	$sqlMain = "SET NOCOUNT ON
				/*================= (SUM) =================*/
				SELECT *, 1 AS i_type
				INTO #tb_cheque_sum
				FROM ( SELECT
					1 AS row_bank
					,a.gl_bank_id AS pk_id
					,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_cheque_date
					,b.c_ref_doc AS c_cheque
					,'สมุดรายวันทั่วไป' AS c_name
					,SUM(a.f_money) AS f_dr
					, 0.00 AS f_cr
				FROM gl_bank a
					LEFT JOIN gl_tran_hdr b ON a.gl_tran_hdr_id_bank_id = b.gl_tran_hdr_id
				WHERE a.c_code IS NOT NULL
					AND a.i_enable = ".STATUS_ENABLE."
					{$conCheque}
					{$conDate}
				GROUP BY a.gl_bank_id, b.c_ref_doc, a.d_save_jv_date ) a

				/*==========================================*/
				SELECT *, 2 AS i_type
				INTO #tb_cheque
				FROM ( SELECT
					ROW_NUMBER() OVER (PARTITION BY a.gl_bank_id ORDER BY c.c_cheque) row_bank
					,a.gl_bank_id AS pk_id
					,CONVERT(VARCHAR, a.d_save_jv_date, 120) AS d_cheque_date
					,c.c_cheque
					,'สมุดรายวันเงินจ่าย' AS c_name
					,0.00 AS f_dr
					,SUM(ISNULL(b.f_cheque,0)) AS f_cr
				FROM gl_bank a
					INNER JOIN gl_bank_cheque b ON a.gl_bank_id = b.gl_bank_id
					LEFT JOIN dc_cheque c ON b.dc_cheque_id = c.dc_cheque_id
				WHERE a.c_code IS NOT NULL
					AND a.i_enable = ".STATUS_ENABLE."
					{$conCheque}
					{$conDate}
				GROUP BY a.gl_bank_id, c.c_cheque, a.d_save_jv_date ) a
				ORDER BY a.pk_id ,a.c_cheque

				SELECT * 
				INTO #cheque FROM
				(SELECT
					ROW_NUMBER() OVER (PARTITION BY YEAR(a.d_cheque_date)+''+MONTH(a.d_cheque_date)+''+DAY(a.d_cheque_date) ORDER BY a.d_cheque_date, a.pk_id, a.i_type DESC) row_day
					,ROW_NUMBER() OVER (PARTITION BY YEAR(a.d_cheque_date)+''+MONTH(a.d_cheque_date) ORDER BY a.d_cheque_date, a.pk_id, a.i_type DESC) row_month
					,ROW_NUMBER() OVER (PARTITION BY YEAR(a.d_cheque_date) ORDER BY a.d_cheque_date, a.pk_id, a.i_type DESC) row_year
					,RIGHT('0'+CAST(DAY(a.d_cheque_date) AS varchar(2)) ,2) AS c_dd
					,RIGHT('0'+CAST(MONTH(a.d_cheque_date) AS varchar(2)) ,2) AS c_mm
					,YEAR(a.d_cheque_date)+543 c_yyyy
					,*
				FROM #tb_cheque_sum a
				UNION ALL
				SELECT
					'' AS row_day
					,'' AS row_month
					,'' AS row_year
					,'' AS c_dd
					,'' AS c_mm
					,'' AS c_yyyy
					,*
				FROM #tb_cheque b ) a
				ORDER BY a.d_cheque_date, a.pk_id, a.i_type;
						
				SELECT * FROM #cheque
				ORDER BY d_cheque_date, pk_id, row_bank, i_type, c_cheque, row_year, row_month, row_day;";
	
	$arrParam[]	= "";

	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {
		
		$sum_dr		= 0;
		$sum_cr		= 0;
		// ยอดยกมา
		$date_start				= date( "Y-m-d", strtotime( "{$_REQUEST["date_start"]} -1 month" ) );
		list($yyyy,$mm,$dd)		= explode("-", $date_start);
		list($yyyy2,$mm2,$dd2)	= explode("-", $_REQUEST["date_end"]);
	 	
		$f_end_dr = 0;  $f_end_cr = 0;
		$data_f_end	= $db->GetDataBySQL("SELECT
											SUM(ISNULL(aa.f_end_dr,0)-ISNULL(aa.f_end_cr,0)) AS f_end_dr
											,SUM(ISNULL(aa.f_end_cr,0)-ISNULL(aa.f_end_dr,0)) AS f_end_cr 
										FROM gl_balance_cost aa
										WHERE
										(
										aa.dc_acc_id IN (
											SELECT b.dc_acc_id FROM gl_bank a
												INNER JOIN dc_bank_acc_company b ON a.dc_bank_acc_company_id_source = b.dc_bank_acc_company_id
											WHERE 1=1 {$conCheque} )
										) AND aa.c_mm={$mm} AND aa.c_yyyy={$yyyy};", array());
 
		if ( $data_f_end["f_end_dr"] >= 0 ) {
				$f_end_dr = $data_f_end["f_end_dr"];
				$f_end_cr = 0;
		} else if ( $data_f_end["f_end_dr"] < 0 ) {
				$f_end_dr = 0;
				$f_end_cr = $data_f_end["f_end_cr"]; 
		}
										
		while($row = $db->Fetch($stmt)) {

			if($row["row_year"] == 1) {
				$temp = array(
						"i_type"	=> 3,
						"numrow"	=> ++$totalCount,
						"c_yyyy"	=> $row["c_yyyy"],
						"f_begin_show_dr"	=> number_format($f_end_dr,2),
						"f_begin_show_cr"	=> number_format($f_end_cr,2)
						);
				${$root}[] = $temp;
			}
			
			$temp = array(	"i_type"				=> $row["i_type"],
							"numrow"				=> ++$totalCount,
							"d_cheque_date"			=> ($row["i_type"] == 1)? $date->shot_date_from_db($row["d_cheque_date"]) : "",
							"c_yyyy"				=> ($row["row_year"] == 1)? $row["c_yyyy"] : "", 
							"c_mm"					=> ($row["row_month"] == 1)? $date->s_month_thai[$row["c_mm"]] : "",
							"c_dd"					=> ($row["row_day"] == 1)? $row["c_dd"] : "",
							"c_cheque"				=> $row["c_cheque"],
							"c_name"				=> ($row["row_bank"] == 1)? $row["c_name"] : "''",
							"f_dr"					=> ($row["i_type"] == 1)? number_format($row["f_dr"],2) : "",
							"f_cr"					=> ($row["i_type"] == 1)? "" : number_format($row["f_cr"],2)
			);
			${$root}[] = $temp;
			
			$sum_dr	+= $row["f_dr"];
			$sum_cr	+= $row["f_cr"];
		};
		
		if ( $data_f_end["f_end_dr"] >=0 ) { 
			$f_cal_end		= ($data_f_end["f_end_dr"] + $sum_dr ) - $sum_cr;
		} else if ( $data_f_end["f_end_dr"] < 0 ) {
			$f_prepare_cal	= -1 * $data_f_end["f_end_cr"];
			$f_cal_end		= ($f_prepare_cal + $sum_dr ) - $sum_cr;
		}
			
		$temp = array(	"i_type"				=> 4,
						"numrow"				=> ++$totalCount,
						"c_name"				=> "รวมเดือน",
						"f_dr"					=> number_format($sum_dr,2),
						"f_cr"					=> number_format($sum_cr,2),
						"f_cal_end"				=> number_format($f_cal_end,2),
						"c_name2"				=> "ยอดยกมา",
						"f_dr2"					=> number_format($f_end_dr,2),
						"f_cr2"					=> number_format($f_end_cr,2),
						"c_name3"				=> $date->s_month_thai[$mm]." ".($yyyy+543)." - ".$date->s_month_thai[$mm2]." ".($yyyy2+543),
						"f_dr3"					=> number_format($sum_dr+$f_end_dr,2),
						"f_cr3"					=> number_format($sum_cr+$f_end_cr,2) 
		);
		${$root}[] = $temp;
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
