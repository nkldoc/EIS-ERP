<?php
include ("../../conf/config.php");
include ("../../lib/database/DatabaseServer.php");
include ("../../lib/date/i_date.class.php");
include ("../../gl/conf/configGl.php");

$db = new DatabaseServer ();
$date = new i_date ();

$root = "data";
$data = array ();
$con = null;
function List_QueryParam() {
	
	global $db, $date, $root, $data, $con, $arr_status;
	
	$totalCount = 0;
	
	$for_id = explode ( ";", $_REQUEST ["dc_cost_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND a.dc_cost_acc_id IN (" . $in . ")" : "";
		}
	}


	if ($_REQUEST ["i_show_acc"] == 2) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv2"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_lv2_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST ["i_show_acc"] == 3) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv3"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_lv3_id IN (" . $in . ")" : "";
			}
		}
	}
	else if ($_REQUEST ["i_show_acc"] == 4) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv4"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_lv4_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST ["i_show_acc"] == 5) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent_lv5"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_lv5_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST ["i_show_acc"] == 6){
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND b.dc_acc_id IN (" . $in . ")" : "";
			}
		}
	}

	if($_REQUEST["PAGE"] == "GlRep00017") {
		/*
		,b.dc_acc_lv2_id
							,b.c_code_lv2
							,b.c_name_lv2
							,b.dc_acc_lv3_id
							,b.c_code_lv3
							,b.c_name_lv3	

		,b.dc_acc_lv2_id, b.c_code_lv2, b.c_name_lv2
							,b.dc_acc_lv3_id, b.c_code_lv3, b.c_name_lv3	
							

					,(SELECT SUM(aa.f_money_lv6) FROM #tempData aa WHERE aa.dc_acc_lv2_id = a.dc_acc_lv2_id) AS f_money_lv2
					,(SELECT SUM(aa.f_money_lv6) FROM #tempData aa WHERE aa.dc_acc_lv3_id = a.dc_acc_lv3_id) AS f_money_lv3							
		*/
		$TABLE		= "	SELECT
							b.i_group
							,b.dc_acc_lv1_id
							,b.c_code_lv1
							,b.c_name_lv1
																				
							,b.dc_acc_lv4_id
							,b.c_code_lv4
							,b.c_name_lv4
							,b.dc_acc_lv5_id
							,b.c_code_lv5
							,b.c_name_lv5
							,b.dc_acc_id AS dc_acc_lv6_id
							,b.c_code AS c_code_lv6
							,b.c_name AS c_name_lv6
							,CASE
								WHEN b.i_group = 4 THEN SUM(ISNULL(a.f_end_cr,0) - ISNULL(a.f_end_dr,0))
								ELSE SUM(ISNULL(a.f_end_dr,0) - ISNULL(a.f_end_cr,0))
							END AS f_money_lv6
						INTO #tempData
						FROM gl_balance_cost a
							INNER JOIN vw_dc_acc_with_parent b ON a.dc_acc_id = b.dc_acc_id
						WHERE b.i_enable = ".STATUS_ENABLE."
							AND a.i_is_close_year = ".GL_CLOSE_YEAR_NONE."
							AND a.i_is_post = ".BOOK_ACC_GL."
							AND b.i_group IN (".GL_ACC_GROUP4_REVENUE.",".GL_ACC_GROUP5_EXPENSE.")
							AND a.c_yyyy_mm = @c_yyyy_mm
							{$con}
						GROUP BY b.i_group
							,b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1
							 
							,b.dc_acc_lv4_id, b.c_code_lv4, b.c_name_lv4
							,b.dc_acc_lv5_id, b.c_code_lv5, b.c_name_lv5
							,b.dc_acc_id, b.c_code, b.c_name
						ORDER BY
							 b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1
							
							,b.dc_acc_lv4_id, b.c_code_lv4, b.c_name_lv4
							,b.dc_acc_lv5_id, b.c_code_lv5, b.c_name_lv5
							,b.dc_acc_id, b.c_code, b.c_name;";
		
	} else if($_REQUEST["PAGE"] == "GlRep00018") {
				
		$TABLE		= "	SELECT
							b.i_group
							,b.dc_acc_lv1_id
							,b.c_code_lv1
							,b.c_name_lv1
							 
							,b.dc_acc_lv4_id
							,b.c_code_lv4
							,b.c_name_lv4
							,b.dc_acc_lv5_id
							,b.c_code_lv5
							,b.c_name_lv5
							,b.dc_acc_id AS dc_acc_lv6_id
							,b.c_code AS c_code_lv6
							,b.c_name AS c_name_lv6
							,CASE 
								WHEN b.i_group = 1 THEN SUM(ISNULL(a.f_end_dr,0) - ISNULL(a.f_end_cr,0)) 
								WHEN b.i_group = 2 THEN SUM(ISNULL(a.f_end_cr,0) - ISNULL(a.f_end_dr,0))
								WHEN b.i_group = 3 THEN
									CASE
										WHEN (b.dc_acc_id = @dc_acc_special2) THEN (
											SELECT
												SUM(ISNULL(aa.f_end_cr,0) - ISNULL(aa.f_end_dr,0))
											FROM gl_balance_cost aa
											WHERE aa.dc_acc_id = @dc_acc_special2
												AND aa.c_yyyy_mm = @c_yyyy_mm
												AND aa.i_is_close_year = ".GL_CLOSE_YEAR_NONE."
												AND aa.i_is_post = 3 )
										WHEN (b.dc_acc_id = @dc_acc_special) THEN (
											SELECT
												SUM(ISNULL(bb.f_dr,0) - ISNULL(bb.f_cr,0))
											FROM gl_tran_hdr aa
												INNER JOIN gl_tran_dtl bb ON aa.gl_tran_hdr_id = bb.gl_tran_hdr_id
											WHERE aa.i_is_close_year = ".GL_CLOSE_YEAR_PERIOD."
												AND aa.i_close_year_type = 3
												AND aa.c_yyyy_mm = @c_yyyy_mm
												AND aa.i_is_post = 3
												AND aa.i_enable = ".STATUS_ENABLE."
												AND bb.dc_acc_id = @dc_acc_special )
										ELSE SUM(ISNULL(a.f_end_cr,0) - ISNULL(a.f_end_dr,0)) 
									END
								ELSE 0 
							 END AS f_money_lv6
						INTO #tempData
						FROM gl_balance_cost a
							INNER JOIN vw_dc_acc_with_parent b ON a.dc_acc_id = b.dc_acc_id
						WHERE b.i_enable = ".STATUS_ENABLE."
							AND a.i_is_close_year = ".GL_CLOSE_YEAR_PERIOD."
							AND a.i_is_post = ".BOOK_ACC_GL."
							AND b.i_group IN (".GL_ACC_GROUP1_ASSET.",".GL_ACC_GROUP2_DEBT.",".GL_ACC_GROUP3_SHARE.")
							AND a.c_yyyy_mm = @c_yyyy_mm
							{$con}
						GROUP BY b.i_group
							,b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1 

							,b.dc_acc_lv4_id, b.c_code_lv4, b.c_name_lv4
							,b.dc_acc_lv5_id, b.c_code_lv5, b.c_name_lv5
							,b.dc_acc_id, b.c_code, b.c_name
						ORDER BY
							 b.dc_acc_lv1_id, b.c_code_lv1, b.c_name_lv1 

							,b.dc_acc_lv4_id, b.c_code_lv4, b.c_name_lv4
							,b.dc_acc_lv5_id, b.c_code_lv5, b.c_name_lv5
							,b.dc_acc_id, b.c_code, b.c_name;
					

					
					";

	}
	
	$sqlMain = "DECLARE @c_yyyy_mm varchar(6)	= '{$_REQUEST["year_start"]}09';
				DECLARE	@dc_acc_special INT		= 513; 
				DECLARE	@dc_acc_special2 INT	= 506;
			
				SET NOCOUNT ON
				{$TABLE}
							
				SELECT
					a.*
					,(SELECT SUM(aa.f_money_lv6) FROM #tempData aa WHERE aa.dc_acc_lv1_id = a.dc_acc_lv1_id) AS f_money_lv1
					,(SELECT SUM(aa.f_money_lv6) FROM #tempData aa WHERE aa.dc_acc_lv4_id = a.dc_acc_lv4_id) AS f_money_lv4
					,(SELECT SUM(aa.f_money_lv6) FROM #tempData aa WHERE aa.dc_acc_lv5_id = a.dc_acc_lv5_id) AS f_money_lv5
				FROM #tempData a;";
	
	$arrParam	= array();
 
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );

	if ($stmt) {
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			$Arr [$row ["dc_acc_lv1_id"]] ["i_group"]		= $row ["i_group"];
			$Arr [$row ["dc_acc_lv1_id"]] ["c_code_lv1"]	= $row ["c_code_lv1"];
			$Arr [$row ["dc_acc_lv1_id"]] ["c_name_lv1"]	= $row ["c_name_lv1"];
			$Arr [$row ["dc_acc_lv1_id"]] ["f_money_lv1"]	= $row ["f_money_lv1"];

			// // LV2
			// $Arr [$row ["dc_acc_lv1_id"]] ["data_lv2"] [$row ["dc_acc_lv2_id"]] ["c_code_lv2"]		= $row ["c_code_lv2"];
			// $Arr [$row ["dc_acc_lv1_id"]] ["data_lv2"] [$row ["dc_acc_lv2_id"]] ["c_name_lv2"]		= $row ["c_name_lv2"];
			// $Arr [$row ["dc_acc_lv1_id"]] ["data_lv2"] [$row ["dc_acc_lv2_id"]] ["f_money_lv2"]		= $row ["f_money_lv2"];

			// // LV3
			// $Arr [$row ["dc_acc_lv1_id"]] ["data_lv3"] [$row ["dc_acc_lv3_id"]] ["c_code_lv3"]		= $row ["c_code_lv3"];
			// $Arr [$row ["dc_acc_lv1_id"]] ["data_lv3"] [$row ["dc_acc_lv3_id"]] ["c_name_lv3"]		= $row ["c_name_lv3"];
			// $Arr [$row ["dc_acc_lv1_id"]] ["data_lv3"] [$row ["dc_acc_lv3_id"]] ["f_money_lv3"]		= $row ["f_money_lv3"];
			
			// LV4
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv4"] [$row ["dc_acc_lv4_id"]] ["c_code_lv4"]		= $row ["c_code_lv4"];
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv4"] [$row ["dc_acc_lv4_id"]] ["c_name_lv4"]		= $row ["c_name_lv4"];
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv4"] [$row ["dc_acc_lv4_id"]] ["f_money_lv4"]		= $row ["f_money_lv4"];
			// LV5
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv5"] [$row ["dc_acc_lv5_id"]] ["c_code_lv5"]		= $row ["c_code_lv5"];
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv5"] [$row ["dc_acc_lv5_id"]] ["c_name_lv5"]		= $row ["c_name_lv5"];
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv5"] [$row ["dc_acc_lv5_id"]] ["f_money_lv5"]		= $row ["f_money_lv5"];
			// LV6
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv6"] [$row ["dc_acc_lv6_id"]] ["c_code_lv6"]		= $row ["c_code_lv6"];
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv6"] [$row ["dc_acc_lv6_id"]] ["c_name_lv6"]		= $row ["c_name_lv6"];
			$Arr [$row ["dc_acc_lv1_id"]] ["data_lv6"] [$row ["dc_acc_lv6_id"]] ["f_money_lv6"]		= $row ["f_money_lv6"];
		}
		
		if (isset ( $Arr )) {
			$f_money	= 0;
			foreach ( $Arr as $lv1_id => $obj_lv1 ) {
				
				$no		= 0;
				
				$temp = array (
						"i_type"			=> 1  
						,"c_code"			=> $obj_lv1 ["c_code_lv1"]
						,"c_name"			=> $obj_lv1 ["c_name_lv1"]
						,"f_money"			=> "" 
				);
				
				${$root} [] = $temp;
				// if ($_REQUEST ["i_show_acc"] == 2) {
				// 	// LV2
				// 	foreach ( $obj_lv1 ["data_lv2"] as $lv2_id => $obj_lv2 ) {
						
				// 		$temp = array (
				// 				"i_type"			=> 2
				// 				,"no"				=> ++$no
				// 				,"c_code"			=> $obj_lv2 ["c_code_lv2"]
				// 				,"c_name"			=> $obj_lv2 ["c_name_lv2"]
				// 				,"f_money"			=> $obj_lv2 ["f_money_lv2"]
				// 				,"i_group"			=> $obj_lv1 ["i_group"]
				// 		);
				
				// 		${$root} [] = $temp;
				// 	}
				// }
				// else if ($_REQUEST ["i_show_acc"] == 3) {
				// 	// LV3
				// 	foreach ( $obj_lv1 ["data_lv3"] as $lv3_id => $obj_lv3 ) {
						
				// 		$temp = array (
				// 				"i_type"			=> 3
				// 				,"no"				=> ++$no
				// 				,"c_code"			=> $obj_lv3 ["c_code_lv3"]
				// 				,"c_name"			=> $obj_lv3 ["c_name_lv3"]
				// 				,"f_money"			=> $obj_lv3 ["f_money_lv3"]
				// 				,"i_group"			=> $obj_lv1 ["i_group"]
				// 		);
				
				// 		${$root} [] = $temp;
				// 	}
				// }	else			
				 
				if ($_REQUEST ["i_show_acc"] == 4) {
					// LV4
					foreach ( $obj_lv1 ["data_lv4"] as $lv4_id => $obj_lv4 ) {
						
						$temp = array (
								"i_type"			=> 4
								,"no"				=> ++$no
								,"c_code"			=> $obj_lv4 ["c_code_lv4"]
								,"c_name"			=> $obj_lv4 ["c_name_lv4"]
								,"f_money"			=> $obj_lv4 ["f_money_lv4"]
								,"i_group"			=> $obj_lv1 ["i_group"]
						);
				
						${$root} [] = $temp;
					}
				} else if ($_REQUEST ["i_show_acc"] == 5) {
					// LV5
					foreach ( $obj_lv1 ["data_lv5"] as $lv5_id => $obj_lv5 ) {

						$temp = array (
								"i_type"			=> 5
								,"no"				=> ++$no
								,"c_code"			=> $obj_lv5 ["c_code_lv5"]
								,"c_name"			=> $obj_lv5 ["c_name_lv5"]
								,"f_money"			=> $obj_lv5 ["f_money_lv5"]
								,"i_group"			=> $obj_lv1 ["i_group"]
						);
				
						${$root} [] = $temp;
					}
				} else if ($_REQUEST ["i_show_acc"] == 6) {
					// LV6
					foreach ( $obj_lv1 ["data_lv6"] as $lv6_id => $obj_lv6 ) {

						$temp = array (
								"i_type"			=> 6
								,"no"				=> ++$no
								,"c_code"			=> $obj_lv6 ["c_code_lv6"]
								,"c_name"			=> $obj_lv6 ["c_name_lv6"]
								,"f_money"			=> $obj_lv6 ["f_money_lv6"]
								,"i_group"			=> $obj_lv1 ["i_group"]
						);
				
						${$root} [] = $temp;
					}
				}
				
				$temp = array (
						"i_type"			=> 8 
						,"c_code"			=> $obj_lv1 ["c_code_lv1"]
						,"c_name"			=> "รวม".$obj_lv1 ["c_name_lv1"]
						,"f_money"			=> $obj_lv1 ["f_money_lv1"]
						,"i_group"			=> $obj_lv1 ["i_group"]
						
				);
				
 		
				${$root} [] = $temp;
				
				if($obj_lv1["i_group"] == 2) {
					$f_money	+= $obj_lv1["f_money_lv1"];
				} else if($obj_lv1["i_group"] == 3) {
					$f_money	+= $obj_lv1["f_money_lv1"];
				} else if($obj_lv1["i_group"] == 4) {
					$f_money	+= $obj_lv1["f_money_lv1"];
				} else if($obj_lv1["i_group"] == 5) {
					$f_money	-= $obj_lv1["f_money_lv1"];
				}
			}
			
			$temp = array (
					"i_type"			=> 9
					,"c_name"			=> ($_REQUEST["PAGE"] == "GlRep00017")? "รายได้สูง(ต่ำ)กว่าค่าใช้จ่าย" : "รวมหนี้สินและส่วนของผู้ถือหุ้น"
					,"f_money"			=> $f_money
			);
		 
			${$root} [] = $temp;
		}
	}
	
	return json_encode ( array ( "debug" => true, "totalCount" => $totalCount, $root => ${$root} ) );
}
?>
