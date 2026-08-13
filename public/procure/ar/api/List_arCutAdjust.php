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

if ($_REQUEST["type"] == "ar_cut_adjust") {

	$mode				= @$_REQUEST["mode"];

	if ($mode == "SEARCH") {
		if ($_REQUEST["c_code_cut"] != "") {
			$con .= " AND a.c_code_cut LIKE '%{$_REQUEST["c_code_cut"]}%'";
		}
		if ($_REQUEST["c_hn"] != "") {
			$con .= " AND b.c_hn LIKE '%{$_REQUEST["c_hn"]}%'";
		}
	}

	$sqlMain = "	
		SET NOCOUNT ON
		/* DATA */
		SELECT
			TOP 50
			d.ar_cut_adjust_id
		INTO #TemData
		FROM dbo.ar_cut_hdr a
			INNER JOIN dbo.ar_cut_dtl b ON a.ar_cut_hdr_id = b.ar_cut_hdr_id
				AND b.i_enable = 1
			INNER JOIN dbo.ar_cut_item c ON b.ar_cut_dtl_id = c.ar_cut_dtl_id
				AND c.i_enable = 1
			INNER JOIN dbo.ar_cut_adjust d ON c.ar_cut_item_id = d.ar_cut_item_id
				AND d.i_enable = 1
		WHERE a.i_enable = 1
			{$con}
		ORDER BY d.ar_cut_adjust_id DESC;
		
		SELECT
			b.ar_cut_adjust_id
			,e.c_code_cut
			,CONVERT(VARCHAR, e.d_cut_date, 120) AS d_cut_date
			,d.ar_treat_right_id
			,a1.c_name AS ar_treat_right_name
			,c.ar_cost_id
			,a2.c_name AS ar_cost_name
			,d.c_hn
			,d.c_an
			,d.c_patient
			,CONVERT(VARCHAR, c.d_service_date, 120) AS d_service_date
			,c.c_service_time
			,CONVERT(VARCHAR, c.d_encash_date, 120) AS d_encash_date
			,c.c_encash_time
			,c.f_cut
			,b.f_dr
			,b.f_cr
			,ISNULL(c.f_cut,0) - (ISNULL(b.f_cr,0) - ISNULL(b.f_dr,0)) AS f_total
			,b.c_comment
		FROM #TemData a
			INNER JOIN dbo.ar_cut_adjust b ON a.ar_cut_adjust_id = b.ar_cut_adjust_id
			INNER JOIN ar_cut_item c ON b.ar_cut_item_id = c.ar_cut_item_id
			INNER JOIN ar_cut_dtl d ON c.ar_cut_dtl_id = d.ar_cut_dtl_id
			INNER JOIN ar_cut_hdr e ON d.ar_cut_hdr_id = e.ar_cut_hdr_id
			
			LEFT JOIN ar_treat_right a1 ON d.ar_treat_right_id = a1.ar_treat_right_id
			LEFT JOIN ar_cost a2 ON c.ar_cost_id = a2.ar_cost_id
		ORDER BY b.ar_cut_adjust_id DESC;
				
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		while ($row = $db->Fetch($stmt)) {

			if ($row["c_service_time"] != "") {
				$c_service_time = substr($row["c_service_time"], 0, 2) . ":" . substr($row["c_service_time"], 2, 2) . ":" . substr($row["c_service_time"], 4, 2) . " น.";
			} else {
				$c_service_time = "";
			}

			if ($row["c_encash_time"] != "") {
				$c_encash_time = substr($row["c_encash_time"], 0, 2) . ":" . substr($row["c_encash_time"], 2, 2) . ":" . substr($row["c_encash_time"], 4, 2) . " น.";
			} else {
				$c_encash_time = "";
			}

			$temp = array(
				"no"								=> ++$numrow,
				"id"								=> $row["ar_cut_adjust_id"],
				"c_code_cut"						=> $row["c_code_cut"],
				"d_cut_date"						=> ($row["d_cut_date"] != "") ? $date->extDateBuddha($row["d_cut_date"]) : "",
				"ar_treat_right_name"				=> $row["ar_treat_right_name"],
				"ar_cost_name"						=> $row["ar_cost_name"],
				"c_hn"								=> $row["c_hn"],
				"c_an"								=> $row["c_an"],
				"c_patient"							=> $row["c_patient"],
				"d_service_date"					=> ($row["d_service_date"] != "") ? $date->extDateBuddha($row["d_service_date"]) : "",
				"c_service_time"					=> $c_service_time,
				"d_encash_date"						=> ($row["d_encash_date"] != "") ? $date->extDateBuddha($row["d_encash_date"]) : "",
				"c_encash_time"						=> $c_encash_time,
				"f_cut"								=> $row["f_cut"],
				"f_dr"								=> $row["f_dr"],
				"f_cr"								=> $row["f_cr"],
				"f_total"							=> $row["f_total"],
				"c_comment"							=> ($row["c_comment"] != "") ? $row["c_comment"] : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "ar_cut") {

	$mode				= @$_REQUEST["mode"];

	if ($mode == "SEARCH") {
		if ($_REQUEST["c_code_cut"] != "") {
			$con .= " AND a.c_code_cut LIKE '%{$_REQUEST["c_code_cut"]}%'";
		}
		if ($_REQUEST["c_hn"] != "") {
			$con .= " AND b.c_hn LIKE '%{$_REQUEST["c_hn"]}%'";
		}
	}

	$sqlMain = "	
		SET NOCOUNT ON
		/* DATA */
		SELECT
			TOP 50
			c.ar_cut_item_id
		INTO #TemData
		FROM dbo.ar_cut_hdr a
			INNER JOIN dbo.ar_cut_dtl b ON a.ar_cut_hdr_id = b.ar_cut_hdr_id
			INNER JOIN dbo.ar_cut_item c ON b.ar_cut_dtl_id = c.ar_cut_dtl_id
		WHERE 1=1
			{$con}
		ORDER BY c.ar_cut_item_id DESC;
		
		SELECT
			b.ar_cut_item_id
			,d.c_code_cut
			,CONVERT(VARCHAR, d.d_cut_date, 120) AS d_cut_date
			,c.ar_treat_right_id
			,a1.c_name AS ar_treat_right_name
			,b.ar_cost_id
			,a2.c_name AS ar_cost_name
			,c.c_hn
			,c.c_an
			,c.c_patient
			,CONVERT(VARCHAR, b.d_service_date, 120) AS d_service_date
			,b.c_service_time
			,CONVERT(VARCHAR, b.d_encash_date, 120) AS d_encash_date
			,b.c_encash_time
			,b.f_cut
		FROM #TemData a
			INNER JOIN ar_cut_item b ON a.ar_cut_item_id = b.ar_cut_item_id
			INNER JOIN ar_cut_dtl c ON b.ar_cut_dtl_id = c.ar_cut_dtl_id
			INNER JOIN ar_cut_hdr d ON c.ar_cut_hdr_id = d.ar_cut_hdr_id
			
			LEFT JOIN ar_treat_right a1 ON c.ar_treat_right_id = a1.ar_treat_right_id
			LEFT JOIN ar_cost a2 ON b.ar_cost_id = a2.ar_cost_id
		ORDER BY d.c_code_cut, c.c_hn, b.d_service_date;
				
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		while ($row = $db->Fetch($stmt)) {

			if ($row["c_service_time"] != "") {
				$c_service_time = substr($row["c_service_time"], 0, 2) . ":" . substr($row["c_service_time"], 2, 2) . ":" . substr($row["c_service_time"], 4, 2) . " น.";
			} else {
				$c_service_time = "";
			}

			if ($row["c_encash_time"] != "") {
				$c_encash_time = substr($row["c_encash_time"], 0, 2) . ":" . substr($row["c_encash_time"], 2, 2) . ":" . substr($row["c_encash_time"], 4, 2) . " น.";
			} else {
				$c_encash_time = "";
			}

			$temp = array(
				"no"								=> ++$numrow,
				"id"								=> $row["ar_cut_item_id"],
				"c_code_cut"						=> $row["c_code_cut"],
				"d_cut_date"						=> ($row["d_cut_date"] != "") ? $date->extDateBuddha($row["d_cut_date"]) : "",
				"ar_treat_right_name"				=> $row["ar_treat_right_name"],
				"ar_cost_name"						=> $row["ar_cost_name"],
				"c_hn"								=> $row["c_hn"],
				"c_an"								=> $row["c_an"],
				"c_patient"							=> $row["c_patient"],
				"d_service_date"					=> ($row["d_service_date"] != "") ? $date->extDateBuddha($row["d_service_date"]) : "",
				"c_service_time"					=> $c_service_time,
				"d_encash_date"						=> ($row["d_encash_date"] != "") ? $date->extDateBuddha($row["d_encash_date"]) : "",
				"c_encash_time"						=> $c_encash_time,
				"f_cut"								=> $row["f_cut"]
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
