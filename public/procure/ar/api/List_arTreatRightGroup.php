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

if ($_REQUEST["type"] == "ar_treat_right_group") {

	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];

	if (!$util->get($start)) {
		$start 	= 0;
	}
	if (!$util->get($limit)) {
		$limit 	= 20;
	} else {
		$limit = ($limit + $start);
	}

	// 	switch($i_read) {
	// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
	// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
	// 		default:	$con = "";
	// 	} 

	if ($mode == "SEARCH") {

		if ($_REQUEST["value"] != "") {
			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		}
		// 		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
		// 			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		// 		}
		// 		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
		// 			$con .= " AND a.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		// 		}
		// 		if ($_REQUEST["i_post"] > 0) {
		// 			$con .= " AND a.i_post=" . $_REQUEST["i_post"];
		// 		}
		// 		if ($_REQUEST["i_enable"] > 0) {
		// 			$con .= " AND a.i_enable=" . $_REQUEST["i_enable"];
		// 		}
	}

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.c_name) AS numrow
			,a.ar_treat_right_group_id
		INTO #TemData
		FROM dbo.ar_treat_right_group a
		WHERE a.i_enable = 1 AND a.i_delete = 2
			{$con};
				
		SELECT
			a.numrow
			,b.ar_treat_right_group_id
			,CASE
				WHEN c.ar_treat_right_group_id IS NOT NULL THEN 1
				ELSE 0
			END AS i_use
			,b.c_name
			,'เรียกเก็บ<br>'
			+CASE
				WHEN b.dc_acc_dr_bill_id IS NOT NULL THEN 'Dr : '+a1.c_code+' '+a1.c_name+'<br>'
				ELSE ''
			END
			+CASE
				WHEN b.dc_acc_cr_bill_id IS NOT NULL THEN 'Cr : '+a2.c_code+' '+a2.c_name+'<br>'
				ELSE ''
			END AS dc_acc_name
			,ISNULL(b.c_comment,'') AS c_comment
			,b.i_enable
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
			,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
			,CONVERT(VARCHAR, b.d_update, 120) AS d_update
		FROM #TemData a
			INNER JOIN dbo.ar_treat_right_group b ON a.ar_treat_right_group_id = b.ar_treat_right_group_id
			LEFT JOIN dbo.ar_treat_right c ON a.ar_treat_right_group_id = c.ar_treat_right_group_id
		
			/* เรียกเก็บ */
			LEFT JOIN dbo.dc_acc a1 ON b.dc_acc_dr_bill_id = a1.dc_acc_id
			LEFT JOIN dbo.dc_acc a2 ON b.dc_acc_cr_bill_id = a2.dc_acc_id
		WHERE a.numrow > ? AND a.numrow <= ?
		ORDER BY a.numrow;
				
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["ar_treat_right_group_id"],
				"i_use"								=> $row["i_use"],
				"c_name"							=> $row["c_name"],
				"dc_acc_name"						=> $row["dc_acc_name"],
				"c_comment"							=> $row["c_comment"],
				"i_enable"							=> $row["i_enable"],
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
