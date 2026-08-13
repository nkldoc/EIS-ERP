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

if($_REQUEST["type"] == "gl_dc_config") {
	
	$mode				= @$_REQUEST["mode"];
	$i_read				= @$_REQUEST["i_read"];
	
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
	}

	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY a.i_config ASC) AS numrow
						,a.gl_dc_config_id
						,a.c_name
						,a.i_config
						,a.i_method
						,a.dc_acc_id
						,a.dc_cost_acc_id
						,a.c_comment
						,a.i_enable
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
						,convert(VARCHAR, a.d_create, 120) AS d_create
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
						,convert(VARCHAR, a.d_update, 120) AS d_update
					FROM vw_gl_dc_config a
					WHERE 1 = 1 
					$con";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["gl_dc_config_id"],
							"c_name"					=> $row["c_name"],
							"i_config"					=> $row["i_config"],
							"i_method"					=> $row["i_method"],
							"dc_acc_id"					=> $row["dc_acc_id"],
							"dc_cost_acc_id"			=> $row["dc_cost_acc_id"],
							"c_comment"					=> $row["c_comment"],
							"i_enable"					=> $row["i_enable"],
							"dc_user_create_id"			=> "{$row["dc_user_create"]}",
							"dc_user_create_cost_id"	=> "{$row["dc_user_create_cost"]}",
							"d_create"					=> $date->extDateBuddha($row["d_create"]),
							"dc_user_update_id"			=> $row["dc_user_update"],
							"dc_user_update_cost_id"	=> $row["dc_user_update_cost"],
							"d_update"					=> $date->extDateBuddha($row["d_update"])
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
