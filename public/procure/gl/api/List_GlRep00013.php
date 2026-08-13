<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db = new DatabaseServer ();
$date = new i_date ();

$root = "data";
$data = array ();
$con = null;

function List_QueryParam() {
	
	global $db, $date, $root, $data, $con, $arr_status;
	
	$totalCount = 0;
	
	$for_id = explode ( ";", $_REQUEST ["dc_bank_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_bank_id IN (" . $in . ")" : "";
		}
	}
	
	$for_id = explode ( ";", $_REQUEST ["dc_bank_acc_company_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND b.dc_bank_acc_company_id IN (" . $in . ")" : "";
		}
	}
  
	$conDate = $conBookGL = "";
	if($_REQUEST["date_start"] != "" && $_REQUEST["date_end"] != "") {
		$conDate	.= " aa.d_save_date between '{$_REQUEST["date_start"]}' and '{$_REQUEST["date_end"]}' ";
	}
	
	if($_REQUEST["i_book_type"] != 4){
		$conBookGL .= " AND aa.gl_dc_book_type_id = ".$_REQUEST["i_book_type"];
	} 
	
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
				WHERE a.i_enable = ".STATUS_ENABLE."
					AND a.i_delete = ".DELETE_FALSE."
					AND b.i_enable = ".STATUS_ENABLE."
					AND b.i_delete = ".DELETE_FALSE."
					AND c.i_enable = ".STATUS_ENABLE."
					AND c.i_delete = ".DELETE_FALSE."
					{$con}
				) a
				
				SELECT SUM(mm.f_end_dr)-SUM(mm.f_end_cr) AS f_money_begin,mm.dc_acc_id
				INTO #temp_money_begin
				FROM vw_gl_balance_cost mm INNER JOIN #temp_data dd ON mm.dc_acc_id = dd.dc_acc_id
				WHERE c_mm=(CASE WHEN 1=@mm_s THEN 12 ELSE @mm_s-1 END) 
						and c_yyyy=(CASE WHEN 1=@mm_s THEN @yyyy_s-1 ELSE @yyyy_s END) 
						and i_is_post=".BOOK_ACC_GL." and i_is_close_year=".GL_CLOSE_YEAR_NONE."
				GROUP BY mm.dc_acc_id;
  	
				SELECT SUM(bb.f_dr) as f_money_dr,SUM(bb.f_cr) as f_money_cr,cc.dc_acc_id,cc.i_type
				INTO #temp_money_period
				FROM gl_tran_hdr aa inner join gl_tran_dtl bb ON aa.gl_tran_hdr_id=bb.gl_tran_hdr_id
					inner join #temp_data cc ON cc.dc_acc_id=bb.dc_acc_id
				WHERE ".$conDate." ".$conBookGL."
					and aa.i_is_post>".BOOK_ACC_NOT_POST." and aa.i_enable=1 and aa.i_is_close_year=".GL_CLOSE_YEAR_NONE."
				GROUP BY cc.dc_acc_id,cc.i_type;
				
				SELECT aaa.dc_acc_id
					,(SELECT SUM(f_money_begin) FROM #temp_money_begin bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id) as deposit_balance_1 
					,(SELECT SUM(f_money_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=1 and bbb.i_type=aaa.i_type) as deposit_1
					,(SELECT SUM(f_money_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=1 and bbb.i_type=aaa.i_type) as withdraw_1
					,(SELECT SUM(f_money_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=2 and bbb.i_type=aaa.i_type) as deposit_2
					,(SELECT SUM(f_money_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=2 and bbb.i_type=aaa.i_type) as withdraw_2
					,(SELECT SUM(f_money_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=3 and bbb.i_type=aaa.i_type) as deposit_3
					,(SELECT SUM(f_money_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=3 and bbb.i_type=aaa.i_type) as withdraw_3
					,(SELECT SUM(f_money_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=4 and bbb.i_type=aaa.i_type) as deposit_4
					,(SELECT SUM(f_money_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=4 and bbb.i_type=aaa.i_type) as withdraw_4
					,(SELECT SUM(f_money_dr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=5 and bbb.i_type=aaa.i_type) as deposit_5
					,(SELECT SUM(f_money_cr) FROM #temp_money_period bbb WHERE bbb.dc_acc_id=aaa.dc_acc_id and bbb.i_type=5 and bbb.i_type=aaa.i_type) as withdraw_5  
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
				ORDER BY i_type, dc_bank_id;";
		
	$arrParam	= array();
 
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	//echo $sqlMain;exit;
	if ($stmt) {
		
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["dc_bank_name"]			= $row ["dc_bank_name"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["dc_bank_deposit_type"]	= $row["dc_bank_deposit_type"];
			
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["dc_bank_acc_company_code"]		= $row ["dc_bank_acc_company_code"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["dc_bank_acc_company_name"]		= $row ["dc_bank_acc_company_name"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["deposit_balance_1"]				= $row ["deposit_balance_1"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["deposit_1"]						= $row ["deposit_1"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["withdraw_1"]					= $row ["withdraw_1"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["deposit_2"]						= $row ["deposit_2"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["withdraw_2"]					= $row ["withdraw_2"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["deposit_3"]						= $row ["deposit_3"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["withdraw_3"]					= $row ["withdraw_3"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["deposit_4"]						= $row ["deposit_4"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["withdraw_4"]					= $row ["withdraw_4"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["deposit_5"]						= $row ["deposit_5"];
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["withdraw_5"]					= $row ["withdraw_5"];			
			$ArrBank [$row["i_type"]] [$row ["dc_bank_id"]] ["data"] [$row["dc_bank_acc_company_id"]] ["deposit_balance_2"]				= $row ["deposit_balance_2"];
		}
		
		if (isset ( $ArrBank )) {
			
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
			
			foreach ( $ArrBank as $i_type => $obj_type ) {
				
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

				foreach ( $obj_type as $dc_bank_id => $obj_bank ) {

					$temp = array (
						"i_type"	=> 1,
						"c_name"	=> "ธนาคาร".$obj_bank ["dc_bank_name"]." ประเภท".$obj_bank ["dc_bank_deposit_type"]							
					);
			
					${$root} [] = $temp;
					
					foreach ( $obj_bank ["data"] as $dc_bank_acc_company_id => $obj_company ) {
						
						$temp = array (
								"i_type"				=> 2,
								"c_code" 				=> $obj_company ["dc_bank_acc_company_code"],
								"c_name" 				=> $obj_company ["dc_bank_acc_company_name"],
								"deposit_balance_1"		=> ($obj_company ["deposit_balance_1"] > 0)? number_format($obj_company ["deposit_balance_1"],2) : "-",
								"deposit_1"				=> ($obj_company ["deposit_1"] > 0)? number_format($obj_company ["deposit_1"],2) : "-",
								"withdraw_1"			=> ($obj_company ["withdraw_1"] > 0)? number_format($obj_company ["withdraw_1"],2) : "-",
								"deposit_2"				=> ($obj_company ["deposit_2"] > 0)? number_format($obj_company ["deposit_2"],2) : "-",
								"withdraw_2"			=> ($obj_company ["withdraw_2"] > 0)? number_format($obj_company ["withdraw_2"],2) : "-",
								"deposit_3"				=> ($obj_company ["deposit_3"] > 0)? number_format($obj_company ["deposit_3"],2) : "-",
								"withdraw_3"			=> ($obj_company ["withdraw_3"] > 0)? number_format($obj_company ["withdraw_3"],2) : "-",
								"deposit_4"				=> ($obj_company ["deposit_4"] > 0)? number_format($obj_company ["deposit_4"],2) : "-",
								"withdraw_4"			=> ($obj_company ["withdraw_4"] > 0)? number_format($obj_company ["withdraw_4"],2) : "-",
								"deposit_5"				=> ($obj_company ["deposit_5"] > 0)? number_format($obj_company ["deposit_5"],2) : "-",
								"withdraw_5"			=> ($obj_company ["withdraw_5"] > 0)? number_format($obj_company ["withdraw_5"],2) : "-",
								"deposit_balance_2"		=> ($obj_company ["deposit_balance_2"] > 0)? number_format($obj_company ["deposit_balance_2"],2) : "-", 
						);
						${$root} [] = $temp;

						$deposit_balance_1		+= $obj_company ["deposit_balance_1"];
						$deposit_1				+= $obj_company ["deposit_1"];
						$withdraw_1				+= $obj_company ["withdraw_1"];
						$deposit_2				+= $obj_company ["deposit_2"];
						$withdraw_2				+= $obj_company ["withdraw_2"];
						$deposit_3				+= $obj_company ["deposit_3"];
						$withdraw_3				+= $obj_company ["withdraw_3"];
						$deposit_4				+= $obj_company ["deposit_4"];
						$withdraw_4				+= $obj_company ["withdraw_4"];
						$deposit_5				+= $obj_company ["deposit_5"];
						$withdraw_5				+= $obj_company ["withdraw_5"]; 
						$deposit_balance_2		+= $obj_company ["deposit_balance_2"];
						
						$sum_deposit_balance_1		+= $obj_company ["deposit_balance_1"];
						$sum_deposit_1				+= $obj_company ["deposit_1"];
						$sum_withdraw_1				+= $obj_company ["withdraw_1"];
						$sum_deposit_2				+= $obj_company ["deposit_2"];
						$sum_withdraw_2				+= $obj_company ["withdraw_2"];
						$sum_deposit_3				+= $obj_company ["deposit_3"];
						$sum_withdraw_3				+= $obj_company ["withdraw_3"];
						$sum_deposit_4				+= $obj_company ["deposit_4"];
						$sum_withdraw_4				+= $obj_company ["withdraw_4"];
						$sum_deposit_5				+= $obj_company ["deposit_5"];
						$sum_withdraw_5				+= $obj_company ["withdraw_5"]; 
						$sum_deposit_balance_2		+= $obj_company ["deposit_balance_2"];
					}
					
				}
				
				// SUM TYPE
				$temp = array (
						"i_type" 				=> 3,
						"c_name" 				=> "รวม ประเภท".$obj_bank["dc_bank_deposit_type"],
						"deposit_balance_1"		=> ($deposit_balance_1 > 0)? number_format($deposit_balance_1,2) : "-",
						"deposit_1"				=> ($deposit_1 > 0)? number_format($deposit_1,2) : "-",
						"withdraw_1"			=> ($withdraw_1 > 0)? number_format($withdraw_1,2) : "-",
						"deposit_2"				=> ($deposit_2 > 0)? number_format($deposit_2,2) : "-",
						"withdraw_2"			=> ($withdraw_2 > 0)? number_format($withdraw_2,2) : "-",
						"deposit_3"				=> ($deposit_3 > 0)? number_format($deposit_3,2) : "-",
						"withdraw_3"			=> ($withdraw_3 > 0)? number_format($withdraw_3,2) : "-",
						"deposit_4"				=> ($deposit_4 > 0)? number_format($deposit_4,2) : "-",
						"withdraw_4"			=> ($withdraw_4 > 0)? number_format($withdraw_4,2) : "-",						
						"deposit_5"				=> ($deposit_5 > 0)? number_format($deposit_5,2) : "-",
						"withdraw_5"			=> ($withdraw_5 > 0)? number_format($withdraw_5,2) : "-",						
						"deposit_balance_2"		=> ($deposit_balance_2 > 0)? number_format($deposit_balance_2,2) : "-", 
				);
				
				${$root} [] = $temp;
			}
			
			// SUM TOTAL
			$temp = array (
					"i_type" 				=> 4,
					"c_name" 				=> "รวมทั้งสิ้น",
					"deposit_balance_1"		=> ($sum_deposit_balance_1 > 0)? number_format($sum_deposit_balance_1,2) : "-",
					"deposit_1"				=> ($sum_deposit_1 > 0)? number_format($sum_deposit_1,2) : "-",
					"withdraw_1"			=> ($sum_withdraw_1 > 0)? number_format($sum_withdraw_1,2) : "-",
					"deposit_2"				=> ($sum_deposit_2 > 0)? number_format($sum_deposit_2,2) : "-",
					"withdraw_2"			=> ($sum_withdraw_2 > 0)? number_format($sum_withdraw_2,2) : "-",
					"deposit_3"				=> ($sum_deposit_3 > 0)? number_format($sum_deposit_3,2) : "-",
					"withdraw_3"			=> ($sum_withdraw_3 > 0)? number_format($sum_withdraw_3,2) : "-", 
					"deposit_4"				=> ($sum_deposit_4 > 0)? number_format($sum_deposit_4,2) : "-",
					"withdraw_4"			=> ($sum_withdraw_4 > 0)? number_format($sum_withdraw_4,2) : "-", 
					"deposit_5"				=> ($sum_deposit_5 > 0)? number_format($sum_deposit_5,2) : "-",
					"withdraw_5"			=> ($sum_withdraw_5 > 0)? number_format($sum_withdraw_5,2) : "-", 
					"deposit_balance_2"		=> ($sum_deposit_balance_2 > 0)? number_format($sum_deposit_balance_2,2) : "-",
			);
			
			${$root} [] = $temp;
		}
	}
	
	return json_encode ( array ( "debug" => true, "totalCount" => $totalCount, $root => ${$root} ) );
}
?>
