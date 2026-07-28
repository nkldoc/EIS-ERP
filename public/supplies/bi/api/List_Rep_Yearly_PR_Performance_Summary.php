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
	$sqlMain = "SET NOCOUNT ON
	 			MERGE NMU_ERP.dbo.pr_year_summary AS T
						USING (
							SELECT
								fiscal_year  AS year_th,
								fiscal_month AS month_no,
								COUNT(*)     AS total_pr
							FROM (
								SELECT
									TRY_CONVERT(INT, SUBSTRING(c_code, 3, 4)) AS doc_year,
									TRY_CONVERT(INT, SUBSTRING(c_code, 7, 2)) AS doc_month,
									CASE 
										WHEN TRY_CONVERT(INT, SUBSTRING(c_code, 7, 2)) >= 10
											THEN TRY_CONVERT(INT, SUBSTRING(c_code, 3, 4)) + 1
										ELSE TRY_CONVERT(INT, SUBSTRING(c_code, 3, 4))
									END AS fiscal_year,
									CASE 
										WHEN TRY_CONVERT(INT, SUBSTRING(c_code, 7, 2)) >= 10
											THEN TRY_CONVERT(INT, SUBSTRING(c_code, 7, 2)) - 9
										ELSE TRY_CONVERT(INT, SUBSTRING(c_code, 7, 2)) + 3
									END AS fiscal_month
								FROM NMU_ERP..SP_Tor
								WHERE c_code LIKE 'PR%'
								AND i_enabled = 1 
								AND i_type_bg = 1
							) X
							WHERE fiscal_year >= 2569
							GROUP BY fiscal_year, fiscal_month
						) AS S
						ON  T.year_th  = S.year_th
						AND T.month_no = S.month_no

						WHEN MATCHED THEN
							UPDATE SET T.total_pr = S.total_pr

						WHEN NOT MATCHED THEN
							INSERT (year_th, month_no, total_pr)
							VALUES (S.year_th, S.month_no, S.total_pr);

						WITH base AS (
							SELECT
								year_th,
								month_no,
								total_pr,
								source_type
							FROM NMU_ERP.dbo.pr_year_summary
						)
						SELECT
							year_th,
							month_no,
							total_pr,
							CASE 
								WHEN source_type = 1 THEN total_pr  -- ปีเก่า: เป็นยอดสะสมอยู่แล้ว
								ELSE SUM(total_pr) OVER (
										PARTITION BY year_th
										ORDER BY month_no
										ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
									)                             -- ปีใหม่: ให้ SQL คิดยอดสะสมให้
							END AS cumulative_total
						FROM base
						ORDER BY year_th, month_no ;";
	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$i = 0;
		while ($row = $db->Fetch($stmt)) {
			$rowsBudget = array(
				"no"                => ++$i,
				"year_th"           => $row["year_th"],
				"year_en"    		=> intVal($row["year_th"]) - 543,
				"month_no"          => $row["month_no"],
				"total_pr"    		=> intVal($row["total_pr"]),
				"cumulative_total"  => intVal($row["cumulative_total"])
			);
			${$root}[] = $rowsBudget;
		}
	}
	// print_r($root);
	// exit;
	echo json_encode(array(
		"debug"                 => true,
		$root					=> ${$root},

		"totalCount"            => $i,
	));
}
$fn = $_GET['fn'] ?? '';
if ($fn === 'List_QueryParam') {
	List_QueryParam(); // run แล้ว exit ข้างใน
} else {
	echo json_encode(['success' => false, 'message' => 'invalid fn']);
}
