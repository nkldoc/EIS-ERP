<?php
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db		= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root	= "data";
$data	= array();
$con	= null;

if ($_REQUEST["type"] == "GROUP_DATE") {

	$sqlMain	= "
		SET NOCOUNT ON
		DECLARE @d_start AS DATE = (SELECT MIN(d_action_date) FROM dbo.ar_bill_log a WHERE a.i_success_api = 1 AND a.i_success_ar = 1 AND a.i_success_approve = 0);
		DECLARE @d_end AS DATE = (SELECT MAX(d_action_date) FROM dbo.ar_bill_log a WHERE a.i_success_api = 1 AND a.i_success_ar = 1 AND a.i_success_approve = 0);
		DECLARE @d_current AS DATE = @d_start;
		
		DECLARE @TABLE TABLE (d_start DATE, d_end DATE);
		DECLARE @i_month AS INT = 15; /* จำนวนวันของเดือนนั้นๆ */
		
		WHILE (@d_current <= @d_end)
		BEGIN
			IF(DAY(@d_current) < 15)
				BEGIN
					SET @i_month = 15;
				END
			ELSE
				BEGIN
					SET @i_month = DAY(EOMONTH(@d_current)) - @i_month;
				END
			INSERT @TABLE (d_start, d_end) VALUES (@d_current, DATEADD(DAY, @i_month-1, @d_current));
			SET @d_current = DATEADD(DAY, @i_month, @d_current);
		END
		
		SELECT
			DISTINCT
			CONVERT(VARCHAR, a.d_start, 120) AS d_start
			,CONVERT(VARCHAR, a.d_end, 120) AS d_end
		INTO #TemData
		FROM @TABLE a;
		
		SELECT * FROM #TemData
		ORDER BY d_start, d_end;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam	= array(STATUS_ENABLE, DELETE_FALSE);
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if ($stmt) {
		if (@$_REQUEST["all"] == "all") {
			${$root}[] = array(
				"id"		=> "0",
				"c_name"	=> "- เลือกทั้งหมด -"
			);
		}

		$numrow = 0;
		while ($row = $db->Fetch($stmt)) {

			$d_start = $date->shot_date_from_db($row["d_start"]);
			$d_end = $date->shot_date_from_db($row["d_end"]);

			$c_name = substr($d_start, 0, -5) . " - " . $d_end;

			$temp = array(
				"id"		=> "" . (++$numrow) . "",
				"c_name"	=> $c_name,
				"d_start"	=> $date->extDateBuddha($row["d_start"]),
				"d_end"		=> $date->extDateBuddha($row["d_end"]),
			);
			${$root}[] = $temp;
		}
	}
}

echo json_encode(array("debug" => true, $root => ${$root}));
exit;
