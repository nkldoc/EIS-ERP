<?php
include("../conf/configPo.php");
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

if ($_REQUEST["type"] == "po_working_hdr") {

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

			if ($_REQUEST["filter"] == "c_code_ref") {
				$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
			} else if ($_REQUEST["filter"] == "c_approve") {
				$con	.= " AND b." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
			}
		}
		if ($_REQUEST["dc_expense_budget_type_id"] > 0) {
			$con .= " AND b.dc_expense_budget_type_id=" . $_REQUEST["dc_expense_budget_type_id"];
		}
	}

	$sqlMain = "
		SET NOCOUNT ON;
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.c_code_ref DESC) AS numrow
			,a.po_working_hdr_id
		INTO #TemData
		FROM dbo.po_working_hdr a
			INNER JOIN po_working_dtl b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN po_working_item c ON a.po_working_hdr_id = c.po_working_hdr_id AND c.i_status = 11
		WHERE a.i_enable = 1
			{$con};
		
		SELECT
			a.numrow
			,b.po_working_hdr_id
			,b.c_code_ref
			,c.c_approve
			,CONVERT(VARCHAR, c.d_approve_date, 120) AS d_approve_date
			,c.i_budget_year
			,c.i_budget_year_overlap
			,c.dc_cost_id
			,e.c_name AS cost_name
			,c.dc_expense_budget_type_id
			,f.c_name AS budget_name
			,c.bg_expense_id
			,g.c_code+' : '+g.c_name AS bg_expense_name
			,c.po_creditor_id
			,h.c_name AS creditor_name
			,c.po_creditor_transfer_id
			,c.c_qty
			,c.f_total
			,CONVERT(VARCHAR, c.d_audit_date, 120) AS d_audit_date
			,c.po_emp_id
			,CONVERT(VARCHAR, c.d_doc_date, 120) AS d_doc_date
			,c.dc_approve_id
			,CONVERT(VARCHAR, c.d_inv_date, 120) AS d_inv_date
			,c.c_booking
			,b.c_comment
			,b.i_enable
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
		FROM #TemData a
			INNER JOIN dbo.po_working_hdr b ON a.po_working_hdr_id = b.po_working_hdr_id
			INNER JOIN dbo.po_working_dtl c ON b.po_working_hdr_id = c.po_working_hdr_id
	
			LEFT JOIN dbo.dc_cost e ON c.dc_cost_id = e.dc_cost_id AND e.i_enable = 1 AND e.i_delete = 2
			LEFT JOIN dbo.dc_expense_budget_type f ON c.dc_expense_budget_type_id = f.dc_expense_budget_type_id AND f.i_enable = 1 AND f.i_delete = 2
			LEFT JOIN dbo.bg_expense g ON c.bg_expense_id = g.bg_expense_id AND g.i_enable = 1
			LEFT JOIN dbo.po_creditor h ON c.po_creditor_id = h.po_creditor_id AND h.i_enable = 1
		WHERE a.numrow > ? AND a.numrow <= ?
		ORDER BY a.numrow;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"												=> $row["numrow"],
				"id"												=> $row["po_working_hdr_id"],
				"c_code_ref"										=> ($row["c_code_ref"] != "") ? $row["c_code_ref"] : "",
				"c_approve"											=> ($row["c_approve"] != "") ? $row["c_approve"] : "",
				"d_approve_date"									=> ($row["d_approve_date"] != "") ? $date->extDateBuddha($row["d_approve_date"]) : "",
				"i_budget_year"										=> $row["i_budget_year"],
				"i_budget_year_overlap"								=> $row["i_budget_year_overlap"],
				"dc_cost_id"										=> ($row["dc_cost_id"] != "") ? $row["dc_cost_id"] : "",
				"cost_name"											=> $row["cost_name"],
				"dc_expense_budget_type_id"							=> ($row["dc_expense_budget_type_id"] != "") ? $row["dc_expense_budget_type_id"] : "",
				"budget_name"										=> $row["budget_name"],
				"bg_expense_id"										=> ($row["bg_expense_id"] != "") ? $row["bg_expense_id"] : "",
				"bg_expense_name"									=> $row["bg_expense_name"],
				"po_creditor_id"									=> ($row["po_creditor_id"] != "") ? $row["po_creditor_id"] : "",
				"creditor_name"										=> $row["creditor_name"],
				"po_creditor_transfer_id"							=> ($row["po_creditor_transfer_id"] != "") ? $row["po_creditor_transfer_id"] : "",
				"c_qty"												=> $row["c_qty"],
				"f_total"											=> $row["f_total"],
				"d_audit_date"										=> ($row["d_audit_date"] != "") ? $date->extDateBuddha($row["d_audit_date"]) : "",
				"po_emp_id"											=> $row["po_emp_id"],
				"d_doc_date"										=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"dc_approve_id"										=> $row["dc_approve_id"],
				"d_inv_date"										=> ($row["d_inv_date"] != "") ? $date->extDateBuddha($row["d_inv_date"]) : "",
				"c_booking"											=> $row["c_booking"],
				"c_comment"											=> $row["c_comment"],
				"i_enable"											=> $row["i_enable"],
				"show_enable"										=> ($row["i_enable"] == 1) ? "ใช้งาน" : "ยกเลิก",
				"dc_user_update_id"									=> $row["dc_user_update"],
				"dc_user_update_cost_id"							=> $row["dc_user_update_cost"],
				"d_update"											=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : ""
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "po_working_item") {

	$sqlMain = "
		SET NOCOUNT ON;
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.i_status) AS numrow
			,a.po_working_item_id
		INTO #TemData
		FROM dbo.po_working_item a
		WHERE a.po_working_hdr_id = {$_REQUEST["id"]};
		
		SELECT
			a.numrow
			,b.po_working_item_id
			,b.i_status
			,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
			,CONVERT(VARCHAR, b.d_receive_date, 120) AS d_receive_date
			,b.c_comment
			,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
		FROM #TemData a
			INNER JOIN dbo.po_working_item b ON a.po_working_item_id = b.po_working_item_id
		ORDER BY a.numrow;
		
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$stmt = $db->QueryParam($sqlMain, array());
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"												=> $row["numrow"],
				"id"												=> $row["po_working_item_id"],
				"i_status"											=> $row["i_status"],
				"c_status"											=> $CONF_I_STATUS[$row["i_status"]],
				"d_doc_date"										=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"c_comment"											=> ($row["c_comment"] != "") ? $row["c_comment"] : "",
				"d_receive_date"									=> ($row["d_receive_date"] != "") ? $date->extDateBuddha($row["d_receive_date"]) : "",
				"dc_user_update_id"									=> $row["dc_user_update"],
				"dc_user_update_cost_id"							=> $row["dc_user_update_cost"],
				"d_update"											=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : ""
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
