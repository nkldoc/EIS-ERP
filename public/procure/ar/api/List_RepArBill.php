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
		if (@$_REQUEST["ar_bill_dtl_id"] > 0) {
			$con .= " AND b.ar_bill_dtl_id = {$_REQUEST["ar_bill_dtl_id"]}";
		} else {
			$con .= " AND a.d_bill_date BETWEEN '{$_REQUEST["d_date_start"]} 00:00:00.000' AND '{$_REQUEST["d_date_end"]} 23:59:59.000'";
		}
	} else if ($_REQUEST["type"] == "preview") { // arBillApprove
		$con .= " AND a.ar_bill_hdr_id = {$_REQUEST["preview_id"]}";
	} else {
		echo "ติดต่อ admin";
		exit;
	}

	$sqlMain = "
		SET NOCOUNT ON;
		SELECT
			a.ar_bill_hdr_id
			,ROW_NUMBER() OVER (PARTITION BY b.ar_bill_hdr_id ORDER BY b.ar_bill_hdr_id, a.c_code_bill, a.d_bill_date, a1.c_name, a2.c_name, a3.c_name, b.c_hn, c.d_service_date) AS numrow
			,a.c_code_bill
			,a.d_bill_date
			,c.ar_debtor_type_id
			,b.ar_treat_right_id
			,c.ar_cost_id
			,a1.c_name AS ar_debtor_type_name
			,a2.c_name AS ar_treat_right_name
			,a3.c_name AS ar_cost_name
			,b.c_hn
			,b.c_an
			,b.c_patient
			,c.d_service_date
			,c.d_encash_date
			,b.c_comment
			,c.lastdate
			,c.f_bill
		INTO #temp_data
		FROM ar_bill_hdr a
			INNER JOIN ar_bill_dtl b ON a.ar_bill_hdr_id = b.ar_bill_hdr_id
				AND b.i_enable = 1
				AND b.d_cancel_date IS NULL
			INNER JOIN dbo.ar_bill_item c ON b.ar_bill_dtl_id = c.ar_bill_dtl_id
				AND c.i_enable = 1

			LEFT JOIN dbo.ar_debtor_type a1 ON c.ar_debtor_type_id = a1.ar_debtor_type_id
			LEFT JOIN dbo.ar_treat_right a2 ON b.ar_treat_right_id = a2.ar_treat_right_id
			LEFT JOIN dbo.ar_cost a3 ON c.ar_cost_id = a3.ar_cost_id
		WHERE a.i_enable = 1 {$con};

		SELECT
			1 AS i_type
			,a.ar_bill_hdr_id
			,a.numrow
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_bill_date, 120) AS d_bill_date
			,a.ar_debtor_type_name
			,a.ar_treat_right_name
			,a.ar_cost_name
			,a.c_hn
			,a.c_an
			,a.c_patient
			,CONVERT(VARCHAR, a.d_service_date, 120) AS d_service_date
			,CONVERT(VARCHAR, a.d_encash_date, 120) AS d_encash_date
			,a.c_comment
			,CONVERT(VARCHAR, a.lastdate, 120) AS lastdate
			,a.f_bill
		FROM dbo.#temp_data a
		UNION ALL
		SELECT
			2 AS i_type
			,a.ar_bill_hdr_id
			,NULL AS numrow
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_bill_date, 120) AS d_bill_date
			,NULL AS ar_debtor_type_name
			,a.ar_treat_right_name
			,NULL AS ar_cost_name
			,NULL AS c_hn
			,NULL AS c_an
			,NULL AS c_patient
			,NULL AS d_service_date
			,NULL AS d_encash_date
			,NULL AS c_comment
			,NULL AS lastdate
			,SUM(ISNULL(a.f_bill,0)) AS f_bill
		FROM dbo.#temp_data a
		GROUP BY a.ar_bill_hdr_id, a.c_code_bill, a.d_bill_date, a.ar_treat_right_name
		UNION ALL
		SELECT
			3 AS i_type
			,a.ar_bill_hdr_id
			,NULL AS numrow
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_bill_date, 120) AS d_bill_date
			,NULL AS ar_debtor_type_name
			,NULL AS ar_treat_right_name
			,NULL AS ar_cost_name
			,NULL AS c_hn
			,NULL AS c_an
			,NULL AS c_patient
			,NULL AS d_service_date
			,NULL AS d_encash_date
			,NULL AS c_comment
			,NULL AS lastdate
			,SUM(ISNULL(a.f_bill,0)) AS f_bill
		FROM dbo.#temp_data a
		GROUP BY a.ar_bill_hdr_id, a.d_bill_date, a.c_code_bill
		UNION ALL
		SELECT
			4 AS i_type
			,NULL AS numrow
			,NULL AS ar_bill_hdr_id
			,NULL AS c_code_bill
			,'2050-12-12 00:00:00' AS d_bill_date
			,NULL AS ar_debtor_type_name
			,NULL AS ar_treat_right_name
			,NULL AS ar_cost_name
			,NULL AS c_hn
			,NULL AS c_an
			,NULL AS c_patient
			,NULL AS d_service_date
			,NULL AS d_encash_date
			,NULL AS c_comment
			,NULL AS lastdate
			,SUM(ISNULL(a.f_bill,0)) AS f_bill
		FROM dbo.#temp_data a
		ORDER BY d_bill_date, c_code_bill, ar_bill_hdr_id, i_type, ar_debtor_type_name, ar_treat_right_name, ar_cost_name, c_hn, d_service_date, d_encash_date, lastdate;";

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {

			$temp = array(
				"i_type"						=> $row["i_type"],
				"numrow"						=> $row["numrow"],
				"c_code_bill"					=> $row["c_code_bill"],
				"ar_debtor_type_name"			=> $row["ar_debtor_type_name"],
				"ar_treat_right_name"			=> $row["ar_treat_right_name"],
				"ar_cost_name"					=> $row["ar_cost_name"],
				"d_bill_date"					=> ($row["d_bill_date"] != "") ? $date->shot_date_from_db($row["d_bill_date"]) : "",
				"c_hn"							=> $row["c_hn"],
				"c_an"							=> $row["c_an"],
				"c_patient"						=> $row["c_patient"],
				"d_service_date"				=> ($row["d_service_date"] != "") ? $date->shot_date_from_db($row["d_service_date"]) : "",
				"d_encash_date"					=> ($row["d_encash_date"] != "") ? $date->shot_date_from_db($row["d_encash_date"]) : "",
				"c_comment"						=> $row["c_comment"],
				"lastdate"						=> ($row["lastdate"] != "") ? $date->shot_datetime_from_db($row["lastdate"]) : "",
				"f_bill"						=> $row["f_bill"],
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
