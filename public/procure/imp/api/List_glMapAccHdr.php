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

if ($_REQUEST["type"] == "gl_map_acc_hdr") {

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
 

	if ($mode == "SEARCH") {

		// 		if ($_REQUEST["value"] != "") {
		// 			$con	.= " AND a." . $_REQUEST["filter"] . " LIKE '%" . $_REQUEST["value"] . "%' ";
		// 		}
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
            ROW_NUMBER() OVER (ORDER BY a.gl_map_acc_hdr_id ASC) AS numrow
            ,a.gl_map_acc_hdr_id
        INTO #TemData
        FROM dbo.gl_map_acc_hdr a
        WHERE a.i_enable = 1
            {$con};

        SELECT
            a.numrow
			,b.gl_map_acc_hdr_id 
			,b.c_name
			,b.dc_acc_id
			,ISNULL(b.c_comment,'') AS c_comment
			,b.i_enable
			,b.i_delete 
			,case when (b.i_enable='1') then 'ใช้งาน' else 'ยกเลิก' end as show_enable
			,(select cc.c_code+' '+cc.c_name from dc_acc cc where cc.dc_acc_id=b.dc_acc_id ) as c_acc_full
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_create_id) AS dc_user_create
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_create_cost_id) AS dc_user_create_cost
			,CONVERT(VARCHAR, b.d_create, 120) AS d_create 
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
			,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
			INNER JOIN dbo.gl_map_acc_hdr b ON a.gl_map_acc_hdr_id = b.gl_map_acc_hdr_id
         WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["gl_map_acc_hdr_id"],
				"c_name"							=> $row["c_name"],
				"dc_acc_id"							=> $row["dc_acc_id"],
				"c_comment"							=> $row["c_comment"],
				"i_enable"							=> $row["i_enable"],
				"i_delete"							=> $row["i_delete"],
				"show_enable"						=> $row["show_enable"],
				
				"c_acc_full"						=> $row["c_acc_full"], 
				"dc_user_create_id"					=> $row["dc_user_create"],
				"dc_user_create_cost_id"			=> $row["dc_user_create_cost"],
				"d_create"							=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
 				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : ""
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
} else if ($_REQUEST["type"] == "gl_map_acc_dtl") {

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.c_code_map) AS numrow
			,a.gl_map_acc_dtl_id
			,a.gl_map_acc_hdr_id
			,a.c_code_map
			,a.c_name_map
			,a.c_comment
			,a.i_system
			,a.c_system 
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
			,CONVERT(VARCHAR, a.d_create, 120) AS d_create 
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
			,CONVERT(VARCHAR, a.d_update, 120) AS d_update			
		INTO #TemData
		FROM dbo.gl_map_acc_dtl a
 		WHERE a.gl_map_acc_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $_REQUEST["hdr_id"];

	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["gl_map_acc_dtl_id"],
				"gl_map_acc_hdr_id"					=> $row["gl_map_acc_hdr_id"],
				"c_code_map"						=> $row["c_code_map"],
				"c_name_map"						=> $row["c_name_map"],
				"c_comment"							=> $row["c_comment"],
				"i_system"							=> $row["i_system"],
				"c_system"							=> $row["c_system"],
				"dc_user_create_id"					=> $row["dc_user_create"],
				"dc_user_create_cost_id"			=> $row["dc_user_create_cost"],
				"d_create"							=> ($row["d_create"] != "") ? $date->extDateBuddha($row["d_create"]) : "",
 				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : ""
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
