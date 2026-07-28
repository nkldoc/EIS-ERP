<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;
	$f_for_debt = 0;
	$yc = 0;
	$y1 = 0;
	$y2 = 0;
	$y3 = 0;
	$y4 = 0;
	$y5 = 0;
	$yl = 0;
	$re = 0;

	$start_month = sprintf("%04d%02d", $_REQUEST["i_year"], $_REQUEST["i_mm"]);
	$end_month = sprintf("%04d%02d", $_REQUEST["i_year2"], $_REQUEST["i_mm2"]);

	$sqlMain = "SET NOCOUNT ON
				DECLARE @c_yyyy_mm1 AS VARCHAR(6) = '{$start_month}';
				DECLARE @c_yyyy_mm2 AS VARCHAR(6) = '{$end_month}';
				
				DECLARE @c_yyyy_mm_min AS VARCHAR(6);
				DECLARE @c_yyyy_mm_max AS VARCHAR(6);

				DECLARE @c_yb1 AS VARCHAR(4);
				DECLARE @c_mb1 AS VARCHAR(2) = '10';

				DECLARE @c_yb2 AS VARCHAR(4);
				DECLARE @c_mb2 AS VARCHAR(2) = '09';

				IF RIGHT(@c_yyyy_mm2, 2) > '09'
				BEGIN
					SET @c_yb1 = LEFT(@c_yyyy_mm2, 4);
					SET @c_yb2 = CAST(CAST(LEFT(@c_yyyy_mm2, 4) AS INT)+1 AS VARCHAR(4));
				END 
				ELSE
				BEGIN
					SET @c_yb1 = CAST(CAST(LEFT(@c_yyyy_mm2, 4) AS INT)-1 AS VARCHAR(4));
					SET @c_yb2 = LEFT(@c_yyyy_mm2, 4);
				END 

				SELECT @c_yyyy_mm_min = MIN(c_yyyy_mm), @c_yyyy_mm_max = MAX(c_yyyy_mm)
				FROM NMU.dbo.ar_process_summary
				WHERE c_yyyy_mm BETWEEN @c_yyyy_mm1 AND @c_yyyy_mm2

				SELECT c.c_name AS group_name
					, SUM(f_for_debt) AS f_for_debt
					, SUM(CASE WHEN CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) BETWEEN @c_yb1+@c_mb1 AND @c_yb2+@c_mb2 THEN f_for_debt ELSE 0 END) AS year_c
					, SUM(CASE WHEN CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) BETWEEN CAST(CAST(@c_yb1 AS INT)-1 AS VARCHAR(4))+@c_mb1 AND CAST(CAST(@c_yb2 AS INT)-1 AS VARCHAR(4))+@c_mb2 THEN f_for_debt ELSE 0 END) AS year_1
					, SUM(CASE WHEN CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) BETWEEN CAST(CAST(@c_yb1 AS INT)-2 AS VARCHAR(4))+@c_mb1 AND CAST(CAST(@c_yb2 AS INT)-2 AS VARCHAR(4))+@c_mb2 THEN f_for_debt ELSE 0 END) AS year_2
					, SUM(CASE WHEN CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) BETWEEN CAST(CAST(@c_yb1 AS INT)-3 AS VARCHAR(4))+@c_mb1 AND CAST(CAST(@c_yb2 AS INT)-3 AS VARCHAR(4))+@c_mb2 THEN f_for_debt ELSE 0 END) AS year_3
					, SUM(CASE WHEN CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) BETWEEN CAST(CAST(@c_yb1 AS INT)-4 AS VARCHAR(4))+@c_mb1 AND CAST(CAST(@c_yb2 AS INT)-4 AS VARCHAR(4))+@c_mb2 THEN f_for_debt ELSE 0 END) AS year_4
					, SUM(CASE WHEN CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) BETWEEN CAST(CAST(@c_yb1 AS INT)-5 AS VARCHAR(4))+@c_mb1 AND CAST(CAST(@c_yb2 AS INT)-5 AS VARCHAR(4))+@c_mb2 THEN f_for_debt ELSE 0 END) AS year_5
					, SUM(CASE WHEN CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) < CAST(CAST(@c_yb1 AS INT)-5 AS VARCHAR(4))+@c_mb1 THEN f_for_debt ELSE 0 END) AS year_less
					, SUM(f_remain) AS f_remain
				FROM 
				(SELECT a.c_yyyy_mm
				, a.ar_treat_right_id
				, a.d_bill_date
				, SUM(CASE WHEN a.i_is_cancel = 0 AND a.i_is_begin=1 AND c_yyyy_mm = @c_yyyy_mm_min THEN a.f_bill ELSE 0 END) AS f_begin 
				, SUM(CASE WHEN a.i_is_cancel = 0 AND a.i_is_begin = 0 AND CAST(YEAR(a.d_bill_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_bill_date) AS VARCHAR(4)),2) BETWEEN @c_yyyy_mm1 AND @c_yyyy_mm2 THEN f_bill ELSE 0 END) AS f_bill
				, SUM(CASE WHEN a.i_is_cancel = 0 THEN a.f_cut ELSE 0 END) AS f_cut
				, SUM(CASE WHEN a.i_is_cancel = 0 THEN a.f_for_debt ELSE 0 END) AS f_for_debt
				, SUM(CASE WHEN a.i_is_cancel = 0 THEN a.f_over ELSE 0 END) AS f_over
				, SUM(CASE WHEN c_yyyy_mm = @c_yyyy_mm_max THEN 
						CASE WHEN @c_yyyy_mm_max = '202009' THEN
							CASE WHEN a.i_is_cancel = 0 THEN a.f_remain ELSE (a.f_remain*-1) END
						ELSE
							CASE WHEN a.i_is_cancel = 1 AND CAST(YEAR(a.d_cancel_date) AS VARCHAR(4))+RIGHT('0'+CAST(MONTH(a.d_cancel_date) AS VARCHAR(4)),2) BETWEEN @c_yyyy_mm1 AND @c_yyyy_mm2 
							THEN (a.f_remain*-1)
							ELSE a.f_remain END
						END
					ELSE 0 END) AS f_remain
				FROM NMU.dbo.ar_process_summary a
				WHERE a.c_yyyy_mm BETWEEN @c_yyyy_mm1 AND @c_yyyy_mm2
				GROUP BY a.c_yyyy_mm, a.ar_treat_right_id, a.d_bill_date) a
					INNER JOIN NMU.dbo.ar_treat_right b ON a.ar_treat_right_id = b.ar_treat_right_id
					INNER JOIN NMU.dbo.ar_treat_right_group c ON b.ar_treat_right_group_id = c.ar_treat_right_group_id
				GROUP BY c.c_name
				ORDER BY c.c_name";

	$arrParam = array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);


	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"i_type"			=> 1,
				"no"				=> ++$totalCount,
				"group_name"		=> $row["group_name"],
				"f_for_debt"		=> $row["f_for_debt"],
				"year_c"			=> $row["year_c"],
				"year_1"			=> $row["year_1"],
				"year_2"			=> $row["year_2"],
				"year_3"			=> $row["year_3"],
				"year_4"			=> $row["year_4"],
				"year_5"			=> $row["year_5"],
				"year_less"			=> $row["year_less"],
				"f_remain"			=> $row["f_remain"],
			);
			${$root}[] = $temp;

			$f_for_debt	+= $row["f_for_debt"];
			$yc	+= $row["year_c"];
			$y1	+= $row["year_1"];
			$y2	+= $row["year_2"];
			$y3	+= $row["year_3"];
			$y4	+= $row["year_4"];
			$y5	+= $row["year_5"];
			$yl	+= $row["year_less"];
			$re	+= $row["f_remain"];
		}

		$temp = array(
			"i_type"			=> 2,
			"no"				=> NULL,
			"group_name"		=> "รวม",
			"f_for_debt"		=> $f_for_debt,
			"year_c"			=> $yc,
			"year_1"			=> $y1,
			"year_2"			=> $y2,
			"year_3"			=> $y3,
			"year_4"			=> $y4,
			"year_5"			=> $y5,
			"year_less"			=> $yl,
			"f_remain"			=> $re,
		);
		${$root}[] = $temp;

	}
	return json_encode(array(
		"debug"				=> true,
		$root				=> ${$root},
		"totalCount"		=> $totalCount,
		"year_c"			=> $yc,
		"year_1"			=> $y1,
		"year_2"			=> $y2,
		"year_3"			=> $y3,
		"year_4"			=> $y4,
		"year_5"			=> $y5,
		"year_less"			=> $yl,
		"f_remain"			=> $re
	));
}
