<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if ($_REQUEST["type"] == "ar_bill") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	// $limit 	= @$_REQUEST["limit"];
	// $start 	= @$_REQUEST["start"];

	// if (!$util->get($start)) {
	// 	$start 	= 0;
	// }
	// if (!$util->get($limit)) {
	// 	$limit 	= 20;
	// } else {
	// 	$limit = ($limit + $start);
	// }

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 

	if ($mode == "SEARCH") {

		// if ($_REQUEST["filter"] == "c_code_ref") {
		// 	$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		// } else if ($_REQUEST["filter"] == "c_approve") {
		// 	$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		// }
		if ($_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		if ($_REQUEST["d_start"] != "" && $_REQUEST["d_end"] != "") {
			$con .= " AND c.lastdate BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_end"]}'+' 23:59:59',102)";
		}
		// if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 	$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		// }
		// 	// 		if ($_REQUEST["i_post"] > 0) {
		// 	// 			$con .= " AND a.i_post=" . $_REQUEST["i_post"];
		// 	// 		}
		// 	// 		if ($_REQUEST["i_enable"] > 0) {
		// 	// 			$con .= " AND a.i_enable=" . $_REQUEST["i_enable"];
		// 	// 		}
	}

	$sqlMain = "	
		SET NOCOUNT ON
		/* DATA */
		SELECT
			a.ar_bill_hdr_id
			,ROW_NUMBER() OVER (PARTITION BY a.c_code_bill ORDER BY a.c_code_bill, a2.ar_treat_right_group_name DESC) AS i_show
			,a.c_code_bill
			,CONVERT(VARCHAR, a.d_bill_date, 120) AS d_bill_date
			,a1.c_name AS ar_debtor_type_name
			,a2.ar_treat_right_group_name
			,a2.c_name AS ar_treat_right_name
			,a3.c_name AS ar_cost_name
			,SUM(ISNULL(c.f_bill,0)) AS f_bill
			,b.i_status
		INTO #temp_data
		FROM dbo.ar_bill_hdr a
			INNER JOIN dbo.ar_bill_dtl b ON a.ar_bill_hdr_id = b.ar_bill_hdr_id
				AND b.i_enable = 1
			INNER JOIN dbo.ar_bill_item c ON b.ar_bill_dtl_id = c.ar_bill_dtl_id
				AND c.i_enable = 1

			LEFT JOIN dbo.ar_debtor_type a1 ON c.ar_debtor_type_id = a1.ar_debtor_type_id
			LEFT JOIN (
				SELECT
					aa.ar_treat_right_id
					,aa.c_name
					,bb.c_name AS ar_treat_right_group_name
				FROM dbo.ar_treat_right aa
					LEFT JOIN dbo.ar_treat_right_group bb ON aa.ar_treat_right_group_id = bb.ar_treat_right_group_id
			) a2 ON b.ar_treat_right_id = a2.ar_treat_right_id
			LEFT JOIN dbo.ar_cost a3 ON c.ar_cost_id = a3.ar_cost_id
		WHERE b.i_status IN (0, 1)
			AND 0 = (SELECT DISTINCT i_success_approve FROM dbo.ar_bill_log aa WHERE aa.d_action_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_start"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_end"]}'+' 23:59:59',102))
			{$con}
		GROUP BY
			a.ar_bill_hdr_id
			,a.c_code_bill
			,a.d_bill_date
			,a1.c_name
			,a2.ar_treat_right_group_name
			,a2.c_name
			,a3.c_name
			,b.i_status;
		
		SELECT * INTO #TemData FROM (
			SELECT 1 AS i_type,* FROM #temp_data
			UNION ALL
			SELECT
				2 AS i_type
				,a.ar_bill_hdr_id
				,NULL AS i_show
				,a.c_code_bill
				,NULL AS d_bill_date
				,NULL AS ar_debtor_type_name
				,NULL AS ar_treat_right_group_name
				,NULL AS ar_treat_right_name
				,NULL AS ar_cost_name
				,SUM(ISNULL(a.f_bill,0)) AS f_bill
				,a.i_status
			FROM #temp_data a
			GROUP BY a.ar_bill_hdr_id, a.c_code_bill, a.i_status
		) aa;
		
		SELECT * FROM #TemData ORDER BY i_status, c_code_bill, i_type, i_show;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		$numrow = 0;
		while ($row = $db->Fetch($stmt)) {

			if ($row["i_show"] == 1) {
				$ar_treat_right_group_name = $row["ar_treat_right_group_name"];
				if ($row["ar_treat_right_group_name"] == "") {
					$ar_treat_right_group_name = "- ยังไม่ระบุกลุ่มสิทธิ์ -";
				}
			} else if ($row["i_show"] > 1 && $row["ar_treat_right_group_name"] == "") {
				$ar_treat_right_group_name = "- ยังไม่ระบุกลุ่มสิทธิ์ -";
			} else {
				$ar_treat_right_group_name = "";
			}

			$temp = array(
				"no"								=> ++$numrow,
				"id"								=> ($row["i_type"] == 2 && $row["i_status"] != 1) ? $row["ar_bill_hdr_id"] : "",
				"ar_bill_hdr_id"			=> ($row["i_type"] == 2) ? $row["ar_bill_hdr_id"] : "",
				"preview_id"						=> $row["i_show"] == 1 ? $row["ar_bill_hdr_id"] : "",
				"i_type"							=> $row["i_type"],
				"c_code_bill"						=> ($row["i_show"] == 1) ? $row["c_code_bill"] : "",
				"d_bill_date"						=> ($row["i_show"] == 1) ? $date->extDateBuddha($row["d_bill_date"]) : "",
				"ar_debtor_type_name"				=> ($row["i_show"] == 1) ? $row["ar_debtor_type_name"] : "",
				"ar_cost_name"						=> ($row["i_show"] == 1) ? $row["ar_cost_name"] : "",
				"ar_treat_right_group_name"			=> $ar_treat_right_group_name,
				"ar_treat_right_name"				=> $row["ar_treat_right_name"],
				"f_bill"							=> $row["f_bill"],
				"i_status"							=> $row["i_status"],
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "sum_invoice") {

	$sqlMain = "
		SET NOCOUNT ON	
		SELECT
			ISNULL(SUM(ISNULL(c.f_bill,0)),0) AS f_bill
		FROM dbo.ar_bill_hdr a
			INNER JOIN dbo.ar_bill_dtl b ON a.ar_bill_hdr_id = b.ar_bill_hdr_id
				AND b.i_enable = 1 AND b.i_status IN (0,1)
			INNER JOIN dbo.ar_bill_item c ON b.ar_bill_dtl_id = c.ar_bill_dtl_id
				AND c.i_enable = 1
				AND c.lastdate BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';";
	$f_total = $db->GetDataBySQL($sqlMain, array());

	$sqlMain = "
		SET NOCOUNT ON	
		SELECT
			ISNULL(SUM(ISNULL(c.f_bill,0)),0) AS f_bill
		FROM dbo.ar_bill_hdr a
			INNER JOIN dbo.ar_bill_dtl b ON a.ar_bill_hdr_id = b.ar_bill_hdr_id
				AND b.i_enable = 1 AND b.i_status = 1
			INNER JOIN dbo.ar_bill_item c ON b.ar_bill_dtl_id = c.ar_bill_dtl_id
				AND c.i_enable = 1
				AND c.lastdate BETWEEN '{$_REQUEST["d_start"]} 00:00:00.000' AND '{$_REQUEST["d_end"]} 23:59:59.000';";

	$f_approve = $db->GetDataBySQL($sqlMain, array());

	echo json_encode(array("success" => true, "f_total" => $f_total, "f_approve" => $f_approve));
	exit;
}
