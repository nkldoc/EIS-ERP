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
$DB_NAME	= "";//'NMU_ERP..';
if ($_REQUEST["type"] == "ar_log") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	if ($mode == "SEARCH") {
	}

	$sqlMain = "
			SET NOCOUNT ON
			DECLARE @i_year AS INT = {$_POST["i_year"]};
			DECLARE @m_start AS DATE = DATEFROMPARTS(@i_year-1,10,1);
			DECLARE @m_end AS DATE = DATEADD(MONTH, 12, @m_start);
							
			DECLARE @m_current AS DATE = @m_start;
			DECLARE @i AS INT = 1;
							
			DECLARE @TABLE TABLE (c_mm VARCHAR(2), c_yyyy VARCHAR(4), c_yyyy_mm VARCHAR(6));

			DECLARE @d_next_month AS DATE;
			DECLARE @d_start_month AS DATE;

			--SELECT @d_next_month = DATEADD(MONTH, 1, DATEFROMPARTS( LEFT(CAST(MAX(c_yyyy_mm) AS VARCHAR(6)), 4), RIGHT(CAST(MAX(c_yyyy_mm) AS VARCHAR(6)), 2),1)) 
			--, @d_start_month = DATEFROMPARTS( LEFT(CAST(MIN(c_yyyy_mm) AS VARCHAR(6)), 4), RIGHT(CAST(MIN(c_yyyy_mm) AS VARCHAR(6)), 2),1)
			--FROM ar_process_summary;
				
			WHILE (@i <= 12)
			BEGIN
				INSERT @TABLE VALUES (RIGHT('0'+CAST(MONTH(@m_current) AS VARCHAR(2)), 2)
				, CAST(YEAR(@m_current) AS VARCHAR(6))
				, CAST(YEAR(@m_current) AS VARCHAR(6))+RIGHT('0'+CAST(MONTH(@m_current) AS VARCHAR(2)), 2));
				SET @m_current = DATEADD(MONTH, 1, @m_current);
				SET @i = @i+1;
			END

			SELECT 
				a.*
				,b.am_cal_depre_id
				,isnull(b.i_am_cal_depre,0) as i_am_cal_depre
				,isnull(b.i_am_send_donate,0) as i_am_send_donate
			FROM @TABLE a
			LEFT JOIN {$DB_NAME} am_cal_depre b ON a.c_yyyy_mm = b.c_yyyy_mm AND b.i_enable = 1
			ORDER BY a.c_yyyy_mm;";


	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		$i_cal = 0;
		while ($row = $db->Fetch($stmt)) {



			$temp = array(
				"no"                    => ++$numrow,
				"id"                    => $numrow,
				"c_mm"                  => $row["c_mm"],
				"c_yyyy"                => $row["c_yyyy"],
				"c_yyyy_mm"             => $row["c_yyyy_mm"],
				"s_mm"                  => ($row["c_mm"] != "") ? $date->l_month_thai[$row["c_mm"]] : "",
				"s_yyyy"                => ($row["c_yyyy"] != "") ? $row["c_yyyy"] + 543 : "",
				"am_cal_depre_id"       => $row["am_cal_depre_id"],
				"i_am_cal_depre"        => $i_cal == 1 ? 2 : $row["i_am_cal_depre"],
				"i_am_send_donate"      => $row["i_am_cal_depre"] == '' ? 2 : $row["i_am_send_donate"],

			);
			${$root}[] = $temp;
			if ($i_cal == 0 && $row["i_am_cal_depre"] == 0) {
				$i_cal = 1;
			}
		}
	}
	/*
	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);*/

	echo json_encode(array("debug" => true, "totalCount" => 12, $root => ${$root}));
	exit;
}
