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

if( $_REQUEST["type"] == "imp_request_vsn_hdr_dtl_none" ) {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	$rowCounts			= 0;
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 20; }else{ $limit=($limit+$start); }
 
	
	if($mode == "SEARCH") {
		if( $_REQUEST["value"] != "" ) {
			$con	.= " AND a.".$_REQUEST["filter"]." LIKE '%".$_REQUEST["value"]."%' ";
		}
		if($_REQUEST["d_save_date1"] != "" && $_REQUEST["d_save_date2"] != "") {
			$con	.= " AND a.d_doc_date BETWEEN CONVERT(DATETIME,'{$_REQUEST["d_save_date1"]}',102) AND CONVERT(DATETIME,'{$_REQUEST["d_save_date2"]}'+' 23:59:59',102)";
		}
	//	$con	.= ($_REQUEST["i_is_post"] > 0)? " AND a.i_is_post = ".$_REQUEST["i_is_post"] : " AND a.i_is_post IN (2,3)";
	}
	
	$sqlMain = "SET NOCOUNT ON
				SELECT
					ROW_NUMBER() OVER (ORDER BY a.c_code DESC,b.imp_request_vsn_dtl_id ASC) AS numrow
					,a.imp_request_vsn_hdr_id 
					,CONVERT(VARCHAR, a.d_doc_date, 120) AS d_doc_date
					,a.c_period_no
					,a.c_code  
					,b.imp_request_vsn_dtl_id
					,b.c_request
					,b.c_request_desc
					,b.c_creditor
					,b.c_comment as c_comment_dtl
					,b.f_inv
					,CONVERT(VARCHAR,b.d_doc, 120) AS d_doc_dtl
				FROM imp_request_vsn_hdr a INNER JOIN imp_request_vsn_dtl b ON a.imp_request_vsn_hdr_id=b.imp_request_vsn_hdr_id
				where a.i_enable = 1 AND a.i_type_request = 2 AND b.i_status = 2
					{$con}
				ORDER BY a.c_code DESC,b.imp_request_vsn_dtl_id ASC;";
 
	$stmt = $db->QueryParam($sqlMain, array());
	if( sqlsrv_has_rows( $stmt ) ) {
		while( $row = $db->Fetch( $stmt ) ) {
			$temp = array(	"no"								=> $row["numrow"],
							"id"								=> $row["imp_request_vsn_dtl_id"], 
							"d_doc_date"						=> ($row["d_doc_date"] != "")? $date->extDateBuddha($row["d_doc_date"]) : "",
							"c_period_no"						=> ($row["c_period_no"] != "")? $row["c_period_no"] : "",
							"c_code"							=> $row["c_code"],
							"c_request"							=> $row["c_request"],
							"c_request_desc"					=> $row["c_request_desc"],
							"c_creditor"						=> $row["c_creditor"],
							"c_comment_dtl"						=> $row["c_comment_dtl"],
							"f_inv"								=> $row["f_inv"],
							"d_doc_dtl"							=> ($row["d_doc_dtl"] != "")? $date->extDateBuddha($row["d_doc_dtl"]) : ""
 						);
			
			$rowCounts++;
			
			${$root}[] = $temp;
		}
	}
	
	echo json_encode(array("debug"=>true, "totalCount"=>$rowCounts, $root=>${$root}));
	exit;
	
}
?>