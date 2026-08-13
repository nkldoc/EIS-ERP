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

if ($_REQUEST["type"] == "gl_tran_hdr") {

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
		
		if ($_REQUEST["d_doc_date1"] != "" && $_REQUEST["d_doc_date2"] != "") {
			$con	.= " AND a.d_save_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_doc_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_doc_date2"]}'+' 23:59:59',102)";
		}
	}

	$sqlMain = "
		SET NOCOUNT ON
        SELECT
            ROW_NUMBER() OVER (ORDER BY a.d_save_date DESC) AS numrow
            ,a.gl_tran_hdr_id
        INTO #TemData
        FROM dbo.gl_tran_hdr a
        WHERE a.i_is_post = 2 AND a.i_enable = 1 AND a.i_is_close_year = 2
            {$con};

        SELECT
            a.numrow 
			,a.gl_tran_hdr_id
			,b.c_ref_doc
			,CONVERT(VARCHAR, b.d_save_date, 120) AS d_save_date
			,CONVERT(VARCHAR, b.d_doc_date, 120) AS d_doc_date
			,b.c_code
			,b.c_code_post
			,b.c_comment1
			,b.f_total_amt 
            ,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = b.dc_user_update_id) AS dc_user_update
            ,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = b.dc_user_update_cost_id) AS dc_user_update_cost
			,CONVERT(VARCHAR, b.d_update, 120) AS d_update 
			,ISNULL(b.i_is_reversing,2) as i_is_reversing
			,ISNULL(b.i_parent,0) as i_parent
			,Case 
				when (b.i_is_reversing=1) then 1
				when (b.i_is_reversing=2) then case when (b.i_parent>0) then 2 else 3 end
				else 9
			End
			as i_type_reverse_show
			,Case 
				when (b.i_is_reversing=1) then 'โอนกลับ(ต้นฉบับ)'
				when (b.i_is_reversing=2) then case when (b.i_parent>0) then 'ถูกโอนกลับต้นงวด' else '-' end
				else NULL
			End
			as c_type_reverse	

        FROM #TemData a
			INNER JOIN dbo.gl_tran_hdr b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
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
				"id"								=> $row["gl_tran_hdr_id"],
				"c_ref_doc"							=> ($row["c_ref_doc"] != "") ? $row["c_ref_doc"] : "",
				"d_save_date"						=> ($row["d_save_date"] != "") ? $date->extDateBuddha($row["d_save_date"]) : "",
				"d_doc_date"						=> ($row["d_doc_date"] != "") ? $date->extDateBuddha($row["d_doc_date"]) : "",
				"c_code"							=> $row["c_code"],
				"c_code_post"						=> $row["c_code_post"],
				"c_comment1"						=> $row["c_comment1"],
				"f_total_amt"						=> $row["f_total_amt"],
				"dc_user_update_id"					=> $row["dc_user_update"],
				"dc_user_update_cost_id"			=> $row["dc_user_update_cost"],
				"d_update"							=> ($row["d_update"] != "") ? $date->extDateBuddha($row["d_update"]) : "",
				"i_is_reversing"					=> $row["i_is_reversing"],
				"i_parent"							=> $row["i_parent"], 
				"i_type_reverse_show"				=> $row["i_type_reverse_show"],
				"c_type_reverse"					=> $row["c_type_reverse"]
				
			);

			${$root}[] = $temp;
		}
	}

	$db->NextResult($stmt);
	$rowCounts = $db->Fetch($stmt);

	echo json_encode(array("debug" => true, "totalCount" => $rowCounts["rowCounts"], $root => ${$root}));
	exit;
}
