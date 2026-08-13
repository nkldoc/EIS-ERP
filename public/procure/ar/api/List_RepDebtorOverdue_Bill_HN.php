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

	$sqlMain = "
		SET NOCOUNT ON;
		SELECT
			a1.c_name AS ar_debtor_type_name
			,a2.c_name AS ar_treat_right_name
			,a3.c_name AS ar_cost_name
			,c.c_hn
			,c.c_an
			,c.c_patient
			,CONVERT(VARCHAR, c.d_service_date, 120) AS d_service_date
			,CONVERT(VARCHAR, c.d_encash_date, 120) AS d_encash_date
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_bill_date, 120) AS d_bill_date
			,c.f_bill
			,c.i_numrow_last
			,CONVERT(VARCHAR, c.d_update, 120) AS d_update
		FROM dbo.ar_bill_invoice_hdr a
			INNER JOIN dbo.ar_bill_invoice_dtl b ON a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id
			LEFT JOIN dbo.ar_bill_invoice_dtl c ON b.ar_debtor_type_id = c.ar_debtor_type_id
				AND b.ar_treat_right_id = c.ar_treat_right_id
				AND ISNULL(b.c_hn,'') = ISNULL(c.c_hn,'')
				AND ISNULL(b.c_an,'') = ISNULL(c.c_an,'')
				AND b.d_service_date = c.d_service_date
				AND b.c_service_time = c.c_service_time
				AND b.d_encash_date = c.d_encash_date

			LEFT JOIN dbo.ar_debtor_type a1 ON c.ar_debtor_type_id = a1.ar_debtor_type_id AND a1.i_enable = 1
			LEFT JOIN dbo.ar_treat_right a2 ON c.ar_treat_right_id = a2.ar_treat_right_id AND a2.i_enable = 1
			LEFT JOIN dbo.ar_cost a3 ON c.ar_cost_id = a3.ar_cost_id AND a3.i_enable = 1
		WHERE b.ar_bill_invoice_dtl_id = {$_REQUEST["ar_bill_invoice_dtl_id"]}
		ORDER BY c.i_numrow_last DESC;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"									=> ++$no,
				"ar_debtor_type_name"					=> $row["ar_debtor_type_name"],
				"ar_treat_right_name"					=> $row["ar_treat_right_name"],
				"ar_cost_name"							=> $row["ar_cost_name"],
				"c_hn"									=> $row["c_hn"],
				"c_an"									=> $row["c_an"],
				"c_patient"								=> $row["c_patient"],
				"d_service_date"						=> ($row["d_service_date"] != "") ? $date->shot_date_from_db($row["d_service_date"]) : "",
				"d_encash_date"							=> ($row["d_encash_date"] != "") ? $date->shot_date_from_db($row["d_encash_date"]) : "",
				"c_code_bill"							=> $row["c_code_bill"],
				"d_bill_date"							=> ($row["d_bill_date"] != "") ? $date->shot_date_from_db($row["d_bill_date"]) : "",
				"f_bill"								=> $row["f_bill"],
				"i_numrow_last"							=> $row["i_numrow_last"],
				"d_update"								=> $row["d_update"],
			);
			${$root}[]	= $temp;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
