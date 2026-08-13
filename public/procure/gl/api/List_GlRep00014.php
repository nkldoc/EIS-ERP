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
	
	if($_REQUEST["page"] == "GlRep00014") { // งบแสดงผลดำเนินงาน (เปรียบเทียบ)
		$con	.= "AND a.i_group IN (4,5)";
	} else { // งบแสดงฐานะการเงิน (เปรียบเทียบ)
		$con	.= "AND a.i_group IN (1,2,3)";
	}
	
	switch (@$_REQUEST["i_status"]) {
		case 1: // ยอดแต่ละเดือน
			
			$sqlMoney	= "	SELECT
								a.dc_acc_id
								,SUM(ISNULL(a.f_dr,0)) AS f_dr
								,SUM(ISNULL(a.f_cr,0)) AS f_cr
								,SUM(ISNULL(a.f_dr_before,0)) AS f_dr_before
								,SUM(ISNULL(a.f_cr_before,0)) AS f_cr_before
							FROM (
								/* ปีปัจจุบัน */
								SELECT
									bb.dc_acc_id
									,bb.f_dr
									,bb.f_cr
									,0 AS f_dr_before
									,0 AS f_cr_before
								FROM gl_tran_hdr aa
									INNER JOIN gl_tran_dtl bb ON aa.gl_tran_hdr_id = bb.gl_tran_hdr_id
								WHERE aa.c_yyyy_mm BETWEEN ".($_REQUEST["year"]-1)."10 AND ".$_REQUEST["year"]."09
									AND aa.i_is_post=".BOOK_ACC_GL."
									AND aa.i_is_close_year=".GL_CLOSE_YEAR_NONE."
									AND aa.i_enable=".STATUS_ENABLE."
								UNION
								/* ปีปัจจุบัน - 1 */
								SELECT
									bb.dc_acc_id
									,0 AS f_dr
									,0 AS f_cr
									,bb.f_dr AS f_dr_before
									,bb.f_cr AS f_cr_before
								FROM gl_tran_hdr aa
									INNER JOIN gl_tran_dtl bb ON aa.gl_tran_hdr_id = bb.gl_tran_hdr_id
								WHERE aa.c_yyyy_mm BETWEEN ".($_REQUEST["year"]-2)."10 AND ".($_REQUEST["year"]-1)."09
									AND aa.i_is_post=".BOOK_ACC_GL."
									AND aa.i_is_close_year=".GL_CLOSE_YEAR_NONE."
									AND aa.i_enable=".STATUS_ENABLE.") a
							GROUP BY a.dc_acc_id";
			
		break;
		case 2: // ยอดสะสม
		default:
			$sqlMoney	= "	SELECT
								a.dc_acc_id
								,SUM(ISNULL(a.f_dr,0)) AS f_dr
								,SUM(ISNULL(a.f_cr,0)) AS f_cr
								,SUM(ISNULL(a.f_dr_before,0)) AS f_dr_before
								,SUM(ISNULL(a.f_cr_before,0)) AS f_cr_before
							FROM (
								/* ปีปัจจุบัน */
								SELECT
									aa.dc_acc_id
									,aa.f_end_dr AS f_dr
									,aa.f_end_cr AS f_cr
									,0 AS f_dr_before
									,0 AS f_cr_before
								FROM gl_balance_cost aa
								WHERE
									aa.c_yyyy_mm BETWEEN ".($_REQUEST["year"]-1)."10 AND ".$_REQUEST["year"]."09
									AND aa.i_is_post=".BOOK_ACC_GL."
									AND aa.i_is_close_year=".GL_CLOSE_YEAR_NONE."
									AND 1=".STATUS_ENABLE."
								UNION
								/* ปีปัจจุบัน - 1 */
								SELECT
									aa.dc_acc_id
									,0 AS f_dr
									,0 AS f_cr
									,aa.f_end_dr AS f_dr_before
									,aa.f_end_cr AS f_cr_before
								FROM gl_balance_cost aa
								WHERE
									aa.c_yyyy_mm BETWEEN ".($_REQUEST["year"]-2)."10 AND ".($_REQUEST["year"]-1)."09
									AND aa.i_is_post=".BOOK_ACC_GL."
									AND aa.i_is_close_year=".GL_CLOSE_YEAR_NONE."
									AND 1=".STATUS_ENABLE."
							) a
							GROUP BY a.dc_acc_id";
			
		break;
	}
	
	if ($_REQUEST ["i_show_acc"] == 1) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_lv4_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND a.dc_acc_lv4_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST ["i_show_acc"] == 3) {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_lv5_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND a.dc_acc_lv5_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode ( ";", $_REQUEST ["dc_acc_lv6_id"] );
		if (! in_array ( "0", $for_id )) {
			$in = "";
			if (is_array ( $for_id )) {
				foreach ( $for_id as $val ) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND a.dc_acc_id IN (" . $in . ")" : "";
			}
		}
	}
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					a.dc_acc_lv4_id AS lv4_id
					,a.c_code_lv4
					,a.c_name_lv4
					,a.dc_acc_lv5_id AS lv5_id
					,a.c_code_lv5
					,a.c_name_lv5
					,a.dc_acc_id AS lv6_id
					,a.c_code AS c_code_lv6
					,a.c_name AS c_name_lv6
					,CASE
						WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") OR (a.i_group=".GL_ACC_GROUP5_EXPENSE.")
							THEN SUM(ISNULL(b.f_dr,0)) - SUM(ISNULL(b.f_cr,0))
						WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.") OR (a.i_group=".GL_ACC_GROUP3_SHARE.") OR (a.i_group=".GL_ACC_GROUP4_REVENUE.")
							THEN SUM(ISNULL(b.f_cr,0)) - SUM(ISNULL(b.f_dr,0))
						ELSE 0
					END AS f_money
					,CASE
						WHEN (a.i_group=".GL_ACC_GROUP1_ASSET.") OR (a.i_group=".GL_ACC_GROUP5_EXPENSE.")
							THEN SUM(ISNULL(b.f_dr_before,0)) - SUM(ISNULL(b.f_cr_before,0))
						WHEN (a.i_group=".GL_ACC_GROUP2_DEBT.") OR (a.i_group=".GL_ACC_GROUP3_SHARE.") OR (a.i_group=".GL_ACC_GROUP4_REVENUE.")
							THEN SUM(ISNULL(b.f_cr_before,0)) - SUM(ISNULL(b.f_dr_before,0))
						ELSE 0
					END AS f_money_before
				FROM vw_dc_acc_with_parent a
					LEFT JOIN ( $sqlMoney ) b ON a.dc_acc_id = b.dc_acc_id
				WHERE 1 = 1
					{$con}
					AND a.i_delete = ".DELETE_FALSE." AND a.i_enable = ".STATUS_ENABLE."
				GROUP BY a.dc_acc_lv4_id ,a.c_code_lv4 ,a.c_name_lv4
					,a.dc_acc_lv5_id ,a.c_code_lv5 ,a.c_name_lv5
					,a.dc_acc_id ,a.c_code ,a.c_name
					,a.i_group
				ORDER BY a.i_group, a.c_code_lv4, a.c_code_lv5, a.dc_acc_id ,a.c_code;";
		
	$arrParam	= array();
 
	$stmt = $db->QueryParam ( $sqlMain, $arrParam );
	
	if ($stmt) {
		while ( $row = $db->Fetch ( $stmt ) ) {
			
			$ArrAcc [$row["lv4_id"]]["c_code"]			= $row ["c_code_lv4"];
			$ArrAcc [$row["lv4_id"]]["c_name"]			= $row ["c_name_lv4"];
			
			if(@$ArrAcc [$row["lv4_id"]]["f_money"]) {
				$ArrAcc [$row["lv4_id"]]["f_money"]			+= $row["f_money"];
			} else {
				$ArrAcc [$row["lv4_id"]]["f_money"]			= $row["f_money"];
			}
			if(@$ArrAcc [$row["lv4_id"]]["f_money_before"]) {
				$ArrAcc [$row["lv4_id"]]["f_money_before"]	+= $row["f_money_before"];
			} else {
				$ArrAcc [$row["lv4_id"]]["f_money_before"]	= $row["f_money_before"];
			}
			
			if(!($_REQUEST ["i_show_acc"] == 1)) {
				$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["c_code"]			= $row ["c_code_lv5"];
				$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["c_name"]			= $row ["c_name_lv5"];
				
				if(@$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["f_money"]) {
					$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["f_money"]			+= $row["f_money"];
				} else {
					$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["f_money"]			= $row["f_money"];
				}
				if(@$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["f_money_before"]) {
					$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["f_money_before"]	+= $row["f_money_before"];
				} else {
					$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["f_money_before"]	= $row["f_money_before"];
				}
			}
			
			if(!($_REQUEST ["i_show_acc"] == 1) && !($_REQUEST ["i_show_acc"] == 3)) {
				$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["lv6_id"]]["c_code"]			= $row ["c_code_lv6"];
				$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["lv6_id"]]["c_name"]			= $row ["c_name_lv6"];
				$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["lv6_id"]]["f_money"]			= $row ["f_money"];
				$ArrAcc [$row["lv4_id"]]["data"][$row["lv5_id"]]["data"][$row["lv6_id"]]["f_money_before"]	= $row ["f_money_before"];
			}
		}
		
		if (isset ( $ArrAcc )) {
			foreach ( $ArrAcc as $lv4_id => $ArrLv4 ) {
				$temp = array (
						"i_type"			=> 1,
						"c_code"			=> $ArrLv4["c_code"],
						"c_name"			=> $ArrLv4["c_name"],
						"f_money"			=> number_format($ArrLv4["f_money"],2),
						"f_money_before"	=> number_format($ArrLv4["f_money_before"],2)
				);
							
				${$root} [] = $temp;
				
				if(is_array(@$ArrLv4["data"])) {
					foreach ( $ArrLv4["data"] as $lv5_id => $ArrLv5 ) {
	
						$temp = array (
								"i_type"			=> 2,
								"c_code"			=> $ArrLv5["c_code"],
								"c_name"			=> $ArrLv5["c_name"],
								"f_money"			=> number_format($ArrLv5["f_money"],2),
								"f_money_before"	=> number_format($ArrLv5["f_money_before"],2)
						);
							
						${$root} [] = $temp;

						if(is_array(@$ArrLv5["data"])) {
							foreach ( $ArrLv5["data"] as $lv6_id => $ArrLv6 ) {
								
								$temp = array (
										"i_type"			=> 3,
										"c_code"			=> $ArrLv6["c_code"],
										"c_name"			=> $ArrLv6["c_name"],
										"f_money"			=> number_format($ArrLv6["f_money"],2),
										"f_money_before"	=> number_format($ArrLv6["f_money_before"],2)
								);
								
								${$root} [] = $temp;
							}
						}
					}
				}
			}
		}
	}
	
	return json_encode ( array ( "debug" => true, "totalCount" => $totalCount, $root => ${$root} ) );
}
?>
