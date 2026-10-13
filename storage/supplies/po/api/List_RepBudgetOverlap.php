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

	// $ArrSum = array();
	// $ArrSumlv4 = array();
	// $ArrSumlv5 = array();
	// $ArrD	= array(1 => "หักส่งคืน", 2 => "ปรับปรุง", 3 => "ไม่ระบุ");

	// /* ====================== */
	// $conn = "";
	// $for_id = explode(";", $_REQUEST["dc_expense_budget_type_id"]);
	// if (!in_array("0", $for_id)) {
	// 	$in = "";
	// 	if (is_array($for_id)) {
	// 		foreach ($for_id as $val) {
	// 			$in .= ($in == "") ? $val : ", " . $val;
	// 		}
	// 		$con .= ($in != "") ? " AND a.dc_expense_budget_type_id IN (" . $in . ")" : "";
	// 		$conn .= ($in != "") ? " AND cc.dc_expense_budget_type_id IN (" . $in . ")" : "";
	// 	}
	// }

	// if ($_REQUEST["i_type_year"] > 0) {
	// 	$con .= " AND b.i_type_year = " . $_REQUEST["i_type_year"] . "AND b.c_budget_year = " . $_REQUEST["c_budget_year"];
	// 	$conn .= " AND cc.i_type_year = " . $_REQUEST["i_type_year"] . " AND cc.c_budget_year = " . $_REQUEST["c_budget_year"];
	// }

	// if ($_REQUEST["i_show_acc"] == 1) {
	// 	$for_id = explode(";", $_REQUEST["dc_acc_id_parent"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND e.dc_acc_lv4_id IN (" . $in . ")" : "";
	// 			$conn .= ($in != "") ? " AND ff.dc_acc_lv4_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else if ($_REQUEST["i_show_acc"] == 3) {
	// 	$for_id = explode(";", $_REQUEST["dc_acc_id_parent_lv5"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND e.dc_acc_lv5_id IN (" . $in . ")" : "";
	// 			$conn .= ($in != "") ? " AND ff.dc_acc_lv5_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// } else {
	// 	$for_id = explode(";", $_REQUEST["dc_acc_id"]);
	// 	if (!in_array("0", $for_id)) {
	// 		$in = "";
	// 		if (is_array($for_id)) {
	// 			foreach ($for_id as $val) {
	// 				$in .= ($in == "") ? $val : ", " . $val;
	// 			}
	// 			$con .= ($in != "") ? " AND b.dc_acc_id_report IN (" . $in . ")" : "";
	// 			$conn .= ($in != "") ? " AND ff.dc_acc_id IN (" . $in . ")" : "";
	// 		}
	// 	}
	// }

	// $for_id = explode(";", $_REQUEST["dc_user_create_id"]);
	// if (!in_array("0", $for_id)) {
	// 	$in = "";
	// 	if (is_array($for_id)) {
	// 		foreach ($for_id as $val) {
	// 			$in .= ($in == "") ? $val : ", " . $val;
	// 		}
	// 		$con .= ($in != "") ? " AND a.dc_user_create_id IN (" . $in . ")" : "";
	// 		$conn .= ($in != "") ? " AND bb.dc_user_create_id IN (" . $in . ")" : "";
	// 	}
	// }

	$i_year = $_REQUEST["i_year"];
	$d_date_start = $_REQUEST["d_date_start"];
	$d_date_end = $_REQUEST["d_date_end"];
	$i_status = $_REQUEST["i_status"];
	$con1 = "";
	$con2 = "";

	if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		$con1 .= " AND aa.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
		$con2 .= " AND bb.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
	}
	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @i_year AS NUMERIC;
		DECLARE @d_start AS DATETIME;
		DECLARE @d_end AS DATETIME;
		DECLARE @i_status AS TINYINT;
		
		SET @i_year = ?;
		SET @d_start = CONVERT(DATETIME, ? , 102);
		SET @d_end = CONVERT(DATETIME, ? , 102);
		SET @i_status = {$i_status};
		
		SELECT a.po_expense_id
			, a.f_total
			, CAST(0.00 AS DECIMAL(18, 2)) AS f_budget_overlap
			, CAST(0.00 AS DECIMAL(18, 2)) AS f_budget_overlap_cancel
			INTO #temp
		FROM
		(SELECT bb.dc_expense_budget_type_id
			, bb.c_booking
			, bb.po_expense_id
			, bb.f_total
		FROM dbo.po_working_hdr aa
			INNER JOIN dbo.po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id
			INNER JOIN dbo.po_working_item cc ON aa.po_working_hdr_id = cc.po_working_hdr_id AND cc.i_status = @i_status
		WHERE aa.i_enable = 1 AND cc.i_status = @i_status AND cc.d_doc_date BETWEEN @d_start AND @d_end AND bb.c_booking IS NOT NULL
			{$con2}) a
		INNER JOIN (
		SELECT aa.dc_expense_budget_type_id
			, bb.c_code_ref
		FROM po_budget_hdr_overlap aa 
			INNER JOIN po_budget_dtl_overlap bb ON aa.po_budget_hdr_overlap_id = bb.po_budget_hdr_overlap_id
		WHERE aa.i_year = @i_year
			{$con1}) b ON a.dc_expense_budget_type_id = b.dc_expense_budget_type_id AND a.c_booking = b.c_code_ref;
		
		INSERT INTO #temp (po_expense_id, f_total, f_budget_overlap, f_budget_overlap_cancel)
		SELECT ISNULL(dtl.po_expense_id,0) AS po_expense_id, 0.00 , ISNULL(dtl.f_total, 0), ISNULL(dtl.f_cancel, 0)
		FROM po_budget_hdr_overlap aa
		INNER JOIN po_budget_dtl_overlap dtl ON aa.po_budget_hdr_overlap_id = dtl.po_budget_hdr_overlap_id
		WHERE aa.i_enable = 1 AND aa.i_year  = @i_year
			{$con1};
		
		SELECT * FROM (
			/* LV0 = ALL */
			SELECT
				'' AS c_code
				, '' AS c_name
				, 0 AS i_level
				,SUM(ISNULL(aa.f_total,0)) AS f_total
				,SUM(ISNULL(aa.f_budget_overlap,0)) AS f_budget_overlap
				,SUM(ISNULL(aa.f_budget_overlap_cancel,0)) AS f_budget_overlap_cancel
			FROM #temp aa
				INNER JOIN dbo.po_expense bb ON aa.po_expense_id = bb.po_expense_id AND bb.i_enable = 1 AND bb.i_delete = 2
				INNER JOIN dbo.po_expense cc ON LEFT(bb.c_code,2) = LEFT(cc.c_code,2) AND cc.i_enable = 1 AND cc.i_delete = 2 AND cc.i_level = 1
			UNION ALL
			/* LV1 */
			SELECT
				cc.c_code
				,cc.c_name
				,cc.i_level
				,SUM(ISNULL(aa.f_total,0)) AS f_total
				,SUM(ISNULL(aa.f_budget_overlap,0)) AS f_budget_overlap
				,SUM(ISNULL(aa.f_budget_overlap_cancel,0)) AS f_budget_overlap_cancel
			FROM #temp aa
				INNER JOIN dbo.po_expense bb ON aa.po_expense_id = bb.po_expense_id AND bb.i_enable = 1 AND bb.i_delete = 2
				INNER JOIN dbo.po_expense cc ON LEFT(bb.c_code,2) = LEFT(cc.c_code,2) AND cc.i_enable = 1 AND cc.i_delete = 2 AND cc.i_level = 1
			GROUP BY cc.c_code, cc.c_name, cc.i_level
			UNION ALL
			/* LV2 */
			SELECT
				cc.c_code
				,cc.c_name
				,cc.i_level
				,SUM(ISNULL(aa.f_total,0)) AS f_total
				,SUM(ISNULL(aa.f_budget_overlap,0)) AS f_budget_overlap
				,SUM(ISNULL(aa.f_budget_overlap_cancel,0)) AS f_budget_overlap_cancel
			FROM #temp aa
				INNER JOIN dbo.po_expense bb ON aa.po_expense_id = bb.po_expense_id AND bb.i_enable = 1 AND bb.i_delete = 2
				INNER JOIN dbo.po_expense cc ON LEFT(bb.c_code,4) = LEFT(cc.c_code,4) AND cc.i_enable = 1 AND cc.i_delete = 2 AND cc.i_level = 2
			GROUP BY cc.c_code, cc.c_name, cc.i_level
					
			UNION ALL
			/* LV3 */
			SELECT
				cc.c_code
				,cc.c_name
				,cc.i_level
				,SUM(ISNULL(aa.f_total,0)) AS f_total
				,SUM(ISNULL(aa.f_budget_overlap,0)) AS f_budget_overlap
				,SUM(ISNULL(aa.f_budget_overlap_cancel,0)) AS f_budget_overlap_cancel
			FROM #temp aa
				INNER JOIN dbo.po_expense bb ON aa.po_expense_id = bb.po_expense_id AND bb.i_enable = 1 AND bb.i_delete = 2
				INNER JOIN dbo.po_expense cc ON LEFT(bb.c_code,6) = LEFT(cc.c_code,6) AND cc.i_enable = 1 AND cc.i_delete = 2 AND cc.i_level = 3
			GROUP BY cc.c_code, cc.c_name, cc.i_level
			UNION ALL
			/* LV4 */
			SELECT
				bb.c_code
				,bb.c_name
				,bb.i_level
				,SUM(ISNULL(aa.f_total,0)) AS f_total
				,SUM(ISNULL(aa.f_budget_overlap,0)) AS f_budget_overlap
				,SUM(ISNULL(aa.f_budget_overlap_cancel,0)) AS f_budget_overlap_cancel
			FROM #temp aa
				INNER JOIN dbo.po_expense bb ON aa.po_expense_id = bb.po_expense_id AND bb.i_enable = 1 AND bb.i_delete = 2
			GROUP BY bb.c_code, bb.c_name, bb.i_level
		) a ORDER BY a.c_code;";

	$stmt = $db->QueryParam($sqlMain, array($i_year, $d_date_start, $d_date_end));

	if ($stmt) {
		$no = 0;
		$all_budget_overlap = 0;
		$all_total = 0;
		$all_budget_overlap_cancel = 0;

		while ($row = $db->Fetch($stmt)) {
			if ($row["i_level"] == 1) {
				$no++;
			}
			if ($row["i_level"] == 0) {
				$all_budget_overlap = $row["f_budget_overlap"];
				$all_total = $row["f_total"];
				$all_budget_overlap_cancel = $row["f_budget_overlap_cancel"];
			} else {
				$sum = 0;
				$f_percent = 0;
				if ($row["f_budget_overlap"] > 0) {
					$sum = $row["f_budget_overlap"] - $row["f_total"];
					$f_percent = ($row["f_total"] * 100) / $row["f_budget_overlap"];
				}
				if (
					($row["i_level"] == 1 && $_REQUEST["i_level1"] == 1)
					|| ($row["i_level"] == 2 && $_REQUEST["i_level2"] == 1)
					|| ($row["i_level"] == 3 && $_REQUEST["i_level3"] == 1)
					|| ($row["i_level"] == 4 && $_REQUEST["i_level4"] == 1)
				) {
					$temp = array(
						"no"					=> $no,
						"i_level"				=> $row["i_level"],
						"c_code"				=> $row["c_code"],
						"c_name"				=> $row["c_name"],
						"f_budget"				=> $row["f_budget_overlap"],
						"f_total"				=> $row["f_total"],
						"f_cancel"				=> $row["f_budget_overlap_cancel"],
						"f_sum"					=> $sum,
						"f_percent"				=> $f_percent,
					);
					${$root}[]	= $temp;
				}
			}
		}

		$sum = 0;
		$f_percent = 0;
		if ($all_budget_overlap > 0) {
			$sum = $all_budget_overlap - $all_total;
			$f_percent = ($all_total * 100) / $all_budget_overlap;
		}
		$temp = array(
			"no"					=> $no,
			"i_level"				=> 0,
			"c_code"				=> '',
			"c_name"				=> 'รวม',
			"f_budget"				=> $all_budget_overlap,
			"f_total"				=> $all_total,
			"f_cancel"				=> $all_budget_overlap_cancel,
			"f_sum"					=> $sum,
			"f_percent"				=> $f_percent,
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
