<?php
include("../../conf/config.php");
include("../../lib/database/DatabaseServer.php");
include("../../lib/database/apiUtil.php");
include("../../lib/date/i_date.class.php");
include("../conf/configGl.php");

$db 	= new DatabaseServer();
$date 	= new i_date();
$util	= new apiUtil();

$root		= "data";
$data		= array();
$con		= null;

if($_REQUEST["type"] == "gl_tran_hdr") {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
	$s_save_date1		= @$_REQUEST["s_save_date1"];
	$s_save_date2		= @$_REQUEST["s_save_date2"];
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
	
	switch($i_read) {
		case 1:		$con = " AND a.dc_user_create_id= ".$_SESSION["user_id"]; break;
		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
		default:	$con = "";
	}
	
	if($mode == "SEARCH") {
		if($_REQUEST["value"] != "") { $con .= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' "; }
		
		if($s_save_date1 != "" && $s_save_date2 != "") { $con .= " AND a.d_save_date between '{$s_save_date1}' and '{$s_save_date2}' "; }
		
	}

	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY a.c_code ASC) AS numrow
						,a.gl_tran_hdr_id
						,a.gl_dc_book_type_id
						,a.c_yyyy_mm
						,a.c_code
						,a.c_ref_doc
						,convert(VARCHAR, a.d_save_date, 120) AS d_save_date
						,convert(VARCHAR, a.d_doc_date, 120) AS d_doc_date
						,a.i_enable
						,a.i_is_post
						,a.i_parent
						,(SELECT aa.c_name FROM vw_dc_user_show_name aa WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
						,convert(VARCHAR, a.d_create, 120) AS d_create
						,(SELECT aa.c_name FROM vw_dc_user_show_name aa WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
						,convert(VARCHAR, a.d_update, 120) AS d_update
						,a.i_is_reversing
						,a.i_is_close_year						
						,a.i_close_year_type
						,a.f_total_amt 
						,a.table_pk_id
						,a.table_name
						,a.table_detail 
						,a.c_code_post
						,a.c_mm
						,a.c_yyyy 
						,a.i_type
						,a.i_preview
						,LEFT(a.c_comment1,50) as c_comment1
						,a.c_comment2
						,a.c_comment3
			
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GX." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_M4." and a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_1_gx
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GX." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_M5." and a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_2_gx
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GX." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_PROFIT." and a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_3_gx
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GX." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_DIVIDENCE." and a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_4_gx
								
						,(SELECT COUNT(gl_tran_hdr_id) FROM gl_tran_hdr WHERE i_is_post=".BOOK_ACC_GL." AND i_close_year_type=".GL_CLOSE_YEAR_TYPE_M4." AND i_enable=".STATUS_ENABLE." AND c_yyyy_mm=a.c_yyyy_mm) AS row_1_gl  
						,(SELECT COUNT(gl_tran_hdr_id) FROM gl_tran_hdr WHERE i_is_post=".BOOK_ACC_GL." AND i_close_year_type=".GL_CLOSE_YEAR_TYPE_M5." AND i_enable=".STATUS_ENABLE." AND c_yyyy_mm=a.c_yyyy_mm) AS row_2_gl
						,(SELECT COUNT(gl_tran_hdr_id) FROM gl_tran_hdr WHERE i_is_post=".BOOK_ACC_GL." AND i_close_year_type=".GL_CLOSE_YEAR_TYPE_PROFIT." AND i_enable=".STATUS_ENABLE." AND c_yyyy_mm=a.c_yyyy_mm) AS row_3_gl
						,(SELECT COUNT(gl_tran_hdr_id) FROM gl_tran_hdr WHERE i_is_post=".BOOK_ACC_GL." AND i_close_year_type=".GL_CLOSE_YEAR_TYPE_DIVIDENCE." AND i_enable=".STATUS_ENABLE." AND c_yyyy_mm=a.c_yyyy_mm) AS row_4_gl
								
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GL." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_M4." AND a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_11_gl
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GL." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_M5." AND a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_22_gl
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GL." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_PROFIT." AND a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_33_gl					
						,CASE WHEN (a.i_is_post=".BOOK_ACC_GL." AND a.i_close_year_type=".GL_CLOSE_YEAR_TYPE_DIVIDENCE." AND a.i_enable=".STATUS_ENABLE.") THEN 1 ELSE 0 END AS row_44_gl
							
					FROM gl_tran_hdr a
					WHERE i_is_close_year = ".GL_CLOSE_YEAR_PERIOD."
						AND i_is_post IN (".BOOK_ACC_GX.",".BOOK_ACC_GL.")
					$con";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["gl_tran_hdr_id"],
							"gl_dc_book_type_id"		=> $row["gl_dc_book_type_id"],
							"c_yyyy_mm"					=> $row["c_yyyy_mm"],
							"c_code"					=> $row["c_code"],
							"c_ref_doc"					=> $row["c_ref_doc"],
							"d_save_date"				=> $date->extDateBuddha($row["d_save_date"]),
							"d_doc_date"				=> $date->extDateBuddha($row["d_doc_date"]),
							"i_enable"					=> $row["i_enable"],
							"i_is_post"					=> $row["i_is_post"],
							"i_parent"					=>$row["i_parent"],
							"dc_user_create_id"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> $date->extDateBuddha($row["d_create"]),
							"dc_user_update_id"			=> $row["dc_user_update"],
							"dc_user_update_cost_id"	=> $row["dc_user_update_cost"],
							"d_update"					=> $date->extDateBuddha($row["d_update"]),
							"i_is_reversing"			=>$row["i_is_reversing"],
							"i_is_close_year"			=>$row["i_is_close_year"],
							"i_close_year_type"				=>$row["i_close_year_type"],
							"f_total_amt"				=>$row["f_total_amt"],
							"table_pk_id"				=>$row["table_pk_id"],
							"table_name"				=>$row["table_name"],
							"table_detail"				=>$row["table_detail"],
							"c_code_post"				=>$row["c_code_post"],
							"c_mm"						=>$row["c_mm"],
							"c_yyyy"					=>$row["c_yyyy"],
							"i_type"					=>$row["i_type"],
							"i_preview"					=>$row["i_preview"],
							"c_comment1"				=>$row["c_comment1"],
							"c_comment2"				=>$row["c_comment2"],
							"c_comment3"				=>$row["c_comment3"],
							
							"row_1_gx"					=> $row["row_1_gx"],
							"row_2_gx"					=> $row["row_2_gx"],
							"row_3_gx"					=> $row["row_3_gx"],
							"row_4_gx"					=> $row["row_4_gx"],
							
							"row_1_gl"					=> $row["row_1_gl"],
							"row_2_gl"					=> $row["row_2_gl"],
							"row_3_gl"					=> $row["row_3_gl"],
							"row_4_gl"					=> $row["row_4_gl"],
							
							"row_11_gl"					=> $row["row_11_gl"],
							"row_22_gl"					=> $row["row_22_gl"],
							"row_33_gl"					=> $row["row_33_gl"],
							"row_44_gl"					=> $row["row_44_gl"]
							
			);
			${$root}[] = $temp;
		}
	}
	
	$sqlCount = "SELECT COUNT(*) AS totalCount FROM ({$sqlTempTable}) a";
	
	$totalCount = $db->GetDataBySQL($sqlCount, $arrParam);
	echo json_encode(array("debug"=>true, "totalCount"=>$totalCount, $root=>${$root}));
	exit;
}
?>
