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

if($_REQUEST["type"] == "vw_gl_dc_group_admin_hdr") {
	
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
						ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
						,a.gl_dc_group_admin_hdr_id
						,a.c_code
						,a.c_name
						,a.c_comment
						,a.i_enable
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_create_id) AS dc_user_create
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_create_cost_id) AS dc_user_create_cost
						,convert(VARCHAR, a.d_create, 120) AS d_create
						,(SELECT bb.c_name FROM dc_user aa LEFT JOIN dc_emp bb ON aa.dc_emp_id = bb.dc_emp_id WHERE aa.dc_user_id = a.dc_user_update_id) AS dc_user_update
						,(SELECT c_name FROM dc_cost aa WHERE dc_cost_id = a.dc_user_update_cost_id) AS dc_user_update_cost
						,convert(VARCHAR, a.d_update, 120) AS d_update
					FROM vw_gl_dc_group_admin_hdr a
					WHERE 1 = 1 
					$con";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a WHERE a.numrow > ? AND a.numrow <= ? ORDER BY a.numrow";
	
	$arrParam[]	= $start;
	$arrParam[]	= $limit;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["gl_dc_group_admin_hdr_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
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
	
} else if($_REQUEST["type"] == "vw_dc_cost") {
	
	$id	= (@$_REQUEST["id"] > 0)? $_REQUEST["id"] : 0;
	
	$sqlTempTable = "SELECT
						ROW_NUMBER() OVER (ORDER BY a.c_code DESC) AS numrow
						,a.dc_cost_id
						,a.c_code
						,a.c_name
						,b.c_name as c_acc_name
						,CASE WHEN ISNULL(c.dc_cost_id , 0) > 0 THEN 1 ELSE 0 END i_chk
					FROM vw_dc_cost a
						INNER JOIN (SELECT dc_cost_id, c_name FROM vw_dc_cost) b ON a.dc_cost_acc_id = b.dc_cost_id
						LEFT JOIN (SELECT bb.dc_cost_id from gl_dc_group_admin_hdr aa 
							INNER JOIN gl_dc_group_admin_dtl bb ON aa.gl_dc_group_admin_hdr_id = bb.gl_dc_group_admin_hdr_id WHERE aa.gl_dc_group_admin_hdr_id = ".$id.") c ON a.dc_cost_id = c.dc_cost_id
					WHERE a.i_last = ?";

	$sqlMain = "SELECT * FROM ({$sqlTempTable}) a ORDER BY a.numrow";
	
	$arrParam[]	= I_LAST;
	
	$stmt = $db->QueryParam($sqlMain, $arrParam);
	if( $stmt ) {
		while($row =$db->Fetch($stmt)) {
			$temp = array(	"no"						=> $row["numrow"],
							"id"						=> $row["dc_cost_id"],
							"c_code"					=> $row["c_code"],
							"c_name"					=> $row["c_name"],
							"c_acc_name"				=> $row["c_acc_name"],
							"i_chk"						=> $row["i_chk"]
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
