<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");

$db = new DatabaseServer();
$date = new i_date();

$root = "data";
$data = array();
$con = null;

function insert($data)
{
	global $db;
	// ============== //
	$addField	= null;
	$addValue	= null;
	unset($arrValue);
	// ============== //
	foreach ($data as $fld => $value) {
		$arrValue[] = ($value != "") ? $value : null;
		$addField .= ", {$fld}";
		$addValue .= ", ?";
	}
	if (empty($_REQUEST["c_status"])) {
		$sql = "INSERT INTO temp_ar_statistic (" . substr($addField, 1) . ") VALUES (" . substr($addValue, 1) . ");";
		$db->QueryParam($sql, $arrValue);
	}
}

function List_QueryParam()
{
	global $db, $date, $root, $data, $con, $arr_status;

	$totalCount = 0;

	if (!empty($_REQUEST["c_status"])) {
		$sqlMain = "
			SELECT
				po_working_hdr_id
				,dc_cost_name
				,dc_budget_name
				,c_cnt_name
				,c_code
				,c_code_parent
				,c_approve
				,CONVERT(VARCHAR, d_start_date, 120) AS d_start_date
				,CONVERT(VARCHAR, d_end_date, 120) AS d_end_date
				,i_count_date
				,i_stop_date
				,c_comment
				,c_approve_name
				,i_than15
				,i_than30
				,i_than60
				,i_than90
				,i_over90
			FROM temp_ar_statistic WHERE dc_user_id = {$_SESSION["user_id"]} AND c_status = '{$_REQUEST["c_status"]}';";
	} else {
		$con .= " AND c.d_doc_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'";

		$for_id = explode(";", $_REQUEST["dc_cost_id"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND z.dc_cost_id IN (" . $in . ")" : "";
			}
		}

		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND b.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
		}

		if ($_REQUEST["po_creditor_id"] > 0) {
			$con .= " AND b.po_creditor_id = " . $_REQUEST["po_creditor_id"];
		}


		$sqlMain = "SELECT *
						,CASE
							WHEN (i_count_date) <= 15 THEN 1
							ELSE 0
						END i_than15
						,CASE
							WHEN (i_count_date) <= 30 THEN 1
							ELSE 0
						END i_than30
						,CASE
							WHEN (i_count_date) > 30 AND (i_count_date) <= 60 THEN 1
							ELSE 0
						END i_than60
						,CASE
							WHEN (i_count_date) > 60 AND (i_count_date) <= 90 THEN 1
							ELSE 0
						END i_than90
						,CASE
							WHEN (i_count_date) >= 90 THEN 1
							ELSE 0
						END i_over90 FROM (
					SELECT
						row
						,po_working_hdr_id
						,parent_id
						,dc_cost_name
						,dc_budget_name
						,c_cnt_name
						,c_code_parent
						,c_code
						,c_approve
						,d_start_date
						,d_start_date2
						,d_end_date
						,DATEDIFF(day, a.d_start_date, a.d_end_date)
							- (SELECT COUNT(*) FROM  po_holiday_dtl b
							INNER JOIN po_holiday_hdr c ON b.po_holiday_hdr_id = c.po_holiday_hdr_id
							WHERE c.i_enable = 1 AND b.d_holiday BETWEEN d_start_date AND d_end_date ) AS i_count_date
						,isnull((SELECT 
							DATEDIFF(day, aa.d_doc_date, aa.d_receive_date)-
							(select count(*) from  po_holiday_dtl b
								INNER JOIN po_holiday_hdr c ON b.po_holiday_hdr_id = c.po_holiday_hdr_id
							WHERE c.i_enable = 1 and b.d_holiday between DATEADD(DAY, 1,aa.d_doc_date) and aa.d_receive_date)
							FROM po_working_item aa WHERE aa.po_working_hdr_id = a.po_working_hdr_id and i_status = 3),0) AS i_stop_date
						,CASE
							WHEN a.parent_id > 0
								THEN a.c_code_parent + (
									SELECT '<br>'+aa.c_comment
									FROM po_working_item aa 
									WHERE aa.i_status = 3 
										AND aa.po_working_hdr_id = a.parent_id
									) +'<br>'+a.c_comment
							ELSE c_comment
						END AS c_comment
						-- ,c_comment
						,c_approve_name
					FROM (SELECT
							ROW_NUMBER() OVER (ORDER BY b.i_success, b.d_inv_date, b.c_code) AS row
							,a.po_working_hdr_id
							,a.parent_id
							,d.c_name AS dc_cost_name
							,e.c_name AS dc_budget_name
							,f.c_name AS c_cnt_name
							,CASE
								WHEN a.parent_id > 0 THEN (SELECT aa.c_code_ref FROM po_working_hdr aa WHERE aa.po_working_hdr_id = a.parent_id)
								ELSE null
							END AS c_code_parent
							-- ,CAST(NULL AS VARCHAR(500)) AS c_code_parent --*1
							,a.c_code_ref AS c_code
							,b.c_approve
							,CASE
								WHEN a.parent_id > 0 THEN (SELECT CONVERT(VARCHAR, aa.d_inv_date, 120) FROM po_working_dtl aa WHERE aa.po_working_hdr_id = a.parent_id)
								ELSE CONVERT(VARCHAR,b.d_inv_date, 120)
							END AS d_start_date
							,CONVERT(VARCHAR, b.d_inv_date, 120) AS d_start_date2 --*1
							,CONVERT(VARCHAR, c.d_doc_date, 120) AS d_end_date
							,NULL AS i_count_date 
							,NULL AS i_stop_date
							,CASE
								WHEN a1.c_comment IS NOT NULL THEN a.c_code_ref+'<br>'+a1.c_comment
								ELSE ''
							END AS c_comment
							,g.c_full_name AS c_approve_name
						FROM
							dbo.po_working_hdr a
							INNER JOIN dbo.po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
							INNER JOIN dbo.po_working_item c ON a.po_working_hdr_id = c.po_working_hdr_id AND c.i_status = 11
							INNER JOIN dbo.dc_cost z ON b.dc_cost_id = z.dc_cost_id
								AND z.dc_cost_id IN (81,38,50,82)
							LEFT JOIN dbo.dc_cost d ON b.dc_cost_id = d.dc_cost_id AND d.i_enable = 1 AND d.i_delete = 2
							LEFT JOIN dbo.dc_expense_budget_type e ON b.dc_expense_budget_type_id = e.dc_expense_budget_type_id AND e.i_enable = 1 AND e.i_delete = 2
							LEFT JOIN dbo.po_creditor f ON b.po_creditor_id = f.po_creditor_id AND f.i_enable = 1 AND f.i_delete = 2
							LEFT JOIN dbo.dc_user g ON b.dc_approve_id = g.dc_user_id
							/* กรณีมีทักท้วง */
							LEFT JOIN po_working_item a1 ON a1.i_status = 3 AND a.po_working_hdr_id = a1.po_working_hdr_id
						WHERE a.i_enable = 1
							AND b.i_success = 1
							{$con}
							)a
					)a
					WHERE 1 = 1
					" . (($_REQUEST["i_than15"] == 1) ? "OR 	CASE WHEN (i_count_date) <= 15 THEN 1 ELSE 0 END = 1" : "") . "
					" . (($_REQUEST["i_than30"] == 1) ? "OR CASE WHEN (i_count_date) <= 30 THEN 1 ELSE 0 END = 1" : "") . "
					" . (($_REQUEST["i_than60"] == 1) ? "OR CASE WHEN (i_count_date) > 30 AND (i_count_date) <= 60 THEN 1 ELSE 0 END = 1" : "") . "
					" . (($_REQUEST["i_than90"] == 1) ? "OR CASE WHEN (i_count_date) > 60 AND (i_count_date) <= 90 THEN 1 ELSE 0 END = 1" : "") . "
					" . (($_REQUEST["i_over90"] == 1) ? "OR CASE WHEN (i_count_date) >= 90 THEN 1 ELSE 0 END = 1" : "") . "
					ORDER BY row";
	}

	$arrParam = array();
	$stmt = $db->QueryParam($sqlMain, $arrParam);

	$i_than15 = 0;
	$i_than30 = 0;
	$i_than60 = 0;
	$i_than90 = 0;
	$i_over90 = 0;

	// ไม่มีทักท้วง
	$ii_than15_n = 0;
	$ii_than30_n = 0;
	$ii_than60_n = 0;
	$ii_than90_n = 0;
	$ii_over90_n = 0;

	// มีทักท้วง
	$ii_than15_h = 0;
	$ii_than30_h = 0;
	$ii_than60_h = 0;
	$ii_than90_h = 0;
	$ii_over90_h = 0;

	$ii_stop_date_n = 0;
	$ii_stop_date_h = 0;

	if ($stmt) {
		if (empty($_REQUEST["c_status"])) {
			$db->QueryParam("DELETE temp_ar_statistic WHERE dc_user_id = ?;", array($_SESSION["user_id"]));
		}
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"										=> ++$totalCount,
				"po_working_hdr_id"							=> $row["po_working_hdr_id"],
				"dc_cost_name"								=> $row["dc_cost_name"],
				"dc_budget_name"							=> $row["dc_budget_name"],
				"c_cnt_name"								=> $row["c_cnt_name"],
				"c_code"									=> $row["c_code"],
				"c_code_parent"								=> $row["c_code_parent"],
				"c_approve"									=> $row["c_approve"],
				"d_start_date"								=> ($row["d_start_date"] != "") ? $date->shot_date_from_db($row["d_start_date"]) : "",
				"d_end_date"								=> ($row["d_end_date"] != "") ? $date->shot_date_from_db($row["d_end_date"]) : "",
				"i_count_date"								=> $row["i_count_date"],
				"i_stop_date"								=> $row["i_stop_date"],
				"c_approve_name"							=> $row["c_approve_name"],
				"c_comment"									=> $row["c_comment"],
			);
			${$root}[] = $temp;

			// ============== //
			$addField	= null;
			$addValue	= null;
			unset($data_save);
			unset($arrValue);
			// ============== //
			$data_save["dc_user_id"]				= $_SESSION["user_id"];
			$data_save["po_working_hdr_id"]			= $row["po_working_hdr_id"];
			$data_save["dc_cost_name"]				= $row["dc_cost_name"];
			$data_save["dc_budget_name"]			= $row["dc_budget_name"];
			$data_save["c_cnt_name"]				= $row["c_cnt_name"];
			$data_save["c_code"]					= $row["c_code"];
			$data_save["c_code_parent"]				= $row["c_code_parent"];
			$data_save["c_approve"]					= $row["c_approve"];
			$data_save["d_start_date"]				= $row["d_start_date"];
			$data_save["d_end_date"]				= $row["d_end_date"];
			$data_save["i_count_date"]				= $row["i_count_date"];
			$data_save["i_stop_date"]				= $row["i_stop_date"];
			$data_save["c_approve_name"]			= $row["c_approve_name"];
			$data_save["c_comment"]					= $row["c_comment"];

			// INSERT TEMP
			if ($row["i_stop_date"] > 5) {
				$ii_stop_date_h++;
				$data_save["i_than30"]					= 0;
				$data_save["i_than60"]					= 0;
				$data_save["i_than90"]					= 0;
				$data_save["i_over90"]					= 0;
				$data_save["c_status"]					= "ii_stop_date_h";
				insert($data_save);
			} else if ($row["i_stop_date"] > 0) {
				$ii_stop_date_n++;
				$data_save["i_than30"]					= 0;
				$data_save["i_than60"]					= 0;
				$data_save["i_than90"]					= 0;
				$data_save["i_over90"]					= 0;
				$data_save["c_status"]					= "ii_stop_date_n";
				insert($data_save);
			}

			if ($row["i_than15"] == 1) {
				$i_than15++;
				$data_save["i_than15"]					= 1;
				$data_save["i_than30"]					= 0;
				$data_save["i_than60"]					= 0;
				$data_save["i_than90"]					= 0;
				$data_save["i_over90"]					= 0;
				$data_save["c_status"]					= "i_than15";
				insert($data_save);

				if ($row["i_stop_date"] > 0) {
					$ii_than15_h++;
					$data_save["c_status"]					= "ii_than15_h";
					insert($data_save);
				} else {
					$ii_than15_n++;
					$data_save["c_status"]					= "ii_than15_n";
					insert($data_save);
				}
			} else if ($row["i_than30"] == 1) {
				$i_than30++;
				$data_save["i_than15"]					= 0;
				$data_save["i_than30"]					= 1;
				$data_save["i_than60"]					= 0;
				$data_save["i_than90"]					= 0;
				$data_save["i_over90"]					= 0;
				$data_save["c_status"]					= "i_than30";
				insert($data_save);

				if ($row["i_stop_date"] > 0) {
					$ii_than30_h++;
					$data_save["c_status"]					= "ii_than30_h";
					insert($data_save);
				} else {
					$ii_than30_n++;
					$data_save["c_status"]					= "ii_than30_n";
					insert($data_save);
				}
			} else if ($row["i_than60"] == 1) {
				$i_than60++;
				$data_save["i_than15"]					= 0;
				$data_save["i_than30"]					= 0;
				$data_save["i_than60"]					= 1;
				$data_save["i_than90"]					= 0;
				$data_save["i_over90"]					= 0;
				$data_save["c_status"]					= "i_than60";
				insert($data_save);

				if ($row["i_stop_date"] > 0) {
					$ii_than60_h++;
					$data_save["c_status"]					= "ii_than60_h";
					insert($data_save);
				} else {
					$ii_than60_n++;
					$data_save["c_status"]					= "ii_than60_n";
					insert($data_save);
				}
			} else if ($row["i_than90"] == 1) {
				$i_than90++;
				$data_save["i_than15"]					= 0;
				$data_save["i_than30"]					= 0;
				$data_save["i_than60"]					= 0;
				$data_save["i_than90"]					= 1;
				$data_save["i_over90"]					= 0;
				$data_save["c_status"]					= "i_than90";
				insert($data_save);

				if ($row["i_stop_date"] > 0) {
					$ii_than90_h++;
					$data_save["c_status"]					= "ii_than90_h";
					insert($data_save);
				} else {
					$ii_than90_n++;
					$data_save["c_status"]					= "ii_than90_n";
					insert($data_save);
				}
			} else if ($row["i_over90"] == 1) {
				$i_over90++;
				$data_save["i_than15"]					= 0;
				$data_save["i_than30"]					= 0;
				$data_save["i_than60"]					= 0;
				$data_save["i_than90"]					= 0;
				$data_save["i_over90"]					= 1;
				$data_save["c_status"]					= "i_over90";
				insert($data_save);

				if ($row["i_stop_date"] > 0) {
					$ii_over90_h++;
					$data_save["c_status"]				= "ii_over90_h";
					insert($data_save);
				} else {
					$ii_over90_n++;
					$data_save["c_status"]				= "ii_over90_n";
					insert($data_save);
				}
			}
		}
	}
	return json_encode(array(
		"debug"				=> true,
		$root				=> ${$root},
		"totalCount"		=> $totalCount,
		"i_than15"			=> $i_than15,
		"i_than30"			=> $i_than30,
		"i_than60"			=> $i_than60,
		"i_than90"			=> $i_than90,
		"i_over90"			=> $i_over90,

		"i_over60"			=> $i_than60 + $i_than90 + $i_over90,

		// ไม่มีทักท้วง
		"ii_than15_n"		=> $ii_than15_n,
		"ii_than30_n"		=> $ii_than30_n,
		"ii_than60_n"		=> $ii_than60_n,
		"ii_than90_n"		=> $ii_than90_n,
		"ii_over90_n"		=> $ii_over90_n,

		"i_over60_n"		=> $ii_than60_n + $ii_than90_n + $ii_over90_n,

		// มีทักท้วง
		"ii_than15_h"		=> $ii_than15_h,
		"ii_than30_h"		=> $ii_than30_h,
		"ii_than60_h"		=> $ii_than60_h,
		"ii_than90_h"		=> $ii_than90_h,
		"ii_over90_h"		=> $ii_over90_h,

		"i_over60_h"		=> $ii_than60_h + $ii_than90_h + $ii_over90_h,

		"ii_stop_date_n"	=> $ii_stop_date_n,
		"ii_stop_date_h"	=> $ii_stop_date_h,

		"ii_protest"		=> $ii_than15_h + $ii_than30_h + $ii_than60_h + $ii_than90_h + $ii_over90_h,
	));
}
