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

if ($_REQUEST["type"] == "sp_holiday_hdr") {

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
            ROW_NUMBER() OVER (ORDER BY a.i_year DESC) AS numrow
            ,a.sp_holiday_hdr_id
        INTO #TemData
        FROM dbo.sp_holiday_hdr a
        WHERE 1 = 1
            {$con};

        SELECT
            a.numrow
			,b.sp_holiday_hdr_id
			,b.i_year
			,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
            ,ISNULL(b.c_comment,'') AS c_comment
            ,b.i_enable
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
            ,CONVERT(VARCHAR, b.d_update, 120) AS d_update
        FROM #TemData a
            INNER JOIN dbo.sp_holiday_hdr b ON a.sp_holiday_hdr_id = b.sp_holiday_hdr_id
        WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow;

        SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	// /******echo sql******/
	// $sql = (@$sqlMain) ? $sqlMain : $sql;
	// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
	
	// $sql = str_replace('?', '#-#', $sql);
	// foreach ($arr as $fld => $value) {
	// 	$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
	// }
	// echo $sql; exit;
	// /********************/
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"								=> $row["numrow"],
				"id"								=> $row["sp_holiday_hdr_id"],
				"i_year"							=> $row["i_year"],
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
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
} else if ($_REQUEST["type"] == "sp_holiday_dtl") {

	$sqlMain = "
		SET NOCOUNT ON
		SELECT
			ROW_NUMBER() OVER (ORDER BY a.d_holiday) AS numrow
			,a.sp_holiday_dtl_id
			,a.sp_holiday_hdr_id
			,a.c_name
			,CONVERT(VARCHAR, a.d_holiday, 120) AS d_holiday
			,a.i_type
			,a.c_comment
		INTO #TemData
		FROM dbo.sp_holiday_dtl a
		WHERE a.sp_holiday_hdr_id = ?;

		SELECT * FROM #TemData a ORDER BY a.numrow;
		SELECT COUNT(*) AS rowCounts FROM #TemData;";

	$arrParam[]	= $_REQUEST["hdr_id"];
	// /******echo sql******/
	// $sql = (@$sqlMain) ? $sqlMain : $sql;
	// $arr = (@$arrParam) ? $arrParam : ((@$arrValue) ? $arrValue : array());
	
	// $sql = str_replace('?', '#-#', $sql);
	// foreach ($arr as $fld => $value) {
	// 	$sql = preg_replace('/#-#/', "'" . $value . "'", $sql, 1);
	// }
	// echo $sql; exit;
	// /********************/
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if (sqlsrv_has_rows($stmt)) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"										=> $row["numrow"],
				"id"										=> $row["sp_holiday_dtl_id"],
				"sp_holiday_hdr_id"							=> $row["sp_holiday_hdr_id"],
				"c_name"									=> $row["c_name"],
				"d_holiday"									=> ($row["d_holiday"] != "") ? $date->extDateBuddha($row["d_holiday"]) : "",
				"i_type"									=> $row["i_type"],
				"c_comment"									=> $row["c_comment"]
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
