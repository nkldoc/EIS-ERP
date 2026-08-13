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

	// $con .= " AND a.i_year = " . $_REQUEST["i_year"];
	// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
	// 	$con .= " AND a.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
	// }

	$sqlMain = "
		SET NOCOUNT ON;
		DECLARE @d_start_date DATETIME = '{$_REQUEST["d_date_start"]} 00:00:00.000';
		DECLARE @d_end_date DATETIME = '{$_REQUEST["d_date_end"]} 23:59:59.000';

		SELECT * FROM (
			SELECT
				1 AS i_type
				,NULL AS numrow
				,a.ar_bill_invoice_hdr_id
				,a.c_code
				,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
				,NULL AS debtor_type_name
				,NULL AS treat_right_name
				,NULL AS cost_name
				,NULL AS c_hn
				,NULL AS c_an
				,NULL AS c_patient
				,NULL AS d_service_date
				,NULL AS d_admission_date
				,NULL c_comment
				,NULL f_cost_amt
			FROM dbo.ar_bill_invoice_hdr a
			WHERE a.d_doc_date BETWEEN @d_start_date AND @d_end_date
			UNION ALL
			SELECT
				2 AS i_type
				,ROW_NUMBER() OVER (PARTITION BY a.ar_bill_invoice_hdr_id ORDER BY 
				/*d.d_doc_date,f.c_name, b.c_approve, e.c_code, CASE WHEN c.c_cheque IS NULL THEN 0 ELSE 1 END DESC, c.c_cheque*/
				b.c_hn
				) 
				AS numrow
				,a.ar_bill_invoice_hdr_id
				,NULL AS c_code
				,NULL AS d_doc_date
				,a1.c_code+' : '+a1.c_name AS debtor_type_name
				,a2.c_code+' : '+a2.c_name AS treat_right_name
				,a3.c_code+' : '+a3.c_name AS cost_name
				,b.c_hn
				,b.c_an
				,b.c_patient
				,CONVERT(VARCHAR, b.d_service_date, 120) AS d_service_date
				,CONVERT(VARCHAR, b.d_admission_date, 120) AS d_admission_date
				,b.c_comment
				,b.f_cost_amt
			FROM dbo.ar_bill_invoice_hdr a
				INNER JOIN dbo.ar_bill_invoice_dtl b ON a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id
				LEFT JOIN dbo.ar_debtor_type a1 ON b.ar_debtor_type_id = a1.ar_debtor_type_id
				LEFT JOIN dbo.ar_treat_right a2 ON b.ar_treat_right_id = a2.ar_treat_right_id
				LEFT JOIN dbo.ar_cost a3 ON b.ar_cost_id = a3.ar_cost_id
			WHERE a.d_doc_date BETWEEN @d_start_date AND @d_end_date
			UNION ALL
			SELECT
				3 AS i_type
				,NULL AS numrow
				,a.ar_bill_invoice_hdr_id
				,NULL AS c_code
				,NULL AS d_doc_date
				,NULL AS debtor_type_name
				,NULL AS treat_right_name
				,NULL AS cost_name
				,NULL AS c_hn
				,NULL AS c_an
				,NULL AS c_patient
				,NULL AS d_service_date
				,NULL AS d_admission_date
				,NULL AS c_comment
				,SUM(ISNULL(b.f_cost_amt,0)) AS f_cost_amt
			FROM dbo.ar_bill_invoice_hdr a
				INNER JOIN dbo.ar_bill_invoice_dtl b ON a.ar_bill_invoice_hdr_id = b.ar_bill_invoice_hdr_id
			WHERE a.d_doc_date BETWEEN @d_start_date AND @d_end_date
			GROUP BY a.ar_bill_invoice_hdr_id
		) a
		ORDER BY a.ar_bill_invoice_hdr_id, a.i_type, a.debtor_type_name, a.treat_right_name, a.cost_name;";

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"i_type"						=> $row["i_type"],
				"numrow"						=> $row["numrow"],
				"c_code"						=> $row["c_code"],
				"d_doc_date"					=> ($row["d_doc_date"] != "") ? $date->shot_date_from_db($row["d_doc_date"]) : "",
				"debtor_type_name"				=> $row["debtor_type_name"],
				"treat_right_name"				=> $row["treat_right_name"],
				"cost_name"						=> $row["cost_name"],
				"c_hn"							=> $row["c_hn"],
				"c_an"							=> $row["c_an"],
				"c_patient"						=> $row["c_patient"],
				"d_service_date"				=> ($row["d_service_date"] != "") ? $date->shot_date_from_db($row["d_service_date"]) : "",
				"d_admission_date"				=> ($row["d_admission_date"] != "") ? $date->shot_date_from_db($row["d_admission_date"]) : "",
				"c_comment"						=> $row["c_comment"],
				"f_cost_amt"					=> $row["f_cost_amt"],
			);
			${$root}[] = $temp;
		}
	}
	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
