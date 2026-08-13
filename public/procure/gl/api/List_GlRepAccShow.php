<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php"); 
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function query_money($method_type) {
	$str_ret = "";
	switch ($method_type) {
		case "1" : // 'ยอดรวมของ ผลต่าง เดบิต-เครดิต'
			$str_ret	= " SUM(ISNULL(f_dr,0)-ISNULL(f_cr,0))";
			break;
		case "2" : // 'ยอดรวมของ ผลต่าง เครดิต-เดบิต'
			$str_ret	= " SUM(ISNULL(f_cr,0)-ISNULL(f_dr,0))";
			break;
		case "3" : // 'ยอดรวมของ ผลต่างยอดยกไป เดบิต-เครดิต (เฉพาะข้อมูลที่ประมวลผลแล้ว)'
			$str_ret	= " SUM(ISNULL(f_end_dr,0)-ISNULL(f_end_cr,0))";
			break;
		case "4" : // 'ยอดรวมของ ผลต่างยอดยกไป เครดิต-เดบิต (เฉพาะข้อมูลที่ประมวลผลแล้ว)'
			$str_ret	= " SUM(ISNULL(f_end_cr,0)-ISNULL(f_end_dr,0))";
			break;
	}
	return $str_ret;
}

function List_QueryParam() {
	
	global $db,$root,$data, $con,$ARR_GL_CFG_TEXT,$arr_status;
 
	$totalCount		= 0;
	$id				= $_REQUEST["gl_rep_acc_hdr_id"];

	// ========================================================================================== //
	$dataHdr	= $db->GetDataBySQL("SELECT * FROM gl_rep_acc_hdr WHERE gl_rep_acc_hdr_id = ?;", array($id));
	
	$acc_1	= substr($dataHdr["c_acc_group"],0,1);
	$acc_2	= substr($dataHdr["c_acc_group"],1,1);
	$acc_3	= substr($dataHdr["c_acc_group"],2,1);
	$acc_4	= substr($dataHdr["c_acc_group"],3,1);
	$acc_5	= substr($dataHdr["c_acc_group"],4,1);
	
	$method_type1	= substr($dataHdr["c_acc_group_cal_method"],0,1);
	$method_type2	= substr($dataHdr["c_acc_group_cal_method"],1,1);
	$method_type3	= substr($dataHdr["c_acc_group_cal_method"],2,1);
	$method_type4	= substr($dataHdr["c_acc_group_cal_method"],3,1);
	$method_type5	= substr($dataHdr["c_acc_group_cal_method"],4,1);
	
	$query_money	= "";
	$str_sum_money	= "";
	$str_left_acc	= "0";
	$str_case		= "";
	$str_post		= "";
	
	if ( $acc_1 == "1" ) {
		$str_left_acc	.= ", 1";
		$str_case		.= " WHEN 1 THEN ".query_money($method_type1);
	}
	if ( $acc_2 == "1" ) {
		$str_left_acc	.= ", 2";
		$str_case		.= " WHEN 2 THEN ".query_money($method_type2);
	}
	if ( $acc_3 == "1" ) {
		$str_left_acc	.= ", 3";
		$str_case		.= " WHEN 3 THEN ".query_money($method_type3);
	}
	if ( $acc_4 == "1" ) {
		$str_left_acc	.= ", 4";
		$str_case		.= " WHEN 4 THEN ".query_money($method_type4);
	}
	if ( $acc_5 == "1" ) {
		$str_left_acc	.= ", 5";
		$str_case		.= " WHEN 5 THEN ".query_money($method_type5);
	}
	
	$str_post	= ($_REQUEST["i_is_post"] == 1)? " IN (2,3)" : " = ".$_REQUEST["i_is_post"];
	
	if ( $_REQUEST["i_process"] == 1 ) { // แสดงข้อมูลโดยไม่ต้องประมวลผล
		$query_money = "SELECT
							a.lv1_seq
							,a.lv1_name
							,a.lv2_seq
							,a.lv2_name
							,a.acc_code
							,a.acc_name
							,b.c_mm
							,b.f_money
						FROM @tblStructure a
							LEFT JOIN (SELECT
											b.dc_acc_id
											, a.c_mm
											, case c.i_group ".$str_case." else 0 end as f_money
										from gl_tran_hdr a
											inner join gl_tran_dtl b on a.gl_tran_hdr_id = b.gl_tran_hdr_id
											inner join dc_acc c on b.dc_acc_id = c.dc_acc_id
											inner join @tblStructure d on c.dc_acc_id = d.dc_acc_id
										where a.i_is_post ".$str_post." and a.i_enable = 1 and a.i_is_close_year = 2
											and a.c_yyyy = ".$_REQUEST["year"]."
											and c.i_group in (".$str_left_acc.")
										group by b.dc_acc_id
											, a.c_mm
											, c.i_group) b on a.dc_acc_id = b.dc_acc_id;
						";
	} else { // แสดงข้อมูลที่ประมวลผลแล้ว
		$query_money = "select a.lv1_seq
							, a.lv1_name
							, a.lv2_seq
							, a.lv2_name
							, a.acc_code
							, a.acc_name
							, b.c_mm
							, b.f_money
						from @tblStructure a
							left join (select c.dc_acc_id
											, b.c_mm
											, case c.i_group ".$str_case." else 0 end as f_money
										from gl_balance_cost b
											inner join dc_acc c on b.dc_acc_id = c.dc_acc_id
											inner join @tblStructure d on c.dc_acc_id = d.dc_acc_id
										where b.i_is_post ".$str_post." and b.i_is_close_year = 2
											and b.c_yyyy = ".$_REQUEST["year"]."
											and c.i_group in (".$str_left_acc.")
										group by c.dc_acc_id
											, b.c_mm
											, c.i_group) b on a.dc_acc_id = b.dc_acc_id;
						";
	}
	
	switch($_REQUEST["i_money"]) {
		case 1 ://'รายเดือน'
			$str_sum_money = " 	, sum(case cast(c_mm as int) when 1 then f_money else 0 end) as f_money1
								, sum(case cast(c_mm as int) when 2 then f_money else 0 end) as f_money2
								, sum(case cast(c_mm as int) when 3 then f_money else 0 end) as f_money3
								, sum(case cast(c_mm as int) when 4 then f_money else 0 end) as f_money4
								, sum(case cast(c_mm as int) when 5 then f_money else 0 end) as f_money5
								, sum(case cast(c_mm as int) when 6 then f_money else 0 end) as f_money6
								, sum(case cast(c_mm as int) when 7 then f_money else 0 end) as f_money7
								, sum(case cast(c_mm as int) when 8 then f_money else 0 end) as f_money8
								, sum(case cast(c_mm as int) when 9 then f_money else 0 end) as f_money9
								, sum(case cast(c_mm as int) when 10 then f_money else 0 end) as f_money10
								, sum(case cast(c_mm as int) when 11 then f_money else 0 end) as f_money11
								, sum(case cast(c_mm as int) when 12 then f_money else 0 end) as f_money12";
			break;
		case 2 : // 'รายไตรมาส'
		case 3 : // 'รายไตรมาส (ณ สิ้นไตรมาส)'
			$str_sum_money = "	, sum(case when cast(c_mm as int) between 1 and 3 then f_money else 0 end) as f_money1
								, sum(case when cast(c_mm as int) between 4 and 6 then f_money else 0 end) as f_money2
								, sum(case when cast(c_mm as int) between 7 and 9 then f_money else 0 end) as f_money3
								, sum(case when cast(c_mm as int) between 10 and 12 then f_money else 0 end) as f_money4
								, 0 as f_money5
								, 0 as f_money6
								, 0 as f_money7
								, 0 as f_money8
								, 0 as f_money9
								, 0 as f_money10
								, 0 as f_money11
								, 0 as f_money12";
			break;
		case 4 : // 'รายปี'
			$str_sum_money = "	, sum(case when cast(c_mm as int) between 1 and 12 then f_money else 0 end) as f_money1
								, 0 as f_money2
								, 0 as f_money3
								, 0 as f_money4
								, 0 as f_money5
								, 0 as f_money6
								, 0 as f_money7
								, 0 as f_money8
								, 0 as f_money9
								, 0 as f_money10
								, 0 as f_money11
								, 0 as f_money12";
			break;
	}
	
	$sqlMain	= "	SET NOCOUNT ON
					DECLARE @hdr_id AS numeric;
					SET @hdr_id = ?;
					
					/* Local Variable */
					DECLARE @tblStructure AS table (
						lv1_id numeric,
						lv1_seq int,
						lv1_name varchar(255),
						lv2_id numeric,
						lv2_seq int,
						lv2_name varchar(255),
						dc_acc_id bigint,
						acc_code varchar(50),
						acc_name varchar(255));
					
					DECLARE @tblData as table (
						lv1_seq int,
						lv1_name varchar(255),
						lv2_seq int,
						lv2_name varchar(255),
						acc_code varchar(50),
						acc_name varchar(255),
						c_mm varchar(2),
						f_money decimal(18, 2));
					
					INSERT INTO @tblStructure
					SELECT
						a.gl_rep_acc_dtl_id AS lv1_id
						,a.i_sequence AS lv1_seq
						,a.c_name AS lv1_name
						,CAST(0 AS NUMERIC) AS lv2_id
						,CAST(0 AS INT) AS lv2_seq
						,CAST('' AS VARCHAR(255)) AS lv2_name
						,b.dc_acc_id
						,c.c_code
						,c.c_name
					FROM gl_rep_acc_dtl a
						INNER JOIN gl_rep_acc_map b ON a.gl_rep_acc_dtl_id = b.gl_rep_acc_dtl_id
						INNER JOIN dc_acc c ON b.dc_acc_id = c.dc_acc_id
					WHERE a.gl_rep_acc_hdr_id = @hdr_id AND c.i_enable=".STATUS_ENABLE." AND c.i_last=".GL_ACC_LAST_TRUE."
					UNION
					SELECT
						a.gl_rep_acc_dtl_id AS lv1_id
						,a.i_sequence AS lv1_seq
						,a.c_name AS lv1_name
						,b.gl_rep_acc_sub_dtl_id AS lv2_id
						,b.i_sequence AS lv2_seq
						,b.c_name AS lv2_name
						,c.dc_acc_id
						,d.c_code
						,d.c_name
					FROM gl_rep_acc_dtl a
						INNER JOIN gl_rep_acc_sub_dtl b ON a.gl_rep_acc_dtl_id = b.gl_rep_acc_dtl_id
						INNER JOIN gl_rep_acc_map c ON b.gl_rep_acc_sub_dtl_id = c.gl_rep_acc_sub_dtl_id
						INNER JOIN dc_acc d ON c.dc_acc_id = d.dc_acc_id
					WHERE a.gl_rep_acc_hdr_id = @hdr_id AND d.i_enable=".STATUS_ENABLE." AND d.i_last=".GL_ACC_LAST_TRUE.";
					
					INSERT INTO @tblData
					".$query_money."
					
					SELECT
						*
					FROM (	SELECT
								row_number() OVER(ORDER BY lv1_seq, lv2_seq, acc_code) AS row_index
								,CASE WHEN lv1_seq > 0 THEN CAST(lv1_seq AS VARCHAR(3))+'. '+lv1_name ELSE '' END AS c_lv1
								,CASE WHEN lv2_seq > 0 THEN CAST(lv2_seq AS VARCHAR(3))+'. '+lv2_name ELSE '' END AS c_lv2
								,acc_code +' '+ acc_name AS c_acc
								".$str_sum_money."
							FROM @tblData
							GROUP BY lv1_seq, lv1_name, lv2_seq, lv2_name , acc_code, acc_name) a;";

	$arrParam[]	= $id;

	$stmt = $db->QueryParam( $sqlMain, $arrParam );
	
	if( $stmt ) {
		
		$topic1 = "";
		$topic2 = "";
		$f_sum = 0;
		$sum_t1	= array();
		$sum_t2	= array();
		$sum_all= array();
		
		$sum_t1[1] = 0;
		$sum_t1[2] = 0;
		$sum_t1[3] = 0;
		$sum_t1[4] = 0;
		$sum_t1[5] = 0;
		$sum_t1[6] = 0;
		$sum_t1[7] = 0;
		$sum_t1[8] = 0;
		$sum_t1[9] = 0;
		$sum_t1[10] = 0;
		$sum_t1[11] = 0;
		$sum_t1[12] = 0;
		$sum_t1[13] = 0;
		
		$sum_t2[1] = 0;
		$sum_t2[2] = 0;
		$sum_t2[3] = 0;
		$sum_t2[4] = 0;
		$sum_t2[5] = 0;
		$sum_t2[6] = 0;
		$sum_t2[7] = 0;
		$sum_t2[8] = 0;
		$sum_t2[9] = 0;
		$sum_t2[10] = 0;
		$sum_t2[11] = 0;
		$sum_t2[12] = 0;
		$sum_t2[13] = 0;
		
		$sum_all[1] = 0;
		$sum_all[2] = 0;
		$sum_all[3] = 0;
		$sum_all[4] = 0;
		$sum_all[5] = 0;
		$sum_all[6] = 0;
		$sum_all[7] = 0;
		$sum_all[8] = 0;
		$sum_all[9] = 0;
		$sum_all[10] = 0;
		$sum_all[11] = 0;
		$sum_all[12] = 0;
		$sum_all[13] = 0;
		
		while($row=$db->Fetch($stmt)) {
			if ($topic1 != $row["c_lv1"]) {
				if ($topic2 != "") {
					$temp = array(
							"i_type"	=> "2",							
							"topic1" 	=> "",
							"topic2" 	=> "รวม ".$topic2,
							"c_acc" 	=> "",
							"f_money1"  => ($sum_t2[1] != 0)? $sum_t2[1] : "-",
							"f_money2"  => ($sum_t2[2] != 0)? $sum_t2[2] : "-",
							"f_money3"  => ($sum_t2[3] != 0)? $sum_t2[3] : "-",
							"f_money4"  => ($sum_t2[4] != 0)? $sum_t2[4] : "-",
							"f_money5"  => ($sum_t2[5] != 0)? $sum_t2[5] : "-",
							"f_money6"  => ($sum_t2[6] != 0)? $sum_t2[6] : "-",
							"f_money7"  => ($sum_t2[7] != 0)? $sum_t2[7] : "-",
							"f_money8"  => ($sum_t2[8] != 0)? $sum_t2[8] : "-",
							"f_money9"  => ($sum_t2[9] != 0)? $sum_t2[9] : "-",
							"f_money10" => ($sum_t2[10] != 0)? $sum_t2[10] : "-",
							"f_money11" => ($sum_t2[11] != 0)? $sum_t2[11] : "-",
							"f_money12" => ($sum_t2[12] != 0)? $sum_t2[12] : "-",
							"f_sum"		=> ($sum_t2[13] != 0)? $sum_t2[13] : "-"
					);
					${$root}[] = $temp;
					$sum_t2[1] = 0;
					$sum_t2[2] = 0;
					$sum_t2[3] = 0;
					$sum_t2[4] = 0;
					$sum_t2[5] = 0;
					$sum_t2[6] = 0;
					$sum_t2[7] = 0;
					$sum_t2[8] = 0;
					$sum_t2[9] = 0;
					$sum_t2[10] = 0;
					$sum_t2[11] = 0;
					$sum_t2[12] = 0;
					$sum_t2[13] = 0;
				}
				
				if ($topic1 != "")
				{
					$temp = array(
							"i_type"	=> "1",
							"topic1" 	=> "รวม ".$topic1,
							"topic2" 	=> "",
							"c_acc" 	=> "",
							"f_money1"  => ($sum_t1[1] != 0)? $sum_t1[1] : "-",
							"f_money2"  => ($sum_t1[2] != 0)? $sum_t1[2] : "-",
							"f_money3"  => ($sum_t1[3] != 0)? $sum_t1[3] : "-",
							"f_money4"  => ($sum_t1[4] != 0)? $sum_t1[4] : "-",
							"f_money5"  => ($sum_t1[5] != 0)? $sum_t1[5] : "-",
							"f_money6"  => ($sum_t1[6] != 0)? $sum_t1[6] : "-",
							"f_money7"  => ($sum_t1[7] != 0)? $sum_t1[7] : "-",
							"f_money8"  => ($sum_t1[8] != 0)? $sum_t1[8] : "-",
							"f_money9"  => ($sum_t1[9] != 0)? $sum_t1[9] : "-",
							"f_money10" => ($sum_t1[10] != 0)? $sum_t1[10] : "-",
							"f_money11" => ($sum_t1[11] != 0)? $sum_t1[11] : "-",
							"f_money12" => ($sum_t1[12] != 0)? $sum_t1[12] : "-",
							"f_sum"		=> ($sum_t1[13] != 0)? $sum_t1[13] : "-"
					);
					${$root}[] = $temp;
					$sum_t1[1] = 0;
					$sum_t1[2] = 0;
					$sum_t1[3] = 0;
					$sum_t1[4] = 0;
					$sum_t1[5] = 0;
					$sum_t1[6] = 0;
					$sum_t1[7] = 0;
					$sum_t1[8] = 0;
					$sum_t1[9] = 0;
					$sum_t1[10] = 0;
					$sum_t1[11] = 0;
					$sum_t1[12] = 0;
					$sum_t1[13] = 0;
				}
				
				$topic1 = $row["c_lv1"];
				$topic2 = "";
				$temp = array(
							"i_type"	=> "1",
							"topic1" 	=> $topic1,
							"topic2" 	=> "",
							"c_acc" 	=> "",
							"f_money1"  => "",
							"f_money2"  => "",
							"f_money3"  => "",
							"f_money4"  => "",
							"f_money5"  => "",
							"f_money6"  => "",
							"f_money7"  => "",
							"f_money8"  => "",
							"f_money9"  => "",
							"f_money10" => "",
							"f_money11" => "",
							"f_money12" => "",
							"f_sum"		=> ""
				);
				${$root}[] = $temp;
			}
			if ($topic2 != $row["c_lv2"])
			{
				if ($topic2 != "")
				{
					$temp = array(
							"i_type"	=> "2",
							"topic1" 	=> "",
							"topic2" 	=> "รวม ".$topic2,
							"c_acc" 	=> "",
							"f_money1"  => ($sum_t2[1] != 0)? $sum_t2[1] : "-",
							"f_money2"  => ($sum_t2[2] != 0)? $sum_t2[2] : "-",
							"f_money3"  => ($sum_t2[3] != 0)? $sum_t2[3] : "-",
							"f_money4"  => ($sum_t2[4] != 0)? $sum_t2[4] : "-",
							"f_money5"  => ($sum_t2[5] != 0)? $sum_t2[5] : "-",
							"f_money6"  => ($sum_t2[6] != 0)? $sum_t2[6] : "-",
							"f_money7"  => ($sum_t2[7] != 0)? $sum_t2[7] : "-",
							"f_money8"  => ($sum_t2[8] != 0)? $sum_t2[8] : "-",
							"f_money9"  => ($sum_t2[9] != 0)? $sum_t2[9] : "-",
							"f_money10" => ($sum_t2[10] != 0)? $sum_t2[10] : "-",
							"f_money11" => ($sum_t2[11] != 0)? $sum_t2[11] : "-",
							"f_money12" => ($sum_t2[12] != 0)? $sum_t2[12] : "-",
							"f_sum"		=> ($sum_t2[13] != 0)? $sum_t2[13] : "-"
					);
					${$root}[] = $temp;
					$sum_t2[1] = 0;
					$sum_t2[2] = 0;
					$sum_t2[3] = 0;
					$sum_t2[4] = 0;
					$sum_t2[5] = 0;
					$sum_t2[6] = 0;
					$sum_t2[7] = 0;
					$sum_t2[8] = 0;
					$sum_t2[9] = 0;
					$sum_t2[10] = 0;
					$sum_t2[11] = 0;
					$sum_t2[12] = 0;
					$sum_t2[13] = 0;
				}
				$topic2 = $row["c_lv2"];
				$temp = array(
						"i_type"	=> "2",
						"topic1" 	=> "",
						"topic2" 	=> $topic2,
						"c_acc" 	=> "",
						"f_money1"  => "",
						"f_money2"  => "",
						"f_money3"  => "",
						"f_money4"  => "",
						"f_money5"  => "",
						"f_money6"  => "",
						"f_money7"  => "",
						"f_money8"  => "",
						"f_money9"  => "",
						"f_money10" => "",
						"f_money11" => "",
						"f_money12" => "",
						"f_sum"		=> ""
				);
				${$root}[] = $temp;
			}
		
			$f_sum = $row["f_money1"]+$row["f_money2"]+$row["f_money3"]+$row["f_money4"]+$row["f_money5"]+$row["f_money6"]+$row["f_money7"]+$row["f_money8"]+$row["f_money9"]+$row["f_money10"]+$row["f_money11"]+$row["f_money12"];				
				
			$temp = array(
						"i_type"	=> "3",
						"topic1" 	=> "",
						"topic2" 	=> "",
						"c_acc" 	=> $row["c_acc"],
						"f_money1"  => $row["f_money1"],
						"f_money2"  => $row["f_money2"],
						"f_money3"  => $row["f_money3"],
						"f_money4"  => $row["f_money4"],
						"f_money5"  => $row["f_money5"],
						"f_money6"  => $row["f_money6"],
						"f_money7"  => $row["f_money7"],
						"f_money8"  => $row["f_money8"],
						"f_money9"  => $row["f_money9"],
						"f_money10" => $row["f_money10"],
						"f_money11" => $row["f_money11"],
						"f_money12" => $row["f_money12"],
						"f_sum"		=> ($f_sum> 0)? $f_sum : "-"
				);
			${$root}[] = $temp;
			
			$sum_t1[1] += $row["f_money1"];
			$sum_t1[2] += $row["f_money2"];
			$sum_t1[3] += $row["f_money3"];
			$sum_t1[4] += $row["f_money4"];
			$sum_t1[5] += $row["f_money5"];
			$sum_t1[6] += $row["f_money6"];
			$sum_t1[7] += $row["f_money7"];
			$sum_t1[8] += $row["f_money8"];
			$sum_t1[9] += $row["f_money9"];
			$sum_t1[10] += $row["f_money10"];
			$sum_t1[11] += $row["f_money11"];
			$sum_t1[12] += $row["f_money12"];
			$sum_t1[13] += $f_sum;
			
			$sum_t2[1] += $row["f_money1"];
			$sum_t2[2] += $row["f_money2"];
			$sum_t2[3] += $row["f_money3"];
			$sum_t2[4] += $row["f_money4"];
			$sum_t2[5] += $row["f_money5"];
			$sum_t2[6] += $row["f_money6"];
			$sum_t2[7] += $row["f_money7"];
			$sum_t2[8] += $row["f_money8"];
			$sum_t2[9] += $row["f_money9"];
			$sum_t2[10] += $row["f_money10"];
			$sum_t2[11] += $row["f_money11"];
			$sum_t2[12] += $row["f_money12"];
			$sum_t2[13] += $f_sum;
			
			$sum_all[1] += $row["f_money1"];
			$sum_all[2] += $row["f_money2"];
			$sum_all[3] += $row["f_money3"];
			$sum_all[4] += $row["f_money4"];
			$sum_all[5] += $row["f_money5"];
			$sum_all[6] += $row["f_money6"];
			$sum_all[7] += $row["f_money7"];
			$sum_all[8] += $row["f_money8"];
			$sum_all[9] += $row["f_money9"];
			$sum_all[10] += $row["f_money10"];
			$sum_all[11] += $row["f_money11"];
			$sum_all[12] += $row["f_money12"];
			$sum_all[13] += $f_sum;
		}
		
		if ($topic2 != "")
		{
			$temp = array(
					"i_type"	=> "2",
					"topic1" 	=> "",
					"topic2" 	=> "รวม ".$topic2,
					"c_acc" 	=> "",
					"f_money1"  => ($sum_t2[1] != 0)? $sum_t2[1] : "-",
					"f_money2"  => ($sum_t2[2] != 0)? $sum_t2[2] : "-",
					"f_money3"  => ($sum_t2[3] != 0)? $sum_t2[3] : "-",
					"f_money4"  => ($sum_t2[4] != 0)? $sum_t2[4] : "-",
					"f_money5"  => ($sum_t2[5] != 0)? $sum_t2[5] : "-",
					"f_money6"  => ($sum_t2[6] != 0)? $sum_t2[6] : "-",
					"f_money7"  => ($sum_t2[7] != 0)? $sum_t2[7] : "-",
					"f_money8"  => ($sum_t2[8] != 0)? $sum_t2[8] : "-",
					"f_money9"  => ($sum_t2[9] != 0)? $sum_t2[9] : "-",
					"f_money10" => ($sum_t2[10] != 0)? $sum_t2[10] : "-",
					"f_money11" => ($sum_t2[11] != 0)? $sum_t2[11] : "-",
					"f_money12" => ($sum_t2[12] != 0)? $sum_t2[12] : "-",
					"f_sum"		=> ($sum_t2[13] != 0)? $sum_t2[13] : "-"
			);
			${$root}[] = $temp;
		}
		
		if ($topic1 != "")
		{
			$temp = array(
					"i_type"	=> "1",
					"topic1" 	=> "รวม ".$topic1,
					"topic2" 	=> "",
					"c_acc" 	=> "",
					"f_money1"  => ($sum_t1[1] != 0)? $sum_t1[1] : "-",
					"f_money2"  => ($sum_t1[2] != 0)? $sum_t1[2] : "-",
					"f_money3"  => ($sum_t1[3] != 0)? $sum_t1[3] : "-",
					"f_money4"  => ($sum_t1[4] != 0)? $sum_t1[4] : "-",
					"f_money5"  => ($sum_t1[5] != 0)? $sum_t1[5] : "-",
					"f_money6"  => ($sum_t1[6] != 0)? $sum_t1[6] : "-",
					"f_money7"  => ($sum_t1[7] != 0)? $sum_t1[7] : "-",
					"f_money8"  => ($sum_t1[8] != 0)? $sum_t1[8] : "-",
					"f_money9"  => ($sum_t1[9] != 0)? $sum_t1[9] : "-",
					"f_money10" => ($sum_t1[10] != 0)? $sum_t1[10] : "-",
					"f_money11" => ($sum_t1[11] != 0)? $sum_t1[11] : "-",
					"f_money12" => ($sum_t1[12] != 0)? $sum_t1[12] : "-",
					"f_sum"		=> ($sum_t1[13] != 0)? $sum_t1[13] : "-"
			);
			${$root}[] = $temp;
		}
		
		if (count($sum_all) > 0)
		{
			$temp = array(
					"i_type"	=> "4",
					"topic1" 	=> "รวมทั้งหมด",
					"topic2" 	=> "",
					"c_acc" 	=> "",
					"f_money1"  => ($sum_all[1] != 0)? $sum_all[1] : "-",
					"f_money2"  => ($sum_all[2] != 0)? $sum_all[2] : "-",
					"f_money3"  => ($sum_all[3] != 0)? $sum_all[3] : "-",
					"f_money4"  => ($sum_all[4] != 0)? $sum_all[4] : "-",
					"f_money5"  => ($sum_all[5] != 0)? $sum_all[5] : "-",
					"f_money6"  => ($sum_all[6] != 0)? $sum_all[6] : "-",
					"f_money7"  => ($sum_all[7] != 0)? $sum_all[7] : "-",
					"f_money8"  => ($sum_all[8] != 0)? $sum_all[8] : "-",
					"f_money9"  => ($sum_all[9] != 0)? $sum_all[9] : "-",
					"f_money10" => ($sum_all[10] != 0)? $sum_all[10] : "-",
					"f_money11" => ($sum_all[11] != 0)? $sum_all[11] : "-",
					"f_money12" => ($sum_all[12] != 0)? $sum_all[12] : "-",
					"f_sum"		=> ($sum_all[13] != 0)? $sum_all[13] : "-"
			);
			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
}

?>
