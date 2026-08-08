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

	$budget1 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND aa.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";
	$budget2 = ($_REQUEST["dc_expense_budget_type_id"] > 0) ? " AND bb.dc_expense_budget_type_id = {$_REQUEST["dc_expense_budget_type_id"]}" : "";

	if ($_REQUEST["i_expense"] == 1) {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv1"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.po_expense_lv1_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_expense"] == 2) {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv2"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.po_expense_lv2_id IN (" . $in . ")" : "";
			}
		}
	} else if ($_REQUEST["i_expense"] == 3) {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv3"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.po_expense_lv3_id IN (" . $in . ")" : "";
			}
		}
	} else {
		$for_id = explode(";", $_REQUEST["po_expense_id_lv4"]);
		if (!in_array("0", $for_id)) {
			$in = "";
			if (is_array($for_id)) {
				foreach ($for_id as $val) {
					$in .= ($in == "") ? $val : ", " . $val;
				}
				$con .= ($in != "") ? " AND cc.po_expense_lv4_id IN (" . $in . ")" : "";
			}
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @i_year AS numeric = {$_REQUEST["i_year"]};
		/* งบประมาณตามบัญชีจัดสรร */
		SELECT
			bb.po_expense_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
		INTO #tempBudget
		FROM po_budget_hdr aa
			INNER JOIN po_budget_dtl bb ON aa.po_budget_hdr_id = bb.po_budget_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_id = cc.po_expense_lv4_id
		WHERE aa.i_enable = 1
			AND aa.i_year = @i_year
			AND bb.f_total > 0
				{$con} {$budget1}
		GROUP BY bb.po_expense_id;
		
		/* โอนเปลี่ยนแปลงภายนอกส่วนงาน */
		SELECT
			bb.po_expense_id
			,SUM(ISNULL(bb.f_increase, 0) - ISNULL(bb.f_decrease, 0)) AS f_total
		INTO #tempBudgetAdjust
		FROM po_budget_adjust_hdr aa
			INNER JOIN po_budget_adjust_dtl bb ON aa.po_budget_adjust_hdr_id = bb.po_budget_adjust_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_id = cc.po_expense_lv4_id
		WHERE aa.i_enable = 1
			AND aa.i_year = @i_year
			{$con} {$budget1}
		GROUP BY bb.po_expense_id;

		/* โอนเปลี่ยนแปลงภายในส่วนงาน (บัญชีจัดสรร) */
		SELECT
			*
		INTO #tempBudgetTransfer
		FROM (
			SELECT
				bb.po_expense_begin_id AS po_expense_id
				,-SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM po_budget_transfer_hdr aa
				INNER JOIN po_budget_transfer_dtl bb ON aa.po_budget_transfer_hdr_id = bb.po_budget_transfer_hdr_id
				INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_begin_id = cc.po_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 1
				AND aa.i_year = @i_year
				AND bb.f_total > 0
				{$con} {$budget1}
			GROUP BY bb.po_expense_begin_id
			UNION ALL
			SELECT
				bb.po_expense_end_id AS po_expense_id
				,SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM po_budget_transfer_hdr aa
				INNER JOIN po_budget_transfer_dtl bb ON aa.po_budget_transfer_hdr_id = bb.po_budget_transfer_hdr_id
				INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_end_id = cc.po_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 1
				AND aa.i_year = @i_year
				AND bb.f_total > 0
				{$con} {$budget1}
			GROUP BY bb.po_expense_end_id
		) z;

		/* เงินรายได้ที่ได้รับจริง */
		SELECT
			bb.po_expense_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
		INTO #tempBudgetIncome
		FROM po_budget_income_hdr aa
			INNER JOIN po_budget_income_dtl bb ON aa.po_budget_income_hdr_id = bb.po_budget_income_hdr_id
			INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_id = cc.po_expense_lv4_id
		WHERE aa.i_enable = 1
			AND aa.i_year = @i_year
			AND bb.f_total > 0
			{$con} {$budget1}
		GROUP BY bb.po_expense_id;

		/* โอนเปลี่ยนแปลงภายในส่วนงาน (เงินที่ได้รับจริง) */
		SELECT
			*
		INTO #tempIncomeTransfer
		FROM (
			SELECT
				bb.po_expense_begin_id AS po_expense_id
				,-SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM po_budget_transfer_hdr aa
				INNER JOIN po_budget_transfer_dtl bb ON aa.po_budget_transfer_hdr_id = bb.po_budget_transfer_hdr_id
				INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_begin_id = cc.po_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 2
				AND aa.i_year = @i_year
				AND bb.f_total > 0
				{$con} {$budget1}
			GROUP BY bb.po_expense_begin_id
			UNION ALL
			SELECT
				bb.po_expense_end_id AS po_expense_id
				,SUM(ISNULL(bb.f_total, 0)) AS f_total
			FROM po_budget_transfer_hdr aa
				INNER JOIN po_budget_transfer_dtl bb ON aa.po_budget_transfer_hdr_id = bb.po_budget_transfer_hdr_id
				INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_end_id = cc.po_expense_lv4_id
			WHERE aa.i_enable = 1 AND aa.i_transfer = 2
				AND aa.i_year = @i_year
				AND bb.f_total > 0
				{$con} {$budget1}
			GROUP BY bb.po_expense_end_id
		) z;

		/* เบิกจ่ายทั้งสิ้น */
		SELECT
			bb.po_expense_id
			,SUM(ISNULL(bb.f_total, 0)) AS f_total
		INTO #tempWorking
		FROM dbo.po_working_hdr aa
			INNER JOIN dbo.po_working_dtl bb ON aa.po_working_hdr_id = bb.po_working_hdr_id AND bb.i_success = 1
				AND bb.po_expense_id IS NOT NULL
			INNER JOIN dbo.vw_po_expense_with_parent cc ON bb.po_expense_id = cc.po_expense_lv4_id
			INNER JOIN dbo.po_working_item dd ON aa.po_working_hdr_id = dd.po_working_hdr_id AND dd.i_status = 11
		WHERE aa.i_enable = 1
			AND bb.i_budget_year_overlap = @i_year
			AND bb.f_total > 0
			AND dd.d_doc_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'
			{$con} {$budget2}
		GROUP BY bb.po_expense_id;

		/* รวมข้อมูล */
		SELECT
			CASE
				WHEN a.po_expense_id IS NOT NULL THEN a.po_expense_id
				WHEN b.po_expense_id IS NOT NULL THEN b.po_expense_id
				WHEN c.po_expense_id IS NOT NULL THEN c.po_expense_id
				WHEN d.po_expense_id IS NOT NULL THEN d.po_expense_id
				WHEN e.po_expense_id IS NOT NULL THEN e.po_expense_id
				WHEN f.po_expense_id IS NOT NULL THEN f.po_expense_id
			END AS po_expense_id
			,a.f_total AS f_budget
			,ISNULL(b.f_total,0) + ISNULL(c.f_total,0) AS f_budget_adjust
			,d.f_total AS f_budget_income
			,e.f_total AS f_income_transfer
			,f.f_total AS f_working
		INTO #tempData
		FROM #tempBudget a
			FULL JOIN #tempBudgetAdjust b ON a.po_expense_id = b.po_expense_id
			FULL JOIN #tempBudgetTransfer c ON a.po_expense_id = c.po_expense_id
			FULL JOIN #tempBudgetIncome d ON a.po_expense_id = d.po_expense_id
			FULL JOIN #tempIncomeTransfer e ON a.po_expense_id = e.po_expense_id
			FULL JOIN #tempWorking f ON a.po_expense_id = f.po_expense_id;

		/* แสดงข้อมูล */
		SELECT
			b.po_expense_lv1_id AS po_expense_id
			,1 AS i_level
			,b.c_code_lv1 AS c_code
			,b.c_name_lv1 AS c_name
			,SUM(ISNULL(a.f_budget,0)) AS f_budget
			,SUM(ISNULL(a.f_budget_adjust,0)) AS f_budget_adjust
			,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income
			,SUM(ISNULL(a.f_income_transfer,0)) AS f_income_transfer
			,SUM(ISNULL(a.f_working,0)) AS f_working
		FROM #tempData a
			LEFT JOIN dbo.vw_po_expense_with_parent b ON a.po_expense_id = b.po_expense_lv4_id
		GROUP BY b.po_expense_lv1_id, b.c_code_lv1, b.c_name_lv1
		UNION ALL
		SELECT
			b.po_expense_lv2_id AS po_expense_id
			,2 AS i_level
			,b.c_code_lv2 AS c_code
			,b.c_name_lv2 AS c_name
			,SUM(ISNULL(a.f_budget,0)) AS f_budget
			,SUM(ISNULL(a.f_budget_adjust,0)) AS f_budget_adjust
			,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income
			,SUM(ISNULL(a.f_income_transfer,0)) AS f_income_transfer
			,SUM(ISNULL(a.f_working,0)) AS f_working
		FROM #tempData a
			LEFT JOIN dbo.vw_po_expense_with_parent b ON a.po_expense_id = b.po_expense_lv4_id
		GROUP BY b.po_expense_lv2_id, b.c_code_lv2, b.c_name_lv2
		UNION ALL
		SELECT
			b.po_expense_lv3_id AS po_expense_id
			,3 AS i_level
			,b.c_code_lv3 AS c_code
			,b.c_name_lv3 AS c_name
			,SUM(ISNULL(a.f_budget,0)) AS f_budget
			,SUM(ISNULL(a.f_budget_adjust,0)) AS f_budget_adjust
			,SUM(ISNULL(a.f_budget_income,0)) AS f_budget_income
			,SUM(ISNULL(a.f_income_transfer,0)) AS f_income_transfer
			,SUM(ISNULL(a.f_working,0)) AS f_working
		FROM #tempData a
			LEFT JOIN dbo.vw_po_expense_with_parent b ON a.po_expense_id = b.po_expense_lv4_id
		GROUP BY b.po_expense_lv3_id, b.c_code_lv3, b.c_name_lv3
		UNION ALL
		SELECT
			b.po_expense_lv4_id AS po_expense_id
			,4 AS i_level
			,b.c_code_lv4 AS c_code
			,b.c_name_lv4 AS c_name
			,ISNULL(a.f_budget,0) AS f_budget
			,ISNULL(a.f_budget_adjust,0) AS f_budget_adjust
			,ISNULL(a.f_budget_income,0) AS f_budget_income
			,ISNULL(a.f_income_transfer,0) AS f_income_transfer
			,ISNULL(a.f_working,0) AS f_working
		FROM #tempData a
			LEFT JOIN dbo.vw_po_expense_with_parent b ON a.po_expense_id = b.po_expense_lv4_id
		ORDER BY c_code;";

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		$no = 0;

		$f_budget				= 0; // งบประมาณตามบัญชีจัดสรร
		$f_budget_adjust		= 0; // เพิ่ม / ลด จัดสรร
		$f_budget_total			= 0; // บัญชีจัดสรรสุทธิ
		$f_budget_income		= 0; // เงินรายได้ที่รับจริง
		$f_income_transfer		= 0; // โอนเปลี่ยนแปลงเงินที่ได้รับจริง
		$f_budget_income_total	= 0; // เงินที่ได้รับจริงสุทธิ
		$f_working				= 0; // เบิกจ่ายทั้งสิ้น
		$f_sum_budget			= 0; // คงเหลืองบประมาณตามบัญชีจัดสรร
		$f_sum_income			= 0; // คงเหลือหลังเบิกจ่ายเงินรายได้ที่รับจริง

		while ($row = $db->Fetch($stmt)) {
			if ($row["i_level"] == 1) {
				$no++;

				$f_budget				+= $row["f_budget"]; // งบประมาณตามบัญชีจัดสรร
				$f_budget_adjust		+= $row["f_budget_adjust"]; // เพิ่ม / ลด จัดสรร
				$f_budget_total			+= $row["f_budget"] + $row["f_budget_adjust"]; // บัญชีจัดสรรสุทธิ
				$f_budget_income		+= $row["f_budget_income"]; // เงินรายได้ที่รับจริง
				$f_income_transfer		+= $row["f_income_transfer"]; // โอนเปลี่ยนแปลงเงินที่ได้รับจริง
				$f_budget_income_total	+= $row["f_budget_income"] + $row["f_income_transfer"]; // เงินที่ได้รับจริงสุทธิ
				$f_working				+= $row["f_working"]; // เบิกจ่ายทั้งสิ้น
				$f_sum_budget			+= ($row["f_budget"] + $row["f_budget_adjust"]) - $row["f_working"]; // คงเหลืองบประมาณตามบัญชีจัดสรร
				$f_sum_income			+= ($row["f_budget_income"] + $row["f_income_transfer"]) - $row["f_working"]; // คงเหลือหลังเบิกจ่ายเงินรายได้ที่รับจริง
			}

			if ($row["f_budget"] + $row["f_budget_adjust"] > 0 && $row["f_working"] > 0) {
				$f_budget_percent = (($row["f_budget"] + $row["f_budget_adjust"]) / $row["f_working"]);
			} else {
				$f_budget_percent = 0;
			}

			if ($row["f_budget_income"] + $row["f_income_transfer"] > 0 && $row["f_working"] > 0) {
				$f_income_percent = (($row["f_budget_income"] + $row["f_income_transfer"]) / $row["f_working"]);
			} else {
				$f_income_percent = 0;
			}

			if (
				($row["i_level"] == 1 && $_REQUEST["i_level1"] == 1)
				|| ($row["i_level"] == 2 && $_REQUEST["i_level2"] == 1)
				|| ($row["i_level"] == 3 && $_REQUEST["i_level3"] == 1)
				|| ($row["i_level"] == 4 && $_REQUEST["i_level4"] == 1)
			) {
				$temp = array(
					"no"							=> $no,
					"i_type"						=> 1,
					"po_expense_id"					=> $row["po_expense_id"],
					"i_level"						=> $row["i_level"],
					"c_code"						=> $row["c_code"],
					"c_name"						=> $row["c_name"],
					"f_budget"						=> $row["f_budget"],										// งบประมาณตามบัญชีจัดสรร
					"f_budget_adjust"				=> $row["f_budget_adjust"],									// เพิ่ม / ลด จัดสรร
					"f_budget_total"				=> $row["f_budget"] + $row["f_budget_adjust"],				// บัญชีจัดสรรสุทธิ
					"f_budget_income"				=> $row["f_budget_income"],									// เงินรายได้ที่รับจริง
					"f_income_transfer"				=> $row["f_income_transfer"],								// โอนเปลี่ยนแปลงเงินที่ได้รับจริง
					"f_budget_income_total"			=> $row["f_budget_income"] + $row["f_income_transfer"],		// เงินที่ได้รับจริงสุทธิ
					"f_working"						=> $row["f_working"],										// เบิกจ่ายทั้งสิ้น
					"f_sum_budget"					=> ($row["f_budget"] + $row["f_budget_adjust"]) - $row["f_working"],	// คงเหลืองบประมาณตามบัญชีจัดสรร
					"f_sum_income"					=> ($row["f_budget_income"] + $row["f_income_transfer"]) - $row["f_working"], // คงเหลือหลังเบิกจ่ายเงินรายได้ที่รับจริง
					"f_budget_percent"				=> $f_budget_percent,
					"f_income_percent"				=> $f_income_percent
				);
				${$root}[]	= $temp;
			}
		}

		$temp = array(
			"no"							=> $no,
			"i_type"						=> 2,
			"c_name"						=> "รวมทั้งสิ้น",
			"f_budget"						=> $f_budget,				// งบประมาณตามบัญชีจัดสรร
			"f_budget_adjust"				=> $f_budget_adjust,		// เพิ่ม / ลด จัดสรร
			"f_budget_total"				=> $f_budget_total,			// บัญชีจัดสรรสุทธิ
			"f_budget_income"				=> $f_budget_income,		// เงินรายได้ที่รับจริง
			"f_income_transfer"				=> $f_income_transfer,		// โอนเปลี่ยนแปลงเงินที่ได้รับจริง
			"f_budget_income_total"			=> $f_budget_income_total,	// เงินที่ได้รับจริงสุทธิ
			"f_working"						=> $f_working,				// เบิกจ่ายทั้งสิ้น
			"f_sum_budget"					=> $f_sum_budget,			// คงเหลืองบประมาณตามบัญชีจัดสรร
			"f_sum_income"					=> $f_sum_income,			// คงเหลือหลังเบิกจ่ายเงินรายได้ที่รับจริง
		);
		${$root}[]	= $temp;
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
