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
		$conCheque .= " AND a.dc_bank_acc_company_id = ".$_REQUEST["dc_bank_acc_company_id"];
	}
	if($_REQUEST["date_start"] != "" && $_REQUEST["date_end"] != "") {
		$conDate	.= " AND a.d_doc_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
	}
	if($_REQUEST["i_book_type"] != 4){
		$conCheque .= " AND a.i_book_type = ".$_REQUEST["i_book_type"];
	}
	
	$sqlMain = "SELECT DAY(a.d_doc_date) AS dd
					,RIGHT('0'+CAST(MONTH(a.d_doc_date) AS VARCHAR(2)), 2) AS mm
					,YEAR(a.d_doc_date)+543 AS yyyy
					,a.c_doc
					,CASE a.i_book_type WHEN 1 THEN 'สมุดรายวันรับ'  WHEN 3 THEN 'สมุดรายวันจ่าย'  ELSE 'สมุดรายวันทั่วไป' END AS c_book_type
					,b.f_dr AS f_dr
					,b.f_cr AS f_cr
				FROM imp_bank_account_detail_hdr a
					INNER JOIN imp_bank_account_detail_dtl b ON a.imp_bank_account_detail_hdr_id = b.imp_bank_account_detail_hdr_id
				WHERE a.i_enable = ".STATUS_ENABLE."
					{$conCheque}
					{$conDate}
				ORDER BY a.d_doc_date, a.c_doc, a.i_book_type DESC";
	
	$arrParam[]	= "";

	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	if( $stmt ) {
		$temp_yyyy	= "";
		$temp_mm 	= "";
		$temp_c_mm 	= "";
		$temp_dd	= "";
		$temp_c_dd 	= "";
		$temp_doc	= "";
		$temp_type	= "";
		$sum_dr		= 0;
		$sum_cr		= 0;
		
		while($row =$db->Fetch($stmt)) {

			if($temp_yyyy != $row["yyyy"]) {
				$temp = array(
						"i_type"	=> 2,
						"numrow"	=> ++$totalCount,
						"c_yyyy"	=> $row["yyyy"]);
				${$root}[] = $temp;
				$temp_yyyy = $row["yyyy"];
			}
			
			if ($temp_mm != $row["mm"]){
				$temp_mm 	= $row["mm"];
				$temp_c_mm 	= $date->s_month_thai[$row["mm"]];
				$temp_dd	= "";
				$temp_c_dd 	= "";
				$temp_doc	= "";
				$temp_type	= "";
			}else{
				$temp_c_mm 	= "";
			}
			
			if ($temp_dd != $row["dd"]){
				$temp_dd	= $row["dd"];
				$temp_c_dd 	= $row["dd"];
				$temp_doc	= "";
				$temp_type	= "";
			}else{
				$temp_c_dd 	= "";
			}
			
			if ($temp_doc != $row["c_doc"]){
				$temp_doc = $row["c_doc"];
				$str_doc = $row["c_doc"];
			}else{
				$str_doc = "";
			}
			
			if ($temp_type != $row["c_book_type"]){
				$temp_type = $row["c_book_type"];
				$str_type = $row["c_book_type"];
			}else{
				$str_type = "''";
			}
			
			$temp = array(	"i_type"				=> 1,
							"numrow"				=> ++$totalCount,
							"c_yyyy"				=> "",
							"c_mm"					=> $temp_c_mm,
							"c_dd"					=> $temp_c_dd,
							"c_cheque"				=> $str_doc,
							"c_name"				=> $str_type,
							"f_dr"					=> number_format($row["f_dr"],2),
							"f_cr"					=> number_format($row["f_cr"],2)
			);
			${$root}[] = $temp;
			
			$sum_dr	+= $row["f_dr"];
			$sum_cr	+= $row["f_cr"];
		}
		
		
		
		// ยอดยกมา
		$date_start		= date( "Y-m-d", strtotime( "{$_REQUEST["date_start"]} -1 month" ) );
		list($yyyy,$mm,$dd)		= explode("-", $date_start);
		list($yyyy2,$mm2,$dd2)	= explode("-", $_REQUEST["date_end"]);
		
		$f_cr	= $db->GetDataBySQL("	SELECT
											SUM(ISNULL(aa.f_dr,0)-ISNULL(aa.f_cr,0)) AS f_cr
										FROM gl_balance_cost aa
										WHERE
										aa.dc_acc_id IN (
											SELECT b.dc_acc_id FROM imp_bank_account_detail_hdr a
												INNER JOIN dc_bank_acc_company b ON a.dc_bank_acc_company_id = b.dc_bank_acc_company_id
											WHERE 1=1 {$conCheque} )
										AND aa.c_mm={$mm} AND aa.c_yyyy={$yyyy};", array());
		
		$temp = array(	"i_type"				=> 4,
						"numrow"				=> ++$totalCount,
						"c_name"				=> "รวมเดือน",
						"f_dr"					=> number_format($sum_dr,2),
						"f_cr"					=> number_format($sum_cr,2),
						"c_name2"				=> "ยอดยกมา",
						"f_dr2"					=> number_format($f_cr,2),
						"f_cr2"					=> number_format($f_cr,2),
						"c_name3"				=> $date->s_month_thai[$mm]." ".($yyyy+543)." - ".$date->s_month_thai[$mm2]." ".($yyyy2+543),
						"f_dr3"					=> number_format($sum_dr+$f_cr,2),
						"f_cr3"					=> number_format($sum_cr+$f_cr,2)
		);
		${$root}[] = $temp;
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}
?>
