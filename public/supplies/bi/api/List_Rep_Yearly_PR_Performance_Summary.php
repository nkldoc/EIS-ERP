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
	// นับสดจาก NMU_ERP..sp_Tor ด้วยเงื่อนไข "เดียวกัน" กับหน้า drill-down (List_DetailBgV6, Performance_Summary=1)
	//   - c_code LIKE 'PR%'  + i_enabled = 1 + i_type_bg = 1
	//   - แยกปี/เดือน จากเลขในรหัสเอกสาร (c_code) ตำแหน่งที่ 3-6 = ปี พ.ศ. , 7-8 = เดือนปฏิทิน
	// total_pr        = จำนวน PR รายเดือน (ตรงกับที่กดเข้าไปดูใน detail)
	// cumulative_total = ยอดสะสมภายในปีงบ (running total)
	$sqlMain = "SET NOCOUNT ON;
					;WITH pr AS (
						SELECT
							TRY_CONVERT(INT, SUBSTRING(c_code, 3, 4)) AS doc_year,
							TRY_CONVERT(INT, SUBSTRING(c_code, 7, 2)) AS doc_month
						FROM NMU_ERP..sp_Tor
						WHERE c_code LIKE 'PR%'
						  AND i_enabled = 1
						  AND i_type_bg = 1
					),
					monthly AS (
						SELECT
							CASE WHEN doc_month >= 10 THEN doc_year + 1 ELSE doc_year END AS year_th,
							CASE WHEN doc_month >= 10 THEN doc_month - 9 ELSE doc_month + 3 END AS month_no,
							COUNT(*) AS total_pr
						FROM pr
						WHERE doc_year IS NOT NULL
						  AND doc_month BETWEEN 1 AND 12
						GROUP BY
							CASE WHEN doc_month >= 10 THEN doc_year + 1 ELSE doc_year END,
							CASE WHEN doc_month >= 10 THEN doc_month - 9 ELSE doc_month + 3 END
					)
					SELECT
						year_th,
						month_no,
						total_pr,
						SUM(total_pr) OVER (
							PARTITION BY year_th
							ORDER BY month_no
							ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
						) AS cumulative_total
					FROM monthly
					WHERE year_th >= 2566
					ORDER BY year_th, month_no;";
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
