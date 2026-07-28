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
$DB_NAME	= ""; //'NMU_ERP..';
if ($_REQUEST["type"] == "ar_log") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	if ($mode == "SEARCH") {
		if ($_REQUEST["c_acc_code"] > 0) {
			$con .= " AND acc_code = " . $_REQUEST["c_acc_code"];
		}
	} else {
		$con .= " AND acc_code = '10205010101'";
	}

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 40;
	} else {
		$limit = ($limit + $start);
	}


	$sqlMain = "
	SET NOCOUNT ON
	SELECT 
		ROW_NUMBER() OVER(ORDER BY d_receive_date ASC) AS irow 
		,* 
		,CONVERT(VARCHAR(10),d_receive_date,120) AS receive_date
		into #TemData
	FROM am_asset_hdr 
	WHERE 1 = 1 
		{$con};

	SELECT 
			* 
		FROM #TemData a
		WHERE a.irow > ? AND a.irow <= ?;

	SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		$i_cal = 0;
		while ($row = $db->Fetch($stmt)) {



			$temp = array(
				"no"                      => $row["irow"],
				"id"                      => $row["am_asset_hdr_id"],
				"c_code"                  => $row["c_code"],
				"acc_code"                => $row["acc_code"],
				"acc_name"                => $row["acc_name"],
				"c_name"                  => $row["c_name"],
				"f_unit_cost"             => $row["f_unit_cost"],
				"i_period_year"           => $row["i_period_year"],
				"i_budget_year"           => $row["i_budget_year"],
				"d_receive_date"		  => ($row["receive_date"] != "") ? $date->extDateBuddha($row["receive_date"]) : "",

			);
			${$root}[] = $temp;
			// if ($i_cal == 0 && $row["i_am_cal_depre"] == 0) {
			// 	$i_cal = 1;
			// }
		}
	}



	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "acc_mode") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	if ($mode == "SEARCH") {
	}

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 40;
	} else {
		$limit = ($limit + $start);
	}


	$sqlMain = "
	select DISTINCT dc_acc_id, c_acc_code,c_acc_name  from am_mode_acc";


	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		$i_cal = 0;
		while ($row = $db->Fetch($stmt)) {



			$temp = array(

				"dc_acc_id"                => $row["dc_acc_id"],
				"c_acc_code"               => $row["c_acc_code"],
				"c_acc_name"               => $row["c_acc_name"],


			);
			${$root}[] = $temp;
			// if ($i_cal == 0 && $row["i_am_cal_depre"] == 0) {
			// 	$i_cal = 1;
			// }
		}
	}


	/*
	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);*/

	echo json_encode(array("debug" => true, "totalCount" => 100, $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "am_asset_item") {
	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.am_asset_item_id) AS numrow
			,a.am_asset_item_id
			,a.c_name
			,a.c_comment
		INTO #TemData
		FROM dbo.am_asset_item a
		WHERE 
			i_enable = 1
			AND a.am_asset_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"            => $row["numrow"],
				"id"            => $row["am_asset_item_id"],
				"c_name"        => $row["c_name"],
				"c_comment"     => $row["c_comment"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
