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

if( $_REQUEST["type"] == "gl_tran_hdr" ) {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	$rowCounts			= 0;
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }

// 	switch($i_read) {
// 		case 1:		$con = " AND a.dc_user_create_id=".$_SESSION["user_id"]; break;
// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
// 		default:	$con = "";
// 	}
	
	if($mode == "SEARCH") {
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
		if($_REQUEST["d_save_date1"] != "" && $_REQUEST["d_save_date2"] != "") {
			$con	.= " AND a.d_save_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_save_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_save_date2"]}'+' 23:59:59',102)";
		}
		$con	.= ($_REQUEST["i_is_post"] > 0)? " AND a.i_is_post = ".$_REQUEST["i_is_post"] : " AND a.i_is_post IN (2,3)";
	}
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.d_doc_date DESC) AS numrow
					,a.gl_tran_hdr_id
					,a.c_ref_doc
					,CONVERT(VARCHAR, a.d_save_date, 120) AS d_save_date
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.c_code
					,a.c_code_post
					,a.c_comment1
					,a.f_total_amt
					,a.i_is_post
				FROM gl_tran_hdr a
				where a.i_enable = 1 AND a.i_is_close_year = 2
					{$con}
				ORDER BY a.i_is_post;";

	$stmt = $db->QueryParam($sqlMain, array());
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["gl_tran_hdr_id"], 
							"c_ref_doc"							=> ($row["c_ref_doc"] != "")? $row["c_ref_doc"] : "",
							"d_save_date"						=> ($row["d_save_date"] != "")? $date->extDateBuddha($row["d_save_date"]) : "",
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_code"							=> $row["c_code"],
							"c_code_post"						=> $row["c_code_post"],
							"c_comment1"						=> $row["c_comment1"],
							"f_total_amt"						=> $row["f_total_amt"],
							"i_is_post"							=> $row["i_is_post"]
			);
			
			$rowCounts++;
			
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts, $root=>${$root}));
	exit;
	
}
?>