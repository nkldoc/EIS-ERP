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

	if ($_REQUEST["i_date"] == "0") {
		$con .= " AND b.d_inv_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'";
	} else {
		$con .= " AND b.d_audit_date BETWEEN '{$_REQUEST["d_date_start"]}' AND '{$_REQUEST["d_date_end"]}'";
	}

	if ($_REQUEST["dc_cost_id"] > 0) {
		$con .= " AND b.dc_cost_id = " . $_REQUEST["dc_cost_id"];
	}

	if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		$con .= " AND b.dc_expense_budget_type_id = " . $_REQUEST["dc_expense_budget_type_id"];
	}

	if ($_REQUEST["po_creditor_id"] > 0) {
		$con .= " AND b.po_creditor_id = " . $_REQUEST["po_creditor_id"];
	}

	if ($_REQUEST["dc_approve_id"] > 0) {
		$con .= " AND b.dc_approve_id = " . $_REQUEST["dc_approve_id"];
	}


	if ($_REQUEST["i_success"] == 1) {
		$con .= " AND b.i_success = 1";
	} else if ($_REQUEST["i_success"] == 2) {
		$con .= " AND b.i_success = 0";
	}

	if ($_REQUEST["i_parent"] == 1) {
		$con .= " AND a.parent_id > 0";
	}

	$con_count = "";

	// ตรวจรับถึงจัดทำใบขอเบิก
	if (@$_REQUEST["c_status"] == "ii_than07_1") {
		$con_count .= " AND (d.count_date1 <= 7)";
	} else if (@$_REQUEST["c_status"] == "ii_than15_1") {
		$con_count .= " AND ((d.count_date1 >= 8) AND (d.count_date1 <= 15))";
	} else if (@$_REQUEST["c_status"] == "ii_than30_1") {
		$con_count .= " AND ((d.count_date1 >= 16) AND (d.count_date1 <= 30))";
	} else if (@$_REQUEST["c_status"] == "ii_over30_1") {
		$con_count .= " AND (d.count_date1 > 30)";
	}

	//อนุมัติฎีกาถึงจ่ายเงิน
	if (@$_REQUEST["c_status"] == "ii_than07_2") {
		$con_count .= " AND ((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 7)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_than15_2") {
		$con_count .= " AND (
			((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) >= 8)
			AND ((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 15)
		)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_than30_2") {
		$con_count .= " AND (
			((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) >= 16)
			AND ((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 30)
		)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_over30_2") {
		$con_count .= " AND ((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) > 30)";
		$con_count .= " AND c.i_success = 1";
	}

	//รับใบขอเบิกถึงจ่ายเงิน
	if (@$_REQUEST["c_status"] == "ii_than07_3") {
		$con_count .= " AND ((d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 7)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_than15_3") {
		$con_count .= " AND (
			((d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) >= 8)
			AND ((d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 15)
		)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_than30_3") {
		$con_count .= " AND (
			((d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) >= 16)
			AND ((d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 30)
		)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_over30_3") {
		$con_count .= " AND ((d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) > 30)";
		$con_count .= " AND c.i_success = 1";
	}

	//ตรวจรับถึงจ่ายเงิน
	if (@$_REQUEST["c_status"] == "ii_than07_4") {
		$con_count .= " AND ((d.count_date1 + d.count_date2 + d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 7)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_than15_4") {
		$con_count .= " AND (
			(( d.count_date1 + d.count_date2 + d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) >= 8)
			AND (( d.count_date1 + d.count_date2 + d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 15)
		)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_than30_4") {
		$con_count .= " AND (
			(( d.count_date1 + d.count_date2 + d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) >= 16)
			AND (( d.count_date1 + d.count_date2 + d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 30)
		)";
		$con_count .= " AND c.i_success = 1";
	} else if (@$_REQUEST["c_status"] == "ii_over30_4") {
		$con_count .= " AND ((d.count_date1 + d.count_date2 + d.count_date3 + d.count_date4 + d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) > 30)";
		$con_count .= " AND c.i_success = 1";
	}


	if (@$_REQUEST["dc_cost_id_chart"] > 0) {
		if ($_REQUEST["dc_cost_id_chart"] == 99) {
			$con_count .= " AND c.dc_cost_id NOT IN (38, 50, 82, 81)";
		} else {
			$con_count .= " AND c.dc_cost_id = " . $_REQUEST["dc_cost_id_chart"];
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		DECLARE @Temp TABLE (row BIGINT, po_working_hdr_id BIGINT, parent_id BIGINT, i_count BIGINT);
		INSERT INTO @Temp
		SELECT
			ROW_NUMBER() OVER (ORDER BY b.i_success, " . ($_REQUEST["i_date"] == "0" ? "b.d_inv_date" : "b.d_audit_date") . ", b.c_code) AS row
			,a.po_working_hdr_id
			,a.parent_id
			,0 AS i_count
		FROM po_working_hdr a
			INNER JOIN po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
		WHERE a.i_enable = 1
				{$con};
		
		DECLARE @row INT = (SELECT MIN(row) FROM @temp WHERE parent_id > 0);
		DECLARE @parent_id INT = (SELECT parent_id FROM @temp WHERE row = @row);
		WHILE @row IS NOT NULL
		BEGIN
			DECLARE @count BIGINT = 1;
			/* LOOP PARENT ID */
					
			WHILE @count > 0
			BEGIN
				INSERT INTO @Temp
				SELECT @row AS [row], po_working_hdr_id, parent_id, @count AS i_count FROM po_working_hdr aa WHERE aa.po_working_hdr_id = @parent_id;
				SET @parent_id = (SELECT parent_id FROM po_working_hdr aa WHERE aa.po_working_hdr_id = @parent_id);
				IF @parent_id > 0
					SET @count = @count + 1;
				ELSE
					SET @count = 0;
			END
			SET @row = (SELECT MIN(row) FROM @temp WHERE row > @row AND parent_id > 0);
			SET @parent_id = (SELECT parent_id FROM @Temp WHERE row = @row);
		END
		
		/* INTO select #temp ไวกว่า select @temp */
		SELECT * INTO #temp FROM @temp;
		SELECT * INTO #view FROM vw_po_working_track_status;
		
		SELECT
			a.row
			,a.i_count
			,a.po_working_hdr_id
			,CASE
				WHEN c.dc_cost_id NOT IN (38, 50, 82, 81) THEN 99
				ELSE c.dc_cost_id
			END AS dc_cost_group_id
			,CASE
				WHEN c.dc_cost_id NOT IN (38, 50, 82, 81) THEN 'หน่วยงานอื่นๆ'
				ELSE a1.c_name
			END AS dc_cost_group_name
			,c.dc_cost_id
			,a1.c_name AS dc_cost_name
			,c.dc_expense_budget_type_id
			,a2.c_name AS dc_expense_budget_type_name
			,c.po_creditor_id
			,a3.c_name AS po_creditor_name
			,b.c_code_ref
			,c.c_approve
			,c.bg_expense_id
			,a4.c_name AS bg_expense_name
			,c.po_emp_id
			,a5.c_name AS po_emp_name
			,c.dc_approve_id
			,a6.c_full_name AS dc_approve_name
			,c.c_qty
			,c.f_total
			,b.c_comment
			,CONVERT(VARCHAR, d.d_audit_date, 120) AS d_audit_date
			,CONVERT(VARCHAR, d.d_doc_date, 120) AS d_doc_date
			,d.count_date1
			,CONVERT(VARCHAR, c.d_inv_date, 120) AS d_inv_date
			,d.count_date2
			,CONVERT(VARCHAR, d.d_doc_date3, 120) AS d_doc_date3
			,CONVERT(VARCHAR, d.d_receive_date3, 120) AS d_receive_date3
			,d.i_protest
			,d.count_date3
			,CONVERT(VARCHAR, d.d_approve_date, 120) AS d_approve_date
			,d.count_date4
			,CONVERT(VARCHAR, d.d_doc_date5, 120) AS d_doc_date5
			,d.count_date5
			,CONVERT(VARCHAR, d.d_doc_date6, 120) AS d_doc_date6
			,d.count_date6
			,CONVERT(VARCHAR, d.d_doc_date7, 120) AS d_doc_date7
			,d.count_date7
			,CONVERT(VARCHAR, d.d_doc_date8, 120) AS d_doc_date8
			,d.count_date8
			,CONVERT(VARCHAR, d.d_doc_date9, 120) AS d_doc_date9
			,d.count_date9
			,CONVERT(VARCHAR, d.d_doc_date10, 120) AS d_doc_date10
			,d.count_date10
			,CONVERT(VARCHAR, d.d_doc_date11, 120) AS d_doc_date11
			,d.count_date11
			,c.i_close_receive
			,b.i_enable
			,c.i_success
		FROM #temp a
			INNER JOIN po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN po_working_dtl c ON b.po_working_hdr_id = c.po_working_hdr_id
			LEFT JOIN #view d ON b.po_working_hdr_id = d.po_working_hdr_id
		
			LEFT JOIN dc_cost a1 ON c.dc_cost_id = a1.dc_cost_id AND a1.i_enable = 1
			LEFT JOIN dc_expense_budget_type a2 ON c.dc_expense_budget_type_id = a2.dc_expense_budget_type_id AND a2.i_enable = 1
			LEFT JOIN dbo.po_creditor a3 ON c.po_creditor_id = a3.po_creditor_id AND a3.i_enable = 1
			LEFT JOIN dbo.bg_expense a4 ON c.bg_expense_id = a4.bg_expense_id AND a4.i_enable = 1
			LEFT JOIN dbo.po_emp a5 ON c.po_emp_id = a5.po_emp_id AND a5.i_enable = 1
			LEFT JOIN dbo.dc_user a6 ON c.dc_approve_id = a6.dc_user_id AND a6.i_enable = 1
		WHERE 1=1
			{$con_count}
		
		
		/*
		(
			((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) >= 8)
			AND ((d.count_date5 + d.count_date6 + d.count_date7 + d.count_date8 + d.count_date9 + d.count_date10 + d.count_date11) <= 30)
		)
		*/
		ORDER BY a.row, a.i_count DESC;";
	$arrParam = array();

	$stmt = $db->QueryParam($sqlMain, $arrParam);

	// ตรวจรับถึงจัดทำใบขอเบิก
	$ii_than07_1 = 0;
	$ii_than15_1 = 0;
	$ii_than30_1 = 0;
	$ii_over30_1 = 0;

	// อนุมัติฎีกาถึงจ่ายเงิน
	$ii_than07_2 = 0;
	$ii_than15_2 = 0;
	$ii_than30_2 = 0;
	$ii_over30_2 = 0;

	// รับใบขอเบิกถึงจ่ายเงิน
	$ii_than07_3 = 0;
	$ii_than15_3 = 0;
	$ii_than30_3 = 0;
	$ii_over30_3 = 0;

	// ตรวจรับถึงจ่ายเงิน
	$ii_than07_4 = 0;
	$ii_than15_4 = 0;
	$ii_than30_4 = 0;
	$ii_over30_4 = 0;

	$arrCost = array();
	if ($stmt) {
		$no = 0;
		while ($row = $db->Fetch($stmt)) {

			$b_count_date1 = $row["count_date1"];
			if ($row["i_success"]) {
				$b_count_date2 = $row["count_date5"] + $row["count_date6"] + $row["count_date7"] + $row["count_date8"] + $row["count_date9"] + $row["count_date10"] + $row["count_date11"];
				$b_count_date3 = $row["count_date3"] + $row["count_date4"] + $row["count_date5"] + $row["count_date6"] + $row["count_date7"] + $row["count_date8"] + $row["count_date9"] + $row["count_date10"] + $row["count_date11"];
				$b_count_date4 = $row["count_date1"] + $row["count_date2"] + $row["count_date3"] + $row["count_date4"] + $row["count_date5"] + $row["count_date6"] + $row["count_date7"] + $row["count_date8"] + $row["count_date9"] + $row["count_date10"] + $row["count_date11"];
			} else {
				$b_count_date2 = "";
				$b_count_date3 = "";
				$b_count_date4 = "";
			}

			$temp = array(
				"no"										=> ($row["i_count"] == 0) ? ++$no : "",
				"po_working_hdr_id"							=> $row["po_working_hdr_id"],
				"dc_cost_name"								=> $row["dc_cost_name"],
				"dc_expense_budget_type_name"				=> $row["dc_expense_budget_type_name"],
				"po_creditor_name"							=> $row["po_creditor_name"],
				"c_code_ref"								=> $row["c_code_ref"],
				"c_approve"									=> $row["c_approve"],
				"i_protest"									=> (isset($row["i_protest"])) ? $row["i_protest"] . " ครั้ง" : "",
				"bg_expense_name"							=> $row["bg_expense_name"],

				"count_date1"								=> ($row["d_doc_date"] != "") ? $row["count_date1"] . " วัน" : "",
				"count_date2"								=> ($row["d_inv_date"] != "") ? $row["count_date2"] . " วัน" : "",
				"count_date3"								=> ($row["d_doc_date3"] != "") ? $row["count_date3"] . " วัน" : "",
				"count_date4"								=> ($row["d_approve_date"] != "") ? $row["count_date4"] . " วัน" : "",
				"count_date5"								=> ($row["d_doc_date5"] != "") ? $row["count_date5"] . " วัน" : "",
				"count_date6"								=> ($row["d_doc_date6"] != "") ? $row["count_date6"] . " วัน" : "",
				"count_date7"								=> ($row["d_doc_date7"] != "") ? $row["count_date7"] . " วัน" : "",
				"count_date8"								=> ($row["d_doc_date8"] != "") ? $row["count_date8"] . " วัน" : "",
				"count_date9"								=> ($row["d_doc_date9"] != "") ? $row["count_date9"] . " วัน" : "",
				"count_date10"								=> ($row["d_doc_date10"] != "") ? $row["count_date10"] . " วัน" : "",
				"count_date11"								=> ($row["d_doc_date11"] != "") ? $row["count_date11"] . " วัน" : "",

				// param
				"d_audit_date"								=> ($row["d_audit_date"] != "") ? date_format(date_create($row["d_audit_date"]), "Y-m-d") : "",
				"d_doc_date"								=> ($row["d_doc_date"] != "") ? date_format(date_create($row["d_doc_date"]), "Y-m-d") : "",
				"d_inv_date"								=> ($row["d_inv_date"] != "") ? date_format(date_create($row["d_inv_date"]), "Y-m-d") : "",
				"d_doc_date3"								=> ($row["d_doc_date3"] != "") ? date_format(date_create($row["d_doc_date3"]), "Y-m-d") : "",
				"d_receive_date3"							=> ($row["d_receive_date3"] != "") ? date_format(date_create($row["d_receive_date3"]), "Y-m-d") : "",
				"d_approve_date"							=> ($row["d_approve_date"] != "") ? date_format(date_create($row["d_approve_date"]), "Y-m-d") : "",
				"d_doc_date5"								=> ($row["d_doc_date5"] != "") ? date_format(date_create($row["d_doc_date5"]), "Y-m-d") : "",
				"d_doc_date6"								=> ($row["d_doc_date6"] != "") ? date_format(date_create($row["d_doc_date6"]), "Y-m-d") : "",
				"d_doc_date7"								=> ($row["d_doc_date7"] != "") ? date_format(date_create($row["d_doc_date7"]), "Y-m-d") : "",
				"d_doc_date8"								=> ($row["d_doc_date8"] != "") ? date_format(date_create($row["d_doc_date8"]), "Y-m-d") : "",
				"d_doc_date9"								=> ($row["d_doc_date9"] != "") ? date_format(date_create($row["d_doc_date9"]), "Y-m-d") : "",
				"d_doc_date10"								=> ($row["d_doc_date10"] != "") ? date_format(date_create($row["d_doc_date10"]), "Y-m-d") : "",
				"d_doc_date11"								=> ($row["d_doc_date11"] != "") ? date_format(date_create($row["d_doc_date11"]), "Y-m-d") : "",

				// show
				"s_audit_date"								=> ($row["d_audit_date"] != "") ? $date->shot_date_from_db($row["d_audit_date"]) : "",
				"s_doc_date"								=> ($row["d_doc_date"] != "") ? $date->shot_date_from_db($row["d_doc_date"]) : "",
				"s_inv_date"								=> ($row["d_inv_date"] != "") ? $date->shot_date_from_db($row["d_inv_date"]) : "",
				"s_doc_date3"								=> ($row["d_doc_date3"] != "") ? $date->shot_date_from_db($row["d_doc_date3"]) : "",
				"s_receive_date3"							=> ($row["d_receive_date3"] != "") ? $date->shot_date_from_db($row["d_receive_date3"]) : "",
				"s_approve_date"							=> ($row["d_approve_date"] != "") ? $date->shot_date_from_db($row["d_approve_date"]) : "",
				"s_doc_date5"								=> ($row["d_doc_date5"] != "") ? $date->shot_date_from_db($row["d_doc_date5"]) : "",
				"s_doc_date6"								=> ($row["d_doc_date6"] != "") ? $date->shot_date_from_db($row["d_doc_date6"]) : "",
				"s_doc_date7"								=> ($row["d_doc_date7"] != "") ? $date->shot_date_from_db($row["d_doc_date7"]) : "",
				"s_doc_date8"								=> ($row["d_doc_date8"] != "") ? $date->shot_date_from_db($row["d_doc_date8"]) : "",
				"s_doc_date9"								=> ($row["d_doc_date9"] != "") ? $date->shot_date_from_db($row["d_doc_date9"]) : "",
				"s_doc_date10"								=> ($row["d_doc_date10"] != "") ? $date->shot_date_from_db($row["d_doc_date10"]) : "",
				"s_doc_date11"								=> ($row["d_doc_date11"] != "") ? $date->shot_date_from_db($row["d_doc_date11"]) : "",
				"i_close_receive"							=> $row["i_close_receive"],

				// รายงานใช้ที่เดียวกับ Rep_rep0001
				"b_count_date1"								=> (strval($b_count_date1) != "") ? $b_count_date1 . " วัน" : "",
				"b_count_date2"								=> (strval($b_count_date2) != "") ? $b_count_date2 . " วัน" : "",
				"b_count_date3"								=> (strval($b_count_date3) != "") ? $b_count_date3 . " วัน" : "",
				"b_count_date4"								=> (strval($b_count_date4) != "") ? $b_count_date4 . " วัน" : "",

				"c_qty"										=> $row["c_qty"],
				"f_total"									=> $row["f_total"],
				"c_comment"									=> $row["c_comment"],
				"po_emp_name"								=> $row["po_emp_name"],
				"dc_approve_name"							=> $row["dc_approve_name"],
				"i_enable"									=> $row["i_enable"],
				"i_success"									=> $row["i_success"],
			);
			${$root}[] = $temp;

			$arrCost[$row["dc_cost_group_id"]]["name"]			= $row["dc_cost_group_name"];

			// ใช้งานสำหรับหัวรายละเอียดรายการ กับ กราฟ
			if ($row["i_count"] == 0) {
				// ตรวจรับถึงจัดทำใบขอเบิก
				if ($b_count_date1 > 30) {
					$ii_over30_1++;
					if (@!$arrCost[$row["dc_cost_group_id"]]["ii_over30_1"]) {
						$arrCost[$row["dc_cost_group_id"]]["ii_over30_1"] = 1;
					} else {
						$arrCost[$row["dc_cost_group_id"]]["ii_over30_1"]++;
					}
				} else if ($b_count_date1 >= 16 && $b_count_date1 <= 30) {
					$ii_than30_1++;
					if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than30_1"]) {
						$arrCost[$row["dc_cost_group_id"]]["ii_than30_1"] = 1;
					} else {
						$arrCost[$row["dc_cost_group_id"]]["ii_than30_1"]++;
					}
				} else if ($b_count_date1 > 7 && $b_count_date1 <= 15) {
					$ii_than15_1++;
					if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than15_1"]) {
						$arrCost[$row["dc_cost_group_id"]]["ii_than15_1"] = 1;
					} else {
						$arrCost[$row["dc_cost_group_id"]]["ii_than15_1"]++;
					}
				} else {
					$ii_than07_1++;
					if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than07_1"]) {
						$arrCost[$row["dc_cost_group_id"]]["ii_than07_1"] = 1;
					} else {
						$arrCost[$row["dc_cost_group_id"]]["ii_than07_1"]++;
					}
				}

				// อนุมัติฎีกาถึงจ่ายเงิน
				if ((strval($b_count_date2) != "")) {
					if ($b_count_date2 > 30) {
						$ii_over30_2++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_over30_2"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_over30_2"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_over30_2"]++;
						}
					} else if ($b_count_date2 >= 16 && $b_count_date2 <= 30) {
						$ii_than30_2++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than30_2"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than30_2"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than30_2"]++;
						}
					} else if ($b_count_date2 > 7 && $b_count_date2 <= 15) {
						$ii_than15_2++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than15_2"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than15_2"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than15_2"]++;
						}
					} else {
						$ii_than07_2++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than07_2"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than07_2"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than07_2"]++;
						}
					}
				}

				// รับใบขอเบิกถึงจ่ายเงิน
				if ((strval($b_count_date3) != "")) {
					if ($b_count_date3 > 30) {
						$ii_over30_3++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_over30_3"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_over30_3"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_over30_3"]++;
						}
					} else if ($b_count_date3 >= 16 && $b_count_date3 <= 30) {
						$ii_than30_3++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than30_3"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than30_3"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than30_3"]++;
						}
					} else if ($b_count_date3 > 7 && $b_count_date3 <= 15) {
						$ii_than15_3++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than15_3"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than15_3"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than15_3"]++;
						}
					} else {
						$ii_than07_3++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than07_3"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than07_3"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than07_3"]++;
						}
					}
				}

				// ตรวจรับถึงจ่ายเงิน
				if ((strval($b_count_date4) != "")) {
					if ($b_count_date4 > 30) {
						$ii_over30_4++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_over30_4"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_over30_4"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_over30_4"]++;
						}
					} else if ($b_count_date4 >= 16 && $b_count_date4 <= 30) {
						$ii_than30_4++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than30_4"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than30_4"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than30_4"]++;
						}
					} else if ($b_count_date4 > 7 && $b_count_date4 <= 15) {
						$ii_than15_4++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than15_4"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than15_4"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than15_4"]++;
						}
					} else {
						$ii_than07_4++;
						if (@!$arrCost[$row["dc_cost_group_id"]]["ii_than07_4"]) {
							$arrCost[$row["dc_cost_group_id"]]["ii_than07_4"] = 1;
						} else {
							$arrCost[$row["dc_cost_group_id"]]["ii_than07_4"]++;
						}
					}
				}
				$totalCount++;
			}
		}
	}

	return json_encode(array(
		"debug"				=> true,
		"totalCount"		=> $totalCount,
		$root				=> ${$root},

		// ตรวจรับถึงจัดทำใบขอเบิก
		"ii_than07_1"		=> $ii_than07_1,
		"ii_than15_1"		=> $ii_than15_1,
		"ii_than30_1"		=> $ii_than30_1,
		"ii_over30_1"		=> $ii_over30_1,

		// อนุมัติฎีกาถึงจ่ายเงิน
		"ii_than07_2"		=> $ii_than07_2,
		"ii_than15_2"		=> $ii_than15_2,
		"ii_than30_2"		=> $ii_than30_2,
		"ii_over30_2"		=> $ii_over30_2,

		// รับใบขอเบิกถึงจ่ายเงิน
		"ii_than07_3"		=> $ii_than07_3,
		"ii_than15_3"		=> $ii_than15_3,
		"ii_than30_3"		=> $ii_than30_3,
		"ii_over30_3"		=> $ii_over30_3,

		// ตรวจรับถึงจ่ายเงิน
		"ii_than07_4"		=> $ii_than07_4,
		"ii_than15_4"		=> $ii_than15_4,
		"ii_than30_4"		=> $ii_than30_4,
		"ii_over30_4"		=> $ii_over30_4,

		"arr_cost"			=> $arrCost
	));
}
