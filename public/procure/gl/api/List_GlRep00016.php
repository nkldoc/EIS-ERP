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

	$c_year		= (string)(@$_REQUEST["year"]);
	$c_mm		= (string)sprintf("%02d%",@$_REQUEST["month"],"");
	
	// dc_cost
	$for_id = explode ( ";", $_REQUEST ["dc_cost_id"] );
	if (! in_array ( "0", $for_id )) {
		$in = "";
		if (is_array ( $for_id )) {
			foreach ( $for_id as $val ) {
				$in .= ($in == "") ? $val : ", " . $val;
			}
			$con .= ($in != "") ? " AND aa.dc_cost_id IN (" . $in . ")" : "";
		}
	}
	
	//dc_acc
	if ($_REQUEST ["i_show_acc"] == 1) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_id_parent"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.dc_acc_lv4_id IN (" . $in . ")" : "";
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
				$con .= ($in != "") ? " AND cc.dc_acc_lv5_id IN (" . $in . ")" : "";
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
				$con .= ($in != "") ? " AND cc.dc_acc_id IN (" . $in . ")" : "";
			}
		}
	}
	
	if($_REQUEST["i_show"] == 2) {
		$i_show	= "AND ((ISNULL(b.f_begin_dr,0)!=0) OR (ISNULL(f_begin_cr,0)!=0)
					OR (ISNULL(f_dr,0)!=0) OR (ISNULL(f_cr,0)!=0)
					OR (ISNULL(f_end_dr,0)!=0) OR (ISNULL(f_end_cr,0)!=0))";
	} else { $i_show = ""; }

	$sqlMain = "DECLARE @c_yyyy varchar(4) = '".$c_year."';
				DECLARE @c_mm varchar(2) = '".$c_mm."';
			
				SET NOCOUNT ON
				SELECT
					a.*
					,CASE WHEN SUM(b.f_begin_dr-b.f_begin_cr) > 0 THEN SUM(b.f_begin_dr-b.f_begin_cr) ELSE 0 END AS begin_dr
					,CASE WHEN SUM(b.f_begin_cr-b.f_begin_dr) > 0 THEN SUM(b.f_begin_cr-b.f_begin_dr) ELSE 0 END AS begin_cr
					,CASE WHEN SUM(b.f_dr) > 0 THEN SUM(b.f_dr) ELSE 0 END AS dr
					,CASE WHEN SUM(b.f_cr) > 0 THEN SUM(b.f_cr) ELSE 0 END AS cr
					,CASE WHEN SUM(b.f_end_dr-b.f_end_cr) > 0 THEN SUM(b.f_end_dr-b.f_end_cr) ELSE 0 END AS end_dr
					,CASE WHEN SUM(b.f_end_cr-b.f_end_dr) > 0 THEN SUM(b.f_end_cr-b.f_end_dr) ELSE 0 END AS end_cr
				FROM (
					SELECT
						aa.dc_cost_id AS cost_id
						,aa.c_code AS cost_code
						,aa.c_name AS cost_name
						,cc.dc_acc_lv4_id AS lv4_id
						,cc.c_code_lv4 AS code_lv4
						,cc.c_name_lv4 AS name_lv4
						,cc.dc_acc_lv5_id AS lv5_id
						,cc.c_code_lv5 AS code_lv5
						,cc.c_name_lv5 AS name_lv5
						,cc.dc_acc_id
						,cc.c_code
						,cc.c_name
					FROM dc_cost aa
						CROSS JOIN dc_acc bb
						LEFT JOIN vw_dc_acc_with_parent cc ON bb.dc_acc_id = cc.dc_acc_id
					WHERE bb.i_level = 6 AND aa.i_last = 1
						AND bb.i_delete = ".DELETE_FALSE."
						AND bb.i_enable = ".STATUS_ENABLE."
						{$con}
				) a
					LEFT JOIN (	SELECT * FROM gl_balance_cost aa
								WHERE aa.i_is_post=".BOOK_ACC_GL."
									AND aa.i_is_close_year = ".GL_CLOSE_YEAR_NONE."
									AND aa.c_yyyy = @c_yyyy
									AND aa.c_mm = @c_mm ) b
						ON a.cost_id = b.dc_cost_acc_id
						AND a.dc_acc_id = b.dc_acc_id
					WHERE 1=1 
						{$i_show}
				GROUP BY a.cost_id
						,a.cost_code
						,a.cost_name
						,a.lv4_id
						,a.code_lv4
						,a.name_lv4
						,a.lv5_id
						,a.code_lv5
						,a.name_lv5
						,a.dc_acc_id
						,a.c_code
						,a.c_name
				ORDER BY a.cost_code, a.code_lv4, a.code_lv5, a.c_code;";
		
	$arrParam	= array();
 
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	
	if ($stmt) {
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			if(@$ArrSum["begin_dr"]) { $ArrSum["begin_dr"] += $row["begin_dr"]; }
			else { $ArrSum["begin_dr"] = $row["begin_dr"]; }
			
			if(@$ArrSum["begin_cr"]) { $ArrSum["begin_cr"] += $row["begin_cr"]; }
			else { $ArrSum["begin_cr"] = $row["begin_cr"]; }
			
			if(@$ArrSum["dr"]) { $ArrSum["dr"] += $row["dr"]; }
			else { $ArrSum["dr"]	= $row["dr"]; }
			
			if(@$ArrSum["cr"]) { $ArrSum["cr"] += $row["cr"]; }
			else { $ArrSum["cr"] = $row["cr"]; }
			
			if(@$ArrSum["end_dr"]) { $ArrSum["end_dr"] += $row["end_dr"]; }
			else { $ArrSum["end_dr"] = $row["end_dr"]; }
			
			if(@$ArrSum["end_cr"]) { $ArrSum["end_cr"] += $row["end_cr"]; }
			else { $ArrSum["end_cr"] = $row["end_cr"]; }
			
			//======================== COST ========================//
			$Arr[$row["cost_id"]]["c_code"]			= $row ["cost_code"];
			$Arr[$row["cost_id"]]["c_name"]			= $row ["cost_name"];
			
			if($_REQUEST["i_show_cost"] == 1) {
				
				if(@$Arr[$row["cost_id"]]["begin_dr"]) { $Arr[$row["cost_id"]]["begin_dr"] += $row["begin_dr"]; }
				else { $Arr[$row["cost_id"]]["begin_dr"] = $row["begin_dr"]; }
				
				if(@$Arr[$row["cost_id"]]["begin_cr"]) { $Arr[$row["cost_id"]]["begin_cr"] += $row["begin_cr"]; }
				else { $Arr[$row["cost_id"]]["begin_cr"] = $row["begin_cr"]; }
				
				if(@$Arr[$row["cost_id"]]["dr"]) { $Arr[$row["cost_id"]]["dr"] += $row["dr"]; }
				else { $Arr[$row["cost_id"]]["dr"]	= $row["dr"]; }
				
				if(@$Arr[$row["cost_id"]]["cr"]) { $Arr[$row["cost_id"]]["cr"] += $row["cr"]; }
				else { $Arr[$row["cost_id"]]["cr"] = $row["cr"]; }
				
				if(@$Arr[$row["cost_id"]]["end_dr"]) { $Arr[$row["cost_id"]]["end_dr"] += $row["end_dr"]; }
				else { $Arr[$row["cost_id"]]["end_dr"] = $row["end_dr"]; }
				
				if(@$Arr[$row["cost_id"]]["end_cr"]) { $Arr[$row["cost_id"]]["end_cr"] += $row["end_cr"]; }
				else { $Arr[$row["cost_id"]]["end_cr"] = $row["end_cr"]; }
				
			}
			
			//======================== ACC LV 4 ========================//
			$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["c_code"]			= $row ["code_lv4"];
			$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["c_name"]			= $row ["name_lv4"];
				
			if ($_REQUEST ["i_show_acc"] == 1) {
				
				if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["begin_dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["begin_dr"] += $row["begin_dr"]; }
				else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["begin_dr"] = $row["begin_dr"]; }
					
				if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["begin_cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["begin_cr"] += $row["begin_cr"]; }
				else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["begin_cr"] = $row["begin_cr"]; }
					
				if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["dr"] += $row["dr"]; }
				else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["dr"]	= $row["dr"]; }
					
				if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["cr"] += $row["cr"]; }
				else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["cr"] = $row["cr"]; }
					
				if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["end_dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["end_dr"] += $row["end_dr"]; }
				else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["end_dr"] = $row["end_dr"]; }
					
				if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["end_cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["end_cr"] += $row["end_cr"]; }
				else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["end_cr"] = $row["end_cr"]; }
				
			} else {
				
				//======================== ACC LV 5 ========================//
				$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["c_code"]			= $row ["code_lv5"];
				$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["c_name"]			= $row ["name_lv5"];
				
				if ($_REQUEST ["i_show_acc"] == 3) {
						
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["begin_dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["begin_dr"] += $row["begin_dr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["begin_dr"] = $row["begin_dr"]; }
					
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["begin_cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["begin_cr"] += $row["begin_cr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["begin_cr"] = $row["begin_cr"]; }
					
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["dr"] += $row["dr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["dr"]	= $row["dr"]; }
					
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["cr"] += $row["cr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["cr"] = $row["cr"]; }
					
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["end_dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["end_dr"] += $row["end_dr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["end_dr"] = $row["end_dr"]; }
					
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["end_cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["end_cr"] += $row["end_cr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["end_cr"] = $row["end_cr"]; }
					
				} else {
				
					//======================== ACC LV 6 ========================//
					$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["c_code"]			= $row ["c_code"];
					$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["c_name"]			= $row ["c_name"];
				
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["begin_dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["begin_dr"] += $row["begin_dr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["begin_dr"] = $row["begin_dr"]; }
						
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["begin_cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["begin_cr"] += $row["begin_cr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["begin_cr"] = $row["begin_cr"]; }
						
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["dr"] += $row["dr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["dr"]	= $row["dr"]; }
						
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["cr"] += $row["cr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["cr"] = $row["cr"]; }
						
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["end_dr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["end_dr"] += $row["end_dr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["end_dr"] = $row["end_dr"]; }
						
					if(@$Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["end_cr"]) { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["end_cr"] += $row["end_cr"]; }
					else { $Arr[$row["cost_id"]]["data"][$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["dc_acc_id"]]["end_cr"] = $row["end_cr"]; }
				}
			}
		}
		
		if (isset ( $Arr )) {
			foreach ( $Arr as $dc_cost_id => $ArrCost ) {
				// Cost
				$temp	= array();
				
				$temp["i_type"] = 1;
				$temp["c_code"] = $ArrCost["c_code"];
				$temp["c_name"] = $ArrCost["c_name"];
				
				if($_REQUEST["i_show_cost"] == 1) {
					$temp["f_begin_dr"]	= number_format($ArrCost["begin_dr"],2);
					$temp["f_begin_cr"]	= number_format($ArrCost["begin_cr"],2);
					$temp["f_dr"]		= number_format($ArrCost["dr"],2);
					$temp["f_cr"]		= number_format($ArrCost["cr"],2);
					$temp["f_end_dr"]	= number_format($ArrCost["end_dr"],2);
					$temp["f_end_cr"] 	= number_format($ArrCost["end_cr"],2);
				} else {
					$temp["f_begin_dr"]	= "";
					$temp["f_begin_cr"]	= "";
					$temp["f_dr"]		= "";
					$temp["f_cr"]		= "";
					$temp["f_end_dr"]	= "";
					$temp["f_end_cr"] 	= "";
				}
				
				${$root} [] = $temp;
				
				if(is_array(@$ArrCost["data"])) {
					$lv4_no	= 0;
					foreach ( $ArrCost["data"] as $lv4_id => $ArrAccLv4 ) {
						// AccLv4
						$temp	= array();
						
						$temp["i_type"] = 2;
						$temp["no"] 	= ($_REQUEST["i_show_acc"] == 1)? ++$lv4_no : "";
						$temp["c_code"] = $ArrAccLv4["c_code"];
						$temp["c_name"] = $ArrAccLv4["c_name"];

						if($_REQUEST["i_show_acc"] == 1) {
							$temp["f_begin_dr"]	= number_format($ArrAccLv4["begin_dr"],2);
							$temp["f_begin_cr"]	= number_format($ArrAccLv4["begin_cr"],2);
							$temp["f_dr"]		= number_format($ArrAccLv4["dr"],2);
							$temp["f_cr"]		= number_format($ArrAccLv4["cr"],2);
							$temp["f_end_dr"]	= number_format($ArrAccLv4["end_dr"],2);
							$temp["f_end_cr"] 	= number_format($ArrAccLv4["end_cr"],2);
						} else {
							$temp["f_begin_dr"]	= "";
							$temp["f_begin_cr"]	= "";
							$temp["f_dr"]		= "";
							$temp["f_cr"]		= "";
							$temp["f_end_dr"]	= "";
							$temp["f_end_cr"] 	= "";
						}
							
						${$root} [] = $temp;
						
						if(is_array(@$ArrAccLv4["data"])) {
							$lv5_no	= 0;
							foreach ( $ArrAccLv4["data"] as $lv5_id => $ArrAccLv5 ) {
								// AccLv5
								$temp	= array();
								
								$temp["i_type"] = 3;
								$temp["no"] 	= ($_REQUEST["i_show_acc"] == 3)? ++$lv5_no : "";
								$temp["c_code"] = $ArrAccLv5["c_code"];
								$temp["c_name"] = $ArrAccLv5["c_name"];
		
								if($_REQUEST["i_show_acc"] == 3) {
									$temp["f_begin_dr"]	= number_format($ArrAccLv5["begin_dr"],2);
									$temp["f_begin_cr"]	= number_format($ArrAccLv5["begin_cr"],2);
									$temp["f_dr"]		= number_format($ArrAccLv5["dr"],2);
									$temp["f_cr"]		= number_format($ArrAccLv5["cr"],2);
									$temp["f_end_dr"]	= number_format($ArrAccLv5["end_dr"],2);
									$temp["f_end_cr"] 	= number_format($ArrAccLv5["end_cr"],2);
								} else {
									$temp["f_begin_dr"]	= "";
									$temp["f_begin_cr"]	= "";
									$temp["f_dr"]		= "";
									$temp["f_cr"]		= "";
									$temp["f_end_dr"]	= "";
									$temp["f_end_cr"] 	= "";
								}
									
								${$root} [] = $temp;
								
								if(is_array(@$ArrAccLv5["data"])) {
									$lv6_no	= 0;
									foreach ( $ArrAccLv5["data"] as $dc_acc_id => $ArrAccLv6 ) {
										// AccLv6
										$temp	= array();
										
										$temp["i_type"] = 4;
										$temp["no"] 	= ($_REQUEST["i_show_acc"] == 2)? ++$lv6_no : "";
										$temp["c_code"] = $ArrAccLv6["c_code"];
										$temp["c_name"] = $ArrAccLv6["c_name"];
										
										if($_REQUEST["i_show_acc"] == 2) {
											$temp["f_begin_dr"]	= number_format($ArrAccLv6["begin_dr"],2);
											$temp["f_begin_cr"]	= number_format($ArrAccLv6["begin_cr"],2);
											$temp["f_dr"]		= number_format($ArrAccLv6["dr"],2);
											$temp["f_cr"]		= number_format($ArrAccLv6["cr"],2);
											$temp["f_end_dr"]	= number_format($ArrAccLv6["end_dr"],2);
											$temp["f_end_cr"] 	= number_format($ArrAccLv6["end_cr"],2);
										} else {
											$temp["f_begin_dr"]	= "";
											$temp["f_begin_cr"]	= "";
											$temp["f_dr"]		= "";
											$temp["f_cr"]		= "";
											$temp["f_end_dr"]	= "";
											$temp["f_end_cr"] 	= "";
										}
											
										${$root} [] = $temp;
									}
								}
							}
						}
					}
				}				
			}
			// SUM TOTAL
			$temp = array (
					"i_type"			=> 5,
					"f_begin_dr"		=> number_format($ArrSum["begin_dr"],2),
					"f_begin_cr"		=> number_format($ArrSum["begin_cr"],2),
					"f_dr"				=> number_format($ArrSum["dr"],2),
					"f_cr"				=> number_format($ArrSum["cr"],2),
					"f_end_dr"			=> number_format($ArrSum["end_dr"],2),
					"f_end_cr"			=> number_format($ArrSum["end_cr"],2)
			);
				
			${$root} [] = $temp;
		}
	}
	
	return json_encode ( array ( "debug" => true, "totalCount" => $totalCount, $root => ${$root} ) );
}
?>
