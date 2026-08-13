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

	if ($_REQUEST["type"] == "html" || $_REQUEST["type"] == "excel") {
		if (@$_REQUEST["ar_cut_dtl_id"] > 0) {
			$con .= " AND b.ar_cut_dtl_id = " . $_REQUEST["ar_cut_dtl_id"];
		} else {
			$con .= " AND a.d_cut_date BETWEEN '{$_REQUEST["d_date_start"]} 00:00:00.000' AND '{$_REQUEST["d_date_end"]} 23:59:59.000'";
		}
	} else if ($_REQUEST["type"] == "preview") { // arcutApprove
		$con .= " AND a.ar_cut_hdr_id = {$_REQUEST["preview_id"]}";
	} else {
		echo "ติดต่อ admin";
		exit;
	}

	$sqlMain = "
		SET NOCOUNT ON;
		SELECT
			0 AS i_adjust
			,ROW_NUMBER() OVER (PARTITION BY b.ar_cut_hdr_id ORDER BY a.ar_cut_hdr_id, a.c_code_cut, a.d_cut_date, b.ar_treat_right_id, c.ar_cost_id ,c.d_service_date) AS numrow
			,a.ar_cut_hdr_id
			,c.ar_cut_item_id
			,c.ar_debtor_type_id
			,b.ar_treat_right_id
			,c.ar_cost_id
			,b.c_code_bill
			,a.c_code_cut
			,CONVERT(VARCHAR, a.d_cut_date, 120) AS d_cut_date
			,b.c_hn
			,b.c_an
			,b.c_patient
			,CONVERT(VARCHAR, c.d_service_date, 120) AS d_service_date
			,CONVERT(VARCHAR, c.d_encash_date, 120) AS d_encash_date
			,c.f_cut
			,CONVERT(VARCHAR, c.lastdate, 120) AS lastdate
		INTO #temp_data
		FROM ar_cut_hdr a
			INNER JOIN ar_cut_dtl b ON a.ar_cut_hdr_id = b.ar_cut_hdr_id
				AND b.i_enable = 1
			INNER JOIN ar_cut_item c ON b.ar_cut_dtl_id = c.ar_cut_dtl_id
				AND c.i_enable = 1
		WHERE a.i_enable = 1
			{$con};
		
		/* รับเพิ่ม/คืนเงิน */
		SELECT
			*
		INTO #temp_adjust
		FROM (
			SELECT * FROM #temp_data a
			UNION ALL
			SELECT
				1 AS i_adjust
				,a.numrow
				,a.ar_cut_hdr_id
				,a.ar_cut_item_id
				,a.ar_debtor_type_id
				,a.ar_treat_right_id
				,a.ar_cost_id
				,a.c_code_bill
				,a.c_code_cut
				,CONVERT(VARCHAR, a.d_cut_date, 120) AS d_cut_date
				,a.c_hn
				,a.c_an
				,a.c_patient
				,CONVERT(VARCHAR, a.d_service_date, 120) AS d_service_date
				,CONVERT(VARCHAR, a.d_encash_date, 120) AS d_encash_date
				,ISNULL(b.f_dr,0) - ISNULL(b.f_cr,0) AS f_cut
				,CONVERT(VARCHAR, b.d_update, 120) AS d_update
			FROM #temp_data a
				INNER JOIN ar_cut_adjust b ON a.ar_cut_item_id = b.ar_cut_item_id
					AND b.i_enable = 1
		) z
		
		SELECT
			*
		INTO #tempData
		FROM (
			SELECT 1 AS i_type,* FROM #temp_adjust
			UNION ALL
			/* SUM treat_right */
			SELECT
				2 AS i_type
				,NULL AS i_adjust
				,NULL AS numrow
				,a.ar_cut_hdr_id
				,NULL AS ar_cut_item_id
				,NULL AS ar_debtor_type_id
				,a.ar_treat_right_id
				,NULL AS ar_cost_id
				,NULL AS c_code_bill
				,a.c_code_cut
				,a.d_cut_date
				,NULL AS c_hn
				,NULL AS c_an
				,NULL AS c_patient
				,NULL AS d_service_date
				,NULL AS d_encash_date
				,SUM(a.f_cut) AS f_cut
				,NULL AS lastdate
			FROM #temp_adjust a
			GROUP BY a.ar_cut_hdr_id, a.ar_treat_right_id, a.c_code_cut, a.d_cut_date
			UNION ALL
			/* SUM BILL */
			SELECT
				3 AS i_type
				,NULL AS i_adjust
				,NULL AS numrow
				,a.ar_cut_hdr_id
				,NULL AS ar_cut_item_id
				,NULL AS ar_debtor_type_id
				,NULL AS ar_treat_right_id
				,NULL AS ar_cost_id
				,NULL AS c_code_bill
				,a.c_code_cut
				,a.d_cut_date
				,NULL AS c_hn
				,NULL AS c_an
				,NULL AS c_patient
				,NULL AS d_service_date
				,NULL AS d_encash_date
				,SUM(a.f_cut) AS f_cut
				,NULL AS lastdate
			FROM #temp_adjust a
			GROUP BY a.ar_cut_hdr_id, a.c_code_cut, a.d_cut_date
			UNION ALL
			/* SUM TOTAL */
			SELECT
				4 AS i_type
				,NULL AS i_adjust
				,NULL AS numrow
				,NULL AS ar_cut_hdr_id
				,NULL AS ar_cut_item_id
				,NULL AS ar_debtor_type_id
				,NULL AS ar_treat_right_id
				,NULL AS ar_cost_id
				,NULL AS c_code_bill
				,NULL AS c_code_cut
				,'2050-12-12 00:00:00' AS d_cut_date
				,NULL AS c_hn
				,NULL AS c_an
				,NULL AS c_patient
				,NULL AS d_service_date
				,NULL AS d_encash_date
				,SUM(a.f_cut) AS f_cut
				,NULL AS lastdate
			FROM #temp_adjust a
		) zz
		
		SELECT
			a1.c_name AS debtor_type_name
			,a2.c_name AS treat_right_name
			,a3.c_name AS cost_name
			,a.*
		FROM #tempData a
			LEFT JOIN ar_debtor_type a1 ON a.ar_debtor_type_id		= a1.ar_debtor_type_id
			LEFT JOIN ar_treat_right a2 ON a.ar_treat_right_id		= a2.ar_treat_right_id
			LEFT JOIN ar_cost a3 ON a.ar_cost_id					= a3.ar_cost_id
		ORDER by d_cut_date, c_code_cut, i_type, numrow, i_adjust, d_service_date, lastdate DESC;";

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"i_type"						=> $row["i_type"],
				"i_adjust"						=> $row["i_adjust"],
				"numrow"						=> ($row["i_adjust"] == 0) ? $row["numrow"] : "",
				"c_code_bill"					=> ($row["i_adjust"] == 0) ? $row["c_code_bill"] : "",
				"c_code_cut"					=> ($row["i_adjust"] == 0) ? $row["c_code_cut"] : "",
				"debtor_type_name"				=> ($row["i_adjust"] == 0) ? $row["debtor_type_name"] : "",
				"treat_right_name"				=> ($row["i_adjust"] == 0) ? $row["treat_right_name"] : "",
				"cost_name"						=> ($row["i_adjust"] == 0) ? $row["cost_name"] : "",
				"d_cut_date"					=> ($row["i_adjust"] == 0 && $row["d_cut_date"] != "") ? $date->shot_date_from_db($row["d_cut_date"]) : "",
				"c_hn"							=> ($row["i_adjust"] == 0) ? $row["c_hn"] : "",
				"c_an"							=> ($row["i_adjust"] == 0) ? $row["c_an"] : "",
				"c_patient"						=> ($row["i_adjust"] == 0) ? $row["c_patient"] : "",
				"d_service_date"				=> ($row["i_adjust"] == 0 && $row["d_service_date"] != "") ? $date->shot_date_from_db($row["d_service_date"]) : "",
				"d_encash_date"					=> ($row["i_adjust"] == 0 && $row["d_encash_date"] != "") ? $date->shot_date_from_db($row["d_encash_date"]) : "",
				"lastdate"						=> ($row["lastdate"] != "") ? $date->shot_datetime_from_db($row["lastdate"]) : "",
				"f_cut"							=> $row["f_cut"],
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
