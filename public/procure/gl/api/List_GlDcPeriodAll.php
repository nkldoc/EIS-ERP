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

if($_REQUEST["type"] == "vw_gl_dc_period") {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];

	$i_system	= $_REQUEST["i_system"];
	$c_yyyy		= (@$_REQUEST["c_yyyy"] != "")? $_REQUEST["c_yyyy"] : date("Y");
	
	$limit 	= @$_REQUEST["limit"];
	$start 	= @$_REQUEST["start"];
	
	if (!$util->get($start)) { 	$start 	= 0; }
	if (!$util->get($limit)) { 	$limit 	= 12; }else{ $limit=($limit+$start); }
	
// 	switch($i_read) {
// 		case 1:		$con = " AND a.dc_user_create_id= ".$_SESSION["user_id"]; break;
// 		case 2:		$con = " AND a.dc_user_create_cost_id=".$_SESSION["dc_cost_id"]; break;
// 		default:	$con = "";
// 	}

	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY c_mm ASC) AS numrow 
						,gl_dc_period_id 
						,c_mm 
						,c_yyyy 
						,i_gen
						,i_status 
						,c_status 
						,i_system
						,i_last_period 
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost 
						,convert(VARCHAR,
							(	SELECT d_create 
							FROM vw_gl_dc_period 
							WHERE i_gen = 1 AND i_system = $i_system AND c_mm = a.c_mm AND c_yyyy = $c_yyyy), 120) as d_create 
						,convert(VARCHAR, d_create, 120) AS d_update
						,(	SELECT COUNT(*)
							FROM vw_gl_dc_period 
							WHERE i_status = 2 AND i_system = $i_system AND c_mm = a.c_mm AND c_yyyy = $c_yyyy) as count_row
					FROM vw_gl_dc_period a 
					WHERE i_system = $i_system AND c_yyyy = $c_yyyy AND i_last_period = 1";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["gl_dc_period_id"],
							"c_mm"						=> $row["c_mm"],
							"c_yyyy"					=> $row["c_yyyy"],
							"i_gen"						=> $row["i_gen"],
							"i_status"					=> $row["i_status"],
							"c_status"					=> $row["c_status"],
							"i_system"					=> $row["i_system"],
							"i_last_period"				=> $row["i_last_period"],
							"dc_user_create_id"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> $date->extDateBuddha($row["d_create"]),
							"d_update"					=> $date->extDateBuddha($row["d_update"]),
							"count_row"					=> $row["count_row"]
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
