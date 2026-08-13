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

if ($_REQUEST["type"] == "ar_bill") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 

	// if ($mode == "SEARCH") {

	// 	if ($_REQUEST["value"] != "") {
	// 		$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
	// 	}
	// }

	$sqlMain = "
		SET NOCOUNT ON;

		DECLARE @d_start DATETIME = '{$_REQUEST["d_start"]} 00:00:00.000';
		DECLARE @d_end DATETIME = '{$_REQUEST["d_end"]} 23:59:59.000';

		/* เรียกเก็บ */
		SELECT
			a2.ar_treat_right_group_id
			,a2.c_name
			,SUM(ISNULL(ccc.f_bill,0)) AS f_bill
			,0 AS f_cut
		INTO #TemData1
		FROM dbo.ar_bill_hdr aaa
			INNER JOIN dbo.ar_bill_dtl bbb ON aaa.ar_bill_hdr_id = bbb.ar_bill_hdr_id
				AND bbb.i_enable = 1
				AND bbb.i_status = 1
			INNER JOIN dbo.ar_bill_item ccc ON bbb.ar_bill_dtl_id = ccc.ar_bill_dtl_id
				AND ccc.i_enable = 1
			INNER JOIN dbo.ar_treat_right a1 ON bbb.ar_treat_right_id = a1.ar_treat_right_id
			INNER JOIN dbo.ar_treat_right_group a2 ON a1.ar_treat_right_group_id = a2.ar_treat_right_group_id
		WHERE aaa.i_enable = 1
			AND 1 = (SELECT DISTINCT i_success_approve FROM dbo.ar_bill_log WHERE d_action_date BETWEEN @d_start AND @d_end)
			AND ccc.lastdate BETWEEN @d_start AND @d_end
		GROUP BY a2.ar_treat_right_group_id, a2.c_name;

		/* ตัดชำระ */
		SELECT
			a2.ar_treat_right_group_id
			,a2.c_name
			,0 AS f_bill
			,SUM(ISNULL(ccc.f_cut,0)) AS f_cut
		INTO #TemData2
		FROM dbo.ar_cut_hdr aaa
			INNER JOIN dbo.ar_cut_dtl bbb ON aaa.ar_cut_hdr_id = bbb.ar_cut_hdr_id
				AND bbb.i_enable = 1
				AND bbb.i_status = 1
			INNER JOIN dbo.ar_cut_item ccc ON bbb.ar_cut_dtl_id = ccc.ar_cut_dtl_id
				AND ccc.i_enable = 1
			INNER JOIN dbo.ar_treat_right a1 ON bbb.ar_treat_right_id = a1.ar_treat_right_id
			INNER JOIN dbo.ar_treat_right_group a2 ON a1.ar_treat_right_group_id = a2.ar_treat_right_group_id
		WHERE aaa.i_enable = 1
			AND 1 = (SELECT DISTINCT i_success_approve FROM dbo.ar_cut_log WHERE d_action_date BETWEEN @d_start AND @d_end)
			AND ccc.lastdate BETWEEN @d_start AND @d_end
		GROUP BY a2.ar_treat_right_group_id, a2.c_name;









		SELECT
			CASE
				WHEN a.ar_treat_right_group_id IS NOT NULL THEN a.ar_treat_right_group_id
				WHEN b.ar_treat_right_group_id IS NOT NULL THEN b.ar_treat_right_group_id
			END AS ar_treat_right_group_id
			,CASE
				WHEN a.ar_treat_right_group_id IS NOT NULL THEN a.c_name
				WHEN b.ar_treat_right_group_id IS NOT NULL THEN b.c_name
			END AS c_name
			,ISNULL(a.f_bill,0) AS f_bill
			,ISNULL(b.f_cut,0) AS f_cut
		INTO #TemData
		FROM #TemData1 a
			FULL JOIN #TemData2 b ON a.ar_treat_right_group_id = b.ar_treat_right_group_id;

		SELECT 
			ROW_NUMBER() OVER (ORDER BY a.c_name) AS numrow
			,*
		FROM #TemData a ORDER BY a.c_name;

		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		$f_bill = 0;
		$f_cut = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"							=> 1,
				"no"								=> $row["numrow"],
				"id"								=> $row["ar_treat_right_group_id"],
				"c_name"							=> $row["c_name"],
				"f_bill"							=> $row["f_bill"],
				"f_cut"								=> $row["f_cut"],
			);

			${$root}[] = $temp;

			$f_bill	+= $row["f_bill"];
			$f_cut	+= $row["f_cut"];
		}

		$d_start = $date->shot_date_from_db($_REQUEST["d_start"]);
		$d_end = $date->shot_date_from_db($_REQUEST["d_end"]);

		$c_name = substr($d_start, 0, -5) . " - " . $d_end;

		$temp = array(
			"i_type"							=> 2,
			"c_name"							=> "รวม " . $c_name,
			"f_bill"							=> $f_bill,
			"f_cut"								=> $f_cut,
		);

		${$root}[] = $temp;
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
