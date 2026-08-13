<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if ($_REQUEST["type"] == "ar_log") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	if ($mode == "SEARCH") {
	}

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @i_year AS INT = {$_REQUEST["i_year"]};
		DECLARE @d_start AS DATE = DATEFROMPARTS(@i_year-1,10,1);
		DECLARE @d_end AS DATE = DATEFROMPARTS(@i_year,09,30);
		DECLARE @d_current AS DATE = @d_start;

		DECLARE @TABLE TABLE (d_start DATE, d_end DATE);
		DECLARE @i_month AS INT; /* จำนวนวันของเดือนนั้นๆ */

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
			,CASE
				WHEN a.d_end > DATEADD(DAY, -1, GETDATE()) THEN -1
				WHEN a1.i_success_gx = 1 THEN 3
				WHEN a1.i_success_approve = 1 THEN 2
				WHEN a1.i_success_ar = 1 THEN 1
				ELSE 0
			END i_success_bill
			,CASE
				WHEN a.d_end > DATEADD(DAY, -1, GETDATE()) THEN -1
				WHEN a2.i_success_gx = 1 THEN 3
				WHEN a2.i_success_approve = 1 THEN 2
				WHEN a2.i_success_ar = 1 THEN 1
				ELSE 0
			END i_success_bill_cancel
			,CASE
				WHEN a.d_end > DATEADD(DAY, -1, GETDATE()) THEN -1
				WHEN a3.i_success_gx = 1 THEN 3
				WHEN a3.i_success_approve = 1 THEN 2
				WHEN a3.i_success_ar = 1 THEN 1
				ELSE 0
			END i_success_cut
			,CASE
				WHEN a.d_end > DATEADD(DAY, -1, GETDATE()) THEN -1
				WHEN a4.i_success_gx = 1 THEN 3
				WHEN a4.i_success_approve = 1 THEN 2
				WHEN a4.i_success_ar = 1 THEN 1
				ELSE 0
			END i_success_cut_cancel
		INTO #TemData
		FROM @TABLE a
			LEFT JOIN dbo.ar_bill_log a1 ON a1.d_action_date BETWEEN CONVERT(DATE, a.d_start) AND CONVERT(DATE, a.d_end)
			LEFT JOIN dbo.ar_bill_cancel_log a2 ON a2.d_action_date BETWEEN CONVERT(DATE, a.d_start) AND CONVERT(DATE, a.d_end)
			LEFT JOIN dbo.ar_cut_log a3 ON a3.d_action_date BETWEEN CONVERT(DATE, a.d_start) AND CONVERT(DATE, a.d_end)
			LEFT JOIN dbo.ar_cut_cancel_log a4 ON a4.d_action_date BETWEEN CONVERT(DATE, a.d_start) AND CONVERT(DATE, a.d_end)

		SELECT * FROM #TemData
		ORDER BY i_success_bill, i_success_bill_cancel, i_success_cut, i_success_cut_cancel, d_start, d_end;

		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> ++$numrow,
				"id"								=> $numrow,
				"d_start"							=> ($row["d_start"] != "") ? $date->extDateBuddha($row["d_start"]) : "",
				"d_end"								=> ($row["d_end"] != "") ? $date->extDateBuddha($row["d_end"]) : "",
				"i_success_bill"					=> $row["i_success_bill"],
				"i_success_bill_cancel"				=> $row["i_success_bill_cancel"],
				"i_success_cut"						=> $row["i_success_cut"],
				"i_success_cut_cancel"				=> $row["i_success_cut_cancel"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
