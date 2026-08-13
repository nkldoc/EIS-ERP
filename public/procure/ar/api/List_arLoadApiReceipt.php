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
		
		DECLARE @TABLE TABLE (d_action_date DATE);
		
		WHILE (@d_current <= @d_end)
		BEGIN
			INSERT @TABLE (d_action_date) VALUES (@d_current);
			SET @d_current = DATEADD(DAY, 1, @d_current);
		END
		
		SELECT
			DISTINCT
			CONVERT(VARCHAR, a.d_action_date, 120) AS d_action_date
			,CASE
				WHEN a.d_action_date > DATEADD(DAY, -1, GETDATE()) THEN -1
				WHEN a1.i_success_gx = 1 THEN 3
				WHEN a1.i_success_approve = 1 THEN 2
				WHEN a1.i_success_ar = 1 THEN 1
				ELSE 0
			END i_success_receipt
			,CASE
				WHEN a.d_action_date > DATEADD(DAY, -1, GETDATE()) THEN -1
				WHEN a2.i_success_gx = 1 THEN 3
				WHEN a2.i_success_approve = 1 THEN 2
				WHEN a2.i_success_ar = 1 THEN 1
				ELSE 0
			END i_success_receipt_cancel
		INTO #TemData
		FROM @TABLE a
			LEFT JOIN dbo.ar_receipt_log a1 ON a1.d_action_date = CONVERT(DATE, a.d_action_date)
			LEFT JOIN dbo.ar_receipt_cancel_log a2 ON a2.d_action_date = CONVERT(DATE, a.d_action_date);
		
		SELECT * FROM #TemData
		ORDER BY i_success_receipt, i_success_receipt_cancel, d_action_date;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> ++$numrow,
				"id"								=> $numrow,
				"d_action_date"						=> ($row["d_action_date"] != "") ? $date->extDateBuddha($row["d_action_date"]) : "",
				"i_success_receipt"					=> $row["i_success_receipt"],
				"i_success_receipt_cancel"			=> $row["i_success_receipt_cancel"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
