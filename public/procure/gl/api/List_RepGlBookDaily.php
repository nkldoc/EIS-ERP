<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db 		= new DatabaseServer();
$date		= new i_date();

$root		= "data";
$data		= array();
$con		= null;

function List_QueryParam()
{

	global $db, $date, $root, $data, $con, $ARR_GL_CFG_TEXT, $arr_status;

	$totalCount		= 0;

	// GL_BOOK_TYPE
	if ($_REQUEST['gl_dc_book_type_id'] > 0) {
		$gl_book_type	= " AND a.gl_dc_book_type_id = " . $_REQUEST['gl_dc_book_type_id'];
	} else {
		$gl_book_type	= null;
	}

	// i_is_post
	if ($_REQUEST['i_is_post'] == '1') {
		$i_is_post		= " AND a.i_is_post IN (2,3)";
	} else {
		$i_is_post		= " AND a.i_is_post IN (" . $_REQUEST['i_is_post'] . ")";
	}
	 
	// dc_user_id  
	$dc_user_id_create = $in_user	= "";
	$dc_user_id	= explode(";", $_REQUEST["dc_user_id"]);  
	foreach( $dc_user_id as $val ) { $in_user	.= ( $in_user == "" )? $val : ", ".$val; }
	$dc_user_id_create	.= " AND a.dc_user_create_id IN (".$in_user.")";
		  
	// C_REF_DOC
	if ($_REQUEST['c_ref_doc']!="") {
		$text_c_ref_doc	= " AND a.c_ref_doc like '%" . $_REQUEST['c_ref_doc']."%'";
	} else {
		$text_c_ref_doc	= null;
	}
	
	$sqlMain = "
		SET NOCOUNT ON;
		DECLARE @d_save_date_start VARCHAR(100) = '{$_REQUEST["date_start"]}';
		DECLARE @d_save_date_end VARCHAR(100) = '{$_REQUEST["date_end"]}';

		/* DATA */
		SELECT
			a.gl_tran_hdr_id
			,a.c_ref_doc
			,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
			,CONVERT(VARCHAR, a.d_save_date, 120) AS d_save_date
			,a.c_code
			,CASE WHEN (a.i_is_post=3) THEN a.c_code_post ELSE NULL END c_code_post
			,b.i_rank
			,b.dc_acc_id
			,b.dc_product_id
			,b.dc_cost_acc_id
			,b.f_dr
			,b.f_cr
			,(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_create_id)) AS emp_name
			,(SELECT bb.c_name FROM dc_emp bb WHERE bb.dc_emp_id=(SELECT aa.dc_emp_id FROM dc_user aa WHERE aa.dc_user_id=a.dc_user_update_post_id)) AS post_name
			,CONCAT(a.c_comment1,a.c_comment2,a.c_comment3)  AS c_comment
		INTO #temp_data
		FROM gl_tran_hdr a
			INNER JOIN gl_tran_dtl b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
		WHERE a.d_save_date between CONVERT(DATETIME,@d_save_date_start,120) AND CONVERT(DATETIME,@d_save_date_end,120)
			AND a.i_is_close_year = 2
			AND a.i_enable = 1
			{$text_c_ref_doc}
			{$gl_book_type}
			{$i_is_post}
			{$dc_user_id_create}
		;

		SELECT
			ROW_NUMBER() OVER (ORDER BY d_doc_date, c_ref_doc, c_code) AS numrow
			,*
		INTO #TB1 
		FROM (
			SELECT
				DISTINCT
				gl_tran_hdr_id
				,c_ref_doc
				,CONVERT(VARCHAR, d_doc_date, 120) as d_doc_date
				,c_code
				,c_code_post
				,CONVERT(VARCHAR, d_save_date, 120) as d_save_date
			FROM #temp_data
		) a;

		/* HEAD */
		SELECT
			a.numrow
			,1 AS i_type
			,a.gl_tran_hdr_id
			,a.c_ref_doc
			,a.d_doc_date
			,a.d_save_date
			,a.c_code
			,a.c_code_post
			,NULL AS c_acc_code
			,NULL AS c_acc_name
			,NULL AS c_product_name
			,NULL AS c_cost_name
			,NULL AS f_dr
			,NULL AS f_cr
			,NULL AS i_rank
			,NULL AS emp_name
			,NULL AS post_name
			,NULL AS c_comment
		FROM #TB1 a
		UNION ALL
		/* DATA TYPE2 */
		SELECT
			a.numrow
			,2 AS i_type
			,a.gl_tran_hdr_id
			,a.c_ref_doc
			,a.d_doc_date
			,a.d_save_date
			,a.c_code
			,a.c_code_post
			,c.c_code AS c_acc_name
			,c.c_name AS c_acc_name
			,d.c_name AS c_product_name
			,e.c_name AS c_cost_name
			,b.f_dr
			,b.f_cr
			,b.i_rank
			,b.emp_name
			,b.post_name
			,NULL AS c_comment
		FROM #TB1 a
			INNER JOIN #temp_data b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
			LEFT JOIN dc_acc c ON b.dc_acc_id = c.dc_acc_id
			LEFT JOIN dc_product d ON b.dc_product_id = d.dc_product_id
			LEFT JOIN dc_cost e ON b.dc_cost_acc_id = e.dc_cost_id
		UNION ALL
		/* SUM TYPE3 */
		SELECT
			a.numrow
			,3 AS i_type
			,NULL AS gl_tran_hdr_id
			,NULL AS c_ref_doc
			,NULL AS d_doc_date
			,NULL AS d_save_date
			,NULL AS c_code
			,NULL AS c_code_post
			,NULL AS c_acc_code
			,NULL AS c_acc_name
			,NULL AS c_product_name
			,NULL AS c_cost_name
			,SUM(ISNULL(b.f_dr,0)) AS f_dr
			,SUM(ISNULL(b.f_cr,0)) AS f_cr
			,NULL AS i_rank
			,NULL AS emp_name
			,NULL AS post_name
			,b.c_comment AS c_comment
		FROM #TB1 a
			INNER JOIN #temp_data b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
			LEFT JOIN dc_acc c ON b.dc_acc_id = c.dc_acc_id
			LEFT JOIN dc_product d ON b.dc_product_id = d.dc_product_id
			LEFT JOIN dc_cost e ON b.dc_cost_acc_id = e.dc_cost_id
		GROUP BY a.numrow, b.c_comment
		UNION ALL
		/* SUM COMMENT */
		SELECT
			a.numrow
			,4 AS i_type
			,NULL AS gl_tran_hdr_id
			,NULL AS c_ref_doc
			,NULL AS d_doc_date
			,NULL AS d_save_date
			,NULL AS c_code
			,NULL AS c_code_post
			,NULL AS c_acc_code
			,NULL AS c_acc_name
			,NULL AS c_product_name
			,NULL AS c_cost_name
			,NULL AS f_dr
			,NULL AS f_cr
			,NULL AS i_rank
			,NULL AS emp_name
			,NULL AS post_name
			,b.c_comment AS c_comment
		FROM #TB1 a
			INNER JOIN #temp_data b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
			LEFT JOIN dc_acc c ON b.dc_acc_id = c.dc_acc_id
			LEFT JOIN dc_product d ON b.dc_product_id = d.dc_product_id
			LEFT JOIN dc_cost e ON b.dc_cost_acc_id = e.dc_cost_id
		GROUP BY a.numrow, b.c_comment
		UNION ALL
		/* SUM TOTAL */
		SELECT
			9999 AS numrow
			,5 AS i_type
			,NULL AS gl_tran_hdr_id
			,NULL AS c_ref_doc
			,NULL AS d_doc_date
			,NULL AS d_save_date
			,NULL AS c_code
			,NULL AS c_code_post
			,NULL AS c_acc_code
			,NULL AS c_acc_name
			,NULL AS c_product_name
			,NULL AS c_cost_name
			,SUM(ISNULL(b.f_dr,0)) AS f_dr
			,SUM(ISNULL(b.f_cr,0)) AS f_cr
			,NULL AS i_rank
			,NULL AS emp_name
			,NULL AS post_name
			,NULL AS c_comment
		FROM #TB1 a
			INNER JOIN #temp_data b ON a.gl_tran_hdr_id = b.gl_tran_hdr_id
			LEFT JOIN dc_acc c ON b.dc_acc_id = c.dc_acc_id
			LEFT JOIN dc_product d ON b.dc_product_id = d.dc_product_id
			LEFT JOIN dc_cost e ON b.dc_cost_acc_id = e.dc_cost_id
		ORDER BY numrow, i_type, i_rank;";

	 

	$stmt = $db->QueryParam($sqlMain, array());

	if ($stmt) {
		while ($row = $db->Fetch($stmt)) {
			$temp = array(
				"no"					=> $row["numrow"],
				"i_type"				=> $row["i_type"],
				"c_ref_doc"				=> $row["c_ref_doc"],
				"d_doc_date"			=> ($row["d_doc_date"] != "") ? $date->shot_date_from_db($row["d_doc_date"]) : "",
				"d_save_date"			=> ($row["d_save_date"] != "") ? $date->shot_date_from_db($row["d_save_date"]) : "",
				"c_code"				=> $row["c_code"],
				"c_code_post"			=> $row["c_code_post"],
				"i_rank"				=> $row["i_rank"],
				"c_acc_code"			=> $row["c_acc_code"],
				"c_acc_name"			=> $row["c_acc_name"],
				"c_product_name"		=> $row["c_product_name"],
				"c_cost_name"			=> $row["c_cost_name"],
				"f_dr"					=> $row["f_dr"],
				"f_cr"					=> $row["f_cr"],
				"emp_name"				=> $row["emp_name"],
				"post_name"				=> $row["post_name"],
				"c_comment"				=> $row["c_comment"],
			);

			${$root}[] = $temp;
		}
	}

	return json_encode(array("debug" => true, "totalCount" => $totalCount, $root => ${$root}));
}
